# 议题 X1 · 懂你 · 记忆系统底层原则 · 调研 brief

> **底层原则**：P2 · 懂你（每次交互让 Agent 更精准地理解你）
> **调研目标**：建立睿学 Agent 记忆系统的底层方法论 + 选型参考
> **不是 feature，是底层议题**——决定 Neo 6 个月陪伴是否能"真的懂"
> **日期**：2026-04-26
> **状态**：v0.1 调研启动稿

---

## 1. "越用越懂"的 5 层渐进定义

> 调研的第一步是**精确定义**"懂"，而不是直接做技术选型。

| 层级 | 名称 | 内容 | 触发频率 | 调用语境 |
|------|------|------|---------|---------|
| **L1** | 基础事实 | 你的姓名、岗位、公司、所属团队、入职时长 | 一次性采集 | 几乎从不主动调用，作为背景 |
| **L2** | 行为模式 | 你的学习节奏、答题习惯、提问偏好、活跃时段 | 每周更新 | 决定 Neo 的"教法"——不是"内容" |
| **L3** | 价值偏好 | 你认同什么管理观点、反对什么、最在意什么 | 每月更新 | 在讨论 / 反思中作为"对照镜" |
| **L4** | 隐性需求 | 你嘴上说的 vs 真正想要的差距、你的职业焦虑、你的隐形目标 | 每 1-3 月更新 | 极少主动引用，但影响 Neo 的引导方向 |
| **L5** | 自我认知 | 你怎么看自己 / 怎么希望被看 / 你的成长轨迹 | 几乎不主动更新 | 在重要节点（结项 / 关键失败）调用 |

**核心约束**：
- L1-L2 是**事实型**（对错可验证）
- L3-L5 是**推断型**（必须低置信度调用，"我**感觉**你更倾向于…"）
- Neo 不能把 L4-L5 的推断当作 L1-L2 的事实使用

---

## 2. 记忆系统的 4 个核心问题

### Q1 · 记什么（Memory Selection）
- 不是所有对话都值得存进长期记忆
- 候选：高光瞬间 / 卡点 / 立场表达 / 跨课程关联 / 学员主动提出的事项
- 反例：闲聊 / 重复确认 / 模板化回应

### Q2 · 怎么存（Memory Storage Structure）
- 单线时间序（chronological log）vs 主题聚合（topic-based）vs 实体图谱（knowledge graph）
- 权衡：检索效率 vs 关联挖掘 vs 维护成本
- 多层混合：原始对话存 log，提炼后入主题，关键实体上图谱

### Q3 · 何时调（Memory Retrieval Trigger）
- 主动调用：Neo 判定当前情境与历史相关
- 被动调用：学员问"你还记得吗？"
- 防过度：不能每句都引用历史，会显得"机械"
- 时机选择：开场 / 卡点 / 反思 / 跨课程衔接 是高价值时机

### Q4 · 如何避免幻觉（Memory Hallucination Prevention）
- LLM 倾向于"补全"——可能编造 Neo "记得"的事
- 必须有 retrieval 而非 generation
- 检索结果必须可追溯（哪次对话 / 哪个 Activity）
- 学员可以质疑："你说我说过 X 是真的吗？" → Neo 必须能给出原文

---

## 3. 对标参考清单（待 W2 调研）

### 3.1 通用 LLM 记忆框架

| 项目 | 类型 | 调研重点 | 链接 |
|------|------|--------|------|
| **Mem0** | 开源记忆层 | 多 LLM 适配的 memory abstraction layer 怎么设计 | github.com/mem0ai/mem0 |
| **Letta**（原 MemGPT）| 开源 long-term memory agent | 主动 memory edits + 分层 context window | github.com/letta-ai/letta |
| **Zep** | 开源 memory store | semantic memory + temporal knowledge graph | github.com/getzep/zep |
| **LangChain Memory** | 框架内置 | 6 种 memory 类型对比（Buffer/Summary/Entity/KG/Conversation/VectorStore）| python.langchain.com |
| **LlamaIndex** | RAG + Memory | retrieval-augmented memory 的标准模式 | llamaindex.ai |

### 3.2 产品级记忆样本

| 产品 | 类型 | 调研重点 |
|------|------|--------|
| **ChatGPT Memory**（2024 起）| 通用助手 | 主动 memory editing UI / "Stop saving"机制 / 用户可见性 |
| **Character.AI** | 角色扮演 | 长对话连贯性 / 角色一致性 / Pinned memory |
| **Replika** | 情感陪伴 | 长期亲密关系建模 / 学员日记式记忆 / 情绪 tracking |
| **Pi (Inflection)** | 对话陪伴 | 个性化背景知识 / 对话风格记忆 |
| **Khanmigo (Khan Academy)** | 教育 | 学习进度记忆 / 错题模式 / 教学策略调整 |

### 3.3 学术参考（待 WebSearch）

- "Long-term Memory for Conversational Agents" (2023+)
- "Hierarchical Memory Networks" / "MemGPT: Towards LLMs as Operating Systems"
- "Personalized LLM Agents via In-Context Learning"
- "Retrieval-Augmented Generation for Long-Term Memory"

