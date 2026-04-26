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
2. **AI 角色**：用户视角合并 Leo+Neo→Neo；Ora 保留为管理端独立身份
3. **场域统一**：4 个学员端场域（授课/对练/调研/报告）用 Topbar + 覆盖式抽屉 + 全幅内容 + 右侧 AI Chat 统一布局
4. **2 个账号**：student01（张磊·中期学员+管理员，W5/16）/ newbie01（李明·初期学员+开营新运营，W0/16）
5. **spec 改动方式**：直接编辑 [已审阅] 文件；如属新设计追加"反向补充：XXX"章节，不删原内容
6. **原型独立性**：每页自包含（CSS/JS 内联，图片 base64），仅 CDN 外链允许（Tailwind/Lucide/Fonts）

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
