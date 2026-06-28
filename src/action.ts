import * as core from '@actions/core';
import * as github from '@actions/github';
import { loadConfig } from './config/load';
import { GitHubDiffProvider } from './diff/github';
import { anthropicJudge } from './intent/anthropic';
import { runEngine } from './engine';
import type { RuleContext } from './rules/types';
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

    const intentCfg = config.rules.intent;
    let context: RuleContext | undefined;
    if (intentCfg.enabled) {
      const apiKey = core.getInput('anthropic-api-key') || process.env.ANTHROPIC_API_KEY || '';
      if (!apiKey) {
        core.warning('Intent check is enabled but no ANTHROPIC_API_KEY was provided — skipping it.');
      }
      context = {
        pr: {
          title: (pull_request.title as string | undefined) ?? '',
          body: (pull_request.body as string | undefined) ?? '',
        },
        intentJudge: apiKey ? anthropicJudge({ apiKey, model: intentCfg.model }) : undefined,
      };
    }

    const result = await runEngine(diff, config, context);

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
