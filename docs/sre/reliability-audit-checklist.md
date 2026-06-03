# Reliability Audit Checklist

Last updated: 2026-05-18

This checklist covers all deliverables from the 90-day reliability rollout (R1–R3).
Run this audit:
- At the end of the 90-day rollout
- Before any major infrastructure migration
- After any Sev-1 incident (to confirm safeguards are in place)
- Quarterly, as part of the engineering ops calendar

**How to use:** Check each item. Assign owner and date for any gaps found. Unchecked items are tracked as action items in the next reliability review.

---

## R1: Observability Foundations

### R1.1 — Route-Level Telemetry

- [ ] `src/lib/telemetry.ts` exists and exports `withApiTelemetry(path, handler)`.
- [ ] All P0 routes are wrapped with `withApiTelemetry`:
  - [ ] `/api/auth/*` routes
  - [ ] `/api/feedback/items` (GET and POST)
  - [ ] `/api/contacts/*` routes
  - [ ] `/api/follow-ups/*` routes
  - [ ] `/api/optimize`
  - [ ] `/api/billing/*` routes
  - [ ] `/api/webhooks/stripe`
  - [ ] `/api/intelligence/briefing`
  - [ ] `/api/outreach/*` routes
- [ ] Structured log fields present: `ts`, `event`, `method`, `path`, `tier`, `status`, `latency_ms`, `correlation_id`, `deploy_sha`.
- [ ] Middleware attaches `X-Request-Id` header to all responses.
- [ ] `sentry.server.config.ts` has `tracesSampler` (not flat `tracesSampleRate: 0`).
  - P0 paths sampled at ≥ 10%, P1 at ≥ 2%, others at 0%.

### R1.2 — P0 Dashboard Setup

- [ ] `docs/sre/dashboard-setup.md` exists and is current.
- [ ] Sentry P0 error-rate alert is configured (threshold: 5% over 5 min for P0 routes).
- [ ] Sentry P0 latency alert is configured (threshold: p95 > 2000ms over 5 min).
- [ ] PostHog reliability dashboard exists with weekly auth success rate widget.
- [ ] Railway log stream filtering documented and operational.

### R1.3 — SLO / Error Budget Script

- [ ] `scripts/slo-report.mjs` exists and parses structured `api_request` logs.
- [ ] `npm run slo:report` exits 1 when P0 SLO is violated.
- [ ] `npm run slo:report:json` outputs valid JSON.
- [ ] `.github/workflows/slo-weekly-report.yml` runs every Monday at 09:00 UTC.
- [ ] Weekly SLO report alerts Slack on failures.

### R1.4 — Foundational Alerts

- [ ] `fast-burn-alert.yml` runs every 10,40 min and pages on 3+ consecutive monitoring failures.
- [ ] `dependency-health.yml` runs hourly and monitors Supabase, Stripe, Anthropic status pages.
- [ ] `monitoring-watchdog.yml` tracks freshness of:
  - [ ] monitoring.yml (≤ 90 min)
  - [ ] fast-burn-alert.yml (≤ 90 min)
  - [ ] dependency-health.yml (≤ 90 min)
  - [ ] production-synthetics.yml (≤ 15 min)
- [ ] All alert workflows have `SLACK_WEBHOOK_URL` secret configured in GitHub.

### R1.5 — P0 Runbooks

All runbooks are concrete and actionable (not template placeholders):

- [ ] `docs/sre/runbooks/auth-failure.md` — includes diagnostic SQL, false positive list, rollback steps.
- [ ] `docs/sre/runbooks/feedback-failure.md` — includes schema constraint check, RLS check.
- [ ] `docs/sre/runbooks/billing-webhook-degradation.md` — includes Stripe Dashboard replay steps, subscription drift SQL.
- [ ] `docs/sre/runbooks/follow-up-lifecycle-drift.md` — includes drift SQL, preview-first repair SQL.
- [ ] `docs/sre/runbooks/postmortem-template.md` — template is in place.

### R1.6 — Weekly Reliability Review

- [ ] `docs/sre/weekly-reliability-review.md` exists with full 30-min agenda.
- [ ] Meeting is on the team calendar (recurring, Mondays or first day of sprint).
- [ ] Scorecard template filled in for at least one historical week.
- [ ] Escalation triggers defined and understood by team.

---

## R2: Active Defense

### R2.1 — R2.2: Production Synthetic Checks

- [ ] `tests/e2e/synthetics.spec.ts` exists with all 8 checks:
  - [ ] Synthetic-01: Login page loads + form elements
  - [ ] Synthetic-02: Auth API accepts valid credentials
  - [ ] Synthetic-03: Dashboard loads post-auth
  - [ ] Synthetic-04: Feedback submission (create + cleanup)
  - [ ] Synthetic-05: Optimize endpoint — no 500, no captcha leak
  - [ ] Synthetic-06: Follow-up lifecycle (create → complete → verify)
  - [ ] Synthetic-07: Billing portal — no 500
  - [ ] Synthetic-08: Stripe webhook — invalid sig returns 400/401, not 500
