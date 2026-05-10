// 共享 mock · 课程级 / Activity 级 聚合统计
// 单 source · mgthome「内容互动」widget + 学员表展开样例 + proconfig 板块 6 全消费
// 跟 _shared/mock/coursepack.js (CRS-001~008 / ACT-XXX-XX) 一一对应
//
// 决策点（v1.3 自审 #2+#3）：结构归 coursepack.js · 统计归本文件 · 关注点分离
//
// Course 级字段：
//   started   number  起始学员数（最大 24）
//   completed number  已完成学员数
//   avgTime   number  平均学习时长（分钟）
//   hl        number  高光数（Course 维度）
//
// Activity 级字段：
//   started   number  起始学员数
//   completed number  已完成学员数
//   avgTime   number  平均学习时长（分钟）
//   highlights number 高光数

window.COURSE_STATS = {
  // === Course 级（按 CRS-id）===
  courses: {
    'CRS-001': { started: 24, completed: 22, avgTime: 38, hl: 34 },  // 角色认知
    'CRS-002': { started: 24, completed: 16, avgTime: 45, hl: 28 },  // 横向协作（current）
    'CRS-003': { started: 18, completed: 8,  avgTime: 42, hl: 18 },  // 辅导反馈
    'CRS-004': { started: 0,  completed: 0,  avgTime: 0,  hl: 0  },  // 目标拆解
    'CRS-005': { started: 0,  completed: 0,  avgTime: 0,  hl: 0  },  // 有效授权
    'CRS-006': { started: 0,  completed: 0,  avgTime: 0,  hl: 0  },  // 人员激励
    'CRS-007': { started: 0,  completed: 0,  avgTime: 0,  hl: 0  },  // 向上影响
    'CRS-008': { started: 0,  completed: 0,  avgTime: 0,  hl: 0  }   // 过程管控
  },

  // === Activity 级（按 ACT-XXX-XX）===
  activities: {
    // CRS-001 角色认知
    'ACT-001-01': { started: 24, completed: 24, avgTime: 18, highlights: 5 },
    'ACT-001-02': { started: 24, completed: 24, avgTime: 22, highlights: 8 },
    'ACT-001-03': { started: 24, completed: 22, avgTime: 25, highlights: 7 },

    // CRS-002 横向协作（current Course · A3 PIN 法实战演练 in progress）
    'ACT-002-01': { started: 24, completed: 24, avgTime: 18, highlights: 6 },
    'ACT-002-02': { started: 24, completed: 22, avgTime: 22, highlights: 8 },
    'ACT-002-03': { started: 22, completed: 16, avgTime: 35, highlights: 9 },
    'ACT-002-04': { started: 0,  completed: 0,  avgTime: 0,  highlights: 0 },
    'ACT-002-05': { started: 0,  completed: 0,  avgTime: 0,  highlights: 0 },

    // CRS-003 辅导反馈
    'ACT-003-01': { started: 18, completed: 14, avgTime: 20, highlights: 6 },
    'ACT-003-02': { started: 14, completed: 8,  avgTime: 18, highlights: 5 },
    'ACT-003-03': { started: 0,  completed: 0,  avgTime: 0,  highlights: 0 },
    'ACT-003-04': { started: 0,  completed: 0,  avgTime: 0,  highlights: 0 }
    // CRS-004 ~ CRS-008 全 0 · 渲染时通过 getDefault 返回 0 默认值
  }
};

window.CourseStats = (function () {
  const empty = { started: 0, completed: 0, avgTime: 0, hl: 0, highlights: 0 };
  return {
    findCourse(id) {
      return window.COURSE_STATS.courses[id] || empty;
    },
    findActivity(id) {
      return window.COURSE_STATS.activities[id] || empty;
    },
    /** 合并 COURSE_PACK[i].course + COURSE_STATS.course[i] · 用于 mgthome courses 表渲染 */
    mergeCourse(course) {
      return Object.assign({}, course, this.findCourse(course.id));
    },
    /** 合并 activity + activity-stats */
    mergeActivity(activity) {
      return Object.assign({}, activity, this.findActivity(activity.id));
    }
  };
})();
