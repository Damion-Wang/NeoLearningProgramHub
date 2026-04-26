# 睿学产品 Demo 整合规划 v2

> 核心约束：
> 1. Demo 文件**完全独立**，不依赖原 11 个 HTML（可复制代码，运行时零耦合）
> 2. 规划包含：**做什么 / 怎么做 / 验收 / 测试 / 测试记录**
>
> 日期：2026-04-23
> 维护：王鼎明

---

## 一、目标与核心约束

### 1.1 目标

一套完整、独立、可直接打开浏览的**产品级 demo**，让用户像用真产品一样点击探索所有功能。登录→学员端→场域→报告→端口切换→管理端的完整闭环，状态在所有页面间持久化。

### 1.2 核心约束

| 约束 | 含义 | 执行规则 |
|------|------|---------|
| **独立性** | Demo 不链接/引用原 11 个 HTML | 每个 demo 页面自包含 CSS/JS，复制必要代码，资源用独立副本 |
| **原稿保留** | 原 `build/` 11 个 HTML 不动 | 如有链接错误不修复，作为历史快照 |
| **真产品感** | 无字幕/聚光灯/自动播放 | 只做真实可点击 UI |
| **状态共享** | 跨页切换保留进度、笔记等 | localStorage（demo 内部 key） |

### 1.3 目录结构

```
DM_Temp/prototype/
├── build/                      # 保留，原 11 个 HTML，不动
├── assets/                     # 共用图片/数据，但demo不引用build的任何文件
│   ├── ppt/                   # PPT 图片
│   ├── neo-male.svg
│   ├── neo-female.svg
│   └── avatar-zhao.jpg
├── demo/                       # ⭐ 全新独立演示层
│   ├── index.html             # 根入口（重定向到 login）
│   ├── 01-login.html          # 复制自 build/01-login.html 后独立
│   ├── 02-hall.html           # 合并自 03-hall-daily（主大厅，W5/16 状态）
│   ├── 03-lecture.html        # 复制自 04-lecture
│   ├── 04-practice.html       # 复制自 05-practice
│   ├── 05-report.html         # 复制自 06-report-learner
│   ├── 06-inquiry.html        # 复制自 11-inquiry-p3
│   ├── 07-mgmt-home.html      # 复制自 08-operation
│   ├── 08-mgmt-report.html    # 复制自 09-report-mgmt
│   ├── 09-mgmt-message.html   # 复制自 10-message
│   ├── 10-mgmt-config.html    # 复制自 07-config
│   └── README.md              # Demo 说明 + 测试清单
└── demo-plan-v2.md             # 本文档
```

Demo 页面**重新编号**（不用原编号），让链接关系更清晰：
- 00-03 是学员端（login + hall + field zones）
- 07-10 是管理端
- 不接入 02-hall-empty（空状态不参与主流程）

### 1.4 场景覆盖清单

| 场景 | Demo 页 | Spec 对应 |
|------|---------|----------|
| 登录 | 01-login | 公共 · 登录 |
| 学员日常大厅 | 02-hall | learner · hall |
| 授课场域 | 03-lecture | learner · lecture-zone |
| 对练场域 | 04-practice | learner · practice-zone |
| 学员报告 | 05-report | learner · report-zone |
| 调研场域（P3） | 06-inquiry | learner · inquiry-zone |
| 管理端首页 | 07-mgmt-home | management · operation |
| 管理端报告 | 08-mgmt-report | management · report-gen |
| 管理端消息 | 09-mgmt-message | management · message |
| 管理端配置 | 10-mgmt-config | management · project-config |

---

## 二、架构设计

### 2.1 页面独立策略

**每个 demo HTML 自包含：**
- CSS：所有样式 `<style>` 内联（不用外链 CSS 文件）
- JS：所有逻辑 `<script>` 内联（不 import 外部 JS 模块）
- 资源：图片、头像、PPT 用 `../assets/` 相对路径引用（允许共享静态资源，但不共享代码）
- CDN：Tailwind、Lucide、Google Fonts 允许用 CDN（业界标准，不算依赖原 HTML）

**跨 demo 页面共享数据的唯一机制：localStorage**
- 所有 demo 页面用同一个 localStorage key：`srxDemoState`
- 状态结构完全在每个页面内部定义（deep clone default，无外部 schema 文件）

### 2.2 状态结构

