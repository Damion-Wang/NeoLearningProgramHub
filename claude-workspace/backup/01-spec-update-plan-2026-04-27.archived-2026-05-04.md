---
version: V-0.2.0-D-5.0
product-version: V-0.2.0
doc-version: D-5.0
status: draft
last-updated: 2026-04-29
---

# spec 更新计划 · 2026-04-27

> **作者**：DM 视角 · 自上而下 · 全量梳理
> **作用**：基于近期累积的 4 大输入源（0424 决策 / 底层建设期 know-how / 三轮 debate / Leo 全文清理），规划 spec v0.4.0 → v0.5.0 的全量更新路径
> **范围**：design/ 全部 19 个文件 + 总纲 + future-iterations + spec 根 README

---

## 0 · 顶层框架

### 0.1 当前 spec 状态（v0.4.0）
- ✅ 总纲 requirements-v0.4.0 已审阅
- ✅ design/ 19 个 [已审阅] / 普通文件全部存在
- ✅ Leo 已全文清理（学员端只有 Neo）
- ⚠️ § 3 项目全生命周期粗（1 页 7 阶段）
- ⚠️ § 8.2 记忆工程未含 P2 5 层渐进画像
- ⚠️ § 4 AI 角色未含 P3 Soul 按场域差异化
- ⚠️ AOM 5 层未提"skill mastery + prerequisites"维度
- ⚠️ 0424 反向补充零散，部分被新 debate 推翻

### 0.2 目标状态（v0.5.0）
- ✅ § 3 项目全生命周期重写为 8 阶段 + 服务/项目周期二元模型
- ✅ § 8.2 记忆工程含 P2 完整设计原则
- ✅ § 4 AI 角色含 P3 Soul 按场域差异化 + Teacher Credibility 顶级
- ✅ 新增 § 11 三大底层原则（P1/P2/P3）+ § 12 PM 协作风格
- ✅ 全部模块 spec 反映 4 个调研产出 + 3 轮 debate 共识
- ✅ ADR 索引扩展（+ ADR-011 ~ ADR-014）
- ✅ V2 待办归档到 future-iterations.md

### 0.3 4 大输入源
| # | 输入 | 位置 | 影响范围 |
|---|------|------|--------|
| 1 | **0424 决策 31 条** | `02-temp/0424-spec-diff-decisions.md` | 全部 spec（已部分落地）|
| 2 | **底层建设期 know-how** | `00-public/4-decisions/底层建设期-2026-04-26/` | 总纲 + 03-ai-brand + 学员端 + 管理端 |
| 3 | **三轮 debate 共识** | `00-public/5-process/debates/2026-04-26-spec-deepening/` | § 3 / hall / lecture / practice / report / management |
| 4 | **Leo 全文清理** | 本月已 commit | 已完成 ✅ |

### 0.4 推翻的早期决策（清晰追踪）
| 早期决策 | 来源 | 推翻人 | 新立场 |
|---------|------|------|------|
| S-12 结项后只读 | 0424 决策 | 轮 1 DM 互动 | 服务期内正常使用 |
| C-05 4 库 2×2 网格 | 0424 hall.md 反补 | 轮 2 DM 互动 | 4 tab 水平排列 |
| Soul 单一身份 | v0.1 自研版 | DM 50 题决策 | 按场域差异化 |
| 调研访谈 B3 | 0426 三轨 | DM 50 题决策 | 取消，研发后试用调优 |

---

## 1 · 按文件维度的更新清单

> 标记说明：
> - 🔴 重大重写（章节级别推翻或新建）
> - 🟡 反向补充（追加章节，不删原文）
> - 🟢 字段微调 / 错别字 / 引用更新
> - 🔵 待讨论（DM 还没拍板）
> - ⚪ 已完成（仅 audit）

### 1.1 总纲层

#### A · `requirements-v0.4.0.md` → 升级到 `requirements-v0.5.0.md`

