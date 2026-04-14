/**
 * 赋能任务信号引擎 — 7 种信号源的检测与推送
 *
 * Spec 来源：spec-赋能任务.md §八
 *
 * 核心原则：每次推送必须有至少 1 个非时间维度的信号。
 * 不能只因为"到时间了"就推送——必须有行为、能力、状态等实质性变化依据。
 *
 * 7 种信号源:
 *   1. PPP_COMPETENCY_GAP      — PPP 检测到未被赋能任务覆盖的能力缺口
 *   2. EXECUTION_BEHIND_SCHEDULE — 任务进度落后于预期时间线
 *   3. TUTOR_STRATEGY_ISSUE     — 私教报告教学策略失效
 *   4. CAPACITY_CONFLICT        — 学员容量过载
 *   5. EFFECT_TARGET_MET        — 任务掌握度目标已达成
 *   6. CONVERSION_FUNNEL_STALL  — 学员参与度停滞（活动卡在 in_progress > 7 天）
 *   7. LEARNER_HIGH_URGENCY     — 学员发出高紧急度信号
 *
 * 依赖:
 *   - DataService: 任务数据持久化
 *   - PPPEngine: 能力画像 + 行为证据
 *   - CapacityManagementEngine: 容量检测
 *   - EffectMeasurementEngine: 效果度量
 */

/**
 * 信号类型枚举
 */
export const SignalType = {
  PPP_COMPETENCY_GAP: 'PPP_COMPETENCY_GAP',
  EXECUTION_BEHIND_SCHEDULE: 'EXECUTION_BEHIND_SCHEDULE',
  TUTOR_STRATEGY_ISSUE: 'TUTOR_STRATEGY_ISSUE',
  CAPACITY_CONFLICT: 'CAPACITY_CONFLICT',
  EFFECT_TARGET_MET: 'EFFECT_TARGET_MET',
  CONVERSION_FUNNEL_STALL: 'CONVERSION_FUNNEL_STALL',
  LEARNER_HIGH_URGENCY: 'LEARNER_HIGH_URGENCY',
};

/**
 * 信号紧急度
 */
export const SignalUrgency = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * 活动停滞天数阈值
 */
const STALL_THRESHOLD_DAYS = 7;

/**
 * 能力缺口分数阈值（低于此值视为缺口）
 */
const COMPETENCY_GAP_THRESHOLD = 0.4;

/**
 * 进度落后系数（完成比 < 时间比 × 此系数 → 视为落后）
 */
const PROGRESS_LAG_FACTOR = 0.7;

export class EnablementSignalEngine {
  /**
   * @param {Object} [dataService] - DataService 实例
   * @param {Object} [pppEngine] - PPPEngine 实例（能力快照）
   * @param {Object} [capacityEngine] - CapacityManagementEngine 实例
   * @param {Object} [effectEngine] - EffectMeasurementEngine 实例
   */
  constructor(dataService = null, pppEngine = null, capacityEngine = null, effectEngine = null) {
    this._dataService = dataService;
    this._pppEngine = pppEngine;
    this._capacityEngine = capacityEngine;
    this._effectEngine = effectEngine;

    // Mock 数据存储（后续替换为 DataService）
    this._mockActiveTasks = new Map(); // managerId → task[]
  }

  /**
   * 扫描管理者所有活跃任务，返回可操作的信号列表
   *
   * @param {string} managerId - 管理者 ID
   * @returns {Promise<Object[]>} EnablementSignal[]
   */
  async scanSignals(managerId) {
    if (!managerId) throw new Error('Manager ID is required');

    const tasks = await this._getActiveTasks(managerId);
    const signals = [];

    // 逐任务检测信号
    for (const task of tasks) {
      const taskSignals = await this.checkTask(task);
      signals.push(...taskSignals);
    }

    // 额外：PPP 能力缺口检测（不依赖已有任务）
    const gapSignals = await this._checkPPPCompetencyGaps(managerId, tasks);
    signals.push(...gapSignals);

    return signals;
  }

