/**
 * LecturerPersona (老徐) — adaptive knowledge delivery persona.
 *
 * Composes 2 Skills:
 *   - ContentSkill (primary — knowledge delivery)
 *   - EvaluationSkill (understanding checks)
 *
 * Teaching interaction model:
 *   - Adaptive depth based on Dreyfus stage in userProfile
 *   - Understanding checks after key concepts
 *   - LLM prompt: "你是老徐，自适应授课者"
 *   - Fallback: structured knowledge summary without LLM
 */

import { PersonaBase } from './PersonaBase';
import { ContentSkill } from '../skills/ContentSkill';
import { EvaluationSkill } from '../skills/EvaluationSkill';
import { getLLMClient, isLLMEnabled } from '../agents/core/LLMClient';
import { createCognitiveLoadVector } from '../types/cognitiveLoad';
import { classifyError } from '../skills/errorClassification';
import { ContentGenerationPlatform } from '../modules/cgp/ContentGenerationPlatform';
import { AssessmentEvidenceCollector } from '../modules/cgp/AssessmentEvidenceCollector';
import { parseComponentIntent } from '../services/componentIntentParser';
import { getTokenBudget } from '../config/llm';

// Dreyfus stage → teaching mode mapping
const DREYFUS_TEACHING_MAP = {
  novice: { mode: 'structured', depth: 'basic', scaffolding: 'full' },
  advanced_beginner: { mode: 'guided', depth: 'moderate', scaffolding: 'high' },
  competent: { mode: 'interactive', depth: 'moderate', scaffolding: 'medium' },
  proficient: { mode: 'discussion', depth: 'advanced', scaffolding: 'low' },
  expert: { mode: 'concise', depth: 'advanced', scaffolding: 'minimal' },
};

const DEFAULT_TEACHING_MODE = DREYFUS_TEACHING_MAP.competent;

// Intrinsic load baseline by Dreyfus stage — novice faces higher inherent complexity
const DREYFUS_INTRINSIC_BASELINE = {
  novice: 0.8,
  advanced_beginner: 0.6,
  competent: 0.45,
  proficient: 0.3,
  expert: 0.15,
};

export class LecturerPersona extends PersonaBase {
  constructor() {
    super();
    this.contentSkill = new ContentSkill();
    this.evaluationSkill = new EvaluationSkill();
  }

  get displayName() {
    return '老徐';
  }

  get personaId() {
    return 'lecturer';
  }

  get contexts() {
    return ['learner'];
  }

