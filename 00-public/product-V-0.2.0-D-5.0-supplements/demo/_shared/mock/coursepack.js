// 共享 mock · 课程包（CRS-XXX / ACT-XXX-XX）
// 单 source · 8 课 29 Activity · proconfig + hall + lecture + practice + recap 全消费这一份
// id 命名：CRS-001~008 / ACT-XXX-NN（NN 从 01 起）
//
// 双视角：
//   admin 视角（proconfig）：按 id 顺序看 8 课结构 + 关联里程碑
//   learner 视角（hall）：按 status 看进度 + 当前推进课
//
// status 字段（learner 视角 demo 进度）：
//   completed / progress / notstarted
window.COURSE_PACK = [
  {
    id: 'CRS-001', name: '角色认知',
    summary: '从业务骨干到管理者的身份转换',
    progress: '3/3', status: 'completed',
    color: ['#7CA873', '#9EBE96'],
    activities: [
      { id: 'ACT-001-01', aid: 1, title: 'A1 · 从骨干到管理者',  type: 'lecture',  minutes: 16, status: 'completed', target: 'lecture-ppt' },
      { id: 'ACT-001-02', aid: 2, title: 'A2 · POLC 四职责',     type: 'lecture',  minutes: 14, status: 'completed', target: 'lecture-ppt' },
      { id: 'ACT-001-03', aid: 3, title: 'A3 · 角色认知小结',     type: 'recap',    minutes: 10, status: 'completed', target: 'recap',
        relatedActivities: ['ACT-001-01', 'ACT-001-02'] }
    ]
  },
  {
    id: 'CRS-002', name: '横向协作',
    summary: '跨部门 / 跨团队场景下的沟通与影响',
    progress: '3/5', status: 'progress', current: true,
    color: ['#D97757', '#E89B6E'],
    activities: [
      { id: 'ACT-002-01', aid: 1, title: 'A1 · 跨部门协作的本质',     type: 'lecture',  minutes: 18, status: 'completed', target: 'lecture-ppt' },
      { id: 'ACT-002-02', aid: 2, title: 'A2 · PIN 法三层模型',        type: 'lecture',  minutes: 22, status: 'completed', target: 'lecture-ppt' },
      { id: 'ACT-002-03', aid: 3, title: 'A3 · PIN 法实战演练',        type: 'practice', minutes: 35, status: 'progress',  target: 'practice-intro' },
      { id: 'ACT-002-04', aid: 4, title: 'A4 · 利益相关方地图',        type: 'lecture',  minutes: 16, status: 'notstarted', target: 'lecture-ppt' },
      { id: 'ACT-002-05', aid: 5, title: 'A5 · 横向协作 Course 小结', type: 'recap',    minutes: 12, status: 'locked',     target: 'recap',
        relatedActivities: ['ACT-002-01', 'ACT-002-02', 'ACT-002-03', 'ACT-002-04'] }
    ]
  },
  {
    id: 'CRS-003', name: '辅导反馈',
    summary: '给下属做有效的辅导和正负反馈',
    progress: '1/4', status: 'progress',
    color: ['#D97757', '#E89B6E'],
    activities: [
      { id: 'ACT-003-01', aid: 1, title: 'A1 · GROW 教练法',     type: 'lecture',  minutes: 20, status: 'completed', target: 'lecture-ppt' },
      { id: 'ACT-003-02', aid: 2, title: 'A2 · SBI 反馈框架',     type: 'lecture',  minutes: 18, status: 'progress',  target: 'lecture-ppt' },
      { id: 'ACT-003-03', aid: 3, title: 'A3 · 反馈对练',         type: 'practice', minutes: 30, status: 'notstarted', target: 'practice-intro' },
      { id: 'ACT-003-04', aid: 4, title: 'A4 · 辅导反馈小结',     type: 'recap',    minutes: 10, status: 'locked',     target: 'recap',
        relatedActivities: ['ACT-003-01', 'ACT-003-02', 'ACT-003-03'] }
    ]
  },
  {
    id: 'CRS-004', name: '目标拆解',
    summary: '把模糊业务目标拆解为可执行任务',
    progress: '0/4', status: 'notstarted',
    color: ['#B8AFA6', '#D8CFC4'],
    activities: [
      { id: 'ACT-004-01', aid: 1, title: 'A1 · 业务目标拆解原则', type: 'lecture',  minutes: 18, status: 'notstarted', target: 'lecture-ppt' },
      { id: 'ACT-004-02', aid: 2, title: 'A2 · OKR 与 KPI 衔接',  type: 'lecture',  minutes: 18, status: 'notstarted', target: 'lecture-ppt' },
      { id: 'ACT-004-03', aid: 3, title: 'A3 · 目标拆解对练',      type: 'practice', minutes: 28, status: 'notstarted', target: 'practice-intro' },
      { id: 'ACT-004-04', aid: 4, title: 'A4 · 目标拆解小结',      type: 'recap',    minutes: 10, status: 'locked',     target: 'recap',
        relatedActivities: ['ACT-004-01', 'ACT-004-02', 'ACT-004-03'] }
    ]
  },
  {
    id: 'CRS-005', name: '有效授权',
    summary: '在管太多和管太少之间找平衡',
    progress: '0/3', status: 'notstarted',
    color: ['#B8AFA6', '#D8CFC4'],
    activities: [
      { id: 'ACT-005-01', aid: 1, title: 'A1 · 授权矩阵 RACI',      type: 'lecture',  minutes: 18, status: 'notstarted', target: 'lecture-ppt' },
      { id: 'ACT-005-02', aid: 2, title: 'A2 · 授权对话演练',        type: 'practice', minutes: 28, status: 'notstarted', target: 'practice-intro' },
      { id: 'ACT-005-03', aid: 3, title: 'A3 · 有效授权小结',        type: 'recap',    minutes: 10, status: 'locked',     target: 'recap',
        relatedActivities: ['ACT-005-01', 'ACT-005-02'] }
    ]
  },
  {
    id: 'CRS-006', name: '人员激励',
    summary: '让团队成员有动力、有方向',
    progress: '0/4', status: 'notstarted',
    color: ['#B8AFA6', '#D8CFC4'],
    activities: [
      { id: 'ACT-006-01', aid: 1, title: 'A1 · 内驱外驱诊断',         type: 'lecture',  minutes: 18, status: 'notstarted', target: 'lecture-ppt' },
      { id: 'ACT-006-02', aid: 2, title: 'A2 · 期望理论与目标设定',   type: 'lecture',  minutes: 18, status: 'notstarted', target: 'lecture-ppt' },
      { id: 'ACT-006-03', aid: 3, title: 'A3 · 激励对话演练',         type: 'practice', minutes: 28, status: 'notstarted', target: 'practice-intro' },
      { id: 'ACT-006-04', aid: 4, title: 'A4 · 人员激励小结',         type: 'recap',    minutes: 10, status: 'locked',     target: 'recap',
        relatedActivities: ['ACT-006-01', 'ACT-006-02', 'ACT-006-03'] }
    ]
  },
  {
    id: 'CRS-007', name: '向上影响',
    summary: '与上级有效沟通和资源争取',
    progress: '0/3', status: 'notstarted',
    color: ['#B8AFA6', '#D8CFC4'],
    activities: [
      { id: 'ACT-007-01', aid: 1, title: 'A1 · 向上沟通三大场景',     type: 'lecture',  minutes: 18, status: 'notstarted', target: 'lecture-ppt' },
      { id: 'ACT-007-02', aid: 2, title: 'A2 · 资源争取实战',         type: 'practice', minutes: 28, status: 'notstarted', target: 'practice-intro' },
      { id: 'ACT-007-03', aid: 3, title: 'A3 · 向上影响小结',         type: 'recap',    minutes: 10, status: 'locked',     target: 'recap',
        relatedActivities: ['ACT-007-01', 'ACT-007-02'] }
    ]
  },
  {
    id: 'CRS-008', name: '过程管控',
    summary: '团队工作过程的监控与调整',
    progress: '0/3', status: 'notstarted',
    color: ['#B8AFA6', '#D8CFC4'],
    activities: [
      { id: 'ACT-008-01', aid: 1, title: 'A1 · 看板节奏与例会',       type: 'lecture',  minutes: 18, status: 'notstarted', target: 'lecture-ppt' },
      { id: 'ACT-008-02', aid: 2, title: 'A2 · 异常预警与纠偏',       type: 'lecture',  minutes: 18, status: 'notstarted', target: 'lecture-ppt' },
      { id: 'ACT-008-03', aid: 3, title: 'A3 · 过程管控小结',         type: 'recap',    minutes: 10, status: 'locked',     target: 'recap',
        relatedActivities: ['ACT-008-01', 'ACT-008-02'] }
    ]
  }
];

// 工具：扁平 29 Activity / 按课 id 查 / 按 ACT-id 查
window.CoursePack = (function () {
  const flat = [];
  window.COURSE_PACK.forEach(c => {
    c.activities.forEach(a => flat.push(Object.assign({}, a, {
      courseId: c.id,
      courseName: c.name,
      // 兼容 hall 旧用法 course.id 是数字 1-8
      courseNumeric: parseInt(c.id.replace('CRS-', ''), 10)
    })));
  });
  return {
    courses: window.COURSE_PACK,
    activities: flat,
    findCourse(id) {
      // 接受 'CRS-002' 或数字 2 或 '2'
      if (typeof id === 'number' || /^\d+$/.test(id)) {
        const n = +id;
        return window.COURSE_PACK.find(c => parseInt(c.id.replace('CRS-', ''), 10) === n) || null;
      }
      return window.COURSE_PACK.find(c => c.id === id) || null;
    },
    findActivity(actId) {
      return flat.find(a => a.id === actId) || null;
    },
    totalActivities() { return flat.length; }
  };
})();
