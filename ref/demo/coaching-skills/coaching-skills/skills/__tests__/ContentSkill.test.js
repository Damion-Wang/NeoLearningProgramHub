/**
 * ContentSkill tests — TDD Red→Green→Refactor
 *
 * Covers:
 * 1. `name` returns 'content'
 * 2. getToolContext action returns correct shape
 * 3. recommendScenarios action returns correct shape
 * 4. Fallback works when LLM unavailable (pure rule-based)
 * 5. Default action routing works
 */

import { ContentSkill } from '../ContentSkill';

// Mock LLM — unavailable so we test fallback paths
jest.mock('../../agents/core/LLMClient', () => ({
  getLLMClient: () => ({
    chat: jest.fn().mockResolvedValue(''),
    chatJSON: jest.fn().mockResolvedValue(null),
  }),
  isLLMEnabled: jest.fn().mockReturnValue(false),
}));

// Mock store for KNOWLEDGE_TOOLS
jest.mock('../../store', () => ({
  KNOWLEDGE_TOOLS: [
    {
      id: 'grow-model',
      name: 'GROW教练模型',
      description: '一对一沟通辅导框架',
      category: '沟通辅导',
      content: {
        principle: '通过目标-现状-选项-意愿四个维度引导对话',
        elements: [
          { key: 'Goal', label: '目标', desc: '明确期望达成的目标' },
          { key: 'Reality', label: '现状', desc: '了解当前实际情况' },
        ],
        example: '与下属沟通发展计划时使用',
      },
    },
    {
      id: 'smart-goals',
      name: 'SMART目标设定法',
      description: '目标设定框架',
      category: '目标管理',
      content: {
        principle: '使目标具体可衡量',
        elements: [
          { key: 'Specific', label: '具体', desc: '目标要明确具体' },
        ],
        example: '制定季度目标时使用',
      },
    },
  ],
}));

const baseInput = {
  context: 'learner',
  userMessage: '',
  conversationHistory: [],
  userProfile: {
    roleLabel: '研发经理',
    assessmentResults: { coaching: 55, communication: 70 },
    beiProfile: { focusCapabilities: ['coaching'] },
  },
  tenantConfig: {},
  metadata: {},
};

const makeInput = (metadataOverrides = {}) => ({
  ...baseInput,
  metadata: { ...baseInput.metadata, ...metadataOverrides },
});

