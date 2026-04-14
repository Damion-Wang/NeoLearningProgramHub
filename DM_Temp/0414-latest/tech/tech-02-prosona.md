# 技术全景：Prosona（授课 + 报告引擎）

> 更新日期：2026-04-13
> 面向读者：产品经理 + 研发工程师
> 代码仓库：prosona-agent

---

## 一、三层架构全景

```
┌──────────────────────────────────────────┐
│  Layer 3: 业务应用层 (app/, 不发布)        │
│  - handlers/: 各 SCO 类型的业务处理器       │
│  - graph/review/: 个人报告生成子图         │
│  - services/: 业务服务                    │
│  - infra/: Redis 等基础设施               │
├──────────────────────────────────────────┤
│  Layer 2: 框架层 (agentickit pypi 包)      │
│  - core/: 工厂函数 + TaskMiddleware 机制中枢 │
│  - aom/: AOM 四层 Middleware + API + 类型  │
│  - utils/: 上下文构建、消息、流式输出       │
├──────────────────────────────────────────┤
│  Layer 1: 外部依赖                        │
│  - drill-aom-plugins (对练独立 pypi 包)   │
│  - Langfuse (Prompt 管理)                │
│  - PostgreSQL (Checkpoint 持久化)         │
│  - Redis (学员画像缓存、异步状态)          │
└──────────────────────────────────────────┘
```

### 核心组件清单

| 组件 | 职责 | 关键文件 | 状态 |
|------|------|---------|------|
| **TaskMiddleware** | 机制中枢：管理任务生命周期、子图创建/缓存、内置工具闭包 | `core/middleware/task_middleware.py` | **已实现** |
| **TaskHandler** | 业务处理器接口：定义 abefore/aafter 等生命周期钩子 | `core/handler/task_handler.py` | **已实现** |
| **HandlerRegistry** | Handler 注册表：按 name 映射 Handler，支持回退查找链 | `core/handler/handler_registry.py` | **已实现** |
| **AOM Middleware (4层)** | Root/Project/Activity/SCO 四层，逐层加载业务数据并注入 LLM 上下文 | `aom/middlewares/` | **已实现** |
| **Middleware 管道** | UserContext → Task → ModelEnhance → ModelFallback → Speaker → ChatMetadata | `core/factory.py` | **已实现** |

---

## 二、AOM 执行链路

### 2.1 从数据包到 AI 演绎的完整链路

```
HTTP请求(A2A协议) → Executor(分流:首次/恢复)
  → RootMiddleware(L0, 会话级, 永不结束)
    → ProjectMiddleware(L1, get_project_info + get_project_modules + get_project_activities)
      → ActivityMiddleware(L2, get_sco_info 加载SCO列表)
        → SCOMiddleware(L3, get_sco_content + get_sco_history)
          → Handler执行(QuizTaskHandler / MultimodalTaskHandler / ...)
            → LLM与学员交互(interrupt/resume循环)
          → Handler结束(aafter: 评分/分析/上报)
        → 返回Activity层
      → Activity结束(lifecycle消息)
    → 返回Project层
  → SSE流式输出
```

### 2.2 Handler 分发映射

| scoType (int) | 转换结果 | Handler | task name |
|----------------|----------|---------|-----------|
| 4 | `quiz` | QuizTaskHandler | `sco-quiz` |
| 3 (bizType=content) | `content` | MultimodalTaskHandler | `sco-content` |
| 3 (bizType=drill-deduction) | `drill-deduction` | DeductionTaskHandler | drill-aom-plugins |
| 3 (bizType=drill-review) | `drill-review` | ReviewTaskHandler | drill-aom-plugins |
| activity.type=report | `personal_report` | PersonalReportTaskHandler | `sco-report` |

### 2.3 嵌套任务执行模型

Prosona 最核心的架构创新 -- **LLM 驱动的嵌套子图执行**：
- LLM 自主调 `_builtin_start_task("sco", {id: xxx})`，框架自动创建子 Graph
- 每个任务层级是独立的 LangGraph 子图
- 通过 `interrupt(None)` 暂停等待用户输入，`Command(resume=state)` 恢复
- 所有子图共享同一个 Checkpointer，支持断点恢复

