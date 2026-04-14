/**
 * PlanningSkill tests — TDD Red→Green→Refactor
 *
 * Covers:
 * 1. `name` returns 'planning'
 * 2. generateLearningPath action returns correct shape
 * 3. assessComplexity action returns correct shape
 * 4. detectTodo action returns correct shape (LIVE feature from ActionPlanAgent)
 * 5. getTaskProbability action returns tasks + overallProgress
 * 6. blockers detail gaps for missing capabilities
 * 7. Fallback works when LLM unavailable
 * 8. Default action routing works
 */

import { PlanningSkill } from '../PlanningSkill';

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
  userMessage: '我打算下周和小王谈谈他的绩效问题',
  conversationHistory: [
    { role: 'user', content: '我的团队有人绩效一直不达标' },
    { role: 'assistant', content: '你打算怎么处理？' },
  ],
  userProfile: { roleLabel: '研发经理', currentChallenges: ['团队管理', '绩效提升'] },
  tenantConfig: {},
  metadata: {},
};

const makeInput = (metadataOverrides = {}) => ({
  ...baseInput,
  metadata: { ...baseInput.metadata, ...metadataOverrides },
});

describe('PlanningSkill', () => {
  let skill;

  beforeEach(() => {
    skill = new PlanningSkill();
  });

  // ---- Test 1: name ----
  describe('name', () => {
    it('returns "planning"', () => {
      expect(skill.name).toBe('planning');
    });
  });

  // ---- Test 2: generateLearningPath ----
  describe('execute() with action="generateLearningPath"', () => {
    const pathInput = () =>
      makeInput({
        action: 'generateLearningPath',
        assessmentResults: { communication: 65, coaching: 70 },
        trainingHistory: [{ scenarioId: 'scenario_1', scenarioTitle: '绩效面谈', attempts: 2 }],
      });

    it('returns SkillOutput with sideEffects array', async () => {
      const output = await skill.execute(pathInput());
      expect(Array.isArray(output.sideEffects)).toBe(true);
    });

    it('metadata contains learningPath object', async () => {
      const output = await skill.execute(pathInput());
      expect(output.metadata.learningPath).toBeDefined();
      expect(typeof output.metadata.learningPath).toBe('object');
    });

    it('learningPath has stages array', async () => {
      const output = await skill.execute(pathInput());
      expect(Array.isArray(output.metadata.learningPath.stages)).toBe(true);
    });

    it('learningPath has focusCapabilities array', async () => {
      const output = await skill.execute(pathInput());
      expect(Array.isArray(output.metadata.learningPath.focusCapabilities)).toBe(true);
    });

    it('learningPath has overallAdvice string', async () => {
      const output = await skill.execute(pathInput());
      expect(typeof output.metadata.learningPath.overallAdvice).toBe('string');
    });
  });

  // ---- Test 3: assessComplexity ----
  describe('execute() with action="assessComplexity"', () => {
    const complexInput = () =>
      makeInput({
        action: 'assessComplexity',
        userMessage: '我需要在季度内重构整个团队的工作流程，涉及多个部门跨团队协作，需要分阶段实施。',
        conversationHistory: [],
      });

    it('returns SkillOutput with sideEffects array', async () => {
      const output = await skill.execute(complexInput());
      expect(Array.isArray(output.sideEffects)).toBe(true);
    });

    it('metadata contains complexity string', async () => {
      const output = await skill.execute(complexInput());
      expect(typeof output.metadata.complexity).toBe('string');
    });

    it('metadata contains score number', async () => {
      const output = await skill.execute(complexInput());
      expect(typeof output.metadata.score).toBe('number');
    });

    it('metadata contains estimatedDays number', async () => {
      const output = await skill.execute(complexInput());
      expect(typeof output.metadata.estimatedDays).toBe('number');
    });

    it('metadata contains reason string', async () => {
      const output = await skill.execute(complexInput());
      expect(typeof output.metadata.reason).toBe('string');
    });
  });

  // ---- Test 4: detectTodo (LIVE FEATURE) ----
  describe('execute() with action="detectTodo"', () => {
    const todoInput = () =>
      makeInput({
        action: 'detectTodo',
        userText: '我打算下周和小王约好一对一沟通，制定改进计划。',
        assistantText: '建议你可以先和他做个绩效对齐会议。',
        conversationHistory: [
          { role: 'user', content: '小王绩效一直不好' },
          { role: 'assistant', content: '你打算怎么处理？' },
        ],
        sourceType: 'coach',
      });

    it('returns SkillOutput with sideEffects array', async () => {
      const output = await skill.execute(todoInput());
      expect(Array.isArray(output.sideEffects)).toBe(true);
    });

    it('metadata contains hasTodo boolean', async () => {
      const output = await skill.execute(todoInput());
      expect(typeof output.metadata.hasTodo).toBe('boolean');
    });

    it('when hasTodo is true, todo has required fields', async () => {
      const output = await skill.execute(todoInput());
      if (output.metadata.hasTodo && output.metadata.todo) {
        const { todo } = output.metadata;
        expect(typeof todo.id).toBe('string');
        expect(typeof todo.title).toBe('string');
        expect(typeof todo.status).toBe('string');
        expect(todo.status).toBe('pending');
      } else {
        // LLM unavailable + rule-based fallback may or may not detect — both are valid
        expect(output.metadata.todo === null || output.metadata.todo === undefined).toBe(true);
      }
    });

    it('returns hasTodo false for short text', async () => {
      const input = makeInput({
        action: 'detectTodo',
        userText: '好的',
        assistantText: '',
        conversationHistory: [],
        sourceType: 'coach',
      });
      const output = await skill.execute(input);
      expect(output.metadata.hasTodo).toBe(false);
    });
  });

  // ---- Test 5: getTaskProbability ----
  describe('execute() with action="getTaskProbability"', () => {
    const probInput = (assessmentResults = {}) =>
      makeInput({ action: 'getTaskProbability', assessmentResults });

    it('returns SkillOutput with sideEffects array', async () => {
      const output = await skill.execute(probInput());
      expect(Array.isArray(output.sideEffects)).toBe(true);
    });

    it('metadata contains tasks array with correct shape', async () => {
      const output = await skill.execute(probInput({ delegation: 80, coaching: 70 }));
      expect(Array.isArray(output.metadata.tasks)).toBe(true);
      expect(output.metadata.tasks.length).toBeGreaterThanOrEqual(3);

      const task = output.metadata.tasks[0];
      expect(typeof task.taskId).toBe('string');
      expect(typeof task.title).toBe('string');
      expect(typeof task.currentProbability).toBe('number');
      expect(task.targetProbability).toBe(100);
      expect(Array.isArray(task.blockers)).toBe(true);
    });

    it('metadata contains overallProgress number', async () => {
      const output = await skill.execute(probInput({ delegation: 80 }));
      expect(typeof output.metadata.overallProgress).toBe('number');
      expect(output.metadata.overallProgress).toBeGreaterThanOrEqual(0);
      expect(output.metadata.overallProgress).toBeLessThanOrEqual(100);
    });

    it('returns 0% probability when no assessment data', async () => {
      const output = await skill.execute(probInput({}));
      output.metadata.tasks.forEach((t) => {
        expect(t.currentProbability).toBe(0);
      });
      expect(output.metadata.overallProgress).toBe(0);
    });

    it('returns 100% when all capabilities meet thresholds', async () => {
      const output = await skill.execute(probInput({
        delegation: 100, motivation: 100, planningExecution: 100,
        coaching: 100, communication: 100, collaboration: 100,
        systemsThinking: 100,
      }));
      output.metadata.tasks.forEach((t) => {
        expect(t.currentProbability).toBe(100);
        expect(t.blockers).toHaveLength(0);
      });
      expect(output.metadata.overallProgress).toBe(100);
    });

    it('blockers contain gap details for missing capabilities', async () => {
      const output = await skill.execute(probInput({ delegation: 30 }));
      // Q2 sales target requires delegation: 70 — gap should be 40
      const salesTask = output.metadata.tasks.find((t) => t.taskId === 'q2-sales-target');
      expect(salesTask).toBeDefined();
      const delegationBlocker = salesTask.blockers.find((b) => b.capabilityId === 'delegation');
      expect(delegationBlocker).toBeDefined();
      expect(delegationBlocker.current).toBe(30);
      expect(delegationBlocker.required).toBe(70);
      expect(delegationBlocker.gap).toBe(40);
    });
  });

  // ---- Test 7: fallback behavior ----
  describe('fallback behavior without LLM', () => {
    it('generateLearningPath returns valid fallback path', async () => {
      const input = makeInput({
        action: 'generateLearningPath',
        assessmentResults: {},
        trainingHistory: [],
      });
      const output = await skill.execute(input);
      expect(output.metadata.learningPath).toBeDefined();
      expect(Array.isArray(output.metadata.learningPath.stages)).toBe(true);
    });

    it('assessComplexity returns valid result (rule-based, no LLM needed)', async () => {
      const input = makeInput({
        action: 'assessComplexity',
        userMessage: '简单任务',
        conversationHistory: [],
      });
      const output = await skill.execute(input);
      expect(typeof output.metadata.complexity).toBe('string');
    });
  });

  // ---- Test 8: default action routing ----
  describe('default action routing', () => {
    it('defaults to detectTodo when metadata.action is missing', async () => {
      const input = makeInput({
        userText: '我打算明天和团队开会讨论一下目标。',
        assistantText: '',
        conversationHistory: [],
        sourceType: 'coach',
      });
      const output = await skill.execute(input);
      expect(output.metadata).toBeDefined();
      expect(typeof output.metadata.hasTodo).toBe('boolean');
    });
  });
});
