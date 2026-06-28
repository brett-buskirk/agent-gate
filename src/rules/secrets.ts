import type { Rule, Finding } from './types';
import type { DiffModel } from '../diff/parse';
import type { Config } from '../config/schema';

const SECRET_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'AWS Access Key ID', pattern: /AKIA[0-9A-Z]{16}/ },
  {
    name: 'AWS Secret Access Key',
    pattern: /(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY)\s*[=:]\s*['"]?[A-Za-z0-9/+=]{40}['"]?/i,
  },
  { name: 'GitHub Personal Access Token', pattern: /ghp_[A-Za-z0-9]{36}/ },
  { name: 'GitHub OAuth Token', pattern: /gho_[A-Za-z0-9]{36}/ },
  { name: 'GitHub App Token', pattern: /ghs_[A-Za-z0-9]{36}/ },
  { name: 'GitHub Refresh Token', pattern: /ghr_[A-Za-z0-9]{76}/ },
  { name: 'Private Key Block', pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/ },
  {
    name: 'Generic API Key',
    pattern: /(?:api[_-]?key|apikey)\s*[=:]\s*['"]?[A-Za-z0-9_\-]{20,}['"]?/i,
  },
  {
    name: 'High-entropy secret assignment',
    pattern: /(?:PASSWORD|SECRET|TOKEN|PASSWD)\s*=\s*['"]?[A-Za-z0-9+/!@#$%^&*]{16,}['"]?/,
  },
  { name: 'Slack Token', pattern: /xox[baprs]-[0-9A-Za-z\-]{10,}/ },
  {
    name: 'Stripe Secret Key',
    pattern: /sk_(?:live|test)_[0-9a-zA-Z]{24,}/,
  },
];

export const secretsRule = {
  id: 'secrets',
  description: 'Scan added lines for leaked credentials and secrets',

  run(diff: DiffModel, config: Config): Finding[] {
    const { enabled, severity } = config.rules.secrets;
    if (!enabled) return [];

    const findings: Finding[] = [];

    for (const file of diff.files) {
      for (const chunk of file.chunks) {
        for (const line of chunk.lines) {
          if (line.type !== 'add') continue;

          for (const { name, pattern } of SECRET_PATTERNS) {
            if (pattern.test(line.content)) {
              findings.push({
                ruleId: 'secrets',
                severity,
                file: file.path,
                line: line.lineNumber,
                message: `Possible ${name} detected`,
                suggestion:
                  'Remove this secret immediately and rotate it. Use environment variables or a secrets manager instead.',
              });
              break;
            }
          }
        }
      }
    }

    return findings;
  },
} satisfies Rule;
