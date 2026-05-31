# Performance Release Scorecard Template

Date (UTC):
Release / Commit:
Environment URL:
Owner:

## Gate Commands

1. npm run audit:performance:pack
2. npm run audit:performance:scorecard

Or run both:

1. npm run audit:performance:gate

## Regression-Only Decision

- Verdict: PASS / FAIL
- Blocking findings count:
- Reason(s):

## Baseline vs Current Summary

| Metric | Baseline | Current | Delta | Blocked? |
| --- | ---: | ---: | ---: | --- |
| Mobile p95 (ms) |  |  |  |  |
| Mobile pass rate (%) |  |  |  |  |
| Smoke critical failures |  |  |  |  |

## Route-Level Regression Check

| Route | Baseline ms | Current ms | Regression limit ms | Status |
| --- | ---: | ---: | ---: | --- |
| / |  |  |  |  |
| /login |  |  |  |  |
| /pricing |  |  |  |  |
| /annual-report-2026 |  |  |  |  |
| /for-coaches |  |  |  |  |

## Evidence Artifacts

- docs/performance-audit/production-smoke.latest.json
- docs/performance-audit/production-mobile.latest.json
- docs/performance-release-scorecard.latest.md
- docs/performance-release-scorecard.latest.json

## Notes

- This scorecard should block only on configured regression thresholds.
- Variance inside configured noise buffers is informational and does not block release.
