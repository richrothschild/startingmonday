# Starting Monday — Sprint Plan
**Date:** May 7, 2026
**Goal:** Convert from useful dashboard → workflow infrastructure. Eliminate silent failures. Build minimum viable evals.

---

## Strategic Frame

**Dashboard:** Executives check it. They see signals, they leave to act elsewhere.

**Workflow infrastructure:** The product is the action layer. Signal arrives → executive acts from inside the product in one click. Search runs itself. The gap between insight and movement closes to zero.

The three sprints below are sequenced so each one makes the next one possible. Observability first. Action layer second. Evals third — because you need traces before you can evaluate anything.

---

## Sprint 1 — Observability: Kill Silent Failures (1–2 weeks)

The role_type bug was invisible for multiple deploys. A user hit the auth loop and had no idea why. This sprint makes all failure visible and makes the app safe to extend.

### 1.1 — Never redirect on a DB error

**Current behavior:** `const { data: profile } = await supabase...` ignores the error. If the query fails, profile is null, navigation logic treats it as "onboarding not complete" and redirects.

**Fix pattern (apply to every server component that drives navigation):**
```ts
const { data: profile, error: profileError } = await supabase.from('user_profiles').select(...)
if (profileError) {
  // log it, show degraded state — do NOT redirect to onboarding
  console.error(JSON.stringify({ event: 'profile_query_error', code: profileError.code, message: profileError.message, userId: user.id }))
  // render page with null profile rather than redirect
}
```

Files to harden:
- `src/app/(dashboard)/dashboard/page.tsx` — primary navigation logic
- `src/app/(dashboard)/dashboard/start/page.tsx` — has onboarding redirect
- `src/app/(dashboard)/dashboard/companies/[id]/page.tsx` — prep brief entry
- `src/app/(dashboard)/dashboard/profile/page.tsx` — profile completeness gating

### 1.2 — Startup migration version check

Add a check to the health endpoint (`src/app/api/admin/health/route.ts`) that queries the database for the highest-numbered migration applied, and compares it against the highest-numbered migration file in `supabase/migrations/`. If they diverge, the health check returns a warning. Railway can alert on non-200.

Simpler alternative that costs nothing: add a `db_version` check to the auth callback log line — query a known column from the most recent migration. If it fails with 42703, log `db_migration_lag: true`.

### 1.3 — Structured LLM trace logging (required for Sprint 3 evals)

Create table `llm_traces` in a new migration (`040_llm_traces.sql`):
```sql
create table llm_traces (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id),
  feature text not null,        -- 'prep_brief', 'chat', 'suggestions', 'outreach_draft'
  model text not null,          -- 'claude-sonnet-4-6'
  prompt_tokens int,
  completion_tokens int,
  latency_ms int,
  input_hash text,              -- sha256 of the prompt, for dedup
  input_snapshot jsonb,         -- compressed key fields (not full text)
  output_snapshot text,         -- first 2000 chars of output
  eval_pass bool,               -- null until rated
  eval_notes text               -- free-text from Richard's open coding
);
```

Create `src/lib/trace.ts` — a thin wrapper around every `anthropic.messages.create()` call that records the above. Every API route that calls Claude wraps its call through this logger. Routes to instrument:
- `src/app/api/prep/[id]/route.ts` (and all sub-routes: background, wins, why-here, etc.)
- `src/app/api/chat/route.ts`
- `src/app/api/suggestions/route.ts`
- `src/app/api/outreach/draft/route.ts`
- `src/app/api/strategy/route.ts`

### 1.4 — Error boundary in dashboard shell

`src/app/(dashboard)/dashboard/error.tsx` already exists. Ensure it:
- Renders a non-empty fallback (name, "Something went wrong loading your dashboard. Refresh to retry.")
- Does NOT include any navigation redirect logic
- Logs the error with a structured payload including userId (readable from session cookie)

### Sprint 1 Definition of Done
- [ ] Any DB query error in a navigation-driving server component logs a structured JSON event and renders a degraded page (not a redirect)
- [ ] `llm_traces` table exists in production
- [ ] At least 3 API routes (prep, chat, suggestions) write a row to `llm_traces` on every LLM call
- [ ] Health endpoint returns `db_ok: false` when expected columns are missing

---

## Sprint 2 — Action Layer: Signal to Action in One Click (2–3 weeks)

This is the "workflow infrastructure" sprint. Every signal, briefing item, and company card gets at least one action that executes inside the product.

### 2.1 — Outreach from signal card

Current gap: signals surface in `src/app/(dashboard)/dashboard/signals/`. A user sees "Company X is hiring for a role you fit." To act, they navigate to Contacts, find or create a contact, open Outreach, draft a message. Four to six steps.

Target: signal card has a "Draft outreach" button. One click → outreach draft page pre-populated with the company name, signal context, and the contact's name if one exists. The `/api/outreach/draft` route already exists — wire it to accept a `signalId` param.

Implementation:
- Add `signal_id` optional param to `DraftOutreachButton` component
- When `signal_id` is passed, `/api/outreach/draft` fetches signal context and prepends it to the system prompt
- Signal card renders `<DraftOutreachButton signalId={signal.id} companyName={...} />`

