# Agent A · vision + foundation 术语扫描

**扫描文件**：5 个 / 总行数：约 1404 行（01-vision 93 / 01-personas 362 / 02-methodology 448 / 03-roles-and-ports 162 / 04-data-model 291）
**完成时间**：2026-05-06
**扫描范围**：§ 1 愿景 / § 2 教学方法论 / § 3 Persona / § 4 角色与端口 / § 5 数据模型 AOM

---

## 1 · 新增候选（spec 出现但 glossary 缺）

| 术语 | 出现文件:行号 | spec 中的表述 | 建议 glossary 节归属 |
|---|---|---|---|
| AI-Native 学习陪伴平台 / AI-Native 培训交付平台 | 01-vision:17,27 / 03-roles-and-ports:56 | "面向企业培训的 AI-Native 学习陪伴平台" | § 1 产品命名（产品形态描述）|
| 1v1 老师 AI 孪生 | 01-vision:19,27 / 01-personas:24,81 / 02-methodology:16 | "Neo = 1v1 线下授课老师的 AI 孪生" | § 2 AI 角色（Neo 定位）|
| Teacher Credibility（Hattie d=0.90）| 01-personas:96 | "必须显得'懂'和'有标准'，不是亲切就行" | § 6 教学方法论 |
| 大厅 Hall | 01-personas:106 / 03-roles-and-ports:85 / 02-methodology:356 | 学员端中枢层 / 不算场域 | § 4 学员端场域（已有"大厅"，但 Hall 英文未列）|
| 授课 Lecture / 对练 Practice / 小结 Recap | 03-roles-and-ports:86-88 / 02-methodology:357-359 | 3 学习场域中英对照 | § 4 学员端场域（中英映射）|
| Walk-through | 01-personas:109 / 04-data-model:129,201 | recap 首聊态 Walk-through 走查 | § 8 卡片与产出 / 或 § 9 周期 |
| 主动触发原则 | 01-personas:114 | "Neo 所有主动行为均有明确信号触发，不做无信号的主动干预" | § 12 Persona / Soul（行为约束）|
| 被动响应原则 | 01-personas:176 | "Ora 所有动作由管理员触发或确认 / 不主动调度 / 不自动联系学员" | § 12 Persona / Soul（行为约束）|
| 情绪优先原则 | 02-methodology:62 | 检测到强负面情绪时切换情绪支持模式 | § 7 感知与画像 |
| AgentContext / Session Store / Profile | 01-personas:207-209 | 三级记忆三层名称（短期 / 中期 / 长期）| § 7 感知与画像（三级记忆细化命名）|
| memory_id | 01-personas:184,311,335 / 04-data-model:124 | 跨场域引用与可追溯标识 / 双头配对 collect ↔ review 串联用 | § 7 感知与画像 / 或 § 5 数据模型 |
| 渐进画像 | 01-personas:199,222 | "Neo 越用越懂学员（学员第 6 个月的 Neo 比第 1 周更精准理解他）" | § 7 感知与画像 |
| Soul 调整 | 03-roles-and-ports:154 | 产品运营动作 / AI 模型版本迭代 / Soul 调整 | § 12 Persona / Soul（已有 Soul 但未具体到"调整"动作）|
| 数据访问层 vs 呈现层 二元区分 | 01-personas:306 | 核心论证主轴 / 数据访问 ≠ 呈现给用户 | § 14 状态与机制（或独立条目）|
| 4 库内容（我的笔记 / 我的高光 / 我的工具 / 我的成果）| 01-personas:328,338 | 学员个人学习成果 4 库 | § 8 卡片与产出（学习成果区结构）|
| 公司画像 | 01-personas:324,334,358 | "（未来：公司画像）" | § 7 感知与画像（未来扩展） |
| 6 维聚合机制（双向变化 / 无时间衰减 / prompt 锚点 / 6 维差异化阈值）| 02-methodology:127-132 | 6 维聚合规则 | § 7 感知与画像（聚合规则细化）|
| 5 大理论底座具体名（Sweller CLT / Vygotsky ZPD / Bloom / Dreyfus / 苏格拉底+费曼）| 02-methodology:30-34 | 详见表格 | § 6 教学方法论（已有 5 大理论底座，但具体术语 CLT / ZPD 未独立列）|
| Bloom 6 层（Remember / Understand / Apply / Analyze / Evaluate / Create）| 02-methodology:32 | Bloom 认知层级具体 6 层 | § 6 教学方法论 |
| Dreyfus 5 级（新手 / 高级新手 / 胜任 / 熟练 / 专家）| 02-methodology:33 | Dreyfus 5 级胜任 | § 6 教学方法论 |
| Mastery Learning（精熟学习）| 02-methodology:248,294,310 | 讲授 / 考核 / 练习 方法论背书 | § 6 教学方法论 |
| Deliberate Practice（刻意练习）| 02-methodology:310 | 练习方法论背书 | § 6 教学方法论 |
| Mezirow 转化学习 | 02-methodology:339 | 反思方法论背书 | § 6 教学方法论 |
| Greif 结果导向 / Greif 结果导向反思 | 02-methodology:325,339 | 追问 / 反思方法论背书 | § 6 教学方法论 |
| Schein 流程咨询 | 02-methodology:280 | 讨论方法论背书 | § 6 教学方法论 |
| 复杂反映（complex reflection）| 02-methodology:325 | 追问方法论背书 | § 6 教学方法论 |
| 4 维感知子维度具体值（情绪 10 状态 / 认知负荷 3 类 intrinsic/extraneous/germane / 参与度 3 态 active/passive/disengaged / mastery）| 02-methodology:58-61 | 详细子维度 | § 7 感知与画像 |
| BEI 完整度 | 02-methodology:121 | 6 维数据来源（表达开放）| § 7 感知与画像（数据采集机制）|
| 6 维画像 5 等级标志性表现 / prompt 锚点 | 02-methodology:154-217 | 6 维 5 等级 30 个典型话语 + 行为示例 | § 7 感知与画像（细化）|
| activityType | 04-data-model:57 | AOM Activity 字段 | § 5 数据模型与内容 |
| separateTag | 04-data-model:59,102,103 | asset 多版本切换标签 | § 5 数据模型与内容 |
| 学员标签 | 04-data-model:225,242 | "课前互动诊断 → 学员被打上标签" | § 5 数据模型与内容（自适应 L2 机制）|
| passCondition / solution 字段 | 04-data-model:164 | Quiz 通关条件字段 | § 5 数据模型与内容 |
| competencyGoals | 04-data-model:182 | 评分维度（practice 报告 KGP 内容字段）| § 5 数据模型与内容 |
| skill_ladders / 技能阶梯 | 04-data-model:182 | 评分阶梯（practice 报告 KGP 内容字段）| § 5 数据模型与内容 |
| 演绎指导 / 教学目的 / 辅导知识库 / 各层级知识内容 | 01-personas:326,336 | Neo / Ora 上下文范围 4 类 | § 5 数据模型与内容 |
| AOM 模板 / AOM 学习实例（双层文件命名）| 04-data-model:48-49 | 双重用途两套独立文件 | § 5 数据模型与内容（已部分有，建议明确双层命名）|
| FEEDBACK_COLLECT / FEEDBACK_REVIEW（双头配对）| 04-data-model:124 / 01-personas:325 | lecture SCO 类型双头配对 | § 5 数据模型与内容（SCO 类型补全）|
| PRACTICE_INTRO / PRACTICE_DRILL / PRACTICE_REVIEW / PRACTICE_REPORT | 04-data-model:125-128 | practice 4 阶段 SCO 类型 | § 5 数据模型与内容（SCO 类型补全）|
| RECAP_DIALOGUE | 04-data-model:129 | recap SCO 类型 | § 5 数据模型与内容（SCO 类型补全）|
| ~~ASSESSMENT_TAG~~（v0.4 取消）| 04-data-model:131 | "不做独立 ASSESSMENT_TAG SCO 类型" | § 5 数据模型与内容（已废止 SCO 类型，建议在 glossary 标注）|
| 对练 4 阶段（导入 / 演练 / 复盘 / 报告）| 04-data-model:175 | practice Activity 阶段命名 | § 4 学员端场域（场域内子结构）|
| Course 个人报告（5 块结构：内容锚点 / 走过的轨迹 / 6 维画像 / 关键证据 / 待办任务）| 04-data-model:202 | recap 报告 5 块结构 | § 10 报告体系（已有 Course 个人报告条目，5 块结构未列）|
| 自由复习层 / 自由复习 | 04-data-model:202 / 01-personas:206（"4 学员状态"中已含）| recap 自由复习层 | § 10 报告体系 / 或 § 14 状态与机制 |
| 必问点 | 04-data-model:181 | KGP 标定的复盘关键点位 | § 5 数据模型与内容 |
| 软化点 / 底线 / 情绪天花板 / 触发条件 | 04-data-model:180 | Actor 演绎逻辑 4 要素 | § 5 数据模型与内容（Actor 字段）|
| 三角色协作 | 04-data-model:188 | "状态矩阵 / 三角色协作 / Neo 不能做 5 条" | § 2 AI 角色（Neo / Director / Actor 协作）|
| Neo 不能做 5 条 | 04-data-model:188 | practice 演练中 Neo 行为约束 | § 12 Persona / Soul |
| 逃生通道 | 02-methodology:421 | "Neo 切讲授（Actor 不参与逃生）" | § 14 状态与机制 |
| 端口（3 个）/ 端口架构 | 03-roles-and-ports:13,22 | 端口视角 vs 角色视角 | § 3 端口与角色（已有"3 个端口之一"，但术语"端口架构"未独立列）|
| 角色 ↔ 端口映射 | 03-roles-and-ports:39 | 学员→学员端 / HR + 项目运营→管理端共用 / 产品运营→产品运营端 | § 3 端口与角色 |
| 跨端关系 | 03-roles-and-ports:69 | 学员端 ↔ 管理端 / 管理端 ↔ 产品运营端 | § 3 端口与角色 |
| 服务 SKU / SKU 申请下发 | 03-roles-and-ports:134-138,150 | 产品运营动作 1 / 客户签单后开通服务实例 | § 13 外部 / 复用平台（或 § 9 生命周期）|
| 跨项目数据底座 / 租户级隔离 | 03-roles-and-ports:140-145 | 产品运营动作 2 / 多客户多项目数据存储与隔离 | § 13 外部 / 复用平台 |
| AB test | 03-roles-and-ports:155 | "研发手动部署 + AB test" | § 13 外部 / 复用平台 |
| 灰度发布 | 03-roles-and-ports:153 | 产品优化迭代 | § 13 外部 / 复用平台 |
| 关联 Activity / 关联 Activity 范围 | 04-data-model:194,197 / 01-personas:325 | recap 数据源 / cross-Activity 上下文 | § 5 数据模型与内容 |
| 5 教学信号 + 3 教练信号（细分）| 02-methodology:67 | 8 信号细分 | § 7 感知与画像（已有 8 信号，建议补"5 教学+3 教练"）|
| Course Pack 跨主题切换 / Course Pack 可插拔 | 04-data-model:259,283 | 平台未来愿景 | § 5 数据模型与内容（已有 Course Pack）|
| 数据反馈循环 | 04-data-model:65 | "AOM 学习实例 → KGP → 优化下一版 AOM 模板" | § 5 数据模型与内容（已说明属内容侧，但术语本身可记录）|
| Hattie d=0.90 | 01-personas:96 | Teacher Credibility 效应量 | § 6 教学方法论 |
| Wang 2023 / 行为改变 g=0.73 vs 态度改变 g=0.34 | 02-methodology:310 | 练习方法论背书 / 效应量 | § 6 教学方法论 |
| 贝叶斯 Beta 分布 | 02-methodology:61 | 学习状态读取机制 | § 7 感知与画像（实现细节，可酌情）|
| 行为代理 | 02-methodology:60 | 认知负荷读取机制（连续追问 / 自我修正 / 响应速度）| § 7 感知与画像 |
| 经验洞察捕捉 | 02-methodology:120 | 6 维数据来源（场景讨论）| § 7 感知与画像 |
| 主动追问数 vs 被动应答比 | 02-methodology:123 | 6 维数据来源（学习自驱）| § 7 感知与画像 |
| 知识点 / 关键概念图 | 04-data-model:56,57 | AOM 模板 Module / Activity 字段 | § 5 数据模型与内容 |
| 学员画像假设 | 04-data-model:55 | AOM 模板 Project 字段 | § 5 数据模型与内容 |
| 教练背景知识 | 04-data-model:109 | Project 级提供 | § 5 数据模型与内容 |
| 应用咨询 | 02-methodology:250 / 03-roles-and-ports:85 | 大厅辅导子类（讲授 + 解惑）| § 4 学员端场域（大厅子动作）|
| 督学 / 课程推荐 / 辅导 | 03-roles-and-ports:85 | Neo 在大厅 3 项核心教练职能 | § 4 学员端场域（大厅子动作）|

