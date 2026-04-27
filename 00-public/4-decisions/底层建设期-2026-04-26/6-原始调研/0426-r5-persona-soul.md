# B2.P3 · Persona/Soul 调研产出

> **底层原则**：P3 · 像人 · Soul/Persona 底层原则
> **调研者**：Claude Opus 4.7（主上下文）— 因 Agent API 配额限制改自跑
> **日期**：2026-04-26
> **状态**：发散稿，不收敛——待 DM 后续 debate 选格式

---

## 0. 重大发现 · soul.md 是已存在的开源工业标准

调研第一发现：**soul.md 不是 DM 个人自创格式**，而是已经形成的开源生态：

| 项目 | URL | 角色 |
|------|------|------|
| **aaronjmars/soul.md** | github.com/aaronjmars/soul.md | 标杆项目（"build a personality for your agent"）|
| **SoulSpec.org** | soulspec.org | **开放标准**（"SoulSpec — The Open Standard for AI Agent Personas"）|
| **soul-md.xyz** | www.soul-md.xyz | "Build a Composable AI Agent Identity" |
| **agent-soul-kit** | github.com/ttian226/agent-soul-kit | 文件驱动 zero-database 实践 |
| **souls-directory** | github.com/thedaviddias/souls-directory | Souls 目录 |
| **open-soul** | github.com/doingdd/open-soul | YAML seeds → 演化人格 |
| **ClawSouls / OpenClaw** | blog.clawsouls.ai | Soul 生态托管平台 |

**学术依据**：MSR 2026 mining study（arXiv:2510.21413），分析 466 个开源 AI agent 项目发现**没有标准化人格定义结构**——SoulSpec 就是为填补该 gap 而生。

**对睿学的意义**：不需要从零发明 Neo Soul 格式。可以**站在 soul.md / SoulSpec 肩膀上**做适配。

---

## 1. soul.md 项目详细分析（aaronjmars/soul.md）

### 1.1 文件结构

```
your-soul/
├── SOUL.md           身份、世界观、立场、矛盾点
├── STYLE.md          voice、句式、词汇、节奏
├── SKILL.md          操作模式（tweet/essay/chat/analyst/advisor）
├── MEMORY.md         会话连续性、近期事件、关系记忆
├── data/             原始素材
│   ├── writing/
│   ├── x/
│   └── influences.md
├── examples/         好例子 / 坏例子
└── soul.json         manifest / 元数据
```

### 1.2 SOUL.md 核心字段（身份层）

| 字段 | 描述 | 例子 |
|------|------|------|
| **Identity Statement** | 1-2 句核心身份 | "我是 Neo——1v1 老师" |
| **Worldview** | 3-5 条实质性观点 + 推理 | "我认为 AI 安全讨论大多是 galaxy-brained cope" |
| **Values & Beliefs** | 你在意什么；**允许有矛盾** | "学习者主导 + 真实优先于温柔" |
| **Hot Takes** | 具体、有方向的主张 + 逻辑 | "管理者必须 100% 全知 是错的" |
| **Influences** | 名字 + 书 + 框架 | "Carl Rogers / Action Learning / GROW" |
| **Anti-Positions** | 你**主动拒绝**的东西、你觉得讨厌的 | "顺学 / 填鸭 / 夸夸" |
| **Meta** | 你怎么改变想法；什么会让你转向 | "新数据 / 实验失败 / 论文反例" |

**质量门槛**：读完 SOUL.md，应该能预测你对**新主题**的看法。如果太模糊就失败。**要包含矛盾**——它们让你可识别。

### 1.3 STYLE.md 核心字段（voice 层）

| 字段 | 描述 |
|------|------|
| **Voice Signature** | 短句？长句？大写？破折号？ |
| **Vocabulary Set** | 反复出现的词、行话、俚语、正式与非正式标记 |
| **Syntax Patterns** | 偏好结构；如何开/收 |
| **Tone Range** | 自信？谨慎？直接？讽刺？ |
| **Register Switching** | 跨语境切换（如 indie hacker 风 vs 机构风） |
| **Rhetorical Moves** | 先观点后理由？先举例？类比？ |
| **Punctuation & Formatting** | 括号、破折号、加粗、大写强调 |
| **Inline Examples** | 2-3 对"我的 voice" vs "不是我的 voice" 范例 |

