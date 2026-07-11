# Codebase Health Remediation — Plan & Work Breakdown Structure

**Project Key:** SMK
**Created:** 2026-07-07
**Source report:** docs/codebase-health-report.latest.md
**Verification loop:** Re-run `npm run audit:debt-deep-dive && npm run audit:security-deep-dive` at each sprint close and diff against report baselines.

---

## Plan Overview

Four workstreams, six one-week sprints. Every item from the health report maps to exactly one ticket. Two agents are already shipped (marked DONE); production synthetics already exist and are treated as an enhancement ticket, not a build.

**Initiative-level success criteria (exit gate, measured by re-running the audits):**
1. Security deep-dive: 0 true auth gaps (currently 2); CSP without `unsafe-inline`/`unsafe-eval` on script-src
2. Debt: placeholder tests ≤ 200 (from 310); lint warnings ≤ 450 (from 556); `any` count ≤ 150 (from 229); files >800 lines ≤ 14 (from 20)
3. Agents: all 10 roster agents live and registered in monitoring-watchdog
4. Observability: SLO burn-rate alerting live; Sentry release health keyed to deploy SHA; severity policy documented and wired
5. All new CI gates green for 2 consecutive weeks (no baseline bumps)

---

## EPIC HIERARCHY

```
SMK-400: Codebase Health Remediation Initiative (Q3 2026) [PARENT]
├─ SMK-401: EPIC A — Security Hardening
│  ├─ SMK-411: Guard coach-handoff preview endpoint (S1)
│  ├─ SMK-412: Consolidate service-role clients into audited factory (S3)
│  ├─ SMK-413: Add middleware.ts auth layer for dashboard/settings (S4)
│  ├─ SMK-414: Nonce-based CSP; remove unsafe-inline/unsafe-eval (S2)
│  ├─ SMK-415: Isolate dev-auth proxy from production auth module (S5)
│  ├─ SMK-416: Fix x-forwarded-for trust in rate-limit identity (S6)
│  ├─ SMK-417: Enable GitHub CodeQL SAST
│  ├─ SMK-418: Add gitleaks secret scanning + push protection
│  └─ SMK-419: Monthly OWASP ZAP baseline scan vs staging
│
├─ SMK-402: EPIC B — Technical Debt Reduction
│  ├─ SMK-421: Lint-warning ratchet: forbid increases, auto-lower baseline
│  ├─ SMK-422: Ban new `as any`/`: any` on changed files (diff-based ESLint gate)
│  ├─ SMK-423: Replace placeholder tests in src/lib/ (wave 1: 50 files)
│  ├─ SMK-424: Replace placeholder tests in src/app/api/ (wave 2: 60 files)
│  ├─ SMK-425: Decompose prep-client.tsx and onboarding-form.tsx
│  ├─ SMK-426: Decompose executive-brief-hub, outreach-hub-client, trace-client
│  ├─ SMK-427: Repo hygiene purge (docs - Copy, tmp-run-*, root artifacts)
│  ├─ SMK-428: Extract getDashboardData(userId) from dashboard page
│  ├─ SMK-429: Coverage threshold ratchet (api 18→40, components 2→10)
│  └─ SMK-430: Palette debt waves 2-3 (87 → ≤20 violations)
│
├─ SMK-403: EPIC C — Agent Fleet Buildout
│  ├─ SMK-431: PR Check Failure Pattern Agent — DONE 2026-07-07
│  ├─ SMK-432: Unshipped Code Agent — DONE 2026-07-07
│  ├─ SMK-433: Debt Ratchet Agent (weekly + per-PR no-increase gates)
│  ├─ SMK-434: Security Sentinel Agent (daily + per-PR route-classification diff)
│  ├─ SMK-435: Dependency Update Agent (Renovate, auto-merge patch/minor)
│  ├─ SMK-436: Test Realness Agent (assertion-density scoring)
│  ├─ SMK-437: God-File Decomposition Agent (PR comments + 2,000-line block)
│  ├─ SMK-438: Hygiene Janitor Agent (monthly cleanup PRs)
│  └─ SMK-439: Synthetics gap coverage (outreach send + contact journeys)
│
└─ SMK-404: EPIC D — Observability, SLOs & Release Gates
   ├─ SMK-441: Define SLOs + multi-window burn-rate alerting (upgrade fast-burn)
   ├─ SMK-442: Structured log pipeline (ship JSON logs to queryable store)
   ├─ SMK-443: Sentry tracing on 3 slowest API routes (10% sampling)
   ├─ SMK-444: Sentry release health keyed to deploy_sha
   ├─ SMK-445: Alert severity policy (Sev-1 vs Sev-2) codified + rewired
   ├─ SMK-446: axe-core accessibility gate in Playwright
   └─ SMK-447: Lighthouse CI budgets in required checks + headers grade check
```

