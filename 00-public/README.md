# 00-public/ — 正式交付物

项目的正式产出文档。所有经过审阅确认的设计文档、分析报告、决策记录归档在此。

## 目录说明

| 目录 | 说明 | 当前状态 |
|------|------|---------|
| [product-V-0.2.0-D-4.0/](product-V-0.2.0-D-4.0/) | ★ D-4.0 已审阅 spec + feature-tree + 原型 | 冻结快照 |
| [product-V-0.2.0-D-5.0/](product-V-0.2.0-D-5.0/) | ★ D-5.0 spec 22 文件（含 00-glossary）+ CHANGELOG / **recap 已含 D-5.1 重写内容（2026-05-09 整合）** | 已交付 / 当前基线 |
| [product-V-0.2.0-D-5.0-supplements/](product-V-0.2.0-D-5.0-supplements/) | ★ **D-5.0 spec 补充区**（D-5.0-spec-supplements 综合决议文档 + UI demo）| **进行中** |
| [2-business/](2-business/) | 商业分析（市场调研、战略、财务、验证、品牌）| 已基于 v0.3.3 更新 |
| [3-tech/](3-tech/) | 技术分析与设计（现有技术栈、coaching-skills 项目）| 分析完成 |
| [4-decisions/](4-decisions/) | ADR + 主题决策包 | 6 ADR + 1 底层建设期决策包（2026-04-26） |
| [5-process/](5-process/) | 过程记录（设计日志、辩论、Backlog） | 持续更新 |
| [6-content/](6-content/) | 课程内容参考（FLM 17 份 + GROW 12 份 + AOM 样例）| 有效 |

## 核心文件

- **D-5.0 主体 spec（基线 / 改 spec 读这个）**：[product-V-0.2.0-D-5.0/spec/](product-V-0.2.0-D-5.0/spec/) — 22 文件（21 章节 + 00-glossary 术语表 / 全部【已审阅】 / 每文件独立编号 / **recap 已含 D-5.1 重写整合 2026-05-09**）
- **D-5.0 spec 补充区**：[product-V-0.2.0-D-5.0-supplements/](product-V-0.2.0-D-5.0-supplements/)
  - [D-5.0-spec-supplements-2026-05-09.md](product-V-0.2.0-D-5.0-supplements/D-5.0-spec-supplements-2026-05-09.md) — 综合决议文档（21 项 / 跨 spec 决议 + demo 偏差校准）
  - [demo/](product-V-0.2.0-D-5.0-supplements/demo/) — UI demo（9 HTML / 双端切换 / 24.63 MB / 双击启动）
- **D-4.0 总纲**：[product-V-0.2.0-D-4.0/spec/requirements-v0.4.0.md](product-V-0.2.0-D-4.0/spec/requirements-v0.4.0.md) — v0.4.0 总纲（已冻结）
- **D-4.0 功能树**：[product-V-0.2.0-D-4.0/feature-tree/](product-V-0.2.0-D-4.0/feature-tree/) — 10 份功能树（v0.4.0 对齐版）
- **底层建设决策**：[4-decisions/底层建设期-2026-04-26/](4-decisions/底层建设期-2026-04-26/) — 50 题 PM 决策 + 三大底层原则 + Neo Soul final + 数据集与样本

## 当前阶段

```
spec v0.4.0（已完成 2026-04-22）→ 原型 v1.1（已完成 2026-04-23）
  → 底层建设期 know-how 库（已完成 2026-04-26）
    → V-0.2.0 / D-5.0 spec 已交付（2026-05-06 / 22 文件）
      → D-5.1 局部迭代（2026-05-07 起 / recap 重写）
        → D-5.1 recap 替换式整合回 D-5.0（2026-05-09）
          → 🔄 D-5.0 supplements 综合决议文档 + UI demo（2026-05-09）
            → 暂不进入 D-6.0（DM 决定何时整合其他补充内容 / 退出）
```

## 重要约定

- **D-4.0 整体冻结** / **D-5.0 是当前基线**（recap 已含 D-5.1 整合）/ 新设计走 **D-5.0-supplements**
- 补充到 D-5.0 两种方式：① **替换式整合**（直接覆盖 D-5.0 同名 / 补充区不留副本 / 如 recap 2026-05-09） ② **保留为补充**（与 D-5.0 spec 互为引用 / 不强行回写 / 如 demo + 综合决议文档）
- 补充区 **不另起 glossary**，术语 / 编号变更回写到 D-5.0/spec/00-glossary.md
- 文件名已去 `[已审阅]` 前缀（路径 `product-V-0.2.0-D-4.0/` 即表达已审阅状态）
- ADR 编号格式：`001-简短标题.md`
- 主题决策包：跨多议题决策集合，按 `主题-YYYY-MM-DD/` 命名（见 4-decisions/）
- 版本号体系：详见根 [CLAUDE.md](../CLAUDE.md) "版本号体系" 章节

## 历史变更

- **2026-05-09 后续**：D-5.1 目录改名为 D-5.0-supplements / cross-spec-decisions + demo-vs-spec-diff 两文档**内容驱动合并**为 D-5.0-spec-supplements-2026-05-09.md（341 行 / 21 项决议）/ debate-log 搬到 02-temp / naming-convention 删
- **2026-05-09**：D-5.1 recap（898 行 / 16 项 PM 决议 + 自主 debate 修订 / T0/T1 基线 / 关联 Activity 不含 recap / 6 维范围收紧）**替换式整合**回 D-5.0 同名（923 行）/ D-5.1 副本删除
- **2026-05-07 ~ 05-08**：D-5.1 局部迭代启动 —— recap 单文件重写 / 报告 5 章 → 6 章 / 第 3-4 章定位重排 / 报告与 Neo 双主体 / 行动建议便签化 / + 跨 spec 补充决策（默认密码 / TTS 范围 / Neo GIF）
- **2026-05-06**：D-5.0 全量术语校准 + 编号重建 + 引用替换 + 03-full 退场 + claude-workspace 过程档清理（spec/ 22 文件最终交付）
- **2026-04-29**：V-0.2.0 目录归集（D-4.0 + D-5.0）+ 退出底层建设期
- **2026-04-26**：底层建设期决策包建立（50 题 PM 决策 + 12 份 know-how 文档）
- **2026-04-23**：原型 v1.1 交付 + spec 反向补充 18 条
- **2026-04-22**：spec v0.4.0 全部审阅完成
- **2026-04-13**：项目结构升级到 6 大区
