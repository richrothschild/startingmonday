# 154_wedge_economics_ledgers rollback

Goal:
- Revert the wedge economics ledger tables (`marketing_spend_entries` and `partner_commercial_events`) if reporting inaccuracies, RLS misconfigurations, or unintended data exposure are detected after rollout.

Risk triggers:
- Ledger rows are written by an unauthorized code path despite deny-all RLS policies.
- The `partner_commercial_events.partner_id` cascade delete removes commercial history unexpectedly when a partner row is deleted.
- Spend or commercial event amounts drive incorrect wedge economics reporting downstream.

Pre-rollback safety checks:
- Export both tables if the ledger history needs to be preserved for finance reporting.
- Confirm no application code path or reporting job will throw on the absence of these tables.
- Verify no downstream views or scheduled reports select from these tables.

Rollback SQL:
```sql
DROP TABLE IF EXISTS public.partner_commercial_events;
DROP TABLE IF EXISTS public.marketing_spend_entries;
```

Validation queries:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('marketing_spend_entries', 'partner_commercial_events');

-- Should return zero rows if rollback succeeded
```

Forward-fix plan:
- Re-apply migration 154 after fixing the relevant policy, constraint, or reporting issue in staging.
- Ledger history prior to the rollback is not recoverable unless a pre-rollback export was taken.
