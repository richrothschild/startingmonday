# Setting Up Claude Code and Connecting to the Right Places

Welcome to Starting Monday. This gets you fully set up in about 45 minutes.

---

## What Is Claude Code

Claude Code is Anthropic's CLI that runs Claude directly in your terminal, with full access to the codebase. It reads files, edits code, runs shell commands, and tracks tasks. It's the primary development tool for this project. Think of it as a senior engineer sitting next to you who can read and write the entire codebase.

Most features on this project were built primarily through Claude Code. You will develop your own style — some engineers describe features at a high level and review diffs, others write code themselves and use Claude for specific tasks. Both approaches work.

---

## Step 1: Prerequisites

You need Node.js >= 20.9.0:

```bash
node --version
```

If it's older or missing: install the LTS version from [nodejs.org](https://nodejs.org).

---

## Step 2: Install Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
```

Verify:

```bash
claude --version
```

---

## Step 3: Authenticate with Anthropic

```bash
claude
```

First run opens a browser. Log in with your Anthropic account. If you don't have one, create one at [claude.ai](https://claude.ai). You need a Claude Pro subscription ($20/month) or ask Rich to add you to the project's Claude for Work account.

---

## Step 4: Clone the Repository

You need to be added as a GitHub collaborator first — Rich will send the invitation to your GitHub account. Accept it, then:

```bash
git clone https://github.com/richrothschild/startingmonday.git
cd startingmonday
```

---

## Step 5: Open the Project with Claude Code

```bash
cd startingmonday
claude
```

The project has a `CLAUDE.md` file at the root that auto-loads project-specific instructions for Claude on startup. You don't need to configure anything. It tells Claude how the codebase works, what rules to follow, and what to never do.

Try these to get oriented immediately:

```text
> read the architecture document
> show me the database schema
> what are the current open tasks in the roadmap
> walk me through how a prep brief gets generated
```

---

## Step 6: VS Code Extension (Recommended)

If you use VS Code:

1. Open VS Code
2. Go to the Extensions panel (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Claude Code"
4. Install the extension published by Anthropic
5. Restart VS Code
6. Open the command palette (Ctrl+Shift+P / Cmd+Shift+P) and run **Claude Code: Open**
7. Claude Code opens in a panel. You can reference selected code with a keyboard shortcut and see diffs inline.

The VS Code extension and the terminal CLI are the same Claude Code session. Use whichever fits your workflow.

---

## Step 7: Connect to Each Service

You need read or member access to each of these. Rich will set them up before your first day. Verify each one works.

### GitHub

Already set up if you cloned the repo. Confirm you have write access:

```bash
git push --dry-run origin main
```

This should succeed (or fail with "everything up-to-date") — not a permission error.

### Railway (production + worker deployment)

Go to [railway.app](https://railway.app) and log in. Rich will add you to the project team.

What to verify:

- You can see two services: **startingmonday** (the Next.js app) and **startingmonday-worker** (the background job service)
- You can view deploy logs for each service
- You can see the environment variables (you will not need to change them, but you need to read them to understand the configuration)

Do not make changes to Railway environment variables without coordinating with Rich. They affect production immediately.

### Supabase (database + auth)

Go to [supabase.com/dashboard](https://supabase.com/dashboard) and log in. Rich will add you to the project.

What to verify:

- You can open the **Table Editor** and see tables (companies, contacts, user_profiles, company_signals, etc.)
- You can open the **SQL Editor** and run a test query: `SELECT COUNT(*) FROM companies;`
- You can see the **Authentication** panel and the current user list

**Important**: The local dev server connects to the production database by default. Be careful with any write or delete operations. For destructive testing, coordinate with Rich first.

### Resend (email delivery)

Go to [resend.com](https://resend.com) and log in. Rich will add you as a team member.

What to verify: you can see the email logs and the two sending domains (`startingmonday.app` and `briefing.startingmonday.app`).

### Anthropic Console (API usage)

Go to [console.anthropic.com](https://console.anthropic.com) and log in. Rich will add you to the workspace.

What to verify: you can see the API usage dashboard and the API keys configured for the project.

### Sentry (error monitoring)

Go to [sentry.io](https://sentry.io) and log in. Rich will add you to the organization.

What to verify: you can see the **startingmonday** project and view recent error events.

---

## Step 8: Environment Variables

Rich will share the `.env.local` file directly. Place it in the root of the project:

```text
startingmonday/
  .env.local    <- here
  src/
  worker/
```

Never commit this file — it's in `.gitignore`.

For the worker, create a matching `.env` file inside `worker/`:

```text
startingmonday/
  worker/
    .env    <- here (copy relevant vars from .env.local)
```

The full list of required variables is in `docs/onboarding/02-environment-setup.md`.

---

## Step 9: Pre-Commit Hooks

The project runs two checks on every commit automatically:

1. **TypeScript check** (`tsc --noEmit`) — must pass with zero errors
2. **Em dash check** — the literal em dash character (`--`) in any source file blocks the commit; use `&mdash;` in `.tsx` content or reword to avoid em dashes entirely

If a commit fails, fix the issue and commit again. Never use `--no-verify` to bypass.

The hook lives in `.githooks/pre-commit`. If it's not running automatically after clone, wire it up:

```bash
git config core.hooksPath .githooks
```

Run the TypeScript check manually before committing:

```bash
npm run typecheck
```

---

## Step 10: Meeting Cadence

Before or during your first week, agree on the following with Rich:

- [ ] **Async channel**: Which tool (Slack, Teams, Discord, iMessage)? Get added and confirm it works.
- [ ] **Weekly sync**: Tuesday 8am PT — confirm this works in your timezone and block it on your calendar.
- [ ] **Production incident escalation**: How to reach Rich immediately if something breaks in production. Text message is the safest fallback.
- [ ] **PR review SLA**: Rich reviews PRs before merge; agree on expected turnaround (default: same business day for straightforward changes, 24h for complex).

---

## Useful First Commands

```bash
npm run dev          # start local server at localhost:3000
npm run typecheck    # TypeScript check (must pass before every commit)
npm test             # Vitest unit tests
npm run lint         # ESLint
git log --oneline -10  # recent commits
```

---

## Questions

Ask Rich on the agreed async channel, or start a Claude Code session and ask it to walk you through anything. The codebase has extensive documentation in `docs/` — `docs/onboarding/03-project-overview.md` is the best starting point.
