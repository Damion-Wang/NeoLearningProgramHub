---
version: V-0.2.0-D-5.0
product-version: V-0.2.0
doc-version: D-5.0
status: delivered
last-updated: 2026-05-06
---

# 06-management/ — 管理端

> **板块定位**：D-5.0 spec 管理端板块 / 5 文件 / 描述管理端完整产品形态——**4 业务模块**（Home + Report Center + Program Config + Message）+ **Ora 双实例**（Home Ora + Report Ora）。
>
> ⚠️ D-4.0 → D-5.0 关键变更：**4 模块 + 单 Ora → 5 模块 + Ora 双实例**。详见 [`../CHANGELOG.md`](../CHANGELOG.md) 模块 16。

## 管理端结构

```
管理端
├── 总览 ──────────────────────── 01-overview（4 模块 + Ora 双实例 + 双态切换）
│
├── 业务模块 ─────────────────────
│   ├── 首页 Home ─────────────── 02-home（看板区 + Home Ora）
│   ├── 报告中心 Report Center ── 03-report-center（报告库 + 报告编辑 / Report Ora / ChatBI）
│   ├── 项目配置 Program Config ─ 04-program-config（双态切换 / 6 配置板块）
│   └── 消息中心 Message ──────── 05-message（消息管理 + 消息编辑 / 三大类消息）
```

## 文件清单

| # | 文件 | 一句话 | 核心内容 |
|---|---|---|---|
| 1 | [`01-overview【已审阅】.md`](01-overview【已审阅】.md) | **总览** | 4 业务模块清单 / **Ora 双实例**（Home Ora + Report Ora / 信息共享 / 各有独特能力）/ 4 类卡片产出（askUserQuestion + 证据卡片 + 报告引用卡片 + 学员快照卡片）/ Truth Source 在 § 1.6 |
| 2 | [`02-home【已审阅】.md`](02-home【已审阅】.md) | **首页 Home** | 看板区（3 维度：项目/人员/内容 + 项目健康度看板 + 3 圈嵌套热力图 + 进度态 chip + 登录状态 chip）/ Home Ora 区（呈现 + 解读 + 钻取 3 能力 / 被动呈现 vs 主动问答双交互模式）/ 个体详情面板 / 异常学员判定 3 信号 |
| 3 | [`03-report-center【已审阅】.md`](03-report-center【已审阅】.md) | **报告中心** | 双主体（**报告库** 不需要 Ora · 看历史+新建入口 / **报告编辑** 需要 Report Ora · 协同编辑+ChatBI）/ Tab 1 管理员报告 + Tab 2 学员报告 / WYSIWYG Markdown 编辑器 / **6 类图表 ChatBI**（柱状/折线/表格/堆叠柱状/饼图/散点图）/ **3 种协同编辑**（直接输入 / vibe 写作 / 划词修改）/ 写入即固化 / 锁快照 |
| 4 | [`04-program-config【已审阅】.md`](04-program-config【已审阅】.md) | **项目配置** | **双态切换**（配置态 / 运营态）/ **6 配置板块**（项目信息 / 人员名单与角色 / 里程碑配置 / 催学规则 / 平台个性化 / 内容预览）/ 平台个性化（Logo / 品牌色 / 欢迎语 / Neo Ora 名字）/ 催学规则 4 类触发（里程碑绑定 / 脱训 / 进度落后 / 手动）/ 阈值默认（脱训 7 天 / M×0.80 / M×1.20）/ 学员名单变更 SOP |
| 5 | [`05-message【已审阅】.md`](05-message【已审阅】.md) | **消息中心** | 消息管理 + 消息编辑双主体 / 三大类消息（平台 + 系统 + 用户）/ 消息类型 chip（手动 / 自动催学 / 草稿 / 定时）/ 投递状态（已发送 / 失败 / 未发送 / 待发送）/ 投递日志 / WebSocket 实时 / 多人同发 / 富文本 / 不做撤回 |

## Ora 双实例对照

