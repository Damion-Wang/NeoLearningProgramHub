/**
 * Layer 1 Rule Scanner — 规则扫描（教研引擎质检第一层）
 *
 * 基于可配置规则的快速扫描，不依赖 LLM，毫秒级完成。
 * 检测 5 个维度：
 *   1. 角色漂移 (role_drift) — AI 越界决策/承诺
 *   2. 概念矛盾 (concept_contradiction) — 同一概念前后矛盾
 *   3. 话语比失衡 (talk_ratio_imbalance) — AI 话太多
 *   4. 僵局检测 (stalemate) — 连续多轮无进展
 *   5. 挑战信号未处理 (challenge_unhandled) — 学员挑战被忽略
 *
 * 消费方：qualityInspectionEngine
 * 数据源：sessionTranscriptMeta（含 turns 逐轮摘要）
 */

import { computeTurnStats } from '../../types/sessionTranscript';

// ============================================================
// 默认规则配置（可通过构造函数覆盖）
// ============================================================

export const DEFAULT_RULES = {
  // 角色漂移检测
  role_drift: {
    enabled: true,
    severity: 'high',
    // AI 越界模式：自行决策、安排、处理
    patterns: [
      /我帮你决定/,
      /我会安排/,
      /我来处理/,
      /我替你/,
      /我直接帮你/,
      /我已经.*安排/,
      /我会.*代替你/,
      /交给我来/,
    ],
    // 白名单：元认知引导话术（老段常用）
    whitelist: [
      /你觉得/,
      /你怎么看/,
      /你会怎么/,
      /如果你来决定/,
      /你认为/,
      /帮你.*梳理/,
      /帮你.*分析/,
      /帮你.*思考/,
    ],
  },

  // 话语比阈值
  talk_ratio_imbalance: {
    enabled: true,
    severity: 'medium',
    aiRatioThreshold: 0.7, // AI 字符占比超过 70% 为失衡
    minTurns: 4, // 至少 4 轮才检测（避免开场白误报）
  },

  // 僵局检测
  stalemate: {
    enabled: true,
    severity: 'medium',
    consecutiveTurns: 5, // 连续 N 轮无新概念
    minUserMsgLength: 10, // 用户消息低于此字数视为低参与
  },

  // 挑战信号未处理
  challenge_unhandled: {
    enabled: true,
    severity: 'high',
    // 学员挑战关键词
    challengePatterns: [
      /我不同意/,
      /不对吧/,
      /你说的不对/,
      /我觉得不是/,
      /这个有问题/,
      /为什么不能/,
      /但是我认为/,
      /不一定吧/,
    ],
    // AI 应答应包含的确认模式
    acknowledgmentPatterns: [
      /你说得/,
      /你提到的/,
      /你的观点/,
      /你的看法/,
      /确实/,
      /理解你的/,
      /你的挑战/,
      /好问题/,
      /有道理/,
      /对.*思考/,
    ],
  },

  // 概念矛盾检测
  // MVP: disabled due to high false-positive rate with Chinese substring matching. Enable after domain stopword list is designed.
  concept_contradiction: {
    enabled: false,
    severity: 'high',
    // MVP：通过对立关键词对检测（后续可升级为语义分析）
    contradictionPairs: [
      ['应该', '不应该'],
      ['必须', '不必'],
      ['正确', '错误'],
      ['推荐', '不推荐'],
      ['有效', '无效'],
      ['重要', '不重要'],
    ],
  },
};

// ============================================================
// Layer 1 Rule Scanner
// ============================================================

export class Layer1RuleScanner {
  /**
   * @param {Object} [rules] - 规则配置（覆盖 DEFAULT_RULES 中对应项）
   */
  constructor(rules = {}) {
    this.rules = { ...DEFAULT_RULES, ...rules };
  }

