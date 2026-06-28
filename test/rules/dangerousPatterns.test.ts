import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parsePatch } from '../../src/diff/parse';
import { dangerousPatternsRule } from '../../src/rules/dangerousPatterns';
import { ConfigSchema } from '../../src/config/schema';

const FIXTURES = join(__dirname, '../fixtures');
const defaults = ConfigSchema.parse({ version: 1 });

function fixture(name: string) {
  return parsePatch(readFileSync(join(FIXTURES, name), 'utf8'));
}

describe('dangerousPatterns rule', () => {
  it('passes a clean diff with no dangerous patterns', () => {
    const diff = fixture('clean.diff');
    expect(dangerousPatternsRule.run(diff, defaults)).toHaveLength(0);
  });

  it('flags eval( in added lines', () => {
    const diff = fixture('dirty-patterns.diff');
    const findings = dangerousPatternsRule.run(diff, defaults);
    expect(findings.some((f) => f.message.includes('eval'))).toBe(true);
  });

  it('only flags added lines, not context or removed lines', () => {
    const patch = `diff --git a/src/old.ts b/src/old.ts
index 0000000..1111111 100644
--- a/src/old.ts
+++ b/src/old.ts
@@ -1,3 +1,3 @@
 const x = 1;
-const bad = eval('1+1');
+const bad = JSON.parse('1');
`;
    const diff = parsePatch(patch);
    const findings = dangerousPatternsRule.run(diff, defaults);
    expect(findings).toHaveLength(0);
  });

  it('is skipped when enabled: false', () => {
    const config = ConfigSchema.parse({
      version: 1,
      rules: { dangerous_patterns: { enabled: false } },
    });
    const diff = fixture('dirty-patterns.diff');
    expect(dangerousPatternsRule.run(diff, config)).toHaveLength(0);
  });

  it('supports custom patterns', () => {
    const config = ConfigSchema.parse({
      version: 1,
      rules: {
        dangerous_patterns: { patterns: ['console\\.log'] },
      },
    });
    const diff = fixture('dirty-tests.diff'); // has console.log('revoking', token)
    const findings = dangerousPatternsRule.run(diff, config);
    expect(findings.length).toBeGreaterThan(0);
  });

  it('throws a clear error on invalid regex', () => {
    const config = ConfigSchema.parse({
      version: 1,
      rules: { dangerous_patterns: { patterns: ['[invalid'] } },
    });
    const diff = fixture('clean.diff');
    expect(() => dangerousPatternsRule.run(diff, config)).toThrow('dangerous_patterns');
  });
});
