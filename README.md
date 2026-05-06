# 20260408睿学program版产品规划 — NeoLearningProgramPRD

> 睿学（NeoLearning）是面向企业培训场景的 AI-Native 学习陪伴系统，通过"大厅 + 3 学习场域"的空间模型，让 30-40 名基层管理者在项目周期内（典型 6 个月）获得 1v1 老师 Neo 的持续陪伴、结构化课程的自适应学习、沉浸式对练的行为训练，最终产出可举证的行为改变报告。本期交付 = **睿学培训项目（NeoLearningProgram）**。

## 项目状态

**V-0.2.0 / D-5.0 spec 已交付（2026-05-06）** ✅

- D-4.0 已审阅 spec 冻结（2026-04-22 完成 v0.4.0 全部 16 模块审阅）
- 原型 v1.1 交付（2026-04-23）
- 底层建设期 know-how 库完成（2026-04-26）—— 50 题 PM 决策 + Neo Soul final + 三大底层原则
- D-5.0 §1-§10 全文完成 + 4 维审查 + 53 任务全量修复（2026-04-29 ~ 05-04）
- D-5.0 全局审查 + 5 角色 Debate + DM 反向讨论 + 修订执行（2026-05-04）
- D-5.0 spec 拆分（6 板块 17 文件）+ 全文件审阅 + 术语校准（2026-05-05）
- ✅ **D-5.0 全量术语校准 + 编号重建 + 引用替换**（2026-05-06）
  - 术语 v2 决议表（162 新增 / 27 校准 / 8 议题决议 / + § 15 管理端架构）
  - 21 章节文件**独立编号**（每文件 § 1 起 / 393 章节标题重写）
  - 622 引用按 `[文件名 § X.Y]` 格式跨文件 / `§ X.Y` 自引用
  - **03-full 退场** + claude-workspace 过程档清理
- ⏳ **下一步**：等 DM 启动 D-6.0 / 研发对接

关键数字：6 月 MVP、30-40 人/项目、项目周期可配（典型 6 个月）。

---

## AI 角色架构

| 角色 | 位置 | 职责 |
|------|------|------|
| **Neo** | 大厅 + 3 学习场域（学员端唯一）| 1v1 老师 —— **按场域差异化**调用 7 动作（讲授/解惑/讨论/考核/练习/追问/反思） |
| **Actor**（演员） | 对练场域 | 剧本驱动的角色扮演对象 |
| **Director**（导演） | 对练场域（后台） | 剧本驱动，指挥 Actor |
| **Ora** | 管理端 | 数据解读、报告辅助、证据追溯 |

⚠️ **2026-04-26 起 Leo 完全取消**——学员端只有 Neo。Neo 在大厅展现 Coach 能力（陪伴/Bloom引导/情绪感知），进入场域展现 Tutor 能力（结构化教学/AOM 脚本）。

学员端布局 = **大厅（中枢层 / 不算场域）+ 3 学习场域**（lecture / practice / recap）；未来场域 inquiry 等留口。

---

## 从这里开始看

### 1. 研发拿到本目录后第一站

[`00-public/4-decisions/底层建设期-2026-04-26/`](00-public/4-decisions/底层建设期-2026-04-26/) — **研发 know-how 参考资料库**
- 50 题 PM 决策清单
- 三大底层原则（P1 第一性原理 / P2 懂你 / P3 像人）
- Neo Soul final（5 文件结构 + Teacher Credibility 顶级 + 不当舔狗）
- Memory 设计原则 + 数据集与样本（含 HBR 91 集）

### 2. D-5.0 spec（最终交付 ★）

[`00-public/product-V-0.2.0-D-5.0/spec/`](00-public/product-V-0.2.0-D-5.0/spec/) — **22 文件 / 全部【已审阅】 / 每文件独立编号**

| 板块 | 文件 |
|---|---|
| **00-glossary** | 术语决议表 v2（15 节 / ~250 术语 / 含 § 15 管理端架构）|
| 01-vision | 愿景 |
| 02-foundation | personas / methodology / roles-and-ports / data-model |
| 03-lifecycle | pre-learning / learning / completion |
| 04-global | user-global / platform-global |
| 05-learner | overview / hub / lecture / practice / recap / cross-context |
| 06-management | overview / home / report-center / program-config / message |

跨文件引用格式：`[05-learner/05-recap § 1.2.3]`；自引用格式：`§ 1.2.3`。

