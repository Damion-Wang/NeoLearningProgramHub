# V-0.2.0-D-5.0

> **版本**：V-0.2.0-D-5.0 · **状态**：✅ **已交付** / spec/ 22 文件 / 每文件独立编号 · **标记日期**：2026-05-06

| 项 | 值 |
|----|-----|
| 产品版本 | V-0.2.0 |
| 文档版本 | D-5.0 |
| 性质 | D-5.0 最终交付 spec / 22 文件 / 每文件独立编号 |
| 起始时间 | 2026-04-27（plan/01 出炉） |
| 交付时间 | 2026-05-06 |
| 含子目录 | spec/（22 文件 / 21 章节 + 00-glossary）|
| 文件数 | spec/ 22 文件全部【已审阅】（00-glossary 是术语表 / 不带后缀）|
| 上一版 | D-4.0（详见 `../product-V-0.2.0-D-4.0/`） |

## 历史

| 日期 | 事件 |
|------|------|
| 2026-04-27 | plan/01-spec-update-plan-2026-04-27.md 出炉（v0.5.0 元规划） |
| 2026-04-27 | plan/02-outline.md（1000 字大纲）+ 03-full.md 启动 |
| 2026-04-28 | § 1-§ 7 完成；03-full 含 § 1-§ 7 整体重构；50 题里程碑决策 + backlog 拆分 |
| 2026-04-29 | § 7-§ 9 完成；4 维审查（global/meso/detail/relation）+ 53 任务 PM 决议 + 全量修复 |
| 2026-04-29 | 归集到 `product-V-0.2.0-D-5.0/` 目录，启用版本号体系 |
| 2026-05-03 | § 9.3 学习核心层深化（§ 9.3.1 lecture / 9.3.2 practice / 9.3.3 recap / 9.3.4 跨场域协同）|
| 2026-05-04 | § 10 管理端全章完成（10.1-10.5 + § 10.1.6 Ora Truth Source）|
| 2026-05-04 | 03-full 全局审查（4 维 fan-out + 5 角色 Debate + DM 反向讨论）+ Q4/Q5/Q8 修订 18 处 |
| 2026-05-05 | 03-full 拆分：6822 行单体 → spec/ 6 板块 17 文件 + frontmatter |
| 2026-05-05 ~ 05-06 | 全文件单文件审阅完成 + 关键术语校准 + 5×5 卡片矩阵全局重做 |
| **2026-05-06** | **★ D-5.0 最终交付**：全量术语校准（162 新增 / 27 校准 / 8 议题决议）+ 编号重建（21 文件 393 章节独立编号）+ 引用替换（622 引用 / `[文件名 § X.Y]` 跨文件 / `§ X.Y` 自引用）+ 03-full 退场 + claude-workspace 过程档清理 + glossary 持久化为 00-glossary.md |

## 文件清单

22 文件全部在 `spec/` 下：

| 板块 | 文件 |
|------|------|
| 00-glossary | 术语决议表 v2 / 15 节 / ~250 术语 |
| 01-vision | 愿景 |
| 02-foundation | personas / methodology / roles-and-ports / data-model |
| 03-lifecycle | pre-learning / learning / completion |
| 04-global | user-global / platform-global |
| 05-learner | overview / hub / lecture / practice / recap / cross-context |
| 06-management | overview / home / report-center / program-config / message |

## 编号约定

- 每文件独立编号 / frontmatter 加 `numbering: per-file-independent`
- 每文件从 § 1 起
- 跨文件引用：`[文件名 § X.Y]`
- 自引用：`§ X.Y`

## 与 D-4.0 的关系

- 继承 D-4.0 中"未被推翻"的设计
- 推翻 D-4.0 部分（如 4 大情绪 → 10 状态、AI 老师 → Neo、§7 拆 §7+§8、Leo 完全取消、4 场域 → 3 学习场域 + 大厅、4 类 SCO → 9 类 SCO 等）

## 引用方式

```
00-public/product-V-0.2.0-D-5.0/spec/00-glossary.md            # 术语决议表
00-public/product-V-0.2.0-D-5.0/spec/01-vision【已审阅】.md
00-public/product-V-0.2.0-D-5.0/spec/05-learner/05-recap【已审阅】.md
... (共 22 文件)
```
