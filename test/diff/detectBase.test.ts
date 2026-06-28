import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { detectBaseBranch } from '../../src/diff/detectBase';

function git(cmd: string, cwd: string) {
  execSync(`git ${cmd}`, { cwd, stdio: 'ignore' });
}

function initRepo(cwd: string, branch: string) {
  git(`init -b ${branch}`, cwd);
  git('config user.email test@test.com', cwd);
  git('config user.name Test', cwd);
  git('commit --allow-empty -m init', cwd);
}

describe('detectBaseBranch', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'agentgate-detect-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('detects a local main branch', () => {
    initRepo(dir, 'main');
    expect(detectBaseBranch(dir)).toBe('main');
  });

  it('detects a local master branch', () => {
    initRepo(dir, 'master');
    expect(detectBaseBranch(dir)).toBe('master');
  });

  it('prefers the remote HEAD when origin/HEAD is set', () => {
    // Create an "upstream" repo with a non-standard default branch
    const upstream = mkdtempSync(join(tmpdir(), 'agentgate-upstream-'));
    try {
      initRepo(upstream, 'trunk');
      git(`clone ${upstream} ${dir}/clone`, dir);
      const clone = join(dir, 'clone');
      // A fresh clone sets origin/HEAD → origin/trunk
      expect(detectBaseBranch(clone)).toBe('origin/trunk');
    } finally {
      rmSync(upstream, { recursive: true, force: true });
    }
  });

  it('falls back to main when not in a git repo', () => {
    expect(detectBaseBranch(dir)).toBe('main');
  });
});
