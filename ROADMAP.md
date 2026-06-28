# Roadmap

## v1.0.0 — Launch (current milestone)

- [x] All six MVP rules with fixture tests
- [x] CLI (`agent-gate check`)
- [ ] GitHub Action bundled and published (`uses: brett-buskirk/agent-gate@v1`)
- [ ] Dogfood CI green (AgentGate runs on its own PRs)
- [ ] README with quickstart, full config reference, and PR comment screenshot

## v2.0 — LLM Intent Check *(headline feature)*

An optional rule that uses the Anthropic API to assess whether the PR's actual changes match its stated description or linked issue — catching agents that went off-scope and did more (or other) than asked. *AI checking AI.* Opt-in, requires `ANTHROPIC_API_KEY`.

## v2.x — Depth & Integration

- **SARIF output** for GitHub code-scanning integration
- **Shareable policy packs** — named presets teams can extend (`extends: agentgate/strict`)
- **Deeper secrets scanning** — optional `gitleaks`/`trufflehog` integration
- **More language manifests** — `pyproject.toml`, `pnpm-lock.yaml`, `yarn.lock`, `composer.json`
- **Baseline/ignore files** — `.agentgateignore` for known-acceptable findings
- **GitHub Marketplace** listing

## v3.x — Platform

- Pre-commit hook integration
- VS Code / IDE extension (surface findings inline as you code)
- Webhook-based installation (no workflow edit required)