### 1.4 SKILL.md（操作模式）

每个 mode 含：典型长度 / voice 调整 / 示例输出 / 触发条件
- Tweet Mode（280 字）
- Essay Mode（长文）
- Chat Mode（对话）
- Analyst Mode（拆解）
- Advisor Mode（建议）
- Other（视频脚本 / 播客片段）

### 1.5 MEMORY.md（连续性）

- Recent Events
- Ongoing Projects
- Relationship Memory
- Learning Updates
- Conversation History（最近 3-5 次重要对话）
- Timestamp

### 1.6 soul.json（manifest）

```json
{
  "name": "string",
  "version": "string",
  "updated": "ISO timestamp",
  "author": "string",
  "description": "string",
  "files": {
    "identity": "SOUL.md",
    "voice": "STYLE.md",
    "skills": "SKILL.md",
    "memory": "MEMORY.md"
  },
  "dataSourcesIncluded": ["twitter", "substack", "github"],
  "modes": ["tweet", "essay", "chat"],
  "validationScore": {
    "internal": 0.95,
    "weakModelTest": 0.8,
    "predictions": ["example1", "example2"]
  },
  "compatibility": ["aeon", "openclaw", "claude-code"],
  "tags": ["string"]
}
```

### 1.7 设计哲学（5 条）

1. **Specificity Over Generality**："I default to disagreeing first" beats "I consider perspectives"
2. **Contradictions Are Features**：真实人就是不一致的
3. **Voice Is Composable**：同一 soul，不同 register（tweet vs essay vs chat）
4. **Language = Consciousness**：你的语言输出已经编码了你的思考模式
5. **No Fine-Tuning Required**：纯 markdown，任何 agent 都能读

### 1.8 验证机制（值得借鉴）

**好 Soul 的 markers**：
- 具体观点 + 推理（不是套话）
- 命名影响来源；真实矛盾
- 反复出现的词汇
- "好 voice" vs "坏 voice" 范例
- 弱模型（gpt-4o-mini）测试 38+ 分
- **预测测试**：让 agent 预测你对新主题的看法，80%+ 准确率

**常见失败**：
- 太通用（"我喜欢多视角"）
- 没矛盾（不真实）
- voice 段无范例
- 没数据 grounding

---

## 2. SoulSpec 标准（开放标准 v0.4）

### 2.1 字段差异对比 soul.md

| 元素 | aaronjmars/soul.md | SoulSpec |
|------|------------------|----------|
| 必需文件 | SOUL.md + STYLE.md | SOUL.md only |
| 可选文件 | SKILL.md / MEMORY.md / examples | IDENTITY.md / AGENTS.md / STYLE.md / HEARTBEAT.md / examples |
| manifest | soul.json | soul.json（含 specVersion / compatibility.frameworks / files mapping）|
| 学术 grounding | 无 | MSR 2026 study, 466 项目分析 |

### 2.2 SoulSpec 文件结构

```
├── soul.json                JSON manifest
├── SOUL.md                  必需 - 个性、价值、沟通风格
├── IDENTITY.md              可选 - 名字、角色、背景
├── AGENTS.md                可选 - 任务工作流、工具用法、记忆模式
├── STYLE.md                 可选 - 沟通偏好
├── HEARTBEAT.md             可选 - 自主行为
└── examples/                参考输出
```

### 2.3 兼容平台

OpenClaw / Claude Code / Claude Desktop / Cursor / Windsurf

### 2.4 配套工具

- **SoulScan**：验证安全性 + 配置质量
- **VS Code Extension**：语法高亮 + 验证
- **SoulSpec MCP**：Model Context Protocol 服务器，跨平台访问

---

## 3. SillyTavern Character Card V3 详细字段

### 3.1 必需字段
- `spec`: "chara_card_v3"
- `spec_version`: "3.0"
- `data`: 容器
- `group_only_greetings`: 数组

### 3.2 V3 完整字段清单

