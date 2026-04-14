# Coaching Skills Demo 代码分析报告

> 分析日期：2026-04-13
> 项目路径：`ref/demo/coaching-skills/coaching-skills/`
> 快照来源：manager-training-app master 分支

---

## 一、整体架构

### 1.1 核心定位

这是一个**AI 私教系统**的辅导模块（Coaching Module）原型实现。用户前台只看到一个统一形象「Leo」，后台由两个 Persona 自动切换协作：

- **CoachPersona（教练态）** — 苏格拉底式提问、引导反思、实践辅导
- **LecturerPersona（教学态）** — 结构化教学、知识讲解、验证学习

### 1.2 分层架构

```
┌─────────────────────────────────────────────────────┐
│  Persona 层（用户前台形象）                            │
│  ├── CoachPersona（Leo 教练态，组合 6 个 Skill）       │
│  └── LecturerPersona（老徐 教学态，组合 2 个 Skill）    │
├─────────────────────────────────────────────────────┤
│  Skill 层（无状态技能模块，统一 execute(input)→output） │
│  ├── CoachingSkill        核心教练对话                 │
│  ├── SimulationSkill      场景角色扮演                 │
│  ├── EvaluationSkill      评估+证据+反馈               │
│  ├── DiagnosticSkill      BEI 诊断                    │
│  ├── InsightCaptureSkill  洞察捕捉                    │
│  ├── PlanningSkill        行动计划/待办检测             │
│  ├── ProfilingSkill       用户画像构建                 │
│  ├── RetrospectiveSkill   复盘引导                    │
│  ├── ContentSkill         知识内容注入                 │
│  ├── signalDetection      信号分类（路由依据）          │
│  ├── errorClassification  错误分类（6 子类型）          │
│  └── scenarioContextSkill 场景上下文组装               │
├─────────────────────────────────────────────────────┤
│  Engine 层（认知引擎，Leo 的"大脑"）                    │
│  ├── coachPersonaEngine      人格引擎（4 模式切换）     │
│  ├── coachQuestioningSkill   提问约束（认知负荷控制）    │
│  ├── assessmentEngine        BEI 信号与能力优先级       │
│  ├── beiInterviewEngine      BEI 访谈引擎              │
│  ├── beiCompetencyFramework  10 项胜任力框架            │
│  ├── competencyDynamicsEngine 贝叶斯能力追踪            │
│  └── enablementSignalEngine  赋能信号（7 种信号源）     │
├─────────────────────────────────────────────────────┤
│  Quality Inspection 层（教学质量自省）                  │
│  ├── qualityInspectionEngine  三层质检协调器            │
│  ├── layer1RuleScanner        规则扫描（5 维度）        │
│  ├── layer2PedagogicalValidator 教学法合规检测          │
│  ├── signalMiningEngine       信号挖掘（4 类信号）      │
│  └── recommendationEngine     教研建议生成              │
├─────────────────────────────────────────────────────┤
│  Data 层（教练知识数据）                               │
│  ├── coachExemplars       教练行为范例库                │
│  ├── teachingStrategies   42 条循证教学策略             │
│  ├── courseTemplates       8 个新经理关键时刻课程模板   │
│  ├── interactionTypes     12+ 种互动类型               │
│  └── learnerRoles          8 种学员角色模型            │
└─────────────────────────────────────────────────────┘
```

### 1.3 核心设计原则

| 原则 | 说明 |
|------|------|
| **Persona-Skill 分离** | Persona 编排 Skill，Skill 不知道谁调用它。Skill 是无状态的。 |
| **后台分离，前台统一** | CoachPersona 和 LecturerPersona 各自独立优化，用户只看到"Leo" |
| **Blackboard Architecture** | 状态在中间，Agent 来读写，不靠摘要传递 |
| **信号驱动** | 所有主动行为必须有可解释的信号触发 |
| **LLM-first + 规则降级** | 每个 Skill 都有 LLM 可用时优先 LLM、不可用时自动降级到规则的双路径 |

---

## 二、Persona 系统

### 2.1 基类 PersonaBase

定义了所有 Persona 的统一契约：

```javascript
class PersonaBase {
  get displayName()  // UI 显示名
  get personaId()    // 唯一标识
  get contexts()     // 服务的上下文（如 ['learner']）
  async handleMessage({ userMessage, conversationHistory, userProfile, context, metadata })
  async handleSessionEvent(event, params)  // 会话生命周期
  async callLLM(systemPrompt, messages, options)  // LLM 便捷方法
}
```

输出类型 `PersonaOutput`：`{ content, richContent, metadata, sideEffects }`

### 2.2 CoachPersona（教练态）

**显示名称**：Leo
**personaId**：coach
**组合 6 个 Skill**：

| Skill | 调用时机 | 是否异步 |
|-------|---------|---------|
| **CoachingSkill** | 每条消息（主技能） | 同步 |
| **ContentSkill** | 用户消息含知识关键词时 | 同步（前置） |
| **EvaluationSkill** | — | （预留） |
| **PlanningSkill** | 每条消息（detectTodo） | 异步 sideEffect |
| **InsightCaptureSkill** | 每条消息（scanForInsights）+ 会话结束（批量提取） | 异步 sideEffect |
| signalDetection | 每条消息 | 同步（信号分类） |

**核心处理流程**：

1. 构建跨 Agent 上下文（`personaEngine.buildCrossAgentContext`）
2. 知识上下文注入（ContentSkill，关键词触发）
3. 信号检测（`classifySignal`，8 种信号分类）
4. 调用 CoachingSkill.execute()（主对话生成）
5. 构建异步 sideEffects（detectTodo + insightScan）
6. 构建 panelHint（策略类型 → UI 面板提示）
7. 返回 PersonaOutput

**会话结束事件**：触发 `BATCH_INSIGHT_EXTRACTION`，批量提取本次会话的洞察。

### 2.3 LecturerPersona（教学态）

**显示名称**：老徐
**personaId**：lecturer
**组合 2 个 Skill**：ContentSkill + EvaluationSkill

**核心设计**：

