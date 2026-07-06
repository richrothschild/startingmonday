# 159_backtest_harness_and_source_expansion rollback

Goal:
- Revert E3 scaffolding (cohorts, controls, replay metrics, ATS openings,
  scanner misses, WARN notices) if replay metrics are incorrect, source
  ingestion floods noise, or queue workflows regress dashboard quality.

Risk triggers:
- backtest cohort generation writes malformed timelines, producing misleading
  pattern precision metrics.
- ATS polling over-generates openings and inflates label coverage.
- scanner_misses queue creates duplicate/abusive records and clutters ops.
- WARN ingestion generates low-quality layoff events due to feed mismatch.

Pre-rollback safety checks:
- Export all E3 tables first; replay history and source snapshots are
  high-value internal data.
- Confirm worker jobs are fail-open if these tables are absent.
- Confirm admin intelligence page handles empty/missing E3 metrics safely.

Rollback SQL:
```sql
DROP TABLE IF EXISTS public.pattern_backtests;
DROP TABLE IF EXISTS public.backtest_controls;
DROP TABLE IF EXISTS public.backtest_cohorts;
DROP TABLE IF EXISTS public.backtest_replay_runs;
DROP TABLE IF EXISTS public.ats_role_openings;
DROP TABLE IF EXISTS public.scanner_misses;
DROP TABLE IF EXISTS public.warn_notices;
```

Validation queries:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'pattern_backtests',
    'backtest_controls',
    'backtest_cohorts',
    'backtest_replay_runs',
    'ats_role_openings',
    'scanner_misses',
    'warn_notices'
  );

-- Should return zero rows.
```

Forward-fix plan:
- Patch offending builder/replay/poller logic, then re-apply migration 159.
- Restore exported rows and rerun cohort + replay jobs to rebuild metrics.