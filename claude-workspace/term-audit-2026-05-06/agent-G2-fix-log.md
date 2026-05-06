# Agent G2 Fix Log — 06-management 跨文件引用替换

> **任务**：T3.2 续做 / 接 F4 因 rate limit 中断
> **范围**：06-management 5 文件 / 124 跨文件引用残留
> **完成**：2026-05-06

---

## 工作流回顾

1. Read mapping 表（offset 读取，避开 25K token 限制）：B.1-B.12 全部映射 + 跨文件汇总
2. 按文件优先级处理（小 → 大 / overview → home → message → program-config → report-center）
3. 每文件单 Read → 列出全部需替换 → 批量 Edit → Grep 验证 0 残留

---

## 各文件实际处理量

| # | 文件 | 任务说明残留 | 实际"真正需要替换"数 | 备注 |
|---|---|---|---|---|
| 1 | 01-overview | 2 | **0** | 残留 = frontmatter `source-section` + `glossary v2 § 8.2`（均豁免）|
| 2 | 02-home | 2 | **0** | 残留 = frontmatter + `glossary v2 § 8.2`（均豁免）|
| 3 | 05-message | 22 | **20** | 替换全部跨文件 / 自引用未变（已是新编号 § 1.4.x）|
| 4 | 04-program-config | 38 | **38** | 大量跨文件（§ 6.x / § 7.x / § 9.x / § 10.x）+ 模块间引用 |
| 5 | 03-report-center | 60 | **57** | 自引用 + 大量跨文件引用（§ 9.3.3 / § 3.4.4 / § 10.2.x）|
| 合计 | | 124 | **115** | 剩余 9 = frontmatter（5 个）+ glossary v2 § 8.2 引用（4 个 / 不在 spec 替换范围）|

---

## 关键判定规则（沿用 mapping）

### 自引用 vs 跨文件
- 03-report-center prefix `10.3` → § 10.3.x 自引用直接降为新编号（如 § 10.3.3 → § 1.3）
- 04-program-config prefix `10.4` → § 10.4.x 自引用同
- 05-message prefix `10.5` → § 10.5.x 自引用同
- 跨模块（§ 10.2.x / § 10.3.x / § 10.4.x / § 10.5.x 不属于本文件 prefix）→ `[06-management/0X-yyy § A.B]`

### 跨学科 § 6/7/8/9 → 学员/lifecycle/global 文件
- § 6.1～§ 6.5 → `[03-lifecycle/01-pre-learning § 1.X]`
- § 6.6.x → `[03-lifecycle/02-learning § 1.X]`
- § 6.7～§ 6.9 → `[03-lifecycle/03-completion § X]`
- § 7.x → `[04-global/01-user-global § 1.X]`
- § 8.x → `[04-global/02-platform-global § 1.X]`
- § 9.2 → `[05-learner/02-hub § 1]`；§ 9.2.1 → `[05-learner/02-hub § 1.1]`
- § 9.3.3 → `[05-learner/05-recap § 1]`
- § 9.3.3.2.10 → `[05-learner/05-recap § 1.2.10]`
- § 3.x → `[02-foundation/01-personas § 1.X]`（§ 3.4.4.2 → `[02-foundation/01-personas § 1.4.4.2]`）

### 豁免
- frontmatter `source-section: § 10.X`（元数据 / 不动）
- `glossary v2 § X.Y`（外部 glossary 文档引用 / 不在 mapping 范围）

---

## 重要遗留观察

1. **04-program-config L200** 原文 `§ 10.2.2.1 (3) 登录状态分布卡` —— 02-home 实际是 § 1.2.1 (5) 登录状态分布卡。**保持 (3) 不变**（这是 widget 编号 / 与编号迁移无关 / 内容修复不在本任务范围）。
2. **03-report-center L235** 原文 `§ 10.2.2.2 (5) 学员个人报告库` —— 02-home 实际是 § 1.2.2 (4) 个体详情面板（含报告列表）。**保持 (5) 不变**（理由同上）。

如果后续需要修复 widget 编号引用，建议另起 audit 任务。

---

## 验证

```bash
# 5 文件最终 grep
Grep §\s*(6|7|8|9|10)\.\d /spec/06-management/*.md
```

剩余命中：
- 5 个 frontmatter `source-section:` 行
- 4 个 `glossary v2 § 8.2` / `glossary v2 § 14.2` 引用

均为合法豁免，**0 个真正残留**。

---

## 工具调用统计

- Read: 5 次（mapping 表 1 次分段 + 5 文件主体）
- Grep: 8 次（验证 + 定位）
- Edit: 56 次（覆盖 115 个替换点 / 多个替换合并到同一 Edit 中）

---

**G2 完成 / 交还主线**
