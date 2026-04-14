/**
 * ScenarioContextSkill — 场景训练上下文构建工具。
 *
 * 当前为纯函数实现（buildScenarioTrainingSkill），不继承 SkillBase，
 * 因为它不涉及 LLM 调用、异步操作或 sideEffects——本质是数据组装工具。
 *
 * 如需后续升级为 SkillBase 子类（例如引入 LLM 动态推荐场景），
 * 应保留 buildScenarioTrainingSkill 作为兼容导出，内部委托给 execute()。
 */
import { getAllCapabilities, KNOWLEDGE_TOOLS } from '../store';
import { mapScenarioCapabilitiesToNames } from '../modules/assessmentEngine';

// 能力ID → KNOWLEDGE_TOOLS category 映射（场景能力匹配工具用）
// 每个能力直接映射到同名工具分类（扩展后每个维度都有工具）
const CATEGORY_BY_CAPABILITY = {
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
  customerManagement: 'customerManagement',
  businessCoaching: 'businessCoaching',
  dataAnalysis: 'dataAnalysis',
  techDecision: 'techDecision',
  projectManagement: 'projectManagement',
  knowledgeManagement: 'knowledgeManagement',
  qualityAssurance: 'qualityAssurance',
};

const unique = (items) => [...new Set((items || []).filter(Boolean))];

const getCapabilityNameMap = (role) => {
  const all = getAllCapabilities(role);
  return all.reduce((acc, item) => {
    acc[item.id] = item.name;
    return acc;
  }, {});
};

const matchTools = (scenario) => {
  const categories = unique(
    (scenario.capabilities || [])
      .map((capabilityId) => CATEGORY_BY_CAPABILITY[capabilityId])
      .filter(Boolean)
  );
  return KNOWLEDGE_TOOLS
    .filter((tool) => categories.includes(tool.category))
    .slice(0, 3)
    .map((tool) => ({ id: tool.id, name: tool.name, category: tool.category }));
};

const getLowAndUnscoredCapabilities = (user) => {
  const results = user?.assessmentResults || {};
  const low = [];
  const unscored = [];
  Object.entries(results).forEach(([capabilityId, score]) => {
    if (score === null || score === undefined) unscored.push(capabilityId);
    else if (score < 70) low.push(capabilityId);
  });
  return { low, unscored };
};

const buildBackground = (scenario, user, capabilityNameMap) => {
  const keyTask = (user?.beiProfile?.keyTasks || [])[0] || '';
  const challenge = (user?.beiProfile?.llmInsights?.currentChallenges || [])[0] || '';
  const criticalFact = (user?.beiProfile?.scenarioMaterials?.criticalFacts || [])[0] || '';
  const scenarioCapabilityNames = mapScenarioCapabilitiesToNames(scenario.capabilities, capabilityNameMap);
  const { low, unscored } = getLowAndUnscoredCapabilities(user);
  const lowNames = mapScenarioCapabilitiesToNames(low, capabilityNameMap);
  const unscoredNames = mapScenarioCapabilitiesToNames(unscored, capabilityNameMap);

  const parts = [scenario.description || ''];
  if (keyTask) parts.push(`你的关键任务：${keyTask}`);
  if (challenge) parts.push(`当前挑战：${challenge}`);
  if (criticalFact) parts.push(`访谈事实：${criticalFact}`);
  if (scenarioCapabilityNames.length) parts.push(`本场景聚焦能力：${scenarioCapabilityNames.join('、')}`);
  if (lowNames.length) parts.push(`你当前待提升能力：${lowNames.slice(0, 2).join('、')}`);
  if (unscoredNames.length) parts.push(`你当前待校准能力：${unscoredNames.slice(0, 2).join('、')}`);
  return parts.filter(Boolean).join('。');
};

const buildObjectives = (scenario, user, capabilityNameMap) => {
  const baseObjectives = scenario.objectives || [];
  const trainingTargets = (user?.beiProfile?.scenarioMaterials?.trainingTargets || []).slice(0, 2);
  const lowIds = getLowAndUnscoredCapabilities(user).low;
  const lowNames = mapScenarioCapabilitiesToNames(lowIds, capabilityNameMap).slice(0, 2);
  const derived = lowNames.map((name) => `通过本场景补强「${name}」的关键动作证据`);
  return unique([...baseObjectives, ...trainingTargets, ...derived]).slice(0, 5);
};

const buildRationale = (scenario, user, capabilityNameMap) => {
  const focusCapabilities = (user?.beiProfile?.llmInsights?.focusCapabilities || user?.beiProfile?.focusCapabilities || [])
    .map((item) => item.id)
    .filter(Boolean);
  const focusMatch = (scenario.capabilities || []).filter((id) => focusCapabilities.includes(id));
  const focusNames = mapScenarioCapabilitiesToNames(focusMatch, capabilityNameMap);

  const { low, unscored } = getLowAndUnscoredCapabilities(user);
  const lowMatch = (scenario.capabilities || []).filter((id) => low.includes(id));
  const unscoredMatch = (scenario.capabilities || []).filter((id) => unscored.includes(id));
  const lowNames = mapScenarioCapabilitiesToNames(lowMatch, capabilityNameMap);
  const unscoredNames = mapScenarioCapabilitiesToNames(unscoredMatch, capabilityNameMap);

  const rationale = [];
  if (focusNames.length) rationale.push(`匹配你的能力焦点：${focusNames.join('、')}`);
  if (lowNames.length) rationale.push(`覆盖待提升能力：${lowNames.join('、')}`);
  if (unscoredNames.length) rationale.push(`用于校准待校准能力：${unscoredNames.join('、')}`);
  if ((user?.beiProfile?.llmInsights?.currentChallenges || []).length) rationale.push('场景与BEI识别挑战高度相关');
  if (scenario.frequency === 'high') rationale.push('该场景出现频率高，训练收益更直接');
  return rationale.slice(0, 4);
};

export const buildScenarioTrainingSkill = (scenario, user) => {
  const capabilityNameMap = getCapabilityNameMap(user?.role);
  return {
    scenarioId: scenario.id,
    capabilityNameMap,
    personalizedBackground: buildBackground(scenario, user, capabilityNameMap),
    personalizedObjectives: buildObjectives(scenario, user, capabilityNameMap),
    matchedTools: matchTools(scenario),
    rationale: buildRationale(scenario, user, capabilityNameMap)
  };
};
