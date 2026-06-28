# Changelog

All notable changes to AgentGate are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.1] - 2026-06-28

### Changed
- Marketplace listing name set to **"AgentGate - AI PR Guardrails"** (the bare "AgentGate" listing name was already taken). Display-name only — the `uses: brett-buskirk/agent-gate@v0` reference is unchanged.

### Fixed
- Corrected the GitHub Marketplace Developer Agreement link in the release runbook.

## [0.2.0] - 2026-06-28

### Added
- `agent-gate init` — scaffolds a commented `.agentgate.yml` in the current directory.
- CLI base-branch auto-detection — `agent-gate check` resolves the default branch (`origin/HEAD` → `origin/main`/`master` → local `main`/`master` → `main`) when `--base` is omitted.
- Colored CLI output for verdicts and severity labels (respects `NO_COLOR` and non-TTY environments).
- Test-coverage enforcement in CI — core engine and rule logic gated at ≥ 90% (currently 99%+).

## [0.1.0] - 2026-06-28

### Added
- Diff parsing engine — pure TypeScript unified-diff parser, no external parser dependency.
- Config schema and loading — `zod` validation over `.agentgate.yml`, with zero-config defaults.
- Six MVP guardrail rules: `secrets`, `scope`, `diff_size`, `tests_required`, `dependencies`, `dangerous_patterns`.
- CLI (`agent-gate check`) — runs the engine against a local `git diff`.
- GitHub Action — fetches the PR diff via the API and runs the engine, with three reporters: PR comment (upsert-by-marker), check run / commit status, and Step Summary.
- Fixture-based test suite for every rule and the engine.
- `.agentgate.yml` dogfood config — AgentGate runs on its own PRs.
- Action bundled to a single committed `dist/index.js` via `@vercel/ncc`.
- Published to npm as [`@brett.buskirk/agent-gate`](https://www.npmjs.com/package/@brett.buskirk/agent-gate), exposing the `agent-gate` and `agentgate` CLI binaries.
- Repo scaffolding: issue templates (bug, feature, rule request), PR template, branch protection on `main`.

[Unreleased]: https://github.com/brett-buskirk/agent-gate/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/brett-buskirk/agent-gate/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/brett-buskirk/agent-gate/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/brett-buskirk/agent-gate/releases/tag/v0.1.0
