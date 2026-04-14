/**
 * PersonaBase unit tests
 */

const { PersonaBase } = require('../PersonaBase');

describe('PersonaBase', () => {
  let persona;

  beforeEach(() => {
    persona = new PersonaBase();
  });

  describe('abstract interface', () => {
    it('displayName should throw if not overridden', () => {
      expect(() => persona.displayName).toThrow('must implement');
    });

    it('personaId should throw if not overridden', () => {
      expect(() => persona.personaId).toThrow('must implement');
    });

    it('contexts should throw if not overridden', () => {
      expect(() => persona.contexts).toThrow('must implement');
    });
  });

  describe('handleMessage', () => {
    it('should throw if not overridden', async () => {
      await expect(persona.handleMessage({})).rejects.toThrow('must implement');
    });
  });

  describe('handleSessionEvent', () => {
    it('should be a no-op by default (returns null)', async () => {
      const result = await persona.handleSessionEvent('start', {});
      expect(result).toBeNull();
    });

    it('should accept end event without error', async () => {
      const result = await persona.handleSessionEvent('end', {});
      expect(result).toBeNull();
    });
  });
});
