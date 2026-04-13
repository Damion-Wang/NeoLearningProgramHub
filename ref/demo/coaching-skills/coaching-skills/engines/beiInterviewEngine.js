import { buildQuestionFollowupHint } from './beiCompetencyFramework';

// ============================================================
// BEI 访谈问题序列
// 设计依据：BEI Standards (McBer/Hay) 四维探针模型 + STAR结构
// 关键改进：增加负面事件(标准要求正反各≥1个)、强化DSTF探针
// ============================================================

// BEI 更新模式题目（岗位变动时仅问3题）
export const BEI_UPDATE_QUESTION_IDS = ['position', 'keyTasks', 'growthFocus'];

export const BEI_INTERVIEW_QUESTIONS = [
  {
    id: 'position',
    category: 'basic-info',
    purpose: '确认岗位边界（岗位、团队、汇报关系），用于后续训练映射',
    maxFollowupRounds: 1,
    label: '岗位信息',
    prompt: '你当前负责什么岗位？带多少人？向谁汇报？',
    placeholder: '示例：华东大区总经理，管理6支团队，向全国销售总经理汇报。'
  },
  {
    id: 'keyTasks',
    category: 'task-context',
    purpose: '识别近三个月核心任务，用于个性化任务清单',
    maxFollowupRounds: 1,
    label: '关键任务',
    prompt: '过去3个月，你最关键的3项任务是什么？',
    placeholder: '建议分行输入：\n任务1\n任务2\n任务3'
  },
  {
    id: 'criticalEvent',
    category: 'behavior-event',
    purpose: '获取正面行为证据（情境-行为-结果+对话/思考/感受）用于能力评估',
    maxFollowupRounds: 3,
    label: '成功事件（BEI）',
    prompt: '请讲一件你自己处理得比较成功的管理事件。按"情境→你做了什么→结果"来讲，尽量回忆当时的具体对话和你的想法。',
    placeholder: '情境：...\n我做了：...\n我当时对XX说："..."（尽量回忆原话）\n我当时在想：...\n结果：...（带数据）'
  },
  {
    id: 'negativeEvent',
    category: 'behavior-event',
    purpose: '获取负面/挫折行为证据，配合正面事件交叉验证能力模式',
    maxFollowupRounds: 2,
    label: '挫折事件（BEI）',
    prompt: '请再讲一件你觉得处理得不够理想的管理事件。同样按"情境→你做了什么→结果"来讲，重点回忆当时的想法和之后的反思。',
    placeholder: '情境：...\n我做了：...\n我当时在想：...\n结果（不太理想）：...\n事后我的反思：...'
  },
  {
    id: 'successFactors',
    category: 'decision-model',
    purpose: '提炼岗位成功要素，用于最佳实践匹配',
    maxFollowupRounds: 1,
    label: '关键成功要素',
    prompt: '你认为这个岗位做得好的3个关键要素是什么？',
    placeholder: '示例：目标拆解、跨部门协同、团队辅导。'
  },
  {
    id: 'growthFocus',
    category: 'growth-target',
    purpose: '明确90天提升重点和优先级依据',
    maxFollowupRounds: 1,
    label: '90天成长焦点',
    prompt: '未来90天你最希望提升的2-3项能力是什么？为什么是这些？',
    placeholder: '示例：向上沟通、会议引导、复盘能力。'
  }
];

const splitItems = (text, maxCount = 5) =>
  String(text || '')
    .split(/\n|；|;|，|,/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxCount);

const pickSnippet = (text, regex, fallback) => {
  const match = String(text || '').match(regex);
  if (!match) return fallback;
  return String(match[1] || match[0] || '').trim().slice(0, 60);
};

// ============================================================
// BEI标准四维探针检测（DSTF: Did/Said/Thought/Felt）
// ============================================================

/** 检测是否使用"我们"而非"我"（BEI标准：拒绝接受we代替I） */
export const detectWeNotI = (text) => {
  const weCount = (text.match(/我们/g) || []).length;
  const iCount = (text.match(/(?<![我们])我(?!们)/g) || []).length;
  return weCount > 0 && iCount < weCount;
};

/** 检测概括性陈述（BEI标准：拒绝"我通常/一般/总是"） */
export const detectGeneralization = (text) =>
  /(我通常|我一般|我总是|我都是|我习惯|每次都|一般来说|通常我|大多数时候)/i.test(text);

