# product/ 清理 · gap 报告（除 spec 外）

**生成日期**：2026-04-26
**作者**：Claude Code（agent 扫描）
**对照基线**：spec/design/ v0.4.0（19 文件 / 5199 行）+ 7 项已迁移反向补充
**扫描范围**：`00-public/1-product/` 下除 `spec/` 之外全部 16 个 md
**结论一句话**：根级 3 个旧 md 全部归档；feature-flows/README 直接删；feature-tree/ 11 文件**整体保留**作为开发对接的功能拆解视角，仅做 1 处反向补充迁移。

---

## 0. 价值分级标准

| 标 | 含义 | 处置 |
|----|------|------|
| **A 必迁** | spec/design 没含且本期开发刚需 | 反向补充到 design/ 对应文件 |
| **B 可选** | spec/design 没含但优先级低 / 可放别处 | 视情况迁；放 02-temp 或 4-decisions/历史 |
| **C 已覆盖** | design/ 已等价覆盖 | 直接归档/删 |
| **D 历史价值** | 是过时快照，但对追溯有用 | 归档到 4-decisions/历史/ 或 spec-archive/ |

---

## 1. 根级 3 个旧 md（feature-prioritization / mvp-definition / user-journey）

### 1.1 公共特征

- 日期：2026-04-09（在 v0.3.3 之前）
- 文件头都已自标 `> **已过时** -- 本文档已被 spec/requirements-v0.3.3.md 完全覆盖`
- 命名仍用"AI 老师"（旧品牌名，已被"睿学/AI TUTOR"取代）
- AI 角色用"AI"泛指，无 Neo/Leo/Ora/Actor 概念
- 数据模型仍是 4 层（Project/Course/Activity/SCO），缺 Segment

### 1.2 feature-prioritization.md（25KB · MoSCoW + Sprint 规划）

**gap 摘要**：

| 节 | 内容 | 与 design 比对 |
|----|------|----------|
| Must Have 11 项（M-01~M-11） | AI 授课/对练/辅导/测评/报告/萃取/自适应 + 运营/Dashboard/报告解读/Harness 报告 | **C 已覆盖** — design v0.4.0 模块清单已重构（学员端 6 + 管理端 4），命名/边界都变了。MoSCoW 优先级 P0/P1/P2/P3 已在 future-iterations.md 中重新定义 |
| Should Have（v1.1）：移动端/企微/L3/增强分析 | 7 月里程碑 | **D 历史价值** — future-iterations.md 第三/四节"V2 近期迭代/中远期"已含，但表述粒度不同 |
| Could Have（H2）：Neo Course/AI 组织培训/批量/高级分析 | 商业线扩展 | **B 可选** — 这部分属于商业规划而非产品设计，spec/design 没有也不应有 |
| Sprint 1-4 规划表 + 工作量估算 | "vibe coding 3-5x 效率"假设 | **D 历史价值** — Sprint 规划已严重过时（实际开发节奏已变），但工作量估算逻辑可参考 |
| 依赖关系图 | 模块依赖 ASCII 图 | **C 已覆盖** — feature-tree/manifest.md §7 跨模块依赖矩阵已含，且更精确 |
| 风险矩阵（5 项 Red/Yellow Flag） | KGP 阻塞 / L2 复杂度 / 11 功能交付 / 企微审核 / Neo 形态未定 | **B 可选** — 部分仍有效（如 KGP 阻塞 / L2 复杂度），但已被 0424-meeting-analysis.md 等迭代讨论覆盖 |

**价值评估**：低。整篇文档基于 v0.3.3 之前的功能命名（AI 授课/AI 测评/Harness 报告等），与 v0.4.0 的"大厅 + 4 场域 + Neo/Ora/Actor"架构对不上。

**迁移建议**：
- 不向 design/ 迁移
- 整文件归档到 `00-public/4-decisions/历史/spec-archive/feature-prioritization-2026-04-09.md`
- 在 `00-public/4-decisions/历史/README.md` 加一行"v0.3.3 前 MoSCoW 与 Sprint 规划，已废弃"

### 1.3 mvp-definition.md（19KB · MVP 假设 + 成功标准）

**gap 摘要**：

