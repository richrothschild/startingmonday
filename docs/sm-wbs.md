# Starting Monday — Full Business WBS
**Version 1.0 — May 8, 2026**
**Scope:** Product development + B2C GTM + B2B GTM + Operations. Augments product-wbs.md (which covers Phase 1-4 product dev detail). This document adds GTM and ops work items and cross-references sprint assignments.

**Effort key:** S = 1-3h | M = 3-6h | L = 6-12h | XL = 12-20h
**Priority key:** P1 = critical path | P2 = high impact | P3 = medium impact

---

## Work Package 1 — Product: Persona Grade Fixes

*These are the specific builds required to move each persona grade. Sequenced by impact.*

### 1.1 Conversion Foundation (Sprint A — May 19-Jun 1)

| ID | Task | Effort | Sprint | Priority | Definition of Done |
|----|------|--------|--------|----------|-------------------|
| 1.1.1 | Confidentiality promise section above fold on landing page | S | A | P1 | Live at startingmonday.app; 4-sentence plain-language data policy visible without scrolling |
| 1.1.2 | Trial user tracking — tag each signup with source, date, trial start, trial end in DB | M | A | P1 | Every trial user has full attribution data; non-converters identifiable within 24h of expiry |
| 1.1.3 | Scraper failure alerting — email to Rich when scan returns 0 results 3× consecutive | M | A | P1 | Alert fires within 1 hour of 3rd consecutive empty result |
| 1.1.4 | Activation email drip — Day 0, 3, 5, 7, 10, 14 via Resend | L | A | P1 | All 6 emails live, tested, sending on schedule; unsubscribe works |
| 1.1.5 | Non-converter interview protocol — script, calendar link, tracking | S | A | P1 | First 20 non-converters personally contacted within 72h of trial expiry |

### 1.2 Onboarding Wizard (Sprint B — Jun 2-15)

| ID | Task | Effort | Sprint | Priority | Definition of Done |
|----|------|--------|--------|----------|-------------------|
| 1.2.1 | Multi-step wizard shell — progress indicator, back/next, auto-save | L | B | P1 | Wizard loads; progress persists on back-navigation; state saved on each step |
| 1.2.2 | Step 1: Role type + experience level | S | B | P1 | Input saves to user_profiles |
| 1.2.3 | Step 2: Target companies (add 3 minimum with guided prompts) | M | B | P1 | Companies created in DB; scan queued automatically |
| 1.2.4 | Step 3: Resume upload/paste (optional but prompted) | M | B | P1 | PDF/DOCX uploads; text extracted and stored |
| 1.2.5 | Step 4: Briefing time + timezone | S | B | P1 | First briefing scheduled within 24h of wizard completion |
| 1.2.6 | Step 5: Generate first prep brief for one of their companies (in-wizard) | M | B | P1 | Brief renders during wizard; first "wow" moment before exit |
| 1.2.7 | Wizard completion → "Your search is live" screen with first briefing scheduled | S | B | P1 | User sees confirmation + exact time of first briefing |

### 1.3 Monitor Tier + Intelligence Onboarding (Sprint C — Jun 16-29)

| ID | Task | Effort | Sprint | Priority | Definition of Done |
|----|------|--------|--------|----------|-------------------|
| 1.3.1 | Intelligence setup track — 3-field fast path: title, 5 companies, email | M | C | P1 | Passive user can complete setup in <3 min; briefing time defaults to 7am |
| 1.3.2 | Weekly Market Intelligence Digest — email with signals + scan matches, no login required | L | C | P1 | Digest sends every Sunday; content is relevant, not generic |
| 1.3.3 | Proactive company suggestions in Monitor dashboard — "based on your profile, try these" | M | C | P2 | Suggestions appear on first login; based on title + sector from profile |
| 1.3.4 | Data export (GDPR) — one-click download of all user data as JSON | M | C | P2 | Export works; includes pipeline, contacts, drafts, profile |

### 1.4 Executive Tier (Sprints D-E — Jun 30-Jul 27)

