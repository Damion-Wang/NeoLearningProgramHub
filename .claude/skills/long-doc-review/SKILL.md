---
name: long-doc-review
description: 长文本（>50k tokens / 千行级）4 维审查全量 skill —— fan-out 4 Agent 并行 + fan-in 1 合并 Agent + PM 决议交互 + 自动修复执行 + diff 历史
trigger: 用户说"审查 / 全量审查 / 4 维审查 / 长文本审查 / review / 审 spec / 审 doc"+ /long-doc-review 显式调用
---

## 用途

把长文本（spec / 设计文档 / 长报告等,通常 >50k tokens）的审查从"凭感觉读一遍"标准化为"4 维并行 + 合并去重 + PM 决议 + 自动修复"全量闭环。

核心价值：
- **覆盖更全**：全局 / 中局 / 细节 / 关联 4 维并行,单 Agent 视角不会漏
- **重叠度暴露真问题**：多 Agent 都发现的问题,大概率是真问题
- **抗上下文腐烂**：长文本分段读 + 关键章节重读
- **闭环执行**：审查 → PM 决议 → 自动修复 → 验证 一条龙
- **diff 历史**：再次跑可对比上次"已修复 / 仍存在 / 新增"

## 何时触发

**用户语言信号**（任一命中）：
- 中文：审查 / 全量审查 / 4 维审查 / 长文本审查 / 重新审一遍
- 英文：review this / full review / quad review
- 显式调用：`/long-doc-review`

**适用文档类型**：
- 长 spec（产品规划 / 设计文档,>1000 行）
- 长报告（调研 / 评审 / 总结）
- 长草稿（书 / 提案 / 文章）

**不触发场景**：
- 短文档（<500 行,直接 Read 全文一次审完即可）
- 代码 review（用 security-review / simplify 等专用 skill）
- 单点问题排查（无需 4 维全量）

## 必填参数

调用时用户必须提供：

| 参数 | 说明 | 示例 |
|------|------|------|
| `target_file` | 审查对象绝对路径 | `D:/.../03-v0.5.0-full.md` |
| `output_dir` | 输出目录 | `02-temp/review/03-full/` |
| `model` | Agent 模型 | `sonnet` 或 `opus` |
| `scope`（选填）| 审查范围 line 起止 | `1-2732`（默认全文）|

## 4 维 default checklist（锁定 4 维 · 每维 5 必查项）

### 全局维度（结构 / 节奏 / 体验,**不卷细节**）

1. **章节顺序与模块划分**：N 大模块的顺序是否符合"先理念后实现"递进？有冗余 / 缺失 / 错位的章节吗？
2. **抽象层次**：每个模块内部"总→分→具体"层次是否清晰？有跳跃式抽象（突然从概念跳到字段细节）吗？
3. **表述节奏**：段落长度均衡吗？信息密度平稳吗？关键决策有没有被淹没在长段落中？
4. **阅读体验**：首次读者能在 30 分钟内把握全貌吗？重复读者能快速定位某话题吗？多角色读者（PM / 研发 / 业务方）能找到各自切入点吗？
5. **跨章节信息流**：前章铺垫是否为后章展开服务？后章是否反过来巩固前章核心概念？还是各章独立？

> ⚠️ **全局不审**：错字 / 标点 / 术语一致性 / cross-ref（这些归细节 / 关联）

### 中局维度（每章节内部结构）

1. **总览 / 开场**：本章开头是否有"作用 / 范围 / 如何阅读"等总览陈述？还是直接掉进细节？
2. **总分关系**：章节内子节是平铺还是分层？子节之间层次清楚吗？
3. **决策完整度**：本章承诺的决策（"本期做 / 不做 / 待补"）是否都给出？
4. **边界声明**：本章和其他章节边界（哪些归这章 / 哪些归别章）是否清楚？
5. **子节命名一致性**：子节命名风格是否一致（动词 + 名词 / 名词等）？

### 细节维度（表述准确性 / 术语一致性）

1. **核心术语一致性**：项目核心术语（如 Course / Activity / Neo / Ora 等）全文出现是否一致？
2. **数字 / 状态 / 数量**：所有数量类描述（"4 库 / 3 场域 / 10 状态"）是否前后一致？
3. **角色名称一致**：所有角色（学员 / admin / HR 等）命名前后一致？
4. **表格 / 列表格式**：抽样 5-10 个表格,列对齐 / 行对齐 是否正确？
5. **错别字 / 标点**：抽样 5-8 段中英文标点混用 / 错别字 / 漏字 / 多字？

### 关联维度（cross-ref / 矛盾 / 一致性）

1. **cross-ref 目标存在性**：所有 `§ X.Y.Z` / `详见 §X.Y` 引用,目标章节是否真存在？
2. **章节间决策无矛盾**：同一决策（"本期不做 X"）在不同章节表述是否一致？
3. **backlog 与正文对齐**：backlog 中的引用 vs 正文是否对齐？
4. **核心约束贯彻**：项目核心约束（如 CLAUDE.md 中规则）是否在 spec 中落地？
5. **跨章节内容重复 / 矛盾**：同一概念是否在多章节重复定义？定义一致吗？

