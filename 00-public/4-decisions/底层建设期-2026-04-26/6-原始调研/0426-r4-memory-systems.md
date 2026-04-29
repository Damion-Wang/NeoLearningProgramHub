# B2.P2 · 记忆系统调研产出

> **底层原则**：P2 · 懂你 · 记忆系统底层原则
> **调研者**：Claude Opus 4.7（主上下文）— 因 Agent API 配额限制改自跑
> **日期**：2026-04-26
> **状态**：发散稿，不收敛——待 DM 后续 debate 选型

---

## 0. 重大发现摘要

### 0.1 行业格局
- **5 大开源框架**：Mem0 / Letta(MemGPT) / Zep / LangChain Memory / LlamaIndex
- **3 类设计哲学**：drop-in 服务（Mem0）/ OS-inspired tiered（Letta）/ temporal knowledge graph（Zep）
- **企业治理 gap 普遍存在**：所有 8 个主流框架都缺企业级治理（business glossary / data lineage / authority designation）

### 0.2 性能 benchmark
- LongMemEval 测试（GPT-4o）：**Zep 63.8% > Mem0 49.0%**（15-point 优势）
- Letta（third-party 测试）：约 83.2% LongMemEval

### 0.3 教育场景关键发现
- **Khanmigo（Khan Academy）= 教育场景最直接对标**：用 Socratic method + mastery+prerequisites memory
- ChatGPT Memory 限制：约 1200-1400 词
- Character.AI Memory：限制 400 字符 + Pinned Memory 15 条 / 没有真长期记忆

### 0.4 防幻觉的关键技术
- Citation hallucination 是 RAG 最严重 sub-problem
- FACTUM / ReDeEP / RAGTruth 数据集
- Meta BlenderBot 3（175B + live search + long-term memory）

---

## 1. 5 大开源框架对比

### 1.1 详细对比表

| 框架 | 设计哲学 | 核心机制 | 三层架构 | 性能 | License | 教育场景适配 |
|------|---------|---------|---------|------|---------|-------------|
| **Mem0** | drop-in 服务，self-editing memory | 三层 scope（user/session/agent）+ 混合存储（vector + graph + KV）| user/session/agent | 49% LongMemEval | Apache 2.0（但 SaaS-first）| 学员进度跟踪稳定，但 SaaS 成本（$19→$249/月）|
| **Letta（MemGPT）** | OS-inspired，agent 主动管理 memory | 双层架构：main context + external context；functions 在两层间移动 | core / archival / recall | 83.2% LongMemEval | 开源 | 实验性强，社区驱动；生产级度待验证 |
| **Zep / Graphiti** | temporal knowledge graph | 时间知识图谱 + 语义相似性 | 单层但 KG 维度 | 63.8% LongMemEval（+15 pts on temporal）| 开源（Community Edition）| 适合学员关系图谱，但 Graphiti 需大量自定义工程 |
| **LangChain Memory** | 模块化 + 生态集成 | 6 种类型（Buffer/Summary/Entity/KG/Conversation/VectorStore）| 可插拔 | 无统一 benchmark | MIT | 灵活但碎片化 |
| **LlamaIndex** | retrieval-augmented memory | 标准 RAG 模式 | 单层 | 无统一 benchmark | MIT | 偏文档检索，不偏对话 |

### 1.2 实战建议（来自独立评测）

| 场景 | 推荐 | 不推荐 |
|------|------|--------|
| 立即生产 + SaaS | **Mem0** | Letta（生产度不够）/ Zep（unpolished）|
| 学习 + 实验 | **Letta** | Mem0（自托管文档少）|
| temporal reasoning | **Zep** | Mem0 / Letta（温度图弱）|
| 学员陪伴 + 长记忆 | **Mem0**（最稳）| Zep（未成熟）|
| 多 Agent 协调 | **Letta**（原生支持）| Mem0 / Zep |

### 1.3 营销 vs 现实（关键警示）

