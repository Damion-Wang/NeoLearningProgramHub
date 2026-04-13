/**
 * 信号挖掘引擎 — 从会话数据中提取教学信号
 *
 * Spec 来源：spec-教研引擎.md §2.2
 *
 * 四类信号：
 *   1. CHALLENGE ("我不认同") — 学员挑战内容/方法
 *   2. CONFUSION (反复提问同一点) — 学员对某概念困惑
 *   3. BREAKTHROUGH ("原来如此！") — 学员顿悟时刻
 *   4. DISENGAGEMENT (参与度持续下降) — 学员脱离
 *
 * 支持单会话挖掘和跨会话关联（最近 N 次会话上下文）
 */

// ============================================================
// 信号检测关键词与模式
// ============================================================

/** 挑战信号关键词 */
const CHALLENGE_PATTERNS = [
  /不同意/, /不对/, /有问题/, /质疑/,
  /不认同/, /你说的不对/, /我觉得不是/,
  /不一定/, /但是我认为/, /为什么不能/,
];

/** AI 应答确认模式（判断挑战是否被处理） */
const ACKNOWLEDGMENT_PATTERNS = [
  /你说得有道理/, /这个角度/, /确实/,
  /你的观点/, /理解你/, /好问题/,
  /有道理/, /你提到的/, /你的看法/,
];

/** 突破信号关键词 */
const BREAKTHROUGH_PATTERNS = [
  /原来/, /明白了/, /懂了/, /有道理/,
  /原来如此/, /恍然大悟/, /终于理解/,
  /这样的话/, /我理解了/, /对对对/,
];

// ============================================================
// SignalMiningEngine
// ============================================================

export class SignalMiningEngine {
  /**
   * @param {Object} sessionTranscriptService - SessionTranscriptService 实例
   * @param {Object} [pppEngine] - PPP 引擎实例（可选，用于掌握度查询）
   */
  constructor(sessionTranscriptService, pppEngine = null) {
    this._transcriptService = sessionTranscriptService;
    this._pppEngine = pppEngine;
  }

  /**
   * 单会话信号挖掘
   *
   * @param {Object} sessionMeta - createSessionTranscriptMeta() 输出
   * @returns {Promise<MiningResult>}
   */
  async mineSession(sessionMeta) {
    if (!sessionMeta) {
      return this._emptyResult();
    }

    const turns = sessionMeta.turns || [];
    const history = sessionMeta.conversationHistory || [];

    const challenges = this._detectChallenges(turns, history);
    const confusions = this._detectConfusion(turns, history, sessionMeta);
    const breakthroughs = this._detectBreakthroughs(turns, history, sessionMeta);
    const disengagement = this._detectDisengagement(turns, history);

    return {
      sessionId: sessionMeta.sessionId,
      userId: sessionMeta.userId,
      signals: {
        challenge: challenges,
        confusion: confusions,
        breakthrough: breakthroughs,
        disengagement: disengagement,
      },
      summary: {
        totalSignals: challenges.length + confusions.length + breakthroughs.length + disengagement.length,
        hasCritical: challenges.some(c => !c.handled) || disengagement.some(d => d.engagementScore < 0.3),
      },
      crossSession: null, // 单会话模式无跨会话数据
      minedAt: new Date().toISOString(),
    };
  }

  /**
   * 跨会话关联挖掘
   *
   * @param {Object} sessionMeta - 当前会话元数据
   * @param {number} [contextWindow=3] - 关联的历史会话数量
   * @returns {Promise<MiningResult>}
   */
  async mineWithContext(sessionMeta, contextWindow = 3) {
    // 先做单会话挖掘
    const currentResult = await this.mineSession(sessionMeta);

    if (!sessionMeta || !this._transcriptService) {
      return currentResult;
    }

    // 加载历史会话（排除当前会话）
    let priorSessions = [];
    try {
      const recent = await this._transcriptService.getRecentByUser(
        sessionMeta.userId,
        contextWindow + 1 // 多取一条，因为可能包含当前会话
      );
      priorSessions = recent.filter(s => s.sessionId !== sessionMeta.sessionId);
      priorSessions = priorSessions.slice(0, contextWindow);
    } catch {
      // 无历史数据，跳过跨会话分析
    }

    if (priorSessions.length === 0) {
      return currentResult;
    }

    // 跨会话关联分析
    const crossSession = this._correlateAcrossSessions(
      currentResult.signals,
      priorSessions,
      sessionMeta
    );

    return {
      ...currentResult,
      crossSession,
      summary: {
        ...currentResult.summary,
        hasCritical: currentResult.summary.hasCritical ||
          crossSession.persistentDisagreements.length > 0 ||
          crossSession.teachingDesignFlaws.length > 0 ||
          crossSession.engagementRisk,
      },
    };
  }

