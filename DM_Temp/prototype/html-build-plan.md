# HTML 原型生成规划

> 日期：2026-04-22
> 状态：准备就绪

---

## 一、资源盘点

### 1.1 已就绪资源

| 资源 | 路径 | 说明 |
|------|------|------|
| PPT 图片 × 41 | `assets/ppt/MANAGER{1,2,3}_segment_*.jpg` | 3 个 Activity 的全部课件图片，来自 contentRef URL |
| Mock 数据 | `assets/mock-data.json` (42KB) | 11 个数据模块：project/courses/scoList/learners/dashboardMetrics/leoDialogues/neoDialogues/practiceDialogues/oraDialogues/messages/configData |
| 参考 HTML × 5 | `ref/hall.html` `ref/02-授课教室.html` `ref/03-对练教室.html` `ref/04-调研教室.html` `ref/05-报告教室.html` | 先前版本原型，可参考布局骨架和交互模式 |
| contentRef × 12 | `ref/contentRef/MANAGER{1,2,3}_{BP,SC,URL,VS}.txt` | 教学蓝图/口播稿/图片URL/视觉设计说明 |
| Brief 文档 | `debate/round-03-briefs.md` | 18 个快照的详细 brief（元素+位置+交互+mock 数据） |

### 1.2 不可用资源

| 资源 | 说明 | 替代方案 |
|------|------|---------|
| 文生图 API | dall-e-3/wanx-v1 未对 key 开放 | Actor 头像用 SVG 占位头像（带姓名首字）；装饰性插图用 CSS 渐变+图标 |
| 真实视频 | 无案例视频文件 | Video SCO 用占位播放器（静态帧+播放按钮覆盖层） |

### 1.3 可用 API

```
Endpoint: https://ymcas-llm.yxt.com/ymcas-ai/multi-model/v1/chat/completions
Key: wangdm-e4a7f824-cbca-4942-91a4-ef31ce934c31
Auth: Bearer token
Proxy: 需 --noproxy '*'

可用模型（文本）：doubao-pro-32k, qwen-max, gpt-4o, deepseek-v3 等 22 个
用途：如需动态生成对话文本可调用，但原型以静态 mock 为主
```

---

## 二、课程内容映射

### 2.1 contentRef → AOM 映射

原型中使用的课程内容基于 contentRef 实际教学资料：

```
Project: A公司基层管理者发展项目
└── Course 1: 辅导型管理（使用真实 contentRef 内容）
│   ├── Activity 1.1: 从指责到赋能：GROW模型 ← MANAGER1 (12张PPT)
│   │   └── SCO: FEEDBACK_COLLECT → PPT×8 → QUIZ×2 → VIDEO×1 → FEEDBACK_REVIEW
│   ├── Activity 1.2: 催化主动型员工的产出 ← MANAGER2 (15张PPT)
│   ├── Activity 1.3: 心理防御穿透 ← MANAGER3 (14张PPT)
│   ├── Activity 1.4: GROW辅导对练（mock 剧本）
│   └── Activity 1.5: 辅导型管理报告（mock 数据）
└── Course 2: 横向协作（mock，PIN 法内容参考 spec 示例）
└── Course 3: 向上沟通（mock）
└── Course 4: 团队激励（mock）
```

### 2.2 PPT 图片在授课场域的使用

S03 (PPT SCO) 展示 Activity 1.1 的 SCO 列表：
- 当前 SCO 使用 `MANAGER1_segment_1.1.jpg`（职场巨婴与保姆经理）
- 左侧 SCO 列表的标题来自 MANAGER1_BP.txt 中的 Block/Segment 名称
- Neo 口播文本来自 MANAGER1_SC.txt 中对应 Segment 的讲师稿

---

## 三、HTML 文件结构

### 3.1 输出文件清单（11 个 HTML + 共享资源）

```
DM_Temp/prototype/build/
├── shared/
│   ├── styles.css          # 全局样式（变量、布局骨架、组件）
│   ├── components.js       # 共享交互逻辑（toggle、dropdown、tab 切换）
│   └── mock-data.js        # mock-data.json 的 JS 导出版本
├── assets/                 # 软链接或复制 ppt 图片
│   └── ppt/               # 41 张 PPT 图片
├── 01-login.html           # S01 登录页
├── 02-hall-empty.html      # S02 大厅空状态
├── 03-hall-daily.html      # S12 大厅日常（9种页内交互）
├── 04-lecture.html         # S03-S07 授课场域（5个视图切换）
├── 05-practice.html        # S08-S10 对练场域（3阶段切换）
├── 06-report-learner.html  # S11 学员端报告
├── 07-config.html          # S13 管理端配置
├── 08-operation.html       # S14 管理端首页
├── 09-report-mgmt.html     # S15-S16 管理端报告（库→编辑器切换）
├── 10-message.html         # S17 管理端消息（列表→编辑切换）
└── 11-inquiry-p3.html      # S18 P3调研附页
```

