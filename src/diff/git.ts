import { execSync } from 'child_process';
import { parsePatch } from './parse';
import type { DiffProvider } from './provider';
import type { DiffModel } from './parse';

export class GitDiffProvider implements DiffProvider {
  constructor(
    private base: string,
    private cwd = process.cwd(),
  ) {}

  async getDiff(): Promise<DiffModel> {
    const patch = execSync(`git diff "${this.base}"...HEAD`, {
      cwd: this.cwd,
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
    });
    return parsePatch(patch);
  }
}
