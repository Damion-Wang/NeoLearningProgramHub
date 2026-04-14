/**
 * 母课模板 — 8个新经理关键时刻
 *
 * 来源：course-workbench 研究文档（课程蓝图-新经理关键时刻.md）
 * 结构：8个关键时刻 × 5分钟微课 + AI对练
 *
 * 每个模板定义一个关键时刻（Key Moment）的完整教学设计，
 * 包括场景、方法论、AI对练设计、知识引用和前置依赖。
 * CGP 引擎根据模板生成可执行的教学程序。
 */

// ─── 学习阶段（4 Phases） ───────────────────────────────

/**
 * @typedef {Object} LearningPhase
 * @property {string} id - 阶段标识
 * @property {string} name - 阶段名称
 * @property {string} description - 阶段描述（从→到的转变）
 * @property {string[]} templateIds - 包含的课程模板 ID
 */

/** @type {LearningPhase[]} */
export const COURSE_PHASES = [
  {
    id: 'phase_1',
    name: '站稳脚跟',
    description: '从"我来了"到"我理顺了"',
    templateIds: ['KM1', 'KM2'],
  },
  {
    id: 'phase_2',
    name: '学会放手',
    description: '从"自己干"到"让别人干"到"出了问题怎么办"',
    templateIds: ['KM3', 'KM4'],
  },
  {
    id: 'phase_3',
    name: '应对复杂',
    description: '从"管下属"到"管平级"到"管上级"',
    templateIds: ['KM5', 'KM6'],
  },
  {
    id: 'phase_4',
    name: '赢得人心',
    description: '从"评估表现"到"留住人才"',
    templateIds: ['KM7', 'KM8'],
  },
];

// ─── 模块内部结构（5分钟时间分配） ────────────────────────

/**
 * @typedef {Object} ModuleSegment
 * @property {string} id - 段落标识
 * @property {string} name - 段落名称
 * @property {string} timeRange - 时间范围
 * @property {number} durationSec - 持续秒数
 * @property {string} purpose - 教学目的
 */

/**
 * 微课内部结构定义。
 * 前 5 分钟为结构化微课，之后进入 AI 对练（无时间限制）。
 *
 * @type {{ segments: ModuleSegment[], totalMicroCourseSec: number }}
 */
export const MODULE_STRUCTURE = {
  segments: [
    {
      id: 'hook',
      name: '场景沉浸',
      timeRange: '0:00-0:30',
      durationSec: 30,
      purpose: '用真实场景把学员拉进来',
    },
    {
      id: 'case_wrong',
      name: '典型错误做法',
      timeRange: '0:30-1:00',
      durationSec: 30,
      purpose: '展示常见错误，引发认知冲突',
    },
    {
      id: 'pause_failure',
      name: '有效失败互动',
      timeRange: '1:00-1:30',
      durationSec: 30,
      purpose: '让学员先犯错，激活深度加工',
    },
    {
      id: 'diagram',
      name: '核心方法论',
      timeRange: '1:30-2:30',
      durationSec: 60,
      purpose: '可视化呈现核心框架/模型',
    },
    {
      id: 'case_right',
      name: '正确做法对话演绎',
      timeRange: '2:30-3:30',
      durationSec: 60,
      purpose: '用对话形式演示正确做法',
    },
    {
      id: 'pause_check',
      name: '理解检测',
      timeRange: '3:30-4:00',
      durationSec: 30,
      purpose: '检验学员是否理解核心要点',
    },
    {
      id: 'compare',
      name: '错误vs正确对比',
      timeRange: '4:00-4:30',
      durationSec: 30,
      purpose: '并列对比强化记忆',
    },
    {
      id: 'recap',
      name: '总结+衔接AI对练',
      timeRange: '4:30-5:00',
      durationSec: 30,
      purpose: '收束要点，引导进入对练',
    },
    {
      id: 'ai_practice',
      name: 'AI对练',
      timeRange: '5:00+',
      durationSec: -1, // 无时间限制
      purpose: '沉浸式角色扮演练习，巩固技能迁移',
    },
  ],
  totalMicroCourseSec: 300, // 5分钟
};

// ─── 8 个母课模板 ──────────────────────────────────────

