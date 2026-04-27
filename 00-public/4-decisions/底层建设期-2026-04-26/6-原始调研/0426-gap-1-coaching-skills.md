# Gap-1 · coaching-skills 项目扫描差距清单

> 扫描日期：2026-04-26
> 扫描范围：`01-ref/demo/coaching-skills/coaching-skills/` 全部 .js + .md（含 personas/3 + engines/7 + skills/13 + quality-inspection/5 + data/5 + docs/2）
> 衡量尺度：Neo 第一性原理 = 模拟 1v1 老师 7 动作（讲授/解惑/讨论/考研/练习/追问/反思）

---

## 项目摘要

coaching-skills 是从 `manager-training-app` master（2026-04-13 快照）抽出的 AI 私教能力层，定位是**面向"管理者"职业的成人 AI 教练系统**。架构是 **Persona × Skill × Engine × Quality 四层 + Blackboard 共享状态**：前台一个统一形象「Leo」，后台由 CoachPersona（教练态/老段，6 个 Skill）+ LecturerPersona（教学态/老徐，2 个 Skill）通过 Blackboard + Handoff 协议无缝切换。技术栈纯 JS（ES Module，无框架），全部 LLM 接入走 `LLMClient` 单例，Skills 是无状态的（execute(input)→output 契约）。规模约 50+ 文件，含 1100+ 行 spec、4 模式人格库、42 条循证教学策略、12+ 互动类型、8 BEI 胜任力指标、贝叶斯 Beta 能力追踪、4 阶段 Dreyfus 自适应、Sweller 三向量认知负荷、2 层质检（规则扫描+教学法验证）。**它不是产品代码，是一套可移植的"AI 教练方法论 SDK"**。

---

## 7 动作 × 项目能力对应表

