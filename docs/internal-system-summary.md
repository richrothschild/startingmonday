# Starting Monday Internal System Summary

Generated at: 2026-06-09T03:25:20.865Z

## What exists
- Feature pages: 190
- API routes: 260
- Library modules: 202
- Operational scripts: 120
- Infra workflows: 35
- Migrations/data artifacts: 138
- Internal docs: 561

## How it integrates
- App routes render product/admin surfaces and call route handlers for actions and data flows.
- API handlers orchestrate business logic and persist state through Supabase.
- Library modules centralize shared retrieval/auth/analytics/domain logic.
- Scripts and workflows provide CI gates, scheduled audits, and observability exports.
- Migrations and RLS policies define data contracts and access semantics.
- Internal guide artifacts are refreshed automatically on a weekly scheduled workflow and on demand.

## What it is not
- Not a replacement for source code reviews when modifying critical paths.
- Not the external customer onboarding guide.
- Not exhaustive of runtime secrets/config; those remain environment-controlled.
