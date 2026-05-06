---
purpose: T1.2 4 份报告合并 + 给 DM 拍板的决议草稿
status: 待 DM 决议
based-on: agent-A/B/C/D-*.md + glossary.md (2026-05-05)
created: 2026-05-06
---

# T1.2 术语决议草稿 · 2026-05-06

> 本文档由 4 个并行扫描 Agent (A/B/C/D) 报告合并而成。覆盖 spec 17 文件 / 共 ~7149 行。
> 合并方法：去重 → 按 14 节归类 → 按"产品视角 + Neo 第一性原理"打 P1/P2/P3 优先级。

---

## 0 · 总览数字

| 项 | 数量 | 备注 |
|---|---|---|
| **新增（去重后）** | **162** | P1 = 38 / P2 = 71 / P3 = 53 |
| **真废止** | **0** | 各 Agent 报告的"废止候选"经交叉验证均为 scope 误判（未扫到 ≠ 不存在），实际 0 个真废止 |
| **校准** | **27** | 跨 Agent 合并去重 + 4 类表述差异 |
| **残留 fix（高优先级）** | **2** | 02-home:366 "考研→考核" / 04-program-config:213 "4 学习场域→3 学习场域+大厅" |
| **spec bug + 不确定项** | **11** | 给 PM 关注 / 建议 T1.4 修复期一并处理 |
| **第 6 节关键议题** | **8** | DM 不拍板就不能进 T1.3 的核心争议 |

---

## 1 · 新增（按 glossary 14 节归类 + 优先级）

### 1.1 节归属：§ 1 产品命名（2 项）

| 术语 | 出现位置（合并） | 建议表述 | 优先级 |
|---|---|---|---|
| AI-Native 培训交付平台 | A: 01-vision:17,27 / 03-roles-and-ports:56 | "睿学 = 面向企业培训的 AI-Native 学习陪伴平台" / 与"学习陪伴平台"等价 | P1 |
| powered by NeoLearning | B: 02-learning:138 / 08-platform:68 | 品牌声明 / 至少在登录页保留 | P2 |

### 1.2 节归属：§ 2 AI 角色（5 项）

| 术语 | 出现位置（合并） | 建议表述 | 优先级 |
|---|---|---|---|
| 1v1 老师 AI 孪生 | A: 01-vision:19,27 / 01-personas:24,81 / 02-methodology:16 | "Neo = 1v1 线下授课老师的 AI 孪生" / 第一性原理表述 | P1 |
| 三角色协作 | A: 04-data-model:188 / C: 04-practice:34,94 | practice 演练中 Director + Actor + Neo 三方协作 | P1 |
| 场外 Coach（Neo 在 practice 角色定位）| C: 04-practice:14,42 | Neo 在 practice 不进入剧本，只在右栏旁路辅导 | P1 |
| Director / Actor 详细职责（已 inline 但需补充指引）| A: 04-data-model:186 / C: 04-practice § 9.3.2.2 | glossary 现表述简略，建议补 "详见 § 9.3.2.2.1" 指引 | P2 |
| Neo 不能做 5 条 | A: 04-data-model:188 / C: 04-practice:84 | practice 全场域 Neo 行为约束清单 | P2 |

### 1.3 节归属：§ 3 端口与角色（4 项）

| 术语 | 出现位置（合并） | 建议表述 | 优先级 |
|---|---|---|---|
| 三类账号（admin / 管理员 / 学员）+ 同一套用户表 + 多角色加载 | B: 07-user-global:23,25,48 | 账号体系模型 / 一个 user 可同时持学员+管理员角色 | P1 |
| 端口架构（3 个端口 + 视角） | A: 03-roles-and-ports:13,22 | 端口视角 vs 角色视角 | P2 |
| 角色↔端口映射 | A: 03-roles-and-ports:39 | 学员→学员端 / HR+项目运营→管理端共用 / 产品运营→产品运营端 | P2 |
| 跨端关系 | A: 03-roles-and-ports:69 | 学员端↔管理端 / 管理端↔产品运营端 | P3 |

### 1.4 节归属：§ 4 学员端场域（10 项）

| 术语 | 出现位置（合并） | 建议表述 | 优先级 |
|---|---|---|---|
| 中枢层 / 学习核心层 | A: 01-personas:106 / C: 01-overview:55-56 / 02-hub:12,21 / 06-cross-context:12 | 大厅 = 中枢层 / 3 学习场域 = 学习核心层 | P1 |
| 学员端 = 大厅 + 3 学习场域（统一口径补 Hall/Lecture/Practice/Recap 英文） | A: 03-roles-and-ports:85-88 / 02-methodology:357-359 | 中英对照：大厅 Hall / 授课 Lecture / 对练 Practice / 小结 Recap | P1 |
| 跨场域机制 | C: 01-overview:57 / 06-cross-context:115 | 笔记悬浮球 + 4 库 + Neo 跨场域记忆三件套 | P1 |
| 三场域统一框架 / 三场域差异化 / 三场域共享设计 | C: 06-cross-context:20,24,32,83 | lecture/practice/recap = AOM Activity 容器 / 主任务差异 / 4 项共享 / 7 项约束 | P1 |
| 大厅辅导 + 督学 + 课程推荐（Neo 大厅 3 角色）| A: 03-roles-and-ports:85 / C: 02-hub:81-89 | 角色优先级：辅导 > 课程推荐 > 督学 | P1 |
| 应用咨询 | A: 02-methodology:250 / 03-roles-and-ports:85 | 大厅辅导子类（讲授+解惑） | P2 |
| 小结 = recap 中文名 ★ | B: 02-learning:30,34 / 03-completion:18,47 | 小结 Activity = recap Activity 中文叫法 | P1 |
| 5 场域 × 5 卡片矩阵的"5 场域"含义 ★ | C: 06-cross-context:158 | 见第 6 节关键议题 1 | P1 |
| 学员旅程图 | C: 01-overview:25 | 完整学习项目周期图（中枢+学习核心+跨场域机制全景）| P3 |
| 类型 3 zone（lecture/practice/recap）| C: 02-hub:278 | Activity 类型 3 zone | P3 |

### 1.5 节归属：§ 5 数据模型与内容（21 项）

