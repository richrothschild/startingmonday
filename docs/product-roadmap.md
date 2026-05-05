# Starting Monday — Product Roadmap

**Internal document** | May 2026

---

## Roadmap Principles

1. **Depth over breadth.** Every feature should make the core workflow — watch, prepare, manage — meaningfully better before we add new workflows.
2. **Data gravity first.** Features that make user data richer and harder to replicate elsewhere take priority.
3. **The brief is the product.** Every infrastructure investment should eventually make the prep brief more accurate, more specific, or faster to reach.
4. **No feature that requires the user to do more work** unless it produces disproportionate value.

---

## Phase 0: Foundation (Shipped)

Everything currently live at startingmonday.app.

### Infrastructure
- [x] Next.js 16 App Router, Railway deployment
- [x] Supabase auth + RLS-enforced database
- [x] Stripe billing (Passive/Active), webhook handling, pause/resume
- [x] Sentry error tracking, UptimeRobot monitoring
- [x] Request logging middleware
- [x] Health endpoint (`/api/health`)
- [x] Vitest test harness (44 tests)

### Core Features
- [x] Pipeline tracking (5 stages: watching → researching → applied → interviewing → offer)
- [x] Contact tracker with channel, follow-up, and notes
- [x] Career page scanning (Browserless, 3x/week)
- [x] Company signals (funding, exec hires/departures, acquisition, expansion, etc.)
- [x] Prep brief (full + 8 individual sections, all streaming)
- [x] Search Strategy Brief (Opus, streaming, follow-up chat)
- [x] AI Chat advisor (persistent history, tool use: stage updates, follow-ups, notes)
- [x] Outreach email drafting
- [x] Resume tailoring (DOCX export)
- [x] Daily morning briefing (email + in-app)
- [x] LinkedIn profile import
- [x] Resume upload (PDF + Word parsing)
- [x] Document attachments (job description, annual report, press, etc.)
- [x] 30-day free trial, no credit card

### Worker (Background)
- [x] Scan job (Mon/Wed/Fri)
- [x] Signal classification job (Mon/Wed/Fri)
- [x] Briefing delivery (timezone-aware, configurable time/days)
- [x] Follow-up reminder emails
- [x] Momentum score (weekly)
- [x] Weekly digest
- [x] Trial expiration reminders (T-3, T-0)
- [x] Usage monitoring

---

## Phase 1: Retention and Depth (Next 60 Days)

**Theme**: Make the product stickier and more accurate before acquiring more users. Every user who churns before experiencing the product's full value is a wasted acquisition.

### Immediate Scan on Company Add
- [ ] Trigger a scan immediately when a user adds a new company (instead of waiting for the next scheduled run)
- [ ] Show the scan result within the company workspace as soon as it completes

### Day 1 Action Plan
- [ ] Replace empty dashboard state with a guided first-session card
- [ ] Clear sequence: add companies → import LinkedIn → generate first brief
- [ ] Goal: time-to-first-brief under 15 minutes from signup

### Accomplishment Repository (Phase 1 Foundation)
- [ ] Add a structured "Accomplishments" section to the user profile
- [ ] Schema: role, company, date range, outcome, metric, context tags
- [ ] Import seed data from resume parsing (auto-extract candidate accomplishments)
- [ ] UI: add/edit accomplishments in profile
- [ ] Feed accomplishments as additional context to all brief and strategy prompts

### Resume Version Library (follows Accomplishment Repository)
- [ ] Allow multiple named resume versions (e.g., "PE-backed transformation," "Public company CIO," "Board-track")
- [ ] Each version is generated from the accomplishment repository with different emphasis
- [ ] AI generates the tailored version; user edits inline; export to DOCX

### Brief Quality Improvements
- [ ] Add "regenerate this section" to all prep brief sections (currently full-brief only)
- [ ] Add user feedback on individual sections (not just full brief)
- [ ] Use section-level feedback to improve prompt selection over time

---

## Phase 2: Post-Search and Retention (Months 3–6)

**Theme**: Capture users after the offer. Build the revenue that survives the natural end of the search lifecycle.

### Alumni Mode
- [ ] "I accepted an offer" flow — celebratory but private
- [ ] Automatic downgrade to Alumni plan ($19–29/month)
- [ ] Features retained: company monitoring (5 companies), quarterly signal digest, accomplishment repository, contact archive
- [ ] Prompt: "Stay sharp. The best time to start the next search is 3 years before you need to."

