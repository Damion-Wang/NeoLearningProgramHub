/**
 * CoachPersona (Leo) — primary coaching/tutoring persona for learner context.
 *
 * Composes 6 Skills:
 *   - CoachingSkill (primary — coaching conversation)
 *   - SimulationSkill (scenario role-play)
 *   - EvaluationSkill (turn evaluation + evidence + feedback)
 *   - InsightCaptureSkill (async insight scanning)
 *   - PlanningSkill (detectTodo async)
 *   - ContentSkill (knowledge context injection)
 */

import { PersonaBase } from './PersonaBase';
import { CoachingSkill } from '../skills/CoachingSkill';
import { EvaluationSkill } from '../skills/EvaluationSkill';
import { InsightCaptureSkill } from '../skills/InsightCaptureSkill';
import { PlanningSkill } from '../skills/PlanningSkill';
import { ContentSkill } from '../skills/ContentSkill';
import { getPersonaEngine } from '../modules/coachPersonaEngine';
import { classifySignal } from '../skills/signalDetection';
import { parseComponentIntent } from '../services/componentIntentParser';

// Keywords that trigger knowledge fetch via ContentSkill
const KNOWLEDGE_KEYWORDS = /工具|方法|框架|模型|理论|技巧|怎么做|推荐/;

export class CoachPersona extends PersonaBase {
  constructor() {
    super();
    this.coachingSkill = new CoachingSkill();
    this.evaluationSkill = new EvaluationSkill();
    this.insightSkill = new InsightCaptureSkill();
    this.planningSkill = new PlanningSkill();
    this.contentSkill = new ContentSkill();
    // panelHint 去重：记录上一次 hint，避免连续重复
    this._lastPanelHint = null;
  }

  get displayName() {
    return 'Leo';
  }

  get personaId() {
    return 'coach';
  }

  get contexts() {
    return ['learner'];
  }

  /**
   * Handle a coaching message.
   *
   * Flow:
   * 1. Check if knowledge fetch needed → ContentSkill.getToolContext
   * 2. Call CoachingSkill.execute() with knowledge insert + cross-agent context
   * 3. Build async side effects (detectTodo, insightScan)
   * 4. Build panelHint from coaching metadata
   * 5. Return PersonaOutput
   */
  async handleMessage({ userMessage, conversationHistory, userProfile, context, metadata = {} }) {
    const personaEngine = getPersonaEngine();
    const crossAgentContext = personaEngine.buildCrossAgentContext({
      userProfile,
      conversationHistory,
    });

    // Step 1: Knowledge context injection if needed
    let knowledgeInsert = '';
    if (KNOWLEDGE_KEYWORDS.test(userMessage)) {
      try {
        const contentResult = await this.contentSkill.execute(
          this.contentSkill.buildInput({
            context: context || 'learner',
            userMessage,
            userProfile,
            metadata: { action: 'getToolContext', toolIds: [], userMessage },
          })
        );
        knowledgeInsert = contentResult.metadata?.contextInsert || '';
      } catch {
        // Silently fail — knowledge is optional
      }
    }

    // Step 1b: Signal detection (私教系统 §3.1)
    const signalDetection = classifySignal({
      userMessage,
      responseDepth: metadata?.responseDepth,
      masteryScore: userProfile?.competencyMap?.[metadata?.conceptId]?.score,
      behaviorScore: userProfile?.behaviorChangeChain?.[0]?.score,
    });

    // Step 2: Call CoachingSkill
    const coachingResult = await this.coachingSkill.execute(
      this.coachingSkill.buildInput({
        context: context || 'learner',
        userMessage,
        conversationHistory,
        userProfile,
        metadata: {
          crossAgentContext,
          knowledgeInsert,
          signalDetection,
          ...metadata,
        },
      })
    );

    // Step 3: Build async side effects (merge Skill sideEffects + Persona sideEffects)
    const skillSideEffects = coachingResult.sideEffects || [];
    const sideEffects = [
      ...skillSideEffects, // RC-1: propagate CoachingSkill's PPP observation sideEffects
      {
        type: 'ASYNC_DETECT_TODO',
        execute: () =>
          this.planningSkill.execute(
            this.planningSkill.buildInput({
              context: context || 'learner',
              userMessage,
              conversationHistory,
              userProfile,
              metadata: {
                action: 'detectTodo',
                userText: userMessage,
                assistantText: coachingResult.content || '',
                conversationHistory,
              },
            })
          ),
      },
      {
        type: 'ASYNC_INSIGHT_SCAN',
        execute: () =>
          this.insightSkill.execute(
            this.insightSkill.buildInput({
              context: context || 'learner',
              userMessage,
              conversationHistory,
              userProfile,
              metadata: {
                action: 'scanForInsights',
                userText: userMessage,
                conversationHistory,
                sourceType: 'coach',
              },
            })
          ),
      },
    ];

    // Step 4: Build panelHint from coaching metadata
    const panelHint = this._buildPanelHint(coachingResult.metadata);

    // Step 5: Parse componentIntent from coaching result metadata
    const richComponents = [];
    const intent = coachingResult.metadata?.componentIntent;
    if (intent) {
      const rc = parseComponentIntent(intent);
      if (rc) richComponents.push(rc);
    }

    // Step 6: Return PersonaOutput
    return {
      content: coachingResult.content,
      richComponents: richComponents.length > 0 ? richComponents : undefined,
      sideEffects,
      metadata: {
        persona: coachingResult.metadata?.persona || {},
        strategy: coachingResult.metadata?.strategy || null,
        frameworkId: coachingResult.metadata?.frameworkId || null,
        signalDetection,
        panelHint,
      },
    };
  }

  /**
   * Handle session lifecycle events.
   *
   * 'end' → return BATCH_INSIGHT_EXTRACTION sideEffect
   */
  async handleSessionEvent(event, params = {}) {
    if (event === 'end') {
      const { conversationHistory = [] } = params;

      return {
        content: null,
        sideEffects: [
          {
            type: 'BATCH_INSIGHT_EXTRACTION',
            execute: () =>
              this.insightSkill.execute(
                this.insightSkill.buildInput({
                  context: 'learner',
                  conversationHistory,
                  metadata: {
                    action: 'extractSessionInsights',
                    conversationHistory,
                    sourceType: 'coach',
                  },
                })
              ),
          },
        ],
        metadata: {},
      };
    }

    return null;
  }

  /**
   * Build panelHint from coaching metadata.
   * Mirrors Orchestrator._buildPanelHint logic.
   */
  _buildPanelHint(coachingMeta) {
    const strategy = coachingMeta?.strategy;
    const frameworkId = coachingMeta?.frameworkId;

    let hint = null;
    if (strategy === 'framework_guided' && frameworkId) {
      hint = {
        type: 'FRAMEWORK_DISPLAY',
        frameworkId,
        analysisStep: 0,
        actionPlan: null,
      };
    } else if (strategy === 'plan') {
      hint = {
        type: 'ACTION_PLAN',
        frameworkId: null,
        analysisStep: null,
        actionPlan: null,
      };
    }

    // 去重：与上一次 hint 相同则不重复发送
    if (hint && this._lastPanelHint
      && hint.type === this._lastPanelHint.type
      && hint.frameworkId === this._lastPanelHint.frameworkId) {
      return null;
    }

    this._lastPanelHint = hint;
    return hint;
  }
}
