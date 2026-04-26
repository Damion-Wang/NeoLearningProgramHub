# A2 · 三轨并行调研规划

> **决策日期**：2026-04-26
> **依据**：Round-1 辩论决策（议题 1 选项 C · 三轨并行）+ 第一性原理 + spec v0.4.0 scope
> **总周期**：6-8 周

---

## 三轨定义

| 轨 | 名称 | 输入 | 输出 | Owner | 周期 |
|----|------|------|------|-------|------|
| **B1** | 内化深化 | coaching-skills 项目 + GROW 12 份 + FLM 15 份 + spec v0.4.0 | Neo Persona v0.1 → v1.0 + 对话片段范本 | DM + Claude（多 Agent 并行）| 1-6 周 |
| **B2** | 外部扩展 | 教育/教练论文 + 开源对话项目 + 真人教练录音转写 | 反面例对话片段 + 方法论引文清单 | DM + Claude（Web Search/Fetch）+ 1 名外部教练实录 | 2-6 周 |
| **B3** | HR 访谈 | 60 家天使客户中 5-8 家 HR | 客户视角期望 + 全生命周期 SOP 输入 + 验收语言 | DM + 销售团队 + 访谈转录 | 2-5 周 |

---

## 轨 B1 · 内化深化（主轨）

### 输入清单
1. **coaching-skills 项目**（A1 Agent G1 已扫描，差距清单见 `0426-gap-1-coaching-skills.md`）
2. **GROW 12 份**（A1 Agent G2 已扫描，差距清单见 `0426-gap-2-grow-coaching.md`）
3. **FLM 15 份**（A1 Agent G3 已扫描，差距清单见 `0426-gap-3-flm-content.md`）
4. **spec v0.4.0** + **0424 决策 31 条**（A1 Agent G4 已扫描，差距清单见 `0426-gap-4-spec-neo-map.md`）

### 工作流
1. **W1**：基于 4 份差距清单，写 Neo Persona v0.1（A3 主线 1 启动文档）
2. **W2**：从 GROW 抽 20 对话片段，标注【场域+信号+回应+意图】
3. **W3-4**：从 coaching-skills 抽 7 动作的能力实现，融入 Neo Persona v0.2
4. **W5-6**：所有片段 ×2 扩到 50；Persona 写成 system prompt
5. **W7-8**：100 片段索引化；Persona v1.0 + 测试集

### 验收
- 每周输出 1 个 Persona 增量章节
- 每周新增 ≥10 个对话片段
- 每周 1 次自我 review（用 7 动作 × 5 场域矩阵自查）

### 风险
- 4 份 gap 差距清单内容矛盾时如何取舍 → 第一性原理优先
- coaching-skills 是 JS 实现可能与 LLM prompt 范式不匹配 → 抽规则不抽代码

---

## 轨 B2 · 外部扩展

### 子任务

#### B2.1 教育方法论论文调研（W1-2）
- **目标**：找 5-10 篇核心论文，覆盖：
  - **企业教育**：成人学习理论（Knowles）/ 经验学习圈（Kolb）
  - **1v1 辅导**：Socratic method / Coaching skills（ICF Core Competencies）
  - **管理学教学**：Action Learning / 70-20-10 model
- **方法**：WebSearch + WebFetch（Google Scholar / HBR / academic OAI）
- **产出**：`02-temp/0426-b2-1-pedagogy-papers.md`（含每篇论文摘要 + 对睿学 Neo 的启发）

#### B2.2 开源教练对话项目调研（W2-3）
- **目标**：找 ≥3 个开源项目含真实教练对话数据
  - 候选：CounselChat（Reddit r/counseling 数据集）/ HC3 / EmpatheticDialogues / coaching-related GitHub repos
- **方法**：WebSearch GitHub / HuggingFace datasets
- **产出**：`02-temp/0426-b2-2-open-coaching-datasets.md`（含数据规模 + 适用程度 + 抽样片段）

#### B2.3 真人 1v1 教练录音转写（W3-5）
- **目标**：1-3 段真实 1v1 教练对话（30-60 分钟）转录文本
- **方法**：DM 联系 1 名真人教练 → 录音 → ASR 转写 → DM 整理
- **产出**：`02-temp/0426-b2-3-real-coaching-transcript.md`（脱敏后的真实对话片段）

### 验收
- 每个子任务有具体引文/数据/转录可追溯
- 每个子任务给出"对睿学 Neo 直接借用 / 改造借用 / 启发参考 / 不适用"四档判定

