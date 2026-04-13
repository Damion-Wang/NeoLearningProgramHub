/**
 * PlanningSkill — planning and action detection extracted from PlanningAgent + ActionPlanAgent.
 *
 * Actions:
 *   - generateLearningPath: LLM-enhanced personalized learning path (from PlanningAgent)
 *   - assessComplexity:     rule-based task complexity analysis (from PlanningAgent)
 *   - detectTodo:           LIVE feature — action item detection from conversation (from ActionPlanAgent)
 *
 * Default action: detectTodo
 *
 * IMPORTANT: detectTodo preserves exact behavior from ActionPlanAgent._detectTodo
 */

import { SkillBase } from './SkillBase';
import { DEMO_TASKS, calculateTaskProbability } from '../data/tasks';

// ==================== TaskComplexity ====================

export const TaskComplexity = {
  SIMPLE: 'simple',
  MODERATE: 'moderate',
  COMPLEX: 'complex',
};

// ==================== TodoStatus ====================

export const TodoStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
};

// ==================== Complexity indicators ====================

const COMPLEXITY_INDICATORS = {
  multiPhase: ['阶段', '步骤', '逐步', '分步', '先...再', '首先...然后', '规划', '计划表', '路线图'],
  multiStakeholder: ['团队', '多个', '跨部门', '上级', '下属', '同事', '客户', '合作'],
  longTerm: {
    long: ['季度', '半年', '年度', '长期', '持续', '体系', '系统'],
    medium: ['月', '周', '几周'],
  },
  systemChange: ['体系', '系统', '机制', '流程', '制度', '文化', '变革', '转型', '重构'],
  uncertainty: ['不知道', '不确定', '如何', '怎么', '不清楚', '困难', '挑战'],
};

// ==================== PlanningSkill ====================

export class PlanningSkill extends SkillBase {
  get name() {
    return 'planning';
  }

  /**
   * @param {import('./SkillBase').SkillInput} input
   * @returns {Promise<import('./SkillBase').SkillOutput>}
   */
  async execute(input) {
    const { metadata: inputMeta = {} } = input;
    const action = inputMeta.action || 'detectTodo';

    switch (action) {
      case 'generateLearningPath':
        return this._generateLearningPath(inputMeta, input.userProfile);
      case 'assessComplexity':
        return this._assessComplexity(inputMeta);
      case 'getTaskProbability':
        return this._getTaskProbability(inputMeta);
      case 'detectTodo':
        return this._detectTodo(inputMeta, input.userProfile);
      default:
        return this._detectTodo(inputMeta, input.userProfile);
    }
  }

  // ==================== generateLearningPath ====================

  async _generateLearningPath(meta, userProfile) {
    const { assessmentResults, trainingHistory } = meta;
    const fallback = this._fallbackLearningPath(userProfile);

    if (!this.isLLMAvailable) {
      return {
        sideEffects: [],
        metadata: { learningPath: fallback, _fallback: true },
      };
    }

    const systemPrompt = this._buildLearningPathPrompt(userProfile, assessmentResults, trainingHistory);
    const parsed = await this.callLLMForJSON(systemPrompt, [], { maxTokens: 500 });

    if (!parsed) {
      return {
        sideEffects: [],
        metadata: { learningPath: fallback, _fallback: true },
      };
    }

    const learningPath = {
      stages: Array.isArray(parsed.stages)
        ? parsed.stages.slice(0, 4)
        : fallback.stages,
      focusCapabilities: Array.isArray(parsed.focusCapabilities)
        ? parsed.focusCapabilities.slice(0, 5)
        : fallback.focusCapabilities,
      recommendedScenarioOrder: Array.isArray(parsed.recommendedScenarioOrder)
        ? parsed.recommendedScenarioOrder
        : fallback.recommendedScenarioOrder,
      overallAdvice: parsed.overallAdvice || fallback.overallAdvice,
    };

    return {
      sideEffects: [],
      metadata: { learningPath },
    };
  }

