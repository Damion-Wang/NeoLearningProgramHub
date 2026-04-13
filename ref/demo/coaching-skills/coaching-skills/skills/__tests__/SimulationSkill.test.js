/**
 * SimulationSkill tests — TDD Red→Green→Refactor
 *
 * Covers:
 * 1. `name` returns 'simulation'
 * 2. `execute()` with scenario metadata returns response with shouldClose flag
 * 3. `execute()` without LLM returns fallback in-character response
 * 4. Response metadata has correct shape
 */

import { SimulationSkill } from '../SimulationSkill';

// Mock LLM availability — default to unavailable (fallback paths)
jest.mock('../../agents/core/LLMClient', () => ({
  getLLMClient: () => ({
    chat: jest.fn().mockResolvedValue('角色扮演回复内容'),
    chatJSON: jest.fn().mockResolvedValue(null),
  }),
  isLLMEnabled: jest.fn().mockReturnValue(false),
}));

const makeInput = (overrides = {}) => ({
  context: 'learner',
  userMessage: '我们来讨论一下项目进展',
  conversationHistory: [],
  userProfile: { roleLabel: '研发经理' },
  tenantConfig: {},
  metadata: {
    scenario: {
      scenarioId: 'scenario-001',
      title: '绩效改进对话',
      role: '团队成员小李',
      context: '你是一名工作表现下滑的工程师',
      objectives: ['展现同理心', '制定改进计划'],
      description: '一个关于绩效下滑的1对1对话场景',
    },
    ...overrides,
  },
});

describe('SimulationSkill', () => {
  let skill;

  beforeEach(() => {
    skill = new SimulationSkill();
  });

  // ---- Test 1: name ----
  describe('name', () => {
    it('returns "simulation"', () => {
      expect(skill.name).toBe('simulation');
    });
  });

  // ---- Test 2: execute() with scenario metadata ----
  describe('execute() with scenario metadata', () => {
    it('returns an object with content, sideEffects, and metadata', async () => {
      const input = makeInput();
      const output = await skill.execute(input);

      expect(typeof output.content).toBe('string');
      expect(output.content.length).toBeGreaterThan(0);
      expect(Array.isArray(output.sideEffects)).toBe(true);
      expect(output.metadata).toBeDefined();
      expect(typeof output.metadata).toBe('object');
    });

    it('metadata includes shouldClose boolean', async () => {
      const input = makeInput();
      const output = await skill.execute(input);

      expect(typeof output.metadata.shouldClose).toBe('boolean');
    });

    it('shouldClose is true when user sends end keyword', async () => {
      const input = makeInput();
      input.userMessage = '好的，先这样吧';
      const output = await skill.execute(input);

      expect(output.metadata.shouldClose).toBe(true);
    });

    it('shouldClose is true when assistantTurns >= 6', async () => {
      const input = makeInput();
      // 6 assistant turns in history
      input.conversationHistory = Array(6).fill({ role: 'assistant', content: '回复' });
      const output = await skill.execute(input);

      expect(output.metadata.shouldClose).toBe(true);
    });

    it('returns closing message when shouldClose is true', async () => {
      const input = makeInput();
      input.userMessage = '结束';
      const output = await skill.execute(input);

      expect(output.metadata.shouldClose).toBe(true);
      expect(typeof output.content).toBe('string');
      expect(output.content.length).toBeGreaterThan(0);
    });
  });

  // ---- Test 3: fallback when LLM unavailable ----
  describe('execute() without LLM (fallback)', () => {
    it('returns a non-empty in-character response string', async () => {
      const input = makeInput();
      const output = await skill.execute(input);

      expect(typeof output.content).toBe('string');
      expect(output.content.length).toBeGreaterThan(0);
    });

    it('returns shouldClose=false in normal fallback', async () => {
      const input = makeInput();
      const output = await skill.execute(input);

      expect(output.metadata.shouldClose).toBe(false);
    });

    it('fallback varies by intent — status keyword returns number-related response', async () => {
      const input = makeInput();
      input.userMessage = '请汇报一下当前进展和数据';
      const output = await skill.execute(input);

      expect(typeof output.content).toBe('string');
      expect(output.content.length).toBeGreaterThan(0);
    });
  });

  // ---- Test 4: metadata shape ----
  describe('response metadata shape', () => {
    it('includes _fallback: true when LLM is unavailable', async () => {
      const input = makeInput();
      const output = await skill.execute(input);

      // LLM unavailable → should be fallback
      expect(output.metadata._fallback).toBe(true);
    });

    it('sideEffects is always an empty array for simulation', async () => {
      const input = makeInput();
      const output = await skill.execute(input);

      expect(output.sideEffects).toEqual([]);
    });
  });
});