| 术语 | 出现位置（合并） | 建议表述 | 优先级 |
|---|---|---|---|
| **9 类 SCO 完整清单**（SLICE / VIDEO / QUIZ / FEEDBACK_COLLECT / FEEDBACK_REVIEW / PRACTICE_INTRO / PRACTICE_DRILL / PRACTICE_REVIEW / PRACTICE_REPORT / RECAP_DIALOGUE）★ | A: 04-data-model:120-129 / C: 03-lecture:118 / 04-practice 多处 / 05-recap | glossary 现仅 4 类 / 必须补全 | **P1 ★** |
| FEEDBACK_COLLECT / FEEDBACK_REVIEW 双头配对 + memory_id 串联 | A: 04-data-model:124 / 01-personas:184,311,335 / C: 03-lecture:118-120 / 06-cross-context:129 | collect ↔ review 双头配对约束 / memory_id 跨场域引用 | P1 |
| AOM 模板 / AOM 学习实例 双层文件命名 | A: 04-data-model:48-49 | 双重用途 / 两套独立文件 | P1 |
| 试用版 AOM / 试用 Course Pack | B: 01-pre-learning:114,124 | 试运行阶段使用 / KGP 提供专门版本 | P2 |
| 关联 Activity / 关联范围 | A: 04-data-model:194,197 / C: 05-recap:46-47,103,194,337 | recap 数据来源范围 / KGP 配置 | P1 |
| 演绎指导 / 教学目的 / 辅导知识库 / 各层级知识内容 | A: 01-personas:326,336 | Neo / Ora 上下文范围 4 类 | P2 |
| 学员标签 / separateTag / 隐性打标 / 多版本切换 | A: 04-data-model:225,242 / C: 03-lecture:192,194,202 / 04-practice:479 | 自适应 L2 机制 / 同 SCO 挂多 asset 版本 | P2 |
| passCondition / passConditions / solution 字段 | A: 04-data-model:164 / C: 03-lecture:163,165,347 | Quiz 通关条件 + KGP 引导话术 | P2 |
| competencyGoals / skill_ladders（L1-L5）| A: 04-data-model:182 / C: 04-practice:145,576,599 | practice 报告评分维度 + 阶梯 | P1 |
| 必问点 / 必问点机制 | A: 04-data-model:181 / C: 04-practice:504 | KGP 标定的复盘关键点位 | P2 |
| 软化点 / 底线 / 情绪天花板 / 触发条件 | A: 04-data-model:180 / C: 04-practice:43,143 | Actor 演绎逻辑 4 要素 | P2 |
| opening_speaker | C: 04-practice:326 | 剧本字段（开场说话方）| P3 |
| 剧本 / 对练剧本 / 剧本驱动 | C: 04-practice:42,54,143 等 | KGP 在 AOM 中预定 | P1 |
| 角色互换 / 基础 Roleplay / 费曼（变体）| C: 04-practice:473-475,833 | 对练形态变体 | P2 |
| Prosona 演绎架构 | C: 03-lecture:216 | 切换机制 / 打标具体实现 | P2 |
| AOM 前端演示事件 | C: 03-lecture:218 | 课件区演示规则 | P3 |
| 学员视角的 AOM 演绎 | C: 06-cross-context:126 | AOM 内容包对学员"不可见" | P2 |
| 闭环反馈 / 闭环采集 | C: 03-lecture:14,393 / 06-cross-context:35 | FEEDBACK 双头配对约束 | P2 |
| 数据反馈循环 | A: 04-data-model:65 | "AOM 学习实例 → KGP → 优化下一版 AOM 模板" | P3 |
| 知识点 / 关键概念图 / 学员画像假设 / 教练背景知识 | A: 04-data-model:55-57,109 | AOM 模板字段 | P3 |
| AOM 学习实例 phase 标记 | B: 03-completion:107 | 标识结营后的新记录 | P3 |

### 1.6 节归属：§ 6 教学方法论（9 项）

| 术语 | 出现位置（合并） | 建议表述 | 优先级 |
|---|---|---|---|
| 5 大理论底座具体英文（CLT / ZPD / Bloom / Dreyfus）| A: 02-methodology:30-34 | glossary 已列 5 大底座 / 此处补全名 | P2 |
| Bloom 6 层（Remember/Understand/Apply/Analyze/Evaluate/Create）| A: 02-methodology:32 | Bloom 认知层级具体 6 层 | P2 |
| Dreyfus 5 级（新手/高级新手/胜任/熟练/专家）| A: 02-methodology:33 | Dreyfus 5 级胜任 | P2 |
| Mastery Learning / Deliberate Practice / Mezirow 转化学习 / Greif 结果导向 / Schein 流程咨询 / 复杂反映 | A: 02-methodology:248,294,310,325,339,280 | 7 动作各自方法论背书 / 建议 § 6 仅列顶层 5 大底座 + 引用 § 2.4 | P3 |
| Teacher Credibility（Hattie d=0.90） / Wang 2023 g=0.73 | A: 01-personas:96 / 02-methodology:310 | 量化效应量 | P3 |
| 不剧透原则 / 不主动给答案 / 仅给方向 | C: 03-lecture:383 / 06-cross-context:87,88 | § 2.7 引用 | P1 |
| 主动触发原则（Neo）| A: 01-personas:114 | "Neo 所有主动行为均有明确信号触发" | P1 |
| 被动响应原则（Ora）| A: 01-personas:176 | "Ora 不主动调度 / 不自动联系学员" | P1 |
| 情绪优先原则 | A: 02-methodology:62 | 强负面情绪时切换情绪支持模式 | P2 |

### 1.7 节归属：§ 7 感知与画像（17 项）

| 术语 | 出现位置（合并） | 建议表述 | 优先级 |
|---|---|---|---|
| AgentContext / Session Store / Profile（三级记忆英文层名）| A: 01-personas:207-209 | 短期/中期/长期对应英文 | P1 |
| memory_id | A: 01-personas:184,311,335 / 04-data-model:124 / C: 06-cross-context:129 / D: 02-home:116,400,408 | 跨场域引用与可追溯标识 / Ora 钻取证据带 memory_id 链接 | P1 |
| 渐进画像 | A: 01-personas:199,222 | "Neo 越用越懂学员" | P1 |
| 跨课程记忆 / 跨课程引用 / 跨场域记忆 / 跨场域召回 | C: 02-hub:140,147 / 06-cross-context:38,120-122 | Neo 跨场域同身份连续性 | P1 |
| 反幻觉机制 / 实诚拒答 | C: 02-hub:152 / 03-lecture:263 / 06-cross-context:123 | 找不到证据时的处理 | P1 |
| 6 维聚合机制（双向变化 / 无时间衰减 / prompt 锚点 / 6 维差异化阈值）| A: 02-methodology:127-132 | 6 维聚合规则 | P2 |
| 4 维感知子维度（情绪 10 状态 / 认知负荷 3 类 / 参与度 3 态 / Dreyfus+mastery）| A: 02-methodology:58-61 | 子维度详见 § 2.3.1 | P2 |
| 6 维画像 6 维具体名（思考与反思 / 学习投入 / 场景讨论 / 表达开放 / 挑战接纳 / 学习自驱 意愿）| A: 02-methodology:103-110 | 6 维具体清单 | P2 |
| 8 信号细分（5 教学+3 教练）| A: 02-methodology:67-85 | 5 教学（缺概念/忘了/用错/选错工具/错误心智模型）+ 3 教练（知行差距/元认知偏差/语境错配） | P2 |
| 感知图谱 / 6 维意愿度 | C: 02-hub:128,243,247,330 | Neo 大厅辅导长期态画像呈现 | P2 |
| 互动行为画像 / 6 维当前快照 / 变化点 / 触发证据 | C: 05-recap:144,159,161,168,174,165 | 报告中 6 维画像呈现细节 | P2 |
| BEI 完整度 | A: 02-methodology:121 | 6 维数据来源（表达开放）| P3 |
| 6 维 5 等级标志性表现 / prompt 锚点 | A: 02-methodology:154-217 | 30 个典型话语 + 行为示例 | P3 |
| 公司画像 | A: 01-personas:324,334,358 / B: 01-pre-learning:95,206 / D: 04-program-config:85,91 | program config 字段 / Coming Soon 占位 / V0.6.0+ | P2 |
| 主动追问数 vs 被动应答比 / 经验洞察捕捉 / 行为代理 | A: 02-methodology:60,120,123 | 6 维数据采集机制 | P3 |
| 数据连续性 / Neo Chat 上下文跨场域规则 | C: 06-cross-context:54,58,67 | 短期/长期记忆区分 | P2 |
| 贝叶斯 Beta 分布 | A: 02-methodology:61 | 学习状态读取实现 / 可酌情 | P3 |

### 1.8 节归属：§ 8 卡片与产出（13 项）

