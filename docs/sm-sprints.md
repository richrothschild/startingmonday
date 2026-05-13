# Starting Monday — Unified Sprint Plan
**Version 1.0 — May 8, 2026**
**Status: Canonical. Supersedes product-sprints.md and startingmonday_sprint_plan.md.**

---

## Planning Principles

- **Integrated:** Each sprint covers product development, B2C GTM, and B2B outreach simultaneously. The business requires all three tracks in parallel.
- **Solo-founder calibrated:** ~20-25 hours per sprint available (shared with personal job search). No heroics, no sprint-busting tasks.
- **Impact-sequenced:** Conversion infrastructure before acquisition. Retention before scale. Product quality before Manager Tools.
- **Graduated B2B:** B2B outreach begins Month 3. Sales Navigator + DMs are batched and async — they don't block product work.

---

## Current State Baseline (May 8, 2026)

**What's live:**
- Core product loop: pipeline, contacts, calendar, AI chat, prep briefs, outreach drafting, company monitoring
- Mobile UI: fixed (12 issues resolved May 7)
- Auth: OAuth back-button history fix deployed
- Pricing: Monitor $49, Active $129 (Executive tier not yet live)
- LinkedIn Optimizer: live at /optimize
- Daily briefing: live (quality to be monitored)

**What's missing (grade-blocking):**
- Confidentiality promise on landing (Persona 1 conversion blocker)
- Trial tracking and non-converter interview process
- Scraper failure alerting (silent misses are trust-killers)
- Activation email drip (trial users going dark)
- Onboarding wizard (blank dashboard = churn)
- Executive tier ($249) with salary intelligence, daily scan, recruiter enhancements
- Demo page (live streaming brief, no login)
- Company Discovery Engine (Persona 2 can't use product without it)
- Momentum Score + nudge mechanics (Week 3-4 retention wall)
- Coach tier (B2B cannot close without it)
- B2B outreach not yet started

---

## Sprint A — May 19-Jun 1, 2026
**Theme: Conversion Foundation. Fix what's broken before acquiring more users.**

Nothing else matters until you know why trial users don't convert. This sprint creates the infrastructure to measure and improve conversion.

### Product (12h)

**[M] 1.1.1 — Confidentiality promise above fold on landing page** (2h)
Four sentences, plain language, above the fold: what you store, what you don't, what never happens (training, sharing), how to delete everything. No link to a ToS page. The statement IS the promise.
*Done: Live at startingmonday.app before May 19.*

**[M] 1.1.2 — Trial user tracking** (3h)
Tag every new signup with: source (utm_source or referral code), date, trial start, trial end, onboarding_completed (bool), first_company_added (bool). Admin view showing all trials and their status.
*Done: Every trial user has full attribution; non-converters identifiable by name and status.*

**[S] 1.1.3 — Scraper failure alerting** (4h)
When any company scan returns 0 results 3 consecutive times: email Rich immediately with the company name, user, and last 3 scan results. Do not let silent failures accumulate.
*Done: Alert fires within 1 hour of 3rd consecutive empty result. Tested with a real company.*

**[L] 1.1.4 — Activation email drip** (3h)
6 emails via Resend, sequenced off trial start date. Day 0: setup checklist. Day 3: "did you add your first company?" (direct link). Day 5: "your search looks like this to a recruiter" (profile completeness brief preview). Day 7: "7 days left + what paying users did in their first week." Day 10: "4 days left." Day 14: "trial ends today."
*Done: All 6 emails live, sending on schedule, unsubscribe working.*

### B2C GTM (3h)

**[S] 2.1 — LinkedIn content calendar, first 3 weeks** (1h)
Write 9 posts: 3 data posts (scan findings), 3 coaching posts (specific outreach structures), 3 behind-the-build posts. Schedule in Buffer or publish manually.
*Done: First 9 posts drafted. First 3 approved and scheduled.*

**[S] 2.2 — LinkedIn profile updated** (1h)
Headline: "Transformation CIO | Building AI tools for executive search | Starting Monday" or similar. Featured section: link to /optimize and one data post.
*Done: Updated before May 19.*

**[S] 2.3 — /optimize quality audit** (1h)
Run 5 mock profiles through /optimize. Review: is every critique specific? Would a CIO reading this feel like the tool knows the market, or like it's generic? Fix any generic outputs before promoting.
*Done: 5 runs reviewed; all produce specific feedback.*

### B2B GTM (4h)

**[S] 3.1 — LinkedIn Sales Navigator activated** (1h)
Subscribe. Build two saved searches: (1) career coaches, active on LinkedIn, US, 2nd-degree preferred; (2) VC/PE operating partners, US, tech focus.
*Done: Account live. Two saved searches built.*

**[M] 3.2 — First 20 coach DMs sent** (2h)
Write the DM template (see sm-gtm-b2b.md). Send 20 connection requests to active career coaches. Begin with 2nd-degree connections (shared connections increase response rate).
*Done: 20 DMs sent. Response tracking spreadsheet started.*

**[S] 3.7 — Early access coaches identified** (1h)
From the DM responses, invite 2-3 coaches to try the current product as early access. Frame: "I'd like your honest feedback as I build the coach-specific features." No formal Coach tier yet.
*Done: 2 coaches in early access conversations.*

### Ops (3h)

**[S] 4.1 — Trial-to-paid tracking dashboard** (1h)
Simple admin page showing: trial users active, conversion rate to date, channel attribution.
*Done: Admin view built.*

**[S] 1.1.5 — Non-converter interview protocol** (1h)
Write the 10-question interview script. Set up a Calendly or equivalent. First email to any non-converter within 72 hours of trial expiry: "Can I get 10 minutes to understand what we could have done better?"
*Done: Protocol live. First non-converter email sent.*

**[S] 4.4 — Stripe dunning configured** (1h)
3 retry attempts over 7 days. Grace period: 7 days. Access revocation after grace period. Email templates for failed payment and final notice.
*Done: Dunning tested with test card.*

**Sprint A Success Criteria:**
- Confidentiality promise live
- At least 1 non-converter interview completed
- Activation email drip sending to all active trials
- 20 coach DMs sent
- Scraper alerting live and tested

---

## Sprint B — Jun 2-15, 2026
**Theme: Onboarding Wizard. The single highest-leverage engineering sprint in the plan.**

The blank dashboard is the primary conversion killer. This sprint eliminates it.

### Product (14h)

**[XL] 1.2 — Full onboarding wizard (Steps 1-7)** (12h)
Multi-step shell with progress indicator and auto-save. 7 steps:
1. Role type + experience level + search status (active/passive/exploring)
2. Target companies (minimum 3; suggests popular companies by sector if blank)
3. Resume upload or paste (optional but strongly prompted: "better brief quality with resume")
4. Briefing time + timezone (defaults to 7am; simple time picker)
5. Generate first prep brief for one of their companies (in-wizard, streaming)
6. Outreach draft for one of their contacts (in-wizard or skippable)
7. "Your search is live" — confirms first briefing time and what arrives tomorrow

*Done: Full wizard works end-to-end. User can complete in under 10 minutes. First brief generated before exiting wizard.*

**[S] 1.2.7 — Wizard completion confirmation screen** (2h)
Shows: companies added (count), first briefing scheduled (time), next scan scheduled (time). Simple, clear, actionable. "Your search starts working for you at 7am tomorrow."
*Done: Screen visible after wizard completes.*

### B2C GTM (2h)

**[S] 2.5 — Resend email list segments** (1h)
Set up 3 segments: /optimize visitors (from email capture), trial users, paying users. UTM parameters for each acquisition path.

**[S] 2.9 — Testimonial request to alpha users** (1h)
Personal email to each alpha user: "Would you write 2-3 sentences about your experience with Starting Monday? Specifically what you'd tell another CIO in search about it?"
*Done: At least 1 testimonial response received.*

### B2B GTM (4h)

**[M] 3.4 — ICF webinar speaker proposal** (2h)
Write and submit a 300-word session proposal to ICF: "AI and executive coaching: how data-driven search is changing what your clients expect." Target a regional chapter first (easier to get accepted).

**[M] 3.6 — Coach demo call flow documented** (2h)
Write the 15-minute demo structure (see sm-gtm-b2b.md). Practice once with a mirror or recording. Know every possible objection and how to handle it.
*Done: Demo flow written. Ready for first call.*

### Ops (2h)

**[S] 4.3 — Customer support inbox** (1h)
Document the support email address. Set up auto-reply with: name + SLA (24h response). Basic FAQ covering top 5 questions from alpha users.

**[S] 4.6 — GDPR minimum review** (1h)
Verify Privacy Policy covers: data stored, data shared, right to deletion, right to export. Send DPA requests to Anthropic (if required), Stripe (signed), Resend.

**Sprint B Success Criteria:**
- Onboarding wizard live; at least 2 new trial users complete it
- First trial-to-paid conversion rate measured (preliminary, based on any data)
- ICF proposal submitted
- First coach demo call scheduled or completed

---

## Sprint C — Jun 16-29, 2026
**Theme: Monitor Tier + Passive UX. Unlock the structural MRR stabilizer.**

Passive users (Persona 4) are the MRR anchor. They stay 12-24 months. The current product doesn't serve them — it's designed for active searchers. This sprint fixes that.

### Product (10h)

**[M] 1.3.1 — Passive setup track** (3h)
A "3-field fast path" for passive users: title, 5 companies (or "suggest for me"), email. Briefing defaults to weekly digest instead of daily. No pipeline setup, no contact management. Done in under 3 minutes.

**[L] 1.3.2 — Weekly Market Intelligence Digest** (5h)
Sunday email to Monitor tier users: scan matches from the week (all companies in watchlist), notable signals (new executive hires, funding announcements at target companies), and 2 specific "you might want to add this company" suggestions based on profile. No login required. All value in the email.

**[M] 1.3.3 — Proactive company suggestions in Monitor dashboard** (2h)
On first login after passive setup: "Based on your title and sector, you might want to watch these 5 companies." One-click add. Uses Claude + basic profile to suggest.

### B2C GTM (4h)

**[M] 2.6 — First SEO article written and published** (3h)
Topic: "We scanned 400 career pages this week — here's what CIO hiring looks like in Q2 2026." Real data from SM's scan results. Published on /blog (build simple MDX blog if not yet live). 1,500+ words. SEO-optimized for: "CIO job market 2026" and "how to monitor company career pages."

**[S] 2.4 — Post-Zoom follow-up to Wake Forest/Stanford contacts** (1h)
Personal emails to the 5 trial users the career center referred. Ask: "Is the daily briefing useful? What's one thing you'd change?" Collect feedback; feed into product.

### B2B GTM (2h)

**[S] Ongoing coach outreach — 20 DMs/week** (2h)
Continue Sales Navigator DMs. Target: first demo call completed this sprint.

### Ops (1h)

**[S] 4.10 — Referral and testimonial tracking spreadsheet** (1h)
Simple: name, email, asked/not-asked, testimonial received/not, referral sent/not.

**Sprint C Success Criteria:**
- Passive setup track live; at least 1 Monitor tier user converted
- Weekly digest live and sending
- First SEO article published
- First coach demo call completed

---

## Sprint D — Jun 30-Jul 13, 2026
**Theme: Executive Tier — Part 1. The ARPU unlock and the executive audience signal.**

### Product (14h)

**[M] 1.4.1 — Executive tier Stripe product + feature gate** (3h)
$249/month, $199/year. Feature gates: salary intelligence, daily scan, recruiter tracker enhancements. Upgrade CTA on all gated features.

**[S] 1.4.2 — Daily scan for Executive tier** (2h)
Scan frequency logic: if subscription_tier === 'executive', scan daily. Others: 3x/week. Deploy and test.

**[M] 1.4.3 — Recruiter tracker enhancements** (4h)
Firm-level grouping (all contacts from Korn Ferry grouped), priority flag (star icon), CSV export button.

**[L] 1.4.4 — Salary intelligence module** (5h)
Accessible from the pipeline "Offer" stage card. Input: role, company, location. Output: compensation range (low/target/ceiling), negotiation script, pushback response templates. Claude Sonnet call with geo-adjusted comp data reasoning.

### B2B GTM (2h)

**[S] 3.9 — Per-transition pricing model documented** (1h)
Write up the VC/PE pricing: $250 setup fee + $129/month Active or $249/month Executive, 3-month minimum. One-pager ready to send.

**[S] Ongoing coach outreach** (1h)

**Sprint D Success Criteria:**
- Executive tier live and purchasable
- Daily scan working for Executive users
- Salary intelligence accessible and producing useful output
- First Executive tier upgrade (if any existing user converts)

---

## Sprint E — Jul 14-27, 2026
**Theme: Demo Page + Landing Refresh. Convert the wow moment before signup.**

### Product (12h)

**[L] 1.5.1 — Demo page** (8h)
`/demo` — company name + target title input. Streaming Claude prep brief. No login required. Email gate after showing 30% of brief. CTA at end: "Try this for every company in your search — free 30-day trial." Quality of the brief is the only thing that matters. This must be the best prep brief a user has ever seen. If it's generic, it converts nobody.
*Done: Demo page live at /demo with streaming brief, email capture gate, and trial CTA.*

**[M] 1.5.4 — Landing page refresh** (4h)
- Pricing section: $129 Active / $249 Executive (not $199)
- Testimonials: use real quotes from alpha users (minimum 1) or placeholder with "join the waitlist"
- Demo CTA: "See it in action — try a live prep brief" → /demo
- Remove any fabricated social proof
*In progress: Demo CTA and testimonials refreshed; pricing currently intentionally held at live production rates pending explicit pricing change decision.*

### B2C GTM (3h)

**[M] 2.7 — LinkedIn paid ads setup** (2h)
Account setup only if trial-to-paid conversion is measured at ≥35% by this sprint. If not, defer. Ad creative: "We scanned 500 career pages this week..." and "Start monitoring your companies before the search goes public." $500 test budget targeting CIO/CTO/VP IT with "open to work" signal.
*Decision (2026-05-12): Deferred. Gate check returned 0 ended trials and no measurable conversion baseline yet.*

**[S] Second SEO article** (1h)
Topic: "Executive job search daily routine — what the top 1% of senior candidates do differently."
*Done: Published at /blog/executive-job-search-daily-routine.*

### B2B GTM (3h)

**[M] 3.8 — VC/PE outreach begins** (2h)
Activate the VC/PE saved search in Sales Navigator. Send first 10 DMs, trigger-based (reference a recent portfolio company leadership transition if visible).
*In progress: Send-ready outreach pack and tracker created in docs; awaiting manual send execution in Sales Navigator.*

**[S] 3.10 — University outreach to 5 additional schools** (1h)
Personalized emails to career center directors at 5 MBA programs referencing the Wake Forest/Stanford conversation: "Following a conversation with [name] about how career centers are using AI tools for alumni in search, I wanted to share something I built..."
*In progress: 5-school outreach pack and tracker created; awaiting manual email send.*

**Sprint E Success Criteria:**
- Demo page live at /demo; email capture working
- Landing page refresh live with real testimonials or clean placeholder
- VC/PE outreach started
- University outreach to 5+ schools sent

---

## Sprint F — Jul 28-Aug 10, 2026
**Theme: Company Discovery Engine. Unlock Persona 2 and passive users without a target list.**

### Product (10h)

**[L] 1.6.1-1.6.4 — Company Discovery Engine** (10h)
Full discovery flow: profile inputs → Claude-generated ranked company list with rationale → accept/reject → companies added to watchlist + queued for scan. "Companies like X" seed mode. Integrated into onboarding Step 2 as an alternative to manual entry.

### B2C GTM (2h)

**[S] 2.10 — Social share card for /optimize** (1h)
Simple: "My LinkedIn profile scores [X]/100 for [role]. See yours: [link]" Opens LinkedIn share dialog. Opt-in, not automatic.

**[S] Third SEO article** (1h)
Topic: "How to monitor company career pages automatically in 2026 — what tools actually work."

### B2B GTM (3h)

**[S] 3.11 — NACE conference submission** (1h)
Submit session proposal: "AI-powered executive alumni services: what career centers are building and what's working."

**[S] 3.12 — NACE membership** (30 min)
$400/year. Purchase and activate.

**[S] Ongoing coach + VC/PE outreach** (1h)

**Sprint F Success Criteria:**
- Discovery engine live; at least 1 user creates their target list via discovery
- NACE submission sent
- 6+ companies in Monitor tier users' watchlists via discovery (not manually added)

---

## Sprint G — Aug 11-24, 2026
**Theme: Momentum Score + Coach Tier. Retention mechanics and B2B product launch.**

The heaviest product sprint in the plan. Coach tier is the B2B enabler; Momentum Score is the Week 3-4 retention fix.

### Product (16h)

**[M] 1.7.1-1.7.3 — Momentum Score + nudge email** (6h)
Weekly calculation (weighted pipeline activity formula). Dashboard widget. Drop nudge email (fires within 24h when score drops ≥15 points with specific, personalized content).

**[M] 1.8.1-1.8.5 — Coach Tier** (10h)
Full implementation: coach_relationships DB + RLS, client invite flow, multi-client dashboard, white-label briefing, Stripe product. This is the B2B revenue unlock. First Coach tier subscribers possible as soon as this ships.

### B2B GTM (2h)

**[M] 3.16 — Podcast guest pitch to 2-3 podcasts** (2h)
Coaching for Leaders, Talent10x. Personalized pitch with specific angle: "The data on what makes executive searches succeed or fail in 2026 — what monitoring 5,000 career pages taught us."

**Sprint G Success Criteria:**
- Coach tier live; at least 1 coach converts to paid ($599/month)
- Momentum Score calculating and displaying for all active users
- At least 1 nudge email sent and opened
- Podcast pitch sent to 2 shows

---

## Sprint H — Aug 25-Sep 7, 2026
**Theme: Positioning Coach + Resume Tailoring. Unlock Persona 2 fully.**

### Product (14h)

**[L] 1.9.1-1.9.4 — Positioning Coach** (6h)
Multi-turn Claude session for pivot/level-jump/gap framing. Output: polished positioning statement saved to user_profiles, injected into outreach drafting automatically. Gap coaching mode.

**[L] 1.10.1-1.10.4 — Resume Tailoring** (8h)
Full tailoring flow: paste JD, Claude rewrites bullets, diff-highlighted output, accept/reject per bullet, ATS keyword score, DOCX export. Hallucination guard (no dates/companies not in original resume).

### B2B GTM (2h)

**[S] 3.13 — Retained search firm referral program** (1h)
Reach out to 5 warm recruiter relationships from Rich's personal search. Offer 10 trial codes each. Ask: "Would you recommend this to executive candidates in your network?"

**[S] Coach case study document started** (1h)
Interview first converted coach: "What changed about your practice since you started using SM?" Document outcomes. Request permission to use as case study.

**Sprint H Success Criteria:**
- Positioning Coach live; at least 2 users create positioning statements
- Resume tailoring live; at least 1 DOCX export downloaded
- First coach case study drafted
- Search firm referral program emails sent to 5 recruiters

---

## Sprint I — Sep 8-21, 2026
**Theme: Referral + Churn Mechanics. Close the MRR leaks.**

### Product (8h)

**[M] 1.11.1-1.11.2 — Referral program** (4h)
Unique link per user. Click tracking. Attribution. Stripe credit on conversion. Dashboard widget with "You've referred X — X are paying — you've earned X free months."

**[M] 1.11.4-1.11.5 — Pause-on-cancel + 6-month reactivation** (4h)
Cancel flow: offer 3-month pause at 50% price before full cancel. 6-month post-cancel: automated reactivation email personalized with their old search data.

### B2C GTM (1h)

**[S] 4th SEO article** (1h)
Topic: "The 12 things executives do wrong in their job search (and what the data says actually works)."

### B2B GTM (2h)

**[S] 3.14 — Coach case study completed and published** (2h)
Finalize coach case study. Publish to /blog or use as sales asset in B2B outreach. First reference-able customer.

**Sprint I Success Criteria:**
- Referral program live; at least 1 referral link shared
- Pause-on-cancel live
- Coach case study published

---

## Sprint J — Sep 22-Oct 5, 2026
**Theme: B2B Institutional Features. Enable university and outplacement deals to close.**

### Product (6h)

**[M] Admin reporting dashboard for institutional buyers** (4h)
University/coach admin view: all users under their license, Momentum Score averages, weekly active users, aggregate pipeline stage distribution. Exportable report.

**[M] Per-seat bulk billing in Stripe** (2h)
Bulk license product: N seats × $75/month. Invoice-based option for annual contracts.

### B2B GTM (4h)

**[L] 3.15 — B2B landing page** (3h)
`/business` or `/partners` — three sections: For Career Coaches (features + pricing), For Career Centers (institutional pricing + demo CTA), For Enterprises (contact form). Live.

**[S] 3.17 — Boutique outplacement firm outreach** (1h)
Identify 10 boutique outplacement firms via LinkedIn. Send 5 personalized pitches referencing the coach case study and institutional reporting feature.

**Sprint J Success Criteria:**
- B2B landing page live
- Admin reporting dashboard live
- First outplacement firm conversation started
- University pipeline: ≥2 active conversations

---

## Sprint K — Oct 6-19, 2026
**Theme: Manager Tools Qualification. Start building the case.**

### Product (4h)

**[M] Infrastructure stress test** (2h)
Simulate 300 concurrent new signups (Manager Tools scenario). Identify and fix any bottlenecks before they become reality.

**[M] Product quality audit** (2h)
End-to-end review of every core flow: onboarding, briefing, prep brief, outreach draft, salary intel. Any output that sounds generic gets a prompt rewrite.

### B2C GTM (2h)

**[M] Manager Tools qualification dossier updated** (2h)
Document: 25+ satisfied users, selected outcomes, product quality evidence, infrastructure readiness. This is the deck to hand to Mark. Not a sales pitch — a transparent account of what the product does and for whom.

### B2B GTM (2h)

**[S] Coach outreach → 20 coaches by end of Sprint K** (1h)
At 20 coaches × $599 = $11,980 MRR from coaches alone.

**[S] University: 2 active deals in final stage** (1h)
Follow up with the 2 most advanced university conversations. Goal: institutional pilot agreement signed.

**Sprint K Success Criteria:**
- Manager Tools qualification dossier exists and is accurate
- Infrastructure handles 300-user spike scenario
- 20 coach subscribers reached (or pipeline to reach by Month 14)
- 1 university pilot deal closed or imminent

---

## Grade Trajectory by Sprint

| | Persona 1 | Persona 2 | Persona 4 | Persona 5 | B2B | Distribution |
|--|-----------|-----------|-----------|-----------|-----|-------------|
| **Now** | B+ | C+ | B- | B | C- | C |
| **After A** | A- | C+ | B- | B | C+ | C+ |
| **After B** | A- | C+ | B | A- | B- | C+ |
| **After C** | A- | C+ | B+ | A- | B- | B- |
| **After D** | A | C+ | B+ | A- | B | B |
| **After E** | A | C+ | B+ | A | B | B |
| **After F** | A | B | B+ | A | B | B+ |
| **After G** | A | B | B+ | A | B+ | B+ |
| **After H** | A | B+ | A- | A | B+ | B+ |
| **After K** | A | B+ | A- | A | A- | A- |

*Overall product grade after Sprint K: A-*

---

## Key Decision Gates

| Gate | Sprint | Question |
|------|--------|----------|
| **D1 — Conversion valid?** | B | Trial-to-paid ≥35%? If not, pause acquisition and fix activation. |
| **D2 — Channel proven?** | E | Is LinkedIn content or /optimize producing ≥5 users/month? If yes, add LinkedIn ads. If no, find the root cause. |
| **D3 — B2B viable?** | G | Has any coach converted to paid? If no coach after 150 DMs, reassess the pitch and demo. |
| **D4 — Manager Tools timing** | K | Are 25 documented satisfied users achievable by Month 15? If track is off, evaluate earlier outreach with lower bar. |
| **D5 — Hire or not?** | J | Is B2B pipeline exceeding 10 live conversations simultaneously? If yes, budget for a part-time BD contractor. |

---

*Version 1.0 — May 8, 2026*
*Supersedes: product-sprints.md, startingmonday_sprint_plan.md*
*Companion: sm-wbs.md, sm-gtm-b2c.md, sm-gtm-b2b.md, product-wbs.md*
