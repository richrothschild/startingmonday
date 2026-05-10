# Local Development Environment Setup

This gets you to a running local environment in about 30 minutes.

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/richrothschild/startingmonday.git
cd startingmonday
```

You need write access to the repo. Rich will add you as a collaborator on GitHub before your first day.

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Environment Variables

Copy the template and fill in values:

```bash
cp .env.local.example .env.local   # if example exists
# or ask Rich to share the .env.local file directly
```

The key variables you need for local development:

| Variable | What It Is | Where To Get It |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key | Supabase dashboard (Settings > API) |
| `ANTHROPIC_API_KEY` | Claude API key | Rich will share |
| `RESEND_API_KEY` | Email service key | Rich will share |
| `PAGESPEED_API_KEY` | Google PageSpeed API | Optional for local dev |

Rich will share the `.env.local` file directly. Never commit this file — it's in `.gitignore`.

**Staging note:** When working on the staging environment, you'll use a separate `.env.staging` with staging-specific keys. These will be provided separately.

---

## Step 4: Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000.

---

## Step 5: TypeScript Check

Run this before every commit or PR:

```bash
npm run typecheck
```

Zero errors is required. The pre-commit hook runs this automatically, but catching it earlier saves time.

---

## Step 6: Run Tests

```bash
npm test        # unit tests (Vitest)
npm run test:e2e   # E2E tests (Playwright) — needs staging env
```

---

## Running the Worker Locally (Optional)

The worker is a separate Node.js process that handles scheduled jobs. You typically don't need it running locally unless you're working on scanner, signals, or email jobs.

```bash
cd worker
npm install
node index.js
```

It communicates with the web app via HTTP on port 3001 (default). The web app will work fine without it — you just won't get scheduled job output.

---

## Database Access

The local dev server connects to the production Supabase database by default. This is intentional — it keeps the feedback loop fast for feature development.

**Important**: Be careful with any write operations on production data. For destructive testing (dropping tables, bulk edits), coordinate with Rich first.

Once staging is set up (see `05-dev-workflow.md`), you'll switch to the staging database for riskier work.

---

## Accessing the Supabase Dashboard

Go to https://supabase.com/dashboard — Rich will add you to the project.

The schema is described in `docs/architecture.md`. The migrations are in `supabase/migrations/`.

---

## Useful Commands

```bash
npm run dev              # start local server
npm run typecheck        # TypeScript check
npm test                 # run Vitest unit tests
npm run lint             # ESLint
git log --oneline -10    # recent commits
```

---

## VS Code Setup (Recommended)

Install these extensions:
- Claude Code (from marketplace)
- ESLint
- Tailwind CSS IntelliSense
- Prisma (for SQL syntax highlighting in migration files)

The project uses Tailwind CSS — IntelliSense will autocomplete class names.