/**
 * @typedef {Object} PracticeDesign
 * @property {string} aiRole - AI 扮演的角色
 * @property {string} evaluationFocus - 考核重点
 * @property {string[]} [rounds] - 多轮设计（如 KM5 分两轮）
 * @property {boolean} [dynamicResponse] - AI 是否根据学员行为动态调整
 */

/**
 * @typedef {Object} CourseTemplate
 * @property {string} id - 模板唯一标识（KM1-KM8）
 * @property {string} title - 关键时刻标题
 * @property {string} phaseId - 所属学习阶段 ID
 * @property {string} scenario - 场景描述
 * @property {string} methodology - 核心方法论名称
 * @property {string} methodologyDetail - 方法论步骤简述
 * @property {PracticeDesign} practiceDesign - AI对练设计
 * @property {string} hookStyle - Hook 演绎风格
 * @property {string} diagramStyle - 方法论图解演绎风格
 * @property {string[]} knowledgeRefs - 知识库引用（课程蓝图中的编号）
 * @property {boolean} aiGenerationNeeded - 是否需要 AI 生成补充素材
 * @property {string} [aiGenerationNote] - AI 生成说明
 * @property {string[]} prerequisites - 前置课程 ID
 */

/** @type {CourseTemplate[]} */
export const COURSE_TEMPLATES = [
  // ── KM1: 第一次团队亮相 ──
  {
    id: 'KM1',
    title: '第一次团队亮相',
    phaseId: 'phase_1',
    scenario:
      '上任第一周团队自我介绍，老同事观望，新下属试探，竞争对手评估。',
    methodology: '首次亮相三步法',
    methodologyDetail: '倾听→定调→建信',
    practiceDesign: {
      aiRole: 'AI扮演含老资历同事和内部竞争对手的团队成员',
      evaluationFocus:
        '考核先问后讲、表达尊重、避免过早承诺',
    },
    hookStyle: '反常识讲法',
    diagramStyle: '三步拆解讲法',
    knowledgeRefs: ['1-1角色转身', '1-2攻克转型'],
    aiGenerationNeeded: true,
    aiGenerationNote: '首次亮相三步法需综合提炼，现有素材无完整框架',
    prerequisites: [],
  },

  // ── KM2: 接手一团乱麻 ──
  {
    id: 'KM2',
    title: '接手一团乱麻',
    phaseId: 'phase_1',
    scenario:
      '发现能力强态度消极+热情高技能不足+前任遗留deadline。',
    methodology: '紧急接手盘点法',
    methodologyDetail:
      '盘任务四象限→盘人Will-Skill→定策略四种带教',
    practiceDesign: {
      aiRole: 'AI展示8项待办+4位成员画像',
      evaluationFocus:
        '考核重要vs紧急判断、考虑意愿能力匹配',
    },
    hookStyle: '反常识讲法',
    diagramStyle: '三步拆解讲法',
    knowledgeRefs: ['1-3时间管理', '3-2 Will-Skill矩阵'],
    aiGenerationNeeded: true,
    aiGenerationNote: '需整合四象限+Will-Skill两工具为一个连贯流程',
    prerequisites: ['KM1'],
  },

  // ── KM3: 第一次把活儿交出去 ──
  {
    id: 'KM3',
    title: '第一次把活儿交出去',
    phaseId: 'phase_2',
    scenario:
      '方案客户下周要看，该交给小佳但上次出了问题。',
    methodology: '有效授权四部曲',
    methodologyDetail: '选对事→选对人→定计划R-R-C-F→给反馈',
    practiceDesign: {
      aiRole: 'AI扮演信心不足的小佳',
      evaluationFocus:
        '考核讲清背景、R-R-C-F协议、回应顾虑、提供支持',
    },
    hookStyle: '案例复盘讲法',
    diagramStyle: '技能操作讲法',
    knowledgeRefs: ['3-1有效授权', '1-2攻克转型'],
    aiGenerationNeeded: true,
    aiGenerationNote: '完整授权对话示范需 AI 生成',
    prerequisites: ['KM2'],
  },

  // ── KM4: 下属搞砸了 ──
  {
    id: 'KM4',
    title: '下属搞砸了',
    phaseId: 'phase_2',
    scenario:
      '小刘报表连续两周迟交，客户投诉，上次说"态度有问题"吵了起来。',
    methodology: '建设性反馈六步法',
    methodologyDetail:
      '说明影响→倾听→共识→方案→计划→跟踪（辅以BEST法）',
    practiceDesign: {
      aiRole: 'AI扮演小刘（有合理原因+自身问题并存）',
      evaluationFocus:
        '考核基于事实、先倾听、引导对方提方案、制定行动计划',
    },
    hookStyle: '误区纠偏讲法',
    diagramStyle: '三步拆解讲法',
    knowledgeRefs: ['中欧建设性反馈', '3-4反馈辅导', '5-4 BEST法'],
    aiGenerationNeeded: false,
    prerequisites: ['KM3'],
  },

  // ── KM5: 团队爆发冲突 ──
  {
    id: 'KM5',
    title: '团队爆发冲突',
    phaseId: 'phase_3',
    scenario:
      '产品组陆鹿和课程组戴卫因排期互相指责，升级到人身攻击。',
    methodology: '冲突处理铁律',
    methodologyDetail:
      '先处理情绪后解决问题 + ANBES利益沟通法',
    practiceDesign: {
      aiRole: 'AI扮演陆鹿和戴卫（两位冲突方）',
      evaluationFocus: '情绪安抚 + ANBES利益沟通',
      rounds: [
        '第1轮：分别安抚情绪',
        '第2轮：三方调解运用ANBES',
      ],
    },
    hookStyle: '案例复盘讲法',
    diagramStyle: '三步拆解讲法',
    knowledgeRefs: ['4-1管理冲突', 'DDI-CPTM104跨部门沟通'],
    aiGenerationNeeded: false,
    prerequisites: ['KM1', 'KM2', 'KM3', 'KM4'],
  },

  // ── KM6: 被上级挑战 ──
  {
    id: 'KM6',
    title: '被上级挑战',
    phaseId: 'phase_3',
    scenario:
      '季度汇报总监不耐烦打断"说重点"，脑子一片空白。',
    methodology: '三步GET高效汇报法',
    methodologyDetail: '明目的→立结构（金字塔原理）→讲方法',
    practiceDesign: {
      aiRole: 'AI扮演结果导向型上级，会打断、追问、表示不满',
      evaluationFocus:
        '考核结论先行、有结构、带方案',
    },
    hookStyle: '反常识讲法',
    diagramStyle: '三步拆解讲法',
    knowledgeRefs: ['4-3向上沟通'],
    aiGenerationNeeded: true,
    aiGenerationNote: '30秒电梯汇报范例需 AI 生成',
    prerequisites: ['KM5'],
  },

  // ── KM7: 绩效谈话变成对峙 ──
  {
    id: 'KM7',
    title: '绩效谈话变成对峙',
    phaseId: 'phase_4',
    scenario:
      '第一次绩效面谈，老赵无所谓/王美抱怨/陈刚沉默，话术全失效。',
    methodology: '汉堡式面谈流程',
    methodologyDetail: '肯定→改进→支持（辅以BEST反馈法）',
    practiceDesign: {
      aiRole: '三种角色可选：无所谓老赵 / 抱怨王美 / 沉默陈刚',
      evaluationFocus:
        '针对不同类型员工灵活调整面谈策略',
    },
    hookStyle: '案例复盘讲法',
    diagramStyle: '技能操作讲法',
    knowledgeRefs: ['5-4棘手绩效面谈', '5-3绩效提升'],
    aiGenerationNeeded: false,
    prerequisites: ['KM4'],
  },

  // ── KM8: 想留的人要走 ──
  {
    id: 'KM8',
    title: '想留的人要走',
    phaseId: 'phase_4',
    scenario:
      '能力最强的小张拿到offer打算月底离职。',
    methodology: 'GROW辅导模型',
    methodologyDetail: 'Goal→Reality→Options→Way Forward',
    practiceDesign: {
      aiRole: 'AI扮演小张（真实原因是缺乏成长+认可，非薪资）',
      evaluationFocus:
        '探索真实原因、运用GROW模型引导对话',
      dynamicResponse: true,
    },
    hookStyle: '反常识讲法',
    diagramStyle: '三步拆解讲法',
    knowledgeRefs: ['3-3 GROW法', '2-3因人而异激励'],
    aiGenerationNeeded: true,
    aiGenerationNote: '完整挽留对话范例需 AI 生成',
    prerequisites: ['KM7'],
  },
];