- **Mem0** 标榜 "open source" 但实际 "SaaS-first"，自托管文档稀疏
- **Zep** 论文被批 "one of the most pretentious and least informative academic documents"
- **Letta** 社区热度掩盖了产品成熟度问题
- **教训**：选型前必须实测，不轻信营销

---

## 2. MemGPT 论文核心思想（深度）

### 2.1 元数据
- **论文**：Packer et al., "MemGPT: Towards LLMs as Operating Systems" (arXiv 2310.08560, 2023, updated 2024-02)
- **团队**：UC Berkeley（Charles Packer / Sarah Wooders / Kevin Lin / Vivian Fang / Shishir Patil / Joseph Gonzalez）
- **影响**：催生了 Letta 框架

### 2.2 核心思想

LLM 的 context window 类似 OS 的 RAM——有限。MemGPT 借鉴 OS 内存管理：
- **main context**（in-context，类比 RAM）：当前对话直接可用
- **external context**（out-of-context，类比 disk）：分两类
  - **archival storage**（外部可搜索向量库）
  - **recall storage**（对话历史）

LLM 用 **function calls** 主动在两层之间移动数据：
- 当 RAM 不够时，evict 到 disk（archival）
- 需要时主动 retrieve

### 2.3 Application

- **document analysis**：处理超过 context window 的大文档
- **multi-session chat**：跨多次对话保持记忆，"remember, reflect, evolve"

### 2.4 对睿学的启发

- Neo 在 6 个月项目里需要类似 MemGPT 的"主动管理"能力
- 不是被动 RAG，而是 Neo 自己判断"该把什么写进 archival"
- 与 P3 Soul 联动：Neo 的人格决定它"写什么进记忆"

---

## 3. 5 产品级样本对比

### 3.1 详细对比表

| 产品 | 记忆模型 | 用户可见性 | UI 设计 | 失败模式 | 学员体验 |
|------|---------|----------|---------|---------|---------|
| **ChatGPT Memory** | saved memories（用户主动）+ chat history（系统自动 insights）| 高 | Settings > Personalization > Memory > Manage（review/delete/clear/Temp Chat）| 1200-1400 词容量限制 | 用户可命令 "Remember this..." / 可问 "What do you remember about me?" |
| **Character.AI** | Pinned Memories（15 条/聊天）+ Memory Box（400 字符）| 中 | 用户可 pin 消息 | 没有真长期记忆，session 化 prone to drift | 适合短期角色扮演，不适合 6 月项目 |
| **Khanmigo（Khan Academy）** | mastery of skill + prerequisites + 主动 review | 低（背景，但教师可见）| 无显式 UI，融入对话 | 取决于 Khan Academy 的 skill graph | **Socratic method 引导 + 教师 dashboard 实时监控** |
| **Replika** | 长期亲密关系 + 学员日记式 + 情绪 tracking | 中 | 用户可看到 Replika 的 "memory" | 倾向"过度个人化" | 偏情感陪伴，不偏教学 |
| **Pi (Inflection)** | 个性化背景知识 + 对话风格记忆 | 中 | 隐性 | 设计封闭 | 偏对话流畅，不偏长期目标 |

### 3.2 教育场景关键参考：Khanmigo

> Khanmigo 是教育场景**最直接的对标**——它用 Socratic method 引导（不给答案），与 Neo 第一性原理完全契合。

#### Khanmigo 的记忆要素
1. **Mastery of skill**：学员对每个 skill 的掌握度
2. **Prerequisites**：知识前置依赖图谱
3. **主动 review prompt**：当学员需要时，Khanmigo 自动建议复习 prerequisites
4. **Teacher dashboard**：教师实时看到 student progress + 收到关于学员理解度的消息
5. **Standards-aligned lesson planning**：与 Khan Academy 内容库对齐

#### 对睿学 Neo 的启发
- Khan Academy 的 skill graph + mastery 概念可借鉴到 AOM 5 层模型
- "Socratic method 引导 + 不给答案" = Neo 的核心方法
- Teacher dashboard = HR/Ora 的看板（已在 spec 中）
- Khanmigo 的 memory 颗粒度是 **skill + 学员掌握度**，不是"对话片段"——值得学习

