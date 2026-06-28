import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reportCli } from '../../src/report/json';
import type { EngineResult } from '../../src/engine';
import type { DiffModel } from '../../src/diff/parse';

const emptyDiff: DiffModel = { files: [], totalAdded: 0, totalDeleted: 0 };

const passResult: EngineResult = {
  verdict: 'pass',
  findings: [],
  counts: { error: 0, warning: 0, info: 0 },
};

const warnResult: EngineResult = {
  verdict: 'warn',
  findings: [
    {
      ruleId: 'diff_size',
      severity: 'warning',
      file: 'src/big.ts',
      line: 1,
      message: 'Diff is large',
      suggestion: 'Split the PR.',
    },
  ],
  counts: { error: 0, warning: 1, info: 0 },
};

const failResult: EngineResult = {
  verdict: 'fail',
  findings: [
    { ruleId: 'secrets', severity: 'error', message: 'Leaked key' },
  ],
  counts: { error: 1, warning: 0, info: 0 },
};

describe('reportCli', () => {
  let stdout: string[] = [];
  let logs: string[] = [];

  beforeEach(() => {
    stdout = [];
    logs = [];
    vi.spyOn(process.stdout, 'write').mockImplementation((s) => {
      stdout.push(String(s));
      return true;
    });
    vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
      logs.push(args.join(' '));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('outputs JSON when asJson is true', () => {
    reportCli(passResult, emptyDiff, true);
    expect(stdout.join('')).toContain('"verdict": "pass"');
  });

  it('shows passing verdict in human output', () => {
    reportCli(passResult, emptyDiff, false);
    expect(logs.some((l) => l.includes('passed'))).toBe(true);
    expect(logs.some((l) => l.includes('No issues found'))).toBe(true);
  });

  it('shows warning verdict and counts', () => {
    reportCli(warnResult, emptyDiff, false);
    expect(logs.some((l) => l.includes('warnings'))).toBe(true);
    expect(logs.some((l) => l.includes('Warnings'))).toBe(true);
  });

  it('shows blocked verdict and finding details', () => {
    reportCli(failResult, emptyDiff, false);
    expect(logs.some((l) => l.includes('blocked'))).toBe(true);
    expect(logs.some((l) => l.includes('secrets'))).toBe(true);
    expect(logs.some((l) => l.includes('Leaked key'))).toBe(true);
  });

  it('includes file and line in finding output', () => {
    reportCli(warnResult, emptyDiff, false);
    expect(logs.some((l) => l.includes('src/big.ts:1'))).toBe(true);
    expect(logs.some((l) => l.includes('Split the PR'))).toBe(true);
  });
});
