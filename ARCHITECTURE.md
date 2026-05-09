# Starting Monday — Architecture

> Written for engineers doing technical due diligence. Covers the system topology,
> data model, auth/billing, AI integration, and operational setup.

---

## System Topology

```
Browser
  │
  ├── Next.js 15 App (Railway)          src/app/
  │     ├── Dashboard (RSC)             (dashboard)/dashboard/
  │     ├── API routes                  api/
  │     └── Middleware                  middleware.ts
  │
  ├── Supabase                          managed Postgres + Auth + RLS
  │
  ├── Worker (Node.js cron, Railway)    worker/
  │     ├── signal-job                  company intelligence scan
  │     ├── briefing-job               daily email digest
  │     ├── followup-job               follow-up reminder emails
  │     ├── scan-job                   pipeline momentum scoring
  │     └── activation-reminder-job    onboarding nudges
  │
  └── External APIs
        ├── Anthropic (Claude)          AI classification, prep briefs, synthesis
        ├── Stripe                      subscription billing
        ├── Resend                      transactional email
        ├── SEC EDGAR                   8-K filing ingestion
        ├── Google News RSS             company news
        ├── Crunchbase                  funding round data
        └── PDL (People Data Labs)      executive roster snapshots
```

---

## Data Model (key tables)

All user-facing tables have Row Level Security enabled. Service-role clients
(used by the worker and admin routes) bypass RLS.

| Table | Purpose | RLS scope |
|-------|---------|-----------|
| `users` | Auth mirror + subscription state | `id = auth.uid()` |
| `user_profiles` | Career details, preferences, resume | `user_id = auth.uid()` |
| `companies` | User's target company pipeline | `user_id = auth.uid()` |
| `company_signals` | Intelligence signals per company | `user_id = auth.uid()` |
| `exec_snapshots` | Exec roster snapshots for diff | `user_id = auth.uid()` |
| `contacts` | Recruiter and network contacts | `user_id = auth.uid()` |
| `follow_ups` | Scheduled actions | `user_id = auth.uid()` |
| `conversations` | AI chat history | `user_id = auth.uid()` |
| `offers` | Job offer tracking | `user_id = auth.uid()` |
| `company_interview_logs` | Interview notes per company | `user_id = auth.uid()` |
| `llm_traces` | AI usage audit log | service role only |
| `processed_stripe_events` | Stripe webhook idempotency | service role only |
| `sec_filings` | SEC 8-K filing index | service role only |
| `partner_inquiries` | B2B partnership leads | service role only |

Migration files live in `supabase/migrations/` (sequential `NNN_name.sql` format).
Apply new migrations in the Supabase SQL Editor or via `scripts/migrate.sh`.

---

## Authentication & Session

- **Provider**: Supabase Auth (email/password + magic link)
- **Session**: JWT stored as HttpOnly cookie, refreshed by middleware on every dashboard request
- **API routes**: `requireAuth()` in `src/lib/require-auth.ts` validates the session via `supabase.auth.getUser()` and returns `{ ok, userId }` or a 401 response
- **Middleware** (`src/middleware.ts`): refreshes session cookies for `/dashboard/**`; API routes return early without refresh (the cookie is valid for 1 hour)

---

## Subscription & Feature Gating

Tiers (stored in `users.subscription_tier`): `free → passive → active → executive`

Feature access is defined in `src/lib/subscription.ts` as a `FEATURE_TIERS` map:

```
scan            passive+
ai_chat         active+
prep_brief      active+
daily_scan      executive only
salary_intel    executive only
```

Every AI API route calls `canAccessFeature(sub, 'feature_name')` before processing.
Stripe webhook (`api/webhooks/stripe/route.ts`) updates `subscription_tier` on checkout
and subscription events. The `plan` metadata field is validated against a known allowlist
before any DB write.

Billing is managed via `src/lib/stripe.ts`. Checkout sessions are created at
`api/billing/checkout/route.ts`.

---

## AI Integration

All Claude calls go through a single Anthropic client instance at `src/lib/anthropic.ts`.
Model constants (`MODELS.sonnet`, `MODELS.haiku`) are defined there and used everywhere.

Two rate-limit layers:
1. **Burst limit** (`src/lib/burst-limit.ts`): in-memory sliding window, 10 req/min per user/IP. Fast; guards against rapid-fire abuse.
2. **Monthly limit** (`src/lib/api-usage.ts`): DB-backed token counter, checked via `isRateLimited()`. Prevents runaway consumption.

AI usage is traced to `llm_traces` via `src/lib/trace.ts` (model, tokens, latency, feature, input/output snapshots).

---

## Worker

The worker is a standalone Node.js process (`worker/index.js`) running on Railway as a
separate service. It uses the Supabase service-role key and runs on cron intervals.

**Jobs and cadence:**

| Job | Interval | What it does |
|-----|----------|-------------|
| `signal-job` | Every 4h | Fetches Google News, press rooms, SEC 8-Ks, PR wire, Crunchbase, and PDL exec snapshots for all active users' pipeline companies. Classifies via Claude Haiku. Writes to `company_signals`. |
| `briefing-job` | Daily 6am UTC | Compiles top signals into a daily email digest per user. |
| `scan-job` | Daily | Recalculates momentum scores for pipeline companies. |
| `followup-job` | Daily | Emails users with overdue follow-up actions. |
| `activation-reminder-job` | Daily | Nudges new users who haven't completed onboarding. |

Jobs use Postgres advisory locks to prevent concurrent execution across Railway restarts.
Errors are captured to Sentry. SIGTERM is handled gracefully (waits for the current job to finish).

---

## Security Posture

- **RLS**: All user-facing tables; admin tables default-deny to non-service-role clients
- **Auth**: Every mutation API route calls `requireAuth()` or `requireFeatureAccess()`
- **XSS**: All user-controlled values in HTML email templates pass through `esc()`/`escHtml()`
- **SSRF**: User-supplied URLs validated via `isAllowedJobUrl()` before fetch (blocks RFC-1918, loopback, metadata endpoints)
- **Stripe**: Webhook signature verified via `stripe.webhooks.constructEvent()`; `plan` metadata validated against allowlist before DB write
- **Input validation**: Zod schemas on structured AI endpoints; field length caps on free-text inputs sent to Claude

Automated checks:
- `tsc --noEmit` and em-dash check run as git pre-commit hooks
- Semgrep custom rules (`.semgrep.yml`) run on every CI push/PR
- Weekly GitHub Actions job checks RLS coverage and auth guard presence on all API routes

---

## Key Files for Reviewers

| File | What it tells you |
|------|------------------|
| `src/lib/subscription.ts` | Feature gating logic and tier hierarchy |
| `src/lib/require-auth.ts` | Auth pattern used across all API routes |
| `src/lib/anthropic.ts` | Single Anthropic client; model config |
| `src/lib/trace.ts` | AI usage auditing |
| `worker/jobs/signal-job.js` | Core intelligence pipeline |
| `supabase/migrations/001_initial_schema.sql` | Full data model with RLS policies |
| `.github/workflows/ci.yml` | CI pipeline (typecheck, tests, Semgrep) |
| `.github/workflows/security-weekly.yml` | Weekly RLS and auth coverage checks |

---

## Local Development

```bash
cp .env.example .env.local   # fill in Supabase + Stripe + Anthropic keys
npm install
npm run dev                  # Next.js on :3000

cd worker
npm install
node index.js                # worker (runs all jobs once then exits in dev mode)
```

Environment variables required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`.
