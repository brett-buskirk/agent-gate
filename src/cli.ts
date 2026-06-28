#!/usr/bin/env node
import { Command } from 'commander';
import { loadConfig } from './config/load';
import { GitDiffProvider } from './diff/git';
import { detectBaseBranch } from './diff/detectBase';
import { runEngine } from './engine';
import { reportCli } from './report/json';
import { runInit } from './init';
import { c } from './utils/color';

const program = new Command();

program
  .name('agent-gate')
  .description('Guardrail checks for AI-agent-generated pull requests')
  .version('0.2.1');

program
  .command('check')
  .description('Run guardrail checks against a diff')
  .option('-b, --base <ref>', 'Base git ref to diff against (auto-detects the default branch if omitted)')
  .option('-c, --config <path>', 'Path to config file', '.agentgate.yml')
  .option('--json', 'Output results as JSON')
  .action(async (opts: { base?: string; config: string; json: boolean }) => {
    try {
      const config = loadConfig(opts.config);
      const base = opts.base ?? detectBaseBranch();
      if (!opts.base && !opts.json) {
        console.log(c.dim(`Auto-detected base branch: ${base}`));
      }
      const provider = new GitDiffProvider(base);
      const diff = await provider.getDiff();
      const result = runEngine(diff, config);
      reportCli(result, diff, opts.json);

      if (result.verdict === 'fail') {
        process.exit(1);
      }
    } catch (err) {
      console.error('Error:', err instanceof Error ? err.message : String(err));
      process.exit(2);
    }
  });

program
  .command('init')
  .description('Scaffold a .agentgate.yml config file in the current directory')
  .option('-c, --config <path>', 'Output path for the config file', '.agentgate.yml')
  .action((opts: { config: string }) => {
    runInit(opts.config);
  });

program.parse();
