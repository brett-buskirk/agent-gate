# Roadmap

## Shipped (v0.1.0 → v1.0.0)

- [x] All six MVP rules with fixture tests — `secrets`, `scope`, `diff_size`, `tests_required`, `dependencies`, `dangerous_patterns`
- [x] CLI — `agent-gate check` (default-branch auto-detection, `--json`) and `agent-gate init`
- [x] GitHub Action — bundled to `dist/index.js`, with PR comment, check run, and Step Summary reporters
- [x] Dogfood CI green — AgentGate runs on its own PRs (`uses: ./`)
- [x] Published to npm (`@brett.buskirk/agent-gate`) and tagged for the Action (`uses: brett-buskirk/agent-gate@v0`)
- [x] Test-coverage gate in CI (≥ 90%, currently 99%+)
- [x] README quickstart + full config reference

## v1.0.0 — Launch ✅ (June 2026)

- [x] GitHub Marketplace listing — [AgentGate - AI PR Guardrails](https://github.com/marketplace/actions/agentgate-ai-pr-guardrails)
- [x] README demo image — CLI output and a sample PR comment (freshness-checked in CI)
- [x] First **stable** release tagged `v1.0.0`

## Next up (post-launch)

- [ ] First external adopter + write-up (Medium piece; promote on brett-buskirk.dev)

## v2.0 — LLM Intent Check *(headline feature)*

An optional rule that uses the Anthropic API to assess whether the PR's actual changes match its stated description or linked issue — catching agents that went off-scope and did more (or other) than asked. *AI checking AI.* Opt-in, requires `ANTHROPIC_API_KEY`.

## v2.x — Depth & Integration

- **SARIF output** for GitHub code-scanning integration
- **Shareable policy packs** — named presets teams can extend (`extends: agentgate/strict`)
- **Deeper secrets scanning** — optional `gitleaks`/`trufflehog` integration
- **More language manifests** — `pyproject.toml`, `pnpm-lock.yaml`, `yarn.lock`, `composer.json`
- **Baseline/ignore files** — `.agentgateignore` for known-acceptable findings

## v3.x — Platform

- Pre-commit hook integration
- VS Code / IDE extension (surface findings inline as you code)
- Webhook-based installation (no workflow edit required)