---

## 三、授课能力

### 3.1 MultimodalTaskHandler（视频/PPT）

**文件**：`app/handlers/multimodal_task_handler.py`（name: `sco-content`）
**State 扩展**：`MultimodalTaskState`（+`current_item_index`）

**执行流程**：
1. `abefore`：按 student_profile 筛选 segment（多版本 SCO），注入素材列表 Prompt
2. LLM 按素材顺序依次教学：
   - 视频类（itemType=1,6）：调用 `play_video`/`replay_video`，等待 `biz-aitutor-finished-video` 反馈
   - PPT 类（itemType=5）：调用 `display_ppt`，展示后讲解
3. `move_to_next_item` 工具更新 current_item_index
4. `awrap_model_call`：每次 LLM 调用注入当前素材 reminder（进度/类型/脚本/描述）
5. `aafter`：异步探索分析 + 个报 trait 碎片生成

**Prompt 体系**：
- TASK.md：`resources/prompts/aitutor/v3/tasks/sco-content/TASK.md`
- 内容模板：`v3/plugin/sco/multimodal/content`（素材列表）
- 进度 Reminder：`v3/plugin/sco/multimodal/reminder`（当前素材进度）
- 完成通知：`v3/plugin/sco/multimodal/observe_action_all_complete`（注入 rule 作为完成标准）

**状态**：**已实现**

### 3.2 QuizTaskHandler（苏格拉底问答）

**文件**：`app/handlers/quiz_task_handler.py`（name: `sco-quiz`，最重的 Handler）
**State 扩展**：`QuizTaskState`（+`quiz_content`, `history_qa_sessions`）

**执行流程**：
1. `abefore`：API 获取题目内容（content, explainText, answerContent, answerAnalysis, solution, passConditions, knowledgePoints）
2. LLM 引导学员思考并回答（苏格拉底式启发，最多5轮）
3. `aget_card`：`display_question`（展示题目）、`display_answer`（展示答案）、`display_all`
4. `awrap_model_call`：注入 reminder（不透露答案、启发轮次限制）
5. `aafter` -- 5个后处理步骤：
   - LLM 评分 + 上报 tracking
   - 异步高光分析（存 Redis）
   - 异步探索分析
   - 异步个报碎片（trait + cognitive）
   - Introduction activity 的学员画像分析

**关键行为规则**：
- `is_display_answer=true`：完成后展示答案 + 询问疑问
- `is_display_answer=false`：禁止展示答案
- 调用 `display_answer` 前不能透露参考答案

**状态**：**已实现**

### 3.3 LectureTaskHandler（授课小结）

**文件**：`app/handlers/lecture_task_handler.py`（name: `activity-lecture`）
**职责**：授课 Activity 结束后生成学习小结（学习时长 + 高光时刻 + 学习建议）
**状态**：**已实现**

---

## 四、个人报告系统

### 4.1 架构

独立的 LangGraph 子图（`personal_report_graph.py`），由 `PersonalReportTaskHandler` 触发。

**核心文件**：

| 文件 | 职责 |
|------|------|
| `app/handlers/personal_report_task_handler.py` | 报告触发入口、工具定义、卡片渲染 |
| `app/graph/review/personal_report_graph.py` | Graph 节点定义 + 报告生成主流程 |
| `app/graph/review/personal_report_common.py` | 公共工具函数、Prompt 常量、API 调用封装 |
| `app/graph/review/personal_report_fragments.py` | 异步碎片生成（学习过程中实时产生） |
| `app/schema/personal_report_types.py` | 所有数据模型（Pydantic） |

### 4.2 异步碎片采集

碎片在**学习过程中实时生成**，存储到 Java 后端，报告生成时拉取汇总：

