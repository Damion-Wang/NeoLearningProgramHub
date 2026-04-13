/**
 * EvaluationSkill — unified evaluation capability.
 *
 * Merges three agents into one Skill with sub-capabilities routed by metadata.action:
 *   - evaluateTurn        (from EvaluationAgent)
 *   - generateSessionFeedback (from FeedbackAgent)
 *   - updateEvidence      (from CompetencyEvidenceAgent)
 *   - generateReport      (from CompetencyEvidenceAgent)
 *
 * Default action when not specified: evaluateTurn
 */

import { SkillBase } from './SkillBase';
import { SkillError } from '../types/errors';
import {
  CAPABILITY_INDICATOR_MAPPING,
  BEI_10_INDICATORS,
  getBandByScore100,
} from '../modules/beiCompetencyFramework';
import { getPPPEngine } from '../agents/ppp/PPPEngine';

// ============================================================
// Readiness levels (from CompetencyEvidenceAgent)
// ============================================================

export const ReadinessLevel = {
  INSUFFICIENT: 'insufficient',
  DEVELOPING: 'developing',
  COMPETENT: 'competent',
  PROFICIENT: 'proficient',
};

export class EvaluationSkill extends SkillBase {
  get name() {
    return 'evaluation';
  }

  /**
   * Route to sub-capability based on input.metadata.action.
   *
   * @param {import('./SkillBase').SkillInput} input
   * @returns {Promise<import('./SkillBase').SkillOutput>}
   */
  async execute(input) {
    const action = input?.metadata?.action || 'evaluateTurn';
    switch (action) {
      case 'evaluateTurn':
        return this._evaluateTurn(input);
      case 'generateSessionFeedback':
        return this._generateSessionFeedback(input);
      case 'updateEvidence':
        return this._updateEvidence(input);
      case 'generateReport':
        return this._generateReport(input);
      default:
        return this._evaluateTurn(input);
    }
  }

  // ============================================================
  // evaluateTurn — per-turn behavior scoring
  // ============================================================

  async _evaluateTurn(input) {
    const conversationHistory = input.conversationHistory || [];
    const turnIndex = input.metadata?.turnIndex ?? 0;
    const activeScenario = input.metadata?.scenario || null;
    const userProfile = input.userProfile || null;

    // LLM unavailable → neutral evaluation
    if (!this.isLLMAvailable) {
      return {
        content: null,
        sideEffects: [],
        metadata: {
          ...this._neutralEvaluation(turnIndex),
          _fallback: true,
        },
      };
    }

    const systemPrompt = this._buildEvalPrompt(activeScenario, userProfile);

    const recentMessages = conversationHistory.slice(-4).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const parsed = await this.callLLMForJSON(systemPrompt, recentMessages, {
      maxTokens: 150,
    });

    if (!parsed) {
      return {
        content: null,
        sideEffects: [],
        metadata: {
          ...this._neutralEvaluation(turnIndex),
          _fallback: true,
        },
      };
    }

    const scores =
      parsed.scores && typeof parsed.scores === 'object'
        ? {
            communication: this._clampScore(parsed.scores.communication),
            empathy: this._clampScore(parsed.scores.empathy),
            problemSolving: this._clampScore(parsed.scores.problemSolving),
            leadership: this._clampScore(parsed.scores.leadership),
          }
        : { communication: 7, empathy: 7, problemSolving: 7, leadership: 7 };

    const capabilityIds = activeScenario?.capabilities || [];
    const mappedIndicators = capabilityIds
      .map((capId) => ({ capabilityId: capId, indicatorId: CAPABILITY_INDICATOR_MAPPING[capId] || null }))
      .filter((m) => m.indicatorId);

    const bloomLevel = this._estimateBloomLevel(scores, parsed.flags);
    const flags = Array.isArray(parsed.flags) ? parsed.flags.slice(0, 5) : [];
    const averageScore = Math.round(
      (scores.communication + scores.empathy + scores.problemSolving + scores.leadership) / 4
    );

    // PPP observation sideEffect (fire-and-forget)
    const userId = input.userProfile?.id || input.userProfile?.userId || null;
    const pppSideEffects = this._buildPPPObservation({
      userId,
      sessionId: input.metadata?.sessionId || null,
      scores,
      flags,
      averageScore,
      bloomLevel,
      capabilityMapping: mappedIndicators,
    });

    return {
      content: null,
      sideEffects: pppSideEffects,
      metadata: {
        turnIndex,
        scores,
        flags,
        suggestion: typeof parsed.suggestion === 'string' ? parsed.suggestion : null,
        capabilityMapping: mappedIndicators,
        bloomLevel,
        averageScore,
      },
    };
  }