### 2.2 — One-click follow-up scheduling

Current gap: user reads a briefing, sees they should follow up with a contact, navigates to Contacts, opens the contact, adds a follow-up manually.

Target: briefing card renders "Add follow-up" with a date picker. Click → POST to a new `/api/contacts/[id]/followup` route → inserts a follow-up row → redirects to contact detail. No new pages required.

### 2.3 — mailto: outreach sending (no OAuth required)

Full Gmail OAuth is Sprint 3+. For now: the outreach draft page has a "Send via email" button that opens `mailto:recipient@domain.com?subject=...&body=...`. Pre-fill from the drafted outreach. Zero new auth surface, works on day one.

This is the critical distinction: the executive doesn't leave the product to compose an email. They compose inside the product, then Send opens their native client with the message pre-loaded.

### 2.4 — Company intelligence → company card action

`src/app/api/intelligence/companies` already exists. Surface it on the company detail page with a "Run intelligence scan" button. Result renders inline in the card (already wired via `/dashboard/dashboard/companies/[id]`).

Confirm the scan result includes: open roles, recent news, leadership changes. If any of these is missing, add it to the Claude prompt in `src/app/api/intelligence/companies/route.ts`.

### 2.5 — Prep brief entry from pipeline view

Current gap: Kanban view shows companies in pipeline stages. To run a prep brief, user navigates away to Companies, clicks the company, finds the prep brief tab.

Target: each Kanban card in interview stages (First Interview, Second Interview, Final Round) gets a "Prep" button that navigates directly to `/dashboard/companies/[id]?tab=prep`.

### 2.6 — Activation steps link to action, not to pages

`src/lib/activation.ts` defines 6 activation steps. Currently the steps in the UI likely just describe what to do. Update each step to have an `href` that drops the user directly at the action:
- A1 (resume): → `/dashboard/profile#resume`
- A2 (company): → `/dashboard/companies/new`
- A3 (prep brief): → `/dashboard/companies` (first company in list)
- A4 (contact): → `/dashboard/contacts/new`
- A5 (briefing time): → `/dashboard/settings`
- A6 (follow-up): → `/dashboard/contacts` (first contact)

### Sprint 2 Definition of Done
- [ ] Signal card has "Draft outreach" → outreach page pre-populated with company and signal context
- [ ] Briefing cards and signal cards have "Add follow-up" → inserts follow-up row, no navigation required
- [ ] Outreach draft page has "Send via email" → mailto: link with subject/body pre-filled
- [ ] Company detail page has "Run intelligence scan" button with inline result
- [ ] Kanban cards in interview stages have "Prep" button linking to prep tab
- [ ] All 6 activation steps link directly to their action

---

## Sprint 3 — Minimum Viable Evals (2–3 weeks)

Applying the Clarity Field Guide framework directly to Starting Monday. The beachhead use case is prep briefs — highest value, most complex, easiest to assess failure.

**First principle from the guide:** You need 150–200 labeled traces before you build anything automated. No LLM-as-judge, no automated pipeline until you have a human rubric validated against real output.

### 3.1 — Trace viewer (admin page)

Build `src/app/(dashboard)/dashboard/admin/traces/page.tsx` — a simple table of `llm_traces` rows filterable by feature. Columns: created_at, feature, user_id (truncated), latency_ms, tokens, eval_pass, eval_notes.

Add inline "Pass" / "Fail" toggle and a notes text input per row. Clicking Pass/Fail writes `eval_pass` and optionally `eval_notes` back to the `llm_traces` row via a server action.

This is Richard's annotation interface. Build it in one session — vibe code it, it doesn't need to be beautiful, it needs to be fast to use.

### 3.2 — Open coding (Richard's task, not code)

After Sprint 1 traces are flowing and Sprint 3.1 is built:

1. Run the product normally for 1–2 weeks, generating real traces
2. Open the trace viewer, read 100–150 prep brief outputs
3. For each one: write free-text in `eval_notes` describing what's wrong (or "good")
4. Do not impose categories yet — write exactly what you notice ("too generic," "missed the company's revenue model," "got the industry wrong," "right format, wrong tone")

This is the open coding phase from the guide.

### 3.3 — Axial coding (turn notes into taxonomy)

After 100+ labeled traces, read the `eval_notes` across all rows. Group similar failure observations. Target: 6–10 failure categories. Examples for prep brief:

| Category | Description |
|---|---|
| `company_context_thin` | Response treats company generically; misses specific business model, industry position, or recent news |
| `role_fit_not_established` | Never connects executive's background to this specific role |
| `question_list_too_generic` | Questions could apply to any company or any exec; not tailored |
| `format_off` | Response structure doesn't match expected section breakdown |
| `wrong_tone` | Too casual, too academic, or reads like a junior employee wrote it |
| `key_claim_wrong` | Factual error in company description, leadership team, or financials |

### 3.4 — Rubric v1

Convert the taxonomy into a binary checklist. Each check is yes/no, no partial credit. This is the binary pass/fail the guide mandates.