| 术语 | 出现位置（合并） | 建议表述 | 优先级 |
|---|---|---|---|
| **4 库（我的报告 / 我的高光 / 我的工具 / 我的笔记）★** | A: 01-personas:328,338 / B: 02-learning:31-34 / C: 02-hub:349-390 | 学员个人学习成果汇集结构 / 注：A 报旧表述"我的笔记/高光/工具/成果"与最新 B+C 表述"我的报告/高光/工具/笔记"不一致 — 见关键议题 4 | **P1 ★** |
| 工具卡片 | C: 02-hub:355,385 | 4 库 - 我的工具 库内单元 / AOM 预设 | P1 |
| 5 类卡片产品形态 / 5 卡片矩阵 | C: 06-cross-context:147,158 | § 9.4.4 Truth Source | P1 |
| 主场推送 / 辅助推送 / 不推送（★/✓/—）| C: 06-cross-context:165 / 02-hub:158 | 5 卡片矩阵符号 | P1 |
| 形态统一 / 落地区统一 / 不重复推送 / 不强迫动作 | C: 06-cross-context:179 | 5 卡片跨场域统一约束 | P2 |
| 高光时刻 / 高光库子集 / 卡点 / 透明性对齐 | C: 04-practice:574,577 / 05-recap:99,191,202,212 | 已在 glossary § 8 / spec 用法补齐 | P2 |
| 应用计划 | C: 05-recap:14,32,69 | recap 1-3 条行动建议入大厅待办 | P1 |
| 学员手动产出（笔记）| C: 06-cross-context:184 | 笔记不是 Neo 卡片产出 | P2 |
| Activity 高光库 | D: 02-home:264-278 | 管理端二级面板 / Activity 下所有学员高光卡集合 | P1 |
| 中窗笔记面板 / 1 篇活跃笔记 / 已归档 vs 未归档 / 自动元数据 | C: 02-hub:436,444,449,463-465 | 笔记悬浮球详情 | P2 |
| 全部 PDF 导出 | C: 02-hub:399 | 我的笔记导出 | P3 |
| 高光与待办的跨场域闭环 | C: 06-cross-context:77 | 各场域产出 → 大厅汇集 | P2 |
| 数据交付分层 / 学员 4 库下载 | B: 08-platform:150 / C: 04-practice:666,731 / 06-cross-context | § 8.4 引用 / 可下载 vs 不可下载 | P2 |

### 1.9 节归属：§ 9 生命周期与周期（17 项）

| 术语 | 出现位置（合并） | 建议表述 | 优先级 |
|---|---|---|---|
| 二元锁定（服务周期 vs 项目周期）| B: 01-pre-learning:27 | "6.1.1 服务周期 vs 项目周期" | P1 |
| 试运行体验 / 客户意愿确认+签单（阶段 2/3 完整名）| B: 01-pre-learning:48-49,69 | glossary 用简写"试运行/签单" / 建议补全名 | P1 |
| 阶段里程碑 / 自定义里程碑（2 类划分）| B: 02-learning:71-74 / D: 04-program-config:147-149 | 阶段（结营必选+中期可选）+ 自定义（上限 10）| P1 |
| 关联内容进度 | D: 04-program-config:151-156 | 自定义里程碑专属配置 | P2 |
| 阶段性评估机制 | B: 02-learning:67 | 中期反馈 / 半程 review | P2 |
| 服务到期前 1 个月提醒 | B: 03-completion:89 / 08-platform:141,161 | 自动通知 admin / HR | P2 |
| 数据交付包 / 数据交付策略 | B: 03-completion:55,75,116,138,141,156 | 归档阶段产物 | P2 |
| 客户在管理端生成的产物 vs 原始学习记录 | B: 03-completion:147,150 | 数据交付分类 | P2 |
| 试用 SKU vs 正式 SKU / SKU 申请下发 | A: 03-roles-and-ports:134-138,150 / B: 01-pre-learning:116,160 | 产品运营动作 1 / 服务实例开通 | P2 |
| isPilot=true | B: 01-pre-learning:123 | 项目实例标记 / 数据隔离 / 计费区分 | P3 |
| 服务周期内不清理 / 归档永久原始保留 | B: 08-platform:159-162 | 数据保留策略 | P2 |
| 项目隔离（数据生命周期）| B: 08-platform:159 | 每项目独立数据包 | P2 |
| 渐进归档 | C: 01-overview:42 | 剩余服务期到归档过渡 | P3 |
| 项目周期内 / 剩余服务期（数据持久化分期）| C: 06-cross-context:135 / 02-hub:404 | 数据持久化分期口径 | P2 |
| 成果汇报会 | B: 03-completion:13,37 / C: 01-overview:40 | 阶段 6 线下产出 | P2 |
| 确认开营按钮 | D: 04-program-config:55-62 | Config 主页底部 / 双态切换触发器 | P2 |
| Activity 完成事件（已 in glossary 但需精化）| C: 05-recap:59 / D: 03-report-center:54 | "完整态首次 + 完整 Walk-through 走完时一次性触发"——见校准节 | P1 |

### 1.10 节归属：§ 10 报告体系（17 项）

| 术语 | 出现位置（合并） | 建议表述 | 优先级 |
|---|---|---|---|
| Course 个人报告 5 块结构（① 内容锚点 / ② 走过的轨迹 / ③ 6 维画像 / ④ 关键证据 / ⑤ 待办任务）| A: 04-data-model:202 / C: 05-recap:89,92-100,123,140,157,188,217 | 完成事件层 5 块 / Truth Source § 9.3.3.2 | **P1 ★** |
| 报告 2 层结构（完成事件层 + 自由复习层）| C: 05-recap:14,85,88-90,253 | recap 报告分层 | P1 |
| 完成事件层 / 自由复习层 | C: 05-recap:14,88,90,253 | 永久保留 vs 覆盖式更新 | P1 |
| 知识层面回顾 / 表现层面回顾 / 下一步建议（recap 三重价值）| C: 05-recap:14,31 | 5 块归类 | P1 |
| 报告增量更新 | C: 05-recap:51,65 | 关联 Activity 完成驱动 | P2 |
| 报告头部 / 关联范围徽章 / 部分态徽章 | C: 05-recap:407,408,418 | 报告呈现 UI | P2 |
| 互动行为对比柱图（图 1）/ 6 维画像图（图 2）| C: 05-recap:111,113 | 报告标准图 | P3 |
| competency 评分（≠ 6 维画像）★ | C: 04-practice:577,599,600,740 / 05-recap:99 | practice 单 Activity 评分 / 严格区别于 6 维长期画像 | P1 |
| practice 报告（report markdown）/ 能力评分 / 提升建议 / 异步分段生成 | C: 04-practice:572,574-578,580,614 | practice 报告内容结构 | P1 |
| 团队结项报告 | B: 03-completion:13,15,28,29,75 | 阶段 6 核心产出 / team report 在阶段 6 的具体产物 | P1 |
| 综合报告模板 | B: 03-completion:31 | "综合报告"+"模板"后缀 | P1 |
| Tab 1 管理员报告 / Tab 2 学员报告 | D: 03-report-center:25-26,66,206 | 报告库 2 Tab 划分 | P1 |
| 学员个人报告库 | D: 02-home:215 / 03-report-center:233-242 | Home 个体详情面板内 / 学员所有 recap+对练报告 | P1 |
| 跨 Tab 引用机制 / 按需摘取 | D: 03-report-center:136-148 | Tab 1 引用 Tab 2 / 来源标注 | P2 |
| 综合报告 5 块结构（项目总体表现 / 学员分布与动态 / 内容推进情况 / 6 维画像聚合 / 关键发现与建议）| D: 03-report-center:152-163 | "综合报告"骨架 5 块 | P1 |
| 报告类型 4 类（结项 / 中期 / 半程 / 自定义）| B: 03-completion:148 | team report 类型 | P2 |
| 报告体系矩阵汇总表 | C: § 5.4 备注 | 学员侧 + 管理端"报告"概念矩阵 / 见关键议题 6 | P1 |

