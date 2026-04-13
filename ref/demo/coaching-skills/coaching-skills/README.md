# Leo Coaching Skills — AI 教练能力层

## 这是什么

Leo 是一个 AI 私教系统的统一前台形象。用户只看到"Leo"，但后台由两个 Persona 自动切换：

- **CoachPersona**（教练态）— 一对一教练对话、情绪感知、模式切换
- **LecturerPersona**（教学态）— 知识讲解、概念教学、费曼教学法

## 目录结构

```
coaching-skills/
│
├── docs/                          # 设计文档（技术团队必读）
│   ├── ref-Leo全景.md             # Leo 完整 System Prompt + 行为规则 + 工作原理
│   ├── spec-私教系统.md           # 私教系统完整设计规格（1100+ 行）
│   └── spec-Agent系统.md          # Agent 架构总体设计（Persona/Skill/Orchestrator）
│
├── personas/                      # Persona 层 — Leo 的"人格"
│   ├── PersonaBase.js             # 基类：定义 Persona 统一契约
│   ├── CoachPersona.js            # 教练态：组合 6 个 Skill，情绪感知 + 模式切换
│   ├── LecturerPersona.js         # 教学态：知识讲解 + 概念脚手架
│   └── __tests__/
│
├── engines/                       # 认知引擎 — Leo 的"大脑"
│   ├── coachPersonaEngine.js      # 人格引擎（4 模式：MENTOR/STRATEGIST/CHALLENGER/OBSERVER）
│   ├── coachQuestioningSkill.js   # 提问约束（认知负荷控制 + Bloom 层级匹配）
│   ├── beiInterviewEngine.js      # BEI 行为事件访谈引擎
│   ├── beiCompetencyFramework.js  # 胜任力框架定义
│   ├── competencyDynamicsEngine.js # 贝叶斯 Beta 分布能力追踪
│   ├── assessmentEngine.js        # 评估引擎
│   ├── enablementSignalEngine.js  # 赋能信号检测
│   └── __tests__/
│
├── skills/                        # Skill 层 — Leo 的"技能包"
│   ├── SkillBase.js               # 基类：统一 execute(input) → output 契约
│   ├── CoachingSkill.js           # 核心教练对话技能
│   ├── SimulationSkill.js         # 场景模拟/角色扮演
│   ├── EvaluationSkill.js         # 回合评估 + 证据采集
│   ├── DiagnosticSkill.js         # 诊断技能
│   ├── InsightCaptureSkill.js     # 洞察捕捉（异步扫描对话中的成长信号）
│   ├── PlanningSkill.js           # 行动计划生成
│   ├── ProfilingSkill.js          # 用户画像构建
│   ├── RetrospectiveSkill.js      # 复盘引导
│   ├── ContentSkill.js            # 知识内容注入
│   ├── signalDetection.js         # 信号分类（路由决策依据）
│   ├── errorClassification.js     # 错误分类
│   ├── scenarioContextSkill.js    # 场景上下文管理
│   └── __tests__/
│
├── quality-inspection/            # 教学质量检验 — Leo 的"自省"
│   ├── qualityInspectionEngine.js # 检验主引擎
│   ├── layer1RuleScanner.js       # 第 1 层：规则扫描（硬性约束检查）
│   ├── layer2PedagogicalValidator.js # 第 2 层：教学法验证（Bloom/Vygotsky/认知负荷）
│   ├── signalMiningEngine.js      # 信号挖掘（从对话中提取成长证据）
│   ├── recommendationEngine.js    # 推荐引擎（下一步建议生成）
│   └── __tests__/
│
└── data/                          # 教练知识数据
    ├── coachExemplars.js          # 教练行为范例库
    ├── teachingStrategies.js      # 教学策略库
    ├── courseTemplates.js         # 课程模板
    ├── interactionTypes.js        # 交互类型定义
    ├── learnerRoles.js            # 学员角色定义
    └── __tests__/
```

## 阅读顺序建议

技术团队建议按以下顺序阅读：

### 第一步：理解全貌（30 分钟）

1. **`docs/spec-Agent系统.md`** — 先理解整体架构：Persona → Skill → Orchestrator 的分层模型
2. **`docs/ref-Leo全景.md`** — Leo 的完整 System Prompt 和行为规则，最直观感受 AI 教练"说什么、怎么说"

### 第二步：深入设计（1-2 小时）

3. **`docs/spec-私教系统.md`** — 私教系统完整设计规格，覆盖所有设计决策和场景推演

### 第三步：阅读代码（按兴趣选读）

4. **Persona 层**（`personas/`）— 从 `PersonaBase.js` 开始，再看 `CoachPersona.js` 如何组合 Skill
5. **认知引擎**（`engines/`）— 重点看 `coachPersonaEngine.js`（人格模式切换的核心逻辑）
6. **Skill 层**（`skills/`）— 从 `SkillBase.js` 的契约定义开始，`CoachingSkill.js` 是最核心的教练技能
7. **质量检验**（`quality-inspection/`）— 两层质量检验机制，确保 AI 输出符合教学法原则

## 核心设计理念

### 人格模式（4 种）

| 模式 | 定位 | 适用场景 |
|------|------|---------|
| **MENTOR** | 导师 — 温暖支持，引导成长 | 新手探索、情绪低落 |
| **STRATEGIST** | 战略家 — 理性分析，框架思维 | 复杂问题拆解、目标规划 |
| **CHALLENGER** | 挑战者 — 辩证质疑，突破舒适区 | 安全区停滞、认知固化 |
| **OBSERVER** | 观察者 — 中立反射，促进觉察 | 自我认知盲区、行为模式复盘 |

引擎根据对话上下文（情绪、阶段、话题）自动切换模式，像真人教练一样自然调整。

### Skill 契约

所有 Skill 遵循统一接口：

```javascript
class SomeSkill extends SkillBase {
  get name() { return 'some-skill'; }
  async execute(input) {
    // input: { context, userMessage, conversationHistory, userProfile, tenantConfig, metadata }
    // return: { content, richContent, sideEffects, metadata }
  }
}
```

Skill 是无状态的。Persona 负责编排，Skill 不知道谁在调用它。

### 质量检验（两层）

- **Layer 1**（规则扫描）：硬性约束检查 — 有没有违反安全规则、有没有超出职责边界
- **Layer 2**（教学法验证）：基于 Bloom 认知层级、Vygotsky ZPD、Sweller 认知负荷理论验证教学质量

### 能力追踪

`competencyDynamicsEngine.js` 使用贝叶斯 Beta 分布追踪学员能力变化，不是简单的分数累加，而是概率分布更新——新证据会更新先验，同时保留不确定性。


## 快照时间

2026-04-13，基于 manager-training-app master 分支。
