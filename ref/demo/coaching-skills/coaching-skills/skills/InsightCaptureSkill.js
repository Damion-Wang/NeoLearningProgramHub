/**
 * InsightCaptureSkill — conversation insight extraction extracted from InsightCaptureAgent.
 *
 * Actions:
 *   - scanForInsights:         single-turn experience fragment detection
 *   - extractSessionInsights:  end-of-session batch extraction
 *
 * Fragment schema: { id, title, content, summary, sourceType, sourceExcerpt,
 *                    relatedCapabilities, themeTag, status: 'draft' }
 *
 * Default action: scanForInsights
 */

import { SkillBase } from './SkillBase';

// Experience fragment status
export const InsightStatus = {
  DRAFT: 'draft',
  PENDING_CONFIRMATION: 'pending_confirmation',
  CONFIRMED: 'confirmed',
};

export class InsightCaptureSkill extends SkillBase {
  // Stateless: session draft count passed via input.metadata.sessionDraftCount
  // Max drafts per session: 5 (configurable via input.metadata.maxSessionDrafts)

  get name() {
    return 'insight_capture';
  }

  /**
   * @param {import('./SkillBase').SkillInput} input
   * @returns {Promise<import('./SkillBase').SkillOutput>}
   */
  async execute(input) {
    const { metadata: inputMeta = {} } = input;
    const action = inputMeta.action || 'scanForInsights';

    switch (action) {
      case 'scanForInsights':
        return this._scanForInsights(inputMeta, input.userProfile);
      case 'extractSessionInsights':
        return this._extractSessionInsights(inputMeta, input.userProfile);
      default:
        return this._scanForInsights(inputMeta, input.userProfile);
    }
  }

  // ==================== scanForInsights ====================

  async _scanForInsights(meta, userProfile) {
    const {
      userText = '',
      conversationHistory = [],
      sourceType = 'coach',
      activeScenario = null,
    } = meta;

    // Quick pre-check: text too short
    if (!userText || userText.length < 20) {
      return {
        sideEffects: [],
        metadata: { hasInsight: false, insight: null, reason: 'text_too_short' },
      };
    }

    // Frequency control: scan every 5 user messages, max per session
    const messageCount = conversationHistory.filter((m) => m.role === 'user').length;
    const sessionDraftCount = meta?.sessionDraftCount || 0;
    const maxSessionDrafts = meta?.maxSessionDrafts || 5;
    if (!this._shouldScan(messageCount, sessionDraftCount, maxSessionDrafts)) {
      return {
        sideEffects: [],
        metadata: { hasInsight: false, insight: null, reason: 'frequency_skip' },
      };
    }

    const hasExperienceSignal = this._hasExperienceSignal(userText);

    if (!hasExperienceSignal && !this.isLLMAvailable) {
      return {
        sideEffects: [],
        metadata: { hasInsight: false, insight: null, reason: 'no_signal_no_llm' },
      };
    }

    if (!this.isLLMAvailable) {
      if (hasExperienceSignal) {
        const insight = this._buildRuleBasedInsight(userText, sourceType, userProfile, activeScenario);
        return {
          sideEffects: [],
          metadata: { hasInsight: true, insight, _fallback: true },
        };
      }
      return {
        sideEffects: [],
        metadata: { hasInsight: false, insight: null, _fallback: true },
      };
    }

    // LLM scan
    const recentContext = conversationHistory
      .slice(-4)
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');
    const systemPrompt = this._buildScanPrompt(userText, recentContext, sourceType, userProfile);
    const parsed = await this.callLLMForJSON(systemPrompt, [], { maxTokens: 200 });

    if (!parsed || !parsed.hasInsight) {
      return {
        sideEffects: [],
        metadata: { hasInsight: false, insight: null },
      };
    }

    const insight = this._buildInsightFragment(parsed, sourceType, activeScenario?.scenarioId, userText);
    insight._invitation = this._generateInvitation(insight);
    // Draft count tracked by caller via metadata (stateless skill)

    return {
      sideEffects: [],
      metadata: { hasInsight: true, insight },
    };
  }

