# 睿学 Demo 整合规划

> 目的：在保留现有 11 个独立 HTML 的前提下，新增一个 `demo.html` 作为演示壳，把所有页面串联成一条可播、可暂停、可跳转的完整叙事，覆盖 spec v0.4.0 的全部核心功能。
> 日期：2026-04-22
> 维护：王鼎明

---

## 一、目标与定位

### 1.1 Demo 要达到的效果

- **一键演示**：点击「开始演示」，自动按章节推进 15-20 个关键场景，约 10-15 分钟走完全流程
- **可停可拖**：随时暂停、手动切换章节、从任意章节开始
- **叙事完整**：一个完整故事线——学员张磊 5 周内从首次登录到完成 Course 1 的全旅程，穿插管理员 HR 视角
- **功能全覆盖**：spec 里所有 P0/P1/P2 模块都有对应章节演示
- **场景化旁白**：每一帧有字幕解释"你现在看到的是什么功能"
- **聚光灯高亮**：关键元素在出现时被视觉强调
- **跨页状态一致**：学员姓名、进度、AI 记忆、笔记、Discovery 等数据在所有页面间共享

### 1.2 观众群体与使用场景

| 观众 | 使用场景 | 期望时长 |
|------|---------|---------|
| 内部评审 / 产品经理 | 评审会议 / 迭代启动会 | 10-15 分钟 |
| 销售 / 客户 | 对 HR 客户的产品演示 | 5-8 分钟（精简版） |
| 投资人 / 战略决策 | pitch 场合 | 3 分钟（速览版） |
| 开发 / 设计 | 验证产品设计 | 自由浏览 |

对应提供 3 种播放模式：**完整版** / **精简版** / **速览版**，以及 **自由模式**（手动浏览）。

### 1.3 不做什么（范围外）

- 不做真实后端（所有 AI 回复、数据都是 mock）
- 不做响应式移动端（聚焦 PC 1440px+）
- 不做多语言
- 不改动现有 11 个 HTML 的核心功能（只做必要的状态接入适配）

---

## 二、架构选型

### 2.1 候选方案对比

| 方案 | 说明 | 优点 | 缺点 |
|------|------|------|------|
| A: iframe Shell | `demo.html` 做外壳，内嵌 iframe 显示现有 11 页 | 不改现有代码；隔离干净 | postMessage 通信；iframe 样式/尺寸难控 |
| B: SPA 路由重构 | 把所有内容迁到一个 SPA | 状态共享最简单 | 等于重写一遍 |
| C: 菜单式导航页 | `index.html` 做菜单，点击跳到各页 | 实现最快 | 不能自动播放，不像 demo |
| D: Shell + DOM 注入 | Shell 用 fetch 加载 HTML 片段注入自身 | 灵活；无 iframe 限制 | 样式/脚本隔离麻烦；需改造现有 HTML |

### 2.2 推荐方案：**A（iframe Shell + postMessage 通信桥）**

**理由**：
- 保留 11 个页面不动（用户要求）
- iframe 可精确控制尺寸、生命周期
- postMessage 标准化页面间通信
- 失败影响小（iframe 崩了只影响当前帧）

**架构图**：
```
┌──────────────────────── demo.html (Shell) ─────────────────────────┐
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │  Header Bar：章节标题 | 进度 3/20 | [上一章][下一章][播放]  │  │
│ ├──────────────────────────────────────────────────────────────┤  │
│ │                                                              │  │
│ │               <iframe src="build/XX.html">                    │  │
│ │                  (动态切换 src 和 state)                       │  │
│ │                                                              │  │
│ └──────────────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │  字幕区 (narration): "张磊首次登录睿学平台……"              │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                    [聚光灯 overlay 覆盖在 iframe 上]                │
└────────────────────────────────────────────────────────────────────┘
                         ↕ postMessage
                ┌──────────────────────┐
                │  build/XX.html (帧)   │
                │  监听 message        │
                │  执行 auto-actions   │
                └──────────────────────┘
```

### 2.3 技术约束

- 必须走 HTTP 服务器（iframe + postMessage 在 file:// 协议会受限，已有 `python -m http.server 8765`）
- 字体、图片资源相对路径保持原样（iframe 加载时以自身为 base）
- 状态共享用 `localStorage`（同源下 iframe 与 shell 互通）

