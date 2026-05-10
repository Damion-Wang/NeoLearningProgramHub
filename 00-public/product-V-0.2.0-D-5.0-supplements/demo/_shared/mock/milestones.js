// 共享 mock · 项目里程碑（合并学习节奏 + 业务事件）
// 单 source · hall hero/时间轴/热力图 + mgthome 时间线/健康度热力 + proconfig 板块 2 全消费
// 取代了 v1.3 之前的 _shared/mock/timeline.js（已删）
//
// 决策点（v1.3 自审 #6+#7）：里程碑只有一份 · timeline 是它的可视化呈现层
//
// type 分类：
//   kickoff   开营节点
//   check     学习节奏检查点（中期 · W4）
//   recap     学习复盘节点（W12）
//   business  业务事件（汇报 / 满意度 / OKR 复盘）
//   closing   结营节点
//
// 字段：
//   id          string   稳定 id（避免 name 中文歧义）
//   name        string   显示名（Course 内 / 时间轴标签）
//   date        ISO      具体日期
//   weekIndex   number   1-based · 项目第几周（1-26）
//   pct         number   0-100 · 在 26 周时间轴上的百分比位置（用于 hall/mgthome 时间轴 marker · pct = (weekIndex-1)/26 * 100）
//   type        string   见上
//   mandatory   boolean  是否必经里程碑（结营 = true · 其他 false · 但 demo 都展示）
//   relatedActivities array<string>  关联 Activity id（"CRS-XXX/ACT-XXX-XX" 字符串）
//   passed      boolean  当前是否已过（hall 时间轴 marker passed/active/future 渲染用 · 派生自 weekIndex vs PROJECT.weekIndex）

window.MILESTONES = (function () {
  const startDate = '2026-03-22';
  const endDate   = '2026-09-22';
  const totalWeeks = 26;
  // hall hero "距下里程碑" 默认指向 type='check' / 'recap' 系节点（学习态视角）
  // 业务事件（business）混排进时间轴 · 但默认不作为"距下里程碑"主语

  const list = [
    { id: 'kickoff',         name: '开营',           date: '2026-03-22', weekIndex: 1,  type: 'kickoff',  mandatory: true,  relatedActivities: [] },
    { id: 'check-w4',        name: 'W4 中期检查',    date: '2026-04-12', weekIndex: 4,  type: 'check',    mandatory: false, relatedActivities: [] },
    { id: 'biz-h1-report',   name: '上半年汇报准备', date: '2026-05-15', weekIndex: 8,  type: 'business', mandatory: false, relatedActivities: ['CRS-002/ACT-002-03'] },
    { id: 'recap-w12',       name: 'W12 复盘',       date: '2026-06-07', weekIndex: 12, type: 'recap',    mandatory: false, relatedActivities: [] },
    { id: 'biz-mid-survey',  name: '中期满意度调查', date: '2026-06-30', weekIndex: 15, type: 'business', mandatory: false, relatedActivities: [] },
    { id: 'biz-q3-okr',      name: 'Q3 OKR 复盘',    date: '2026-08-15', weekIndex: 21, type: 'business', mandatory: false, relatedActivities: ['CRS-004/ACT-004-03'] },
    { id: 'closing',         name: '结营',           date: '2026-09-22', weekIndex: 26, type: 'closing',  mandatory: true,  relatedActivities: ['CRS-008/ACT-008-03'] }
  ];
  // 派生字段：pct + passed
  const currentWeek = (window.PROJECT && window.PROJECT.weekIndex) || 6;
  list.forEach(m => {
    m.pct = Math.round(((m.weekIndex - 1) / (totalWeeks - 1)) * 100);
    m.passed = m.weekIndex < currentWeek;
  });

  return {
    startDate, endDate, totalWeeks, currentWeek,
    list,
    // 兼容 timeline.js 旧字段（已删 · 这里保留 alias）
    milestones: list,
    currentPct: Math.round(((currentWeek - 1) / (totalWeeks - 1)) * 100)
  };
})();

window.Milestones = (function () {
  return {
    all() { return window.MILESTONES.list; },
    /** 返回当前周之后第一个 type ∈ filter 的里程碑（默认 hall "距下里程碑" 用 check/recap） */
    nextOf(typeFilter) {
      const types = typeFilter || ['check', 'recap', 'closing'];
      const cw = window.MILESTONES.currentWeek;
      return window.MILESTONES.list.find(m => m.weekIndex > cw && types.includes(m.type)) || null;
    },
    /** 返回 type ∈ filter 的所有 · 默认全部 */
    byType(typeFilter) {
      if (!typeFilter) return window.MILESTONES.list.slice();
      const set = new Set(Array.isArray(typeFilter) ? typeFilter : [typeFilter]);
      return window.MILESTONES.list.filter(m => set.has(m.type));
    },
    /** 距下里程碑天数（基于今日 vs date · demo 阶段用 PROJECT.startDate + weekIndex 派生） */
    daysToNext(typeFilter) {
      const next = this.nextOf(typeFilter);
      if (!next) return null;
      // 派生今日：开营 + (currentWeek-1) * 7 天
      const today = new Date(window.MILESTONES.startDate);
      today.setDate(today.getDate() + (window.MILESTONES.currentWeek - 1) * 7);
      const target = new Date(next.date);
      return Math.max(0, Math.round((target - today) / 86400000));
    },
    findById(id) { return window.MILESTONES.list.find(m => m.id === id) || null; }
  };
})();
