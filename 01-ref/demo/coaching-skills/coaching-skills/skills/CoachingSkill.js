/**
 * CoachingSkill — core coaching conversation logic extracted from CoachAgent.
 *
 * Combines CoachAgent's _processUserMessage + _generateResponse into a single
 * execute() workflow. Delegates to coachPersonaEngine (emotion, stage, mode,
 * prompt building) and coachQuestioningSkill (questioning constraints) — does
 * NOT absorb them.
 *
 * Strategy mapping (CoachAgent → CoachingSkill):
 *   tell/ask/review → open_dialogue
 *   plan            → plan
 *   framework_guided → framework_guided
 *
 * The 'tool_recommendation' strategy is emitted when tools are suggested.
 */

import { SkillBase } from './SkillBase';
import { SkillError } from '../types/errors';
import { getPersonaEngine } from '../modules/coachPersonaEngine';
import { buildQuestioningConstraints } from '../modules/coachQuestioningSkill';
import { SIGNAL_TYPES } from './signalDetection';
import { getPPPEngine } from '../agents/ppp/PPPEngine';
import { createFromRecommendation, routeApproval } from '../services/learningProjectService';
import { getTokenBudget } from '../config/llm';

// ==================== Signal-aware coaching strategies (私教系统 §3.1) ====================

const COACHING_SIGNAL_STRATEGIES = {
  '⑤': 'know_do_gap_exploration',     // 信念/动机/能力/环境排除法
  '⑦': 'metacognitive_calibration',   // 自评 vs 实际对比
  '⑧': 'context_adaptation',          // 旧模式识别+新场景适配
};

// ==================== Intent detection (ported from CoachAgent) ====================

const IntentType = {
  GREETING: 'greeting',
  CLARIFICATION: 'clarification',
  TOOL_APPLICATION: 'tool_application',
  CASE_DISCUSSION: 'case_discussion',
  SITUATION_ANALYSIS: 'situation_analysis',
  REFLECTION: 'reflection',
  PLANNING: 'planning',
  EMOTIONAL_SUPPORT: 'emotional_support',
};

// ==================== CoachingSkill ====================

export class CoachingSkill extends SkillBase {
  get name() {
    return 'coaching';
  }

