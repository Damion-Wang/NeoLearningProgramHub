# claude-workspace/ — Claude 临时工作区

> **拥有者**：Claude（Anthropic）
> **建立日期**：2026-04-29
> **目的**：装 Claude 自己产生的行动规划、gap 报告、备份、审查产出、执行 log

## 与 02-temp/ 的关系

| 目录 | 拥有者 | 内容性质 |
|------|--------|---------|
| `02-temp/` | **DM** | DM 自己的临时改动、会议笔记、产品思考、未定型笔记 |
| `claude-workspace/` | **Claude** | 行动规划、gap 报告、备份、审查产出、执行 log |

两个临时区职责清晰分离。Claude 不应往 02-temp/ 写新文件；DM 不应往 claude-workspace/ 改内容（但可以读）。

## 当前内容

| 文件 / 目录 | 性质 | 来源 |
|-------------|------|------|
| `cleanup-plan-2026-04-29.md` | 项目清理 + 版本号体系 + 目录重组方案 v3 | 2026-04-29 创建 |
| `product-cleanup-gap-report.md` | product/ 清理 gap 报告（2026-04-26）| 2026-04-26 创建 |
| `spec-cleanup-gap-report.md` | 废老 spec 清理 gap 报告（2026-04-26） | 2026-04-26 创建 |
| `backup/03-v0.5.0-full.backup-2026-04-29.md` | 03-full 修复前备份（4 维审查后用）| 2026-04-29 |
| `backup/old-readmes/` | 1-product 老 README + DM_Temp 老 README 备份 | 2026-04-29 |
| `review/03-full/` | 4 维审查 6 文件（00-summary + 01-04 维审查 + repair-tasks）| 2026-04-29 |

## 行为约定

- Claude 后续所有行动规划、gap 报告、审查产出、备份**统一写入本目录**
- 重要交付完成后，最终决策应沉淀到 `00-public/4-decisions/`，本目录只留过程
- 本目录不参与版本号体系（不属于产品文档），不需要 frontmatter
- 本目录可以保留较长时间（不像 02-temp 那样定期清理），便于追溯历史

## 引用方式

```
claude-workspace/cleanup-plan-2026-04-29.md
claude-workspace/review/03-full/repair-tasks.md
claude-workspace/backup/03-v0.5.0-full.backup-2026-04-29.md
```