| 碎片类型 | 生成时机 | 生成函数 |
|---------|---------|---------|
| **trait**（学习特质） | SCO 对话完成后 | `generate_trait_fragment_for_sco()` |
| **trait**（对练特质） | 对练活动完成后 | `generate_trait_fragment_for_drill_activity()` |
| **cognitive**（认知转化） | Quiz 答题闭环后 | `generate_cognitive_fragment_for_quiz_sco()` |
| **competency**（能力评估） | 对练完成后 | `maybe_generate_competency_fragment_for_drill_sco()` |

### 4.3 报告 Graph 拓扑（8大模块并行生成）

```
第一层（并行6节点）:
  base_info → 基础用户信息
  highlight_moments → 高光时刻（LLM 精选 top3）
  competences_analysis → 能力成长（等待 competency 碎片）
  transformation → 认知转化（等待 cognitive 碎片）
  learning_performance → 学习表现（tracking API + 对话历史）
  skill_improvement → 技能提升（纯数据聚合, 无 LLM）

第二层:
  growth_performance → 成长表现（汇总 trait 碎片 + 前面结果, 3个子流程: 特质/转变/优势）

第三层（并行2节点）:
  comprehensive_evaluation → 综合评估（全部来自前置节点）
  development_advice → 行动建议（认知+技能+能力）

第四层:
  action_summary → 行动摘要（基于行动建议）

第五层:
  aggregate_results → 创建 Artifact + 保存到 Java API
```

### 4.4 报告写入（三步）

| 步骤 | 目标 | 用途 |
|------|------|------|
| 1 | 创建 Artifact | 前端通过 artifact_id 获取并渲染完整报告 |
| 2 | 关联 Artifact | `tutor_project_user_artifact` 表，建立用户+项目→artifact_id 关联 |
| 3 | 结构化保存 | `tutor_user_report_base` 及子表，后台查询、统计 |

### 4.5 报告前端下发（累积式）

- Part 1：学习表现 + 认知转化 + 技能提升 + 能力成长
- Part 2：Part 1 + 综合评估 + 成长表现 + 高光时刻
- Part 3：Part 1+2 + 行动建议

**状态**：**已实现**

---

## 五、L2 自适应

### 5.1 数据链路

```
Introduction Activity（课前热身诊断）
  → QuizTaskHandler._analyze_student_profile()（LLM 分析）
  → student_profile.type = "防御拖延型" / "利益博弈型" / "情绪对抗型"
  → 存储: Redis (student_profile:{context_id})
  → 传播: SCO → Activity → Project（逐层 bubble up）
```

### 5.2 版本筛选逻辑

当 `tutor_mode = 1` 时，MultimodalTaskHandler 在 abefore 中执行：
1. 从 Redis 获取 `student_profile.type`
2. 遍历 `sco_segment_list`
3. 只保留 `separateTag` 与学员类型匹配的 segment
4. 未获取到画像时使用兜底值"利益博弈型"

### 5.3 判定维度

| 维度 | 说明 |
|------|------|
| Q1_场景类型 | 学员描述的场景类型 → 指向某版本 |
| Q2_对方动机 | 对方动机分析 → 指向某版本 |
| Q3_学员风格 | 学员应对风格 → 指向某版本 |

组合状态："三清"/"两清一模"/"一清两模"/"三模"/"超时退出"，通过多数投票决定版本路由。

**状态**：**已实现**（但仅支持三类型，通用 user_profile 未落地）

---

## 六、7层 Prompt 注入体系

| 顺序 | 来源 | 注入频率 |
|------|------|---------|
| 0 | 全局 System Prompt（Langfuse `main`） | 一次/全局 |
| 0+ | Skill 概览（ModelEnhanceMiddleware） | 每次 LLM 调用 |
| 1 | `<project_information>` XML | 一次/任务 |
| 2 | `<activity_item>` + `<sco_list>` XML | 一次/任务 |
| 3 | `<current_sco>` XML | 一次/任务 |
| 4 | `<language_rules>` | 一次/任务 |
| 5 | Skill 完整内容（每个 Skill 一条 SystemMessage） | 一次/任务 |
| 6 | 术语表 | 一次/任务 |
| 7 | TASK.md 任务指令 | 一次/任务 |

