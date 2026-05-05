# Starting Monday — System Architecture

**startingmonday.app** | Last updated: May 2026

---

## Overview

Starting Monday is a Next.js 16 application deployed on Railway, backed by Supabase for data and auth, Stripe for billing, Anthropic Claude for AI, Resend for email delivery, and Browserless for career page scanning. The system runs as two Railway services: a web application (user-facing) and a worker (background jobs).

---

## Infrastructure Map

```
┌─────────────────────────────────────────────────────────────┐
│                         Railway                              │
│                                                             │
│  ┌─────────────────────────┐   ┌─────────────────────────┐  │
│  │   Web Service (Next.js) │   │   Worker Service (Node) │  │
│  │   startingmonday.app    │   │   Internal HTTP + cron  │  │
│  │   Build: nixpacks       │   │   jobs                  │  │
│  │   Health: /api/health   │   │                         │  │
│  └────────────┬────────────┘   └────────────┬────────────┘  │
│               │                              │               │
└───────────────┼──────────────────────────────┼───────────────┘
                │                              │
       ┌────────▼──────────────────────────────▼────────┐
       │                  External Services              │
       │                                                 │
       │  Supabase     Anthropic    Stripe    Resend      │
       │  (DB + Auth)  (Claude AI)  (Billing) (Email)    │
       │                                                 │
       │  Browserless  PostHog      Sentry               │
       │  (Scanning)   (Analytics)  (Errors)             │
       └─────────────────────────────────────────────────┘
```

---

## Web Service (Next.js 16.2 — App Router)

**Runtime**: Node.js >=20.9.0, deployed on Railway via nixpacks.

**Build**: `npm run build` / **Start**: `npm run start`

**Key configuration**:
- Security headers on all responses: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy
- Server-only packages: `pdf-parse`, `mammoth` (PDF and Word document parsing)
- Sentry error capture on both client and server runtimes
- Health check endpoint: `GET /api/health` (returns uptime, timestamp, version)

**Request middleware** (`src/middleware.ts`):
- Logs all API requests (JSON: timestamp, method, path, IP) except `/api/health`
- Extracts client IP from `cf-connecting-ip` → `x-real-ip` → `x-forwarded-for`

---

## Worker Service (Node.js)

A separate Railway service that runs scheduled jobs and handles background processing. Communicates with the web service via HTTP using a shared secret.

**Cron Schedule**:

| Job | Schedule (UTC) | Purpose |
|-----|---------------|---------|
| Scan job | Mon/Wed/Fri 08:00 | Career page scanning via Browserless |
| Signal job | Mon/Wed/Fri 08:30 | Company intelligence monitoring |
| Briefing job | Every 5 min | Sends briefings per user timezone |
| Follow-up reminders | Daily 06:00 | Nudges for pending action items |
| Momentum score | Sunday 23:00 | Weekly engagement score calculation |
| Weekly report | Sunday 23:30 | Weekly digest email |
| Usage monitor | Daily 09:00 | Token usage tracking |
| Trial reminders | Daily 10:00 | T-3 and T-0 trial expiration emails |

**AI Models in Worker**:
- `claude-sonnet-4-6` (SONNET): briefing assembly, signal classification
- `claude-haiku-4-5-20251001` (HAIKU): lightweight classification tasks

---

## Database (Supabase / PostgreSQL)

**Auth**: Supabase Auth (email/password). Row Level Security (RLS) enforced on all user-facing tables — every query is scoped to the authenticated user's ID.

### Schema

| Table | Purpose |
|-------|---------|
| `users` | Accounts, Stripe customer ID, subscription tier/status, trial end, period end |
| `user_profiles` | Resume text/JSON, target titles, target sectors, locations, positioning, briefing preferences |
| `companies` | Pipeline companies: stage, career page URL, sector, fit score, scan threshold, archived state |
| `scan_results` | Career page scan output: raw role hits (JSONB), AI score, AI summary, notification state |
| `contacts` | Contacts at target companies: title, firm, channel, follow-up date, status |
| `follow_ups` | Action items: due date, action text, status (pending/done/snoozed) |
| `conversations` | AI chat history: messages as JSONB, token count |
| `drafts` | Generated email/cover letter/LinkedIn drafts |
| `company_signals` | Intelligence signals: funding, exec hire/departure, acquisition, expansion, layoffs, IPO, new product |
| `briefs` | Brief generation logs: type, output text, user rating |
| `momentum_scores` | Weekly engagement score (0–100) with component breakdown |
| `pipeline_audit_log` | Full change log: old/new values, initiator (user/worker/system) |
| `api_usage` | Token and request counts by user, service, and month (rate limiting) |
| `processed_stripe_events` | Stripe webhook idempotency (unique constraint on event_id) |

**19 migrations** applied from initial schema through search persona support (migration 019).

---

## Auth Architecture

**Flow**: Supabase Auth (JWT-based). Tokens stored in cookies via `@supabase/ssr`.

**Route guards**:
- `requireAuth(request)` — validates JWT, returns `{ ok: true, userId }` or `{ ok: false, response: 401 }`
- `requireFeatureAccess(request, feature)` — chains: auth → subscription tier check → monthly rate limit check. Returns `{ ok: true, userId, supabase }` or error response (401/402/429).