  _fallbackLearningPath(userProfile) {
    const challenges = userProfile?.currentChallenges?.slice(0, 3);
    return {
      stages: [
        { name: '基础管理技能', goal: '掌握日常管理沟通', scenarioIds: [], duration: '1-2周' },
        { name: '进阶管理实践', goal: '处理复杂管理场景', scenarioIds: [], duration: '2-3周' },
      ],
      focusCapabilities: challenges?.length ? challenges : ['沟通能力', '团队管理'],
      recommendedScenarioOrder: [],
      overallAdvice: 'AI 服务暂时不可用，这是一个通用学习路径。服务恢复后会根据你的实际情况生成个性化方案。',
    };
  }

  _buildLearningPathPrompt(userProfile, assessmentResults, trainingHistory) {
    const parts = [
      '你是一位管理能力发展专家，请根据以下用户信息生成个性化的学习路径。',
      '',
      '【用户信息】',
      `岗位：${userProfile?.roleLabel || '管理者'}`,
      `主要挑战：${(userProfile?.currentChallenges || []).join('；') || '未提供'}`,
      `期望成果：${(userProfile?.desiredOutcomes || []).join('；') || '未提供'}`,
      '',
      '【能力评估结果】',
    ];

    if (assessmentResults && typeof assessmentResults === 'object') {
      Object.entries(assessmentResults).forEach(([cap, score]) => {
        parts.push(`  ${cap}: ${score !== null && score !== undefined ? score + '分' : '未评估'}`);
      });
    } else {
      parts.push('  暂无评估数据');
    }

    parts.push('', '【已完成训练】');
    if (trainingHistory && trainingHistory.length > 0) {
      trainingHistory.forEach((t) => {
        parts.push(`  ${t.scenarioTitle || t.scenarioId}: ${t.attempts || 1}次`);
      });
    } else {
      parts.push('  暂无训练记录');
    }

    parts.push(
      '',
      '【输出要求】',
      '请输出JSON格式：',
      '{',
      '  "stages": [{"name":"阶段名","goal":"目标","scenarioIds":["id1"],"duration":"建议时长"}],',
      '  "focusCapabilities": ["capability1","capability2"],',
      '  "recommendedScenarioOrder": ["scenarioId1","scenarioId2"],',
      '  "overallAdvice": "总体建议（1-2句话）"',
      '}',
      '仅输出JSON，不要有其他文字。'
    );

    return parts.join('\n');
  }

  // ==================== assessComplexity ====================

  _assessComplexity(meta) {
    const { userMessage = '', conversationHistory = [] } = meta;
    const msg = userMessage.toLowerCase();
    const allContext = conversationHistory
      .filter((m) => m.role === 'user')
      .map((m) => m.content.toLowerCase())
      .join(' ');
    const fullText = msg + ' ' + allContext;

    const indicators = {
      multiPhase: 0,
      multiStakeholder: 0,
      longTerm: 0,
      systemChange: 0,
      uncertainty: 0,
    };

    if (COMPLEXITY_INDICATORS.multiPhase.some((w) => fullText.includes(w))) {
      indicators.multiPhase = 1;
    }

    const stakeholderCount = COMPLEXITY_INDICATORS.multiStakeholder.filter((w) =>
      fullText.includes(w)
    ).length;
    if (stakeholderCount >= 2) indicators.multiStakeholder = 1;

    if (COMPLEXITY_INDICATORS.longTerm.long.some((w) => fullText.includes(w))) {
      indicators.longTerm = 2;
    } else if (COMPLEXITY_INDICATORS.longTerm.medium.some((w) => fullText.includes(w))) {
      indicators.longTerm = 1;
    }

    if (COMPLEXITY_INDICATORS.systemChange.some((w) => fullText.includes(w))) {
      indicators.systemChange = 2;
    }

    const uncertaintyCount = COMPLEXITY_INDICATORS.uncertainty.filter((w) =>
      fullText.includes(w)
    ).length;
    if (uncertaintyCount >= 2) indicators.uncertainty = 1;

    const score = Object.values(indicators).reduce((sum, val) => sum + val, 0);

    let complexity, estimatedDays;
    if (score >= 5) {
      complexity = TaskComplexity.COMPLEX;
      estimatedDays = 30;
    } else if (score >= 2) {
      complexity = TaskComplexity.MODERATE;
      estimatedDays = 7;
    } else {
      complexity = TaskComplexity.SIMPLE;
      estimatedDays = 1;
    }

    const reasons = [];
    if (indicators.multiPhase) reasons.push('需要多阶段实施');
    if (indicators.multiStakeholder) reasons.push('涉及多个干系人');
    if (indicators.longTerm >= 1) reasons.push('时间周期较长');
    if (indicators.systemChange) reasons.push('涉及系统性变革');
    if (indicators.uncertainty) reasons.push('存在不确定性');

    return {
      sideEffects: [],
      metadata: {
        complexity,
        score,
        indicators,
        estimatedDays,
        reason: reasons.length > 0 ? reasons.join('、') : '任务相对简单',
      },
    };
  }

