# /check-demo

Audit demo coverage after recent changes. Run this at the end of any sprint that touches the DB schema, adds API routes, or adds new features with write operations.

## What to check

**1. Recent changes**
Run `git log --oneline -20` to identify what shipped since the last demo audit.

**2. New DB columns (migrations)**
For each new migration file in `supabase/migrations/` that adds a column:
- Is the column populated in `scripts/seed-demo.ts`?
- If nullable and not meaningful for demo, note it as intentionally skipped.
- If it affects a visible feature (a UI field, a calculation, a job output), it needs seed data.

**3. New API routes**
For each new file in `src/app/api/`:
- Does it perform writes (POST/PUT/PATCH/DELETE)?
- If yes: does it have a `isDemoUser()` guard that blocks the write and redirects to `/signup?from=demo`?
- Read-only routes (GET) don't need guards.

**4. New worker jobs**
For each new file in `worker/jobs/`:
- Does it send emails or modify data?
- If yes: does it skip the demo user? Check for `DEMO_USER_ID` exclusion or `subscription_status !== 'active'` filter.
- Activation-style jobs that target `trialing` users are safe — demo is `active`.

**5. New UI features**
For any new dashboard pages or components:
- Does the feature depend on data that isn't seeded? (e.g., a new table, a new field)
- Does the feature allow writes that aren't guarded?
- Would a demo visitor see an empty state or a broken UI?

**6. Demo-specific constants**
Check `src/lib/demo.ts`:
- Are `DEMO_PREP_BRIEFS` still accurate for the current prep brief format?
- Does `DEMO_STRATEGY_BRIEF` reflect current strategy brief structure?
- If the brief format changed (new sections, renamed fields), update the hardcoded content.

## Output format

Report findings in three buckets:

### Must fix before demo is shown
Issues that cause broken UI, empty states on visible features, or write operations that aren't blocked.

### Should fix (seed gap)
New columns or tables that have demo-visible effects but no seed data. Note the specific field and suggested value.

### Fine — intentionally skipped
Nullable fields, background jobs that correctly exclude demo, read-only routes.

## How to fix gaps

- **Seed gap**: Add the missing data to `scripts/seed-demo.ts` and note that `npm run seed:demo` must be re-run.
- **Missing write guard**: Add `isDemoUser(user.id)` check to the API route, returning a redirect or 403.
- **Worker job not excluding demo**: Add `.neq('id', process.env.DEMO_USER_ID)` to the user query, or check `subscription_status !== 'trialing'` (demo is `active`).
- **Stale hardcoded brief**: Update the relevant constant in `src/lib/demo.ts`.

After fixing, remind the user to run `npm run seed:demo` locally if seed data changed.
