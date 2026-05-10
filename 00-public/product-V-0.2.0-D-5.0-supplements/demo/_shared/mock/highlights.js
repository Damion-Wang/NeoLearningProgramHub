// _shared/mock/highlights.js · 跨场域高光卡 store
// 配套 US-V12-LINK-002
// localStorage key: rx-highlights · value: [{id, source, activityId, title, content, ts, tag}]
(function (g) {
  'use strict';
  const KEY = 'rx-highlights';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }
  function save(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {}
  }

  g.Highlights = {
    get() { return load(); },
    add(item) {
      const arr = load();
      const hl = {
        id: 'hl-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        source: item.source || 'lecture',  // lecture / practice / 大厅
        activityId: item.activityId || null,
        title: item.title || '',
        content: item.content || item.quote || '',
        ts: Date.now(),
        tag: item.tag || item.source || 'lecture'
      };
      arr.push(hl);
      save(arr);
      return hl;
    },
    remove(id) { save(load().filter(h => h.id !== id)); },
    clear() { save([]); }
  };
})(window);
