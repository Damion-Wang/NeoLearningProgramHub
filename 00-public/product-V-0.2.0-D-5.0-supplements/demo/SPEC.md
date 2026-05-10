# 睿学 NeoLearning Demo · 功能 Spec（事无巨细）

> v1.5.2 · 2026-05-09 · 维护：DM (PM) + Claude
>
> 这份文档描述 **demo 当前能演的所有功能** — 不是 PRD（PRD 在 `../docs/spec/product-V-0.2.0-D-5.0/`），是 demo 落地后给 PM/试用人/研发的操作手册 + 内部结构说明。

---

## 0 · 30 秒了解 demo

- **范围**：8 页（学员端 4 + 管理端 4）+ 1 登录页
- **角色**：双 AI · 学员侧 Tutor「**Neo**」/ 管理侧 Coach「**Ora**」
- **技术底**：纯 HTML / CSS / 原生 JS · **0 远程依赖** · file:// 双击可跑
- **持久化**：localStorage · F5 自动清空回登录（demo 一次性体验设计）
- **入口**：双击 `00-睿学Demo-双击启动.html`

---

## 1 · 文件结构

```
demo/
├─ 00-睿学Demo-双击启动.html      ← 启动页 = 登录页
├─ hall.html                      学员端 · 大厅（个人首页）
├─ lecture.html                   学员端 · 授课
├─ practice.html                  学员端 · 对练
├─ recap.html                     学员端 · 小结
├─ mgthome.html                   管理端 · 项目首页
├─ proconfig.html                 管理端 · 项目配置
├─ massagemgt.html                管理端 · 消息中心
├─ reportcenter.html              管理端 · 报告中心
├─ _shared/
│  ├─ css/
│  │  ├─ tokens.css               设计 token（颜色 / 字号 / 间距）· 双主题
│  │  └─ topbar.css               6 页统一 topbar 样式（v1.5.2 抽出）
│  ├─ js/
│  │  ├─ session.js               账户会话（登录/退出/切换端口）
│  │  ├─ router.js                跨页跳转 + URL params
│  │  ├─ jumper.js                跳转前二次确认 modal
│  │  ├─ avatar-color.js          学员头像 memberId 稳定哈希（v1.5）
│  │  ├─ neo-speak.js             Neo 头像呼吸跟说话同步（v1.5.2）
│  │  ├─ demo-reset.js            F5 自动清 rx-* 回登录（v1.5.2）
│  │  └─ ux-logger.js             UX 录制（开发用 · 可关闭）
│  ├─ mock/                        全局共享 mock
│  │  ├─ admin.js                 24 学员名单 / 项目管理员
│  │  ├─ project.js               项目元数据 + 演示账号
│  │  ├─ branding.js              Neo/Ora 名 + 平台名 + 法律声明
│  │  ├─ milestones.js            项目里程碑（kickoff / W4 / W12 / closing 等 7 条）
│  │  ├─ coursepack.js            COURSE_PACK 8 课 29 Activity 单 source
│  │  ├─ course-stats.js          每课聚合统计
│  │  ├─ learning-stats.js        每学员聚合统计
│  │  ├─ messages.js              站内消息（学员/管理员/平台）
│  │  ├─ progress.js              跨场域 Activity 完成态 store
│  │  ├─ todos.js                 跨场域待办 store
│  │  ├─ highlights.js            跨场域高光 store
│  │  └─ notes.js                 跨场域笔记 store
│  ├─ admin/                       管理端 mock + app（页特有）
│  │  ├─ proconfig-mock.js / proconfig-app.js
│  │  ├─ massagemgt-mock.js / massagemgt-app.js
│  │  └─ report-mock.js / report-app.js
│  ├─ fonts/                       Inter 中英文 woff2（14 字体文件本地）
│  ├─ vendor/                      chart.umd.min.js（图表库本地）
│  └─ components/                  （预留 · 当前空）
├─ assets/                         图片 / 视频 / TTS / PPT 缩略图（20+ 文件）
└─ README.md                      简单运行说明
```

---

## 2 · 全局系统

