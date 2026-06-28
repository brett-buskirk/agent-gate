import { execSync } from 'child_process';

function tryGit(command: string, cwd: string): string | null {
  try {
    return execSync(command, {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

/**
 * Detect the repository's default branch to diff against.
 *
 * Resolution order:
 *   1. The remote's HEAD (`origin/HEAD` → e.g. `origin/main`) — most reliable,
 *      works in fresh CI checkouts where local branches may not exist.
 *   2. A remote-tracking branch named `main` or `master`.
 *   3. A local branch named `main` or `master`.
 *   4. Falls back to `main`.
 */
export function detectBaseBranch(cwd = process.cwd()): string {
  const remoteHead = tryGit('git symbolic-ref refs/remotes/origin/HEAD', cwd);
  if (remoteHead) {
    const match = remoteHead.match(/refs\/remotes\/origin\/(.+)$/);
    if (match) return `origin/${match[1]}`;
  }

  for (const candidate of ['origin/main', 'origin/master']) {
    if (tryGit(`git rev-parse --verify --quiet ${candidate}`, cwd) !== null) {
      return candidate;
    }
  }

  for (const candidate of ['main', 'master']) {
    if (tryGit(`git rev-parse --verify --quiet refs/heads/${candidate}`, cwd) !== null) {
      return candidate;
    }
  }

  return 'main';
}
