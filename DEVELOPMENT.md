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

**Up next (Sprint 2 — Milestone 4):**
- Bundle the action with `@vercel/ncc` → `dist/index.js`
- Add the dogfood CI step (`uses: ./` on PRs)
- Write the README quickstart + config reference
- Polish: test coverage report, lint in CI
