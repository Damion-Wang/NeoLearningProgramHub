# 技术全景：AOM（内容数据格式）

> 更新日期：2026-04-13
> 面向读者：产品经理 + 研发工程师
> 分析对象：横向协作 AOM 实例 + 横向协作对练 AOM 实例

---

## 一、五层数据结构详解

### 第1层：Project（项目/课程包）

| 字段 | 类型 | 说明 |
|------|------|------|
| `projectName` | string | 课程名称 |
| `description` | string | 课程整体描述 |
| `learningObjectives` | array | 学习目标 |
| `learnerProfile` | object | 学员画像（当前为空对象） |
| `competencyGoals` | array | 能力目标（授课为空，对练有4个完整能力定义） |
| `hotWords` | array | 热词表 |
| `lang` | string | 语言标识（"zh-CN"） |
| `modules` | array | 模块列表 |
| `excludeReport` | number | 是否排除报告（0=不排除，1=排除） |

### 第2层：Module（模块/Course）

| 字段 | 类型 | 说明 |
|------|------|------|
| `moduleName` | string | 模块名称 |
| `moduleDescription` | string/null | 模块描述 |
| `activities` | array | 活动列表 |

### 第3层：Activity（活动）

**Activity 外壳字段**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `learningObjectives` | array/null | 本活动学习目标 |
| `knowledgePoints` | array/null | 知识点 |
| `relatedCompetencyKeys` | array/null | 关联能力键 |
| `activity.activityId` | string | 活动唯一标识（如 guidance_0, lecture_1） |
| `activity.activityName` | string | 活动名称 |
| `activity.activityType` | string | 活动类型：`lecture` / `drill`（roleplay）/ `assessment` / `report` |
| `activity.description` | string/null | 活动描述 |
| `activity.resourceId` | string/null | 资源 ID（对练用，指向剧本资源） |
| `activity.artifactId` | string/null | 产物 ID（对练用，指向剧本 Artifact） |
| `extra.isIntroduction` | boolean | 是否为导入/引言活动 |
| `directScoContent` | object/null | SCO 内容直接嵌入区（授课有，对练为 null） |
| `competencyArtifactId` | string/null | 能力产物 ID（对练用） |

### 第4层：SCO（最小学习内容单元）

每个 SCO 是 `directScoContent.scoFlow[]` 中的对象。

| 字段 | 类型 | 说明 |
|------|------|------|
| `tutorMode` | number | 0=标准模式，1=自适应模式 |
| `scoName` | string | SCO 名称 |
| `segmentList` | array/null | 内容片段列表（与 sco 对象二选一） |
| `sco` | object/null | 独立 SCO 对象（quiz 类型用，与 segmentList 二选一） |
| `interactionPoint` | object | 交互点定义（见下文） |

**quiz 类型的 sco 对象字段**：

| 字段 | 说明 |
|------|------|
| `sco.scoType` | SCO 类型（"quiz"） |
| `sco.content.questions[]` | 题目列表 |
| `questions[].stem` | 题干 |
| `questions[].explanation` | 设计说明 / 系统隐性目标 |
| `questions[].answer` | 标准答案 / 参考答案 |
| `questions[].solution` | 解题步骤 / AI 行为准则 |
| `questions[].knowledgePoints[]` | 关联知识点（kpKey + title + description） |
| `questions[].passConditions` | 通关条件（description + rules 数组） |
| `questions[].answerAnalysis` | 答案深度解析 / 收尾话术规范 |
| `questions[].showAnswer` | 是否展示答案 |
| `questions[].separateTag` | 分流标签（用于自适应） |
| `questions[].groupKey` | 分组键（用于自适应版本选择） |

### 第5层：Segment（内容片段/版本）

| 字段 | 类型 | 说明 |
|------|------|------|
| `segmentId` | string/null | 片段 ID（如 "1.1", "5.1"） |
| `segmentType` | string | 片段类型："ppt" 或 "asvideo" |
| `name` | string | 片段名称 |
| `script` | string | 讲解脚本 / 旁白文案 |
| `description` | string | 片段描述 |
| `separateTag` | string | 分流标签（空字符串=通用，非空=特定类型专属） |
| `groupKey` | string | 分组键（同 groupKey 的多个 segment 为同一位置的不同版本） |
| `content` | object | 内容数据（ppt: pptUrl; asvideo: 场景列表+帧列表+音频+字幕） |

---

## 二、SCO 类型体系

### 2.1 现有类型（已实现）

