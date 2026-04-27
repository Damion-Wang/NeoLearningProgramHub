# 功能树 07：Infra（平台底座）

**Owner：** 显华、葛演、李灿
**日期：** 2026-04-21
**版本：** v0.4.0 对齐版（L1+L2）
**对应 Spec：** `spec/design/common/00-overview.md` + `01-general.md` + `02-notification.md` + `requirements-v0.4.0.md §4`

---

## 一句话定位

平台底座 — 一切跨模块共享的基础能力。登录、权限、通用栏、TTS、模型、用量、布局、联动协议、断点、统一数据库。未来持续扩展。

---

## 功能结构

```
A. 登录与会话
   A1 登录（账号密码 / SSO）
   A2 首次登录引导基础设施（跳 Neo 自我介绍，LUI 优先不 overlay）
   A3 会话保持（session 有效期 7 天 + 允许多设备同时登录）
   A4 退出登录（清除当前设备 session）
   A5 忘记密码（本期联系运营重置，不做自助）

B. 人员与账号
   B1 账号 CRUD（创建 / 查询 / 编辑 / 停用）
   B2 个人信息（查看 / 编辑）
   B3 密码修改
   B4 批量账号创建 API（供 Operation F2 调用）
   B5 ★账号创建后通知链 [补漏]
       B5.1 创建成功自动触发通知（Email 必做 / 企微钉钉可选，经 Operation E4 多渠道）
       B5.2 通知模板管理（欢迎文案 + 登录链接 + 首次使用引导）
       B5.3 发送失败重试（指数退避，最多 3 次，失败后运营可手动重发）
       B5.4 发送状态回执（在 Operation F2 导入预览页可见每条发送结果）
       B5.5 首次登录链接时效（建议 7 天过期，过期可由运营重新触发）

C. 角色权限
   C1 角色矩阵（学员 / 管理员）
   C2 权限校验（可访问 / 可操作 / 数据隔离）
   C3 端口切换（Topbar 头像下拉子菜单，当前端口高亮）
   C4 管理员体验学员端数据隔离（账号在学员名单时按学员身份学习；不在时体验数据不入统计）
   C5 API 级隔离（学员端不返回排名字段等）

D. Topbar（顶部通用栏）
   D1 Logo（左侧，可被 Operation F5 平台个性化替换）
   D2 端口标识（"学员端" / "管理端"）
   D3 铃铛🔔入口（未读红点 + 下拉消息面板 + 全部已读）
   D4 头像👤菜单
       D4.1 账号管理（弹窗）
       D4.2 个人设置（弹窗，见 F）
       D4.3 帮助（新窗口，文档）
       D4.4 端口切换（子下拉）
       D4.5 退出登录（弹窗确认）
   D5 三端完全一致（差异仅在端口切换可选项和消息内容）

E. 消息提醒
   E1 三类消息（平台 / 系统催学 / 运营群发或定点）
   E2 未读红点 + 全部已读
   E3 下拉消息面板（列表 + 点击跳转）
   E4 本期只读不支持回复
   E5 消息跳转协议（点击消息 → 跳对应页面）

F. 个人设置（Topbar → 头像 → 个人设置）
   F1 AI 语速三挡（舒适 1.0x / 标准 1.2x / 明快 1.4x）
       F1.1 全局默认
       F1.2 场域局部覆盖（场域设置优先全局）
       F1.3 ★场域内语速调整 UI [补漏]
           - 位置：各场域右栏对话框顶部，齿轮图标 → 弹出小浮层
           - 交互：三挡按钮 + 当前生效档位高亮
           - 生效：即时生效（下一句 TTS 应用新速度，无需刷新）
           - 作用域：仅当前场域本次会话，退出场域后不保留（下次入场域默认读 F1.1 全局值）
   F2 页面风格（本期尽量上线）
   F3 语种 / 个人偏好（待上线，本期预留）
   F4 Token 消耗查看入口（学员个人口径）

G. 帮助 + 反馈
   G1 产品使用手册（新窗口，文档形式）
   G2 反馈入口（本期空，占位）

H. 生成式引擎（语音 + 图像 + 数字人）
   【TTS 语音合成】
   H1 TTS — Neo（大厅模式）语音输出（大厅 Coach 能力）
   H2 TTS — Neo（场域模式）语音输出（授课 / 对练 / 调研 / 报告 Tutor 能力）
   H3 TTS — Actor 语音输出（对练，不同剧本不同音色）
   H4 TTS 语速参数接入 F1（全局 + 场域覆盖）
   H5 TTS 音色配置（Operation F5 平台个性化配置默认音色）
   H5a ★TTS 引擎与语言路由
       - 国内中文：字节音色库（byte）
       - 海外：ByteDance Plus（byteplus）/ Google TTS
       - 按语言 zh / en / ja 路由
   【STT 语音识别】
   H6 ★STT — 学员语音输入转文字（Quiz 问答 / 对练对话 / 调研访谈 / 大厅 Neo 对话）
   H7 STT 识别质量降级（识别失败时提示重录，不强制打字）
   H8 STT 引擎选型（本期待定：Web Speech API / 讯飞 / 自建；纳入 I 模型管理场景路由）
   【文生图】
   H9 ★文生图 — 用途：Actor 头像（Practice F1）/ 未来报告配图
   H10 ★文生图引擎
       - 国内：Doubao-Seedream-5.0
       - 海外：Gemini
   【数字人形象】
   H11 ★数字人形象 — ProsonaAgent（内部服务，海波团队维护）
   H12 ★数字人服务接入 — `digital_human_server.py` 发音人接口对接

I. 模型管理
   I1 ★LLM 统一网关 — 全部经**云学堂多模型网关** `ymcas-d.yxt.com/multi-model/v1`
   I2 模型切换 / 参数配置
   I3 按场景路由（Neo 大厅模式 / Neo 场域模式（Lecture/Practice/Inquiry/Report）/ Actor / 导演 / 管理端 Agent / 打标 / 报告生成）
       - 配置位：`model.routing.aliases`
       - 不直接绑定具体模型 ID，用 alias 解耦
   I4 ★降级与故障保护
       - 配置位：`model_groups.default_group`
       - primary + fallback 模型组
       - 5 分钟故障保护窗口（primary 失败后自动切 fallback，5 分钟内不重试 primary）
   I5 ★轻量级 AI 调用（非独立角色）[spec §4.3]
       - 催学消息润色（如将"你已 3 天未学"润色成价值导向话术，见 07.E）
       - 其他短链 LLM 调用（文案润色、summarize 等）
       - 走同一网关但不占独立 AI 身份 / 不进记忆 Database

J. 用量统计
   J1 Token 消耗采集 — ★**以云学堂多模型网关 usage metrics 为准**（不从本地 prompt/response 推算），按用户 / 按场景 / 按时间聚合
   J2 学员端口径（F4 个人设置展示）
   J3 管理端口径（Operation C4 数据展示 Tab 聚合）
   J4 成本核算输出（财务 / 运营侧）

K. 三栏布局框架（三端统一）[ADR-007]
   K1 三栏结构定义（目录区 / 看板区 / 对话区）
   K2 场景默认比例（11 个场景：大厅 / 授课 PPT / 授课视频 / 授课 Quiz / 对练导入 / 对练演绎 / 对练复盘 / 调研对话 / 调研量表 / 报告 / 管理端）
   K3 折叠 / 宽度调整（目录可折叠不可拖拽 / 对话区可拖拽）
   K4 响应式保护（≥1024px，否则阻断"请用电脑访问"）
   K5 骨架屏 + 0.3s 过渡动画（切换不白屏不闪烁）
   K6 ★左右双栏对话例外支持（对练演绎期）
   K7 两栏 + 可折叠导航例外（报告场域 / 调研场域）
   K8 ★Activity 导航规范 [补漏]
       K8.1 统一数据源（均来自 ContentMgt E1 查询接口）
       K8.2 呈现场景
           - Hall E2：S 型曲线 + hover 出 Activity 列表（选课场景）
           - Lecture H2：Tab2 Activity 列表（场域内跳转）
           - Practice / Inquiry / Report：左栏 Project 目录（场域内切换）
       K8.3 交互统一点（点击已解锁 Activity → 弹窗确认 → 跳转 / 点击锁定 Activity → 提示解锁条件）
       K8.4 状态标识统一（✅已完成 ▶进行中 🔒未解锁）

L. 看板↔对话联动协议 [ADR-010]
   L1 看板→对话（点击数据元素触发 Agent 自动解读）
   L2 对话→看板（Agent 消息带结构化 metadata → 看板高亮 / 跳转）
   L3 结构化标记格式 `[REF:chart=xx,dim=yy,...]`（前端解析后高亮，不暴露学员）
   L4 碎片反向索引（图表数据点关联碎片 ID 列表）

M. 断点恢复
   M1 位置实时记录（大厅 / 场域 / SCO / 对练轮次 / 调研进度）
   M2 按上次位置恢复（大厅直接进 / 场域弹窗确认 / 对练带导演状态）
   M3 恢复提示规范（上次位置 + 离开时间 + "继续" / "重新学习"选项）

N. 统一 Database（记忆工程管道）[ADR-005]
   N1 半结构化记录（含 passive_signals 字段）
   N2 三端按权限读取
   N3 memory_id 全局关联（FEEDBACK_COLLECT ↔ FEEDBACK_REVIEW 等）
   N4 跨模块数据 schema 治理
   N5 三级记忆管道（课堂采集 → 大厅引用 → 管理端汇聚）
   N6 ★推荐卡片流向管道 [补漏]
       N6.1 产生方（Lecture A4 Neo 场域高光捕捉 / Hall B2 Neo 大厅经验洞察捕捉）
       N6.2 持久化（写入统一 Database，schema 含 source / trigger / summary / evidence_ref）
       N6.3 展示方（Hall F4 Neo 场域推荐卡片 / Hall F5 Neo 大厅推荐卡片）
       N6.4 收藏动作（学员点击收藏 → 卡片状态变更 → Hall F6 笔记库可见）
       N6.5 流向约束（不直写前端，必经 DB 中转，确保学员在不同端 / 会话可见一致）

O. 未来扩展（占位）
   O1 企业 SSO 深度集成
   O2 多语言 / 国际化
   O3 移动端
   O4 灾备 / 高可用

P. ★外部平台对接（集成清单）[补漏]
   P1 云学堂多模型网关 — `ymcas-d.yxt.com/multi-model/v1`
       - 用途：所有 LLM 调用（见 I）
       - 接入形式：HTTP + alias 路由 + 故障保护组
   P2 ProsonaAgent 数字人服务 — 海波团队
       - 用途：Actor 形象、未来可扩展 Neo 可视化（含大厅模式与场域模式）
       - 接入形式：`digital_human_server.py` 发音人接口（见 H11/H12）
   P3 TTS 供应商矩阵
       - 字节音色库（byte，国内）
       - ByteDance Plus（byteplus，海外）
       - Google TTS（海外）
       - 按 zh/en/ja 路由（见 H5a）
   P4 文生图供应商
       - Doubao-Seedream-5.0（国内）
       - Gemini（海外）（见 H10）
   P5 SMTP / 企微 OpenAPI / 钉钉开放平台 — 通知渠道（见 B5 + Operation E4）

> **说明**：SIDE（对练剧本系统）属于**自研内部系统**，不列入 P 节外部对接。其功能归属见 10-KGP D 对练剧本编辑器。当前稳定性问题作为 KGP 工程关注项追踪。
```

