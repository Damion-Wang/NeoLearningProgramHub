# B2.2 · 开源教练对话数据集调研产出

> **底层原则**：P1 第一性原理 7 动作 + P3 像人（反例 character / 翻车修正）
> **调研者**：Claude Opus 4.7（主上下文）— 因 Agent API 配额限制改自跑
> **日期**：2026-04-26
> **状态**：发散稿

---

## 0. 重大发现摘要

调研发现**至少 9 个高质量开源数据集**可用于 Neo 训练 / 反例 / 启发：

### 教学对话类（最直接对标）
1. **MathDial 3k**（论文 EMNLP 2023）— 真实数学 1v1 教师-学生对话，**关键发现："GPT-3 易过早给答案"**——直接验证 Neo 第一性原理
2. **Eedi Question-Anchored Tutoring Dialogues 2k** — 真实数学辅导
3. **ConvoLearn 2134** — 6 维 dialogic tutoring（中学地球科学）
4. **StudyChat 1197** — 真实大学 AI 课程学员-LLM 对话
5. **Google Education Dialogue Dataset 47k** — Gemini 生成教师-学员对话

### 心理咨询对话类（含真实情绪）
6. **Amod/mental_health_counseling_conversations**（HuggingFace 100K+ 下载） — 真实 1v1 心理咨询
7. **CounselChat (nbertagnolli)** — counselchat.com 真实论坛数据
8. **MentalChat16K** — 合成 + 真实 Behavioral Health Coach 对话
9. **EmpatheticDialogues (Facebook AI) 25k** — 25K 共情对话（半合成）

---

## 1. 教学对话数据集详细对比

