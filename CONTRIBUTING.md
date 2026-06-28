# Contributing to AgentGate

Thank you for your interest. AgentGate is the safety net for AI-generated PRs — contributions that sharpen its accuracy or broaden its reach are very welcome.

## Workflow

1. Fork the repo and create a branch: `git checkout -b feat/my-change`
2. Make your changes (see conventions below)
3. Run `npm run typecheck && npm test && npm run lint` — all must pass
4. Push and open a PR against `main`
5. CI runs typecheck, tests (with a ≥ 90% coverage gate), and lint; AgentGate also runs on your PR

## Adding a new rule

1. Create `src/rules/myRule.ts` — export a `Rule` object with `id`, `description`, and `run(diff, config)`
2. Register it in `src/rules/index.ts`
3. Add config options to the schema in `src/config/schema.ts`
4. Add fixture diffs in `test/fixtures/` — one clean (passes), one dirty (trips the rule)
5. Write tests in `test/rules/myRule.test.ts`
6. Update `.agentgate.yml` defaults if needed
7. Use the **Rule request** issue template to discuss before implementing large changes

## Conventions

- **Rules are pure functions** — `run(diff, config)` returns `Finding[]`, no I/O, no side effects
- **Every rule respects `enabled: false`** — return `[]` immediately if disabled
- **Every rule has a `suggestion`** — findings are actionable, not just accusations
- **Tests use real fixture diffs** — no mocking; fixtures live in `test/fixtures/`
- **TypeScript strict mode** — no `any`, no `!` assertions without good reason

## Dev setup

```bash
npm install
npm run typecheck   # tsc --noEmit
npm test            # vitest run
npm run lint        # eslint
npm run format      # prettier --write
```
