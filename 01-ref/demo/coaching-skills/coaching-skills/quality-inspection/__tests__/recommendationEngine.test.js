/**
 * RecommendationEngine 测试
 */

import { RecommendationEngine } from '../recommendationEngine';

// ─── 辅助函数 ──────────────────────────────────────────────────────────

function buildCleanInspection() {
  return {
    layer1: { status: 'clean', issues: [], score: 1 },
    layer2: null,
    overallScore: 1,
    shouldDeepReview: false,
  };
}

function buildFlaggedInspection() {
  return {
    layer1: {
      status: 'flagged',
      issues: [
        {
          dimension: 'role_drift',
          rule: '角色漂移：AI 越界决策/承诺',
          severity: 'high',
          detail: '第 2 轮 AI 回复匹配越界模式: "我帮你决定"',
          turnIndex: 1,
        },
        {
          dimension: 'talk_ratio_imbalance',
          rule: '话语比失衡：AI 占比 85%',
          severity: 'medium',
          detail: 'AI 850 字 / 用户 150 字',
          turnIndex: null,
        },
      ],
      score: 0.7,
    },
    layer2: {
      status: 'flagged',
      violations: [
        {
          pedagogicalRule: 'strategy_dreyfus_mismatch',
          detail: '新手阶段使用了 IP-03（苏格拉底追问）',
          remediation: '建议替换为结构化程度更高的策略',
          relatedStrategyCode: 'IP-03',
        },
        {
          pedagogicalRule: 'error_correction_missing',
          detail: '检测到 misconception 类错误信号，但未使用对应纠正策略',
          remediation: '建议使用: CG-08（概念转变）',
          relatedStrategyCode: 'CG-08',
        },
      ],
    },
    overallScore: 0.4,
    shouldDeepReview: true,
  };
}

function buildEmptyMiningResult() {
  return {
    sessionId: 'session-1',
    userId: 'user-1',
    signals: {
      challenge: [],
      confusion: [],
      breakthrough: [],
      disengagement: [],
    },
    summary: { totalSignals: 0, hasCritical: false },
    crossSession: null,
  };
}

function buildRichMiningResult() {
  return {
    sessionId: 'session-1',
    userId: 'user-1',
    signals: {
      challenge: [
        { turn: 2, detected: '不同意', handled: false, outcome: 'unresolved' },
        { turn: 6, detected: '有问题', handled: true, outcome: 'resolved' },
      ],
      confusion: [
        { turn: 0, repeatedQueryOn: '授权管理', occurrences: 4, resolved: false },
      ],
      breakthrough: [
        { turn: 8, detected: '原来如此', mastery: { before: 0.3, after: 0.7 } },
      ],
      disengagement: [
        { turn: 10, engagementScore: 0.2, trend: 'declining' },
        { turn: 12, engagementScore: 0.15, trend: 'declining' },
        { turn: 14, engagementScore: 0.1, trend: 'declining' },
      ],
    },
    summary: { totalSignals: 7, hasCritical: true },
    crossSession: {
      persistentDisagreements: [
        {
          concept: '不同意',
          sessions: ['prior-1', 'session-1'],
          recommendation: '学员持续质疑此概念',
        },
      ],
      teachingDesignFlaws: [
        {
          concept: '授权管理',
          sessions: ['prior-1', 'session-1'],
          recommendation: '跨会话持续困惑',
        },
      ],
      breakthroughPatterns: [],
      engagementRisk: true,
      engagementTrend: 'declining',
    },
  };
}

// ============================================================
// strategy_effectiveness 建议
// ============================================================

describe('RecommendationEngine — strategy_effectiveness', () => {
  it('应从 stalemate 问题生成策略效果建议', () => {
    const engine = new RecommendationEngine();
    const inspection = {
      ...buildCleanInspection(),
      layer1: {
        status: 'flagged',
        issues: [{
          dimension: 'stalemate',
          rule: '僵局：连续 5 轮低参与',
          severity: 'medium',
          detail: '从第 3 轮开始',
          turnIndex: 2,
        }],
        score: 0.9,
      },
    };

    const recs = engine.generateRecommendations(inspection, buildEmptyMiningResult(), {});
    const stratRecs = recs.filter(r => r.type === 'strategy_effectiveness');
    expect(stratRecs.length).toBeGreaterThan(0);
    expect(stratRecs[0].priority).toBe('P1');
  });

  it('应从严重脱离信号生成策略效果建议', () => {
    const engine = new RecommendationEngine();
    const mining = {
      ...buildEmptyMiningResult(),
      signals: {
        ...buildEmptyMiningResult().signals,
        disengagement: [
          { turn: 4, engagementScore: 0.2, trend: 'declining' },
          { turn: 6, engagementScore: 0.15, trend: 'declining' },
          { turn: 8, engagementScore: 0.1, trend: 'declining' },
        ],
      },
    };

    const recs = engine.generateRecommendations(buildCleanInspection(), mining, {});
    const stratRecs = recs.filter(r => r.type === 'strategy_effectiveness');
    expect(stratRecs.length).toBeGreaterThan(0);
  });
});

