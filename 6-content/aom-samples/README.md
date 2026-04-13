# aom-samples/ -- AOM 样例数据

来自"横向协作：销售内测"课程的真实 AOM 数据，用于理解内容数据结构。

## 文件清单

| 文件 | 说明 |
|------|------|
| [横向协作-授课.json](横向协作-授课.json) | 授课 AOM（NARRATION + CHAT 交互，含自适应分流标签） |
| [横向协作-对练.json](横向协作-对练.json) | 对练 AOM（directScoContent 为空，通过外部引用关联剧本） |
| [横向协作-剧本.txt](横向协作-剧本.txt) | 对练剧本（70+字段角色画像、递进式行为反应、L1-L5评估标准） |

## AOM 数据结构简述

```
Project → Module → Activity → SCO(scoFlow) → Segment
```

- **Project**：一个培训项目（对应需求文档中的 Project）
- **Module**：一门课程（对应需求文档中的 Course）
- **Activity**：一次教学活动（授课/对练/测评）
- **SCO**：最小可交互内容对象（含 interactionPoint：blueprint/rule/solution）
- **Segment**：PPT 页面级内容（仅授课类 SCO 有）

平台不硬编码业务逻辑，passConditions/solution/blueprint 均以自然语言写入数据，由 LLM 解释执行。详见 [3-tech/analysis/aom-analysis.md](../../3-tech/analysis/aom-analysis.md)。
