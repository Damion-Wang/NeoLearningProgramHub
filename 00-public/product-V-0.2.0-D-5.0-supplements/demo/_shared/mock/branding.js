// 共享 mock · 平台品牌（Neo/Ora 名字 + AI 法律声明 + 欢迎语）
// 单 source · proconfig 板块 5 「平台个性化」编辑写这里 · 各页 Neo/Ora 字样 + AI 声明 + 欢迎语全消费
//
// 决策点（v1.3 自审 #9+#16）：跨页一致性 + 法律红线
//
// 字段：
//   neoName        string  学员侧 Tutor 名字（默认 'Neo'）· hall/lecture/practice 用
//   oraName        string  管理侧 Coach 名字（默认 'Ora'）· mgthome 用
//   platformName   string  平台名（'NeoLearning' · 法律声明前缀 · 不建议改）
//   disclaimerText string  AI 生成内容声明完整文案（PROJECT.branding 编辑时写这里）
//   welcomeMsg     string  login + hall 欢迎语
//   logoDataUrl    string  base64 logo · null = 用 assets/logo.png
//
// 法律红线：所有 AI 生成内容下方必挂 disclaimerText
// proconfig 改 neoName 后 · disclaimerText 不自动同步（"Neo" → "小睿" 但声明仍说 "NeoLearning AI"）
//   原因：法律语义 = 平台名 + AI · neoName 是 Tutor 角色名 ≠ 平台名

// v1.5.2 B-PROCONFIG-NAME · 启动时从 localStorage 读 · 跨页持久化 proconfig 改的名
window.BRANDING = (function () {
  const DEFAULT = {
    neoName:        'Neo',
    oraName:        'Ora',
    platformName:   'NeoLearning',
    disclaimerText: '以上内容由 NeoLearning AI 生成，仅供参考',
    welcomeMsg:     '欢迎来到基层管理者培训项目 · 让"学了"变成"会做"',
    logoDataUrl:    null
  };
  try {
    const saved = JSON.parse(localStorage.getItem('rx-branding'));
    if (saved && typeof saved === 'object') return Object.assign({}, DEFAULT, saved);
  } catch (e) {}
  return DEFAULT;
})();

window.Branding = (function () {
  return {
    /** 改 neoName/oraName 时刷新 disclaimerText（保持平台名作为前缀）
     *  此处 disclaimerText 不联动 neoName 改动 · 法律意义上是平台 + AI · 不是 Tutor + AI */
    update(patch) {
      Object.assign(window.BRANDING, patch || {});
    },
    /** 接 lecture/practice / proconfig 旧 branding 字段名兼容 */
    get neoName() { return window.BRANDING.neoName; },
    get oraName() { return window.BRANDING.oraName; },
    get disclaimerText() { return window.BRANDING.disclaimerText; },
    /** 全局 sweep · 各页 init / 重渲后调用一次
     *  · .brand-neo / .brand-ora 用于嵌在中文文案里只替换 "Neo"/"Ora" 词
     *  · .neo-bar-text / .ora-bar-text 是 chat 区身份带 · 整段替换 */
    applyAll() {
      const B = window.BRANDING || {};
      if (B.neoName) {
        document.querySelectorAll('.brand-neo, .neo-bar-text').forEach(el => { el.textContent = B.neoName; });
      }
      if (B.oraName) {
        document.querySelectorAll('.brand-ora, .ora-bar-text').forEach(el => { el.textContent = B.oraName; });
      }
    }
  };
})();
