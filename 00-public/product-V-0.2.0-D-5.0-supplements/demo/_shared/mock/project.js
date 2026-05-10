// 共享 mock · 项目元数据 + Demo 账号
// 单 source · login / hall / mgthome / proconfig / massagemgt 五页全消费
// 工程纪律 N · 跨场域产出物单 store

// 项目基础信息（hall hero / mgthome topbar / proconfig 板块 1 共消费）
window.PROJECT = {
  name: '基层管理者培训项目',
  // 学习态进度
  weekIndex: 6, weekTotal: 26,
  startDate: '2026-03-22', endDate: '2026-09-22',
  progress: 28,
  daysToNextMilestone: 42,
  nextMilestone: 'W12 复盘 milestone',

  // proconfig 板块 1 「项目基础信息」字段（v1.3 融合后扩入 · 单 source）
  serviceCycle: { start: '2026-03-22', end: '2027-03-22' },   // 服务周期 1 年（含项目周期 + 剩余 6 月）
  projectCycle: { start: '2026-03-22', end: '2026-09-22' },   // 项目周期 6 月（同 startDate/endDate）
  description: '面向制造业 24 名基层管理者的能力转型项目 · 6 个月 · 含 8 Course / 29 Activity',
  customerName: '某 500 强 · 制造业',
  // companyContext: 'Coming Soon · V0.6.0+'
  status: 'running'  // pre-launch / running（demo 仅 2 态 · 后 3 态留白）
};

// 学员总数（hall hero / mgthome 看板）· 派生自 AdminCtx.members（学员）
// 注：admin.js 的 24 全部 isLearner=true（含 2 多角色），所以总数 = 24
window.STUDENT_TOTAL = 24;

// Demo 登录账号（4 个）· 来源 = AdminCtx.members 中 u1/u2/u3 派生 + 1 错误号
// 单 source 约束：以下 account/email/display 必须跟 admin.js 同步
window.DEMO_ACCOUNTS = (function () {
  // admin.js 必须先于本文件加载（HTML 引入顺序：admin.js → project.js）
  const A = window.AdminCtx || { members: [], findMember(){ return null; } };
  function fromMember(memberId, role, target, password) {
    const m = A.findMember(memberId);
    if (!m) {
      // admin.js 未加载兜底（理论不会到 · 保留启动期容错）
      return { account: '', password, role, display: '', target };
    }
    return {
      account: m.email,                 // login 用 email 当账号
      password: password,
      role: role,
      display: m.name,
      target: target,
      memberId: m.id
    };
  }
  return [
    fromMember('u1', 'learner',         'hall',    'demo2026'),
    fromMember('u2', 'admin',           'mgthome', 'demo2026'),
    fromMember('u3', 'learner+admin',   'hall',    'demo2026'),
    { account: 'error@demo.neolearning.com', password: 'any', role: 'error-trigger', display: '', target: null }
  ];
})();
