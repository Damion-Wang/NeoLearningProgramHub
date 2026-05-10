/* ============================================================
   MassageMgt · MOCK DATA（消息中心 / spec § 06-management/05-message）
   - 单 source 引用 _shared/mock/admin.js（AdminCtx.{members,currentAdmin,otherAdmins}）
   - messages: 31 条混合（manual 12 / auto 10 / draft 4 / scheduled 3 / failed 2）
   - 时间字段 ISO · 渲染时算相对
   v1.3 融合：删自带 currentAdmin/members/otherAdmins · 改读 AdminCtx
   ============================================================ */

(function () {
  // 单 source · 引用 AdminCtx（admin.js 必须先加载）
  const A = window.AdminCtx || {};
  const currentAdmin = A.currentAdmin;
  const members      = A.members ? A.members.slice() : [];
  const otherAdmins  = A.otherAdmins || [];

  // 简易日期偏移工具（demo 时间相对今天 2026-05-08）
  const NOW = new Date('2026-05-08T10:30:00');
  function offset(daysAgo, hours, mins) {
    const d = new Date(NOW);
    d.setDate(d.getDate() - daysAgo);
    if (hours != null) d.setHours(hours, mins || 0, 0, 0);
    else d.setHours(d.getHours() - Math.floor(Math.random() * 4));
    return d.toISOString();
  }
  function future(daysAhead, hours, mins) {
    const d = new Date(NOW);
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hours, mins || 0, 0, 0);
    return d.toISOString();
  }

  /* ==========  31 条消息  ========== */
  const messages = [
    // === 手动 manual 12 条（管理员发，已发送）===
    {
      id: 'msg-m-01', type: 'manual', senderId: 'admin-chen', sender: '陈总',
      recipients: ['u4'],
      title: '关于本周 A3 实战练习的反馈',
      body: '李明，你 A3 演练表现很好——尤其是第 5 轮的"是流程问题还是认人问题"那句追问，PIN 法用得很到位。下周建议你试着主动找一次跨部门的真实场景做练习。',
      time: offset(0, 9, 15),
      delivery: { sent: 1, read: 1, total: 1 }
    },
    {
      id: 'msg-m-02', type: 'manual', senderId: 'admin-hr-wang', sender: 'HR 王',
      recipients: ['u4', 'u5', 'u6'],
      title: '本周三组内小型分享',
      body: '本周三下午 4 点会议室 B 组织一次小型分享会，主题：跨部门协作中的真实卡点。请你们三位准备 5 分钟案例。',
      time: offset(0, 8, 30),
      delivery: { sent: 3, read: 2, total: 3 }
    },
    {
      id: 'msg-m-03', type: 'manual', senderId: 'admin-chen', sender: '陈总',
      recipients: members.filter(m => m.isLearner && !m.isAdmin).slice(0, 22).map(m => m.id),
      title: '中期满意度调查启动',
      body: '各位同学，距离结营还剩 137 天。今天起开放中期满意度调查（详见大厅 bell 通知），请在 6 月 30 日前完成。',
      time: offset(1, 14, 0),
      delivery: { sent: 22, read: 18, total: 22 }
    },
    {
      id: 'msg-m-04', type: 'manual', senderId: 'admin-chen', sender: '陈总',
      recipients: ['u9', 'u12', 'u15'],
      title: undefined,
      body: '注意到你们三位最近一周登录都不到 2 次。是不是工作压力比较大？我们这周末安排个 30 分钟的项目调整对话，你看 OK 吗？',
      time: offset(2, 11, 0),
      delivery: { sent: 3, read: 3, total: 3 }
    },
    {
      id: 'msg-m-05', type: 'manual', senderId: 'admin-hr-wang', sender: 'HR 王',
      recipients: ['u7'],
      title: 'A2 SBI 反馈框架学习提示',
      body: '王勇，注意到你 A2 学了 4 次但都没看完——是有什么具体的卡点吗？你回我下，我来帮你看看节奏怎么调。',
      time: offset(2, 16, 30),
      delivery: { sent: 1, read: 0, total: 1 }
    },
    {
      id: 'msg-m-06', type: 'manual', senderId: 'admin-chen', sender: '陈总',
      recipients: ['u4', 'u11'],
      title: '本周 1on1 调整',
      body: '由于本周三我有外部会议，原定的 1on1 推迟到周四同时段。',
      time: offset(3, 9, 0),
      delivery: { sent: 2, read: 2, total: 2 }
    },
    {
      id: 'msg-m-07', type: 'manual', senderId: 'admin-chen', sender: '陈总',
      recipients: ['u8'],
      title: '你的辅导反馈对练评分',
      body: '张三，你 A3 反馈对练 3.7/5。倾听 4 分 + 共识建立 4 分都很到位，下次试试在 I 之后多追一层 N。',
      time: offset(4, 17, 0),
      delivery: { sent: 1, read: 1, total: 1 }
    },
    {
      id: 'msg-m-08', type: 'manual', senderId: 'admin-hr-wang', sender: 'HR 王',
      recipients: ['u3', 'u10', 'u13'],
      title: '请提交 Q1 项目复盘',
      body: '麻烦三位本周五前提交 Q1 项目复盘文档（不少于 500 字）。模板在 hall 工具区已上传。',
      time: offset(5, 10, 30),
      delivery: { sent: 3, read: 3, total: 3 }
    },
    {
      id: 'msg-m-09', type: 'manual', senderId: 'admin-chen', sender: '陈总',
      recipients: ['u4'],
      title: '上次 1on1 后的跟进',
      body: '李明，上次我们聊到的"如何带比自己资历久的同事"——这周你跟赵工的对话怎么样了？周五找时间同步一下。',
      time: offset(6, 14, 0),
      delivery: { sent: 1, read: 1, total: 1 }
    },
    {
      id: 'msg-m-10', type: 'manual', senderId: 'admin-chen', sender: '陈总',
      recipients: members.filter(m => m.isLearner && !m.isAdmin).slice(0, 22).map(m => m.id),
      title: '上半年汇报准备启动',
      body: '5 月 15 日之前请大家完成 A3 PIN 法实战演练（横向协作 Course 2）。汇报准备里程碑会以这个 Activity 完成度为准。',
      time: offset(8, 9, 0),
      delivery: { sent: 22, read: 22, total: 22 }
    },
    {
      id: 'msg-m-11', type: 'manual', senderId: 'admin-hr-wang', sender: 'HR 王',
      recipients: ['u14', 'u16'],
      title: '关于角色分配调整',
      body: '两位同事已经在上周完成了角色认知 Course 1。从这周起将逐步把"周会主持"工作交给你们轮值。',
      time: offset(10, 11, 30),
      delivery: { sent: 2, read: 1, total: 2 }
    },
    {
      id: 'msg-m-12', type: 'manual', senderId: 'admin-chen', sender: '陈总',
      recipients: members.filter(m => m.isLearner && !m.isAdmin).slice(0, 22).map(m => m.id),
      title: '欢迎加入基层管理者培训项目',
      body: '各位，欢迎加入为期 6 个月的基层管理者培训项目。今天起 hall 已开放，详情请查看 Neo 给你的导学。',
      time: offset(46, 9, 0),
      delivery: { sent: 22, read: 22, total: 22 }
    },

    // === 自动催学 auto 10 条（系统触发 / 不同 trigger 类型）===
    {
      id: 'msg-a-01', type: 'auto', senderId: 'system', sender: '系统',
      triggerType: 'milestone', triggerLabel: '里程碑绑定',
      recipients: ['u4', 'u11', 'u17'],
      title: '距「上半年汇报准备」还有 7 天',
      body: '${学员名}, 距离 上半年汇报准备 还有 7 天 / 需在 PIN 法实战演练 之前完成',
      time: offset(0, 6, 0),
      delivery: { sent: 3, read: 2, total: 3 }
    },
    {
      id: 'msg-a-02', type: 'auto', senderId: 'system', sender: '系统',
      triggerType: 'silent', triggerLabel: '脱训信号',
      recipients: ['u9', 'u12'],
      title: '已经 7 天没来啦',
      body: '${学员名}, 已经 7 天没来啦, 我们 65% 哦, 加油!',
      time: offset(0, 8, 0),
      delivery: { sent: 2, read: 1, total: 2 }
    },
    {
      id: 'msg-a-03', type: 'auto', senderId: 'system', sender: '系统',
      triggerType: 'behind', triggerLabel: '进度落后',
      recipients: ['u15'],
      title: '进度落后均值',
      body: '${学员名}, 项目还剩 137 天, 你的进度 32%, 落后均值 28%',
      time: offset(1, 9, 0),
      delivery: { sent: 1, read: 1, total: 1 }
    },
    {
      id: 'msg-a-04', type: 'auto', senderId: 'system', sender: '系统',
      triggerType: 'silent', triggerLabel: '脱训信号',
      recipients: ['u6', 'u18', 'u20'],
      title: '已经 8 天没来啦',
      body: '${学员名}, 已经 8 天没来啦, 我们 67% 哦, 加油!',
      time: offset(2, 6, 0),
      delivery: { sent: 3, read: 2, total: 3 }
    },
    {
      id: 'msg-a-05', type: 'auto', senderId: 'system', sender: '系统',
      triggerType: 'manual_trigger', triggerLabel: '手动触发',
      recipients: ['u4'],
      title: 'HR 王 触发了一次脱训提醒',
      body: '${学员名}, 已经 5 天没来啦, 我们 60% 哦, 加油!',
      time: offset(3, 14, 0),
      delivery: { sent: 1, read: 1, total: 1 }
    },
    {
      id: 'msg-a-06', type: 'auto', senderId: 'system', sender: '系统',
      triggerType: 'milestone', triggerLabel: '里程碑绑定',
      recipients: members.filter(m => m.isLearner && !m.isAdmin).slice(0, 22).map(m => m.id),
      title: '距「中期满意度调查」还有 53 天',
      body: '${学员名}, 距离 中期满意度调查 还有 53 天',
      time: offset(4, 6, 0),
      delivery: { sent: 22, read: 17, total: 22 }
    },
    {
      id: 'msg-a-07', type: 'auto', senderId: 'system', sender: '系统',
      triggerType: 'behind', triggerLabel: '进度落后',
      recipients: ['u7', 'u22'],
      title: '进度落后均值',
      body: '${学员名}, 项目还剩 140 天, 你的进度 28%, 落后均值 32%',
      time: offset(5, 9, 0),
      delivery: { sent: 2, read: 2, total: 2 }
    },
    {
      id: 'msg-a-08', type: 'auto', senderId: 'system', sender: '系统',
      triggerType: 'silent', triggerLabel: '脱训信号',
      recipients: ['u11', 'u14'],
      title: '已经 7 天没来啦',
      body: '${学员名}, 已经 7 天没来啦, 我们 58% 哦, 加油!',
      time: offset(7, 6, 0),
      delivery: { sent: 2, read: 2, total: 2 }
    },
    {
      id: 'msg-a-09', type: 'auto', senderId: 'system', sender: '系统',
      triggerType: 'milestone', triggerLabel: '里程碑绑定',
      recipients: ['u4', 'u8', 'u11', 'u15', 'u17', 'u19'],
      title: '距「Q3 OKR 复盘」还有 99 天',
      body: '${学员名}, 距离 Q3 OKR 复盘 还有 99 天 / 需在 目标拆解对练 之前完成',
      time: offset(10, 6, 0),
      delivery: { sent: 6, read: 6, total: 6 }
    },
    {
      id: 'msg-a-10', type: 'auto', senderId: 'system', sender: '系统',
      triggerType: 'manual_trigger', triggerLabel: '手动触发',
      recipients: members.filter(m => m.isLearner && !m.isAdmin).slice(0, 22).map(m => m.id),
      title: '陈总 触发了一次项目剩余天数提醒',
      body: '${学员名}, 项目还剩 137 天, 你的进度 35%, 落后均值 24%',
      time: offset(15, 10, 0),
      delivery: { sent: 22, read: 22, total: 22 }
    },

    // === 草稿 draft 4 条（仅当前管理员陈总可见 = senderId='admin-chen'）===
    {
      id: 'msg-d-01', type: 'draft', senderId: 'admin-chen', sender: '陈总',
      recipients: ['u4'],
      title: '关于下次 1on1',
      body: '李明，关于下次 1on1 的内容我想…（写到一半）',
      time: offset(0, 10, 15)
    },
    {
      id: 'msg-d-02', type: 'draft', senderId: 'admin-chen', sender: '陈总',
      recipients: ['u9', 'u12', 'u15'],
      title: '本月停训关注',
      body: '',
      time: offset(0, 9, 0)
    },
    {
      id: 'msg-d-03', type: 'draft', senderId: 'admin-chen', sender: '陈总',
      recipients: [],
      title: '',
      body: '草稿已开始但尚未填收件人...',
      time: offset(1, 18, 30)
    },
    // 这条是 HR 王的草稿 - 当前管理员（陈总）应该看不到
    {
      id: 'msg-d-04', type: 'draft', senderId: 'admin-hr-wang', sender: 'HR 王',
      recipients: ['u3'],
      title: '人事调整通知（HR 王本人草稿）',
      body: '内部 HR 草稿 · 陈总不该看到这条',
      time: offset(0, 16, 0)
    },

    // === 定时 scheduled 3 条 ===
    {
      id: 'msg-s-01', type: 'scheduled', senderId: 'admin-chen', sender: '陈总',
      recipients: members.filter(m => m.isLearner && !m.isAdmin).slice(0, 22).map(m => m.id),
      title: '上半年汇报具体安排',
      body: '5 月 15 日上午 10 点开汇报会，每人 8 分钟。请提前准备 PPT 和 1on1 反思摘要。',
      time: offset(0, 11, 0),
      delivery: { scheduledAt: future(2, 9, 0) }
    },
    {
      id: 'msg-s-02', type: 'scheduled', senderId: 'admin-chen', sender: '陈总',
      recipients: ['u9', 'u12'],
      title: '关注一下你们的 A2',
      body: '注意到 A2 SBI 反馈框架你们俩进度都还在 30% 左右。下周三 30 分钟 1on1，看看怎么帮你提速。',
      time: offset(0, 14, 0),
      delivery: { scheduledAt: future(5, 14, 0) }
    },
    // 这条是 HR 王 定时的 - 陈总不该看到
    {
      id: 'msg-s-03', type: 'scheduled', senderId: 'admin-hr-wang', sender: 'HR 王',
      recipients: ['u17'],
      title: '人事公告（HR 王定时）',
      body: '内部 HR 定时 · 陈总不该看到这条',
      time: offset(0, 10, 0),
      delivery: { scheduledAt: future(7, 10, 0) }
    },

    // === 失败 2 条（实际是 manual / auto 但 delivery 显示失败）===
    {
      id: 'msg-f-01', type: 'manual', senderId: 'admin-chen', sender: '陈总',
      recipients: ['u11', 'u13', 'u17', 'u19'],
      title: '关于这周的项目进度回顾',
      body: '本周大家进度差异较大，请各位在周五 12 点前提交一份 200 字的回顾。',
      time: offset(2, 13, 0),
      delivery: { sent: 2, read: 2, total: 4, failed: 2 }
    },
    {
      id: 'msg-f-02', type: 'auto', senderId: 'system', sender: '系统',
      triggerType: 'silent', triggerLabel: '脱训信号',
      recipients: ['u22', 'u23'],
      title: '已经 5 天没来啦',
      body: '${学员名}, 已经 5 天没来啦, 我们 50% 哦, 加油!',
      time: offset(3, 6, 0),
      delivery: { sent: 1, read: 0, total: 2, failed: 1 }
    }
  ];

  // 按时间倒序（最新置顶）
  messages.sort((a, b) => new Date(b.time) - new Date(a.time));

  /* ==========  暴露给 app  ========== */
  window.MASSAGE_MOCK = {
    currentAdmin,
    members,
    otherAdmins,
    messages,
    NOW: NOW.toISOString()
  };
})();
