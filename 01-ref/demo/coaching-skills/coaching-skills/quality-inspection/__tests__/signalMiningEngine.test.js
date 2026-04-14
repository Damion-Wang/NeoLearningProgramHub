/**
 * SignalMiningEngine 测试
 */

import { SignalMiningEngine } from '../signalMiningEngine';

// ─── 辅助函数 ──────────────────────────────────────────────────────────

function buildBasicMeta(overrides = {}) {
  return {
    sessionId: 'session-1',
    userId: 'user-1',
    personaType: 'coach',
    duration: 60000,
    turns: [
      { index: 0, role: 'user', charCount: 20, concepts: [] },
      { index: 1, role: 'assistant', charCount: 30, concepts: [] },
      { index: 2, role: 'user', charCount: 25, concepts: [] },
      { index: 3, role: 'assistant', charCount: 35, concepts: [] },
    ],
    conversationHistory: [
      { role: 'user', content: '我想聊聊管理问题' },
      { role: 'assistant', content: '好的，具体是什么样的管理问题？' },
      { role: 'user', content: '团队最近效率下降了' },
      { role: 'assistant', content: '你觉得主要原因是什么？' },
    ],
    strategiesApplied: [],
    signals: { challenge: [], confusion: [], breakthrough: [], disengagement: [] },
    ...overrides,
  };
}

function buildMockTranscriptService(sessions = []) {
  return {
    getRecentByUser: jest.fn().mockResolvedValue(sessions),
  };
}

// ============================================================
// CHALLENGE 信号检测
// ============================================================

describe('SignalMiningEngine — CHALLENGE', () => {
  it('应检测到学员挑战信号', async () => {
    const meta = buildBasicMeta({
      conversationHistory: [
        { role: 'user', content: '我不同意你说的这个观点' },
        { role: 'assistant', content: '让我换个角度解释一下' },
      ],
      turns: [
        { index: 0, role: 'user', charCount: 12, concepts: [] },
        { index: 1, role: 'assistant', charCount: 10, concepts: [] },
      ],
    });

    const engine = new SignalMiningEngine(buildMockTranscriptService());
    const result = await engine.mineSession(meta);

    expect(result.signals.challenge).toHaveLength(1);
    expect(result.signals.challenge[0].turn).toBe(0);
    expect(result.signals.challenge[0].detected).toBe('不同意');
    expect(result.signals.challenge[0].handled).toBe(false);
    expect(result.signals.challenge[0].outcome).toBe('unresolved');
  });

  it('应识别已处理的挑战', async () => {
    const meta = buildBasicMeta({
      conversationHistory: [
        { role: 'user', content: '我不同意你的看法' },
        { role: 'assistant', content: '你说得有道理，确实可以从另一个角度看' },
      ],
      turns: [
        { index: 0, role: 'user', charCount: 10, concepts: [] },
        { index: 1, role: 'assistant', charCount: 20, concepts: [] },
      ],
    });

    const engine = new SignalMiningEngine(buildMockTranscriptService());
    const result = await engine.mineSession(meta);

    expect(result.signals.challenge).toHaveLength(1);
    expect(result.signals.challenge[0].handled).toBe(true);
    expect(result.signals.challenge[0].outcome).toBe('resolved');
  });

  it('无挑战信号时应返回空数组', async () => {
    const engine = new SignalMiningEngine(buildMockTranscriptService());
    const result = await engine.mineSession(buildBasicMeta());

    expect(result.signals.challenge).toHaveLength(0);
  });
});

// ============================================================
// CONFUSION 信号检测
// ============================================================

