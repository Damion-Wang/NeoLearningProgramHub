/**
 * Layer 1 Rule Scanner 测试
 */

import { Layer1RuleScanner, DEFAULT_RULES } from '../layer1RuleScanner';

// 辅助：构建测试用 sessionMeta
function buildMeta(turns, conversationHistory, overrides = {}) {
  return {
    sessionId: 'test-session',
    userId: 'test-user',
    personaType: 'coach',
    duration: 60000,
    turns: turns.map((t, i) => ({ index: i, role: t.role, charCount: (t.content || '').length, concepts: [] })),
    conversationHistory: conversationHistory || turns,
    strategiesApplied: [],
    signals: { challenge: [], confusion: [], breakthrough: [], disengagement: [] },
    ...overrides,
  };
}

describe('Layer1RuleScanner', () => {
  let scanner;

  beforeEach(() => {
    scanner = new Layer1RuleScanner();
  });

  describe('构造与配置', () => {
    it('应使用默认规则', () => {
      expect(scanner.rules.role_drift.enabled).toBe(true);
      expect(scanner.rules.talk_ratio_imbalance.aiRatioThreshold).toBe(0.7);
    });

    it('应允许自定义规则覆盖', () => {
      const custom = new Layer1RuleScanner({
        talk_ratio_imbalance: { ...DEFAULT_RULES.talk_ratio_imbalance, aiRatioThreshold: 0.9 },
      });
      expect(custom.rules.talk_ratio_imbalance.aiRatioThreshold).toBe(0.9);
    });
  });

  describe('空/null 输入', () => {
    it('null 输入应返回 clean', () => {
      const result = scanner.scan(null);
      expect(result.status).toBe('clean');
      expect(result.score).toBe(1);
    });

    it('无 turns 的 meta 应返回 clean', () => {
      const result = scanner.scan({ turns: [], conversationHistory: [] });
      expect(result.status).toBe('clean');
    });
  });

  describe('维度 1: 角色漂移', () => {
    it('应检出 AI 越界决策', () => {
      const meta = buildMeta([
        { role: 'user', content: '我该怎么处理这个问题？' },
        { role: 'assistant', content: '我帮你决定，直接用方案A吧。' },
      ]);
      const result = scanner.scan(meta);
      expect(result.status).toBe('flagged');
      expect(result.issues.some(i => i.dimension === 'role_drift')).toBe(true);
    });

    it('应检出"我会安排"的越界', () => {
      const meta = buildMeta([
        { role: 'user', content: '下一步怎么办？' },
        { role: 'assistant', content: '我会安排一个培训给你。' },
      ]);
      const result = scanner.scan(meta);
      expect(result.issues.some(i => i.dimension === 'role_drift')).toBe(true);
    });

    it('元认知引导应被白名单排除', () => {
      const meta = buildMeta([
        { role: 'user', content: '我不知道怎么办' },
        { role: 'assistant', content: '我帮你决定之前，你觉得哪个方向更合适？' },
      ]);
      const result = scanner.scan(meta);
      expect(result.issues.filter(i => i.dimension === 'role_drift')).toHaveLength(0);
    });

    it('正常教练回复不应被标记', () => {
      const meta = buildMeta([
        { role: 'user', content: '我想提升授权能力' },
        { role: 'assistant', content: '让我们先聊聊你目前授权的方式。' },
      ]);
      const result = scanner.scan(meta);
      expect(result.issues.filter(i => i.dimension === 'role_drift')).toHaveLength(0);
    });
  });

  describe('维度 3: 话语比失衡', () => {
    it('AI 占比 > 70% 应标记', () => {
      const meta = buildMeta([
        { role: 'user', content: '嗯' },
        { role: 'assistant', content: '这是一段很长很长的回复，包含大量的信息和分析，帮助你理解授权的核心要义和实践方法。' },
        { role: 'user', content: '好' },
        { role: 'assistant', content: '让我继续展开来说，授权需要考虑信任度、能力匹配、风险评估等多个维度，每个维度都有具体的操作方法。' },
      ]);
      const result = scanner.scan(meta);
      expect(result.issues.some(i => i.dimension === 'talk_ratio_imbalance')).toBe(true);
    });

    it('轮次不足 4 轮时不检测', () => {
      const meta = buildMeta([
        { role: 'user', content: '嗯' },
        { role: 'assistant', content: '很长很长的开场白内容，用来测试话语比在少轮次时不应触发检测。' },
      ]);
      const result = scanner.scan(meta);
      expect(result.issues.filter(i => i.dimension === 'talk_ratio_imbalance')).toHaveLength(0);
    });

    it('均衡对话不应标记', () => {
      const meta = buildMeta([
        { role: 'user', content: '我想聊聊最近遇到的管理问题' },
        { role: 'assistant', content: '好的，具体是什么样的问题？' },
        { role: 'user', content: '团队成员不主动承担责任' },
        { role: 'assistant', content: '能举个具体的例子吗？' },
      ]);
      const result = scanner.scan(meta);
      expect(result.issues.filter(i => i.dimension === 'talk_ratio_imbalance')).toHaveLength(0);
    });
  });

  describe('维度 4: 僵局检测', () => {
    it('连续短消息应检出僵局', () => {
      const turns = [];
      // 10 对轮次：用户每次只说 1-2 个字
      for (let i = 0; i < 10; i++) {
        turns.push({ role: 'user', content: '嗯' });
        turns.push({ role: 'assistant', content: '还有什么想法吗？' });
      }
      const meta = buildMeta(turns);
      const result = scanner.scan(meta);
      expect(result.issues.some(i => i.dimension === 'stalemate')).toBe(true);
    });

    it('活跃对话不应检出僵局', () => {
      const turns = [];
      for (let i = 0; i < 6; i++) {
        turns.push({ role: 'user', content: '我来详细说说这个问题的背景和上下文' });
        turns.push({ role: 'assistant', content: '理解了，让我们深入分析。' });
      }
      const meta = buildMeta(turns);
      const result = scanner.scan(meta);
      expect(result.issues.filter(i => i.dimension === 'stalemate')).toHaveLength(0);
    });
  });

  describe('维度 5: 挑战信号未处理', () => {
    it('用户挑战未被回应应标记', () => {
      const meta = buildMeta([
        { role: 'user', content: '我不同意你说的，授权不一定需要信任基础。' },
        { role: 'assistant', content: '授权的第二个维度是能力评估。' },
      ]);
      const result = scanner.scan(meta);
      expect(result.issues.some(i => i.dimension === 'challenge_unhandled')).toBe(true);
    });

    it('用户挑战被确认回应不应标记', () => {
      const meta = buildMeta([
        { role: 'user', content: '我不同意你说的，授权不一定需要信任基础。' },
        { role: 'assistant', content: '你说得有道理，确实有些场景下可以先授权再建立信任。' },
      ]);
      const result = scanner.scan(meta);
      expect(result.issues.filter(i => i.dimension === 'challenge_unhandled')).toHaveLength(0);
    });
  });

  describe('维度 2: 概念矛盾', () => {
    it('默认规则下概念矛盾检测应关闭', () => {
      expect(scanner.rules.concept_contradiction.enabled).toBe(false);
    });

    it('显式启用时，跨轮次的矛盾表述应标记', () => {
      const enabledScanner = new Layer1RuleScanner({
        concept_contradiction: { ...DEFAULT_RULES.concept_contradiction, enabled: true },
      });
      const meta = buildMeta([
        { role: 'user', content: '授权重要吗？' },
        { role: 'assistant', content: '授权非常重要，是管理者的核心能力。' },
        { role: 'user', content: '那什么时候不应该授权？' },
        { role: 'assistant', content: '授权不重要的任务可以自己做。' },
      ]);
      const result = enabledScanner.scan(meta);
      expect(result.issues.some(i => i.dimension === 'concept_contradiction')).toBe(true);
    });
  });

  describe('综合评分', () => {
    it('无问题时分数为 1.0', () => {
      const meta = buildMeta([
        { role: 'user', content: '你好' },
        { role: 'assistant', content: '你好' },
      ]);
      expect(scanner.scan(meta).score).toBe(1);
    });

    it('high 严重度扣 0.2', () => {
      const meta = buildMeta([
        { role: 'user', content: '怎么办？' },
        { role: 'assistant', content: '我帮你决定吧。' },
      ]);
      const result = scanner.scan(meta);
      expect(result.score).toBeLessThanOrEqual(0.8);
    });

    it('分数最低为 0', () => {
      // 构造多个问题
      const meta = buildMeta([
        { role: 'user', content: '我不同意' },
        { role: 'assistant', content: '我帮你决定，我会安排，交给我来处理。' },
        { role: 'user', content: '不对吧' },
        { role: 'assistant', content: '我替你搞定，我直接帮你做了。这很重要。' },
        { role: 'user', content: '为什么不能' },
        { role: 'assistant', content: '我已经安排好了。这不重要。' },
      ]);
      const result = scanner.scan(meta);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });
});