## 长文本应对策略（必须遵守 · 防上下文腐烂）

### Step 0 · 评估 token 数

```bash
# 字符数 × 0.45 估算 token
char_count=$(wc -c < "$target_file")
est_tokens=$(awk "BEGIN {print int($char_count * 0.45)}")
```

### Step 1 · 选择策略

| token 量 vs 模型 effective context | 策略 |
|----------------------------------|------|
| **<50% effective**（如 sonnet effective 80k,文档 <40k）| 整篇 Read 一次,全 prompt 内审 |
| **50-80% effective**（40-65k）| **提纲先读**（grep 章节标题）+ **重点章节完整 Read** |
| **>80% effective**（>65k）| **分块 Read**（章节级）+ **摘要传递** + Map-Reduce |

**任何长度都需做的**：
- **关键章节末尾"刷新读"** —— 完成中段后,再次 Read 开头 + 结尾防腐烂
- **关键术语 grep 验证** —— 不依赖记忆,grep 关键术语校准全文一致性

### Step 2 · 不铺满上下文

任何阶段不要让 prompt 加文档 token 总和超过 effective context **的 80%**。预留 20% 给 Agent 思考输出。

## 标准流程（fan-out → fan-in → 决议 → 修复 → 验证）

### Phase 0 · 准备

1. 创建输出目录 `{output_dir}`
2. **备份原文件**到 `02-temp/backup/{filename}.backup-{YYYY-MM-DD}.md`（修复后可还原）
3. 估算 token + 选策略

### Phase 1 · fan-out（4 Agent 并行）

并行启动 4 个 Agent（同一消息中 4 个 Agent tool 调用,后台运行）：

| Agent | 维度 | 输出 |
|-------|------|------|
| Agent 1 | 全局 | `01-global-review.md` |
| Agent 2 | 中局 | `02-meso-review.md` |
| Agent 3 | 细节 | `03-detail-review.md` |
| Agent 4 | 关联 | `04-relation-review.md` |

**每个 Agent prompt 必含**：
- 审查对象 + line 范围
- 长文本应对策略（参考 Step 0/1）
- default checklist（5 项必查）+ 自由发现区
- **覆盖率证明要求**（报告开头强制声明：审了哪些章节 / 跳过 / 覆盖率%）
- 输出格式：`### 问题 #N · [简述] / 位置 / 不好在哪 / 为什么不好 / 怎么改 / 优先级`
- 优先级三档：🔴 高 / 🟡 中 / 🟢 低

预计耗时：~50 分钟（并行）

### Phase 2 · fan-in（1 合并 Agent）

4 Agent 全部完成后启动合并 Agent：

**合并 Agent 任务**：
1. 读 4 报告 + 原文档全文
2. 去重：识别多 Agent 同时找到的问题（标"X 个 Agent 发现"）
3. 标冲突：Agent 间结论冲突的标"⚠️ 冲突 - 待 PM 决断"
4. 排序：4 重叠 + 🔴 → 3 重叠 + 🔴 → ... → 🟢
5. 生成 `00-summary.md`（总览 + Top N + 冲突清单 + 健康度）
6. 生成 `repair-tasks.md`（按优先级分组 + 每 task 含"前因 / 修改 / 后果"）

预计耗时：~10 分钟

### Phase 3 · PM 决议（内置 AskUserQuestion 流程）

**一题一题问**（每题 4 选项）：
1. 同意（按推荐方案）
2. 不同意（保留现状）
3. 修订执行（PM 给出修订方案）
4. 其他 / PM 补充

预计耗时：约 1 小时（50 题）

每题问完即记入 task 决议状态。**PM 中途暂停可接续**（决议状态持久化到 `meta.json`）。

### Phase 4 · 自动修复执行（4 阶段）

按 repair-tasks.md 阶段顺序：

| 阶段 | 内容 | 注意 |
|------|------|------|
| 1 全局调整 | 章节号大调整 / 全文术语统一 | **最先做** |
| 2 cross-ref 修订 | 引用更新 / 死引用清除 | 依赖阶段 1 |
| 3 单点替换批量 | 错字 / 标点 / 命名 | 顺序敏感（如"代办→待办"先于"半角→全角"）|
| 4 结构优化 | 章节补全 / 标题层级修复 | 依赖阶段 1 |

**修复执行约束**：
- ❌ **禁止用 line 号定位** —— line 因前序修改偏移,必失效
- ✅ **必用 grep 关键文本定位**
- 每完成一个 task 写入 `repair-log.md`：时间 / task ID / 修改文件 / 验证结果

### Phase 5 · V1 验证

- grep 关键修复点（每个 G/R/M/L task 的关键文本是否消除）
- 校准章节号（`grep "^## [0-9]"`）
- 输出修复完成度报告

### Phase 6 · diff 模式（再跑时启动）

