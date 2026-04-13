/**
 * ContentSkill — knowledge tool retrieval and scenario recommendation.
 *
 * Combines:
 *   - KnowledgeAgent: tool context injection for coaching
 *   - ScenarioSelectorAgent: personalized scenario ranking
 *
 * Actions:
 *   - getToolContext:       retrieve formatted tool context for system prompt injection
 *   - recommendScenarios:  rank scenarios by user profile relevance
 *
 * Default action: getToolContext
 *
 * Neither action requires LLM — both are rule-based retrieval/scoring.
 */

import { SkillBase } from './SkillBase';
import { KNOWLEDGE_TOOLS } from '../store';

// ==================== Tool keyword map (from KnowledgeAgent) ====================

const TOOL_KEYWORD_MAP = {
  'iceberg-model': ['冰山', '系统', '全局', '本质', '深层'],
  'causal-loop': ['因果', '循环', '反馈', '回路', '系统'],
  'manager-90day': ['新经理', '转型', '上任', '角色', '90天'],
  'management-leverage': ['杠杆', '时间', '投入产出', '管理活动'],
  'situational-delegation': ['授权', '委派', '放手', '信任'],
  'raci-matrix': ['职责', '分工', '谁负责', 'raci'],
  'two-factor': ['激励', '动机', '需求', '满意度'],
  'instant-recognition': ['认可', '表扬', '正向', '及时'],
  'grow-model': ['一对一', '沟通', '辅导', '教练', 'grow'],
  'one-on-one': ['1on1', '面谈', '对话', '成长'],
  'bad-news-report': ['汇报', '坏消息', '问题', '向上'],
  'stakeholder-map': ['干系人', '利益', '跨部门', '协同'],
  'star-feedback': ['反馈', '评估', '表达', 'star'],
  'meeting-3p': ['会议', '周会', '站会', '3p'],
  'okr-alignment': ['目标', 'okr', '对齐', '关键结果'],
  'performance-best': ['绩效', '面谈', '评价', 'best'],
  'smart-goals': ['目标', '分解', 'kpi', '计划', 'smart'],
  'wbs-decomposition': ['拆解', '工作包', '分解', 'wbs'],
  'five-whys': ['根因', '分析', '为什么', '5why'],
  'decision-matrix': ['决策', '选择', '方案', '权衡'],
  'customer-tiering': ['客户', '分级', 'abc', '管理'],
  'spin-selling': ['提问', '销售', 'spin', '需求'],
  'data-to-action': ['数据', '分析', '指标', '仪表盘'],
  'tech-decision-matrix': ['选型', '技术', '架构', '评估'],
  'sprint-framework': ['敏捷', 'sprint', '迭代', '站会'],
  'knowledge-pyramid': ['文档', '知识', '沉淀', '规范'],
  'quality-culture': ['评审', '质量', 'cr', 'code review'],
};

// ==================== Capability-to-tool map (from KnowledgeAgent) ====================

const CAPABILITY_TOOL_MAP = {
  systemsThinking: ['iceberg-model', 'causal-loop'],
  roleTransition: ['manager-90day', 'management-leverage'],
  delegation: ['situational-delegation', 'raci-matrix'],
  motivation: ['two-factor', 'instant-recognition'],
  coaching: ['grow-model', 'one-on-one'],
  collaboration: ['bad-news-report', 'stakeholder-map'],
  communication: ['star-feedback', 'meeting-3p'],
  performanceManagement: ['okr-alignment', 'performance-best'],
  planningExecution: ['smart-goals', 'wbs-decomposition'],
  problemSolving: ['five-whys', 'decision-matrix'],
  customerManagement: ['customer-tiering'],
  businessCoaching: ['spin-selling'],
  dataAnalysis: ['data-to-action'],
  techDecision: ['tech-decision-matrix'],
  projectManagement: ['sprint-framework'],
  knowledgeManagement: ['knowledge-pyramid'],
  qualityAssurance: ['quality-culture'],
};

// ==================== ContentSkill ====================

export class ContentSkill extends SkillBase {
  get name() {
    return 'content';
  }

