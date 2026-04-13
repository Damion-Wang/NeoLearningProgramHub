/**
 * ProfilingSkill tests — TDD Red→Green→Refactor
 *
 * Covers:
 * 1. `name` returns 'profiling'
 * 2. buildProfile action returns correct shape
 * 3. Fallback works when LLM unavailable (structured profile from assessment data)
 * 4. Default action routing works
 */

import { ProfilingSkill } from '../ProfilingSkill';

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
  userProfile: null,
  tenantConfig: {},
  metadata: {},
};

const makeInput = (metadataOverrides = {}) => ({
  ...baseInput,
  metadata: { ...baseInput.metadata, ...metadataOverrides },
});

describe('ProfilingSkill', () => {
  let skill;

  beforeEach(() => {
    skill = new ProfilingSkill();
  });

  // ---- Test 1: name ----
  describe('name', () => {
    it('returns "profiling"', () => {
      expect(skill.name).toBe('profiling');
    });
  });

  // ---- Test 2: buildProfile ----
  describe('execute() with action="buildProfile"', () => {
    const profileInput = () =>
      makeInput({
        action: 'buildProfile',
        beiAnswers: {
          position: '研发团队负责人，管理10人',
          keyTasks: '技术攻关；团队培养；跨部门协调',
          criticalEvent: '带领团队在紧迫时间内完成了核心模块重构，最终按时上线。',
          successFactors: '提前做好分工和风险预案',
          growthFocus: '如何提升团队激励和凝聚力',
        },
        interviewDiagnostics: {},
        userRole: 'rd',
      });

    it('returns SkillOutput with sideEffects array', async () => {
      const output = await skill.execute(profileInput());
      expect(Array.isArray(output.sideEffects)).toBe(true);
    });

    it('metadata contains profile object', async () => {
      const output = await skill.execute(profileInput());
      expect(output.metadata.profile).toBeDefined();
      expect(typeof output.metadata.profile).toBe('object');
    });

    it('profile has role field', async () => {
      const output = await skill.execute(profileInput());
      expect(typeof output.metadata.profile.role).toBe('string');
    });

    it('profile has roleLabel field', async () => {
      const output = await skill.execute(profileInput());
      expect(typeof output.metadata.profile.roleLabel).toBe('string');
    });

    it('profile has currentChallenges array', async () => {
      const output = await skill.execute(profileInput());
      expect(Array.isArray(output.metadata.profile.currentChallenges)).toBe(true);
    });

    it('profile has desiredOutcomes array', async () => {
      const output = await skill.execute(profileInput());
      expect(Array.isArray(output.metadata.profile.desiredOutcomes)).toBe(true);
    });

    it('profile has focusCapabilities array', async () => {
      const output = await skill.execute(profileInput());
      expect(Array.isArray(output.metadata.profile.focusCapabilities)).toBe(true);
    });

    it('profile has scenarioMaterials object', async () => {
      const output = await skill.execute(profileInput());
      expect(output.metadata.profile.scenarioMaterials).toBeDefined();
      expect(Array.isArray(output.metadata.profile.scenarioMaterials.bestPractices)).toBe(true);
      expect(Array.isArray(output.metadata.profile.scenarioMaterials.insufficiencies)).toBe(true);
      expect(Array.isArray(output.metadata.profile.scenarioMaterials.trainingTargets)).toBe(true);
    });

    it('metadata indicates fallback when LLM unavailable', async () => {
      const output = await skill.execute(profileInput());
      // With LLM mocked as unavailable, should use fallback
      expect(output.metadata._fallback).toBe(true);
    });
  });

  // ---- Test 3: fallback with minimal data ----
  describe('fallback behavior without LLM', () => {
    it('returns valid profile even with empty beiAnswers', async () => {
      const input = makeInput({
        action: 'buildProfile',
        beiAnswers: {},
        interviewDiagnostics: {},
        userRole: 'general',
      });
      const output = await skill.execute(input);
      expect(output.metadata.profile).toBeDefined();
      expect(typeof output.metadata.profile.role).toBe('string');
      expect(typeof output.metadata.profile.roleLabel).toBe('string');
    });

    it('fallback roleLabel uses known role mapping for rd', async () => {
      const input = makeInput({
        action: 'buildProfile',
        beiAnswers: {},
        interviewDiagnostics: {},
        userRole: 'rd',
      });
      const output = await skill.execute(input);
      expect(output.metadata.profile.roleLabel).toBe('研发管理');
    });

    it('fallback roleLabel uses known role mapping for sales', async () => {
      const input = makeInput({
        action: 'buildProfile',
        beiAnswers: {},
        interviewDiagnostics: {},
        userRole: 'sales',
      });
      const output = await skill.execute(input);
      expect(output.metadata.profile.roleLabel).toBe('销售管理');
    });
  });

  // ---- Test 4: default action routing ----
  describe('default action routing', () => {
    it('defaults to buildProfile when metadata.action is missing', async () => {
      const input = makeInput({
        beiAnswers: { position: '研发主管' },
        userRole: 'rd',
      });
      const output = await skill.execute(input);
      expect(output.metadata.profile).toBeDefined();
    });
  });
});
