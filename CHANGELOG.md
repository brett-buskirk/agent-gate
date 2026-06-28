# Changelog

All notable changes to AgentGate are documented here.

## [Unreleased]

### Added
- Initial project scaffold: TypeScript, Vitest, ESLint, Prettier
- Diff parsing engine (pure implementation, no external parser dependency)
- Config schema and loading (`zod` validation, `.agentgate.yml`)
- Six MVP guardrail rules: `secrets`, `scope`, `diff_size`, `tests_required`, `dependencies`, `dangerous_patterns`
- CLI entry (`agent-gate check --base <ref>`)
- GitHub Action entry with PR comment, check run, and step summary reporters
- Fixture-based test suite for all rules and the engine
- `.agentgate.yml` dogfood config (AgentGate runs on its own PRs)
- Issue templates: bug report, feature request, rule request
- PR template with rule-testing checklist
