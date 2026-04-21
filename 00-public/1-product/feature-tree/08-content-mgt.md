# 功能树 08：ContentMgt（内容管理）

**Owner：** 张青
**日期：** 2026-04-21
**版本：** v0.4.0 对齐版（L1+L2）
**对应 Spec：** `spec/design/management/03-project-config.md`（内容包校验部分）+ `requirements-v0.4.0.md §5 AOM 五层`

---

## 一句话定位

运行时 AOM 内容包的导入、版本、校验、绑定、切换。消费 KGP 产出，供学员端场域与 Operation 查询。

---

## 功能结构

```
A. 内容包生命周期
   A1 导入（接收 KGP 产出包）
   A2 解析（Project / Course / Activity / SCO / Segment 五层结构）
   A3 版本管理（同一课包多版本并存）
   A4 发布 / 回滚
   A5 下线（软删除 + 影响范围评估）

B. 完整性校验
   B1 SCO 是否齐全（scoFlow 完整性）
   B2 引用是否有效
       B2.1 referenceSlots 引用（课前 memory_id 关联）
       B2.2 groupKey 多版本关联
       B2.3 Activity 内部引用闭环
   B3 Segment 配置一致性（separateTag / groupKey / tutorMode）
   B4 对练剧本必填字段校验（characterProfile / behaviorChain / constraints / successCriteria / emotionCeiling / rubric）
   B5 调研剧本必填字段校验（BEI 追问路径 / 量表题目 / 计分逻辑 / 能力维度）
   B6 校验报告（缺失项 / 警告项 / 通过项，分级）

C. 项目绑定
   C1 课包绑定到 Project（Operation F1 调用）
   C2 Project 生命周期内内容一致性保证（绑定后不允许破坏性变更）
   C3 课包切换 / 升级（影响范围评估 + 历史数据兼容性）

D. 运行时内容切换
   D1 Segment 版本切换（消费 Evaluation 打标结果）
   D2 多版本并存（A/B 或场景适配）
   D3 缓存与预加载（Activity 切换时预取下一个）
   D4 内容热更新（小修复不需重启）

E. 内容包查询 API（供运行时消费）
   E1 按 Project / Course / Activity 查询结构
   E2 按 SCO ID 查询具体内容（NARRATION / VIDEO / QUIZ 等）
   E3 按剧本 ID 查询（Practice / Inquiry）
   E4 工具卡片库查询（Hall E4 工具库 + Lecture J 工具产出）
   E5 能力维度 / rubric 查询（Evaluation / Report 消费）

F. 与 KGP 对接协议
   F1 导入格式规范（KGP 导出的内容包标准格式）
   F2 增量更新（只导入变更部分）
   F3 全量导入（完整替换）
   F4 元数据交换（作者 / 版本 / changelog / 校验码）

G. 内容权限与访问控制
   G1 课包可见性（不同项目可绑定不同课包）
   G2 版本可见性（草稿版 / 发布版 / 下线版）
   G3 运营修改权限（本期运营只做绑定，不改内容）

H. 未来扩展（占位）
   H1 企业知识库接入
   H2 内容包市场
   H3 第三方 KGP 协同生产
```

---

## 跨模块依赖

| 对象模块 | 依赖关系 |
|---------|---------|
| KGP (10) | **上游** — F 对接协议接收 KGP 产出 |
| Lecture (02) | E1 / E2 结构与 SCO 内容查询 / E4 工具卡片 |
| Practice (03) | E3 对练剧本查询 |
| Inquiry (04) | E3 调研剧本查询 |
| Report (05) | E5 能力维度 / rubric 查询 |
| Operation (06) | C1 课包绑定 GUI / F6 内容校验入口调用 B |
| Evaluation (09-A) | D1 打标结果 → 版本切换 / E5 rubric |
| Simulation (09-B) | 黑盒使用，通过 UI 间接消费（不直接 API 调用） |

---

## 与 v0.3.3 差异

- v0.3.3 无独立 ContentMgt 功能树（内容校验散在运营端 G3 一小节）
- v0.4.0 把内容管理提升为独立模块，原因：内容包生命周期 + 多版本 + 运行时切换 + KGP 对接 的总和工作量和架构重要性已经超过"运营端的一个 Tab"

---

## 待确认

| # | 问题 | 建议 |
|---|------|------|
| 1 | KGP 导出格式规范（F1）是否已定义？ | 需 KGP + ContentMgt + Lecture / Practice / Inquiry Owner 协同定 schema |
| 2 | 增量更新（F2）本期是否要做？ | 建议 v1 只做全量，v2 考虑增量 |
| 3 | 内容包版本 vs Project 绑定的关系：绑定时锁定版本 vs 自动跟随最新？ | 建议绑定时锁定版本，升级需显式操作 |
| 4 | 软删除（A5）对历史学员数据的影响？ | 需定义：历史数据保留 / 只读 / 报告仍可生成 |
| 5 | 运营端配置页的"内容包校验入口"（Operation F6）具体跳转到 ContentMgt 哪个 UI？ | 建议独立管理界面，与 Operation 配置页打通 |
