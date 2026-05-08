---
purpose: Feature Tree 方法论 + 实施规划（v2 终版 / 10 题确认后调整）
status: 等 DM 启动 Phase A
version: v2
created: 2026-05-07
last-updated: 2026-05-07
based-on: 7 议题 5 角色辩论决议（02-temp/feature-tree-debate-2026-05-06.md）+ DM 4+7+10 决议
---

# Feature Tree 方法论 + 实施规划 · v2 终版

> 基于 21 决议（前期 4 决议 + 5 角色辩论 7 议题决议 + 10 题 DM 确认）+ 存储格式 J 已拍板。
>
> **目的**：把 D-5.0 spec/ 23 文件的产品定义（叙事性）转化为结构化 feature tree（功能拆解 + BDD testcase + 优先级 + 产品说明书素材）。
>
> ⚠️ v2 关键调整（vs v1 / 2026-05-07 10 题确认）：
> - 顶层 5 → **4**（lifecycle 并入 F.2 管理端 / foundation 拆两路）
> - 单 yaml → **master.yaml + 4 子 yaml**
> - 加"草稿讨论环节"（drafts/ 走 git / commit 后删）
> - 优先级判定 = Claude 提议 + DM 拍板
> - testcase 数量不限（看 feature 实际需要）

---

## 0 · 背景

### 0.1 上下文

- D-5.0 spec/ 23 文件已交付（叙事性产品定义 / 含 00-glossary 术语表 + CHANGELOG）
- 下一步：构建 feature tree
- **4 个用途**（DM 明确）：
  1. feature 描述
  2. behaviour 作 testcase（GUI + Agent 两种）
  3. 优先级判定
  4. 产品说明书原始资料

### 0.2 11 决议总览

**前期 4 决议**：
| # | 决议 | 选择 |
|---|---|---|
| 1 | 拆分起点 | D-5.0 spec/ 22 文件（不全拆） |
| 2 | 存储格式 | 混合：1 总览 + N 模块（→ 调整为方案 J YAML） |
| 3 | Behaviour 写作 | BDD Given/When/Then + Agent 加 Why 子句 |
| 4 | 5 角色辩论 | 已完成 |

**辩论 7 议题决议**：
| # | 议题 | 选择 |
|---|---|---|
| 1 | 树深度边界 | C 仅可写 BDD |
| 2 | 节点 schema | B + agent-behavior-source = 10 字段 |
| 3 | 4 类 testcase 覆盖 | B 分层覆盖 |
| 4 | 优先级体系 | D 5 档（P0/P1/P2/P3/L）|
| 5 | 关联 spec | A + 反向索引 |
| 6 | ID 命名 | A 树状 dotted F.X.Y.Z |
| 7 | 哪些不拆 | C 跳 3 + foundation 拆"可测点" |

**存储格式追加决议**：方案 J（YAML + 自动 ID 脚本 + Markmap 预览）/ Node.js 已装

---

## 1 · 拆分原则

### 1.1 起点：D-5.0 spec/ 22 文件（不全拆）

| spec 文件 | 处理 | 理由 |
|---|---|---|
| `00-glossary.md` | ❌ 不拆 | 术语表 / 是引用源不是 feature |
| `CHANGELOG.md` | ❌ 不拆 | 变更日志 / 历史档 |
| `01-vision【已审阅】.md` | ❌ 不拆 | 理念叙事 / 强行切 feature 失原意 |
| `02-foundation/` 4 文件 | 🔧 **拆两路** | 数据/规则 → F.4 Agent 数据库（独立顶层）/ 行为表现 → 融入消费场域 F.1/F.2（见 § 4）|
| `03-lifecycle/` 3 文件 | ✅ 拆但**并入 F.2 管理端**（不独立顶层）| 生命周期阶段是管理端动作（admin/HR/项目运营操作）|
| `04-global/` 2 文件 | ✅ 拆 | 用户级 + 平台级功能 |
| `05-learner/` 6 文件 | ✅ 拆 | 学员端核心 |
| `06-management/` 5 文件 | ✅ 拆 | 管理端核心 |

**合计**：20 文件拆 / 3 文件跳。

### 1.2 树深度边界

**叶子节点判定标准**（议题 1 决议 C）：能写出至少 1 条完整的 BDD（GUI 或 Agent 任一即可）。

- ✅ 是叶子：能写出 `Given X / When Y / Then Z` 的具体场景
- ❌ 不是叶子：只能描述抽象概念 / 写不出具体场景 / 还能合理拆为子 feature

**举例**：
- "看板" 不是叶子 → 拆为 项目总览区 / 内容目录区 / 学习成果区 / 社区窗口
- "项目总览区" 不是叶子 → 拆为 热力图 / 时间轴 / 数据卡 3 张 / 感知图谱 / 待办清单
- "进度态 chip" 是叶子 → `Given 学员进度=60% / When 进入大厅 / Then chip 显示绿色"跟上"`

**层级数量不限** / 拆到不可再写 BDD 即停。

### 1.3 ID 命名

格式：`F.X.Y.Z`（树状 dotted notation / 与 spec § X.Y.Z 形式一致 / 前缀 F 区分）

**顶层分配（v2 / 4 顶层）**：
- `F.1.X` = **学员端**（spec 05-learner/ + foundation 中"Neo 在场域的行为表现"融入此处）
- `F.2.X` = **管理端**（spec 06-management/ + **lifecycle 03-lifecycle/ 并入** + foundation 中"Ora 行为表现"融入）
- `F.3.X` = **全局**（spec 04-global/ 用户级 + 平台级）
- `F.4.X` = **Agent 数据库**（新独立顶层 / spec 02-foundation/04-data-model + 01-personas 数据空间 + 行为约束清单 + methodology 中识别/评分规则）