| 动作 | coaching-skills 已覆盖 | 覆盖深度 | 对睿学 Neo 的可借用程度 |
|------|--------|--------|--------|
| **讲授** | `LecturerPersona.js`（Dreyfus 5 级 → mode/depth/scaffolding 自适应映射）+ `ContentSkill.js`（27 个工具关键词映射 + capability 映射）+ `teachingStrategies.js`（42 条循证策略，Bloom 标注、效应量、组合关系）+ `courseTemplates.js`（8 模板×5 分钟微课 4 阶段） | 高 | **改造借用**：Dreyfus×teachingMode 矩阵、scaffolding 三档、teachingStrategies 42 条直接迁移；ContentSkill 关键词检索需重做（睿学是"讲师上传素材"驱动，不是 27 工具固定库） |
| **解惑** | `errorClassification.js`（6 错误亚型 ①-a/①-b/②/③-a/③-b/⑥ + 3 严重度 + remediation 模板）+ `signalDetection.js`（8 类信号缺/偏分类）+ Layer 2 ERROR_CORRECTION_MAP（错误→纠正策略映射） | 高 | **直接借用**：错误分类法 6 亚型 + 严重度判定可直接迁移；信号检测的"缺/偏"二分法是 Neo 解惑的金标准（"以为知道"比"不知道"更危险） |
| **讨论** | `coachPersonaEngine.js` 4 模式 PERSONA_PROFILES（MENTOR/STRATEGIST/CHALLENGER/OBSERVER 完整 system prompt）+ `CoachingSkill.js`（ConversationStage 6 阶段 OPENING→CLOSING + 5 策略 TELL/ASK/REVIEW/PLAN/FRAMEWORK_GUIDED）+ `coachExemplars.js` 范例库（按信号 × Dreyfus 分组的真实话术） | 极高 | **改造借用**：4 人格模式、6 阶段、5 策略 = Neo 讨论引擎完整骨架。但当前是"成人管理教练"语料，睿学要做"企业培训 + 多职业"，需重写 PERSONA_PROFILES 的 coachingPhilosophy 和 coreIdentity；情绪驱动覆盖（强负面→EMOTIONAL_SUPPORT）逻辑直接保留 |
| **考研**（验证） | `EvaluationSkill.js`（4 子能力：evaluateTurn/sessionFeedback/updateEvidence/generateReport）+ `DiagnosticSkill.js`（BEI evaluateAnswer + generateProbe）+ spec §七验证策略选择器（**8 种验证方法**：快速回忆/概念辨析/费曼/情境判断/案例分析/角色扮演/迁移测试/教别人 × Bloom × 时间成本）+ EvidenceEntry 四字段（knows/canUse/usedCorrectly/evidenceSummary） | 极高 | **直接借用**：8 种验证方法 + 三维选择决策树（知识类型 × Dreyfus × 认知负荷）是睿学最缺的"如何考"方法论。EvidenceEntry "行为证据≠分数" 的设计哲学必须吸收 |
| **练习** | `SimulationSkill.js`（角色扮演，6 轮上限、END_KEYWORDS 退出、按意图 fallback）+ `scenarioContextSkill.js`（能力 × 场景 × 工具关联） | 中 | **改造借用**：6 轮上限、shouldClose 逻辑可借鉴；但 SimulationSkill 是单一管理对话场景，睿学的"对练"场域需要更复杂的分支（branch_scenario 已在 interactionTypes 标注但未实现）+ 多角色（客户/下属/同事） |
| **追问** | `coachQuestioningSkill.js`（**核心创新：认知链 ≠ 问题数量**——Sweller 认知负荷视角；STAGE_COGNITIVE_CHAIN 6 阶段链模式 + Bloom 5 类问题 + ScaffoldingDepth 三档 FULL/MODERATE/BRIEF）+ `beiInterviewEngine.js`（BEI 6 题 + DSTF 探针 + maxFollowupRounds 控制） | 高 | **直接借用**：认知链思想是睿学最稀缺的"追问哲学"——同链 3 问 < 异链 2 问。BEI 探针机制 + DSTF（对话/思考/感受/事实）是调研场域骨架，可重命名 |
| **反思** | `RetrospectiveSkill.js`（conductRetrospective + generateFollowUp + assessRetrospectiveDepth）+ `InsightCaptureSkill.js`（双模：单轮 scanForInsights + 会话末批量 extractSessionInsights，5 fragment/session 上限）+ Greif 结果导向反思（vs 消极反刍） | 高 | **改造借用**：双模洞察捕捉 + Greif 反思理论可全量借用。InsightCaptureSkill 的"专家挑战 → BEI 萃取"逻辑（spec B3）对睿学组织知识沉淀极其关键 |

---

## 5 个场域 × 项目能力对应表

| 场域 | coaching-skills 对应 | 与 spec v0.4.0 差异 |
|------|--------|--------|
| **大厅 Hall**（Topbar+抽屉+Chat） | `CoachPersona` 默认状态（intent=GREETING）+ `signalDetection` 路由 + `selectPersonaMode`（OPENING 阶段优先 MENTOR） | 项目无"大厅"概念，CoachPersona 直接进入对话；睿学大厅要承载 4 场域路由 + Neo 状态机展示 + 任务推送，**完全要新建**。可借用：4 模式自动选择算法 |
| **授课 Lecture** | `LecturerPersona` + `ContentSkill` + `LecturerPersona._loadCGPContext`（CGP 集成：courseId→stageContent→keyPoints→护栏验证）+ Cowan 4 chunks 分块 + 4 阶段（锚定/演绎/验证/收尾） | 睿学 spec 授课要求"讲师上传素材+互动点驱动"，CGP 已实现教学脚本+护栏机制（已审阅 spec 中"互动点设计"在 interactionTypes.js 12 类已基本对齐）。**重点差异**：项目"教学态触发"靠信号检测自动切换；睿学授课是"主场域固定"，不是状态切换 |
| **对练 Practice** | `SimulationSkill` 单一角色扮演 + `interactionTypes.js` 中 role_play / branch_scenario / counterfactual 类型 + 7.2 决策树升级到 role_play | 睿学 spec 要求"多场景对练库 + AI 评分 + 重练"，项目只有单次 6 轮对话 + 无评分。**需要补**：场景库管理、对练评分模型（可复用 EvaluationSkill.evaluateTurn 框架）、多角色切换 |
| **调研 Inquiry** | `beiInterviewEngine.js`（BEI 6 题序列 + DSTF 探针 + 4 类别 basic-info/task-context/behavior-event/decision-model/growth-target）+ `DiagnosticSkill` + `ProfilingSkill.buildProfile` | 项目 BEI 是"管理者初始诊断"，睿学调研是"开营前+学习中持续诊断"。**直接借用**：BEI 题型设计 + DSTF 探针逻辑 + 自动 followup 控制（maxFollowupRounds）；**需改造**：题库要按职业/课程动态生成 |
| **报告 Report** | `EvaluationSkill.generateReport`（PPP-driven）+ `competencyDynamicsEngine.js`（**贝叶斯 Beta 分布 + 4 类别加权 70-20-10：真实应用 50%/模拟 35%/知识 15%** + Bloom 乘数 + 主动性乘数）+ `qualityInspectionEngine.js`（2 层质检报告） | 睿学 spec 报告"只做 team report"（Management 0421 决策），项目侧重个人报告。**关键差距**：team aggregation 维度未实现，但单人模型（贝叶斯+多事件加权）极强，可作为底层；质检 2 层用于"教研管理端"的 AI 自我检验完全契合睿学 Ora 角色 |

