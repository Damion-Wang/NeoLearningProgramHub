/**
 * CoachQuestioningSkill - AI教练提问行为约束模块
 *
 * 理论基础：
 *   - Sweller 认知负荷理论：核心不是限制问题数量，而是控制认知资源的协调成本
 *     → 同一认知链上的渐进问题不增加额外负荷（内在负荷）
 *     → 不相关的并列问题大幅增加协调成本（外在负荷）
 *   - Vygotsky 脚手架理论：提问前先搭建锚点（诠释/观察），降低认知跳跃
 *   - Bloom 认知分类：问题类型随对话深度递进（记忆→理解→分析→评价→创造）
 *   - Dreyfus 五阶段：根据用户能力阶段调整脚手架深度
 *
 * 核心设计理念：
 *   关键不是"最多几个问题"，而是"问题之间是否构成认知链"。
 *   "发生了什么 → 你当时感受如何 → 你从中学到了什么" 即使3个问题也不会过载，
 *   因为它们沿同一条认知路径渐进深入。
 *   相反，2个无关维度的问题反而消耗更多认知资源。
 *
 * 核心输出：
 *   buildQuestioningConstraints() → 约束参数
 *   generateQuestioningPromptSection() → 可注入system prompt的指令文本
 */

// ============================================================
// 问题类型分类（Bloom认知层次对应）
// ============================================================

export const QuestionType = {
  CLARIFICATION: 'clarification',     // 澄清类：还原事实、确认理解（Bloom: Remember/Understand）
  DEEPENING: 'deepening',             // 深化类：追问原因、探索模式（Bloom: Analyze）
  REFLECTIVE: 'reflective',           // 反思类：自我觉察、价值审视（Bloom: Evaluate）
  HYPOTHETICAL: 'hypothetical',       // 假设类：情景推演、换位思考（Bloom: Apply/Create）
  ACTIONABLE: 'actionable',           // 行动类：具体步骤、承诺计划（Bloom: Create）
};

// ============================================================
// 脚手架深度
// ============================================================

export const ScaffoldingDepth = {
  FULL: 'full',           // 完整脚手架：先解释概念→举例→再提问（Novice/Beginner）
  MODERATE: 'moderate',   // 中度脚手架：简要诠释→提问（Competent）
  BRIEF: 'brief',         // 简洁脚手架：一句过渡→提问（Proficient/Expert）
};

// ============================================================
// 认知链模式（对话阶段 → 推荐的渐进追问路径）
// ============================================================

const STAGE_COGNITIVE_CHAIN = {
  opening: {
    chainPattern: ['clarification'],
    rhythmHint: 1,
    scaffolding: true,
    description: '开场阶段：一个澄清问题，帮对方打开话题',
  },
  exploring: {
    chainPattern: ['clarification', 'deepening'],
    rhythmHint: 2,
    scaffolding: true,
    description: '探索阶段：从澄清事实自然过渡到追问原因，形成"是什么→为什么"的认知链',
  },
  deepening: {
    chainPattern: ['deepening', 'reflective'],
    rhythmHint: 2,
    scaffolding: true,
    description: '深化阶段：从分析原因过渡到自我觉察，形成"为什么→这意味着什么"的认知链',
  },
  insight: {
    chainPattern: ['reflective', 'hypothetical'],
    rhythmHint: 1,
    scaffolding: false,
    description: '顿悟阶段：聚焦一个有力的反思或假设问题，给对方空间去体会',
  },
  action: {
    chainPattern: ['actionable'],
    rhythmHint: 1,
    scaffolding: false,
    description: '行动阶段：聚焦一个明确的行动导向问题',
  },
  closing: {
    chainPattern: ['actionable'],
    rhythmHint: 1,
    scaffolding: false,
    description: '收尾阶段：一个收束性问题，帮对方明确下一步',
  },
};

// ============================================================
// Dreyfus 阶段 → 脚手架深度映射
// ============================================================

const DREYFUS_SCAFFOLDING = {
  novice: ScaffoldingDepth.FULL,
  advanced_beginner: ScaffoldingDepth.FULL,
  competent: ScaffoldingDepth.MODERATE,
  proficient: ScaffoldingDepth.BRIEF,
  expert: ScaffoldingDepth.BRIEF,
};

// ============================================================
// 负面情绪 → 认知负荷降级
// ============================================================

const NEGATIVE_EMOTIONS = new Set([
  'frustrated', 'discouraged', 'anxious',
]);

// ============================================================
// 核心函数
// ============================================================

/**
 * 根据对话上下文构建提问行为约束
 *
 * @param {string} conversationStage - 对话阶段（opening/exploring/deepening/insight/action/closing）
 * @param {string} emotionState - 用户情绪状态
 * @param {string} [dreyfusLevel='competent'] - 用户Dreyfus阶段
 * @returns {Object} 约束参数
 */