  /**
   * Execute coaching conversation flow.
   *
   * @param {import('./SkillBase').SkillInput} input
   * @returns {Promise<import('./SkillBase').SkillOutput>}
   */
  async execute(input) {
    const {
      userMessage = '',
      conversationHistory = [],
      userProfile = null,
      metadata: inputMeta = {},
    } = input;

    const personaEngine = getPersonaEngine();
    const crossAgentContext = inputMeta.crossAgentContext || null;

    // 1. Detect emotion
    const emotionResult = personaEngine.detectEmotion(userMessage, conversationHistory);

    // 2. Detect conversation stage
    const conversationStage = personaEngine.detectConversationStage(conversationHistory, userMessage);

    // 3. Intent analysis (LLM-first, keyword fallback)
    let intentResult = await this._analyzeIntent(userMessage, conversationHistory, emotionResult);
    intentResult.userTextLength = userMessage.length;

    // 4. Emotion-intent override: strong negative emotion → emotional support
    if (this._needsEmotionalPriority(emotionResult)) {
      intentResult.originalIntent = intentResult.intent;
      intentResult.intent = IntentType.EMOTIONAL_SUPPORT;
      intentResult.confidence = 0.9;
    }

    // 5. Dynamic persona mode selection
    const userTurnCount = conversationHistory.filter(m => m.role === 'user').length;
    const modeResult = personaEngine.selectPersonaMode({
      emotion: emotionResult.emotion,
      stage: conversationStage,
      intent: intentResult.intent,
      userTurnCount,
    });

    // 6. Strategy selection (signal-aware: coaching signals ⑤⑦⑧ override)
    const signalDetection = inputMeta.signalDetection || null;
    const strategyResult = this._selectStrategy(intentResult, userProfile, conversationHistory, emotionResult, signalDetection);

    // 7. Build questioning constraints
    const questioningConstraints = buildQuestioningConstraints(
      conversationStage,
      emotionResult.emotion,
      userProfile?.dreyfusLevel || 'competent'
    );

    // RC-6: Inject PPP competency snapshot into coaching context
    let pppSnapshot = null;
    try {
      const ppp = getPPPEngine();
      const userId = userProfile?.id || userProfile?.userId;
      if (userId) {
        pppSnapshot = await ppp.getCompetencySnapshot(userId);
      }
    } catch {
      // PPP unavailable — degrade gracefully
    }

    // RC-7a: Check if user is responding to a previously delivered learning recommendation
    let recommendationAction = null;
    try {
      const pppForCheck = getPPPEngine();
      const checkUserId = userProfile?.id || userProfile?.userId;
      if (checkUserId) {
        recommendationAction = this._detectRecommendationResponse(
          userMessage, conversationHistory, pppForCheck, checkUserId
        );
      }
    } catch {
      // PPP unavailable — skip
    }

    // RC-7: B-mode — inject pending learning recommendation from PPP
    let learningRecommendation = null;
    try {
      const pppForRec = getPPPEngine();
      const recUserId = userProfile?.id || userProfile?.userId;
      if (recUserId) {
        const pending = pppForRec.getPendingRecommendations(recUserId);
        if (pending && pending.length > 0) {
          // Pick highest triggerScore
          learningRecommendation = pending.reduce((best, r) =>
            (r.triggerScore || 0) > (best.triggerScore || 0) ? r : best
          , pending[0]);
        }
      }
    } catch {
      // PPP unavailable — no recommendation, no error
    }

    // Build learning suggestion prompt block
    let learningPromptBlock = '';
    if (recommendationAction?.action === 'accept') {
      // User accepted → tell Leo to acknowledge and transition to learning
      learningPromptBlock = [
        '',
        `【学习建议已接受】用户确认了「${recommendationAction.domain}」的学习建议。`,
        '学习项目已自动创建。请自然地确认安排，告诉用户后续会在合适的时机开始学习。',
        '语气温暖简洁，不需要重复解释建议内容。',
        '',
      ].join('\n');
    } else if (recommendationAction?.action === 'reject') {
      // User rejected → acknowledge gracefully
      learningPromptBlock = [
        '',
        `【学习建议已婉拒】用户拒绝了「${recommendationAction.domain}」的学习建议。`,
        '请自然地表示理解，不再追问。继续正常的教练对话。',
        '',
      ].join('\n');
    } else if (learningRecommendation) {
      // New recommendation to deliver
      const rec = learningRecommendation.recommendation || {};
      learningPromptBlock = [
        '',
        '【学习建议待传达】',
        `Fiona 评估后建议为该用户安排「${rec.topic || '未知主题'}」的正式学习。`,
        `原因：${rec.reason || '综合评估'}。`,
        `建议形式：${rec.suggestedFormat || '待定'}，预计${rec.estimatedDuration || '待定'}。`,
        '请在本次回复中自然地提及这个建议——不要生硬插入，找一个对话自然过渡的点带出来。',
        '用户可以接受或拒绝，请尊重用户的选择。',
        '如果用户已经在讨论相关话题，这是一个很好的切入时机。',
        '',
      ].join('\n');
    }

    // 8. Build system prompt (delegate to personaEngine)
    let systemPrompt = personaEngine.buildCoachSystemPrompt({
      intentResult,
      strategyResult: { strategy: strategyResult.internalStrategy, ...strategyResult },
      userProfile,
      emotionResult,
      conversationStage,
      crossAgentContext,
      pppSnapshot, // RC-6: evidence-informed coaching
    });

    // RC-7: Append learning recommendation block to system prompt
    if (learningPromptBlock) {
      systemPrompt += learningPromptBlock;
    }

    // Append questioning section if not already included by persona engine
    // (personaEngine.buildCoachSystemPrompt already calls generateQuestioningPromptSection internally)

    // 9. Get persona state for metadata
    const personaState = personaEngine.getPersonaState();

    // 10. Map internal strategy to CoachingSkill strategy
    const outputStrategy = this._mapStrategy(strategyResult);

    // 11. Call LLM or return fallback
    let content;
    let isFallback = false;
    if (this.isLLMAvailable) {
      try {
        const temperature = this._getTemperatureForMode(personaState.mode);
        const messages = this._buildLLMMessages(conversationHistory, userMessage);

        const budget = getTokenBudget('conversation');
        content = await this.callLLM(systemPrompt, messages, {
          ...budget,
          temperature,
        });
      } catch (e) {
        // 结构化错误：LLM 调用失败，降级到规则回复
        const wrapped = new SkillError('CoachingSkill LLM call failed', {
          code: 'LLM_CALL_FAILED',
          skillName: this.name,
          fallbackContent: null,
          cause: e,
        });
        console.warn(`[CoachingSkill] ${wrapped.code}:`, wrapped.message);
        content = this._getFallbackResponse(intentResult.intent);
        isFallback = true;
      }
    } else {
      content = this._getFallbackResponse(intentResult.intent);
      isFallback = true;
    }

    // 12. Build PPP observation sideEffect (fire-and-forget, skip on fallback)
    const pppSideEffects = isFallback ? [] : this._buildPPPObservation({
      userMessage,
      userId: userProfile?.id || userProfile?.userId || null,
      sessionId: inputMeta.sessionId || null,
      signalDetection,
      emotionResult,
      conversationStage,
      outputStrategy,
    });

    // 13. Return SkillOutput
    return {
      content,
      sideEffects: pppSideEffects,
      metadata: {
        persona: {
          emotionLabel: personaState.emotionLabel,
          stageLabel: personaState.stageLabel,
          modeLabel: personaState.modeName,
          modeSwitched: modeResult.switched ? modeResult.reason : null,
        },
        strategy: outputStrategy,
        isFallback,
        frameworkId: strategyResult.frameworkId || null,
        learningRecommendation: recommendationAction?.action
          ? { domain: recommendationAction.domain, status: recommendationAction.action === 'accept' ? 'accepted' : 'rejected', projectId: recommendationAction.projectId || null }
          : learningRecommendation
            ? { domain: learningRecommendation.domain, topic: (learningRecommendation.recommendation || {}).topic, status: 'delivered' }
            : null,
      },
    };
  }

