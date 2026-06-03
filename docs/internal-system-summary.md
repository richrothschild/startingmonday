# Starting Monday Internal System Summary

Generated at: 2026-06-03T21:20:41.435Z

## What exists
- Feature pages: 178
- API routes: 245
- Library modules: 192
- Operational scripts: 110
- Infra workflows: 30
- Migrations/data artifacts: 129
- Internal docs: 495

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
