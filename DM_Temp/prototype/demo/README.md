# 睿学 Demo · 使用说明

> 完整可浏览的产品 demo，13 个自包含 HTML 文件，覆盖学员端 + 管理端双视角。

## 快速开始

### 启动本地服务器

```bash
cd "D:/绚星科技/02-Research/AI-tutor/20260408睿学业务规划/DM_Temp/prototype"
python -m http.server 8765
```

### 打开 demo

浏览器访问：http://localhost:8765/demo/index.html

> 自动重定向到 01-login.html。

## 账号列表

| 账号 | 身份 | 场景 | 进度 |
|------|-----|------|-----|
| 张磊 (student01) | 中期学员 + 管理员 | 日常学习 + 日常运营 | W5/16 · 28% · A3 进行中 |
| 李明 (newbie01) | 初期学员 + 开营新运营 | 首次登录 + 开营前配置 | W0/16 · 0% · 未开营 |

登录页顶部可切换两个账号（Tab）。密码任意可留空或填默认。

## 页面清单

```
demo/
├── index.html                 → 01-login.html 重定向
├── 01-login.html              登录页（账号切换）
│
├── 学员端（张磊 W5/16）
├── 02-hall-mid.html           中期大厅（Dashboard/4库/Leo→Neo对话）
├── 03-lecture.html            授课区 A3（PPT+Neo答疑）
├── 04-practice.html           对练区 A4（GROW 三阶段）
├── 05-report-learner.html     个人学习报告
├── 06-inquiry.html            调研区 A0
│
├── 学员端（李明 W0/16）
├── 02-hall-new.html           新人大厅（空态+等待开营）
│
├── 管理端（张磊身份）
├── 07-mgmt-home-mid.html      运营首页（KPI/热力图/学员列表/Ora）
├── 08-mgmt-report.html        团队报告库
├── 09-mgmt-message.html       消息管理（催学+手动）
├── 10-mgmt-config.html        项目配置（6区表单）
│
└── 管理端（李明身份）
    └── 07-mgmt-home-new.html  开营前首页（配置完成度 80%）
```

## 导航拓扑

```
index → 01-login
           │
           ├── 张磊登录 → 02-hall-mid
           │   ├── 课程卡 → 03-lecture → 04-practice → 05-report
           │   ├── Discovery 来自 04
           │   ├── 端口切换 → 07-mgmt-home-mid
           │   │       ├── 报告 → 08-mgmt-report
           │   │       ├── 消息 → 09-mgmt-message
           │   │       └── 配置 → 10-mgmt-config
           │   └── 调研 → 06-inquiry
           │
           └── 李明登录 → 02-hall-new
               ├── 端口切换 → 07-mgmt-home-new
               │       └── 去配置 → 10-mgmt-config
               │           └── 确认开营 → 07-mgmt-home-mid（象征进入运营）
```

## 状态持久化

- **localStorage key**：`srxDemoState_zhanglei`、`srxDemoState_newbie`
- **当前账号**：`srxCurrentAccount`（值为 `zhanglei` 或 `newbie`）
- 跨页保留：笔记、Discovery、进度、Neo 形象、AI 语速、铃铛已读

## 特性

### 独立性
- 每个 HTML 完全自包含，CSS/JS 内联，图片 base64 内联
- 单独发送任意 HTML 给别人打开都能完整预览
- 仅依赖 CDN：Tailwind/Lucide/Google Fonts

### Neo 品牌形象
- 所有学员端对话区顶部有 Neo 形象 hero
- 个人设置可切换男/女形象（localStorage 跨页同步）

### 交互功能
- 笔记悬浮球（场域中记的笔记→大厅笔记库）
- Discovery 卡片接受流程（Neo 推送→学员接受→入库）
- Activity 完成弹窗
- 头像下拉菜单 + 端口切换
- 铃铛通知下拉
- 报告新建弹窗表单
- 配置确认开营弹窗

## 测试报告

见 `tests/test-report-20260423.md`，15 个 E2E 用例全部通过。

## 重置 Demo

清空 localStorage 回到初始状态：

```js
// 浏览器 Console 执行
localStorage.clear();
location.reload();
```

## 技术约束

- 仅 Chrome/Edge 120+ 测试通过
- 最佳分辨率：1440×900（自适应 1280-1920）
- 图片全部 base64 内联，单 HTML 可离线工作（CDN 缓存后）