### 3.2 共享样式架构

```css
/* CSS 变量 — 全局设计令牌 */
:root {
  /* 品牌色 */
  --brand-primary: #4F46E5;      /* 主品牌色 */
  --brand-primary-light: #818CF8;
  --brand-surface: #F8FAFC;       /* 页面背景 */
  
  /* 语义色 */
  --status-completed: #10B981;    /* ✅ 已完成 */
  --status-current: #3B82F6;     /* ▶ 当前 */
  --status-locked: #9CA3AF;      /* 🔒 锁定 */
  --status-danger: #EF4444;
  --status-warning: #F59E0B;
  
  /* 布局尺寸 */
  --topbar-height: 56px;
  --left-nav-width: 220px;       /* 学员端可折叠导航 */
  --left-nav-collapsed: 60px;
  --mgmt-nav-width: 200px;       /* 管理端常显导航 */
  --chat-width: 360px;           /* Chat 栏宽度 */
  
  /* 字体 */
  --font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
```

### 3.3 布局骨架复用

8 种骨架全部在 `styles.css` 中定义为 CSS class：

| 骨架 | CSS Class | 结构 | 用于 |
|------|-----------|------|------|
| L-A | `.layout-hall` | topbar + collapsible-nav + board-scroll + chat | 02, 03 |
| L-B | `.layout-lecture` | topbar + collapsible-nav(tabs) + content + chat | 04 |
| L-C | `.layout-zone-dual` | topbar + collapsible-nav + left-col + right-col | 05(phase1,3), 06, 11(phase1,3) |
| L-D | `.layout-practice-rp` | topbar + collapsible-nav + info-col + actor-col + neo-col | 05(phase2) |
| L-E | `.layout-immersive` | topbar + collapsible-nav + full-width-chat | 11(phase2) |
| L-F | `.layout-mgmt-dual` | topbar + fixed-nav + left-panel(tabs) + ora-chat | 08, 09(editor) |
| L-G | `.layout-mgmt-single` | topbar + fixed-nav + full-content | 07, 09(library), 10 |
| L-H | `.layout-login` | full-screen two-column | 01 |

### 3.4 共享组件

| 组件 | 描述 | 复用页面 |
|------|------|---------|
| `topbar` | Logo + 端口标识 + 铃铛 + 头像 | 所有页面 |
| `chat-panel` | AI 对话面板（气泡+输入框+语音按钮） | 02-06, 08, 09 |
| `task-card` | 嵌入 Chat 的可点击任务卡片 | 02, 03 |
| `sco-list` | 左导航 SCO 列表（状态图标） | 04 |
| `stepper` | 左导航步骤条（3阶段） | 05, 11 |
| `heatmap` | 热力图组件（颜色格子+hover tooltip） | 03, 08 |
| `notes-ball` | 笔记悬浮球+下拉+弹窗 | 02-06 |
| `modal` | 通用弹窗框架 | 03, 07, 08, 09 |
| `dropdown` | 通用下拉菜单 | 03, 07, 10 |
| `avatar-placeholder` | SVG 占位头像（首字母+渐变背景） | 05, 03 |

---

## 四、图片资源策略

### 4.1 PPT 课件图片（已就绪）

授课场域 S03-S06 直接使用下载的 41 张图片：
- S03 (PPT SCO): 展示 `MANAGER1_segment_1.1.jpg`（当前页面）
- 切换 SCO 时替换为对应 segment 的图片
- 图片以 `<img>` 标签渲染，保持原始比例，居中展示

### 4.2 Actor 头像（需生成）

对练场域 S09 需要 Actor（"张经理"）头像。替代方案：

**方案 A：SVG 占位头像**
```html
<svg width="80" height="80" viewBox="0 0 80 80">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#667EEA"/>
    <stop offset="100%" stop-color="#764BA2"/>
  </linearGradient></defs>
  <circle cx="40" cy="40" r="40" fill="url(#g)"/>
  <text x="40" y="48" text-anchor="middle" fill="white" font-size="28" font-weight="600">张</text>
</svg>
```

**方案 B：用可用的文本模型生成 base64 描述**（不推荐，无实际图片生成能力）

