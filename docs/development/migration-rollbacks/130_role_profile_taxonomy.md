# 130_role_profile_taxonomy rollback

Goal:
- Revert role-aware onboarding profile fields if the new columns or constraints cause write failures, onboarding regressions, or constraint violations on existing data.

Risk triggers:
- Writes to `user_profiles` fail due to unexpected values hitting the new CHECK constraints on `role_family`, `role_seniority`, or `workflow_variant`.
- Onboarding flow breaks because existing rows have values not covered by the allowed sets.
- Index bloat on `user_profiles` degrades query performance.

Pre-rollback safety checks:
- Export any rows where `role_family`, `role_title`, `role_seniority`, or `workflow_variant` are non-null so the data is not lost.
- Confirm no application code will fail on null values for these columns after removal.
- Verify no other migrations after 130 reference these columns (check 131+).

Rollback SQL:
```sql
-- Drop indexes added by this migration
DROP INDEX IF EXISTS public.user_profiles_role_family_idx;
DROP INDEX IF EXISTS public.user_profiles_role_title_idx;
DROP INDEX IF EXISTS public.user_profiles_workflow_variant_idx;

-- Drop constraints added by this migration
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_family_check;
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_seniority_check;
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_workflow_variant_check;

-- Drop columns added by this migration
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS role_family;
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS role_title;
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS role_seniority;
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS workflow_variant;
```

Validation queries:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_profiles'
  AND column_name IN ('role_family', 'role_title', 'role_seniority', 'workflow_variant');

SELECT to_regclass('public.user_profiles_role_family_idx');
SELECT to_regclass('public.user_profiles_role_title_idx');
SELECT to_regclass('public.user_profiles_workflow_variant_idx');
```

Forward-fix plan:
- Re-apply migration 130 after fixing the constraint values or seeding logic in staging.
- Verify onboarding flow writes valid values for all four columns before re-enabling in production.
