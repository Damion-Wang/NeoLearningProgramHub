---
version: V-0.2.0-D-5.0
product-version: V-0.2.0
doc-version: D-5.0
status: draft
last-updated: 2026-05-06
source: plan/03-v0.5.0-full.md
source-range: lines 2275-2330
source-section: § 9 章首 + § 9.1
numbering: per-file-independent
---

## 1 · 学员端

> 本章描述学员端的整体形态 + 中枢层 + 学习核心层 + 跨场域机制。
> AI 角色 = Neo（详见 [02-foundation/02-methodology § 1] / [02-foundation/01-personas § 1.2]）。

学员端是学员与 NeoLearning 平台的全部交互入口——以 **Neo 1v1 陪伴** 为核心，贯穿项目周期内的学习与项目结营后的剩余服务期。学员端的设计总尺度 = "**它让 Neo 更像 1v1 老师吗？**"（详见 [02-foundation/02-methodology § 1] Neo 第一性原理）。

学员端左侧导航仅 2 项 —— **大厅**（默认主页 · 本章主体）+ **社区**（完整社交平台 · 本版置灰仅 icon · Constructing）。

### 1.1 学员端总览

让读者一眼看清学员端由什么组成、如何走通一个学习项目周期。

#### 1.1.1 学员旅程图

```
登录（首次企业 SSO / 后续个人凭证）
    ↓
进入大厅（看板 + Neo 辅导 + 笔记悬浮球）
    ↓
开始 Course
    ↓
lecture 听课（含自由复习） → practice 对练（含多次重练） → recap 小结（4 状态：空白 / 部分 / 完整 ★ / 自由复习）
    ↓
recap 完整态首次进入 → Activity 完成事件触发 → 应用计划入大厅待办
    ↓
跨 Course 推进 + 笔记沉淀 + Neo 跨场域陪伴
    ↓
结营（团队结项报告 + 成果汇报会）
    ↓
剩余服务期（继续访问 + 渐进归档）
    ↓
归档（数据交付按 [03-lifecycle/03-completion § 3.1]）
```

> **入口与对应关系 callout**：
> - **入口路径**：登录后默认进大厅 / 大厅 → Neo 推荐 或 自选 → 进入某 Course 的 lecture / practice / recap / 任何场域 → 笔记悬浮球（始终可见）/ recap 完成 → Course 个人报告 → 回大厅
> - **[02-foundation/03-roles-and-ports § 1.2] 学员端** = 端口架构视角（用户 / AI / 入口）/ **本章 [05-learner/01-overview § 1] 起的学员端章节** = 旅程 + 场景细节视角（[02-foundation/03-roles-and-ports § 1.2] 的展开）/ **[03-lifecycle/01-pre-learning § 1] 起的生命周期章节** = 项目生命周期视角（学员端模块在生命周期各阶段如何被使用）

#### 1.1.2 学员端模块清单

| 层级 | 模块 | 说明 |
|------|------|------|
| 中枢层 | 大厅（[05-learner/02-hub § 1]）| Neo 辅导（对话）+ 看板（4 区域 / 含**学习成果区 = 4 库**：我的工具 / 我的报告 / 我的高光 / 我的笔记）+ 笔记悬浮球 |
| 学习核心层 | lecture / practice / recap（[05-learner/06-cross-context § 3]）| 3 个学习场域 |
| 跨场域机制 | 笔记悬浮球 + 4 库 + Neo 跨场域记忆（[05-learner/06-cross-context § 4]）| Neo 跨大厅 / 3 个学习场域 同身份持续陪伴 |