  // ============================================================
  // generateSessionFeedback — end-of-session comprehensive feedback
  // ============================================================

  async _generateSessionFeedback(input) {
    const conversationHistory = input.conversationHistory || [];
    const activeScenario = input.metadata?.scenario || null;
    const userProfile = input.userProfile || null;
    const evaluationHistory = input.metadata?.evaluationHistory || [];

    const fallback = this._fallbackFeedback();

    if (!this.isLLMAvailable) {
      return {
        content: fallback.overall,
        sideEffects: [],
        metadata: { feedback: fallback, _fallback: true },
      };
    }

    const systemPrompt = this._buildFeedbackPrompt(activeScenario, userProfile, evaluationHistory);

    const contextMessages = conversationHistory.slice(-16).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const parsed = await this.callLLMForJSON(systemPrompt, contextMessages, {
      maxTokens: 600,
    });

    if (!parsed) {
      return {
        content: fallback.overall,
        sideEffects: [],
        metadata: { feedback: fallback, _fallback: true },
      };
    }

    const feedback = {
      overall: parsed.overall || fallback.overall,
      strengths:
        Array.isArray(parsed.strengths) && parsed.strengths.length
          ? parsed.strengths.slice(0, 4)
          : fallback.strengths,
      improvements:
        Array.isArray(parsed.improvements) && parsed.improvements.length
          ? parsed.improvements.slice(0, 4)
          : fallback.improvements,
      scores:
        parsed.scores && typeof parsed.scores === 'object'
          ? {
              communication: parsed.scores.communication || fallback.scores.communication,
              empathy: parsed.scores.empathy || fallback.scores.empathy,
              problemSolving: parsed.scores.problemSolving || fallback.scores.problemSolving,
              leadership: parsed.scores.leadership || fallback.scores.leadership,
            }
          : fallback.scores,
      next_actions:
        Array.isArray(parsed.next_actions) && parsed.next_actions.length
          ? parsed.next_actions.slice(0, 5)
          : fallback.next_actions,
    };

    return {
      content: feedback.overall,
      sideEffects: [],
      metadata: { feedback },
    };
  }

  // ============================================================
  // updateEvidence — accumulate capability evidence (pure rules)
  // ============================================================

