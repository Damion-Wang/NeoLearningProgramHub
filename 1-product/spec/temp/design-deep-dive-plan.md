# 产品设计深度推演计划

**日期：** 2026-04-14
**输入：** requirements-v0.3.3.md + module-architecture.md
**输出：** 功能树 + 功能流程说明 + UX说明（逐层拆分，每层debate确认）

---

## 总体思路

```
模块架构（已完成）
    ↓
Phase 1: 应用层功能树（一拆多）
    ↓ debate确认
Phase 2: 每个功能的流程说明（多拆更多）
    ↓ debate确认
Phase 3: 关键页面的UX说明
    ↓ debate确认
Phase 4: 汇总定稿
```

每个Phase内部按"应用层模块"逐个推进，不是全部模块一起铺开。

---

## Phase 1: 功能树（Feature Tree）

### 目标
把 module-architecture.md 中每个应用层模块拆解为**功能→子功能→操作**三级功能树。

### 拆解顺序（按开发优先级）

```
Round 1: 三栏布局框架 + 账户权限（骨架先行）
    ↓ debate
Round 2: 辅导模块（大厅——学员端主入口）
    ↓ debate  
Round 3: 授课模块（第一个交付的教室）
    ↓ debate
Round 4: 对练模块 + 测评模块（两个教室一起，结构类似）
    ↓ debate
Round 5: 个人报告模块（教室四）
    ↓ debate
Round 6: HR端 + 运营端（管理端一起）
    ↓ debate
```

### 每个Round的工作流

```
Step 1: 我基于需求文档推演功能树初稿
Step 2: 启动debate（2轮）
  R1: 5角色走查功能树，找缺失/冗余/层级不对
      角色：学员/HR/课程设计师/交互设计师/魔鬼代言人
  → 网络调研（如有需要，搜索同类产品的功能设计参考）
  R2: 基于R1发现深挖具体问题
Step 3: 与创始人多轮提问确认
Step 4: 修订功能树，写入正式文档
```

### 功能树格式

```
模块名称
├── 功能1
│   ├── 子功能1.1
│   │   ├── 操作1.1.1: [描述] — [触发条件] — [输出]
│   │   └── 操作1.1.2: ...
│   └── 子功能1.2
│       └── ...
├── 功能2
│   └── ...
```

### 产出文件

每个Round产出一个文件：
- `1-product/feature-tree/01-layout-auth.md`
- `1-product/feature-tree/02-coaching.md`
- `1-product/feature-tree/03-teaching.md`
- `1-product/feature-tree/04-drill-assessment.md`
- `1-product/feature-tree/05-report.md`
- `1-product/feature-tree/06-management.md`

debate记录存入 `5-process/debates/round-04/` ~ `round-09/`

---

## Phase 2: 功能流程说明（Feature Flow）

### 目标
把功能树中的每个功能展开为**完整的交互流程**：用户做什么→系统做什么→异常怎么处理。

### 拆解顺序

与Phase 1对齐，每个Round对应一个模块的全部功能流程。

```
Round 7: 三栏布局的场景切换流程 + 登录/权限流程
    ↓ debate
Round 8: 辅导模块全部功能流程
    ↓ debate
Round 9: 授课模块全部功能流程（含打标SCO/闭环反馈/自适应）
    ↓ debate
Round 10: 对练+测评全部功能流程
    ↓ debate
Round 11: 个人报告全部功能流程
    ↓ debate
Round 12: HR端+运营端全部功能流程
    ↓ debate
```

### 功能流程格式

每个功能一个流程描述：

```
## 功能名称

### 触发条件
[什么情况下触发这个功能]

### 正常流程
1. 用户操作: [具体动作]
   系统响应: [具体响应]
   看板区变化: [如有]
   对话区变化: [如有]
2. ...

### 异常流程
- 异常1: [描述] → 系统处理: [方案]
- 异常2: ...

### 状态变化
[这个功能执行前后，哪些状态发生了变化]

### 数据记录
[这个功能产生了什么数据，存到哪里]
```

### 产出文件

