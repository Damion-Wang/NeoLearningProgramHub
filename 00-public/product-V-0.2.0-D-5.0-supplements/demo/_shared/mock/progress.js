// _shared/mock/progress.js · 跨场域 Activity 完成态 store
// 配套 US-V12-LINK-001 · 工程纪律 N
// localStorage key: rx-progress · value: { activityId: { status, completedAt, type } }
(function (g) {
  'use strict';
  const KEY = 'rx-progress';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
  }
  function save(obj) {
    try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch (e) {}
  }

  g.Progress = {
    get() { return load(); },
    /** 标记 Activity 完成 · activityId 形如 'CRS-001/ACT-001-03' 或 'c1-a3' */
    markComplete(activityId, type) {
      if (!activityId) return;
      const all = load();
      all[activityId] = { status: 'completed', completedAt: Date.now(), type: type || null };
      save(all);
    },
    /** 查指定 Activity 完成态 */
    isCompleted(activityId) {
      return load()[activityId]?.status === 'completed';
    },
    /** 清（demo 调试用）*/
    clear() { save({}); }
  };
})(window);
