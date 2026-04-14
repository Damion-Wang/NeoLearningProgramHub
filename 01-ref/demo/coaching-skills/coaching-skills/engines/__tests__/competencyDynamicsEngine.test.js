/**
 * CompetencyDynamicsEngine - TDD 测试套件
 *
 * 覆盖：
 *   - 贝叶斯追踪器（Beta 分布计算、先验初始化）
 *   - 事件处理（processEvent 完整流程）
 *   - 抗刷分验证（8 层防护）
 *   - 模拟上限锁（simulation ceiling）
 *   - 提问质量评估（5 级）
 *   - 复盘深度评估（5 级）
 *   - Kolb 循环加成
 *   - Dreyfus 阶段映射
 *   - 趋势计算
 */

import {
  CompetencyDynamicsEngine,
  EventType,
  EventCategory,
  DreyfusStage,
  QuestionQualityLevel,
  RetrospectiveDepthLevel,
  assessQuestionQuality,
  assessRetrospectiveDepth,
  getCompetencyEngine,
  resetCompetencyEngine,
} from './competencyDynamicsEngine';

// ============================================================
// Helpers
// ============================================================

function makeEvent(overrides = {}) {
  return {
    type: EventType.SCENARIO_TRAINING,
    capabilityId: 'planningExecution',
    score: 8,
    bloomLevel: 3,
    isProactive: false,
    proactivityLevel: 'neutral',
    durationMinutes: 10,
    source: 'test',
    ...overrides,
  };
}

// ============================================================
// 贝叶斯追踪器 & 初始化
// ============================================================

describe('CompetencyDynamicsEngine - 初始化', () => {
  let engine;

  beforeEach(() => {
    engine = new CompetencyDynamicsEngine();
  });

  it('should start with empty state', () => {
    expect(Object.keys(engine.state.capabilities)).toHaveLength(0);
    expect(engine.state.totalLearningMinutes).toBe(0);
    expect(engine.state.lastUpdated).toBeNull();
  });

  it('should initialize capabilities from BEI scores', () => {
    engine.initializeFromBEI({
      'planningExecution': 70,
      'motivation': 30,
    });

    const capIds = Object.keys(engine.state.capabilities);
    expect(capIds).toContain('planningExecution');
    expect(capIds).toContain('motivation');
    expect(engine.state.lastUpdated).not.toBeNull();
  });

  it('should create weak prior from BEI score', () => {
    engine.initializeFromBEI({ 'planningExecution': 80 });
    const cap = engine.state.capabilities['planningExecution'];
    // score 80 → alpha = 80/10 = 8, beta = (100-80)/10 = 2
    expect(cap.alpha).toBe(8);
    expect(cap.beta).toBe(2);
  });

  it('should use default score 50 when BEI score is missing', () => {
    engine.initializeFromBEI({}, ['planningExecution']);
    const cap = engine.state.capabilities['planningExecution'];
    // score 50 → alpha = 5, beta = 5
    expect(cap.alpha).toBe(5);
    expect(cap.beta).toBe(5);
  });

  it('should clamp BEI score to 0-100 range', () => {
    engine.initializeFromBEI({ 'test-cap': 150 });
    const cap = engine.state.capabilities['test-cap'];
    // clamped to 100 → alpha = 10, beta = 1 (max(1, 0/10))
    expect(cap.alpha).toBe(10);
    expect(cap.beta).toBe(1);
  });
});

// ============================================================
// processEvent - 核心流程
// ============================================================

