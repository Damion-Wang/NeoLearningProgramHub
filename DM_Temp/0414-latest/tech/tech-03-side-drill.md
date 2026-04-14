# 技术全景：SIDE / drill-mate（对练引擎）

> 更新日期：2026-04-13
> 面向读者：产品经理 + 研发工程师
> 代码仓库：drill-mate（独立 pypi 包 `drill-aom-plugins`，通过 handler_registry 注入 Prosona）

---

## 一、导演-演员分离模式

对练引擎的核心设计模式是**导演-演员分离**：

```
用户发言 → Director（主LLM，编排决策）
              │
              ├── Actor（独立LLM调用，角色扮演）
              ├── Narrator（独立LLM调用，场景旁白）[产品不用]
              └── Coach（独立LLM调用，引导提示）[当前被禁用]
```

| 角色 | 负责内容 | 技术实现 | 消息标签 |
|------|---------|---------|---------|
| **Director（导演）** | 解读剧本、编排每轮对话的场景转换/情绪变化/行动指令 | DeductionTaskHandler 的 system_prompt + awrap_model_call | `__role__:director` |
| **Actor（演员）** | 按导演指令和剧本人设表演 | actor_tools.py 独立调用 LLM | `__role__:actor` |
| **Narrator（旁白）** | 输出开场白/场景描述 | narration_tools.py 独立调用 LLM | `__role__:narrator` |
| **Coach（教练）** | 在用户困难时引导/正面反馈 | cocah_tools.py **（已实现但被注释掉）** | `__role__:coach` |

**消息权限隔离**（`MESSAGE_EXCLUDE_TAGS`）：
- User 看不到 Director 的消息
- Actor 看不到 Coach 和 Narrator 的消息
- Director 看不到 Narrator 的消息

**6种角色常量**：USER / DIRECTOR / ACTOR / COACH / NARRATOR / GUIDER

---

## 二、四阶段 Handler

```
DeductionAgent (ProsonaA2AStreamAgenticExecutor)
└── create_prosona_agent()
    ├── session_handler: DeductionSessionHandler
    └── task_handlers:
        ├── GuideTaskHandler     (drill-guide)     — 导学
        ├── DeductionTaskHandler (drill-deduction)  — 演绎/Roleplay
        ├── ReviewTaskHandler    (drill-review)     — 反思
        └── ReportTaskHandler    (drill-report)     — 报告
```

### 2.1 导学阶段（Guide）— 三步导学

**文件**：`guide_task_handler.py` + `guide_tools.py` + `enums.py`

三个子步骤（`GuideStage` 枚举）：

| 步骤 | 动作 | 数据来源 |
|------|------|---------|
| **bg-intro**（背景介绍） | 展示角色信息 + 场景背景卡片 | structured_script.roles + theme.business_context + actor_config |
| **goal-intro**（目标介绍） | 展示对练目标卡片 | theme.main_goals + theme.practice_goals |
| **skill-intro**（技能介绍） | 展示所需技能和知识点卡片 | theme.key_skills + theme.core_knowledge_points |

**工具**：`PracticeGuideToolBuilder` 构建的 `practice_guide` 工具，AI 调用时指定 `action` 参数。
**状态追踪**：通过 `shown_stages` state 确保三步依次完成。

**状态**：**已实现**

### 2.2 演绎阶段（Deduction）— Roleplay 核心

**文件**：`deduction_task_handler.py` + `actor_tools.py` + `narration_tools.py` + `progress_tools.py` + `goal_eval.py`

**演绎流程**：
```
Director 分析剧本 → 调用 opening_narrate → Narrator 生成场景描述
→ 调用 actor_deduce → Actor 输出开场白（含数字人TTS配置）
→ 等待用户输入
→ 每轮对话:
    Director 分析用户发言 → 生成导演指令(instructions):
      1. 场景转换（紧张升级/话题转移）
      2. 情绪变化（防御→观望）
      3. 行动指令（试探底线/抛出旧账）
    → 调用 actor_deduce(instructions) → Actor 按指令表演
    → 调用 notice_progress(progress) → 输出进度百分比
→ 结束: 调用 goal_eval → 输出目标达成结果(0/1)
```

**Actor 行为控制链**：
1. System Prompt（Langfuse `tasks/drill-deduction/tools/actor-deduce/system-prompt.md`）：注入 role_name、opening_scene、business_scenario、role_background、director_instructions、演员角色全部字段
2. Chat History：过滤后的对话历史（排除 coach 和 narrator 消息）
3. 消息标记：`__role__:actor`，附带角色名、头像、TTS 配置

**State 扩展**：`DeductionTaskState`（+round, opening_remarks_outputted, deduction_started, deduction_goal_eval_result）

**状态**：**已实现**

### 2.3 反思阶段（Review）— 苏格拉底追问

**文件**：`review_task_handler.py`

