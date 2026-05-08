---
purpose: feature tree 方法论 5 角色辩论记录（给 DM 拍板）
status: 待 DM 决议
created: 2026-05-06
---

# Feature Tree 方法论辩论 · 7 议题

> 5 角色：**PM 资深** / **资深研发** / **测试** / **Agent 产品研究员** / **文档架构师** + 主持人
> 已决定的 4 件事不再辩：① 拆分起点 = D-5.0 spec 22 文件 ② 存储格式 = 1 总览 + N 模块 ③ Behaviour 写作 = BDD Given/When/Then + Agent 加 Why ④ 5 角色 debate

---

## 议题 1 · 树深度边界

**问题**：feature 拆到哪里算"不可再拆"？

候选：A 单一职责 / B 1-2 开发任务可完成 / C 可写 BDD / D spec 章节直接对应 / E A+C 综合

**5 角色发言**：
- **PM 资深**：选 A（单一职责）/ 怕工程粒度过细 / 业务关注点不在原子操作
- **资深研发**：选 B（1-2 开发任务）/ 拆得太抽象研发不知怎么实现 / 工程能落地是底线
- **测试**：选 C（可写 BDD）/ 拆到不可测试就没意义 / 测试是 feature 完成标志
- **Agent 产品研究员**：选 C / Agent 行为可测才有意义 / 但 Agent 行为粒度可能比 GUI 更粗
- **文档架构师**：选 A / 太细维护爆炸 / spec 已在 § 1.X.Y.Z 拆得很细 / feature tree 别比 spec 更细

**反驳**：
- **PM 资深 → 资深研发**：粒度交给工程会拆太细 / 我们不是 sprint planning 是 feature 拆解
- **资深研发 → 测试**：可测不等于工程能做 / 你拆到一个按钮颜色的 BDD 也是 BDD 但研发用不了

**主持人裁定**：选 **E 综合（A + C）** / 理由：A 防过细 / C 防过虚 / 两者结合是合理"叶子"判定标准 —— 满足"不能再合理分成 2 个独立子 feature" + "至少能写 1 条 BDD（GUI 或 Agent 任一）"

**给 DM 的推荐**：**E**（单一职责 + 可写至少 1 条 BDD）

---

## 议题 2 · 节点 schema 完整版字段

**问题**：每个 feature 节点应该有哪些字段？

候选：A 极简 6 字段 / B 标准 9 字段 / C 完整 12 字段

**5 角色发言**：
- **PM 资深**：选 A 极简 / 字段越多 PM 越懒得填 / 写不完
- **资深研发**：选 C 完整 / 缺 depends-on / status / acceptance-criteria 没法对接 / 研发要看完整图
- **测试**：选 C / 必须有 testcase-categories 4 类才能 plan 测试覆盖
- **Agent 产品研究员**：选 B + 加 1 个新字段 `agent-behavior-source`（教学方法论根据来源）/ AI 产品 behavior 来源关键
- **文档架构师**：选 A 极简 / 多字段流于形式 / 优先级 + spec-source 已够链回

**反驳**：
- **资深研发 → PM 资深**：你嫌字段多 / 我交付时全要补 / 现在不留位置后面更乱
- **文档架构师 → 测试**：testcase 单独维护更好 / 别塞节点

**主持人裁定**：选 **B 标准 9 字段** / 理由：A 太少（缺 spec-source 对不上 / 缺 depends-on 工程做不了）/ C 太多（status / owner 是 PM 工作流字段 / 不该在 spec 树 / 应在项目管理工具）/ 9 字段是平衡点

**给 DM 的推荐**：**B / 9 字段**：
```yaml
id          # F.1.1.2.3.4 dotted notation
name        # 中文名称
parent      # 父节点 ID
description # 1-3 句话定义
priority    # P0/P1/P2/P3/L
behaviour-GUI    # BDD Given/When/Then 列表（可空）
behaviour-Agent  # BDD Given/When/Then/Why 列表（可空）
spec-source     # [文件名 § X.Y]
depends-on      # 其他 feature ID 列表
```