```js
// 所有 demo 页面内联的默认状态（每页一份副本，非共享模块）
const DEFAULT_STATE = {
  learner: {
    name: '张磊',
    initial: '张',
    department: '销售部',
    email: 'zhanglei@a-corp.com'
  },
  project: {
    name: 'A公司基层管理者发展项目',
    currentWeek: 5,
    totalWeeks: 16
  },
  progress: {
    currentCourse: 'C1',
    currentActivity: 'A3',
    completedActivities: ['A1','A2'],
    percentage: 28,
    sco: '6/12'
  },
  preferences: {
    neoAvatar: 'male',
    aiSpeed: 'standard',
    theme: 'dark'
  },
  notes: [
    { id:'n1', title:'自我归因策略要点', source:'A3·授课', date:'4/20', content:'自我归因的核心是...' },
    { id:'n2', title:'赵工案例反思', source:'A4·对练', date:'4/19', content:'第4轮用自我归因...' }
  ],
  discoveries: [
    { id:'d1', title:'首次主动提问意识', source:'A1·授课', date:'4/15' },
    { id:'d2', title:'对练中的情绪感知', source:'A4·对练', date:'4/18' },
    { id:'d3', title:'自我归因突破', source:'A4·对练', date:'4/20' }
  ],
  tools: [
    { id:'t1', name:'GROW 辅导对话模板', unlocked:true },
    { id:'t2', name:'心理安全对话清单', unlocked:false }
  ],
  bellNotifications: [
    { id:'b1', type:'运营', title:'本周五前完成 Course 2 可获优先选座权', time:'昨天09:12', unread:true },
    { id:'b2', type:'催学', title:'你已连续2天未学习', time:'今天08:30', unread:true },
    { id:'b3', type:'平台', title:'AI 教练已更新', time:'4/18', unread:true }
  ],
  portRole: 'learner'  // learner | admin
};

// 每个 demo 页面开头的加载脚本
const STATE_KEY = 'srxDemoState';
function getState() {
  try { return { ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem(STATE_KEY) || '{}') }; }
  catch { return DEFAULT_STATE; }
}
function setState(patch) {
  const s = getState();
  Object.assign(s, patch);
  localStorage.setItem(STATE_KEY, JSON.stringify(s));
}
function resetState() {
  localStorage.removeItem(STATE_KEY);
}
```

每个 demo HTML 都包含这段代码的副本（不 import，代码重复是可接受的，换来独立性）。

### 2.3 导航拓扑图

```
          [01-login]
              │ 登录
              ▼
          [02-hall] ◀──────── 头像/端口切换 ──────┐
           │                                     │
           ├─ 课程卡"开始" ──▶ [03-lecture]        │
           │                      │               │
           │                      ├─ Activity完成──▶ [04-practice]
           │                      │               │       │
           │                      └─ 回辅导 ◀─────┘       │
           │                                              │
           │                                     对练完成──▶ [05-report]
           ├─ 报告库 ─▶ [05-report]                        │
           │                                              │
           ├─ 调研 ─▶ [06-inquiry] ◀──调研Activity────────┘
           │
           └─ 端口切换 ─▶ [07-mgmt-home]
                               │ ↕
                  ┌────────────┼────────────┐
                  │            │            │
             [08-report]   [09-message] [10-config]
                  │            │            │
                  └────────────┴────────────┘
                                │
                        端口切换 ─▶ [02-hall]
```

---

## 三、功能/交互需求

### 3.1 学员端

**01-login.html**
- 左右分屏品牌区 + 登录表单
- 登录按钮：`window.location.href = '02-hall.html'`（并预设 state 为 W5/16）
- 首次加载时自动调用 `setState(DEFAULT_STATE)`，重置为 demo 初始状态

**02-hall.html**
- Dashboard（进度/热力图/待办，读 state）
- 课程目录（C1 完成、C2 锁定）
- 4 库 2×2 网格（Tool/Note/Discovery/Result，读 state 渲染）
- Neo 品牌形象 hero
- Leo→Neo 对话（复用 state.neoAvatar 切换头像）
- Topbar 头像下拉：账号管理/个人设置/帮助/端口切换/退出
  - 端口切换→管理端：`window.location.href = '07-mgmt-home.html'`；setState({portRole:'admin'})
- 铃铛下拉：读 state.bellNotifications 渲染