---

## 三、演示剧本（故事线）

### 3.1 主剧本：张磊的 5 周学习旅程

**主角**：张磊（销售部，跨部门协作困扰）
**时间跨度**：项目 W1 - W5（2026-03-15 到 2026-04-22）
**核心事件**：从"推着走"变成"主动辅导下属"

**副角**：HR 管理员（看学员进度、生成报告、发送消息）

### 3.2 章节划分（20 章）

| # | 章节标题 | 页面 | 时长 | 关键演示点 |
|---|---------|------|-----|-----------|
| 01 | 开篇：睿学登录 | 01-login | 15s | 登录页品牌调性 |
| 02 | 首次进入大厅 | 02-hall-empty | 30s | 空状态设计 + Neo 自我介绍 |
| 03 | Neo 需求感知 | 02-hall-empty | 45s | 对话式需求发现 + 课程推荐理由 |
| 04 | 接受推荐进入课程 | 02-hall-empty → 04-lecture | 10s | 场域间跳转 |
| 05 | PPT SCO 学习 | 04-lecture | 45s | PPT 沉浸式 + Neo 口播讲解 |
| 06 | 学员提问 → Neo 答疑 | 04-lecture | 30s | 答疑口播 + AI 响应 |
| 07 | Quiz SCO 答题 + 闭环反馈 | 04-lecture | 40s | 测验交互 + 正误反馈 |
| 08 | 笔记悬浮球使用 | 04-lecture | 25s | 笔记快速记录 |
| 09 | Activity 完成弹窗 | 04-lecture | 15s | 完成态 + 引导去对练 |
| 10 | 对练情景导入 | 05-practice P1 | 30s | GROW 模型回顾 + 任务目标 |
| 11 | 对练角色扮演 | 05-practice P2 | 90s | 三列布局 + Actor 情绪曲线 + Neo 主动辅导 |
| 12 | 对练反思复盘 | 05-practice P3 | 45s | 高光+待改进 + 对话回看 |
| 13 | 回到大厅·中期数据 | 03-hall-daily | 30s | 4 库 2×2 布局 + 进度更新 |
| 14 | Discovery 发现卡片接受 | 03-hall-daily | 25s | Neo 推送"亮眼表现" → 学员接受 → 入库 |
| 15 | 查看个人学习报告 | 06-report-learner | 50s | Markdown 长文档 + 证据引用 + Neo 解读 |
| 16 | 端口切换到管理端 | 头像菜单 → 08-operation | 10s | 跨端切换机制 |
| 17 | 管理端首页 Ora 查询 | 08-operation | 50s | KPI+热力图+Ora 问答 |
| 18 | 生成团队报告 | 09-report-mgmt | 45s | HITL 编辑 + Ora 协作 |
| 19 | 发送催学消息 | 10-message | 25s | 选人+富文本+发送 |
| 20 | 项目配置演示 | 07-config | 30s | 子导航锚点+开营前状态 |
| 21 | 调研场域体验（P3） | 11-inquiry-p3 | 45s | 三阶段 + STAR 访谈 |
| 22 | 闭幕：Neo 形象切换 | 03 设置弹窗 | 15s | 品牌代言个性化 |

**总时长**：约 10 分钟（完整版），精简版跳过 06/08/11/20/21（约 5 分钟），速览版只保留 02/05/11/15/17/18（约 3 分钟）。

### 3.3 剧本详细结构（每章的数据模型）

```js
{
  id: 'ch-05',
  title: 'PPT SCO 学习',
  chapter: 5,
  url: 'build/04-lecture.html',
  duration: 45000, // ms
  prerequisites: { // 进入章节前需要在 localStorage 中设置的状态
    learnerProgress: '2/7 Activity',
    currentActivity: 'A3',
    sessionContext: 'first-lecture-entry'
  },
  narration: [ // 字幕序列
    { at: 0, text: '进入授课场域。左侧抽屉可呼出课程大纲。', duration: 4000 },
    { at: 5000, text: 'Neo 作为课堂助手，正在讲解 PPT。', duration: 4000 },
    { at: 10000, text: '这是一张关于"心理防御·吊桥隐喻"的课件。', duration: 4000 }
  ],
  actions: [ // 自动触发的交互
    { at: 8000, type: 'highlight', selector: '#navOverlayToggle', label: '左侧抽屉入口' },
    { at: 14000, type: 'click', selector: '#navOverlayToggle' },
    { at: 16000, type: 'highlight', selector: '.sco-list', label: '课程 SCO 列表（缩略图）' },
    { at: 20000, type: 'click', selector: '#navClose' },
    { at: 25000, type: 'scroll-chat', target: 'last-neo-message' }
  ],
  next: 'ch-06'
}
```

