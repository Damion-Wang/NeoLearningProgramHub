---
name: git-push-guard
description: 用户准备 git push / commit 前强制运行 cleanup + progress + readme 三联检查
trigger: 用户说"推 git"/"推一版"/"commit"/"push"/"提交"/"上传"/"推送"
---

## 用途

在用户即将提交或推送代码前，强制走 3 项整理检查：清理冗余 / 续写 PROGRESS / 检查 README 健康。把"提交前的脏工作"标准化，避免一边推一边想起还有事没做。

核心价值：
- 防止把临时文件 / 散落工件推上去
- 强制 PROGRESS.md 与代码同步演进
- 维持目录 README 覆盖率

## 何时触发

**用户语言信号**（任一命中）：
- 中文：推 git / 推一版 / 推送 / 提交 / 上传 / commit 一下 / 提个 commit
- 英文：push / commit / let's commit / time to push

**特殊场景**：
- 用户走完 completion-gate 全部通过后，主动建议"是否推送？"也可作为切入

**不触发场景**：
- 用户在问"上次 commit 是什么"（查询而非动作）
- 用户在另一个上下文（讲解 git 知识）

## 三联检查

### 检查 1：cleanup（清理扫描）

扫描项：

1. **空目录**
   ```bash
   find . -type d -empty -not -path './.git/*' -not -path './node_modules/*'
   ```

2. **根目录散落工件**
   - `*.png` / `*.jpg`（截图）
   - `*.log` / `*.tmp`
   - `temp_*` / `test_*` / `_draft*` 文件

3. **02-temp 中超过 30 天未动**
   ```bash
   find 02-temp -type f -mtime +30
   ```

4. **claude-workspace/ 中陈旧产物**（行动规划完成 30 天后未清理）

5. **重复版本文件**（如 `xxx_v1.md` 和 `xxx_v2.md` 同时存在）

发现问题输出：
```
发现 N 个空目录：[路径]
发现 N 个根目录散落 PNG：[文件名]
02-temp 中 N 个文件超过 30 天未动
claude-workspace 整洁
```

### 检查 2：progress（PROGRESS 续写）

扫描项：

1. **PROGRESS.md 距上次更新天数**
   ```bash
   git log -1 --format='%cr' -- PROGRESS.md
   ```

2. **距上次 PROGRESS 更新后的关键 commit**
   ```bash
   git log --since="$(git log -1 --format=%aI -- PROGRESS.md)" --format='%h %s'
   ```

3. **基于 commit 自动生成续写草稿**
   - 提取最近 N 个 commit subject
   - 按 feat / fix / docs / refactor 分类
   - 生成 markdown 段落

输出：
```
距上次 PROGRESS 更新 N 天
续写草稿（基于最近 N commit）：

### YYYY-MM-DD 进度
- feat: 完成 X
- fix: 修复 Y
- 进行中: Z

操作选择：
[a] 使用草稿（追加到 PROGRESS.md）
[b] 我来编辑（暂停等待用户）
[c] 跳过本次（记录跳过理由）
```

### 检查 3：readme（README 健康）

扫描项：

1. **覆盖率**：所有 1-2 级目录是否有 README.md
   ```bash
   find . -maxdepth 2 -type d -not -path './.git*' -not -path './node_modules*'
   ```
   对比每个目录是否有同级 README.md

2. **过期检测**：最近修改的目录其 README 是否同步更新
   - 找 7 天内有文件变更的目录
   - 查该目录 README mtime
   - 如 README mtime 早于该目录最近变更 7 天以上 → 标记过期

3. **空 README**：文件存在但内容 < 10 行 → 标记待完善

输出：
```
覆盖率 N/M 目录有 README（X%）
{若 < 100%}
缺失 README：
- 00-public/3-tech/

可能过期的 README（目录有变更但 README 未更新）：
- 00-public/product-V-0.2.0-D-5.0/plan/（plan 文件 3 天前更新，README 14 天前）
```

