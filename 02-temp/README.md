# 02-temp/ — DM 临时工作区

> **拥有者**：DM（王鼎明）
> **最近一次重整**：2026-04-29
> **目的**：DM 自己实际打字写的临时改动、笔记、思考

## 当前状态

**目录基本为空**——DM 实际很少自己打字写文件，绝大多数"会议笔记 / 分析 / 规划"都是 Claude 帮 DM 整理的，已统一归到 `claude-workspace/`。

```
02-temp/
├── README.md       本文件
└── record          DM 自己的录音转文字（2026-04-13，9KB，非 markdown）
```

> 注：`record` 是个无扩展名的纯文本文件（不是目录），是 DM 用录音转写的会议原始记录，是 DM 真正"亲手"产出的内容（语音输入也算）。

## 与 claude-workspace/ 的关系

| 目录 | 拥有者 | 内容性质 |
|------|--------|---------|
| `02-temp/` | **DM** | DM 亲手打字的临时改动 / 笔记（不是 Claude 整理的产出） |
| `claude-workspace/` | **Claude** | 行动规划、会议分析、gap 报告、备份、审查产出、执行 log |

**判断标准**：按"实际打字的人"分流，而非内容主题。即使是 DM 视角的产品思考，只要是 Claude 整理成 markdown 的，归 `claude-workspace/`。

## 历史归档去向（2026-04-29 大整理）

原 02-temp 中的 17 项已分流：
- 5 项移到 `claude-workspace/`（cleanup-plan + 2 gap-report + backup + review/03-full）
- 10 项历史 Claude 产出移到 `claude-workspace/archive/2026-04/`：
  - 0424 会议系列 3 个（meeting-analysis / spec-diff / spec-diff-decisions）
  - 0420 会议系列 3 个（leo-neo-design / meeting-notes / v31-analysis）
  - v3-founder-feedback / pending-updates / requirements-restructure-plan / project-cleanup-plan

## 清理原则

- 本目录文件经确认后应归档到 `00-public/` 对应目录
- 季度末整体归档为 `02-temp/archived-YYYY-Q*/`
- 本目录**不参与版本号体系**，不需要 frontmatter
- DM 想写新笔记直接 `02-temp/<name>.md` 即可
