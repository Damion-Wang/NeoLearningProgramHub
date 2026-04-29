---
version: V-0.2.0-D-4.0
product-version: V-0.2.0
doc-version: D-4.0
status: reviewed
last-updated: 2026-04-29
---

# product-V-0.2.0-D-4.0/ — 睿学产品 V-0.2.0 / 第 4 版文档

> **版本**：V-0.2.0-D-4.0 · **状态**：已审阅 · **更新**：2026-04-29
> 本目录是产品 V-0.2.0 时期的第 4 版文档（已审阅 spec + feature-tree + 原型），属冻结快照。

详细版本元数据见 [VERSION.md](VERSION.md)。

## 目录结构

| 目录 | 内容 | 视角 | 读者 |
|------|------|------|------|
| [spec/](spec/) | 已审阅 spec v0.4.0（17 文件含 README）| 用户体验 | PM / 设计 / 用户研究 |
| [feature-tree/](feature-tree/) | 功能拆解（13 文件含 manifest）| 功能拆解 | PM / SA / Owner / Dev Lead |
| [prototype/](prototype/) | 原型 v1.1（11 个 HTML + assets）| 实现参考 | Dev / Designer |

**spec/ vs feature-tree/**（两者不互相取代，研发对接两份都要看）：

| 维度 | spec/ | feature-tree/ |
|------|------|------|
| 视角 | 用户体验（学员的一天 / 各场域怎么用）| 功能拆解（L1+L2 模块功能点）|
| 粒度 | 交互 + 文案 + 边界 | 功能点级 + Owner + 优先级 + 待确认 |
| 包含 | 流程文案 / 场景剧本 / 数据展示 | 跨模块依赖矩阵 / ★变更清单 / 待确认 / ADR 映射 |

## 研发新人阅读路径

第一次接手项目，按这个顺序读：

1. **建立全局**：[../product-V-0.2.0-D-5.0/plan/02-v0.5.0-outline.md](../product-V-0.2.0-D-5.0/plan/02-v0.5.0-outline.md)（1000 字大纲，10 节）
2. **总纲细节**：[spec/requirements-v0.4.0.md](spec/requirements-v0.4.0.md) §1-§3（愿景 / 原则 / AOM 数据模型）
3. **按角色分流**：
   - 学员端 → [spec/learner/](spec/learner/) 8 文件（大厅 → 授课 → 对练 → 调研 → 报告 → 笔记 → 发现库）
   - 管理端 → [spec/management/](spec/management/) 5 文件（Operation → 报告生成 → 配置 → 消息）
   - 通用 → [spec/common/](spec/common/) 3 文件
4. **跨模块依赖 / 待确认**：[feature-tree/manifest.md](feature-tree/manifest.md)（开发对接必读）
5. **决策追溯**：[../4-decisions/底层建设期-2026-04-26/](../4-decisions/底层建设期-2026-04-26/)（50 题决策 / Neo Soul / 三大原则）

## 当前 D-5.0 进展

- 当前在写 v0.5.0 全文，详见 [../product-V-0.2.0-D-5.0/plan/03-v0.5.0-full.md](../product-V-0.2.0-D-5.0/plan/03-v0.5.0-full.md)（§1-§9 完成）
- D-5.0 完成后 D-4.0 中"未被推翻"的内容继承，"被推翻"部分以 D-5.0 为准
- D-5.0 推翻 D-4.0 的清单见 03-full §11

## 历史归档

以下早期文件已归档（不要直接参考）：
- [`../4-decisions/历史/spec-archive/`](../4-decisions/历史/spec-archive/) — feature-prioritization、mvp-definition、rawIdea、requirements-v0.3.3
- [`../2-business/intake/user-journeys-2026-04-09.md`](../2-business/intake/user-journeys-2026-04-09.md) — 用户旅程
- [`../2-business/validation/success-metrics.md`](../2-business/validation/success-metrics.md) — KPI

## 重要约定（适用于本目录）

- 本目录文件**已冻结**，不再修改；新设计走 D-5.0
- 文件名已去 `[已审阅]` 前缀（路径 `product-V-0.2.0-D-4.0/` 即表达已审阅状态）
- 7 项核心约束（品牌名、AI 角色、Neo 第一性原理等）见根 [CLAUDE.md](../../CLAUDE.md)
