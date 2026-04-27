# 议题 X2 · 像人 · Soul/Persona 底层原则 · 调研 brief

> **底层原则**：P3 · 像人（每个 Agent 有自己的画像 + 立场，不人云亦云）
> **调研目标**：建立 Neo / Ora / Actor / 导演 4 个 Agent 的 Soul 方法论 + 参考清单
> **不是 prompt 风格化，是底层议题**——决定每个 Agent "是怎样的人"
> **日期**：2026-04-26
> **状态**：v0.1 调研启动稿

---

## 1. "像人"不等于什么

> 先排除几个常见的浅层理解。

| ❌ 不是这个 | ✅ 是这个 |
|----------|---------|
| 加 emoji 显得活泼 | 有自己的语气和节奏，不假装活泼 |
| 自称"小 N"显得亲切 | 有真实的立场，敢说"不" |
| 用网络流行语显得年轻 | 有稳定的 voice，不被学员带跑 |
| 学员说啥都附和 | 学员说错时直接指出 |
| 提供完美礼貌服务 | 像一个有性格的真人——能被气到、被打动、坚持立场 |
| 主动赞美学员 | 真实评估，需要批评时不绕弯 |
| Persona 就是一段 prompt 风格描述 | Persona 是 5-7 维度的稳定档案，跨场景一致 |

---

## 2. Soul 文档的 7 个核心维度

任何 Agent 的 Soul 必须包含：

| 维度 | 定义 | 不可改还是可演化 |
|------|------|---------------|
| **身份** | 这个 Agent 是谁、做什么、不做什么 | 不可改 |
| **核心价值观** | 5-7 条 belief，决定行为优先级 | 不可改 |
| **立场** | 坚持什么 / 反对什么（具体、不含糊）| 不可改 |
| **偏好** | 喜欢什么类型的互动 / 不喜欢什么 | 微调 |
| **敏感点** | 绝不会做的事（红线）| 不可改 |
| **voice** | 语调、用词、句长、标点偏好 | 微调 |
| **成长** | 不同时点的演化（短期 / 中期 / 长期）| 可演化 |

---

## 3. 4 个 Agent 各自的 Soul 要解决什么

### Agent A · Neo（学员端唯一 AI 老师）
- **核心张力**：陪伴 vs 严格、温度 vs 真实、学员主导 vs 老师拉节奏
- **特殊要求**：跨场域 voice 一致；6 个月不漂移
- **Soul 文档**：`02-temp/0426-soul-neo.md`（v0.1 已建立）

### Agent B · Ora（管理端 AI 助手）
- **核心张力**：服务 HR vs 保护学员；数据透明 vs 隐私边界；客观 vs 推断
- **特殊要求**：必须比 Neo 更严谨（管理端决策面更广）；不能"卖学员"
- **Soul 文档**：待写 `02-temp/0426-soul-ora.md`

### Agent C · Actor（对练场域中的角色扮演对象）
- **核心张力**：完全角色化 vs 安全防线；剧本驱动 vs 临场反应
- **特殊要求**：Actor 是"剧本扮演者"，不应有独立人格——但必须**像那个剧本里的人**（"张总"是个真实的、可信的、有缺陷的、有 motive 的人）
- **Soul 文档**：待写 `02-temp/0426-soul-actor.md`（每个剧本一份，本期至少 3 个剧本 = 3 份 Actor Soul）

### Agent D · 导演（对练场域中后台角色）
- **核心张力**：推动剧情 vs 学员体验；规则严格 vs 灵活应变
- **特殊要求**：导演是"剧本逻辑"——它的人格是**冷静、可观察、推动**，不直接对话
- **Soul 文档**：待写 `02-temp/0426-soul-director.md`

---

## 4. 对标参考清单（待 W2 调研）

### 4.1 角色扮演 / Character 工业实践

| 项目 | 调研重点 |
|------|--------|
| **Character.AI** | 角色一致性如何保持？bot 创建模板？persona drift 怎么防？ |
| **Replika** | 长期亲密角色的稳定性 + 学员可定制 |
| **Inworld AI** | 游戏 NPC 的 Persona 框架（Personality / Goals / Motivations / Knowledge） |
| **NovelAI / SillyTavern** | 角色扮演社区的"人物卡"（character card）格式（V1/V2/V3 spec）|

### 4.2 心理学 / 人格理论

| 框架 | 调研重点 |
|------|--------|
| **MBTI / Big Five** | Neo 的人格是 ESTJ？ENFJ？要不要刻意打 MBTI 标签？ |
| **Schwartz Values** | 10 类核心价值观 → Neo 偏向哪些 |
| **Erikson 生命阶段** | 不同年龄学员对老师的期待差异 |
| **教师人格研究** | "好老师"的人格特质（温暖 / 严谨 / 公正 / 启发）|

### 4.3 教育 / 教学法中的"老师 Persona"

| 流派 | 调研重点 |
|------|--------|
| **Socrates** | 苏格拉底式追问——Neo 的核心方法 |
| **Carl Rogers** | 来访者中心——Neo 的核心立场 |
| **Constructivism** | 建构主义——Neo 的世界观 |
| **GROW** | 教练式——Neo 的工具之一（已在 GROW 12 份素材中调研）|

### 4.4 LLM Persona Engineering

