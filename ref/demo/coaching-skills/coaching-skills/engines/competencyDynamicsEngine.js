/**
 * CompetencyDynamicsEngine - 能力变化动态观测与量化引擎
 *
 * 核心设计理念：应用优先、贝叶斯驱动、多层证据
 *
 * 理论框架：
 *   - Kirkpatrick 四层：证据分层权重 (L1反应5% / L2学习10% / L3行为50% / L4结果35%)
 *   - 70-20-10 模型：知识15% / 模拟35% / 真实应用50%
 *   - Dreyfus 五阶段：Novice → AdvancedBeginner → Competent → Proficient → Expert
 *   - Bloom 认知分类：Remember → Understand → Apply → Analyze → Evaluate → Create
 *   - Kolb 经验循环：Learn → Practice → Act → Reflect
 *   - 贝叶斯信念更新：BEI 先验 + 行为证据后验
 *
 * @module CompetencyDynamicsEngine
 */

// ============================================================
// 常量与配置
// ============================================================

/** 事件类别 */
export const EventCategory = {
  REAL_APPLICATION: 'realApplication',   // 真实场景应用 (50%)
  SIMULATION: 'simulation',              // 模拟应用 (35%)
  KNOWLEDGE: 'knowledge',                // 知识获取 (15%)
};

/** 事件类型枚举 */
export const EventType = {
  // 真实应用 (50%)
  ACTION_PLAN_EXECUTED: 'action_plan_executed',           // 行动计划执行+复盘 30%
  DEEP_RETROSPECTIVE: 'deep_retrospective',               // 深度复盘中的行为证据 12%
  TRANSFER_APPLICATION: 'transfer_application',            // 复盘中的迁移应用证据 8%

  // 模拟应用 (35%)
  SCENARIO_TRAINING: 'scenario_training',                  // 场景训练综合表现 20%
  COACH_APPLICATION_INTERACTION: 'coach_application',      // Coach对话中的应用性互动 10%
  ACTION_PLAN_QUALITY: 'action_plan_quality',              // 行动计划质量 5%

  // 知识获取 (15%)
  PROACTIVE_SEARCH: 'proactive_search',                    // 主动搜索/提问 7%
  PROACTIVE_EXPLORE: 'proactive_explore',                  // 主动探索知识库 3%
  PASSIVE_RECOMMENDED: 'passive_recommended',              // 系统推荐后查看 3%
  PASSIVE_BROWSE: 'passive_browse',                        // 纯浏览 2%
};

/** 事件权重配置表 */
const EVENT_WEIGHTS = {
  [EventType.ACTION_PLAN_EXECUTED]:       { base: 0.30, category: EventCategory.REAL_APPLICATION },
  [EventType.DEEP_RETROSPECTIVE]:         { base: 0.12, category: EventCategory.REAL_APPLICATION },
  [EventType.TRANSFER_APPLICATION]:       { base: 0.08, category: EventCategory.REAL_APPLICATION },
  [EventType.SCENARIO_TRAINING]:          { base: 0.20, category: EventCategory.SIMULATION },
  [EventType.COACH_APPLICATION_INTERACTION]: { base: 0.10, category: EventCategory.SIMULATION },
  [EventType.ACTION_PLAN_QUALITY]:        { base: 0.05, category: EventCategory.SIMULATION },
  [EventType.PROACTIVE_SEARCH]:           { base: 0.07, category: EventCategory.KNOWLEDGE },
  [EventType.PROACTIVE_EXPLORE]:          { base: 0.03, category: EventCategory.KNOWLEDGE },
  [EventType.PASSIVE_RECOMMENDED]:        { base: 0.03, category: EventCategory.KNOWLEDGE },
  [EventType.PASSIVE_BROWSE]:             { base: 0.02, category: EventCategory.KNOWLEDGE },
};

/** 主动性乘数 (自我决定理论) */
const PROACTIVITY_MULTIPLIER = {
  proactive: 1.8,    // 用户自发搜索/提问/选择训练
  neutral: 1.0,      // 系统推荐后参与
  lowMotivation: 0.6, // 多次提醒后才参与
};

/** Bloom 认知层级乘数 */
const BLOOM_LEVEL_MULTIPLIER = {
  1: 0.5,  // Remember
  2: 0.7,  // Understand
  3: 1.0,  // Apply
  4: 1.3,  // Analyze
  5: 1.5,  // Evaluate
  6: 1.8,  // Create
};

