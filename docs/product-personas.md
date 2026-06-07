# Product Personas & Feature Set

Owner: Documentation Operations
Status: active
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: yes

## AI Recruiter Platform — Reach + Recurring Revenue

---

## Personas

---

### Persona 1 — The Transformation Executive
**"I know exactly what I want. I just need to move faster and miss nothing."**

- **Who:** CIO, CTO, VP IT, VP Engineering — 18-25 years experience
- **Situation:** In transition (laid off, package deal, or quietly looking) from a $250K-$500K role
- **Search style:** Highly targeted — knows the 20-30 companies, knows the title, has recruiter relationships already
- **Pain:** Too many balls in the air. Misses follow-ups. Inconsistent outreach quality. Can't monitor 20 career pages manually. Pays $5-25K for a human coach but doesn't love the ROI.
- **Willingness to pay:** $199-349/month — easy yes if it saves 5 hours/week
- **Duration:** 3-6 months active search
- **Retention driver:** Pipeline management + daily briefing. Stays until they land.
- **Key features:** Company monitoring, outreach drafting, follow-up manager, recruiter tracker, daily briefing

---

### Persona 2 — The VP/Director Candidate
**"I'm ready for the next level. I just don't know how to make that leap."**

- **Who:** Senior Manager or Director, 12-18 years experience, first attempt at VP-level
- **Situation:** Currently employed, wants to make the jump, has never run a VP-level job search before — all previous jobs came through referrals or internal promotions
- **Search style:** Exploratory — not sure which companies to target, unclear on how to position the step up, nervous about cold outreach to executives
- **Pain:** Doesn't know how to work the hidden job market. Doesn't have a VP-level network. Imposter syndrome about the title jump. Applying to job postings and hearing nothing.
- **Willingness to pay:** $99-199/month
- **Duration:** 6-12 months (longer because employed, more selective)
- **Retention driver:** Positioning coaching + market intelligence. Stays subscribed as a passive looker between active sprints.
- **Key features:** Company discovery engine, positioning coach, outreach drafting, interview prep, progress analytics

---

### Persona 3 — The Mid-Career Climber
**"I've been at this 4 years. I'm ready for something better but I don't know how to find it."**

- **Who:** Individual contributor or first-time manager, 3-8 years experience, moving from first job to second or third role
- **Situation:** First job came from campus recruiting. Real job market is a mystery. Applying through portals and getting silence.
- **Search style:** Broad — doesn't have a clear target list, applying to anything that looks interesting
- **Pain:** No recruiter relationships. No warm intros. Resume disappears into ATS. Doesn't know how to write a compelling LinkedIn message. Can't explain what makes them different.
- **Willingness to pay:** $49-99/month — price sensitive but motivated
- **Duration:** 2-5 months active search
- **Retention driver:** Interview prep (they get more interviews than executives but need more coaching), outreach templates, progress tracking
- **Key features:** Company discovery, resume tailoring, outreach templates, interview prep, LinkedIn optimizer, application tracker

---

### Persona 4 — The Passive Looker
**"I'm not desperate, but I'd leave for the right thing. Just don't make me work hard at it."**

- **Who:** Employed professional at any level, 5-20 years experience, making reasonable money but knows the market has moved
- **Situation:** Comfortable enough to stay but smart enough to know they should always be looking. Can't justify spending time on an active search. Wants to be alerted, not to alert-hunt.
- **Pain:** Job boards require active effort. LinkedIn alerts are low quality. Misses opportunities because they're not watching. Would move for a 30% comp bump but hasn't found it.
- **Willingness to pay:** $49-99/month — but will pay for 18+ months
- **Duration:** 12-24 months subscription (the highest LTV customer in the product)
- **Retention driver:** Background monitoring. The product works while they don't. One good match every few months justifies the subscription indefinitely.
- **Key features:** Company watchlist monitoring, match alerts, minimal weekly input, market intelligence digest

---

### Persona 5 — The Laid-Off Professional
**"I just got the call. I need a plan and I need it now."**

- **Who:** Any level, $80K-$400K salary range, sudden or anticipated job loss
- **Situation:** High urgency, often emotional. May have 3-12 months severance. Knows they need a system but doesn't have one. Used to jobs finding them; now has to go find one.
- **Pain:** Overwhelmed. Doesn't know where to start. Applying to everything and getting nothing. Human coaches are expensive and slow to onboard. Needs accountability and a daily plan.
- **Willingness to pay:** $99-199/month — high urgency drives conversion
- **Duration:** 3-9 months
- **Retention driver:** Daily briefing (accountability), pipeline manager (structure in chaos), momentum tracking (measures progress when it feels hopeless)
- **Key features:** Onboarding wizard (build your profile + target list in 20 minutes), daily briefing, pipeline manager, outreach drafting, progress analytics