**示例**：`F.1.1.2.3.1.1` = 学员端 → 大厅 → 看板 → 项目总览区 → 热力图 → 单元格颜色映射

**ID 由脚本自动生成**（DM 不写 ID / 见 § 5.2）。

### 1.4 优先级（5 档）

| 档 | 含义 |
|---|---|
| **P0** | 本期必做 / 无此 feature 产品不可用 |
| **P1** | 本期重要 / 无此 feature 产品体验显著差 |
| **P2** | 本期可有可无 / 缺失影响小 |
| **P3** | 本期争取 / 有时间就做 |
| **L**（Later）| 明确未来做 / 不在本期 scope（如 inquiry / sandbox / 多人对练）|

**判定参考**：
- spec 章节标"本期不做"/"未来" → L
- D-4.0 已标 P0/P1/P2/P3 → 沿用 / 但要重新评估
- 新引入概念按"是否阻塞其他 feature"判断 P0 vs P1
- 边角 widget / 视觉细节 → P2

**判定流程**（v2 / Q7 决议）：
- **Claude 提议 + DM 拍板**
- 草稿阶段：Claude 根据上述判定参考提议初版优先级（写到 markdown 草稿）
- DM review 草稿：调整不合理项
- 落 yaml 时：DM 已确认的 priority 写入字段

### 1.5 关联 spec（单向 + 反向索引）

每个 feature 节点 `spec-source` 字段指向 spec 章节：
```yaml
spec-source: [05-learner/02-hub § 1.2.1.4]
```

拆完后统一生成反向索引文件 `feature-tree/SPEC-INDEX.md`。

不修改 spec 文件本身。

---

## 2 · 节点 Schema（10 字段）

```yaml
id: F.1.1.2.3.1.1               # 自动生成
name: 单元格颜色映射               # 中文 ≤ 15 字
parent: F.1.1.2.3.1              # 自动生成
description: |
  根据学员当日学习时长 + Activity 完成数,
  把热力图单元格映射为 5 档颜色（无/浅/中/深/最深）。
priority: P0                      # P0/P1/P2/P3/L
spec-source: [05-learner/02-hub § 1.2.1.4]
agent-behavior-source: null       # Agent 行为节点必填 / GUI-only 节点为 null
                                  # 例：[02-foundation/02-methodology § 1.5 (Bloom 6 层)]
depends-on: [F.1.1.2.3.1]         # 依赖的其他 feature ID（可空）
behaviour-GUI:
  - happy: |
      Given 学员当日学习 30 分钟 + 完成 2 个 Activity
      When 学员进入大厅 / 看到看板
      Then 当日单元格显示中档绿色（hex #...）
  - edge: |
      Given 学员当日学习 0 分钟
      When 学员进入大厅
      Then 当日单元格显示无色（透明 / 仅边框）
behaviour-Agent: null             # 不涉及 Agent 行为则为 null
```

### 字段说明

| 字段 | 必填 | 来源 |
|---|---|---|
| `id` | ✅ 自动 | 脚本生成 |
| `name` | ✅ 手填 | DM / Claude 拆解时填 |
| `parent` | ✅ 自动 | 脚本生成 |
| `description` | ✅ 手填 | 1-3 句话 / 不写实现细节 |
| `priority` | ✅ 手填 | P0/P1/P2/P3/L |
| `spec-source` | ✅ 手填 | `[文件名 § X.Y]` 格式 |
| `agent-behavior-source` | ⚠️ 条件必填 | 仅当含 `behaviour-Agent` 时 |
| `depends-on` | ⏭️ 选填 | 依赖其他 feature ID |
| `behaviour-GUI` | ⚠️ 条件必填 | feature 涉及 UI 时 |
| `behaviour-Agent` | ⚠️ 条件必填 | feature 涉及 Agent 时 |

---

## 3 · Behaviour 写作（BDD）

### 3.1 GUI 行为 · 经典三段

```
Given <前置条件 / 系统状态 / 数据状态>
When <用户动作 / 触发事件>
Then <可观测结果 / UI 反馈>
```

### 3.2 Agent 行为 · 增强四段（加 Why）

```
Given <场域 + 学员状态 + 上下文>
When <学员动作 / 触发信号>
Then <Neo / Ora / Actor / Director 应该怎么做>
Why: <教学方法论根据 / spec 引用>
```

**Why 的作用**：记录 Agent 行为的"判断逻辑"——区别于 GUI 的机械响应。让 Agent 行为可解释 / 可追溯 / 可质疑。

### 3.3 4 类 testcase 分层覆盖

| 类型 | 必列条件 | 含义 |
|---|---|---|
| **happy** | 所有 feature 必列 | 正常工作流 |
| **edge** | 所有 feature 必列 | 边界条件 / 极端值 |
| **adversarial** | **Agent 行为节点必列** / GUI 节点视情况 | 对抗性输入（prompt injection / 越权请求 / 误导引导）|
| **off-topic** | 有"用户输入"的节点必列 | 用户跑题（学员问"你是 ChatGPT 吗"）|

**testcase 数量**（v2 / Q4 决议）：每类 testcase 数量**不限** / 看 feature 实际需要 / 模板示例每类 1 条仅作起点 / 复杂 feature 可写 3-5 条覆盖更多边界。

### 3.4 BDD 写作约束

