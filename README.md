# AI 老师 -- 产品设计项目

> AI 老师是一个可编排的 AI 原生培训项目交付引擎，面向大型企业（2000+人）管理者培训，通过自适应的 AI 动作序列（授课/辅导/调研/对练/萃取），将企业培训从"不可验证的课程完成"升级为"可举证的行为改变"。

## 项目状态

**产品设计阶段** -- 需求规格 v0.4.0，产品规格说明书全部模块已审阅完成。

关键数字：6月 MVP、30-40人/项目、项目周期可配（典型6个月）。

---

## 核心架构：Leo / Neo / Actor / 导演 / Ora

| 角色 | 位置 | 职责 |
|------|------|------|
| **Leo**（Coach） | 大厅 | 1v1 成长伙伴，长期陪伴辅导 |
| **Neo**（Tutor） | 四间场域 | 按 AOM 脚本结构化教学 |
| **Actor**（演员） | 对练场域 | 剧本驱动的角色扮演对象 |
| **导演** | 对练场域（后台） | 剧本驱动，指挥 Actor |
| **Ora** | 管理端 | 数据解读、报告辅助、证据追溯 |

四间场域：**授课(Lecture)** / **对练(Practice)** / **调研(Inquiry)** / **报告(Report)**

---

## 从这里开始看

**产品规格说明书是本项目最核心的交付物。**

路径：[`00-public/1-product/spec/design/`](00-public/1-product/spec/design/)

| 文件 | 说明 |
|------|------|
| [requirements-v0.4.0.md](00-public/1-product/spec/design/requirements-v0.4.0.md) | **总纲**——产品定义、生命周期、AI角色、模块总览、Scope |
| [spec/design/README.md](00-public/1-product/spec/design/README.md) | spec 目录快速导航 |

### 学员端 (7 个文件，全部已审阅)

| 文件 | 说明 |
|------|------|
| 00-overview | 学员端总览 |
| 01-hall | 大厅（Leo + 看板 + 工具库 + 社区占位） |
| 02-lecture-zone | 授课场域 Lecture |
| 03-practice-zone | 对练场域 Practice（Actor + Neo 双栏） |
| 04-inquiry-zone | 调研场域 Inquiry (P3) |
| 05-report-zone | 报告场域 Report |
| 06-notes | 笔记 |

### 管理端 (5 个文件，全部已审阅)

| 文件 | 说明 |
|------|------|
| 00-overview | 管理端总览（Ora、四模块） |
| 01-operation | 首页 Operation（三维度 + Ora） |
| 02-report-gen | 报告生成 Report-Gen（HITL + Ora） |
| 03-project-config | 配置 Config |
| 04-message | 消息 Message |

### 通用 (3 个文件，全部已审阅) + 迭代计划

| 文件 | 说明 |
|------|------|
| common/00-overview | 通用栏、端口切换 |
| common/01-general | 账号管理、AI语速、帮助 |
| common/02-notification | 消息提醒 |
| 00-future-iterations | P3争取项 + V2/中远期方向 |

---

## 目录结构

```
├── 00-public/              正式交付物
│   ├── 1-product/          产品设计
│   │   └── spec/design/    ** 产品规格说明书（重点看这里）**
│   ├── 2-business/         商业分析（市场、战略、财务、验证）
│   ├── 3-tech/             技术分析（Prosona/AOM 架构分析）
│   ├── 4-decisions/        ADR 设计决策记录
│   ├── 5-process/          过程记录（辩论、日志、backlog）
│   └── 6-content/          课程内容参考
├── 01-ref/                 外部参考素材（demo 录屏、演示文稿、产品创意）
├── 02-temp/                临时文件
└── DM_Temp/                工作暂存区
```

## 更多阅读路径

- **商业背景** --> [00-public/2-business/](00-public/2-business/)
- **技术现状** --> [00-public/3-tech/](00-public/3-tech/)
- **关键决策** --> [00-public/4-decisions/](00-public/4-decisions/)
- **设计过程** --> [00-public/5-process/](00-public/5-process/)
