# 20260408睿学program版产品规划 — NeoLearningProgramPRD

> 睿学（NeoLearning）是面向企业的 AI-Native 培训交付平台。本期交付：睿学培训项目（NeoLearningProgram）。本仓库是产品规划 + 设计 + 原型工作树。
>
> **当前阶段**：V-0.2.0 / **D-5.0 是当前基线**（22 文件 / **recap 于 2026-05-09 已合并 D-5.1 重写内容**）+ **D-5.0 spec 补充区持续迭代**（综合决议文档 + UI demo / 后续补充继续走补充区）。**暂不进入 D-6.0。**

---

## 版本号体系（2026-04-29 启用）

| 维度 | 当前值 | 说明 |
|------|--------|------|
| 产品版本 | **V-0.2.0** | 产品大版本号，用到 6 月交付，未指示前不动 |
| 文档版本 | **D-4.0**（已冻结）/ **D-5.0**（当前基线 / recap 已含 D-5.1 整合）/ **D-5.0-supplements**（活跃补充区）| 文档迭代版本号 |
| 文档归集 | `00-public/product-V-0.2.0-D-X.Y/` 或 `00-public/product-V-0.2.0-D-5.0-supplements/` | 顶层目录名即版本号 / 补充区载体 |
| 文件元数据 | frontmatter `version:` `status:` `last-updated:` `numbering:` | 单文件级元数据 |
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

### D-5.0 spec 补充区 ★（活跃迭代）

`00-public/product-V-0.2.0-D-5.0-supplements/` —— **活跃补充区**。

| 内容 | 状态 |
|---|---|
| `D-5.0-spec-supplements-2026-05-09.md` | 综合决议文档（341 行 / 21 项决议 / 跨 spec 设计 + demo 偏差校准）|
| `demo/` | 完整 UI demo（24.63 MB / 9 HTML / 4 演示账号 / 双击启动）|

**已合并到 D-5.0**（2026-05-09）：
- `recap.md`（D-5.1 重写 898 行）→ 替换 `D-5.0/spec/05-learner/05-recap【已审阅】.md` / 副本已删
- `cross-spec-decisions-2026-05-08.md` + `demo-vs-spec-diff-2026-05-09.md` → 内容合并为 `D-5.0-spec-supplements-2026-05-09.md` / 两源文档已删

**两种整合方式**（按需选用）：
1. **替换式整合**（如 recap / 直接覆盖 D-5.0 同名文件 / 补充区不留副本）
2. **保留为补充**（与 D-5.0 spec 互为引用 / 不强行回写 / 如 demo + 综合决议文档）

**何时退出补充区**：DM 决定整合（→ D-5.2 全量基线 / 或直接 → D-6.0 研发对接）。

### D-5.0 已交付 spec 基线（22 文件 ★）

`00-public/product-V-0.2.0-D-5.0/spec/` 下 **22 文件**（每文件独立编号 / 每文件 § 1 起）：