  // ─── 信号检测：CHALLENGE ──────────────────────────────────────────────

  /**
   * 检测挑战信号：学员对内容/方法的质疑
   * @private
   */
  _detectChallenges(turns, history) {
    const challenges = [];

    for (let i = 0; i < turns.length; i++) {
      if (turns[i].role !== 'user') continue;

      const content = history[i]?.content || '';
      let detected = null;

      for (const pattern of CHALLENGE_PATTERNS) {
        if (pattern.test(content)) {
          detected = pattern.source;
          break;
        }
      }
      if (!detected) continue;

      // 查找下一轮 AI 回复，判断是否处理了挑战
      const nextAiIndex = turns.findIndex((t, idx) => idx > i && t.role === 'assistant');
      let handled = false;
      let outcome = 'unresolved';

      if (nextAiIndex !== -1) {
        const aiContent = history[nextAiIndex]?.content || '';
        for (const ack of ACKNOWLEDGMENT_PATTERNS) {
          if (ack.test(aiContent)) {
            handled = true;
            outcome = 'resolved';
            break;
          }
        }
      }

      challenges.push({
        turn: i,
        detected,
        handled,
        outcome,
      });
    }

    return challenges;
  }

  // ─── 信号检测：CONFUSION ──────────────────────────────────────────────

  /**
   * 检测困惑信号：同一概念/关键词在 3+ 轮中反复出现且无掌握度提升
   * @private
   */
  _detectConfusion(turns, history, sessionMeta) {
    const confusions = [];
    const userTurns = [];

    // 收集用户轮次的内容
    for (let i = 0; i < turns.length; i++) {
      if (turns[i].role === 'user') {
        userTurns.push({ index: i, content: history[i]?.content || '' });
      }
    }

    if (userTurns.length < 3) return confusions;

    // 提取关键词频率（简化版：按 2+ 字的词组检测重复）
    const keywordCounts = this._extractRepeatedKeywords(userTurns);

    for (const [keyword, turnIndices] of Object.entries(keywordCounts)) {
      if (turnIndices.length < 3) continue;

      // 检查该概念是否最终被掌握（通过 conceptsCovered 或 breakthrough 信号）
      const breakthroughs = sessionMeta.signals?.breakthrough || [];
      const resolved = breakthroughs.some(
        b => (history[b.turn]?.content || '').includes(keyword)
      );

      confusions.push({
        turn: turnIndices[0], // 首次出现的轮次
        repeatedQueryOn: keyword,
        occurrences: turnIndices.length,
        turnIndices,
        resolved,
      });
    }

    return confusions;
  }

  /**
   * 从用户轮次中提取重复出现的关键词
   * 使用滑动窗口生成 2/3/4 字 n-gram，提高跨轮匹配率
   * @private
   */
  _extractRepeatedKeywords(userTurns) {
    const keywordMap = {}; // keyword → [turnIndex, ...]

    for (const { index, content } of userTurns) {
      // 提取纯中文字符序列
      const chineseChunks = content.match(/[\u4e00-\u9fa5]+/g) || [];
      const seen = new Set(); // 同一轮去重

      for (const chunk of chineseChunks) {
        // 滑动窗口生成 2/3/4 字 n-gram
        for (let len = 2; len <= Math.min(4, chunk.length); len++) {
          for (let start = 0; start <= chunk.length - len; start++) {
            const ngram = chunk.slice(start, start + len);
            if (seen.has(ngram)) continue;
            seen.add(ngram);
            if (!keywordMap[ngram]) keywordMap[ngram] = [];
            keywordMap[ngram].push(index);
          }
        }
      }
    }

    // 过滤常见停用词
    const stopWords = new Set([
      '什么', '怎么', '可以', '我们', '他们', '这个', '那个',
      '没有', '不是', '应该', '因为', '所以', '但是', '如果',
      '已经', '可能', '还是', '就是', '知道', '觉得', '一下',
      '不太', '到底', '意思', '一个', '关于', '不太懂',
    ]);

    const filtered = {};
    for (const [word, indices] of Object.entries(keywordMap)) {
      if (!stopWords.has(word) && indices.length >= 3) {
        filtered[word] = indices;
      }
    }

    // 去除子串：如果 "授权管理" 和 "授权" 都存在，优先保留长的
    const keys = Object.keys(filtered).sort((a, b) => b.length - a.length);
    const removed = new Set();
    for (const longer of keys) {
      for (const shorter of keys) {
        if (shorter !== longer && longer.includes(shorter) && !removed.has(longer)) {
          removed.add(shorter);
        }
      }
    }
    for (const key of removed) {
      delete filtered[key];
    }

    return filtered;
  }

