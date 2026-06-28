import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parsePatch } from '../src/diff/parse';
import { runEngine } from '../src/engine';
import { ConfigSchema } from '../src/config/schema';

const FIXTURES = join(__dirname, 'fixtures');
const defaults = ConfigSchema.parse({ version: 1 });

function fixture(name: string) {
  return parsePatch(readFileSync(join(FIXTURES, name), 'utf8'));
}

describe('engine', () => {
  it('returns pass verdict for a clean diff', () => {
    const diff = fixture('clean.diff');
    const result = runEngine(diff, defaults);
    expect(result.verdict).toBe('pass');
    expect(result.findings).toHaveLength(0);
  });

  it('returns fail verdict for a diff with errors (fail_on: error)', () => {
    const diff = fixture('dirty-secrets.diff');
    const result = runEngine(diff, defaults);
    expect(result.verdict).toBe('fail');
    expect(result.counts.error).toBeGreaterThan(0);
  });

  it('returns warn verdict when fail_on: never', () => {
    const config = ConfigSchema.parse({ version: 1, fail_on: 'never' });
    const diff = fixture('dirty-secrets.diff');
    const result = runEngine(diff, config);
    expect(result.verdict).toBe('warn');
  });

  it('returns fail verdict when fail_on: warning and warnings exist', () => {
    const config = ConfigSchema.parse({ version: 1, fail_on: 'warning' });
    const diff = fixture('dirty-deps.diff');
    const result = runEngine(diff, config);
    expect(result.verdict).toBe('fail');
  });

  it('aggregates findings from all enabled rules', () => {
    const diff = fixture('dirty-patterns.diff');
    const result = runEngine(diff, defaults);
    const ruleIds = [...new Set(result.findings.map((f) => f.ruleId))];
    expect(ruleIds).toContain('dangerous_patterns');
  });

  it('counts are correct', () => {
    const diff = fixture('dirty-secrets.diff');
    const result = runEngine(diff, defaults);
    const total = result.counts.error + result.counts.warning + result.counts.info;
    expect(total).toBe(result.findings.length);
  });
});