  _updateEvidence(input) {
    const evidenceItems = input.metadata?.evidenceItems || [];
    const existing = input.metadata?.competencyEvidence || {};

    // Deep copy existing data
    const updated = {};
    Object.keys(existing).forEach((capId) => {
      updated[capId] = {
        ...existing[capId],
        evidenceItems: [...(existing[capId].evidenceItems || [])],
      };
    });

    // Add new evidence
    for (const item of evidenceItems) {
      const { capabilityId, type, description, score, sessionId } = item;
      if (!capabilityId) continue;

      if (!updated[capabilityId]) {
        updated[capabilityId] = {
          capabilityId,
          evidenceItems: [],
          readinessLevel: ReadinessLevel.INSUFFICIENT,
          readinessScore: 0,
          trend: 'stable',
          lastUpdated: new Date().toISOString(),
        };
      }

      updated[capabilityId].evidenceItems.push({
        type: type || 'scenario',
        date: new Date().toISOString(),
        description: description || '',
        score: score !== undefined && score !== null ? score : null,
        sessionId: sessionId || '',
      });

      // Keep most recent 20 evidence items
      if (updated[capabilityId].evidenceItems.length > 20) {
        updated[capabilityId].evidenceItems = updated[capabilityId].evidenceItems.slice(-20);
      }

      // Recalculate readiness
      const readiness = this._calculateReadiness(updated[capabilityId]);
      updated[capabilityId].readinessLevel = readiness.level;
      updated[capabilityId].readinessScore = readiness.score;
      updated[capabilityId].trend = readiness.trend;
      updated[capabilityId].lastUpdated = new Date().toISOString();
    }

    return {
      content: null,
      sideEffects: [],
      metadata: {
        updatedEvidence: updated,
        itemsAdded: evidenceItems.length,
      },
    };
  }

  // ============================================================
  // generateReport — capability evidence report
  // ============================================================

  async _generateReport(input) {
    const capabilityIds = input.metadata?.capabilityIds;
    const competencyEvidence = input.metadata?.competencyEvidence || {};
    const userProfile = input.userProfile || null;

    const targetIds =
      capabilityIds?.length > 0
        ? capabilityIds
        : Object.keys(CAPABILITY_INDICATOR_MAPPING);

    const capabilityReports = targetIds.map((capId) => {
      const evidence = competencyEvidence[capId];
      const indicatorId = CAPABILITY_INDICATOR_MAPPING[capId];
      const indicator = indicatorId ? BEI_10_INDICATORS[indicatorId] : null;

      if (!evidence || evidence.evidenceItems.length === 0) {
        return {
          capabilityId: capId,
          indicatorName: indicator?.name || capId,
          readinessLevel: ReadinessLevel.INSUFFICIENT,
          readinessScore: 0,
          trend: 'stable',
          evidenceCount: 0,
          evidenceSummary: '暂无行为证据，建议通过场景训练积累。',
          bandLabel: '待评估',
        };
      }

      const band = getBandByScore100(evidence.readinessScore);

      return {
        capabilityId: capId,
        indicatorName: indicator?.name || capId,
        readinessLevel: evidence.readinessLevel,
        readinessScore: evidence.readinessScore,
        trend: evidence.trend,
        evidenceCount: evidence.evidenceItems.length,
        recentEvidence: evidence.evidenceItems.slice(-3).map((item) => ({
          type: item.type,
          date: item.date,
          description: item.description?.slice(0, 100) || '',
          score: item.score,
        })),
        bandLabel: band ? `${band.label}（${band.min100}-${band.max100}分）` : '待评估',
      };
    });

    // LLM-enhanced summary if available
    if (this.isLLMAvailable && capabilityReports.some((r) => r.evidenceCount > 0)) {
      const enhanced = await this._llmGenerateReportSummary(capabilityReports, userProfile);
      if (enhanced) {
        const report = {
          capabilities: capabilityReports,
          overallSummary: enhanced.overallSummary || '能力佐证报告已生成。',
          recommendations: Array.isArray(enhanced.recommendations)
            ? enhanced.recommendations.slice(0, 5)
            : [],
          generatedAt: new Date().toISOString(),
        };
        return {
          content: report.overallSummary,
          sideEffects: [],
          metadata: { report, enhanced: true },
        };
      }
    }

    // Rule-based fallback report
    const hasEvidence = capabilityReports.filter((r) => r.evidenceCount > 0);
    const proficient = capabilityReports.filter((r) => r.readinessLevel === ReadinessLevel.PROFICIENT);
    const developing = capabilityReports.filter((r) => r.readinessLevel === ReadinessLevel.DEVELOPING);
    const insufficient = capabilityReports.filter((r) => r.readinessLevel === ReadinessLevel.INSUFFICIENT);

    const overallSummary = [
      `共评估 ${targetIds.length} 项能力，其中 ${hasEvidence.length} 项有行为证据。`,
      proficient.length > 0 ? `${proficient.length} 项达到熟练水平。` : '',
      developing.length > 0 ? `${developing.length} 项处于发展中。` : '',
      insufficient.length > 0 ? `${insufficient.length} 项证据不足，需通过训练积累。` : '',
    ]
      .filter(Boolean)
      .join('');

    const recommendations = [];
    if (insufficient.length > 0) {
      recommendations.push(
        `优先完成以下能力的场景训练：${insufficient
          .slice(0, 3)
          .map((r) => r.indicatorName)
          .join('、')}`
      );
    }
    if (developing.length > 0) {
      recommendations.push(
        `继续加强以下能力的实践：${developing
          .slice(0, 3)
          .map((r) => r.indicatorName)
          .join('、')}`
      );
    }
    recommendations.push('定期通过复盘补充实践证据');

    const report = {
      capabilities: capabilityReports,
      overallSummary,
      recommendations,
      generatedAt: new Date().toISOString(),
    };

    return {
      content: overallSummary,
      sideEffects: [],
      metadata: { report, enhanced: false },
    };
  }