/** Dreyfus 阶段定义 */
export const DreyfusStage = {
  NOVICE: { id: 'novice', label: '新手', min: 0, max: 20 },
  ADVANCED_BEGINNER: { id: 'advancedBeginner', label: '进阶新手', min: 20, max: 40 },
  COMPETENT: { id: 'competent', label: '胜任', min: 40, max: 60 },
  PROFICIENT: { id: 'proficient', label: '精通', min: 60, max: 80 },
  EXPERT: { id: 'expert', label: '专家', min: 80, max: 100 },
};

/** 提问质量级别 */
export const QuestionQualityLevel = {
  INFO_RETRIEVAL: { level: 1, label: '信息检索', bloomLevel: 1 },
  PROCEDURAL: { level: 2, label: '程序性提问', bloomLevel: 2 },
  ANALYTICAL: { level: 3, label: '分析性提问', bloomLevel: 4 },
  STRATEGIC: { level: 4, label: '策略性提问', bloomLevel: 5 },
  METACOGNITIVE: { level: 5, label: '元认知提问', bloomLevel: 6 },
};

/** 复盘深度级别 */
export const RetrospectiveDepthLevel = {
  SURFACE: { level: 1, label: '表面描述', bloomLevel: 1 },
  CAUSAL: { level: 2, label: '因果分析', bloomLevel: 3 },
  EVALUATIVE: { level: 3, label: '评价反思', bloomLevel: 4 },
  INTEGRATIVE: { level: 4, label: '整合迁移', bloomLevel: 5 },
  PARADIGM_SHIFT: { level: 5, label: '范式转变', bloomLevel: 6 },
};

/** 时间衰减配置 */
const DECAY_CONFIG = {
  halfLifeDays: 90,
  minWeight: 0.05,
};

/** 抗刷分配置 */
const ANTI_GAMING = {
  dailyEvidenceCap: 5,
  sameTypeDiminishingFactor: 0.7,
  scenarioRepeatPenaltyThreshold: 3,
  scenarioRepeatMultiplier: 0.5,
  knowledgeApplicationWindowDays: 7,
  retroQualityMinDepth: 2,
  actionCompletionPenaltyThreshold: 0.3,
  sameCapabilityIntervalHours: 4,
  simulationScoreCeiling: 70,
};

/** Kolb 循环加成 */
const KOLB_CYCLE_BONUS = 0.3;

// ============================================================
// 贝叶斯追踪器
// ============================================================

/**
 * Beta 分布参数 → 分数及置信度
 */
function betaMean(alpha, beta) {
  return alpha / (alpha + beta);
}

function betaVariance(alpha, beta) {
  const n = alpha + beta;
  return (alpha * beta) / (n * n * (n + 1));
}

/**
 * 计算 95% 置信区间 (正态近似)
 */
function betaConfidenceInterval(alpha, beta) {
  const mean = betaMean(alpha, beta);
  const stdDev = Math.sqrt(betaVariance(alpha, beta));
  return {
    low: Math.max(0, Math.round((mean - 1.96 * stdDev) * 100)),
    high: Math.min(100, Math.round((mean + 1.96 * stdDev) * 100)),
  };
}

/**
 * 计算置信度 (0-1)
 * 基于证据总量、多样性和时效性
 */
function calculateConfidence(evidenceLog) {
  if (!evidenceLog || evidenceLog.length === 0) return 0;

  const now = Date.now();
  const dayMs = 86400000;

  // 证据数量因子 (max at 20 items)
  const countFactor = Math.min(1, evidenceLog.length / 20);

  // 多样性因子 (unique event types)
  const uniqueTypes = new Set(evidenceLog.map(e => e.type)).size;
  const diversityFactor = Math.min(1, uniqueTypes / 5);

  // 时效性因子 (recent evidence weighs more)
  const recentCount = evidenceLog.filter(e =>
    (now - e.timestamp) < 30 * dayMs
  ).length;
  const recencyFactor = evidenceLog.length > 0
    ? recentCount / evidenceLog.length
    : 0;

  // 类别覆盖因子
  const categories = new Set(evidenceLog.map(e => e.category));
  const categoryFactor = categories.size / 3; // 3 categories total

  return Math.min(1,
    countFactor * 0.3 +
    diversityFactor * 0.25 +
    recencyFactor * 0.25 +
    categoryFactor * 0.2
  );
}

/**
 * 将 BEI 分数 (0-100) 转为 Beta 分布先验参数
 * 弱先验，易于被后续证据更新
 */
function beiScoreToBetaPrior(score) {
  const s = Math.max(0, Math.min(100, score || 50));
  const alpha = Math.max(1, s / 10);
  const beta = Math.max(1, (100 - s) / 10);
  return { alpha, beta };
}

/**
 * 计算时间衰减系数
 */
