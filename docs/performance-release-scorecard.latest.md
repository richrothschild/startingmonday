# Performance Release Scorecard

Generated: 2026-06-08T13:56:35.324Z
Base URL: http://127.0.0.1:3000
Verdict: PASS

## Blocking Policy (Regression-Only)

- Mobile p95 regression threshold: +20% with 150ms noise buffer
- Mobile pass-rate max drop: 5 percentage points
- Route duration regression threshold: +25% with 150ms noise buffer
- Smoke critical failures allowed increase: 0

## Baseline vs Current

| Metric | Baseline | Current |
| --- | ---: | ---: |
| Mobile p95 (ms) | 286 | 55 |
| Mobile pass rate | 100.0% | 100.0% |
| Smoke critical failed | 0 | 0 |

## Route Regression Checks

| Route | Baseline ms | Current ms | Regression limit ms | Status |
| --- | ---: | ---: | ---: | --- |
| / | 286 | 55 | 507.5 | OK |
| /login | 137 | 10 | 321.3 | OK |
| /pricing | 66 | 11 | 232.5 | OK |
| /annual-report-2026 | 64 | 14 | 230 | OK |
| /for-coaches | 66 | 25 | 232.5 | OK |

## Blocking Findings

- None

## Notes

- This gate blocks only on configured regression thresholds against baseline.
- Small variance under configured buffers is treated as noise and does not block release.