- **Dreyfus 自适应**：根据学员 Dreyfus 阶段（novice→expert）自动调整教学模式/深度/脚手架
- **认知负荷估算**：三向量 `{intrinsic, extraneous, germane}` 实时估算
- **理解检查**：每 3 轮或 CGP check 阶段自动插入理解检查
- **错误分类**：检测到学员错误时调用 `classifyError()` 分类（6 种子类型）
- **CGP 集成**：支持从 ContentGenerationPlatform 加载课程配置
- **证据采集**：check/practice 阶段完成后推送 PPP（异步 sideEffect）

**Dreyfus → 教学模式映射**：

| Dreyfus 阶段 | 模式 | 深度 | 脚手架 |
|-------------|------|------|--------|
| novice | structured | basic | full |
| advanced_beginner | guided | moderate | high |
| competent | interactive | moderate | medium |
| proficient | discussion | advanced | low |
| expert | concise | advanced | minimal |

### 2.4 Coach 与 Lecturer 的关键区别

| 维度 | CoachPersona | LecturerPersona |
|------|-------------|----------------|
| **核心方法** | 苏格拉底式提问、引导反思 | 知识讲解、概念建构 |
| **理论底色** | Greif 结果导向教练、Gallwey Inner Game | Sweller CLT、Bloom、Mastery Learning |
| **处理信号** | ⑤知行差距、⑦元认知偏差、⑧语境错配 | ①缺概念、②遗忘、③误用、④选错工具、⑥错误心智模型 |
| **默认场域** | 对话框（聊天） | 课堂页（专门页面） |
| **System Prompt 构建** | 11 个板块动态组装 | 按 Dreyfus 阶段静态模板 |
| **人格模式** | 4 种动态切换（MENTOR/STRATEGIST/CHALLENGER/OBSERVER） | 固定（自适应授课者） |
| **Skill 组合** | 6 个 | 2 个 |

---

## 三、Skills 体系

### 3.1 基类 SkillBase

统一契约：

```javascript
class SkillBase {
  get name()              // 唯一标识
  async execute(input)    // SkillInput → SkillOutput
  buildInput(params)      // 构建标准化输入
  async callLLM(systemPrompt, messages, options)
  async callLLMForJSON(systemPrompt, messages, options)
}
```

**SkillInput**：`{ context, userMessage, conversationHistory, userProfile, tenantConfig, metadata }`
**SkillOutput**：`{ content, richContent, sideEffects, metadata }`

### 3.2 各 Skill 详解

#### (1) CoachingSkill — 核心教练对话

**文件**：`skills/CoachingSkill.js`（734 行，最大的 Skill）
**职责**：教练对话的完整流程编排

**执行流水线（13 步）**：

1. 情绪检测 → `personaEngine.detectEmotion()`
2. 对话阶段检测 → `personaEngine.detectConversationStage()`
3. 意图分析 → LLM-first + 关键词降级（8 种意图类型）
4. 情绪-意图覆盖 → 强负面情绪 → EMOTIONAL_SUPPORT
5. 动态人格模式选择 → `personaEngine.selectPersonaMode()`
6. 策略选择（信号感知）→ 信号⑤⑦⑧覆盖 + 5 种教练策略
7. 提问约束构建 → 认知负荷控制
8. PPP 能力画像注入（证据驱动教练）
9. 学习推荐检测（Fiona 推荐 B-mode）
10. 系统 Prompt 组装 → `personaEngine.buildCoachSystemPrompt()`
11. LLM 调用（Temperature 按模式调整）
12. PPP 观察 sideEffect（fire-and-forget）
13. 返回 SkillOutput

**8 种意图类型**：greeting, clarification, tool_application, case_discussion, situation_analysis, reflection, planning, emotional_support

**5 种教练策略**：TELL（分享知识）, ASK（苏格拉底提问）, REVIEW（回顾串联）, PLAN（结构化规划）, FRAMEWORK_GUIDED（框架引导分析）

**信号感知策略覆盖**：
- ⑤知行差距 → `know_do_gap_exploration`（信念/动机/能力/环境排除法）
- ⑦元认知偏差 → `metacognitive_calibration`（自评 vs 实际对比）
- ⑧语境错配 → `context_adaptation`（旧模式识别+新场景适配）

#### (2) SimulationSkill — 场景角色扮演

**文件**：`skills/SimulationSkill.js`
**职责**：管理场景训练中的角色扮演对话
**特点**：
- AI 完全进入角色，用第一人称说话
- 根据管理者的管理方式动态调整态度（同理心→开放；强硬→防御）
- 回复控制在 50-100 字，模拟真实对话节奏
- 自动关闭条件：assistant 超 6 轮或用户关键词
- LLM 降级：按意图分类给出自助建议

#### (3) EvaluationSkill — 评估+证据+反馈

**文件**：`skills/EvaluationSkill.js`
**4 个子能力**（通过 `metadata.action` 路由）：

| 子能力 | 来源 | 职责 |
|--------|------|------|
| evaluateTurn | EvaluationAgent | 逐轮行为评分（4 维度 1-10 分） |
| generateSessionFeedback | FeedbackAgent | 会话结束综合反馈 |
| updateEvidence | CompetencyEvidenceAgent | 能力证据累积（纯规则） |
| generateReport | CompetencyEvidenceAgent | 能力佐证报告 |

**评估 4 维度**：communication, empathy, problemSolving, leadership

**Readiness 四级**：INSUFFICIENT → DEVELOPING → COMPETENT → PROFICIENT

**Bloom 层级估算**：根据平均分和 good_flags 数量，映射到 Remember(1) → Create(6)

#### (4) DiagnosticSkill — BEI 诊断

**文件**：`skills/DiagnosticSkill.js`
**2 个子能力**：

- `evaluateAnswer`：启发式 BEI 回答评估（规则 + shouldUseLlm 标记）
- `generateProbe`：LLM 增强追问生成（DSTF 四维探针模型）

**DSTF 模型**：Did(行动) / Said(对话原话) / Thought(当时想法) / Felt(感受)
- 检测"我们"代替"我"（BEI 标准要求拒绝 we 代替 I）
- 检测概括性陈述（BEI 标准要求具体事件而非习惯描述）
- 每次只追问 1 个维度，不一次问太多

