# Starting Monday Internal System Summary

Generated at: 2026-05-31T17:53:55.986Z

## What exists
- Feature pages: 170
- API routes: 239
- Library modules: 163
- Operational scripts: 106
- Infra workflows: 27
- Migrations/data artifacts: 125
- Internal docs: 451

## How it integrates
- App routes render product/admin surfaces and call route handlers for actions and data flows.
- API handlers orchestrate business logic and persist state through Supabase.
- Library modules centralize shared retrieval/auth/analytics/domain logic.
- Scripts and workflows provide CI gates, scheduled audits, and observability exports.
- Migrations and RLS policies define data contracts and access semantics.

## What it is not
- Not a replacement for source code reviews when modifying critical paths.
- Not the external customer onboarding guide.
- Not exhaustive of runtime secrets/config; those remain environment-controlled.
