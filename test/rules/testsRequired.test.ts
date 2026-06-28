import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parsePatch } from '../../src/diff/parse';
import { testsRequiredRule } from '../../src/rules/testsRequired';
import { ConfigSchema } from '../../src/config/schema';

const FIXTURES = join(__dirname, '../fixtures');
const defaults = ConfigSchema.parse({ version: 1 });

function fixture(name: string) {
  return parsePatch(readFileSync(join(FIXTURES, name), 'utf8'));
}

describe('testsRequired rule', () => {
  it('passes a diff that changes both source and test files', () => {
    const diff = fixture('clean.diff');
    expect(testsRequiredRule.run(diff, defaults)).toHaveLength(0);
  });

  it('flags a diff that changes source files but no test files', () => {
    const diff = fixture('dirty-tests.diff');
    const findings = testsRequiredRule.run(diff, defaults);
    expect(findings).toHaveLength(1);
    expect(findings[0].ruleId).toBe('tests_required');
  });

  it('passes when only docs or config change (no src match)', () => {
    const diff = fixture('dirty-deps.diff'); // only package.json
    expect(testsRequiredRule.run(diff, defaults)).toHaveLength(0);
  });

  it('is skipped when enabled: false', () => {
    const config = ConfigSchema.parse({
      version: 1,
      rules: { tests_required: { enabled: false } },
    });
    const diff = fixture('dirty-tests.diff');
    expect(testsRequiredRule.run(diff, config)).toHaveLength(0);
  });

  it('respects custom src_globs and test_globs', () => {
    const config = ConfigSchema.parse({
      version: 1,
      rules: {
        tests_required: {
          src_globs: ['lib/**'],
          test_globs: ['spec/**'],
        },
      },
    });
    // clean.diff has src/** changes — with lib/** globs, no src match → passes
    const diff = fixture('clean.diff');
    expect(testsRequiredRule.run(diff, config)).toHaveLength(0);
  });
});
