/**
 * InsightCaptureSkill tests — TDD Red→Green→Refactor
 *
 * Covers:
 * 1. `name` returns 'insight_capture'
 * 2. scanForInsights action returns correct shape
 * 3. extractSessionInsights action returns correct shape
 * 4. Fallback works when LLM unavailable
 * 5. Default action routing works
 */

import { InsightCaptureSkill } from '../InsightCaptureSkill';

// Mock LLM — unavailable so we test fallback paths
jest.mock('../../agents/core/LLMClient', () => ({
  getLLMClient: () => ({
    chat: jest.fn().mockResolvedValue(''),
    chatJSON: jest.fn().mockResolvedValue(null),
  }),
  isLLMEnabled: jest.fn().mockReturnValue(false),
}));

const baseInput = {
  context: 'learner',
  userMessage: '',
  conversationHistory: [],
  userProfile: { roleLabel: '研发经理' },
  tenantConfig: {},
  metadata: {},
};

const makeInput = (metadataOverrides = {}) => ({
  ...baseInput,
  metadata: { ...baseInput.metadata, ...metadataOverrides },
});

describe('InsightCaptureSkill', () => {
  let skill;

  beforeEach(() => {
    skill = new InsightCaptureSkill();
  });

  // ---- Test 1: name ----
  describe('name', () => {
    it('returns "insight_capture"', () => {
      expect(skill.name).toBe('insight_capture');
    });
  });

  // ---- Test 2: scanForInsights ----
  describe('execute() with action="scanForInsights"', () => {
    it('returns SkillOutput with sideEffects array', async () => {
      const input = makeInput({
        action: 'scanForInsights',
        userText: '我发现团队协作最关键的是建立信任，这是我最大的收获。',
        conversationHistory: [
          { role: 'user', content: 'msg1' },
          { role: 'assistant', content: 'reply1' },
          { role: 'user', content: 'msg2' },
          { role: 'assistant', content: 'reply2' },
          { role: 'user', content: '我发现团队协作最关键的是建立信任' },
        ],
        sourceType: 'coach',
      });
      const output = await skill.execute(input);
      expect(Array.isArray(output.sideEffects)).toBe(true);
    });

    it('metadata contains hasInsight boolean', async () => {
      const input = makeInput({
        action: 'scanForInsights',
        userText: '我发现了一个很重要的经验教训。',
        conversationHistory: [
          { role: 'user', content: 'msg1' },
          { role: 'assistant', content: 'reply1' },
          { role: 'user', content: 'msg2' },
          { role: 'assistant', content: 'reply2' },
          { role: 'user', content: 'msg3' },
        ],
        sourceType: 'coach',
      });
      const output = await skill.execute(input);
      expect(typeof output.metadata.hasInsight).toBe('boolean');
    });

    it('returns hasInsight false for short text', async () => {
      const input = makeInput({
        action: 'scanForInsights',
        userText: '好的',
        conversationHistory: [],
        sourceType: 'coach',
      });
      const output = await skill.execute(input);
      expect(output.metadata.hasInsight).toBe(false);
    });

    it('insight is null or has required schema fields when present', async () => {
      const input = makeInput({
        action: 'scanForInsights',
        userText: '我发现团队建设最重要的步骤就是先建立信任，我总结出了有效的方法。',
        conversationHistory: [
          { role: 'user', content: 'u1' },
          { role: 'assistant', content: 'a1' },
          { role: 'user', content: 'u2' },
          { role: 'assistant', content: 'a2' },
          { role: 'user', content: 'u3' },
        ],
        sourceType: 'coach',
      });
      const output = await skill.execute(input);
      if (output.metadata.hasInsight && output.metadata.insight) {
        const insight = output.metadata.insight;
        expect(typeof insight.id).toBe('string');
        expect(typeof insight.title).toBe('string');
        expect(typeof insight.status).toBe('string');
      } else {
        expect(output.metadata.insight).toBeNull();
      }
    });
  });

  // ---- Test 3: extractSessionInsights ----
  describe('execute() with action="extractSessionInsights"', () => {
    const extractInput = () =>
      makeInput({
        action: 'extractSessionInsights',
        conversationHistory: [
          { role: 'user', content: '我发现管理团队最关键的是信任，这是我的最大收获。' },
          { role: 'assistant', content: '这是一个很好的洞察。' },
          { role: 'user', content: '成功的项目背后，总是先把人的问题解决了。' },
        ],
        sourceType: 'scenario',
      });

    it('returns SkillOutput with sideEffects array', async () => {
      const output = await skill.execute(extractInput());
      expect(Array.isArray(output.sideEffects)).toBe(true);
    });

    it('metadata contains insights array', async () => {
      const output = await skill.execute(extractInput());
      expect(Array.isArray(output.metadata.insights)).toBe(true);
    });

    it('returns empty insights when no user messages', async () => {
      const input = makeInput({
        action: 'extractSessionInsights',
        conversationHistory: [],
        sourceType: 'coach',
      });
      const output = await skill.execute(input);
      expect(output.metadata.insights).toHaveLength(0);
    });

    it('insights have correct schema when extracted', async () => {
      const output = await skill.execute(extractInput());
      output.metadata.insights.forEach((insight) => {
        expect(typeof insight.id).toBe('string');
        expect(typeof insight.title).toBe('string');
        expect(typeof insight.status).toBe('string');
      });
    });
  });

  // ---- Test 4: fallback behavior ----
  describe('fallback behavior without LLM', () => {
    it('scanForInsights returns valid output without LLM', async () => {
      const input = makeInput({
        action: 'scanForInsights',
        userText: '短文本',
        conversationHistory: [],
        sourceType: 'coach',
      });
      const output = await skill.execute(input);
      expect(output.metadata).toBeDefined();
      expect(typeof output.metadata.hasInsight).toBe('boolean');
    });

    it('extractSessionInsights returns insights array without LLM', async () => {
      const input = makeInput({
        action: 'extractSessionInsights',
        conversationHistory: [
          { role: 'user', content: '我发现了重要经验教训，以后不应该这样做。' },
        ],
        sourceType: 'scenario',
      });
      const output = await skill.execute(input);
      expect(Array.isArray(output.metadata.insights)).toBe(true);
    });
  });

  // ---- Test 5: default action routing ----
  describe('default action routing', () => {
    it('defaults to scanForInsights when metadata.action is missing', async () => {
      const input = makeInput({
        userText: '测试',
        conversationHistory: [],
        sourceType: 'coach',
      });
      const output = await skill.execute(input);
      expect(output.metadata).toBeDefined();
      expect(typeof output.metadata.hasInsight).toBe('boolean');
    });
  });
});
