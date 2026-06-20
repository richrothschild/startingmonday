# 132_relationship_targeting_review_queue rollback

Goal:
- Revert the relationship targeting review queue table if the human-review workflow causes data integrity issues, RLS misconfigurations, or unexpected user-facing errors.

Risk triggers:
- Users cannot read or write their own review queue rows due to RLS policy issues.
- Inserts fail because `confidence_band` or `review_status` values written by the application are not in the allowed sets.
- The queue grows unbounded and causes storage or query performance issues.

Pre-rollback safety checks:
- Export pending review rows from `relationship_targeting_reviews` if any human review work has already been done.
- Confirm the relationship targeting feature flag (if any) can be disabled to stop new inserts before dropping.

Rollback SQL:
```sql
DROP TABLE IF EXISTS public.relationship_targeting_reviews;
```

Validation queries:
```sql
SELECT to_regclass('public.relationship_targeting_reviews');
SELECT to_regclass('public.relationship_targeting_reviews_user_idx');
SELECT to_regclass('public.relationship_targeting_reviews_status_idx');
```

Forward-fix plan:
- Re-apply migration 132 after fixing constraint allowed values or RLS policy definitions in staging.
- Restore any exported review rows once the table is recreated.
