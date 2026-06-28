import type { DiffModel } from '../diff/parse';
import type { Config } from '../config/schema';
import type { IntentJudge } from '../intent/types';

export type { DiffModel, DiffFile, DiffChunk, DiffLine } from '../diff/parse';
export type { IntentJudge, IntentInput, IntentVerdict } from '../intent/types';

export type Severity = 'error' | 'warning' | 'info';

export interface Finding {
  ruleId: string;
  severity: Severity;
  file?: string;
  line?: number;
  message: string;
  suggestion?: string;
}

/** The PR's stated intent — present in Action mode, or via the CLI `--intent` flag. */
export interface PullRequestContext {
  title: string;
  body: string;
}

/** Optional context some rules need beyond the diff (currently the intent check). */
export interface RuleContext {
  pr?: PullRequestContext;
  intentJudge?: IntentJudge;
}

export interface Rule {
  id: string;
  description: string;
  run(diff: DiffModel, config: Config, context?: RuleContext): Finding[] | Promise<Finding[]>;
}
