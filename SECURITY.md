# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.x     | Yes       |

## Reporting a Vulnerability

Please do **not** file a public GitHub issue for security vulnerabilities.

Report them privately via [GitHub's private vulnerability reporting](https://github.com/brett-buskirk/agent-gate/security/advisories/new).

Include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact

You'll receive a response within 48 hours. Valid reports will be credited in the release notes unless you prefer anonymity.

## Scope

AgentGate runs in CI environments and reads GitHub API data. Key considerations:

- **No secrets stored** — AgentGate reads the GitHub token from the Actions environment and uses it only for API calls within the workflow.
- **Regex patterns** — user-supplied `dangerous_patterns` regexes are compiled at runtime. Malformed patterns throw and fail the check rather than silently matching everything.
- **No network calls from CLI mode** — the local `agent-gate check` command only calls `git diff` and reads local files.