---

## 2 · 废止候选（glossary 有但你扫的 5 文件未见）

| 术语 | glossary 位置 | 备注 |
|---|---|---|
| Subbar | § 11 UI / 交互术语 | 5 文件未见（属于 § 9-10 端口产品形态术语，预期）|
| 笔记悬浮球 | § 11 UI / 交互术语 | 03-roles-and-ports:96 仅提及"笔记悬浮球"作为 UI 共用元素，无具体定义；预期主体在 § 9 |
| Bell icon | § 11 UI / 交互术语 | 5 文件未见 |
| Constructing 占位 / Coming Soon 占位 | § 11 UI / 交互术语 | 5 文件未见 |
| ChatBI 模式 | § 11 UI / 交互术语 | 5 文件未见 |
| WYSIWYG | § 11 UI / 交互术语 | 5 文件未见 |
| 报告库 / 报告编辑 | § 10 报告体系 | 5 文件未见（属 § 10 模块）|
| Home Ora / Report Ora | § 14 状态与机制 | 5 文件未见 |
| 双态切换 | § 14 状态与机制 | 5 文件未见 |
| 4 学员状态（recap） | § 14 状态与机制 | 5 文件未见（recap 状态命名属 § 9.3.3 主体）|
| 项目里程碑（milestone）| § 9 生命周期与周期 | 5 文件未见（§ 6.6.3 主体）|
| Activity 完成事件 | § 9 生命周期与周期 | 5 文件未见（recap § 9.3.3 主体）|
| 8 阶段 | § 9 生命周期与周期 | 5 文件未见（§ 6 / § 8 主体）|
| 服务周期 / 项目周期 | § 9 生命周期与周期 | 5 文件未见（02-methodology / 04-data-model 提到"6 个月项目周期"但未用术语"服务周期"）|
| 中期 / 开营 / 结营 | § 9 生命周期与周期 | 02-methodology:152 提到"项目隔离 / 结营后归档"等使用结营，但未做术语正式定义；预期在 § 6 / § 8 |
| 团队报告 / team report | § 10 报告体系 | 01-personas:339 仅在 Ora 上下文表中"team report 历史 + 草稿"出现一次（隐式使用，未定义）|
| 综合报告 / 综合汇报 / 结项报告 | § 10 报告体系 | 5 文件未见（§ 10 主体）|
| 高光卡片 / "我的高光"区 / 高光识别 / 高光时刻 / 顿悟瞬间 / 高光 / 卡点 | § 8 卡片与产出 | 02-methodology:387 / 01-personas:106,108（仅"高光识别"提及一次）/ 01-personas:328（"我的高光"作为 4 库一项）—— 部分有出现但定义不在 5 文件中 |
| 5 类卡片 / 4 类卡片 | § 8 卡片与产出 | 02-methodology:382-409 已完整定义 5 类卡片；4 类卡片在 5 文件中未见（预期 § 10）|
| 课程卡 / 任务卡 / 知识卡 / askUserQuestion | § 8 卡片与产出 | 02-methodology:385-389 列了 5 类，但 glossary 写"5 类卡片（学员端）"完整 |
| 2 个账号 / student01 / newbie01 | § 14 状态与机制 | 5 文件未见 |

