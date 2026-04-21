# AI 老师 -- 产品设计项目

> AI 老师是一个可编排的 AI 原生培训项目交付引擎，面向大型企业（2000+人）管理者培训，通过自适应的 AI 动作序列（授课/辅导/调研/对练/萃取），将企业培训从"不可验证的课程完成"升级为"可举证的行为改变"。

## 项目状态

**产品设计阶段** -- 需求规格已迭代至 v0.4.0，产品规格说明书按模块拆分完成，大部分模块已审阅。

关键数字：6月 MVP、30-40人/项目、6个月周期。

---

## 核心架构：Leo / Neo / Actor

学员端有两个独立的 AI 角色 + 对练中的模拟角色：

| 角色 | 位置 | 职责 |
|------|------|------|
| **Leo**（Coach） | 大厅（课堂外） | 1v1 成长伙伴，长期陪伴辅导，知识应用与迁移引导 |
| **Neo**（Tutor） | 教室（课堂内） | 按 AOM 脚本结构化教学，答疑与辅导 |
| **Actor**（演员） | 对练教室 | 由剧本驱动的角色扮演对象（如"张总"），独立于 Neo |

四间教室：**授课(Lecture)** / **对练(Practice)** / **调研(Inquiry)** / **报告(Report)**

---

## 从这里开始看

**产品规格说明书（spec/design/）是本项目最核心的交付物。** 如果时间有限，只看这个目录即可。

路径：[`00-public/1-product/spec/design/`](00-public/1-product/spec/design/)

| 文件 | 说明 | 状态 |
|------|------|------|
| [requirements-v0.4.0.md](00-public/1-product/spec/design/requirements-v0.4.0.md) | 总需求规格书 v0.4.0（含 Leo/Neo 角色架构总纲） | 最新版 |
| **common/** | 通用模块 | |
| -- [已审阅]00-overview.md | 通用模块总览（Topbar、通用功能入口） | 已审阅 |
| -- [已审阅]01-general.md | 通用功能（账号管理、个人设置、帮助） | 已审阅 |
| -- [已审阅]02-notification.md | 消息提醒（站内消息、催学效果追踪） | 已审阅 |
| **learner/** | 学员端模块 | |
| -- [已审阅]00-overview.md | 学员端总览（空间模型、用户故事） | 已审阅 |
| -- [已审阅]01-hall.md | 大厅（Leo Coach、学习看板、工具库、社区） | 已审阅 |
| -- [已审阅]02-lecture-classroom.md | 授课教室 Lecture（Neo 结构化教学） | 已审阅 |
| -- [已审阅]03-practice-classroom.md | 对练教室 Practice（Actor 角色扮演 + Neo 答疑与辅导） | 已审阅 |
| -- [已审阅]04-inquiry-classroom.md | 调研教室 Inquiry（Neo 访谈/量表，P1可选） | 已审阅 |
| -- [待审阅]05-report-classroom.md | 报告教室 Report（Neo 报告解读） | 待审阅 |
| -- [待审阅]06-notes.md | 笔记（悬浮球 + P1推荐笔记卡片） | 待审阅 |
| **management/** | 管理端模块 | |
| -- [待审阅]00-overview.md | 管理端总览（Leo/Neo/Agent 关系说明） | 待审阅 |
| -- [待审阅]01-dashboard.md | 首页看板 | 待审阅 |
| -- [待审阅]02-report.md | 报告页 | 待审阅 |
| -- [待审阅]03-project-config.md | 项目配置 | 待审阅 |
| **design 根目录** | | |
| -- [待审阅]00-future-iterations.md | 未来迭代计划 | 待审阅 |

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