| ID | Task | Effort | Sprint | Priority | Definition of Done |
|----|------|--------|--------|----------|-------------------|
| 1.4.1 | Executive tier Stripe product ($249/mo + $199/yr) + feature gate | M | D | P1 | Executive tier purchasable; gates applied to gated features |
| 1.4.2 | Priority scan frequency — daily for Executive tier users | S | D | P1 | Executive users scanned daily; Active/Monitor stay at 3×/week |
| 1.4.3 | Recruiter tracker enhancements — firm-level grouping, priority flags, CSV export | M | D | P1 | Recruiters grouped by firm; priority flag visible on contact list |
| 1.4.4 | Salary intelligence module — market comp at offer stage, negotiation script | L | D | P1 | Module accessible from pipeline "Offer" stage; output includes range + script |
| 1.4.5 | Executive tier upgrade page + CTAs at feature gates | S | E | P2 | CTAs present at all gated features; upgrade page live |
| 1.4.6 | Executive-specific onboarding path — faster, assumes senior experience | M | E | P2 | Executive users see abbreviated wizard (no basic prompts) |

### 1.5 Demo Page (Sprint E — Jul 14-27)

| ID | Task | Effort | Sprint | Priority | Definition of Done |
|----|------|--------|--------|----------|-------------------|
| 1.5.1 | Demo page — company name + target title input; streaming prep brief; no login | L | E | P1 | Brief streams in <8 seconds; quality matches or exceeds paid product |
| 1.5.2 | Email gate — captures email after showing 30% of brief | M | E | P1 | Email captured before full brief is revealed; integrates with Resend list |
| 1.5.3 | Demo to trial CTA at end of brief | S | E | P1 | "Try this for every company in your search" CTA with trial signup link |
| 1.5.4 | Landing page refresh — pricing fix, real testimonial placeholders | M | E | P1 | $129 Active / $249 Executive correct; no fabricated testimonials; clear confidentiality promise |

### 1.6 Company Discovery Engine (Sprint F — Jul 28-Aug 10)

| ID | Task | Effort | Sprint | Priority | Definition of Done |
|----|------|--------|--------|----------|-------------------|
| 1.6.1 | Discovery API — Claude generates ranked target company list from profile | L | F | P2 | Returns 10-15 companies with rationale; <10 second response |
| 1.6.2 | Discovery UI — profile inputs → company list → accept/reject → watchlist | M | F | P2 | Full flow works; accepted companies queued for scan |
| 1.6.3 | "Companies like X" seed mode — anchor on one known company | S | F | P3 | Seed input accepts a company name; output uses it as a reference point |
| 1.6.4 | Discovery integrated into onboarding wizard Step 2 as alternative to manual entry | M | F | P2 | Wizard offers "I don't have a list" path that routes to discovery |

### 1.7 Momentum Score + Retention Mechanics (Sprint G — Aug 11-24)

| ID | Task | Effort | Sprint | Priority | Definition of Done |
|----|------|--------|--------|----------|-------------------|
| 1.7.1 | Momentum Score calculation — weighted formula from pipeline activity | M | G | P1 | Score calculated weekly for every active user; stored in DB |
| 1.7.2 | Momentum Score dashboard widget | S | G | P1 | Score visible on dashboard home; trend direction shown |
| 1.7.3 | Momentum drop nudge email — fires within 24h when score drops ≥15 points | M | G | P1 | Email triggers correctly; references user's specific overdue items |
| 1.7.4 | Weekly progress report (Sunday email) — pipeline snapshot + benchmark | M | G | P2 | Report sends Sunday; includes week-over-week comparison |
| 1.7.5 | Week 3 in-app coaching prompt — "most searches slow down now, here's what works" | S | G | P2 | Prompt appears at Day 21; links to specific actions |

### 1.8 Coach Tier (Sprint G — Aug 11-24)