---

## 四、前置准备（需要补足什么）

### 4.1 现有 11 页需要补足的"演示钩子"

为了让 Shell 能远程驱动每个页面，需要给现有页面加几个轻量级接口（不影响原有功能）：

1. **监听 postMessage**：每页加一个通用监听器
   ```js
   window.addEventListener('message', (e) => {
     if (e.data.type === 'demo-action') {
       handleDemoAction(e.data);
     }
   });
   ```
2. **暴露 Demo API**：在 `window.demoAPI` 上挂载几个工具方法
   - `demoAPI.typeInto(selector, text, speed)` — 打字机效果
   - `demoAPI.clickElement(selector)` — 模拟点击
   - `demoAPI.scrollTo(selector)` — 滚动到元素
   - `demoAPI.highlightElement(selector)` — 临时高亮
   - `demoAPI.showToast(text)` — 显示临时提示
3. **就绪信号**：DOM 加载完后向父窗口 postMessage `{type: 'demo-ready'}`
4. **状态恢复**：页面加载时读 `localStorage.demoState`，调整内容（比如 02-hall-empty 在 Demo 模式下可以直接显示 Neo 的推荐对话，跳过空聊）

### 4.2 需要补足的演示数据

现有 mock-data.json 覆盖了静态内容，但演示需要**动态时序数据**：

1. **打字节奏表**：每个 Neo 回复的字数 / 出现速度
2. **对话脚本**：按章节串联的完整对话流（学员输入、Neo 回应、时机）
3. **事件时间轴**：每个章节的关键事件时刻（何时弹出、何时点击）

### 4.3 需要新增的组件

| 组件 | 用途 | 位置 |
|------|------|------|
| `demo-shell.html` | Shell 主容器 | `demo/demo.html` |
| `demo-shell.js` | 章节编排 + postMessage 桥 | `demo/demo-shell.js` |
| `demo-shell.css` | 控制栏/字幕/聚光灯样式 | `demo/demo-shell.css` |
| `scenarios.js` | 20+ 章节剧本定义 | `demo/scenarios.js` |
| `demo-hook.js` | 注入到每个 iframe 页面的 demo API | `demo/demo-hook.js` |
| `state-manager.js` | localStorage 封装 + 跨页状态 | `demo/state-manager.js` |
| `spotlight.js` | 聚光灯覆盖层逻辑 | `demo/spotlight.js` |
| `narration.js` | 字幕渲染与同步 | `demo/narration.js` |

### 4.4 现有页面需要小修改

| 页面 | 修改点 | 工作量 |
|------|-------|-------|
| 所有 11 页 | 加载 `demo-hook.js`（条件加载：URL 带 `?demo=1` 参数时才加载） | 1-2 行/页 |
| 02-hall-empty | Demo 模式下跳过部分对话延时，直接显示到 Neo 推荐 | 小 |
| 04-lecture | 开放 API 让 Shell 切换 SCO 视图 | 小 |
| 05-practice | 开放 API 让 Shell 切换 Phase | 小 |
| 09-report-mgmt | 开放 API 让 Shell 触发新建报告弹窗 | 小 |
| 10-message | 开放 API 让 Shell 触发新建消息 | 小 |

### 4.5 需要新做的资源

- **章节导航索引 UI**（左侧可收起面板）
- **进度条**（Shell 顶部，显示总时长与当前位置）
- **播放控制**（播放/暂停/下一章/上一章/重置/速度倍率）
- **演示模式徽章**（页面右上角显示"演示模式 · 第 X 章"）
- **闭幕界面**（整个演示播完后的总结页）

---

## 五、文件结构

