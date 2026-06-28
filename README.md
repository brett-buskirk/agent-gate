# AgentGate

**Guardrail checks for AI-agent-generated pull requests.**

AgentGate runs in CI on every PR, inspects the diff for the risk signals that AI agents commonly introduce — leaked secrets, out-of-scope changes, missing tests, surprise dependencies — posts a structured review comment, and sets a pass/fail check. Your team gets eyes on agent work without rubber-stamping it.

> Built by [Brett Buskirk LLC](https://brett-buskirk.dev) as part of the **Agentic Development Workflow Setup** service — a productized safety net for teams shipping with AI coding agents.

---

## Status

**v0.1.0 — active development.** All six rules implemented and tested. Action bundled (`dist/index.js`). Dogfood CI runs AgentGate on its own PRs. npm publish next.

---

## Quickstart

### GitHub Action

```yaml
# .github/workflows/agentgate.yml
name: AgentGate
on: [pull_request]

jobs:
  agentgate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: brett-buskirk/agent-gate@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

Add a `.agentgate.yml` to your repo to configure it (or skip it — the defaults are sane).

### CLI

```bash
npx agent-gate check --base main
```

Or install globally:

```bash
npm install -g agent-gate
agent-gate check --base main --json
```

---

## Configuration

Place a `.agentgate.yml` in your repo root. Everything has a default — the file is optional.

```yaml
version: 1
fail_on: error          # error | warning | never
comment: true           # post/update a PR comment

rules:
  secrets:
    enabled: true
    severity: error

  scope:
    enabled: true
    severity: error
    allow:               # if set, only these paths are permitted
      - "src/**"
      - "test/**"
      - "docs/**"
    deny:                # always blocked regardless of allow
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
    src_globs: ["src/**"]
    test_globs: ["**/*.test.*", "**/*.spec.*", "tests/**"]

  dependencies:
    enabled: true
    severity: warning
    manifests: ["package.json", "requirements.txt", "go.mod", "Gemfile", "Cargo.toml"]

  dangerous_patterns:
    enabled: true
    severity: error
    patterns:
      - "eval\\("
      - "--no-verify"
      - "child_process\\.exec\\("
```

### `fail_on`

| Value | Behavior |
|-------|----------|
| `error` | Only error-severity findings fail the check (default) |
| `warning` | Warnings also fail the check |
| `never` | Check always passes; findings are still reported |

---

## Rules

| Rule | Default severity | What it catches |
|------|-----------------|-----------------|
| `secrets` | error | AWS keys, GitHub tokens, private key blocks, high-entropy assignments |
| `scope` | error | Files outside the allow list or inside the deny list |
| `diff_size` | warning | PRs exceeding `max_files` (30) or `max_lines` (800) |
| `tests_required` | warning | Source changes with no corresponding test file changes |
| `dependencies` | warning | Modified dependency manifests (supply-chain risk) |
| `dangerous_patterns` | error | User-defined regex denylist applied to added lines |

---

## PR Comment

AgentGate posts a single comment on the PR and updates it in place on re-runs — never spams. The comment shows the overall verdict, a rule-by-rule summary table, and expandable findings with file locations and actionable suggestions.

---

## How it works

1. On a `pull_request` event, the Action fetches the PR diff from the GitHub API
2. The diff is parsed into a structured model (files, chunks, added/removed lines)
3. Each enabled rule runs over the model and returns findings
4. The engine aggregates findings and computes a verdict based on `fail_on`
5. Reporters post the PR comment, set the check status, and write the Step Summary
6. The check fails if the verdict is `fail` — blocking merge until the agent's work is reviewed

The CLI (`agent-gate check`) uses `git diff` instead of the GitHub API, making it usable locally and in pre-commit hooks.

---

## Project structure

```
agent-gate/
  action.yml              # GitHub Action metadata
  src/
    cli.ts                # CLI entry (commander)
    action.ts             # Action entry
    engine.ts             # Aggregates rules → verdict
    diff/                 # Diff providers + parser
    rules/                # Rule implementations
    report/               # Reporters (comment, check, summary, CLI)
    config/               # Schema (zod) + loader
    utils/                # Glob matching
  test/
    fixtures/             # Sample diffs (clean + dirty per rule)
    rules/                # Rule unit tests
    engine.test.ts
  docs/
    DESIGN.md
    SPRINTS.md
```

---

## Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5, strict mode |
| Runtime | Node 20+ |
| Action bundler | @vercel/ncc |
| Config validation | zod |
| Config format | js-yaml |
| CLI | commander |
| GitHub API | @actions/github (Octokit) |
| Tests | Vitest |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). New rules are the most welcome contribution — there's a dedicated issue template and a clear pattern to follow.

---

## License

MIT — see [LICENSE](LICENSE).
