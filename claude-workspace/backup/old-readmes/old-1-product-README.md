# 1-product/ -- 产品设计

睿学（NeoLearning）产品设计目录。本期交付**睿学培训项目（NeoLearningProgram）**。当前 spec 状态 v0.4.0（已审阅）+ v0.5.0 重写计划进行中。

## 目录结构

| 目录 | 内容 | 状态 |
|------|------|------|
| [spec/](spec/) | **当前 spec v0.4.0**（design/）+ **更新计划**（plan/）| 当前 |
| [feature-tree/](feature-tree/) | 功能拆解视角（与 spec/design 正交，开发对接必读）| v0.4.0 对齐 |

## 两个目录的差异（重要）

| 维度 | spec/design/ | feature-tree/ |
|------|------|------|
| **视角** | 用户体验（学员的一天 / 各场域怎么用）| 功能拆解（L1+L2 模块功能点）|
| **粒度** | 交互 + 文案 + 边界 | 功能点级 + Owner + 优先级 + 待确认 |
| **读者** | PM / 设计 / 用户研究 | PM / SA / Owner / Dev Lead |
| **包含** | 流程文案 / 场景剧本 / 数据展示 | 跨模块依赖矩阵 / ★变更清单 / 待确认 / ADR 映射 / 横切定义权威归属 |

**两者不互相取代**——共同构成完整产品规格。研发对接时**两份都要看**。

## 从这里开始

### 用户体验视角
进入 [spec/design/](spec/design/) 看 19 文件 spec：
- 总纲：[spec/design/requirements-v0.4.0.md](spec/design/requirements-v0.4.0.md)
- 学员端 7 文件 / 管理端 5 文件 / 通用 4 文件 / future-iterations

### 功能拆解视角
进入 [feature-tree/](feature-tree/) 看 12 文件：
- 总览：[feature-tree/manifest.md](feature-tree/manifest.md)（跨模块依赖矩阵 + 横切定义映射 + 待确认清单 + ADR 映射）
- 10 个 L1+L2 功能模块（学员 5 + 管理 1 + Infra/ContentMgt/Testing/KGP 4）

### v0.5.0 更新计划
进入 [spec/plan/01-spec-update-plan-2026-04-27.md](spec/plan/01-spec-update-plan-2026-04-27.md)。

## 研发新人阅读路径

第一次接手项目，按这个顺序读：

1. **建立全局**：[spec/plan/02-v0.5.0-outline.md](spec/plan/02-v0.5.0-outline.md)（1000 字大纲，10 节）
2. **总纲细节**：[spec/design/requirements-v0.4.0.md](spec/design/requirements-v0.4.0.md) §1-§3（愿景 / 原则 / AOM 数据模型）
3. **按角色分流**：
   - 学员端 → [spec/design/learner/](spec/design/learner/) 7 文件（大厅 → 授课 → 对练 → 调研 → 报告）
   - 管理端 → [spec/design/management/](spec/design/management/) 5 文件（Operation → 报告生成 → 配置 → 消息）
   - Infra → [feature-tree/07-infra.md](feature-tree/07-infra.md) + [spec/design/common/](spec/design/common/)
   - 内容侧 → [feature-tree/08-content-mgt.md](feature-tree/08-content-mgt.md) + [10-kgp.md](feature-tree/10-kgp.md)
4. **跨模块依赖 / 待确认**：[feature-tree/manifest.md](feature-tree/manifest.md)（开发对接必读）
5. **决策追溯**：[../4-decisions/底层建设期-2026-04-26/](../4-decisions/底层建设期-2026-04-26/)（50 题决策 / Neo Soul / 三大原则）

## 历史归档（不要直接参考）

以下早期文件已归档：
- [`4-decisions/历史/spec-archive/`](../4-decisions/历史/spec-archive/)
  - feature-prioritization-2026-04-09.md（v0.3.3 前 MoSCoW + Sprint）
  - mvp-definition-2026-04-09.md（v0.3.3 前 MVP 定义）
  - rawIdea.md（早期白板图）
  - requirements-v0.3.3.md（v0.3.3 旧版总纲）
- [`2-business/intake/user-journeys-2026-04-09.md`](../2-business/intake/user-journeys-2026-04-09.md)（用户旅程已移到商业分析）
- [`2-business/validation/success-metrics.md`](../2-business/validation/success-metrics.md)（KPI 抽取自 mvp-definition §6）

## 当前阶段

```
spec v0.4.0（已审阅 2026-04-22）→ 原型 v1.1（2026-04-23）→
底层建设期 know-how 库（2026-04-26）→ 三轮 spec 深化 debate（2026-04-26）→
spec 清理 + plan/01（2026-04-27）→ v0.5.0 一次大版本重写（本周）→
研发对接（待启动）
```

## 重要约定

- spec 改动方式：直接编辑 [已审阅] 文件；新设计追加"反向补充：XXX"章节，不删原文
- 推翻早期决策：原决议加注"已被 X 推翻 → 见新章节"
- AI 角色：学员端只有 Neo（2026-04-26 起 Leo 完全取消）
- 品牌名：睿学（中文）/ AI TUTOR（英文），禁用"AI 老师"
