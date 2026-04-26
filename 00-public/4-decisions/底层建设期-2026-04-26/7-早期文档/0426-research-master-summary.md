# 调研 Master Summary · debate 准备文档

> **作用**：5 份调研整合 + 冲突点清单 → **后续 debate 直接用**
> **日期**：2026-04-26
> **状态**：调研发散完成，等待 debate 收敛

---

## 0. 调研产出全景

### 0.1 11 份调研产出（24 万+ 字）

#### A 阶段（既有资产）
| # | 文件 | 主题 | 字数 |
|---|------|------|------|
| 1 | `0426-gap-1-coaching-skills.md` | coaching-skills JS 项目 | ~5K |
| 2 | `0426-gap-2-grow-coaching.md` | GROW 17 万字素材 | ~5K |
| 3 | `0426-gap-3-flm-content.md` | FLM 17 份管理学脚本 | ~9K |
| 4 | `0426-gap-4-spec-neo-map.md` | spec 5×7 矩阵 | ~7K |
| 5 | `0426-research-gap.md` | 综合 gap | ~6.5K |

#### B 阶段（外部调研，本次完成）
| # | 文件 | 主题 | 字数 |
|---|------|------|------|
| 6 | `0426-r1-pedagogy-papers.md` | 9 大教育/教练流派 | ~7K |
| 7 | `0426-r2-open-coaching-datasets.md` | 9 个开源数据集 | ~5K |
| 8 | `0426-r3-real-coaching-samples.md` | 真人 1v1 公开样本 | ~5K |
| 9 | `0426-r4-memory-systems.md` | 5 框架 + 5 产品 + 5 论文 | ~7K |
| 10 | `0426-r5-persona-soul.md` | soul.md / SoulSpec / V3 等 | ~7K |

#### 框架与 Soul
| # | 文件 | 主题 |
|---|------|------|
| 11 | `0426-底层原则框架.md` | P1/P2/P3 三原则总图 |
| 12 | `0426-soul-neo.md` | Neo Soul v0.1（11 节） |
| 13 | `0426-memory-system-research-brief.md` | P2 brief |
| 14 | `0426-persona-research-brief.md` | P3 brief |

### 0.2 三大底层原则的"理论家庭"已清晰

| 原则 | 主理论家庭 | 副家庭 |
|------|----------|-------|
| **P1 第一性原理（7 动作）** | Knowles / Kolb / Action Learning / ICF / Khanmigo | Hattie / Dweck / 苏格拉底 |
| **P2 懂你（记忆）** | Khanmigo skills+prerequisites + MemGPT 双层架构 | Mem0 / Letta / Zep / ChatGPT Memory |
| **P3 像人（Soul）** | aaronjmars/soul.md + SoulSpec + Constitutional AI | SillyTavern V3 / Character.AI / Anthropic Persona Vectors |

---

## 1. 调研中的"重大发现"汇总

### 1.1 颠覆性发现（影响产品架构方向）

#### F1 · soul.md 是工业级开源标准
**aaronjmars/soul.md** + **SoulSpec.org** + **souls-directory** 等已形成生态。MSR 2026 学术研究（arXiv:2510.21413）支撑。
- → **睿学不必自创 Soul 格式**，可基于工业标准做适配
- → 节省 6-8 周自研时间

#### F2 · Khanmigo 与 Neo 第一性原理完全契合
- "Guides learners to find the answer themselves"
- Socratic method
- mastery + prerequisites memory
- Teacher dashboard
- → **Khanmigo 是教育场景最直接对标**，应作为 Neo 的"参照原型"

#### F3 · MathDial 论文实证 Neo 第一性原理
"GPT-3 是好的问题解决者，但 fail 在 tutoring 上——它过早泄露答案。"
- → 直接验证 Neo "不替学员思考" 的红线
- → MathDial 数据集本身就是 Neo 训练的反面例

#### F4 · 教案 vs 真人对话的"40% 差距"
教案 = 100% 命中的理想；真人 = 60% 命中 + 40% 修正（沉默/防御/翻车）
- → Neo 训练**必须包含 40% 的真实修正部分**
- → HBR Coaching Real Leaders 是金矿

