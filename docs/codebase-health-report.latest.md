# Codebase Health Report

Generated: 2026-07-06
Rerun with: `npm run audit:debt-deep-dive && npm run audit:security-deep-dive` plus targeted scans, then compare against this snapshot.
Companion machine data: docs/technical-debt-audit.latest.json, docs/security-deep-dive-audit.latest.json
Remediation plan & WBS: docs/codebase-health-remediation-plan.md (SMK-400 initiative)

## 1. Overall Posture

Verified strengths:
- 0 npm vulnerabilities (critical/high/moderate/low all zero)
- No eval/new Function, no dangerouslySetInnerHTML, no hardcoded secrets detected
- Strong CSP + security headers in next.config.ts (X-Frame-Options DENY, HSTS, nosniff, CSP with Sentry report-uri)
- Open-redirect protection on auth flows (getSafeNextPath blocks `//` and non-relative paths in src/app/auth/callback/route.ts)
- Rate limiting via check_and_increment_rate_limit RPC; timing-safe token comparison in internal automation routes
- Typecheck: pass. Lint: pass. 44 workflows with watchdog-of-watchdogs meta-monitoring

## 2. Security Issues (prioritized)

| ID | Issue | Location | Fix |
|---|---|---|---|
| S1 | Unauthenticated POST, no rate limit or body cap | src/app/api/coach-handoff/preview/route.ts | Add enforcePublicEndpointGuard or require session |
| S2 | CSP allows unsafe-inline + unsafe-eval in script-src | next.config.ts | Move to nonce-based CSP via middleware |
| S3 | Ad-hoc service-role clients outside audited factory | src/app/(dashboard)/dashboard/admin/product/catalog/page.tsx (createOpsClient); duplicate createAdminClient in src/lib/supabase/server.ts missing persistSession:false | Consolidate to src/lib/supabase/admin.ts |
| S4 | No middleware.ts — auth gating is per-page only | (missing) | Add middleware matching /dashboard/:path* and /settings/:path* |
| S5 | Dev-auth fake-user proxy lives in production auth module | src/lib/supabase/server.ts (resolveDevAuthUser) | Move behind build-time flag / separate module |
| S6 | x-forwarded-for first-hop trusted for rate-limit identity | src/app/api/internal/automation/emi-smoke/route.ts getClientIp | Use rightmost trusted proxy hop |

## 3. Technical Debt (measured 2026-07-06)

| Debt class | Measured | Notes |
|---|---|---|
| Placeholder tests | 310 files (baseline 334) | Largest debt item; inflate coverage without testing behavior |
| Lint warning baseline | 556 accepted (ratcheted UP from 540) | Ratchet moving wrong direction |
| `: any` / `as any` | 229 occurrences in src | Includes `as any` in auth module proxy |
| TODO/FIXME/HACK | 1,198 hits in src + worker | Untriaged intent debt |
| God files (>780 lines) | 20; worst: prep-client.tsx 1,723, onboarding-form.tsx 1,546 | High blast radius per change |
| Coverage thresholds | Global 15% lines; components 2% | Gates too low to catch regressions |
| Outdated deps | 23 (Anthropic SDK 19 minors behind; ESLint major behind) | Nothing vulnerable |
| Repo hygiene | "docs - Copy/" (25 files), 10 stale tmp-run-* dirs, 157 tmp files, loose root artifacts | Slows scans, bloats clones |
| Palette debt | 87 violations | Tracked in docs/PALETTE_DEBT_REMAINING.md |
| package.json scripts | ~280 | Discoverability debt |

## 4. Effectiveness Improvements

1. Decompose 5 largest client components (prep-client, onboarding-form, executive-brief-hub, outreach-hub-client, trace-client)
2. Replace placeholder tests in src/lib/ first (70% threshold folder); ratchet src/app/api/ 18% -> 40%
3. Lint-warning ratchet policy: forbid baseline increases in PRs; allow decreases to auto-rewrite
4. Ban new `as any` on changed files via ESLint diff gate
5. Extract dashboard 17-way Promise.all into getDashboardData(userId) lib module

## 5. Agent Roster (recommended)