| ID | Task | Effort | Sprint | Priority | Definition of Done |
|----|------|--------|--------|----------|-------------------|
| 1.8.1 | Coach_relationships DB migration + RLS (coaches read client data, never cross-client) | M | G | P1 | Migration applied; RLS tested; cross-client query returns zero rows |
| 1.8.2 | Client invite flow — coach sends invite link → client signs up under coach | M | G | P1 | Full flow works; relationship established in DB |
| 1.8.3 | Coach multi-client dashboard — client list with Momentum Score, overdue count | L | G | P1 | Dashboard loads; coach can see all clients; drill into any client |
| 1.8.4 | White-label briefing — coach logo + firm name in client briefing header | M | G | P1 | Coach can upload logo; clients' briefings reflect coach branding |
| 1.8.5 | Coach tier Stripe product ($599/mo) + feature gate | S | G | P1 | Purchasable; 10-client limit enforced |

### 1.9 Positioning Coach (Sprint H — Aug 25-Sep 7)

| ID | Task | Effort | Sprint | Priority | Definition of Done |
|----|------|--------|--------|----------|-------------------|
| 1.9.1 | Positioning coach API — multi-turn Claude session for pivot/level-jump/gap framing | L | H | P2 | Returns finalized positioning statement; <3 turns to completion |
| 1.9.2 | Positioning coach UI — mode select (pivot/level-jump/gap), chat, final statement | M | H | P2 | Full UI works; positioning statement saves to user_profiles |
| 1.9.3 | Gap coaching — specialized prompts for employment gap framing | M | H | P2 | Gap mode produces defensible, non-apologetic framing |
| 1.9.4 | Positioning statement injected into outreach drafting system prompt | S | H | P2 | Drafts reference user's positioning statement automatically |

### 1.10 Resume Tailoring (Sprint H)

| ID | Task | Effort | Sprint | Priority | Definition of Done |
|----|------|--------|--------|----------|-------------------|
| 1.10.1 | Resume tailoring API — Claude rewrites bullets for a specific JD | L | H | P2 | Output matches JD language; no fabrication; hallucination guard active |
| 1.10.2 | Tailoring UI — paste JD, diff-highlighted output, accept/reject per bullet | M | H | P2 | User can accept/reject individual bullets; saves tailored version |
| 1.10.3 | ATS keyword score — JD keyword coverage % | M | H | P3 | Score displayed; top missing keywords surfaced |
| 1.10.4 | DOCX export | M | H | P2 | Tailored resume downloads as properly formatted .docx |

### 1.11 Referral Program + Churn Mechanics (Sprint I — Sep 8-21)

| ID | Task | Effort | Sprint | Priority | Definition of Done |
|----|------|--------|--------|----------|-------------------|
| 1.11.1 | Referral tracking — unique link per user, click tracking, signup attribution | M | I | P1 | Every user has a link; referral-sourced signups tagged in DB |
| 1.11.2 | Referral reward — 1 free month on both sides when referral converts | M | I | P1 | Stripe credit applied automatically on referral conversion |
| 1.11.3 | Referral dashboard widget — share prompt at high-satisfaction moments | S | I | P2 | Widget appears after interview scheduled or 60-day mark |
| 1.11.4 | Pause-on-cancel option — 3-month pause at half price instead of hard cancel | M | I | P2 | Pause option offered in Stripe portal before final cancel |
| 1.11.5 | 6-month reactivation email — triggers automatically 6 months after cancel | S | I | P3 | Email sends; personalized with search summary from when they left |

---

## Work Package 2 — B2C Go-to-Market

