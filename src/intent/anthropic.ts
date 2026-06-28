import type { IntentInput, IntentJudge, IntentVerdict } from './types';

const SYSTEM_PROMPT = `You are a meticulous code reviewer assessing scope alignment. You receive a pull request's stated intent (title and description) and a summary of the actual changes. Decide whether the changes stay within the stated intent.

Only flag a deviation when changes clearly do something the description does not mention or directly contradicts. Incidental refactors, tests, type definitions, and docs that support the stated work are in scope. Be conservative: when genuinely unsure, treat it as in scope. Report your judgment with the report_intent tool.`;

const INTENT_TOOL = {
  name: 'report_intent',
  description: "Report whether the diff matches the PR's stated intent.",
  input_schema: {
    type: 'object' as const,
    properties: {
      in_scope: {
        type: 'boolean',
        description: 'True if the changes are within the stated intent.',
      },
      confidence: { type: 'number', description: 'Confidence from 0 to 1.' },
      deviations: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific changes that go beyond the stated intent (empty if in scope).',
      },
      summary: { type: 'string', description: 'One-sentence explanation of the judgment.' },
    },
    required: ['in_scope', 'confidence', 'deviations', 'summary'],
  },
};

function buildPrompt(input: IntentInput): string {
  return [
    '## PR title',
    input.title || '(none)',
    '',
    '## PR description',
    input.body || '(none)',
    '',
    '## Diff summary (added lines)',
    input.diffSummary || '(empty)',
  ].join('\n');
}

/**
 * The production {@link IntentJudge}: asks Claude (via forced tool use, for a
 * typed verdict) whether the diff matches the stated intent. The SDK is
 * lazy-imported so it only loads when the intent rule actually runs.
 */
export function anthropicJudge(opts: { apiKey: string; model: string }): IntentJudge {
  return async (input: IntentInput): Promise<IntentVerdict> => {
    const { Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: opts.apiKey });

    const message = await client.messages.create({
      model: opts.model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [INTENT_TOOL],
      tool_choice: { type: 'tool', name: 'report_intent' },
      messages: [{ role: 'user', content: buildPrompt(input) }],
    });

    const block = message.content.find((b) => b.type === 'tool_use');
    if (!block || block.type !== 'tool_use') {
      throw new Error('Intent judge returned no structured verdict');
    }

    const v = block.input as Partial<IntentVerdict>;
    return {
      in_scope: Boolean(v.in_scope),
      confidence: typeof v.confidence === 'number' ? v.confidence : 0,
      deviations: Array.isArray(v.deviations) ? v.deviations : [],
      summary: typeof v.summary === 'string' ? v.summary : '',
    };
  };
}
