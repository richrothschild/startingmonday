# Sprint 1: Foundation and Activation Framework

**Dates**: May 13 - May 23, 2026 (2 weeks)  
**Owner**: Chris Goodwin  
**Theme**: Get oriented, set up the staging environment, deliver the highest-conversion-impact feature in the roadmap.

---

## Sprint Goals

1. Local environment running, staging environment deployed
2. Six-actions activation framework shipped to production
3. PostHog event tracking wired for all six activation actions
4. Stripe pricing updated to $49/$199/$499 tiers

---

## Tasks

### Infrastructure (Day 1-2)

- [ ] Clone repo, run local dev server, confirm it works
- [ ] Read `docs/architecture.md` and `docs/onboarding/04-codebase-guide.md`
- [ ] Set up staging environment on Railway (see `docs/onboarding/05-dev-workflow.md`)
  - Duplicate web service → point to `staging` branch
  - Create staging Supabase project → run all 25 migrations
  - Configure all env vars in Railway staging
  - Confirm staging.startingmonday.app loads
- [ ] Create `staging` branch in git: `git checkout -b staging && git push origin staging`
- [ ] Run `npm test` and `npm run typecheck` — confirm zero errors

---

### Six-Actions Activation Framework

**Background**: Users who complete 6 specific actions in the first session convert and stay. Users who do 2-3 don't. This is the highest-leverage thing we can build right now.

The six actions:
1. Upload resume or import LinkedIn
2. Add first target company with career page URL
3. Generate first prep brief
4. Add first contact at a target company
5. Set up daily briefing time/timezone
6. Log first conversation note

**Build**:

- [ ] Add `activation_completed` boolean columns to `users` table (migration):
  - `activation_resume_uploaded`
  - `activation_company_added`
  - `activation_brief_generated`
  - `activation_contact_added`
  - `activation_briefing_configured`
  - `activation_note_logged`
- [ ] Mark each column true when the corresponding action is completed (in the relevant API route)
- [ ] Build a "Getting Started" progress tracker component — visible on dashboard until all 6 are complete
  - 6 items in a checklist, each with an icon, label, and a direct link to the action
  - Completed items show a checkmark and are visually de-emphasized (not removed)
  - When all 6 are complete: component disappears permanently
  - Style: matches dashboard design — slate-900 background, no gamification, functional and minimal
- [ ] Replace empty state on dashboard (when user has no companies) with a guided first-session card: "Start by adding a target company" with a single-click entry point
- [ ] After resume upload: surface a prompt "Now add your first target company" with one-click navigation
- [ ] After first company added: prompt to generate the brief (if brief has never been generated)

**API routes to update** (mark activation columns):
- `/api/profile` (resume upload) → mark `activation_resume_uploaded`
- `/api/companies` (POST) → mark `activation_company_added`
- `/api/prep` or `/api/briefing` (POST) → mark `activation_brief_generated`
- `/api/contacts` (POST) → mark `activation_contact_added`
- (briefing config route) → mark `activation_briefing_configured`
- (note logging route) → mark `activation_note_logged`

---

### PostHog Event Tracking

**Background**: PostHog is already initialized. We need to add `posthog.capture()` calls for the six activation actions and several other key events.

- [ ] Add server-side PostHog capture for each of the six activation events (add to the same API routes being updated above)
- [ ] Capture `company_added` event with properties: `{ has_career_url: boolean, company_size_est: string }`
- [ ] Capture `brief_generated` event with: `{ context_richness_score: number, documents_attached: boolean }`
- [ ] Capture `pipeline_stage_changed` event with: `{ from_stage: string, to_stage: string }`
- [ ] Capture `trial_converted` event when a user upgrades from trial (in Stripe webhook)

PostHog server client: `src/lib/posthog-server.ts`. Reference any existing `posthog.capture()` call in the codebase for the pattern.

---

### Stripe Pricing Update

**Background**: The current pricing doesn't match the roadmap tiers. Update to:
- Intelligence (was Passive): $49/month
- Active: $199/month  
- Executive: $499/month

- [ ] Update Stripe product prices in the Stripe dashboard (test mode first, then live)
- [ ] Update `src/lib/plans.ts` with new price IDs
- [ ] Update `src/components/LandingPage.tsx` pricing section with new amounts
- [ ] Update any hardcoded dollar amounts in the codebase: `grep -r "\$99\|\$149\|\$299" src/`
- [ ] Test full checkout flow in staging with test cards
- [ ] Confirm existing subscribers are grandfathered (do not change their price — only new subscriptions get new price)

---

## Definition of Done

- [ ] Staging environment is live and auto-deploys on push to `staging` branch
- [ ] Activation tracker is live in production and marking completion correctly for new and existing users
- [ ] PostHog shows events firing in the PostHog dashboard for each activation action
- [ ] Stripe test checkout works at new price points in staging
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm test` passes
- [ ] No regressions: dashboard loads, brief generation works, contacts work

---

## Notes for Rich

- The activation framework is the most impactful thing we can ship right now. Every day it's not live is a day of unconverted trials.
- Existing users (already past day 1) need their activation columns backfilled. Ask Chris to write a one-time backfill migration based on the `user_events` table data where available.
- Stripe pricing: do not change existing subscriber prices. Only new subscriptions after the update use the new prices.
