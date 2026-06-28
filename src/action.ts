import * as core from '@actions/core';
import * as github from '@actions/github';
import { loadConfig } from './config/load';
import { GitHubDiffProvider } from './diff/github';
import { runEngine } from './engine';
import { upsertComment } from './report/comment';
import { setCheckOutput } from './report/checkRun';
import { writeSummary } from './report/summary';

async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token', { required: true });
    const configPath = core.getInput('config-path') || '.agentgate.yml';

    const { pull_request } = github.context.payload;
    if (!pull_request) {
      core.warning('AgentGate only runs on pull_request events. Skipping.');
      return;
    }

    core.info(`Running AgentGate on PR #${pull_request.number}`);

    const config = loadConfig(configPath);

    const failOnOverride = core.getInput('fail-on');
    if (failOnOverride && ['error', 'warning', 'never'].includes(failOnOverride)) {
      config.fail_on = failOnOverride as typeof config.fail_on;
    }

    const { owner, repo } = github.context.repo;
    const provider = new GitHubDiffProvider(token, owner, repo, pull_request.number);
    const diff = await provider.getDiff();
    const result = runEngine(diff, config);

    setCheckOutput(result);

    if (config.comment) {
      await upsertComment(token, owner, repo, pull_request.number, result, diff);
    }

    await writeSummary(result, diff);
  } catch (err) {
    core.setFailed(err instanceof Error ? err.message : String(err));
  }
}

run();
