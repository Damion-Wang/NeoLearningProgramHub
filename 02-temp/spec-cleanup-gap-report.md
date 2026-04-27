# 废老 spec 清理 · gap 报告

**日期**：2026-04-26
**对比对象**：`rawIdea.md`（219 行）+ `requirements-v0.3.3.md`（2587 行）vs `design/` v0.4.0 + 反向补充
**结论先行**：rawIdea 几乎全部已被覆盖，可直接删除（或归档）；v0.3.3 大部分已被覆盖，但有 **6 处真正缺失** 值得迁移到 design/。

---

## 1. rawIdea.md 中 design/ 没包含的内容

### gap 1（低价值）：白板图四角色泳道（KGP/运营/HR/学员）的"开营前-开营-学习期-结项"职责矩阵
- 位置：rawIdea.md 第 191-204 行
- 内容摘录：4 泳道 × 4 阶段表，明确 KGP 在开营前完成全部 SCO/对练脚本/测评框架
- 价值评估：**低**——v0.4.0 §3.1 已用更精炼的"全流程概述"图覆盖，且 HR/运营已合并为管理员，4 角色泳道已过时
- 建议：删除即可

### gap 2（低价值）：白板图"非本期迭代方向"6 维度
- 位置：rawIdea.md 第 209-217 行（自适应高级/模块质量/内容覆盖/增加模块类型/感知/定制）
- 价值评估：**低**——已被 design/`00-future-iterations.md` 完全覆盖且更细
- 建议：删除即可

### 总结：rawIdea.md 没有 design/ 缺失内容
rawIdea 是早期白板图记录，v0.4.0 已全部继承并升级。建议**整体删除**或归档到 `00-public/4-decisions/历史/` 作为历史溯源。

---

## 2. requirements-v0.3.3.md 中 design/ 没包含的内容

### gap 3（高价值）：8 个 Course 完整清单含课程主题/方法论
- 位置：v0.3.3 第 169-188 行（§3.4）
- 内容摘录：8 门课的完整表格——维度/核心任务/Course 名称/是否个性化学习/典型挑战场景/课程主题（明茨伯格/PIN法/BIC/OGSM/RACI/PREP/PLAN/5Why 等具体方法论）。其中"横向协作（4/30）是 MVP 第一个交付的 Course"
- 价值评估：**高**——v0.4.0 仅说"基层管理者 8 个 Course"，design/ 中只有 `6-content/aom-samples/横向协作-*.json` 实例，但 **没有 8 门课的总览/方法论清单**。开发对接时这是必备索引
- 建议迁移到：`design/requirements-v0.4.0.md` §3.3 项目规模下方新增"8 Course 清单"小节，或作为 `design/00-course-catalog.md` 单独文件

### gap 4（高价值）：ASSESSMENT_TAG SCO 的 5 个存储字段定义
- 位置：v0.3.3 第 1010-1019 行（§10.6）
- 内容摘录：`tag_dimension` / `assigned_tag` / `confidence`(0-1) / `evidence_summary` / `effective_until` 五字段的定义和示例，以及完整 tagConfig AOM JSON 模板（`scoType: ASSESSMENT_TAG` + `tagConfig {tagDimension, possibleTags, dataSourceRange, fallbackStrategy}`）
- 价值评估：**高**——v0.4.0 仅在 §6 提了 SCO 类型名，design/ 中**完全没有打标 SCO 的存储字段和 AOM 配置 schema**。开发对接 AOM 解析器时需要这个 schema
- 建议迁移到：`design/learner/[已审阅]02-lecture-zone.md`（打标 SCO 章节）或新建 `design/aom-schema.md`

### gap 5（高价值）：低置信度降级阈值 0.6
- 位置：v0.3.3 第 1027-1028 行、第 2061 行
- 内容摘录："置信度低于 0.6 时，降级为默认 Segment 版本，不硬猜"
- 价值评估：**高**——design/ 中**完全找不到 0.6 这个阈值**，但这是 L2 自适应的关键工程参数
- 建议迁移到：`design/learner/[已审阅]02-lecture-zone.md` 打标 SCO 章节，或 v0.4.0 §8.3 自适应体系

### gap 6（中价值）：FEEDBACK_COLLECT 课前采集双层存储完整 schema
- 位置：v0.3.3 第 1929-1949 行（§17.4a）
- 内容摘录：完整 JSON 模板含 `memory_id` / `student_id` / `activity_id` / `sco_id` / `collect_timestamp` / `structured_tags{topic_dimension, scenario_type, scenario_keywords, emotional_state, specific_challenge}` / `raw_dialogue[]`
- 价值评估：**中**——design/`02-lecture-zone.md` 只提到 "structured_tags + raw_dialogue 双层格式"和"分配 memory_id"，**没列出 structured_tags 的具体字段**。开发实现 FEEDBACK_COLLECT 落库时需要这个 schema
- 建议迁移到：`design/learner/[已审阅]02-lecture-zone.md` FEEDBACK_COLLECT 章节增补 schema 表

### gap 7（中价值）：半结构化记录 passive_signals 字段定义
- 位置：v0.3.3 第 1895-1921 行（§17.4）
- 内容摘录：完整记录 JSON schema 含 `interaction_type` 枚举值 / `capability_tags` / `behavior_observations` / `passive_signals{dwell_time_seconds, left_midway, scrolled_back, clicked_tool_cards}`
- 价值评估：**中**——design/ 中"被动信号"只是名词出现（Lecture/Report/Operation 各一处），**没有具体字段定义**。报告权重排序"Quiz > 对练 > 调研 > 辅导 > 被动信号"已在 Report 中体现，但字段 schema 缺失
- 建议迁移到：v0.4.0 §8.2 记忆工程章节，或新建 `design/data-schema.md`

