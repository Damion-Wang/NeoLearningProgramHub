# 技术全景：coaching-skills（辅导原型）

> 更新日期：2026-04-13
> 面向读者：产品经理 + 研发工程师
> 代码路径：`ref/demo/coaching-skills/coaching-skills/`（manager-training-app master 分支）

---

## 一、4层架构

```
┌──────────────────────────────────────────────────────┐
│  Persona 层（用户前台形象）                             │
│  ├── CoachPersona（Leo 教练态，组合 6 个 Skill）        │
│  └── LecturerPersona（老徐 教学态，组合 2 个 Skill）     │
├──────────────────────────────────────────────────────┤
│  Skill 层（无状态技能模块，统一 execute(input)→output）  │
│  12 个 Skill（详见第三节）                              │
├──────────────────────────────────────────────────────┤
│  Engine 层（认知引擎，Leo 的"大脑"）                     │
│  7 个 Engine（详见第四节）                               │
├──────────────────────────────────────────────────────┤
│  QI 层（Quality Inspection，教学质量自省）               │
│  5 个组件（详见第五节）                                  │
├──────────────────────────────────────────────────────┤
│  Data 层（教练知识数据）                                │
│  coachExemplars / teachingStrategies(42条)             │
│  courseTemplates(8个) / interactionTypes(12+)          │
│  learnerRoles(8种)                                    │
└──────────────────────────────────────────────────────┘
```

**核心设计原则**：

| 原则 | 说明 |
|------|------|
| **Persona-Skill 分离** | Persona 编排 Skill，Skill 不知道谁调用它，Skill 无状态 |
| **后台分离，前台统一** | CoachPersona + LecturerPersona 各自独立优化，用户只看到"Leo" |
| **Blackboard Architecture** | 状态在中间，Agent 来读写，不靠摘要传递 |
| **信号驱动** | 所有主动行为必须有可解释的信号触发 |
| **LLM-first + 规则降级** | 每个 Skill 都有 LLM 优先、不可用时降级到规则的双路径 |

---

## 二、Persona 系统

### 2.1 CoachPersona（Leo，教练态）

**personaId**：coach | **组合 6 个 Skill**

| Skill | 调用时机 | 同步/异步 |
|-------|---------|----------|
| **CoachingSkill** | 每条消息（主技能） | 同步 |
| **ContentSkill** | 用户消息含知识关键词时 | 同步（前置注入） |
| **EvaluationSkill** | 预留 | -- |
| **PlanningSkill** | 每条消息（detectTodo） | 异步 sideEffect |
| **InsightCaptureSkill** | 每条消息（scan）+ 会话结束（batch） | 异步 sideEffect |
| signalDetection | 每条消息 | 同步（信号分类） |

**处理流程**：构建跨 Agent 上下文 → 知识注入 → 信号检测 → CoachingSkill.execute() → 异步 sideEffects → panelHint → 返回 PersonaOutput

### 2.2 LecturerPersona（老徐，教学态）

**personaId**：lecturer | **组合 2 个 Skill**：ContentSkill + EvaluationSkill

**核心特性**：
- **Dreyfus 自适应**：根据学员阶段（novice→expert）自动调整教学模式/深度/脚手架
- **认知负荷估算**：三向量 `{intrinsic, extraneous, germane}` 实时估算
- **理解检查**：每 3 轮自动插入
- **错误分类**：检测到错误时调用 `classifyError()`（6种子类型）

### 2.3 前台统一 + Blackboard 协作

两个 Persona 对用户呈现为统一形象"Leo"。通过 Blackboard 架构共享状态（评估历史、能力画像、洞察记录等），Handoff 协议定义切换规则。

**状态**：Blackboard 持久化 **仅 Spec 定义，代码中为内存状态**

---

## 三、12 个 Skill 详解

### 3.1 CoachingSkill（核心，734行，13步流水线）

**文件**：`skills/CoachingSkill.js`

**执行流水线**：
1. 情绪检测 → `personaEngine.detectEmotion()`
2. 对话阶段检测 → `personaEngine.detectConversationStage()`
3. 意图分析 → LLM-first + 关键词降级（8种意图类型）
4. 情绪-意图覆盖 → 强负面情绪 → EMOTIONAL_SUPPORT
5. 动态人格模式选择 → `personaEngine.selectPersonaMode()`
6. 策略选择（信号感知）→ 信号5/7/8覆盖 + 5种教练策略
7. 提问约束构建 → 认知负荷控制
8. PPP 能力画像注入
9. 学习推荐检测
10. System Prompt 组装 → `personaEngine.buildCoachSystemPrompt()`
11. LLM 调用（Temperature 按模式调整）
12. PPP 观察 sideEffect
13. 返回 SkillOutput

