/**
 * ProfilingSkill — user profile generation extracted from UserProfileBuilder.
 *
 * Actions:
 *   - buildProfile: LLM-enriched user profile from BEI answers
 *                   Fallback: structured profile from assessment data without LLM
 *
 * Default action: buildProfile
 */

import { SkillBase } from './SkillBase';

const ROLE_LABELS = {
  sales: '销售管理',
  rd: '研发管理',
  ops: '运营管理',
  hr: '人力资源管理',
  finance: '财务管理',
  supply: '供应链管理',
};

export class ProfilingSkill extends SkillBase {
  get name() {
    return 'profiling';
  }

  /**
   * @param {import('./SkillBase').SkillInput} input
   * @returns {Promise<import('./SkillBase').SkillOutput>}
   */
  async execute(input) {
    const { metadata: inputMeta = {} } = input;
    const action = inputMeta.action || 'buildProfile';

    switch (action) {
      case 'buildProfile':
        return this._buildProfile(inputMeta);
      default:
        return this._buildProfile(inputMeta);
    }
  }

  // ==================== buildProfile ====================

  async _buildProfile(meta) {
    const { beiAnswers = {}, interviewDiagnostics = {}, userRole = 'general' } = meta;
    const fallback = this._fallbackProfile(beiAnswers, userRole);

    if (!this.isLLMAvailable) {
      return {
        sideEffects: [],
        metadata: { profile: fallback, _fallback: true },
      };
    }

    const systemPrompt = this._buildProfilePrompt(beiAnswers, interviewDiagnostics, userRole);
    const parsed = await this.callLLMForJSON(systemPrompt, [], { maxTokens: 600 });

    if (!parsed) {
      return {
        sideEffects: [],
        metadata: { profile: fallback, _fallback: true },
      };
    }

    const profile = {
      role: parsed.role || userRole,
      roleLabel: parsed.roleLabel || ROLE_LABELS[userRole] || userRole || '管理者',
      inferredReason: parsed.inferredReason || '',
      currentState: parsed.currentState || '',
      currentChallenges: Array.isArray(parsed.currentChallenges)
        ? parsed.currentChallenges.slice(0, 5)
        : fallback.currentChallenges,
      desiredOutcomes: Array.isArray(parsed.desiredOutcomes)
        ? parsed.desiredOutcomes.slice(0, 5)
        : fallback.desiredOutcomes,
      focusCapabilities: Array.isArray(parsed.focusCapabilities)
        ? parsed.focusCapabilities.slice(0, 5)
        : fallback.focusCapabilities,
      keyTasks: Array.isArray(parsed.keyTasks)
        ? parsed.keyTasks.slice(0, 5)
        : fallback.keyTasks,
      successFactors: Array.isArray(parsed.successFactors)
        ? parsed.successFactors.slice(0, 5)
        : fallback.successFactors,
      growthFocus: Array.isArray(parsed.growthFocus)
        ? parsed.growthFocus.slice(0, 5)
        : fallback.growthFocus,
      scenarioMaterials:
        parsed.scenarioMaterials && typeof parsed.scenarioMaterials === 'object'
          ? {
              bestPractices: Array.isArray(parsed.scenarioMaterials.bestPractices)
                ? parsed.scenarioMaterials.bestPractices.slice(0, 5)
                : [],
              insufficiencies: Array.isArray(parsed.scenarioMaterials.insufficiencies)
                ? parsed.scenarioMaterials.insufficiencies.slice(0, 5)
                : [],
              trainingTargets: Array.isArray(parsed.scenarioMaterials.trainingTargets)
                ? parsed.scenarioMaterials.trainingTargets.slice(0, 5)
                : [],
            }
          : fallback.scenarioMaterials,
    };

    return {
      sideEffects: [],
      metadata: { profile },
    };
  }

  _fallbackProfile(beiAnswers, userRole) {
    const splitItems = (text) =>
      String(text || '')
        .split(/\n|；|;|，|,/g)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5);

    return {
      role: userRole,
      roleLabel: ROLE_LABELS[userRole] || userRole || '管理者',
      inferredReason: '基于用户选择',
      currentState: '',
      currentChallenges: ['管理经验积累中'],
      desiredOutcomes: ['提升管理能力'],
      focusCapabilities: [{ id: 'planningExecution', name: '任务管理' }],
      keyTasks: splitItems(beiAnswers.keyTasks).slice(0, 3) || ['日常管理'],
      successFactors: splitItems(beiAnswers.successFactors).slice(0, 3) || ['持续学习'],
      growthFocus: splitItems(beiAnswers.growthFocus).slice(0, 3) || ['综合管理能力'],
      scenarioMaterials: {
        bestPractices: [],
        insufficiencies: [],
        trainingTargets: ['通过场景训练积累管理经验'],
      },
    };
  }

  _buildProfilePrompt(beiAnswers, interviewDiagnostics, userRole) {
    const parts = [
      '你是一位资深管理人才发展顾问。根据以下 BEI（行为事件访谈）回答，生成结构化用户画像。',
      '',
      '【BEI 回答】',
      `岗位信息：${beiAnswers.position || '未提供'}`,
      `关键任务：${beiAnswers.keyTasks || '未提供'}`,
      `关键事件（STAR）：${beiAnswers.criticalEvent || '未提供'}`,
      `成功要素：${beiAnswers.successFactors || '未提供'}`,
      `成长焦点：${beiAnswers.growthFocus || '未提供'}`,
    ];

    const allGaps = [];
    Object.entries(interviewDiagnostics).forEach(([qId, diag]) => {
      if (diag.gaps && diag.gaps.length > 0) {
        allGaps.push(`${qId}: ${diag.gaps.join('、')}`);
      }
    });
    if (allGaps.length > 0) {
      parts.push('', '【诊断缺口】', ...allGaps);
    }

    parts.push(
      '',
      `【用户初始角色】${userRole}`,
      '',
      '【输出要求】',
      '请输出JSON格式的用户画像：',
      '{',
      '  "role": "角色标识（如 sales/rd/ops/hr/finance/supply/general 等）",',
      '  "roleLabel": "岗位中文标签（如 销售管理/研发管理/运营管理/综合管理）",',
      '  "inferredReason": "角色推断依据",',
      '  "currentState": "当前状态（1-2句话）",',
      '  "currentChallenges": ["挑战1","挑战2","挑战3"],',
      '  "desiredOutcomes": ["期望成果1","期望成果2"],',
      '  "focusCapabilities": [{"id":"capability-id","name":"能力名称"}],',
      '  "keyTasks": ["任务1","任务2","任务3"],',
      '  "successFactors": ["要素1","要素2"],',
      '  "growthFocus": ["焦点1","焦点2"],',
      '  "scenarioMaterials": {',
      '    "bestPractices": ["最佳实践1"],',
      '    "insufficiencies": ["不足1"],',
      '    "trainingTargets": ["训练目标1"]',
      '  }',
      '}',
      '',
      'focusCapabilities.id 必须从以下选项中选择：',
      'roleTransition, planningExecution, motivation, coaching, communication, collaboration,',
      'performanceManagement, customerManagement, businessCoaching, dataAnalysis,',
      'techDecision, projectManagement, knowledgeManagement, qualityAssurance',
      '',
      '仅输出JSON，不要有其他文字。'
    );

    return parts.join('\n');
  }
}
