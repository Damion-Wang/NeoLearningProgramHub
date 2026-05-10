// 共享 mock · 站内消息（铃铛下拉）
// audience: 'learner' | 'admin' | 'all'
// 渲染时按 Session.role 过滤：
//   learner → audience in ['learner', 'all']
//   admin   → audience in ['admin', 'all']
//   learner+admin → 全部
window.MESSAGES = [
  { audience:'admin',
    type:'system',   sender:'系统通知',
    title:'2 名学员连续 7 天未登录',
    desc:'何颖 (12 天)、吕菲 (15 天) 已进入沉默状态，建议尽快定向催学。',
    time:'今天 09:00', unread:true
  },
  { audience:'admin',
    type:'platform', sender:'睿学平台',
    title:'W6 中期 milestone 报告草稿就绪',
    desc:'Ora 已基于截至当下数据生成 W6 中期 team report 草稿，可在报告中心 HITL 编辑后发布。',
    time:'今天 08:30', unread:true
  },
  // v1.3 融合 · admin 域 5 条（来自原 PROCONFIG_MOCK.bellMessages）
  { audience:'admin',
    type:'system',   sender:'系统提醒',
    title:'8 名学员尚未首次登录',
    desc:'距开营 14 天 · 建议邮件提醒：HR 王 / 销售 12 / 设计 3 名（点击展开查看详细名单）',
    time:'10 分钟前', unread:true
  },
  { audience:'admin',
    type:'platform', sender:'睿学平台',
    title:'里程碑「上半年汇报」距今 7 天',
    desc:'关联 1 个 Activity (CRS-002/ACT-002-03)，已完成率 67% · 建议催学触发预警',
    time:'2 小时前', unread:true
  },
  { audience:'admin',
    type:'system',   sender:'合规提醒',
    title:'项目周期变更需 HR + 销售双签字',
    desc:'提示：基础信息板块编辑「项目周期」时，开营后需 HR 已确认 + 销售已签字 双勾选才能保存。',
    time:'昨天 16:24', unread:false
  },
  { audience:'admin',
    type:'user',     sender:'HR 王', avatarChar:'王',
    title:'@你 关于催学规则文案的反馈',
    desc:'"脱训 3 天" 触发的文案是否可以柔和一点？现在的话术学员反映有压力。',
    time:'昨天 09:11', unread:false
  },
  { audience:'admin',
    type:'platform', sender:'睿学平台',
    title:'Logo 上传后请记得保存',
    desc:'已检测到平台 Logo 已上传但未保存 · 离开页面会提示',
    time:'前天', unread:false
  },
  { audience:'learner',
    type:'user',     sender:'王 HR · 项目运营', avatarChar:'王',
    title:'本周五前完成 Course 2 可获线下集训优先选座权',
    desc:'本周五 18:00 前完成 Course 2 全部学习任务的同学，可获得线下集训优先选座权。',
    time:'昨天 09:12', unread:true
  },
  { audience:'learner',
    type:'system',   sender:'系统通知',
    title:'你的 A3 PIN 法对练已生成报告',
    desc:'你完成的 PIN 法实战演练评分报告已生成（含能力评分 / 高光时刻 / 提升建议）。',
    time:'昨天 16:42', unread:false
  },
  { audience:'all',
    type:'platform', sender:'睿学平台',
    title:'4 月平台维护通知',
    desc:'4 月 14 日 02:00-04:00 平台例行维护，期间登录可能受影响，请避开时段。',
    time:'4/10', unread:false
  }
];

// 工具：按 session.role 过滤
window.filterMessagesByRole = function(role) {
  const list = window.MESSAGES || [];
  if (!role) return list;
  if (role === 'learner+admin') return list;
  if (role === 'admin')         return list.filter(m => m.audience === 'admin'  || m.audience === 'all');
  if (role === 'learner')       return list.filter(m => m.audience === 'learner' || m.audience === 'all');
  return list;
};

// 跨场域已读状态 · 配套 US-V12-LINK-005
// localStorage key: rx-msg-read · value: [msgKey1, msgKey2, ...]
// msgKey = `${title}::${time}`（mock 没有 id · 用 title+time 凑唯一性）
(function () {
  const KEY = 'rx-msg-read';
  function loadSet() {
    try { return new Set(JSON.parse(localStorage.getItem(KEY)) || []); } catch { return new Set(); }
  }
  function saveSet(set) {
    try { localStorage.setItem(KEY, JSON.stringify([...set])); } catch (e) {}
  }
  function keyOf(msg) { return (msg.title || '') + '::' + (msg.time || ''); }

  window.MessagesRead = {
    isRead(msg) {
      // mock 自带 unread:false 视为已读；localStorage 已读集合也视为已读
      if (msg.unread === false) return true;
      return loadSet().has(keyOf(msg));
    },
    markRead(msg) {
      const set = loadSet();
      set.add(keyOf(msg));
      saveSet(set);
    },
    markAllReadFor(role) {
      const list = window.filterMessagesByRole(role);
      const set = loadSet();
      list.forEach(m => set.add(keyOf(m)));
      saveSet(set);
    },
    unreadCount(role) {
      const list = window.filterMessagesByRole(role);
      const set = loadSet();
      return list.filter(m => m.unread !== false && !set.has(keyOf(m))).length;
    },
    clear() { saveSet(new Set()); }
  };
})();