> **注**：废止判定要谨慎——上述大部分是因为属于 § 6-10 端口产品形态章节范畴，5 文件不覆盖很正常。**真正建议废止的极少**——仅当全量扫描后确认无任何使用，才执行。本节列表主要服务于 T1.4 全量回查交叉对比。

---

## 3 · 校准候选（双方都有但表述不一）

| 术语 | glossary 表述 | spec 实际表述 | 出现文件:行号 | 建议方向 |
|---|---|---|---|---|
| 学员端场域口径 | "学员端 = 大厅 + 3 学习场域" / "学习核心层 3 场域" | "大厅 + 3 个学习场域" / "跨大厅 + 3 个学习场域" / "大厅 + 3 学习场域" | 01-vision:21,27,50 / 01-personas:32,98,106 / 03-roles-and-ports:47,79,85 / 02-methodology:356 | spec 用法基本一致，与 glossary 对齐；建议 glossary 补充"3 个学习场域"为等价口径（"3 学习场域 / 3 个学习场域"两种均出现） |
| 项目运营 vs 产品运营 | "项目运营 = 4 类角色之一 / = HR 同一组人" / "产品运营 = 4 类角色之一 / 平台侧团队" | spec 表述更细："项目运营 = 派到具体项目的运营角色（客户侧 / 与 HR 协作）" / "产品运营 = 睿学平台侧的产品级运营（供应商侧）" | 01-vision:56 / 03-roles-and-ports:13-16,33-37 | glossary 可补"客户侧 vs 供应商侧"维度对照 |
| HR 与项目运营关系 | "HR = 4 类角色之一 / 付费方 / 与项目运营是同一组人" | spec："HR 与项目运营 = 同一组人（共用管理端 / 协同工作）" + "本期 HR 和项目运营**共用同一个管理端**，**不分账号类型**" | 01-vision:55 / 03-roles-and-ports:104-105 | glossary 可加"不分账号类型 / 共用管理端"约束 |
| 管理员定义 | "管理员 = HR + 项目运营合称（管理端用户）" | spec 03 文件："本文「管理员」=「admin + HR + 项目运营」三者总称" + "管理员（HR + 项目运营 / 同一组人）" | 03-roles-and-ports:21 / 01-personas:138 | spec 在 03 文件中把 admin 也纳入"管理员"总称，但 01-personas 又把 admin 排除——**glossary "HR + 项目运营 合称" 与 03 文件 "admin + HR + 项目运营 三者总称" 有冲突**，建议校准统一 |
| 三级记忆命名 | "三级记忆：短期 / 中期 / 长期" | spec 三层有具体英文名：AgentContext（短期）/ Session Store（中期）/ Profile（长期）| 01-personas:207-209 | glossary 建议补充三层英文名 |
| 4 维感知 | "4 维感知（实时雷达）：情绪 / 认知负荷 / 参与度 / 学习状态" | spec 完全一致，但补充了子维度（10 情绪状态 / 认知负荷 3 类 / 参与度 3 态 / Dreyfus + mastery）| 02-methodology:55-61 | glossary 可加"子维度详见 § 2.3.1" |
| 8 信号 | "8 学习信号 = 5 教学信号 + 3 教练信号" | spec："5 教学类（缺概念 / 忘了 / 用错 / 选错工具 / 错误心智模型）+ 3 教练类（知行差距 / 元认知偏差 / 语境错配）" | 02-methodology:67-85 | glossary 可补 8 信号具体名称 |
| 6 维画像 | "6 维画像 = 长期画像 / 6 维 × 5 等级" | spec："思考与反思意愿 / 学习投入意愿 / 场景讨论意愿 / 表达开放意愿 / 挑战接纳意愿 / 学习自驱意愿" | 02-methodology:103-110 | glossary 可补 6 维具体名称 |
| Neo 主交互形态（场域）| 隐含 | 01-personas:104-110 表格："大厅 / lecture / practice / recap" 列出 Neo 主交互形态 | 01-personas:104-110 | 校准——glossary 可加"Neo 主交互形态"概念 |
| Neo 5 类卡片清单 | "5 类卡片：askUserQuestion / 课程卡 / 高光卡片 / 任务卡 / 知识卡" | spec："askUserQuestion 卡片 / 课程卡片 / 高光卡片 / 任务卡片 / 知识卡片"——**全部带"卡片"后缀** | 02-methodology:385-389 | 校准命名一致性：glossary "课程卡 / 任务卡 / 知识卡" vs spec "课程卡片 / 任务卡片 / 知识卡片" |
| KGP 定义 | "KGP = Knowledge Generation Platform（知识生产平台）" | spec："KGP 内容生产平台" / "Knowledge Generation Platform / 知识生产平台" | 01-vision:22 / 04-data-model:22 | 一致 / glossary 写法可保留 |
| Course Pack | "Course Pack = KGP 在 Project 级提供的内容包 / 本期示例=基层管理者能力发展" | spec 一致 | 01-vision:23 / 04-data-model:283 | 一致 |
| Project / Module / Activity / SCO / asset | "AOM 5 层结构（技术侧）" | spec 一致："Project / Module / Activity / SCO / asset" | 04-data-model:71-91 | 一致 |
| Program / Course | "Project / Module 的用户侧+内容侧叫法" | spec："Project↔Program（即 NeoLearningProgram）/ Module↔Course / Activity / SCO / asset 三层统一" | 04-data-model:81-91 | 一致 |
| Segment → asset | "旧名 Segment / 已改名 asset" | spec："asset = 演绎素材（历史名 Segment / v0.5.0 起统一改名）" | 04-data-model:79 | 一致 |
| 7 动作 | "讲授 / 解惑 / 讨论 / 考核 / 练习 / 追问 / 反思" | spec 完全一致 | 02-methodology:241,355 | 一致 |
| 5 大理论底座 | "CLT / ZPD / Bloom / Dreyfus / 苏格拉底+费曼" | spec："Sweller 认知负荷理论（CLT）/ Vygotsky 最近发展区（ZPD）/ Bloom 认知层级 / Dreyfus 5 级胜任 / 苏格拉底式提问 + 费曼学习法" | 02-methodology:30-34 | 一致 / glossary 可补全名 |
| Director / Actor | "Director = practice 演练后台指挥 Agent / Actor = practice 演练与学员主线对话的 Agent" | spec："Director 后台编排" / "Actor 与 Neo 独立：Neo 看得到 Actor 对话，Actor 看不到 Neo 存在" | 04-data-model:186 / 02-methodology:421 | 一致（spec 补充了 Actor 与 Neo 隔离细节）|
| 9 类 SCO | glossary 仅列 4 类（SLICE / VIDEO / QUIZ / FEEDBACK）| spec 列出本期 9 类完整：SLICE / VIDEO / QUIZ / FEEDBACK_COLLECT + FEEDBACK_REVIEW（双头）/ PRACTICE_INTRO / PRACTICE_DRILL / PRACTICE_REVIEW / PRACTICE_REPORT / RECAP_DIALOGUE | 04-data-model:120-129 | 校准——glossary 应补全 9 类 SCO（不是 4 类）|