  /**
   * Build PPP observation sideEffects from coaching context.
   * Non-blocking: returns async functions that the caller fires-and-forgets.
   * @private
   */
  _buildPPPObservation({ userMessage, userId, sessionId, signalDetection, emotionResult, conversationStage, outputStrategy }) {
    if (!userId || !userMessage) return [];

    const detectedSignals = [];
    if (signalDetection?.primary) detectedSignals.push(signalDetection.primary);
    if (signalDetection?.secondary) {
      detectedSignals.push(...signalDetection.secondary);
    }

    // Build confidence from available signals
    const confidence = signalDetection?.confidence || (detectedSignals.length > 0 ? 0.7 : 0.4);

    return [{
      type: 'ppp_observe',
      execute: async () => {
        try {
          const ppp = getPPPEngine();
          await ppp.observeSignal({
            userId,
            sessionId,
            type: 'utterance',
            content: userMessage,
            detectedSignals,
            confidence,
            source: 'dialogue',
            reportedBy: 'COACH',
            metadata: {
              emotion: emotionResult?.emotion || null,
              stage: conversationStage || null,
              strategy: outputStrategy || null,
            },
          });
        } catch (err) {
          // Fire-and-forget: PPP failure must not affect coaching
          console.warn('[CoachingSkill] PPP observation failed:', err.message);
        }
      },
    }];
  }

  // ==================== Intent analysis (LLM-first, keyword fallback) ====================

  async _analyzeIntent(userText, conversationHistory, emotionResult) {
    // LLM 可用时优先用 LLM 做意图识别
    if (this.isLLMAvailable) {
      try {
        const llmResult = await this._analyzeIntentWithLLM(userText, conversationHistory);
        if (llmResult) return llmResult;
      } catch {
        // LLM 失败，静默降级到关键词
      }
    }
    return this._analyzeIntentByKeywords(userText, conversationHistory, emotionResult);
  }