| Agent | Role | Cadence | Alert | Status |
|---|---|---|---|---|
| Debt Ratchet Agent | Fail PR/alert when placeholder count, any-count, lint warnings, or max file size increase | Per-PR + weekly | Slack #eng-debt | Proposed |
| Security Sentinel Agent | npm audit + API-guard scan + secret scan + new-route auth-classification diff | Per-PR + daily | Slack Sev-1/Sev-2 | Proposed |
| Dependency Update Agent | Renovate/Dependabot auto-merge patch/minor when CI green | Continuous | PR queue | Proposed |
| Test Realness Agent | Detect assertion-free tests, score assertion density, propose real tests | Weekly | Weekly unified audit | Proposed |
| God-File Decomposition Agent | Comment extraction plan on >800-line file PRs; block >2,000 lines | Per-PR | PR comment | Proposed |
| Hygiene Janitor Agent | Cleanup PRs for stale artifacts | Monthly | PR | Proposed |
| SLO Burn Agent | Multi-window burn-rate alerts (1h/6h) on availability + p95 | 5 min | Sev-1 page | Proposed (upgrade fast-burn-alert) |
| PR Check Failure Pattern Agent | Analyze PR check failures over time, detect patterns, Slack report | Weekly | Slack | Implemented 2026-07-07 (.github/workflows/pr-check-failure-patterns.yml) |
| Unshipped Code Agent | Surface code not yet in production (branch drift, stale PRs, unpushed work) | Daily | Slack | Implemented 2026-07-07 (.github/workflows/unshipped-code-audit.yml) |
| Synthetic Transactions | Exercise major user journeys against production, alert on failure | 5 min | Slack Sev-1 | Already live (.github/workflows/production-synthetics.yml, Synthetic-01..10 + onboarding-live) |

## 6. Rubrics

Security rubric (per PR / weekly, 0-2 each, target >= 12/14):
1. All new routes classified (public-guarded / session / staff / cron-secret / internal-token)
2. No new service-role client outside lib/supabase/admin
3. No secrets in diff
4. Input validated at boundary for new endpoints
5. Rate limit present on unauthenticated writes
6. npm audit clean
7. CSP/headers unchanged or hardened

Debt rubric (weekly snapshot; direction matters most):
1. Placeholder test count DOWN (from 310)
2. Lint warnings DOWN (from 556)
3. any-count DOWN (from 229)
4. Files >800 lines DOWN (from 20)
5. Outdated deps <10
6. TODOs triaged (issue-linked or deleted)

Effectiveness rubric (release gate):
1. Diff coverage >= 90%
2. p95 route latency within performance-baseline.json budgets
3. Zero new Sentry error types 24h post-deploy
4. Synthetics 10/10 green including onboarding-live probe

## 7. Industry-Standard Checks To Add

- SAST: GitHub CodeQL (highest-value single add)
- Secret scanning: gitleaks in CI + GitHub push protection
- SCA: OSV-Scanner / Dependabot alerts for transitive coverage
- DAST-lite: OWASP ZAP baseline scan monthly vs staging
- Security headers grade check (target A; current gap: CSP unsafe-*)
- Accessibility: axe-core in Playwright as release gate
- Lighthouse CI budgets in required checks

## 8. Observability & Alerting Gaps

1. Define SLOs (99.9% availability, p95 <1.5s tier-0, auth success >99.5%) and alert on error-budget burn rate
2. Ship structured JSON logs to a queryable store (30-day forensics)
3. Sentry performance tracing on 3 slowest API routes at 10% sampling
4. Sentry release health keyed to deploy_sha from /api/deploy-marker; alert on pre/post-deploy error regression
5. Codify Sev-1 (availability, auth, billing) vs Sev-2 (palette, lint drift) alert policy

## 9. Execution Order

1. Week 1: S1 guard, S3 admin-client consolidation, CodeQL + gitleaks
2. Week 2: middleware.ts (S2 nonce groundwork + S4), XFF fix (S6)
3. Week 3-4: Debt Ratchet Agent + no-increase gates; Renovate
4. Ongoing: god-file wave 1, placeholder-test replacement in src/lib/, SLO burn alerts