---

## SPRINT PLAN (6 × 1 week)

| Sprint | Theme | Tickets | Exit check |
|---|---|---|---|
| 1 (Jul 7-13) | Quick security wins + scanners | SMK-411, 412, 416, 417, 418 | Security deep-dive: 0 true gaps; CodeQL + gitleaks green in CI |
| 2 (Jul 14-20) | Auth layer + CSP + dev-auth isolation | SMK-413, 414, 415, 427 | Middleware live; CSP nonce-based; securityheaders.com grade A |
| 3 (Jul 21-27) | Debt gates + ratchet agents | SMK-421, 422, 433, 435, 429 | No-increase gates required in CI; Renovate opening PRs |
| 4 (Jul 28-Aug 3) | Test realness wave 1 | SMK-423, 436, 439, 428 | Placeholder count ≤ 270; src/lib real coverage ≥ 70% held |
| 5 (Aug 4-10) | God files + security sentinel | SMK-425, 437, 434, 419 | prep-client + onboarding-form each < 700 lines; sentinel alerting |
| 6 (Aug 11-17) | Observability + remaining wave 2 | SMK-441, 442, 443, 444, 445, 446, 447, 424, 426, 430, 438 | SLO burn alerts live; release health wired; palette ≤ 20 |

Sprint 6 is intentionally heavy on config-only tickets (441-447 are wiring, not builds); split into sprint 7 if needed.

---

## TICKETS

### EPIC A — Security Hardening (SMK-401)

**SMK-411: Guard coach-handoff preview endpoint (S1)**
- Priority: Highest | Estimate: 2h
- Do: Add `enforcePublicEndpointGuard` (rate limit ≥ signup tier) + body-size cap to src/app/api/coach-handoff/preview/route.ts; add route test for 429 behavior.
- Success: `npm run security:api-guards:strict` reports 0 true gaps for this route; unit test passes.

**SMK-412: Consolidate service-role clients (S3)**
- Priority: High | Estimate: 4h
- Do: Delete `createOpsClient` in admin/product/catalog page and duplicate `createAdminClient` in src/lib/supabase/server.ts; all callers import from src/lib/supabase/admin.ts (with persistSession:false). Add ESLint restriction or grep-guard forbidding `createSupabaseClient(...SERVICE_ROLE...)` outside lib/supabase/admin.ts.
- Success: Exactly 1 file constructs a service-role client; guard fails CI on new violations.

**SMK-413: middleware.ts auth layer (S4)**
- Priority: High | Estimate: 1d
- Do: Add src/middleware.ts matching /dashboard/:path* and /settings/:path* that redirects unauthenticated sessions to /login (Supabase SSR cookie check). Keep per-page checks (defense in depth).
- Success: Playwright test: cookieless request to 3 protected routes → /login redirect at middleware layer; no regression in smoke suite.

**SMK-414: Nonce-based CSP (S2)**
- Priority: High | Estimate: 2d
- Do: Generate per-request nonce in middleware; move CSP from next.config.ts static headers to middleware response; remove `unsafe-inline`/`unsafe-eval` from script-src (keep for style-src if required by Tailwind). Verify Stripe/PostHog/Turnstile/Sentry still load.
- Success: securityheaders.com grade A; zero CSP violation reports in Sentry after 48h in production; synthetics 10/10 green post-deploy.

