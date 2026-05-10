/* ============================================================
   ProConfig · MOCK DATA (按 spec D-5.0 § 1 + PM 反馈 v2)
   双态：pre-launch 开营前 / running 开营后
   v1.3 融合：5 块副本 (projectInfo / members / currentAdmin / bellMessages / coursePack)
              已迁移至 _shared/mock/{admin,project,coursepack}.js + messages.js
              本文件仅留 proconfig 专有数据（milestones / reminders / branding / preview）
   ============================================================ */

window.PROCONFIG_MOCK = {
  // 项目状态 · pre-launch / running（与 PROJECT.status 同义 · 但 proconfig 可临时覆盖测双态）
  status: window.PROJECT && window.PROJECT.status || 'running',
  createdAt: window.PROJECT && window.PROJECT.startDate || '2026-03-22',

  // --- 1.2.1 项目基础信息 · 单 source 引用 window.PROJECT ---
  // M.projectInfo 是 PROJECT 同一对象引用 · 字段赋值 (M.projectInfo.name = X) 直接写回
  // 整体替换 (M.projectInfo = snap) 走 setter 浅同步 · 保留 PROJECT 额外字段（weekIndex 等）
  get projectInfo() { return window.PROJECT; },
  set projectInfo(v) { Object.assign(window.PROJECT, v || {}); },

  // milestones · 单 source 引用 _shared/mock/milestones.js (window.MILESTONES)
  // 写回：proconfig 编辑里程碑 → 直接 mutate MILESTONES.list 字段
  // 注：proconfig 板块 2 关心的是 type ∈ ['business', 'closing']（业务事件 + 结营）
  //     学习节奏（kickoff/check/recap）由 spec 系统级生成 · proconfig 不可编辑
  get milestones() {
    return (window.MILESTONES && window.MILESTONES.list) || [];
  },
  set milestones(v) {
    if (window.MILESTONES) window.MILESTONES.list = v || [];
  },

  // --- 1.2.2 人员名单 · 单 source 引用 AdminCtx.members ---
  // 写回也走 AdminCtx.members（同对象 · 字段 mutate 直接生效）
  get members() { return window.AdminCtx.members; },
  set members(v) { window.AdminCtx.members.length = 0; window.AdminCtx.members.push(...(v || [])); },
  get defaultPassword() { return window.AdminCtx.defaultPassword; },

  // --- 1.2.4 催学规则 · 触发类型 ↔ 文案模板 一一对应 ---
  reminders: {
    silentDays: 7,
    behindMultiplier: 0.80,
    leadingMultiplier: 1.20,
    // 每个触发类型独立 · 含 enabled + 配套文案模板
    rules: [
      { id: 'milestone', label: '里程碑绑定型', enabled: true,
        body: '${学员名}, 距离 ${下一里程碑名} 还有 ${距里程碑天数} 天 · 你的进度 ${进度} · 加油完成 ${下一里程碑名} 前的内容！' },
      { id: 'silent', label: '脱训信号型', enabled: true,
        body: '${学员名}, 你已经连续 ${脱训天数} 天没登录 · 学习需要持续投入 · 距 ${下一里程碑名} 还有 ${距里程碑天数} 天 · 加油！' },
      { id: 'behind', label: '进度落后型', enabled: true,
        body: '${学员名}, 你的进度 ${进度} 比群体均值 ${群体均值进度} 落后 ${落后百分比} · 加把劲跟上节奏！' }
    ]
  },

  // --- 1.2.5 平台个性化 ---
  // branding · 单 source 引用 _shared/mock/branding.js (window.BRANDING)
  // 写回：M.branding.neoName = X 通过 setter 写回 BRANDING
  get branding() { return window.BRANDING || {}; },
  set branding(v) { Object.assign(window.BRANDING, v || {}); },

  // --- 1.2.6 内容预览 ---
  // 内容预览 · 单 source 引用 _shared/mock/coursepack.js
  // proconfig coursePack 字段映射：每 Course 含 id/name/activities[id,name,type]
  // COURSE_PACK 字段更丰富（多 minutes/status/target/aid）· 这里映射为 proconfig 用法
  // v1.3 · 加 lazy cache · 避免每次访问都重新 .map（决策点 #14）
  _coursePackCache: null,
  get coursePack() {
    if (this._coursePackCache) return this._coursePackCache;
    this._coursePackCache = (window.COURSE_PACK || []).map(c => ({
      id: c.id,
      name: c.name,
      activities: c.activities.map(a => ({
        id: a.id,
        name: a.title,   // proconfig 用 name 字段；COURSE_PACK 用 title
        type: a.type
      }))
    }));
    return this._coursePackCache;
  },

  // 所有 lecture 共用 · 12 页 GROW 完整数据（demo 阶段所有 lecture 复用此占位预览）
  lecturePreview: {
    courseName: '辅导反馈',
    activityName: 'A1 · GROW 教练法',
    totalSCO: 12, totalMinutes: 18,
    sco: [
      { n: 1, type: 'SLICE', title: 'GROW 模型四要素', goal: '理解 G/R/O/W 四步教练对话',
        asset: 'assets/ppt/MANAGER1_segment_1.1.jpg',
        narration: 'GROW 是 Goal / Reality / Options / Will 四个英文首字母。它的核心是"教练对话"框架——通过提问让对方自己找到答案，而不是你直接给答案。我们一步一步看。' },
      { n: 2, type: 'SLICE', title: 'G · Goal 目标厘清', goal: '区分"对方真实目标"vs"任务目标"',
        asset: 'assets/ppt/MANAGER1_segment_2.1.jpg',
        narration: '第一步是 Goal。要注意——你以为的目标和对方真实想要的目标，往往不是一回事。要问的是：你希望这次对话之后达成什么？' },
      { n: 3, type: 'QUIZ', quizType: 'single_choice', title: 'Quiz · 识别 G 阶段',
        goal: '能从对话片段判断 GROW 哪一步',
        thumbnail: 'assets/ppt/MANAGER1_segment_2.2.jpg',
        question: '"你希望我们这次谈完之后你能做什么？"——这句问题对应 GROW 哪一步？',
        options: [
          { key: 'A', text: 'G · Goal 目标' },
          { key: 'B', text: 'R · Reality 现状' },
          { key: 'C', text: 'O · Options 选项' },
          { key: 'D', text: 'W · Will 承诺' }
        ],
        correct: ['A'],
        neoFeedback: { correct: '对了——这是典型的 G 阶段，让对方说出对话目标。' }
      },
      { n: 4, type: 'SLICE', title: 'R · Reality 现状探查', goal: '让对方说出 100% 的现状',
        asset: 'assets/ppt/MANAGER1_segment_3.1.jpg',
        narration: '第二步 Reality。最忌讳的是你直接说"我看到你..."。要让对方说，多问"具体什么时候？""当时你怎么想的？"' },
      { n: 5, type: 'SLICE', title: 'O · Options 选项扩展', goal: '帮对方看见 3 种以上可能性',
        asset: 'assets/ppt/MANAGER1_segment_4.1.jpg',
        narration: 'Options 是教练对话的"扩展"环节。重点是让对方自己列出 3 种以上选项，再让他权衡。' },
      { n: 6, type: 'SLICE', title: 'W · Will 行动承诺', goal: '让对方说出"我下周一就做 X"',
        asset: 'assets/ppt/MANAGER1_segment_5.1.jpg',
        narration: 'Will 是承诺。光说"我会做"不够。要落到时间 + 具体动作，比如"周一上午 10 点之前我会..."。' },
      { n: 7, type: 'VIDEO', title: '案例视频 · 销售经理 1on1',
        goal: '看一遍真实 GROW 对话过程',
        thumbnail: 'assets/ppt/MANAGER1_segment_5.2.jpg',
        duration: 180, narration: '我们一起看一段真实的 1on1 录像。你边看边想：他用了 GROW 哪几步？哪一步处理得最好？' },
      { n: 8, type: 'QUIZ', quizType: 'multi_choice', title: 'Quiz · 视频中识别 GROW',
        goal: '从真实对话中识别 GROW 阶段切换',
        thumbnail: 'assets/ppt/MANAGER1_segment_5.3.jpg',
        question: '刚才视频中销售经理用到了 GROW 哪几步？（多选）',
        options: [
          { key: 'A', text: 'G · 询问目标' },
          { key: 'B', text: 'R · 探查现状' },
          { key: 'C', text: 'O · 引导选项' },
          { key: 'D', text: 'W · 落实承诺' }
        ],
        correct: ['A','B','D'],
        neoFeedback: { correct: '观察很准——视频里销售经理跳过了 O 直接到 W，这其实是常见误区。' }
      },
      { n: 9, type: 'SLICE', title: '常见误区 · 跳过 R 直奔 W', goal: '认识"急于给答案"的反模式',
        asset: 'assets/ppt/MANAGER1_segment_5.4.jpg',
        narration: '最常见的误区：你听完 G 就直接跳 W。这样对方没机会展开现状，承诺也容易落空。' },
      { n: 10, type: 'SLICE', title: '常见误区 · 把 O 变成"我建议你..."',
        goal: '识别"教练 vs 直接给答案"的边界',
        asset: 'assets/ppt/MANAGER1_segment_5.5.jpg',
        narration: 'Options 不是你给建议。是你帮对方"看见自己的选项"。' },
      { n: 11, type: 'FEEDBACK_COLLECT', title: 'Activity 反馈 · 你最近的一次 1on1',
        goal: '让学员把 GROW 对到自己的真实场景',
        narration: '最后我想让你想想——你最近一次 1on1 是怎么说的？挑一个具体的场景告诉我。' },
      { n: 12, type: 'SLICE', title: 'Activity 总结', goal: '巩固 GROW 4 步框架',
        asset: 'assets/ppt/MANAGER1_segment_6.1.jpg',
        narration: 'GROW 的本质不是 4 个字母——是把"指令"转成"提问"。下一节我们会接着练。' }
    ]
  },

  // 所有 practice 共用 · GROW 辅导对练完整剧本（demo 阶段所有 practice 复用此占位剧本）
  practicePreview: {
    courseName: '辅导反馈',
    activityName: 'A3 · 反馈对练',
    markdown: `## 场景背景

你是**设计部主管李明**，32 岁，刚提拔 6 个月。你下属**赵工**最近三次让他写项目复盘，他都拖到 deadline 当天才交，质量也马虎。你催他，他说"又来了"。

**今天你要和他做一次 1on1**，用 GROW 法处理这个被动行为。

---

## 角色设定

### Actor · 赵工（AI 演员扮演）
- 35 岁 · 入职 8 年 · 设计部资深设计师
- 业务能力强 · 但近半年明显抗拒新任务
- 历经 3 任主管 · 自我感觉"我是老员工"
- 当下心理：你比我晚来 4 年凭什么管我？
- 沟通模式：表面服从 + 行动落差 + "又来了" 等情感隔离话语

### 学员 · 李明（你扮演）
- 32 岁 · 刚提拔 6 个月 · 之前与赵工同级
- 你的痛点：怎么管比自己资历久的下属
- 你的工具：Course 1 学的 GROW 教练对话框架

---

## 三个对练目标

1. **G · 厘清目标** — 让赵工自己说出他对这次 1on1 的期待
2. **R · 探查现状** — 让赵工说出"又来了"背后的真实顾虑（不是直接说"我看你很消极"）
3. **O + W · 引导选项 + 拿到承诺** — 不直接给方案，让他自己列 3 种可能 + 选一个具体下周一前的行动

---

## 成功标准（Neo 评估 5 维）

| 维度 | 评估点 |
|------|--------|
| **G 厘清** | 是否问到了"你希望我们这次谈完后达成什么" |
| **R 探查深度** | 是否避免直接定性 · 用具体行为提问 |
| **O 选项扩展** | 是否引导赵工自己列 ≥3 种可能 · 而不是你给建议 |
| **W 承诺具体度** | 拿到的行动是否含时间 + 具体动作（不是"我会努力"）|
| **关系维护** | 整个对话中没有让赵工产生防御 / 抵触 |

---

## 4 阶段流程

### ① 导入阶段（仅 Neo · 5 模块讲解）
- 场景背景说明
- 双方角色身份（含背景 + 当前压力）
- 3 个对话目标
- 可用资源 / 工具（GROW 框架）
- 成功标准（5 维）

### ② 演练阶段（★ 三角色协作高峰）
- **Actor**（赵工）按剧本响应你的提问
- **Director**（后台）实时调整剧本走向
- **Neo**（旁路答疑）观察你的对话 · 学员可随时切到 Neo Chat 求助
- 学员**双输入**：左栏对 Actor 说话 + 右栏对 Neo 提问
- 状态矩阵实时反映赵工情绪 + 配合度

### ③ 复盘阶段（仅 Neo · 苏格拉底追问）
- Neo 不直接评分，而是追问"你刚才那一句为什么这么问？"
- 4 个必问点：① G 是否到位 ② R 用了几个具体行为 ③ O 数量 ④ W 时间锚点
- 学员形成自我反思，不是被告知

### ④ 报告阶段（仅 Neo · 高光识别主场）
- 5 维评分（雷达图）
- 高光时刻 1-2 条（具体行为引用 + Neo 注解）
- 提升建议 1-2 条（针对最弱维度）
- 应用计划 → 自动入大厅待办

---

## 关键对话片段（剧本预设）

### 开场（学员开口）
> **李明**："赵工，今天找你聊聊你最近的项目复盘"
> **赵工**："又来了"
> *Neo 旁注：注意——这就是经典的"情感隔离信号"。学员该用 G 阶段引导，而不是反驳。*

### 中段（R 探查最难）
> **李明（理想）**："我想先听听你怎么看这三次复盘"
> **赵工**："我都按你说的写了啊"
> **李明（关键）**："那能具体说说，第一次的复盘你写的时候在想什么？"
> *Neo 旁注：这就是 R 阶段——不预设结论，让对方说。*

### 收尾（W 承诺）
> **李明（理想）**："那这周三之前你想做哪件具体的事来推进这个？"
> **赵工**："那我周三下午跟项目组聊一下吧"
> **李明（深入）**："具体是周三几点？聊完后你想达成什么？"
> *Neo 旁注：这是 W 阶段的"具体度"——不要让对方留太多模糊。*

---

## 常见反模式（学员易踩的雷）

1. **直接给答案**："你应该 XYZ" → 这是命令，不是教练
2. **跳过 R**：听完 G 直接说 W → 对方没机会展开
3. **把 O 变成建议**："你可以试试 ABC" → 这不是 Options 是 Direction
4. **W 太抽象**："我会努力的" → 没有时间没有动作 = 没承诺

---

> **生成机制**：本剧本由 KGP 在 AOM 中预编排 · spec 本期不支持自适应 / 多版本切换。`
  },

  // --- 当前管理员 · 单 source 引用 AdminCtx.currentAdmin ---
  get currentAdmin() { return window.AdminCtx.currentAdmin; },

  // --- topbar bell 消息 · 单 source 派生自 _shared/mock/messages.js（audience='admin'）---
  get bellMessages() { return window.filterMessagesByRole('admin'); },

  // spec § 1 line 15 · 项目配置纯 GUI 模块（无 Ora 参与）· 不放 oraConversation
};
