# 20260408睿学program版产品规划 — NeoLearningProgramPRD

> 睿学（NeoLearning）是面向企业的 AI-Native 培训交付平台。本期交付：睿学培训项目（NeoLearningProgram）。本仓库是产品规划 + 设计 + 原型工作树。
>
> **当前阶段**：V-0.2.0 / D-5.0 spec 推进期 —— D-4.0 已审阅 spec 冻结，D-5.0 v0.5.0 全文 §1-§9 完成（§10 管理端待写）

---

## 版本号体系（2026-04-29 启用）

| 维度 | 当前值 | 说明 |
|------|--------|------|
| 产品版本 | **V-0.2.0** | 产品大版本号，用到 6 月交付，未指示前不动 |
| 文档版本 | **D-4.0**（已冻结）/ **D-5.0**（在写）| 文档迭代版本号 |
| 文档归集 | `00-public/product-V-0.2.0-D-X.0/` | 顶层目录名即版本号载体 |
| 文件元数据 | frontmatter `version:` `status:` `last-updated:` | 单文件级元数据 |
| 目录元数据 | 各级 `VERSION.md` + README banner | 目录级元数据 |

---

## SDD 豁免声明

**本项目豁免 SDD 流程。**

- 所有文件改动**不走** Backlog / Skill / Phase 链路，按用户自然语言指令直接执行
- routing.md 中 Read-Only / SDD / Team 三模式判断降级为：Read-Only（只读问答） 或 Direct-Edit（直接改文件）两类
- `/sdd:*` skills 仅在用户**显式调用**时启用
- 如需重启 SDD，删除本节即可

---

## 关键路径

### D-4.0 已审阅 spec（冻结）
- 产品 spec：`00-public/product-V-0.2.0-D-4.0/spec/`（17 文件含 README × 4，去 [已审阅] 前缀）
- 功能树：`00-public/product-V-0.2.0-D-4.0/feature-tree/`（13 文件含 manifest）
- 原型 v1.1：`00-public/product-V-0.2.0-D-4.0/prototype/build/`（11 个 HTML）+ `prototype/assets/`（PPT/Neo 头像/mock 数据）

### D-5.0 在写 spec（草稿）
- v0.5.0 全文：`00-public/product-V-0.2.0-D-5.0/plan/03-v0.5.0-full.md`（§1-§9 完成）
- 实施 backlog：`00-public/product-V-0.2.0-D-5.0/plan/04-v0.5.0-backlog.md`
- 元规划与大纲：`plan/01-spec-update-plan` + `plan/02-outline` + `plan/05-section-7-9`

### 跨版本资产
- 商业分析：`00-public/2-business/`（含 brand/ai-brand.md）
- 决策记录：`00-public/4-decisions/`（含底层建设期-2026-04-26）
- 过程文档：`00-public/5-process/`
- 课程内容：`00-public/6-content/`

### 临时区（拥有者拆分）
- DM 临时区：`02-temp/`（DM 自己的临时改动、会议笔记、产品思考、未定型笔记）
- Claude 临时区：`claude-workspace/`（行动规划、gap 报告、备份、审查产出、执行 log）

### 参考资料
- 外部 demo：`01-ref/demo/`（视频 + coaching-skills JS 项目）
- 原型参考：`01-ref/prototype-references/`（5 个教室 HTML、NEO 头像原图）

---

## 核心约束（永久规则）

1. **品牌名**：产品叫「睿学」（中文）/「NeoLearning」（英文）；本期讨论的项目中文叫「睿学培训项目」/ 英文「NeoLearningProgram」；git 仓库名 `NeoLearningProgramPRD`；禁用「AI 老师」/「AI TUTOR」/「AI tutor」
2. **AI 角色**：**学员端只有 Neo**（2026-04-26 起，Leo 完全取消，对内对外都无 Leo）；Neo 在不同场域（授课/对练/调研/报告）展现不同技能与意愿；**Ora** 保留为管理端独立身份
   - **Neo 第一性目标 = 教学效果**（学员真实行为改变）—— **不是教学体验**！体验是手段 / 效果是目标 / Neo 可为效果适度损失体验（不当应声虫 / 错时直说 / 必收尾追问）
   - **Ora 第一性目标 = 给 HR 可举证 ROI 报告**；定位 = HR 的搭档（给建议 + 解读 + 选项 / **HR 拍板**）；不直接联系学员 / 不自动调度
