---
version: V-0.2.0-D-4.0
product-version: V-0.2.0
doc-version: D-4.0
status: reviewed
last-updated: 2026-04-29
---

# spec — V-0.2.0-D-4.0 产品规格说明书

> 睿学（NeoLearning）产品的完整设计文档。spec v0.4.0 全部模块已审阅完成（2026-04-26）。
> 2026-04-26 起 Leo 完全取消，学员端只有 Neo。
> 2026-04-29 归集到 product-V-0.2.0-D-4.0/spec/，去 [已审阅] 前缀。

## 快速导航

| 文件 | 说明 |
|------|------|
| [requirements-v0.4.0.md](requirements-v0.4.0.md) | **总纲**——产品定义、生命周期、AI 角色架构（Neo/Actor/导演/Ora）、模块总览、Scope |
| [00-future-iterations.md](00-future-iterations.md) | 迭代计划——P3 争取项 + 待讨论 + V2/中远期方向 |

## 学员端 [learner/](learner/)

| 文件 | 说明 |
|------|------|
| 00-overview | 学员端总览——空间模型、用户故事、跨模块能力 |
| 01-hall | 大厅——Neo（大厅 Coach 能力）、看板三维度、工具库 + 笔记库 + 发现库 + 报告库（4 库 2x2）+ 社区占位 |
| 02-lecture-zone | 授课场域 Lecture——Neo 结构化教学 |
| 03-practice-zone | 对练场域 Practice——Actor + Neo 双栏 + 答疑与辅导 |
| 04-inquiry-zone | 调研场域 Inquiry (P3)——访谈 + 量表 + 成果澄清 |
| 05-report-zone | 报告场域 Report——个人报告 + Neo 解读 |
| 06-notes | 笔记——悬浮球 + P3 推荐卡片 |
| 07-discovery-library | 发现库（新增，未审阅）——AI 推送的高光亮点 + 学员收藏 |

## 管理端 [management/](management/)

| 文件 | 说明 |
|------|------|
| 00-overview | 管理端总览——单端口、Ora、四模块定位 |
| 01-operation | 首页 Operation——三维度（项目/人员/内容）+ 热力图 + Ora |
| 02-report-gen | 报告生成 Report-Gen——团队报告 HITL 撰写 + Ora |
| 03-project-config | 配置 Config——开营流程 + 催学规则 + 个性化 |
| 04-message | 消息 Message——手动督学 + 发送记录 |

## 通用 [common/](common/)

| 文件 | 说明 |
|------|------|
| 00-overview | 通用模块总览——Topbar、端口切换 |
| 01-general | 通用功能——账号管理、AI 语速、帮助 |
| 02-notification | 消息提醒——站内消息、催学原则 |

> 注：原 03-ai-brand.md（AI 品牌形象）已迁移到 [../../2-business/brand/ai-brand.md](../../../2-business/brand/ai-brand.md)（属业务/品牌资产，非产品规格）。

## 重要约定

- 本目录 D-4.0 文件**已冻结**，不再修改；新设计走 D-5.0（[../../product-V-0.2.0-D-5.0/spec/](../../product-V-0.2.0-D-5.0/spec/)）
- **Leo 完全取消（2026-04-26）**：学员端只有 Neo，按场域差异化展现能力
- **0424 决策不重新评估**：31 条决策保持原拍板（含 C-06 红线）

## 关联

- 设计决策：[../../4-decisions/](../../4-decisions/)
- 底层建设 know-how：[../../4-decisions/底层建设期-2026-04-26/](../../4-decisions/底层建设期-2026-04-26/)
- feature-tree：[../feature-tree/](../feature-tree/)
- v0.5.0 plan（在写）：[../../product-V-0.2.0-D-5.0/plan/](../../product-V-0.2.0-D-5.0/plan/)
