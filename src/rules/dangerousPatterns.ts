import type { Rule, Finding } from './types';
import type { DiffModel } from '../diff/parse';
import type { Config } from '../config/schema';

export const dangerousPatternsRule: Rule = {
  id: 'dangerous_patterns',
  description: 'Flag added lines matching a configurable regex denylist',

  run(diff: DiffModel, config: Config): Finding[] {
    const { enabled, severity, patterns } = config.rules.dangerous_patterns;
    if (!enabled) return [];

    let compiled: Array<{ regex: RegExp; raw: string }>;
    try {
      compiled = patterns.map((p) => ({ regex: new RegExp(p), raw: p }));
    } catch (err) {
      throw new Error(
        `dangerous_patterns: invalid regex pattern — ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    const findings: Finding[] = [];

    for (const file of diff.files) {
      for (const chunk of file.chunks) {
        for (const line of chunk.lines) {
          if (line.type !== 'add') continue;

          for (const { regex, raw } of compiled) {
            if (regex.test(line.content)) {
              findings.push({
                ruleId: 'dangerous_patterns',
                severity,
                file: file.path,
                line: line.lineNumber,
                message: `Added line matches dangerous pattern \`${raw}\``,
                suggestion:
                  'Review this change carefully — it matches a pattern flagged as potentially dangerous.',
              });
              break;
            }
          }
        }
      }
    }

    return findings;
  },
};
