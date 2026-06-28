import { existsSync, writeFileSync } from 'fs';
import { c } from './utils/color';

const CONFIG_TEMPLATE = `version: 1
fail_on: error          # error | warning | never

rules:
  secrets:
    enabled: true
    severity: error

  scope:
    enabled: true
    severity: error
    allow:
      - "src/**"
      - "test/**"
      - "tests/**"
      - "docs/**"
    deny:
      - ".github/workflows/**"
      - "infra/**"
      - "**/*.lock"
      - "package-lock.json"

  diff_size:
    enabled: true
    severity: warning
    max_files: 30
    max_lines: 800

  tests_required:
    enabled: true
    severity: warning
    src_globs:
      - "src/**"
    test_globs:
      - "**/*.test.*"
      - "**/*.spec.*"
      - "tests/**"

  dependencies:
    enabled: true
    severity: warning
    manifests:
      - "package.json"
      - "requirements.txt"
      - "go.mod"

  dangerous_patterns:
    enabled: true
    severity: error
    patterns:
      - "eval\\\\("
      - "--no-verify"
      - "child_process"
`;

export function runInit(configPath: string): void {
  if (existsSync(configPath)) {
    console.log(c.yellow(`⚠️  ${configPath} already exists — not overwriting.`));
    console.log(c.dim('   Delete it first or edit it manually.'));
    process.exit(1);
  }

  writeFileSync(configPath, CONFIG_TEMPLATE, 'utf8');
  console.log(c.green(`✅  Created ${configPath}`));
  console.log(c.dim('   Edit it to match your project layout, then commit it.'));
}
