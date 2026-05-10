// v1.5.2 F-NEO-BREATHE · Neo 头像呼吸动画跟说话同步
// API：window.neoStartSpeaking(durationMs) · 给 .neo-chat 加 .speaking class · durationMs 后自动移除
// 说话期间 CSS 给 .neo-hero-img 跑 neoBreathe 动画 · 不说话静态
//
// 调用时机：
//   lecture：playNeoTTS 时 audio.duration*1000 / finishTTS 时 stop
//   practice/recap：appendNeoMsg 每条消息触发 · 按字数 * 60ms 估算 TTS 时长
//   暂停 TTS：调 window.neoStopSpeaking()
(function (g) {
  'use strict';
  let _timer = null;

  function startSpeaking(durationMs) {
    const chat = document.getElementById('neoChat');
    if (!chat) return;
    chat.classList.add('speaking');
    if (_timer) clearTimeout(_timer);
    if (durationMs > 0) {
      _timer = setTimeout(() => {
        chat.classList.remove('speaking');
        _timer = null;
      }, durationMs);
    }
  }

  function stopSpeaking() {
    const chat = document.getElementById('neoChat');
    if (chat) chat.classList.remove('speaking');
    if (_timer) { clearTimeout(_timer); _timer = null; }
  }

  /** 按消息字符数估算 TTS 时长 · 中文 ~ 60ms/字 · 最低 1.2s · 最高 8s */
  function estimateSpeakDuration(text) {
    const len = String(text || '').replace(/\s+/g, '').length;
    return Math.min(8000, Math.max(1200, len * 60));
  }

  g.neoStartSpeaking = startSpeaking;
  g.neoStopSpeaking = stopSpeaking;
  g.neoEstimateSpeakDuration = estimateSpeakDuration;
})(window);
