# Starting Monday Internal System Summary

Generated at: 2026-06-07T13:26:54.245Z

## What exists
- Feature pages: 185
- API routes: 250
- Library modules: 197
- Operational scripts: 116
- Infra workflows: 34
- Migrations/data artifacts: 132
- Internal docs: 536

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
