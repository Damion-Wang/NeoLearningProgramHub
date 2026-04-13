const BAND_RULES = [
  { key: 'excellent', label: '优', min100: 90, max100: 100 },
  { key: 'good', label: '良', min100: 70, max100: 89 },
  { key: 'pass', label: '合格', min100: 40, max100: 69 },
  { key: 'poor', label: '待提升', min100: 0, max100: 39 }
];

export const BEI_10_INDICATORS = {
  systemsThinking: {
    id: 'systemsThinking',
    name: '系统思维',
    definition: '在分析和处理问题时，站在全局视角识别关联并把握问题本质。',
    corePoints: ['逻辑条理', '思维广度', '思维深度', '思维高度'],
    expectedByBand: {
      excellent: '具备全局视角，能多维拆解复杂问题并提出系统方案。',
      good: '能在已知维度内做逻辑清晰分析，并兼顾多个视角。',
      pass: '能在限定范围内完成基本分析，但多为表层原因。',
      poor: '分析碎片化、逻辑断裂，常停留于表象。'
    }
  },
  roleTransition: {
    id: 'roleTransition',
    name: '角色转身',
    definition: '从做事者转向带人者，调整时间精力分配并建立管理方法。',
    corePoints: ['角色认知', '团队发展', '工作转型'],
    expectedByBand: {
      excellent: '管理投入明显，能系统带人并推动团队能力成长。',
      good: '主动减少亲力亲为，建立基础机制并定期辅导成员。',
      pass: '有角色转变意识，但管理动作稳定性不足。',
      poor: '仍以个人任务为主，忽视团队管理与成员发展。'
    }
  },
  delegation: {
    id: 'delegation',
    name: '授权予人',
    definition: '将合适职责权限授予合适人员，并通过跟踪支持形成闭环。',
    corePoints: ['授权意识', '授权技巧与措施', '跟踪与监控'],
    expectedByBand: {
      excellent: '能做人岗匹配授权，权责清晰并持续动态监控。',
      good: '能主动授权并提供过程支持，出现偏差可及时介入。',
      pass: '可做基础授权，但权责匹配与过程跟踪仍不稳定。',
      poor: '授权随意或拒绝授权，过度控制且缺乏有效支持。'
    }
  },
  motivation: {
    id: 'motivation',
    name: '激励员工',
    definition: '识别员工需求并运用多元激励手段激发团队内生动力。',
    corePoints: ['激励意识', '激励技巧与措施'],
    expectedByBand: {
      excellent: '能精准识别个体动机并设计差异化激励方案。',
      good: '能主动沟通动机并使用常见激励手段稳定士气。',
      pass: '有激励动作但偏单一，持续性和针对性不足。',
      poor: '激励意识弱，常忽视认可反馈与需求差异。'
    }
  },
  coaching: {
    id: 'coaching',
    name: '指导下属',
    definition: '具有培养发展他人的意愿和能力，通过有效方式帮助下属提升能力、实现成长。',
    corePoints: ['指导意愿', '指导方式方法', '发展规划'],
    expectedByBand: {
      excellent: '视培养下属为核心职责，能制定个性化发展计划，善用多种辅导方式。',
      good: '有培养意识，能针对薄弱环节提供针对性辅导，定期做成长回顾。',
      pass: '在被要求时能提供基本辅导，但缺乏主动性和系统性。',
      poor: '缺少培养下属的意愿或能力，不关注员工发展。'
    }
  },
  collaboration: {
    id: 'collaboration',
    name: '高效协作',
    definition: '主动与团队内外利益相关方建立协作关系，推动跨边界合作并妥善处理冲突。',
    corePoints: ['协作意愿', '协作策略', '冲突处理'],
    expectedByBand: {
      excellent: '主动构建跨部门协作网络，能在利益冲突中找到共赢方案。',
      good: '有协作意识，能与主要利益相关方保持良好工作关系。',
      pass: '在被要求时能配合协作，但缺乏主动性，面对冲突倾向回避。',
      poor: '协作意愿低，倾向单打独斗或本位主义，冲突处理能力弱。'
    }
  },
  communication: {
    id: 'communication',
    name: '高效沟通',
    definition: '以清晰表达、有效倾听和对象化策略推动协作达成。',
    corePoints: ['主动沟通', '倾听与理解', '策略适配'],
    expectedByBand: {
      excellent: '在复杂场景下仍能高效对齐、化解分歧并达成共识。',
      good: '表达清晰且能倾听，能按对象调整沟通策略。',
      pass: '沟通基本清楚，但复杂场景处理能力不足。',
      poor: '被动沟通、以自我为中心，策略单一且效果差。'
    }
  },
  performanceManagement: {
    id: 'performanceManagement',
    name: '绩效管理',
    definition: '围绕组织目标设定绩效、过程跟踪、评估反馈与改进。',
    corePoints: ['目标设定', '过程管理', '评估与反馈'],
    expectedByBand: {
      excellent: '能完成目标对齐、过程追踪与面谈改进闭环。',
      good: '能制定合理绩效计划并进行持续跟踪反馈。',
      pass: '能执行基础绩效动作，但方法深度不足。',
      poor: '目标与执行脱节，评估主观，反馈随意。'
    }
  },
  planningExecution: {
    id: 'planningExecution',
    name: '计划执行',
    definition: '围绕目标做任务拆解、资源统筹、过程监控与动态纠偏。',
    corePoints: ['目标导向', '制定计划', '协调资源', '落实跟进'],
    expectedByBand: {
      excellent: '目标拆解清晰，资源统筹与纠偏机制成熟。',
      good: '计划细化合理，资源协调和执行跟进较稳定。',
      pass: '能做基础计划与执行，但复杂冲突处理较弱。',
      poor: '目标模糊、计划粗放，执行偏救火式。'
    }
  },
  problemSolving: {
    id: 'problemSolving',
    name: '问题解决',
    definition: '及时发现问题并分析根因，制定并推动有效解决方案落地。',
    corePoints: ['问题意识', '分析问题', '解决问题'],
    expectedByBand: {
      excellent: '能前瞻预警、深度归因并提出根本性方案。',
      good: '能结构化拆解问题并提出可执行多方案。',
      pass: '可处理常规问题，但复杂问题处理深度不足。',
      poor: '察觉迟缓、分析混乱、方案难落地。'
    }
  }
};