---

## 4. 4 核心问题的答案

### 4.1 Q1 · 记什么（Memory Selection）

#### 业内方案对比
| 方案 | 选择策略 |
|------|---------|
| ChatGPT | 系统自动选 + 用户命令 "Remember this..." |
| Character.AI | 用户 pin（最多 15 条/聊天）|
| Mem0 | 用 LLM 判定"是否值得记"，self-editing |
| MemGPT | Agent 自己 function call 写入 archival |
| Khanmigo | 按 skill mastery 维度自动记 |

#### 推荐睿学方向（候选）
1. **Khanmigo 风格**：按 skill / Activity / 学员状态 维度自动记
2. **MemGPT 风格**：让 Neo 自己判定（function call）
3. **混合**：默认按维度，关键时刻 Neo 主动加注

### 4.2 Q2 · 怎么存（Memory Storage Structure）

| 方案 | 优势 | 劣势 |
|------|------|------|
| **Vector store**（embedding）| 语义检索强、成本可控 | 缺时间维度 / 缺关系 |
| **Knowledge graph**（Zep）| 时间维度强、关系挖掘 | 复杂、维护成本高 |
| **Hybrid**（Mem0）| 三者结合 | 一致性挑战 |
| **Hierarchical**（MemGPT）| 类 OS 分层 | 需要 LLM 主动管理 |

#### 推荐睿学方向
- **多层混合**：原始对话 → 主题聚合（按 Activity）→ 实体图谱（按学员/课程）
- 与 spec § 8.2 "统一 Database" 概念兼容

### 4.3 Q3 · 何时调（Memory Retrieval Trigger）

| 触发类型 | 方案 |
|--------|------|
| **主动调用**（Neo 判断） | MemGPT 风格 / Mem0 self-editing |
| **被动调用**（学员问） | "你还记得吗？" → 检索 |
| **半自动**（信号触发） | 学员卡点 / 跨课程跳转 / 情绪变化 / 时间间隔 |

#### 防过度调用
- 不能每句都引用历史（会显得机械）
- 关键时机：开场 / 卡点 / 反思 / 跨课程衔接 / 情绪触发
- 与 P3 Soul 联动：Neo voice 决定调用语气（朴素、不机械）

### 4.4 Q4 · 如何避免幻觉（Memory Hallucination Prevention）

#### 业内研究关键点
- **Citation hallucination**：RAG 最严重 sub-problem
- 即使 SOTA 模型也频繁 mis-attribute 或 fabricate sources
- 论文：FACTUM / ReDeEP / RAGTruth 数据集

#### 防御机制
1. **强制 retrieval**：必须从 vector store 检索后才能引用，禁止纯 generation
2. **可追溯**：每个引用必须能追溯到原对话 + Activity + 时间戳
3. **学员可质疑**：学员说"你说我说过 X，是真的吗？"→ Neo 必须能给出原文
4. **拒答机制**：找不到证据时，Neo 应说"我记得不太清楚，你方便提一下吗？"而不是编造
5. **置信度分层**：L1-L2 事实型（高置信度可引用）/ L3-L5 推断型（低置信度，加"我感觉…"）

---

## 5. 5 层渐进画像（v0.1 brief 深化）

| 层级 | 名称 | 内容 | 业内对标 |
|------|------|------|--------|
| **L1** | 基础事实 | 姓名、岗位、公司、入职时长 | ChatGPT saved memories / Mem0 user scope |
| **L2** | 行为模式 | 学习节奏、答题习惯、活跃时段 | Mem0 session scope / Khanmigo 学员行为 |
| **L3** | 价值偏好 | 认同的管理观点 / 反对的 / 在意的 | Letta archival / 自我 reflection |
| **L4** | 隐性需求 | 嘴上 vs 真正想要的差距 | 较少业内对标，是 Neo 独有 |
| **L5** | 自我认知 | 怎么看自己 / 希望被看 / 成长轨迹 | 极少业内对标，与 P3 Soul 联动 |