**实现机制**：
- 声明 `skills = ["review"]`，使用 Prosona 框架预定义的 review skill
- 剧本通过 `<script_content>` 注入 SystemMessage，提供"好表现"的参照
- `aget_card: display_deduction_chat_history` → 构建演绎阶段对话记录卡片供 LLM 参考
- 使用 `_builtin_conversation` 和 `_builtin_write_scratchpad` 两个内置工具

**苏格拉底追问模式**：
- AI 基于演绎对话记录识别关键决策点
- 对照剧本 `decision_points` 和 `success_criteria` 发现不足
- 通过开放式提问引导用户自己发现问题

**状态**：**已实现**

### 2.4 报告阶段（Report）— 三次 LLM 调用

**文件**：`report_task_handler.py` + `report_tools.py` + `report/data_reporting.py`

**报告生成流程**：
```
收集上下文 → 第一次LLM: report_scoring_prompt.md → 评分报告
→ 并发调用:
    generate_highlight()    → 第二次LLM: report_highlight_prompt.md → 高光时刻
    generate_key_improvement() → 第三次LLM: report_key_improvement.md → 关键能力提升
→ 合并三部分 → 存储到 Artifact 服务 → 异步上报6项数据
```

**上报数据**：
| 指标代码 | 动作代码 | 说明 |
|---------|---------|------|
| goal_achievement | drill_achieve_ptg | 对练目标达成百分比 + 里程碑 |
| activity_evaluation | drill_score | 总分/是否通过/综合反馈 |
| dimension_evaluation | drill_dim_score | 各维度得分/亮点/薄弱点/改进建议 |
| knowledge_mastery | drill_kng_mastery | 知识点掌握程度 |
| highlight_card | drill_highlight_card | 高光时刻卡片 |
| key_competency_improvement | drill_key_competency_improvement | 关键能力提升 |

**跨轮次能力**：通过 `get_sco_all_messages()` 获取所有历史轮次数据，实现能力成长追踪。

**状态**：**已实现**

---

## 三、剧本深度结构化

### 3.1 剧本整体结构

代码文件 `schemas/scripts.py` 定义了 `RoleplayScriptSchema`，包含5个顶层字段：

| 字段 | Schema | 说明 |
|------|--------|------|
| roles | `RoleplayRolesSchema` | 用户角色 + 演员角色（70+ 字段心理画像） |
| theme | `RoleplayThemeSchema` | 主题/业务背景/核心技能/知识点 |
| scenario | `RoleplayScenarioSchema` | 场景/开场白/能力触发图谱/心理动态 |
| actor_config | `RoleplayActorConfigSchema` | 数字人配置（voice_info/image_url） |
| skill_ladders | `list[RoleplaySkillLadderSchema]` | L1-L5 分级标准 |

### 3.2 演员角色核心控制字段

| 字段 | 说明 |
|------|------|
| `explicit_goals` | 显性目标（P - 立场） |
| `implicit_goals` | 隐性目标（I - 利益 & N - 需求） |
| `triggers` | 激怒点 |
| `softeners` | 软化点 |
| `true_need` | 真实需求 |
| `bottom_line` | 底线 |
| `negotiable_items` | 可协商项 |
| `hidden_situation` | 隐藏信息（防剧透指令） |
| `behavioral_patterns` | 行为模式（6条递进式反应规则） |

### 3.3 能力触发图谱（4阶段）

| 阶段 | 名称 | 目标 |
|------|------|------|
| 1 | 释放情绪与探寻立场（P-降对抗） | 情绪降温 |
| 2 | 深挖利益与核心需求（I/N-找动机） | 痛点确立 |
| 3 | 资源交换与重组共识（E-换资源） | 实质置换 |
| 4 | 确认落地与闭环跟进（R-强执行） | 行动闭环 |

每个阶段含：阶段目标、场景描述、决策点列表（决策名/上下文/正确反应/常见错误）、所需核心技能、所需知识点。

### 3.4 L1-L5 评估标准

| 能力 | L1（薄弱） | L3（策略性） | L5（卓越） |
|------|-----------|-------------|-----------|
| 情绪破冰 | 被吓退/提高音量 | 主动放低姿态，有效共情 | 太极化解，迅速转化为解决方案动能 |
| 利益挖掘 | 纠缠客观条件辩论 | 精准识别 P-I-N | 几分钟内透视核心利益失衡点 |
| 资源交换 | 硬压/空口许诺 | 灵活调动权限内资源提出等价置换 | 巧妙盘活重组所有存量增量要素 |
| 闭环落地 | 只停留在"太好了谢谢" | 果断切推，锁定时间/边界/契约 | 搭建完整闭环管理体系+弹性调整机制 |

---

## 四、实时评估 + 事后评估

### 4.1 实时评估（演绎过程中）

| 评估方式 | 实现 | 粒度 |
|---------|------|------|
| **进度追踪** | `ProgressToolBuilder` → `notice_progress` | 百分制，只增不减 |
| **目标达成判断** | `GoalEvalToolBuilder` → `goal_eval` | 0/1 二值判断 |
| **Director 隐式评估** | Director 每轮决定导演指令 | 定性判断 |