| 板块 | 文件 | 备注 |
|------|------|---|
| **00-glossary** | 术语决议表 v2（15 节 / 含 § 15 管理端架构）| 补充区不另起 glossary，术语变更同步更新此文件 |
| **01-vision** | 愿景 | — |
| **02-foundation/** | 01-personas / 02-methodology / 03-roles-and-ports / 04-data-model | — |
| **03-lifecycle/** | 01-pre-learning / 02-learning / 03-completion | — |
| **04-global/** | 01-user-global / 02-platform-global | — |
| **05-learner/** | 01-overview / 02-hub / 03-lecture / 04-practice / **05-recap** / 06-cross-context | **05-recap 于 2026-05-09 已含 D-5.1 重写整合内容（923 行）** |
| **06-management/** | 01-overview / 02-home / 03-report-center / 04-program-config / 05-message | — |

跨文件引用格式：`[05-learner/05-recap § 1.2.3]`；自引用格式：`§ 1.2.3`。

### D-4.0 已审阅 spec（冻结基线 / 历史快照）
- 产品 spec：`00-public/product-V-0.2.0-D-4.0/spec/`（17 文件含 README × 4）
- 功能树：`00-public/product-V-0.2.0-D-4.0/feature-tree/`（13 文件含 manifest）
- 原型 v1.1：`00-public/product-V-0.2.0-D-4.0/prototype/build/`（11 个 HTML）+ `prototype/assets/`

### 跨版本资产
- 商业分析：`00-public/2-business/`（含 brand/ai-brand.md）
- 决策记录：`00-public/4-decisions/`（含底层建设期-2026-04-26）
- 过程文档：`00-public/5-process/`
- 课程内容：`00-public/6-content/`

### 临时区
- DM 临时区：`02-temp/`（保留 D-5.0 补充期间过程档：feature-tree 探索 5 + recap mock/design 2 + recap-build-plan + debate-log + record / 按需清理或归档）
- ~~Claude 临时区 `claude-workspace/`~~ 已退场（2026-05-06 / D-5.0 交付时一并清理）

### 参考资料
- 外部 demo：`01-ref/demo/`（视频 + coaching-skills JS 项目）
- 原型参考：`01-ref/prototype-references/`（5 个教室 HTML、NEO 头像原图）
- 报告参考：`01-ref/product-ideas/报告/`（recap 设计期导入的中欧报告框架 / xmind / PPTX / 7 文件）

---

## 核心约束（永久规则）

1. **品牌名**：产品叫「睿学」（中文）/「NeoLearning」（英文）；本期讨论的项目中文叫「睿学培训项目」/ 英文「NeoLearningProgram」；git 仓库名 `NeoLearningProgramPRD`；禁用「AI 老师」/「AI TUTOR」/「AI tutor」
2. **AI 角色**：**学员端只有 Neo**（2026-04-26 起，Leo 完全取消）；Neo 在 3 学习场域 + 大厅展现不同技能与意愿；**Ora** 保留为管理端独立身份
   - **Neo 第一性目标 = 教学效果**（学员真实行为改变）—— **不是教学体验**！体验是手段 / 效果是目标 / Neo 可为效果适度损失体验（不当应声虫 / 错时直说 / 必收尾追问）
   - **Ora 第一性目标 = 给 HR 可举证 ROI 报告**；定位 = HR 的搭档（给建议 + 解读 + 选项 / **HR 拍板**）；不直接联系学员 / 不自动调度
3. **Neo 第一性原理**（2026-04-26 立）：Neo = 模拟 1v1 线下授课老师；通过 **讲授 / 解惑 / 讨论 / 考核 / 练习 / 追问 / 反思** 等动作，**逼着或带领学生掌握内容**。所有交互/Persona/产出物的总尺度 = "它让 Neo 更像 1v1 老师吗"
   - **能力上限**：Neo 不预设能力边界（24/7 / 跨学员对比 / 跨项目记忆 等技术能做到的都可以追求）
   - **风格立场**：像 1v1 真人老师（这是第一性原理锁定的）
4. **场域统一**（2026-05-06 校准）：学员端 = **大厅（中枢层 / 不算场域）+ 3 学习场域**（授课 lecture / 对练 practice / 小结 recap）；场域内用 Topbar + 覆盖式抽屉 + 全幅内容 + 右侧 Neo Chat 统一布局；未来场域 inquiry 等留口
5. **2 个账号**：student01（张磊·中期学员+管理员，W5/16）/ newbie01（李明·初期学员+开营新运营，W0/16）
6. **spec 改动方式**（2026-05-09 校准）：
    - **D-4.0 整体冻结** —— 不改
    - **D-5.0 是当前基线** —— 22 文件 / recap 已含 D-5.1 整合内容
    - **新设计 / 新调整走 D-5.0 补充区** —— 在 `00-public/product-V-0.2.0-D-5.0-supplements/` 下放新文件 + UI demo + 综合决议文档
    - **整合方式两种**：① **替换式整合**（直接覆盖 D-5.0 同名 / 补充区不留副本）② **保留为补充**（与 D-5.0 spec 互为引用 / 不强行回写 / 如 demo + 综合决议文档）
    - **术语 / 编号变更** —— 补充区 **不另起 glossary**，统一回写到 `D-5.0/spec/00-glossary.md`（这是术语权威表）
7. **原型独立性**：每页自包含（CSS/JS 内联，图片 base64），仅 CDN 外链允许（Tailwind/Lucide/Fonts）
8. **调研边界**（2026-04-26 起）：第一性原理为基准 + spec 为 scope + 来源不设限——任何调研产出必须能映射回"它让 Neo 更像 1v1 老师吗"
9. **懂你 · 记忆系统底层原则**（2026-04-26 立）：Neo 必须**越用越懂学员**。跨场域 + 跨会话 + 跨课程的渐进画像构建；主动调用记忆（"我记得你上次说过…"）；记什么 / 何时调 / 如何避免幻觉式调用 是底层议题，不是 feature
10. **像人 · Soul/Persona 底层原则**（2026-04-26 立）：每个 Agent（Neo / Ora / Actor / Director）必须有**自己的画像 + 立场**——**不能人云亦云**。Neo 是有价值观的老师，敢指出错位、拒绝低质回应、维护学习节奏、表达真实评估
    - **像人 > 懂你**（2026-05-03 校准）：当两者冲突（如学员希望 Neo 像朋友 vs 像人原则要求 Neo 保持立场），**像人优先**。懂你是适配手法 / 像人是根本。遇事不决参照 1v1 真人老师
11. **PM 协作风格**（2026-04-26 锁定 4 项）：
    - **PM 角度 + 不要问技术实现**：技术选型 / 架构 / 验证机制由研发决定，PM 只管效果与 Agent 表现
    - **遇事不决参照 1v1 真人老师**：设计冲突总判断器（不写入 Neo Soul，是 PM 工具）
    - **Soul 按场域差异化**：Neo 不是单一身份，按场域调用差异化 skill 与倾向
    - **不决定时间，研发能力决定**：不预设周数 / 节点
12. **临时区使用**（2026-05-06 校准）：DM 临时改动写 `02-temp/`；Claude 行动产出（行动规划 / gap 报告 / 备份 / 审查 / 执行 log）**收完即清理**——不积累临时档，避免重蹈 claude-workspace 14M 过程档堆积
13. **三方价值实际是两方**（2026-05-03 校准）：学员 + HR/管理员（**项目运营 = HR 同一组人**）；冲突时 **HR > 学员**（HR 是付钱方）；**关键理念：隐私 ≠ 学习效果**——Ora 读 raw 不冲突学员学习
14. **管理员 vs admin 维度区分**（2026-05-06 立）：
    - **管理员 = 角色权限名**（HR + 项目运营 / 管理端用户的角色）—— "角色"维度
    - **admin = 账号类型**（项目根账号 / 1 个 / 开营前可改 / 开营后锁定）—— "账号"维度
    - 两者**不在同一维度，不存在"广义/狭义"包含关系**
    - admin 账号默认有"管理员"角色权限 + 项目根级 admin 权限；HR / 项目运营账号只有"管理员"角色权限

---

## 底层建设产出（研发 know-how 参考）

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

## 当前推进重心 · D-5.0 spec 补充区

**已合并到 D-5.0**（2026-05-09）：
- recap.md（D-5.1 重写 898 行 / 16 项 PM 决议 + 自主 debate 修订）→ 替换式整合到 D-5.0/spec/05-learner/05-recap【已审阅】.md（923 行）
- D-5.0-spec-supplements-2026-05-09.md（341 行 / 21 项决议）= cross-spec-decisions + demo-vs-spec-diff 内容驱动合并

**当前在补充区**：
- D-5.0-spec-supplements-2026-05-09.md（综合决议文档）
- demo/（UI demo / 24.63 MB / 9 HTML）

**进行中**：基于综合决议文档执行 demo 修齐 + spec 修齐。

**何时退出补充区**：DM 决定整合（→ D-5.2 全量基线 / 或直接 → D-6.0 研发对接）。**当前明确暂不进入 D-6.0**。

---

## 如何与 Claude 协作

> 本节是 Claude 的工作手册。新会话开场读这一段就能进入"密切协作"状态。

### PM 风格定位（4 锁 / 2026-04-26 锁定）

1. **PM 角度，不要问技术实现** —— 技术选型 / 架构 / 验证机制由研发决定，PM 只管效果与 Agent 表现
2. **遇事不决参照 1v1 真人老师** —— 设计冲突总判断器（不写入 Neo Soul，是 PM 工具）
3. **Soul 按场域差异化** —— Neo 不是单一身份，按场域调用差异化 skill 与倾向
4. **不决定时间，研发能力决定** —— 不预设周数 / 节点

### 协作方式

- **复杂任务先规划再执行** —— 写规划 md → 用户确认 → 启动 agent / 不要直接动手大改
- **多文件改动用 Agent 并行** —— fan-out / fan-in 模式
- **大量 UI 改动用 Playwright MCP 浏览器验证** —— 截图证据
- **询问用户用 AskUserQuestion 工具** —— 不要用文字列表 / 1 次最多 4 个问题（工具限制）
- **重要议题走 multi-round-debate** —— 5 角色辩论生成产品决策
- **长文档审查走 long-doc-review** —— 4 维 fan-out + 合并 + 决议 + 修复闭环

### 5 个项目级 Skills（在 `.claude/skills/`）

1. **multi-round-debate** — 5 角色辩论生成产品决策
2. **session-opener** — 开场仪式：昨日续接+今日待办（每 session 自动触发）
3. **completion-gate** — 完成门控：测试+文档+commit+决策 4 件套
4. **git-push-guard** — 推送守门员：cleanup+progress+readme 三联检查
5. **long-doc-review** — 长文本 4 维审查全量（fan-out 4 Agent + 合并 + PM 决议 + 自动修复）

### Memory · 持久协作记忆

Claude 有跨 session 的记忆系统（`C:\Users\WDM\.claude\projects\D--01-----AI-TUTOR-20260408------\memory\`）。
- **user 类**：DM 的偏好 / 角色 / 工作习惯
- **feedback 类**：DM 给过的指导 / 纠偏 / 验证过的判断
- **project 类**：项目动态状态（决议 / 阶段切换 / 里程碑）
- **reference 类**：外部资源指针

新 session 开场时，Claude 会主动调用相关记忆，避免重复对齐。如果某条记忆与当前文件状态冲突，**以文件为准**。

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

## 历史与版本

- 2026-04-08：项目启动，建立 6 大区结构
- 2026-04-13：requirements-v0.3.3 → 项目结构升级到 6 大区
- 2026-04-22：spec v0.4.0 全部审阅完成（D-4.0 基线）
- 2026-04-23：原型 v1.1 交付（11 条 DoD 修复）
- 2026-04-26：底层建设期 know-how 库完成（50 题决策 + 三大底层原则 + Neo Soul final）
- 2026-04-27：v0.5.0 元规划 + 全文重写启动
- 2026-04-29：V-0.2.0 目录归集 + 临时区拆分 + 进入 D-5.0 spec 推进期
- 2026-05-04：03-full 全章 § 1-§ 10 完成 + 4 维审查
- 2026-05-05：spec 拆分到 6 板块 17 文件 + 全文件审阅 + 全局术语校准
- **2026-05-06**：**D-5.0 全量术语校准 + 编号重建 + 引用替换 + 03-full 退场 + claude-workspace 退场**——spec/ 22 文件最终交付
- **2026-05-07 ~ 05-08**：**D-5.1 局部迭代启动**——recap 单文件重新讨论（4 决议 + 20 题决议 + 3 mock + v6/v7 设计 → 769 行替代版）/ feature-tree 探索归档暂停 / D-5.1 增量目录建立
- **2026-05-08 ~ 05-09**：**recap 全文重写 + 多轮校准**（16 项 PM 决议 + 5 角色自主 debate / 第 3 章 A 基线明确 / 关联 Activity 集合不含 recap / 6 维画像范围收紧 / 跨 spec 补充决策 / 拉入 24.58 MB UI demo / 写 demo-vs-spec diff 文档 / 最终 recap 替换式整合回 D-5.0）
- **2026-05-09 后续**：D-5.1 目录改名 D-5.0-supplements / cross-spec-decisions + demo-vs-spec-diff 两文档**内容驱动合并**为 D-5.0-spec-supplements-2026-05-09.md（341 行 / 21 项决议）/ debate-log 搬到 02-temp / naming-convention 删除

---

## 提供反馈

用户报告 Claude Code 问题：https://github.com/anthropics/claude-code/issues
项目内反馈：在 `02-temp/` 写 issue.md
