/**
 * 教学策略库 — 42条循证策略
 *
 * 来源：course-workbench 研究文档（教学策略库.md）
 * 六大分类：
 *   CG - 认知与记忆 (Cognition & Memory)
 *   NE - 叙事与情感 (Narrative & Emotion)
 *   IP - 互动与参与 (Interaction & Participation)
 *   CS - 课程结构 (Course Structure)
 *   TE - 技术增强 (Technology Enhanced)
 *   AF - 评估与反馈 (Assessment & Feedback)
 *
 * 消费方：教研引擎（spec-教研引擎.md）、老徐（LecturerPersona）
 */

/**
 * 策略分类定义
 * @type {Object.<string, {code: string, name: string, description: string, count: number}>}
 */
export const STRATEGY_CATEGORIES = {
  CG: {
    code: 'CG',
    name: '认知与记忆',
    description: '基于认知科学的记忆编码、提取和负荷管理策略',
    count: 8,
  },
  NE: {
    code: 'NE',
    name: '叙事与情感',
    description: '利用叙事结构和情绪机制增强学习动机与记忆留存',
    count: 7,
  },
  IP: {
    code: 'IP',
    name: '互动与参与',
    description: '通过主动参与、协作和社会化学习提升深度理解',
    count: 7,
  },
  CS: {
    code: 'CS',
    name: '课程结构',
    description: '课程组织、序列编排和学习路径的结构化设计',
    count: 7,
  },
  TE: {
    code: 'TE',
    name: '技术增强',
    description: '借助AI、多媒体和沉浸技术放大教学效果',
    count: 6,
  },
  AF: {
    code: 'AF',
    name: '评估与反馈',
    description: '形成性评价、即时反馈和精通学习的闭环机制',
    count: 7,
  },
};

/**
 * @typedef {Object} TeachingStrategy
 * @property {string} code - 策略编码，如 "CG-01"
 * @property {string} name - 策略中文名称
 * @property {string} category - 所属分类编码
 * @property {string} description - 1-2句中文描述
 * @property {string|null} effectSize - 效应量，如 "d=0.99"；无数据则为 null
 * @property {string} evidenceSummary - 简要证据来源描述（中文）
 * @property {string[]} applicableScenarios - 适用教学场景列表
 * @property {string[]} combinableWith - 推荐组合策略的编码列表
 * @property {string|null} cognitiveLevel - Bloom认知层级（记忆/理解/应用/分析/评价/创造），null表示跨层级
 */

/**
 * 42条循证教学策略
 * @type {TeachingStrategy[]}
 */