| 节 | 内容 | 与 design 比对 |
|----|------|----------|
| H1-H5 五条核心假设 | "AI 原生培训可产 K-L3 行为证据"等 | **B 可选** — 商业层假设，design/ 不该含。但 2-business/ 也没明确收录，可考虑迁到 `2-business/strategy/` |
| Must-Have 学员端 7 项 + 管理端 4 项 | 与 prioritization 重复 | **C 已覆盖** |
| 数据模型 4 层（Project/Course/Activity/SCO） | 缺 Segment | **C 已覆盖** — requirements-v0.4.0 §6 已升级为 5 层 AOM |
| 验收标准（每个功能） | 维度具体 | **C 已覆盖** — design/ 各模块 spec 已含验收 |
| 成功标准 6.1-6.5（启动率/完成率/NPS/HR 满意度等） | 具体数值目标 | **A 必迁部分** — 这 5 类指标 design/ 完全没有，是产品验收/北极星指标的来源。但属"商业指标"非"产品规格"，**建议迁到 `2-business/validation/`**，不入 design/ |
| Out of Scope 8 项 | Neo Course/沙盘/L3/AI 伴学/多主题/按效付费/私有化/第三方 LMS | **C 已覆盖** — future-iterations.md 已含等价信息 |
| 关键依赖与风险 | LLM/L2/KGP/课程内容/对练设计/测评维度 | **C 已覆盖** — feature-tree 各文件待确认节已含 |
| 附录"P0 行为证据闭环" | 简化为 5 个最小可售卖功能集合 | **D 历史价值** — 这是有趣的精简思路，但 v0.4.0 已不按此组织 |

**价值评估**：低。主要价值在第 6 节"成功标准"——这是唯一 design/ 完全没有但仍有效的内容（指标体系与具体数值目标）。

**迁移建议**：
- §6.1-§6.5 成功标准（30+ 条 KPI）→ 迁到 `00-public/2-business/validation/success-metrics.md`（新建文件，非 design/）
- 其余整文件归档到 `00-public/4-decisions/历史/spec-archive/mvp-definition-2026-04-09.md`

### 1.4 user-journey.md（24KB · 三条用户旅程）

**gap 摘要**：

| 节 | 内容 | 与 design 比对 |
|----|------|----------|
| 旅程一：HR/培训经理（发现→评估→采购→启动→监控→报告→倡导） | 客户购买决策路径 | **A 必迁部分** — design/ 的"管理员的一天"场景只覆盖系统内日常使用，**完全没有"发现/评估/采购/内部倡导"4 个系统外阶段**。但这属"商业旅程"而非"产品 spec"，建议迁到 `2-business/intake/customer-journey.md` 而非 design/ |
| 旅程二：学员/员工（任务分配→首次登录→AI 授课→AI 练习→AI 测评→查看结果→应用到工作） | 7 阶段 + 旧流程对比 + 阶段情绪/Drop-off/缓解 | **B 部分覆盖** — design/learner/00-overview.md 的"学员的一天"4 个场景已覆盖"首次登录/日常学习/连续学习/查看报告"4 阶段。但**"任务分配/应用到工作"两阶段及"被替代的旧流程对比"是 design/ 没有的**。仍属"用户体验研究"而非"产品 spec" |
| 旅程三：培训运营人员（项目创建→配置→分配→监控→干预→报告→结项） | 7 阶段 | **B 部分覆盖** — design/management/00-overview.md "管理员的一天"3 个场景覆盖了"巡检/汇报/配置"，但**"干预/结项"阶段及"旧流程对比"未覆盖** |
| 跨旅程关键节点对齐表（T0-T4） | 三角色时间节奏 | **A 必迁** — 这种"跨角色时间线对齐"design/ 完全没有，对开发理解 user story 顺序有用。但同样建议放 `2-business/intake/` |
| Aha Moment（每条旅程 1 个） | 设计目标 | **B 可选** — 是设计哲学层面，design/ 部分隐含但没明确总结 |
| Red/Yellow Flags 7 项 | "学员刷课心态"/"运营 AI 学习曲线被低估"等 | **D 历史价值** — 部分仍有效但已被 demo 验证覆盖 |

**价值评估**：中。三条旅程的"系统外阶段"（采购前 / 任务分配 / 应用到工作）和"旧流程对比"是 design/ 完全缺失的有价值视角。但定位是用户研究/客户旅程，不是产品规格，应放 2-business/。

**迁移建议**：
- 整文件归档到 `00-public/2-business/intake/user-journeys-2026-04-09.md`（连同元数据保留）
- design/learner/00-overview.md 和 design/management/00-overview.md 已含"X 的一天"，本期不重复迁
- 不向 design/ 迁移任何内容

