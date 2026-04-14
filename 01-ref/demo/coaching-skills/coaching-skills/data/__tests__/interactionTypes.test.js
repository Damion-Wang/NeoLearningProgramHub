import {
  INTERACTION_CATEGORIES,
  CORE_INTERACTION_TYPES,
  FULL_INTERACTION_INVENTORY,
  CURRENTLY_IMPLEMENTED,
  ERROR_RESPONSE_MATRIX,
  AI_PROACTIVE_SIGNALS,
  getTypesByCategory,
  isImplemented,
  getErrorResponse,
  getProactiveResponse,
} from '../interactionTypes';

describe('interactionTypes', () => {
  describe('INTERACTION_CATEGORIES', () => {
    it('包含所有预期的4个分类键', () => {
      expect(Object.keys(INTERACTION_CATEGORIES)).toHaveLength(4);
      expect(Object.keys(INTERACTION_CATEGORIES)).toContain('testing');
      expect(Object.keys(INTERACTION_CATEGORIES)).toContain('constructive');
      expect(Object.keys(INTERACTION_CATEGORIES)).toContain('transfer');
      expect(Object.keys(INTERACTION_CATEGORIES)).toContain('experiential');
    });

    it('每个分类对象包含必需字段且结构正确', () => {
      const testing = INTERACTION_CATEGORIES.testing;
      expect(testing).toBeDefined();
      expect(testing.id).toBe('testing');
      expect(testing.name).toBe('检测型');
      expect(testing.description).toBe('快速探测学员当前认知状态，暴露知识缺口或误解');

      const constructive = INTERACTION_CATEGORIES.constructive;
      expect(constructive).toBeDefined();
      expect(constructive.id).toBe('constructive');
      expect(constructive.name).toBe('建构型');
      expect(constructive.description).toBe('通过提问、失败或假设推演，引导学员主动构建知识结构');

      const transfer = INTERACTION_CATEGORIES.transfer;
      expect(transfer).toBeDefined();
      expect(transfer.id).toBe('transfer');
      expect(transfer.name).toBe('迁移型');
      expect(transfer.description).toBe('将所学知识迁移到新场景或自身工作情境，强化应用能力');

      const experiential = INTERACTION_CATEGORIES.experiential;
      expect(experiential).toBeDefined();
      expect(experiential.id).toBe('experiential');
      expect(experiential.name).toBe('体验型');
      expect(experiential.description).toBe('沉浸式情境体验，通过选择-后果链让学员感受决策影响');
    });

    it('所有分类ID唯一', () => {
      const ids = Object.values(INTERACTION_CATEGORIES).map(cat => cat.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids).toHaveLength(uniqueIds.length);
    });
  });

  describe('CORE_INTERACTION_TYPES', () => {
    it('包含12个核心互动类型', () => {
      expect(CORE_INTERACTION_TYPES).toHaveLength(12);
    });

    it('每个类型对象包含必需字段且结构正确', () => {
      const predictType = CORE_INTERACTION_TYPES.find(t => t.id === 'predict');
      expect(predictType).toBeDefined();
      expect(predictType.id).toBe('predict');
      expect(predictType.name).toBe('先猜再讲');
      expect(predictType.category).toBe('testing');
      expect(predictType.description).toContain('预测结果');
      expect(predictType.complexity).toBe('low');
      expect(predictType.effectSize).toBeNull();
      expect(predictType.implemented).toBe(true);
      expect(predictType.phase).toBe(1);

      const socraticType = CORE_INTERACTION_TYPES.find(t => t.id === 'socratic');
      expect(socraticType).toBeDefined();
      expect(socraticType.id).toBe('socratic');
      expect(socraticType.name).toBe('苏格拉底追问');
      expect(socraticType.category).toBe('constructive');
      expect(socraticType.complexity).toBe('high');
      expect(socraticType.effectSize).toBe('d=0.82');
      expect(socraticType.implemented).toBe(false);
      expect(socraticType.phase).toBe(1);
    });

    it('所有类型ID唯一', () => {
      const ids = CORE_INTERACTION_TYPES.map(t => t.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids).toHaveLength(uniqueIds.length);
    });

    it('所有类型category字段值必须是INTERACTION_CATEGORIES中的有效键', () => {
      const validCategories = Object.keys(INTERACTION_CATEGORIES);
      const invalidCategories = CORE_INTERACTION_TYPES
        .filter(t => !validCategories.includes(t.category));
      expect(invalidCategories).toHaveLength(0);
    });

    it('所有类型complexity字段值必须是合法枚举值', () => {
      const validComplexities = ['low', 'medium', 'high'];
      const invalidComplexities = CORE_INTERACTION_TYPES
        .filter(t => !validComplexities.includes(t.complexity));
      expect(invalidComplexities).toHaveLength(0);
    });

    it('所有类型phase字段值必须是1或2', () => {
      const invalidPhases = CORE_INTERACTION_TYPES
        .filter(t => t.phase !== 1 && t.phase !== 2);
      expect(invalidPhases).toHaveLength(0);
    });
  });

  describe('FULL_INTERACTION_INVENTORY', () => {
    it('包含33个完整互动类型', () => {
      expect(FULL_INTERACTION_INVENTORY).toHaveLength(33);
    });

    it('每个类型对象包含必需字段且结构正确', () => {
      const predictType = FULL_INTERACTION_INVENTORY.find(t => t.id === 'predict');
      expect(predictType).toBeDefined();
      expect(predictType.id).toBe('predict');
      expect(predictType.name).toBe('先猜再讲');
      expect(predictType.category).toBe('A_testing');
      expect(predictType.complexity).toBe('low');
      expect(predictType.effectSize).toBeNull();
      expect(predictType.implemented).toBe(true);
      expect(predictType.phase).toBe(1);

      const emotionAdaptiveType = FULL_INTERACTION_INVENTORY.find(t => t.id === 'emotion_adaptive');
      expect(emotionAdaptiveType).toBeDefined();
      expect(emotionAdaptiveType.id).toBe('emotion_adaptive');
      expect(emotionAdaptiveType.name).toBe('情绪自适应');
      expect(emotionAdaptiveType.category).toBe('H_adaptive');
      expect(emotionAdaptiveType.complexity).toBe('high');
      expect(emotionAdaptiveType.phase).toBe(2);
    });

    it('所有类型ID唯一', () => {
      const ids = FULL_INTERACTION_INVENTORY.map(t => t.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids).toHaveLength(uniqueIds.length);
    });

    it('所有类型complexity字段值必须是合法枚举值', () => {
      const validComplexities = ['low', 'medium', 'high'];
      const invalidComplexities = FULL_INTERACTION_INVENTORY
        .filter(t => !validComplexities.includes(t.complexity));
      expect(invalidComplexities).toHaveLength(0);
    });

    it('所有类型phase字段值必须是1或2', () => {
      const invalidPhases = FULL_INTERACTION_INVENTORY
        .filter(t => t.phase !== 1 && t.phase !== 2);
      expect(invalidPhases).toHaveLength(0);
    });
  });

  describe('CURRENTLY_IMPLEMENTED', () => {
    it('包含4个已实现的类型ID', () => {
      expect(CURRENTLY_IMPLEMENTED).toHaveLength(4);
      expect(CURRENTLY_IMPLEMENTED).toContain('predict');
      expect(CURRENTLY_IMPLEMENTED).toContain('recall');
      expect(CURRENTLY_IMPLEMENTED).toContain('misconception_check');
      expect(CURRENTLY_IMPLEMENTED).toContain('transfer');
    });

    it('所有ID在CORE_INTERACTION_TYPES中存在', () => {
      const coreIds = CORE_INTERACTION_TYPES.map(t => t.id);
      const missingIds = CURRENTLY_IMPLEMENTED.filter(id => !coreIds.includes(id));
      expect(missingIds).toHaveLength(0);
    });

    it('所有ID在FULL_INTERACTION_INVENTORY中存在', () => {
      const fullIds = FULL_INTERACTION_INVENTORY.map(t => t.id);
      const missingIds = CURRENTLY_IMPLEMENTED.filter(id => !fullIds.includes(id));
      expect(missingIds).toHaveLength(0);
    });
  });

  describe('ERROR_RESPONSE_MATRIX', () => {
    it('包含5个错误响应类型', () => {
      expect(Object.keys(ERROR_RESPONSE_MATRIX)).toHaveLength(5);
      expect(Object.keys(ERROR_RESPONSE_MATRIX)).toContain('lucky_guess');
      expect(Object.keys(ERROR_RESPONSE_MATRIX)).toContain('knowledge_gap');
      expect(Object.keys(ERROR_RESPONSE_MATRIX)).toContain('stubborn_misconception');
      expect(Object.keys(ERROR_RESPONSE_MATRIX)).toContain('careless');
      expect(Object.keys(ERROR_RESPONSE_MATRIX)).toContain('repeated_failure');
    });

    it('每个错误响应对象包含必需字段且结构正确', () => {
      const luckyGuess = ERROR_RESPONSE_MATRIX.lucky_guess;
      expect(luckyGuess).toBeDefined();
      expect(luckyGuess.type).toBe('lucky_guess');
      expect(luckyGuess.name).toBe('蒙对');
      expect(luckyGuess.description).toContain('答案正确但推理过程不成立');
      expect(luckyGuess.strategy).toContain('追问推理过程');
      expect(luckyGuess.examples).toHaveLength(2);
      expect(luckyGuess.examples[0]).toContain('答对了！');

      const repeatedFailure = ERROR_RESPONSE_MATRIX.repeated_failure;
      expect(repeatedFailure).toBeDefined();
      expect(repeatedFailure.type).toBe('repeated_failure');
      expect(repeatedFailure.name).toBe('反复答错');
      expect(repeatedFailure.description).toContain('同一知识点连续多次答错');
      expect(repeatedFailure.strategy).toContain('降低难度');
      expect(repeatedFailure.examples).toHaveLength(3);
      expect(repeatedFailure.examples[0]).toContain('换个角度来看');
    });

    it('所有错误类型ID唯一', () => {
      const ids = Object.values(ERROR_RESPONSE_MATRIX).map(err => err.type);
      const uniqueIds = [...new Set(ids)];
      expect(ids).toHaveLength(uniqueIds.length);
    });

    it('所有错误类型ID与键名一致', () => {
      Object.entries(ERROR_RESPONSE_MATRIX).forEach(([key, value]) => {
        expect(value.type).toBe(key);
      });
    });
  });

  describe('AI_PROACTIVE_SIGNALS', () => {
    it('包含6个主动信号', () => {
      expect(AI_PROACTIVE_SIGNALS).toHaveLength(6);
    });

    it('每个信号对象包含必需字段且结构正确', () => {
      const confusionSignal = AI_PROACTIVE_SIGNALS.find(s => s.type === 'confusion');
      expect(confusionSignal).toBeDefined();
      expect(confusionSignal.type).toBe('confusion');
      expect(confusionSignal.name).toBe('困惑');
      expect(confusionSignal.trigger).toContain('不太明白');
      expect(confusionSignal.response).toContain('简化解释');
      expect(confusionSignal.examples).toHaveLength(2);
      expect(confusionSignal.examples[0]).toContain('哪个部分不太清楚');

      const masterySignal = AI_PROACTIVE_SIGNALS.find(s => s.type === 'mastery');
      expect(masterySignal).toBeDefined();
      expect(masterySignal.type).toBe('mastery');
      expect(masterySignal.name).toBe('已掌握');
      expect(masterySignal.trigger).toContain('连续多题全部正确');
      expect(masterySignal.response).toContain('确认掌握');
      expect(masterySignal.examples).toHaveLength(2);
      expect(masterySignal.examples[0]).toContain('这块你已经很扎实了');
    });

    it('所有信号类型ID唯一', () => {
      const types = AI_PROACTIVE_SIGNALS.map(s => s.type);
      const uniqueTypes = [...new Set(types)];
      expect(types).toHaveLength(uniqueTypes.length);
    });

    it('所有信号类型ID与数组中实际值一致', () => {
      const expectedTypes = ['confusion', 'silence', 'engagement', 'incomprehension', 'mastery', 'hesitation'];
      const actualTypes = AI_PROACTIVE_SIGNALS.map(s => s.type);
      expect(actualTypes.sort()).toEqual(expectedTypes.sort());
    });
  });

  describe('getTypesByCategory', () => {
    it('正常输入时返回对应分类的类型数组', () => {
      const testingTypes = getTypesByCategory('testing');
      expect(testingTypes).toHaveLength(5);
      expect(testingTypes.map(t => t.id)).toEqual(['predict', 'recall', 'misconception_check', 'confidence_check', 'timed_challenge']);

      const constructiveTypes = getTypesByCategory('constructive');
      expect(constructiveTypes).toHaveLength(3);
      expect(constructiveTypes.map(t => t.id)).toEqual(['productive_failure', 'socratic', 'counterfactual']);
    });

    it('空字符串输入时返回空数组', () => {
      const result = getTypesByCategory('');
      expect(result).toHaveLength(0);
    });

    it('null 输入时不抛异常', () => {
      expect(() => getTypesByCategory(null)).not.toThrow();
      expect(getTypesByCategory(null)).toHaveLength(0);
    });

    it('undefined 输入时不抛异常', () => {
      expect(() => getTypesByCategory(undefined)).not.toThrow();
      expect(getTypesByCategory(undefined)).toHaveLength(0);
    });

    it('不存在的分类ID返回空数组', () => {
      const result = getTypesByCategory('nonexistent');
      expect(result).toHaveLength(0);
    });
  });

  describe('isImplemented', () => {
    it('正常输入时返回正确的布尔值', () => {
      expect(isImplemented('predict')).toBe(true);
      expect(isImplemented('recall')).toBe(true);
      expect(isImplemented('misconception_check')).toBe(true);
      expect(isImplemented('transfer')).toBe(true);
      expect(isImplemented('confidence_check')).toBe(false);
      expect(isImplemented('socratic')).toBe(false);
    });

    it('空字符串输入返回false', () => {
      expect(isImplemented('')).toBe(false);
    });

    it('null 输入返回false', () => {
      expect(isImplemented(null)).toBe(false);
    });

    it('undefined 输入返回false', () => {
      expect(isImplemented(undefined)).toBe(false);
    });

    it('数字输入返回false', () => {
      expect(isImplemented(123)).toBe(false);
      expect(isImplemented(0)).toBe(false);
    });

    it('对象输入返回false', () => {
      expect(isImplemented({})).toBe(false);
      expect(isImplemented([])).toBe(false);
    });
  });

  describe('getErrorResponse', () => {
    it('正常输入时返回对应的错误响应对象', () => {
      const luckyGuess = getErrorResponse('lucky_guess');
      expect(luckyGuess).toBeDefined();
      expect(luckyGuess.type).toBe('lucky_guess');
      expect(luckyGuess.name).toBe('蒙对');

      const repeatedFailure = getErrorResponse('repeated_failure');
      expect(repeatedFailure).toBeDefined();
      expect(repeatedFailure.type).toBe('repeated_failure');
      expect(repeatedFailure.name).toBe('反复答错');
    });

    it('空字符串输入返回undefined', () => {
      expect(getErrorResponse('')).toBeUndefined();
    });

    it('null 输入返回undefined', () => {
      expect(getErrorResponse(null)).toBeUndefined();
    });

    it('undefined 输入返回undefined', () => {
      expect(getErrorResponse(undefined)).toBeUndefined();
    });

    it('不存在的错误类型返回undefined', () => {
      expect(getErrorResponse('nonexistent')).toBeUndefined();
    });
  });

  describe('getProactiveResponse', () => {
    it('正常输入时返回对应的主动信号对象', () => {
      const confusion = getProactiveResponse('confusion');
      expect(confusion).toBeDefined();
      expect(confusion.type).toBe('confusion');
      expect(confusion.name).toBe('困惑');

      const mastery = getProactiveResponse('mastery');
      expect(mastery).toBeDefined();
      expect(mastery.type).toBe('mastery');
      expect(mastery.name).toBe('已掌握');
    });

    it('空字符串输入返回undefined', () => {
      expect(getProactiveResponse('')).toBeUndefined();
    });

    it('null 输入返回undefined', () => {
      expect(getProactiveResponse(null)).toBeUndefined();
    });

    it('undefined 输入返回undefined', () => {
      expect(getProactiveResponse(undefined)).toBeUndefined();
    });

    it('不存在的信号类型返回undefined', () => {
      expect(getProactiveResponse('nonexistent')).toBeUndefined();
    });
  });
});