  // ─── 信号检测：BREAKTHROUGH ──────────────────────────────────────────

  /**
   * 检测突破信号：学员顿悟时刻（关键词 + 掌握度跃升）
   * @private
   */
  _detectBreakthroughs(turns, history, sessionMeta) {
    const breakthroughs = [];

    for (let i = 0; i < turns.length; i++) {
      if (turns[i].role !== 'user') continue;

      const content = history[i]?.content || '';
      let detected = null;

      for (const pattern of BREAKTHROUGH_PATTERNS) {
        if (pattern.test(content)) {
          detected = pattern.source;
          break;
        }
      }
      if (!detected) continue;

      // 尝试从 PPP 获取掌握度变化（如果可用）
      const mastery = this._getMasteryChange(sessionMeta, i);

      breakthroughs.push({
        turn: i,
        detected,
        mastery,
      });
    }

    return breakthroughs;
  }

  /**
   * 获取某轮次前后的掌握度变化
   * @private
   */
  _getMasteryChange(sessionMeta, turnIndex) {
    // MVP：从 sessionMeta.signals.breakthrough 中取已有数据
    const existing = (sessionMeta.signals?.breakthrough || [])
      .find(b => b.turn === turnIndex);

    if (existing?.mastery) {
      return existing.mastery;
    }

    // 无 PPP 数据时返回 null
    return { before: null, after: null };
  }

  // ─── 信号检测：DISENGAGEMENT ─────────────────────────────────────────

  /**
   * 检测脱离信号：参与度持续下降
   * - 消息长度趋势下降
   * - 连续短消息
   * @private
   */
  _detectDisengagement(turns, history) {
    const signals = [];

    // 收集用户轮次的消息长度
    const userMetrics = [];
    for (let i = 0; i < turns.length; i++) {
      if (turns[i].role !== 'user') continue;
      const content = history[i]?.content || '';
      userMetrics.push({
        turnIndex: i,
        length: content.length,
        hasQuestion: /[？?]/.test(content),
      });
    }

    if (userMetrics.length < 3) return signals;

    // 计算滑动窗口参与度分数
    const windowSize = 3;
    for (let i = windowSize - 1; i < userMetrics.length; i++) {
      const window = userMetrics.slice(i - windowSize + 1, i + 1);
      const engagementScore = this._computeEngagementScore(window, userMetrics);
      const prevScore = i >= windowSize
        ? this._computeEngagementScore(
            userMetrics.slice(Math.max(0, i - windowSize), i),
            userMetrics
          )
        : engagementScore;

      let trend = 'stable';
      if (engagementScore < prevScore - 0.1) trend = 'declining';
      else if (engagementScore > prevScore + 0.1) trend = 'rising';

      signals.push({
        turn: window[window.length - 1].turnIndex,
        engagementScore: Math.round(engagementScore * 100) / 100,
        trend,
      });
    }

    // 标记连续低参与
    const flagged = [];
    let consecutiveLow = 0;
    for (const signal of signals) {
      if (signal.engagementScore < 0.3) {
        consecutiveLow++;
      } else {
        consecutiveLow = 0;
      }
      if (consecutiveLow >= 3) {
        flagged.push(signal);
      }
    }

    // 如果没有严重脱离，返回最后一个信号作为当前状态
    if (flagged.length > 0) return flagged;
    return signals.length > 0 ? [signals[signals.length - 1]] : [];
  }

  /**
   * 计算参与度分数（0-1）
   * 基于：消息长度归一化 + 提问频率
   * @private
   */
  _computeEngagementScore(windowMetrics, allMetrics) {
    if (windowMetrics.length === 0) return 0.5;

    // 基准：全会话平均消息长度
    const avgLength = allMetrics.reduce((s, m) => s + m.length, 0) / allMetrics.length || 1;

    // 长度分数：当前窗口平均长度 / 全局平均（上限 1.0）
    const windowAvgLength = windowMetrics.reduce((s, m) => s + m.length, 0) / windowMetrics.length;
    const lengthScore = Math.min(1, windowAvgLength / avgLength);

    // 提问分数：窗口内提问比例
    const questionRatio = windowMetrics.filter(m => m.hasQuestion).length / windowMetrics.length;

    // 综合：长度 70% + 提问 30%
    return lengthScore * 0.7 + questionRatio * 0.3;
  }

