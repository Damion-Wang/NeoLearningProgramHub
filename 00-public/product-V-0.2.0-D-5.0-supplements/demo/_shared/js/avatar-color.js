// 共享 · 学员头像渐变色 · 跨页稳定（v1.5 P1 #9）
// 用 memberId 做 hash · 同一人在 hall/lecture/practice/recap/mgthome/reportcenter 都同色
// 旧的 getGradFor(name) 受 name 写法（"陈"/"陈总"/"陈静"）影响 · 不稳定
//
// API：
//   AvatarColor.forMemberId(id)  → [c1, c2]  优先用 · 稳定 hash
//   AvatarColor.forName(name)    → [c1, c2]  fallback · 跟旧 getGradFor 行为一致
//   AvatarColor.gradient(memberIdOrName) → 'linear-gradient(135deg, c1 0%, c2 100%)'
//
// PALETTE 8 色对 · 跟原 hall/mgthome 保持一致
window.AvatarColor = (function () {
  const PALETTE = [
    ['#D97757', '#E89B6E'],   // 0 terracotta
    ['#9B7CD9', '#C4A5E8'],   // 1 violet
    ['#5A9BBF', '#7DBCE0'],   // 2 teal-blue
    ['#D9A957', '#EBC179'],   // 3 amber
    ['#7CA873', '#9EBE96'],   // 4 sage green
    ['#C95B7C', '#E58CA5'],   // 5 rose
    ['#5C7AAB', '#7E9BC7'],   // 6 navy
    ['#B86A8A', '#D699B0']    // 7 plum
  ];
  function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
  function forMemberId(id) {
    return PALETTE[hash(String(id || 'unknown')) % PALETTE.length];
  }
  function forName(name) {
    return PALETTE[hash(String(name || '')) % PALETTE.length];
  }
  function gradient(idOrName) {
    // 如果是 'u1'/'u8' 类 memberId（u + 数字）→ 走 forMemberId
    // 否则按 name hash · 兼容旧调用
    const useId = /^u\d+$/i.test(String(idOrName || ''));
    const [c1, c2] = useId ? forMemberId(idOrName) : forName(idOrName);
    return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
  }
  return { forMemberId, forName, gradient, PALETTE };
})();