export const TEACHING_STRATEGIES = [
  // ═══════════════════════════════════════════════════════
  // CG — 认知与记忆 (8)
  // ═══════════════════════════════════════════════════════
  {
    code: 'CG-01',
    name: '六分钟分段法',
    category: 'CG',
    description: '将内容切分为6分钟片段，每段之间插入主动加工活动。MIT CSAIL研究显示超过6分钟后学习参与度急剧下降。',
    effectSize: null,
    evidenceSummary: 'MIT CSAIL研究：在线视频超6分钟参与度急剧下降，最佳片段长度6分钟以内',
    applicableScenarios: ['在线微课', '直播授课', '视频课程制作', '长内容拆分'],
    combinableWith: ['CG-03', 'NE-01', 'AF-03'],
    cognitiveLevel: null,
  },
  {
    code: 'CG-02',
    name: '间隔重复编排',
    category: 'CG',
    description: '按递增时间间隔重复呈现关键知识点，利用遗忘曲线规律强化长期记忆编码。',
    effectSize: 'SMD=0.78, d=0.54',
    evidenceSummary: '元分析SMD=0.78；间隔效应d=0.54，跨多项随机对照试验验证',
    applicableScenarios: ['知识记忆强化', '概念复习', '技能巩固', '课后复盘'],
    combinableWith: ['CG-03', 'CG-04', 'TE-04'],
    cognitiveLevel: '记忆',
  },
  {
    code: 'CG-03',
    name: '检索练习嵌入',
    category: 'CG',
    description: '每15-20分钟嵌入低风险主动回忆练习，迫使学员从记忆中提取信息而非被动重读。',
    effectSize: null,
    evidenceSummary: '检索练习研究：长期记忆提升50%，显著优于重复阅读和高亮标注',
    applicableScenarios: ['课堂嵌入测验', '知识点回顾', '翻转课堂课上环节', '自学检查点'],
    combinableWith: ['CG-01', 'CG-02', 'AF-03'],
    cognitiveLevel: '记忆',
  },
  {
    code: 'CG-04',
    name: '交错练习设计',
    category: 'CG',
    description: '混合不同类型的题目和练习，打破单一模式的掌握幻觉，促进辨别能力和迁移学习。',
    effectSize: null,
    evidenceSummary: '交错练习研究：有效防止掌握幻觉(illusion of competence)，提升迁移能力',
    applicableScenarios: ['综合练习设计', '考前复习', '技能辨别训练', '案例分析混排'],
    combinableWith: ['CG-02', 'CG-03', 'AF-02'],
    cognitiveLevel: '应用',
  },
  {
    code: 'CG-05',
    name: '有效失败设计',
    category: 'CG',
    description: '先让学生尝试解决超出当前能力的问题，在失败中激活先验知识结构，再引入正式教学。',
    effectSize: 'd=0.36',
    evidenceSummary: 'Kapur (2016) 有效失败研究：d=0.36，失败探索激活深层知识组装',
    applicableScenarios: ['新概念导入', '问题导向学习', '挑战性任务', '管理情境模拟'],
    combinableWith: ['NE-02', 'IP-03', 'AF-05'],
    cognitiveLevel: '分析',
  },
  {
    code: 'CG-06',
    name: '先直觉后符号',
    category: 'CG',
    description: '先通过可视化、类比和具象体验建立直觉理解，再引入正式定义和抽象符号。',
    effectSize: null,
    evidenceSummary: '多媒体学习研究：图文结合信息留存率达80%，远高于纯文字',
    applicableScenarios: ['抽象概念教学', '模型讲解', '框架引入', '理论到实践桥接'],
    combinableWith: ['NE-04', 'TE-02', 'CS-03'],
    cognitiveLevel: '理解',
  },
  {
    code: 'CG-07',
    name: '认知负荷控制',
    category: 'CG',
    description: '系统性减少外在认知负荷、管理内在认知负荷、增加关联认知负荷，优化工作记忆分配。',
    effectSize: null,
    evidenceSummary: 'Sweller认知负荷理论 + Mayer多媒体学习原则，数十年实证基础',
    applicableScenarios: ['复杂内容简化', '多媒体设计', '新手教学', '信息呈现优化'],
    combinableWith: ['CG-01', 'CG-06', 'TE-02'],
    cognitiveLevel: null,
  },
  {
    code: 'CG-08',
    name: '概念转变程序',
    category: 'CG',
    description: '先暴露学员的错误前概念，制造认知冲突，再引导构建正确心智模型。',
    effectSize: 'd=0.99',
    evidenceSummary: '概念转变研究：d=0.99，通过认知冲突颠覆错误前概念效果显著',
    applicableScenarios: ['纠正常见误解', '管理认知偏差', '反直觉知识教学', '心智模型重塑'],
    combinableWith: ['CG-05', 'NE-02', 'AF-05'],
    cognitiveLevel: '分析',
  },

  // ═══════════════════════════════════════════════════════
  // NE — 叙事与情感 (7)
  // ═══════════════════════════════════════════════════════
  {
    code: 'NE-01',
    name: '钩子开场',
    category: 'NE',
    description: '前10秒用提问、悬念或反直觉事实抓住注意力，触发多巴胺释放驱动好奇心。',
    effectSize: null,
    evidenceSummary: '注意力研究：开场10秒决定参与度，多巴胺-好奇心回路驱动持续关注',
    applicableScenarios: ['课程开场', '视频开头', '研讨会启动', '培训破冰'],
    combinableWith: ['NE-02', 'NE-03', 'CG-05'],
    cognitiveLevel: null,
  },
  {
    code: 'NE-02',
    name: '认知冲突催化',
    category: 'NE',
    description: '用反直觉的证据或数据打破学员预期，制造认知失调驱动深度思考。',
    effectSize: 'd=0.99',
    evidenceSummary: '认知冲突与概念转变研究：d=0.99，与CG-08共享证据基础',
    applicableScenarios: ['颠覆常识', '挑战假设', '批判性思维训练', '管理误区纠偏'],
    combinableWith: ['NE-01', 'CG-05', 'CG-08'],
    cognitiveLevel: '分析',
  },
  {
    code: 'NE-03',
    name: '三幕叙事结构',
    category: 'NE',
    description: '按"建置—对抗—解决"三幕结构组织内容，利用叙事弧线增强记忆编码和情感投入。',
    effectSize: null,
    evidenceSummary: '叙事记忆研究：故事结构记忆留存93% vs 死记硬背13%',
    applicableScenarios: ['案例教学', '课程整体编排', '培训故事线', '经验萃取呈现'],
    combinableWith: ['NE-01', 'NE-05', 'NE-06'],
    cognitiveLevel: '理解',
  },
  {
    code: 'NE-04',
    name: '从具体到宏大',
    category: 'NE',
    description: '从具体的人物、事件或场景出发，逐步引申到宏观原理和普适规律。',
    effectSize: null,
    evidenceSummary: '归纳学习研究：具体到抽象的认知路径符合自然学习规律',
    applicableScenarios: ['原理讲解', '从案例到理论', '管理哲学阐述', '经验提炼'],
    combinableWith: ['CG-06', 'NE-07', 'NE-01'],
    cognitiveLevel: '理解',
  },
  {
    code: 'NE-05',
    name: '悬念接力',
    category: 'NE',
    description: '每节课结尾刻意留下未解决的悬念，利用蔡格尼克效应驱动学员主动回归。',
    effectSize: null,
    evidenceSummary: '蔡格尼克效应(Zeigarnik Effect)：未完成任务的记忆留存显著高于已完成任务',
    applicableScenarios: ['系列课程衔接', '课后自学驱动', '长周期培训', '连载内容'],
    combinableWith: ['NE-03', 'CS-05'],
    cognitiveLevel: null,
  },
  {
    code: 'NE-06',
    name: 'S.T.A.R.高光时刻',
    category: 'NE',
    description: '每课设计1-2个震撼瞬间（Surprising/Thought-provoking/Aha/Resonating），利用情绪增强记忆编码。',
    effectSize: null,
    evidenceSummary: '情绪记忆研究：情绪唤醒显著增强长期记忆编码和提取',
    applicableScenarios: ['课程高潮设计', '关键知识点锚定', '培训体验峰值', '结业仪式'],
    combinableWith: ['NE-03', 'NE-02'],
    cognitiveLevel: null,
  },
  {
    code: 'NE-07',
    name: '人物故事承载',
    category: 'NE',
    description: '用真实人物故事承载抽象概念，通过人格化叙事建立情感连接和深层记忆。',
    effectSize: null,
    evidenceSummary: '叙事记忆研究：人物故事承载概念记忆留存率93%',
    applicableScenarios: ['领导力案例', '管理智慧传递', '文化价值观传播', '最佳实践分享'],
    combinableWith: ['NE-04', 'NE-03', 'NE-06'],
    cognitiveLevel: '理解',
  },

  // ═══════════════════════════════════════════════════════
  // IP — 互动与参与 (7)
  // ═══════════════════════════════════════════════════════
  {
    code: 'IP-01',
    name: '预测—验证循环',
    category: 'IP',
    description: '先让学员做出预测，再揭示实际结果，通过预期违背强化学习效果。',
    effectSize: 'd=0.47',
    evidenceSummary: '预测效应研究：d=0.47，预测行为激活更深层的认知加工',
    applicableScenarios: ['数据解读', '实验演示', '案例分析前', '管理决策推演'],
    combinableWith: ['NE-02', 'CG-03', 'AF-03'],
    cognitiveLevel: '分析',
  },
  {
    code: 'IP-02',
    name: '拼图合作学习',
    category: 'IP',
    description: '将学习材料分块分配给不同学员，各自精通后互相教授，实现教学相长。',
    effectSize: 'd=1.20',
    evidenceSummary: 'Jigsaw合作学习元分析：d=1.20，教学相长效应叠加同伴学习效应',
    applicableScenarios: ['团队培训', '研讨会', '大班教学', '跨部门知识共享'],
    combinableWith: ['IP-04', 'AF-01', 'CS-03'],
    cognitiveLevel: '评价',
  },
  {
    code: 'IP-03',
    name: '苏格拉底式追问',
    category: 'IP',
    description: '通过连续追问引导学员自行推导结论，不直接给出答案，培养批判性思维。',
    effectSize: 'd=0.82',
    evidenceSummary: '苏格拉底式教学元分析：d=0.82，追问深度与理解深度正相关',
    applicableScenarios: ['教练对话', '案例讨论', '概念澄清', '一对一辅导'],
    combinableWith: ['CG-05', 'IP-05', 'CS-07'],
    cognitiveLevel: '评价',
  },
  {
    code: 'IP-04',
    name: '同伴评审互教',
    category: 'IP',
    description: '学员按评审标准互相评价作品，在评审过程中深化自身理解。',
    effectSize: null,
    evidenceSummary: '同伴评审研究：教学相长效应显著，评审者学习收益常大于被评审者',
    applicableScenarios: ['作业互评', '方案评审', '演练观摩', '写作工坊'],
    combinableWith: ['IP-02', 'AF-01', 'CS-06'],
    cognitiveLevel: '评价',
  },
  {
    code: 'IP-05',
    name: '智囊团坦诚反馈',
    category: 'IP',
    description: '借鉴皮克斯"智囊团"三规则进行坦诚的群体反馈，在安全氛围下实现深度改进。',
    effectSize: 'd=0.73',
    evidenceSummary: '建设性反馈研究：d=0.73，皮克斯Braintrust模式的坦诚文化被广泛验证',
    applicableScenarios: ['方案评审', '创意迭代', '管理复盘', '团队反馈'],
    combinableWith: ['IP-03', 'CS-06', 'CS-07'],
    cognitiveLevel: '评价',
  },
  {
    code: 'IP-06',
    name: '悬念剧场探案',
    category: 'IP',
    description: '将知识点包装为待侦破的案件，学员扮演侦探角色，通过探案过程习得知识。',
    effectSize: null,
    evidenceSummary: '游戏化学习研究：79%教师确认探案式学习有效提升参与度和理解深度',
    applicableScenarios: ['问题诊断训练', '根因分析', '合规培训', '管理问题排查'],
    combinableWith: ['CG-05', 'NE-03', 'NE-05'],
    cognitiveLevel: '分析',
  },
  {
    code: 'IP-07',
    name: '分支决策学习',
    category: 'IP',
    description: '在关键节点设置决策分支，不同选择导向不同学习路径，体验因果关系。',
    effectSize: null,
    evidenceSummary: '分支模拟研究：决策驱动学习路径可提升成绩15-35%',
    applicableScenarios: ['情境模拟', '管理决策训练', '风险评估', '领导力发展'],
    combinableWith: ['TE-03', 'NE-03', 'AF-06'],
    cognitiveLevel: '评价',
  },

  // ═══════════════════════════════════════════════════════
  // CS — 课程结构 (7)
  // ═══════════════════════════════════════════════════════
  {
    code: 'CS-01',
    name: '翻转课堂',
    category: 'CS',
    description: '课前通过视频完成知识传递，课上时间用于讨论、练习和深度互动。',
    effectSize: 'd=0.47',
    evidenceSummary: '翻转课堂元分析：d=0.47，课上时间重新分配给高阶认知活动',
    applicableScenarios: ['混合式培训', '企业内训', '管理课程', '技能工坊'],
    combinableWith: ['CG-01', 'CS-07', 'AF-01'],
    cognitiveLevel: null,
  },
  {
    code: 'CS-02',
    name: '现象式跨学科学习',
    category: 'CS',
    description: '围绕真实现象或问题组织跨学科内容，打破学科壁垒实现整合性理解。',
    effectSize: null,
    evidenceSummary: '芬兰现象式学习实践：93%学生报告该方式更有学习动力',
    applicableScenarios: ['跨部门项目', '综合能力培养', '创新项目', '战略思维训练'],
    combinableWith: ['CS-06', 'NE-04', 'IP-02'],
    cognitiveLevel: '创造',
  },
  {
    code: 'CS-03',
    name: '脚手架渐进撤除',
    category: 'CS',
    description: '初期提供充分支持，随学员能力提升逐步撤除脚手架，最终实现独立完成。',
    effectSize: 'd=0.82',
    evidenceSummary: 'Vygotsky最近发展区+脚手架教学元分析：d=0.82',
    applicableScenarios: ['技能训练', '新手到熟手', '教练辅导', '渐进授权'],
    combinableWith: ['CG-06', 'AF-02', 'TE-04'],
    cognitiveLevel: '应用',
  },
  {
    code: 'CS-04',
    name: 'Bloom层级进阶',
    category: 'CS',
    description: '明确标注每个学习活动的认知层级，确保从记忆→理解→应用→分析→评价→创造的有序攀升。',
    effectSize: 'd=0.75',
    evidenceSummary: 'Bloom分类法应用研究：d=0.75，层级明确的课程设计显著提升高阶思维',
    applicableScenarios: ['课程设计', '学习目标编写', '评估对齐', '能力发展路径'],
    combinableWith: ['AF-02', 'CS-03', 'AF-06'],
    cognitiveLevel: null,
  },
  {
    code: 'CS-05',
    name: 'Netflix分块编排',
    category: 'CS',
    description: '标注时长和断点，支持断点续学，借鉴流媒体的分集消费模式降低学习门槛。',
    effectSize: null,
    evidenceSummary: '微学习研究：分块+可中断模式显著提升学习完成率和回归率',
    applicableScenarios: ['在线课程', '移动学习', '碎片化学习', '长周期项目'],
    combinableWith: ['CG-01', 'NE-05', 'AF-06'],
    cognitiveLevel: null,
  },
  {
    code: 'CS-06',
    name: '真实战役模式',
    category: 'CS',
    description: '从第一天起围绕真实问题展开学习，在解决实际挑战中习得知识和技能。',
    effectSize: null,
    evidenceSummary: 'High Tech High项目式学习：98%毕业率，真实问题驱动的学习效果显著',
    applicableScenarios: ['项目式学习', '在岗培训', '创业教育', '行动学习'],
    combinableWith: ['IP-05', 'IP-04', 'AF-06'],
    cognitiveLevel: '创造',
  },
  {
    code: 'CS-07',
    name: '智囊团研讨模式',
    category: 'CS',
    description: '零讲授、100%研讨，通过结构化讨论和同伴互动实现深度学习。',
    effectSize: 'd=0.82',
    evidenceSummary: '研讨式教学研究：d=0.82，完成率96%，纯研讨模式在特定场景效果极佳',
    applicableScenarios: ['高管研修', '领导力发展', '案例研讨', '战略工作坊'],
    combinableWith: ['CS-01', 'IP-03', 'IP-05'],
    cognitiveLevel: '评价',
  },

  // ═══════════════════════════════════════════════════════
  // TE — 技术增强 (6)
  // ═══════════════════════════════════════════════════════
  {
    code: 'TE-01',
    name: 'AI苏格拉底对话',
    category: 'TE',
    description: '让学生教AI（费曼教学法），AI通过追问暴露理解盲区，学习量翻倍。',
    effectSize: null,
    evidenceSummary: 'AI辅助费曼教学研究：学生教AI时学习量翻倍，理解深度显著提升',
    applicableScenarios: ['AI教练对话', '概念深化', '一对一辅导', '自学检验'],
    combinableWith: ['CG-03', 'AF-05', 'CG-05'],
    cognitiveLevel: '评价',
  },
  {
    code: 'TE-02',
    name: '视觉动画驱动',
    category: 'TE',
    description: '用动画可视化抽象概念和复杂过程，利用双编码效应增强理解和记忆。',
    effectSize: null,
    evidenceSummary: '多媒体学习研究：动画可视化信息留存率达80%，双编码理论支持',
    applicableScenarios: ['抽象概念讲解', '流程演示', '数据可视化', '复杂系统说明'],
    combinableWith: ['CG-06', 'CG-07', 'CG-01'],
    cognitiveLevel: '理解',
  },
  {
    code: 'TE-03',
    name: 'AI个性化学习路径',
    category: 'TE',
    description: '基于学员状态动态调整内容、难度和节奏，实现千人千面的个性化学习体验。',
    effectSize: null,
    evidenceSummary: 'AI自适应学习研究：个性化路径可提升成绩15-35%',
    applicableScenarios: ['自适应学习', '个人发展计划', '补救教学', '加速学习'],
    combinableWith: ['CG-02', 'AF-02', 'TE-04'],
    cognitiveLevel: null,
  },
  {
    code: 'TE-04',
    name: '闯关精通系统',
    category: 'TE',
    description: '借鉴RPG技能树设计精通门槛，学员必须达标才能解锁下一阶段。',
    effectSize: 'g=0.49',
    evidenceSummary: '游戏化学习元分析：g=0.49，精通门槛+可视化进度的组合效果显著',
    applicableScenarios: ['技能认证', '分级培训', '能力发展路径', '游戏化学习'],
    combinableWith: ['CG-02', 'AF-02', 'AF-03', 'AF-06'],
    cognitiveLevel: '应用',
  },
  {
    code: 'TE-05',
    name: '短视频微课',
    category: 'TE',
    description: '3-5分钟TikTok节奏的高密度微课，适配移动端碎片化学习习惯。',
    effectSize: null,
    evidenceSummary: '微学习研究：短视频格式记忆提升20%，完成率显著高于长视频',
    applicableScenarios: ['移动学习', '碎片化学习', '知识速递', '技能微训练'],
    combinableWith: ['CG-02', 'CS-05', 'AF-06'],
    cognitiveLevel: null,
  },
  {
    code: 'TE-06',
    name: 'VR/AR沉浸体验',
    category: 'TE',
    description: '利用三维虚拟/增强现实环境创造沉浸式学习体验，增强空间认知和情境记忆。',
    effectSize: 'g=0.85',
    evidenceSummary: 'VR/AR教育元分析：g=0.85，沉浸式体验在特定领域效果极其显著',
    applicableScenarios: ['高危场景模拟', '空间技能训练', '跨文化体验', '复杂设备操作'],
    combinableWith: ['NE-06', 'IP-01'],
    cognitiveLevel: '应用',
  },

  // ═══════════════════════════════════════════════════════
  // AF — 评估与反馈 (7)
  // ═══════════════════════════════════════════════════════
  {
    code: 'AF-01',
    name: '形成性评价嵌入',
    category: 'AF',
    description: '在学习过程中持续嵌入低风险评估，实时了解掌握程度并即时调整教学。',
    effectSize: 'd=0.90',
    evidenceSummary: '形成性评价元分析：d=0.90，是效应量最高的教学策略之一',
    applicableScenarios: ['课堂实时评估', '在线学习检查点', '教练过程评估', '项目里程碑评审'],
    combinableWith: ['CG-03', 'AF-03', 'AF-05'],
    cognitiveLevel: null,
  },
  {
    code: 'AF-02',
    name: '精通学习门槛',
    category: 'AF',
    description: '固定学习结果标准（>=90%掌握），灵活调整学习时间，确保每位学员真正精通。',
    effectSize: null,
    evidenceSummary: 'Bloom 2 Sigma问题：精通学习+一对一辅导可实现2个标准差的提升',
    applicableScenarios: ['认证考试', '关键技能培训', '安全合规', '精通导向课程'],
    combinableWith: ['TE-04', 'AF-03', 'CG-02'],
    cognitiveLevel: null,
  },
  {
    code: 'AF-03',
    name: '即时反馈',
    category: 'AF',
    description: '在每个学习行为后立即提供反馈，缩短反馈延迟，防止错误强化。',
    effectSize: 'd=0.73',
    evidenceSummary: '即时反馈研究：d=0.73，反馈延迟与学习效果呈负相关',
    applicableScenarios: ['在线练习', 'AI辅导', '技能训练', '模拟演练'],
    combinableWith: ['AF-02', 'CG-03', 'TE-04'],
    cognitiveLevel: null,
  },
  {
    code: 'AF-04',
    name: '总结提炼练习',
    category: 'AF',
    description: '要求学员用自己的语言概括所学内容，通过生成效应深化理解和记忆。',
    effectSize: 'd=0.79',
    evidenceSummary: '生成效应研究：d=0.79，自主概括显著优于被动接收',
    applicableScenarios: ['课后总结', '学习日志', '知识输出', '教学相长'],
    combinableWith: ['CG-03', 'AF-01'],
    cognitiveLevel: '理解',
  },
  {
    code: 'AF-05',
    name: '知识盲区诊断',
    category: 'AF',
    description: '系统性识别学员的知识盲区和理解缺口，为针对性补救提供精准定位。',
    effectSize: 'd=1.29',
    evidenceSummary: '诊断性评估研究：d=1.29，精准诊断+针对性干预是效应量最高的组合',
    applicableScenarios: ['学前诊断', '能力评估', '个性化学习路径规划', '补救教学定位'],
    combinableWith: ['CG-08', 'TE-01', 'AF-01'],
    cognitiveLevel: '分析',
  },
  {
    code: 'AF-06',
    name: '进步可视化',
    category: 'AF',
    description: '将学习轨迹和能力成长以可视化方式呈现，增强自我效能感和学习动机。',
    effectSize: null,
    evidenceSummary: '自我效能研究：进步可见性与学习动机正相关，可视化反馈增强坚持性',
    applicableScenarios: ['学习仪表盘', '能力雷达图', '成长轨迹', '目标追踪'],
    combinableWith: ['TE-04', 'AF-02', 'CS-04'],
    cognitiveLevel: null,
  },
  {
    code: 'AF-07',
    name: '获得感三需求设计',
    category: 'AF',
    description: '围绕能力感、自主感、归属感三大心理需求设计学习体验，系统性提升内在动机。',
    effectSize: 'R=0.751',
    evidenceSummary: '自我决定理论(SDT)实证：三需求满足与学习动机相关系数R=0.751',
    applicableScenarios: ['课程体验设计', '学习社区建设', '长周期培训', '组织学习文化'],
    combinableWith: ['AF-06', 'CS-03', 'IP-02'],
    cognitiveLevel: null,
  },
];

