# Sprint Plan

## Sprint 1 — Scaffold + All Rules ✅ (June 2026)

- [x] TypeScript project setup (strict, Vitest, ESLint, Prettier)
- [x] Diff parser (pure implementation)
- [x] Config schema + loading (zod + js-yaml)
- [x] Glob matching utility
- [x] All six rules: secrets, scope, diff_size, tests_required, dependencies, dangerous_patterns
- [x] Engine (verdict computation)
- [x] CLI entry (`agent-gate check`)
- [x] Action entry + all reporters (comment, checkRun, summary)
- [x] Fixture-based tests for all rules + engine
- [x] GitHub repo: labels, milestones, project, issue templates
- [x] .agentgate.yml dogfood config

## Sprint 2 — Action Bundle + Dogfood CI (June 2026)

- [x] `npm run build:action` → `dist/index.js` committed
- [x] CI workflow updated: typecheck, test, lint, bundle verify, AgentGate dogfood step (`uses: ./`)
- [x] Branch protection on `main` (require CI green)
- [x] npm publish — `@brett.buskirk/agent-gate@0.1.0`

## Sprint 3 — Polish + v1.0

- [ ] Test coverage ≥ 90% enforced in CI
- [ ] `--base-branch` auto-detection (default to default branch)
- [ ] Nicer CLI output (color, progress)
- [ ] `agentgate init` command to scaffold `.agentgate.yml`
- [ ] GitHub Marketplace draft

## Future — v2

- [ ] LLM intent check (Anthropic API, opt-in)
- [ ] SARIF output
- [ ] Shareable policy packs
- [ ] gitleaks/trufflehog integration