---

## 关键发现（10 条）

1. **【核心创新】coachQuestioningSkill 的"认知链 vs 问题数量"** → **影响**：睿学追问能力可直接吸收为方法论根基。同一认知链 3 问不超载（"是什么→为什么→意味着什么"），不同维度 2 问反而过载。这一观点在睿学 spec 中尚未体现。

2. **【核心借用】8 种验证方法 + 三维选择决策树**（spec §七）→ **影响**：睿学考研动作的方法论缺口被一次性补齐。决策树代码尚未在 .js 中实现（spec 文档为主），需要工程化为 `VerificationSelectorSkill`。

3. **【可直接借用】signalDetection 的 8 类信号"缺/偏"二分法** → **影响**：睿学解惑的根因分类法。"偏比缺更危险"的设计哲学（学员以为自己知道）必须写入 Neo 提示词。pattern 正则 + masteryScore 上下文推断的混合方案直接可用。

4. **【架构借用】Persona/Skill 双层契约** → **影响**：Neo 工程实现可复用 `PersonaBase`/`SkillBase` 抽象（execute(input)→output、buildInput、callLLM 便利方法、sideEffects 异步任务）。Persona = 编排层，Skill = 无状态能力包，是清晰的解耦边界。

5. **【架构借用】Blackboard 状态机 + Handoff 协议** → **影响**：解决睿学"同 Neo 跨场域记忆"的核心架构问题。5 类状态（会话/认知/教学/人格/实践）+ 三种写入模式（覆盖/追加/原子）+ 短中长三层记忆 + staleness 机制是工业级方案。睿学当前 spec 未触及这一深度。

6. **【改造借用】PersonaMode 4 模式（MENTOR/STRATEGIST/CHALLENGER/OBSERVER）+ 自动切换** → **影响**：Neo 的人格层有现成模板，但 PERSONA_PROFILES 全是"管理教练"语料，睿学多职业场景要重写每个模式的 coreIdentity 和 coachingPhilosophy。selectPersonaMode 的"情绪 × 阶段 × 意图 × turnCount"切换逻辑可保留。

7. **【启发参考】quality-inspection 2 层质检** → **影响**：Layer1（规则扫描，毫秒级，5 维度：角色漂移/概念矛盾/话语比/僵局/挑战未处理）+ Layer2（教学法验证，策略×Dreyfus 匹配）= Ora 管理端"教研引擎"的方法论基础。睿学 spec 提到 Ora 但未细化检测维度。

8. **【启发参考】competencyDynamicsEngine 70-20-10 加权**（真实 50%+模拟 35%+知识 15%）+ Bloom 乘数 + 主动性乘数 + 贝叶斯 Beta 更新 → **影响**：睿学"能力变化追踪"的工业级算法模板。比简单分数累加严谨得多。