```
DM_Temp/prototype/
├── build/                          # 保留，11 个 HTML 不动
│   ├── 01-login.html
│   ├── 02-hall-empty.html
│   ├── ...
│   └── 11-inquiry-p3.html
├── assets/                         # 现有资源
│   ├── mock-data.json
│   ├── neo-male.svg
│   ├── neo-female.svg
│   ├── avatar-zhao.jpg
│   └── ppt/
├── demo/                           # ⭐ 新增整合层
│   ├── demo.html                   # Shell 主入口
│   ├── demo-shell.js               # 章节调度核心
│   ├── demo-shell.css              # Shell UI 样式
│   ├── scenarios.js                # 20+ 章节剧本
│   ├── state-manager.js            # 跨页状态（localStorage 封装）
│   ├── demo-hook.js                # 注入每个页面的 API（postMessage 桥）
│   ├── spotlight.js                # 聚光灯与高亮
│   ├── narration.js                # 字幕系统
│   ├── chapter-menu.js             # 章节导航侧边栏
│   └── progress-bar.js             # 进度指示
└── README-demo.md                  # 演示使用说明
```

---

## 六、执行分阶段

### Phase 1: Shell 基础架构（预计 0.5 天）

1. 创建 `demo/demo.html` 外壳
2. 设置 iframe 容器、控制栏、字幕区、聚光灯 overlay
3. 实现章节切换（手动点击下一章，切换 iframe.src）
4. 实现 iframe 就绪检测（等 iframe 加载完再开始本章）
5. 最简化的 scenarios.js（只有章节 url 和标题）

**验收标准**：能看到 Shell UI，手动点下一章能切换页面，但没有自动化。

### Phase 2: postMessage 通信桥（预计 0.5 天）

1. 写 `demo-hook.js`，暴露 `window.demoAPI`
2. 每个 HTML 页面加载条件：URL 带 `?demo=1` 时才加载 hook
3. 实现 Shell → iframe 的 4 个核心动作：click / typeInto / scrollTo / highlight
4. 实现 iframe → Shell 的反馈：`demo-ready` / `action-done` / `chapter-complete`

**验收标准**：Shell 能远程触发 iframe 内部的点击和输入。

### Phase 3: 状态管理（预计 0.5 天）

1. 写 `state-manager.js`，封装 localStorage
2. 定义 8-10 个核心状态 key：`learnerName, currentActivity, currentChapter, neoAvatar, unlockedCourses, notes, discoveryItems, reports`
3. 每个页面在加载时读状态、调整显示
4. Shell 在章节切换时更新状态

**验收标准**：切换到第 13 章回大厅时，大厅显示已完成 A3、进度 28%，而不是空状态。

### Phase 4: 字幕与聚光灯系统（预计 0.5 天）

1. `narration.js` 渲染字幕（Shell 底部 caption 区）
2. `spotlight.js` 在 iframe 外部覆盖层上圈出元素（需要先获取元素在 iframe 内的位置，postMessage 回传 rect）
3. 字幕支持：淡入淡出、多行、高亮关键词

**验收标准**：章节开始时底部出现旁白，关键元素被聚光灯框住。

### Phase 5: 剧本内容编写（预计 1 天）

1. 按章节大纲，为每个章节写完整 narration 文案（字幕）
2. 为每个章节写 actions 序列（何时点哪个按钮、输入什么、滚动到哪）
3. 为每个章节写 prerequisites（进入前的状态）
4. 整合到 `scenarios.js`

**验收标准**：20 个章节全部可自动播放，时间线合理，文案专业。

### Phase 6: 播放控制与章节导航（预计 0.5 天）

1. 播放/暂停按钮（暂停时保留当前字幕和状态）
2. 上一章/下一章导航
3. 章节索引侧边栏（列出 20 章，当前章高亮，点击跳转）
4. 速度倍率：0.5x / 1x / 1.5x / 2x
5. 3 种播放模式切换：完整版 / 精简版 / 速览版

**验收标准**：播放中可随时暂停/跳转；倍速正常工作。

### Phase 7: 进度条与总览（预计 0.25 天）

1. 顶部进度条（总时长分段显示）
2. Hover 进度条显示章节提示
3. 闭幕总结页（列出本次演示覆盖的所有模块）

