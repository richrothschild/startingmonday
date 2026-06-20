# 145_relationship_intelligence_foundation rollback

Goal:
- Revert the full relationship intelligence schema (people layer + user relationship layer) if write failures, RLS misconfigurations, performance regressions, or data integrity issues are detected after rollout.

Risk triggers:
- Inserts to any of the new tables fail due to constraint violations or RLS policy gaps.
- The shared `people` table grows faster than expected and causes storage or query performance issues.
- Triggers (`set_updated_at_people`, etc.) fire incorrectly and cause unexpected write behaviour.
- Users can read other users' `contact_people`, `contact_notes`, `relationship_touchpoints`, or `relationship_insights` rows due to RLS misconfiguration.

Pre-rollback safety checks:
- Export any user-generated data from `contact_people`, `contact_notes`, `relationship_touchpoints`, and `relationship_insights` that should be preserved.
- Export `people` and `person_sources` rows if the enrichment pipeline has already populated them.
- Confirm no application code path will throw on the absence of these tables (feature-flag or graceful-null the consuming routes first).

Rollback SQL:
```sql
-- Drop user-private relationship tables first (reference people and contacts)
DROP TABLE IF EXISTS public.relationship_insights;
DROP TABLE IF EXISTS public.relationship_touchpoints;
DROP TABLE IF EXISTS public.contact_notes;
DROP TABLE IF EXISTS public.company_people_candidates;
DROP TABLE IF EXISTS public.contact_people;

-- Drop shared people layer (person_sources, person_affiliations, person_signals reference people)
DROP TABLE IF EXISTS public.person_signals;
DROP TABLE IF EXISTS public.person_affiliations;
DROP TABLE IF EXISTS public.person_sources;
DROP TABLE IF EXISTS public.people;
```

Validation queries:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'people', 'person_sources', 'person_affiliations', 'person_signals',
    'contact_people', 'company_people_candidates', 'contact_notes',
    'relationship_touchpoints', 'relationship_insights'
  );

-- Should return zero rows if rollback succeeded
```

Forward-fix plan:
- Re-apply migration 145 after fixing the relevant policy, trigger, or constraint issue in staging.
- Re-load enrichment data from Apollo or other sources once the `people` table is restored.
- Restore user-generated relationship data from the pre-rollback export.
