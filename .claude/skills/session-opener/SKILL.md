---
name: session-opener
description: 每次新对话开场显示项目状态续接仪表盘（commit/PROGRESS/未提交变更/next-step）
trigger: session 第一次工具调用前自动触发；用户说"开场"/"续接"/"项目状态"也可手动触发
---

## 用途

新 session 开始时，自动展示一个"项目续接仪表盘"，帮助用户快速回到上次的上下文，避免冷启动遗忘。

核心价值：
- 减少"上次做到哪了？"的回忆成本
- 自动暴露 PROGRESS / commit / next-step 的健康度
- 在 1 屏内给出"今日开工建议"

## 何时触发

**自动触发**：
- 新 session 第一次 Bash / Read / Write / Edit 等工具调用前
- Claude 检测到这是 session 首条消息时主动展示

**手动触发**：
- 用户说"开场"、"项目状态"、"续接"、"我回来了"、"今天做什么"

**跳过机制**：
- 用户回复"跳过开场"/"skip opener"，本次绕过
- 跳过不持久化，下次 session 仍展示

## 标准流程

### Step 1：收集状态数据

并行执行（一次 Bash 多命令 / 多 Read）：

1. **上次 commit 信息**
   ```bash
   git log -1 --format='%cr|%s' 
   ```
   解析"N 天前"和 commit message

2. **PROGRESS.md 最后更新时间**
   ```bash
   git log -1 --format='%cr' -- PROGRESS.md
   ```
   或读取文件 mtime

3. **未提交变更**
   ```bash
   git status --short
   ```
   计数 modified / untracked 文件

4. **next-step 文件**
   - 路径：`02-temp/next-step.md`
   - 用 Read 工具读取（如不存在跳过）

5. **未完成 task list**
   - 检查 `02-temp/todo.md` / `PROGRESS.md` 中 `- [ ]` 行数

### Step 2：判定告警

| 指标 | 健康 | 提醒 | 严重 |
|------|------|------|------|
| 距上次 commit | < 3 天 | 3-7 天 | > 7 天 |
| 距 PROGRESS 更新 | < 3 天 | 3-7 天 | > 7 天 |
| 未提交文件数 | 0-5 | 6-15 | > 15 |
| next-step.md | 存在 | 存在但 > 7 天前 | 不存在 |

### Step 3：输出仪表盘

按下方"输出格式"渲染。

### Step 4：等待用户选择

提供 3 个选项（A/B/C），用户回复后进入对应工作流。

## 输入 / 输出

**输入**：无（自动从 git + 文件系统采集）

**输出**：1 个 markdown 仪表盘消息（不写文件）

## 输出格式

```
项目续接（睿学业务规划）

上次 commit：{N} 天前 — "{commit message 截断 60 字}"
PROGRESS：{N} 天前更新 {如超 7 天加告警}
未提交变更：{N} 个文件 {如 > 15 加告警}
上次 next-step：{读 02-temp/next-step.md 首段；不存在显示"无"}

注意事项：
- {如 PROGRESS > 7 天：建议先续写 PROGRESS}
- {如未提交 > 15：建议先 git-push-guard 整理}
- {如 next-step 不存在：建议本次结尾留下 next-step}

今日开工建议（3 选 1）：
A. 继续上次的 next-step → "{next-step 首句}"
B. 整理：执行 git-push-guard 检查 + 提交
C. 其他（用户输入）
```

**渲染示例**（健康状态）：
```
项目续接（睿学业务规划）

上次 commit：2 天前 — "feat(prototype): 完整 demo v1.1 交付 + 11 条 DoD 修复"
PROGRESS：1 天前更新（健康）
未提交变更：3 个文件
上次 next-step：完成 4 个项目级 Skill 创建

项目状态健康，无需特别处理

今日开工建议（3 选 1）：
A. 继续 next-step：完成 4 个项目级 Skill 创建
B. 整理：执行 git-push-guard 检查 + 提交  
C. 其他
```

**渲染示例**（告警状态）：
```
项目续接（睿学业务规划）

上次 commit：12 天前（告警）— "feat: 更新版本"
PROGRESS：14 天前更新（严重）
未提交变更：23 个文件（告警）
上次 next-step：无（02-temp/next-step.md 不存在）

注意事项：
- PROGRESS 超 14 天未更新，建议续写
- 未提交文件 23 个，建议先走 git-push-guard
- 无 next-step 记录，建议本次结尾补上

今日开工建议（3 选 1）：
A. 直接干活（用户输入今日任务）
B. 整理：执行 git-push-guard（推荐）
C. 续写 PROGRESS + 补 next-step
```

## 实施要点

1. **触发时机**：session 开始时若用户首条消息**不是**"跳过开场"，则展示仪表盘**前置**于其他响应
2. **采集失败兜底**：
   - 不在 git 仓库 → 跳过 commit/status 部分
   - PROGRESS.md 不存在 → 显示"未找到"
3. **token 节省**：仪表盘控制在 20 行内，避免占用过多上下文
4. **避免重复**：同 session 内多次工具调用不重复展示，仅首次
5. **模式判定**：本 skill 不进入 SDD / Direct-Edit 模式判定流程，独立于 routing.md

## 注意事项

- 不修改任何文件（只读 + 输出）
- 不主动创建 02-temp/next-step.md（仅读取）
- 仪表盘数据要"快"：所有命令 < 2 秒完成
- 如用户在仪表盘后立即给出新任务，按新任务走，不强制走 A/B/C