### 1.11 节归属：§ 11 UI / 交互术语（30 项）

| 术语 | 出现位置（合并） | 建议表述 | 优先级 |
|---|---|---|---|
| 全幅课件区 / 课件区 / 三区视觉 / 覆盖式抽屉 / Project 目录（Tab1）/ Activity 目录（Tab2）| C: 03-lecture:42-44,72-73 多处 | 学员端统一布局 5 元素 | P1 |
| Neo Chat / 右侧 Neo Chat | C: 03-lecture:44 多处 | 学员端右侧固定区 | P1 |
| 大厅 3 个顶层模块（Neo 辅导 / 看板 / 笔记悬浮球）| C: 02-hub:36-44 | 大厅一级结构 | P1 |
| 看板 4 区域（项目总览区 / 内容目录区 / 学习成果区 / 社区窗口）| C: 02-hub:41-44,194,204-407 | 看板二级结构 | P1 |
| 项目总览区 5 大组件（热力图 / 项目时间轴 / 数据卡片 3 张 / 感知图谱呈现位 / 待办清单）| C: 02-hub:213-251 | 项目总览区组件清单 | P1 |
| 数据卡片 3 张（进度卡 / 学习足迹卡 / 学习收获卡）| C: 02-hub:232-239 | 看板组件细分 | P2 |
| 热力图 / streak | C: 02-hub:217,221,238 | 学习时长+token / 连续学习 | P2 |
| 项目健康度看板 / 3 圈嵌套热力图 | D: 02-home:23,115-125 | 管理端首页核心 widget | P1 |
| 看板区 / Ora 区（管理端首页 2 顶层模块）| D: 02-home:14,18-28 | 管理端首页 = 看板区 + Ora 区 | P1 |
| 3 维度（项目 / 人员 / 内容）| D: 02-home:24-28,51 / B: 02-learning:43 | 看板区 widget 维度划分 | P1 |
| Ora 看板管理（被动 · 静态查看）vs Ora 问答式管理（主动 · 即时响应）| B: 02-learning:42,48 | A/B 两种协同方式 | P1 |
| 三栏布局（演练阶段）vs 两栏布局 | C: 04-practice:157-159,362 | practice 演练例外布局 | P1 |
| Actor 信息区 / Actor 对话区 / 主线对话 | C: 04-practice:206,373,374,46,122 | 演练阶段 UI | P1 |
| 铺满图（Actor）/ 中性底图 + 表情覆盖层 | C: 04-practice:392,403,845 | Actor 视觉形态 | P2 |
| 双独立输入框 / 双输入 | C: 04-practice:399,428 | 中栏对 Actor + 右栏对 Neo | P1 |
| 旁路答疑 / 旁路辅导 | C: 04-practice:14,67 | Neo 在右栏不打断主线 | P1 |
| 「重新演练 ▾」按钮 / 演练 N · {状态点} 下拉项格式 | C: 04-practice:172,178,180,181,687 | Subbar 按钮 + 历史下拉 | P2 |
| 完成 Modal | C: 03-lecture:432 / 04-practice:765 / 05-recap:768 | Activity 完成弹窗 3 选项 | P2 |
| 6 类图表（柱状/折线/表格/堆叠柱状/饼图/散点图）| D: 03-report-center:20,28,283-294 | 报告 ChatBI 图表组件 | P1 |
| 双触发（chat 直接 / 编辑器按钮多轮确认）| D: 03-report-center:30,303-330 | ChatBI 图表生成两种路径 | P2 |
| 3 种协同编辑（直接输入 / vibe 写作 / 划词修改）| D: 03-report-center:31,332-365 | Report Ora 编辑器 | P1 |
| vibe 写作 | D: 03-report-center:31,344-353,401 | 描述意图 → Ora 生成整段（小写 vibe）| P2 |
| 划词修改 / 扩写 / 缩写 | D: 03-report-center:357-365 | 选中文字弹菜单 | P2 |
| 进度态 chip（领先 / 跟上 / 落后）| D: 02-home:140,154-177 | 计算公式 M × 阈值 | P1 |
| 登录状态（活跃 / 风险 / 沉默 · 3 chip）| D: 02-home:107-110 | 沿用 0.4.0 | P1 |
| 平台 Logo / 欢迎语 / 项目名称 / Neo 名字 / Ora 名字（平台个性化字段）| B: 02-learning:132 / D: 04-program-config:206-228 | 学习期可改项 | P2 |
| Neo 形象偏好（数字人 gif + TTS 音色 + AI 语速 + 主题切换）| B: 07-user-global:108,121-126,134,231 | 个人偏好字段 | P2 |
| 抽屉锚点跳转 / 报告 5 块骨架 | C: 05-recap:393,749 | recap 抽屉 Tab1 内容 | P2 |
| 学员手册 / 管理员手册 / 反馈点赞·点踩 | B: 07-user-global:246,258 | 帮助页面分类 / XUI 反馈复用 | P3 |
| 进度计数 / 学习计时器 | C: 04-practice:202,204 / 03-lecture:99 | Topbar/Subbar 累计 | P3 |

### 1.12 节归属：§ 12 Persona / Soul（10 项）

| 术语 | 出现位置（合并） | 建议表述 | 优先级 |
|---|---|---|---|
| Soul 调整（产品运营动作）| A: 03-roles-and-ports:154 | AI 模型版本迭代手段 | P2 |
| 三重核心价值（陪伴+催化+桥梁 / 大厅 Neo）| C: 02-hub:76 | 大厅 Neo 价值定位 | P2 |
| 大厅模式 vs 场域模式（Neo 能力差异）| C: 02-hub:65 | 跨场域 Neo Persona 差异化 | P2 |
| 主动触发规则 6 场景（Neo）| C: 02-hub:166 | Neo 主动行为信号触发 | P1 |
| 沟通风格 6 项（Neo 大厅）| C: 02-hub:180 | 直接朴实 / 事实先行 / 行为优先 等 | P2 |
| 教学边界 / 自主发挥边界 / 答疑口播知识范围 | C: 03-lecture:248,260,263 | Neo 在 lecture 自由度 / 范围内/范围外/完全超出 3 类 | P1 |
| Neo 行为态 4 态（预览 / 首聊 / 回访 / 复习）| C: 05-recap:431,443-452,64 | recap 内 Neo 行为态切换 | P1 |
| Walk-through / 完整 Walk-through / 实质性反思 / 留白追问 | A: 01-personas:109 / 04-data-model:129,201 / C: 05-recap:14,48,69,396,588,626 | recap 首聊态 Neo 规范 | P1 |
| 必给总结 / 必收尾 / 苏格拉底式追问（Neo 复盘）| C: 04-practice:543,544,559 / 05-recap:613 | Neo 必收尾追问 / Truth Source § 2.7 | P1 |
| 第四面墙 / 逃生通道 | C: 04-practice:711,63,425,444 / A: 02-methodology:421 | Actor 角色保持 / Neo 切讲授态 | P1 |

### 1.13 节归属：§ 13 外部 / 复用平台（4 项）

