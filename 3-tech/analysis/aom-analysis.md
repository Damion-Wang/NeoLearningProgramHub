# AOM 文件结构完整分析报告

> 分析对象：`横向协作AOM.txt`（横向协作：销售内测）
> 分析日期：2026-04-13

---

## 一、完整数据层级结构

AOM 文件采用五层嵌套的 JSON 结构：

### 第1层：Project（项目/课程包）

| 字段 | 类型 | 说明 |
|------|------|------|
| `projectName` | string | 课程名称（"横向协作：销售内测"） |
| `description` | string | 课程整体描述 |
| `learningObjectives` | array | 学习目标（本例为空数组） |
| `learnerProfile` | object | 学员画像（本例为空对象） |
| `competencyGoals` | array | 能力目标（本例为空数组） |
| `hotWords` | array | 热词表（本例为空数组） |
| `lang` | string | 语言标识（"zh-CN"） |
| `modules` | array | 模块列表 |
| `excludeReport` | number | 是否排除报告（0=不排除） |

### 第2层：Module（模块）

| 字段 | 类型 | 说明 |
|------|------|------|
| `moduleName` | string | 模块名称（"横向协作"） |
| `moduleDescription` | string/null | 模块描述 |
| `activities` | array | 活动列表 |

### 第3层：Activity（活动）

每个 Activity 由外壳元数据和内部 SCO 内容两部分组成：

**Activity 外壳字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `learningObjectives` | array/null | 本活动学习目标 |
| `knowledgePoints` | array/null | 知识点 |
| `relatedCompetencyKeys` | array/null | 关联能力键 |
| `activity.activityId` | string | 活动唯一标识（如 `guidance_0`, `lecture_1`, `lecture_4`） |
| `activity.activityName` | string | 活动名称 |
| `activity.activityType` | string | 活动类型（lecture/drill/assessment/report） |
| `activity.description` | string/null | 活动描述 |
| `activity.resourceId` | string/null | 资源ID |
| `activity.artifactId` | string/null | 产物ID |
| `activity.buildArtifactId` | string/null | 构建产物ID |
| `extra` | object | 扩展信息 |
| `extra.isIntroduction` | boolean | 是否为导入/引言活动 |
| `directScoContent` | object | SCO 内容直接嵌入区 |
| `competencyArtifactId` | string/null | 能力产物ID |

### 第4层：SCO（scoFlow 数组中的元素）

每个 SCO 是 `directScoContent.scoFlow[]` 中的一个对象，代表一个可交互的学习内容单元。

**SCO 层字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `tutorMode` | number | AI 导师模式（0=标准模式，1=自适应模式） |
| `scoName` | string | SCO 名称 |
| `segmentList` | array/null | 内容片段列表（与 sco 二选一） |
| `sco` | object/null | 独立 SCO 对象（与 segmentList 二选一） |
| `interactionPoint` | object | 交互点定义（见下文详述） |

**当 SCO 使用独立 `sco` 对象时（quiz类型），其字段为：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `sco.scoName` | string | SCO 名称 |
| `sco.scoType` | string | SCO 类型（如 "quiz"） |
| `sco.description` | string | 描述 |
| `sco.content` | object | 内容对象 |
| `sco.content.questions` | array | 题目列表 |

**Question（题目）字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `stem` | string | 题干 |
| `explanation` | string | 设计说明/系统隐性目标 |
| `answer` | string | 标准答案/参考答案 |
| `solution` | string | 解题步骤/AI行为准则 |
| `knowledgePoints` | array | 关联知识点列表 |
| `knowledgePoints[].kpKey` | string | 知识点键 |
| `knowledgePoints[].title` | string | 知识点标题 |
| `knowledgePoints[].description` | string | 知识点描述 |
| `passConditions` | object | 通关条件 |
| `passConditions.description` | string | 通关条件自然语言描述 |
| `passConditions.rules` | array[string] | 通关规则列表 |
| `answerAnalysis` | string | 答案深度解析/收尾话术规范 |
| `showAnswer` | boolean | 是否展示答案 |
| `separateTag` | string | 分流标签（用于自适应） |
| `groupKey` | string | 分组键（用于自适应版本选择） |