function timeDecayFactor(timestampMs) {
  const ageMs = Date.now() - timestampMs;
  const ageDays = ageMs / 86400000;
  const factor = Math.pow(2, -ageDays / DECAY_CONFIG.halfLifeDays);
  return Math.max(DECAY_CONFIG.minWeight, factor);
}

/**
 * 获取 Dreyfus 阶段
 */
function getDreyfusStage(score) {
  if (score >= 80) return DreyfusStage.EXPERT;
  if (score >= 60) return DreyfusStage.PROFICIENT;
  if (score >= 40) return DreyfusStage.COMPETENT;
  if (score >= 20) return DreyfusStage.ADVANCED_BEGINNER;
  return DreyfusStage.NOVICE;
}

/**
 * 计算趋势 (基于最近 30 天的分数快照)
 */
function calculateTrend(snapshotHistory, capabilityId) {
  if (!snapshotHistory || snapshotHistory.length < 2) return 'stable';

  const recent = snapshotHistory.slice(-7); // 最近 7 个快照
  if (recent.length < 2) return 'stable';

  const first = recent[0].scores?.[capabilityId] ?? 0;
  const last = recent[recent.length - 1].scores?.[capabilityId] ?? 0;
  const delta = last - first;

  if (delta >= 3) return 'rising';
  if (delta <= -3) return 'declining';
  return 'stable';
}

// ============================================================
// 抗刷分验证器
// ============================================================

class AntiGamingValidator {
  /**
   * 验证事件是否有效（非刷分行为）
   * @returns {{ valid: boolean, reason: string|null, modifier: number }}
   */
  static validate(event, capState) {
    const checks = [
      this._checkDailyCap(event, capState),
      this._checkSameTypeDiminishing(event, capState),
      this._checkScenarioRepeat(event, capState),
      this._checkSameCapabilityInterval(event, capState),
      this._checkRetroQualityGate(event),
    ];

    let combinedModifier = 1.0;

    for (const check of checks) {
      if (!check.valid) {
        return { valid: false, reason: check.reason, modifier: 0 };
      }
      combinedModifier *= check.modifier;
    }

    return { valid: true, reason: null, modifier: combinedModifier };
  }

  /** 每日证据上限 (5条) */
  static _checkDailyCap(event, capState) {
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = capState.dailyCount?.[today] || 0;

    if (todayCount >= ANTI_GAMING.dailyEvidenceCap) {
      return { valid: false, reason: '今日证据已达上限', modifier: 0 };
    }
    return { valid: true, reason: null, modifier: 1.0 };
  }

  /** 同类型递减收益 (0.7^n) */
  static _checkSameTypeDiminishing(event, capState) {
    const count = capState.typeCount?.[event.type] || 0;
    const modifier = Math.pow(ANTI_GAMING.sameTypeDiminishingFactor, count);
    return { valid: true, reason: null, modifier: Math.max(0.1, modifier) };
  }

  /** 场景重复惩罚 (3次后减半) */
  static _checkScenarioRepeat(event, capState) {
    if (!event.scenarioId) return { valid: true, reason: null, modifier: 1.0 };
    const repeatCount = capState.scenarioRepeat?.[event.scenarioId] || 0;
    if (repeatCount >= ANTI_GAMING.scenarioRepeatPenaltyThreshold) {
      return { valid: true, reason: null, modifier: ANTI_GAMING.scenarioRepeatMultiplier };
    }
    return { valid: true, reason: null, modifier: 1.0 };
  }

  /** 同能力间隔效应 (4小时) */
  static _checkSameCapabilityInterval(event, capState) {
    const lastTs = capState.lastEventTimestamps?.[event.capabilityId];
    if (!lastTs) return { valid: true, reason: null, modifier: 1.0 };

    const hoursSince = (Date.now() - lastTs) / 3600000;
    if (hoursSince < ANTI_GAMING.sameCapabilityIntervalHours) {
      return {
        valid: false,
        reason: `距上次同能力证据不足${ANTI_GAMING.sameCapabilityIntervalHours}小时`,
        modifier: 0,
      };
    }
    return { valid: true, reason: null, modifier: 1.0 };
  }

  /** 复盘质量门槛 (深度 < 2 降级) */
  static _checkRetroQualityGate(event) {
    if (event.type !== EventType.DEEP_RETROSPECTIVE &&
        event.type !== EventType.ACTION_PLAN_EXECUTED) {
      return { valid: true, reason: null, modifier: 1.0 };
    }

    const depth = event.retroDepthLevel || 1;
    if (depth < ANTI_GAMING.retroQualityMinDepth) {
      return { valid: true, reason: null, modifier: 0.3 }; // 大幅降权而非拒绝
    }
    return { valid: true, reason: null, modifier: 1.0 };
  }