- ❌ 不写实现细节（不写 SQL / API / 模块名）
- ❌ 不写主观判断（"看起来友好" / "感觉自然"）
- ✅ 写**可观测**的输入输出
- ✅ Agent 行为 Then 段可写"Neo 引用具体 X / 不剧透 Y / 反问 Z"
- ✅ 引用 spec 章节作 Why 子句根据

---

## 4 · foundation 拆分（v2 / 拆两路）

foundation 4 文件不全拆 / 也不独立顶层 / 而是**拆两路 + 完全不拆**：

### 4.1 数据/规则路 → F.4 Agent 数据库（独立顶层）

属于"数据结构 / 规则 / 行为约束"的可测点 → 落到 **F.4 Agent 数据库**：

- **02-foundation/04-data-model**（主体）：
  - 9 类 SCO 类型识别规则
  - AOM 模板字段约束 / AOM 学习实例字段约束
  - 自适应 L1-L4 规则
- **02-foundation/01-personas**（数据 + 约束部分）：
  - 三级记忆数据结构（短期/中期/长期）
  - 数据空间 3 层架构（公共 / 学员独立 / Agent 内部）
  - memory_id 跨场域引用规则
  - **Neo 行为约束清单**（Neo 不能做 5 条 / 教学边界 3 类 / 主动触发 6 场景）
  - **Ora 行为约束清单**（不直接联系学员 / 不自动调度）
- **02-foundation/02-methodology**（规则部分）：
  - 4 维感知识别规则（情绪 10 状态识别条件）
  - 8 学习信号识别规则（识别条件）
  - 6 维 × 5 等级评分规则（写入 Profile 的算法）

### 4.2 行为表现路 → 融入消费场域（F.1 学员端 / F.2 管理端）

属于"Agent 在某场域的行为表现"的可测点 → 融入消费场域 feature 内部 BDD 的 Why 子句 + agent-behavior-source 字段引用 / **不独立 feature**：

