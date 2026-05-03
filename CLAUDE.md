@AGENTS.md

## Commit and Deploy Rule

After every code change, immediately commit and push to GitHub. Railway auto-deploys on push — a push equals production. Never leave changes uncommitted at the end of a response. Always confirm with `git log --oneline -3` after pushing so the user can see what went out.

## Supabase Client Rules

Two clients exist — use the right one:

**`createClient()` from `@/lib/supabase/server`** — Any API route that calls `requireAuth` first. Uses cookies, respects RLS. This is the default for all user-facing routes.

**Admin client (inline `createSupabaseClient` with service role key)** — Webhook handlers and server jobs running without a user session. Bypasses RLS entirely. Only in `src/app/api/webhooks/` or equivalent background-only code. Never in user-facing routes.

Admin pattern (see `src/app/api/webhooks/stripe/route.ts`):
```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
```

Using service role key in a user-facing route is a critical security bug — a compromised session could bypass all RLS.

## Auth Enforcement Rule

Every file under `src/app/api/` except `src/app/api/webhooks/` must import and call `requireAuth` at the top of its handler. Run `scripts/check-auth.sh` to verify. The pre-commit hook runs `tsc --noEmit` and checks for em dashes in source files automatically.
