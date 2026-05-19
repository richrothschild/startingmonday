# P0 Reliability Dashboard Setup (R1.2)

Last updated: 2026-05-18

## Objective

Give on-call engineers one-click visibility into all P0 journeys.
Dashboards live in two tools already in the stack: **Sentry Performance** and **PostHog**.

---

## Part 1: Sentry Performance Dashboards

Sentry traces are now enabled (10% P0, 2% P1) via `tracesSampler` in `sentry.server.config.ts`.

### 1.1 Create a "P0 Routes" Dashboard in Sentry

1. Open Sentry > Performance > Dashboards > New Dashboard
2. Name: **Starting Monday — P0 Reliability**
3. Add the following widgets (all use "Transaction" data type unless noted):

#### Widget: P0 Error Rate by Route
- Visualization: Line chart
- Query: `transaction:/api/auth/* OR transaction:/api/feedback/* OR transaction:/api/optimize OR transaction:/api/billing/* OR transaction:/api/briefing OR transaction:/api/outreach/*`
- Y-axis: `failure_rate()`
- Group by: `transaction`
- Title: P0 Error Rate by Route

#### Widget: P0 p95 Latency
- Visualization: Line chart
- Y-axis: `p95(transaction.duration)`
- Query: same P0 transaction filter as above
- Group by: `transaction`
- Title: P0 p95 Latency (ms)

#### Widget: P0 Throughput (requests/min)
- Visualization: Line chart
- Y-axis: `epm()`
- Query: same P0 filter
- Group by: `transaction`
- Title: P0 Requests per Minute

#### Widget: Error Count by Route (Table)
- Visualization: Table
- Columns: `transaction`, `count()`, `failure_rate()`, `p95(transaction.duration)`
- Query: same P0 filter
- Sort: failure_rate() descending
- Title: P0 Route Error Summary

### 1.2 Sentry SLO Alert Rules (Error Rate Thresholds)

Navigate to Sentry > Alerts > Create Alert > Transaction Metrics.

#### Alert: P0 Fast-Burn Error Rate
- Name: P0 Fast-Burn — Auth/Feedback/Optimize
- Environment: production
- Query: `transaction:/api/auth/* OR transaction:/api/feedback/* OR transaction:/api/optimize`
- Metric: `failure_rate()`
- Threshold: CRITICAL when > 0.5% over 5 minutes; WARNING when > 0.1% over 10 minutes
- Notify: `#sre-alerts` Slack channel + on-call email
- Runbook: docs/sre/runbooks/auth-failure.md

#### Alert: P0 Latency Degradation
- Name: P0 Latency — p95 > 1200ms
- Query: same P0 transaction filter
- Metric: `p95(transaction.duration)`
- Threshold: CRITICAL when > 2400ms over 5 minutes; WARNING when > 1200ms over 10 minutes
- Notify: `#sre-alerts` Slack channel

---

## Part 2: PostHog Product Reliability Dashboard

PostHog captures server-side events from `captureServerEvent()` in `src/lib/posthog-server.ts`.
The telemetry wrapper added in R1.1 emits structured JSON logs, which Railway surfaces in log stream.

### 2.1 Server-Event Reliability Metrics in PostHog

For each P0 route that emits a `captureServerEvent` call, PostHog dashboards can show:
- Event rate over time
- Success vs failure ratio (if error events are emitted separately)

#### Dashboard: P0 Journey Health
Create in PostHog > Dashboards > New:

1. **Auth Success Rate** (if `auth_success` event is emitted from signin route)
   - Insight type: Trends
   - Event: `auth_success`
   - Compared to: `auth_failure` if captured

2. **Feedback Submission Rate**
   - Event: any server event emitted by feedback POST (add if missing, see note below)
   - Breakdown: by day

3. **Optimize Usage Rate**
   - Event: `optimize_request` (confirm event name in `src/app/api/optimize/route.ts`)

### 2.2 Add PostHog Events to Key P0 Routes (If Missing)

For routes that do not yet call `captureServerEvent`, add after a successful mutation:

```typescript
import { captureServerEvent } from '@/lib/posthog-server'

// After successful feedback insert:
captureServerEvent(userId, 'feedback_submitted', { category })

// After successful auth:
captureServerEvent(userId, 'auth_success', { method: 'email' })
```

---

## Part 3: Railway Log Stream as Raw Telemetry

All `api_request` structured log lines from R1.1 flow through Railway's log stream.

### 3.1 View P0 Route Logs in Railway

1. Open Railway > Project > Service > Logs
2. Filter: `"event":"api_request"` and `"tier":"P0"`
3. Filter: `"status":5` (prefix match for 5xx) to isolate errors
4. Use `correlation_id` values to correlate middleware request logs with route logs

### 3.2 Railway Metrics Panel

1. Railway > Service > Metrics shows:
   - CPU and memory usage
   - Request count and p95 response time (for HTTP routes)
2. Set alert thresholds in Railway > Settings > Alerts on the production service

---

## Part 4: GitHub Actions Monitoring Summary (Already Active)

The workflow `.github/workflows/monitoring.yml` runs every 30 minutes and publishes a
summary table to GitHub Actions step summary and sends Slack alerts on failure.

To view trending results:
1. GitHub > Actions > Production Monitoring workflow
2. Each run's step summary shows the pass/fail table with status codes and latency
3. Download `monitoring-summary` artifact for offline analysis

---

## Dashboard Review Checklist (verify after setup)

- [ ] Sentry P0 dashboard shows all 6 transaction groups (auth, feedback, optimize, billing, briefing, outreach)
- [ ] P0 error rate alert fires in test (trigger a deliberate 500 from a staging route)
- [ ] P0 latency alert fires in test (use load tool to hold p95 above threshold)
- [ ] PostHog P0 journey dashboard shows event volume for past 7 days
- [ ] Railway metrics alert configured on memory > 80% for production service
- [ ] On-call can navigate from Slack alert to Sentry trace in < 2 minutes (verify manually)