| 章节 | 改动类型 | 来源 | 内容 |
|------|--------|------|------|
| § 1 产品定义 | ⚪ 已 Leo 清理 + 品牌名修正 | 之前 commit | 无 |
| **§ 3 项目全生命周期** | 🔴 **重写为 8 阶段 + 服务/项目周期二元** | 轮 1 04-阶段性结论 | 见 1.1.A § 3 详细 |
| § 4 AI 角色架构 | 🟡 反向补充 P3 Soul 按场域差异化 + Teacher Credibility 顶级 | 底层建设期 + 轮 3 | 见 1.1.A § 4 详细 |
| § 5 两端布局 | ⚪ 已 Neo 清理 | 之前 commit | 无 |
| § 6 AOM 5 层 | 🟡 反向补充"skill mastery + prerequisites"维度 | P2 调研 + 轮 3 | 见 1.1.A § 6 详细 |
| § 7 模块组成 | ⚪ 已更新 | 之前 commit | 无 |
| **§ 8.2 记忆工程** | 🔴 **重写含 P2 完整设计原则** | 底层建设期 + 轮 3 | 见 1.1.A § 8 详细 |
| § 8.4 双头 SCO | 🟢 加注口语称（0424 S-09，已部分落地）| 0424 | 微调 |
| § 8.7 举证机制 | 🟡 反向补充"实时挖掘 vs 预先打标"双路径 | 0424 N-04 | 反补 |
| § 9 设计哲学 | ⚪ 已 Leo 清理 | 之前 commit | 无 |
| § 10 六月 Scope | 🟡 反向补充本轮调整（4 库 4 tab / 服务期等）| 三轮 debate | 反补 |
| 附录 V2+ 不做 | 🟡 反向补充新增 V2 项 | 三轮 debate | 反补 |
| 附录 v0.4.0 → v0.5.0 变更清单 | 🔴 **新增** | 综合 | 见 1.1.A 附录详细 |
| 附录 ADR 索引 | 🟡 加 ADR-011 ~ 014 | 综合 | 见 1.1.A ADR 详细 |
| **§ 11 三大底层原则**（新增）| 🔴 **新建** | 底层建设期 | P1 7 动作 / P2 懂你 / P3 像人 |
| **§ 12 PM 协作风格**（新增）| 🔴 **新建** | 底层建设期 | 4 项锁定（PM 角度 / 1v1 真人老师 / Soul 按场域 / 不决定时间）|

##### 1.1.A 详细展开

###### § 3 项目全生命周期（重写 - 最重大）

**当前**：1 页 7 阶段流程图 + 状态表 + 项目规模

**目标 v0.5.0**：
- 服务周期 vs 项目周期 二元模型（DM 在轮 1 引入）
- 8 阶段（商机识别 / 客户意愿 / 签单 / 开营 / 学习期 / 结营 / **服务期延续** / 服务截至）
- 每阶段：触发 / 输入 / 输出 / 角色 / 关键决策点
- Pilot 子阶段（开营组织下，5-15 人 / 2-4 周 / 2-3 Course）
- 变更管理子流程（学习期下）
- 5 角色 RACI 表（SE / DE / HR / Neo / Ora）
- 状态机扩展（开营前 / 学习期 / 项目结束 / 服务期内 / 服务截至）

**预算**：8K 字（替换 1K 字粗版）

**依赖**：完成 § 3 后才能更新 management/03-project-config.md（R 系列）

###### § 4 AI 角色架构

**当前**：4 角色表（Neo / Actor / 导演 / Ora）+ Neo 第一性原理

**目标 v0.5.0**：
- 加 § 4.x · Soul 按场域差异化（Neo 在大厅 = Coach / 授课 = Tutor / 对练 = 旁观+介入 / 调研 = 接纳采集 / 报告 = 教练+反思）
- 加 § 4.y · Teacher Credibility 顶级原则
- 加 § 4.z · 不当舔狗 voice 边界
- 加 § 4.w · Ora Soul 起点（严谨/客观/证据导向 · 与 Neo 互补）

**预算**：3K 字反向补充

###### § 6 AOM 5 层

**当前**：Project / Course / Activity / SCO / Segment

**目标 v0.5.0**：
- 增加"skill mastery"维度（每个学员对每个 skill 的掌握度，来自 Khanmigo）
- 增加"prerequisites"前置依赖图谱

**预算**：1K 字反向补充

###### § 8 跨模块系统 → § 8.2 记忆工程（重写）

**当前**：跨场域记忆贯通（短）

**目标 v0.5.0**：
- 5 层渐进画像（L1-L5）
- Khanmigo skill+prerequisites 双重架构
- 教学法 + 记忆联动（多维度加权 W/skill/情绪/意图）
- Neo 溯源靠 Agent 能力（不靠 RAG / 不设向量库）
- 学员可见 vs HR 可见（含 0424 C-06 协调）
- Neo / Ora 互补不隔离
- 频率边界（大厅每轮 ≤ 1 次明示）
- "懂我"瞬间设计（4 类）
- Neo 记错处理
- 防幻觉机制
- 不提供"被遗忘权"

