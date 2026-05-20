# Technical Debt Execution Backlog (May 19, 2026)

Source: docs/technical-debt-analysis-2026-05-19.md

This backlog translates debt findings into sprint-executable work items.

## Execution Rules

- Each item must have one direct owner.
- Each item must define measurable acceptance criteria.
- New debt regression is blocked even while old debt is burned down.
- Close items only after evidence is attached (CI run, logs, screenshots, or command output).

## Sprint Plan Snapshot

- Sprint A (Week 1-2): TD-01, TD-04, TD-06
- Sprint B (Week 3-4): TD-02 (guardrail), TD-03 (framework + first 10 routes)
- Sprint C (Week 5-6): TD-05 (CI-critical scripts), TD-07, TD-08

## Issue Backlog

### DEBT-001: Enforce dependency compatibility gates (Next plus Sentry)

- Debt IDs: TD-01
- Priority: P0
- Owner: Platform/DevEx
- Effort: M (2-3 days)
- Target Sprint: Sprint A
- Dependencies: none
- Scope:
  - Add CI gate that runs npm ci and npm run build on main-targeted PRs.
  - Add dependency compatibility check for next and @sentry/nextjs peer alignment.
  - Fail fast when lockfile and package manifests diverge.
- Acceptance Criteria:
  - PR CI fails if npm ci fails for dependency resolution.
  - PR CI fails if next/@sentry/nextjs combination is unsupported.
  - One successful dry run against a test branch is documented.
- Evidence to attach on close:
  - CI workflow link showing green run.
  - Sample failing run screenshot or log excerpt.

### DEBT-002: Make auth guard validation cross-platform

- Debt IDs: TD-04
- Priority: P0
- Owner: Platform/DevEx
- Effort: S (1 day)
- Target Sprint: Sprint A
- Dependencies: none
- Scope:
  - Replace check:auth shell script dependency with Node-based implementation.
  - Keep command name stable (npm run check:auth).
- Acceptance Criteria:
  - npm run check:auth works in Windows PowerShell and Linux shell.
  - CI and local output format remain consistent.
- Evidence to attach on close:
  - Successful run output from Windows and Linux.

### DEBT-003: Remove README command drift (typecheck)

- Debt IDs: TD-06
- Priority: P1
- Owner: Platform/DevEx
- Effort: XS (0.5 day)
- Target Sprint: Sprint A
- Dependencies: none
- Scope:
  - Add npm run typecheck script or update docs to match available scripts.
  - Add docs command validation check (lightweight script in CI).
- Acceptance Criteria:
  - README commands execute as written.
  - CI fails when documented core commands do not exist.
- Evidence to attach on close:
  - CI check output and updated doc diff.

### DEBT-004: Freeze lint warning growth and set burn-down baseline

- Debt IDs: TD-02
- Priority: P1
- Owner: API/Frontend shared
- Effort: S (1 day)
- Target Sprint: Sprint B
- Dependencies: DEBT-001
- Scope:
  - Snapshot current warnings by rule and file.
  - Add CI check that blocks warning count increase.
  - Define quarterly burn-down target.
- Acceptance Criteria:
  - Warning baseline file committed.
  - CI blocks net-new warnings.
  - Team agrees on reduction target (for example, 40 percent in one quarter).
- Evidence to attach on close:
  - Baseline artifact and CI gate result.

### DEBT-005: Add typed automation route scaffold and migrate first 10 routes

- Debt IDs: TD-03
- Priority: P0
- Owner: API/Backend
- Effort: L (4-6 days)
- Target Sprint: Sprint B
- Dependencies: DEBT-004
- Scope:
  - Create shared helper for automation routes: auth, Zod input parse, typed responses.
  - Remove file-level no-explicit-any suppression from first 10 high-risk routes.
  - Preserve current behavior and auth requirements.
- Acceptance Criteria:
  - 10 routes migrated with no file-level no-explicit-any suppression.
  - Route tests or smoke checks pass.
  - No auth bypass regressions.
- Evidence to attach on close:
  - List of migrated routes with PR links.
  - Before/after lint counts for those files.

### DEBT-006: Replace hard process exits in CI-critical scripts

- Debt IDs: TD-05
- Priority: P1
- Owner: Platform/DevEx
- Effort: M (2-3 days)
- Target Sprint: Sprint C
- Dependencies: DEBT-001
- Scope:
  - Prioritize scripts used in prebuild, monitoring, integrity, and CI checks.
  - Replace process.exit calls with process.exitCode and structured return paths.
  - Keep non-zero exit behavior equivalent.
- Acceptance Criteria:
  - Critical scripts preserve pass/fail semantics.
  - No unhandled promise exits in migrated scripts.
  - Node teardown/assertion edge cases are no longer observed.
- Evidence to attach on close:
  - Script list and regression test output.

### DEBT-007: Split LinkedIn ingestion storage from curated profile text

- Debt IDs: TD-07
- Priority: P1
- Owner: API/Backend + Data
- Effort: M (2-3 days)
- Target Sprint: Sprint C
- Dependencies: none
- Scope:
  - Add dedicated storage for raw LinkedIn ingestion text.
  - Keep linkedin_about for generated/curated user-facing copy only.
  - Update upload flow and any downstream readers.
- Acceptance Criteria:
  - Upload route writes raw text to dedicated field/table.
  - Existing LinkedIn generation still works.
  - Data migration path is documented for existing records.
- Evidence to attach on close:
  - Migration diff, API diff, and smoke test output.

### DEBT-008: Retire unsigned tracking token fallback

- Debt IDs: TD-08
- Priority: P2
- Owner: API/Backend
- Effort: S (1 day)
- Target Sprint: Sprint C
- Dependencies: telemetry confirmation window
- Scope:
  - Add metric for unsigned-token traffic share.
  - Flip strict mode default once unsigned share is near zero.
  - Remove unsigned parse/generate path after sunset period.
- Acceptance Criteria:
  - Unsigned usage trend visible in dashboard/logs.
  - Strict mode enabled by default with no production break.
  - Legacy path removed on schedule.
- Evidence to attach on close:
  - Metric snapshots and release note entry.

## Weekly Review Template

Use this in sprint planning or weekly ops:

- Completed this week:
- In progress:
- Blocked:
- New risks introduced:
- Lint warning delta:
- Deploy reliability delta:
- Next week commitments:

## Success Thresholds

- No dependency-resolution deployment failures for 60 days.
- Lint warnings trend downward every sprint (no net-new warning regressions).
- Cross-platform validation scripts run reliably on Windows and Linux.
- 80 percent of automation routes migrated to typed scaffold by end of quarter.
- Unsigned token path fully retired after telemetry threshold is met.