  /**
   * Handle a knowledge delivery message.
   *
   * Flow:
   * 1. Determine Dreyfus stage from userProfile
   * 2. Use ContentSkill for knowledge retrieval
   * 3. Generate adaptive response via LLM or fallback
   * 4. Periodically check understanding via EvaluationSkill
   * 5. Return PersonaOutput with metadata.teachingMode
   *
   * 【持久化说明】conversationHistory 当前由 AICoachV2 React state 管理，
   * 跨会话持久化应通过 DataService.saveBlackboard(sessionId, { lecturerHistory }) 实现。
   * 恢复时从 DataService.getBlackboard(sessionId) 读取并注入。
   */
  async handleMessage({ userMessage, conversationHistory = [], userProfile, context, metadata = {} }) {
    const dreyfusLevel = userProfile?.dreyfusLevel || 'competent';
    const teachingConfig = DREYFUS_TEACHING_MAP[dreyfusLevel] || DEFAULT_TEACHING_MODE;

    // ─── CGP 集成路径：当 metadata 包含 courseId 时，从 CGP 加载课程配置 ───
    let cgpContext = null;
    if (metadata.courseId) {
      cgpContext = await this._loadCGPContext(metadata.courseId, metadata.stageId, metadata.learnerState);
    }

    // Step 1: Get knowledge context
    let knowledgeContext = '';
    try {
      const contentResult = await this.contentSkill.execute(
        this.contentSkill.buildInput({
          context: context || 'learner',
          userMessage,
          userProfile,
          metadata: { action: 'getToolContext', toolIds: [] },
        })
      );
      knowledgeContext = contentResult.metadata?.contextInsert || '';
    } catch {
      // Silently fail
    }

    // CGP 增强：将阶段关键点注入知识上下文
    if (cgpContext?.stageContent?.executionHint?.keyPoints) {
      const cgpKeyPoints = cgpContext.stageContent.executionHint.keyPoints.join('、');
      knowledgeContext += `\n\n【本阶段关键点】${cgpKeyPoints}`;
    }

    // CGP 增强：用策略预设丰富教学配置
    let enhancedTeachingConfig = teachingConfig;
    if (cgpContext?.aiEngineConfig) {
      enhancedTeachingConfig = {
        ...teachingConfig,
        // 策略预设的认知负荷预算影响脚手架强度
        cognitiveLoadBudget: cgpContext.aiEngineConfig.strategyPresets.cognitiveLoadBudget,
        preferredStrategies: cgpContext.aiEngineConfig.strategyPresets.resolvedStrategies,
        tone: cgpContext.aiEngineConfig.personaOverrides.tone,
      };
    }

    // Step 2: Generate response
    let content;
    if (isLLMEnabled()) {
      try {
        content = await this._generateLLMResponse(
          userMessage,
          conversationHistory,
          userProfile,
          enhancedTeachingConfig,
          knowledgeContext
        );
      } catch {
        content = this._generateFallbackResponse(userMessage, teachingConfig);
      }
    } else {
      content = this._generateFallbackResponse(userMessage, teachingConfig);
    }

    // Step 3: Compute cognitive load vector (§16.3)
    const cognitiveLoad = this._estimateCognitiveLoad(
      dreyfusLevel, conversationHistory, userMessage
    );

    // Step 4: Check if understanding check is needed
    // CGP 增强：check 阶段使用互动类型配置
    const userTurns = conversationHistory.filter(m => m.role === 'user').length;
    const isCheckStage = cgpContext?.stageContent?.stage?.type === 'check';
    const needsCheck = isCheckStage || (userTurns > 0 && userTurns % 3 === 0);

    if (needsCheck && content) {
      const interactionType = cgpContext?.stageContent?.interactionType;
      if (interactionType?.promptTemplate) {
        content += `\n\n---\n**理解检查**: ${interactionType.promptTemplate}`;
      } else {
        content += '\n\n---\n**理解检查**: 你能用自己的话概括一下刚才的核心要点吗？';
      }
    }

    // Step 5: Error classification (§18) — when evaluation context available
    let errorClassification = null;
    if (metadata.evaluateError && metadata.conceptId) {
      errorClassification = classifyError({
        learnerResponse: userMessage,
        conceptId: metadata.conceptId,
        masteryHistory: metadata.masteryHistory || null,
        frequency: metadata.errorFrequency || 1,
        isPrerequisite: metadata.isPrerequisite || false,
        misconceptionDetected: metadata.misconceptionDetected || false,
        contextMismatch: metadata.contextMismatch || false,
        toolMismatch: metadata.toolMismatch || false,
      });
    }

    const resultMetadata = {
      teachingMode: enhancedTeachingConfig.mode,
      dreyfusLevel,
      depth: enhancedTeachingConfig.depth,
      scaffolding: enhancedTeachingConfig.scaffolding,
      hasUnderstandingCheck: needsCheck,
      cognitiveLoad,
    };

    if (errorClassification) {
      resultMetadata.errorClassification = errorClassification;
    }

    // CGP 增强：附加 CGP 元数据
    if (cgpContext) {
      resultMetadata.cgp = {
        courseId: metadata.courseId,
        stageId: cgpContext.stageContent?.stage?.stageId || metadata.stageId,
        stageType: cgpContext.stageContent?.stage?.type || null,
        interactionTypeId: cgpContext.stageContent?.interactionType?.id || null,
        guardrailsValid: cgpContext.guardrailsResult?.valid ?? true,
        guardrailViolations: cgpContext.guardrailsResult?.violations || [],
      };
    }

    // ─── 证据采集 sideEffect：check/practice 阶段完成后推送 PPP ───
    const sideEffects = [];
    if (cgpContext && this._isEvidenceStage(cgpContext.stageContent?.stage?.type)) {
      sideEffects.push({
        type: 'ASYNC_COLLECT_EVIDENCE',
        execute: () => this._collectStageEvidence(
          cgpContext,
          metadata,
          userMessage,
          userProfile
        ),
      });
    }

    // Parse componentIntent from LLM metadata
    // TODO: LecturerPersona._generateLLMResponse 目前返回纯字符串，无结构化 metadata。
    // componentIntent 需等 LLM 响应升级为 { content, metadata } 后才能真正工作。
    // 当前从 resultMetadata 读取（由上游注入或本地构建），与 CoachPersona 的 coachingResult.metadata 对应。
    const richComponents = [];
    const intent = resultMetadata?.componentIntent;
    if (intent) {
      const rc = parseComponentIntent(intent);
      if (rc) richComponents.push(rc);
    }

    return {
      content,
      richComponents: richComponents.length > 0 ? richComponents : undefined,
      sideEffects,
      metadata: resultMetadata,
    };
  }