| 术语 | 出现位置（合并） | 建议表述 | 优先级 |
|---|---|---|---|
| SalesVox / SalesVox AI | B: 01-pre-learning:87,93 | 公司另一款 AI 产品（让 AI 卖产品）| P2 |
| AB test / 灰度发布 | A: 03-roles-and-ports:153,155 | 产品优化机制 | P3 |
| 跨项目数据底座 / 租户级隔离 / 跨租户隔离 | A: 03-roles-and-ports:140-145 / B: 08-platform:90-94 | 多客户多项目数据存储 | P2 |
| ymcas-d 平台 | C: 06-cross-context:91 | 与外部平台资源对接 | P3 |

### 1.14 节归属：§ 14 状态与机制（30 项 — 含本期最大缺口）★

> **本节是 glossary 最大缺口** — 管理端核心术语 + lifecycle SOP + 学员端状态管理大量缺失。建议在 § 14 内拆分子节或新增 § 15 管理端架构。

#### 14.1 管理端架构核心术语（建议 § 14 内独立子节或新增 § 15）★

| 术语 | 出现位置（合并） | 建议表述 | 优先级 |
|---|---|---|---|
| **首页 Home** | D: 01-overview:62 / 02-home:12 | 管理端 4 模块之一 / 监控 | **P1 ★** |
| **报告中心 Report Center** | D: 01-overview:64 / 03-report-center:12 | 管理端 4 模块之一 / 交付 | **P1 ★** |
| **项目配置 Program Config** | D: 01-overview:65 / 04-program-config:12 | 管理端 4 模块之一 / 配置 | **P1 ★** |
| **消息中心 Message** | D: 01-overview:66 / 05-message:12 | 管理端 4 模块之一 / 沟通 | **P1 ★** |
| **配置态 / 运营态**（双态全名）| D: 01-overview:30-31 / 04-program-config:42-46 | 项目配置状态 / 项目运营状态 | P1 |
| **Home Ora 3 能力**（呈现 / 解读 / 钻取）| D: 02-home:362-413 | Home Ora 3 动作组合 | P1 |
| **6 配置板块**（项目信息 / 人员名单与角色 / 里程碑配置 / 催学规则 / 平台个性化 / 内容预览）| D: 04-program-config:21-31 | Program Config 6 板块 | P1 |
| **平台个性化** | B: 01-pre-learning:210 / 02-learning:88,128 / D: 04-program-config:206-228 | program config 子模块 | P1 |
| **内容预览** | D: 04-program-config:230-241 | 6 板块之一 / 仅查看 | P2 |
| **HITL** | B: 03-completion:33 / D: 01-overview:64 / 03-report-center:407 | Human-in-the-loop / Ora 拉数据 + 多轮 + admin/HR HITL 编辑 | P1 |
| **写入即固化 / 锁快照** | D: 03-report-center:130,300,403 | 图表生成时数据固化 / 此后不变 | P2 |
| **消息管理 / 消息编辑** | D: 05-message:24-30,52,99 | 消息中心 2 大模块 | P2 |
| **三大类消息**（平台消息 / 系统消息 / 用户消息）| B: 07-user-global:166-171 | 消息分类 | P1 |
| **消息类型 chip**（手动 / 自动催学 / 草稿 / 定时）| D: 05-message:62-67 | 消息列表类型 | P2 |
| **投递状态**（已发送 / 失败 / 未发送 / 待发送）| D: 05-message:67 | 列表"投递状态"列 | P2 |

#### 14.2 lifecycle / SOP / 配置（建议 § 14）

| 术语 | 出现位置（合并） | 建议表述 | 优先级 |
|---|---|---|---|
| **program config**（核心高频术语）★ | B: 01-pre-learning:21-23 多处 / 02-learning:104,110 / 03-completion:49 / C: 03-lecture:346,410 / 04-practice:726 / 05-recap:747 | 全文反复出现 / glossary 完全缺 | **P1 ★** |
| program config 三状态（空白 / 只读+变更管理 / 已结营）| B: 01-pre-learning:181,226 / 02-learning:88 / 03-completion:53 | program config 状态机 | P1 |
| 变更管理 SOP / 学员名单变更 SOP | B: 01-pre-learning:32 / 02-learning:79,91,92,98 | 配置变更子流程 | P1 |
| 首次登录账号 / 未首次登录 / 已首次登录 | B: 02-learning:94-96 | SOP 节点判定 | P2 |
| 异常学员 / 异常学员判定信号 | B: 02-learning:54,56,119 / D: 02-home:14,40,68,219,293 | 多 widget 综合识别 | P1 |
| 脱训 / 进度落后 / Quiz 频繁失败（异常信号）| B: 02-learning:50-56,119 / 08-platform:50 | 3 类异常信号 | P1 |
| 催学规则 / 催学动作 / 全员催学 / 手动选人 | B: 01-pre-learning:209 / 02-learning:86,111,114,118,121 | 项目运营对学员的催学 | P1 |
| 催学触发类型 4 类（里程碑绑定 / 脱训信号 / 进度落后信号 / 手动触发）| B: 02-learning:121 / D: 04-program-config:185 | 催学触发分类 | P1 |
| 脱训阈值 / 进度落后阈值 / 进度领先阈值（默认 7 天 / M×0.80 / M×1.20）| D: 04-program-config:177-186 | 催学规则配置项 | P1 |
| 投递日志 | B: 02-learning:124 | 完整记录 / 谁收到 / 是否查看 | P2 |
| 接管账号 vs 重新注册账号 | B: 08-platform:175,177 | 中途换运营场景 | P2 |
| disabled（账号状态）| B: 03-completion:51,123,124 / 07-user-global:51 | 学员账号 disabled / 无法登录 | P2 |

#### 14.3 学员端状态机制（建议 § 14）

| 术语 | 出现位置（合并） | 建议表述 | 优先级 |
|---|---|---|---|
| 自由复习 / 自由复习模式 / 自由探讨（practice 版）★ | C: 03-lecture:441,458 / 04-practice:775,790 / 05-recap:780,787 | 见关键议题 7 | P1 |
| 状态矩阵 / 4 象限（顺从/投入/冷漠/抵抗）/ 横纵轴 | C: 04-practice:206,329-340 | Actor 即时状态矩阵 | P1 |
| practice 4 阶段（导入 / 演练 / 复盘 / 报告）| A: 04-data-model:175 / C: 04-practice:14,138-143 | practice 阶段命名 | P1 |
| 演练结束 3 类触发条件（轮数上限 / 目标达成 / 死循环检测）| C: 04-practice:348,352-354 | 演练结束机制 | P2 |
| 重练机制 / 重新演练 / 已完整 vs 未完成（演练状态点）| C: 04-practice:172-181,673,687 | 多次演练 | P2 |
| 断点续播（VIDEO 媒体层 vs Activity 流程层）| C: 03-lecture:333 多处 | 见关键议题 8 | P2 |
| 静默暂停 / 插嘴提问 / 主动回顾跳转（打断子场景 3 类）| C: 03-lecture:130,131,340,351 | 随时打断细分 | P2 |
| 防挂机机制 | C: 03-lecture:346,409 | 5 分钟无操作 / program config 可调 | P2 |
| SCO 锁定 / 阶段锁定 / 完成判定 | C: 03-lecture:330,347,399 / 06-cross-context:89 | 完成判据 | P1 |
| 4 学员状态（recap：空白 / 部分 / 完整 / 自由复习）★ | C: 05-recap:431-440 | glossary 已有 / 此处补预览/首聊/回访/复习 4 行为态对应 | P1 |
| 重学机制 | C: 02-hub:307 | Activity 内重学按钮 | P2 |
| 解锁顺序 / 显示顺序 | C: 02-hub:282-285 | 全自由学 + 序列固定 | P3 |
| 进度态 / Course 完成率 / 整体完成率 | D: 02-home:140-177,246,336 | 进度类术语 | P2 |