### 第5层：Segment（内容片段）

`segmentList[]` 中的每个元素：

| 字段 | 类型 | 说明 |
|------|------|------|
| `segmentId` | string/null | 片段ID（如 "1.1", "5.1"） |
| `segmentType` | string | 片段类型（"ppt" 或 "asvideo"） |
| `name` | string | 片段名称 |
| `script` | string | 讲解脚本/旁白文案 |
| `description` | string | 片段描述 |
| `separateTag` | string | 分流标签（用于自适应内容版本选择） |
| `groupKey` | string | 分组键（同一 groupKey 的多个 segment 为同一内容的不同版本） |
| `content` | object | 内容数据，结构因 segmentType 而异 |

**segmentType = "ppt" 时 content 结构：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `content.pptUrl` | string | PPT 幻灯片图片URL |

**segmentType = "asvideo" 时 content 结构：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `content.content` | array | 场景列表 |
| `content.content[].imageUrl` | string | 场景背景图URL |
| `content.content[].frameList` | array | 帧列表 |
| `content.content[].frameList[].mp3url` | string | 音频URL |
| `content.content[].frameList[].duration` | number | 音频时长（毫秒） |
| `content.content[].frameList[].subtitle` | string | 字幕文本 |
| `content.content[].frameList[].name` | string | 说话人名称 |
| `content.content[].frameList[].avatar` | string/null | 说话人头像URL（null 表示旁白） |

---

## 二、Activity 的类型和数量

本 AOM 共包含 **3 个 Activity**，全部为 `lecture` 类型：

| # | activityId | activityName | activityType | extra.isIntroduction | SCO数量 |
|---|-----------|-------------|-------------|---------------------|--------|
| 1 | `guidance_0` | 课前互动 | lecture | true | 3 |
| 2 | `lecture_1` | 沟通卡住了？PIN法三步走 | lecture | false | 7 |
| 3 | `lecture_4` | 课程回顾 | lecture | false | 5 |

**关键发现**：本 AOM 中没有出现 `drill`、`assessment`、`report` 类型的 Activity。所有 Activity 均为 `lecture` 类型。但从 `excludeReport: 0` 来看，系统应该会自动生成学习报告。

---

## 三、SCO 的类型

### scoType 字段

在所有 15 个 SCO 中，只有 **2 个** 使用了独立 `sco` 对象并明确指定了 `scoType`：

| scoType 值 | 出现次数 | 所在位置 |
|-----------|---------|---------|
| `quiz` | 2 | Activity 1 的 SCO#2（课前互动：你的专属协作剧本）；Activity 2 的 SCO#2（PIN三要素识别测试）和 SCO#4（场景策略选择测试） |

实际上是 **3 个** quiz，分别出现在：
- Activity `guidance_0` 中的"课前互动：你的专属协作剧本"
- Activity `lecture_1` 中的"PIN三要素识别测试"
- Activity `lecture_1` 中的"场景策略选择测试"

其余 **12 个** SCO 使用 `segmentList` 直接嵌入内容，没有独立的 `scoType` 字段（隐含为"讲授/播放"类型）。

### interactionType 字段

| interactionType 值 | 出现次数 | 含义 |
|-------------------|---------|------|
| `NARRATION` | 13 | 叙述/播放模式，PPT/视频自动播放，学员被动接收 |
| `CHAT` | 1 | 多轮对话模式，基于大模型的开放式交互 |

**关键发现**：`CHAT` 类型仅出现一次，即"课前互动：你的专属协作剧本"，这是一个基于大模型的多轮开放式对话前测。其余全部为 `NARRATION` 播放类型。这说明在 lecture 类型的 Activity 中，即便嵌入了 quiz，其交互模式仍可以是 NARRATION（AI 讲解题目并评判）而非 CHAT。

