---
version: V-0.2.0-D-4.0
product-version: V-0.2.0
doc-version: D-4.0
status: reviewed
last-updated: 2026-04-29
---

# prototype/ — 原型 v1.1（11 个 HTML + 资源）

> **版本**：V-0.2.0-D-4.0 · **状态**：已交付（v1.1 含 11 条 DoD 修复）· **更新**：2026-04-29

## 目录结构

```
prototype/
├── build/      ← 11 个独立 HTML 原型
└── assets/     ← 设计资源（PPT 截图、Neo 头像、mock-data.json）
```

## build/（11 个 HTML，每个自包含）

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

## assets/

- `ppt/` — PPT 来源截图
- `neo-male.{png,svg}` / `neo-female.{png,svg}` — Neo AI 头像（多版本）
- `avatar-zhao.jpg` — 学员头像
- `mock-data.json` — 原型 mock 数据

## 历史

| 日期 | 事件 |
|------|------|
| 2026-04-22 | demo v1.0 交付（11 个 HTML 初版） |
| 2026-04-23 | demo v1.1 交付（11 条 DoD 修复完成） |
| 2026-04-26 | 大整理：原 DM_Temp 下的 32 个过程文档归档到 5-process / 6-content / 01-ref |
| 2026-04-29 | 整体迁移到 `product-V-0.2.0-D-4.0/prototype/`，纳入版本归集 |

## 历史归档去向（2026-04-26 大整理）

| 原 DM_Temp 路径 | 归档目标 |
|----------------|---------|
| `prototype/debate/round-*` (5 文件) | `00-public/5-process/debates/prototype-rounds-2026-04/` |
| `prototype/*.md` (8 文件：plan/review/spec-supplements) | `00-public/5-process/journal/2026-04-prototype-work/` |
| `prototype/ref/contentRef/*.txt` (12 文件) | `00-public/6-content/grow-coaching-source/` |
| `prototype/ref/*.html` (5 个教室 HTML 参考) | `01-ref/prototype-references/` |
| `prototype/ref/NEO头像.png` + `NEO女头像.png` | `01-ref/prototype-references/` |

## 引用方式

```
00-public/product-V-0.2.0-D-4.0/prototype/build/04-lecture.html
00-public/product-V-0.2.0-D-4.0/prototype/assets/mock-data.json
```

> ⚠️ 本目录原型已**冻结**。新原型（如有）走 `02-temp/` 临时区或下一版 prototype 目录。
