/**
 * EnablementSignalEngine 测试
 *
 * 覆盖 7 种信号源检测 + 边界场景 + scanSignals 聚合
 */

import {
  EnablementSignalEngine,
  SignalType,
  SignalUrgency,
} from '../enablementSignalEngine';

// ==================== 辅助工厂 ====================

function makeTask(overrides = {}) {
  return {
    id: 'task-001',
    title: '授权技巧提升',
    learnerId: 'learner-001',
    competencyIds: ['delegation'],
    targetMastery: 0.3,
    status: 'active',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 天前
    expectedDurationDays: 30,
    activities: [],
    tutorFeedback: [],
    learnerSignals: [],
    ...overrides,
  };
}

describe('EnablementSignalEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new EnablementSignalEngine();
  });

  // ==================== 构造 + 基本 ====================

  describe('constructor', () => {
    it('accepts optional dependencies', () => {
      const e = new EnablementSignalEngine({}, {}, {}, {});
      expect(e).toBeInstanceOf(EnablementSignalEngine);
    });
  });

  describe('scanSignals', () => {
    it('throws without managerId', async () => {
      await expect(engine.scanSignals(null)).rejects.toThrow('Manager ID is required');
    });

    it('returns empty array when no active tasks and no PPP', async () => {
      const signals = await engine.scanSignals('mgr-001');
      expect(signals).toEqual([]);
    });

    it('aggregates signals from multiple tasks', async () => {
      const task1 = makeTask({
        id: 'task-001',
        learnerSignals: [{ urgency: 'high', message: '急', acknowledged: false }],
      });
      const task2 = makeTask({
        id: 'task-002',
        learnerId: 'learner-002',
        tutorFeedback: [{ type: 'strategy_issue', resolved: false, description: '方法无效' }],
      });
      engine.setActiveTasks('mgr-001', [task1, task2]);

      const signals = await engine.scanSignals('mgr-001');
      expect(signals.length).toBeGreaterThanOrEqual(2);

      const types = signals.map(s => s.type);
      expect(types).toContain(SignalType.LEARNER_HIGH_URGENCY);
      expect(types).toContain(SignalType.TUTOR_STRATEGY_ISSUE);
    });
  });

  describe('checkTask', () => {
    it('throws without task', async () => {
      await expect(engine.checkTask(null)).rejects.toThrow('Task is required');
    });

    it('returns empty array for a healthy task', async () => {
      const task = makeTask({
        activities: [
          { id: 'a1', status: 'completed' },
          { id: 'a2', status: 'completed' },
        ],
      });
      const signals = await engine.checkTask(task);
      expect(signals).toEqual([]);
    });
  });

  // ==================== 信号 1: PPP_COMPETENCY_GAP ====================

  describe('PPP_COMPETENCY_GAP', () => {
    it('detects uncovered competency gap from PPP', async () => {
      const mockPPP = {
        getCompetencySnapshot: jest.fn().mockResolvedValue({
          competencies: [
            { id: 'feedback', name: '反馈技巧', score: 0.25 },
            { id: 'delegation', name: '授权', score: 0.6 },
          ],
        }),
      };
      engine = new EnablementSignalEngine(null, mockPPP);

      // 有一个任务覆盖 delegation，但 feedback 未覆盖
      const task = makeTask({ competencyIds: ['delegation'] });
      engine.setActiveTasks('mgr-001', [task]);

      const signals = await engine.scanSignals('mgr-001');
      const gapSignals = signals.filter(s => s.type === SignalType.PPP_COMPETENCY_GAP);

      expect(gapSignals).toHaveLength(1);
      expect(gapSignals[0].learnerId).toBe('learner-001');
      expect(gapSignals[0].taskId).toBeNull();
      expect(gapSignals[0].nonTimeSignal).toContain('0.25');
    });

    it('does not fire when competency is already covered by active task', async () => {
      const mockPPP = {
        getCompetencySnapshot: jest.fn().mockResolvedValue({
          competencies: [
            { id: 'delegation', name: '授权', score: 0.2 },
          ],
        }),
      };
      engine = new EnablementSignalEngine(null, mockPPP);

      const task = makeTask({ competencyIds: ['delegation'] });
      engine.setActiveTasks('mgr-001', [task]);

      const signals = await engine.scanSignals('mgr-001');
      const gapSignals = signals.filter(s => s.type === SignalType.PPP_COMPETENCY_GAP);
      expect(gapSignals).toHaveLength(0);
    });

    it('marks urgency HIGH when score < 0.2', async () => {
      const mockPPP = {
        getCompetencySnapshot: jest.fn().mockResolvedValue({
          competencies: [
            { id: 'coaching', name: '教练', score: 0.15 },
          ],
        }),
      };
      engine = new EnablementSignalEngine(null, mockPPP);
      engine.setActiveTasks('mgr-001', [makeTask()]);

      const signals = await engine.scanSignals('mgr-001');
      const gapSignals = signals.filter(s => s.type === SignalType.PPP_COMPETENCY_GAP);
      expect(gapSignals[0].urgency).toBe(SignalUrgency.HIGH);
    });

    it('skips when PPP engine is not available', async () => {
      engine = new EnablementSignalEngine(null, null);
      engine.setActiveTasks('mgr-001', [makeTask()]);
      const signals = await engine.scanSignals('mgr-001');
      const gapSignals = signals.filter(s => s.type === SignalType.PPP_COMPETENCY_GAP);
      expect(gapSignals).toHaveLength(0);
    });
  });

  // ==================== 信号 2: EXECUTION_BEHIND_SCHEDULE ====================

  describe('EXECUTION_BEHIND_SCHEDULE', () => {
    it('detects behind-schedule task', async () => {
      // 15 天过去了（50% 时间），但只完成 1/10 活动（10%）
      const task = makeTask({
        activities: [
          { id: 'a1', status: 'completed' },
          ...Array.from({ length: 9 }, (_, i) => ({ id: `a${i + 2}`, status: 'pending' })),
        ],
      });

      const signals = await engine.checkTask(task);
      const behind = signals.filter(s => s.type === SignalType.EXECUTION_BEHIND_SCHEDULE);

      expect(behind).toHaveLength(1);
      expect(behind[0].urgency).toBe(SignalUrgency.MEDIUM);
      expect(behind[0].nonTimeSignal).toContain('%');
    });

    it('does not fire when on track', async () => {
      const task = makeTask({
        activities: [
          { id: 'a1', status: 'completed' },
          { id: 'a2', status: 'completed' },
          { id: 'a3', status: 'in_progress' },
        ],
      });

      const signals = await engine.checkTask(task);
      const behind = signals.filter(s => s.type === SignalType.EXECUTION_BEHIND_SCHEDULE);
      expect(behind).toHaveLength(0);
    });

    it('marks urgency HIGH when elapsed > 80%', async () => {
      const task = makeTask({
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(), // 28/30 天
        expectedDurationDays: 30,
        activities: [
          { id: 'a1', status: 'completed' },
          ...Array.from({ length: 9 }, (_, i) => ({ id: `a${i + 2}`, status: 'pending' })),
        ],
      });

      const signals = await engine.checkTask(task);
      const behind = signals.filter(s => s.type === SignalType.EXECUTION_BEHIND_SCHEDULE);
      expect(behind).toHaveLength(1);
      expect(behind[0].urgency).toBe(SignalUrgency.HIGH);
    });

    it('does not fire when no activities', async () => {
      const task = makeTask({ activities: [] });
      const signals = await engine.checkTask(task);
      const behind = signals.filter(s => s.type === SignalType.EXECUTION_BEHIND_SCHEDULE);
      expect(behind).toHaveLength(0);
    });

    it('does not fire when no createdAt', async () => {
      const task = makeTask({
        createdAt: null,
        activities: [{ id: 'a1', status: 'pending' }],
      });
      const signals = await engine.checkTask(task);
      const behind = signals.filter(s => s.type === SignalType.EXECUTION_BEHIND_SCHEDULE);
      expect(behind).toHaveLength(0);
    });
  });

  // ==================== 信号 3: TUTOR_STRATEGY_ISSUE ====================

  describe('TUTOR_STRATEGY_ISSUE', () => {
    it('detects unresolved strategy issue', async () => {
      const task = makeTask({
        tutorFeedback: [
          { type: 'strategy_issue', resolved: false, description: '案例太简单' },
        ],
      });

      const signals = await engine.checkTask(task);
      const issues = signals.filter(s => s.type === SignalType.TUTOR_STRATEGY_ISSUE);

      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('案例太简单');
      expect(issues[0].urgency).toBe(SignalUrgency.MEDIUM);
    });

    it('marks HIGH urgency when 2+ unresolved', async () => {
      const task = makeTask({
        tutorFeedback: [
          { type: 'strategy_issue', resolved: false, description: '问题1' },
          { type: 'strategy_issue', resolved: false, description: '问题2' },
        ],
      });

      const signals = await engine.checkTask(task);
      const issues = signals.filter(s => s.type === SignalType.TUTOR_STRATEGY_ISSUE);
      expect(issues[0].urgency).toBe(SignalUrgency.HIGH);
    });

    it('ignores resolved issues', async () => {
      const task = makeTask({
        tutorFeedback: [
          { type: 'strategy_issue', resolved: true, description: '已解决' },
        ],
      });

      const signals = await engine.checkTask(task);
      const issues = signals.filter(s => s.type === SignalType.TUTOR_STRATEGY_ISSUE);
      expect(issues).toHaveLength(0);
    });

    it('ignores non-strategy feedback', async () => {
      const task = makeTask({
        tutorFeedback: [
          { type: 'general_feedback', resolved: false, description: '总体不错' },
        ],
      });

      const signals = await engine.checkTask(task);
      const issues = signals.filter(s => s.type === SignalType.TUTOR_STRATEGY_ISSUE);
      expect(issues).toHaveLength(0);
    });
  });

  // ==================== 信号 4: CAPACITY_CONFLICT ====================

  describe('CAPACITY_CONFLICT', () => {
    it('detects capacity overload', async () => {
      const mockCapacity = {
        checkCapacity: jest.fn().mockResolvedValue({
          fits: false,
          remaining: -3,
          overflow: 3,
        }),
      };
      engine = new EnablementSignalEngine(null, null, mockCapacity);

      const task = makeTask();
      const signals = await engine.checkTask(task);
      const conflicts = signals.filter(s => s.type === SignalType.CAPACITY_CONFLICT);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].urgency).toBe(SignalUrgency.MEDIUM);
      expect(conflicts[0].nonTimeSignal).toContain('3');
    });

    it('marks HIGH urgency when overflow > 4', async () => {
      const mockCapacity = {
        checkCapacity: jest.fn().mockResolvedValue({
          fits: false,
          remaining: -6,
          overflow: 6,
        }),
      };
      engine = new EnablementSignalEngine(null, null, mockCapacity);

      const task = makeTask();
      const signals = await engine.checkTask(task);
      const conflicts = signals.filter(s => s.type === SignalType.CAPACITY_CONFLICT);
      expect(conflicts[0].urgency).toBe(SignalUrgency.HIGH);
    });

    it('does not fire when capacity is fine', async () => {
      const mockCapacity = {
        checkCapacity: jest.fn().mockResolvedValue({
          fits: true,
          remaining: 4,
          overflow: 0,
        }),
      };
      engine = new EnablementSignalEngine(null, null, mockCapacity);

      const task = makeTask();
      const signals = await engine.checkTask(task);
      const conflicts = signals.filter(s => s.type === SignalType.CAPACITY_CONFLICT);
      expect(conflicts).toHaveLength(0);
    });

    it('skips when capacity engine not available', async () => {
      const task = makeTask();
      const signals = await engine.checkTask(task);
      const conflicts = signals.filter(s => s.type === SignalType.CAPACITY_CONFLICT);
      expect(conflicts).toHaveLength(0);
    });
  });

  // ==================== 信号 5: EFFECT_TARGET_MET ====================

  describe('EFFECT_TARGET_MET', () => {
    it('detects when mastery target is met', async () => {
      const mockEffect = {
        evaluateEffect: jest.fn().mockResolvedValue({
          meetsTarget: true,
          overallMasteryDelta: 0.35,
        }),
      };
      engine = new EnablementSignalEngine(null, null, null, mockEffect);

      const task = makeTask();
      const signals = await engine.checkTask(task);
      const met = signals.filter(s => s.type === SignalType.EFFECT_TARGET_MET);

      expect(met).toHaveLength(1);
      expect(met[0].urgency).toBe(SignalUrgency.LOW);
      expect(met[0].nonTimeSignal).toContain('0.35');
    });

    it('does not fire when target not met', async () => {
      const mockEffect = {
        evaluateEffect: jest.fn().mockResolvedValue({
          meetsTarget: false,
          overallMasteryDelta: 0.1,
        }),
      };
      engine = new EnablementSignalEngine(null, null, null, mockEffect);

      const task = makeTask();
      const signals = await engine.checkTask(task);
      const met = signals.filter(s => s.type === SignalType.EFFECT_TARGET_MET);
      expect(met).toHaveLength(0);
    });

    it('skips when task has no competencyIds', async () => {
      const mockEffect = {
        evaluateEffect: jest.fn(),
      };
      engine = new EnablementSignalEngine(null, null, null, mockEffect);

      const task = makeTask({ competencyIds: [] });
      const signals = await engine.checkTask(task);
      const met = signals.filter(s => s.type === SignalType.EFFECT_TARGET_MET);
      expect(met).toHaveLength(0);
      expect(mockEffect.evaluateEffect).not.toHaveBeenCalled();
    });
  });

  // ==================== 信号 6: CONVERSION_FUNNEL_STALL ====================

  describe('CONVERSION_FUNNEL_STALL', () => {
    it('detects stalled activity (> 7 days)', async () => {
      const task = makeTask({
        activities: [
          {
            id: 'a1',
            title: '案例分析',
            status: 'in_progress',
            startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            lastProgressAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      });

      const signals = await engine.checkTask(task);
      const stalls = signals.filter(s => s.type === SignalType.CONVERSION_FUNNEL_STALL);

      expect(stalls).toHaveLength(1);
      expect(stalls[0].urgency).toBe(SignalUrgency.MEDIUM);
      expect(stalls[0].message).toContain('案例分析');
    });

    it('marks HIGH urgency when stalled > 14 days', async () => {
      const task = makeTask({
        activities: [
          {
            id: 'a1',
            title: '练习',
            status: 'in_progress',
            startedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            lastProgressAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      });

      const signals = await engine.checkTask(task);
      const stalls = signals.filter(s => s.type === SignalType.CONVERSION_FUNNEL_STALL);
      expect(stalls[0].urgency).toBe(SignalUrgency.HIGH);
    });

    it('does not fire for recently updated activities', async () => {
      const task = makeTask({
        activities: [
          {
            id: 'a1',
            status: 'in_progress',
            startedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            lastProgressAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      });

      const signals = await engine.checkTask(task);
      const stalls = signals.filter(s => s.type === SignalType.CONVERSION_FUNNEL_STALL);
      expect(stalls).toHaveLength(0);
    });

    it('ignores completed activities', async () => {
      const task = makeTask({
        activities: [
          {
            id: 'a1',
            status: 'completed',
            startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      });

      const signals = await engine.checkTask(task);
      const stalls = signals.filter(s => s.type === SignalType.CONVERSION_FUNNEL_STALL);
      expect(stalls).toHaveLength(0);
    });

    it('detects multiple stalled activities in one task', async () => {
      const task = makeTask({
        activities: [
          {
            id: 'a1',
            title: '活动1',
            status: 'in_progress',
            lastProgressAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'a2',
            title: '活动2',
            status: 'in_progress',
            lastProgressAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      });

      const signals = await engine.checkTask(task);
      const stalls = signals.filter(s => s.type === SignalType.CONVERSION_FUNNEL_STALL);
      expect(stalls).toHaveLength(2);
    });
  });

  // ==================== 信号 7: LEARNER_HIGH_URGENCY ====================

  describe('LEARNER_HIGH_URGENCY', () => {
    it('detects unacknowledged high-urgency signal', async () => {
      const task = makeTask({
        learnerSignals: [
          { urgency: 'high', message: '项目要上线了，急需帮助', acknowledged: false },
        ],
      });

      const signals = await engine.checkTask(task);
      const urgency = signals.filter(s => s.type === SignalType.LEARNER_HIGH_URGENCY);

      expect(urgency).toHaveLength(1);
      expect(urgency[0].urgency).toBe(SignalUrgency.HIGH);
      expect(urgency[0].message).toContain('急需帮助');
    });

    it('ignores acknowledged signals', async () => {
      const task = makeTask({
        learnerSignals: [
          { urgency: 'high', message: '已处理', acknowledged: true },
        ],
      });

      const signals = await engine.checkTask(task);
      const urgency = signals.filter(s => s.type === SignalType.LEARNER_HIGH_URGENCY);
      expect(urgency).toHaveLength(0);
    });

    it('ignores non-high urgency signals', async () => {
      const task = makeTask({
        learnerSignals: [
          { urgency: 'medium', message: '有个小问题', acknowledged: false },
        ],
      });

      const signals = await engine.checkTask(task);
      const urgency = signals.filter(s => s.type === SignalType.LEARNER_HIGH_URGENCY);
      expect(urgency).toHaveLength(0);
    });

    it('detects multiple unacknowledged signals', async () => {
      const task = makeTask({
        learnerSignals: [
          { urgency: 'high', message: '问题1', acknowledged: false },
          { urgency: 'high', message: '问题2', acknowledged: false },
        ],
      });

      const signals = await engine.checkTask(task);
      const urgency = signals.filter(s => s.type === SignalType.LEARNER_HIGH_URGENCY);
      expect(urgency).toHaveLength(2);
    });
  });

  // ==================== 信号结构验证 ====================

  describe('signal structure', () => {
    it('every signal has all required fields', async () => {
      const task = makeTask({
        learnerSignals: [{ urgency: 'high', message: 'test', acknowledged: false }],
      });

      const signals = await engine.checkTask(task);
      expect(signals.length).toBeGreaterThan(0);

      for (const signal of signals) {
        expect(signal).toHaveProperty('type');
        expect(signal).toHaveProperty('taskId');
        expect(signal).toHaveProperty('learnerId');
        expect(signal).toHaveProperty('urgency');
        expect(signal).toHaveProperty('message');
        expect(signal).toHaveProperty('suggestedAction');
        expect(signal).toHaveProperty('nonTimeSignal');
        expect(signal).toHaveProperty('detectedAt');

        // nonTimeSignal 必须非空（核心原则）
        expect(signal.nonTimeSignal).toBeTruthy();
        expect(typeof signal.nonTimeSignal).toBe('string');

        // detectedAt 是 ISO 字符串
        expect(new Date(signal.detectedAt).toISOString()).toBe(signal.detectedAt);

        // urgency 是合法值
        expect(['high', 'medium', 'low']).toContain(signal.urgency);
      }
    });
  });

  // ==================== 边界场景 ====================

  describe('edge cases', () => {
    it('handles task with no optional fields gracefully', async () => {
      const task = { id: 'bare-task' };
      const signals = await engine.checkTask(task);
      expect(Array.isArray(signals)).toBe(true);
    });

    it('PPP engine error does not break scanSignals', async () => {
      const mockPPP = {
        getCompetencySnapshot: jest.fn().mockRejectedValue(new Error('PPP down')),
      };
      engine = new EnablementSignalEngine(null, mockPPP);
      engine.setActiveTasks('mgr-001', [makeTask()]);

      const signals = await engine.scanSignals('mgr-001');
      expect(Array.isArray(signals)).toBe(true);
    });

    it('capacity engine error does not break checkTask', async () => {
      const mockCapacity = {
        checkCapacity: jest.fn().mockRejectedValue(new Error('Capacity down')),
      };
      engine = new EnablementSignalEngine(null, null, mockCapacity);

      const task = makeTask();
      const signals = await engine.checkTask(task);
      expect(Array.isArray(signals)).toBe(true);
    });

    it('effect engine error does not break checkTask', async () => {
      const mockEffect = {
        evaluateEffect: jest.fn().mockRejectedValue(new Error('Effect down')),
      };
      engine = new EnablementSignalEngine(null, null, null, mockEffect);

      const task = makeTask();
      const signals = await engine.checkTask(task);
      expect(Array.isArray(signals)).toBe(true);
    });
  });
});
