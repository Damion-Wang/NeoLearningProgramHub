# AI Teacher — Progress Tracker

**Project:** ai-teacher（睿学）
**Started:** 2026-04-08
**Language:** 中文
**Mode:** Full Mode

## Phase 0-8 · 业务规划草稿期（2026-04-08 ~ 04-09）

- [x] Phase 1: Intake Interview — completed 2026-04-08
- [x] Phase 2: Brainstorm — completed 2026-04-08, selected Variant 1 (short-term) + Variant 5 (long-term)
- [x] Phase 3: Market Research — completed 2026-04-08, 4 waves (11 agents), 11 raw files + 5 synthesized reports
- [x] Phase 3.5: Research Gate (Go/No-Go) — completed 2026-04-08, GREEN LIGHT
- [x] Phase 4: Strategy — completed 2026-04-09, 5 docs
- [x] Phase 5: Brand — completed 2026-04-09, 3 docs
- [x] Phase 6: Product — completed 2026-04-09, 3 docs
- [x] Phase 7: Financial — completed 2026-04-09, 3 docs
- [x] Phase 8: Validation — completed 2026-04-09, 6 docs
- [x] Final Deliverables — completed 2026-04-09, README.md + action-plan-30-days.md

## Phase 9 · 产品 spec 设计与审阅（2026-04-13 ~ 04-22）

- [x] **2026-04-13** 项目结构升级：建立 00-public/ 1-product/2-business/3-tech/4-decisions/5-process/6-content 六大区
- [x] **2026-04-14** DM_Temp 工作区建立，开始 spec/design 全量审阅准备
- [x] **2026-04-20 ~ 04-22** spec/design 17 个文件全量审阅完成（learner 7 + management 5 + common 3 + requirements + future-iterations + reviews），16 个标记 [已审阅]
- [x] **2026-04-22** requirements-v0.4.0 完稿：5 AI 角色架构、4 场域定义、AOM 5 层模型、双端口、模块清单、ADR 索引
- [x] **2026-04-22** 22 项跨文档逻辑审计完成（数据一致性/AI 记忆/角色边界/场域跳转）

## Phase 10 · 原型规划与构建（2026-04-22 ~ 04-23）

- [x] **2026-04-22** 3 轮 5 角色辩论完成（13 旅程 → 18 快照 → 11 HTML 详细 brief）
- [x] **2026-04-22** 原型 Round 1：build/ 目录 11 个独立 HTML 完成（每页对应 1 个 spec 模块）
- [x] **2026-04-22** Round 2 视觉/交互调整：场域抽屉统一、Neo 形象内联、笔记球同步、热力图修复
- [x] **2026-04-23** 原型 demo v1.1：12 个自包含 HTML（含 base64 资源内联），双账号支持，11 条 DoD 修复全部通过

## Phase 11 · Spec 反向补充与项目整理（2026-04-23）

- [x] **2026-04-23** Spec 反向补充 18 条来自 demo 实践的设计决策
  - 新建 2 文件：`learner/07-discovery-library.md` + `common/03-ai-brand.md`
  - 修改 13 已审阅文件追加"反向补充"章节
- [x] **2026-04-23** 项目目录全面整理：
  - 删除 4 空 Temp 目录 + 5 占位目录 + 99 散落 PNG + .playwright-mcp 缓存
  - DM_Temp 内容归档到 5-process/debates/ 和 5-process/journal/
  - 教学素材归档到 6-content/grow-coaching-source/
  - 教室 HTML 参考归档到 01-ref/prototype-references/
  - 保留 00-public/product-V-0.2.0-D-4.0/prototype/build/ + assets/ 作为持续在编基线
- [x] **2026-04-23** CLAUDE.md 全面重写：从 SDD 豁免单声明扩展为 AI 入门完整手册（关键路径+核心约束+工作流+Checkpoint）
- [x] **2026-04-23** 创建 4 个项目级 Skills：
  - `multi-round-debate` — 5 角色辩论生成产品决策
  - `session-opener` — 开场仪式：昨日续接+今日待办
  - `completion-gate` — 完成门控：测试+文档+commit+决策 4 件套反问
  - `git-push-guard` — 推送守门员：cleanup+progress+readme 三联检查

## Phase 12 · 0424 会议反向补充与底层建设期（2026-04-23 ~ 04-26）

- [x] **2026-04-23** 0424 会议（13 小时）原始资料归档 + 1503 行会议记录分析
- [x] **2026-04-25** 0424 spec 差异 31 条逐条决策完成（6 红线 / 14 补充 / 11 新议题）
- [x] **2026-04-26** Round-1 调研策略辩论 + 三大底层原则确立：
  - P1 第一性原理（Neo = 1v1 线下老师 + 7 动作）
  - P2 懂你 · 记忆系统底层原则
  - P3 像人 · Soul/Persona 底层原则
