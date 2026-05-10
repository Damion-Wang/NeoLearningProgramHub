// Jumper · 跨页跳转中枢（hall / lecture / practice 共用）
// 统一确认弹窗 + target 映射 + 下一项推断
// 依赖：window.Router（_shared/js/router.js）+ 当前页定义的全局 openModal/closeModal
(function (g) {
  'use strict';

  // mock 里 activity.target → Router FILE_MAP 的 key
  const TARGET_MAP = {
    'lecture-ppt': 'lecture',
    'practice-intro': 'practice',
    'recap': 'recap'
  };

  const TARGET_LABEL = {
    lecture: '授课',
    practice: '对练',
    recap: '小结'
  };

  let _pending = null;

  // hall / lecture / practice 内点 Activity → 弹确认 → Router.go
  function confirmAndJump(title, target, opts) {
    opts = opts || {};
    const routerKey = TARGET_MAP[target] || target;
    const label = TARGET_LABEL[routerKey] || target;

    const params = {};
    if (opts.activityId) params.activity = opts.activityId;
    if (opts.from) params.from = opts.from;
    // I-V12-02: completed Activity 自动进自由复习/探讨模式
    if (opts.mode) params.mode = opts.mode;

    _pending = { routerKey, params };

    if (typeof openModal !== 'function') {
      Router.go(routerKey, params);
      return;
    }

    // openModal 各页会自动注入 modal-close-x（v1.1 工程纪律 D），此处不重复
    openModal(`
      <div class="modal-title">进入${label}</div>
      <div class="modal-sub">${title}</div>
      <div class="modal-body">即将跳转到 ${label} 页面。学习过程中你可以随时返回大厅。</div>
      <div class="modal-actions">
        <button class="modal-btn" onclick="closeModal()">取消</button>
        <button class="modal-btn primary" onclick="Jumper.confirmGo()">开始学习</button>
      </div>
    `);
  }

  function confirmGo() {
    if (!_pending) return;
    const p = _pending;
    _pending = null;
    if (typeof closeModal === 'function') closeModal();
    Router.go(p.routerKey, p.params);
  }

  // courseTree 扁平推下一项 · lecture/practice 完成 modal "继续下一" 用
  // 返回 {activityId, type, title, target, courseName} 或 null（最后一项）
  function nextActivityFrom(courseTree, currentActivityId) {
    const flat = [];
    (courseTree || []).forEach(c => {
      (c.activities || []).forEach(a => {
        flat.push({
          activityId: a.id,
          type: a.type,
          title: a.title || a.name,
          target: a.target,
          courseName: c.name
        });
      });
    });
    const idx = flat.findIndex(a => a.activityId === currentActivityId);
    if (idx === -1 || idx >= flat.length - 1) return null;
    return flat[idx + 1];
  }

  g.Jumper = { confirmAndJump, confirmGo, nextActivityFrom, TARGET_MAP, TARGET_LABEL };
})(window);
