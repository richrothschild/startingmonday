# Reliability Weekly Issues Report

Generated: 2026-07-11T14:34:24.777Z
Channel: reliability---service
Window: 2026-07-04T14:34:02.145Z to 2026-07-11T14:34:02.144Z

## Issues By Workflow

- Production Synthetics: runs=214, issues=2, issueRate=0.009, stale=false
  Issue: 2 non-success runs in the last 7 days
- Dashboard Behavior Baseline Agent: runs=0, issues=0, issueRate=0, stale=true
  Issue: no completed runs in last 7 days
- Production Monitoring: runs=186, issues=0, issueRate=0, stale=false
- Monitoring Watchdog: runs=134, issues=36, issueRate=0.269, stale=false
  Issue: 36 non-success runs in the last 7 days
- Deployment Watchdog: runs=252, issues=1, issueRate=0.004, stale=false
  Issue: 1 non-success runs in the last 7 days

## Recommended Actions

- Production Synthetics: Triage failing synthetic checks, quarantine flaky probes, and verify production auth/session health.
- Dashboard Behavior Baseline Agent: Dispatch the baseline agent and validate dashboard route contracts and credentials.
- Monitoring Watchdog: Resolve watchdog freshness failures quickly to prevent silent monitoring outages.
- Deployment Watchdog: Inspect deployment gate failures and verify branch-to-environment promotion health.

