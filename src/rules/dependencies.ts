import type { Rule, Finding } from './types';
import type { DiffModel } from '../diff/parse';
import type { Config } from '../config/schema';

export const dependenciesRule: Rule = {
  id: 'dependencies',
  description: 'Flag added or changed entries in dependency manifests',

  run(diff: DiffModel, config: Config): Finding[] {
    const { enabled, severity, manifests } = config.rules.dependencies;
    if (!enabled) return [];

    const findings: Finding[] = [];

    for (const file of diff.files) {
      const filename = file.path.split('/').pop() ?? file.path;
      if (manifests.includes(filename) && (file.added > 0 || file.deleted > 0)) {
        findings.push({
          ruleId: 'dependencies',
          severity,
          file: file.path,
          message: `Dependency manifest modified: ${file.path}`,
          suggestion:
            'Review added or removed dependencies carefully — agents silently adding packages is a supply-chain risk.',
        });
      }
    }

    return findings;
  },
};