describe('SignalMiningEngine — CONFUSION', () => {
  it('应检测到重复提问同一概念', async () => {
    const meta = buildBasicMeta({
      turns: [
        { index: 0, role: 'user', charCount: 10, concepts: [] },
        { index: 1, role: 'assistant', charCount: 20, concepts: [] },
        { index: 2, role: 'user', charCount: 15, concepts: [] },
        { index: 3, role: 'assistant', charCount: 20, concepts: [] },
        { index: 4, role: 'user', charCount: 15, concepts: [] },
        { index: 5, role: 'assistant', charCount: 20, concepts: [] },
        { index: 6, role: 'user', charCount: 15, concepts: [] },
        { index: 7, role: 'assistant', charCount: 20, concepts: [] },
      ],
      conversationHistory: [
        { role: 'user', content: '授权管理到底是什么意思？' },
        { role: 'assistant', content: '授权管理是指...' },
        { role: 'user', content: '授权管理的范围怎么界定？' },
        { role: 'assistant', content: '范围取决于...' },
        { role: 'user', content: '我还是不太明白授权管理' },
        { role: 'assistant', content: '简单来说...' },
        { role: 'user', content: '能再解释一下授权管理吗？' },
        { role: 'assistant', content: '好的，换个方式...' },
      ],
    });

    const engine = new SignalMiningEngine(buildMockTranscriptService());
    const result = await engine.mineSession(meta);

    expect(result.signals.confusion.length).toBeGreaterThan(0);
    const confusionOnAuth = result.signals.confusion.find(
      c => c.repeatedQueryOn.includes('授权')
    );
    expect(confusionOnAuth).toBeDefined();
    expect(confusionOnAuth.resolved).toBe(false);
  });

  it('少于 3 轮用户消息时不应检测困惑', async () => {
    const meta = buildBasicMeta({
      turns: [
        { index: 0, role: 'user', charCount: 10, concepts: [] },
        { index: 1, role: 'assistant', charCount: 20, concepts: [] },
      ],
      conversationHistory: [
        { role: 'user', content: '授权管理是什么？' },
        { role: 'assistant', content: '授权管理是指...' },
      ],
    });

    const engine = new SignalMiningEngine(buildMockTranscriptService());
    const result = await engine.mineSession(meta);

    expect(result.signals.confusion).toHaveLength(0);
  });
});

// ============================================================
// BREAKTHROUGH 信号检测
// ============================================================

describe('SignalMiningEngine — BREAKTHROUGH', () => {
  it('应检测到顿悟信号', async () => {
    const meta = buildBasicMeta({
      conversationHistory: [
        { role: 'user', content: '我不太理解' },
        { role: 'assistant', content: '让我用个比喻来说明...' },
        { role: 'user', content: '原来如此！我明白了，这就像是...' },
        { role: 'assistant', content: '对，你理解得很到位' },
      ],
      turns: [
        { index: 0, role: 'user', charCount: 6, concepts: [] },
        { index: 1, role: 'assistant', charCount: 15, concepts: [] },
        { index: 2, role: 'user', charCount: 20, concepts: [] },
        { index: 3, role: 'assistant', charCount: 10, concepts: [] },
      ],
    });

    const engine = new SignalMiningEngine(buildMockTranscriptService());
    const result = await engine.mineSession(meta);

    expect(result.signals.breakthrough).toHaveLength(1);
    expect(result.signals.breakthrough[0].turn).toBe(2);
    expect(result.signals.breakthrough[0].detected).toContain('原来');
  });

  it('应利用已有 mastery 数据', async () => {
    const meta = buildBasicMeta({
      conversationHistory: [
        { role: 'user', content: '原来如此' },
        { role: 'assistant', content: '对' },
      ],
      turns: [
        { index: 0, role: 'user', charCount: 4, concepts: [] },
        { index: 1, role: 'assistant', charCount: 1, concepts: [] },
      ],
      signals: {
        challenge: [],
        confusion: [],
        breakthrough: [{ turn: 0, mastery: { before: 0.3, after: 0.8 } }],
        disengagement: [],
      },
    });

    const engine = new SignalMiningEngine(buildMockTranscriptService());
    const result = await engine.mineSession(meta);

    expect(result.signals.breakthrough[0].mastery.before).toBe(0.3);
    expect(result.signals.breakthrough[0].mastery.after).toBe(0.8);
  });

  it('无突破信号时应返回空数组', async () => {
    const engine = new SignalMiningEngine(buildMockTranscriptService());
    const result = await engine.mineSession(buildBasicMeta());

    expect(result.signals.breakthrough).toHaveLength(0);
  });
});

