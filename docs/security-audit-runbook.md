# Security Audit Runbook — Starting Monday

Use this document to run a full security audit. Work through each area in order. Areas 1 and 2 have the highest historical finding rate for this codebase.

First audit completed: May 12, 2026. Findings documented in `docs/security-audit-findings-2026-05.md`.

---

## Before You Start

**Tools needed:** grep, Read, the migration SQL files under `supabase/migrations/`

**What this runbook covers:**
- Area 1: API surface (auth, rate limiting, input validation, admin client misuse)
- Area 2: Supabase RLS (table-level access control)
- Area 3: AI prompt security (injection, PII, output sanitization)
- Area 4: Third-party integrations (Stripe, Make.com, Resend, tokens)
- Area 5: Headers and infrastructure (CSP, secrets, CORS)

**What this runbook does NOT cover:**
- Dependency vulnerabilities — run `npm audit` separately
- Secrets in git history — run `git log -S "SECRET"` or use truffleHog
- Live database state — compare migration diffs to Supabase dashboard manually

---

## Area 1: API Surface

### Step 1 — Map auth coverage

Run these three greps and compare the results:

```bash
# All API route files
find src/app/api -name "route.ts"

# Routes that have an auth guard
grep -rl "requireAuth\|requireFeatureAccess\|requirePrepAccess\|getStaffMember\|validateCronRequest" src/app/api

# Routes that use Anthropic (AI spend risk)
grep -rl "anthropic\.\|MODELS\." src/app/api
```

**What to check:**
- Any file in the first list that is NOT in the second list — is it intentionally public? (Health checks, demo pages, webhooks, unsubscribe links are OK. Anything that reads or writes user data is not.)
- Any file in the third list that is NOT in the second list — it calls AI without a rate limit guard

**Known intentionally-public routes:**
- `api/health`, `api/admin/health` — uptime checks
- `api/demo-brief`, `api/demo-brief/manager-tools` — anonymous demos
- `api/demo-email` — has its own rate limit
- `api/drip/unsubscribe` — email unsubscribe link
- `api/concierge-waitlist`, `api/partners` — public intake forms
- `api/track/open` — email pixel tracking
- `api/webhooks/stripe` — Stripe signature verification
- `api/notify/new-user` — known gap (see findings)

### Step 2 — Check rate limiting on AI routes

```bash
# Routes with any rate limiting
grep -rl "checkRateLimit\|checkBurstLimit\|isRateLimited" src/app/api

# Routes using requireFeatureAccess (includes burst + monthly cap)
grep -rl "requireFeatureAccess" src/app/api

# Routes using requirePrepAccess (includes burst + monthly cap)
grep -rl "requirePrepAccess" src/app/api
```

Any AI route not covered by `requireFeatureAccess`, `requirePrepAccess`, or a direct `isRateLimited` call is unprotected. Check those files individually.

### Step 3 — Check for admin client on user-facing writes

```bash
grep -rl "createAdminClient" src/app/api
```

For each file, verify:
1. Is this route user-facing or admin/cron-only?
2. If user-facing, is the write scoped with `.eq('user_id', userId)`?
3. Could this write be done with the user's own Supabase client instead?

**Legitimate uses of admin client on user-facing routes:**
- Coach dashboard reading clients' data (cross-user read by design)
- Billing checkout reading partner seat counts (cross-table read)
- Attribution recording (linking user to partner record)

**Suspicious pattern:** user-facing route + admin client + write without `userId` scoping.

### Step 4 — Check for IDOR on parametric routes

```bash
find src/app/api -path "*\[id\]*" -name "route.ts"
```

For each route, verify every DB query includes `.eq('user_id', userId)` or `.eq('id', resourceId).eq('user_id', userId)`. No query should select by resource ID alone.

### Step 5 — Check input validation depth

For any route accepting a `request.json()` body, verify:
- String fields have a `.slice(0, N)` length cap before being passed to AI or stored
- Numeric fields are validated for range, not just type
- Enum/controlled-value fields check against an allowlist (not just fallback to default)

