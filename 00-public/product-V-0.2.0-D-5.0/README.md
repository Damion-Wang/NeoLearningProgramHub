---
version: V-0.2.0-D-5.0
product-version: V-0.2.0
doc-version: D-5.0
status: draft
last-updated: 2026-04-29
---

# product-V-0.2.0-D-5.0/ — 睿学产品 V-0.2.0 / 第 5 版文档

> **版本**：V-0.2.0-D-5.0 · **状态**：草稿（在写） · **更新**：2026-04-29
> 本目录是产品 V-0.2.0 时期的第 5 版文档（v0.5.0 全文重写稿 + backlog + 元规划），仍在编。

详细版本元数据见 [VERSION.md](VERSION.md)。

## 目录结构

| 文件 | 性质 | 状态 |
|------|------|------|
| [plan/01-spec-update-plan-2026-04-27.md](plan/01-spec-update-plan-2026-04-27.md) | v0.5.0 元规划（怎么改、改哪些） | 已交付 |
| [plan/02-v0.5.0-outline.md](plan/02-v0.5.0-outline.md) | 1000 字大纲，10 节 | 已交付 |
| [plan/03-v0.5.0-full.md](plan/03-v0.5.0-full.md) | **★ 主体文档**，§1-§9 完成（约 2843 行 / 160k 字）| 在编 |
| [plan/04-v0.5.0-backlog.md](plan/04-v0.5.0-backlog.md) | 实施 backlog（按 § X.Y.Z 对齐）| 在编 |
| [plan/05-v0.5.0-section-7-9.md](plan/05-v0.5.0-section-7-9.md) | §9 管理端草稿（§8 已合并到 03-full）| 在编 |

## 当前进度（截至 2026-04-29）

- ✅ §1（愿景）/ §2（方法论）/ §3（Persona）/ §4（角色端口）完成
- ✅ §5（数据模型）/ §6（生命周期）整体重构 + 50 题决策完成
- ✅ §7（用户全局功能）/ §8（平台全局策略）/ §9（学员端）完成
- ✅ 4 维审查（global / meso / detail / relation）完成
- ✅ 53 任务 PM 决议 + 全量修复完成
- ⏳ §10（管理端）待写

## 与 D-4.0 的关系

- **继承**：D-4.0 中"未被推翻"的设计直接保留
- **推翻**：D-5.0 推翻 D-4.0 的部分（如 4 大情绪 → 10 状态、AI 老师 → 老师/Neo、§7 拆 §7+§8、Leo 完全取消等），见 03-full §11 的"D-4.0 → D-5.0 推翻清单"
- **新增**：6 维感知图谱、Soul 文档、记忆系统底层原则、Neo 第一性原理（7 动作）等

## 审查与修复历史

详见 [../../claude-workspace/review/03-full/](../../claude-workspace/review/03-full/)：
- 00-summary.md — 4 维审查合并总览
- 01-global-review.md / 02-meso-review.md / 03-detail-review.md / 04-relation-review.md — 4 维原始审查输出
- repair-tasks.md — 53 任务 PM 决议结果

## 上一版

- [`../product-V-0.2.0-D-4.0/`](../product-V-0.2.0-D-4.0/) — 已审阅 spec + 原型（冻结快照）

## 重要约定（适用于本目录）

- 本目录文件**仍在编**，可修改
- 新增 / 修改前请同步更新 03-full 对应章节 + 04-backlog 对应任务
- 本目录写完后会成为下一版（D-6.0 或 V-0.2.1-D-1.0）的基线