  /**
   * 扫描会话元数据，返回质检结果
   *
   * @param {Object} sessionMeta - createSessionTranscriptMeta 输出
   * @param {Object} sessionMeta.turns - Must have `turns[i].index` as valid index into `conversationHistory`
   *   (produced by extractTurnSummaries which sets index = array position)
   * @returns {{ status: 'flagged'|'clean', issues: Array, score: number }}
   */
  scan(sessionMeta) {
    if (!sessionMeta) {
      return { status: 'clean', issues: [], score: 1 };
    }

    const issues = [];
    const turns = sessionMeta.turns || [];
    const conversationHistory = sessionMeta.conversationHistory || [];

    // 1. 角色漂移检测
    if (this.rules.role_drift?.enabled) {
      issues.push(...this._scanRoleDrift(turns, conversationHistory));
    }

    // 2. 概念矛盾检测
    if (this.rules.concept_contradiction?.enabled) {
      issues.push(...this._scanConceptContradiction(turns, conversationHistory));
    }

    // 3. 话语比失衡检测
    if (this.rules.talk_ratio_imbalance?.enabled) {
      issues.push(...this._scanTalkRatio(turns, sessionMeta));
    }

    // 4. 僵局检测
    if (this.rules.stalemate?.enabled) {
      issues.push(...this._scanStalemate(turns, conversationHistory));
    }

    // 5. 挑战信号未处理
    if (this.rules.challenge_unhandled?.enabled) {
      issues.push(...this._scanChallengeUnhandled(turns, conversationHistory));
    }

    // 计算综合分数：1.0（完美）→ 0（严重问题）
    const score = this._computeScore(issues);

    return {
      status: issues.length > 0 ? 'flagged' : 'clean',
      issues,
      score,
    };
  }

  // ─── 维度 1: 角色漂移 ─────────────────────────────────────────────────

  _scanRoleDrift(turns, conversationHistory) {
    const issues = [];
    const rule = this.rules.role_drift;
    const aiTurns = this._getAITurns(turns, conversationHistory);

    for (const { index, content } of aiTurns) {
      // 检查是否匹配越界模式
      let drifted = false;
      let matchedPattern = null;
      for (const pattern of rule.patterns) {
        if (pattern.test(content)) {
          drifted = true;
          matchedPattern = pattern.source;
          break;
        }
      }

      if (!drifted) continue;

      // 白名单排除：如果同一轮包含元认知引导，视为合理
      let whitelisted = false;
      for (const wl of rule.whitelist) {
        if (wl.test(content)) {
          whitelisted = true;
          break;
        }
      }

      if (!whitelisted) {
        issues.push({
          dimension: 'role_drift',
          rule: '角色漂移：AI 越界决策/承诺',
          severity: rule.severity,
          detail: `第 ${index + 1} 轮 AI 回复匹配越界模式: "${matchedPattern}"`,
          turnIndex: index,
        });
      }
    }

    return issues;
  }

  // ─── 维度 2: 概念矛盾 ─────────────────────────────────────────────────

  _scanConceptContradiction(turns, conversationHistory) {
    const issues = [];
    const rule = this.rules.concept_contradiction;
    const aiTurns = this._getAITurns(turns, conversationHistory);

    // 对每对矛盾关键词，检查是否在不同轮次中出现
    for (const [positive, negative] of rule.contradictionPairs) {
      const positiveTurns = [];
      const negativeTurns = [];

      for (const { index, content } of aiTurns) {
        // 需要同一概念上下文中出现矛盾，简化为：同段文本中相近位置
        if (content.includes(positive)) positiveTurns.push(index);
        if (content.includes(negative)) negativeTurns.push(index);
      }

      // 如果两种对立表述都出现且不在同一轮（同一轮可能是辩证讨论）
      if (positiveTurns.length > 0 && negativeTurns.length > 0) {
        const hasCrossContradiction = positiveTurns.some(
          pt => negativeTurns.some(nt => nt !== pt)
        );
        if (hasCrossContradiction) {
          issues.push({
            dimension: 'concept_contradiction',
            rule: `概念矛盾：关于"${positive}/${negative}"的表述不一致`,
            severity: rule.severity,
            detail: `"${positive}" 出现在轮次 [${positiveTurns.join(',')}]，"${negative}" 出现在轮次 [${negativeTurns.join(',')}]`,
            turnIndex: negativeTurns[negativeTurns.length - 1],
          });
        }
      }
    }

    return issues;
  }

  // ─── 维度 3: 话语比失衡 ─────────────────────────────────────────────────

