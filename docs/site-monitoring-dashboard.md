# Site Monitoring Dashboard

This is the single operating view for user-perspective reliability. It is intentionally simple and links directly to the systems that hold source-of-truth status.

## Reliability Status Board

| Signal | Source | SLA | Current Owner | Where To Check |
| --- | --- | --- | --- | --- |
| Public journey health | Playwright synthetic checks | Every deploy and scheduled monitoring | Engineering | GitHub Actions: `CI` and `Production Monitoring` |
| Uptime baseline | `/api/health` + UptimeRobot | 24x7 polling | Engineering | UptimeRobot monitor and `monitoring.yml` artifacts |
| Client/server exceptions | Sentry | Near real-time | Engineering | Sentry Issues and Alerts |
| Monitoring pipeline freshness | Monitoring Watchdog workflow | Hourly | Engineering | GitHub Actions: `Monitoring Watchdog` |
| Synthetic artifacts (screenshots/video/trace) | Playwright reporter | On failure | Engineering | `playwright-report` artifact in CI run |
| Last smoke summary JSON | Monitoring workflow artifact | Every 30 minutes | Engineering | `monitoring-summary` artifact in `Production Monitoring` run |

## Alert Policy

| Condition | Severity | Alert Channel | Response Target |
| --- | --- | --- | --- |
| Page-level failure on production smoke check | High | Slack immediate | 15 minutes |
| Repeated failures on the same route in consecutive monitoring runs | High | Slack immediate | 15 minutes |
| Single transient failure that self-recovers next run | Medium | Logged and reviewed daily | Same day |
| Watchdog stale or failed checks | High | Slack immediate | 30 minutes |

## Daily Operating Loop

1. Open GitHub Actions and review latest `Production Monitoring` and `Monitoring Watchdog` runs.
2. Check the newest `monitoring-summary` artifact for failed route or endpoint details.
3. If any failure occurred, open the failing run's artifacts (`playwright-report`, screenshots, traces/videos).
4. Confirm whether issue is route rendering, API response regression, or browser runtime failure.
5. Resolve, redeploy, and verify one clean follow-up run before incident closure.

## Weekly Reliability Review

1. Count total production smoke failures and group by route/root cause.
2. Confirm CI E2E failures are release-blocking and not bypassed.
3. Verify watchdog freshness limits were met for all scheduled workflows.
4. Review top recurring console/page errors from synthetic runs and Sentry.
5. Update [docs/site-monitoring-runbook.md](site-monitoring-runbook.md) if any new failure class appears.

## Dashboard Success Criteria

- On-call can identify failing journey, endpoint, and failure time in under 5 minutes.
- A non-engineer can answer "is the site healthy?" by checking this dashboard and linked workflows.
- Every alert has a direct link to logs/artifacts needed to start remediation.
