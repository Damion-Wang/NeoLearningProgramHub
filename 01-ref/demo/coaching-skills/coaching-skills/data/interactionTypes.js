/**
 * 互动类型系统 — 从4种扩展到12+种
 * 来源：course-workbench 研究文档（AI老师互动策略全集 + 三大模式策略库）
 *
 * 核心12类型（Phase 1 实现目标）分4大类：
 *   检测型(5): predict, recall, misconception_check, confidence_check, timed_challenge
 *   建构型(3): productive_failure, socratic, counterfactual
 *   迁移型(3): transfer, summary, role_play
 *   体验型(1): branch_scenario
 *
 * 完整33类型（Phase 2+）分8大类 A-H
 */

// ---------------------------------------------------------------------------
// 类型定义
// ---------------------------------------------------------------------------

/**
 * @typedef {'low' | 'medium' | 'high'} Complexity
 */

/**
 * @typedef {Object} InteractionType
 * @property {string}      id          - 唯一标识，snake_case
 * @property {string}      name        - 中文名称
 * @property {string}      category    - 所属分类 id
 * @property {string}      description - 1-2 句中文说明
 * @property {Complexity}  complexity  - 认知复杂度
 * @property {string|null} effectSize  - Cohen's d 效应量（如有研究数据）
 * @property {boolean}     implemented - 当前是否已实现
 * @property {1|2}         phase       - 计划实现阶段
 */

/**
 * @typedef {Object} InteractionCategory
 * @property {string} id          - 分类标识
 * @property {string} name        - 中文名称
 * @property {string} description - 分类说明
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string}   type        - 错误类型标识
 * @property {string}   name        - 中文名称
 * @property {string}   description - 错误特征
 * @property {string}   strategy    - 应对策略
 * @property {string[]} examples    - 典型话术示例
 */

/**
 * @typedef {Object} ProactiveSignal
 * @property {string}   type        - 信号类型标识
 * @property {string}   name        - 中文名称
 * @property {string}   trigger     - 触发条件
 * @property {string}   response    - AI 响应策略
 * @property {string[]} examples    - 典型话术示例
 */

// ---------------------------------------------------------------------------
// 核心4大分类（Phase 1）
// ---------------------------------------------------------------------------

/** @type {Record<string, InteractionCategory>} */
export const INTERACTION_CATEGORIES = {
  testing: {
    id: 'testing',
    name: '检测型',
    description: '快速探测学员当前认知状态，暴露知识缺口或误解',
  },
  constructive: {
    id: 'constructive',
    name: '建构型',
    description: '通过提问、失败或假设推演，引导学员主动构建知识结构',
  },
  transfer: {
    id: 'transfer',
    name: '迁移型',
    description: '将所学知识迁移到新场景或自身工作情境，强化应用能力',
  },
  experiential: {
    id: 'experiential',
    name: '体验型',
    description: '沉浸式情境体验，通过选择-后果链让学员感受决策影响',
  },
};

// ---------------------------------------------------------------------------
// 核心12类型（Phase 1）
// ---------------------------------------------------------------------------

