# Runbook: Feedback Submission Failure (P0)

Owner: On-call engineer
Tier: P0
Last Verified: 2026-05-18

## Trigger Conditions

- Synthetic-04 (Feedback Submission) fails in monitoring.yml
- `/api/feedback/items` P0 fast-burn alert fires
- Users report feedback form returning errors
- `api_request` log lines show status 500 for `path:"/api/feedback/items"`

False positives:
1. Supabase `feedback_items` table schema change — check recent migrations
2. RLS policy changed and blocks insert for test account role
3. Test account exceeded 5/day rate limit during synthetic testing (cleanup or use fresh account)

## Impact Assessment

- **Affected journeys**: Feedback submission, feedback list view
- **Affected users**: Users submitting or viewing feedback in the feedback portal
- **Data integrity risk**: Possible — if partial inserts occurred before failure

## Immediate Actions (First 10 Minutes)

1. Post in `#incidents`: "Feedback submission incident opened"
2. Check Railway logs: filter `"path":"/api/feedback/items"` AND `"status\":5`
3. Check `correlation_id` from failing request — find full log context
4. Test directly:
   ```bash
   curl -X POST https://startingmonday.app/api/feedback/items \
     -H "Content-Type: application/json" \
     -H "Cookie: <your-session-cookie>" \
     -d '{"title":"test","body":"test body","category":"bug"}'
   ```
5. Check Supabase dashboard for `feedback_items` table errors or migration lock

## Diagnostics Checklist

```sql
-- Check insert failures in the last hour:
select count(*), created_at::date
from feedback_items
where created_at > now() - interval '1 hour'
group by created_at::date;

-- Check for constraint violations (DB logs, if available):
-- Look for type check constraint — type must be 'feedback'

-- Check rate limit state for feedback per user:
select user_id, count(*) as submissions_today
from feedback_items
where created_at > now() - interval '24 hours'
group by user_id
having count(*) >= 5
order by submissions_today desc;
```

Sentry traces:
- Filter transaction `/api/feedback/items` POST > errors > look for Supabase span failures
- Common causes: DB connection timeout, schema constraint violation, RLS policy miss

## Mitigations

1. **Schema constraint** — if `type` field is missing or wrong: check `src/app/api/feedback/items/route.ts` insert block, ensure `type: 'feedback'` is set
2. **RLS policy** — if Supabase RLS is blocking: check `supabase/migrations/` for recent policy changes; temporarily disable RLS on `feedback_items` for the authenticated role if critical
3. **DB connection pool exhausted** — restart Railway service
4. **Rollback deploy** if issue introduced by recent code change

## Recovery Validation

1. Submit one test feedback item with a real session — confirm 201 response
2. Synthetic-04 passes two consecutive monitoring runs
3. Confirm item appears in Supabase `feedback_items` table

## Communication Template

**Internal:**
> `[hh:mm]` Feedback submission is currently failing. Impact: users cannot submit feedback. Status: [investigating]. Next update in 15 minutes.

**Resolution:**
> `[hh:mm]` Feedback submission restored. Root cause: [brief]. Duration: [X] minutes.

## Follow-up Actions

1. Postmortem if duration > 30 minutes
2. Add schema constraint to unit test coverage if schema mismatch was the cause
3. Ensure synthetic test cleanup handles rate limit edge case
