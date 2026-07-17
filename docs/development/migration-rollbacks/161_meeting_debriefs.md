# 161_meeting_debriefs rollback

Goal:
- Revert the meeting-debrief persistence layer (meeting_debriefs table,
  its RLS policies, and the updated_at trigger) if debrief writes corrupt
  evaluation history, RLS misconfiguration exposes rows across users, or
  the debrief API degrades dashboard performance.

Risk triggers:
- Debrief rows visible to the wrong user (RLS policy regression).
- Unbounded jsonb payloads (core_answers / stage_answers / stage_scores)
  bloating storage or slowing user-scoped queries.
- The updated_at trigger interfering with bulk maintenance updates.

Pre-rollback safety checks:
- Export the table first - debrief history is user-entered content and
  cannot be regenerated:
  `select * from public.meeting_debriefs` (CSV via Supabase dashboard).
- Confirm the app tolerates the table being absent: the only consumer is
  `src/app/api/meetings/debrief/route.ts`, which returns a JSON 500
  ("Failed to load debrief history" / "Failed to save debrief") without
  crashing the dashboard shell.
- No cron jobs, workers, or other tables reference meeting_debriefs.

Rollback SQL:
```sql
DROP TRIGGER IF EXISTS meeting_debriefs_set_updated_at ON public.meeting_debriefs;
DROP FUNCTION IF EXISTS public.set_meeting_debriefs_updated_at();
DROP TABLE IF EXISTS public.meeting_debriefs;
```

Validation queries:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'meeting_debriefs';

SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'set_meeting_debriefs_updated_at';

-- Both should return zero rows if rollback succeeded
```

Forward-fix plan:
- Re-apply migration 161 in staging after correcting the policy or
  payload issue, validate RLS with two test users, then re-apply to prod
  and restore exported rows if user data was dropped.