- `1-product/feature-flows/01-layout-auth-flows.md`
- `1-product/feature-flows/02-coaching-flows.md`
- `1-product/feature-flows/03-teaching-flows.md`
- `1-product/feature-flows/04-drill-assessment-flows.md`
- `1-product/feature-flows/05-report-flows.md`
- `1-product/feature-flows/06-management-flows.md`

debate记录存入 `5-process/debates/round-10/` ~ `round-15/`

---

## Phase 3: UX说明（交互规格）

### 目标
基于功能树和功能流程，为每个关键页面/场景定义**交互规格**：信息层级、组件选择、联动规则、状态变化。

### 拆解顺序

不按模块拆，按**页面/场景**拆：

```
Round 13: 通用三栏框架UX（比例/联动/切换动画/折叠展开）
    ↓ debate
Round 14: 大厅页面UX（辅导对话+左侧看板各区域）
    ↓ debate
Round 15: 授课教室UX（PPT展示/Quiz交互/闭环反馈/自适应切换感知）
    ↓ debate
Round 16: 对练教室+测评教室UX
    ↓ debate
Round 17: 报告教室UX（BI图表/AI讨论/成长时间线）
    ↓ debate
Round 18: HR管理端+运营管理端UX
    ↓ debate
```

### UX说明格式

每个页面/场景：

```
## 页面名称

### 信息架构
[这个页面展示哪些信息，层级关系]

### 三栏内容定义
- 左侧目录区: [具体内容和交互]
- 中间看板区: [具体内容和交互]
- 右侧对话区: [具体内容和交互]
- 默认比例: [左:中:右]

### 关键交互
- 交互1: [触发] → [响应] → [联动效果]
- 交互2: ...

### 状态变化
[页面有哪些状态（首次/再次/完成/异常），各状态的展示差异]

### 联动规则
- 看板→对话: [具体联动]
- 对话→看板: [具体联动]

### 组件需求
[需要哪些UI组件：卡片/图表/对话气泡/进度条/Tab等]
```

### 产出文件

- `1-product/ui-ux/01-layout-framework.md`
- `1-product/ui-ux/02-hall-page.md`
- `1-product/ui-ux/03-teaching-classroom.md`
- `1-product/ui-ux/04-drill-assessment-classroom.md`
- `1-product/ui-ux/05-report-classroom.md`
- `1-product/ui-ux/06-management-pages.md`

debate记录存入 `5-process/debates/round-16/` ~ `round-21/`

---

## Phase 4: 汇总定稿

### 目标
把Phase 1-3的全部产出汇总为一份**产品设计总览文档**，作为开发团队的交付物。

### 产出
- `1-product/spec/product-design-v0.1.md`（汇总文档）
- 更新 `1-product/README.md`
- 更新 `5-process/backlog.md`

---

## 时间和资源估算

| Phase | Round数 | debate轮数 | 网络调研 | 预计时间 |
|-------|---------|-----------|---------|---------|
| Phase 1: 功能树 | 6 | 12（每Round 2轮） | 6次 | 2-3个对话session |
| Phase 2: 功能流程 | 6 | 12 | 3次 | 2-3个session |
| Phase 3: UX说明 | 6 | 12 | 3次 | 2-3个session |
| Phase 4: 汇总 | 1 | 0 | 0 | 1个session |
| **合计** | **19** | **36** | **12** | **7-10个session** |

每个session预计2-4小时的交互时间。

---

## debate角色配置

全程固定5个角色（与Round-02相同，已验证有效）：

1. **学员张三** — 体验视角
2. **HR李姐** — 管理端视角
3. **课程设计师** — 内容驱动+AOM视角
4. **交互设计师** — 三栏布局+交互细节视角
5. **魔鬼代言人** — 找茬+极端场景

主持人全程记录，每轮结束与创始人多轮提问确认。

---

## 执行原则

1. **一次只做一个Round**——不并行，确保每个模块的功能树经过debate确认后再进入下一个
2. **debate之间允许回溯**——如果Round 3的debate发现Round 2的功能树有问题，允许回去修改
3. **创始人确认是门禁**——每个Round的debate结束后，必须经过创始人多轮提问确认才能进入下一个Round
4. **所有中间产物都存文件**——功能树/流程/UX/debate记录全部落盘
5. **网络调研针对性强**——只搜索当前Round中发现的具体问题，不做泛搜索
