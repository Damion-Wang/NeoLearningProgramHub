/* ============================================================
   Recap · Application Logic
   ============================================================ */
(function () {
  'use strict';

  const M = window.RECAP_MOCK;
  if (!M) { console.error('RECAP_MOCK not loaded'); return; }

  const $ = id => document.getElementById(id);

  /* ========== STATE ========== */
  const state = {
    currentCourseId: 'CRS-001',     // 当前 Course (URL ?course=1 → CRS-001)
    walkStep: 0,                    // 0=未开始 / 1-5=Walk-through 对应块 / 6=完成
    recapEventTriggered: false,     // Activity 完成事件是否触发
    isFreeReviewMode: false,        // 自由复习态
    timerInterval: null,
    totalTime: 720,                  // 12 分钟初始（demo 演到完成 ≈ 14 分钟）
    // 防挂机（沿用 lecture / practice · demo 阈值 60s）
    idleTimer: null,
    idleThreshold: 60 * 1000,       // 60s（demo · prod 默认 5 分钟可在 program config 调整）
    lastActivityAt: Date.now(),
    settings: {
      persona: localStorage.getItem('rx-persona') || 'male',
      theme: localStorage.getItem('rx-theme') || 'light',
      speed: localStorage.getItem('rx-speed') || 'normal'
    }
  };

  // walkStep 断点续 · localStorage key
  function walkStepKey() { return 'rx-recap-walkStep-' + state.currentCourseId; }
  function saveWalkStep(n) { try { localStorage.setItem(walkStepKey(), String(n)); } catch (e) {} }
  function loadWalkStep() { try { return parseInt(localStorage.getItem(walkStepKey()) || '0', 10); } catch (e) { return 0; } }
  function clearWalkStep() { try { localStorage.removeItem(walkStepKey()); } catch (e) {} }

  /* ========== UTILITIES ========== */
  function showToast(msg, dur = 2200) {
    const t = $('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(t._timer); t._timer = setTimeout(() => t.classList.remove('show'), dur);
  }
  function openModal(html) {
    $('modalCard').innerHTML = html;
    $('modalMask').classList.add('open');
  }
  function closeModal() { $('modalMask').classList.remove('open'); }
  // v1.5.2 B-RECAP-SWITCH · 工程纪律 I · expose 让 inline onclick="closeModal()" 可调
  window.closeModal = closeModal;
  window.openModal = openModal;
  function fmtTime(s) { s = Math.max(0, Math.floor(s)); const m = Math.floor(s / 60), sec = s % 60; return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0'); }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  /* ========== AVATAR / GRADIENT ========== v1.5 P1 #9 · 接 _shared/js/avatar-color.js · 跨页 memberId 稳定一致 */
  function getGradFor(name) {
    return (typeof AvatarColor !== 'undefined') ? AvatarColor.forName(name) : ['#D97757', '#E89B6E'];
  }
  function renderAvatar() {
    const sess = (window.Session && window.Session.get) ? Session.get() : {};
    const [a, b] = (typeof AvatarColor !== 'undefined')
      ? AvatarColor.forMemberId(sess.memberId || M.learner.name)
      : ['#D97757', '#E89B6E'];
    $('avatarCircle').style.background = `linear-gradient(135deg,${a},${b})`;
    $('avatarCircle').textContent = M.learner.firstChar;
    $('avatarName').textContent = M.learner.name;
    $('adName').textContent = M.learner.name;
  }

  /* ========== MARKDOWN INLINE PARSER ========== */
  function inlineMd(s) {
    return String(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }
  function multilineMd(s) {
    return String(s).split('\n').map(line => inlineMd(line)).join('<br>');
  }

  /* ========== REPORT RENDERING ========== */
  function renderReport() {
    const r = M.report;
    const pane = $('reportPane');

    let html = '';

    // 报告头部 callout
    html += `<div class="recap-header-callout">
      <div class="recap-header-callout-line">
        <span class="recap-header-callout-icon">📌</span>
        <span class="recap-header-callout-text">${escapeHtml(M.report.headerCallout)}</span>
      </div>
    </div>`;

    // H1 标题
    html += `<h1>${escapeHtml(r.title)}</h1>`;

    // ① 内容锚点 (spec 模板 + 一根线 callout 微调)
    html += `<h2 id="${r.block1.anchor}" data-block="1">① ${escapeHtml(r.block1.title)}</h2>`;
    html += renderParagraphs(r.block1.content);
    if (r.block1.pinSummary) {
      html += `<div class="recap-pin-summary">💡 ${inlineMd(r.block1.pinSummary)}</div>`;
    }

    // ② 走过的轨迹 · 场景应用迁移（学员主战场 · 3 个核心工具卡片化）
    html += `<h2 id="${r.block2.anchor}" data-block="2">② ${escapeHtml(r.block2.title)}</h2>`;
    html += `<p>${inlineMd(r.block2.intro)}</p>`;
    r.block2.transferableSkills.forEach(skill => {
      html += `<div class="recap-skill-card">
        <div class="recap-skill-head">
          <span class="recap-skill-icon">${skill.icon}</span>
          <span class="recap-skill-name">${escapeHtml(skill.name)}</span>
          <span class="recap-skill-formula">${escapeHtml(skill.formula)}</span>
        </div>
        <div class="recap-skill-row">
          <span class="recap-skill-label">适用场景</span>
          <div class="recap-skill-text">${inlineMd(skill.applicableScenario)}</div>
        </div>
        <div class="recap-skill-row">
          <span class="recap-skill-label">怎么用</span>
          <div class="recap-skill-text">
            ${(skill.yourApplication || []).map(line => `<div>${inlineMd(line)}</div>`).join('')}
          </div>
        </div>`;
      if (skill.contrast) {
        html += `<div class="recap-skill-row contrast">
          <span class="recap-skill-label">课前/现在</span>
          <div class="recap-skill-text">${inlineMd(skill.contrast)}</div>
        </div>`;
      }
      html += `<div class="recap-skill-source">${inlineMd(skill.courseSource)}</div>
      </div>`;
    });
    if (r.block2.closingHint) {
      html += `<div class="recap-skill-closing">${inlineMd(r.block2.closingHint)}</div>`;
    }

    // ③ 6 维画像 · 简化（学员反感"被评判"· 雷达 + 一句简短总结）
    html += `<h2 id="${r.block3.anchor}" data-block="3">③ ${escapeHtml(r.block3.title)}</h2>`;
    html += `<p class="recap-portrait-brief-intro">${inlineMd(r.block3.briefIntro)}</p>`;
    html += buildRadarChart(r.block3.radar);
    html += `<p class="recap-portrait-brief-summary">${inlineMd(r.block3.briefSummary)}</p>`;

    // ④ 待办任务 · 报告里列出 3 条 + chat 卡片平行（列不列是我的事·收不收藏由你）
    html += `<h2 id="${r.block4.anchor}" data-block="4">④ ${escapeHtml(r.block4.title)}</h2>`;
    html += `<p>${inlineMd(r.block4.intro)}</p>`;
    html += `<ol class="recap-tasks-list">`;
    r.block4.tasks.forEach(t => {
      html += `<li><span class="recap-task-tag">${escapeHtml(t.tag)}</span> ${inlineMd(t.text)}</li>`;
    });
    html += `</ol>`;
    if (r.block4.chatHint) {
      html += `<div class="recap-task-chat-note">${inlineMd(r.block4.chatHint)}</div>`;
    }

    pane.innerHTML = html;
  }

  function renderParagraphs(text) {
    return text.split(/\n\n+/).map(p => `<p>${multilineMd(p)}</p>`).join('');
  }

  function buildBarChart(chart) {
    let html = `<div class="recap-chart">
      <div class="recap-chart-label">📊 互动行为对比 · 全类型互动总数</div>`;
    chart.bars.forEach(bar => {
      const pct = (bar.value / chart.max * 100).toFixed(1);
      html += `<div class="recap-bar-row">
        <div class="recap-bar-label">${escapeHtml(bar.label)}</div>
        <div class="recap-bar-track"><div class="recap-bar-fill" style="width:${pct}%"></div></div>
        <div class="recap-bar-value">${bar.value}</div>
      </div>`;
    });
    html += `</div>`;
    return html;
  }

  // 6 维雷达图 SVG · 双层（之前 vs 当前）+ 维度文字标签 + 同心层
  function buildRadarChart(dims) {
    const cx = 140, cy = 140, r = 100, max = 5;
    const n = dims.length;
    function pointFor(idx, value) {
      const ang = -Math.PI / 2 + (Math.PI * 2 * idx) / n;
      const ratio = value / max;
      return [cx + Math.cos(ang) * r * ratio, cy + Math.sin(ang) * r * ratio];
    }
    // 同心 5 层背景
    let layers = '';
    for (let i = 1; i <= 5; i++) {
      const lp = dims.map((_, j) => {
        const ang = -Math.PI / 2 + (Math.PI * 2 * j) / n;
        const px = cx + Math.cos(ang) * r * (i / 5);
        const py = cy + Math.sin(ang) * r * (i / 5);
        return `${px.toFixed(1)},${py.toFixed(1)}`;
      }).join(' ');
      layers += `<polygon points="${lp}" fill="none" stroke="var(--hairline)" stroke-width="1"/>`;
    }
    // 6 条径向轴
    let axes = '';
    dims.forEach((_, j) => {
      const ang = -Math.PI / 2 + (Math.PI * 2 * j) / n;
      const px = cx + Math.cos(ang) * r;
      const py = cy + Math.sin(ang) * r;
      axes += `<line x1="${cx}" y1="${cy}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="var(--hairline)" stroke-width="1"/>`;
    });
    // 之前（外圈淡色 polygon）
    const prevPoints = dims.map((d, i) => pointFor(i, d.prev).map(v => v.toFixed(1)).join(',')).join(' ');
    // 当前（内圈实心 polygon）
    const currPoints = dims.map((d, i) => pointFor(i, d.current).map(v => v.toFixed(1)).join(',')).join(' ');
    // 维度标签
    let labels = '';
    dims.forEach((d, j) => {
      const ang = -Math.PI / 2 + (Math.PI * 2 * j) / n;
      const lr = r + 18;
      const lx = cx + Math.cos(ang) * lr;
      const ly = cy + Math.sin(ang) * lr;
      const anchor = Math.abs(Math.cos(ang)) < 0.3 ? 'middle' : (Math.cos(ang) > 0 ? 'start' : 'end');
      labels += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" font-size="11" fill="var(--ink-2)" font-weight="500">${escapeHtml(d.dim)}</text>`;
    });
    // 顶点圆点（仅当前）
    let dots = '';
    dims.forEach((d, i) => {
      const [px, py] = pointFor(i, d.current);
      dots += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3.5" fill="var(--accent)"/>`;
    });

    // legend 文字（每维 prev → current · L1-L5 等级 · 有变化的高亮）
    let legendHtml = '';
    dims.forEach(d => {
      const changed = d.prev !== d.current;
      const arrow = changed ? '↑' : '·';
      const cls = changed ? 'changed' : '';
      const meta = changed ? `L${d.prev} → L${d.current} ${arrow}` : `L${d.current}（无变化）`;
      legendHtml += `<div class="recap-radar-legend-row ${cls}">
        <span style="flex:1">${escapeHtml(d.dim)}</span>
        <span style="color:${changed ? 'var(--accent)' : 'var(--ink-3)'};font-feature-settings:'tnum';font-weight:${changed ? 600 : 400}">${meta}</span>
      </div>`;
    });

    return `<div class="recap-radar">
      <svg class="recap-radar-svg" viewBox="0 0 280 280">
        ${layers}
        ${axes}
        <polygon points="${prevPoints}" fill="rgba(var(--accent-rgb),0.10)" stroke="rgba(var(--accent-rgb),0.40)" stroke-width="1.2" stroke-dasharray="3 3"/>
        <polygon points="${currPoints}" fill="rgba(var(--accent-rgb),0.30)" stroke="var(--accent)" stroke-width="2"/>
        ${dots}
        ${labels}
      </svg>
      <div class="recap-radar-legend">
        <div class="recap-radar-legend-row" style="font-size:11px;color:var(--ink-3);margin-bottom:4px">
          <span class="recap-radar-legend-dot prev"></span>本课前
          <span class="recap-radar-legend-dot curr" style="margin-left:14px"></span>本课后
        </div>
        ${legendHtml}
      </div>
    </div>`;
  }

  /* ========== LECTURE DRAWER · Tab1 锚点 / Tab2 Project 目录 ========== */
  // 报告锚点 panel 已删除（user 决议 · 抽屉只留 Project 目录）· 函数 no-op 防遗留调用报错
  function renderLDAnchor() {
    const panel = $('ldPanelAnchor');
    if (!panel) return;
    // legacy fallback · 实际不会走到（panel 已不存在于 DOM）
  }

  function renderLDProject() {
    const panel = $('ldPanelProject');
    let html = '';
    // v1.5 P3 · 4 态：完成 ✓ / 当前 ▶ / 进行 ◐ / 锁定 🔒 / 未开始 空白
    M.courseTree.forEach(c => {
      html += `<div class="ld-course" data-course="${c.id}">
        <div class="ld-course-head">
          <svg class="chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          ${escapeHtml(c.name)}
        </div>
        <div class="ld-course-list">`;
      c.activities.forEach(a => {
        const isCurrent = a.id === M.activity.id;
        const isLocked = a.status === 'locked';
        const isCompleted = a.status === 'completed';
        const isProgress = a.status === 'in_progress' && !isCurrent;
        let cls = '';
        if (isCurrent) cls = ' current';
        else if (isLocked) cls = ' disabled';
        let iconChar = '', iconCls = '';
        if (isCurrent)        { iconChar = '▶'; iconCls = 'current'; }
        else if (isCompleted) { iconChar = '✓'; iconCls = 'completed'; }
        else if (isProgress)  { iconChar = '◐'; iconCls = 'progress'; }
        else if (isLocked)    { iconChar = '🔒'; iconCls = 'locked'; }
        html += `<div class="ld-activity${cls}" data-activity="${a.id}" data-type="${a.type}" data-name="${escapeHtml(a.name)}" data-status="${a.status}">
          <div class="ld-status-icon ${iconCls}">${iconChar}</div>
          <div>${escapeHtml(a.name)}</div>
        </div>`;
      });
      html += '</div></div>';
    });
    panel.innerHTML = html;
    panel.querySelectorAll('.ld-course').forEach(el => {
      el.querySelector('.ld-course-head').addEventListener('click', () => el.classList.toggle('collapsed'));
    });
    panel.querySelectorAll('.ld-activity').forEach(el => el.addEventListener('click', () => {
      if (el.classList.contains('disabled') || el.dataset.status === 'locked') {
        // v1.5.1 B13 · toast 加具体前置 Activity 名
        const aid = el.dataset.activity;
        const flat = (window.CoursePack && window.CoursePack.activities) || [];
        const act = flat.find(a => a.id === aid);
        const deps = act?.relatedActivities || [];
        const depNames = deps.map(d => flat.find(a => a.id === d)?.title || d).join(' / ');
        showToast(depNames ? `需先完成：${depNames}` : '该 Activity 暂未解锁'); return;
      }
      if (el.classList.contains('current')) { closeLectureDrawer(); return; }
      const type = el.dataset.type;
      const name = el.dataset.name || 'Activity';
      const activityId = el.dataset.activity;
      const TARGET_BY_TYPE = { lecture: 'lecture-ppt', practice: 'practice-intro', recap: 'recap' };
      const target = TARGET_BY_TYPE[type];
      if (!target) { showToast('该 Activity 暂未开放'); return; }
      closeLectureDrawer();
      if (typeof Jumper !== 'undefined' && Jumper.confirmAndJump) {
        Jumper.confirmAndJump(name, target, { activityId, from: 'recap' });
      }
    }));
  }

  /* ========== BELL ========== */
  function renderBell() {
    let html = '';
    M.bellMessages.forEach(msg => {
      const avatar = msg.type === 'platform'
        ? `<div class="msg-avatar-wrap platform"><img src="assets/logo.png" alt=""></div>`
        : msg.type === 'system'
          ? `<div class="msg-avatar-wrap system"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>`
          : (() => { const [a, b] = getGradFor(msg.sender); return `<div class="msg-avatar-wrap user" style="background:linear-gradient(135deg,${a},${b})">${msg.avatarChar || msg.sender.charAt(0)}</div>`; })();
      html += `<div class="msg-row${msg.unread ? ' expanded' : ''}">
        ${avatar}
        <div class="msg-content">
          <div class="msg-head">
            <span class="msg-text">${escapeHtml(msg.title)}</span>
            ${msg.unread ? '<span class="msg-dot-unread"></span>' : ''}
          </div>
          <div class="msg-desc">${escapeHtml(msg.desc)}</div>
          <div class="msg-time"><span class="msg-sender">${escapeHtml(msg.sender)}</span> · ${escapeHtml(msg.time)}</div>
        </div>
      </div>`;
    });
    $('msgList').innerHTML = html;
    $('msgList').querySelectorAll('.msg-row').forEach(r => {
      r.addEventListener('click', () => r.classList.toggle('expanded'));
    });
  }

  /* ========== NEO CHAT ========== */
  function neoAvatarHTML() { return `<div class="msg-avatar"><img src="assets/neo-${state.settings.persona}.png" alt="Neo" /></div>`; }
  function userAvatarHTML() {
    // v1.5 P1 #9 · 用 memberId 稳定 hash 跨页一致
    const sess = (window.Session && window.Session.get) ? Session.get() : {};
    const [a, b] = (typeof AvatarColor !== 'undefined')
      ? AvatarColor.forMemberId(sess.memberId || M.learner.name)
      : ['#D97757', '#E89B6E'];
    return `<div class="msg-avatar user-letter" style="background:linear-gradient(135deg,${a},${b})">${M.learner.firstChar}</div>`;
  }

  function appendNeoMsg(text) {
    const stream = $('neoStream');
    const html = `<div class="msg neo">${neoAvatarHTML()}<div class="msg-body"><div class="msg-bubble">${escapeHtml(text)}</div><div class="msg-actions"><button class="msg-action" data-vote="up" title="点赞"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg></button><button class="msg-action" data-vote="down" title="点踩"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zM17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg></button><button class="msg-action" data-act="comment" title="评论"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></button></div></div></div>`;
    stream.insertAdjacentHTML('beforeend', html);
    stream.scrollTop = stream.scrollHeight;
    // v1.5.2 F-NEO-BREATHE · 头像呼吸 · 按消息字数估算 TTS 时长
    if (typeof window.neoStartSpeaking === 'function' && window.neoEstimateSpeakDuration) {
      window.neoStartSpeaking(window.neoEstimateSpeakDuration(text));
    }
  }
  function appendUserMsg(text) {
    const stream = $('neoStream');
    stream.insertAdjacentHTML('beforeend', `<div class="msg user">${userAvatarHTML()}<div class="msg-body"><div class="msg-bubble">${escapeHtml(text)}</div></div></div>`);
    stream.scrollTop = stream.scrollHeight;
  }

  function appendTaskCard(card) {
    const stream = $('neoStream');
    const id = 'tc-' + Date.now() + Math.random();
    const html = `<div class="neo-card task-card" data-card-id="${id}">
      <span class="neo-card-tag">${escapeHtml(card.tag)}</span>
      <div class="neo-card-title">${escapeHtml(card.title)}</div>
      <div class="neo-card-body">${escapeHtml(card.body)}</div>
      <div class="neo-card-meta">${escapeHtml(card.meta)}</div>
      <div class="neo-card-actions">
        <button class="neo-card-btn primary" data-act="add">⭐ 加入待办</button>
        <button class="neo-card-btn" data-act="ignore">暂不</button>
      </div>
    </div>`;
    stream.insertAdjacentHTML('beforeend', html);
    stream.scrollTop = stream.scrollHeight;
    const cardEl = stream.querySelector(`[data-card-id="${id}"]`);
    cardEl.querySelector('[data-act="add"]').addEventListener('click', () => collectTask(cardEl, card));
    cardEl.querySelector('[data-act="ignore"]').addEventListener('click', () => {
      cardEl.classList.add('collected');
      cardEl.style.opacity = '.4';
      cardEl.querySelector('.neo-card-actions').style.display = 'none';
    });
  }

  function collectTask(cardEl, card) {
    // 飞向 Topbar 头像动画
    const rect = cardEl.getBoundingClientRect();
    const target = $('avatarCircle').getBoundingClientRect();
    const fly = document.createElement('div');
    fly.className = 'task-flying';
    fly.style.left = rect.left + 'px';
    fly.style.top = rect.top + 'px';
    fly.style.width = rect.width + 'px';
    fly.style.height = rect.height + 'px';
    fly.innerHTML = cardEl.outerHTML;
    document.body.appendChild(fly);
    cardEl.classList.add('collected');
    requestAnimationFrame(() => {
      fly.style.left = target.left + 'px';
      fly.style.top = target.top + 'px';
      fly.style.width = target.width + 'px';
      fly.style.height = target.height + 'px';
      fly.style.opacity = '0';
      fly.style.transform = 'scale(.2)';
    });
    setTimeout(() => { fly.remove(); showToast('已加入大厅待办'); }, 700);
  }

  /* ========== WALK-THROUGH ========== */
  function triggerWalkStep(n) {
    const wt = M.walkthrough[n - 1];
    if (!wt) return;
    state.walkStep = n;
    // 断点续暂时禁用 · demo 优先 · 每次进入从 step 1 走全流程
    // 推 Neo intro 消息（进入这块的开场+解读）
    appendNeoMsg(wt.intro || wt.neoText);
    // 滚到锚点
    const anchorEl = document.getElementById(`anchor-${wt.anchorIdx}`);
    if (anchorEl) anchorEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // 高亮当前块标题
    document.querySelectorAll('.md-pane h2').forEach(h => {
      h.classList.remove('walk-current', 'walk-done');
      const block = parseInt(h.dataset.block);
      if (block && block < n) h.classList.add('walk-done');
      if (block === n) h.classList.add('walk-current');
    });
    // 同步 Tab1 锚点高亮
    renderLDAnchor();
    // step 4 → 收尾流程（待办在 ④ · 步数从 5 减到 4）
    if (n === 4) {
      setTimeout(pushTaskCardsAndComplete, 1500);
    }
  }

  // ★ 重进时从中断点续 walk-through（spec § 1.7.3）
  function resumeWalkthrough(savedStep) {
    if (savedStep < 1 || savedStep > 4) return false;  // 0=未开始 / 5=已完成时不续
    // 把已经走过的步骤的 done 标记 / 抽屉锚点同步上去
    state.walkStep = savedStep;
    document.querySelectorAll('.md-pane h2').forEach(h => {
      const block = parseInt(h.dataset.block);
      if (block && block <= savedStep) h.classList.add('walk-done');
    });
    renderLDAnchor();
    showToast(`已从第 ${savedStep + 1} 步继续（上次走到 ${savedStep}）`, 2400);
    setTimeout(() => triggerWalkStep(savedStep + 1), 800);
    return true;
  }

  function pushTaskCardsAndComplete() {
    // 3 张 task card 错峰 800ms 推到 Neo Chat
    M.taskCards.forEach((card, i) => {
      setTimeout(() => appendTaskCard(card), i * 800);
    });
    // 推完后 1500ms 弹完成 Modal
    setTimeout(showCompletionModal, M.taskCards.length * 800 + 1500);
  }

  function showCompletionModal() {
    state.recapEventTriggered = true;
    clearWalkStep();  // 仍清一次 · 防止历史 localStorage 残留
    const cm = M.completionModal;
    const html = `
      <div class="completion-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="completion-title">${escapeHtml(cm.title)}</div>
      <div class="completion-sub">${escapeHtml(cm.sub)}</div>
      <div class="completion-applied">${escapeHtml(cm.appliedNote)}</div>
      <div class="completion-stats">
        <div><span class="completion-stat-label">学习时长</span><span class="completion-stat-value">${escapeHtml(cm.duration)}</span></div>
        <div><span class="completion-stat-label">互动次数</span><span class="completion-stat-value">${escapeHtml(cm.interactionCount)}</span></div>
      </div>
      <div class="completion-actions">
        <!-- v1.5.2 B20 · 三按钮全 primary · 三路径都已实装 -->
        <button class="completion-btn primary" id="btnBackToHall">${escapeHtml(cm.backToHallText)}</button>
        <button class="completion-btn primary" id="btnFreeReview">${escapeHtml(cm.primaryCta)}</button>
        <button class="completion-btn primary" id="btnNextActivity">${escapeHtml(cm.nextActivityText)}</button>
      </div>
    `;
    openModal(html);
    $('btnFreeReview').addEventListener('click', enterFreeReview);
    $('btnBackToHall').addEventListener('click', () => {
      closeModal();
      Router.go('hall');
    });
    $('btnNextActivity').addEventListener('click', () => {
      closeModal();
      // v1.5.2 B-NEXT-ACT · 已是用户主动确认 · 直接跳无二次确认
      const cp = window.COURSE_PACK || [];
      const flat = [];
      cp.forEach(c => c.activities.forEach(a => flat.push({ courseId: c.id, ...a })));
      const curIdx = flat.findIndex(a => a.id === M.activity.id);
      const next = curIdx >= 0 && curIdx < flat.length - 1 ? flat[curIdx + 1] : null;
      if (!next) { showToast('已是最后一个 Activity'); return; }
      const TARGET_BY_TYPE = { lecture: 'lecture-ppt', practice: 'practice-intro', recap: 'recap' };
      const target = TARGET_BY_TYPE[next.type] || 'hall';
      Router.go(target, { activityId: next.id, from: 'recap' });
    });
  }

  function enterFreeReview() {
    closeModal();
    state.isFreeReviewMode = true;
    showToast('已进入自由复习');
    // demo 收尾观察 + 自由复习态行为（spec § 1.4.2 · § 1.8.2）
    setTimeout(() => appendNeoMsg(M.closingNeoMsg), 600);
    // demo 演示 = 默认无更新（复习态被动答疑）· 不主动开场
    // 如要演回访态可改 hasUpdate=true 触发 revisitMode 主动开场 + 推高光卡
    const fr = M.freeReviewMode;
    if (fr && fr.defaultHasUpdate && fr.revisitMode) {
      setTimeout(() => appendNeoMsg(fr.revisitMode.openMsg), 1800);
      setTimeout(() => appendNeoMsg(fr.revisitMode.followupMsg), 3500);
      if (fr.revisitMode.pushHighlightCard) {
        setTimeout(() => appendRecapHighlightCard(fr.revisitMode.pushHighlightCard), 4500);
      }
    }
    // 复习态 = 不主动开场 · 学员输入触发 fallback QA 关键词匹配
  }

  /* ========== INPUT ========== */
  function setupNeoInput() {
    const ti = $('neoInput');
    ti.addEventListener('input', () => { ti.style.height = 'auto'; ti.style.height = Math.min(140, ti.scrollHeight) + 'px'; });
    ti.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendNeoInput(); } });
    $('neoSend').addEventListener('click', sendNeoInput);
    // Neo 消息 3 按钮（同 lecture / practice）
    $('neoStream').addEventListener('click', e => {
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
  function sendNeoInput() {
    if ($('modalMask').classList.contains('open')) return;
    const ti = $('neoInput');
    const text = ti.value.trim(); if (!text) return;
    appendUserMsg(text); ti.value = ''; ti.style.height = 'auto';
    // Walk-through 推进 · 先推当前步的 ack 解读 + 700ms 后再 trigger 下一步 intro（4 步制）
    if (state.walkStep >= 1 && state.walkStep < 4) {
      const wt = M.walkthrough[state.walkStep - 1];
      if (wt && wt.ack) {
        setTimeout(() => appendNeoMsg(wt.ack), 600);
        setTimeout(() => triggerWalkStep(state.walkStep + 1), 2200);
      } else {
        setTimeout(() => triggerWalkStep(state.walkStep + 1), 600);
      }
    } else if (state.recapEventTriggered && state.isFreeReviewMode) {
      // 自由复习态：先尝试关键词匹配 fallback Q&A · 命中则推 Neo 答案 + 可选卡片
      const matched = matchFallbackQA(text);
      if (matched) {
        setTimeout(() => {
          appendNeoMsg(matched.response);
          if (matched.pushKnowledgeCard) appendKnowledgeCard(matched.pushKnowledgeCard);
        }, 700);
      } else {
        setTimeout(() => appendNeoMsg(M.freeReviewMode.reviewMode.defaultAnswer), 700);
      }
    }
  }

  // 关键词匹配 fallback QA（demo 用 · spec 中由 LLM 处理）
  function matchFallbackQA(text) {
    if (!M.neoFallbackQA) return null;
    const lowered = text.toLowerCase();
    for (const qa of M.neoFallbackQA) {
      for (const kw of qa.keywords) {
        if (text.includes(kw) || lowered.includes(kw.toLowerCase())) return qa;
      }
    }
    return null;
  }

  // 推送 Neo 知识卡片（学员问"再讲一遍 X" 时触发）
  function appendKnowledgeCard(card) {
    const stream = $('neoStream');
    const html = `<div class="neo-card knowledge-card">
      <span class="neo-card-tag">📚 知识卡片</span>
      <div class="neo-card-title">${escapeHtml(card.title)}</div>
      <div class="neo-card-body">${escapeHtml(card.body)}</div>
      ${card.meta ? `<div class="neo-card-meta">${escapeHtml(card.meta)}</div>` : ''}
    </div>`;
    stream.insertAdjacentHTML('beforeend', html);
    stream.scrollTop = stream.scrollHeight;
  }

  // 推送 Neo 高光卡片（自由复习回访态识别新顿悟时触发）
  function appendRecapHighlightCard(card) {
    const stream = $('neoStream');
    const id = 'h-' + Date.now() + Math.random();
    const html = `<div class="neo-card highlight-card" data-card-id="${id}">
      <span class="neo-card-tag">🌟 高光时刻</span>
      <div class="neo-card-title">${escapeHtml(card.title)}</div>
      <div class="neo-card-quote">${escapeHtml(card.quote)}</div>
      <div class="neo-card-neo-note">${escapeHtml(card.neoNote)}</div>
      <div class="neo-card-meta">${escapeHtml(card.meta)}</div>
      <div class="neo-card-actions">
        <button class="neo-card-btn primary" data-act="collect">⭐ 收藏</button>
        <button class="neo-card-btn" data-act="ignore">忽略</button>
      </div>
    </div>`;
    stream.insertAdjacentHTML('beforeend', html);
    stream.scrollTop = stream.scrollHeight;
    const cardEl = stream.querySelector(`[data-card-id="${id}"]`);
    cardEl.querySelector('[data-act="ignore"]').addEventListener('click', () => {
      cardEl.style.opacity = '.4';
      cardEl.querySelector('.neo-card-actions').style.display = 'none';
    });
    cardEl.querySelector('[data-act="collect"]').addEventListener('click', () => {
      cardEl.classList.add('collected');
      showToast('已加入大厅高光区');
    });
  }

  /* ========== UI SETUP ========== */
  // recap 抽屉简化：仅 1 个 panel · 不需要 tab 切换
  function closeLectureDrawer() {
    $('lectureDrawerMask').classList.remove('open');
    $('lectureDrawer').classList.remove('open');
  }
  function setupLectureDrawer() {
    $('lectureDrawerBtn').addEventListener('click', () => {
      $('lectureDrawerMask').classList.add('open');
      $('lectureDrawer').classList.add('open');
    });
    $('lectureDrawerClose').addEventListener('click', closeLectureDrawer);
    $('lectureDrawerMask').addEventListener('click', closeLectureDrawer);
  }

  function setupDropdowns() {
    function close() { $('bellDropdown').classList.remove('open'); $('avatarDropdown').classList.remove('open'); }
    $('bellBtn').addEventListener('click', e => { e.stopPropagation(); $('avatarDropdown').classList.remove('open'); $('bellDropdown').classList.toggle('open'); });
    $('avatarBtn').addEventListener('click', e => { e.stopPropagation(); $('bellDropdown').classList.remove('open'); $('avatarDropdown').classList.toggle('open'); });
    document.addEventListener('click', close);
    $('bellDropdown').addEventListener('click', e => e.stopPropagation());
    $('avatarDropdown').addEventListener('click', e => e.stopPropagation());
    $('markAllRead').addEventListener('click', () => {
      document.querySelectorAll('.msg-dot-unread').forEach(d => d.remove());
      showToast('已全部标记为已读');
    });
    $('logoutBtn').addEventListener('click', () => showToast('已退出登录'));
    $('openHelp').addEventListener('click', () => showToast('帮助中心建设中'));
    $('openSettings').addEventListener('click', () => {
      close();
      $('settingsDrawerMask').classList.add('open');
      $('settingsDrawer').classList.add('open');
    });
  }

  function setupSettingsDrawer() {
    function close() { $('settingsDrawerMask').classList.remove('open'); $('settingsDrawer').classList.remove('open'); }
    $('settingsClose').addEventListener('click', close);
    $('settingsDrawerMask').addEventListener('click', e => { if (e.target === $('settingsDrawerMask')) close(); });
    // Persona
    document.querySelectorAll('[data-persona]').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('[data-persona]').forEach(e => e.classList.remove('active'));
      b.classList.add('active');
      state.settings.persona = b.dataset.persona;
      localStorage.setItem('rx-persona', state.settings.persona);
      $('neoAvatar').src = `assets/neo-${state.settings.persona}.png`;
    }));
    // Theme
    document.querySelectorAll('[data-theme]').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('[data-theme]').forEach(e => e.classList.remove('active'));
      b.classList.add('active');
      state.settings.theme = b.dataset.theme;
      localStorage.setItem('rx-theme', state.settings.theme);
      document.documentElement.setAttribute('data-theme', state.settings.theme);
    }));
    // Speed
    document.querySelectorAll('[data-speed]').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('[data-speed]').forEach(e => e.classList.remove('active'));
      b.classList.add('active');
      state.settings.speed = b.dataset.speed;
      localStorage.setItem('rx-speed', state.settings.speed);
    }));
    // 初始化 active 状态
    document.querySelector(`[data-persona="${state.settings.persona}"]`)?.classList.add('active');
    document.querySelectorAll('[data-persona]').forEach(b => b.classList.toggle('active', b.dataset.persona === state.settings.persona));
    document.querySelectorAll('[data-theme]').forEach(b => b.classList.toggle('active', b.dataset.theme === state.settings.theme));
    document.querySelectorAll('[data-speed]').forEach(b => b.classList.toggle('active', b.dataset.speed === state.settings.speed));
  }

  function setupNoteFloat() {
    function close() { $('notePanel').classList.remove('open'); }
    $('noteFloat').addEventListener('click', () => {
      const open = $('notePanel').classList.toggle('open');
      if (open) positionPanel();
    });
    $('noteClose').addEventListener('click', close);
    $('noteArchive').addEventListener('click', () => {
      const t = $('noteBody').textContent.trim();
      if (!t) { showToast('笔记是空的'); return; }
      $('noteBody').textContent = '';
      close();
      showToast('已归档到笔记库');
    });
    $('noteBody').addEventListener('input', () => {
      const len = $('noteBody').textContent.length;
      $('noteCounter').textContent = `${len} / 500`;
    });
    function positionPanel() {
      const f = $('noteFloat').getBoundingClientRect();
      const p = $('notePanel');
      p.style.left = (f.right + 12) + 'px';
      p.style.bottom = (window.innerHeight - f.bottom) + 'px';
    }
  }

  function setupNeoCollapse() { $('neoCollapse').addEventListener('click', () => $('neoChat').classList.toggle('collapsed')); }
  function setupNeoResize() {
    const handle = $('neoResize');
    let dragging = false, startX = 0, startW = 380;
    handle.addEventListener('mousedown', e => {
      dragging = true; startX = e.clientX;
      startW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--neo-w') || '380');
      handle.classList.add('dragging');
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const dx = startX - e.clientX;
      const w = Math.max(280, Math.min(640, startW + dx));
      document.documentElement.style.setProperty('--neo-w', w + 'px');
    });
    document.addEventListener('mouseup', () => { dragging = false; handle.classList.remove('dragging'); });
  }

  function setupTimer() {
    state.timerInterval = setInterval(() => {
      state.totalTime++;
      $('subbarTimerText').textContent = fmtTime(state.totalTime);
    }, 1000);
  }

  /* ========== IDLE DETECTION (沿用 lecture · spec § 1.9.5) ========== */
  function setupIdleDetection() {
    function reset() { state.lastActivityAt = Date.now(); }
    ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'].forEach(ev =>
      document.addEventListener(ev, reset, { passive: true }));
    state.idleTimer = setInterval(() => {
      // recap 完成后不再触发挂机（自由复习态学员可慢慢看）
      if (state.recapEventTriggered) return;
      // Modal 打开时不触发
      if ($('modalMask').classList.contains('open')) return;
      if (Date.now() - state.lastActivityAt >= state.idleThreshold) {
        showIdleModal();
        state.lastActivityAt = Date.now();
      }
    }, 5000);
  }
  function showIdleModal() {
    const html = `<div class="idle-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div class="idle-title">你还在吗？</div>
      <div class="idle-sub">已暂停 · 准备好继续吗？</div>
      <div class="idle-actions"><button class="idle-btn primary" id="idleResume">继续</button></div>`;
    openModal(html);
    $('idleResume').addEventListener('click', closeModal);
  }

  /* ========== INIT ========== */
  function init() {
    // URL ?course=N 路由 / ?reset=1 重置 walk-through 进度（demo 用）
    const url = new URLSearchParams(location.search);
    const courseN = url.get('course') || '1';
    state.currentCourseId = `CRS-00${courseN}`;
    if (url.get('reset') === '1') { clearWalkStep(); showToast('Walk-through 进度已重置 · 重新进入'); }
    // 渲染
    renderAvatar();
    renderBell();
    renderReport();
    // 抽屉单 panel · Project 目录（recap 没有 SCO · 删了报告锚点 Tab）
    renderLDProject();
    // ★ 修复 Neo 头像同步 · init 时根据 localStorage 同步 Hero src（避免之前 male / 现在 female 的错配）
    $('neoAvatar').src = `assets/neo-${state.settings.persona}.png`;
    setupLectureDrawer();
    setupDropdowns();
    setupSettingsDrawer();
    setupNoteFloat();
    setupNeoCollapse();
    setupNeoResize();
    setupNeoInput();
    setupTimer();
    setupIdleDetection();  // ★ 防挂机（spec § 1.9.5）
    // ★ 断点续暂时禁用（DM 决议 · demo 优先 · 每次进入从 step 1 走全流程）
    // 仍 clear 一次防 localStorage 残留
    clearWalkStep();
    setTimeout(() => triggerWalkStep(1), 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
