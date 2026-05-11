# Starting Monday — Business Analysis
**Date:** May 7, 2026

---

## TAM Analysis

### Who is the customer

**B2C:** VP and above executives (VP, SVP, EVP, C-suite, Board) in active or passive job search. Average search at this level runs 9–18 months. The search is relationship-driven, not job-board-driven, which is exactly what Starting Monday is built for.

**B2B:** Outplacement firms, MBA/executive education career centers, VC/PE funds that transition portfolio executives, HR consulting firms.

---

## B2C TAM

### US VP+ Executive Population

| Company size | Estimated companies | VP+ per company | VP+ total |
|---|---|---|---|
| 5,000+ employees | 5,000 | 20+ | 100,000 |
| 500–5,000 | 100,000 | 4 | 400,000 |
| 100–500 | 500,000 | 1.5 | 750,000 |
| **Total US VP+** | | | **~1.25M** |

Active searchers at any time: ~15% (executives turn over every 3–5 years, search lasts 9–18 months) = **~190,000 active US executive job seekers**

Those willing to pay for a dedicated tool: ~40% = **~75,000 realistic US subscribers**

English-speaking global (UK, Canada, Australia, Singapore): add 60% = **~120,000 total realistic addressable subscribers**

### Revenue by Penetration Scenario

| Scenario | Subscribers | Avg price | ARR |
|---|---|---|---|
| TAM (full penetration) | 120,000 | $99/mo | $143M |
| SAM (10% awareness/reach) | 12,000 | $99/mo | $14.3M |
| Year 1 SOM | 300–600 | $99/mo | $356K–$713K |
| Year 2 SOM | 1,500–3,000 | $99/mo | $1.8M–$3.6M |
| Year 3 SOM | 5,000–8,000 | $99/mo | $5.9M–$9.5M |

---

## B2B TAM and Revenue Model

### Outplacement Firms
- Market: ~$1.5B/year in the US. Executive-specific outplacement is ~$300–400M.
- Model: white-label license, $30–50/user/month, or per-cohort flat fee.
- Realistic: 10 mid-size firms, 100 executives each in system at any time = 1,000 seats × $40/mo = **$480K/year**
- 3-year ceiling with 50 firms: **$2.4M ARR**

### Business School / Executive Education Career Centers
- ~200 major programs with active alumni career services.
- Annual institutional license: $8K–$25K/school (alumni database access + white-labeled tool).
- 30 schools × $12K = **$360K/year**
- 3-year ceiling with 100 schools: **$1.2M ARR**

### VC/PE Transition Support
- Funds pay for outplacement support for departing portfolio executives.
- Per-seat: $1,000–$2,500/year per executive.
- 25 funds × 15 transitions/year × $1,500 = **$562K/year**

**Total B2B realistic ceiling at 3 years: $3–4M ARR**

---

## Revenue and Profit by Channel

### Year 2 Projection
*$129/mo Search, $49/mo Intelligence, ~65/35 mix → $99 blended average*

| Channel | Subscribers/seats | Monthly revenue | ARR | COGS | Gross margin |
|---|---|---|---|---|---|
| B2C direct | 2,000 | $198K | $2.4M | $8K | 96% |
| B2B outplacement | 500 seats | $20K | $240K | $2K | 90% |
| B2B schools | 20 schools | $17K | $200K | $1K | 94% |
| **Total** | | **$235K/mo** | **$2.8M** | **$11K** | **~95%** |

### COGS Breakdown at Year 2 Scale

| Item | Monthly cost |
|---|---|
| Claude API (briefings, prep briefs, chat) | $4,000 |
| Supabase + Railway | $500 |
| Proxycurl / data APIs | $1,000 |
| Email delivery (Resend) | $200 |
| Misc | $300 |
| **Total** | **~$6,000** |

### Net Margin by Operating Model

| Operating model | Net margin |
|---|---|
| Solo / founder-led | 85–90% |
| 2–3 person team | 50–60% |
| With sales and marketing investment | 20–35% (3–5x faster growth) |

Gross margin is 95%+ — the highest-margin SaaS tier. Variable cost is nearly zero.

---

## Product Grade vs. World-Class

Graded against a well-funded, mature product in this category (Gong.io-level execution applied to executive job search).

| Dimension | Grade | Notes |
|---|---|---|
| **Core value proposition** | A- | Right audience, right problem, no one else owns C-suite job search as a dedicated product |
| **AI quality and context-awareness** | B | Full profile context on every call is genuinely differentiated. Prompt quality needs refinement. |
| **Onboarding** | C+ | Auth loop bug was bad for first impressions (now fixed). Form is thorough but long. World-class is under 5 minutes to first value. |
| **Design and UX** | B+ | Clean, professional, appropriate for the audience. Consistent design system. Not trying to look like a consumer app. |
| **Data and signal quality** | C+ | Career page scanning is real but narrow. No live news, no LinkedIn, no executive move data beyond Proxycurl. World-class feels like Bloomberg for job seekers. |
| **Email / daily briefing** | B | The mechanism is right. Quality depends on data quality feeding it. |
| **Reliability** | C+ | Recent auth loop, migration debt silently breaking features. World-class has zero silent failures. |
| **Mobile** | D | No app, no PWA, not mobile-first. Executive audience checks their phone first. |
| **Integrations** | D | No calendar, no email sending, no LinkedIn, no ATS. You can't act on insights without leaving the product. |
| **Network / community** | D | Intentional (confidentiality is a feature) but also a ceiling. No referral flywheel. |
| **Pricing / packaging** | B | Two tiers is clean. $49/$129 is reasonable but may be low for the audience. Executives pay $5K–$50K for human coaches. |

### Overall Grade: B-

---

## What's Genuinely Strong

- The positioning is tight. C-suite focus with AI that reads your actual profile is a real differentiation from LinkedIn Premium or Teal.
- The briefing email as a daily habit-driver is the right mechanism.
- The design does not embarrass the product in front of a senior executive audience.
- Gross margin is exceptional — nearly all revenue flows to the bottom line.
- The B2B channel (outplacement, schools, VC/PE) is a large opportunity that requires almost no product changes to pursue.

---

## What Keeps It from A Territory

1. **Silent failures** — missing migrations broke features without any visible error, auth loop survived multiple deploys. World-class products do not have invisible breakage.
2. **No integrations** — the insight-to-action gap is too wide. You get a signal, then you have to go somewhere else to act on it. Calendar and email integration would close this.
3. **Mobile** — this audience lives on their phone. No app is a retention ceiling.
4. **Data thinness** — the AI is only as good as what it can see. Career page scanning is a narrow window. Richer data (news signals, executive moves, earnings calls) would make the product feel indispensable.

---

## Strategic Observation

Without integrations, Starting Monday is a useful dashboard product — something executives check.

With integrations (email, calendar, LinkedIn outreach), it becomes workflow infrastructure — something that runs their search.

That is the difference between a tool people use and a tool people cannot imagine searching without. The pricing the market will bear for the second type is 3–5x higher. The churn is a fraction. The referral rate is organic.

The B2B channel (outplacement, business schools) is the fastest path to revenue that does not require consumer marketing spend. One partnership with a top-10 outplacement firm is worth 500 direct B2C subscribers at lower CAC and higher retention.

---

*Analysis based on product state as of May 7, 2026. Pricing: Intelligence $49/mo, Search $129/mo.*