**Prompt 管理**：采用 Langfuse 外化管理，三个命名空间：
- `prosona`：框架级 Prompt（system/main, tasks/TASK.md, skills/SKILL.md）
- `aitutor`：业务级 Prompt（sco-quiz/sco-content/sco-report 的 TASK.md + plugin 模板）
- `side`：辅助 Prompt

本地 `resources/prompts/` 保存副本，通过脚本上传/拉取。

**状态**：**已实现**

---

## 七、检查点恢复机制

| 场景 | 触发 | 恢复方式 |
|------|------|---------|
| 用户输入等待 | `interrupt(None)` | `Command(resume=state)` |
| 会话断开重连 | ACTION_SESSION_QUIT | ACTION_SESSION_START → aresume |
| 业务中断恢复 | `end_task(is_interrupt=True)` | `recover_task` |
| 异常恢复 | API 超时/LLM 错误 | 重入 abefore_agent，status=running 跳过初始化 |

存储后端：Memory（开发）/ SQLite（单机）/ PostgreSQL（生产）

**状态**：**已实现**

---

## 八、已设计未实现的能力

| 能力 | 设计文档 | 当前状态 |
|------|---------|---------|
| **ACE Context Engineering** | `ace_context_engineering.md` | 仅设计方案，3个 Phase 均 **未实现** |
| **通用 user_profile** | `user_profile.md` | 数据模型已定义，异步推断系统 **未实现** |
| **上下文压缩** | `architecture_agent_mechanism.md` | 仅有 COMPRESSIBLE_KEY 标记，无实际压缩逻辑，**未实现** |
| **Playbook 演化** | `ace_context_engineering.md` | Task Prompt 仍为静态文件，**未实现** |
| **跨 session 记忆** | `ace_context_engineering.md` | Handler 级 Memory **未实现** |

---

## 九、与产品需求的差距

| 产品需求 | 当前状态 | 差距说明 |
|---------|---------|---------|
| 新增 SCO 类型 `ASSESSMENT_TAG`（打标判定） | **需要新建** | 当前无独立打标 Handler，打标逻辑嵌在 QuizTaskHandler._analyze_student_profile() 中 |
| 新增 SCO 类型 `FEEDBACK_COLLECT`（课前采集） | **需要新建** | 不存在任何对应 Handler |
| 新增 SCO 类型 `FEEDBACK_REVIEW`（课后复盘） | **需要新建** | 不存在任何对应 Handler |
| `referenceSlots` 字段（引用槽） | **需要新建** | AOM 中无此字段，SCOMiddleware 不解析此字段 |
| 独立测评 Handler | **需要新建** | 当前测评能力散布在 Quiz 评分 + 对练目标评估中，无统一测评 Handler |
| 辅导模块 | **完全缺失** | Prosona 不含辅导功能，辅导在 coaching-skills 独立原型中 |
| 闭环反馈机制（记忆存储+课中引用+课后复盘） | **需要新建** | 仅有 trait/cognitive/competency 碎片，无 memory_id 关联机制 |
| 三级记忆管道 | **需要新建** | 当前数据单向上报到 Java 后端，无跨模块记忆检索能力 |
| `universalCapabilityDimensions`（通用能力维度） | **需要新建** | Project 层无此字段 |
| 被动信号采集（passive_signals） | **需要新建** | 无停留时长、回翻、点击等被动信号采集 |

---

## 十、框架级能力汇总（已实现）

| 能力 | 实现方式 |
|------|---------|
| AOM 课程包解析 | 4层 Middleware + 统一 API |
| 嵌套任务执行 | `_builtin_start_task` 驱动的子图嵌套 |
| 断点恢复 | Checkpoint + interrupt/resume 机制，4种恢复场景 |
| 模型降级兜底 | ModelFallbackMiddleware（doubao→qwen3） |
| 多语言支持 | language_rules 注入 + locale 配置 |
| Prompt 外化管理 | Langfuse 三个命名空间 |
| 语音合成（TTS） | SpeakerMiddleware + TTS 配置 |
| A2A 消息协议 | 5种标准 biz 协议 |
| 并发控制 | Context Lock 机制（同一用户串行） |
