---
purpose: Feature Tree 工作进度续接备忘（暂停切换其他任务时记录）
status: 暂停中 / 学员端 F.1 完成 / 待审 F.2/F.3/F.4
created: 2026-05-07
last-updated: 2026-05-07
---

# Feature Tree 工作进度续接

> 项目阶段：D-5.0 spec 已交付（23 文件 + 6 README + 5 commit + push）→ 进入 **Phase「构建 feature tree」**
>
> 当前子任务：L1+L2 拆分讨论（markdown 草稿 / 不进 yaml / 落 yaml 在 Phase A）

---

## 1 · 21 决议总览（已拍板 / 不再讨论）

### 1.1 前期 4 决议
1. 拆分起点 = D-5.0 spec/ 22 文件（不全拆 / 跳 3 / foundation 拆两路）
2. 存储格式 = master.yaml + 4 子 yaml + 自动 ID 脚本 + Markmap 预览
3. Behaviour 写作 = BDD Given/When/Then / Agent 加 Why
4. 启动 5 角色辩论

### 1.2 5 角色辩论 7 议题决议
1. 树深度边界 = **C 仅可写 BDD**
2. 节点 schema = **B + agent-behavior-source = 10 字段**
3. testcase 覆盖 = **B 分层**（Happy+Edge 必列 / Adversarial 在 Agent 节点必列 / Off-topic 看输入）
4. 优先级 = **D 5 档**（P0/P1/P2/P3/L）
5. 关联 spec = **A + 反向索引**（feature → spec / SPEC-INDEX 反向）
6. ID 命名 = **A 树状 dotted F.X.Y.Z**
7. 哪些不拆 = **C**（跳 00-glossary + CHANGELOG + 01-vision / foundation 拆"可测点"）

### 1.3 10 题 DM 确认
- Q1+Q5 **顶层 = F.1-F.4 4 顶层**（lifecycle 并入 F.2 / foundation 拆 F.4 数据库 + 行为融场域）
- Q2 草稿粒度 = 1 次 1 spec 文件（**改为 L1+L2 整体讨论 / 后续 L3+ 再 1 次 1 文件**）
- Q3 drafts 处理 = 子阶段完成即删
- Q4 testcase 数量 = 不限
- Q6 agent-behavior-source = 条件必填
- Q7 优先级判定 = Claude 提议 + DM 拍板
- Q8 yaml = 4 子 yaml + master.yaml
- Q9 总入口 = 加 master.yaml
- Q10 drafts git = 走 git / commit 后删 / history 保留

### 1.4 cross-context 全拆决议
- ❌ F.1.5 跨场域机制（整节删除 / 不要 cross-context 抽象）
- 笔记悬浮球 → 分散到 4 场域各自
- 5 类卡片产出规则 → F.4 Agent 数据库
- Neo 跨场域记忆 → F.4.2 记忆与数据空间
- 4 库 → F.1.1 大厅 → 看板 → 学习成果区
- 三场域统一框架 → F.1 description / 不进 tree
- GUI 框架（Topbar + 抽屉 + Neo Chat 等）→ 不进 tree（spec 设计原则）

### 1.5 拆分原则（取代"对称美"思路）
- ❌ 不追求各场域 L2 数量一致 / 不强求平行结构
- ✅ **每个场域按自己的业务属性拆**

---

## 2 · 顶层结构（已定）

```
F.1 学员端                  spec 05-learner/ + foundation 中"Neo 在场域行为"融入
F.2 管理端（含 lifecycle）   spec 06-management/ + 03-lifecycle/ + foundation 中"Ora 行为"融入
F.3 全局                    spec 04-global/（用户级 + 平台级）
F.4 Agent 数据库（新）       spec 02-foundation/04-data-model + 01-personas 数据空间 + 行为约束 + methodology 识别/评分规则
```

---

## 3 · L1+L2 进度

### 3.1 ✅ 学员端 F.1（全拆完成）

| 模块 | 方案 | L2 数 | 业务核心拆分 |
|---|---|---|---|
| **F.1.1 大厅** | **D**（DM 拆）| **4** | 看板 / 辅导 / 笔记悬浮球 / **看板 Agent 联动**（DM 强调的核心）|
| **F.1.2 lecture** | **A** | **6** | 内容演绎 + 授课机制 + 答疑辅导 + 学员控制 + Neo 行为约束 + 笔记 |
| **F.1.3 practice** | **B3 学员视角** | **7** | 接任务 / 演 / 复盘 / 看报告 / 重练 / 三角色后台 / 笔记 |
| **F.1.4 recap** | **C1 业务核心** | **7** | 报告产出系统（核心 4 L3）/ Neo 反思引导 / 完成事件 / 状态机 / 应用计划闭环 / Neo 约束 / 笔记 |
| F.1.5 总览导航 | — | 2 | 旅程图 / 入口路径 |
| **F.1 合计** | | **26** | |