### 2.1 登录 / Session

**入口**：`00-睿学Demo-双击启动.html`

**demo 账号 chips**（一键填账号 + 密码）：
| Chip | 角色 | 跳到 |
|---|---|---|
| `zhao` 多角色 | learner+admin | hall（多角色可切端） |
| `chen` 多角色 | learner+admin | hall |
| `wang` HR | admin（仅管理） | mgthome |
| `xu` 学员 | learner | hall |
| `tian` 学员 | learner | hall |

**登录后**：
- 写 `localStorage['neo_demo_session']` = `{memberId, name, role, display, loginAt}`
- 写 `localStorage['demo_login_remember_account']`（可选 · 下次自动填账号）
- 跳到 hall 或 mgthome（根据 role）

**未登录访问保护页**：每页 init 时 `if (!Session.isLoggedIn()) location.replace('00-...')` → 自动踢回登录

**退出登录**：右上头像下拉「退出登录」→ 二次确认 modal → 清 session → 跳 login

### 2.2 主题（light / dark）

- `localStorage['rx-theme']` = `'light'` | `'dark'`
- 在每页 `<head>` 内联脚本提前 set `data-theme` attr · 避免主题切换闪烁
- 切换：右上头像 → 设置 → 主题板块 → 日间 / 夜间

### 2.3 Neo persona（男 / 女）

- `localStorage['rx-persona']` = `'male'` | `'female'`
- 影响：Neo 头像（assets/neo-male.png / neo-female.png） + lecture TTS 音色
- 切换：右上头像 → 设置 → Neo 形象板块 → 男 Neo / 女 Neo
- proconfig 板块 5 也可改默认值（demo 影响所有 demo 账号）

### 2.4 AI 语速（慢/中/快）

- `localStorage['rx-speed']` = `'slow'` | `'normal'` | `'fast'`
- 影响：lecture TTS audio.playbackRate（1.0 / 1.1 / 1.2）

### 2.5 Branding（Neo/Ora 名字 + 法律声明）

- `localStorage['rx-branding']` = `{neoName, oraName, welcomeMsg, logoDataUrl}`
- 默认：Neo / Ora / NeoLearning AI / 平台 logo
- 修改：proconfig 板块 5「平台个性化」→ 编辑 → 保存 → **跨页立即生效**（写 localStorage + 调 `Branding.applyAll()` 扫所有 `.brand-neo` `.brand-ora` `.neo-bar-text` `.ora-bar-text`）
- F5 自动重置（demo-reset 清 rx-branding）

### 2.6 跨场域产出物（5 个 store · `_shared/mock/*.js`）

| Store | localStorage key | 加 / 删 API | 谁加 / 谁看 |
|---|---|---|---|
| **Notes** | `rx-notes` | `Notes.add({content,source,activityId})` / `Notes.remove(id)` | lecture/practice 浮窗写 → hall「我的笔记」看 |
| **Todos** | `rx-todos` | `Todos.add({text,source,activityId})` / `Todos.toggle(id)` | hall + Neo「+ 加入待办」 → hall 待办面板 + mgthome 总数 |
| **Highlights** | `rx-highlights` | `Highlights.add({title,quote,activityId})` / `.remove(id)` | Neo「⭐ 收藏」 → hall「我的高光」 |
| **Progress** | `rx-progress` | `Progress.markCompleted(activityId)` | lecture/practice 完成 → hall 课程卡变绿 + mgthome 学员进度 |
| **MessagesRead** | `rx-msg-read` | `MessagesRead.markRead(msgId)` / `.markAllRead(role)` | 铃铛红点跨页 |

### 2.7 跳转系统

- **`Router.go(target, opts)`**：跨页跳转 · target = `'hall'`/`'lecture-ppt'`/`'practice-intro'`/`'recap'`/`'mgthome'`/`'proconfig'`/`'massagemgt'`/`'reportcenter'`/`'login'`
- **`Jumper.confirmAndJump(name, target, opts)`**：先弹「即将进入 X · 取消/开始学习」二次确认 → 确认后 Router.go
- **完成 modal「继续下一 Activity」直跳**：v1.5.2 起不再 Jumper 二次问