**03-lecture.html**（授课）
- 沉浸式 PPT 填充（固定不滚动）
- 覆盖式抽屉左导航（课程大纲/SCO列表）
- Neo 对话
- Activity 完成弹窗：
  - [开始下一个对练] → `04-practice.html`
  - [回到辅导] → `02-hall.html`

**04-practice.html**（对练）
- 3 阶段：情景导入 / 角色扮演 / 反思复盘
- Phase 2 三列布局：Actor 信息 / Actor 对话 / Neo 辅导
- Phase 3 反思复盘结束时，Neo 推送 Discovery 卡片
  - 学员点"接受" → `setState({discoveries:[...]})`；DOM 标记已收藏
  - 学员点"忽略" → 卡片移除
- 完成后 → `05-report.html`（自动或按钮）

**05-report.html**（报告）
- Markdown 长文档（可滚动）
- Neo 对话区解读
- 证据引用以 blockquote 内联（不弹窗）

**06-inquiry.html**（调研 P3）
- 3 阶段：说明/核心调研/信息确认
- Phase 2 保留 Neo Chat

### 3.2 管理端

**07-mgmt-home.html**（首页）
- KPI 卡片 + 双热力图 + 学员列表 + 内容完成率
- 标题区 sticky，内容滚动
- Ora 对话区
- Topbar 头像下拉含"切换到学员端" → `02-hall.html`

**08-mgmt-report.html**（报告库+编辑器）
- 报告列表（点击进入编辑器视图）
- 新建报告表单弹窗
- 报告编辑器 + Ora 协作

**09-mgmt-message.html**（消息）
- 默认显示发送记录
- "+新建消息"→编辑视图（接收人选择+富文本）
- 消息行点击展开详情

**10-mgmt-config.html**（配置）
- 左侧子导航锚点（6 区）
- 项目信息/学员导入/角色分配/催学规则/平台个性化/内容预览
- [确认开营]二次确认弹窗

### 3.3 跨页状态交互

| 操作 | 源页 | 写入 state | 目标页读取 |
|------|-----|-----------|----------|
| 切换 Neo 形象 | 02-hall 设置 | neoAvatar | 所有含 Neo 的页面 |
| 写新笔记 | 03/04/05/06 | notes[] | 02-hall 笔记库 |
| 接受 Discovery | 04-practice | discoveries[] | 02-hall Discovery 库 |
| 端口切换 | 02-hall / 07-mgmt | portRole | topbar chip 显示 |
| 标为已读 | 铃铛下拉 | bellNotifications[].unread | 所有页面铃铛 badge |

---

## 四、执行步骤（分阶段）

### Phase 1: 基础设施（0.5 天）

1. 创建 `demo/` 目录
2. 创建 `demo/index.html`（重定向）
3. 确定共享资源路径（`../assets/`）
4. 定义 localStorage key = `srxDemoState`

**产出**：空目录 + index.html

### Phase 2: 复制独立化 11 个页面（1 天）

按下表复制+改造（不添加新功能，纯独立化）：

| 源 | 目标 | 改造要点 |
|----|------|---------|
| build/01-login.html | demo/01-login.html | 登录跳转 → demo/02-hall.html |
| build/03-hall-daily.html | demo/02-hall.html | 内联 DEFAULT_STATE + getState/setState；顶部头像下拉改指向 demo/XX.html |
| build/04-lecture.html | demo/03-lecture.html | 同上 |
| build/05-practice.html | demo/04-practice.html | 同上 + 对练完成跳 05-report |
| build/06-report-learner.html | demo/05-report.html | 同上 |
| build/11-inquiry-p3.html | demo/06-inquiry.html | 同上 |
| build/08-operation.html | demo/07-mgmt-home.html | 加端口切换→02-hall；调整链接 |
| build/09-report-mgmt.html | demo/08-mgmt-report.html | 同上 |
| build/10-message.html | demo/09-mgmt-message.html | 同上 |
| build/07-config.html | demo/10-mgmt-config.html | 同上 |

**每页增加（复制粘贴，不引用外部模块）：**
- `<script>` 块包含 DEFAULT_STATE + getState/setState/resetState
- 页面初始化：读 state 渲染动态元素
- 关键操作：写 state（笔记、Discovery、设置等）

**产出**：10 个独立 HTML + index.html

### Phase 3: 状态驱动渲染（0.5 天）

