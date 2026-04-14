# 技术全景汇总（执行摘要）

> 更新日期：2026-04-13
> 面向读者：产品负责人 + 研发负责人
> 配套详细文档：tech-01 ~ tech-05

---

## 一、技术资产地图

| 技术模块 | 已实现 | 已设计未实现 | 待开发 | 可参考外部方案 |
|---------|--------|------------|--------|--------------|
| **GPB（登录）** | 手机号/邮箱/SSO登录、多租户、RBAC、统一登录域名 | -- | 租户归档/冻结、批量导入 Excel 创建账号、项目级权益简化 | -- |
| **Prosona（授课+报告）** | 多模态授课(PPT/视频)、Quiz苏格拉底问答、L2自适应版本路由、8大模块个人报告、断点恢复、Langfuse Prompt管理 | ACE Context Engineering、通用 user_profile、上下文压缩、Playbook 演化 | ASSESSMENT_TAG/FEEDBACK_COLLECT/FEEDBACK_REVIEW 三种新SCO Handler、referenceSlots引用槽、三级记忆管道、被动信号采集、独立测评Handler | -- |
| **SIDE/drill-mate（对练）** | 导演-演员分离Roleplay、4阶段(导学→演绎→反思→报告)、实时进度+目标达成评估、L1-L5多维报告、跨轮次能力追踪 | Coach实时引导(已实现但禁用) | 角色互换/费曼/辩论等新玩法、对练导学打标SCO、情绪天花板字段、自适应难度调节 | 辩论调研中4个方向 |
| **AOM（内容格式）** | 五层数据结构、NARRATION/CHAT/quiz/roleplay四种SCO、separateTag+groupKey+tutorMode自适应三件套、半结构化内容驱动 | -- | ASSESSMENT_TAG/FEEDBACK_COLLECT/FEEDBACK_REVIEW三种新SCO类型、referenceSlots/universalCapabilityDimensions/rankingDimensions/groupingStrategy新字段、打标范围限Activity内、低置信度降级 | -- |
| **coaching-skills（辅导）** | 12个Skill+7个Engine+三层质检、4种人格模式切换、贝叶斯能力追踪(6重抗刷分)、BEI STAR+DSTF访谈、42条教学策略 | Blackboard持久化、三层记忆架构、Coach↔Lecturer Handoff、Layer3 LLM深度审查 | 渐进式披露知识库、统一Database持久化、跨课程记忆引用、PPP/Fiona集成 | -- |

---

## 二、按产品模块的技术映射

| 产品模块 | 主要技术来源 | 状态 | 关键差距 |
|---------|------------|------|---------|
| **辅导（大厅）** | coaching-skills 的 CoachPersona + 12 Skill + 7 Engine | **可参考，需改造** | 需从 JS Demo 迁移到 Python/Prosona 框架；需对接统一 Database 替代内存；需建渐进式披露知识库 |
| **授课（教室）** | Prosona 的 MultimodalTaskHandler + QuizTaskHandler | **已实现** | 需新增 FEEDBACK_COLLECT/REVIEW Handler + referenceSlots 解析 |
| **对练（教室）** | drill-mate 四阶段 Handler | **已实现** | 需扩展新玩法（角色互换/费曼/辩论）；需启用 Coach 引导 |
| **测评** | coaching-skills 的 BEI 访谈（可参考） + Prosona Quiz 评分 | **需要新建** | 无统一测评 Handler；需支持 BEI 追问+GUI 量表+对话分析 |
| **报告** | Prosona 个人报告子图（8大模块） + drill-mate 对练报告 | **已实现** | 需对接 universalCapabilityDimensions 通用能力维度；需新增排名/分组配置 |
| **管理端（HR+运营）** | -- | **需要新建** | 全新前端+后端，含 HR 报告看板、运营催学/任务下发/Dashboard |
| **登录** | GPB 统一登录体系 | **已实现，需对接** | 项目=租户映射、批量导入、租户归档 |

---

## 三、关键技术决策清单

| 编号 | 决策 | 内容 | 来源 |
|------|------|------|------|
| ADR-004 | **内容驱动** | AOM 是乐谱，Prosona 是钢琴。教学行为由内容脚本控制（passConditions/solution/blueprint/rule），平台只提供执行引擎 | 需求 v0.3.3 §16 |
| ADR-005 | **三级记忆管道** | 课堂内记忆采集 → 大厅辅导引用 → 管理端汇聚报告。统一 Database，三端按权限读取 | 需求 v0.3.3 §17 |
| ADR-006 | **辅导知识库不用 RAG** | 用渐进式披露的文件层级检索（每层 README），不用向量检索 | 创始人明确指示 |
| ADR-007 | **预制菜模式** | 第一版所有内容由 KGP 预制交付，管理员不配置课程结构 | 需求 v0.3.3 §16.6 |
| -- | **打标 SCO 独立** | 互动 SCO 负责采集，打标 SCO（ASSESSMENT_TAG）负责判定，两者分离 | 需求 Round-02 R1 |
| -- | **闭环反馈双 SCO** | FEEDBACK_COLLECT（课前采集）+ FEEDBACK_REVIEW（课后复盘），通过 memory_id 关联 | 需求 Round-02 R2 |
| -- | **Segment 版本管理** | SCO 和 Segment 一对一对应，自适应切换的是 Segment（版本）不是 SCO | 需求 v0.3.3 §16.3 |
| -- | **打标范围限 Activity 内** | 打标结果不跨 Activity 传递，每段影响范围到下一个打标 SCO 为止 | 需求 Round-02 R2 |