### 1.5 README.md（2KB · 1-product/ 目录说明）

**gap 摘要**：内容只是描述当时（v0.3.3 阶段）的目录结构，已严重过时——里面提到的 ui-ux/、modules/、user-flows/、prototypes/ 子目录现在都不存在，只剩 spec/、feature-tree/、feature-flows/ 三个。

**价值评估**：极低。但作为 1-product/ 入口的 README，**建议改写而非删除**，反映 v0.4.0 当前状态（spec/design 全审阅完成 + feature-tree v0.4.0 对齐 + 原型 v1.1 交付）。

**迁移建议**：**重写**这个 README，让它成为 v0.4.0 当前状态入口；不归档不删。

---

## 2. feature-flows/README.md（2.5KB）

**目录现状**：feature-flows/ 整个目录除了一个 README 外**没有其他文件**。README 描述的 6 个 flow 文件（01-layout-auth-flows.md 等）从未真正放进来——README 自己说"实际文件正在 DM_Temp 审阅中"，但审阅完后 v0.4.0 直接重做了 feature-tree 而没有沿用 flows。

**gap 摘要**：

| 节 | 内容 | 与 design 比对 |
|----|------|----------|
| 文件清单（6 个 flow + debate 修订数） | 占位符 | **C 失效** — flow 文件本身从未存在 |
| 高优先级修订 6 项（SCO 加载失败 / 课前采集退出 / PPT 翻页 / REVIEW 空 / Agent 上下文切换 / 断点恢复时序） | debate 修订总结 | **B 部分覆盖** — design/learner/02-lecture-zone.md 等已含 SCO 加载、课前采集、断点恢复；REVIEW 空、Agent 上下文切换、PPT 翻页三项**可能未明确写入**，但 feature-tree manifest §5 待确认清单已记录这类问题 |
| 新增流程 5 项（学员主动结束对练 / 量表断点 / HR 多项目选择器 / 催学发送预览 / 碎片降级四级兜底） | 流程级修订 | **B 部分覆盖** — 学员主动结束对练在 design/learner/03-practice-zone.md 已含；量表断点在 04-inquiry-zone.md 含；HR 多项目选择器在 design/management 未明确；催学发送预览在 04-message.md 含；碎片降级四级兜底已在 05-report-zone.md 含 |
| 关闭的待确认项 2 项（A1.2.4 KGP 默认 / A5.5 REVIEW 空采用 C） | 决策记录 | **D 历史价值** — 应放 4-decisions/ 而非 feature-flows/ |

**价值评估**：极低。是 v0.3.3 → v0.4.0 过渡期的临时目录占位，所述内容大多已被 design/ 覆盖或在 feature-tree 待确认清单中追踪。

**迁移建议**：
- 整目录 `feature-flows/` **直接删除**
- 关闭决策的 2 条（A1.2.4 / A5.5）若没在 4-decisions/ 留痕，可补一句到 `00-public/4-decisions/历史/closed-questions.md`（可选，影响小）

---

## 3. feature-tree/（12 文件 · ~118KB）

### 3.1 整体定位评估

feature-tree/ 是与 spec/design/ **平行设计**的两套视角：

| 维度 | spec/design/ | feature-tree/ |
|------|------|------|
| **视角** | 用户体验视角（学员的一天/各场域怎么看怎么做） | 功能拆解视角（L1+L2 模块功能点） |
| **粒度** | 交互级 + 文案 + 边界 | 功能点级 + Owner + 优先级 + 待确认 |
| **读者** | PM / 设计 / 用户研究 | PM / SA / Owner / Dev Lead |
| **组织方式** | 大厅 + 4 场域 + 通用 | 10 模块（5 学员端 + 1 管理端 + 4 基础设施/内容/评估/KGP） |
| **包含内容** | 流程文案 / 场景剧本 / 数据展示 | 跨模块依赖矩阵 / ★变更清单 / 待确认清单 / ADR 映射 / 横切定义 |

**关键发现**：feature-tree 不是 design/ 的子集或冗余，而是**正交补充**——它含有 8 项 design/ 完全没有的有价值内容：

