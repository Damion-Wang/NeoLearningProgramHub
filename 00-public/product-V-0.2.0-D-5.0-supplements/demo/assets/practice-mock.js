/* ============================================================
   Practice · MOCK DATA
   ACT-001-04 重构被动型员工 · 对练
   ------------------------------------------------------------
   学员 = 李明（设计部主管）
   Actor = 崔德莫（设计部资深设计师）
   默认进入 = 演练阶段第 2 轮 / 第 1 轮 mock 历史已渲染
   ============================================================ */

// 重复字段读 _shared/mock/project.js + Session（v1.2 工程纪律 A · DRY）
(function () {
  const _s = (window.Session && window.Session.get()) || {};
  const _name = _s.display || '赵工';
  const _p = window.PROJECT || {};

window.PRACTICE_MOCK = {
  // actingRole = 学员在剧本中扮演的角色（演练对话气泡 head 显示）
  learner: {
    name: _name,
    firstChar: _name.charAt(0),
    neoPersona: 'male',
    role: '区域销售主管 · 学员',
    actingRole: { name: '李明', title: '设计部主管', firstChar: '李' }
  },
  project: { name: _p.name || '基层管理者培训项目', weekIndex: _p.weekIndex || 6, weekTotal: _p.weekTotal || 26 },
  activity: {
    id: 'ACT-001-04',
    name: '重构被动型员工 · 对练',
    course: 'CRS-001 辅导型管理',
    type: 'practice'
  },

  // 4 阶段进度
  phaseStatus: [
    { id: 'P1', order: 1, type: 'INTRO',     name: '情景导入',  status: 'current',  meta: '场景 / 角色 / 任务 / 资源 / 工具' },
    { id: 'P2', order: 2, type: 'ROLEPLAY',  name: '角色扮演',  status: 'locked',   meta: '与崔德莫演练 · 4 轮对话' },
    { id: 'P3', order: 3, type: 'REVIEW',    name: '反思复盘',  status: 'locked',   meta: '苏格拉底追问 + 必给总结' },
    { id: 'P4', order: 4, type: 'REPORT',    name: '能力报告',  status: 'locked',   meta: '5 维评分 + 高光 + 提升建议' }
  ],

  // Actor 配置（崔德莫）
  actor: {
    id: 'actor-zhao',
    name: '崔德莫',
    role: '设计部资深设计师',
    baseImage: 'assets/actor-peace.png',  // 崔德莫人物图（demo 阶段用平和构图作基底）
    expressions: {
      submissive: 'assets/actor-peace.png',    // 顺从（平和）
      engaged:    'assets/actor-peace.png',    // 投入（暂用同图 · 后续替换）
      aloof:      'assets/actor-angry.png',    // 冷漠（暂用同图）
      resistant:  'assets/actor-angry.png'     // 抵抗（愤怒）
    },
    // 5 维背景资料（区 ③ 折叠）
    background: '32 岁，入职 4 年，业务专业能力强。最近半年明显消极——拖延、表面服从、用"又来了"挡催促。和你过往合作过几个高光项目（你们的"变量交换"案例曾被全公司分享）。',
    personality: '内向 / 专业能力强 / 对反馈敏感 / 半年来在用"情感隔离"自我保护 / 抗拒上级催促但不爆发',
    methods: '<strong>4 步重构法</strong>（你刚学完）：1) 共同澄清事实 2) 提取小动作 3) 放回大目标反馈 4) 邀请下一步<br><strong>防御穿透 3 步</strong>：不接情绪 / 具体化场景 / 最小行动'
  },

  // 状态矩阵象限位置定义（cx, cy 用于 SVG · 矩阵 140×140 / 中心 70,70）
  // 抵抗（右上） / 冷漠（左上） / 顺从（左下） / 投入（右下）
  matrixPositions: {
    resistant:  { cx: 100, cy: 40,  emoji: '😠', label: '抵抗' },
    aloof:      { cx: 40,  cy: 40,  emoji: '😑', label: '冷漠' },
    submissive: { cx: 40,  cy: 100, emoji: '😐', label: '顺从' },
    engaged:    { cx: 100, cy: 100, emoji: '🙂', label: '投入' },
    neutral:    { cx: 70,  cy: 70,  emoji: '😶', label: '中性' }
  },

  // ============================================================
  // 阶段 1 · 导入 markdown（5 模块）
  // ============================================================
  introMarkdown: `# 重构被动型员工 · 对练

## 场景
你是设计部主管 **李明**，手下 8 人。今天周一上午 10 点——你正在准备本周的项目复盘报告。

崔德莫（你的下属）已经连续 3 次拖到 deadline 当天才交项目复盘，质量也很马虎。今早你把他叫到工位前，准备和他谈这件事。

## 双方角色
**你（李明 · 学员扮演）**
- 设计部主管，6 年带队经验
- 负责协调 8 人团队 + Q2 三个重点项目
- 对崔德莫的状态既担心又烦躁

**崔德莫（Actor 扮演）**
- 设计部资深设计师，入职 4 年
- 最近半年表现明显下滑（拖延 / 表面服从 / "又来了"）
- 你看到他时他正在埋头改图，神情有些疲惫

## 任务目标
**主目标**：让崔德莫 **自愿承诺** 这周内拿出一份高质量的项目复盘

**分项目标**：
- 不接他"又来了"的情绪钩子
- 把"复盘没写好"具体化到可讨论的事实
- 让他自己提下一步动作（不是你布置）

## 可用资源
- 你是他的直属上级（有正式权威）
- Q2 项目还有 3 周缓冲（不是火烧眉毛）
- 你和他过往合作有过几个高光项目（可以唤起）

## 可用工具 / 知识点回顾
- **责任意识重构 4 步法**（你刚在上一节"重构被动型员工"中学完）：
  1. 共同澄清事实（不评价）
  2. 提取他的小动作（哪怕只 5%）
  3. 把这小动作放回大目标里给反馈
  4. 邀请他自己提下一步
- **防御穿透 3 步**：*不接情绪* → *具体化场景* → *最小行动*`,

  // ============================================================
  // 阶段 1 · 导入 Neo 主动消息（进入即推 · 自动序列）
  // ============================================================
  introNeoMessages: [
    { kind: 'neo', text: '欢迎来到对练。你刚学完了"重构被动型员工"最后一题——把不接情绪 + 具体化场景的范式用到崔德莫身上。' },
    { kind: 'neo', text: '你扮演设计部主管李明，今天要让崔德莫自愿承诺这周拿出高质量复盘。完整的场景、任务、资源、工具——课件区都列出来了，自己看一眼。' },
    { kind: 'neo', text: '准备好了吗？告诉我开始。' }
  ],

  // 学员触发后 Neo 切阶段确认（不出消息直接转）
  introToRoleplayToast: '已进入演练 · 第 1 轮已加载',

  // ============================================================
  // 阶段 2 · 演练 · 演练 1（demo 主路径）
  // ============================================================
  practice1: {
    id: 'practice-1',
    name: '重构被动型员工对练 #1',
    status: 'in_progress',  // -> completed
    initialMatrix: { cx: 100, cy: 40, label: '抵抗', emoji: '😠' },
    turns: [],  // v8: 不再渲染历史气泡 · 进入即由 Actor 开场推入
    // Actor 开场（进演练自动触发，无需学员输入）
    actorOpening: {
      text: '又来了。我不是说了我会写吗？',
      emoji: '😠',
      expr: 'resistant',
      matrix: { cx: 100, cy: 40 }
    },
    // 触发点 1 · 学员第 1 轮（评价钩 · 错）→ Actor 仍抵抗 · 无 Neo
    turn1: {
      learnerText: '崔德莫，咱们聊聊上周的项目复盘。怎么又拖到 deadline 当天？',
      actorText: '你又来催了。能让我安静会儿改图吗？',
      actorEmoji: '😠',
      actorExpr: 'resistant',
      matrixFrom: { cx: 100, cy: 40 },
      matrixTo: { cx: 108, cy: 32 },
      matrixLabel: '抵抗',
      matrixEmoji: '😠'
    },
    // 触发点 2 · 学员第 2 轮（仍评价 · 错）→ 学员气泡出 + Neo 卡点 → Actor 滑向冷漠
    turn2: {
      learnerText: '你这状态再不调整，下周复盘还这样我没法替你担责。',
      // Neo 卡点 chip · 在学员气泡渲染完毕、Actor 还未回复的空档插入
      neoStuckAdvice: '你两轮开场都用了"评价"——直接踩到情感隔离钩。4 步法第 1 步是"共同澄清事实"。试试把场景具体化：「上周复盘第三段你停在哪儿了？」',
      actorText: '……（沉默几秒）随便吧。',
      actorEmoji: '😑',
      actorExpr: 'aloof',
      matrixFrom: { cx: 108, cy: 32 },
      matrixTo: { cx: 40, cy: 40 },
      matrixLabel: '冷漠',
      matrixEmoji: '😑'
    },
    // 触发点 3 · 学员第 3 轮（应用建议 · 具体化）→ Actor 顺从
    turn3: {
      learnerText: '上周复盘第三段写到风险评估那里，你停下来了——是哪部分让你下不去笔？',
      actorText: '……风险评估那块要写跟项目经理冲突的部分，我不知道怎么写不得罪人。',
      actorEmoji: '😐',
      actorExpr: 'submissive',
      matrixFrom: { cx: 40, cy: 40 },
      matrixTo: { cx: 40, cy: 100 },
      matrixLabel: '顺从',
      matrixEmoji: '😐'
    },
    // 触发点 4 · 学员第 4 轮（邀请最小行动）→ Actor 投入 + Neo 收尾 + 转复盘
    turn4: {
      learnerText: '那这块咱们一起想——你愿意把这一段拆开，咱俩一句一句过吗？',
      actorText: '……行吧。我下午 4 点过来找你。',
      actorEmoji: '🙂',
      actorExpr: 'engaged',
      matrixFrom: { cx: 40, cy: 100 },
      matrixTo: { cx: 100, cy: 100 },
      matrixLabel: '投入',
      matrixEmoji: '🙂',
      neoSync: 'Nice——他主动给时间点了。第一次给具体承诺。目标达成，进入复盘。'
    },
    optionalNeoQuestion: '不告诉你具体台词——但提醒你 4 步法第 4 步是什么。给他一个"由他自己提"的入口，不是你布置。'
  },

  // ============================================================
  // 阶段 2 · 演练 2（历史 · 未完成 · 仅自由探讨切换演示）
  // ============================================================
  practice2: {
    id: 'practice-2',
    name: '重构被动型员工对练 #2',
    status: 'incomplete',
    turns: [
      { turn: 1, role: 'learner', text: '崔德莫，关于上周复盘——', history: true },
      { turn: 1, role: 'actor', text: '我等下交。', emoji: '😠', expr: 'resistant', history: true,
        matrix: { cx: 100, cy: 40 } },
      { turn: 2, role: 'learner', text: '不是催你交的事，是想跟你聊一下你为什么写不下去。', history: true },
      { turn: 2, role: 'actor', text: '我已经在写了，不要催。', emoji: '😤', expr: 'resistant', history: true,
        matrix: { cx: 110, cy: 30 } },
      { turn: 3, role: 'learner', text: '那我帮你写一部分？', history: true },
      { turn: 3, role: 'actor', text: '你写吧。', emoji: '😑', expr: 'aloof', history: true,
        matrix: { cx: 30, cy: 30 } }
    ],
    finalMatrix: { cx: 30, cy: 30, label: '冷漠', emoji: '😑' }
    // 学员中途退出 · 演练标记"未完成"
  },

  // ============================================================
  // 阶段 3 · 复盘 markdown（4 模块）
  // ============================================================
  reviewMarkdown: `# 演练 1 · 对练小结

## 目标达成
✅ **主目标达成**——崔德莫自愿承诺下午 4 点带话题来你的工位，开始拆分复盘

## 高光表现
- **第 3 轮**：从"评价/担责"切到"第三段你停下来了"——首次正确应用"防御穿透 3 步"的"具体化场景"
- **第 4 轮**：用"咱俩一句一句过"主动邀请最小行动——精准命中"提取小动作 + 邀请下一步"

## 待改进
- **第 1-2 轮**：开场连续用"怎么又拖"和"我没法替你担责"——评价对方动机，直接踩到情感隔离钩子，矩阵从抵抗滑到冷漠
- Neo 介入后才回正——下次第一秒就要用具体化句式`,

  // 复盘对话回看（点击触发 Neo chip）
  reviewCallbacks: [
    { turn: 1, type: 'warn', icon: '⚠️', text: '"怎么又拖到 deadline 当天？" → 评价开场（被钩）',
      neoAnalysis: '你从"评估对方动机"开场——这是情感隔离钩子最容易触发的语言模式。第 1 轮的失误几乎决定了前两轮的难度。' },
    { turn: 2, type: 'warn', icon: '⚠️', text: '"我没法替你担责" → 评价升级（矩阵滑到冷漠）',
      neoAnalysis: '第 1 轮被"又来了"钩走没回头——第 2 轮反而把评价升级为"威胁担责"。崔德莫直接进入冷漠/隔离。这是 Neo 介入"卡点提示"的位置。' },
    { turn: 3, type: 'star', icon: '✨', text: '"第三段你停下来了……" → 关键转折点',
      neoAnalysis: '应用 Neo 提示后，你切到"具体化第三段"——这是 4 步法第 1 步真正落地的瞬间。从冷漠拉回顺从，可以了。' },
    { turn: 4, type: 'star', icon: '✨', text: '"咱俩一句一句过" → 4 步法收尾',
      neoAnalysis: '把"提取小动作"和"邀请下一步"两步合一——既不包办又给出明确路径。这是崔德莫第一次给具体时间承诺的关键。' }
  ],

  // 复盘 Neo 苏格拉底序列（输入触发）
  reviewNeoSequence: {
    enterChip: { head: '✅ 演练 1 · 已完整 · 进入复盘' },
    socratic1: '主目标达成了——但中间过程值得停一下。第 1-2 轮你开场连用"怎么又拖"和"我没法替你担责"——回头看你当时是怎么想的？',
    socratic2: '嗯。换个问法——你前两轮的"评价"，跟第 3 轮你做的"第三段你停下来了"，差别在哪？',
    finalSummary: '抓住了——"怎么又拖"是评价动机（踩情感隔离钩），"第三段你停下来了"是描述事实（避开钩子）。下次再被"又来了"撞到，先做第 3 轮你做的事——不接情绪、把句子具体化。这是今天最重要的拿走项。',
    taskCard: {
      title: '今天下午 4 点真的跟崔德莫过那段复盘',
      body: '不光走完那一段，先做 30 秒"假定他是合作者"的视角调试。把今天演的开场再用一次。'
    },
    leadToReport: '要不要看看这次的报告？我已经准备好了。'
  },

  // ============================================================
  // 阶段 4 · 报告 · Part 1（评分 · 立即加载）
  // ============================================================
  reportPart1: {
    title: '重构被动型员工对练 · 演练 1 · 报告',
    radar: {
      // 5 维 · 0-100 · 雷达图绘制用
      dims: [
        { key: 'no_emotion', label: '不接情绪',     score: 2, max: 5, comment: '第 1-2 轮连续被"又来了"钩走' },
        { key: 'specify',    label: '具体化场景',   score: 4, max: 5, comment: '第 3 轮 Neo 提示后落地' },
        { key: 'small_act',  label: '提取小动作',   score: 4, max: 5, comment: '第 4 轮"一句一句过"' },
        { key: 'invite_next',label: '邀请下一步',   score: 4, max: 5, comment: '第 4 轮崔德莫自愿承诺' },
        { key: 'pace',       label: '整体节奏',     score: 3, max: 5, comment: '前 2 轮被钩 / Neo 介入后反扑得力' }
      ],
      avg: 3.4
    }
  },

  // 阶段 4 · 报告 · Part 2（高光 + 提升建议 · 学员触发后加载）
  reportPart2: {
    highlights: [
      '🌟 **应用 Neo 提示，从"评估"切到"具体化"的拐点**（第 3 轮）：前两轮连续被"又来了"钩走后，Neo 介入提示，你用"第三段你停下来了"打开崔德莫——是 4 步法第 1 步真正落地的瞬间',
      '🌟 **用"一句一句过"邀请承诺**（第 4 轮）：把"提取小动作"和"邀请下一步"两步合一——既不包办又给出明确路径'
    ],
    suggestions: [
      '**下次试试**：开场就用第 3 轮的句式——"上周复盘第 X 段，是哪里你觉得不好下笔？"',
      '**警惕"又来了"的钩子**：前两轮你两次被同一句话带走情绪——这是被动型员工最希望触发的反应。下次第一秒先停 0.5 秒不接，再具体化场景',
      '**节奏**：4 步法第 1 步"共同澄清事实"对你最难——开场容易直接跳到评价。下次先用 1 句话承认事实再推进'
    ]
  },

  // 高光卡（推 2 张到 Neo Chat 流 + 飞向 Topbar）
  highlightCards: [
    {
      title: '应用 Neo 提示后的拐点',
      quote: '"上周复盘第三段写到风险评估那里，你停下来了——是哪部分让你下不去笔？"',
      neoNote: '前两轮被钩走后，第 3 轮用具体化打开崔德莫——是 4 步法第 1 步真正落地的瞬间',
      meta: '对练 · 演练 1 · 第 3 轮'
    },
    {
      title: '用"一句一句过"邀请承诺',
      quote: '"咱俩一句一句过吗？"',
      neoNote: '把"提取小动作"和"邀请下一步"两步合一——既不包办又给出明确路径',
      meta: '对练 · 演练 1 · 第 4 轮'
    }
  ],

  // 报告阶段 Neo 序列
  reportNeoSequence: {
    open: '雷达图出来了——你看哪一项最让你意外？',
    interpret: '对——前两轮你被"又来了"连钩两次。但第 3 轮我提示后你 1 次就找回来了。所以低分不是"你不会"，是"第一秒没用上"。',
    closing: '整体节奏 3/5——你需要练习的不是这套法，是用这套法的耐心。今天有用。'
  },

  // 完成 Modal
  completionModal: {
    duration: '21 分钟',
    p1Status: '✅ 已完整',
    avgScore: '3.4 / 5'
  },

  // ============================================================
  // 阶段 5 · 自由探讨
  // ============================================================
  freeDiscussNeoSequence: {
    enterChip: {
      head: '🎓 进入自由探讨',
      text: '这里你可以回看任意阶段、问我任何已发生的事。想试新一轮 → 点上面「重新演练 ▾」。'
    },
    switchToP2Chip: { head: '🔄 已切到演练 2 · 未完成 · 仅查看' },
    p2QuestionAnswer: '演练 2 你 3 轮都没找到具体化的句式——第 3 轮还掉到"我帮你写"的坑里。看跟演练 1 第 1-2 轮的"怎么又拖"其实是同一类问题：你被对方的态度带走了。差别是演练 1 在 Neo 介入提示后第 3 轮拐回来了，演练 2 没拐回来就退出了。'
  },

  // ============================================================
  // 阶段 6 · 重新演练（新一轮 · 演练 3）
  // ============================================================
  practice3: {
    id: 'practice-3',
    name: '重构被动型员工对练 #3',
    status: 'in_progress',
    initialMatrix: { cx: 70, cy: 70, label: '中性', emoji: '😶' },
    enterChip: {
      head: '🔄 演练 3 · 已开始 · 矩阵已重置',
      text: '这次从中性起点开始。看你这一次怎么开局。'
    },
    actorOpening: {
      text: '又是你。我知道你要说啥——上周复盘的事。',
      emoji: '😠',
      expr: 'resistant',
      matrix: { cx: 100, cy: 40 }
    },
    turn1: {
      learnerText: '上周复盘第三段，是哪里你觉得不好下笔？',
      actorText: '……你这次直接就来这个？嗯，是风险评估那块——跟项目经理那段冲突。',
      actorEmoji: '😐',
      actorExpr: 'submissive',
      matrixFrom: { cx: 100, cy: 40 },
      matrixTo: { cx: 50, cy: 95 },
      matrixLabel: '顺从',
      matrixEmoji: '😐',
      neoSync: '看到没——演练 1 你用了 3 轮才到这一步。这次第 1 轮就到了。你已经把课学进去了。'
    }
  },

  // ============================================================
  // Course Tree（与 lecture 同源 · 仅当前 Activity 标 in_progress）
  // ============================================================
  courseTree: [
    { id: 'CRS-001', name: '辅导型管理', status: 'in_progress', activities: [
      { id: 'ACT-001-01', name: 'GROW 模型',          type: 'lecture',  status: 'completed' },
      { id: 'ACT-001-02', name: '催化主动型员工',     type: 'lecture',  status: 'completed' },
      { id: 'ACT-001-03', name: '重构被动型员工',     type: 'lecture',  status: 'completed' },
      { id: 'ACT-001-04', name: '重构被动型员工 · 对练', type: 'practice', status: 'in_progress' },
      { id: 'ACT-001-05', name: '辅导型管理报告',     type: 'recap',    status: 'locked' }
    ]},
    { id: 'CRS-002', name: '横向协作', status: 'locked', activities: [
      { id: 'ACT-002-01', name: '跨部门协作的认知陷阱', type: 'lecture',  status: 'locked' },
      { id: 'ACT-002-02', name: 'PIN 法：立场-利益-需求', type: 'lecture',  status: 'locked' },
      { id: 'ACT-002-03', name: '跨部门协作对练',     type: 'practice', status: 'locked' },
      { id: 'ACT-002-04', name: '横向协作报告',       type: 'recap',    status: 'locked' }
    ]},
    { id: 'CRS-003', name: '向上沟通', status: 'locked', activities: [] },
    { id: 'CRS-004', name: '团队激励', status: 'locked', activities: [] }
  ],

  // 铃铛消息（同 lecture）
  bellMessages: [
    { type:'system',   sender:'系统通知',           title:'你的「重构被动型员工」已完成',         desc:'你完成的「重构被动型员工」全部学习内容已沉淀，可在大厅 → 学习成果 → 我的报告 中查看。', time:'今天 09:08', unread:true },
    { type:'platform', sender:'睿学平台',           title:'W6 学习计划提醒 · 推荐立即进入对练',           desc:'按你的学习计划，本周（W6）课程完成后推荐立即进入对练巩固。今天预留的 25 分钟时间窗仍在。', time:'今天 09:09', unread:true },
    { type:'user',     sender:'王 HR · 项目运营',   avatarChar:'王',  title:'本周五前完成 Course 1 可获线下集训优先选座权', desc:'本周五 18:00 前完成 Course 1 全部学习任务的同学，可获得 Q3 线下集训营优先选座权（前 10 名席位）。', time:'昨天 11:08', unread:true }
  ]
};
})();
