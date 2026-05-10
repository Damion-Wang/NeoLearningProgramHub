# 02-temp/ — DM 临时工作区

> **拥有者**：DM（王鼎明）
> **当前状态**：D-5.1 工作期活跃（9 个工作档保留 / D-5.1 封板时统一清理或归档）
> **最近更新**：2026-05-08
> **目的**：DM 自己实际打字写的临时改动 + D-5.1 工作期 Claude / DM 联合产出的探索 / mock / 设计稿

## 当前文件清单

```
02-temp/
├── README.md                                       本文件
├── record                                          DM 录音转文字（2026-04-13 / 9KB / 无扩展名纯文本）
│
├── D-5.1-recap-build-plan-2026-05-07.md          D-5.1 recap 构建规划
├── recap-report-v6-mock-2026-05-07.md            recap 报告 v6 mock 实例（3 个 / 基层管理者 / 王芳 / 李伟 / 陈娟）
├── recap-report-v7-design-2026-05-07.md          recap 报告 v7 设计要点（→ 落地 D-5.1/05-recap.md）
│
├── feature-tree-debate-2026-05-06.md             feature-tree 5 角色辩论（已归档暂停）
├── feature-tree-method.md                         feature-tree 方法论
├── feature-tree-method-2026-05-06.md             feature-tree 方法论 v2
├── feature-tree-L1-L2-draft.md                   F.1-F.4 学员端/管理端/全局/Agent 拆分草稿
└── feature-tree-progress.md                       feature-tree 探索进展记录
```

## 文件状态分类

| 类别 | 文件 | 状态 | 处理时机 |
|------|------|------|----------|
| **DM 原始材料** | `record` | 永久保留 | — |
| **D-5.1 recap 工作档** | `D-5.1-recap-build-plan` / `recap-report-v6-mock` / `recap-report-v7-design` | 已落地 D-5.1/05-recap.md | D-5.1 封板时归档 |
| **feature-tree 探索** | `feature-tree-*` 5 文件 | 已暂停（DM 切到 recap）| D-5.1 封板时统一决定保留/归档 |

## 清理原则

- 本目录文件经确认后应归档到 `00-public/` 对应目录或决议包
- D-5.1 封板时（DM 决定整合到 D-5.2 / D-6.0 时）整体清理本目录
- 本目录**不参与版本号体系**，不需要 frontmatter
- DM 想写新笔记直接 `02-temp/<name>.md` 即可

## 与 claude-workspace 的区别（历史）

- ~~`claude-workspace/`~~ —— Claude 临时区（已退场 2026-05-06 / 14M 过程档全部清理）
- `02-temp/` —— 现在双用：DM 自己打字 + D-5.1 工作期联合产出（按"收完即清"原则在封板时统一处理）

## 历史

- **2026-05-08**：D-5.1 工作期临时档活跃保留（9 个文件 / README 重写反映现状）
- **2026-05-06**：claude-workspace/ 14M 过程档全部清理（D-5.0 交付一并退场）/ 本 README 简化
- **2026-04-29**：原 02-temp 中 17 项分流到 claude-workspace（含归档 / cleanup-plan / gap-report 等）
