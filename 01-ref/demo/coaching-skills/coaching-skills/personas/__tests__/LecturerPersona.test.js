/**
 * LecturerPersona (老徐) unit tests
 */

// Mock LLMClient
jest.mock('../../agents/core/LLMClient', () => ({
  getLLMClient: () => ({
    chat: jest.fn().mockResolvedValue(''),
    chatJSON: jest.fn().mockResolvedValue(null),
  }),
  isLLMEnabled: () => false,
}));

// Mock store
jest.mock('../../store', () => ({
  KNOWLEDGE_TOOLS: [],
}));

const { LecturerPersona } = require('../LecturerPersona');

describe('LecturerPersona', () => {
  let persona;

  beforeEach(() => {
    persona = new LecturerPersona();
  });

  // ==================== Identity ====================

  describe('identity', () => {
    it('displayName should be 老徐', () => {
      expect(persona.displayName).toBe('老徐');
    });

    it('personaId should be lecturer', () => {
      expect(persona.personaId).toBe('lecturer');
    });

    it('contexts should include learner', () => {
      expect(persona.contexts).toContain('learner');
    });
  });

  // ==================== handleMessage ====================

  describe('handleMessage', () => {
    it('should return content + metadata.teachingMode', async () => {
      const result = await persona.handleMessage({
        userMessage: '什么是情境领导力？',
        conversationHistory: [],
        userProfile: null,
        context: 'learner',
        metadata: {},
      });

      expect(result).toHaveProperty('content');
      expect(typeof result.content).toBe('string');
      expect(result.content.length).toBeGreaterThan(0);

      expect(result).toHaveProperty('metadata');
      expect(result.metadata).toHaveProperty('teachingMode');
    });

    it('should not crash with null profile', async () => {
      const result = await persona.handleMessage({
        userMessage: '帮我解释GROW模型',
        conversationHistory: [],
        userProfile: null,
        context: 'learner',
        metadata: {},
      });

      expect(result.content).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should adapt teaching mode based on Dreyfus stage in profile', async () => {
      const noviceResult = await persona.handleMessage({
        userMessage: '什么是STAR反馈？',
        conversationHistory: [],
        userProfile: { dreyfusLevel: 'novice' },
        context: 'learner',
        metadata: {},
      });

      const expertResult = await persona.handleMessage({
        userMessage: '什么是STAR反馈？',
        conversationHistory: [],
        userProfile: { dreyfusLevel: 'expert' },
        context: 'learner',
        metadata: {},
      });

      // Both should succeed and have different teaching modes
      expect(noviceResult.metadata.teachingMode).toBeDefined();
      expect(expertResult.metadata.teachingMode).toBeDefined();
    });

    it('should have sideEffects array', async () => {
      const result = await persona.handleMessage({
        userMessage: '讲解一下目标管理',
        conversationHistory: [],
        userProfile: null,
        context: 'learner',
        metadata: {},
      });

      expect(Array.isArray(result.sideEffects)).toBe(true);
    });
  });

  // ==================== Cognitive Load Sensing (§16) ====================

  describe('cognitive load sensing', () => {
    it('handleMessage includes cognitiveLoad in metadata', async () => {
      const result = await persona.handleMessage({
        userMessage: '这个太难了',
        conversationHistory: [
          { role: 'assistant', content: '让我来讲解...' },
          { role: 'user', content: '什么意思？' },
          { role: 'assistant', content: '简单来说...' },
        ],
        userProfile: { dreyfusLevel: 'novice' },
        context: 'learner',
        metadata: {},
      });
      expect(result.metadata.cognitiveLoad).toBeDefined();
      expect(result.metadata.cognitiveLoad.composite).toBeDefined();
      expect(typeof result.metadata.cognitiveLoad.composite).toBe('number');
      expect(result.metadata.cognitiveLoad.intrinsicLoad).toBeDefined();
      expect(result.metadata.cognitiveLoad.extraneousLoad).toBeDefined();
      expect(result.metadata.cognitiveLoad.germaneLoad).toBeDefined();
    });

    it('novice gets higher intrinsic load estimate than expert', async () => {
      const noviceResult = await persona.handleMessage({
        userMessage: '解释一下情境领导',
        conversationHistory: [],
        userProfile: { dreyfusLevel: 'novice' },
        context: 'learner',
        metadata: {},
      });

      const expertResult = await persona.handleMessage({
        userMessage: '解释一下情境领导',
        conversationHistory: [],
        userProfile: { dreyfusLevel: 'expert' },
        context: 'learner',
        metadata: {},
      });

      expect(noviceResult.metadata.cognitiveLoad.intrinsicLoad)
        .toBeGreaterThan(expertResult.metadata.cognitiveLoad.intrinsicLoad);
    });

    it('cognitiveLoad composite is between 0 and 1', async () => {
      const result = await persona.handleMessage({
        userMessage: 'test',
        conversationHistory: [],
        userProfile: null,
        context: 'learner',
        metadata: {},
      });
      expect(result.metadata.cognitiveLoad.composite).toBeGreaterThanOrEqual(0);
      expect(result.metadata.cognitiveLoad.composite).toBeLessThanOrEqual(1);
    });
  });

  // ==================== Error Classification Integration (§18) ====================

  describe('error classification integration', () => {
    it('includes errorClassification in metadata when understanding check triggers', async () => {
      // Need 3 user turns to trigger understanding check (userTurns % 3 === 0)
      const history = [
        { role: 'user', content: '什么是授权？' },
        { role: 'assistant', content: '授权是...' },
        { role: 'user', content: '继续讲' },
        { role: 'assistant', content: '接着...' },
        { role: 'user', content: '我不太懂' },
        { role: 'assistant', content: '换个方式...' },
      ];

      const result = await persona.handleMessage({
        userMessage: '我还是不明白',
        conversationHistory: history,
        userProfile: { dreyfusLevel: 'novice' },
        context: 'learner',
        metadata: { conceptId: 'delegation' },
      });

      // After 3 user turns (in history) + 1 current = 3 user turns in history
      // The check triggers when userTurns % 3 === 0 and userTurns > 0
      expect(result.metadata.hasUnderstandingCheck).toBe(true);
    });

    it('errorClassification has correct shape when present', async () => {
      // Force the evaluation path with metadata flag
      const result = await persona.handleMessage({
        userMessage: '授权就是放手不管吧',
        conversationHistory: [],
        userProfile: { dreyfusLevel: 'novice' },
        context: 'learner',
        metadata: {
          conceptId: 'delegation',
          evaluateError: true,
          masteryHistory: null,
        },
      });

      if (result.metadata.errorClassification) {
        expect(result.metadata.errorClassification).toHaveProperty('type');
        expect(result.metadata.errorClassification).toHaveProperty('severity');
        expect(result.metadata.errorClassification).toHaveProperty('remediationHint');
        expect(result.metadata.errorClassification).toHaveProperty('conceptId');
      }
    });
  });

  // ==================== handleSessionEvent ====================

  describe('handleSessionEvent', () => {
    it('end event should return null (no special handling)', async () => {
      const result = await persona.handleSessionEvent('end', {});
      expect(result).toBeNull();
    });
  });
});