---

## 跨模块依赖

**被几乎所有模块消费。** 重点接口：

| 消费方 | 接口 |
|-------|-----|
| 所有模块 | A 登录 / C 权限 / K 布局 / L 联动协议 / N Database |
| Hall / 所有场域 | H TTS / M 断点恢复 |
| Hall, Lecture, Practice, Inquiry, Report 的 AI 角色（统一为 Neo，分大厅/场域两套技能） | I 模型路由 |
| Operation | B4 批量账号创建 / C 角色授权 / D Topbar / E 消息系统 |
| Report / Operation | L 图表联动协议跨端复用 |
| Evaluation | N 统一 Database / J 用量底层数据 |
| Operation F5 | D1 Logo 替换接口 / H5 音色配置接口 |

---

## 与 v0.3.3 差异

- ★ **B/C/D/E/F/H/I/J 全部为 v0.4.0 新增或明确**：0.3.3 仅有 01-layout-auth 布局 + 账户权限，Topbar / TTS / 模型 / 用量 / 通知 / 设置全部缺失
- ★ K6 左右双栏对话例外为对练演绎期新增
- ★ K7 两栏 + 可折叠导航为报告 / 调研场域新增
- L 联动协议从原 01-layout-auth A3 提升为独立章节，覆盖 [REF:...] 结构化标记