1. **跨模块依赖矩阵**（manifest §7）—— 10×10 强弱依赖表，开发对接核心
2. **横切定义映射表**（manifest §8）—— 学习时长 / memory_id / Token 统计 / Rubric / Neo Persona / 推荐卡片 7 个跨模块概念的权威归属
3. **待确认清单**（共 55 项）—— 跨模块 P0 10 项 + 各模块 5-7 项，开发须先解决
4. **★变更清单**（37 项）—— v0.3.3 → v0.4.0 的结构性变更精确记录
5. **ADR 映射表**（manifest §6）—— 7 个 ADR 与具体功能节点的对应
6. **基础设施模块（07-infra）**—— TTS 引擎矩阵 + 文生图 + 数字人 + 模型网关 + 故障保护，design/common 不到一半深度
7. **测试评估模块（09）**—— Evaluation 打标五字段 schema + Simulation 独立 UX 测试 Agent，design/ 无独立模块
8. **KGP 工作台（10）**—— 内容生产侧工具链定义（SIDE 自研标注 / Neo Persona 跨场域定义），design/ 完全无

**结论**：**feature-tree 整体保留**。它对 dev 团队、SA 工程师、跨模块协调、对接 KGP/Infra 团队都是必需的。删除会丢失大量开发对接信息。

### 3.2 逐文件 gap

| 文件 | 价值 | 与 design 关系 | 建议 |
|------|------|----------|------|
| **manifest.md**（24KB） | **高** | design/ 完全无对应物 | **保留** — 跨 10 模块全局索引，无可替代 |
| **README.md**（9KB） | **高** | design/ 仅有目录索引，无依赖拓扑 | **保留** — 模块依赖拓扑图 + 跨模块待确认 |
| **01-hall.md** | 中 | design/learner/01-hall.md（623 行，更详） | **保留** — L1+L2 视角对开发分工有用 |
| **02-lecture.md** | 中 | design/learner/02-lecture-zone.md（547 行） | **保留** — 提供"SCO 锁定/防挂机/双轨运行"等的简洁功能点视角 |
| **03-practice.md** | 中 | design/learner/03-practice-zone.md（371 行） | **保留** — 三角色架构 + 剧本控制元素的功能拆解 |
| **04-inquiry.md** | 中 | design/learner/04-inquiry-zone.md（342 行） | **保留** — Inquiry 是 P3 但仍需对接，含 BEI/STAR 字段 |
| **05-report.md** | 中 | design/learner/05-report-zone.md（230 行） | **保留** — 含 BI 图表 5 类型 + 联动协议 [REF:...]，比 design 更系统 |
| **06-operation.md** | **高** | design/management/01-operation.md（383 行） | **保留** — 含 E4 多渠道配置 / D6 报告工厂 / Z 节本期不做清单，design/ 部分章节较散 |
| **07-infra.md**（12KB） | **极高** | design/common/ 仅 1-general/2-notification 共 282 行 | **保留** — 含 TTS 引擎矩阵（H5a）/ 文生图 / 数字人 / 模型网关 / 故障保护 / P 节外部平台对接清单。**design/common 完全没有这些工程级集成信息**，**这是 dev 团队对接的核心文件** |
| **08-content-mgt.md** | **极高** | design/ 无独立 ContentMgt 模块 | **保留** — design/ 把 ContentMgt 散在 management/03-project-config.md 的内容预览章节，但**完整度远不如此文件**（A 生命周期 / B 校验 / D 运行时切换 / E 查询 API 全无） |
| **09-testing-eval.md** | **极高** | design/ 无 Evaluation/Simulation 独立模块 | **保留** — Evaluation 打标五字段 + 碎片生产规则 / Simulation UX 测试 Agent，**design/ 完全无对应**，开发必读 |
| **10-kgp.md** | **极高** | design/ 无 KGP 模块 | **保留** — KGP 工作台 13 节定义（含 SIDE 自研标注 + Neo Persona 跨场域定义 L 节），design/ 仅在 requirements-v0.4.0.md §2 提了一句"KGP 不是软件端口" |

### 3.3 feature-tree 内部 gap → 反向补充候选

扫描 feature-tree 11 文件，找出 **design/ 没含但 feature-tree 含且本期开发刚需**的内容：