**5种教练策略**：TELL（分享知识）/ ASK（苏格拉底提问）/ REVIEW（回顾串联）/ PLAN（结构化规划）/ FRAMEWORK_GUIDED（框架引导分析）

### 3.2 其余 11 个 Skill

| Skill | 文件 | 核心能力 | 状态 |
|-------|------|---------|------|
| **SimulationSkill** | `skills/SimulationSkill.js` | 场景角色扮演，AI 完全入角色，回复50-100字，6轮自动关闭 | **已实现** |
| **EvaluationSkill** | `skills/EvaluationSkill.js` | 4子能力：逐轮评分(4维度1-10分) / 会话反馈 / 证据累积 / 能力报告 | **已实现** |
| **DiagnosticSkill** | `skills/DiagnosticSkill.js` | BEI 诊断，DSTF 四维探针，不当模式检测（"我们"代替"我"） | **已实现** |
| **InsightCaptureSkill** | `skills/InsightCaptureSkill.js` | 经验碎片检测（9个正则）+ 会话结束批量提取（最多3条） | **已实现** |
| **PlanningSkill** | `skills/PlanningSkill.js` | 4子能力：detectTodo / generateLearningPath / assessComplexity / getTaskProbability | **已实现** |
| **ProfilingSkill** | `skills/ProfilingSkill.js` | BEI回答+诊断缺口→结构化用户画像 | **已实现** |
| **RetrospectiveSkill** | `skills/RetrospectiveSkill.js` | 复盘引导，5级深度（对应Bloom L1-L6），认知迁移检测 | **已实现** |
| **ContentSkill** | `skills/ContentSkill.js` | 知识工具库注入（26个工具×多关键词）+ 场景排序推荐 | **已实现** |
| **signalDetection** | `skills/signalDetection.js` | 8种信号分类（缺概念/遗忘/误用/选错工具/知行差距/错误心智/元认知偏差/语境错配） | **已实现** |
| **errorClassification** | `skills/errorClassification.js` | 6种错误子类型×3级严重度矩阵 | **已实现** |
| **scenarioContextSkill** | `skills/scenarioContextSkill.js` | 纯函数，为场景训练构建个性化上下文 | **已实现** |

---

## 四、7 个 Engine

### 4.1 coachPersonaEngine（灵魂，900+行）

**文件**：`engines/coachPersonaEngine.js`

**4种人格模式**：

| 模式 | 核心身份 | 适用场景 |
|------|---------|---------|
| MENTOR | 结果导向的管理教练 | 默认模式、新手探索、情绪低落 |
| STRATEGIST | 系统思维管理顾问 | 复杂问题拆解、行动规划 |
| CHALLENGER | 直言不讳的质疑者 | 安全区停滞、认知固化 |
| OBSERVER | 清晰的镜子 | 深度反思、对话收尾 |

**模式切换决策规则**（8条，按优先级排序）：
- 优先级 100：负面情绪 → MENTOR
- 优先级 80：反思 + DEEPENING → OBSERVER
- 优先级 70：planning + 非焦虑 → STRATEGIST
- 优先级 60：高信心/兴奋 + 轮次>2 → CHALLENGER

**情绪检测**：10种情绪状态×4类信号源（关键词匹配 / 消息特征 / 长度变化趋势 / 短消息脱离）

**System Prompt 11板块动态组装**：

| # | 板块 | 来源 |
|---|------|------|
| 1 | 核心身份 | PERSONA_PROFILES[mode].coreIdentity |
| 2 | 教练哲学 | PERSONA_PROFILES[mode].coachingPhilosophy |
| 3 | 沟通风格 | PERSONA_PROFILES[mode].communicationStyle |
| 4 | 用户画像 | userProfile |
| 5 | 情绪觉察 | emotionResult + emotionalApproach |
| 6 | 对话阶段 | conversationStage + stageGuidance |
| 7 | 提问约束 | coachQuestioningSkill |
| 8 | 当前分析 | intentResult + strategyResult |
| 8b | PPP 证据摘要 | pppSnapshot |
| 9 | 策略指导 | strategy-specific guidance |
| 10 | 跨 Agent 知识 | crossAgentContext |
| 11 | 回答要求 | responseGuidelines + 4条铁律 |

**4条铁律**：1)文字对话不是小说 2)事实优先 3)不煽情 4)锁定重框

### 4.2 competencyDynamicsEngine（贝叶斯 Beta 分布 + 6重抗刷分）

**文件**：`engines/competencyDynamicsEngine.js`（500+行）

**理论框架**：Kirkpatrick 四层 × 70-20-10 模型 × Dreyfus 五阶段 × Bloom 六级 × Kolb 经验循环 × 贝叶斯更新