学员端关键洞察：
- **每场域业务核心都不同**：lecture 是内容演绎 / practice 是训练循环 / recap 是反思+报告 / 大厅是信息中心+陪伴+联动
- **Neo 行为约束作横切 L2**（lecture/practice/recap 都有）/ 大厅作 L3（在辅导下）
- **笔记悬浮球分散到各场域**（不抽象 / 不怕重复）/ 各场域差异化
- **F.1.1.4 看板 Agent 联动** 是 DM 创造的关键 L2 / 显式表达 spec 散落的协同机制

### 3.2 ⏸️ 待审：F.2 管理端

当前 v2 草稿状态（**未审 / 维度可能混乱 / 需按方案 A/B/C/D 思路审视**）：

| L1 | 当前 L2 数 | 业务核心猜测（需验证）|
|---|---|---|
| F.2.1 首页 Home | 8 | 看板 + Home Ora + 异常学员判定 |
| F.2.2 报告中心 Report Center | 11 | 报告库 + 报告编辑 + ChatBI + 协同编辑 |
| F.2.3 项目配置 Program Config | 8 | 双态切换 + 6 配置板块 |
| F.2.4 消息中心 Message | 5 | 消息管理 + 消息编辑 |
| F.2.5 项目生命周期管理 | 7 | 8 阶段 + 服务/项目周期 |
| F.2.6 管理端总览 | 2 | 4 模块导航 + Ora 双实例 |

可能的维度问题：
- F.2.2 Report Center 11 L2 / 太多 / 可能"ChatBI 6 类图表" 应作 L3
- F.2.5 lifecycle 8 阶段 / 是否每阶段独立 L2 还是按"管理动作"拆
- 各 L1 缺独立"Ora 行为约束" L2（仿学员端 Neo 行为约束横切）
- Home / Report Center 都涉及 Ora 双实例 / 联动是否需独立 L2

### 3.3 ⏸️ 待审：F.3 全局

| L1 | 当前 L2 数 |
|---|---|
| F.3.1 用户级全局 | 8 |
| F.3.2 平台级策略 | 8 |

待审：是否"用户能做什么 / 平台在什么条件下运行"两维度足够 / 还是需重组。

### 3.4 ⏸️ 待审：F.4 Agent 数据库

| L1 | 当前 L2 数 |
|---|---|
| F.4.1 数据模型 AOM | 7 |
| F.4.2 记忆与数据空间 | 5 |
| F.4.3 Agent 行为约束 | 8（含新加 5 类卡片产出规则）|
| F.4.4 感知与评分规则 | 4 |

待审：4 L1 拆分粒度是否合理 / 数据 vs 规则 vs 约束的边界。

### 3.5 节点数

| 顶层 | L1 | L2 |
|---|---|---|
| F.1 学员端 | 5 | **26** |
| F.2 管理端 | 6 | 38 |
| F.3 全局 | 2 | 16 |
| F.4 Agent 数据库 | 4 | 24 |
| **合计** | **17** | **104** |

L0+L1+L2 = **125 节点**

---

## 4 · 关键文档位置

| 文档 | 路径 | 状态 |
|---|---|---|
| METHOD 方法论文档 | `02-temp/feature-tree-method.md` | v2 / ~750 行 / 7 Phase 实施规划 |
| L1+L2 草稿 | `02-temp/feature-tree-L1-L2-draft.md` | v2 / 含全部决议 + 学员端完整 / 其他待审 |
| debate 记录 | `02-temp/feature-tree-debate-2026-05-06.md` | 5 角色辩论 7 议题 |
| **本进度备忘** | `02-temp/feature-tree-progress.md` | 续接用 |

---

## 4.5 · ⏸ recap 重新讨论决议（2026-05-07 / 待落地）

DM 切回 recap 产品需求重新讨论 / 4 项决议如下 / **待落地到 spec / glossary / feature tree**：

### 决议 1 · 状态机简化（4 → 3）

```
锁定 → 完整态首聊 → 自由复习
```
- 前序未完成 → recap 入口锁定 / 不可进
- 删 spec 原"空白态" + "部分态"
- Neo 行为态：4 → 3（删预览态）

### 决议 2 · recap 定位明确化

```
recap = "阶段性整合 + Neo 主动产出 + 跨 Activity 视角"
```

与其他场域差异化：
- 不是 lecture 单次巩固 → recap 跨 Activity 整合
- 不是大厅辅导按需应用 → recap Neo 主动产出
- 不是 practice 单次复盘 → recap 阶段性多次行为整合

### 决议 3 · 报告 4 块结构（5 → 4）