9. **【启发参考】LearnerRoles 8 种学员行为模式**（认真/急躁/敷衍/沉默/挑战/跳跃/走神/恶意）+ 信号检测 + 应对策略 → **影响**：可直接做 Neo 测试用例库；睿学当前 2 账号（student01/newbie01）测试不够，需扩展到 8 种类型保证覆盖。

10. **【关键发现】"专家挑战 → BEI 萃取"反向流程**（spec §七 B3 修正、§六 B1）→ **影响**：当 Dreyfus L3+ 学员挑战教学时，Neo 应"切入 BEI 请教模式"反向萃取专家经验，推送给 N+1/TD/LD。这是睿学**组织知识沉淀**最稀缺的设计——把"教"反转为"采"。

---

## 缺失清单（睿学需要但 coaching-skills 没有的）

- **多场域路由层**：项目只有 learner 单 context，睿学 4 学员场域 + 1 管理场域的路由调度未实现。需新建 `ContextRouter` 或 `SceneOrchestrator`。
- **TD/LD/Ora 管理端 Persona**：项目只有 Coach（学员视角）+ Lecturer（学员视角），无管理者视角的 Persona。Ora 角色完全缺失，需基于 PersonaBase 新建。
- **课程内容上传/解析层**：项目假设"教学内容已存在"（CGP loadMasterCourse），但讲师如何上传 PPT/视频/讲义、如何切分知识块、如何标 Bloom 层级 = 睿学的核心生产力 = 项目零覆盖。
- **多职业 Persona 库**：项目只有"管理者"语料；睿学 spec 要支持销售/客服/技术等多职业，需职业 × Dreyfus × 模式三维 Profile 库。
- **学员开营/分组/进度管理**：项目无"批次/期数/同期生"概念，纯单人对话；睿学 W0/16 → W16 学习周期管理完全空白。
- **Team Report 聚合**：单人 PPP 强大，但团队维度（按部门/按 cohort/按职业横向对比）未实现。
- **HITL（Human-In-The-Loop）介入点**：项目纯 AI 自动，无"AI 不确定→转人工"的设计。睿学 0421 决策提到"HITL 待调研"。
- **声音/视频多模态**：项目纯文字交互，无 ASR/TTS/视频对练能力。
- **课程资产生命周期**：版本管理、变更通知、过期归档、A/B 测试 = 全部缺失。
- **付费/订阅/license 体系**：纯能力库，无商业化层。

---

## 已覆盖但需验证的（睿学可借鉴但需要测试的）

- **认知负荷三向量阈值**（intrinsic≥0.7 / extraneous≥0.6 触发硬停）：项目 spec 给出阈值但来源是经验值（MVP 写死），睿学落地时需要做用户测试校准。
- **冷启动策略前 5 次会话基线采集**：spec 设计但代码中冷启动具体实现未见，需补 LearnerProfile 初始化流程。
- **签证 cooldown 3 轮防 ping-pong**：spec §五.7 提到但 signalDetection.js 未见 cooldown 实现，需补。
- **Bloom 乘数 0.5/0.7/1.0/1.3/1.5/1.8**（competencyDynamicsEngine）：是否符合睿学职业能力模型，需用真实数据回归验证。
- **Cowan 4 chunks 分块上限**：3-4 个新概念/教学单元——是否对成人企业学员通用？建议先用 3 chunks（保守）验证。
- **42 条循证教学策略的"组合关系" combinableWith**：理论上可推荐组合，但无效果数据；睿学需要建立策略 A/B 评估机制。
- **8 种 LearnerRoles 应对策略**：项目给了 idealResponse 但未实测；睿学要做对应的 prompt 工程验证。

---

## 推荐的睿学 Neo Persona 启动文件清单（前 10）

按重要度排序：

1. **`personas/PersonaBase.js`** + **`skills/SkillBase.js`** → **直接迁移**为睿学架构基类，统一 execute/buildInput/callLLM 契约（10 行内可适配 Neo+Ora 双 Persona）。

2. **`engines/coachPersonaEngine.js`**（PERSONA_PROFILES + selectPersonaMode + detectEmotion + detectConversationStage + buildCoachSystemPrompt）→ **改造借用**：保留 4 模式骨架和切换算法，重写 PERSONA_PROFILES 内容为多职业版（移除"管理教练"专属语料，做职业模板化）。这是 Neo 大脑。

