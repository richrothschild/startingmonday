# Starting Monday

AI-powered career search platform for VP and C-suite executives. [startingmonday.app](https://startingmonday.app)

## What It Does

Starting Monday helps senior executives run a structured, intelligent job search:

- **Pipeline tracking** — 5-stage pipeline (Watching, Researching, Applied, Interviewing, Offer) with company notes, fit scoring, and full audit log
- **Career page scanning** — automated monitoring of target company career pages for relevant roles, 3x/week via Browserless
- **Company intelligence** — signals on funding rounds, exec hires/departures, acquisitions, and expansions
- **AI prep briefs** — tailored interview preparation for each company, streaming in ~60 seconds
- **Search Strategy Brief** — one-time AI synthesis of full positioning, gaps, and recommended outreach sequence
- **AI chat advisor** — persistent conversation with full pipeline context and tool use (stage updates, follow-ups, notes)
- **Resume tailoring** — paste a job description, get a tailored resume with ATS quality check, DOCX export
- **Outreach drafts** — context-aware email drafts written at the executive level
- **Daily briefings** — morning email + in-app briefing at the user's configured time and timezone

## Architecture

Two Railway services: Next.js 16 web application + Node.js worker for background jobs.

- **Database**: Supabase / PostgreSQL (25 migrations, RLS-enforced on all user tables)
- **Auth**: Supabase Auth with email/password and Google OAuth
- **AI**: Anthropic Claude (Opus for strategy briefs, Sonnet for prep/chat/tailoring, Haiku for classification)
- **Billing**: Stripe (checkout, portal, pause/resume, idempotent webhooks)
- **Email**: Resend (`briefing@startingmonday.app`)
- **Scanning**: Browserless (headless Chrome for career page parsing)
- **Monitoring**: Sentry, UptimeRobot, PostHog, Railway logs

Full system architecture: [docs/architecture.md](docs/architecture.md)

## Development

**Prerequisites**: Node.js >= 20.9.0

```bash
# Install dependencies
npm install

# Run dev server
npm run dev       # http://localhost:3000

# Type check
npm run typecheck

# Run tests
npm test
```

**Worker** (separate process, separate Railway service in production):

```bash
cd worker
npm install
node index.js
```

Environment variables: see the Environment Variables section in [docs/architecture.md](docs/architecture.md).

## Deployment

Both services deploy to Railway automatically on push to `main`.

- **Web**: nixpacks detects Next.js; `npm run build && npm run start`
- **Worker**: `node worker/index.js`

Health check: `GET /api/health` (returns uptime, timestamp, version)

## Docs

- [Architecture](docs/architecture.md) — infrastructure, schema, API patterns, environment variables
- [Product Roadmap](docs/product-roadmap.md) — what is built and what is planned
- [Backlog](docs/backlog.md) — validated ideas deferred from the active roadmap

## Sprint 3 Evals Commands

Prep brief labeling and golden-set workflow commands:

```bash
# Label progress
npm run evals:label-progress
npm run evals:label-progress:strict

# Golden set export and verification
npm run evals:export-golden-set
npm run evals:verify-golden-set
npm run evals:verify-golden-set:strict

# Combined readiness gate
npm run evals:readiness
npm run evals:readiness:strict
npm run evals:readiness:md
npm run evals:readiness:summary
npm run evals:readiness:summary:strict
npm run evals:readiness:snapshot

# One-command closeout flow
npm run evals:closeout       # doctor -> readiness -> export -> strict verify
npm run evals:closeout:dry-run
npm run evals:closeout:force
npm run evals:closeout:json

# Command index
npm run evals:help
npm run evals:help:status
npm run evals:help:json
npm run evals:help:status:json

# Prerequisite check
npm run evals:doctor
npm run evals:doctor:strict
```

Primary labeling UI:

- `/dashboard/admin/traces?feature=prep_brief&unrated=1`
- `/dashboard/admin/traces/rubric`