  async _analyzeIntentWithLLM(userText, conversationHistory) {
    const recentContext = conversationHistory.slice(-4).map(m =>
      `${m.role === 'user' ? '用户' : 'AI'}: ${m.content.slice(0, 80)}`
    ).join('\n');

    const prompt = [
      '你是教练对话的意图分类器。根据用户最新消息和近期对话，判断意图类型。',
      '',
      '可选意图（只能选一个）：',
      '- greeting: 打招呼、问候、自我介绍',
      '- clarification: 追问、请求解释、对之前内容的疑问',
      '- tool_application: 想了解或使用管理工具/框架（如 OKR、GROW、STAR）',
      '- case_discussion: 讨论具体案例、引用他人经验',
      '- situation_analysis: 描述自己的管理情境、遇到的问题或挑战',
      '- reflection: 复盘、反思、总结经验教训',
      '- planning: 做计划、规划方案、设计下一步',
      '- emotional_support: 表达情绪困扰、压力、焦虑、挫败感',
      '',
      '返回严格JSON（不要其他内容）：',
      '{"intent":"xxx","confidence":0.x,"keywords":["关键词1","关键词2"]}',
    ].join('\n');

    const messages = [];
    if (recentContext) {
      messages.push({ role: 'user', content: `【近期对话】\n${recentContext}` });
      messages.push({ role: 'assistant', content: '已了解对话上下文。' });
    }
    messages.push({ role: 'user', content: `【最新消息】${userText}` });

    const result = await this.callLLMForJSON(prompt, messages, {
      maxTokens: 100,
      temperature: 0.1,
    });

    if (result?.intent && Object.values(IntentType).includes(result.intent)) {
      return {
        intent: result.intent,
        confidence: Math.min(result.confidence || 0.8, 1),
        keywords: Array.isArray(result.keywords) ? result.keywords : this._extractKeywords(userText),
      };
    }
    return null; // 解析失败，降级
  }

  _analyzeIntentByKeywords(userText, conversationHistory, emotionResult) {
    const msg = userText.toLowerCase();
    const isFirstMessage = conversationHistory.filter(m => m.role === 'user').length === 0;

    if (this._isGreeting(msg, isFirstMessage)) {
      return { intent: IntentType.GREETING, confidence: 0.9, keywords: ['问候'] };
    }

    const toolKeywords = this._detectToolKeywords(msg);
    if (toolKeywords.length > 0) {
      return { intent: IntentType.TOOL_APPLICATION, confidence: 0.85, keywords: toolKeywords };
    }

    if (this._matchesPattern(msg, ['复盘', '回顾', '总结', '反思', '经验', '教训', '学到'])) {
      return { intent: IntentType.REFLECTION, confidence: 0.8, keywords: ['复盘'] };
    }

    if (this._matchesPattern(msg, ['规划', '计划', '设计', '方案', '如何做', '下一步'])) {
      return { intent: IntentType.PLANNING, confidence: 0.8, keywords: ['规划'] };
    }

    if (this._matchesPattern(msg, ['框架', '模型', '工具'])) {
      return { intent: IntentType.TOOL_APPLICATION, confidence: 0.8, keywords: this._extractKeywords(msg) };
    }

    if (this._isSituationDescription(msg, conversationHistory)) {
      return { intent: IntentType.SITUATION_ANALYSIS, confidence: 0.8, keywords: this._extractKeywords(msg) };
    }

    if (this._isCaseDiscussion(msg)) {
      return { intent: IntentType.CASE_DISCUSSION, confidence: 0.75, keywords: this._extractKeywords(msg) };
    }

    if (this._isClarification(msg)) {
      return { intent: IntentType.CLARIFICATION, confidence: 0.75, keywords: this._extractKeywords(msg) };
    }

    return { intent: IntentType.SITUATION_ANALYSIS, confidence: 0.5, keywords: this._extractKeywords(msg) };
  }

  // ==================== Strategy selection (ported from CoachAgent) ====================