**贝叶斯追踪**：
- BEI 分数 → Beta 分布弱先验（alpha = score/10, beta = (100-score)/10）
- 每条行为证据 → 更新 alpha/beta → 计算后验均值和 95% CI
- 时间衰减：半衰期 90 天，最小权重 0.05

**6重抗刷分防护**：
1. 每日证据上限 5 条
2. 同类型递减收益（0.7^n）
3. 场景重复惩罚（3次后减半）
4. 同能力间隔 4 小时
5. 复盘质量门槛（深度<2 降权 70%）
6. 模拟训练分数上限 70 分（无真实应用时）

### 4.3 beiInterviewEngine（BEI 访谈）

**文件**：`engines/beiInterviewEngine.js`

**6个结构化问题**：position(岗位) → keyTasks(任务) → criticalEvent(正面事件,追问3轮) → negativeEvent(负面事件,追问2轮) → successFactors(成功要素) → growthFocus(90天焦点)

**DSTF 四维探针**：Did(行动) / Said(对话原话) / Thought(想法) / Felt(感受)

**不当模式检测**：`detectWeNotI`（BEI 要求个人行为）+ `detectGeneralization`（BEI 要求具体事件）

### 4.4 beiCompetencyFramework（10项胜任力）

**文件**：`engines/beiCompetencyFramework.js`

10项核心指标：系统思维 / 角色转身 / 授权予人 / 激励员工 / 指导下属 / 高效协作 / 高效沟通 / 绩效管理 / 计划执行 / 问题解决

每项4级行为描述（0-39 / 40-69 / 70-89 / 90-100）

### 4.5 assessmentEngine（BEI 信号与能力优先级）

**文件**：`engines/assessmentEngine.js`

能力优先级公式：`score = uncertainty×3 + uncovered×2 + (evidence>0 ? 0 : 1)`

### 4.6 enablementSignalEngine（7种赋能信号）

**文件**：`engines/enablementSignalEngine.js`

7种信号：PPP_COMPETENCY_GAP / EXECUTION_BEHIND_SCHEDULE / TUTOR_STRATEGY_ISSUE / CAPACITY_CONFLICT / EFFECT_TARGET_MET / CONVERSION_FUNNEL_STALL / LEARNER_HIGH_URGENCY

### 4.7 coachQuestioningSkill（提问约束）

**文件**：`engines/coachQuestioningSkill.js`

核心理念：关键不是"最多几个问题"，而是"问题之间是否构成认知链"

5种问题类型（对应 Bloom）：CLARIFICATION → DEEPENING → REFLECTIVE → HYPOTHETICAL → ACTIONABLE

对话阶段→认知链→节奏→脚手架深度的完整约束链

---

## 五、三层质检

### 5.1 Layer 1 — 规则扫描（5维度）

| 维度 | 严重度 | 检测方式 |
|------|--------|---------|
| **角色漂移** | HIGH | 越界模式匹配（"我帮你决定"等），白名单排除 |
| **概念矛盾** | HIGH | 对立关键词对检测（MVP 暂禁用，中文误报率高） |
| **话语比失衡** | MEDIUM | AI 字符占比>70%，至少4轮才检测 |
| **僵局检测** | MEDIUM | 连续5轮用户消息<10字 |
| **挑战信号未处理** | HIGH | 用户挑战关键词 + AI 回复无确认模式 |

**状态**：**已实现**

### 5.2 Layer 2 — 教学法合规检测（4种违规）

| 检测项 | 说明 |
|--------|------|
| **策略×Dreyfus 匹配** | 新手用了苏格拉底追问/有效失败？专家用了基础脚手架？ |
| **策略×错误类型匹配** | 检测到 misconception 但没用概念转变策略（CG-08）？ |
| **策略组合缺失** | 推荐组合策略均未使用 |
| **策略效果空转** | 5+次策略应用但零突破信号 |

**状态**：**已实现**

### 5.3 信号挖掘（4类信号 + 跨会话关联）

**4类信号**：CHALLENGE（挑战）/ CONFUSION（困惑，同一关键词3+轮反复）/ BREAKTHROUGH（突破）/ DISENGAGEMENT（脱离）

**跨会话关联**：持续分歧（同概念2+会话被挑战）/ 教学设计缺陷（同困惑跨会话）/ 突破模式 / 参与度风险

### 5.4 建议生成（P0/P1 分级）

- **P0（安全/合规）**：角色漂移、事实错误、策略×Dreyfus 严重不匹配
- **P1（体验类）**：策略失效、内容缺口、人格校准

核心约束：输出自然语言建议，不做自动参数映射。TD/LD 阅读后自行决定。

---

## 六、9个可复用设计模式