- [x] **2026-04-26** Leo 完全取消（spec 全文清理 22 文件 198 处 + 9 处 git conflict 解决 + 重命名 01-hall-leo→01-hall）
- [x] **2026-04-26** 底层建设期调研完成 · 12 份产出 ~80K 字：
  - B1 内化（4 份 gap 扫描 coaching-skills/GROW/FLM/spec + 综合 gap）
  - B2 外部（5 份 r1-r5 教育/数据集/真人/记忆/Persona）
  - HBR 91 集元数据 + 下载脚本（mp3 ~3.37GB 本地素材，不入仓库）
  - HR 访谈本期取消 → 改研发后天使客户试用调优
- [x] **2026-04-26** 50 题 PM 决策互动完成（Meta 3 + P1×10 + P2×10 + P3×10 + 数据集×5 + 业务×10 + 其他）
- [x] **2026-04-26** 研发 know-how 参考资料库建立：
  - `00-public/4-decisions/底层建设期-2026-04-26/` 8 个子目录
  - 0-最终决策总览 / 1-原则与框架 / 2-Neo-Persona / 3-记忆系统 / 4-教学方法论 / 5-数据集与样本 / 6-原始调研 / 7-早期文档（标注「已被替代」）
  - Neo Soul final（aaronjmars/soul.md 5 文件结构 + Teacher Credibility 顶级 + 不当舔狗 + 按场域差异化）
  - Memory 设计原则（5 层渐进画像 + Khanmigo 双重架构 + 不靠 RAG）
  - 7 动作理论家庭（Knowles/Kolb/Action Learning/ICF/Hattie/Dweck/Khanmigo）
- [x] **2026-04-26** CLAUDE.md 升级到 11 条核心约束（加 P2 / P3 / PM 协作风格 4 项锁定）
- [x] **2026-04-26** 多个 README 同步更新（根/00-public/4-decisions/spec/learner/feature-tree/02-temp）

## Phase 13 · v0.5.0 大纲与全文扩充期（2026-04-27 ~ 进行中）

> 底层建设期 know-how 锁定后，进入产品 spec v0.5.0 重写——以 plan/ 三件套（更新计划 + 大纲 + 全文）作为过渡产物，DM 一节一确认逐节扩充。

- [x] **2026-04-27** spec/plan/ 目录建立 + 三件套交付：
  - `01-spec-update-plan-2026-04-27.md`（v0.4 → v0.5 更新计划，10 节，含 D-01~D-10 待拍板议题）
  - `02-v0.5.0-outline.md`（v0.4 大纲，10 节 1500 字精简版）
  - `03-v0.5.0-full.md`（全文扩充版，~18000 字 ★ 进行中）
- [x] **2026-04-27** 品牌命名锁定：
  - 产品 = 睿学（NeoLearning）
  - 本期交付物 = 睿学培训项目（NeoLearningProgram）
  - 禁用词：AI TUTOR / AI tutor / AI 老师
- [x] **2026-04-27** 03 全文 § 1-§ 6 完成（含多轮 DM 反馈修订）：
  - **§ 1 愿景**——3 方价值（学员 / 企业 HR / 项目运营）/ "学了 vs 会了"辨析 / 是 vs 不是 6 维对比 / 1.7 内容示例
  - **§ 2 Neo 教学方法论**——5 大方法论（CLT/ZPD/Bloom/Dreyfus/苏格拉底+费曼）/ 4 维感知信号 / 8 学习信号 / 7 教学动作详解（含 STAR 示例）/ 5 场域 × 7 动作矩阵 / 4 层行为约束 / 教学边界
  - **§ 3 Agent Persona**——总分共结构（双 Agent 总览 / Neo / Ora / 共享原则）/ 数据空间 3 层架构图 / Ora 立场两层平衡（raw 不改 vs 报告呈现尊重管理员）
  - **§ 4 角色与端口**——3 端架构（学员端 / 管理端 / 产品运营端短期非产品化）/ 4 类角色对照（学员 / HR / 项目运营 / 产品运营）/ 命名澄清（项目运营 vs 产品运营）
  - **§ 5 数据模型 AOM**——产品视角 3 大问题（是啥 / 怎么生产 / 演绎什么效果）/ 5 层结构 + 术语映射（技术 Project/Module vs 用户 Program/Course）/ asset 替代 segment / KGP 产物按层级组织 / 自适应本期 scope（asset 多版本 + 大厅推荐 Activity）
  - **§ 6 项目全生命周期**——8 阶段 + program config 全阶段功能矩阵 + 服务周期 vs 项目周期二元 + admin/管理员/学员 三层账号