#### F5 · Hattie Visible Learning 顶级影响因子排序
- Collective teacher efficacy d=1.57
- Teacher credibility d=0.90
- Feedback d=0.73
- → Neo 的"Teacher Credibility"比"内容多丰富"更重要
- → Neo Soul 的"立场鲜明 + 真实优先"已经在击中这一点

### 1.2 关键工业实践（影响选型）

#### F6 · 记忆框架 LongMemEval Benchmark
- Letta 83.2% > Zep 63.8% > Mem0 49%
- Mem0 SaaS 成本 $19→$249/月
- 所有框架都缺企业级治理
- → 选型不能只看 benchmark，要考虑成熟度 / 成本 / 自主性

#### F7 · ChatGPT Memory 容量限制 1200-1400 词
- → Neo 6 月项目记忆必须分层（不能全推送 context）
- → 与 MemGPT 双层架构契合

#### F8 · Character.AI 没有真长期记忆
- session 化、prone to drift
- Pinned 15 条 + Memory Box 400 字符
- → Character.AI 不能直接借用作为长期陪伴方案

---

## 2. P1 第一性原理 7 动作的"理论 grounding"

### 2.1 7 动作 × 主理论家庭

| 动作 | 主理论 | 关键文献/实践 |
|------|--------|------------|
| 讲授 | Knowles Need to Know + Hattie 内容组织 | 成人需要知道为什么 |
| 解惑 | Rogers Empathy + Hattie Feedback | 共情 + 真诚反馈 |
| 讨论 | Action Learning Q1 + 苏格拉底 | "管理问题驱动" |
| 考研 | Hattie Self-reported + Khanmigo mastery + Dweck 表扬 effort | 不表扬 ability |
| 练习 | Kolb Active Experimentation + Action Learning | 经验循环 |
| 追问 | Action Learning Q + 苏格拉底 + ICF Evokes Awareness + GROW WhatElse | "Q 创造洞察" |
| 反思 | Kolb Reflective Observation + Action Learning Reflecting | 反思核心 |

### 2.2 7 动作的"硬约束"（来自论文）

- 讲授：先 Need to Know（Knowles）
- 解惑：Rogers Congruence（真诚），不套话
- 讨论：Q1（管理问题驱动）→ Q2（新机会）
- **考研：Dweck 表扬 effort 不表扬 ability**
- 练习：Kolb 4 阶段循环
- 追问：苏格拉底揭示矛盾，不只是问"还有吗"
- 反思：Kolb Reflective Observation + Greif

---

## 3. P2 懂你 · 设计选项

### 3.1 5 层渐进画像（已立）

| 层级 | 内容 | 置信度 |
|------|------|--------|
| L1 基础事实 | 姓名/岗位/公司 | 高（事实型）|
| L2 行为模式 | 学习节奏/答题习惯 | 高 |
| L3 价值偏好 | 认同/反对/在意 | 中（推断型）|
| L4 隐性需求 | 嘴上 vs 真要 | 低 |
| L5 自我认知 | 自我看法 | 极低 |

### 3.2 4 核心问题的候选答案

| 问题 | 候选 A | 候选 B | 候选 C |
|------|--------|--------|--------|
| **记什么** | 全部存（MemGPT）| 选择性存（Mem0）| 按 skill 存（Khanmigo）|
| **怎么存** | Vector | Knowledge Graph（Zep）| Hybrid 多层 |
| **何时调** | 主动（MemGPT）| 被动（RAG）| 信号触发（混合）|
| **防幻觉** | 强制 retrieval + 引文 | 拒答机制 | 置信度分层 |

### 3.3 推荐方向（综合）

- **5 层渐进画像** + **MemGPT 双层架构** + **Khanmigo skills+prerequisites** + **强制 retrieval + 引文**
- 学员可见性：ChatGPT 风格分层显示
- 与 spec § 8.2"统一 Database"衔接

---

## 4. P3 像人 · Soul 设计选项

### 4.1 4 个候选格式

| 候选 | 来源 | 优势 | 劣势 |
|------|------|------|------|
| **A · soul.md 5 文件** | aaronjmars/soul.md | 工业标准、有验证机制 | 偏个人化 |
| **B · SoulSpec 4 文件** | SoulSpec.org | 学术依据、跨平台 | 抽象 |
| **C · 当前 v0.1 单文件** | 自研 | 教育场景定制 | 自创格式 |
| **D · 混合** | 综合 | 标准 + 定制平衡 | 复杂 |