---

### Persona 6 — The Career Pivoter
**"I've spent 10 years in finance/consulting/operations. I know I can do this tech role. I just can't get past the resume filter."**

- **Who:** Professional with strong non-traditional background trying to move into tech, product, revenue operations, or adjacent fields
- **Situation:** Transferable skills but wrong job titles. Gets filtered by ATS before a human sees them. Doesn't know which companies actively hire for their background.
- **Pain:** Standard job search advice doesn't apply. Keyword mismatch. Can't get a warm intro because they don't know anyone in the target field yet. Resume tells the wrong story.
- **Willingness to pay:** $79-129/month
- **Duration:** 6-12 months
- **Retention driver:** Positioning coaching (high need for ongoing reframing), company discovery (needs to learn a new target landscape)
- **Key features:** Positioning coach, resume tailoring (translates experience into target-field language), company discovery, outreach templates, interview prep

---

### Persona 7 — The Returning Professional
**"I've been out for 3 years. My network is cold. I don't know how to explain the gap."**

- **Who:** Professional returning after caregiving leave, health leave, relocation, or personal circumstances — typically 8-20 years of prior experience
- **Situation:** Strong track record that stopped 2-5 years ago. Network has gone cold. Hiring market has changed. Lacks confidence to reach out to old contacts. Doesn't know how to address the gap without it dominating the conversation.
- **Pain:** Gap anxiety. Cold network. Rusty outreach skills. Outdated sense of what roles exist and what they pay.
- **Willingness to pay:** $79-129/month
- **Duration:** 4-9 months
- **Retention driver:** Outreach drafting (coaches them through re-activating cold contacts), positioning coach (gap framing), market intelligence (reorienting to current market)
- **Key features:** Gap positioning coach, network re-activation outreach templates, company discovery, market intelligence, LinkedIn optimizer

---

## Feature Set

Organized by what drives **reach** (lowers barrier, expands audience) vs. **retention**
(creates ongoing value, drives recurring revenue).

---

### Core Features — Every Tier

**1. Company Watchlist + Career Page Monitoring**
User adds up to 30 target companies. Platform scans career pages automatically twice a week
and alerts within 24 hours of a new matching role going live. Claude scores each hit for
relevance before alerting — no noise, only real matches.

> *Reach:* Works for every persona. Replaces a manual task everyone hates.
> *Retention:* Keeps passive lookers subscribed indefinitely. They can't replicate this without the tool.

---

**2. AI Recruiter Chat**
Conversational interface with full knowledge of the user's search — their profile, pipeline,
every contact, every follow-up date. Answers questions, drafts messages, gives strategic
advice, updates the pipeline via tool use.

> *Reach:* The core "wow" demo feature that converts trial users.
> *Retention:* Gets better the more it knows. Users build a relationship with it over months.

---

**3. Daily Briefing Email**
Every morning: 3-5 prioritized actions based on overdue follow-ups, new scan matches, and
pipeline state. "Your Flexport intro is 8 days old with no response — here's a follow-up
draft." No login required to get value. Works passively.

> *Reach:* No-effort value. Users get value even when they're busy.
> *Retention:* Strongest retention driver in the product. Habit-forming. Hard to cancel
>             something that arrives every morning with useful information.

---

**4. Pipeline & Follow-Up Manager**
Visual pipeline (Applied → Responded → Interview → Offer). Automated follow-up reminders
based on user-set or AI-suggested cadences. Flags stale entries. Tracks every recruiter and
executive contact with status and next action.

> *Reach:* Replaces spreadsheets and markdown files. Works for every experience level.
> *Retention:* Ongoing active use. Users log in to update and track.

---

**5. Outreach Drafting**
On-demand drafting of cold emails, LinkedIn messages, follow-ups, and thank-you notes.
Learns the user's voice over time. Enforces anti-AI-copy rules — output sounds like a
sharp professional, not a chatbot.

> *Reach:* Immediate, obvious value. One saved job application session justifies the month.
> *Retention:* High-frequency use case throughout the search.

---

### Growth Features — Professional Tier and Above

**6. Company Discovery Engine**
For users who don't have a target list yet: "I'm a senior data engineer with 6 years in
healthcare tech. What companies should I be watching?" Claude generates a ranked, reasoned
target list based on profile, sector, growth stage, and hiring patterns.

> *Reach:* Unlocks Personas 2, 3, 6, 7 who don't arrive with a list. Without this feature,
>          the product only works for executives who already know their targets.

---

**7. Resume Tailoring**
Paste a job description. The platform rewrites your resume bullets to emphasize the most
relevant experience using the job's exact language — without fabricating anything.
Survives ATS keyword filters. Saves 30-45 minutes per application.

