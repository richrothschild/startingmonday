# ADR 001: Supabase Row-Level Security for Tenant Isolation

**Status:** Accepted  
**Date:** 2026-05  
**Deciders:** Richard Rothschild

---

## Context

Starting Monday is a single-tenant-per-row SaaS: every user's companies, contacts, briefs, and pipeline activity must be invisible to all other users. The system uses Supabase (managed Postgres) with a mix of server-side operations (Next.js API routes, cron jobs) and the occasional client-side query.

Three isolation approaches were considered:

1. **Application-layer filtering** — every query manually adds `.eq('user_id', userId)`. Fast to write, catastrophic to miss. One forgotten `.eq()` leaks data.
2. **Separate schemas or databases per user** — strong isolation, operationally expensive, not viable at this stage.
3. **Postgres Row-Level Security (RLS) via Supabase** — isolation enforced at the database layer regardless of query origin. Requires upfront policy work; eliminates the category of bug where a filter is forgotten.

## Decision

Use Supabase RLS on every user-scoped table. All user data tables have RLS enabled with a `user_id = auth.uid()` policy for SELECT, INSERT, UPDATE, and DELETE.

Server-side routes that need to bypass RLS (admin operations, cron jobs, cross-user aggregations) use `createAdminClient()` which initializes Supabase with the service role key. This is isolated to `src/lib/supabase/admin.ts` and is never imported from client-side code.

The boundary rule: `createClient()` for user-context operations (RLS enforced); `createAdminClient()` for service-context operations (no RLS). Mixing them in the wrong direction is the failure mode to prevent.

## Consequences

**Positive:**
- A forgotten filter on a user-scoped query silently returns no rows instead of leaking data. The database enforces what the application might miss.
- Security audits can verify isolation by inspecting RLS policies rather than reading every query.
- New tables added by contributors are required to enable RLS; the migration pattern makes this visible.

**Negative:**
- Admin operations require explicit service role client use. Contributors who do not understand the boundary will see confusing empty results when they expect data.
- RLS policies must be added in every migration for new user-scoped tables. Missing a policy on a new table creates a silent data leak (no rows returned to users, but also no isolation).
- Policy logic is in SQL, not TypeScript. Harder to test locally without a running Supabase instance.

**Mitigation:** `src/lib/supabase/admin.ts` has a comment block explaining when to use it. Migration template includes RLS boilerplate. The security audit runbook (`docs/security-audit-runbook.md`) includes a check for tables missing RLS.