/** @type {InteractionType[]} */
export const CORE_INTERACTION_TYPES = [
  // ── 检测型 (testing) ──────────────────────────────────────────────────
  {
    id: 'predict',
    name: '先猜再讲',
    category: 'testing',
    description: '揭示答案前让学员预测结果，激活先验知识并制造认知好奇。',
    complexity: 'low',
    effectSize: null,
    implemented: true,
    phase: 1,
  },
  {
    id: 'recall',
    name: '即时回忆',
    category: 'testing',
    description: '关键知识点讲完后立刻要求回忆，利用测试效应巩固记忆。',
    complexity: 'low',
    effectSize: null,
    implemented: true,
    phase: 1,
  },
  {
    id: 'misconception_check',
    name: '误解陷阱',
    category: 'testing',
    description: '呈现常见错误观点让学员判断对错，精准暴露顽固误解。',
    complexity: 'medium',
    effectSize: 'd=0.99',
    implemented: true,
    phase: 1,
  },
  {
    id: 'confidence_check',
    name: '信心校准',
    category: 'testing',
    description: '选择答案后标注信心等级（猜/有点把握/确定），校准元认知准确性。',
    complexity: 'low',
    effectSize: null,
    implemented: false,
    phase: 1,
  },
  {
    id: 'timed_challenge',
    name: '限时挑战',
    category: 'testing',
    description: '倒计时选择题，用时间压力激活专注力，适合事实性知识的快速巩固。',
    complexity: 'low',
    effectSize: null,
    implemented: false,
    phase: 1,
  },

  // ── 建构型 (constructive) ─────────────────────────────────────────────
  {
    id: 'productive_failure',
    name: '有效失败',
    category: 'constructive',
    description: '先出超出当前能力的难题，答错后解释"这很正常"，用失败体验强化后续学习。',
    complexity: 'medium',
    effectSize: 'd=0.36',
    implemented: false,
    phase: 1,
  },
  {
    id: 'socratic',
    name: '苏格拉底追问',
    category: 'constructive',
    description: '5步连续追问链（是什么→为什么→如果不→还有呢→所以），引导学员自己推导出结论。',
    complexity: 'high',
    effectSize: 'd=0.82',
    implemented: false,
    phase: 1,
  },
  {
    id: 'counterfactual',
    name: '如果...会怎样',
    category: 'constructive',
    description: '案例讲完后进行情景假设推演，训练因果推理和系统思维能力。',
    complexity: 'high',
    effectSize: null,
    implemented: false,
    phase: 1,
  },

  // ── 迁移型 (transfer) ─────────────────────────────────────────────────
  {
    id: 'transfer',
    name: '迁移应用',
    category: 'transfer',
    description: '完整模块学完后迁移到自己的真实工作场景，检验知识内化程度。',
    complexity: 'medium',
    effectSize: null,
    implemented: true,
    phase: 1,
  },
  {
    id: 'summary',
    name: '一句话总结',
    category: 'transfer',
    description: '限字数精炼输出（如"用一句话概括核心观点"），训练信息压缩与本质提取能力。',
    complexity: 'low',
    effectSize: 'd=0.79',
    implemented: false,
    phase: 1,
  },
  {
    id: 'role_play',
    name: '角色扮演',
    category: 'transfer',
    description: '学员扮演管理者进行决策模拟，在安全环境中练习高风险对话和判断。',
    complexity: 'high',
    effectSize: null,
    implemented: false,
    phase: 1,
  },

  // ── 体验型 (experiential) ─────────────────────────────────────────────
  {
    id: 'branch_scenario',
    name: '分支剧情',
    category: 'experiential',
    description: '不同选择导向不同结局的互动叙事，让学员体验决策后果的多路径展开。',
    complexity: 'high',
    effectSize: null,
    implemented: false,
    phase: 1,
  },
];

// ---------------------------------------------------------------------------
// 完整33类型清单（Phase 2+）— 8大类 A-H
// ---------------------------------------------------------------------------