#### 14.4 全局 / 合规 / 平台

| 术语 | 出现位置（合并） | 建议表述 | 优先级 |
|---|---|---|---|
| 个人设置 vs 个人偏好设置（严格区分）| B: 07-user-global:103-108 | 两类子模块 | P2 |
| 三类账号 + 同一套用户表 + 多角色加载 | B: 07-user-global:23,25 | 见 § 3 | — |
| 同一项目统一登录页 / 登录后路由决策 / 端口切换按钮可见性 | B: 07-user-global:61,66,70,74 | 登录设计 | P2 |
| 未读红点 / 未读判定 | B: 07-user-global:156,196 | 消息中心交互 | P2 |
| WebSocket 实时（消息推送）| B: 07-user-global:202 | 消息推送底层 | P3 |
| 系统催学 / 里程碑提醒 | B: 07-user-global:170-177 | 系统消息子类 | P2 |
| 多人同发 / 富文本 | B: 07-user-global:208,209 | 手动发送特性 | P3 |
| 应急访问 / 应急按钮 | B: 08-platform:170-173 | 客户出问题处理 | P3 |
| ISO 8601 / UTC+8（中国时区）| B: 08-platform:54,48,50 | 时区策略 | P3 |
| i18n 能力 / 多语言架构 | B: 08-platform:43 | 国际化策略 | P3 |
| AIGC 规范 / 国内 AIGC 规范 / 个人信息保护法 | B: 08-platform:66,108 | 合规要求 | P2 |
| GDPR | B: 08-platform:109 | 本期不考虑 | P3 |
| 大模型安全声明 | B: 02-learning:139 / 08-platform:62-67 | "内容由 NeoLearning AI 提供" | P2 |
| 主题切换（明亮 / 黑夜）| B: 07-user-global:126,134 | 个人偏好（与项目级"平台个性化"独立）| P3 |
| Agent prompt 调教 | B: 07-user-global:259 / 08-platform:80,162 | 数据回流用途 | P3 |
| 会话 / 登录状态（避免使用 session 一词）★ | B: 07-user-global:240 | 见关键议题 5 | P1 |

---

## 2 · 真废止（0 项）

| glossary 现有术语 | 4 报告都未见 / 删除理由 |
|---|---|
| **（无）** | 4 个 Agent 报告"废止候选"中的所有项，经交叉验证均为 **scope 误判**——某 Agent 没扫到 ≠ glossary 该删除。详见下"误判表" |

### 误判表（实际仍在用 / 不应废止）

| 术语 | A 报 | B 报 | C 报 | D 报 | 实际状态 |
|---|---|---|---|---|---|
| AI 老师 / AI TUTOR / AI tutor / Leo / Persona Agent | 0 命中 | 0 命中 | 0 命中 | 0 命中 | ✅ 已废止状态正确（不是要删，是 glossary 留作"已禁用"标记） |
| 4 场域 / 5 场域（旧口径）| 0 命中 | 0 命中 | 0 命中 | 1 残留（D: 04-program-config:213）| ✅ 已废止状态正确 / 但有残留 fix |
| recap milestone / 综合汇报 / 首聊层 / 首聊报告 / 首聊回顾 / Course 完成事件 | 0 命中 | 0 命中 | 0 命中 | 0 命中 | ✅ 已废止状态正确 |
| Subbar / Bell icon / Constructing / Coming Soon / ChatBI / WYSIWYG | A: 5 文件未见 | B: 部分见到（笔记悬浮球 / Coming Soon）| C: 多处见 | D: 多处见（ChatBI / Coming Soon / WYSIWYG / Bell icon） | 实际仍在使用 / scope 误判 |
| 报告库 / 报告编辑 / Course 个人报告 / Activity 完成事件 | A: 部分 | — | C: 多处 | D: 多处 | 实际仍在使用 / scope 误判 |
| 4 维感知 / 8 学习信号 / 6 维画像 / 三级记忆 | A: 多处 | B: 范围外 | C: 6 维画像多处 | D: 范围外 | 实际仍在使用 / scope 误判 |
| 7 动作 / 5 大理论底座 | A: 多处 | B: 范围外 | C: 范围外 | D: 02-home:366 出现"考研"残留 | 实际仍在使用 / scope 误判 |
| Topbar / 抽屉 / 笔记悬浮球 | A: 范围外 | B: 部分 | C: 多处 | D: 范围外 | 实际仍在使用 / scope 误判 |
| Soul / Persona / voice / 立场 | A: 多处 | B: 范围外 | C: 多处 | D: 间接 | 实际仍在使用 / scope 误判 |
| Director / Actor | A: 多处 | B: 范围外 | C: 多处 | D: 范围外 | 实际仍在使用 / scope 误判 |
| Course Pack / SCO / asset / 5 层结构 | A: 多处 | B: 试用 Course Pack | C: 多处 | D: 范围外（管理端无需 SCO/asset 粒度）| 实际仍在使用 / scope 误判 |
| GPB / XUI | A: 范围外 | B: 多处 | C: 范围外 | D: 间接引用 | 实际仍在使用 / scope 误判 |
| student01 / newbie01 | A: 范围外 | B: 范围外 | C: 范围外 | D: 范围外 | 实际仍在使用（账号体系测试用），仅 spec 文档不直接引用 |

**结论**：本次 T1.2 **不删除任何 glossary 条目**。所有 ~~已废止~~ 标记保持原状（作为反向防呆）。

---

## 3 · 校准（27 项 / 跨 Agent 合并）

