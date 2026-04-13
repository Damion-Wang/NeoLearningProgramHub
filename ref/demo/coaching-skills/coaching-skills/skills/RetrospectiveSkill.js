/**
 * RetrospectiveSkill — structured retrospective guidance extracted from RetrospectiveAgent.
 *
 * Actions:
 *   - conductRetrospective: structured reflection on a completed management action
 *   - generateFollowUp:     follow-up action recommendations based on retrospective results
 *
 * Default action: conductRetrospective
 *
 * Fallback: rule-based structured prompts without LLM
 */

import { SkillBase } from './SkillBase';
import { assessRetrospectiveDepth } from '../modules/competencyDynamicsEngine';

export class RetrospectiveSkill extends SkillBase {
  get name() {
    return 'retrospective';
  }

  /**
   * @param {import('./SkillBase').SkillInput} input
   * @returns {Promise<import('./SkillBase').SkillOutput>}
   */
  async execute(input) {
    const { metadata: inputMeta = {} } = input;
    const action = inputMeta.action || 'conductRetrospective';

    switch (action) {
      case 'conductRetrospective':
        return this._conductRetrospective(inputMeta, input.userProfile);
      case 'generateFollowUp':
        return this._generateFollowUp(inputMeta, input.userProfile);
      default:
        return this._conductRetrospective(inputMeta, input.userProfile);
    }
  }

  // ==================== conductRetrospective ====================