### 2.8 F5 重置

- `_shared/js/demo-reset.js` 在每页 head 早加载
- `performance.getEntriesByType('navigation')[0].type === 'reload'` 时 → 清 `rx-*` + `neo_demo_session` + `demo_login_remember_account` → 跳 login
- 跨页跳转（`Router.go` / 普通 link）保留数据
- 演 demo 中途想重置：F5 即可

### 2.9 头像颜色（学员）

- `_shared/js/avatar-color.js`
- `AvatarColor.forMemberId(id)` → `[c1, c2]` 8 色对其一（按 memberId 稳定哈希）
- `AvatarColor.gradient(idOrName)` → linear-gradient string · 自动识别 `^u\d+$` 走 memberId · 否则按 name
- 跨页同一学员（如赵工 u1）颜色完全一致

### 2.10 Topbar 组件（v1.5.2 起统一）

`_shared/css/topbar.css` 提供 6 页通用：
- `.topbar` grid 布局：64px(留白) + auto(brand) + 1fr(项目名) + auto(actions)
- `.topbar-brand` padding 0 14px · cursor:pointer · 点 logo 整片返回首页
- `.port-chip` 学员端橙 / 管理端绿
- 三块（brand / port-chip / topbar-project）都可点 onclick="Router.go(home)"

---

## 3 · 学员端 4 页

### 3.1 hall（大厅）`hall.html`

#### 视觉布局

```
┌─ topbar ─┬───────────── stage ────────────────┬─ Neo chat 右栏 (380px 可拖) ─┐
│ logo · │ A 项目周期时间线（横条 + 7 里程碑）│ Neo 名 ←仅纯文字 · 无头像     │
│ 学员端 │ B 6 维雷达「Neo 怎么看你」+ 待办  │ Neo 流式消息（多类型卡）      │
│ 项目名 │ C 我的库 4 tab：高光 / 工具 /     │ - 文本消息                     │
│ 铃铛   │   笔记 / 报告                     │ - askUserQuestion 选项        │
│ 头像   │ D 学习热力图 26 周 × 7 天          │ - 知识工具卡 + 加入待办        │
│        │ E 课程列表 8 课（accordion）       │ - 任务卡 + 加入待办            │
└────────┴────────────────────────────────────┴─ 输入框 + 发送 / 语音 ────────┘
```

#### 关键功能

- **6 维雷达 「Neo 怎么看你」**：Chart.js radar · 6 维（思考反思/表达开放/挑战接纳/提取迁移/支持他人/系统视角）· hover 维度显示证据
- **学习热力图**：26 周 × 7 天（周一为列首）· 三圈：外圈活跃 / 中环学时 / 内核互动
- **课程列表**：8 课 accordion · 点击展开看 Activity 列表
  - 已完成 Course 1：CTA 显示「自由复习」绿色（v1.5.1 #15）
  - 进行中 Course 2：CTA「开始学习」/「继续学习」橙色
  - recap 类 Activity：关联前置 Activity 未完成 → CTA 锁定 disabled（v1.5 P4 · 0.5.1 spec）
- **我的库 4 tab**：
  - **高光（6）**：跨场域 Highlights store · 点击看完整 quote
  - **工具（3/8）**：Course 锁定中的工具 · hover 显示「需先完成 X 解锁」
  - **笔记（10）**：lecture/practice 归档的 + 大厅自身写的 · 点击看 / 删除
  - **报告（5）**：recap 完成的 + practice 演练报告 · 点击看 5 块结构
- **待办列表**：来自 todos store · 完成 / 删除 / 跳详情
- **Neo chat**：
  - 流式输出（按字符 60ms 估时长）
  - 5 类卡片：text / askUserQuestion / 知识工具卡（带图）/ 任务卡（带 + 加入待办）/ 高光卡
  - 输入触发关键词匹配 → 推 fallback 答案

#### 设置抽屉（右上头像 → 设置）

