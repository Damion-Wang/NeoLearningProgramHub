/**
 * RetrospectiveSkill tests — TDD Red→Green→Refactor
 *
 * Covers:
 * 1. `name` returns 'retrospective'
 * 2. conductRetrospective action returns correct shape
 * 3. generateFollowUp action returns correct shape
 * 4. Fallback works when LLM unavailable (structured prompts)
 * 5. Default action routing works
 */

import { RetrospectiveSkill } from '../RetrospectiveSkill';

// Mock LLM — unavailable so we test fallback paths
jest.mock('../../agents/core/LLMClient', () => ({
  getLLMClient: () => ({
    chat: jest.fn().mockResolvedValue(''),
    chatJSON: jest.fn().mockResolvedValue(null),
  }),
  isLLMEnabled: jest.fn().mockReturnValue(false),
}));

// Mock competencyDynamicsEngine
jest.mock('../../modules/competencyDynamicsEngine', () => ({
  assessRetrospectiveDepth: jest.fn().mockReturnValue({
    level: 2,
    label: '反思',
    bloomLevel: 'analysis',
  }),
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

describe('RetrospectiveSkill', () => {
  let skill;

  beforeEach(() => {
    skill = new RetrospectiveSkill();
  });

  // ---- Test 1: name ----
  describe('name', () => {
    it('returns "retrospective"', () => {
      expect(skill.name).toBe('retrospective');
    });
  });

  // ---- Test 2: conductRetrospective ----
  describe('execute() with action="conductRetrospective"', () => {
    const retroInput = () =>
      makeInput({
        action: 'conductRetrospective',
        retrospectiveText: '我上周和小王进行了一对一谈话，提前做了充分准备，会议顺利完成了目标设定。但沟通时有些紧张，下次需要更自然。',
        inputType: 'text',
        originalTodo: {
          title: '与小王进行绩效面谈',
          description: '讨论季度目标和改进计划',
          relatedCapabilities: ['coaching'],
          relatedTools: ['grow-model'],
        },
      });

    it('returns SkillOutput with sideEffects array', async () => {
      const output = await skill.execute(retroInput());
      expect(Array.isArray(output.sideEffects)).toBe(true);
    });

    it('metadata contains summary object', async () => {
      const output = await skill.execute(retroInput());
      expect(output.metadata.summary).toBeDefined();
    });

    it('summary has strengths, improvements, surprises arrays', async () => {
      const output = await skill.execute(retroInput());
      expect(Array.isArray(output.metadata.summary.strengths)).toBe(true);
      expect(Array.isArray(output.metadata.summary.improvements)).toBe(true);
      expect(Array.isArray(output.metadata.summary.surprises)).toBe(true);
    });

    it('metadata contains goalAchievement string', async () => {
      const output = await skill.execute(retroInput());
      expect(typeof output.metadata.goalAchievement).toBe('string');
    });

    it('metadata contains keyBehaviors array', async () => {
      const output = await skill.execute(retroInput());
      expect(Array.isArray(output.metadata.keyBehaviors)).toBe(true);
    });

    it('metadata contains overallAssessment string', async () => {
      const output = await skill.execute(retroInput());
      expect(typeof output.metadata.overallAssessment).toBe('string');
    });

    it('returns error output for too-short retrospective text', async () => {
      const input = makeInput({
        action: 'conductRetrospective',
        retrospectiveText: '短',
        inputType: 'text',
        originalTodo: null,
      });
      const output = await skill.execute(input);
      expect(output.metadata.summary).toBeDefined();
      expect(output.metadata.goalAchievement).toBeDefined();
    });
  });

  // ---- Test 3: generateFollowUp ----
  describe('execute() with action="generateFollowUp"', () => {
    const followUpInput = () =>
      makeInput({
        action: 'generateFollowUp',
        retrospectiveResult: {
          summary: {
            strengths: ['准备充分', '沟通到位'],
            improvements: ['需要更自然的表达'],
            surprises: [],
          },
          overallAssessment: '整体表现良好，有明确改进方向。',
        },
        originalTodo: {
          title: '与小王进行绩效面谈',
          description: '讨论季度目标',
          relatedCapabilities: ['coaching'],
          relatedTools: [],
        },
      });

    it('returns SkillOutput with sideEffects array', async () => {
      const output = await skill.execute(followUpInput());
      expect(Array.isArray(output.sideEffects)).toBe(true);
    });

    it('metadata contains nextSteps array', async () => {
      const output = await skill.execute(followUpInput());
      expect(Array.isArray(output.metadata.nextSteps)).toBe(true);
    });

    it('metadata contains suggestedScenarios array', async () => {
      const output = await skill.execute(followUpInput());
      expect(Array.isArray(output.metadata.suggestedScenarios)).toBe(true);
    });

    it('nextSteps has at least one item in fallback', async () => {
      const output = await skill.execute(followUpInput());
      expect(output.metadata.nextSteps.length).toBeGreaterThan(0);
    });
  });

  // ---- Test 4: fallback behavior ----
  describe('fallback behavior without LLM', () => {
    it('conductRetrospective returns rule-based result when LLM unavailable', async () => {
      const input = makeInput({
        action: 'conductRetrospective',
        retrospectiveText: '会议顺利完成，团队沟通充分，计划提前做好了准备。',
        inputType: 'text',
        originalTodo: null,
      });
      const output = await skill.execute(input);
      expect(output.metadata.summary).toBeDefined();
      expect(Array.isArray(output.metadata.summary.strengths)).toBe(true);
    });

    it('generateFollowUp returns default steps when LLM unavailable', async () => {
      const input = makeInput({
        action: 'generateFollowUp',
        retrospectiveResult: { summary: { strengths: [], improvements: [] }, overallAssessment: '' },
        originalTodo: null,
      });
      const output = await skill.execute(input);
      expect(output.metadata.nextSteps.length).toBeGreaterThan(0);
    });
  });

  // ---- Test 5: default action routing ----
  describe('default action routing', () => {
    it('defaults to conductRetrospective when metadata.action is missing', async () => {
      const input = makeInput({
        retrospectiveText: '今天的会议效果不错，完成了目标设定。',
        inputType: 'text',
        originalTodo: null,
      });
      const output = await skill.execute(input);
      expect(output.metadata.summary).toBeDefined();
    });
  });
});
