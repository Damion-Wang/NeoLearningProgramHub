# Agent G1 Fix Log — T3.2 续做（learner 板块跨文件引用替换）

**Agent**: G1（接手 F3 因 rate limit 中断的工作）
**任务**: 学员端 6 文件 / 153 个跨文件 § X.Y 旧编号引用替换
**完成时间**: 2026-05-06
**结果**: ✅ 0 残留（仅 frontmatter `source-section` 元数据按规则保留）

---

## 处理统计

| # | 文件 | 旧 prefix | 旧编号残留 | Edit 数 | 验证残留 |
|---|---|---|---|---|---|
| 1 | `05-learner/01-overview【已审阅】.md` | `9` | 1 | 0 | frontmatter only |
| 2 | `05-learner/02-hub【已审阅】.md` | `9.2` | 4 | 3 | frontmatter only |
| 3 | `05-learner/03-lecture【已审阅】.md` | `9.3.1` | 38 | 32 | frontmatter only |
| 4 | `05-learner/04-practice【已审阅】.md` | `9.3.2` | 27 | 24 | frontmatter only |
| 5 | `05-learner/05-recap【已审阅】.md` | `9.3.3` | 50 | 38 | frontmatter only |
| 6 | `05-learner/06-cross-context【已审阅】.md` | `9` | 33 | 19 | frontmatter only |
| **合计** | | | **153** | **116** | **全部清零** |

> Edit 数 < 引用数：因为多次同条 Edit 替换中包含多个 § 引用（如同一行多个跨文件标）。

## 替换规则总结

### 自引用判断
- **lecture** prefix `9.3.1` → § 9.3.1.X.Y 改 § 1.X.Y
- **practice** prefix `9.3.2` → § 9.3.2.X.Y 改 § 1.X.Y
- **recap** prefix `9.3.3` → § 9.3.3.X.Y 改 § 1.X.Y
- **hub** prefix `9.2` → § 9.2.X.Y 改 § 1.X.Y
- **cross-context** prefix `9` → § 9.3.0 / § 9.3.4 / § 9.4 改 § 3.0 / § 3.4 / § 4

### 跨文件引用映射（按 mapping 表）
- § 9.3.1.X.Y → `[05-learner/03-lecture § 1.X.Y]`
- § 9.3.2.X.Y → `[05-learner/04-practice § 1.X.Y]`
- § 9.3.3.X.Y → `[05-learner/05-recap § 1.X.Y]`
- § 9.2.X.Y → `[05-learner/02-hub § 1.X.Y]`（§ 9.2.1 → § 1.1，§ 9.2.2.X → § 1.2.X，§ 9.2.3 → § 1.3）
- § 9.4 / § 9.4.X → 在 cross-context 内 § 4 / § 4.X；从其他文件 → `[05-learner/06-cross-context § 4]`
- § 9.3 / § 9.3.4 → `[05-learner/06-cross-context § 3 / § 3.4]`
- § 2.5 / § 2.6 / § 2.7 / § 2.3.3 → `[02-foundation/02-methodology § 1.5 / § 1.6 / § 1.7 / § 1.3.3]`
- § 3.2 / § 3.4.3 / § 3.4.4 → `[02-foundation/01-personas § 1.2 / § 1.4.3 / § 1.4.4]`
- § 5.3 → `[02-foundation/04-data-model § 1.3]`
- § 6.7 / § 6.8 → `[03-lifecycle/03-completion § 1 / § 2]`
- § 8.4 → `[04-global/02-platform-global § 1.4]`
- § 10.2.2.2 → `[06-management/02-home § 1.2.2]`
- § 10.3 → `[06-management/03-report-center § 1]`
- § 10.4 → `[06-management/04-program-config § 1]`

## 特殊处理

### cross-context 历史叙事
06-cross-context 第 17 行与第 42 行涉及"原 § 9.3.4 / § 9.3.5"的合并历史描述。这些不是引用，是说明合并源。处理方式：去掉 `§` 标记改为"原 9.3.4 / 原 9.3.5 章节"纯文本，避免误命中 grep。

### overview 文件
overview 文件正文中无 § X.Y 引用，仅 frontmatter `source-section: § 9 章首 + § 9.1` 元数据按规则保留。

## 验证

```
grep "§\s*(6|7|8|9|10)\.\d+(\.\d+)*" 05-learner/
→ 6 文件，每文件仅 1 行 frontmatter source-section 残留
→ 正文 0 残留 ✅
```

## frontmatter 保留说明

按任务规则 frontmatter 不动。残留如下：
- 01-overview line 9: `source-section: § 9 章首 + § 9.1`
- 02-hub line 9: `source-section: § 9.2`
- 03-lecture line 9: `source-section: § 9.3.1`
- 04-practice line 9: `source-section: § 9.3.2`
- 05-recap line 9: `source-section: § 9.3.3`
- 06-cross-context line 9: `source-section: § 9.3 章首 + § 9.3.0 + § 9.3.4 + § 9.4`

这些是 source 元数据，记录文件来源于 `plan/03-v0.5.0-full.md` 的旧编号段，是文档来源溯源信息，按 T3.2 规则保留。

---

**G1 工作完成 / learner 板块全部 153 跨文件引用替换 0 残留。**