| 板块 | 项 |
|---|---|
| 主题 | 日间 / 夜间 |
| AI 语速 | 慢 / 中 / 快 |
| Neo 形象 | 男 Neo / 女 Neo（影响头像 + TTS 音色） |

#### 头像下拉菜单（4 项）

- 设置（同上）
- 帮助
- 切换到管理端（多角色账号 · 单角色 disabled）
- 退出登录（红色 · 二次确认）

---

### 3.2 lecture（授课）`lecture.html`

#### 布局

```
┌─ topbar ──────┬──────────── 课件区（满铺）──────────────┬─ Neo chat 右栏 ──┐
│ 抽屉 ☰  时长│ SLICE / VIDEO / QUIZ / FEEDBACK_COLLECT │ Neo 大头像（gif）│
│ 进度条 NN%  │ 整片显示 · ◀ ▶ 翻页（自由复习态）      │ Neo 名           │
│             │                                        │ 收起箭头         │
└─────────────┴────────────────────────────────────────┴ 流式消息 ────────┘
```

#### 关键功能

- **SCO 序列**：17 段（SLICE 课件页 + QUIZ 题 + VIDEO + FEEDBACK 反馈）
- **Neo TTS**：SCO 17 触发 audio 播放 + 4 句分时打字
  - 暂停按钮 / 持续呼吸动画（v1.5.2 F-NEO-BREATHE）
  - 暂停或切 SCO 时停呼吸
- **抽屉**（左上 ☰）：
  - **Project tab**：8 课 29 Activity 树 · 4 态（✓ 完成 / ▶ 当前 / ◐ 进行 / 🔒 锁定 / 空 未开始）
  - **SCO tab**：当前 Activity 17 SCO · 缩略图 + 完成态
- **回看 SCO**：抽屉点击之前 SCO → 进入回顾态 → Neo 答疑「这一页还有什么不理解？」 → 完成答疑后自动回到原讲解点续播 TTS（v1.5 P5）
- **完成 modal**：所有 SCO 完成后弹「Activity 完成 · 学习时长 / 互动次数」+ 自由复习/继续下一 / 回大厅按钮

---

### 3.3 practice（对练）`practice.html`

#### 4 阶段 phase 状态机

```
intro（情景导入）→ roleplay（角色扮演 · 与 Actor 对话）→ review（反思复盘）→ report（能力报告）
```

每个 phase 在抽屉「Activity 目录」显示：✓ 完成 / ▶ 当前 / ◐ 进行 / 空 未开始

#### 关键功能

- **Actor 对话**（崔德莫）：4 轮剧本 · 每轮 [学员发言 → 矩阵动画 → Actor 反应 + 表情切换 → Neo 同步评论]
- **矩阵 4 象限**：被动/主动 × 抵抗/投入 · Actor 状态根据剧本走位
- **重新演练**（v1.5 P6 #3）：演练 1 完成后点「重新演练」→ 演练 2（4 轮独立剧本）→ 完成弹「演练 2 完成」modal
- **review 阶段**：苏格拉底追问 N 轮 · 必给总结 + 任务卡（+ 加入待办）
- **report 阶段**：5 维评分（雷达图）+ 高光时刻 + 提升建议
- **自由探讨态**：完成 review/report 后 → 抽屉所有 phase 解锁 · 可任意切回去重看

---

### 3.4 recap（小结）`recap.html`

#### 布局

```
┌─ topbar ──────────┬──── 5 块小结报告（md-pane） ────┬─ Neo chat 右栏 ─┐
│ 抽屉 ☰           │ ① 内容锚点                      │ Neo 大头像     │
│ Course · 小结    │ ② 走过的轨迹（柱状图）           │ Neo 流式消息   │
│ 12 分钟          │ ③ 6 维画像变化                   │                │
│                  │ ④ 关键证据                       │                │
│                  │ ⑤ 待办任务                       │                │
└──────────────────┴──────────────────────────────────┴────────────────┘
```

#### 关键功能