  /**
   * 检查单个任务的所有信号源
   *
   * @param {Object} task - EnablementTask
   * @returns {Promise<Object[]>} EnablementSignal[]
   */
  async checkTask(task) {
    if (!task) throw new Error('Task is required');

    const signals = [];

    // 信号 2: EXECUTION_BEHIND_SCHEDULE
    const behindSchedule = this._checkExecutionBehindSchedule(task);
    if (behindSchedule) signals.push(behindSchedule);

    // 信号 3: TUTOR_STRATEGY_ISSUE
    const strategyIssue = this._checkTutorStrategyIssue(task);
    if (strategyIssue) signals.push(strategyIssue);

    // 信号 4: CAPACITY_CONFLICT
    const capacityConflict = await this._checkCapacityConflict(task);
    if (capacityConflict) signals.push(capacityConflict);

    // 信号 5: EFFECT_TARGET_MET
    const targetMet = await this._checkEffectTargetMet(task);
    if (targetMet) signals.push(targetMet);

    // 信号 6: CONVERSION_FUNNEL_STALL
    const stalls = this._checkConversionFunnelStall(task);
    signals.push(...stalls);

    // 信号 7: LEARNER_HIGH_URGENCY
    const urgencySignals = this._checkLearnerHighUrgency(task);
    signals.push(...urgencySignals);

    return signals;
  }

  // ==================== Mock 数据管理 ====================

  /**
   * 设置管理者的活跃任务列表（测试/mock 用途）
   */
  setActiveTasks(managerId, tasks) {
    this._mockActiveTasks.set(managerId, tasks);
  }

  // ==================== 信号检测：逐个实现 ====================

  /**
   * 信号 1: PPP_COMPETENCY_GAP — PPP 检测到未覆盖的能力缺口
   *
   * 触发：某能力分数 < 0.4 且无活跃任务覆盖该能力
   * nonTimeSignal: 能力分数变化（PPP 行为证据驱动）
   *
   * @private
   */
  async _checkPPPCompetencyGaps(managerId, activeTasks) {
    if (!this._pppEngine || typeof this._pppEngine.getCompetencySnapshot !== 'function') {
      return [];
    }

    const signals = [];

    // 收集所有活跃任务已覆盖的能力
    const coveredCompetencies = new Set();
    for (const task of activeTasks) {
      if (task.competencyIds) {
        task.competencyIds.forEach(id => coveredCompetencies.add(id));
      }
    }

    // 获取管理者下属的能力快照
    const learnerIds = this._extractLearnerIds(activeTasks);
    for (const learnerId of learnerIds) {
      try {
        const snapshot = await this._pppEngine.getCompetencySnapshot(learnerId);
        if (!snapshot || !Array.isArray(snapshot.competencies)) continue;

        for (const comp of snapshot.competencies) {
          if (comp.score < COMPETENCY_GAP_THRESHOLD && !coveredCompetencies.has(comp.id)) {
            signals.push(this._createSignal({
              type: SignalType.PPP_COMPETENCY_GAP,
              taskId: null,
              learnerId,
              urgency: comp.score < 0.2 ? SignalUrgency.HIGH : SignalUrgency.MEDIUM,
              message: `${learnerId} 的「${comp.name || comp.id}」能力评分 ${comp.score.toFixed(2)}，低于阈值且无活跃赋能任务覆盖`,
              suggestedAction: `为 ${learnerId} 创建针对「${comp.name || comp.id}」的赋能任务`,
              nonTimeSignal: `PPP 能力评分 ${comp.score.toFixed(2)} < ${COMPETENCY_GAP_THRESHOLD}`,
            }));
          }
        }
      } catch {
        // PPP 不可用时静默跳过
      }
    }

    return signals;
  }

  /**
   * 信号 2: EXECUTION_BEHIND_SCHEDULE — 进度落后
   *
   * 触发：completedRatio < elapsedRatio × 0.7
   * nonTimeSignal: 活动完成比率与预期的差距（行为证据）
   *
   * @private
   */
  _checkExecutionBehindSchedule(task) {
    const activities = task.activities || [];
    if (activities.length === 0) return null;

    const completed = activities.filter(a => a.status === 'completed').length;
    const completedRatio = completed / activities.length;

    // 计算时间进度
    const createdAt = task.createdAt ? new Date(task.createdAt).getTime() : null;
    const expectedDuration = task.expectedDurationDays || 30;
    if (!createdAt) return null;

    const now = Date.now();
    const elapsedMs = now - createdAt;
    const totalMs = expectedDuration * 24 * 60 * 60 * 1000;
    const elapsedRatio = Math.min(elapsedMs / totalMs, 1);

    // 核心判定：完成比 < 时间比 × 0.7
    if (completedRatio < elapsedRatio * PROGRESS_LAG_FACTOR && elapsedRatio > 0.1) {
      return this._createSignal({
        type: SignalType.EXECUTION_BEHIND_SCHEDULE,
        taskId: task.id,
        learnerId: task.learnerId,
        urgency: elapsedRatio > 0.8 ? SignalUrgency.HIGH : SignalUrgency.MEDIUM,
        message: `任务「${task.title || task.id}」进度落后：已完成 ${(completedRatio * 100).toFixed(0)}%，预期应达 ${(elapsedRatio * PROGRESS_LAG_FACTOR * 100).toFixed(0)}%`,
        suggestedAction: '了解进展阻碍，考虑调整活动安排或提供额外支持',
        nonTimeSignal: `活动完成率 ${(completedRatio * 100).toFixed(0)}% 低于预期 ${(elapsedRatio * PROGRESS_LAG_FACTOR * 100).toFixed(0)}%`,
      });
    }

    return null;
  }