  _selectStrategy(intentResult, userProfile, conversationHistory, emotionResult, signalDetection = null) {
    const { intent } = intentResult;
    const emotion = emotionResult?.emotion;

    // Signal-aware override: coaching signals (⑤⑦⑧) take priority over intent-based strategy
    // (except emotional support which always takes highest priority)
    if (signalDetection?.primary && COACHING_SIGNAL_STRATEGIES[signalDetection.primary]) {
      const signalType = SIGNAL_TYPES[signalDetection.primary];
      if (signalType?.handler === 'coaching') {
        const signalStrategy = COACHING_SIGNAL_STRATEGIES[signalDetection.primary];
        return {
          internalStrategy: signalStrategy,
          strategy: signalStrategy,
          reason: `信号检测: ${signalType.label}`,
          suggestedTools: [],
          signalDriven: true,
        };
      }
    }

    if (intent === IntentType.EMOTIONAL_SUPPORT) {
      return { internalStrategy: 'ask', strategy: 'ask', reason: '检测到情绪波动，优先倾听和共情', suggestedTools: [] };
    }
    if (intent === IntentType.GREETING) {
      return { internalStrategy: 'tell', strategy: 'tell', reason: '用户打招呼', suggestedTools: [] };
    }
    if (intent === IntentType.CLARIFICATION) {
      return { internalStrategy: 'ask', strategy: 'ask', reason: '引导澄清', suggestedTools: [] };
    }
    if (intent === IntentType.TOOL_APPLICATION) {
      const toolIds = this._getToolIdsFromKeywords(intentResult.keywords);
      if (intentResult.userTextLength > 80) {
        const frameworkId = toolIds[0] || this._inferFramework(intentResult.keywords);
        return {
          internalStrategy: 'framework_guided',
          strategy: 'framework_guided',
          reason: '框架导向分析',
          suggestedTools: toolIds,
          frameworkId,
        };
      }
      return { internalStrategy: 'tell', strategy: 'tell', reason: '讲解管理工具', suggestedTools: toolIds };
    }
    if (intent === IntentType.REFLECTION) {
      return { internalStrategy: 'ask', strategy: 'ask', reason: '引导复盘反思', suggestedTools: ['star-feedback'] };
    }
    if (intent === IntentType.PLANNING) {
      return { internalStrategy: 'plan', strategy: 'plan', reason: '生成结构化方案', suggestedTools: ['smart-goals'] };
    }
    if (intent === IntentType.CASE_DISCUSSION) {
      const toolIds = this._getToolIdsFromKeywords(intentResult.keywords);
      if (intentResult.userTextLength > 80) {
        const frameworkId = toolIds[0] || this._inferFramework(intentResult.keywords);
        return {
          internalStrategy: 'framework_guided',
          strategy: 'framework_guided',
          reason: '框架引导案例分析',
          suggestedTools: toolIds,
          frameworkId,
        };
      }
      return { internalStrategy: 'ask', strategy: 'ask', reason: '案例讨论', suggestedTools: toolIds };
    }
    if (intent === IntentType.SITUATION_ANALYSIS) {
      const userTurns = conversationHistory.filter(m => m.role === 'user').length;
      const hasDeepContext = userTurns > 2;

      if (['anxious', 'confused'].includes(emotion) && !hasDeepContext) {
        return { internalStrategy: 'ask', strategy: 'ask', reason: '情绪倾听', suggestedTools: [] };
      }

      const toolIds = this._getToolIdsFromKeywords(intentResult.keywords);

      if (intentResult.userTextLength > 80) {
        const frameworkId = toolIds[0] || this._inferFramework(intentResult.keywords);
        return {
          internalStrategy: 'framework_guided',
          strategy: 'framework_guided',
          reason: '框架导向情境分析',
          suggestedTools: toolIds,
          frameworkId,
        };
      }
      if (hasDeepContext) {
        return { internalStrategy: 'review', strategy: 'review', reason: '综合建议', suggestedTools: toolIds };
      }
      return { internalStrategy: 'ask', strategy: 'ask', reason: '引导补充', suggestedTools: toolIds };
    }

    return { internalStrategy: 'ask', strategy: 'ask', reason: '默认提问引导', suggestedTools: [] };
  }

  /**
   * Map internal strategy result to CoachingSkill output strategy.
   *
   * tell/ask/review → open_dialogue
   * plan → plan
   * framework_guided → framework_guided
   * If tools are suggested → tool_recommendation (overrides open_dialogue)
   */
  _mapStrategy(strategyResult) {
    const { internalStrategy, suggestedTools = [], signalDriven } = strategyResult;

    // Signal-driven strategies pass through directly
    if (signalDriven) return internalStrategy;

    if (internalStrategy === 'plan') return 'plan';
    if (internalStrategy === 'framework_guided') return 'framework_guided';

    // If tools are suggested with tell/ask/review, it's a tool recommendation
    if (suggestedTools.length > 0) return 'tool_recommendation';

    return 'open_dialogue';
  }

