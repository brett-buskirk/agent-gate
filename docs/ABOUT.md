# What is AgentGate? (the plain-language version)

**AgentGate is a safety net for code written by AI.**

If your team uses an AI coding assistant — Claude Code, GitHub Copilot, Cursor, and the like — this page explains what AgentGate does and why it's useful, without the technical jargon. (Engineers: the [README](../README.md) and [DESIGN](DESIGN.md) have the details.)

---

## The short version

AI assistants write a *lot* of code, very fast. Most of it is good. But because they move so quickly, they occasionally do things a careful human wouldn't — leave a password in plain sight, change a file they weren't supposed to touch, or quietly pull in software from a stranger on the internet.

Normally a person reviews these changes before they go live. But when the AI is producing changes faster than anyone can read them, "review" quietly turns into "click approve and hope." That's the gap AgentGate fills.

**AgentGate is an automatic reviewer that checks every proposed change before a person signs off, and flags the risky parts** — so your team can *trust but verify* instead of rubber-stamping.

Think of it like the spell-check that underlines a misspelled word, the seatbelt that's just always there, or the smoke detector in the hallway. You don't think about it day to day — it simply catches the dangerous thing before it becomes a problem.

---

## What it actually checks (in plain English)

Every time a change is proposed, AgentGate looks for six kinds of trouble:

| It watches for… | In plain terms |
|---|---|
| 🔑 **Leaked secrets** | Passwords, access keys, or private credentials accidentally left in the code where anyone could copy them. |
| 🚧 **Out-of-bounds changes** | The AI edited files it had no business touching — like settings, billing, or deployment controls. |
| 📦 **Oversized changes** | A change so large no human could realistically review it carefully. |
| 🧪 **Missing tests** | New features added without the safety checks that prove they actually work. |
| 🧩 **New outside software** | Pulling in third-party code, which can carry bugs or security risks from someone else's project. |
| ⚠️ **Risky commands** | Specific patterns known to be dangerous or to sidestep safety checks. |

When it finds something, it doesn't just complain — it leaves a short, **specific suggestion** for what to do about it.

---

## How your team uses it

1. **It lives in your project** and runs automatically whenever a change is proposed — no one has to remember to trigger it.
2. **It leaves one tidy note** summarizing what it found, updated in place (it never spams a pile of comments).
3. **It shows a green check or a red ✗** — green means "nothing alarming, good to go"; red means "a human should look before this merges."
4. **There's nothing new to learn.** It fits into the review step your team already has.

---

## Who it's for

Teams shipping real work with AI coding tools — especially **smaller teams and startups** that don't have a dedicated security person watching every change. AgentGate gives them a baseline of that protection automatically.

---

## The bigger picture

AgentGate is the open-source centerpiece of [Brett Buskirk LLC](https://brett-buskirk.dev)'s **Agentic Development Workflow Setup** — a service that helps teams adopt AI coding agents *safely*: with guardrails, sensible defaults, and the discipline to keep agents on task. The tool is the thing the service installs and tunes for you.

---

## Want the technical details?

- **[README](../README.md)** — quickstart, configuration, and the full rule reference
- **[DESIGN](DESIGN.md)** — how it works under the hood
- **[ROADMAP](../ROADMAP.md)** — what's coming next (including an AI-powered "did the agent actually do what was asked?" check)
