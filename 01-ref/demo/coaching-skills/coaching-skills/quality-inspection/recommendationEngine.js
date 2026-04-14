/**
 * 教研建议生成引擎
 *
 * Spec 来源：spec-教研引擎.md §2.3
 *
 * 核心约束：输出自然语言建议，不做自动参数映射。
 * TD/LD 阅读建议后自行决定是否执行。
 *
 * 建议类型：
 *   - strategy_effectiveness — 策略效果评估
 *   - error_pattern — 错误模式识别
 *   - content_gap — 内容缺口发现
 *   - persona_calibration — 人格风格校准
 *
 * 优先级：
 *   - P0（安全/合规）：角色漂移、事实错误、安全红线
 *   - P1（体验类）：策略失效、内容缺口、人格校准
 */

function generateId() {
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ============================================================
// RecommendationEngine
// ============================================================

export class RecommendationEngine {
  constructor() {
    // 未来可注入配置（如租户级阈值）
  }

  /**
   * 从质检结果 + 信号挖掘结果生成建议
   *
   * @param {Object} inspectionResult - QualityInspectionEngine.inspect() 输出
   * @param {Object} miningResult - SignalMiningEngine.mineSession() 输出
   * @param {Object} context - { tenantId, userId, sessionId }
   * @returns {Recommendation[]}
   */
  generateRecommendations(inspectionResult, miningResult, context = {}) {
    const recommendations = [];

    // 从质检结果生成建议
    if (inspectionResult) {
      recommendations.push(
        ...this._fromInspection(inspectionResult, context)
      );
    }

    // 从信号挖掘结果生成建议
    if (miningResult) {
      recommendations.push(
        ...this._fromMining(miningResult, context)
      );
    }

    // 去重（同一 type + 相似 finding 合并）
    return this._dedup(recommendations);
  }

  /**
   * 建议分级
   *
   * @param {Recommendation[]} recommendations
   * @returns {{ p0: Recommendation[], p1: Recommendation[] }}
   */
  prioritize(recommendations) {
    const p0 = [];
    const p1 = [];

    for (const rec of recommendations) {
      if (rec.priority === 'P0') {
        p0.push(rec);
      } else {
        p1.push(rec);
      }
    }

    // P0 内部按置信度降序
    p0.sort((a, b) => (b.evidence?.confidence || 0) - (a.evidence?.confidence || 0));
    p1.sort((a, b) => (b.evidence?.confidence || 0) - (a.evidence?.confidence || 0));

    return { p0, p1 };
  }

  // ─── 从质检结果生成建议 ──────────────────────────────────────────────

  /** @private */
  _fromInspection(inspectionResult, context) {
    const recs = [];
    const layer1 = inspectionResult.layer1;
    const layer2 = inspectionResult.layer2;

    // Layer 1 问题 → 建议
    if (layer1?.issues) {
      for (const issue of layer1.issues) {
        recs.push(this._issueToRecommendation(issue, context));
      }
    }

    // Layer 2 违规 → 建议
    if (layer2?.violations) {
      for (const violation of layer2.violations) {
        recs.push(this._violationToRecommendation(violation, context));
      }
    }

    return recs;
  }

  /** Layer 1 issue → Recommendation @private */
  _issueToRecommendation(issue, context) {
    const typeMap = {
      role_drift: { type: 'persona_calibration', priority: 'P0' },
      concept_contradiction: { type: 'error_pattern', priority: 'P0' },
      talk_ratio_imbalance: { type: 'persona_calibration', priority: 'P1' },
      stalemate: { type: 'strategy_effectiveness', priority: 'P1' },
      // challenge_unhandled is P1 (pedagogical concern), not P0 (safety/compliance), even when severity is high.
      // P0 is reserved for role drift, factual errors, and safety red lines.
      challenge_unhandled: { type: 'persona_calibration', priority: 'P1' },
    };

    const mapped = typeMap[issue.dimension] || { type: 'error_pattern', priority: 'P1' };

    return {
      id: generateId(),
      type: mapped.type,
      scope: context.tenantId ? 'tenant' : 'platform',
      finding: issue.rule + '：' + issue.detail,
      evidence: {
        sampleSize: 1,
        confidence: issue.severity === 'high' ? 0.9 : 0.6,
        timeRange: null,
      },
      recommendation: this._generateRecommendationText(issue.dimension, issue),
      relatedStrategyCodes: [],
      status: 'draft',
      priority: issue.severity === 'high' && mapped.priority === 'P0' ? 'P0' : mapped.priority,
    };
  }

  /** Layer 2 violation → Recommendation @private */
  _violationToRecommendation(violation, context) {
    const typeMap = {
      strategy_dreyfus_mismatch: { type: 'strategy_effectiveness', priority: 'P0' },
      error_correction_missing: { type: 'error_pattern', priority: 'P0' },
      strategy_combination_missing: { type: 'strategy_effectiveness', priority: 'P1' },
      strategy_effect_null: { type: 'strategy_effectiveness', priority: 'P1' },
    };

    const mapped = typeMap[violation.pedagogicalRule] || { type: 'strategy_effectiveness', priority: 'P1' };

    return {
      id: generateId(),
      type: mapped.type,
      scope: context.tenantId ? 'tenant' : 'platform',
      finding: violation.detail,
      evidence: {
        sampleSize: 1,
        confidence: mapped.priority === 'P0' ? 0.85 : 0.6,
        timeRange: null,
      },
      recommendation: violation.remediation || '建议教研团队审查并调整教学策略配置',
      relatedStrategyCodes: violation.relatedStrategyCode ? [violation.relatedStrategyCode] : [],
      status: 'draft',
      priority: mapped.priority,
    };
  }

  /** 根据维度生成自然语言建议 @private */
  _generateRecommendationText(dimension, issue) {
    const textMap = {
      role_drift: '建议检查 AI Persona 的角色边界配置，确认是否存在越界倾向。如持续出现，需校准 Persona 的系统提示词。',
      concept_contradiction: '建议排查知识库中相关概念的定义一致性。矛盾表述可能来自知识库多源冲突或 Persona 上下文混乱。',
      talk_ratio_imbalance: '建议调整 AI 回复的长度控制参数，或在教学策略中增加更多互动式策略（如苏格拉底追问、反转课堂）以提升学员参与度。',
      stalemate: '建议复查会话中使用的教学策略是否匹配学员水平。僵局可能因策略过难或过简导致。考虑切换策略类别或降低认知负荷。',
      challenge_unhandled: '建议优化 AI 对学员挑战的应答模式。挑战是宝贵的教学信号，应先确认再引导，而非忽略或直接反驳。',
    };

    return textMap[dimension] || '建议教研团队进一步审查此问题并制定改进方案。';
  }

  // ─── 从信号挖掘结果生成建议 ──────────────────────────────────────────

  /** @private */
  _fromMining(miningResult, context) {
    const recs = [];
    const signals = miningResult.signals || {};
    const crossSession = miningResult.crossSession;

    // 未处理的挑战 → persona_calibration
    const unhandledChallenges = (signals.challenge || []).filter(c => !c.handled);
    if (unhandledChallenges.length > 0) {
      recs.push({
        id: generateId(),
        type: 'persona_calibration',
        scope: context.tenantId ? 'tenant' : 'platform',
        finding: `检测到 ${unhandledChallenges.length} 个未处理的学员挑战信号`,
        evidence: {
          sampleSize: unhandledChallenges.length,
          confidence: 0.7,
          timeRange: null,
        },
        recommendation: '学员挑战未被 AI 有效回应。建议优化 Persona 的挑战应答策略，确保先确认学员观点再引导讨论。',
        relatedStrategyCodes: [],
        status: 'draft',
        priority: 'P1',
      });
    }

    // 未解决的困惑 → content_gap
    const unresolvedConfusions = (signals.confusion || []).filter(c => !c.resolved);
    if (unresolvedConfusions.length > 0) {
      const concepts = unresolvedConfusions.map(c => c.repeatedQueryOn).join('、');
      recs.push({
        id: generateId(),
        type: 'content_gap',
        scope: context.tenantId ? 'tenant' : 'platform',
        finding: `学员在以下概念上反复困惑但未解决：${concepts}`,
        evidence: {
          sampleSize: unresolvedConfusions.length,
          confidence: 0.75,
          timeRange: null,
        },
        recommendation: `建议检查知识库中关于「${concepts}」的内容覆盖度，可能存在解释不充分或缺失的情况。`,
        relatedStrategyCodes: ['CG-08'], // 概念转变策略
        status: 'draft',
        priority: 'P1',
      });
    }

    // 严重脱离 → strategy_effectiveness
    const severeDisengagement = (signals.disengagement || [])
      .filter(d => d.engagementScore < 0.3);
    if (severeDisengagement.length >= 3) {
      recs.push({
        id: generateId(),
        type: 'strategy_effectiveness',
        scope: context.tenantId ? 'tenant' : 'platform',
        finding: `学员连续 ${severeDisengagement.length} 轮参与度低于 0.3，存在严重脱离风险`,
        evidence: {
          sampleSize: severeDisengagement.length,
          confidence: 0.8,
          timeRange: null,
        },
        recommendation: '建议审查当前教学策略是否过于单一或难度不匹配。考虑引入互动式策略（IP 类）或降低认知负荷（CG-07）。',
        relatedStrategyCodes: ['CG-07', 'IP-01'],
        status: 'draft',
        priority: 'P1',
      });
    }

    // 跨会话信号
    if (crossSession) {
      recs.push(...this._fromCrossSession(crossSession, context));
    }

    return recs;
  }

  /** 跨会话关联 → 建议 @private */
  _fromCrossSession(crossSession, context) {
    const recs = [];

    // 持续分歧 → error_pattern (P0)
    for (const disagreement of (crossSession.persistentDisagreements || [])) {
      recs.push({
        id: generateId(),
        type: 'error_pattern',
        scope: context.tenantId ? 'tenant' : 'platform',
        finding: `学员在「${disagreement.concept}」上跨会话持续质疑（涉及 ${disagreement.sessions.length} 个会话）`,
        evidence: {
          sampleSize: disagreement.sessions.length,
          confidence: 0.85,
          timeRange: null,
        },
        recommendation: disagreement.recommendation,
        relatedStrategyCodes: ['CG-08'],
        status: 'draft',
        priority: 'P0',
      });
    }

    // 教学设计缺陷 → content_gap (P0)
    for (const flaw of (crossSession.teachingDesignFlaws || [])) {
      recs.push({
        id: generateId(),
        type: 'content_gap',
        scope: context.tenantId ? 'tenant' : 'platform',
        finding: `学员在「${flaw.concept}」上跨会话持续困惑（涉及 ${flaw.sessions.length} 个会话），可能存在教学设计缺陷`,
        evidence: {
          sampleSize: flaw.sessions.length,
          confidence: 0.9,
          timeRange: null,
        },
        recommendation: flaw.recommendation,
        relatedStrategyCodes: ['CG-08'],
        status: 'draft',
        priority: 'P0',
      });
    }

    // 跨会话参与度风险 → strategy_effectiveness
    if (crossSession.engagementRisk) {
      recs.push({
        id: generateId(),
        type: 'strategy_effectiveness',
        scope: context.tenantId ? 'tenant' : 'platform',
        finding: '学员跨会话参与度呈持续下降趋势，存在流失风险',
        evidence: {
          sampleSize: 0,
          confidence: 0.7,
          timeRange: null,
        },
        recommendation: '建议通知 Fiona（发展顾问）关注该学员，评估是否需要调整发展计划或切换教学方式。',
        relatedStrategyCodes: [],
        status: 'draft',
        priority: 'P0',
      });
    }

    return recs;
  }

  // ─── 去重 ────────────────────────────────────────────────────────────

  /** 简单去重：同类型 + 相似 finding @private */
  _dedup(recommendations) {
    const seen = new Map();
    const result = [];

    for (const rec of recommendations) {
      // 用 type + finding 前 20 字作为去重键
      const key = `${rec.type}:${(rec.finding || '').slice(0, 20)}`;
      if (seen.has(key)) {
        // 保留优先级更高的
        const existing = seen.get(key);
        if (rec.priority === 'P0' && existing.priority !== 'P0') {
          result[result.indexOf(existing)] = rec;
          seen.set(key, rec);
        }
        continue;
      }
      seen.set(key, rec);
      result.push(rec);
    }

    return result;
  }
}
