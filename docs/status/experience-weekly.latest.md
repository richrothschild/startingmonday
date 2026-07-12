# Experience Weekly Issues Report

Generated: 2026-07-12T16:34:21.802Z
Channel: reliability---service
Window: 2026-07-05T16:34:08.492Z to 2026-07-12T16:34:08.491Z

## Issues By Workflow

- Route Inventory Agent: runs=2, issues=0, issueRate=0, stale=false
- Experience Vitals Agent: runs=5, issues=3, issueRate=0.6, stale=false
  Issue: 3 non-success runs in the last 7 days
- Cognitive Load Agent: runs=3, issues=0, issueRate=0, stale=false
- Cognitive Fluency Calibration Dispatch: runs=1, issues=0, issueRate=0, stale=false
- Cognitive Calibration Loop: runs=1, issues=0, issueRate=0, stale=false
- Experience Portfolio Rollup: runs=12, issues=3, issueRate=0.25, stale=false
  Issue: 3 non-success runs in the last 7 days
- Luxury Page Sentinel: runs=116, issues=116, issueRate=1, stale=false
  Issue: 116 non-success runs in the last 7 days
- Dashboard Behavior Baseline Agent: runs=1, issues=1, issueRate=1, stale=false
  Issue: 1 non-success runs in the last 7 days
- Trust Integrity Agent: runs=2, issues=1, issueRate=0.5, stale=false
  Issue: 1 non-success runs in the last 7 days
- Trust Escalation Agent: runs=0, issues=0, issueRate=0, stale=true
  Issue: no completed runs in last 7 days
- Journey Synthetic Agent: runs=0, issues=0, issueRate=0, stale=true
  Issue: no completed runs in last 7 days
- Trust Daily Report: runs=4, issues=2, issueRate=0.5, stale=false
  Issue: 2 non-success runs in the last 7 days
- Trust Weekly Issues Report: runs=1, issues=0, issueRate=0, stale=false
- Trust Monthly Trends Report: runs=1, issues=0, issueRate=0, stale=false
- Experience Seeding Checklist: runs=2, issues=0, issueRate=0, stale=false
- Probe Account Reset: runs=8, issues=2, issueRate=0.25, stale=false
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
- Trust Escalation Agent: Route trust violations to owning teams quickly and escalate P0 findings within the SLA window.
- Journey Synthetic Agent: Monitor tier-1 journey step percentiles and resolve high abandonment-risk steps before conversion impact.
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

