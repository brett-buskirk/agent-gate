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

## Sprint 2 — Action Bundle + Dogfood CI (next)

- [ ] `npm run build:action` → `dist/index.js` committed
- [ ] CI workflow updated: add lint step + AgentGate dogfood step (`uses: ./`)
- [ ] Branch protection on `main` (require CI green)
- [ ] README: quickstart, config reference, PR comment screenshot
- [ ] npm publish (0.1.0)

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
