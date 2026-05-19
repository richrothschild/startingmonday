# Runbook: Billing / Webhook Degradation (P0)

Owner: On-call engineer
Tier: P0
Last Verified: 2026-05-18

## Trigger Conditions

- Synthetic-07 (Billing Portal Path) or Synthetic-08 (Webhook Readiness) fails
- `dependency-health.yml` reports Stripe status as degraded
- Users report inability to access billing portal or upgrade/downgrade
- Webhook events from Stripe are not being processed (subscription state drift)

False positives:
1. Stripe test mode vs live mode mismatch in synthetic test
2. Synthetic paid-seat account not present or subscription expired
3. Stripe status page shows incident — external, no code fix needed

## Impact Assessment

- **Affected journeys**: Billing page, checkout, plan upgrade/downgrade, subscription status checks
- **Affected users**: Users on trial attempting to subscribe; existing subscribers checking billing
- **Data integrity risk**: Possible — if webhook events are missed, subscription state in Supabase may drift from Stripe

## Immediate Actions (First 10 Minutes)

1. Check Stripe status: https://status.stripe.com
2. Check Railway logs for `/api/billing/*` and `/api/webhooks/stripe` 5xx responses
3. Check Supabase `subscriptions` table for recent updates:
   ```sql
   select id, user_id, status, updated_at
   from subscriptions
   order by updated_at desc
   limit 20;
   ```
4. In Stripe Dashboard > Developers > Webhooks: check recent delivery failures for your endpoint
5. If deploy was recent: check if `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` secrets are still set in Railway

## Diagnostics Checklist

```sql
-- Find subscriptions that may be out of sync:
select s.user_id, s.status, s.current_period_end, s.stripe_subscription_id
from subscriptions s
where s.updated_at < now() - interval '2 hours'
  and s.status = 'active'
  and s.current_period_end < now();

-- Check for webhook log entries if tracked:
select * from webhook_events
order by created_at desc
limit 20;
```

Stripe Dashboard checks:
- Webhooks > Recent deliveries: look for failed deliveries to your endpoint
- Failed event types to watch: `customer.subscription.updated`, `invoice.paid`, `invoice.payment_failed`
- Re-deliver failed events from Stripe Dashboard to recover

## Mitigations

1. **Stripe service incident** — wait for Stripe recovery; communicate to affected users; no code action
2. **Webhook secret mismatch** — verify `STRIPE_WEBHOOK_SECRET` in Railway environment matches the webhook endpoint secret in Stripe Dashboard
3. **Webhook handler crash** — check Railway logs for `/api/webhooks/stripe`; fix code or rollback
4. **Missed events** — replay failed webhook deliveries from Stripe Dashboard (Webhooks > endpoint > re-send)
5. **Subscription drift** — if user state is wrong, manually update via Supabase admin or Stripe API

## Recovery Validation

1. Synthetic-07 and Synthetic-08 pass
2. Stripe Dashboard shows successful webhook deliveries for the endpoint
3. Spot-check 3 recent subscriptions in Supabase against Stripe — statuses match

## Communication Template

**Internal:**
> `[hh:mm]` Billing degradation detected. Impact: [users cannot upgrade / webhook events delayed]. Status: [Stripe external / investigating internal]. Next update 15 minutes.

**Customer-facing (only for > 30 min impact):**
> We are aware of a billing issue affecting plan changes. Your access will not be interrupted. We are working on a resolution.

## Follow-up Actions

1. Implement a webhook reconciliation script if events were missed (see docs/sre/runbooks/follow-up-lifecycle-drift.md for pattern)
2. Set up Stripe webhook delivery failure alert in Stripe Dashboard (email to engineering oncall)
3. Postmortem if duration > 30 minutes or subscription data drift confirmed