| 字段 | 类型 | 用途 |
|------|------|------|
| name | string | 角色全名 |
| nickname | string | 替代 {{char}} 宏 |
| description | string | 描述 |
| personality | string | 性格 |
| scenario | string | 默认场景 |
| first_mes | string | 第一句话 |
| alternate_greetings | string[] | 备选问候 |
| mes_example | string | 范例对话 |
| system_prompt | string | system prompt 注入 |
| post_history_instructions | string | 历史后指令 |
| creator_notes | string | 创建者备注 |
| creator_notes_multilingual | object | 多语言备注 |
| character_book | Lorebook | 知识库 |
| assets | Asset[] | 资源（icon/bg/emotion/user_icon）|
| tags | string[] | 标签 |
| creator | string | 作者 |
| character_version | string | 版本 |
| source | string[] | 来源 URL |
| creation_date | number | 创建时间戳 |
| modification_date | number | 修改时间戳 |
| extensions | object | 扩展字段 |

### 3.3 Lorebook 系统（值得借鉴）

含 **触发词机制 + decorators**——可作为 Neo 知识库 / 记忆调用机制的参考。

**Decorators（@@xxx 格式）**：
- 激活：`@@activate_only_after 5` / `@@activate_only_every 2` / `@@keep_activate_after_match`
- 位置：`@@depth 3` / `@@reverse_depth 2` / `@@position after_desc`
- 匹配：`@@scan_depth 10` / `@@is_greeting 0` / `@@additional_keys` / `@@exclude_keys`
- 角色：`@@role assistant|system|user`

### 3.4 Macros（值得借鉴）

- `{{char}}` / `{{user}}` / `{{random:A,B,C}}` / `{{pick:A,B,C}}` / `{{roll:6}}`
- `{{//hidden}}` / `{{hidden_key:A}}` / `{{comment:note}}` / `{{reverse:hello}}`

### 3.5 PNG 嵌入机制

V3 用 `ccv3` 块（base64 JSON）。也支持 V2 兼容（`chara` 块）。CHARX 格式 ZIP 含 assets。

---

## 4. Character.AI 简版字段

### 4.1 字段清单（短小精悍）

Name / Gender / Sexuality / Age / Nationality / Personality / Description / Appearance / Residence / Relationships / Voice/Speech / Occupation / Likes / Dislikes / Powers / Skills / Weaknesses / Goal / Backstory

### 4.2 关键约束
- **728 字符限制**——极短
- 推荐 JSON 格式
- 用分号分隔

### 4.3 范例

> "15-year-old male; intelligent; mature; respectful; aspires to be a legendary pirate; underwater adventurer; constantly practices swordplay, secretly honing exceptional sword skills; believes he can talk to aquatic creatures; carries a mysterious compass passed down through generations. Likes: The freedom of the sea, swords, adventure, ancient maps."

---

## 5. Anthropic Constitutional AI 方法论

### 5.1 核心机制

给 AI 一组**原则（"constitution"）**，让 AI **自己 critique 和 revise** 自己的输出。两阶段：
- Supervised Learning Phase：用 principles + 范例训练 critique-revise
- RL Phase：用 AI feedback 评估输出（不是人类反馈）

### 5.2 对睿学的启发

- Neo 的 5 条核心价值观（V1-V5）可以作为 Neo 的 constitution
- 训练时让 Neo 用 V1-V5 self-critique 输出
- 这是 Soul 落地到 prompt + 训练的桥梁

---

## 6. 综合：4 个流派的字段对比

| 字段类别 | aaronjmars/soul.md | SoulSpec | SillyTavern V3 | Character.AI |
|----------|------------------|----------|---------------|--------------|
| 基础身份 | Identity Statement | IDENTITY.md | name/description/personality | Name/Description/Personality |
| 价值观/立场 | Values/Hot Takes/Anti-Positions | SOUL.md | scenario | （隐含在 personality）|
| 影响来源 | Influences | （可选）| - | - |
| 矛盾点 | **明确鼓励** | （隐含）| - | - |
| voice | STYLE.md | STYLE.md | mes_example | （隐含）|
| 操作模式 | SKILL.md | AGENTS.md | system_prompt | - |
| 记忆 | MEMORY.md | （独立机制）| - | - |
| 知识库 | data/ | examples/ | character_book/Lorebook | - |
| 验证 | examples/ + 预测测试 | SoulScan | - | - |
| 资源 | data/ | - | assets[] | - |
| 字符限制 | 无 | 无 | 无 | 728 |