#### (5) InsightCaptureSkill — 洞察捕捉

**文件**：`skills/InsightCaptureSkill.js`
**2 个子能力**：

- `scanForInsights`：单轮经验碎片检测（每 5 条用户消息扫描一次）
- `extractSessionInsights`：会话结束批量提取（最多 3 条）

**经验信号检测**：9 个正则模式，如"我发现/学到/意识到"、"成功/失败/踩坑"等
**Aha Moment 检测**：8 个正则模式，如"恍然大悟/茅塞顿开"等
**频率控制**：每会话最多 5 个 draft，每 5 条消息扫描一次

#### (6) PlanningSkill — 行动计划

**文件**：`skills/PlanningSkill.js`
**4 个子能力**：

| 子能力 | 职责 |
|--------|------|
| detectTodo（默认） | 从对话中检测行动项（LIVE 特性） |
| generateLearningPath | LLM 生成个性化学习路径 |
| assessComplexity | 规则评估任务复杂度（5 维度打分） |
| getTaskProbability | 计算业务任务完成概率 |

**行动信号检测**：10 个正则模式，如"我打算/准备/计划"、"明天/下周就"等

#### (7) ProfilingSkill — 用户画像构建

**文件**：`skills/ProfilingSkill.js`
**职责**：根据 BEI 回答 + 诊断缺口，生成结构化用户画像
**输出**：role, roleLabel, currentChallenges, desiredOutcomes, focusCapabilities, keyTasks, successFactors, growthFocus, scenarioMaterials

#### (8) RetrospectiveSkill — 复盘引导

**文件**：`skills/RetrospectiveSkill.js`
**2 个子能力**：

- `conductRetrospective`：结构化复盘分析（LLM 或规则）
- `generateFollowUp`：后续行动建议

**复盘深度评估**（5 级，对应 Bloom）：
1. SURFACE — 表面描述（Bloom L1）
2. CAUSAL — 因果分析（Bloom L3）
3. EVALUATIVE — 评价反思（Bloom L4）
4. INTEGRATIVE — 整合迁移（Bloom L5）
5. PARADIGM_SHIFT — 范式转变（Bloom L6）

**认知迁移检测**：6 个正则模式，如"可以用在/应用到"、"举一反三/融会贯通"等

#### (9) ContentSkill — 知识内容注入

**文件**：`skills/ContentSkill.js`
**2 个子能力**：

- `getToolContext`：检索格式化的管理工具上下文（注入 System Prompt）
- `recommendScenarios`：个性化场景排序推荐

**工具关键词映射**：26 个工具 × 多关键词
**能力→工具映射**：17 个能力维度 → 对应工具集
**场景排序因子**：focusMatch×3 + lowScoreMatch×4 + unscoredMatch×4 + conflictMatch×3 + challengeMatch + frequencyScore + completionPenalty

#### (10) signalDetection — 信号分类

**文件**：`skills/signalDetection.js`
**8 种信号类型**：

| 信号 | 名称 | 处理引擎 |
|------|------|---------|
| ① | 缺概念 | teaching |
| ② | 遗忘 | teaching |
| ③ | 误用 | teaching |
| ④ | 选错工具 | teaching |
| ⑤ | 知行差距 | coaching |
| ⑥ | 错误心智模型 | teaching |
| ⑦ | 元认知偏差 | coaching |
| ⑧ | 语境错配 | coaching |

**检测方法**：规则模式匹配 + 上下文推理（masteryScore × responseDepth × behaviorScore 组合推断）

#### (11) errorClassification — 错误分类

**文件**：`skills/errorClassification.js`
**6 种错误子类型**：

| 类型 | 标签 | 类别 | 默认补救 |
|------|------|------|---------|
| ①-a | 知识完全缺失 | knowledge_gap | 从基础概念开始讲解 |
| ①-b | 知识碎片化 | knowledge_gap | 梳理碎片，建立框架 |
| ② | 知识遗忘 | retention | 间隔复习，新场景激活 |
| ③-a | 情境错配 | application | 对比正确/错误场景 |
| ③-b | 工具误选 | application | 展示工具适用边界 |
| ⑥ | 错误心智模型 | misconception | 先暴露错误，再重建 |

**严重度 3 级**：low / medium / high
**严重度矩阵**：isPrerequisite × frequency × type 组合判断

#### (12) scenarioContextSkill — 场景上下文组装

**文件**：`skills/scenarioContextSkill.js`
**职责**：纯函数，为场景训练构建个性化上下文
**输出**：personalizedBackground, personalizedObjectives, matchedTools, rationale

### 3.3 Skill 之间的关系

```
CoachPersona
  ├── CoachingSkill（主） ← signalDetection（分类信号）
  │     ├── coachPersonaEngine（情绪/阶段/模式/Prompt）
  │     └── coachQuestioningSkill（提问约束）
  ├── ContentSkill（前置：知识注入）
  ├── PlanningSkill（异步：detectTodo）
  └── InsightCaptureSkill（异步：scan + 会话结束 batch）

LecturerPersona
  ├── ContentSkill（前置：知识检索）
  ├── EvaluationSkill（理解检查）
  └── errorClassification（错误分类）

DiagnosticSkill ← beiInterviewEngine（BEI 访谈逻辑）
ProfilingSkill（独立：BEI → 画像）
RetrospectiveSkill ← competencyDynamicsEngine（复盘深度评估）
SimulationSkill（独立：角色扮演）
scenarioContextSkill ← assessmentEngine + store（场景组装）
```

---

## 四、引擎层

### 4.1 coachPersonaEngine — 人格引擎（核心）

**文件**：`engines/coachPersonaEngine.js`（900+ 行，系统"灵魂"模块）

**6 大职责**：
1. **4 种人格模式深度定义**（MENTOR/STRATEGIST/CHALLENGER/OBSERVER）
2. **情绪感知**：多信号检测（关键词、消息特征、长度变化趋势、短消息脱离）
3. **动态模式切换**：8 条优先级规则，根据情绪×阶段×意图自动选择
4. **对话阶段感知**：6 阶段自动检测（OPENING→EXPLORING→DEEPENING→INSIGHT→ACTION→CLOSING）
5. **跨 Agent 知识整合**：将评估历史、洞察、能力动态注入教练上下文
6. **系统 Prompt 组装**：11 个板块动态拼接

