# AgentGate — Design Document

## What it is

A **guardrail layer for AI-agent-generated pull requests.** It runs in CI on every PR, inspects the diff for risk signals that agents commonly introduce, posts a clear review summary on the PR, and sets a pass/fail check — so a human can merge agent work with confidence instead of rubber-stamping it.

## Why it exists

Teams are adopting AI coding agents faster than they're adopting safety nets for them. Agent PRs leak secrets, wander outside their intended scope, balloon in size, skip tests, and quietly add dependencies. AgentGate is the missing seatbelt.

---

## Architecture

```
CLI / Action entry
        │
        ▼
  DiffProvider  ──────────►  DiffModel
  (git.ts / github.ts)        (parse.ts)
        │
        ▼
     Engine
   (engine.ts)
        │
        ├──► Rule[] → Finding[]
        │    (rules/index.ts)
        │
        ▼
   Reporters
   ├── comment.ts   (PR comment, upsert-by-marker)
   ├── checkRun.ts  (check / commit status)
   ├── summary.ts   (GitHub Step Summary)
   └── json.ts      (CLI text + --json)
```

### DiffModel

The shared internal representation that all rules consume:

```typescript
interface DiffModel {
  files: DiffFile[];
  totalAdded: number;
  totalDeleted: number;
}

interface DiffFile {
  path: string;
  oldPath: string | null;
  added: number;       // lines added in this file
  deleted: number;     // lines removed in this file
  isNew: boolean;
  isDeleted: boolean;
  chunks: DiffChunk[];
}

interface DiffChunk {
  lines: DiffLine[];   // type: 'add' | 'del' | 'normal'
}
```

### Rule interface

```typescript
interface Rule {
  id: string;
  description: string;
  run(diff: DiffModel, config: Config): Finding[];
}
```

Rules are pure functions. No I/O, no side effects, no async. They receive the full diff model and the resolved config, and return findings.

### Finding

```typescript
interface Finding {
  ruleId: string;
  severity: 'error' | 'warning' | 'info';
  file?: string;
  line?: number;
  message: string;
  suggestion?: string;   // always actionable
}
```

---

## The six MVP rules

| Rule | Severity | What it catches |
|------|----------|-----------------|
| `secrets` | error | AWS keys, GitHub tokens, private key blocks, high-entropy assignments |
| `scope` | error | Files outside the allow list or inside the deny list |
| `diff_size` | warning | PRs exceeding `max_files` or `max_lines` thresholds |
| `tests_required` | warning | Source changes with no corresponding test file changes |
| `dependencies` | warning | Modified dependency manifests (supply-chain risk) |
| `dangerous_patterns` | error | User-defined regex denylist on added lines |

---

## Design constraints

1. **No LLM in v1** — all rules are deterministic and regex/heuristic based. Fast, free, no API key required.
2. **Zero-config defaults** — works out of the box; `.agentgate.yml` is optional.
3. **One PR comment, updated in place** — a hidden HTML marker (`<!-- agentgate -->`) ensures re-runs replace rather than accumulate.
4. **Rules are plugins** — the `Rule` interface is the extension point; anyone can add a rule by exporting a conforming object and registering it in `rules/index.ts`.
5. **CommonJS output** — the bundle (`@vercel/ncc`) targets Node 20 CJS for maximum GitHub Actions compatibility.
