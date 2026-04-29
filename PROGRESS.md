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
  - 保留 DM_Temp/prototype/build/ + assets/ 作为持续在编基线
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
- 02-temp/review/03-full/（4 维审查 6 个产出文件 + 修复 task list v2）
- 02-temp/backup/03-v0.5.0-full.backup-2026-04-29.md（修复前完整备份）

## Next Steps · 下一阶段

进行中 · Phase 13 余下：
- § 10 管理端（plan/05 草稿,待 PM 决议后合并 03-full）
- 修复完成后再次跑 4 维审查 skill diff 模式验证（可选）

待启动 · Phase 14 · 平台 / Agent 构建：
- 按 v0.5.0 spec + 底层建设期 know-how 输出工程接口文档
- 选定开发栈
- 试点客户 onboarding（60 家天使用户中 3-5 家先行）