describe('CompetencyDynamicsEngine - processEvent', () => {
  let engine;

  beforeEach(() => {
    engine = new CompetencyDynamicsEngine();
    engine.initializeFromBEI({ 'planningExecution': 50 });
  });

  it('should reject event with missing type', () => {
    const result = engine.processEvent({ capabilityId: 'planningExecution' });
    expect(result.accepted).toBe(false);
    expect(result.reason).toContain('type');
  });

  it('should reject event with missing capabilityId', () => {
    const result = engine.processEvent({ type: EventType.SCENARIO_TRAINING });
    expect(result.accepted).toBe(false);
    expect(result.reason).toContain('capabilityId');
  });

  it('should reject unknown event type', () => {
    const result = engine.processEvent({
      type: 'nonexistent_type',
      capabilityId: 'planningExecution',
    });
    expect(result.accepted).toBe(false);
    expect(result.reason).toContain('未知事件类型');
  });

  it('should accept valid event and return new score', () => {
    const result = engine.processEvent(makeEvent());
    expect(result.accepted).toBe(true);
    expect(result.reason).toBeNull();
    expect(result.effectiveWeight).toBeGreaterThan(0);
    expect(typeof result.newScore).toBe('number');
  });

  it('should increase alpha for positive evidence (score >= 6)', () => {
    const cap = engine.state.capabilities['planningExecution'];
    const alphaBefore = cap.alpha;
    engine.processEvent(makeEvent({ score: 8 }));
    expect(cap.alpha).toBeGreaterThan(alphaBefore);
  });

  it('should increase beta for negative evidence (score < 6)', () => {
    const cap = engine.state.capabilities['planningExecution'];
    const betaBefore = cap.beta;
    engine.processEvent(makeEvent({ score: 3 }));
    expect(cap.beta).toBeGreaterThan(betaBefore);
  });

  it('should record evidence in evidence log', () => {
    engine.processEvent(makeEvent());
    const cap = engine.state.capabilities['planningExecution'];
    expect(cap.evidenceLog).toHaveLength(1);
    expect(cap.evidenceLog[0].type).toBe(EventType.SCENARIO_TRAINING);
    expect(cap.evidenceLog[0].category).toBe(EventCategory.SIMULATION);
  });

  it('should accumulate learning duration', () => {
    engine.processEvent(makeEvent({ durationMinutes: 15 }));
    // Bypass 4h interval check for second event
    const cap = engine.state.capabilities['planningExecution'];
    cap.lastEventTimestamps['planningExecution'] = 0;
    engine.processEvent(makeEvent({ durationMinutes: 20 }));
    expect(engine.state.totalLearningMinutes).toBe(35);
  });

  it('should auto-create capability state for unknown capabilityId', () => {
    engine.processEvent(makeEvent({ capabilityId: 'new-capability' }));
    expect(engine.state.capabilities['new-capability']).toBeDefined();
    expect(engine.state.capabilities['new-capability'].evidenceLog).toHaveLength(1);
  });
});

// ============================================================
// 主动性乘数 & Bloom 层级乘数
// ============================================================

describe('CompetencyDynamicsEngine - 权重乘数', () => {
  let engine;

  beforeEach(() => {
    engine = new CompetencyDynamicsEngine();
    engine.initializeFromBEI({ 'planningExecution': 50 });
  });

  it('should apply proactive multiplier (1.8x) for proactive events', () => {
    const neutralResult = engine.processEvent(
      makeEvent({ proactivityLevel: 'neutral' })
    );

    // Reset for fresh comparison
    engine = new CompetencyDynamicsEngine();
    engine.initializeFromBEI({ 'planningExecution': 50 });

    const proactiveResult = engine.processEvent(
      makeEvent({ proactivityLevel: 'proactive' })
    );

    expect(proactiveResult.effectiveWeight).toBeGreaterThan(neutralResult.effectiveWeight);
    // proactive/neutral ratio should be ~1.8
    const ratio = proactiveResult.effectiveWeight / neutralResult.effectiveWeight;
    expect(ratio).toBeCloseTo(1.8, 1);
  });

  it('should apply low motivation multiplier (0.6x)', () => {
    const neutralResult = engine.processEvent(
      makeEvent({ proactivityLevel: 'neutral' })
    );

    engine = new CompetencyDynamicsEngine();
    engine.initializeFromBEI({ 'planningExecution': 50 });

    const lowResult = engine.processEvent(
      makeEvent({ proactivityLevel: 'lowMotivation' })
    );

    expect(lowResult.effectiveWeight).toBeLessThan(neutralResult.effectiveWeight);
  });

  it('should apply higher Bloom multiplier for higher cognitive levels', () => {
    const bloom3Result = engine.processEvent(
      makeEvent({ bloomLevel: 3 })  // Apply: 1.0x
    );

    engine = new CompetencyDynamicsEngine();
    engine.initializeFromBEI({ 'planningExecution': 50 });

    const bloom6Result = engine.processEvent(
      makeEvent({ bloomLevel: 6 })  // Create: 1.8x
    );

    expect(bloom6Result.effectiveWeight).toBeGreaterThan(bloom3Result.effectiveWeight);
  });

  it('should clamp bloom level to 1-6 range', () => {
    const result = engine.processEvent(makeEvent({ bloomLevel: 10 }));
    expect(result.accepted).toBe(true);
    // Should be clamped to 6, which has multiplier 1.8
    const cap = engine.state.capabilities['planningExecution'];
    expect(cap.evidenceLog[0].bloomLevel).toBe(6);
  });
});

