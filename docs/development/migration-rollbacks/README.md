# Migration rollback playbooks

This directory stores rollback playbooks for risky Supabase migrations.

Rules:
- File name must match the migration file name with .md instead of .sql.
- Every risky migration in the most recent window must have a playbook.
- Risky operations include: drop table/column/policy/function/type, and alter-table rename/drop actions.

CI gate:
- Script: npm run migration:rollback:check:strict
- Scope: latest 20 migrations by default.
- Override window: set ROLLBACK_MIGRATION_WINDOW.

Recommended playbook sections:
- Goal
- Risk triggers
- Pre-rollback safety checks
- Rollback SQL
- Validation queries
- Forward-fix plan
