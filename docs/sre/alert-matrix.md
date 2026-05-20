# Alert Matrix (Exact Thresholds)

Last updated: 2026-05-18

## Alert Routing

1. Pager: Sev-1 and Sev-2 only
2. Slack #ops-alerts: Sev-2, Sev-3, Sev-4
3. Daily digest: Sev-4 informational only

## Severity Definitions

1. Sev-1: major customer outage or critical transaction broken
2. Sev-2: major degradation on critical workflows
3. Sev-3: localized degradation or non-critical feature incident
4. Sev-4: warning, trend, or pre-incident signal

## Core SLO Burn Alerts

### P0 Fast Burn (Page)

1. Condition A: availability error ratio > 2% over 5 minutes
2. Condition B: availability error ratio > 1% over 1 hour
3. Trigger: A and B both true
4. Severity: Sev-1
5. Route: Pager + Slack

### P0 Fast Burn (API)

1. Condition A: 5xx ratio > 1.5% over 5 minutes
2. Condition B: 5xx ratio > 0.75% over 1 hour
3. Trigger: A and B both true
4. Severity: Sev-1
5. Route: Pager + Slack

### P0 Slow Burn

1. Condition A: availability error ratio > 0.5% over 6 hours
2. Condition B: availability error ratio > 0.3% over 24 hours
3. Trigger: A and B both true
4. Severity: Sev-2
5. Route: Pager + Slack

## Transaction Failure Alerts

### Auth Login Failures

1. Scope: /api/auth/verify-and-signin
2. Threshold: failed login responses (5xx + auth-system failures) > 5% over 10 minutes
3. Minimum volume: >= 50 requests in window
4. Severity: Sev-1
5. Route: Pager + Slack

### Signup Failures

1. Scope: /api/auth/verify-and-signup
2. Threshold: response failure ratio > 4% over 15 minutes
3. Minimum volume: >= 20 requests
4. Severity: Sev-2
5. Route: Pager + Slack

### Feedback Submit Failures

1. Scope: /api/feedback/items POST
2. Threshold: failure ratio > 3% over 15 minutes
3. Minimum volume: >= 20 requests
4. Severity: Sev-2
5. Route: Pager + Slack

### Optimize Flow Failures

1. Scope: /api/optimize POST
2. Threshold: non-429 failure ratio > 5% over 10 minutes
3. Minimum volume: >= 30 requests
4. Severity: Sev-2
5. Route: Pager + Slack

### Outreach Send Failures

1. Scope: /api/outreach/send
2. Threshold: failure ratio > 2% over 15 minutes
3. Minimum volume: >= 20 requests
4. Severity: Sev-1 if outage is total, else Sev-2
5. Route: Pager + Slack

### Billing Checkout/Portal Failures

1. Scope: /api/billing/checkout, /api/billing/checkout/seats, /api/billing/portal
2. Threshold: failure ratio > 2% over 15 minutes
3. Minimum volume: >= 10 requests
4. Severity: Sev-1
5. Route: Pager + Slack

## Latency Alerts

### P0 API Latency

1. Threshold: p95 latency > 2500 ms for 10 minutes
2. Minimum volume: >= 100 requests in 10 minutes
3. Severity: Sev-2
4. Route: Pager + Slack

### P0 Page UX Latency

1. Threshold: p95 LCP > 4000 ms over 30 minutes
2. Threshold: p95 INP > 450 ms over 30 minutes
3. Trigger: either threshold exceeded
4. Severity: Sev-2
5. Route: Slack (Pager if also transaction failures)

## Data Integrity Alerts

### Follow-up Lifecycle Drift

1. Query check every 15 minutes
2. Threshold: pending follow_ups linked to closed contacts > 0 for > 15 minutes
3. Severity: Sev-2
4. Route: Pager + Slack

### Duplicate Contact Follow-up Creation

1. Threshold: duplicate pending follow_ups with same contact_id + action + due_date > 5 in 30 minutes
2. Severity: Sev-3
3. Route: Slack

### Webhook Backlog

1. Scope: Stripe and Resend webhook processing lag
2. Threshold: oldest unprocessed event age > 5 minutes
3. Severity: Sev-2
4. Route: Pager + Slack

## Infrastructure and Dependency Alerts

### Database Error Spike

1. Threshold: Postgres error ratio > 1% over 10 minutes
2. Severity: Sev-1 if user-impacting, otherwise Sev-2
3. Route: Pager + Slack

### Cron/Worker Execution Failures

1. Threshold: any critical cron job fails 2 consecutive runs
2. Severity: Sev-2
3. Route: Pager + Slack

### Third-Party Dependency Errors

1. Anthropic errors > 10% over 10 minutes: Sev-2
2. Stripe API errors > 3% over 10 minutes: Sev-1
3. Resend API errors > 5% over 10 minutes: Sev-2
4. Route: Pager + Slack

## Alert Quality Requirements

1. Every Pager alert must link a runbook URL
2. Every alert must include route, deploy SHA, region, and correlation id sample
3. Every false-positive alert is reviewed within 3 business days and tuned
