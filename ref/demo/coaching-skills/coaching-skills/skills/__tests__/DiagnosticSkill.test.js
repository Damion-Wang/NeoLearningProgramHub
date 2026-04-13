/**
 * DiagnosticSkill tests — TDD Red→Green→Refactor
 *
 * Covers:
 * 1. `name` returns 'diagnostic'
 * 2. evaluateAnswer action returns correct shape
 * 3. generateProbe action returns correct shape
 * 4. Fallback works when LLM unavailable
 * 5. Default action routing works
 */

import { DiagnosticSkill } from '../DiagnosticSkill';

// Mock LLM — unavailable so we test fallback paths
jest.mock('../../agents/core/LLMClient', () => ({
  getLLMClient: () => ({
    chat: jest.fn().mockResolvedValue(''),
    chatJSON: jest.fn().mockResolvedValue(null),
  }),
  isLLMEnabled: jest.fn().mockReturnValue(false),
}));

// Mock beiInterviewEngine
jest.mock('../../modules/beiInterviewEngine', () => ({
  evaluateQuestionFollowup: jest.fn().mockReturnValue({
    needFollowup: true,
    followupQuestion: '请具体描述你的行动步骤。',
    facts: ['事实1'],
    gaps: ['缺失维度'],
  }),
  shouldUseLlmProbe: jest.fn().mockReturnValue(false),
  detectUserQuestionInAnswer: jest.fn().mockReturnValue(false),
  detectDSTF: jest.fn().mockReturnValue({ hasAction: true, hasDialogue: false, hasThinking: false, hasFeeling: false }),
  detectWeNotI: jest.fn().mockReturnValue(false),
  detectGeneralization: jest.fn().mockReturnValue(false),
  BEI_INTERVIEW_QUESTIONS: [
    {
      id: 'criticalEvent',
      label: '描述一个关键成功事件',
      category: 'behavior-event',
      purpose: '了解行为证据',
      maxFollowupRounds: 2,
    },
  ],
}));

// Mock beiCompetencyFramework
jest.mock('../../modules/beiCompetencyFramework', () => ({
  CAPABILITY_INDICATOR_MAPPING: { communication: 'indicator_1' },
  BEI_10_INDICATORS: { indicator_1: { name: '沟通能力' } },
  buildExpectedPerformance: jest.fn().mockReturnValue({ bandLabel: 'competent', behavior: '有效沟通' }),
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

describe('DiagnosticSkill', () => {
  let skill;

  beforeEach(() => {
    skill = new DiagnosticSkill();
  });

  // ---- Test 1: name ----
  describe('name', () => {
    it('returns "diagnostic"', () => {
      expect(skill.name).toBe('diagnostic');
    });
  });

  // ---- Test 2: evaluateAnswer ----
  describe('execute() with action="evaluateAnswer"', () => {
    const evalInput = () =>
      makeInput({
        action: 'evaluateAnswer',
        questionId: 'criticalEvent',
        answerText: '我当时带领团队完成了一个非常重要的项目，最终顺利交付。',
        previousAnswers: {},
      });

    it('returns SkillOutput with sideEffects array', async () => {
      const output = await skill.execute(evalInput());
      expect(Array.isArray(output.sideEffects)).toBe(true);
    });

    it('metadata contains evaluation result with needFollowup', async () => {
      const output = await skill.execute(evalInput());
      expect(output.metadata).toBeDefined();
      expect(typeof output.metadata.needFollowup).toBe('boolean');
    });

    it('metadata contains facts and gaps arrays', async () => {
      const output = await skill.execute(evalInput());
      expect(Array.isArray(output.metadata.facts)).toBe(true);
      expect(Array.isArray(output.metadata.gaps)).toBe(true);
    });

    it('metadata contains shouldUseLlm boolean', async () => {
      const output = await skill.execute(evalInput());
      expect(typeof output.metadata.shouldUseLlm).toBe('boolean');
    });
  });

  // ---- Test 3: generateProbe ----
  describe('execute() with action="generateProbe"', () => {
    const probeInput = () =>
      makeInput({
        action: 'generateProbe',
        questionId: 'criticalEvent',
        answerText: '我们一起完成了这个项目。',
        previousAnswers: {},
        diagnosticGaps: ['缺少具体行动'],
        followupRound: 0,
      });

    it('returns SkillOutput with sideEffects array', async () => {
      const output = await skill.execute(probeInput());
      expect(Array.isArray(output.sideEffects)).toBe(true);
    });

    it('metadata contains needFollowup boolean', async () => {
      const output = await skill.execute(probeInput());
      expect(typeof output.metadata.needFollowup).toBe('boolean');
    });

    it('metadata contains followupQuestion string', async () => {
      const output = await skill.execute(probeInput());
      expect(typeof output.metadata.followupQuestion).toBe('string');
    });

    it('metadata contains facts and gaps arrays', async () => {
      const output = await skill.execute(probeInput());
      expect(Array.isArray(output.metadata.facts)).toBe(true);
      expect(Array.isArray(output.metadata.gaps)).toBe(true);
    });
  });

  // ---- Test 4: fallback for unknown question ----
  describe('fallback for unknown questionId', () => {
    it('evaluateAnswer returns safe default when questionId not found', async () => {
      const input = makeInput({
        action: 'evaluateAnswer',
        questionId: 'nonexistent_question',
        answerText: '测试回答',
      });
      const output = await skill.execute(input);
      expect(output.metadata).toBeDefined();
      expect(typeof output.metadata.needFollowup).toBe('boolean');
    });

    it('generateProbe returns safe default when questionId not found', async () => {
      const input = makeInput({
        action: 'generateProbe',
        questionId: 'nonexistent_question',
        answerText: '测试回答',
      });
      const output = await skill.execute(input);
      expect(output.metadata).toBeDefined();
      expect(typeof output.metadata.needFollowup).toBe('boolean');
    });
  });

  // ---- Test 5: default action routing ----
  describe('default action routing', () => {
    it('defaults to evaluateAnswer when metadata.action is missing', async () => {
      const input = makeInput({ questionId: 'criticalEvent', answerText: '测试' });
      const output = await skill.execute(input);
      expect(output.metadata).toBeDefined();
      expect(typeof output.metadata.needFollowup).toBe('boolean');
    });
  });
});