**预算**：4K 字重写

###### § 11 三大底层原则（新建）

完整迁移自 `4-decisions/底层建设期-2026-04-26/1-原则与框架/三大底层原则与PM协作风格.md`

**预算**：3K 字新建

###### § 12 PM 协作风格（新建）

锁定 4 项

**预算**：1K 字新建

###### 附录 v0.4.0 → v0.5.0 变更清单（新建）

约 30 条变更（合并 0424 31 条 + 三轮 debate + 底层建设期）

**预算**：2K 字

###### 附录 ADR 索引扩展

| ADR | 标题 | 来源 |
|-----|------|------|
| ADR-011 | 服务/项目周期二元模型 | 轮 1 |
| ADR-012 | Soul 按场域差异化 | 底层建设期 |
| ADR-013 | Memory 不靠 RAG | 底层建设期 |
| ADR-014 | 4 库 GUI 4 tab（推翻 0424 C-05）| 轮 2 |
| ADR-015 | 不当舔狗 voice 边界 | 底层建设期 + DM 50 题 |

**预算**：每 ADR 200-500 字 × 5 = 1.5K-2.5K 字

---

#### B · `design/00-future-iterations.md`

| 章节 | 改动 | 来源 |
|------|------|------|
| V2 待办列表 | 🟡 反向补充以下：| 综合 |
| 1. 年包 / 订阅模式 | + | 轮 1 N-01 |
| 2. Actor + 导演 Soul | + | 轮 3 议题 5 |
| 3. 主动 CSM 推送 | + | 轮 1 议题 5 |
| 4. 拖拽题型（连线/排序）| + | 轮 2 议题 3 |
| 5. 老手期模式（无 tutor）| + | 0424 C-04 |
| 6. 跨库搜索（4 库）| + | 轮 2 议题 2 |
| 7. 报告衍生（视频 / 新课程）| + | 0424 N-02 |
| 8. AI 实时举证（vs 预先打标）| + | 0424 N-04 |
| 9. 教练状态可视化（Actor 情绪进度条）| + | 0424 N-05 |
| 10. 必修/选修课区分（AOM 字段）| + | 0424 N-09 |
| 11. 消息搜索 P3 → V2 | + | 0424 N-10 |

**预算**：1K 字反向补充

---

### 1.2 通用层（design/common/）

#### C · `common/00-overview.md` 🟡

- C1 加 Neo Hero 形象引用（与 03-ai-brand 协调）

#### D · `common/01-general.md` 🟡

- D1 加"完整时间线"展示（服务期 / 项目期 / 当前段）— 轮 2 议题 1
- D2 加"被遗忘权不提供"明确条款 — 50 题决策

#### E · `common/02-notification.md` ⚪

- 已与 0424 S-04 一致，无需更新

#### F · `common/03-ai-brand.md` 🔴 **本期最重要更新文件之一**

当前文件已含部分 v0.4.0 反向补充内容。需要重写补足：

| 章节 | 改动 | 来源 |
|------|------|------|
| 顶级原则（新建）| 🔴 Teacher Credibility（Hattie d=0.90）作为 Soul 顶级 | 底层建设期 P3 + 50 题 P1-8 |
| Soul 5 文件结构（新建）| 🔴 SOUL.md / STYLE.md / SKILL.md / MEMORY.md / soul.json + examples/ | 50 题 Meta-2 |
| Soul 按场域差异化（新建）| 🔴 5 场域 × Neo 倾向表 | 50 题 Meta-1 + 轮 3 |
| V1-V5 核心价值观 | 🟡 反向补充（学习者主导 / 真实优先 / 节奏 / 行为 / 长期陪伴）| 底层建设期 |
| 不当舔狗（新建）| 🔴 voice 边界 + 反例 + Dweck 表扬 effort | 50 题 P1-9 + 轮 3 |
| Memory 引用 voice 准则（新建）| 🟡 反向补充（朴素 / 不机械 / 限频 / 限定语）| 轮 3 维度 1 |
| 5 大 Behavior 维度框架（新建）| 🔴 Memory / Voice / 教学策略 / 卡点 / Agent 协同 | 轮 3 |
| Ora Soul 起点（新建）| 🟡 反向补充（严谨/客观/证据导向 · 与 Neo 互补）| 底层建设期 |
| 资产清单 | 🟡 加 SoulSpec / aaronjmars/soul.md 引用 | 50 题 Meta-2 |