  // ============================================================
  // Evaluation prompt builders
  // ============================================================

  _buildEvalPrompt(scenario, userProfile) {
    return [
      '你是管理行为评估专家。分析管理者在场景训练中的最新一轮回复，评估其管理能力表现。',
      '',
      '【场景信息】',
      `场景：${scenario?.title || ''}`,
      `角色：${scenario?.role || ''}`,
      `训练目标：${(scenario?.personalizedObjectives || scenario?.objectives || []).join('；')}`,
      '',
      '【用户背景】',
      `岗位：${userProfile?.roleLabel || '管理者'}`,
      '',
      '【评估维度（1-10分）】',
      '- communication: 沟通能力（表达清晰度、倾听、信息传递有效性）',
      '- empathy: 共情能力（理解对方感受、情绪管理、建立信任）',
      '- problemSolving: 问题解决（分析深度、方案质量、逻辑性）',
      '- leadership: 领导力（引导能力、决策力、方向感）',
      '',
      '【标记（flags）可选值】',
      'good_listening, good_empathy, good_structure, good_questioning,',
      'missed_empathy, too_aggressive, vague_action, missed_root_cause, no_follow_up',
      '',
      '【输出格式】',
      '仅输出JSON，不要其他文字：',
      '{"scores":{"communication":7,"empathy":7,"problemSolving":7,"leadership":7},"flags":["flag1"],"suggestion":"一句简短建议或null"}',
    ].join('\n');
  }