  /**
   * Estimate cognitive load vector from learner state signals.
   *
   * - intrinsic:   Dreyfus-stage baseline (novice = high, expert = low)
   * - extraneous:  conversation fragmentation signals (short confused turns)
   * - germane:     question quality / engaged responses
   *
   * @private
   */
  _estimateCognitiveLoad(dreyfusLevel, conversationHistory, userMessage) {
    // Intrinsic: baseline from Dreyfus stage
    const intrinsic = DREYFUS_INTRINSIC_BASELINE[dreyfusLevel]
      ?? DREYFUS_INTRINSIC_BASELINE.competent;

    // Extraneous: estimate from conversation fragmentation
    // Short user messages + confusion signals → higher extraneous load
    const recentUserMsgs = conversationHistory
      .filter(m => m.role === 'user')
      .slice(-5);

    let extraneousSignals = 0;
    const confusionPatterns = /不懂|不明白|太难|搞不清|什么意思|confused|don't understand/i;

    for (const msg of recentUserMsgs) {
      if (msg.content && msg.content.length < 15) extraneousSignals += 0.1;
      if (msg.content && confusionPatterns.test(msg.content)) extraneousSignals += 0.15;
    }
    if (confusionPatterns.test(userMessage)) extraneousSignals += 0.15;
    const extraneous = Math.min(1, extraneousSignals);

    // Germane: question quality / engagement signals
    // Longer, substantive responses suggest productive engagement
    let germaneSignals = 0.3; // baseline
    const engagementPatterns = /为什么|怎么|如何|能不能举个例|比如说|我理解|也就是说/i;

    for (const msg of recentUserMsgs) {
      if (msg.content && msg.content.length > 30) germaneSignals += 0.08;
      if (msg.content && engagementPatterns.test(msg.content)) germaneSignals += 0.1;
    }
    if (engagementPatterns.test(userMessage)) germaneSignals += 0.1;
    if (userMessage.length > 30) germaneSignals += 0.08;
    const germane = Math.min(1, germaneSignals);

    return createCognitiveLoadVector({ intrinsic, extraneous, germane });
  }

  /**
   * Generate LLM-based teaching response.
   */
  async _generateLLMResponse(userMessage, conversationHistory, userProfile, teachingConfig, knowledgeContext) {
    const systemPrompt = this._buildSystemPrompt(userProfile, teachingConfig, knowledgeContext);
    const llm = getLLMClient();

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8).map(m => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const budget = getTokenBudget('teaching');
    return llm.chat(messages, { ...budget, temperature: 0.6 });
  }

  /**
   * Build system prompt for teaching.
   */
  _buildSystemPrompt(userProfile, teachingConfig, knowledgeContext) {
    const parts = [
      '你是老徐，一位自适应授课者。你的任务是根据学员的水平，用最合适的方式讲解管理知识。',
      '',
      `【学员信息】`,
      `岗位：${userProfile?.roleLabel || '管理者'}`,
      `能力水平：${teachingConfig.depth === 'basic' ? '初学者' : teachingConfig.depth === 'advanced' ? '资深管理者' : '中级管理者'}`,
      '',
      `【教学模式】${teachingConfig.mode}`,
      `【教学深度】${teachingConfig.depth}`,
      `【脚手架强度】${teachingConfig.scaffolding}`,
      '',
    ];

    if (teachingConfig.scaffolding === 'full') {
      parts.push('【教学要求】');
      parts.push('- 使用完整的脚手架：先给概念定义，再给结构化步骤，最后举例');
      parts.push('- 语言简洁明了，避免术语堆砌');
      parts.push('- 每次只讲一个核心概念');
    } else if (teachingConfig.scaffolding === 'minimal') {
      parts.push('【教学要求】');
      parts.push('- 简洁引导，点到为止');
      parts.push('- 可以使用专业术语，不需要过多解释');
      parts.push('- 侧重实践洞察和边界条件');
    } else {
      parts.push('【教学要求】');
      parts.push('- 平衡概念讲解和实践引导');
      parts.push('- 适当使用案例帮助理解');
      parts.push('- 鼓励学员思考和提问');
    }

    if (knowledgeContext) {
      parts.push('');
      parts.push('【参考知识】');
      parts.push(knowledgeContext);
    }

    parts.push('');
    parts.push('用 Markdown 格式输出，结构清晰。');

    return parts.join('\n');
  }