  // ==================== LLM message construction ====================

  /**
   * Build messages array for LLM, filtering/annotating fallback responses in history.
   * Fallback messages (isFallback or _fallback in metadata) are replaced with a brief
   * system note so the LLM understands the service interruption context.
   */
  _buildLLMMessages(conversationHistory, userMessage) {
    const FALLBACK_NOTE = '[系统提示：此处因服务临时中断，返回了固定提示语而非真正的对话回复。请忽略该消息的内容，不要将中断前后用户的重复视为行为信号。]';

    const messages = conversationHistory.slice(-10).map(m => {
      // Detect fallback messages by metadata flags
      const meta = m.metadata || {};
      const wasFallback = meta.isFallback || meta._fallback;

      if (wasFallback && m.role === 'assistant') {
        return { role: 'assistant', content: FALLBACK_NOTE };
      }
      return { role: m.role, content: m.content };
    });

    messages.push({ role: 'user', content: userMessage });
    return messages;
  }

  // ==================== Learning recommendation response detection ====================

  /**
   * Detect if user is responding to a previously delivered learning recommendation.
   * Checks: (1) last assistant message contains recommendation markers, (2) user message signals accept/reject.
   *
   * @returns {{ action: 'accept'|'reject', domain: string, projectId?: string }|null}
   */
  _detectRecommendationResponse(userMessage, conversationHistory, ppp, userId) {
    // Find last assistant message
    const lastAssistant = [...conversationHistory].reverse().find(m => m.role === 'assistant');
    if (!lastAssistant) return null;

    // Check if last assistant message contained a learning recommendation
    const recMarkers = ['建议安排', '系统学习', '正式学习', '学习建议', '针对性学习'];
    const hasRecMarker = recMarkers.some(m => lastAssistant.content.includes(m));
    if (!hasRecMarker) return null;

    // Check PPP for pending recommendations to get the domain
    const pending = ppp.getPendingRecommendations(userId);
    if (!pending || pending.length === 0) return null;

    // Pick highest score recommendation (same logic as RC-7)
    const topRec = pending.reduce((best, r) =>
      (r.triggerScore || 0) > (best.triggerScore || 0) ? r : best
    , pending[0]);

    const msg = userMessage.toLowerCase();

    // Accept signals
    const acceptPatterns = /好的?|可以|安排吧|没问题|行|来吧|好啊|ok|yes|要|愿意|接受|开始吧|试试/;
    // Reject signals
    const rejectPatterns = /不了|不用|先不|暂时不|不需要|算了|不要|拒绝|no|不想|以后再说|下次|不急/;

    if (acceptPatterns.test(msg)) {
      // Create project + route approval + dismiss recommendation
      try {
        const projectId = createFromRecommendation(topRec);
        routeApproval(projectId);
        ppp.dismissRecommendation(userId, topRec.domain);
        return { action: 'accept', domain: topRec.domain, projectId };
      } catch {
        return null;
      }
    }

    if (rejectPatterns.test(msg)) {
      ppp.rejectRecommendation(userId, topRec.domain);
      return { action: 'reject', domain: topRec.domain };
    }

    return null;
  }

  // ==================== Emotion priority ====================

  _needsEmotionalPriority(emotionResult) {
    const strongNegative = ['frustrated', 'discouraged', 'anxious'];
    return strongNegative.includes(emotionResult.emotion) && emotionResult.confidence > 0.5;
  }

  // ==================== Temperature ====================

  _getTemperatureForMode(mode) {
    const temps = { MENTOR: 0.75, STRATEGIST: 0.55, CHALLENGER: 0.65, OBSERVER: 0.5 };
    return temps[mode] || 0.7;
  }

  // ==================== Fallback response ====================

  _getFallbackResponse(intent) {
    // LLM 不可用时的诚实降级——不假装智能对话
    if (intent === IntentType.GREETING) {
      return 'Leo AI 服务暂时不可用，没法正常对话。刷新页面或稍后再试。';
    }
    return 'Leo AI 服务暂时不可用，没法深入聊你的话题。\n\n' +
      '你可以先：\n' +
      '- 去**知识工具库**探索管理工具和框架\n' +
      '- 试试**场景训练**做实战演练\n\n' +
      '服务恢复后回来，我们继续。';
  }

