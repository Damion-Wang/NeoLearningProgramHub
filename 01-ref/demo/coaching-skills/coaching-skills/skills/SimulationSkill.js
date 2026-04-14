/**
 * SimulationSkill — role-play simulation for scenario training.
 *
 * Extracted from RoleAgent (src/agents/execute/RoleAgent.js).
 * Generates in-character responses for management scenario practice.
 *
 * Input metadata:
 *   scenario: { scenarioId, title, role, context, objectives, description, ... }
 *
 * Output:
 *   { content: string, sideEffects: [], metadata: { shouldClose: boolean } }
 */

import { SkillBase } from './SkillBase';
import { getTokenBudget } from '../config/llm';

// End keywords that signal user wants to close the conversation
const END_KEYWORDS = ['结束', '先这样', '就这样', '没有了', '可以结束', 'ok'];

// Fallback: LLM 不可用时的诚实降级提示（按意图分类给出最相关的自助建议）
const FALLBACK_BY_INTENT = {
  'root-cause': '场景训练 AI 暂时不可用。你刚才在追问根因——试试用「5 Why」框架自行拆解，等服务恢复后我们继续。',
  'plan': '场景训练 AI 暂时不可用。你在做计划——试试把方案拆成「责任人-时间点-验收标准」三项，回来我帮你检验。',
  'status': '场景训练 AI 暂时不可用。你在了解进展——先把关键数据（当前值 vs 目标值）列出来，恢复后我们接着练。',
  'support': '场景训练 AI 暂时不可用。稍后回来，我们继续练习。',
  'summary': '场景训练 AI 暂时不可用。你可以先自行整理本轮练习的要点，恢复后我帮你复盘。',
  'generic': '场景训练 AI 暂时不可用，没法继续角色扮演。刷新页面或稍后再试。',
};

/**
 * Detect intent from user message for fallback routing
 */
const detectIntent = (message) => {
  const text = (message || '').toLowerCase();
  if (/(进展|现状|汇报|数据|情况)/.test(text)) return 'status';
  if (/(原因|根因|为什么|困难|问题|卡点)/.test(text)) return 'root-cause';
  if (/(计划|行动|下一步|安排|目标|里程碑|节奏)/.test(text)) return 'plan';
  if (/(支持|资源|协助|我来帮)/.test(text)) return 'support';
  if (/(总结|结论|回顾|收口)/.test(text)) return 'summary';
  return 'generic';
};

/**
 * Determine if the conversation should close
 */
const shouldCloseConversation = (message, assistantTurns) => {
  const text = (message || '').toLowerCase();
  if (assistantTurns >= 6) return true;
  return END_KEYWORDS.some((keyword) => text.includes(keyword));
};

export class SimulationSkill extends SkillBase {
  get name() {
    return 'simulation';
  }

  /**
   * Execute role-play simulation.
   *
   * @param {import('./SkillBase').SkillInput} input
   * @returns {Promise<import('./SkillBase').SkillOutput>}
   */
  async execute(input) {
    const userMessage = input.userMessage || '';
    const conversationHistory = input.conversationHistory || [];
    const scenario = input.metadata?.scenario || {};
    const userProfile = input.userProfile || null;

    const assistantTurns = conversationHistory.filter((m) => m.role === 'assistant').length;

    // Step 1: Check if conversation should close
    if (shouldCloseConversation(userMessage, assistantTurns)) {
      return {
        content: '好的，本轮练习到这里。建议回顾一下刚才的对话，整理你的关键决策点和可改进之处。',
        sideEffects: [],
        metadata: {
          shouldClose: true,
          closedReason: assistantTurns >= 6 ? 'max_turns' : 'user_keyword',
          assistantTurns,
        },
      };
    }

    // Step 2: LLM unavailable → rule-based fallback
    if (!this.isLLMAvailable) {
      return {
        content: this._getFallbackReply(userMessage, assistantTurns),
        sideEffects: [],
        metadata: {
          shouldClose: false,
          _fallback: true,
          assistantTurns,
        },
      };
    }

    // Step 3: Build system prompt and call LLM
    const systemPrompt = this._buildRoleSystemPrompt(scenario, userProfile);

    const contextMessages = conversationHistory.slice(-8).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const responseText = await this.callLLM(systemPrompt, contextMessages, {
      ...getTokenBudget('simulation'),
    });

    // Step 4: LLM returned empty → fallback
    if (!responseText) {
      return {
        content: this._getFallbackReply(userMessage, assistantTurns),
        sideEffects: [],
        metadata: {
          shouldClose: false,
          _fallback: true,
          assistantTurns,
        },
      };
    }

    return {
      content: responseText,
      sideEffects: [],
      metadata: {
        shouldClose: false,
        assistantTurns: assistantTurns + 1,
        intent: detectIntent(userMessage),
      },
    };
  }

  // ============================================================
  // System prompt builder
  // ============================================================

  /**
   * Build role-play system prompt from scenario context.
   * Adapted from RoleAgent._buildRoleSystemPrompt.
   */
  _buildRoleSystemPrompt(scenario, userProfile) {
    const parts = [
      '你是一个正在进行管理实战演练的 AI 角色，不是泛化聊天助手。',
      '',
      '【角色身份】',
      `角色姓名：${scenario?.role || '团队成员'}`,
      `场景标题：${scenario?.title || '管理场景训练'}`,
      `原始场景：${scenario?.description || ''}`,
      '',
      '【角色背景与性格】',
      `${scenario?.context || '你需要与管理者进行工作沟通'}`,
      '',
      '【个性化信息】',
      `个性化背景：${scenario?.personalizedBackground || ''}`,
      `训练目标：${(scenario?.personalizedObjectives || scenario?.objectives || []).join('；')}`,
      `匹配工具：${(scenario?.matchedTools || []).map((t) => t.name || t).join('；') || '无'}`,
      `推荐原因：${(scenario?.rationale || []).join('；') || '无'}`,
      '',
      '【用户信息】',
      `用户岗位：${userProfile?.roleLabel || '管理者'}`,
      `主要挑战：${(userProfile?.currentChallenges || []).join('；') || '未提供'}`,
      `期望结果：${(userProfile?.desiredOutcomes || []).join('；') || '未提供'}`,
      '',
      '【行为规则】',
      '1. 完全进入角色，用第一人称说话（"我最近...""我觉得..."），不要出戏',
      '2. 根据管理者的管理方式动态调整态度：',
      '   - 如果管理者表现出同理心、倾听、肯定，你逐渐变得开放、坦诚',
      '   - 如果管理者表现强硬、责备、施压，你变得更有防御性、焦虑或消极',
      '3. 回复简洁（50-100字），模拟真实对话节奏，避免长篇大论',
      '4. 紧贴场景推进，一次只推进一步',
      '5. 优先表达感受和具体事实，避免空泛表述',
      '6. 可以偶尔表达情绪（沮丧、担忧、期待、紧张等）',
      '',
      '现在开始角色扮演，用第一人称回复管理者。',
    ];

    return parts.join('\n');
  }

  // ============================================================
  // Fallback logic
  // ============================================================

  /**
   * LLM 不可用时的降级回复——诚实告知 + 按意图给自助建议。
   */
  _getFallbackReply(userMessage) {
    const intent = detectIntent(userMessage);
    return FALLBACK_BY_INTENT[intent] || FALLBACK_BY_INTENT.generic;
  }
}
