import * as core from '@actions/core';
import type { EngineResult } from '../engine';

export function setCheckOutput(result: EngineResult): void {
  const { verdict, counts, findings } = result;

  core.setOutput('verdict', verdict);
  core.setOutput('finding-count', String(findings.length));

  if (verdict === 'fail') {
    core.setFailed(
      `AgentGate blocked: ${counts.error} error(s), ${counts.warning} warning(s) — see PR comment for details`,
    );
  } else if (verdict === 'warn') {
    core.warning(`AgentGate: ${counts.warning} warning(s)`);
  } else {
    core.info('AgentGate: passed');
  }
}
