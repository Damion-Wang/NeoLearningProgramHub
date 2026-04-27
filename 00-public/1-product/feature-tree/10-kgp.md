# 功能树 10：KGP（内容生产工作台）

**Owner：** 寅恒、曾亚
**日期：** 2026-04-21
**版本：** v0.4.0 对齐版（L1+L2）
**对应 Spec：** `requirements-v0.4.0.md §2 角色与端口（KGP）`+ `§5 AOM 五层` + `§7.1 内容驱动` + 各场域剧本字段

---

## 一句话定位

内容生产工作台 — 生产 AOM 内容包供 ContentMgt 消费。KGP 团队使用的独立生产工具链（非学员端 / 非管理端）。

---

## 功能结构

```
A. 生产工作台 UI
   A1 树形编辑器（Project / Course / Activity / SCO / Segment 五层）
   A2 项目视图 / 内容视图切换
   A3 协作编辑（多人编辑 + 版本控制 + 冲突检测）
   A4 草稿 / 发布状态管理

B. SCO 编辑器
   B1 NARRATION — PPT 讲解
       B1.1 PPT 导入（PPTX 文件或页图）
       B1.2 blueprint 编辑（教学意图）
       B1.3 rule 编辑（交互规则）
       B1.4 互动设计（纯讲述 SCO 的关联互动，由 KGP 内容层面定义）
   B2 VIDEO — 案例视频
       B2.1 视频上传（MP4）
       B2.2 封面 + 元数据
       B2.3 紧接 PPT SCO 的总结承担
   B3 QUIZ — 互动测验
       B3.1 题型（问答 / 选择 / 判断 / 连线）
       B3.2 题干 + 选项 + 答案
       B3.3 辅助图片 / 表格（支持点击放大）
       B3.4 苏格拉底式追问配置（最多 5 轮）
       B3.5 答题反馈 / 解析
   B4 QA — 小解答
       B4.1 答疑范围配置（Activity 内）
   B5 FEEDBACK_COLLECT — 课前采集
       B5.1 采集题模板
       B5.2 拒绝分享处理策略
       B5.3 memory_id 生成规则
   B6 FEEDBACK_REVIEW — 课后复盘
       B6.1 复盘题模板
       B6.2 memory_id 关联规则
   B7 ASSESSMENT_TAG — 后台打标
       B7.1 标签维度定义
       B7.2 置信度阈值
       B7.3 默认 Segment（降级）
       B7.4 概率模型参数（默认值由技术团队给）

C. 教学提示设计
   C1 blueprint 编辑（教学意图：该讲什么 / 不该讲 / 重点）
   C2 rule 编辑（交互规则）
   C3 referenceSlots 配置（必选 required:true / 可选 required:false）
   C4 tutorMode 开关（SCO 级，是否按标签选变体）

D. 对练剧本编辑器（内部代号 **SIDE**，自研子系统）
   D1 characterProfile（心理画像：显性目标 / 隐性目标 / 触发点 / 软化点 / 底线）
   D2 behaviorChain（递进反应链）
   D3 constraints（防剧透指令）
   D4 successCriteria（分阶段通关条件）
   D5 emotionCeiling（情绪天花板）
   D6 rubric 关联（复用 competencyGoals.rubric L1-L5）
   D7 Actor 头像（文生图 prompt 配置）
   D8 excludeReport 开关（后处理）

E. 调研剧本编辑器
   E1 BEI 追问路径（STAR 顺序与深度）
   E2 STAR 完整性检查规则
   E3 回避行为阈值（连续 N 次模糊后切换）
   E4 量表题目配置 + 计分逻辑
   E5 能力维度定义（供 BEI 评分和报告消费）
   E6 interviewType 配置（BEI / profile / confusion / highlight）

F. Segment 多版本管理
   F1 separateTag 学员类型标签定义（如"简洁型"/"详细型"/"销售行业"/"建筑行业"）
   F2 groupKey 版本槽位（同节点多变体编组）
   F3 tutorMode SCO 级开关
   F4 判定规则设计（在 groupKey 前的评估步骤）

G. 工具卡片库
   G1 预制工具卡片编辑（PDF 模板）
   G2 解锁条件配置（完成哪个 SCO 后解锁）
   G3 下载格式（PDF 为主）
   G4 分享配置（本期预留）

H. 预览与调试
   H1 SCO 级预览（单个 SCO 模拟跑）
   H2 Activity 级试跑（完整 Activity 流程）
   H3 Course 级整体走查
   H4 ★调用 Simulation（09-B）跑完整学员旅程验证

I. 导出与交付
   I1 导出内容包（标准格式，交付给 ContentMgt）
   I2 增量 / 全量包
   I3 changelog 生成
   I4 版本号管理

J. 内容质量保障
   J1 字段完整性校验（本地版，与 ContentMgt B 校验协同）
   J2 引用一致性检查（referenceSlots / memory_id / groupKey）
   J3 AOM 格式合规性
   J4 与 Simulation 的闭环（问题 → 改剧本 → 再跑）
   J5 KGP 内部 Review 流程（发布前同行评审）

K. 能力维度与 rubric 管理
   K1 维度字典（全局复用）
   K2 rubric 模板（L1-L5 等级定义）
   K3 维度跨 Course 对齐（相同维度 ID 保证跨 Course 可聚合）

L. ★Neo Persona 定义（跨 4 场域共享）[补漏]
   L1 Neo 统一人格（tone / style / 语气 / 风格基线）
   L2 Neo 知识边界（Activity 内 + 已完成 Activity + 学员画像，不含未解锁内容）
   L3 Neo 场域差异化行为（Lecture 结构化演绎 / Practice 答疑辅导 / Inquiry 访谈采集 / Report 解读引导）
   L4 Neo 与 Leo 的边界（Neo 不提 Leo，知识范围限 Activity）
   L5 Persona 版本管理（人格更新流程 + 灰度发布）
   L6 未来人格包生产（V2+，不同主题不同 Neo 人格）

M. 未来扩展（占位）
   M1 PPT 自动生成（V2+）
   M2 动态内容生成（V2+）
   M3 外部 KGP 协同生产
   M4 Leo 人格包生产（V2+，不同主题不同 Leo 人格）
```