| # | 模式 | 价值 | 复用建议 |
|---|------|------|---------|
| 1 | **Persona-Skill 分层** | Skill 无状态、统一接口、可独立测试 | SkillBase 契约 + sideEffects 模式 + metadata.action 路由 |
| 2 | **动态 System Prompt 组装** | 11板块独立生成，信息来源多元 | 板块化拼接 + 情绪优先覆盖 + 4条铁律 |
| 3 | **LLM-first + 规则降级** | 每个 Skill 都有完整降级路径 | 意图分析/评估/诊断/教学四类降级策略 |
| 4 | **认知链提问约束** | 同一链上渐进问题不增负荷 | 对话阶段→认知链→节奏→脚手架深度 |
| 5 | **贝叶斯能力追踪** | 概率分布更新+不确定性保留 | Beta 分布 + 多类型证据加权 + 时间衰减 + 抗刷分 |
| 6 | **三层质检管线** | 快速筛查→教学法验证→信号挖掘→建议 | Layer1规则+Layer2策略匹配+跨会话关联 |
| 7 | **BEI 访谈 STAR+DSTF** | 专业级结构化访谈 | 6问题序列 + DSTF 探针 + 不当模式检测 |
| 8 | **8种信号驱动路由** | 信号决定处理引擎和策略 | 教练信号(5/7/8)覆盖意图策略的优先级 |
| 9 | **教练范例库** | 按信号×Dreyfus 级别组织 | 4类别×多级别范例矩阵 |

---

## 七、与产品需求的映射

### 7.1 能直接复用的能力

| 产品需求 | coaching-skills 对应模块 | 复用方式 |
|---------|------------------------|---------|
| AI 教练对话 | CoachingSkill + coachPersonaEngine | **直接复用**核心流水线 |
| 4种人格模式切换 | coachPersonaEngine（7条切换规则） | **直接复用** |
| 情绪感知 | coachPersonaEngine.detectEmotion（4类信号） | **直接复用**规则级实现 |
| 对话阶段感知 | coachPersonaEngine.detectConversationStage（6阶段） | **直接复用** |
| 提问行为约束 | coachQuestioningSkill | **直接复用**认知链模型 |
| 场景角色扮演训练 | SimulationSkill | **直接复用** |
| 经验洞察捕捉 | InsightCaptureSkill | **直接复用** |
| 行动计划检测 | PlanningSkill.detectTodo | **直接复用** |
| 复盘引导 | RetrospectiveSkill | **直接复用** |
| 知识工具库注入 | ContentSkill（26工具×多关键词） | **直接复用** |
| 8种信号分类 | signalDetection | **直接复用** |
| 6种错误子类型 | errorClassification | **直接复用** |
| 两层教学质检 | Layer1 + Layer2 | **直接复用** |
| 信号挖掘+建议生成 | signalMiningEngine + recommendationEngine | **直接复用** |

### 7.2 需要改造的能力

| 产品需求 | 当前状态 | 改造方向 |
|---------|---------|---------|
| BEI 测评 | **已实现**（beiInterviewEngine + DiagnosticSkill） | 需从"辅导中的诊断"改造为"独立测评模块"，增加量表支持 |
| 10项胜任力框架 | **已实现**（新经理场景专用） | 需改造为可配置的能力框架，支持 KGP 自定义 |
| 贝叶斯能力追踪 | **已实现**（competencyDynamicsEngine） | 需对接统一 Database，替代内存存储 |
| 用户画像构建 | **已实现**（ProfilingSkill，BEI→画像） | 需对接产品需求中的 student_profile 体系 |
| 逐轮评估+证据采集 | **已实现**（EvaluationSkill 4子能力） | 需对接产品需求中的举证机制和碎片采集 |
| 教学态 Dreyfus 自适应 | **已实现**（LecturerPersona） | 需对接 Prosona 的 Handler 体系 |
| 42条教学策略 | **已实现**（数据定义） | 需映射到 AOM 的 blueprint 字段 |

### 7.3 缺失需新建的能力

| 产品需求 | 说明 |
|---------|------|
| **辅导知识库（渐进式披露）** | 创始人明确不用 RAG，用文件层级检索，每层 README，需 **新建** |
| **Blackboard 持久化** | Spec 有定义但代码中为内存状态，需 **新建** |
| **三层记忆架构** | 短期/中期/长期记忆沉淀规则，需 **新建** |
| **Coach↔Lecturer Handoff** | 信号检测+二次确认+切换协议，需 **完善** |
| **Layer 3 LLM 深度审查** | 仅标记了 shouldDeepReview，需 **新建** |
| **Supabase/统一 Database 持久化** | 所有状态需从内存迁移到统一 Database，需 **新建** |
| **跨课程记忆引用** | 辅导教练需跨 Course 引用课堂记忆，需 **新建** |
| **PPP/Fiona/Orchestrator 集成** | Demo 中以 mock 形式存在，需 **正式对接** |
