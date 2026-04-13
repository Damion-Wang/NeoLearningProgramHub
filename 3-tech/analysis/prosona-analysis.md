# Prosona Agent 架构设计全面分析报告

> 生成时间: 2026-04-13
> 面向读者: 产品经理、业务规划人员、技术决策者
> 分析范围: prosona-agent 项目全部设计文档

---

## 目录

1. [整体架构](#1-整体架构)
2. [AOM 如何被解析和执行](#2-aom-如何被解析和执行)
3. [授课/对练/测评三种模式的实现机制](#3-授课对练测评三种模式的实现机制)
4. [自适应机制的实现](#4-自适应机制的实现)
5. [记忆/上下文工程](#5-记忆上下文工程)
6. [个人报告系统](#6-个人报告系统)
7. [对练插件系统](#7-对练插件系统)
8. [与产品层面的映射](#8-与产品层面的映射)

---

## 1. 整体架构

### 1.1 分层架构

Prosona Agent 采用三层架构:

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

### 1.2 核心组件

| 组件 | 职责 | 关键文件 |
|------|------|---------|
| **TaskMiddleware** | 机制中枢: 管理任务生命周期、子图创建/缓存、内置工具闭包、生命周期钩子分发 | `core/middleware/task_middleware.py` |
| **TaskHandler** | 业务处理器接口: 定义 abefore/aafter 等生命周期钩子，每种教学类型一个 Handler | `core/handler/task_handler.py` |
| **HandlerRegistry** | Handler 注册表: 按 name 映射 Handler，支持回退查找链 | `core/handler/handler_registry.py` |
| **MiddlewareRegistry** | Middleware 注册表: 按 task_group_name 映射 Middleware 类 | `core/middleware/middleware_registry.py` |
| **AOM Middleware (4层)** | AOM 业务适配: Root/Project/Activity/SCO 四层，逐层加载业务数据并注入 LLM 上下文 | `aom/middlewares/` |
| **Middleware 管道** | 模型调用链: UserContext -> Task -> ModelEnhance -> ModelFallback -> Speaker -> ChatMetadata | `core/factory.py` |

### 1.3 数据流向

```
HTTP请求(A2A协议) → Executor(分流:首次/恢复)
  → Middleware管道(6层链式处理)
    → RootMiddleware(L0, 会话级, 永不结束)
      → ProjectMiddleware(L1, 加载课程信息)
        → ActivityMiddleware(L2, 加载活动+SCO列表)
          → SCOMiddleware(L3, 加载SCO数据/内容, 叶子节点)
            → Handler执行(QuizTaskHandler/MultimodalTaskHandler/...)
              → LLM与学员交互(interrupt/resume循环)
            → Handler结束(aafter: 评分/分析/上报)
          → 返回Activity层
        → Activity结束(lifecycle消息)
      → 返回Project层
    → Project结束(传播student_profile)
  → SSE流式输出
```

### 1.4 嵌套任务执行模型

这是 Prosona 最核心的架构创新 -- **LLM 驱动的嵌套子图执行**:

- 老项目: AOMManager 程序化推进三层结构，LLM 调 `next_step` 工具
- 新项目: LLM 自主调 `_builtin_start_task("sco", {id: xxx})`，框架自动创建子 Graph 执行

每个任务层级都是一个独立的 LangGraph 子图，通过 `interrupt(None)` 暂停等待用户输入，通过 `Command(resume=state)` 恢复执行。所有子图共享同一个 Checkpointer，支持断点恢复。

### 1.5 启动流程

```python
# 四步启动
handler_registry = create_handler_registry(task_handlers=[...])    # 注册10个Handler
middleware_registry = create_middleware_registry(                    # 注册4层Middleware
    root_middleware=RootMiddleware,
    task_middlewares=[ProjectMiddleware, ActivityMiddleware, SCOMiddleware],
)
graph, _ = create_prosona_agent(system_prompt, handler_registry, middleware_registry)
executor = ProsonaA2AStreamAgenticExecutor(graph)
start_default_agentic_application(EnhancedAgenticExecutor(executor))
```

---

## 2. AOM 如何被解析和执行

### 2.1 AOM 三层数据模型

```
Project (课程)
  ├── ProjectSchema: actvId, actvName, description, ext(courseArchitecture, learningObjectives, competencyGoals, learnerProfile)
  │
  └── Activity (活动/小节)
        ├── ActivityExtendSchema: id, name, type(lecture/roleplay/report/introduction), description, module_name
        │
        └── SCO (最小学习单元)
              ├── SCOExtendSchema: id, name, type, content, blueprint, rule, ai_tutor_dialogue, tutor_mode, separateTag
              │
              └── SCO Segment (素材片段, 仅多模态类型)
                    └── SCOSegmentSchema: id, itemType(1=视频/5=PPT/6=用户输入视频), script, description, separateTag
```

### 2.2 从数据包到 AI 演绎的完整链路

**第一步: 数据加载**
1. RootMiddleware.abefore: 获取 project_id，注入 `start_task("project")`
2. ProjectMiddleware.abefore: 调用 `get_project_info` + `get_project_modules` + `get_project_activities` API，加载课程全量信息
3. ActivityMiddleware.abefore: 调用 `get_sco_info` 加载当前活动的 SCO 列表
4. SCOMiddleware.abefore: 调用 `get_sco_content` + `get_sco_history` 加载 SCO 具体内容和历史消息

**第二步: 上下文注入**

每层 Middleware 在 abefore 中构建 XML 格式的 SystemMessage 注入 LLM 上下文:

| 层级 | 注入的 XML 标签 | 包含信息 |
|------|--------------|---------|
| Project | `<project_information>` | 课程名称、描述、起止时间 |
| Activity | `<activity_list>` + `<activity_item>` | 所有活动列表、当前活动详情+SCO列表 |
| SCO | `<current_sco>` | 当前 SCO 的 id、name、type |

**第三步: Handler 分发**

SCO 类型通过 `_get_sco_type(scoType, narration)` 转换为字符串类型，然后通过 HandlerRegistry 查找对应 Handler:

| scoType (int) | 转换结果 | Handler | task name |
|----------------|----------|---------|-----------|
| 4 | `quiz` | QuizTaskHandler | `sco-quiz` |
| 3 (bizType=content) | `content` | MultimodalTaskHandler | `sco-content` |
| 3 (bizType=drill-deduction) | `drill-deduction` | DeductionTaskHandler | 由 drill-aom-plugins 提供 |
| 3 (bizType=drill-review) | `drill-review` | ReviewTaskHandler | 由 drill-aom-plugins 提供 |
| activity.type=report | `personal_report` | PersonalReportTaskHandler | `sco-report` |

**第四步: LLM 交互**

Handler 在 abefore 中注入具体内容 Prompt (如题目内容、素材列表)，然后进入 agent loop:
- LLM 通过 `_builtin_conversation` 工具与学员对话
- 通过 `_builtin_wait_for_user_input` 等待学员回复 (interrupt/resume 循环)
- 通过 `_builtin_send_user_content` 推送富内容卡片 (视频、PPT、报告)
- 通过 `_builtin_end_task` 结束当前 SCO

**第五步: 生命周期管理**

- Activity 层发送 `biz-common-activity-lifecycle` 消息 (enter/leave)
- SCO 层调用 `start_sco`/`end_sco` API + 发送 `biz-common-sco-lifecycle` 消息 (enter/leave)
- Quiz 类型额外调用 assessment API 提交评分数据

### 2.3 状态体系

框架采用 TypedDict 继承体系，每层 Middleware 对应一层 State:

```
ProsonaAgentState (context_id, parts, user_profile, locale)
  └── TaskState (id, name, status, params, result, mode)
      └── RootTaskState (project_id)
          └── ProjectTaskState (project_info, module_list, activity_list, student_profile)
              └── ActivityTaskState (activity, sco_list)
                  └── SCOTaskState (sco, sco_segment_list, order)
```

每个 Handler 还可以定义自己的 `state_schema`，框架自动合并。

---

## 3. 授课/对练/测评三种模式的实现机制

### 3.1 授课模式 (Lecture)

授课模式包含两种 SCO 类型的交替:

#### 3.1.1 多模态内容 (sco-content) -- MultimodalTaskHandler

**Handler**: `MultimodalTaskHandler` (name: `sco-content`, 继承 EnhanceTaskHandler)

**State 扩展**: `MultimodalTaskState` (+`current_item_index`)

**执行流程**:
1. `abefore`: 按 student_profile 筛选 segment (多版本 SCO)，注入素材列表 Prompt
2. LLM 按素材顺序依次教学:
   - 视频类 (itemType=1,6): 调用 `play_video`/`replay_video`，等待 `biz-aitutor-finished-video` 反馈
   - PPT 类 (itemType=5): 调用 `display_ppt`，展示后讲解
3. `move_to_next_item` 工具更新 current_item_index
4. `awrap_model_call`: 每次 LLM 调用注入当前素材 reminder (进度/类型/脚本/描述)
5. `aafter`: 异步探索分析 + 个报 trait 碎片生成

**Prompt 体系**:
- TASK.md: `resources/prompts/aitutor/v3/tasks/sco-content/TASK.md`
- 内容模板: `v3/plugin/sco/multimodal/content` (素材列表)
- 进度 Reminder: `v3/plugin/sco/multimodal/reminder` (当前素材进度)
- 完成通知: `v3/plugin/sco/multimodal/observe_action_all_complete` (注入 rule 作为完成标准)

#### 3.1.2 问答题 (sco-quiz) -- QuizTaskHandler

**Handler**: `QuizTaskHandler` (name: `sco-quiz`, 继承 EnhanceTaskHandler, **最重的 Handler**)

**State 扩展**: `QuizTaskState` (+`quiz_content`, `history_qa_sessions`)

**执行流程**:
1. `abefore`: API 获取题目内容 (content, explainText, answerContent, answerAnalysis, solution, passConditions, knowledgePoints)
2. LLM 引导学员思考并回答 (苏格拉底式启发, 最多5轮)
3. `aget_card`: `display_question`(展示题目), `display_answer`(展示答案), `display_all`
4. `awrap_model_call`: 注入 reminder (不透露答案, 启发轮次限制)
5. `aafter` -- 5个后处理步骤:
   - LLM 评分 + 上报 tracking
   - 异步高光分析 (存 Redis)
   - 异步探索分析
   - 异步个报碎片 (trait + cognitive)
   - Introduction activity 的学员画像分析

**关键行为规则**:
- `is_display_answer=true`: 完成后展示答案 + 询问疑问
- `is_display_answer=false`: 禁止展示答案
- 调用 `display_answer` 前不能透露参考答案

#### 3.1.3 授课小结 -- LectureTaskHandler

**Handler**: `LectureTaskHandler` (name: `activity-lecture`, 继承 EnhanceTaskHandler)

**State 扩展**: `LectureTaskState` (+`review_uuid`, `review_content`, `history_qa_sessions`)

**职责**: 授课 Activity 结束后生成学习小结
- `aafter_task`: 子任务完成后合并 history_qa_sessions
- `_builtin_load_lecture_data`: 计算学习时长 + 启动异步报告生成
- `wait_system_feedback`: 轮询 Redis 等待报告就绪 (120s)
- `aget_card`: `display_basic_data`/`display_highlights`/`display_learning_suggestions`

### 3.2 对练模式 (Drill)

对练模块作为独立 pypi 包 `drill-aom-plugins` 发布，通过 handler_registry 注入。

#### 3.2.1 State 继承体系

```
SCOTaskState
  └── BaseDrillTaskState (+plain_script, structured_script)
        ├── GuideTaskState (+shown_stages)
        ├── DeductionTaskState (+round, opening_remarks_outputted, deduction_started, deduction_goal_eval_result)
        └── ReportTaskState (+report, report_outputted)
```

#### 3.2.2 对练四阶段

| 阶段 | Handler | 职责 | 核心工具 |
|------|---------|------|---------|
| **导学** | GuideTaskHandler | 对练前导学，加载剧本，注入 `<script_content>` | `PracticeGuideToolBuilder` |
| **演绎** | DeductionTaskHandler | AI 扮演客户角色与学员对话 | `ProgressToolBuilder` + `ActorDeduceToolBuilder` + `OpeningNarrateToolBuilder` + `GoalEvalToolBuilder` |
| **复盘** | ReviewTaskHandler | 对练后复盘，可调出演绎历史对话记录 | Skill: `review` |
| **报告** | ReportTaskHandler | 对练报告生成并提交 | `generate_sparring_report_and_submit` |

#### 3.2.3 Activity 级 Handler

| Handler | 职责 |
|---------|------|
| RoleplayActivityTaskHandler | 对练 Activity 结束时异步触发 trait 碎片 + competency 碎片生成 |
| IntroductionActivityTaskHandler | 子任务完成后将 student_profile 向上传播 |

### 3.3 测评模式

当前 Prosona 中没有独立的"测评"模式 Handler。测评能力通过以下方式实现:

1. **Quiz SCO 的评分机制**: QuizTaskHandler 的 aafter 中调用 LLM 评分 + 上报 tracking + 调用 assessment API 提交评分数据
2. **对练的目标达成评估**: DeductionTaskHandler 使用 GoalEvalToolBuilder 评估对练目标达成情况
3. **能力评估碎片**: 对练完成后生成 competency 碎片，包含能力维度评分 (1-5分)

---

## 4. 自适应机制的实现

### 4.1 核心概念: separateTag 与版本切换

Prosona 的自适应机制基于**学员画像驱动的内容版本路由**:

#### 4.1.1 数据链路

```
Introduction Activity (课前热身诊断)
  → QuizTaskHandler._analyze_student_profile()  (LLM 分析)
  → student_profile.type = "防御拖延型" / "利益博弈型" / "情绪对抗型"
  → 存储: Redis (student_profile:{context_id})
  → 传播: SCO → Activity → Project (逐层 bubble up)
```

#### 4.1.2 版本筛选逻辑

当 `tutor_mode = 1` 时，MultimodalTaskHandler 在 abefore 中执行版本筛选:

```
1. 从 Redis 获取 student_profile.type (如"防御拖延型")
2. 遍历 sco_segment_list
3. 每个 segment 有 separateTag 字段 (如"防御拖延型"/"利益博弈型"/..."情绪对抗型")
4. 只保留 separateTag 与学员类型匹配的 segment
5. 未获取到画像类型时使用兜底值 "利益博弈型"
```

#### 4.1.3 判定逻辑

学员画像分析使用 Prompt `v3/plugin/activity/introduction/analyze_profile`，判定过程:

| 维度 | 说明 |
|------|------|
| Q1_场景类型 | 学员描述的场景类型 → 指向某版本 |
| Q2_对方动机 | 对方动机分析 → 指向某版本 |
| Q3_学员风格 | 学员应对风格 → 指向某版本 |

维度组合状态: "三清" / "两清一模" / "一清两模" / "三模" / "超时退出"

最终通过多数投票决定版本路由。

#### 4.1.4 降级策略

| 场景 | student_profile 状态 | 行为 |
|------|---------------------|------|
| 学员跳过 introduction | None | segment 不筛选，全量展示 |
| LLM 分析失败 | None (Redis status=failed) | 同上 |
| LLM 超时 | None (Redis status=pending 超时) | 使用兜底类型"利益博弈型" |
| 旧课程包 (无 introduction) | None | 全量展示 |

### 4.2 student_profile 完整数据结构

```json
{
  "type": "防御拖延型",
  "assessment_records": [
    {
      "contentRoute": {
        "track": "防御拖延型",
        "source": "activity-id-xxx",
        "updatedAt": "ISO时间",
        "reasoning": "路由判定摘要"
      },
      "assessmentRecord": {
        "data": {
          "keyEvidence": [{"learnerQuote": "...", "interpretation": "..."}],
          "dimensionResults": {
            "Q1_场景类型": {"level": "清晰/模糊/无效", "finding": "..."},
            "Q2_对方动机": {...},
            "Q3_学员风格": {...}
          },
          "passStatus": "两清一模",
          "matchResult": "匹配过程详细描述"
        }
      }
    }
  ]
}
```

---

## 5. 记忆/上下文工程

### 5.1 ACE (Agentic Context Engineering) 概述

ACE 是 Stanford/Berkeley/SambaNova 2025 年提出的框架，核心理念是将 Agent 的 context 视为可演化的 Playbook。**当前 Prosona 尚未正式引入 ACE，但已规划了引入路径**。

#### 5.1.1 当前已有的 Context Engineering 能力

| 能力 | 现有实现 |
|------|---------|
| 分层上下文组装 | AOM 四层 Middleware 逐层注入 project/activity/SCO context |
| Task Prompt 加载 | `_load_task_prompt` 按 task_name 加载 TASK.md |
| Skill System Prompt | ModelEnhanceMiddleware 每次 model call 注入 skill 概览 |
| Skill Context 注入 | abefore 中注入 skill 完整内容 |
| 术语注入 | abefore 中读取 terminology，渲染模板注入 |
| 动态工具集 | handler.tools 按任务类型注册不同工具 |

#### 5.1.2 规划中的 ACE 引入方向

| Phase | 内容 | 状态 |
|-------|------|------|
| Phase 1 | Task Prompt 演化: abefore 中增加 Playbook 注入点，Handler 可选实现 `aget_playbook()` | 未实现 |
| Phase 2 | 反思闭环: aafter 后增加 areflect 调用，Reflector 分析轨迹，Curator 更新 Playbook | 未实现 |
| Phase 3 | Context Compaction: awrap_model_call 中引入 context budget 管理 | 未实现 |

### 5.2 Prompt 注入体系 (多层注入)

LLM 最终看到的消息序列 (以 SCO 层为例):

| 顺序 | 来源 | 注入频率 |
|------|------|---------|
| 0 | 全局 System Prompt (Langfuse `main`) | 一次/全局 |
| 0+ | Skill 概览 (ModelEnhanceMiddleware) | 每次 LLM 调用 |
| 1 | `<project_information>` XML | 一次/任务 |
| 2 | `<activity_item>` + `<sco_list>` XML | 一次/任务 |
| 3 | `<current_sco>` XML | 一次/任务 |
| 4 | `<language_rules>` | 一次/任务 |
| 5 | Skill 完整内容 (每个 Skill 一条 SystemMessage) | 一次/任务 |
| 6 | 术语表 | 一次/任务 |
| 7 | TASK.md 任务指令 | 一次/任务 |
| 8 | Handler.abefore() 返回的消息 | 一次/任务 |
| 9+ | 对话历史 (user/ai/tool messages) | 运行时追加 |

### 5.3 Prompt 管理

采用 Langfuse 外化管理，三个命名空间:

| 命名空间 | 用途 | 内容 |
|---------|------|------|
| `prosona` | 框架级 Prompt | system/main, tasks/TASK.md (root/project/activity/sco), skills/SKILL.md, commands/ |
| `aitutor` | 业务级 Prompt | tasks/sco-quiz/sco-content/sco-report 的 TASK.md, plugin/sco/multimodal/quiz/report 模板 |
| `side` | 辅助 Prompt | 边缘功能 |

本地 `resources/prompts/` 保存副本，通过脚本上传/拉取。

### 5.4 学员画像的构建和使用

#### 5.4.1 两套画像体系

**体系1: student_profile (已实现)**
- 产出方: Introduction Activity 中由 LLM 分析
- 核心字段: `type` (版本标识: 防御拖延型/利益博弈型/情绪对抗型)
- 用途: 自适应内容路由 (separateTag 筛选) + 个人报告生成
- 存储: Redis + State 逐层传播

**体系2: user_profile (已设计，未完全实现)**
- 设计目标: 通用的用户认知画像，支持多维度、可演化
- 核心模型: BaseUserProfile (snapshot + tracks)
- 推断方式: AI 自动推断 (不支持用户编辑)，通过异步任务系统完成
- 维度示例: cognitive (知识掌握), learning_style (学习偏好)
- 与 AOM 集成: 挂载在 ProjectTaskState 上

#### 5.4.2 使用方式

student_profile 被以下模块消费:

| 消费方 | 用途 |
|--------|------|
| MultimodalTaskHandler | 按 type 匹配 segment 的 separateTag 筛选教学素材 |
| IntroductionActivityTaskHandler | 从 SCO 子任务提升到 activity 状态 |
| LectureTaskHandler | 从 SCO 子任务提升到 lecture activity 状态 |
| ProjectMiddleware | 从 activity 提升到 project 状态 |
| 个人报告 | 报告 Prompt 注入版本上下文 (track, keyEvidence, dimensions, reasoning) |

### 5.5 对话上下文管理

#### 5.5.1 Checkpoint 持久化

- 存储后端: Memory (开发) / SQLite (单机) / PostgreSQL (生产)
- 两层 Thread ID: 主图用 context_id, 子图用 `context_id.task_name.task_id`
- 每个 checkpoint 包含: 完整 state 快照 + step 编号 + 元数据

#### 5.5.2 用户输入上下文

每次用户输入处理后，以结构化 feedback 写入 ToolMessage:

```xml
<system_feedback>
user answered: "我觉得..." | action: biz-sco-submit | params: {...}
</system_feedback>
```

三个维度: first_content (文本), action (业务动作), params (参数)

#### 5.5.3 断点恢复的四种场景

| 场景 | 触发 | 恢复方式 | status 变化 |
|------|------|---------|------------|
| 用户输入等待 | interrupt(None) | Command(resume=state) | 保持 running |
| 会话断开重连 | ACTION_SESSION_QUIT | ACTION_SESSION_START → aresume | running→paused→running |
| 业务中断恢复 | end_task(is_interrupt=True) | recover_task | running→interrupted→recovering→running |
| 异常恢复 | API 超时/LLM 错误 | 重入 abefore_agent, status=running 跳过初始化 | 保持 running |

---

## 6. 个人报告系统

### 6.1 整体架构

个人报告系统是一个独立的 LangGraph 子图 (`personal_report_graph.py`)，由 `PersonalReportTaskHandler` 触发。

#### 6.1.1 核心文件

| 文件 | 职责 |
|------|------|
| `app/handlers/personal_report_task_handler.py` | 报告触发入口、工具定义、卡片渲染、前端协议 |
| `app/graph/review/personal_report_graph.py` | Graph 节点定义 + 图编排 + 报告生成主流程 |
| `app/graph/review/personal_report_common.py` | 公共工具函数、Prompt 常量、API 调用封装 |
| `app/graph/review/personal_report_fragments.py` | 异步碎片生成 (学习过程中实时产生) |
| `app/schema/personal_report_types.py` | 所有数据模型 (Pydantic) |

#### 6.1.2 触发链路

```
PersonalReportTaskHandler.abefore()
  → 切换讲者布局 + 鼓掌协议 + 注入口播脚本
  → 模型播报祝贺+报告预告
  → _builtin_load_personal_report_data (阻塞等待, 超时600s)
      → run_personal_report_workflow()
          → 报告 Graph 执行
  → 分3段下发报告 (display_part_1/2/3)
```

### 6.2 数据采集机制: 异步碎片

碎片在**学习过程中实时生成**，存储到 Java 后端，报告生成时拉取汇总。

| 碎片类型 | 生成时机 | 生成函数 | Prompt |
|---------|---------|---------|--------|
| **trait** (学习特质) | SCO 对话完成后 | `generate_trait_fragment_for_sco()` | `project_review_generate_trait_fragment` |
| **trait** (对练特质) | 对练活动完成后 | `generate_trait_fragment_for_drill_activity()` | 同上 |
| **cognitive** (认知转化) | Quiz 答题闭环后 | `generate_cognitive_fragment_for_quiz_sco()` | `project_review_generate_transformation_fragment` |
| **competency** (能力评估) | 对练完成后 | `maybe_generate_competency_fragment_for_drill_sco()` | `project_review_competences_analysis` |

碎片拉取: `_wait_fragment_models()` 从 Java API 拉取，轮询机制最长等待 180s，每 5s 检查一次。

### 6.3 报告 Graph 拓扑 (8大模块)

```
第一层 (并行6节点):
  base_info → 基础用户信息
  highlight_moments → 高光时刻 (LLM 精选 top3)
  competences_analysis → 能力成长 (等待 competency 碎片)
  transformation → 认知转化 (等待 cognitive 碎片)
  learning_performance → 学习表现 (tracking API + 对话历史)
  skill_improvement → 技能提升 (纯数据聚合, 无 LLM)

第二层:
  growth_performance → 成长表现 (汇总 trait碎片 + 前面结果, 3个子流程: 特质/转变/优势)

第三层 (并行2节点):
  comprehensive_evaluation → 综合评估 (全部来自前置节点)
  development_advice → 行动建议 (认知+技能+能力)

第四层:
  action_summary → 行动摘要 (基于行动建议)

第五层:
  aggregate_results → 创建 Artifact + 保存到 Java API
```

### 6.4 报告写入 (三步)

| 步骤 | 目标 | 用途 |
|------|------|------|
| 1. 创建 Artifact | Artifact 存储服务 | 前端通过 artifact_id 获取并渲染完整报告 |
| 2. 关联 Artifact | `tutor_project_user_artifact` 表 | 建立用户+项目→artifact_id 关联 |
| 3. 结构化保存 | `tutor_user_report_base` 及子表 | 后台查询、统计、管理列表 |

### 6.5 报告前端下发

报告数据**累积下发**:
- Part 1: 学习表现 + 认知转化 + 技能提升 + 能力成长
- Part 2: Part 1 全部 + 综合评估 + 成长表现 + 高光时刻
- Part 3: Part 1+2 全部 + 行动建议

共 11 条前端可见消息 (讲者布局 + 鼓掌 + 祝贺口播 + 预告口播 + loading + 报告卡片 + 3x布局切换 + 3x内容卡片)。

### 6.6 版本轨道注入

报告生成时从 student_profile 提取版本数据，注入不同模块的 Prompt:

| 模块 | 注入的字段 |
|------|---------|
| 认知转化 (2处) | track + keyEvidence |
| 学员特质 (2处) | track + dimensions + keyEvidence |
| 关键转变 (1处) | track |
| 综合评估 (1处) | track + reasoning + dimensions |
| 行动建议 (1处) | track + reasoning + dimensions + keyEvidence |

---

## 7. 对练插件系统

### 7.1 架构设计

对练模块作为独立 pypi 包 `drill-aom-plugins` 发布，与主框架解耦:

- 通过 `handler_registry` 注入 4 个 Handler
- 不修改框架代码即可扩展对练玩法
- 每个 Handler 有独立的 State Schema、Tools、Skills

### 7.2 四个对练 Handler

#### 7.2.1 GuideTaskHandler (导学)

- 职责: 对练前导学，加载剧本，注入 `<script_content>` 到 SystemMessage
- 工具: `_builtin_conversation` + `PracticeGuideToolBuilder().build()`
- 对应老项目: `sco_guide_plugin.py`

#### 7.2.2 DeductionTaskHandler (演绎)

- 职责: 对练核心，AI 扮演客户角色与学员对话
- 工具: `ProgressToolBuilder` + `ActorDeduceToolBuilder` + `OpeningNarrateToolBuilder` + `GoalEvalToolBuilder`
- 特殊处理: `awrap_model_call` 在 AI 消息上附加导演角色标签
- State 扩展: round(轮次), opening_remarks_outputted(开场白状态), deduction_started(演绎状态), deduction_goal_eval_result(目标评估结果)
- 对应老项目: `sco_simulator_plugin.py`

#### 7.2.3 ReviewTaskHandler (复盘)

- 职责: 对练后复盘，加载剧本，可调出演绎历史对话记录卡片
- Skills: `["review"]`
- aget_card: `display_deduction_chat_history` → 构建对话记录卡片
- 对应老项目: `sco_replay_plugin.py`

#### 7.2.4 ReportTaskHandler (对练报告)

- 职责: 对练报告生成并提交
- aget_card: `display_report` → 发送 A2A 消息 + 调用报告生成
- 这是新增的功能，老项目无对应

### 7.3 扩展方式

扩展新的对练玩法需要:

1. 继承 `TaskHandler` 或 `EnhanceTaskHandler`
2. 定义 `name` (注册键)、`tools` (工具列表)、`skills` (技能)
3. 如需自定义 State，定义 `state_schema`
4. 实现生命周期钩子 (abefore/aafter/awrap_model_call 等)
5. 在 `__main__.py` 的 `create_handler_registry` 中注册

```python
handler_registry = create_handler_registry(
    task_handlers=[
        ...,
        MyNewDrillHandler(),  # 新增的对练 Handler
    ],
)
```

---

## 8. 与产品层面的映射

### 8.1 Prosona 已实现的能力

#### 8.1.1 核心教学能力

| 能力 | 实现状态 | 实现方式 |
|------|---------|---------|
| **AI 授课 (多模态)** | 已实现 | MultimodalTaskHandler: 视频播放、PPT展示、口播讲解 |
| **AI 问答测验** | 已实现 | QuizTaskHandler: 苏格拉底式启发、多轮对话、LLM 评分 |
| **AI 对练 (角色扮演)** | 已实现 | drill-aom-plugins: 导学→演绎→复盘→报告四阶段 |
| **个人学习报告** | 已实现 | PersonalReportTaskHandler + 独立报告 Graph (8大模块) |
| **授课小结** | 已实现 | LectureTaskHandler: 学习数据统计 + 高光时刻 + 学习建议 |
| **自适应内容路由** | 已实现 | student_profile + separateTag + tutor_mode=1 筛选 |

#### 8.1.2 框架级能力

| 能力 | 实现状态 | 实现方式 |
|------|---------|---------|
| **AOM 课程包解析** | 已实现 | 4层 Middleware + 统一 API |
| **嵌套任务执行** | 已实现 | _builtin_start_task 驱动的子图嵌套 |
| **断点恢复** | 已实现 | Checkpoint + interrupt/resume 机制 |
| **会话暂停/恢复** | 已实现 | apause/aresume + SESSION_QUIT/START |
| **模型降级兜底** | 已实现 | ModelFallbackMiddleware (doubao→qwen3) |
| **多语言支持** | 已实现 | language_rules 注入 + locale 配置 |
| **Prompt 外化管理** | 已实现 | Langfuse 三个命名空间 |
| **语音合成 (TTS)** | 已实现 | SpeakerMiddleware + TTS 配置 |
| **A2A 消息协议** | 已实现 | 5种标准 biz 协议 (lifecycle/layout/display/project/report) |
| **并发控制** | 已实现 | Context Lock 机制 (同一用户串行) |
| **异步碎片采集** | 已实现 | 学习过程中实时生成 trait/cognitive/competency 碎片 |

#### 8.1.3 数据分析能力

| 能力 | 实现状态 | 说明 |
|------|---------|------|
| **学员画像 (版本路由)** | 已实现 | 三类型判定: 防御拖延型/利益博弈型/情绪对抗型 |
| **Quiz 评分** | 已实现 | LLM 评分 + tracking 上报 |
| **高光时刻分析** | 已实现 | 异步高光分析存 Redis |
| **探索/反思记录** | 已实现 | tracking API 上报 |
| **能力维度评估** | 已实现 | 对练 competency 碎片 (1-5分) |
| **认知转化分析** | 已实现 | cognitive 碎片 (学习前后认知对比) |
| **学习特质分析** | 已实现 | trait 碎片 (特质关键词+描述+证据) |

### 8.2 已设计但尚未完全实现的能力

| 能力 | 设计文档 | 当前状态 |
|------|---------|---------|
| **ACE Context Engineering** | `ace_context_engineering.md` | 仅设计方案，3个 Phase 均未实现 |
| **通用用户画像 (user_profile)** | `user_profile.md` | 数据模型已定义，异步任务推断系统未实现 |
| **异步 Job 系统** | `user_profile.md` 中引用 | `create_async_job`/`wait_async_job` 机制，用于画像推断 |
| **上下文压缩** | `architecture_agent_mechanism.md` | 仅有 COMPRESSIBLE_KEY 标记，无实际压缩逻辑 |
| **Playbook 演化** | `ace_context_engineering.md` | Task Prompt 仍为静态文件 |
| **Handler 级 Memory** | `ace_context_engineering.md` | 跨 session 学习能力未实现 |

### 8.3 产品规划可能关注但 Prosona 尚不支持的能力

基于架构分析，以下是 Prosona 当前架构**不直接支持但可扩展**的能力:

| 产品需求方向 | 架构可行性 | 扩展路径 |
|-------------|-----------|---------|
| **多轮知识点追踪** | 中 | 需在 user_profile 中增加 knowledge_level 字段，接入异步推断 |
| **动态难度调节** | 中 | 可通过 user_profile + awrap_model_call 注入难度指令 |
| **个性化学习路径推荐** | 中 | 可在 ProjectMiddleware 层根据 user_profile 调整 activity 顺序 |
| **实时情绪识别** | 低 | 需新增 Middleware 或 Handler 层的情绪分析，架构支持但需额外模型 |
| **协作学习** | 低 | 当前架构为单学员会话，多人协作需重构 Executor 层 |
| **学习进度看板** | 高 | 数据已通过 tracking API 上报，前端可直接对接 |
| **课程包在线编辑** | 无关 | 属于编创端 (AOM Editor) 职责，非演绎端 |
| **多模型并行推理** | 中 | ModelFallbackMiddleware 已支持模型切换，可扩展为并行竞赛 |
| **长期学习记忆** | 低 | 需实现 ACE Phase 3 的 Handler 级 Memory，或对接外部记忆系统 |

### 8.4 架构优势总结

1. **高度可扩展**: Handler + Middleware 双注册表模式，新增教学类型只需添加 Handler
2. **LLM 原生驱动**: 与老项目的程序化驱动不同，LLM 自主决策任务切换
3. **多层 Prompt 工程**: 7层上下文注入 + Langfuse 热更新，无需改代码
4. **鲁棒的断点恢复**: 4种恢复场景全覆盖，checkpoint 自动持久化
5. **解耦的对练系统**: 独立 pypi 包，可独立版本迭代
6. **完善的报告系统**: 8大模块并行生成 + 异步碎片采集，数据丰富

### 8.5 架构风险/待改进

1. **无上下文压缩**: 长对话可能超出 token 限制，ACE Phase 3 未实现
2. **缓存无淘汰**: SubGraph 缓存无自动淘汰机制，频繁创建可能内存增长
3. **无 Checkpoint 清理**: 长期运行需外部机制清理过期 checkpoint
4. **画像维度单一**: 当前仅支持 3 种类型的版本路由，通用 user_profile 未落地
5. **碎片依赖外部**: 碎片存储在 Java 后端，拉取有延迟 (最长 180s)
6. **串行并发**: 同一用户无法并行处理多个请求 (Context Lock 限制)