---

## 4. spec 中的现状

### 已有（spec § 8.2 + learner spec）
- "统一 Database" 概念
- 跨场域记忆贯通（Neo 在大厅可引用对练）
- 跨会话长上下文（不重置）
- AOM 5 层数据模型（Project/Course/Activity/SCO/Segment）
- coaching-skills 项目的 `enablementSignalEngine` / `competencyDynamicsEngine`（已有部分实现）

### 缺（5 大缺口）
1. **5 层渐进画像**（L1-L5）的明确分层 → spec 未提
2. **记忆调用主动性**的设计原则 → spec 未明确
3. **幻觉防御机制** → spec 未提
4. **学员可见性边界** → 学员能看到 Neo "记得"自己什么吗？spec 未明确
5. **HR 端可见性边界** → 哪些记忆可被 Ora 引用、哪些必须脱敏？与 0424 红线 C-06 直接相关

---

## 5. 调研关键问题（W2 启动）

### 必答 10 问

1. Mem0 / Letta / Zep / LangChain Memory 各自的设计哲学差异？
2. ChatGPT Memory 怎么决定"什么值得记"？UI 怎么展现？
3. Character.AI 长对话如何保持人格一致性？
4. Replika 的"长期陪伴"记忆模型有什么独特之处？
5. RAG 风格 vs 主动 memory editing 风格哪个更适合教育场景？
6. 多场域跨记忆调用的工业实践（医疗 / 法律 / 教育领域）？
7. 学员可见的 memory UI 怎么做？是 ChatGPT 那种"管理记忆"还是别的？
8. 防幻觉的最佳实践（强制 retrieval / 引文 / 拒答）？
9. 记忆数据脱敏与合规（GDPR / 教育数据）的工业标准？
10. 长对话的 token cost 优化（不能每次都把 6 个月历史都送进去）？

### 选答 5 问

11. Persona-based memory（按人格区分的记忆）实现路径？
12. 记忆 vs 模型微调的边界——什么该记忆什么该 finetune？
13. 多模态记忆（文本 + 行为日志 + 时间戳）的融合？
14. memory consolidation（睡眠期记忆整理）的工业实践？
15. 学员授权机制：学员可控自己的"被遗忘权"？

---

## 6. 期望产出（v1.0 时）

### 主产出

#### Document 1 · `Neo 记忆系统设计原则.md`
- L1-L5 5 层定义 + 各层的存储 / 调用规则
- 4 个核心问题（记什么/怎么存/何时调/防幻觉）的睿学答案
- 学员可见性 / HR 可见性 边界
- 与 0424 红线 C-06（脱敏）的关系

#### Document 2 · `Neo 记忆系统技术选型.md`
- 候选技术栈对比（Mem0 / Letta / Zep / LlamaIndex / 自研）
- 推荐方案 + 理由
- 与现有 spec § 8.2"统一 Database"的衔接路径

#### Document 3 · `Neo 记忆调用 voice 库.md`
- 30+ 条 Neo 引用记忆的 voice 范例
- 主动 / 被动 / 拒答（学员问"你记得我吗？"但其实没记） 三类
- 与 Soul Voice 的协同

### 副产出

- 学员可见性 UI 设计原则（"我要让学员看到我记住了什么"还是"不可见"？）
- 记忆数据脱敏 SOP（与 0424 决策 C-06 联动）
- 长期 token cost 优化策略

---

## 7. 与其他底层原则的关系

| 原则 | 关系 |
|------|------|
| **P1 第一性原理** | 记忆服务于"做老师该做的事"——不为存而存 |
| **P3 Soul / Persona** | Soul 决定记忆调用的 voice，记忆调用必须符合 Neo 人格 |

---

## 8. 风险

1. **过度工程化**：可能陷入"完美记忆系统"幻觉，6/1 项目落地用不上
2. **隐私合规**：学员真实工作内容（涉及同事/客户）入记忆，HR 看到怎么办？
3. **性能 / token cost**：6 个月对话历史的检索成本可能爆炸
4. **跨 Agent 共享**：Neo 的记忆和 Ora 的记忆是不是同一份？两者权限边界？

---

## 9. 调研路径（W2 安排）

| 周 | 动作 | 产出 |
|----|------|------|
| W1（剩余）| 本 brief 完成 + DM 审阅 | brief v0.1 |
| W2 | WebSearch 上述 5 项目 + 5 产品 + 5 论文 | `02-temp/0426-memory-research-W2-notes.md` |
| W3 | 写 Document 1（设计原则）| 设计原则 v0.1 |
| W4 | 写 Document 2（技术选型）| 选型 v0.1 |
| W5 | 写 Document 3（voice 库）+ 整合到 Neo Persona v0.2 | voice 库 + Persona v0.2 |
| W6+ | HR 访谈反馈调整 + 与 P3 Soul 协同 | v1.0 |

---

**文档状态**：P2 调研 brief · v0.1
**下一步**：W2 启动调研，按"必答 10 问"清单顺序展开