---

## 4 · 旧名残留（glossary 已 ~~废止~~ 但 spec 还在用）

| 旧名 | 应改为 | 出现文件:行号 |
|---|---|---|
| ~~（无）~~ | — | 5 文件中**未见** "AI 老师 / AI TUTOR / AI tutor / Leo / Persona Agent" 任何旧名残留 |

> **正面发现**：
>
> - "AI 老师 / AI TUTOR / AI tutor"——0 次出现 ✅
> - "Leo"——0 次出现 ✅
> - "Persona Agent"——0 次出现 ✅
> - "综合汇报"——0 次出现（5 文件不覆盖 § 10 报告章节，预期）
> - "recap milestone / 首聊触发的 milestone / 首聊层 / 首聊报告"——0 次出现（5 文件不覆盖 recap 主体章节，预期）
> - "4 场域 / 5 场域"（旧口径）——0 次出现 ✅；spec 用 "3 学习场域 + 大厅" 或 "3 个学习场域" 一致

---

## 5 · 备注 / 不确定项

### 5.1 命名一致性疑点

1. **"3 学习场域" vs "3 个学习场域"**：spec 中两种写法都有（"3 学习场域" / "3 个学习场域"），glossary 用"3 学习场域"。是否需要在 glossary 中补充"3 个学习场域 = 3 学习场域"作为等价表述？建议：保留多种自然表述，不强制统一。

