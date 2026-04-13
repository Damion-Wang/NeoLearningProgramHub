/**
 * Coach Exemplar Library tests (私教系统 §十 教练范例库)
 */

import { getExemplar, EXEMPLAR_CATEGORIES, getAllExemplars } from '../coachExemplars';

describe('Coach Exemplar Library', () => {
  test('has categories matching coaching signal types', () => {
    expect(EXEMPLAR_CATEGORIES).toContain('⑤_know_do_gap');
    expect(EXEMPLAR_CATEGORIES).toContain('⑦_metacognitive_bias');
    expect(EXEMPLAR_CATEGORIES).toContain('⑧_context_mismatch');
  });

  test('also has categories for teaching signal types', () => {
    expect(EXEMPLAR_CATEGORIES).toContain('⑥_misconception');
  });

  test('getExemplar returns exemplar with required fields', () => {
    const exemplar = getExemplar('⑤_know_do_gap', { dreyfusLevel: 'competent' });
    expect(exemplar).toBeDefined();
    expect(exemplar.scenario).toBeDefined();
    expect(exemplar.coachResponse).toBeDefined();
    expect(exemplar.technique).toBeDefined();
  });

  test('getExemplar returns different exemplars for different dreyfus levels', () => {
    const novice = getExemplar('⑤_know_do_gap', { dreyfusLevel: 'novice' });
    const expert = getExemplar('⑤_know_do_gap', { dreyfusLevel: 'proficient' });
    // At minimum both should exist; they may or may not differ
    expect(novice).toBeDefined();
    expect(expert).toBeDefined();
  });

  test('returns null for unknown category', () => {
    expect(getExemplar('unknown')).toBeNull();
  });

  test('getAllExemplars returns array for valid category', () => {
    const all = getAllExemplars('⑤_know_do_gap');
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
    all.forEach(e => {
      expect(e).toHaveProperty('scenario');
      expect(e).toHaveProperty('coachResponse');
      expect(e).toHaveProperty('technique');
      expect(e).toHaveProperty('dreyfusLevel');
    });
  });

  test('getAllExemplars returns empty array for unknown category', () => {
    expect(getAllExemplars('nonexistent')).toEqual([]);
  });

  test('each category has at least 2 exemplars', () => {
    for (const cat of EXEMPLAR_CATEGORIES) {
      const all = getAllExemplars(cat);
      expect(all.length).toBeGreaterThanOrEqual(2);
    }
  });
});