| # | 内容 | 来源 | 目标 design/ 文件 | 优先级 |
|---|------|------|----------|------|
| 1 | TTS 引擎按 zh/en/ja 路由 + 字节/byteplus/Google 矩阵 | 07-infra H5a | design/common/03-ai-brand.md 或新建 03-engines.md | A |
| 2 | 文生图 Doubao-Seedream + Gemini 路由 | 07-infra H9/H10 | 同上 | A |
| 3 | 数字人 ProsonaAgent 接入（digital_human_server.py） | 07-infra H11/H12 | 同上 | B |
| 4 | 云学堂多模型网关 ymcas-d.yxt.com/multi-model/v1 + 故障保护 model_groups.default_group + 5 分钟窗口 | 07-infra I1/I4 | design/common/ | A |
| 5 | Token 统计以网关 usage metrics 为准（非本地推算） | 07-infra J1 | design/common/ + management/03-project-config.md Token 节 | B |
| 6 | 多渠道配置 E4（企微/钉钉/短信 OAuth + 优先级降级） | 06-operation E4 | design/management/04-message.md | B |
| 7 | 账号创建后通知链 B5（5 个子项：Email 必做/重试/状态回执/链接时效） | 07-infra B5 | design/management/03-project-config.md 学员导入节 | A |
| 8 | Evaluation 打标五字段 schema（A4.1-A4.5） | 09-testing-eval A4 | requirements-v0.4.0.md §8.3 自适应体系 反向补充 | A（已部分含 ASSESSMENT_TAG schema 但字段细节缺） |
| 9 | Simulation 独立 UX Agent 整模块 | 09-testing-eval I-P | 新建 design/dev-tooling/simulation-agent.md（独立目录）| B（dev 工具，不是产品 spec） |
| 10 | KGP 工作台整模块 + Neo Persona L 节 | 10-kgp A-L | 同上，新建 design/dev-tooling/kgp-workbench.md | B |
| 11 | 推荐卡片流向管道（产生→DB→展示→收藏） | 07-infra N6 | design/learner/06-notes.md | B |
| 12 | Activity 导航规范（K8） | 07-infra K8 | design/learner/00-overview.md 反向补充 | B |
| 13 | 横切定义映射表（学习时长/memory_id/Token/Rubric/Persona/推荐卡片 7 项） | manifest §8 | requirements-v0.4.0.md 新增反向补充章节 | **A** — 是 design/ 完全没有但极其重要的"全局规范" |

**关键判断**：item #1-#7 是工程集成类（外部供应商/路由/通知链），item #8-#10 是模块级补充，item #11-#13 是横切规范。**真正必迁的是 item #13"横切定义映射表"，其他都属于工程对接细节，可以让 feature-tree 自己承担**。

---

## 4. 信息合并方案

### 4.1 必迁项（A 类，3 项）

| # | 内容 | 来源 | 目标 |
|---|------|------|------|
| A1 | mvp-definition.md §6 成功标准 5 类 KPI | 根级旧文档 | `00-public/2-business/validation/success-metrics.md`（新建） |
| A2 | feature-tree manifest §8 横切定义映射表 | feature-tree | `spec/design/requirements-v0.4.0.md` §8 末尾新增"反向补充：横切定义权威归属" |
| A3 | user-journey.md 三条旅程 | 根级旧文档 | `00-public/2-business/intake/user-journeys-2026-04-09.md`（新建/移动） |

### 4.2 可选迁项（B 类，4 项）

| # | 内容 | 来源 | 目标 | 决策 |
|---|------|------|------|------|
| B1 | TTS/文生图/数字人/模型网关 工程集成清单 | feature-tree 07-infra H/I/P | design/common/ 新建 03-engines.md 或反向补充到现有文件 | 延后，feature-tree 已含足够信息 |
| B2 | 多渠道配置 E4 | feature-tree 06-operation | design/management/04-message.md 反向补充 | 延后到本期 P1 落地时再补 |
| B3 | 账号创建通知链 B5 | feature-tree 07-infra | design/management/03-project-config.md 学员导入节反向补充 | 延后到开营流程开发时补 |
| B4 | Simulation + KGP 工作台 | feature-tree 09/10 | 新建 design/dev-tooling/ 子目录 | 延后到 dev 阶段，不阻塞产品 spec |

### 4.3 不迁项（C/D 类）

| 类型 | 处理 |
|------|------|
| C 类（已覆盖）：feature-prioritization 全部 / mvp-definition 大部分 / user-journey 部分阶段 | 归档到 `00-public/4-decisions/历史/spec-archive/` |
| D 类（历史价值）：Sprint 规划 / 风险矩阵 / Aha Moment | 随主文件一起归档，不单独抽取 |
| 失效（feature-flows/README）| 直接删 |

---

## 5. 总结：处置方案

### 5.1 直接删（1 个）

- `feature-flows/` 整目录（含 README.md）—— 占位失效