给每个需要动态渲染的 DOM 元素加 ID，写渲染函数：
- 02-hall 笔记库 / Discovery 库 / Tool 库
- 所有带 neo-avatar class 的图片
- 铃铛下拉内容
- 头像初始字符

### Phase 4: 跨页交互接通（0.5 天）

- 04-practice 末尾的 Discovery 卡片接受流程
- 所有页面的"新建笔记"写入
- 02-hall 个人设置 → 写 state → 多页面同步
- 端口切换双向
- Activity 完成弹窗 → 跳转目标正确

### Phase 5: 自测清单过一遍（0.5 天）

执行测试矩阵（见第五章），修复 bugs。

### Phase 6: 文档 + 录屏 + 交付（0.25 天）

- 编写 `demo/README.md`（使用说明）
- 浏览器录屏（可选 backup）
- 交付包确认

**总工作量：3.25 天**

---

## 五、验收标准

### 5.1 功能验收（Functional Acceptance）

**必须全部通过：**

#### F1 独立性
- [ ] `demo/` 目录下任意 HTML 文件单独用浏览器打开（file:// 或 http://）能正常加载
- [ ] `demo/` 不引用任何 `build/` 下的文件（href、src、import 全部检查）
- [ ] 删除 `build/` 整个目录后 `demo/` 完全不受影响

#### F2 登录流程
- [ ] `demo/index.html` 自动跳转到 `demo/01-login.html`
- [ ] 01-login 点击 [登录] → 02-hall，localStorage 中有 srxDemoState
- [ ] 02-hall 加载时显示 W5/16 中期状态（进度 28%，A3 进行中）

#### F3 大厅 02-hall
- [ ] Dashboard 显示学员"张磊"，进度 28%，连续 5 天
- [ ] 4 库 2×2 网格展示（工具/笔记/发现/报告）
- [ ] 笔记库显示 2 条笔记（来自 state）
- [ ] Discovery 库显示 3 条（全部已收藏）
- [ ] 课程目录 C1 进行中，C2/C3/C4 锁定
- [ ] Neo 品牌 hero 显示，默认男性形象
- [ ] 铃铛显示 3 未读，点击展开显示 3 条通知

#### F4 场域跳转
- [ ] 02-hall 课程卡 [继续学习] → 03-lecture
- [ ] 03-lecture Activity 完成弹窗 → 04-practice
- [ ] 04-practice 完成 → 05-report
- [ ] 05-report 返回大厅 → 02-hall（通过 sub-bar 面包屑）
- [ ] 所有场域 sub-bar 面包屑"大厅"可点击 → 02-hall

#### F5 端口切换
- [ ] 02-hall 头像菜单 → 端口切换 → 管理端 → 07-mgmt-home
- [ ] 07-mgmt-home 头像下拉 → 切换到学员端 → 02-hall
- [ ] 切换后 state.portRole 正确更新

#### F6 管理端内部导航
- [ ] 左侧图标栏 4 个图标（首页/报告/消息/配置）互跳正常
- [ ] 每个页面的当前图标高亮

#### F7 跨页状态同步
- [ ] 03-lecture 记笔记 → 保存 → 回 02-hall，笔记库显示新笔记
- [ ] 04-practice 反思复盘接受 Discovery → 回 02-hall，Discovery 库+1
- [ ] 02-hall 个人设置切换 Neo 女性 → 所有页面 Neo 头像变女性
- [ ] AI 语速切换后写入 state

#### F8 视觉一致性
- [ ] 所有学员端 topbar 显示"睿学" + "学员端"
- [ ] 所有管理端 topbar 显示"睿学" + "管理端"
- [ ] 所有场域 sub-bar 格式统一（大厅 > 课程 > Activity）
- [ ] Neo 形象在所有学员端对话区出现

### 5.2 非功能验收（Non-Functional）

- [ ] **性能**：每页首屏加载 < 2s（localhost）
- [ ] **兼容**：Chrome 120+ / Edge 120+ 正常
- [ ] **响应式**：1280/1440/1920 宽度下无布局破坏、无横向滚动
- [ ] **可离线**：断网下所有 demo 页面依然可打开浏览（CDN 资源缓存后）
- [ ] **状态清理**：`localStorage.removeItem('srxDemoState')` 或清 cookie 后重回初始

---

## 六、测试方法

