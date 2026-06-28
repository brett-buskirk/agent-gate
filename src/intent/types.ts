/** A structured judgment of whether a diff matches the PR's stated intent. */
export interface IntentVerdict {
  /** True when the changes stay within the stated intent. */
  in_scope: boolean;
  /** Confidence from 0 to 1. */
  confidence: number;
  /** Specific changes that go beyond the stated intent (empty when in scope). */
  deviations: string[];
  /** One-sentence explanation of the judgment. */
  summary: string;
}

/** What the judge needs to assess scope alignment. */
export interface IntentInput {
  title: string;
  body: string;
  diffSummary: string;
}

/**
 * Judges whether a diff stays within a PR's stated intent. Injected into the
 * intent rule so it is testable without any network/API calls.
 */
export type IntentJudge = (input: IntentInput) => Promise<IntentVerdict>;
