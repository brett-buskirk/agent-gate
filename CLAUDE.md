# AgentGate — Claude Code Build Brief

*Working name — confirm npm package and GitHub org availability before committing, and rename freely. Use this document as the repo's initial `CLAUDE.md`.*

---

## What it is
A **guardrail layer for AI-agent-generated pull requests.** It runs in CI on every PR, inspects the diff for risk signals an agent commonly introduces, posts a clear review summary on the PR, and sets a pass/fail check — so a human can merge agent work with confidence instead of rubber-stamping it.

**Why it matters / positioning.** Teams are adopting AI coding agents faster than they're adopting safety nets for them. Agent PRs leak secrets, wander outside their intended scope, balloon in size, skip tests, and quietly add dependencies. AgentGate is the missing seatbelt. It is also the productized artifact of Brett Buskirk LLC's **Agentic Development Workflow Setup** service — a real, adoptable open-source tool that *is* the thing the consultancy sells: guardrails, CI integration, and context/scope discipline for agentic development.

## Goals
- A working **GitHub Action** that gates PRs, plus a **CLI** with the same engine for local/pre-commit use.
- A small, sharp set of **deterministic, rule-based checks** (no LLM required for v1).
- Config-driven via a single `.agentgate.yml`, with sensible defaults so it works zero-config.
- Clean, extensible **rule-plugin architecture** so others can add rules (adoption matters).
- Genuinely well-tested — this is a safety tool; its credibility *is* its test suite.
- **Dogfooded**: AgentGate runs on AgentGate's own PRs.