// ═══════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════

/**
 * 按分类编码筛选策略
 * @param {string} categoryCode - 分类编码，如 "CG"
 * @returns {TeachingStrategy[]}
 */
export function getStrategiesByCategory(categoryCode) {
  return TEACHING_STRATEGIES.filter((s) => s.category === categoryCode);
}

/**
 * 获取所有有明确效应量数据的策略（按效应量降序排列）
 * @returns {TeachingStrategy[]}
 */
export function getStrategiesWithEffectSize() {
  return TEACHING_STRATEGIES
    .filter((s) => s.effectSize !== null)
    .sort((a, b) => {
      const extractNumber = (str) => {
        const match = str.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
      };
      return extractNumber(b.effectSize) - extractNumber(a.effectSize);
    });
}

/**
 * 按策略编码查找单个策略
 * @param {string} code - 策略编码，如 "CG-01"
 * @returns {TeachingStrategy|undefined}
 */
export function getStrategyById(code) {
  return TEACHING_STRATEGIES.find((s) => s.code === code);
}

/**
 * 获取与指定策略推荐组合的策略列表
 * @param {string} code - 策略编码
 * @returns {TeachingStrategy[]} 推荐组合的策略对象列表
 */
export function getCombinable(code) {
  const strategy = getStrategyById(code);
  if (!strategy) return [];
  return strategy.combinableWith
    .map((c) => getStrategyById(c))
    .filter(Boolean);
}