**4 种人格模式**：

| 模式 | 核心身份 | 教练哲学 | 适用场景 |
|------|---------|---------|---------|
| MENTOR | 结果导向的管理教练 | Greif 结果导向：事实先行、行为>态度、目标着陆 | 默认模式、新手探索、情绪低落 |
| STRATEGIST | 系统思维管理顾问 | 先全局再局部、假设-验证、"做什么"和"不做什么"同等重要 | 复杂问题拆解、行动规划 |
| CHALLENGER | 直言不讳的质疑者 | 没被质疑的想法是脆弱的、尊重人质疑观点 | 安全区停滞、认知固化、高信心状态 |
| OBSERVER | 清晰的镜子 | 觉察=改变的开始、抓措辞做复杂反映 | 深度反思、对话收尾 |

**模式切换决策规则**（按优先级排序）：

| 优先级 | 条件 | 目标模式 |
|--------|------|---------|
| 100 | 负面情绪（frustrated/discouraged/anxious） | MENTOR |
| 80 | 反思 + DEEPENING 阶段 | OBSERVER |
| 70 | planning 意图 + 非焦虑 | STRATEGIST |
| 60 | 高信心/兴奋 + 轮次>2 | CHALLENGER |
| 50 | 好奇 + EXPLORING | MENTOR |
| 50 | ACTION 阶段 | STRATEGIST |
| 40 | CLOSING 阶段 | OBSERVER |

**情绪检测**：10 种情绪状态 × 4 类信号源
- Signal 1：关键词匹配（每种情绪 3-4 个正则模式）
- Signal 2：消息特征（感叹号数、问号数、省略号数、消息长度）
- Signal 3：消息长度变化趋势（突然长→深度参与/倾诉；突然短→可能脱离）
- Signal 4：短消息+无实质内容→可能脱离

**System Prompt 11 个板块**：

| # | 板块 | 来源 |
|---|------|------|
| 1 | 核心身份 | PERSONA_PROFILES[mode].coreIdentity |
| 2 | 教练哲学 | PERSONA_PROFILES[mode].coachingPhilosophy |
| 3 | 沟通风格 | PERSONA_PROFILES[mode].communicationStyle |
| 4 | 用户画像 | userProfile（name, role, challenges, strengths） |
| 5 | 情绪觉察 | emotionResult + emotionalApproach |
| 6 | 对话阶段 | conversationStage + stageGuidance |
| 7 | 提问约束 | coachQuestioningSkill（认知链控制） |
| 8 | 当前分析 | intentResult + strategyResult |
| 8b | PPP 证据摘要 | pppSnapshot（证据驱动教练） |
| 9 | 策略指导 | strategy-specific guidance |
| 10 | 跨 Agent 知识 | crossAgentContext |
| 11 | 回答要求 | responseGuidelines + 4 条铁律 |

**4 条铁律**（所有模式共享）：
1. 你是文字对话不是小说 — 禁止身体/感官描写
2. 事实优先 — 模糊现象只追问，不猜测
3. 不煽情 — 一句接住情绪就够
4. 锁定重框 — 共创了新定义后不退回旧框

### 4.2 coachQuestioningSkill — 提问约束引擎

**文件**：`engines/coachQuestioningSkill.js`

**核心理念**：关键不是"最多几个问题"，而是"问题之间是否构成认知链"。

**理论基础**：
- Sweller 认知负荷理论：同一认知链上的渐进问题不增加额外负荷
- Vygotsky 脚手架理论：提问前先搭建锚点
- Bloom 认知分类：问题类型随对话深度递进
- Dreyfus 五阶段：根据能力阶段调整脚手架深度

**5 种问题类型**（对应 Bloom 层级）：

| 类型 | 对应 Bloom | 示例 |
|------|-----------|------|
| CLARIFICATION | Remember/Understand | "具体发生了什么？" |
| DEEPENING | Analyze | "你觉得背后的原因是什么？" |
| REFLECTIVE | Evaluate | "回头看，你怎么评价自己当时的做法？" |
| HYPOTHETICAL | Apply/Create | "如果重来一次，你会怎么做？" |
| ACTIONABLE | Create | "那你打算先从哪件事开始？" |

**对话阶段 → 认知链模式**：

| 阶段 | 认知链 | 节奏 |
|------|--------|------|
| opening | clarification | 1 个问题 |
| exploring | clarification → deepening | 最多 2 个 |
| deepening | deepening → reflective | 最多 2 个 |
| insight | reflective/hypothetical | 1 个有力问题 |
| action | actionable | 1 个 |
| closing | actionable | 1 个 |

**Dreyfus → 脚手架深度**：
- novice/advanced_beginner → FULL（先观察→概念→提问）
- competent → MODERATE（简要回应→提问）
- proficient/expert → BRIEF（一句过渡→提问）

**负面情绪降级**：frustrated/discouraged/anxious → 节奏降为 1、共情优先

### 4.3 assessmentEngine — BEI 信号与能力优先级

**文件**：`engines/assessmentEngine.js`

**职责**：
- `buildBeiSignals`：从 BEI 回答中构建能力信号（evidence + uncertainty）
- `buildCapabilityPriority`：基于信号计算能力优先级排序
- `buildCrossValidationMeta`：BEI 信号 × 评分交叉验证
- `pickAdaptiveQuestionTemplates`：按能力优先级选择自适应问题模板
- `buildRoleTaskContext`：提取角色任务上下文

**关键词规则**（8 组，关键词→能力 ID 映射）：
- 目标/拆解/里程碑 → performanceManagement, planningExecution
- 辅导/反馈/激励 → coaching, motivation
- 授权/委派/放手 → delegation, roleTransition
- 等

**能力优先级公式**：`score = uncertainty×3 + uncovered×2 + (evidence>0 ? 0 : 1)`

### 4.4 beiInterviewEngine — BEI 访谈引擎

**文件**：`engines/beiInterviewEngine.js`

**6 个访谈问题**（BEI 标准序列）：

