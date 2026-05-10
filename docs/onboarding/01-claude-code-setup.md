# Setting Up Claude Code

Welcome to Starting Monday. This gets you to a working Claude Code environment in about 20 minutes.

---

## What Is Claude Code

Claude Code is Anthropic's CLI that runs Claude directly in your terminal, with full access to the codebase. It reads files, edits code, runs shell commands, and tracks tasks. It's the primary development tool for this project. Think of it as a senior engineer sitting next to you who can read and write the entire codebase.

---

## Step 1: Prerequisites

You need Node.js >= 20.9.0. Check:

```bash
node --version
```

If it's older or missing: https://nodejs.org (install the LTS version).

---

## Step 2: Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Verify:

```bash
claude --version
```

---

## Step 3: Authenticate

```bash
claude
```

First run will open a browser to authenticate with your Anthropic account. If you don't have one, create one at https://claude.ai — you'll need a Claude Pro subscription ($20/month) or Claude for Teams. Rich will confirm which plan to use.

---

## Step 4: Open the Project

```bash
cd C:\Users\[your-name]\startingmonday   # or wherever you cloned the repo
claude
```

Claude Code opens in your terminal. The project has a `CLAUDE.md` file at the root that automatically loads project-specific instructions for Claude. You don't need to configure anything — Claude reads it on startup.

---

## Step 5: Try a Few Things

Once Claude Code is running, try these to get oriented:

```
> read the architecture document
> show me the database schema
> what is the current list of open tasks in the roadmap
```

Claude Code can see the entire codebase. You can ask it to explain any file, trace a request through the API, or start building a feature. It's conversational — just describe what you want.

---

## IDE Integration (Optional but Recommended)

Claude Code integrates with VS Code and JetBrains. In VS Code, install the "Claude Code" extension from the marketplace. This lets you open Claude Code in a panel, reference selected code with a keyboard shortcut, and see diffs inline.

---

## How Rich Uses Claude Code

Most features on this project were built primarily through Claude Code. The workflow is:

1. Describe the feature or bug in plain language
2. Claude proposes a plan — push back or approve
3. Claude writes the code, you review the diffs
4. Claude commits and pushes; Railway deploys automatically

You'll develop your own style. Some people write more code themselves and use Claude for specific tasks (explain this, write a test for this). Others describe features at a high level and review everything. Both work.

---

## Pre-Commit Hooks

The project has a pre-commit hook that runs automatically on every commit:

1. **TypeScript check** (`tsc --noEmit`) — must pass with zero errors
2. **Em dash check** — literal em dash characters (`—`) in source files are blocked; use HTML entity `&mdash;` in `.tsx` content or reword to avoid em dashes entirely in `.ts` files

If a commit fails, fix the issue and commit again. Do not use `--no-verify` to bypass.

---

## Questions

Ask Rich or start a Claude Code session and ask it to walk you through anything. The codebase has extensive documentation in `docs/` and the `README.md` is a good starting point.