- **Walk-through**（5 块逐块高亮 + Neo 解读）：自动按节奏切到下一块 · 每切到一块 Neo 推一段相关消息
- **抽屉 Project**：同 lecture · 点 locked Activity → toast 显示具体前置（v1.5 P13）
- **完成 modal**：3 按钮（v1.5.2 B20 起全 primary 主色）：
  - 回到大厅 → Router.go('hall')
  - 自由复习 → 进入 free 态
  - 继续下一 Activity → 直接 Router.go(next)（不再 Jumper 二次确认）
- **AICDisclaimer**：报告底部「以上内容由 NeoLearning AI 生成，仅供参考」（接 BRANDING.disclaimerText）

---

## 4 · 管理端 4 页

### 4.1 mgthome（项目首页）`mgthome.html`

#### 4 大区

```
┌─ A 项目周期时间线（横条 · 7 里程碑 · top/bottom 双 lane）
├─ B 顶部 KPI · 项目级聚合 4 数字（活跃/学时/Neo 互动/任务）+ 日/周/月 trend
├─ C 项目健康度热力图 26 周 × 7 天（三圈 · 当前 W6）
├─ D 学员分布与动态 · 24 学员卡片（hover 看 6 维雷达 + 风险标签）
├─ E 内容维 · 8 课进度卡片
├─ F 站内消息（铃铛红点同步）
└─ Ora chat 右栏（同 Neo · 头像 + 流式 + 5 类卡片 + askUserQuestion）
```

#### 关键功能

- **时间轴**：7 里程碑（kickoff/W4/上半年汇报/W12/中期满意度/Q3 OKR/closing）+ 「当前 W6」第 3 lane current 主色
- **学员卡片**：风险态自动 hover popover · 6 维雷达 / 近 4 周变化 / Neo 对话片段 askq
- **登录状态分布饼图**：18 活跃 / 4 风险 / 2 沉默 · hover chip 看学员名单
- **Top 排行**：进度领先 Top3 / 完成率 Top3 / 互动 Top3
- **消息**：按 role 过滤（admin 只看管理员消息）
- **Ora chat 5 类卡片**：reportRef（跳报告）/ learnerSnapshot（学员快照）/ askQuestion（决策弹窗）/ evidence（证据）/ vibeWriting（写作建议）

---

### 4.2 proconfig（项目配置）`proconfig.html`

#### 5 板块（侧边锚点 nav）

| 板块 | 内容 |
|---|---|
| 1 项目基础信息 | 项目名 / 服务周期 / 项目周期 / 项目描述 / 客户名 / 公司画像 |
| 2 里程碑 | 时间轴（marker-dot + double lane label）+ 阶段（开营+结营）+ 自定义（W4/W12/上半年汇报等 5/10）|
| 3 人员名单与角色 | 24 人 / 2 管理员 / 22 学员 · 编辑 / 添加 / 批量导入 · 默认密码（只读 + 复制）|
| 4 催学规则 | 3 条触发规则（脱训/落后/里程碑）· 文案模板可改 |
| 5 平台个性化 | Neo 名 / Ora 名 / 平台 logo / welcomeMsg · 编辑后跨页生效（v1.5.2 B-PROCONFIG-NAME） |
| 6 内容预览 | COURSE_PACK 8 课只读列表 · 点 lecture「查看课件序列」/ practice「查看对练剧本」弹宽 modal |

#### 编辑态（板块右上「编辑」按钮）

- 进编辑态 → 字段 disabled→enabled · 显示「保存 / 取消」按钮
- 板块 1 改服务周期/项目周期 → 弹严格确认 modal（v1.5.1 #16 删 HR/销售勾选）
- 板块 2 时间轴空白点击 → 编辑态可加自定义里程碑（v1.5.2 提示文已删）

#### 启动开营按钮

- 项目状态 = pre-launch（URL `?status=pre-launch`）→ 顶部 chip「开营前 · 待开营」+ 底部「确认开营」按钮 · 点击发 24 条系统消息
- 项目状态 = running（默认）→ 顶部 chip「已开营 · 还剩 N 天」

---

### 4.3 massagemgt（消息中心）`massagemgt.html`

#### 视图

