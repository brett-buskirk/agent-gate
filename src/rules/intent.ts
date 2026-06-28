import type { Rule, Finding, RuleContext } from './types';
import type { DiffModel } from '../diff/parse';
import type { Config } from '../config/schema';
import { summarizeDiff } from '../intent/summarize';

export const intentRule = {
  id: 'intent',
  description: "Use an LLM to check whether the diff matches the PR's stated intent (opt-in)",

  async run(diff: DiffModel, config: Config, context?: RuleContext): Promise<Finding[]> {
    const cfg = config.rules.intent;
    if (!cfg.enabled) return [];

    const pr = context?.pr;
    // No stated intent to compare against (e.g. CLI without --intent) → skip silently.
    if (!pr || (!pr.title && !pr.body)) return [];

    const judge = context?.intentJudge;
    if (!judge) {
      return [
        {
          ruleId: 'intent',
          severity: 'info',
          message: 'Intent check is enabled but no judge is configured.',
          suggestion: 'Set ANTHROPIC_API_KEY so AgentGate can run the intent check.',
        },
      ];
    }

    let verdict;
    try {
      verdict = await judge({
        title: pr.title,
        body: pr.body,
        diffSummary: summarizeDiff(diff, cfg.max_diff_bytes),
      });
    } catch (err) {
      // A flaky API must never block the gate — report and move on.
      return [
        {
          ruleId: 'intent',
          severity: 'info',
          message: `Intent check could not run: ${err instanceof Error ? err.message : String(err)}`,
          suggestion: 'This is not a blocking failure; the deterministic rules still ran.',
        },
      ];
    }

    if (verdict.in_scope) return [];

    return [
      {
        ruleId: 'intent',
        severity: cfg.severity,
        message:
          verdict.summary || 'The changes appear to go beyond what the PR description states.',
        suggestion: verdict.deviations.length
          ? `Out of stated scope: ${verdict.deviations.join('; ')}`
          : 'Re-scope the PR, or update its description to cover these changes.',
      },
    ];
  },
} satisfies Rule;