**置信度规则**：
- L1-L2 事实型（对错可验证）→ 可直接引用
- L3-L5 推断型 → 加"我**感觉**"等限定语，低置信度调用

---

## 6. 哲学冲突（debate 种子）

### 冲突 1 · "存全部" vs "选择性存"
- **存全部**：MemGPT 风格 / 不丢信息
- **选择性存**：Mem0 风格 / 节省 token / 但丢失细节
- **冲突**：教育场景 6 月项目，"存全部"会爆 token，"选择性存"可能丢学员关键卡点

### 冲突 2 · "用户透明" vs "黑盒"
- **透明**：ChatGPT 让用户管理 memory / Khanmigo 教师 dashboard
- **黑盒**：Character.AI / Replika
- **冲突**：学员要不要看到 Neo "记得" 自己什么？HR 要不要看到？

### 冲突 3 · "RAG 检索" vs "主动 edit"
- **RAG**：被动响应、依赖 query 质量
- **主动 edit**：MemGPT 风格、Agent 决定
- **冲突**：Neo 该被动还是主动管理记忆？

### 冲突 4 · "结构化" vs "向量化"
- **结构化**：Knowledge graph / 易解释难维护
- **向量化**：Embedding / 易维护难解释
- **冲突**：Neo 记忆要"可解释"还是"高效"？

### 冲突 5 · "学员可控" vs "Neo 自主"
- **学员可控**：ChatGPT 的"被遗忘权"
- **Neo 自主**：MemGPT / 学员不干预
- **冲突**：合规要求 vs 教学连续性

---

## 7. 教育场景特殊挑战

### 7.1 6 月跨度的特殊性
- 不是聊天伙伴的"持续陪伴"——有明确的"学习目标"
- 早期记忆 vs 晚期记忆的"重要性差异"——后期看不应该忘记早期的认知卡点
- token cost 极致优化——不可能每次都送 6 月历史

### 7.2 多场域（大厅/授课/对练/调研/报告）
- 跨场域记忆贯通是 Neo 的核心承诺
- 但每场域的"记忆调用模式"不同
  - 大厅：高频引用、跨课程
  - 授课：聚焦当前 Activity
  - 对练：不能破游戏感、谨慎引用
  - 调研：采集为主、不剧透
  - 报告：高密度引用、证据导向

### 7.3 HR 可见 vs 学员可见
- 与 0424 决策 C-06（脱敏红线）直接联动
- HR 看到的"学员档案" ≠ 学员看到的 Neo 对话历史
- 设计要点：分层访问 + 摘要化 vs 原文

### 7.4 内容（管理学）的特殊性
- 学员真实工作内容（涉及同事 / 客户 / 项目）入记忆
- 隐私 / 合规 / 信任建立的多重张力

---

## 8. 给睿学的可借用清单

| 元素 | 来源 | 借用方式 | 优先级 |
|------|------|---------|--------|
| **5 层渐进画像** | 自建（基于多家产品观察）| 直接借用 | P0 |
| **mastery + prerequisites** | Khanmigo | 直接借用，融入 AOM | P0 |
| **Socratic method + 不给答案** | Khanmigo | 已是 Neo 第一性原理 | P0（已立）|
| **MemGPT 双层架构（main+external）** | MemGPT 论文 | 改造借用，与 spec § 8.2 衔接 | P1 |
| **可追溯引用（防幻觉）** | RAG 防幻觉研究 | 直接借用，强制 retrieval + 引文 | P0 |
| **学员可见 memory UI** | ChatGPT Memory | 改造借用，按 5 层简化 | P1 |
| **Pinned Memories 思想** | Character.AI | 启发设计，关键卡点学员可 pin | P2 |
| **置信度分层（高 / 低）** | LLM 一般实践 | 直接借用，区分 L1-L2 vs L3-L5 | P0 |
| **三层 scope（user/session/agent）** | Mem0 | 启发设计 | P2 |
| **temporal knowledge graph** | Zep | 启发设计，"两个月前 vs 现在"对比 | P2 |
| **学员可质疑机制** | RAG 防幻觉研究 | 直接借用 | P0 |
| **拒答机制** | RAG 防幻觉研究 | 直接借用 | P0 |
| **Constitutional AI 自我 critique**（与 P3 联动）| Anthropic | 改造借用 | P2 |

