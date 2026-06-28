# Development Log

Sprint-by-sprint build history for AgentGate.

---

## Sprint 1 — Scaffold + Core Loop (June 2026)

**What was built:**
- TypeScript/Node 20 project with strict tsconfig, Vitest, ESLint, Prettier
- Diff parsing engine — pure TypeScript unified diff parser (no external library)
- Config schema (`zod`) + loading (`js-yaml`) with full defaults
- Glob matching utility (internal, no external dependency)
- All six MVP rules — `secrets`, `scope`, `diff_size`, `tests_required`, `dependencies`, `dangerous_patterns`
- Engine — aggregates rule findings, computes verdict from `fail_on` config
- CLI entry (`agent-gate check --base <ref> [--json]`)
- GitHub Action entry with PR comment (upsert-by-marker), check run, and step summary reporters
- Fixture-based test suite — clean + dirty diffs for each rule, plus engine integration tests
- `.agentgate.yml` dogfood config for the repo itself
- GitHub repo with labels, milestones, project board, issue templates, PR template, dependabot

**Architecture decisions:**
- Implemented a lightweight diff parser rather than depending on `parse-diff` (which went ESM-only in v0.10+), avoiding module system friction with CommonJS output
- Internal glob matcher avoids `minimatch`/`picomatch` ESM compatibility issue
- `zod` schema with `.default({})` chains gives zero-config defaults with clean error messages for invalid configs
- Comment upsert uses a hidden HTML marker (`<!-- agentgate -->`) so re-runs update in place rather than spamming the PR

---

## Sprint 2 — Action Bundle + Publish (June 2026)

**What was built:**
- Action bundled with `@vercel/ncc` → single committed `dist/index.js` (so GitHub runs it without an install step)
- Build split: `tsc` → `lib/` (npm package) and `ncc` → `dist/` (Action), keeping the npm tarball small
- CI workflow: typecheck, test, lint, bundle-verify, plus the AgentGate dogfood job (`uses: ./`) on PRs
- Branch protection on `main` (requires the CI check to pass)
- Published to npm and tagged the Action

**Architecture decisions:**
- Package scoped to `@brett.buskirk/agent-gate` — npm rejected the bare `agent-gate` as too similar to an existing `agentgate` package
- `bin/agent-gate.js` wrapper (requires `../lib/cli.js`) — npm 11 strips `bin` entries that point into the git-ignored `lib/`, so a committed wrapper is the stable entry point

## Sprint 3 — Polish + Release Engineering (June 2026)

**What was built:**
- `agent-gate init` — scaffolds a commented `.agentgate.yml`
- CLI default-branch auto-detection (`origin/HEAD` → `origin/main`/`master` → local → `main`)
- Colored CLI output (`NO_COLOR`/non-TTY aware)
- Test-coverage gate in CI (≥ 90%, currently 99%+) via `vitest.config.ts` thresholds
- Release runbook (`docs/RELEASING.md`) and GitHub Marketplace prep — verified `action.yml` branding, moving `v0` tag, GitHub Releases

**Up next (v1.0 — Launch):**
- Publish the GitHub Marketplace listing
- Add a README demo image (CLI output + sample PR comment)
