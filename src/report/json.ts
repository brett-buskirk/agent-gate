import type { EngineResult } from '../engine';
import type { DiffModel } from '../diff/parse';
import { c } from '../utils/color';

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
      ? c.green(c.bold('✅  AgentGate: passed'))
      : verdict === 'warn'
        ? c.yellow(c.bold('⚠️   AgentGate: warnings'))
        : c.red(c.bold('❌  AgentGate: blocked'));

  console.log(`\n${verdictLine}`);
  console.log(
    c.dim(`     Files: ${diff.files.length}  |  Lines: +${diff.totalAdded} -${diff.totalDeleted}`),
  );

  if (counts.error > 0) console.log(c.red(`     Errors:   ${counts.error}`));
  if (counts.warning > 0) console.log(c.yellow(`     Warnings: ${counts.warning}`));
  if (counts.info > 0) console.log(`     Info:     ${counts.info}`);

  if (findings.length === 0) {
    console.log(c.dim('\n  No issues found.\n'));
    return;
  }

  console.log('');

  const byRule = new Map<string, typeof findings>();
  for (const f of findings) {
    if (!byRule.has(f.ruleId)) byRule.set(f.ruleId, []);
    byRule.get(f.ruleId)!.push(f);
  }

  for (const [ruleId, ruleFindings] of byRule) {
    const sev = ruleFindings[0].severity;
    const label =
      sev === 'error'
        ? c.red(`[${ruleId}]`)
        : sev === 'warning'
          ? c.yellow(`[${ruleId}]`)
          : c.cyan(`[${ruleId}]`);
    console.log(`  ${label}`);
    for (const f of ruleFindings) {
      const loc = f.file ? (f.line ? `${f.file}:${f.line}` : f.file) : '';
      console.log(`      ${loc ? c.dim(`${loc}  `) : ''}${f.message}`);
      if (f.suggestion) console.log(c.dim(`      → ${f.suggestion}`));
    }
    console.log('');
  }
}
