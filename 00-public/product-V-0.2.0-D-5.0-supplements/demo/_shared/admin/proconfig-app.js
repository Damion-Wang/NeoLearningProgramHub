/* ============================================================
   ProConfig · APP LOGIC v2 (按 spec D-5.0 + PM 反馈 v2)
   v2 改动：
   - 编辑/锁定态切换（每分区独立 [编辑 / 取消 / 保存]）
   - 板块 1+3 合并 = 项目时间轴 + 里程碑
   - 时间轴可点击空白处加里程碑
   - 触发规则 ↔ 文案模板 一一对应（删独立模板列表）
   - lecture preview 含图含题（参 lecture 课件区）
   - practice 剧本用 markdown 渲染器
   - 所有 Course 都展开
   v3：全部 emoji → SVG icon（参 hall 1.8 stroke 风）
   ============================================================ */

(function () {
  const M = window.PROCONFIG_MOCK;
  const $ = id => document.getElementById(id);

  /* ==========  Icons · 统一 SVG 注册（参 hall 风：viewBox 0 0 24 24 / 1.8 stroke / round cap）  ========== */
  function svg(d, size, extraAttr) {
    const sz = size || 16;
    return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'+(extraAttr||'')+'>'+d+'</svg>';
  }
  const Icons = {
    // 状态点
    statusPre: function (sz) { return svg('<circle cx="12" cy="12" r="9" fill="#e8a838" stroke="none"/>', sz||10); },
    statusRun: function (sz) { return svg('<circle cx="12" cy="12" r="9" fill="#4f8b5c" stroke="none"/>', sz||10); },
    // 提示 / 警告
    bulb:    function (sz) { return svg('<path d="M9 18h6"/><path d="M10 22h4"/><path d="M2 9a10 10 0 0120 0c0 4-3 6-4 8H6c-1-2-4-4-4-8z"/>', sz||14); },
    warn:    function (sz) { return svg('<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>', sz||14); },
    lock:    function (sz) { return svg('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>', sz||14); },
    // 文档 / 章节
    doc:     function (sz) { return svg('<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>', sz||14); },
    flag:    function (sz) { return svg('<path d="M4 22V4"/><path d="M4 4h13l-3 5 3 5H4"/>', sz||14); },
    flagEnd: function (sz) { return svg('<path d="M4 22V4"/><path d="M4 4h12v8H4z" fill="currentColor" stroke="currentColor"/>', sz||14); },
    star:    function (sz) { return svg('<path d="M12 3l1.91 5.84L20 10l-5 4.84L16.18 21 12 17.77 7.82 21 9 14.84 4 10l6.09-1.16z"/>', sz||14); },
    calendar:function (sz) { return svg('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', sz||14); },
    // 操作
    edit:    function (sz) { return svg('<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/>', sz||14); },
    save:    function (sz) { return svg('<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>', sz||14); },
    plus:    function (sz) { return svg('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>', sz||14); },
    upload:  function (sz) { return svg('<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>', sz||14); },
    download:function (sz) { return svg('<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>', sz||14); },
    importCsv: function (sz) { return svg('<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>', sz||14); },
    eye:     function (sz) { return svg('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>', sz||14); },
    eyeOff:  function (sz) { return svg('<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><path d="M9.88 9.88a3 3 0 104.24 4.24"/><line x1="1" y1="1" x2="23" y2="23"/>', sz||14); },
    copy:    function (sz) { return svg('<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>', sz||14); },
    key:     function (sz) { return svg('<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>', sz||14); },
    search:  function (sz) { return svg('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', sz||14); },
    target:  function (sz) { return svg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>', sz||14); },
    // 多媒体
    play:    function (sz) { return svg('<polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>', sz||14); },
    chat:    function (sz) { return svg('<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>', sz||14); },
    mic:     function (sz) { return svg('<path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>', sz||14); },
    bot:     function (sz) { return svg('<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>', sz||14); },
    grad:    function (sz) { return svg('<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5"/>', sz||14); },
    check:   function (sz) { return svg('<polyline points="20 6 9 17 4 12"/>', sz||14); },
    bolt:    function (sz) { return svg('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', sz||14); }
  };
  // 行内 icon · 跟文字基线齐
  function ic(name, sz) {
    const fn = Icons[name]; if (!fn) return '';
    return '<span class="ic" style="display:inline-flex;vertical-align:middle;margin-right:6px;line-height:0">'+fn(sz)+'</span>';
  }
  // 暴露给外部模板
  window.Icons = Icons;
  window.ic = ic;
  const state = {
    status: 'running',
    members: M.members.slice(),
    milestones: M.milestones.slice(),
    rules: JSON.parse(JSON.stringify(M.reminders.rules)),
    pwdMasked: true,
    memberSearch: '',
    memberRoleFilter: '',
    memberPage: 1,
    memberPerPage: 10,
    editingSections: new Set(),  // v3: 多模块同时编辑
    snapshots: {},               // v3: per-section snapshot · key = section name
    pendingNav: null,            // v3: 离开提醒拦截目标（'home'/'mgthome'/'logout'/url）
    logoDataUrl: null            // v3: Logo 上传后的 dataURL
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
  // v3: 编辑态查询（多模块同时编辑）
  function isEditing(sec) { return state.editingSections.has(sec); }

  /* ==========  顶部状态 chip + sidenav 双态可见性（spec § 1 line 35-37）  ========== */
  function renderStatus() {
    const chip = $('statusChip'), bar = $('launchBar');
    if (isPreLaunch()) {
      chip.className = 'status-chip pre-launch';
      chip.innerHTML = ic('statusPre', 10) + '开营前 · 配置态';
      bar.style.display = 'flex';
      // spec § 1 line 36-37 · 开营前 Home / Report / Message 完全隐藏
      ['navHome','navReport','navMessage'].forEach(id => $(id).style.display = 'none');
    } else {
      chip.className = 'status-chip running';
      const days = Math.floor((new Date(M.projectInfo.projectCycle.end) - new Date()) / 86400000);
      const daysLabel = days > 0 ? `还剩 ${days} 天` : `已到期 ${Math.abs(days)} 天`;
      chip.innerHTML = ic('statusRun', 10) + `已开营 · ${daysLabel}`;
      bar.style.display = 'none';
      // 开营后 4 模块全部开放（沿用 [01-overview § 1.1.4]）
      ['navHome','navReport','navMessage'].forEach(id => $(id).style.display = '');
    }
    updateLaunchButtonState();
  }

  /* ==========  编辑/锁定态切换（v3 多模块同时编辑）  ========== */
  // 各 section 的 snapshot 范围
  const SNAP_SCOPE = {
    basics:    () => ({ projectInfo: M.projectInfo }),
    timeline:  () => ({ projectInfo: M.projectInfo, milestones: state.milestones }),
    members:   () => ({ members: state.members }),
    reminders: () => ({ reminders: M.reminders, rules: state.rules }),
    branding:  () => ({ branding: M.branding, logoDataUrl: state.logoDataUrl })
  };
  const SECTION_LABEL = {
    basics: '项目基础信息', timeline: '里程碑',
    members: '人员名单', reminders: '催学规则', branding: '平台个性化'
  };

  function setSectionEditMode(sec, editing) {
    if (editing) {
      const scope = SNAP_SCOPE[sec] && SNAP_SCOPE[sec]();
      state.snapshots[sec] = scope ? JSON.parse(JSON.stringify(scope)) : null;
      state.editingSections.add(sec);
    } else {
      state.editingSections.delete(sec);
      delete state.snapshots[sec];
    }
    applySectionLockState(sec, editing);
    const actionsContainer = document.querySelector(`[data-section-actions="${sec}"]`);
    if (actionsContainer) {
      if (editing) {
        actionsContainer.innerHTML = `
          <button class="small-btn cancel" data-section-cancel="${sec}">取消</button>
          <button class="small-btn save" data-section-save="${sec}">保存</button>
        `;
        actionsContainer.querySelector('[data-section-cancel]').addEventListener('click', () => handleCancel(sec));
        actionsContainer.querySelector('[data-section-save]').addEventListener('click', () => handleSave(sec));
      } else {
        actionsContainer.innerHTML = `<button class="small-btn" data-section-edit="${sec}">编辑</button>`;
        actionsContainer.querySelector('[data-section-edit]').addEventListener('click', () => {
          // v3: 取消互斥 · 多模块可同时编辑
          setSectionEditMode(sec, true);
        });
      }
    }
  }

  // 取消处理（仅还原此 section 的 snapshot）
  function handleCancel(sec) {
    const snap = state.snapshots[sec];
    if (snap) {
      if (snap.projectInfo) M.projectInfo = JSON.parse(JSON.stringify(snap.projectInfo));
      if (snap.milestones)  state.milestones = JSON.parse(JSON.stringify(snap.milestones));
      if (snap.members)     state.members = JSON.parse(JSON.stringify(snap.members));
      if (snap.rules)       state.rules = JSON.parse(JSON.stringify(snap.rules));
      if (snap.reminders)   M.reminders = JSON.parse(JSON.stringify(snap.reminders));
      if (snap.branding)    M.branding = JSON.parse(JSON.stringify(snap.branding));
      if ('logoDataUrl' in snap) state.logoDataUrl = snap.logoDataUrl;
    }
    setSectionEditMode(sec, false);
    if (sec === 'basics') { renderProjectMeta(); renderTimeline(); }
    else if (sec === 'timeline') { renderProjectMeta(); renderTimeline(); renderMilestones(); }
    else if (sec === 'members') { renderMembers(); }
    else if (sec === 'reminders') { renderReminders(); }
    else if (sec === 'branding') { renderBranding(); renderLogoPreview(); }
    showToast('已取消「' + (SECTION_LABEL[sec]||sec) + '」修改');
  }

  // 保存处理（按 section 分发）· silent=true 时不弹严格确认 modal、不 toast（用于"全部保存"批处理）
  function handleSave(sec, silent) {
    if (sec === 'basics' || sec === 'timeline') {
      // 项目周期变更严格确认（开营后） · 仅 basics 才会改 cycle 字段
      if (sec === 'basics' && !isPreLaunch()) {
        const newStart = $('fldProjectStart').value, newEnd = $('fldProjectEnd').value;
        const sn = state.snapshots.basics?.projectInfo?.projectCycle;
        if (sn && (newStart !== sn.start || newEnd !== sn.end) && !silent) {
          openModal(`
            <div class="modal-title">严格确认 · 项目周期变更</div>
            <div class="modal-body">
              <p>原值：${sn.start} → ${sn.end}</p>
              <p>新值：${newStart} → ${newEnd}</p>
              <p style="color:var(--warn);margin-top:8px">项目周期涉及合同字段 · 请确认变更影响所有学员的开营/结营节奏。</p>
            </div>
            <div class="modal-actions">
              <button class="modal-btn" onclick="closeModal()">取消</button>
              <button class="modal-btn primary" id="confirmCycleBtn">确认变更 · 保存</button>
            </div>
          `);
          $('confirmCycleBtn').addEventListener('click', () => {
            commitBasics();
            closeModal();
            setSectionEditMode('basics', false);
            renderProjectMeta(); renderTimeline(); renderMilestones();
            showToast('项目周期已变更');
          });
          return;
        }
      }
      if (sec === 'basics') {
        commitBasics();
        $('topbarProjectName').textContent = M.projectInfo.name;
        renderTimeline();
      } else {
        // timeline section · 仅里程碑（基础字段已搬到 basics）
        // 里程碑 inline 修改 · 直接落地不需要额外 commit
        renderTimeline(); renderMilestones();
      }
    } else if (sec === 'reminders') {
      M.reminders.silentDays = +$('fldSilentDays').value;
      M.reminders.behindMultiplier = +$('fldBehindMul').value;
      M.reminders.leadingMultiplier = +$('fldLeadingMul').value;
      M.reminders.rules = JSON.parse(JSON.stringify(state.rules));
    } else if (sec === 'branding') {
      M.branding.welcomeMsg = $('fldWelcome').value;
      M.branding.neoName = $('fldNeoName').value;
      M.branding.oraName = $('fldOraName').value;
      // logo dataUrl 已在上传时直接写 state.logoDataUrl · 此处持久化到 branding
      M.branding.logoDataUrl = state.logoDataUrl || null;
      // v1.5.2 B-PROCONFIG-NAME · 写 localStorage 跨页持久化（demo-reset.js F5 时会清）
      try { localStorage.setItem('rx-branding', JSON.stringify({
        neoName: M.branding.neoName,
        oraName: M.branding.oraName,
        welcomeMsg: M.branding.welcomeMsg,
        logoDataUrl: M.branding.logoDataUrl
      })); } catch (e) {}
      // 立即刷当前 proconfig 页所有 .brand-neo / .brand-ora / .ora-bar-text 散文
      if (typeof Branding !== 'undefined' && Branding.applyAll) Branding.applyAll();
    } else if (sec === 'members') {
      M.members = state.members.slice();
    }
    setSectionEditMode(sec, false);
    if (!silent) showToast('已保存 · ' + (SECTION_LABEL[sec] || sec));
  }
  function commitBasics() {
    M.projectInfo.name = $('fldName').value;
    if (isPreLaunch()) {
      M.projectInfo.serviceCycle.start = $('fldServiceStart').value;
      M.projectInfo.serviceCycle.end = $('fldServiceEnd').value;
    }
    M.projectInfo.projectCycle.start = $('fldProjectStart').value;
    M.projectInfo.projectCycle.end = $('fldProjectEnd').value;
    M.projectInfo.description = $('fldDesc').value;
    M.projectInfo.customerName = $('fldCustomer').value;
  }
  // v3: 全部保存（用于离开 modal 的"全部保存"按钮）
  function saveAllDirty() {
    const list = Array.from(state.editingSections);
    list.forEach(sec => handleSave(sec, true));
    showToast('已保存 ' + list.length + ' 个模块');
  }
  // v3: 全部放弃（用于离开 modal 的"放弃改动"按钮）
  function discardAllDirty() {
    const list = Array.from(state.editingSections);
    list.forEach(sec => {
      const snap = state.snapshots[sec];
      if (snap) {
        if (snap.projectInfo) M.projectInfo = JSON.parse(JSON.stringify(snap.projectInfo));
        if (snap.milestones)  state.milestones = JSON.parse(JSON.stringify(snap.milestones));
        if (snap.members)     state.members = JSON.parse(JSON.stringify(snap.members));
        if (snap.rules)       state.rules = JSON.parse(JSON.stringify(snap.rules));
        if (snap.reminders)   M.reminders = JSON.parse(JSON.stringify(snap.reminders));
        if (snap.branding)    M.branding = JSON.parse(JSON.stringify(snap.branding));
        if ('logoDataUrl' in snap) state.logoDataUrl = snap.logoDataUrl;
      }
      setSectionEditMode(sec, false);
    });
    renderProjectMeta(); renderTimeline(); renderMilestones();
    renderMembers(); renderReminders(); renderBranding(); renderLogoPreview();
  }

  function applySectionLockState(sec, editing) {
    if (sec === 'basics') {
      const lockSvc = !isPreLaunch();  // 服务周期开营后永久锁定
      $('fldName').disabled = !editing;
      $('fldServiceStart').disabled = !editing || lockSvc;
      $('fldServiceEnd').disabled = !editing || lockSvc;
      $('fldProjectStart').disabled = !editing;
      $('fldProjectEnd').disabled = !editing;
      $('fldDesc').disabled = !editing;
      $('fldCustomer').disabled = !editing;
    } else if (sec === 'timeline') {
      $('btnAddCustomMs').disabled = !editing || state.milestones.filter(m=>!isStageMs(m)).length >= 10;
      // v1.5 P9 #21 · 删「点击时间轴空白处」提示文案
      const tip = $('timelineTip');
      if (tip) tip.style.display = 'none';
      document.querySelectorAll('.milestone-row input').forEach(inp => inp.disabled = !editing);
      document.querySelectorAll('.milestone-row button').forEach(btn => {
        if (btn.dataset.act === 'delete') {
          const row = btn.closest('.milestone-row');
          const id = row?.dataset.id;
          const m = state.milestones.find(x => x.id === id);
          btn.disabled = !editing || (m?.mandatory);
        } else {
          btn.disabled = !editing;
        }
      });
    } else if (sec === 'members') {
      // 表格内字段切
      document.querySelectorAll('#memberTbody input').forEach(inp => {
        // 已开营 + 已首登 时账号不可改（保留 spec 约束）
        const tr = inp.closest('tr'); const id = tr?.dataset.id;
        const m = state.members.find(x => x.id === id);
        if (inp.dataset.fld === 'account' && m?.hasFirstLogin && !isPreLaunch()) {
          inp.disabled = true;
        } else {
          inp.disabled = !editing;
        }
      });
      document.querySelectorAll('#memberTbody button').forEach(btn => {
        if (btn.dataset.act === 'delete') {
          const tr = btn.closest('tr');
          const id = tr?.dataset.id;
          const m = state.members.find(x => x.id === id);
          btn.disabled = !editing || (!isPreLaunch() && m?.hasFirstLogin);
        } else {
          btn.disabled = !editing;
        }
      });
      $('btnAddMember').disabled = !editing || (!isPreLaunch() && state.members.filter(m => !m.hasFirstLogin).length === 0);
      $('btnImportCSV').disabled = !editing;
      // 锁定态隐藏「添加人员 / 批量导入」整组（仅编辑态出现）
      const memEditOnly = document.querySelector('[data-edit-only="members"]');
      if (memEditOnly) memEditOnly.style.display = editing ? 'inline-flex' : 'none';
      // 默认密码改为只读 · 查看/复制始终可用（无需开锁）
      $('btnViewPwd').disabled = false;
      $('btnCopyPwd').disabled = false;
      $('memberSearch').disabled = false;  // 搜索始终可用（不算编辑）
      $('memberRoleFilter').disabled = false;
    } else if (sec === 'reminders') {
      ['fldSilentDays','fldBehindMul','fldLeadingMul'].forEach(id => $(id).disabled = !editing);
      document.querySelectorAll('.rule-card input[type="checkbox"]').forEach(cb => cb.disabled = !editing);
      // textarea + 添加变量按钮: 仅 enabled rule 在编辑态时可改
      document.querySelectorAll('.rule-card').forEach(card => {
        const id = card.dataset.ruleId;
        const r = state.rules.find(x => x.id === id);
        const ta = card.querySelector('textarea');
        if (ta) ta.disabled = !editing || !r?.enabled;
        const vbtn = card.querySelector('[data-var-toggle]');
        if (vbtn) vbtn.disabled = !editing || !r?.enabled;
      });
    } else if (sec === 'branding') {
      $('btnUploadLogo').disabled = !editing;
      $('fldWelcome').disabled = !editing;
      $('fldNeoName').disabled = !editing;
      $('fldOraName').disabled = !editing;
      // 移除按钮 · 仅当编辑态 + 已上传 Logo 时可见
      const removeBtn = $('btnRemoveLogo');
      if (removeBtn) {
        removeBtn.disabled = !editing || !state.logoDataUrl;
        removeBtn.style.display = (editing && state.logoDataUrl) ? '' : 'none';
      }
    }
  }

  function setupEditButtons() {
    // 初始绑定（锁定态时的 [编辑] 按钮）· 编辑/取消/保存切态后由 setSectionEditMode 内部重绑
    document.querySelectorAll('[data-section-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sec = btn.dataset.sectionEdit;
        // v3: 取消互斥 · 多模块可同时编辑
        setSectionEditMode(sec, true);
      });
    });
  }

  /* ==========  板块 1 · 项目基础信息 / 板块 2 · 时间轴 + 里程碑  ========== */
  function renderProjectMeta() {
    const p = M.projectInfo;
    $('fldName').value = p.name;
    $('fldServiceStart').value = p.serviceCycle.start;
    $('fldServiceEnd').value = p.serviceCycle.end;
    $('fldProjectStart').value = p.projectCycle.start;
    $('fldProjectEnd').value = p.projectCycle.end;
    $('fldDesc').value = p.description;
    $('fldCustomer').value = p.customerName;
    $('topbarProjectName').textContent = p.name;
    $('serviceTip').innerHTML = !isPreLaunch()
      ? ic('lock', 13) + '已开营 · 服务周期永久锁定（仅后台改）'
      : '默认 1 年 · 开营后永久锁定（仅后台改）';
  }

  function renderTimeline() {
    const widget = $('timelineWidget'); if (!widget) return;
    const p = M.projectInfo;
    const sStart = new Date(p.serviceCycle.start).getTime();
    const sEnd   = new Date(p.serviceCycle.end).getTime();
    const pStart = new Date(p.projectCycle.start).getTime();
    const pEnd   = new Date(p.projectCycle.end).getTime();
    if (!sStart || !sEnd || sEnd <= sStart) { widget.innerHTML = '<div style="color:var(--ink-3);font-size:12px;display:inline-flex;align-items:center;gap:6px">'+ic('warn',13)+'请先填写服务周期</div>'; return; }
    const span = sEnd - sStart;
    const pct = ts => Math.max(0, Math.min(100, ((ts - sStart) / span) * 100));
    const projStartPct = pct(pStart);
    const projEndPct   = pct(pEnd);
    const projWidthPct = projEndPct - projStartPct;

    const ms = state.milestones.filter(m => {
      const t = new Date(m.date).getTime();
      return t >= sStart && t <= sEnd;
    });
    // v1.5.1 B11+B05 · 用 hall/mgthome 同款 marker-dot + marker-label[data-lane] 风格 · labels 上下错开避免重叠
    const fmtDate = iso => { const d = new Date(iso); return d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate(); };
    const ticksHtml = ms.map((m, i) => {
      const t = new Date(m.date).getTime();
      const left = pct(t);
      const isStage = m.type === 'kickoff' || m.type === 'closing' || m.type === 'phase-end' || m.id === 'kickoff';
      const lane = (i % 2 === 0) ? 'top' : 'bottom';
      const dotCls = isStage ? 'stage' : '';
      return `
        <div class="timeline-marker" style="left:${left}%" data-ms-id="${m.id}">
          <div class="marker-dot ${dotCls}"></div>
          <span class="marker-label" data-lane="${lane}">${escapeHtml(m.name)} · ${fmtDate(m.date)}</span>
        </div>`;
    }).join('');

    const projMonths = Math.round((pEnd - pStart) / (30 * 86400000));
    const totalMonths = Math.round(span / (30 * 86400000));
    const remainMonths = totalMonths - projMonths;

    widget.innerHTML = `
      <div class="timeline-legend">
        <span><i class="lg-service"></i>服务周期 · ${totalMonths} 个月（${p.serviceCycle.start} → ${p.serviceCycle.end}）</span>
        <span><i class="lg-project"></i>项目周期 · ${projMonths} 个月（${p.projectCycle.start} → ${p.projectCycle.end}）</span>
      </div>
      <div class="timeline-bar v15" id="timelineBar">
        <div class="timeline-fill-project" style="left:${projStartPct}%;width:${projWidthPct}%"></div>
        ${ticksHtml}
      </div>
      <div class="timeline-meta">
        <span>服务期 <b>${totalMonths}</b> 个月</span>
        <span>项目期 <b>${projMonths}</b> 个月</span>
        ${remainMonths > 0 ? `<span>剩余服务期 <b>${remainMonths}</b> 个月</span>` : ''}
      </div>
    `;

    // 里程碑 marker 点击 → 滚到列表对应行
    widget.querySelectorAll('.timeline-marker').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        const id = el.dataset.msId;
        const row = document.querySelector(`.milestone-row[data-id="${id}"]`);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          row.style.outline = '2px solid var(--accent)';
          setTimeout(() => row.style.outline = '', 1500);
        }
      });
    });

    // 时间轴空白处点击 → 编辑态时按 click 位置算日期插入新里程碑
    const bar = widget.querySelector('#timelineBar');
    if (bar) {
      bar.addEventListener('click', e => {
        if (!isEditing('timeline')) {
          showToast('点击「编辑」才能添加里程碑');
          return;
        }
        // 已点 tick 的事件已 stopPropagation
        const rect = bar.getBoundingClientRect();
        const xPct = ((e.clientX - rect.left) / rect.width) * 100;
        if (xPct < 0 || xPct > 100) return;
        const ts = sStart + (span * xPct / 100);
        const date = new Date(ts).toISOString().slice(0, 10);
        // 必须在项目周期内
        if (date < p.projectCycle.start || date > p.projectCycle.end) {
          showToast(`日期 ${date} 不在项目周期内`); return;
        }
        const customCount = state.milestones.filter(m => m.type === 'custom').length;
        if (customCount >= 10) { showToast('已达自定义里程碑上限 10'); return; }
        promptAddMilestone(date);
      });
    }
  }

  function promptAddMilestone(date) {
    openModal(`
      <div class="modal-title">+ 添加自定义里程碑</div>
      <div class="modal-body">
        <div class="form-row" style="grid-template-columns:80px 1fr"><label class="form-label">名称 *</label><input type="text" id="newMsName" class="form-input" placeholder="例如：上半年汇报" /></div>
        <div class="form-row" style="grid-template-columns:80px 1fr"><label class="form-label">日期 *</label><input type="date" id="newMsDate" class="form-input" value="${date || ''}" min="${M.projectInfo.projectCycle.start}" max="${M.projectInfo.projectCycle.end}" /></div>
        <div class="form-tip">日期必须在项目周期 ${M.projectInfo.projectCycle.start} ~ ${M.projectInfo.projectCycle.end} 内</div>
      </div>
      <div class="modal-actions">
        <button class="modal-btn" onclick="closeModal()">取消</button>
        <button class="modal-btn primary" onclick="window.__procAddMs()">创建</button>
      </div>
    `);
    setTimeout(() => $('newMsName')?.focus(), 100);
  }
  window.__procAddMs = function () {
    const name = $('newMsName').value.trim();
    const date = $('newMsDate').value;
    if (!name || !date) { showToast('名称 + 日期必填'); return; }
    if (date < M.projectInfo.projectCycle.start || date > M.projectInfo.projectCycle.end) { showToast('日期需在项目周期内'); return; }
    const newMs = { id: 'm-c-' + Date.now(), type: 'custom', name, date, relatedActivities: [] };
    state.milestones.push(newMs);
    closeModal();
    renderMilestones();
    renderTimeline();
    // v1.5 P9 #19 · 创建后立即弹关联内容 modal · 保存前能看到其他里程碑已关联的 Activity
    setTimeout(() => openRelatedModal(newMs), 200);
  };

  // v1.5 P9 #20 · 阶段里程碑只剩开营+结营 · 其他（含 W4 中期/W12 复盘/business）全部归入自定义
  function isStageMs(m) {
    return m.type === 'kickoff' || m.type === 'closing' || m.type === 'phase-end' || m.id === 'kickoff';
  }
  function renderMilestones() {
    const phase = state.milestones.filter(m => isStageMs(m))
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));  // 开营先于结营
    const custom = state.milestones.filter(m => !isStageMs(m))
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));  // 按时间升序
    $('phaseMs').innerHTML = phase.map(m => msRow(m)).join('');
    $('customMs').innerHTML = custom.map(m => msRow(m)).join('');
    $('customMsTitle').innerHTML = `${ic('star',13)}自定义里程碑（${custom.length} / 10）`;
    const editing = isEditing('timeline');
    $('btnAddCustomMs').disabled = !editing || custom.length >= 10;

    document.querySelectorAll('.milestone-row').forEach(row => {
      const id = row.dataset.id;
      const m = state.milestones.find(x => x.id === id);
      row.querySelector('input[data-fld="name"]')?.addEventListener('change', e => m.name = e.target.value);
      row.querySelector('input[data-fld="date"]')?.addEventListener('change', e => { m.date = e.target.value; renderTimeline(); });
      row.querySelector('button[data-act="related"]')?.addEventListener('click', () => openRelatedModal(m));
      row.querySelector('button[data-act="delete"]')?.addEventListener('click', () => {
        if (m.mandatory) { showToast('结营里程碑不可删除'); return; }
        state.milestones = state.milestones.filter(x => x.id !== id);
        showToast('已删除里程碑');
        renderMilestones(); renderTimeline();
      });
      // 同步 disabled
      row.querySelectorAll('input').forEach(inp => inp.disabled = !editing);
      row.querySelectorAll('button').forEach(btn => {
        if (btn.dataset.act === 'delete') btn.disabled = !editing || m.mandatory;
        else btn.disabled = !editing;
      });
    });
  }
  // v8 · 计算 Activity → 当前关联它的里程碑（取日期最早一个 · 互斥模型）
  function getActivityOwnerMap() {
    const map = {};  // aid → ms
    const sorted = state.milestones.slice().sort((a,b) => a.date.localeCompare(b.date));
    sorted.forEach(ms => {
      (ms.relatedActivities || []).forEach(aid => {
        if (!map[aid]) map[aid] = ms;  // 首次绑定（最早 ms）
      });
    });
    return map;
  }
  function msRow(m) {
    const icon = m.type === 'phase-end' || m.type === 'closing' ? Icons.flagEnd(14)
               : m.type === 'kickoff' ? Icons.bulb(14)
               : Icons.star(14);
    const relatedCount = (m.relatedActivities || []).length;
    const relatedText = relatedCount > 0 ? `关联 ${relatedCount} Activity` : '<span style="color:var(--ink-4)">未关联内容</span>';
    // v1.5 P9 #18 · 阶段里程碑（kickoff / closing）不渲染「可关联内容」按钮
    const showRelatedBtn = !isStageMs(m);
    return `
      <div class="milestone-row ${m.type}" data-id="${m.id}">
        <span class="milestone-icon">${icon}</span>
        <div class="milestone-name">
          <input type="text" data-fld="name" value="${escapeHtml(m.name)}" disabled />
          ${showRelatedBtn ? `<div class="milestone-related">${relatedText}</div>` : ''}
        </div>
        <div class="milestone-date">
          <input type="date" data-fld="date" value="${m.date}" disabled />
        </div>
        ${showRelatedBtn ? `<button class="small-btn" data-act="related" disabled>${relatedCount > 0 ? '关联内容' : '可关联内容'}</button>` : '<span></span>'}
        <button class="small-btn danger" data-act="delete" ${m.mandatory || isStageMs(m) ? 'disabled title="阶段里程碑不可删"' : 'disabled'}>删除</button>
      </div>`;
  }
  function openRelatedModal(m) {
    const owners = getActivityOwnerMap();  // 全局 owner 视图
    const html = M.coursePack.map(c => `
      <div class="related-course">
        <div class="related-course-head">${escapeHtml(c.name)}</div>
        ${c.activities.map(a => {
          const aid = c.id + '/' + a.id;
          const owner = owners[aid];                                    // 当前所属 ms（若有）
          const ownedByMe = owner && owner.id === m.id;
          const ownedByOther = owner && owner.id !== m.id;
          // 前序锁定：被早于 m 的 ms 拥有 → 当前 m 不能选
          const lockedByEarlier = ownedByOther && owner.date < m.date;
          const checked = ownedByMe;
          const disabled = lockedByEarlier;
          let badge = '';
          if (ownedByOther) {
            const tone = lockedByEarlier ? 'lock' : 'shift';
            const tip = lockedByEarlier ? '已被前序里程碑占用 · 不可选' : '当前归属此 ms · 勾选会从其转移';
            badge = `<span class="related-owner-badge ${tone}" title="${tip}">${escapeHtml(owner.name)}</span>`;
          }
          return `
          <label class="related-act ${disabled ? 'locked' : ''}">
            <input type="checkbox" data-aid="${aid}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} />
            <span class="related-act-name">${escapeHtml(a.name)}</span>
            <span class="activity-type ${a.type}">${a.type}</span>
            ${badge}
          </label>`;
        }).join('')}
      </div>`).join('');
    openModal(`
      <div class="modal-title">关联内容进度 · ${escapeHtml(m.name)}</div>
      <div class="modal-sub">每个 Activity 同一时刻只能关联一个里程碑 · 已被前序里程碑占用的 Activity 不可选（标灰锁定）</div>
      <div class="related-tree">${html}</div>
      <div class="modal-actions">
        <button class="modal-btn" onclick="closeModal()">取消</button>
        <button class="modal-btn primary" onclick="window.__procSaveRelated('${m.id}')">确认</button>
      </div>
    `);
  }
  window.__procSaveRelated = function (msId) {
    const m = state.milestones.find(x => x.id === msId);
    if (!m) return;
    const checks = document.querySelectorAll('#modalCard input[data-aid]:checked');
    const newAids = Array.from(checks).map(c => c.dataset.aid);
    // 互斥：从所有 date >= m.date 的"其他"里程碑中移除这些 aid（前序 ms 不动 · 因为前序锁定 UI 阻止勾选 + 它们的 owner 优先权）
    state.milestones.forEach(other => {
      if (other.id === m.id) return;
      if (other.date >= m.date) {
        other.relatedActivities = (other.relatedActivities || []).filter(aid => !newAids.includes(aid));
      }
    });
    m.relatedActivities = newAids;
    closeModal();
    showToast(`已关联 ${newAids.length} 个 Activity`);
    renderMilestones();
  };
  function setupTimelineUI() {
    $('btnAddCustomMs').addEventListener('click', () => {
      if (!isEditing('timeline')) return;
      const customCount = state.milestones.filter(m => !isStageMs(m)).length;
      if (customCount >= 10) { showToast('已达上限 10'); return; }
      promptAddMilestone();
    });
  }

  /* ==========  板块 3 · 人员名单  ========== */
  function getFilteredMembers() {
    const q = state.memberSearch.trim().toLowerCase();
    const f = state.memberRoleFilter;
    return state.members.filter(m => {
      if (q && !(m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.account.toLowerCase().includes(q))) return false;
      if (f === 'learner-only' && (!m.isLearner || m.isAdmin)) return false;
      if (f === 'admin-only' && (m.isLearner || !m.isAdmin)) return false;
      if (f === 'both' && !(m.isLearner && m.isAdmin)) return false;
      return true;
    });
  }
  function renderMembers() {
    const all = getFilteredMembers();
    const total = all.length;
    const totalAll = state.members.length;
    const adminCount = state.members.filter(m => m.isAdmin).length;
    $('memberCountSub').textContent = `${totalAll} 人（${adminCount} 个管理员 / ${totalAll - adminCount} 个仅学员）`;

    const start = (state.memberPage - 1) * state.memberPerPage;
    const slice = all.slice(start, start + state.memberPerPage);
    const editing = isEditing('members');

    $('memberTbody').innerHTML = slice.map(m => {
      const firstLoginTag = m.hasFirstLogin
        ? '<span class="first-login-tag yes">已登录</span>'
        : '<span class="first-login-tag no">未登录</span>';
      return `
      <tr data-id="${m.id}">
        <td><input type="text" data-fld="name" value="${escapeHtml(m.name)}" disabled /></td>
        <td><input type="text" data-fld="account" value="${escapeHtml(m.account)}" disabled /></td>
        <td><input type="text" data-fld="email" value="${escapeHtml(m.email)}" disabled /></td>
        <td><input type="text" data-fld="contact" value="${escapeHtml(m.contact)}" disabled /></td>
        <td><input type="text" data-fld="dept" value="${escapeHtml(m.dept)}" style="max-width:90px" disabled /></td>
        <td style="text-align:center"><input type="checkbox" data-fld="isLearner" ${m.isLearner ? 'checked' : ''} disabled /></td>
        <td style="text-align:center"><input type="checkbox" data-fld="isAdmin" ${m.isAdmin ? 'checked' : ''} disabled /></td>
        <td style="text-align:center">${firstLoginTag}</td>
        <td style="text-align:right">
          <div class="row-actions">
            <button class="small-btn" data-act="resetpwd" disabled>重置密码</button>
            <button class="small-btn danger" data-act="delete" disabled>删除</button>
          </div>
        </td>
      </tr>`;
    }).join('');

    document.querySelectorAll('#memberTbody input[data-fld]').forEach(inp => {
      inp.addEventListener('change', e => {
        const tr = e.target.closest('tr'); const id = tr.dataset.id;
        const m = state.members.find(x => x.id === id);
        if (!m) return;
        const fld = e.target.dataset.fld;
        if (fld === 'isLearner' || fld === 'isAdmin') {
          m[fld] = e.target.checked;
          if (!m.isLearner && !m.isAdmin) {
            m.isLearner = true;
            showToast('每人至少有一个角色');
            renderMembers();
          }
        } else m[fld] = e.target.value;
      });
    });
    document.querySelectorAll('#memberTbody button[data-act]').forEach(btn => {
      btn.addEventListener('click', e => {
        const tr = e.target.closest('tr'); const id = tr.dataset.id;
        const m = state.members.find(x => x.id === id);
        const act = btn.dataset.act;
        if (act === 'resetpwd') {
          openModal(`
            <div class="modal-title">重置密码 · ${m.name}</div>
            <div class="modal-body">将 <b>${m.name}</b> 的密码重置为当前默认密码 <code>${M.defaultPassword}</code>，对方下次登录需用此密码。</div>
            <div class="modal-actions">
              <button class="modal-btn" onclick="closeModal()">取消</button>
              <button class="modal-btn primary" onclick="closeModal();window.__procRespond('resetpwd-${m.id}')">确认重置</button>
            </div>
          `);
        } else if (act === 'delete') {
          if (!isPreLaunch() && m.hasFirstLogin) { showToast('已首登 · 不可删除'); return; }
          openModal(`
            <div class="modal-title">${isPreLaunch() ? '删除人员' : ic('warn',16)+'严格确认 · 删除已开营人员'}</div>
            <div class="modal-body">
              <p>${m.name} (${m.account}) · ${m.dept}</p>
              ${!isPreLaunch() ? '<p style="color:var(--warn);display:inline-flex;align-items:center;gap:6px">'+ic('warn',13)+'该账号未首次登录 · 删除后可增加同等数量替换。</p>' : ''}
            </div>
            <div class="modal-actions">
              <button class="modal-btn" onclick="closeModal()">取消</button>
              <button class="modal-btn primary" onclick="closeModal();window.__procRespond('delete-${m.id}')">确认删除</button>
            </div>
          `);
        }
      });
    });

    // 分页
    const totalPages = Math.max(1, Math.ceil(total / state.memberPerPage));
    $('memberPagination').innerHTML = `
      共 ${total} 人筛选结果 · 第 ${state.memberPage} / ${totalPages} 页
      <span>
        <button class="small-btn" ${state.memberPage <= 1 ? 'disabled' : ''} id="btnPrevPage">‹ 上一页</button>
        <button class="small-btn" ${state.memberPage >= totalPages ? 'disabled' : ''} id="btnNextPage">下一页 ›</button>
      </span>
    `;
    const pp = $('btnPrevPage'); if (pp) pp.onclick = () => { state.memberPage--; renderMembers(); };
    const np = $('btnNextPage'); if (np) np.onclick = () => { state.memberPage++; renderMembers(); };

    // 应用编辑态
    if (editing) applySectionLockState('members', true);
  }

  window.__procRespond = function (key) {
    if (key.startsWith('resetpwd-')) showToast('密码已重置');
    else if (key.startsWith('delete-')) {
      const id = key.slice(7);
      state.members = state.members.filter(m => m.id !== id);
      showToast('已删除');
      renderMembers(); updateLaunchButtonState();
    } else if (key === 'launch-confirm') {
      state.status = 'running';
      showToast('开营成功 · 已发送 ' + state.members.length + ' 条系统消息');
      renderStatus(); renderProjectMeta(); renderMembers(); renderMilestones(); renderTimeline();
    }
  };

  /* ==========  默认密码区  ========== */
  function renderPwdDisplay() {
    const el = $('defaultPwdDisplay');
    if (state.pwdMasked) { el.classList.add('masked'); el.textContent = '●●●●●●●●'; }
    else { el.classList.remove('masked'); el.textContent = M.defaultPassword; }
  }
  function setupPwdControls() {
    // 默认密码 · 只读模式：仅 查看/隐藏 + 复制（无 更改）
    $('btnViewPwd').addEventListener('click', () => {
      state.pwdMasked = !state.pwdMasked; renderPwdDisplay();
      $('btnViewPwd').innerHTML = state.pwdMasked ? ic('eye',13)+'查看' : ic('eyeOff',13)+'隐藏';
    });
    $('btnCopyPwd').addEventListener('click', () => {
      const tmp = document.createElement('textarea'); tmp.value = M.defaultPassword;
      document.body.appendChild(tmp); tmp.select();
      try { document.execCommand('copy'); showToast('已复制到剪贴板'); } catch { showToast('复制失败'); }
      document.body.removeChild(tmp);
    });
  }

  /* ==========  板块 3 · 催学规则（v2: 触发规则↔模板 一一对应）  ========== */
  function renderReminders() {
    const r = M.reminders;
    $('fldSilentDays').value = r.silentDays;
    $('fldBehindMul').value = r.behindMultiplier;
    $('fldLeadingMul').value = r.leadingMultiplier;
    $('ruleList').innerHTML = state.rules.map(rule => `
      <div class="rule-card ${rule.enabled ? '' : 'disabled'}" data-rule-id="${rule.id}">
        <div class="rule-card-head">
          <label class="rule-card-toggle">
            <input type="checkbox" data-rule-toggle ${rule.enabled ? 'checked' : ''} disabled />
            <span class="rule-card-name">${escapeHtml(rule.label)}</span>
          </label>
          <span class="rule-card-tip">${rule.enabled ? '启用 · 文案可编辑' : '禁用 · 启用后才能编辑文案'}</span>
        </div>
        <div class="rule-card-body">
          <textarea class="rule-card-textarea" data-rule-body disabled placeholder="启用此规则后即可编辑文案模板">${escapeHtml(rule.body)}</textarea>
          <div class="var-insert-wrap">
            <button class="var-insert-btn" data-var-toggle disabled>+ 添加变量
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="var-insert-menu" data-var-menu>
              ${['${学员名}','${进度}','${群体均值进度}','${脱训天数}','${下一里程碑名}','${距里程碑天数}','${距结营天数}','${落后百分比}'].map(v => `<div class="var-insert-item" data-var="${v}">${v}</div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.rule-card').forEach(card => {
      const id = card.dataset.ruleId;
      const r = state.rules.find(x => x.id === id);
      // 切换 enabled
      card.querySelector('[data-rule-toggle]').addEventListener('change', e => {
        r.enabled = e.target.checked;
        card.classList.toggle('disabled', !r.enabled);
        card.querySelector('.rule-card-tip').textContent = r.enabled ? '启用 · 文案可编辑' : '禁用 · 启用后才能编辑文案';
        // 切 textarea + 添加变量按钮
        const ta = card.querySelector('textarea');
        const vbtn = card.querySelector('[data-var-toggle]');
        if (isEditing('reminders')) {
          ta.disabled = !r.enabled;
          if (vbtn) vbtn.disabled = !r.enabled;
        }
      });
      // body 编辑
      card.querySelector('[data-rule-body]').addEventListener('input', e => r.body = e.target.value);
      // 变量下拉 · 切换 + 选择
      const vbtn = card.querySelector('[data-var-toggle]');
      const vmenu = card.querySelector('[data-var-menu]');
      if (vbtn && vmenu) {
        vbtn.addEventListener('click', e => {
          e.stopPropagation();
          if (vbtn.disabled) return;
          // 关掉其他卡片的菜单
          document.querySelectorAll('.var-insert-menu.open').forEach(m => { if (m !== vmenu) m.classList.remove('open'); });
          vmenu.classList.toggle('open');
        });
        vmenu.querySelectorAll('.var-insert-item').forEach(item => {
          item.addEventListener('click', e => {
            e.stopPropagation();
            const ta = card.querySelector('textarea');
            if (ta.disabled) return;
            const v = item.dataset.var;
            const start = ta.selectionStart, end = ta.selectionEnd;
            ta.value = ta.value.slice(0, start) + v + ta.value.slice(end);
            ta.focus(); ta.setSelectionRange(start + v.length, start + v.length);
            r.body = ta.value;
            vmenu.classList.remove('open');
          });
        });
      }
    });
    // 点空白处关变量菜单
    document.addEventListener('click', () => {
      document.querySelectorAll('.var-insert-menu.open').forEach(m => m.classList.remove('open'));
    });
  }

  /* ==========  板块 4 · 平台个性化  ========== */
  function renderBranding() {
    const b = M.branding;
    $('fldWelcome').value = b.welcomeMsg;
    $('fldNeoName').value = b.neoName;
    $('fldOraName').value = b.oraName;
  }

  /* ==========  板块 5 · 内容预览（所有 Course 都展开）  ========== */
  function renderCoursePack() {
    $('courseTree').innerHTML = M.coursePack.map(c => {
      const acts = c.activities.length;
      const actsHtml = acts > 0 ? c.activities.map(a => `
        <div class="activity-row">
          <span class="activity-type ${a.type}">${a.type}</span>
          <span>${escapeHtml(a.name)}</span>
          ${a.type !== 'recap'
            ? `<a class="preview-link" data-c-id="${c.id}" data-a-id="${a.id}" data-act-type="${a.type}">${ic('eye',13)}${a.type === 'lecture' ? '查看课件序列' : '查看对练剧本'} ›</a>`
            : `<span style="margin-left:auto;font-size:11px;color:var(--ink-4);font-style:italic">反思场域 · 无预览</span>`}
        </div>`).join('')
        : `<div style="padding:14px;font-size:12px;color:var(--ink-4);font-style:italic;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px">${ic('doc',13)}内容待 KGP 在 AOM 中编排（占位）</div>`;
      return `
        <div class="course-row expanded" data-id="${c.id}">
          <div class="course-row-head">
            <svg class="course-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            <span class="course-name">${escapeHtml(c.name)}</span>
            <span class="course-meta">${acts > 0 ? `${acts} Activity` : '占位'}</span>
          </div>
          <div class="course-acts">${actsHtml}</div>
        </div>`;
    }).join('');

    document.querySelectorAll('#courseTree .course-row').forEach(row => {
      row.querySelector('.course-row-head').addEventListener('click', () => row.classList.toggle('expanded'));
      row.querySelectorAll('.preview-link').forEach(link => {
        link.addEventListener('click', e => {
          e.stopPropagation();
          const aType = link.dataset.actType;
          const cId = link.dataset.cId, aId = link.dataset.aId;
          const c = M.coursePack.find(x => x.id === cId);
          const a = c?.activities.find(x => x.id === aId);
          if (aType === 'lecture') openLecturePreview(c, a);
          else if (aType === 'practice') openPracticePreview(c, a);
        });
      });
    });
  }

  // lecture preview · 含图含题（参 lecture 课件区）
  function openLecturePreview(c, a) {
    const pv = M.lecturePreview;
    const scoHtml = pv.sco.map(s => {
      let thumbHtml = '';
      if (s.type === 'SLICE' && s.asset) {
        thumbHtml = `<div class="lecture-sco-thumb">
          <span class="lecture-sco-thumb-type">SLICE</span>
          <span class="lecture-sco-thumb-n">${s.n}</span>
          <img src="${s.asset}" alt="" onerror="this.style.display='none'" />
        </div>`;
      } else if (s.type === 'VIDEO') {
        thumbHtml = `<div class="lecture-sco-thumb">
          <span class="lecture-sco-thumb-type">VIDEO${s.duration ? ' · '+Math.floor(s.duration/60)+':'+String(s.duration%60).padStart(2,'0') : ''}</span>
          <span class="lecture-sco-thumb-n">${s.n}</span>
          ${s.thumbnail ? `<img src="${s.thumbnail}" alt="" onerror="this.style.display='none'" />` : ''}
          <span class="lecture-sco-thumb-play">${Icons.play(56)}</span>
        </div>`;
      } else if (s.type === 'QUIZ') {
        thumbHtml = `<div class="lecture-sco-thumb">
          <span class="lecture-sco-thumb-type">QUIZ · ${s.quizType||''}</span>
          <span class="lecture-sco-thumb-n">${s.n}</span>
          ${s.thumbnail ? `<img src="${s.thumbnail}" alt="" onerror="this.style.display='none'" />` : ''}
        </div>`;
      } else if (s.type === 'FEEDBACK_COLLECT') {
        thumbHtml = `<div class="lecture-sco-thumb feedback">
          <span class="lecture-sco-thumb-type">FEEDBACK</span>
          <span class="lecture-sco-thumb-n">${s.n}</span>
          <span class="lecture-sco-thumb-fb-icon">${Icons.chat(64)}</span>
        </div>`;
      } else {
        thumbHtml = `<div class="lecture-sco-thumb"><span class="lecture-sco-thumb-type">${s.type}</span><span class="lecture-sco-thumb-n">${s.n}</span></div>`;
      }

      // QUIZ 题目展示
      let quizBody = '';
      if (s.type === 'QUIZ' && s.question) {
        quizBody = `
          <div class="lecture-sco-quiz">
            <div class="lecture-sco-quiz-q">${escapeHtml(s.question)}</div>
            <div class="lecture-sco-quiz-opts">
              ${s.options.map(o => `<div class="lecture-sco-quiz-opt ${(s.correct||[]).includes(o.key) ? 'correct' : ''}">${o.key}. ${escapeHtml(o.text)} ${(s.correct||[]).includes(o.key) ? Icons.check(11) : ''}</div>`).join('')}
            </div>
            ${s.neoFeedback?.correct ? `<div class="lecture-sco-quiz-feedback">${ic('bulb',12)}Neo 反馈（答对）：${escapeHtml(s.neoFeedback.correct)}</div>` : ''}
          </div>`;
      }

      return `
        <div class="lecture-sco">
          ${thumbHtml}
          <div class="lecture-sco-info">
            <div class="lecture-sco-title">${s.n}. ${escapeHtml(s.title)}</div>
            <div class="lecture-sco-goal">${ic('target',13)}${escapeHtml(s.goal)}</div>
            ${s.narration ? `<div class="lecture-sco-narration"><b>${ic('mic',13)}Neo 口播：</b>${escapeHtml(s.narration)}</div>` : ''}
            ${quizBody}
          </div>
        </div>`;
    }).join('');

    openModal(`
      <div class="modal-title">${ic('doc',18)}课件序列预览 · ${escapeHtml(a.name)}</div>
      <div class="modal-sub">${escapeHtml(c.name)} · ${pv.totalSCO} 个 SCO · 约 ${pv.totalMinutes} 分钟 · 仅查看（内容由 KGP 在 AOM 编排 · 所有 lecture 共用此预览数据）</div>
      <div class="lecture-preview-list">${scoHtml}</div>
      <div style="margin-top:12px;padding:8px 12px;background:var(--bg-soft);border-radius:6px;font-size:11px;color:var(--ink-3);text-align:center">${(window.BRANDING && window.BRANDING.disclaimerText) || '以上内容由 NeoLearning AI 生成，仅供参考'}</div>
      <div class="modal-actions">
        <button class="modal-btn primary" onclick="closeModal()">关闭</button>
      </div>
    `, { wide: true });
  }

  // practice preview · markdown 渲染器
  function openPracticePreview(c, a) {
    const pv = M.practicePreview;
    openModal(`
      <div class="modal-title">${ic('chat',18)}对练剧本预览 · ${escapeHtml(a.name)}</div>
      <div class="modal-sub">${escapeHtml(c.name)} · 仅查看（剧本由 KGP 在 AOM 编排 · 所有 practice 共用此剧本）</div>
      <div class="practice-md">${renderMarkdown(pv.markdown)}</div>
      <div style="margin-top:12px;padding:8px 12px;background:var(--bg-soft);border-radius:6px;font-size:11px;color:var(--ink-3);text-align:center">${(window.BRANDING && window.BRANDING.disclaimerText) || '以上内容由 NeoLearning AI 生成，仅供参考'}</div>
      <div class="modal-actions">
        <button class="modal-btn primary" onclick="closeModal()">关闭</button>
      </div>
    `, { wide: true });
  }

  // 简易 markdown 渲染器（H2/H3/段落/列表/blockquote/hr/代码/粗体/斜体/表格）
  function renderMarkdown(md) {
    if (!md) return '';
    const lines = md.split('\n');
    let html = '';
    let inUL = false, inOL = false, inTable = false, tableHeaderDone = false;
    function closeBlocks() {
      if (inUL) { html += '</ul>'; inUL = false; }
      if (inOL) { html += '</ol>'; inOL = false; }
      if (inTable) { html += '</tbody></table>'; inTable = false; tableHeaderDone = false; }
    }
    for (let line of lines) {
      // 表格
      if (/^\|.+\|/.test(line)) {
        const cells = line.split('|').slice(1, -1).map(c => c.trim());
        if (!inTable) {
          closeBlocks();
          inTable = true; tableHeaderDone = false;
          html += '<table><thead><tr>' + cells.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
          tableHeaderDone = true;
        } else if (tableHeaderDone && /^\|[-:\s|]+\|/.test(line)) {
          // 分隔行 跳过
        } else {
          html += '<tr>' + cells.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>';
        }
        continue;
      }
      if (line.match(/^---+$/)) { closeBlocks(); html += '<hr/>'; continue; }
      if (line.match(/^## /)) { closeBlocks(); html += `<h2>${inline(line.replace(/^## /, ''))}</h2>`; continue; }
      if (line.match(/^### /)) { closeBlocks(); html += `<h3>${inline(line.replace(/^### /, ''))}</h3>`; continue; }
      if (line.match(/^> /)) { closeBlocks(); html += `<blockquote>${inline(line.replace(/^> /, ''))}</blockquote>`; continue; }
      const ulMatch = line.match(/^[\-\*] (.+)/);
      if (ulMatch) {
        if (inOL) { html += '</ol>'; inOL = false; }
        if (!inUL) { html += '<ul>'; inUL = true; }
        html += `<li>${inline(ulMatch[1])}</li>`;
        continue;
      }
      const olMatch = line.match(/^\d+\. (.+)/);
      if (olMatch) {
        if (inUL) { html += '</ul>'; inUL = false; }
        if (!inOL) { html += '<ol>'; inOL = true; }
        html += `<li>${inline(olMatch[1])}</li>`;
        continue;
      }
      if (line.trim() === '') { closeBlocks(); continue; }
      closeBlocks();
      html += `<p>${inline(line)}</p>`;
    }
    closeBlocks();
    return html;

    function inline(s) {
      return s
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/_([^_]+)_/g, '<em>$1</em>');
    }
  }

  /* ==========  锚点 scroll spy · 滚动容器 .main · subbar 在 stage 第二行（不再 sticky 内嵌）  ==========  */
  function setupAnchorBar() {
    const links = document.querySelectorAll('.anchor-link');
    const scroller = document.querySelector('.main');
    links.forEach(l => l.addEventListener('click', e => {
      e.preventDefault();
      const id = 'sec-' + l.dataset.section;
      const el = $(id); if (!el || !scroller) return;
      scroller.scrollTo({ top: el.offsetTop - 24, behavior: 'smooth' });
    }));
    scroller?.addEventListener('scroll', () => {
      const sections = ['basics','timeline','members','reminders','branding','content'];
      const threshold = 80;  // 顶部 80px 内的 section 视为 active
      const scTop = scroller.getBoundingClientRect().top;
      let active = sections[0];
      sections.forEach(s => {
        const el = $('sec-' + s);
        if (el && el.getBoundingClientRect().top - scTop < threshold) active = s;
      });
      links.forEach(l => l.classList.toggle('active', l.dataset.section === active));
    });
    if (links.length) links[0].classList.add('active');
  }

  /* ==========  确认开营按钮  ========== */
  function getMissingFields() {
    const miss = [];
    if (!M.projectInfo.name) miss.push('项目名');
    if (!M.projectInfo.serviceCycle.end) miss.push('服务周期');
    if (!M.projectInfo.projectCycle.end) miss.push('项目周期');
    if (state.members.length < 1) miss.push('至少 1 名学员');
    const adminCount = state.members.filter(m => m.isAdmin).length;
    if (adminCount < 1) miss.push('至少 1 名管理员');
    return miss;
  }
  function updateLaunchButtonState() {
    if (!isPreLaunch()) return;
    const miss = getMissingFields();
    const btn = $('btnLaunch'); const meta = $('launchMeta');
    if (miss.length === 0) {
      btn.disabled = false;
      meta.innerHTML = `必填完整 ${Icons.check(13)} · 准备就绪 · 当前 <b>${state.members.length}</b> 名学员 / <b>${state.members.filter(m=>m.isAdmin).length}</b> 名管理员`;
      meta.className = 'launch-meta';
    } else {
      btn.disabled = true;
      meta.innerHTML = ic('warn',13) + '还需完成：' + miss.join(' / ');
      meta.className = 'launch-meta warn';
    }
  }
  function setupLaunchButton() {
    $('btnLaunch').addEventListener('click', () => {
      const miss = getMissingFields();
      if (miss.length > 0) { showToast('必填未全：' + miss.join(' / ')); return; }
      const adminCount = state.members.filter(m => m.isAdmin).length;
      openModal(`
        <div class="modal-title">${ic('warn',16)}确认开营</div>
        <div class="modal-body">
          <p><b>开营是不可逆动作</b>。点击确认后将触发：</p>
          <ul style="padding-left:20px;line-height:1.8">
            <li>所有账号开放登录（学员 + 管理员）</li>
            <li>统一发送系统消息通知所有人</li>
            <li>项目配置进入只读 + 变更管理态</li>
            <li>服务周期永久锁定</li>
          </ul>
          <p style="margin-top:12px;color:var(--ink-3);font-size:12px">学员：${state.members.length} 人 · 管理员：${adminCount} 人</p>
        </div>
        <div class="modal-actions">
          <button class="modal-btn" onclick="closeModal()">取消</button>
          <button class="modal-btn primary" onclick="closeModal();window.__procRespond('launch-confirm')">确认开营 · 不可逆</button>
        </div>
      `);
    });
  }

  /* ==========  其他 setup  ========== */
  function renderLogoPreview() {
    const wrap = $('logoPreview'); if (!wrap) return;
    if (state.logoDataUrl) {
      wrap.dataset.empty = 'false';
      wrap.innerHTML = `<img src="${state.logoDataUrl}" alt="Logo 预览" />`;
    } else {
      wrap.dataset.empty = 'true';
      wrap.innerHTML = `<span class="logo-preview-placeholder">默认 Logo</span>`;
    }
    // 同步 remove 按钮可见
    const removeBtn = $('btnRemoveLogo');
    if (removeBtn) {
      const editing = isEditing('branding');
      removeBtn.disabled = !editing || !state.logoDataUrl;
      removeBtn.style.display = (editing && state.logoDataUrl) ? '' : 'none';
    }
  }
  function setupBranding() {
    const fileInput = $('logoFileInput');
    $('btnUploadLogo').addEventListener('click', () => {
      if (!isEditing('branding')) return;
      fileInput.click();
    });
    fileInput.addEventListener('change', e => {
      const f = e.target.files[0]; if (!f) return;
      if (f.size > 2 * 1024 * 1024) { showToast('Logo 过大 · 限制 2MB'); fileInput.value = ''; return; }
      const reader = new FileReader();
      reader.onload = ev => {
        state.logoDataUrl = ev.target.result;
        $('logoStatus').textContent = `已选 · ${f.name} · ${(f.size/1024).toFixed(1)} KB`;
        renderLogoPreview();
        showToast('Logo 已上传 · 保存后生效');
      };
      reader.readAsDataURL(f);
      fileInput.value = '';  // 允许同名再选
    });
    $('btnRemoveLogo').addEventListener('click', () => {
      if (!isEditing('branding')) return;
      state.logoDataUrl = null;
      $('logoStatus').textContent = '默认睿学品牌 Logo · PNG / SVG / JPG · ≤ 2MB';
      renderLogoPreview();
    });
    // 初始：从 mock 读已存的 logoDataUrl（若有）
    if (M.branding && M.branding.logoDataUrl) state.logoDataUrl = M.branding.logoDataUrl;
    renderLogoPreview();
  }
  function setupMemberFilters() {
    $('memberSearch').addEventListener('input', e => { state.memberSearch = e.target.value; state.memberPage = 1; renderMembers(); });
    $('memberRoleFilter').addEventListener('change', e => { state.memberRoleFilter = e.target.value; state.memberPage = 1; renderMembers(); });
    $('btnAddMember').addEventListener('click', () => {
      if (!isEditing('members')) return;
      if (!isPreLaunch()) {
        const remainingSlots = state.members.filter(m => !m.hasFirstLogin).length === 0 ? 0 : 1;
        if (remainingSlots === 0) { showToast('总账号数已达上限'); return; }
      }
      openModal(`
        <div class="modal-title">+ 添加人员</div>
        <div class="modal-body">
          <div class="form-row" style="grid-template-columns:80px 1fr"><label class="form-label">姓名 *</label><input type="text" id="newMName" class="form-input" /></div>
          <div class="form-row" style="grid-template-columns:80px 1fr"><label class="form-label">账号</label><input type="text" id="newMAccount" class="form-input" placeholder="留空自动生成" /></div>
          <div class="form-row" style="grid-template-columns:80px 1fr"><label class="form-label">邮箱</label><input type="text" id="newMEmail" class="form-input" /></div>
          <div class="form-row" style="grid-template-columns:80px 1fr"><label class="form-label">部门</label><input type="text" id="newMDept" class="form-input" /></div>
          <div class="form-row" style="grid-template-columns:80px 1fr"><label class="form-label">角色</label><div><label><input type="checkbox" id="newMLearner" checked /> 学员</label> <label style="margin-left:14px"><input type="checkbox" id="newMAdmin" /> 管理员</label></div></div>
        </div>
        <div class="modal-actions">
          <button class="modal-btn" onclick="closeModal()">取消</button>
          <button class="modal-btn primary" onclick="window.__procAddMember()">添加</button>
        </div>
      `);
    });
    window.__procAddMember = function () {
      const name = $('newMName').value.trim();
      if (!name) { showToast('姓名必填'); return; }
      const account = $('newMAccount').value.trim() || ('user_' + Date.now().toString(36).slice(-4));
      const isLearner = $('newMLearner').checked;
      const isAdmin = $('newMAdmin').checked;
      if (!isLearner && !isAdmin) { showToast('至少选一个角色'); return; }
      state.members.push({ id: 'u-' + Date.now(), name, account, email: $('newMEmail').value.trim(), contact: '', dept: $('newMDept').value.trim(), level: '', isLearner, isAdmin, hasFirstLogin: false });
      closeModal();
      showToast('已添加 ' + name);
      renderMembers(); updateLaunchButtonState();
    };
    $('btnImportCSV').addEventListener('click', () => {
      if (!isEditing('members')) return;
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.csv,.xlsx';
      inp.onchange = e => {
        const f = e.target.files[0]; if (!f) return;
        showToast(`导入预览中 · ${f.name}（demo 模拟）`);
      };
      inp.click();
    });
  }

  function setupNav() {
    // v1.3 · sidenav 4 项 · 走 Router.go（reportmgt 仍 toast 因为 v1.4 才做）
    $('navHome').addEventListener('click', () => {
      if ($('navHome').classList.contains('disabled')) { showToast('开营前 Home 不可访问'); return; }
      tryNavigate(() => Router.go('mgthome'));
    });
    $('navReport').addEventListener('click', () => {
      if ($('navReport').classList.contains('disabled')) { showToast('开营前 Report 不可访问'); return; }
      tryNavigate(() => Router.go('reportcenter'));
    });
    $('navMessage').addEventListener('click', () => {
      if ($('navMessage').classList.contains('disabled')) { showToast('开营前 Message 不可访问'); return; }
      tryNavigate(() => Router.go('massagemgt'));
    });
    $('navConfig').addEventListener('click', () => {/* 已在当前页 */});
    // topbar 返回大厅（多角色才有意义；非多角色走 mgthome）· 走拦截
    const brand = $('topbarBrand');
    if (brand) {
      brand.addEventListener('click', () => {
        tryNavigate(() => Router.go('mgthome'));
      });
    }
  }

  /* ==========  v5/v1.3 · topbar 下拉 (bell + avatar) · 跨页 MessagesRead 单 store  ========== */
  function renderBell() {
    const list = $('msgList');
    const messages = M.bellMessages || [];
    const isUnread = m => (typeof MessagesRead !== 'undefined') ? !MessagesRead.isRead(m) : m.unread;
    list.innerHTML = messages.map((m, i) => `
      <div class="msg-row ${isUnread(m) ? 'unread' : ''}" data-i="${i}">
        <div class="msg-avatar-wrap ${m.type}">
          ${m.type === 'system' ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' :
            m.type === 'platform' ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' :
            escapeHtml((m.sender||'?').slice(0,1))}
        </div>
        <div class="msg-content">
          <div class="msg-head">
            <span class="msg-text">${escapeHtml(m.title)}</span>
            ${isUnread(m) ? '<span class="msg-dot-unread"></span>' : ''}
          </div>
          <div class="msg-sender">${escapeHtml(m.sender)} · ${escapeHtml(m.time)}</div>
          <div class="msg-desc">${escapeHtml(m.desc)}</div>
        </div>
      </div>`).join('');
    list.querySelectorAll('.msg-row').forEach(r => {
      r.addEventListener('click', e => {
        e.stopPropagation();
        r.classList.toggle('expanded');
        const i = +r.dataset.i;
        if (isUnread(messages[i])) {
          if (typeof MessagesRead !== 'undefined') MessagesRead.markRead(messages[i]);
          else messages[i].unread = false;
          renderBell();  // 重渲染 · unread class 同步
        }
      });
    });
    renderBellBadge();
  }
  function renderBellBadge() {
    const unread = (typeof MessagesRead !== 'undefined')
      ? MessagesRead.unreadCount('admin')
      : (M.bellMessages || []).filter(m => m.unread).length;
    const badge = $('bellBadge');
    if (!badge) return;
    if (unread > 0) { badge.style.display = ''; badge.textContent = unread; }
    else badge.style.display = 'none';
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
    // 多角色才能切端口（Session 优先）
    const canSwitch = sess
      ? (sess.role === 'learner+admin')
      : !!a.canSwitchPort;
    const sw = $('switchPort');
    if (sw && !canSwitch) {
      sw.classList.add('disabled');
      sw.title = '你只有管理员角色 · 多角色账号才能切换端口';
    }
  }
  function setupDropdowns() {
    const bellBtn = $('bellBtn'), bellDD = $('bellDropdown');
    const avBtn = $('avatarBtn'), avDD = $('avatarDropdown');
    function close() { bellDD?.classList.remove('open'); avDD?.classList.remove('open'); }
    bellBtn?.addEventListener('click', e => { e.stopPropagation(); avDD?.classList.remove('open'); bellDD?.classList.toggle('open'); });
    avBtn?.addEventListener('click', e => { e.stopPropagation(); bellDD?.classList.remove('open'); avDD?.classList.toggle('open'); });
    document.addEventListener('click', close);
    // 全部已读 · v1.3 走 MessagesRead 跨页单 store
    $('markAllRead')?.addEventListener('click', e => {
      e.stopPropagation();
      if (typeof MessagesRead !== 'undefined') MessagesRead.markAllReadFor('admin');
      else (M.bellMessages || []).forEach(m => m.unread = false);
      renderBell();
      showToast('已全部标为已读');
    });
    // 帮助
    $('openHelp')?.addEventListener('click', () => { avDD?.classList.remove('open'); showToast('帮助文档（demo 占位）'); });
    // v1.3 · 切换学员端 · Session.canSwitchPort + Router.go
    $('switchPort')?.addEventListener('click', () => {
      avDD?.classList.remove('open');
      // 优先走 Session（融合后 currentAdmin.canSwitchPort 与 Session.canSwitchPort 应一致）
      const canSwitch = (typeof Session !== 'undefined' && Session.canSwitchPort)
        ? Session.canSwitchPort()
        : !!(M.currentAdmin && M.currentAdmin.canSwitchPort);
      if (!canSwitch) { showToast('你只有管理员角色 · 不能切到学员端'); return; }
      tryNavigate(() => {
        openModal(`
          <div class="modal-title">切换到学员端</div>
          <div class="modal-body">
            <p>你将离开管理端，进入学员端 hall。</p>
            <p style="color:var(--ink-3);font-size:12px;margin-top:8px">多角色账号 · 切换后可随时切回管理端</p>
          </div>
          <div class="modal-actions">
            <button class="modal-btn" onclick="closeModal()">取消</button>
            <button class="modal-btn primary" onclick="closeModal();Router.go('hall')">确认切换</button>
          </div>`);
      });
    });
    // v1.3 · 退出登录 · Session.clear + Router.go
    $('logoutBtn')?.addEventListener('click', () => {
      avDD?.classList.remove('open');
      tryNavigate(() => {
        openModal(`
          <div class="modal-title">退出登录</div>
          <div class="modal-body">确定要退出当前账号吗？</div>
          <div class="modal-actions">
            <button class="modal-btn" onclick="closeModal()">取消</button>
            <button class="modal-btn primary" onclick="closeModal();Session.clear();Router.go('login')">确定退出</button>
          </div>`);
      });
    });
  }

  /* ==========  v5 · settings drawer  ========== */
  function setupSettingsDrawer() {
    $('openSettings')?.addEventListener('click', () => {
      $('avatarDropdown')?.classList.remove('open');
      $('settingsDrawer')?.classList.add('open');
    });
    $('settingsClose')?.addEventListener('click', () => $('settingsDrawer')?.classList.remove('open'));
    $('settingsDrawer')?.addEventListener('click', e => {
      if (e.target === $('settingsDrawer')) $('settingsDrawer').classList.remove('open');
    });
    // theme 按钮
    document.querySelectorAll('button[data-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.dataset.theme;
        document.documentElement.setAttribute('data-theme', t);
        try { localStorage.setItem('rx-theme', t); } catch {}
        document.querySelectorAll('button[data-theme]').forEach(b => b.classList.toggle('active', b === btn));
      });
    });
    // v1.3 · 语速 · 持久化 + 跨页同步（key: rx-speed · 与 hall/lecture/practice 同 key）
    document.querySelectorAll('button[data-speed]').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.speed;
        try { localStorage.setItem('rx-speed', v); } catch {}
        document.querySelectorAll('button[data-speed]').forEach(b => b.classList.toggle('active', b === btn));
      });
    });
    // v1.3 · Neo persona · 持久化 + 跨页同步（key: rx-persona）
    document.querySelectorAll('button[data-persona]').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.persona;
        try { localStorage.setItem('rx-persona', v); } catch {}
        document.querySelectorAll('button[data-persona]').forEach(b => b.classList.toggle('active', b === btn));
      });
    });
    // v1.3 · init from localStorage（theme + speed + persona）
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

  /* spec § 1 line 15 · 纯 GUI 模块（无 Ora）· 此处不渲染 Ora 答疑栏 */

  /* ==========  v9 · 离开提醒 · 平台 modal（参 lecture completion-modal 样式）  ========== */
  // 内部跳转拦截 · proceed = 决定离开后真正执行的回调
  function tryNavigate(proceed, opts) {
    if (state.editingSections.size === 0) { proceed(); return; }
    const list = Array.from(state.editingSections).map(s => SECTION_LABEL[s] || s);
    const reason = (opts && opts.reason) || '离开当前页面';  // 'reload' / 'leave' / etc
    const titleText = opts && opts.title ? opts.title : '有未保存的改动';
    const subText = opts && opts.sub ? opts.sub : `${reason}前请先处理以下 ${list.length} 个模块：`;
    const html = `
      <div class="completion-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <div class="completion-title">${escapeHtml(titleText)}</div>
      <div class="completion-sub">${escapeHtml(subText)}</div>
      <div class="completion-list">
        <div class="completion-list-title">未保存的模块</div>
        <ul>${list.map(n => `<li>${escapeHtml(n)}</li>`).join('')}</ul>
      </div>
      <div class="completion-actions">
        <button class="completion-btn primary" id="leaveSaveAll">全部保存后继续</button>
        <button class="completion-btn" id="leaveStay">继续编辑（取消）</button>
        <button class="completion-btn danger" id="leaveDiscard">放弃改动</button>
      </div>`;
    openModal(html);
    $('leaveStay').addEventListener('click', () => closeModal());
    $('leaveDiscard').addEventListener('click', () => {
      discardAllDirty();
      closeModal();
      proceed();
    });
    $('leaveSaveAll').addEventListener('click', () => {
      saveAllDirty();
      closeModal();
      proceed();
    });
  }

  // 拦键盘 reload (F5 / Ctrl+R / Cmd+R) → 走平台 modal · 不再用浏览器原生 prompt
  function setupReloadIntercept() {
    document.addEventListener('keydown', e => {
      const isReload = e.key === 'F5' || ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R'));
      if (!isReload) return;
      if (state.editingSections.size === 0) return;  // 无未保存改动 · 让浏览器正常 reload
      e.preventDefault();
      e.stopPropagation();
      tryNavigate(() => window.location.reload(), { reason: '重新加载', title: '重新加载页面？', sub: '重载会丢失以下未保存模块的改动：' });
    }, true);
  }

  /* ==========  Init  ========== */
  function init() {
    const q = new URL(location.href).searchParams.get('status');
    if (q === 'pre-launch') state.status = 'pre-launch';
    renderPwdDisplay();
    renderStatus();
    renderProjectMeta();
    renderTimeline();
    renderMilestones();
    renderMembers();
    renderReminders();
    renderBranding();
    renderCoursePack();

    // v5 · topbar 下拉 + drawer
    renderBell();
    renderAvatar();

    setupAnchorBar();
    setupEditButtons();
    setupTimelineUI();
    setupPwdControls();
    setupBranding();
    setupMemberFilters();
    setupLaunchButton();
    setupNav();
    setupDropdowns();
    setupSettingsDrawer();
    setupReloadIntercept();

    $('modalMask').addEventListener('click', e => { if (e.target === $('modalMask')) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    if (typeof Branding !== 'undefined') Branding.applyAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