### 5.2 归档到 `00-public/4-decisions/历史/spec-archive/`（3 个）

- `feature-prioritization.md` → `历史/spec-archive/feature-prioritization-2026-04-09.md`
- `mvp-definition.md` → `历史/spec-archive/mvp-definition-2026-04-09.md`
- `1-product/README.md` → 无需归档，**重写**为 v0.4.0 当前状态

### 5.3 移动到 `00-public/2-business/`（1 个）

- `user-journey.md` → `2-business/intake/user-journeys-2026-04-09.md`（保留为客户旅程历史快照）

### 5.4 抽取后归档（1 项）

- `mvp-definition.md` §6 成功标准 → 抽到 `2-business/validation/success-metrics.md`（新建），主文件整体归档

### 5.5 反向补充到 design/（1 项）

- feature-tree manifest §8 横切定义映射表 → `spec/design/requirements-v0.4.0.md` 反向补充章节（如 §8 末尾新增"§8.8 横切定义权威归属表"）

### 5.6 整体保留（feature-tree/ 11 文件）

不做任何迁移、删除、归档动作。在 feature-tree/README.md 顶部增加一段说明：

> **本目录定位**：与 spec/design/（用户体验视角）正交的功能拆解视角。读者：PM/SA/Owner/Dev Lead。**不会被 design/ 取代**——design/ 描述"怎么用"，feature-tree 描述"开发要做哪些功能点 + 跨模块依赖 + 待确认问题 + ADR 映射"。

### 5.7 重写

- `00-public/1-product/README.md` —— 反映 v0.4.0 当前状态（spec/design v0.4.0 全审阅完成 + feature-tree 对齐 + demo v1.1 交付 + feature-flows 已废）

---

## 6. 工作量估算

| 任务 | 预估 |
|------|------|
| 删 feature-flows/ | 1 min |
| 归档 3 个根级旧 md 到 spec-archive/ | 5 min |
| 移动 user-journey.md 到 2-business/intake/ | 2 min |
| 抽取 mvp-definition §6 → 2-business/validation/success-metrics.md | 15 min（精简整理 KPI 表） |
| 反向补充横切定义到 requirements-v0.4.0.md | 10 min（直接复制 manifest §8） |
| 重写 1-product/README.md | 15 min |
| 给 feature-tree/README.md 加定位说明 | 5 min |
| 验证（git status / 检查链接） | 10 min |
| **总计** | **~60 min** |

---

## 7. 风险与注意

1. **feature-tree 不要误删**：它含 8 项 design/ 完全没有的开发关键信息（依赖矩阵 / 横切映射 / 待确认 55 项 / 工程集成清单 / Evaluation/Simulation/KGP 模块）。这次清理的本质是**清理根级 3 个 v0.3.3 之前的旧 md** 和 feature-flows/ 占位目录，而不是清理 feature-tree。

2. **mvp-definition §6 成功标准** 是隐藏价值——这些 KPI 不是过时的"功能定义"，是"如何衡量 v1 成功"，本期开发完成后做客户验收就要用，不要随主文件一起归档进废纸篓，要抽出来。

3. **user-journey 三条旅程** 同理，"系统外阶段"（采购前 / 任务分配 / 应用到工作）和"旧流程对比"对销售/客户成功团队仍有用，归到 2-business/intake/ 而非删除。

4. **重写 1-product/README.md 必做**：现状 README 描述的目录结构（ui-ux/、modules/、prototypes/）已不存在，新人/AI 进来读会被误导。

5. **横切定义映射表迁移路径**：建议反向补充到 requirements-v0.4.0.md 而非 manifest——因为 requirements-v0.4.0.md 是 spec 的"入口总纲"，design/ 各文件首尾都引用它。manifest 仍保留作为 feature-tree 内部索引。

---

## 附录：快速检查清单（执行前过一遍）

- [ ] 确认 4-decisions/历史/ 目录已存在（gitStatus 显示存在 `历史` 和 `底层建设期-2026-04-26`）
- [ ] 确认 4-decisions/历史/spec-archive/ 子目录是否需要新建
- [ ] 确认 2-business/intake/ 和 2-business/validation/ 是否已有同类文件（避免命名冲突）
- [ ] 确认 feature-tree manifest §8 横切表完整可复制
- [ ] git mv（保留 history）vs 普通移动 + 新增（视团队偏好）

---

*报告完。任何处置动作仍需用户确认后再执行。*
