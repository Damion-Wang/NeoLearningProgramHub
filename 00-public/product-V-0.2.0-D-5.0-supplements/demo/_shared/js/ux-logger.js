/* 睿学 Demo · UX 录制器
 * 跨页面持久（sessionStorage）/ 浮标 + 抽屉 / Ctrl+M 加笔记 / 导出 .md
 * 注入于 _shared 共享脚本之后 / 在 inline 脚本之前加载，hook 通过 DOMContentLoaded 后置
 */
(function (g) {
  'use strict';

  const KEY_LOG = 'rx-ux-log';
  const KEY_SESS = 'rx-ux-session';
  const KEY_PAUSED = 'rx-ux-paused';
  const MAX = 5000;

  // ============== 会话识别 ==============
  let sessId = sessionStorage.getItem(KEY_SESS);
  if (!sessId) {
    sessId = new Date().toISOString().replace(/[:.]/g, '-') + '-' + Math.random().toString(36).slice(2, 7);
    sessionStorage.setItem(KEY_SESS, sessId);
  }

  function isPaused() { return sessionStorage.getItem(KEY_PAUSED) === '1'; }

  // ============== 写日志 ==============
  function getLog() {
    try { return JSON.parse(sessionStorage.getItem(KEY_LOG) || '[]'); } catch (_) { return []; }
  }
  function setLog(arr) {
    if (arr.length > MAX) arr.splice(0, arr.length - MAX);
    sessionStorage.setItem(KEY_LOG, JSON.stringify(arr));
    refreshBadge();
  }
  function log(type, data) {
    if (isPaused()) return;
    const arr = getLog();
    arr.push({
      t: Date.now(),
      iso: new Date().toISOString(),
      page: location.pathname.split('/').pop() || '/',
      type,
      ...data
    });
    setLog(arr);
  }

  // ============== 描述元素 ==============
  function describeEl(el) {
    if (!el || el === document || el === document.body) return null;
    let cur = el;
    // 向上找有意义的祖先（button / a / [role] / .clickable / [data-*]）
    for (let i = 0; cur && cur !== document.body && i < 6; i++) {
      const tag = cur.tagName;
      if (['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'LABEL', 'SELECT', 'SUMMARY'].includes(tag)) break;
      if (cur.getAttribute && (cur.getAttribute('role') === 'button' || cur.onclick)) break;
      if (cur.id) break;
      // 普通 div/span 也可作为一个目标，但优先找上层有 id 的
      cur = cur.parentElement;
    }
    cur = cur || el;
    const id = cur.id || '';
    const cls = (typeof cur.className === 'string' ? cur.className : '').split(/\s+/).filter(Boolean).slice(0, 3).join('.');
    const tag = cur.tagName ? cur.tagName.toLowerCase() : '?';
    const text = (cur.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    const aria = cur.getAttribute && (cur.getAttribute('aria-label') || cur.getAttribute('title')) || '';
    return { tag, id, cls, text, aria };
  }
  function elPretty(d) {
    if (!d) return '?';
    const idStr = d.id ? `#${d.id}` : '';
    const clsStr = d.cls ? `.${d.cls}` : '';
    const sel = `${d.tag}${idStr}${clsStr}`;
    const label = d.text || d.aria || '';
    return label ? `${sel} 「${label}」` : sel;
  }

  // 判断是否是 recorder 自己的 UI（要过滤掉，不录自己的操作）
  function isRecorderUI(el) {
    if (!el || !el.closest) return false;
    return !!el.closest('#__rxUx');
  }

  // ============== 事件捕获 ==============
  // Ctrl+Shift+点击 → 拦截普通 click，改为针对性笔记（recorder 自己的 UI 跳过）
  document.addEventListener('mousedown', (e) => {
    if (isRecorderUI(e.target)) return;
    if (e.button === 0 && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener('click', (e) => {
    if (isRecorderUI(e.target)) return;  // 抽屉内点击不录
    if (e.ctrlKey && e.shiftKey && e.button === 0) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      addNote(e.target, e.clientX, e.clientY);
      return;
    }
    log('click', { el: describeEl(e.target), x: e.clientX, y: e.clientY });
  }, true);

  document.addEventListener('blur', (e) => {
    if (isRecorderUI(e.target)) return;
    const t = e.target;
    if (!t || (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA' && !t.isContentEditable)) return;
    if (t.type === 'password') return;
    const v = (t.value || t.textContent || '').slice(0, 80);
    if (!v) return;
    log('input', { el: describeEl(t), value: v });
  }, true);

  // 页面加载 / 卸载
  log('load', { url: location.href, ref: document.referrer });
  window.addEventListener('beforeunload', () => {
    // 卸载前记录最终滚动深度
    if (typeof scrollMax === 'number' && scrollMax > 0) {
      log('scroll.final', { maxPct: scrollMax });
    }
    log('unload', {});
  });

  // ============== Hover 停留 ≥800ms ==============
  const HOVER_MS = 800;
  let hoverTimer = null, hoverTarget = null;
  function isHoverMeaningful(el) {
    if (!el || el === document.body) return false;
    const tag = el.tagName;
    if (['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'CANVAS', 'SVG'].includes(tag)) return true;
    if (el.id) return true;
    const cls = (typeof el.className === 'string' ? el.className : '');
    if (/(card|widget|chip|cell|btn|item|row|tab|popover|tooltip|nav|brand|hero|stat|chart|radar|heatmap|message|toast|modal|drawer|float|note|hl-|rpt-|ora-|neo-|ad-)/i.test(cls)) return true;
    return false;
  }
  function findHoverTarget(el) {
    let cur = el;
    for (let i = 0; cur && cur !== document.body && i < 5; i++) {
      if (isHoverMeaningful(cur)) return cur;
      cur = cur.parentElement;
    }
    return null;
  }
  document.addEventListener('mouseover', (e) => {
    if (isPaused()) return;
    if (isRecorderUI(e.target)) return;  // 抽屉内 hover 不录
    const target = findHoverTarget(e.target);
    if (!target || target === hoverTarget) return;
    if (hoverTimer) clearTimeout(hoverTimer);
    hoverTarget = target;
    hoverTimer = setTimeout(() => {
      log('hover', { el: describeEl(target), ms: HOVER_MS });
      hoverTimer = null;
    }, HOVER_MS);
  }, true);
  document.addEventListener('mouseout', (e) => {
    if (hoverTimer && (!e.relatedTarget || !hoverTarget.contains(e.relatedTarget))) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
      hoverTarget = null;
    }
  }, true);

  // ============== 滚动深度（每页每档只记一次） ==============
  let scrollMax = 0;
  const scrollMilestones = new Set();
  let scrollDebounce = null;
  function getScrollPct() {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
    return Math.min(100, Math.round((window.scrollY || doc.scrollTop || 0) / max * 100));
  }
  window.addEventListener('scroll', () => {
    if (isPaused()) return;
    if (scrollDebounce) clearTimeout(scrollDebounce);
    scrollDebounce = setTimeout(() => {
      const pct = getScrollPct();
      if (pct > scrollMax) scrollMax = pct;
      [25, 50, 75, 100].forEach(m => {
        if (pct >= m && !scrollMilestones.has(m)) {
          scrollMilestones.add(m);
          log('scroll', { pct: m });
        }
      });
    }, 200);
  }, { passive: true });

  // 内部容器滚动（如 hall heatmap-wrap / chat stream / mgthome stuList）
  document.addEventListener('scroll', (e) => {
    if (isPaused()) return;
    const el = e.target;
    if (!el || el === document) return;
    if (isRecorderUI(el)) return;  // 抽屉里的 timeline 滚动不录
    const id = el.id || (typeof el.className === 'string' ? el.className.split(/\s+/)[0] : '');
    if (!id) return;
    // 只记 ≥1s 一次/容器
    const k = `__rxScrollT_${id}`;
    const now = Date.now();
    if (g[k] && now - g[k] < 1500) return;
    g[k] = now;
    log('scroll.inner', { id, top: Math.round(el.scrollTop), left: Math.round(el.scrollLeft) });
  }, true);

  // ============== Hook 其他模块 ==============
  function hookFnAfterLoad() {
    // Session.set / clear
    if (g.Session) {
      const _set = g.Session.set;
      g.Session.set = function (s) {
        log('session.set', { display: s && s.display, role: s && s.role, target: s && s.target });
        return _set.apply(this, arguments);
      };
      const _clear = g.Session.clear;
      g.Session.clear = function () {
        log('session.clear', {});
        return _clear.apply(this, arguments);
      };
    }
    // Router.go
    if (g.Router) {
      const _go = g.Router.go;
      g.Router.go = function (target, params) {
        log('route', { target, params: params || null });
        return _go.apply(this, arguments);
      };
    }
    // showToast
    if (typeof g.showToast === 'function') {
      const _toast = g.showToast;
      g.showToast = function (msg) {
        log('toast', { msg: String(msg || '').slice(0, 100) });
        return _toast.apply(this, arguments);
      };
    }
    // openModal / closeModal
    if (typeof g.openModal === 'function') {
      const _open = g.openModal;
      g.openModal = function (html) {
        const snippet = String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
        log('modal.open', { snippet });
        return _open.apply(this, arguments);
      };
    }
    if (typeof g.closeModal === 'function') {
      const _close = g.closeModal;
      g.closeModal = function () {
        log('modal.close', {});
        return _close.apply(this, arguments);
      };
    }
    // 主题切换：监听 storage event + observe data-theme
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.attributeName === 'data-theme') {
          log('theme', { value: document.documentElement.getAttribute('data-theme') });
        }
      }
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  // ============== UI · 浮标 + 抽屉 ==============
  function ensureUI() {
    if (document.getElementById('__rxUx')) return;

    const root = document.createElement('div');
    root.id = '__rxUx';
    root.innerHTML = `
      <style>
        #__rxUx-badge {
          position: fixed; right: 14px; bottom: 14px; z-index: 99999;
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 999px; cursor: pointer;
          background: rgba(20, 20, 28, 0.78); color: #fff;
          font: 11px/1 ui-sans-serif, -apple-system, "PingFang SC", sans-serif;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.18);
          opacity: 0.55; transition: opacity 0.2s, transform 0.2s;
          user-select: none; letter-spacing: 0.02em;
        }
        #__rxUx-badge:hover { opacity: 1; transform: translateY(-1px); }
        #__rxUx-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: #F87171; box-shadow: 0 0 8px rgba(248,113,113,0.7); animation: __rxUxBlink 1.6s ease-in-out infinite; }
        #__rxUx-badge.paused .dot { background: #94A3B8; box-shadow: none; animation: none; }
        @keyframes __rxUxBlink { 0%,100%{opacity:1}50%{opacity:0.45} }
        #__rxUx-badge .quick-clear { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; margin-left: 4px; background: rgba(248,113,113,0.18); color: #FCA5A5; font-size: 11px; line-height: 1; cursor: pointer; transition: background 0.15s; border: 1px solid rgba(248,113,113,0.28); }
        #__rxUx-badge .quick-clear:hover { background: rgba(248,113,113,0.32); color: #FECACA; }

        #__rxUx-drawer {
          position: fixed; right: 0; top: 0; bottom: 0; width: 320px; z-index: 99998;
          background: rgba(18, 18, 24, 0.96); color: #E5E7EB;
          backdrop-filter: blur(14px);
          border-left: 1px solid rgba(255,255,255,0.08);
          transform: translateX(100%); transition: transform 0.25s cubic-bezier(.2,.8,.2,1);
          display: flex; flex-direction: column;
          font: 12px/1.4 ui-sans-serif, -apple-system, "PingFang SC", sans-serif;
        }
        #__rxUx-drawer.open { transform: translateX(0); }
        #__rxUx-drawer .head { padding: 14px 16px 10px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; gap: 8px; }
        #__rxUx-drawer .head h3 { margin: 0; font-size: 13px; font-weight: 600; flex: 1; }
        #__rxUx-drawer .head button { background: none; border: 1px solid rgba(255,255,255,0.12); color: #E5E7EB; padding: 4px 8px; border-radius: 6px; cursor: pointer; font: inherit; }
        #__rxUx-drawer .head button:hover { background: rgba(255,255,255,0.08); }
        #__rxUx-drawer .meta { padding: 8px 16px; font-size: 11px; color: #94A3B8; border-bottom: 1px solid rgba(255,255,255,0.05); }
        #__rxUx-drawer .timeline { flex: 1; overflow: auto; padding: 8px 0; }
        #__rxUx-drawer .row { padding: 6px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); display: flex; gap: 8px; align-items: flex-start; }
        #__rxUx-drawer .row:hover { background: rgba(255,255,255,0.03); }
        #__rxUx-drawer .row .time { color: #64748B; font-size: 10px; font-family: ui-monospace, monospace; flex-shrink: 0; padding-top: 1px; }
        #__rxUx-drawer .row .body { flex: 1; min-width: 0; word-break: break-all; }
        #__rxUx-drawer .row .type { display: inline-block; padding: 1px 6px; border-radius: 999px; font-size: 9px; font-weight: 600; letter-spacing: 0.05em; margin-right: 6px; vertical-align: 1px; }
        #__rxUx-drawer .row .t-click { background: rgba(34,211,238,0.15); color: #67E8F9; }
        #__rxUx-drawer .row .t-input { background: rgba(167,139,250,0.15); color: #C4B5FD; }
        #__rxUx-drawer .row .t-route { background: rgba(34,197,94,0.15); color: #86EFAC; }
        #__rxUx-drawer .row .t-load,
        #__rxUx-drawer .row .t-unload { background: rgba(148,163,184,0.15); color: #CBD5E1; }
        #__rxUx-drawer .row .t-toast { background: rgba(244,168,85,0.15); color: #FCD34D; }
        #__rxUx-drawer .row .t-modal { background: rgba(244,114,128,0.15); color: #FDA4AF; }
        #__rxUx-drawer .row .t-session { background: rgba(167,139,250,0.18); color: #C4B5FD; }
        #__rxUx-drawer .row .t-theme { background: rgba(255,255,255,0.08); color: #E5E7EB; }
        #__rxUx-drawer .row .t-note { background: rgba(245,158,11,0.18); color: #FCD34D; }
        #__rxUx-drawer .row .t-hover { background: rgba(110,231,183,0.12); color: #6EE7B7; }
        #__rxUx-drawer .row .t-scroll { background: rgba(56,189,248,0.12); color: #7DD3FC; }
        #__rxUx-drawer .actions { padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.08); display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        #__rxUx-drawer .actions button { padding: 8px 10px; border-radius: 8px; cursor: pointer; font: inherit; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: #E5E7EB; transition: background 0.15s; }
        #__rxUx-drawer .actions button:hover { background: rgba(255,255,255,0.10); }
        #__rxUx-drawer .actions .primary { background: linear-gradient(135deg, #22D3EE, #A78BFA); color: #0A0B10; border: none; font-weight: 600; }
        #__rxUx-drawer .actions .danger { color: #FCA5A5; border-color: rgba(239,68,68,0.25); }
        #__rxUx-drawer .empty { padding: 32px 16px; text-align: center; color: #64748B; font-size: 11px; }
      </style>

      <div id="__rxUx-badge" role="button" title="点击展开 UX 录制日志">
        <span class="dot"></span><span class="label">🎙️ <span class="count">0</span></span>
        <span class="quick-clear" role="button" title="一键清空（不开抽屉）">⌫</span>
      </div>

      <aside id="__rxUx-drawer" aria-hidden="true">
        <div class="head">
          <h3>UX 录制</h3>
          <button class="close" type="button" title="关闭">×</button>
        </div>
        <div class="meta"></div>
        <div class="timeline"></div>
        <div class="actions">
          <button class="note" type="button">✎ 全局笔记</button>
          <button class="pause" type="button">⏸ 暂停</button>
          <button class="export primary" type="button">⬇ 导出 .md</button>
          <button class="clear danger" type="button">⌫ 清空</button>
        </div>
      </aside>
    `;
    document.body.appendChild(root);

    const badge = root.querySelector('#__rxUx-badge');
    const drawer = root.querySelector('#__rxUx-drawer');
    const closeBtn = drawer.querySelector('.close');
    const noteBtn = drawer.querySelector('.note');
    const pauseBtn = drawer.querySelector('.pause');
    const exportBtn = drawer.querySelector('.export');
    const clearBtn = drawer.querySelector('.clear');

    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      // 点 ⌫ 子按钮 → 直接清空，不展开抽屉
      if (e.target.closest('.quick-clear')) {
        if (!confirm('清空当前 UX 日志？这一步无法撤销。')) return;
        sessionStorage.removeItem(KEY_LOG);
        sessionStorage.removeItem(KEY_SESS);
        sessId = new Date().toISOString().replace(/[:.]/g, '-') + '-' + Math.random().toString(36).slice(2, 7);
        sessionStorage.setItem(KEY_SESS, sessId);
        refreshBadge();
        return;
      }
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      renderTimeline();
    });
    closeBtn.addEventListener('click', () => {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    });
    noteBtn.addEventListener('click', () => addNote());
    pauseBtn.addEventListener('click', togglePause);
    exportBtn.addEventListener('click', exportMd);
    clearBtn.addEventListener('click', () => {
      if (!confirm('清空当前 UX 日志？这一步无法撤销。')) return;
      sessionStorage.removeItem(KEY_LOG);
      sessionStorage.removeItem(KEY_SESS);
      sessId = new Date().toISOString().replace(/[:.]/g, '-') + '-' + Math.random().toString(36).slice(2, 7);
      sessionStorage.setItem(KEY_SESS, sessId);
      refreshBadge();
      renderTimeline();
    });

    refreshBadge();
    syncPausedState();
  }

  function refreshBadge() {
    const badge = document.getElementById('__rxUx-badge');
    if (!badge) return;
    const arr = getLog();
    badge.querySelector('.count').textContent = String(arr.length);
    if (isPaused()) badge.classList.add('paused');
    else badge.classList.remove('paused');
    // 抽屉打开时也实时刷新
    const drawer = document.getElementById('__rxUx-drawer');
    if (drawer && drawer.classList.contains('open')) renderTimeline();
  }

  function syncPausedState() {
    const pauseBtn = document.querySelector('#__rxUx-drawer .pause');
    if (pauseBtn) pauseBtn.textContent = isPaused() ? '▶ 恢复' : '⏸ 暂停';
  }

  function renderTimeline() {
    const drawer = document.getElementById('__rxUx-drawer');
    if (!drawer) return;
    const arr = getLog();
    const tl = drawer.querySelector('.timeline');
    const meta = drawer.querySelector('.meta');
    if (!arr.length) {
      tl.innerHTML = '<div class="empty">还没有操作记录<br>开始点击 demo 即可自动捕获</div>';
      meta.textContent = '会话 ' + sessId.slice(0, 19);
    } else {
      const startT = arr[0].t;
      const endT = arr[arr.length - 1].t;
      const dur = ((endT - startT) / 1000).toFixed(0);
      meta.textContent = `${arr.length} 条 · 耗时 ${dur}s · ${sessId.slice(0, 19)}`;
      // 倒序渲染（最新在最上）
      tl.innerHTML = arr.slice().reverse().slice(0, 200).map(formatRow).join('');
    }
  }

  function formatRow(e) {
    const time = new Date(e.t).toTimeString().slice(0, 8);
    const tShort = e.type.split('.')[0];
    let body = '';
    if (e.type === 'click') body = elPretty(e.el);
    else if (e.type === 'input') body = `${elPretty(e.el)} = "${e.value}"`;
    else if (e.type === 'route') body = `→ ${e.target}` + (e.params ? ` (${JSON.stringify(e.params)})` : '');
    else if (e.type === 'load') body = '进入 ' + (e.page || '?');
    else if (e.type === 'unload') body = '离开 ' + (e.page || '?');
    else if (e.type === 'toast') body = `Toast: ${e.msg}`;
    else if (e.type === 'modal.open') body = `Modal: ${e.snippet}`;
    else if (e.type === 'modal.close') body = 'Modal 关闭';
    else if (e.type === 'session.set') body = `Session.set: ${e.display} / ${e.role} → ${e.target}`;
    else if (e.type === 'session.clear') body = '退出登录';
    else if (e.type === 'theme') body = `主题 → ${e.value}`;
    else if (e.type === 'note') body = e.el ? `✎ 针对「${elPretty(e.el)}」: ${e.text}` : '✎ ' + e.text;
    else if (e.type === 'hover') body = `Hover ${e.ms}ms · ${elPretty(e.el)}`;
    else if (e.type === 'scroll') body = `滚动 ${e.pct}%`;
    else if (e.type === 'scroll.inner') body = `内滚 ${e.id} · top=${e.top} left=${e.left}`;
    else if (e.type === 'scroll.final') body = `离开时滚动深度 ${e.maxPct}%`;
    else body = JSON.stringify(e);
    return `<div class="row"><span class="time">${time}</span><div class="body"><span class="type t-${tShort}">${e.type}</span>${escapeHtml(body)}</div></div>`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ============== 操作 ==============
  function addNote(target, x, y) {
    const targetDesc = target ? describeEl(target) : null;
    const promptLabel = targetDesc
      ? `针对：${elPretty(targetDesc)}\n\n加一条笔记（你的观察 / 想法 / 困惑）：`
      : '加一条全局笔记（你的观察 / 想法 / 困惑）：';
    const text = prompt(promptLabel, '');
    if (text === null || !text.trim()) return;
    const entry = { text: text.trim().slice(0, 500) };
    if (targetDesc) { entry.el = targetDesc; entry.x = x; entry.y = y; }
    log('note', entry);
    renderTimeline();
  }

  // 双击右键方案曾经失败（浏览器原生 contextmenu 抢占）→ 改用 Ctrl+Shift+左键

  function togglePause() {
    if (isPaused()) sessionStorage.removeItem(KEY_PAUSED);
    else sessionStorage.setItem(KEY_PAUSED, '1');
    syncPausedState();
    refreshBadge();
    log('note', { text: isPaused() ? '【录制暂停】' : '【录制恢复】' });
  }

  function exportMd() {
    const arr = getLog();
    if (!arr.length) { alert('还没有操作可以导出'); return; }
    const startISO = new Date(arr[0].t).toISOString();
    const endISO = new Date(arr[arr.length - 1].t).toISOString();
    const durSec = Math.round((arr[arr.length - 1].t - arr[0].t) / 1000);
    const stats = countTypes(arr);

    let md = `# 睿学 Demo · UX 录制\n\n`;
    md += `- **会话 ID**：\`${sessId}\`\n`;
    md += `- **开始**：${startISO}\n`;
    md += `- **结束**：${endISO}\n`;
    md += `- **时长**：${durSec}s（≈${(durSec / 60).toFixed(1)} min）\n`;
    md += `- **操作总数**：${arr.length}\n`;
    md += `- **分布**：${Object.entries(stats).map(([k, v]) => `${k}×${v}`).join(' · ')}\n\n`;
    md += `---\n\n`;
    md += `## 时间轴\n\n`;
    md += `| 时间 | 页面 | 类型 | 详情 |\n|---|---|---|---|\n`;
    arr.forEach(e => {
      const t = new Date(e.t).toTimeString().slice(0, 8);
      let body = '';
      if (e.type === 'click') body = elPretty(e.el);
      else if (e.type === 'input') body = `${elPretty(e.el)} = "${e.value}"`;
      else if (e.type === 'route') body = `→ ${e.target}` + (e.params ? ` ${JSON.stringify(e.params)}` : '');
      else if (e.type === 'toast') body = `Toast: ${e.msg}`;
      else if (e.type === 'modal.open') body = `Modal: ${e.snippet}`;
      else if (e.type === 'modal.close') body = 'Modal 关闭';
      else if (e.type === 'session.set') body = `${e.display} / ${e.role} → ${e.target}`;
      else if (e.type === 'session.clear') body = '退出登录';
      else if (e.type === 'theme') body = `→ ${e.value}`;
      else if (e.type === 'note') body = e.el ? `**✎ 针对** \`${elPretty(e.el)}\`: ${e.text}` : `**✎** ${e.text}`;
      else if (e.type === 'load') body = '进入';
      else if (e.type === 'unload') body = '离开';
      else if (e.type === 'hover') body = `${e.ms}ms · ${elPretty(e.el)}`;
      else if (e.type === 'scroll') body = `${e.pct}%`;
      else if (e.type === 'scroll.inner') body = `内滚 ${e.id} top=${e.top} left=${e.left}`;
      else if (e.type === 'scroll.final') body = `最终 ${e.maxPct}%`;
      else body = JSON.stringify(e);
      md += `| ${t} | ${e.page} | ${e.type} | ${body.replace(/\|/g, '\\|')} |\n`;
    });

    md += `\n---\n\n## 笔记摘录\n\n`;
    const notes = arr.filter(e => e.type === 'note');
    if (!notes.length) md += '（本次录制无笔记）\n';
    else notes.forEach((e, i) => {
      const time = new Date(e.t).toTimeString().slice(0, 8);
      const page = e.page;
      if (e.el) {
        md += `${i + 1}. **${time}** · \`${page}\` · 针对 \`${elPretty(e.el)}\`\n   > ${e.text}\n\n`;
      } else {
        md += `${i + 1}. **${time}** · \`${page}\` · 全局笔记\n   > ${e.text}\n\n`;
      }
    });

    md += `\n---\n\n*由 _shared/js/ux-logger.js 自动生成 · 日期 ${new Date().toLocaleString('zh-CN')}*\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `UX-录制-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function countTypes(arr) {
    const c = {};
    arr.forEach(e => { c[e.type] = (c[e.type] || 0) + 1; });
    return c;
  }

  // ============== 快捷键 Ctrl+M ==============
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'm' || e.key === 'M')) {
      e.preventDefault();
      addNote();
    }
  });

  // ============== 启动 ==============
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ensureUI();
      // 给 inline 脚本里的 showToast/openModal/closeModal 留时间定义
      setTimeout(hookFnAfterLoad, 50);
    });
  } else {
    ensureUI();
    setTimeout(hookFnAfterLoad, 50);
  }

  // ============== 全局 API（控制台调用） ==============
  g.UXLog = {
    list: getLog,
    export: exportMd,
    clear: () => { sessionStorage.removeItem(KEY_LOG); refreshBadge(); },
    addNote,
    pause: () => { sessionStorage.setItem(KEY_PAUSED, '1'); syncPausedState(); refreshBadge(); },
    resume: () => { sessionStorage.removeItem(KEY_PAUSED); syncPausedState(); refreshBadge(); }
  };
})(window);
