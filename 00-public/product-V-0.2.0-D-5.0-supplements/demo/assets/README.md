# assets · 共享图片资源

## 当前 demo（build-v2）实际引用

| 文件 | 用途 | 大小 |
|---|---|---|
| `logo.png` | 睿学 logo（topbar）| 8 KB |
| `login-bg.png` | login 页左侧品牌背景 | 1.9 MB |
| `neo-male.png` | Neo 男头像（默认）| 1.6 MB |
| `neo-female.png` | Neo 女头像（settings 切换）| 2.0 MB |
| `ora.png` | Ora 头像（管理端 chat）| 1.9 MB |
| `modals/grow-coaching.jpg` | knowledge modal · GROW 教练对话场景 | 53 KB |
| `modals/pin-meeting.jpg` | knowledge modal · PIN 跨部门会议场景 | 92 KB |
| `modals/sbi-feedback.jpg` | recap modal · SBI 框架白板 | 45 KB |
| `modals/sbi-give-back.jpg` | knowledge modal · SBI 反馈场景 | 94 KB |

## 保留但 demo 暂未引用（v1.1 决定保留 · 未来融合可能用）

| 文件 | 给谁用 | 大小 |
|---|---|---|
| `actor-peace.png` | practice-practice 三栏 demo · Actor 默认情绪 | 1.8 MB |
| `actor-angry.png` | practice-practice · Actor 防御/愤怒情绪 | 1.9 MB |
| `mock-data.json` | legacy / practice mock 学员答题数据 | 42 KB |
| `ppt/MANAGER1_segment_*.jpg` | lecture-ppt 课件截图（Course 1 角色认知 12 张）| ~2.5 MB |
| `ppt/MANAGER2_segment_*.jpg` | lecture-ppt 课件截图（Course 2 横向协作 14 张）| ~2.5 MB |
| `ppt/MANAGER3_segment_*.jpg` | lecture-ppt 课件截图（Course 3 辅导反馈 13 张）| ~2.4 MB |

## 加新资源的纪律（v1.1 工程纪律 E）

> **demo 必须能 file:// 双击运行 → 0 远程依赖**

1. 外部图片 / 字体 / icon → 先 `curl -O` 下来放 `assets/`
2. 大图压缩（建议 ≤ 200KB / webp 优先）
3. 命名规范：`{module}-{name}.{ext}`（如 `modals/grow-coaching.jpg`）
4. 引用统一相对路径：`assets/xxx.{ext}`（assets 与 *.html 同级 · build-v2 自包含）

## 引用扫描

每次改 demo HTML 后跑：
```powershell
grep -rho 'assets/[a-zA-Z0-9_./\-]*\.\(png\|jpg\|webp\|json\|svg\)' .. | sort -u
```
确认所有引用的文件都存在（v1.1 发现过 mgthome.html 引用 `assets/neo.png` 但该文件不存在的 broken ref）。

> 维护人：DM (PM) · 最后更新 2026-05-07