### 4.2 Soul 文档 7 维度（已立）

身份 / 价值观 / 立场 / 偏好 / 敏感点 / Voice / 成长

### 4.3 推荐方向（综合）

参考 candidate A（aaronjmars/soul.md 5 文件）：
- `SOUL.md`：身份 + 价值观 + 立场 + 矛盾点
- `STYLE.md`：voice + 词汇 + 句式 + 范例
- `SKILL.md`：5 场域 × 7 动作 操作模式
- `MEMORY.md`：与 P2 协同
- `examples/`：good-outputs.md + bad-outputs.md
- `soul.json`：manifest

---

## 5. 待 debate 的关键议题清单（共 15 条）

> **下面是 debate 时直接拿来用的议题清单**，按 P1/P2/P3 分组。每条议题给出"立场 A vs 立场 B"框架。

### 5.1 P1 议题（5 条）

#### 议题 P1-1 · Neo 是老师 vs 教练 vs 治疗师
| 立场 | 来源 | 主张 |
|------|------|------|
| **A 老师**（Neo 当前）| Khanmigo / 传统教育 | directive，要逼学员 |
| **B 教练** | GROW / ICF | semi-directive，引导学员发现 |
| **C 治疗师** | Carl Rogers | non-directive，无条件接纳 |
| **debate 问题** | Neo 应吸收 Rogers 的"接纳"多少？|

#### 议题 P1-2 · "无条件接纳" vs "有条件期望"
| 立场 | 来源 | 主张 |
|------|------|------|
| **A 无条件接纳** | Rogers UPR | 接纳人 + 接纳一切回应 |
| **B 有条件期望** | Dweck Growth Mindset | 接纳人，不接纳低质回应 |
| **debate 问题** | Neo Soul V2 是否融合 Rogers？|

#### 议题 P1-3 · 70-20-10 是否纳入设计
| 立场 | 来源 | 主张 |
|------|------|------|
| **A 纳入** | 业内广泛使用 | 70 工作 + 20 他人 + 10 课堂 |
| **B 不纳入** | 学术界质疑 | 缺实证基础，不应 prescriptive |
| **debate 问题** | Neo 是否要"兼顾工作场景"还是"聚焦课堂场景"？|

#### 议题 P1-4 · 表扬 effort 还是结果
| 立场 | 来源 | 主张 |
|------|------|------|
| **A 表扬 effort**（Neo 当前）| Dweck | 鼓励 process + effort |
| **B 平衡** | 反对者 | 长期只表扬 effort 也有问题，要兼顾 quality |
| **debate 问题** | Neo 反馈策略如何平衡？|

#### 议题 P1-5 · 反思频率
| 立场 | 来源 | 主张 |
|------|------|------|
| **A 高频反思** | Kolb / Action Learning | 反思是核心 |
| **B 谨慎反思** | 经验论 | 反思过度 = 学员疲劳 |
| **debate 问题** | Neo 5 场域反思动作合理频率？|

### 5.2 P2 议题（5 条）

#### 议题 P2-1 · "存全部" vs "选择性存"
| 立场 | 来源 | 主张 |
|------|------|------|
| **A 存全部** | MemGPT 双层 | 不丢信息 |
| **B 选择性存** | Mem0 | 节省 token / Khanmigo skill 维度 |
| **debate 问题** | 6 月项目 token 预算如何分配？|

#### 议题 P2-2 · "用户透明" vs "黑盒"
| 立场 | 来源 | 主张 |
|------|------|------|
| **A 透明** | ChatGPT Memory / Khanmigo | 用户可见可管理 |
| **B 黑盒** | Character.AI / Replika | 用户不干预 |
| **debate 问题** | 学员要不要看到 Neo "记得" 自己什么？|

#### 议题 P2-3 · "RAG 检索" vs "主动 edit"
| 立场 | 来源 | 主张 |
|------|------|------|
| **A 被动 RAG** | LlamaIndex | 简单、可控 |
| **B 主动 edit** | MemGPT / Mem0 | Agent 自主 |
| **debate 问题** | Neo 该被动还是主动管理记忆？|