---

## 四、自适应机制分析

### 4.1 `separateTag` —— 分流标签

这是实现"千人千面"内容推送的核心机制。

**出现的 separateTag 值：**

| separateTag 值 | 出现位置 | 含义 |
|---------------|---------|------|
| `""` (空字符串) | 绝大多数 segment | 通用内容，不分流，所有学员都看到 |
| `"防御拖延型"` | Activity 2 的 SCO#5 中的多个 segment | 对应"防御拖延型"学员的个性化内容 |
| `"利益博弈型"` | Activity 2 的 SCO#5 中的多个 segment | 对应"利益博弈型"学员的个性化内容 |
| `"情绪对抗型"` | Activity 2 的 SCO#5 中的多个 segment | 对应"情绪对抗型"学员的个性化内容 |

### 4.2 `groupKey` —— 分组键

`groupKey` 用于标识同一"槽位"的不同版本。**同一个 groupKey 值出现多次时，说明这些 segment 是同一位置的不同自适应版本**，系统根据学员标签选择其中一个播放。

**关键示例**：Activity 2（PIN法三步走）的 SCO#5（视频案例与解析）中：

- `groupKey: "5.1"` 出现了 **3 次**，分别对应 separateTag 为"防御拖延型""利益博弈型""情绪对抗型"的案例导入 PPT
- `groupKey: "5.2"` 出现了 **3 次**，分别对应三种类型的视频案例（asvideo）
- `groupKey: "5.3"` 出现了 **3 次**，分别对应三种类型的案例解析 PPT

这意味着同一个教学环节（视频案例与解析），系统会根据学员在课前互动中被打上的标签，选择展示不同的案例故事。

### 4.3 `tutorMode` —— 导师模式

| tutorMode 值 | 含义 | 出现次数 |
|-------------|------|---------|
| `0` | 标准模式 | 14 个 SCO |
| `1` | 自适应模式 | 1 个 SCO（"视频案例与解析"） |

**关键发现**：`tutorMode = 1` 仅出现在包含 separateTag 分流内容的 SCO 上。这说明 `tutorMode` 是一个开关，告诉播放引擎"这个 SCO 需要根据学员标签进行内容选择"。

### 4.4 `passConditions` —— 通关条件

这是一个纯文本驱动的规则系统，完整定义了 AI 评判学员回答是否合格的标准。

**结构：**
```json
{
  "description": "自然语言描述的通关总则",
  "rules": ["规则1", "规则2", ...]
}
```

**三种 quiz 中 passConditions 的差异：**

1. **课前互动（CHAT型）**：
   - description: "场景类型、对方动机、学员风格，达到'两项清晰一项模糊'或'一项清晰两项模糊'即可通关"
   - rules: 包含清晰度判定标准、打标规则、强制兜底机制
   - 这是一个**诊断型**通关条件，目的不是判对错而是收集信息

2. **PIN三要素识别测试（NARRATION型）**：
   - description: "准确识别并分别写出老王的立场（P）、利益（I）和需求（N）"
   - rules: 结构与内容要求，需体现心理层面动因
   - 这是一个**知识验证型**通关条件

3. **场景策略选择测试（NARRATION型）**：
   - description: "准确判断老李所处的沟通象限或状态"
   - rules: 核心要素匹配，需提到"挖需求""建立安全感"
   - 这是一个**策略应用型**通关条件

---

## 五、记忆/上下文传递机制

### 5.1 课前测评 -> 后续内容选择

这是本 AOM 中最关键的上下文传递路径：