  /** 能力分上限锁：仅靠模拟训练上限70分 */
  static applySimulationCeiling(score, hasRealApplicationEvidence) {
    if (!hasRealApplicationEvidence && score > ANTI_GAMING.simulationScoreCeiling) {
      return ANTI_GAMING.simulationScoreCeiling;
    }
    return score;
  }
}

// ============================================================
// 提问质量评估
// ============================================================

/**
 * 评估用户提问的质量级别
 * @param {string} questionText - 用户的提问文本
 * @returns {{ level: number, label: string, bloomLevel: number }}
 */
export function assessQuestionQuality(questionText) {
  if (!questionText || questionText.length < 5) {
    return QuestionQualityLevel.INFO_RETRIEVAL;
  }

  const text = questionText.toLowerCase();

  // Level 5: 元认知提问 - 反思自身思维过程
  if (/我(的思维|的判断|的假设|的偏见)/.test(text) ||
      /我(是否|有没有).*忽略|盲区|局限/.test(text) ||
      /如何(审视|评估|检验).*自己/.test(text)) {
    return QuestionQualityLevel.METACOGNITIVE;
  }

  // Level 4: 策略性提问 - 寻求系统性解决方案
  if (/如何(系统|全面|战略|长期)/.test(text) ||
      /(最佳|最优|关键)(策略|方案|路径)/.test(text) ||
      /权衡|取舍|优先级|资源分配/.test(text) ||
      /如果.*不同.*会怎样/.test(text)) {
    return QuestionQualityLevel.STRATEGIC;
  }

  // Level 3: 分析性提问 - 探究因果关系
  if (/为什么|原因|根因|本质/.test(text) ||
      /区别|不同|相比|优劣/.test(text) ||
      /背后|深层|潜在/.test(text) ||
      /如何(分析|评估|判断)/.test(text)) {
    return QuestionQualityLevel.ANALYTICAL;
  }

  // Level 2: 程序性提问 - 问如何执行
  if (/怎么(做|执行|实施|操作)/.test(text) ||
      /步骤|流程|方法|具体/.test(text) ||
      /如何(开始|进行|处理)/.test(text)) {
    return QuestionQualityLevel.PROCEDURAL;
  }

  // Level 1: 信息检索 - 简单查询
  return QuestionQualityLevel.INFO_RETRIEVAL;
}

// ============================================================
// 复盘深度评估
// ============================================================

/**
 * 评估复盘文本的深度级别
 * @param {string} retroText - 复盘文本
 * @param {Object|null} retroResult - 复盘Agent的分析结果（如果有）
 * @returns {{ level: number, label: string, bloomLevel: number }}
 */
export function assessRetrospectiveDepth(retroText, retroResult = null) {
  if (!retroText || retroText.length < 20) {
    return RetrospectiveDepthLevel.SURFACE;
  }

  const text = retroText;

  // Level 5: 范式转变 - 认知框架根本性改变
  if (/完全(改变|颠覆|重新)(了|我的).*认知/.test(text) ||
      /以前.*一直.*现在.*发现/.test(text) ||
      /(新的|全新的)(理解|认知|框架|视角)/.test(text) ||
      /从根本上|彻底改变了/.test(text)) {
    return RetrospectiveDepthLevel.PARADIGM_SHIFT;
  }

  // Level 4: 整合迁移 - 将经验迁移到其他场景
  if (/可以(用在|应用到|推广到|迁移到)/.test(text) ||
      /其他(场景|情境|场合|团队).*也/.test(text) ||
      /(通用的|普遍的)(原则|规律|方法)/.test(text) ||
      /举一反三|触类旁通|融会贯通/.test(text)) {
    return RetrospectiveDepthLevel.INTEGRATIVE;
  }

  // Level 3: 评价反思 - 对自己行为做判断性评价
  if (/(做得好|做得不好|应该|不应该)/.test(text) ||
      /(如果重来|如果再.*一次|下次)/.test(text) ||
      /(关键|核心|本质)(是|在于)/.test(text) ||
      /值得|不值得|需要改进/.test(text)) {
    return RetrospectiveDepthLevel.EVALUATIVE;
  }

  // Level 2: 因果分析 - 分析原因和结果
  if (/因为|所以|导致|造成|原因(是|在于)/.test(text) ||
      /之所以|结果是|由于/.test(text) ||
      /影响|效果|后果/.test(text)) {
    return RetrospectiveDepthLevel.CAUSAL;
  }

  // Level 1: 表面描述
  return RetrospectiveDepthLevel.SURFACE;
}

// ============================================================
// Kolb 循环追踪
// ============================================================