### gap 8（中价值）：催学渠道优先级（V1 必做 vs 可选）+ 漏斗追踪
- 位置：v0.3.3 第 620-624 行、第 1650-1654 行
- 内容摘录：
  - V1 必做：产品内消息（辅导对话顶部）+ Email
  - V1 可选：企业微信/钉钉（需企业 IT 预先完成 OAuth 授权）
  - 效果追踪："发送 → 查看 → 登录 → 完成活动"完整漏斗
- 价值评估：**中**——design/`management/03-project-config.md` 提到 Email 发送登录通知，但**催学渠道优先级、企业微信/钉钉 OAuth 路径、漏斗 4 阶段追踪指标在 design/ 中没有明确**。0421 重构决策已确认催学规则放 config，但渠道清单仍缺
- 建议迁移到：`design/management/[已审阅]03-project-config.md` 催学规则章节 + `design/common/[已审阅]02-notification.md`

### gap 9（低-中价值）：BEI 追问策略具体方法（STAR 完整性 + 3 轮上限）
- 位置：v0.3.3 第 1304-1311 行（§12.5）
- 内容摘录：BEI 5 步追问——开放式提问→STAR 完整性检查→针对性追问缺失元素→回避识别→同一案例最多 3 轮
- 价值评估：**低-中**——调研场域为 P3，design/`04-inquiry-zone.md` 已含两种测评类型（对话式+量表）。BEI 是其中一种方法的细节，本期 P3 时再做也来得及
- 建议迁移到：`design/learner/[已审阅]04-inquiry-zone.md` 作为附录"BEI 方法论"小节（可选）

### gap 10（低价值）：22.4 资源分配建议（举证 40% / 学员端 30% / 催学 20% / AI 质量 10%）
- 位置：v0.3.3 第 2297-2303 行
- 价值评估：**低**——属于团队管理决策非产品 spec，design/ 不收录是对的。但若用于开发优先级讨论可参考
- 建议：保留在 v0.3.3 历史文档中，不迁移

### 已确认覆盖（不列为 gap）
以下 v0.3.3 内容已被 design/ 完整覆盖，无需迁移：
- 三栏布局 11 场景比例 → 已被反向补充"覆盖式抽屉+全幅+右栏 Chat" 替代（架构已升级）
- 闭环反馈/打标 SCO 概念 → 已在 v0.4.0 §6 + Lecture spec 中
- 跨 Course 记忆引用规则 → 已在 v0.4.0 §8.2 + Hall spec 中
- 学员端报告匿名分位区间+成长时间线 → 已在 Report spec
- HR 进度+互动排名（不做能力排名）→ 已在 Operation spec
- 演员/导演分离 + 情绪天花板/防剧透/底线 → 已在 Practice spec
- 断点续播+重新练习+后台 SCO 跳过 → 已在 learner overview/Lecture spec
- referenceSlots 必选/可选机制 → 已在 Lecture spec

---

## 3. 总结

| 项 | 推荐处理 |
|----|---------|
| **rawIdea.md** | **直接删除**（内容已 100% 被 v0.4.0 继承），或归档到 `00-public/4-decisions/历史/` 留作早期白板图溯源 |
| **requirements-v0.3.3.md** | **删除前迁移 8 项 gap，然后删除**。建议保留一份在 `00-public/4-decisions/历史/` 留作 Round-02 辩论结论的原始出处 |
| **必须迁移项数量** | **3 项**（gap 3 课程清单 / gap 4 ASSESSMENT_TAG schema / gap 5 置信度阈值 0.6） |
| **可选迁移项数量** | **5 项**（gap 6 FEEDBACK_COLLECT schema / gap 7 passive_signals 字段 / gap 8 催学渠道+漏斗 / gap 9 BEI 方法论 / gap 10 资源分配） |

### 迁移落点速查
| Gap | 优先级 | 迁移目的地 |
|-----|--------|-----------|
| 3 课程清单 | 必须 | `design/requirements-v0.4.0.md` §3.3 下增补 / 或 `design/00-course-catalog.md` 新文件 |
| 4 ASSESSMENT_TAG schema | 必须 | `design/learner/[已审阅]02-lecture-zone.md` 打标章节 |
| 5 置信度 0.6 阈值 | 必须 | `design/learner/[已审阅]02-lecture-zone.md` 打标章节 |
| 6 FEEDBACK_COLLECT schema | 可选 | `design/learner/[已审阅]02-lecture-zone.md` FEEDBACK_COLLECT 章节 |
| 7 passive_signals 字段 | 可选 | `design/requirements-v0.4.0.md` §8.2 记忆工程 |
| 8 催学渠道+漏斗 | 可选 | `design/management/[已审阅]03-project-config.md` 催学规则 |
| 9 BEI 方法论 | 可选（P3） | `design/learner/[已审阅]04-inquiry-zone.md` 附录 |
| 10 资源分配 | 不迁移 | 保留在 v0.3.3 历史文档 |

### 删除策略建议
1. **第一步**：把 gap 3/4/5 三项必须项迁移到 design/
2. **第二步**：评估 gap 6/7/8 是否迁移（建议迁移，开发对接需要 schema）
3. **第三步**：把 v0.3.3 + rawIdea 移动到 `00-public/4-decisions/历史/spec-archive/`，标记为已归档
4. **不要直接 git rm**——保留历史链路便于追溯 ADR 和 Round-02 辩论原始结论