### 6.1 代码级测试（静态分析）

#### 6.1.1 依赖隔离检查

**脚本工具**（在 `demo/` 下执行）：
```bash
# 检查不包含 build/ 的引用
grep -rn "build/" demo/ && echo "VIOLATION" || echo "PASS"

# 检查所有 href 目标在 demo/ 内
grep -oE 'href="[^"]+"' demo/*.html | grep -v 'http' | grep -v '#' \
  | awk -F'"' '{print $2}' | sort -u > /tmp/hrefs.txt
# 手动 diff /tmp/hrefs.txt 和 demo/ 目录清单
```

#### 6.1.2 HTML 有效性
使用 W3C Validator 或本地 tidy：
```bash
for f in demo/*.html; do
  tidy -errors -quiet "$f" 2>&1 | head -5
done
```

#### 6.1.3 JS 语法
打开每个 HTML 在 Chrome DevTools Console，无 syntax error。

#### 6.1.4 状态 schema 一致性
每个 HTML 里的 DEFAULT_STATE 结构必须完全一致（用脚本比对）：
```bash
for f in demo/*.html; do
  node -e "
    const html = require('fs').readFileSync('$f','utf8');
    const m = html.match(/const DEFAULT_STATE = ({[\s\S]*?^});/m);
    console.log('$f', m ? 'found' : 'missing');
  "
done
```

### 6.2 端到端浏览器测试（Playwright 脚本化）

#### 6.2.1 测试环境
- 启动 HTTP 服务器：`python -m http.server 8765` （在 prototype/ 目录）
- 访问 URL：`http://localhost:8765/demo/index.html`
- 视口：1440×900（默认），另测 1280×800 和 1920×1080

#### 6.2.2 测试矩阵

| 测试用例 ID | 场景 | 起点 URL | 操作序列 | 预期结果 |
|------------|------|---------|---------|---------|
| TC-01 | 根入口重定向 | /demo/index.html | 打开 | 自动跳到 /demo/01-login.html |
| TC-02 | 登录流程 | /demo/01-login.html | 点 [登录] | 跳 02-hall，state 已写入 |
| TC-03 | 大厅数据 | /demo/02-hall.html | 打开 | 进度 28%、笔记 2 条、Discovery 3 条 |
| TC-04 | 课程进入 | /demo/02-hall.html | 点 C1 课程卡片 | 跳 03-lecture |
| TC-05 | 授课→对练 | /demo/03-lecture.html | 触发 Activity 完成弹窗 → 点 [开始下一个对练] | 跳 04-practice |
| TC-06 | 对练完成→报告 | /demo/04-practice.html | 走完 3 阶段 → 完成 | 跳 05-report |
| TC-07 | 报告返大厅 | /demo/05-report.html | 点 sub-bar"大厅" | 跳 02-hall |
| TC-08 | 端口切换学→管 | /demo/02-hall.html | 头像菜单→端口切换→管理端 | 跳 07-mgmt-home，state.portRole='admin' |
| TC-09 | 端口切换管→学 | /demo/07-mgmt-home.html | 头像菜单→切换到学员端 | 跳 02-hall，state.portRole='learner' |
| TC-10 | 管理端互跳 | /demo/07→08→09→10 | 依次点左导航 | 4 个管理端页面正确切换 |
| TC-11 | 笔记同步 | /demo/03-lecture.html | 打开笔记悬浮球 → 新建"test笔记" → 保存 → 返回 02-hall | 02-hall 笔记库显示"test笔记" |
| TC-12 | Discovery 接受 | /demo/04-practice.html Phase 3 | 点 Neo 发现卡 [接受] → 返 02-hall | Discovery 库 +1 |
| TC-13 | Neo 切女 | /demo/02-hall.html | 设置→切换 Neo 女 → 打开其他页 | 所有 Neo 头像变女 |
| TC-14 | 铃铛展开 | /demo/02-hall.html | 点铃铛 | 下拉显示 3 条通知 |
| TC-15 | 调研场域 | /demo/06-inquiry.html | 走完 3 阶段 | Phase 切换正常 |
| TC-16 | 新建报告 | /demo/08-mgmt-report.html | [+ 新建报告] | 弹窗显示 6 字段表单 |
| TC-17 | 新建消息 | /demo/09-mgmt-message.html | [+ 新建消息] → 选多人 | 选人名单可见 |
| TC-18 | 确认开营 | /demo/10-mgmt-config.html | [确认开营] | 二次确认弹窗 |
| TC-19 | 响应式 1280 | 所有页 | 视口 1280×800 打开 | 无横向滚动，布局完整 |
| TC-20 | 响应式 1920 | 所有页 | 视口 1920×1080 打开 | 布局居中/扩展合理 |
| TC-21 | 状态清除重置 | /demo/02-hall.html | 清 localStorage → 刷新 | 回到默认 W5/16 状态 |
| TC-22 | 离线模式 | 所有页 | 禁用网络 → 刷新 | 功能不受影响（CDN 缓存后） |

