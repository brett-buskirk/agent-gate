import { rules } from './rules';
import type { Config } from './config/schema';
import type { DiffModel } from './diff/parse';
import type { Finding, Severity } from './rules/types';

export type Verdict = 'pass' | 'warn' | 'fail';

export interface EngineResult {
  findings: Finding[];
  verdict: Verdict;
  counts: { error: number; warning: number; info: number };
}

function computeVerdict(
  counts: EngineResult['counts'],
  failOn: Config['fail_on'],
): Verdict {
  if (failOn === 'error' && counts.error > 0) return 'fail';
  if (failOn === 'warning' && (counts.error > 0 || counts.warning > 0)) return 'fail';
  if (counts.error > 0 || counts.warning > 0) return 'warn';
  return 'pass';
}

export function runEngine(diff: DiffModel, config: Config): EngineResult {
  const findings = rules.flatMap((rule) => rule.run(diff, config));

  const counts = findings.reduce(
    (acc, f) => {
      acc[f.severity as Severity]++;
      return acc;
    },
    { error: 0, warning: 0, info: 0 },
  );

  const verdict = computeVerdict(counts, config.fail_on);

  return { findings, verdict, counts };
}