| 术语 | glossary 现表述 | spec 实际多种表述 | 报告来源 | 建议方向 |
|---|---|---|---|---|
| **8 阶段名（试运行 / 签单）** | "试运行 / 签单" | "试运行体验" / "客户意愿确认 + 签单" | B | glossary 加注"简写=glossary 简写 / 全称=spec 内表述" |
| **结营**（双重含义）| "项目周期起止节点" | 阶段名 + 阶段里程碑必选项 | B | glossary 标注"结营"在两层语境（阶段名 / 里程碑名）都使用 |
| **中期** | "学习期 ≈ 一半" | 时间点 + 里程碑名 + 报告类型名 三义 | B | glossary 补"中期"作里程碑 + 报告类型用法 |
| **服务周期 / 项目周期** | "≤ 12 月 / ≤ 服务周期-1 周" | 补充约束："开营后锁定 / 开营前 admin 可改 / ≥ 项目周期+1 周缓冲" | B | glossary 补约束细节 |
| **项目里程碑（milestone）** | "§ 6.6.3 / 阶段+自定义上限 10 个" | 明确分阶段（结营必选+中期可选）+ 自定义（上限 10）| B / D | glossary 补 2 类划分 |
| **管理员定义冲突** ★ | "HR + 项目运营合称（管理端用户）" | spec 多处不一致：① 含 admin / ② 不含 admin / ③ 角色维度（user 可同时持学员+管理员角色）| A / B / D | 见关键议题 2 |
| **admin** | "项目根账号 / 1 个 / 开营前可改 / 开营后锁定" | spec：admin = 账号 + 角色双重含义 / 开营后"管理员（HR+项目运营）+ admin 仍可访问" | A / B / D | glossary 加"账号 + 角色双重含义" + 开营后访问规则细化 |
| **三级记忆三层英文名** | "短期 / 中期 / 长期" | 补 AgentContext / Session Store / Profile | A | glossary 补三层英文名 |
| **4 维感知子维度** | "情绪 / 认知负荷 / 参与度 / 学习状态" | 补具体值（情绪 10 状态 / 认知负荷 3 类 / 参与度 3 态 / Dreyfus+mastery）| A | glossary 加"子维度详见 § 2.3.1"指引 |
| **8 信号** | "5 教学信号 + 3 教练信号" | 补 8 信号具体名（5 教学：缺概念/忘了/用错/选错工具/错误心智模型 + 3 教练：知行差距/元认知偏差/语境错配）| A | glossary 补 8 信号具体名称 |
| **6 维画像** | "6 维 × 5 等级" | 补 6 维具体名（思考与反思 / 学习投入 / 场景讨论 / 表达开放 / 挑战接纳 / 学习自驱 意愿）| A | glossary 补 6 维具体清单 |
| **5 类卡片命名一致性** ★ | "课程卡 / 任务卡 / 知识卡"（无后缀）| spec 全用"课程卡片 / 任务卡片 / 知识卡片"（带后缀）| A / C | 见关键议题 3 |
| **9 类 SCO（不是 4 类）** ★ | 仅列 4 类（SLICE / VIDEO / QUIZ / FEEDBACK）| spec 实际 9 类（含 FEEDBACK 双头 + PRACTICE 4 类 + RECAP_DIALOGUE）| A / C | 必须补全（见 § 1.5）|
| **学员端 4 库 字段名** ★ | 未明示完整 4 库 | B/C: "我的报告 / 我的高光 / 我的工具 / 我的笔记"; A: "我的笔记 / 我的高光 / 我的工具 / 我的成果"; B: 8.4 节"成果 / 发现 / 工具 / 笔记" | A / B / C | 见关键议题 4 |
| **5 场域** | "旧口径 / 不再使用" | C: spec 06-cross-context § 9.4.4 用"5 场域 × 5 卡片矩阵"——但矩阵实际 4 行 | C | 见关键议题 1 |
| **小结 = recap 中文名** | 未列 | spec 实际把"小结 Activity"当 recap Activity 中文叫法 | B | glossary § 4 / § 9 补"小结 = recap 中文名" |
| **首次回顾**（替换 首聊回顾）| 全文替换清单已列 | spec 已落地（05-recap:284）| B / C | ✅ 一致 / 无需校准 |
| **Activity 完成事件 精化** | "特指 recap Activity 自身完成（首聊态首次完整 Walk-through 触发）" | spec 进一步限定："完整态首次 + 完整 Walk-through 走完 + 实质性反思 + 应用计划产出 四件齐全" | C | glossary 加更精确限定 |
| **完成态 recap = 首聊态** | 未明示等价 | spec D 用"完成态 recap"（03-report-center:209,215）/ glossary § 14 用"完整（首聊态）"| D | glossary 加 "完成态 recap = 首聊态 / 完整态 recap" 等价说明 |
| **结项报告** | "业务环节名称" | spec 实际多用"团队结项报告"全称 / 5 文件中"结项报告"未单独出现 | B / D | glossary 加"团队结项报告 = 结项报告"等价 + spec 措辞统一 |
| **综合报告（带"模板"后缀）** | "综合报告" | spec 多带"综合报告模板"后缀 | B / D | glossary 注"通常带'模板'后缀使用" |
| **team report 与团队结项报告关系** | "team report = 引擎/功能" | "团队结项报告"是 team report 在阶段 6 的具体产物 | B | glossary 补关系说明 |
| **双态切换全名 vs 缩写** | "配置态 / 运营态" | spec 用"项目配置状态 / 项目运营状态"全名 | D | glossary 注全名+缩写 |
| **HR 与项目运营关系** | "同一组人" | spec 补"不分账号类型 / 共用管理端" | A | glossary 补约束细节 |
| **学员端场域口径补充** | "学员端 = 大厅 + 3 学习场域" | spec 用"学员端 = 大厅（中枢层）+ 3 学习场域（学习核心层）"完整 | A / C | glossary 补层级标签 |
| **GPB 作用范围** | "绚星统一账号体系" | spec § 7.1：用 GPB 处理密码强度 / 失败锁定 / 找回密码 / 服务条款 / 隐私同意（不只账号，还含合规）| B | glossary 补"作用范围扩至合规" |
| **session 术语约定** | 未列 | spec 明确"本文档不使用 session / 统一用'会话/登录状态'" | B | 见关键议题 5 |

---

## 4 · 残留 fix（2 项 / 高优先级 · 不需决议）

| 文件:行号 | 旧 | 新 | 来源 |
|---|---|---|---|
| **06-management/02-home:366** | 考研 | **考核** | D 报 / 7 动作笔误 |
| **06-management/04-program-config:213** | 4 学习场域 | **3 学习场域 + 大厅** 或 **学员端各场域** | D 报 / 旧口径残留 |

> 这 2 项是明确笔误 / 旧口径残留，**不需要 DM 决议**，T1.3/T1.4 直接修复。

---

## 5 · spec bug + 不确定项（11 项 / 给 PM 关注 · 建议 T1.4 修复期一并处理）

| 编号 | 内容 | 来源 |
|---|---|---|
| 1 | **02-methodology:96 "4 大核心特质"标题/内容不符**：表头标 4 大，下方仅列 3 条（Teacher Credibility / 越用越懂 / 按场域差异化）—— spec 内部 bug 不属术语问题 | A 备注 5.2 |
| 2 | **02-methodology § 5.3.1 大厅辅导**：章节标题写"Project 级 + Module 级 context"但表格只列 Project 级 3 项（Module 级未展开） | A 备注 5.2 |
| 3 | **02-learning:31-34 与 08-platform:150 "4 库"字段名不一致** ★：6.6.1"我的工具/我的成果/我的高光/我的笔记" vs 8.4"成果/发现/工具/笔记"——"发现"vs"高光"是 spec 内部不一致 bug | B 关键 bug 1 |
| 4 | **02-learning:56 与 02-learning:119 "异常学员信号"清单数量不一致**：56 列 3 个（脱训/进度落后/Quiz 频繁失败）/ 119 列 2 个（脱训/进度落后） | B 关键 bug 2 |
| 5 | **02-learning:138 与 08-platform:68 "powered by NeoLearning"位置范围不一致**：02 说"页脚/关键位置保留"（多位置）/ 08 说"登录页有就行/其他位置不强制"（仅登录页） | B 关键 bug 3 |
| 6 | **02-learning C 节"项目运营线下跟进" 与 A/B/D 节"管理员"使用混用**：spec 写作时混用容易让读者困惑 | B 备注 5.7 |
| 7 | **C: 06-cross-context § 9.4.4 章节名 vs 矩阵实际**：章节叫"Neo 卡片产出（5 类 × 5 场域）"但矩阵表头是 4 行（大厅/lecture/practice/recap）—— 是"5 场域"含未来场域留口还是笔误 | C 备注 5.1 |
| 8 | **C: 04-practice 自由复习/自由探讨双名**：spec 声明"统一概念"但 lecture/recap 用"自由复习" / practice 用"自由探讨" | C 备注 5.3 |
| 9 | **C: 短期/长期记忆 vs glossary 三级记忆**：spec 06-cross-context 实际只用"短期/长期"两层 / 中期记忆只在 § 3.4.1 总纲（待 T1.4 核查 § 3.4.1 是否真有"中期"或 glossary 与正文不同步） | C 备注 5.8 |
| 10 | **D: 03-report-center 中"完成态 recap" 与 glossary § 14 "完整（首聊态）"表述不统一** | D 备注 5.2 |
| 11 | **D: vibe 写作大小写**：spec 一律小写"vibe 写作"，是否需 glossary 锁定？倾向小写（保持一致） | D 备注 5.8 |