3. **Neo 第一性原理**（2026-04-26 立）：Neo = 模拟 1v1 线下授课老师；通过 **讲授 / 解惑 / 讨论 / 考研 / 练习 / 追问 / 反思** 等动作，**逼着或带领学生掌握内容**。所有交互/Persona/产出物的总尺度 = "它让 Neo 更像 1v1 老师吗"
   - **能力上限**：Neo 不预设能力边界（24/7 / 跨学员对比 / 跨项目记忆 等技术能做到的都可以追求）
   - **风格立场**：像 1v1 真人老师（这是第一性原理锁定的）
4. **场域统一**：4 个学员端场域（授课/对练/调研/报告）用 Topbar + 覆盖式抽屉 + 全幅内容 + 右侧 AI Chat 统一布局
5. **2 个账号**：student01（张磊·中期学员+管理员，W5/16）/ newbie01（李明·初期学员+开营新运营，W0/16）
6. **spec 改动方式**：D-4.0 文件**已冻结**不改；新设计走 D-5.0（`product-V-0.2.0-D-5.0/plan/03-v0.5.0-full.md`），如需追加沿用"反向补充：XXX"章节惯例
7. **原型独立性**：每页自包含（CSS/JS 内联，图片 base64），仅 CDN 外链允许（Tailwind/Lucide/Fonts）
8. **调研边界**（2026-04-26 起）：第一性原理为基准 + spec v0.4.0 为 scope + 来源不设限——任何调研产出必须能映射回"它让 Neo 更像 1v1 老师吗"
9. **懂你 · 记忆系统底层原则**（2026-04-26 立）：Neo 必须**越用越懂学员**。跨场域 + 跨会话 + 跨课程的渐进画像构建；主动调用记忆（"我记得你上次说过…"）；记什么 / 何时调 / 如何避免幻觉式调用 是底层议题，不是 feature
10. **像人 · Soul/Persona 底层原则**（2026-04-26 立）：每个 Agent（Neo / Ora / Actor / 导演）必须有**自己的画像 + 立场**——**不能人云亦云**。Neo 是有价值观的老师，敢指出错位、拒绝低质回应、维护学习节奏、表达真实评估
    - **像人 > 懂你**（2026-05-03 校准）：当两者冲突（如学员希望 Neo 像朋友 vs 像人原则要求 Neo 保持立场），**像人优先**。懂你是适配手法 / 像人是根本。遇事不决参照 1v1 真人老师
11. **PM 协作风格**（2026-04-26 锁定 4 项）：
    - **PM 角度 + 不要问技术实现**：技术选型 / 架构 / 验证机制由研发决定，PM 只管效果与 Agent 表现
    - **遇事不决参照 1v1 真人老师**：设计冲突总判断器（不写入 Neo Soul，是 PM 工具）
    - **Soul 按场域差异化**：Neo 不是单一身份，按场域调用差异化 skill 与倾向
    - **不决定时间，研发能力决定**：不预设周数 / 节点
12. **临时区职责分离**（2026-04-29 立）：DM 临时改动写 `02-temp/`；Claude 行动规划/审查/备份写 `claude-workspace/`；不混用
13. **三方价值实际是两方**（2026-05-03 校准）：学员 + HR/管理员（**项目运营 = HR 同一组人**）；冲突时 **HR > 学员**（HR 是付钱方）；**关键理念：隐私 ≠ 学习效果**——Ora 读 raw 不冲突学员学习，所以 [02-foundation/01-personas § 1.4.3] "管理端例外" 不是矛盾
14. **三层文档定位**（2026-05-03 校准）：
    - **03-full = 唯一持久产品 spec 产出文档**（最终参考）
    - **04-backlog / claude-workspace 任何 .md = 临时工作区**（讨论完不持久 / 不参考 / 不"待建"）
    - **toc-discussion = 03-full 的索引视图**（因 full 太长抽出来）
    - **6-content/ KGP 内容生产规范文档不需要建**——任何"详见 KGP 内容生产规范文档（待建于 6-content/）"的引用都要清理 / 直接砍占位章节

---

## 底层建设产出

调研产出在 `00-public/4-decisions/底层建设期-2026-04-26/`：
- `README.md` — 入口
- `0-最终决策总览/50题决策清单与多维度分析.md` — ★ 50 题最终决策（研发应据此实施）
- `1-原则与框架/` — 三大底层原则 + PM 协作风格
- `2-Neo-Persona/` — Neo Soul final + Ora Soul 起点
- `3-记忆系统/` — Memory 设计原则
- `4-教学方法论/` — 7 动作理论家庭 + Neo 行为约束
- `5-数据集与样本/` — 可用资源 + HBR 91 集清单 + 下载脚本
- `6-原始调研/` — 10 份原始调研产出 ~70K 字
- `7-早期文档/` — ⚠️ 已被替代，研发不要参考

