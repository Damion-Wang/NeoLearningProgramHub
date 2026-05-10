/* ============================================================
   Report Center · APP LOGIC (v1)
   管理端 · 报告中心（报告库 + 编辑器 + Report Ora）
   ------------------------------------------------------------
   架构：
   - state 全局状态
   - init / 路由 / Tab 切换
   - Library View：Tab1 管理员报告 / Tab2 学员报告
   - Editor View：toolbar / contenteditable / 图表块
   - Report Ora：chat / A 触发 / B 触发 / vibe / 划词 / 跨 Tab 引用
   - Charts：bar / pie / table / stacked-bar (SVG)
   ============================================================ */
(function() {
  'use strict';

  // ============================================================
  // 0. 工具
  // ============================================================
  const $ = (id) => document.getElementById(id);
  const qs = (sel, ctx) => (ctx || document).querySelector(sel);
  const qsa = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // v1.5 P10 #23 · emoji → SVG 图标 · 与 hall/lecture/practice 风格一致（inline svg）
  const ICON_RECAP = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:3px"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>';
  const ICON_PRACTICE = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:3px"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
  const ICON_HIGHLIGHT = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:3px"><path d="M12 3l1.91 5.84L20 10l-5 4.84L16.18 21 12 17.77 7.82 21 9 14.84 4 10l6.09-1.16z"/></svg>';

  // v1.5 P10 #26 #27 · 去 ACT 编号前缀（"ACT-001-04 重构对练" → "重构对练"）
  function stripActPrefix(s) {
    return String(s || '').replace(/^ACT-\d{3}-\d{2}\s*[·•·\-—\s]*/i, '').trim();
  }

  function showToast(text, ms) {
    const t = $('toast');
    if (!t) return;
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.remove('show'), ms || 2200);
  }
  window.showToast = showToast;

  function openModal(html) {
    const mask = $('modalMask');
    const card = $('modalCard');
    if (!mask || !card) return;
    card.innerHTML = html;
    mask.classList.add('open');
    // mask 点击关闭
    mask.onclick = (e) => { if (e.target === mask) closeModal(); };
  }
  function closeModal() {
    const mask = $('modalMask');
    if (mask) mask.classList.remove('open');
  }
  window.closeReportModal = closeModal;

  // ============================================================
  // 1. State
  // ============================================================
  const state = {
    view: 'library',                      // library | editor
    tab: 'manager',                        // manager | student
    currentReportId: null,
    expandedStudents: new Set(),
    chartCounter: 0,                       // 动态生成 chart-block id
    pendingChart: null,                    // B 触发流：当前等待填充的 chart-block 元素
    chartAskQueue: [],                     // B 触发流：待问的 ask 队列
    selRange: null                         // 划词时保存的 Range
  };

  // 简易 URL 路由
  function readRoute() {
    const p = new URLSearchParams(location.search);
    return {
      view: p.get('view') || 'library',
      tab: p.get('tab') || 'manager',
      id: p.get('id') || null
    };
  }
  function writeRoute() {
    const p = new URLSearchParams();
    if (state.view !== 'library') p.set('view', state.view);
    if (state.view === 'library' && state.tab !== 'manager') p.set('tab', state.tab);
    if (state.view === 'editor' && state.currentReportId) p.set('id', state.currentReportId);
    const q = p.toString();
    history.replaceState(null, '', location.pathname + (q ? '?' + q : ''));
  }

  function switchView(v) {
    // v1.3 切到 library 前立即保存（避免 debounce 延迟丢失）
    if (state.view === 'editor' && v === 'library') {
      clearTimeout(_saveTimer);
      saveCurrentReport();
      // 同步刷新列表（modifiedAt 等）
      renderManagerReports();
    }
    state.view = v;
    qsa('.view-panel').forEach(el => el.classList.remove('active'));
    if (v === 'library') $('viewLibrary').classList.add('active');
    else if (v === 'editor') $('viewEditor').classList.add('active');
    document.body.classList.toggle('view-library', v === 'library');
    document.body.classList.toggle('view-editor', v === 'editor');
    updateSubbar();    // v1.9 subbar 内容随 view 切换
    writeRoute();
  }

  // v1.9 subbar 渲染（沿用 lecture · 横向贯穿 main 列）
  function updateSubbar() {
    const M = window.REPORT_MOCK;
    const left = $('subbarLeft');
    const mid = $('subbarMid');
    const right = $('subbarRight');
    if (!left || !right) return;

    if (state.view === 'library') {
      left.innerHTML = `
        <span class="subbar-title">报告中心</span>
        <span class="subbar-meta">· 管理员产出 · 学员侧产生</span>
      `;
      mid.innerHTML = '';
      right.innerHTML = `
        <button class="btn-primary" id="btnNewReport">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新建报告
        </button>
      `;
      const newBtn = $('btnNewReport');
      newBtn.addEventListener('click', openNewReportModal);
      // 首次进入 demo 引导 pulse
      if (M.demoFlags && M.demoFlags.autoToastReady && !state._guidePulseFired) {
        newBtn.classList.add('pulse-guide');
        newBtn.addEventListener('click', () => newBtn.classList.remove('pulse-guide'), { once: true });
        state._guidePulseFired = true;
      }
    } else if (state.view === 'editor') {
      const rpt = (M.managerReports || []).find(r => r.id === state.currentReportId);
      const name = (rpt && (rpt.savedTitle || rpt.name)) || '未命名报告';
      const tmpl = rpt && rpt.template ? rpt.template : '空白报告';
      const time = rpt && rpt.createdAt ? rpt.createdAt : '';
      left.innerHTML = `
        <button class="subbar-back-btn" id="btnBackToLib" title="返回报告库" aria-label="返回报告库">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <input class="subbar-title-input" id="editorTitleInput" value="${esc(name)}" placeholder="未命名报告" />
        <span class="subbar-meta">· ${esc(tmpl)}${time ? ' · ' + esc(time) : ''}</span>
      `;
      mid.innerHTML = '';
      right.innerHTML = `
        <div style="position:relative">
          <button class="btn-secondary" id="btnExport">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            导出
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="dropdown" id="exportDropdown" style="right:0;top:calc(100% + 6px)">
            <div class="dropdown-item" data-export-format="PDF"><span>📄</span> PDF</div>
            <div class="dropdown-item" data-export-format="Word"><span>📝</span> Word</div>
          </div>
        </div>
      `;
      $('btnBackToLib').addEventListener('click', () => {
        switchView('library');
        state.currentReportId = null;
      });
      // editorTitleInput 保存联动
      $('editorTitleInput').addEventListener('input', () => {
        const r = (M.managerReports || []).find(x => x.id === state.currentReportId);
        if (r) r.name = $('editorTitleInput').value || '未命名报告';
        debouncedSave();
      });
      // export dropdown 切换
      $('btnExport').addEventListener('click', (e) => {
        e.stopPropagation();
        const dd = $('exportDropdown');
        dd.classList.toggle('open');
        setTimeout(() => {
          const onOut = (ev) => {
            if (!dd.contains(ev.target) && !$('btnExport').contains(ev.target)) {
              dd.classList.remove('open');
              document.removeEventListener('click', onOut);
            }
          };
          document.addEventListener('click', onOut);
        }, 0);
      });
      // A9 · 导出 toast 加报告名（PDF / Word 两按钮统一处理）
      qsa('#exportDropdown .dropdown-item').forEach(it => {
        it.addEventListener('click', () => {
          const fmt = it.dataset.exportFormat;
          const r = (M.managerReports || []).find(x => x.id === state.currentReportId);
          const rname = (r && (r.savedTitle || r.name)) || '未命名报告';
          showToast(`正在导出 ${rname} ${fmt} · demo 暂未接入实际下载`);
          $('exportDropdown').classList.remove('open');
        });
      });
    }
  }

  function switchTab(t) {
    state.tab = t;
    qsa('.lib-tab').forEach(el => el.classList.toggle('active', el.dataset.tab === t));
    $('managerReportPane').style.display = (t === 'manager') ? '' : 'none';
    $('studentReportPane').style.display = (t === 'student') ? '' : 'none';
    writeRoute();
  }

  // ============================================================
  // 2. Tab1 · 管理员报告 渲染
  // ============================================================
  function renderManagerReports(filterText) {
    const M = window.REPORT_MOCK;
    const wrap = $('managerReportTable');
    if (!wrap) return;
    const list = (M.managerReports || []).filter(r => {
      if (!filterText) return true;
      const k = filterText.toLowerCase();
      return (r.name || '').toLowerCase().includes(k) ||
             (r.timePeriod || '').toLowerCase().includes(k) ||
             (r.personScope || '').toLowerCase().includes(k);
    });

    let html = `
      <div class="lib-row head">
        <div>报告名 · 时间周期</div>
        <div>创建时间</div>
        <div>时间周期</div>
        <div>人员范围</div>
        <div style="text-align:right">操作</div>
      </div>
    `;
    if (list.length === 0) {
      html += `<div class="empty">没有匹配的报告</div>`;
    } else {
      list.forEach(r => {
        html += `
          <div class="lib-row" data-id="${esc(r.id)}">
            <div class="lib-cell-name">
              <div class="lib-cell-name-icon">${r.icon || '📄'}</div>
              <div style="min-width:0">
                <div class="lib-cell-name-text">${esc(r.name)}</div>
                <div class="lib-cell-name-meta">${esc(r.template || '空白报告')} · ${esc(r.modifiedAt || '—')}修改</div>
              </div>
            </div>
            <div class="lib-cell-time" title="${esc(r.createdAtAbs || '')}">${esc(r.createdAt)}</div>
            <div class="lib-cell-period"><span class="period-tag">${esc(r.timePeriod)}</span></div>
            <div class="lib-cell-scope">
              <span class="scope-count">${r.personCount}</span>
              <span style="color:var(--ink-3);font-size:11px;margin-left:4px">${esc(r.personScope)}</span>
            </div>
            <div class="lib-actions">
              <button class="lib-action-btn" data-act="menu" data-id="${esc(r.id)}" aria-label="更多">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
              </button>
            </div>
          </div>
        `;
      });
    }
    wrap.innerHTML = html;

    // 绑定行点击 → 进编辑器
    qsa('.lib-row[data-id]', wrap).forEach(row => {
      row.addEventListener('click', (e) => {
        // 行内菜单点击不触发整行
        if (e.target.closest('.lib-actions')) return;
        const id = row.dataset.id;
        openReportInEditor(id);
      });
    });

    // 行末菜单
    qsa('.lib-action-btn[data-act="menu"]', wrap).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showRowActionsMenu(btn, btn.dataset.id);
      });
    });

    $('tabManagerCount').textContent = M.managerReports.length;
  }

  function showRowActionsMenu(anchor, reportId) {
    // 关掉已有菜单
    qsa('.lib-actions-menu.open').forEach(m => m.remove());
    const menu = document.createElement('div');
    menu.className = 'lib-actions-menu open';
    menu.innerHTML = `
      <div class="lib-actions-menu-item" data-act="edit">📝 修改 / 查看</div>
      <div class="lib-actions-menu-item" data-act="copy">📋 复制</div>
      <div class="lib-actions-menu-item" data-act="export">📥 导出</div>
      <div class="lib-actions-menu-item danger" data-act="delete">🗑️ 删除</div>
    `;
    document.body.appendChild(menu);
    const rect = anchor.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
    menu.style.top = (rect.bottom + 6) + 'px';

    function onClick(e) {
      const it = e.target.closest('.lib-actions-menu-item');
      if (!it) return;
      const act = it.dataset.act;
      menu.remove();
      handleRowAction(act, reportId);
    }
    function onOutside(e) {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', onOutside, true);
      }
    }
    menu.addEventListener('click', onClick);
    setTimeout(() => document.addEventListener('click', onOutside, true), 0);
  }

  function handleRowAction(act, reportId) {
    const M = window.REPORT_MOCK;
    const rpt = (M.managerReports || []).find(r => r.id === reportId);
    if (!rpt) return;
    if (act === 'edit') {
      openReportInEditor(reportId);
    } else if (act === 'copy') {
      const copy = JSON.parse(JSON.stringify(rpt));
      copy.id = 'rpt-copy-' + Date.now();
      copy.name = rpt.name + '（副本）';
      copy.createdAt = '刚刚';
      copy.modifiedAt = '刚刚';
      M.managerReports.unshift(copy);
      renderManagerReports();
      showToast('已复制 · 进入新副本编辑');
      openReportInEditor(copy.id);
    } else if (act === 'export') {
      openExportDialog(rpt.name);
    } else if (act === 'delete') {
      confirmDelete(rpt);
    }
  }

  function confirmDelete(rpt) {
    openModal(`
      <div class="modal-head">
        <div class="modal-title">确认删除？</div>
        <button class="modal-close" onclick="closeReportModal()">×</button>
      </div>
      <div class="modal-body">
        <p style="margin:0 0 8px 0">将永久删除报告 <strong>${esc(rpt.name)}</strong>。</p>
        <p style="margin:0;color:var(--ink-3);font-size:12px">此操作不可恢复。</p>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeReportModal()">取消</button>
        <button class="btn-primary" id="confirmDelBtn" style="background:var(--error)">确认删除</button>
      </div>
    `);
    setTimeout(() => {
      const b = $('confirmDelBtn');
      if (b) b.onclick = () => {
        const M = window.REPORT_MOCK;
        M.managerReports = M.managerReports.filter(x => x.id !== rpt.id);
        renderManagerReports();
        closeModal();
        showToast('已删除：' + rpt.name);
      };
    }, 0);
  }

  function openExportDialog(reportName) {
    openModal(`
      <div class="modal-head">
        <div class="modal-title">导出报告</div>
        <button class="modal-close" onclick="closeReportModal()">×</button>
      </div>
      <div class="modal-body">
        <p style="margin:0 0 12px 0">导出 <strong>${esc(reportName)}</strong>，请选择格式：</p>
        <div style="display:flex;gap:10px">
          <button class="btn-secondary" style="flex:1;padding:14px" onclick="showToast('正在导出 PDF · demo 暂未接入实际下载');closeReportModal()">📄 PDF（对外交付）</button>
          <button class="btn-secondary" style="flex:1;padding:14px" onclick="showToast('正在导出 Word · demo 暂未接入实际下载');closeReportModal()">📝 Word（二次编辑）</button>
        </div>
      </div>
    `);
  }

  // ============================================================
  // 3. Tab2 · 学员报告 渲染
  // ============================================================
  function renderStudentReports(filterText) {
    const M = window.REPORT_MOCK;
    const wrap = $('studentReportGroups');
    if (!wrap) return;
    const list = (M.studentReports || []).filter(s => {
      if (!filterText) return true;
      const k = filterText.toLowerCase();
      if ((s.learnerName || '').toLowerCase().includes(k)) return true;
      const allReports = [
        ...(s.reports.recap || []), ...(s.reports.practice || []), ...(s.reports.highlights || [])
      ];
      return allReports.some(r =>
        (r.courseName || r.activityName || r.title || '').toLowerCase().includes(k) ||
        (r.preview || r.quote || '').toLowerCase().includes(k)
      );
    });

    let html = '';
    if (list.length === 0) {
      html = `<div class="empty">没有匹配的学员或报告</div>`;
    } else {
      list.forEach(s => {
        const recapCount = (s.reports.recap || []).length;
        const practiceCount = (s.reports.practice || []).length;
        const highlightCount = (s.reports.highlights || []).length;
        const totalCount = recapCount + practiceCount + highlightCount;
        const isExpanded = state.expandedStudents.has(s.learnerId);
        html += `
          <div class="student-group ${isExpanded ? 'expanded' : ''}" data-learner="${esc(s.learnerId)}">
            <div class="student-head">
              <div class="student-avatar" style="background:${(typeof AvatarColor !== 'undefined') ? AvatarColor.gradient(s.learnerId) : 'linear-gradient(135deg, '+s.avatarColor[0]+', '+s.avatarColor[1]+')'}">${esc(s.learnerName.charAt(0))}</div>
              <div>
                <div class="student-name">${esc(s.learnerName)}</div>
                <div class="student-role">${esc(s.role)}</div>
              </div>
              <div class="student-counts">
                ${recapCount ? `<span class="student-count-chip">${ICON_RECAP}${recapCount} recap</span>` : ''}
                ${practiceCount ? `<span class="student-count-chip">${ICON_PRACTICE}${practiceCount} 对练</span>` : ''}
                ${highlightCount ? `<span class="student-count-chip">${ICON_HIGHLIGHT}${highlightCount} 高光</span>` : ''}
              </div>
              <div class="student-toggle">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
            <div class="student-body">
              ${recapCount ? `
                <div class="student-section">
                  <div class="student-section-title">${ICON_RECAP} Recap 报告（${recapCount}）</div>
                  ${(s.reports.recap || []).map(r => `
                    <div class="student-report-row" data-type="recap" data-id="${esc(r.id)}" data-learner="${esc(s.learnerId)}">
                      <div class="student-report-icon">${ICON_RECAP}</div>
                      <div class="student-report-name">${esc(r.courseName)} · ${esc(stripActPrefix(r.activityName || ''))}</div>
                      <div class="student-report-date">${esc(r.date)}</div>
                    </div>
                  `).join('')}
                </div>` : ''}
              ${practiceCount ? `
                <div class="student-section">
                  <div class="student-section-title">${ICON_PRACTICE} 对练报告（${practiceCount}）</div>
                  ${(s.reports.practice || []).map(r => `
                    <div class="student-report-row" data-type="practice" data-id="${esc(r.id)}" data-learner="${esc(s.learnerId)}">
                      <div class="student-report-icon">${ICON_PRACTICE}</div>
                      <div class="student-report-name">${esc(stripActPrefix(r.activityName))} · 第 ${r.round} 次</div>
                      <div class="student-report-date">${esc(r.date)}</div>
                    </div>
                  `).join('')}
                </div>` : ''}
              ${highlightCount ? `
                <div class="student-section">
                  <div class="student-section-title">${ICON_HIGHLIGHT} 高光卡（${highlightCount}）</div>
                  ${(s.reports.highlights || []).map(r => `
                    <div class="student-report-row" data-type="highlight" data-id="${esc(r.id)}" data-learner="${esc(s.learnerId)}">
                      <div class="student-report-icon">${ICON_HIGHLIGHT}</div>
                      <div class="student-report-name">${esc(r.title)}</div>
                      <div class="student-report-date">${esc(r.date)}</div>
                    </div>
                  `).join('')}
                </div>` : ''}
            </div>
          </div>
        `;
      });
    }
    wrap.innerHTML = html;

    // v1.5.1 B09 · 总数 = 学员人数 + 各学员 recap+practice+highlights 总份数
    let totalReports = 0;
    M.studentReports.forEach(s => {
      totalReports += (s.reports.recap || []).length + (s.reports.practice || []).length + (s.reports.highlights || []).length;
    });
    const learnerCount = (M.studentReports || []).length;
    $('tabStudentCount').textContent = learnerCount + ' 人 · ' + totalReports + ' 份';

    // 绑定折叠 / 展开
    qsa('.student-head', wrap).forEach(h => {
      h.addEventListener('click', () => {
        const grp = h.parentElement;
        const lid = grp.dataset.learner;
        if (state.expandedStudents.has(lid)) state.expandedStudents.delete(lid);
        else state.expandedStudents.add(lid);
        grp.classList.toggle('expanded');
      });
    });
    // 绑定单条报告点击 → 弹只读 modal
    qsa('.student-report-row', wrap).forEach(r => {
      r.addEventListener('click', (e) => {
        e.stopPropagation();
        openStudentReportView(r.dataset.learner, r.dataset.type, r.dataset.id);
      });
    });
  }

  function openStudentReportView(learnerId, type, reportId) {
    const M = window.REPORT_MOCK;
    const s = M.studentReports.find(x => x.learnerId === learnerId);
    if (!s) return;
    let item = null;
    if (type === 'recap')      item = (s.reports.recap || []).find(r => r.id === reportId);
    else if (type === 'practice') item = (s.reports.practice || []).find(r => r.id === reportId);
    else if (type === 'highlight') item = (s.reports.highlights || []).find(r => r.id === reportId);
    if (!item) return;

    const title = type === 'highlight' ? item.title : (item.courseName || stripActPrefix(item.activityName || '') || '报告');
    const dateLine = `<div style="font-size:11px;color:var(--ink-3);margin-bottom:10px">${esc(s.learnerName)} · ${esc(s.role)} · ${esc(item.date)}</div>`;
    let body = '';
    if (type === 'highlight') {
      body = `${dateLine}<blockquote style="margin:0;padding:12px 14px;background:var(--bg-soft);border-left:3px solid var(--accent);border-radius:0 8px 8px 0;font-style:italic">"${esc(item.quote)}"</blockquote>
        <p style="font-size:12px;color:var(--ink-3);margin-top:10px">来源 Activity：${esc(item.activity)}</p>`;
    } else {
      body = `${dateLine}<p style="margin:0;color:var(--ink-1);line-height:1.7">${esc(item.preview)}</p>
        <p style="font-size:12px;color:var(--ink-3);margin-top:10px;padding-top:10px;border-top:1px dashed var(--hairline)">学员侧产出 · 管理端只读 · 可被报告引用</p>`;
    }

    openModal(`
      <div class="modal-head">
        <div class="modal-title">${esc(title)}</div>
        <button class="modal-close" onclick="closeReportModal()">×</button>
      </div>
      <div class="modal-body">${body}</div>
      <div class="modal-footer">
        <button class="btn-ghost" onclick="closeReportModal()">关闭</button>
      </div>
    `);
    // v1.5 P10 #25 · 学员报告 modal 用 wide
    const card = $('modalCard'); if (card) card.classList.add('wide');
  }

  // ============================================================
  // 4. 新建报告 modal（5 字段 · v1.1 加学员选择器）
  // ============================================================
  function openNewReportModal() {
    const M = window.REPORT_MOCK;
    const tmplOpts = M.templates.map(t => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('');
    const totalLearners = (M.learners || []).length;
    openModal(`
      <div class="modal-head">
        <div class="modal-title">+ 新建报告</div>
        <button class="modal-close" onclick="closeReportModal()">×</button>
      </div>
      <div class="modal-body">
        <div class="nr-form-row">
          <label class="nr-form-label">报告名称<span class="req">*</span></label>
          <input class="nr-input" id="nrName" placeholder="例如：W7 项目周报" />
        </div>
        <div class="nr-form-row">
          <label class="nr-form-label">模板选择</label>
          <select class="nr-select" id="nrTemplate">${tmplOpts}</select>
        </div>
        <div class="nr-form-row">
          <label class="nr-form-label">时间周期<span class="req">*</span></label>
          <div style="display:flex;align-items:center;gap:8px">
            <input class="nr-input" id="nrTimeStart" type="date" style="flex:1" />
            <span style="color:var(--ink-3)">至</span>
            <input class="nr-input" id="nrTimeEnd" type="date" style="flex:1" />
            <span class="nr-period-quick" id="nrQuickAll">⚡ 项目至今</span>
          </div>
        </div>
        <div class="nr-form-row">
          <label class="nr-form-label">人员范围<span class="req">*</span></label>
          <div class="nr-radio-row">
            <label class="nr-radio-item"><input type="radio" name="nrScope" value="all" checked /> 全部学员（${totalLearners} 人）</label>
            <label class="nr-radio-item"><input type="radio" name="nrScope" value="select" /> 多选学员名单</label>
          </div>
          <div class="lp-panel" id="lpPanel" style="display:none">
            <div class="lp-search">
              <input type="text" id="lpSearch" placeholder="🔍 搜索学员姓名 / 角色 ..." />
            </div>
            <div class="lp-filter-row" id="lpStatusFilter"></div>
            <div class="lp-filter-row" id="lpStageFilter"></div>
            <div class="lp-list" id="lpList"></div>
            <div class="lp-foot">
              <div class="lp-foot-left">
                <button type="button" class="lp-foot-btn" id="lpAll">全选</button>
                <button type="button" class="lp-foot-btn" id="lpInvert">反选</button>
                <button type="button" class="lp-foot-btn" id="lpClear">清空</button>
              </div>
              <div>已选 <span class="lp-foot-count" id="lpCount">0</span> / ${totalLearners} 人</div>
            </div>
          </div>
        </div>
        <div class="nr-form-row">
          <label class="nr-form-label">报告描述<span class="req">*</span></label>
          <textarea class="nr-textarea" id="nrDesc" placeholder="给 Ora 的写作指令 · 例：聚焦 Course 3 卡点 + 风险学员干预建议"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeReportModal()">取消</button>
        <button class="btn-primary" id="nrSubmit">开始生成</button>
      </div>
    `);

    setTimeout(() => {
      const tmplSel = $('nrTemplate');
      const desc = $('nrDesc');
      const start = $('nrTimeStart');
      const end = $('nrTimeEnd');
      const quick = $('nrQuickAll');
      const lpPanel = $('lpPanel');
      const lpList = $('lpList');
      const lpSearch = $('lpSearch');
      const lpStatusFilter = $('lpStatusFilter');
      const lpStageFilter = $('lpStageFilter');
      const lpCount = $('lpCount');

      // 模板切换 → 自动填描述
      tmplSel.addEventListener('change', () => {
        const t = M.templates.find(x => x.id === tmplSel.value);
        if (t && t.defaultDescription) desc.value = t.defaultDescription;
        else desc.value = '';
      });
      tmplSel.value = 'comprehensive';
      tmplSel.dispatchEvent(new Event('change'));

      // 项目至今 快速填
      const proj = M.project;
      const padDate = (s) => (s || '').replace(/\//g, '-').replace(/-(\d)(?=-|$)/g, '-0$1').replace(/^(\d{4})-(\d)-/, '$1-0$2-');
      quick.addEventListener('click', () => {
        start.value = padDate(proj.startDate || '2026-03-22');
        end.value = '2026-05-07';
      });
      quick.click();

      // -------- 学员选择器面板 --------
      const selectedSet = new Set();
      let activeStatus = 'all';
      let activeStage = null;  // null = 不筛 stage

      // 渲染状态 chip
      const statusChips = (M.learnerFilters && M.learnerFilters.status) || [];
      lpStatusFilter.innerHTML = statusChips.map(c =>
        `<span class="lp-chip ${c.key === 'all' ? 'active' : ''}" data-status="${esc(c.key)}">${esc(c.label)}<span class="lp-chip-count">·${c.count}</span></span>`
      ).join('');
      const stageChips = (M.learnerFilters && M.learnerFilters.stage) || [];
      lpStageFilter.innerHTML = '<span style="color:var(--ink-3);font-size:11px;align-self:center;margin-right:4px">阶段：</span>' + stageChips.map(c =>
        `<span class="lp-chip" data-stage="${esc(c.key)}">${esc(c.label)}<span class="lp-chip-count">·${c.count}</span></span>`
      ).join('');

      // 阶段筛选 chip 与 status chip 双向互斥（任一只能选一个）
      qsa('.lp-chip[data-status]', lpStatusFilter).forEach(ch => {
        ch.addEventListener('click', () => {
          activeStatus = ch.dataset.status;
          activeStage = null;
          qsa('.lp-chip[data-status]').forEach(x => x.classList.toggle('active', x === ch));
          qsa('.lp-chip[data-stage]').forEach(x => x.classList.remove('active'));
          renderLearnerList();
        });
      });
      qsa('.lp-chip[data-stage]', lpStageFilter).forEach(ch => {
        ch.addEventListener('click', () => {
          activeStage = ch.dataset.stage;
          activeStatus = 'all';
          qsa('.lp-chip[data-stage]').forEach(x => x.classList.toggle('active', x === ch));
          qsa('.lp-chip[data-status]').forEach(x => x.classList.toggle('active', x.dataset.status === 'all'));
          renderLearnerList();
        });
      });

      function filterLearners() {
        const q = (lpSearch.value || '').trim().toLowerCase();
        const stageMap = { 'lead': '领先', 'normal': '正常', 'risk': '风险', 'silent': '沉默' };
        return (M.learners || []).filter(l => {
          if (q) {
            if (!(l.name + l.role).toLowerCase().includes(q)) return false;
          }
          if (activeStatus && activeStatus !== 'all') {
            if (l.status !== activeStatus) return false;
          }
          if (activeStage) {
            if (l.stage !== stageMap[activeStage]) return false;
          }
          return true;
        });
      }

      function renderLearnerList() {
        const list = filterLearners();
        if (list.length === 0) {
          lpList.innerHTML = `<div style="text-align:center;padding:20px;color:var(--ink-3);font-size:12px">没有匹配的学员</div>`;
          return;
        }
        lpList.innerHTML = list.map(l => {
          const checked = selectedSet.has(l.id);
          const avCls = l.status === 'silent' ? 'silent' : (l.status === 'risk' ? 'risk' : '');
          const stageKeyMap = { '领先': 'lead', '正常': 'normal', '风险': 'risk', '沉默': 'silent' };
          const stageKey = stageKeyMap[l.stage] || 'normal';
          return `
            <div class="lp-item ${checked ? 'checked' : ''}" data-id="${esc(l.id)}">
              <div class="lp-checkbox"></div>
              <div class="lp-avatar ${avCls}">${esc(l.firstChar)}</div>
              <div class="lp-name-row">
                <span class="lp-name">${esc(l.name)}</span>
                <span class="lp-role">· ${esc(l.role)}</span>
              </div>
              <span class="lp-stage-chip ${stageKey}">${esc(l.stage)}</span>
              <span class="lp-completion">${esc(l.completion)}</span>
            </div>
          `;
        }).join('');
        qsa('.lp-item', lpList).forEach(it => {
          it.addEventListener('click', () => {
            const id = it.dataset.id;
            if (selectedSet.has(id)) selectedSet.delete(id);
            else selectedSet.add(id);
            it.classList.toggle('checked');
            updateCount();
          });
        });
      }
      function updateCount() {
        lpCount.textContent = selectedSet.size;
      }

      lpSearch.addEventListener('input', renderLearnerList);
      $('lpAll').addEventListener('click', () => {
        filterLearners().forEach(l => selectedSet.add(l.id));
        renderLearnerList();
        updateCount();
      });
      $('lpInvert').addEventListener('click', () => {
        filterLearners().forEach(l => {
          if (selectedSet.has(l.id)) selectedSet.delete(l.id);
          else selectedSet.add(l.id);
        });
        renderLearnerList();
        updateCount();
      });
      $('lpClear').addEventListener('click', () => {
        selectedSet.clear();
        renderLearnerList();
        updateCount();
      });

      renderLearnerList();

      // radio 切换 → 显隐选择器
      qsa('input[name="nrScope"]').forEach(r => {
        r.addEventListener('change', () => {
          if (r.value === 'select' && r.checked) {
            lpPanel.style.display = 'block';
          } else if (r.value === 'all' && r.checked) {
            lpPanel.style.display = 'none';
          }
        });
      });

      // 提交
      $('nrSubmit').onclick = () => {
        const name = $('nrName').value.trim() || '未命名报告';
        const tmplId = tmplSel.value;
        const tmpl = M.templates.find(x => x.id === tmplId);
        const scope = qsa('input[name="nrScope"]').find(r => r.checked).value;
        // scope 为 select 但没勾人 → 警告
        if (scope === 'select' && selectedSet.size === 0) {
          showToast('请至少选 1 名学员，或切回"全部学员"');
          return;
        }
        const personCount = scope === 'all' ? totalLearners : selectedSet.size;
        const personScope = scope === 'all' ? '全部学员' : `${selectedSet.size} 人选定`;
        const newId = 'rpt-new-' + Date.now();
        let blocks = null;
        if (tmplId === 'comprehensive') {
          const seed = M.managerReports.find(r => r.id === 'rpt-001');
          blocks = seed ? JSON.parse(JSON.stringify(seed.contentBlocks)) : [];
          blocks[0].text = name;
          if (blocks[1] && blocks[1].type === 'meta') {
            blocks[1].text = `项目周期：${start.value} 至 ${end.value} · 报告范围：${tmpl.name} · ${personScope}（${personCount} 人）`;
          }
        } else {
          // v1.5.2 B-EDITOR-DRAFT · 用 'placeholder' type 渲染斜体灰文 · 不再写 inline span（被 escape）
          blocks = [
            { id: 'nb-h1', type: 'h1', text: name },
            { id: 'nb-meta', type: 'meta', text: `范围：${start.value} 至 ${end.value} · ${personScope}` },
            { id: 'nb-h2-1', type: 'h2', text: '① 关键学员动态' },
            { id: 'nb-p-1', type: 'placeholder', text: '待 Ora 帮你拉数据 · 试着对 Ora 说"加一个关键学员动态表"' },
            { id: 'nb-h2-2', type: 'h2', text: '② Course 完成情况' },
            { id: 'nb-p-2', type: 'placeholder', text: '待 Ora 帮你拉数据 · 试着对 Ora 说"加一个 Course 完成率柱图"' },
            { id: 'nb-h2-3', type: 'h2', text: '③ 6 维画像变化' },
            { id: 'nb-p-3', type: 'placeholder', text: '待 Ora 帮你拉数据' },
            { id: 'nb-h2-4', type: 'h2', text: '④ 下一步建议' },
            { id: 'nb-p-4', type: 'placeholder', text: '待 Ora 帮你写' }
          ];
        }
        const rpt = {
          id: newId, name: name, icon: '📄',
          createdAt: '刚刚', createdAtAbs: new Date().toISOString().slice(0, 16).replace('T', ' '),
          timePeriod: (tmplId === 'comprehensive' ? '项目至今' : `${start.value} 至 ${end.value}`),
          timePeriodRange: `${start.value} 至 ${end.value}`,
          personScope, personCount,
          template: tmpl ? tmpl.name : null,
          modifiedAt: '刚刚',
          contentBlocks: blocks,
          selectedLearnerIds: Array.from(selectedSet)
        };
        M.managerReports.unshift(rpt);
        renderManagerReports();
        closeModal();
        // 启动新建报告生成流程（含 1.5s loading + 流式渲染）
        openReportFromNewSubmit(newId, tmplId, personCount);
      };
    }, 0);
  }

  // ============================================================
  // 5. 编辑器 · contenteditable + 内容渲染
  // ============================================================
  function openReportInEditor(reportId) {
    const M = window.REPORT_MOCK;
    const rpt = (M.managerReports || []).find(r => r.id === reportId);
    if (!rpt) return;
    state.currentReportId = reportId;
    state.midwayAskShown = false;
    state.demoChatStep = 0;                 // v1.5 进 rpt 重置剧本步进
    renderEditorBody(rpt);
    switchView('editor');                   // 触发 updateSubbar 渲染含 title 的 input
    oraClear();
    setTimeout(() => {
      oraStreamAppend('ora', M.reportOra.onEnterEditor.existing);
    }, 300);
    setTimeout(() => {
      oraPushCard('reportRef');
    }, 1100);
  }

  // 新建报告提交后的生成流程（v1.1 · 1.5s loading + Ora 滑入 + 流式渲染 5 块 + 开场卡）
  function openReportFromNewSubmit(reportId, tmplId, personCount) {
    const M = window.REPORT_MOCK;
    const rpt = (M.managerReports || []).find(r => r.id === reportId);
    if (!rpt) return;
    state.currentReportId = reportId;
    state.midwayAskShown = false;
    state.demoChatStep = 0;                 // v1.5 新建报告也重置
    // 先清空编辑器 + 切到 editor view（subbar 同步显示 title）
    $('editorBody').innerHTML = '';
    switchView('editor');
    oraClear();

    // 显示 loading bar
    const loadEl = $('editorLoading');
    const loadText = $('editorLoadingText');
    const loadFill = $('editorLoadingFill');
    loadEl.classList.add('show');
    loadText.textContent = `Ora 正在拉 ${personCount} 名学员的 6 维数据 · 已扫 Activity 89 条 · 生成 5 块初稿...`;
    loadFill.style.width = '0%';
    // 进度条动画
    requestAnimationFrame(() => {
      loadFill.style.transition = 'width 1.4s ease';
      loadFill.style.width = '100%';
    });

    // 1.5s 后 → 隐藏 loading + 流式渲染 5 块
    setTimeout(() => {
      loadEl.classList.remove('show');
      streamRenderBlocks(rpt, () => {
        // 渲染完毕 → Ora 开场（v1.1 时序）
        const openText = (tmplId === 'comprehensive')
          ? M.reportOra.onEnterEditor.newComprehensive
          : M.reportOra.onEnterEditor.newFree;
        oraStreamAppend('ora', openText);
        if (tmplId === 'comprehensive') {
          setTimeout(() => oraPushCard('reportRef'), 800);
        }
      });
    }, 1500);
  }

  // 流式渲染 5 块（每块 200ms）· v1.1 营造"Ora 写初稿"等待感
  function streamRenderBlocks(rpt, done) {
    const body = $('editorBody');
    if (!body) { if (done) done(); return; }
    const M = window.REPORT_MOCK;
    const blocks = rpt.contentBlocks || [];
    body.innerHTML = '';

    let i = 0;
    const tick = () => {
      if (i >= blocks.length) {
        saveCurrentReport();  // v1.3 流式渲染完成后立即保存初稿
        if (done) done();
        return;
      }
      const b = blocks[i++];
      let html = '';
      if (b.type === 'h1') html = `<h1>${esc(b.text)}</h1>`;
      else if (b.type === 'h2') html = `<h2>${esc(b.text)}</h2>`;
      else if (b.type === 'h3') html = `<h3>${esc(b.text)}</h3>`;
      else if (b.type === 'meta') html = `<div class="meta-line" contenteditable="false">${esc(b.text)}</div>`;
      else if (b.type === 'p') html = `<p>${formatInline(b.text)}</p>`;
      // v1.5.2 B-EDITOR-DRAFT · 占位斜体灰文 · 跟 Ora 聊后逐块替换
      else if (b.type === 'placeholder') html = `<p class="editor-placeholder">[ ${esc(b.text)} ]</p>`;
      else if (b.type === 'list') html = `<ul>${(b.items || []).map(it => `<li>${formatInline(it)}</li>`).join('')}</ul>`;
      else if (b.type === 'chart') {
        const data = M.chartData[b.chartId];
        html = renderChartBlock(b.chartId, b.chartType, b.title, data, false);
      }
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      while (tmp.firstChild) body.appendChild(tmp.firstChild);
      // h1/h2 间隔短，p/chart 间隔长
      const delay = (b.type === 'p' || b.type === 'chart' || b.type === 'list') ? 220 : 90;
      setTimeout(tick, delay);
    };
    tick();
  }

  // v1.3 自动保存 · 把当前 editorBody.innerHTML 存回 rpt
  let _saveTimer = null;
  function saveCurrentReport() {
    const M = window.REPORT_MOCK;
    if (!state.currentReportId) return;
    const rpt = (M.managerReports || []).find(r => r.id === state.currentReportId);
    if (!rpt) return;
    const body = $('editorBody');
    if (!body) return;
    rpt.savedHtml = body.innerHTML;
    const titleEl = $('editorTitleInput');
    if (titleEl) rpt.savedTitle = titleEl.value;
    rpt.modifiedAt = '刚刚';
    rpt.savedAt = Date.now();
    // 列表 modifiedAt 显示也要刷新（如果回到 library）
    // 但只在 library view 时才重新渲染
  }
  function debouncedSave() {
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(saveCurrentReport, 600);
  }

  function renderEditorBody(rpt) {
    const body = $('editorBody');
    if (!body) return;
    // v1.3 · 优先使用上次保存的 HTML（中断恢复 · title 由 updateSubbar 从 savedTitle 取）
    if (rpt.savedHtml) {
      body.innerHTML = rpt.savedHtml;
      return;
    }
    const M = window.REPORT_MOCK;
    const blocks = rpt.contentBlocks || [];
    let html = '';
    blocks.forEach(b => {
      if (b.type === 'h1') html += `<h1>${esc(b.text)}</h1>`;
      else if (b.type === 'h2') html += `<h2>${esc(b.text)}</h2>`;
      else if (b.type === 'h3') html += `<h3>${esc(b.text)}</h3>`;
      else if (b.type === 'meta') html += `<div class="meta-line" contenteditable="false">${esc(b.text)}</div>`;
      else if (b.type === 'p') html += `<p>${formatInline(b.text)}</p>`;
      else if (b.type === 'list') html += `<ul>${(b.items || []).map(it => `<li>${formatInline(it)}</li>`).join('')}</ul>`;
      else if (b.type === 'chart') {
        const data = M.chartData[b.chartId];
        html += renderChartBlock(b.chartId, b.chartType, b.title, data, false);
      }
    });
    body.innerHTML = html;
  }

  // 简化的 inline markdown → HTML（**bold** *italic*）
  function formatInline(text) {
    if (!text) return '';
    return esc(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*(?!\*)([^*]+?)\*(?!\*)/g, '$1<em>$2</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  // ============================================================
  // 6. 工具栏（execCommand · WYSIWYG）
  // ============================================================
  function bindToolbar() {
    qsa('.tb-btn[data-cmd]').forEach(btn => {
      btn.addEventListener('mousedown', (e) => e.preventDefault());
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        const arg = btn.dataset.arg || null;
        try {
          if (arg) document.execCommand(cmd, false, arg);
          else document.execCommand(cmd);
          $('editorBody').focus();
          debouncedSave();
        } catch (_) {}
      });
    });
    // 加图表按钮 → B 触发流
    const btnAdd = $('btnAddChart');
    if (btnAdd) btnAdd.addEventListener('click', triggerChartButtonFlow);
    // B8 · 插图按钮 → toast 占位（demo 不接入图片上传）
    const btnImg = $('btnInsertImage');
    if (btnImg) btnImg.addEventListener('click', () => showToast('🖼️ 插图功能 demo 暂未接入 · 实际使用请上传图片文件'));
    // v1.9 · btnExport 由 updateSubbar 动态绑定（subbar 内）

    // 键盘快捷键
    $('editorBody').addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b') { e.preventDefault(); document.execCommand('bold'); debouncedSave(); }
        else if (e.key === 'i') { e.preventDefault(); document.execCommand('italic'); debouncedSave(); }
      }
    });

    // v1.3 自动保存：editorBody input · title input 由 updateSubbar 在每次切到 editor 时重新绑定
    $('editorBody').addEventListener('input', debouncedSave);
  }

  // ============================================================
  // 7. 图表 SVG / DOM 渲染（4 类）
  // ============================================================
  function renderChartBlock(chartId, type, title, data, pending) {
    if (!data) {
      // v1.5 修 bug：占位 div 也要带 data-chart-id · 让 finishChartFill 能找到并替换
      return `<div class="chart-block placeholder pending" data-chart-id="${esc(chartId)}" contenteditable="false">
        <div class="chart-block-title">
          <span>${esc(title || chartTypeLabel(type) + ' · 待填充')}</span>
          <span class="chart-block-title-tag">${chartTypeLabel(type)}</span>
        </div>
        <div style="padding:24px;color:var(--ink-3);font-size:13px;text-align:center">⏳ 图表占位 · 待 Ora 填充数据 ...</div>
      </div>`;
    }
    const inner = renderChartInner(type, data);
    return `
      <div class="chart-block ${pending ? 'pending' : ''}" data-chart-id="${esc(chartId)}" contenteditable="false">
        <div class="chart-block-title">
          <span>${esc(title || data.title || '')}</span>
          <span class="chart-block-title-tag">${chartTypeLabel(type)}</span>
        </div>
        ${inner}
      </div>
    `;
  }
  function chartTypeLabel(t) {
    return ({ 'bar': '柱状图', 'pie': '饼图', 'table': '表格', 'stacked-bar': '堆叠柱图', 'line': '折线图', 'scatter': '散点图' })[t] || t;
  }

  function renderChartInner(type, d) {
    if (type === 'bar') return renderBarChart(d);
    if (type === 'pie') return renderPieChart(d);
    if (type === 'table') return renderTableChart(d);
    if (type === 'stacked-bar') return renderStackedBarChart(d);
    return `<div style="padding:24px;text-align:center;color:var(--ink-3)">${esc(chartTypeLabel(type))} · 暂未演示</div>`;
  }

  function renderBarChart(d) {
    const W = 600, H = 220, padL = 50, padR = 20, padT = 20, padB = 40;
    const labels = d.labels || [];
    const vals = d.values || [];
    const max = d.max || Math.max(...vals, 1);
    const bw = (W - padL - padR) / labels.length * 0.6;
    const gap = (W - padL - padR) / labels.length;
    let bars = '';
    labels.forEach((l, i) => {
      const v = vals[i] || 0;
      const h = (v / max) * (H - padT - padB);
      const x = padL + i * gap + (gap - bw) / 2;
      const y = H - padB - h;
      bars += `<rect x="${x}" y="${y}" width="${bw}" height="${h}" fill="url(#grad-bar)" rx="3"/>`;
      bars += `<text x="${x + bw/2}" y="${y - 6}" font-size="11" fill="var(--ink-1)" text-anchor="middle" font-weight="600">${v}${d.unit || ''}</text>`;
      bars += `<text x="${x + bw/2}" y="${H - padB + 16}" font-size="11" fill="var(--ink-3)" text-anchor="middle">${esc(l)}</text>`;
    });
    // y 轴刻度
    let yAxis = '';
    [0, max/2, max].forEach(v => {
      const y = H - padB - (v / max) * (H - padT - padB);
      yAxis += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="var(--hairline)" stroke-dasharray="2,3"/>`;
      yAxis += `<text x="${padL - 6}" y="${y + 3}" font-size="10" fill="var(--ink-3)" text-anchor="end">${Math.round(v)}${d.unit || ''}</text>`;
    });
    return `
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="grad-bar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="var(--accent-2)" stop-opacity="0.85"/>
          </linearGradient>
        </defs>
        ${yAxis}
        ${bars}
      </svg>
    `;
  }

  function renderPieChart(d) {
    const cx = 110, cy = 110, r = 90;
    const slices = d.slices || [];
    const total = slices.reduce((s, x) => s + x.value, 0) || 1;
    let acc = 0;
    let paths = '';
    slices.forEach(s => {
      const start = acc / total * Math.PI * 2 - Math.PI / 2;
      acc += s.value;
      const end = acc / total * Math.PI * 2 - Math.PI / 2;
      const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
      const large = (end - start) > Math.PI ? 1 : 0;
      paths += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z" fill="${s.color}" stroke="var(--bg-card)" stroke-width="2"/>`;
    });
    let legend = '';
    slices.forEach(s => {
      const pct = ((s.value / total) * 100).toFixed(0);
      legend += `<div style="display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:4px">
        <span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${s.color}"></span>
        <span style="color:var(--ink-1)">${esc(s.label)}</span>
        <span style="color:var(--ink-3);margin-left:auto">${s.value} (${pct}%)</span>
      </div>`;
    });
    return `
      <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap">
        <svg viewBox="0 0 220 220" style="width:200px;height:200px;flex-shrink:0">${paths}<circle cx="${cx}" cy="${cy}" r="40" fill="var(--bg-card)" /><text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="12" fill="var(--ink-3)">总计</text><text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="18" font-weight="700" fill="var(--ink-1)">${total}</text></svg>
        <div style="flex:1;min-width:160px">${legend}</div>
      </div>
    `;
  }

  function renderTableChart(d) {
    const cols = d.columns || [];
    const rows = d.rows || [];
    let head = '<tr>' + cols.map(c => `<th style="text-align:left;font-size:11px;font-weight:600;color:var(--ink-3);padding:8px 10px;border-bottom:1px solid var(--hairline);text-transform:uppercase;letter-spacing:0.05em">${esc(c.label)}</th>`).join('') + '</tr>';
    let body = '';
    rows.forEach(r => {
      body += '<tr>' + cols.map(c => {
        let v = r[c.key];
        let style = 'padding:8px 10px;font-size:12px;color:var(--ink-1);border-bottom:1px solid var(--hairline)';
        if (c.key === 'status') {
          const colorMap = { '领先': 'var(--success)', '正常': 'var(--ink-2)', '风险': 'var(--warn)', '沉默': 'var(--ink-3)' };
          v = `<span style="display:inline-block;padding:2px 8px;border-radius:6px;background:var(--bg-soft);color:${colorMap[v] || 'var(--ink-1)'};font-weight:600;font-size:11px">${esc(v)}</span>`;
        } else if (c.key === 'completion') {
          v = `<strong style="color:var(--accent)">${esc(v)}</strong>`;
        } else {
          v = esc(v);
        }
        return `<td style="${style}">${v}</td>`;
      }).join('') + '</tr>';
    });
    return `<table style="width:100%;border-collapse:collapse;font-size:12px"><thead>${head}</thead><tbody>${body}</tbody></table>`;
  }

  function renderStackedBarChart(d) {
    const W = 600, H = 240, padL = 50, padR = 20, padT = 20, padB = 60;
    const labels = d.labels || [];
    const stacks = d.stacks || [];
    const totals = labels.map((_, i) => stacks.reduce((s, st) => s + (st.values[i] || 0), 0));
    const max = Math.max(...totals, 1);
    const bw = (W - padL - padR) / labels.length * 0.55;
    const gap = (W - padL - padR) / labels.length;
    let bars = '';
    labels.forEach((l, i) => {
      const x = padL + i * gap + (gap - bw) / 2;
      let yAcc = H - padB;
      stacks.forEach(st => {
        const v = st.values[i] || 0;
        const h = (v / max) * (H - padT - padB);
        bars += `<rect x="${x}" y="${yAcc - h}" width="${bw}" height="${h}" fill="${st.color}" opacity="0.92"/>`;
        if (h > 16) bars += `<text x="${x + bw/2}" y="${yAcc - h/2 + 3}" font-size="10" fill="#fff" text-anchor="middle" font-weight="600">${v}h</text>`;
        yAcc -= h;
      });
      bars += `<text x="${x + bw/2}" y="${H - padB + 16}" font-size="11" fill="var(--ink-3)" text-anchor="middle">${esc(l)}</text>`;
      bars += `<text x="${x + bw/2}" y="${H - padB - (totals[i]/max)*(H-padT-padB) - 6}" font-size="11" fill="var(--ink-1)" text-anchor="middle" font-weight="700">${totals[i]}h</text>`;
    });
    // y 轴
    let yAxis = '';
    [0, max/2, max].forEach(v => {
      const y = H - padB - (v / max) * (H - padT - padB);
      yAxis += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="var(--hairline)" stroke-dasharray="2,3"/>`;
      yAxis += `<text x="${padL - 6}" y="${y + 3}" font-size="10" fill="var(--ink-3)" text-anchor="end">${Math.round(v)}h</text>`;
    });
    // legend
    let legend = '<g>';
    stacks.forEach((st, i) => {
      const x = padL + i * 100;
      const y = H - 16;
      legend += `<rect x="${x}" y="${y - 8}" width="10" height="10" fill="${st.color}"/>`;
      legend += `<text x="${x + 14}" y="${y}" font-size="11" fill="var(--ink-2)">${esc(st.label)}</text>`;
    });
    legend += '</g>';
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" preserveAspectRatio="xMidYMid meet">${yAxis}${bars}${legend}</svg>`;
  }

  // ============================================================
  // 8. Ora chat
  // ============================================================
  function oraClear() {
    const s = $('oraStream');
    if (s) s.innerHTML = '';
  }

  function oraStreamAppend(role, text, opts) {
    const s = $('oraStream');
    if (!s) return null;
    const div = document.createElement('div');
    div.className = 'ora-msg ' + (role || 'ora');
    const M = window.REPORT_MOCK;
    // v1.5 FIX-#29 · Ora avatar 字符接 BRANDING.oraName 首字（'Ora'→'O' / '老崔'→'老'）
    const _oraName = (window.BRANDING && window.BRANDING.oraName) || 'Ora';
    const av = role === 'user' ? ((M && M.manager && M.manager.firstChar) || '王') : _oraName.charAt(0);
    // C2 · Ora 消息加三按钮反馈（与 hall/lecture/practice/recap/mgthome 一致）· user 消息无
    const actionsHTML = (role !== 'user') ? `<div class="msg-actions"><button class="msg-action" data-vote="up" title="点赞"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg></button><button class="msg-action" data-vote="down" title="点踩"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zM17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg></button><button class="msg-action" data-act="comment" title="评论"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></button></div>` : '';
    div.innerHTML = `
      <div class="ora-msg-avatar">${esc(av)}</div>
      <div class="ora-msg-bubble">${esc(text || '')}${actionsHTML}</div>
    `;
    s.appendChild(div);
    s.scrollTop = s.scrollHeight;
    return div;
  }

  // v1.4 · 4 类卡片渲染重做（沿用 mgthome · askq 用 popup / 3 类卡用 neo-card）
  function oraPushCard(kind) {
    const M = window.REPORT_MOCK;
    const cards = M.reportOra.oraCards || {};
    const c = cards[kind];
    if (!c) return;

    // askUserQuestion 不在 stream 里推 · 改用 popup 形态
    if (kind === 'askQuestion') {
      openAskq({ question: c.question, options: c.options || [], onAnswer: handleAskAnswerImpl });
      return;
    }

    const s = $('oraStream');
    if (!s) return;
    const wrap = document.createElement('div');
    wrap.className = 'ora-msg ora';

    if (kind === 'evidence') {
      wrap.innerHTML = `
        <div class="ora-msg-avatar">${((window.BRANDING && window.BRANDING.oraName) || 'Ora').charAt(0)}</div>
        <div class="neo-card">
          <span class="neo-card-tag" style="background:rgba(74,124,157,0.14);color:var(--info)">证据卡片</span>
          <div class="neo-card-title">${esc(c.title)}</div>
          <div class="neo-card-body">${esc(c.body)}</div>
          <div class="neo-card-actions">
            <button class="neo-card-btn primary" onclick="window.openEvidenceDetail('${esc(c.memoryRef || '')}')">查看完整对话</button>
          </div>
        </div>
      `;
    } else if (kind === 'reportRef') {
      wrap.innerHTML = `
        <div class="ora-msg-avatar">${((window.BRANDING && window.BRANDING.oraName) || 'Ora').charAt(0)}</div>
        <div class="neo-card">
          <span class="neo-card-tag" style="background:rgba(168,139,250,0.14);color:#A78BFA">报告引用</span>
          <div class="neo-card-title">${esc(c.title)}</div>
          <div class="neo-card-body">${esc(c.body)}</div>
          <div class="neo-card-actions">
            <button class="neo-card-btn primary" onclick="window.openRptByIdFromCard('${esc(c.targetReportId)}')">${esc(c.cta || '打开报告')}</button>
          </div>
        </div>
      `;
    } else if (kind === 'learnerSnapshot') {
      wrap.innerHTML = `
        <div class="ora-msg-avatar">${((window.BRANDING && window.BRANDING.oraName) || 'Ora').charAt(0)}</div>
        <div class="neo-card">
          <span class="neo-card-tag" style="background:rgba(34,211,238,0.14);color:var(--info)">学员快照</span>
          <div class="neo-card-title">${esc(c.title)}</div>
          <div class="neo-card-body">${esc(c.body)}</div>
          <div class="neo-card-actions">
            <button class="neo-card-btn primary" onclick="window.openLearnerSnapshot('${esc(c.targetLearnerId || '')}')">${esc(c.cta || '展开个体详情')}</button>
          </div>
        </div>
      `;
    }
    s.appendChild(wrap);
    s.scrollTop = s.scrollHeight;
  }

  // ============================================================
  // askUserQuestion popup 控制（沿用 mgthome openAskq · v1.4 加）
  // ============================================================
  let _askqState = { open: false, options: [], onAnswer: null };
  function openAskq({ question, options, onAnswer }) {
    _askqState.open = true;
    _askqState.options = options || [];
    _askqState.onAnswer = onAnswer;
    $('askqQuestion').textContent = question;
    const optsEl = $('askqOptions');
    optsEl.innerHTML = (options || []).map((o, i) => `
      <button class="askq-option" data-idx="${i}">
        <span class="askq-num">${i + 1}</span>
        <span>${esc(o)}</span>
      </button>
    `).join('');
    qsa('.askq-option', optsEl).forEach(b => {
      b.addEventListener('click', () => {
        const idx = parseInt(b.dataset.idx, 10);
        const ans = _askqState.options[idx];
        closeAskq();
        if (typeof _askqState.onAnswer === 'function') _askqState.onAnswer(ans);
      });
    });
    $('askqPopup').classList.add('open');
  }
  function closeAskq() {
    _askqState.open = false;
    const p = $('askqPopup');
    if (p) p.classList.remove('open');
  }

  // 点击 evidence / snapshot 卡的 CTA · demo 占位
  window.openEvidenceDetail = function(memRef) {
    showToast('打开证据详情 · ' + (memRef || '(无 memory_id)') + ' · demo 占位');
  };
  window.openLearnerSnapshot = function(learnerId) {
    showToast('展开学员个体详情面板 · ' + (learnerId || '') + ' · demo 占位');
  };

  function handleAskAnswerImpl(ans) {
    const M = window.REPORT_MOCK;
    oraStreamAppend('user', ans);
    // v1.5 中段决策卡 4 选项 · 直接对应 demo 动作
    if (ans === '② 块加点 Course 3 证据') {
      const mod = (M.reportOra.chatModifyTriggers || [])[0];
      setTimeout(() => {
        oraStreamAppend('ora', mod.replyText);
        startInlineDiff(mod);
      }, 500);
    } else if (ans === '② 块开场段缩短') {
      const mod = (M.reportOra.chatModifyTriggers || [])[1];
      setTimeout(() => {
        oraStreamAppend('ora', mod.replyText);
        startInlineDiff(mod);
      }, 500);
    } else if (ans === '引用田静 Course 1 recap') {
      const ref = (M.reportOra.crossTabReference || [])[0];
      setTimeout(() => {
        oraStreamAppend('ora', ref.replyText);
        insertCrossQuoteAtCursor(ref.sourceLabel, ref.quoteText);
      }, 500);
    } else if (ans === '继续到 ⑤ 块写清单') {
      const vibe = (M.reportOra.vibeWritingTriggers || []).find(t => t.type === 'list');
      setTimeout(() => oraStreamAppend('ora', vibe.replyText), 500);
      setTimeout(() => insertListUnderH2('⑤ 关键发现与建议', vibe.listItems), 700);
    } else {
      setTimeout(() => oraStreamAppend('ora', `好 · 我先按"${ans}"展开。`), 500);
    }
  };

  function scrollToHeading(text) {
    const all = qsa('#editorBody h1, #editorBody h2, #editorBody h3');
    const found = all.find(h => h.textContent.trim().includes(text));
    if (found) {
      found.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // flash 高亮
      found.style.transition = 'background 0.25s ease';
      const orig = found.style.background;
      found.style.background = 'rgba(217,119,87,0.18)';
      setTimeout(() => { found.style.background = orig; }, 1200);
    }
  }

  function autoSelectFirstParaUnderH2(text) {
    const all = qsa('#editorBody h2');
    const h2 = all.find(h => h.textContent.trim().includes(text));
    if (!h2) return;
    let p = h2.nextElementSibling;
    while (p && p.tagName !== 'P') p = p.nextElementSibling;
    if (!p) return;
    const range = document.createRange();
    range.selectNodeContents(p);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    state.selRange = range.cloneRange();
    // 触发划词 popover
    const pop = $('selPopover');
    if (pop) {
      const rect = range.getBoundingClientRect();
      pop.style.left = (rect.left + rect.width / 2 - 84) + 'px';
      pop.style.top = (rect.top - 44) + 'px';
      pop.classList.add('open');
    }
  }

  window.openRptByIdFromCard = function(id) {
    if (id) openReportInEditor(id);
  };

  // Ora chat 用户输入处理
  function bindOraChat() {
    const inp = $('oraInput');
    const send = $('oraSend');
    if (!inp || !send) return;

    function fire() {
      const text = inp.value.trim();
      if (!text) return;
      oraStreamAppend('user', text);
      inp.value = '';
      handleOraInput(text);
    }
    send.addEventListener('click', fire);
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); fire(); }
    });
    // C2 · Ora 消息三按钮反馈委托（与 practice 一致）
    $('oraStream').addEventListener('click', e => {
      const voteBtn = e.target.closest('.msg-action[data-vote]');
      if (voteBtn) {
        const vote = voteBtn.dataset.vote;
        const actions = voteBtn.parentElement;
        const wasActive = voteBtn.classList.contains('active');
        actions.querySelectorAll('.msg-action[data-vote]').forEach(b => b.classList.remove('active'));
        if (!wasActive) {
          voteBtn.classList.add('active');
          showToast(vote === 'up' ? '👍 已记录有用' : '👎 已记录待改进', 1500);
        }
        return;
      }
      const cmtBtn = e.target.closest('.msg-action[data-act="comment"]');
      if (cmtBtn) {
        cmtBtn.classList.toggle('active');
        showToast('💬 评论功能 demo 暂未接入', 1500);
      }
    });
  }

  // v1.5 · chat 任意输入按 demoChatStep 走剧本（去关键词识别）
  // 例外：划词后 chat 输入 = 划词自定义指令（替换选区 / 沿用 v1.4）
  function handleOraInput(text) {
    const M = window.REPORT_MOCK;

    // v1.6 diff 保护：当前有未处理的 diff → 阻塞 chat + 提示
    if (state.diffPending) {
      setTimeout(() => {
        oraStreamAppend('ora', '⏸ 等你处理完上面的修改 · 点 ✓ 接受 / ✗ 拒绝 · 之后我们再继续。');
        // 滚到 diff 位置
        const diff = qs('#editorBody .diff-block');
        if (diff) {
          diff.scrollIntoView({ behavior: 'smooth', block: 'center' });
          diff.style.transition = 'box-shadow 0.3s ease';
          const orig = diff.style.boxShadow;
          diff.style.boxShadow = '0 0 0 6px rgba(var(--accent-rgb),0.30), 0 8px 24px rgba(var(--accent-rgb),0.20)';
          setTimeout(() => { diff.style.boxShadow = orig; }, 1500);
        }
      }, 400);
      return;
    }

    // 划词后自定义指令优先（用户先划词再输入 = 替换选区）
    if (state.selRange && state.selRange.toString().length > 0) {
      setTimeout(() => {
        const r = M.reportOra.selectionCustomDefault;
        oraStreamAppend('ora', r.replyText);
        replaceSelectedRangeWith(r.replacementText);
        oraPushCard('evidence');
      }, 700);
      return;
    }

    // 否则：按剧本推进
    dispatchDemoStep(text);
  }

  // demo 主路径剧本（不依赖关键词 · 任意输入推进下一步）
  function dispatchDemoStep(userText) {
    const M = window.REPORT_MOCK;
    const step = state.demoChatStep || 0;
    state.demoChatStep = step + 1;

    if (step === 0) {
      // Step A · 加 ② 块关键学员动态表 + 学员快照卡 + askq 中段决策卡
      setTimeout(() => {
        oraStreamAppend('ora', '我从你说的"' + userText.slice(0, 12) + (userText.length > 12 ? '...' : '') + '"理解到 · 我先帮你 ② 块加一个关键学员动态表 · 7 行（领先 / 正常 / 风险 / 沉默 4 类）· 数据已就绪。');
        const t = M.chartData.table_keyLearners;
        insertChartUnderH2('② 学员分布与动态', 'table', t.title, 'table_keyLearners', t);
      }, 600);
      setTimeout(() => oraPushCard('learnerSnapshot'), 1700);
      setTimeout(() => {
        if (!state.midwayAskShown) {
          oraPushCard('askQuestion');
          state.midwayAskShown = true;
        }
      }, 2600);
      return;
    }

    if (step === 1) {
      // Step B · vibe 写 ⑤ 块 5 条建议清单
      const vibeList = (M.reportOra.vibeWritingTriggers || []).find(t => t.type === 'list');
      if (!vibeList) { fallbackReply(); return; }
      setTimeout(() => {
        oraStreamAppend('ora', vibeList.replyText);
        insertListUnderH2('⑤ 关键发现与建议', vibeList.listItems);
      }, 600);
      return;
    }

    if (step === 2) {
      // Step C · 跨 Tab 引用张三 Course 1 recap
      const ref = (M.reportOra.crossTabReference || [])[0];
      if (!ref) { fallbackReply(); return; }
      setTimeout(() => {
        oraStreamAppend('ora', ref.replyText);
        insertCrossQuoteAtCursor(ref.sourceLabel, ref.quoteText);
      }, 600);
      return;
    }

    if (step === 3) {
      // Step D · diff 改 ② 块加 Course 3 证据
      const mod = (M.reportOra.chatModifyTriggers || [])[0];
      if (!mod) { fallbackReply(); return; }
      setTimeout(() => {
        oraStreamAppend('ora', mod.replyText);
        startInlineDiff(mod);
      }, 600);
      return;
    }

    if (step === 4) {
      // Step E · diff 改 ② 块缩短
      const mod = (M.reportOra.chatModifyTriggers || [])[1];
      if (!mod) { fallbackReply(); return; }
      setTimeout(() => {
        oraStreamAppend('ora', mod.replyText);
        startInlineDiff(mod);
      }, 600);
      return;
    }

    // step >= 5 · fallback
    setTimeout(() => oraStreamAppend('ora', '主路径已演完 · 你还可以试：① 工具栏「📊 加图表」走 askq 多轮 · ② 选中编辑器中文本 → 划词菜单 · ③ 工具栏 [导出] · ④ 返回报告库重选其他报告。'), 600);
  }

  function fallbackReply() {
    const M = window.REPORT_MOCK;
    setTimeout(() => oraStreamAppend('ora', M.reportOra.fallbackResponse || '我没听懂这个 · 试试其他指令。'), 500);
  }

  // v1.5 把图表插到指定 H2 下方（A 触发 chat 加图自动定位）
  function insertChartUnderH2(h2Text, chartType, title, dataKey, data) {
    const all = qsa('#editorBody h2');
    const h2 = all.find(h => h.textContent.trim().includes(h2Text));
    if (!h2) {
      insertChartAtCursor(chartType, title, dataKey, data, false);
      return;
    }
    state.chartCounter++;
    const cid = (dataKey || 'chart') + '-' + state.chartCounter;
    const html = renderChartBlock(cid, chartType, title, data, false);
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const node = tmp.firstElementChild;
    // 找 H2 之后的下一个段或图位置插入（在第一个 chart-block 之前 / 否则 h2 后）
    let after = h2;
    let cur = h2.nextElementSibling;
    while (cur && cur.tagName !== 'H1' && cur.tagName !== 'H2') {
      if (cur.tagName === 'P') after = cur;
      else if (cur.classList && cur.classList.contains('chart-block')) {
        // 已经有图表 · 插到该图表之后
        after = cur;
        break;
      }
      cur = cur.nextElementSibling;
    }
    after.parentNode.insertBefore(node, after.nextSibling);
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    debouncedSave();
  }

  // ============================================================
  // 9. 在编辑器光标位置插入内容
  // ============================================================
  function getEditorRangeOrEnd() {
    const body = $('editorBody');
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      if (body.contains(r.commonAncestorContainer)) return r;
    }
    // fallback：插入到末尾
    const r = document.createRange();
    r.selectNodeContents(body);
    r.collapse(false);
    return r;
  }

  function insertHtmlAtCursor(html) {
    const body = $('editorBody');
    body.focus();
    const r = getEditorRangeOrEnd();
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const frag = document.createDocumentFragment();
    let last = null;
    const inserted = [];
    while (tmp.firstChild) { last = tmp.firstChild; inserted.push(last); frag.appendChild(last); }
    r.deleteContents();
    r.insertNode(frag);
    if (last) {
      const newR = document.createRange();
      newR.setStartAfter(last);
      newR.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(newR);
    }
    debouncedSave();  // v1.3 各类程序化插入后保存
    // v1.5 P11 #33 · Ora 写入新增内容 · flash highlight + toast 提示（轻量 diff 替代品）
    inserted.forEach(node => {
      if (node.nodeType !== 1) return;
      node.classList.add('ora-insert-flash');
      setTimeout(() => node.classList.remove('ora-insert-flash'), 1800);
    });
    if (inserted.some(n => n.nodeType === 1)) {
      showToast('Ora 已写入新增内容 · 可手动调整或 Ctrl+Z 撤销', 2400);
    }
  }

  function insertChartAtCursor(type, title, dataKey, data, pending) {
    state.chartCounter++;
    const cid = (dataKey || 'chart') + '-' + state.chartCounter;
    const html = renderChartBlock(cid, type, title, data, pending);
    insertHtmlAtCursor(html);
    return cid;
  }

  function insertParagraphAtCursor(text) {
    insertHtmlAtCursor(`<p>${formatInline(text)}</p>`);
  }

  function insertListAtCursor(items) {
    const html = `<ul>${(items || []).map(it => `<li>${formatInline(it)}</li>`).join('')}</ul>`;
    insertHtmlAtCursor(html);
  }

  // v1.2 · 把 list 插入到指定 H2 的下一段位置（"⑤ 块"流式追加）
  function insertListUnderH2(h2Text, items) {
    const all = qsa('#editorBody h2');
    const h2 = all.find(h => h.textContent.trim().includes(h2Text));
    if (!h2) {
      insertListAtCursor(items);
      return;
    }
    const ul = document.createElement('ul');
    ul.innerHTML = (items || []).map(it => `<li>${formatInline(it)}</li>`).join('');
    let oldUl = null;
    // 找 h2 之后到下一个 h1/h2 之间，是否已有 ul
    let cur = h2.nextElementSibling;
    while (cur && cur.tagName !== 'H1' && cur.tagName !== 'H2') {
      if (cur.tagName === 'UL') { oldUl = cur; break; }
      cur = cur.nextElementSibling;
    }
    if (oldUl) {
      // 已有 ul · dataset 存旧的，直接替换为新 ul
      ul.dataset.oldHtml = oldUl.outerHTML;
      oldUl.replaceWith(ul);
    } else {
      // 没有 ul → 插到 h2 之后第一个 p 之后
      let after = h2;
      let next = h2.nextElementSibling;
      if (next && next.tagName === 'P') after = next;
      after.parentNode.insertBefore(ul, after.nextSibling);
      ul.dataset.oldHtml = '';  // 没旧版 → 拒绝时直接删
    }
    // v2.1 加 .diff-pending 高亮 + 浮 ✓✗（vibe 生成内容也需用户确认）
    ul.classList.add('diff-pending');
    ul.style.position = 'relative';
    state.diffPending = true;
    const btns = document.createElement('span');
    btns.className = 'diff-actions-floating';
    btns.setAttribute('contenteditable', 'false');
    btns.innerHTML = `
      <button class="diff-btn reject" title="拒绝">✗</button>
      <button class="diff-btn accept" title="接受">✓</button>
    `;
    ul.appendChild(btns);
    ul.scrollIntoView({ behavior: 'smooth', block: 'center' });

    btns.querySelector('.diff-btn.accept').addEventListener('click', (e) => {
      e.stopPropagation();
      btns.remove();
      ul.classList.remove('diff-pending');
      ul.style.position = '';
      delete ul.dataset.oldHtml;
      saveCurrentReport();
      state.diffPending = false;
      oraStreamAppend('ora', '✓ 已接受清单 · 我已经把 5 条建议写入到 ⑤ 块。');
    });
    btns.querySelector('.diff-btn.reject').addEventListener('click', (e) => {
      e.stopPropagation();
      const oldHtml = ul.dataset.oldHtml || '';
      if (oldHtml) {
        const tmp = document.createElement('div');
        tmp.innerHTML = oldHtml;
        ul.replaceWith(tmp.firstElementChild);
      } else {
        ul.remove();
      }
      saveCurrentReport();
      state.diffPending = false;
      oraStreamAppend('ora', '✗ 好 · 我撤回这次清单 · ⑤ 块恢复原样。');
    });
  }

  // v2.0 inline diff · 暂时高亮 + 浮 ✓✗（直接换内容 · 高亮表示未确认 · 接受高亮消失 · 拒绝还原旧）
  function startInlineDiff(modify) {
    const all = qsa('#editorBody p');
    const target = all.find(p => p.textContent.includes(modify.matchPrefix));
    if (!target) {
      setTimeout(() => oraStreamAppend('ora', '没找到目标段 · 试试换个说法（如"② 块加证据"或"② 块缩短"）。'), 400);
      return;
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 1. 暂存旧 html 到 dataset
    const oldHtml = target.innerHTML;
    target.dataset.oldHtml = oldHtml;
    // 2. 直接换新内容
    target.innerHTML = formatInline(modify.newHtml);
    // 3. 加临时高亮
    target.classList.add('diff-pending');
    state.diffPending = true;

    // 4. 浮动 ✓✗ 容器（用 span 内联放进 p，contenteditable=false 不参与编辑）
    const btns = document.createElement('span');
    btns.className = 'diff-actions-floating';
    btns.setAttribute('contenteditable', 'false');
    btns.innerHTML = `
      <button class="diff-btn reject" title="拒绝">✗</button>
      <button class="diff-btn accept" title="接受">✓</button>
    `;
    target.appendChild(btns);

    btns.querySelector('.diff-btn.accept').addEventListener('click', (e) => {
      e.stopPropagation();
      btns.remove();
      target.classList.remove('diff-pending');
      delete target.dataset.oldHtml;
      saveCurrentReport();
      state.diffPending = false;
      oraStreamAppend('ora', '✓ 已接受修改 · 我已经把这一段更新到报告里。');
    });
    btns.querySelector('.diff-btn.reject').addEventListener('click', (e) => {
      e.stopPropagation();
      target.innerHTML = target.dataset.oldHtml || oldHtml;
      target.classList.remove('diff-pending');
      delete target.dataset.oldHtml;
      saveCurrentReport();
      state.diffPending = false;
      oraStreamAppend('ora', '✗ 好 · 我撤回这次修改 · 原内容保留。');
    });
  }

  function insertCrossQuoteAtCursor(source, quote) {
    insertHtmlAtCursor(`
      <blockquote class="cross-quote" contenteditable="false">
        <div class="cross-quote-source">📎 引自：${esc(source)}</div>
        <div>"${esc(quote)}"</div>
      </blockquote>
      <p><br></p>
    `);
  }

  function replaceSelectedRangeWith(text) {
    if (!state.selRange) return;
    const r = state.selRange;
    r.deleteContents();
    const node = document.createTextNode(text);
    r.insertNode(node);
    const newR = document.createRange();
    newR.setStartAfter(node);
    newR.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(newR);
    state.selRange = null;
    debouncedSave();  // v1.3 划词替换后保存
  }

  // ============================================================
  // 10. B 触发 · 加图表按钮 → 类型选择 → askUserQuestion 多轮 → 填充
  // ============================================================
  // v1.4 阶段 B · B 触发图表 = askq-popup 多轮（不弹 modal）
  function triggerChartButtonFlow() {
    oraStreamAppend('ora', '加图表 · 我帮你逐项确认。');
    setTimeout(() => askChartTypePopup(), 400);
  }

  function askChartTypePopup() {
    const TYPE_MAP = { '柱状图': 'bar', '饼图': 'pie', '表格': 'table', '堆叠柱图': 'stacked-bar' };
    openAskq({
      question: '你想加什么类型的图表？',
      options: ['柱状图', '饼图', '表格', '堆叠柱图', '折线图（demo 不演）', '散点图（demo 不演）'],
      onAnswer: (ans) => {
        oraStreamAppend('user', ans);
        const type = TYPE_MAP[ans];
        if (!type) {
          setTimeout(() => oraStreamAppend('ora', ans + ' · demo 不演 · 试试柱状图 / 饼图 / 表格 / 堆叠柱图。'), 500);
          return;
        }
        setTimeout(() => startChartButtonAskFlow(type), 500);
      }
    });
  }

  function startChartButtonAskFlow(type) {
    const M = window.REPORT_MOCK;
    // 插入占位（让用户看到位置）
    const cid = insertChartAtCursor(type, chartTypeLabel(type) + '（待 Ora 填充）', null, null, true);
    state.pendingChart = cid;
    state.chartAskQueue = (M.reportOra.chartButtonFlow[type] || []).slice();
    setTimeout(() => {
      oraStreamAppend('ora', '占位图已插入到光标位置 · 再确认 ' + state.chartAskQueue.length + ' 个细节。');
      askNextChartQuestion(type);
    }, 400);
  }

  function askNextChartQuestion(type) {
    if (state.chartAskQueue.length === 0) {
      finishChartFill(type);
      return;
    }
    const q = state.chartAskQueue.shift();
    openAskq({
      question: q.question,
      options: q.options,
      onAnswer: (ans) => {
        oraStreamAppend('user', ans);
        setTimeout(() => askNextChartQuestion(type), 500);
      }
    });
  }

  function finishChartFill(type) {
    const M = window.REPORT_MOCK;
    const dataKeyMap = {
      'bar': 'bar_courseCompletion',
      'pie': 'pie_learnerStatus',
      'table': 'table_keyLearners',
      'stacked-bar': 'stackedBar_timeDistribution'
    };
    const dataKey = dataKeyMap[type];
    const data = M.chartData[dataKey];
    setTimeout(() => oraStreamAppend('ora', '收到 · 数据已就绪 · 正在填充占位图。'), 400);
    setTimeout(() => {
      // 找到 pending chart-block 替换为实图
      const ph = qs(`.chart-block[data-chart-id="${state.pendingChart}"]`);
      if (ph) {
        const newHtml = renderChartBlock(state.pendingChart, type, data.title, data, false);
        const tmp = document.createElement('div');
        tmp.innerHTML = newHtml;
        ph.replaceWith(tmp.firstElementChild);
      }
      state.pendingChart = null;
    }, 1200);
  }

  // ============================================================
  // 11. 划词修改 popover · selection menu
  // ============================================================
  function bindSelectionPopover() {
    const body = $('editorBody');
    const pop = $('selPopover');
    if (!body || !pop) return;

    function check() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        pop.classList.remove('open');
        return;
      }
      const r = sel.getRangeAt(0);
      if (!body.contains(r.commonAncestorContainer)) {
        pop.classList.remove('open');
        return;
      }
      // 保存
      state.selRange = r.cloneRange();
      const rect = r.getBoundingClientRect();
      pop.style.left = (rect.left + rect.width / 2 - 84) + 'px';
      pop.style.top = (rect.top - 44) + 'px';
      pop.classList.add('open');
    }

    body.addEventListener('mouseup', () => setTimeout(check, 0));
    body.addEventListener('keyup', () => setTimeout(check, 0));
    document.addEventListener('selectionchange', () => {
      // 没在 editor 里就关
      const sel = window.getSelection();
      if (!sel || !sel.anchorNode) { pop.classList.remove('open'); return; }
      if (!body.contains(sel.anchorNode)) { pop.classList.remove('open'); state.selRange = null; }
    });
    qsa('.sel-popover-btn').forEach(b => {
      b.addEventListener('mousedown', (e) => e.preventDefault());
      b.addEventListener('click', () => {
        const a = b.dataset.action;
        pop.classList.remove('open');
        handleSelectionAction(a);
      });
    });
  }

  function handleSelectionAction(a) {
    const M = window.REPORT_MOCK;
    const txt = state.selRange ? state.selRange.toString() : '';
    if (!txt) { showToast('未检测到选中文本'); return; }
    oraStreamAppend('user', `（划词 ${a === 'expand' ? '扩写' : a === 'shorten' ? '缩写' : '自定义'}）"${txt.slice(0, 40)}${txt.length > 40 ? '...' : ''}"`);
    if (a === 'expand') {
      setTimeout(() => {
        oraStreamAppend('ora', M.reportOra.selectionExpand.replyText);
        replaceSelectedRangeWith(M.reportOra.selectionExpand.replacementText);
        oraPushCard('evidence');
      }, 600);
    } else if (a === 'shorten') {
      setTimeout(() => {
        oraStreamAppend('ora', M.reportOra.selectionShorten.replyText);
        replaceSelectedRangeWith(M.reportOra.selectionShorten.replacementText);
      }, 600);
    } else if (a === 'custom') {
      setTimeout(() => {
        oraStreamAppend('ora', '已定位你选中的内容 · 在下方输入指令（例：改成更专业的语气）');
        $('oraInput').focus();
      }, 400);
    }
  }

  // ============================================================
  // 12. 搜索 / Tab 切换 / 顶层事件绑定
  // ============================================================
  function bindLibraryTopEvents() {
    qsa('.lib-tab').forEach(t => {
      t.addEventListener('click', () => switchTab(t.dataset.tab));
    });
    $('libSearchInput').addEventListener('input', (e) => {
      const v = e.target.value.trim();
      if (state.tab === 'manager') renderManagerReports(v);
      else renderStudentReports(v);
    });
    // v1.9 · btnNewReport / btnBackToLib / btnExport 由 updateSubbar 动态生成 + 绑定
  }

  // ============================================================
  // v1.7 mgthome 复用：bell 消息中心 + avatar dropdown + settings drawer + ora 附加
  // ============================================================
  function renderMessages() {
    const M = window.REPORT_MOCK;
    const list = $('msgList');
    if (!list) return;
    // v1.4 · bell 接 _shared/messages.js + filterMessagesByRole(admin) + MessagesRead 跨页同步
    const messages = (typeof window.filterMessagesByRole === 'function')
      ? window.filterMessagesByRole('admin')
      : (M.messages || []);
    const isUnread = m => (typeof MessagesRead !== 'undefined') ? !MessagesRead.isRead(m) : !!m.unread;
    list.innerHTML = messages.map((m, i) => {
      const cls = m.type === 'platform' ? 'platform' : (m.type === 'system' ? 'system' : 'user');
      const bg = m.type === 'platform' ? 'var(--accent-soft)' : (m.type === 'system' ? 'rgba(74,124,157,0.12)' : getGradFor(m.sender || ''));
      return `
        <div class="msg-row ${isUnread(m) ? 'unread' : ''}" data-i="${i}">
          <div class="msg-avatar-wrap ${cls}" style="background:${bg}">
            <span>${esc(m.avatarChar || m.sender?.[0] || '?')}</span>
          </div>
          <div class="msg-content">
            <div class="msg-sender">${esc(m.sender)}</div>
            <div class="msg-head">
              <span class="msg-text">${esc(m.title)}</span>
              ${isUnread(m) ? '<span class="msg-dot-unread"></span>' : ''}
            </div>
            <div class="msg-desc">${esc(m.desc)}</div>
            <div class="msg-time">${esc(m.time)}</div>
          </div>
        </div>
      `;
    }).join('');
    // 更新 badge · 接 MessagesRead.unreadCount('admin')
    const unread = (typeof MessagesRead !== 'undefined')
      ? MessagesRead.unreadCount('admin')
      : messages.filter(m => m.unread).length;
    const badge = $('bellBadge');
    if (badge) {
      if (unread > 0) { badge.textContent = unread; badge.style.display = ''; }
      else { badge.style.display = 'none'; }
    }
    // 行点击展开 + 标记已读 · 接 MessagesRead.markRead
    qsa('.msg-row[data-i]', list).forEach(row => {
      row.addEventListener('click', () => {
        qsa('.msg-row.expanded', list).forEach(r => { if (r !== row) r.classList.remove('expanded'); });
        row.classList.toggle('expanded');
        const m = messages[+row.dataset.i];
        if (m && isUnread(m)) {
          if (typeof MessagesRead !== 'undefined') MessagesRead.markRead(m);
          else m.unread = false;
          renderMessages();   // 重渲染 · 全局 unread state 同步
        }
      });
    });
  }
  function renderMessagesBadge() {
    const unread = (typeof MessagesRead !== 'undefined')
      ? MessagesRead.unreadCount('admin')
      : ((window.REPORT_MOCK?.messages) || []).filter(m => m.unread).length;
    const badge = $('bellBadge');
    if (badge) {
      if (unread > 0) { badge.textContent = unread; badge.style.display = ''; }
      else { badge.style.display = 'none'; }
    }
  }
  function getGradFor(name) {
    // v1.5 P1 #9 · 接 _shared/js/avatar-color.js · 跨页一致
    return (typeof AvatarColor !== 'undefined') ? AvatarColor.gradient(name) : 'linear-gradient(135deg,#D97757,#E89B6E)';
  }

  function bindBell() {
    const btn = $('bellBtn');
    const dd = $('bellDropdown');
    if (!btn || !dd) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // 关掉头像 dropdown
      $('avatarDropdown')?.classList.remove('open');
      dd.classList.toggle('open');
      if (dd.classList.contains('open')) {
        setupOutsideClose(dd, btn);
      }
    });
    $('markAllRead')?.addEventListener('click', (e) => {
      e.stopPropagation();
      // v1.4 · 接 MessagesRead.markAllReadFor 跨页同步
      if (typeof MessagesRead !== 'undefined') MessagesRead.markAllReadFor('admin');
      else (window.REPORT_MOCK?.messages || []).forEach(m => m.unread = false);
      renderMessages();
      showToast('已标记全部已读');
    });
  }

  function bindAvatar() {
    const btn = $('avatarBtn');
    const dd = $('avatarDropdown');
    if (!btn || !dd) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // 关掉 bell
      $('bellDropdown')?.classList.remove('open');
      dd.classList.toggle('open');
      if (dd.classList.contains('open')) {
        setupOutsideClose(dd, btn);
      }
    });
    $('openSettings')?.addEventListener('click', () => {
      dd.classList.remove('open');
      openSettingsDrawer();
    });
  }

  function setupOutsideClose(dd, anchor) {
    const onDoc = (e) => {
      if (!dd.contains(e.target) && e.target !== anchor && !anchor.contains(e.target)) {
        dd.classList.remove('open');
        document.removeEventListener('click', onDoc);
      }
    };
    setTimeout(() => document.addEventListener('click', onDoc), 0);
  }

  function openSettingsDrawer() {
    const drawer = $('settingsDrawer');
    if (!drawer) return;
    // 标记当前主题 active
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    qsa('.opt-btn[data-theme]').forEach(b => b.classList.toggle('active', b.dataset.theme === cur));
    drawer.classList.add('open');
  }
  function closeSettingsDrawer() {
    $('settingsDrawer')?.classList.remove('open');
  }

  function bindSettings() {
    $('settingsClose')?.addEventListener('click', closeSettingsDrawer);
    $('settingsDrawer')?.addEventListener('click', (e) => {
      if (e.target === $('settingsDrawer')) closeSettingsDrawer();
    });
    qsa('.opt-btn[data-theme]').forEach(b => {
      b.addEventListener('click', () => {
        const t = b.dataset.theme;
        document.documentElement.setAttribute('data-theme', t);
        try { localStorage.setItem('rx-theme', t); } catch (_) {}
        qsa('.opt-btn[data-theme]').forEach(x => x.classList.toggle('active', x === b));
      });
    });
    qsa('.opt-btn[data-speed]').forEach(b => {
      b.addEventListener('click', () => {
        qsa('.opt-btn[data-speed]').forEach(x => x.classList.toggle('active', x === b));
        try { localStorage.setItem('rx-speed', b.dataset.speed); } catch (_) {}
      });
    });
  }

  function bindOraResize() {
    const handle = $('oraResize');
    const aside = $('oraChat');
    if (!handle || !aside) return;
    let dragging = false;
    let startX = 0;
    let startW = 0;
    handle.addEventListener('mousedown', (e) => {
      dragging = true;
      startX = e.clientX;
      startW = aside.getBoundingClientRect().width;
      handle.classList.add('dragging');
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      let w = Math.max(280, Math.min(640, startW - dx));
      document.documentElement.style.setProperty('--ora-w', w + 'px');
    });
    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });
  }
  // v1.8 删 collapse 功能（DM 决议 · 跟 mgthome chat 区精简对齐）

  // ============================================================
  // 13. INIT
  // ============================================================
  function init() {
    const M = window.REPORT_MOCK;
    if (!M) {
      console.error('[report-app] REPORT_MOCK 未加载');
      return;
    }

    // Topbar
    if (M.manager) {
      $('avatarCircle').textContent = M.manager.firstChar || '王';
      $('avatarName').textContent = M.manager.name || '王 HR';
      if (M.manager.avatarColor) {
        $('avatarCircle').style.background = `linear-gradient(135deg, ${M.manager.avatarColor[0]}, ${M.manager.avatarColor[1]})`;
      }
      const adName = $('adName'); if (adName) adName.textContent = M.manager.name || '赵工';
      const adRole = $('adRole'); if (adRole) adRole.textContent = M.manager.role || '区域销售主管 · 学员 + HR + 项目运营';
    }
    if (M.project) {
      $('tbProjectName').textContent = M.project.name;
      $('tbProjectMeta').textContent = ` · W${M.project.weekIndex} / ${M.project.weekTotal} · 第 ${M.project.weekIndex} 周`;
    }

    // v1.4 · Ora safety note · 接 BRANDING.disclaimerText
    const safetyNote = $('oraSafetyNoteText');
    if (safetyNote && window.BRANDING && window.BRANDING.disclaimerText) {
      safetyNote.textContent = window.BRANDING.disclaimerText;
    }
    // chat 区 .ora-bar-text + 散文 .brand-neo / .brand-ora
    if (typeof Branding !== 'undefined') Branding.applyAll();

    // 列表渲染
    renderManagerReports();
    renderStudentReports();

    // 顶层事件
    bindLibraryTopEvents();
    bindToolbar();
    bindOraChat();
    bindSelectionPopover();
    // v1.7 mgthome 复用
    renderMessages();
    bindBell();
    bindAvatar();
    bindSettings();
    bindOraResize();

    // 路由
    const r = readRoute();
    if (r.tab === 'student') switchTab('student');
    if (r.view === 'editor' && r.id) {
      openReportInEditor(r.id);
    }

    // demo 提示（pulse 引导由 updateSubbar 在生成 + 新建按钮时挂上）
    if (M.demoFlags && M.demoFlags.autoToastReady) {
      setTimeout(() => showToast('demo · 浏览历史 / 点 + 新建 体验完整流程', 3200), 800);
    }
    // v1.9 初始 subbar 渲染
    updateSubbar();

    console.log('[report-app] init ok · managerReports=' + M.managerReports.length + ' studentReports=' + M.studentReports.length);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 暴露调试接口
  window.REPORT_APP = {
    state, switchView, switchTab, openReportInEditor,
    renderManagerReports, renderStudentReports,
    showToast, oraStreamAppend, oraPushCard
  };

})();
