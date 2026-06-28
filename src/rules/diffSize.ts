import type { Rule, Finding } from './types';
import type { DiffModel } from '../diff/parse';
import type { Config } from '../config/schema';

export const diffSizeRule: Rule = {
  id: 'diff_size',
  description: 'Flag PRs that exceed file or line count thresholds',

  run(diff: DiffModel, config: Config): Finding[] {
    const { enabled, severity, max_files, max_lines } = config.rules.diff_size;
    if (!enabled) return [];

    const findings: Finding[] = [];
    const totalLines = diff.totalAdded + diff.totalDeleted;

    if (diff.files.length > max_files) {
      findings.push({
        ruleId: 'diff_size',
        severity,
        message: `PR modifies ${diff.files.length} files (max: ${max_files})`,
        suggestion: 'Consider splitting this PR into smaller, more focused changes.',
      });
    }

    if (totalLines > max_lines) {
      findings.push({
        ruleId: 'diff_size',
        severity,
        message: `PR changes ${totalLines} lines (max: ${max_lines})`,
        suggestion: 'Consider splitting this PR into smaller, more focused changes.',
      });
    }

    return findings;
  },
};
