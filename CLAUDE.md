@AGENTS.md

## Project Overview

Starting Monday is an AI-powered executive job search platform for C-suite and VP-level candidates (CIO, CTO, CISO, CDO, etc.). It helps users build target company lists, track outreach, prepare for interviews, and manage their job search pipeline.

**Tech stack:** Next.js 16 (App Router), React 19, TypeScript 5, Supabase (Postgres + Auth + RLS), Stripe, Resend (email), Railway (hosting), Doppler (secrets), Sentry, Anthropic SDK.

---

## People

| Person | Role | GitHub | Email |
|--------|------|--------|-------|
| Rich Rothschild | Founder / Product | `richrothschild` | richard@startingmonday.app |
| Mike (Chris) Goodwin | Developer (you) | `68Commando-stack` | chriskgoodwin@gmail.com |

Rich has owner/write access on GitHub. He reviews and merges PRs. Always request Rich as reviewer on PRs.

---

## Environments & URLs

| Environment | URL | Deployed from |
|-------------|-----|---------------|
| Production | https://startingmonday.app | `main` branch (auto-deploy via Railway) |
| Staging | https://startingmonday-staging.up.railway.app *(verify URL)* | `main` branch (Railway) |
| Local dev | http://localhost:3000 | `doppler run -- npm run dev` |

**Railway auto-deploys on every push to `main`.** A push = production. Never leave changes uncommitted at end of a response (per Commit and Deploy Rule below).

Railway environments (from deployment API):
- `steadfast-reprieve / production`
- `startingmonday-worker / production`
- `blissful-upliftment / production`
- `ample-blessing / production`

---

## Credentials — All in Doppler

**Never hardcode secrets. Always use `doppler run --` to run scripts that need env vars.**

Doppler project: `startingmonday`, config: `dev` (local), `prd` (production).

Key env var names (values live in Doppler only):

| Variable | What it is |
|----------|-----------|
| `ANTHROPIC_API_KEY` | Claude API key |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://mytnhoxcgvnzxhgcumkf.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (admin only — see rules below) |
| `STRIPE_SECRET_KEY` | Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key |
| `RESEND_API_KEY` | Email sending |
| `JIRA_DOMAIN` | `ckoodwin.atlassian.net` |
| `JIRA_EMAIL` | `chriskgoodwin@gmail.com` |
| `JIRA_API_TOKEN` | Jira REST API token (rotated May 2026) |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Error tracking |
| `BROWSERLESS_API_KEY` | Headless browser |
| `TURNSTILE_SECRET_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile |
| `PLAYWRIGHT_TEST_EMAIL` / `PLAYWRIGHT_TEST_PASSWORD` | E2E test credentials |

---

## Daily Session Workflow

**One session per day, one branch per day.** This prevents commits landing on the wrong branch and keeps context manageable.

**Daily routine:**
1. Start a fresh Claude Code session each morning (don't resume yesterday's)
2. Use this bootstrap prompt at the start of every session:
   ```
   Project: C:\Dev\StartingMonday
   Read CLAUDE.md for full project context.
   Today's tickets: SMK-XX, SMK-XX
   ```
3. Create a daily branch before writing any code:
   ```
   git checkout main && git pull origin main
   git checkout -b dev/YYYY-MM-DD
   ```
4. All work for the day goes on that branch
5. At end of day, split into per-ticket PRs if needed, or PR the whole branch

**Per-ticket PRs:** When a ticket is complete, cherry-pick its commits onto a `SMK-XX/description` branch and open a PR from there. The daily branch continues with the next ticket.

---

## GitHub

Repo: https://github.com/richrothschild/startingmonday

**Branch naming:** `SMK-XX/short-description` (uppercase `SMK-XX` — Jira requires uppercase for integration). Windows filesystem is case-insensitive, so if a branch was created lowercase, push with explicit ref: `git push origin HEAD:refs/heads/SMK-XX/description`.

**PRs:** Always request `richrothschild` as reviewer. Include Jira ticket number in PR title (e.g. `feat(SMK-13): ...`). Use `Closes SMK-XX` in PR body.

**CI checks on PRs:**
- `Predeploy gates (lint, typecheck, build, smoke)` — **Required** check. As of May 2026, PR #20 fixes the pre-existing lint errors. Once merged, CI should be green on all future PRs.
- `Playwright E2E` — passes
- `Semgrep security scan` — passes

**To bypass blocked merge:** Rich checks "Merge without waiting for requirements to be met (bypass rules)" in the PR merge panel.

---

## Jira

Project: **SMK** at https://ckoodwin.atlassian.net

**API usage:**
```bash
# Always use doppler run for Jira scripts
doppler run -- node -e "..."
# Search endpoint: /rest/api/3/search/jql (NOT deprecated /rest/api/3/search)
# Auth: Basic base64(JIRA_EMAIL:JIRA_API_TOKEN)
# Epic/parent linking: use { parent: { key: 'SMK-XX' } } field on update, not create
```

Key tickets:
- `SMK-11` — Ideas Backlog (Unscheduled) — parent epic for new ideas
- `SMK-13` — Section-level prep brief ratings (DONE, PR #19 open)
- `SMK-36` through `SMK-63` — 28 backlog ideas loaded from Rich's list (May 2026)

Jira-GitHub integration: Set up by Rich in May 2026. Branch names must include `SMK-XX` (uppercase) to appear in Jira Development panel.

---

## Supabase & Migrations

Supabase project URL: `https://mytnhoxcgvnzxhgcumkf.supabase.co`