- [x] **2026-04-27** 关键产品决策锁定：
  - 学员侧本期 3 场域（lecture / practice / recap）+ 调研 / 作业 / 沙盘 等列未来
  - 服务周期开营后锁定（开营前 admin 可改）/ 项目周期开营后可改（严格确认）
  - 学员上限 / 内容范围 签单即锁定，学员上限本期 100
  - 试运行项目独立实例 + KGP 试用版 Course Pack（NeoLearning 自我介绍候选）/ 数据本期不迁入正式项目
  - team report 是核心交付引擎（中期 / 半程 / 结项 共用，本期优先做结项 prompt 模板）
  - 个人结营报告本期不做 / 小结 Activity 由 AOM 编排属于学习期
  - 数据交付分层：管理端产物可导出 / 原始学习记录不导出（防反推产品功能）
  - 结营后保留完整继续学习能力 / phase 标记区分新旧记录
- [x] **2026-04-27** 1-product/README + spec/README + spec/plan/README 同步更新（含研发新人阅读路径）
- [x] **2026-04-27** memory 新增：品牌命名规则 + 产品价值 vs 内容价值不能混（feedback）
- [x] **2026-04-27** § 6 章节结构整理 + 04-v0.5.0-backlog.md 创建：
  - § 6.10 全阶段功能矩阵 移到 backlog
  - § 6.6 详细配置（里程碑 3 类细则 / 催学规则 4 维度 / 平台个性化字段表）全部移到 backlog
  - § 6 各章保留产品生命周期视角内容；详细配置 / UI / 字段细节统一到 backlog 作为 § 8 管理端 + program config 详细设计阶段输入
- [x] **2026-04-27** § 6.6 学习期 50 题决策完成（A-F 板块 50 个产品决策点）：
  - 锚点重命名为**里程碑（Milestone）** + 完整设计（必选结营 + 可选中期 + 自由插入 10 + 关联动作 4 类）
  - 里程碑触发 team report 草稿生成 + 站内前 3 天提醒 + Ora 当天提醒（两套提醒机制）
  - 每管理员独立报告库 + 独立草稿副本（本期不做协同分享）
  - 催学规则本期 scope：全员 + 仅站内 + 模板变量 + 不设频率上限 + 完整投递日志（不支持回应）
  - 异常学员判定：脱训（连续 X 天未登录）+ 进度落后（按 Activity 粒度）系统标识 + 运营手动选人催
  - 平台个性化可改：Logo / 品牌色 / 欢迎语 / 项目名 / Neo Ora 名字；不可改：自定义域名 / 字体 / 证书徽章 / Hero 企业定制；powered by NeoLearning + 大模型安全声明不可替换
  - 学员个人可选男 Neo / 女 Neo 形象
- [ ] § 6.7 阶段 6 结营（待审）
- [ ] § 6.8 阶段 7 剩余服务期（待审）
- [ ] § 6.9 阶段 8 归档（待审）
- [ ] § 7 学员端（待启动）
- [ ] § 8 管理端（带 50 题决策落地的代办）
- [ ] § 9 通用 + § 10 跨模块系统
- [ ] 全文完成后拆分到 spec/design/ 各文件

#### Phase 13 下阶段代办（来自 50 题决策）

**§ 8 管理端 详细设计需消费 50 题输出**：

- team report 引擎：每个管理员独立报告库 + 独立草稿副本 + Ora 提醒机制（详见 § 6.6.3）
- team report prompt 模板：由里程碑配置时填的"关联动作 / 评估要点"驱动生成（不是选模板 / 不手写）
- 看板：Ora 双交互模式（被动呈现 vs 主动问答）
- 投递日志：催学推送的"谁收到 / 是否查看 / 是否点击"完整记录

**§ 8.3 program config 详细设计**（D 板块 6 题延后议题）：

- Q25 program config 中"里程碑"是独立 tab 还是嵌入项目信息
- Q26 锚点配置页面提供日历视图还是列表视图
- Q27 创建自由锚点是表单方式还是更简单
- Q28 4 种预设模板启用后是否自动批量插入
- Q29 默认结营锚点能否改名 / 改日期（已答可改，UI 实现细节）
- Q30 锚点编辑后是否需要二次确认

**Hero 形象设计**（§ 7 学员端 / § 9 通用）：

- 学员个人设置中"选男 Neo / 女 Neo"的 UI 位置
- 默认值与切换体验
- Ora 无形象的视觉呈现策略

## Phase 14 · 平台 / Agent 构建（待启动）

v0.5.0 全文完成 + 拆分到 spec/design/ 后进入研发对接：
- 研发拿到底层建设期 know-how 库 + v0.5.0 spec 启动平台 / Agent 构建
- DM 主导 PRD + 用户故事 + 关键对话场景生产
- 研发后天使客户试用调优
- 不预设时间，研发能力决定节奏

## Notes · 核心商业要点

- 双引擎架构：NeoLearning（高客单价项目）+ Neo Course（规模化平台）
- 核心卡点：Neo 产品形态未定，连锁阻塞 KGP 产品化
- 数据来源：创始团队访谈 + Q2-Q3 商业化 Presentation
- 母公司存量 1700+ 大企业客户，60 家天使用户已筛选
- Q2-Q3 收入目标：1,300-1,600 万

