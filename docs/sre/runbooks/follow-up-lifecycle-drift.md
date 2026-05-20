# Runbook: Follow-Up Lifecycle Data Drift (P0)

Owner: On-call engineer
Tier: P0
Last Verified: 2026-05-18

## Trigger Conditions

- Data integrity anomaly detector (R2.7 script) reports drift
- Users report follow-ups not completing or re-appearing after being marked done
- `check-data-integrity.mjs` (R2.7) exits non-zero in CI or nightly run
- Synthetic-06 (Contact Follow-up Lifecycle) fails two consecutive times

False positives:
1. Synthetic test account data not cleaned up from a prior run — check for orphaned synthetic contacts
2. Status check constraint difference (must be `completed`, not `done`) — verify code
3. Race condition in concurrent follow-up close attempts — idempotency check

## Impact Assessment

- **Affected journeys**: Follow-up lifecycle (create, complete, archive contact), briefing page accuracy
- **Affected users**: Users with active follow-ups who are not seeing correct pipeline state
- **Data integrity risk**: Confirmed — follow-up records in wrong state affect briefing, outreach queue, and reporting

## Immediate Actions (First 10 Minutes)

1. Determine scope: how many users and records are affected
2. DO NOT modify data until scope is confirmed
3. Post in `#incidents`: "Follow-up data drift detected — read-only investigation"

## Diagnostics Checklist

```sql
-- Find contacts marked closed but with pending follow_ups:
select c.id as contact_id, c.user_id, c.status as contact_status,
       count(f.id) as pending_follow_ups
from contacts c
join follow_ups f on f.contact_id = c.id
where c.status in ('closed', 'archived', 'rejected')
  and f.status = 'pending'
group by c.id, c.user_id, c.status
order by pending_follow_ups desc;

-- Find duplicate pending follow_ups for same contact:
select contact_id, user_id, count(*) as pending_count
from follow_ups
where status = 'pending'
group by contact_id, user_id
having count(*) > 2
order by pending_count desc;

-- Find follow_ups with invalid status (not in allowed set):
select id, contact_id, status, created_at
from follow_ups
where status not in ('pending', 'completed', 'cancelled', 'snoozed')
order by created_at desc;

-- Timeline: when did drift start?
select date_trunc('hour', updated_at) as hour,
       count(*) as affected_records
from follow_ups
where status not in ('pending', 'completed', 'cancelled', 'snoozed')
group by hour
order by hour desc;
```

## Mitigations

**For closed-contact drift (pending follow_ups on closed contacts):**
```sql
-- Preview (run first — do not execute without confirming count):
select count(*)
from follow_ups f
join contacts c on c.id = f.contact_id
where c.status in ('closed', 'archived', 'rejected')
  and f.status = 'pending';

-- Repair (run only after confirming count and scope):
update follow_ups f
set status = 'completed',
    updated_at = now()
from contacts c
where c.id = f.contact_id
  and c.status in ('closed', 'archived', 'rejected')
  and f.status = 'pending';
```

**For invalid status values:**
```sql
-- Identify source then correct per-case — do not bulk-update without root cause
```

**For duplicate pending follow_ups:**
- Identify the duplicate creation path in code (likely concurrent submission)
- Mark duplicates as `cancelled` after confirming with user if needed
- Add idempotency key or unique constraint to prevent recurrence

## Recovery Validation

1. Re-run diagnostics queries — all counts return 0
2. `check-data-integrity.mjs` exits 0
3. Synthetic-06 passes
4. Spot-check 3 affected users' dashboards manually

## Communication Template

**Internal:**
> `[hh:mm]` Follow-up data drift detected. Affected records: [N]. User impact: [briefing/outreach inaccuracy]. Status: [scoping / repairing]. Next update 30 minutes.

**Customer-facing (only if user-visible, duration > 1 hour):**
> We are correcting a data issue that may have affected follow-up status accuracy. Your data is safe and we will update you once the correction is complete.

## Follow-up Actions

1. Postmortem within 24 hours
2. Add unique constraint or idempotency check to follow_ups creation
3. Make `check-data-integrity.mjs` run nightly (add to nightly-audit.yml)
4. Add E2E test covering concurrent follow-up close for the same contact
