# AI_TUTOR_PROJECT · 睿学业务规划

> 睿学是面向企业的 AI-Native 培训交付平台。本项目是产品规划+设计+原型工作树。
> **当前阶段**：产品 spec v0.4.0 全部审阅完成，原型 v1.1 交付，准备开发对接。

---

## SDD 豁免声明

**本项目豁免 SDD 流程。**

- 所有文件改动**不走** Backlog / Skill / Phase 链路，按用户自然语言指令直接执行
- routing.md 中 Read-Only / SDD / Team 三模式判断降级为：Read-Only（只读问答） 或 Direct-Edit（直接改文件）两类
- `/sdd:*` skills 仅在用户**显式调用**时启用
- 如需重启 SDD，删除本节即可

---

## 关键路径

### 设计资产（00-public/）
- 产品 spec：`00-public/1-product/spec/design/`（已审阅 v0.4.0，含 [已审阅] 前缀的 16 个文件）
- 功能树：`00-public/1-product/feature-tree/`
- 商业分析：`00-public/2-business/`
- 决策记录：`00-public/4-decisions/`
- 过程文档：`00-public/5-process/`
- 课程内容：`00-public/6-content/`

### 工作区
- 持续在编：`DM_Temp/prototype/build/` 11 个独立 HTML 原型（基线参考）
- 持续在编：`DM_Temp/prototype/assets/` 设计资源（PPT 截图、Neo 头像、mock 数据）
- 临时文件：`02-temp/`（季度归档）

### 参考资料
- 外部 demo：`01-ref/demo/`（视频 + coaching-skills JS 项目）
- 原型参考：`01-ref/prototype-references/`（5 个教室 HTML、NEO 头像原图）

---

## 核心约束（永久规则）

1. **品牌名**：产品叫「睿学」（中文）/ AI TUTOR（英文）；禁用「AI 老师」
2. **AI 角色**：**学员端只有 Neo**（2026-04-26 起，Leo 完全取消，对内对外都无 Leo）；Neo 在不同场域（授课/对练/调研/报告）展现不同技能与意愿；**Ora** 保留为管理端独立身份
3. **Neo 第一性原理**（2026-04-26 立）：Neo = 模拟 1v1 线下授课老师；通过 **讲授 / 解惑 / 讨论 / 考研 / 练习 / 追问 / 反思** 等动作，**逼着或带领学生掌握内容**。所有交互/Persona/产出物的总尺度 = "它让 Neo 更像 1v1 老师吗"
4. **场域统一**：4 个学员端场域（授课/对练/调研/报告）用 Topbar + 覆盖式抽屉 + 全幅内容 + 右侧 AI Chat 统一布局
5. **2 个账号**：student01（张磊·中期学员+管理员，W5/16）/ newbie01（李明·初期学员+开营新运营，W0/16）
6. **spec 改动方式**：直接编辑 [已审阅] 文件；如属新设计追加"反向补充：XXX"章节，不删原内容
7. **原型独立性**：每页自包含（CSS/JS 内联，图片 base64），仅 CDN 外链允许（Tailwind/Lucide/Fonts）
8. **调研边界**（2026-04-26 起）：第一性原理为基准 + spec v0.4.0 为 scope + 来源不设限——任何调研产出必须能映射回"它让 Neo 更像 1v1 老师吗"
9. **懂你 · 记忆系统底层原则**（2026-04-26 立）：Neo 必须**越用越懂学员**。跨场域 + 跨会话 + 跨课程的渐进画像构建；主动调用记忆（"我记得你上次说过…"）；记什么 / 何时调 / 如何避免幻觉式调用 是底层议题，不是 feature
10. **像人 · Soul/Persona 底层原则**（2026-04-26 立）：每个 Agent（Neo / Ora / Actor / 导演）必须有**自己的画像 + 立场**——**不能人云亦云**。Neo 是有价值观的老师，敢指出错位、拒绝低质回应、维护学习节奏、表达真实评估。Soul 文档定义每个 Agent 的：身份 / 价值观 / 立场 / 偏好 / 敏感点 / voice / 成长
11. **PM 协作风格**（2026-04-26 锁定 4 项）：
    - **PM 角度 + 不要问技术实现**：技术选型 / 架构 / 验证机制由研发决定，PM 只管效果与 Agent 表现
    - **遇事不决参照 1v1 真人老师**：设计冲突总判断器（不写入 Neo Soul，是 PM 工具）
    - **Soul 按场域差异化**：Neo 不是单一身份，按场域调用差异化 skill 与倾向
    - **不决定时间，研发能力决定**：不预设周数 / 节点

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

## 底层建设阶段（当前）

> **2026-04-26 起，项目进入"底层建设期"**——不立即落 spec，先建立底层原则 + 参考知识 / 信息 / 体系。

**阶段定义**：
- 不修改 [已审阅] spec 文件（A5 暂停）
- 调研产出先入 `02-temp/`，待"完整做完调研"后再决定如何落 spec / 改产品架构
- 当前已建立的底层原则：**第一性原理（7 动作）+ 懂你（记忆）+ 像人（Soul）**——后续可能继续涌现新原则

**阶段产出形态**：
1. **底层原则集**：`02-temp/0426-底层原则框架.md`（总图 + 各原则定义）
2. **Soul 文档**：每个 Agent 一份 `0426-soul-{agent}.md`
3. **调研 brief**：每个底层议题一份调研 brief（如记忆系统 / Persona 方法论）
4. **调研产出**：A1-A4 三件套 v0.1 → v1.0 演进

**何时退出底层建设阶段**：调研 v1.0 完成 + DM 决定开始平台软件 / Agent 构建

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

### 触发关键词识别
| 关键词 | 触发 Skill |
|--------|-----------|
| 推 git / commit / 提交 / push | git-push-guard |
| 完成 / 搞定 / done / 做完 | completion-gate |
| 新 session / 第一次工具调用 | session-opener |
| 设计决策有分歧 / 方案对比 | multi-round-debate |

跳过机制：用户明确说"先跳过"/"emergency"可绕过强制检查，但 Claude 必须在下次同时机再次提醒。

---

## Skills 入口

`.claude/skills/` 下提供 4 个项目级 Skill：

1. **multi-round-debate** — 5 角色辩论生成产品决策
2. **session-opener** — 开场仪式：昨日续接+今日待办
3. **completion-gate** — 完成门控：测试+文档+commit+决策 4 件套
4. **git-push-guard** — 推送守门员：强制 cleanup+progress+readme 三联检查

---

## 历史与版本

- requirements-v0.3.3 → v0.4.0（v0.3.3 见 spec/ 旧目录）
- demo v1.0（2026-04-22）→ v1.1（2026-04-23，含 11 条 DoD 修复）

---

## 提供反馈

用户报告问题：https://github.com/anthropics/claude-code/issues
项目内：在 02-temp/ 写 issue.md