| 数据集 | 规模 | 主题 | 真实/合成 | 适合度 | 链接 | 用途 |
|------|------|------|--------|------|------|------|
| MathDial | 3,000 | 数学 1v1 | 真实 | ⭐⭐⭐⭐⭐ | [HF/GitHub](https://github.com/eth-nlped/mathdial) | Neo 反面例（"GPT-3 过早给答案"是 Neo 反面）|
| Eedi Q-Anchored | 2,000 | 数学辅导 | 真实 | ⭐⭐⭐⭐ | [HF](https://huggingface.co/datasets/Eedi/Question-Anchored-Tutoring-Dialogues-2k) | 学员卡点 → 老师追问 范例 |
| ConvoLearn | 2,134 | 中学地球科学 | 半合成 | ⭐⭐⭐⭐ | [arxiv](https://arxiv.org/html/2601.08950) | 6 维 dialogic tutoring，可作为 Neo 训练对照 |
| StudyChat | 1,197 | 大学 AI 课 | 真实（学员-LLM）| ⭐⭐⭐⭐⭐ | [paper](https://huggingface.co/papers/2503.07928) | 真实学员行为模式 + 学员对 LLM 反应 |
| Education Dialogue | 47,234 | 各主题 | 合成（Gemini）| ⭐⭐⭐ | [GitHub](https://github.com/google-research-datasets/Education-Dialogue-Dataset) | 大规模 baseline，覆盖广 |

### 1.1 MathDial 关键发现（重点）

**论文核心结论**："GPT-3 是好的问题解决者，但是 fail 在 tutoring 上——它生成事实错误反馈或过早泄露答案。"

→ **直接验证 Neo 第一性原理 V1 "学习者主导" / V4 "行为重于知识"**：
- Neo 不能像 GPT-3 那样过早给答案
- MathDial 数据集**就是 Neo 训练的反面例**

### 1.2 ConvoLearn 6 维 dialogic tutoring

ConvoLearn 给出的 6 维度：
- 完整数据集：2,134 conversations 全 quality spectrum
- 高质量子集：1,250 conversations

→ 可作为 Neo 行为评分的参考维度（待补深度）

### 1.3 StudyChat 真实学员-LLM 对话

- 大学 AI 课 1,197 conversations
- 用 dialogue act labeling schema 标注
- → **真实学员对 睿学的反应模式**——HR 访谈不能完全替代的视角

---

## 2. 心理咨询/共情对话数据集

| 数据集 | 规模 | 类型 | 适合度 | 用途 |
|------|------|------|------|------|
| Amod/mental_health | ~3,500+ | 真实 1v1 | ⭐⭐⭐⭐ | Neo 在情绪信号上的应对（与 P3 Soul empathy 联动）|
| CounselChat | ~3,000+ | 真实论坛 | ⭐⭐⭐⭐ | 学员真实困惑 → 专业回应范例 |
| MentalChat16K | 16,000 | 合成 + 真实 | ⭐⭐⭐⭐ | Behavioral Health Coach 是与 Neo "教练"角色最近 |
| EmpatheticDialogues | 25,000 | 半合成 | ⭐⭐⭐ | 25K 含 32 种情绪标签 |

### 2.1 EmpatheticDialogues 关键设计

- 32 种情绪状态标签
- 一方写情境 → 对方 listener 回应
- 训练后 dialogue model 被 human evaluators 评为更 empathetic

→ 对睿学的启发：Neo 的"情绪感知"应该是先**识别 32+ 种**情绪信号，再响应

---

## 3. 数据质量评估

### 3.1 真实 vs 合成

| 类型 | 优势 | 劣势 |
|------|------|------|
| **真实数据**（MathDial / Eedi / StudyChat / Amod / CounselChat）| 真实节奏 / 真实学员防御 / 真实修正 | 数据量小、隐私脱敏复杂 |
| **合成数据**（Education Dialogue / EmpatheticDialogues 部分）| 数据量大、覆盖广、易标注 | 缺真实"翻车" / 偏理想化 |
| **半合成**（ConvoLearn / MentalChat16K）| 平衡 | 标注偏理想 |

### 3.2 "翻车 / 防御"片段占比

调研发现：**真实数据集大多包含教练翻车 / 学员防御**——这是内部 GROW 12 份的稀缺资源
- MathDial：含"老师过早给答案 → 学员失去思考机会"反例
- Amod / CounselChat：真实学员防御 / 教练修正
- EmpatheticDialogues：含"听者 fail empathize" 案例

→ **直接弥补 0426-gap-2-grow-coaching.md 第 5 节"GROW 没出现一次翻车"的缺口**

### 3.3 License 与商用

- HuggingFace 上的数据集**多数 CC BY 4.0 / Apache 2.0** 可商用
- CounselChat：CC0 完全开放
- MathDial：研究用途
- → 商用前必须逐个核对每个数据集的 license

---

## 4. 推荐用法

### 4.1 直接作为 Neo 训练数据
- ✅ MathDial（反面例：过早给答案 → Neo 不能这样）
- ✅ Amod/mental_health（情绪信号识别 + 1v1 共情）
- ✅ Eedi Question-Anchored（追问范例）

### 4.2 作为反例参考
- ✅ MathDial（GPT-3 fail 模式 = Neo 不能犯的错）
- ✅ EmpatheticDialogues fail empathize 案例

### 4.3 作为方法论启发
- ✅ ConvoLearn 6 维 dialogic tutoring（可作为 Neo 评分维度）
- ✅ StudyChat dialogue act labeling（学员行为模式分类）

### 4.4 保留（不主动用）
- ⚠️ Google Education Dialogue 47k（合成数据，质量参差不齐）

---

## 5. 给睿学的可借用清单

| 元素 | 来源 | 借用方式 | 优先级 |
|------|------|---------|--------|
| **过早给答案反例** | MathDial 论文 | 直接借用作为 Neo 红线 | P0 |
| **真实数学 1v1 对话** | MathDial / Eedi | 改造借用，作为 Neo 训练片段 | P0 |
| **学员防御 + 教练修正** | Amod / CounselChat | 直接借用补 GROW 缺口 | P0 |
| **6 维 dialogic tutoring** | ConvoLearn | 启发 Neo 评分体系 | P1 |
| **真实学员-LLM 反应模式** | StudyChat | 启发 Neo voice 设计 | P1 |
| **32 种情绪标签** | EmpatheticDialogues | 改造借用 Neo 情绪感知 | P1 |
| **dialogue act labeling schema** | StudyChat | 启发 Neo 信号识别 | P2 |
| **Behavioral Health Coach 模式** | MentalChat16K | 启发 Neo "陪伴 vs 老师"平衡 | P2 |

---

## 6. 风险与盲区

### 风险
1. **language**：所有数据集都是英文。中文学员场景需要翻译/适配
2. **Domain mismatch**：数学 / 心理咨询 / 大学 AI 课 ≠ 企业管理学。**需领域适配**
3. **License 复杂**：商用前必须每个核对
4. **隐私脱敏**：真实数据已脱敏，但商用引入仍需检查

### 盲区
1. **管理学辅导对话**：暂未找到直接对标（管理学 1v1 辅导真实数据）
2. **企业培训对话**：暂未找到（企业 L&D 真实对话）
3. **中文教学对话**：暂未找到（B 站 / 中文学术）→ 待补
4. **真人讲师对话**（vs AI 对话）：需在 B2.3 真人样本中补

---

## 7. 引用清单

### 教学对话
- [HF · Eedi/Question-Anchored-Tutoring-Dialogues-2k](https://huggingface.co/datasets/Eedi/Question-Anchored-Tutoring-Dialogues-2k)
- [GitHub · MathDial](https://github.com/eth-nlped/mathdial) | [arXiv 2305.14536](https://arxiv.org/abs/2305.14536)
- [arXiv · ConvoLearn](https://arxiv.org/html/2601.08950)
- [HF · StudyChat](https://huggingface.co/papers/2503.07928)
- [GitHub · Google Education Dialogue Dataset](https://github.com/google-research-datasets/Education-Dialogue-Dataset)

### 心理咨询对话
- [HF · Amod/mental_health_counseling_conversations](https://huggingface.co/datasets/Amod/mental_health_counseling_conversations)
- [HF · nbertagnolli/counsel-chat](https://huggingface.co/datasets/nbertagnolli/counsel-chat)
- [HF · ShenLab/MentalChat16K](https://huggingface.co/datasets/ShenLab/MentalChat16K)
- [HF · facebook/empathetic_dialogues](https://huggingface.co/datasets/facebook/empathetic_dialogues)
- [GitHub · facebookresearch/EmpatheticDialogues](https://github.com/facebookresearch/EmpatheticDialogues)
- [arXiv 1811.00207 · EmpatheticDialogues paper](https://arxiv.org/abs/1811.00207)

### 多回合咨询
- [HF · Jingy2000/multi-turn-counsel-chat](https://huggingface.co/datasets/Jingy2000/multi-turn-counsel-chat)

---

## 8. 待补调研（额度恢复后）

- [ ] 中文教学/咨询数据集（B 站 / 中文学术）
- [ ] 管理学辅导对话（需找）
- [ ] HBR / Coursera 公开课对话样本（实质内容）
- [ ] CIMA dataset 详细
- [ ] MentalChat16K Behavioral Health Coach 部分深度

---

**文档状态**：B2.2 数据集调研产出 · v0.1 · 发散稿
**核心价值**：
- 9 个高质量数据集清单 + license + 适合度
- **MathDial 反面例直接验证 Neo 第一性原理 "不过早给答案"**
- 真实"翻车 / 学员防御"数据补 GROW 缺口
- 32 种情绪标签可启发 Neo 情绪感知

Sources:
- [HF · MathDial](https://github.com/eth-nlped/mathdial)
- [HF · Amod/mental_health_counseling_conversations](https://huggingface.co/datasets/Amod/mental_health_counseling_conversations)
- [GitHub · EmpatheticDialogues](https://github.com/facebookresearch/EmpatheticDialogues)
- [HF · Eedi/Question-Anchored-Tutoring-Dialogues](https://huggingface.co/datasets/Eedi/Question-Anchored-Tutoring-Dialogues-2k)
- [arXiv · MathDial](https://arxiv.org/abs/2305.14536)
- [HF · StudyChat](https://huggingface.co/papers/2503.07928)