---

## 四、技术风险 Top 5

| # | 风险 | 影响 | 当前状态 | 建议缓解 |
|---|------|------|---------|---------|
| 1 | **辅导模块从 JS Demo 迁移到 Prosona 框架** | 辅导是产品核心入口（大厅），12 Skill + 7 Engine 工作量大 | coaching-skills 是 JS 原型，Prosona 是 Python 框架，架构差异大 | 优先迁移 CoachingSkill + coachPersonaEngine 核心链路，其余按需逐步迁移 |
| 2 | **三级记忆管道本期全做** | 涉及统一 Database 设计+所有模块的数据采集+跨模块检索+辅导引用 | 完全未实现 | 先做"课堂采集→Database→报告读取"单向链路，辅导引用和闭环反馈并行推进 |
| 3 | **三种新 SCO 类型的 Handler 开发** | ASSESSMENT_TAG + FEEDBACK_COLLECT + FEEDBACK_REVIEW 都不存在 | 无任何代码基础 | 基于 Prosona Handler 扩展机制（继承 TaskHandler + 注册），参考 QuizTaskHandler 模式 |
| 4 | **无上下文压缩** | 长对话可能超出 token 限制，Prosona 的 ACE Phase 3 未实现 | 仅有 COMPRESSIBLE_KEY 标记 | 短期用 ModelFallbackMiddleware 切大窗口模型；中期实现 awrap_model_call 中的 context budget |
| 5 | **评估高度依赖 LLM** | 对练评分、Quiz 评分、能力追踪全部靠 LLM 判断，一致性和可解释性存疑 | 无基于规则的硬性评分逻辑 | 关键评估节点增加规则校验层（关键词检测 + 结构验证），LLM 评分作为补充 |

---

## 五、外部参考技术方案索引

### 辩论调研中发现的 4 个方向

| 方向 | 说明 | 可参考点 |
|------|------|---------|
| **多 Agent 辩论框架** | 多个 LLM Agent 代表不同立场进行结构化辩论 | Director 可扩展为"裁判"角色，管理辩论节奏 |
| **费曼教学法 Agent** | 学员讲解→AI 追问→暴露理解缺口→重新学习 | 可复用 Actor 架构，Actor 扮演"不懂的听众" |
| **角色互换训练** | 用户扮演对手方，AI 扮演"自己" | 需要双向剧本，评估标准反转 |
| **自适应难度调节** | 基于实时对话分析动态调整 AI 角色强度 | 扩展 Director 指令系统，增加"难度参数" |

---

## 六、建议的技术架构演进路径

### Phase 1：基础链路打通（优先级最高）

```
GPB 登录对接 → 学员进入系统
  → Prosona 授课链路（已有）→ 补 FEEDBACK_COLLECT/REVIEW Handler
  → drill-mate 对练链路（已有）→ 启用 Coach 引导
  → 统一 Database 设计 → 半结构化记录存储
  → 管理端前端脚手架（新建）
```

**产出**：学员可完成"登录→授课→对练→查看报告"基本闭环

### Phase 2：记忆+辅导+测评

```
三级记忆管道 → 课堂采集→Database→报告读取
  → ASSESSMENT_TAG Handler（独立打标 SCO）
  → 辅导模块核心链路迁移（CoachingSkill + coachPersonaEngine → Prosona Handler）
  → 渐进式披露知识库（ADR-006）
  → 独立测评 Handler（BEI 追问 + 量表）
```

**产出**：辅导大厅可用，辅导能引用课堂记忆

### Phase 3：闭环+质量

```
闭环反馈完整链路（COLLECT→课中 referenceSlots 引用→REVIEW→辅导引用→报告呈现）
  → 辅导质检迁移（三层质检 + 信号挖掘）
  → AI 质量控制后台（后台查找溯源）
  → 对练新玩法扩展（角色互换 / 费曼）
  → universalCapabilityDimensions 贯通全模块
```

**产出**：完整的学习旅程闭环，可举证的行为改变

### Phase 4：优化+扩展

```
ACE Context Engineering 落地
  → 上下文压缩（长对话 token 管理）
  → L3 自适应（Activity 顺序调整）
  → 贝叶斯能力追踪对接统一 Database
  → 运营 Agent
```