采用方案 A。

### 4.3 装饰性图片

- 登录页左侧品牌区：CSS 渐变背景 + 产品 Logo SVG
- 大厅看板区图标：使用 emoji 或 Lucide/Heroicons 图标库（CDN）
- 热力图：纯 CSS 色块
- 图表（折线图/柱状图）：CSS + 少量 JS 绘制，或使用 Chart.js CDN

---

## 五、交互实现策略

### 5.1 页内交互方式

所有交互用原生 JS 实现（不引入框架），通过 `data-*` 属性和 CSS class toggle：

```javascript
// 通用 toggle 模式
document.querySelectorAll('[data-toggle]').forEach(el => {
  el.addEventListener('click', () => {
    const target = document.getElementById(el.dataset.toggle);
    target.classList.toggle('is-visible');
  });
});
```

### 5.2 页面间导航

页面间通过 `<a href="xx.html">` 跳转（静态 HTML 间链接）：

| 触发 | 从 | 到 |
|------|----|----|
| 登录按钮 | 01-login | 02-hall-empty |
| 任务卡片[开始学习] | 02-hall-empty | 04-lecture |
| 任务卡片[继续学习] | 03-hall-daily | 04-lecture |
| Activity 完成[开始] | 04-lecture | 05-practice |
| "回到辅导" | 04-lecture | 03-hall-daily |
| 端口切换→管理端 | 03-hall-daily | 08-operation |
| 端口切换→学员端 | 08-operation | 03-hall-daily |
| 常显导航 | 管理端页面间 | 07/08/09/10 互跳 |
| 报告卡片点击 | 09-report-mgmt(库) | 09-report-mgmt(编辑器) |
| ← 返回报告库 | 09-report-mgmt(编辑器) | 09-report-mgmt(库) |

### 5.3 复杂页面的视图切换

| HTML 文件 | 切换机制 | 视图数 |
|-----------|---------|--------|
| 04-lecture | SCO 列表点击 → 替换看板区内容 | 5 (PPT/Video/Quiz/FEEDBACK/完成页) |
| 05-practice | 步骤条状态 + JS phase 切换 | 3 (情景导入/角色扮演/反思复盘) |
| 08-operation | Tab 点击 → 替换左栏内容 | 3 (项目/人员/内容维度) |
| 09-report-mgmt | drill-down 切换 | 2 (报告库 ↔ 编辑器) |
| 10-message | drill-down 切换 | 2 (发送记录 ↔ 新建消息) |
| 11-inquiry-p3 | 步骤条 + phase 切换 | 3 (说明/核心调研/确认) |

---

## 六、构建顺序

### Phase 1: 基础设施（共享资源）
1. `shared/styles.css` — 8 种布局骨架 + 组件样式
2. `shared/components.js` — toggle/tab/dropdown/modal 交互
3. `shared/mock-data.js` — 数据导出

### Phase 2: 学员端核心流程
4. `01-login.html` — 最简页面，验证 L-H 布局
5. `02-hall-empty.html` — L-A 布局 + Leo Chat + 空状态
6. `04-lecture.html` — L-B 布局 + 5 视图切换（最复杂学员端页面）
7. `05-practice.html` — L-C/L-D 混合 + 3 阶段切换
8. `06-report-learner.html` — L-C 布局 + 证据弹窗
9. `03-hall-daily.html` — L-A 布局 + 9 种页内交互（最复杂交互页面）

### Phase 3: 管理端
10. `08-operation.html` — L-F 布局 + 3 维度 Tab
11. `09-report-mgmt.html` — L-G/L-F 切换 + 编辑器
12. `10-message.html` — L-G 布局 + drill-down
13. `07-config.html` — L-G 布局 + 子导航锚点 + 开营流程

### Phase 4: P3 附页
14. `11-inquiry-p3.html` — L-C/L-E 混合 + 3 阶段

---

## 七、质量检查清单

- [ ] 所有 11 个 HTML 文件可独立在浏览器中打开
- [ ] 页面间链接全部可跳转
- [ ] 所有页内交互（toggle/tab/dropdown/modal）可正常触发
- [ ] PPT 图片正确加载（41张）
- [ ] Chat 区对话内容与 mock-data 一致
- [ ] 管理端和学员端 Topbar 差异正确（端口标识文字不同）
- [ ] 笔记悬浮球在所有学员端页面出现
- [ ] 热力图 hover tooltip 可触发
- [ ] 响应式布局在 1440px 宽度下正常展示
- [ ] 无真实产品中不存在的"注释区"或原型专用元素
