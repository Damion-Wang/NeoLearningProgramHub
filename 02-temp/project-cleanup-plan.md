# 睿学业务规划 · 项目整理与升级规划

> 目的：把规划草稿期的项目整理为可持续运营的产品研发资产
> 日期：2026-04-23
> 维护：王鼎明 + Claude

---

## 一、现状速览

### 1.1 项目数据
- **总文件数**：1,508 个
- **总大小**：343 MB（其中视频占 287 MB）
- **Markdown 文件**：188 个（文档驱动型项目）
- **HTML 原型**：35 个
- **PNG 截图**：99 个根目录散落（已 .gitignore）
- **README 覆盖率**：100%（51 个 README）
- **已审阅 spec**：16 个（[已审阅]前缀）

### 1.2 阶段定位
项目从「业务规划草稿」转入「设计审阅 + 原型完成」，准备进入「开发对接 + 持续迭代」。

### 1.3 主要问题
| # | 问题 | 影响 |
|---|------|------|
| 1 | 4 个空 Temp 目录占用结构（Duan/Ji/SYJ/ZXH_Temp） | 视觉噪音 |
| 2 | 4 个占位 README 目录（modules/prototypes/ui-ux/user-flows） | 结构虚高 |
| 3 | 99 个根目录 PNG 截图未清理（.gitignore 已忽略但本地存在） | 占盘 + 干扰 |
| 4 | DM_Temp 大量已完成内容未归档 | 工作区与归档混杂 |
| 5 | CLAUDE.md 仅 SDD 豁免声明，缺项目上下文 | AI 协作效率不高 |
| 6 | requirements v0.3.3 与 v0.4.0 共存无版本归档 | 容易混淆引用 |
| 7 | 没有 Skills 沉淀（demo 构建/spec 反补/原型规划经验） | 可复用经验流失 |
| 8 | 缺少最近一周的进度日志（PROGRESS.md 停在 4-13） | 项目可视性下降 |

---

## 二、整理目标与原则

### 2.1 整理目标

把项目从「设计草稿期的工作树」转为「可被新人/AI 快速理解的产品资产库」：

- **可导航**：任何人看到根目录能在 1 分钟内理解项目架构
- **可复用**：把 demo 构建、spec 反向补充等 SOP 转为 Skills，未来可一键复用
- **可持续**：明确「正在做的 vs 已归档的 vs 永久参考的」边界
- **可协作**：CLAUDE.md 让任何 AI session 立刻进入状态
- **可审计**：版本归档、决策记录、过程追溯链条清晰

### 2.2 整理原则

1. **不删 spec 任何审阅过的内容**（含早期版本，归档不删）
2. **可以删空文件夹和过程截图**（无审阅记录的工件）
3. **Skills 来自实践**（只把已验证有效的工作流变成 Skill）
4. **CLAUDE.md 优先精简**（重要的 5-10 条规则胜过 100 行散文）
5. **README 三层模式**：根 README（项目总图）、模块 README（功能说明）、子目录 README（实现细节）

---

## 三、外部最佳实践参考

调研了 Claude Code 官方文档 + 多家产品经理实践博客，提炼 5 条对本项目最有价值的经验：

### 经验 1：CLAUDE.md 是 AI 的"工程师入职手册"
> Anthropic 内部测试：无引导 success rate 33%，加上结构化 CLAUDE.md 能大幅提升

应包含：项目背景一句话 + 关键命令 + 工作流规则 + 当前阶段标识。本项目已有但内容过简。

### 经验 2：项目结构本身是一种沟通
> 文件夹命名、文件位置、层级深度都是给 AI 的信号

本项目的 `00-public/` `01-ref/` `02-temp/` `DM_Temp/` 命名已遵循此原则，但 `Duan_Temp/Ji_Temp/...` 这种纯人名缺乏语义。

### 经验 3：Skills 是模块化的领域专家
> .claude/skills/ 下放 SKILL.md（YAML frontmatter + 指令体）