| scoType / interactionType | Handler | 说明 |
|--------------------------|---------|------|
| `NARRATION` | MultimodalTaskHandler | PPT/视频自动播放，学员被动接收 |
| `CHAT` | QuizTaskHandler | 多轮对话模式，基于大模型的开放式交互 |
| `quiz` | QuizTaskHandler | 苏格拉底式问答，含 passConditions 通关条件 |
| `roleplay` | drill-aom-plugins 四阶段 | 角色扮演对练 |

### 2.2 产品目标新增类型（需要新建）

| SCO 类型 | scoType | 说明 | 状态 |
|---------|---------|------|------|
| **打标判定** | `ASSESSMENT_TAG` | 独立打标 SCO，含 `tagConfig`（标签维度、可能标签值、数据来源范围、降级策略） | **需要新建** |
| **闭环反馈-课前采集** | `FEEDBACK_COLLECT` | 课前采集学员真实场景，通过 `memory_id` 与课后复盘关联 | **需要新建** |
| **闭环反馈-课后复盘** | `FEEDBACK_REVIEW` | 课后复盘，通过 `memory_id` 读取课前采集数据 | **需要新建** |

---

## 三、interactionPoint 结构

每个 SCO 都有一个 `interactionPoint`，是该 SCO 的"教学交互说明书"：

| 字段 | 类型 | 说明 |
|------|------|------|
| `blueprint` | string | **教学设计意图**：向 AI 解释"为什么这么设计"，含教育学原理（成人学习理论、认知负载理论等） |
| `rule` | string | **交互触发规则**：定义何时结束当前 SCO（"播放完毕" 或复杂条件描述） |
| `description` | string | **内容摘要**：描述这个 SCO 做什么 |
| `aiTutorDialogue` | array | **AI 预设对话**：可预置脚本（当前实例中全部为空数组，行为由 AI 动态生成） |
| `interactionType` | string | **交互类型标识**："NARRATION"（自动播放）或 "CHAT"（多轮对话） |

**blueprint vs description 的区别**：
- `blueprint` 回答"**为什么**这么做"（教学设计原理层）
- `description` 回答"**做什么**"（功能实现层）

---

## 四、自适应字段体系

### 4.1 separateTag（分流标签）

内容中标注的学员类型标签，用于实现千人千面：

| separateTag 值 | 含义 |
|---------------|------|
| `""` (空字符串) | 通用内容，所有学员都看到 |
| `"防御拖延型"` | 仅该类型学员看到 |
| `"利益博弈型"` | 仅该类型学员看到 |
| `"情绪对抗型"` | 仅该类型学员看到 |

### 4.2 groupKey（版本槽位）

同一 `groupKey` 出现多次 = 该位置有多个版本，系统根据学员标签选择其中一个：
- `groupKey: "5.1"` 出现3次 = 案例导入 PPT 有3个版本
- `groupKey: "5.2"` 出现3次 = 视频案例有3个版本
- `groupKey: "5.3"` 出现3次 = 案例解析 PPT 有3个版本

### 4.3 tutorMode（开关）

| 值 | 含义 | 出现次数（实例） |
|----|------|-----------------|
| 0 | 标准模式 | 14 个 SCO |
| 1 | 自适应模式 | 1 个 SCO（"视频案例与解析"） |

`tutorMode = 1` 是开关，告诉播放引擎"这个 SCO 需要根据学员标签选择 Segment 版本"。

### 4.4 passConditions（通关条件含打标规则）

```json
{
  "description": "自然语言描述的通关总则",
  "rules": ["规则1", "规则2", ...]
}
```

**三种 passConditions 类型（已发现）**：

| 类型 | 示例 | 特点 |
|------|------|------|
| **诊断型** | 课前互动 CHAT | 不判对错，收集信息 + 打标。规则含"打标规则""强制兜底机制" |
| **知识验证型** | PIN 三要素识别测试 | 判断答案是否正确 |
| **策略应用型** | 场景策略选择测试 | 判断分析能力 |

---

## 五、授课 AOM vs 对练 AOM 的结构差异

| 维度 | 授课 AOM | 对练 AOM |
|------|---------|---------|
| **activityType** | `lecture` | `roleplay` |
| **competencyGoals** | 空数组 | 4个完整能力目标，含 keyBehaviors + rubric(1/3/5) |
| **directScoContent** | 完整 scoFlow 结构（PPT/Quiz/segmentList/interactionPoint） | **null** |
| **resourceId** | null | 有值（指向剧本资源） |
| **artifactId** | null | 有值（指向剧本 Artifact） |
| **competencyArtifactId** | 无 | 有值（指向能力评估矩阵） |
| **interactionPoint** | 每个 SCO 都有（blueprint/rule/description） | 无（由剧本替代） |
| **excludeReport** | 0（生成个人学习报告） | 1（使用对练自己的报告） |