// ============================================================
// error_pattern 建议
// ============================================================

describe('RecommendationEngine — error_pattern', () => {
  it('应从概念矛盾生成错误模式建议', () => {
    const engine = new RecommendationEngine();
    const inspection = {
      ...buildCleanInspection(),
      layer1: {
        status: 'flagged',
        issues: [{
          dimension: 'concept_contradiction',
          rule: '概念矛盾',
          severity: 'high',
          detail: '关于"正确/错误"的表述不一致',
          turnIndex: 3,
        }],
        score: 0.8,
      },
    };

    const recs = engine.generateRecommendations(inspection, buildEmptyMiningResult(), {});
    const errorRecs = recs.filter(r => r.type === 'error_pattern');
    expect(errorRecs.length).toBeGreaterThan(0);
    expect(errorRecs[0].priority).toBe('P0');
  });

  it('应从跨会话持续分歧生成错误模式建议', () => {
    const engine = new RecommendationEngine();
    const recs = engine.generateRecommendations(
      buildCleanInspection(),
      buildRichMiningResult(),
      { tenantId: 'tenant-1' }
    );

    const errorRecs = recs.filter(r => r.type === 'error_pattern');
    expect(errorRecs.length).toBeGreaterThan(0);
    expect(errorRecs.some(r => r.priority === 'P0')).toBe(true);
  });
});

// ============================================================
// content_gap 建议
// ============================================================

describe('RecommendationEngine — content_gap', () => {
  it('应从未解决困惑生成内容缺口建议', () => {
    const engine = new RecommendationEngine();
    const mining = {
      ...buildEmptyMiningResult(),
      signals: {
        ...buildEmptyMiningResult().signals,
        confusion: [
          { turn: 0, repeatedQueryOn: '授权管理', occurrences: 4, resolved: false },
        ],
      },
    };

    const recs = engine.generateRecommendations(buildCleanInspection(), mining, {});
    const contentRecs = recs.filter(r => r.type === 'content_gap');
    expect(contentRecs.length).toBeGreaterThan(0);
    expect(contentRecs[0].finding).toContain('授权管理');
    expect(contentRecs[0].relatedStrategyCodes).toContain('CG-08');
  });

  it('已解决的困惑不应生成建议', () => {
    const engine = new RecommendationEngine();
    const mining = {
      ...buildEmptyMiningResult(),
      signals: {
        ...buildEmptyMiningResult().signals,
        confusion: [
          { turn: 0, repeatedQueryOn: '授权管理', occurrences: 3, resolved: true },
        ],
      },
    };

    const recs = engine.generateRecommendations(buildCleanInspection(), mining, {});
    const contentRecs = recs.filter(r => r.type === 'content_gap');
    expect(contentRecs).toHaveLength(0);
  });

  it('应从跨会话教学设计缺陷生成 P0 内容缺口建议', () => {
    const engine = new RecommendationEngine();
    const recs = engine.generateRecommendations(
      buildCleanInspection(),
      buildRichMiningResult(),
      {}
    );

    const crossContentRecs = recs.filter(
      r => r.type === 'content_gap' && r.priority === 'P0'
    );
    expect(crossContentRecs.length).toBeGreaterThan(0);
  });
});

// ============================================================
// persona_calibration 建议
// ============================================================

describe('RecommendationEngine — persona_calibration', () => {
  it('应从角色漂移生成 P0 人格校准建议', () => {
    const engine = new RecommendationEngine();
    const recs = engine.generateRecommendations(
      buildFlaggedInspection(),
      buildEmptyMiningResult(),
      {}
    );

    const personaRecs = recs.filter(r => r.type === 'persona_calibration');
    expect(personaRecs.length).toBeGreaterThan(0);
    const p0Persona = personaRecs.find(r => r.priority === 'P0');
    expect(p0Persona).toBeDefined();
  });

  it('应从未处理挑战生成人格校准建议', () => {
    const engine = new RecommendationEngine();
    const mining = {
      ...buildEmptyMiningResult(),
      signals: {
        ...buildEmptyMiningResult().signals,
        challenge: [
          { turn: 2, detected: '不同意', handled: false, outcome: 'unresolved' },
        ],
      },
    };

    const recs = engine.generateRecommendations(buildCleanInspection(), mining, {});
    const personaRecs = recs.filter(r => r.type === 'persona_calibration');
    expect(personaRecs.length).toBeGreaterThan(0);
  });
});

// ============================================================
// 优先级分级
// ============================================================