```
① 「这一段我学了什么」（内容/知识层）
   - 跨 Activity 知识网络（Neo 实时推导）
   - 关键概念 / 学到的工具 / 还有疑问的

② 「这一段我表现怎么样」（行为/客观层）★ 新加
   - 学习时长 / 节奏 / 频率
   - 完成情况
   - 高光行为（具体引用 / 客观）
   - 卡点行为（具体引用 / 客观）

③ 「这一段我学得怎么样」（模式/主观推断层）
   - 学习模式画像（Neo 解读）
   - 6 维画像变化（Neo 用人话解读 / 不直接给分数）
   - 学习节奏（深入 vs 浅尝 / 系统 vs 跳跃）
   - 状态变化（情绪 / 投入度变化）

④ 「我接下来该做什么」（行动层）
   - 1-3 条具体应用计划（Neo 主动整合）
   - 对应工作场景
   - 入大厅待办 + 到期检查
```

### 决议 4 · 知识网络轻处理

Neo **实时推导** / 不依赖 KGP "概念关系图" / AOM 不加新字段。

### 待落地清单（DM 决定何时执行）

- [ ] 更新 `00-public/product-V-0.2.0-D-5.0/spec/05-learner/05-recap【已审阅】.md`
- [ ] 更新 `00-public/product-V-0.2.0-D-5.0/spec/00-glossary.md`（4 学员状态 → 3 / 报告 5 块 → 4 / 添加新术语）
- [ ] 更新 `00-public/product-V-0.2.0-D-5.0/spec/CHANGELOG.md`（加 v3 recap 变更记录）
- [ ] 更新 `02-temp/feature-tree-L1-L2-draft.md` 中 F.1.4 recap（学员状态机 4 → 3 / 报告产出系统 4 L3 → 4 块新结构）

---

## 5 · 下次续接策略

### 5.1 下一个待办

按优先级：
- **A. 审 F.2 管理端**（最大 / 38 L2 / 同维度混乱风险）/ 1 次 1 模块审 / 仿 lecture/practice/recap 做法
- **B. 审 F.3 全局 + F.4 Agent 数据库**（量小 / 可一起）
- **C. 学员端先做 commit 保护**（防丢 / 但本目录是 02-temp 不持久 / 可考虑 mv 到正式位置）

### 5.2 续接对话开场建议

DM 回来时可说："继续 feature tree / 接着审 F.2 管理端" 或 "继续 F.3 全局" 等。

Claude 应：
1. Read 本备忘（feature-tree-progress.md）+ L1+L2 草稿（feature-tree-L1-L2-draft.md）
2. 确认上下文 / 给状态摘要
3. 按 DM 指示继续

### 5.3 启动 Phase A 的前置条件

**L1+L2 草稿全部审完（F.1/F.2/F.3/F.4 都拍板）后** → 启动 Phase A：
1. 建 `00-public/product-V-0.2.0-D-5.0/feature-tree/` 目录
2. mv METHOD.md 从 02-temp/ → feature-tree/METHOD.md
3. 建 master.yaml + 4 子 yaml 骨架（含 L1+L2 内容 / 由 Claude 从草稿转换）
4. 建 scripts/（build-tree.js / yaml-to-mindmap.js / build-spec-index.js / package.json）
5. 跑 npm install
6. 跑脚本验证（自动 ID / 生成 mindmap / SPEC-INDEX）
7. 创建 .vscode/settings.json
8. commit + push
9. 给 DM 看 → DM 决定是否继续 Phase B-E（向下拆 L3+）

---

## 6 · 思路速查

### 6.1 何时该独立 L2

- ✅ 有独立"业务核心"地位（非附庸于其他 L2）
- ✅ 能写出至少 1 条完整 BDD（GUI 或 Agent 任一）
- ✅ 横切多个其他 L2 的负向规则（如 Neo 行为约束）

### 6.2 何时该埋为 L3

- ❌ 是某 L2 的内部细分（如 4 库是看板下的子组件）
- ❌ 是某 L2 的不同维度（如 4 SCO 类型是内容演绎下的子集）
- ❌ 是某 L2 的状态/态/规则（如 4 学员状态是状态机下的子集）

### 6.3 何时该完全不进 tree

- ❌ 纯设计哲学 / 理念（如"为什么取消 Leo"）
- ❌ spec 层 GUI 框架（如三区视觉布局）
- ❌ spec 层设计原则（如"三场域统一框架 4 共享 + 7 约束"）
- ❌ 不可写 BDD（不可测）

### 6.4 横切（双向引用）原则

- F.4.3 Agent 行为约束 = **规则定义**（是什么 / 不能做什么）
- F.1.X.Neo 行为约束 = **场域应用**（在场域中具体怎么做）
- 双向引用 / 不重复定义

---

**当前暂停 / 等 DM 续接信号** ✋