2. **"管理员"定义冲突**：
   - glossary § 3："管理员 = HR + 项目运营合称（管理端用户）"
   - 03-roles-and-ports:21："本文「管理员」=「admin + HR + 项目运营」三者总称"
   - 01-personas:138："Ora 是管理员（HR + 项目运营 / 同一组人）的 AI 分析师"
   
   **不一致点**：admin 是否纳入"管理员"总称？glossary 排除 admin（因 admin 单独列条目），03 文件纳入，01-personas 排除。建议 glossary 校准说明：广义管理员含 admin / 狭义管理端用户 = HR + 项目运营。

3. **"卡片"后缀一致性**：glossary § 8 写"课程卡 / 任务卡 / 知识卡"（无后缀），spec 全部用"课程卡片 / 任务卡片 / 知识卡片"（有后缀）。建议 glossary 补"卡片"后缀对齐 spec。

4. **"团队报告 / team report"**：01-personas:339 出现 "team report 历史 + 草稿"，是 5 文件中唯一一处隐式使用，无定义。glossary § 10 已正式列出。是否需要在 § 10 报告中心模块章节正式定义后才能使用——还是 inline 即可？

### 5.2 spec 覆盖度疑点

5. **02-methodology:96 "4 大核心特质"** 表头标注 "4 大"，但下方仅列 3 条（Teacher Credibility / 越用越懂 / 按场域差异化）。是 spec 内部 bug，**不属术语问题**——但建议提示其他 Agent 注意。

