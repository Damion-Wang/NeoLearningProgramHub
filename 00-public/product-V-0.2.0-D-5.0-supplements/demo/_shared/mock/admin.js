// 共享 mock · 管理端账号上下文
// 单 source · 24 名 members + currentAdmin + 多管理员 list
// 被消费方：build-v2/login.* / hall（avatar）/ mgthome（学员表）/ proconfig（板块 3 人员名单）/ massagemgt（recipient picker）
//
// 工程纪律 N · 跨场域产出物单 store；纪律 B · 跨页 mock 单点
window.AdminCtx = (function () {
  // 24 学员（含 2 多角色管理员）· 跟 _shared/mock/project.js DEMO_ACCOUNTS 中 u1/u2/u3 同源
  const members = [
    { id: 'u1',  name: '赵工',    account: 'zhaog',    email: 'zhao@demo.neolearning.com',  contact: '13800000001', dept: '销售部',   level: '区域经理',   isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u2',  name: 'HR 王',   account: 'wangj',    email: 'hr@demo.neolearning.com',    contact: '13800000002', dept: '人力资源', level: 'HR Director', isLearner: true,  isAdmin: true,  hasFirstLogin: true  },
    { id: 'u3',  name: '陈总',    account: 'chenz',    email: 'admin@demo.neolearning.com', contact: '13800000003', dept: '总裁办',   level: 'CEO',       isLearner: true,  isAdmin: true,  hasFirstLogin: true  },
    { id: 'u4',  name: '李明',    account: 'lim',      email: 'liming@x.com',                contact: '13800000004', dept: '设计部',   level: '主管',       isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u5',  name: '张丽',    account: 'zhangl',   email: 'zhangli@x.com',               contact: '13800000005', dept: '生产部',   level: '组长',       isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u6',  name: '王勇',    account: 'wangy',    email: 'wangyong@x.com',              contact: '13800000006', dept: '采购部',   level: '主管',       isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u7',  name: '刘洋',    account: 'liuy',     email: 'liuyang@x.com',               contact: '13800000007', dept: '销售部',   level: '组长',       isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u8',  name: '陈静',    account: 'chenj',    email: 'chenjing@x.com',              contact: '13800000008', dept: '财务部',   level: '主管',       isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u9',  name: '何颖',    account: 'hey',      email: 'heying@x.com',                contact: '13800000009', dept: '研发部',   level: '组长',       isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u10', name: '吕菲',    account: 'lvf',      email: 'lvfei@x.com',                 contact: '13800000010', dept: '研发部',   level: '组长',       isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u11', name: '周斌',    account: 'zhoub',    email: 'zhoubin@x.com',               contact: '13800000011', dept: '销售部',   level: '主管',       isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u12', name: '吴敏',    account: 'wum',      email: 'wumin@x.com',                 contact: '13800000012', dept: '生产部',   level: '主管',       isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u13', name: '徐强',    account: 'xuq',      email: 'xuqiang@x.com',               contact: '13800000013', dept: '物流部',   level: '组长',       isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u14', name: '胡涛',    account: 'hut',      email: 'hutao@x.com',                 contact: '13800000014', dept: '采购部',   level: '组长',       isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u15', name: '马玲',    account: 'mal',      email: 'maling@x.com',                contact: '13800000015', dept: '行政部',   level: '主管',       isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u16', name: '黄勇',    account: 'huangy',   email: 'huangyong@x.com',             contact: '13800000016', dept: '销售部',   level: '组长',       isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u17', name: '林娜',    account: 'linn',     email: 'linna@x.com',                 contact: '13800000017', dept: '生产部',   level: '主管',       isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u18', name: '郑磊',    account: 'zhengl',   email: 'zhenglei@x.com',              contact: '13800000018', dept: '财务部',   level: '组长',       isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u19', name: '罗佳',    account: 'luoj',     email: 'luojia@x.com',                contact: '13800000019', dept: '客服部',   level: '主管',       isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u20', name: '高峰',    account: 'gaof',     email: 'gaofeng@x.com',               contact: '13800000020', dept: '研发部',   level: '主管',       isLearner: true,  isAdmin: false, hasFirstLogin: true  },
    { id: 'u21', name: '梁晨',    account: 'liangc',   email: 'liangchen@x.com',             contact: '13800000021', dept: '销售部',   level: '组长',       isLearner: true,  isAdmin: false, hasFirstLogin: false },
    { id: 'u22', name: '田静',    account: 'tianj',    email: 'tianjing@x.com',              contact: '13800000022', dept: '生产部',   level: '组长',       isLearner: true,  isAdmin: false, hasFirstLogin: false },
    { id: 'u23', name: '邓伟',    account: 'dengw',    email: 'dengwei@x.com',               contact: '13800000023', dept: '采购部',   level: '组长',       isLearner: true,  isAdmin: false, hasFirstLogin: false },
    { id: 'u24', name: '冯丽',    account: 'fengl',    email: 'fengli@x.com',                contact: '13800000024', dept: '物流部',   level: '组长',       isLearner: true,  isAdmin: false, hasFirstLogin: false }
  ];

  // 其他管理员（用于 multi-admin 可见性 mock · 静态身份）
  const otherAdmins = [
    { id: 'admin-hr-wang', memberId: 'u2' },
    { id: 'admin-chen',    memberId: 'u3' }
  ];

  // 默认密码（项目级 · 后续新增成员 + 重置密码用）
  const defaultPassword = 'demo2026';

  // 工具：按 id 查
  function findMember(id) { return members.find(m => m.id === id) || null; }
  function findByEmail(email) { return members.find(m => m.email === email) || null; }
  function findByName(name) { return members.find(m => m.name === name) || null; }

  // v1.3 · 取 surname / 首字符 · 兼容"HR 王"→"王" / "陈总"→"陈" / "赵工"→"赵"
  // 跨页统一使用：hall/lecture/practice/mgthome/proconfig/massagemgt 的 avatar firstChar 都走这个
  function pickSurname(name) {
    if (!name) return '';
    const cleaned = String(name).trim();
    const cn = cleaned.match(/[一-龥]/g);
    if (cn && cn.length) return cn[0];   // 第一个汉字（"HR 王"→"王" 因为 H 和 R 不是汉字）
    return cleaned.charAt(0);
  }

  // v1.3 · currentAdmin 改为 getter · 按 Session.memberId 派生
  // 落库：仅当 Session.role === 'admin' 或 'learner+admin' 时 mover 是管理员
  // fallback：未登录 / 找不到 member · 给一个空对象（避免下游 .name 报错）
  const ctx = {
    members,
    otherAdmins,
    defaultPassword,
    findMember,
    findByEmail,
    findByName,
    pickSurname
  };

  Object.defineProperty(ctx, 'currentAdmin', {
    enumerable: true,
    get() {
      const sess = (window.Session && window.Session.get && window.Session.get()) || {};
      const m = (sess.memberId && findMember(sess.memberId))
        || (sess.account && findByEmail(sess.account))
        || null;
      const display = (sess.display) || (m && m.name) || '';
      const surname = pickSurname(display);
      const level   = (m && m.level) || '';
      return {
        id:       m ? m.id : null,
        memberId: m ? m.id : null,
        name:     display,
        surname:  surname,
        // role 字段：管理员显示 level（"CEO" / "HR Director"）· 多角色拼接
        role:     sess.role === 'learner+admin'
                    ? (level ? level + ' · 多角色' : '多角色')
                    : (level || ''),
        // canSwitchPort：基于 Session.role
        canSwitchPort: sess.role === 'learner+admin'
      };
    }
  });

  return ctx;
})();