3. **`engines/coachQuestioningSkill.js`**（认知链思想 + Bloom 问题分类 + Scaffolding 三档）→ **直接借用**：作为睿学"追问"动作的方法论基石，是 spec v0.4.0 当前缺的部分。

4. **`skills/signalDetection.js`** + **`skills/errorClassification.js`** → **直接借用**：8 类信号"缺/偏"分类 + 6 类错误亚型，是 Neo 解惑动作的根因分析层。pattern 正则可保留并扩展。

5. **`docs/spec-私教系统.md`** §七验证策略选择器（8 种验证 × 三维选择决策树 + EvidenceEntry）→ **直接借用方法论，需新建 `skills/VerificationSelectorSkill.js`**：项目里这部分是 spec 文字，没有完整代码实现。这是睿学考研动作的核心。

6. **`docs/spec-私教系统.md`** §二 Blackboard 状态机 + §三三层记忆架构 → **直接借用架构思想，需新建 `agents/Blackboard.js` + `services/MemoryService.js`**：睿学跨场域记忆的工业级方案。包含 5 项外审修正（staleness、趋势聚合、priority+urgency、Handoff 原子性、ZPD 混合变量）。

7. **`personas/LecturerPersona.js`** + DREYFUS_TEACHING_MAP + DREYFUS_INTRINSIC_BASELINE → **改造借用**：Dreyfus 5 级 → mode/depth/scaffolding 自适应映射 + 认知负荷三向量估算（_estimateCognitiveLoad 方法可直接移植）。CGP 集成代码（_loadCGPContext）作为"讲师素材→教学执行"的工程参考。

8. **`engines/competencyDynamicsEngine.js`**（贝叶斯 Beta + 70-20-10 加权 + Bloom×主动性乘数 + Dreyfus 5 阶段定义）→ **改造借用**：睿学能力变化追踪的算法模板。需要把"管理者 17 能力"换成多职业能力模型，但加权框架直接保留。

9. **`engines/beiInterviewEngine.js`** + **`skills/DiagnosticSkill.js`**（BEI 6 题 + DSTF 探针 + maxFollowupRounds + STAR 结构）→ **改造借用**：睿学调研场域的题库设计 + followup 控制机制。题库内容要重做（按职业/按课程模板），但访谈引擎机制直接复用。

10. **`quality-inspection/qualityInspectionEngine.js`** + **`layer1RuleScanner.js`** + **`layer2PedagogicalValidator.js`** + **`recommendationEngine.js`** → **改造借用**：Ora 管理端"教研引擎"的方法论基础。Layer1 规则（角色漂移/概念矛盾/话语比/僵局/挑战未处理）可直接迁移；Layer2 策略×Dreyfus 矩阵需要适配多职业。

**辅助资产（不算前 10 但必读）**：
- `data/teachingStrategies.js` 42 条循证策略（Bloom 标注 + 效应量 + combinableWith）= 教学策略库直接迁移
- `data/interactionTypes.js` 12+ 互动类型（检测/建构/迁移/体验四类）= 与睿学 spec 互动点设计高度对齐
- `data/learnerRoles.js` 8 种学员模式 = Neo 测试用例库
- `skills/InsightCaptureSkill.js` + `skills/RetrospectiveSkill.js` = 反思动作完整能力包

---

## 一句话总结

coaching-skills 是一份**工程实现 70% + 方法论 spec 90%** 的成熟 AI 教练 SDK，核心心智（Persona×Skill×Engine 解耦、Blackboard+Handoff、信号驱动切换、认知链追问、行为证据验证、贝叶斯能力追踪、2 层质检）**可整体作为睿学 Neo 第一性原理的"实现参考实现"**；但因其语料完全锚定"管理者教练"，**多职业泛化、4 学员场域路由、讲师素材生产、TD/Ora 管理端、批次/团队聚合**这五块睿学独有需求**项目零覆盖**，必须从零设计。
