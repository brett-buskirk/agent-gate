import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parsePatch } from '../../src/diff/parse';
import { summarizeDiff } from '../../src/intent/summarize';

const FIXTURES = join(__dirname, '../fixtures');
function fixture(name: string) {
  return parsePatch(readFileSync(join(FIXTURES, name), 'utf8'));
}

describe('summarizeDiff', () => {
  const diff = fixture('demo.diff');

  it('includes file paths, counts, and added-line content', () => {
    const summary = summarizeDiff(diff, 100_000);
    expect(summary).toContain('src/payments.ts');
    expect(summary).toContain('.github/workflows/release.yml');
    expect(summary).toContain('+'); // added-line marker
    expect(summary).toContain('AKIAIOSFODNN7EXAMPLE'); // content of an added line
  });

  it('marks new files', () => {
    const summary = summarizeDiff(diff, 100_000);
    expect(summary).toContain('(new file)');
  });

  it('truncates to the byte budget', () => {
    const small = summarizeDiff(diff, 200);
    expect(small.length).toBeLessThan(400);
    expect(small).toContain('[diff truncated');
  });
});
