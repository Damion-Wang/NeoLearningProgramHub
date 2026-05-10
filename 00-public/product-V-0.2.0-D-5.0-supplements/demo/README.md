# build-v2 · 当前可运行 demo

## 启动方式

**A. 双击运行**（推荐 · 给 PM / 同事用）：
- 双击 `00-睿学Demo-双击启动.html`
- 默认浏览器打开（建议 Chrome / Edge）

**B. 本地服务器**（避免 file:// 限制）：
```powershell
cd ..  # 到 prototype-v2/
python -m http.server 9877
# 访问：http://localhost:9877/build-v2/00-睿学Demo-双击启动.html
```

## Demo 账号（密码统一 `demo2026`）

| 账号 | 角色 | 进入端 | 演示 |
|---|---|---|---|
| `zhao@demo.neolearning.com` | 学员（赵工）| hall | 学员视角全功能 |
| `hr@demo.neolearning.com` | 管理员（HR 王）| mgthome | HR 视角 |
| `admin@demo.neolearning.com` | 多角色（陈总）| hall | **★ 双端切换重头戏** |
| `error@demo.neolearning.com` | 错误演示 | — | shake / 拒绝 |

## 文件清单

```
build-v2/
├─ 00-睿学Demo-双击启动.html   ← 入口（login 页）
├─ hall.html                   学员端首页
├─ mgthome.html                管理端首页
└─ _shared/                    跨页共享层（详见 _shared/README.md）
```

## 推荐演示路径（F03 多角色 flow，~5-8 分钟）

1. `admin@` 登录 → 进 hall（陈总）
2. 浏览 hall：26 周热力 / 雷达 / 4 库 tab / Neo Chat
3. 右上 avatar dropdown → "切换到管理端" → 确认
4. URL 变 `mgthome.html?from=hall`，进管理端
5. 浏览 mgthome：⚠ 6 chip / 学员表展开 / 报告库 / 高光库 / Ora Chat
6. avatar dropdown → "切换到学员端" → 回 hall
7. 退出登录 → 回 login

完整流程见 `../USER-STORY.md` § 5（端到端 flow）。

## 关键约束

- **0 远程依赖**：所有字体 / 库 / 图片本地化（`_shared/fonts/`、`_shared/vendor/`、`assets/`）
- **build-v2 自包含**：复制整个 build-v2/ 文件夹给同事即可，**不依赖外部目录**
- **localStorage 三 key**：
  - `neo_demo_session` · 当前登录态（关浏览器保留）
  - `rx-theme` · 主题（light / dark）
  - `demo_login_remember_account` · 记住的账号
- **session 跨 tab 共享**：同浏览器多 tab 同账号

## 修改 demo 数据

- 项目元信息 → `_shared/mock/project.js`（PROJECT + DEMO_ACCOUNTS 派生自 AdminCtx）
- 24 学员账号 → `_shared/mock/admin.js`（AdminCtx.members + currentAdmin getter）
- 学员学习态 → `_shared/mock/learning-stats.js`（progress/hours/login/prog · 按 memberId）
- 课程结构 → `_shared/mock/coursepack.js`（COURSE_PACK 8 课 29 Activity）
- 课程统计 → `_shared/mock/course-stats.js`（按 courseId/activityId · started/completed/avgTime/hl）
- 里程碑（学习 + 业务）→ `_shared/mock/milestones.js`（v1.3 取代 timeline.js · 含 weekIndex/pct/type）
- 平台品牌 → `_shared/mock/branding.js`（neoName/oraName/disclaimerText）
- 站内消息 → `_shared/mock/messages.js`（按 role 自动过滤 + MessagesRead 跨页已读）
- CSS 设计变量 → `_shared/css/tokens.css`（:root + dark · 78 vars）

## 已知留坑

- login.html 不响应主题切换（dark 模式从 hall 退出回 login 视觉跳变 · v1.1 已记录但未修，影响小）
- mgthome 消息 unread 状态切端不持久化（v1.1 决定不修）

## v1.1 工程纪律（A-H · 改这里时必读）

详见 `../USER-STORY.md` § 7.3：
- A. 抽 _shared/ 不要复制粘贴
- B. CSS selector 限定具体目标
- C. Grid 加子元素同步加列
- D. 动态内容 = `height:100%` + 内 flex 滚
- E. 0 远程依赖（file:// 必须可运行）
- F. 浏览器原生 vs 自定义二选一
- G. 状态分类决定持久化层
- H. 全局监听器排除自身 UI

> 维护人：DM (PM) · 最后更新 2026-05-07