---

## 待确认

| # | 问题 | 建议 |
|---|------|------|
| 1 | Topbar 铃铛 vs 管理端消息页职责划分（Q2 跨模块） | 铃铛 = 我收到的 / 消息页 = 运营下发能力 |
| 2 | K2 11 个场景默认比例是否需要根据 v0.4.0 新命名重新核对？ | 需与 Hall / Lecture / Practice / Inquiry / Report Owner 核对 |
| 3 | I 模型路由是否支持按客户定制不同供应商？ | 架构预留 yes，本期实现可简化 |
| 3b | STT 引擎选型（H8）及成本纳入用量统计的方案？ | 需与业务方确认识别精度要求，三方服务成本应纳入 J 用量 |
| 4 | N4 跨模块数据 schema 由谁定义？ | 建议 Evaluation + Infra 共同制定，Evaluation 主导碎片 schema |
| 5 | 平台个性化配置到底在 Infra 还是 Operation？ | 配置入口在 Operation F5；生效引擎（Logo 替换 / 音色路由）在 Infra D1 / H5 |
| 6 | 数字人 ProsonaAgent（P2）在本期 Actor 头像场景是否必选？还是文生图静态头像兜底？ | 建议：本期静态头像兜底（见 Practice F1），ProsonaAgent P1 增强 |