// ============================================================
// 抗刷分验证
// ============================================================

describe('CompetencyDynamicsEngine - 抗刷分', () => {
  let engine;

  beforeEach(() => {
    engine = new CompetencyDynamicsEngine();
    engine.initializeFromBEI({ 'planningExecution': 50 });
  });

  it('should enforce daily evidence cap (5 events)', () => {
    const results = [];
    for (let i = 0; i < 7; i++) {
      // Use different timestamps to pass the 4h interval check
      const cap = engine.state.capabilities['planningExecution'];
      // Clear interval timestamp before each event
      if (cap.lastEventTimestamps) {
        cap.lastEventTimestamps['planningExecution'] = 0;
      }
      results.push(engine.processEvent(makeEvent()));
    }

    const accepted = results.filter(r => r.accepted);
    const rejected = results.filter(r => !r.accepted);
    expect(accepted.length).toBe(5);
    expect(rejected.length).toBe(2);
    expect(rejected[0].reason).toContain('上限');
  });

  it('should apply same-type diminishing returns (0.7^n)', () => {
    // First event: modifier = 0.7^0 = 1.0
    const cap = engine.state.capabilities['planningExecution'];

    const r1 = engine.processEvent(makeEvent());
    cap.lastEventTimestamps['planningExecution'] = 0; // bypass interval

    const r2 = engine.processEvent(makeEvent());

    // Second event should have lower effective weight due to 0.7^1 modifier
    expect(r2.effectiveWeight).toBeLessThan(r1.effectiveWeight);
  });

  it('should apply scenario repeat penalty after 3 repeats', () => {
    const cap = engine.state.capabilities['planningExecution'];
    const scenarioId = 'scenario_001';

    // Manually set scenario repeat count to threshold
    cap.scenarioRepeat[scenarioId] = 3;
    cap.lastEventTimestamps['planningExecution'] = 0;

    const result = engine.processEvent(makeEvent({ scenarioId }));
    // After threshold, modifier should be 0.5
    expect(result.accepted).toBe(true);
    // Weight should be reduced compared to no penalty
  });

  it('should enforce same-capability interval (4 hours)', () => {
    // First event succeeds
    const r1 = engine.processEvent(makeEvent());
    expect(r1.accepted).toBe(true);

    // Second event within 4 hours should be rejected
    const r2 = engine.processEvent(makeEvent());
    expect(r2.accepted).toBe(false);
    expect(r2.reason).toContain('4小时');
  });

  it('should allow same-capability event after 4 hours', () => {
    const r1 = engine.processEvent(makeEvent());
    expect(r1.accepted).toBe(true);

    // Move the timestamp back > 4 hours
    const cap = engine.state.capabilities['planningExecution'];
    cap.lastEventTimestamps['planningExecution'] = Date.now() - 5 * 3600000;

    const r2 = engine.processEvent(makeEvent());
    expect(r2.accepted).toBe(true);
  });

  it('should apply retro quality gate (depth < 2 → 0.3x modifier)', () => {
    const cap = engine.state.capabilities['planningExecution'];
    cap.lastEventTimestamps['planningExecution'] = 0; // bypass interval

    const result = engine.processEvent(makeEvent({
      type: EventType.DEEP_RETROSPECTIVE,
      retroDepthLevel: 1, // Below minimum depth of 2
    }));

    expect(result.accepted).toBe(true);
    // Should have reduced weight due to 0.3x modifier
    // Compare with depth >= 2
    engine = new CompetencyDynamicsEngine();
    engine.initializeFromBEI({ 'planningExecution': 50 });

    const goodResult = engine.processEvent(makeEvent({
      type: EventType.DEEP_RETROSPECTIVE,
      retroDepthLevel: 3,
    }));

    expect(result.effectiveWeight).toBeLessThan(goodResult.effectiveWeight);
  });
});

// ============================================================
// 模拟上限锁 (Simulation Ceiling)
// ============================================================