/** @type {InteractionType[]} */
export const FULL_INTERACTION_INVENTORY = [
  // ── A 检测型 (5) ──────────────────────────────────────────────────────
  {
    id: 'predict',
    name: '先猜再讲',
    category: 'A_testing',
    description: '揭示答案前让学员预测结果，激活先验知识并制造认知好奇。',
    complexity: 'low',
    effectSize: null,
    implemented: true,
    phase: 1,
  },
  {
    id: 'recall',
    name: '即时回忆',
    category: 'A_testing',
    description: '关键知识点讲完后立刻要求回忆，利用测试效应巩固记忆。',
    complexity: 'low',
    effectSize: null,
    implemented: true,
    phase: 1,
  },
  {
    id: 'misconception_check',
    name: '误解陷阱',
    category: 'A_testing',
    description: '呈现常见错误观点让学员判断对错，精准暴露顽固误解。',
    complexity: 'medium',
    effectSize: 'd=0.99',
    implemented: true,
    phase: 1,
  },
  {
    id: 'interleaved_test',
    name: '交错测试',
    category: 'A_testing',
    description: '混合不同主题的测试题，打破单一练习的惯性，提升辨别与长期保持。',
    complexity: 'medium',
    effectSize: null,
    implemented: false,
    phase: 2,
  },
  {
    id: 'confidence_check',
    name: '信心校准',
    category: 'A_testing',
    description: '选择答案后标注信心等级（猜/有点把握/确定），校准元认知准确性。',
    complexity: 'low',
    effectSize: null,
    implemented: false,
    phase: 1,
  },

  // ── B 引导型 (4) ──────────────────────────────────────────────────────
  {
    id: 'socratic_chain',
    name: '苏格拉底追问链',
    category: 'B_guided',
    description: '5步连续追问（是什么→为什么→如果不→还有呢→所以），引导自主推导。',
    complexity: 'high',
    effectSize: 'd=0.82',
    implemented: false,
    phase: 1,
  },
  {
    id: 'scaffolding',
    name: '脚手架引导',
    category: 'B_guided',
    description: '将复杂问题拆为递进小步骤，逐步撤去支撑，直到学员独立完成。',
    complexity: 'medium',
    effectSize: null,
    implemented: false,
    phase: 2,
  },
  {
    id: 'analogy_bridge',
    name: '类比桥梁',
    category: 'B_guided',
    description: '用学员熟悉领域的类比解释陌生概念，降低认知门槛。',
    complexity: 'medium',
    effectSize: null,
    implemented: false,
    phase: 2,
  },
  {
    id: 'reverse_teaching',
    name: '反向教学',
    category: 'B_guided',
    description: '让学员向AI解释概念（费曼技巧），AI 扮演"不懂的学生"追问漏洞。',
    complexity: 'high',
    effectSize: null,
    implemented: false,
    phase: 2,
  },

  // ── C 反思型 (4) ──────────────────────────────────────────────────────
  {
    id: 'transfer',
    name: '迁移应用',
    category: 'C_reflective',
    description: '完整模块学完后迁移到自己的真实工作场景，检验知识内化程度。',
    complexity: 'medium',
    effectSize: null,
    implemented: true,
    phase: 1,
  },
  {
    id: 'before_after',
    name: '前后对比',
    category: 'C_reflective',
    description: '学习前后分别回答同一问题，直观感受认知变化。',
    complexity: 'low',
    effectSize: null,
    implemented: false,
    phase: 2,
  },
  {
    id: 'one_line_summary',
    name: '一句话总结',
    category: 'C_reflective',
    description: '限字数精炼输出，训练信息压缩与本质提取能力。',
    complexity: 'low',
    effectSize: 'd=0.79',
    implemented: false,
    phase: 1,
  },
  {
    id: 'counterfactual',
    name: '如果...会怎样',
    category: 'C_reflective',
    description: '案例讲完后进行情景假设推演，训练因果推理和系统思维能力。',
    complexity: 'high',
    effectSize: null,
    implemented: false,
    phase: 1,
  },

  // ── D 有效失败 (4) ─────────────────────────────────────────────────────
  {
    id: 'opening_challenge',
    name: '开场挑战',
    category: 'D_productive_failure',
    description: '课程开始就抛超纲难题，制造"知道自己不知道"的心理准备。',
    complexity: 'medium',
    effectSize: 'd=0.36',
    implemented: false,
    phase: 1,
  },
  {
    id: 'retry_variant',
    name: '变式重试',
    category: 'D_productive_failure',
    description: '答错后换一种问法再试，检验是"没学会"还是"没理解题目"。',
    complexity: 'medium',
    effectSize: null,
    implemented: false,
    phase: 2,
  },
  {
    id: 'error_consequence',
    name: '错误后果展示',
    category: 'D_productive_failure',
    description: '展示错误决策在真实场景中的后果链条，强化纠错动机。',
    complexity: 'high',
    effectSize: null,
    implemented: false,
    phase: 2,
  },
  {
    id: 'cognitive_conflict',
    name: '认知冲突',
    category: 'D_productive_failure',
    description: '呈现与学员当前信念矛盾的证据，触发概念转变。',
    complexity: 'high',
    effectSize: null,
    implemented: false,
    phase: 2,
  },

  // ── E 游戏化 (5) ──────────────────────────────────────────────────────
  {
    id: 'timed_challenge',
    name: '限时挑战',
    category: 'E_gamified',
    description: '倒计时选择题，用时间压力激活专注力，适合事实性知识快速巩固。',
    complexity: 'low',
    effectSize: null,
    implemented: false,
    phase: 1,
  },
  {
    id: 'combo_score',
    name: '连击计分',
    category: 'E_gamified',
    description: '连续答对累积分数倍率，激发心流和挑战欲望。',
    complexity: 'low',
    effectSize: null,
    implemented: false,
    phase: 2,
  },
  {
    id: 'achievement_badge',
    name: '成就徽章',
    category: 'E_gamified',
    description: '达成特定学习里程碑时颁发徽章，提供外在激励和进度可视化。',
    complexity: 'low',
    effectSize: null,
    implemented: false,
    phase: 2,
  },
  {
    id: 'mastery_gate',
    name: '掌握度关卡',
    category: 'E_gamified',
    description: '必须达到一定正确率才能解锁下一关，保证知识扎实度。',
    complexity: 'medium',
    effectSize: null,
    implemented: false,
    phase: 2,
  },
  {
    id: 'leaderboard',
    name: '排行榜',
    category: 'E_gamified',
    description: '同组学员学习进度排名（可选匿名），利用社交比较驱动学习。',
    complexity: 'low',
    effectSize: null,
    implemented: false,
    phase: 2,
  },

  // ── F 情境模拟 (4) ─────────────────────────────────────────────────────
  {
    id: 'role_play',
    name: '角色扮演',
    category: 'F_simulation',
    description: '学员扮演管理者进行决策模拟，在安全环境中练习高风险对话和判断。',
    complexity: 'high',
    effectSize: null,
    implemented: false,
    phase: 1,
  },
  {
    id: 'branch_story',
    name: '分支剧情',
    category: 'F_simulation',
    description: '不同选择导向不同结局的互动叙事，让学员体验决策后果的多路径展开。',
    complexity: 'high',
    effectSize: null,
    implemented: false,
    phase: 1,
  },
  {
    id: 'dialogue_sim',
    name: '对话模拟',
    category: 'F_simulation',
    description: 'AI 扮演下属/上级/客户，学员练习真实管理对话场景。',
    complexity: 'high',
    effectSize: null,
    implemented: false,
    phase: 2,
  },
  {
    id: 'decision_tree',
    name: '决策树推演',
    category: 'F_simulation',
    description: '可视化呈现决策分支和概率，训练结构化决策思维。',
    complexity: 'high',
    effectSize: null,
    implemented: false,
    phase: 2,
  },

  // ── G 社交型 (3) ──────────────────────────────────────────────────────
  {
    id: 'opinion_poll',
    name: '观点投票',
    category: 'G_social',
    description: '匿名收集全班观点后展示分布，让学员看到多元视角。',
    complexity: 'low',
    effectSize: null,
    implemented: false,
    phase: 2,
  },
  {
    id: 'peer_explain',
    name: '同伴互讲',
    category: 'G_social',
    description: '配对学员互相讲解各自理解，通过教学相长加深记忆。',
    complexity: 'medium',
    effectSize: null,
    implemented: false,
    phase: 2,
  },
  {
    id: 'anonymous_wall',
    name: '匿名提问墙',
    category: 'G_social',
    description: '学员匿名提交疑问，AI 整理聚类后逐一解答，降低提问心理门槛。',
    complexity: 'low',
    effectSize: null,
    implemented: false,
    phase: 2,
  },

  // ── H 自适应 (4) ──────────────────────────────────────────────────────
  {
    id: 'dynamic_difficulty',
    name: '动态难度调节',
    category: 'H_adaptive',
    description: '根据连续答题表现实时调整题目难度，保持在最近发展区。',
    complexity: 'medium',
    effectSize: null,
    implemented: false,
    phase: 2,
  },
  {
    id: 'smart_retry',
    name: '智能重试',
    category: 'H_adaptive',
    description: '答错的题目间隔一段时间后以变式重新出现，利用间隔重复效应。',
    complexity: 'medium',
    effectSize: null,
    implemented: false,
    phase: 2,
  },
  {
    id: 'weakness_drill',
    name: '薄弱点专练',
    category: 'H_adaptive',
    description: '自动识别薄弱知识点并生成针对性练习题集。',
    complexity: 'medium',
    effectSize: null,
    implemented: false,
    phase: 2,
  },
  {
    id: 'emotion_adaptive',
    name: '情绪自适应',
    category: 'H_adaptive',
    description: '感知学员情绪状态（沮丧/焦虑/兴奋），动态调整互动方式和鼓励策略。',
    complexity: 'high',
    effectSize: null,
    implemented: false,
    phase: 2,
  },
];