**SMK-415: Isolate dev-auth proxy (S5)**
- Priority: Medium | Estimate: 3h
- Do: Move `resolveDevAuthUser` path behind a dedicated module imported only when `process.env.NODE_ENV === 'development'` via dynamic import, or guard with a build-time-stripped flag; remove `as any` casts in that path.
- Success: Production bundle contains no dev-auth code (verify via build output grep); auth unit tests pass.

**SMK-416: Fix XFF trust (S6)**
- Priority: Medium | Estimate: 2h
- Do: In getClientIp helpers, use rightmost untrusted-hop strategy (or Railway-provided real IP header); apply to emi-smoke and any other XFF consumers (grep `x-forwarded-for`).
- Success: Unit test proves spoofed leftmost XFF cannot rotate rate-limit buckets.

**SMK-417: Enable CodeQL**
- Priority: High | Estimate: 2h
- Do: Add .github/workflows/codeql.yml (javascript-typescript, default queries + security-extended), weekly + PR trigger.
- Success: First scan completes; alerts triaged to zero-open-critical; registered in monitoring-watchdog.

**SMK-418: gitleaks + push protection**
- Priority: High | Estimate: 3h
- Do: Add gitleaks CI job (PR + weekly full-history), .gitleaks.toml allowlist for fixtures; enable GitHub push protection in repo settings.
- Success: CI job green; seeded fake-secret test branch is blocked.

**SMK-419: ZAP baseline scan**
- Priority: Low | Estimate: 3h
- Do: Monthly workflow running OWASP ZAP baseline against staging URL; report artifact + Slack summary on new findings.
- Success: First scan produces triaged report; no high-risk findings open >7 days.

### EPIC B — Technical Debt Reduction (SMK-402)

**SMK-421: Lint-warning ratchet**
- Priority: High | Estimate: 3h
- Do: Modify scripts/check-lint-baseline.mjs: fail if current > baseline (no bump path without `LINT_BASELINE_OVERRIDE` env set by labeled PR); auto-rewrite baseline downward when current < baseline.
- Success: PR raising warnings fails CI; PR lowering warnings auto-updates baseline; baseline never increases for 2 weeks.

**SMK-422: Ban new `any` on changed files**
- Priority: High | Estimate: 4h
- Do: Diff-based gate (reuse check-diff-coverage pattern): `@typescript-eslint/no-explicit-any` as error scoped to files changed in the PR. Snapshot current count (229) as ceiling guard.
- Success: PR adding `as any` to a changed file fails; total count trend is monotonically non-increasing.

**SMK-423: Placeholder test replacement — wave 1 (src/lib)**
- Priority: High | Estimate: 1w (batched)
- Do: Replace 50 placeholder test files in src/lib/ with behavior tests (target the rate-limit, auth-path, subscription, activation modules first). Update placeholder baseline downward each merge.
- Success: Placeholder count ≤ 270; src/lib coverage ≥ 70% with real assertions; assertion-density score (SMK-436) improves.

**SMK-424: Placeholder test replacement — wave 2 (src/app/api)**
- Priority: Medium | Estimate: 1w (batched)
- Do: Replace 60 placeholder files covering auth, billing, cron, and outreach routes; raise api coverage threshold to 40 after landing.
- Success: Placeholder count ≤ 200; `coverage:folders:check` passes at new thresholds.

**SMK-425: Decompose prep-client + onboarding-form**
- Priority: High | Estimate: 3d
- Do: Split prep-client.tsx (1,723) and onboarding-form.tsx (1,546) into section/step modules with a thin orchestrator each (< 400 lines). No behavior change; snapshot + e2e must stay green.
- Success: Both orchestrators < 700 lines; luxury/auth-ux/smoke suites green; no new palette violations.

**SMK-426: Decompose remaining god files**
- Priority: Medium | Estimate: 3d
- Do: Same treatment for executive-brief-hub.tsx (1,176), outreach-hub-client.tsx (1,105), trace-client.tsx (1,150).
- Success: Files >800 lines count ≤ 14 (from 20).

**SMK-427: Repo hygiene purge**
- Priority: Medium | Estimate: 3h
- Do: Delete "docs - Copy/", stale tmp-run-* dirs, root-level page1/page2 html, build logs, loose CSVs (confirm each with owner before delete); add .gitignore entries; move keeper docs into docs/.
- Success: Root directory contains only project files; clone size reduced; sentinel/tooling scan time drops.