describe('ContentSkill', () => {
  let skill;

  beforeEach(() => {
    skill = new ContentSkill();
  });

  // ---- Test 1: name ----
  describe('name', () => {
    it('returns "content"', () => {
      expect(skill.name).toBe('content');
    });
  });

  // ---- Test 2: getToolContext ----
  describe('execute() with action="getToolContext"', () => {
    const toolInput = () =>
      makeInput({
        action: 'getToolContext',
        toolIds: ['grow-model'],
      });

    it('returns SkillOutput with sideEffects array', async () => {
      const output = await skill.execute(toolInput());
      expect(Array.isArray(output.sideEffects)).toBe(true);
    });

    it('metadata contains contextInsert string', async () => {
      const output = await skill.execute(toolInput());
      expect(typeof output.metadata.contextInsert).toBe('string');
    });

    it('metadata contains tools array', async () => {
      const output = await skill.execute(toolInput());
      expect(Array.isArray(output.metadata.tools)).toBe(true);
    });

    it('contextInsert includes tool name when tool exists', async () => {
      const output = await skill.execute(toolInput());
      expect(output.metadata.contextInsert).toContain('GROW教练模型');
    });

    it('returns empty contextInsert for unknown toolIds', async () => {
      const input = makeInput({
        action: 'getToolContext',
        toolIds: ['nonexistent_tool'],
      });
      const output = await skill.execute(input);
      expect(output.metadata.contextInsert).toBe('');
      expect(output.metadata.tools).toHaveLength(0);
    });

    it('returns empty contextInsert for empty toolIds', async () => {
      const input = makeInput({
        action: 'getToolContext',
        toolIds: [],
      });
      const output = await skill.execute(input);
      expect(output.metadata.contextInsert).toBe('');
    });
  });

  // ---- Test 3: recommendScenarios ----
  describe('execute() with action="recommendScenarios"', () => {
    const scenarioList = [
      { id: 'scene_1', title: '一对一辅导对话', description: '辅导员工提升', capabilities: ['coaching'], frequency: 'high' },
      { id: 'scene_2', title: '目标分解会议', description: '团队目标对齐', capabilities: ['planningExecution'], frequency: 'medium' },
      { id: 'scene_3', title: '冲突调解', description: '处理团队冲突', capabilities: ['communication'], frequency: 'low' },
    ];

    const recInput = () =>
      makeInput({
        action: 'recommendScenarios',
        scenarios: scenarioList,
        userProgress: {},
      });

    it('returns SkillOutput with sideEffects array', async () => {
      const output = await skill.execute(recInput());
      expect(Array.isArray(output.sideEffects)).toBe(true);
    });

    it('metadata contains rankedScenarios array', async () => {
      const output = await skill.execute(recInput());
      expect(Array.isArray(output.metadata.rankedScenarios)).toBe(true);
    });

    it('metadata contains topIds array', async () => {
      const output = await skill.execute(recInput());
      expect(Array.isArray(output.metadata.topIds)).toBe(true);
    });

    it('returns same count as input scenarios', async () => {
      const output = await skill.execute(recInput());
      expect(output.metadata.rankedScenarios).toHaveLength(scenarioList.length);
    });

    it('returns empty arrays for empty scenarios input', async () => {
      const input = makeInput({
        action: 'recommendScenarios',
        scenarios: [],
        userProgress: {},
      });
      const output = await skill.execute(input);
      expect(output.metadata.rankedScenarios).toHaveLength(0);
      expect(output.metadata.topIds).toHaveLength(0);
    });

    it('each ranked scenario has a recommendationScore', async () => {
      const output = await skill.execute(recInput());
      output.metadata.rankedScenarios.forEach((scenario) => {
        expect(typeof scenario.recommendationScore).toBe('number');
      });
    });
  });

  // ---- Test 4: fallback (rule-based, no LLM needed) ----
  describe('fallback behavior without LLM', () => {
    it('getToolContext works without LLM (pure retrieval)', async () => {
      const input = makeInput({
        action: 'getToolContext',
        toolIds: ['smart-goals'],
      });
      const output = await skill.execute(input);
      expect(output.metadata.contextInsert).toContain('SMART目标设定法');
    });

    it('recommendScenarios works without LLM (rule-based scoring)', async () => {
      const input = makeInput({
        action: 'recommendScenarios',
        scenarios: [{ id: 'sc1', title: '测试场景', description: '', capabilities: ['coaching'], frequency: 'high' }],
        userProgress: {},
      });
      const output = await skill.execute(input);
      expect(output.metadata.rankedScenarios).toHaveLength(1);
    });
  });

  // ---- Test 5: userMessage keyword inference (M3 fix) ----
  describe('getToolContext with userMessage keyword inference', () => {
    it('returns relevant tools when userMessage contains matching keywords (no explicit toolIds)', async () => {
      const input = makeInput({
        action: 'getToolContext',
        toolIds: [],
        userMessage: '我想学习一对一辅导的方法',
      });
      const output = await skill.execute(input);
      // "一对一" matches grow-model keyword, "辅导" also matches
      expect(output.metadata.tools.length).toBeGreaterThan(0);
      expect(output.metadata.tools.some(t => t.id === 'grow-model')).toBe(true);
      expect(output.metadata.contextInsert).toContain('GROW教练模型');
    });

    it('returns relevant tools when userMessage contains "目标" keyword', async () => {
      const input = makeInput({
        action: 'getToolContext',
        toolIds: [],
        userMessage: '帮我把目标分解一下',
      });
      const output = await skill.execute(input);
      // "目标" + "分解" match smart-goals keywords
      expect(output.metadata.tools.length).toBeGreaterThan(0);
      expect(output.metadata.tools.some(t => t.id === 'smart-goals')).toBe(true);
    });

    it('returns empty when userMessage has no matching keywords', async () => {
      const input = makeInput({
        action: 'getToolContext',
        toolIds: [],
        userMessage: '今天天气真好',
      });
      const output = await skill.execute(input);
      expect(output.metadata.tools).toHaveLength(0);
      expect(output.metadata.contextInsert).toBe('');
    });

    it('limits inferred tools to max 3 to avoid context bloat', async () => {
      // Use a message that could match many tools
      const input = makeInput({
        action: 'getToolContext',
        toolIds: [],
        userMessage: '系统分析因果循环反馈回路全局本质深层',
      });
      const output = await skill.execute(input);
      expect(output.metadata.tools.length).toBeLessThanOrEqual(3);
    });
  });

  // ---- Test 6: default action routing ----
  describe('default action routing', () => {
    it('defaults to getToolContext when metadata.action is missing', async () => {
      const input = makeInput({ toolIds: ['grow-model'] });
      const output = await skill.execute(input);
      expect(output.metadata).toBeDefined();
      expect(typeof output.metadata.contextInsert).toBe('string');
    });
  });
});