  /**
   * 信号 3: TUTOR_STRATEGY_ISSUE — 私教报告策略问题
   *
   * 触发：存在未解决的 strategy_issue 类型反馈
   * nonTimeSignal: 私教主动反馈的策略失效（教学行为证据）
   *
   * @private
   */
  _checkTutorStrategyIssue(task) {
    const feedbacks = task.tutorFeedback || [];
    const unresolvedIssues = feedbacks.filter(
      f => f.type === 'strategy_issue' && !f.resolved
    );

    if (unresolvedIssues.length === 0) return null;

    const latest = unresolvedIssues[unresolvedIssues.length - 1];
    return this._createSignal({
      type: SignalType.TUTOR_STRATEGY_ISSUE,
      taskId: task.id,
      learnerId: task.learnerId,
      urgency: unresolvedIssues.length >= 2 ? SignalUrgency.HIGH : SignalUrgency.MEDIUM,
      message: `私教反馈任务「${task.title || task.id}」存在策略问题：${latest.description || '教学策略效果不佳'}`,
      suggestedAction: '调整任务活动设计或切换教学方式',
      nonTimeSignal: `${unresolvedIssues.length} 条未解决的私教策略反馈`,
    });
  }

  /**
   * 信号 4: CAPACITY_CONFLICT — 学员容量过载
   *
   * 触发：剩余容量 < 0 或存在冲突
   * nonTimeSignal: 容量计算结果（负载数据驱动）
   *
   * @private
   */
  async _checkCapacityConflict(task) {
    if (!this._capacityEngine || typeof this._capacityEngine.checkCapacity !== 'function') {
      return null;
    }

    const learnerId = task.learnerId;
    if (!learnerId) return null;

    try {
      const capacityResult = await this._capacityEngine.checkCapacity(learnerId, 0);

      if (capacityResult.remaining < 0) {
        return this._createSignal({
          type: SignalType.CAPACITY_CONFLICT,
          taskId: task.id,
          learnerId,
          urgency: capacityResult.remaining < -4 ? SignalUrgency.HIGH : SignalUrgency.MEDIUM,
          message: `${learnerId} 当前容量过载（超出 ${Math.abs(capacityResult.remaining)} 小时/周），影响任务「${task.title || task.id}」执行`,
          suggestedAction: '暂停低优先级任务或调整任务活动强度',
          nonTimeSignal: `学员负载超出容量 ${Math.abs(capacityResult.remaining)} 小时/周`,
        });
      }
    } catch {
      // 容量引擎不可用时静默跳过
    }

    return null;
  }

  /**
   * 信号 5: EFFECT_TARGET_MET — 掌握度目标已达成
   *
   * 触发：overallMasteryDelta >= targetMastery
   * nonTimeSignal: 能力评估数据达标（度量证据驱动）
   *
   * @private
   */
  async _checkEffectTargetMet(task) {
    if (!this._effectEngine || typeof this._effectEngine.evaluateEffect !== 'function') {
      return null;
    }

    if (!task.id || !task.learnerId || !task.competencyIds || task.competencyIds.length === 0) {
      return null;
    }

    try {
      const effect = await this._effectEngine.evaluateEffect(
        task.id,
        task.learnerId,
        task.competencyIds,
        task.targetMastery || 0.3
      );

      if (effect.meetsTarget) {
        return this._createSignal({
          type: SignalType.EFFECT_TARGET_MET,
          taskId: task.id,
          learnerId: task.learnerId,
          urgency: SignalUrgency.LOW,
          message: `任务「${task.title || task.id}」掌握度已达标（提升 ${effect.overallMasteryDelta.toFixed(2)}，目标 ${(task.targetMastery || 0.3).toFixed(2)}）`,
          suggestedAction: '确认完成条件，准备结束任务',
          nonTimeSignal: `掌握度提升 ${effect.overallMasteryDelta.toFixed(2)} 达到目标`,
        });
      }
    } catch {
      // 效果引擎不可用时静默跳过
    }

    return null;
  }