---

## 6 · 待 DM 决议的关键议题（8 项 / 核心争议）★

> 以下 8 项是"DM 不拍板就不能进 T1.3"的核心议题。其他都已由 Claude 自动归并。

### 议题 1：「5 场域」语义到底是什么？★

- **现状**：glossary § 4 标"~~5 场域~~ 旧口径 / 不再使用"
- **冲突**：C 报指出 spec 06-cross-context § 9.4.4 章节名"Neo 卡片产出（5 类 × 5 场域）"——但矩阵表头实际是 **4 行**（大厅 / lecture / practice / recap）
- **两个选项**：
  - **A. 改章节名**：把"5 类 × 5 场域"改为"5 类 × 4 场域"或"5 类 × 大厅+3 学习场域"——matrix 4 行的真实状态对齐
  - **B. 保留 5 场域 = 大厅+3 学习+未来留口**：glossary 加一行 "5 场域 = 大厅 + 3 学习场域 + 未来场域留口"
- **C 倾向选项 A**：当前矩阵实际只 4 行，文字不应预留未来
- **DM 拍板**：A 还是 B？

### 议题 2：管理员定义—— admin 是否纳入"管理员"总称？★

- **现状**：spec 内多处不一致
  - glossary § 3："管理员 = HR + 项目运营 合称"（不含 admin）
  - 03-roles-and-ports:21："本文「管理员」=「admin + HR + 项目运营」三者总称"（含 admin）
  - 01-personas:138："Ora 是管理员（HR + 项目运营 / 同一组人）的 AI 分析师"（不含 admin）
  - 01-overview:22 列 admin 为管理员之一（含 admin）/ 01-overview:31 又把 admin 与"管理员"对立（不含 admin）
- **建议方向**：glossary 明确"广义管理员 = admin + HR + 项目运营 / 狭义管理员 = HR + 项目运营"，spec 各处使用按上下文规范
- **DM 拍板**：是否采纳"广义/狭义"双层定义？还是统一为单一定义（如"管理员=HR+项目运营，admin 不在此列"）？

### 议题 3：5 类卡片是否带"卡片"后缀？★

- **现状**：
  - glossary § 8："askUserQuestion / 课程卡 / 高光卡片 / 任务卡 / 知识卡"（混用，部分有后缀部分无）
  - spec A/C 全部用"课程卡片 / 任务卡片 / 知识卡片"（一致带后缀）
- **建议方向**：glossary 全部统一为"卡片"后缀（与 spec 对齐）：askUserQuestion / 课程卡片 / 高光卡片 / 任务卡片 / 知识卡片
- **DM 拍板**：是否统一带"卡片"后缀？

### 议题 4：学员端 4 库的字段名到底是什么？★（spec 内部不一致 bug）

- **现状**：spec 内 3 处表述
  - C: 02-hub:349（学员端 4 库一级结构）—— **我的报告 / 我的高光 / 我的工具 / 我的笔记**
  - B: 02-learning:31-34（4 库回顾）—— **我的工具 / 我的成果 / 我的高光 / 我的笔记**
  - B: 08-platform:150（学员 4 库下载）—— **成果 / 发现 / 工具 / 笔记**
  - A: 01-personas:328（早期表述）—— **我的笔记 / 我的高光 / 我的工具 / 我的成果**
- **冲突点**：
  - "我的报告" vs "我的成果"（同一概念两个名）
  - "高光" vs "发现"（08-platform 用"发现"，其他用"高光"）
- **建议方向（Claude 倾向）**：以 C 报 02-hub:349 表述为准 = "我的报告 / 我的高光 / 我的工具 / 我的笔记"（学员端最新 spec 表述）
- **DM 拍板**：4 库标准名是哪 4 个？需要校准 02-learning + 08-platform + 01-personas

### 议题 5：术语约定 "session"—— glossary 是否收录？

- **现状**：07-user-global:240 spec 明确"本文档不使用 session 一词，统一用'会话'或'登录状态'"——这是个**明确的术语约定**，但 glossary 未收录
- **建议方向**：glossary § 11 或 § 14 加一条术语约定 "禁用 session / 统一用'会话/登录状态'"
- **DM 拍板**：是否将这种"禁用词约定"形式化加入 glossary？（参考 § 1 已废止"AI 老师/AI TUTOR"的格式）

### 议题 6：报告体系矩阵—— glossary § 10 是否新增汇总表？

- **现状**：spec 中"报告"出现在多处场景（Course 个人报告 / practice 报告 / 综合报告 / 结项报告 / team report / 报告库 / 我的报告库 / Activity 高光库 等），各场景关系散落，读者不易把握
- **建议方向（C 报建议）**：glossary § 10 加一个矩阵汇总表
  | 报告 | 端口 | 范围 | 生成 |
  |---|---|---|---|
  | Course 个人报告 | 学员 | 单 Course | recap 触发 |
  | practice 报告 | 学员 | 单 Activity | practice 触发 |
  | 综合报告 / 结项报告 | 管理端 | 项目级 | HR 模板生成 |
  | team report | 管理端 | 团队 | Ora 拉数据 |
- **DM 拍板**：是否在 glossary § 10 增加该矩阵？

### 议题 7：自由复习 vs 自由探讨—— 是 1 个概念还是 2 个？

- **现状**：spec 05-recap:787 声明"统一概念"——但 lecture/recap 完成 Modal 用"自由复习"，practice 完成 Modal 用"自由探讨"
- **建议方向**：glossary § 14 加 "lecture/recap 用'自由复习' / practice 用'自由探讨' / 三者指向同一概念（详见 § 9.3.3.9.6）"
- **DM 拍板**：保留"自由复习/自由探讨"双名（场域差异化），还是统一为单名？

### 议题 8：管理端核心架构术语—— § 14 内独立子节，还是新增 § 15？

- **现状**：管理端核心术语（Home 首页 / 报告中心 Report Center / 项目配置 Program Config / 消息中心 Message / Home Ora vs Report Ora / 双态切换 / HITL / program config / 6 配置板块 等）glossary 完全缺失，是本次最大缺口（影响约 30+ 术语）
- **建议方向（D 报建议）**：新增 § 15 管理端架构术语 节，专门收录管理端 4 模块 + 双态 + 双 Ora 实例 + 6 板块 等
- **替代方向**：仍放 § 14 状态与机制内拆 14.1/14.2/14.3/14.4 子节
- **DM 拍板**：新增 § 15，还是 § 14 内子节化？

---

## 总结建议给 DM

1. **必须 DM 决议的 8 个议题**（见第 6 节）—— 不拍板会卡住 T1.3
2. **162 个新增项已分级**：P1（38 项 / 必须入 glossary） / P2（71 项 / 建议入） / P3（53 项 / 跳过）
3. **27 个校准项**有明确建议方向，DM 抽空 review 即可（无 DM 决议则按 Claude 建议执行）
4. **2 个残留 fix** 直接走 T1.4 修复（不需决议）
5. **11 个 spec bug** 标记给 PM 在 T1.4 一并处理
6. **0 个真废止**——本次术语扫描**不删除任何 glossary 条目**

---

**报告完成。** 待 DM 拍板后进入 T1.3（更新 glossary）。
