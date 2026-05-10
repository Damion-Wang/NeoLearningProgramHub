# _shared · 跨页共享层

## 目录

```
_shared/
├─ fonts/    Inter 字体 4 字重 6 woff2（本地）+ inter.css
├─ vendor/   Chart.js 4.4 UMD（本地）
├─ css/      跨页共享 CSS
│  └─ tokens.css        :root + [data-theme="dark"] · 78 vars 全集（v1.3）
├─ mock/     跨页共享 mock 数据
│  ├─ admin.js          AdminCtx{members 24 + currentAdmin getter + otherAdmins}（v1.3）
│  ├─ project.js        PROJECT 元信息 + DEMO_ACCOUNTS（派生自 AdminCtx · v1.3）
│  ├─ branding.js       BRANDING{neoName/oraName/disclaimerText/welcomeMsg}（v1.3）
│  ├─ coursepack.js     COURSE_PACK 8 课 29 Activity（CRS-XXX/ACT-XXX-XX）
│  ├─ course-stats.js   COURSE_STATS 课/Activity 维度聚合（started/completed/avgTime/hl）（v1.3）
│  ├─ learning-stats.js LEARNING_STATS 24 学员学习态（progress/hours/login/prog）（v1.3）
│  ├─ milestones.js     MILESTONES 项目里程碑（含学习节奏 + 业务事件 7 条 · 取代 timeline.js · v1.3）
│  ├─ messages.js       消息 + audience='learner|admin|all' + filterMessagesByRole + MessagesRead 跨页已读
│  └─ progress/todos/highlights/notes.js  v1.2.2 跨场域 5 LINK store
├─ js/       跨页共享 JS 逻辑
│  ├─ session.js        Session.{set,get,clear,canSwitchPort,setRemember,clearRemember}（含 memberId · v1.3）
│  ├─ router.js         Router + FILE_MAP（含 proconfig + massagemgt · v1.3）
│  ├─ ux-logger.js      UX 录制器（Ctrl+Shift+左键 加针对性笔记）
│  └─ jumper.js         v1.2 跨页跳转中枢
└─ admin/    管理端独立 mock + app（v1.3 融合搬入）
   ├─ proconfig-{mock,app}.js
   └─ massagemgt-{mock,app}.js
```

## 引入顺序（每页 HTML 头部）

```html
<!-- 1. CSS tokens 先行（v1.3）-->
<link rel="stylesheet" href="_shared/fonts/inter.css" />
<link rel="stylesheet" href="_shared/css/tokens.css?v=14" />

<!-- 2. mock 数据 · admin.js 必须先于 project.js（DEMO_ACCOUNTS 引用 AdminCtx） -->
<script src="_shared/mock/admin.js?v=14"></script>
<script src="_shared/mock/project.js?v=14"></script>
<script src="_shared/mock/branding.js?v=14"></script>
<script src="_shared/mock/milestones.js?v=14"></script>
<script src="_shared/mock/messages.js?v=14"></script>
<!-- 按需 · 学员页 + admin 页 ↓ -->
<script src="_shared/mock/coursepack.js?v=14"></script>
<script src="_shared/mock/course-stats.js?v=14"></script>      <!-- 仅 mgthome / proconfig -->
<script src="_shared/mock/learning-stats.js?v=14"></script>    <!-- 仅 mgthome / proconfig -->

<!-- 3. 共享 JS -->
<script src="_shared/js/session.js?v=14"></script>
<script src="_shared/js/router.js?v=14"></script>
<script src="_shared/js/ux-logger.js?v=14"></script>

<!-- 4. 第三方 -->
<script src="_shared/vendor/chart.umd.min.js"></script>

<!-- 5. 本页内联逻辑 -->
<script>
  // 启动校验：无 session 跳 login
  if (!Session.isLoggedIn()) location.replace('00-睿学Demo-双击启动.html');
</script>
```

## API 速查

### `Session`

| 方法 | 用途 |
|---|---|
| `Session.set(s)` | 写 session（s 含 account/display/role/target/loginAt）|
| `Session.get()` | 读 session（无 returns null）|
| `Session.isLoggedIn()` | bool |
| `Session.canSwitchPort()` | bool · 仅 `role === 'learner+admin'` 返 true |
| `Session.clear()` | 清 session（不清 remember）|
| `Session.setRemember(account)` | 写 remember |
| `Session.getRemember()` | 读 remember 账号 |
| `Session.clearRemember()` | 清 remember |

### `Router`

| 方法 | 用途 |
|---|---|
| `Router.go(target, params)` | 跳转 · target ∈ FILE_MAP keys（login/hall/mgthome）|
| `Router.requireSession()` | 启动校验 · 无 session location.replace 到 login |
| `Router.fromParam()` | 读 URL `?from=xxx` |
| `Router.param(key)` | 读任意 URL param |
| `Router.isImplemented(target)` | bool · 白名单内才执行跳转 |

`FILE_MAP`（router.js 内）：
```js
{
  login: '00-睿学Demo-双击启动.html',
  hall: 'hall.html',
  mgthome: 'mgthome.html'
}
```

### `filterMessagesByRole(role)`

- `'learner'`   → 返回 audience ∈ {'learner', 'all'} 的消息
- `'admin'`     → 返回 audience ∈ {'admin', 'all'} 的消息
- `'learner+admin'` → 返回全部
- 其他 / null → 返回 `MESSAGES` 原始

### `UXLog`（控制台）

```js
UXLog.list()    // 当前所有日志
UXLog.export()  // 下载 .md
UXLog.addNote() // 加全局笔记
UXLog.pause() / resume() / clear()
```

## 加新共享内容时遵守

1. **数据** → `mock/`（确保 hall + mgthome 都消费同一份）
2. **逻辑** → `js/`（API 简洁 + 暴露到 window 全局）
3. **CSS** → `css/`（每页 link rel=stylesheet 引入）
4. **第三方** → `vendor/`（必须本地化，禁外网 CDN）

## 改这里时的检查表

- [ ] 改完 grep 确认所有引用方都 OK（`grep -r "Session\." build-v2/`）
- [ ] 不破坏现有 API 形状（兼容性优先）
- [ ] 数据格式变了 → 同步更新各页解析逻辑
- [ ] commit 信息写清"_shared/x.js: ..."（让 reviewer 一眼定位）

> 维护人：DM (PM) · 最后更新 2026-05-07
