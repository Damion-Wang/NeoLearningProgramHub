# 睿学（AI TUTOR） -- 产品设计项目

> 睿学是面向企业培训场景的 AI-Native 学习陪伴系统，通过"大厅 + 四间场域"的空间模型，让 30-40 名基层管理者在项目周期内（典型 6 个月）获得 1v1 AI 老师 Neo 的持续陪伴、结构化课程的自适应学习、沉浸式对练的行为训练，最终产出可举证的行为改变报告。

## 项目状态

**底层建设期完成 + 准备研发对接**

- 产品规格说明书 v0.4.0 全部审阅完成（2026-04-22）
- 原型 v1.1 交付（2026-04-23）
- 底层建设期 know-how 库完成（2026-04-26）—— 50 题 PM 决策 + Neo Soul final + 三大底层原则

关键数字：6 月 MVP、30-40 人/项目、项目周期可配（典型 6 个月）。

---

## AI 角色架构（2026-04-26 更新）

| 角色 | 位置 | 职责 |
|------|------|------|
| **Neo** | 大厅 + 四间场域（学员端唯一）| 1v1 老师 —— **按场域差异化**调用 7 动作（讲授/解惑/讨论/考研/练习/追问/反思） |
| **Actor**（演员） | 对练场域 | 剧本驱动的角色扮演对象 |
| **导演** | 对练场域（后台） | 剧本驱动，指挥 Actor |
| **Ora** | 管理端 | 数据解读、报告辅助、证据追溯 |

⚠️ **2026-04-26 起 Leo 完全取消**——学员端只有 Neo。Neo 在大厅展现 Coach 能力（陪伴/Bloom引导/情绪感知），进入场域展现 Tutor 能力（结构化教学/AOM 脚本）。

四间场域：**授课(Lecture)** / **对练(Practice)** / **调研(Inquiry)** / **报告(Report)**

---

## 从这里开始看

### 1. 研发拿到本目录后第一站

[`00-public/4-decisions/底层建设期-2026-04-26/`](00-public/4-decisions/底层建设期-2026-04-26/) — **研发 know-how 参考资料库**
- 50 题 PM 决策清单
- 三大底层原则（P1 第一性原理 / P2 懂你 / P3 像人）
- Neo Soul final（5 文件结构 + Teacher Credibility 顶级 + 不当舔狗）
- Memory 设计原则 + 数据集与样本（含 HBR 91 集）

### 2. 产品规格说明书（spec v0.4.0）

路径：[`00-public/1-product/spec/design/`](00-public/1-product/spec/design/)

| 文件 | 说明 |
|------|------|
| [requirements-v0.4.0.md](00-public/1-product/spec/design/requirements-v0.4.0.md) | **总纲**——产品定义、生命周期、AI角色、模块总览、Scope |
| [spec/design/README.md](00-public/1-product/spec/design/README.md) | spec 目录快速导航 |

#### 学员端 (7 个文件)
| 文件 | 说明 |
|------|------|
| 00-overview | 学员端总览 |
| 01-hall | 大厅（Neo 大厅 Coach 能力 + 看板 + 4 库 + 社区占位） |
| 02-lecture-zone | 授课场域 Lecture |
| 03-practice-zone | 对练场域 Practice（Actor + Neo 双栏） |
| 04-inquiry-zone | 调研场域 Inquiry (P3) |
| 05-report-zone | 报告场域 Report |
| 06-notes | 笔记 |
| 07-discovery-library | 发现库 |

#### 管理端 (5 个文件)
| 文件 | 说明 |
|------|------|
| 00-overview | 管理端总览（Ora、四模块） |
| 01-operation | 首页 Operation（三维度 + Ora） |
| 02-report-gen | 报告生成 Report-Gen（HITL + Ora） |
| 03-project-config | 配置 Config |
| 04-message | 消息 Message |

#### 通用 (3 + 1 文件)
| 文件 | 说明 |
|------|------|
| common/00-overview | 通用栏、端口切换 |
| common/01-general | 账号管理、AI 语速、帮助 |
| common/02-notification | 消息提醒 |
| common/03-ai-brand | AI 品牌形象（Neo Hero）|
| 00-future-iterations | P3 争取项 + V2/中远期方向 |

---

## 目录结构

```
├── 00-public/              正式交付物
│   ├── 1-product/          产品设计（spec v0.4.0）
│   ├── 2-business/         商业分析
│   ├── 3-tech/             技术分析（含 coaching-skills 项目分析）
│   ├── 4-decisions/        ADR + 主题决策包（含 2026-04-26 底层建设期）
│   ├── 5-process/          过程记录（辩论 / 日志）
│   └── 6-content/          课程内容（FLM 17 份 + GROW 12 份）
├── 01-ref/                 外部参考（coaching-skills 项目 / demo 录屏）
├── 02-temp/                临时文件
└── DM_Temp/                工作暂存区（含原型 build/）
```

## 更多阅读路径

- **底层建设决策** → [00-public/4-decisions/底层建设期-2026-04-26/](00-public/4-decisions/底层建设期-2026-04-26/)
- **商业背景** → [00-public/2-business/](00-public/2-business/)
- **技术现状** → [00-public/3-tech/](00-public/3-tech/)
- **设计过程** → [00-public/5-process/](00-public/5-process/)
- **使用手册** → [使用手册.md](使用手册.md)
- **AI 协作约定** → [CLAUDE.md](CLAUDE.md)