#### 6.2.3 Playwright 自动化脚本结构

```js
// 伪代码，保存为 demo/tests/e2e.spec.js
const { test, expect } = require('@playwright/test');

test.describe('睿学 Demo E2E', () => {
  const BASE = 'http://localhost:8765/demo';
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/01-login.html');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('TC-02 登录跳转', async ({ page }) => {
    await page.click('[data-testid="login-btn"]');  // 需要给按钮加 data-testid
    await expect(page).toHaveURL(/02-hall/);
    const state = await page.evaluate(() => localStorage.getItem('srxDemoState'));
    expect(state).toBeTruthy();
  });

  // ... 其他 21 个用例
});
```

**运行**：
```bash
cd demo/tests
npm install @playwright/test
npx playwright install chromium
npx playwright test --reporter=html
```

### 6.3 手工探索测试（Exploratory）

5 个角色各自操作 5 分钟，记录问题：
1. 产品经理视角：功能完整性
2. UI 设计师视角：视觉一致性
3. QA 视角：边界场景（快速点击、连续切换）
4. 客户视角：第一次使用直觉判断
5. 开发视角：console 有无错误

---

## 七、测试记录规范

### 7.1 测试记录文档

每轮测试产出一份 `demo/tests/test-report-YYYYMMDD.md`：

```markdown
# 睿学 Demo 测试报告

- 日期：2026-04-23
- 执行人：
- Demo 版本：v1.0
- 浏览器：Chrome 120
- 分辨率：1440×900

## 1. 环境检查

| 项 | 状态 |
|----|-----|
| HTTP 服务器启动 | ✅ port 8765 |
| 目标目录存在 | ✅ demo/ |
| 外部 CDN 可用 | ✅ Tailwind/Lucide/Fonts |

## 2. 代码级测试

| 检查 | 结果 | 备注 |
|------|-----|------|
| 依赖隔离（无 build/ 引用） | ✅ PASS |  |
| HTML 有效性 | ✅ 10 个文件通过 |  |
| JS 无 syntax error | ✅ | Console 无红色错误 |
| DEFAULT_STATE 一致性 | ⚠️ WARN | 02-hall 缺 bellNotifications |

## 3. E2E 测试结果

| TC ID | 用例 | 结果 | 耗时 | 备注 |
|-------|------|-----|-----|------|
| TC-01 | 根入口重定向 | ✅ PASS | 120ms |  |
| TC-02 | 登录流程 | ✅ PASS | 850ms |  |
| TC-11 | 笔记同步 | ❌ FAIL | - | 保存后 02-hall 未刷新 |
| ... |

## 4. 截图附件

- screenshots/TC-03-hall-loaded.png
- screenshots/TC-11-fail-no-sync.png

## 5. Bug 列表

### BUG-001 笔记跨页不同步
- 严重度：P1
- 重现步骤：03-lecture 写笔记 → 保存 → 切 02-hall → 笔记库没更新
- 期望：笔记库显示新笔记
- 实际：仍显示旧的 2 条
- 根因推测：02-hall 初始化时未监听 storage 事件
- 分配：王鼎明
- 状态：Open

## 6. 通过率统计

- 功能用例：21/22 通过（95.5%）
- 非功能：4/5 通过
- 总通过率：93.1%

## 7. 放行建议

- ⚠️ 1 个 P1 bug 需修复后放行
```

### 7.2 Bug 跟踪格式

每个 bug 单独 issue/卡片，字段：
- ID（BUG-001）
- 标题
- 严重度（P0/P1/P2/P3）
- 重现步骤
- 期望/实际
- 截图
- 根因分析（发现后）
- 修复方案
- 验证结果

### 7.3 测试档案归档