export function buildQuestioningConstraints(conversationStage, emotionState, dreyfusLevel = 'competent') {
  const stageChain = STAGE_COGNITIVE_CHAIN[conversationStage] || STAGE_COGNITIVE_CHAIN.exploring;
  const isNegativeEmotion = NEGATIVE_EMOTIONS.has(emotionState);

  // 认知链模式：推荐的问题递进路径
  const chainPattern = [...stageChain.chainPattern];

  // 节奏提示：建议的可见问题数（非硬限制，核心约束是连贯性）
  let rhythmHint = isNegativeEmotion ? 1 : stageChain.rhythmHint;
  const empathyFirst = isNegativeEmotion;

  // 脚手架深度（Dreyfus自适应）
  const scaffoldingDepth = DREYFUS_SCAFFOLDING[dreyfusLevel] || ScaffoldingDepth.MODERATE;
  const scaffoldingRequired = stageChain.scaffolding && scaffoldingDepth !== ScaffoldingDepth.BRIEF;

  // 兼容旧接口：保留 maxQuestions 和 questionTypes
  const maxQuestions = rhythmHint;
  const questionTypes = chainPattern.map(p => p);

  return {
    maxQuestions,
    questionTypes,
    chainPattern,
    rhythmHint,
    scaffoldingRequired,
    scaffoldingDepth,
    empathyFirst,
    conversationStage,
    dreyfusLevel,
  };
}

/**
 * 根据约束生成可注入system prompt的提问行为指令
 *
 * @param {Object} constraints - buildQuestioningConstraints 的返回值
 * @returns {string} prompt文本段落
 */
export function generateQuestioningPromptSection(constraints) {
  const {
    chainPattern,
    rhythmHint,
    scaffoldingRequired,
    scaffoldingDepth,
    empathyFirst,
  } = constraints;

  const lines = ['# 提问行为规范（认知连贯性控制）'];

  // 核心原则：认知链 > 数量限制
  lines.push('');
  lines.push('【核心原则】你的提问必须构成一条认知链——每个问题都是上一个的自然延伸，沿同一条思维路径渐进深入。');
  lines.push('好的认知链示例："发生了什么→你当时感受如何→你从中学到了什么"——逐步深入同一个话题。');
  lines.push('坏的反例："目标是什么？团队氛围怎样？"——两个无关维度，迫使对方在不同认知区域跳跃。');

  // 节奏控制
  lines.push('');
  if (rhythmHint === 1) {
    lines.push('【节奏】本轮适合聚焦一个有力的问题，给对方充分的思考空间。');
    lines.push('一个好问题胜过三个散乱的问题。让对方沉入思考，而不是疲于应对。');
  } else {
    lines.push(`【节奏】本轮可以沿认知链展开最多 ${rhythmHint} 个递进问题。`);
    lines.push('第二个问题必须是第一个的自然延伸（"在这种情况下...那你觉得..."），不要跳到新维度。');
    lines.push('如果对方的回答内容已经很丰富，一个聚焦的追问比两个问题更好。');
  }

  // 共情优先
  if (empathyFirst) {
    lines.push('');
    lines.push('【情绪优先】对方正处于情绪中。必须先共情回应——');
    lines.push('说出你听到了什么、你理解的感受。然后温和地提出一个问题。');
    lines.push('在情绪中人的认知带宽很窄，不要追问多个问题。');
  }

  // 脚手架：锚点 → 提问
  if (scaffoldingRequired) {
    lines.push('');
    lines.push('【脚手架锚点】提问前先给对方一个认知锚点，降低思维跳跃：');
    if (scaffoldingDepth === ScaffoldingDepth.FULL) {
      lines.push('- 先分享你从对方描述中捕捉到的关键观察（"我注意到你提到了..."）');
      lines.push('- 连接到一个相关概念或框架（"这让我想到..."）');
      lines.push('- 锚点就位后，再自然地提出问题');
    } else if (scaffoldingDepth === ScaffoldingDepth.MODERATE) {
      lines.push('- 先简要回应你听到的核心要点（1-2句）');
      lines.push('- 然后自然过渡到提问（"所以我想了解的是..."）');
    }
  }

  // 认知链路径引导
  const typeLabels = {
    [QuestionType.CLARIFICATION]: '澄清（帮对方理清事实和细节——"具体发生了什么？"）',
    [QuestionType.DEEPENING]: '深化（追问原因和深层模式——"你觉得背后的原因是什么？"）',
    [QuestionType.REFLECTIVE]: '反思（引导自我觉察——"回头看，你怎么评价自己当时的做法？"）',
    [QuestionType.HYPOTHETICAL]: '假设（情景推演拓宽思路——"如果重来一次，你会怎么做？"）',
    [QuestionType.ACTIONABLE]: '行动（推动下一步——"那你打算先从哪件事开始？"）',
  };

  lines.push('');
  lines.push('【推荐认知路径】本轮适合沿以下方向提问：');
  for (const type of chainPattern) {
    if (typeLabels[type]) {
      lines.push(`  → ${typeLabels[type]}`);
    }
  }
  if (chainPattern.length > 1) {
    lines.push('按顺序构成递进链，后一个问题基于前一个的回答自然展开。');
  }

  // 反模式
  lines.push('');
  lines.push('【避免】');
  lines.push('- 不要并列抛出多个无关维度的问题（"目标是什么？沟通怎么样？团队氛围呢？"）');
  lines.push('- 不要在回复末尾堆砌问题，让对方无从选择回答哪个');
  lines.push('- 不要用编号列举问题（"第一...第二...第三..."），这不是教练对话的节奏');
  lines.push('- 如果你想问两个不同维度的问题，只问当前最重要的那个，另一个留到下一轮');

  return lines.join('\n');
}