## Non-Goals (v1 — resist scope creep)
- No LLM/AI-based analysis in v1 (it's a headline v2 feature — see Roadmap).
- No SARIF / code-scanning integration in v1 (v2).
- No GitHub Marketplace listing required for v1 (nice-to-have later).
- Not a linter or formatter — it inspects *diffs for risk*, it doesn't enforce code style.

## Target user
Engineering leads and developers on teams using AI coding agents (Claude Code, Copilot agents, Cursor, etc.) who want a review safety net in CI. Initial sweet spot: small/startup teams without a dedicated platform/security function — i.e., the consultancy's exact buyer.

## Tech stack & rationale
- **TypeScript / Node 20+** — first-class GitHub Actions support (runs natively, no Docker), npm distribution for the CLI, and squarely in the maintainer's wheelhouse.
- **Action**: native JS action (`action.yml` → `runs.using: node20`), built with `@actions/core` and `@actions/github` (Octokit), bundled to a single `dist/index.js` via `esbuild` or `@vercel/ncc` (commit the bundle, per Actions convention).
- **CLI**: `commander` (lightweight), exposed as a `bin` (`agentgate`), runnable via `npx`.
- **Diff parsing**: `parse-diff` to turn unified-diff patches into a structured file/hunk model the rules consume.
- **Config**: `.agentgate.yml` parsed with `js-yaml`, validated with `zod` (typed schema + good errors).
- **Tests**: `vitest`, fixture-driven (sample good/bad diffs). Target ≥ 90% coverage on rules.
- **Quality**: ESLint + Prettier.
- *(Alternative considered: Go for a single static binary. TypeScript wins here for native Action support and stack fit.)*

## Architecture
A shared **engine** runs a set of **rules** over a **diff model** produced by a pluggable **diff provider**, and emits findings to one or more **reporters**.

- **Diff provider** (interface): `github.ts` fetches PR files/patches via Octokit (Action mode); `git.ts` computes the diff against a base ref (CLI mode). Both feed `parse.ts` → a common structured model.
- **Rule** (interface): `(diff, config) => Finding[]`. Each rule has `id`, `description`, `severity` (`error | warning | info`), and is individually enabled/configured. Registered in `rules/index.ts`.
- **Finding**: `{ ruleId, severity, file?, line?, message, suggestion? }`.
- **Engine**: loads config, runs enabled rules, aggregates findings, computes an overall verdict from `fail_on`.
- **Reporters**: `comment.ts` (upsert a single PR comment by hidden marker — never spam), `checkRun.ts` (set the `AgentGate` check/commit status), `summary.ts` (GitHub Step Summary), `json.ts` (CLI text + JSON output).

## The guardrail rules (v1 MVP set)
1. **secrets** — scan added lines for leaked credentials: common patterns (AWS keys, GitHub tokens, private-key blocks, generic `KEY=`/`TOKEN=` high-entropy assignments). *(Severity: error.)*
2. **scope** — flag changes to files outside an allowed path set, or inside a denied set (e.g., agent touched `.github/workflows/`, `infra/`, lockfiles). Config-driven allow/deny globs. *(error.)*
3. **diff_size** — flag PRs exceeding `max_files` / `max_lines` thresholds (oversized agent diffs are hard to review safely). *(warning.)*
4. **tests_required** — if source files changed but no test files were added/modified, warn. Heuristic, not coverage measurement. *(warning.)*
5. **dependencies** — flag added/changed entries in dependency manifests (`package.json`, `requirements.txt`, `go.mod`, etc.) — agents adding deps is a supply-chain risk worth human eyes. *(warning.)*
6. **dangerous_patterns** — config-driven regex denylist on added lines (e.g., `eval(`, `--no-verify`, disabling of security checks, deletion of test files). *(error.)*

Each rule ships with fixture-based unit tests (a "clean" diff that passes and a "dirty" diff that trips it).

## Configuration (`.agentgate.yml`)
Zero-config defaults should be sane; this file overrides them.

```yaml
version: 1
fail_on: error          # error | warning | never  (which severity blocks the check)
comment: true           # post/update the PR comment

rules:
  secrets:
    enabled: true
    severity: error
  scope:
    enabled: true
    severity: error
    allow: ["src/**", "tests/**", "docs/**"]
    deny: [".github/workflows/**", "infra/**", "**/*.lock", "package-lock.json"]
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
    manifests: ["package.json", "requirements.txt", "go.mod"]
  dangerous_patterns:
    enabled: true
    severity: error
    patterns: ["eval\\(", "--no-verify", "child_process"]
```

## Output
- **PR comment** (upserted): a header verdict (✅ passed / ⚠️ warnings / ❌ blocked), a summary table (rule → count → severity), then grouped findings with file/line and a short suggestion each. One comment, updated in place on re-runs.
- **Check run / commit status**: `AgentGate` → success/failure based on `fail_on`.
- **Step Summary**: same content, for the Actions run page.
- **CLI**: human-readable output by default, `--json` for machine output, non-zero exit when blocked.

## Repository structure
```
agentgate/
  action.yml
  package.json            # bin: agentgate
  tsconfig.json
  .agentgate.yml          # dogfood config for this repo
  src/
    cli.ts                # CLI entry (commander)
    action.ts             # Action entry (GH context → engine → reporters)
    engine.ts
    diff/ { provider.ts, github.ts, git.ts, parse.ts }
    rules/ { index.ts, types.ts, secrets.ts, scope.ts, diffSize.ts,
             testsRequired.ts, dependencies.ts, dangerousPatterns.ts }
    report/ { comment.ts, checkRun.ts, summary.ts, json.ts }
    config/ { schema.ts, load.ts }
  test/
    fixtures/             # sample diffs (clean + dirty)
    rules/*.test.ts
  dist/                   # bundled action (committed)
  .github/workflows/ci.yml
  README.md
```

## Build sequence (milestones)
1. **Scaffold** — TS, package.json, tsconfig, ESLint/Prettier, vitest, skeleton `action.yml` + CLI.
2. **Core loop** — diff model + `scope` and `diff_size` rules + config loading/validation + CLI output. Get `agentgate check` working locally against a base ref, with fixture tests.
3. **Remaining rules** — `secrets`, `tests_required`, `dependencies`, `dangerous_patterns`, each with tests.
4. **GitHub Action** — read PR context, fetch diff via Octokit, run engine, then the comment + check-run + step-summary reporters. Bundle `dist/`.
5. **Dogfood + polish** — add this repo's `.agentgate.yml` and a CI workflow that runs AgentGate on its own PRs; write the README (quickstart, config reference, a screenshot of the PR comment).

## Definition of Done (v1)
The Action runs on a PR, fetches the diff, evaluates the MVP rules per `.agentgate.yml`, posts/updates a clear PR comment with grouped findings and an overall verdict, and sets a pass/fail check. The CLI runs the same engine locally. Rule coverage ≥ 90%. README has a quickstart, a full config reference, and a demo screenshot. **The repo gates its own PRs and the dogfood run is green.** Published as a versioned Action (`uses: <org>/agentgate@v1`) and an npm CLI.

## Roadmap (v2+ — explicitly out of v1)
- **LLM intent/scope check (headline v2 feature):** an optional rule that uses the Anthropic API to assess whether the PR's actual changes match its stated description / linked issue — catching agents that "went rogue" and did more or other than asked. *AI checking AI* — the strongest differentiator and demo moment; keep it opt-in and behind an API key.
- **SARIF output** for GitHub code-scanning integration.
- **Shareable policy packs** (named presets teams can extend).
- Deeper secret scanning (optional `gitleaks`/`trufflehog` integration), more language manifests, baseline/ignore files.
- **GitHub Marketplace** listing.

## Portfolio & marketing hooks
- **Medium piece:** "A safety net for AI-generated pull requests — what it catches and why your team needs one."
- **Recursive demo:** the repo's own agent PRs are gated by AgentGate itself — show the passing check and a sample comment.
- **Site:** promote to the Work section of brett-buskirk.dev (it upgrades the placeholder "agentic delivery" proof item into a real shipped tool) and link it from the Agentic Development Workflow service card.
- Frame the README and write-up around the *service*, not just the code — every reader is a potential client.

## To decide / placeholders
- **Name** — confirm npm + GitHub org availability for "AgentGate" (or pick another); rename throughout.
- **License** — recommend **MIT** (permissive → adoption).
- **GitHub home** — `brett-buskirk/agentgate` or a dedicated project org.
- **LLM check in v1?** — recommend no; ship deterministic v1 first, add as v2.