  // ==================== extractSessionInsights ====================

  async _extractSessionInsights(meta, userProfile) {
    const {
      conversationHistory = [],
      sourceType = 'scenario',
      activeScenario = null,
    } = meta;

    const userMessages = conversationHistory
      .filter((m) => m.role === 'user')
      .map((m) => m.content);

    if (userMessages.length === 0) {
      return {
        sideEffects: [],
        metadata: { insights: [], reason: 'no_user_messages' },
      };
    }

    if (!this.isLLMAvailable) {
      const insights = userMessages
        .filter((text) => this._hasExperienceSignal(text))
        .map((text) => this._buildRuleBasedInsight(text, sourceType, userProfile, activeScenario));

      return {
        sideEffects: [],
        metadata: { insights: insights.slice(0, 3), _fallback: true },
      };
    }

    const systemPrompt = this._buildSessionExtractPrompt(
      userMessages,
      sourceType,
      userProfile,
      activeScenario
    );
    const parsed = await this.callLLMForJSON(systemPrompt, [], { maxTokens: 400 });

    if (!parsed || !Array.isArray(parsed.insights)) {
      return {
        sideEffects: [],
        metadata: { insights: [], _fallback: true },
      };
    }

    const insights = parsed.insights.slice(0, 3).map((item) => {
      const fragment = this._buildInsightFragment(
        item,
        sourceType,
        activeScenario?.scenarioId,
        item.content
      );
      fragment._invitation = this._generateInvitation(fragment);
      // Draft count tracked by caller via metadata (stateless skill)
      return fragment;
    });

    return {
      sideEffects: [],
      metadata: { insights, extractedCount: insights.length },
    };
  }

  // ==================== Helpers ====================

  _shouldScan(messageCount, sessionDraftCount = 0, maxSessionDrafts = 5) {
    if (sessionDraftCount >= maxSessionDrafts) return false;
    return messageCount > 0 && messageCount % 5 === 0;
  }

  _hasExperienceSignal(text) {
    const signals = [
      /我(发现|学到|总结|意识到|体会到)/,
      /经验(是|就是)/,
      /(最大的|关键的|重要的)(收获|教训|发现)/,
      /(成功|失败|踩坑|搞定|突破)(了|的)/,
      /(后来|最终|结果)(是|证明|发现)/,
      /(我的(方法|做法|策略)|有效的(方式|办法))/,
      /(先.*再.*最后|第一步.*第二步)/,
      /(如果重来|回头看|反思|复盘)/,
      /(应该|不应该|下次|以后)/,
    ];
    return signals.some((regex) => regex.test(text));
  }

  _detectAhaMoment(userText, parsed) {
    const ahaSignals = [
      /原来(如此|是这样|这就是)/,
      /我(突然|终于|现在)(明白|理解|懂了|意识到)/,
      /恍然大悟|茅塞顿开|醍醐灌顶/,
      /以前(我|一直).*现在(我|发现|觉得)/,
      /没想到|想不到|出乎意料/,
      /完全(不同|改变|颠覆)了.*想法/,
      /(核心|关键|本质|根本)(是|在于|原来是)/,
      /最(重要|关键)的(一点|发现|教训)/,
    ];
    if (ahaSignals.some((r) => r.test(userText))) return true;
    if (parsed?.title && /顿悟|发现|突破|转变/.test(parsed.title)) return true;
    return false;
  }

