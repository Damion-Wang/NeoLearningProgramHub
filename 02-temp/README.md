# 02-temp/ — DM 临时工作区

> **拥有者**：DM（王鼎明）
> **最近一次重整**：2026-04-29（拆分出 Claude 临时区）
> **目的**：DM 自己的临时改动、会议笔记、产品思考、未定型笔记

## 与 claude-workspace/ 的关系

| 目录 | 拥有者 | 内容性质 |
|------|--------|---------|
| `02-temp/` | **DM** | DM 自己的临时改动、会议笔记、产品思考、未定型笔记 |
| `claude-workspace/` | **Claude** | 行动规划、gap 报告、备份、审查产出、执行 log |

两个临时区职责清晰分离。Claude 不应往本目录写新文件；DM 不需要往 claude-workspace/ 改内容（但可以读）。

## 当前内容（2026-04-29 分流后）

| 文件 | 说明 | 来源日期 |
|------|------|---------|
| [0424-meeting-analysis.md](0424-meeting-analysis.md) | 0424 会议初步分析 | 2026-04-24 |
| [0424-spec-diff.md](0424-spec-diff.md) | 0424 会议 spec 差异 31 条 | 2026-04-24 |
| [0424-spec-diff-decisions.md](0424-spec-diff-decisions.md) | 0424 决策 31 条最终结果 | 2026-04-24 |
| [2026-04-20-meeting-notes.md](2026-04-20-meeting-notes.md) | 0420 会议记录 | 2026-04-20 |
| [2026-04-20-leo-neo-design.md](2026-04-20-leo-neo-design.md) | 0420 Leo/Neo 设计草案（Leo 已取消）| 2026-04-20 |
| [2026-04-20-v31-analysis.md](2026-04-20-v31-analysis.md) | 0420 v3.1 分析 | 2026-04-20 |
| [v3-founder-feedback.md](v3-founder-feedback.md) | 创始人反馈记录 | 2026-04 |
| [pending-updates.md](pending-updates.md) | DM 早期产品笔记（豆包对话内化）| 2026-04-13 |
| [requirements-restructure-plan.md](requirements-restructure-plan.md) | DM 早期产品思考（v2 → v3 重构）| 2026-04-13 |
| [project-cleanup-plan.md](project-cleanup-plan.md) | 项目清理计划（DM + Claude 共创）| 2026-04-23 |
| record/ | 记录草稿目录（空） | — |

## 2026-04-29 分流移出去的内容（迁到 claude-workspace/）

| 原 02-temp 路径 | 新位置 |
|----------------|--------|
| `cleanup-plan-2026-04-29.md` | `claude-workspace/cleanup-plan-2026-04-29.md` |
| `product-cleanup-gap-report.md` | `claude-workspace/product-cleanup-gap-report.md` |
| `spec-cleanup-gap-report.md` | `claude-workspace/spec-cleanup-gap-report.md` |
| `backup/03-v0.5.0-full.backup-2026-04-29.md` | `claude-workspace/backup/` |
| `review/03-full/` (6 文件) | `claude-workspace/review/03-full/` |

## 历史归档（2026-04-26）

20 份 0426-* 调研产出已归档到 `00-public/4-decisions/底层建设期-2026-04-26/`：
- 5 份 r1-r5 外部调研 + 4 份 gap 内化扫描 + 1 份综合 gap → `6-原始调研/`
- 3 份 a2-a5 早期规划 + 4 份 v0.1 早期文档 + 2 份 brief → `7-早期文档/`（已被 50 题决策替代）

## 清理原则

- 本目录文件经确认后应归档到 `00-public/` 对应目录
- 早期版本文件归档时必须标注「已被替代 → 新位置」
- 季度末整体归档为 `02-temp/archived-YYYY-Q*/`
- 本目录**不参与版本号体系**（不属于产品文档），不需要 frontmatter
