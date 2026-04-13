/**
 * Layer 2 Pedagogical Validator — 教学法合规检测（教研引擎质检第二层）
 *
 * 基于循证教学策略库（teachingStrategies.js）+ 桥接层（strategyBridge.js）进行：
 *   1. 策略 × Dreyfus 匹配检测 — 新手用了高阶策略？
 *   2. 策略 × 错误类型匹配检测 — 检测到错误但没用纠正策略？
 *   3. 策略组合缺失提醒 — combinableWith 推荐从未尝试？
 *   4. 策略效果空转检测 — 应用了策略但掌握度没变化？
 *
 * 消费方：qualityInspectionEngine（Layer 1 flagged 后触发）
 * 数据源：sessionTranscriptMeta + teachingStrategies.js
 */

import { getStrategyById, getCombinable } from '../../data/teachingStrategies';

// ============================================================
// Dreyfus 阶段 × 策略适用性矩阵
// ============================================================

/**
 * 新手阶段（novice/advanced_beginner）不适合的策略
 * 这些策略要求较高的先验知识或元认知能力
 */
const NOVICE_INCOMPATIBLE = new Set([
  'IP-03', // 苏格拉底追问 — 需要足够知识基础才能被有效追问
  'CG-05', // 有效失败 — 新手可能从失败中学不到东西，反而挫败
  'IP-06', // 同伴互教 — 新手自己还没掌握，无法教别人
  'CS-07', // 自主学习契约 — 新手缺乏自我导航能力
  'AF-05', // 精通学习门槛 — 对新手来说门槛过高会阻碍进展
]);

/**
 * 专家阶段（proficient/expert）效率较低的策略
 * 对高水平学员来说这些策略过于基础
 */
const EXPERT_INEFFICIENT = new Set([
  'CG-06', // 先直觉后符号 — 专家已有足够抽象能力
  'CG-07', // 认知负荷控制 — 专家承受负荷能力强
  'NE-03', // 案例锚定 — 专家需要更深层的挑战而非案例引导
  'CS-03', // 脚手架渐进 — 专家不需要脚手架
]);

/**
 * 错误类型 → 推荐纠正策略映射
 */
const ERROR_CORRECTION_MAP = {
  misconception: ['CG-08'], // 概念转变策略
  forgotten: ['CG-02', 'CG-03'], // 间隔重复 + 检索练习
  misapplied: ['CG-04', 'AF-02'], // 交错练习 + 分层挑战
  wrong_tool: ['CS-03', 'IP-03'], // 脚手架 + 苏格拉底追问
};

// ============================================================
// Layer 2 Pedagogical Validator
// ============================================================

export class Layer2PedagogicalValidator {
  constructor() {
    // 未来可注入配置
  }

  /**
   * 教学法合规验证
   *
   * @param {Object} sessionMeta - createSessionTranscriptMeta 输出
   * @param {Array} [layer1Issues] - Layer 1 检出的问题（可用于交叉参考）
   * @returns {{ status: 'flagged'|'clean', violations: Array }}
   */
  async validate(sessionMeta, layer1Issues = []) {
    if (!sessionMeta) {
      return { status: 'clean', violations: [] };
    }

    const violations = [];
    const strategies = sessionMeta.strategiesApplied || [];
    const signals = sessionMeta.signals || {};

    // 1. 策略 × Dreyfus 匹配
    violations.push(...this._checkDreyfusMismatch(strategies, sessionMeta));

    // 2. 策略 × 错误类型匹配
    violations.push(...this._checkErrorCorrectionMissing(strategies, signals));

    // 3. 策略组合缺失
    violations.push(...this._checkCombinationMissing(strategies));

    // 4. 策略效果空转
    violations.push(...this._checkStrategyEffectNull(strategies, sessionMeta));

    return {
      status: violations.length > 0 ? 'flagged' : 'clean',
      violations,
    };
  }

  // ─── 检测 1: 策略 × Dreyfus 匹配 ─────────────────────────────────────

