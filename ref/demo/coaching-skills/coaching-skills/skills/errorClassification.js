/**
 * Error Classification — aligned with 私教系统 Spec §18.
 *
 * Classifies learner errors into 6 subtypes across 4 main signal categories,
 * with 3 severity levels based on frequency, concept criticality, and downstream impact.
 *
 * Error type taxonomy (from Spec signal classification):
 *   ①-a  完全缺失 — never encountered this concept
 *   ①-b  碎片化   — partial/disorganized knowledge fragments
 *   ②    遗忘     — previously learned but decayed
 *   ③-a  情境错配 — right knowledge applied to wrong context
 *   ③-b  工具误选 — selected wrong tool/framework for the situation
 *   ⑥    错误心智模型 — actively wrong belief about how something works
 *
 * Severity determination:
 *   high:   prerequisite concept + frequency >= 3, OR misconception on prerequisite
 *   medium: prerequisite concept OR frequency >= 2
 *   low:    first occurrence on non-prerequisite concept
 */

/**
 * Error type registry with labels and default remediation strategies.
 */
export const ERROR_TYPES = {
  '①-a': {
    label: '知识完全缺失',
    category: 'knowledge_gap',
    defaultRemediation: '从基础概念开始，提供结构化讲解',
  },
  '①-b': {
    label: '知识碎片化',
    category: 'knowledge_gap',
    defaultRemediation: '帮助梳理已有知识碎片，建立系统框架',
  },
  '②': {
    label: '知识遗忘',
    category: 'retention',
    defaultRemediation: '间隔复习，用新场景重新激活已有记忆',
  },
  '③-a': {
    label: '情境错配',
    category: 'application',
    defaultRemediation: '对比正确和错误的应用场景，建立情境判断标准',
  },
  '③-b': {
    label: '工具误选',
    category: 'application',
    defaultRemediation: '展示工具适用边界，提供选择决策框架',
  },
  '⑥': {
    label: '错误心智模型/误解',
    category: 'misconception',
    defaultRemediation: '先暴露错误信念，再用反例+正例重建正确模型',
  },
};

/**
 * Severity levels ordered from low to high.
 */
export const SEVERITY_LEVELS = ['low', 'medium', 'high'];

/**
 * Determine error type from available evidence.
 *
 * Priority order (highest first):
 *   1. misconceptionDetected → ⑥
 *   2. toolMismatch → ③-b
 *   3. contextMismatch → ③-a
 *   4. masteryHistory with high past score + old date → ②
 *   5. masteryHistory with low score + some assessments → ①-b
 *   6. no masteryHistory or zero assessments → ①-a
 */
function determineType({ masteryHistory, misconceptionDetected, contextMismatch, toolMismatch }) {
  // Explicit flags take priority
  if (misconceptionDetected) return '⑥';
  if (toolMismatch) return '③-b';
  if (contextMismatch) return '③-a';

  // History-based classification
  if (!masteryHistory || masteryHistory.assessmentCount == null || masteryHistory.assessmentCount === 0) {
    // Never assessed — could be ①-a (no history at all) or ①-a (score === 0 with no count)
    if (masteryHistory && masteryHistory.score != null && masteryHistory.score > 0) {
      return '①-b'; // Has some score but no formal assessment count → fragmented
    }
    return '①-a';
  }

  // Has assessment history
  if (masteryHistory.score >= 0.6) {
    // Previously competent — likely forgotten
    return '②';
  }

  if (masteryHistory.score > 0 && masteryHistory.score < 0.6) {
    // Some knowledge but not solid — fragmented
    return '①-b';
  }

  // score === 0 or very low with assessments — still a gap
  return '①-a';
}

/**
 * Determine severity from frequency, prerequisite status, and error type.
 *
 * Severity matrix:
 *   high:   (isPrerequisite AND frequency >= 3) OR (misconception on prerequisite)
 *   medium: isPrerequisite OR frequency >= 2
 *   low:    everything else (first-time, non-prerequisite)
 */
function determineSeverity({ frequency = 1, isPrerequisite = false, type }) {
  const freq = frequency || 1;

  // Misconception on prerequisite is always high
  if (type === '⑥' && isPrerequisite) return 'high';

  // High: prerequisite + repeated
  if (isPrerequisite && freq >= 3) return 'high';

  // Medium: prerequisite OR moderate frequency
  if (isPrerequisite || freq >= 2) return 'medium';

  // Low: first occurrence, non-prerequisite
  return 'low';
}

/**
 * Generate remediation hint based on error type and severity.
 */
function generateRemediationHint(type, severity) {
  const errorDef = ERROR_TYPES[type];
  if (!errorDef) return '需要进一步诊断';

  const base = errorDef.defaultRemediation;

  if (severity === 'high') {
    return `【紧急】${base}。建议立即安排专项补救。`;
  }
  if (severity === 'medium') {
    return `${base}。建议在近期教学中重点关注。`;
  }
  return `${base}。`;
}

/**
 * Classify a learner error.
 *
 * @param {Object} params
 * @param {string} params.learnerResponse      — what the learner said/did
 * @param {string} params.conceptId            — which concept this relates to
 * @param {Object|null} params.masteryHistory   — { score: 0-1, assessmentCount: N, lastAssessedAt: ISO }
 * @param {number} [params.frequency=1]         — how many times this error has occurred
 * @param {boolean} [params.isPrerequisite=false] — is this a prerequisite concept
 * @param {boolean} [params.misconceptionDetected=false] — explicit misconception flag
 * @param {boolean} [params.contextMismatch=false]       — context mismatch flag
 * @param {boolean} [params.toolMismatch=false]          — tool selection error flag
 * @returns {{ type: string, severity: string, remediationHint: string, conceptId: string }}
 */
export function classifyError({
  learnerResponse,
  conceptId,
  masteryHistory = null,
  frequency = 1,
  isPrerequisite = false,
  misconceptionDetected = false,
  contextMismatch = false,
  toolMismatch = false,
} = {}) {
  const type = determineType({ masteryHistory, misconceptionDetected, contextMismatch, toolMismatch });
  const severity = determineSeverity({ frequency, isPrerequisite, type });
  const remediationHint = generateRemediationHint(type, severity);

  return {
    type,
    severity,
    remediationHint,
    conceptId,
  };
}