  // ==================== Helper methods (ported from CoachAgent) ====================

  _isGreeting(msg, isFirstMessage) {
    const greetingPattern = /^(你好|hi|hello|嗨|早上好|下午好|晚上好|老师好)/;
    const isShort = msg.length < 20;
    const noQuestion = !/(怎么|如何|为什么|什么|哪个|怎样|能不能|可以吗)/.test(msg);
    return greetingPattern.test(msg) && (isShort || noQuestion);
  }

  _detectToolKeywords(msg) {
    const toolKeywordSets = {
      'smart-goals': ['目标', '分解', 'okr', 'kpi', 'smart'],
      'grow-model': ['一对一', '辅导', '教练', 'grow'],
      'star-feedback': ['反馈', '面试', 'star'],
      'five-whys': ['根因', '5why', '为什么'],
      'meeting-3p': ['会议', '3p'],
    };
    const matched = [];
    for (const [, keywords] of Object.entries(toolKeywordSets)) {
      for (const kw of keywords) {
        if (msg.includes(kw)) { matched.push(kw); break; }
      }
    }
    return matched;
  }

  _getToolIdsFromKeywords(keywords) {
    const toolMap = {
      '目标': 'smart-goals', '分解': 'smart-goals', 'okr': 'smart-goals',
      'smart': 'smart-goals', 'kpi': 'smart-goals',
      '一对一': 'grow-model', '辅导': 'grow-model', '教练': 'grow-model', 'grow': 'grow-model',
      '反馈': 'star-feedback', '面试': 'star-feedback', 'star': 'star-feedback',
      '根因': 'five-whys', '5why': 'five-whys',
      '会议': 'meeting-3p', '3p': 'meeting-3p',
      '汇报': 'bad-news-report', '坏消息': 'bad-news-report',
      '复盘': 'star-feedback',
      '目标管理': 'smart-goals', '沟通技巧': 'grow-model',
      '冲突管理': 'five-whys', '团队管理': 'grow-model',
    };
    const ids = new Set();
    for (const kw of keywords) {
      const id = toolMap[kw];
      if (id) ids.add(id);
    }
    return [...ids];
  }

  _matchesPattern(msg, words) {
    return words.some(w => msg.includes(w));
  }

  _inferFramework(keywords) {
    const kws = keywords.join(' ');
    if (/反馈|表现|评价/.test(kws)) return 'star-feedback';
    if (/辅导|成长|发展/.test(kws)) return 'grow-model';
    if (/目标|KPI|OKR|绩效/.test(kws)) return 'smart-goals';
    if (/会议|沟通效率/.test(kws)) return 'meeting-3p';
    if (/根因|原因|为什么/.test(kws)) return 'five-whys';
    if (/冲突|矛盾|分歧/.test(kws)) return 'five-whys';
    return 'grow-model';
  }

  _isSituationDescription(msg, history) {
    const descriptive = ['团队', '员工', '下属', '领导', '同事', '项目', '任务', '问题', '困难', '挑战', '矛盾', '冲突'];
    return (descriptive.some(w => msg.includes(w)) && msg.length > 30) || history.length > 4;
  }

  _isCaseDiscussion(msg) {
    const caseSignals = ['案例', '举例', '比如说', '有个', '之前有', '上次', '我听说', '同行'];
    return caseSignals.some(w => msg.includes(w)) && msg.length > 40;
  }

  _isClarification(msg) {
    const questionWords = ['什么', '怎么', '如何', '为什么', '哪个', '怎样'];
    return questionWords.some(w => msg.includes(w)) && msg.length < 50;
  }

  _extractKeywords(msg) {
    const keywordMap = {
      '目标': '目标管理', '沟通': '沟通技巧', '冲突': '冲突管理',
      '绩效': '绩效管理', '团队': '团队管理', '委派': '授权委派',
      '时间': '时间管理', '效率': '效率提升', '矛盾': '冲突处理',
    };
    const found = [];
    for (const [key, value] of Object.entries(keywordMap)) {
      if (msg.includes(key)) found.push(value);
    }
    return found.length > 0 ? found : ['管理话题'];
  }
}
