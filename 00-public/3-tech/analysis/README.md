# analysis/ -- 技术分析报告

5 份分析报告，基于现有代码库、AOM 样例和 Demo 项目。

| 文件 | 分析对象 | 核心发现 |
|------|---------|---------|
| [prosona-analysis.md](prosona-analysis.md) | Prosona Agent 源码 | 三层架构全景：授课/对练/报告已落地，辅导和测评需全新开发 |
| [aom-analysis.md](aom-analysis.md) | 横向协作授课 AOM | 五层数据结构（Project→Module→Activity→SCO→Segment），内容驱动架构的直接证据 |
| [drill-analysis.md](drill-analysis.md) | 对练 AOM + 剧本 + SIDE 代码 | 剧本深度结构化（70+字段角色画像、L1-L5评估），导演-演员分离模式 |
| [douban-analysis.md](douban-analysis.md) | 创始人豆包对话 + 架构图 | 发现个人报告、记忆工程、闭环反馈等 10 项新需求 |
| [coaching-skills-analysis.md](coaching-skills-analysis.md) | 辅导模块 Demo 项目 | **最丰富的参考**：4层架构（Persona→Skill→Engine→QI）、12个Skill、贝叶斯能力追踪、三层质检、9个可复用设计模式 |

## 阅读建议

- **快速了解技术全貌** → prosona-analysis.md
- **理解内容如何驱动行为** → aom-analysis.md + drill-analysis.md
- **设计辅导模块** → coaching-skills-analysis.md（最重要的技术参考）
- **补充产品需求** → douban-analysis.md
