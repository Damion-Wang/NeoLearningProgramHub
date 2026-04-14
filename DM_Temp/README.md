# DM_Temp — 产品设计待审阅文件

**负责人：** DM
**状态：** 全部待审阅（2026-04-14 自动生成，未经创始人确认）

---

## 目录结构

```
DM_Temp/
├── 01-plan/                    ← 设计推演计划
├── 02-module-arch/             ← 模块架构规划
├── 03-feature-tree/            ← 功能树（Phase 1）
│   ├── drafts/                 ← 初稿（6份）
│   ├── debates/                ← debate审查结果（6份）
│   └── revised/                ← debate修订版（6份）— 审阅重点
├── 04-feature-flows/           ← 功能流程（Phase 2）
│   ├── drafts/                 ← 初稿（6份）
│   ├── debates/                ← debate审查结果（2份）
│   └── revised/                ← debate修订版（6份）— 审阅重点
├── 05-ux/                      ← UX交互规格（Phase 3）
│   ├── drafts/                 ← 初稿（6份）
│   ├── debates/                ← debate审查结果（2份）
│   └── revised/                ← debate修订版（6份）— 审阅重点
├── 06-summary/                 ← 产品设计总览
└── 07-misc/                    ← 其他（登录总结、版本对比）
```

## 审阅指南

**如果时间有限，只看 revised/ 下的修订版**（18份）——这些已经过 debate 审查和修订。

**审阅顺序建议：**
1. `06-summary/product-design-v0.1.md` — 173行总览，索引全部内容
2. `03-feature-tree/revised/` — 6份功能树（最上层的设计决策）
3. `05-ux/revised/` — 6份UX规格（最接近开发的交付物）
4. `04-feature-flows/revised/` — 6份功能流程（交互细节）

**如果发现问题，可以：**
- 直接在文件中红色标注（和之前审阅需求文档一样）
- 或者告诉我，我来组织 debate 讨论

## 文件索引

### 01-plan（1份）
- `design-deep-dive-plan.md` — 深度推演计划（4个Phase的完整规划）

### 02-module-arch（1份）
- `module-architecture.md` — 三层模块架构（应用层/平台层/基础设施）

### 03-feature-tree（18份）

**revised/（审阅重点）：**
| 文件 | 模块 | debate修订项 |
|------|------|------------|
| `01-layout-auth.md` | 三栏布局+账户权限 | 16项 |
| `02-coaching.md` | 辅导模块（大厅） | 17项 |
| `03-teaching.md` | 授课模块 | 14项 |
| `04-drill-assessment.md` | 对练+测评 | 12项 |
| `05-report.md` | 个人报告 | 16项 |
| `06-management.md` | HR+运营管理端 | 11项 |

drafts/ = 初稿（6份），debates/ = debate记录（6份）

### 04-feature-flows（14份）

**revised/（审阅重点）：**
| 文件 | 模块 |
|------|------|
| `01-layout-auth-flows.md` | 三栏布局+账户权限流程 |
| `02-coaching-flows.md` | 辅导模块流程 |
| `03-teaching-flows.md` | 授课模块流程 |
| `04-drill-assessment-flows.md` | 对练+测评流程 |
| `05-report-flows.md` | 个人报告流程 |
| `06-management-flows.md` | HR+运营管理端流程 |

drafts/ = 初稿（6份），debates/ = debate记录（2份）

### 05-ux（14份）

**revised/（审阅重点）：**
| 文件 | 页面/场景 |
|------|---------|
| `01-layout-framework.md` | 三栏通用框架+场景切换 |
| `02-hall-page.md` | 大厅页面 |
| `03-teaching-classroom.md` | 授课教室 |
| `04-drill-assessment-classroom.md` | 对练+测评教室 |
| `05-report-classroom.md` | 报告教室 |
| `06-management-pages.md` | HR+运营管理端 |

drafts/ = 初稿（6份），debates/ = debate记录（2份）

### 06-summary（1份）
- `product-design-v0.1.md` — 产品设计总览（173行，索引全部内容）

### 07-misc（2份）
- `login-account-summary.md` — 登录与账户体系需求总结（GPB对接方案）
- `v2-vs-v033-comparison.md` — v2.0 vs v0.3.3 对比分析
