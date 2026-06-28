import * as core from '@actions/core';
import type { EngineResult } from '../engine';
import type { DiffModel } from '../diff/parse';

export async function writeSummary(result: EngineResult, diff: DiffModel): Promise<void> {
  const { verdict, findings, counts } = result;

  const verdictStr =
    verdict === 'pass' ? '✅ Passed' : verdict === 'warn' ? '⚠️ Warnings' : '❌ Blocked';

  await core.summary
    .addHeading(`AgentGate: ${verdictStr}`, 2)
    .addTable([
      [
        { data: 'Metric', header: true },
        { data: 'Value', header: true },
      ],
      ['Files changed', String(diff.files.length)],
      ['Lines added', String(diff.totalAdded)],
      ['Lines removed', String(diff.totalDeleted)],
      ['Errors', String(counts.error)],
      ['Warnings', String(counts.warning)],
      ['Total findings', String(findings.length)],
    ])
    .write();
}