const KOLB_PHASES = ['learn', 'practice', 'act', 'reflect'];

function getKolbPhaseForEvent(eventType) {
  const mapping = {
    [EventType.PROACTIVE_SEARCH]: 'learn',
    [EventType.PROACTIVE_EXPLORE]: 'learn',
    [EventType.PASSIVE_RECOMMENDED]: 'learn',
    [EventType.PASSIVE_BROWSE]: 'learn',
    [EventType.SCENARIO_TRAINING]: 'practice',
    [EventType.COACH_APPLICATION_INTERACTION]: 'practice',
    [EventType.ACTION_PLAN_QUALITY]: 'act',
    [EventType.ACTION_PLAN_EXECUTED]: 'act',
    [EventType.DEEP_RETROSPECTIVE]: 'reflect',
    [EventType.TRANSFER_APPLICATION]: 'reflect',
  };
  return mapping[eventType] || null;
}

// ============================================================
// 主引擎类
// ============================================================

/**
 * CompetencyDynamicsEngine - 能力动态追踪引擎
 *
 * 核心方法：
 *   - initializeFromBEI(assessmentResults): 用 BEI 分数初始化先验
 *   - processEvent(event): 处理一条行为证据事件
 *   - getCapabilityScore(capabilityId): 获取能力分数
 *   - getFullReport(): 获取完整能力报告
 *   - takeSnapshot(): 保存当前分数快照（用于趋势图）
 */
export class CompetencyDynamicsEngine {
  constructor() {
    this.state = this._createEmptyState();
  }

  // ============================================================
  // 状态管理
  // ============================================================

  _createEmptyState() {
    return {
      capabilities: {},
      totalLearningMinutes: 0,
      lastUpdated: null,
      snapshotHistory: [],
    };
  }

  _createEmptyCapabilityState(capabilityId) {
    return {
      capabilityId,
      alpha: 5,   // 默认先验 Beta(5, 5) = 50分
      beta: 5,
      evidenceLog: [],
      dailyCount: {},
      typeCount: {},
      scenarioRepeat: {},
      lastEventTimestamps: {},
      kolbCycle: {
        learn: false,
        practice: false,
        act: false,
        reflect: false,
        completedCycles: 0,
      },
      hasRealApplicationEvidence: false,
    };
  }

  /**
   * 导出当前状态（用于 Zustand 持久化）
   */
  exportState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * 从持久化数据恢复状态
   */
  importState(savedState) {
    if (savedState && typeof savedState === 'object' && savedState.capabilities) {
      this.state = savedState;
    }
  }

  // ============================================================
  // 初始化
  // ============================================================

  /**
   * 用 BEI 评估分数初始化能力先验
   * @param {Object} assessmentResults - { [capabilityId]: number (0-100) }
   * @param {string[]} allCapabilityIds - 所有能力 ID 列表
   */
  initializeFromBEI(assessmentResults, allCapabilityIds = []) {
    const allIds = allCapabilityIds.length > 0
      ? allCapabilityIds
      : Object.keys(assessmentResults || {});

    allIds.forEach(capId => {
      const score = assessmentResults?.[capId];
      const prior = beiScoreToBetaPrior(score ?? 50);
      const capState = this._getOrCreateCapState(capId);
      capState.alpha = prior.alpha;
      capState.beta = prior.beta;
    });

    this.state.lastUpdated = new Date().toISOString();
  }

  // ============================================================
  // 事件处理
  // ============================================================

