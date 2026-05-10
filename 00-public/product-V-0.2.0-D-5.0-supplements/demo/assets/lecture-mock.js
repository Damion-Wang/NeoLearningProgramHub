/* ============================================================
   Lecture · MOCK DATA
   17 SCO 序列：6 SLICE + 1 VIDEO + 7 QUIZ + 2 FEEDBACK + 1 锁定 SLICE
   默认进入：SCO 16（倒数第二 · 综合判断单选题）
   ============================================================ */

// 重复字段读 _shared/mock/project.js + Session（v1.2 工程纪律 A · DRY）
(function () {
  const _s = (window.Session && window.Session.get()) || {};
  const _name = _s.display || '赵工';
  const _p = window.PROJECT || {};

window.LECTURE_MOCK = {
  learner: { name: _name, firstChar: _name.charAt(0), neoPersona: 'male', role: '区域销售主管 · 学员 + HR + 项目运营' },
  project: { name: _p.name || '基层管理者培训项目', weekIndex: _p.weekIndex || 6, weekTotal: _p.weekTotal || 26 },
  activity: {
    id: 'ACT-001-03',
    name: '重构被动型员工',
    course: 'CRS-001 辅导型管理'
  },

  scoSequence: [
    { id: 'SCO-001-03-01', order: 1, type: 'FEEDBACK_COLLECT', title: '你最近遇到的被动员工场景', status: 'completed',
      prompt: '描述一个具体的被动员工场景：他叫什么、做了什么、当时你怎么想、最后结果如何。',
      studentAnswer: '我们设计部的赵工，最近三次让他写项目复盘他都拖到 deadline 当天才交，质量也马虎。我催他他就说"又来了"，我感觉他在抗拒……' },
    { id: 'SCO-001-03-02', order: 2, type: 'SLICE', title: '被动型员工的 4 大特征', status: 'completed',
      asset: 'assets/ppt/MANAGER3_segment_1.1.jpg',
      neoScript: '看这一页四个特征：拖延、表面服从、否定建议、情绪化。注意——单独一个不算被动型，是这四个组合在一起，且持续出现。你刚才说的赵工，"又来了"这句话，已经踩中了表面服从加情绪化两个信号。' },
    { id: 'SCO-001-03-03', order: 3, type: 'SLICE', title: '心理防御机制', status: 'completed',
      asset: 'assets/ppt/MANAGER3_segment_2.1.jpg',
      neoScript: '为什么会出现这些行为？背后是心理防御。三个核心机制——自我保护、归因外推、情感隔离。理解这一点你才不会陷入"我怎么管这种人"的对抗里。' },
    { id: 'SCO-001-03-04', order: 4, type: 'QUIZ', quizType: 'single_choice',
      title: '判断员工类型', status: 'completed',
      thumbnail: 'assets/ppt/MANAGER3_segment_1.1.jpg',
      question: '下面哪个反应最符合被动型员工的"心理防御"特征？',
      options: [
        { key: 'A', text: '立即承诺并按时交付' },
        { key: 'B', text: '表面同意但持续拖延，被催时说"又来了"' },
        { key: 'C', text: '直接当面提出反对意见' },
        { key: 'D', text: '请求增加资源后再开始' }
      ],
      correct: ['B'],
      passCondition: { type: 'select_correct' },
      neoFeedback: {
        correct: '对了——B 是典型的"表面服从 + 行动落差 + 情感隔离"组合。注意"又来了"这句，是情感隔离的语言信号。',
        wrong: '再想想：A 是主动反应，C 是反抗型，D 是依赖型。被动型的核心是"嘴上同意"和"实际行动"之间的落差，关键信号在哪？',
        hint: '提示：注意"嘴上同意"vs"实际行动"的差距。'
      }
    },
    { id: 'SCO-001-03-05', order: 5, type: 'VIDEO', title: '案例：变量交换的智慧', status: 'completed',
      asset: 'assets/case-zhao-32.mp4', duration: 81,
      thumbnail: 'assets/case-zhao-poster.jpg' },
    { id: 'SCO-001-03-06', order: 6, type: 'SLICE', title: '防御穿透 3 步', status: 'completed',
      asset: 'assets/ppt/MANAGER3_segment_4.1.jpg',
      neoScript: '刚才视频里刘姐做的事，可以拆成三步——不接情绪、具体化场景、最小行动。这一页 PPT 帮你把它结构化记下来。' },
    { id: 'SCO-001-03-07', order: 7, type: 'QUIZ', quizType: 'multi_choice',
      title: '防御信号识别（可多选）', status: 'completed',
      thumbnail: 'assets/ppt/MANAGER3_segment_4.1.jpg',
      question: '下面哪些是被动型员工的"心理防御信号"？（可多选）',
      options: [
        { key: 'A', text: '"又来了"" 算了吧"' },
        { key: 'B', text: '主动报告进度' },
        { key: 'C', text: '把"我不会做"换成"这事儿不重要"' },
        { key: 'D', text: '每次都说"快了快了"，但永远没结果' },
        { key: 'E', text: '被问问题时反问"你觉得呢"' }
      ],
      correct: ['A', 'C', 'D', 'E'],
      passCondition: { type: 'select_correct' },
      neoFeedback: {
        correct: '对——4 个都是经典防御信号。B 是反例，主动型才会做。',
        wrong: '想想：哪个动作是"主动承担"？反过来其他都是回避或推卸。',
        hint: '提示：B 项是"我开始 / 我推进"的表达，其他都是"我不"或"反正"。'
      }
    },
    { id: 'SCO-001-03-08', order: 8, type: 'QUIZ', quizType: 'judge',
      title: '责任归位 — 判断对错', status: 'completed',
      thumbnail: 'assets/ppt/MANAGER3_segment_4.1.jpg',
      question: '员工说"这事儿不归我管"时，最有效的应对是直接告诉他"这就是你的责任"。',
      correct: false,
      passCondition: { type: 'select_correct' },
      neoFeedback: {
        correct: '对——直接归位会撞墙。先不接情绪，再用具体场景帮他看到自己的角色。',
        wrong: '再想想：直接说"是你的责任"会发生什么？他会怎么反应？',
        hint: '提示：被动型员工最反感被"说教"。需要先承认他的视角。'
      }
    },
    { id: 'SCO-001-03-09', order: 9, type: 'SLICE', title: '责任意识重构 4 步', status: 'completed',
      asset: 'assets/ppt/MANAGER3_segment_6.1.jpg',
      neoScript: '让我们升级方法。穿透只是第一步，真正难的是重构责任意识——4 步：1) 共同澄清事实，2) 提取他的小动作（哪怕只 5%），3) 把这小动作放回大目标里给反馈，4) 邀请他自己提下一步。' },
    { id: 'SCO-001-03-10', order: 10, type: 'QUIZ', quizType: 'fill_blank',
      title: '概念回填', status: 'completed',
      thumbnail: 'assets/ppt/MANAGER3_segment_6.1.jpg',
      question: '责任意识重构 4 步中，第 1 步是 ____ 事实，第 4 步是邀请他自己提 ____。',
      blanks: ['共同澄清', '下一步'],
      passCondition: { type: 'select_correct' },
      neoFeedback: { correct: '记住了。', wrong: '回顾上一节 SLICE。', hint: '回顾上一节 SLICE 的 4 步。' }
    },
    { id: 'SCO-001-03-11', order: 11, type: 'QUIZ', quizType: 'match',
      title: '信号 ↔ 应对策略', status: 'completed',
      thumbnail: 'assets/ppt/MANAGER3_segment_6.1.jpg',
      question: '把左边的"防御信号"连到右边对应的"应对策略"。',
      leftItems: [
        { key: 'L1', text: '"又来了"' },
        { key: 'L2', text: '不主动汇报进度' },
        { key: 'L3', text: '"我不擅长"' },
        { key: 'L4', text: '"反正你也决定了"' }
      ],
      rightItems: [
        { key: 'R1', text: '不接情绪 + 具体化场景' },
        { key: 'R2', text: '提取最小行动 + 邀请承诺' },
        { key: 'R3', text: '澄清能力 vs 意愿' },
        { key: 'R4', text: '邀请共同决策' }
      ],
      correct: { L1: 'R1', L2: 'R2', L3: 'R3', L4: 'R4' },
      passCondition: { type: 'select_correct' },
      neoFeedback: { correct: '4 对全连对。', wrong: '至少有 1 对错位，再想想——情感隔离的钩子在哪？', hint: '从最强的情绪信号开始想（"又来了"）。' }
    },
    { id: 'SCO-001-03-12', order: 12, type: 'QUIZ', quizType: 'sort',
      title: '责任意识重构 4 步排序', status: 'completed',
      thumbnail: 'assets/ppt/MANAGER3_segment_6.1.jpg',
      question: '把下面 4 个动作按"责任意识重构"的正确顺序排列。',
      shuffledItems: [
        { key: 'S3', text: '把这个小动作放到大目标里给反馈' },
        { key: 'S1', text: '共同澄清事实（不评价）' },
        { key: 'S4', text: '邀请他自己提出下一步' },
        { key: 'S2', text: '提取他的"小动作"（哪怕只 5%）' }
      ],
      correctOrder: ['S1', 'S2', 'S3', 'S4'],
      passCondition: { type: 'select_correct' },
      neoFeedback: { correct: '顺序对——澄清 → 提取 → 反馈 → 邀请。', wrong: '想想：如果先反馈再澄清，他会觉得你在评判。', hint: '关键：评价类的动作（反馈、邀请）必须建立在事实之上。' }
    },
    { id: 'SCO-001-03-13', order: 13, type: 'QUIZ', quizType: 'qa',
      title: '应用思考', status: 'completed',
      thumbnail: 'assets/ppt/MANAGER3_segment_8.1.jpg',
      question: '回到你提到的赵工——下次他再用"又来了"这种话挡你，你会怎么开场？至少写两句具体的话。',
      passCondition: { type: 'non_empty_in_chat', minChars: 30 },
      studentAnswer: '我会先停一下，不接他那句"又来了"。然后我会说："上次的项目复盘，第三段写到风险评估那里，是哪里你觉得不好下笔？我们一起看看。"',
      neoFeedback: { correct: '不错——开场不接情绪是关键。我看你已经把"具体化场景"用上了。', wrong: '可以更具体——"又来了"这句你打算怎么不接？', hint: '记住 3 步：不接情绪 → 具体化场景 → 最小行动。' }
    },
    { id: 'SCO-001-03-14', order: 14, type: 'SLICE', title: '案例对照与升华', status: 'completed',
      asset: 'assets/ppt/MANAGER3_segment_8.1.jpg',
      neoScript: '让我们把今天学的和你的赵工场景对一下：你之前用"催"，明天可以试"具体化 + 最小行动"。这一页是综合对照——左侧是常见错法，右侧是 4 步重构法。注意——重构不是一次成型，是几次对话的累积。' },
    { id: 'SCO-001-03-15', order: 15, type: 'FEEDBACK_REVIEW', title: '回看你的赵工场景', status: 'completed',
      prompt: '回看你之前说的赵工——下次再让他写复盘时，你打算怎么开场？把你想说的两到三句话写下来。',
      studentAnswer: '我会先承认他工作多："最近你确实事多，我知道。" 然后具体化："上次复盘第三段你停下来了，是哪里卡住？" 再邀请最小行动："要不咱们今天先把那一段过一遍，剩下的明天我再来找你？"',
      neoFollowup: '不错——你刚才说的开场，比单纯催效果好多了。具体化"第三段卡住"那句很有力。下次试试这两句中"具体化场景"那句先抛出来。'
    },

    // ========================================
    // ★ 当前进入位置 · SCO 16 综合判断单选题
    // ========================================
    { id: 'SCO-001-03-16', order: 16, type: 'QUIZ', quizType: 'single_choice',
      title: '综合应用 · 你会怎么开场？', status: 'current',
      thumbnail: 'assets/ppt/MANAGER3_segment_8.1.jpg',
      question: '回到赵工——下次他再用"又来了"挡你时，下面哪个开场最合 4 步重构法的精髓？',
      options: [
        { key: 'A', text: '"你这态度有问题，我们必须好好谈谈"' },
        { key: 'B', text: '"上次复盘第三段你卡在哪了？我们看看"' },
        { key: 'C', text: '"你不写没关系，我帮你写吧"' },
        { key: 'D', text: '"再这样下去就要扣绩效了"' }
      ],
      correct: ['B'],
      passCondition: { type: 'select_correct' },
      neoFeedback: {
        correct: '对了——B 是 不接情绪 + 具体化场景 的范式。看最后一页，我把今天讲的浓缩一下。',
        wrong: '再想想刚才学的 3 步——不接情绪、具体化、最小行动。A 是教育说教（激发更强防御），C 是包办（强化被动），D 是威胁（加深对抗）。再选一次。',
        hint: '提示：3 步里第 1 步是什么？哪个选项做到了？'
      }
    },

    // ========================================
    // ★ 最后一页 · SCO 17 总结升华 SLICE + TTS
    // 答对 SCO 16 后解锁 / Neo 演绎 4 句 mock TTS
    // ========================================
    { id: 'SCO-001-03-17', order: 17, type: 'SLICE', title: '总结升华', status: 'locked',
      asset: 'assets/ppt/MANAGER3_segment_9.1.jpg',
      // TTS 文件（按 Neo 性别取）+ 4 句分时打字脚本
      tts: {
        male: 'assets/sco17-tts-male.mp3',
        female: 'assets/sco17-tts-female.mp3'
      },
      neoScripts: [
        { delay: 0,    text: '这一节走完了。回头看，我们从赵工的"又来了"入手，识别出被动型员工的四大特征——拖延、表面服从、否定建议、情绪化。' },
        { delay: 12500, text: '然后通过刘姐的视频，把穿透防御拆成三步：不接情绪、具体化场景、最小行动。' },
        { delay: 21500, text: '最后升级到责任意识重构四步：澄清事实、提取小动作、放回大目标反馈、邀请下一步。' },
        { delay: 31500, text: '今天最重要的一个动作就够了——把"又来了"当钩子识别，然后不接、转场景。其他都是配料。下次面对赵工时，先做这一个。' }
      ]
    }
  ],

  // Chat 历史 mock：到 SCO 15 完成 + SCO 16 进入开场
  chatHistory: [
    { role: 'neo', speech: 'lecture', scoRef: 1, text: '在我们开始之前，先想想你自己最近遇到的具体场景——一个真实的人、一件具体的事、当时你怎么想、最后什么结果。具体一点最好。' },
    { role: 'user', text: '我们设计部的赵工，最近三次让他写项目复盘他都拖到 deadline 当天才交，质量也马虎。我催他他就说"又来了"，我感觉他在抗拒。' },
    { role: 'neo', speech: 'lecture', scoRef: 1, text: '记下了。"又来了"这个词我先记着——一会儿讲到防御信号时我们会回到它。' },
    { role: 'neo', speech: 'lecture', scoRef: 2, text: '看这一页四个特征：拖延、表面服从、否定建议、情绪化。注意——单独一个不算被动型，是这四个组合在一起。你刚才说的赵工，"又来了"已经踩中了表面服从加情绪化两个信号。' },
    { role: 'user', text: '那拖延算第几类？跟普通拖延有什么不一样？' },
    { role: 'neo', speech: 'qa', text: '好问题。第 1 类。区别在于：普通拖延是"我想做但没时间"，被动型拖延是"我不想做但说我会做"。前者你催一下就动了，后者催到 deadline 当天才动。' },
    { role: 'neo', speech: 'lecture', scoRef: 4, text: '来一道判断题——这道题答完，你应该能在赵工身上识别出至少两个信号。' },
    { role: 'user', text: 'B' },
    { role: 'neo', speech: 'qa', text: '对了——B 是 4 大特征里的核心组合：表面同意 + 行动落差 + 情感隔离。注意"又来了"这句，是情感隔离的语言信号。' },
    { role: 'highlight-card', highlight: { title: '把"又来了"识别为情感隔离信号', quote: '"我催他他就说『又来了』，我感觉他在抗拒"', neoNote: '从行为现象到心理机制的跨越——这是教学层和应用层之间的关键一步', meta: '授课 · ACT-001-03 · SCO 4' } },
    { role: 'neo', speech: 'lecture', scoRef: 5, text: '接下来一段案例视频——大概一分多钟。看完后我们在下一节讨论刘姐做对了哪一步。' },
    { role: 'neo', speech: 'lecture', scoRef: 13, text: '回到你提到的赵工——下次他再用"又来了"挡你，你会怎么开场？至少写两句具体的话。' },
    { role: 'user', text: '我会先停一下，不接他那句"又来了"。然后我会说："上次的项目复盘，第三段写到风险评估那里，是哪里你觉得不好下笔？我们一起看看。"' },
    { role: 'neo', speech: 'qa', text: '不错——开场不接情绪是关键。我看你已经把"具体化场景"用上了。' },
    { role: 'neo', speech: 'lecture', scoRef: 15, text: '再回看一次你的赵工场景——下次让他写复盘时，你打算怎么开场？把想说的两到三句话写下来。' },
    { role: 'user', text: '我会先承认他工作多："最近你确实事多，我知道。" 然后具体化："上次复盘第三段你停下来了，是哪里卡住？" 再邀请最小行动："要不咱们今天先把那一段过一遍，剩下的明天我再来找你？"' },
    { role: 'neo', speech: 'qa', text: '不错——你刚才说的开场，比单纯催效果好多了。具体化"第三段卡住"那句很有力。下次试试这两句中"具体化场景"那句先抛出来。' },
    { role: 'neo', speech: 'lecture', scoRef: 16, text: '我们最后做一个综合判断——这道题选对了，我把今天讲的浓缩一遍给你。' }
  ],

  // Project 全量目录
  courseTree: [
    { id: 'CRS-001', name: '辅导型管理', status: 'in_progress', activities: [
      { id: 'ACT-001-01', name: 'GROW 模型', type: 'lecture', status: 'completed' },
      { id: 'ACT-001-02', name: '催化主动型员工', type: 'lecture', status: 'completed' },
      { id: 'ACT-001-03', name: '重构被动型员工', type: 'lecture', status: 'in_progress' },
      { id: 'ACT-001-04', name: 'GROW 辅导对练', type: 'practice', status: 'locked' },
      { id: 'ACT-001-05', name: '辅导型管理报告', type: 'recap', status: 'locked' }
    ]},
    { id: 'CRS-002', name: '横向协作', status: 'locked', activities: [
      { id: 'ACT-002-01', name: '跨部门协作的认知陷阱', type: 'lecture', status: 'locked' },
      { id: 'ACT-002-02', name: 'PIN 法：立场-利益-需求', type: 'lecture', status: 'locked' },
      { id: 'ACT-002-03', name: '跨部门协作对练', type: 'practice', status: 'locked' },
      { id: 'ACT-002-04', name: '横向协作报告', type: 'recap', status: 'locked' }
    ]},
    { id: 'CRS-003', name: '向上沟通', status: 'locked', activities: [] },
    { id: 'CRS-004', name: '团队激励', status: 'locked', activities: [] }
  ],

  bellMessages: [
    { type:'system',   sender:'系统通知',           title:'你的 ACT-001-02 已完成 · 个人小结已生成',         desc:'你完成的「催化主动型员工」16/16 SCO 全部学习记录已沉淀，可在大厅 → 学习成果 → 我的报告 中查看个人小结。', time:'昨天 18:42', unread:true },
    { type:'platform', sender:'睿学平台',           title:'W6 学习计划提醒 · 还剩 1 个 Activity',           desc:'按你的学习计划，本周（W6）还需完成 ACT-001-03 重构被动型员工。完成后将进入 GROW 辅导对练 Activity。', time:'今天 09:15', unread:true },
    { type:'user',     sender:'王 HR · 项目运营',   avatarChar:'王',  title:'本周五前完成 Course 1 可获线下集训优先选座权', desc:'本周五 18:00 前完成 Course 1 全部学习任务的同学，可获得 Q3 线下集训营优先选座权（前 10 名席位）。', time:'昨天 11:08', unread:true },
    { type:'system',   sender:'系统通知',           title:'新增高光卡片收藏功能',                           desc:'现在 Neo 在授课中识别到你的顿悟瞬间会推送高光卡片，你可以选择「⭐ 收藏」沉淀到大厅 → 我的高光。', time:'3 天前', unread:false },
    { type:'platform', sender:'睿学平台',           title:'4 月平台维护通知',                                desc:'4 月 14 日 02:00-04:00 平台例行维护，期间登录可能受影响，请避开时段。', time:'4/10', unread:false }
  ]
};
})();
