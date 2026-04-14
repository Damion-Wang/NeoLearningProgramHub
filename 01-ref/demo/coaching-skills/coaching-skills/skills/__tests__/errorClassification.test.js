/**
 * Error Classification tests — aligned with 私教系统 Spec §18.
 *
 * Error types (from signal taxonomy):
 *   ①-a: complete missing (never learned)
 *   ①-b: fragmented (partial/disorganized knowledge)
 *   ②:   forgotten (previously learned, now lost)
 *   ③-a: context mismatch (right knowledge, wrong situation)
 *   ③-b: tool selection error (wrong tool for the job)
 *   ⑥:   misconception (actively wrong mental model)
 *
 * Severity: low / medium / high
 *   Based on: frequency + concept criticality (isPrerequisite) + downstream impact
 */

import { classifyError, ERROR_TYPES, SEVERITY_LEVELS } from '../errorClassification';

describe('Error Classification (私教系统 §18)', () => {
  // ==================== Type Registry ====================

  describe('ERROR_TYPES registry', () => {
    test('has 6 error subtypes', () => {
      expect(Object.keys(ERROR_TYPES)).toHaveLength(6);
    });

    test('①-a: complete missing', () => {
      expect(ERROR_TYPES['①-a']).toBeDefined();
      expect(ERROR_TYPES['①-a'].label).toContain('缺失');
    });

    test('①-b: fragmented knowledge', () => {
      expect(ERROR_TYPES['①-b']).toBeDefined();
      expect(ERROR_TYPES['①-b'].label).toContain('碎片');
    });

    test('②: forgotten', () => {
      expect(ERROR_TYPES['②']).toBeDefined();
      expect(ERROR_TYPES['②'].label).toContain('遗忘');
    });

    test('③-a: context mismatch', () => {
      expect(ERROR_TYPES['③-a']).toBeDefined();
      expect(ERROR_TYPES['③-a'].label).toContain('情境');
    });

    test('③-b: tool selection error', () => {
      expect(ERROR_TYPES['③-b']).toBeDefined();
      expect(ERROR_TYPES['③-b'].label).toContain('工具');
    });

    test('⑥: misconception', () => {
      expect(ERROR_TYPES['⑥']).toBeDefined();
      expect(ERROR_TYPES['⑥'].label).toContain('误解');
    });
  });

  // ==================== Severity Levels ====================

  describe('SEVERITY_LEVELS', () => {
    test('has low, medium, high', () => {
      expect(SEVERITY_LEVELS).toEqual(['low', 'medium', 'high']);
    });
  });

  // ==================== classifyError ====================

  describe('classifyError', () => {
    test('classifies ①-a when no mastery history (never learned)', () => {
      const result = classifyError({
        learnerResponse: '我不知道这个',
        conceptId: 'delegation',
        masteryHistory: null,
      });
      expect(result.type).toBe('①-a');
      expect(result.severity).toBeDefined();
      expect(SEVERITY_LEVELS).toContain(result.severity);
    });

    test('classifies ①-b when mastery history shows partial knowledge', () => {
      const result = classifyError({
        learnerResponse: '授权好像是...把事情分出去？',
        conceptId: 'delegation',
        masteryHistory: { score: 0.3, assessmentCount: 2 },
      });
      expect(result.type).toBe('①-b');
    });

    test('classifies ② when previously mastered but now wrong', () => {
      const result = classifyError({
        learnerResponse: '我忘了具体怎么做',
        conceptId: 'delegation',
        masteryHistory: { score: 0.8, assessmentCount: 5, lastAssessedAt: '2025-01-01' },
      });
      expect(result.type).toBe('②');
    });

    test('classifies ③-a for context mismatch', () => {
      const result = classifyError({
        learnerResponse: '用GROW模型来做绩效评估',
        conceptId: 'performance_review',
        masteryHistory: { score: 0.7, assessmentCount: 3 },
        contextMismatch: true,
      });
      expect(result.type).toBe('③-a');
    });

    test('classifies ③-b for tool selection error', () => {
      const result = classifyError({
        learnerResponse: '用STAR来做辅导对话',
        conceptId: 'coaching_conversation',
        masteryHistory: { score: 0.6, assessmentCount: 3 },
        toolMismatch: true,
      });
      expect(result.type).toBe('③-b');
    });

    test('classifies ⑥ when misconception detected', () => {
      const result = classifyError({
        learnerResponse: '授权就是放手不管',
        conceptId: 'delegation',
        masteryHistory: { score: 0.4, assessmentCount: 4 },
        misconceptionDetected: true,
      });
      expect(result.type).toBe('⑥');
    });

    test('severity = high when prerequisite + high frequency', () => {
      const result = classifyError({
        learnerResponse: '授权就是放手不管',
        conceptId: 'delegation',
        masteryHistory: { score: 0 },
        frequency: 3,
        isPrerequisite: true,
        misconceptionDetected: true,
      });
      expect(result.severity).toBe('high');
    });

    test('severity = low for first-time non-prerequisite error', () => {
      const result = classifyError({
        learnerResponse: '我不太确定',
        conceptId: 'advanced_facilitation',
        masteryHistory: null,
        frequency: 1,
        isPrerequisite: false,
      });
      expect(result.severity).toBe('low');
    });

    test('severity = medium for moderate frequency or prerequisite', () => {
      const result = classifyError({
        learnerResponse: '我不太确定',
        conceptId: 'feedback_basics',
        masteryHistory: null,
        frequency: 2,
        isPrerequisite: true,
      });
      expect(result.severity).toBe('medium');
    });

    test('returns remediation hint', () => {
      const result = classifyError({
        learnerResponse: '我不知道',
        conceptId: 'delegation',
        masteryHistory: null,
      });
      expect(result.remediationHint).toBeDefined();
      expect(typeof result.remediationHint).toBe('string');
    });

    test('returns full classification object shape', () => {
      const result = classifyError({
        learnerResponse: 'test',
        conceptId: 'test-concept',
        masteryHistory: null,
      });
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('severity');
      expect(result).toHaveProperty('remediationHint');
      expect(result).toHaveProperty('conceptId');
    });
  });
});
