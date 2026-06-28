import type { EngineResult } from '../engine';
import type { DiffModel } from '../diff/parse';

const SEVERITY_ICON: Record<string, string> = {
  error: '❌',
  warning: '⚠️ ',
  info: 'ℹ️ ',
};

export function reportCli(result: EngineResult, diff: DiffModel, asJson = false): void {
  if (asJson) {
    process.stdout.write(
      JSON.stringify({ verdict: result.verdict, counts: result.counts, findings: result.findings }, null, 2) + '\n',
    );
    return;
  }

  const { verdict, findings, counts } = result;

  const verdictLine =
    verdict === 'pass'
      ? '✅  AgentGate: passed'
      : verdict === 'warn'
        ? '⚠️   AgentGate: warnings'
        : '❌  AgentGate: blocked';

  console.log(`\n${verdictLine}`);
  console.log(
    `     Files: ${diff.files.length}  |  Lines: +${diff.totalAdded} -${diff.totalDeleted}`,
  );

  if (counts.error > 0) console.log(`     Errors:   ${counts.error}`);
  if (counts.warning > 0) console.log(`     Warnings: ${counts.warning}`);
  if (counts.info > 0) console.log(`     Info:     ${counts.info}`);

  if (findings.length === 0) {
    console.log('\n  No issues found.\n');
    return;
  }

  console.log('');

  const byRule = new Map<string, typeof findings>();
  for (const f of findings) {
    if (!byRule.has(f.ruleId)) byRule.set(f.ruleId, []);
    byRule.get(f.ruleId)!.push(f);
  }

  for (const [ruleId, ruleFindings] of byRule) {
    const icon = SEVERITY_ICON[ruleFindings[0].severity] ?? '  ';
    console.log(`  ${icon} [${ruleId}]`);
    for (const f of ruleFindings) {
      const loc = f.file ? (f.line ? `${f.file}:${f.line}` : f.file) : '';
      console.log(`      ${loc ? `${loc}  ` : ''}${f.message}`);
      if (f.suggestion) console.log(`      → ${f.suggestion}`);
    }
    console.log('');
  }
}