---

## 议题 3 · 4 类 testcase 场景的覆盖范围

**问题**：每个 feature 下都列 Happy / Edge / Adversarial / Off-topic 4 类吗？

候选：A 必列 4 类 / B Happy+Edge 必列 / Adversarial 和 Off-topic 视情况 / C 仅顶层重点 feature 列 4 类 / D testcase 单独文档

**5 角色发言**：
- **PM 资深**：选 C / 重点 feature 列 4 类 / 叶子列 happy 即可 / 工作量考虑
- **资深研发**：选 D / testcase 单独维护 / 别塞节点 / 否则节点太重
- **测试**：选 A 必列 4 类 / AI 产品 adversarial 必须有 / 边界遗漏代价大
- **Agent 产品研究员**：选 A 但分级 / 叶子列 4 类 / 父节点继承 / 边界靠 simulation testing
- **文档架构师**：选 C / 全列会让文档变 testcase 库 / 失焦

**反驳**：
- **测试 → PM 资深**：你嫌全列工作量大 / 但产品 ship 后发现 Adversarial bug 才是大工作量
- **资深研发 → Agent 产品研究员**：分级听起来好 / 实际写起来"父节点继承哪些 testcase"判断不清

**主持人裁定**：选 **B**（必列 Happy + Edge / Adversarial 视 feature 性质 / Off-topic 看是否有用户输入）/ 理由：A 太重 / C 太松 / D 把 testcase 拆出去管理负担更大 / B 是覆盖 + 工作量平衡。Adversarial 在 Agent 行为节点列（因为 Agent 才有 prompt injection / 越权请求等风险）/ Off-topic 在用户输入节点列（学员问"你是 ChatGPT 吗"等）

**给 DM 的推荐**：**B** / Happy + Edge 必列 / Adversarial 看 feature 性质（Agent 行为节点必列 / GUI 节点视情况）/ Off-topic 看是否有用户输入

---

## 议题 4 · 优先级体系

**问题**：用什么优先级？

候选：A P0-P3 / B MoSCoW（Must/Should/Could/Won't）/ C 数字打分 1-10 / D P0-P3 + L（Later）= 5 档

**5 角色发言**：
- **PM 资深**：选 A P0-P3 / D-4 已用 / 团队熟悉 / 不要换
- **资深研发**：选 D / 区分"本期不做" vs "永远不做" / 工程要知道
- **测试**：选 D / 测试要根据优先级排资源 / "永远不做"测试不投入
- **Agent 产品研究员**：选 D / 加 L（Later）/ Agent 产品迭代快 / 未来要做的标记重要
- **文档架构师**：选 A / D 增加复杂度 / 未来做不做用 spec 章节"未来"标记即可

**反驳**：
- **文档架构师 → 资深研发**：你说要标"永远不做"/ 那是 scope 决定 / 不是优先级
- **PM 资深 → Agent 产品研究员**：L 和 P3 区别在哪 / P3 不就是争取做不一定做吗

**主持人裁定**：选 **D（P0/P1/P2/P3/L）** / 理由：A 4 档不够 / 部分 feature 明确"未来做"（如 inquiry 场域 / sandbox / 多人对练）/ 这些不是 P3（P3 = 本期争取做）/ 是 L（Later 未来）/ 区分有助于研发对接和 spec 引用 / MoSCoW 命名陌生 / 数字打分主观

**给 DM 的推荐**：**D** 5 档：
- **P0** = 本期必做（无此 feature 产品不可用）
- **P1** = 本期重要（无此 feature 产品体验显著差）
- **P2** = 本期可有可无（缺失影响小）
- **P3** = 本期争取（有时间就做）
- **L**（Later） = 明确未来做（不在本期 scope）