---

## 9. 风险与盲区

### 风险
1. **token cost 爆炸**：6 月项目历史 + 多场域记忆 + 多学员
2. **隐私合规**：学员真实工作内容入记忆 → HR 边界
3. **多 Agent 共享 vs 隔离**：Neo / Ora 是同一份记忆吗？
4. **企业治理 gap 普遍**：所有框架都缺企业级治理
5. **生产级度警示**：Letta / Zep 都未达生产级，Mem0 SaaS-first

### 盲区
1. **中国本地化**：Mem0 / Letta / Zep 在中国的可访问性 / 合规性 / 数据出境
2. **大模型自适应**：所有框架都假设 GPT/Claude 调用，国产模型适配？
3. **6 月跨度的真实测试**：所有 benchmark 都是短期对话，6 月真实使用没人测过
4. **教育合规**：FERPA / GDPR / 中国《个人信息保护法》/ 教育数据
5. **memory consolidation（睡眠期记忆整理）**：业内实践不成熟

---

## 10. 必答 10 问的初步答案

| # | 问题 | 答案要点 |
|---|------|--------|
| 1 | 5 框架设计哲学差异？ | drop-in（Mem0）/ OS-tiered（Letta）/ KG（Zep）/ 模块化（LangChain）/ RAG（LlamaIndex）|
| 2 | ChatGPT Memory 怎么决定记什么？UI？ | saved memories（用户主动）+ chat history（系统自动）/ Settings > Personalization > Memory > Manage |
| 3 | Character.AI 长对话一致性？ | **不行**——session 化、易漂移；Pinned Memory 15 条 + Memory Box 400 字符 |
| 4 | Replika 长期陪伴有何独特？ | 情感 + 日记 + 情绪 tracking；偏陪伴非教学 |
| 5 | RAG vs 主动 edit 哪个适合教育？ | **混合**：日常 RAG（节省 token），关键时刻主动 edit（MemGPT）|
| 6 | 多场域跨记忆调用工业实践？ | 业内未直接对标；Mem0 三层 scope 最近 |
| 7 | 学员可见 memory UI？ | ChatGPT 风格：list + delete + clear；Khanmigo 隐性 |
| 8 | 防幻觉最佳实践？ | 强制 retrieval + 可追溯引文 + 拒答机制 + 置信度分层 |
| 9 | 数据脱敏与合规？ | 业内 gap，需自研（与 0424 C-06 联动）|
| 10 | 长对话 token 优化？ | 分层（main+external）+ summarization + 选择性载入 |

---

## 11. 引用清单

