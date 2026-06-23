# 147_linkedin_export_hybrid_matching rollback

Goal:
- Revert the LinkedIn export and Apollo hybrid matching schema if upload processing failures, RLS misconfigurations, match quality issues, or performance regressions are detected after rollout.

Risk triggers:
- Upload processing or match jobs fail due to constraint violations or missing extension support (`pg_trgm`, `unaccent`).
- Users can read other users' upload, connection, or match rows due to RLS policy gaps.
- The trigram indexes on large `linkedin_export_connections` tables cause query planner regressions.
- `normalize_match_text` or `classify_linkedin_match` functions return unexpected values causing incorrect tier assignments.

Pre-rollback safety checks:
- Export any user-uploaded connection data from `linkedin_export_connections` and confirmed matches from `company_people_connection_matches` that should be preserved.
- Confirm no application code path will throw on the absence of these tables (feature-flag or graceful-null consuming routes first).
- Verify `company_people_candidates` and `people` foreign key references in `company_people_connection_matches` are handled (rows will cascade-delete on table drop).

Rollback SQL:
```sql
-- Drop match and run tables first (they reference uploads and connections)
DROP TABLE IF EXISTS public.company_people_matching_runs;
DROP TABLE IF EXISTS public.company_people_connection_matches;

-- Drop connection and upload tables
DROP TABLE IF EXISTS public.linkedin_export_connections;
DROP TABLE IF EXISTS public.linkedin_connection_uploads;

-- Drop helper functions
DROP FUNCTION IF EXISTS public.classify_linkedin_match(text, numeric, numeric);
DROP FUNCTION IF EXISTS public.normalize_match_text(text);
```

Validation queries:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'linkedin_connection_uploads',
    'linkedin_export_connections',
    'company_people_connection_matches',
    'company_people_matching_runs'
  );

SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('normalize_match_text', 'classify_linkedin_match');

-- Both queries should return zero rows if rollback succeeded
```

Forward-fix plan:
- Re-apply migration 147 after fixing the relevant policy, trigger, constraint, or function issue in staging.
- Restore user connection and match data from the pre-rollback export.
- Re-run match jobs once tables are restored.