---

## V-0.2.0 / D-5.0 spec 推进期（当前阶段）

> **2026-04-29 起，项目已退出底层建设期，进入 V-0.2.0 / D-5.0 spec 推进期。**

**阶段定义**：
- 底层原则集已建立（第一性原理 / 懂你 / 像人）
- D-4.0 已审阅 spec 冻结，作为基线
- D-5.0 全文 §1-§9 已完成 + 4 维审查 + 53 任务全量修复
- §10 管理端待写

**阶段产出形态**：
1. **D-5.0 全文**：`00-public/product-V-0.2.0-D-5.0/plan/03-v0.5.0-full.md`（主体）
2. **D-5.0 backlog**：`00-public/product-V-0.2.0-D-5.0/plan/04-v0.5.0-backlog.md`（实施清单）
3. **审查产出**：`claude-workspace/review/03-full/`（4 维审查 + repair-tasks）
4. **修复备份**：`claude-workspace/backup/`

**何时退出**：D-5.0 §10 完成 + DM 决定开始研发对接（启动 D-6.0 或 V-0.2.1-D-1.0）。

---

## 工作流偏好

- **复杂任务先规划再执行**（写规划 md → 用户确认 → 启动 agent）
- **多文件改动用 Agent 并行**（Batch A/B/C 模式）
- **大量 UI 改动用 Playwright MCP 浏览器验证**（截图证据）
- **询问用户用 AskUserQuestion 工具**（不要文字列表）
- **决策点 1 次最多 4 个问题**（工具限制）

---

## 主动维护机制（Checkpoint Moments）

Claude 在以下时机**必须主动触发** Skill，不等用户开口：

### 强制检查点
- **session 开始首次工具调用前** → 触发 `session-opener`（显示昨日进展+待办+next-step）
- **用户说"完成"/"搞定"/"done"** → 触发 `completion-gate`（反问测试+文档+commit+决策 4 件套）
- **用户说"推 git"/"commit"/"提交"** → 触发 `git-push-guard`（强制 cleanup+progress+readme 三联检查）
- **用户说"审查"/"4 维审查"/"long-doc-review"** → 触发 `long-doc-review`（长文本 4 维审查全量）

### 触发关键词识别
| 关键词 | 触发 Skill |
|--------|-----------|
| 推 git / commit / 提交 / push | git-push-guard |
| 完成 / 搞定 / done / 做完 | completion-gate |
| 新 session / 第一次工具调用 | session-opener |
| 设计决策有分歧 / 方案对比 | multi-round-debate |
| 审查 / 4 维审查 / long-doc-review | long-doc-review |

跳过机制：用户明确说"先跳过"/"emergency"可绕过强制检查，但 Claude 必须在下次同时机再次提醒。

---

## Skills 入口

`.claude/skills/` 下提供 5 个项目级 Skill：

1. **multi-round-debate** — 5 角色辩论生成产品决策
2. **session-opener** — 开场仪式：昨日续接+今日待办
3. **completion-gate** — 完成门控：测试+文档+commit+决策 4 件套
4. **git-push-guard** — 推送守门员：强制 cleanup+progress+readme 三联检查
5. **long-doc-review** — 长文本 4 维审查全量（fan-out 4 Agent + 合并 + PM 决议 + 自动修复）

---

## 历史与版本

- 2026-04-08：项目启动，建立 6 大区结构
- 2026-04-13：requirements-v0.3.3 → 项目结构升级到 6 大区
- 2026-04-22：spec v0.4.0 全部审阅完成（D-4.0 基线）
- 2026-04-23：原型 v1.1 交付（11 条 DoD 修复）
- 2026-04-26：底层建设期 know-how 库完成（50 题决策 + 三大底层原则 + Neo Soul final）
- 2026-04-27：v0.5.0 元规划 + 全文重写启动
- 2026-04-29：V-0.2.0 目录归集 + 临时区拆分（02-temp + claude-workspace）+ 退出底层建设期 + 进入 D-5.0 spec 推进期

---

## 提供反馈

用户报告 Claude Code 问题：https://github.com/anthropics/claude-code/issues
项目内反馈：在 `02-temp/` 写 issue.md
