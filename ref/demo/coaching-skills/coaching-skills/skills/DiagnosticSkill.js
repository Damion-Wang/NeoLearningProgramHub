/**
 * DiagnosticSkill — BEI interview diagnostic logic extracted from DiagnosticAgent.
 *
 * Actions:
 *   - evaluateAnswer: heuristic BEI answer evaluation (rule-based + shouldUseLlm flag)
 *   - generateProbe:  LLM-enhanced follow-up question generation with DSTF model
 *
 * Default action: evaluateAnswer
 */

import { SkillBase } from './SkillBase';
import {
  evaluateQuestionFollowup,
  shouldUseLlmProbe,
  detectUserQuestionInAnswer,
  detectDSTF,
  detectWeNotI,
  detectGeneralization,
  BEI_INTERVIEW_QUESTIONS,
} from '../modules/beiInterviewEngine';

export class DiagnosticSkill extends SkillBase {
  get name() {
    return 'diagnostic';
  }

  /**
   * @param {import('./SkillBase').SkillInput} input
   * @returns {Promise<import('./SkillBase').SkillOutput>}
   */
  async execute(input) {
    const { metadata: inputMeta = {} } = input;
    const action = inputMeta.action || 'evaluateAnswer';

    switch (action) {
      case 'evaluateAnswer':
        return this._evaluateAnswer(inputMeta);
      case 'generateProbe':
        return this._generateProbe(inputMeta, input.userProfile);
      default:
        return this._evaluateAnswer(inputMeta);
    }
  }

  // ==================== evaluateAnswer ====================

  _evaluateAnswer(meta) {
    const { questionId, answerText = '', previousAnswers = {} } = meta;

    const question = BEI_INTERVIEW_QUESTIONS.find((q) => q.id === questionId);
    if (!question) {
      return {
        sideEffects: [],
        metadata: {
          needFollowup: false,
          followupQuestion: '',
          facts: [],
          gaps: [],
          shouldUseLlm: false,
          error: `Question not found: ${questionId}`,
        },
      };
    }

    const heuristic = evaluateQuestionFollowup(question, answerText, previousAnswers) || {};
    const shouldUseLlm = shouldUseLlmProbe(question, answerText, heuristic) || false;

    return {
      sideEffects: [],
      metadata: {
        needFollowup: heuristic.needFollowup || false,
        followupQuestion: heuristic.followupQuestion || '',
        facts: heuristic.facts || [],
        gaps: heuristic.gaps || [],
        shouldUseLlm,
        maxFollowupRounds: question.maxFollowupRounds || 2,
        questionId,
        category: question.category,
      },
    };
  }

  // ==================== generateProbe ====================

  async _generateProbe(meta, userProfile) {
    const {
      questionId,
      answerText = '',
      previousAnswers = {},
      diagnosticGaps = [],
      followupRound = 0,
    } = meta;

    const question = BEI_INTERVIEW_QUESTIONS.find((q) => q.id === questionId);
    if (!question) {
      return {
        sideEffects: [],
        metadata: {
          needFollowup: false,
          followupQuestion: '',
          facts: [],
          gaps: [],
          error: 'question_not_found',
        },
      };
    }

    const heuristic = evaluateQuestionFollowup(question, answerText, previousAnswers) || {};
    const userAskedQuestion = detectUserQuestionInAnswer(answerText) || false;
    const heuristicResult = {
      needFollowup: userAskedQuestion ? true : (heuristic.needFollowup || false),
      followupQuestion: heuristic.followupQuestion || '请补充更多细节。',
      facts: heuristic.facts || [],
      gaps: heuristic.gaps || [],
    };

    // If LLM unavailable or not needed, return heuristic
    if (!this.isLLMAvailable || !shouldUseLlmProbe(question, answerText, heuristic)) {
      return {
        sideEffects: [],
        metadata: {
          ...heuristicResult,
          _fallback: true,
          reason: !this.isLLMAvailable ? 'llm_unavailable' : 'heuristic_sufficient',
        },
      };
    }

    // LLM-enhanced probe
    const systemPrompt = this._buildProbePrompt(
      question,
      answerText,
      previousAnswers,
      diagnosticGaps,
      userProfile,
      followupRound,
      userAskedQuestion
    );

    const parsed = await this.callLLMForJSON(systemPrompt, [], { maxTokens: 300 });

    if (!parsed) {
      return {
        sideEffects: [],
        metadata: { ...heuristicResult, _fallback: true, reason: 'llm_parse_failed' },
      };
    }

    const llmQuestion = String(parsed.followupQuestion || '').trim();
    const coachReply = String(parsed.coachReply || '').trim();

    const isGeneric =
      /补充具体行为|关键数据|最终结果/.test(llmQuestion) &&
      question.category !== 'behavior-event';
    const resolvedFollowup =
      !llmQuestion || isGeneric ? heuristic.followupQuestion : llmQuestion;

    const mergedFollowup = coachReply
      ? `${coachReply}${resolvedFollowup ? `；另外，${resolvedFollowup}` : ''}`
      : resolvedFollowup;

    return {
      sideEffects: [],
      metadata: {
        needFollowup: userAskedQuestion
          ? true
          : Boolean(parsed.needFollowup || heuristic.needFollowup),
        followupQuestion:
          mergedFollowup || heuristic.followupQuestion || '请补充更多细节。',
        facts: Array.isArray(parsed.facts) ? parsed.facts.slice(0, 4) : [],
        gaps: Array.isArray(parsed.gaps)
          ? parsed.gaps.slice(0, 4)
          : heuristic.gaps || [],
        isGeneric,
        hasCoachReply: Boolean(coachReply),
      },
    };
  }