| ID | 类别 | 目的 | 最大追问轮数 |
|----|------|------|------------|
| position | basic-info | 确认岗位边界 | 1 |
| keyTasks | task-context | 识别核心任务 | 1 |
| criticalEvent | behavior-event | 正面行为证据（STAR+DSTF） | 3 |
| negativeEvent | behavior-event | 负面行为证据 | 2 |
| successFactors | decision-model | 岗位成功要素 | 1 |
| growthFocus | growth-target | 90 天提升重点 | 1 |

**DSTF 四维探针检测**：
- hasAction（行为）：检测"我做了/我安排/我推动"等
- hasDialogue（对话原话）：检测"我说/我问/原话"等
- hasThinking（思考）：检测"我想/我判断/我分析"等
- hasFeeling（感受）：检测"感觉/压力/焦虑"等

**不当模式检测**：
- `detectWeNotI`：检测"我们"多于"我"（BEI 要求个人行为描述）
- `detectGeneralization`：检测"我通常/一般/总是"（BEI 要求具体事件）

**答案评估逻辑**：
- position：检测岗位名称、团队规模、汇报对象
- keyTasks：至少 2 项任务
- criticalEvent/negativeEvent：STAR 基础维度完整性 + DSTF 增强维度
- growthFocus：至少 2 项 + 原因说明

### 4.5 beiCompetencyFramework — 胜任力框架

**文件**：`engines/beiCompetencyFramework.js`

**10 项 BEI 核心指标**：

| ID | 名称 | 核心考察点 |
|----|------|-----------|
| systemsThinking | 系统思维 | 逻辑条理、思维广度/深度/高度 |
| roleTransition | 角色转身 | 角色认知、团队发展、工作转型 |
| delegation | 授权予人 | 授权意识、技巧、跟踪监控 |
| motivation | 激励员工 | 激励意识、技巧与措施 |
| coaching | 指导下属 | 指导意愿、方式方法、发展规划 |
| collaboration | 高效协作 | 协作意愿、策略、冲突处理 |
| communication | 高效沟通 | 主动沟通、倾听理解、策略适配 |
| performanceManagement | 绩效管理 | 目标设定、过程管理、评估反馈 |
| planningExecution | 计划执行 | 目标导向、制定计划、协调资源 |
| problemSolving | 问题解决 | 问题意识、分析问题、解决问题 |

每个指标有 4 级行为描述（优/良/合格/待提升），分数段 0-39/40-69/70-89/90-100

**ID 兼容映射**：新 ID（camelCase）+ 旧 ID（kebab-case）+ 角色扩展维度（customerManagement 等 7 个映射到最相关的通用指标）

### 4.6 competencyDynamicsEngine — 贝叶斯能力追踪

**文件**：`engines/competencyDynamicsEngine.js`（500+ 行，最理论密集的引擎）

**理论框架**：
- **Kirkpatrick 四层**：L1 反应 5% / L2 学习 10% / L3 行为 50% / L4 结果 35%
- **70-20-10 模型**：知识 15% / 模拟 35% / 真实应用 50%
- **Dreyfus 五阶段**：Novice → Expert
- **Bloom 认知分类**：6 级乘数（0.5 → 1.8）
- **Kolb 经验循环**：Learn → Practice → Act → Reflect（完成循环+0.3 加成）
- **贝叶斯信念更新**：BEI 先验 + 行为证据后验（Beta 分布）

**10 种事件类型**（分 3 大类）：

| 事件 | 权重 | 类别 |
|------|------|------|
| action_plan_executed | 30% | 真实应用 |
| deep_retrospective | 12% | 真实应用 |
| transfer_application | 8% | 真实应用 |
| scenario_training | 20% | 模拟应用 |
| coach_application | 10% | 模拟应用 |
| action_plan_quality | 5% | 模拟应用 |
| proactive_search | 7% | 知识获取 |
| proactive_explore | 3% | 知识获取 |
| passive_recommended | 3% | 知识获取 |
| passive_browse | 2% | 知识获取 |

**贝叶斯追踪**：
- BEI 分数 → Beta 分布弱先验（alpha = score/10, beta = (100-score)/10）
- 每条行为证据 → 更新 alpha/beta → 计算后验均值和 95% CI
- 时间衰减：半衰期 90 天，最小权重 0.05
- 置信度计算：证据数量(30%) + 多样性(25%) + 时效性(25%) + 类别覆盖(20%)

**抗刷分机制**（6 重防护）：
1. 每日证据上限 5 条
2. 同类型递减收益（0.7^n）
3. 场景重复惩罚（3 次后减半）
4. 同能力间隔 4 小时
5. 复盘质量门槛（深度<2 降权 70%）
6. 模拟训练分数上限 70 分（无真实应用证据时）

**提问质量评估**（5 级）：
1. 信息检索（Bloom L1）
2. 程序性提问（Bloom L2）
3. 分析性提问（Bloom L4）
4. 策略性提问（Bloom L5）
5. 元认知提问（Bloom L6）

### 4.7 enablementSignalEngine — 赋能信号引擎

**文件**：`engines/enablementSignalEngine.js`

**7 种信号源**：

| 信号 | 触发条件 | 紧急度 |
|------|---------|--------|
| PPP_COMPETENCY_GAP | 能力评分<0.4 且无活跃赋能任务覆盖 | HIGH/MEDIUM |
| EXECUTION_BEHIND_SCHEDULE | 完成比 < 时间比×0.7 | HIGH/MEDIUM |
| TUTOR_STRATEGY_ISSUE | 私教反馈策略问题（未解决） | HIGH/MEDIUM |
| CAPACITY_CONFLICT | 学员容量过载（remaining<0） | HIGH/MEDIUM |
| EFFECT_TARGET_MET | 掌握度达标 | LOW |
| CONVERSION_FUNNEL_STALL | 活动 in_progress 超 7 天无进展 | HIGH/MEDIUM |
| LEARNER_HIGH_URGENCY | 学员发出高紧急度信号 | HIGH |

**核心约束**：每次推送必须有至少 1 个非时间维度的信号。

---

## 五、Quality Inspection 质量检查架构

### 5.1 三层质检架构

