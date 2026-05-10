---
version: V-0.2.0-D-5.0-supplements
last-updated: 2026-05-09
---

# 补充文档命名规则

本目录（`product-V-0.2.0-D-5.0-supplements/`）下所有补充文档遵循统一命名模式，便于管理和扩展。

## 通用模式

```
[scope]-[type]-[YYYY-MM-DD].md
```

## 字段定义

| 字段 | 含义 | 备注 |
|------|------|------|
| **scope** | 补充对象 / 主题 | kebab-case / 见下方常用 scope |
| **type** | 文档类型 | 见下方常用 type |
| **YYYY-MM-DD** | 创建或锁定日期 | 用于版本追溯 / 同主题多版本时区分 |

## 常用 scope（补充对象）

| scope | 含义 |
|---|---|
| `demo-vs-spec` | demo 与 spec 的对照 |
| `cross-spec` | 跨多个 spec 文件的内容（不属于任何单一文件） |
| `recap` / `lecture` / `practice` / `hub` 等 | 单个学员端场域相关 |
| `home` / `report-center` / `program-config` / `message` 等 | 单个管理端模块相关 |
| `aom` / `glossary` / `kgp` 等 | 跨模块底层概念相关 |

## 常用 type（文档类型）

| type | 含义 | 典型用途 |
|---|---|---|
| `diff` | 对照分析 / 差异识别 | 比较 demo vs spec / spec 新旧版差异 / 等 |
| `decisions` | 设计决策汇总 | 跨 spec 文件的 PM 决策 / 一组关联议题的拍板记录 |
| `mock` | 实例 / 样例 | 报告样例 / 对话样例 / UI mock 等 |
| `review` | 审查 / 审计输出 | 单文件 / 多文件的 review 报告 |
| `debate-log` | 多角色辩论记录 | 用于 review / 决策的 debate 过程文档（**通常放 02-temp 不放本目录**）|
| `plan` | 规划文档 | 阶段性规划 / 行动清单 |

## 当前文件清单

| 文件 | scope | type | date |
|------|-------|------|------|
| `demo-vs-spec-diff-2026-05-09.md` | demo-vs-spec | diff | 2026-05-09 |
| `cross-spec-decisions-2026-05-08.md` | cross-spec | decisions | 2026-05-08 |
| `naming-convention.md` | — | — | 本文件 / 元规则 / 不带日期 |

## 何时放本目录 vs 02-temp

| 内容性质 | 位置 |=-09876
|---------|------|
| **持久补充设计** / 支持 D-5.0 spec 的正式增量 | 本目录（`product-V-0.2.0-D-5.0-supplements/`） |
| **过程文档** / 辩论记录 / 审查 log / Claude 行动产出 | `02-temp/` |
| **mock 样例** —— 长期保留作为 spec 配图 | 本目录 |
| **mock 样例** —— 一次性讨论用 | `02-temp/` |

## 整合路径

本目录的补充文档可按需以两种方式整合到 D-5.0 spec：

1. **替换式整合**（直接覆盖 D-5.0 同名文件 / 本目录副本删除 / 如 recap 2026-05-09 已用此方式）
2. **保留为补充文档**（本目录长期保留 / 与 D-5.0 spec 互为引用 / 不强行回写）
