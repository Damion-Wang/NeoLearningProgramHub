/**
 * Signal Detection tests — 8-type signal classifier (私教系统 §3.1)
 */

import { classifySignal, SIGNAL_TYPES } from '../signalDetection';

describe('Signal Detection', () => {
  test('SIGNAL_TYPES has 8 types', () => {
    expect(Object.keys(SIGNAL_TYPES)).toHaveLength(8);
  });

  test('each SIGNAL_TYPES entry has name, label, handler', () => {
    for (const [key, value] of Object.entries(SIGNAL_TYPES)) {
      expect(value).toHaveProperty('name');
      expect(value).toHaveProperty('label');
      expect(value).toHaveProperty('handler');
      expect(['teaching', 'coaching']).toContain(value.handler);
    }
  });

  test('detects ① missing concept from blank answer', () => {
    const result = classifySignal({
      userMessage: '这个我不太了解',
      responseDepth: 0.2,
      masteryScore: null,
      confidence: 0.1,
    });
    expect(result.primary).toBe('①');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  test('detects ② forgotten from low mastery despite history', () => {
    const result = classifySignal({
      userMessage: '我之前学过但忘了',
      responseDepth: 0.3,
      masteryScore: 0.7,
      confidence: 0.8,
    });
    expect(result.primary).toBe('②');
  });

  test('detects ⑤ know-do gap from correct answer + behavior evidence', () => {
    const result = classifySignal({
      userMessage: '我知道应该这样做但总是做不到',
      responseDepth: 0.8,
      masteryScore: 0.9,
      behaviorScore: 0.3,
    });
    expect(result.primary).toBe('⑤');
  });

  test('returns severity (low/medium/high)', () => {
    const result = classifySignal({
      userMessage: '这个我完全没听说过',
      responseDepth: 0.1,
      masteryScore: null,
    });
    expect(['low', 'medium', 'high']).toContain(result.severity);
  });

  test('returns null primary when no signal detected', () => {
    const result = classifySignal({
      userMessage: '今天天气不错',
      responseDepth: 0.5,
      masteryScore: 0.5,
      confidence: 0.5,
    });
    expect(result.primary).toBeNull();
    expect(result.signals).toHaveLength(0);
  });

  test('detects ⑥ misconception from high confidence + low mastery', () => {
    const result = classifySignal({
      userMessage: '管理不就是发号施令嘛',
      responseDepth: 0.7,
      masteryScore: 0.3,
      confidence: 0.9,
    });
    // Should detect via pattern ('不就是') or context inference
    expect(result.primary).toBe('⑥');
  });

  test('detects ⑦ metacognitive bias from overconfidence pattern', () => {
    const result = classifySignal({
      userMessage: '我觉得我挺好的，没什么问题',
      responseDepth: 0.5,
      masteryScore: 0.4,
      confidence: 0.5,
    });
    expect(result.primary).toBe('⑦');
  });

  test('detects ⑧ context mismatch from old-context pattern', () => {
    const result = classifySignal({
      userMessage: '我之前一直这样做效果挺好的',
      responseDepth: 0.5,
      masteryScore: 0.6,
      confidence: 0.6,
    });
    expect(result.primary).toBe('⑧');
  });

  test('teaching signals (①②③④⑥) have handler "teaching"', () => {
    const teachingTypes = ['①', '②', '③', '④', '⑥'];
    for (const type of teachingTypes) {
      expect(SIGNAL_TYPES[type].handler).toBe('teaching');
    }
  });

  test('coaching signals (⑤⑦⑧) have handler "coaching"', () => {
    const coachingTypes = ['⑤', '⑦', '⑧'];
    for (const type of coachingTypes) {
      expect(SIGNAL_TYPES[type].handler).toBe('coaching');
    }
  });
});