**SMK-428: Extract getDashboardData**
- Priority: Medium | Estimate: 4h
- Do: Move the 17-way Promise.all from dashboard/page.tsx into src/lib/dashboard-data.ts with unit tests.
- Success: page.tsx < 800 lines; new module ≥ 70% covered; dashboard smoke green.

**SMK-429: Coverage threshold ratchet**
- Priority: Medium | Estimate: 1h (after 423/424)
- Do: config/coverage-thresholds.json: api 18→40 lines, components 2→10, global 15→25.
- Success: `test:coverage` + folder check pass at new levels in CI.

**SMK-430: Palette debt waves 2-3**
- Priority: Medium | Estimate: 1w (batched)
- Do: Follow docs/PALETTE_DEBT_REMAINING.md waves: admin high-traffic screens, core workflow routes, then public/settings.
- Success: Sentinel source run ≤ 20 palette violations; no tier-0 route in violation.

### EPIC C — Agent Fleet Buildout (SMK-403)

**SMK-431: PR Check Failure Pattern Agent — DONE**
- Shipped 2026-07-07: scripts/analyze-pr-check-failure-patterns.mjs + weekly workflow + Slack + watchdog registration.
- Success (ongoing): weekly Slack report posts; patterns actioned within 1 sprint.

**SMK-432: Unshipped Code Agent — DONE**
- Shipped 2026-07-07: scripts/check-unshipped-code.mjs + daily workflow + Slack + watchdog registration. First run found 51 branches ahead of main.
- Success (ongoing): stale-branch count trends to < 10 (triage backlog ticket below).
- Follow-up task: triage the 51 surfaced branches (merge/promote/delete) — fold into SMK-427 sprint.

**SMK-433: Debt Ratchet Agent**
- Priority: High | Estimate: 1d
- Do: scripts/debt-ratchet-check.mjs comparing current metrics (placeholder count, lint warnings, any-count, max-file-size, files>800) against docs/status/debt-ratchet.baseline.json; per-PR job (fail on increase) + weekly trend Slack post; baseline auto-lowers.
- Success: Required check in CI; weekly Slack trend; zero unreviewed baseline increases.

**SMK-434: Security Sentinel Agent**
- Priority: High | Estimate: 1d
- Do: Daily workflow chaining npm audit + security:api-guards:strict + gitleaks + new-route auth-classification diff (compare src/app/api route list vs last snapshot; flag unclassified additions). Slack Sev-2; Sev-1 if unauthenticated data route detected.
- Success: Daily green run; seeded unauth route on test branch triggers alert.

**SMK-435: Dependency Update Agent**
- Priority: Medium | Estimate: 3h
- Do: Add renovate.json — auto-merge patch/minor on CI green, weekly batch for majors with changelog summary, grouped Anthropic/Supabase/Sentry.
- Success: Outdated count < 10 within 2 weeks and stays there.

**SMK-436: Test Realness Agent**
- Priority: Medium | Estimate: 1d
- Do: Extend check-placeholder-test-regressions.mjs with assertion-density scoring (expect() per test file); weekly report ranks worst 10 real-looking-but-thin tests; folds into weekly unified audit.
- Success: Weekly ranked list; density median improves sprint over sprint.

**SMK-437: God-File Decomposition Agent**
- Priority: Medium | Estimate: 4h
- Do: Per-PR job: if PR touches file > 800 lines, comment size + suggested extraction seams; hard-fail if any file would exceed 2,000 lines post-merge.
- Success: Comment appears on qualifying PRs; no file crosses 2,000.

**SMK-438: Hygiene Janitor Agent**
- Priority: Low | Estimate: 4h
- Do: Monthly workflow detecting stale tmp-run-* dirs, untracked root artifacts, orphaned tmp files; opens a cleanup PR (or Slack list if deletion risky).
- Success: Monthly PR/report; root stays clean after SMK-427.

**SMK-439: Synthetics gap coverage**
- Priority: Medium | Estimate: 1d
- Do: Add Synthetic-11 (outreach draft generation journey) and Synthetic-12 (contact create → follow-up reminder) to tests/e2e/synthetics.spec.ts; wire into production-synthetics workflow.
- Success: 12/12 synthetics green in production; failures alert Sev-1 with deploy SHA.