// ============================================================
// DISENGAGEMENT 信号检测
// ============================================================

describe('SignalMiningEngine — DISENGAGEMENT', () => {
  it('应检测到参与度持续下降', async () => {
    const turns = [];
    const history = [];
    // 前几轮正常长度，后面越来越短
    const lengths = [50, 45, 40, 8, 5, 3, 2, 1, 1, 1];
    for (let i = 0; i < lengths.length; i++) {
      turns.push({ index: i * 2, role: 'user', charCount: lengths[i], concepts: [] });
      turns.push({ index: i * 2 + 1, role: 'assistant', charCount: 30, concepts: [] });
      history.push({ role: 'user', content: '字'.repeat(lengths[i]) });
      history.push({ role: 'assistant', content: '回复内容回复内容回复内容回复内容回复内容' });
    }

    const meta = buildBasicMeta({ turns, conversationHistory: history });
    const engine = new SignalMiningEngine(buildMockTranscriptService());
    const result = await engine.mineSession(meta);

    const lowEngagement = result.signals.disengagement.filter(
      d => d.engagementScore < 0.3
    );
    expect(lowEngagement.length).toBeGreaterThan(0);
  });

  it('参与度稳定时不应标记脱离', async () => {
    const turns = [];
    const history = [];
    for (let i = 0; i < 6; i++) {
      turns.push({ index: i * 2, role: 'user', charCount: 30, concepts: [] });
      turns.push({ index: i * 2 + 1, role: 'assistant', charCount: 30, concepts: [] });
      history.push({ role: 'user', content: '这是一个正常长度的用户消息，包含足够的字数来表达观点' });
      history.push({ role: 'assistant', content: '这是AI的回复，同样包含合理的内容长度' });
    }

    const meta = buildBasicMeta({ turns, conversationHistory: history });
    const engine = new SignalMiningEngine(buildMockTranscriptService());
    const result = await engine.mineSession(meta);

    const severeDisengagement = result.signals.disengagement.filter(
      d => d.engagementScore < 0.3
    );
    expect(severeDisengagement).toHaveLength(0);
  });

  it('用户轮次不足 3 时应返回空', async () => {
    const meta = buildBasicMeta({
      turns: [
        { index: 0, role: 'user', charCount: 5, concepts: [] },
        { index: 1, role: 'assistant', charCount: 30, concepts: [] },
      ],
      conversationHistory: [
        { role: 'user', content: '嗯' },
        { role: 'assistant', content: '请继续说' },
      ],
    });

    const engine = new SignalMiningEngine(buildMockTranscriptService());
    const result = await engine.mineSession(meta);

    expect(result.signals.disengagement).toHaveLength(0);
  });
});

// ============================================================
// 跨会话关联
// ============================================================