**阶段1：信息收集**（Activity 1, SCO#2 — 课前互动 CHAT）
- AI 通过多轮对话获取学员在"场景类型""对方动机""学员风格"三个维度的信息
- passConditions 中的**打标规则**明确了如何将对话结果转化为学员类型标签：
  - "若三清或两清一模：按高频类型投票匹配（平票以场景类型为准）"
  - "若一清两模：以唯一清晰维度对应类型打标"
  - 兜底机制：触发即输出"类型B"
- 最终输出一个类型标签（如"防御拖延型""利益博弈型""情绪对抗型"）

**阶段2：内容分发**（Activity 2, SCO#5 — 视频案例与解析，tutorMode=1）
- 系统读取学员标签，匹配 `separateTag` 字段
- 在同一 `groupKey` 的多个 segment 中，选择 `separateTag` 与学员标签匹配的那个版本进行播放
- 例如：被标记为"利益博弈型"的学员，看到的是《争夺的预算池》视频案例

### 5.2 传递机制的数据流

```
课前互动 CHAT (passConditions.rules 中的打标规则)
    ↓ 输出学员类型标签
    ↓ (存储在学员 session/profile 中)
    ↓
视频案例与解析 (tutorMode=1)
    ↓ 读取学员类型标签
    ↓ 匹配 separateTag
    ↓ 从同 groupKey 的多个版本中选一个播放
```

**关键发现**：AOM 中没有显式的"变量传递"或"数据绑定"字段。上下文传递是通过 `separateTag` 和 `groupKey` 的隐式约定实现的——课前互动的 passConditions 定义了**输出什么标签**，后续 SCO 的 separateTag 定义了**消费什么标签**。这是一种**内容驱动的弱耦合机制**。

---

## 六、interactionPoint 的结构

每个 SCO 都有一个 `interactionPoint`，它是该 SCO 的"教学交互说明书"。

### 字段定义

| 字段 | 类型 | 说明 | 使用模式 |
|------|------|------|---------|
| `blueprint` | string | **教学设计意图**。向 AI 导师解释"为什么这么设计这个环节"，提供教学理论背景和策略依据。是给 AI 的"教师手册"。 | 每个 SCO 都有，内容丰富，通常包含教育学原理（如成人学习理论、认知负载理论）和设计决策的理由 |
| `rule` | string | **交互触发规则**。定义何时结束当前 SCO 或触发下一步。 | "播放完毕"（NARRATION 型）或复杂的条件描述（CHAT 型，如"触发通关条件或强制兜底机制后，播放结束话术并终止对话"） |
| `description` | string | **内容摘要**。描述这个 SCO 具体讲什么、做什么。是教学内容的"概要说明"。 | 每个 SCO 都有，是面向系统/开发者的功能描述 |
| `aiTutorDialogue` | array | **AI 导师预设对话**。可预置 AI 的对话脚本。 | 本 AOM 中全部为空数组 `[]`，说明对话行为由 AI 根据其他字段动态生成 |
| `interactionType` | string | **交互类型标识**。决定播放引擎采用何种交互模式。 | "NARRATION"（自动播放）或"CHAT"（多轮对话） |

### 使用模式分析

**blueprint vs description 的区别**：
- `blueprint` 回答"**为什么**这么做"（教学设计原理层）
- `description` 回答"**做什么**"（功能实现层）

**示例对比（课前互动 CHAT）**：
- blueprint: "通过'轻负担'对话获取特征，实现'初阶个性化'课程推送"
- description: "基于大模型的多轮开放式对话前测"

**blueprint 中体现的教育学原理**：
- "先破后立的教学逻辑"
- "成人学习非常看重'全局观'"
- "避免认知超载"
- "知识验证型（Type B）"测验分类
- "佐证知识点和示范最佳实践的双重任务"
- "收口与强化记忆"

---

## 七、Drill（对练）相关结构分析

### 本 AOM 中没有 drill 类型的 Activity

在本文件中，所有三个 Activity 的 `activityType` 都是 `"lecture"`，没有出现 `"drill"` 类型。

### 但可以推断 drill 的可能结构

