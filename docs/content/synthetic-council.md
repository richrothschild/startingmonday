# Starting Monday Synthetic Council (Main)

Canonical entry point for the synthetic council system. Referenced by
docs/content/content-standards.md. Sub-council rosters live in their own
files (linked below) and are the source of truth for membership; this
document defines the system, the operating rules, and the directory.

---

## What the Council Is

The synthetic council is a structured decision-quality system, not persona
theater. Each named member is a reasoning lens applied to a decision,
artifact, or plan. The system forces disagreement between valid
perspectives, weights recommendations by evidence and believability, and
converts conclusions into decision objects with owners, kill criteria, and
review dates.

Full operating philosophy: docs/content/synthetic-council-structure.md
Review mechanics and prompt templates: docs/content/council-review-process.md

## Core Operating Rules

1. Lenses, not imitations. Members contribute their published principles and
   known cognitive models - never invented quotes or fabricated opinions.
2. Disagreement before synthesis. A review that produces no tension between
   members is a failed review; rerun it.
3. Grades demand exactness. Any grade below A must include the exact changes
   required to reach A (established in the v6 full-site review).
4. Decision objects, not vibes. Council output becomes: decision, owner,
   expected outcome, evidence, reversibility, kill criteria, review date.
5. Outcome review. Separate good decisions from lucky outcomes on the review
   date; convert repeated lessons into operating principles.
6. No unverified claims. Council write-ups obey the sitewide truthfulness
   contract - evidence links or explicit "assumption" labels.

## How to Run a Review

1. Pick the council(s) using the selection table in
   docs/content/council-review-process.md.
2. Paste the member list from the sub-council file into the prompt template
   (content template or technical template).
3. Capture per-member: likes, dislikes, one required change. Then group-level:
   top 2-3 key changes and one thing to stop doing.
4. File the dated review in docs/content/ and, where the decision is
   material, record a decision object.

## Sub-Council Directory

### Growth and Revenue
| Council | File | Use for |
|---|---|---|
| Sales and Marketing | sales-marketing-synthetic-council.md | Landing pages, blog, email, CTAs |
| Advertising and Brand Strategy | advertising-brand-synthetic-council.md | Campaigns, proof density, ad copy |
| Brand and Scaling | brand-scaling-synthetic-council.md | Positioning, channels, brand voice |
| Revenue and Economics | revenue-economics-synthetic-council.md | Pricing, unit economics, SaaS metrics |
| Trial Acquisition Strategy | trial-acquisition-strategy-and-synthetic-council.md | Trial funnels, conversion |
| Outreach Sales | outreach-sales-synthetic-council.md | Outbound scripts, negotiation framing |
| Business Development Partnerships | business-development-partnerships-synthetic-council.md | Partner motions, ecosystem plays |

### Product and Engineering
| Council | File | Use for |
|---|---|---|
| Software and SRE | software-sre-synthetic-council.md | Architecture, reliability, pipeline |
| UI/UX and Product Design | ui-ux-product-design-synthetic-council.md | Flows, onboarding, components |
| Product Onboarding Experts | product-onboarding-experts-synthetic-council.md | Activation, first-run experience |
| Data Analytics and Visualization | data-analytics-visualization-synthetic-council.md | Metrics, dashboards, tracking |

### Behavior and Decision Quality
| Council | File | Use for |
|---|---|---|
| Behavioral Economics | behavioral-economics-synthetic-council.md | Retention mechanics, nudges, habit loops |
| Decision Management | decision-management-synthetic-council.md | Roadmap bets, kill criteria |
| Voss / Cialdini / Horstman | voss-cialdini-horstman-synthetic-council.md | Negotiation, influence, management craft |

### Audience and Domain
| Council | File | Use for |
|---|---|---|
| Executive User | executive-user-synthetic-council.md | Buyer realism: trust, willingness to pay |
| Executive Coaching | executive-coaching-synthetic-council.md | Coach-facing products and copy |
| Executive Coach Products Experts | executive-coach-products-experts-council.md | Coach product design |
| Outplacement Buyer | outplacement-buyer-synthetic-council.md | Outplacement market moves |
| Thought Leadership | thought-leadership-synthetic-council.md | Articles, POV pieces |
| Email | email-synthetic-council.md | Email programs (paired with email:council:check gate) |
| Executive Writing Replies | executive-writing-replies-synthetic-council.md | Reply drafting quality |
| Human Writing | human-writing-synthetic-council-prompt-and-rubric.md | Long-form voice; LinkedIn variant available |

### Organization
| Council | File | Use for |
|---|---|---|
| Management | management-synthetic-council.md | Processes, hiring, cadence |
| Culture and Organization | culture-organization-synthetic-council.md | Operating systems, governance |
| HR and Legal | hr-legal-synthetic-council.md | Contracts, compliance, AI governance |

Bench: additional-future-synthetic-council-members.md holds vetted candidates
not yet seated.

## Automated Council Gates (CI)

Three councils run as code, not prompts:

| Gate | Command | Source | Cadence |
|---|---|---|---|
| Code council | npm run audit:code-council (strict on main) | scripts/code-synthetic-council-audit.mjs | Every main push + weekly workflow |
| Growth council | npm run growth:council / :strict | scripts/growth-synthetic-council-audit.mjs | Pre-commit gate + weekly workflow |
| Hero council | npm run audit:hero-council | scripts/hero-dual-track-council-audit.mjs | On demand |

Playbook and rubric for the code council:
docs/code-synthetic-council-playbook.md and
docs/code-synthetic-council-rubric.md. Latest automated outputs land in
docs/code-synthetic-council-audit.latest.md / .json.

## Full-Council Reviews

For sitewide or strategic reviews, convene the full council (all relevant
sub-councils, every member grading, below-A grades requiring exact fixes).
Precedents: docs/content/site-review-may-2026-full-council.md and
site-review-may-2026-full-council-v6.md. Gap-analysis precedent:
docs/business-plan-synthetic-council-gap-analysis.md.

## Maintenance

- New members are seated by adding them to the relevant sub-council file and
  noting placement in synthetic-council-structure.md (see the v6 roster
  section there for the pattern).
- New sub-councils require: a roster file in docs/content/, a row in this
  directory, and a row in the selection table in council-review-process.md.
- This document is the index; do not duplicate rosters here - link to the
  sub-council files so membership has one source of truth.
