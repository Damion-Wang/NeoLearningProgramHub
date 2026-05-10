// Router util · 跨页面跳转 + URL params + 校验
// demo 阶段路由 = 同目录 .html 文件直跳
(function (g) {
  'use strict';

  // 已实装目标页（其他统一占位 toast）
  const IMPLEMENTED = new Set(['login', 'hall', 'mgthome', 'lecture', 'practice', 'proconfig', 'massagemgt', 'recap', 'reportcenter']);

  // target key → 实际文件名 映射（login 用中文友好命名给同事双击）
  const FILE_MAP = {
    login: '00-睿学Demo-双击启动.html',
    hall: 'hall.html',
    mgthome: 'mgthome.html',
    lecture: 'lecture.html',
    practice: 'practice.html',
    proconfig: 'proconfig.html',
    massagemgt: 'massagemgt.html',
    recap: 'recap.html',
    reportcenter: 'reportcenter.html'
  };

  function buildUrl(target, params) {
    const key = target.replace('.html', '');
    const file = FILE_MAP[key] || (target.endsWith('.html') ? target : target + '.html');
    if (!params) return file;
    const usp = new URLSearchParams();
    Object.keys(params).forEach(k => { if (params[k] != null) usp.set(k, params[k]); });
    const qs = usp.toString();
    return qs ? file + '?' + qs : file;
  }

  g.Router = {
    /** 跳转到目标页 · params 拼成 query string */
    go(target, params) {
      if (!IMPLEMENTED.has(target.replace('.html', ''))) {
        // 未实装页面 → 提示
        if (typeof showToast === 'function') {
          showToast(`${target} · demo 阶段未实装`);
        } else {
          console.warn('[Router] not implemented: ' + target);
          alert(`${target} · demo 阶段未实装`);
        }
        return;
      }
      location.href = buildUrl(target, params);
    },
    /** 启动校验：无 session 自动跳 login */
    requireSession() {
      if (!Session.isLoggedIn()) {
        location.replace(FILE_MAP.login);
        return false;
      }
      return true;
    },
    /** 读 URL ?from= 来源页 */
    fromParam() {
      return new URLSearchParams(location.search).get('from');
    },
    /** 读任意 URL param */
    param(key) {
      return new URLSearchParams(location.search).get(key);
    },
    /** 是否为已实装目标 */
    isImplemented(target) {
      return IMPLEMENTED.has(target.replace('.html', ''));
    }
  };
})(window);