## Phase 13 · v0.5.0 spec 全文 + 4 维审查修复（2026-04-29 推进）

**§ 7 全局功能 / § 8 学员端 完成 + 4 维审查 + 全量修复**：

- § 7 全局功能（用户级 + 平台级）100 题 PM 决策落地（2026-04-28）
- § 8 学员端 50 题 + 大厅 4 区域 + Neo 辅导能力体系（含 6 维感知图谱意愿度画像）（2026-04-28）
- § 8 内部小节：Neo 辅导（A 角色 + B 能力 + C 行为）/ 看板（项目总览 + 内容目录 + 学习成果 + 社区窗口）/ 笔记悬浮球（2026-04-28）
- spec 重构 4 维审查 skill 验证（全局 / 中局 / 细节 / 关联 4 Agent fan-out + 1 合并 Agent fan-in）发现 53 task + 5 冲突,PM 逐项决议（2026-04-29）
- 修复执行 4 阶段（G1-G4 全局调整 + cross-ref + 单点替换批量 + 结构优化）（2026-04-29）：
  - G1 章节号大调整：§ 7 拆 2 章 → § 7 用户级 + § 8 平台级 / 学员端 → § 9 / 管理端 → § 10
  - G3 § 2.3 情绪 4 类 → 10 状态统一颗粒度
  - G4 场域口径锁定：本期 = 大厅 + 3 个学习场域,inquiry 预研,其他规划级
  - R10/R11/R13 批量错字 / AI 老师 / 代办 / 不脱试 等
  - R14 § 9.1 学员端总览补全（旅程图 + 模块清单 + 入口路径 + 与 § 4.2/§ 6 对应关系）

**关键产出**：
- 03-v0.5.0-full.md（2843 行,§ 1-§ 9 完整）
- 04-v0.5.0-backlog.md（标题体系对齐 spec § X.Y.Z）
- plan/05-v0.5.0-section-7-9.md（§ 9 管理端草稿,待后续合并）
- claude-workspace/review/03-full/（4 维审查 6 个产出文件 + 修复 task list v2）
- claude-workspace/backup/03-v0.5.0-full.backup-2026-04-29.md（修复前完整备份）

---

## Phase 14 · V-0.2.0 目录归集 + 临时区拆分（2026-04-29）

**项目命名 + 版本号体系建立**：

- 项目内部名：`AI_TUTOR_PROJECT · 睿学业务规划` → **`20260408睿学program版产品规划`**
- Git 仓库名（待 GitLab 后台改名）：`AI_TUTOR_PROJECT` → **`NeoLearningProgramPRD`**
- 版本号体系启用：
  - 产品版本 V-0.2.0（用到 6 月交付）
  - 文档版本 D-4.0（已审阅 spec + 原型）/ D-5.0（v0.5.0 plan/ 草稿）
  - 三件套表达：① 顶层目录名 `product-V-0.2.0-D-X.0/` ② 文件 frontmatter ③ VERSION.md / README banner

**目录重组**：

- 新建 3 个目录：
  - `00-public/product-V-0.2.0-D-4.0/`（spec 17 + feature-tree 13 + prototype 11）
  - `00-public/product-V-0.2.0-D-5.0/`（plan 6）
  - `claude-workspace/`（Claude 临时区）