// ---------------------------------------------------------------------------
// 当前已实现的类型（快速查询集合）
// ---------------------------------------------------------------------------

/** @type {string[]} */
export const CURRENTLY_IMPLEMENTED = [
  'predict',
  'recall',
  'misconception_check',
  'transfer',
];

// ---------------------------------------------------------------------------
// 错误响应矩阵 — 5种错误类型 → 应对策略
// ---------------------------------------------------------------------------

/** @type {Record<string, ErrorResponse>} */
export const ERROR_RESPONSE_MATRIX = {
  lucky_guess: {
    type: 'lucky_guess',
    name: '蒙对',
    description: '答案正确但推理过程不成立，属于虚假掌握。',
    strategy: '追问推理过程验证理解深度，不被表面正确率误导。',
    examples: [
      '答对了！不过我很好奇——你是怎么想到这个答案的？',
      '你选对了，能说说排除其他选项的理由吗？',
    ],
  },
  knowledge_gap: {
    type: 'knowledge_gap',
    name: '知识空白',
    description: '缺少必要的前置知识，不是理解错而是根本没学过。',
    strategy: '脚手架引导，从更基础的概念补起，不在当前层硬教。',
    examples: [
      '这个概念需要先理解XX，我们先花一分钟回顾一下。',
      '没关系，这块我们还没讲到。让我从头说起——',
    ],
  },
  stubborn_misconception: {
    type: 'stubborn_misconception',
    name: '顽固误解',
    description: '反复出现的错误信念，简单纠正无法撼动。',
    strategy: '概念转变程序：先暴露错误信念 → 呈现矛盾证据 → 引导重建。',
    examples: [
      '很多人都这么想，但我们来看一个反例——',
      '如果你的理解是对的，那这种情况怎么解释？',
    ],
  },
  careless: {
    type: 'careless',
    name: '粗心',
    description: '知识已掌握但因注意力疏忽答错，不需要重新教学。',
    strategy: '提示"再看看？"给第二次机会，不过度反应。',
    examples: [
      '嗯，再仔细看看题目？',
      '你确定吗？我觉得你知道答案，再想想。',
    ],
  },
  repeated_failure: {
    type: 'repeated_failure',
    name: '反复答错',
    description: '同一知识点连续多次答错，学员可能已产生挫败感。',
    strategy: '降低难度 + 换题型 + 给予鼓励，防止习得性无助。',
    examples: [
      '换个角度来看这个问题——',
      '这块确实不好理解，我们换一种方式试试。',
      '没事，很多有经验的管理者也在这个点上卡过。',
    ],
  },
};

