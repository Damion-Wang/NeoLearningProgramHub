/**
 * CoachPersona (老段) unit tests
 *
 * LLM not available in tests — all Skills fall back to rule-based paths.
 * Uses real coachPersonaEngine singleton (reset before each test).
 */

import { CoachPersona } from '../CoachPersona';
import { getPersonaEngine } from '../../modules/coachPersonaEngine';

// Disable LLM in test environment
const originalEnv = process.env.REACT_APP_LLM_PROXY_ENABLED;
beforeAll(() => { process.env.REACT_APP_LLM_PROXY_ENABLED = 'false'; });
afterAll(() => {
  if (originalEnv === undefined) delete process.env.REACT_APP_LLM_PROXY_ENABLED;
  else process.env.REACT_APP_LLM_PROXY_ENABLED = originalEnv;
});

describe('CoachPersona', () => {
  let persona;

  beforeEach(() => {
    getPersonaEngine().reset();
    persona = new CoachPersona();
  });

  // ==================== Identity ====================

  describe('identity', () => {
    it('displayName should be Leo', () => {
      expect(persona.displayName).toBe('Leo');
    });

    it('personaId should be coach', () => {
      expect(persona.personaId).toBe('coach');
    });

    it('contexts should include learner', () => {
      expect(persona.contexts).toContain('learner');
    });
  });

  // ==================== handleMessage ====================

  describe('handleMessage', () => {
    it('should return PersonaOutput shape (content, metadata.persona, sideEffects)', async () => {
      const result = await persona.handleMessage({
        userMessage: '你好，我想聊聊团队管理',
        conversationHistory: [],
        userProfile: null,
        context: 'learner',
        metadata: {},
      });

      expect(result).toHaveProperty('content');
      expect(typeof result.content).toBe('string');
      expect(result.content.length).toBeGreaterThan(0);

      expect(result).toHaveProperty('metadata');
      expect(result.metadata).toHaveProperty('persona');

      expect(result).toHaveProperty('sideEffects');
      expect(Array.isArray(result.sideEffects)).toBe(true);
    });

    it('should not crash with null profile', async () => {
      const result = await persona.handleMessage({
        userMessage: '帮我分析一下这个问题',
        conversationHistory: [],
        userProfile: null,
        context: 'learner',
        metadata: {},
      });

      expect(result.content).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('sideEffects should include ASYNC_DETECT_TODO and ASYNC_INSIGHT_SCAN', async () => {
      const result = await persona.handleMessage({
        userMessage: '我打算下周找团队成员谈一下绩效问题',
        conversationHistory: [],
        userProfile: { dreyfusLevel: 'competent' },
        context: 'learner',
        metadata: {},
      });

      const types = result.sideEffects.map(se => se.type);
      expect(types).toContain('ASYNC_DETECT_TODO');
      expect(types).toContain('ASYNC_INSIGHT_SCAN');

      // Each side effect should have an execute function
      result.sideEffects.forEach(se => {
        expect(typeof se.execute).toBe('function');
      });
    });

    it('handleMessage returns signalDetection in metadata', async () => {
      const result = await persona.handleMessage({
        userMessage: '我知道应该授权但总是做不到',
        conversationHistory: [],
        userProfile: { dreyfusLevel: 'competent' },
        context: 'learner',
      });
      expect(result.metadata.signalDetection).toBeDefined();
      expect(result.metadata.signalDetection.primary).toBe('⑤');
    });

    it('signalDetection is null when no signal detected', async () => {
      const result = await persona.handleMessage({
        userMessage: '你好',
        conversationHistory: [],
        userProfile: null,
        context: 'learner',
      });
      expect(result.metadata.signalDetection).toBeDefined();
      expect(result.metadata.signalDetection.primary).toBeNull();
    });

    it('should build panelHint from coaching metadata', async () => {
      const result = await persona.handleMessage({
        userMessage: '你好',
        conversationHistory: [],
        userProfile: null,
        context: 'learner',
        metadata: {},
      });

      // panelHint may be null for simple messages, but metadata should have it
      expect(result.metadata).toHaveProperty('panelHint');
    });
  });

  // ==================== handleSessionEvent ====================

  describe('handleSessionEvent', () => {
    it('end event should return BATCH_INSIGHT_EXTRACTION sideEffect', async () => {
      const result = await persona.handleSessionEvent('end', {
        conversationHistory: [
          { role: 'user', content: '这次训练让我学到了很多' },
          { role: 'assistant', content: '很高兴听到' },
        ],
      });

      expect(result).not.toBeNull();
      expect(result.sideEffects).toBeDefined();
      expect(result.sideEffects.length).toBeGreaterThan(0);

      const batchEffect = result.sideEffects.find(se => se.type === 'BATCH_INSIGHT_EXTRACTION');
      expect(batchEffect).toBeDefined();
      expect(typeof batchEffect.execute).toBe('function');
    });

    it('start event should return null (no-op)', async () => {
      const result = await persona.handleSessionEvent('start', {});
      expect(result).toBeNull();
    });
  });
});