### 风险
- 真人教练录音受限（隐私 / 协作意愿）→ 备选用付费教练课公开样本（YouTube / 教练协会公开案例）
- 论文密度高但与产品 prompt 距离远 → 用第一性原理过滤，每篇只抽 3-5 条 actionable 结论

---

## 轨 B3 · HR 访谈

### 子任务

#### B3.1 访谈对象筛选（W1）
- **目标**：从 60 家天使客户中选 5-8 家 HR 进行 1v1 访谈
- **筛选维度**：
  - 行业多样性（制造 / 互联网 / 金融 / 服务业 各 1-2 家）
  - 项目阶段多样性（已签约 / 评估中 / 已完成过培训 / 全新客户）
  - 决策权（HR Director / Training Manager / L&D Lead）
- **方法**：销售团队提供候选 → DM 筛选 → 销售协调约谈
- **产出**：`02-temp/0426-b3-1-hr-interview-list.md`（含每家客户的背景 + 访谈优先级）

#### B3.2 访谈大纲设计（W1）
- **覆盖维度**：
  1. 你公司当前的真人讲师 / 1v1 老师 / SCORM 课程 各占多少比例？为什么这么分配？
  2. 一次完整培训项目从立项到结项的流程是什么？哪些环节最痛？
  3. 你们怎么衡量培训效果？什么报告/数据是必看的？
  4. 对 AI 老师的预期和顾虑各是什么？
  5. 学员真实反馈的 3 个高频抱怨是什么？
- **产出**：`02-temp/0426-b3-2-hr-interview-script.md`

#### B3.3 访谈执行（W2-4）
- 每家客户 60-90 分钟访谈，DM + 销售陪同（销售负责关系，DM 负责挖掘）
- 录音 + 转录 + 整理纪要
- **产出**：每家客户 1 份纪要 → `02-temp/0426-b3-3-hr-interviews/[公司名]-2026XXXX.md`

#### B3.4 跨访谈洞察整合（W4-5）
- 共性 / 差异 / 反共识发现
- **产出**：`02-temp/0426-b3-4-hr-insights-synthesis.md`（直接喂给 A3 全生命周期 SOP）

### 验收
- 5+ 家完成访谈
- 每家有 ≥3 个 actionable insights
- 整合产出能直接映射到 SOP 7 阶段

### 风险
- 客户档期不可控 → 早启动，每周 review 一次进度
- HR 给的话是"应该说的"vs"真实想的" → 多家访谈用三角验证
- 销售团队抢客户访谈资源 → 提前协调

---

## 三轨协同时间线

```
W1     W2     W3     W4     W5     W6     W7     W8
│      │      │      │      │      │      │      │
B1: ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Neo Persona v1.0
B2.1: ━━━━━━━━━━ 论文调研
B2.2:        ━━━━━━━━ 开源数据集
B2.3:               ━━━━━━━━━━ 真人对话转写
B3.1: ━━━━━ 访谈对象筛选
B3.2: ━━━━━ 访谈大纲
B3.3:        ━━━━━━━━━━━━━━━━━━━━━━ 访谈执行
B3.4:                         ━━━━━ 整合
                                              ↓
                                         A3 双主线 v0.2
                                              ↓
                                         三件套 v1.0
```

---

## 三轨之间的同步机制

- **每周日 review**：DM 整理三轨进度（用 PROGRESS.md 追加）
- **轨间冲突时仲裁原则**：第一性原理优先 → spec scope 优先 → 时间紧迫性优先
- **跨轨发现互相输入**：B2 论文找到的方法论 → 立即喂给 B1 Neo Persona；B3 HR 访谈的反馈 → 立即喂给 B1 / B2 调整重点

---

## 资源与预算

| 资源 | 投入 |
|------|------|
| DM 时间 | 60-80% 投入到调研，其他时间处理紧急事 |
| Claude（多 Agent 并行）| 每日 ≥2 小时多 Agent 调度 |
| 销售团队 | B3.1/B3.3 协同（约谈安排）|
| 真人教练 | B2.3 1-2 名（付费或人情账） |
| 翻译/ASR 服务 | B2.3 转写工具（已有飞书录音转写） |

---

**文档状态**：A2 启动级产出 · v0.2（已更新 P2/P3 入轨）
**下一步**：A1 4 个 gap 文档已完成 → 综合 gap 已产出 → 立即启动 B2.1 / B3.1 / B3.2 + P2/P3 议题调研

---