6. **§ 5.3.1 大厅辅导（Project 级 + Module 级 context）** 章节标题写"Project 级 + Module 级"但表格只列 Project 级 3 项（领域知识工具库 / 辅导场景库 / 案例库）。Module 级未展开。**不属术语问题**。

### 5.3 术语层级判断

7. **"FEEDBACK_COLLECT / FEEDBACK_REVIEW 双头配对"**：是新术语还是 SCO 类型细节？建议在 glossary § 5 SCO 类型清单中补全 9 类 SCO（不是 4 类），这是最大的 glossary 缺口。

8. **5 大理论各自方法论术语**（CLT / ZPD / Bloom 6 层 / Dreyfus 5 级 / 苏格拉底 / 费曼 / Mastery Learning / Deliberate Practice / Mezirow / Greif / Schein / 复杂反映 等）—— 算"产品术语"吗？建议：作为方法论引用术语，glossary § 6 可以仅列顶层 5 大理论底座 + 一句"具体引用见 § 2.4 / § 2.3"。不必逐一收录。

9. **"4 库内容（笔记 / 高光 / 工具 / 成果）"**：5 文件中作为学员个人学习成果汇集结构出现 2 次（01-personas:328,338）。是否独立成 glossary 条目？建议加入 § 8 卡片与产出（与"我的高光区"并列）。