**预算**：6K 字（含原文重组 + 大量新增）

**这是 v0.5.0 的核心更新文件**

---

### 1.3 学员端层（design/learner/）

#### G · `learner/00-overview.md` 🟡

- G1 加 8 阶段全生命周期引用（与 requirements § 3 协调）
- G2 项目结束 → 服务期内正常使用 状态描述（替代旧"只读延续"）
- G3 跨模块共享能力表加"服务期延续"行
- G4 协调本期 Pilot 子阶段（学员视角不感知）

**预算**：1K 字反向补充

#### H · `learner/01-hall.md` 🔴 **本期重大更新文件**

| 章节 | 改动 | 来源 |
|------|------|------|
| 4 库 GUI | 🔴 **2×2 网格 → 4 tab 水平排列 + 数量显示**（推翻 0424 C-05）| 轮 2 议题 2 + DM 互动 |
| Topbar 项目状态 | 🔴 **新增 项目期 / 项目已完成 / 服务期延续 / 服务截至 4 个状态** | 轮 2 议题 1 + 轮 1 |
| Neo 大厅 Coach 能力 | 🟡 反向补充（参考 Neo Soul final 大厅倾向）| 底层建设期 + 轮 3 |
| 跨场域 Memory 调用 voice | 🟡 反向补充（朴素 / 限频 / 限定语）| 轮 3 维度 1 |
| 个人资产 4 tab 入口 | 🔴 新设计 GUI（结构化整理）| 轮 2 议题 2 |
| 项目结束当天 Neo 仪式 | 🟡 反向补充"完成 + 邀请回来"voice | 轮 2 议题 1 + DM 互动 |

**预算**：3K 字反向补充 + 局部重写

#### I · `learner/02-lecture-zone.md` 🟡

- I1 7 题型 GUI 分批（5 种 P0 + 连线/排序看 KGP 数据）— 轮 2 议题 3
- I2 不给答案 voice（教学场景，引导方向）— 轮 3 维度 3
- I3 卡点处理 GUI（学员答错 → 拆解卡点）

**预算**：1.5K 字反向补充

#### J · `learner/03-practice-zone.md` 🔴

| 章节 | 改动 | 来源 |
|------|------|------|
| 逃生通道 GUI 流程 | 🔴 **新增章节**（1 次 Actor 提示 + 2 次 Neo 询问切讲授）| 轮 2 议题 4 |
| Actor + 导演 Soul 占位 | 🟡 反向补充（V2 入）| 轮 3 议题 5 |
| Neo 在对练的"翻车修复"voice | 🟡 反向补充 | 轮 3 维度 4 |
| 双栏 GUI 物理隔离明确 | 🟡 反向补充（学员叫 Neo 必须切栏）| 轮 3 DM 互动 |

**预算**：2K 字反向补充

#### K · `learner/04-inquiry-zone.md` 🟡

- K1 三阶段命名（说明 → 核心 → **成果澄清**）— 0424 C-02 已落地
- K2 BEI 调研 voice（不剧透 / 接纳采集）— 轮 3 维度 3 调研场域
- K3 P3 优先级澄清（"P1/P2/P3 是 6/1 前完成度，P3 = 6/1 前不强求但启动预研"）— 0424 C-01

**预算**：1.5K 字反向补充

#### L · `learner/05-report-zone.md` 🟡

- L1 报告分级（report field Activity 级别 + HR 端中期/结项 = 两个独立模块）— 0424 S-02
- L2 持续价值追踪报告 多次生成（推翻 S-14 旧"1 次"决议）— 轮 1 + DM 互动 2
- L3 Neo 解读 voice（解读 + 反问）— 轮 3 维度 3 报告场域
- L4 服务期内复习产生新数据 → Ora 可补报告

**预算**：2K 字反向补充

#### M · `learner/06-notes.md` 🟡

- M1 加"数据存储 + 图片拖拽 + 原始笔记"（S-03 待细节）

**预算**：1K 字反向补充

#### N · `learner/07-discovery-library.md` 🟢

- N1 已新建，待 [已审阅] 流程通过
- N2 与 4 库 GUI 协调（推荐入口在 4 tab 之一）

**预算**：500 字微调

---

### 1.4 管理端层（design/management/）

#### O · `management/00-overview.md` 🟡

- O1 加 5 角色 RACI 表（轮 1 议题 6）
- O2 单端口 / 双角色登录（已落地，仅 audit）

