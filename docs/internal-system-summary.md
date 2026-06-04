# Starting Monday Internal System Summary

Generated at: 2026-06-04T04:31:54.634Z

## What exists
- Feature pages: 178
- API routes: 246
- Library modules: 192
- Operational scripts: 112
- Infra workflows: 30
- Migrations/data artifacts: 130
- Internal docs: 510

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