  // ─── CGP 集成私有方法 ──────────────────────────────────────────────────────

  /**
   * 从 CGP 加载课程上下文
   * @private
   */
  async _loadCGPContext(courseId, stageId, learnerState) {
    try {
      const cgp = new ContentGenerationPlatform();
      const course = cgp.loadMasterCourse(courseId);
      const resolvedStageId = stageId || course.teachingScript.stages[0]?.stageId || 'hook';
      const stageContent = await cgp.resolveStageContent(course, resolvedStageId);

      // 护栏验证
      const guardrailsResult = cgp.validateExecutionGuardrails(course, {
        completedStages: learnerState?.completedStages || [],
        currentStageId: resolvedStageId,
        evidenceCollected: learnerState?.evidenceCollected,
        emotionState: learnerState?.emotionState,
      });

      return {
        course,
        stageContent,
        aiEngineConfig: course.aiEngineConfig,
        guardrailsResult,
      };
    } catch (err) {
      // CGP 加载失败不阻塞教学——回退到无 CGP 模式
      console.warn(`[LecturerPersona] CGP 加载失败 (${courseId}): ${err.message}`);
      return null;
    }
  }

  /**
   * 判断阶段类型是否需要证据采集
   * @private
   */
  _isEvidenceStage(stageType) {
    return ['check', 'practice', 'diagnose'].includes(stageType);
  }

  /**
   * 采集阶段证据并推送 PPP（异步 sideEffect）
   * @private
   */
  async _collectStageEvidence(cgpContext, metadata, responseContent, userProfile) {
    try {
      const collector = new AssessmentEvidenceCollector(null); // MVP: 无 PPP 实例
      const stageResult = {
        stageId: cgpContext.stageContent.stage.stageId,
        stageType: cgpContext.stageContent.stage.type,
        responseContent,
        interactionType: cgpContext.stageContent.interactionType?.id || 'unknown',
        timestamp: Date.now(),
      };

      return await collector.collectEvidence(
        stageResult,
        cgpContext.course.assessmentEvidence,
        {
          userId: userProfile?.userId || 'unknown',
          sessionId: metadata.sessionId || 'unknown',
          courseId: metadata.courseId,
        }
      );
    } catch (err) {
      console.warn(`[LecturerPersona] 证据采集失败: ${err.message}`);
      return null;
    }
  }

  /**
   * Fallback response without LLM.
   */
  _generateFallbackResponse(userMessage, teachingConfig) {
    const topic = (userMessage || '').slice(0, 30);
    const scaffolding = teachingConfig.scaffolding || 'medium';

    // 诚实降级：LLM 不可用时不假装教学，而是给出有用的自助指引
    if (scaffolding === 'full' || scaffolding === 'high') {
      return [
        `老徐现在脑子转不动（AI 服务暂时不可用），没法给你做深度讲解。`,
        '',
        `不过你提到的「${topic}」，可以先这样自助：`,
        '1. 去**知识工具库**搜索相关框架，先建立基本认知',
        '2. 把你的具体场景写下来，等我恢复了咱们逐步拆解',
        '',
        '服务恢复后刷新页面就好。',
      ].join('\n');
    }

    return [
      `老徐 AI 服务暂时不可用，没法就「${topic}」展开讨论。`,
      '',
      '你可以先去**知识工具库**查阅相关工具，带着具体问题回来。',
    ].join('\n');
  }
}