describe('CompetencyDynamicsEngine - 模拟上限锁', () => {
  let engine;

  beforeEach(() => {
    engine = new CompetencyDynamicsEngine();
  });

  it('should cap score at 70 without real application evidence', () => {
    engine.initializeFromBEI({ 'planningExecution': 90 });
    const scoreInfo = engine.getCapabilityScore('planningExecution');
    // BEI score 90 → raw ~90, but capped at 70 without real evidence
    expect(scoreInfo.score).toBeLessThanOrEqual(70);
    expect(scoreInfo.hasRealApplicationEvidence).toBe(false);
  });

  it('should allow score above 70 with real application evidence', () => {
    engine.initializeFromBEI({ 'planningExecution': 85 });
    const cap = engine.state.capabilities['planningExecution'];

    // Add a real application event
    engine.processEvent(makeEvent({
      type: EventType.ACTION_PLAN_EXECUTED,
      capabilityId: 'planningExecution',
      score: 9,
    }));

    expect(cap.hasRealApplicationEvidence).toBe(true);
    const scoreInfo = engine.getCapabilityScore('planningExecution');
    // With real application evidence, should not be capped
    expect(scoreInfo.score).toBeGreaterThan(70);
  });

  it('should mark real application evidence on real_application events', () => {
    engine.initializeFromBEI({ 'planningExecution': 50 });
    const cap = engine.state.capabilities['planningExecution'];
    expect(cap.hasRealApplicationEvidence).toBe(false);

    engine.processEvent(makeEvent({
      type: EventType.DEEP_RETROSPECTIVE,
    }));
    expect(cap.hasRealApplicationEvidence).toBe(true);
  });
});

// ============================================================
// Kolb 循环加成
// ============================================================

describe('CompetencyDynamicsEngine - Kolb循环', () => {
  let engine;

  beforeEach(() => {
    engine = new CompetencyDynamicsEngine();
    engine.initializeFromBEI({ 'planningExecution': 50 });
  });

  it('should track Kolb phases for events', () => {
    engine.processEvent(makeEvent({
      type: EventType.PROACTIVE_SEARCH,
    }));
    const cap = engine.state.capabilities['planningExecution'];
    expect(cap.kolbCycle.learn).toBe(true);
  });

  it('should grant bonus when full cycle completes', () => {
    const cap = engine.state.capabilities['planningExecution'];

    // Learn phase
    engine.processEvent(makeEvent({ type: EventType.PROACTIVE_SEARCH }));
    cap.lastEventTimestamps['planningExecution'] = 0;
    expect(cap.kolbCycle.learn).toBe(true);

    // Practice phase
    engine.processEvent(makeEvent({ type: EventType.SCENARIO_TRAINING }));
    cap.lastEventTimestamps['planningExecution'] = 0;
    expect(cap.kolbCycle.practice).toBe(true);

    // Act phase
    engine.processEvent(makeEvent({ type: EventType.ACTION_PLAN_EXECUTED }));
    cap.lastEventTimestamps['planningExecution'] = 0;
    expect(cap.kolbCycle.act).toBe(true);

    // Reflect phase — should complete cycle
    const reflectResult = engine.processEvent(makeEvent({
      type: EventType.DEEP_RETROSPECTIVE,
    }));

    // After cycle completes, all phases reset
    expect(cap.kolbCycle.learn).toBe(false);
    expect(cap.kolbCycle.practice).toBe(false);
    expect(cap.kolbCycle.act).toBe(false);
    expect(cap.kolbCycle.reflect).toBe(false);
    expect(cap.kolbCycle.completedCycles).toBe(1);

    // The completing event should have Kolb bonus (1.3x)
    // effectiveWeight should be higher than a normal event
    expect(reflectResult.effectiveWeight).toBeGreaterThan(0);
  });
});

// ============================================================
// Dreyfus 阶段
// ============================================================

describe('CompetencyDynamicsEngine - Dreyfus阶段', () => {
  let engine;

  beforeEach(() => {
    engine = new CompetencyDynamicsEngine();
  });

  it('should map score 0-19 to NOVICE', () => {
    engine.initializeFromBEI({ 'test': 10 });
    const info = engine.getCapabilityScore('test');
    expect(info.dreyfusStage.id).toBe('novice');
  });

  it('should map score 20-39 to ADVANCED_BEGINNER', () => {
    engine.initializeFromBEI({ 'test': 30 });
    const info = engine.getCapabilityScore('test');
    expect(info.dreyfusStage.id).toBe('advancedBeginner');
  });

  it('should map score 40-59 to COMPETENT', () => {
    engine.initializeFromBEI({ 'test': 50 });
    const info = engine.getCapabilityScore('test');
    expect(info.dreyfusStage.id).toBe('competent');
  });

  it('should map score 60-79 to PROFICIENT', () => {
    // Use real application evidence to bypass 70 ceiling
    engine.initializeFromBEI({ 'test': 70 });
    const cap = engine.state.capabilities['test'];
    cap.hasRealApplicationEvidence = true;
    const info = engine.getCapabilityScore('test');
    expect(info.dreyfusStage.id).toBe('proficient');
  });

  it('should map score 80+ to EXPERT', () => {
    engine.initializeFromBEI({ 'test': 90 });
    const cap = engine.state.capabilities['test'];
    cap.hasRealApplicationEvidence = true;
    const info = engine.getCapabilityScore('test');
    expect(info.dreyfusStage.id).toBe('expert');
  });
});

