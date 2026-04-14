/**
 * Signal Detection — classifies learner signals into 8 types (私教系统 §3.1).
 *
 * Teaching signals (①②③④⑥): handled by LecturerPersona
 * Coaching signals (⑤⑦⑧): handled by CoachPersona
 */

export const SIGNAL_TYPES = {
  '①': { name: 'missing', label: '缺概念', handler: 'teaching' },
  '②': { name: 'forgotten', label: '遗忘', handler: 'teaching' },
  '③': { name: 'misapplied', label: '误用', handler: 'teaching' },
  '④': { name: 'wrong_tool', label: '选错工具', handler: 'teaching' },
  '⑤': { name: 'know_do_gap', label: '知行差距', handler: 'coaching' },
  '⑥': { name: 'misconception', label: '错误心智模型', handler: 'teaching' },
  '⑦': { name: 'metacognitive_bias', label: '元认知偏差', handler: 'coaching' },
  '⑧': { name: 'context_mismatch', label: '语境错配', handler: 'coaching' },
};

// Rule-based patterns for Ph1 detection
const SIGNAL_PATTERNS = {
  '①': [/不太了解|没听过|什么意思|不知道/],
  '②': [/忘了|记不清|以前学过|好像学过/],
  '③': [/我觉得应该用|这个方法|试了但|效果不好/],
  '⑤': [/知道.*做不到|道理.*懂|说起来容易/],
  '⑥': [/一直以为|不就是|本来就|就是要|就应该|不需要.*学|觉得.*不需要/],
  '⑦': [/我觉得我挺好|没什么问题|都掌握了|没出过.*问题|从来没.*问题|一直都很好/],
  '⑧': [/之前.*这样做|一直.*这个方法|换了.*还是/],
};

/**
 * Classify a learner signal based on message + context.
 * @param {Object} params
 * @param {string} params.userMessage - User's message text
 * @param {number} params.responseDepth - How deep/detailed the response is (0-1)
 * @param {number|null} params.masteryScore - Prior mastery score if available
 * @param {number} params.confidence - User's self-reported confidence (0-1)
 * @param {number|null} params.behaviorScore - Observed behavior score if available
 * @param {Array} params.errorHistory - Previous error records
 * @returns {{ primary: string|null, confidence: number, severity: string, signals: Array }}
 */
export function classifySignal({
  userMessage = '',
  responseDepth = 0.5,
  masteryScore = null,
  confidence = 0.5,
  behaviorScore = null,
  errorHistory = [],
} = {}) {
  const detected = [];

  // Pattern matching
  for (const [signal, patterns] of Object.entries(SIGNAL_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(userMessage)) {
        detected.push({ signal, source: 'pattern', confidence: 0.6 });
        break;
      }
    }
  }

  // Context-based inference
  if (masteryScore === null && responseDepth < 0.3) {
    detected.push({ signal: '①', source: 'context', confidence: 0.7 });
  }
  if (masteryScore > 0.6 && responseDepth < 0.3) {
    detected.push({ signal: '②', source: 'context', confidence: 0.7 });
  }
  if (masteryScore > 0.8 && behaviorScore !== null && behaviorScore < 0.4) {
    detected.push({ signal: '⑤', source: 'context', confidence: 0.8 });
  }
  if (confidence > 0.8 && responseDepth > 0.6 && masteryScore !== null && masteryScore < 0.4) {
    detected.push({ signal: '⑥', source: 'context', confidence: 0.7 });
  }

  // Select primary signal (highest confidence)
  if (detected.length === 0) {
    return { primary: null, confidence: 0, severity: 'low', signals: [] };
  }

  detected.sort((a, b) => b.confidence - a.confidence);
  const primary = detected[0];

  // Severity based on confidence level
  const severity = primary.confidence > 0.8 ? 'high'
    : primary.confidence > 0.6 ? 'medium' : 'low';

  return {
    primary: primary.signal,
    confidence: primary.confidence,
    severity,
    signals: detected,
  };
}