```
demo/tests/
├── e2e.spec.js           # Playwright 脚本
├── test-report-20260423.md   # 当日报告
├── test-report-20260424.md   # 次日报告
├── screenshots/          # 截图
│   ├── TC-01-*.png
│   └── TC-02-*.png
├── playwright-report/    # Playwright HTML 报告（自动生成）
└── bugs/
    ├── BUG-001-notes-sync.md
    └── BUG-002-....md
```

### 7.4 持续测试节奏

- **每次大改后**：完整跑 22 个 E2E 用例
- **小修 bug 后**：只跑相关用例 + smoke test（TC-02, TC-03, TC-08）
- **交付前**：完整 E2E + 手工探索 + 3 种分辨率测试
- **演示前 1 小时**：smoke test 保平安

---

## 八、交付物

### 8.1 代码交付

1. `demo/` 目录（10 个 HTML + index.html + README.md）
2. `demo/tests/` 测试脚本和报告
3. `demo-plan-v2.md`（本文档）

### 8.2 文档交付

1. `demo/README.md`：使用说明 / 启动方法 / 操作路径图
2. 测试报告（至少 1 份）
3. 已知问题清单（如有）

### 8.3 演示预案

如果现场演示：
- 主力：本地 http://localhost:8765/demo/index.html
- 备胎：mp4 录屏（可选）
- 电脑预热：开演前 10 分钟点一遍全部 22 个路径

---

## 九、工作量与时间表

| Phase | 内容 | 工作量 | 人 |
|-------|------|-------|----|
| Phase 1 | 基础设施 | 0.5d | 开发 |
| Phase 2 | 10 页独立化 | 1d | 开发 |
| Phase 3 | 状态驱动渲染 | 0.5d | 开发 |
| Phase 4 | 跨页交互 | 0.5d | 开发 |
| Phase 5 | 自测 | 0.5d | 开发+测试 |
| Phase 6 | 文档+交付 | 0.25d | 开发 |
| **小计** | | **3.25d** | |
| QA E2E | 22 用例 | 0.5d | 测试 |
| QA 探索 | 5 角色 | 0.5d | 测试 |
| Bug 修复 | 预留 | 0.5d | 开发 |
| **QA 小计** | | **1.5d** | |
| **总计** | | **~5d** | |

---

## 十、5 个关键问题及答案（2026-04-23）

以下 5 个问题和答案是规划的**刚性约束**，后续所有执行必须遵守。

### Q1 · 静态资源独立性

**问**：demo 与原 11 页是否可以共享静态资源（PPT 图片、Neo 头像、Actor 头像）？

**答**：**可以共用 assets/，但图片要插入到 HTML 里**，保证单独发送任何一个 HTML 给别人都能完整预览。

