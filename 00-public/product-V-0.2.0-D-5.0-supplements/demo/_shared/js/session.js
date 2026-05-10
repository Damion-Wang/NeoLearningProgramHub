// Session util · localStorage 持久化（demo 阶段）
// 无后端 / 无 token / 无加密 — 跨页面共享当前账户
(function (g) {
  'use strict';
  const KEY = 'neo_demo_session';
  const REMEMBER_KEY = 'demo_login_remember_account';

  g.Session = {
    /** 写 session */
    set(payload) {
      try { localStorage.setItem(KEY, JSON.stringify({ ...payload, loginAt: Date.now() })); } catch (e) {}
    },
    /** 读 session（无则 null）*/
    get() {
      try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
    },
    /** 清 session（不清 remember 账号）*/
    clear() {
      try { localStorage.removeItem(KEY); } catch (e) {}
    },
    /** 是否已登录 */
    isLoggedIn() { return !!this.get(); },
    /** 是否多角色可切换端口 */
    canSwitchPort() {
      const s = this.get();
      return !!s && s.role === 'learner+admin';
    },
    /** remember 账号（独立于 session）*/
    getRemember() {
      try { return localStorage.getItem(REMEMBER_KEY) || ''; } catch { return ''; }
    },
    setRemember(acc) {
      try { localStorage.setItem(REMEMBER_KEY, acc || ''); } catch (e) {}
    },
    clearRemember() {
      try { localStorage.removeItem(REMEMBER_KEY); } catch (e) {}
    }
  };
})(window);
