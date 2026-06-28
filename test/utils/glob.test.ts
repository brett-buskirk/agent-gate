import { describe, it, expect } from 'vitest';
import { matchGlob, matchesAny } from '../../src/utils/glob';

describe('matchGlob', () => {
  it('matches exact paths', () => {
    expect(matchGlob('src/index.ts', 'src/index.ts')).toBe(true);
    expect(matchGlob('src/other.ts', 'src/index.ts')).toBe(false);
  });

  it('matches * within a single path segment', () => {
    expect(matchGlob('src/index.ts', 'src/*.ts')).toBe(true);
    expect(matchGlob('src/deep/index.ts', 'src/*.ts')).toBe(false);
  });

  it('matches ** across path segments', () => {
    expect(matchGlob('src/rules/scope.ts', 'src/**')).toBe(true);
    expect(matchGlob('src/rules/scope.ts', '**/*.ts')).toBe(true);
    expect(matchGlob('dist/index.js', '**/*.js')).toBe(true);
  });

  it('matches **/ prefix (any directory depth)', () => {
    expect(matchGlob('a/b/c/file.ts', '**/*.ts')).toBe(true);
    expect(matchGlob('file.ts', '**/*.ts')).toBe(true);
  });

  it('matches ? as a single non-slash character', () => {
    expect(matchGlob('src/a.ts', 'src/?.ts')).toBe(true);
    expect(matchGlob('src/ab.ts', 'src/?.ts')).toBe(false);
    expect(matchGlob('src/a/b.ts', 'src/?.ts')).toBe(false);
  });

  it('escapes regex special characters in literal path segments', () => {
    expect(matchGlob('package.json', 'package.json')).toBe(true);
    expect(matchGlob('packageXjson', 'package.json')).toBe(false);
    expect(matchGlob('package-lock.json', 'package-lock.json')).toBe(true);
  });

  it('matches **/*.lock pattern', () => {
    expect(matchGlob('package-lock.json', '**/*.lock')).toBe(false);
    expect(matchGlob('yarn.lock', '**/*.lock')).toBe(true);
    expect(matchGlob('dir/yarn.lock', '**/*.lock')).toBe(true);
  });
});

describe('matchesAny', () => {
  it('returns true when any glob matches', () => {
    expect(matchesAny('src/index.ts', ['test/**', 'src/**'])).toBe(true);
  });

  it('returns false when no glob matches', () => {
    expect(matchesAny('infra/main.tf', ['src/**', 'test/**'])).toBe(false);
  });

  it('returns false for empty glob list', () => {
    expect(matchesAny('src/index.ts', [])).toBe(false);
  });
});