  /**
   * 处理一条行为证据事件
   *
   * @param {Object} event
   * @param {string} event.type - EventType 枚举值
   * @param {string} event.capabilityId - 关联能力 ID
   * @param {string} [event.description] - 描述
   * @param {number} [event.bloomLevel] - Bloom 认知层级 (1-6)
   * @param {boolean} [event.isProactive] - 是否主动行为
   * @param {string} [event.proactivityLevel] - 'proactive' | 'neutral' | 'lowMotivation'
   * @param {number} [event.score] - 原始评分 (1-10)
   * @param {string} [event.scenarioId] - 关联场景 ID
   * @param {number} [event.retroDepthLevel] - 复盘深度 (1-5)
   * @param {number} [event.durationMinutes] - 持续时长(分钟)
   * @param {string} [event.source] - 来源 Agent
   *
   * @returns {{ accepted: boolean, reason: string|null, effectiveWeight: number, newScore: number }}
   */
  processEvent(event) {
    if (!event || !event.type || !event.capabilityId) {
      return { accepted: false, reason: '缺少 type 或 capabilityId', effectiveWeight: 0, newScore: 0 };
    }

    const weightConfig = EVENT_WEIGHTS[event.type];
    if (!weightConfig) {
      return { accepted: false, reason: `未知事件类型: ${event.type}`, effectiveWeight: 0, newScore: 0 };
    }

    const capState = this._getOrCreateCapState(event.capabilityId);

    // Step 1: 抗刷分验证
    const validation = AntiGamingValidator.validate(event, capState);
    if (!validation.valid) {
      return { accepted: false, reason: validation.reason, effectiveWeight: 0, newScore: this._getScore(capState) };
    }

    // Step 2: 计算有效权重
    let effectiveWeight = weightConfig.base;

    // 应用主动性乘数
    const proactivity = event.proactivityLevel ||
      (event.isProactive ? 'proactive' : 'neutral');
    effectiveWeight *= (PROACTIVITY_MULTIPLIER[proactivity] || 1.0);

    // 应用 Bloom 层级乘数
    const bloomLevel = Math.max(1, Math.min(6, event.bloomLevel || 3));
    effectiveWeight *= (BLOOM_LEVEL_MULTIPLIER[bloomLevel] || 1.0);

    // 应用抗刷分修正
    effectiveWeight *= validation.modifier;

    // 应用 Kolb 循环加成
    const kolbPhase = getKolbPhaseForEvent(event.type);
    if (kolbPhase) {
      capState.kolbCycle[kolbPhase] = true;
      if (this._isKolbCycleComplete(capState.kolbCycle)) {
        effectiveWeight *= (1 + KOLB_CYCLE_BONUS);
        // 重置循环
        capState.kolbCycle = {
          learn: false, practice: false, act: false, reflect: false,
          completedCycles: capState.kolbCycle.completedCycles + 1,
        };
      }
    }

    // Step 3: 贝叶斯更新
    const isPositive = (event.score || 7) >= 6; // 6分以上视为正面证据
    const updateStrength = effectiveWeight * 2; // 缩放到合理的 alpha/beta 增量

    if (isPositive) {
      capState.alpha += updateStrength;
    } else {
      capState.beta += updateStrength;
    }

    // Step 4: 记录证据
    const evidenceEntry = {
      id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: event.type,
      category: weightConfig.category,
      weight: effectiveWeight,
      bloomLevel,
      isProactive: proactivity === 'proactive',
      timestamp: Date.now(),
      source: event.source || 'unknown',
      description: event.description || '',
      score: event.score || null,
    };
    capState.evidenceLog.push(evidenceEntry);

    // Step 5: 更新抗刷分计数器
    const today = new Date().toISOString().slice(0, 10);
    capState.dailyCount[today] = (capState.dailyCount[today] || 0) + 1;
    capState.typeCount[event.type] = (capState.typeCount[event.type] || 0) + 1;
    if (event.scenarioId) {
      capState.scenarioRepeat[event.scenarioId] =
        (capState.scenarioRepeat[event.scenarioId] || 0) + 1;
    }
    capState.lastEventTimestamps[event.capabilityId] = Date.now();

    // Step 6: 标记真实应用证据
    if (weightConfig.category === EventCategory.REAL_APPLICATION) {
      capState.hasRealApplicationEvidence = true;
    }

    // Step 7: 累计学习时长
    if (event.durationMinutes) {
      this.state.totalLearningMinutes += event.durationMinutes;
    }

    this.state.lastUpdated = new Date().toISOString();

    const newScore = this._getScore(capState);
    return { accepted: true, reason: null, effectiveWeight, newScore };
  }

  // ============================================================
  // 查询接口
  // ============================================================

  /**
   * 获取单个能力的完整评分信息
   */
  getCapabilityScore(capabilityId) {
    const capState = this.state.capabilities[capabilityId];
    if (!capState) {
      return {
        capabilityId,
        score: 0,
        confidence: 0,
        confidenceInterval: { low: 0, high: 0 },
        dreyfusStage: DreyfusStage.NOVICE,
        trend: 'stable',
        evidenceCount: 0,
        kolbCycle: { learn: false, practice: false, act: false, reflect: false, completedCycles: 0 },
        hasRealApplicationEvidence: false,
      };
    }

    const rawScore = Math.round(betaMean(capState.alpha, capState.beta) * 100);
    const score = AntiGamingValidator.applySimulationCeiling(
      rawScore, capState.hasRealApplicationEvidence
    );

    return {
      capabilityId,
      score,
      rawScore,
      confidence: calculateConfidence(capState.evidenceLog),
      confidenceInterval: betaConfidenceInterval(capState.alpha, capState.beta),
      dreyfusStage: getDreyfusStage(score),
      trend: calculateTrend(this.state.snapshotHistory, capabilityId),
      evidenceCount: capState.evidenceLog.length,
      kolbCycle: { ...capState.kolbCycle },
      hasRealApplicationEvidence: capState.hasRealApplicationEvidence,
    };
  }

