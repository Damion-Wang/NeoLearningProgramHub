---
version: V-0.2.0-D-5.0
product-version: V-0.2.0
doc-version: D-5.0
status: delivered
last-updated: 2026-05-06
---

# spec/ — D-5.0 已交付产品 spec

> **22 文件**（21 章节 + 00-glossary 术语决议表 + CHANGELOG）/ 全部【已审阅】 / 每文件独立编号 / 跨文件引用 `[文件名 § X.Y]` 格式 / 等研发对接

## 板块结构（6 板块 + 总纲文件）

```
spec/
├── 00-glossary.md                ★ 术语决议表 v2（15 节 / ~250 术语）
├── CHANGELOG.md                  ★ D-4.0 → D-5.0 内容变更说明
├── 01-vision【已审阅】.md         愿景与产品定位
│
├── 02-foundation/                基础（Persona / 教学方法论 / 角色端口 / 数据模型）
│   ├── 01-personas【已审阅】.md
│   ├── 02-methodology【已审阅】.md
│   ├── 03-roles-and-ports【已审阅】.md
│   └── 04-data-model【已审阅】.md
│
├── 03-lifecycle/                 项目生命周期（开营前 / 学习期 / 结营+服务期+归档）
│   ├── 01-pre-learning【已审阅】.md
│   ├── 02-learning【已审阅】.md
│   └── 03-completion【已审阅】.md
│
├── 04-global/                    全局（用户级 + 平台级）
│   ├── 01-user-global【已审阅】.md
│   └── 02-platform-global【已审阅】.md
│
├── 05-learner/                   学员端（总览 + 大厅 + 3 学习场域 + 跨场域）
│   ├── 01-overview【已审阅】.md
│   ├── 02-hub【已审阅】.md
│   ├── 03-lecture【已审阅】.md
│   ├── 04-practice【已审阅】.md
│   ├── 05-recap【已审阅】.md
│   └── 06-cross-context【已审阅】.md
│
└── 06-management/                管理端（总览 + Home + 报告中心 + 项目配置 + 消息中心）
    ├── 01-overview【已审阅】.md
    ├── 02-home【已审阅】.md
    ├── 03-report-center【已审阅】.md
    ├── 04-program-config【已审阅】.md
    └── 05-message【已审阅】.md
```

## 推荐阅读路径

### 1. 研发拿到本目录后第一站

按顺序读：
1. **`00-glossary.md`** —— 术语决议表 v2 / 含全文替换清单 / 8 议题决议（**最快入门 D-5.0 整体面貌**）
2. **`CHANGELOG.md`** —— D-4.0 → D-5.0 内容变更说明 / 24 个功能模块对比 / 推翻清单 + 新增清单
3. **`01-vision`** —— 愿景与产品定位
4. **`02-foundation/`** 4 文件 —— 基础设计原则
5. 按你关注的端口选 `05-learner/` 或 `06-management/`

### 2. 想做学员端工程

`02-foundation/` → `05-learner/01-overview` → 各场域文件 → `06-cross-context`（跨场域机制）

### 3. 想做管理端工程

`02-foundation/` → `06-management/01-overview` → 各模块文件 → `04-program-config`（双态 + 6 配置板块 / 最复杂）

### 4. 想做内容侧（KGP）

`02-foundation/04-data-model`（AOM 双层 + 9 类 SCO + 自适应 L1-L4）→ `05-learner/03-lecture` + `04-practice` + `05-recap`（看 Neo 怎么按 AOM 演绎）

## 编号约定

- **每文件独立编号** —— 每个文件从 § 1 起 / frontmatter 加 `numbering: per-file-independent`
- **跨文件引用** —— `[文件名 § X.Y]` 格式（如 `[05-learner/05-recap § 1.2.3]`）
- **自引用** —— `§ X.Y` 格式（不带文件名）
- 文件名带【已审阅】后缀（00-glossary 是术语表 / 不带后缀；CHANGELOG 是 D-4 → D-5 对照 / 不带后缀）

## 重要约定

- spec/ 22 文件 = 唯一交付物
- 任何术语 / 编号变更必须同步更新 00-glossary.md
- 跨文件引用统一用 `[文件名 § X.Y]` 格式
- 本目录是下一版（D-6.0 或 V-0.2.1-D-1.0）研发对接的基线
