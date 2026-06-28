import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parsePatch } from '../../src/diff/parse';
import { dependenciesRule } from '../../src/rules/dependencies';
import { ConfigSchema } from '../../src/config/schema';

const FIXTURES = join(__dirname, '../fixtures');
const defaults = ConfigSchema.parse({ version: 1 });

function fixture(name: string) {
  return parsePatch(readFileSync(join(FIXTURES, name), 'utf8'));
}

describe('dependencies rule', () => {
  it('passes a diff with no manifest changes', () => {
    const diff = fixture('clean.diff');
    expect(dependenciesRule.run(diff, defaults)).toHaveLength(0);
  });

  it('flags a modified package.json', () => {
    const diff = fixture('dirty-deps.diff');
    const findings = dependenciesRule.run(diff, defaults);
    expect(findings).toHaveLength(1);
    expect(findings[0].ruleId).toBe('dependencies');
    expect(findings[0].file).toBe('package.json');
  });

  it('is skipped when enabled: false', () => {
    const config = ConfigSchema.parse({
      version: 1,
      rules: { dependencies: { enabled: false } },
    });
    const diff = fixture('dirty-deps.diff');
    expect(dependenciesRule.run(diff, config)).toHaveLength(0);
  });

  it('respects custom manifests list', () => {
    const config = ConfigSchema.parse({
      version: 1,
      rules: { dependencies: { manifests: ['requirements.txt'] } },
    });
    // dirty-deps.diff has package.json — not in custom list → passes
    const diff = fixture('dirty-deps.diff');
    expect(dependenciesRule.run(diff, config)).toHaveLength(0);
  });
});
