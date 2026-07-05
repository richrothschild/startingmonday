# 156_ingest_dlq rollback

Goal:
- Revert the ingestion dead-letter queue table if DLQ writes cause pipeline
  slowdowns, unexpected storage growth, or incorrect alerting after rollout.

Risk triggers:
- DLQ inserts add measurable latency or failures to the signal-job hot path.
- The unresolved-entry partial index grows unbounded because resolution
  tooling is not keeping up, degrading insert performance.
- The DLQ monitor alerts are noisy or misleading and erode alert trust.

Pre-rollback safety checks:
- Export `public.ingest_dlq` if unresolved failure payloads are still needed
  for classification-loss analysis.
- Confirm the worker tolerates the table being absent: `writeIngestDlq` and
  `getIngestDlqStats` log and continue on error; `dlq-monitor-job` will log a
  stats failure but must not crash the worker loop.
- Disable or ignore the `dlq-monitor-job` cron alert while the table is absent.

Rollback SQL:
```sql
DROP INDEX IF EXISTS public.ingest_dlq_unresolved_idx;
DROP TABLE IF EXISTS public.ingest_dlq;
```

Validation queries:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'ingest_dlq';

-- Should return zero rows if rollback succeeded
```

Forward-fix plan:
- Re-apply migration 156 in staging after correcting the insert-path or
  alert-threshold issue that caused the rollback.
- If historical failure rows matter, restore them from the export taken
  before rollback.
