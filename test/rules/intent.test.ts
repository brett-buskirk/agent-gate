import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parsePatch } from '../../src/diff/parse';
import { intentRule } from '../../src/rules/intent';
import { ConfigSchema } from '../../src/config/schema';
import type { IntentJudge, IntentVerdict } from '../../src/intent/types';

const FIXTURES = join(__dirname, '../fixtures');
function fixture(name: string) {
  return parsePatch(readFileSync(join(FIXTURES, name), 'utf8'));
}

const pr = { title: 'Add multiply()', body: 'Adds a multiply helper to utils.' };

function judgeReturning(v: Partial<IntentVerdict>): IntentJudge {
  return async () => ({ in_scope: true, confidence: 1, deviations: [], summary: '', ...v });
}

function enabled(overrides: Record<string, unknown> = {}) {
  return ConfigSchema.parse({ version: 1, rules: { intent: { enabled: true, ...overrides } } });
}

describe('intent rule', () => {
  const diff = fixture('clean.diff');

  it('is skipped when disabled (the default)', async () => {
    const config = ConfigSchema.parse({ version: 1 });
    expect(await intentRule.run(diff, config, { pr })).toHaveLength(0);
  });

  it('skips silently when there is no PR context', async () => {
    expect(await intentRule.run(diff, enabled())).toHaveLength(0);
  });

  it('returns no findings when the judge says in scope', async () => {
    const findings = await intentRule.run(diff, enabled(), {
      pr,
      intentJudge: judgeReturning({ in_scope: true }),
    });
    expect(findings).toHaveLength(0);
  });

  it('flags out-of-scope changes and lists the deviations', async () => {
    const findings = await intentRule.run(diff, enabled(), {
      pr,
      intentJudge: judgeReturning({
        in_scope: false,
        deviations: ['touched billing.ts'],
        summary: 'Goes beyond the stated description.',
      }),
    });
    expect(findings).toHaveLength(1);
    expect(findings[0].ruleId).toBe('intent');
    expect(findings[0].severity).toBe('warning');
    expect(findings[0].message).toContain('beyond');
    expect(findings[0].suggestion).toContain('touched billing.ts');
  });

  it('respects a custom severity', async () => {
    const findings = await intentRule.run(diff, enabled({ severity: 'error' }), {
      pr,
      intentJudge: judgeReturning({ in_scope: false }),
    });
    expect(findings[0].severity).toBe('error');
  });

  it('emits an info notice when enabled but no judge is wired', async () => {
    const findings = await intentRule.run(diff, enabled(), { pr });
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('info');
    expect(findings[0].message).toContain('no judge');
  });

  it('never throws when the judge fails — reports info instead', async () => {
    const findings = await intentRule.run(diff, enabled(), {
      pr,
      intentJudge: async () => {
        throw new Error('API down');
      },
    });
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('info');
    expect(findings[0].message).toContain('API down');
  });
});
