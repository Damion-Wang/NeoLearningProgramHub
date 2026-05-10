---
name: D-5.0 supplements README
product-version: V-0.2.0
last-updated: 2026-05-09
status: active
---

# V-0.2.0 / D-5.0 supplements · D-5.0 spec 补充区

> 本目录是 D-5.0 spec 的**补充区**——收录跨 spec 设计决议 + UI demo + demo vs spec 偏差校准结果。所有内容用于支持 D-5.0 spec 的实施 / 不替代 D-5.0 spec 本身。

## 关系

- **基线**：[D-5.0 spec](../product-V-0.2.0-D-5.0/spec/)（22 文件 / 当前基线 / **recap 已含 D-5.1 重写整合 2026-05-09**）
- **本目录**：D-5.0 补充区 / 装跨 spec 决议文档 + UI demo
- **glossary**：本目录**不另起** glossary / 术语 / 编号变更**回写**到 [`D-5.0/spec/00-glossary.md`](../product-V-0.2.0-D-5.0/spec/00-glossary.md)

## 当前内容

| 文件 / 路径 | 用途 |
|---|---|
| [`D-5.0-spec-supplements-2026-05-09.md`](D-5.0-spec-supplements-2026-05-09.md) | **D-5.0 spec 补充文档**（341 行 / 21 项决议 / 跨 spec + demo 偏差校准）/ 由 cross-spec-decisions + demo-vs-spec-diff 两源文档合并而成 |
| [`demo/`](demo/) | 完整可运行 UI demo（24.63 MB / 112 文件 / 9 HTML / 双击启动）|

## 已合并 / 已删除的历史文件（参考）

| 时间 | 操作 | 文件 | 落点 |
|---|---|---|---|
| 2026-05-09 | 合并 | `cross-spec-decisions-2026-05-08.md`（已删）| 内容并入 `D-5.0-spec-supplements-2026-05-09.md` |
| 2026-05-09 | 合并 | `demo-vs-spec-diff-2026-05-09.md`（已删）| 内容并入 `D-5.0-spec-supplements-2026-05-09.md` |
| 2026-05-09 | 整合 | `recap.md`（已删）| 直接替换 [`D-5.0/spec/05-learner/05-recap【已审阅】.md`](../product-V-0.2.0-D-5.0/spec/05-learner/05-recap【已审阅】.md)（923 行 / 含 16 项 PM 决议 + 自主 debate 修订）|
| 2026-05-09 | 搬出 | `demo-vs-spec-diff-debate-log-2026-05-09.md` | 搬到 [`02-temp/`](../../02-temp/)（过程文档）|
| 2026-05-09 | 删除 | `naming-convention.md` | 命名规则不再单独维护 |

## UI Demo

包含 9 个 HTML 页面：
- 学员端：`hall.html` / `lecture.html` / `practice.html` / `recap.html`
- 管理端：`mgthome.html` / `proconfig.html` / `reportcenter.html` / `massagemgt.html`
- 入口：`00-睿学Demo-双击启动.html`（login 页）

4 个演示账号（密码 `demo2026`）：
- `zhao@demo.neolearning.com` —— 学员（赵工）/ hall 入口 / 学员视角全功能
- `hr@demo.neolearning.com` —— 管理员（HR 王）/ mgthome 入口 / HR 视角
- `admin@demo.neolearning.com` —— 多角色（陈总）/ hall 入口 / **★ 双端切换重头戏**
- `error@demo.neolearning.com` —— 错误演示

关键约束：0 远程依赖 / 自包含 / localStorage session 跨 tab 共享。详见 `demo/README.md` + `demo/SPEC.md`。

## 工作期临时档（在 [`02-temp/`](../../02-temp/)）

D-5.0 补充期间的过程文档保留在 02-temp：

- `D-5.1-recap-build-plan-2026-05-07.md` — recap 重写期构建规划
- `recap-report-v6-mock-2026-05-07.md` + `recap-report-v7-design-2026-05-07.md` — recap 报告 mock + v7 设计要点
- `feature-tree-debate-2026-05-06.md` + `feature-tree-method.md` + `feature-tree-method-2026-05-06.md` + `feature-tree-L1-L2-draft.md` + `feature-tree-progress.md` — feature-tree 探索归档（已暂停）
- `demo-vs-spec-diff-debate-log-2026-05-09.md` — 5 角色自主 debate 完整记录（diff 文档优化过程产物）
- `record` — DM 录音转文字（2026-04-13）

## 整合路径

本目录的补充内容可按需以两种方式回写到 D-5.0 spec：

1. **替换式整合**：直接用本目录文件覆盖 D-5.0 同名文件 / 本目录副本删除（如 recap 2026-05-09 已用此方式）
2. **保留为补充**：本目录长期保留 / 与 D-5.0 spec 互为引用 / 不强行回写（如 demo / 跨 spec 决议汇总文档）

整合时机由 DM 决定。

## 参考资料

- 中欧报告参考：[`01-ref/product-ideas/报告/`](../../01-ref/product-ideas/报告/)（recap 设计期导入 / xmind / PPTX / 7 文件）
- 项目协作宪法：[`CLAUDE.md`](../../CLAUDE.md)
- 阶段进展：[`PROGRESS.md`](../../PROGRESS.md)