PM 友好的开源 Skills 库已有 232+，本项目可以贡献几个：
- `prototype-build` (从 spec 到独立 HTML 的工作流)
- `spec-reverse-supplement` (demo 构建后反向补 spec 的方法)
- `multi-round-debate` (5 角色辩论生成产品决策)

### 经验 4：每个层级的 README 要解决一个问题
> 根 README → 我是什么？/ 模块 README → 我做什么？/ 子目录 README → 我怎么用？

本项目根 README 已较完整，但模块层 README 还可补强（特别是 spec/design/）。

### 经验 5：清理是持续动作，不是一次性
> 设过期日期标签（如「截图 2026-Q2」）+ 定期归档（季度切片）

本项目缺少时间标签。可在 02-temp 加 `archived-2026-q2/` 等命名。

---

## 四、分阶段整理计划

### Phase 1 · 即时清理（30 分钟内）

**P1.1 删空目录**
```
✗ Duan_Temp/     (空)
✗ Ji_Temp/       (空)
✗ SYJ_Temp/      (空)
✗ ZXH_Temp/      (空)
✗ 00-public/1-product/spec/temp/   (空)
✗ DM_Temp/feature-tree/   (仅 .gitkeep)
```

**P1.2 清理根目录散落截图**
```
99 个 PNG 文件 → 移动到 02-temp/archived-screenshots-2026-q2/
（.gitignore 已忽略但本地占盘 16 MB；归档后可随时翻查）
```

**P1.3 占位目录决策**
```
00-public/1-product/modules/      仅 README - 决定保留(占位)或删除
00-public/1-product/prototypes/   仅 README - 同上
00-public/1-product/ui-ux/        仅 README - 同上
00-public/1-product/user-flows/   仅 README - 同上
```

**确认事项**：要保留这 4 个占位目录（等设计内容填入），还是删除直到有真实内容？

---

### Phase 2 · DM_Temp 归档与合并（1 小时）

DM_Temp 大量内容已审阅完成，应转入正式区或归档：

**P2.1 原型工作归档**
```
DM_Temp/prototype/build/    → 00-public/1-product/prototypes/build/
DM_Temp/prototype/demo/     → 00-public/1-product/prototypes/demo/
DM_Temp/prototype/assets/   → 00-public/1-product/prototypes/assets/
```

**P2.2 辩论与规划归档**
```
DM_Temp/prototype/debate/   → 00-public/5-process/debates/prototype-rounds/
DM_Temp/prototype/*.md      → 00-public/5-process/journal/2026-04-prototype-plans/
```

**P2.3 ref 资源整理**
```
DM_Temp/prototype/ref/      → 01-ref/prototype-references/
（contentRef, 教室 HTML, NEO 头像等)
```

**P2.4 DM_Temp/ 留下什么**
保留 DM_Temp 作为「持续在编」的工作区入口，但内部清空（迁出已审阅内容）。

---

### Phase 3 · CLAUDE.md 重写增强（30 分钟）

当前 CLAUDE.md 只有 SDD 豁免声明，应扩充为 AI 协作完整入门：

```markdown
# AI_TUTOR_PROJECT · 睿学业务规划

## 项目背景（1 段）
睿学是 AI-Native 企业培训交付平台...
**当前阶段**：原型完成，准备开发对接

## SDD 豁免声明（保留现有）
本项目豁免 SDD 流程，按自然语言指令执行...

## 关键路径
- 产品 spec: `00-public/1-product/spec/design/`（已审阅 v0.4.0）
- 原型 demo: `00-public/1-product/prototypes/demo/`（13 页）
- 决策记录: `00-public/4-decisions/`
- 工作日志: `00-public/5-process/journal/`

## 核心约束
- spec 改动直接编辑[已审阅]文件，必要时追加"反向补充"章节
- 原型修改在 prototype/demo/，每页自包含（图片 base64 内联）
- 双账号 demo: student01(中期)/newbie01(开营前)
- 品牌名"睿学"，禁用"AI 老师"

## 工作流偏好
- 多文件改动用 Agent 并行
- 大量 UI 改动跑 Playwright 浏览器验证
- 复杂任务先做规划文档再执行
- 提问用 AskUserQuestion 工具，不文字列表

## Skills 入口
- prototype-build: 从 spec 生成独立 HTML
- spec-reverse-supplement: demo 完成后反补 spec
- multi-round-debate: 5 角色辩论生成决策
（详见 .claude/skills/）
```

