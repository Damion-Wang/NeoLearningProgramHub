/**
 * CoachingSkill tests — TDD Red→Green
 *
 * Tests the extracted coaching conversation logic from CoachAgent.
 * LLM is not available in test env, so we test fallback paths.
 */

import { CoachingSkill } from '../CoachingSkill';
import { getPersonaEngine } from '../../modules/coachPersonaEngine';
import { getPPPEngine } from '../../agents/ppp/PPPEngine';
import useLearningProjectStore from '../../stores/learningProjectStore';

// Disable LLM in test environment so execute() uses fallback paths
const originalEnv = process.env.REACT_APP_LLM_PROXY_ENABLED;
beforeAll(() => { process.env.REACT_APP_LLM_PROXY_ENABLED = 'false'; });
afterAll(() => {
  if (originalEnv === undefined) delete process.env.REACT_APP_LLM_PROXY_ENABLED;
  else process.env.REACT_APP_LLM_PROXY_ENABLED = originalEnv;
});

describe('CoachingSkill', () => {
  let skill;

  beforeEach(() => {
    getPersonaEngine().reset();
    skill = new CoachingSkill();
  });

  // 1. name returns 'coaching'
  test('skill.name returns "coaching"', () => {
    expect(skill.name).toBe('coaching');
  });

  // 2. execute() returns SkillOutput with correct shape
  test('execute() with user message returns SkillOutput with correct shape', async () => {
    const input = skill.buildInput({
      context: 'learner',
      userMessage: '我最近在团队管理上遇到了一些困难，想聊聊',
      conversationHistory: [],
      userProfile: { name: '张三', roleLabel: '技术经理' },
    });

    const output = await skill.execute(input);

    expect(output).toHaveProperty('content');
    expect(typeof output.content).toBe('string');
    expect(output.content.length).toBeGreaterThan(0);
    expect(output).toHaveProperty('sideEffects');
    expect(Array.isArray(output.sideEffects)).toBe(true);
    expect(output).toHaveProperty('metadata');
    expect(output.metadata).toHaveProperty('persona');
    expect(output.metadata).toHaveProperty('strategy');
  });

  // 3. execute() with null profile falls back gracefully
  test('execute() with null profile does not crash', async () => {
    const input = skill.buildInput({
      context: 'learner',
      userMessage: '你好，我想学习管理',
      conversationHistory: [],
      userProfile: null,
    });

    const output = await skill.execute(input);

    expect(output).toHaveProperty('content');
    expect(typeof output.content).toBe('string');
    expect(output.content.length).toBeGreaterThan(0);
  });

  // 4. execute() without LLM returns fallback response text
  test('execute() without LLM returns fallback response', async () => {
    const input = skill.buildInput({
      context: 'learner',
      userMessage: '我的团队最近效率很低，员工们好像没有动力',
      conversationHistory: [],
    });

    const output = await skill.execute(input);

    // Should have content (fallback since LLM is not available)
    expect(output.content).toBeTruthy();
    expect(typeof output.content).toBe('string');
  });

  // 5. Persona metadata includes emotionLabel, stageLabel, modeLabel
  test('persona metadata includes emotionLabel, stageLabel, modeLabel', async () => {
    const input = skill.buildInput({
      context: 'learner',
      userMessage: '我感到很沮丧，团队的表现一直不好',
      conversationHistory: [],
    });

    const output = await skill.execute(input);
    const { persona } = output.metadata;

    expect(persona).toHaveProperty('emotionLabel');
    expect(persona).toHaveProperty('stageLabel');
    expect(persona).toHaveProperty('modeLabel');
    expect(typeof persona.emotionLabel).toBe('string');
    expect(typeof persona.stageLabel).toBe('string');
    expect(typeof persona.modeLabel).toBe('string');
  });

  // 6. Strategy detection: message containing '框架' returns 'framework_guided'
  test('message containing "框架" returns strategy "framework_guided"', async () => {
    const input = skill.buildInput({
      context: 'learner',
      userMessage: '我想用一个框架来分析我的团队管理问题，最近团队里面有很多冲突和矛盾需要处理，不同部门之间的协作效率非常低下，每周的跨部门会议也没有实质性进展，能帮我用一个系统性的框架来梳理一下根本原因吗',
      conversationHistory: [],
    });

    const output = await skill.execute(input);

    expect(output.metadata.strategy).toBe('framework_guided');
  });

  // 7. Strategy detection: message containing '计划' returns 'plan'
  test('message containing "计划" returns strategy "plan"', async () => {
    const input = skill.buildInput({
      context: 'learner',
      userMessage: '我需要制定一个计划来提升团队效率',
      conversationHistory: [],
    });

    const output = await skill.execute(input);

    expect(output.metadata.strategy).toBe('plan');
  });

  // 8. Default strategy is 'open_dialogue'
  test('default strategy is "open_dialogue"', async () => {
    const input = skill.buildInput({
      context: 'learner',
      userMessage: '你好',
      conversationHistory: [],
    });

    const output = await skill.execute(input);

    expect(output.metadata.strategy).toBe('open_dialogue');
  });

  // 9. Signal-aware: ⑤ signal → know_do_gap_exploration strategy
  test('execute with ⑤ signal uses know_do_gap_exploration strategy', async () => {
    const input = skill.buildInput({
      context: 'learner',
      userMessage: '我知道该授权但做不到',
      metadata: {
        signalDetection: { primary: '⑤', severity: 'medium', confidence: 0.7, signals: [] },
      },
    });

    const output = await skill.execute(input);
    expect(output.metadata.strategy).toBe('know_do_gap_exploration');
  });

  // 10. Signal-aware: ⑦ signal → metacognitive_calibration strategy
  test('execute with ⑦ signal uses metacognitive_calibration strategy', async () => {
    const input = skill.buildInput({
      context: 'learner',
      userMessage: '我觉得我管理能力挺好的',
      metadata: {
        signalDetection: { primary: '⑦', severity: 'medium', confidence: 0.6, signals: [] },
      },
    });

    const output = await skill.execute(input);
    expect(output.metadata.strategy).toBe('metacognitive_calibration');
  });

  // 11. Signal-aware: ⑧ signal → context_adaptation strategy
  test('execute with ⑧ signal uses context_adaptation strategy', async () => {
    const input = skill.buildInput({
      context: 'learner',
      userMessage: '我之前一直这样做的',
      metadata: {
        signalDetection: { primary: '⑧', severity: 'low', confidence: 0.6, signals: [] },
      },
    });

    const output = await skill.execute(input);
    expect(output.metadata.strategy).toBe('context_adaptation');
  });

  // 12. Non-coaching signal (①) does not override strategy
  test('teaching signal ① does not override strategy to signal-specific', async () => {
    const input = skill.buildInput({
      context: 'learner',
      userMessage: '这个概念我不太了解',
      metadata: {
        signalDetection: { primary: '①', severity: 'medium', confidence: 0.7, signals: [] },
      },
    });

    const output = await skill.execute(input);
    // Teaching signals are NOT coaching signals, so strategy should NOT be signal-specific
    expect(output.metadata.strategy).not.toBe('know_do_gap_exploration');
    expect(output.metadata.strategy).not.toBe('metacognitive_calibration');
    expect(output.metadata.strategy).not.toBe('context_adaptation');
  });

  // 13. No signalDetection in metadata → normal strategy selection
  test('no signalDetection in metadata uses normal strategy', async () => {
    const input = skill.buildInput({
      context: 'learner',
      userMessage: '你好',
      metadata: {},
    });

    const output = await skill.execute(input);
    expect(output.metadata.strategy).toBe('open_dialogue');
  });

  // ==================== Fallback message filtering ====================

  describe('fallback message filtering (_buildLLMMessages)', () => {
    test('fallback messages in history are replaced with system note', () => {
      const history = [
        { role: 'user', content: '我想聊聊授权的问题' },
        { role: 'assistant', content: 'Leo AI 服务暂时不可用', metadata: { isFallback: true } },
        { role: 'user', content: '你刚才不在线，我重复一下：我想聊聊授权的问题' },
      ];

      const messages = skill._buildLLMMessages(history, '继续');
      // The fallback assistant message should be replaced
      expect(messages[1].content).toContain('服务临时中断');
      expect(messages[1].content).not.toContain('Leo AI 服务暂时不可用');
      // Other messages should be preserved
      expect(messages[0].content).toBe('我想聊聊授权的问题');
      expect(messages[2].content).toContain('重复一下');
      expect(messages[3].content).toBe('继续');
    });

    test('Orchestrator _fallback flag also detected', () => {
      const history = [
        { role: 'assistant', content: '感谢你的提问！', metadata: { _fallback: true } },
      ];

      const messages = skill._buildLLMMessages(history, '你好');
      expect(messages[0].content).toContain('服务临时中断');
    });

    test('normal messages pass through unchanged', () => {
      const history = [
        { role: 'user', content: '你好' },
        { role: 'assistant', content: '你好！有什么想聊的？', metadata: { persona: {} } },
      ];

      const messages = skill._buildLLMMessages(history, '聊聊管理');
      expect(messages[0].content).toBe('你好');
      expect(messages[1].content).toBe('你好！有什么想聊的？');
      expect(messages[2].content).toBe('聊聊管理');
    });

    test('fallback output includes isFallback: true in metadata', async () => {
      const input = skill.buildInput({
        context: 'learner',
        userMessage: '你好',
        conversationHistory: [],
      });

      // LLM is disabled in test env → should produce fallback
      const output = await skill.execute(input);
      expect(output.metadata.isFallback).toBe(true);
    });
  });

  // ==================== RC-7a: Recommendation response detection ====================

  describe('recommendation response detection (RC-7a)', () => {
    const USER_ID = 'test-user-rc7a';

    function seedPendingRecommendation(ppp) {
      // Manually inject a pending recommendation into PPP
      if (!ppp._pendingRecommendations) ppp._pendingRecommendations = new Map();
      ppp._pendingRecommendations.set(USER_ID, [{
        userId: USER_ID,
        domain: 'delegation',
        triggerScore: 0.85,
        recommendation: {
          topic: 'delegation',
          reason: '3次需要脚手架',
          suggestedFormat: 'micro_learning',
          estimatedDuration: '1-2次对话',
        },
        generatedAt: new Date().toISOString(),
      }]);
    }

    beforeEach(() => {
      useLearningProjectStore.getState().reset();
      // Clear PPP singleton state to prevent leakage between tests
      const ppp = getPPPEngine();
      if (ppp._pendingRecommendations) ppp._pendingRecommendations.clear();
      if (ppp._rejectedTopics) ppp._rejectedTopics.clear();
      if (ppp._triggerSignals) ppp._triggerSignals.clear();
    });

    test('user says "好的" after recommendation → accepted, project created', async () => {
      const ppp = getPPPEngine();
      seedPendingRecommendation(ppp);

      const input = skill.buildInput({
        context: 'learner',
        userMessage: '好的，安排吧',
        conversationHistory: [
          { role: 'assistant', content: '最近几次聊授权的话题，Fiona 建议安排一个系统学习，你看要不要？' },
        ],
        userProfile: { id: USER_ID, name: 'Test' },
      });

      const output = await skill.execute(input);

      expect(output.metadata.learningRecommendation).toBeTruthy();
      expect(output.metadata.learningRecommendation.status).toBe('accepted');
      expect(output.metadata.learningRecommendation.domain).toBe('delegation');
      expect(output.metadata.learningRecommendation.projectId).toBeTruthy();

      // Project should exist in store
      const projects = useLearningProjectStore.getState().projects;
      expect(projects.length).toBe(1);
      expect(projects[0].origin).toBe('signal_triggered');
    });

    test('user says "不了" after recommendation → rejected', async () => {
      const ppp = getPPPEngine();
      seedPendingRecommendation(ppp);

      const input = skill.buildInput({
        context: 'learner',
        userMessage: '先不用了，我自己琢磨琢磨',
        conversationHistory: [
          { role: 'assistant', content: 'Fiona 建议安排一个针对性学习，你觉得呢？' },
        ],
        userProfile: { id: USER_ID, name: 'Test' },
      });

      const output = await skill.execute(input);

      expect(output.metadata.learningRecommendation).toBeTruthy();
      expect(output.metadata.learningRecommendation.status).toBe('rejected');
      expect(output.metadata.learningRecommendation.domain).toBe('delegation');

      // No project created
      const projects = useLearningProjectStore.getState().projects;
      expect(projects.length).toBe(0);

      // Recommendation dismissed from PPP
      expect(ppp.getPendingRecommendations(USER_ID).length).toBe(0);
    });

    test('user message without recommendation context → no action', async () => {
      const ppp = getPPPEngine();
      seedPendingRecommendation(ppp);

      const input = skill.buildInput({
        context: 'learner',
        userMessage: '好的',
        conversationHistory: [
          { role: 'assistant', content: '你对这个问题的思考很有深度。' },
        ],
        userProfile: { id: USER_ID, name: 'Test' },
      });

      const output = await skill.execute(input);

      // No recommendation action (last assistant msg didn't contain rec markers)
      // learningRecommendation should be a new delivery, not an action
      if (output.metadata.learningRecommendation) {
        expect(output.metadata.learningRecommendation.status).toBe('delivered');
      }
    });

    test('no pending recommendation → no action even with matching keywords', async () => {
      // Don't seed any recommendation
      const input = skill.buildInput({
        context: 'learner',
        userMessage: '好的，安排吧',
        conversationHistory: [
          { role: 'assistant', content: 'Fiona 建议安排一个系统学习。' },
        ],
        userProfile: { id: USER_ID, name: 'Test' },
      });

      const output = await skill.execute(input);

      // No project created
      const projects = useLearningProjectStore.getState().projects;
      expect(projects.length).toBe(0);
    });
  });
});
