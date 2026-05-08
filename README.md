# 20260408睿学program版产品规划 — NeoLearningProgramPRD

> 睿学（NeoLearning）是面向企业培训场景的 AI-Native 学习陪伴系统，通过"大厅 + 3 学习场域"的空间模型，让 30-40 名基层管理者在项目周期内（典型 6 个月）获得 1v1 老师 Neo 的持续陪伴、结构化课程的自适应学习、沉浸式对练的行为训练，最终产出可举证的行为改变报告。本期交付 = **睿学培训项目（NeoLearningProgram）**。

## 项目状态

**V-0.2.0 / D-5.1 recap 增量交付（2026-05-08）** ✅

- D-4.0 已审阅 spec 冻结（2026-04-22）
- 原型 v1.1 交付（2026-04-23）
- 底层建设期 know-how 库完成（2026-04-26）
- D-5.0 spec 全量交付（2026-05-06 / 22 文件 / 每文件独立编号 / 术语 v2）
- ✅ **D-5.1 recap 单文件迭代**（2026-05-07 ~ 08）
  - 替代 D-5.0/spec/05-learner/05-recap（其他 21 文件仍以 D-5.0 为准）
  - 报告结构 5 章 → **6 章**（自由复习独立成章）
  - 章节定位重排（学了→学得→表现→接下来）+ 第 3/4 章重新分配（学得=能力提升 / 表现=上课状态）
  - Neo 双层语气（报告客观 / 场域像人 1v1 老师）
  - 行动建议便签化（近期/中期/长期 / 不带"立即"等强硬话术）
  - 知识网络 if-then 应用关联文字化 / Neo 实时推导
  - 低数据兜底机制 / 跨课程记忆每章引用规范
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
