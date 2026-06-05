# Launch Capacity And Load Rehearsal

## Purpose
Define launch-week load budgets and the minimum rehearsal required before shipping production changes.

## Budgets
- API liveness: `/api/health` p95 <= 1200 ms
- API readiness: `/api/readiness` p95 <= 1800 ms
- Login route: `/login` p95 <= 3000 ms
- Homepage route: `/` p95 <= 3000 ms
- Overall failure rate: <= 2%

## Rehearsal Command
Run from the app root against production or staging:

```bash
npm run launch:load:rehearsal -- --base-url https://startingmonday.app --duration-sec 180 --concurrency 12
```

## Exit Criteria
- Command exits 0
- `failure_rate <= 0.02`
- `p95_ms <= 3000`
- No endpoint-specific fail rate above 2%

## If Rehearsal Fails
1. Freeze deploys to production.
2. Capture output in the launch incident channel.
3. Verify readiness endpoint and database reachability.
4. Scale app and worker resources before rerunning.
5. Re-run rehearsal until exit criteria are met.