#### 议题 P2-4 · "结构化" vs "向量化"
| 立场 | 来源 | 主张 |
|------|------|------|
| **A 结构化** | Zep KG | 易解释 |
| **B 向量化** | Mem0 / 标准 RAG | 易维护 |
| **debate 问题** | Neo 记忆要"可解释"还是"高效"？|

#### 议题 P2-5 · "学员可控" vs "Neo 自主"
| 立场 | 来源 | 主张 |
|------|------|------|
| **A 学员可控** | ChatGPT 被遗忘权 | 合规 / 信任 |
| **B Neo 自主** | MemGPT | 教学连续性 |
| **debate 问题** | 合规 vs 教学连续性如何平衡？|

### 5.3 P3 议题（5 条）

#### 议题 P3-1 · Soul 是否需要"矛盾点"
| 立场 | 来源 | 主张 |
|------|------|------|
| **A 必须有** | aaronjmars/soul.md | 真实人就是不一致的 |
| **B 不必有** | 教师专业化 | 矛盾损害专业感 |
| **debate 问题** | Neo Soul 加矛盾点会不会反而让"老师感"减弱？|

#### 议题 P3-2 · Soul 固定 vs 演化
| 立场 | 来源 | 主张 |
|------|------|------|
| **A 固定** | Constitutional AI | 不变 |
| **B 演化** | open-soul / soul.md MEMORY.md | YAML seeds 自生长 |
| **debate 问题** | Neo 6 月项目里 Soul 该不该自演化？|

#### 议题 P3-3 · 学员可定制 vs 固定
| 立场 | 来源 | 主张 |
|------|------|------|
| **A 可定制**（部分）| 商业化考虑 | 客户能选"严厉/温和" |
| **B 固定** | Soul 工程哲学 | "绝不让步" |
| **debate 问题** | 客户可选 Neo 风格的边界？|

#### 议题 P3-4 · 短（728 字）vs 长（千字+）
| 立场 | 来源 | 主张 |
|------|------|------|
| **A 短** | Character.AI | 跨平台共享 / 训练数据小 |
| **B 长** | aaronjmars/soul.md | 信息密度 / 立场鲜明 |
| **debate 问题** | Neo Soul v0.1 千字+，是否过度？|

#### 议题 P3-5 · prompt 注入 vs 训练嵌入
| 立场 | 来源 | 主张 |
|------|------|------|
| **A prompt 注入** | soul.md / 多数实践 | 灵活 / 弱模型也能用 |
| **B 训练嵌入** | Constitutional AI | 稳定 / 不漂移 |
| **debate 问题** | Neo system prompt 多大？要不要训练专用模型？|

---

## 6. 跨议题的"元 debate"（3 条最深）

### Meta-1 · Neo 的"老师 - 教练 - 治疗师"光谱定位
集合 P1-1 + P1-2 + P3-1。这是 Neo 最深的身份问题：
- 完全是老师（directive，不让学员舒服）
- 还是融合三者
- 这决定 Soul / Persona / Memory 调用风格全部下游

### Meta-2 · 工业标准化 vs 自研定制
集合 P3-1 + P3-4 + P3-5。
- 站在 aaronjmars/soul.md / SoulSpec 工业标准上做适配（快、生态强）
- 还是自研单文件 v0.1 风格（定制、控制力强）
- 这决定接下来 6 周做什么

### Meta-3 · 6 月节点压力下的"调研深度 vs 落地速度"
集合 P2 全部 + P3 全部。
- 调研 3 个月做扎实，6 月可能产品落地不了
- 6 月先用简化方案（只做 P1，P2/P3 放 V2），但失去"懂你 + 像人"的承诺
- 折中：v0.1 简化 + v1.0 完整（已是当前思路）

---

## 7. 给 debate 的具体建议

### 7.1 推荐 debate 路径

**优先级 1**：先 debate Meta-1（老师-教练-治疗师定位）—— 这决定下游一切

**优先级 2**：再 debate Meta-2（工业标准 vs 自研）—— 这决定接下来工作量

**优先级 3**：再 debate Meta-3（深度 vs 速度）—— 这决定时间表

**优先级 4**：然后逐条过 P1-1 ~ P3-5 共 15 条

### 7.2 debate 形式建议

参考 multi-round-debate skill：5 角色辩论（PM/Dev/UX/Student/HR）。
- 每议题 1 轮（5 角色发言 + 反驳 + 选项）
- 每轮 30-60 分钟
- 15 议题 × 30 分钟 = 7-8 小时（建议分 3-5 天）