// 新ID直接对应BEI指标，旧ID通过映射兼容
export const CAPABILITY_INDICATOR_MAPPING = {
  // 新ID → 自身（直接查找）
  systemsThinking: 'systemsThinking',
  roleTransition: 'roleTransition',
  delegation: 'delegation',
  motivation: 'motivation',
  coaching: 'coaching',
  collaboration: 'collaboration',
  communication: 'communication',
  performanceManagement: 'performanceManagement',
  planningExecution: 'planningExecution',
  problemSolving: 'problemSolving',
  // 角色扩展维度 → 最相关的通用指标
  customerManagement: 'communication',
  businessCoaching: 'performanceManagement',
  dataAnalysis: 'systemsThinking',
  techDecision: 'systemsThinking',
  projectManagement: 'planningExecution',
  knowledgeManagement: 'roleTransition',
  qualityAssurance: 'problemSolving',
  // 旧ID兼容（逐步淘汰）
  'role-awareness': 'roleTransition',
  'task-management': 'planningExecution',
  'people-management': 'motivation',
  'meeting-management': 'communication',
  'upward-management': 'communication',
  'goal-management': 'planningExecution',
  'customer-management': 'communication',
  'business-coaching': 'performanceManagement',
  'data-analysis': 'systemsThinking',
  'tech-decision': 'systemsThinking',
  'project-management': 'planningExecution',
  'knowledge-management': 'roleTransition',
  'quality-assurance': 'problemSolving',
};

export const BEI_QUESTION_GUIDES = {
  position: {
    type: '基础信息',
    objective: '确认管理边界和组织位置',
    requiredFields: ['岗位名称', '团队规模', '汇报对象']
  },
  keyTasks: {
    type: '任务背景',
    objective: '识别近三个月核心任务及优先级',
    requiredFields: ['任务清单', '业务目标', '优先级']
  },
  criticalEvent: {
    type: '成功事件',
    objective: '按 STAR+DSTF 采集正面行为证据（行动、对话原话、当时想法、感受）',
    requiredFields: ['情境', '关键行动', '对话原话', '当时想法', '结果数据']
  },
  negativeEvent: {
    type: '挫折事件',
    objective: '按 STAR+DSTF 采集负面行为证据，重点获取反思和归因',
    requiredFields: ['情境', '关键行动', '当时想法', '感受反思', '结果与教训']
  },
  successFactors: {
    type: '成功要素',
    objective: '提炼岗位关键成功因素',
    requiredFields: ['要素名称', '实际行为', '验证方式']
  },
  growthFocus: {
    type: '成长目标',
    objective: '确定90天提升重点及优先级依据',
    requiredFields: ['2-3项能力', '优先级', '原因/场景']
  }
};

export const getBandByScore100 = (score) => {
  if (score === null || score === undefined) return null;
  if (score >= 90) return BAND_RULES[0];
  if (score >= 70) return BAND_RULES[1];
  if (score >= 40) return BAND_RULES[2];
  return BAND_RULES[3];
};

export const getIndicatorByCapability = (capabilityId) => {
  // 新ID直接在BEI_10_INDICATORS中查找
  if (BEI_10_INDICATORS[capabilityId]) return BEI_10_INDICATORS[capabilityId];
  // 旧ID或扩展ID通过映射查找
  const indicatorId = CAPABILITY_INDICATOR_MAPPING[capabilityId];
  return indicatorId ? (BEI_10_INDICATORS[indicatorId] || null) : null;
};

export const buildExpectedPerformance = (capabilityId, score) => {
  const indicator = getIndicatorByCapability(capabilityId);
  if (!indicator) {
    return { bandLabel: '待校准', behavior: '当前能力暂缺少可引用的行为标准，可通过BEI访谈或场景训练补齐证据。', indicatorName: '' };
  }
  const band = getBandByScore100(score);
  if (!band) {
    return { bandLabel: '待校准', behavior: '当前证据不足，可通过BEI深度访谈、问卷评估或场景训练补充。', indicatorName: indicator.name };
  }
  return {
    bandLabel: `${band.label}（${band.min100}-${band.max100}分）`,
    behavior: indicator.expectedByBand[band.key],
    indicatorName: indicator.name
  };
};

export const buildQuestionFollowupHint = (questionId, missingFields = []) => {
  const guide = BEI_QUESTION_GUIDES[questionId];
  if (!guide || !missingFields.length) return '';
  return `该题属于「${guide.type}」，目标是${guide.objective}。请补充：${missingFields.join('、')}。`;
};