  _scanTalkRatio(turns, sessionMeta) {
    const issues = [];
    const rule = this.rules.talk_ratio_imbalance;

    if ((turns.length || 0) < rule.minTurns) return issues;

    const stats = computeTurnStats(turns);
    if (stats.aiRatio > rule.aiRatioThreshold) {
      issues.push({
        dimension: 'talk_ratio_imbalance',
        rule: `话语比失衡：AI 占比 ${(stats.aiRatio * 100).toFixed(1)}%`,
        severity: rule.severity,
        detail: `AI ${stats.aiChars} 字 / 用户 ${stats.userChars} 字，阈值 ${rule.aiRatioThreshold * 100}%`,
        turnIndex: null,
      });
    }

    return issues;
  }

  // ─── 维度 4: 僵局检测 ─────────────────────────────────────────────────

  _scanStalemate(turns, conversationHistory) {
    const issues = [];
    const rule = this.rules.stalemate;

    if (turns.length < rule.consecutiveTurns * 2) return issues;

    // 检测连续轮次中用户消息长度趋势
    const userTurns = turns.filter(t => t.role === 'user');
    let consecutiveShort = 0;
    let stalemateStart = -1;

    for (let i = 0; i < userTurns.length; i++) {
      const content = conversationHistory?.[userTurns[i].index]?.content || '';
      if (content.length < rule.minUserMsgLength) {
        if (consecutiveShort === 0) stalemateStart = userTurns[i].index;
        consecutiveShort++;
      } else {
        consecutiveShort = 0;
        stalemateStart = -1;
      }

      if (consecutiveShort >= rule.consecutiveTurns) {
        issues.push({
          dimension: 'stalemate',
          rule: `僵局：连续 ${consecutiveShort} 轮用户低参与`,
          severity: rule.severity,
          detail: `从第 ${stalemateStart + 1} 轮开始，用户连续 ${consecutiveShort} 轮消息短于 ${rule.minUserMsgLength} 字`,
          turnIndex: stalemateStart,
        });
        break; // 只报一次
      }
    }

    return issues;
  }

  // ─── 维度 5: 挑战信号未处理 ─────────────────────────────────────────────

  _scanChallengeUnhandled(turns, conversationHistory) {
    const issues = [];
    const rule = this.rules.challenge_unhandled;

    for (let i = 0; i < turns.length; i++) {
      const turn = turns[i];
      if (turn.role !== 'user') continue;

      const userContent = conversationHistory?.[i]?.content || '';

      // 检查用户消息是否包含挑战关键词
      let hasChallenge = false;
      for (const pattern of rule.challengePatterns) {
        if (pattern.test(userContent)) {
          hasChallenge = true;
          break;
        }
      }

      if (!hasChallenge) continue;

      // 找下一轮 AI 回复
      const nextAiTurn = turns.find((t, idx) => idx > i && t.role === 'assistant');
      if (!nextAiTurn) continue;

      const aiContent = conversationHistory?.[nextAiTurn.index]?.content || '';

      // 检查 AI 是否确认了挑战
      let acknowledged = false;
      for (const ackPattern of rule.acknowledgmentPatterns) {
        if (ackPattern.test(aiContent)) {
          acknowledged = true;
          break;
        }
      }

      if (!acknowledged) {
        issues.push({
          dimension: 'challenge_unhandled',
          rule: '挑战信号未处理：学员挑战未被确认',
          severity: rule.severity,
          detail: `第 ${i + 1} 轮用户提出挑战，但第 ${nextAiTurn.index + 1} 轮 AI 回复未包含确认/回应`,
          turnIndex: nextAiTurn.index,
        });
      }
    }

    return issues;
  }

  // ─── 工具方法 ─────────────────────────────────────────────────────────

  /**
   * 从 turns + conversationHistory 提取 AI 轮次（含文本内容）
   */
  _getAITurns(turns, conversationHistory) {
    return turns
      .filter(t => t.role === 'assistant')
      .map(t => ({
        index: t.index,
        content: conversationHistory?.[t.index]?.content || '',
      }));
  }

  /**
   * 根据 issues 计算综合分数
   * 高严重度扣 0.2，中扣 0.1，低扣 0.05
   */
  _computeScore(issues) {
    const deductions = { high: 0.2, medium: 0.1, low: 0.05 };
    let score = 1.0;
    for (const issue of issues) {
      score -= deductions[issue.severity] || 0.05;
    }
    return Math.max(0, Math.round(score * 100) / 100);
  }
}
