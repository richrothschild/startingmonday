# Starting Monday Internal System Summary

Generated at: 2026-06-06T03:51:25.122Z

## What exists
- Feature pages: 183
- API routes: 246
- Library modules: 196
- Operational scripts: 115
- Infra workflows: 30
- Migrations/data artifacts: 132
- Internal docs: 530

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
