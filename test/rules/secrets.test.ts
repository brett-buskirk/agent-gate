import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parsePatch } from '../../src/diff/parse';
import { secretsRule } from '../../src/rules/secrets';
import { ConfigSchema } from '../../src/config/schema';

const FIXTURES = join(__dirname, '../fixtures');
const defaults = ConfigSchema.parse({ version: 1 });

function fixture(name: string) {
  return parsePatch(readFileSync(join(FIXTURES, name), 'utf8'));
}

describe('secrets rule', () => {
  it('passes a clean diff with no secrets', () => {
    const diff = fixture('clean.diff');
    expect(secretsRule.run(diff, defaults)).toHaveLength(0);
  });

  it('flags AWS Access Key ID in added lines', () => {
    const diff = fixture('dirty-secrets.diff');
    const findings = secretsRule.run(diff, defaults);
    expect(findings.some((f) => f.message.includes('AWS Access Key ID'))).toBe(true);
  });

  it('flags GitHub Personal Access Token in added lines', () => {
    const diff = fixture('dirty-secrets.diff');
    const findings = secretsRule.run(diff, defaults);
    expect(findings.some((f) => f.message.includes('GitHub Personal Access Token'))).toBe(true);
  });

  it('only flags added lines, not removed lines', () => {
    const patch = `diff --git a/src/old.ts b/src/old.ts
index 0000000..1111111 100644
--- a/src/old.ts
+++ b/src/old.ts
@@ -1,3 +1,2 @@
 export const x = 1;
-const key = 'AKIAIOSFODNN7EXAMPLE';
+const key = 'removed';
`;
    const diff = parsePatch(patch);
    const findings = secretsRule.run(diff, defaults);
    expect(findings).toHaveLength(0);
  });

  it('is skipped when enabled: false', () => {
    const config = ConfigSchema.parse({ version: 1, rules: { secrets: { enabled: false } } });
    const diff = fixture('dirty-secrets.diff');
    expect(secretsRule.run(diff, config)).toHaveLength(0);
  });

  it('severity defaults to error', () => {
    const diff = fixture('dirty-secrets.diff');
    const findings = secretsRule.run(diff, defaults);
    expect(findings.every((f) => f.severity === 'error')).toBe(true);
  });
});