- **list**（默认）：全消息列表 · 状态 / 类型 / 收件人 / 时间 / 内容预览 · 搜索 + 筛选
- **editor**（点新建 / 列表行）：title + 收件人选择器 + 富文本编辑器 + Ora 写作助手

#### Editor 关键功能

- **收件人选择器**：从 24 学员中多选 + 角色 / 阶段筛选 chip
- **Ora 写作助手**：右栏 Ora chat · 按场景推荐文案模板 + 划词改写
- **AICDisclaimer**：自动催学是 AI 生成 · 编辑器底部挂法律声明（接 BRANDING）

---

### 4.4 reportcenter（报告中心）`reportcenter.html`

#### 双视图（library / editor）

```
─ Library View ─────────────
│ 管理员报告（7） / 学员报告（5 人 · 19 份）
│ 时间筛选 / 排序 / 搜索
│ 列表行：报告名 / 修改时间 / 时间周期 / 人员范围 / 操作
└──────────────────────

─ Editor View（点列表行 / + 新建报告）──
│ 顶部 subbar：返回 / title / 导出
│ 主体：editor body（contenteditable + Ora 写入）
│ 右栏：Ora chat（写作助手 · 6 类图表）
└──────────────────────
```

#### Editor 关键功能

- **新建报告**：modal 填名 + 模板选（自定义 / 综合报告）+ 时间周期 + 人员范围
  - 自定义 → 草稿 4 块占位（v1.5.2 B-EDITOR-DRAFT）：① 关键学员动态 ② Course 完成情况 ③ 6 维画像变化 ④ 下一步建议 · 每块下面斜体灰「待 Ora 帮你拉数据 · 试着说...」
  - 综合报告 → Ora 自动生成 5 块初稿
- **Ora 5 类卡片**：触发顺序 reportRef → learnerSnapshot → askQuestion（决策）→ evidence
- **6 类图表**：柱状 / 折线 / 表格 / 堆叠柱 / 饼 / 散点（chart.js）· chat 「加一个 X 图」关键词匹配
- **划词改写**：选中段 → 弹工具栏（vibe / 缩写 / 引证据）
- **跨 tab 引用**：「引用田静 Course 1 recap」→ 自动从学员报告拉内容
- **Ora 写入即提示**：每次插入新内容 flash highlight + toast「已写入新增内容 · 可手动调整或 Ctrl+Z 撤销」（v1.5 P11）

#### 学员报告 tab

- 5 学员卡片（赵工 / 陈静 / 何颖 / 吕菲 / 田静 · u1/u8/u9/u10/u22）
- 展开后：RECAP 报告 / 对练报告 / 高光卡 三组
- 点单条 → 大窗 modal（v1.5 P10 · `.modal-card.wide` 760px）显示 preview 内容（v1.5.1 B02 已修对应学员名）

---

## 5 · 跨场域联动剧本（演 demo 重点动线）

### 剧本 A：学员端跨页产出物
1. 登录 zhao（多角色） → 大厅
2. 大厅看到课程列表 · 6 维雷达 · 学习热力图
3. 点「Course 2 横向协作 → A3 PIN 法实战演练」CTA → 二次确认 → 跳 practice
4. practice 完成演练 1 + review · Neo 推任务卡「+ 加入待办」 → 点击加入
5. practice 进入自由探讨 · 完成 → 点完成 modal「回到大厅」
6. **大厅看到**：待办列表新增 1 条 / 高光库新增 1-2 条 / Activity 进度 + 1 / 6 维雷达微调

### 剧本 B：跨端切换
1. 大厅 → 头像下拉「切换到管理端」 → 二次确认 → 跳 mgthome
2. mgthome 看到 24 学员的实时数据 · 项目时间轴 · Ora chat
3. mgthome → 点 Ora 推的「报告引用」卡 → 跳 reportcenter
4. reportcenter 学员报告 tab → 展开赵工 → 点 RECAP 报告 → 看完整 5 块内容
5. 切回学员端：头像下拉「切换到学员端」 → 跳 hall

