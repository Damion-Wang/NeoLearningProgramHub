# demo/ -- AI 老师 Demo 参考

当前已有的 Demo 实现，包括授课录屏和辅导模块原型代码。

## 授课模块录屏

| 文件 | 说明 |
|------|------|
| activity1.mp4 | 授课 Activity 1（数字人小窗 + PPT 讲解） |
| activity2.mp4 | 授课 Activity 2（3D 数字人全身 + PPT 切换） |
| activity3.mp4 | 授课 Activity 3 |
| personal-report.mp4 | 个人报告（渐进式加载 + 情感化文案） |

[screenshots/](screenshots/) 包含从以上 4 个视频中提取的 20 张关键帧。

## 辅导模块原型代码

[coaching-skills/](coaching-skills/) — JavaScript 项目，辅导模块的完整原型实现。

**架构**：4 层分层 — Persona（Coach/Lecturer 双人格）→ Skill（12个技能）→ Engine（7个引擎）→ Quality Inspection（三层质检）

**核心亮点**：
- Persona-Skill 解耦：同一 Skill 可被不同人格组合
- 贝叶斯能力追踪（Beta 分布 + 6 重抗刷分）
- BEI 引擎（STAR+DSTF 模型）
- 三层质检管线（规则→教学法→LLM 深度审查）
- 11 板块动态 System Prompt 组装

**详细分析**：[3-tech/analysis/coaching-skills-analysis.md](../../3-tech/analysis/coaching-skills-analysis.md)