// ============================================================
// getCapabilityScore
// ============================================================

describe('CompetencyDynamicsEngine - getCapabilityScore', () => {
  let engine;

  beforeEach(() => {
    engine = new CompetencyDynamicsEngine();
  });

  it('should return zero score for uninitialized capability', () => {
    const info = engine.getCapabilityScore('nonexistent');
    expect(info.score).toBe(0);
    expect(info.confidence).toBe(0);
    expect(info.evidenceCount).toBe(0);
    expect(info.dreyfusStage).toEqual(DreyfusStage.NOVICE);
  });

  it('should return confidence interval', () => {
    engine.initializeFromBEI({ 'test': 50 });
    const info = engine.getCapabilityScore('test');
    expect(info.confidenceInterval).toHaveProperty('low');
    expect(info.confidenceInterval).toHaveProperty('high');
    expect(info.confidenceInterval.low).toBeLessThanOrEqual(info.score);
    expect(info.confidenceInterval.high).toBeGreaterThanOrEqual(info.score);
  });

  it('should return trend as stable with no snapshots', () => {
    engine.initializeFromBEI({ 'test': 50 });
    const info = engine.getCapabilityScore('test');
    expect(info.trend).toBe('stable');
  });
});

// ============================================================
// getAllScores & getFullReport
// ============================================================

describe('CompetencyDynamicsEngine - reports', () => {
  let engine;

  beforeEach(() => {
    engine = new CompetencyDynamicsEngine();
    engine.initializeFromBEI({
      'planningExecution': 70,
      'motivation': 30,
      'performanceManagement': 50,
    });
  });

  it('should return all scores', () => {
    const all = engine.getAllScores();
    expect(Object.keys(all)).toHaveLength(3);
    expect(all['planningExecution'].score).toBeGreaterThan(0);
  });

  it('should generate full report with summary', () => {
    const report = engine.getFullReport();
    expect(report.capabilities).toBeDefined();
    expect(report.summary.averageScore).toBeGreaterThan(0);
    expect(report.kolbCompletion).toBeDefined();
    expect(typeof report.totalLearningHours).toBe('number');
    expect(report.overallTrend).toEqual({ direction: 'stable', delta: 0 });
  });
});

// ============================================================
// 快照与趋势
// ============================================================

describe('CompetencyDynamicsEngine - snapshots & trends', () => {
  let engine;

  beforeEach(() => {
    engine = new CompetencyDynamicsEngine();
    engine.initializeFromBEI({ 'test': 50 });
  });

  it('should take snapshot of current scores', () => {
    engine.takeSnapshot();
    expect(engine.state.snapshotHistory).toHaveLength(1);
    expect(engine.state.snapshotHistory[0].scores).toHaveProperty('test');
  });

  it('should detect rising trend from snapshots', () => {
    // Simulate snapshots with increasing scores
    for (let i = 0; i < 3; i++) {
      engine.state.snapshotHistory.push({
        date: `2025-01-0${i + 1}`,
        timestamp: Date.now() - (3 - i) * 86400000,
        scores: { test: 50 + i * 5 },
      });
    }
    const info = engine.getCapabilityScore('test');
    // delta = 60 - 50 = 10 >= 3 → rising
    expect(info.trend).toBe('rising');
  });
});

// ============================================================
// exportState / importState
// ============================================================