| 实例 | 位置 | 主要能力 |
|---|---|---|
| **Home Ora** | 首页 Home | 看板被动呈现 + 主动问答 / 数据钻取 / 异常学员解释 / 报告前的数据准备 |
| **Report Ora** | 报告中心 | HITL 编辑（拉数据 + 多轮 + admin/HR HITL 编辑）/ ChatBI 6 类图表生成 / 3 种协同编辑（直接输入 / vibe 写作 / 划词修改）/ 写入即固化 |

两个 Ora 实例**信息共享**（Home Ora 上下文传 Report Ora）但**各有独特能力**。

## 双态切换（program config）

| 态 | 时机 | 可改 | 主要使用者 |
|---|---|---|---|
| **配置态**（项目配置状态）| 开营前 | 全部 6 板块可配置 | admin |
| **运营态**（项目运营状态）| 开营后 | 学员名单变更走 SOP / 其他可改 | 管理员（HR + 项目运营）|

切换触发 = "确认开营按钮"（Config 主页底部）。

## 推荐阅读顺序

### 完整顺序

1. **01-overview** —— 管理端架构总览（必读 / Ora 双实例 + 4 模块关系）
2. **02-home** —— 首页 Home（看板 + Ora / 日常监控主战场）
3. **03-report-center** —— 报告中心（最复杂 / Report Ora + ChatBI + 双 Tab）
4. **04-program-config** —— 项目配置（双态切换最复杂的状态机）
5. **05-message** —— 消息中心（三大类消息 + 投递日志）

### 快速路径

- 看 Ora 双实例 → `01-overview` § 1.6
- 看异常学员判定 → `02-home` § 1.2.4
- 看 ChatBI 6 类图表 → `03-report-center` § 1.3.3
- 看 3 种协同编辑 → `03-report-center` § 1.3
- 看双态切换 → `04-program-config` § 1.1
- 看 6 配置板块 → `04-program-config` § 1.2
- 看催学规则 → `04-program-config` § 1.2.4
- 看三大类消息 → `05-message` § 1.2 + `04-global/01-user-global` § 1.4

## 关联板块

- **02-foundation/01-personas**：Ora Persona / Soul / 立场 / 数据空间 3 层架构
- **02-foundation/02-methodology** § 6 维画像：管理端 widget 消费 6 维画像数据
- **02-foundation/03-roles-and-ports**：管理员（角色）vs admin（账号）严格区分 / 4 类角色 / 3 端架构
- **03-lifecycle/02-learning**：学习期 / 项目里程碑 / 催学规则配置（运行时数据基于 program config）
- **03-lifecycle/03-completion**：结营 / 团队结项报告（综合报告模板的具体业务环节产出）
- **04-global/01-user-global**：站内消息体系 / Bell icon / 三大类消息（管理端消息中心是其管理端实现）
- **04-global/02-platform-global**：数据交付与隔离 / 每个管理员独立报告库 + 独立草稿副本
- **05-learner/05-recap**：学员侧 recap 报告（完成态 recap raw 进入管理端 Tab 2 学员报告库）

## 重要约定

- **5 报告矩阵**（详见 `00-glossary.md` § 10）：Course 个人报告（学员）/ practice 报告（学员）/ 综合报告模板（管理）/ 结项报告（管理 / 阶段 6 业务环节）/ team report（管理 / Ora 拉数据）
- **HITL（Human-in-the-loop）**：Ora 拉数据 + 多轮 + admin/HR HITL 编辑 —— 报告生成的核心模式
- **Truth Source 节点**：所有跨模块共享概念（如 4 类卡片 / 6 维画像 等）的唯一权威节点定义在某文件某 § / 其他位置仅引用不重述
- **管理员 vs admin** 严格区分：管理员 = 角色权限名（HR + 项目运营）/ admin = 账号类型（项目根账号）

## 文件大小（参考）

| 文件 | 章节数 | 备注 |
|---|---|---|
| 01-overview | 10 | Ora 双实例 + 4 类卡片 |
| 02-home | 25 | 含字母段 A/B/C/D / 看板区 + Ora 区 |
| 03-report-center | 29 | 最大 / 报告库 + 报告编辑 + ChatBI 6 图表 + 3 种协同编辑 |
| 04-program-config | 14 | 双态切换 + 6 配置板块 |
| 05-message | 18 | 消息管理 + 消息编辑 + 三大类消息 |