  // ─── 跨会话关联 ──────────────────────────────────────────────────────

  /**
   * 跨会话关联分析
   * @private
   */
  _correlateAcrossSessions(currentSignals, priorSessions, currentMeta) {
    const result = {
      persistentDisagreements: [],
      teachingDesignFlaws: [],
      breakthroughPatterns: [],
      engagementRisk: false,
      engagementTrend: null,
    };

    // 1. 持续分歧：同一概念在 2+ 会话中被挑战
    const currentChallengeKeywords = new Set(
      currentSignals.challenge.map(c => c.detected)
    );

    for (const prior of priorSessions) {
      const priorChallenges = prior.signals?.challenge || [];
      for (const pc of priorChallenges) {
        const keyword = pc.detected || pc.signal;
        if (currentChallengeKeywords.has(keyword)) {
          result.persistentDisagreements.push({
            concept: keyword,
            sessions: [prior.sessionId, currentMeta.sessionId],
            recommendation: '学员持续质疑此概念，建议重新审视教学内容或切换教学策略',
          });
        }
      }
    }

    // 2. 教学设计缺陷：同一困惑跨会话出现
    const currentConfusionKeywords = new Set(
      currentSignals.confusion.map(c => c.repeatedQueryOn)
    );

    for (const prior of priorSessions) {
      const priorConfusions = prior.signals?.confusion || [];
      for (const pc of priorConfusions) {
        const keyword = pc.repeatedQueryOn || pc.signal;
        if (currentConfusionKeywords.has(keyword)) {
          result.teachingDesignFlaws.push({
            concept: keyword,
            sessions: [prior.sessionId, currentMeta.sessionId],
            recommendation: '跨会话持续困惑，建议反馈给 CGP 优化教学设计',
          });
        }
      }
    }

    // 3. 突破模式：哪些策略在突破时被使用
    for (const prior of priorSessions) {
      const priorBreakthroughs = prior.signals?.breakthrough || [];
      if (priorBreakthroughs.length > 0 && prior.strategiesApplied?.length > 0) {
        result.breakthroughPatterns.push({
          sessionId: prior.sessionId,
          strategies: prior.strategiesApplied.map(s => s.code),
          breakthroughCount: priorBreakthroughs.length,
        });
      }
    }

    // 4. 参与度风险：跨会话参与度持续下降
    const engagementTrend = this._computeCrossSessionEngagement(priorSessions, currentSignals);
    result.engagementTrend = engagementTrend;
    result.engagementRisk = engagementTrend === 'declining';

    return result;
  }

  /**
   * 计算跨会话参与度趋势
   * @private
   */
  _computeCrossSessionEngagement(priorSessions, currentSignals) {
    // 取每个会话的最后一个脱离信号分数
    const scores = [];

    for (const prior of priorSessions) {
      const disengagement = prior.signals?.disengagement || [];
      if (disengagement.length > 0) {
        const lastSignal = disengagement[disengagement.length - 1];
        scores.push(lastSignal.engagementScore ?? 0.5);
      } else {
        scores.push(0.7); // 无脱离信号默认中等参与度
      }
    }

    // 当前会话
    const currentDisengagement = currentSignals.disengagement || [];
    if (currentDisengagement.length > 0) {
      const lastCurrent = currentDisengagement[currentDisengagement.length - 1];
      scores.push(lastCurrent.engagementScore ?? 0.5);
    } else {
      scores.push(0.7);
    }

    if (scores.length < 2) return 'stable';

    // 简单线性趋势：后半段平均 vs 前半段平均
    const mid = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, mid).reduce((s, v) => s + v, 0) / mid;
    const secondHalf = scores.slice(mid).reduce((s, v) => s + v, 0) / (scores.length - mid);

    if (secondHalf < firstHalf - 0.15) return 'declining';
    if (secondHalf > firstHalf + 0.15) return 'rising';
    return 'stable';
  }

  // ─── 工具方法 ─────────────────────────────────────────────────────────

  /** 空结果模板 */
  _emptyResult() {
    return {
      sessionId: null,
      userId: null,
      signals: {
        challenge: [],
        confusion: [],
        breakthrough: [],
        disengagement: [],
      },
      summary: { totalSignals: 0, hasCritical: false },
      crossSession: null,
      minedAt: new Date().toISOString(),
    };
  }
}