**预算**：1K 字反向补充

#### P · `management/01-operation.md` 🟡

- P1 Ora 看板"颜色条 + 自动排序 + 详情页建议动作" GUI（轮 2 议题 5）
- P2 明确"不做主动推送 / 不做日报"（DM 拍板）
- P3 Ora Soul 引用（与 03-ai-brand 协调）
- P4 阶段 5 学习期 异常监控（CSM 自动化降级为仅看板）

**预算**：2K 字反向补充

#### Q · `management/02-report-gen.md` 🟡

- Q1 4 种模板（中期 / 结项 / **持续价值追踪** / 自定义）— 0424 S-13 / S-14
- Q2 持续价值追踪报告 多次生成机制（轮 1 + 2）
- Q3 项目结项后数据冻结 vs 服务期内可补充

**预算**：1.5K 字反向补充

#### R · `management/03-project-config.md` 🔴 **本期重大更新**

| 章节 | 改动 | 来源 |
|------|------|------|
| **服务周期 vs 项目周期** 二元配置 | 🔴 **新增**（最长 1 年 + 默认 6 月可延期）| 轮 1 |
| Pilot 子阶段配置 | 🔴 **新增**（默认关闭 / 5-15 人 / 2-4 周 / 2-3 Course）| 轮 1 议题 2 |
| 催学规则与项目周期延期关系 | 🟡 反向补充 | 轮 1 议题 4 |
| 变更管理子流程 SOP | 🔴 **新增**（中途调名单 / 调课程 / 调催学规则）| 轮 1 议题 4 |
| 8 阶段开营子阶段 | 🟡 反向补充（4.0 Pilot / 4.1 内容预览 / 4.2 配置 / 4.3 启动会 / 4.4 确认开营）| 轮 1 |

**预算**：3K 字大幅扩展

#### S · `management/04-message.md` ⚪

- 与 0424 决策 S-04 一致，无需更新

---

### 1.5 spec 根 README 与 design README

#### T · `design/README.md` 🟢

- T1 已含 07-discovery-library + 03-ai-brand
- T2 加"三大底层原则"顶层引用（指向 § 11）
- T3 加 plan/ 目录引用

**预算**：500 字微调

#### U · `spec/README.md` 🔴 **本任务清理范围**

- U1 重写到指向 design/v0.5.0
- U2 删除 v0.3.3 / rawIdea / DM_Temp 等过时引用
- U3 加 plan/ 目录索引
- U4 加来源说明（基于 4 大输入源）

**预算**：500 字重写

---

## 2 · 待 DM 拍板的议题清单 ✅ 已全部决议（2026-04-27）

> 10 题已逐个 DM 拍板，决策结果如下。**spec 更新按这些决议执行**。

| # | 议题 | DM 决策 | 影响 spec 调整 |
|---|------|--------|---------|
| **D-01** | 持续价值追踪报告本期是否做 | ❌ **本期不做（V2 启动）** | 02-report-gen / 05-report-zone 不再加多次生成；保留"4 模板"骨架 |
| **D-02** | C-06 学员原话 HR 可见 | ✅ **保持 0424 原决（原话直出 HR）** | requirements / 01-operation 不动 |
| **D-03** | 5 大 Behavior 维度测试集 50-100 用户故事 | **Claude 主导生产，DM 审核** | 后续工作流（不阻塞 spec）|
| **D-04** | 9 个 debate 待办入 4-decisions 形式 | **直接放进本次 plan**（不入 4-decisions）| 由本 plan/01 跟踪 |
| **D-05** ⚠️ | ~~Quiz 抽样~~（PM 错误） | **PM 修正**：题型支持由 PM 决策（平台能力），AOM 决定用哪些题型（KGP 内容侧） | 02-lecture-zone：本期支持 7 题型 ✅，不"抽样" |
| **D-06** | 学员可定制 Neo voice 风格 | **本期语言风格不可调，可调头像和 TTS** | 03-ai-brand 加约束 |
| **D-07** ⚠️ | ~~Pilot~~（PM 错误用词） | **PM 修正**：改"**试运行**"（产品语言）| § 3 / 03-project-config 用"试运行"|
| **D-08** | 服务/项目周期数值 | **服务周期 ≤ 12 个月，项目周期 ≤ 11 个月**（二者必有 ≥ 1 月差）| § 3 / 03-project-config 写明上限 |
| **D-09** | 被遗忘权大客户例外 | **完全不提供（参照真人老师）** | common/01-general 加"不提供被遗忘权"|
| **D-10** | requirements 版本号 | **一次 v0.5.0 大版本（本周完成全量重写）** | requirements-v0.4.0.md → v0.5.0.md |