  async _conductRetrospective(meta, userProfile) {
    const {
      retrospectiveText = '',
      inputType = 'text',
      originalTodo = null,
      activeScenario = null,
    } = meta;

    if (!retrospectiveText || retrospectiveText.length < 10) {
      return {
        sideEffects: [],
        metadata: {
          summary: { strengths: [], improvements: [], surprises: [] },
          goalAchievement: '输入内容不足，无法进行有效复盘。',
          keyBehaviors: [],
          experienceInsights: [],
          overallAssessment: '请提供更多关于实际行动的描述。',
          reason: 'text_too_short',
        },
      };
    }

    if (!this.isLLMAvailable) {
      return {
        sideEffects: [],
        metadata: {
          ...this._buildRuleBasedRetrospective(retrospectiveText, originalTodo),
          _fallback: true,
        },
      };
    }

    const systemPrompt = this._buildRetrospectivePrompt(
      retrospectiveText,
      inputType,
      originalTodo,
      userProfile,
      activeScenario
    );
    const parsed = await this.callLLMForJSON(systemPrompt, [], { maxTokens: 500 });

    if (!parsed) {
      return {
        sideEffects: [],
        metadata: {
          ...this._buildRuleBasedRetrospective(retrospectiveText, originalTodo),
          _fallback: true,
        },
      };
    }

    const depthAssessment = assessRetrospectiveDepth(retrospectiveText, parsed);
    const hasCognitiveTransfer = this._detectCognitiveTransfer(retrospectiveText, parsed);

    return {
      sideEffects: [],
      metadata: {
        summary: {
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
          improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 5) : [],
          surprises: Array.isArray(parsed.surprises) ? parsed.surprises.slice(0, 3) : [],
        },
        goalAchievement: parsed.goalAchievement || '',
        keyBehaviors: Array.isArray(parsed.keyBehaviors) ? parsed.keyBehaviors.slice(0, 5) : [],
        experienceInsights: Array.isArray(parsed.experienceInsights)
          ? parsed.experienceInsights.slice(0, 3)
          : [],
        overallAssessment: parsed.overallAssessment || '复盘完成。',
        depthLevel: depthAssessment.level,
        depthLabel: depthAssessment.label,
        bloomLevel: depthAssessment.bloomLevel,
        hasCognitiveTransfer,
        relatedCapabilities: originalTodo?.relatedCapabilities || [],
        inputType,
      },
    };
  }

  _buildRuleBasedRetrospective(text, originalTodo) {
    const strengths = [];
    const improvements = [];

    if (/顺利|成功|达成|完成|有效/u.test(text)) {
      strengths.push('行动目标基本达成');
    }
    if (/沟通|交流|对话|讨论/u.test(text)) {
      strengths.push('进行了有效的管理沟通');
    }
    if (/计划|准备|提前/u.test(text)) {
      strengths.push('做了充分的准备工作');
    }

    if (/困难|挑战|问题|不足/u.test(text)) {
      improvements.push('遇到了一些挑战，需要更好的应对策略');
    }
    if (/下次|以后|改进|优化/u.test(text)) {
      improvements.push('有明确的改进意识');
    }

    if (strengths.length === 0) {
      strengths.push('完成了管理行动的执行');
    }
    if (improvements.length === 0) {
      improvements.push('建议记录更多行动细节以便深入复盘');
    }

    return {
      summary: { strengths, improvements, surprises: [] },
      goalAchievement: originalTodo
        ? `针对「${originalTodo.title}」的行动已执行，需要进一步评估达成效果。`
        : '行动已执行，建议对照目标评估达成度。',
      keyBehaviors: [],
      experienceInsights: [],
      overallAssessment: '复盘已完成。建议持续记录管理行动的过程和结果，以便积累更多行为证据。',
    };
  }

  _buildRetrospectivePrompt(text, inputType, originalTodo, userProfile, activeScenario) {
    const parts = [
      '你是一位复盘教练。用户完成了一项物理世界的管理行动，现在进行复盘。',
      '请基于用户的描述，进行结构化分析。',
      '',
      `【用户岗位】${userProfile?.roleLabel || '管理者'}`,
      `【输入方式】${inputType === 'voice' ? '语音转写' : inputType === 'file' ? '文件内容' : '文本输入'}`,
    ];

    if (originalTodo) {
      parts.push(
        '',
        '【原始行动计划】',
        `标题：${originalTodo.title}`,
        `描述：${originalTodo.description || '无'}`,
        `关联能力：${(originalTodo.relatedCapabilities || []).join('、') || '无'}`,
        `关联工具：${(originalTodo.relatedTools || []).join('、') || '无'}`
      );
    }

    if (activeScenario) {
      parts.push(`【训练场景】${activeScenario.title}`);
    }

    parts.push(
      '',
      '【用户复盘内容】',
      text.slice(0, 1500),
      '',
      '请从以下维度进行结构化复盘，输出JSON：',
      '{',
      '  "goalAchievement": "目标达成度分析（实际vs计划，1-2句话）",',
      '  "strengths": ["做得好的方面1", "做得好的方面2"],',
      '  "improvements": ["需改进的方面1", "需改进的方面2"],',
      '  "surprises": ["意外发现或洞察"],',
      '  "keyBehaviors": ["关键管理行为描述1", "关键管理行为描述2"],',
      '  "experienceInsights": ["可沉淀的经验洞察"],',
      '  "overallAssessment": "总体评估（2-3句话，包含肯定和建议）"',
      '}',
      '',
      '要求：',
      '1. 基于用户描述的具体事实进行分析，不要臆测',
      '2. strengths 要具体到行为，不要泛泛而谈',
      '3. improvements 要给出具体改进方向',
      '4. experienceInsights 提取可复用的管理经验',
      '5. 语气专业、建设性、鼓励性',
      '',
      '仅输出JSON，不要有其他文字。'
    );

    return parts.join('\n');
  }

  _detectCognitiveTransfer(text, parsed) {
    const transferSignals = [
      /可以(用在|应用到|推广到|迁移到)/,
      /其他(场景|情境|场合|团队).*也/,
      /(通用的|普遍的)(原则|规律|方法)/,
      /举一反三|触类旁通|融会贯通/,
      /不仅.*而且|不只是.*还/,
      /类似(的|地).*也可以/,
    ];

    if (transferSignals.some((r) => r.test(text))) return true;

    const insightText = [
      ...(parsed?.surprises || []),
      ...(parsed?.experienceInsights || []),
    ].join(' ');

    if (/迁移|推广|通用|其他场景/.test(insightText)) return true;

    return false;
  }

  // ==================== generateFollowUp ====================

  async _generateFollowUp(meta, userProfile) {
    const { retrospectiveResult, originalTodo = null } = meta;

    if (!this.isLLMAvailable) {
      return {
        sideEffects: [],
        metadata: {
          nextSteps: [
            '复盘中发现的改进点，制定新的行动计划',
            '针对薄弱能力进行场景训练',
            '定期回顾复盘记录追踪改进',
          ],
          suggestedScenarios: [],
          adjustedCapabilities: [],
          _fallback: true,
        },
      };
    }

    const systemPrompt = this._buildFollowUpPrompt(retrospectiveResult, originalTodo, userProfile);
    const parsed = await this.callLLMForJSON(systemPrompt, [], { maxTokens: 300 });

    if (!parsed) {
      return {
        sideEffects: [],
        metadata: {
          nextSteps: ['基于复盘发现制定新的行动计划', '选择相关场景进行针对性训练'],
          suggestedScenarios: [],
          adjustedCapabilities: [],
          _fallback: true,
        },
      };
    }

    return {
      sideEffects: [],
      metadata: {
        nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps.slice(0, 5) : [],
        suggestedScenarios: Array.isArray(parsed.suggestedScenarios)
          ? parsed.suggestedScenarios.slice(0, 3)
          : [],
        adjustedCapabilities: Array.isArray(parsed.adjustedCapabilities)
          ? parsed.adjustedCapabilities.slice(0, 3)
          : [],
      },
    };
  }

  _buildFollowUpPrompt(retrospectiveResult, originalTodo, userProfile) {
    const parts = [
      '你是管理能力发展顾问。根据以下复盘结果，生成后续行动建议。',
      '',
      `【用户岗位】${userProfile?.roleLabel || '管理者'}`,
    ];

    if (originalTodo) {
      parts.push(`【原始行动】${originalTodo.title}: ${originalTodo.description || ''}`);
      if (originalTodo.relatedCapabilities?.length) {
        parts.push(`【关联能力】${originalTodo.relatedCapabilities.join('、')}`);
      }
    }

    if (retrospectiveResult) {
      parts.push(
        '',
        '【复盘结果】',
        `总体评估：${retrospectiveResult.overallAssessment || ''}`,
        `做得好的：${(retrospectiveResult.summary?.strengths || []).join('、')}`,
        `需改进的：${(retrospectiveResult.summary?.improvements || []).join('、')}`
      );
    }

    parts.push(
      '',
      '请输出JSON：',
      '{',
      '  "nextSteps": ["具体行动建议1", "具体行动建议2", "具体行动建议3"],',
      '  "suggestedScenarios": ["推荐场景训练类型"],',
      '  "adjustedCapabilities": ["需重点关注的能力ID"]',
      '}',
      '',
      '能力ID可选：roleTransition, planningExecution, motivation, coaching, communication,',
      'collaboration, performanceManagement, customerManagement, businessCoaching,',
      'dataAnalysis, techDecision, projectManagement, knowledgeManagement, qualityAssurance',
      '',
      '仅输出JSON，不要有其他文字。'
    );

    return parts.join('\n');
  }
}
