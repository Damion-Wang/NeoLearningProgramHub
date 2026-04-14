# 对练模块完整技术栈分析报告

> 分析日期: 2026-04-13
> 分析范围: 对练AOM数据、对练剧本、SIDE(drill-mate)项目代码

---

## 目录

1. [对练剧本结构分析](#1-对练剧本结构分析)
2. [对练AOM与授课AOM的结构差异](#2-对练aom与授课aom的结构差异)
3. [对练四阶段的技术实现](#3-对练四阶段的技术实现)
4. [能力评估机制](#4-能力评估机制)
5. [对练与产品需求的映射](#5-对练与产品需求的映射)
6. ["半结构化内容驱动"的证据](#6-半结构化内容驱动的证据)
7. [关键发现与总结](#7-关键发现与总结)

---

## 1. 对练剧本结构分析

### 1.1 剧本的整体组织架构

对练剧本是一个大型JSON结构，顶层包含`artifactId`和`content`两个字段。`content`是一个Markdown格式的富文本，内嵌JSON（演员数字人配置），按以下层级组织：

```
剧本
├── 主题名称
├── 业务背景
├── 具体场景（时间/地点/环境/触发事件）
├── 任务目标
├── 行为目标（4个）
├── 核心能力（4项，对应AOM的competencyGoals）
├── 核心知识点（PIN三要素/POWER利益沟通法/推拉沟通法）
├── 选取能力和知识点的理由
├── 核心挑战
├── 常见失败模式（4种）
├── 预期错误类型（判断/策略/表达/情绪 4类）
├── 设定角色
│   ├── 用户角色信息（营销策划主管）
│   │   ├── 基本信息（名称/性别/年龄/职位）
│   │   ├── 角色背景
│   │   └── 角色约束（明令禁止/不建议行为/可用资源/决策权限）
│   └── 演员角色信息（张楠 - 设计部主管）
│       ├── 基本信息
│       ├── 数字人配置（JSON: unique_id/type/image_url/icon_url/text/voice_info）
│       └── 专业背景
├── 背景信息
│   ├── 完整背景故事（演员知道的/不知道的客观事实）
│   ├── 与对方的关系
│   ├── 过往互动
│   ├── 相关历史
│   └── 过往沟通经历
├── 心理动态
│   ├── 角色目标（显性目标P/隐性目标I&N）
│   ├── 表面诉求 vs. 真实需求
│   ├── 顾虑
│   ├── 激怒点
│   ├── 软化点
│   ├── 底线
│   └── 可协商项
├── 行为特征
│   ├── 性格特点
│   ├── 说话风格
│   ├── 触发点/软化点
│   └── 行为模式（6条递进式行为规则）
├── 隐藏信息（防剧透指令）
├── 编写具体场景
│   ├── 场景标题
│   ├── 沉浸式场景描述
│   ├── 演员开场白
│   ├── 演员心理动态
│   ├── 陷阱列表
│   ├── 挑战列表
│   ├── 成功标准（4个，对应4个阶段的测试通过条件）
│   └── 失败信号
├── 能力触发图谱
│   ├── 阶段1: 释放情绪与探寻立场（P-降对抗）
│   ├── 阶段2: 深挖利益与核心需求（I/N-找动机）
│   ├── 阶段3: 资源交换与重组共识（E-换资源）
│   └── 阶段4: 确认落地与闭环跟进（R-强执行）
│       每个阶段包含：
│       ├── 阶段目标
│       ├── 场景描述
│       ├── 决策点列表（决策名/上下文/正确反应/常见错误）
│       ├── 所需核心技能
│       └── 所需知识点
└── 设定技能阶梯
    ├── 情绪破冰与关系建立（L1-L5）
    ├── 利益与需求深度挖掘（L1-L5）
    ├── 资源交换与双赢构建（L1-L5）
    └── 闭环落地与行动承诺（L1-L5）
```

### 1.2 关键字段详解

#### 角色设定
剧本定义了两个角色：**用户角色**和**演员角色**，信息极其详细。

**用户角色**（学员扮演）:
- 有明确的"约束系统"——分为`明令禁止`（严禁绕过主管找基层/严禁以高层名义强压）、`不建议行为`（不要贬低设计工作/不要查排期表找茬）、`可用资源`（两个常规品宣海报需求/战报撰写权和奖金分配建议权）、`决策权限`（可延后自己部门需求/可承诺战报联合发起方署名）
- 这些约束直接控制了"正确答案空间"

**演员角色**（AI扮演）:
- 包含70+个字段的详细人物画像（通过`RoleplayActorRoleSchema`定义）
- 核心控制字段：`explicit_goals`（显性目标）、`implicit_goals`（隐性目标）、`triggers`（激怒点）、`softeners`（软化点）、`true_need`（真实需求）、`bottom_line`（底线）、`negotiable_items`（可协商项）、`hidden_situation`（隐藏信息）、`behavioral_patterns`（行为模式）
- 这些字段构成了AI行为的"指挥系统"

#### 场景描述
- `business_context`: 业务背景（宏观环境）
- `business_scenario`: 具体场景（微观环境：时间、地点、氛围）
- `opening_line`: 演员开场白（AI首句台词的锚定）
- `traps_and_tests`: 陷阱列表（AI设置的考验点）
- `psychological_dynamics`: 心理动态（真实需求/恐惧/触发点/软化点）

#### 对话策略与情绪控制
剧本通过`行为模式`（behavioral_patterns）定义了AI的**递进式反应链**：
1. 一上来先冰山态度，用SOP堵死（推）
2. 如果用户施压 -> 翻旧账，升级对抗
3. 如果用户用"拉" -> 情绪由冷硬转委屈
4. 如果用户拿出尊重+等价置换 -> 展现专业素养和配合度
5. **关键规则**: 按"客观困难 -> 表层顾虑 -> 深层利益"逐层释放信息，用户不问则不升级
6. **关键规则**: 对用户方案优先质疑可行性，促使完善，不主动提供替代方案

另有**防剧透指令**：AI绝对不能主动提出"把常规海报延期"的方案，必须等用户自己想到。

#### 评估标准
剧本中的**成功标准**直接映射到4个能力阶段：
1. 情绪降温（拉力测试通过）
2. 痛点确立（PIN-I/N测试通过）
3. 实质置换（POWER-E测试通过）
4. 行动闭环（推力测试与POWER-R通过）

**技能阶梯**为每个能力提供了L1-L5的5级量化标准，与AOM中的`rubric`完全对应。

### 1.3 代码中的剧本Schema映射

代码文件`schemas/scripts.py`定义了`RoleplayScriptSchema`，包含5个顶层字段：

| 剧本字段 | Schema字段 | 说明 |
|---------|-----------|------|
| 角色设定 | `roles: RoleplayRolesSchema` | 含user_role和actor_role |
| 主题+知识点+背景 | `theme: RoleplayThemeSchema` | 含business_context/key_skills/core_knowledge_points等 |
| 场景+心理+阶段 | `scenario: RoleplayScenarioSchema` | 含opening_line/skill_trigger_map/psychological_dynamics等 |
| 数字人配置 | `actor_config: RoleplayActorConfigSchema` | 含voice_info/image_url等 |
| 技能阶梯 | `skill_ladders: list[RoleplaySkillLadderSchema]` | L1-L5分级标准 |

剧本从Markdown富文本被解析成这个结构化JSON，存储在artifact服务中，运行时通过`jsonArtifactId`和`mdArtifactId`分别获取结构化版本和纯文本版本。

---

## 2. 对练AOM与授课AOM的结构差异

### 2.1 结构对比

| 维度 | 授课AOM (横向协作AOM.txt) | 对练AOM (横向协作对练AOM) |
|------|--------------------------|--------------------------|
| **activityType** | `lecture` | `roleplay` |
| **competencyGoals** | 空数组`[]` | 4个完整能力目标，每个含keyBehaviors和rubric(1/3/5三级) |
| **directScoContent** | 完整的scoFlow结构（含PPT/Quiz/segmentList/interactionPoint） | `null` |
| **resourceId** | `null` | `"692299255773803438"` |
| **artifactId** | `null` | `"692295802813035605"` |
| **competencyArtifactId** | 无此字段 | `"692295559451128817"` |
| **modules数量** | 多个activity（lecture类型） | 单个activity（roleplay类型） |
| **interactionPoint** | 包含blueprint/rule/description/aiTutorDialogue/interactionType | 无（通过剧本替代） |
| **excludeReport** | 无此字段 | `1`（排除报告?） |
| **learnerProfile** | 空对象 | 空对象 |

### 2.2 核心差异解读

#### 差异一: `directScoContent = null` 意味着什么

在授课AOM中，`directScoContent`是教学内容的直接载体，包含：
- `scoFlow`: 教学流程（PPT段落、Quiz题目）
- `interactionPoint`: 交互控制点（含blueprint/rule/solution）
- `segmentList`: 内容片段列表

对练AOM中`directScoContent`为`null`，意味着：
1. **对练不走"内容段落驱动"的授课逻辑**——没有PPT片段、没有segmentList、没有按段落编排的教学流
2. **对练的内容完全外置于artifact服务中**——通过`resourceId`和`artifactId`关联外部剧本资源
3. **对练的流程由"剧本+Agent"组合驱动**，而非AOM的scoFlow控制

#### 差异二: 资源引用三件套

对练AOM引入了三个关键外部引用：
- `resourceId: "692299255773803438"` — 指向资源服务中的剧本资源（可能包含原始的Markdown/JSON剧本文件）
- `artifactId: "692295802813035605"` — 指向artifact服务中的剧本产物（与剧本文件中的`artifactId`完全一致）
- `competencyArtifactId: "692295559451128817"` — 指向能力评估标准的artifact（可能包含rubric的详细评估矩阵）

这三个ID构成了"资源-内容-评估"的三角关联。

#### 差异三: competencyGoals的位置

授课AOM的`competencyGoals`为空，能力评估不是授课的主要关注点。

对练AOM将`competencyGoals`提升到了项目顶层，包含4个完整的能力目标，每个目标含：
- `competencyKey`: 能力唯一标识
- `competencyName`: 能力名称
- `definition`: 能力定义
- `level`: 目标等级（如"L3 策略性表现"）
- `keyBehaviors`: 关键行为指标
- `rubric`: 评分量规（1级薄弱/3级一般/5级卓越）

这表明**对练的核心目的是能力评估**，而非知识传递。

#### 差异四: 从"blueprint/rule/solution"到"剧本全控"

授课AOM中每个交互点通过三元组控制AI行为：
- `blueprint`: AI的教学策略蓝图（如"先破后立的教学逻辑"）
- `rule`: 触发/通关条件（如"播放完毕"/"两项清晰一项模糊即通关"）
- `solution`: AI的具体行为准则（如"引导三步走"）

对练AOM没有这些字段，取而代之的是**剧本的全方位行为规范**：
- 剧本中的`behavioral_patterns` = blueprint（行为策略）
- 剧本中的`success_criteria` = rule（通关条件）
- 剧本中的`decision_points.correct_approach` = solution（正确做法参考）
- 剧本中的`triggers/softeners/bottom_line` = 比solution更细粒度的情绪和博弈控制

---

## 3. 对练四阶段的技术实现

### 3.1 总体架构

drill-mate项目使用`agentickit`框架，核心架构如下：

```
DeductionAgent (ProsonaA2AStreamAgenticExecutor)
└── create_prosona_agent()
    ├── session_handler: DeductionSessionHandler
    └── task_handlers:
        ├── GuideTaskHandler     (drill-guide)     — 导学
        ├── DeductionTaskHandler (drill-deduction)  — 演绎/Roleplay
        ├── ReviewTaskHandler    (drill-review)     — 反思/复盘
        └── ReportTaskHandler    (drill-report)     — 报告
```

所有TaskHandler共享同一个ProsonaAgent图，通过`name`字段区分任务类型。每个Handler在`abefore`阶段都会：
1. 通过`get_play_script()`从artifact服务获取剧本（结构化JSON + Markdown纯文本）
2. 将剧本注入`SystemMessage`中的`<script_content>`标签

项目定义了6种角色（通过消息tag系统实现权限隔离）：

| 角色 | 常量 | 可见性 |
|------|------|--------|
| user | `USER` | 看不到director的消息 |
| director | `DIRECTOR` | 可以看到所有消息 |
| actor | `ACTOR` | 看不到coach和narrator的消息 |
| coach | `COACH` | 看不到director给actor的指令 |
| narrator | `NARRATOR` | 可以看完整剧本 |
| guider | `GUIDER` | 导学角色 |

### 3.2 导学（Guide）阶段

**实现文件**: `guide_task_handler.py` + `guide_tools.py` + `enums.py`

**流程设计**: 导学阶段分为三个子步骤（`GuideStage`枚举）：

1. **`bg-intro`（背景介绍）**: 展示角色信息和场景背景
   - 从structured_script提取`roles`（用户角色+演员角色）
   - 提取`theme.business_context`和`theme.business_scenario`
   - 提取`actor_config`（数字人形象/头像）
   - 合并用户真实头像和姓名（从user_profile获取）
   - 通过`send_display_message()`发送卡片到前端

2. **`goal-intro`（目标介绍）**: 展示对练目标
   - 提取`theme.main_goals`（主目标）
   - 提取`theme.practice_goals`（分项目标）
   - 以卡片形式展示

3. **`skill-intro`（技能介绍）**: 展示所需技能和知识点
   - 提取`theme.key_skills`（核心技能列表）
   - 提取`theme.core_knowledge_points`（核心知识点列表）
   - 以卡片形式展示

**工具**: `PracticeGuideToolBuilder` 构建的`practice_guide`工具。AI调用此工具时需指定`action`参数（bg-intro/goal-intro/skill-intro），工具自动从剧本提取对应内容，发送卡片到前端，然后在ToolMessage中返回卡片数据的JSON，附带system_feedback提示AI"用专业、礼貌、简洁的方式向用户总结已展示的关键信息"。

**关键机制**: 通过`shown_stages`状态追踪已展示的阶段，确保三个阶段依次完成。

### 3.3 演绎（Deduction）阶段

**实现文件**: `deduction_task_handler.py` + `actor_tools.py` + `narration_tools.py` + `progress_tools.py` + `goal_eval.py` + `cocah_tools.py`

**这是对练的核心阶段**，架构设计最为复杂，采用了"导演-演员"分离模式。

#### 3.3.1 角色分工

| 角色 | 负责内容 | 技术实现 |
|------|---------|---------|
| **Director（导演）** | 解读剧本、编排每轮对话的场景转换/情绪变化/行动指令 | DeductionTaskHandler的system_prompt + awrap_model_call为AI消息添加director标签 |
| **Actor（演员）** | 按照导演指令和剧本人设进行表演 | actor_tools.py 独立调用LLM |
| **Narrator（旁白）** | 输出开场白/场景描述 | narration_tools.py 独立调用LLM |
| **Coach（教练）** | 在用户困难时给予引导/正面反馈 | cocah_tools.py（当前被注释掉） |

#### 3.3.2 演绎流程

```
用户进入演绎阶段
   │
   ▼
Director（主LLM）分析剧本 → 决定调用哪个工具
   │
   ├── 第一步: 调用 opening_narrate → Narrator LLM 生成沉浸式场景描述（旁白）
   │   └── 返回NarrationSignaling信号到前端
   │
   ├── 第二步: 调用 actor_deduce → Actor LLM 输出开场白（张楠的第一句话）
   │   └── 附带数字人TTS配置（voice_name/speaking_rate/pitch等）
   │
   ├── 等待用户输入...
   │
   ├── 每轮对话:
   │   ├── Director分析用户发言，生成"导演指令"（instructions）
   │   │   指令包含三部分:
   │   │   1. 场景转换（如紧张升级/话题转移）
   │   │   2. 情绪变化（如从防御到观望）
   │   │   3. 行动指令（如试探用户底线/抛出旧账）
   │   │
   │   ├── 调用 actor_deduce(instructions) → Actor LLM 根据指令表演
   │   ├── 调用 notice_progress(progress) → 输出进度百分比到前端
   │   └── 等待用户下一轮输入...
   │
   └── 结束时: 调用 goal_eval → 输出目标达成结果（0/1）
       └── 通过A2A消息发送dedu-result到前端
```

#### 3.3.3 AI行为控制机制

**Director（导演）如何控制Actor（演员）**:

导演的system_prompt（定义在`deduction_agent.py`）将其设定为"演绎专家Neo"，其核心职责是"编排任务"和"执行任务"。它通过`ActorDeduceInput.instructions`字段向演员下达指令。

**Actor的行为控制链**:
1. **System Prompt**: 从`tasks/drill-deduction/tools/actor-deduce/system-prompt.md`加载（Langfuse/Prompt管理服务），注入大量剧本数据：
   - `role_name`: 角色名（张楠）
   - `opening_scene`: 场景描述
   - `business_scenario`: 业务场景
   - `role_background`: 演员知道的客观事实
   - `director_instructions`: 当前轮的导演指令
   - 演员角色的全部字段（goals/triggers/softeners/true_need/bottom_line/behavioral_patterns等）
   - `user_role_name`: 用户角色名
   
2. **Chat History**: Actor只能看到过滤后的对话历史（排除coach和narrator的消息），确保角色不会"出戏"

3. **消息标记**: Actor的输出被标记为`__role__:actor`，附带角色名、头像、TTS配置，前端可以区分显示

**关键设计: `awrap_model_call`中间件**

`DeductionTaskHandler`重写了`awrap_model_call`方法，在Director的每次LLM调用返回后，自动为所有AIMessage附加`__name__: director`和`__tags__: [__role__:director]`标签。这确保Director的思考过程（如调用工具的推理）对用户不可见。

**关键设计: 消息权限隔离**

通过`MESSAGE_EXCLUDE_TAGS`常量定义了每个角色看不到哪些消息：
- User看不到Director的消息
- Actor看不到Coach和Narrator的消息
- Director看不到Narrator的消息

这意味着Actor在表演时不知道旁白说了什么，只基于对话历史和导演指令行动。

#### 3.3.4 进度跟踪

`ProgressToolBuilder`实现了实时进度追踪：
- Director在每轮对话后调用`notice_progress`工具
- 输出JSON格式的进度数据：`previous_progress`/`current_progress`/`current_conversation_round`
- 进度为百分制（100=完成），只能增不能减
- 通过A2ABizDataMessage发送`progress`类型的信号到前端

#### 3.3.5 目标达成评估

`GoalEvalToolBuilder`实现了最终的目标达成判断：
- Director在演绎结束时调用`goal_eval`工具
- 输出JSON：`{"reason": "达成/未达成原因", "result": 1或0}`
- 通过A2ABizDataMessage发送`dedu-result`类型的信号到前端
- 结果存入state的`deduction_goal_eval_result`，供后续报告阶段使用

#### 3.3.6 Coach（教练）——当前被禁用

`CoachGuidanceToolBuilder`已实现但在`DeductionTaskHandler.tools`中被注释掉：
```python
tools = [
    ProgressToolBuilder().build(),
    ActorDeduceToolBuilder().build(),
    # CoachGuidanceToolBuilder().build(),  # <-- 被注释
    OpeningNarrateToolBuilder().build(),
    GoalEvalToolBuilder().build(),
]
```

Coach的设计意图是在用户困难时提供引导、用户表现好时给予正面反馈。被禁用可能是因为：
1. 教练介入会打断roleplay的沉浸感
2. 教练的引导逻辑还不够成熟
3. 将引导职能转移到了Review（复盘）阶段

### 3.4 反思（Review）阶段

**实现文件**: `review_task_handler.py`

**实现方式**: ReviewTaskHandler继承自`EnhanceTaskHandler`，声明了`skills = ["review"]`，表明它使用了Prosona框架的Skill机制来驱动复盘对话。

**核心流程**:
1. `abefore`: 加载剧本到SystemMessage
2. `aget_card`: 支持`display_deduction_chat_history`动作——
   - 从state获取演绎阶段的SCO（通过`get_target_sco(state, TASK_DEDUCTION)`）
   - 调用`get_sco_messages()`获取演绎阶段的完整对话记录
   - 构建`record_card`返回给前端展示

**苏格拉底追问的实现**:

Review阶段的具体追问逻辑不在Handler代码中直接实现，而是通过以下机制间接实现：
1. `skills = ["review"]` —— 引用了Prosona框架预定义的"review" skill，该skill内置了复盘对话的prompt模板
2. 剧本内容通过`<script_content>`注入SystemMessage，为LLM提供"什么是好的表现"的参照
3. 演绎对话记录通过`display_deduction_chat_history`卡片呈现，LLM可以基于实际对话进行针对性追问
4. 使用了`_builtin_conversation`和`_builtin_write_scratchpad`两个内置工具——scratchpad允许AI记录复盘过程中的分析笔记

**推测的苏格拉底追问模式**:
- AI基于演绎对话记录，识别用户的关键决策点
- 对照剧本中的`decision_points`和`success_criteria`，发现用户的不足
- 通过开放式提问引导用户自己发现问题（"当张楠提到上个月的事时，你当时是怎么想的？"）
- 逐步引导用户从现象（P）深入到利益（I）和需求（N）

### 3.5 报告（Report）阶段

**实现文件**: `report_task_handler.py` + `report_tools.py` + `report/data_reporting.py` + `schemas/report.py`

这是对练模块中**最重的阶段**，涉及多次LLM调用和复杂的数据上报。

#### 3.5.1 报告生成流程

```
ReportTaskHandler.abefore()
   │ 加载剧本（结构化+纯文本）
   ▼
ReportTaskHandler.aget_card("display_report")
   │
   ├── 发送"report start"信号到前端
   │
   ▼
generate_sparring_report_and_submit()
   │
   ├── 收集上下文数据:
   │   ├── 业务背景 (business_context)
   │   ├── 主要目标 (main_goals)
   │   ├── 练习目标 (practice_goals)
   │   ├── 核心知识点 (core_knowledge_points)
   │   ├── 核心技能 (key_skills)
   │   ├── 技能评分阶梯 (skill_ladders)
   │   ├── 演绎对话记录 (dialogue_record)
   │   └── 目标达成结果 (deduction_goal_eval_result)
   │
   ├── 第一次LLM调用: report_scoring_prompt.md
   │   → 生成评分报告 (part_report)
   │   包含: total_score, target_reached, skill_evaluation[], knowledge_evaluation[]等
   │
   ├── 并发调用（asyncio.gather）:
   │   ├── generate_highlight()
   │   │   ├── 获取所有历史演练的技能评分 (get_all_skill_evaluations)
   │   │   ├── 获取复盘对话记录 (review_tutor_session_record)
   │   │   └── 第二次LLM调用: report_highlight_prompt.md → 高光时刻
   │   │
   │   └── generate_key_improvement()
   │       ├── 获取所有历史演练对话记录 (all_dialogue_records)
   │       └── 第三次LLM调用: report_key_improvement.md → 关键能力提升
   │
   ├── 合并三部分报告: {part_report, highlight_content, key_improvement}
   │
   ├── 存储到artifact服务 (artifact_create)
   │
   └── 异步上报数据 (send_roleplay_report)
       ├── drill_achieve_ptg      — 对练目标达成
       ├── drill_score             — 对练Activity评估结果
       ├── drill_dim_score         — 对练评分项评估结果
       ├── drill_kng_mastery       — 知识点掌握情况
       ├── drill_highlight_card    — 高光时刻卡片
       └── drill_key_competency_improvement — 关键能力提升
```

#### 3.5.2 报告数据结构（ReportActionCodeEnum）

| 指标代码 | 动作代码 | 说明 |
|---------|---------|------|
| goal_achievement | drill_achieve_ptg | 对练目标达成百分比+里程碑 |
| activity_evaluation | drill_score | 总分/是否通过/综合反馈 |
| dimension_evaluation | drill_dim_score | 各维度得分/亮点/薄弱点/改进建议 |
| knowledge_mastery | drill_kng_mastery | 知识点掌握程度 |
| highlight_card | drill_highlight_card | 高光时刻卡片 |
| key_competency_improvement | drill_key_competency_improvement | 关键能力提升 |
| error_behavior | drill_error_behavior | 错误行为（已定义但未见上报逻辑） |
| error_correction | drill_error_correction | 错误修正行为（已定义但未见上报逻辑） |

#### 3.5.3 报告的三次LLM调用

1. **评分报告**（report_scoring_prompt.md）: 基于剧本目标+技能阶梯+对话记录+目标达成结果，生成skill_evaluation（各技能维度得分+评价）和knowledge_evaluation（知识点掌握评分）
2. **高光时刻**（report_highlight_prompt.md）: 基于历次演练的技能得分趋势+本次复盘对话记录，生成highlights数组
3. **关键提升**（report_key_improvement.md）: 基于所有历史演练对话记录+核心技能列表，生成key_improvement文本

**报告的跨轮次能力**: 系统通过`get_sco_all_messages()`获取所有历史轮次的对话和报告数据，实现跨轮次的能力成长追踪。

---

## 4. 能力评估机制

### 4.1 AOM中的rubric设计

对练AOM定义了4个`competencyGoals`，每个含1/3/5三级rubric：

| 能力 | L1（薄弱） | L3（一般/策略性） | L5（卓越） |
|------|-----------|------------------|-----------|
| 情绪破冰 | 被吓退/提高音量/强调紧迫性 | 主动放低姿态，有效共情 | 太极化解，迅速转化为解决方案动能 |
| 利益挖掘 | 纠缠客观条件辩论 | 精准识别P-I-N | 几分钟内透视核心利益失衡点 |
| 资源交换 | 硬压/空口许诺 | 灵活调动权限内资源提出等价置换 | 巧妙盘活重组所有存量增量要素 |
| 闭环落地 | 只停留在"太好了谢谢" | 果断切推，锁定时间/边界/契约 | 搭建完整闭环管理体系+弹性调整机制 |

### 4.2 评估是实时还是事后？

**答案: 两者兼有，但以事后为主。**

#### 实时评估（演绎过程中）

1. **进度追踪（notice_progress）**: Director在每轮对话后评估进度百分比，实时发送到前端。这是一种粗粒度的实时评估。
2. **目标达成判断（goal_eval）**: 在演绎结束时，Director判断整体目标是否达成（0/1二值判断），这是演绎阶段结束时的即时评估。
3. **Director的隐式评估**: Director在决定下一轮导演指令时，本质上在实时评估用户的表现（用户说了什么 -> 剧本中的行为模式如何反应 -> 生成什么样的场景转换/情绪变化/行动指令）。

#### 事后评估（报告阶段）

1. **技能维度评分（drill_dim_score）**: 在Report阶段通过LLM分析完整对话历史，对每个技能维度进行打分。这里使用了`skill_ladders`（L1-L5的5级标准），与AOM中的rubric对应。
2. **知识点掌握评估（drill_kng_mastery）**: 事后评估知识点的应用程度。
3. **高光时刻提取**: 事后从对话中提取用户表现出色的片段。
4. **关键能力提升分析**: 跨多轮次对比用户的能力成长。

#### rubric在评估中的使用路径

```
AOM.competencyGoals.rubric (L1/L3/L5)
   ↓ (内容制作时)
剧本.skill_ladders (L1-L5完整5级)
   ↓ (runtime)
Report阶段 report_scoring_prompt.md
   ├── 输入: skill_ladders + dialogue_record
   └── 输出: skill_evaluation[].score (基于L1-L5打分)
```

AOM中的rubric只有L1/L3/L5三级，剧本中扩展为完整的L1-L5五级。Report阶段LLM基于完整的5级标准对用户进行打分。

### 4.3 评估的局限性

1. **rubric不直接注入演绎阶段**: AOM的rubric和剧本的skill_ladders没有在演绎阶段的Actor prompt中使用，Actor只依据`behavioral_patterns`和`decision_points`来反应，不做评分
2. **评分依赖LLM判断**: 所有量化评分（进度、目标达成、维度得分）都是Director/Report LLM的判断结果，没有基于规则的硬性评分逻辑
3. **Coach被禁用**: 原设计中Coach可以在演绎过程中给予引导反馈（含实时评估性质），但当前被注释掉了

---

## 5. 对练与产品需求的映射

### 5.1 当前实现覆盖的对练玩法

| 玩法 | 实现状态 | 代码位置 |
|------|---------|---------|
| **Roleplay（角色扮演对练）** | 已完整实现 | deduction_task_handler.py + actor_tools.py |
| **情景导入（导学）** | 已实现 | guide_task_handler.py + guide_tools.py |
| **AI扮演对手方** | 已实现 | actor_tools.py（AI扮演剧本中的"演员角色"） |
| **实时进度跟踪** | 已实现 | progress_tools.py |
| **目标达成评估** | 已实现 | goal_eval.py |
| **苏格拉底追问式复盘** | 已实现（基于review skill） | review_task_handler.py |
| **多维度能力评估报告** | 已实现 | report_tools.py + data_reporting.py |
| **跨轮次能力成长追踪** | 已实现 | sco.py的get_all_skill_evaluations() |
| **数字人/TTS集成** | 已实现 | actor_tools.py中的voice_info配置 |
| **旁白/场景描述** | 已实现 | narration_tools.py |
| **教练实时引导** | 已实现但被禁用 | cocah_tools.py（注释状态） |

### 5.2 尚未实现的对练玩法

| 玩法 | 当前状态 | 实现难度评估 |
|------|---------|-------------|
| **角色互换（用户扮演对手方）** | 未实现 | 中。需要新的TaskHandler，让AI扮演"营销主管"，用户扮演"张楠"。剧本需要双向编写。关键挑战是评估标准需要反转。 |
| **费曼讲解** | 未实现 | 中。用户向AI讲解某个知识点/技能，AI扮演"不懂的人"进行追问。需要新的剧本模板和Actor prompt，但可复用现有的导演-演员架构。 |
| **辩论对练** | 未实现 | 高。需要双方都能主动推进议题，当前架构是"用户发言->AI反应"的被动模式，辩论需要AI也能主动出击。可能需要修改Director的编排逻辑。 |
| **多人对练** | 未实现 | 高。当前只支持1v1（一个用户角色+一个演员角色），多人场景需要多个Actor并行，消息路由更复杂。 |
| **基于视频/PPT的场景对练** | 未实现 | 中。需要在导学阶段集成多媒体内容，但AOM已有`resourceId`的外部资源引用机制。 |
| **实时Coach介入** | 已实现代码但被禁用 | 低。只需取消`CoachGuidanceToolBuilder`的注释，但需要优化Coach的介入时机和话术质量。 |
| **自适应难度调节** | 未实现 | 中。可以基于实时进度和对话分析，动态调整Actor的强硬程度。需要扩展Director的指令系统。 |
| **群体对练（多学员同场）** | 未实现 | 极高。架构级变更。 |

### 5.3 架构可扩展性评估

当前架构对新玩法的支持能力：

1. **Director-Actor分离模式**是一个好的抽象——Director负责编排，Actor负责执行，新增玩法可以复用Director逻辑，只需更换Actor的system prompt和行为规则

2. **剧本Schema（RoleplayScriptSchema）**是强类型定义的——新增玩法（如费曼/辩论）需要扩展Schema或定义新的Script类型

3. **消息Tag系统**天然支持多角色——新增角色（如第二个演员）只需新增Tag和对应的exclude规则

4. **Tool-based架构**支持灵活组合——可以按需为不同玩法组装不同的工具集

---

## 6. "半结构化内容驱动"的证据

### 6.1 剧本中直接控制AI行为的字段

以下字段在代码中被**直接读取并注入AI prompt**，构成了AI行为的"硬约束"：

| 字段 | 注入位置 | 控制效果 |
|------|---------|---------|
| `actor_role`全部字段 | actor_deduce的system_prompt | 演员的性格/说话风格/触发点/软化点/底线/行为模式——直接决定AI每句话的语气、内容、情绪走向 |
| `opening_line` | 从scenario中提取 | 锚定AI的第一句话 |
| `business_scenario`（context） | actor_deduce的system_prompt | 设定场景背景，约束AI不能脱离场景 |
| `role_background` (actor_know_facts) | actor_deduce的system_prompt | 定义AI"知道什么"——限制信息泄露 |
| `director_instructions` | 每轮动态生成，注入actor prompt | 控制当前轮的场景转换/情绪变化/行动目标 |
| `skill_trigger_map`（能力触发图谱） | 通过plain_script注入Director的SystemMessage | Director依据此图谱决定对话进入了哪个阶段 |
| `decision_points` | 通过plain_script注入Director的SystemMessage | Director依据决策点判断用户是否做出了正确反应 |
| `behavioral_patterns` | 通过actor_role注入Actor的system_prompt | 定义AI的"如果...则..."反应规则链 |
| `hidden_situation` | 通过actor_role注入 | "防剧透指令"，限制AI不能主动透露的信息 |
| `theme.business_context` | Guide阶段的bg-intro卡片 + Report阶段的评分prompt | 贯穿全流程的业务上下文 |
| `skill_ladders` | Report阶段的评分prompt | L1-L5评分标准 |
| `success_criteria` | 通过plain_script注入 | 定义"什么算成功" |

### 6.2 与授课AOM中blueprint/rule/solution的关系

| 授课AOM概念 | 对练剧本对应物 | 异同 |
|------------|--------------|------|
| **blueprint**（AI教学策略蓝图） | `behavioral_patterns` + `skill_trigger_map` | 本质相同：都是告诉AI"应该怎么做"。但剧本的粒度更细——不是"先破后立的教学逻辑"这样的抽象指导，而是"如果用户施压则翻旧账"这样的具体反应规则 |
| **rule**（通关条件） | `success_criteria` + `bottom_line` + `decision_points.correct_approach` | 本质相同：都是定义"什么条件算通过"。但剧本的层次更丰富——不只是"播放完毕"或"两项清晰即通关"，而是每个阶段都有独立的成功标准 |
| **solution**（AI具体行为准则） | `decision_points.correct_approach` + `common_mistakes` + `psychological_dynamics` | 授课的solution是"引导三步走"这样的过程指导。对练的solution是"正确方向参考+常见错误列表+心理动态地图"，更强调"对方的内心世界"而非"教学步骤" |
| **aiTutorDialogue** | `opening_line` | 授课中AI的预设对话。对练只有开场白是预设的，后续完全动态生成 |

### 6.3 "半结构化"体现在哪里

**"结构化"的部分**（硬约束）：
- 角色身份、背景关系不可变
- 阶段划分（4个能力触发阶段）固定
- 底线和防剧透指令是绝对约束
- 评估维度和评分标准预定义

**"非结构化"的部分**（软约束/自由空间）：
- 具体的对话内容完全由LLM即时生成
- Director的导演指令是LLM基于剧本和对话历史动态决定的
- Actor的每句台词不是预写的，而是根据指令+人设+历史生成的
- 用户的发言完全不可预测，AI需要灵活应对
- 进度评估是LLM的主观判断，不是硬性规则

**"半"的核心含义**：
剧本提供了一个**高度结构化的"行为控制框架"**（角色、阶段、规则、底线），但框架内的**具体对话内容是AI动态生成的**。这与授课AOM中的"segment驱动+interactionPoint控制"形成对比——授课是"按段落播放+在交互点执行规则"，对练是"在行为框架内自由对话"。

---

## 7. 关键发现与总结

### 7.1 架构层面

1. **导演-演员分离是核心设计模式**: Director（主LLM）负责全局编排，Actor（独立LLM调用）负责角色扮演。两者通过`instructions`字段传递控制信号。这种设计使得AI的"思考"（导演指令）和"表演"（角色台词）解耦，避免了"出戏"问题。

2. **消息Tag权限系统**实现了多角色的信息隔离: 每条消息打上角色标签，不同角色看到的历史消息不同。这是多Agent协作的基础设施。

3. **剧本双版本存储**: 结构化JSON（用于代码字段提取）+ Markdown纯文本（用于LLM上下文注入），两者并存，通过artifact服务管理。

4. **三次LLM调用生成报告**: 评分 + 高光时刻 + 关键提升并行生成，耗时可能较长但质量有保障。

### 7.2 内容层面

1. **剧本是对练的灵魂**: 一个完整的对练剧本包含约27KB的详细内容（本案例），涵盖角色心理画像、递进式反应规则、防剧透指令、5级评估标准等。这是"半结构化内容驱动"的核心载体。

2. **AOM是对练的骨架**: 对练AOM只负责定义"这是一个roleplay类型的活动"、关联外部资源、定义能力目标和rubric。具体的对练行为完全由剧本+Agent控制。

3. **能力评估标准存在层级关系**: AOM的rubric（L1/L3/L5三级）-> 剧本的skill_ladders（L1-L5五级）-> Report LLM的评分输出。信息从粗到细。

### 7.3 差距与机会

1. **Coach功能被禁用**: 演绎过程中缺乏实时引导，用户可能在多轮无效对话后才知道自己走偏了。重新启用Coach需要解决介入时机和沉浸感平衡问题。

2. **仅支持Roleplay一种玩法**: 当前的`activityType: roleplay`和`RoleplayScriptSchema`都是针对角色扮演场景设计的。费曼、辩论、角色互换等玩法需要新的Schema和Handler。

3. **评估高度依赖LLM**: 没有基于规则的硬性评分（如"用户是否提到了延后旧需求"的关键词检测），评分一致性和可解释性可能存在问题。

4. **`excludeReport: 1`存疑**: 对练AOM中这个字段可能意味着该对练不自动生成学习报告（而是用自己的Report阶段生成对练报告），需确认。

5. **多次演练的数据积累**: 系统已支持跨轮次的数据获取（`get_sco_all_messages`），但高光时刻和关键提升的LLM分析质量依赖于prompt设计。

### 7.4 技术栈总结

```
层次          │ 组件                          │ 职责
──────────────┼───────────────────────────────┼──────────────
AOM数据层     │ 对练AOM JSON                   │ 定义活动类型/能力目标/rubric/资源关联
              │                               │
内容层        │ 对练剧本 (Artifact)             │ 角色/场景/行为规则/评估标准
              │ ├── JSON版 (structured_script) │ 字段级提取
              │ └── MD版 (plain_script)        │ LLM上下文注入
              │                               │
Agent层       │ drill-mate (Python)            │
              │ ├── GuideTaskHandler           │ 导学：三步展示（背景/目标/技能）
              │ ├── DeductionTaskHandler       │ 演绎：导演-演员-旁白协作
              │ │   ├── OpeningNarrateToolBuilder  │ 旁白开场
              │ │   ├── ActorDeduceToolBuilder      │ 角色扮演
              │ │   ├── ProgressToolBuilder         │ 进度追踪
              │ │   └── GoalEvalToolBuilder         │ 目标评估
              │ ├── ReviewTaskHandler          │ 复盘：基于review skill的追问
              │ └── ReportTaskHandler          │ 报告：三次LLM调用+数据上报
              │                               │
基础设施层     │ agentickit/prosonaagent        │ Agent框架/状态管理/消息路由
              │ Langfuse (Prompt管理)          │ System prompt模板管理
              │ Artifact服务                   │ 剧本/报告的存储与检索
              │ Tracking API                   │ 学习数据上报
              │ A2A消息协议                     │ Agent-前端通信
```