| ID | Task | Effort | Sprint | Priority | Definition of Done |
|----|------|--------|--------|----------|-------------------|
| 2.1 | LinkedIn content calendar — 12-week plan, 3 posts/week | S | A | P1 | 12 weeks of posts drafted; first 3 approved and scheduled |
| 2.2 | LinkedIn profile optimization for founder — signals "executive career intelligence" | S | A | P1 | Headline updated; featured section shows SM + /optimize |
| 2.3 | /optimize tool content audit — ensure critiques are specific, not generic | M | A | P1 | 5 sample runs reviewed; all produce specific, actionable feedback |
| 2.4 | Wake Forest/Stanford Zoom prep — demo script, trial codes, follow-up plan | S | A | P1 | 10 trial codes ready; follow-up email drafted before call |
| 2.5 | B2C email list setup in Resend — segments: /optimize visitors, trial users, paying | S | B | P1 | Three segments live; attribution tracked |
| 2.6 | First 3 SEO articles drafted — data-driven content, proprietary scan insights | L | C-D | P2 | Articles published; SEO metadata complete; submitted to Google Search Console |
| 2.7 | LinkedIn paid ads account setup and first test campaign | M | E | P2 | $500 test budget; 2 ad variants; conversion tracking to /optimize |
| 2.8 | Demo page SEO — "free executive job search prep brief" targeting | S | E | P2 | Page has title/meta; submitted to Search Console |
| 2.9 | Testimonial collection process — template, outreach cadence, storage | S | C | P1 | Process documented; first testimonial request sent to alpha user |
| 2.10 | Social share card for /optimize output — "my LinkedIn score is X/100" | M | F | P3 | Share card generates on score; opens LinkedIn share dialog |
| 2.11 | Manager Tools qualification dossier — outcomes, testimonials, product quality checklist | M | ongoing | P1 | Living doc updated monthly; target: 25 documented satisfied users by Month 15 |

---

## Work Package 3 — B2B Go-to-Market

| ID | Task | Effort | Sprint | Priority | Definition of Done |
|----|------|--------|--------|----------|-------------------|
| 3.1 | LinkedIn Sales Navigator account activated | S | A | P1 | Account live; saved search for career coaches built |
| 3.2 | Coach outreach — 20 DMs/week, 3-touch sequence, demo call script | S (ongoing) | A | P1 | First 20 DMs sent; demo call scheduled |
| 3.3 | B2B LinkedIn content track — 2 posts/week for coach/HR/VC audience | S (ongoing) | A | P2 | First 4 posts drafted; alternate with B2C posts |
| 3.4 | ICF webinar pitch — submit speaker proposal | S | B | P2 | Proposal submitted; follow up in 2 weeks |
| 3.5 | CCMC newsletter outreach — pitch article or product mention | S | B | P2 | Email sent to CCMC editor |
| 3.6 | Coach demo call deck/flow — 15-minute demo structure, one-pager | M | B | P1 | Demo flow documented; live demo tested with one coach |
| 3.7 | Early access program for coaches (pre-Coach-tier) — 3-5 coaches using product now | S | A | P1 | 3 coaches in early access; feedback being collected weekly |
| 3.8 | VC/PE outreach — trigger-based DMs, saved searches for operating partners | S (ongoing) | E | P1 | Saved search built; first 10 DMs sent within 48h of a visible portfolio transition |
| 3.9 | Per-transition pricing model documented and priced | S | D | P1 | $250 setup + $129-249/month documented; ready to quote |
| 3.10 | University outreach — 5 career centers in addition to Wake Forest/Stanford | M | E | P2 | Personalized emails sent to 5 additional career center directors |
| 3.11 | NACE annual conference submission | S | F | P2 | Session proposal submitted; topic: AI and executive alumni search |
| 3.12 | NACE membership purchased | S | F | P2 | Membership active ($400/year) |
| 3.13 | Retained search firm referral program — 5 firms, 10 trial codes each | M | H | P2 | Warm intro to 5 search firm partners; trial codes provided |
| 3.14 | Coach tier case study — document first 2 coaches' outcomes | M | I | P1 | Written case study; with coach's permission to reference |
| 3.15 | B2B landing page — institutional pricing, demo CTA, coach/university/enterprise sections | L | J | P1 | /business page live with institutional pricing and contact form |
| 3.16 | Podcast guest appearances — pitch 3 relevant podcasts | M | G | P2 | Pitches sent; one appearance scheduled |
| 3.17 | Boutique outplacement firm outreach — identify 10 firms, send 5 pitches | M | J | P2 | 5 pitches sent; 1-2 conversations started |

