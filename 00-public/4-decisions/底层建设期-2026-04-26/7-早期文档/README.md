# 早期文档 · ⚠️ 已被替代，不要参考

> **警告**：本目录文档**已被 50 题决策替代**，仅作为开发过程留档
> **研发与设计团队不要参考此目录**

---

## 为什么这些文档被替代

本目录 10 个文件是 2026-04-26 调研过程中**早期版本**。
经过 50 题 PM 决策互动后，这些文档的核心观点已被更新或推翻。

**最终观点见**：
- `0-最终决策总览/50题决策清单与多维度分析.md`
- `1-原则与框架/三大底层原则与PM协作风格.md`
- `2-Neo-Persona/Neo-Soul-final.md`
- 等其他子目录

---

## 早期文档清单与"为什么不要参考"

| 文件 | 早期观点 | 已被替代为 |
|------|---------|----------|
| `0426-soul-neo.md` | 自研单文件 11 节 Soul 结构 | aaronjmars/soul.md 5 文件结构（见 `2-Neo-Persona/Neo-Soul-final.md`）|
| `0426-底层原则框架.md` | P1+P2+P3 框架 v0.1 | v1.0 含 Teacher Credibility 顶级 + Soul 按场域差异化（见 `1-原则与框架/`）|
| `0426-research-master-summary.md` | 调研 master summary v1.0（含 15 议题 debate 准备）| 已直接 PM 决策，debate 不需要（见 `0-最终决策总览/`）|
| `0426-a2-three-track-research-plan.md` | B1+B2+B3 三轨规划（含 HR 访谈）| **B3 HR 访谈本期取消**——研发后试用调优 |
| `0426-a3-neo-persona-v0.1.md` | Neo Persona v0.1（基于 v0.1 Soul）| Neo-Soul-final.md（基于 5 文件结构 + 顶级 Credibility）|
| `0426-a3-project-lifecycle-sop-v0.1.md` | 项目全生命周期 SOP v0.1 | 本期不重要——研发先做产品，SOP 随后补 |
| `0426-a4-three-deliverables-schedule.md` | 三件套节奏表（v0.1@5/9 / v0.2@5/23 / v1.0@6/1+）| **不锁时间**——研发能力决定（"今晚结束调研"）|
| `0426-a5-spec-sync-sop.md` | spec 同步 SOP | **A5 暂停**——本期不动 spec，研发完后再 sync |
| `0426-memory-system-research-brief.md` | P2 调研 brief（v0.1）| 实际调研已完成（见 `6-原始调研/0426-r4-memory-systems.md`）+ Memory 设计原则（见 `3-记忆系统/`）|
| `0426-persona-research-brief.md` | P3 调研 brief（v0.1）| 实际调研已完成（见 `6-原始调研/0426-r5-persona-soul.md`）+ Neo Soul final |

---

## 关键被替代的观点

### 早期 Soul 单文件 11 节 → 5 文件结构
- v0.1 是 DM 自创格式
- 调研发现 aaronjmars/soul.md 是工业标准
- **决策（Meta-2）**：采用 aaronjmars/soul.md 5 文件结构

### 早期 V1-V5 是 Soul 顶层 → Teacher Credibility 顶级
- v0.1 Soul 顶层是 V1-V5（5 价值观）
- Hattie Visible Learning 发现 Teacher Credibility d=0.90 是关键影响因子
- **决策（P1-8）**：Teacher Credibility 升级为 Soul 顶级原则，超过 V1-V5

### 早期单一身份 Neo → 按场域差异化
- v0.1 Soul 设定 Neo 是"老师"单一身份
- **决策（Meta-1 + P1-2）**：Neo 不是单一身份，按 field 调用相应 skill 和倾向

### 早期 6-8 周时间表 → 不锁时间
- v0.1 设计三件套 v0.1/v0.2/v1.0 节奏（5/9 / 5/23 / 6/1+）
- **决策（Meta-3）**：今晚结束调研，研发能力决定后续

### 早期 HR 访谈三轨 → 取消
- v0.1 设计 B1 内化 + B2 外部 + B3 HR 访谈
- **决策**：B3 HR 访谈本期取消，研发后用天使客户试用调优

### 早期 RAG 防幻觉 → 不靠 RAG
- v0.1 设计强制 retrieval + 引文 + 拒答
- **决策（P2-5）**：Neo 溯源靠 Agent 能力，不通过 RAG / 不设向量库

### 早期 5 层渐进画像 → 与 Khanmigo skill 双重架构
- v0.1 仅 5 层画像
- **决策（P2-2）**：5 层画像 + Khanmigo skill+prerequisites 融合

### 早期"被遗忘权" → 不提供
- v0.1 brief 提到 GDPR / 中国个保法需"被遗忘权"
- **决策（P2-11）**：参照 1v1 真人老师不能选择性遗忘 → 不提供

### 早期"学员可定制 Neo 风格" → 不提供
- v0.1 brief 提到候选项
- **决策（P3-5）**：参照真人老师人格固定 → 不提供

### 早期"15 议题 + 3 Meta debate" → 直接 PM 决策
- master summary 准备了 15+3 议题给 5 角色辩论
- **决策**：DM 直接逐题决策，不走辩论流程

---

## 如果你不小心读了早期文档

**回到 50 题决策清单**：[`0-最终决策总览/50题决策清单与多维度分析.md`](../0-最终决策总览/50题决策清单与多维度分析.md)

**任何与 50 题决策冲突的早期观点**，**以 50 题决策为准**。

---

## 为什么保留这些文档

- **过程留档**：可追溯决策演化
- **学术参考**：早期 brief 含完整论文/对标清单（被 50 题简化后可能丢失）
- **如要 v2 调研**：可基于早期框架扩展

⚠️ **不要直接交给研发** —— 让研发只读 `0-最终决策总览/`、`1-原则与框架/`、`2-Neo-Persona/`、`3-记忆系统/`、`4-教学方法论/`、`5-数据集与样本/`

---

**文档状态**：早期文档归档说明 v1.0
