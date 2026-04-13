import { CAPABILITY_INDICATOR_MAPPING } from './beiCompetencyFramework';

const KEYWORD_RULES = [
  { words: ['目标', '拆解', '里程碑', '计划'], capabilityIds: ['performanceManagement', 'planningExecution', 'projectManagement'] },
  { words: ['汇报', '上级', '争取资源', '跨部门'], capabilityIds: ['collaboration', 'communication'] },
  { words: ['辅导', '反馈', '激励', '带教'], capabilityIds: ['coaching', 'motivation', 'businessCoaching'] },
  { words: ['客户', '商机', '转化'], capabilityIds: ['customerManagement', 'dataAnalysis'] },
  { words: ['技术', '方案', '质量', '故障'], capabilityIds: ['techDecision', 'qualityAssurance', 'projectManagement'] },
  { words: ['授权', '委派', '放手'], capabilityIds: ['delegation', 'roleTransition'] },
  { words: ['角色', '转型', '管理者'], capabilityIds: ['roleTransition', 'systemsThinking'] },
  { words: ['问题', '根因', '分析'], capabilityIds: ['problemSolving', 'systemsThinking'] },
];

const unique = (items) => [...new Set((items || []).filter(Boolean))];

const includesAny = (text, words) => words.some((word) => text.includes(word));

export const buildCapabilityNameMap = (capabilityList) =>
  capabilityList.reduce((acc, item) => {
    acc[item.id] = item.name;
    return acc;
  }, {});

export const buildBeiSignals = (user, capabilityList) => {
  const answers = user?.beiProfile?.answers || {};
  const diagnostics = user?.beiProfile?.interviewDiagnostics || {};
  const focusCapabilityIds = (user?.beiProfile?.llmInsights?.focusCapabilities || user?.beiProfile?.focusCapabilities || [])
    .map((item) => item.id)
    .filter(Boolean);
  const allText = Object.values(answers).join(' ');
  const signals = capabilityList.reduce((acc, capability) => {
    acc[capability.id] = { evidence: 0, uncertainty: 0, sourceNotes: [] };
    return acc;
  }, {});

  if (answers.position) {
    if (signals.roleTransition) signals.roleTransition.evidence += 1;
    if (signals.collaboration) signals.collaboration.evidence += 1;
  }
  if (answers.keyTasks) {
    if (signals.planningExecution) signals.planningExecution.evidence += 1;
    if (signals.performanceManagement) signals.performanceManagement.evidence += 1;
  }
  if (answers.successFactors) {
    if (signals.performanceManagement) signals.performanceManagement.evidence += 1;
    if (signals.coaching) signals.coaching.evidence += 1;
  }
  // 负面/挫折事件（BEI标准要求正反事件配对）
  if (answers.negativeEvent) {
    if (signals.problemSolving) signals.problemSolving.evidence += 1;
    if (signals.systemsThinking) signals.systemsThinking.evidence += 1;
    if (signals.communication) signals.communication.evidence += 1;
  }
  if (answers.growthFocus) {
    focusCapabilityIds.forEach((id) => {
      if (signals[id]) signals[id].evidence += 1;
    });
  }

  KEYWORD_RULES.forEach((rule) => {
    if (includesAny(allText, rule.words)) {
      rule.capabilityIds.forEach((capabilityId) => {
        if (signals[capabilityId]) signals[capabilityId].evidence += 1;
      });
    }
  });

  Object.entries(diagnostics).forEach(([questionId, info]) => {
    const gaps = info?.gaps || [];
    if (!gaps.length) return;
    const gapText = gaps.join(' ');
    if (/结果|数据|量化/.test(gapText)) {
      ['performanceManagement', 'planningExecution', 'dataAnalysis', 'projectManagement'].forEach((id) => {
        if (signals[id]) signals[id].uncertainty += 1;
      });
    }
    if (/行为|行动/.test(gapText)) {
      ['coaching', 'motivation', 'communication'].forEach((id) => {
        if (signals[id]) signals[id].uncertainty += 1;
      });
    }
    if (/情境|背景/.test(gapText) || questionId === 'position') {
      ['roleTransition', 'collaboration'].forEach((id) => {
        if (signals[id]) signals[id].uncertainty += 1;
      });
    }
  });

  focusCapabilityIds.forEach((id) => {
    if (signals[id]) signals[id].sourceNotes.push('来自BEI成长焦点');
  });

  return signals;
};

export const buildCapabilityPriority = (capabilityList, beiSignals) => {
  return capabilityList
    .map((capability) => {
      const signal = beiSignals[capability.id] || { evidence: 0, uncertainty: 0 };
      const uncovered = signal.evidence === 0 ? 1 : 0;
      return {
        capabilityId: capability.id,
        score: signal.uncertainty * 3 + uncovered * 2 + (signal.evidence > 0 ? 0 : 1)
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.capabilityId);
};

export const buildCrossValidationMeta = (capabilityList, scores, beiSignals) => {
  const byCapability = capabilityList.reduce((acc, capability) => {
    const signal = beiSignals[capability.id] || { evidence: 0, uncertainty: 0 };
    const score = scores[capability.id];
    let status = '待校准';
    if (score !== null && score !== undefined) {
      if (signal.uncertainty >= 2 || signal.evidence === 0) status = '需交叉验证';
      else status = '一致';
    }
    acc[capability.id] = {
      status,
      beiEvidence: signal.evidence,
      beiUncertainty: signal.uncertainty,
      indicatorId: CAPABILITY_INDICATOR_MAPPING[capability.id] || null
    };
    return acc;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    byCapability
  };
};

export const pickAdaptiveQuestionTemplates = (templates, capabilityPriority, count = 10) => {
  const selected = [];
  const selectedIds = new Set();

  capabilityPriority.forEach((capabilityId) => {
    const candidate = templates.find((template) =>
      !selectedIds.has(template.id) && (template.targets || []).includes(capabilityId)
    );
    if (candidate && selected.length < count) {
      selected.push(candidate);
      selectedIds.add(candidate.id);
    }
  });

  templates.forEach((template) => {
    if (!selectedIds.has(template.id) && selected.length < count) {
      selected.push(template);
      selectedIds.add(template.id);
    }
  });

  return selected.slice(0, count);
};

export const buildRoleTaskContext = (user) => {
  const keyTask = (user?.beiProfile?.keyTasks || [])[0] || '季度重点任务';
  const challenge = (user?.beiProfile?.llmInsights?.currentChallenges || [])[0] || '跨团队协同与执行落地';
  const focus = (user?.beiProfile?.growthFocus || [])[0] || '管理动作稳定性';
  const roleLabel = user?.roleLabel || '基层管理者';
  return { keyTask, challenge, focus, roleLabel };
};

export const mapScenarioCapabilitiesToNames = (capabilityIds, nameMap) =>
  unique((capabilityIds || []).map((id) => nameMap[id]).filter(Boolean));
