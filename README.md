# AI 老师 -- 产品设计项目

> AI 老师是一个可编排的 AI 原生培训项目交付引擎，面向大型企业（2000+人）管理者培训，通过自适应的 AI 动作序列（授课/辅导/测评/对练/萃取），将企业培训从"不可验证的课程完成"升级为"可举证的行为改变"。

## 项目状态

**产品设计阶段** -- 需求规格已迭代至 v0.4.0，产品规格说明书按模块拆分完成，部分模块已审阅。

关键数字：6月 MVP、30-40人/项目、6个月周期。

---

## 从这里开始看

**产品规格说明书（spec/design/）是本项目最核心的交付物。** 如果时间有限，只看这个目录即可。

路径：[`00-public/1-product/spec/design/`](00-public/1-product/spec/design/)

| 文件 | 说明 | 状态 |
|------|------|------|
| [requirements-v0.4.0.md](00-public/1-product/spec/design/requirements-v0.4.0.md) | 总需求规格书 v0.4.0 | 最新版 |
| **common/** | 通用模块（概览、通用规则、通知） | |
| -- [已审阅]00-overview.md | 系统概览 | 已审阅 |
| -- [已审阅]01-general.md | 通用规则 | 已审阅 |
| -- [已审阅]02-notification.md | 通知体系 | 已审阅 |
| **learner/** | 学员端模块 | |
| -- [已审阅]00-overview.md | 学员端概览 | 已审阅 |
| -- [已审阅]01-hall.md | 大厅页 | 已审阅 |
| -- [已审阅]02-teaching-classroom.md | 授课教室 | 已审阅 |
| -- [待审阅]03-drill-classroom.md | 对练教室 | 待审阅 |
| -- [待审阅]04-assessment-classroom.md | 测评教室 | 待审阅 |
| -- [待审阅]05-report-classroom.md | 报告教室 | 待审阅 |
| -- [待审阅]06-notes.md | 笔记 | 待审阅 |
| **management/** | 管理端模块 | |
| -- [待审阅]01-dashboard.md | 仪表盘 | 待审阅 |
| -- [待审阅]02-report.md | 报告 | 待审阅 |
| -- [待审阅]03-project-config.md | 项目配置 | 待审阅 |

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
