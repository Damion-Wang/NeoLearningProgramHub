/**
 * PersonaBase — abstract base class for all Personas in the 4+1 architecture.
 *
 * A Persona is a user-facing identity that composes multiple Skills.
 * Personas handle high-level conversation flow; Skills handle specific capabilities.
 *
 * Subclasses must implement:
 *   - get displayName()  — e.g., '老段'
 *   - get personaId()    — e.g., 'coach'
 *   - get contexts()     — e.g., ['learner']
 *   - async handleMessage({ userMessage, conversationHistory, userProfile, context, metadata })
 *
 * @typedef {Object} PersonaOutput
 * @property {string}      content      — text response
 * @property {Array}       [richContent] — charts, tables, previews
 * @property {Object}      metadata     — persona-specific metadata
 * @property {Array}       sideEffects  — async tasks to execute after response
 */

import { getLLMClient, isLLMEnabled } from '../agents/core/LLMClient';

export class PersonaBase {
  /**
   * Display name shown in UI (subclass must override).
   * @returns {string}
   */
  get displayName() {
    throw new Error(`${this.constructor.name} must implement displayName getter`);
  }

  /**
   * Unique persona identifier (subclass must override).
   * @returns {string}
   */
  get personaId() {
    throw new Error(`${this.constructor.name} must implement personaId getter`);
  }

  /**
   * Contexts this persona serves (subclass must override).
   * @returns {string[]}
   */
  get contexts() {
    throw new Error(`${this.constructor.name} must implement contexts getter`);
  }

  /**
   * Handle a user message and return a PersonaOutput.
   *
   * @param {Object} params
   * @param {string}      params.userMessage
   * @param {Array}       params.conversationHistory
   * @param {Object|null} params.userProfile
   * @param {string}      params.context
   * @param {Object}      params.metadata
   * @returns {Promise<PersonaOutput>}
   */
  async handleMessage(params) {
    throw new Error(`${this.constructor.name} must implement handleMessage()`);
  }

  /**
   * Handle a session lifecycle event.
   * Default: no-op returning null.
   *
   * @param {'start'|'end'|'pause'} event
   * @param {Object} params
   * @returns {Promise<PersonaOutput|null>}
   */
  async handleSessionEvent(event, params) {
    return null;
  }

  // ==================== LLM convenience ====================

  /**
   * LLMClient singleton.
   * @returns {import('../agents/core/LLMClient').LLMClient}
   */
  get llm() {
    return getLLMClient();
  }

  /**
   * Whether LLM is configured and available.
   * @returns {boolean}
   */
  get isLLMAvailable() {
    return isLLMEnabled();
  }

  /**
   * Call LLM for a text response.
   * @param {string} systemPrompt
   * @param {Array<{role: string, content: string}>} messages
   * @param {Object} [options]
   * @returns {Promise<string>}
   */
  async callLLM(systemPrompt, messages = [], options = {}) {
    return this.llm.chat(
      [{ role: 'system', content: systemPrompt }, ...messages],
      options
    );
  }
}
