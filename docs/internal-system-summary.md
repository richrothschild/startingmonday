# Starting Monday Internal System Summary

Generated at: 2026-06-22T22:36:48.545Z

## What exists
- Feature pages: 217
- API routes: 286
- Library modules: 226
- Operational scripts: 145
- Infra workflows: 40
- Migrations/data artifacts: 153
- Internal docs: 660

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
