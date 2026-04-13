/**
 * EvaluationSkill tests — TDD Red→Green→Refactor
 *
 * Covers:
 * 1. `name` returns 'evaluation'
 * 2. `execute()` with action='evaluateTurn' returns scores + flags
 * 3. `execute()` with action='generateSessionFeedback' returns feedback content
 * 4. `execute()` with action='updateEvidence' processes evidence data
 * 5. `execute()` with action='generateReport' returns report content
 * 6. Default action is evaluateTurn when metadata.action is missing
 */

import { EvaluationSkill } from '../EvaluationSkill';

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
  userMessage: '我觉得小王最近状态不太好',
  conversationHistory: [
    { role: 'user', content: '小王最近进展怎么样？' },
    { role: 'assistant', content: '我最近确实有些状态不好' },
    { role: 'user', content: '我觉得小王最近状态不太好' },
  ],
  userProfile: { roleLabel: '研发经理' },
  tenantConfig: {},
  metadata: {},
};

const makeInput = (metadataOverrides = {}) => ({
  ...baseInput,
  metadata: { ...baseInput.metadata, ...metadataOverrides },
});

describe('EvaluationSkill', () => {
  let skill;

  beforeEach(() => {
    skill = new EvaluationSkill();
  });

  // ---- Test 1: name ----
  describe('name', () => {
    it('returns "evaluation"', () => {
      expect(skill.name).toBe('evaluation');
    });
  });

  // ---- Test 2: evaluateTurn ----
  describe('execute() with action="evaluateTurn"', () => {
    it('returns output with scores object', async () => {
      const input = makeInput({ action: 'evaluateTurn', turnIndex: 1 });
      const output = await skill.execute(input);

      expect(output.metadata).toBeDefined();
      expect(output.metadata.scores).toBeDefined();
      expect(typeof output.metadata.scores).toBe('object');
    });

    it('scores include the four required dimensions', async () => {
      const input = makeInput({ action: 'evaluateTurn', turnIndex: 1 });
      const output = await skill.execute(input);
      const { scores } = output.metadata;

      expect(typeof scores.communication).toBe('number');
      expect(typeof scores.empathy).toBe('number');
      expect(typeof scores.problemSolving).toBe('number');
      expect(typeof scores.leadership).toBe('number');
    });

    it('returns flags as an array', async () => {
      const input = makeInput({ action: 'evaluateTurn', turnIndex: 1 });
      const output = await skill.execute(input);

      expect(Array.isArray(output.metadata.flags)).toBe(true);
    });

    it('sideEffects is an array', async () => {
      const input = makeInput({ action: 'evaluateTurn', turnIndex: 1 });
      const output = await skill.execute(input);

      expect(Array.isArray(output.sideEffects)).toBe(true);
    });
  });

  // ---- Test 3: generateSessionFeedback ----
  describe('execute() with action="generateSessionFeedback"', () => {
    const feedbackInput = () =>
      makeInput({
        action: 'generateSessionFeedback',
        scenario: { title: '绩效面谈', role: '小李' },
        evaluationHistory: [],
      });

    it('returns content string', async () => {
      const output = await skill.execute(feedbackInput());

      expect(typeof output.content).toBe('string');
      expect(output.content.length).toBeGreaterThan(0);
    });

    it('metadata includes feedback object with required fields', async () => {
      const output = await skill.execute(feedbackInput());
      const { feedback } = output.metadata;

      expect(feedback).toBeDefined();
      expect(typeof feedback.overall).toBe('string');
      expect(Array.isArray(feedback.strengths)).toBe(true);
      expect(Array.isArray(feedback.improvements)).toBe(true);
      expect(feedback.scores).toBeDefined();
      expect(Array.isArray(feedback.next_actions)).toBe(true);
    });

    it('sideEffects is an array', async () => {
      const output = await skill.execute(feedbackInput());

      expect(Array.isArray(output.sideEffects)).toBe(true);
    });
  });

  // ---- Test 4: updateEvidence ----
  describe('execute() with action="updateEvidence"', () => {
    const evidenceInput = () =>
      makeInput({
        action: 'updateEvidence',
        evidenceItems: [
          {
            capabilityId: 'delegation',
            type: 'scenario',
            description: '有效分配任务',
            score: 75,
            sessionId: 'session-001',
          },
        ],
        competencyEvidence: {},
      });

    it('returns updatedEvidence in metadata', async () => {
      const output = await skill.execute(evidenceInput());

      expect(output.metadata.updatedEvidence).toBeDefined();
      expect(typeof output.metadata.updatedEvidence).toBe('object');
    });

    it('adds evidence for the specified capabilityId', async () => {
      const output = await skill.execute(evidenceInput());
      const evidence = output.metadata.updatedEvidence;

      expect(evidence['delegation']).toBeDefined();
      expect(evidence['delegation'].evidenceItems).toHaveLength(1);
    });

    it('sideEffects is an array', async () => {
      const output = await skill.execute(evidenceInput());

      expect(Array.isArray(output.sideEffects)).toBe(true);
    });
  });

  // ---- Test 5: generateReport ----
  describe('execute() with action="generateReport"', () => {
    const reportInput = () =>
      makeInput({
        action: 'generateReport',
        capabilityIds: ['delegation'],
        competencyEvidence: {
          delegation: {
            capabilityId: 'delegation',
            evidenceItems: [{ type: 'scenario', date: new Date().toISOString(), description: '测试', score: 70 }],
            readinessLevel: 'competent',
            readinessScore: 65,
            trend: 'stable',
            lastUpdated: new Date().toISOString(),
          },
        },
      });

    it('returns report in metadata', async () => {
      const output = await skill.execute(reportInput());

      expect(output.metadata.report).toBeDefined();
    });

    it('report has capabilities array', async () => {
      const output = await skill.execute(reportInput());

      expect(Array.isArray(output.metadata.report.capabilities)).toBe(true);
    });

    it('report has overallSummary string', async () => {
      const output = await skill.execute(reportInput());

      expect(typeof output.metadata.report.overallSummary).toBe('string');
    });

    it('report has recommendations array', async () => {
      const output = await skill.execute(reportInput());

      expect(Array.isArray(output.metadata.report.recommendations)).toBe(true);
    });

    it('sideEffects is an array', async () => {
      const output = await skill.execute(reportInput());

      expect(Array.isArray(output.sideEffects)).toBe(true);
    });
  });

  // ---- Test 6: default action ----
  describe('default action routing', () => {
    it('defaults to evaluateTurn when metadata.action is missing', async () => {
      const input = makeInput(); // no action in metadata
      const output = await skill.execute(input);

      // Should behave like evaluateTurn — have scores in metadata
      expect(output.metadata.scores).toBeDefined();
    });

    it('defaults to evaluateTurn when metadata is absent entirely', async () => {
      const input = { ...baseInput, metadata: undefined };
      const output = await skill.execute(input);

      expect(output.metadata.scores).toBeDefined();
    });
  });
});