---

## 跨模块依赖

| 对象模块 | 依赖关系 |
|---------|---------|
| ContentMgt (08) | **下游** — I 导出 → ContentMgt F 导入接收 |
| Simulation (09-B) | H4 调用 Simulation 做内容验证 |
| Lecture (02) | B / C 决定授课内容与教学提示 |
| Practice (03) | D 决定对练剧本 |
| Inquiry (04) | E 决定调研剧本 |
| Report (05) | K 能力维度决定报告能力维度呈现 |
| Evaluation (9-A) | B7 打标参数 + K rubric 直接影响评分 |

---

## 与 v0.3.3 差异

- 0.3.3 **完全没有** KGP 功能树（仅提到"KGP 生产不是软件端口"）
- v0.4.0 虽然仍不是学员端 / 管理端，但 KGP 确实有**自己的生产工具链**需要设计和落实
- 本功能树不代表"KGP 模块必须作为产品的一部分发布"，而是明确内容生产侧的工具能力边界

---

## 待确认

| # | 问题 | 建议 |
|---|------|------|
| 1 | KGP 工作台是独立应用，还是集成到管理端？ | 建议独立应用，避免管理端权限和使用场景混淆 |
| 2 | 多人协作（A3）本期是否必做？ | 建议本期做基础版（文件锁 + 提示）；分支合并 V2 |
| 3 | B1.1 PPT 导入是直接 PPTX 还是先转图片？ | 建议先支持图片（更可控），PPTX 自动转换预留 |
| 4 | 剧本字段（D / E 各字段）在 AOM 里的具体 schema 何时定？ | 需与 Practice / Inquiry Owner 尽快对齐，是 ContentMgt B 校验的前置 |
| 5 | KGP 发布前必经 Simulation 跑通是强制还是推荐？ | 建议对"新课包"强制（J4 闭环），修订版推荐 |
| 6 | 本期是否做 G4 工具卡片分享功能？ | 建议本期不做，V2 |
| 7 | ⚠️ SIDE（D 节自研对练剧本系统）目前稳定性较差，需要工程侧讨论加固方案 | 建议定义：异常重试策略 / 本地缓存兜底 / 故障时降级只读 / 监控告警接入 |
```
