# 132_monitoring_alert_state rollback

Goal:
- Revert monitoring alert state persistence if watchdog/audit state writes regress or interfere with alerting flow.

Risk triggers:
- upsert failures to public.monitoring_alert_state from cron monitor routes.
- unexpected table growth or lock contention impacting cron route latency.
- schema mismatch with route payloads causes runtime write failures.

Pre-rollback safety checks:
- Capture latest rows for incident timeline.
- Confirm monitor routes can operate in degraded mode without persisted cooldown state.
- Notify team that stale/recovery dedupe behavior may be noisier until forward-fix.

Rollback SQL:
```sql
DROP TABLE IF EXISTS public.monitoring_alert_state;
```

Validation queries:
```sql
SELECT to_regclass('public.monitoring_alert_state');
SELECT to_regclass('public.monitoring_alert_state_updated_idx');
```

Forward-fix plan:
- Re-apply migration 132 after correcting failing route payloads or DB permissions.
- Validate stale/recovery cooldown behavior in health mode and live mode.
