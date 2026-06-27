# SMK-349: Pre-PR Check Suite

## Background

We set out to design a fast local check suite (~60s) that catches the most common CI failures before Rich pushes a branch — without a full build or hitting staging. The motivation: CI failures that could have been caught locally cost context-switching time and slow down merge velocity.

---

## Research

We benchmarked our initial design against industry practice by reviewing engineering blogs and dev tooling documentation (Vercel, Netlify, Google, GitHub blog, tooling authors). The consensus on tiered local testing:

| Tier | Target | What it does |
|---|---|---|
| Pre-commit hook | <5s | Fast guards — staged file checks only |
| Pre-push hook | 10–60s | Broader checks before code leaves your machine |
| Manual pre-PR | ~60s | Developer-triggered, full quality gate before opening a PR |

Our repo already has strong pre-commit and pre-push hooks. The **gap was at the manual pre-PR tier** — specifically:

- **ESLint was completely absent** from all local hooks (only in CI). It ran at 58s cold but drops to ~2s with `--cache`, which we added.
- **Auth enforcement** — the existing `check-auth.sh` only checked for `requireAuth`, missing 8 other valid guard patterns the codebase uses. We replaced it with `check-auth.mjs` which knows all approved patterns and passes cleanly.
- **`tsc --noEmit`** runs incrementally via `.tsbuildinfo` (~9s warm vs 36s cold) — already performant, just needed to be wired in locally.
- **`vitest --changed origin/main`** runs only tests for files changed on the branch vs main, following the import graph. On a typical feature branch (src/ changes only): 5–15s. Falls back to the full suite (~50s) when `package.json` or config files change — which is the correct conservative behavior.

We looked at `lint-staged` and `tsc-files` (incremental tools common in large repos) and decided against adding them. The `--cache` and `.tsbuildinfo` mechanisms already solve the performance problem without new packages.

---

## Implementation

**`scripts/pre-pr-check.mjs`** — the check runner  
**`npm run check:pr`** — the entry point  
**`.claude/commands/pr.md`** — a `/pr` slash command for Claude Code

The script runs in two phases:

```
Parallel (~12s wall time):
  auth enforcement       node scripts/check-auth.mjs
  dep policy             node scripts/check-dependency-policy.mjs
  lint (cached)          eslint --cache src scripts worker tests

Sequential (~15–20s on typical feature branch):
  typecheck              tsc --noEmit (incremental)
  unit tests             vitest run --changed origin/main
```

**Intentionally excluded:**
- Em-dash scan — 130+ pre-existing violations in JSX; always fails, already in CI
- `lint:check-baseline` — 66s; CI only

---

## Testing

### Happy path — clean green run, exits 0

```
✓ auth enforcement           342ms
✓ dep policy                 139ms
✓ lint (cached)              7.4s
✓ typecheck                  18.2s
✓ unit tests                 varies (see Timing below)

─────────────────────────────────────
All checks passed  ~45s
```

### Failure path — deliberately injected a TypeScript error

```
✓ auth enforcement           562ms
✓ dep policy                 202ms
✓ lint (cached)              10.2s
✗ typecheck                  84.5s
✓ unit tests                 60.2s

─────────────────────────────────────
1 check(s) failed  154.9s
  typecheck
```

Script exited 1, showed file path + line + error — exactly what's needed before opening a PR.

### How failures are displayed

Each check prints its result inline as it completes. A passing check shows a green checkmark; a failing check shows a red ✗ followed by the first 25 lines of output from that tool, indented for readability. If the output is longer than 25 lines, a truncation note appears.

Example — a TypeScript error:
```
✗ typecheck                  18.4s
      src/lib/utils.ts(1,7): error TS2322: Type 'string' is not assignable to type 'number'.
```

Example — a lint error with many violations:
```
✗ lint (cached)              3.2s
      src/app/dashboard/discover/page.tsx
        42:5  error  'unusedVar' is defined but never used  no-unused-vars
        67:1  error  Unexpected console statement           no-console
      ... and 14 more lines
```

After all checks finish, a summary line lists the failed check names:
```
─────────────────────────────────────
1 check(s) failed  154.9s
  typecheck
```

### Timing

| Scenario | Vitest | Total estimate |
|---|---|---|
| Typical feature branch (src/ only) | 5–15s | ~35–45s |
| Branch that changes package.json or config | ~50s (full suite) | ~90s |
| SMK-349 branch itself | ~50s (full suite, package.json in diff) | ~112s |

The SMK-349 branch is atypical — it changes `package.json` to add the `check:pr` script and the `--cache` flag. Rich's normal feature branches won't do this.

---

## How It Gets Triggered

**Recommended: the `/pr` slash command in Claude Code.**

When Rich types `/pr`, Claude will:
1. Run `npm run check:pr` and show the output
2. If all pass → proceed to open the PR with `gh pr create`
3. If any fail → stop, list what failed, and ask Rich:
   - Fix the issues first (recommended)
   - Proceed anyway (he accepts the risk)
   - Cancel

Rich can also run `npm run check:pr` directly from the terminal at any time.

**What it is not:**
- Not a pre-commit hook (too slow for that tier)
- Not automatic on push (the existing pre-push hook covers that tier)
- Not a replacement for CI — it's a fast local pre-flight to avoid obvious CI failures before a PR is opened

---

## Branch / PR

Branch: `SMK-349/pre-pr-check-suite` (3 commits ahead of main)

The branch needs to be pushed from Rich's machine — the pre-push growth metrics gate requires an up-to-date `docs/growth/weekly-metrics.latest.json` (stale on Chris's machine).

Once pushed: PR body `Closes SMK-349`, base `main`.
