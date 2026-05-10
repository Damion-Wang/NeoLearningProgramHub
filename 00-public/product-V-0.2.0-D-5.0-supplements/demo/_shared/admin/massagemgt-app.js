/* ============================================================
   MassageMgt · APP LOGIC（消息中心 / 列表态 + 编辑器态）
   - 复用 proconfig 视觉 / topbar / sidenav / modal / drawer
   - 自家：messages-table / type chip / recipient picker / 富文本 / 自动保存 / view 切换
   ============================================================ */

(function () {
  const M = window.MASSAGE_MOCK;
  const $ = id => document.getElementById(id);

  /* ==========  Icons · 复用 proconfig 风（hall 风 1.8 stroke）==========*/
  function svg(d, size, attr) {
    const sz = size || 16;
    return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'+(attr||'')+'>'+d+'</svg>';
  }
  const Icons = {
    plus:    s=>svg('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>', s||14),
    search:  s=>svg('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', s||14),
    chevL:   s=>svg('<polyline points="15 18 9 12 15 6"/>', s||14),
    save:    s=>svg('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>', s||14),
    clock:   s=>svg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', s||14),
    send:    s=>svg('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor"/>', s||14),
    warn:    s=>svg('<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>', s||14),
    statusPre: s=>svg('<circle cx="12" cy="12" r="9" fill="#e8a838" stroke="none"/>', s||10),
    statusRun: s=>svg('<circle cx="12" cy="12" r="9" fill="#4f8b5c" stroke="none"/>', s||10),
    inbox:   s=>svg('<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>', s||14),
    times:   s=>svg('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>', s||12),
    refresh: s=>svg('<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>', s||14),
    trash:   s=>svg('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/>', s||14),
    cancel:  s=>svg('<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>', s||14),
    link:    s=>svg('<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>', s||14),
    check:   s=>svg('<polyline points="20 6 9 17 4 12"/>', s||12)
  };
  function ic(name, sz) { const f = Icons[name]; if (!f) return ''; return '<span style="display:inline-flex;vertical-align:middle;line-height:0">'+f(sz)+'</span>'; }

  /* ==========  state  ========== */
  const state = {
    view: 'list',        // 'list' | 'editor'
    status: 'running',   // 'running' | 'pre-launch'
    // 列表态
    filterType: 'all',
    filterTime: 'all',
    searchQ: '',
    page: 1,
    pageSize: 50,
    expandedRowId: null,
    // 编辑态
    editing: null,       // { id, type, recipients, title, body, scheduledAt }
    editorSnapshot: null,
    autosaveTimer: null,
    lastSaveLabel: ''
  };

  /* ==========  通用 utils  ========== */
  function showToast(msg, dur = 2000) {
    const t = $('toast'); t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), dur);
  }
  function openModal(html, opts) {
    const closeX = html.includes('modal-close-x') ? '' : '<button class="modal-close-x" onclick="closeModal()">×</button>';
    $('modalCard').innerHTML = closeX + html;
    $('modalCard').classList.toggle('wide', !!(opts && opts.wide));
    $('modalMask').classList.add('open');
  }
  function closeModal() { $('modalMask').classList.remove('open'); $('modalCard').classList.remove('wide'); }
  window.closeModal = closeModal;
  function escapeHtml(s) { return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function isPreLaunch() { return state.status === 'pre-launch'; }
  function uid(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,5); }

  // 相对时间（ISO → "X 时前"）
  function relTime(iso) {
    const t = new Date(iso).getTime();
    const now = new Date(M.NOW).getTime();
    const diff = (now - t) / 1000;  // 秒
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff/60) + ' 分钟前';
    if (diff < 86400) return Math.floor(diff/3600) + ' 小时前';
    const days = Math.floor(diff / 86400);
    if (days === 1) return '昨天 ' + new Date(iso).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});
    if (days < 7) return days + ' 天前';
    if (days < 30) return Math.floor(days/7) + ' 周前';
    return new Date(iso).toLocaleDateString('zh-CN').replace(/\//g,'-');
  }
  function absTime(iso) {
    const d = new Date(iso);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') + ' ' +
      String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }
  function shortDate(iso) {
    const d = new Date(iso);
    return String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') + ' ' +
      String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }

  // member 查找
  function memberById(id) { return M.members.find(m => m.id === id); }
  function memberName(id) { const m = memberById(id); return m ? m.name : id; }

  /* ==========  顶部状态栏 + sidenav 双态可见性  ========== */
  function renderStatus() {
    const chip = $('statusChip'); if (!chip) return;
    if (isPreLaunch()) {
      chip.className = 'status-chip pre-launch';
      chip.innerHTML = ic('statusPre', 10) + '开营前';
      ['navHome','navReport','navMessage'].forEach(id => $(id).style.display = 'none');
    } else {
      chip.className = 'status-chip running';
      chip.innerHTML = ic('statusRun', 10) + '已开营';
      ['navHome','navReport','navMessage'].forEach(id => $(id).style.display = '');
    }
  }

  /* ==========  Subbar render（双态：list / editor）  ========== */
  function renderSubbar() {
    const sb = $('subbar');
    if (state.view === 'list') {
      sb.innerHTML = `
        <span class="subbar-title">消息中心</span>
        <span class="status-chip" id="statusChip">···</span>
        <span class="subbar-divider"></span>
        <select class="subbar-select" id="filterType">
          <option value="all">全部类型</option>
          <option value="manual">手动</option>
          <option value="auto">自动催学</option>
          <option value="draft">草稿</option>
          <option value="scheduled">定时</option>
        </select>
        <select class="subbar-select" id="filterTime">
          <option value="all">全部时间</option>
          <option value="7">近 7 天</option>
          <option value="30">近 30 天</option>
        </select>
        <input class="subbar-search" id="searchQ" type="search" placeholder="搜索收件人 / 内容关键词" />
        <span class="subbar-spacer"></span>
        <button class="subbar-cta" id="btnNewMsg">${ic('plus',14)}新建消息</button>
      `;
      $('filterType').value = state.filterType;
      $('filterTime').value = state.filterTime;
      $('searchQ').value = state.searchQ;
      $('filterType').addEventListener('change', e => { state.filterType = e.target.value; state.page = 1; renderList(); });
      $('filterTime').addEventListener('change', e => { state.filterTime = e.target.value; state.page = 1; renderList(); });
      $('searchQ').addEventListener('input', e => { state.searchQ = e.target.value; state.page = 1; renderList(); });
      $('btnNewMsg').addEventListener('click', () => openEditor());
    } else {
      const editing = state.editing;
      const isNew = !editing.id;
      sb.innerHTML = `
        <button class="subbar-back-btn" id="btnBack">${ic('chevL',14)}返回</button>
        <span class="subbar-divider"></span>
        <span class="subbar-title">${isNew ? '新建消息' : '编辑消息'}</span>
        <span class="status-chip" id="statusChip">···</span>
      `;
      $('btnBack').addEventListener('click', exitEditor);
    }
    renderStatus();
  }

  /* ==========  列表态 · 多管理员可见性过滤  ========== */
  function visibleMessages() {
    const cur = M.currentAdmin.id;
    return M.messages.filter(m => {
      if (m.type === 'manual' || m.type === 'auto') return true;
      return m.senderId === cur;  // draft / scheduled 仅本人
    });
  }
  function filterMessages() {
    let list = visibleMessages();
    // type filter
    if (state.filterType !== 'all') list = list.filter(m => m.type === state.filterType);
    // time filter
    if (state.filterTime !== 'all') {
      const days = +state.filterTime;
      const cutoff = new Date(M.NOW).getTime() - days * 86400000;
      list = list.filter(m => new Date(m.time).getTime() >= cutoff);
    }
    // search
    const q = state.searchQ.trim().toLowerCase();
    if (q) {
      list = list.filter(m => {
        if ((m.title||'').toLowerCase().includes(q)) return true;
        if ((m.body||'').toLowerCase().includes(q)) return true;
        const recipNames = (m.recipients||[]).map(r => memberName(r).toLowerCase()).join(',');
        if (recipNames.includes(q)) return true;
        if ((m.sender||'').toLowerCase().includes(q)) return true;
        return false;
      });
    }
    // 倒序（按时间）
    list.sort((a,b) => new Date(b.time) - new Date(a.time));
    return list;
  }

  /* ==========  列表态 · render  ========== */
  function renderList() {
    const root = $('viewList');
    if (isPreLaunch()) {
      root.innerHTML = `
        <div class="section">
          <div class="empty-state">
            <div class="empty-state-icon">${ic('inbox',32)}</div>
            <div class="empty-state-title">消息中心 · 开营后开放</div>
            <div class="empty-state-sub">spec § 1 双态可见性 · 项目尚处配置态<br>开营后所有管理员都可使用</div>
          </div>
        </div>`;
      return;
    }
    const list = filterMessages();
    const total = list.length;
    const start = (state.page - 1) * state.pageSize;
    const slice = list.slice(start, start + state.pageSize);

    if (slice.length === 0) {
      root.innerHTML = `
        <div class="section">
          <div class="empty-state">
            <div class="empty-state-icon">${ic('search',32)}</div>
            <div class="empty-state-title">没有符合条件的消息</div>
            <div class="empty-state-sub">试试调整筛选条件 / 或点击 + 新建消息</div>
          </div>
        </div>`;
      return;
    }

    root.innerHTML = `
      <div class="messages-table-wrap">
        <table class="messages-table">
          <thead>
            <tr>
              <th class="col-time">时间</th>
              <th class="col-type">类型</th>
              <th class="col-sender">发送人</th>
              <th class="col-recip">收件人</th>
              <th class="col-preview">标题 / 内容预览</th>
              <th class="col-status">投递状态</th>
              <th class="col-actions"></th>
            </tr>
          </thead>
          <tbody id="messagesBody"></tbody>
        </table>
        <div class="table-pagination">
          <span>共 ${total} 条 · 第 ${state.page} 页</span>
          <span class="pagination-pages">
            <button class="pagination-btn" id="pgPrev" ${state.page<=1?'disabled':''}>‹ 上一页</button>
            <button class="pagination-btn" id="pgNext" ${start + state.pageSize >= total?'disabled':''}>下一页 ›</button>
          </span>
        </div>
      </div>
    `;
    const tbody = $('messagesBody');
    slice.forEach(m => {
      tbody.appendChild(rowEl(m));
      if (state.expandedRowId === m.id && m.type !== 'draft' && m.type !== 'scheduled') {
        tbody.appendChild(detailRowEl(m));
      }
    });
    $('pgPrev')?.addEventListener('click', () => { if (state.page > 1) { state.page--; renderList(); } });
    $('pgNext')?.addEventListener('click', () => { if (start + state.pageSize < total) { state.page++; renderList(); } });
  }

  function typeChipHtml(m) {
    const labels = { manual: '手动', auto: '自动催学', draft: '草稿', scheduled: '定时' };
    let html = `<span class="type-chip ${m.type}">${labels[m.type]}</span>`;
    if (m.type === 'auto' && m.triggerLabel) {
      html += `<span class="trigger-label">${escapeHtml(m.triggerLabel)}</span>`;
    }
    return html;
  }
  function recipientCellHtml(m) {
    const list = m.recipients || [];
    if (list.length === 0) return '<span style="color:var(--ink-4)">未选</span>';
    if (list.length === 1) return escapeHtml(memberName(list[0]));
    const popoverItems = list.map(id => `<div class="recipients-popover-name">${escapeHtml(memberName(id))}</div>`).join('');
    return `<span class="recipients-cell">
      <span style="color:var(--ink-1)">${list.length} 人</span>
      <span style="color:var(--ink-4);font-size:10px">▾</span>
      <span class="recipients-popover">${popoverItems}</span>
    </span>`;
  }
  function deliveryCellHtml(m) {
    if (m.type === 'draft') return '<span class="delivery-cell draft">未发送</span>';
    if (m.type === 'scheduled') {
      return `<span class="delivery-cell scheduled">${ic('clock',12)}待 ${shortDate(m.delivery.scheduledAt)} 发送</span>`;
    }
    if (m.delivery && m.delivery.failed > 0) {
      return `<span class="delivery-cell failed">失败 ${m.delivery.failed}/${m.delivery.total}</span>`;
    }
    if (m.delivery) {
      return `<span class="delivery-cell sent">${m.delivery.read}/${m.delivery.sent} 已读</span>`;
    }
    return '';
  }
  function actionsHtml(m) {
    const btns = [];
    if (m.delivery && m.delivery.failed > 0) {
      btns.push(`<button class="row-action-btn primary" data-act="retry" data-id="${m.id}">${ic('refresh',12)} 重试</button>`);
    }
    if (m.type === 'scheduled') {
      btns.push(`<button class="row-action-btn" data-act="cancel-schedule" data-id="${m.id}">${ic('cancel',12)} 取消定时</button>`);
    }
    if (m.type === 'draft' || m.type === 'scheduled') {
      btns.push(`<button class="row-action-btn danger" data-act="delete" data-id="${m.id}">${ic('trash',12)}</button>`);
    }
    return btns.join('');
  }

  function rowEl(m) {
    const tr = document.createElement('tr');
    tr.dataset.id = m.id;
    if (state.expandedRowId === m.id) tr.classList.add('expanded-row');
    const titleOrSnippet = m.title
      ? `<div class="msg-row-title">${escapeHtml(m.title)}</div><div class="msg-row-snippet">${escapeHtml(stripHtml(m.body).slice(0, 60))}</div>`
      : `<div class="msg-row-snippet" style="color:var(--ink-1);font-size:13px;font-weight:500">${escapeHtml(stripHtml(m.body).slice(0, 60))}</div>`;
    tr.innerHTML = `
      <td class="col-time" title="${absTime(m.time)}">${relTime(m.time)}</td>
      <td class="col-type">${typeChipHtml(m)}</td>
      <td class="col-sender">${escapeHtml(m.sender)}</td>
      <td class="col-recip">${recipientCellHtml(m)}</td>
      <td class="col-preview">${titleOrSnippet}</td>
      <td class="col-status">${deliveryCellHtml(m)}</td>
      <td class="col-actions">${actionsHtml(m)}</td>
    `;
    tr.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      handleRowClick(m);
    });
    tr.querySelectorAll('button[data-act]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        handleRowAction(btn.dataset.act, m);
      });
    });
    return tr;
  }
  function detailRowEl(m) {
    const tr = document.createElement('tr');
    tr.className = 'detail-row';
    const recipItems = (m.recipients || []).map(rid => {
      const name = memberName(rid);
      let statusBadge = '';
      if (m.delivery) {
        if (m.delivery.failed > 0 && Math.random() < (m.delivery.failed / m.delivery.total)) {
          // 简单分配 · demo · 实际场景应该 mock 每收件人状态
        }
      }
      // demo 每人状态：按比例分配
      const idx = (m.recipients || []).indexOf(rid);
      let cls = 'unread', label = '未读';
      if (m.delivery) {
        if (m.delivery.failed > 0 && idx < m.delivery.failed) { cls = 'failed'; label = '发送失败'; }
        else if (idx < m.delivery.read) { cls = 'read'; label = '已读 · ' + relTime(m.time); }
      }
      return `<div class="detail-recipient-item">
        <span class="name">${escapeHtml(name)}</span>
        <span class="${cls}">${label}</span>
      </div>`;
    }).join('');
    // v1.3 · 自动催学是 AI 生成 · 必挂 AICDisclaimer（法律红线）· 接 BRANDING.disclaimerText
    const _disclaimer = (window.BRANDING && window.BRANDING.disclaimerText) || '以上内容由 NeoLearning AI 生成，仅供参考';
    const aiNote = (m.type === 'auto')
      ? `<div style="margin-top:10px;padding:6px 10px;background:var(--bg-soft);border-radius:6px;font-size:11px;color:var(--ink-3);text-align:center">${_disclaimer}</div>`
      : '';
    tr.innerHTML = `<td colspan="7"><div class="detail-grid">
      <div>
        <div class="detail-block-title">${m.title ? '标题' : '内容'}</div>
        ${m.title ? `<div class="detail-block-body" style="font-weight:600">${escapeHtml(m.title)}</div>` : ''}
        <div class="detail-block-title">完整内容</div>
        <div class="detail-block-body">${m.body.replace(/<[^>]+>/g,'').replace(/\n/g,'<br>')}${aiNote}</div>
      </div>
      <div>
        <div class="detail-block-title">收件人状态（${(m.recipients||[]).length} 人）</div>
        <div class="detail-recipient-list">${recipItems}</div>
      </div>
    </div></td>`;
    return tr;
  }
  function stripHtml(s) { return String(s||'').replace(/<[^>]+>/g, ''); }

  function handleRowClick(m) {
    if (m.type === 'draft' || m.type === 'scheduled') {
      // 重进编辑器
      openEditor(m);
    } else {
      // 已发送 inline expand
      state.expandedRowId = state.expandedRowId === m.id ? null : m.id;
      renderList();
    }
  }
  function handleRowAction(act, m) {
    if (act === 'delete') {
      openModal(`
        <div class="modal-title">${ic('warn',16)} 删除${m.type === 'draft' ? '草稿' : '定时消息'}？</div>
        <div class="modal-body">${m.title ? '"' + escapeHtml(m.title) + '"' : '该消息'}将被永久删除，此操作不可撤销。</div>
        <div class="modal-actions">
          <button class="modal-btn" onclick="closeModal()">取消</button>
          <button class="modal-btn primary" id="confirmDel">确认删除</button>
        </div>
      `);
      $('confirmDel').addEventListener('click', () => {
        M.messages = M.messages.filter(x => x.id !== m.id);
        closeModal();
        showToast('已删除');
        renderList();
      });
    } else if (act === 'cancel-schedule') {
      openModal(`
        <div class="modal-title">取消定时发送？</div>
        <div class="modal-body">取消后将转为草稿，定时时刻保留为最后保存时间。</div>
        <div class="modal-actions">
          <button class="modal-btn" onclick="closeModal()">取消</button>
          <button class="modal-btn primary" id="confirmCancel">确认</button>
        </div>
      `);
      $('confirmCancel').addEventListener('click', () => {
        m.type = 'draft';
        // 保留 scheduledAt 作为信息但不再渲染状态文案 · spec § 1.2.1 line 60
        delete m.delivery;
        closeModal();
        showToast('已转为草稿');
        renderList();
      });
    } else if (act === 'retry') {
      openModal(`
        <div class="modal-title">${ic('refresh',16)} 重试发送？</div>
        <div class="modal-body">将对失败的 ${m.delivery.failed} 个收件人重新发送（已成功的不重发）。</div>
        <div class="modal-actions">
          <button class="modal-btn" onclick="closeModal()">取消</button>
          <button class="modal-btn primary" id="confirmRetry">确认重试</button>
        </div>
      `);
      $('confirmRetry').addEventListener('click', () => {
        const failed = m.delivery.failed;
        m.delivery.sent = m.delivery.total;
        m.delivery.read = m.delivery.read + Math.floor(failed * 0.6);
        m.delivery.failed = 0;
        closeModal();
        showToast(`已重试 ${failed} 个收件人 · 全部成功`);
        renderList();
      });
    }
  }

  /* ==========  编辑器  ========== */
  function openEditor(existing) {
    state.editing = existing
      ? { id: existing.id, type: existing.type, recipients: (existing.recipients||[]).slice(), title: existing.title || '', body: existing.body || '', scheduledAt: existing.delivery?.scheduledAt || null }
      : { id: null, type: 'draft', recipients: [], title: '', body: '', scheduledAt: null };
    state.editorSnapshot = JSON.parse(JSON.stringify(state.editing));
    state.view = 'editor';
    renderSubbar();
    renderEditor();
    $('viewList').style.display = 'none';
    $('viewEditor').style.display = '';
    // 自动保存计时
    resetAutosave();
  }
  function exitEditor(forceProceed) {
    if (!forceProceed && isEditorDirty()) {
      tryNavigate(() => doExitEditor());
      return;
    }
    doExitEditor();
  }
  function doExitEditor() {
    clearAutosave();
    state.editing = null;
    state.editorSnapshot = null;
    state.view = 'list';
    $('viewEditor').style.display = 'none';
    $('viewList').style.display = '';
    renderSubbar();
    renderList();
  }
  function isEditorDirty() {
    if (!state.editing || !state.editorSnapshot) return false;
    const a = state.editing, b = state.editorSnapshot;
    if (a.title !== b.title) return true;
    if ((a.body||'') !== (b.body||'')) return true;
    if (a.recipients.join(',') !== b.recipients.join(',')) return true;
    return false;
  }
  function resetAutosave() {
    clearAutosave();
    state.autosaveTimer = setTimeout(() => {
      if (isEditorDirty()) {
        saveDraft({ silent: true });
      }
    }, 30000);  // spec § 1.3.3 · 30s
  }
  function clearAutosave() { if (state.autosaveTimer) { clearTimeout(state.autosaveTimer); state.autosaveTimer = null; } }

  function renderEditor() {
    const e = state.editing;
    const root = $('viewEditor');
    root.innerHTML = `
      <div class="editor-card">
        <div class="editor-form-row">
          <div class="editor-form-label">收件人<span class="req">*</span></div>
          <div class="editor-form-body">
            <div class="recip-chips" id="recipChips"></div>
          </div>
        </div>
        <div class="editor-form-row">
          <div class="editor-form-label">标题</div>
          <div class="editor-form-body">
            <input class="editor-input" id="editorTitle" maxlength="80" placeholder="选填 · 帮助识别消息主题（≤ 80 字）" />
          </div>
        </div>
        <div class="editor-form-row" style="flex-direction:column;align-items:stretch">
          <div style="display:flex;gap:16px;align-items:flex-start;width:100%">
            <div class="editor-form-label">内容<span class="req">*</span></div>
            <div class="editor-form-body">
              <div class="editor-toolbar">
                <button class="editor-tool-btn" data-tool="bold" title="加粗"><b>B</b></button>
                <button class="editor-tool-btn" data-tool="italic" title="斜体"><i>I</i></button>
                <button class="editor-tool-btn" data-tool="strike" title="删除线"><span class="strike">S</span></button>
                <button class="editor-tool-btn" data-tool="link" title="链接">${Icons.link(13)}</button>
              </div>
              <div class="editor-content" id="editorBody" contenteditable="true" data-placeholder="输入消息内容…（支持加粗 / 斜体 / 删除线 / 链接 · 上限 500 字）"></div>
              <div class="editor-counter" id="editorCounter">
                <span class="editor-autosave" id="editorAutosave"></span>
                <span><span id="editorCount">0</span> / 500</span>
              </div>
            </div>
          </div>
        </div>
        <div class="editor-actions">
          <button class="editor-btn" id="btnSaveDraft">${ic('save',13)} 草稿保存</button>
          <button class="editor-btn" id="btnSchedule">${ic('clock',13)} 定时发送</button>
          <button class="editor-btn primary" id="btnSendNow">${ic('send',13)} 立即发送</button>
        </div>
      </div>
    `;
    renderRecipChips();
    $('editorTitle').value = e.title || '';
    $('editorBody').innerHTML = e.body || '';
    updateCounter();
    if (state.lastSaveLabel) $('editorAutosave').textContent = state.lastSaveLabel;

    $('editorTitle').addEventListener('input', e => { state.editing.title = e.target.value; resetAutosave(); });
    $('editorBody').addEventListener('input', () => {
      state.editing.body = $('editorBody').innerHTML;
      updateCounter();
      resetAutosave();
    });
    document.querySelectorAll('.editor-tool-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        applyTool(btn.dataset.tool);
      });
    });
    $('btnSaveDraft').addEventListener('click', () => saveDraft());
    $('btnSchedule').addEventListener('click', () => promptSchedule());
    $('btnSendNow').addEventListener('click', () => promptSendNow());
  }

  function applyTool(tool) {
    const ed = $('editorBody');
    ed.focus();
    if (tool === 'bold') document.execCommand('bold');
    else if (tool === 'italic') document.execCommand('italic');
    else if (tool === 'strike') document.execCommand('strikeThrough');
    else if (tool === 'link') {
      const url = prompt('请输入链接 URL：', 'https://');
      if (url) document.execCommand('createLink', false, url);
    }
    state.editing.body = ed.innerHTML;
    updateCounter();
    resetAutosave();
  }
  function getTextLength() {
    const ed = $('editorBody');
    return ed ? ed.textContent.length : 0;
  }
  function updateCounter() {
    const len = getTextLength();
    const counter = $('editorCounter');
    const span = $('editorCount');
    if (span) span.textContent = len;
    if (counter) counter.classList.toggle('over', len > 500);
    // 三按钮 disabled
    const valid = len > 0 && len <= 500 && state.editing.recipients.length > 0;
    if ($('btnSendNow')) $('btnSendNow').disabled = !valid;
    if ($('btnSchedule')) $('btnSchedule').disabled = !valid;
    if ($('btnSaveDraft')) $('btnSaveDraft').disabled = false;  // 草稿不需必填
  }

  function renderRecipChips() {
    const wrap = $('recipChips'); if (!wrap) return;
    const e = state.editing;
    const chips = e.recipients.map(rid => {
      const name = memberName(rid);
      return `<span class="recip-chip">${escapeHtml(name)} <button class="recip-chip-x" data-rid="${rid}" title="移除">${Icons.times(11)}</button></span>`;
    }).join('');
    wrap.innerHTML = chips
      + `<button class="recip-add-btn" id="btnAddRecip">${ic('plus',12)}添加收件人</button>`
      + (e.recipients.length === 0 ? '<span class="recip-empty">未选学员</span>' : '');
    wrap.querySelectorAll('.recip-chip-x').forEach(b => {
      b.addEventListener('click', () => {
        const rid = b.dataset.rid;
        state.editing.recipients = state.editing.recipients.filter(x => x !== rid);
        renderRecipChips();
        updateCounter();
        resetAutosave();
      });
    });
    $('btnAddRecip').addEventListener('click', openRecipPicker);
  }

  function openRecipPicker() {
    const all = M.members.filter(m => m.isLearner);
    const selected = new Set(state.editing.recipients);
    let q = '';
    function render() {
      const filtered = all.filter(m => {
        if (!q) return true;
        const t = q.toLowerCase();
        return m.name.toLowerCase().includes(t) || (m.dept||'').toLowerCase().includes(t) || (m.email||'').toLowerCase().includes(t);
      });
      const allFilteredSelected = filtered.length > 0 && filtered.every(m => selected.has(m.id));
      const items = filtered.map(m => `
        <label class="picker-item">
          <input type="checkbox" data-id="${m.id}" ${selected.has(m.id)?'checked':''} />
          <span class="picker-item-name">${escapeHtml(m.name)}</span>
          <span class="picker-item-meta">${escapeHtml(m.dept||'')} · ${escapeHtml(m.email||'')}</span>
        </label>
      `).join('');
      $('pickerList').innerHTML = items || '<div style="text-align:center;color:var(--ink-4);padding:24px">没有匹配学员</div>';
      $('selectAllCb').checked = allFilteredSelected;
      $('pickerCount').textContent = `已选 ${selected.size} / 共 ${all.length} 人`;
      $('pickerList').querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', e => {
          const id = e.target.dataset.id;
          if (e.target.checked) selected.add(id); else selected.delete(id);
          render();
        });
      });
    }
    openModal(`
      <div class="modal-title">选择收件人</div>
      <div class="modal-sub">单选 / 多选 / 全选 / 模糊查询</div>
      <input class="picker-search" id="pickerSearch" placeholder="搜索 姓名 / 部门 / 邮箱" />
      <div class="picker-toolbar">
        <label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--ink-2);cursor:pointer">
          <input type="checkbox" id="selectAllCb" /> 全选当前结果
        </label>
        <span class="picker-count" id="pickerCount"></span>
      </div>
      <div class="picker-list" id="pickerList"></div>
      <div class="modal-actions" style="margin-top:14px">
        <button class="modal-btn" onclick="closeModal()">取消</button>
        <button class="modal-btn primary" id="confirmPicker">确认</button>
      </div>
    `, { wide: true });
    render();
    $('pickerSearch').addEventListener('input', e => { q = e.target.value; render(); });
    $('selectAllCb').addEventListener('change', e => {
      const filtered = all.filter(m => !q || m.name.toLowerCase().includes(q.toLowerCase()));
      if (e.target.checked) filtered.forEach(m => selected.add(m.id));
      else filtered.forEach(m => selected.delete(m.id));
      render();
    });
    $('confirmPicker').addEventListener('click', () => {
      state.editing.recipients = Array.from(selected);
      closeModal();
      renderRecipChips();
      updateCounter();
      resetAutosave();
    });
  }

  function saveDraft(opts) {
    const e = state.editing;
    const now = new Date().toISOString();
    if (e.id) {
      const found = M.messages.find(x => x.id === e.id);
      if (found) {
        found.recipients = e.recipients.slice();
        found.title = e.title;
        found.body = e.body;
        found.time = now;
        if (found.type === 'scheduled') {
          // 保留为定时
        } else {
          found.type = 'draft';
        }
      }
    } else {
      const draft = {
        id: uid('msg-d'),
        type: 'draft',
        senderId: M.currentAdmin.id,
        sender: M.currentAdmin.name,
        recipients: e.recipients.slice(),
        title: e.title,
        body: e.body,
        time: now
      };
      M.messages.unshift(draft);
      e.id = draft.id;
    }
    state.editorSnapshot = JSON.parse(JSON.stringify(e));
    const t = new Date();
    state.lastSaveLabel = '已自动保存 · ' + String(t.getHours()).padStart(2,'0') + ':' + String(t.getMinutes()).padStart(2,'0') + ':' + String(t.getSeconds()).padStart(2,'0');
    if ($('editorAutosave')) $('editorAutosave').textContent = state.lastSaveLabel;
    if (!opts || !opts.silent) showToast('草稿已保存');
  }

  function promptSchedule() {
    const len = getTextLength();
    if (len === 0 || len > 500 || state.editing.recipients.length === 0) return;
    const minDt = new Date(); minDt.setMinutes(minDt.getMinutes() + 5);
    const minStr = minDt.getFullYear()+'-'+String(minDt.getMonth()+1).padStart(2,'0')+'-'+String(minDt.getDate()).padStart(2,'0')+'T'+String(minDt.getHours()).padStart(2,'0')+':'+String(minDt.getMinutes()).padStart(2,'0');
    openModal(`
      <div class="modal-title">${ic('clock',16)} 定时发送</div>
      <div class="modal-body">
        <p>选择发送时间（必须晚于当前 5 分钟）</p>
        <input type="datetime-local" id="scheduleDt" class="editor-input" min="${minStr}" value="${minStr}" />
      </div>
      <div class="modal-actions">
        <button class="modal-btn" onclick="closeModal()">取消</button>
        <button class="modal-btn primary" id="confirmSchedule">确认定时</button>
      </div>
    `);
    $('confirmSchedule').addEventListener('click', () => {
      const dt = $('scheduleDt').value;
      if (!dt) { showToast('请选择时间'); return; }
      const target = new Date(dt);
      if (target <= new Date()) { showToast('必须晚于当前时间'); return; }
      const e = state.editing;
      const now = new Date().toISOString();
      if (e.id) {
        const found = M.messages.find(x => x.id === e.id);
        if (found) {
          found.recipients = e.recipients.slice();
          found.title = e.title;
          found.body = e.body;
          found.time = now;
          found.type = 'scheduled';
          found.delivery = { scheduledAt: target.toISOString() };
        }
      } else {
        M.messages.unshift({
          id: uid('msg-s'),
          type: 'scheduled',
          senderId: M.currentAdmin.id,
          sender: M.currentAdmin.name,
          recipients: e.recipients.slice(),
          title: e.title,
          body: e.body,
          time: now,
          delivery: { scheduledAt: target.toISOString() }
        });
      }
      closeModal();
      showToast('已定时 · ' + shortDate(target.toISOString()));
      // 退出编辑器（视为完成）
      state.editorSnapshot = JSON.parse(JSON.stringify(state.editing));
      doExitEditor();
    });
  }

  function promptSendNow() {
    const len = getTextLength();
    if (len === 0 || len > 500 || state.editing.recipients.length === 0) return;
    const n = state.editing.recipients.length;
    openModal(`
      <div class="modal-title">${ic('send',16)} 立即发送</div>
      <div class="modal-body">
        <p>确认发送给 <b>${n}</b> 名学员？</p>
        <p style="color:var(--ink-3);font-size:12px;margin-top:8px">已发送的消息不可撤回 / 不可修改 / 不可删除（spec § 1.4.3）</p>
      </div>
      <div class="modal-actions">
        <button class="modal-btn" onclick="closeModal()">取消</button>
        <button class="modal-btn primary" id="confirmSend">确认发送</button>
      </div>
    `);
    $('confirmSend').addEventListener('click', () => {
      const e = state.editing;
      const now = new Date().toISOString();
      const total = e.recipients.length;
      if (e.id) {
        // 来自草稿 / 定时 → 转 manual + 添加 delivery
        const found = M.messages.find(x => x.id === e.id);
        if (found) {
          found.recipients = e.recipients.slice();
          found.title = e.title;
          found.body = e.body;
          found.time = now;
          found.type = 'manual';
          found.delivery = { sent: total, read: 0, total };
        }
      } else {
        M.messages.unshift({
          id: uid('msg-m'),
          type: 'manual',
          senderId: M.currentAdmin.id,
          sender: M.currentAdmin.name,
          recipients: e.recipients.slice(),
          title: e.title,
          body: e.body,
          time: now,
          delivery: { sent: total, read: 0, total }
        });
      }
      closeModal();
      showToast(`已发送给 ${total} 名学员`);
      state.editorSnapshot = JSON.parse(JSON.stringify(state.editing));
      doExitEditor();
    });
  }

  /* ==========  离开拦截 · 沿用 proconfig 的 completion-modal 风  ========== */
  function tryNavigate(proceed, opts) {
    if (!isEditorDirty()) { proceed(); return; }
    const titleText = (opts && opts.title) || '编辑器有未保存的改动';
    const subText = (opts && opts.sub) || '继续操作前请处理：';
    openModal(`
      <div class="completion-icon">${ic('warn',32)}</div>
      <div class="completion-title">${escapeHtml(titleText)}</div>
      <div class="completion-sub">${escapeHtml(subText)}</div>
      <div class="completion-list">
        <div class="completion-list-title">未保存模块</div>
        <ul><li>消息编辑器</li></ul>
      </div>
      <div class="completion-actions">
        <button class="completion-btn primary" id="leaveSaveAll">保存草稿后继续</button>
        <button class="completion-btn" id="leaveStay">继续编辑（取消）</button>
        <button class="completion-btn danger" id="leaveDiscard">放弃改动</button>
      </div>
    `);
    $('leaveStay').addEventListener('click', () => closeModal());
    $('leaveDiscard').addEventListener('click', () => {
      // 还原 snapshot 后离开（demo 简化：直接 proceed · snapshot 不重要因为离开后不再编辑）
      state.editorSnapshot = JSON.parse(JSON.stringify(state.editing));
      closeModal();
      proceed();
    });
    $('leaveSaveAll').addEventListener('click', () => {
      saveDraft({ silent: true });
      closeModal();
      proceed();
    });
  }
  function setupReloadIntercept() {
    document.addEventListener('keydown', e => {
      const isReload = e.key === 'F5' || ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R'));
      if (!isReload) return;
      if (state.view !== 'editor' || !isEditorDirty()) return;
      e.preventDefault();
      e.stopPropagation();
      tryNavigate(() => window.location.reload(), { title: '重新加载页面？', sub: '重载会丢失编辑器中未保存的改动：' });
    }, true);
  }

  /* ==========  bell + avatar · v1.3 跨页 _shared/messages.js 单 source  ========== */
  function renderBell() {
    const list = $('bellMsgList');
    const messages = (typeof filterMessagesByRole === 'function')
      ? filterMessagesByRole('admin')
      : [];
    const isUnread = m => (typeof MessagesRead !== 'undefined') ? !MessagesRead.isRead(m) : !!m.unread;
    list.innerHTML = messages.map((m, i) => `
      <div class="msg-row ${isUnread(m)?'unread':''}" data-i="${i}">
        <div class="msg-avatar-wrap ${m.type}">${m.type === 'system' ? ic('warn',16) : m.type === 'platform' ? ic('check',16) : escapeHtml((m.sender||'?').slice(0,1))}</div>
        <div class="msg-content">
          <div class="msg-head"><span class="msg-text">${escapeHtml(m.title)}</span>${isUnread(m)?'<span class="msg-dot-unread"></span>':''}</div>
          <div class="msg-sender">${escapeHtml(m.sender)} · ${escapeHtml(m.time)}</div>
          <div class="msg-desc">${escapeHtml(m.desc)}</div>
        </div>
      </div>`).join('');
    list.querySelectorAll('.msg-row').forEach(r => r.addEventListener('click', e => {
      e.stopPropagation();
      r.classList.toggle('expanded');
      const m = messages[+r.dataset.i];
      if (isUnread(m)) {
        if (typeof MessagesRead !== 'undefined') MessagesRead.markRead(m);
        else m.unread = false;
        renderBell();
      }
    }));
    const unread = (typeof MessagesRead !== 'undefined')
      ? MessagesRead.unreadCount('admin')
      : messages.filter(m=>m.unread).length;
    const badge = $('bellBadge');
    if (badge) {
      if (unread > 0) { badge.style.display=''; badge.textContent = unread; }
      else badge.style.display = 'none';
    }
  }
  function renderAvatar() {
    // v1.3 · Session 优先 · M.currentAdmin 兜底
    const sess = (typeof Session !== 'undefined' && Session.get) ? Session.get() : null;
    const a = M.currentAdmin || {};
    const display = (sess && sess.display) || a.name || '';
    const surname = a.surname || (display ? display.slice(0,1) : '');
    const role = a.role || '';
    if (surname) $('avatarCircle').textContent = surname;
    if (display) { $('avatarName').textContent = display; $('adName').textContent = display; }
    if (role) $('adRole').textContent = role;
    const canSwitch = sess
      ? (sess.role === 'learner+admin')
      : !!a.canSwitchPort;
    if (!canSwitch) {
      $('switchPort').classList.add('disabled');
    }
  }
  function setupDropdowns() {
    const bellBtn = $('bellBtn'), bellDD = $('bellDropdown');
    const avBtn = $('avatarBtn'), avDD = $('avatarDropdown');
    function close() { bellDD?.classList.remove('open'); avDD?.classList.remove('open'); }
    bellBtn.addEventListener('click', e => { e.stopPropagation(); avDD.classList.remove('open'); bellDD.classList.toggle('open'); });
    avBtn.addEventListener('click', e => { e.stopPropagation(); bellDD.classList.remove('open'); avDD.classList.toggle('open'); });
    document.addEventListener('click', close);
    $('markAllRead').addEventListener('click', e => {
      e.stopPropagation();
      if (typeof MessagesRead !== 'undefined') MessagesRead.markAllReadFor('admin');
      renderBell();
      showToast('已全部标为已读');
    });
    $('openHelp').addEventListener('click', () => { avDD.classList.remove('open'); showToast('帮助文档（demo 占位）'); });
    // v1.3 · 切换学员端 · Session.canSwitchPort + Router.go
    $('switchPort').addEventListener('click', () => {
      avDD.classList.remove('open');
      const canSwitch = (typeof Session !== 'undefined' && Session.canSwitchPort)
        ? Session.canSwitchPort()
        : !$('switchPort').classList.contains('disabled');
      if (!canSwitch) { showToast('你只有管理员角色 · 不能切换'); return; }
      tryNavigateOrLeave(() => {
        openModal(`<div class="modal-title">切换到学员端</div>
          <div class="modal-body">将离开管理端进入学员端 hall。</div>
          <div class="modal-actions"><button class="modal-btn" onclick="closeModal()">取消</button>
          <button class="modal-btn primary" onclick="closeModal();Router.go('hall')">确认</button></div>`);
      });
    });
    // v1.3 · 退出登录 · Session.clear + Router.go
    $('logoutBtn').addEventListener('click', () => {
      avDD.classList.remove('open');
      tryNavigateOrLeave(() => {
        openModal(`<div class="modal-title">退出登录</div>
          <div class="modal-body">确定退出当前账号？</div>
          <div class="modal-actions"><button class="modal-btn" onclick="closeModal()">取消</button>
          <button class="modal-btn primary" onclick="closeModal();Session.clear();Router.go('login')">确定</button></div>`);
      });
    });
  }
  function tryNavigateOrLeave(proceed) {
    if (state.view === 'editor' && isEditorDirty()) tryNavigate(proceed);
    else proceed();
  }
  function setupNav() {
    // v1.3 · sidenav 4 项 · 走 Router.go（reportmgt 仍 toast 因为 v1.4 才做）
    $('navHome').addEventListener('click', () => tryNavigateOrLeave(() => Router.go('mgthome')));
    $('navReport').addEventListener('click', () => tryNavigateOrLeave(() => Router.go('reportcenter')));
    $('navConfig').addEventListener('click', () => tryNavigateOrLeave(() => Router.go('proconfig')));
    $('navMessage').addEventListener('click', () => { /* 当前页 */ });
    $('topbarBrand').addEventListener('click', () => tryNavigateOrLeave(() => Router.go('mgthome')));
  }
  function setupSettingsDrawer() {
    $('openSettings').addEventListener('click', () => { $('avatarDropdown').classList.remove('open'); $('settingsDrawer').classList.add('open'); });
    $('settingsClose').addEventListener('click', () => $('settingsDrawer').classList.remove('open'));
    $('settingsDrawer').addEventListener('click', e => { if (e.target === $('settingsDrawer')) $('settingsDrawer').classList.remove('open'); });
    document.querySelectorAll('button[data-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.dataset.theme;
        document.documentElement.setAttribute('data-theme', t);
        try { localStorage.setItem('rx-theme', t); } catch {}
        document.querySelectorAll('button[data-theme]').forEach(b => b.classList.toggle('active', b === btn));
      });
    });
    // v1.3 · 语速持久化（rx-speed · 跨页同 key）
    document.querySelectorAll('button[data-speed]').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.speed;
        try { localStorage.setItem('rx-speed', v); } catch {}
        document.querySelectorAll('button[data-speed]').forEach(b => b.classList.toggle('active', b === btn));
      });
    });
    // v1.3 · Neo persona 持久化（rx-persona · 跨页同 key）
    document.querySelectorAll('button[data-persona]').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.persona;
        try { localStorage.setItem('rx-persona', v); } catch {}
        document.querySelectorAll('button[data-persona]').forEach(b => b.classList.toggle('active', b === btn));
      });
    });
    // v1.3 · init from localStorage
    try {
      const t = localStorage.getItem('rx-theme') || 'light';
      document.documentElement.setAttribute('data-theme', t);
      document.querySelectorAll('button[data-theme]').forEach(b => b.classList.toggle('active', b.dataset.theme === t));
      const sp = localStorage.getItem('rx-speed') || 'normal';
      document.querySelectorAll('button[data-speed]').forEach(b => b.classList.toggle('active', b.dataset.speed === sp));
      const ps = localStorage.getItem('rx-persona') || 'male';
      document.querySelectorAll('button[data-persona]').forEach(b => b.classList.toggle('active', b.dataset.persona === ps));
    } catch {}
  }

  /* ==========  Init  ========== */
  function init() {
    const url = new URL(location.href);
    if (url.searchParams.get('status') === 'pre-launch') state.status = 'pre-launch';

    // Home 跳入预填 ?recipient=u4 → 直接进编辑器
    const preRecip = url.searchParams.get('recipient');

    renderSubbar();
    renderList();
    renderBell();
    renderAvatar();
    setupDropdowns();
    setupNav();
    setupSettingsDrawer();
    setupReloadIntercept();

    $('modalMask').addEventListener('click', e => { if (e.target === $('modalMask')) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    if (typeof Branding !== 'undefined') Branding.applyAll();

    if (preRecip && memberById(preRecip)) {
      openEditor();
      state.editing.recipients = [preRecip];
      renderRecipChips();
      updateCounter();
      // home 跳入是有意义的初始 dirty · 因为预填了收件人 ≠ snapshot 的 []
      // 让 snapshot 保持空，点 < 返回 时会触发离开拦截
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
