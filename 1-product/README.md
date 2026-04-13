# 1-product/ -- 产品设计

## 当前进度

- **需求规格 v0.3.3 已完成** -- 完整产品需求规格，见 [spec/requirements-v0.3.3.md](spec/requirements-v0.3.3.md)
- **模块设计阶段** -- 正在从需求规格拆解为模块级设计

## 目录说明

```
├── spec/            需求规格文档（requirements-v0.3.3.md + architecture.md）
├── user-flows/      用户流程（泳道图等）          -- 待开始
├── modules/         模块设计（各模块详细规格）      -- 待开始
├── feature-tree/    功能树（分层功能清单）          -- 待开始
├── feature-flows/   功能流程（单功能交互流）        -- 待开始
├── prototypes/      原型（可交互原型）              -- 待开始
├── ui-ux/           UI/UX 设计                     -- 待开始
```

根目录还有 3 个从商业分析阶段沿用的早期文档（**已过时，已被 v0.3.3 完全覆盖**）：
- ~~[mvp-definition.md](mvp-definition.md)~~ -- MVP 定义与成功标准（已过时）
- ~~[feature-prioritization.md](feature-prioritization.md)~~ -- MoSCoW 功能优先级（已过时）
- ~~[user-journey.md](user-journey.md)~~ -- 三条用户旅程（已过时）

## 设计阶段路径

```
spec（已完成）→ user-flows → modules → feature-tree → feature-flows → prototypes → ui-ux
```

每个阶段的输出是下一阶段的输入。当前在 spec 和 user-flows 之间。