> *Reach:* High-frequency, high-value for mid-career and early career personas.
> *Retention:* Used every time they apply. Drives multiple logins per week.

---

**8. LinkedIn Profile Optimizer**
User pastes their LinkedIn About section, headline, and top 3 experience descriptions.
Platform gives a scored critique and rewrites each section for their target role and audience.
Immediate, concrete value at onboarding.

> *Reach:* Killer onboarding hook. Users see value in the first 10 minutes. Drives trial
>          conversion and word-of-mouth.

---

**9. Interview Prep Coach**
When an interview is scheduled, user inputs the company, role, and interviewer names.
Platform briefs them: company background, likely questions for the role, how to position
their specific background, what to ask, what to avoid. Updated for each round.

> *Reach:* High emotional value at a high-stakes moment. Strong word-of-mouth driver
>          ("I used this before my Stripe interview and I was the most prepared I've ever been").
> *Retention:* Creates re-engagement spikes when interviews are scheduled.

---

**10. Positioning Coach**
Interactive coaching for users who need to frame a career pivot, a level jump, or a
gap. "How do I explain 3 years in consulting as relevant to a Chief of Staff role?"
"How do I position a Director title when interviewing for VP roles?" Multi-turn dialogue
that builds a refined positioning statement the user can deploy consistently.

> *Reach:* Unlocks Personas 6 and 7 who need reframing help most.

---

### Retention & Recurring Revenue Features

**11. Weekly Progress Report**
Every Sunday: "This week you contacted 4 people, received 2 responses (industry benchmark: 1-2),
had 1 interview scheduled, and added 3 companies to your watchlist. Your search velocity
is trending up." Gamification-lite. Creates accountability without a human coach.

> *Retention:* Benchmarking creates social proof and motivation to continue. Users feel
>              measurable progress even in slow weeks. Hard to cancel when the number is going up.

---

**12. Market Intelligence Digest**
Weekly or monthly email: "5 companies in your target sectors posted relevant roles this
week." "3 Series C companies in logistics tech closed funding — likely to be hiring
IT leadership in the next 90 days." For passive lookers especially, this is the reason
to stay subscribed with zero active effort.

> *Reach:* Low-friction passive value. Works for employed professionals who can't commit
>          time to an active search.
> *Retention:* Highest LTV driver for Persona 4. Keeps them subscribed 12-18+ months.

---

**13. Momentum Score**
A weekly single-number score (1-100) tracking search velocity: outreach sent, responses
received, interviews scheduled, pipeline movement. Drops when the user goes quiet.
Triggers a specific AI nudge when it drops below a threshold: "Your momentum score dropped
from 68 to 41 this week. You have 3 overdue follow-ups — here's what to send."

> *Retention:* Creates urgency and accountability. Reduces the "I'll get back to my
>              search next week" drift that kills searches (and subscriptions).

---

**14. Salary Intelligence**
When a user reaches the offer stage, the platform briefs them on market comp for their
role, level, and geography. Gives them a negotiation floor, ceiling, and script.
"Based on your background and this market, your range should be $X-$Y. Here's how to
open the negotiation."

> *Reach:* High emotional value at the highest-stakes moment of the search.
> *Retention:* Users who get a strong offer from a product-assisted negotiation become
>              evangelists. Referral driver.

---

## Tier Structure for Reach + Recurring Revenue

| Tier | Price | Target Personas | Key Features |
|---|---|---|---|
| **Monitor** | $49/month | Passive Looker, early Mid-Career | Company watchlist, scan alerts, weekly digest |
| **Active** | $129/month | Mid-Career Climber, Career Pivoter, Returning | All Monitor + chat, daily briefing, outreach drafting, resume tailoring, LinkedIn optimizer |
| **Executive** | $249/month | Transformation Executive, VP Candidate, Laid-Off | All Active + interview prep, positioning coach, salary intelligence, recruiter tracker, priority scan frequency |
| **Coach** | $599/month | Career coaches (up to 10 clients) | Multi-client dashboard, white-label briefings, aggregate pipeline view |

Annual pricing at 20% discount on all tiers.

---

## Recurring Revenue Math

| Scenario | Mix | MRR |
|---|---|---|
| 100 users | 30 Monitor / 45 Active / 20 Executive / 5 Coach | $14,470 |
| 500 users | 150 Monitor / 225 Active / 100 Executive / 25 Coach | $72,350 |
| 1,000 users | 300 Monitor / 450 Active / 200 Executive / 50 Coach | $144,700 |

Passive Lookers (Monitor tier) are the LTV backbone — they stay 12-24 months.
Active searchers churn in 3-6 months but are the acquisition engine (word of mouth
when they land, testimonials, referrals to colleagues).