---

### Phase 4 · Skills 沉淀（2 小时）

把已验证的工作流提炼为 3 个项目级 Skills：

**Skill 1：prototype-build**
```
.claude/skills/prototype-build/SKILL.md
---
name: 原型构建
trigger: 用户要求"做一版 demo"/"做原型"/"按 spec 生成 HTML"
---

## 标准流程
1. 读取 spec 目标模块
2. 列出 18 决策点向用户确认（账号/资源/独立性等）
3. 分批用 Agent 并行生成 HTML（每个 agent 处理 3-5 页）
4. 浏览器 Playwright MCP 跑 E2E 验证
5. 基于截图修复 → 再验证（Review Loop）
6. 输出测试报告 + DoD 签收
```

**Skill 2：spec-reverse-supplement**
```
.claude/skills/spec-reverse-supplement/SKILL.md
---
name: Spec 反向补充
trigger: demo/原型构建完成后/"sync 回 spec"
---

## 标准流程
1. 对比 demo 实际行为 vs spec 描述
2. 列出新涌现的设计决策（不只是细节）
3. 分类 P0/P1/P2 优先级
4. 决定新建文件 vs 追加章节
5. 章节标题统一用"反向补充：XXX"
6. 多 Agent 并行修改 spec 文件
```

**Skill 3：multi-round-debate**
```
.claude/skills/multi-round-debate/SKILL.md
---
name: 5 角色辩论决策
trigger: 设计决策有分歧/方案选择困难
---

## 标准流程
1. 列出 5 角色立场（PM/Dev/UX/Student/HR）
2. 每轮针对 1 个核心议题
3. 每轮产出"确认结果 + 待讨论项"
4. 最终生成 round-N-confirmed.md
5. 归档到 process/debates/
```

---

### Phase 5 · README 标准化（1 小时）

**P5.1 根目录 README** 已完整，可微调当前阶段说明

**P5.2 模块 README 补强**
重点：`00-public/1-product/spec/design/README.md`
```markdown
# Spec Design · 产品规格设计

## 当前版本
- requirements-v0.4.0（已审阅，2026-04-22）
- 历史：v0.3.3 见 `../requirements-v0.3.3.md`

## 文件命名约定
- `[已审阅]XX-name.md` - 已通过审阅
- `XX-name.md` - 待审阅或新增（如 03-ai-brand.md, 07-discovery-library.md）
- 章节"反向补充：XXX" - 来自 demo 实践的补充

## 模块结构
| 目录 | 内容 |
|------|------|
| common/ | 跨模块通用规则（topbar/AI brand/notification） |
| learner/ | 学员端 7 个模块 |
| management/ | 管理端 5 个模块 |

## 阅读顺序
1. requirements-v0.4.0.md（总纲）
2. learner/00-overview.md（学员端总览）
3. management/00-overview.md（管理端总览）
4. 各具体模块按需查阅
```

**P5.3 prototypes README 新建**
迁移到 00-public 后需要 README 说明用法、账号、链接等。

---

### Phase 6 · 持续运营机制（30 分钟）

**P6.1 PROGRESS.md 重启更新**
当前停在 4-13，补充 4-14 至今的关键节点：
- 4-20: spec design 全量审阅
- 4-22: demo v1.0 完成
- 4-23: demo v1.1 + spec 反向补充

