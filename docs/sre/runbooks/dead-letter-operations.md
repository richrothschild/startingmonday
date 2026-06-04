# Dead-Letter Operations

## Scope
Covers dead-letter visibility for:
- `scan_failures` (scan pipeline failures)
- `heavy_job_queue` status `dead_letter` (signal retry failures)

## Daily Command

```bash
npm run ops:dead-letter:check
```

This command exits with:
- `0` when no dead-letter events are detected in the lookback window.
- `2` when dead-letter events are present and operator action is required.
- `1` on tooling or connectivity errors.

## Triage Procedure
1. Identify affected job type and count from command output.
2. Inspect the most recent failures in Supabase for:
   - `error_message`
   - `metadata`
   - `attempts` and `max_attempts`
3. Classify root cause:
   - transient dependency outage
   - invalid payload or schema drift
   - upstream rate limit or auth failure
4. Apply fix and replay only safe items.
5. Verify queue drains and no new dead-letter events appear for 30 minutes.

## Escalation
- Escalate to Sev-1 if dead-letter volume blocks first-value paths.
- Escalate to Sev-2 if dead-letter growth continues for > 60 minutes.