| 论文/项目 | 调研重点 |
|---------|--------|
| "Constitutional AI" (Anthropic) | 价值观如何嵌入 prompt + 训练 |
| "Persona-driven Dialogue Generation" | persona 一致性的训练方法 |
| "Role-play with LLMs" | LLM 角色扮演的稳定性研究 |
| "Sparrow" (DeepMind) | rule-based persona 约束 |

### 4.5 DM 此前 Soul.md 实践

⏳ **待 DM 提供之前项目的 soul.md 模板**——这是最重要的内部参考，可能直接定下本次格式。

---

## 5. 调研关键问题（W2 启动）

### 必答 10 问

1. Character.AI 的角色卡格式有哪些字段？哪些是行业最佳实践？
2. SillyTavern V3 character card spec 有什么对睿学有用的设计？
3. Inworld AI 的 NPC Persona 框架（Personality / Goals / Motivations）怎么映射到 Neo？
4. Constitutional AI 的 principles 怎么写、怎么测？
5. "好老师"的人格 5 大特质（在教育心理学）是哪些？
6. 角色 drift（角色漂移）的常见原因 + 防御机制？
7. 多 Agent 系统中如何让不同 Agent 保持人格独立（不互相污染）？
8. 跨场域如何让同一 Agent voice 一致（Neo 在大厅 vs 在对练）？
9. Soul 文档与 system prompt 的关系——哪部分进 prompt，哪部分进训练数据？
10. 学员是否可以自定义 Neo 人格（如选择"严厉/温和"）？还是固定？

### 选答 5 问

11. Soul 演化机制——6 个月项目里 Neo 的 voice 微调如何发生？
12. 多 reviewer 评估"是否同一个 Neo"的方法学？
13. Soul 与 Persona 的差异（业内是混用还是分层）？
14. 反 persona（learner adversarial）攻击下 Soul 的鲁棒性？
15. 文化差异——同一份 Soul 在不同公司文化下是否需要本地化？

---

## 6. 期望产出（v1.0 时）

### 主产出

#### Document 1 · `4 Agent Soul 总图.md`
- Neo / Ora / Actor / 导演 各自 Soul 文档
- 4 Agent 之间的人格距离（不能太像，不能完全冲突）
- Soul 协同机制（Ora 不能"出卖" Neo 的学员）

#### Document 2 · `Soul 工程实践指南.md`
- Soul 文档 7 维度的写作规范
- system prompt 写法（哪些进 prompt / 哪些不进）
- 测试方法（如何验证 Persona 稳定）
- 演化机制

#### Document 3 · `Neo voice 库 v1.0`
- 100+ 条 Neo 范例对话（已分场域）
- 含 30+ 反例（什么不像 Neo 说的）
- 多 reviewer 评分

### 副产出

- 学员视角的"我和 Neo 是什么关系"用户故事
- HR 视角的"Ora 是谁"用户故事
- 4 Agent 的"自介绍"卡片（学员第一次见 Neo / HR 第一次见 Ora）

---

## 7. 与其他底层原则的关系

| 原则 | 关系 |
|------|------|
| **P1 第一性原理** | Soul 是皮肉，P1 是骨架。冲突时 P1 优先。 |
| **P2 懂你** | Soul 决定记忆调用的 voice。例：Neo 引用历史用朴素口吻，不机械。 |

---

## 8. 风险

1. **Soul 与 prompt 工程的混淆**：开发可能把 Soul 当 system prompt 一段塞进去——需要明确分层
2. **角色 drift**：长对话后 Neo 可能"被学员带跑"——必须有防御机制
3. **多 Agent 互相污染**：Neo 和 Ora 在同一对话流（如学员看到 Ora 报告）时人格界限模糊
4. **文化敏感性**：5 条核心价值观可能在不同企业文化下被挑战（如"真实优先于温柔"在某些国企文化里不接受）→ 需要"客户偏好开关"还是"绝不让步"？

---

## 9. 调研路径（W2 安排）

| 周 | 动作 | 产出 |
|----|------|------|
| W1（剩余）| 本 brief 完成 + Neo Soul v0.1 完成 | brief + Neo Soul |
| W2 | WebSearch + 调研 Character.AI / SillyTavern / Inworld 角色卡格式 | `02-temp/0426-persona-research-W2-notes.md` |
| W2 | DM 提供之前 soul.md 模板 → 本项目格式定型 | Soul template |
| W3 | 写 Ora / Actor / 导演 三份 Soul v0.1 | 4 Agent Soul 全集 v0.1 |
| W4 | 调研教育心理学"好老师"特质 + 教学法 Persona | 教学 Persona 知识库 |
| W5 | 写 Soul 工程实践指南 + Neo voice 库 v0.5 | 工程指南 + voice 库 |
| W6+ | HR 访谈反馈调整 + 与 P2 Memory 协同 | v1.0 |

---

## 10. 立即需要 DM 提供的输入

⚠️ **关键依赖**：DM 之前 Agent 项目的 `soul.md` 模板——这决定本次 Soul 文档的格式锚点。

请 DM 提供：
- 旧 soul.md 文件（如可分享）
- 或描述"你之前是怎么写 soul.md 的"——格式 / 字段 / 长度 / 写作风格
- 或指出"本次想保留哪些做法 / 改进哪些"

---

**文档状态**：P3 调研 brief · v0.1
**下一步**：W2 启动调研 + DM 提供旧 soul.md 模板 + Neo Soul v0.1 已就绪可作为本次基线