  // ==================== getTaskProbability ====================

  /**
   * Calculate completion probability for key business tasks based on
   * current assessment scores vs required capability thresholds.
   *
   * @param {Object} meta - { assessmentResults: { capId: score } }
   * @returns {import('./SkillBase').SkillOutput}
   */
  _getTaskProbability(meta) {
    const { assessmentResults = {} } = meta;

    const tasks = DEMO_TASKS.map((task) => {
      const { probability, gaps } = calculateTaskProbability(task, assessmentResults);
      return {
        taskId: task.id,
        title: task.name,
        currentProbability: probability,
        targetProbability: 100,
        estimatedCompletionDate: null,
        blockers: gaps.map((g) => ({
          capabilityId: g.id,
          current: g.current,
          required: g.required,
          gap: g.gap,
        })),
      };
    });

    const weights = DEMO_TASKS.map((t) => t.weight);
    const totalWeight = weights.reduce((s, w) => s + w, 0) || 1;
    const overallProgress = Math.round(
      tasks.reduce((sum, t, i) => sum + t.currentProbability * weights[i], 0) / totalWeight
    );

    return {
      sideEffects: [],
      metadata: { tasks, overallProgress },
    };
  }

  // ==================== detectTodo (LIVE FEATURE from ActionPlanAgent) ====================

  async _detectTodo(meta, userProfile) {
    const {
      userText = '',
      assistantText = '',
      conversationHistory = [],
      sourceType = 'coach',
      activeScenario = null,
    } = meta;

    // Quick pre-check: text too short
    if (!userText || userText.length < 15) {
      return {
        sideEffects: [],
        metadata: { hasTodo: false, todo: null, reason: 'text_too_short' },
      };
    }

    const hasActionSignal = this._hasActionSignal(userText, assistantText);

    if (!hasActionSignal && !this.isLLMAvailable) {
      return {
        sideEffects: [],
        metadata: { hasTodo: false, todo: null, reason: 'no_signal_no_llm' },
      };
    }

    if (!this.isLLMAvailable) {
      if (hasActionSignal) {
        const todo = this._buildRuleBasedTodo(userText, sourceType, userProfile, activeScenario);
        return {
          sideEffects: [],
          metadata: { hasTodo: true, todo, _fallback: true },
        };
      }
      return {
        sideEffects: [],
        metadata: { hasTodo: false, todo: null, _fallback: true },
      };
    }

    // LLM detection
    const recentContext = conversationHistory
      .slice(-4)
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');
    const systemPrompt = this._buildDetectPrompt(
      userText,
      assistantText,
      recentContext,
      sourceType,
      userProfile
    );

    const parsed = await this.callLLMForJSON(systemPrompt, [], { maxTokens: 250 });

    if (!parsed || !parsed.hasTodo) {
      return {
        sideEffects: [],
        metadata: { hasTodo: false, todo: null },
      };
    }

    const todo = this._buildTodoFromLLM(parsed, sourceType, activeScenario);

    return {
      sideEffects: [],
      metadata: { hasTodo: true, todo },
    };
  }