### 4.2 事后评估（Report 阶段）

| 评估方式 | 实现 | 标准来源 |
|---------|------|---------|
| **技能维度评分** | report_scoring_prompt.md | skill_ladders（L1-L5） |
| **知识点掌握** | report_scoring_prompt.md | core_knowledge_points |
| **高光时刻** | report_highlight_prompt.md | 对话历史 + 复盘记录 |
| **关键能力提升** | report_key_improvement.md | 所有历史轮次对比 |

**rubric 使用路径**：AOM.competencyGoals.rubric (L1/L3/L5) → 剧本.skill_ladders (L1-L5) → Report LLM 评分

---

## 五、excludeReport 机制

对练 AOM 中 `excludeReport: 1` 表示该对练不自动生成 Prosona 的个人学习报告（8大模块版本），而是使用自己的 Report 阶段（3次 LLM 调用版本）生成对练专属报告。

---

## 六、状态管理

### State 继承体系

```
SCOTaskState
  └── BaseDrillTaskState (+plain_script, structured_script)
        ├── GuideTaskState (+shown_stages)
        ├── DeductionTaskState (+round, opening_remarks_outputted, deduction_started, deduction_goal_eval_result)
        └── ReportTaskState (+report, report_outputted)
```

### 剧本双版本存储

| 版本 | 用途 | 获取方式 |
|------|------|---------|
| 结构化 JSON（structured_script） | 代码字段级提取（角色/场景/评估标准） | `jsonArtifactId` → Artifact 服务 |
| Markdown 纯文本（plain_script） | LLM 上下文注入（`<script_content>` 标签） | `mdArtifactId` → Artifact 服务 |

---

## 七、可扩展性分析

### 7.1 当前只有 Roleplay 一种玩法

当前的 `activityType: roleplay` 和 `RoleplayScriptSchema` 都是针对角色扮演场景设计。

### 7.2 扩展到其他玩法的评估

| 新玩法 | 实现难度 | 可复用部分 | 需要新建部分 |
|--------|---------|-----------|------------|
| **角色互换**（用户扮演对手方） | 中 | Director-Actor 架构、消息 Tag 系统 | 新 TaskHandler，剧本双向编写，评估标准反转 |
| **费曼讲解**（用户向 AI 讲解） | 中 | 导演-演员架构，Actor 扮演"不懂的人" | 新剧本模板，新 Actor prompt |
| **辩论对练** | 高 | 消息 Tag 系统、Tool-based 架构 | 需修改 Director 编排逻辑（当前被动模式→主动出击），新 Script 类型 |
| **多人对练** | 极高 | 消息 Tag 系统 | 多 Actor 并行，消息路由重构 |
| **实时 Coach 介入** | 低 | `CoachGuidanceToolBuilder` 已实现 | 只需取消注释 + 优化介入时机 |
| **自适应难度调节** | 中 | Director 指令系统 | 扩展 Director 的指令体系，动态调整 Actor 强硬程度 |

### 7.3 架构扩展方式

1. 继承 `TaskHandler` 或 `EnhanceTaskHandler`
2. 定义 `name`（注册键）、`tools`（工具列表）、`skills`（技能）
3. 如需自定义 State，定义 `state_schema`
4. 实现生命周期钩子（abefore/aafter/awrap_model_call 等）
5. 在 `__main__.py` 的 `create_handler_registry` 中注册

---

## 八、与产品需求的差距

| 产品需求 | 当前状态 | 差距说明 |
|---------|---------|---------|
| 对练三段 SCO 结构（情景导入→Roleplay→反思） | **已实现** | Guide→Deduction→Review 三阶段完全对应 |
| AI 扮演对手方 | **已实现** | Actor 角色扮演完备 |
| 实时进度跟踪 | **已实现** | ProgressToolBuilder 百分制进度 |
| 苏格拉底追问式复盘 | **已实现** | ReviewTaskHandler 基于 review skill |
| 多维度能力评估报告 | **已实现** | ReportTaskHandler 三次 LLM 调用 |
| 角色互换/费曼/辩论 | **需要新建** | 当前仅支持 Roleplay 一种玩法 |
| 教练实时引导 | **已实现但被禁用** | CoachGuidanceToolBuilder 被注释 |
| 对练导学阶段内置打标 SCO | **需要新建** | 导学阶段无打标能力，需新增 ASSESSMENT_TAG Handler |
| 对练中情绪天花板控制 | **可参考已有** | behavioral_patterns 已定义情绪递进规则，但无显式"天花板"字段 |
| 闭环反馈与对练结合 | **需要新建** | 对练模块无 FEEDBACK_COLLECT/FEEDBACK_REVIEW 机制 |
| 基于规则的硬性评分 | **需要新建** | 所有评分依赖 LLM 判断，无关键词检测等硬规则 |