---

## 议题 5 · 关联 spec 方式

**问题**：feature tree 怎么和 spec/ 23 文件双向链接？

候选：A 单向（feature → spec）/ B 双向（spec 反向链 features）/ C 不显式链

**5 角色发言**：
- **PM 资深**：选 A 单向 / 双向维护成本高 / 一边对了就行
- **资深研发**：选 B 双向 / 工程从 spec 进入也要找 feature / 找不到来回切
- **测试**：选 A / 我们从 feature 找 spec / 不需要反向
- **Agent 产品研究员**：选 A + 工具辅助 / 用 grep 反向找 / 不在 spec 硬写
- **文档架构师**：选 A / spec 已稳定 / 反向链让 spec 跟着 feature 改 / spec 应是 source of truth

**反驳**：
- **资深研发 → 文档架构师**：现实是研发会从 spec 找 feature / 没反向链要 grep / 浪费时间
- **PM 资深 → 资深研发**：那加一个 spec-source-index.md 总表 / 不要每个 spec 文件改

**主持人裁定**：选 **A + 反向索引文件** / 理由：B 双向维护成本高且 spec 已交付不该再频繁改 / C 易脱钩。A 单向 + 一个反向索引文件（`feature-tree/SPEC-INDEX.md`）是平衡点 —— 反向索引在 feature-tree/ 内 / 不动 spec / 但提供"从 spec § X.Y 找 feature ID"能力

**给 DM 的推荐**：**A + 反向索引** / 每个 feature 节点 frontmatter `spec-source: [文件名 § X.Y]` / feature-tree/ 维护一个 SPEC-INDEX.md 反向查表

---

## 议题 6 · feature ID 命名规则

**问题**：feature 节点 ID 怎么命名？

候选：A 树状 dotted（F.1.1.2.3.4）/ B 层级前缀（L1.hub.kanban.heatmap）/ C UUID / D 字母+数字（FH-001）

**5 角色发言**：
- **PM 资深**：选 B 层级前缀 / 看 ID 就知道哪个模块 / 易记
- **资深研发**：选 A 树状 dotted / 工具友好 / 排序天然有序
- **测试**：选 A / testcase 引用 ID 需要稳定 / dotted 简洁
- **Agent 产品研究员**：选 C UUID / 节点移动不变 ID / 长期可维护
- **文档架构师**：选 B 层级前缀 / 自描述性强 / 读 markdown 不需要查表

**反驳**：
- **资深研发 → 文档架构师**：B 层级前缀含 hub.kanban.heatmap 这就是路径 / 路径变 ID 也变 / 不稳定
- **Agent 产品研究员 → PM 资深**：UUID 你嫌不可读 / 但稳定性是长期受益

**主持人裁定**：选 **A 树状 dotted（F.1.1.2.3.4）** / 理由：B 含语义但路径变 ID 变 / 不稳。C UUID 完全无语义不友好。A 是工程主流 / 与 spec 编号体系（§ X.Y.Z）形式一致 / 排序友好 / 树状关系清晰可见。前缀加 F 区别于 spec 的 §

**给 DM 的推荐**：**A** / `F.X.Y.Z` 格式 / 与 spec § X.Y.Z 形成"功能拆解 vs 章节拆解"对照 / 例：`F.1.1.2.3` = 学员端 → 大厅 → 看板 → 项目总览区

---

## 议题 7 · spec 哪些文件不拆 feature

**问题**：哪些 spec 文件应该跳过 feature 拆解？

候选：A 跳 6 文件（00-glossary + CHANGELOG + 01-vision + 4 foundation）/ B 跳 2 文件（仅 00-glossary + CHANGELOG）/ C 跳 3 文件（00-glossary + CHANGELOG + 01-vision）/ foundation 拆