**验收标准**：进度条随时反映当前演示位置。

### Phase 8: 集成测试与润色（预计 1 天）

1. 从第 1 章播到最后章节，检查时序、字幕、状态一致性
2. 切换到精简版/速览版，确认跳章节逻辑正确
3. 暂停 + 跳转 + 继续的边界情况
4. 不同分辨率（1280/1440/1920）表现
5. 打磨字幕文案与演示节奏

**验收标准**：完整 10 分钟演示无 bug，演示顺畅专业。

**总工作量估算**：约 4.5 天（单人集中开发）

---

## 七、关键技术决策

### 7.1 跨页通信

```js
// Shell → iframe
iframe.contentWindow.postMessage({
  type: 'demo-action',
  action: 'click',
  selector: '.login-btn'
}, window.origin);

// iframe → Shell
parent.postMessage({
  type: 'demo-feedback',
  event: 'chapter-complete',
  chapter: 'ch-05'
}, window.origin);
```

### 7.2 状态持久化策略

- 所有章节状态写入 `localStorage.demoState`（JSON）
- 每个页面加载时读 state，按需覆盖默认渲染
- 章节切换时 Shell 合并新的 state 变更
- 重置按钮清空 state 回到初始

### 7.3 自动播放节奏控制

- 每个 action 有 `at` 时间戳（相对章节起点）
- Shell 用 `setTimeout` 按序触发
- 暂停时保留剩余时间轴
- 速度倍率影响所有 timeouts

### 7.4 聚光灯实现

- Shell 维护一个绝对定位的 SVG overlay（覆盖在 iframe 上）
- 聚光灯请求时：`postMessage` 问 iframe "元素 selector 的 getBoundingClientRect 是什么"
- iframe 回传坐标
- Shell 在 SVG 上绘制镂空矩形 + 虚线圈

### 7.5 旁白文案设计原则

- **客观描述**：说"你现在看到的是..."而非"我们"
- **一句一帧**：每条字幕 ≤ 30 字，≤ 4 秒
- **强调重点**：关键词用颜色高亮（cyan / violet）
- **避免术语**：不说 "AOM"、"SCO"，说"课程单元"、"学习节点"
- **故事感**：穿插张磊的心路历程（"张磊有点疲惫，Neo 主动关切..."）

---

## 八、最终效果（用户看到什么）

### 8.1 打开 demo.html 后的体验

```
1. 登录页面（01-login）全屏展开，右上角小字"演示模式 · 第 1/22 章"
2. 底部字幕缓慢淡入：「张磊是 A 公司销售部经理，正在首次登录睿学平台」
3. 4 秒后：聚光灯圈出用户名输入框
4. 用户名区开始自动打字："student01"
5. 密码区打字："••••••••"
6. 登录按钮被点击，画面切换到大厅空状态
7. 字幕：「首次登录，Neo 以品牌形象出现在对话区上方」
8. Neo 自动发出欢迎消息
9. Neo 逐步追问需求
10. 学员回复被自动输入
11. Neo 推出带"推荐理由"的课程卡片
12. 聚光灯移到 [开始学习] 按钮，字幕「点击进入授课」
13. 切换到 04-lecture
14. ... (后续 15 章)
22. 最后停在"闭幕页"，列出本次演示展示的 25 项功能
```

### 8.2 操作自由度

- Header 可随时暂停 / 重新开始
- 左侧"章节索引"面板可跳到任意章节
- 速度调节 0.5x - 2x
- 模式切换：完整版 / 精简版 / 速览版
- 自由模式：关闭自动播放，手动操作 iframe 内页面

### 8.3 观众带走的印象

- **产品完整性**：5 周学习旅程 + 双端 + AI 陪伴，体验闭环
- **AI 差异化**：Neo 的主动感知 + 跨场域记忆 + 品牌人格化
- **场域化设计**：4 个学习场域各有独特交互范式
- **管理端赋能**：Ora 让 HR 从"数据搬运工"变"洞察协作者"

---

## 九、风险与应对

