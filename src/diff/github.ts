import { getOctokit } from '@actions/github';
import { parsePatch } from './parse';
import type { DiffProvider } from './provider';
import type { DiffModel } from './parse';

export class GitHubDiffProvider implements DiffProvider {
  constructor(
    private token: string,
    private owner: string,
    private repo: string,
    private pullNumber: number,
  ) {}

  async getDiff(): Promise<DiffModel> {
    const octokit = getOctokit(this.token);
    const files = await octokit.paginate(octokit.rest.pulls.listFiles, {
      owner: this.owner,
      repo: this.repo,
      pull_number: this.pullNumber,
      per_page: 100,
    });

    const patches = files
      .filter((f) => f.patch)
      .map((f) =>
        [
          `diff --git a/${f.filename} b/${f.filename}`,
          `--- a/${f.filename}`,
          `+++ b/${f.filename}`,
          f.patch,
        ].join('\n'),
      )
      .join('\n');

    return parsePatch(patches);
  }
}
