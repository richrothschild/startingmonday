# 157_canonical_event_layer rollback

Goal:
- Revert the canonical company/event layer and pipeline metrics tables if
  event dedup produces incorrect merges, write-path latency regresses, or the
  projection link corrupts user-visible signals.

Risk triggers:
- Distinct real-world events are merged into one event row (over-merging),
  suppressing signals users should have seen.
- The canonical resolver maps different companies to the same canonical row
  (entity conflation), cross-contaminating event timelines.
- Signal-job write latency increases materially from the extra resolution and
  dedup queries.

Pre-rollback safety checks:
- Export `public.company_events`, `public.canonical_companies`, and
  `public.source_run_metrics` if the accumulated event/corroboration data
  needs to be preserved for re-backfill.
- Confirm the worker tolerates the tables being absent: the canonical path in
  `write-signal.js` is wrapped in graceful degradation and falls back to
  legacy per-user signal writes on any error.
- Confirm no user-facing page reads `company_signals.event_id` as required.

Rollback SQL:
```sql
DROP INDEX IF EXISTS public.company_signals_event_idx;
ALTER TABLE public.company_signals DROP COLUMN IF EXISTS event_id;
ALTER TABLE public.companies DROP COLUMN IF EXISTS canonical_company_id;
DROP TABLE IF EXISTS public.source_run_metrics;
DROP TABLE IF EXISTS public.company_events;
DROP TABLE IF EXISTS public.canonical_companies;
```

Validation queries:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('canonical_companies', 'company_events', 'source_run_metrics');

SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'company_signals' AND column_name = 'event_id';

-- Both queries should return zero rows if rollback succeeded
```

Forward-fix plan:
- Re-apply migration 157 in staging after correcting the dedup threshold or
  resolver issue that caused the rollback.
- Re-run the canonical backfill job to rebuild events from company_signals;
  the projection link is reconstructable, so no user data is lost.
