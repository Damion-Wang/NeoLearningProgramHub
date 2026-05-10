// _shared/mock/notes.js · 跨场域笔记 store
// 配套 US-V12-LINK-003
// localStorage key: rx-notes · value: [{id, source, activityId?, content, ts}]
(function (g) {
  'use strict';
  const KEY = 'rx-notes';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }
  function save(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {}
  }

  g.Notes = {
    get() { return load(); },
    add(item) {
      const arr = load();
      const note = {
        id: 'note-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        source: item.source || '大厅',
        activityId: item.activityId || null,
        content: item.content || '',
        ts: Date.now()
      };
      arr.push(note);
      save(arr);
      return note;
    },
    update(id, patch) {
      const arr = load();
      const i = arr.findIndex(n => n.id === id);
      if (i >= 0) { arr[i] = { ...arr[i], ...patch }; save(arr); }
    },
    remove(id) { save(load().filter(n => n.id !== id)); },
    clear() { save([]); }
  };
})(window);