```
Layer 1 — 规则扫描（毫秒级，始终执行）
    ↓ flagged 时触发
Layer 2 — 教学法合规检测（策略匹配检查）
    ↓ 综合评分 < 阈值 或 high severity
Layer 3 — LLM 深度审查（MVP 未实现，仅标记 shouldDeepReview）
```

### 5.2 Layer 1 — 规则扫描（5 维度）

| 维度 | 严重度 | 检测方式 |
|------|--------|---------|
| **角色漂移** | HIGH | 越界模式匹配（"我帮你决定"等），白名单排除（"你觉得"等元认知引导） |
| **概念矛盾** | HIGH | 对立关键词对检测（MVP 暂禁用，误报率高） |
| **话语比失衡** | MEDIUM | AI 字符占比>70%，至少 4 轮才检测 |
| **僵局检测** | MEDIUM | 连续 5 轮用户消息<10 字 |
| **挑战信号未处理** | HIGH | 用户挑战关键词 + AI 回复无确认模式 |

**评分**：1.0（完美）→ 0（严重问题），high 扣 0.2，medium 扣 0.1

### 5.3 Layer 2 — 教学法合规检测（4 种检测）

| 检测 | 说明 |
|------|------|
| **策略×Dreyfus 匹配** | 新手用了苏格拉底追问/有效失败？专家用了基础脚手架？ |
| **策略×错误类型匹配** | 检测到 misconception 但没用概念转变策略（CG-08）？ |
| **策略组合缺失** | 推荐组合策略均未使用 |
| **策略效果空转** | 5+ 次策略应用但零突破信号 |

**错误纠正映射**：
- misconception → CG-08（概念转变）
- forgotten → CG-02 + CG-03（间隔重复 + 检索练习）
- misapplied → CG-04 + AF-02（交错练习 + 分层挑战）
- wrong_tool → CS-03 + IP-03（脚手架 + 苏格拉底追问）

### 5.4 信号挖掘引擎

**4 类信号**：

| 信号 | 检测方式 |
|------|---------|
| CHALLENGE | 挑战关键词 + AI 是否确认 |
| CONFUSION | 同一关键词 3+ 轮反复出现（n-gram 提取 + 停用词过滤） |
| BREAKTHROUGH | 顿悟关键词 + 掌握度变化 |
| DISENGAGEMENT | 滑动窗口参与度分数（消息长度 70% + 提问频率 30%） |

**跨会话关联**：
- 持续分歧：同一概念在 2+ 会话被挑战
- 教学设计缺陷：同一困惑跨会话出现
- 突破模式：哪些策略在突破时被使用
- 参与度风险：跨会话参与度持续下降

### 5.5 建议生成引擎

**建议类型**：strategy_effectiveness, error_pattern, content_gap, persona_calibration

**优先级分级**：
- P0（安全/合规）：角色漂移、事实错误、策略×Dreyfus 严重不匹配
- P1（体验类）：策略失效、内容缺口、人格校准

**核心约束**：输出自然语言建议，不做自动参数映射。TD/LD 阅读后自行决定是否执行。

---

## 六、BEI 能力框架设计

### 6.1 BEI 访谈设计

基于 McBer/Hay 体系的 BEI 标准，采用 STAR+DSTF 扩展模型：

- **STAR**：Situation → Task → Action → Result（基础维度）
- **DSTF**：Did → Said → Thought → Felt（增强维度，BEI 四维探针）

**6 个结构化问题**覆盖：基础信息 → 任务背景 → 正面行为事件 → 负面行为事件 → 成功要素 → 90 天成长焦点

**关键设计**：
- 正面+负面事件配对（BEI 标准要求）
- 每个问题有 `maxFollowupRounds` 限制
- 行为事件问题追问轮数最多（criticalEvent: 3, negativeEvent: 2）
- `shouldUseLlmProbe`：判断是否需要 LLM 增强追问
- `evaluateQuestionFollowup`：启发式答案完整性评估

**追问策略分层**：
1. STAR 基础维度先补齐（情境/行为/结果/关键数据）
2. DSTF 增强维度由 LLM 深度追问（对话原话/当时想法/感受反思）
3. 不当模式纠正温和但坚定（主语模糊/概括性陈述）

### 6.2 能力评估与追踪

**静态框架**：10 项核心指标 × 4 级行为描述（beiCompetencyFramework）
**动态追踪**：贝叶斯 Beta 分布 + 多层证据（competencyDynamicsEngine）
**交叉验证**：BEI 信号 × 评分 → 一致/需交叉验证/待校准（assessmentEngine）

**从 BEI 到能力追踪的完整链路**：

```
BEI 访谈回答 → 启发式+LLM 评估 → BEI 信号（evidence + uncertainty）
  → 能力优先级排序 → Beta 分布先验初始化
    → 日常行为证据（10 种事件类型）→ 贝叶斯更新后验
      → Dreyfus 阶段判定 → 影响教学策略选择
```

---

## 七、教学策略和互动类型

### 7.1 教学策略库（42 条循证策略）

**6 大分类**：

| 分类 | 数量 | 说明 |
|------|------|------|
| CG（认知与记忆） | 8 | 六分钟分段法、间隔重复、检索练习、交错练习、有效失败等 |
| NE（叙事与情感） | 7 | 案例锚定、情绪标记、前概念激活等 |
| IP（互动与参与） | 7 | 反转课堂、苏格拉底追问、同伴互教等 |
| CS（课程结构） | 7 | 先行组织者、脚手架渐进、微学习单元等 |
| TE（技术增强） | 6 | AI 自适应、多媒体双通道等 |
| AF（评估与反馈） | 7 | 即时反馈、分层挑战、精通学习门槛等 |

每条策略包含：code, name, description, effectSize, evidenceSummary, applicableScenarios, combinableWith, cognitiveLevel

### 7.2 互动类型系统（12+ 种核心类型）

**Phase 1 核心 12 类型（4 大类）**：

| 大类 | 类型 |
|------|------|
| 检测型(5) | predict, recall, misconception_check, confidence_check, timed_challenge |
| 建构型(3) | productive_failure, socratic, counterfactual |
| 迁移型(3) | transfer, summary, role_play |
| 体验型(1) | branch_scenario |

