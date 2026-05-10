// _shared/mock/todos.js · 跨场域待办 store
// 配套 US-V12-LINK-004 · 修 v1.2 "加入大厅待办" 文案骗局
// localStorage key: rx-todos · value: [{id, text, source, activityId?, ts, done}]
(function (g) {
  'use strict';
  const KEY = 'rx-todos';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }
  function save(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {}
  }

  g.Todos = {
    get() { return load(); },
    add(item) {
      const arr = load();
      const todo = {
        id: 'todo-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        text: item.text || '',
        source: item.source || '',
        activityId: item.activityId || null,
        ts: Date.now(),
        done: false
      };
      arr.push(todo);
      save(arr);
      return todo;
    },
    update(id, patch) {
      const arr = load();
      const i = arr.findIndex(t => t.id === id);
      if (i >= 0) { arr[i] = { ...arr[i], ...patch }; save(arr); }
    },
    remove(id) {
      save(load().filter(t => t.id !== id));
    },
    clear() { save([]); }
  };
})(window);
