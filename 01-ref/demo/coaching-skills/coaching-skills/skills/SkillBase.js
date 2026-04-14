/**
 * SkillBase — unified contract for all Skills in the 4+1 Persona architecture.
 *
 * Each Skill is an independent, stateless module with a single entry point:
 * `execute(input)`. Personas orchestrate Skills; Skills don't know who calls them.
 *
 * Subclasses must implement:
 *   - get name()           — returns a unique skill identifier string
 *   - async execute(input) — receives SkillInput, returns SkillOutput
 *
 * @typedef {Object} SkillInput
 * @property {string}      context             - 'learner'|'manager'|'td-ld'|'admin'
 * @property {string}      [userMessage]       - current user message
 * @property {Array}       conversationHistory - prior turns
 * @property {Object|null} userProfile         - learner profile or null
 * @property {Object}      tenantConfig        - org-level config
 * @property {Object}      metadata            - skill-specific extra data
 *
 * @typedef {Object} SkillOutput
 * @property {string}      [content]     - text response
 * @property {Array}       [richContent] - charts, tables, previews
 * @property {Array}       sideEffects   - store writes, flow triggers
 * @property {Object}      metadata      - skill-specific output data
 */

import { getLLMClient, isLLMEnabled } from '../agents/core/LLMClient';

export class SkillBase {
  // ==================== Abstract members ====================

  /**
   * Unique skill identifier (subclass must override).
   * @returns {string}
   */
  get name() {
    throw new Error(`${this.constructor.name} must implement name getter`);
  }

  /**
   * Execute the skill (subclass must override).
   * @param {SkillInput} input
   * @returns {Promise<SkillOutput>}
   */
  async execute(input) {
    throw new Error(`${this.constructor.name}: execute() not implemented`);
  }

  // ==================== SkillInput builder ====================

  /**
   * Build a standardized SkillInput with sensible defaults.
   *
   * @param {Object} params
   * @param {string}      params.context
   * @param {string}      [params.userMessage]
   * @param {Array}       [params.conversationHistory]
   * @param {Object|null} [params.userProfile]
   * @param {Object}      [params.tenantConfig]
   * @param {Object}      [params.metadata]
   * @returns {SkillInput}
   */
  buildInput({
    context,
    userMessage,
    conversationHistory = [],
    userProfile = null,
    tenantConfig = {},
    metadata = {},
  } = {}) {
    return {
      context,
      userMessage,
      conversationHistory,
      userProfile,
      tenantConfig,
      metadata,
    };
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

  /**
   * Call LLM expecting a JSON response.
   * @param {string} systemPrompt
   * @param {Array<{role: string, content: string}>} messages
   * @param {Object} [options]
   * @returns {Promise<Object|null>}
   */
  async callLLMForJSON(systemPrompt, messages = [], options = {}) {
    return this.llm.chatJSON(
      [{ role: 'system', content: systemPrompt }, ...messages],
      options
    );
  }
}