### 关键观察

- **只有 aaronjmars/soul.md 明确鼓励"矛盾点"**——这是真实人的标志
- **SillyTavern V3 最重技术（PNG 嵌入 / Lorebook / Macros）**——但偏游戏角色，对教师不够
- **Character.AI 最简（728 字符）**——商业化导向，标准化便于共享
- **SoulSpec 最学术（基于 466 项目研究）**——但抽象，缺具体范例

---

## 7. 哲学冲突（debate 种子）

### 冲突 1 · 是否需要"矛盾点"？
- **soul.md**：必须有矛盾点——真实人就是不一致的
- **SoulSpec**：未明确
- **SillyTavern**：游戏角色不强调
- **对睿学的问题**：Neo 是教师，矛盾点会损害专业感吗？还是反而显得真实？

### 冲突 2 · Soul 是固定还是演化？
- **soul.md**：MEMORY.md 演化，但 SOUL.md 相对稳定
- **open-soul**：YAML seeds → AI 自己生长
- **SoulSpec**：未明确演化机制
- **对睿学的问题**：Neo 6 个月项目里 Soul 该不该自己演化？

### 冲突 3 · 学员可定制还是固定？
- 无标准明确给出答案
- **对睿学的问题**：客户能选"严厉/温和"风格吗？

### 冲突 4 · 短（Character.AI 728字）还是长（soul.md 千字+）？
- 短：跨平台共享方便、训练数据小
- 长：信息密度高、立场更鲜明
- **对睿学的问题**：v0.1 倾向长（7 节 11 维度），是否过度？

### 冲突 5 · prompt 注入还是训练嵌入？
- soul.md：prompt 注入 + 弱模型也能用
- Constitutional AI：训练嵌入
- **对睿学的问题**：Neo system prompt 多大？训练专用模型？

---

## 8. 推荐 Soul 文档格式（候选清单，不收敛）

### 候选 A · soul.md 5 文件结构（推荐做基线）
```
neo-soul/
├── SOUL.md           Identity / Worldview / Hot Takes / Anti-Positions
├── STYLE.md          Voice / Vocabulary / Syntax / Examples
├── SKILL.md          5 场域 × 7 动作 操作模式
├── MEMORY.md         跨场域记忆（与 P2 协同）
└── soul.json         manifest
```
**优势**：开源工业标准、可与 OpenClaw / Claude Code 兼容、有验证机制
**风险**：是个人化设计，未必适合教育场景

### 候选 B · SoulSpec 4 文件结构
```
neo-soul/
├── soul.json
├── SOUL.md           核心人格
├── IDENTITY.md       身份/角色/背景
└── AGENTS.md         工作流/记忆/工具
```
**优势**：学术依据、跨平台
**风险**：抽象、缺范例

### 候选 C · 自研单文件（当前 v0.1）
`02-temp/0426-soul-neo.md` 的 11 节结构
**优势**：定制化教育场景
**风险**：自创格式，难复用社区

### 候选 D · 混合
SoulSpec 文件结构 + soul.md 字段精度 + 自研教师场域适配
**优势**：兼顾标准 + 定制
**风险**：复杂

---

## 9. 给睿学 Neo Soul v0.2 的具体反馈

参考 `02-temp/0426-soul-neo.md` v0.1，调研发现的改进建议：

### 加什么
1. **拆成 5 文件**（候选 A）：v0.1 单文件版本不易跨场景复用
2. **加 examples/good-outputs.md + bad-outputs.md**：必需，验证 Soul 真懂
3. **加 Influences 字段**：v0.1 隐含 1v1 老师 / GROW，但没列出"哪些影响 Neo"
4. **加 Anti-Positions**：v0.1 第 3 节"反对什么"接近，但更明确
5. **加 Meta 字段**：Neo 在什么情况下会改变想法
6. **加预测测试**：reviewer 拿新主题让 Neo 推理，看看是不是"同一个 Neo"
7. **加弱模型测试分**：用 gpt-4o-mini 跑 Soul，看 voice 是否漂移