describe('RecommendationEngine — prioritize', () => {
  it('应正确分离 P0 和 P1', () => {
    const engine = new RecommendationEngine();
    const recs = engine.generateRecommendations(
      buildFlaggedInspection(),
      buildRichMiningResult(),
      { tenantId: 'tenant-1' }
    );

    const { p0, p1 } = engine.prioritize(recs);

    expect(p0.length).toBeGreaterThan(0);
    expect(p1.length).toBeGreaterThan(0);
    expect(p0.every(r => r.priority === 'P0')).toBe(true);
    expect(p1.every(r => r.priority === 'P1')).toBe(true);
  });

  it('P0 应按置信度降序排列', () => {
    const engine = new RecommendationEngine();
    const recs = engine.generateRecommendations(
      buildFlaggedInspection(),
      buildRichMiningResult(),
      {}
    );

    const { p0 } = engine.prioritize(recs);

    for (let i = 1; i < p0.length; i++) {
      expect(p0[i - 1].evidence.confidence).toBeGreaterThanOrEqual(
        p0[i].evidence.confidence
      );
    }
  });

  it('空输入应返回空分组', () => {
    const engine = new RecommendationEngine();
    const { p0, p1 } = engine.prioritize([]);

    expect(p0).toHaveLength(0);
    expect(p1).toHaveLength(0);
  });
});

// ============================================================
// 边界情况
// ============================================================

describe('RecommendationEngine — 边界情况', () => {
  it('null inspectionResult + null miningResult 应返回空数组', () => {
    const engine = new RecommendationEngine();
    const recs = engine.generateRecommendations(null, null, {});
    expect(recs).toHaveLength(0);
  });

  it('只有 inspectionResult 时应正常工作', () => {
    const engine = new RecommendationEngine();
    const recs = engine.generateRecommendations(buildFlaggedInspection(), null, {});
    expect(recs.length).toBeGreaterThan(0);
  });

  it('只有 miningResult 时应正常工作', () => {
    const engine = new RecommendationEngine();
    const recs = engine.generateRecommendations(null, buildRichMiningResult(), {});
    expect(recs.length).toBeGreaterThan(0);
  });

  it('每个建议应包含完整字段', () => {
    const engine = new RecommendationEngine();
    const recs = engine.generateRecommendations(
      buildFlaggedInspection(),
      buildRichMiningResult(),
      { tenantId: 'tenant-1', userId: 'user-1', sessionId: 'session-1' }
    );

    for (const rec of recs) {
      expect(rec.id).toBeDefined();
      expect(rec.type).toMatch(/^(strategy_effectiveness|error_pattern|content_gap|persona_calibration)$/);
      expect(rec.scope).toMatch(/^(tenant|platform)$/);
      expect(rec.finding).toBeTruthy();
      expect(rec.evidence).toBeDefined();
      expect(rec.recommendation).toBeTruthy();
      expect(rec.status).toBe('draft');
      expect(rec.priority).toMatch(/^P[01]$/);
    }
  });

  it('scope 应在有 tenantId 时为 tenant', () => {
    const engine = new RecommendationEngine();
    const recs = engine.generateRecommendations(
      buildFlaggedInspection(),
      buildEmptyMiningResult(),
      { tenantId: 'tenant-1' }
    );

    expect(recs.every(r => r.scope === 'tenant')).toBe(true);
  });

  it('scope 应在无 tenantId 时为 platform', () => {
    const engine = new RecommendationEngine();
    const recs = engine.generateRecommendations(
      buildFlaggedInspection(),
      buildEmptyMiningResult(),
      {}
    );

    expect(recs.every(r => r.scope === 'platform')).toBe(true);
  });

  it('去重应保留高优先级版本', () => {
    const engine = new RecommendationEngine();
    // 构造会产生重复的输入：inspection + mining 都报未处理挑战
    const inspection = {
      ...buildCleanInspection(),
      layer1: {
        status: 'flagged',
        issues: [{
          dimension: 'challenge_unhandled',
          rule: '挑战信号未处理',
          severity: 'high',
          detail: '第 3 轮',
          turnIndex: 2,
        }],
        score: 0.8,
      },
    };

    const mining = {
      ...buildEmptyMiningResult(),
      signals: {
        ...buildEmptyMiningResult().signals,
        challenge: [
          { turn: 2, detected: '不同意', handled: false, outcome: 'unresolved' },
        ],
      },
    };

    const recs = engine.generateRecommendations(inspection, mining, {});
    // persona_calibration 类型不应重复
    const personaRecs = recs.filter(r => r.type === 'persona_calibration');
    // 去重后不应有完全重复的
    const findings = personaRecs.map(r => r.finding.slice(0, 20));
    const uniqueFindings = new Set(findings);
    expect(findings.length).toBe(uniqueFindings.size);
  });
});
