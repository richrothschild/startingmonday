# Experience Weekly Issues Report

Generated: 2026-07-12T20:54:38.398Z
Channel: reliability---service
Window: 2026-07-05T20:54:24.096Z to 2026-07-12T20:54:24.095Z

## Issues By Workflow

- Route Inventory Agent: runs=2, issues=0, issueRate=0, stale=false
- Experience Vitals Agent: runs=6, issues=3, issueRate=0.5, stale=false
  Issue: 3 non-success runs in the last 7 days
- Cognitive Load Agent: runs=3, issues=0, issueRate=0, stale=false
- Cognitive Fluency Calibration Dispatch: runs=1, issues=0, issueRate=0, stale=false
- Cognitive Calibration Loop: runs=1, issues=0, issueRate=0, stale=false
- Experience Portfolio Rollup: runs=12, issues=3, issueRate=0.25, stale=false
  Issue: 3 non-success runs in the last 7 days
- Luxury Page Sentinel: runs=121, issues=121, issueRate=1, stale=false
  Issue: 121 non-success runs in the last 7 days
- Dashboard Behavior Baseline Agent: runs=1, issues=1, issueRate=1, stale=false
  Issue: 1 non-success runs in the last 7 days
- Trust Integrity Agent: runs=2, issues=1, issueRate=0.5, stale=false
  Issue: 1 non-success runs in the last 7 days
- Trust Escalation Agent: runs=2, issues=0, issueRate=0, stale=false
- Journey Synthetic Agent: runs=5, issues=0, issueRate=0, stale=false
- Trust Daily Report: runs=4, issues=2, issueRate=0.5, stale=false
  Issue: 2 non-success runs in the last 7 days
- Trust Weekly Issues Report: runs=1, issues=0, issueRate=0, stale=false
- Trust Monthly Trends Report: runs=1, issues=0, issueRate=0, stale=false
- Experience Seeding Checklist: runs=2, issues=0, issueRate=0, stale=false
- Probe Account Reset: runs=9, issues=2, issueRate=0.222, stale=false
  Issue: 2 non-success runs in the last 7 days

## Portfolio Signature Delta

- Signature delta unavailable (insufficient portfolio history).

## Owner Leaderboard

- No owner exposure data available yet.

## Source Staleness Ownership Highlights

- No source-staleness signatures currently open.

## Recommended Actions

- Experience Vitals Agent: Address route-tier vitals budget breaches and adjust baseline drift with explicit approvals.
- Experience Portfolio Rollup: Use the portfolio rollup as the single triage board for cross-agent issues and route the suggested mitigation to an owner immediately.
- Luxury Page Sentinel: Triage blocking incidents by dimension and burn down quarantine debt before expiry.
- Dashboard Behavior Baseline Agent: Validate dashboard contracts and probe credentials, then address route-specific regressions.
- Trust Integrity Agent: Resolve parity/title/landmark contract failures before certifying dashboard trust posture.
- Trust Daily Report: Use daily trust telemetry to surface contract drift quickly and keep remediation ownership explicit.
- Probe Account Reset: Reset synthetic probe account capacity before route coverage degrades from limit-triggered skips.

## Seeding Checklist

- Generated: 2026-07-12T15:56:47.493Z
- Ref: staging (dryRun=true)
- Dispatches: 0/10
- Failures: 0

## Probe Reset

- Probe reset artifact unavailable.

## Core Web Vitals (CWV) Alerts

- Total CWV breaches: 1

### Routes with Breaches (Top 10)
- /prep/relationships (public): cls 1.176 > 0.08