- 迁移文件 ≈ 54 项：
  - 1-product/spec/design/* → product-V-0.2.0-D-4.0/spec/（去 [已审阅] 前缀）
  - 1-product/feature-tree/* → product-V-0.2.0-D-4.0/feature-tree/
  - DM_Temp/prototype/* → product-V-0.2.0-D-4.0/prototype/
  - 1-product/spec/plan/* → product-V-0.2.0-D-5.0/plan/
  - 02-temp 5 项 → claude-workspace/（cleanup-plan + 2 gap-report + backup + review/03-full）
  - 02-temp 余下 10 项二次分流 → claude-workspace/archive/2026-04/（DM 复审发现这些"会议笔记"实为 Claude 整理产出，不是 DM 自己打字写的）
  - common/03-ai-brand.md 跨目录 → 2-business/brand/ai-brand.md
- 删除 2 个目录：`00-public/1-product/` + `DM_Temp/`
- 文件名仅去 `[已审阅]` 前缀，其他不动

**临时区职责拆分（核心约束新增）**：

- `02-temp/` = DM 临时区（DM 自己的临时改动、会议笔记、产品思考、未定型笔记）
- `claude-workspace/` = Claude 临时区（行动规划、gap 报告、备份、审查产出、执行 log）
- 两区职责清晰分离

**版本元信息加载**：

- 所有 D-4.0 spec / feature-tree 文件加 frontmatter（version + status: reviewed + last-updated）
- D-5.0 plan/ 文件加 frontmatter（status: draft）
- D-4.0/spec/learner/07-discovery-library.md 单独 status: unreviewed
- 11 个 HTML 加版本注释
- 各级 README + VERSION.md 写明版本号

**引用更新**：

- CLAUDE.md 全部路径引用更新 + "底层建设阶段（当前）" 章节同步改为 "V-0.2.0 / D-5.0 spec 推进期"
- 顶层 README.md 重写 + 项目改名
- 00-public/README.md 重写
- 02-temp/README.md 重写为 DM 区声明
- claude-workspace/README.md 新建为 Claude 区声明
- 使用手册.md 重写
- .gitignore 更新（删 DM_Temp 行 + 加新原型 ref 路径）
- 2-business/README.md + brand/README.md 加 ai-brand.md 引用
- .claude/skills/git-push-guard / completion-gate 路径示例更新

**关键产出**：

- claude-workspace/cleanup-plan-2026-04-29.md（v3 方案，3 轮迭代）
- 00-public/product-V-0.2.0-D-4.0/{README,VERSION,prototype/README}.md（新写）
- 00-public/product-V-0.2.0-D-5.0/{README,VERSION,plan/README}.md（新写）
- claude-workspace/backup/old-readmes/（1-product 老 README + DM_Temp 老 README 备份）

**Phase 14 退出阶段**：

- ⏳ Phase 8（DM 待办）：GitLab 后台改名 → 给 Claude 新 URL → set-url + push

---

---

## Phase 15 · § 10 管理端全章 + backlog 清理（2026-05-04）

**§ 10 管理端 5 模块 + Ora Truth Source 全部完成**：

- § 10.1 管理端总览（含 § 10.1.6 Ora 双实例 + 4 类卡片 Truth Source）
- § 10.2 首页 Home（看板区 3 维度 + Home Ora 区 + 系统约束 + GUI 布局）
- § 10.3 报告中心 Report Center（报告库 + 报告编辑 + Report Ora + ChatBI 6 类图表 + 模板生成样例）
- § 10.4 项目配置 Program Config（双态切换 + 6 配置板块 + 系统约束 + GUI 布局）
- § 10.5 消息中心 Message（消息管理 + 消息编辑 + 草稿 + 定时发送 + 8 项审查修复）

**所有 § 10 子节均经 10 题 PM 审查 + 修复闭环**（每模块 10 题确认 / 决议落地）。

**红线校准**（影响 § 3.4.4 + § 9.3.3）：
- 完成态 recap raw → 管理端可读 / 非完成态不读
- 6 维画像可见性同步：管理端独立 widget = § 10.2.2.2 (4) 个体详情面板内的快照

**backlog + section 清理**（2026-05-04 / 按 CLAUDE.md "三层文档定位"原则）：
- backlog 从 835 行 → 删除（D 板块 6 题嵌入 § 10.4.4 / § 4.2 4 场域调整嵌入 § 4.2 章末）
- section 从 750+ 行 → 删除（全部已合并到 03-full）
- 03-full 现 6829 行 / **唯一持久 spec**
- full 中 10 处反向引用全部清理（无残留 backlog 链接）

**关键产出**：
- 03-v0.5.0-full.md（6829 行 / § 1-§ 10 全部完成）
- 备份：claude-workspace/backup/03-v0.5.0-full.backup-2026-05-04-pre-10.X-merge.md（5 个）+ pre-cleanup 备份
- plan/ 目录精简到 4 文件：README + 01-元规划 + 02-outline + 03-full

---

---

## Phase 16 · 03-full 全局审查 + Debate + 临时文件归档（2026-05-04）

**4 维 fan-out 审查**（4 Agent 并行）：
- A · PM 功能合理性（8 问题 / 7 冗余 / 5 缺失）
- B · Tech Lead 研发可理解度（10 问题 / 5 概念模糊 / 5 接口不清）
- C · New Reader 可读性（10 卡点 / 282 处跨章引用 / 10 修订建议）
- D · Doc Architect 丛书拆分（推荐方案 1 · 按角色端口拆 3 册 · A 总册 + B 学员端 + C 管理端）

**5 角色 Debate**（创始 PM / 资深研发 / 新手研发 / 客户 HR / 文档架构师）针对 7 核心争议议题。

**DM 反向讨论**（基于 CLAUDE.md 11 条 + memory + session 风格）挑战 Debate 结论 / 4 项反转：
- 议题 2 recap 双层 + milestone 保留（DM 反 Debate 砍议）
- 议题 4 管理端 Home Ora 区保留（Debate 把 Home 误读为学员端）
- 议题 5 Report Ora 4 路 拒绝盲砍 / 先做 5 路 × HR 工作流映射表
- 议题 6 技术对接附录留 03-full 附录（DM 反 Debate 拆议）

**修订执行**：
- Q4 § 6.1.2 + § 6.1.3 阶段命名合并 + 统一后续标题
- Q5 § 2.3 banner forward refs 删
- Q8 跨章引用减少 18 处（6 dead refs 修 + 12 forward refs 删）
- 03-full 6829 → 6822 行

**临时文件清理**：
- 04-backlog + 05-section（先期清理 / 备份在 `claude-workspace/backup/`）
- 01 元规划 + 02 大纲 归档（plan/ 仅留 03-full + README）

**审查报告**：`claude-workspace/audit-report-2026-05-04.md`（全审查 + Debate + DM 反向 + 修订执行清单）

---

---

## Phase 17 · D-5.0 spec 拆分 + 全文件审阅 + 全局术语校准（2026-05-05 ~ 05-06）

**spec 拆分到 6 板块 17 文件**（2026-05-05）：

- 03-full（6822 行单体）→ 拆为 `spec/` 目录树：
  - `01-vision【已审阅】.md`
  - `02-foundation/`（01-personas / 02-methodology / 03-roles-and-ports / 04-data-model 4 个）
  - `03-lifecycle/`（01-pre-learning / 02-learning / 03-completion 3 个）
  - `04-global/`（01-user-global / 02-platform-global 2 个）
  - `05-learner/`（01-overview / 02-hub / 03-lecture / 04-practice / 05-recap / 06-cross-context 6 个）
  - `06-management/`（01-overview / 02-home / 03-report-center / 04-program-config / 05-message 5 个）
- 每个文件加 frontmatter（version + product-version + doc-version + source + source-range + source-section）

**全文件单文件审阅 + 全部标记【已审阅】**（2026-05-05 ~ 05-06）：

学员端 6/6 + 管理端 5/5 + 02/03/04 板块全部已审阅。每个文件 review 流程：
- Agent 单文件审查（4-7 维：术语 / 章节编号 / 跨文件引用 / 一致性 / 结构 / 等）
- DM 拍板必修 + 建议 + 提示议题
- 执行修复 + 自检 + rename 标记

**关键术语校准**（DM 多轮决议 / 全 spec 同步）：

- **AOM 完成事件命名**：`recap milestone` → `Course 完成事件`（2026-05-05）→ `Activity 完成事件`（2026-05-06 因歧义校准）
- **报告内容层命名**：`首聊层` / `首聊报告` → `完成事件层`（2026-05-06）/ `首聊回顾`（学员可见标题）→ `首次回顾`
- **报告体系双层命名**：`综合汇报` → `综合报告`（平台模板名） vs `结项报告`（业务环节名）
- **场域口径**：`4 场域` 旧口径 → `学习核心层 3 场域 + 大厅`
- **token / 互动量**：统一为 `互动次数`
- **不分子态** → `不再细分`
- 同步 glossary（claude-workspace/spec-review-2026-05-05/）+ 03-full 源文件

**5 场域 × 5 卡片矩阵全局重做**（2026-05-06 / Truth Source = § 9.4.4.2）：

DM 多次决议综合 → lecture/practice/recap 三场域卡片产出口径全局一致：

| 场域 \ 卡片 | askUQ | 课程 | 高光 | 任务 | 知识 |
|---|:--:|:--:|:--:|:--:|:--:|
| 大厅 Hall | ★ | ★ | ✓ | ★ | ★ |
| lecture | — | — | ★ | ✓ | — |
| practice | ✓ | — | ★ | — | ✓ |
| recap | ✓ | — | ✓ | ★ | ✓ |

各场域 spec 内同步加 4 阶段/4 状态卡片矩阵子表（lecture § 9.3.1.4.5 / practice § 9.3.2.7.3 / recap § 9.3.3.9.2 后）。

**关键 spec 改动**（按文件）：

- **05-recap**：多版本/打标范畴外移 / Activity 完成事件全文 56 处 / 完成事件层重命名 / 4 状态卡片矩阵
- **06-cross-context**：5×5 卡片矩阵全局重做 + 备注重写 / 跨文件引用错位 2 处
- **04-practice**：4 阶段卡片矩阵新增 / 知识卡 — → ✓（复盘+报告）/ practice 多版本+打标范畴外移
- **02-hub**：line 160 三类卡片仅大厅推 → 仅课程卡仅大厅推
- **03-report-center**：综合汇报→综合报告 9 处 / 4 类卡片补"卡" / milestone vs Activity 完成事件 区分 / 模板选择字段提前到第 2 项
- **04-program-config**：人员名单变更精细化（总数锁 + 未登录可换 + 已登录不可换 / 沿用 § 6.6.5 SOP）/ 沿用→详见 / Q25-Q30 删 / admin/HR 表述统一 / 品牌色明确"本期不开放"
- **05-message**：投递状态统一 / CTA 编号校齐 / § 10.1.6.1 引用校齐 / P7+P8 优化
- **03-lifecycle/02-learning**：§ 6.6.6 删品牌色（与 § 10.4 解决冲突）

**全局同步影响**：

- **plan/03-v0.5.0-full.md**（源文件）反向同步全部上述改动
- **claude-workspace/spec-review-2026-05-05/glossary.md** 决议表更新
- **plan/README.md** 综合汇报 → 综合报告

**关键产出**：

- spec/ 目录树 17 文件全部【已审阅】（学员端 6 / 管理端 5 / foundation 4 / lifecycle 3 / global 2 / vision 1）
- claude-workspace/spec-review-2026-05-05/ 决议表 + 各文件 review log
- claude-workspace/backup/ 多份 pre-merge / pre-split 备份

---

## Phase 18 · D-5.0 全量术语校准 + 编号重建 + 引用替换 + 03-full 退场（2026-05-06）★

**T1 术语校准**：
- 4 Agent fan-out 扫 21 spec 文件 / 提取 377 术语候选 + 63 废止候选 + 53 校准
- 1 合并 Agent 去重 → 162 新增 / 0 真废止 / 27 校准 / 2 残留 fix / 11 spec bug / 8 关键议题
- DM 8 议题决议（2 批 4 问 × 2）：
  - 议题 1：3 场域 + 大厅（不算场域 / lecture / practice / recap / 未来 inquiry 留口）
  - 议题 2：管理员 = 角色 / admin = 账号 / 两维度严格区分（不存在广义/狭义）
  - 议题 3：5 类卡片带"卡片"后缀（askUserQuestion 例外）
  - 议题 4：4 库标准名 = 我的报告 / 我的高光 / 我的工具 / 我的笔记
  - 议题 5：session 禁用约定不入 glossary
  - 议题 6：报告体系矩阵汇总表加入 § 10
  - 议题 7：自由复习统一名（lecture/practice/recap 全用此名）
  - 议题 8：新增 § 15 管理端架构术语（30+ 术语 / Home/Report Center/Program Config/Message/Home Ora/Report Ora/HITL/双态/6 配置板块 等）
- glossary v2 更新（229 行 → 757 行 / 14 节 → 15 节 / ~100 → ~250 术语）
- 2 残留 fix：考研→考核 / 4 学习场域→3+大厅
- 自由探讨→自由复习 11 处统一（04-practice）

**T2 编号重建（每文件独立编号）**：
- 21 文件 393 章节标题重写
- prefix 升级量：1 段 13 文件 / 2 段 6 文件 / 3 段 3 文件（lecture/practice/recap）
- 每文件从 § 1 起 / frontmatter 加 `numbering: per-file-independent`
- 编号映射表 1192 行（403 跨文件引用条目）

**T3 引用替换**：
- 622 引用全量替换
- 跨文件引用：`[文件名 § X.Y]` 格式（如 `[05-learner/05-recap § 1.2.3]`）
- 自引用：`§ X.Y` 格式
- 范围：21 spec + glossary + 顶层 README/CLAUDE.md
- 多次 rate limit 中断 / 重启 Agent 续做（4 板块 fan-out → 续做 G1/G2 + 主线程补漏）

**T4 收尾**：
- ✅ glossary 持久化：`claude-workspace/spec-review-2026-05-05/glossary.md` → `spec/00-glossary.md`（加 frontmatter 对齐其他 spec）
- ✅ plan/ 退场：删除 03-v0.5.0-full.md（6829 行 / 单体源文件）+ 04-toc-tree-2026-05-05.md
- ✅ claude-workspace/ 退场：14M / 含 backup/archive/term-audit/review/spec-review/ref 全部清理
- ✅ CLAUDE.md 重写：核心约束 14 条更新（场域统一 / spec 改动方式 / 临时区 / 管理员 vs admin）/ 关键路径重写 / 加 Phase 18 历史
- ✅ README.md 重写：spec 路径改为 22 文件 / 删 plan 引用 / 删 claude-workspace 引用

**T5 文档增补**（2026-05-06 补 / commit 3 + commit 4）：
- ✅ **CHANGELOG.md 创建**（spec/CHANGELOG.md / 1036 行）：D-4.0 → D-5.0 内容变更说明 / 由总到分 / 功能模块级
  - 总览 10 条最重大变更
  - 关键术语对照表 ~30 项
  - 24 个功能模块逐一对比（D-4 怎么说 / D-5 怎么说 / 主要变更 三段式）
  - 模块映射表（D-4.0 17 文件 → D-5.0 22 文件）
  - 推翻清单 ~25 项（Leo / Inquiry 场域 / QA SCO / ASSESSMENT_TAG / Segment / 综合汇报 等）
  - 新增清单 14 体系分组 ~150 项概念（三大底层原则 / 7 教学动作 / 4 维感知 / 6 维画像 / Activity 完成事件 / 三角色协作 / 管理端 § 15 等）
- ✅ **6 板块 README 全量创建**（spec/ 顶层 + 5 子目录）：
  - spec/README.md（顶层导览 / 22 文件 / 4 类阅读路径）
  - spec/02-foundation/README.md（基础 4 文件）
  - spec/03-lifecycle/README.md（3 文件 + 8 阶段总览）
  - spec/04-global/README.md（用户级 vs 平台级边界对比）
  - spec/05-learner/README.md（6 文件 + 大厅是中枢层说明）
  - spec/06-management/README.md（5 文件 + Ora 双实例对照表 + 双态切换说明）
- 每个 README 含：板块定位 / 文件清单 / 推荐阅读顺序 / 关联板块 / 重要约定 / 文件大小参考 6 段式

**关键产出**：
- spec/ 23 文件（21 章节 + 00-glossary + CHANGELOG）+ spec/ 顶层 README + 5 子目录 README = **完整文档树**
- 每文件独立编号 / 跨文件引用清晰 / 术语全量统一
- 临时档全清 / 仓库结构干净

**约束更新**：
- 核心约束 #4 场域统一：旧"4 场域（授课/对练/调研/报告）"→ 新"大厅 + 3 学习场域"
- 核心约束 #6 spec 改动方式：旧 `plan/03-v0.5.0-full.md` → 新 `spec/` 22 文件
- 核心约束 #12 临时区：claude-workspace 退场 / Claude 行动产出收完即清理
- 核心约束 #14（新加）：管理员 vs admin 维度区分

---

## Phase 19 · D-5.1 recap 单文件迭代（2026-05-07 ~ 2026-05-08）

D-5.0 交付后 DM 拉起 recap 重新讨论 + feature-tree 探索两条工作线，最终形成 D-5.1 recap 增量交付。

**1. feature-tree 阶段性探索**（2026-05-06 ~ 07）
- 21 决议（4 前期 + 7 议题辩论 + 10 题确认）
- L1-L2 拆分草稿（F.1-F.4 学员端/管理端/全局/Agent 数据库）
- cross-context 抽象删除 / 笔记悬浮球分散到各场域
- 状态：暂停 / DM 切换到 recap 重新讨论

**2. recap 产品重新讨论**（2026-05-07）
- 4 决议：状态机 4→3 / 报告结构 5→4 / Neo 主动产出 / 知识网络轻处理
- 中欧报告参考资料导入（`01-ref/product-ideas/报告/` 7 文件 / xmind/PPTX/PDF/docx/xlsx）
- 20 题决议（DM 用 AskUserQuestion 拍板）：低数据兜底 / Activity 集合对比 / 文字叙事 + 对话举证 / 行动便签化 / if-then 应用关联 / Neo 双层语气 / 跨课程记忆每章引用 等

**3. recap mock 设计**（2026-05-07）
- 3 mock 实例（基层管理者 8 Course 内容包 / 王芳横向协作 / 李伟辅导反馈 / 陈娟有效授权）
- v6 mock + v7 设计要点 → D-5.1 落地依据

**4. D-5.1 spec 交付**（2026-05-07 ~ 08）
- 新建 `00-public/product-V-0.2.0-D-5.1/`（仅 recap 单文件 / 替代 D-5.0/spec/05-learner/05-recap）
- 主文件 `05-recap.md`：经多轮 DM 反馈 + 多次重构（最终 769 行）
- 重大概念校正：
  - 第 3 章 vs 第 4 章定位（学得 = 内容/能力维度提升 / 表现 = 上课状态评估）
  - 章节顺序重排（综合评估 → 学了 → 学得 → 表现 → 接下来）
  - 6 维画像归属第 4 章（不是第 3 章）
  - 自由复习层提升为第 6 章（与前 5 章并列）
- 17 项问题修复（应用计划入待办机制全文一致 / 删除大量"D-5.1 决议"注解 / 跨课程记忆集中规范 / 删除 § 1.10 本期不做 等）
- § 1.5.3 自由复习态重写为"Neo 解读与辅导行为"（4 类辅导行为）
- 删除头部徽章 / 状态指示节 / 报告产物属性多项

**关键产出**：
- D-5.1/05-recap.md（769 行 / 替代 D-5.0/spec/05-learner/05-recap）
- D-5.1/README.md（D-5.0→D-5.1 变更总览）
- 02-temp/ 9 工作文件（feature-tree 系列 + mock + design + build-plan）
- 01-ref/product-ideas/报告/ 7 参考资料文件

**约束更新**：
- 行动建议时间表达：立即/近期/中期 → **近期/中期/长期**（DM："给的是建议不是命令"）
- 报告结构：5 章 → **6 章**（自由复习独立成章）
- 双层语气规范：报告口吻 ≠ Neo 场域口吻

---

## Next Steps · 下一阶段

**待 DM 操作**：
- GitLab 后台改名 `AI_TUTOR_PROJECT` → `NeoLearningProgramPRD`
- 改完给新 URL，Claude 执行 `git remote set-url origin <new>` + push

**待启动 · 平台 / Agent 构建**：
- 按 D-5.0 spec/ 22 文件 + 底层建设期 know-how 输出工程接口文档
- 选定开发栈
- 试点客户 onboarding（60 家天使用户中 3-5 家先行）