  _buildInsightFragment(parsed, sourceType, sessionId, userText) {
    return {
      id: `insight_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: parsed.title || '管理经验',
      content: parsed.content || '',
      summary: (parsed.content || '').slice(0, 80),
      sourceType,
      sourceSessionId: sessionId || '',
      sourceExcerpt: (userText || '').slice(0, 150),
      relatedCapabilities: Array.isArray(parsed.capabilities)
        ? parsed.capabilities.slice(0, 3)
        : [],
      isAhaMoment: this._detectAhaMoment(userText || '', parsed),
      captureType: 'auto',
      status: InsightStatus.DRAFT,
      themeTag: Array.isArray(parsed.tags) ? (parsed.tags[0] || '') : '',
      userTags: [],
      createdAt: new Date().toISOString(),
      confirmedAt: null,
      userNotes: '',
    };
  }

  _buildRuleBasedInsight(userText, sourceType, userProfile, activeScenario) {
    return {
      id: `insight_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      sourceType,
      sourceSessionId: activeScenario?.scenarioId || 'coach',
      title: '管理实践经验',
      content: userText.slice(0, 300),
      summary: userText.slice(0, 80),
      sourceExcerpt: userText.slice(0, 150),
      relatedCapabilities: [],
      isAhaMoment: false,
      captureType: 'auto',
      status: InsightStatus.DRAFT,
      themeTag: '',
      userTags: [],
      confirmedAt: null,
      userNotes: '',
    };
  }

  _generateInvitation(fragment) {
    const excerpt = fragment.sourceExcerpt || fragment.content || '';
    if (!excerpt) return '刚才有个想法挺有意思——要留下来吗？';
    const short = excerpt.length > 60 ? excerpt.slice(0, 60) + '...' : excerpt;
    return `刚才你提到的「${short}」挺有意思——`;
  }

  _buildScanPrompt(userText, recentContext, sourceType, userProfile) {
    return [
      '你是一位经验萃取专家。分析以下对话片段，判断用户是否分享了有价值的管理经验、',
      '成功/失败案例、独特洞察或实践心得。只在确实有价值时才提取，避免过度捕捉。',
      '',
      `【对话来源】${sourceType === 'scenario' ? '场景训练' : sourceType === 'retrospective' ? '复盘' : 'AI教练对话'}`,
      `【用户岗位】${userProfile?.roleLabel || '管理者'}`,
      `【用户最新输入】${userText}`,
      recentContext ? `【近期对话上下文】\n${recentContext}` : '',
      '',
      '如果包含有价值的经验，输出JSON：',
      '{"hasInsight":true,"title":"经验标题","content":"结构化经验内容","businessContext":"业务场景",',
      '"capabilities":["关联能力"],"tools":["关联工具"],"tags":["标签"]}',
      '',
      '如果没有明显的经验价值，输出：',
      '{"hasInsight":false}',
      '',
      '仅输出JSON，不要有其他文字。',
    ].join('\n');
  }

  _buildSessionExtractPrompt(userMessages, sourceType, userProfile, activeScenario) {
    const messagesText = userMessages
      .map((msg, i) => `[用户第${i + 1}轮] ${msg.slice(0, 200)}`)
      .join('\n');

    return [
      '你是一位经验萃取专家。分析以下完整会话中用户的所有发言，',
      '提取有价值的管理经验、实践心得或独特洞察。',
      '只提取真正有价值的经验，最多3条。如果没有，返回空数组。',
      '',
      `【对话来源】${sourceType === 'scenario' ? '场景训练' : 'AI教练对话'}`,
      activeScenario ? `【场景】${activeScenario.title}` : '',
      `【用户岗位】${userProfile?.roleLabel || '管理者'}`,
      '',
      '【用户发言记录】',
      messagesText,
      '',
      '请输出JSON：',
      '{"insights":[{"title":"经验标题","content":"结构化经验内容（用户原话+提炼）",',
      '"businessContext":"业务场景","capabilities":["关联能力"],"tools":["关联工具"],"tags":["标签"]}]}',
      '',
      '如果没有值得提取的经验，输出：{"insights":[]}',
      '仅输出JSON，不要有其他文字。',
    ].join('\n');
  }
}