**Highest-risk pattern:** large user-provided text + no length cap + passed directly to Anthropic

---

## Area 2: Supabase RLS

### Step 1 — Get full table list

```bash
# All tables in migration files
grep -rh "^create table\|^CREATE TABLE" supabase/migrations/*.sql -i | grep -v "if not exists" | sort
```

Cross-reference against `src/lib/supabase/database.types.ts` to ensure the types list matches the actual table list.

### Step 2 — Get RLS-enabled tables

```bash
grep -rh "enable row level security" supabase/migrations/*.sql -i | sort | uniq
```

Compare to the full table list. Any table not in this output has RLS disabled.

### Step 3 — Classify unprotected tables

For each table without RLS, answer:
1. **Is it ever queried from a user-facing route using the user's JWT (not admin client)?** If yes: critical — any authenticated user can read/write all rows.
2. **Does it contain sensitive data?** (user PII, access control, financial data, unpublished content)
3. **Does it control access or permissions?** If yes: privilege escalation risk — any user can INSERT their own record

**Highest-risk pattern:** table controls access + no RLS = privilege escalation

**Template fix for any sensitive table:**
```sql
alter table public.table_name enable row level security;

-- For user-owned tables:
create policy "table_name_own" on public.table_name
  for all using (auth.uid() = user_id);

-- For admin-only tables (no user access):
create policy "table_name_admin_only" on public.table_name
  for all using (false); -- blocks all direct access; admin client bypasses RLS
```

### Step 4 — Verify policy completeness

```bash
grep -rh "CREATE POLICY\|create policy" supabase/migrations/*.sql | sort | uniq
```

For tables with RLS enabled, confirm policies cover all operations needed (SELECT, INSERT, UPDATE, DELETE). A table with RLS enabled but no policies denies all access by default — check that the app still works for those tables.

### Step 5 — Check for overly permissive policies

Look for policies using `using (true)` or `with check (true)` without a condition. These effectively disable RLS for that operation.

---

## Area 3: AI Prompt Security

### Step 1 — Find all Anthropic calls

```bash
grep -rn "anthropic\.messages\|anthropic\.messages\.stream" src/ --include="*.ts" | grep -v "__tests__" | grep -v "node_modules"
```

### Step 2 — Check each for prompt injection risk

For each call, look at what user-controlled data is interpolated into the prompt:
- Is it scoped to the requesting user's data only? (Safe — they can only affect themselves)
- Does any prompt include data from other users? (Cross-user injection risk)
- Does the model have tools that write to the database? (Check `chat/route.ts` — tool calls are scoped to userId ✅)

**Safe pattern:** user data → AI → response affects only that user's own records
**Risky pattern:** user data → AI → tool writes to another user's records

### Step 3 — Check input size limits

For any field that gets interpolated into an AI prompt, verify a max length is enforced before the API call. No unbounded strings. Typical safe limits: 500 chars for titles/names, 10,000 chars for resume text, 50,000 chars for full context.

### Step 4 — Check output rendering

```bash
grep -rn "dangerouslySetInnerHTML" src/ --include="*.tsx"
```

For each instance, verify the content is either:
- Escaped with `escapeHtml()` before insertion, or
- Sanitized with DOMPurify (already applied to briefing output from Fix 3)

---

## Area 4: Third-Party Integrations

### Stripe

- Webhook handler at `src/app/api/webhooks/stripe/route.ts`
- Verify: `constructEvent()` called with `STRIPE_WEBHOOK_SECRET` ✅
- Verify: idempotency via `processed_stripe_events` ✅
- Verify: errors go to Sentry, not `console.error` (Fix 1 in tech-debt-round2.md)

### Make.com

- Outbound calls in `api/admin/social/morning` and `api/admin/social/[id]/schedule`
- URL comes from `MAKE_WEBHOOK_URL` env var ✅
- No inbound Make.com callbacks — no attack surface on this side
- Verify the Make.com URL is rotated if it's ever exposed