describe('SignalMiningEngine — 跨会话关联', () => {
  it('应检测跨会话持续分歧', async () => {
    const priorSession = {
      sessionId: 'prior-1',
      userId: 'user-1',
      signals: {
        challenge: [{ turn: 2, detected: '不同意', handled: false }],
        confusion: [],
        breakthrough: [],
        disengagement: [],
      },
      strategiesApplied: [],
    };

    const currentMeta = buildBasicMeta({
      conversationHistory: [
        { role: 'user', content: '我不同意这个观点' },
        { role: 'assistant', content: '让我解释一下' },
      ],
      turns: [
        { index: 0, role: 'user', charCount: 10, concepts: [] },
        { index: 1, role: 'assistant', charCount: 10, concepts: [] },
      ],
    });

    const service = buildMockTranscriptService([priorSession, currentMeta]);
    const engine = new SignalMiningEngine(service);
    const result = await engine.mineWithContext(currentMeta, 3);

    expect(result.crossSession).not.toBeNull();
    expect(result.crossSession.persistentDisagreements.length).toBeGreaterThan(0);
  });

  it('应检测跨会话教学设计缺陷', async () => {
    const priorSession = {
      sessionId: 'prior-1',
      userId: 'user-1',
      signals: {
        challenge: [],
        confusion: [{ repeatedQueryOn: '授权管理', resolved: false }],
        breakthrough: [],
        disengagement: [],
      },
      strategiesApplied: [],
    };

    // 当前会话也有同一概念困惑
    const turns = [];
    const history = [];
    for (let i = 0; i < 4; i++) {
      turns.push({ index: i * 2, role: 'user', charCount: 15, concepts: [] });
      turns.push({ index: i * 2 + 1, role: 'assistant', charCount: 20, concepts: [] });
      history.push({ role: 'user', content: `关于授权管理我还是不太懂第${i + 1}次问` });
      history.push({ role: 'assistant', content: '授权管理是指...' });
    }

    const currentMeta = buildBasicMeta({ turns, conversationHistory: history });

    const service = buildMockTranscriptService([priorSession, currentMeta]);
    const engine = new SignalMiningEngine(service);
    const result = await engine.mineWithContext(currentMeta, 3);

    expect(result.crossSession).not.toBeNull();
    expect(result.crossSession.teachingDesignFlaws.length).toBeGreaterThan(0);
  });

  it('无历史会话时应优雅降级', async () => {
    const service = buildMockTranscriptService([]);
    const engine = new SignalMiningEngine(service);
    const result = await engine.mineWithContext(buildBasicMeta(), 3);

    expect(result.crossSession).toBeNull();
    expect(result.signals).toBeDefined();
  });

  it('transcriptService 出错时应优雅降级', async () => {
    const service = {
      getRecentByUser: jest.fn().mockRejectedValue(new Error('DB error')),
    };
    const engine = new SignalMiningEngine(service);
    const result = await engine.mineWithContext(buildBasicMeta(), 3);

    expect(result.crossSession).toBeNull();
    expect(result.signals).toBeDefined();
  });
});

// ============================================================
// 边界情况
// ============================================================

describe('SignalMiningEngine — 边界情况', () => {
  it('null sessionMeta 应返回空结果', async () => {
    const engine = new SignalMiningEngine(buildMockTranscriptService());
    const result = await engine.mineSession(null);

    expect(result.signals.challenge).toHaveLength(0);
    expect(result.signals.confusion).toHaveLength(0);
    expect(result.signals.breakthrough).toHaveLength(0);
    expect(result.signals.disengagement).toHaveLength(0);
    expect(result.summary.totalSignals).toBe(0);
  });

  it('空 turns 应返回空信号', async () => {
    const meta = buildBasicMeta({ turns: [], conversationHistory: [] });
    const engine = new SignalMiningEngine(buildMockTranscriptService());
    const result = await engine.mineSession(meta);

    expect(result.summary.totalSignals).toBe(0);
  });

  it('结果应包含 minedAt 时间戳', async () => {
    const engine = new SignalMiningEngine(buildMockTranscriptService());
    const result = await engine.mineSession(buildBasicMeta());

    expect(result.minedAt).toBeDefined();
    expect(new Date(result.minedAt).getTime()).not.toBeNaN();
  });

  it('summary.hasCritical 应在未处理挑战时为 true', async () => {
    const meta = buildBasicMeta({
      conversationHistory: [
        { role: 'user', content: '我不同意' },
        { role: 'assistant', content: '继续吧' }, // 未确认
      ],
      turns: [
        { index: 0, role: 'user', charCount: 4, concepts: [] },
        { index: 1, role: 'assistant', charCount: 3, concepts: [] },
      ],
    });

    const engine = new SignalMiningEngine(buildMockTranscriptService());
    const result = await engine.mineSession(meta);

    expect(result.summary.hasCritical).toBe(true);
  });
});