**P6.2 周报机制**
建议每周五在 `02-temp/weekly/2026-WW.md` 写一条周报：
- 本周完成
- 下周计划
- 风险/阻塞

**P6.3 季度归档约定**
2026-Q2 结束时：把 02-temp/ 全部归档为 02-temp/archived-2026-q2/

---

## 五、决策事项（需用户确认）

执行前需要你拍板的 4 个关键决策：

### ❓ 决策 1：4 个占位目录（modules/prototypes/ui-ux/user-flows）
- **A. 删除**（等真实内容时再创建）
- **B. 保留**（占位，后续填充）

### ❓ 决策 2：DM_Temp 归档时机
- **A. 立即归档**（设计已审阅完成）
- **B. 等开发对接后再归档**（避免开发中找不到）
- **C. 部分归档**（debate 立即归档，demo/build 等开发时再动）

### ❓ 决策 3：99 个根目录 PNG
- **A. 全删**（已 .gitignore，未来无价值）
- **B. 归档到 02-temp/**（保留备查）
- **C. 选关键的进 docs/screenshots/**（精选 10-20 张）

### ❓ 决策 4：CLAUDE.md 增强深度
- **A. 全量重写**（含背景+约束+Skills+工作流）
- **B. 保留 SDD 豁免，只追加关键路径和约束**
- **C. 不动，按需添加**

### ❓ 决策 5：是否创建 Skills
- **A. 创建 3 个 Skills**（prototype-build / spec-reverse-supplement / multi-round-debate）
- **B. 暂不创建**（继续按指令工作）
- **C. 只创建 1-2 个最有用的**

---

## 六、执行顺序（决策确认后）

```
Phase 1 即时清理        [30 min]
   ↓
Phase 3 CLAUDE.md 重写   [30 min]
   ↓
Phase 5 README 标准化    [1 h]
   ↓
Phase 2 DM_Temp 归档     [1 h]
   ↓
Phase 4 Skills 沉淀      [2 h]
   ↓
Phase 6 持续运营机制     [30 min]
   ↓
git commit + push
```

**总工作量**：约 5.5 小时（可分两天）

---

## 七、最终愿景

整理后项目结构示意：

```
20260408睿学业务规划/
├── CLAUDE.md             # AI 入门手册（精简到位）
├── README.md             # 项目总图
├── PROGRESS.md           # 持续更新的进度
├── .claude/
│   └── skills/           # 3 个项目级 Skills
├── 00-public/            # 正式交付物（审阅过的）
│   ├── 1-product/
│   │   ├── spec/design/  # 已审阅规格 v0.4.0
│   │   ├── feature-tree/
│   │   └── prototypes/   # 从 DM_Temp 迁入
│   ├── 2-business/       # 商业分析
│   ├── 3-tech/
│   ├── 4-decisions/      # ADR
│   ├── 5-process/        # 辩论+日志（含从 DM_Temp 迁入的）
│   └── 6-content/
├── 01-ref/               # 永久参考
├── 02-temp/              # 持续轮换
│   ├── weekly/           # 周报
│   ├── archived-2026-q2/
│   └── archived-screenshots-2026-q2/
└── DM_Temp/              # 持续在编工作区（清空已完成的）
```

清晰、可持续、AI 友好。

---

**等你确认 5 个决策后开工。**

---

## 参考资料

- [Best Practices for Claude Code · Anthropic](https://code.claude.com/docs/en/best-practices)
- [Claude Code Project Structure Best Practices · UX Planet](https://uxplanet.org/claude-code-project-structure-best-practices-5a9c3c97f121)
- [Claude Code for Product Managers · Sachin Rekhi](https://www.sachinrekhi.com/p/claude-code-for-product-managers)
- [Product Manager Skills · GitHub](https://github.com/deanpeters/Product-Manager-Skills)
- [Claude Skills Collection (232+)](https://github.com/alirezarezvani/claude-skills)
- [Extend Claude with Skills · Docs](https://code.claude.com/docs/en/skills)