或者简化方案：
- DM 自己看本文档 → 直接拍板（节省时间）
- 只对 Meta-1/2/3 走 5 角色辩论
- 其他 P1/P2/P3 议题 DM 直接决定

### 7.3 debate 之前需要明确的

- [ ] 6 月节点的"硬要求"是什么？（不能砍的部分）
- [ ] 商业模式是否已锁定？（决定 P3-3 客户可定制问题）
- [ ] 60 家天使客户中是否有 anchor 客户？（决定 HR 访谈优先级）

---

## 8. debate 后的下一步

### 8.1 收敛后的产出物

| 件 | 状态 |
|----|------|
| Neo Persona v0.2 | 升级 |
| Neo Soul v0.2 | 升级到 5 文件结构（候选 A 或 D）|
| 5 层渐进画像设计文档 | 新建 |
| Neo voice 库 v0.5 | 启动 |
| 项目全生命周期 SOP v0.2 | 不动（与 debate 无关）|

### 8.2 W2-W4 工作

| 周 | 工作 |
|----|------|
| W2 | debate 收敛 + Persona/Soul v0.2 |
| W3 | HR 访谈启动 + B2.3 真人转写选 |
| W4 | 50 对话片段 + 测试集设计 |

### 8.3 何时退出底层建设阶段

- 三件套 v0.2 完成
- DM 决定开始平台 / Agent 构建

---

## 9. 风险与盲区（综合）

### 9.1 调研盲区
- ❗ **管理学 1v1 辅导真实数据极少**（GROW 偏教练，HBR Coaching Real Leaders 偏领导力）
- ❗ **中文样本质量参差**——B3 HR 访谈是最直接来源
- ❗ **企业 L&D 真实数据**几乎不公开
- ❗ **AI 老师在企业培训的实证研究**仍非常少（Khanmigo 是 K-12）
- ❗ **soul.md 在教育场景的实战案例**未找到

### 9.2 选型盲区
- ❗ **国产模型记忆方案**未调研（DeepSeek / Qwen / Doubao）
- ❗ **soul.md 生态在中国可访问性**未确认（OpenClaw 是否被墙）
- ❗ **教育合规**（FERPA / GDPR / 中国个保法）需法务支持
- ❗ **与 0424 决策 C-06 红线**（脱敏）冲突的细节未拆解

### 9.3 时间风险
- ❗ 6 月节点在前，深度调研 vs 快速落地 张力大
- ❗ HR 访谈进度不可控（依赖销售 + 客户档期）

---

## 10. 引用全集（按主题）

### P1 论文（来自 r1）
- Knowles Andragogy / Kolb / Action Learning / 70-20-10 / ICF / Hattie / Dweck / Rogers / Khanmigo

### P2 记忆（来自 r4）
- Mem0 / Letta(MemGPT) / Zep / LangChain / LlamaIndex
- ChatGPT Memory / Character.AI / Replika / Pi / Khanmigo
- 5 篇长期记忆论文 + RAG 防幻觉论文

### P3 Soul/Persona（来自 r5）
- aaronjmars/soul.md / SoulSpec.org / souls-directory / open-soul
- SillyTavern V3 / Character.AI / Anthropic Persona Vectors
- Constitutional AI / Sparrow

### 数据集（来自 r2）
- MathDial / Eedi / ConvoLearn / StudyChat / Education Dialogue
- Amod/mental_health / CounselChat / MentalChat16K / EmpatheticDialogues

### 真人样本（来自 r3）
- HBR Coaching Real Leaders / ICF YouTube / Coach Campus
- Marshall Goldsmith / Jean-Francois Cousin / BJ Levy

详见各 r1-r5 文档的 "引用清单" 章节。

---

**文档状态**：调研 Master Summary · v1.0 · 待 DM debate
**核心价值**：
- 11 份调研产出全索引
- 15 条 debate 议题（P1×5 + P2×5 + P3×5）+ 3 条 Meta debate
- 每条议题"立场 A vs 立场 B"框架
- debate 路径建议 + 收敛后下一步规划

**约定**：本文是从"发散调研"过渡到"收敛 debate"的桥梁文档。debate 完成后，本文将更新为"决策记录"。