每次审查保存 `meta.json`：
```json
{
  "skill_version": "1.0",
  "target_file": "...",
  "review_date": "2026-04-29",
  "issue_ids": ["G1", "R1", ...],
  "issue_status": {
    "G1": "fixed",
    "R10": "fixed",
    ...
  }
}
```

再跑时合并 Agent 加任务：对比上次问题 ID,输出：
- ✅ 已修复 N
- 🔄 仍存在 M
- 🆕 新增 K

## 输出文件结构

```
02-temp/
├── backup/
│   └── {filename}.backup-{YYYY-MM-DD}.md     # 修复前备份(Phase 0)
└── review/{filename}/
    ├── meta.json                               # skill 元信息 + 历史问题 ID(diff 用)
    ├── 00-summary.md                           # 合并总览 (Phase 2)
    ├── 01-global-review.md                     # 全局 Agent 报告 (Phase 1)
    ├── 02-meso-review.md                       # 中局 Agent 报告
    ├── 03-detail-review.md                     # 细节 Agent 报告
    ├── 04-relation-review.md                   # 关联 Agent 报告
    ├── repair-tasks.md                         # 修复 task list (Phase 2)
    ├── decisions.md                            # PM 决议状态 (Phase 3)
    └── repair-log.md                           # 修复执行 log (Phase 4)
```

## repair-tasks.md 模板（每 task 必须含"前因 / 修改 / 后果"）

```markdown
### Task R1 · [简述]

- **前因**：（为什么要改 · 不改有什么后果）
- **修改**：（具体改什么 · 用 grep 关键文本定位,**不用 line 号**）
- **后果**：（改完影响哪些其他 task / 章节）
- **优先级**：🔴 / 🟡 / 🟢
- **来源**：（被几个 Agent 发现 + 哪些 Agent）
```

## 修复执行风险提示（必读）

1. **line 号失效**：repair-tasks 中所有 line 号是审查时快照,执行时务必用 grep 关键文本定位
2. **task 顺序依赖**：
   - "代办→待办" 这类术语替换 必须在 "半角→全角" 标点替换 之前（避免误伤）
   - 章节号大调整必须在 cross-ref 修复 之前
   - 删除整段（如删空壳子节）后,后续 task 的 line 号必偏移
3. **章节号大调整高风险**：必有 cross-ref 大量更新,grep 全文 `§ \d` 校准
4. **批量 sed 限定范围**：避开代码块 / URL / JSON 等保留区
5. **修复前必有备份**（Phase 0）+ **修复每阶段 commit 一次**（便于回滚）

## 常用 grep 模式（修复时定位关键文本）

```bash
# 章节号
grep -n "^## [0-9]" file
grep -n "^### [0-9]\." file
grep -n "^#### [0-9]\." file

# cross-ref
grep -n "§ [0-9]\.[0-9]" file
grep -n "详见 §" file

# 术语一致性
grep -cn "AI 老师" file       # 期望 0
grep -cn "代办" file           # 期望 0 (期望"待办")

# 标点
grep -n ",.* / .*," file       # 半角逗号残留

# 章节统计
grep -c "^## " file
```

## 与其他 skills 的关系

- **completion-gate**：完成大改后可主动建议"是否跑 long-doc-review 验证"
- **git-push-guard**：commit 前可建议"是否最近一次 long-doc-review 后再推"
- **multi-round-debate**：审查发现决策类冲突时,可推荐用 debate 解决

## v1 已知限制

- ❌ 不做异常处理（Agent 失败 / 超时 → 当前需 PM 介入）
- ❌ 不与 fewer-permission-prompts 联动（Bash sed/perl 可能触发权限,PM 现场处理）
- ❌ 不自动 commit（Phase 4 修复后由 git-push-guard 处理）
- ⚠️ 4 Agent 并行 + 1 合并 Agent + PM 决议 总耗时 ~2-3 小时（不含修复执行）
- ⚠️ 仅限单文档审查 + 关联文件辅助校准（不做多文档平行审查）—— 多文档需多次跑

## 实施要点

1. **PM 决议中途可暂停**：`decisions.md` 持久化每题决议,下次接续问未答
2. **修复前必看 meta.json**：如有上次审查历史,先 diff 模式给 PM 看进展
3. **Phase 1 启动 4 Agent 后即可标 in_progress**：用 TaskCreate 跟踪 5 个 Phase 进度,完成即时 update
4. **绝不修改 spec 之外文件**：审查报告 + 修复 log 都在 `02-temp/`,不污染主仓
5. **复杂场景退化策略**：如 4 维不够（如纯前端 spec 需"安全"维度）,允许 PM 自定义维度（虽未来才支持）—— 当前 v1 锁定 4 维

## 注意事项

- 跑前确认 `target_file` 路径可读 + `output_dir` 可写
- 4 Agent 报告 + 合并 Agent 总文件数 6-8 个,**不要污染 spec 主目录**
- 如 PM 修订原决议（如重新审某 task）,需手动改 `decisions.md` + 影响下游 task
- diff 模式仅在二次跑同一 `target_file` 时生效（按文件路径匹配 meta.json）