**Migration approach — IMPORTANT:**
There is no Supabase management API access and no `supabase db push` CLI workflow. Migrations must be applied **manually** via the Supabase SQL editor at https://supabase.com/dashboard.

Workflow:
1. Write migration SQL in `supabase/migrations/NNN_description.sql`
2. Apply manually in Supabase SQL editor (both staging and prod)
3. Include migration file in the PR so it's in source control
4. Migrations are numbered sequentially. Check existing files for the next number before creating a new one.

**Current migration state (as of May 2026):**
- Migrations `001`–`106` applied to production
- `105` — added `section_name TEXT` to `briefs` and `brief_quality_log`
- `106` — added `prep_section` to `briefs_type_check` constraint (was missing, caused 500s)

**PostgREST schema cache:** After adding new columns, there may be a delay before they appear in API responses. If a new column returns null immediately after migration, wait a minute or do a cold refresh.

---

## Slack Integration

Direct REST API calls using user token stored in Doppler (key: check env for `SLACK_USER_TOKEN` or similar — was hardcoded in previous session, should be moved to Doppler).

Key channel IDs:
- Rich's DM: `D0B48VDEZ9N`
- `#all-starting-monday`: `C0B37UT271B`

```bash
# Example: send DM to Rich
curl -s -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"channel":"D0B48VDEZ9N","text":"message here"}'
```

---

## Key File Map

```
src/
  app/
    (auth)/                          # Login, signup
    (dashboard)/dashboard/
      page.tsx                       # Main pipeline dashboard
      PipelineFilter.tsx             # Search/filter bar (client component)
      companies/[id]/
        page.tsx                     # Company detail
        prep/
          page.tsx                   # Prep brief page (server)
          prep-client.tsx            # Prep brief client (all section logic here)
      contacts/                      # Contact management
      outreach/                      # Outreach tracking
      briefing/                      # Daily briefing
    settings/                        # Billing, security, team
  api/
    briefs/save/route.ts             # Save prep briefs (type: strategy|prep|prep_section|outreach)
    outreach/send/route.ts           # Send outreach emails
    webhooks/stripe/route.ts         # Stripe webhook handler (uses admin client)

supabase/migrations/                 # SQL migrations (apply manually via Supabase dashboard)
scripts/                             # Utility scripts (run with doppler run --)
docs/                                # Product docs, roadmap
```

**Key DB tables:** `companies`, `contacts`, `briefs`, `brief_quality_log`, `outreach_emails`, `users`, `subscriptions`

**`briefs.type` allowed values:** `strategy`, `prep`, `prep_section`, `outreach`
**`briefs.section_name`** — for `prep_section` type, stores which section: `background`, `leadership`, `priorities`, `challenges`, `competitive`, `wins`, `tech_stack`, `why_here`, `questions`

---

## Running Locally

```bash
# Start dev server (always use doppler for env vars)
doppler run -- npm run dev

# TypeScript check
npx tsc --noEmit

# Lint
npm run lint

# Run Jira/DB scripts
doppler run -- node -e "..."
doppler run -- npx tsx scripts/my-script.ts
```

---

## Known Issues & Gotchas

1. **Pre-existing CI lint failures on main** — `extract_pdf.js`, `probe.js`, `run_extract.js`, and several admin pages have lint errors. These fail the required "Predeploy gates" check on every PR. Not caused by our work. Fix planned separately.

2. **`/dashboard/companies` route doesn't exist** — There's no `page.tsx` at that path. The pipeline dashboard links to it but it 404s. Do not add UX/routing fixes without Rich's input on the intended design.

3. **Windows branch case sensitivity** — Git on Windows can't rename `smk-13` → `SMK-13` locally (filesystem is case-insensitive). Workaround: `git push origin HEAD:refs/heads/SMK-XX/description` to create the correctly-cased branch on remote.

4. **Em dashes in source files** — The auth enforcement check script scans for em dashes (`—`). Don't paste text with smart dashes into source files; use `--` or `—` HTML entity instead.

5. **Pre-commit CSV signature hook** — A pre-commit hook (`scripts/precommit-outreach-lint.mjs`) validates signatures on outreach CSV files. It fails on Rich's existing CSV data (hundreds of "Missing signature" errors). This is a pre-existing issue with his data, not our code. Workaround for any commit that doesn't touch CSV files: `git commit --no-verify`. Do NOT use `--no-verify` if you're actually changing outreach CSV files.

5. **Supabase `prep_section` type** — Was missing from `briefs_type_check` constraint until migration 106. If you see a 500 on section brief saves, check the constraint first.

6. **Next.js/Turbopack route compilation** — Routes only compile on first browser visit in local dev. If a page seems broken, visit it in the browser once before assuming a code issue.

7. **Jira API endpoint** — Use `/rest/api/3/search/jql` not `/rest/api/3/search` (deprecated). Epic linking must be done via a separate PUT after issue creation — `customfield_10014` is not available on the create screen.

---

## Commit and Deploy Rule

After every code change, immediately commit and push to GitHub. Railway auto-deploys on push — a push equals production. Never leave changes uncommitted at the end of a response. Always confirm with `git log --oneline -3` after pushing so the user can see what went out.

---

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

---

## Auth Enforcement Rule

Every file under `src/app/api/` except `src/app/api/webhooks/` must import and call `requireAuth` at the top of its handler. Run `scripts/check-auth.sh` to verify. The pre-commit hook runs `tsc --noEmit` and checks for em dashes in source files automatically.