### PM 角色 2 次错误（来自 D-05 / D-07，记入 SKILL 经验）
- **D-05 错误**：PM 造词"Quiz 抽样"——忘了 AOM 决定 SCO 顺序 + Quiz 题型由 AOM 内容侧决定。**正确理解**：本期平台**直接支持 7 题型**（无需"抽样决定 P0 vs V2"），AOM 内容侧选用哪些是 KGP 决策。
- **D-07 错误**：PM 用 SaaS 行业词"Pilot"——DM 反弹"用产品语言别造新词"。**修正**：所有"Pilot"改"**试运行**"。

### 节奏锁定
- **本周完成 v0.5.0 全量重写**（D-10）
- 所有 10 题决议 + 7 项 gap 反向补充 → v0.5.0 重写时整合
- 不允许再造英文新词 / 不允许擅自"抽样"等 PM 拍脑袋动作

---

## 3 · 结构化整理需求

> 既有内容散乱，需要重组（不是新内容而是结构改造）

### S-01 · § 3 项目全生命周期 重组
- 现状：1 页 7 阶段流程图 + 状态表 + 项目规模 散在 §3.1-3.3
- 目标：8 阶段独立成节，每阶段统一格式（触发/输入/输出/角色/决策点）
- 工作量：大（重写）

### S-02 · spec 概念字典（新建）
- 需要在 spec/plan/ 加 `02-spec-concept-dictionary.md`
- 收录所有新引入概念：服务周期 / 项目周期 / 5 层画像 / 三大底层原则 / 5 大维度 / Teacher Credibility 顶级 / 不当舔狗 / 7 动作 / Neo 5 文件结构 / SoulSpec / aaronjmars/soul.md / Khanmigo skills+prerequisites / Pilot / 缓冲期 / 服务期延续 / Ora 看板 等
- 工作量：中

### S-03 · 0424 反向补充 vs 本轮 debate 反向补充 协调
- 现状：spec 各 [已审阅] 文件含 0424 反向补充章节，但部分内容已被本轮 debate 推翻（S-12 / C-05）
- 目标：保留历史 + 加注"已被 2026-04-26 debate 推翻 → 见新章节"
- 工作量：小（3-5 处加注）

### S-04 · ADR 索引整理
- 现状：requirements § 附录 ADR 索引散在
- 目标：加 ADR-011 ~ 015 + 每个 ADR 独立成 `4-decisions/00X-标题.md`
- 工作量：中（5 个 ADR × 200-500 字）

### S-05 · "学员旅程"维度重组
- 现状：分散在 learner/00-overview "学员的一天"
- 目标：按"项目期 / 项目结束 / 服务期延续 / 服务截至" 4 阶段重组学员场景
- 工作量：中

---

## 4 · 工作量估算

### 4.1 文件改动汇总

| 类别 | 数量 | 预算字数 |
|------|------|---------|
| 🔴 重大重写章节 | 7 处 | ~25K 字 |
| 🟡 反向补充章节 | 18 处 | ~20K 字 |
| 🟢 微调 | 6 处 | ~3K 字 |
| 🔵 待讨论议题 | 10 个 | （讨论后计入对应类别）|
| 新建 ADR | 5 个 | ~2K 字 |
| 新建概念字典 | 1 个 | ~5K 字 |

**总预算**：约 55K-60K 字（含重写 + 反补 + 新建）

### 4.2 推荐方法

| 方法 | 适用范围 | 预算 |
|------|--------|------|
| **DM 主导写**（spec 总纲 / 顶级原则 / 待讨论议题）| § 11 / § 12 / D-01 ~ D-10 / 待讨论 | DM 时间紧但必须 |
| **Agent 并行**（已有素材的反向补充）| common/03-ai-brand / 各场域反补 | 10 个 Agent × 30-60 分钟 |
| **DM 审核 + Agent 起草**（重大重写）| § 3 / § 8.2 / 03-project-config | 中等 |
| **机械整理**（结构化 / 加注）| S-03 / S-04 / V2 待办 | Agent 直接 |

---

## 5 · 更新顺序与依赖

