# Performance Release Scorecard

Generated: 2026-05-31T12:53:20.358Z
Base URL: https://startingmonday.app
Verdict: PASS

## Blocking Policy (Regression-Only)

- Mobile p95 regression threshold: +20% with 120ms noise buffer
- Mobile pass-rate max drop: 5 percentage points
- Route duration regression threshold: +25% with 150ms noise buffer
- Smoke critical failures allowed increase: 0

## Baseline vs Current

| Metric | Baseline | Current |
| --- | ---: | ---: |
| Mobile p95 (ms) | 286 | 291 |
| Mobile pass rate | 100.0% | 100.0% |
| Smoke critical failed | 0 | 0 |

## Route Regression Checks

| Route | Baseline ms | Current ms | Regression limit ms | Status |
| --- | ---: | ---: | ---: | --- |
| / | 286 | 291 | 507.5 | OK |
| /login | 137 | 147 | 321.3 | OK |
| /pricing | 66 | 64 | 232.5 | OK |
| /annual-report-2026 | 64 | 65 | 230 | OK |
| /for-coaches | 66 | 165 | 232.5 | OK |

## Blocking Findings

- None

## Notes

- This gate blocks only on configured regression thresholds against baseline.
- Small variance under configured buffers is treated as noise and does not block release.