根据现有数据结构的设计模式，可以推断 drill 类型的 Activity 应该具有以下结构特点：

1. **情景导入**：使用 `segmentType: "ppt"` 或 `segmentType: "asvideo"` 的 segment 设定角色扮演背景
2. **Roleplay 对练**：使用 `interactionType: "CHAT"` 的 SCO，学员扮演特定角色进行多轮对话
3. **反思总结**：使用 `interactionType: "NARRATION"` 的 SCO 进行知识回顾

**在本 AOM 中，最接近 drill 结构的是**：
- SCO "课前互动：你的专属协作剧本"（CHAT 类型），它展示了多轮对话的完整数据结构
- 其 `passConditions` 中的多轮对话管理规则（建议3轮、兜底机制等）提供了 drill 场景下 AI 行为控制的参考模式

**课前互动作为"准 drill"的结构要素**：
- `solution` 字段充当"AI行为准则"，定义了"探场景 -> 挖动机 -> 看风格"三步走的对话策略
- `passConditions.rules` 定义了多维度评估标准（清晰度判定、打标规则、强制兜底）
- `answerAnalysis` 定义了收尾话术的生成规范

---

## 八、"半结构化内容驱动"架构原则的证据

### 8.1 核心原则：行为由内容脚本控制而非平台硬编码

以下字段体现了这一架构原则：

#### (1) `passConditions` —— 通关逻辑写在内容中

通关条件完全以自然语言定义在 AOM 数据中，而非硬编码在平台代码里。这意味着：
- 课程设计师可以定义任意复杂的通关逻辑
- 平台无需为每种通关场景写代码
- AI 大模型负责解释和执行这些自然语言规则

**证据**：
```json
"passConditions": {
  "description": "场景类型、对方动机、学员风格，达到'两项清晰一项模糊'即可通关",
  "rules": [
    "【清晰度判定】清晰=有具体动作/内在原因/具体应对；模糊=笼统描述...",
    "【打标规则】若三清或两清一模：按高频类型投票匹配...",
    "【强制兜底机制-触发即结束并输出类型B】..."
  ]
}
```

#### (2) `solution` —— AI 行为准则写在题目中

`solution` 字段在 quiz 中不仅存放解题步骤，更直接指挥 AI 的对话行为：

```json
"solution": "【AI行为准则：引导三步走】\n第一步（探场景）：用开放式问题...\n第二步（挖动机）：...\n第三步（看风格）：...\n注：保持好奇、不评判，多用'嗯''明白了'承接。"
```

这实质上是一段写在内容数据中的"AI Prompt 脚本"。

#### (3) `answerAnalysis` —— 收尾话术模板写在内容中

```json
"answerAnalysis": "【收尾话术生成规范】当满足通关或兜底条件时，必须使用以下结构收尾..."
```

连 AI 的结束语都由内容脚本规定，而非平台默认行为。

#### (4) `blueprint` —— 教学设计意图嵌入数据

`blueprint` 不仅是文档，更是给 AI 导师的"元指令"，让 AI 理解每个环节的教学目的，从而在交互中做出符合教学意图的决策。

#### (5) `separateTag` + `groupKey` —— 自适应逻辑写在内容中

自适应分流不需要平台额外配置路由规则。课程设计师只需在内容中标注 `separateTag` 和 `groupKey`，平台按约定匹配即可。分流的类型名称（"防御拖延型""利益博弈型""情绪对抗型"）完全由内容定义，平台不需要预知这些类型。

#### (6) `rule` —— 交互规则写在内容中

```json
"rule": "触发通关条件或强制兜底机制后，播放结束话术并终止对话"
```

vs

```json
"rule": "播放完毕"
```

不同 SCO 的结束条件由内容自行定义，平台只需执行。

### 8.2 架构模式总结