### 框架对比
- [Atlan · Best AI Agent Memory Frameworks 2026](https://atlan.com/know/best-ai-agent-memory-frameworks-2026/)
- [DEV · 5 AI Agent Memory Systems Compared](https://dev.to/varun_pratapbhardwaj_b13/5-ai-agent-memory-systems-compared-mem0-zep-letta-supermemory-superlocalmemory-2026-benchmark-59p3)
- [OmegaMax · Mem0 vs Zep vs Letta vs OMEGA](https://omegamax.co/compare)
- [Hermes OS · AI Agent Memory Systems 2026](https://hermesos.cloud/blog/ai-agent-memory-systems)
- [Calvin Ku · From Beta to Battle-Tested](https://medium.com/asymptotic-spaghetti-integration/from-beta-to-battle-tested-picking-between-letta-mem0-zep-for-ai-memory-6850ca8703d1)
- [Vectorize · Mem0 vs Letta (MemGPT)](https://vectorize.io/articles/mem0-vs-letta)
- [Graphlit · Survey of AI Agent Memory Frameworks](https://www.graphlit.com/blog/survey-of-ai-agent-memory-frameworks)

### MemGPT
- [arXiv 2310.08560 · MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560)
- [Leonie Monigatti · MemGPT 解读](https://www.leoniemonigatti.com/papers/memgpt.html)
- [DigitalOcean · MemGPT with Real-life Example](https://www.digitalocean.com/community/tutorials/memgpt-llm-infinite-context-understanding)

### ChatGPT Memory
- [OpenAI · Memory and new controls for ChatGPT](https://openai.com/index/memory-and-new-controls-for-chatgpt/)
- [OpenAI Help · Memory FAQ](https://help.openai.com/en/articles/8590148-memory-faq)
- [Embrace The Red · Deep Dive into ChatGPT Memory](https://embracethered.com/blog/posts/2025/chatgpt-how-does-chat-history-memory-preferences-work/)

### Character.AI Memory
- [Character.AI Blog · Helping Characters Remember](https://blog.character.ai/helping-characters-remember-what-matters-most/)
- [C.AI Help Center · Pinned Memories](https://support.character.ai/hc/en-us/articles/24327914463003-New-Feature-Pinned-Memories)
- [Adler AI · Pinned Memories](https://medium.com/@adlerai/pinned-memories-on-character-ai-0dbaf30e5a52)

### Khanmigo
- [Khanmigo.ai 主页](https://www.khanmigo.ai/)
- [CBS News · Sal Khan NeoLearning in Indiana high school](https://www.cbsnews.com/news/how-khanmigo-works-in-school-classrooms-60-minutes/)
- [Khan Academy · Khanmigo for students](https://www.khanacademy.org/college-careers-more/khanmigo-for-students)

### RAG 防幻觉
- [MDPI · Hallucination Mitigation for RAG: A Review](https://www.mdpi.com/2227-7390/13/5/856)
- [arXiv 2510.24476 · Mitigating Hallucination in LLMs](https://arxiv.org/html/2510.24476v1)
- [arXiv 2404.08189 · Reducing hallucination via RAG](https://arxiv.org/abs/2404.08189)
- [ACL · RAGTruth: A Hallucination Corpus for RAG](https://aclanthology.org/2024.acl-long.585/)
- [OpenReview · ReDeEP: Detecting Hallucination](https://openreview.net/forum?id=ztzZDzgfrh)

---

## 12. 待补调研（额度恢复后继续）

- [ ] Letta（letta.ai）官方文档深度
- [ ] Zep / Graphiti 详细技术架构
- [ ] LangChain Memory 6 类详细
- [ ] LlamaIndex 长期记忆模式
- [ ] Replika / Pi 记忆机制
- [ ] FERPA / GDPR / 中国个保法 教育数据合规
- [ ] 国产模型（DeepSeek / Qwen / Doubao）的记忆方案
- [ ] memory consolidation（睡眠期记忆整理）

---

**文档状态**：B2.P2 调研产出 · v0.1 · 发散稿
**核心价值**：
- 行业格局清晰：5 框架 + 5 产品 + 4 核心问题答案
- **Khanmigo = 教育场景最直接对标**（Socratic + mastery+prerequisites）
- 防幻觉机制清单（强制 retrieval + 引文 + 拒答 + 置信度分层）
- 5 层渐进画像 + 13 条可借用清单

**下一步**：用户后续 debate 选型 + 待补调研

Sources:
- [Atlan · Best AI Agent Memory Frameworks 2026](https://atlan.com/know/best-ai-agent-memory-frameworks-2026/)
- [arXiv 2310.08560 · MemGPT](https://arxiv.org/abs/2310.08560)
- [OpenAI · Memory FAQ](https://help.openai.com/en/articles/8590148-memory-faq)
- [Khanmigo.ai](https://www.khanmigo.ai/)
- [Character.AI Pinned Memories](https://support.character.ai/hc/en-us/articles/24327914463003-New-Feature-Pinned-Memories)
- [Calvin Ku · Letta vs Mem0 vs Zep Battle-Tested](https://medium.com/asymptotic-spaghetti-integration/from-beta-to-battle-tested-picking-between-letta-mem0-zep-for-ai-memory-6850ca8703d1)
- [MDPI · RAG Hallucination Mitigation Review](https://www.mdpi.com/2227-7390/13/5/856)