  /**
   * @param {import('./SkillBase').SkillInput} input
   * @returns {Promise<import('./SkillBase').SkillOutput>}
   */
  async execute(input) {
    const { metadata: inputMeta = {} } = input;
    const action = inputMeta.action || 'getToolContext';

    switch (action) {
      case 'getToolContext':
        return this._getToolContext(inputMeta);
      case 'recommendScenarios':
        return this._recommendScenarios(inputMeta, input.userProfile);
      default:
        return this._getToolContext(inputMeta);
    }
  }

  // ==================== getToolContext ====================

  _getToolContext(meta) {
    let { toolIds = [] } = meta;

    // If no explicit toolIds, infer from userMessage via keyword matching
    if (toolIds.length === 0 && meta.userMessage) {
      toolIds = Object.entries(TOOL_KEYWORD_MAP)
        .filter(([, keywords]) => keywords.some(kw => meta.userMessage.includes(kw)))
        .map(([toolId]) => toolId)
        .slice(0, 3); // Max 3 tools to avoid context bloat
    }

    const tools = toolIds
      .map((id) => KNOWLEDGE_TOOLS.find((t) => t.id === id))
      .filter(Boolean);

    if (tools.length === 0) {
      return {
        sideEffects: [],
        metadata: { contextInsert: '', tools: [] },
      };
    }

    const contextInsert = tools
      .map((tool) => {
        const elements = tool.content.elements
          .map((e) => `  - ${e.key}（${e.label}）：${e.desc}`)
          .join('\n');

        return [
          `【${tool.name}】`,
          `核心原则：${tool.content.principle}`,
          `要素：`,
          elements,
          `应用示例：${tool.content.example}`,
        ].join('\n');
      })
      .join('\n\n');

    return {
      sideEffects: [],
      metadata: {
        contextInsert,
        tools: tools.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          category: t.category,
        })),
      },
    };
  }

  // ==================== recommendScenarios ====================

  _recommendScenarios(meta, userProfile) {
    const { scenarios, userProgress = {} } = meta;

    if (!Array.isArray(scenarios) || scenarios.length === 0) {
      return {
        sideEffects: [],
        metadata: { rankedScenarios: [], topIds: [] },
      };
    }

    const focusCapabilityIds = this._extractFocusCapabilities(userProfile);
    const { lowScoreIds, unscoredIds } = this._extractCapabilityGaps(userProfile);
    const crossValidation = userProfile?.assessmentMeta?.byCapability || {};
    const challengeText = (userProfile?.currentChallenges || []).join(' ');

    const scored = scenarios.map((scenario) => {
      const caps = scenario.capabilities || [];

      const focusMatch = caps.filter((id) => focusCapabilityIds.includes(id)).length;
      const lowScoreMatch = caps.filter((id) => lowScoreIds.includes(id)).length;
      const unscoredMatch = caps.filter((id) => unscoredIds.includes(id)).length;
      const conflictMatch = caps.filter(
        (id) => crossValidation[id]?.status === '需交叉验证'
      ).length;
      const challengeMatch =
        challengeText &&
        (challengeText.includes(scenario.title) || challengeText.includes(scenario.description))
          ? 2
          : 0;
      const frequencyScore = scenario.frequency === 'high' ? 2 : 1;
      const completionPenalty = userProgress[scenario.id]?.completed ? -1 : 0;

      const score =
        focusMatch * 3 +
        lowScoreMatch * 4 +
        unscoredMatch * 4 +
        conflictMatch * 3 +
        challengeMatch +
        frequencyScore +
        completionPenalty;

      return { ...scenario, recommendationScore: score };
    });

    scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
    const topIds = scored.slice(0, 3).map((s) => s.id);

    return {
      sideEffects: [],
      metadata: { rankedScenarios: scored, topIds, totalScenarios: scored.length },
    };
  }

  _extractFocusCapabilities(userProfile) {
    const focus =
      userProfile?.beiProfile?.llmInsights?.focusCapabilities ||
      userProfile?.beiProfile?.focusCapabilities ||
      [];
    return focus.map((item) => (typeof item === 'string' ? item : item.id)).filter(Boolean);
  }

  _extractCapabilityGaps(userProfile) {
    const results = userProfile?.assessmentResults || {};
    const lowScoreIds = [];
    const unscoredIds = [];
    Object.entries(results).forEach(([capId, score]) => {
      if (score === null || score === undefined) unscoredIds.push(capId);
      else if (typeof score === 'number' && score < 70) lowScoreIds.push(capId);
    });
    return { lowScoreIds, unscoredIds };
  }
}