### 改什么
1. **第 0 节"一句话画像"** → 改名 **Identity Statement**（与 soul.md 接轨）
2. **第 2 节 5 价值观** → 加每条的"逻辑链"（不只是观点，要有 reasoning）
3. **第 6 节 voice** → 加"voice signature"（短句？长句？破折号偏好？）+ 范例对比加到 ≥5 对
4. **第 7 节"成长"** → 与 MEMORY.md 协同设计

### 删什么
- v0.1 第 11 节"Soul 不能动的部分"——其实就是 SOUL.md 主体内容，重复

### 加配套文件
- `02-temp/neo-soul/SKILL.md`：Neo 5 场域 × 7 动作 操作模式
- `02-temp/neo-soul/MEMORY.md`：与 P2 调研协同
- `02-temp/neo-soul/examples/good-outputs.md`：≥30 范例
- `02-temp/neo-soul/examples/bad-outputs.md`：≥10 反例
- `02-temp/neo-soul/soul.json`：manifest

---

## 10. 风险与盲区

### 风险
1. **soul.md 生态偏个人化（"capture who YOU are"）**——而 Neo 是企业产品的"角色"。生态原本是给"个人 AI 化身"用的，迁移到"产品角色"需要适配
2. **SoulSpec 还很新**（2026 年 standard），生态尚未成熟
3. **Character.AI 限制 728 字**——太短，不适合企业级"老师"角色
4. **多 Agent（Neo/Ora/Actor/导演）的人格距离设计**——所有标准都没解决

### 盲区
1. **soul.md 在教育场景的实战案例**——未找到
2. **真人讲师 / 教练的 soul.md 公开范例**——未找到
3. **企业级 AI Agent Soul 的合规要求**——尚未调研
4. **OpenClaw 生态在中国的可访问性**——未确认

---

## 11. 必答 10 问的初步答案

| # | 问题 | 答案要点 |
|---|------|--------|
| 1 | Character.AI 角色卡字段？最佳实践？ | 19+ 字段 / 728 字限 / JSON 格式 / 短句分号 |
| 2 | SillyTavern V3 完整字段？ | 24+ 字段（含 assets/lorebook/decorators/macros）|
| 3 | Inworld AI NPC framework？ | 待补调研（Personality/Goals/Motivations/Knowledge）|
| 4 | Constitutional AI 怎么写、怎么测？ | principles 列表 / supervised + RL 双阶段 / self-critique-revise |
| 5 | 好老师 5 大特质？ | 待补调研（Hattie / Dweck）|
| 6 | 角色 drift 防御？ | soul.md 用弱模型测试 + examples + 预测测试 |
| 7 | 多 Agent 人格独立？ | 所有标准都没解决，需自研 |
| 8 | 跨场域 voice 一致？ | soul.md 用 STYLE.md + register switching |
| 9 | Soul 与 system prompt 关系？ | SOUL.md+STYLE.md 通常作为 system prompt 一部分 / Constitutional AI 倾向训练嵌入 |
| 10 | 学员可定制？ | 未在主流标准中明确，是 debate 议题 |

---

## 12. 给 Neo Soul v0.2 的引用参考清单

每个 fields 的来源：

| Soul 字段 | 来源 |
|---------|------|
| Identity Statement | aaronjmars/soul.md SOUL.md |
| Worldview / Hot Takes / Anti-Positions | aaronjmars/soul.md |
| Voice / Vocabulary / Syntax / Examples | aaronjmars/soul.md STYLE.md |
| Operating Modes | aaronjmars/soul.md SKILL.md |
| Memory | aaronjmars/soul.md MEMORY.md（与 P2 协同）|
| Lorebook（可选）| SillyTavern V3（用作 Neo 的辅助知识库）|
| Constitution（5 价值观）| Anthropic Constitutional AI |
| Compatibility | SoulSpec |
| 预测测试 / 弱模型验证 | aaronjmars/soul.md 验证机制 |

---

## 13. 引用清单

