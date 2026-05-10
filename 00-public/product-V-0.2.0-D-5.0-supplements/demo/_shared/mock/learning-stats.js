// 共享 mock · 24 学员的学习态统计（progress/hours/lastLogin/login/prog 等）
// 单 source · mgthome 学员表 + 个体面板 + 学员表现 widget 全消费
// 跟 _shared/mock/admin.js (24 members) 一一对应（按 memberId）
//
// 决策点（v1.3 自审 #1+#17）：身份归 admin.js · 表现归本文件 · 关注点分离
//
// 字段：
//   progress  number    已完成 Activity 数（max=29）
//   total     number    Activity 总数（恒 29 跟 COURSE_PACK 对齐）
//   hours     number    累计学习时长（小时）
//   interactions number Neo 互动次数
//   lastLogin string    人类可读相对时间（"今天 09:12" / "5 天前"）
//   login     'active'|'risk'|'silent'  登录态分类
//   prog      'ahead'|'onTrack'|'behind' 进度态分类
//
// 注：HR 王 / 陈总 是多角色（isAdmin），仍有 isLearner 维度的进度数据
//     mgthome 学员表渲染时按 isLearner 过滤即可（如果想排除管理员）

window.LEARNING_STATS = {
  // === 进度领先（active + ahead）8 人 ===
  u1:  { progress: 20, total: 29, hours: 34, interactions: 45, lastLogin: '今天 09:12', login: 'active', prog: 'ahead' },     // 赵工
  u2:  { progress: 24, total: 29, hours: 42, interactions: 65, lastLogin: '刚刚',       login: 'active', prog: 'ahead' },     // HR 王
  u3:  { progress: 23, total: 29, hours: 38, interactions: 52, lastLogin: '2 小时前',   login: 'active', prog: 'ahead' },     // 陈总
  u4:  { progress: 22, total: 29, hours: 36, interactions: 48, lastLogin: '昨天 18:42', login: 'active', prog: 'ahead' },     // 李明
  u5:  { progress: 18, total: 29, hours: 30, interactions: 42, lastLogin: '今天 11:30', login: 'active', prog: 'ahead' },     // 张丽
  u6:  { progress: 17, total: 29, hours: 28, interactions: 40, lastLogin: '今天 14:08', login: 'active', prog: 'ahead' },     // 王勇
  u7:  { progress: 16, total: 29, hours: 26, interactions: 38, lastLogin: '今天 08:15', login: 'active', prog: 'ahead' },     // 刘洋
  u8:  { progress: 15, total: 29, hours: 24, interactions: 36, lastLogin: '今天 13:22', login: 'active', prog: 'ahead' },     // 陈静

  // === 跟上节奏（active + onTrack）8 人 · 含调换：u9/u10 → silent · u23/u24 ← onTrack ===
  // 决策点：mgthome 叙事提"何颖 12 天 silent / 吕菲 15 天 silent"·让 admin.js u9 u10 stats 直接对齐
  u11: { progress: 14, total: 29, hours: 23, interactions: 36, lastLogin: '今天 08:20', login: 'active', prog: 'onTrack' },   // 周斌
  u12: { progress: 14, total: 29, hours: 21, interactions: 34, lastLogin: '今天 10:55', login: 'active', prog: 'onTrack' },   // 吴敏
  u13: { progress: 13, total: 29, hours: 22, interactions: 32, lastLogin: '昨天 21:30', login: 'active', prog: 'onTrack' },   // 徐强
  u14: { progress: 13, total: 29, hours: 20, interactions: 30, lastLogin: '今天 07:42', login: 'active', prog: 'onTrack' },   // 胡涛
  u15: { progress: 12, total: 29, hours: 19, interactions: 29, lastLogin: '今天 13:18', login: 'active', prog: 'onTrack' },   // 马玲
  u16: { progress: 12, total: 29, hours: 18, interactions: 28, lastLogin: '昨天 19:55', login: 'active', prog: 'onTrack' },   // 黄勇
  u17: { progress: 11, total: 29, hours: 18, interactions: 27, lastLogin: '今天 12:01', login: 'active', prog: 'onTrack' },   // 林娜
  u18: { progress: 11, total: 29, hours: 17, interactions: 26, lastLogin: '今天 09:28', login: 'active', prog: 'onTrack' },   // 郑磊
  u23: { progress: 13, total: 29, hours: 22, interactions: 32, lastLogin: '今天 11:30', login: 'active', prog: 'onTrack' },   // 邓伟（调换至 onTrack）
  u24: { progress: 12, total: 29, hours: 20, interactions: 30, lastLogin: '今天 14:08', login: 'active', prog: 'onTrack' },   // 冯丽（调换至 onTrack）

  // === 进度落后（active 但 behind）2 人 ===
  u19: { progress: 10, total: 29, hours: 16, interactions: 24, lastLogin: '昨天 17:42', login: 'active', prog: 'behind' },    // 罗佳
  u20: { progress: 10, total: 29, hours: 15, interactions: 23, lastLogin: '今天 14:35', login: 'active', prog: 'behind' },    // 高峰

  // === 风险（risk + behind）4 人 · 4-6 天未登录 ===
  u21: { progress: 9,  total: 29, hours: 13, interactions: 18, lastLogin: '4 天前',     login: 'risk',   prog: 'behind' },    // 梁晨
  u22: { progress: 6,  total: 29, hours: 10, interactions: 12, lastLogin: '6 天前',     login: 'risk',   prog: 'behind' },    // 田静（demo 风险代表 · ora 叙事主角）

  // === 沉默（silent + behind）2 人 · 12-15 天未登录 · 跟 mgthome 叙事一致 ===
  u9:  { progress: 4,  total: 29, hours: 6,  interactions: 8,  lastLogin: '12 天前',    login: 'silent', prog: 'behind' },    // 何颖（mgthome 叙事 silent 12 天）
  u10: { progress: 2,  total: 29, hours: 4,  interactions: 5,  lastLogin: '15 天前',    login: 'silent', prog: 'behind' }     // 吕菲（mgthome 叙事 silent 15 天）
};

window.LearningStats = (function () {
  return {
    findByMemberId(id) {
      return window.LEARNING_STATS[id] || null;
    },
    /** 合并 admin.members + learning-stats · 用于 mgthome 学员表 */
    merge(member) {
      const s = window.LEARNING_STATS[member.id] || {};
      return Object.assign({
        // 统一字段：name/char/role 来自 admin.js
        char: (member.name || '').charAt(0),
        role: member.level || ''
      }, member, s);
    },
    /** 全量 24 人 zip · 默认全部 isLearner=true */
    listAll() {
      return (window.AdminCtx?.members || []).map(m => this.merge(m));
    },
    /** 仅返回 learner（兼容 mgthome 学员表过滤）*/
    listLearners() {
      return (window.AdminCtx?.members || []).filter(m => m.isLearner).map(m => this.merge(m));
    }
  };
})();