  /**
   * 信号 6: CONVERSION_FUNNEL_STALL — 活动停滞
   *
   * 触发：活动 status='in_progress' 且超过 7 天无进展
   * nonTimeSignal: 活动状态停滞（行为缺失证据）
   *
   * @private
   */
  _checkConversionFunnelStall(task) {
    const activities = task.activities || [];
    const signals = [];
    const now = Date.now();

    for (const activity of activities) {
      if (activity.status !== 'in_progress') continue;

      const lastUpdate = activity.lastProgressAt || activity.startedAt;
      if (!lastUpdate) continue;

      const daysSinceUpdate = (now - new Date(lastUpdate).getTime()) / (24 * 60 * 60 * 1000);

      if (daysSinceUpdate >= STALL_THRESHOLD_DAYS) {
        signals.push(this._createSignal({
          type: SignalType.CONVERSION_FUNNEL_STALL,
          taskId: task.id,
          learnerId: task.learnerId,
          urgency: daysSinceUpdate >= 14 ? SignalUrgency.HIGH : SignalUrgency.MEDIUM,
          message: `任务「${task.title || task.id}」中活动「${activity.title || activity.id}」已停滞 ${Math.floor(daysSinceUpdate)} 天`,
          suggestedAction: `了解哪一步卡住了？是否需要调整活动设计或提供额外指导`,
          nonTimeSignal: `活动 ${Math.floor(daysSinceUpdate)} 天无进展更新`,
        }));
      }
    }

    return signals;
  }

  /**
   * 信号 7: LEARNER_HIGH_URGENCY — 学员高紧急度信号
   *
   * 触发：存在未确认的高紧急度信号
   * nonTimeSignal: 学员主动发出的紧急信号
   *
   * @private
   */
  _checkLearnerHighUrgency(task) {
    const learnerSignals = task.learnerSignals || [];
    const signals = [];

    const unacknowledged = learnerSignals.filter(
      s => s.urgency === 'high' && !s.acknowledged
    );

    for (const ls of unacknowledged) {
      signals.push(this._createSignal({
        type: SignalType.LEARNER_HIGH_URGENCY,
        taskId: task.id,
        learnerId: task.learnerId,
        urgency: SignalUrgency.HIGH,
        message: `${task.learnerId} 发出紧急信号：${ls.message || '需要立即关注'}`,
        suggestedAction: '立即与学员沟通了解情况',
        nonTimeSignal: `学员主动发出高紧急度信号`,
      }));
    }

    return signals;
  }

  // ==================== 内部辅助方法 ====================

  /**
   * 创建标准化信号对象
   * @private
   */
  _createSignal({ type, taskId, learnerId, urgency, message, suggestedAction, nonTimeSignal }) {
    return {
      type,
      taskId: taskId || null,
      learnerId: learnerId || 'unknown',
      urgency,
      message,
      suggestedAction,
      nonTimeSignal,
      detectedAt: new Date().toISOString(),
    };
  }

  /**
   * 获取管理者的活跃任务列表
   * @private
   */
  async _getActiveTasks(managerId) {
    // 优先使用 mock 数据
    if (this._mockActiveTasks.has(managerId)) {
      return this._mockActiveTasks.get(managerId);
    }

    // 后续接 DataService
    if (this._dataService && typeof this._dataService.getActiveTasksByManager === 'function') {
      return await this._dataService.getActiveTasksByManager(managerId);
    }

    return [];
  }

  /**
   * 从活跃任务中提取所有学员 ID（去重）
   * @private
   */
  _extractLearnerIds(tasks) {
    const ids = new Set();
    for (const task of tasks) {
      if (task.learnerId) ids.add(task.learnerId);
      if (task.targetLearnerIds) {
        task.targetLearnerIds.forEach(id => ids.add(id));
      }
    }
    return [...ids];
  }
}