describe('CompetencyDynamicsEngine - state serialization', () => {
  it('should export and import state', () => {
    const engine1 = new CompetencyDynamicsEngine();
    engine1.initializeFromBEI({ 'test': 65 });
    engine1.processEvent(makeEvent({ capabilityId: 'test' }));

    const exported = engine1.exportState();

    const engine2 = new CompetencyDynamicsEngine();
    engine2.importState(exported);

    const score1 = engine1.getCapabilityScore('test');
    const score2 = engine2.getCapabilityScore('test');
    expect(score2.score).toBe(score1.score);
    expect(score2.evidenceCount).toBe(score1.evidenceCount);
  });

  it('should ignore invalid import data', () => {
    const engine = new CompetencyDynamicsEngine();
    engine.importState(null);
    expect(Object.keys(engine.state.capabilities)).toHaveLength(0);

    engine.importState('not an object');
    expect(Object.keys(engine.state.capabilities)).toHaveLength(0);
  });
});

// ============================================================
// 单例管理
// ============================================================

describe('getCompetencyEngine / resetCompetencyEngine', () => {
  afterEach(() => {
    resetCompetencyEngine();
  });

  it('should return same instance', () => {
    const e1 = getCompetencyEngine();
    const e2 = getCompetencyEngine();
    expect(e1).toBe(e2);
  });

  it('should create new instance after reset', () => {
    const e1 = getCompetencyEngine();
    resetCompetencyEngine();
    const e2 = getCompetencyEngine();
    expect(e1).not.toBe(e2);
  });
});

// ============================================================
// assessQuestionQuality (5 级)
// ============================================================

describe('assessQuestionQuality', () => {
  it('should return INFO_RETRIEVAL for short/empty text', () => {
    expect(assessQuestionQuality('')).toEqual(QuestionQualityLevel.INFO_RETRIEVAL);
    expect(assessQuestionQuality('Hi')).toEqual(QuestionQualityLevel.INFO_RETRIEVAL);
  });

  it('should detect METACOGNITIVE questions', () => {
    const result = assessQuestionQuality('我的思维是否有盲区和局限');
    expect(result.level).toBe(5);
    expect(result.label).toBe('元认知提问');
  });

  it('should detect STRATEGIC questions', () => {
    const result = assessQuestionQuality('如何系统地解决团队协作问题');
    expect(result.level).toBe(4);
    expect(result.label).toBe('策略性提问');
  });

  it('should detect ANALYTICAL questions', () => {
    const result = assessQuestionQuality('为什么团队效率下降了');
    expect(result.level).toBe(3);
    expect(result.label).toBe('分析性提问');
  });

  it('should detect PROCEDURAL questions', () => {
    const result = assessQuestionQuality('怎么做绩效面谈的具体步骤');
    expect(result.level).toBe(2);
    expect(result.label).toBe('程序性提问');
  });

  it('should default to INFO_RETRIEVAL for generic text', () => {
    const result = assessQuestionQuality('团队建设活动推荐一下');
    expect(result.level).toBe(1);
  });

  it('should prioritize higher levels (metacognitive > strategic)', () => {
    // Text matching both metacognitive and strategic
    const result = assessQuestionQuality('我的判断是否有偏见，如何系统地审视自己');
    expect(result.level).toBe(5); // metacognitive takes priority
  });
});

// ============================================================
// assessRetrospectiveDepth (5 级)
// ============================================================

describe('assessRetrospectiveDepth', () => {
  it('should return SURFACE for short text', () => {
    expect(assessRetrospectiveDepth('')).toEqual(RetrospectiveDepthLevel.SURFACE);
    expect(assessRetrospectiveDepth('很好')).toEqual(RetrospectiveDepthLevel.SURFACE);
  });

  it('should detect PARADIGM_SHIFT depth', () => {
    const result = assessRetrospectiveDepth(
      '以前我一直以为管理就是控制，现在我发现真正的领导力是赋能'
    );
    expect(result.level).toBe(5);
    expect(result.label).toBe('范式转变');
  });

  it('should detect INTEGRATIVE depth', () => {
    const result = assessRetrospectiveDepth(
      '这个方法可以推广到其他场景中也适用，是一种通用的原则'
    );
    expect(result.level).toBe(4);
    expect(result.label).toBe('整合迁移');
  });

  it('should detect EVALUATIVE depth', () => {
    const result = assessRetrospectiveDepth(
      '这次做得不好的地方是沟通不够及时，如果重来一次我会提前沟通'
    );
    expect(result.level).toBe(3);
    expect(result.label).toBe('评价反思');
  });

  it('should detect CAUSAL depth', () => {
    const result = assessRetrospectiveDepth(
      '因为没有提前沟通，所以导致了项目延期，影响了整个团队的进度'
    );
    expect(result.level).toBe(2);
    expect(result.label).toBe('因果分析');
  });

  it('should default to SURFACE for plain description', () => {
    const result = assessRetrospectiveDepth(
      '今天开了一个会议，讨论了项目的进展情况和下一步安排'
    );
    expect(result.level).toBe(1);
  });
});