/** DSTF四维探针完整性检测 */
export const detectDSTF = (text) => {
  const hasAction = /(我做了|我先|我安排|我推动|我协调|我复盘|我沟通|我要求|我跟进|我识别|我拆解|我辅导|我组织|我推进|我决定|我提出|我主动)/i.test(text);
  const hasDialogue = /(我说|我问|我回|我告诉|我跟.*说|我当时说|"[^"]*"|「[^」]*」|原话)/i.test(text);
  const hasThinking = /(我想|我觉得|我判断|我认为|我考虑|我分析|我意识到|我在想|当时想|我的想法|我的思路)/i.test(text);
  const hasFeeling = /(感觉|感到|压力|焦虑|紧张|高兴|欣慰|沮丧|担心|着急|兴奋|很有成就|不安|信心)/i.test(text);
  return { hasAction, hasDialogue, hasThinking, hasFeeling };
};

const buildCriticalEventFollowup = (text, missing, context = {}) => {
  const parts = [];
  const keyTasks = splitItems(context.keyTasks, 2);
  if (keyTasks.length) {
    parts.push(`可以从你提到的「${keyTasks.join('」或「')}」里选一个展开。`);
  }
  // STAR基础维度——用口语化引导替代指令式模板
  if (missing.includes('情境')) parts.push('当时是什么情况？大概什么时间、目标是什么、团队多大？');
  if (missing.includes('行为')) parts.push('在这件事里，你自己具体做了什么？（不是团队做了什么，是你本人的动作）');
  if (missing.includes('结果')) parts.push('你做了之后，事情有什么变化？达成预期了吗？');
  if (missing.includes('关键数据')) {
    const resultHint = pickSnippet(text, /(完成率|转化率|商机|故障率|交付|回款)[^，。；]*/i, '');
    parts.push(resultHint
      ? `你提到了"${resultHint}"，能把具体数字补上吗？比如从多少到多少。`
      : '能给一两个数字吗？比如"从X提升到Y"或者"减少了X%"。');
  }
  // DSTF增强维度（BEI标准四维探针）
  if (missing.includes('对话原话')) parts.push('当时你跟对方具体说了什么？对方怎么回的？尽量回忆原话。');
  if (missing.includes('当时想法')) parts.push('做这个决定之前，你心里是怎么想的？基于什么判断？');
  if (missing.includes('感受反思')) parts.push('整个过程中你的感受怎样？现在回头看，有什么不同的想法吗？');
  // 不当模式纠正——温和但坚定
  if (missing.includes('主语模糊')) parts.push('你刚才说了不少"我们"——在这件事里，"你"具体做了哪些？');
  if (missing.includes('概括性陈述')) parts.push('这听起来更像是你平时的习惯做法。能讲一个发生在具体时间的真实事件吗？');
  return parts.join(' ');
};

export const detectUserQuestionInAnswer = (text) => {
  const source = String(text || '');
  return /[？?]/.test(source) || /(怎么|如何|为什么|请问|不太懂|能否|可否|帮我|什么意思)/.test(source);
};

export const shouldUseLlmProbe = (question, answerText, heuristic) => {
  if (detectUserQuestionInAnswer(answerText)) return true;
  if (question?.category === 'behavior-event') return true;
  if (question?.category === 'growth-target') return true;
  if (question?.category === 'decision-model') return true;
  return Boolean(heuristic?.needFollowup);
};

export const getQuestionMaxFollowupRounds = (question, fallback = 2) =>
  (Number.isFinite(question?.maxFollowupRounds) ? question.maxFollowupRounds : fallback);