- [ ] `playwright.config.ts` has a `synthetics` project pointing to `synthetics.spec.ts`.
- [ ] All synthetic tests use `test.skip` guard when credentials are absent (CI-safe).

### R2.3 — Wire Synthetics to Alert Routing

- [ ] `production-synthetics.yml` runs every 5 minutes against production.
- [ ] Failures send structured Sev-1 Slack alert with failed test names, deploy SHA, and runbook link.
- [ ] Alert message contains `Sev-1` prefix for fast-burn detection to count.

### R2.4 — Pre-Merge and Pre-Prod Deploy Gates

- [ ] `ci.yml` has `pre-prod-gate` job that checks last 3 production synthetics runs are all passing.
- [ ] `playwright` job runs on all pull requests (not just staging/main pushes).
- [ ] `notify-failure` job has `pre-prod-gate` in its `needs` list.

### R2.5 — Post-Deploy Gates and Rollback Hooks

- [ ] `post-deploy.yml` triggers on `deployment_status` webhook (production success).
- [ ] Post-deploy runs synthetics project within 30 seconds of deploy completion.
- [ ] On 2+ consecutive post-deploy failures, sends rollback-required Slack alert.

### R2.6 — UX Reliability E2E

- [ ] `critical-paths.spec.ts` contains `UX reliability — auth and form edge cases` test group with:
  - [ ] Autofill simulation test: fills login form programmatically, verifies payload contains email.
  - [ ] Session expiry test: unauthenticated context redirects to `/login` without 500.
  - [ ] Double-submit idempotency test: rapid parallel POSTto feedback endpoint — no 500 from either.

### R2.7 — Data Integrity Anomaly Detectors

- [ ] `scripts/check-data-integrity.mjs` exists and runs without crashing.
- [ ] Checks performed:
  - [ ] Closed-contact drift (closed contacts with pending follow_ups)
  - [ ] Duplicate pending follow_ups (same contact_id + action + due_date > 5 in 30 minutes)
  - [ ] Invalid follow_up status values
  - [ ] Subscription drift (active subscriptions with expired period_end)
- [ ] `npm run integrity:check` exits 0 on a clean database.
- [ ] `npm run integrity:check` exits 1 when anomalies are present (verify in game day).
- [ ] `nightly-audit.yml` includes the integrity check step with Slack alert on failure.

---

## R3: Operational Maturity

### R3.1 — On-Call Rotation and Escalation

- [ ] `docs/sre/on-call-rotation.md` exists with:
  - [ ] Rotation schedule table (updated weekly).
  - [ ] Handoff procedure (outgoing + incoming steps).
  - [ ] Step-by-step Sev-1 and Sev-2 escalation paths with timing.
  - [ ] Response message templates.
  - [ ] Runbook index.
- [ ] On-call schedule table is current (next 4 weeks populated).
- [ ] All engineers have Slack mobile notifications enabled for `#prod-alerts`.

### R3.2 — R3.3: Game Day Playbooks

- [ ] `docs/sre/game-day-playbooks.md` exists with:
  - [ ] Scenario 1: Dependency Outage (Supabase, Stripe, Anthropic) — full execution steps.
  - [ ] Scenario 2: Data Integrity Drift — injection SQL, detection steps, repair steps.
  - [ ] Success criteria tables for each scenario.
  - [ ] Calendar with at least 2 game days scheduled.
- [ ] At least one game day has been executed (Lessons Learned Log has at least one entry).

### R3.4 — Blameless Postmortem Governance

- [ ] `docs/sre/runbooks/postmortem-template.md` exists with all required sections.
- [ ] Postmortem SLA is defined (72h for Sev-1, 1 week for Sev-2).
- [ ] Monthly postmortem review is on the engineering calendar.
- [ ] Action item SLA is defined and understood (2 weeks P1/Sev-1, 4 weeks P1/Sev-2).

### R3.5 — Reliability Audit Checklist (This Document)

- [ ] This checklist is current with all R1–R3 deliverables.
- [ ] Checklist is run quarterly and results are recorded below.
- [ ] Open items from prior audits are tracked as GitHub issues.

---

## Audit History

| Date | Auditor | Open Items Found | Notes |
|---|---|---|---|
| 2026-05-18 | Initial (R3.5 creation) | See above — first pass | 90-day rollout complete |

---

## How to File Gap Issues

For each unchecked item found during an audit:
1. Open a GitHub issue titled: `[Reliability Audit] <item description>`
2. Label: `reliability`, `audit-gap`
3. Assign to the on-call rotation lead for triage
4. Include the audit date and checklist section in the issue body
