# Sprint 2: Email Lifecycle and Admin Dashboard

**Dates**: May 26 - June 6, 2026 (2 weeks)  
**Owner**: Chris Goodwin  
**Theme**: Build the email communication system and the internal visibility tools Rich needs to manage the business.

---

## Sprint Goals

1. Full email lifecycle system (prospective, onboarding, retention, re-engagement)
2. Internal admin dashboard (active users, activation rates, trial conversions)
3. Brief quality improvements (regenerate individual sections)

---

## Tasks

### Email Lifecycle System

The worker already sends a few emails (trial reminders, briefing, offer acceptance). This sprint builds out the full lifecycle.

**New email sequences to build:**

**Onboarding sequence** (triggered by signup, sent by worker):
- [ ] Day 1: Welcome — "Here is what to do first" (links to the six activation actions)
- [ ] Day 3: Check-in — if fewer than 3 activation actions complete, send "You haven't added a target company yet" with direct link. If 3+ complete, send a tip on using the intelligence scanner
- [ ] Day 7: Mid-trial — if not converting signals, send "Here's what your intelligence scanner found" (or a prompt to add companies if none added)
- [ ] Day 25: Pre-conversion — "5 days left on your trial. Here's what you've built." Summary of pipeline state: companies watched, contacts added, briefs generated

All emails go through Resend using `src/lib/email.ts`. The worker cron already has daily jobs — add new jobs or extend existing ones.

**Re-engagement sequence** (triggered by inactivity):
- [ ] Detect users who haven't logged in for 10 days during trial (add to worker daily job)
- [ ] Send one re-engagement email: "You have [N] companies being monitored. Here's what changed." Pull latest signals for their pipeline.
- [ ] If no login in 20 days during trial: final nudge "Your trial ends in [N] days. Want more time?"

**Post-trial-expiry** (for unconverted users):
- [ ] 3 days after trial ends without conversion: one email. No urgency, no discount. "Here's a question: what was missing?" (one-sentence survey, 3 options)
- [ ] Store survey response in `user_events` table

**Implementation notes:**
- Worker email jobs are in `worker/jobs/` — follow existing patterns
- Email templates should be text-first, HTML-optional — the current Resend setup supports both
- Always check `user.unsubscribed_at` before sending any non-transactional email
- Always include `Unsubscribe` link (uses `/unsubscribe/[code]` route, already built)

---

### Internal Admin Dashboard

Rich needs visibility into the business without Supabase SQL access. Build a simple internal page at `/admin` (visible only to users with `is_admin = true` on their user record).

- [ ] Create `/admin` route protected by admin role check
- [ ] Dashboard shows:
  - Total users (trial, paid, churned)
  - New signups in last 7/30 days
  - Trial conversion rate (last 30 days)
  - Six-actions completion rate by cohort (signup week)
  - Active users (logged in within 7 days)
  - Revenue summary (current MRR — can pull from Stripe API)
- [ ] Add a simple user table: email, signup date, plan, trial end, last active, activation score (0-6)
- [ ] Add ability to send a manual email to a specific user from the admin UI (text field + send button, uses existing Resend/email infrastructure)

**Security**: The admin page must verify `is_admin` on the server side — not just the client. Use the admin Supabase client (service role) to check this.

---

### Brief Quality Improvements

- [ ] Add "Regenerate this section" button to each of the 8 individual prep brief sections
  - Calls a new API route `/api/prep/section` with `{ company_id, section_name }`
  - Returns a streaming response for that section only
  - Updates the section in place in the UI
- [ ] Add section-level thumbs up/down rating (already exists for full brief — extend to sections)
  - Store in `brief_quality_log` table with `section_name`

---

## Definition of Done

- [ ] All email sequences fire correctly in staging (test with a staging account through the full trial flow)
- [ ] No emails send to users with `unsubscribed_at` set
- [ ] Admin dashboard loads for admin user, returns 403 for regular user
- [ ] Regenerate section works for all 8 sections without breaking full brief generation
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes

---

## Notes for Rich

- The 3-options post-trial survey response is valuable data. Check `user_events` weekly during the first month to see patterns.
- The admin dashboard MRR figure should come from Stripe, not from counting paid users — Stripe has the authoritative subscription data.
- On the email sequences: start with Day 1 welcome and Day 3 check-in, then ship. Don't wait to build all 5 sequences before deploying any.
