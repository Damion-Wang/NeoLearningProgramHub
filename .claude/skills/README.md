# 项目级 Skills 索引

本目录下的 Skill 是 AI_TUTOR_PROJECT 项目专属的工作流增强能力，由 Claude 自动或显式触发。

## 概览

| Skill | 用途 | 触发时机 | 输出 |
|-------|------|----------|------|
| [multi-round-debate](./multi-round-debate/SKILL.md) | 5 角色辩论生成产品决策 | 用户说"5 角色辩论"/面临设计分歧 | `process/debates/round-N-*.md` |
| [session-opener](./session-opener/SKILL.md) | 新对话开场显示项目状态续接 | session 第一次工具调用前自动 | 1 屏仪表盘消息 |
| [completion-gate](./completion-gate/SKILL.md) | 用户声明"完成"时强制 4 件套核验 | 用户说"完成/搞定/done" | 门控报告 + 跳过日志 |
| [git-push-guard](./git-push-guard/SKILL.md) | 推送前 cleanup + progress + readme 三联检查 | 用户说"推 git/commit/push" | 三联报告 + 续写草稿 |

## 使用建议

### 日常工作流（典型一天）

```
1. 新 session 开始
   ↓
2. session-opener 自动展示仪表盘
   ↓
3. 用户选 A/B/C 或自定义任务
   ↓
4. 工作中遇到设计分歧 → multi-round-debate
   ↓
5. 完成阶段性任务 → 用户说"完成"
   ↓
6. completion-gate 反问 4 件套
   ↓
7. 全部通过 → 用户说"推一版"
   ↓
8. git-push-guard 三联检查
   ↓
9. 处理 / 跳过 / 强制 → 提交
```

### 跳过机制

每个 Skill 都支持跳过，但跳过会被记录：
- session-opener：用户说"跳过开场"
- completion-gate：用户回复"强制完成" → `02-temp/skipped-checks.md`
- git-push-guard：用户选 C 强制推送 → `02-temp/forced-push.log`

跳过日志的存在不是为了惩罚，而是供下次同类场景做提示。

## 与 SDD 的关系

本项目已在 `CLAUDE.md` 中声明 **SDD 豁免**，因此：

- 这 4 个 Skill 都**不依赖** Backlog / Phase / Skill 链路
- 与 `/sdd:*` skill 互不冲突，可并存
- 用户可显式调用 `/sdd:setup` 等重启 SDD 流程

## 文件标准

每个 Skill 是一个目录，含 `SKILL.md`：

```markdown
---
name: skill-name
description: 一句话说明
trigger: 触发关键词或时机
---

## 用途
## 何时触发
## 标准流程
## 输入 / 输出
## 模板（如有）
## 注意事项
```

## 维护

- 新增 Skill：在本目录新建 `<skill-name>/SKILL.md`，并在本 README 表格中加一行
- 修改 Skill：直接编辑 SKILL.md，重大变更建议在 commit message 中说明
- 删除 Skill：连同目录一起删除，并从本 README 中移除条目

## 相关文件

- `CLAUDE.md`：项目顶层指令（SDD 豁免声明在此）
- `00-public/4-decisions/`：架构决策记录（multi-round-debate 输出可沉淀于此）
- `02-temp/next-step.md`：会话尾巴留下的下次入口（session-opener 读取）
- `02-temp/skipped-checks.md`：completion-gate 的跳过日志
- `02-temp/forced-push.log`：git-push-guard 的强制推送日志
- `process/debates/`：multi-round-debate 的归档目录