export const evaluateQuestionFollowup = (question, answerText, context = {}) => {
  const text = String(answerText || '').trim();
  const questionId = question?.id;
  const category = question?.category;

  if (!text) return { needFollowup: true, followupQuestion: '请先给出你的核心回答。', facts: [], gaps: ['回答为空'] };

  if (questionId === 'position') {
    const hasPosition = /(经理|总监|负责人|主管|leader|head|vp|岗位|角色|总经理)/i.test(text);
    const hasTeamInfo = /(\d+\s*人|\d+\s*支团队|团队|部门|成员)/.test(text);
    const hasReportLine = /(汇报|向.*汇报|上级|老板|总经理|vp|ceo)/i.test(text);
    const missing = [];
    if (!hasPosition) missing.push('岗位名称');
    if (!hasTeamInfo) missing.push('团队规模');
    if (!hasReportLine) missing.push('汇报对象');
    if (!missing.length || missing.length === 1) return { needFollowup: false, followupQuestion: '', facts: [], gaps: [] };
    return { needFollowup: true, followupQuestion: buildQuestionFollowupHint(questionId, missing), facts: [], gaps: missing };
  }

  if (questionId === 'keyTasks') {
    const items = splitItems(text);
    if (items.length >= 2) return { needFollowup: false, followupQuestion: '', facts: [], gaps: [] };
    return { needFollowup: true, followupQuestion: buildQuestionFollowupHint(questionId, ['任务清单', '业务目标', '优先级']), facts: [], gaps: ['关键任务数量不足'] };
  }

  if (questionId === 'successFactors') {
    const items = splitItems(text);
    if (items.length >= 2) return { needFollowup: false, followupQuestion: '', facts: [], gaps: [] };
    return { needFollowup: true, followupQuestion: buildQuestionFollowupHint(questionId, ['要素名称', '实际行为', '验证方式']), facts: [], gaps: ['成功要素数量不足'] };
  }

  if (questionId === 'growthFocus') {
    const items = splitItems(text);
    const hasReason = /(因为|所以|原因|为了|希望|优先|P1|P2|P3)/i.test(text);
    if (items.length >= 2 && hasReason) return { needFollowup: false, followupQuestion: '', facts: [], gaps: [] };
    if (items.length < 2) {
      return {
        needFollowup: true,
        followupQuestion: buildQuestionFollowupHint(questionId, ['2-3项能力', '优先级', '原因/场景']),
        facts: [],
        gaps: ['成长焦点数量不足']
      };
    }
    return { needFollowup: true, followupQuestion: '你给出的方向可以。请再补一句“为什么优先做这些”。', facts: [], gaps: ['缺少优先级原因'] };
  }

  // 通用行为事件评估（criticalEvent + negativeEvent 共用）
  if (questionId === 'criticalEvent' || questionId === 'negativeEvent') {
    const hasSituation = /(情境|背景|当时|场景|项目|客户|会议|季度|本月|本周|目标|任务)/.test(text);
    const hasResult = /(结果|达成|提升|下降|完成|失败|成功|复盘|最终|后来)/.test(text);
    const hasData = /(\d+|百分比|%|个|条|人|月|季度)/.test(text);
    const dstf = detectDSTF(text);
    const hasWeNotI = detectWeNotI(text);
    const hasGeneralization = detectGeneralization(text);

    const missing = [];
    // STAR基础维度
    if (!hasSituation) missing.push('情境');
    if (!dstf.hasAction) missing.push('行为');
    if (!hasResult) missing.push('结果');
    if (!hasData) missing.push('关键数据');
    // DSTF增强维度（BEI标准四维探针）
    if (!dstf.hasDialogue && dstf.hasAction) missing.push('对话原话');
    if (!dstf.hasThinking && dstf.hasAction) missing.push('当时想法');
    if (!dstf.hasFeeling && questionId === 'negativeEvent') missing.push('感受反思');
    // 不当模式纠正
    if (hasWeNotI) missing.push('主语模糊');
    if (hasGeneralization) missing.push('概括性陈述');

    // STAR基础完整即可通过（DSTF由LLM深度追问补充）
    const starComplete = hasSituation && dstf.hasAction && hasResult && !hasWeNotI && !hasGeneralization;
    if (starComplete && missing.length <= 2) {
      return { needFollowup: false, followupQuestion: '', facts: [], gaps: missing };
    }
    return {
      needFollowup: true,
      followupQuestion: `${buildQuestionFollowupHint(questionId, missing)} ${buildCriticalEventFollowup(text, missing, context)}`.trim(),
      facts: [],
      gaps: missing
    };
  }

  if (category === 'basic-info') return { needFollowup: false, followupQuestion: '', facts: [], gaps: [] };
  return { needFollowup: false, followupQuestion: '', facts: [], gaps: [] };
};