### 差异解读

1. **授课 = 内容段落驱动**：directScoContent 内联所有教学内容（PPT/视频/Quiz），按段落编排教学流
2. **对练 = 剧本+Agent 驱动**：directScoContent 为 null，通过 resourceId / artifactId / competencyArtifactId 引用外部剧本资源
3. **三个外部 ID 构成"资源-内容-评估"三角关联**

---

## 六、Segment 版本管理

### 6.1 SCO 和 Segment 的关系（重要修正）

**产品需求 v0.3.3 确认**：SCO 和 Segment 一对一对应。

- 一页 PPT = 一个 SCO = 一个 Segment
- 同一 SCO 下多个 Segment = 该 SCO 的多个**版本**（不是多页连续讲解）
- **自适应时切换的是 Segment（版本），不是 SCO**

### 6.2 版本切换工作方式

```
互动 SCO 采集学员特征 → 打标 SCO (ASSESSMENT_TAG) 输出标签
→ 后续 SCO: tutorMode=1 时，按标签匹配 separateTag 选择 Segment 版本
→ 同一 groupKey 的多个 Segment 中选一个
```

### 6.3 打标影响范围（产品需求 Round-02 确认）

- 打标结果影响范围只到下一个打标 SCO 为止
- 标签严格限于 Activity 内，跨 Activity 不传递
- 低置信度（< 0.6）时降级为默认 Segment 版本

---

## 七、半结构化内容驱动的证据

以下字段全部是自然语言，由 LLM 解释执行：

| 字段 | 位置 | 控制什么 |
|------|------|---------|
| `passConditions` | SCO.questions | 通关逻辑（"两项清晰一项模糊即通关"） |
| `solution` | SCO.questions | AI 对话行为准则（"引导三步走"） |
| `blueprint` | interactionPoint | 教学设计意图（"先破后立的教学逻辑"） |
| `rule` | interactionPoint | 交互结束条件（"播放完毕" / "触发通关条件后终止对话"） |
| `answerAnalysis` | SCO.questions | 收尾话术规范 |
| `separateTag + groupKey` | Segment | 自适应分流（类型名完全由内容定义，平台不需预知） |
| `behavioral_patterns` | 对练剧本 | AI 角色的递进式反应规则 |
| `success_criteria` | 对练剧本 | 对练成功判定标准 |

**架构模式总结**：

| 维度 | 传统硬编码 | AOM 的内容驱动方式 |
|------|----------|-------------------|
| 通关判定 | 平台代码写死 | `passConditions` 自然语言，AI 解释执行 |
| AI 对话行为 | 平台统一策略 | `solution` 按题自定义 AI 行为脚本 |
| 自适应分流 | 平台配置路由表 | `separateTag + groupKey` 内容自描述 |
| 交互结束 | 平台统一计时/计次 | `rule` 按 SCO 自定义 |
| 教学策略 | 平台统一流程 | `blueprint` 按 SCO 独立教学设计 |

---

## 八、AOM 当前实现与产品目标的完整差距表

| 产品目标 | 当前 AOM 状态 | 差距说明 |
|---------|-------------|---------|
| SCO 类型 `ASSESSMENT_TAG`（打标判定） | **不存在** | 需新增 SCO 类型 + tagConfig 字段（标签维度/可能值/降级策略） |
| SCO 类型 `FEEDBACK_COLLECT`（课前采集） | **不存在** | 需新增 SCO 类型 + memory_id 字段 |
| SCO 类型 `FEEDBACK_REVIEW`（课后复盘） | **不存在** | 需新增 SCO 类型 + memory_id 字段 |
| `referenceSlots` 字段（引用槽） | **不存在** | SCO 层新增字段，含 slotId / required / description |
| `universalCapabilityDimensions` | **不存在** | Project 层新增通用能力维度映射（3-5个维度） |
| `rankingDimensions` | **不存在** | Report 层新增排名维度配置 |
| `groupingStrategy` | **不存在** | Report 层新增分组策略配置 |
| 打标影响范围限 Activity 内 | **未实现** | 当前 student_profile 从 SCO 传播到 Project 层，不限范围 |
| 低置信度降级（< 0.6） | **未实现** | 当前无置信度阈值，仅有兜底类型"利益博弈型" |
| 情绪天花板字段 | **不存在** | 对练剧本中无显式"情绪上限"字段 |
| 被动信号字段（passive_signals） | **不存在** | 半结构化记录中无停留时长/回翻/点击等字段 |
| 对练 AOM 中 scoType = roleplay 明确标注 | **隐含** | 通过 activityType=roleplay 推断，无显式 scoType 字段 |
