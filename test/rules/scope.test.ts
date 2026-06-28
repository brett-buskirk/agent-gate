import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parsePatch } from '../../src/diff/parse';
import { scopeRule } from '../../src/rules/scope';
import { ConfigSchema } from '../../src/config/schema';

const FIXTURES = join(__dirname, '../fixtures');
const defaults = ConfigSchema.parse({ version: 1 });

function fixture(name: string) {
  return parsePatch(readFileSync(join(FIXTURES, name), 'utf8'));
}

describe('scope rule', () => {
  it('passes a clean diff within default allowed paths', () => {
    const diff = fixture('clean.diff');
    expect(scopeRule.run(diff, defaults)).toHaveLength(0);
  });

  it('flags files in the default deny list (.github/workflows/**)', () => {
    const diff = fixture('dirty-scope.diff');
    const findings = scopeRule.run(diff, defaults);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.every((f) => f.ruleId === 'scope')).toBe(true);
    expect(findings.every((f) => f.severity === 'error')).toBe(true);
  });

  it('flags infra/ as denied', () => {
    const diff = fixture('dirty-scope.diff');
    const findings = scopeRule.run(diff, defaults);
    expect(findings.some((f) => f.file?.startsWith('infra/'))).toBe(true);
  });

  it('flags files outside the allow list when allow is configured', () => {
    const config = ConfigSchema.parse({
      version: 1,
      rules: { scope: { allow: ['src/**', 'test/**'] } },
    });
    const diff = fixture('dirty-scope.diff');
    const findings = scopeRule.run(diff, config);
    expect(findings.length).toBeGreaterThan(0);
  });

  it('flags a file outside the allow list that is not in the deny list', () => {
    const config = ConfigSchema.parse({
      version: 1,
      rules: { scope: { allow: ['src/**', 'test/**'], deny: [] } },
    });
    const diff = fixture('dirty-scope-allow.diff');
    const findings = scopeRule.run(diff, config);
    expect(findings).toHaveLength(1);
    expect(findings[0].file).toBe('scripts/deploy.sh');
    expect(findings[0].message).toMatch(/outside the allowed scope/);
    expect(findings[0].suggestion).toMatch(/allow list/);
  });

  it('passes files that match the allow list', () => {
    const config = ConfigSchema.parse({
      version: 1,
      rules: { scope: { allow: ['src/**', 'test/**'], deny: [] } },
    });
    const diff = fixture('clean.diff');
    const findings = scopeRule.run(diff, config);
    expect(findings).toHaveLength(0);
  });

  it('is skipped when enabled: false', () => {
    const config = ConfigSchema.parse({ version: 1, rules: { scope: { enabled: false } } });
    const diff = fixture('dirty-scope.diff');
    expect(scopeRule.run(diff, config)).toHaveLength(0);
  });

  it('respects custom severity', () => {
    const config = ConfigSchema.parse({
      version: 1,
      rules: { scope: { severity: 'warning' } },
    });
    const diff = fixture('dirty-scope.diff');
    const findings = scopeRule.run(diff, config);
    expect(findings.every((f) => f.severity === 'warning')).toBe(true);
  });
});