  /**
   * 获取所有能力的评分
   */
  getAllScores() {
    const scores = {};
    Object.keys(this.state.capabilities).forEach(capId => {
      scores[capId] = this.getCapabilityScore(capId);
    });
    return scores;
  }

  /**
   * 获取完整能力报告
   */
  getFullReport() {
    const allScores = this.getAllScores();
    const capIds = Object.keys(allScores);

    // 按分数排序
    const sorted = capIds
      .map(id => allScores[id])
      .sort((a, b) => b.score - a.score);

    const strengths = sorted.filter(s => s.score >= 70).slice(0, 3);
    const weaknesses = sorted.filter(s => s.score < 50).slice(-3).reverse();

    // 计算总体 Kolb 完成度
    const kolbCompletion = this._calculateOverallKolbCompletion();

    // 总学习时长
    const totalHours = Math.round(this.state.totalLearningMinutes / 6) / 10; // 保留1位小数

    // 总体分数变化（基于快照历史）
    const overallTrend = this._calculateOverallTrend();

    return {
      capabilities: allScores,
      summary: {
        strengths: strengths.map(s => s.capabilityId),
        weaknesses: weaknesses.map(s => s.capabilityId),
        averageScore: capIds.length > 0
          ? Math.round(sorted.reduce((sum, s) => sum + s.score, 0) / capIds.length)
          : 0,
        averageConfidence: capIds.length > 0
          ? Math.round(sorted.reduce((sum, s) => sum + s.confidence, 0) / capIds.length * 100) / 100
          : 0,
      },
      kolbCompletion,
      totalLearningHours: totalHours,
      overallTrend,
      snapshotHistory: this.state.snapshotHistory,
      lastUpdated: this.state.lastUpdated,
    };
  }

  /**
   * 检查是否应触发重新评估
   *
   * 对比当前贝叶斯估计值与存储的评估结果，
   * 如果任何能力偏移超过 15 分（0.15 × 100），触发建议。
   *
   * @param {Object} assessmentResults - { [capabilityId]: number (0-100) }
   * @returns {{ triggered: boolean, capabilities: string[], reason: string }}
   */
  checkReassessmentTrigger(assessmentResults) {
    if (!assessmentResults || typeof assessmentResults !== 'object') {
      return { triggered: false, capabilities: [], reason: '' };
    }

    const THRESHOLD = 15;
    const shifted = [];

    for (const [capId, beiScore] of Object.entries(assessmentResults)) {
      if (beiScore == null) continue;
      const capState = this.state.capabilities[capId];
      if (!capState || capState.evidenceLog.length === 0) continue;

      const currentScore = this._getScore(capState);
      if (Math.abs(currentScore - beiScore) >= THRESHOLD) {
        shifted.push(capId);
      }
    }

    if (shifted.length === 0) {
      return { triggered: false, capabilities: [], reason: '' };
    }

    return {
      triggered: true,
      capabilities: shifted,
      reason: `${shifted.length}项能力偏移超过${THRESHOLD}分`,
    };
  }

  /**
   * 保存当前分数快照（建议每天或每次重要事件后调用）
   */
  takeSnapshot() {
    const scores = {};
    Object.keys(this.state.capabilities).forEach(capId => {
      scores[capId] = this.getCapabilityScore(capId).score;
    });

    this.state.snapshotHistory.push({
      date: new Date().toISOString().slice(0, 10),
      timestamp: Date.now(),
      scores,
    });

    // 保留最近 90 天快照
    const cutoff = Date.now() - 90 * 86400000;
    this.state.snapshotHistory = this.state.snapshotHistory.filter(
      s => s.timestamp > cutoff
    );
  }

  /**
   * 应用时间衰减（建议每天调用一次）
   * 重新计算所有能力的 alpha/beta，考虑证据时效
   */
  applyTimeDecay() {
    Object.values(this.state.capabilities).forEach(capState => {
      if (capState.evidenceLog.length === 0) return;

      // 从先验重新开始
      const originalAlpha = capState.alpha;
      const originalBeta = capState.beta;

      // 找到最初的先验（没有证据时的 alpha/beta）
      // 近似：从总量中减去所有证据的贡献
      let totalPositive = 0;
      let totalNegative = 0;
      capState.evidenceLog.forEach(e => {
        const decay = timeDecayFactor(e.timestamp);
        const contribution = e.weight * 2 * decay;
        if (e.score === null || e.score >= 6) {
          totalPositive += contribution;
        } else {
          totalNegative += contribution;
        }
      });

      // 重建 alpha/beta，保持先验不衰减
      const priorAlpha = Math.max(1, originalAlpha - totalPositive);
      const priorBeta = Math.max(1, originalBeta - totalNegative);

      capState.alpha = priorAlpha + totalPositive;
      capState.beta = priorBeta + totalNegative;
    });
  }