### 剧本 C：proconfig 改 branding 跨页生效
1. mgthome → 头像下拉 → 「项目配置」 → proconfig
2. 板块 5 平台个性化 → 点编辑 → Neo 名「老段」/ Ora 名「老崔」/ 保存
3. proconfig 当前页：「Neo 形象」标题立刻变「老段 形象」
4. 跳 hall → 「老段 怎么看你」雷达卡 / 设置面板「老段」按钮
5. 跳 lecture → 右栏 Neo 头像下「老段」
6. 跳 mgthome → 右栏 Ora chat「老崔」
7. F5 → 自动重置回 Neo / Ora（demo-reset 清 rx-branding）

### 剧本 D：F5 重置 demo
1. 任意页 F5 → demo-reset.js 检测 navigation.type='reload' → 清所有 rx-* + session → 跳 login
2. 重新选 chip 登入 → 全新 demo 状态

---

## 6 · mock 数据约定

### 6.1 COURSE_PACK（8 课 29 Activity）

```
CRS-001 角色认知    [3 acts] A1 lecture / A2 lecture / A3 recap (relatedAct: A1+A2)
CRS-002 横向协作    [5 acts] A1 lecture / A2 lecture / A3 practice / A4 lecture / A5 recap (locked)
CRS-003 辅导反馈    [4 acts] A1-A4 (recap A4 locked)
CRS-004 目标拆解    [4 acts] (recap locked)
CRS-005 有效授权    [3 acts] (recap locked)
CRS-006 人员激励    [4 acts] (recap locked)
CRS-007 向上影响    [3 acts] (recap locked)
CRS-008 过程管控    [3 acts] (recap locked)
```

每个 Activity：`{id, title, type: 'lecture'|'practice'|'recap', minutes, status: 'completed'|'progress'|'notstarted'|'locked', target, relatedActivities}`

### 6.2 5 学员（reportcenter 用）

| memberId | 学员 | 角色 |
|---|---|---|
| u1 | 赵工 | 中期学员 |
| u8 | 陈静 | 新员工 |
| u9 | 何颖 | HR |
| u10 | 吕菲 | 中期学员 |
| u22 | 田静 | 中期学员 |

### 6.3 项目里程碑

- W1 开营（2026-03-22）
- W4 中期检查（2026-04-12）
- W8 上半年汇报准备（2026-05-15）
- W12 复盘（2026-06-07）
- W15 中期满意度（2026-06-30）
- W21 Q3 OKR 复盘（2026-08-15）
- W26 结营（2026-09-22）

当前 W6（2026-04-29）

### 6.4 Branding 默认

```js
{
  neoName: 'Neo',
  oraName: 'Ora',
  platformName: 'NeoLearning',
  disclaimerText: '以上内容由 NeoLearning AI 生成，仅供参考',
  welcomeMsg: '欢迎来到基层管理者培训项目 · 让"学了"变成"会做"',
  logoDataUrl: null
}
```

---

## 7 · 工程纪律 A-N（开发规范）

| ID | 一句话 |
|---|---|
| A | 跨页公共 → `_shared/`，禁止散写复制粘贴 |
| B | CSS selector 限定到具体目标（不选 html 根） |
| C | Grid 加子元素先看 `grid-template-columns` |
| D | 动态高度容器 = `max-height + overflow:auto + min-height:0` |
| E | **0 远程依赖** · 必须 file:// 双击运行 |
| F | 浏览器原生 `title` 与自定义 hover 不并存 |
| G | 状态分类决定 sessionStorage / localStorage / 内存 |
| H | 全局监听器排除 recorder/调试 UI 自身（含 `__rxUx`） |
| I | IIFE 内函数若需跨脚本调用，**必须 expose 到 window** |
| J | 独立 HTML 融合用副本不动原文件 |
| K | persona/theme 等跨页字段必须 localStorage 同 key |
| L | 确认按钮触发的跳转**不要插入二次 Jumper 确认** |
| M | 跨页中枢的伴生 CSS 必须三页对齐（v1.5.2 已抽 `_shared/css/topbar.css`） |
| N | 跨场域产出物走 `_shared/mock/*` 单 store + localStorage |