  _buildFeedbackPrompt(scenario, userProfile, evaluationHistory) {
    const parts = [
      '你是一位专业的管理训练评估教练，请对以下管理场景训练对话进行全面评估。',
      '',
      '【场景信息】',
      `场景标题：${scenario?.title || ''}`,
      `角色：${scenario?.role || '未知'}`,
      `场景背景：${scenario?.description || ''}`,
      `个性化背景：${scenario?.personalizedBackground || ''}`,
      `训练目标：${(scenario?.personalizedObjectives || []).join('；')}`,
      '',
      '【用户背景】',
      `岗位：${userProfile?.roleLabel || '管理者'}`,
      `主要挑战：${(userProfile?.currentChallenges || []).join('；') || '未提供'}`,
    ];

    if (evaluationHistory && evaluationHistory.length > 0) {
      parts.push('');
      parts.push('【逐轮评估参考（由AI评估系统自动生成）】');
      evaluationHistory.forEach((eval_, i) => {
        const s = eval_.scores || {};
        const flagsStr = (eval_.flags || []).join(', ') || '无';
        const suggestion = eval_.suggestion || '无';
        parts.push(
          `第${i + 1}轮: 沟通${s.communication || '?'} 共情${s.empathy || '?'} ` +
            `解决${s.problemSolving || '?'} 领导${s.leadership || '?'} | ` +
            `标记: ${flagsStr} | 建议: ${suggestion}`
        );
      });
      parts.push('请参考以上逐轮评估数据，结合对话内容给出更精准的综合评估。');
    }

    parts.push(
      '',
      '【评估任务】',
      '请分析对话记录，输出以下评估内容（用JSON格式）：',
      '1. overall: 总体评价（2-3句话，客观评估管理者的整体表现）',
      '2. strengths: 优点（3-4条具体的优点，要有具体例子）',
      '3. improvements: 弱点或错失的机会（3-4条具体的改进点）',
      '4. scores: 评分（对象格式，包含以下维度的1-10分评分）:',
      '   - communication: 沟通能力（是否表达清晰、倾听有效）',
      '   - empathy: 共情能力（是否理解对方感受、建立信任）',
      '   - problemSolving: 问题解决能力（是否抓住核心问题、提供有效方案）',
      '   - leadership: 领导力（是否展现管理者思维、引导而非控制）',
      '5. next_actions: 具体改进建议（3-5条可执行的行动建议）',
      '',
      '【输出格式】',
      '仅输出JSON，不要有其他文字：',
      '{"overall":"","strengths":["","",""],"improvements":["","",""],"scores":{"communication":8,"empathy":7,"problemSolving":7,"leadership":8},"next_actions":["","","",""]}'
    );

    return parts.join('\n');
  }

  async _llmGenerateReportSummary(capabilityReports, userProfile) {
    const capSummary = capabilityReports
      .filter((r) => r.evidenceCount > 0)
      .map((r) => {
        const trendLabel =
          r.trend === 'improving' ? '↑提升中' : r.trend === 'declining' ? '↓下降' : '→稳定';
        return `${r.indicatorName}(${r.capabilityId}): 就绪度${r.readinessScore}分, ${r.bandLabel}, ${trendLabel}, ${r.evidenceCount}条证据`;
      })
      .join('\n');

    const systemPrompt = [
      '你是管理能力发展顾问。根据以下能力佐证数据，生成叙述性总结报告。',
      '',
      `【用户岗位】${userProfile?.roleLabel || '管理者'}`,
      '',
      '【能力佐证数据】',
      capSummary,
      '',
      '请输出JSON：',
      '{"overallSummary":"总体评估（3-4句话，包含优势和发展方向）",',
      '"recommendations":["具体建议1","具体建议2","具体建议3"]}',
      '',
      '要求：',
      '1. 总结要基于数据，引用具体能力名称和分数',
      '2. 建议要具体可操作，关联到场景训练或实践行动',
      '3. 语气专业、建设性',
      '',
      '仅输出JSON，不要有其他文字。',
    ].join('\n');

    return this.callLLMForJSON(systemPrompt, [], { maxTokens: 500 });
  }

  // ============================================================
  // Utility methods
  // ============================================================

  _clampScore(score) {
    const n = Number(score);
    if (isNaN(n)) return 7;
    return Math.max(1, Math.min(10, Math.round(n)));
  }

  _estimateBloomLevel(scores, flags) {
    const avg =
      (scores.communication + scores.empathy + scores.problemSolving + scores.leadership) / 4;
    const goodFlags = (flags || []).filter((f) => f.startsWith('good_')).length;

    if (avg >= 9 && goodFlags >= 2) return 6; // Create
    if (avg >= 8 && goodFlags >= 1) return 5; // Evaluate
    if (avg >= 7) return 4; // Analyze
    if (avg >= 5) return 3; // Apply
    if (avg >= 3) return 2; // Understand
    return 1; // Remember
  }

  _neutralEvaluation(turnIndex) {
    return {
      turnIndex,
      scores: { communication: 7, empathy: 7, problemSolving: 7, leadership: 7 },
      flags: [],
      suggestion: null,
    };
  }

