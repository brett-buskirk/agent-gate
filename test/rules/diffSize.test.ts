import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parsePatch } from '../../src/diff/parse';
import { diffSizeRule } from '../../src/rules/diffSize';
import { ConfigSchema } from '../../src/config/schema';

const FIXTURES = join(__dirname, '../fixtures');
const defaults = ConfigSchema.parse({ version: 1 });

function fixture(name: string) {
  return parsePatch(readFileSync(join(FIXTURES, name), 'utf8'));
}

describe('diffSize rule', () => {
  it('passes a small diff under default thresholds', () => {
    const diff = fixture('clean.diff');
    expect(diffSizeRule.run(diff, defaults)).toHaveLength(0);
  });

  it('flags when file count exceeds max_files', () => {
    const config = ConfigSchema.parse({
      version: 1,
      rules: { diff_size: { max_files: 1 } },
    });
    const diff = fixture('clean.diff'); // 2 files
    const findings = diffSizeRule.run(diff, config);
    expect(findings.some((f) => f.message.includes('files'))).toBe(true);
  });

  it('flags when line count exceeds max_lines', () => {
    const config = ConfigSchema.parse({
      version: 1,
      rules: { diff_size: { max_lines: 5 } },
    });
    const diff = fixture('clean.diff');
    const findings = diffSizeRule.run(diff, config);
    expect(findings.some((f) => f.message.includes('lines'))).toBe(true);
  });

  it('reports both file and line violations when both exceeded', () => {
    const config = ConfigSchema.parse({
      version: 1,
      rules: { diff_size: { max_files: 1, max_lines: 1 } },
    });
    const diff = fixture('clean.diff');
    expect(diffSizeRule.run(diff, config)).toHaveLength(2);
  });

  it('is skipped when enabled: false', () => {
    const config = ConfigSchema.parse({ version: 1, rules: { diff_size: { enabled: false } } });
    const diff = fixture('clean.diff');
    expect(diffSizeRule.run(diff, config)).toHaveLength(0);
  });

  it('respects custom severity', () => {
    const config = ConfigSchema.parse({
      version: 1,
      rules: { diff_size: { max_files: 1, severity: 'error' } },
    });
    const diff = fixture('clean.diff');
    const findings = diffSizeRule.run(diff, config);
    expect(findings.every((f) => f.severity === 'error')).toBe(true);
  });
});