### 3. D-4.0 已审阅 spec（v0.4.0 冻结基线）

路径：[`00-public/product-V-0.2.0-D-4.0/spec/`](00-public/product-V-0.2.0-D-4.0/spec/)

| 文件 | 说明 |
|------|------|
| [requirements-v0.4.0.md](00-public/product-V-0.2.0-D-4.0/spec/requirements-v0.4.0.md) | **总纲**——产品定义、生命周期、AI角色、模块总览、Scope |
| [spec/README.md](00-public/product-V-0.2.0-D-4.0/spec/README.md) | spec 目录快速导航 |

#### 学员端 (8 个文件)
| 文件 | 说明 |
|------|------|
| 00-overview | 学员端总览 |
| 01-hall | 大厅（Neo 大厅 Coach 能力 + 看板 + 4 库 + 社区占位） |
| 02-lecture-zone | 授课场域 Lecture |
| 03-practice-zone | 对练场域 Practice（Actor + Neo 双栏） |
| 04-inquiry-zone | 调研场域 Inquiry (P3) |
| 05-report-zone | 报告场域 Report |
| 06-notes | 笔记 |
| 07-discovery-library | 发现库（未审阅）|

#### 管理端 (5 个文件)
| 文件 | 说明 |
|------|------|
| 00-overview | 管理端总览（Ora、四模块） |
| 01-operation | 首页 Operation（三维度 + Ora） |
| 02-report-gen | 报告生成 Report-Gen（HITL + Ora） |
| 03-project-config | 配置 Config |
| 04-message | 消息 Message |

#### 通用 (3 文件)
| 文件 | 说明 |
|------|------|
| common/00-overview | 通用栏、端口切换 |
| common/01-general | 账号管理、AI 语速、帮助 |
| common/02-notification | 消息提醒 |

> 原 03-ai-brand.md 已迁到 [`00-public/2-business/brand/ai-brand.md`](00-public/2-business/brand/ai-brand.md)（属业务/品牌资产，非产品规格）

### 4. 原型 v1.1（11 个 HTML）

[`00-public/product-V-0.2.0-D-4.0/prototype/build/`](00-public/product-V-0.2.0-D-4.0/prototype/build/) — 11 个独立 HTML，每页自包含。

---

## 目录结构

```
20260408睿学业务规划/
├── 00-public/                              正式交付物
│   ├── product-V-0.2.0-D-4.0/             ★ D-4.0 已审阅 spec + 原型（冻结）
│   │   ├── spec/                          (17 文件含 README × 4)
│   │   ├── feature-tree/                  (13 文件含 manifest)
│   │   ├── prototype/                     (11 HTML + assets)
│   │   ├── README.md
│   │   └── VERSION.md
│   ├── product-V-0.2.0-D-5.0/             ★ D-5.0 已交付 spec
│   │   ├── spec/                          (22 文件 / 含 00-glossary 术语决议表)
│   │   ├── README.md
│   │   └── VERSION.md
│   ├── 2-business/                        商业分析（含 brand/ai-brand.md）
│   ├── 3-tech/                            技术分析（含 coaching-skills 项目分析）
│   ├── 4-decisions/                       ADR + 主题决策包（含 2026-04-26 底层建设期）
│   ├── 5-process/                         过程记录（辩论 / 日志）
│   └── 6-content/                         课程内容（FLM 17 份 + GROW 12 份）
├── 01-ref/                                外部参考（coaching-skills 项目 / demo 录屏）
├── 02-temp/                               DM 临时区（DM 自己的临时改动、会议笔记、产品思考）
├── .claude/                               Claude Code 配置 + 5 个项目级 Skill
├── CLAUDE.md                              项目协作宪法
├── PROGRESS.md                            阶段性进展
├── 使用手册.md
└── README.md
```

## 更多阅读路径

- **底层建设决策** → [00-public/4-decisions/底层建设期-2026-04-26/](00-public/4-decisions/底层建设期-2026-04-26/)
- **商业背景** → [00-public/2-business/](00-public/2-business/)
- **技术现状** → [00-public/3-tech/](00-public/3-tech/)
- **设计过程** → [00-public/5-process/](00-public/5-process/)
- **使用手册** → [使用手册.md](使用手册.md)
- **AI 协作约定** → [CLAUDE.md](CLAUDE.md)
