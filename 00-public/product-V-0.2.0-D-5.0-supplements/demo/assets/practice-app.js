/* ============================================================
   Practice · APP LOGIC
   ------------------------------------------------------------
   核心交互链（v4 · "固定剧情触发"模式）：
   导入 (3 Neo + 1 触发) → 演练 (1 Neo pending + 2 触发 = 第 2/3 轮)
   → 复盘 (3 触发 + 必给总结 + 任务卡 + 对话回看)
   → 报告 (Part 1 立即 / 触发 → 解读 + Part 2 + 2 高光卡 / 触发 → Modal)
   → 完成 Modal (仅"自由探讨"可点)
   → 自由探讨 (回顾型答疑) / 重新演练 (新一轮 · 矩阵清零)
   ============================================================ */

(function () {
  const M = window.PRACTICE_MOCK;
  const $ = id => document.getElementById(id);

  /* ==========  STATE  ========== */
  const state = {
    currentPhase: 'intro',  // 'intro' / 'roleplay' / 'review' / 'report' / 'free'
    currentPracticeId: 'practice-1',  // 当前在哪一轮演练 (practice-1 / 2 / 3)
    triggerStep: 0,         // 当前阶段内的触发步进
    isPaused: false,
    isFreeDiscussMode: false,
    isReadOnlyRoleplay: false,  // 自由探讨切到 演练 2 时 = true
    totalLearningTime: 1080,  // 18 分钟（demo 起始 · 演到完成约 21 分）
    timerInterval: null,
    idleTimer: null,
    idleThreshold: 60 * 1000,
    lastActivityAt: Date.now(),
    practiceHistory: [],  // [{ id: 'practice-1', name: '演练 1', status: 'completed' }, ...]
    hasVisitedP2: false,  // v8.1: 学员是否曾切入 practice-2 · 决定 replay menu 是否列出
    settings: {
      persona: localStorage.getItem('rx-persona') || 'male',
      theme: localStorage.getItem('rx-theme') || 'light',
      speed: localStorage.getItem('rx-speed') || 'normal'
    }
  };

  /* ==========  UTILITIES  ========== */
  function showToast(msg, dur = 2200) {
    const t = $('toast'); t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), dur);
  }
  function openModal(html, extraCls) {
    // v1.1 工程纪律 D · 自动注入右上角 × 按钮
    const closeX = html.includes('modal-close-x')
      ? ''
      : '<button class="modal-close-x" type="button" aria-label="关闭" onclick="closeModal()">×</button>';
    $('modalCard').innerHTML = closeX + html;
    $('modalCard').className = 'modal-card' + (extraCls ? ' ' + extraCls : '');
    $('modalMask').classList.add('open');
  }
  function closeModal() { $('modalMask').classList.remove('open'); }
  // 暴露给 _shared/js/jumper.js 跨脚本调用（IIFE 内默认局部）
  window.openModal = openModal;
  window.closeModal = closeModal;
  // 点击遮罩关闭 modal（v1.1 一致）
  document.addEventListener('DOMContentLoaded', () => {
    const mask = document.getElementById('modalMask');
    if (mask) mask.addEventListener('click', (e) => { if (e.target === mask) closeModal(); });
  });
  function fmtTime(s) { s = Math.max(0, Math.floor(s)); const m = Math.floor(s / 60), sec = s % 60; return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0'); }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  /* ==========  RENDER · Avatar (Topbar) ========== */
  const GRAD_PALETTE = [['#D97757','#E89B6E'],['#9B7CD9','#C4A5E8'],['#5A9BBF','#7DBCE0'],['#D9A957','#EBC179'],['#7CA873','#9EBE96'],['#C95B7C','#E58CA5'],['#5C7AAB','#7E9BC7'],['#B86A8A','#D699B0']];
  function getGradFor(name) { let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; return GRAD_PALETTE[h % GRAD_PALETTE.length]; }
  function renderAvatar() {
    const c = $('avatarCircle');
    const [a, b] = getGradFor(M.learner.name);
    c.style.background = `linear-gradient(135deg, ${a}, ${b})`;
    c.textContent = M.learner.firstChar;
    $('avatarName').textContent = M.learner.name;
    const adRole = document.querySelector('.ad-role');
    if (adRole) adRole.textContent = M.learner.role;
    const adName = document.querySelector('.ad-name');
    if (adName) adName.textContent = M.learner.name;
  }

  /* ==========  RENDER · Subbar ========== */
  function renderSubbar() {
    $('subbarActivity').textContent = M.activity.name;
    const meta = state.isFreeDiscussMode ? '<span class="subbar-mode-chip">自由探讨</span>'
              : state.currentPhase === 'intro' ? '· 导入'
              : state.currentPhase === 'roleplay' ? '· 演练'
              : state.currentPhase === 'review' ? '· 复盘'
              : state.currentPhase === 'report' ? '· 报告' : '';
    $('subbarActivityMeta').innerHTML = meta;
    // 进度
    const phasePct = { intro: 5, roleplay: 35, review: 70, report: 95 };
    const pct = state.isFreeDiscussMode ? 100 : (phasePct[state.currentPhase] || 0);
    $('subbarProgressFill').style.width = pct + '%';
    const cur = $('subbarProgressCurrent');
    if (state.isFreeDiscussMode) {
      cur.style.display = 'none';
    } else {
      cur.style.display = '';
      cur.style.left = `calc(${pct}% - 1px)`;
    }
    $('subbarProgressLabel').innerHTML = `<b>${pct}%</b>`;
    $('subbarTimerText').textContent = fmtTime(state.totalLearningTime);
    $('subbarTimer').classList.toggle('paused', state.isPaused);
    // 重新演练按钮显示规则
    renderReplayButton();
  }

  function renderReplayButton() {
    const wrap = $('replayWrap');
    // 演练阶段进入即出现按钮（默认禁用 · 第 1 次走完后启用）
    if (state.currentPhase === 'intro') {
      wrap.classList.remove('show');
      return;
    }
    wrap.classList.add('show');
    const btn = $('replayBtn');
    // 第 1 次未走完 = 禁用（演练阶段且未到复盘）
    const inFirstRoleplay = state.currentPhase === 'roleplay' && !state.practiceHistory.find(p => p.status === 'completed');
    if (inFirstRoleplay) {
      btn.classList.add('disabled');
      btn.title = '首次演练需走完剧本';
    } else {
      btn.classList.remove('disabled');
      btn.title = '';
    }
  }

  /* ==========  RENDER · View Panel ========== */
  function showOnlyView(viewName) {
    ['viewIntro', 'viewRoleplay', 'viewReview', 'viewReport'].forEach(id => {
      $(id).style.display = (id === viewName) ? '' : 'none';
    });
  }
  function renderView() {
    if (state.currentPhase === 'intro') {
      showOnlyView('viewIntro');
      renderIntroView();
    } else if (state.currentPhase === 'roleplay') {
      showOnlyView('viewRoleplay');
      renderRoleplayView();
    } else if (state.currentPhase === 'review') {
      showOnlyView('viewReview');
      renderReviewView();
    } else if (state.currentPhase === 'report') {
      showOnlyView('viewReport');
      renderReportView();
    }
  }

  /* ==========  Markdown · 极简渲染器  ========== */
  function renderMarkdown(md) {
    // 简单 markdown → HTML 转换（不引入库）
    const lines = md.split('\n');
    let html = '';
    let inList = false;
    let listType = null;
    function closeList() { if (inList) { html += `</${listType}>`; inList = false; listType = null; } }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // h1
      if (line.startsWith('# ')) { closeList(); html += `<h1>${inlineMd(line.slice(2))}</h1>`; continue; }
      if (line.startsWith('## ')) { closeList(); html += `<h2>${inlineMd(line.slice(3))}</h2>`; continue; }
      if (line.startsWith('### ')) { closeList(); html += `<h3>${inlineMd(line.slice(4))}</h3>`; continue; }
      // ol
      const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)/);
      if (olMatch) {
        if (!inList || listType !== 'ol') { closeList(); html += '<ol>'; inList = true; listType = 'ol'; }
        html += `<li>${inlineMd(olMatch[3])}</li>`;
        continue;
      }
      // ul
      const ulMatch = line.match(/^(\s*)-\s+(.*)/);
      if (ulMatch) {
        if (!inList || listType !== 'ul') { closeList(); html += '<ul>'; inList = true; listType = 'ul'; }
        html += `<li>${inlineMd(ulMatch[2])}</li>`;
        continue;
      }
      closeList();
      // empty line
      if (!line.trim()) continue;
      // paragraph
      html += `<p>${inlineMd(line)}</p>`;
    }
    closeList();
    return html;
  }
  function inlineMd(s) {
    return s
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  /* ==========  ① INTRO_VIEW  ========== */
  function renderIntroView() {
    $('introPane').innerHTML = renderMarkdown(M.introMarkdown);
  }

  function pushIntroNeoMessages() {
    // 进入即推 · 不计时（按 § 14.2）
    const seq = M.introNeoMessages;
    seq.forEach(m => {
      if (m.kind === 'chip-memory') {
        appendNeoChip(m.head, '', 'memory');
      } else if (m.kind === 'neo') {
        appendNeoMsg('coach', m.text);
      }
    });
  }

  /* ==========  ② ROLEPLAY_VIEW  ========== */
  function renderRoleplayView() {
    const practice = getCurrentPractice();
    if (!practice) return;
    // Actor 头像窗口
    $('actorHeroBase').src = M.actor.baseImage;
    const lastTurn = practice.turns[practice.turns.length - 1];
    const expr = lastTurn ? lastTurn.expr : 'resistant';
    setActorExpression(expr);
    $('actorHeroName').textContent = M.actor.name;
    $('actorHeroRole').textContent = M.actor.role;
    // 渲染左下滚动背景区
    renderActorBgScroll();
    // 状态矩阵当前点
    const matrix = lastTurn && lastTurn.matrix ? lastTurn.matrix : (practice.initialMatrix || { cx: 100, cy: 40 });
    setMatrixDot(matrix.cx, matrix.cy);
    const pos = M.matrixPositions[expr] || M.matrixPositions.resistant;
    setMatrixLabel(pos.emoji, pos.label);
    // 演练标题 + tag
    $('actorDialogTitle').textContent = practice.name;
    const tagEl = $('actorDialogTag');
    if (practice.status === 'completed') { tagEl.textContent = '已完整'; tagEl.style.background = 'rgba(79,139,92,0.18)'; tagEl.style.color = 'var(--success)'; }
    else if (practice.status === 'incomplete') { tagEl.textContent = '未完成'; tagEl.style.background = 'rgba(216,155,59,0.18)'; tagEl.style.color = 'var(--warn)'; }
    else { tagEl.textContent = '演练中'; tagEl.style.background = 'var(--accent-soft)'; tagEl.style.color = 'var(--accent)'; }
    // 对话区渲染
    renderActorDialog(practice);
    // 输入框启用 / 禁用
    const wrap = $('actorInputWrap');
    if (state.isReadOnlyRoleplay) {
      wrap.classList.add('disabled');
      $('actorInput').disabled = true;
      $('actorSend').disabled = true;
      $('actorInput').placeholder = '自由探讨仅查看 · 想继续这次未完成请去重新演练';
    } else {
      wrap.classList.remove('disabled');
      $('actorInput').disabled = false;
      $('actorSend').disabled = false;
      $('actorInput').placeholder = '对' + M.actor.name + '说……';
    }
  }

  function getCurrentPractice() {
    if (state.currentPracticeId === 'practice-1') return M.practice1;
    if (state.currentPracticeId === 'practice-2') return M.practice2;
    if (state.currentPracticeId === 'practice-3') return M.practice3;
    return M.practice1;
  }

  function renderActorDialog(practice) {
    const stream = $('actorDialogStream');
    stream.innerHTML = '';
    if (!practice.turns || practice.turns.length === 0) return;
    practice.turns.forEach(t => {
      stream.appendChild(buildActorMsgEl(t));
    });
    stream.scrollTop = stream.scrollHeight;
  }

  function buildActorMsgEl(t) {
    const div = document.createElement('div');
    div.className = `actor-msg ${t.role}${t.history ? ' history' : ''}`;
    let avatarHtml, name;
    if (t.role === 'actor') {
      // Actor 头像 = 方形人像图（崔德莫）
      avatarHtml = `<div class="actor-msg-avatar"><img src="${M.actor.baseImage}" alt="${escapeHtml(M.actor.name)}" /></div>`;
      name = M.actor.name;
    } else {
      // 学员显示扮演的角色（剧本里的李明），不显示真实账号名
      const role = M.learner.actingRole || { name: M.learner.name, firstChar: M.learner.firstChar };
      const [c1, c2] = getGradFor(role.name);
      avatarHtml = `<div class="actor-msg-avatar letter" style="background:linear-gradient(135deg,${c1},${c2})">${role.firstChar}</div>`;
      name = role.name;
    }
    div.innerHTML = `${avatarHtml}<div class="actor-msg-col"><div class="actor-msg-name">${escapeHtml(name)}</div><div class="actor-msg-bubble">${escapeHtml(t.text)}</div></div>`;
    return div;
  }

  // 状态矩阵当前点位置（小窗 + popover 同步）
  function setMatrixDot(cx, cy) {
    const dot = $('matrixDot');
    if (dot) { dot.setAttribute('cx', cx); dot.setAttribute('cy', cy); }
    const popDot = $('matrixPopoverDot');
    if (popDot) { popDot.setAttribute('cx', cx); popDot.setAttribute('cy', cy); }
  }
  function setMatrixLabel(emoji, label) {
    // v6: popover 仅显示文字标签 · 删除 emoji
    const popLabel = $('matrixPopoverLabel');
    if (popLabel) popLabel.textContent = label;
  }
  // v7: base + overlay 双层 cross-fade 切换 Actor 表情
  function setActorExpression(expr) {
    const base = $('actorHeroBase');
    const overlay = $('actorHeroExpr');
    const url = M.actor.expressions[expr] || M.actor.expressions.resistant;
    const fileName = url.split('/').pop();
    if (base.src.includes(fileName) && !overlay.classList.contains('show')) return;
    // overlay 立即设新图 + fade in
    overlay.src = url;
    requestAnimationFrame(() => overlay.classList.add('show'));
    // 350ms 后把 base 同步成新图 + overlay 重置（为下次切换准备）
    setTimeout(() => {
      base.src = url;
      overlay.classList.remove('show');
    }, 380);
  }

  // v8: Actor 开场（进演练自动触发，无学员输入）
  function triggerPractice1Opening() {
    const op = M.practice1.actorOpening;
    if (!op) return;
    // 矩阵起点 → opening matrix（已是抵抗）
    setActorExpression(op.expr);
    setMatrixLabel(M.matrixPositions[op.expr].emoji, M.matrixPositions[op.expr].label);
    setTimeout(() => {
      const opTurn = { turn: 0, role: 'actor', text: op.text, emoji: op.emoji, expr: op.expr, matrix: op.matrix };
      M.practice1.turns.push(opTurn);
      const stream = $('actorDialogStream');
      stream.appendChild(buildActorMsgEl(opTurn));
      stream.scrollTop = stream.scrollHeight;
    }, 600);
  }

  // 通用 · 推一条学员气泡 + 更新 stream
  function pushLearnerBubble(turnNo, text) {
    const learnerTurn = { turn: turnNo, role: 'learner', text, history: false };
    M.practice1.turns.push(learnerTurn);
    const stream = $('actorDialogStream');
    stream.appendChild(buildActorMsgEl(learnerTurn));
    stream.scrollTop = stream.scrollHeight;
    $('actorInput').value = '';
  }

  // 通用 · 推一条 Actor 气泡 + 更新矩阵 + 更新表情
  function pushActorReply(turnNo, t, delayMatrix = 250, delayBubble = 600) {
    setTimeout(() => {
      animateMatrix(t.matrixFrom, t.matrixTo);
      setActorExpression(t.actorExpr);
      setMatrixLabel(t.matrixEmoji, t.matrixLabel);
      setTimeout(() => {
        const actorTurn = { turn: turnNo, role: 'actor', text: t.actorText, emoji: t.actorEmoji, expr: t.actorExpr, matrix: t.matrixTo };
        M.practice1.turns.push(actorTurn);
        const stream = $('actorDialogStream');
        stream.appendChild(buildActorMsgEl(actorTurn));
        stream.scrollTop = stream.scrollHeight;
        state.actorPending = false;
      }, delayBubble);
    }, delayMatrix);
  }

  // v8 · 演练 1 · 第 1 轮（评价钩 · 错）→ Actor 仍抵抗，无 Neo
  function triggerPractice1Turn1() {
    const t = M.practice1.turn1;
    pushLearnerBubble(1, t.learnerText);
    pushActorReply(1, t);
  }

  // v8 · 演练 1 · 第 2 轮（仍评价 · 错）→ 学员气泡 + Neo 卡点 chip + Actor 滑向冷漠
  function triggerPractice1Turn2() {
    const t = M.practice1.turn2;
    pushLearnerBubble(2, t.learnerText);
    // 学员气泡刚出 · Neo 在此插入卡点（直接发消息，不出 chip 头）
    setTimeout(() => appendNeoMsg('coach', t.neoStuckAdvice), 500);
    // Actor 回复延后给 Neo chip 时间出来
    pushActorReply(2, t, 1200, 700);
  }

  // v8 · 演练 1 · 第 3 轮（应用 Neo 建议 · 具体化）→ Actor 顺从
  function triggerPractice1Turn3() {
    const t = M.practice1.turn3;
    pushLearnerBubble(3, t.learnerText);
    pushActorReply(3, t);
  }

  // v8 · 演练 1 · 第 4 轮（邀请最小行动）→ Actor 投入 + Neo 收尾 + 转复盘
  function triggerPractice1Turn4() {
    const t = M.practice1.turn4;
    pushLearnerBubble(4, t.learnerText);
    setTimeout(() => {
      animateMatrix(t.matrixFrom, t.matrixTo);
      setActorExpression(t.actorExpr);
      setMatrixLabel(t.matrixEmoji, t.matrixLabel);
      setTimeout(() => {
        const actorTurn = { turn: 4, role: 'actor', text: t.actorText, emoji: t.actorEmoji, expr: t.actorExpr, matrix: t.matrixTo };
        M.practice1.turns.push(actorTurn);
        const stream = $('actorDialogStream');
        stream.appendChild(buildActorMsgEl(actorTurn));
        stream.scrollTop = stream.scrollHeight;
        state.actorPending = false;
        setTimeout(() => {
          appendNeoMsg('coach', t.neoSync);
          setTimeout(() => {
            M.practice1.status = 'completed';
            state.practiceHistory.push({ id: 'practice-1', name: M.practice1.name, status: 'completed' });
            transitionToPhase('review');
          }, 1500);
        }, 800);
      }, 600);
    }, 250);
  }

  function addTurnDividerIfNew(turn) {
    // v3 整改：不再显示 "第 N 轮" 分隔线
  }

  // 矩阵过渡动画 · 250ms ease（用 SVG SMIL animate · 简化用 CSS transition）
  function animateMatrix(from, to) {
    const dot = $('matrixDot');
    const popDot = $('matrixPopoverDot');
    if (!dot && !popDot) return;
    const startTime = performance.now();
    const duration = 250;
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const cx = from.cx + (to.cx - from.cx) * ease;
      const cy = from.cy + (to.cy - from.cy) * ease;
      if (dot) { dot.setAttribute('cx', cx); dot.setAttribute('cy', cy); }
      if (popDot) { popDot.setAttribute('cx', cx); popDot.setAttribute('cy', cy); }
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ==========  ③ REVIEW_VIEW  ========== */
  function renderReviewView() {
    const callbacksHtml = M.reviewCallbacks.map((c, i) =>
      `<div class="md-callback-row ${c.type}" data-callback-idx="${i}">
        <span class="turn-tag">第 ${c.turn} 轮</span>
        <span class="turn-icon">${c.icon}</span>
        <span class="turn-text">${escapeHtml(c.text)}</span>
      </div>`
    ).join('');
    const html = renderMarkdown(M.reviewMarkdown) +
      `<h2>对话回看</h2>
       <p style="font-size:12px;color:var(--ink-3);margin-bottom:8px">点击某轮 → 右栏 Neo 自动定向分析</p>` +
      callbacksHtml;
    $('reviewPane').innerHTML = html;
    // 对话回看点击
    $('reviewPane').querySelectorAll('.md-callback-row').forEach(el => {
      el.addEventListener('click', () => {
        const idx = +el.dataset.callbackIdx;
        const c = M.reviewCallbacks[idx];
        if (!c) return;
        // v8.3: 改为 Neo 普通消息，不再用 chip 卡
        appendNeoMsg('coach', c.neoAnalysis);
      });
    });
  }

  function pushReviewSocratic1() {
    const r = M.reviewNeoSequence;
    // v8: 不再出 "✅ 进入复盘" chip · 直接 Neo 苏格拉底 1
    appendNeoMsg('coach', r.socratic1);
  }

  /* ==========  ④ REPORT_VIEW · 整体 loading + 一次性加载  ========== */
  function renderReportView() {
    // 默认 skeleton 等待状态（不立即出内容）
    const p1 = M.reportPart1;
    let html = `<h1>${p1.title}</h1>
      <div id="reportLoading" class="report-loading-wrap">
        <div class="report-loading-icon">
          <svg width="32" height="32" viewBox="0 0 50 50" fill="none">
            <circle cx="25" cy="25" r="20" stroke="var(--ink-5)" stroke-width="3"/>
            <path d="M25 5a20 20 0 0120 20" stroke="var(--accent)" stroke-width="3" stroke-linecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
            </path>
          </svg>
        </div>
        <div class="report-loading-title">正在生成报告……</div>
        <div class="report-loading-sub">综合 5 维评分、高光时刻和提升建议</div>
        <div class="report-loading-skel">
          <div class="skeleton-row long"></div>
          <div class="skeleton-row short"></div>
          <div class="skeleton-row long"></div>
          <div class="skeleton-row long"></div>
          <div class="skeleton-row short"></div>
        </div>
      </div>
      <div id="reportContent" style="display:none"></div>`;
    $('reportPane').innerHTML = html;
  }

  function fillReportFull() {
    // 学员触发后整体加载（评分 + 高光 + 提升建议 一起出现）
    const p1 = M.reportPart1;
    const p2 = M.reportPart2;
    const radarSvg = buildRadarSvg(p1.radar.dims);
    const radarList = p1.radar.dims.map(d => {
      const stars = '⭐'.repeat(d.score) + '☆'.repeat(d.max - d.score);
      return `<div class="radar-row">
        <span class="radar-label">${d.label}</span>
        <span class="radar-stars">${stars}</span>
        <span class="radar-score">${d.score} / ${d.max}</span>
      </div>`;
    }).join('');
    const hHtml = p2.highlights.map(h => `<p>${inlineMd(h)}</p>`).join('');
    const sHtml = '<ol>' + p2.suggestions.map(s => `<li>${inlineMd(s)}</li>`).join('') + '</ol>';
    const html = `<h2>能力评分（5 维 · 5 级雷达图）</h2>
      <div class="radar-wrap">
        ${radarSvg}
        <div class="radar-list">${radarList}</div>
      </div>
      <h2>高光时刻</h2>
      ${hHtml}
      <h2>提升建议</h2>
      ${sHtml}`;
    $('reportContent').innerHTML = html;
    $('reportLoading').style.display = 'none';
    $('reportContent').style.display = '';
    state.reportLoaded = true;
  }

  function buildRadarSvg(dims) {
    const cx = 140, cy = 140, r = 100;
    const n = dims.length;
    // 5 个顶点（顶部开始顺时针）
    const points = dims.map((d, i) => {
      const ang = -Math.PI / 2 + (Math.PI * 2 * i) / n;
      const ratio = d.score / d.max;
      const px = cx + Math.cos(ang) * r * ratio;
      const py = cy + Math.sin(ang) * r * ratio;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    }).join(' ');
    // 同心圆 5 层 + 轴线 + 标签
    let layers = '';
    for (let i = 1; i <= 5; i++) {
      const lp = dims.map((d, j) => {
        const ang = -Math.PI / 2 + (Math.PI * 2 * j) / n;
        const px = cx + Math.cos(ang) * r * (i / 5);
        const py = cy + Math.sin(ang) * r * (i / 5);
        return `${px.toFixed(1)},${py.toFixed(1)}`;
      }).join(' ');
      layers += `<polygon points="${lp}" fill="none" stroke="var(--hairline)" stroke-width="1"/>`;
    }
    let axes = '';
    let labels = '';
    dims.forEach((d, i) => {
      const ang = -Math.PI / 2 + (Math.PI * 2 * i) / n;
      const ex = cx + Math.cos(ang) * r;
      const ey = cy + Math.sin(ang) * r;
      axes += `<line x1="${cx}" y1="${cy}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="var(--hairline)" stroke-width="1"/>`;
      const lx = cx + Math.cos(ang) * (r + 16);
      const ly = cy + Math.sin(ang) * (r + 16);
      labels += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="var(--ink-3)">${d.label}</text>`;
    });
    return `<svg class="radar-svg" viewBox="0 0 280 280">
      ${layers}
      ${axes}
      <polygon points="${points}" fill="rgba(var(--accent-rgb),0.20)" stroke="var(--accent)" stroke-width="2"/>
      ${labels}
    </svg>`;
  }

  /* ==========  Phase Transition  ========== */
  function transitionToPhase(phase) {
    state.currentPhase = phase;
    state.triggerStep = 0;
    if (phase === 'report') {
      state.reportLoaded = false;
      state.reportClosed = false;
    }
    renderSubbar();
    renderView();
    renderLDPhase();
    if (phase === 'review') {
      pushReviewSocratic1();
    } else if (phase === 'report') {
      setTimeout(() => appendNeoMsg('coach', M.reportNeoSequence.open), 400);
      scheduleAutoFillReport();  // v8: 报告 2s 自动加载（不再卡学员输入）
    }
  }

  // v8 · 立即加载完整报告 + Neo 解读 + 推高光卡（幂等 · 不重复触发）
  function fillReportNow() {
    if (state.reportLoaded) return;
    fillReportFull();
    setTimeout(() => appendNeoMsg('coach', M.reportNeoSequence.interpret), 400);
    M.highlightCards.forEach((h, i) => setTimeout(() => appendHighlightCard(h, false), 1200 + i * 600));
  }
  // v8 · 进 report 阶段 2s 自动加载（学员可在 2s 内输入提前触发）
  function scheduleAutoFillReport() {
    setTimeout(fillReportNow, 2000);
  }

  /* ==========  Neo Chat 渲染  ========== */
  function neoAvatarHTML() { return `<div class="msg-avatar"><img src="assets/neo-${state.settings.persona}.png" alt="Neo" /></div>`; }
  function userAvatarHTML() { const [a, b] = getGradFor(M.learner.name); return `<div class="msg-avatar user-letter" style="background:linear-gradient(135deg,${a},${b})">${M.learner.firstChar}</div>`; }

  function appendNeoMsg(speech, text) {
    const stream = $('neoStream');
    // Practice 不显示 speech-chip（用户反馈：Neo 对话不加辅导 tag）
    // v8.5: 三按钮（点赞 / 点踩 / 评论）· 图标与 hall 对齐（14px / stroke 1.8）
    const html = `<div class="msg neo">${neoAvatarHTML()}<div class="msg-body"><div class="msg-bubble">${escapeHtml(text)}</div><div class="msg-actions"><button class="msg-action" data-vote="up" title="点赞"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg></button><button class="msg-action" data-vote="down" title="点踩"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zM17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg></button><button class="msg-action" data-act="comment" title="评论"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></button></div></div></div>`;
    stream.insertAdjacentHTML('beforeend', html);
    stream.scrollTop = stream.scrollHeight;
  }
  function appendUserMsg(text) {
    const stream = $('neoStream');
    stream.insertAdjacentHTML('beforeend', `<div class="msg user">${userAvatarHTML()}<div class="msg-body"><div class="msg-bubble">${escapeHtml(text)}</div></div></div>`);
    stream.scrollTop = stream.scrollHeight;
  }
  function appendNeoChip(head, body, kind) {
    const stream = $('neoStream');
    const cls = kind === 'review-jump' ? 'neo-chip-card review-jump' : 'neo-chip-card';
    const bodyHtml = body ? `<div>${escapeHtml(body)}</div>` : '';
    stream.insertAdjacentHTML('beforeend', `<div class="${cls}"><div class="neo-chip-card-head">${head}</div>${bodyHtml}</div>`);
    stream.scrollTop = stream.scrollHeight;
  }
  function appendPendingAdvice(adv) {
    // 卡点提示直接作为 Neo 普通消息推送（不再用单独 chip 卡片）
    appendNeoMsg('coach', adv.text);
  }

  function appendHighlightCard(h, autoCollect) {
    const stream = $('neoStream');
    const id = 'h-' + Date.now() + Math.random();
    const html = `<div class="neo-card highlight-card${autoCollect ? ' collected' : ''}" data-card-id="${id}">
      <span class="neo-card-tag">🌟 高光时刻</span>
      <div class="neo-card-title">${escapeHtml(h.title)}</div>
      <div class="neo-card-quote">${escapeHtml(h.quote)}</div>
      <div class="neo-card-neo-note">${escapeHtml(h.neoNote)}</div>
      <div class="neo-card-meta">📍 ${escapeHtml(h.meta)}</div>
      ${autoCollect ? '' : `<div class="neo-card-actions">
        <button class="neo-card-btn primary" data-act="collect">⭐ 收藏</button>
        <button class="neo-card-btn" data-act="ignore">忽略</button>
      </div>`}
    </div>`;
    stream.insertAdjacentHTML('beforeend', html);
    stream.scrollTop = stream.scrollHeight;
    if (!autoCollect) {
      const card = stream.querySelector(`[data-card-id="${id}"]`);
      card.querySelector('[data-act="collect"]').addEventListener('click', () => collectHighlight(card, h));
      card.querySelector('[data-act="ignore"]').addEventListener('click', () => { card.style.opacity = '.4'; card.querySelector('.neo-card-actions').style.display = 'none'; });
    }
  }

  function appendTaskCard(t) {
    const stream = $('neoStream');
    const id = 'k-' + Date.now() + Math.random();
    const html = `<div class="neo-card" data-card-id="${id}">
      <span class="neo-card-tag">✓ 应用任务</span>
      <div class="neo-card-title">${escapeHtml(t.title)}</div>
      <div class="neo-card-body">${escapeHtml(t.body)}</div>
      <div class="neo-card-actions">
        <button class="neo-card-btn primary" data-act="add">+ 加入待办</button>
        <button class="neo-card-btn" data-act="dismiss">暂不</button>
      </div>
    </div>`;
    stream.insertAdjacentHTML('beforeend', html);
    stream.scrollTop = stream.scrollHeight;
    const card = stream.querySelector(`[data-card-id="${id}"]`);
    card.querySelector('[data-act="add"]').addEventListener('click', () => {
      // US-V12-LINK-004: 真写到 _shared/mock/todos.js
      Todos.add({ text: t.title, source: '对练 · ' + (M.activity?.name || ''), activityId: state.activityId });
      showToast('已加入大厅待办');
      card.style.opacity = '.55';
      card.querySelector('.neo-card-actions').style.display = 'none';
    });
    card.querySelector('[data-act="dismiss"]').addEventListener('click', () => { card.style.opacity = '.4'; card.querySelector('.neo-card-actions').style.display = 'none'; });
  }

  function collectHighlight(card, h) {
    const avatar = $('avatarCircle');
    const cardRect = card.getBoundingClientRect();
    const avRect = avatar.getBoundingClientRect();
    const fly = card.cloneNode(true);
    fly.classList.add('highlight-flying');
    fly.style.left = cardRect.left + 'px';
    fly.style.top = cardRect.top + 'px';
    fly.style.width = cardRect.width + 'px';
    fly.style.transform = 'scale(1)';
    document.body.appendChild(fly);
    requestAnimationFrame(() => {
      fly.style.left = (avRect.left + avRect.width / 2 - 12) + 'px';
      fly.style.top = (avRect.top + avRect.height / 2 - 12) + 'px';
      fly.style.width = '24px'; fly.style.opacity = '0'; fly.style.transform = 'scale(0.2)';
    });
    setTimeout(() => { fly.remove(); showToast('已收藏到大厅高光库'); }, 700);
    card.classList.add('collected');
    // US-V12-LINK-002: 真写到 _shared/mock/highlights.js
    if (typeof Highlights === 'object') {
      Highlights.add({
        source: 'practice',
        activityId: state.activityId,
        title: h.title || h.text,
        content: h.quote || h.text || h.title,
        tag: 'practice'
      });
    }
  }

  /* ==========  Lecture Drawer · Tab1 阶段进度 / Tab2 Project 目录  ========== */
  function renderLDPhase() {
    const panel = $('ldPanelPhase');
    let html = `<div style="padding:8px 4px 12px 4px;font-size:11px;color:var(--ink-3);letter-spacing:.4px;text-transform:uppercase">${M.activity.name}</div>
      <div class="ld-phase-list">`;
    M.phaseStatus.forEach(p => {
      const isCurrent = state.currentPhase === p.type.toLowerCase() ||
        (state.isFreeDiscussMode && false);  // 自由探讨不高亮单一
      const isLocked = p.status === 'locked' && !state.isFreeDiscussMode;
      let iconCls = 'locked', iconChar = '';
      if (state.isFreeDiscussMode) { iconCls = 'completed'; iconChar = '✓'; }
      else if (p.status === 'completed') { iconCls = 'completed'; iconChar = '✓'; }
      else if (p.status === 'current') { iconCls = 'current'; iconChar = '▶'; }
      else { iconCls = 'locked'; iconChar = '🔒'; }
      const cls = (isCurrent ? ' current' : '') + (isLocked ? ' locked' : '');
      html += `<div class="ld-phase-item${cls}" data-phase-type="${p.type}">
        <div class="ld-phase-icon ${iconCls}">${iconChar}</div>
        <div class="ld-phase-body">
          <div class="ld-phase-title">${p.name}</div>
          <div class="ld-phase-meta">${p.meta}</div>
        </div>
      </div>`;
    });
    html += '</div>';
    panel.innerHTML = html;
    panel.querySelectorAll('.ld-phase-item').forEach(el => el.addEventListener('click', () => {
      if (el.classList.contains('locked')) { showToast('该阶段尚未开放'); return; }
      const type = el.dataset.phaseType;
      const target = type.toLowerCase();
      // 切阶段
      if (state.currentPhase === target && !(state.isFreeDiscussMode)) { closeLectureDrawer(); return; }
      switchPhaseInDrawer(target);
      closeLectureDrawer();
    }));
  }

  function switchPhaseInDrawer(target) {
    state.currentPhase = target;
    state.triggerStep = 0;
    if (state.isFreeDiscussMode && target === 'roleplay') {
      // 默认切到当前 practice (practice-1) · 只读
      state.currentPracticeId = 'practice-1';
      state.isReadOnlyRoleplay = true;
    } else if (target === 'roleplay') {
      state.isReadOnlyRoleplay = false;
    }
    renderSubbar();
    renderView();
    renderLDPhase();
  }

  function renderLDProject() {
    const panel = $('ldPanelProject');
    let html = '';
    M.courseTree.forEach(c => {
      html += `<div class="ld-course" data-course="${c.id}">
        <div class="ld-course-head">
          <svg class="chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          ${c.name}
        </div>
        <div class="ld-course-list">`;
      c.activities.forEach(a => {
        const isCurrent = a.id === M.activity.id;
        const isCompleted = a.status === 'completed';
        const cls = isCurrent ? ' current' : '';
        let iconChar = '', iconCls = '';
        if (isCurrent) { iconChar = '▶'; iconCls = 'current'; }
        else if (isCompleted) { iconChar = '✓'; iconCls = 'completed'; }
        html += `<div class="ld-activity${cls}" data-activity="${a.id}" data-type="${a.type}" data-name="${a.name}">
          <div class="ld-status-icon ${iconCls}">${iconChar}</div>
          <div>${a.name}</div>
        </div>`;
      });
      html += '</div></div>';
    });
    panel.innerHTML = html;
    panel.querySelectorAll('.ld-course').forEach(el => {
      el.querySelector('.ld-course-head').addEventListener('click', () => el.classList.toggle('collapsed'));
    });
    panel.querySelectorAll('.ld-activity').forEach(el => el.addEventListener('click', () => {
      if (el.classList.contains('current')) { closeLectureDrawer(); return; }
      // v1.2 抽屉跳转：按 type 弹确认 → Router.go
      const type = el.dataset.type;
      const name = el.dataset.name || 'Activity';
      const activityId = el.dataset.activity;
      const TARGET_BY_TYPE = { lecture: 'lecture-ppt', practice: 'practice-intro', recap: 'recap' };
      const target = TARGET_BY_TYPE[type];
      if (!target) { showToast('该内容暂未开放'); return; }
      closeLectureDrawer();
      Jumper.confirmAndJump(name, target, { activityId, from: 'practice' });
    }));
  }

  /* ==========  Bell messages  ========== */
  function renderBellMessages() {
    const list = $('msgList');
    list.innerHTML = '';
    // US-V12-LINK-005: 改用共享 messages + MessagesRead 已读状态
    const role = (window.Session?.get()?.role) || 'learner';
    const msgs = (typeof window.filterMessagesByRole === 'function')
      ? window.filterMessagesByRole(role)
      : (M.bellMessages || []);
    msgs.forEach(m => {
      const row = document.createElement('div');
      row.className = 'msg-row';
      const isRead = (typeof MessagesRead === 'object') ? MessagesRead.isRead(m) : (m.unread === false);
      let avatarHtml = '';
      if (m.type === 'platform') avatarHtml = `<div class="msg-avatar-wrap platform"><img src="assets/logo.png" alt="平台" /></div>`;
      else if (m.type === 'system') avatarHtml = `<div class="msg-avatar-wrap system"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 003.4 0"/></svg></div>`;
      else if (m.type === 'user') {
        const [c1, c2] = getGradFor(m.sender);
        avatarHtml = `<div class="msg-avatar-wrap user" style="background:linear-gradient(135deg,${c1},${c2})">${m.avatarChar}</div>`;
      }
      row.innerHTML = `${avatarHtml}<div class="msg-content"><div class="msg-head"><span class="msg-text">${m.title}</span>${!isRead ? '<span class="msg-dot-unread"></span>' : ''}</div><div class="msg-sender">${m.sender} · ${m.time}</div><div class="msg-desc">${escapeHtml(m.desc)}</div></div>`;
      row.addEventListener('click', e => {
        e.stopPropagation();
        const wasExpanded = row.classList.contains('expanded');
        list.querySelectorAll('.msg-row.expanded').forEach(r => r.classList.remove('expanded'));
        if (!wasExpanded) {
          row.classList.add('expanded');
          if (typeof MessagesRead === 'object') MessagesRead.markRead(m);
          const unread = (typeof MessagesRead === 'object') ? MessagesRead.unreadCount(role) : 0;
          const badge = $('bellBadge');
          if (unread === 0) badge.style.display = 'none';
          else { badge.style.display = ''; badge.textContent = unread; }
          const dot = row.querySelector('.msg-dot-unread');
          if (dot) dot.remove();
        }
      });
      list.appendChild(row);
    });
    // 同步 bellBadge 初值
    const badge = $('bellBadge');
    const unread = (typeof MessagesRead === 'object') ? MessagesRead.unreadCount(role) : msgs.filter(m => m.unread !== false).length;
    if (badge) {
      if (unread === 0) badge.style.display = 'none';
      else { badge.style.display = ''; badge.textContent = unread; }
    }
  }

  /* ==========  完成 Modal · 自由探讨 · 重新演练 ========== */
  function showCompletionModal() {
    // US-V12-LINK-001: 标记 Activity 完成态
    if (state.activityId && typeof Progress === 'object') {
      Progress.markComplete(state.activityId, 'practice');
    }
    const c = M.completionModal;
    const html = `<div class="completion-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
      <div class="completion-title">对练完成！</div>
      <div class="completion-sub">你已完成「${M.activity.name}」</div>
      <div class="completion-stats">
        <div><span class="completion-stat-label">学习时长</span><span class="completion-stat-value">${c.duration}</span></div>
        <div><span class="completion-stat-label">演练 1</span><span class="completion-stat-value">${c.p1Status}</span></div>
        <div><span class="completion-stat-label">5 维均分</span><span class="completion-stat-value">${c.avgScore}</span></div>
      </div>
      <div class="completion-actions">
        <button class="completion-btn" id="cBtnHall">回到大厅</button>
        <button class="completion-btn primary" id="cBtnFree">自由探讨</button>
        <button class="completion-btn" id="cBtnNext">继续下一节</button>
      </div>`;
    openModal(html, 'completion-modal');
    $('cBtnFree').addEventListener('click', enterFreeDiscussMode);
    $('cBtnHall').addEventListener('click', () => { closeModal(); Router.go('hall', { from: 'practice' }); });
    $('cBtnNext').addEventListener('click', () => {
      closeModal();
      // demo: practice 完成默认回大厅（practice 通常是单元终点 · 后续接报告/复盘）
      Router.go('hall', { from: 'practice' });
    });
  }

  function enterFreeDiscussMode() {
    closeModal();
    state.isFreeDiscussMode = true;
    M.phaseStatus.forEach(p => p.status = 'completed');
    renderSubbar();
    renderLDPhase();
    // v8.3: 进入自由探讨改为 Neo 普通消息（去掉 chip 头）+ toast
    appendNeoMsg('coach', M.freeDiscussNeoSequence.enterChip.text);
    showToast('已进入自由探讨');
  }

  /* ==========  「重新演练 ▾」  ========== */
  function setupReplayButton() {
    $('replayMain').addEventListener('click', e => {
      e.stopPropagation();
      const btn = $('replayBtn');
      if (btn.classList.contains('disabled')) return;
      // 主按钮 · 新开演练 N+1
      $('replayMenu').classList.remove('open');
      startNewPractice();
    });
    $('replayArrow').addEventListener('click', e => {
      e.stopPropagation();
      const btn = $('replayBtn');
      if (btn.classList.contains('disabled')) return;
      renderReplayMenu();
      $('replayMenu').classList.toggle('open');
    });
    document.addEventListener('click', () => $('replayMenu').classList.remove('open'));
  }

  function renderReplayMenu() {
    const menu = $('replayMenu');
    // v8.1: 只显示学员真正参与过的 practice · 不再默认列 practice-2
    const all = [];
    if (M.practice1.status === 'completed' || M.practice1.status === 'in_progress') {
      all.push({ id: 'practice-1', name: M.practice1.name, status: M.practice1.status });
    }
    // practice-2 仅在学员通过自由探讨切到过它，或当前正在它里面时显示
    if (state.hasVisitedP2 || state.currentPracticeId === 'practice-2') {
      all.push({ id: 'practice-2', name: M.practice2.name, status: 'incomplete' });
    }
    if (M.practice3.status === 'in_progress' && state.currentPracticeId === 'practice-3') {
      all.push({ id: 'practice-3', name: M.practice3.name, status: 'in_progress' });
    }
    let html = '';
    all.forEach(p => {
      const isCur = p.id === state.currentPracticeId;
      let statusHtml = '';
      if (p.status === 'completed') statusHtml = '<span class="replay-item-status ok">✅ 已完整</span>';
      else if (p.status === 'incomplete') statusHtml = '<span class="replay-item-status warn">⚠️ 未完成</span>';
      else statusHtml = '<span class="replay-item-status">进行中</span>';
      html += `<div class="replay-item ${isCur ? 'current' : ''}" data-pid="${p.id}">
        <span>${p.name}${isCur ? ' (当前)' : ''}</span>
        ${statusHtml}
      </div>`;
    });
    menu.innerHTML = html;
    menu.querySelectorAll('.replay-item').forEach(el => el.addEventListener('click', e => {
      e.stopPropagation();
      const pid = el.dataset.pid;
      switchToPractice(pid);
      $('replayMenu').classList.remove('open');
    }));
  }

  function switchToPractice(pid) {
    state.currentPracticeId = pid;
    if (pid === 'practice-2') {
      state.isReadOnlyRoleplay = true;
      state.hasVisitedP2 = true;  // v8.1: 标记学员已切入 practice-2
      // v8.3: 切到演练 2 用 toast 提示，不再发 chip
      showToast('已切到演练 2 · 仅查看');
    } else {
      state.isReadOnlyRoleplay = state.isFreeDiscussMode;
    }
    state.currentPhase = 'roleplay';
    renderSubbar();
    renderView();
    renderLDPhase();
  }

  function startNewPractice() {
    // 演练 3 · 新一轮
    state.currentPracticeId = 'practice-3';
    state.isReadOnlyRoleplay = false;
    state.isFreeDiscussMode = false;
    state.currentPhase = 'roleplay';
    state.triggerStep = 0;
    M.phaseStatus.forEach(p => {
      if (p.type === 'INTRO') p.status = 'completed';
      else if (p.type === 'ROLEPLAY') p.status = 'current';
      else p.status = 'locked';
    });
    // 清空 practice3.turns + 设置初始 matrix
    M.practice3.turns = [];
    renderSubbar();
    renderView();
    renderLDPhase();
    // 重置矩阵到中性
    setMatrixDot(M.practice3.initialMatrix.cx, M.practice3.initialMatrix.cy);
    setMatrixLabel(M.practice3.initialMatrix.emoji, M.practice3.initialMatrix.label);
    setActorExpression('resistant');  // 默认 Actor 表情 resistant（剧本起点）
    // v8.3: 进入演练 3 用 toast 提示 + Neo 普通消息开场，不再发 chip
    showToast('演练 3 已开始 · 矩阵已重置');
    appendNeoMsg('coach', M.practice3.enterChip.text);
    setTimeout(() => {
      const op = M.practice3.actorOpening;
      const opTurn = { turn: 1, role: 'actor', text: op.text, emoji: op.emoji, expr: op.expr, matrix: op.matrix };
      M.practice3.turns.push(opTurn);
      const stream = $('actorDialogStream');
      stream.innerHTML = '';
      // v3 整改：不再显示 "第 1 轮" 分隔线
      stream.appendChild(buildActorMsgEl(opTurn));
      // 矩阵切到抵抗
      animateMatrix(M.practice3.initialMatrix, op.matrix);
      setActorExpression(op.expr);
      setMatrixLabel('😠', '抵抗');
    }, 600);
  }

  function triggerPractice3Turn1() {
    const t1 = M.practice3.turn1;
    const learnerTurn = { turn: 1, role: 'learner', text: t1.learnerText, history: false };
    M.practice3.turns.push(learnerTurn);
    $('actorDialogStream').appendChild(buildActorMsgEl(learnerTurn));
    $('actorDialogStream').scrollTop = $('actorDialogStream').scrollHeight;
    $('actorInput').value = '';
    setTimeout(() => {
      animateMatrix(t1.matrixFrom, t1.matrixTo);
      setActorExpression(t1.actorExpr);
      setMatrixLabel(t1.matrixEmoji, t1.matrixLabel);
      setTimeout(() => {
        const actorTurn = { turn: 1, role: 'actor', text: t1.actorText, emoji: t1.actorEmoji, expr: t1.actorExpr, matrix: t1.matrixTo };
        M.practice3.turns.push(actorTurn);
        $('actorDialogStream').appendChild(buildActorMsgEl(actorTurn));
        $('actorDialogStream').scrollTop = $('actorDialogStream').scrollHeight;
        state.actorPending = false;
        setTimeout(() => appendNeoMsg('coach', t1.neoSync), 800);
      }, 600);
    }, 250);
  }

  /* ==========  输入框处理  ========== */
  function setupActorInput() {
    const inp = $('actorInput');
    const btn = $('actorSend');
    const mic = $('actorMic');
    // 自适应高度（默认 2 行 ~44px · 最大 140px）
    inp.addEventListener('input', () => {
      inp.style.height = 'auto';
      inp.style.height = Math.min(140, Math.max(44, inp.scrollHeight)) + 'px';
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendActorInput(); }
    });
    // ★ 修 bug：发送按钮 click 之前没 bind
    btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); sendActorInput(); });
    if (mic) mic.addEventListener('click', () => showToast('语音输入 · demo 暂未接入'));
  }
  function sendActorInput() {
    if ($('modalMask').classList.contains('open')) return;
    if ($('actorInput').disabled) return;
    if (state.currentPhase !== 'roleplay') return;
    if (state.isReadOnlyRoleplay) { showToast('自由探讨仅查看'); return; }
    if (state.actorPending) return;  // 等 Actor 反应完再接受下一句
    // 演练 1 主路径 · v8 · 4 轮
    if (state.currentPracticeId === 'practice-1') {
      const learnerCount = (turnNo) => M.practice1.turns.filter(t => t.turn === turnNo && t.role === 'learner').length;
      if (learnerCount(1) === 0)      { state.actorPending = true; triggerPractice1Turn1(); }
      else if (learnerCount(2) === 0) { state.actorPending = true; triggerPractice1Turn2(); }
      else if (learnerCount(3) === 0) { state.actorPending = true; triggerPractice1Turn3(); }
      else if (learnerCount(4) === 0) { state.actorPending = true; triggerPractice1Turn4(); }
      else { showToast('演练 1 已完成 · 进入复盘'); }
    } else if (state.currentPracticeId === 'practice-3') {
      if (M.practice3.turns.filter(t => t.turn === 1 && t.role === 'learner').length === 0) {
        state.actorPending = true;
        triggerPractice3Turn1();
      }
    }
  }

  function setupNeoInput() {
    const ti = $('neoInput');
    ti.addEventListener('input', () => { ti.style.height = 'auto'; ti.style.height = Math.min(140, ti.scrollHeight) + 'px'; });
    ti.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendNeoInput(); } });
    $('neoSend').addEventListener('click', sendNeoInput);
    // v8.5: Neo 消息点赞 / 点踩 / 评论反馈 · 委托到 stream 上
    $('neoStream').addEventListener('click', e => {
      const voteBtn = e.target.closest('.msg-action[data-vote]');
      if (voteBtn) {
        const vote = voteBtn.dataset.vote;
        const actions = voteBtn.parentElement;
        const wasActive = voteBtn.classList.contains('active');
        // 仅 vote 按钮互斥
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
    if ($('modalMask').classList.contains('open')) return;  // Modal 打开时不接收输入
    const ti = $('neoInput');
    const text = ti.value.trim(); if (!text) return;
    appendUserMsg(text); ti.value = ''; ti.style.height = 'auto';
    // 按阶段响应
    if (state.currentPhase === 'intro') {
      if (state.introTriggered) return;  // 防连续输入触发多次切阶段
      state.introTriggered = true;
      setTimeout(() => transitionToRoleplay(), 400);
    } else if (state.currentPhase === 'roleplay' && !state.isFreeDiscussMode) {
      // 演练阶段 · 学员可选问 Neo · 固定回应
      if (state.currentPracticeId === 'practice-1') {
        setTimeout(() => appendNeoMsg('coach', M.practice1.optionalNeoQuestion), 600);
      } else if (state.currentPracticeId === 'practice-3') {
        setTimeout(() => appendNeoMsg('coach', '专注眼前这一轮——把刚才的发现用在对话里。'), 600);
      }
    } else if (state.currentPhase === 'review') {
      // 复盘阶段 · 用阶段内独立计数器 state.triggerStep
      state.triggerStep = (state.triggerStep || 0) + 1;
      if (state.triggerStep === 1) {
        // 触发点 4 · Neo 苏格拉底 2
        setTimeout(() => appendNeoMsg('coach', M.reviewNeoSequence.socratic2), 700);
      } else if (state.triggerStep === 2) {
        // 触发点 5 · 必给总结 + 任务卡 + lead to report
        setTimeout(() => {
          appendNeoMsg('coach', M.reviewNeoSequence.finalSummary);
          setTimeout(() => appendTaskCard(M.reviewNeoSequence.taskCard), 800);
          setTimeout(() => appendNeoMsg('coach', M.reviewNeoSequence.leadToReport), 1800);
        }, 700);
      } else {
        // 触发点 7 · 切报告
        setTimeout(() => transitionToPhase('report'), 500);
      }
    } else if (state.currentPhase === 'report') {
      if (state.reportClosed) return;
      if (!state.reportLoaded) {
        // v8: 报告 2s 已自动加载 · 学员若在 2s 内输入则立即 fast-forward
        fillReportNow();
      } else {
        // 触发点 10 · Neo 收尾 + Modal
        state.reportClosed = true;
        setTimeout(() => {
          appendNeoMsg('coach', M.reportNeoSequence.closing);
          setTimeout(() => showCompletionModal(), 1500);
        }, 600);
      }
    } else if (state.isFreeDiscussMode) {
      // 自由探讨 · 回顾型答疑
      if (state.currentPracticeId === 'practice-2') {
        setTimeout(() => appendNeoMsg('qa', M.freeDiscussNeoSequence.p2QuestionAnswer), 700);
      } else {
        setTimeout(() => appendNeoMsg('qa', '回顾过去的演练我可以引用具体某一轮——你想对比哪一句？'), 700);
      }
    }
  }

  function transitionToRoleplay() {
    state.currentPhase = 'roleplay';
    state.triggerStep = 0;
    M.phaseStatus[0].status = 'completed';
    M.phaseStatus[1].status = 'current';
    renderSubbar();
    renderView();
    renderLDPhase();
    showToast(M.introToRoleplayToast);
    // v8: 不再推 pending advice · 改为 Actor 主动开场
    if (state.currentPracticeId === 'practice-1' && M.practice1.turns.length === 0) {
      setTimeout(() => triggerPractice1Opening(), 500);
    }
  }

  /* ==========  Lecture Drawer 控制  ========== */
  function openLectureDrawer() { $('lectureDrawerMask').classList.add('open'); $('lectureDrawer').classList.add('open'); }
  function closeLectureDrawer() { $('lectureDrawerMask').classList.remove('open'); $('lectureDrawer').classList.remove('open'); }
  function setupLectureDrawer() {
    $('lectureDrawerBtn').addEventListener('click', openLectureDrawer);
    $('lectureDrawerClose').addEventListener('click', closeLectureDrawer);
    $('lectureDrawerMask').addEventListener('click', closeLectureDrawer);
    document.querySelectorAll('.ld-tab').forEach(t => t.addEventListener('click', () => {
      document.querySelectorAll('.ld-tab').forEach(e => e.classList.remove('active'));
      document.querySelectorAll('.ld-panel').forEach(e => e.classList.remove('active'));
      t.classList.add('active');
      document.querySelector('.ld-panel[data-panel="' + t.dataset.tab + '"]').classList.add('active');
    }));
  }

  /* ==========  Topbar dropdowns  ========== */
  function setupDropdowns() {
    function close() { $('bellDropdown').classList.remove('open'); $('avatarDropdown').classList.remove('open'); }
    $('bellBtn').addEventListener('click', e => { e.stopPropagation(); $('avatarDropdown').classList.remove('open'); $('bellDropdown').classList.toggle('open'); });
    $('avatarBtn').addEventListener('click', e => { e.stopPropagation(); $('bellDropdown').classList.remove('open'); $('avatarDropdown').classList.toggle('open'); });
    document.addEventListener('click', close);
    $('markAllRead').addEventListener('click', e => {
      e.stopPropagation();
      // US-V12-LINK-005: 跨场域已读
      const role = (window.Session?.get()?.role) || 'learner';
      if (typeof MessagesRead === 'object') MessagesRead.markAllReadFor(role);
      document.querySelectorAll('.msg-dot-unread').forEach(d => d.remove());
      $('bellBadge').style.display = 'none';
    });
    $('openSettings').addEventListener('click', () => { close(); openSettingsDrawer(); });
    // I-V12-07: switchPort 真跳转 + 二次确认（沿用 hall.html 实现）
    const switchPort = $('switchPort');
    if (switchPort) {
      const canSwitch = window.Session && Session.canSwitchPort();
      if (!canSwitch) {
        switchPort.style.opacity = '0.45';
        switchPort.style.cursor = 'not-allowed';
        switchPort.title = '你只有学员角色 · 多角色账号才能切换端口';
      }
      switchPort.addEventListener('click', () => {
        close();
        if (!canSwitch) { showToast('你只有学员角色 · 不能切到管理端'); return; }
        openModal(`
          <div class="modal-title">切换到管理端</div>
          <div class="modal-body">
            <p>你将离开学员端，进入管理端工作台。</p>
            <p style="color:var(--ink-3);font-size:12px;margin-top:8px">多角色账号 · 切换后可随时切回学员端</p>
          </div>
          <div class="modal-actions">
            <button class="modal-btn" onclick="closeModal()">取消</button>
            <button class="modal-btn primary" onclick="closeModal();Router.go('mgthome',{from:'practice'});">确认切换</button>
          </div>
        `);
      });
    }
    const logoutBtn = $('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
      close();
      openModal(`
        <div class="modal-title">退出登录</div>
        <div class="modal-body"><p>确定要退出登录吗？</p></div>
        <div class="modal-actions">
          <button class="modal-btn" onclick="closeModal()">取消</button>
          <button class="modal-btn primary" onclick="Session.clear();Router.go('login');">确定退出</button>
        </div>
      `);
    });
    const openHelp = $('openHelp'); if (openHelp) openHelp.addEventListener('click', () => { showToast('帮助中心建设中'); close(); });
  }

  /* ==========  Settings drawer (复用 lecture · 含 persona 切换)  ========== */
  function setupSettingsDrawer() {
    function open() { $('settingsDrawerMask').classList.add('open'); $('settingsDrawer').classList.add('open'); }
    function close() { $('settingsDrawerMask').classList.remove('open'); $('settingsDrawer').classList.remove('open'); }
    window.openSettingsDrawer = open;
    $('settingsDrawerMask').addEventListener('click', e => { if (e.target === $('settingsDrawerMask')) close(); });
    $('settingsClose').addEventListener('click', close);
    document.querySelectorAll('[data-persona]').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('[data-persona]').forEach(e => e.classList.remove('active'));
      b.classList.add('active'); state.settings.persona = b.dataset.persona;
      localStorage.setItem('rx-persona', state.settings.persona);
      const personaImg = 'assets/neo-' + state.settings.persona + '.png';
      $('neoAvatar').src = personaImg;
      document.querySelectorAll('.msg.neo .msg-avatar img').forEach(img => { img.src = personaImg; });
    }));
    document.querySelectorAll('[data-theme]').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('[data-theme]').forEach(e => e.classList.remove('active'));
      b.classList.add('active'); state.settings.theme = b.dataset.theme;
      localStorage.setItem('rx-theme', state.settings.theme);
      document.documentElement.setAttribute('data-theme', state.settings.theme);
    }));
    document.querySelectorAll('[data-speed]').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('[data-speed]').forEach(e => e.classList.remove('active'));
      b.classList.add('active'); state.settings.speed = b.dataset.speed;
      localStorage.setItem('rx-speed', state.settings.speed);
    }));
    document.querySelectorAll('[data-persona]').forEach(b => b.classList.toggle('active', b.dataset.persona === state.settings.persona));
    document.querySelectorAll('[data-theme]').forEach(b => b.classList.toggle('active', b.dataset.theme === state.settings.theme));
    document.querySelectorAll('[data-speed]').forEach(b => b.classList.toggle('active', b.dataset.speed === state.settings.speed));
  }

  /* ==========  Note float  ========== */
  function setupNoteFloat() {
    const ball = $('noteFloat'), panel = $('notePanel');
    let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0, didDrag = false;
    ball.addEventListener('mousedown', e => { dragging = true; didDrag = false; sx = e.clientX; sy = e.clientY; const r = ball.getBoundingClientRect(); ox = r.left; oy = r.top; });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const moved = Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 4;
      if (moved) didDrag = true;
      ball.style.left = Math.max(8, Math.min(window.innerWidth - 64, ox + (e.clientX - sx))) + 'px';
      ball.style.right = 'auto';
      ball.style.top = Math.max(8, Math.min(window.innerHeight - 64, oy + (e.clientY - sy))) + 'px';
      ball.style.bottom = 'auto';
    });
    document.addEventListener('mouseup', () => {
      if (dragging && !didDrag) {
        if (panel.classList.contains('open')) panel.classList.remove('open');
        else { panel.classList.add('open'); $('noteTag').textContent = '📍 对练 · ' + ({ intro: '导入', roleplay: '演练', review: '复盘', report: '报告' }[state.currentPhase] || '自由探讨'); positionPanel(); }
      }
      dragging = false;
    });
    function positionPanel() {
      const margin = 16;
      const rect = ball.getBoundingClientRect();
      panel.style.left = '0px'; panel.style.top = '0px';
      requestAnimationFrame(() => {
        const panelW = panel.offsetWidth || 480;
        const panelH = panel.offsetHeight || 320;
        let left = rect.left;
        if (left + panelW > window.innerWidth - margin) left = rect.right - panelW;
        if (left < margin) left = margin;
        let top = rect.top - panelH - 12;
        if (top < margin) top = rect.bottom + 12;
        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
      });
    }
    $('noteClose').addEventListener('click', () => panel.classList.remove('open'));
    $('noteBody').addEventListener('input', () => { $('noteCounter').textContent = $('noteBody').innerText.length + ' / 500'; });
    $('noteArchive').addEventListener('click', () => {
      const t = $('noteBody').innerText.trim();
      if (!t) { showToast('笔记是空的'); return; }
      // US-V12-LINK-003: 写入跨场域 Notes store
      if (typeof Notes === 'object') {
        Notes.add({ content: t, source: '对练 · ' + (M.activity?.name || ''), activityId: state.activityId });
      }
      $('noteBody').innerHTML = ''; $('noteCounter').textContent = '0 / 500';
      panel.classList.remove('open'); showToast('已归档到大厅笔记库');
    });
  }

  function setupNeoCollapse() { $('neoCollapse').addEventListener('click', () => { $('neoChat').classList.toggle('collapsed'); }); }
  function setupNeoResize() {
    const handle = $('neoResize'); const root = document.documentElement;
    let dragging = false, startX = 0, startW = 0;
    handle.addEventListener('mousedown', e => { dragging = true; startX = e.clientX; startW = parseInt(getComputedStyle($('neoChat')).width); handle.classList.add('dragging'); document.body.style.cursor = 'ew-resize'; });
    document.addEventListener('mousemove', e => { if (!dragging) return; const w = Math.max(320, Math.min(667, startW - (e.clientX - startX))); root.style.setProperty('--neo-w', w + 'px'); });
    document.addEventListener('mouseup', () => { if (dragging) { dragging = false; handle.classList.remove('dragging'); document.body.style.cursor = ''; } });
  }

  /* ==========  Actor 左下背景区 · H2 tabs 切换（动态数量 ≤10）  ========== */
  function parseIntroSections() {
    // 从 introMarkdown 解析 H2 sections · 返回 [{ title, body }]
    const md = M.introMarkdown || '';
    const lines = md.split('\n');
    const sections = [];
    let cur = null;
    for (const ln of lines) {
      const m = ln.match(/^##\s+(.+?)\s*$/);
      if (m) {
        if (cur) sections.push(cur);
        cur = { title: m[1].trim(), bodyLines: [] };
      } else if (cur) {
        cur.bodyLines.push(ln);
      }
    }
    if (cur) sections.push(cur);
    return sections.slice(0, 10).map(s => ({ title: s.title, body: s.bodyLines.join('\n').trim() }));
  }

  function renderActorBgTabs() {
    const sections = parseIntroSections();
    const tabsEl = $('actorBgTabs');
    const contentEl = $('actorBgContent');
    if (!tabsEl || !contentEl || sections.length === 0) return;
    tabsEl.innerHTML = sections.map((s, i) =>
      `<button class="actor-bg-tab${i === 0 ? ' active' : ''}" data-idx="${i}">${escapeHtml(s.title)}</button>`
    ).join('');
    function showTab(idx) {
      tabsEl.querySelectorAll('.actor-bg-tab').forEach((el, i) => el.classList.toggle('active', i === idx));
      contentEl.innerHTML = renderMarkdown(sections[idx].body);
    }
    tabsEl.querySelectorAll('.actor-bg-tab').forEach(el => {
      el.addEventListener('click', () => showTab(+el.dataset.idx));
    });
    showTab(0);
  }
  // 兼容旧调用名
  function renderActorBgScroll() { renderActorBgTabs(); }

  /* ==========  Timer  ========== */
  function setupTimer() {
    state.timerInterval = setInterval(() => {
      if (!state.isPaused) {
        state.totalLearningTime++;
        $('subbarTimerText').textContent = fmtTime(state.totalLearningTime);
      }
    }, 1000);
  }

  /* ==========  INIT  ========== */
  function init() {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    $('neoAvatar').src = 'assets/neo-' + state.settings.persona + '.png';
    // URL ?phase=intro/roleplay/review/report 直跳支持
    const urlPhase = new URL(location.href).searchParams.get('phase');
    if (urlPhase && ['intro', 'roleplay', 'review', 'report'].includes(urlPhase)) {
      state.currentPhase = urlPhase;
      // 同步 phaseStatus
      const idx = ['intro', 'roleplay', 'review', 'report'].indexOf(urlPhase);
      M.phaseStatus.forEach((p, i) => {
        if (i < idx) p.status = 'completed';
        else if (i === idx) p.status = 'current';
        else p.status = 'locked';
      });
    }
    // Activity 身份（hall/抽屉跳过来时带 ?activity=c2-a3 · 进度按此 id 隔离 · demo 暂不持久化）
    state.activityId = new URL(location.href).searchParams.get('activity') || null;
    state.fromPage = new URL(location.href).searchParams.get('from') || 'hall';
    // I-V12-02 / spec § 9.3.2.8.8: ?mode=free 进入自由探讨模式（已完成 Activity 自动）
    const urlMode = new URL(location.href).searchParams.get('mode');
    if (urlMode === 'free') {
      state.isFreeDiscussMode = true;
      M.phaseStatus.forEach(p => p.status = 'completed');
      state.currentPhase = 'report';
    }

    renderAvatar();
    renderBellMessages();
    renderSubbar();
    renderView();
    renderLDPhase();
    renderLDProject();

    setupDropdowns();
    setupSettingsDrawer();
    setupNoteFloat();
    setupNeoCollapse();
    setupNeoResize();
    setupNeoInput();
    setupActorInput();
    setupLectureDrawer();
    setupReplayButton();
    setupTimer();

    // 进入即推消息 · 不计时
    if (state.currentPhase === 'intro') {
      pushIntroNeoMessages();
    } else if (state.currentPhase === 'roleplay') {
      // v8: 直跳演练阶段 · Actor 主动开场（不再推 pending advice）
      if (state.currentPracticeId === 'practice-1' && M.practice1.turns.length === 0) {
        setTimeout(() => triggerPractice1Opening(), 500);
      }
    } else if (state.currentPhase === 'review') {
      pushReviewSocratic1();
    } else if (state.currentPhase === 'report') {
      setTimeout(() => appendNeoMsg('coach', M.reportNeoSequence.open), 400);
      scheduleAutoFillReport();  // v8: 报告 2s 自动加载
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
