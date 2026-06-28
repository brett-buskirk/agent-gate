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
  it('returns pass verdict for a clean diff', async () => {
    const diff = fixture('clean.diff');
    const result = await runEngine(diff, defaults);
    expect(result.verdict).toBe('pass');
    expect(result.findings).toHaveLength(0);
  });

  it('returns fail verdict for a diff with errors (fail_on: error)', async () => {
    const diff = fixture('dirty-secrets.diff');
    const result = await runEngine(diff, defaults);
    expect(result.verdict).toBe('fail');
    expect(result.counts.error).toBeGreaterThan(0);
  });

  it('returns warn verdict when fail_on: never', async () => {
    const config = ConfigSchema.parse({ version: 1, fail_on: 'never' });
    const diff = fixture('dirty-secrets.diff');
    const result = await runEngine(diff, config);
    expect(result.verdict).toBe('warn');
  });

  it('returns fail verdict when fail_on: warning and warnings exist', async () => {
    const config = ConfigSchema.parse({ version: 1, fail_on: 'warning' });
    const diff = fixture('dirty-deps.diff');
    const result = await runEngine(diff, config);
    expect(result.verdict).toBe('fail');
  });

  it('aggregates findings from all enabled rules', async () => {
    const diff = fixture('dirty-patterns.diff');
    const result = await runEngine(diff, defaults);
    const ruleIds = [...new Set(result.findings.map((f) => f.ruleId))];
    expect(ruleIds).toContain('dangerous_patterns');
  });

  it('counts are correct', async () => {
    const diff = fixture('dirty-secrets.diff');
    const result = await runEngine(diff, defaults);
    const total = result.counts.error + result.counts.warning + result.counts.info;
    expect(total).toBe(result.findings.length);
  });

  it('awaits async rules and merges their findings (intent via injected judge)', async () => {
    const config = ConfigSchema.parse({
      version: 1,
      fail_on: 'never',
      rules: { intent: { enabled: true } },
    });
    const diff = fixture('clean.diff');
    const result = await runEngine(diff, config, {
      pr: { title: 'Add multiply()', body: 'Adds a multiply helper.' },
      intentJudge: async () => ({
        in_scope: false,
        confidence: 0.9,
        deviations: ['deleted unrelated module'],
        summary: 'Diff does more than the description says.',
      }),
    });
    const intentFindings = result.findings.filter((f) => f.ruleId === 'intent');
    expect(intentFindings).toHaveLength(1);
    expect(intentFindings[0].severity).toBe('warning');
    expect(intentFindings[0].suggestion).toContain('deleted unrelated module');
  });
});