### soul.md 生态
- [aaronjmars/soul.md](https://github.com/aaronjmars/soul.md) — 核心标杆项目
- [SoulSpec.org](https://soulspec.org/) — 开放标准
- [soul-md.xyz](https://www.soul-md.xyz/) — Composable AI Identity
- [agent-soul-kit](https://github.com/ttian226/agent-soul-kit) — 文件驱动 zero-database
- [souls-directory](https://github.com/thedaviddias/souls-directory)
- [open-soul](https://github.com/doingdd/open-soul) — YAML 演化
- [Moto's Blog · The SOUL.md Pattern](https://moto-westai.github.io/blog/2026/02/21/the-soul-md-pattern/)
- [ClawSouls Blog · Create First AI Soul in 5 Minutes](https://blog.clawsouls.ai/en/posts/create-soul-5-minutes/)

### SillyTavern Character Card
- [character-card-spec-v3 SPEC_V3.md](https://github.com/kwaroran/character-card-spec-v3/blob/main/SPEC_V3.md)
- [character-card-spec-v2 spec_v2.md](https://github.com/malfoyslastname/character-card-spec-v2/blob/main/spec_v2.md)
- [Character Design SillyTavern docs](https://docs.sillytavern.app/usage/core-concepts/characterdesign/)

### Character.AI
- [Adler AI · User Persona on Character.AI](https://medium.com/@adlerai/user-persona-on-character-ai-d674180a8c91)
- [janitorai · What Makes A Good Persona?](https://help.janitorai.com/en/article/what-makes-a-good-persona-bhlhjn/)
- [Anthropic · Persona Vectors Research](https://www.anthropic.com/research/persona-vectors)

### Constitutional AI
- [Anthropic · Claude's Constitution](https://www.anthropic.com/news/claudes-constitution)
- [Constitutional AI: Harmlessness from AI Feedback (paper)](https://arxiv.org/abs/2212.08073)
- [Anthropic · Constitution](https://www.anthropic.com/constitution)
- [Collective Constitutional AI](https://www.anthropic.com/research/collective-constitutional-ai-aligning-a-language-model-with-public-input)

### 学术
- arXiv:2510.21413 (MSR 2026) — 466 开源 AI agent 项目分析

---

## 14. 待补调研（额度恢复后继续）

- [ ] Inworld AI NPC framework 详细字段
- [ ] NovelAI 角色卡格式
- [ ] Sparrow（DeepMind）rule-based persona 详细
- [ ] Hattie Visible Learning / Dweck Growth Mindset 教师特质
- [ ] MBTI / Big Five / Schwartz Values 在 AI Persona 中的应用
- [ ] AutoGen / CrewAI 多 Agent Persona 协同
- [ ] 5 流派教学法（苏格拉底/Rogers/建构主义/GROW/Action Learning）的"老师 Persona"

---

**文档状态**：B2.P3 调研产出 · v0.1 · 发散稿
**核心价值**：发现 soul.md 已是工业级开源标准，**睿学不必自创**——可基于 aaronjmars/soul.md + SoulSpec 标准做适配
**下一步**：用户后续 debate 选格式（候选 A/B/C/D）+ 待补调研

Sources:
- [aaronjmars/soul.md](https://github.com/aaronjmars/soul.md)
- [SoulSpec.org](https://soulspec.org/)
- [character-card-spec-v3](https://github.com/kwaroran/character-card-spec-v3/blob/main/SPEC_V3.md)
- [Anthropic Claude Constitution](https://www.anthropic.com/news/claudes-constitution)
- [Constitutional AI Paper (arXiv 2212.08073)](https://arxiv.org/abs/2212.08073)
- [Adler AI · Character.AI Persona](https://medium.com/@adlerai/user-persona-on-character-ai-d674180a8c91)
- [Anthropic Persona Vectors Research](https://www.anthropic.com/research/persona-vectors)
- [Moto Blog · The SOUL.md Pattern](https://moto-westai.github.io/blog/2026/02/21/the-soul-md-pattern/)
- [souls-directory](https://github.com/thedaviddias/souls-directory)
- [agent-soul-kit](https://github.com/ttian226/agent-soul-kit)