  _hasActionSignal(userText, assistantText = '') {
    const combined = `${userText} ${assistantText}`;
    const signals = [
      /我(打算|准备|计划|决定|要|会|想)(去|来)?/,
      /(明天|下周|下个月|回去后)(我|就)/,
      /(试试|试一下|尝试|实践|落地)/,
      /(跟.*谈|找.*聊|约.*开会|组织.*会议)/,
      /(制定|制作|写|整理|梳理|输出)(一个|一份)?/,
      /(调整|优化|改进|改善|完善)(一下)?/,
      /建议你(可以)?/,
      /你可以(试试|尝试)/,
      /(第一步|首先|接下来).*(可以|建议|需要)/,
      /(行动计划|后续步骤|下一步|待办|to-?do)/i,
    ];
    return signals.some((regex) => regex.test(combined));
  }

  _buildRuleBasedTodo(userText, sourceType, userProfile, activeScenario) {
    return {
      id: `todo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      sourceType,
      sourceSessionId: activeScenario?.scenarioId || 'coach',
      title: '管理行动待办',
      description: userText.slice(0, 300),
      dueDate: null,
      relatedCapabilities: activeScenario?.capabilities?.slice(0, 3) || [],
      relatedTools: [],
      status: TodoStatus.PENDING,
      completedAt: null,
      retrospectiveId: null,
    };
  }

  _buildDetectPrompt(userText, assistantText, recentContext, sourceType, userProfile) {
    const parts = [
      '你是一位行动规划专家。分析以下对话片段，判断是否包含用户需要在实际工作中执行的具体行动。',
      '只在确实有明确行动意图时才提取，避免过度捕捉。',
      '',
      `【对话来源】${sourceType === 'scenario' ? '场景训练' : sourceType === 'retrospective' ? '复盘' : 'AI教练对话'}`,
      `【用户岗位】${userProfile?.roleLabel || '管理者'}`,
      `【用户输入】${userText}`,
    ];

    if (assistantText) {
      parts.push(`【AI回复】${assistantText.slice(0, 300)}`);
    }

    if (recentContext) {
      parts.push(`【近期对话上下文】\n${recentContext}`);
    }

    parts.push(
      '',
      '如果包含具体行动意图，输出JSON：',
      '{"hasTodo":true,"title":"行动标题（10字内）","description":"具体描述（含交付物和验证标准）",',
      '"relatedCapabilities":["关联能力ID"],"relatedTools":["关联工具ID"],"suggestedDays":7}',
      '',
      '如果没有明确的行动意图，输出：',
      '{"hasTodo":false}',
      '',
      '能力ID可选：roleTransition, planningExecution, motivation, coaching, communication,',
      'collaboration, performanceManagement, customerManagement, businessCoaching,',
      'dataAnalysis, techDecision, projectManagement, knowledgeManagement, qualityAssurance',
      '',
      '仅输出JSON，不要有其他文字。'
    );

    return parts.join('\n');
  }

  _buildTodoFromLLM(parsed, sourceType, activeScenario) {
    const now = new Date();
    const dueDate = parsed.suggestedDays
      ? new Date(now.getTime() + parsed.suggestedDays * 86400000).toISOString()
      : null;

    return {
      id: `todo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now.toISOString(),
      sourceType,
      sourceSessionId: activeScenario?.scenarioId || 'coach',
      title: parsed.title || '管理行动待办',
      description: parsed.description || '',
      dueDate,
      relatedCapabilities: Array.isArray(parsed.relatedCapabilities)
        ? parsed.relatedCapabilities.slice(0, 3)
        : [],
      relatedTools: Array.isArray(parsed.relatedTools)
        ? parsed.relatedTools.slice(0, 3)
        : [],
      status: TodoStatus.PENDING,
      completedAt: null,
      retrospectiveId: null,
    };
  }
}