## 11. P2 / P3 议题入轨（2026-04-26 补充）

调研议题从单一 P1（第一性原理 7 动作）扩展为 **3 议题（P1 第一性原理 / P2 懂你 / P3 像人）**。3 议题 × 3 调研轨 = 9 格矩阵：

| 议题 \\ 轨道 | B1 内化 | B2 外部 | B3 HR 访谈 |
|----------|--------|--------|----------|
| **P1 第一性原理** | coaching-skills + GROW + FLM + spec | 教育/教练论文 + 真人教练录音 | 你以前的真人讲师是怎样的 / 学员高频抱怨 |
| **P2 懂你** | coaching-skills enablementSignalEngine / competencyDynamicsEngine + spec § 8.2 | Mem0 / Letta / Zep / ChatGPT Memory / Character.AI / Replika + 5 篇长期记忆论文 | 你希望 Neo 记得你什么 / 哪些不能记 / 学员可见性偏好 |
| **P3 像人** | coaching-skills CoachPersona / LecturerPersona + GROW 教练画像 + DM 旧 soul.md 模板 | Character.AI / SillyTavern / Inworld + 教育心理学 + Constitutional AI 论文 | 你希望 Neo 是怎样的老师 / 不希望像谁 |

### 9 格的执行清单

#### B1 内化新增子任务
- B1.P2：从 coaching-skills 抽 enablementSignalEngine 的"信号-记忆"关联机制
- B1.P3：从 coaching-skills 抽 CoachPersona / LecturerPersona 的人格描述方式
- B1.P3：DM 提供旧 soul.md 模板 → 本项目格式定型

#### B2 外部新增子任务
- B2.P2：W2 调研 Mem0 / Letta / Zep / ChatGPT Memory / Character.AI memory + 5 篇长期记忆论文 → `0426-memory-research-W2-notes.md`
- B2.P3：W2 调研 Character.AI / SillyTavern V3 character card / Inworld + 教育心理学"好老师"5 特质 + Constitutional AI → `0426-persona-research-W2-notes.md`

#### B3 HR 访谈大纲扩展
原 5 题 + 3 验证基础上加：

**P2 维度（4 题）**
1. 你希望 AI 老师"记得"学员的什么？哪些必须记？
2. 哪些信息你希望 AI 老师**不要**记 / 不要主动引用？
3. 学员是否能看到 / 编辑 AI 老师对自己的"画像"？
4. 6 个月项目里，AI 老师对学员的"了解加深"该用什么方式让你看到？

**P3 维度（4 题）**
5. 你公司以前的最好的真人讲师 / 教练是怎样的人？给个具体描述。
6. 你最反感的 AI 助手 / 老师是怎样的？为什么？
7. 学员说"我对你说的不同意"时，你希望 AI 老师怎么回应？
8. 是否允许学员选择 AI 老师的人格风格（严厉/温和/严谨/亲切）？

### P2 / P3 调研路径（与 P1 并行）

```
W1     W2     W3     W4     W5     W6     W7     W8
│      │      │      │      │      │      │      │
P1: ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Neo Persona v1.0
P2: ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Memory v1.0
P3: ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Soul v1.0
B3: 同步采集 P1 / P2 / P3 三议题的 HR 访谈反馈
                                              ↓
                                         Persona v1.0（含 P1+P2+P3 集成）
```

### 风险（议题入轨新增）

5. **P2 / P3 调研深度可能挤压 P1**——3 议题并行容易顾此失彼。建议每周一次"三议题平衡 review"
6. **DM 旧 soul.md 模板未到位**——如未及时提供，P3 v0.2 受阻
7. **三议题在 v1.0 集成困难**——Persona / Memory / Soul 三件大事到 v1.0 时如何整合到一份 Neo Persona？建议 W6 起预留 1 周做集成

---

## 12. 与底层原则框架的对应

| A2 元素 | 底层原则 | 备注 |
|--------|--------|------|
| B1 内化（原 P1）| P1 第一性原理 | 已有 |
| B1.P2 / B1.P3 | P2 + P3 | 新增 |
| B2.1 论文 / B2.2 数据集 / B2.3 真人录音 | 主要 P1，部分 P2 | 已有 |
| B2.P2 / B2.P3 | P2 + P3 | 新增 |
| B3.2 访谈大纲（原 5 题 + 3 验证）| P1 | 已有 |
| B3.2 P2/P3 维度 8 题 | P2 + P3 | 新增 |

详见 `02-temp/0426-底层原则框架.md`。
