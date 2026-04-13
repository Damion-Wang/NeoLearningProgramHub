import {
  COURSE_PHASES,
  MODULE_STRUCTURE,
  COURSE_TEMPLATES,
  METHODOLOGY_REFERENCE,
  getTemplateById,
  getTemplatesByPhase,
  getMethodologiesForTemplate,
} from '../courseTemplates';

describe('courseTemplates', () => {
  describe('COURSE_PHASES', () => {
    it('包含4个学习阶段', () => {
      expect(COURSE_PHASES).toHaveLength(4);
    });

    it('每个阶段都有id、name、description和templateIds字段', () => {
      COURSE_PHASES.forEach((phase) => {
        expect(phase).toHaveProperty('id');
        expect(phase).toHaveProperty('name');
        expect(phase).toHaveProperty('description');
        expect(phase).toHaveProperty('templateIds');
        expect(phase.id).toBeDefined();
        expect(phase.name).toBeDefined();
        expect(phase.description).toBeDefined();
        expect(Array.isArray(phase.templateIds)).toBe(true);
      });
    });

    it('所有templateIds都是字符串数组且非空', () => {
      COURSE_PHASES.forEach((phase) => {
        expect(phase.templateIds).toHaveLength(2);
        phase.templateIds.forEach((id) => expect(typeof id).toBe('string'));
      });
    });

    it('所有phaseId在COURSE_TEMPLATES中都有对应模板', () => {
      const validPhaseIds = new Set(COURSE_PHASES.map((p) => p.id));
      COURSE_TEMPLATES.forEach((template) => {
        expect(validPhaseIds).toContain(template.phaseId);
      });
    });

    it('所有templateIds在COURSE_TEMPLATES中都存在对应ID', () => {
      const templateIds = new Set(COURSE_TEMPLATES.map((t) => t.id));
      COURSE_PHASES.forEach((phase) => {
        phase.templateIds.forEach((id) => {
          expect(templateIds).toContain(id);
        });
      });
    });
  });

  describe('MODULE_STRUCTURE', () => {
    it('包含segments数组和totalMicroCourseSec数字', () => {
      expect(MODULE_STRUCTURE).toHaveProperty('segments');
      expect(MODULE_STRUCTURE).toHaveProperty('totalMicroCourseSec');
      expect(Array.isArray(MODULE_STRUCTURE.segments)).toBe(true);
      expect(typeof MODULE_STRUCTURE.totalMicroCourseSec).toBe('number');
    });

    it('segments包含9个段落', () => {
      expect(MODULE_STRUCTURE.segments).toHaveLength(9);
    });

    it('每个segment都有id、name、timeRange、durationSec和purpose字段', () => {
      MODULE_STRUCTURE.segments.forEach((segment) => {
        expect(segment).toHaveProperty('id');
        expect(segment).toHaveProperty('name');
        expect(segment).toHaveProperty('timeRange');
        expect(segment).toHaveProperty('durationSec');
        expect(segment).toHaveProperty('purpose');
        expect(segment.id).toBeDefined();
        expect(segment.name).toBeDefined();
        expect(segment.timeRange).toBeDefined();
        expect(typeof segment.durationSec).toBe('number');
        expect(segment.purpose).toBeDefined();
      });
    });

    it('totalMicroCourseSec等于300（5分钟）', () => {
      expect(MODULE_STRUCTURE.totalMicroCourseSec).toBe(300);
    });

    it('ai_practice段落的durationSec为-1（无时间限制）', () => {
      const aiPracticeSegment = MODULE_STRUCTURE.segments.find(
        (s) => s.id === 'ai_practice'
      );
      expect(aiPracticeSegment).toBeDefined();
      expect(aiPracticeSegment.durationSec).toBe(-1);
    });
  });

  describe('COURSE_TEMPLATES', () => {
    it('包含8个课程模板', () => {
      expect(COURSE_TEMPLATES).toHaveLength(8);
    });

    it('每个模板都有必需的字段且类型正确', () => {
      COURSE_TEMPLATES.forEach((template) => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('title');
        expect(template).toHaveProperty('phaseId');
        expect(template).toHaveProperty('scenario');
        expect(template).toHaveProperty('methodology');
        expect(template).toHaveProperty('methodologyDetail');
        expect(template).toHaveProperty('practiceDesign');
        expect(template).toHaveProperty('hookStyle');
        expect(template).toHaveProperty('diagramStyle');
        expect(template).toHaveProperty('knowledgeRefs');
        expect(template).toHaveProperty('aiGenerationNeeded');
        expect(template).toHaveProperty('prerequisites');

        expect(typeof template.id).toBe('string');
        expect(typeof template.title).toBe('string');
        expect(typeof template.phaseId).toBe('string');
        expect(typeof template.scenario).toBe('string');
        expect(typeof template.methodology).toBe('string');
        expect(typeof template.methodologyDetail).toBe('string');
        expect(typeof template.hookStyle).toBe('string');
        expect(typeof template.diagramStyle).toBe('string');
        expect(Array.isArray(template.knowledgeRefs)).toBe(true);
        expect(typeof template.aiGenerationNeeded).toBe('boolean');
        expect(Array.isArray(template.prerequisites)).toBe(true);

        // practiceDesign is an object with required fields
        expect(template.practiceDesign).toHaveProperty('aiRole');
        expect(template.practiceDesign).toHaveProperty('evaluationFocus');
        expect(typeof template.practiceDesign.aiRole).toBe('string');
        expect(typeof template.practiceDesign.evaluationFocus).toBe('string');
      });
    });

    it('所有模板ID都是KM1-KM8且唯一', () => {
      const expectedIds = ['KM1', 'KM2', 'KM3', 'KM4', 'KM5', 'KM6', 'KM7', 'KM8'];
      const actualIds = COURSE_TEMPLATES.map((t) => t.id);
      expect(actualIds).toEqual(expectedIds);

      // Check uniqueness
      const uniqueIds = [...new Set(actualIds)];
      expect(uniqueIds).toHaveLength(8);
    });

    it('所有phaseId都存在于COURSE_PHASES中', () => {
      const validPhaseIds = new Set(COURSE_PHASES.map((p) => p.id));
      COURSE_TEMPLATES.forEach((template) => {
        expect(validPhaseIds).toContain(template.phaseId);
      });
    });

    it('所有prerequisites都存在于COURSE_TEMPLATES中或为空数组', () => {
      const templateIds = new Set(COURSE_TEMPLATES.map((t) => t.id));
      COURSE_TEMPLATES.forEach((template) => {
        template.prerequisites.forEach((prereq) => {
          expect(templateIds).toContain(prereq);
        });
      });
    });

    it('KM1有0个前置课程，KM2有1个前置课程，KM3有1个前置课程，KM4有1个前置课程，KM5有4个前置课程，KM6有1个前置课程，KM7有1个前置课程，KM8有1个前置课程', () => {
      expect(COURSE_TEMPLATES[0].prerequisites).toHaveLength(0); // KM1
      expect(COURSE_TEMPLATES[1].prerequisites).toHaveLength(1); // KM2
      expect(COURSE_TEMPLATES[2].prerequisites).toHaveLength(1); // KM3
      expect(COURSE_TEMPLATES[3].prerequisites).toHaveLength(1); // KM4
      expect(COURSE_TEMPLATES[4].prerequisites).toHaveLength(4); // KM5
      expect(COURSE_TEMPLATES[5].prerequisites).toHaveLength(1); // KM6
      expect(COURSE_TEMPLATES[6].prerequisites).toHaveLength(1); // KM7
      expect(COURSE_TEMPLATES[7].prerequisites).toHaveLength(1); // KM8
    });
  });

  describe('METHODOLOGY_REFERENCE', () => {
    it('包含16个方法论工具', () => {
      expect(METHODOLOGY_REFERENCE).toHaveLength(16);
    });

    it('每个工具都有index、name、steps和usedInTemplates字段', () => {
      METHODOLOGY_REFERENCE.forEach((tool) => {
        expect(tool).toHaveProperty('index');
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('steps');
        expect(tool).toHaveProperty('usedInTemplates');
        expect(typeof tool.index).toBe('number');
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.steps).toBe('string');
        expect(Array.isArray(tool.usedInTemplates)).toBe(true);
      });
    });

    it('index从1到16且连续', () => {
      const indices = METHODOLOGY_REFERENCE.map((t) => t.index);
      expect(indices).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    });

    it('所有usedInTemplates中的ID都存在于COURSE_TEMPLATES中', () => {
      const templateIds = new Set(COURSE_TEMPLATES.map((t) => t.id));
      METHODOLOGY_REFERENCE.forEach((tool) => {
        tool.usedInTemplates.forEach((id) => {
          expect(templateIds).toContain(id);
        });
      });
    });

    it('KM1只被索引1使用，KM2被索引2和3使用，KM3被索引4和5使用，KM4被索引6和7使用，KM5被索引8和9使用，KM6被索引10和11使用，KM7被索引12和13使用，KM8被索引14、15和16使用', () => {
      // Count usage per template
      const usageCount = {};
      COURSE_TEMPLATES.forEach((t) => (usageCount[t.id] = 0));
      METHODOLOGY_REFERENCE.forEach((tool) => {
        tool.usedInTemplates.forEach((id) => {
          if (usageCount[id] !== undefined) {
            usageCount[id]++;
          }
        });
      });

      expect(usageCount.KM1).toBe(1);
      expect(usageCount.KM2).toBe(2);
      expect(usageCount.KM3).toBe(2);
      expect(usageCount.KM4).toBe(2);
      expect(usageCount.KM5).toBe(2);
      expect(usageCount.KM6).toBe(2);
      expect(usageCount.KM7).toBe(3); // BEST法(KM4+KM7) + 汉堡式面谈(KM7) + EME分析法(KM7)
      expect(usageCount.KM8).toBe(3);
    });
  });

  describe('getTemplateById', () => {
    it('正常输入时返回预期结果', () => {
      const result = getTemplateById('KM1');
      expect(result).toBeDefined();
      expect(result.id).toBe('KM1');
      expect(result.title).toBe('第一次团队亮相');
    });

    it('空字符串输入时返回undefined', () => {
      const result = getTemplateById('');
      expect(result).toBeUndefined();
    });

    it('null输入时不抛异常', () => {
      expect(() => getTemplateById(null)).not.toThrow();
      expect(getTemplateById(null)).toBeUndefined();
    });

    it('undefined输入时不抛异常', () => {
      expect(() => getTemplateById(undefined)).not.toThrow();
      expect(getTemplateById(undefined)).toBeUndefined();
    });

    it('不存在的ID返回undefined', () => {
      const result = getTemplateById('KM9');
      expect(result).toBeUndefined();
    });
  });

  describe('getTemplatesByPhase', () => {
    it('正常输入时返回预期结果', () => {
      const result = getTemplatesByPhase('phase_1');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('KM1');
      expect(result[1].id).toBe('KM2');
    });

    it('空字符串输入时返回空数组', () => {
      const result = getTemplatesByPhase('');
      expect(result).toHaveLength(0);
    });

    it('null输入时不抛异常', () => {
      expect(() => getTemplatesByPhase(null)).not.toThrow();
      expect(getTemplatesByPhase(null)).toHaveLength(0);
    });

    it('undefined输入时不抛异常', () => {
      expect(() => getTemplatesByPhase(undefined)).not.toThrow();
      expect(getTemplatesByPhase(undefined)).toHaveLength(0);
    });

    it('不存在的phaseId返回空数组', () => {
      const result = getTemplatesByPhase('phase_99');
      expect(result).toHaveLength(0);
    });
  });

  describe('getMethodologiesForTemplate', () => {
    it('正常输入时返回预期结果', () => {
      const result = getMethodologiesForTemplate('KM1');
      expect(result).toHaveLength(1);
      expect(result[0].index).toBe(1);
      expect(result[0].name).toBe('首次亮相三步法');
    });

    it('空字符串输入时返回空数组', () => {
      const result = getMethodologiesForTemplate('');
      expect(result).toHaveLength(0);
    });

    it('null输入时不抛异常', () => {
      expect(() => getMethodologiesForTemplate(null)).not.toThrow();
      expect(getMethodologiesForTemplate(null)).toHaveLength(0);
    });

    it('undefined输入时不抛异常', () => {
      expect(() => getMethodologiesForTemplate(undefined)).not.toThrow();
      expect(getMethodologiesForTemplate(undefined)).toHaveLength(0);
    });

    it('KM2返回2个方法论工具', () => {
      const result = getMethodologiesForTemplate('KM2');
      expect(result).toHaveLength(2);
      expect(result[0].index).toBe(2);
      expect(result[1].index).toBe(3);
    });

    it('KM4返回2个方法论工具', () => {
      const result = getMethodologiesForTemplate('KM4');
      expect(result).toHaveLength(2);
      expect(result[0].index).toBe(6);
      expect(result[1].index).toBe(7);
    });

    it('KM8返回3个方法论工具', () => {
      const result = getMethodologiesForTemplate('KM8');
      expect(result).toHaveLength(3);
      expect(result[0].index).toBe(14);
      expect(result[1].index).toBe(15);
      expect(result[2].index).toBe(16);
    });

    it('不存在的templateId返回空数组', () => {
      const result = getMethodologiesForTemplate('KM9');
      expect(result).toHaveLength(0);
    });
  });
});
