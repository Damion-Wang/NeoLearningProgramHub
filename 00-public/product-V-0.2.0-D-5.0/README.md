---
version: V-0.2.0-D-5.0
product-version: V-0.2.0
doc-version: D-5.0
status: spec-split-complete
last-updated: 2026-05-06
---

# product-V-0.2.0-D-5.0/ — 睿学产品 V-0.2.0 / 第 5 版文档

> **版本**：V-0.2.0-D-5.0 · **状态**：§ 1-§ 10 全部完成 / spec 已拆分到 17 文件 / 全部【已审阅】 · **更新**：2026-05-06
> 本目录是产品 V-0.2.0 时期的第 5 版文档（v0.5.0 全文重写 + spec 拆分版）。

详细版本元数据见 [VERSION.md](VERSION.md)。

## 目录结构

| 路径 | 性质 | 状态 |
|------|------|------|
| [`spec/`](spec/) | **★ 主体 spec / 6 板块 17 文件 / 全部【已审阅】** | ✅ |
| [plan/03-v0.5.0-full.md](plan/03-v0.5.0-full.md) | spec 全文源 / § 1-§ 10 单体（拆分前底稿 / 持续与 spec/ 同步）| ✅ |
| [plan/README.md](plan/README.md) | plan 入口 | ✅ |
| [VERSION.md](VERSION.md) | 版本元数据 + 历史 | ✅ |

## spec/ 目录（拆分后的主体 / 17 文件）

| 板块 | 文件清单 |
|------|----------|
| 01-vision | `01-vision【已审阅】.md` |
| 02-foundation | `01-personas` / `02-methodology` / `03-roles-and-ports` / `04-data-model` |
| 03-lifecycle | `01-pre-learning` / `02-learning` / `03-completion` |
| 04-global | `01-user-global` / `02-platform-global` |
| 05-learner | `01-overview` / `02-hub` / `03-lecture` / `04-practice` / `05-recap` / `06-cross-context` |
| 06-management | `01-overview` / `02-home` / `03-report-center` / `04-program-config` / `05-message` |

> 全部 17 文件已加【已审阅】后缀,经过单文件审查 + DM 决议 + 修复 + 自检流程。

## 当前进度（截至 2026-05-06）

- ✅ **§ 1-§ 10 全部完成**（2026-05-04）
- ✅ **spec 拆分**（2026-05-05）：03-full 6822 行 → spec/ 6 板块 17 文件
- ✅ **全文件单文件审阅 + 关键术语校准 + 5×5 卡片矩阵全局重做**（2026-05-05 ~ 05-06）
- ✅ **关键术语校准**：Activity 完成事件 / 完成事件层 / 综合报告 / 学员端各场域统一布局 / 互动次数 等
- ⏳ **下一步**：D-5.0 freeze + 进入 D-6.0 / 研发对接

### 历史进度（详见 [VERSION.md](VERSION.md) + [`../../PROGRESS.md`](../../PROGRESS.md)）

- ✅ §1（愿景）/ §2（方法论）/ §3（Persona）/ §4（角色端口）完成（2026-04-27 ~ 04-28）
- ✅ §5（数据模型）/ §6（生命周期）整体重构 + 50 题决策完成（2026-04-28）
- ✅ §7（用户全局功能）/ §8（平台全局策略）完成（2026-04-28 ~ 04-29）
- ✅ §9 学员端**全部完成**（2026-04-29 ~ 05-03）
- ✅ §10 管理端 5 模块全量完成（2026-05-04）
- ✅ 4 维 fan-out 审查 + 5 角色 Debate + DM 反向讨论（2026-05-04）
- ✅ spec 拆分到 17 文件 + 全文件审阅 + 全局术语校准（2026-05-05 ~ 05-06）

## 与 D-4.0 的关系

- **继承**：D-4.0 中"未被推翻"的设计直接保留
- **推翻**：D-5.0 推翻 D-4.0 的部分（如 4 大情绪 → 10 状态、AI 老师 → Neo、§7 拆 §7+§8、Leo 完全取消、4 场域 → 3 学习场域 + 大厅 等）
- **新增**：6 维感知图谱、Soul 文档、记忆系统底层原则、Neo 第一性原理（7 动作）、Activity 完成事件 + 完成事件层、5×5 卡片矩阵 等

## 审查与修复历史

- 4 维审查（global/meso/detail/relation）+ 53 任务 PM 决议（详见 `../../claude-workspace/review/03-full/`）
- 单文件审查决议表 + 各文件 review log（详见 `../../claude-workspace/spec-review-2026-05-05/`）
- 多份 pre-merge / pre-split 备份（详见 `../../claude-workspace/backup/`）

## 上一版

- [`../product-V-0.2.0-D-4.0/`](../product-V-0.2.0-D-4.0/) — 已审阅 spec + 原型（冻结快照）

## 重要约定（适用于本目录）

- spec/ 是当前主体 / plan/03-full 是源 / 两者保持同步
- 新增 / 修改前请同步更新 spec/ 对应文件 + 03-full 对应章节
- 本目录写完后会成为下一版（D-6.0 或 V-0.2.1-D-1.0）的基线
