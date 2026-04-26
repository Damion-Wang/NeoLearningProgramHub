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

## Notes · 核心商业要点

- 双引擎架构：NeoLearning（高客单价项目）+ Neo Course（规模化平台）
- 核心卡点：Neo 产品形态未定，连锁阻塞 KGP 产品化
- 数据来源：创始团队访谈 + Q2-Q3 商业化 Presentation
- 母公司存量 1700+ 大企业客户，60 家天使用户已筛选
- Q2-Q3 收入目标：1,300-1,600 万

## Next Steps · 下一阶段

进入 Phase 12 · 开发对接：
- 按已审阅 spec 输出工程接口文档
- 选定开发栈（评估前后端框架）
- 内部评审 demo（用 prototype/build/ 11 页演示）
- 试点客户 onboarding（60 家天使用户中 3-5 家先行）
