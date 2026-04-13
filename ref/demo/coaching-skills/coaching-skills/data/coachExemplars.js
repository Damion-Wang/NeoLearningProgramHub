/**
 * Coach Exemplar Library (私教系统 §十 教练范例库)
 *
 * Provides exemplar coaching scenarios organized by signal type.
 * Each exemplar includes scenario description, coach response template,
 * technique used, and applicable Dreyfus level.
 *
 * Used by CoachingSkill to select signal-aware coaching strategies.
 */

/**
 * @typedef {Object} Exemplar
 * @property {string} scenario - Situation description
 * @property {string} coachResponse - Example coach response approach
 * @property {string} technique - Coaching technique name
 * @property {string} dreyfusLevel - Target Dreyfus level: novice|advanced_beginner|competent|proficient|expert
 */

const EXEMPLAR_DATA = {
  '⑤_know_do_gap': [
    {
      scenario: '管理者知道应该授权但总是自己做',
      coachResponse: '先探索不授权的深层原因：是信任问题、完美主义、还是不知道怎么拆任务？用排除法逐一验证。',
      technique: '知行差距四维排除法（信念/动机/能力/环境）',
      dreyfusLevel: 'novice',
    },
    {
      scenario: '管理者懂得反馈技巧但实际对话总是变成批评',
      coachResponse: '回放一个具体场景：你当时想说什么？实际说了什么？中间哪个念头让你偏离了？',
      technique: '场景回放+意图-行为偏差分析',
      dreyfusLevel: 'advanced_beginner',
    },
    {
      scenario: '管理者理解目标对齐重要性但团队目标总是脱节',
      coachResponse: '从最近一次目标设定对话入手：你是如何传递上级目标的？团队成员的反应是什么？',
      technique: '过程还原+断点定位',
      dreyfusLevel: 'competent',
    },
    {
      scenario: '管理者能讲出教练式对话步骤但实操时退回指令式',
      coachResponse: '不急——先确认是哪种场景容易退回？压力大的时候、时间紧的时候、还是面对特定人的时候？',
      technique: '触发情境识别+渐进式行为替换',
      dreyfusLevel: 'competent',
    },
    {
      scenario: '高级管理者理解变革管理但团队转型推不动',
      coachResponse: '你描述的阻力来自哪一层？是认知层（不理解为什么变）、能力层（不知道怎么变）、还是意愿层（不想变）？',
      technique: '阻力分层诊断',
      dreyfusLevel: 'proficient',
    },
  ],

  '⑥_misconception': [
    {
      scenario: '管理者认为"管理就是控制"',
      coachResponse: '你说的控制具体指什么？如果有个管理者完全不控制但团队产出更好，你觉得缺了什么？',
      technique: '苏格拉底式追问+反例构造',
      dreyfusLevel: 'novice',
    },
    {
      scenario: '管理者认为"好员工不需要管"',
      coachResponse: '你团队里表现最好的人，上次主动找你聊职业发展是什么时候？',
      technique: '盲点暴露+具体化验证',
      dreyfusLevel: 'advanced_beginner',
    },
    {
      scenario: '管理者认为"一对一就是工作汇报"',
      coachResponse: '如果下属在一对一中只汇报工作，你觉得他没说的那些（困惑、想法、不满）去了哪里？',
      technique: '视角转换+信息损失分析',
      dreyfusLevel: 'competent',
    },
  ],

  '⑦_metacognitive_bias': [
    {
      scenario: '管理者认为自己沟通能力很强但团队反馈相反',
      coachResponse: '你觉得沟通好的标准是什么？如果让团队打分，你预期多少分？',
      technique: '自评-他评对比（校准）',
      dreyfusLevel: 'novice',
    },
    {
      scenario: '管理者认为自己已经掌握某个技能但实际应用中频繁出错',
      coachResponse: '让我们做个小实验：不看任何资料，你能完整描述这个方法的三个关键步骤吗？',
      technique: '即时提取测试（暴露知识幻觉）',
      dreyfusLevel: 'advanced_beginner',
    },
    {
      scenario: '管理者过度自信于自己的决策质量',
      coachResponse: '回顾最近三个重要决策，有没有一个结果不如预期的？当时你的判断依据是什么？',
      technique: '决策复盘+过度自信校正',
      dreyfusLevel: 'competent',
    },
  ],

  '⑧_context_mismatch': [
    {
      scenario: '管理者用技术团队的管理方式管销售团队',
      coachResponse: '技术团队和销售团队最核心的区别是什么？你过去有效的方法，为什么在新团队不灵了？',
      technique: '旧模式识别+新场景适配',
      dreyfusLevel: 'novice',
    },
    {
      scenario: '管理者在新公司沿用老公司的文化假设',
      coachResponse: '你在这里观察到的三个最大的文化差异是什么？哪些你过去的做法因为这些差异而失效了？',
      technique: '文化假设显性化+差异映射',
      dreyfusLevel: 'competent',
    },
    {
      scenario: '管理者面对远程团队仍用面对面管理思维',
      coachResponse: '远程环境下你丢失了哪些过去依赖的信息来源？你用什么替代了它们？',
      technique: '信息通道分析+替代策略设计',
      dreyfusLevel: 'advanced_beginner',
    },
  ],
};

/**
 * All exemplar category keys.
 * @type {string[]}
 */
export const EXEMPLAR_CATEGORIES = Object.keys(EXEMPLAR_DATA);

/**
 * Get a single exemplar matching category and optional Dreyfus level.
 * Prefers exact level match; falls back to closest available.
 *
 * @param {string} category - e.g. '⑤_know_do_gap'
 * @param {Object} [options]
 * @param {string} [options.dreyfusLevel] - Target Dreyfus level
 * @returns {Exemplar|null}
 */
export function getExemplar(category, options = {}) {
  const exemplars = EXEMPLAR_DATA[category];
  if (!exemplars || exemplars.length === 0) return null;

  const { dreyfusLevel } = options;
  if (!dreyfusLevel) return exemplars[0];

  // Try exact match first
  const exact = exemplars.find(e => e.dreyfusLevel === dreyfusLevel);
  if (exact) return exact;

  // Fall back to level ordering: find nearest
  const levels = ['novice', 'advanced_beginner', 'competent', 'proficient', 'expert'];
  const targetIdx = levels.indexOf(dreyfusLevel);
  if (targetIdx === -1) return exemplars[0];

  // Find closest by level distance
  let best = exemplars[0];
  let bestDist = Infinity;
  for (const e of exemplars) {
    const eIdx = levels.indexOf(e.dreyfusLevel);
    const dist = Math.abs(eIdx - targetIdx);
    if (dist < bestDist) {
      bestDist = dist;
      best = e;
    }
  }
  return best;
}

/**
 * Get all exemplars for a category.
 *
 * @param {string} category
 * @returns {Exemplar[]}
 */
export function getAllExemplars(category) {
  return EXEMPLAR_DATA[category] || [];
}