  _checkDreyfusMismatch(strategies, sessionMeta) {
    const violations = [];

    // 从策略应用上下文中提取 Dreyfus 阶段
    for (const record of strategies) {
      const dreyfusLevels = (record.contexts || [])
        .map(ctx => ctx.dreyfusLevel)
        .filter(Boolean);

      if (dreyfusLevels.length === 0) continue;

      // 取最常出现的 Dreyfus 阶段
      const level = this._mostFrequent(dreyfusLevels);

      // 新手用了高阶策略？
      if ((level === 'novice' || level === 'advanced_beginner') &&
          NOVICE_INCOMPATIBLE.has(record.code)) {
        const strategy = getStrategyById(record.code);
        violations.push({
          pedagogicalRule: 'strategy_dreyfus_mismatch',
          detail: `新手/初学者阶段使用了 ${record.code}（${strategy?.name || record.name}），该策略需要较高先验知识`,
          remediation: '建议替换为结构化程度更高的策略：CG-06（先直觉后符号）、CG-07（认知负荷控制）或 CS-03（脚手架渐进）',
          relatedStrategyCode: record.code,
        });
      }

      // 专家用了基础策略？
      if ((level === 'proficient' || level === 'expert') &&
          EXPERT_INEFFICIENT.has(record.code)) {
        const strategy = getStrategyById(record.code);
        violations.push({
          pedagogicalRule: 'strategy_dreyfus_mismatch',
          detail: `精通/专家阶段使用了 ${record.code}（${strategy?.name || record.name}），该策略对高水平学员效率较低`,
          remediation: '建议升级为探索式策略：IP-03（苏格拉底追问）、CG-05（有效失败）或 IP-06（同伴互教）',
          relatedStrategyCode: record.code,
        });
      }
    }

    return violations;
  }

  // ─── 检测 2: 策略 × 错误类型匹配 ─────────────────────────────────────

  _checkErrorCorrectionMissing(strategies, signals) {
    const violations = [];
    const appliedCodes = new Set(strategies.map(s => s.code));

    // 检查每种错误信号是否有对应纠正策略
    for (const [errorType, correctiveStrategies] of Object.entries(ERROR_CORRECTION_MAP)) {
      // 从 signals 中检查是否有该类错误
      const errorSignals = signals[errorType] || [];

      // 也检查通用信号分类（challenge/confusion 可能包含 misconception）
      const hasError = errorSignals.length > 0 ||
        (errorType === 'misconception' && (signals.confusion || []).length > 0);

      if (!hasError) continue;

      // 检查是否至少使用了一个纠正策略
      const hasCorrective = correctiveStrategies.some(code => appliedCodes.has(code));
      if (!hasCorrective) {
        const strategyNames = correctiveStrategies
          .map(code => {
            const s = getStrategyById(code);
            return s ? `${code}（${s.name}）` : code;
          })
          .join('、');

        violations.push({
          pedagogicalRule: 'error_correction_missing',
          detail: `检测到 ${errorType} 类错误信号，但未使用对应纠正策略`,
          remediation: `建议使用: ${strategyNames}`,
          relatedStrategyCode: correctiveStrategies[0],
        });
      }
    }

    return violations;
  }

  // ─── 检测 3: 策略组合缺失 ─────────────────────────────────────────────

  _checkCombinationMissing(strategies) {
    const violations = [];
    const appliedCodes = new Set(strategies.map(s => s.code));

    // 只在策略应用数 >= 2 时检查组合
    if (strategies.length < 2) return violations;

    for (const record of strategies) {
      const combinable = getCombinable(record.code) || [];
      if (combinable.length === 0) continue;

      // 检查 combinableWith 中有多少被使用
      const usedCombinable = combinable.filter(c => appliedCodes.has(c.code));
      if (usedCombinable.length > 0) continue; // 已有组合，不报

      // 推荐最多 2 个未使用的组合策略
      const suggestions = combinable
        .filter(c => !appliedCodes.has(c.code))
        .slice(0, 2)
        .map(c => `${c.code}（${c.name}）`)
        .join('、');

      if (suggestions) {
        violations.push({
          pedagogicalRule: 'strategy_combination_missing',
          detail: `${record.code}（${record.name}）的推荐组合策略均未使用`,
          remediation: `建议搭配: ${suggestions}`,
          relatedStrategyCode: record.code,
        });
      }
    }

    return violations;
  }

  // ─── 检测 4: 策略效果空转 ─────────────────────────────────────────────

  _checkStrategyEffectNull(strategies, sessionMeta) {
    const violations = [];

    // MVP：通过会话前后掌握度变化判断
    // 如果有策略应用但信号中没有 breakthrough，且有多次应用，标记为效果存疑
    const breakthroughs = (sessionMeta.signals?.breakthrough || []).length;
    const totalApplications = strategies.reduce(
      (sum, s) => sum + (s.turns || []).length, 0
    );

    // 应用了 5+ 次策略但零突破 → 效果存疑
    if (totalApplications >= 5 && breakthroughs === 0) {
      violations.push({
        pedagogicalRule: 'strategy_effect_null',
        detail: `本次会话共应用 ${totalApplications} 次策略，但未检测到突破信号`,
        remediation: '建议复查策略选择是否匹配学员当前水平，或尝试切换策略类别',
        relatedStrategyCode: strategies[0]?.code || null,
      });
    }

    return violations;
  }

  // ─── 工具方法 ─────────────────────────────────────────────────────────

  _mostFrequent(arr) {
    const counts = {};
    for (const item of arr) {
      counts[item] = (counts[item] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }
}