**Phase 2 计划扩展到 33 种**（A-H 8 大类）

### 7.3 课程模板

**8 个新经理关键时刻**（4 个学习阶段）：

| 阶段 | 名称 | 从→到 | 模板 |
|------|------|-------|------|
| Phase 1 | 站稳脚跟 | 我来了→我理顺了 | KM1, KM2 |
| Phase 2 | 学会放手 | 自己干→让别人干→出问题怎么办 | KM3, KM4 |
| Phase 3 | 应对复杂 | 管下属→管平级→管上级 | KM5, KM6 |
| Phase 4 | 赢得人心 | 评估表现→留住人才 | KM7, KM8 |

### 7.4 学员角色模型（8 种）

| 优先级 | 角色 | 风险 |
|--------|------|------|
| P0 必测 | 认真好学型 | 低（质量基线） |
| P0 必测 | 急躁速通型 | 中高 |
| P0 必测 | 敷衍应付型 | 高 |
| P1 应测 | 沉默迷茫型 | 中高 |
| P1 应测 | 较真挑战型 | 中 |
| P2 可测 | 跳跃探索型 | 中 |
| P2 可测 | 离线走神型 | 高 |
| P2 可测 | 恶意注入型 | 极高 |

每种角色包含：行为/文本/时间信号、AI 理想应对策略（strategy + actions + avoid）、典型输入示例

---

## 八、与产品需求的映射

### 8.1 已覆盖的核心能力

| 产品能力 | Demo 覆盖程度 | 对应模块 |
|---------|-------------|---------|
| **AI 教练对话** | 完整 | CoachingSkill + coachPersonaEngine |
| **4 种人格模式动态切换** | 完整 | coachPersonaEngine（7 条切换规则） |
| **情绪感知** | 完整（规则级） | coachPersonaEngine.detectEmotion（4 类信号） |
| **对话阶段感知** | 完整 | coachPersonaEngine.detectConversationStage（6 阶段） |
| **提问行为约束（认知负荷控制）** | 完整 | coachQuestioningSkill（认知链模型） |
| **BEI 行为事件访谈** | 完整 | beiInterviewEngine + DiagnosticSkill |
| **10 项胜任力框架** | 完整 | beiCompetencyFramework（4 级行为描述） |
| **贝叶斯能力追踪** | 完整 | competencyDynamicsEngine（Beta 分布 + 抗刷分） |
| **场景角色扮演训练** | 完整 | SimulationSkill |
| **逐轮评估 + 证据采集** | 完整 | EvaluationSkill（4 子能力） |
| **经验洞察捕捉** | 完整 | InsightCaptureSkill（单轮扫描 + 批量提取） |
| **行动计划检测** | 完整 | PlanningSkill.detectTodo |
| **用户画像构建** | 完整 | ProfilingSkill（BEI → 画像） |
| **复盘引导** | 完整 | RetrospectiveSkill（5 级深度评估） |
| **知识工具库注入** | 完整 | ContentSkill（26 个工具 × 关键词映射） |
| **场景个性化推荐** | 完整 | ContentSkill.recommendScenarios + scenarioContextSkill |
| **教学质量检验（两层）** | 完整 | qualityInspectionEngine + Layer1 + Layer2 |
| **信号挖掘** | 完整 | signalMiningEngine（4 类 + 跨会话关联） |
| **教研建议生成** | 完整 | recommendationEngine（P0/P1 分级） |
| **8 种信号分类** | 完整 | signalDetection（规则+上下文推理） |
| **6 种错误子类型分类** | 完整 | errorClassification（严重度矩阵） |
| **教学态自适应** | 完整 | LecturerPersona（Dreyfus 自适应 + 认知负荷估算） |
| **5 种教练策略** | 完整 | CoachingSkill（TELL/ASK/REVIEW/PLAN/FRAMEWORK_GUIDED） |
| **42 条循证教学策略** | 完整（数据定义） | teachingStrategies |
| **12+ 互动类型** | 完整（数据定义） | interactionTypes |
| **8 种学员角色** | 完整（数据定义） | learnerRoles |
| **教练范例库** | 完整 | coachExemplars（4 个信号类别 × 多 Dreyfus 级别） |
| **赋能信号检测** | 完整 | enablementSignalEngine（7 种信号源） |

### 8.2 Spec 设计但 Demo 未完整实现的部分

| Spec 设计 | 当前状态 | 说明 |
|-----------|---------|------|
| **Blackboard 状态机** | 仅 Spec 定义 | 5 类运行时状态的读写规则、Handoff 协议有完整 Spec，代码中未实现持久化 |
| **三层记忆架构** | 仅 Spec 定义 | 短期/中期/长期记忆的沉淀规则、staleness 机制、趋势聚合器 |
| **模式切换引擎** | 部分实现 | coachPersonaEngine 有人格模式切换，但 Coach↔Lecturer 之间的信号检测+二次确认+Handoff 未完整 |
| **ZPD×认知负荷耦合** | 部分实现 | LecturerPersona 有认知负荷三向量估算，但 ZPD 动态调整、波浪节奏监控未实现 |
| **Layer 3 LLM 深度审查** | 仅标记 | shouldDeepReview 标记了但 Layer 3 本身未实现 |
| **CGP 深度集成** | 基础集成 | LecturerPersona 有 CGP 加载课程配置的框架，但 CGP 本身是外部依赖 |
| **PPP 引擎深度集成** | 接口预留 | 多处 getPPPEngine() 调用，但 PPP 引擎本身不在本 Demo 中 |
| **跨 Agent 协作（Fiona/Orchestrator）** | 已清理 | 本 Demo 聚焦 Leo 内部，Fiona/Orchestrator 交互规则已移除 |
| **Supabase 持久化** | 未实现 | Spec 中 Handoff 的 `upsert`、中期存储等依赖 Supabase |
| **概念矛盾检测** | 暂禁用 | Layer 1 的 concept_contradiction 因中文误报率高暂禁用 |

---

## 九、可直接复用的设计模式

### 9.1 Persona-Skill 分层模式

**价值**：Persona 管编排和"人格"，Skill 管具体能力。Skill 无状态、统一接口 `execute(input) → output`，非常适合独立测试、替换和组合。