| 维度 | 硬编码方式 | 本 AOM 的内容驱动方式 |
|------|----------|-------------------|
| 通关判定 | 平台代码写死"答对3题即通过" | `passConditions` 自然语言描述，AI 大模型解释执行 |
| AI 对话行为 | 平台统一对话策略 | `solution` 字段为每道题定义独立的 AI 行为脚本 |
| 收尾话术 | 平台默认模板 | `answerAnalysis` 中定义话术生成规范 |
| 自适应分流 | 平台配置路由表 | `separateTag` + `groupKey` 在内容中自描述 |
| 交互结束条件 | 平台统一计时/计次 | `rule` 字段按 SCO 自定义 |
| 教学策略 | 平台统一教学流程 | `blueprint` 为每个 SCO 提供独立的教学设计意图 |

---

## 九、完整结构树状图

```
Project: 横向协作：销售内测
├── projectName, description, learningObjectives, learnerProfile,
│   competencyGoals, hotWords, lang, excludeReport
│
└── modules[]
    └── Module: 横向协作
        ├── moduleName, moduleDescription
        │
        └── activities[]
            │
            ├── Activity 1: 课前互动 (guidance_0, lecture, isIntroduction=true)
            │   └── scoFlow[]
            │       ├── SCO 1.1: 横向协作的痛点唤醒 [NARRATION, tutorMode=0]
            │       │   └── segmentList: 2 segments (ppt)
            │       │       ├── 1.1 横向协作三部曲 (separateTag="", groupKey="1.1")
            │       │       └── 1.2 横向协作的"扎心"日常 (separateTag="", groupKey="1.2")
            │       │
            │       ├── SCO 1.2: 课前互动：你的专属协作剧本 [CHAT, tutorMode=0]
            │       │   └── sco: quiz (1 question)
            │       │       └── Q1: 开放式多轮对话诊断 (showAnswer=false)
            │       │           ├── passConditions: 三维诊断(场景/动机/风格)
            │       │           └── separateTag="", groupKey="2.1"
            │       │
            │       └── SCO 1.3: 横向协作三部曲学习全景图概览 [NARRATION, tutorMode=0]
            │           └── segmentList: 1 segment (ppt)
            │               └── 3.1 横向协作三部曲全景图 (separateTag="", groupKey="3.1")
            │
            ├── Activity 2: 沟通卡住了？PIN法三步走 (lecture_1, lecture, isIntroduction=false)
            │   └── scoFlow[]
            │       ├── SCO 2.1: 概念引入与PIN模型拆解 [NARRATION, tutorMode=0]
            │       │   └── segmentList: 7 segments (全部 ppt)
            │       │       ├── 1.1~1.7: 课程封面→学习目标→冰山模型→P→I→N→核心法则
            │       │       └── 全部 separateTag=""
            │       │
            │       ├── SCO 2.2: PIN三要素识别测试 [NARRATION, tutorMode=0]
            │       │   └── sco: quiz (1 question)
            │       │       └── Q1: 场景分析题 (showAnswer=true)
            │       │           ├── passConditions: 三层结构+心理层面分析
            │       │           ├── knowledgePoints: kp_0001(PIN模型), kp_0002(分层分析)
            │       │           └── separateTag="", groupKey="2.1"
            │       │
            │       ├── SCO 2.3: PIN法的应用与场景策略 [NARRATION, tutorMode=0]
            │       │   └── segmentList: 2 segments (ppt)
            │       │       ├── 3.1 沟通运用三步法
            │       │       └── 3.2 不同场景下的PIN应用策略
            │       │
            │       ├── SCO 2.4: 场景策略选择测试 [NARRATION, tutorMode=0]
            │       │   └── sco: quiz (1 question)
            │       │       └── Q1: 象限判断题 (showAnswer=true)
            │       │           ├── passConditions: 象限匹配+核心要素
            │       │           ├── knowledgePoints: kp_0001~kp_0003
            │       │           └── separateTag="", groupKey="4.1"
            │       │
            │       ├── SCO 2.5: 视频案例与解析 [NARRATION, tutorMode=1] ★自适应★
            │       │   └── segmentList: 10 segments (3组×3版本 + 1通用)
            │       │       ├── groupKey="5.1" × 3版本 (ppt, 案例导入)
            │       │       │   ├── separateTag="防御拖延型"
            │       │       │   ├── separateTag="利益博弈型"
            │       │       │   └── separateTag="情绪对抗型"
            │       │       ├── groupKey="5.2" × 3版本 (asvideo, 视频案例)
            │       │       │   ├── separateTag="防御拖延型" → 《迟到的数据报告》
            │       │       │   ├── separateTag="利益博弈型" → 《争夺的预算池》
            │       │       │   └── separateTag="情绪对抗型" → 《越界的临时需求》
            │       │       └── groupKey="5.3" × 3版本 (ppt, 案例解析)
            │       │           ├── separateTag="防御拖延型"
            │       │           ├── separateTag="利益博弈型"
            │       │           └── separateTag="情绪对抗型"
            │       │
            │       └── SCO 2.6: 知识全景图 [NARRATION, tutorMode=0]
            │           └── segmentList: 1 segment (ppt)
            │               └── 6.1 课程总结与全景图
            │
            └── Activity 3: 课程回顾 (lecture_4, lecture, isIntroduction=false)
                └── scoFlow[]
                    ├── SCO 3.1: 课程回顾与总结 [NARRATION, tutorMode=0]
                    │   └── segmentList: 1 segment (ppt)
                    │
                    ├── SCO 3.2: 工具应用图谱 [NARRATION, tutorMode=0]
                    │   └── segmentList: 1 segment (ppt)
                    │
                    ├── SCO 3.3: PIN法：穿透表象的洞察 [NARRATION, tutorMode=0]
                    │   └── segmentList: 1 segment (ppt)
                    │
                    ├── SCO 3.4: 推拉沟通法：平衡关系的张力 [NARRATION, tutorMode=0]
                    │   └── segmentList: 1 segment (ppt)
                    │
                    └── SCO 3.5: POWER利益沟通法：重组利益化解冲突 [NARRATION, tutorMode=0]
                        └── segmentList: 1 segment (ppt)
```

