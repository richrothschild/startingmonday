# Codebase Guide

How the code is organized and the patterns you must follow.

---

## Repository Structure

```
startingmonday/
  src/
    app/                   Next.js App Router pages and API routes
      (auth)/              Login, signup routes (route group, not in URL)
      (dashboard)/         Authenticated dashboard pages
      api/                 All API routes — ~35 endpoints
      blog/                Blog posts (static, one folder per post)
      for-*/               Persona landing pages (for-cio, for-vp, etc.)
    components/            Shared React components
    lib/                   Utilities, clients, helpers
      supabase/            Supabase client factories (server vs browser)
      prompts.ts           All AI prompts in one file
      schemas.ts           Zod validation schemas
      plans.ts             Subscription plan definitions
      stripe.ts            Stripe helpers
  worker/                  Background job service (Node.js, separate Railway service)
  docs/                    All documentation
  scripts/                 One-off admin scripts, the pagespeed check
  supabase/migrations/     Database migrations (25 applied)
  public/                  Static assets, robots.txt, sitemap
  CLAUDE.md               Claude Code instructions (auto-loaded)
```

---

## The Two Supabase Clients

This is the most important rule in the codebase. Get it wrong and you either have a security bug or broken auth.

**Server client** — use this in every user-facing API route:
```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```
Uses cookies, respects Row Level Security, scoped to the authenticated user.

**Admin client** — use this only in webhook handlers and background jobs:
```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
```
Bypasses RLS entirely. Never use in user-facing routes.

See `src/app/api/webhooks/stripe/route.ts` for the canonical admin pattern.

---

## Auth Enforcement

Every file in `src/app/api/` except `src/app/api/webhooks/` must call `requireAuth` at the top of its handler:

```typescript
import { requireAuth } from '@/lib/require-auth'

export async function POST(request: Request) {
  const user = await requireAuth(request)
  // user.id is the authenticated user's Supabase UUID
  // ...
}
```

Run `npm run check:auth` to verify all routes are covered. The pre-commit hook does not check this automatically, so run it manually when adding routes.

---

## API Route Pattern

```typescript
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await requireAuth(request)
  const supabase = await createClient()
  const body = await request.json()

  // validate body (Zod schemas in lib/schemas.ts)
  // business logic
  // return NextResponse.json(result)
}
```

Errors: return `NextResponse.json({ error: 'message' }, { status: 400 })`.

---

## AI Calls

All Claude calls go through `@anthropic-ai/sdk`. Prompts live in `src/lib/prompts.ts`. Models:

- `claude-opus-4-7` — Search Strategy Brief only (expensive, slow, one per user)
- `claude-sonnet-4-6` — Prep briefs, resume tailoring, outreach, chat (default)
- `claude-haiku-4-5-20251001` — Classification, short tasks (fast, cheap)

Streaming responses: use `createStreamableText()` from `ai` and return a `StreamingTextResponse`. See `src/app/api/briefing/route.ts` for the canonical streaming pattern.

Rate limiting: `src/lib/ai-limits.ts` and `src/lib/burst-limit.ts` handle per-user limits. Always apply limits to AI routes.

---

## Subscription / Feature Access

Gate features by plan tier:

```typescript
import { requireFeatureAccess } from '@/lib/require-feature-access'
await requireFeatureAccess(user, 'prep_brief')  // throws if user can't access
```

Feature → plan mapping is in `src/lib/plans.ts`. When adding a new feature, add it here first.

---

## Database Migrations

New columns or tables go in a new migration file:

```bash
# create migration
supabase migration new my-feature-name

# apply locally (if running local Supabase)
supabase db push

# for production: migrations are applied via the Supabase dashboard
# or by running: supabase db push --linked
```

Every table that holds user data must have RLS policies. See existing migrations for the pattern. Always add `user_id uuid references auth.users not null` with an RLS policy `user_id = auth.uid()`.

---

## Component Patterns

Components are in `src/components/`. Most are server-compatible (no `'use client'`). Client components must have `'use client'` at the top.

Styling is Tailwind CSS only — no CSS modules, no styled-components. Font sizes in custom pixel values (`text-[13px]`), not Tailwind named scale (`text-sm`).

No component library (no shadcn, no Radix). Build from primitives. This keeps bundle size down and gives full control over accessibility.

---

## Blog Posts

Each blog post is a page under `src/app/blog/[slug]/page.tsx`. The metadata (title, description, date, keywords) lives in `src/lib/blog-posts.ts` in the `BLOG_POSTS` array. The `BlogPost` layout component handles nav, header, CTA, and footer.

To add a post:
1. Add an entry to `BLOG_POSTS` in `src/lib/blog-posts.ts` (no em dashes in strings)
2. Create `src/app/blog/[slug]/page.tsx` using the `BlogPost` component

---

## Pre-Commit Hook

Lives in `.githooks/pre-commit`. Runs two checks:
1. `tsc --noEmit` — TypeScript must compile with zero errors
2. Em dash grep — no literal `—` character in source files; use `&mdash;` in JSX or reword

If either fails, the commit is blocked. Fix the issue before re-committing. Never bypass with `--no-verify`.

---

## Worker

The `worker/` directory is a separate Node.js service. It runs scheduled jobs (cron-based) and one triggered job (immediate scan on company add). It communicates with the web app via internal HTTP.

Key files:
- `worker/index.js` — entry point, cron definitions
- `worker/jobs/` — individual job implementations

When adding a new scheduled job, add it to `worker/index.js` and document it in `docs/architecture.md`.

---

## Useful Patterns to Know

**Streaming AI response** — see `src/app/api/prep/route.ts`  
**Webhook handling (idempotent)** — see `src/app/api/webhooks/stripe/route.ts`  
**Feature gating by plan** — see `src/lib/require-feature-access.ts`  
**Blog post** — see `src/app/blog/how-cios-find-jobs/page.tsx`  
**Landing page variant** — see `src/app/for-cio/page.tsx`  
**Supabase admin pattern** — see `src/app/api/webhooks/stripe/route.ts`