---

## Work Package 4 — Operations

| ID | Task | Effort | Sprint | Priority | Definition of Done |
|----|------|--------|--------|----------|-------------------|
| 4.1 | Trial-to-paid conversion dashboard — MRR, conversion rate, channel attribution | M | A | P1 | Live admin view; updates daily |
| 4.2 | Non-converter interview tracking — spreadsheet + calendar link | S | A | P1 | Process live; first 5 interviews booked |
| 4.3 | Customer support inbox and SLA — email, 24h response commitment | S | B | P1 | Support email documented; auto-reply with SLA promise |
| 4.4 | Stripe dunning setup — 3 retry attempts, grace period, access revocation | S | A | P1 | Dunning configured in Stripe; tested with test card |
| 4.5 | Prompt quality review — weekly 30-minute review of flagged low-quality outputs | S (ongoing) | A | P1 | Process: each low-rated output reviewed; prompt updated within 1 week |
| 4.6 | GDPR minimum compliance — privacy policy review, DPA with Anthropic/Stripe/Resend | M | B | P1 | Policies live; DPAs signed |
| 4.7 | Infrastructure cost monitoring — alert if monthly cost exceeds $500 | S | A | P2 | Alert configured in Railway/Supabase |
| 4.8 | Monthly business metrics review — users, MRR, churn, CAC by channel | S (monthly) | A | P2 | Dashboard built; review scheduled first Monday of each month |
| 4.9 | Claude API cost per user monitoring — alert if any user exceeds 20% of subscription cost | M | B | P2 | Per-user token tracking active; alert fires at threshold |
| 4.10 | Referral and testimonial pipeline — CRM for tracking promised follow-ups | S | C | P2 | Simple spreadsheet: name, status, promised follow-up date |

---

## Dependency Map (GTM and Ops)

```
[Trial tracking live (1.1.2)]
  → [Non-converter interviews begin]
    → [Conversion rate measured]
      → [LinkedIn ads decision gate]

[Onboarding wizard (1.2)]
  → [Activation drip effective]
    → [Trial-to-paid improves]

[Coach tier (1.8)]
  → [Coach DM conversions possible]
    → [Coach case study (3.14)]
      → [Outplacement firm outreach credible (3.17)]

[Demo page (1.5)]
  → [LinkedIn ads creative created]
    → [Paid acquisition activated]

[25 documented satisfied users]
  → [Manager Tools approach window opens]
```

---

## Summary by Sprint

| Sprint | Product | GTM B2C | GTM B2B | Ops | Total Est. |
|--------|---------|---------|---------|-----|------------|
| A (May 19-Jun 1) | 12h | 3h | 4h | 3h | 22h |
| B (Jun 2-15) | 14h | 2h | 4h | 2h | 22h |
| C (Jun 16-29) | 10h | 4h | 2h | 1h | 17h |
| D (Jun 30-Jul 13) | 14h | 0h | 2h | 1h | 17h |
| E (Jul 14-27) | 12h | 3h | 3h | 0h | 18h |
| F (Jul 28-Aug 10) | 10h | 2h | 3h | 1h | 16h |
| G (Aug 11-24) | 16h | 2h | 2h | 1h | 21h |
| H (Aug 25-Sep 7) | 14h | 0h | 2h | 1h | 17h |
| I (Sep 8-21) | 8h | 1h | 2h | 1h | 12h |
| J (Sep 22-Oct 5) | 6h | 0h | 4h | 1h | 11h |
| K (Oct 6-Oct 19) | 4h | 2h | 2h | 1h | 9h |

*At 20-25 hours/sprint available (founder, mixed build + search), this is achievable with focused execution.*

---

*Version 1.0 — May 8, 2026*
*Companion: product-wbs.md (Phase 1-4 product detail), sm-sprints.md, sm-gtm-b2c.md, sm-gtm-b2b.md*