- Neo 在 lecture 调用 7 动作的具体行为 → F.1.lecture/* 各 feature 内 behaviour-Agent
- Neo 在大厅响应 8 学习信号的具体行为 → F.1.hub/* 内
- Neo 在 practice 复盘的苏格拉底追问 → F.1.practice/* 内
- Ora 在 Home 看板被动呈现 + 主动问答的具体行为 → F.2.home/* 内
- Ora 在 Report Center 的 HITL 编辑行为 → F.2.report-center/* 内

### 4.3 完全不拆 ❌

纯概念性章节（不可测 / 不构成 feature）：

- "5 大理论底座为什么选这 5 个"（设计哲学）
- "Neo 第一性原理的哲学根据"（理念叙事）
- "为什么取消 Leo"（历史决策）
- "像人 > 懂你 的冲突仲裁原则"（设计哲学）
- foundation/03-roles-and-ports 的角色定义（已在 § 3 全局账号体系覆盖）

### 4.4 判断流程

```
foundation 章节
    ↓
能写 BDD?
    ├── ❌ 不能 → 完全不拆（§ 4.3）
    └── ✅ 能 → 是数据/规则/约束?
                    ├── ✅ 是 → F.4 Agent 数据库（§ 4.1）
                    └── ❌ 否（行为表现）→ 融入消费场域（§ 4.2）
```

---

## 5 · 存储格式 J 实现规划 ★

### 5.1 文件结构（v2 / master.yaml + 4 子 yaml）

```
00-public/product-V-0.2.0-D-5.0/feature-tree/
├── README.md                    导览
├── METHOD.md                    本方法论文档（v2 终版 / 从 02-temp/ mv 过来）
├── master.yaml                  ★ 总入口 / 元数据 + 4 子 yaml 路径 + 顶层概览
├── tree-learner.yaml            F.1 学员端（不写 ID / 树状嵌套）
├── tree-management.yaml         F.2 管理端（含 lifecycle）
├── tree-global.yaml             F.3 全局
├── tree-agentdb.yaml            F.4 Agent 数据库
├── tree-with-ids/               ★ 脚本生成 / 含 ID + parent / 工具消费
│   ├── master.yaml
│   ├── tree-learner.yaml
│   ├── tree-management.yaml
│   ├── tree-global.yaml
│   └── tree-agentdb.yaml
├── tree-mindmap.md              脚本合并 4 yaml 生成 / Markmap 总览
├── SPEC-INDEX.md                脚本扫 4 yaml 生成 / 反向索引
├── drafts/                      讨论期临时草稿（commit 后删 / git history 留痕）
├── .gitignore                   node_modules/
└── scripts/
    ├── build-tree.js            读 master.yaml → 调 4 子 yaml → 生成 ID + parent → 输出 tree-with-ids/
    ├── yaml-to-mindmap.js       合并 4 yaml → 生成 tree-mindmap.md
    ├── build-spec-index.js      扫 4 yaml → 生成 SPEC-INDEX.md
    └── package.json             依赖 js-yaml
```

### 5.2 yaml schema 示例（v2 / master + 子 yaml）

#### 5.2.1 master.yaml（总入口）

```yaml
# master.yaml · 总入口 / 元数据 + 4 子 yaml 路径 + 顶层概览
# 不存 feature 节点 / 仅作索引 + 元数据

version: V-0.2.0-D-5.0
last-updated: 2026-05-07
status: in-progress

# 4 子 yaml 索引
trees:
  - id: F.1
    name: 学员端
    file: tree-learner.yaml
    description: spec 05-learner/ + foundation 中"Neo 在场域行为表现"融入

  - id: F.2
    name: 管理端
    file: tree-management.yaml
    description: spec 06-management/ + 03-lifecycle/ 并入 + foundation 中"Ora 行为表现"融入

  - id: F.3
    name: 全局
    file: tree-global.yaml
    description: spec 04-global/ 用户级 + 平台级

  - id: F.4
    name: Agent 数据库
    file: tree-agentdb.yaml
    description: spec 02-foundation/04-data-model + 01-personas 数据空间 + 行为约束 + methodology 识别/评分规则
```

#### 5.2.2 tree-learner.yaml（F.1 子树示例）

```yaml
# tree-learner.yaml · F.1 学员端 / 不写 ID / 不写 parent / 由脚本生成

# F.1 学员端（顶层 / 由 build-tree.js 标 F.1）
- name: 学员端
  priority: P0
  spec-source: [05-learner/01-overview]
  description: 学员使用的端口 / 大厅+3 学习场域+跨场域机制
  children:

    # F.1.1 大厅
    - name: 大厅
      priority: P0
      spec-source: [05-learner/02-hub]
      description: 中枢层 / 不算场域 / Neo 持续陪伴 + 看板 + 笔记悬浮球
      children:

        # F.1.1.1 Neo 辅导
        - name: Neo 辅导
          priority: P0
          spec-source: [05-learner/02-hub § 1.2]
          description: 大厅 Neo 3 角色（辅导 + 督学 + 课程推荐）
          children:
            # ...
            []

        # F.1.1.2 看板
        - name: 看板
          priority: P0
          spec-source: [05-learner/02-hub § 1.3]
          description: 4 区域（项目总览 + 内容目录 + 学习成果 + 社区窗口）
          children:

            # F.1.1.2.1 项目总览区
            - name: 项目总览区
              priority: P0
              spec-source: [05-learner/02-hub § 1.3.1]
              description: 5 大组件
              children:

                # F.1.1.2.1.1 热力图
                - name: 热力图
                  priority: P0
                  spec-source: [05-learner/02-hub § 1.3.1.1]
                  description: 学习时长 + token 累计可视化
                  agent-behavior-source: null
                  depends-on: []
                  behaviour-GUI:
                    - happy: |
                        Given 学员当日学习 30 分钟
                        When 进入大厅
                        Then 当日单元格显示中档绿色
                    - edge: |
                        Given 学员当日学习 0 分钟
                        When 进入大厅
                        Then 单元格显示无色
                  behaviour-Agent: null
```

### 5.3 自动 ID 脚本（build-tree.js / v2）

```javascript
#!/usr/bin/env node
// scripts/build-tree.js · v2
// 读 master.yaml → 按 trees 列表读 4 子 yaml → 各自分配 ID（按 master 的 id 作 prefix）
// 输出 tree-with-ids/ 目录（含 master.yaml + 4 子 yaml）

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MASTER_PATH = path.join(ROOT, 'master.yaml');
const OUT_DIR = path.join(ROOT, 'tree-with-ids');

function assignIds(nodes, prefix, parentId = null) {
  nodes.forEach((node, idx) => {
    node.id = `${prefix}.${idx + 1}`;
    node.parent = parentId;
    if (node.children && node.children.length > 0) {
      assignIds(node.children, node.id, node.id);
    }
  });
}

function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const master = yaml.load(fs.readFileSync(MASTER_PATH, 'utf8'));

  // 处理每个子 yaml
  master.trees.forEach(treeMeta => {
    const subPath = path.join(ROOT, treeMeta.file);
    const subTree = yaml.load(fs.readFileSync(subPath, 'utf8'));

    // 子 yaml 顶层节点用 master.trees[i].id 作 prefix
    // 例：F.1 学员端 / F.1 下子节点变为 F.1.1, F.1.2...
    assignIds(subTree, treeMeta.id);

    // 写到 tree-with-ids/<file>
    const outPath = path.join(OUT_DIR, treeMeta.file);
    fs.writeFileSync(outPath, yaml.dump(subTree, { lineWidth: 200, noRefs: true }));
    console.log(`✅ ${treeMeta.id} ${treeMeta.name} → ${outPath}`);
  });

  // 复制 master.yaml 到 tree-with-ids/（保留作索引 / 不改 trees）
  fs.copyFileSync(MASTER_PATH, path.join(OUT_DIR, 'master.yaml'));
  console.log(`✅ master.yaml → ${OUT_DIR}/master.yaml`);
}

main();
```

**用法**：
```bash
cd 00-public/product-V-0.2.0-D-5.0/feature-tree
node scripts/build-tree.js
```

**npm 依赖**（仅 1 个）：
```json
{ "dependencies": { "js-yaml": "^4.1.0" } }
```

**说明**：
- 子 yaml 的顶层节点（仅 1 个 / 即 F.1 学员端 等）会被赋值为 master 的 trees[i].id（如 F.1）
- 子节点递归 F.1.1 / F.1.1.1 / ...
- 各子 yaml ID 互相独立 / 不会冲突

### 5.4 yaml-to-mindmap.js 脚本（v2）

```javascript
#!/usr/bin/env node
// scripts/yaml-to-mindmap.js · v2
// 读 tree-with-ids/master.yaml → 合并 4 子 yaml → 输出 tree-mindmap.md（Markmap 源）

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TREES_DIR = path.join(ROOT, 'tree-with-ids');
const MASTER_PATH = path.join(TREES_DIR, 'master.yaml');
const OUT_PATH = path.join(ROOT, 'tree-mindmap.md');

function nodeToMd(node, depth) {
  const heading = '#'.repeat(Math.min(depth, 6));
  const tag = node.priority ? ` [${node.priority}]` : '';
  let md = `${heading} ${node.id} ${node.name}${tag}\n`;
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      md += nodeToMd(child, depth + 1);
    });
  }
  return md;
}

function main() {
  const master = yaml.load(fs.readFileSync(MASTER_PATH, 'utf8'));

  let md = '# Feature Tree · Mindmap (v2 / 4 顶层合并)\n\n';
  md += '> 用 Markmap VSCode 插件预览 / 自动生成 / 不要手改\n\n';

  master.trees.forEach(treeMeta => {
    const subPath = path.join(TREES_DIR, treeMeta.file);
    const subTree = yaml.load(fs.readFileSync(subPath, 'utf8'));
    subTree.forEach(node => {
      md += nodeToMd(node, 1);
    });
  });

  fs.writeFileSync(OUT_PATH, md);
  console.log(`✅ Mindmap markdown 已生成 → ${OUT_PATH}`);
}

main();
```

### 5.5 build-spec-index.js 脚本（v2）

```javascript
#!/usr/bin/env node
// scripts/build-spec-index.js · v2
// 读 tree-with-ids/master.yaml → 扫 4 子 yaml 收集 spec-source → 输出 SPEC-INDEX.md

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TREES_DIR = path.join(ROOT, 'tree-with-ids');
const MASTER_PATH = path.join(TREES_DIR, 'master.yaml');
const OUT_PATH = path.join(ROOT, 'SPEC-INDEX.md');

const index = new Map();  // spec § → [feature IDs]

function walk(nodes) {
  nodes.forEach(node => {
    if (node['spec-source']) {
      const sources = Array.isArray(node['spec-source'])
        ? node['spec-source']
        : [node['spec-source']];
      sources.forEach(src => {
        if (!index.has(src)) index.set(src, []);
        index.get(src).push(node.id);
      });
    }
    if (node.children) walk(node.children);
  });
}

function main() {
  const master = yaml.load(fs.readFileSync(MASTER_PATH, 'utf8'));

  // 扫 4 子 yaml
  master.trees.forEach(treeMeta => {
    const subPath = path.join(TREES_DIR, treeMeta.file);
    const subTree = yaml.load(fs.readFileSync(subPath, 'utf8'));
    walk(subTree);
  });

  // 按 spec 文件分组
  const byFile = new Map();
  for (const [src, ids] of index) {
    const [file] = src.split(' § ');
    if (!byFile.has(file)) byFile.set(file, []);
    byFile.get(file).push({ src, ids });
  }

  let md = '# SPEC-INDEX · spec § X.Y → feature ID 反向查表\n\n';
  md += '> 自动生成 / 不要手改 / 跑 `node scripts/build-spec-index.js` 重新生成\n\n';

  for (const [file, entries] of [...byFile.entries()].sort()) {
    md += `## ${file}\n\n`;
    entries.sort((a, b) => a.src.localeCompare(b.src));
    entries.forEach(({ src, ids }) => {
      md += `- \`${src}\` → ${ids.join(', ')}\n`;
    });
    md += '\n';
  }

  fs.writeFileSync(OUT_PATH, md);
  console.log(`✅ SPEC-INDEX 已生成 → ${OUT_PATH}`);
}

main();
```

### 5.6 VSCode 配置

**推荐插件**（feature-tree/ 工作目录用）：

| 插件 | 用途 |
|---|---|
| **YAML**（红帽出品 / Red Hat）| YAML 高亮 + 折叠 + schema 校验 |
| **Markmap**（gera2ld）| 预览 tree-mindmap.md 为可缩放思维导图 |
| **Better TOML** | 如未来加 TOML 配置 |

**项目级 settings.json 推荐**（`.vscode/settings.json`）：
```json
{
  "yaml.format.enable": true,
  "yaml.format.singleQuote": false,
  "[yaml]": {
    "editor.tabSize": 2,
    "editor.insertSpaces": true,
    "editor.formatOnSave": true
  },
  "files.associations": {
    "tree.yaml": "yaml",
    "tree-with-ids.yaml": "yaml"
  }
}
```

### 5.7 工作流（DM 视角）

**日常编辑**：
1. 用 VSCode 打开 `tree.yaml`
2. 在合适位置增删节点 / 不用关心 ID
3. 跑：`node scripts/build-tree.js`（自动填 ID）
4. 跑：`node scripts/yaml-to-mindmap.js`（更新思维导图）
5. 用 Markmap 插件预览 `tree-mindmap.md`

**最终生成**（拆完后）：
```bash
node scripts/build-tree.js && node scripts/yaml-to-mindmap.js && node scripts/build-spec-index.js
```

**git 工作流**：
- `tree.yaml` 是源（DM 编辑）
- `tree-with-ids.yaml` / `tree-mindmap.md` / `SPEC-INDEX.md` 是衍生（git 提交但脚本生成）
- 提交前先跑脚本 / 保证衍生文件最新
- 可加 git pre-commit hook 自动跑

### 5.8 工作流（Claude 视角 / 建 feature 时）

Claude 在 Phase B-F 拆 feature 时（**含草稿讨论环节** / 详见 § 7.0）：
1. Read 一个 spec 文件
2. 识别功能模块
3. **写 markdown 草稿** 到 `feature-tree/drafts/<phase>-<板块>-draft.md`
4. **DM review 草稿** / 改 / 直到拍板
5. 把草稿转 yaml / Edit `tree.yaml` 添加节点 + 9 字段 schema
6. 跑 `build-tree.js`
7. 删除 drafts/ 下对应文件
8. Commit

---

## 6 · 7 Phase 实施规划（v2 / 删 lifecycle 独立 Phase）

### 6.1 Phase A · 框架建立

**产出**：
- `feature-tree/` 目录
- `feature-tree/README.md`（导览 / 21 决议 / 工作流 / 进度跟踪）
- `feature-tree/METHOD.md`（本方法论文档 / 从 02-temp/ mv 过来）
- `feature-tree/master.yaml`（总入口 / 4 子 yaml 索引）
- `feature-tree/tree-learner.yaml`（顶层骨架 / 仅 1 顶层节点）
- `feature-tree/tree-management.yaml`
- `feature-tree/tree-global.yaml`
- `feature-tree/tree-agentdb.yaml`
- `feature-tree/scripts/build-tree.js`
- `feature-tree/scripts/yaml-to-mindmap.js`
- `feature-tree/scripts/build-spec-index.js`
- `feature-tree/scripts/package.json`（依赖 js-yaml）
- `feature-tree/.gitignore`（node_modules / tree-with-ids/ 是否走 git 待 DM 决定）
- `feature-tree/scripts/README.md`（脚本说明 + 使用步骤）

**估时**：1 commit / 短

**验收**：
- 跑 `node scripts/build-tree.js` 无报错 / 生成 tree-with-ids/ 4 子 yaml
- VSCode 打开 master.yaml + 子 yaml 折叠正常
- Markmap 插件可预览 tree-mindmap.md（虽然只有 4 顶层节点）

### 6.2 Phase B · 学员端 6 子阶段（写 tree-learner.yaml）

**产出**：tree-learner.yaml 含完整学员端子树
**估算**：~180 节点 / lecture+practice+recap 是大头

**每子阶段流程（含草稿讨论）**：Read spec → 写草稿 drafts/B<N>-<板块>-draft.md → DM review → 落 yaml → 跑脚本 → 删草稿 → commit

**子阶段**（B1-B6）：
- **B1**：05-learner/01-overview（顶层 + 5 子模块概览）
- **B2**：05-learner/02-hub（4 区域 + 5 大组件 + Neo 辅导 / 估 50 节点）
- **B3**：05-learner/03-lecture（三区视觉 + 4 SCO + Quiz 7 题型 + 教学边界 / 估 30 节点）
- **B4**：05-learner/04-practice（三角色 + 4 阶段 + 状态矩阵 + 重练 / 估 50 节点）
- **B5**：05-learner/05-recap（4 状态 + Neo 4 行为态 + 5 块报告 + 完成事件层 / 估 40 节点）
- **B6**：05-learner/06-cross-context（5 卡片矩阵 + 笔记悬浮球 + 三场域统一约束 / 估 20 节点）

**估时**：6 子阶段 / 每子阶段 2 commit（draft + final）= 12 commit

### 6.3 Phase C · 管理端 + lifecycle 8 子阶段（写 tree-management.yaml）★

**产出**：tree-management.yaml 含管理端 5 模块 + lifecycle 3 模块（**lifecycle 并入此处 / v2 决议 Q1**）
**估算**：~155 节点（管理端 ~125 + lifecycle ~30）

**子阶段**（C1-C8）：
- **C1**：06-management/01-overview（4 模块 + Ora 双实例 + 双态切换概念）
- **C2**：06-management/02-home（看板区 + Home Ora 3 能力 + 个体详情面板 / 估 30 节点）
- **C3**：06-management/03-report-center（报告库 + 报告编辑 + ChatBI + 3 协同编辑 / 估 40 节点）
- **C4**：06-management/04-program-config（双态 + 6 配置板块 / 估 30 节点）
- **C5**：06-management/05-message（消息管理 + 消息编辑 + 三大类消息 / 估 20 节点）
- **C6**：03-lifecycle/01-pre-learning（试运行 + 签单 + 开营组织 / 估 10 节点）
- **C7**：03-lifecycle/02-learning（学习期管理动作 / 项目里程碑触发 / 催学动作 / 估 15 节点）
- **C8**：03-lifecycle/03-completion（结营 + 服务期 + 归档 / 估 10 节点）

### 6.4 Phase D · global 2 子阶段（写 tree-global.yaml）

**产出**：tree-global.yaml
**估算**：~30 节点

- **D1**：04-global/01-user-global（账号 / 登录 / 个人设置 / 消息 / 帮助）
- **D2**：04-global/02-platform-global（设备 / i18n / 合规 / 数据生命周期）

### 6.5 Phase E · Agent 数据库 多子阶段（写 tree-agentdb.yaml）★

**产出**：tree-agentdb.yaml（v2 新独立顶层 / 整合 foundation 数据/规则路）
**估算**：~50 节点

**子阶段**（E1-E4）：
- **E1 数据模型**：02-foundation/04-data-model（9 SCO 类型识别 / AOM 模板字段 / AOM 学习实例字段 / 自适应 L1-L4 规则 / 估 20 节点）
- **E2 记忆与数据空间**：02-foundation/01-personas 数据部分（三级记忆数据结构 / 数据空间 3 层架构 / memory_id 跨场域引用 / 估 12 节点）
- **E3 Agent 行为约束**：02-foundation/01-personas 约束部分（Neo 不能做 5 条 / 教学边界 3 类 / 主动触发 6 场景 / Ora 不直接联系学员 / 不自动调度 / 估 10 节点）
- **E4 感知/评分规则**：02-foundation/02-methodology 规则部分（4 维感知识别 / 8 学习信号识别 / 6 维 × 5 等级评分 / 估 8 节点）

**注**：foundation 中"行为表现"路（如 Neo 在 lecture 调用 7 动作的具体行为）**不在此 Phase** / 在 B/C Phase 已融入消费场域 feature 内部 BDD 的 Why 子句。

### 6.6 Phase F · SPEC-INDEX + Mindmap 最终生成

**产出**：
- `tree-with-ids/`（最终 / 4 子 yaml + master）
- `tree-mindmap.md`（最终 / 合并 4 顶层）
- `SPEC-INDEX.md`（最终反向索引）

**操作**：跑 3 个脚本 / 1 commit

### 6.7 Phase G · 4 维审查 + 修复

**手段**：long-doc-review skill（如果合并文档大）/ 或主线程审查

**4 维**：
- **全局**：feature 树是否覆盖 D-5.0 spec 全量功能（4 顶层是否完备）
- **中观**：每个板块子树是否合理（无遗漏 / 无重复 / 优先级合理）
- **细节**：BDD 是否写对（GUI 三段 / Agent 四段含 Why）
- **关联**：spec-source 是否准确 / depends-on 是否完整 / SPEC-INDEX 是否完整

**估时**：1-2 commit / 视情况

### 6.8 Phase 总览

| Phase | 内容 | 估 commit | 估节点数 |
|---|---|---|---|
| A 框架 | 目录 + 脚本 + 4 yaml 骨架 | 1 | 4 顶层 |
| B 学员端 | 6 子阶段（B1-B6）| 12 | ~180 |
| C 管理端 + lifecycle | 8 子阶段（C1-C8）| 16 | ~155 |
| D 全局 | 2 子阶段（D1-D2）| 4 | ~30 |
| E Agent 数据库 | 4 子阶段（E1-E4）| 8 | ~50 |
| F SPEC-INDEX + Mindmap | 1 | 1 | - |
| G 4 维审查 | 1-2 | - | - |
| **合计** | **7 Phase / ~21 子阶段** | **~43 commit** | **~415 节点** |

---

## 7 · 工作流总览

### 7.0 ★ markdown 草稿讨论环节（DM 追加要求 / 2026-05-07）

**DM 要求**：Phase B-F 拆每个 spec 文件**先用 markdown 讨论拆分方案和拆分逻辑** / DM 确认后再落 yaml 格式。

**两步流程**：
- **Step 1 · markdown 草稿**：Claude 写树状大纲 + 简短描述 + 优先级标注 / 不必填完整 BDD / 给 DM review
- **Step 2 · 落 yaml**：DM 拍板（确认 / 调整 / 重拆）后 Claude 转 yaml + 填完整 9 字段 schema + 跑脚本

**草稿存放**：`feature-tree/drafts/<phase>-<板块>-draft.md`
- 该子阶段完成（落 yaml + commit）后 / 删除该 draft 文件
- 全 Phase 完成后 / 整个 drafts/ 目录删除

**git 工作流**（v2 / Q10 决议 / 走 git）：
- 草稿写好 → `git add drafts/B2-hub-draft.md` + commit `"draft(feature-tree): B2 大厅 草稿"`
- 草稿讨论修改 → 后续 commit 跟进 `"draft(feature-tree): B2 大厅 草稿 v2"`
- DM 拍板 → 落 yaml + commit `"feat(feature-tree): B2 大厅 落 yaml"`
- 删除草稿 → `git rm drafts/B2-hub-draft.md` + commit `"chore(feature-tree): 删 B2 大厅 草稿（已落 yaml）"`
- **git history 保留** / 需要回查时 `git log -- drafts/B2-hub-draft.md` 找 commit / `git show <commit>:drafts/B2-hub-draft.md` 重示

**草稿模板**：

```markdown
# Phase B2 · 大厅 拆分草稿

> spec source: 05-learner/02-hub
> 等 DM 确认后落 tree.yaml

## 大厅（priority: P0）
> 中枢层 / 不算场域 / Neo 持续陪伴 + 看板 + 笔记悬浮球

### Neo 辅导（P0）
> 大厅 Neo 3 角色（辅导 + 督学 + 课程推荐）

#### 辅导能力（P0）
> 应用咨询 / 学员场景咨询 + Bloom 引导
- 备注：Agent 行为节点 / 需 agent-behavior-source

#### 督学能力（P1）
> 主动督促 / 6 场景之一

#### 课程推荐（P0）
> 基于学员状态推荐下一 Activity

### 看板（P0）
> 4 区域

#### 项目总览区（P0）
> 5 大组件

##### 热力图（P0）
> 学习时长 + token 累计可视化
- behaviour-GUI: 有
- behaviour-Agent: 无（Neo 引用 chip 状态时见单独 feature）

##### 时间轴（P1）
> ...
```

**讨论方式**：
- Claude 写完草稿 → 在对话里给 DM 看摘要（顶层 + L2 / L3 略提）
- DM 反馈："拆得太细 / 这层合并" / "缺这块" / "优先级不对" / 等
- Claude 改草稿 → 再 review
- 直到 DM 说"OK 落 yaml"

**好处**：
- 草稿成本低（不填 9 字段 / 不写 BDD）
- 拆分逻辑先对齐 / 再做填字段苦力活
- 错了改成本低（改 markdown vs 改 yaml）

### 7.1 拆解流程（每个 spec 文件）★ 含草稿环节

1. Read spec 文件
2. 识别功能模块（不是概念 / 不是历史）
3. **【草稿】写 markdown 草稿到 `feature-tree/drafts/<phase>-<板块>-draft.md`**
4. **【DM review】给 DM 看草稿 / 等反馈 / 改 / 直到 DM 拍板**
5. 划分顶层 feature（spec § 1 → feature 顶层 / spec § 1.X → L2）
6. 递归拆 BDD-able 叶子（直到能写 BDD）
7. **【落 yaml】把草稿转 yaml + 填完整 9 字段 schema（除 ID 自动生成）**
8. 自检（叶子是否真不能再拆 / Agent 节点 Why 是否填 / Adversarial 是否覆盖）
9. 跑脚本生成 ID
10. **删除 drafts/ 下对应文件**
11. commit

### 7.2 review 流程

- 每个 spec 文件拆完 → 单独 commit（per-file commit / 易回滚）
- 板块拆完 → DM 抽样 review（每板块抽 2-3 节点看 BDD）
- Phase H 全量 4 维审查

### 7.3 commit 流程

- Phase A：1 commit（框架建立）
- Phase B-F：每子阶段 1 commit（共 ~17 commit）
- Phase G：1 commit（最终生成）
- Phase H：1-2 commit（审查 + 修复）
- 总计 ~20 commit / 期间可分批 push

---

## 8 · 风险与应急

### 8.1 rate limit

**风险**：之前的工作多次 hit limit / 单 Agent 跑大量 Edit 易触发

**应急**：
- 每子阶段独立 commit（可断点续传）
- 大板块（如 practice / recap）拆为更小单元
- 优先用主线程 + 小 Edit / 不用 Agent 大 Write
- 如 hit limit / 隔几小时再续

### 8.2 Node 环境

**风险**：脚本依赖 js-yaml

**应急**：
- 用户已确认 Node.js 已装
- 若 npm install 失败 / 用 yarn 或本地安装 js-yaml
- 备选：手填 ID（方案 C 降级）

### 8.3 yaml 文件太大

**风险**：所有 feature 在一个 yaml / 估 5000-8000 行

**应急方案 1**：保持单文件 / 靠 VSCode 折叠
**应急方案 2**：拆多文件（按 F.1.X / F.2.X / ... 5 个顶层 → 5 个 yaml）+ 脚本合并
- 现阶段先单文件 / 拆完后看大小决定是否拆多文件

### 8.4 BDD 写得不规范

**风险**：DM / Claude 写 BDD 时格式不统一 / 影响 testcase 质量

**应急**：
- METHOD.md 含 BDD 模板（§ 3）/ 每次拆 feature 都参考
- Phase H 4 维审查的"细节"维度专门检查 BDD 规范
- 可加 lint 脚本（未来）

---

## 9 · 进度跟踪

### 9.1 4 用户用途映射

| 用户用途 | 由 schema 哪些字段满足 |
|---|---|
| 1. feature 描述 | `name` + `description` + `parent` |
| 2. behaviour 作 testcase | `behaviour-GUI` + `behaviour-Agent`（4 类分层）|
| 3. 优先级判定 | `priority` |
| 4. 产品说明书原始资料 | 全部字段（特别是 description + behaviour-* + spec-source 形成完整说明书素材）|

### 9.2 进度追踪表（Phase A 启动后填）

| Phase | 状态 | 节点数 | commit | 备注 |
|---|---|---|---|---|
| A 框架建立 | ⏸ pending | - | - | - |
| B1 学员端总览 | ⏸ | - | - | - |
| B2 大厅 | ⏸ | - | - | - |
| B3 lecture | ⏸ | - | - | - |
| B4 practice | ⏸ | - | - | - |
| B5 recap | ⏸ | - | - | - |
| B6 跨场域 | ⏸ | - | - | - |
| C1-C5 管理端 | ⏸ | - | - | - |
| D1-D2 global | ⏸ | - | - | - |
| E1-E4 foundation | ⏸ | - | - | - |
| F1-F3 lifecycle | ⏸ | - | - | - |
| G SPEC-INDEX | ⏸ | - | - | - |
| H 4 维审查 | ⏸ | - | - | - |

---

## 10 · 拆完后的下一步

- DM 全量 review
- 4 维审查 + 修复
- 给研发对接（基于 feature tree 估工 / 排期 / 写实现）
- 反向更新 spec（如发现 spec 描述不全 / 反向补充）
- 优先级排序 → 制定 sprint plan

---

## 11 · DM 启动信号（v2）

DM 拍板"启动 Phase A" → Claude 执行：

1. 创建 `00-public/product-V-0.2.0-D-5.0/feature-tree/` 目录
2. 把本 METHOD.md 从 `02-temp/feature-tree-method.md` mv 到 `feature-tree/METHOD.md`
3. 创建 `feature-tree/README.md`（短导览 / 21 决议总结）
4. 创建 `feature-tree/master.yaml`（总入口 / 4 trees 元数据）
5. 创建 4 子 yaml 顶层骨架：
   - `feature-tree/tree-learner.yaml`（仅 1 顶层"学员端"节点）
   - `feature-tree/tree-management.yaml`（仅 1 顶层"管理端"节点）
   - `feature-tree/tree-global.yaml`（仅 1 顶层"全局"节点）
   - `feature-tree/tree-agentdb.yaml`（仅 1 顶层"Agent 数据库"节点）
6. 创建 `feature-tree/scripts/`：
   - `build-tree.js` / `yaml-to-mindmap.js` / `build-spec-index.js`
   - `package.json`（依赖 js-yaml）
   - 跑 `npm install`
7. 创建 `feature-tree/.gitignore`（含 node_modules/）
8. 创建 `feature-tree/drafts/.gitkeep`（占位 / 让 drafts/ 目录纳入 git）
9. 跑脚本验证：`node scripts/build-tree.js && node scripts/yaml-to-mindmap.js && node scripts/build-spec-index.js`
10. 创建 `.vscode/settings.json`（YAML 格式化 / Markmap 配置）
11. commit + push

完成后给 DM 看 → DM 决定是否继续 Phase B（B1 学员端总览）。

---

**等 DM 启动信号** ✋