### Competitive Intelligence for Current Role
- [ ] Monitoring dashboard for users in "employed" mode
- [ ] Watch competitor companies, industry signals, executive movements in their space
- [ ] Positions Starting Monday as an ongoing strategic intelligence tool, not just a search tool
- [ ] Messaging: "Your search is done. Your market intelligence isn't."

### In-App Referral Program
- [ ] "Who else in your network is in search?" prompt at offer capture
- [ ] Referral link generation with tracking
- [ ] Reward: one free month for referrer, one month added to referee trial
- [ ] Simple, no friction — one click to copy referral link

### Onboarding Improvement
- [ ] Measure time-to-first-brief by cohort
- [ ] A/B test onboarding step sequencing
- [ ] Exit survey for cancelled trials (what was missing?)

---

## Phase 3: Executive Tier and B2B (Months 6–12)

**Theme**: Launch the high-value tiers. Open the institutional revenue channel.

### Executive Tier (Waitlist Launch)
- [ ] Board and PE firm intelligence (track board composition changes, PE portfolio company transitions)
- [ ] Unlimited company pipeline
- [ ] Priority brief generation (queue priority for Opus model)
- [ ] Dedicated account review (human touch, quarterly)
- [ ] $499/month

### Outplacement Integration
- [ ] White-label or co-branded experience for outplacement partner firms
- [ ] Bulk seat provisioning (company pays, executive uses)
- [ ] Partner admin portal (usage, seat management)
- [ ] Revenue model: per-seat monthly fee to the partner firm
- [ ] Target partners: Lee Hecht Harrison, Right Management, Challenger Gray, boutiques

### Recruiter Relationship Layer
- [ ] Recruiter can share a prep brief directly with their candidate in Starting Monday
- [ ] Candidate grants recruiter view-only access to their pipeline (optional)
- [ ] Recruiter-facing workflow: candidate list, brief access, milestone visibility
- [ ] Revenue model: recruiter subscription (not per-candidate)

### Campaign Tier (Waitlist Launch)
- [ ] 90-day managed campaign
- [ ] 1:1 strategy session with search expert
- [ ] Curated recruiter introductions
- [ ] Concierge brief review and coaching
- [ ] 3-month minimum, limited availability
- [ ] $999/month

---

## Phase 4: Network and Intelligence Scale (Year 2)

**Theme**: Platform effects. The network makes the product better for every user.

### Peer Network (Confidential)
- [ ] Opt-in "quiet network" — anonymized until both parties agree to connect
- [ ] Match on: industry, function, target company overlap, geography
- [ ] Warm introduction mechanism: "There's someone in your network also watching Acme Corp."
- [ ] No public profiles. No feed. No LinkedIn-style engagement.

### Aggregated Intelligence
- [ ] Anonymized, aggregated signal data across the user base
- [ ] "5 Starting Monday users are watching this company. 3 of them have a contact in common with you."
- [ ] Role detection before posting, confirmed by multiple independent scans

### HR Transition Benefit (Corporate B2B)
- [ ] Starting Monday offered as a company-funded transition benefit for executives being transitioned
- [ ] Company pays 6-month access per seat
- [ ] Alternative to traditional outplacement: self-directed, modern, lower cost
- [ ] Requires legal/compliance review of the offering structure

---

## Feature Graveyard (Considered and Deferred)

| Feature | Why Deferred |
|---------|-------------|
| Salary benchmarking | Data sourcing is hard; Levels.fyi and Radford serve this better at scale |
| Company financials (Crunchbase integration) | Useful but users can self-attach; not worth API cost until scale |
| Automated LinkedIn outreach | High risk of ToS violation; lower quality than drafted outreach |
| Video interview prep | Out of scope for current positioning; different product |
| Cover letter templates | Outreach drafting covers this better; templates are too generic |
| ATS integration | Wrong buyer for the current persona; executives do not use ATS tools |

---

## Open Questions

1. **Alumni mode pricing**: $19 or $29? Does a lower price retain more users, or does it signal lower value? Test both.

2. **Accomplishment repository UX**: Import from resume automatically, or let the user build from scratch? The auto-import is faster to first value but may need significant correction.

3. **Recruiter tier**: Is the recruiter a paying customer or a free distribution channel? A recruiter who recommends Starting Monday to 20 candidates/year may be worth a free account.

4. **Manager Tools partnership timing**: What does the product need to look like to be "advice-defensible" to Mark Horstman? What user stories need to exist? This gates the partnership conversation.

5. **Executive tier waitlist**: How many people on the waitlist before we build? And do we build for the waitlist or charge a deposit to validate?