### EPIC D — Observability, SLOs & Release Gates (SMK-404)

**SMK-441: SLOs + burn-rate alerting**
- Priority: High | Estimate: 1d
- Do: Define SLOs in config/slo-definitions.json (availability 99.9%, tier-0 p95 < 1.5s, auth success > 99.5%); upgrade fast-burn-alert.yml to multi-window (1h/6h) error-budget burn logic sourced from synthetics + smoke history.
- Success: Burn alert fires in staged test; no single-failure noise pages.

**SMK-442: Structured log pipeline**
- Priority: Medium | Estimate: 1d
- Do: Ship JSON logs (auth_callback, admin_create_error, etc.) from Railway to Axiom/Betterstack via drain; 30-day retention; saved queries for auth failures and 5xx.
- Success: Query answering "all auth_callback failures last 7d" returns in <10s; documented in runbook.

**SMK-443: Sentry tracing on slow routes**
- Priority: Medium | Estimate: 3h
- Do: Enable tracesSampleRate 0.1 scoped to /api/prep/*, /dashboard/briefing, /api/discover.
- Success: Traces visible in Sentry; p95 spans identify slowest segment per route.

**SMK-444: Release health keyed to deploy SHA**
- Priority: High | Estimate: 3h
- Do: Set Sentry `release` to deploy_sha (already exposed at /api/deploy-marker) in next.config sentry options + worker; enable release health; alert on crash-free-rate regression vs previous release.
- Success: Two consecutive deploys tracked as distinct releases with health deltas; regression alert tested.

**SMK-445: Alert severity policy**
- Priority: Medium | Estimate: 3h
- Do: Document Sev-1 (availability, auth, billing, data integrity) vs Sev-2 (style, lint, debt trend) in docs/sre/alert-severity-policy.md; route Sev-1 to alerting channel, Sev-2 to digest channel; update each workflow's Slack step accordingly.
- Success: Every alerting workflow tagged with severity; zero Sev-2 alerts in the Sev-1 channel for 2 weeks.

**SMK-446: axe-core accessibility gate**
- Priority: Medium | Estimate: 1d
- Do: Add @axe-core/playwright checks to luxury-ux spec for tier-0 routes (/, /login, /signup, /onboarding, /dashboard); fail on serious/critical violations; baseline-and-ratchet the rest.
- Success: Tier-0 routes zero serious/critical; gate required in CI.

**SMK-447: Lighthouse budgets + headers grade in required checks**
- Priority: Low | Estimate: 3h
- Do: Promote perf:lighthouse:ci to required check with budget file; add monthly securityheaders.com grade check (target A) to security-weekly.
- Success: Both in config/required-checks-manifest.json; ci-health-weekly drift check passes.

---

## CSV EXPORT (Jira bulk import)

```csv
Issue Type,Summary,Epic Link,Priority,Labels,Description
Epic,Codebase Health Remediation Initiative (Q3 2026),,Highest,code-health;parent-epic,Parent epic. Source: docs/codebase-health-report.latest.md
Epic,EPIC A - Security Hardening,SMK-400,Highest,security,Fix S1-S6 and add SAST/secret/DAST scanning
Epic,EPIC B - Technical Debt Reduction,SMK-400,High,tech-debt,Ratchets and reductions for tests/lint/any/god-files/hygiene/palette
Epic,EPIC C - Agent Fleet Buildout,SMK-400,High,agents,Build remaining monitoring/gate agents
Epic,EPIC D - Observability SLOs and Release Gates,SMK-400,High,observability,SLO burn alerting log pipeline release health a11y perf gates
Task,Guard coach-handoff preview endpoint (S1),SMK-401,Highest,security,Add public endpoint guard and rate limit
Task,Consolidate service-role clients (S3),SMK-401,High,security,Single audited admin client factory plus CI guard
Task,Add middleware.ts auth layer (S4),SMK-401,High,security,Defense-in-depth auth for /dashboard and /settings
Task,Nonce-based CSP (S2),SMK-401,High,security,Remove unsafe-inline/unsafe-eval from script-src
Task,Isolate dev-auth proxy (S5),SMK-401,Medium,security,Strip dev fake-user path from production bundle
Task,Fix x-forwarded-for trust (S6),SMK-401,Medium,security,Rightmost-hop client IP for rate limiting
Task,Enable GitHub CodeQL,SMK-401,High,security,SAST weekly plus PR trigger
Task,Add gitleaks and push protection,SMK-401,High,security,Secret scanning in CI and GitHub settings
Task,Monthly ZAP baseline scan,SMK-401,Low,security,DAST against staging with Slack summary
Task,Lint-warning ratchet,SMK-402,High,tech-debt,Forbid baseline increases auto-lower on decrease
Task,Ban new any on changed files,SMK-402,High,tech-debt,Diff-scoped no-explicit-any gate
Task,Placeholder test replacement wave 1 src/lib,SMK-402,High,tech-debt,50 real behavior tests
Task,Placeholder test replacement wave 2 src/app/api,SMK-402,Medium,tech-debt,60 real route tests then raise thresholds
Task,Decompose prep-client and onboarding-form,SMK-402,High,tech-debt,Split to section modules under 700 lines
Task,Decompose executive-brief outreach-hub trace-client,SMK-402,Medium,tech-debt,God-file wave 2
Task,Repo hygiene purge,SMK-402,Medium,tech-debt,Remove docs-Copy tmp-run-* root artifacts
Task,Extract getDashboardData,SMK-402,Medium,tech-debt,Move 17-way Promise.all into tested lib module
Task,Coverage threshold ratchet,SMK-402,Medium,tech-debt,api 40 components 10 global 25
Task,Palette debt waves 2-3,SMK-402,Medium,tech-debt,87 to 20 or fewer sentinel violations
Task,PR Check Failure Pattern Agent (DONE),SMK-403,High,agents,Shipped 2026-07-07 weekly Slack pattern report
Task,Unshipped Code Agent (DONE),SMK-403,High,agents,Shipped 2026-07-07 daily drift/PR/branch audit
Task,Debt Ratchet Agent,SMK-403,High,agents,Per-PR no-increase gate plus weekly trend
Task,Security Sentinel Agent,SMK-403,High,agents,Daily chained scans plus route-classification diff
Task,Dependency Update Agent,SMK-403,Medium,agents,Renovate auto-merge patch/minor
Task,Test Realness Agent,SMK-403,Medium,agents,Assertion-density scoring weekly
Task,God-File Decomposition Agent,SMK-403,Medium,agents,PR size comments plus 2000-line block
Task,Hygiene Janitor Agent,SMK-403,Low,agents,Monthly cleanup PRs
Task,Synthetics gap coverage,SMK-403,Medium,agents,Add outreach and contact journey synthetics
Task,SLOs plus burn-rate alerting,SMK-404,High,observability,Multi-window error-budget alerts
Task,Structured log pipeline,SMK-404,Medium,observability,Ship JSON logs to queryable store 30d retention
Task,Sentry tracing on slow routes,SMK-404,Medium,observability,10 percent sampling on 3 routes
Task,Release health keyed to deploy SHA,SMK-404,High,observability,Crash-free-rate regression alerts per release
Task,Alert severity policy,SMK-404,Medium,observability,Sev-1 vs Sev-2 channels documented and rewired
Task,axe-core accessibility gate,SMK-404,Medium,observability,Tier-0 zero serious/critical violations
Task,Lighthouse budgets and headers grade required,SMK-404,Low,observability,Promote to required checks
```

---

## Risks & Dependencies

- SMK-414 (CSP) is the highest-regression-risk ticket: requires production canary + fast rollback (deploy marker verification + synthetics gate already in place).
- SMK-423/424 (test waves) gate SMK-429 (threshold ratchet) — land in order.
- SMK-433 (Debt Ratchet Agent) depends on SMK-421/422 gate scripts existing.
- Branch triage from SMK-432 findings (51 branches) should happen before SMK-427 hygiene purge to avoid deleting recoverable work.
- All new workflows must be registered in monitoring-watchdog.yml (pattern established) and, where gating, in config/required-checks-manifest.json (ci-health-weekly enforces drift).
