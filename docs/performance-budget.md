# Performance Budget

Owner: Documentation Operations
Status: active
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: yes


Updated: 2026-05-31
Scope: release gating for production readiness.

## Principles

- Budgets are explicit and measurable.
- Release blocking is based on regression thresholds vs baseline, not micro-variance noise.
- Baselines are versioned in config and can be intentionally reset after verified improvements.

## Budget Targets

| Surface | Metric | Target | Source |
| --- | --- | --- | --- |
| Production availability | Critical smoke failures | 0 | docs/performance-audit/production-smoke.latest.json |
| Mobile reliability | Pass rate | 100% | docs/performance-audit/production-mobile.latest.json |
| Mobile reliability | p95 response | <= 2000ms | docs/performance-audit/production-mobile.latest.json |
| Route performance | Per-route response | Existing route thresholds in config/mobile-reliability-thresholds.json | docs/performance-audit/production-mobile.latest.json |
| Local web performance (pre-deploy) | Lighthouse performance category | >= 0.80 | .lighthouserc.json |
| Local web performance (pre-deploy) | LCP | <= 3000ms | .lighthouserc.json |
| Local web performance (pre-deploy) | TBT | <= 250ms | .lighthouserc.json |
| Local web performance (pre-deploy) | CLS | <= 0.10 | .lighthouserc.json |

## Regression-Only Blocking Policy

Policy file: config/performance-regression-policy.json
Baseline file: config/performance-baseline.json

Blocking rules currently configured:

- Mobile p95: block if regression exceeds +20% and +120ms noise buffer over baseline.
- Mobile pass rate: block if drop exceeds 5 percentage points from baseline.
- Route durations: block if regression exceeds +25% and +150ms noise buffer for any tracked route.
- Smoke critical failures: block on any increase over baseline.

## Operating Cadence

- Per release candidate: run the performance gate command sequence.
- Weekly: review baseline relevance and refresh only after verified sustained improvements.
- After significant infra/product changes: run local Lighthouse CI and production gate before release signoff.
