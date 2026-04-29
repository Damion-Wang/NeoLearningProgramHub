---
title: 项目清理 + 版本号体系 + 目录重组执行方案
date: 2026-04-29
version: v3（2026-04-29 加入 DM_Temp 全删 + 临时区拆 2 个 + CLAUDE.md 章节同步）
status: 待审 → 审完后执行
owner: DM
---

# 清理方案 v3（2026-04-29）

> 目的：建立 V-0.2.0 时期的版本归集体系 + 厘清临时区职责 + 同步项目阶段。
>
> **v3 变更**（v2 → v3）：
> - DM_Temp/ 整个删除（不仅是 prototype/）
> - 临时区拆为 2 个：`02-temp/`（DM 临时区）+ `claude-workspace/`（Claude 临时区）
> - 02-temp 现有 17 项按"创建者"分流
> - CLAUDE.md "底层建设阶段（当前）"章节同步改为"V-0.2.0 / D-5.0 spec 推进期"
> - GitLab 改名时机确定为后做

---

## 1. 项目命名层（决策结果）

| 层级 | 现状 | 目标 |
|------|------|------|
| 本地工作目录 | `D:\绚星科技\02-Research\AI-tutor\20260408睿学业务规划\` | **不动**（避免 session 中断） |
| 项目内部名（README/CLAUDE.md 内文） | "AI_TUTOR_PROJECT · 睿学业务规划" | **20260408睿学program版产品规划** |
| Git 仓库（GitLab 后台） | `pmpoc/AI_TUTOR_PROJECT` | **NeoLearningProgramPRD**（Phase 8 你后台改完给我新 URL，我用 `git remote set-url` 更新） |
| 产品版本（跨多稿） | 无 | **V-0.2.0**（用到 6 月交付，未指示前不要更新） |
| 文档版本 | 无 | **D-4.0**（已审阅 spec + 原型）/ **D-5.0**（v0.5.0 plan/ 草稿） |

**临时区职责划分（v3 新增）**：

| 目录 | 拥有者 | 用途 |
|------|--------|------|
| `02-temp/` | **DM** | DM 自己的临时改动、会议笔记、产品思考、未定型笔记 |
| `claude-workspace/` | **Claude** | 行动规划、gap 报告、备份、审查产出、执行 log |
| `DM_Temp/` | **删除** | 历史遗留，prototype 已搬走，整个目录退场 |

---

## 2. 完整目标目录结构

```
20260408睿学业务规划/                              ← 本地目录名不动
├── README.md                                     ← 重写：项目改名 + 新结构导航
├── CLAUDE.md                                     ← 改：路径引用更新 + 阶段同步
├── PROGRESS.md                                   ← 改：加 Phase 14 清理记录
├── 使用手册.md                                    ← 视情况改
├── .claude/                                      ← 不动
├── .gitignore                                    ← 不动
├── 00-public/
│   ├── README.md                                 ← 重写：新结构导航
│   ├── product-V-0.2.0-D-4.0/                    ← ★ 新建
│   │   ├── README.md
│   │   ├── VERSION.md
│   │   ├── feature-tree/                         ← 移自 1-product/feature-tree/（13 文件）
│   │   ├── spec/                                 ← 移自 1-product/spec/design/（17 文件含 README）
│   │   │   ├── README.md
│   │   │   ├── requirements-v0.4.0.md
│   │   │   ├── 00-future-iterations.md           (去 [已审阅])
│   │   │   ├── common/                           ← 含 00/01/02 + README（03-ai-brand 移走）
│   │   │   ├── learner/                          ← 含 00~07 + README
│   │   │   └── management/                       ← 含 00~04 + README
│   │   └── prototype/                            ← 移自 DM_Temp/prototype/
│   │       ├── README.md
│   │       ├── assets/
│   │       └── build/                            ← 11 个 HTML
│   ├── product-V-0.2.0-D-5.0/                    ← ★ 新建
│   │   ├── README.md
│   │   ├── VERSION.md
│   │   └── plan/                                 ← 移自 1-product/spec/plan/（6 文件含 README）
│   │       ├── README.md
│   │       ├── 01-spec-update-plan-2026-04-27.md
│   │       ├── 02-v0.5.0-outline.md
│   │       ├── 03-v0.5.0-full.md
│   │       ├── 04-v0.5.0-backlog.md
│   │       └── 05-v0.5.0-section-7-9.md
│   ├── 2-business/
│   │   ├── README.md                             ← 改：加 brand/ai-brand 引用
│   │   ├── brand/
│   │   │   ├── ai-brand.md                       ← ★ 新增（移自 spec/common/03-ai-brand.md）
│   │   │   ├── brand-personality.md
│   │   │   ├── mission-vision-values.md
│   │   │   ├── tone-of-voice.md
│   │   │   └── README.md
│   │   └── ...其他不动
│   ├── 3-tech/                                   ← 不动
│   ├── 4-decisions/                              ← 不动
│   ├── 5-process/                                ← 不动
│   └── 6-content/                                ← 不动
│   (1-product/ 完全删除)
├── 01-ref/                                       ← 不动
├── 02-temp/                                      ← DM 临时区（保留 + 重写 README）
│   ├── README.md                                 ← 重写：声明这是 DM 区
│   ├── 0424-meeting-analysis.md
│   ├── 0424-spec-diff.md
│   ├── 0424-spec-diff-decisions.md
│   ├── 2026-04-20-leo-neo-design.md
│   ├── 2026-04-20-meeting-notes.md
│   ├── 2026-04-20-v31-analysis.md
│   ├── v3-founder-feedback.md
│   ├── pending-updates.md                        ← DM 早期产品笔记
│   ├── requirements-restructure-plan.md          ← DM 早期产品思考
│   ├── project-cleanup-plan.md                   ← DM + Claude 共创，DM 主导
│   └── record/                                   ← 空目录，保留
├── claude-workspace/                             ← ★ 新建：Claude 临时区
│   ├── README.md                                 ← 新建：声明这是 Claude 区 + 索引
│   ├── cleanup-plan-2026-04-29.md                ← 移自 02-temp/
│   ├── product-cleanup-gap-report.md             ← 移自 02-temp/
│   ├── spec-cleanup-gap-report.md                ← 移自 02-temp/
│   ├── backup/
│   │   └── 03-v0.5.0-full.backup-2026-04-29.md   ← 移自 02-temp/backup/
│   └── review/
│       └── 03-full/                              ← 移自 02-temp/review/
│           ├── 00-summary.md
│           ├── 01-global-review.md
│           ├── 02-meso-review.md
│           ├── 03-detail-review.md
│           ├── 04-relation-review.md
│           └── repair-tasks.md
└── (DM_Temp/ 整个删除：prototype/ 已搬走，README.md + .gitkeep 一并清掉)
```

**净影响**（v3 总览）：
- 新建 3 个目录：`product-V-0.2.0-D-4.0/`、`product-V-0.2.0-D-5.0/`、`claude-workspace/`
- 移动文件：spec 17 + feature-tree 13 + prototype 12 + plan 6 + 2-business 1 + 02-temp 5（含 backup/review 整个目录） ≈ **54 项**
- 仅去 `[已审阅]` 前缀，其他文件名一律不动
- 删除 2 个目录：`1-product/`、`DM_Temp/`

---

## 3. 文件搬迁清单

### 3.1 spec → product-V-0.2.0-D-4.0/spec/

| from | to | 备注 |
|------|-----|------|
| `00-public/1-product/spec/design/[已审阅]00-future-iterations.md` | `00-public/product-V-0.2.0-D-4.0/spec/00-future-iterations.md` | 去 `[已审阅]` |
| `00-public/1-product/spec/design/requirements-v0.4.0.md` | `00-public/product-V-0.2.0-D-4.0/spec/requirements-v0.4.0.md` | 不改名 |
| `common/[已审阅]00-overview.md` ~ 02-notification.md (3 个) | `product-V-0.2.0-D-4.0/spec/common/*.md` | 去 `[已审阅]` |
| `common/03-ai-brand.md` | `00-public/2-business/brand/ai-brand.md` | **跨目录** + 去编号 |
| `learner/[已审阅]00-overview.md` ~ 06-notes.md (7 个) | `product-V-0.2.0-D-4.0/spec/learner/*.md` | 去 `[已审阅]` |
| `learner/07-discovery-library.md` | `product-V-0.2.0-D-4.0/spec/learner/07-discovery-library.md` | 不改名 |
| `management/[已审阅]00-overview.md` ~ 04-message.md (5 个) | `product-V-0.2.0-D-4.0/spec/management/*.md` | 去 `[已审阅]` |
| 各级 README.md | 同位置 | 不改名 |

### 3.2 feature-tree → product-V-0.2.0-D-4.0/feature-tree/

| from | to |
|------|-----|
| `00-public/1-product/feature-tree/*` (13 文件) | `00-public/product-V-0.2.0-D-4.0/feature-tree/*` |

不改名。

### 3.3 prototype → product-V-0.2.0-D-4.0/prototype/

| from | to |
|------|-----|
| `DM_Temp/prototype/build/01-login.html` ~ `11-inquiry-p3.html` (11 个) | `product-V-0.2.0-D-4.0/prototype/build/*.html` |
| `DM_Temp/prototype/assets/*` | `product-V-0.2.0-D-4.0/prototype/assets/*` |
| `DM_Temp/prototype/README.md` | `product-V-0.2.0-D-4.0/prototype/README.md` |

不改名。

### 3.4 plan → product-V-0.2.0-D-5.0/plan/

| from | to |
|------|-----|
| `00-public/1-product/spec/plan/*.md` (6 个含 README) | `00-public/product-V-0.2.0-D-5.0/plan/*.md` |

不改名。

### 3.5 02-temp 分流 → claude-workspace/（v3 新增）

**留在 02-temp（DM 区）**：
- 0424-meeting-analysis.md
- 0424-spec-diff.md
- 0424-spec-diff-decisions.md
- 2026-04-20-leo-neo-design.md
- 2026-04-20-meeting-notes.md
- 2026-04-20-v31-analysis.md
- v3-founder-feedback.md
- pending-updates.md
- requirements-restructure-plan.md
- project-cleanup-plan.md
- record/（空目录，保留）
- README.md（重写为 DM 区声明）

**搬到 claude-workspace/（Claude 区）**：
| from | to |
|------|-----|
| `02-temp/cleanup-plan-2026-04-29.md` | `claude-workspace/cleanup-plan-2026-04-29.md` |
| `02-temp/product-cleanup-gap-report.md` | `claude-workspace/product-cleanup-gap-report.md` |
| `02-temp/spec-cleanup-gap-report.md` | `claude-workspace/spec-cleanup-gap-report.md` |
| `02-temp/backup/03-v0.5.0-full.backup-2026-04-29.md` | `claude-workspace/backup/03-v0.5.0-full.backup-2026-04-29.md` |
| `02-temp/review/03-full/` (整个目录 6 文件) | `claude-workspace/review/03-full/` |

### 3.6 DM_Temp/ 整个删除（v3 新增）

- `DM_Temp/prototype/` → 已在 §3.3 搬走
- `DM_Temp/README.md` → 删
- `DM_Temp/prototype/.gitkeep` → 删
- `DM_Temp/` 空目录 → rmdir

---

## 4. 版本元信息体系（三件套）

### 4.1 顶层目录名（最强信号）

`00-public/product-V-0.2.0-D-4.0/` 这一层目录名本身就是版本号载体。

### 4.2 文件头 frontmatter

每个 .md 头部加：

```yaml
---
title: <文件原标题>
version: V-0.2.0-D-4.0
product-version: V-0.2.0
doc-version: D-4.0
status: 已审阅 | 未审阅 | 草稿
last-updated: 2026-04-29
---
```

HTML 文件用顶部注释：

```html
<!--
  version: V-0.2.0-D-4.0
  status: 已审阅
  last-updated: 2026-04-29
-->
```

### 4.3 各级 README banner + 顶层 VERSION.md

各级 README 第一段：

```markdown
> **版本**：V-0.2.0-D-4.0 · **状态**：已审阅 · **更新**：2026-04-29
> 本目录隶属于产品 V-0.2.0 时期的第 4 版文档（已审阅 spec + 原型）。
```

每个版本目录顶层 `VERSION.md` 含：产品版本/文档版本/性质/完成时间/含子目录/文件数/历史。

---

## 5. 引用更新清单

### 5.1 必须改的文件

| 文件 | 改什么 |
|------|--------|
| `README.md`（顶层） | 项目改名 "20260408睿学program版产品规划"；新结构导航；加 claude-workspace/ 说明 |
| `CLAUDE.md` | ① 全部 `00-public/1-product/spec/design/` → `00-public/product-V-0.2.0-D-4.0/spec/`；② `1-product/feature-tree/` → `product-V-0.2.0-D-4.0/feature-tree/`；③ `DM_Temp/prototype/` → `product-V-0.2.0-D-4.0/prototype/`；④ "底层建设阶段（当前）" → "V-0.2.0 / D-5.0 spec 推进期"；⑤ 加 claude-workspace 说明 |
| `PROGRESS.md` | 加 Phase 14 清理记录 |
| `使用手册.md` | 视情况，扫一遍路径引用 |
| `00-public/README.md` | 重写：新顶层结构 |
| `00-public/2-business/README.md` | 加 brand/ai-brand.md 引用 |
| `02-temp/README.md` | 重写：声明这是 DM 临时区，列剩余文件 |
| `claude-workspace/README.md` | 新建：声明这是 Claude 临时区，列已搬入文件 |

### 5.2 spec 内部交叉引用

```
旧 → 新
00-public/1-product/spec/design/         → 00-public/product-V-0.2.0-D-4.0/spec/
00-public/1-product/feature-tree/        → 00-public/product-V-0.2.0-D-4.0/feature-tree/
DM_Temp/prototype/                       → 00-public/product-V-0.2.0-D-4.0/prototype/
00-public/1-product/spec/plan/           → 00-public/product-V-0.2.0-D-5.0/plan/
00-public/1-product/spec/design/common/03-ai-brand → 00-public/2-business/brand/ai-brand
[已审阅]                                  → (去掉)
02-temp/review/                          → claude-workspace/review/    (claude 自产物)
02-temp/backup/                          → claude-workspace/backup/    (claude 自产物)
```

**注意**：v3 不改文件名（除去 [已审阅] 前缀），所以引用更新只需替换路径。

---

## 6. 执行步骤（Phase 1-8）

### Phase 1：备份 + git checkpoint
- 完整 commit 当前状态：`chore: 清理重组前 checkpoint v3`
- 复制一份 `00-public/1-product/` + `DM_Temp/` → `claude-workspace/backup/pre-cleanup-2026-04-29/`
- （等 claude-workspace/ Phase 3 才建好，所以先暂存到旧 02-temp/backup/，Phase 3 后再 mv）

### Phase 2：grep 收集所有路径引用
- grep 全仓 `1-product/spec/design`、`1-product/feature-tree`、`DM_Temp/prototype`、`1-product/spec/plan`、`[已审阅]`、`02-temp/review`、`02-temp/backup`
- 输出引用清单到 `claude-workspace/cleanup-refs-found.md`（Phase 3 后写入）

### Phase 3：建新目录骨架
- mkdir `00-public/product-V-0.2.0-D-4.0/{spec/{common,learner,management},feature-tree,prototype/{assets,build}}`
- mkdir `00-public/product-V-0.2.0-D-5.0/plan`
- mkdir `claude-workspace/{backup,review}`
- 写各级 VERSION.md + README

### Phase 4：批量搬迁 + 改名
- 按 §3.1-§3.5 清单 git mv
- 仅去 `[已审阅]` 前缀，其他不改名
- ai-brand.md 跨目录到 2-business/brand/
- 02-temp 5 项 → claude-workspace（含 backup/review 整目录）

### Phase 5：加 frontmatter / HTML 注释
- 每个 .md 头部加 frontmatter（spec/feature-tree/plan/prototype 文件，约 35 个）
- 11 个 HTML 头部加注释

### Phase 6：批量替换引用
- sed/Edit 批量改 CLAUDE.md / PROGRESS.md / 各 README / spec 内交叉引用
- 注意：plan/03-full 内可能有上百处 spec 路径引用，需谨慎
- 同步改 CLAUDE.md "底层建设阶段（当前）" → "V-0.2.0 / D-5.0 spec 推进期"

### Phase 7：删除旧目录 + 验证 + commit
- 删 `00-public/1-product/`
- 删 `DM_Temp/`
- 全仓 grep 旧路径残留：应为 0
- commit：`refactor: V-0.2.0 目录归集 + 临时区拆分 + DM_Temp 退场`

### Phase 8：GitLab 改名（你来）
- 你在 GitLab 后台改仓库名 `AI_TUTOR_PROJECT` → `NeoLearningProgramPRD`
- 给我新 URL，我执行：`git remote set-url origin <新 URL>`
- push：`chore: 更新 git remote URL → NeoLearningProgramPRD`

---

## 7. 风险点 + 回滚方案

### 风险点
1. **交叉引用遗漏**：plan/03-full 文件内引用密集，可能有未匹配的 spec 路径
2. **claude-workspace/ 是新目录**：要确保 .gitignore 不会忽略它
3. **02-temp/review 历史快照内容**：review 文件中的旧路径不应改（它是历史快照），但搬到 claude-workspace 后路径标记仍有意义
4. **CLAUDE.md 路径同步**：CLAUDE.md 是你给我下指令的"宪法"，路径必改对
5. **DM_Temp/.gitkeep 是历史 placeholder**：直接删除无影响

### 回滚方案
- Phase 1 的 commit 是 checkpoint：`git reset --hard <checkpoint-commit>` 即可全量回滚
- Phase 1 的备份复制是文件级冗余

---

## 8. 验证清单（Phase 7 后）

### 目录结构
- [ ] `00-public/1-product/` 不存在
- [ ] `DM_Temp/` 不存在
- [ ] `00-public/product-V-0.2.0-D-4.0/spec/learner/` 含 8 个 *.md（含 README）
- [ ] `00-public/product-V-0.2.0-D-4.0/feature-tree/` 含 13 个文件
- [ ] `00-public/product-V-0.2.0-D-4.0/prototype/build/` 含 11 个 *.html
- [ ] `00-public/product-V-0.2.0-D-5.0/plan/` 含 6 个 *.md（含 README）
- [ ] `00-public/2-business/brand/ai-brand.md` 存在
- [ ] `claude-workspace/` 存在，含 cleanup-plan + 2 个 gap-report + backup/ + review/

### 引用清理
- [ ] grep `1-product/spec/design` → 0 hits（除 claude-workspace/review/ 历史快照）
- [ ] grep `[已审阅]` → 0 hits（除 claude-workspace/review/ 历史快照）
- [ ] grep `DM_Temp/prototype` → 0 hits（除 claude-workspace/review/ 历史快照）

### 文档更新
- [ ] CLAUDE.md "底层建设阶段（当前）" 已替换为 "V-0.2.0 / D-5.0 spec 推进期"
- [ ] CLAUDE.md 所有路径引用已更新
- [ ] 顶层 README.md 已重写
- [ ] 00-public/README.md 已重写
- [ ] 02-temp/README.md 重写为 DM 区声明
- [ ] claude-workspace/README.md 新建，含索引

---

**v3 关键变更回顾**：
- ✅ 临时区拆 2 个：02-temp（DM）+ claude-workspace（Claude）
- ✅ DM_Temp/ 整个删除
- ✅ 02-temp 分流：5 项搬到 claude-workspace，11 项 + 1 空目录 + README 留在 02-temp
- ✅ CLAUDE.md 阶段同步：底层建设期 → V-0.2.0 / D-5.0 spec 推进期
- ✅ GitLab 改名后做（Phase 8）

**总工时估算**：
- 我执行：Phase 1-7 全自动，约 30-50 分钟
- 你执行：Phase 8 GitLab 改名 + 给我新 URL，5 分钟

**审完回复 "OK 开干" 我就启动 Phase 1。**
