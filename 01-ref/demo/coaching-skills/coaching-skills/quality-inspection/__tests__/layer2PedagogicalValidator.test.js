/**
 * Layer 2 Pedagogical Validator 测试
 */

import { Layer2PedagogicalValidator } from '../layer2PedagogicalValidator';

describe('Layer2PedagogicalValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new Layer2PedagogicalValidator();
  });

  describe('空输入', () => {
    it('null 输入应返回 clean', async () => {
      const result = await validator.validate(null);
      expect(result.status).toBe('clean');
      expect(result.violations).toEqual([]);
    });

    it('无策略应用时应返回 clean', async () => {
      const result = await validator.validate({
        strategiesApplied: [],
        signals: {},
      });
      expect(result.status).toBe('clean');
    });
  });

  describe('策略 × Dreyfus 匹配', () => {
    it('新手使用苏格拉底追问应标记', async () => {
      const meta = {
        strategiesApplied: [{
          code: 'IP-03',
          name: '苏格拉底追问',
          turns: [2, 5],
          contexts: [
            { dreyfusLevel: 'novice' },
            { dreyfusLevel: 'novice' },
          ],
        }],
        signals: {},
      };
      const result = await validator.validate(meta);
      expect(result.status).toBe('flagged');
      expect(result.violations.some(v =>
        v.pedagogicalRule === 'strategy_dreyfus_mismatch' &&
        v.relatedStrategyCode === 'IP-03'
      )).toBe(true);
    });

    it('新手使用有效失败应标记', async () => {
      const meta = {
        strategiesApplied: [{
          code: 'CG-05',
          name: '有效失败',
          turns: [3],
          contexts: [{ dreyfusLevel: 'advanced_beginner' }],
        }],
        signals: {},
      };
      const result = await validator.validate(meta);
      expect(result.violations.some(v =>
        v.relatedStrategyCode === 'CG-05'
      )).toBe(true);
    });

    it('专家使用脚手架渐进应标记', async () => {
      const meta = {
        strategiesApplied: [{
          code: 'CS-03',
          name: '脚手架渐进',
          turns: [1],
          contexts: [{ dreyfusLevel: 'expert' }],
        }],
        signals: {},
      };
      const result = await validator.validate(meta);
      expect(result.violations.some(v =>
        v.relatedStrategyCode === 'CS-03' &&
        v.pedagogicalRule === 'strategy_dreyfus_mismatch'
      )).toBe(true);
    });

    it('适当阶段使用策略不应标记', async () => {
      const meta = {
        strategiesApplied: [{
          code: 'CG-06',
          name: '先直觉后符号',
          turns: [1],
          contexts: [{ dreyfusLevel: 'novice' }],
        }],
        signals: {},
      };
      const result = await validator.validate(meta);
      expect(result.violations.filter(v =>
        v.pedagogicalRule === 'strategy_dreyfus_mismatch'
      )).toHaveLength(0);
    });

    it('无 Dreyfus 上下文不应标记', async () => {
      const meta = {
        strategiesApplied: [{
          code: 'IP-03',
          name: '苏格拉底追问',
          turns: [1],
          contexts: [{}],
        }],
        signals: {},
      };
      const result = await validator.validate(meta);
      expect(result.violations.filter(v =>
        v.pedagogicalRule === 'strategy_dreyfus_mismatch'
      )).toHaveLength(0);
    });
  });

  describe('策略 × 错误类型匹配', () => {
    it('检测到 misconception 但未用 CG-08 应标记', async () => {
      const meta = {
        strategiesApplied: [
          { code: 'CG-02', name: '间隔重复', turns: [1], contexts: [] },
        ],
        signals: {
          misconception: [{ turn: 3, signal: '⑥' }],
        },
      };
      const result = await validator.validate(meta);
      expect(result.violations.some(v =>
        v.pedagogicalRule === 'error_correction_missing'
      )).toBe(true);
    });

    it('检测到 misconception 且用了 CG-08 不应标记', async () => {
      const meta = {
        strategiesApplied: [
          { code: 'CG-08', name: '概念转变', turns: [4], contexts: [] },
        ],
        signals: {
          misconception: [{ turn: 3, signal: '⑥' }],
        },
      };
      const result = await validator.validate(meta);
      expect(result.violations.filter(v =>
        v.pedagogicalRule === 'error_correction_missing' &&
        v.detail.includes('misconception')
      )).toHaveLength(0);
    });

    it('confusion 信号也应触发 misconception 纠正检查', async () => {
      const meta = {
        strategiesApplied: [],
        signals: {
          confusion: [{ turn: 2, signal: '①' }],
        },
      };
      const result = await validator.validate(meta);
      expect(result.violations.some(v =>
        v.pedagogicalRule === 'error_correction_missing' &&
        v.detail.includes('misconception')
      )).toBe(true);
    });

    it('检测到 forgotten 但未用间隔重复应标记', async () => {
      const meta = {
        strategiesApplied: [
          { code: 'IP-03', name: '苏格拉底追问', turns: [1], contexts: [] },
        ],
        signals: {
          forgotten: [{ turn: 1 }],
        },
      };
      const result = await validator.validate(meta);
      expect(result.violations.some(v =>
        v.detail.includes('forgotten')
      )).toBe(true);
    });

    it('无错误信号不应标记', async () => {
      const meta = {
        strategiesApplied: [
          { code: 'CG-02', name: '间隔重复', turns: [1], contexts: [] },
        ],
        signals: {},
      };
      const result = await validator.validate(meta);
      expect(result.violations.filter(v =>
        v.pedagogicalRule === 'error_correction_missing'
      )).toHaveLength(0);
    });
  });

  describe('策略组合缺失', () => {
    it('单策略不检查组合', async () => {
      const meta = {
        strategiesApplied: [
          { code: 'CG-02', name: '间隔重复', turns: [1], contexts: [] },
        ],
        signals: {},
      };
      const result = await validator.validate(meta);
      expect(result.violations.filter(v =>
        v.pedagogicalRule === 'strategy_combination_missing'
      )).toHaveLength(0);
    });

    it('两个策略但无组合关系应提醒', async () => {
      const meta = {
        strategiesApplied: [
          { code: 'CG-02', name: '间隔重复', turns: [1], contexts: [] },
          { code: 'NE-01', name: '故事弧线', turns: [3], contexts: [] },
        ],
        signals: {},
      };
      const result = await validator.validate(meta);
      // CG-02 的 combinableWith 包含 CG-03/CG-04/TE-04，NE-01 不在其中
      expect(result.violations.some(v =>
        v.pedagogicalRule === 'strategy_combination_missing'
      )).toBe(true);
    });

    it('使用了推荐组合策略不应提醒', async () => {
      const meta = {
        strategiesApplied: [
          { code: 'CG-02', name: '间隔重复', turns: [1], contexts: [] },
          { code: 'CG-03', name: '检索练习', turns: [3], contexts: [] },
        ],
        signals: {},
      };
      const result = await validator.validate(meta);
      // CG-02 combinableWith 包含 CG-03，不应标记 CG-02
      const cg02Violations = result.violations.filter(v =>
        v.pedagogicalRule === 'strategy_combination_missing' &&
        v.relatedStrategyCode === 'CG-02'
      );
      expect(cg02Violations).toHaveLength(0);
    });
  });

  describe('策略效果空转', () => {
    it('多次应用但无突破应标记', async () => {
      const meta = {
        strategiesApplied: [
          { code: 'CG-02', name: '间隔重复', turns: [1, 3, 5, 7, 9], contexts: [] },
        ],
        signals: { breakthrough: [] },
      };
      const result = await validator.validate(meta);
      expect(result.violations.some(v =>
        v.pedagogicalRule === 'strategy_effect_null'
      )).toBe(true);
    });

    it('有突破信号不应标记', async () => {
      const meta = {
        strategiesApplied: [
          { code: 'CG-02', name: '间隔重复', turns: [1, 3, 5, 7, 9], contexts: [] },
        ],
        signals: { breakthrough: [{ turn: 8 }] },
      };
      const result = await validator.validate(meta);
      expect(result.violations.filter(v =>
        v.pedagogicalRule === 'strategy_effect_null'
      )).toHaveLength(0);
    });

    it('少量应用不应标记', async () => {
      const meta = {
        strategiesApplied: [
          { code: 'CG-02', name: '间隔重复', turns: [1, 3], contexts: [] },
        ],
        signals: { breakthrough: [] },
      };
      const result = await validator.validate(meta);
      expect(result.violations.filter(v =>
        v.pedagogicalRule === 'strategy_effect_null'
      )).toHaveLength(0);
    });
  });
});