---

## 8 · demo 设计原则 P1-P5

| # | 原则 | 含义 |
|---|---|---|
| P1 | spec 覆盖优先 | spec 写的功能必须有对应 UI 演出 |
| P2 | 全流程无中断 | 0 console error / 0 死路 |
| P3 | 场域差异化可视 | Neo 在 lecture/practice/recap 行为差异看得出来 |
| P4 | 跨场域联动可观察 | 跨场域记忆/完成态/高光/待办 联动可见 |
| P5 | 自由探索安全网 | 乱点不会跑出 spec：未实装 toast / 错误账号反馈 / Esc 关 modal |

**法律红线**：所有 AI 生成内容下方必须挂「以上内容由 NeoLearning AI 生成，仅供参考」（AICDisclaimer · 接 BRANDING.disclaimerText）

---

## 9 · Neo 头像动效（v1.5.2）

- **静态**：默认 PNG（neo-male.png / neo-female.png）
- **说话呼吸**：Neo 推消息或播 TTS 时，`.neo-chat` 加 `.speaking` class · `.neo-hero-img` 跑 `neoBreathe` 动画 2.4s（scale 1→1.025 + box-shadow 脉冲）
- **持续时长**：
  - lecture TTS：按 audio.duration / playbackRate 估算
  - practice/recap：按消息字符数 × 60ms（min 1.2s · max 8s）
- 暂停 / 切 SCO → 立即停呼吸

---

## 10 · 已知不实装 / 未来扩展

- **lecture/practice 不同 Activity 复用同一 mock**（PM #1 决议不修 · "重构被动型员工" 剧本演 8 课通用 · 文案上"内容由 KGP 编排"解释）
- **reportcenter editor diff 弹窗**（v1.5 P11 部分实装 · flash highlight + toast 替代完整 diff modal）
- **proconfig 改 disclaimerText 不联动**（保留：法律意义"平台 + AI" 不应跟 Neo/Ora 改名联动）
- **mgthome topbar 跟学员端字号/间距对齐**（v1.5.1 #12 部分实装 · brand padding 对齐 · 高度 / actions gap 等细节后续可再 polish）

---

## 11 · 故障排查

| 现象 | 原因 / 修法 |
|---|---|
| 双击 html 一片白 | 检查浏览器 console · 大概率是相对路径错（应该都是相对的，无远程依赖）|
| 登录后又被踢回 login | localStorage 被清 · 重新登录即可 |
| 改 Neo/Ora 名跨页没生效 | 确认 proconfig 板块 5 点了「保存」按钮 · 不是只编辑 |
| Activity 进度不变 | 跨场域 Progress store 有 5s debounce · 等等再刷 |
| 课件序列预览图片不显示 | assets/ppt/MANAGER1_segment_*.jpg 缺 · 检查 demo zip 是否完整 |
| 演 demo 中途想从头来 | F5 即可（demo-reset 全清 rx-* 回登录）|
| 控制台 favicon 404 | 无害 · 没设 favicon 而已 |

---

## 12 · 修改日志

| 版本 | 日期 | 变更 |
|---|---|---|
| v1.0 | 2026-04 | 初版 16 页 |
| v1.2 | 2026-04 | lecture/practice 实装 + 跨场域 LINK |
| v1.3 | 2026-05 | proconfig + massagemgt 融合 |
| v1.4 | 2026-05 | recap + reportcenter 融合 |
| v1.4.1 | 2026-05-08 | PM 走读 13 bug + 8 页一致性扫描 |
| v1.5 | 2026-05-08 | 33 PM 实测 bug |
| v1.5.1 | 2026-05-08 | 20 自审 bug + topbar 共享 CSS + 学员头像稳定哈希 |
| v1.5.2 | 2026-05-09 | 5 bug + Neo 头像呼吸跟说话同步 + F5 即清 demo 数据 + branding 跨页持久化 |

详见 `../docs/plans/V1.5.2-FIX-PLAN.md` 等历次修复计划。

---

> 维护：DM (PM) + Claude · 创建 2026-05-09