| 风险 | 概率 | 影响 | 应对 |
|------|-----|------|------|
| iframe 内 postMessage 被 CSP/sandbox 拦截 | 中 | 高 | 确保 Shell 与 iframe 同源（localhost:8765），不用 sandbox 属性 |
| 聚光灯坐标与 iframe 内元素位置不同步（滚动/resize） | 高 | 中 | Shell 与 iframe 互通 scroll 事件，坐标动态更新 |
| 打字机效果在某些输入框（受控组件）失效 | 中 | 低 | 提供两种实现：原生 input 事件 vs 直接 setAttribute |
| 章节切换时 iframe 新页面未加载完就执行 action | 中 | 高 | 严格等待 `demo-ready` 消息后再触发第一个 action |
| 现有 HTML 某些按钮没有稳定 selector | 低 | 中 | 审计所有要触发的元素，确保有 id 或 data-* |
| 全流程演示中 localStorage 被清空 | 低 | 中 | Shell 定期备份 state 到内存，重置时双重确认 |
| 字幕文案翻译或修正需要批量改 | 中 | 低 | 字幕从 JSON 抽离，外部编辑 |

---

## 十、分工与交付物

### 10.1 单次完整交付包含

1. `demo/` 目录下 9 个文件
2. 11 个 HTML 最小改动（加载 demo-hook.js 条件化）
3. `README-demo.md` 使用说明
4. 录制一段 mp4 视频作为 backup（防止演示现场出 bug）
5. 若干测试 checklist

### 10.2 里程碑

| 里程碑 | 时间 | 交付 |
|-------|-----|------|
| M1 Shell 骨架 | Day 1 | 可手动切章节的空壳 |
| M2 通信桥 | Day 1.5 | Shell 能远程触发 iframe 动作 |
| M3 状态管理 | Day 2 | 跨页状态一致 |
| M4 字幕+聚光灯 | Day 2.5 | 视觉引导系统 |
| M5 剧本完整 | Day 3.5 | 20 章可播 |
| M6 控制与导航 | Day 4 | 播放控制完备 |
| M7 集成打磨 | Day 5 | 可对外演示 |

---

## 十一、开工前的决策点（需要你确认）

以下 6 个关键决策需要你拍板：

### ❓ 决策 1：演示的"主叙事模式"

- **A. 单主角叙事**（张磊的 5 周）：更连贯有感情
- **B. 功能分区导览**（先学员端后管理端）：更清晰但像说明书
- **C. 故事+分区混合**：主剧本张磊，插入 3 个 HR 视角场景

### ❓ 决策 2：默认播放时长

- 完整版 10 分钟 / 精简 5 分钟 / 速览 3 分钟，哪个作为默认打开？

### ❓ 决策 3：自动播放 vs 手动步进

- 默认打开就自动播，还是等用户点"开始演示"按钮？

### ❓ 决策 4：字幕风格

- **A. 纯旁白**（客观描述页面）
- **B. 剧情风**（"张磊有点疲惫……Neo 关切地问……"）
- **C. 功能说明**（"这是 Discovery Library，Neo 会自动推送亮眼表现……"）

### ❓ 决策 5：聚光灯强度

- **A. 强**（除目标元素外其他都变暗）
- **B. 中**（目标有虚线框+淡色光晕）
- **C. 弱**（只改变目标元素的颜色动画）

### ❓ 决策 6：是否做录屏 fallback

- **是**：现场演示失败的兜底（mp4 视频）
- **否**：只做交互版，失败就失败

---

## 十二、开工工作量汇总

| 阶段 | 内容 | 工作量 |
|-----|------|-------|
| Phase 1 | Shell 基础 | 0.5d |
| Phase 2 | 通信桥 | 0.5d |
| Phase 3 | 状态管理 | 0.5d |
| Phase 4 | 字幕+聚光灯 | 0.5d |
| Phase 5 | 剧本编写（20 章） | 1d |
| Phase 6 | 播放控制 | 0.5d |
| Phase 7 | 进度+闭幕 | 0.25d |
| Phase 8 | 集成与打磨 | 1d |
| **合计** | | **约 5 个工作日** |

需要的配合：
- 决策 6 个关键点（约 30 分钟）
- 剧本/字幕文案润色（约 1 小时）
- 验收时长约 30 分钟

---

**以上是完整规划。等你确认决策点 1-6 后即可开工。**