  // ==================== Prompt builder ====================

  _buildProbePrompt(
    question,
    answerText,
    previousAnswers,
    diagnosticGaps,
    userProfile,
    followupRound,
    userAskedQuestion
  ) {
    const dstf = detectDSTF(answerText);
    const hasWeNotI = detectWeNotI(answerText);
    const hasGeneralization = detectGeneralization(answerText);
    const isBehaviorEvent = question.category === 'behavior-event';

    const parts = [
      '你是经过BEI认证的访谈教练。你的任务是按照BEI标准（McBer/Hay体系）的DSTF四维探针模型评估用户回答并生成追问。',
      '',
      `【当前问题】${question.label}`,
      `【问题类别】${question.category}`,
      `【访谈目的】${question.purpose}`,
      `【用户岗位】${userProfile?.roleLabel || '管理者'}`,
      `【关键任务】${previousAnswers.keyTasks || ''}`,
      `【用户回答】${answerText}`,
      `【已追问轮次】${followupRound}`,
      `【用户是否在反问】${userAskedQuestion ? '是（先回应再引导）' : '否'}`,
    ];

    if (diagnosticGaps.length > 0) {
      parts.push(`【启发式诊断缺口】${diagnosticGaps.join('、')}`);
    }

    if (isBehaviorEvent) {
      parts.push('', '【DSTF四维探针分析】');
      parts.push(
        `  行动(Action/Did): ${dstf.hasAction ? '✓ 已获取' : '✗ 缺失——需追问"你具体做了什么？分几步？"'}`
      );
      parts.push(
        `  对话(Dialogue/Said): ${dstf.hasDialogue ? '✓ 已获取' : '✗ 缺失——需追问"你当时具体怎么说的？对方怎么回应？"'}`
      );
      parts.push(
        `  思考(Thinking/Thought): ${dstf.hasThinking ? '✓ 已获取' : '✗ 缺失——需追问"做这个决定前你是怎么想的？"'}`
      );
      parts.push(
        `  感受(Feeling/Felt): ${dstf.hasFeeling ? '✓ 已获取' : '✗ 缺失——需追问"当时的感受是什么？"'}`
      );
      if (hasWeNotI) parts.push('  ⚠️ 主语模糊：用户多次使用"我们"，需引导回到"我个人做了什么"');
      if (hasGeneralization)
        parts.push('  ⚠️ 概括性陈述：用户在描述习惯而非具体事件，需引导回到特定时间的真实事件');
      parts.push(
        '',
        '【追问策略】优先补齐缺失的DSTF维度。每次只问1个追问，不要一次问太多。如果Action已有，优先追Dialogue（原话）或Thinking（想法）。'
      );
    }

    parts.push(
      '',
      '请输出JSON：{"needFollowup":true|false,"followupQuestion":"具体追问","coachReply":"","facts":["从回答中提取的事实"],"gaps":["仍缺失的维度"]}',
      '要求：followupQuestion必须只问一个维度；语言温暖专业，帮助用户重新进入事件现场回忆细节。',
      '仅输出JSON，不要有其他文字。'
    );

    return parts.join('\n');
  }
}
