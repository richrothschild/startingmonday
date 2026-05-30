# 106_briefs_type_check_prep_section rollback

Goal:
- Restore prior briefs.type check constraint set if prep_section writes or reads regress.

Risk triggers:
- Insert/update failures on briefs.type values.
- Downstream assumptions break on prep_section handling.

Pre-rollback safety checks:
- Count rows with type = 'prep_section'.
- Export affected rows if non-zero.

Rollback SQL:
```sql
ALTER TABLE briefs DROP CONSTRAINT IF EXISTS briefs_type_check;
ALTER TABLE briefs ADD CONSTRAINT briefs_type_check
  CHECK (type IN ('strategy', 'prep', 'outreach'));
```

Validation queries:
```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.briefs'::regclass
  AND conname = 'briefs_type_check';
```

Forward-fix plan:
- If prep_section is required, add compatibility patch in app code and reintroduce constraint in a controlled migration.