**5 角色发言**：
- **PM 资深**：选 A / foundation 是背景 / 不是功能
- **资深研发**：选 B / foundation 含 personas methodology / 这些是 Agent 行为来源 / 必须落 feature
- **测试**：选 B / 否则测不到 Neo 行为 / Neo 7 教学动作要 feature 化测试
- **Agent 产品研究员**：选 B 强烈 / Neo Persona / Soul / 4 维感知 / 6 维画像 都是 Agent 行为 feature 核心 / 不拆就丢了 AI 产品本质
- **文档架构师**：选 A / foundation 描述层不该硬切 feature / 该切的是消费者端口（learner/management）的 Neo 行为表现

**反驳**：
- **Agent 产品研究员 → 文档架构师**：你的"切消费者端口的 Neo 行为"对 / 但 Neo 行为来源是 foundation / 不引用怎么测
- **PM 资深 → 资深研发**：foundation 拆 feature 容易拆出"Bloom 6 层"这种概念 feature / 不可测

**主持人裁定**：选 **C（跳过 3 文件 / foundation 拆但只拆 Neo/Ora 的"可测 Agent 行为或数据结构" feature）** / 理由：A 太松（foundation 全跳但 Persona / 教学方法论 / 数据模型 SCO 类型 都是行为/数据 feature 的源 / 必须拆）/ B 太严（01-vision 是理念叙事 / 拆 feature 强行切割）/ C 是平衡 —— foundation 拆但只拆"可测的 Agent 行为或数据结构 feature"（如"Neo 在 lecture 调用 7 动作之讲授" / "AOM 模板 9 类 SCO 类型识别"等可测点）/ 跳过纯概念性章节（如"5 大理论底座为什么选这 5 个"）

**给 DM 的推荐**：**C** / 跳过 00-glossary + CHANGELOG + 01-vision 共 3 文件 / foundation 4 文件按"可测 Agent 行为或数据结构"拆 / 不拆纯概念性章节

---

## 7 议题决议总览表

| 议题 | 主持人推荐 | 理由（1 句）|
|---|---|---|
| 1 树深度 | **E（A+C）** | 单一职责 + 可写至少 1 条 BDD（GUI 或 Agent 任一）|
| 2 节点 schema | **B 标准 9 字段** | id/name/parent/description/priority/behaviour-GUI/behaviour-Agent/spec-source/depends-on |
| 3 testcase 覆盖 | **B 分层覆盖** | Happy+Edge 必列 / Adversarial 在 Agent 行为节点必列 / Off-topic 看用户输入 |
| 4 优先级 | **D 5 档** | P0/P1/P2/P3/L（L = 未来明确做 / 区别 P3 本期争取）|
| 5 关联 spec | **A + 反向索引** | feature → spec 单向 / 加 SPEC-INDEX.md 反向查表 |
| 6 ID 命名 | **A 树状 dotted** | F.1.1.2.3.4 / 与 spec § X.Y.Z 形式一致 |
| 7 哪些不拆 | **C** | 跳 00-glossary + CHANGELOG + 01-vision / foundation 按"可测点"拆 |

## 下一步行动

DM 拍板 7 议题（全采纳 / 部分调整 / 全否决）→ Claude 启动 feature tree 实施：

1. 建 `feature-tree/` 目录 + README + 模板
2. 按板块依次拆分（学员端 6 模块 → 管理端 5 模块 → global 2 模块 → foundation 4 模块"可测点"）
3. 边拆边填 9 字段 schema
4. 拆完后建 SPEC-INDEX.md 反向索引
5. long-doc-review skill 4 维审查

## 关键提示给 DM

⚠️ 议题 3 的"分层覆盖" + 议题 7 的"foundation 只拆可测点" 是 **5 角色立场最对立** 的两点 / 也是 AI 产品 feature tree 的核心特殊性所在 —— 你重点 review 这两条。

其他 5 议题（1/2/4/5/6）5 角色立场分歧不大 / 主持人裁定可放心采纳。