**Subscription tiers**: `free | passive | active | executive | campaign`
**Subscription statuses**: `inactive | trialing | active | paused | past_due | canceled`

---

## AI (Anthropic Claude)

**Models**:
| Model | ID | Usage |
|-------|----|-------|
| Opus | `claude-opus-4-7` | Search strategy brief generation |
| Sonnet | `claude-sonnet-4-6` | Prep briefs, chat, outreach drafts, resume tailoring |
| Haiku | `claude-haiku-4-5-20251001` | Signal classification, lightweight extraction |

**Temperature presets** (matched to task type):
- 0.1 — extraction/classification
- 0.2 — structured output (strategy, resume tailor)
- 0.3 — analytical (prep, Q&A)
- 0.4 — factual (briefing, suggestions)
- 0.5 — conversational (chat)
- 0.7 — creative (outreach drafts)

**Context limits**:
- Resume: 6,000 chars (`RESUME_CHARS`)
- Documents (JD, annual report, etc.): 4,000 chars each (`DOC_CHARS`)

**Streaming**: All major AI routes stream `text/event-stream` responses. Errors are written as `__ERROR__<message>` sentinel strings and caught by the client.

**Chat tool use**: The AI chat route uses Anthropic tool use to give the assistant ability to: update company pipeline stage, add follow-up reminders, and update company notes — directly from conversation.

---

## Billing (Stripe)

**Integration**: Stripe SDK v22. Server-side only (secret key never exposed to client).

**Flows**:
- **Checkout**: `POST /api/billing/checkout` — creates Stripe Checkout session with `userId` and `plan` in metadata
- **Portal**: `POST /api/billing/portal` — creates Stripe Customer Portal session
- **Pause/Resume**: `POST /api/billing/pause` and `/api/billing/resume`

**Webhook** (`POST /api/webhooks/stripe`):
- Verified via `stripe-signature` header and `STRIPE_WEBHOOK_SECRET`
- Idempotent: every processed event recorded in `processed_stripe_events`; duplicates return 200 immediately
- Handles: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `customer.deleted`
- Payment failure triggers both a DB update and a notification email to the user

**Status mapping**: `mapStripeStatus(stripeStatus, pauseCollection)` normalizes Stripe statuses to internal `AppSubscriptionStatus` type. `pause_collection.behavior` presence takes precedence over all Stripe statuses.

---

## Email (Resend)

**Sender**: `briefing@startingmonday.app`

**Email types**:
- Daily/weekly briefing (assembled by worker, HTML format)
- Trial expiration warnings (T-3 days, T-0)
- Payment failure notification (with billing link)
- Team invite
- Signal notifications

---

## Career Page Scanning (Browserless)

Worker calls Browserless API to fetch and parse target company career pages. Results stored in `scan_results` as JSONB `raw_hits`, then scored and summarized by Claude. Users are notified when a matching role is detected above their configured `alert_threshold`.

---

## Monitoring & Observability

| Tool | Purpose |
|------|---------|
| **Sentry** | Error tracking (client + server). Initialized via `instrumentation.ts` on Next.js startup. DSN configured per environment. |
| **UptimeRobot** | External uptime monitoring on `/api/health`. Checks every 5 minutes. |
| **Railway logs** | Stdout JSON request logs from middleware. All API calls logged with method, path, IP, timestamp. |
| **PostHog** | Client-side product analytics (page views, feature usage). |

---

## Environment Variables

| Variable | Service | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Web + Worker | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Web | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Web + Worker | Admin DB access (bypass RLS) |
| `ANTHROPIC_API_KEY` | Web + Worker | Claude API access |
| `BROWSERLESS_API_KEY` | Worker | Career page scanning |
| `RESEND_API_KEY` | Web + Worker | Email delivery |
| `RESEND_FROM_ADDRESS` | Web + Worker | Sending address |
| `STRIPE_SECRET_KEY` | Web | Stripe server API |
| `STRIPE_WEBHOOK_SECRET` | Web | Webhook signature verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Web | Stripe client-side |
| `NEXT_PUBLIC_SENTRY_DSN` | Web (client) | Sentry error tracking |
| `SENTRY_DSN` | Web (server) | Sentry error tracking |
| `NEXT_PUBLIC_APP_URL` | Web | Canonical URL for links |
| `WORKER_URL` | Web | Worker service base URL |
| `WORKER_SECRET` | Web + Worker | Worker authentication |

---

## Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.4 |
| UI | React | 19.2.4 |
| Language | TypeScript | — |
| Database | Supabase / PostgreSQL | — |
| Auth | Supabase Auth | — |
| AI | Anthropic Claude | SDK 0.91.1 |
| Billing | Stripe | SDK 22.1.0 |
| Email | Resend | SDK 6.12.2 |
| Deployment | Railway | — |
| Error Tracking | Sentry | SDK 10.51.0 |
| Analytics | PostHog | SDK 1.372.8 |
| PDF Parsing | pdf-parse | 2.4.5 |
| Word Parsing | mammoth | 1.12.0 |
| Doc Generation | docx | 9.6.1 |
| Testing | Vitest | 4.1.5 |
