/**
 * SkillBase tests — TDD Red→Green→Refactor
 *
 * Covers:
 * 1. Abstract `name` getter throws if not implemented
 * 2. Abstract `execute()` throws "Not implemented" if not overridden
 * 3. Concrete subclass `execute()` works and returns SkillOutput shape
 * 4. `buildInput()` creates standardized SkillInput with correct defaults
 * 5. `isLLMAvailable` returns boolean (from LLMClient)
 */

import { SkillBase } from '../SkillBase';

// ---------------------------------------------------------------------------
// Test double — concrete subclass for testing
// ---------------------------------------------------------------------------

class TestSkill extends SkillBase {
  get name() {
    return 'test-skill';
  }

  async execute(input) {
    return {
      content: `echo: ${input.userMessage}`,
      sideEffects: [],
      metadata: { processed: true },
    };
  }
}

// ---------------------------------------------------------------------------
// Helper: bare subclass that does NOT override abstract members
// ---------------------------------------------------------------------------

class BareSkill extends SkillBase {}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SkillBase', () => {
  describe('abstract name getter', () => {
    it('throws when name is not implemented in subclass', () => {
      const skill = new BareSkill();
      expect(() => skill.name).toThrow(/must implement/i);
    });

    it('returns the skill name when implemented', () => {
      const skill = new TestSkill();
      expect(skill.name).toBe('test-skill');
    });
  });

  describe('abstract execute()', () => {
    it('throws "Not implemented" when execute() is not overridden', async () => {
      const skill = new BareSkill();
      await expect(skill.execute({})).rejects.toThrow(/not implemented/i);
    });

    it('concrete subclass execute() resolves with SkillOutput shape', async () => {
      const skill = new TestSkill();
      const input = skill.buildInput({ context: 'learner', userMessage: 'hello' });
      const output = await skill.execute(input);

      // SkillOutput shape — content is optional string
      expect(typeof output.content).toBe('string');
      // sideEffects must be an array
      expect(Array.isArray(output.sideEffects)).toBe(true);
      // metadata must be an object
      expect(output.metadata).toBeDefined();
      expect(typeof output.metadata).toBe('object');
    });
  });

  describe('buildInput()', () => {
    let skill;
    beforeEach(() => {
      skill = new TestSkill();
    });

    it('passes context and userMessage through', () => {
      const input = skill.buildInput({ context: 'manager', userMessage: 'test message' });
      expect(input.context).toBe('manager');
      expect(input.userMessage).toBe('test message');
    });

    it('defaults conversationHistory to []', () => {
      const input = skill.buildInput({ context: 'learner' });
      expect(input.conversationHistory).toEqual([]);
    });

    it('defaults tenantConfig to {}', () => {
      const input = skill.buildInput({ context: 'learner' });
      expect(input.tenantConfig).toEqual({});
    });

    it('defaults metadata to {}', () => {
      const input = skill.buildInput({ context: 'learner' });
      expect(input.metadata).toEqual({});
    });

    it('respects provided conversationHistory', () => {
      const history = [{ role: 'user', content: 'hi' }];
      const input = skill.buildInput({ context: 'td-ld', conversationHistory: history });
      expect(input.conversationHistory).toBe(history);
    });

    it('respects provided tenantConfig', () => {
      const config = { orgId: 'acme' };
      const input = skill.buildInput({ context: 'admin', tenantConfig: config });
      expect(input.tenantConfig).toBe(config);
    });

    it('respects provided metadata', () => {
      const meta = { scenarioId: 42 };
      const input = skill.buildInput({ context: 'learner', metadata: meta });
      expect(input.metadata).toBe(meta);
    });

    it('userProfile defaults to null when not provided', () => {
      const input = skill.buildInput({ context: 'learner' });
      expect(input.userProfile).toBeNull();
    });

    it('passes userProfile through when provided', () => {
      const profile = { userId: 'u1', level: 'novice' };
      const input = skill.buildInput({ context: 'learner', userProfile: profile });
      expect(input.userProfile).toBe(profile);
    });
  });

  describe('isLLMAvailable', () => {
    it('returns a boolean', () => {
      const skill = new TestSkill();
      expect(typeof skill.isLLMAvailable).toBe('boolean');
    });
  });

  describe('LLM accessors', () => {
    it('llm getter returns an object (the LLMClient instance)', () => {
      const skill = new TestSkill();
      expect(skill.llm).toBeDefined();
      expect(typeof skill.llm).toBe('object');
    });
  });
});