### Email (Resend)

```bash
grep -rn "sendEmail\|html:" src/app/api --include="*.ts" | grep -v "__tests__"
```

For any route that builds HTML email from user-supplied input, verify `escHtml()` is applied to all interpolated values before sending.

### Unsubscribe / tracking tokens

- `drip/unsubscribe`: token is `base64url(userId)` — not signed. Mitigate by switching to HMAC-SHA256 with `UNSUBSCRIBE_SECRET` env var
- `track/open`: pixel token is unsigned base64 JSON — intentional (analytics only, not authentication)
- `invite/[code]`: if invite tokens are used for access control, verify they are random enough to be unguessable

---

## Area 5: Headers and Infrastructure

### Step 1 — Check security headers

Read `next.config.ts` and verify all of the following are set:

| Header | Expected value |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera, mic, geolocation disabled |
| `Content-Security-Policy` | present, restricts script/style/connect sources |

**Nice-to-have (not blocking):**
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- CSP `report-to` endpoint wired to Sentry

### Step 2 — Check for env var leakage

```bash
# Anything with NEXT_PUBLIC_ prefix is sent to the browser
grep -rn "NEXT_PUBLIC_" src/ --include="*.ts" --include="*.tsx" | grep -v "SUPABASE_URL\|ANON_KEY\|APP_URL\|POSTHOG"
```

Any env var prefixed `NEXT_PUBLIC_` is exposed to all browsers. Verify no secrets (API keys, service role keys, webhook secrets) are prefixed `NEXT_PUBLIC_`.

### Step 3 — Verify secret env vars are in Railway, not committed

```bash
# Check .env.local is gitignored
grep ".env.local" .gitignore

# Check no .env files with secrets are tracked
git ls-files | grep "\.env"
```

### Step 4 — Check Railway service isolation

Confirm the worker service and web service do not share environment variables they shouldn't. Worker has `WORKER_SECRET` — verify the web app only uses it to call the worker, not to receive calls.

---

## Scoring Guide

After each audit, score each table and each route group:

| Score | Meaning |
|---|---|
| ✅ Clean | No findings |
| ⚠️ Low | Informational / defense in depth |
| 🟡 Medium | Should fix before next user growth milestone |
| 🔴 High | Fix before next release |
| 🚨 Critical | Fix immediately, do not wait for release |

---

## Fixes Applied From First Audit (May 2026)

This section tracks what was found and fixed so future audits know the baseline.

| ID | Finding | Status |
|---|---|---|
| A2-1 | `staff_members` no RLS — privilege escalation | **Fixed** — migration 082 |
| A2-2 | `social_posts` no RLS | **Fixed** — migration 083 |
| A2-3 | `partners` no RLS | **Fixed** — migration 083 |
| A2-4 | `referral_attributions` no RLS | **Fixed** — migration 083 |
| A1-1 | 9 AI routes no rate limiting (audit originally counted 4) | **Fixed** — commit 0f4a8ab |
| A1-2 | Unbounded resume input to Anthropic | **Fixed** — commit 0f4a8ab |
| A2-5 | `testimonials` no RLS | **Fixed** — migration 083 |
| A2-6 | `rate_limits` no RLS | **Fixed** — migration 083 |
| A1-3 | Unsigned unsubscribe tokens | **Fixed** — commit 0f4a8ab; `UNSUBSCRIBE_SECRET` set in Railway |
| A1-4 | `feedback` no rate limit or attribution | **Fixed** — commit 0823319; migration 084 |
| A1-5 | Forged pixel open events | **Fixed** — commit 0823319; UUID format validation in parsePixelToken |
| A5-1 | No CSP `report-to` directive | **Fixed** — commit 0823319; derived from SENTRY_DSN at startup |
| A5-2 | Missing COOP/CORP headers | **Fixed** — commit 0f4a8ab |

Update this table as fixes land. Reference the finding ID in your commit message.
