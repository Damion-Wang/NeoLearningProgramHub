// v1.5.1 · F5 刷新清 rx-* · 跨页跳转保留
//   navigation.type === 'reload' → 真刷新 → 清所有 rx-* + 回到 login
//   navigation.type === 'navigate' / 'back_forward' / undefined → 跨页跳转/前进后退 → 保留
//
// 使用：每页 head 早加载（BEFORE 任何 mock store · session.js 之前）
//   <script src="_shared/js/demo-reset.js?v=16"></script>
(function () {
  'use strict';
  try {
    const navEntries = performance.getEntriesByType('navigation');
    const navType = (navEntries && navEntries[0] && navEntries[0].type) || '';
    if (navType !== 'reload') return;  // 不是 F5 / location.reload · 不动

    // 收集所有 rx-* key（demo 数据约定前缀）+ session.js 的 neo_demo_session / demo_login_remember_account
    const EXTRA_KEYS = ['neo_demo_session', 'demo_login_remember_account'];
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.indexOf('rx-') === 0 || EXTRA_KEYS.indexOf(k) >= 0)) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));
    if (toRemove.length > 0) {
      console.info('[demo-reset] F5 reload · 清空', toRemove.length, '个 rx-* key:', toRemove);
    }

    // 全清 → 当前页若不是 login，跳回 login（避免 hall 立刻 Session 为空报错）
    const isLoginPage = /00-.*\.html|login\.html$/i.test(decodeURIComponent(location.pathname));
    if (!isLoginPage) {
      // 用 replace 避免历史栈污染 · 中文文件名直接放原文 · 浏览器自动 encode
      location.replace('00-睿学Demo-双击启动.html');
    }
  } catch (e) {
    console.warn('[demo-reset] failed:', e);
  }
})();