---

## 十、关键发现总结

1. **AOM 是一个完全自描述的课程数据包**：从教学目标到 AI 行为规则，从通关条件到自适应分流，全部由内容数据定义，平台只需要一个通用的"解释执行引擎"。

2. **自适应机制简洁而有效**：通过 `separateTag` + `groupKey` + `tutorMode` 三个字段的组合，实现了"课前诊断 -> 打标 -> 个性化内容分发"的完整闭环，无需额外的路由配置。

3. **AI 大模型是执行引擎的核心**：`passConditions`、`solution`、`answerAnalysis`、`blueprint` 都是自然语言指令，需要 AI 大模型来理解和执行。这使得课程设计师可以用自然语言"编程"AI 的行为。

4. **两种内容承载模式并存**：SCO 要么使用 `segmentList`（直接嵌入内容片段，用于 PPT/视频播放），要么使用 `sco` 对象（独立的交互单元，如 quiz），两者互斥。

5. **interactionPoint 是教学设计的灵魂**：它不仅定义了交互类型和规则，更通过 `blueprint` 字段嵌入了完整的教学设计理念，使 AI 能够"理解"每个环节的教育目的。

6. **内容多态性**：同一个 segment 位置（相同 groupKey）可以有多个不同版本（不同 separateTag），这是一种类似"多态"的设计模式，由运行时的学员状态决定具体展示哪个版本。

7. **asvideo 格式是一种轻量级动画视频格式**：由多个"场景"（背景图 + 角色对话帧列表）组成，每帧包含音频、字幕、说话人信息。这是一种在 PPT 和真实视频之间的折中方案，兼顾了表现力和制作效率。