// ---------------------------------------------------------------------------
// AI 主动干预信号 — 6种信号 → 响应模式
// ---------------------------------------------------------------------------

/** @type {ProactiveSignal[]} */
export const AI_PROACTIVE_SIGNALS = [
  {
    type: 'confusion',
    name: '困惑',
    trigger: '学员表达"不太明白"、"什么意思"或回答与题目无关。',
    response: '主动简化解释，缩小范围定位困惑点。',
    examples: [
      '哪个部分不太清楚？是概念本身还是应用场景？',
      '我换个方式说——',
    ],
  },
  {
    type: 'silence',
    name: '沉默',
    trigger: '学员超过30秒无响应（对话场景中）。',
    response: '给出提示或降低难度，不施加压力。',
    examples: [
      '需要我给个提示吗？',
      '没关系，这个问题我们可以拆开来想——第一步是什么？',
    ],
  },
  {
    type: 'engagement',
    name: '投入',
    trigger: '快速且连续正确作答，回复详细、主动追问。',
    response: '识别心流状态，加大难度挑战，不打断节奏。',
    examples: [
      '你理解得很扎实，来一个更有挑战的——',
      '既然基础很清楚了，我们往深了走一步。',
    ],
  },
  {
    type: 'incomprehension',
    name: '术语不懂',
    trigger: '学员对专业术语表达疑惑或使用错误的术语。',
    response: '用日常语言和类比替代术语解释。',
    examples: [
      '简单说就是——',
      '打个比方，这就像是...',
    ],
  },
  {
    type: 'mastery',
    name: '已掌握',
    trigger: '连续多题全部正确且信心标注为"确定"。',
    response: '确认掌握，跳过当前模块进入下一阶段，节省时间。',
    examples: [
      '这块你已经很扎实了，我们直接进入下一个主题。',
      '看得出来你对这个很熟悉，不浪费你时间了。',
    ],
  },
  {
    type: 'hesitation',
    name: '犹豫',
    trigger: '学员给出答案但附加"不太确定"、"应该是吧"等犹豫表达。',
    response: '给选项缩小范围，或提供排除法引导。',
    examples: [
      '你在A和B之间犹豫？我们来看看两者的关键区别——',
      '先排除掉你觉得一定不对的，剩下的再分析。',
    ],
  },
];

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

/**
 * 按分类获取核心互动类型
 * @param {string} categoryId - 分类 id（如 'testing', 'constructive'）
 * @returns {InteractionType[]}
 */
export function getTypesByCategory(categoryId) {
  return CORE_INTERACTION_TYPES.filter((t) => t.category === categoryId);
}

/**
 * 检查某互动类型是否已实现
 * @param {string} typeId - 互动类型 id
 * @returns {boolean}
 */
export function isImplemented(typeId) {
  return CURRENTLY_IMPLEMENTED.includes(typeId);
}

/**
 * 获取错误类型对应的响应策略
 * @param {string} errorType - 错误类型标识
 * @returns {ErrorResponse|undefined}
 */
export function getErrorResponse(errorType) {
  return ERROR_RESPONSE_MATRIX[errorType];
}

/**
 * 获取主动信号对应的响应模式
 * @param {string} signalType - 信号类型标识
 * @returns {ProactiveSignal|undefined}
 */
export function getProactiveResponse(signalType) {
  return AI_PROACTIVE_SIGNALS.find((s) => s.type === signalType);
}