**复用建议**：
- SkillBase 的 `buildInput()` + `execute()` 契约可直接采用
- `callLLM` / `callLLMForJSON` 的便捷封装可复用
- sideEffects 模式（fire-and-forget 异步任务）非常实用
- metadata.action 路由模式（一个 Skill 多个子能力）可复用

### 9.2 动态 System Prompt 组装模式

**价值**：coachPersonaEngine 的 11 板块 Prompt 组装是最核心的设计。每个板块独立生成，按顺序拼接，信息来源多元化（用户画像、情绪检测、对话阶段、策略选择、PPP 证据等）。

**复用建议**：
- 板块化组装而非单一 Prompt 模板
- 情绪优先覆盖逻辑（valence < -0.3 → 注入情绪指引）
- 4 条铁律的设计思路（防止 LLM 产生拟人化/煽情/猜测等问题）
- 重框锁定铁律（教练最有价值的产出之一）

### 9.3 LLM-first + 规则降级双路径

**价值**：每个 Skill 都有完整的降级路径。LLM 可用时用 LLM，不可用时自动降级到规则。降级时诚实告知用户（"AI 服务暂时不可用"），而非假装智能。

**复用建议**：
- 意图分析：LLM-first（JSON 结构化输出）→ 关键词降级
- 评估：LLM 评估 → 中性默认分数
- 诊断：LLM 追问生成 → 启发式追问模板
- 教学：LLM 教学 → 结构化知识摘要 + 自助指引

### 9.4 认知链提问约束

**价值**：不是简单的"最多 N 个问题"，而是基于认知科学的链式约束。核心洞见：同一认知链上的渐进问题不增加额外负荷，不相关的并列问题大幅增加协调成本。

**复用建议**：
- 对话阶段→认知链模式→节奏控制→脚手架深度的完整链路
- Dreyfus 自适应脚手架深度
- 负面情绪自动降级到 1 个问题

### 9.5 贝叶斯能力追踪模式

**价值**：不是简单的分数累加，而是概率分布更新。新证据更新先验的同时保留不确定性。加上抗刷分机制（6 重防护）和 Kolb 循环加成，是严谨的能力建模。

**复用建议**：
- BEI 先验 → Beta 分布
- 多类型证据加权（真实应用 50% / 模拟 35% / 知识 15%）
- 时间衰减（半衰期 90 天）
- 抗刷分完整方案
- 置信度多因子计算

### 9.6 三层质检 + 信号挖掘 + 建议生成管线

**价值**：完整的教学质量闭环。Layer 1 快速筛查 → Layer 2 教学法验证 → 信号挖掘（单会话+跨会话）→ 建议生成（P0/P1 分级）→ 教研团队审阅。

**复用建议**：
- Layer 1 的 5 维度规则扫描（角色漂移、话语比、僵局、挑战未处理）
- Layer 2 的策略×Dreyfus 匹配检测
- 跨会话关联挖掘（持续分歧、教学设计缺陷、参与度趋势）
- 建议仅输出自然语言，不自动映射参数

### 9.7 BEI 访谈 STAR+DSTF 模型

**价值**：基于 McBer/Hay 标准的结构化访谈，DSTF 四维探针检测是专业级实现。不当模式检测（"我们"代替"我"、概括性陈述）是 BEI 标准的关键要求。

**复用建议**：
- 6 个结构化问题序列
- DSTF 四维探针完整性检测
- 每个问题的 `maxFollowupRounds` 限制
- `shouldUseLlmProbe` 决策逻辑
- 岗位变动时的 3 题更新模式（BEI_UPDATE_QUESTION_IDS）

### 9.8 信号驱动的路由架构

**价值**：8 种信号分类是整个系统的路由核心。信号决定由教练态还是教学态处理，决定使用哪种策略，决定是否切换模式。

**复用建议**：
- 8 种信号的定义和分类逻辑
- 教练信号（⑤⑦⑧）覆盖意图策略的优先级设计
- 信号×策略的映射关系
- 6 种错误子类型×3 级严重度的分类矩阵

### 9.9 教练范例库模式

**价值**：按信号类型组织的范例库，每个范例包含场景描述、教练回应模板、使用的技巧和适用 Dreyfus 级别。是教练策略的具体化参考。

**复用建议**：
- 4 个信号类别 × 多 Dreyfus 级别的范例矩阵
- `getExemplar(category, { dreyfusLevel })` 的最近级别匹配逻辑
- 每个范例的技巧命名（如"知行差距四维排除法"、"自评-他评对比校准"等）

---

## 十、总体评价

### 10.1 优势

1. **理论扎实**：每个设计决策都有循证依据（Greif 结果导向教练、AnnoMI、ICF、Sweller CLT、Bloom、Dreyfus、Vygotsky、Kolb、贝叶斯），不是拍脑袋
2. **工程质量高**：Persona-Skill 分层清晰，统一契约，无状态 Skill，LLM 降级完备，sideEffect 异步模式
3. **领域深度够**：BEI 访谈的 DSTF 四维探针、10 项胜任力 4 级行为描述、42 条教学策略、8 种学员角色 —— 这是教育学+管理学领域的专业知识工程
4. **防御性设计**：抗刷分 6 重防护、4 条铁律防 LLM 拟人化、诚实降级而非假装智能、情绪优先覆盖
5. **Spec 与代码对齐**：spec-私教系统.md 1100+ 行设计规格与代码实现高度一致

### 10.2 需要注意的点

1. **持久化未实现**：Blackboard、三层记忆、Handoff 状态包目前仅有 Spec，代码中是内存状态
2. **PPP/Fiona/Orchestrator 外部依赖**：多处 `getPPPEngine()` 调用，Demo 中以 mock 形式存在
3. **情绪检测是规则级**：当前基于正则+消息特征，Spec 设计为 LLM 每轮内部分析
4. **中文 NLP 限制**：概念矛盾检测因中文误报率高暂禁用，信号检测的正则模式覆盖有限
5. **教练↔教学态切换**：人格模式（4 种）切换完整，但 Coach↔Lecturer 之间的 Handoff 链路未完整实现
