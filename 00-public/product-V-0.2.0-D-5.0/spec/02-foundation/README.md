---
version: V-0.2.0-D-5.0
product-version: V-0.2.0
doc-version: D-5.0
status: delivered
last-updated: 2026-05-06
---

# 02-foundation/ — 基础

> **板块定位**：D-5.0 spec 的"基础设计原则"层 / 4 文件 / 描述 Agent Persona / 教学方法论 / 角色端口 / 数据模型 4 大底层支柱。学员端（05-learner/）+ 管理端（06-management/）+ 生命周期（03-lifecycle/）+ 全局（04-global/）的设计都建立在本板块之上。

## 文件清单

| # | 文件 | 核心内容 |
|---|---|---|
| 1 | [`01-personas【已审阅】.md`](01-personas【已审阅】.md) | **Agent Persona 设计**——Neo / Ora 双 Agent 总览 + 各自完整画像（身份/voice/立场/行为约束）+ 共享原则 + 数据空间 3 层架构 |
| 2 | [`02-methodology【已审阅】.md`](02-methodology【已审阅】.md) | **Neo 教学方法论**——5 大理论底座（CLT/ZPD/Bloom/Dreyfus/苏格拉底+费曼）+ 4 维感知 + 8 学习信号 + 6 维 × 5 等级画像 + 7 教学动作 + 5 场域 × 7 动作矩阵 + 4 层行为约束 + 教学边界 |
| 3 | [`03-roles-and-ports【已审阅】.md`](03-roles-and-ports【已审阅】.md) | **角色与端口**——3 端架构（学员端/管理端/产品运营端）+ 4 类角色（学员/HR/项目运营/产品运营）+ 管理员 vs admin 维度严格区分 + 角色↔端口映射 |
| 4 | [`04-data-model【已审阅】.md`](04-data-model【已审阅】.md) | **数据模型 AOM**——5 层结构（Project/Module/Activity/SCO/asset）+ 9 类 SCO 完整清单 + AOM 双层文件（模板+学习实例）+ AOM 双重身份（数据+提示词）+ 自适应 L1-L4 |

## 推荐阅读顺序

### 完整顺序（建议研发首次阅读）

1. **02-methodology** —— 教学方法论（D-5 全新立柱 / 不读它后续文件无从理解 Neo 行为逻辑）
2. **01-personas** —— Agent Persona（Neo / Ora 怎么"做人" / Soul + voice + 立场体系）
3. **04-data-model** —— 数据模型（AOM 双层 / 9 类 SCO / 是 Neo 演绎的"乐谱"）
4. **03-roles-and-ports** —— 角色端口（理解谁用什么端口）

### 快速路径（仅看核心定义）

- 看 Neo 是什么 → `01-personas` § 1.2
- 看 Neo 怎么教学 → `02-methodology` § 1.1（5 大理论）+ § 1.5（7 动作矩阵）
- 看 4 维感知 / 6 维画像 → `02-methodology` § 1.3
- 看 9 类 SCO → `04-data-model` § 1.2.4
- 看管理员 vs admin → `03-roles-and-ports` § 1.3 / § 1.4

## 关联板块

- **05-learner/**：学员端各场域基于本板块的 Neo Persona + 教学方法论
- **06-management/**：管理端基于 Ora Persona + 6 维画像 + Activity 完成事件等
- **03-lifecycle/**：项目生命周期消费本板块的角色端口约束
- **00-glossary.md**：术语决议表 / 本板块内的术语都在 glossary 有索引

## 文件大小（参考）

| 文件 | 章节数 | 备注 |
|---|---|---|
| 01-personas | 24 | 含数据空间 3 层架构图 |
| 02-methodology | 28 | 最复杂 / 含 5 大底座 + 4 维 + 8 信号 + 6 维 + 7 动作 |
| 03-roles-and-ports | 13 | 较短 / 角色映射表为主 |
| 04-data-model | 22 | 含 AOM 双层 + 9 类 SCO 详表 |
