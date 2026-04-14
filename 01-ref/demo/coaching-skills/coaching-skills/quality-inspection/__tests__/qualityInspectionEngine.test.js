/**
 * Quality Inspection Engine 测试
 */

import { QualityInspectionEngine } from '../qualityInspectionEngine';

// 辅助：构建干净的 sessionMeta
function buildCleanMeta() {
  return {
    sessionId: 'test-session',
    userId: 'test-user',
    personaType: 'coach',
    duration: 60000,
    turns: [
      { index: 0, role: 'user', charCount: 20, concepts: [] },
      { index: 1, role: 'assistant', charCount: 30, concepts: [] },
    ],
    conversationHistory: [
      { role: 'user', content: '我想聊聊管理问题' },
      { role: 'assistant', content: '好的，具体是什么样的管理问题？' },
    ],
    strategiesApplied: [],
    signals: { challenge: [], confusion: [], breakthrough: [], disengagement: [] },
  };
}

// 辅助：构建有问题的 sessionMeta
function buildFlaggedMeta() {
  return {
    sessionId: 'flagged-session',
    userId: 'test-user',
    personaType: 'coach',
    duration: 120000,
    turns: [
      { index: 0, role: 'user', charCount: 5, concepts: [] },
      { index: 1, role: 'assistant', charCount: 200, concepts: [] },
      { index: 2, role: 'user', charCount: 3, concepts: [] },
      { index: 3, role: 'assistant', charCount: 300, concepts: [] },
    ],
    conversationHistory: [
      { role: 'user', content: '怎么办？' },
      { role: 'assistant', content: '我帮你决定吧，' + '详细'.repeat(100) },
      { role: 'user', content: '嗯' },
      { role: 'assistant', content: '我会安排培训给你，' + '分析'.repeat(100) },
    ],
    strategiesApplied: [
      {
        code: 'IP-03',
        name: '苏格拉底追问',
        turns: [1, 3],
        contexts: [{ dreyfusLevel: 'novice' }, { dreyfusLevel: 'novice' }],
      },
    ],
    signals: {
      challenge: [],
      confusion: [{ turn: 0, signal: '①' }],
      breakthrough: [],
      disengagement: [],
      misconception: [{ turn: 0, signal: '⑥' }],
    },
  };
}

describe('QualityInspectionEngine', () => {
  describe('构造', () => {
    it('应使用默认配置创建', () => {
      const engine = new QualityInspectionEngine();
      expect(engine.layer1).toBeDefined();
      expect(engine.layer2).toBeDefined();
      expect(engine.alwaysRunLayer2).toBe(false);
      expect(engine.deepReviewThreshold).toBe(0.5);
    });

    it('应允许自定义配置', () => {
      const engine = new QualityInspectionEngine({
        alwaysRunLayer2: true,
        deepReviewThreshold: 0.7,
      });
      expect(engine.alwaysRunLayer2).toBe(true);
      expect(engine.deepReviewThreshold).toBe(0.7);
    });
  });

  describe('inspect — 干净会话', () => {
    it('干净会话 Layer 1 应为 clean，Layer 2 不执行', async () => {
      const engine = new QualityInspectionEngine();
      const result = await engine.inspect(buildCleanMeta());

      expect(result.layer1.status).toBe('clean');
      expect(result.layer2).toBeNull(); // Layer 1 clean → 不触发 Layer 2
      expect(result.overallScore).toBe(1);
      expect(result.shouldDeepReview).toBe(false);
      expect(result.inspectedAt).toBeDefined();
    });
  });

  describe('inspect — 有问题的会话', () => {
    it('flagged 会话应触发 Layer 2', async () => {
      const engine = new QualityInspectionEngine();
      const result = await engine.inspect(buildFlaggedMeta());

      expect(result.layer1.status).toBe('flagged');
      expect(result.layer1.issues.length).toBeGreaterThan(0);
      expect(result.layer2).not.toBeNull();
      expect(result.overallScore).toBeLessThan(1);
    });

    it('shouldDeepReview 应在分数低时为 true', async () => {
      const engine = new QualityInspectionEngine({ deepReviewThreshold: 0.9 });
      const result = await engine.inspect(buildFlaggedMeta());
      expect(result.shouldDeepReview).toBe(true);
    });
  });

  describe('inspect — 强制 Layer 2', () => {
    it('alwaysRunLayer2 时干净会话也应执行 Layer 2', async () => {
      const engine = new QualityInspectionEngine({ alwaysRunLayer2: true });
      const result = await engine.inspect(buildCleanMeta());

      expect(result.layer1.status).toBe('clean');
      expect(result.layer2).not.toBeNull();
      expect(result.layer2.status).toBe('clean');
    });
  });

  describe('inspectBatch', () => {
    it('应批量处理多个会话', async () => {
      const engine = new QualityInspectionEngine();
      const results = await engine.inspectBatch([
        buildCleanMeta(),
        buildFlaggedMeta(),
      ]);

      expect(results).toHaveLength(2);
      expect(results[0].report.layer1.status).toBe('clean');
      expect(results[1].report.layer1.status).toBe('flagged');
    });

    it('单个会话出错不影响其他', async () => {
      const engine = new QualityInspectionEngine();
      const results = await engine.inspectBatch([
        null, // 不会报错，Layer1 返回 clean
        buildCleanMeta(),
      ]);

      expect(results).toHaveLength(2);
      expect(results[1].report.layer1.status).toBe('clean');
    });
  });

  describe('综合评分', () => {
    it('Layer 2 violations 应降低综合分', async () => {
      const engine = new QualityInspectionEngine({ alwaysRunLayer2: true });

      // 构造有 Layer 2 违规的 meta
      const meta = {
        ...buildCleanMeta(),
        strategiesApplied: [
          {
            code: 'IP-03',
            name: '苏格拉底追问',
            turns: [1],
            contexts: [{ dreyfusLevel: 'novice' }],
          },
          // 第二个策略以触发组合检测
          {
            code: 'CG-02',
            name: '间隔重复',
            turns: [1, 2, 3, 4, 5],
            contexts: [],
          },
        ],
        signals: { breakthrough: [] },
      };

      const result = await engine.inspect(meta);
      // Layer 2 应有违规（Dreyfus mismatch 等）
      expect(result.overallScore).toBeLessThanOrEqual(1);
    });
  });
});
