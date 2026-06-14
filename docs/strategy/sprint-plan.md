# Sprint Plan

> Working backwards from the fully realized Starting Monday product.
> Based on strategic analyses: Mark Horstman review, TAM/financial model, B2B strategy, LinkedIn content system, pricing strategy, and product fit gaps.

---

## End state (12-week horizon)

At the end of 6 sprints, Starting Monday will have:

- Outreach tracking that closes the signal-to-conversation loop (Mark Horstman's #1 concern)
- Annual billing driving better LTV for committed subscribers
- CISO and CDO signal types filling the persona gaps
- Outreach message generation from prep brief context
- LinkedIn social content generation running autonomously with Liz managing reviews and replies
- A partner/referral program live with the first coach pilots enrolled
- Salary intelligence complete (currently in progress)
- Post-placement Intelligence tier retention path

**Revenue target at week 12:** 150+ subscribers, $18K+ MRR, 3+ coach pilot partners enrolled.

---

## Sprint 1 — Foundation + Revenue (Weeks 1-2)

**Theme:** Fix the things that cost money every day they are not done.

### Annual billing

- [ ] Create annual Stripe price IDs for Intelligence ($490/yr), Search ($1,290/yr), Executive ($2,490/yr)
- [ ] Add `annual` to `BillingInterval` type in `plans.ts`
- [ ] Add `annualAmount` to each plan in `PLANS`
- [ ] Update `billing-client.tsx` toggle: Monthly / Annual (replace Quarterly)
- [ ] Update billing API route to handle annual interval → correct Stripe price ID
- [ ] Update pricing page to show annual toggle with "2 months free" badge
- [ ] Add anchor sentence above pricing cards: "One hour with an executive coach runs $300 to $500. Starting Monday is $199 a month and runs every day."

### Outreach tracking

- [ ] Add `outreach_sent` action type to the follow-up / contact system
- [ ] New fields: `outreach_channel` (LinkedIn / email / phone), `signal_context_id` (optional FK to triggering signal), `message_preview` (first 200 chars, not stored in full)
- [ ] UI: on contact detail page, "Log outreach" button opens a lightweight modal
- [ ] Briefing email: if outreach logged this week, show count in stats bar alongside Actions Due
- [ ] Admin: outreach count per user per week visible in admin panel

### Salary intelligence completion

- [ ] Complete the in-progress salary intelligence API and page
- [ ] Wire kanban link from company detail view
- [ ] Test end-to-end for Executive tier users

### Billing UI fix (already done)

- [x] Featured plan in billing client changed from Executive to Search ("Most popular")

**Definition of done:** Annual billing live in Stripe and UI. First annual subscriber converts. Outreach logging modal works on contact detail page. Salary intelligence page accessible to Executive tier users.

---

## Sprint 2 — Signal + Action Chain (Weeks 3-4)

**Theme:** Close the gap between intelligence and behavior.

### CISO signal types

- [ ] Add `breach_disclosure` to signal type enum (migration required)
- [ ] Add `regulatory_change` to signal type enum
- [ ] Update signal detection job: add pattern matching for breach language in news feeds ("security incident," "data breach," "unauthorized access," "SEC 8-K cybersecurity")
- [ ] Update signal detection job: add regulatory pattern matching ("SEC cybersecurity rule," "HIPAA update," "PCI-DSS," "state privacy law")
- [ ] Update CISO role frame in `generate-briefing.js` to weight these signal types as highest priority
- [ ] Test with 3 CISO pilot users

### CDO data signal types

- [ ] Add `data_platform` signal type (Snowflake, Databricks, data infrastructure announcements)
- [ ] Add `ai_investment` signal type (AI budget announcements, Chief AI Officer hires)
- [ ] Update CDO data role frame to weight these correctly

### Outreach message generator

- [ ] After prep brief generation, add "Draft outreach" CTA button
- [ ] API route: `POST /api/prep/outreach` — accepts company_id, contact_id (optional), signal_context (optional)
- [ ] Prompt: uses prep brief context + signal angle + user's positioning summary to generate a 3-sentence personalized outreach
- [ ] UI: show draft in same prep brief page. User can copy, edit, or log as sent (triggers outreach_sent from Sprint 1)
- [ ] If signal triggered the outreach, link the outreach_sent record to the signal ID

**Definition of done:** CISO and CDO data signal types live and surfacing in briefings. Outreach message draft generates correctly from prep brief context. Users can log the outreach as sent in one click from the draft view.

---

## Sprint 3 — LinkedIn Social V1 (Weeks 5-6)

**Theme:** Get Liz posting consistently with minimal friction.

### Admin social page

- [ ] New route: `/dashboard/admin/social` — accessible only to admin users
- [ ] Weekly schedule config: 3 posts per week (Mon/Wed/Fri), pillar rotation (Search Craft / Market Intel / Behind Build / User Story / Engagement)
- [ ] Content bank: seed with 4 weeks of pre-written drafts (12 posts) covering each pillar
- [ ] Daily draft view: show today's scheduled post, pulled from content bank or generated fresh

### Daily content generation API

- [ ] `GET /api/admin/social/today` — returns today's scheduled post draft
- [ ] If today is a post day: fetch current week's signal headlines, generate a draft enriched with real data
- [ ] If today is a signal-heavy day (3+ new signals): override scheduled pillar with a timely market intelligence post
- [ ] Generation uses Claude (Haiku). Prompt: "You are writing a LinkedIn post for Starting Monday, a search platform for senior executives. Today's pillar: [pillar]. Real signals this week: [signals]. Write in Rich's voice: short sentences, no em dashes, no filler phrases, specific and actionable."

### Magic link + calendar setup

- [ ] URL format: `https://startingmonday.app/dashboard/admin/social` — always shows today's draft (date derived server-side)
- [ ] Liz creates a recurring Google Calendar event: weekdays, 9:00 AM
- [ ] Event description contains the magic link. She clicks it each morning.

### Post review UI

- [ ] Show draft with edit-in-place capability
- [ ] "Copy to LinkedIn" button copies the post text to clipboard
- [ ] "Regenerate" button calls the API with a different seed
- [ ] "Mark posted" button records the post as published (date, platform, pillar type)
- [ ] Post history: last 30 days of posted content visible

### Reply queue (manual V1)

- [ ] "Open LinkedIn" button takes Liz directly to the LinkedIn page
- [ ] Manual: Liz manages replies in LinkedIn for now; V2 will bring them into the dashboard

**Definition of done:** Liz can open the magic link each morning, see a ready-to-post draft, edit it, copy it, and mark it posted — all within 5 minutes. The content bank has 12 pre-written posts. Daily generation works for signal-heavy days.

---

## Sprint 4 — Partner + Referral Foundation (Weeks 7-8)

**Theme:** Activate the B2B channel with zero seat management complexity.

### Referral code system

- [ ] New table: `partners` — id, name, email, referral_code (unique), commission_pct (default 20), created_at
- [ ] New table: `referral_attributions` — signup_user_id, partner_id, attributed_at
- [ ] Referral code logic: when a user signs up via `/signup?ref=CODE`, record the attribution
- [ ] Monthly commission calculation job: for each partner, sum MRR from attributed active subscribers × commission_pct

### Partner signup page

- [ ] `/partners` page (already exists as a contact form): update to generate a referral code upon form submission
- [ ] Confirmation email to partner: includes their referral link, how the program works, and instructions for sharing
- [ ] Admin view: list all partners, their referral codes, attributed subscriber count, MRR attributable

### Basic partner dashboard

- [ ] `/dashboard/partner` — accessible only to partner users (new `is_partner` flag on users or separate auth)
- [ ] Shows: number of referred subscribers (anonymous), total attributed MRR, estimated commission this month
- [ ] Simple table: signup date, tier, active/inactive (no names — privacy)

### Pilot outreach

- [ ] Identify 5-10 executive coaches on LinkedIn (search: "executive coach" + "CIO" or "VP Technology")
- [ ] Outreach template: "I have [N] senior executives using Starting Monday in active search. I would like to offer 3 free seats for your clients for 90 days. If it works, we can talk about a referral arrangement."
- [ ] Track pilot responses in contacts (add "coach_pilot" tag)

**Definition of done:** Referral code system live. First 3 coaches have referral codes. At least 1 coach has shared the link with a client. Partner dashboard shows real data.

---

## Sprint 5 — LinkedIn Social V2 + Scheduling (Weeks 9-10)

**Theme:** Remove the manual step. Liz approves; the platform publishes.

### Buffer API integration

- [ ] Create a Buffer account for Starting Monday
- [ ] `POST /api/admin/social/schedule` — accepts post text and scheduled datetime, pushes to Buffer queue
- [ ] Buffer connection stored in environment variables (`BUFFER_ACCESS_TOKEN`, `BUFFER_CHANNEL_ID_LINKEDIN`)
- [ ] UI: replace "Copy to LinkedIn" with "Schedule post" button. Default scheduled time: 10:00 AM on the posting day.
- [ ] Show scheduled status: "Scheduled for [date] at [time]" with an edit/cancel option

### Performance metrics (lightweight)

- [ ] `GET /api/admin/social/metrics` — fetches impressions, reactions, comments from Buffer's analytics endpoint
- [ ] Social dashboard: last 30 posts with impressions and engagement rate
- [ ] Flag top-performing posts (top quartile impressions): "Use this pillar/hook more often"

### Comment notification (V2 reply management)

- [ ] Daily digest: email to Liz at 3:00 PM if any new comments on LinkedIn posts (via Buffer webhook or polling)
- [ ] Comment digest shows: post excerpt, commenter name, comment text, a suggested reply
- [ ] Liz replies from LinkedIn directly; V3 will bring this into the dashboard

### Liz's updated workflow at Sprint 5 completion

1. Calendar event fires at 9:00 AM
2. Liz clicks magic link
3. Reviews draft, edits if needed
4. Clicks "Schedule post" — post is queued for 10:00 AM
5. 3:00 PM digest email if there are comments to review
6. She replies from LinkedIn (< 15 minutes/day total)

**Definition of done:** At least 2 weeks of posts auto-published via Buffer without manual copy-paste. Comment digest email arriving daily. Performance metrics visible in the social dashboard.

---

## Sprint 6 — B2B Seats + Retention (Weeks 11-12)

**Theme:** Convert pilot coaches to paying partners; keep landed executives subscribed.

### Coach seat management (basic)

- [ ] New Stripe product: "Partner seat — Intelligence" ($39/seat/mo), "Partner seat — Search" ($89/seat/mo)
- [ ] Coach checkout: partner can purchase X seats; generates X invite codes
- [ ] Client onboarding: invite code → client signs up, account linked to partner, partner pays the seat cost
- [ ] Coach dashboard: see assigned clients, last active date, briefing sent count (no PII beyond email)

### Post-placement retention path

- [ ] New profile field: `search_status` — `active`, `complete`, `paused`
- [ ] UI: on dashboard, a discreet "Mark search as complete" link
- [ ] When marked complete: modal offers transition to Intelligence at $29/mo (or $290/yr)
- [ ] If they accept: Stripe subscription update to Intelligence tier
- [ ] 30-day pre-expiry email for trialing users: "Are you still in active search? If your search is wrapping up, stay connected at $29/month."

### Mobile briefing audit

- [ ] Test daily briefing email in Gmail iOS, Outlook iOS, and Apple Mail
- [ ] Fix any rendering issues in `email-template.js`
- [ ] Test tracking pixel load on mobile email clients

### COO persona onboarding note

- [ ] Add COO-specific copy to onboarding step 4 (companies): "COO roles are rarely posted. Focus on your contacts and follow-up cadence more than career page scanning. Add companies where you have relationships."
- [ ] COO role frame update in `generate-briefing.js`: emphasize M&A signals and operational announcements over career page matches

**Definition of done:** At least 1 coach purchasing seats and onboarding clients through the invite flow. At least 3 users have used the "search complete" path. Mobile briefing renders correctly on all major email clients.

---

## Backlog (Post-Sprint 6)

- LinkedIn API direct integration (replace Buffer if Buffer limitations emerge)
- In-app reply management for LinkedIn comments and DMs
- Network/relationship strength scoring for COO and CDO personas
- Data-specific signal sources (Snowflake partner announcements, LinkedIn engineering headcount growth)
- Enterprise seat management (SSO, data isolation, legal templates) — year-2 target
- SOC 2 Type I preparation
- Pricing page A/B test: anchor sentence with and without executive coach comparison
- Intelligence tier alumni community (post-placement peer group)

---

## Sprint calendar

| Sprint | Weeks | Theme | Key deliverable |
|--------|-------|-------|----------------|
| 1 | 1-2 | Foundation + Revenue | Annual billing live. Outreach logging. Salary intel complete. |
| 2 | 3-4 | Signal + Action Chain | CISO signals. CDO signals. Outreach message generator. |
| 3 | 5-6 | LinkedIn Social V1 | Magic link. Content generation. Liz posts manually. |
| 4 | 7-8 | Partner + Referral | Referral codes. Partner dashboard. First coach pilots. |
| 5 | 9-10 | LinkedIn Social V2 | Buffer scheduling. Comment digest. Liz approves, platform publishes. |
| 6 | 11-12 | B2B Seats + Retention | Coach seat purchase. Post-placement Intelligence path. Mobile audit. |

---

*Last updated: 2026-05-08*
