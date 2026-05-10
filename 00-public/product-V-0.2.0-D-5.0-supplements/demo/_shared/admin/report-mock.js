/* ============================================================
   Report Center · MOCK DATA
   管理端 · 报告中心（报告库 + 编辑器 + Report Ora）
   ------------------------------------------------------------
   当前管理员 = 王 HR（项目运营）
   demo 项目 = 基层管理者培训项目 · W6 / 26 · 32 学员
   默认进入 = 报告库 Tab1（管理员报告 · 7 条）
   spec 来源 = § 06-management/03-report-center
   ============================================================ */

window.REPORT_MOCK = {

  // ============================================================
  // 0. 当前管理员 + 项目元
  // ============================================================
  // 管理端账号 · 与 login 'hr@demo' 体系对齐（HR 王 · 项目运营 · 兼 HR）
  // 注：mgthome.html:2348 当前 adminUser='赵工' 为漂移 bug，留待 mgthome 收尾时同步修
  // v1.4 · manager 改 getter · 派生 AdminCtx.currentAdmin（按 Session.memberId）
  get manager() {
    const A = window.AdminCtx;
    const cur = (A && A.currentAdmin) || {};
    return {
      name: cur.name || 'HR 王',
      firstChar: cur.surname || '王',
      role: cur.role || '项目运营 · 兼 HR',
      avatarColor: ['#D97757', '#B85F38']
    };
  },
  // v1.4 · project 改 getter · 引 _shared/mock/project.js (PROJECT 单 source)
  // totalLearners 派生 AdminCtx.members.length（24）
  get project() {
    const P = window.PROJECT || {};
    const totalLearners = (window.AdminCtx && window.AdminCtx.members) ? window.AdminCtx.members.length : 24;
    return {
      name: P.name,
      weekIndex: P.weekIndex,
      weekTotal: P.weekTotal,
      totalLearners,
      startDate: P.startDate,
      endDate: P.endDate,
      progressPct: P.progress
    };
  },

  // v1.4 · 学员名单 24 人 · 单 source 派生自 AdminCtx.members + LearningStats
  // 决策点 D1-B：以 v1.3 已对齐的 24 人为 truth · 不动 admin.js
  // status: active/risk/silent 来自 LearningStats.login
  // stage: 领先/正常/风险/沉默 来自 LearningStats.prog + login
  // completion: progress/total 派生百分比
  get learners() {
    const members = (window.AdminCtx && window.AdminCtx.members) || [];
    const stats   = window.LEARNING_STATS || {};
    return members.map(m => {
      const s = stats[m.id] || {};
      const status = s.login || 'active';
      const stage =
        s.login === 'silent'  ? '沉默' :
        s.login === 'risk'    ? '风险' :
        s.prog === 'ahead'    ? '领先' :
        '正常';
      const completion = s.total
        ? Math.round((s.progress / s.total) * 100) + '%'
        : '0%';
      const firstChar = (window.AdminCtx && window.AdminCtx.pickSurname) ? window.AdminCtx.pickSurname(m.name) : (m.name || '?').charAt(0);
      return {
        id: m.id,
        name: m.name,
        firstChar,
        role: m.level,
        status, stage, completion
      };
    });
  },

  // 顶栏 bell 消息中心 mock
  messages: [
    {
      id:'m1', type:'platform', sender:'NeoLearning 平台',
      avatarChar:'N',
      title:'新功能：报告中心 ChatBI 已上线',
      desc:'编辑报告时可以直接 chat "加一个 X 图" 让 Ora 一句话生成图表 · 支持 6 类（柱状/折线/表格/堆叠柱/饼图/散点）。',
      time:'刚刚', unread:true
    },
    {
      id:'m2', type:'system', sender:'系统通知',
      avatarChar:'S',
      title:'4 名学员触发风险信号',
      desc:'朱琪 / 秦雷 / 尤海 / 许刚 连续 2 周无登录或 Activity 推进停滞 · 建议优先纳入下次报告。',
      time:'1 小时前', unread:true
    },
    {
      id:'m3', type:'private', sender:'李四（学员）',
      avatarChar:'李',
      title:'我能看一下我自己的画像吗？',
      desc:'王 HR 你好 · 我看到 Course 1 推进比较快但 Course 3 卡住了 · 想问你能不能帮我看下最近的 6 维评估？',
      time:'3 小时前', unread:true
    },
    {
      id:'m4', type:'system', sender:'系统通知',
      avatarChar:'S',
      title:'W6 周报建议生成',
      desc:'本周里程碑临近 · 建议 W6-W7 之间生成 1 份"项目中期综合报告" · 可使用「综合报告」模板。',
      time:'昨天 18:42', unread:false
    },
    {
      id:'m5', type:'platform', sender:'NeoLearning 平台',
      avatarChar:'N',
      title:'你的 W4 风险学员分析报告已被 3 位 HR 引用',
      desc:'报告中心检测到「W4 风险学员分析」§ 干预建议 在最近 5 天内被 HR 引用 3 次 · 是高价值参考报告。',
      time:'2 天前', unread:false
    }
  ],

  // 学员选择器筛选 chip 配置（与 32 学员两维度独立分布对齐）
  learnerFilters: {
    status: [
      { key: 'all',    label: '全部',  count: 32 },
      { key: 'active', label: '活跃',  count: 18 },
      { key: 'risk',   label: '风险',  count: 8 },
      { key: 'silent', label: '沉默',  count: 6 }
    ],
    stage: [
      { key: 'lead',   label: '领先', count: 4 },
      { key: 'normal', label: '正常', count: 18 },
      { key: 'risk',   label: '风险', count: 8 },
      { key: 'silent', label: '沉默', count: 2 }
    ]
  },

  // ============================================================
  // 1. Tab1 · 管理员报告（7 条 · 时间倒序）
  //    每条含 5 列展示字段 + content 完整内容（5 块结构）
  // ============================================================
  managerReports: [
    {
      id: 'rpt-001',
      name: '项目中期综合报告',
      icon: '📄',
      createdAt: '2 天前',
      createdAtAbs: '2026-05-05 14:32',
      timePeriod: '项目至今',
      timePeriodRange: '2026-03-22 至 2026-05-07',
      personScope: '全部学员',
      personCount: 32,
      template: '综合报告',
      modifiedAt: '昨天',
      // demo 主路径默认从这条进编辑器
      isDefaultDemo: true,
      contentBlocks: [
        {
          id: 'b1',
          type: 'h1',
          text: '项目中期综合报告'
        },
        {
          id: 'b2',
          type: 'meta',
          text: '项目周期：2026-03-22 至 2026-09-22（共 26 周） · 报告范围：项目至今（W1-W6） · 全部学员（32 人）'
        },
        {
          id: 'b3',
          type: 'h2',
          text: '① 项目总体表现'
        },
        {
          id: 'b4',
          type: 'p',
          text: '项目进入第 6 周，总体进度 28%（已用 42/183 天）。学员平均完成 12/29 个 Activity，处于设计预期区间内。Course 1 横向协作的完成率最高（78%），Course 4 与 Course 5 因开放时间靠后整体偏低。本周学员活跃度环比上升 12%，处于 6 周内峰值。'
        },
        {
          id: 'b5',
          type: 'chart',
          chartId: 'bar_courseCompletion',
          chartType: 'bar',
          title: 'Course 完成率对比'
        },
        {
          id: 'b6',
          type: 'h2',
          text: '② 学员分布与动态'
        },
        {
          id: 'b7',
          type: 'p',
          text: '32 名学员目前呈现明显的三态分布：18 人（56%）持续活跃，8 人（25%）出现风险信号（连续 2 周无登录或 Activity 推进停滞），6 人（19%）尚未真正进入项目（注册后未发生有效学习）。其中风险学员中有 5 名集中在 Course 3 卡点（重构被动型员工 ACT-001-03），与 Course 3 整体完成率偏低互为印证。'
        },
        {
          id: 'b8',
          type: 'chart',
          chartId: 'pie_learnerStatus',
          chartType: 'pie',
          title: '学员三态占比'
        },
        {
          id: 'b9',
          type: 'chart',
          chartId: 'table_keyLearners',
          chartType: 'table',
          title: '关键学员动态（领先 + 风险）'
        },
        {
          id: 'b10',
          type: 'h2',
          text: '③ 内容推进情况'
        },
        {
          id: 'b11',
          type: 'p',
          text: 'Course 1 / Course 2 已基本完成，Course 3 出现明显卡点——尤其是 ACT-001-03（重构被动型员工）的对练环节，第三轮通过率偏低。Course 4 / Course 5 仍处于早期推进阶段。学员投入时长在 Lecture 类 Activity 上占比 42%，在 Practice 类 Activity 上占比 38%，Recap 类占比 12%，其余为 Activity 间。'
        },
        {
          id: 'b12',
          type: 'chart',
          chartId: 'stackedBar_timeDistribution',
          chartType: 'stacked-bar',
          title: 'Course 内 Activity 时长分布'
        },
        {
          id: 'b13',
          type: 'h2',
          text: '④ 6 维画像聚合'
        },
        {
          id: 'b14',
          type: 'p',
          text: '32 名学员在「学习意愿」6 维上的项目均值显示：思考与反思 / 学习投入两维表现领先（项目均值 L3.5+），表达开放 / 挑战接纳两维处于中位（L2.8 - L3.2），场景讨论 / 学习自驱两维偏低（L2.5 左右），是后续 Course 4-5 重点干预方向。'
        },
        {
          id: 'b15',
          type: 'h2',
          text: '⑤ 关键发现与建议'
        },
        {
          id: 'b16',
          type: 'list',
          items: [
            '**领先组**（5 人）已展现跨场景迁移能力，建议在 Course 4 启动时邀请其作为 peer 案例分享',
            '**Course 3 卡点**根源不在内容难度，而在「防御穿透」工具的实操不熟——建议补一节 ACT-001-03 增强对练',
            '**6 名沉默学员**多为新员工角色，建议项目运营团队点对点跟进 1 次，重新激活',
            '**学习自驱维度**项目均值偏低，需在 Course 4 引入"个人学习目标设定"机制改善'
          ]
        }
      ]
    },

    {
      id: 'rpt-002',
      name: 'W4 风险学员分析',
      icon: '📄',
      createdAt: '5 天前',
      createdAtAbs: '2026-05-02 10:15',
      timePeriod: 'W4-W4',
      timePeriodRange: '2026-04-12 至 2026-04-18',
      personScope: '8 人选定',
      personCount: 8,
      template: null,
      modifiedAt: '5 天前',
      contentBlocks: [
        { id: 'r2-b1', type: 'h1', text: 'W4 风险学员分析' },
        { id: 'r2-b2', type: 'meta', text: '范围：W4 单周 · 风险标签学员 8 人' },
        { id: 'r2-b3', type: 'h2', text: '① 风险学员概览' },
        { id: 'r2-b4', type: 'p', text: '本周新增 / 持续风险学员共 8 人。其中 3 人为"连续 2 周无登录"，5 人为"Activity 推进停滞超 5 天"。' },
        { id: 'r2-b5', type: 'h2', text: '② 风险归因' },
        { id: 'r2-b6', type: 'p', text: '从前序 Activity 的 6 维画像看，5 名停滞学员中有 4 名在「挑战接纳」维度普遍偏低（L2 以下），与 Course 3 防御穿透训练的难度匹配性差。' },
        { id: 'r2-b7', type: 'h2', text: '③ 干预建议' },
        { id: 'r2-b8', type: 'list', items: [
          '3 名沉默学员 → 项目运营 1v1 触达，了解阻塞原因',
          '5 名停滞学员 → 补 ACT-001-03 增强对练 / 降低对练难度阈值'
        ] }
      ]
    },

    {
      id: 'rpt-003',
      name: 'Course 1 横向协作 高光月度汇总',
      icon: '📄',
      createdAt: '1 周前',
      createdAtAbs: '2026-04-30 09:45',
      timePeriod: '2026-04-01 至 2026-04-30',
      timePeriodRange: '2026-04-01 至 2026-04-30',
      personScope: '全部学员',
      personCount: 32,
      template: null,
      modifiedAt: '1 周前',
      contentBlocks: [
        { id: 'r3-b1', type: 'h1', text: 'Course 1 横向协作 · 高光月度汇总' },
        { id: 'r3-b2', type: 'meta', text: '范围：4 月全月 · Course 1 横向协作产出的全部高光卡' },
        { id: 'r3-b3', type: 'h2', text: '① 月度高光数量' },
        { id: 'r3-b4', type: 'p', text: '4 月共产出高光卡 47 张。涉及学员 23 人。其中 5 人产出 ≥ 3 张（高密度产出组）。' },
        { id: 'r3-b5', type: 'h2', text: '② 典型高光摘录' },
        { id: 'r3-b6', type: 'p', text: '张三在 ACT-001-01 中产出"我以前总以为 Win-Win 是妥协"——这是本月最被复用的语句之一。' }
      ]
    },

    {
      id: 'rpt-004',
      name: 'W3 互动数据周报',
      icon: '📄',
      createdAt: '2 周前',
      createdAtAbs: '2026-04-22 16:20',
      timePeriod: 'W3-W3',
      timePeriodRange: '2026-04-05 至 2026-04-11',
      personScope: '全部学员',
      personCount: 32,
      template: null,
      modifiedAt: '2 周前',
      contentBlocks: [
        { id: 'r4-b1', type: 'h1', text: 'W3 互动数据周报' },
        { id: 'r4-b2', type: 'p', text: '本周整体活跃 53%，Neo 平均互动轮次 8.4 / 学员，对练完成 14 人次。' }
      ]
    },

    {
      id: 'rpt-005',
      name: '辅导型管理 Course 完成进度专题',
      icon: '📄',
      createdAt: '3 周前',
      createdAtAbs: '2026-04-15 11:08',
      timePeriod: '2026-04-01 至 2026-04-15',
      timePeriodRange: '2026-04-01 至 2026-04-15',
      personScope: '15 人选定',
      personCount: 15,
      template: null,
      modifiedAt: '3 周前',
      contentBlocks: [
        { id: 'r5-b1', type: 'h1', text: '辅导型管理 Course 完成进度专题' },
        { id: 'r5-b2', type: 'p', text: '聚焦 Course 1-3，专题分析 15 名核心学员的完成节奏。' }
      ]
    },

    {
      id: 'rpt-006',
      name: '新员工首月学习画像',
      icon: '📄',
      createdAt: '4 周前',
      createdAtAbs: '2026-04-08 13:50',
      timePeriod: 'W1-W2',
      timePeriodRange: '2026-03-22 至 2026-04-04',
      personScope: '6 人选定',
      personCount: 6,
      template: null,
      modifiedAt: '4 周前',
      contentBlocks: [
        { id: 'r6-b1', type: 'h1', text: '新员工首月学习画像' },
        { id: 'r6-b2', type: 'p', text: '6 名新员工角色学员，首月学习意愿 6 维表现整体偏弱。建议 Course 2 启动时引入 buddy 机制。' }
      ]
    },

    {
      id: 'rpt-007',
      name: '项目启动期学员动态',
      icon: '📄',
      createdAt: '5 周前',
      createdAtAbs: '2026-04-01 09:00',
      timePeriod: 'W1-W1',
      timePeriodRange: '2026-03-22 至 2026-03-28',
      personScope: '全部学员',
      personCount: 32,
      template: null,
      modifiedAt: '5 周前',
      contentBlocks: [
        { id: 'r7-b1', type: 'h1', text: '项目启动期学员动态' },
        { id: 'r7-b2', type: 'p', text: '启动周 32 名学员全部完成首次登录，首日活跃 89%。' }
      ]
    }
  ],

  // ============================================================
  // 2. Tab2 · 学员报告（5 学员 · 每人 2-3 份 · 含 3 类）
  // ============================================================
  // v1.5.1 B02+B03 · 全部 preview 引用对应 learnerName · courseName 跟 COURSE_PACK 对齐
  // CRS-001 角色认知 / CRS-002 横向协作 / CRS-003 辅导反馈 / activityName 全用 COURSE_PACK 真 id
  studentReports: [
    {
      learnerId: 'u1',
      learnerName: '赵工',
      role: '中期学员',
      avatarColor: ['#D97757', '#B85F38'],
      reports: {
        recap: [
          {
            id: 'recap-zhao-c1',
            courseName: 'Course 1 角色认知',
            activityName: 'A3 · 角色认知小结',
            date: '2026-04-15',
            preview: '赵工在 Course 1 角色认知的小结报告。重点：从"业务骨干"到"管理者"的身份转换初步发生 · POLC 四职责能在销售团队场景下识别。'
          },
          {
            id: 'recap-zhao-c2',
            courseName: 'Course 2 横向协作',
            activityName: 'A5 · 横向协作 Course 小结',
            date: '2026-05-02',
            preview: '赵工在 Course 2 横向协作的小结报告。重点：PIN 法在跨部门对话中的实际尝试 · 从"先表达立场"到"先理解再陈述"的迁移正在发生。'
          }
        ],
        practice: [
          {
            id: 'practice-zhao-c2-03',
            activityName: 'A3 · PIN 法实战演练',
            round: 3,
            date: '2026-04-10',
            preview: '赵工对崔德莫案例进行第 3 次重构对练 · 已能稳定运用"防御穿透 3 步"。'
          }
        ],
        highlights: [
          { id: 'h-zhao-1', title: '从"立场先行"到"理解先行"的转折', quote: '我以前总以为 Win-Win 是妥协，现在发现是先理解再陈述。', activity: 'ACT-001-01', date: '2026-04-08' },
          { id: 'h-zhao-2', title: 'PIN 法自发应用', quote: '我在和小王的项目对齐里第一次主动用了 PIN 三层。', activity: 'ACT-002-03', date: '2026-04-25' },
          { id: 'h-zhao-3', title: '识别情感隔离信号', quote: '"对方眼神飘了"——我以前会忽略，现在知道是要切回情绪。', activity: 'ACT-002-03', date: '2026-04-12' }
        ]
      }
    },

    {
      learnerId: 'u8',
      learnerName: '陈静',
      role: '新员工',
      avatarColor: ['#22D3EE', '#0891B2'],
      reports: {
        recap: [
          {
            id: 'recap-chen-c1',
            courseName: 'Course 1 角色认知',
            activityName: 'A3 · 角色认知小结',
            date: '2026-04-18',
            preview: '陈静在 Course 1 角色认知的小结报告。重点：作为新员工对"管理者身份"的边界仍在试探 · POLC 概念已掌握但应用偏谨慎。'
          }
        ],
        practice: [
          {
            id: 'practice-chen-c2-03',
            activityName: 'A3 · PIN 法实战演练',
            round: 2,
            date: '2026-04-14',
            preview: '陈静第 2 次 PIN 法对练 · "具体化场景"步骤掌握 · "提取小动作"仍偏抽象。'
          }
        ],
        highlights: [
          { id: 'h-chen-1', title: '首次主动发起跨部门沟通', quote: '我跟产品的小王约了个 30 分钟同步，以前我都是等他来找我。', activity: 'ACT-001-02', date: '2026-04-16' }
        ]
      }
    },

    {
      learnerId: 'u9',
      learnerName: '何颖',
      role: 'HR',
      avatarColor: ['#A78BFA', '#7C5BAE'],
      reports: {
        recap: [
          {
            id: 'recap-he-c1',
            courseName: 'Course 1 角色认知',
            activityName: 'A3 · 角色认知小结',
            date: '2026-04-20',
            preview: '何颖（HR）在 Course 1 角色认知的小结。重点：从 HR 视角对"业务管理者"角色转换的反思 · POLC 在 HR 内部团队管理上的迁移。'
          },
          {
            id: 'recap-he-c2',
            courseName: 'Course 2 横向协作',
            activityName: 'A5 · 横向协作 Course 小结',
            date: '2026-05-05',
            preview: '何颖在 Course 2 横向协作的小结。重点：HR 角色在 PIN 法跨部门对话中的边界与桥接作用。'
          }
        ],
        practice: [],
        highlights: [
          { id: 'h-he-1', title: 'HR 视角下的影响边界', quote: '我以前给意见太往 KPI 上靠，忽略了具体场景。', activity: 'ACT-002-03', date: '2026-04-28' },
          { id: 'h-he-2', title: '业务侧思考迁移', quote: '我开始能用业务的语言聊管理。', activity: 'ACT-001-02', date: '2026-04-11' }
        ]
      }
    },

    {
      learnerId: 'u10',
      learnerName: '吕菲',
      role: '中期学员',
      avatarColor: ['#F4A86C', '#D97A37'],
      reports: {
        recap: [
          {
            id: 'recap-lv-c1',
            courseName: 'Course 1 角色认知',
            activityName: 'A3 · 角色认知小结',
            date: '2026-04-22',
            preview: '吕菲（中期学员）在 Course 1 角色认知的小结。重点：管理者身份在销售团队场景下的应用 · 从骨干到 leader 的关键挑战已识别。'
          }
        ],
        practice: [
          {
            id: 'practice-lv-c2-03',
            activityName: 'A3 · PIN 法实战演练',
            round: 4,
            date: '2026-04-19',
            preview: '吕菲 4 轮 PIN 法对练 · 对崔德莫案例形成稳定迁移路径。'
          }
        ],
        highlights: [
          { id: 'h-lv-1', title: '"被钩两次再回正"的反应模式', quote: '我在对练中第一次跨过了"被钩两次再回正"的反应模式。', activity: 'ACT-002-03', date: '2026-04-19' },
          { id: 'h-lv-2', title: '提取小动作的迁移', quote: '我在跟销售骨干的周会里试了"邀请下一步"，对方真的接住了。', activity: 'ACT-002-03', date: '2026-04-22' }
        ]
      }
    },

    {
      learnerId: 'u22',
      learnerName: '田静',
      role: '中期学员',
      avatarColor: ['#34D399', '#059669'],
      reports: {
        recap: [
          {
            id: 'recap-tian-c1',
            courseName: 'Course 1 角色认知',
            activityName: 'A3 · 角色认知小结',
            date: '2026-04-25',
            preview: '田静在 Course 1 角色认知的小结。重点：从"快回应业务"到"先共情后引导"的角色转换 · POLC 四职责中"领导"维度的觉察。'
          }
        ],
        practice: [],
        highlights: [
          { id: 'h-tian-1', title: '从快回应到先共情', quote: '我以前总是秒回，现在会先停 2 秒。', activity: 'ACT-001-02', date: '2026-04-24' }
        ]
      }
    }
  ],

  // ============================================================
  // 3. 模板预设
  // ============================================================
  templates: [
    {
      id: 'free',
      name: '自定义',
      defaultDescription: ''
    },
    {
      id: 'comprehensive',
      name: '综合报告',
      defaultDescription: '综合报告',
      structureHint: '5 块结构：① 项目总体表现 ② 学员分布与动态 ③ 内容推进情况 ④ 6 维画像聚合 ⑤ 关键发现与建议'
    }
  ],

  // ============================================================
  // 4. 6 类图表 demo mock 数据（演 4 类 · 折线 / 散点占位）
  // ============================================================
  chartData: {
    bar_courseCompletion: {
      title: 'Course 完成率对比',
      xLabel: 'Course',
      yLabel: '完成率 (%)',
      labels: ['Course 1', 'Course 2', 'Course 3', 'Course 4', 'Course 5'],
      values: [78, 65, 58, 42, 35],
      max: 100,
      unit: '%'
    },

    pie_learnerStatus: {
      title: '学员三态占比',
      total: 32,
      slices: [
        { label: '活跃', value: 18, color: '#22D3EE', pct: 56 },
        { label: '风险', value: 8,  color: '#F4A855', pct: 25 },
        { label: '沉默', value: 6,  color: '#9CA3AF', pct: 19 }
      ]
    },

    table_keyLearners: {
      title: '关键学员动态',
      columns: [
        { key: 'name', label: '学员', sortable: true },
        { key: 'course', label: '当前 Course', sortable: false },
        { key: 'completion', label: '完成率', sortable: true },
        { key: 'status', label: '状态', sortable: true },
        { key: 'lastActive', label: '最近活跃', sortable: true }
      ],
      rows: [
        { name: '张三', course: 'Course 2', completion: '95%', status: '领先', lastActive: '今天' },
        { name: '赵六', course: 'Course 2', completion: '88%', status: '领先', lastActive: '今天' },
        { name: '王五', course: 'Course 2', completion: '85%', status: '领先', lastActive: '昨天' },
        { name: '李四', course: 'Course 1', completion: '52%', status: '正常', lastActive: '昨天' },
        { name: '孙七', course: 'Course 1', completion: '48%', status: '正常', lastActive: '2 天前' },
        { name: '周九', course: 'Course 1', completion: '15%', status: '风险', lastActive: '8 天前' },
        { name: '吴十', course: 'Course 0', completion: '5%',  status: '沉默', lastActive: '15 天前' }
      ]
    },

    stackedBar_timeDistribution: {
      title: 'Course 内 Activity 时长分布（小时）',
      xLabel: 'Course',
      yLabel: '学习时长 (小时)',
      labels: ['Course 1', 'Course 2', 'Course 3', 'Course 4', 'Course 5'],
      stacks: [
        { label: 'Lecture', color: '#D97757', values: [22, 18, 14, 8, 6] },
        { label: 'Practice', color: '#A78BFA', values: [16, 12, 18, 6, 4] },
        { label: 'Recap', color: '#22D3EE', values: [6, 4, 3, 1, 1] }
      ]
    },

    // 占位（demo 不演但保留 schema）
    line_completionTrend: { placeholder: true },
    scatter_engagementVsCompletion: { placeholder: true }
  },

  // ============================================================
  // 5. Report Ora 行为 mock
  // ============================================================
  reportOra: {
    persona: 'female',
    avatarLabel: 'Ora',

    // 进编辑器开场（管理员从报告库点入已存在的报告 / 新建）
    onEnterEditor: {
      existing: '我已经把"项目中期综合报告"加载好了 · 你最近一次离开停在第 ② 块 · 要不要继续从"学员分布与动态"细化？',
      newComprehensive: '我已经基于"综合报告"模板拉了项目至今的全员数据 · 初稿生成了 5 块结构 · 你看哪块需要细化？',
      newFree: '草稿已生成 · 4 块结构待你跟我聊完逐块填充 · 试试说"加一个 Course 完成率柱图"。'
    },

    // chat 直接触发图表（关键词匹配）
    chartChatTriggers: [
      {
        keywords: ['Course 完成率', '完成率柱图', '完成率对比', 'course完成率'],
        chartType: 'bar',
        dataKey: 'bar_courseCompletion',
        replyText: '明白 · Course 完成率柱图 · 5 个 Course 项目至今的数据已就绪 · 已插入到当前光标位置。'
      },
      {
        keywords: ['三态占比', '学员状态', '活跃风险沉默', '学员分布'],
        chartType: 'pie',
        dataKey: 'pie_learnerStatus',
        replyText: '三态占比饼图来了 · 18 活跃 / 4 风险 / 2 沉默 · 已插入。'
      },
      {
        keywords: ['关键学员', '学员名单', 'top学员', '风险表'],
        chartType: 'table',
        dataKey: 'table_keyLearners',
        replyText: '关键学员动态表 · 7 行（含领先 / 正常 / 风险 / 沉默 4 类）· 已插入。'
      },
      {
        keywords: ['时长分布', 'activity时长', '学习时长', '堆叠'],
        chartType: 'stacked-bar',
        dataKey: 'stackedBar_timeDistribution',
        replyText: '堆叠柱图 · Course 内 Lecture / Practice / Recap 时长分布 · 已插入。'
      }
    ],

    // 按钮触发（B 触发） · 多轮 askUserQuestion 序列
    chartButtonFlow: {
      // 选完图表类型后的 ask 序列
      bar: [
        { question: '柱状图想看哪个维度？', options: ['Course 完成率', 'Activity 完成率', '学员维度'] },
        { question: '排序方式？', options: ['完成率倒序', 'Course id 顺序', '原顺序'] }
      ],
      pie: [
        { question: '饼图统计什么？', options: ['学员三态占比', 'Activity 类型占比', '角色分布'] }
      ],
      table: [
        { question: '表格展示哪类数据？', options: ['关键学员动态', '风险学员明细', 'Top 完成率 Top 10'] }
      ],
      'stacked-bar': [
        { question: '堆叠柱想看哪个维度？', options: ['Course 内 Activity 时长', 'Course 内 学员状态分布', '周维度活跃分布'] }
      ]
    },

    // vibe 写作 关键词触发（v1.2 · 加 list / paragraph 双类型）
    vibeWritingTriggers: [
      // Step 6.1 主线触发：⑤ 块写成 5 条清单
      {
        keywords: ['⑤', '清单', '建议', '可执行'],
        type: 'list',
        replyText: '好 · 我整理 5 条优先级建议 · 已插入到 ⑤ 块下方。',
        listItems: [
          '**领先组**（6 人）已展现跨场景迁移能力，建议 Course 4 启动时邀请其作为 peer 案例分享 · 责任人：项目运营 · 时间：W7 启动会',
          '**Course 3 卡点**根源不在内容难度，而在"防御穿透"工具的实操不熟——建议补一节 ACT-001-03 增强对练 · 责任人：内容设计 · 时间：W7 内',
          '**4 名风险学员**（朱琪 / 秦雷 / 尤海 / 许刚）安排 1v1 触达 · 重新激活并降低对练难度阈值 · 责任人：项目运营 · 时间：本周内',
          '**2 名沉默学员**（何颖 / 吕菲）线下追访了解阻塞原因 · 必要时启动退出流程 · 责任人：HR · 时间：W7 末',
          '**学习自驱维度**项目均值偏低，建议在 Course 4 引入"个人学习目标设定"机制 · 责任人：内容设计 · 时间：Course 4 启动前'
        ]
      },
      {
        keywords: ['写一段', '生成段落', '分析', 'Course 3', '卡点'],
        type: 'paragraph',
        replyText: '已根据 Course 3 数据生成段落 · 约 180 字 · 已插入到光标位置。',
        generatedText: 'Course 3 学员推进确实出现了几个卡点。从 ACT-001-03（重构被动型员工）的对练数据看，第三轮通过率只有 42%——明显低于 Course 1 / 2 的同期水平。卡点根源不在内容理解（前置 Lecture 通过率 81%），而在"防御穿透"工具的实操不熟。具体表现为：识别"对方进入情感隔离"的信号准确率高，但落到"提取小动作"步骤时容易回到说理。建议下一周补一节 ACT-001-03 增强对练，并把 4 名 Course 3 卡点学员单独拉一组小群带练。'
      },
      {
        keywords: ['写一段', '生成', '总体表现', '总结'],
        type: 'paragraph',
        replyText: '已生成项目总体表现段落 · 约 150 字 · 已插入。',
        generatedText: '项目进入第 6 周（W6/26），整体进度 28%，处于设计预期区间。学员活跃度本周环比上升 12%，是 6 周内峰值。24 名学员中 18 人持续活跃，4 人出现风险信号，2 人尚未真正进入项目。Course 1 完成率 78% 处于领先，Course 3 因防御穿透训练难度出现明显卡点（完成率 58%）。整体风险可控，但需在 W7-W8 重点干预 Course 3 卡点学员与 2 名沉默学员。'
      }
    ],

    // v1.4 · 划词修改回应 · 学员名 = AdminCtx 24 人（田静/陈静/赵工 取代 张三/周九/新员工）
    selectionExpand: {
      replyText: '已扩写 · 加了 2 条数据证据 + 引用田静在 ACT-001-03 的具体表现。',
      // 替换文本（demo 用 hard-code · 真 prod 用 LLM）
      replacementText: '24 名学员目前呈现明显的三态分布：21 人（87%）持续活跃，1 人出现风险信号（连续 2 周无登录或 Activity 推进停滞），2 人沉默（注册后近期未发生有效学习）。其中风险学员田静集中在 Course 3 卡点（重构被动型员工 ACT-001-03），与 Course 3 整体完成率偏低互为印证。从典型样本看：赵工在 Course 3 第三轮对练中已能稳定运用"防御穿透 3 步"，而田静（风险）在同一节点连续 2 次未通过，对比明显——这与 6 维画像中"挑战接纳"维度的差异（赵工 L4 vs 田静 L2）一致。沉默学员（何颖 / 吕菲）首月学习意愿整体偏弱。'
    },
    selectionShorten: {
      replyText: '已缩写 · 保留核心 · 删除冗余描述。',
      replacementText: '32 名学员呈现三态分布：活跃 18 / 风险 8 / 沉默 6。风险学员中 5 名集中在 Course 3 卡点。'
    },
    selectionCustomDefault: {
      replyText: '收到指令 · 我会按"更专业的语气"重写 · 已替换原文。',
      replacementText: '截至本周（W6），32 名学员的整体动态分布呈现典型三态结构：56% 处于持续活跃区间，25% 触发风险预警阈值，19% 尚未完成项目入场。值得关注的是，风险学员群体与 Course 3 卡点存在显著相关性。'
    },

    // v1.4 老报告 chat 修改 + Cursor-style diff（找到目标段 → 渲染 diff → 接受/拒绝）
    chatModifyTriggers: [
      {
        keywords: ['②', '加', '证据'],
        targetH2: '② 学员分布与动态',
        matchPrefix: '呈现明显的三态分布',
        replyText: '我把 ② 块开场段加了 Course 3 卡点的具体证据 · 我把改动展示给你看 · 你确认接受还是拒绝。',
        newHtml: '24 名学员目前呈现明显的三态分布：18 人（75%）持续活跃，4 人（17%）出现风险信号——其中 4 名风险学员（朱琪 / 秦雷 / 尤海 / 许刚）**全部集中在 Course 3 卡点**（重构被动型员工 ACT-001-03），与 Course 3 整体完成率偏低互为印证。剩余 2 人（8%）尚未真正进入项目。'
      },
      {
        keywords: ['②', '缩短'],
        targetH2: '② 学员分布与动态',
        matchPrefix: '呈现明显的三态分布',
        replyText: '我把 ② 块开场段缩短了 · 接受请点 ✓ · 不满意点 ✗。',
        newHtml: '24 名学员呈现三态分布：18 活跃 / 4 风险 / 2 沉默 · 风险集中在 Course 3 卡点。'
      },
      {
        keywords: ['①', '总体表现', '专业'],
        targetH2: '① 项目总体表现',
        matchPrefix: '项目进入第 6 周',
        replyText: '我把 ① 块开场段重写得更专业一点 · 你看下面的版本。',
        newHtml: '截至本周（W6 / 26），项目总体进度推进至 28%（已用 42 / 183 个项目周期日），整体节奏处于设计预期区间。本周学员活跃度环比提升 12%，达到自项目启动以来 6 周内峰值。Course 1 横向协作完成率领先（78%）；Course 4 / Course 5 受开放时序影响整体偏低，符合阶段预期。'
      }
    ],

    // v1.4 · 跨 Tab 引用回应 · 学员名 = AdminCtx 24 人之一（u22 田静 / u8 陈静）· 决策点 D2-A
    crossTabReference: [
      {
        keywords: ['田静', 'course 1', 'recap', '团队协作', '跨过'],
        replyText: '已从田静 Course 1 横向协作 recap 中摘取关于团队协作的段落 · 加了来源标注。',
        sourceLabel: '田静 · Course 1 横向协作 · 个人小结 · 2026-04-15',
        quoteText: '我在 Course 1 的对练中第一次跨过了"被钩两次再回正"的反应模式——这是我之前 3 次重构对练里都没做到的。具体场景是和销售骨干小李对齐 KPI 拆解，他第二次甩"那你定吧"过来时，我没有像之前那样追加说理，而是停了 2 秒，把场景具体化到上周三那个客户对账的事上。'
      },
      {
        keywords: ['陈静', '新员工', '主动'],
        replyText: '已从陈静 ACT-001-02 高光卡中摘取主动表达相关内容 · 加了来源标注。',
        sourceLabel: '陈静 · 高光卡 · ACT-001-02 · 2026-04-16',
        quoteText: '我跟产品的小王约了个 30 分钟同步，以前我都是等他来找我。'
      }
    ],

    // Ora 4 类卡片 demo 触发清单（v1.1 时序：报告引用 → 学员快照 → askUserQuestion → 证据）
    oraCards: {
      // Step 5 进编辑器开场后 800ms 推（提示历史 team report 参考）
      reportRef: {
        title: '报告引用 · W4 风险学员分析',
        body: '我注意到你 5 天前的「W4 风险学员分析」§ 干预建议 跟这次 ⑤ 块要写的有重叠 · 要不要先参考？',
        targetReportId: 'rpt-002',
        cta: '打开 W4 报告'
      },
      // Step 6.5 chat 加表后推（关联讨论的核心学员）
      learnerSnapshot: {
        title: '学员快照 · 张三',
        body: '区域销售总监 · Course 2 推进中 · 6 维领先（5/5/4/5/4/5）· 完成率 83% · 高光卡 3 张。',
        targetLearnerId: 'L01',
        cta: '展开个体详情'
      },
      // Step 6.6 中段决策分叉（v1.5 改为 4 选项 · 直接对应 demo 动作 · 串联 chat 加图 + chat 改报告）
      askQuestion: {
        title: 'Ora 想问你',
        question: '看完初稿 + 加了关键学员表 + 张三快照 · 接下来想做什么？',
        options: ['② 块加点 Course 3 证据', '② 块开场段缩短', '引用田静 Course 1 recap', '继续到 ⑤ 块写清单']
      },
      // Step 7.4 划词扩写后推（解释扩写依据）
      evidence: {
        title: '证据卡 · Course 3 卡点归因',
        body: '4 名 Course 3 卡点学员中，「挑战接纳」维度 L2 以下；同期张三（L4）连续 3 次通过对练。',
        memoryRef: 'mem://course3/dropoff-2026W6'
      }
    },

    // 通用 fallback
    fallbackResponse: '我可以帮你：① 生成图表（"加一个 X 图"）② 写一段（"写关于 Y 的分析"）③ 划词改（选中后用菜单或 chat 指令）④ 引用学员报告（"引用田静 Course 1 recap"）⑤ 导出 PDF / Word。'
  },

  // ============================================================
  // 6. demo 默认行为开关
  // ============================================================
  demoFlags: {
    defaultView: 'library',          // library | editor
    defaultTab: 'manager',           // manager | student
    autoToastReady: true,            // 进入即 toast 提示 demo 路径
    enableIdleModal: false,          // demo 期不弹 idle modal（避免打断录屏）
    chartABDemoCount: 4              // demo 演 4 类图表
  }
};
