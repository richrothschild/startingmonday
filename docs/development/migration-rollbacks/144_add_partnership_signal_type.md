# 144_add_partnership_signal_type rollback

Goal:
- Revert the `company_signals_signal_type_check` constraint to exclude `'partnership'` if the new signal type causes unexpected downstream issues.

Risk triggers:
- Signal processing jobs produce `'partnership'` rows that are malformed or incorrectly classified, polluting signal feeds.
- Downstream queries or UI components do not handle the new type and throw errors.

Pre-rollback safety checks:
- CRITICAL: Count rows where `signal_type = 'partnership'` before rolling back. The old constraint will reject them and the rollback will fail if any exist.
  ```sql
  SELECT COUNT(*) FROM public.company_signals WHERE signal_type = 'partnership';
  ```
- If partnership rows exist, either delete them or update them to a valid legacy type before applying rollback SQL.
- Disable the signal job that writes `'partnership'` rows before proceeding.

Rollback SQL:
```sql
-- Remove partnership rows first if any exist (adjust or archive as appropriate)
-- DELETE FROM public.company_signals WHERE signal_type = 'partnership';

-- Drop the current constraint and restore the pre-144 version without 'partnership'
ALTER TABLE public.company_signals DROP CONSTRAINT IF EXISTS company_signals_signal_type_check;

ALTER TABLE public.company_signals
  ADD CONSTRAINT company_signals_signal_type_check
  CHECK (signal_type IN (
    'funding', 'exec_departure', 'exec_hire', 'acquisition',
    'expansion', 'layoffs', 'ipo', 'new_product', 'award',
    'pattern_alert', 'filing_trend',
    'breach_disclosure', 'regulatory_change',
    'data_platform', 'ai_investment',
    'board_change', 'transformation_budget',
    'activist_entry', 'insider_sale'
  ));
```

Validation queries:
```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.company_signals'::regclass
  AND conname = 'company_signals_signal_type_check';

SELECT COUNT(*) FROM public.company_signals WHERE signal_type = 'partnership';
```

Forward-fix plan:
- Fix the signal classification logic in staging, re-apply migration 144, and re-process any signals that were deleted or reclassified during rollback.
