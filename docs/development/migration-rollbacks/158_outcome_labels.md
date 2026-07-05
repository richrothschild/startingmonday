# 158_outcome_labels rollback

Goal:
- Revert the outcome-labeling loop (role_openings, event_outcome_labels,
  precursor_stats, officer_snapshots) if labeling produces incorrect ground
  truth, stats mislead calibration, or the label jobs degrade the pipeline.

Risk triggers:
- Openings are recorded for the wrong canonical company (entity conflation
  upstream), poisoning precursor statistics.
- The exec_hire retro-labeler double-counts openings or labels unrelated
  events, inflating hit rates.
- user_pipeline labels leak into public-facing statistics despite the
  exclude_from_public_stats flag.
- Proxy officer extraction produces hallucinated appointments.

Pre-rollback safety checks:
- Export all four tables — the labeled outcome dataset is the moat asset and
  must be preserved even when rolling back the schema.
- Confirm the worker tolerates the tables being absent: outcome-labels lib
  functions and both jobs log and continue on error; the scanner hook is
  fire-and-forget.
- Confirm the admin intelligence panel renders with the label queries failing
  (it defaults to zero counts).

Rollback SQL:
```sql
DROP TABLE IF EXISTS public.event_outcome_labels;
DROP TABLE IF EXISTS public.role_openings;
DROP TABLE IF EXISTS public.precursor_stats;
DROP TABLE IF EXISTS public.officer_snapshots;
```

Validation queries:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('role_openings', 'event_outcome_labels', 'precursor_stats', 'officer_snapshots');

-- Should return zero rows if rollback succeeded
```

Forward-fix plan:
- Re-apply migration 158 in staging after correcting the labeler issue.
- Restore exported label rows, then re-run outcome-label-backfill-job and
  precursor-stats-job to rebuild aggregates.
