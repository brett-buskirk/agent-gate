import { matchesAny } from '../utils/glob';
import type { Rule, Finding } from './types';
import type { DiffModel } from '../diff/parse';
import type { Config } from '../config/schema';

export const scopeRule: Rule = {
  id: 'scope',
  description: 'Flag changes to files outside the allowed scope or inside a denied path set',

  run(diff: DiffModel, config: Config): Finding[] {
    const { enabled, severity, allow, deny } = config.rules.scope;
    if (!enabled) return [];

    const findings: Finding[] = [];

    for (const file of diff.files) {
      const { path } = file;

      if (deny.length > 0 && matchesAny(path, deny)) {
        findings.push({
          ruleId: 'scope',
          severity,
          file: path,
          message: `File is in a denied path: ${path}`,
          suggestion:
            'Remove changes to this file or update the deny list in .agentgate.yml if this is intentional.',
        });
        continue;
      }

      if (allow && allow.length > 0 && !matchesAny(path, allow)) {
        findings.push({
          ruleId: 'scope',
          severity,
          file: path,
          message: `File is outside the allowed scope: ${path}`,
          suggestion:
            'Remove changes to this file or add it to the allow list in .agentgate.yml.',
        });
      }
    }

    return findings;
  },
};