Example rubric for prep brief:
```
PREP BRIEF RUBRIC v1
[ ] company_context: Includes at least 2 specific facts about this company not derivable from the job title alone
[ ] role_fit: Connects at least 1 specific element of executive's background to this role or company
[ ] questions_tailored: At least 3 of the suggested questions are specific to this company or role
[ ] format_correct: Sections match expected structure (background, why here, questions, risks)
[ ] tone_executive: Voice is peer-level; not "here are some tips" register
[ ] no_factual_errors: No claim the evaluator can identify as clearly wrong
```

A prep brief PASSES only if all 6 checks are true. Save rubric as `src/evals/prep_brief_rubric.md`.

### 3.5 — Golden set

Select 50 prep brief traces from the labeled set: 25 that passed the rubric, 25 that failed across different categories. Save these as `src/evals/prep_brief_golden_set.json` with schema:
```json
[
  {
    "id": "uuid",
    "input": { "company": "...", "role": "...", "profile_snapshot": "..." },
    "output": "full prep brief text",
    "pass": true,
    "failure_categories": []
  }
]
```

### 3.5.1 - Labeling and export runbook (operator)

  Use this sequence to close Sprint 3 with the current admin tooling:

  1. Open `/dashboard/admin/traces?feature=prep_brief&unrated=1`.
  2. Keep the rubric open at `/dashboard/admin/traces/rubric`.
  3. Label traces until both counters reach 25:
    - Pass labels: `25/25`
    - Fail labels: `25/25`
  4. Use keyboard-first flow to speed throughput:
    - `P` pass, `F` fail, `U` unrated, `O` output
    - `J/K` next/previous active row
    - `G` first row, `Shift+G` last row
    - `1-8` failure tags (on failed rows)
    - `D` dense view toggle
    - `A` apply top tag to untagged fails, `Z` undo last bulk apply
  5. Confirm "Ready to export" in the prep_brief progress panel.
  6. Optional CLI progress check:
    - `npm run evals:label-progress`
  7. Run export:
    - `npm run evals:export-golden-set`
  8. Optional preflight:
    - `npm run evals:export-golden-set -- --dry-run`
  9. Verify output file `src/evals/prep_brief_golden_set.json` has 50 examples with a 25/25 pass/fail split.

### 3.6 — First optimization loop

With the rubric and golden set in hand, the improvement cycle is:
1. Read 10 failing traces → identify the most common failure category
2. Edit the system prompt for that category → re-run the golden set inputs
3. Check: did the fail-rate for that category improve? Did anything regress?
4. If improved: keep the change. If regressed: revert and try a different approach.

Do not add LLM-as-judge until you have run at least 3 manual optimization cycles and the rubric is stable.

### Sprint 3 Definition of Done
- [ ] Trace viewer exists at `/admin/traces`, shows LLM traces with inline Pass/Fail toggle
- [ ] At least 100 prep brief traces labeled with `eval_pass` and `eval_notes`
- [ ] Axial coding complete: 6–10 failure categories documented
- [ ] `src/evals/prep_brief_rubric.md` exists with binary pass/fail checks
- [ ] `src/evals/prep_brief_golden_set.json` exists with 50 labeled examples
- [ ] At least 1 prompt optimization cycle completed against the golden set

---

## Cross-Sprint: Reliability Operating Model

Adopt these practices starting Sprint 1, maintain through all sprints:

**Structured log format:** Every server component and API route that interacts with the DB or LLM logs JSON with at minimum: `{ ts, event, userId, ok, error }`. Railway captures stdout. This is the minimum for incident response.

**Migration discipline:** Never merge a PR that references a DB column without a migration file that creates it. PR checklist item: "Does this SELECT include any column added after migration 029? If yes, is the migration file in this PR?"

**Deployment verification:** After every Railway deploy, manually verify the primary user path: login → dashboard → company → prep brief → outreach draft. This takes 90 seconds and catches the class of bug that caused the auth loop.

**Error budget:** Track % of dashboard page loads that result in a visible error (not a redirect to onboarding). Target: <0.5%. Read from Railway logs weekly.

---

## Sequencing Rationale

| Sprint | Why first |
|---|---|
| 1 — Observability | Can't optimize what you can't see. Traces make Sprint 3 possible. Error hardening makes Sprint 2 safe to ship. |
| 2 — Action layer | This is the product differentiation. Without it, we're a dashboard. With it, we're infrastructure. Needs Sprint 1 reliability to ship with confidence. |
| 3 — Evals | Needs real traces (Sprint 1) and a stable product (Sprint 2) to label meaningful examples. Optimizing a prompt against synthetic inputs is wasted effort. |

---

## What This Accomplishes

After these three sprints:
- Silent failures are structurally impossible to hide — every DB error surfaces in logs and renders a degraded state, not a misleading redirect
- An executive can complete an outreach sequence without leaving Starting Monday once
- The AI quality improvement cycle is systematic, not intuitive — changes to prompts are tested against a labeled dataset, not gut-checked
- The product charges $129/mo and earns it: insight arrives, action follows immediately, the search runs itself

*Sprint plan based on product state as of May 7, 2026.*
