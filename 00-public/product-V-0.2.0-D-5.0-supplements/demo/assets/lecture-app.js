/* ============================================================
   Lecture · APP LOGIC
   ------------------------------------------------------------
   核心交互链：
   进入（默认 SCO 16 综合判断单选题）→ 答错 Neo Chat 苏格拉底追问
   → 答对 Neo Chat 反应 → 解锁 SCO 17 → 自动切到 SCO 17
   → Neo 演绎 SCO 17 总结升华（同步播放 TTS MP3 + 4 句分时打字）
   → 演绎完成 → 弹完成 Modal
   → "返回大厅" / "下一 Activity" 灰色 disabled
   → 唯一可点"自由复习"→ 进入自由讨论
   ============================================================ */

(function () {
  const M = window.LECTURE_MOCK;
  const $ = id => document.getElementById(id);

  /* ==========  STATE  ========== */
  const state = {
    currentSCO: 16,
    isPaused: false,
    isFreeReviewMode: false,
    // I-V12-08: 主动回顾跳转态（spec § 1.5.2 ⑧ + § 1.5.3 · Neo 主导回归）
    isReviewing: false,
    preReviewSCO: null,
    reviewExchanges: 0,  // 学员在回顾态发的消息数 · 累计 ≥ 2 时 Neo 评估"问题清楚"主动跳回
    totalLearningTime: 1623,
    timerInterval: null,
    idleTimer: null,
    idleThreshold: 60 * 1000,
    lastActivityAt: Date.now(),
    videoMaxPlayedSec: 0,
    quizState: {},
    matchState: { activeLeft: null, connections: {} },
    ttsAudio: null,
    ttsTimers: [],
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
  function getSCOByOrder(n) { return M.scoSequence.find(s => s.order === n); }
  function getCurrentSCO() { return getSCOByOrder(state.currentSCO); }
  function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  // TTS 语速联动设置 · 慢=1.0x / 中=1.1x / 快=1.2x
  const SPEED_RATE = { slow: 1.0, normal: 1.1, fast: 1.2 };
  function getSpeedRate() { return SPEED_RATE[state.settings.speed] || 1.0; }

  /* ==========  Type label maps（中文友好）  ========== */
  const TYPE_LABEL = {
    SLICE: '课件',
    VIDEO: '视频',
    QUIZ: '测验',
    FEEDBACK_COLLECT: '场景反馈 · 课前采集',
    FEEDBACK_REVIEW: '场景反馈 · 课后回看'
  };
  const QUIZ_TYPE_LABEL = {
    single_choice: '单选',
    multi_choice: '多选',
    judge: '判断',
    fill_blank: '填空',
    match: '连线',
    sort: '排序',
    qa: '问答'
  };

  /* ==========  RENDER · Avatar  ========== */
  const GRAD_PALETTE = [['#D97757','#E89B6E'],['#9B7CD9','#C4A5E8'],['#5A9BBF','#7DBCE0'],['#D9A957','#EBC179'],['#7CA873','#9EBE96'],['#C95B7C','#E58CA5'],['#5C7AAB','#7E9BC7'],['#B86A8A','#D699B0']];
  function getGradFor(name) { let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; return GRAD_PALETTE[h % GRAD_PALETTE.length]; }
  function renderAvatar() {
    const c = $('avatarCircle');
    const [a, b] = getGradFor(M.learner.name);
    c.style.background = `linear-gradient(135deg, ${a}, ${b})`;
    c.textContent = M.learner.firstChar;
    $('avatarName').textContent = M.learner.name;
    // 头像 dropdown 角色行（与 hall 一致）
    const adRole = document.querySelector('.ad-role');
    if (adRole) adRole.textContent = M.learner.role;
    const adName = document.querySelector('.ad-name');
    if (adName) adName.textContent = M.learner.name;
  }

  /* ==========  RENDER · Subbar  ========== */
  function renderSubbar() {
    const sco = getCurrentSCO();
    if (!sco) return;
    $('subbarActivity').textContent = M.activity.name;  // 不显示 ACT 编号
    if (state.isFreeReviewMode) {
      $('subbarActivityMeta').innerHTML = '<span class="subbar-mode-chip">复习模式</span>';
    } else {
      $('subbarActivityMeta').textContent = '· 授课';
    }
    const valid = M.scoSequence.filter(s => s.status !== 'always_locked');
    const total = valid.length;
    const doneCount = state.isFreeReviewMode
      ? total
      : valid.filter(s => s.status === 'completed').length;
    const pct = total > 0 ? Math.round(doneCount / total * 100) : 0;
    const currentIdx = valid.findIndex(s => s.order === state.currentSCO);
    const currentPct = currentIdx >= 0 && total > 1 ? (currentIdx / (total - 1)) * 100 : 0;
    $('subbarProgressFill').style.width = pct + '%';
    const cur = $('subbarProgressCurrent');
    if (state.isFreeReviewMode) {
      cur.style.display = 'none';
    } else {
      cur.style.display = '';
      cur.style.left = `calc(${currentPct}% - 1px)`;
    }
    $('subbarProgressLabel').innerHTML = `<b>${pct}%</b>`;
    $('subbarTimerText').textContent = fmtTime(state.totalLearningTime);
    $('subbarTimer').classList.toggle('paused', state.isPaused);
  }

  /* ==========  RENDER · View Panel  ========== */
  function showOnlyView(viewName) {
    ['viewSlice', 'viewVideo', 'viewQuiz', 'viewFeedbackCollect', 'viewFeedbackReview'].forEach(id => {
      $(id).style.display = (id === viewName) ? '' : 'none';
    });
  }
  function renderView() {
    const sco = getCurrentSCO();
    if (!sco) return;
    if (sco.type === 'SLICE') {
      showOnlyView('viewSlice');
      $('sliceImage').src = sco.asset || 'assets/ppt/MANAGER3_segment_1.1.jpg';
      $('pauseOverlay').classList.toggle('show', state.isPaused);
    } else if (sco.type === 'VIDEO') {
      showOnlyView('viewVideo');
      const vp = $('videoPlayer');
      if (!vp.src.endsWith('case-zhao-32.mp4')) vp.src = sco.asset;
    } else if (sco.type === 'QUIZ') {
      showOnlyView('viewQuiz');
      renderQuiz(sco);
    } else if (sco.type === 'FEEDBACK_COLLECT') {
      showOnlyView('viewFeedbackCollect');
      $('collectTitle').textContent = sco.title;
      $('collectPrompt').textContent = sco.prompt;
    } else if (sco.type === 'FEEDBACK_REVIEW') {
      showOnlyView('viewFeedbackReview');
      $('reviewTitle').textContent = sco.title;
      $('reviewPrompt').textContent = sco.prompt;
    }
  }

  /* ==========  RENDER · Quiz  ========== */
  function renderQuiz(sco) {
    $('quizStatus').textContent = '';
    $('quizStatus').className = 'quiz-status';
    $('quizRetry').style.display = 'none';

    state.quizState = { selected: null, multiSelected: [], judge: null, blanks: [], sortOrder: [], submitted: false };
    state.matchState = { activeLeft: null, connections: {} };

    const body = $('quizBody');
    let html = `<div class="quiz-question">${sco.question}</div>`;
    if (sco.quizType === 'single_choice') {
      html += '<div class="quiz-options">';
      sco.options.forEach(o => html += `<div class="quiz-option" data-key="${o.key}"><div class="quiz-option-key">${o.key}</div><div>${o.text}</div></div>`);
      html += '</div>';
    } else if (sco.quizType === 'multi_choice') {
      html += '<div class="quiz-options">';
      sco.options.forEach(o => html += `<div class="quiz-option" data-key="${o.key}"><div class="quiz-option-key checkbox">${o.key}</div><div>${o.text}</div></div>`);
      html += '</div>';
    } else if (sco.quizType === 'judge') {
      html += `<div class="quiz-judge"><div class="quiz-judge-btn" data-judge="true"><span class="quiz-judge-icon">✓</span><span>对</span></div><div class="quiz-judge-btn" data-judge="false"><span class="quiz-judge-icon">✗</span><span>错</span></div></div>`;
    } else if (sco.quizType === 'fill_blank') {
      let qFilled = sco.question;
      sco.blanks.forEach((_, i) => qFilled = qFilled.replace('____', `<input type="text" data-blank="${i}" placeholder="..." />`));
      html = `<div class="quiz-question">${sco.title}</div><div class="quiz-fill">${qFilled}</div>`;
    } else if (sco.quizType === 'match') {
      html += '<div class="quiz-match"><div class="quiz-match-col" data-side="left">';
      sco.leftItems.forEach(o => html += `<div class="quiz-match-item" data-key="${o.key}" data-side="left">${o.text}</div>`);
      html += '</div><div class="quiz-match-col" data-side="right">';
      sco.rightItems.forEach(o => html += `<div class="quiz-match-item" data-key="${o.key}" data-side="right">${o.text}</div>`);
      html += '</div><svg class="quiz-match-svg" id="quizMatchSvg"></svg></div>';
    } else if (sco.quizType === 'sort') {
      html += '<div class="quiz-sort" id="quizSort">';
      sco.shuffledItems.forEach((o, i) => html += `<div class="quiz-sort-item" draggable="true" data-key="${o.key}"><div class="quiz-sort-handle">⋮⋮</div><div class="quiz-sort-num">${i + 1}</div><div>${o.text}</div></div>`);
      html += '</div>';
      state.quizState.sortOrder = sco.shuffledItems.map(o => o.key);
    } else if (sco.quizType === 'qa') {
      html += '<div class="quiz-qa"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg><div>请在右侧 Chat 区作答</div><span class="quiz-qa-hint">提交一条 ≥ 30 字的回答即可完成本题</span></div>';
    }
    // 多选 / 连线 / 排序 题内提交按钮
    if (['multi_choice', 'match', 'sort'].includes(sco.quizType)) {
      html += '<div style="text-align:center;margin-top:18px"><button class="quiz-inline-submit" id="quizInlineSubmit" disabled>提交</button></div>';
    }
    body.innerHTML = html;
    bindQuizInteractions(sco);
  }

  function bindQuizInteractions(sco) {
    // 自动判定 type：single_choice / judge / fill_blank / qa
    // 题内提交按钮 type：multi_choice / match / sort
    const inlineSubmitBtn = document.getElementById('quizInlineSubmit');
    if (sco.quizType === 'single_choice') {
      document.querySelectorAll('#quizBody .quiz-option').forEach(el => el.addEventListener('click', () => {
        if (state.quizState.submitted) return;
        document.querySelectorAll('#quizBody .quiz-option').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected'); state.quizState.selected = el.dataset.key;
        setTimeout(() => submitQuiz(), 250);  // 轻微延迟 · 让用户看到选中态
      }));
    } else if (sco.quizType === 'multi_choice') {
      document.querySelectorAll('#quizBody .quiz-option').forEach(el => el.addEventListener('click', () => {
        if (state.quizState.submitted) return;
        el.classList.toggle('selected'); const k = el.dataset.key; const arr = state.quizState.multiSelected;
        const i = arr.indexOf(k); if (i === -1) arr.push(k); else arr.splice(i, 1);
        if (inlineSubmitBtn) inlineSubmitBtn.disabled = arr.length === 0;
      }));
      if (inlineSubmitBtn) inlineSubmitBtn.addEventListener('click', submitQuiz);
    } else if (sco.quizType === 'judge') {
      document.querySelectorAll('#quizBody .quiz-judge-btn').forEach(el => el.addEventListener('click', () => {
        if (state.quizState.submitted) return;
        document.querySelectorAll('#quizBody .quiz-judge-btn').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected'); state.quizState.judge = el.dataset.judge === 'true';
        setTimeout(() => submitQuiz(), 250);
      }));
    } else if (sco.quizType === 'fill_blank') {
      document.querySelectorAll('#quizBody input[data-blank]').forEach(inp => {
        inp.addEventListener('input', () => {
          if (state.quizState.submitted) return;
          const inputs = [...document.querySelectorAll('#quizBody input[data-blank]')];
          state.quizState.blanks = inputs.map(i => i.value.trim());
        });
        inp.addEventListener('blur', () => {
          if (state.quizState.submitted) return;
          if (state.quizState.blanks.every(v => v)) setTimeout(() => submitQuiz(), 200);
        });
      });
    } else if (sco.quizType === 'match') {
      document.querySelectorAll('#quizBody .quiz-match-item').forEach(el => el.addEventListener('click', () => {
        if (state.quizState.submitted) return;
        const side = el.dataset.side, key = el.dataset.key;
        if (side === 'left') {
          document.querySelectorAll('#quizBody .quiz-match-item[data-side="left"]').forEach(e => e.classList.remove('active'));
          el.classList.add('active'); state.matchState.activeLeft = key;
        } else if (side === 'right' && state.matchState.activeLeft) {
          state.matchState.connections[state.matchState.activeLeft] = key;
          document.querySelector(`.quiz-match-item[data-key="${state.matchState.activeLeft}"]`).classList.add('connected');
          document.querySelector(`.quiz-match-item[data-key="${state.matchState.activeLeft}"]`).classList.remove('active');
          el.classList.add('connected'); state.matchState.activeLeft = null; drawMatchLines(sco);
          if (inlineSubmitBtn) inlineSubmitBtn.disabled = Object.keys(state.matchState.connections).length < sco.leftItems.length;
        }
      }));
      if (inlineSubmitBtn) inlineSubmitBtn.addEventListener('click', submitQuiz);
    } else if (sco.quizType === 'sort') {
      const list = $('quizSort'); let dragSrc = null;
      list.querySelectorAll('.quiz-sort-item').forEach(item => {
        item.addEventListener('dragstart', e => { if (state.quizState.submitted) { e.preventDefault(); return; } dragSrc = item; item.classList.add('dragging'); });
        item.addEventListener('dragend', () => { item.classList.remove('dragging'); list.querySelectorAll('.quiz-sort-item').forEach(it => it.classList.remove('drag-over')); });
        item.addEventListener('dragover', e => { e.preventDefault(); if (dragSrc && dragSrc !== item) item.classList.add('drag-over'); });
        item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
        item.addEventListener('drop', e => {
          e.preventDefault(); if (!dragSrc || dragSrc === item) return;
          const items = [...list.querySelectorAll('.quiz-sort-item')];
          const fromIdx = items.indexOf(dragSrc), toIdx = items.indexOf(item);
          if (fromIdx < toIdx) item.after(dragSrc); else item.before(dragSrc);
          state.quizState.sortOrder = [...list.querySelectorAll('.quiz-sort-item')].map(el => el.dataset.key);
          [...list.querySelectorAll('.quiz-sort-num')].forEach((n, i) => n.textContent = i + 1);
          if (inlineSubmitBtn) inlineSubmitBtn.disabled = false;
        });
      });
      if (inlineSubmitBtn) inlineSubmitBtn.addEventListener('click', submitQuiz);
    } else if (sco.quizType === 'qa') {
      $('quizStatus').textContent = '请在右侧 Chat 区输入回答（≥ 30 字）';
    }
  }

  function drawMatchLines(sco) {
    const svg = $('quizMatchSvg'); if (!svg) return;
    const containerRect = svg.parentElement.getBoundingClientRect();
    svg.setAttribute('width', containerRect.width); svg.setAttribute('height', containerRect.height);
    let lines = '';
    Object.entries(state.matchState.connections).forEach(([lk, rk]) => {
      const lEl = document.querySelector(`.quiz-match-item[data-key="${lk}"]`);
      const rEl = document.querySelector(`.quiz-match-item[data-key="${rk}"]`);
      if (!lEl || !rEl) return;
      const lr = lEl.getBoundingClientRect(), rr = rEl.getBoundingClientRect();
      const x1 = lr.right - containerRect.left, y1 = lr.top + lr.height / 2 - containerRect.top;
      const x2 = rr.left - containerRect.left, y2 = rr.top + rr.height / 2 - containerRect.top;
      lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--accent)" stroke-width="2" />`;
    });
    svg.innerHTML = lines;
  }

  function submitQuiz() {
    const sco = getCurrentSCO();
    if (!sco || state.quizState.submitted) return;
    state.quizState.submitted = true;
    let correct = false;
    if (sco.quizType === 'single_choice') {
      correct = sco.correct.includes(state.quizState.selected);
      document.querySelectorAll('#quizBody .quiz-option').forEach(el => el.classList.add('disabled'));
    } else if (sco.quizType === 'multi_choice') {
      const chosen = state.quizState.multiSelected.slice().sort();
      const correctSet = sco.correct.slice().sort();
      correct = chosen.length === correctSet.length && chosen.every((v, i) => v === correctSet[i]);
      document.querySelectorAll('#quizBody .quiz-option').forEach(el => el.classList.add('disabled'));
    } else if (sco.quizType === 'judge') {
      correct = state.quizState.judge === sco.correct;
      document.querySelectorAll('#quizBody .quiz-judge-btn').forEach(el => el.style.pointerEvents = 'none');
    } else if (sco.quizType === 'fill_blank') {
      correct = sco.blanks.every((expected, i) => (state.quizState.blanks[i] || '').includes(expected));
      document.querySelectorAll('#quizBody input').forEach(i => i.disabled = true);
    } else if (sco.quizType === 'match') {
      correct = Object.entries(sco.correct).every(([l, r]) => state.matchState.connections[l] === r);
      document.querySelectorAll('#quizBody .quiz-match-item').forEach(el => el.style.pointerEvents = 'none');
    } else if (sco.quizType === 'sort') {
      correct = state.quizState.sortOrder.every((k, i) => k === sco.correctOrder[i]);
      document.querySelectorAll('#quizBody .quiz-sort-item').forEach(el => el.draggable = false);
    }

    const inlineBtn = document.getElementById('quizInlineSubmit');
    if (correct) {
      if (inlineBtn) inlineBtn.style.display = 'none';
      $('quizStatus').textContent = '';
      $('quizStatus').className = 'quiz-status';
      appendNeoMsg('qa', sco.neoFeedback.correct);

      // ★ SCO 16 综合判断答对 → 推送高光卡 + 任务卡 → 解锁 SCO 17 + 触发 TTS 演绎
      if (sco.order === 16) {
        setTimeout(() => appendHighlightCard({
          title: '从概念升级到行为范式',
          quote: '"上次复盘第三段你卡在哪了？我们看看"',
          neoNote: '不接情绪 + 具体化场景的开场——你已经把今天学的浓缩成可立刻用的一句话',
          meta: '授课 · ACT-001-03 · SCO 16'
        }), 1500);
        setTimeout(() => appendTaskCard({
          title: '本周与赵工试一次新开场',
          body: '下次见到赵工不写复盘的时候，先用"上次第三段你卡在哪"开场试一次，记下他的反应（24 小时内）。'
        }), 3000);
        setTimeout(() => unlockAndPlaySCO17(), 4500);
      } else {
        setTimeout(() => advanceSCO(), 3500);
      }
    } else {
      // 答错：仅 Neo Chat 反馈 · 不显示 quizStatus 红字 · 不显示 quizRetry · 选项重新可点
      $('quizStatus').textContent = '';
      $('quizStatus').className = 'quiz-status';
      appendNeoMsg('qa', sco.neoFeedback.wrong);
      // 重置 submit 状态允许重选
      state.quizState.submitted = false;
      if (sco.quizType === 'single_choice' || sco.quizType === 'multi_choice') {
        document.querySelectorAll('#quizBody .quiz-option').forEach(el => {
          el.classList.remove('disabled');
          if (sco.quizType === 'single_choice') el.classList.remove('selected');
        });
        if (sco.quizType === 'single_choice') state.quizState.selected = null;
        else { state.quizState.multiSelected = []; document.querySelectorAll('#quizBody .quiz-option.selected').forEach(el => el.classList.remove('selected')); }
      } else if (sco.quizType === 'judge') {
        document.querySelectorAll('#quizBody .quiz-judge-btn').forEach(el => { el.style.pointerEvents = ''; el.classList.remove('selected'); });
        state.quizState.judge = null;
      } else if (sco.quizType === 'fill_blank') {
        document.querySelectorAll('#quizBody input[data-blank]').forEach(i => i.disabled = false);
      } else if (sco.quizType === 'match') {
        document.querySelectorAll('#quizBody .quiz-match-item').forEach(el => { el.style.pointerEvents = ''; el.classList.remove('connected', 'active'); });
        state.matchState = { activeLeft: null, connections: {} };
        const svg = document.getElementById('quizMatchSvg'); if (svg) svg.innerHTML = '';
      } else if (sco.quizType === 'sort') {
        document.querySelectorAll('#quizBody .quiz-sort-item').forEach(el => el.draggable = true);
      }
      if (inlineBtn) { inlineBtn.style.display = ''; inlineBtn.disabled = ['multi_choice', 'match', 'sort'].includes(sco.quizType) ? true : false; }
    }
  }
  function retryQuiz() { const sco = getCurrentSCO(); if (sco) renderQuiz(sco); }

  /* ==========  SCO 17 解锁 + TTS 演绎  ========== */
  function unlockAndPlaySCO17() {
    const sco16 = getSCOByOrder(16); if (sco16) sco16.status = 'completed';
    const sco17 = getSCOByOrder(17); if (sco17) sco17.status = 'current';
    state.currentSCO = 17;
    renderSubbar(); renderView(); renderLDSCO();
    showToast('已解锁最后一页');
    setTimeout(() => playNeoTTS(sco17), 800);
  }

  function playNeoTTS(sco) {
    if (!sco || !sco.tts || !sco.neoScripts) return;
    const audioUrl = sco.tts[state.settings.persona] || sco.tts.male;
    const audio = new Audio(audioUrl);
    state.ttsAudio = audio;
    state.ttsCurrentSCO = sco;  // 保留 sco 引用 · 切 persona 时拿 sco.tts 切 audio 源
    state.isPlayingTTS = true;
    state.ttsTimers.forEach(clearTimeout);
    state.ttsTimers = [];
    // 持久化 script 状态（delay = audio 内容时长位置，不受 playbackRate 影响）
    state.ttsScripts = sco.neoScripts.map(s => ({ delay: s.delay, text: s.text, fired: false }));
    state.ttsLastDelay = sco.neoScripts[sco.neoScripts.length - 1].delay;
    state.ttsFinishCallback = null;
    audio.playbackRate = getSpeedRate();

    function finishTTS() {
      if (!state.isPlayingTTS) return;
      state.isPlayingTTS = false;
      state.ttsTimers.forEach(t => { clearTimeout(t); clearInterval(t); });
      state.ttsTimers = [];
      setTimeout(() => showCompletionModal(), 1200);
    }
    state.ttsFinishCallback = finishTTS;
    audio.addEventListener('ended', finishTTS);
    audio.play().catch(err => { console.warn('Audio autoplay blocked, fallback to text-only:', err); });
    scheduleTTSPending();
  }

  // 根据 audio.currentTime 重新调度尚未推送的 script + fallback + keepalive
  // delay 是 audio "内容时长" ms 位置（不受 playbackRate 影响）；real-time wait = remaining / rate
  function scheduleTTSPending() {
    if (!state.isPlayingTTS || !state.ttsAudio || !state.ttsScripts) return;
    state.ttsTimers.forEach(t => { clearTimeout(t); clearInterval(t); });
    state.ttsTimers = [];
    const rate = getSpeedRate();
    const elapsedMs = (state.ttsAudio.currentTime || 0) * 1000;
    state.ttsScripts.forEach(s => {
      if (s.fired) return;
      const remainingContentMs = Math.max(0, s.delay - elapsedMs);
      const remainingRealMs = remainingContentMs / rate;
      const t = setTimeout(() => {
        if (state.isPaused) return;
        appendNeoMsg('lecture', s.text);
        s.fired = true;
        state.lastActivityAt = Date.now();
      }, remainingRealMs);
      state.ttsTimers.push(t);
    });
    state.ttsTimers.push(setInterval(() => { state.lastActivityAt = Date.now(); }, 3000));
    const fallbackContentMs = Math.max(0, state.ttsLastDelay + 10000 - elapsedMs);
    state.ttsTimers.push(setTimeout(() => {
      if ($('modalMask').classList.contains('open')) return;
      if (state.ttsFinishCallback) state.ttsFinishCallback();
    }, fallbackContentMs / rate));
  }

  /* ==========  RENDER · Neo Chat  ========== */
  function neoAvatarHTML() { return `<div class="msg-avatar"><img src="assets/neo-${state.settings.persona}.png" alt="Neo" /></div>`; }
  function userAvatarHTML() { const [a, b] = getGradFor(M.learner.name); return `<div class="msg-avatar user-letter" style="background:linear-gradient(135deg,${a},${b})">${M.learner.firstChar}</div>`; }

  function appendNeoMsg(speech, text) {
    const stream = $('neoStream');
    const speechLabel = speech === 'lecture' ? '授课' : (speech === 'qa' ? '答疑' : '');
    const chip = speechLabel ? `<span class="speech-chip ${speech}">${speechLabel}</span><br>` : '';
    // v2: 三按钮（点赞 / 点踩 / 评论）· 图标与 hall 对齐
    const html = `<div class="msg neo">${neoAvatarHTML()}<div class="msg-body"><div class="msg-bubble">${chip}${text}</div><div class="msg-actions"><button class="msg-action" data-vote="up" title="点赞"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg></button><button class="msg-action" data-vote="down" title="点踩"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zM17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg></button><button class="msg-action" data-act="comment" title="评论"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></button></div></div></div>`;
    stream.insertAdjacentHTML('beforeend', html);
    stream.scrollTop = stream.scrollHeight;
  }
  function appendUserMsg(text) {
    const stream = $('neoStream');
    stream.insertAdjacentHTML('beforeend', `<div class="msg user">${userAvatarHTML()}<div class="msg-body"><div class="msg-bubble">${escapeHtml(text)}</div></div></div>`);
    stream.scrollTop = stream.scrollHeight;
  }

  function appendHighlightCard(h) {
    const stream = $('neoStream');
    const id = 'h-' + Date.now();
    const html = `<div class="neo-card highlight-card" data-card-id="${id}">
      <span class="neo-card-tag">🌟 高光时刻</span>
      <div class="neo-card-title">${h.title}</div>
      <div class="neo-card-quote">${h.quote}</div>
      <div class="neo-card-neo-note">${h.neoNote}</div>
      <div class="neo-card-actions">
        <button class="neo-card-btn primary" data-act="collect">⭐ 收藏</button>
        <button class="neo-card-btn" data-act="ignore">忽略</button>
      </div>
    </div>`;
    stream.insertAdjacentHTML('beforeend', html);
    stream.scrollTop = stream.scrollHeight;
    const card = stream.querySelector(`[data-card-id="${id}"]`);
    card.querySelector('[data-act="collect"]').addEventListener('click', () => collectHighlight(card, h));
    card.querySelector('[data-act="ignore"]').addEventListener('click', () => { card.style.opacity = '.4'; card.querySelector('.neo-card-actions').style.display = 'none'; });
  }
  function appendTaskCard(t) {
    const stream = $('neoStream');
    const id = 'k-' + Date.now();
    const html = `<div class="neo-card" data-card-id="${id}">
      <span class="neo-card-tag">✓ 应用任务</span>
      <div class="neo-card-title">${t.title}</div>
      <div class="neo-card-body">${t.body}</div>
      <div class="neo-card-actions">
        <button class="neo-card-btn primary" data-act="add">+ 加入待办</button>
        <button class="neo-card-btn" data-act="dismiss">暂不</button>
      </div>
    </div>`;
    stream.insertAdjacentHTML('beforeend', html);
    stream.scrollTop = stream.scrollHeight;
    const card = stream.querySelector(`[data-card-id="${id}"]`);
    card.querySelector('[data-act="add"]').addEventListener('click', () => {
      // US-V12-LINK-004: 真写到 _shared/mock/todos.js（修 v1.2 文案骗局）
      Todos.add({ text: t.title, source: '授课 · ' + (M.activity?.name || ''), activityId: state.activityId });
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
        source: 'lecture',
        activityId: state.activityId,
        title: h.title,
        content: h.quote,
        tag: 'lecture'
      });
    }
  }

  function renderInitialChat() {
    const stream = $('neoStream'); stream.innerHTML = '';
    M.chatHistory.forEach(m => {
      if (m.role === 'neo') appendNeoMsg(m.speech || 'lecture', m.text);
      else if (m.role === 'user') appendUserMsg(m.text);
      else if (m.role === 'highlight-card') {
        const id = 'h-' + Math.random();
        const html = `<div class="neo-card highlight-card collected" data-card-id="${id}">
          <span class="neo-card-tag">🌟 高光时刻</span>
          <div class="neo-card-title">${m.highlight.title}</div>
          <div class="neo-card-quote">${m.highlight.quote}</div>
          <div class="neo-card-neo-note">${m.highlight.neoNote}</div>
        </div>`;
        stream.insertAdjacentHTML('beforeend', html);
      }
    });
    stream.scrollTop = stream.scrollHeight;
  }

  /* ==========  RENDER · Lecture Drawer  ========== */
  function renderLDProject() {
    const panel = $('ldPanelProject');
    let html = '';
    M.courseTree.forEach(c => {
      // 不显示 Course 编号 / 不显示锁定状态 · Course 标题对齐 hall
      html += `<div class="ld-course" data-course="${c.id}">
        <div class="ld-course-head">
          <svg class="chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          ${c.name}
        </div>
        <div class="ld-course-list">`;
      c.activities.forEach(a => {
        const isCurrent = a.id === M.activity.id;
        // 仅区分"已完成"和"进行中"，无锁定符号
        const isCompleted = a.status === 'completed';
        const cls = isCurrent ? ' current' : '';
        let iconChar = '', iconCls = '';
        if (isCurrent) { iconChar = '▶'; iconCls = 'current'; }
        else if (isCompleted) { iconChar = '✓'; iconCls = 'completed'; }
        // 未开始：无 icon（留空白）
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
      if (!target) { showToast('该 Activity 暂未开放'); return; }
      closeLectureDrawer();
      Jumper.confirmAndJump(name, target, { activityId, from: 'lecture' });
    }));
  }

  function renderLDSCO() {
    const panel = $('ldPanelSCO');
    // Activity 名 + 进度（顶部一行，参 legacy）
    const completedCount = M.scoSequence.filter(s => s.status === 'completed').length;
    let html = `<div class="ld-act-head"><div class="ld-act-title">${M.activity.name}</div><span class="ld-act-progress">${completedCount} / ${M.scoSequence.length}</span></div>`;

    const TYPE_LABEL_FOR_THUMB = { SLICE: '课件', VIDEO: '视频', QUIZ: '测验', FEEDBACK_COLLECT: '场景反馈', FEEDBACK_REVIEW: '场景反馈' };
    const TYPE_ICON_FOR_THUMB = {
      QUIZ: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      FEEDBACK_COLLECT: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
      FEEDBACK_REVIEW: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
      VIDEO: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>'
    };

    // FEEDBACK 抽象 SVG 缩略卡（COLLECT / REVIEW 各一）
    const FEEDBACK_THUMB_SVG = {
      FEEDBACK_COLLECT: '<svg viewBox="0 0 240 135" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><circle cx="34" cy="32" r="13" fill="var(--accent)" opacity=".30"/><text x="34" y="37" text-anchor="middle" font-size="13" fill="var(--accent)" font-family="Inter" font-weight="700">N</text><rect x="56" y="20" width="160" height="26" rx="13" fill="var(--accent)" opacity=".18"/><rect x="68" y="27" width="130" height="3.5" rx="1.5" fill="var(--accent)" opacity=".55"/><rect x="68" y="35" width="90" height="3.5" rx="1.5" fill="var(--accent)" opacity=".55"/><rect x="22" y="60" width="196" height="62" rx="8" fill="currentColor" opacity=".06" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 2"/><rect x="36" y="74" width="160" height="4" rx="2" fill="currentColor" opacity=".42"/><rect x="36" y="86" width="140" height="4" rx="2" fill="currentColor" opacity=".42"/><rect x="36" y="98" width="80" height="4" rx="2" fill="currentColor" opacity=".42"/><rect x="119" y="95" width="2" height="10" fill="var(--accent)"><animate attributeName="opacity" values="0;1;1;0" dur="1.2s" repeatCount="indefinite"/></rect></svg>',
      FEEDBACK_REVIEW: '<svg viewBox="0 0 240 135" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><rect x="22" y="14" width="170" height="40" rx="6" fill="currentColor" opacity=".08"/><rect x="22" y="14" width="4" height="40" fill="currentColor" opacity=".42"/><rect x="36" y="22" width="140" height="3.5" rx="1.5" fill="currentColor" opacity=".42"/><rect x="36" y="30" width="120" height="3.5" rx="1.5" fill="currentColor" opacity=".42"/><rect x="36" y="38" width="100" height="3.5" rx="1.5" fill="currentColor" opacity=".42"/><line x1="120" y1="56" x2="120" y2="72" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="2 2"/><polyline points="115,68 120,73 125,68" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="206" cy="103" r="13" fill="var(--accent)" opacity=".30"/><text x="206" y="108" text-anchor="middle" font-size="13" fill="var(--accent)" font-family="Inter" font-weight="700">N</text><rect x="32" y="86" width="160" height="34" rx="10" fill="var(--accent)" opacity=".18"/><rect x="44" y="94" width="130" height="3.5" rx="1.5" fill="var(--accent)" opacity=".60"/><rect x="44" y="103" width="110" height="3.5" rx="1.5" fill="var(--accent)" opacity=".60"/><rect x="44" y="112" width="80" height="3.5" rx="1.5" fill="var(--accent)" opacity=".60"/></svg>'
    };

    // QUIZ 7 题型抽象 SVG 缩略卡（替代借用 PPT 图）
    const QUIZ_THUMB_SVG = {
      single_choice: '<svg viewBox="0 0 240 135" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><rect x="18" y="14" width="180" height="5" rx="2" fill="currentColor" opacity=".42"/><rect x="18" y="24" width="120" height="5" rx="2" fill="currentColor" opacity=".42"/><circle cx="30" cy="50" r="7" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".48"/><rect x="46" y="46" width="120" height="8" rx="3" fill="currentColor" opacity=".18"/><circle cx="30" cy="72" r="7" fill="var(--accent)"/><circle cx="30" cy="72" r="2.8" fill="#fff"/><rect x="46" y="68" width="150" height="8" rx="3" fill="var(--accent)" opacity=".55"/><circle cx="30" cy="94" r="7" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".48"/><rect x="46" y="90" width="100" height="8" rx="3" fill="currentColor" opacity=".18"/><circle cx="30" cy="116" r="7" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".48"/><rect x="46" y="112" width="130" height="8" rx="3" fill="currentColor" opacity=".18"/></svg>',
      multi_choice: '<svg viewBox="0 0 240 135" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><rect x="18" y="14" width="180" height="5" rx="2" fill="currentColor" opacity=".42"/><rect x="18" y="24" width="120" height="5" rx="2" fill="currentColor" opacity=".42"/><rect x="22" y="42" width="14" height="14" rx="3" fill="var(--accent)"/><polyline points="25,49 28,52 33,46" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="46" y="44" width="120" height="8" rx="3" fill="var(--accent)" opacity=".55"/><rect x="22" y="64" width="14" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".48"/><rect x="46" y="66" width="140" height="8" rx="3" fill="currentColor" opacity=".18"/><rect x="22" y="86" width="14" height="14" rx="3" fill="var(--accent)"/><polyline points="25,93 28,96 33,90" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="46" y="88" width="100" height="8" rx="3" fill="var(--accent)" opacity=".55"/><rect x="22" y="108" width="14" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".48"/><rect x="46" y="110" width="130" height="8" rx="3" fill="currentColor" opacity=".18"/></svg>',
      judge: '<svg viewBox="0 0 240 135" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><rect x="20" y="20" width="200" height="5" rx="2" fill="currentColor" opacity=".42"/><rect x="20" y="30" width="160" height="5" rx="2" fill="currentColor" opacity=".42"/><rect x="58" y="58" width="50" height="50" rx="10" fill="var(--accent)" opacity=".18" stroke="var(--accent)" stroke-width="1.5"/><polyline points="73,84 81,92 95,76" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><rect x="132" y="58" width="50" height="50" rx="10" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".42"/><line x1="146" y1="72" x2="168" y2="94" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".5"/><line x1="168" y1="72" x2="146" y2="94" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".5"/></svg>',
      fill_blank: '<svg viewBox="0 0 240 135" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><rect x="20" y="34" width="60" height="6" rx="2" fill="currentColor" opacity=".42"/><rect x="86" y="32" width="60" height="14" rx="3" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="3 2"/><rect x="152" y="34" width="60" height="6" rx="2" fill="currentColor" opacity=".42"/><rect x="20" y="60" width="40" height="6" rx="2" fill="currentColor" opacity=".42"/><rect x="66" y="58" width="80" height="14" rx="3" fill="var(--accent)" opacity=".18"/><rect x="84" y="63" width="44" height="3" fill="var(--accent)"/><rect x="152" y="60" width="50" height="6" rx="2" fill="currentColor" opacity=".42"/><rect x="20" y="86" width="180" height="6" rx="2" fill="currentColor" opacity=".42"/><rect x="20" y="100" width="80" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="3 2" opacity=".48"/><rect x="106" y="102" width="100" height="6" rx="2" fill="currentColor" opacity=".42"/></svg>',
      match: '<svg viewBox="0 0 240 135" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><line x1="50" y1="40" x2="190" y2="76" stroke="var(--accent)" stroke-width="2" opacity=".6"/><line x1="50" y1="68" x2="190" y2="40" stroke="var(--accent)" stroke-width="2" opacity=".6"/><line x1="50" y1="96" x2="190" y2="124" stroke="currentColor" stroke-width="2" opacity=".35" stroke-dasharray="3 2"/><rect x="20" y="32" width="60" height="16" rx="3" fill="var(--accent)" opacity=".22"/><rect x="20" y="60" width="60" height="16" rx="3" fill="var(--accent)" opacity=".22"/><rect x="20" y="88" width="60" height="16" rx="3" fill="currentColor" opacity=".18"/><rect x="20" y="116" width="60" height="16" rx="3" fill="currentColor" opacity=".18"/><rect x="160" y="32" width="60" height="16" rx="3" fill="var(--accent)" opacity=".22"/><rect x="160" y="68" width="60" height="16" rx="3" fill="var(--accent)" opacity=".22"/><rect x="160" y="100" width="60" height="16" rx="3" fill="currentColor" opacity=".18"/><circle cx="50" cy="40" r="3" fill="var(--accent)"/><circle cx="50" cy="68" r="3" fill="var(--accent)"/><circle cx="50" cy="96" r="3" fill="currentColor" opacity=".5"/><circle cx="190" cy="40" r="3" fill="var(--accent)"/><circle cx="190" cy="76" r="3" fill="var(--accent)"/><circle cx="190" cy="108" r="3" fill="currentColor" opacity=".5"/></svg>',
      sort: '<svg viewBox="0 0 240 135" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><g><rect x="32" y="20" width="176" height="22" rx="4" fill="currentColor" opacity=".18"/><circle cx="46" cy="31" r="9" fill="var(--accent)"/><text x="46" y="35" font-size="10" font-weight="700" fill="#fff" text-anchor="middle" font-family="Inter">1</text><rect x="62" y="27" width="120" height="8" rx="3" fill="currentColor" opacity=".42"/><circle cx="194" cy="28" r="1.5" fill="currentColor" opacity=".5"/><circle cx="194" cy="34" r="1.5" fill="currentColor" opacity=".5"/><circle cx="200" cy="28" r="1.5" fill="currentColor" opacity=".5"/><circle cx="200" cy="34" r="1.5" fill="currentColor" opacity=".5"/></g><g><rect x="32" y="50" width="176" height="22" rx="4" fill="var(--accent)" opacity=".22"/><circle cx="46" cy="61" r="9" fill="var(--accent)"/><text x="46" y="65" font-size="10" font-weight="700" fill="#fff" text-anchor="middle" font-family="Inter">2</text><rect x="62" y="57" width="100" height="8" rx="3" fill="var(--accent)" opacity=".55"/></g><g><rect x="32" y="80" width="176" height="22" rx="4" fill="currentColor" opacity=".18"/><circle cx="46" cy="91" r="9" fill="var(--accent)"/><text x="46" y="95" font-size="10" font-weight="700" fill="#fff" text-anchor="middle" font-family="Inter">3</text><rect x="62" y="87" width="80" height="8" rx="3" fill="currentColor" opacity=".42"/></g><g><rect x="32" y="110" width="176" height="22" rx="4" fill="currentColor" opacity=".18"/><circle cx="46" cy="121" r="9" fill="var(--accent)"/><text x="46" y="125" font-size="10" font-weight="700" fill="#fff" text-anchor="middle" font-family="Inter">4</text><rect x="62" y="117" width="120" height="8" rx="3" fill="currentColor" opacity=".42"/></g></svg>',
      qa: '<svg viewBox="0 0 240 135" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><rect x="20" y="18" width="180" height="5" rx="2" fill="currentColor" opacity=".42"/><rect x="20" y="28" width="140" height="5" rx="2" fill="currentColor" opacity=".42"/><path d="M28 50 h140 a8 8 0 0 1 8 8 v32 a8 8 0 0 1 -8 8 h-90 l-12 12 v-12 h-38 a8 8 0 0 1 -8 -8 v-32 a8 8 0 0 1 8 -8 z" fill="var(--accent)" opacity=".18" stroke="var(--accent)" stroke-width="1.5"/><circle cx="62" cy="74" r="3" fill="var(--accent)"/><circle cx="78" cy="74" r="3" fill="var(--accent)"/><circle cx="94" cy="74" r="3" fill="var(--accent)"/><rect x="48" y="118" width="160" height="6" rx="2" fill="currentColor" opacity=".3"/></svg>'
    };

    M.scoSequence.forEach(s => {
      // 区分两个独立状态：
      //   isViewing  = state.currentSCO === order  （UI 当前查看位置 · 临时）
      //   status     = mock 内的真实进度状态（completed / current / locked / always_locked）
      const isViewing = s.order === state.currentSCO;
      const isLocked = (s.status === 'always_locked' || s.status === 'locked') && !state.isFreeReviewMode;
      let scoCls = '', statusCls = '', statusChar = '', showStatusBadge = true;
      if (isViewing) scoCls += ' viewing';
      if (state.isFreeReviewMode && s.status !== 'always_locked') { statusCls = 'completed'; statusChar = '✓'; }
      else if (s.status === 'completed') { statusCls = 'completed'; statusChar = '✓'; }
      else if (s.status === 'current') { scoCls += ' current'; statusCls = 'current'; statusChar = '▶'; }
      else if (isLocked) { showStatusBadge = false; scoCls += ' locked'; }
      else { showStatusBadge = false; }

      // 缩略图内容：QUIZ → 题型 SVG / FEEDBACK → 专属 SVG / SLICE → asset / VIDEO → thumbnail (poster) / 兜底 → 抽象图标
      let thumbInner = '', thumbCls = 'cover-abstract';
      if (s.type === 'QUIZ' && QUIZ_THUMB_SVG[s.quizType]) {
        thumbInner = QUIZ_THUMB_SVG[s.quizType];
        thumbCls = 'cover-quiz-svg';
      } else if (FEEDBACK_THUMB_SVG[s.type]) {
        thumbInner = FEEDBACK_THUMB_SVG[s.type];
        thumbCls = 'cover-quiz-svg';
      } else {
        const useImg = (s.type === 'SLICE' && s.asset) || (s.type === 'VIDEO' && s.thumbnail) || s.thumbnail;
        if (useImg) {
          thumbInner = `<img src="${useImg}" alt="" />`;
          thumbCls = 'cover-with-image';
        } else {
          const ic = TYPE_ICON_FOR_THUMB[s.type] || '';
          thumbInner = `<div class="sco-type-icon">${ic}</div><div class="sco-type-label">${TYPE_LABEL_FOR_THUMB[s.type] || ''}</div>`;
        }
      }

      const numStr = String(s.order).padStart(2, '0');
      const statusBadgeHtml = showStatusBadge ? `<span class="sco-status-badge ${statusCls}">${statusChar}</span>` : '';
      // 锁定项加「待开放」tag chip 替代灰显
      const isLockedItem = (s.status === 'always_locked' || s.status === 'locked') && !state.isFreeReviewMode && s.order !== state.currentSCO;
      const pendingTagHtml = isLockedItem ? `<span class="sco-pending-tag">待开放</span>` : '';
      html += `<div class="ld-sco${scoCls}" data-order="${s.order}">
        <div class="sco-thumb ${thumbCls}">
          ${statusBadgeHtml}
          <span class="sco-num-badge">${numStr}</span>
          ${thumbInner}
          ${pendingTagHtml}
          <div class="sco-cap-bg"><div class="sco-title">${s.title}</div></div>
        </div>
      </div>`;
    });
    panel.innerHTML = html;
    panel.querySelectorAll('.ld-sco').forEach(el => el.addEventListener('click', () => {
      const order = +el.dataset.order;
      const sco = getSCOByOrder(order); if (!sco) return;
      // 真正锁定（待解锁项，如 SCO 17）→ toast 提示
      if (sco.status === 'always_locked' || (sco.status === 'locked' && !state.isFreeReviewMode)) {
        showToast('该内容尚未开放'); return;
      }
      // 当前已 viewing → 关闭抽屉
      if (order === state.currentSCO) { closeLectureDrawer(); return; }
      // 其他非锁定 SCO（含 completed / current / 自由复习全解锁）→ 回顾跳转 + Neo 反应
      // 不再判断 order < currentSCO（已 viewed 的 SCO 后续也允许再次跳回回顾）
      switchSCO(order, true);
      closeLectureDrawer();
    }));
  }

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
      if (m.type === 'platform') {
        avatarHtml = `<div class="msg-avatar-wrap platform"><img src="assets/logo.png" alt="平台" /></div>`;
      } else if (m.type === 'system') {
        avatarHtml = `<div class="msg-avatar-wrap system"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 003.4 0"/></svg></div>`;
      } else if (m.type === 'user') {
        const [c1, c2] = getGradFor(m.sender);
        avatarHtml = `<div class="msg-avatar-wrap user" style="background:linear-gradient(135deg,${c1},${c2})">${m.avatarChar}</div>`;
      }
      row.innerHTML = `${avatarHtml}<div class="msg-content"><div class="msg-head"><span class="msg-text">${m.title}</span>${!isRead ? '<span class="msg-dot-unread"></span>' : ''}</div><div class="msg-sender">${m.sender} · ${m.time}</div><div class="msg-desc">${m.desc}</div></div>`;
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

  /* ==========  BUSINESS  ========== */
  function switchSCO(newOrder, isReviewJump = false) {
    const sco = getSCOByOrder(newOrder);
    if (isReviewJump && !state.isFreeReviewMode) {
      // I-V12-08: 授课模式主动回顾跳转（spec § 1.5.2 ⑧ + § 1.5.3）
      // 首次进入回顾态：记录原讲解点 + 重置 reviewExchanges
      if (!state.isReviewing) {
        state.preReviewSCO = state.currentSCO;
        state.isReviewing = true;
        state.reviewExchanges = 0;
      }
      state.currentSCO = newOrder;
      appendNeoMsg('qa', `回看「${sco.title}」· 这一页还有什么不理解？`);
      showToast('已回到「' + sco.title + '」');
    } else if (isReviewJump && state.isFreeReviewMode) {
      // 自由复习模式：所有 SCO 都解锁 · 不存在"原讲解点"概念
      state.currentSCO = newOrder;
      showToast('「' + sco.title + '」');
    } else {
      // 非回顾跳转（如完成 SCO 后 next 推进）
      state.currentSCO = newOrder;
    }
    renderSubbar(); renderView(); renderLDSCO(); updateArrowsState();
  }

  // I-V12-08: Neo 评估"问题清楚"自动跳回原讲解点（spec 流程）
  function exitReviewMode() {
    if (!state.isReviewing || state.preReviewSCO == null) return;
    const target = state.preReviewSCO;
    const oriSco = getSCOByOrder(target);
    state.preReviewSCO = null;
    state.isReviewing = false;
    state.reviewExchanges = 0;
    state.currentSCO = target;
    appendNeoMsg('lecture', `好，回到「${oriSco.title}」继续讲解。`);
    showToast('已回到原讲解点');
    renderSubbar(); renderView(); renderLDSCO(); updateArrowsState();
  }

  function updateArrowsState() {
    const left = document.getElementById('lectureArrowLeft');
    const right = document.getElementById('lectureArrowRight');
    const stage = document.getElementById('lectureStage');
    if (!left || !right || !stage) return;
    if (!state.isFreeReviewMode) {
      stage.classList.remove('free-nav');
      return;
    }
    stage.classList.add('free-nav');
    let hasPrev = false;
    for (let i = state.currentSCO - 1; i >= 1; i--) {
      const s = getSCOByOrder(i);
      if (s && s.status !== 'always_locked') { hasPrev = true; break; }
    }
    let hasNext = false;
    for (let i = state.currentSCO + 1; i <= M.scoSequence.length; i++) {
      const s = getSCOByOrder(i);
      if (s && s.status !== 'always_locked') { hasNext = true; break; }
    }
    left.disabled = !hasPrev;
    right.disabled = !hasNext;
  }

  function setupLectureArrows() {
    const left = document.getElementById('lectureArrowLeft');
    const right = document.getElementById('lectureArrowRight');
    if (!left || !right) return;
    left.addEventListener('click', () => {
      if (!state.isFreeReviewMode) return;
      for (let i = state.currentSCO - 1; i >= 1; i--) {
        const s = getSCOByOrder(i);
        if (s && s.status !== 'always_locked') { switchSCO(i, false); return; }
      }
    });
    right.addEventListener('click', () => {
      if (!state.isFreeReviewMode) return;
      for (let i = state.currentSCO + 1; i <= M.scoSequence.length; i++) {
        const s = getSCOByOrder(i);
        if (s && s.status !== 'always_locked') { switchSCO(i, false); return; }
      }
    });
  }

  function advanceSCO() {
    const next = state.currentSCO + 1;
    if (next > M.scoSequence.length) { showCompletionModal(); return; }
    const cur = getSCOByOrder(state.currentSCO);
    if (cur && cur.status !== 'always_locked') cur.status = 'completed';
    const nextSco = getSCOByOrder(next);
    if (nextSco.status === 'locked') { showCompletionModal(); return; }
    switchSCO(next);
    if (nextSco.neoScript) setTimeout(() => appendNeoMsg('lecture', nextSco.neoScript), 600);
  }

  function pauseLecture() {
    state.isPaused = true;
    $('pauseOverlay').classList.add('show');
    $('subbarTimer').classList.add('paused');
    // ★ 暂停 TTS audio + 暂停所有打字 timers
    if (state.isPlayingTTS && state.ttsAudio) {
      try { state.ttsAudio.pause(); } catch (e) {}
      state.ttsTimers.forEach(t => { clearTimeout(t); clearInterval(t); });
      state.ttsTimers = [];
    }
  }
  function resumeLecture() {
    state.isPaused = false;
    $('pauseOverlay').classList.remove('show');
    $('subbarTimer').classList.remove('paused');
    // ★ 恢复 TTS audio + 重新调度未推送的 scripts
    if (state.isPlayingTTS && state.ttsAudio) {
      try { state.ttsAudio.play(); } catch (e) {}
      scheduleTTSPending();
    }
  }
  function togglePause() { if (state.isPaused) resumeLecture(); else pauseLecture(); }

  function showCompletionModal() {
    // US-V12-LINK-001: 标记 Activity 完成态（跨场域同步到 hall）
    if (state.activityId && typeof Progress === 'object') {
      Progress.markComplete(state.activityId, 'lecture');
    }
    const html = `<div class="completion-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
      <div class="completion-title">Activity 完成！</div>
      <div class="completion-sub">你已完成「${M.activity.name}」</div>
      <div class="completion-stats">
        <div><span class="completion-stat-label">学习时长</span><span class="completion-stat-value">${fmtTime(state.totalLearningTime)}</span></div>
        <div><span class="completion-stat-label">完成 SCO</span><span class="completion-stat-value">${M.scoSequence.length} / ${M.scoSequence.length}</span></div>
      </div>
      <div class="completion-actions">
        <button class="completion-btn" id="cBtnHall">回到大厅</button>
        <button class="completion-btn primary" id="cBtnFree">自由复习</button>
        <button class="completion-btn" id="cBtnNext">继续下一 Activity（GROW 辅导对练）</button>
      </div>`;
    openModal(html, 'completion-modal');
    $('cBtnFree').addEventListener('click', enterFreeReviewMode);
    $('cBtnHall').addEventListener('click', () => { closeModal(); Router.go('hall', { from: 'lecture' }); });
    $('cBtnNext').addEventListener('click', () => {
      closeModal();
      // I-V12-05: cBtnNext 已是确认动作 · 直跳不再走 Jumper 二次确认（v1.2 工程纪律 L）
      Router.go('practice', { from: 'lecture' });
    });
  }

  function enterFreeReviewMode() {
    closeModal();
    state.isFreeReviewMode = true;
    M.scoSequence.forEach(s => { if (s.status !== 'always_locked') s.status = 'completed'; });
    state.currentSCO = 1;
    renderSubbar(); renderView(); renderLDSCO(); updateArrowsState();
    appendNeoMsg('qa', '进入复习模式 · 所有内容已解锁，我只回应你的问题，不主动讲。想看哪一节？');
    showToast('已进入复习模式');
  }

  /* ==========  SETUP  ========== */
  function setupTimer() {
    state.timerInterval = setInterval(() => {
      if (!state.isPaused) {
        state.totalLearningTime++;
        $('subbarTimerText').textContent = fmtTime(state.totalLearningTime);
      }
    }, 1000);
  }
  function setupIdleDetection() {
    function reset() { state.lastActivityAt = Date.now(); }
    ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'].forEach(ev => document.addEventListener(ev, reset, { passive: true }));
    state.idleTimer = setInterval(() => {
      if (state.isPaused || state.isPlayingTTS) return;
      if ($('modalMask').classList.contains('open')) return;
      if (Date.now() - state.lastActivityAt >= state.idleThreshold) {
        pauseLecture(); showIdleModal(); state.lastActivityAt = Date.now();
      }
    }, 5000);
  }
  function showIdleModal() {
    const html = `<div class="idle-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
      <div class="idle-title">你还在吗？</div>
      <div class="idle-sub">已暂停学习 · 要继续吗？</div>
      <div class="idle-actions"><button class="idle-btn primary" id="idleResume">继续</button></div>`;
    openModal(html, 'idle-modal');
    $('idleResume').addEventListener('click', () => { closeModal(); resumeLecture(); });
  }
  function setupPauseControls() {
    // SLICE 课件区：整体点击 = 暂停 / 继续
    const sliceStage = $('sliceStage');
    if (sliceStage) sliceStage.addEventListener('click', e => {
      // 暂停态点击 overlay 也走这里 → 恢复
      togglePause();
    });
    // 空格键：仅 PPT / 视频 类型时触发暂停
    document.addEventListener('keydown', e => {
      if (e.key === ' ' || e.code === 'Space') {
        const ae = document.activeElement;
        if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.contentEditable === 'true')) return;
        const sco = getCurrentSCO();
        if (sco && (sco.type === 'SLICE' || sco.type === 'VIDEO')) {
          e.preventDefault();
          if (sco.type === 'VIDEO') {
            const vp = $('videoPlayer');
            if (vp.paused) { vp.play(); document.getElementById('videoPlayIcon').innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'; }
            else { vp.pause(); document.getElementById('videoPlayIcon').innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>'; }
          } else {
            togglePause();
          }
        }
      }
    });
  }
  function setupVideoPlayer() {
    const vp = $('videoPlayer');
    const playBtn = $('videoPlayBtn'), playIcon = $('videoPlayIcon');
    const time = $('videoTime'), prog = $('videoProgress');
    const played = $('videoProgressPlayed'), thumb = $('videoProgressThumb'), buf = $('videoProgressBuffered');
    const muteBtn = $('videoMuteBtn'), rateSel = $('videoRate'), fullBtn = $('videoFullBtn'), noSkipHint = $('videoNoSkipHint');
    function updateUI() {
      time.textContent = fmtTime(vp.currentTime) + ' / ' + fmtTime(vp.duration || 0);
      const pct = vp.duration ? (vp.currentTime / vp.duration * 100) : 0;
      played.style.width = pct + '%'; thumb.style.left = pct + '%';
      const bufPct = vp.buffered.length ? (vp.buffered.end(vp.buffered.length - 1) / (vp.duration || 1) * 100) : 0;
      buf.style.width = bufPct + '%';
      if (vp.currentTime > state.videoMaxPlayedSec) state.videoMaxPlayedSec = vp.currentTime;
    }
    vp.addEventListener('timeupdate', updateUI);
    vp.addEventListener('loadedmetadata', updateUI);
    vp.addEventListener('progress', updateUI);
    playBtn.addEventListener('click', () => {
      if (vp.paused) { vp.play(); playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'; }
      else { vp.pause(); playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>'; }
    });
    vp.addEventListener('ended', () => { playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>'; setTimeout(() => advanceSCO(), 500); });
    // 视频画面点击 = 暂停 / 继续（与控件按钮同一逻辑）
    vp.addEventListener('click', e => {
      e.preventDefault();
      if (vp.paused) { vp.play(); playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'; }
      else { vp.pause(); playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>'; }
    });
    prog.addEventListener('click', e => {
      const rect = prog.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      const target = ratio * (vp.duration || 0);
      if (state.isFreeReviewMode || target <= state.videoMaxPlayedSec + 0.5) vp.currentTime = target;
      else { noSkipHint.classList.add('show'); setTimeout(() => noSkipHint.classList.remove('show'), 1500); }
    });
    muteBtn.addEventListener('click', () => { vp.muted = !vp.muted; });
    rateSel.addEventListener('change', () => { vp.playbackRate = parseFloat(rateSel.value); });
    fullBtn.addEventListener('click', () => { if (vp.requestFullscreen) vp.requestFullscreen(); });
  }
  function setupQuizSubmit() { $('quizRetry').addEventListener('click', retryQuiz); }

  function setupNeoInput() {
    const ti = $('neoInput');
    ti.addEventListener('input', () => { ti.style.height = 'auto'; ti.style.height = Math.min(140, ti.scrollHeight) + 'px'; });
    ti.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
    $('neoSend').addEventListener('click', sendMessage);
    // v2: Neo 消息点赞 / 点踩 / 评论反馈 · 委托到 stream
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
  function sendMessage() {
    const ti = $('neoInput');
    const text = ti.value.trim(); if (!text) return;
    appendUserMsg(text); ti.value = ''; ti.style.height = 'auto';
    const sco = getCurrentSCO();
    if (sco) {
      if (sco.type === 'FEEDBACK_COLLECT' && text.length >= 50 && sco.status !== 'completed') {
        sco.studentAnswer = text;
        setTimeout(() => appendNeoMsg('qa', '谢谢，我记下了你提到的「' + (text.match(/[一-龥]{2,}/)?.[0] || '场景') + '」——后面我们会一起回看。'), 700);
        setTimeout(() => advanceSCO(), 2000); return;
      }
      if (sco.type === 'FEEDBACK_REVIEW' && text.length >= 50) {
        setTimeout(() => appendNeoMsg('qa', '不错——你刚才说的开场，比单纯催效果好多了。回到你之前提的赵工，下次试试这两句中"具体化场景"那句先抛出来。'), 800);
        setTimeout(() => advanceSCO(), 2300); return;
      }
      if (sco.type === 'QUIZ' && sco.quizType === 'qa' && text.length >= 30) {
        setTimeout(() => appendNeoMsg('qa', sco.neoFeedback.correct), 700);
        setTimeout(() => advanceSCO(), 2200); return;
      }
      // 自由复习模式：纯被动答疑
      if (state.isFreeReviewMode) {
        setTimeout(() => appendNeoMsg('qa', generateAnswer(text, sco)), 800);
        return;
      }
      // I-V12-08: 主动回顾跳转态下的答疑 · 累计 2 条后 Neo 评估"问题清楚"自动跳回（spec § 1.5.2 ⑧）
      if (state.isReviewing) {
        state.reviewExchanges++;
        if (state.reviewExchanges < 2) {
          // 第 1 条：常规答疑 · 不催回归
          setTimeout(() => appendNeoMsg('qa', '好问题——' + generateAnswer(text, sco)), 800);
        } else {
          // 第 2 条起：答疑 + Neo 评估问题清楚 + 自动跳回
          setTimeout(() => appendNeoMsg('qa', generateAnswer(text, sco)), 800);
          setTimeout(() => appendNeoMsg('qa', '看来这一页已经清楚了——那我们回到刚才那一页继续吧。'), 1800);
          setTimeout(() => exitReviewMode(), 3300);
        }
        return;
      }
      // 普通问答 → Neo 切答疑口播
      setTimeout(() => appendNeoMsg('qa', '好问题——' + generateAnswer(text, sco)), 800);
    }
  }
  function generateAnswer(q, sco) {
    if (q.includes('为什么')) return '因为 ' + (sco.neoScript || sco.title || '').slice(0, 50) + '——你想听更详细的吗？';
    if (q.includes('什么')) return (sco.title || '') + '的核心是把"行为现象"翻译成"心理机制"。';
    if (q.includes('?') || q.includes('？')) return (sco.neoScript || '我先回应一下你的问题——记住 3 步：不接情绪、具体化场景、最小行动。').slice(0, 80);
    return (sco.title || '') + '——记住 3 步：不接情绪、具体化场景、最小行动。';
  }

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
  function openLectureDrawer() { $('lectureDrawerMask').classList.add('open'); $('lectureDrawer').classList.add('open'); }
  function closeLectureDrawer() { $('lectureDrawerMask').classList.remove('open'); $('lectureDrawer').classList.remove('open'); }

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
    // I-V12-07 修：switchPort 真跳转 + 二次确认（沿用 hall.html 实现）
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
            <button class="modal-btn primary" onclick="closeModal();Router.go('mgthome',{from:'lecture'});">确认切换</button>
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
      // ★ 改 Hero 220px 大头像
      $('neoAvatar').src = personaImg;
      // ★ 改 Chat 流中所有 Neo 小头像（已渲染的历史消息）
      document.querySelectorAll('.msg.neo .msg-avatar img').forEach(img => { img.src = personaImg; });
      // ★ TTS 正在播放时实时切 audio 源（保留 currentTime 续播）
      if (state.isPlayingTTS && state.ttsAudio && state.ttsCurrentSCO && state.ttsCurrentSCO.tts) {
        const newSrc = state.ttsCurrentSCO.tts[state.settings.persona] || state.ttsCurrentSCO.tts.male;
        const wasPaused = state.ttsAudio.paused || state.isPaused;
        const oldTime = state.ttsAudio.currentTime;
        const oldRate = state.ttsAudio.playbackRate;
        try {
          state.ttsAudio.src = newSrc;
          state.ttsAudio.playbackRate = oldRate;
          const onLoaded = () => {
            state.ttsAudio.removeEventListener('loadedmetadata', onLoaded);
            try { state.ttsAudio.currentTime = Math.min(oldTime, state.ttsAudio.duration || oldTime); } catch (e) {}
            if (!wasPaused) state.ttsAudio.play().catch(() => {});
          };
          state.ttsAudio.addEventListener('loadedmetadata', onLoaded);
          state.ttsAudio.load();
        } catch (e) { console.warn('switch persona audio failed:', e); }
      }
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
      // ★ 实时联动 TTS audio 速率 + 重新调度打字 setTimeout
      if (state.isPlayingTTS && state.ttsAudio) {
        state.ttsAudio.playbackRate = getSpeedRate();
        if (!state.isPaused) scheduleTTSPending();
      }
    }));
    document.querySelectorAll('[data-persona]').forEach(b => b.classList.toggle('active', b.dataset.persona === state.settings.persona));
    document.querySelectorAll('[data-theme]').forEach(b => b.classList.toggle('active', b.dataset.theme === state.settings.theme));
    document.querySelectorAll('[data-speed]').forEach(b => b.classList.toggle('active', b.dataset.speed === state.settings.speed));
  }

  function setupNoteFloat() {
    const ball = $('noteFloat'), panel = $('notePanel'), float = ball;
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
      if (moved) positionNotePanel();
    });
    document.addEventListener('mouseup', () => {
      if (dragging && !didDrag) {
        if (panel.classList.contains('open')) panel.classList.remove('open');
        else { panel.classList.add('open'); $('noteTag').textContent = '📍 授课 · SCO ' + String(state.currentSCO).padStart(2, '0'); positionNotePanel(); }
      }
      dragging = false;
    });
    // 视口自适应（hall 同款）
    function positionNotePanel() {
      if (!panel.classList.contains('open')) return;
      const margin = 16;
      panel.style.left = '0px'; panel.style.top = '0px'; panel.style.right = 'auto'; panel.style.bottom = 'auto';
      requestAnimationFrame(() => {
        const rect = float.getBoundingClientRect();
        const panelW = panel.offsetWidth || 480;
        const panelH = panel.offsetHeight || 320;
        const aboveSpace = rect.top - margin;
        const useBelow = aboveSpace < panelH;
        let left = rect.left;
        if (left + panelW > window.innerWidth - margin) left = rect.right - panelW;
        if (left < margin) left = margin;
        let top = useBelow ? rect.bottom + 12 : rect.top - panelH - 12;
        if (top < margin) top = margin;
        if (top + panelH > window.innerHeight - margin) top = window.innerHeight - panelH - margin;
        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
      });
    }
    window._positionNotePanel = positionNotePanel;
    $('noteClose').addEventListener('click', () => panel.classList.remove('open'));
    document.addEventListener('mousedown', e => {
      if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== ball && !ball.contains(e.target)) panel.classList.remove('open');
    });
    $('noteBody').addEventListener('input', () => { $('noteCounter').textContent = $('noteBody').innerText.length + ' / 500'; });
    $('noteArchive').addEventListener('click', () => {
      const t = $('noteBody').innerText.trim();
      if (!t) { showToast('笔记是空的'); return; }
      // US-V12-LINK-003: 写入跨场域 Notes store
      if (typeof Notes === 'object') {
        Notes.add({ content: t, source: '授课 · ' + (M.activity?.name || ''), activityId: state.activityId });
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

  /* ==========  INIT  ========== */
  function init() {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    $('neoAvatar').src = 'assets/neo-' + state.settings.persona + '.png';
    const urlMode = new URL(location.href).searchParams.get('mode');
    if (urlMode === 'free') {
      state.isFreeReviewMode = true;
      M.scoSequence.forEach(s => { if (s.status !== 'always_locked') s.status = 'completed'; });
      state.currentSCO = 1;
    }
    const urlSCO = +new URL(location.href).searchParams.get('sco');
    if (urlSCO && urlSCO >= 1 && urlSCO <= M.scoSequence.length) state.currentSCO = urlSCO;
    // Activity 身份（hall/抽屉跳过来时带 ?activity=c2-a3 · 进度按此 id 隔离 · demo 暂不持久化）
    state.activityId = new URL(location.href).searchParams.get('activity') || null;
    state.fromPage = new URL(location.href).searchParams.get('from') || 'hall';

    renderAvatar();
    renderInitialChat();
    renderBellMessages();
    renderSubbar();
    renderView();
    renderLDProject();
    renderLDSCO();

    setupDropdowns();
    setupSettingsDrawer();
    setupNoteFloat();
    setupNeoCollapse();
    setupNeoResize();
    setupNeoInput();
    setupTimer();
    setupIdleDetection();
    setupPauseControls();
    setupVideoPlayer();
    // I-V12-08: 主动回顾跳转 · Neo 自然对话主导回归（无需 UI 按钮）
    setupQuizSubmit();
    setupLectureDrawer();
    setupLectureArrows();
    updateArrowsState();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
