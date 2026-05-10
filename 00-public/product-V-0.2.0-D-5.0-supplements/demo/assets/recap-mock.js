/* ============================================================
   Recap · MOCK · Course 1 「角色认知」个人小结
   v1.5.2 · 接 COURSE_PACK / Session / AdminCtx · 4 块结构兼容 recap-app.js
   ============================================================ */
window.RECAP_MOCK = (function () {
  function getLearner() {
    const sess = (window.Session && window.Session.get && window.Session.get()) || {};
    const m = (sess.memberId && window.AdminCtx) ? window.AdminCtx.findMember(sess.memberId) : null;
    const name = sess.display || (m && m.name) || 'guest';
    const firstChar = (window.AdminCtx && window.AdminCtx.pickSurname) ? window.AdminCtx.pickSurname(name) : name.charAt(0);
    const role = (m && m.level) ? (m.level + ' · 学员') : '学员';
    return { name, firstChar, neoPersona: localStorage.getItem('rx-persona') || 'male', role };
  }

  return {
    get learner() { return getLearner(); },
    get project() {
      const P = window.PROJECT || {};
      return { name: P.name, weekIndex: P.weekIndex, weekTotal: P.weekTotal };
    },

    /* v1.4.1 FIX-8 · 接 COURSE_PACK CRS-001 A3 */
    activity: {
      id: 'ACT-001-03',
      name: '角色认知 · 小结',
      type: 'recap',
      courseId: 'CRS-001',
      courseName: '角色认知'
    },

    /* 报告主体 · 4 块结构 · 兼容 recap-app.js renderReport */
    report: {
      headerCallout: '本次小结基于你已完成的「A1 从骨干到管理者」/「A2 POLC 四职责」共 2 个学习环节生成。报告于 3 分钟前更新。',
      title: '角色认知 · 个人小结',

      /* ① 内容锚点 · 一根线总结这门课 */
      block1: {
        anchor: 'anchor-1',
        title: '内容锚点',
        content: `这门课讲的是从业务骨干到管理者的身份转换——核心是"看见自己仍在用骨干模式做事、识别管理者真正的工作、用 POLC 框架重组日常"。

**4 个环节带你学了什么**：
- **A1 从骨干到管理者** —— 业务骨干 vs 管理者的 3 种典型差异（看个人 vs 看团队 / 完成任务 vs 让别人完成 / 短期产出 vs 持续产能）+ 90 天上任规划
- **A2 POLC 四职责** —— 计划（Plan）/ 组织（Organize）/ 领导（Lead）/ 控制（Control）四象限模型

> 你在 A1 的反馈里写："*我现在还是用业务骨干的方式做事*"——这是觉察的起点。`,
        pinSummary: '**4 个环节的核心 = 一件事**：**身份 → 场景 → 行动**，你在新岗位上四步连贯的迁移。'
      },

      /* ② 走过的轨迹 · 3 个核心工具卡片化 */
      block2: {
        anchor: 'anchor-2',
        title: '走过的轨迹',
        intro: '这门课让你掌握的核心工具，可以变化还原到你的实战工作中。我找了 3 个你的最关键的工具，每个工具给你适用场景 + 怎么用 + 你的具体表现怎么样——',
        transferableSkills: [
          {
            icon: '🛡️',
            name: '防御穿透 3 步',
            formula: '不接情绪 + 具体化场景 + 提取小动作',
            applicableScenario: '对方推不动 / 又"又来了""我已经说过"这类有防御的时候',
            yourApplication: [
              '**第 1 步 不接情绪**：当对方说 "*KPI 拆解的标准就是这样*" 这类的时候',
              '— 不是反驳"为什么"，而是先听 → "你担心的是流程还是被问责？"',
              '— 改 → "*03 你担心的是哪一块？*" — 拉回具体场景',
              '**第 2 步 具体化场景**：你认为的 30 分钟是干什么的？'
            ],
            contrast: '课前你会直接反驳 → 现在能稳住先听',
            courseSource: '来自 A1 第 4 段课件「重构被动型员工」'
          },
          {
            icon: '🎯',
            name: 'POLC 四职责',
            formula: '计划 / 组织 / 领导 / 控制',
            applicableScenario: '当你发现自己一周 80% 时间都在做"骨干的事"——亲自跑客户、亲自写方案',
            yourApplication: [
              '**P 计划**：每周一花 30 分钟做"未来 2 周拼图"',
              '**O 组织**：把"亲自做"变成"配资源 + 派人"',
              '**L 领导**：1on1 多用 GROW 法少给方案',
              '**C 控制**：周五看一次进度仪表盘 · 不要日常 micromanage'
            ],
            courseSource: '来自 A2 第 1-4 段课件'
          },
          {
            icon: '👁️',
            name: '90 天上任路线',
            formula: '0-30 倾听 / 30-60 假设 / 60-90 行动',
            applicableScenario: '你刚带这个团队 6 周——还在 "0-30 倾听" 这一段',
            yourApplication: [
              '**0-30 天**：跟每个组员 1on1 至少 1 次 · 不带评判听他们的真心话',
              '**30-60 天**：把听到的整理为"3 个我看到的问题假设" · 再去验证',
              '**60-90 天**：选 1-2 个高杠杆动作正式推 · 留下你做小组长的"3 件事"'
            ],
            courseSource: '来自 A1 第 5 段课件「90 天上任规划」'
          }
        ],
        closingHint: '**回到你的场景**：你下周三跟组员小张 1on1 时，可以先用 GROW（A2 学的）听他真心话——这是把 "倾听-假设-行动" 三段里的"倾听" 落到具体动作上。'
      },

      /* ③ 6 维画像 · 简化（学员反感被评判 · 雷达 + 一句话） */
      block3: {
        anchor: 'anchor-3',
        title: '6 维画像变化',
        briefIntro: '学完这门课，你的「**思考反思**」+1 / 「**表达开放**」+1。其余 4 维这门课暂未触及——*不是缺点，是这门课不教那些*。',
        radar: [
          { dim: '思考反思', prev: 3, current: 4 },
          { dim: '表达开放', prev: 2, current: 3 },
          { dim: '挑战接纳', prev: 3, current: 3 },
          { dim: '提取迁移', prev: 2, current: 2 },
          { dim: '场景讨论', prev: 3, current: 3 },
          { dim: '系统视角', prev: 2, current: 2 }
        ],
        briefSummary: '**关键证据**：A1 你写"*我对小王有偏见*"——这是少见的**自我觉察 + 主动说出来**，1v1 老师最看重的开放度信号。'
      },

      /* ④ 待办任务 · 列 3 条 + chat 卡片平行 */
      block4: {
        anchor: 'anchor-4',
        title: '待办任务',
        intro: '基于这门课你练过的工具，我给你列了 3 条本周可做的具体动作（已同步推送到右栏 Neo Chat · 想加待办点旁边的 +）：',
        tasks: [
          { tag: '本周', text: '给小张一次 SBI 反馈 · 先听他的反思（**练 A2 的 L 领导**）' },
          { tag: '下周', text: '下个 1on1 用 GROW 法 · 少给方案多问目标（**练 A2 的 L + 防御穿透 3 步**）' },
          { tag: '本月', text: '写下做小组长 90 天的"我希望被记住的 3 件事"（**A1 90 天路线 0-30 段**）' }
        ],
        chatHint: '*列不列由我决定 · 收不收藏由你决定*。点 chat 区里的「+ 加入待办」可以加到大厅的待办面板。'
      }
    },

    /* Walk-through 4 步 · 每步切到对应 anchor 并推 Neo 消息 */
    walkthrough: [
      { step: 1, anchorIdx: 1, intro: '我们一起看看这份小结。先调取一下你的记忆 —— 这份报告围绕你完成的 2 个学习环节生成。', ack: '好 · 我们继续看下一块。' },
      { step: 2, anchorIdx: 2, intro: '你在 A2 的互动比 A1 多了 50% —— 这不是偶然，是你"打开"了。我把那 18 次互动里最关键的 3 段拎成 3 张工具卡了。每张卡你点开看 · 这是你能直接拿来用的部分。', ack: '继续 · 接下来是 6 维画像。' },
      { step: 3, anchorIdx: 3, intro: '6 维画像里你"思考反思"+1 / "表达开放"+1 —— 都是有证据的微变化。其他 4 维这门课没动，不是缺点，是这门课不教那些。', ack: '最后一块是待办。' },
      { step: 4, anchorIdx: 4, intro: '看到那个"我对小王有偏见"了吗？这是少见的「自我觉察 + 主动说出来」—— 下一门课「横向协作」会让这个觉察落到 PIN 法上。这里给你列了 3 条本周可做的具体动作。', ack: '都看完了 · 准备进入完成态。' }
    ],

    /* Neo 待办任务卡（chat 区推） */
    taskCards: [
      { id: 'task-1', title: '给小张一次 SBI 反馈 · 先听他的反思', source: 'A2 · POLC 四职责 / L 领导' },
      { id: 'task-2', title: '下个 1on1 用 GROW 法', source: 'A2 · POLC 四职责' },
      { id: 'task-3', title: '写下做小组长 90 天的 3 件事', source: 'A1 · 90 天上任规划' }
    ],

    /* 完成 modal · v1.5.2 B20 · 三按钮全 primary */
    completionModal: {
      title: 'Course 小结完成！',
      sub: '你已完成「角色认知 · 小结」',
      appliedNote: '右栏 Neo Chat 转入「自由复习」态 · 你可以接着问「这个怎么应用到 X 场景？」之类',
      duration: '12 分 18 秒',
      interactionCount: '36 次',
      backToHallText: '回到大厅',
      primaryCta: '自由复习',
      nextActivityText: '继续下一 Activity'
    },

    closingNeoMsg: '已进入自由复习态 · 这份报告还在 · 你可以问我「PIN 法跟 POLC 哪里像」「我的高光怎么用到下次 1v1」之类。',

    /* 自由复习态 · 默认无更新（被动答疑）· hasUpdate=true 触发主动开场 + 推高光卡 */
    freeReviewMode: {
      defaultHasUpdate: false,
      revisitMode: {
        openMsg: '你回来了 · 这门课结束后这 5 天里 · 你在大厅写了 1 条相关的笔记 · 我把它跟报告对了一下 ·',
        followupMsg: '关键词「先听再说」 —— 跟 ④ 块的"在 A2 你愿意承认对小王有偏见"是同一个母题。',
        pushHighlightCard: { title: '先听再说 · 大厅笔记', quote: '今天会上我先没急着发言 · 听了王总 3 分钟 · 收获大于我自己说 5 分钟', neo: '这是 ④ 块觉察的延伸应用' }
      },
      reviewMode: {
        defaultAnswer: '这块你想了解什么？比如"防御穿透 3 步" 怎么用到我跟 HR 周的对话上？我可以帮你拆。'
      }
    },

    /* Neo fallback QA · 关键词匹配 · demo 简化 */
    neoFallbackQA: [
      { keywords: ['POLC', 'polc', '四职责'], response: 'POLC 是 Plan/Organize/Lead/Control — 计划 / 组织 / 领导 / 控制。在你的场景：周一花 30 分钟做 P 计划；O 是把亲自做改成派人；L 用 GROW 多问少答；C 周五看一次仪表盘不 micro。' },
      { keywords: ['防御', '穿透', '不接情绪'], response: '防御穿透 3 步 = 不接情绪（不反驳）+ 具体化场景（"你担心的是哪一块"）+ 提取小动作。下次 KPI 拆解会上对小王试试 · 看他能不能多说 30 秒。' },
      { keywords: ['90 天', '上任'], response: '0-30 倾听（每人 1on1 不评判）/ 30-60 假设（整理 3 个问题）/ 60-90 行动（选 1-2 个高杠杆动作正式推）。你现在 W6 还在 0-30 段。' },
      { keywords: ['横向协作', 'PIN', 'pin'], response: 'PIN 法是下一门课的核心：Position（立场）/ Interest（利益）/ Need（需求）三层。跟 POLC 里的 L 领导是配合关系——POLC 让你知道"该做什么"，PIN 让你知道"怎么跟跨部门说"。' }
    ],

    /* drawer Project 目录 · v1.4.1 FIX-8 / v1.5 P3 · 派生 COURSE_PACK 4 态 */
    get courseTree() {
      const mapStatus = (s) => {
        if (s === 'completed') return 'completed';
        if (s === 'progress')  return 'in_progress';
        if (s === 'locked')    return 'locked';
        return 'notstarted';
      };
      return (window.COURSE_PACK || []).map(c => ({
        id: c.id,
        name: c.name,
        status: mapStatus(c.status),
        activities: c.activities.map(a => ({ id: a.id, name: a.title, type: a.type, status: mapStatus(a.status) }))
      }));
    },

    bellMessages: [
      { id: 'recap-msg-1', type: 'system',   sender: '系统通知',         title: '你的「角色认知」小结已生成', desc: '小结报告已推送 · 含 4 块结构 + 3 条待办任务建议。', time: '今天 09:45', unread: true },
      { id: 'recap-msg-2', type: 'platform', sender: '睿学平台',         title: 'W6 学习计划提醒',           desc: '完成本次小结后推荐进入 Course 2「横向协作」首课。', time: '今天 09:46', unread: true },
      { id: 'recap-msg-3', type: 'user',     sender: '王 HR · 项目运营', avatarChar: '王', title: 'W6 周复盘开放', desc: '本周五 18:00 前完成 A1+A2 的同学，可在大厅查看 W6 复盘提醒。', time: '昨天 11:08', unread: true }
    ]
  };
})();
