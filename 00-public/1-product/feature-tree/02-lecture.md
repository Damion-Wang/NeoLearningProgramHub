# 功能树 02：Lecture（授课场域）

**Owner：** 银江、张青、李灿、周毅、冲哥
**日期：** 2026-04-21
**版本：** v0.4.0 对齐版（L1+L2）
**对应 Spec：** `spec/design/learner/02-lecture-classroom.md`

---

## 一句话定位

Neo（Tutor）按 AOM 脚本执行结构化教学——PPT / 视频 / Quiz / 闭环反馈，全程可互动，Neo 不照念 PPT。

---

## 功能结构

```
A. Neo（Tutor）角色
   A1 Neo 身份（Activity 内 + 已完成 Activity + 学员画像）
   A2 结构化教学（按 AOM 脚本演绎）
   A3 即时教学反馈（5 种教学信号 ①缺概念 ②遗忘 ③误用 ④选错工具 ⑥错误心智模型）
   A4 InsightCaptureSkill 轻量版（高光瞬间推荐卡片，P1，产出写入 Hall F4）

B. SCO 调度引擎
   B1 顺序推进（按 scoFlow）
   B2 后台 SCO 自动执行（ASSESSMENT_TAG 学员无感）
   B3 条件跳转（打标完成后按结果匹配 Segment，消费 Evaluation）
   B4 ★SCO 锁定机制（未播放 = 🔒，只能回顾已学）
   B5 ★防挂机（每 5 分钟提醒 / 暂停）
   B6 ★AI 双轨运行约束 [req §7.6，与 Evaluation A8 对称]
       B6.1 前台教学主线不被后台打标 / 采集阻塞（打标慢则降级使用默认 Segment）
       B6.2 采集失败对学员无感（错误缓存重试，不弹错误提示）
       B6.3 打标结果异步回写（不阻塞下一个 SCO 进入）

C. SCO 类型与看板呈现
   C1 NARRATION（PPT 图片 / HTML 渲染）
   C2 VIDEO（播放器 + 暂停 / 拖动 / 倍速 / 进度记录 / 完成判定）
   C3 QUIZ（题干 + 答题区；选择 / 填空 / 判断看板作答，问答通过对话区）
   C4 QA（独立 SCO 位置的结构化答疑）
   C5 FEEDBACK_COLLECT（Quiz 形式场景采集，双层存储 + memory_id）[ADR-009]
   C6 FEEDBACK_REVIEW（Quiz 形式复盘，memory_id 调取课前）
   C7 ASSESSMENT_TAG（后台打标，引擎在 Evaluation）[ADR-008]

D. 两种口播
   D1 授课口播（Neo 主动讲解，支持暂停）
   D2 答疑口播（学员插嘴触发，知识范围含已完成 Activity）
   D3 口播切换（插嘴暂停 → 回答 → 恢复）

E. AI 自主演绎（不照念 PPT）
   E1 基于 blueprint + rule（方向控制：该讲什么 / 不该讲 / 重点）
   E2 个性化讲解（学员画像 + 进度）
   E3 纯讲述-互动平衡（KGP 脚本设计）
   E4 ★AI 自主出题（放答疑不新增 SCO，由内容逻辑触发不绑时间）
   E5 引用槽机制 referenceSlots（必选 / 可选）

F. 自适应接入（消费 Evaluation）
   F1 L1 自适应（每次交互微调：语言 / 深度 / 举例）
   F2 L2 版本切换（消费打标结果，标签匹配 Segment）
   F3 多版本内容（separateTag / groupKey / tutorMode）
   F4 透明切换（自然过渡语，学员无感）
   F5 低置信度降级（<0.6 用默认版本）

G. 执行期叠加
   G1 插嘴提问（Activity 范围答疑，不剧透不跑题）
   G2 主动回顾（请求重讲 → 回到当前位置）

H. 左侧目录区
   H1 Tab1 SCO 缩略图（已学可回看，未播放 🔒）
   H2 Tab2 Activity 列表（弹窗确认跳转）

I. 信号采集
   I1 被动信号（停留 / 离开 / 回翻 / 点击工具）
   I2 对话记录（半结构化）
   I3 Quiz 答题过程
   → 产出写入统一 Database，供 Evaluation 消费

J. 工具卡片产出
   J1 预制工具卡片（KGP 预设）
   J2 AI 动态生成（情境判断）
   J3 同步到 Hall E4 工具库（触发解锁）

K. 断点续播 + 重新学习
   K1 位置恢复 + 弹窗确认
   K2 后台 SCO 自动跳过
   K3 上下文恢复（含 FEEDBACK_COLLECT）
   K4 重新学习（原始数据存档，不覆盖）
```

---

## 跨模块依赖

| 对象模块 | 依赖关系 |
|---------|---------|
| Evaluation (09-A) | F 自适应 + C7 打标引擎 + I 信号采集数据流 |
| ContentMgt (08) | AOM 内容包（SCO / 讲解 blueprint / referenceSlots 配置） |
| KGP (10) | E3 互动设计、E5 referenceSlots 源头、J1 工具卡片预制 |
| Infra (07) | 布局 + TTS + 断点恢复 + 模型路由 |
| Hall (01) | J3 工具卡片 → 工具库 / A4 推荐卡片 → 笔记库 |

---

## 与 v0.3.3 差异

- ★ 新增 B4 SCO 锁定 + B5 防挂机（v0.4.0 核心新增）
- ★ 新增 E4 AI 自主出题放答疑（0.3.3 原计划"每 5 分钟一次"被否，改为内容逻辑驱动）
- 0.3.3 A1.2.4 待确认（KGP 未设计互动时 fallback）→ v0.4.0 已明确：由 AI 自主
- 场域内 AI 正式命名为 Neo（0.3.3 无统一命名）

---

## 待确认

| # | 问题 | 建议 |
|---|------|------|
| 1 | SCO 锁定"已学完"判据：播放过 vs 完成所有交互？ | 建议后者，避免挂机 / 快速点过造成"假完成"后可回看 |
| 2 | 授课场景下看板↔对话联动联动什么？（PPT 无数据点） | 需补：Quiz 题干 → Neo 提示、AI 讲解提到工具卡片 → 看板高亮 |
| 3 | FEEDBACK_REVIEW 时课前数据为空的降级行为 | 需产品定义：跳过 / 泛化提问 / 使用备用题干 |
| 4 | 打标 SCO 与 FEEDBACK_COLLECT 的信号输入关系 | 需 Evaluation 模块协同定义 |
| 5 | 防挂机 5 分钟判据：无任何交互 vs 无对话输入？ | 需考虑纯讲述 SCO 学员合理静默的情况 |
