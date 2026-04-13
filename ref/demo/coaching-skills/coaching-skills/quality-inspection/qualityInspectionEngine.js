/**
 * Quality Inspection Engine — 三层质检协调器（教研引擎核心）
 *
 * 协调 Layer 1（规则扫描）和 Layer 2（教学法合规）的执行顺序：
 * - Layer 1 始终执行（毫秒级，零成本）
 * - Layer 2 仅在 Layer 1 flagged 或强制时执行
 * - Layer 3（LLM 深度审查）MVP 不实现，仅标记 shouldDeepReview
 *
 * 消费方：教研引擎定时任务 / 管理者手动触发
 * 输入：sessionTranscriptMeta
 * 输出：综合质检报告
 */

import { Layer1RuleScanner } from './layer1RuleScanner';
import { Layer2PedagogicalValidator } from './layer2PedagogicalValidator';

export class QualityInspectionEngine {
  /**
   * @param {Object} [options]
   * @param {Object} [options.rules] - Layer 1 规则覆盖
   * @param {boolean} [options.alwaysRunLayer2] - 是否无条件执行 Layer 2
   * @param {number} [options.deepReviewThreshold] - 综合分低于此阈值触发 Layer 3 标记
   */
  constructor(options = {}) {
    this.layer1 = new Layer1RuleScanner(options.rules);
    this.layer2 = new Layer2PedagogicalValidator();
    this.alwaysRunLayer2 = options.alwaysRunLayer2 || false;
    this.deepReviewThreshold = options.deepReviewThreshold ?? 0.5;
  }

  /**
   * 执行完整质检流程
   *
   * @param {Object} sessionMeta - createSessionTranscriptMeta 输出
   * @returns {Promise<{
   *   layer1: { status: string, issues: Array, score: number },
   *   layer2: { status: string, violations: Array } | null,
   *   overallScore: number,
   *   shouldDeepReview: boolean,
   *   inspectedAt: string
   * }>}
   */
  async inspect(sessionMeta) {
    // Layer 1: 规则扫描（始终执行）
    const layer1Result = this.layer1.scan(sessionMeta);

    // Layer 2: 仅在 Layer 1 flagged 或强制模式时执行
    let layer2Result = null;
    if (layer1Result.status === 'flagged' || this.alwaysRunLayer2) {
      layer2Result = await this.layer2.validate(sessionMeta, layer1Result.issues);
    }

    // 综合评分
    const overallScore = this._computeOverallScore(layer1Result, layer2Result);

    // Layer 3 标记：综合分低于阈值，或存在 high severity 问题
    const hasHighSeverity = layer1Result.issues.some(i => i.severity === 'high') ||
      (layer2Result?.violations || []).some(v =>
        v.pedagogicalRule === 'strategy_dreyfus_mismatch' ||
        v.pedagogicalRule === 'error_correction_missing'
      );

    const shouldDeepReview = overallScore < this.deepReviewThreshold || hasHighSeverity;

    return {
      layer1: layer1Result,
      layer2: layer2Result,
      overallScore,
      shouldDeepReview,
      inspectedAt: new Date().toISOString(),
    };
  }

  /**
   * 批量质检（供定时任务调用）
   *
   * @param {Array} sessionMetas - 待检会话元数据数组
   * @returns {Promise<Array>} 质检报告数组
   */
  async inspectBatch(sessionMetas) {
    const results = [];
    for (const meta of sessionMetas) {
      try {
        const report = await this.inspect(meta);
        results.push({
          sessionId: meta.sessionId,
          userId: meta.userId,
          report,
        });
      } catch (err) {
        results.push({
          sessionId: meta?.sessionId || null,
          userId: meta?.userId || null,
          report: null,
          error: err.message,
        });
      }
    }
    return results;
  }

  /**
   * 综合评分：Layer 1 score × Layer 2 惩罚
   * @private
   */
  _computeOverallScore(layer1Result, layer2Result) {
    let score = layer1Result.score;

    if (layer2Result && layer2Result.violations.length > 0) {
      // 每个教学法违规扣 0.1
      const penalty = layer2Result.violations.length * 0.1;
      score = Math.max(0, score - penalty);
    }

    return Math.round(score * 100) / 100;
  }
}