### 5.1 第一波（基础概念，影响下游）
1. requirements **§ 11 三大底层原则**（新建）⭐
2. requirements **§ 12 PM 协作风格**（新建）
3. **概念字典** spec/plan/02-spec-concept-dictionary.md（新建）

### 5.2 第二波（核心模块更新，依赖第一波）
4. requirements **§ 3 项目全生命周期 重写**（8 阶段 + 服务/项目周期）⭐
5. requirements **§ 8.2 记忆工程 重写**（5 层画像 + Khanmigo + 不靠 RAG）⭐
6. requirements **§ 4 AI 角色架构 反补**（Soul 按场域 + Teacher Credibility）

### 5.3 第三波（design/ 模块更新，依赖第二波）
7. **common/03-ai-brand** 大幅重写 ⭐ ⭐
8. **management/03-project-config** 大幅扩展（依赖 § 3）⭐
9. **learner/01-hall** 大幅反补（4 库 + 项目状态 + Neo Coach）⭐
10. **learner/03-practice-zone** 加逃生通道
11. **management/01-operation** Ora 看板设计
12. learner/00-overview / 02 / 04 / 05 / 06 / 07 反补
13. management/00-overview / 02-report-gen 反补
14. common/00 / 01 反补

### 5.4 第四波（系统级整理）
15. ADR 索引扩展（5 个 ADR）
16. v0.4.0 → v0.5.0 变更清单（综合）
17. future-iterations.md V2 待办扩展
18. spec/README.md 重写
19. design/README.md 微调

### 5.5 第五波（待讨论议题）
20. **D-01 ~ D-10 议题逐一讨论 + 决策**（DM 主导）
21. 决策落地到对应 spec 文件

---

## 6 · 风险与跟踪

### 6.1 同步漂移风险
- 多文件并行更新时，引用同一概念可能不一致
- 缓解：先做"概念字典"（§ 11 / § 12 / spec/plan/02）— **第一波必做**

### 6.2 推翻早期决策的风险
- 0424 决策已 commit 入 spec，本轮推翻 2 条（S-12 / C-05）
- 缓解：所有推翻必须明确加注"原 0424 决策 X 已被 2026-04-26 debate 推翻 → 见新章节"

### 6.3 待讨论议题阻塞 spec 更新
- D-01 ~ D-10 中部分议题阻塞下游（如 D-01 持续追踪报告 影响 02-report-gen + 05-report-zone）
- 缓解：先把不阻塞的更新做完，待讨论议题独立追踪

### 6.4 spec sync 完成判定
- 全部🔴🟡完成 → 标记 v0.5.0 alpha
- 待讨论 D-01 ~ D-10 全决议 → 标记 v0.5.0 beta
- 全部 [已审阅] 流程通过 → 标记 v0.5.0 release

---

## 7 · 下一步动作（DM 启动建议）

### 立即可做（今晚 / 明天）
- [ ] 清理废老 spec（rawIdea / requirements-v0.3.3 / spec/README）— 等 Agent gap 报告
- [ ] 写 spec/plan/02-spec-concept-dictionary.md（基础概念字典）
- [ ] 启动 § 11 三大底层原则 章节迁移到 requirements（从 4-decisions/底层建设期 直接迁）

### 待 DM 决策的（开会 / 思考）
- [ ] D-01 ~ D-10 逐一拍板（建议每天 1-2 题）
- [ ] requirements 版本号（v0.4.1 渐进 vs v0.5.0 一次大版本）

### 待研发协调的
- [ ] D-05 KGP Quiz 抽样
- [ ] D-03 5 大维度测试集生产计划

---

## 8 · plan 维护规则

- **本文是动态文档**：随 spec 更新进度，逐项打勾
- **每个更新点完成 → 在本文标 ✅ + 链接到 commit**
- **新发现的 gap → 加到对应章节 + 标日期**
- **DM 审核**：每周一次 review 本 plan，确保不漂移

---

## 9 · 已完成动作（2026-04-27）

### 废老 spec 清理
- ✅ rawIdea.md 归档到 `4-decisions/历史/spec-archive/`
- ✅ requirements-v0.3.3.md 归档（含 ADR / Round-02 辩论溯源价值）
- 🔄 7 项 gap 迁移到 design/ 反向补充章节（Agent 跑中）：
  - gap 3 · 8 Course 完整清单 → requirements-v0.4.0 §3.4
  - gap 4 · ASSESSMENT_TAG SCO schema → 02-lecture-zone
  - gap 5 · 置信度 0.6 阈值 → 02-lecture-zone
  - gap 6 · FEEDBACK_COLLECT schema → 02-lecture-zone
  - gap 7 · passive_signals 字段 → requirements §8.2
  - gap 8 · 催学渠道+漏斗 → 03-project-config + 02-notification
  - gap 9 · BEI 方法论 → 04-inquiry-zone 附录