  _fallbackFeedback() {
    return {
      overall: '你完成了一轮完整对练，能持续推进对话并形成初步收口。',
      strengths: ['能够围绕业务目标展开对话', '能够提出行动方向'],
      improvements: ['行为细节还不够量化', '收口时需要更明确责任人和时限'],
      scores: { communication: 7, empathy: 7, problemSolving: 7, leadership: 7 },
      next_actions: [
        '下次先说目标与验收指标',
        '每轮至少追问一次根因',
        '结尾明确责任人、时间点、复盘节奏',
      ],
    };
  }

  /**
   * Calculate readiness from accumulated evidence items.
   */
  _calculateReadiness(capEvidence) {
    const items = capEvidence.evidenceItems || [];

    if (items.length === 0) {
      return { level: ReadinessLevel.INSUFFICIENT, score: 0, trend: 'stable' };
    }

    const scoredItems = items.filter((item) => item.score !== null && item.score !== undefined);
    const avgScore =
      scoredItems.length > 0
        ? scoredItems.reduce((sum, item) => sum + item.score, 0) / scoredItems.length
        : 0;

    const evidenceBonus = Math.min(items.length * 5, 25);

    const types = new Set(items.map((item) => item.type));
    const diversityBonus = types.size >= 3 ? 10 : types.size >= 2 ? 5 : 0;

    let readinessScore = Math.round(avgScore * 0.65 + evidenceBonus + diversityBonus);
    readinessScore = Math.max(0, Math.min(100, readinessScore));

    let level;
    if (readinessScore >= 80) {
      level = ReadinessLevel.PROFICIENT;
    } else if (readinessScore >= 60) {
      level = ReadinessLevel.COMPETENT;
    } else if (readinessScore >= 30) {
      level = ReadinessLevel.DEVELOPING;
    } else {
      level = ReadinessLevel.INSUFFICIENT;
    }

    const trend = this._calculateTrend(scoredItems);
    return { level, score: readinessScore, trend };
  }

  _calculateTrend(scoredItems) {
    if (scoredItems.length < 4) return 'stable';

    const recent = scoredItems.slice(-3);
    const earlier = scoredItems.slice(0, -3);

    const recentAvg = recent.reduce((s, i) => s + i.score, 0) / recent.length;
    const earlierAvg = earlier.reduce((s, i) => s + i.score, 0) / earlier.length;

    const diff = recentAvg - earlierAvg;
    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  // ============================================================
  // PPP Integration (fire-and-forget observation)
  // ============================================================

  /**
   * Build PPP observation sideEffects from evaluation results.
   * @private
   */
  _buildPPPObservation({ userId, sessionId, scores, flags, averageScore, bloomLevel, capabilityMapping }) {
    if (!userId) return [];

    // Map evaluation scores to detected signals
    const detectedSignals = [];
    if (averageScore >= 8) detectedSignals.push('①'); // strong competency signal
    if (flags.some(f => f.startsWith('good_'))) detectedSignals.push('①');
    if (flags.includes('missed_root_cause') || flags.includes('missed_empathy')) {
      detectedSignals.push('⑤'); // know-do gap
    }

    const confidence = Math.min(averageScore / 10, 1);

    return [{
      type: 'ppp_observe',
      execute: async () => {
        try {
          const ppp = getPPPEngine();
          await ppp.observeSignal({
            userId,
            sessionId,
            type: 'assessment_response',
            content: `evaluation: avg=${averageScore}, bloom=${bloomLevel}`,
            detectedSignals,
            confidence,
            source: 'assessment',
            reportedBy: 'LECTURER',
            metadata: {
              scores,
              flags,
              bloomLevel,
              capabilityMapping,
            },
          });
        } catch (err) {
          // Fire-and-forget: PPP failure must not affect evaluation
          console.warn('[EvaluationSkill] PPP observation failed:', err.message);
        }
      },
    }];
  }
}