## 标准流程

### Step 1：识别用户意图

确认用户确实要 commit/push（如歧义则反问"你是要现在提交吗？"）。

### Step 2：并行执行三项检查

收集 cleanup / progress / readme 的扫描结果。

### Step 3：渲染汇总报告

按"输出格式"输出。

### Step 4：用户选择

3 个出口：
- **A. 全部处理后推送**（推荐）：逐项与用户确认处理
- **B. 跳过具体项**：用户输入跳过编号（如"跳过 1.2、3"）
- **C. 强制推送**：写日志后放行

### Step 5：执行操作

- 选 A：进入逐项处理流（每项处理完用户确认 → 下一项）
- 选 B：跳过项写入 `02-temp/skipped-checks.md`，其余项处理
- 选 C：写入 `02-temp/forced-push.log`，立即放行

### Step 6：放行 commit / push

确认所有处理完后，执行：
```bash
git add <相关文件>
git commit -m "..."
# 如用户要 push 才执行 git push
```

## 输入 / 输出

**输入**：用户的提交意图

**输出**：
- 1 个三联检查汇总报告
- 0/1 个 PROGRESS 草稿（追加到 PROGRESS.md）
- 0/1 个 skipped-checks.md 条目
- 0/1 个 forced-push.log 条目
- 0/1 个 git commit（最终推送）

## 输出格式

```
推送前检查（git-push-guard）

[1/3] 清理扫描
  发现 N 个空目录
  发现 N 个根目录散落 PNG：xxx.png, yyy.png
  02-temp 整洁
  claude-workspace 整洁

[2/3] PROGRESS 续写
  距上次更新 N 天
  草稿（基于最近 N commit）：
     ### {date}
     - feat: ...
     - fix: ...
     - 进行中: ...

[3/3] README 健康
  覆盖率 8/9（89%）
  缺失：00-public/3-tech/README.md
  可能过期：00-public/product-V-0.2.0-D-5.0/plan/README.md

------
总结：发现 5 项需处理
  - cleanup：2 项（空目录 + 散落 PNG）
  - progress：1 项（续写草稿）
  - readme：2 项（缺失 + 过期）

操作选择：
[A] 全部处理后推送（推荐）
[B] 跳过具体项（输入编号，如「跳过 1.2、3」）
[C] 强制推送（不推荐，会写 forced-push.log）
```

## 强制门控

- **默认 A 路径**，发现问题不直接放行 commit
- 用户必须明确选 B 或 C 才放行
- 选 C 时**追加日志**（不覆盖）：
  ```
  02-temp/forced-push.log

  [YYYY-MM-DD HH:mm]
  跳过项：cleanup, readme
  原因：[用户填写]
  本次 commit hash: <推送后回填>
  ```

## 实施要点

1. **顺序执行 vs 并行**：3 项检查并行采集（节省时间），结果合并后串行展示
2. **PROGRESS 草稿质量**：
   - 至少含日期 + commit subject
   - 自动按 conventional commit 类型分组（feat / fix / docs / refactor / chore）
   - 长度控制在 5-15 行
3. **README 过期阈值**：默认 7 天，可调
4. **commit message**：本 skill 不替用户写 commit message（除非用户明说），让用户自己写或调用其他 skill

## 注意事项

- 不主动 `git add -A`，仅 add 用户已触动的文件 + 检查产生的 PROGRESS 续写
- 不替用户 push（用户没说 push 只说 commit 时不要 push）
- 强制门控的存在是为了"强制思考"，但不要变成"强制反对"——用户给出充分理由的跳过应被尊重
- 该 skill 与 completion-gate 互补：completion-gate 关注"任务做完了吗"，git-push-guard 关注"代码推之前清理好了吗"
- 如遇 git 钩子失败，按 CLAUDE.md 中的 Git Safety Protocol 处理（不要 --no-verify）
