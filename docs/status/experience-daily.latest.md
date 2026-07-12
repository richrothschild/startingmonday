# Experience Daily Report

Generated: 2026-07-12T16:40:07.919Z
Channel: reliability---service

## Workflow Health

- Route Inventory Agent: status=healthy, conclusion=success, age=160m, threshold=1800m
- Experience Vitals Agent: status=failed, conclusion=failure, age=263m, threshold=480m
- Cognitive Load Agent: status=healthy, conclusion=success, age=1416m, threshold=11520m
- Cognitive Fluency Calibration Dispatch: status=healthy, conclusion=success, age=1412m, threshold=57600m
- Cognitive Calibration Loop: status=healthy, conclusion=success, age=1340m, threshold=158400m
- Experience Portfolio Rollup: status=failed, conclusion=failure, age=152m, threshold=1800m
- Luxury Page Sentinel: status=failed, conclusion=failure, age=53m, threshold=120m
- Dashboard Behavior Baseline Agent: status=failed, conclusion=failure, age=166m, threshold=1800m
- Trust Integrity Agent: status=failed, conclusion=failure, age=157m, threshold=1800m
- Trust Escalation Agent: status=missing, conclusion=n/a, age=n/a, threshold=n/a
- Journey Synthetic Agent: status=healthy, conclusion=success, age=7m, threshold=180m
- Trust Daily Report: status=failed, conclusion=failure, age=149m, threshold=1800m
- Trust Weekly Issues Report: status=healthy, conclusion=success, age=1467m, threshold=11520m
- Trust Monthly Trends Report: status=healthy, conclusion=success, age=1466m, threshold=57600m
- Experience Seeding Checklist: status=healthy, conclusion=success, age=1161m, threshold=14400m
- Probe Account Reset: status=healthy, conclusion=success, age=238m, threshold=1440m

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