  // ============================================================
  // 知识-应用匹配验证
  // ============================================================

  /**
   * 检查知识学习是否在 7 天内有对应的应用行为
   * 如果没有，将知识证据的权重归零
   */
  validateKnowledgeApplication() {
    const windowMs = ANTI_GAMING.knowledgeApplicationWindowDays * 86400000;
    const now = Date.now();

    Object.values(this.state.capabilities).forEach(capState => {
      capState.evidenceLog.forEach(evidence => {
        if (evidence.category !== EventCategory.KNOWLEDGE) return;
        if (evidence.weight === 0) return; // 已归零

        const deadline = evidence.timestamp + windowMs;
        if (now <= deadline) return; // 还在窗口期内

        // 检查是否有后续应用证据
        const hasApplication = capState.evidenceLog.some(e =>
          e.timestamp > evidence.timestamp &&
          e.timestamp <= deadline &&
          (e.category === EventCategory.SIMULATION || e.category === EventCategory.REAL_APPLICATION)
        );

        if (!hasApplication) {
          // 从 alpha 中减去此证据的贡献
          const contribution = evidence.weight * 2;
          capState.alpha = Math.max(1, capState.alpha - contribution);
          evidence.weight = 0; // 标记已归零
        }
      });
    });
  }

  // ============================================================
  // 内部辅助方法
  // ============================================================

  _getOrCreateCapState(capabilityId) {
    if (!this.state.capabilities[capabilityId]) {
      this.state.capabilities[capabilityId] = this._createEmptyCapabilityState(capabilityId);
    }
    return this.state.capabilities[capabilityId];
  }

  _getScore(capState) {
    const rawScore = Math.round(betaMean(capState.alpha, capState.beta) * 100);
    return AntiGamingValidator.applySimulationCeiling(
      rawScore, capState.hasRealApplicationEvidence
    );
  }

  _isKolbCycleComplete(kolbCycle) {
    return KOLB_PHASES.every(phase => kolbCycle[phase]);
  }

  _calculateOverallKolbCompletion() {
    const caps = Object.values(this.state.capabilities);
    if (caps.length === 0) return { phases: {}, completionRate: 0, totalCycles: 0 };

    const phaseCount = { learn: 0, practice: 0, act: 0, reflect: 0 };
    let totalCycles = 0;

    caps.forEach(cap => {
      KOLB_PHASES.forEach(phase => {
        if (cap.kolbCycle[phase]) phaseCount[phase]++;
      });
      totalCycles += cap.kolbCycle.completedCycles;
    });

    const total = caps.length;
    return {
      phases: {
        learn: Math.round(phaseCount.learn / total * 100),
        practice: Math.round(phaseCount.practice / total * 100),
        act: Math.round(phaseCount.act / total * 100),
        reflect: Math.round(phaseCount.reflect / total * 100),
      },
      completionRate: Math.round(
        KOLB_PHASES.reduce((sum, p) => sum + phaseCount[p], 0) / (total * 4) * 100
      ),
      totalCycles,
    };
  }

  _calculateOverallTrend() {
    const history = this.state.snapshotHistory;
    if (history.length < 2) return { direction: 'stable', delta: 0 };

    const recent = history.slice(-7);
    const capIds = Object.keys(this.state.capabilities);
    if (capIds.length === 0) return { direction: 'stable', delta: 0 };

    const firstAvg = capIds.reduce((sum, id) =>
      sum + (recent[0].scores?.[id] ?? 0), 0) / capIds.length;
    const lastAvg = capIds.reduce((sum, id) =>
      sum + (recent[recent.length - 1].scores?.[id] ?? 0), 0) / capIds.length;

    const delta = Math.round(lastAvg - firstAvg);
    const direction = delta >= 3 ? 'rising' : delta <= -3 ? 'declining' : 'stable';

    return { direction, delta };
  }
}

// ============================================================
// 单例管理
// ============================================================

let _engine = null;

/**
 * 获取 CompetencyDynamicsEngine 单例
 * @returns {CompetencyDynamicsEngine}
 */
export function getCompetencyEngine() {
  if (!_engine) {
    _engine = new CompetencyDynamicsEngine();
  }
  return _engine;
}

/**
 * 重置单例（测试用）
 */
export function resetCompetencyEngine() {
  _engine = null;
}
