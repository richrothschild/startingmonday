# Executive Career OS — Epic

**Decided:** 2026-05-09
**Status:** Queued — begins after current sprint sequence completes

---

## The Repositioning

Starting Monday is not a job search tool. It is an operating system for executive career strategy.

**Before (current framing):** Feature list — AI prep briefs, company scans, outreach drafting, pipeline tracking.

**After (OS framing):** Identity and transformation — executives who run disciplined, intelligence-driven campaigns. The platform runs with you between searches, not just during them.

This shift changes:
- How the homepage is written (transformation, not features)
- How pricing is positioned (career infrastructure, not episodic tool)
- What the product does after a user lands a job (stays useful, not orphaned)
- How executives talk about it to peers ("my career OS" vs. "the tool I used when I was looking")

---

## The Core Insight

The biggest churn problem for job search tools: user succeeds, user leaves.

The Executive Career OS solves this by making the product valuable between searches:
- ongoing market intelligence for their industry
- recruiter relationship management
- executive narrative maintenance
- network health monitoring
- board and succession readiness

An executive using this product is never "between searches" — they are always managing their career.

---

## What Does NOT Change Yet

The searching executive remains the primary user for all current and near-term sprints. The OS vision grows from a strong search core, not by abandoning it.

Do not rewrite the homepage until there are 25+ paying users. The repositioning starts in how we describe the product verbally — in pitches, conversations, and onboarding copy.

---

## Sprint Sequence

### OS Sprint 1 — Post-Search Mode

**Theme:** Give placed executives a reason to stay subscribed.

- New `search_status` field: `active`, `complete`, `paused`
- Post-placement dashboard mode: removes active search UI, shows "Career Intelligence" view
- Ongoing briefing mode: weekly digest instead of daily, focused on market trends and leadership changes in target companies
- "Maintenance mode" pricing: offer downgrade to Monitor tier ($49/mo) instead of cancel
- Placed users keep their company list, contacts, and research history

**Why this first:** The placed page (Sprint 7) proves users exist who land jobs. Post-search mode converts them from churned users to long-term subscribers. This is the single most impactful retention change available.

---

### OS Sprint 2 — Relationship Infrastructure

**Theme:** Make Starting Monday the CRM for an executive's professional network, not just their active search.

- Contact tagging: `recruiter`, `hiring_manager`, `peer`, `coach`, `board`
- Recruiter relationship tracker: last contacted, last role discussed, warm/cold status
- Network health score: visualizes coverage gaps (e.g., "You have 12 companies tracked but contacts at only 4")
- Relationship cadence nudges in briefing: "You haven't talked to [recruiter] in 90 days"
- Post-placement: briefing highlights relationship maintenance, not job openings

**Why this matters:** The OS thesis requires value between searches. Relationship management is the highest-value always-on feature for senior executives — they know their network is their career.

---

### OS Sprint 3 — Executive Narrative Engine

**Theme:** The executive's positioning statement, leadership story, and market narrative live here and evolve over time.

- Persistent positioning summary: 3-sentence executive identity statement generated from profile + career history
- Narrative versioning: track how the executive's story evolves over time
- Interview narrative prep: generates "why this role, why now" framing specific to each company
- LinkedIn headline and summary generator grounded in the narrative
- Narrative gaps: flags missing elements ("Your transformation story is strong, but you have no quantified outcomes from your last role")

**Why this matters:** Executives can't consistently articulate who they are under pressure. This feature solves that. It's also deeply personal data that compounds over time — high switching cost, high retention.

---

### OS Sprint 4 — Always-On Intelligence

**Theme:** Market intelligence that runs whether or not the user is in active search.

- Expanded signal types: PE portfolio activity, leadership changes at target companies, board movement alerts, transformation budget signals
- Industry pulse: weekly summary of CIO/CTO movement in the user's target sector
- Opportunity radar: flags companies showing hiring indicators for senior roles even when user isn't actively pursuing them
- Competitor intelligence: tracks companies' technology investments and organizational changes relevant to the executive's expertise

**Why this matters:** This is the Bloomberg Terminal thesis. An executive who stays subscribed between searches because the intelligence is genuinely valuable is the most defensible user. This sprint makes the product worth $129/mo even when not searching.

---

### OS Sprint 5 — Homepage Repositioning

**Theme:** Rewrite the homepage around transformation and career infrastructure.

- New headline: identity transformation framing ("Run your career like the executive you are" or similar)
- Remove feature bullets from above the fold
- Add before/after contrast: reactive vs. strategic executive
- Testimonials framed around transformation outcomes, not features used
- Pricing framed as infrastructure ("$129/mo for the career intelligence layer most executives don't have")
- Add annual subscription option with "2 months free" to all plans

**Why this last in the sequence:** The homepage should not be rewritten until the product actually delivers on the OS promise. Ship the features first. Then the homepage reflects reality.

---

### OS Sprint 6 — Concierge Layer (Premium)

**Theme:** Add a human + AI hybrid tier for executives who want accountability and validation.

- New tier: Executive Concierge ($499/mo or $4,990/yr)
- Includes: monthly 45-minute strategy call with Rich (or vetted advisor), written narrative review, search health audit
- AI prepares the agenda and brief before each call
- Notes and recommendations stored in the platform after each session
- Limited seats: 10 maximum initially

**Why this exists:** Pure software may underserve executives who want validation, accountability, and strategic challenge. The concierge tier captures that demand at a price that reflects the value — and generates direct insight into how executives actually use the product.

---

## What This Accomplishes

After these six sprints:
- Placed executives stay subscribed because the product remains valuable
- Executives between searches use Starting Monday to manage their market presence, not just apply for jobs
- The platform accumulates career data, relationships, and narrative history that cannot be rebuilt in a competing product
- Pricing reflects infrastructure value, not tool value
- The homepage and pitch accurately represent what the product actually is

---

## Key Decisions

| Decision | Rationale |
|---|---|
| Monthly SaaS stays as base model | Annual is an option; campaign pricing conflicts with OS thesis |
| Post-search mode before homepage rewrite | Build the capability first; then the homepage reflects reality |
| Relationship infrastructure before narrative engine | Contacts are already in the product; extending them is lower-risk than building the narrative system fresh |
| Concierge last | Requires validated product and operator bandwidth; not a launch-day offering |

---

*Epic created 2026-05-09. Begins after docs/strategy/sprint-plan.md Sprint 6 completes.*
