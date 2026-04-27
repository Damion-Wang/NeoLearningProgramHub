# DM_Temp — 持续在编工作区

**用途：** DM 在编的原型工作区。已完成的过程文档已归档到 `00-public/`，本目录仅保留 **持续被使用的原型构建产物和资源**。

**最近一次整理：** 2026-04-26（归档了 debate/journal/contentRef/教室 ref 共 32 个文件）

---

## 目录结构

```
DM_Temp/
└── prototype/
    ├── build/      ← 11 个独立 HTML 原型（demo v1.1，已交付）
    └── assets/     ← 设计资源（PPT 截图、Neo 头像、mock-data.json）
```

## prototype/build/（11 个 HTML，每个自包含）

| 文件 | 场景 |
|------|------|
| `01-login.html` | 登录页 |
| `02-hall-empty.html` | 学习大厅（空态） |
| `03-hall-daily.html` | 学习大厅（日常态） |
| `04-lecture.html` | 授课教室 |
| `05-practice.html` | 对练教室 |
| `06-report-learner.html` | 学员报告 |
| `07-config.html` | 管理端 - 配置 |
| `08-operation.html` | 管理端 - 运营 |
| `09-report-mgmt.html` | 管理端 - 团队报告 |
| `10-message.html` | 消息中心 |
| `11-inquiry-p3.html` | 调研教室 P3 |

**原型独立性约束**：每页自包含（CSS/JS 内联，图片 base64），仅 CDN 外链允许（Tailwind/Lucide/Fonts）。

## prototype/assets/

- `ppt/` — PPT 来源截图
- `neo-male.{png,svg}` / `neo-female.{png,svg}` — Neo AI 头像（多版本）
- `avatar-zhao.jpg` — 学员头像
- `mock-data.json` — 原型 mock 数据

---

## 已归档去向（2026-04-26）

| 原 DM_Temp 路径 | 归档目标 |
|----------------|---------|
| `prototype/debate/round-*` (5 文件) | `00-public/5-process/debates/prototype-rounds-2026-04/` |
| `prototype/*.md` (8 文件：plan/review/spec-supplements) | `00-public/5-process/journal/2026-04-prototype-work/` |
| `prototype/ref/contentRef/*.txt` (12 文件，MANAGER1-3 的 BP/SC/URL/VS) | `00-public/6-content/grow-coaching-source/` |
| `prototype/ref/*.html` (5 个教室 HTML 参考) | `01-ref/prototype-references/` |
| `prototype/ref/NEO头像.png` + `NEO女头像.png` | `01-ref/prototype-references/` |
