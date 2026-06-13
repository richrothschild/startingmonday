# 134_contact_enrichment_governance rollback

Goal:
- Revert contact enrichment governance columns if rollout causes contact write regressions.

Risk triggers:
- contact create/update failures due to enrichment_* fields.
- retention job update failures from new governance columns.

Pre-rollback safety checks:
- confirm contacts API can run without enrichment governance fields.
- snapshot recent enriched contacts for compliance audit continuity.

Rollback SQL:
```sql
DROP INDEX IF EXISTS public.idx_contacts_enrichment_retention;
ALTER TABLE IF EXISTS public.contacts
  DROP COLUMN IF EXISTS enrichment_source,
  DROP COLUMN IF EXISTS enrichment_confidence,
  DROP COLUMN IF EXISTS enrichment_retention_expires_at,
  DROP COLUMN IF EXISTS enrichment_deleted_at;
```

Validation queries:
```sql
SELECT to_regclass('public.idx_contacts_enrichment_retention');
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'contacts'
  AND column_name in ('enrichment_source','enrichment_confidence','enrichment_retention_expires_at','enrichment_deleted_at');
```

Forward-fix plan:
- re-apply migration 134 after API payload compatibility checks in staging.