// ─── 16 个方法论工具交叉引用 ─────────────────────────────

/**
 * @typedef {Object} MethodologyTool
 * @property {number} index - 编号（1-16）
 * @property {string} name - 工具名称
 * @property {string} steps - 核心步骤
 * @property {string[]} usedInTemplates - 使用该工具的模板 ID
 */

/** @type {MethodologyTool[]} */
export const METHODOLOGY_REFERENCE = [
  {
    index: 1,
    name: '首次亮相三步法',
    steps: '倾听→定调→建信',
    usedInTemplates: ['KM1'],
  },
  {
    index: 2,
    name: '四象限法则',
    steps: 'A紧急重要/B重要不紧急/C紧急不重要/D不紧急不重要',
    usedInTemplates: ['KM2'],
  },
  {
    index: 3,
    name: 'Will-Skill矩阵',
    steps: '四类员工四种策略（指导/教练/激励/授权）',
    usedInTemplates: ['KM2'],
  },
  {
    index: 4,
    name: '有效授权四部曲',
    steps: '选事→选人→定计划→给反馈',
    usedInTemplates: ['KM3'],
  },
  {
    index: 5,
    name: 'R-R-C-F协议',
    steps: 'Results结果/Resources资源/Consequence后果/Feedback反馈',
    usedInTemplates: ['KM3'],
  },
  {
    index: 6,
    name: '建设性反馈六步法',
    steps: '说明→倾听→共识→方案→计划→跟踪',
    usedInTemplates: ['KM4'],
  },
  {
    index: 7,
    name: 'BEST反馈法',
    steps: 'Behavior行为→Effect后果→Suggestion建议→Tomorrow未来',
    usedInTemplates: ['KM4', 'KM7'],
  },
  {
    index: 8,
    name: 'ANBES利益沟通法',
    steps: 'Aim目标→Need需求→Bottom底线→Exchange交换→Solution方案',
    usedInTemplates: ['KM5'],
  },
  {
    index: 9,
    name: '3F模型',
    steps: 'Fact事实/Feeling感受/Focus聚焦',
    usedInTemplates: ['KM5'],
  },
  {
    index: 10,
    name: '金字塔原理',
    steps: '结论先行/以上统下/归类分组/逻辑推进',
    usedInTemplates: ['KM6'],
  },
  {
    index: 11,
    name: '三步GET汇报法',
    steps: 'Goal明目的→Expression立结构→Technique讲方法',
    usedInTemplates: ['KM6'],
  },
  {
    index: 12,
    name: '汉堡式面谈',
    steps: '肯定→改进→支持',
    usedInTemplates: ['KM7'],
  },
  {
    index: 13,
    name: 'EME分析法',
    steps: 'Employee员工/Manager主管/Environment环境',
    usedInTemplates: ['KM7'],
  },
  {
    index: 14,
    name: 'GROW辅导模型',
    steps: 'Goal目标/Reality现状/Options选项/Way Forward行动',
    usedInTemplates: ['KM8'],
  },
  {
    index: 15,
    name: '激励因素4问',
    steps: '最棒一天/最满意/最怀念/财务自由后',
    usedInTemplates: ['KM8'],
  },
  {
    index: 16,
    name: '70-20-10法则',
    steps: '70%实践/20%反馈/10%课堂',
    usedInTemplates: ['KM8'],
  },
];

// ─── Helper 函数 ────────────────────────────────────────

/**
 * 根据 ID 获取课程模板
 * @param {string} id - 模板 ID（如 'KM1'）
 * @returns {CourseTemplate|undefined}
 */
export function getTemplateById(id) {
  return COURSE_TEMPLATES.find((t) => t.id === id);
}

/**
 * 获取某学习阶段下的所有课程模板
 * @param {string} phaseId - 阶段 ID（如 'phase_1'）
 * @returns {CourseTemplate[]}
 */
export function getTemplatesByPhase(phaseId) {
  return COURSE_TEMPLATES.filter((t) => t.phaseId === phaseId);
}

/**
 * 获取某课程模板关联的所有方法论工具
 * @param {string} templateId - 模板 ID（如 'KM3'）
 * @returns {MethodologyTool[]}
 */
export function getMethodologiesForTemplate(templateId) {
  return METHODOLOGY_REFERENCE.filter((m) =>
    m.usedInTemplates.includes(templateId)
  );
}