### 5.4 跨文件交叉证据

10. **memory_id**：03 文件未出现（合理——是数据模型概念），但 01-personas（Persona 章节）和 04-data-model（数据模型章节）都出现，且 § 5.2.4 SCO 类型表中"FEEDBACK_COLLECT + FEEDBACK_REVIEW"用 memory_id 串联。建议 glossary 明确这是 § 7 三级记忆体系的 ID 标识，跨场域引用与可追溯的核心字段。

11. **"未来场域"**：5 文件中明确列了 inquiry / assignment / sandbox（沙盘）三个，**glossary § 4 已列出**，一致。02-methodology:111,363 / 04-data-model:212-216 表述均一致。

12. **"高光识别 / 高光卡片"**：glossary § 8 已列，但 5 文件中只在 02-methodology § 2.6 出现完整定义（包含识别条件 + 推送位置 + 卡片产出），其他文件只引用。建议 § 2.6 卡片产出节作为 5 类卡片的 Truth Source 在 glossary 中明确指引。

### 5.5 工具型术语（不确定是否计入）

- **GROW / SBI / STAR / SMART / OKR / KPI / RACI / WBS / POLC / Mintzberg 十角色 / 90 天上任规划 / PIN 法 / 推拉沟通法 / 干系人地图 / 1on1 / 3P 会议 / 双因素理论 / 情境授权理论** 等：05-data-model:266-274 Course 清单中大量工具术语 + 02-methodology STAR 示例多次使用。这些是**内容侧术语**（基层管理课程内容），不是产品术语，**不建议**进 glossary。

---

**报告完成。**
