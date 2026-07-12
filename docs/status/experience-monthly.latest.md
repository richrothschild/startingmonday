# Experience Monthly Trends Report

Generated: 2026-07-12T20:54:53.067Z
Channel: reliability---service
Current window: 2026-06-12T20:54:38.887Z to 2026-07-12T20:54:38.887Z
Previous window: 2026-05-13T20:54:38.887Z to 2026-06-12T20:54:38.887Z

## Workflow Trends

- Route Inventory Agent: trend=flat, currentIssueRate=0, previousIssueRate=0, currentRuns=2, previousRuns=0
  Action: Trend is stable. Keep cadence, tighten thresholds incrementally, and monitor for drift.
- Experience Vitals Agent: trend=worse, currentIssueRate=0.5, previousIssueRate=0, currentRuns=6, previousRuns=0
  Action: Issue rate worsened by 50.0 points. Address route-tier vitals budget breaches and adjust baseline drift with explicit approvals.
- Cognitive Load Agent: trend=flat, currentIssueRate=0, previousIssueRate=0, currentRuns=3, previousRuns=0
  Action: Trend is stable. Keep cadence, tighten thresholds incrementally, and monitor for drift.
- Cognitive Fluency Calibration Dispatch: trend=flat, currentIssueRate=0, previousIssueRate=0, currentRuns=1, previousRuns=0
  Action: Trend is stable. Keep cadence, tighten thresholds incrementally, and monitor for drift.
- Cognitive Calibration Loop: trend=flat, currentIssueRate=0, previousIssueRate=0, currentRuns=1, previousRuns=0
  Action: Trend is stable. Keep cadence, tighten thresholds incrementally, and monitor for drift.
- Experience Portfolio Rollup: trend=worse, currentIssueRate=0.25, previousIssueRate=0, currentRuns=12, previousRuns=0
  Action: Issue rate worsened by 25.0 points. Use the portfolio rollup as the single triage board for cross-agent issues and route the suggested mitigation to an owner immediately.
- Luxury Page Sentinel: trend=worse, currentIssueRate=1, previousIssueRate=0, currentRuns=121, previousRuns=0
  Action: Issue rate worsened by 100.0 points. Triage blocking incidents by dimension and burn down quarantine debt before expiry.
- Dashboard Behavior Baseline Agent: trend=worse, currentIssueRate=1, previousIssueRate=0, currentRuns=1, previousRuns=0
  Action: Issue rate worsened by 100.0 points. Validate dashboard contracts and probe credentials, then address route-specific regressions.
- Trust Integrity Agent: trend=worse, currentIssueRate=0.5, previousIssueRate=0, currentRuns=2, previousRuns=0
  Action: Issue rate worsened by 50.0 points. Resolve parity/title/landmark contract failures before certifying dashboard trust posture.
- Trust Escalation Agent: trend=flat, currentIssueRate=0, previousIssueRate=0, currentRuns=2, previousRuns=0
  Action: Trend is stable. Keep cadence, tighten thresholds incrementally, and monitor for drift.
- Journey Synthetic Agent: trend=flat, currentIssueRate=0, previousIssueRate=0, currentRuns=5, previousRuns=0
  Action: Trend is stable. Keep cadence, tighten thresholds incrementally, and monitor for drift.
- Trust Daily Report: trend=worse, currentIssueRate=0.5, previousIssueRate=0, currentRuns=4, previousRuns=0
  Action: Issue rate worsened by 50.0 points. Use daily trust telemetry to surface contract drift quickly and keep remediation ownership explicit.
- Trust Weekly Issues Report: trend=flat, currentIssueRate=0, previousIssueRate=0, currentRuns=1, previousRuns=0
  Action: Trend is stable. Keep cadence, tighten thresholds incrementally, and monitor for drift.
- Trust Monthly Trends Report: trend=flat, currentIssueRate=0, previousIssueRate=0, currentRuns=1, previousRuns=0
  Action: Trend is stable. Keep cadence, tighten thresholds incrementally, and monitor for drift.
- Experience Seeding Checklist: trend=flat, currentIssueRate=0, previousIssueRate=0, currentRuns=2, previousRuns=0
  Action: Trend is stable. Keep cadence, tighten thresholds incrementally, and monitor for drift.
- Probe Account Reset: trend=worse, currentIssueRate=0.222, previousIssueRate=0, currentRuns=9, previousRuns=0
  Action: Issue rate worsened by 22.2 points. Reset synthetic probe account capacity before route coverage degrades from limit-triggered skips.

## Portfolio Trend Summary

- Improving workflows: 0
- Flat workflows: 9
- Worsening workflows: 7
- Route-cluster signature opened delta: 0
- Route-cluster signature resolved delta: 0
- Latest route cluster count: 0
- Source staleness directionality: unavailable (insufficient history).
- Top owner exposure: n/a (0)

## Core Web Vitals (CWV) Breaches

- Total breaches: 1

### By Tier
- funnel: 8 route(s) with breaches
- public: 10 route(s) with breaches
- dashboard: 8 route(s) with breaches
- admin: 4 route(s) with breaches

### By Metric
- cls: 1 breaches

## Source Staleness Owner Changes

- No source-staleness owner change data available.

## Owner Leaderboard

- No owner exposure data available yet.

## Baseline Lifecycle Review

- Captured at: 2026-07-11T00:00:00.000Z
- Review by: 2026-10-09T00:00:00.000Z
- Baseline age: 1 day(s)
- Max baseline age: 90 day(s)
- Ratchet only: true
- Requires PR: true
- Status: healthy
- Recommendation: Baseline lifecycle healthy: continue ratchet-only threshold reviews on monthly cadence.

