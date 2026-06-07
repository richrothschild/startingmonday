# Mobile Reliability Plan

Owner: Documentation Operations
Status: active
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: yes


Updated: 2026-05-28

## Concrete implementation sequence

1. Define contract and hard bans.
2. Enforce contract in CI.
3. Add visual regression snapshots for top mobile routes.
4. Add Lighthouse mobile budgets as CI-required checks.
5. Add production threshold checks and automated alerts.
6. Publish a generated mobile reliability dashboard every monitoring run.

## Required checks to mark as protected in GitHub branch settings

1. Predeploy gates (lint, typecheck, build, smoke)
2. Playwright E2E
3. Mobile UX contract and banned patterns
4. Mobile visual regression
5. Lighthouse mobile budgets

## Top-route visual coverage

- /
- /pricing
- /about
- /for-coaches
- /annual-report-2026

## Production thresholds

Configured in config/mobile-reliability-thresholds.json.

Monitored dimensions:

1. Route availability (HTTP status)
2. Per-route response latency threshold
3. Aggregate pass rate
4. Aggregate p95 response threshold

## Dashboard and alerting output

- Dashboard markdown artifact: playwright-report/mobile-reliability-dashboard.latest.md
- JSON artifact: playwright-report/mobile-reliability-thresholds.latest.json
- Workflow summary includes route-by-route status and aggregate health.
- Workflow fails and alerts when thresholds are breached.

## Weekly operating cadence

1. Review dashboard trendline and threshold breaches.
2. Review visual diff failures by route.
3. Review Lighthouse budget drift.
4. Convert recurring regressions into new contract checks.
