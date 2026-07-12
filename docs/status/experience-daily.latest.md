# Experience Daily Report

Generated: 2026-07-12T20:54:23.422Z
Channel: reliability---service

## Workflow Health

- Route Inventory Agent: status=healthy, conclusion=success, age=415m, threshold=1800m
- Experience Vitals Agent: status=healthy, conclusion=success, age=156m, threshold=480m
- Cognitive Load Agent: status=healthy, conclusion=success, age=1671m, threshold=11520m
- Cognitive Fluency Calibration Dispatch: status=healthy, conclusion=success, age=1666m, threshold=57600m
- Cognitive Calibration Loop: status=healthy, conclusion=success, age=1594m, threshold=158400m
- Experience Portfolio Rollup: status=failed, conclusion=failure, age=407m, threshold=1800m
- Luxury Page Sentinel: status=failed, conclusion=failure, age=9m, threshold=120m
- Dashboard Behavior Baseline Agent: status=failed, conclusion=failure, age=420m, threshold=1800m
- Trust Integrity Agent: status=failed, conclusion=failure, age=411m, threshold=1800m
- Trust Escalation Agent: status=healthy, conclusion=success, age=105m, threshold=120m
- Journey Synthetic Agent: status=healthy, conclusion=success, age=25m, threshold=180m
- Trust Daily Report: status=failed, conclusion=failure, age=403m, threshold=1800m
- Trust Weekly Issues Report: status=healthy, conclusion=success, age=1721m, threshold=11520m
- Trust Monthly Trends Report: status=healthy, conclusion=success, age=1721m, threshold=57600m
- Experience Seeding Checklist: status=healthy, conclusion=success, age=1415m, threshold=14400m
- Probe Account Reset: status=healthy, conclusion=success, age=133m, threshold=1440m

## Dedupe-Capped Findings (Top 10)

- No open deduped portfolio signatures.

## Core Web Vitals (CWV) Status

- Total breaches: 1
  - funnel: 0 breach(es)
  - public: 1 breach(es)
  - dashboard: 0 breach(es)
  - admin: 0 breach(es)

## Devil's Advocate Risks

- [elevated] Route compliance claims drift from full-site reality when inventory cadence slips.
  Mitigation: Route Inventory Agent runs daily and is freshness-monitored by watchdog.
- [elevated] High-volume style/availability findings become noise and true regressions are missed.
  Mitigation: Incident correlation and quarantine/debt ratchet keep findings actionable.
- [elevated] Experience regressions ship after green CI if live-route checks are stale.
  Mitigation: Sentinel and dashboard baseline cadence with explicit freshness thresholds.

## Missing Guardrails

- Cross-route trust integrity trend history with 7-day and 30-day drift deltas on parity/title/landmark contracts.
- Deterministic cognitive fluency/load score persisted per route tier with grade-band trending.
- Experience baseline review bot that proposes ratcheted stricter thresholds after 30 stable days.
- Field-vs-lab experience delta tracker for route-level LCP/INP confidence checks.