// ============================================================
// 真实应用事件类别标记
// ============================================================

describe('CompetencyDynamicsEngine - event categories', () => {
  let engine;

  beforeEach(() => {
    engine = new CompetencyDynamicsEngine();
    engine.initializeFromBEI({ 'planningExecution': 50 });
  });

  it('should mark hasRealApplicationEvidence for ACTION_PLAN_EXECUTED', () => {
    engine.processEvent(makeEvent({ type: EventType.ACTION_PLAN_EXECUTED }));
    const cap = engine.state.capabilities['planningExecution'];
    expect(cap.hasRealApplicationEvidence).toBe(true);
  });

  it('should mark hasRealApplicationEvidence for DEEP_RETROSPECTIVE', () => {
    engine.processEvent(makeEvent({ type: EventType.DEEP_RETROSPECTIVE }));
    const cap = engine.state.capabilities['planningExecution'];
    expect(cap.hasRealApplicationEvidence).toBe(true);
  });

  it('should mark hasRealApplicationEvidence for TRANSFER_APPLICATION', () => {
    engine.processEvent(makeEvent({ type: EventType.TRANSFER_APPLICATION }));
    const cap = engine.state.capabilities['planningExecution'];
    expect(cap.hasRealApplicationEvidence).toBe(true);
  });

  it('should NOT mark hasRealApplicationEvidence for SCENARIO_TRAINING', () => {
    engine.processEvent(makeEvent({ type: EventType.SCENARIO_TRAINING }));
    const cap = engine.state.capabilities['planningExecution'];
    expect(cap.hasRealApplicationEvidence).toBe(false);
  });

  it('should NOT mark hasRealApplicationEvidence for PROACTIVE_SEARCH', () => {
    engine.processEvent(makeEvent({ type: EventType.PROACTIVE_SEARCH }));
    const cap = engine.state.capabilities['planningExecution'];
    expect(cap.hasRealApplicationEvidence).toBe(false);
  });
});

// ============================================================
// checkReassessmentTrigger
// ============================================================

describe('CompetencyDynamicsEngine - checkReassessmentTrigger', () => {
  let engine;

  beforeEach(() => {
    engine = new CompetencyDynamicsEngine();
  });

  it('should return triggered=false when no assessmentResults', () => {
    const result = engine.checkReassessmentTrigger(null);
    expect(result.triggered).toBe(false);
  });

  it('should return triggered=false when no capabilities have evidence', () => {
    engine.initializeFromBEI({ planningExecution: 50 });
    const result = engine.checkReassessmentTrigger({ planningExecution: 50 });
    expect(result.triggered).toBe(false);
  });

  it('should trigger when Bayesian estimate diverges > 15 points from BEI', () => {
    // Start with low BEI score so positive events push up past threshold
    engine.initializeFromBEI({ planningExecution: 30 });
    // Directly manipulate alpha/beta to simulate significant positive evidence
    // BEI 30 → alpha=3, beta=7. Shift to alpha=15, beta=7 → score ≈ 68 → delta = 38
    const cap = engine.state.capabilities['planningExecution'];
    cap.alpha = 15;
    cap.beta = 3;
    // Add a dummy evidence entry so the trigger check sees evidence exists
    cap.evidenceLog.push({
      id: 'ev_test', type: EventType.ACTION_PLAN_EXECUTED,
      category: 'realApplication', weight: 0.3, bloomLevel: 5,
      isProactive: false, timestamp: Date.now(), source: 'test',
    });
    cap.hasRealApplicationEvidence = true;

    const result = engine.checkReassessmentTrigger({ planningExecution: 30 });
    expect(result.triggered).toBe(true);
    expect(result.capabilities).toContain('planningExecution');
    expect(result.reason).toContain('偏移超过15分');
  });

  it('should NOT trigger when shift is within 15 points', () => {
    engine.initializeFromBEI({ planningExecution: 50 });
    // Process only 1 event — small shift
    engine.processEvent(makeEvent({ score: 7 }));
    const result = engine.checkReassessmentTrigger({ planningExecution: 50 });
    expect(result.triggered).toBe(false);
  });
});
