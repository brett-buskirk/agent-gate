# Releasing AgentGate

AgentGate ships in two channels from one repo:

- **npm** — the CLI, published as `@brett.buskirk/agent-gate`.
- **GitHub Action** — referenced as `brett-buskirk/agent-gate@<tag>`, run from the committed `dist/index.js`.

## Versioning & tags

We follow semver. While on `0.x`, minor bumps may carry breaking changes.

Two kinds of git tags:

| Tag | Points at | Purpose |
|-----|-----------|---------|
| `v0.2.0` | an exact release commit | Reproducible pin — `uses: …@v0.2.0` |
| `v0` | the latest `0.x` release | Moving convenience tag — `uses: …@v0` |

When you cut a new `0.x` release, **move** the `v0` tag forward to the new release commit so `@v0` users get it.

## Cutting a release

```bash
# 1. Bump the version in package.json AND src/cli.ts (.version('…')), then:
npm run typecheck
npm run lint
npm run test:coverage          # thresholds must pass
npm run build                  # tsc → lib/
npm run build:action           # ncc → dist/index.js (committed)

git add -A
git commit -m "release: v0.2.0"
git push origin main

# 2. Tag the exact release and move the major tag
git tag -a v0.2.0 -m "v0.2.0"
git tag -f v0                   # move the moving major tag
git push origin v0.2.0
git push -f origin v0

# 3. Cut the GitHub Release (vehicle for the Marketplace listing)
gh release create v0.2.0 --title "v0.2.0" --notes-file <notes>

# 4. Publish the CLI (requires npm OTP — run interactively)
npm publish --access public --otp=<code>
```

## Publishing to the GitHub Marketplace

The Action is **Marketplace-ready** (`action.yml` has a unique `name`, a
`description`, and valid `branding` — icon `shield`, color `blue`). Listing it
is a one-time manual step in the GitHub UI — it **cannot** be done from the CLI
because it requires accepting the Marketplace Developer Agreement.

1. Accept the [GitHub Marketplace Developer Agreement](https://docs.github.com/en/site-policy/github-terms/github-marketplace-developer-agreement) (one time, per account/org). GitHub prompts you to accept it inline the first time you tick the publish box.
2. On the repo, go to **Releases** and edit the latest release (e.g. `v0.2.1`).
3. GitHub detects `action.yml` and shows a **"Publish this Action to the GitHub Marketplace"** checkbox — check it.
4. Pick a primary and secondary **category** (e.g. *Code review*, *Security*).
5. Resolve any validation warnings. The listing name (from `action.yml` `name:`) must be unique across Marketplace — plain "AgentGate" is taken (by Maos' accuracy-metric gate), so we list as **"AgentGate - AI PR Guardrails"**. The `uses:` path is unaffected by the display name.
6. Publish the release.

After listing, add the Marketplace badge to the README (confirm the slug GitHub assigns):

```markdown
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-AgentGate-green?logo=github)](https://github.com/marketplace/actions/agentgate-ai-pr-guardrails)
```

## Release checklist

- [ ] Version bumped in `package.json` and `src/cli.ts`
- [ ] `npm run test:coverage` green (≥ 90%)
- [ ] `dist/index.js` rebuilt and committed
- [ ] `v<x.y.z>` tag pushed; `v0` moved
- [ ] GitHub Release created with notes
- [ ] `npm publish` done (OTP)
- [ ] Marketplace listing updated (UI)