**落地**：
- 所有图片通过 base64 data URI **内联**到 HTML `<img>` 或 `background-image` 中
- 不使用 `../assets/xx.jpg` 这种外部路径
- 任意 demo/*.html 单独发邮件/微信给别人打开都能看到完整画面（只依赖 CDN 的 Tailwind/Lucide/Fonts）
- Mock 数据同样内联为 JS 对象（不 fetch .json）

**影响**：每个 demo HTML 会变大（含 base64 图片），估计单文件 2-5 MB。可接受。

### Q2 · 账号数量与角色

**问**：demo 是否需要支持多账号切换？

**答**：**只要 2 个账号**：

| 账号 | 身份 | 场景 | 进度 |
|------|------|------|-----|
| 张磊 (student01) | **中期学员** + **管理员** | 主要演示对象，W5/16 中期状态 | Course 1 已到 A3，28% |
| 新人 (newbie01) | **初期学员** + **开营新运营** | 演示首次登录 + 开营前管理 | W0/16 开营前 |

**落地**：
- 登录页 01-login 提供账号切换（下拉或 Tab）
- 2 个账号各有独立的 localStorage 状态（key 带账号前缀）
- 张磊视角：中期大厅 + 全量场域 + 管理端日常运营
- 新人视角：首次登录空态 + 开营前配置

### Q3 · 缺失功能补齐策略

**问**：spec 中的功能如果原 11 页没实现（如自由复习模式等），demo 需要补吗？

**答**：**必要就补**。只要演示路径中遇到必须展示的功能，即使原 11 页没有也要在 demo 里补齐。

**落地**：
- 执行时如遇缺失功能，单独记录在 `demo/MISSING-FEATURES.md`
- 每个缺失功能评估"补全 / 简化占位 / 跳过"
- 补全标准：spec 里是 P0 级、且出现在演示路径上
- 简化占位：用卡片文字说明 + 截图提示

### Q4 · E2E 测试实施方式

**问**：E2E 测试的实施方式？

**答**：**Claude 自己用浏览器 skill 实施测试，Markdown 记录**。

**落地**：
- 不写 Playwright spec 文件
- 用 Playwright MCP 工具（或等效 skill）实时打开浏览器
- 按 22 个测试矩阵用例逐一执行，截图保存
- 每次测试产出 `demo/tests/test-report-YYYYMMDD.md`
- 不需要 npm/node 环境，纯 Claude 对话中完成

**测试流程**：
1. 启动 http://localhost:8765 服务
2. 浏览器 MCP 打开 `/demo/01-login.html`
3. 按测试用例执行：navigate → screenshot → 断言（视觉+console）→ 记录
4. 汇总报告附截图到 `demo/tests/screenshots/`

### Q5 · 交付级别

**问**：这个 demo 最终用于哪种场合？

**答**：**内部评审原型**。

**落地影响**：
- 允许小瑕疵（如 alert 弹窗样式不完美、细节对齐偏差）
- 优先保证**路径跑通 + 逻辑自洽**，而非像素级精美
- 遇到实现复杂的细节功能可用占位
- 不做极端分辨率/极端场景测试
- 5 角色探索测试简化为 2 角色（PM + 自检）
- 不做 mp4 录屏 fallback
- Bug 优先级：P0/P1 必修，P2/P3 可延后

---

## 十一、基于 5 问答案调整后的执行计划

### 11.1 架构调整

- **每个 HTML 完全自包含**：Tailwind/Lucide/Fonts 来自 CDN，其他（CSS、JS、状态默认值、图片、mock 数据）全部内联
- **资源内联工具**：准备一个 `scripts/inline-assets.js`（小工具），把 `../assets/xxx` 引用转为 base64 data URI
- **2 个账号状态**：localStorage 用 `srxDemoState_zhanglei` 和 `srxDemoState_newbie` 两个 key

### 11.2 文件结构调整

```
demo/
├── index.html                      # 重定向到 01-login
├── 01-login.html                   # 登录（含账号切换）
├── 02-hall-mid.html                # 张磊 · 中期大厅（W5/16）
├── 02-hall-new.html                # 新人 · 空态大厅（W0/16）
├── 03-lecture.html                 # 授课（继承共用）
├── 04-practice.html                # 对练
├── 05-report-learner.html          # 学员报告
├── 06-inquiry.html                 # 调研
├── 07-mgmt-home-mid.html           # 管理端首页（运营日常）
├── 07-mgmt-home-new.html           # 管理端首页（开营前）
├── 08-mgmt-report.html             # 团队报告
├── 09-mgmt-message.html            # 消息
├── 10-mgmt-config.html             # 配置（含开营前状态）
├── tests/
│   ├── test-report-20260423.md
│   └── screenshots/
├── MISSING-FEATURES.md             # 补齐功能清单
└── README.md
```

比原计划多了几个页面（区分 2 个账号的不同状态）。

### 11.3 工作量重估

| Phase | 内容 | 工作量 |
|-------|------|-------|
| Phase 1 | 基础设施 + 资源内联工具 | 0.5d |
| Phase 2 | 复制+独立化 12 个页面（多了 3 个账号分化版） | 1.5d |
| Phase 3 | 双账号状态驱动渲染 | 0.5d |
| Phase 4 | 跨页交互 + 必要功能补齐 | 0.75d |
| Phase 5 | 浏览器 MCP E2E 测试（22 用例） | 0.5d |
| Phase 6 | 文档 + 交付 | 0.25d |
| **总计** | | **~4d** |

### 11.4 决策记录（内部评审级）

- ✅ 不加 data-testid（内部评审允许 CSS 选择器脆弱性）
- ✅ 不预留专门 bug 修复时间（发现即修）
- ✅ 测试报告简化格式（矩阵表格 + 关键截图，不逐条详细步骤）
- ✅ 不做 mp4 备份录屏

---

以上计划基于 5 问答案锁定。下一步：你 OK 就开工，有补充先提。