- ✅ spec/README.md 重写指向 design/ + plan/
- ✅ 归档目录加 README 说明

### plan/ 目录建立
- ✅ 01-spec-update-plan-2026-04-27.md（本文）

### Agent 7 项 gap 迁移完成（2026-04-27）
- ✅ gap 3 8 Course 清单 → requirements §3.4
- ✅ gap 4 ASSESSMENT_TAG schema → 02-lecture-zone
- ✅ gap 5 置信度 0.6 → 02-lecture-zone
- ✅ gap 6 FEEDBACK_COLLECT schema → 02-lecture-zone
- ✅ gap 7 passive_signals → requirements §8.2
- ✅ gap 8 催学渠道+漏斗 → 03-project-config + 02-notification
- ✅ gap 9 BEI 5 步追问 → 04-inquiry-zone 附录
- 总计 5 个 spec 文件 7 处反向补充章节，~5300 字

### 10 题待讨论议题决议完成（2026-04-27）
见 § 2 表格

### product/ 其他文件清理完成（2026-04-27）

| 动作 | 内容 |
|------|------|
| 直接删 | `feature-flows/` 整目录（占位失效）|
| 归档 | feature-prioritization.md → `4-decisions/历史/spec-archive/feature-prioritization-2026-04-09.md` |
| 归档 | mvp-definition.md → `4-decisions/历史/spec-archive/mvp-definition-2026-04-09.md` |
| 移动 | user-journey.md → `2-business/intake/user-journeys-2026-04-09.md` |
| 抽取 | mvp-definition §6 KPI → `2-business/validation/success-metrics.md`（新建）|
| 反向补充 | feature-tree manifest §8 横切定义映射表 → requirements §8.2.5 |
| 重写 | `1-product/README.md`（移除 v0.3.3 引用，加 spec/feature-tree 双视角说明）|
| 加注 | `feature-tree/README.md` 顶部加"本目录定位"段（feature-tree 与 design/ 正交） |

**关键原则**：feature-tree 整体保留（11 文件），它含 8 项 design/ 完全没有的开发关键信息（跨模块依赖矩阵 / 横切定义 / 待确认 55 项 / 工程集成清单 / Evaluation+Simulation+KGP 模块）。

---

## 10 · 节奏锁定（DM 拍 v0.5.0 一次大版本，本周完成）

按 D-10 决策，本周完成 v0.5.0 全量重写。

### 本周（2026-04-27 起）执行计划

#### Day 1（今天）
- ✅ spec/ 清理（rawIdea + v0.3.3 归档 + 7 项 gap 迁移）
- ✅ 10 题决议
- 🔄 product/ 其他文件清理（Agent 进行中）

#### Day 2-3（基础重写）
- requirements-v0.4.0.md → v0.5.0.md 全量重写
  - 加 § 11 三大底层原则
  - 加 § 12 PM 协作风格
  - 重写 § 3 项目全生命周期（8 阶段 + 服务≤12月/项目≤11月二元模型 + 试运行子阶段）
  - 重写 § 8.2 记忆工程（5 层 + Khanmigo + 不靠 RAG + 防幻觉）
  - 反补 § 4 Soul 按场域 + Teacher Credibility
  - 附录 v0.4.0 → v0.5.0 变更清单
  - 附录 ADR 索引扩展（ADR-011~015）

#### Day 3-4（核心模块）
- common/03-ai-brand 大幅重写
- learner/01-hall（4 库 4 tab）
- learner/03-practice-zone（逃生通道）
- management/01-operation（Ora 看板）
- management/03-project-config（服务/项目周期 + 试运行子阶段 + 变更管理）

#### Day 5（其他模块 + 整理）
- learner 00/02/04/05/06/07
- management 00/02
- common 00/01
- ADR 5 个独立文件
- design/README 更新

#### Day 6（review + audit）
- 概念字典 spec/plan/02-spec-concept-dictionary.md
- 全量 audit + 推翻早期决策的加注

---

**plan 状态**：v1.1 · 10 题决议完成 + 节奏锁定
**下次更新**：Agent product/ gap 报告 + Day 2 v0.5.0 重写启动
