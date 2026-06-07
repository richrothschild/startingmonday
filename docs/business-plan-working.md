# Starting Monday Working Business Plan (Execution Version)

Owner: Documentation Operations
Status: active
Last reviewed: 2026-06-07
Review cadence: quarterly
Source of truth: yes


Date: 2026-05-31
Review date: 2026-06-14
Canonical source: docs/business-plan-working.md

This document is designed as an execution system, not just a strategy memo. It includes accountable data-gap placeholders so leadership can run monthly and quarterly operations against hard numbers without losing ownership.

## Closeout Sweep Snapshot (2026-05-31)

Authoritative sources found in-repo and applied in this sweep:

- Growth metrics export: `docs/growth/weekly-metrics.latest.json` (window 2026-05-18 to 2026-05-24)
- Growth gate check: `docs/growth-metrics-gate.latest.json` (checkedAt 2026-06-01T01:29:13.481Z, status PASS)
- Weekly audit JSON: `docs/weekly-unified-audit.latest.json` (generatedAt 2026-06-01T01:29:49.811Z)

Evidence-backed metrics available now:

- qualified_signup_rate: 0.074
- hero_cta_ctr: 0.162
- form_start_rate: 0.284
- form_completion_rate: 0.513
- bounce_rate: 0.441
- median_engaged_time_seconds: 68
- scroll_depth_75_rate: 0.371

Unavailable in current repository exports (still unresolved):

- Net new ARR growth (QoQ)
- Gross revenue retention (GRR)
- Net revenue retention (NRR)
- New logo close rate
- CAC payback (months)
- Net cash change (quarter)

## Executive summary

Starting Monday will build a premium executive-outcomes platform with a channel-first business model:

- B2B recurring subscriptions for executive coaches, search firms, and outplacement firms (in that order).
- B2C one-time purchases for individual executives as a supplemental channel.

Core thesis:

- Institutions with aggregated executive demand are the fastest path to durable ARR.
- Software-first delivery can produce high gross margins if product scope remains tight.
- A premium brand must be backed by measurable outcomes, not positioning language alone.
- The company must sell executive readiness, signal intelligence, and better conversations, not generic job-search help.

24-month objective:

- Build a repeatable US-focused B2B engine with strong retention, healthy unit economics, and a leadership team that can scale without founder bottlenecks.

Path to $100M ARR:

- Win one wedge deeply (coaches), then expand into adjacent segments (search, outplacement) with a shared core product.
- Add enterprise controls, reporting, and integrations to increase account size and expansion revenue.

Pre-scale rule:

- The company does not scale a segment until proof, trust, activation, and unit economics are evidenced in that segment.

## Market and ICP strategy

### ICP priority and sequencing

1. Executive coaches (primary wedge)
2. Search firms (adjacent expansion)
3. Outplacement firms (institutional scale)
4. Individual executives (premium one-time, brand support)

Immediate execution constraint:

- Quarter 1 focus remains executive coaches, but search firms should be tested in parallel as a threat-sensitive discovery channel so sequencing is validated rather than assumed.

### Smallest viable audience

- Primary wedge: coaches serving senior technology executives in transition, especially CIO, CTO, CISO, CDO, and PE-backed transformation leaders.
- Secondary wedge for validation: boutique retained IT executive search firms serving the same buyer ecosystem.

### Coach persona map

1. Career transition coaches: speed, clarity, and reduced between-session chaos.
2. VP-to-CXO coaches: executive narrative, confidentiality, and higher-stakes positioning.
3. Search-affiliate coaches: candidate readiness before interviews and introductions.
4. Board-positioning coaches: long-cycle governance and opportunity monitoring.

### Segment strategy map

| Segment | Buyer | Core job-to-be-done | Pricing model | Land motion | Expand motion |
| --- | --- | --- | --- | --- | --- |
| Coaches | Founder/partner coach | Improve client prep outcomes with less delivery effort | Subscription | Direct outreach + referral | More seats, higher tier workflows |
| Search firms | Partner/principal | Increase candidate readiness and placement confidence | Subscription | Pilot with one desk/team | Firm-wide adoption |
| Outplacement firms | Program owner | Deliver executive-grade support at scale | Subscription | Program-level pilot | Cohort expansion + annual contract |
| Executives | Individual | One high-stakes prep outcome | One-time | Direct premium offer | Referral and testimonial flywheel |

### Positioning architecture

- Company position: premium execution system for executive transitions.
- Segment narrative: same core product, different value language and proof points.
- Category stance: outcome platform, not generic career content.

Message guardrails:

- Do not say: we help executives find jobs faster.
- Say: we help executives and their advisors become opportunity-ready earlier, with better signal intelligence and better high-stakes conversations.
- For coaches: position as leverage that makes coaching more effective, not AI that replaces coaching.
- For search firms: position as candidate-readiness and market-signal infrastructure, not sourcing or recruiter replacement.

### Key market assumptions (accountable data gaps)

| Assumption | Current estimate | Confidence (H/M/L) | Validation owner | Validation date |
| --- | --- | --- | --- | --- |
| TAM by primary segment (US) | Data gap (Q2 close pending) | Medium | Revenue Ops | 2026-06-14 |
| Typical buyer budget range | Data gap (Q2 close pending) | Medium | Revenue Ops | 2026-06-14 |
| Median buying committee size | Data gap (Q2 close pending) | Low | Revenue Ops | 2026-06-14 |
| Time-to-close by segment | Data gap (Q2 close pending) | Medium | Revenue Ops | 2026-06-14 |

## Product and delivery architecture

### Product architecture

Layer 1: Core platform (shared)

- Onboarding and context capture
- Workflow orchestration
- Outcome tracking and reporting
- Quality and audit controls

Layer 2: Segment configuration

- Coach mode
- Search mode
- Outplacement mode
- Executive one-time mode

Configuration rule:

- Segment modes may change workflows, reporting, permissions, and language, but may not fork the core data model without explicit approval in quarterly strategy review.

Layer 3: Premium trust and controls

- Role-based access
- Data governance
- Brand-safe output controls
- Account-level visibility and reporting
- Confidentiality and employer-discovery protections
- Partnership-safe boundaries for coach and search-firm workflows

### Delivery model

- Delivery is software-only.
- Human support is implementation and customer success enablement, not core delivery labor.

### Build/no-build rubric

Each feature must improve at least one of these:

- New ARR
- Retention
- Gross margin
- Sales cycle compression

If a feature cannot be tied to one of the above within one quarter, it is deferred.

Enforcement rule:

- Every proposed feature must identify target segment, expected metric impact, and support-cost implication before entering a sprint.

### Product KPI table (fill-in)

| KPI | Current | Target Q+1 | Target Q+2 | Owner | Source |
| --- | --- | --- | --- | --- | --- |
| Time to first value | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Activation rate (30 days) | No 30-day cohort export; weekly proxy form_completion_rate=0.513 | Data gap (owner: Revenue Ops; due: 2026-06-14) | Data gap (owner: Revenue Ops; due: 2026-06-14) | Revenue Ops | docs/growth/weekly-metrics.latest.json (proxy) |
| Segment feature adoption | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Product-related churn reasons | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Daily briefing usage rate | No briefing usage export found in latest weekly metrics pack | Data gap (owner: Product; due: 2026-06-14) | Data gap (owner: Product; due: 2026-06-14) | Product | docs/growth/weekly-metrics.latest.json (field absent) |
| Coach activation by day 7 | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Search pilot activation by day 7 | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |

## GTM system

### Revenue motion

- Primary: B2B subscription sales by segment.
- Secondary: direct executive one-time premium offer for proof, brand, and referral lift.

### GTM operating model

1. Segment-specific messaging and proof assets.
2. Pilot-to-subscription conversion process.
3. Expansion motion based on account outcomes and usage depth.

### Segment-specific partner motions

Coach motion:

- Offer: private executive opportunity intelligence layer between coaching sessions.
- Entry asset: coach partner preview with free coach access, 2-3 preview seats, sample brief, and feedback session.
- Proof needed: coach quotes, reduced prep time, stronger client session quality, client outcome stories.

Search-firm motion:

- Offer: private executive readiness and market signal layer that improves search conversations.
- Entry asset: search intelligence partner pilot with sample readiness brief, sample company signal report, confidentiality framing, and no-poach language.
- Proof needed: consultant prep efficiency, better candidate readiness, improved conversation quality, trust-safe workflow fit.

Search-firm trust boundaries:

- Starting Monday does not replace search judgment.
- Starting Monday does not source candidates for a retained mandate.
- Starting Monday does not use partner data outside approved workflow boundaries.

### Funnel design by stage

| Funnel stage | KPI | Target | Cadence | Owner |
| --- | --- | --- | --- | --- |
| Top of funnel | Qualified meetings per segment | Data gap (owner: Documentation Operations; due: 2026-06-14) | Weekly | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Mid funnel | Pilot start rate | Data gap (owner: Documentation Operations; due: 2026-06-14) | Weekly | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Bottom funnel | Pilot-to-paid conversion | Data gap (owner: Documentation Operations; due: 2026-06-14) | Weekly | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Post-sale | 90-day retention | Data gap (owner: Documentation Operations; due: 2026-06-14) | Monthly | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Expansion | Net revenue retention | Data gap (owner: Documentation Operations; due: 2026-06-14) | Monthly | Data gap (owner: Documentation Operations; due: 2026-06-14) |

### Sales system essentials

- Discovery and qualification script per segment.
- Objection and competitor handling playbook.
- Pilot scorecard with explicit conversion criteria.
- Win/loss review every month.
- Proof asset library with named outcomes, sample outputs, and methodology notes.

## Operating model and org design

### Current team model (3 people)

- CEO/founder: strategy, top deals, pricing, capital allocation.
- Revenue and customer lead: pipeline, onboarding, retention execution.
- Product/engineering lead: build velocity, reliability, instrumentation.

### Decision rights

- CEO decides: segment priority, pricing shifts, strategic roadmap bets.
- Functional owners decide: execution tactics within approved objectives.
- Product/engineering lead decides sprint sequencing within approved roadmap constraints.
- Revenue lead owns partner and pipeline quality by segment.

Conflict-resolution rule:

- When segment requests conflict, the primary segment wins unless a non-primary request materially improves trust, retention, or contribution margin across segments.

### Meeting cadence

- Weekly operating review: pipeline, retention risk, cash, product blockers.
- Monthly business review: KPI trends, unit economics, hiring triggers.
- Quarterly strategy review: what to stop, what to scale, which segment leads.

Required monthly review topics:

- Proof asset progress
- Segment-level contribution margin
- Trust and legal readiness gaps
- Feature requests rejected due to scope or margin risk

### Hiring plan tied to revenue milestones (fill-in)

| Revenue milestone | Trigger definition | Hire | Why now | Cost envelope | Success metric 90 days |
| --- | --- | --- | --- | --- | --- |
| $0 MRR | Data gap (owner: Documentation Operations; due: 2026-06-14) | Founding AE / revenue operator | Remove founder sales bottleneck | $Data gap (owner: Documentation Operations; due: 2026-06-14) | % pipeline run without founder |
| $0 MRR | Data gap (owner: Documentation Operations; due: 2026-06-14) | Customer success lead | Protect retention and expansion | $Data gap (owner: Documentation Operations; due: 2026-06-14) | 90-day retention trend |
| $0 MRR | Data gap (owner: Documentation Operations; due: 2026-06-14) | Full-stack engineer | Maintain velocity and platform quality | $Data gap (owner: Documentation Operations; due: 2026-06-14) | Cycle time and defect trend |
| $0 MRR | Data gap (owner: Documentation Operations; due: 2026-06-14) | Segment account executive | Expand institutional coverage | $Data gap (owner: Documentation Operations; due: 2026-06-14) | Segment new ARR contribution |

## Financial model and milestones

### Monthly model template assumptions (fill-in)

Use one row per month. Build separate tabs for base, upside, downside.

| Month | Begin customers | New logos | Churned logos | End customers | ARPA | MRR | New ARR | Churn ARR | Net new ARR | Gross margin % | CAC blended | Payback (months) | Cash in | Cash out | Net cash |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |

### Segment P and L view (fill-in)

Track this monthly by segment and total.

| Segment | Revenue | COGS | Gross profit | Gross margin % | Sales and marketing spend | Support and success spend | Segment contribution margin | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Coaches | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Search firms | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Outplacement firms | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Executives one-time | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Total | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |

### Milestone gates

Gate 1: Product-market evidence

- Retention in primary segment is consistently healthy.
- Close rate and sales cycle are predictable.
- Named proof assets exist and can be used in-market.

Gate 2: Repeatability

- Non-founder can run meaningful share of pipeline.
- Onboarding quality remains stable while volume grows.
- Segment-specific activation definitions are instrumented and stable.

Gate 3: Scalable expansion

- Adjacent segment grows without breaking margins or roadmap focus.
- Trust boundaries, partner terms, and confidentiality controls are in place for the next segment.

Gate 0: Trust and proof readiness

- Sample outputs are visible and explainable.
- Methodology and outcome claims can be defended.
- Coach and search partner materials clearly state what Starting Monday is and is not.

## Risk register and contingencies

| Risk | Earliest likely timing | Leading indicator | Impact | Sprint-level contingency |
| --- | --- | --- | --- | --- |
| Segment sprawl and focus loss | Months 1-4 | >30% roadmap items not tied to primary segment | High | Enforce quarterly segment lock; backlog freeze for non-primary work |
| Weak retention despite early sales | Months 2-6 | 30/60/90-day usage decay | High | Activation sprint, onboarding redesign, pause channel scaling |
| Founder bottleneck in deals and decisions | Months 3-9 | Deals stall without founder calls | High | Build and enforce playbooks; hire revenue operator by trigger |
| Sales cycle elongation | Months 4-10 | Stage aging rises quarter over quarter | Medium/High | Introduce scoped pilot contracts with conversion checkpoints |
| Premium positioning not supported by proof | Months 1-8 | Price resistance + low referral rate | High | Build case library; require quantified outcomes in all references |
| Margin compression from hidden service work | Months 3-12 | Rising support hours per account | High | Productize repeated asks; block custom one-offs without pricing |
| Cash crunch while bootstrapped | Any time | Runway <6 months, delayed receivables | Very High | Tighten hiring, push annual prepay, reduce low-ROI spend |
| Channel overdependence | Months 6-18 | >60% pipeline from one source | Medium | Build second reliable channel before scaling spend |
| Search-firm threat perception blocks pilots | Months 1-6 | High objection rate around sourcing or replacement concerns | High | Lead with no-poach boundaries, confidentiality language, and search-safe pilot framing |
| Legal and confidentiality debt slows trust | Months 2-12 | Repeated privacy, confidentiality, or security objections | High | Publish trust roadmap, document controls, and prioritize partner-safe agreements |

## 24 month implementation roadmap

This roadmap uses two-week sprints grouped into epics. Each sprint includes explicit obstacle handling.

### Epic 1 (Months 1-3): Coach wedge proof

Outcome: repeatable coach segment acquisition and onboarding baseline.

Sprint 1: Baseline instrumentation and segmentation

- Deliverables: dashboard for monthly revenue, retention, close rate, sales cycle by segment.
- Obstacles: inconsistent CRM data hygiene.
- Risk response: strict field requirements, weekly data QA owner.

Sprint 2: Coach offer and pilot package hardening

- Deliverables: offer sheet, pilot scorecard, objection handling.
- Deliverables: separate messaging and offer variants for the four coach personas.
- Obstacles: offer ambiguity and pricing confusion.
- Risk response: one approved pricing structure and one pilot format.

Sprint 3: Onboarding and activation optimization

- Deliverables: first-value workflow, onboarding sequence, activation triggers.
- Obstacles: users not reaching value quickly.
- Risk response: activation SLA and proactive intervention at risk thresholds.

Sprint 4: Proof asset production

- Deliverables: case narratives and quantified outcomes.
- Deliverables: named proof assets, sample outputs, methodology notes, and partner-safe testimonials.
- Obstacles: low trust in premium claims.
- Risk response: proof-before-scale rule.

### Epic 2 (Months 4-6): Repeatability and founder de-risking

Outcome: core sales and success execution runs through playbooks, not founder improvisation.

Sprint 5: Sales playbook codification

- Deliverables: discovery script, qualification standard, stage exit criteria.
- Deliverables: coach-specific objection handling and search-firm threat labels.
- Obstacles: inconsistent qualification quality.
- Risk response: weekly deal review with reject reasons tracked.

Sprint 6: Success and retention playbook

- Deliverables: 30/60/90-day success plan and churn save motions.
- Obstacles: churn reasons unknown.
- Risk response: mandatory churn coding and root-cause trend review.

Sprint 7: Revenue ops foundation

- Deliverables: pipeline SLA, stage aging alerts, forecast method.
- Deliverables: segment-level CAC, payback, and contribution margin reporting.
- Obstacles: unreliable forecast and surprise misses.
- Risk response: confidence-weighted forecasting.

Sprint 8: Hiring trigger prep

- Deliverables: role scorecards, interview kits, onboarding plans for first scale hires.
- Obstacles: delayed hiring causing bottlenecks.
- Risk response: pre-approved trigger thresholds and fallback contractor pool.

### Epic 3 (Months 7-9): Search segment controlled expansion

Outcome: launch search firms without breaking coach economics.

Sprint 9: Search segment pilot design

- Deliverables: segment narrative, pilot package, success metrics.
- Deliverables: explicit no-poach and confidentiality framing.
- Obstacles: product fit differences.
- Risk response: configuration over custom build principle.

Sprint 10: Search workflow productization

- Deliverables: search-specific configuration templates.
- Obstacles: roadmap fragmentation.
- Risk response: architecture guardrails and product review gate.

Sprint 11: Cross-segment reporting layer

- Deliverables: segment-level outcomes and account health views.
- Obstacles: poor comparability across segments.
- Risk response: common metric schema enforced.

Sprint 12: Expansion readiness review

- Deliverables: gate check for outplacement entry.
- Obstacles: premature expansion pressure.
- Risk response: no-go decision unless retention and margin thresholds are met.

### Epic 4 (Months 10-12): Outplacement entry and account scaling

Outcome: first outplacement wins with controlled support cost.

Sprints 13-16 focus:

- Outplacement pilot launch.
- Cohort workflow controls.
- Program-level reporting.
- Annual contract and prepay options.

Key obstacle: support burden spikes with cohort complexity.
Mitigation: implementation templates and usage guardrails before scale.

### Epic 5 (Months 13-18): Efficiency and expansion economics

Outcome: stronger net revenue retention and improved contribution margins.

Sprints 17-24 focus:

- Account expansion playbook.
- Pricing and packaging refinements by observed value.
- Churn prevention automation.
- Team specialization by segment.

Key obstacle: hidden costs from bespoke workflows.
Mitigation: enforce packaging limits, charge for exceptional complexity.

### Epic 6 (Months 19-24): Scale readiness and institutional robustness

Outcome: platform, team, and GTM are ready for larger institutional deals.

Sprints 25-32 focus:

- Enterprise controls and auditability.
- Procurement readiness assets.
- Partner channel development.
- Leadership operating model maturity.
- Security, privacy, and confidentiality readiness scaled for larger accounts.

Key obstacle: complexity outpacing organizational maturity.
Mitigation: quarterly stop-doing list and decision-rights clarity.

## Quarterly board-style scorecard format (fill-in)

Use one row per KPI. Include targets, actuals, trend, and board-level decisions.

| Quarter | KPI | Target | Actual | Variance | Trend (Up/Flat/Down) | Status (Green/Yellow/Red) | Root cause | Decision required | Owner | Due date |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Data gap (owner: Documentation Operations; due: 2026-06-14) | New ARR | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Data gap (owner: Documentation Operations; due: 2026-06-14) | Retention | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Data gap (owner: Documentation Operations; due: 2026-06-14) | Close rate | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Data gap (owner: Documentation Operations; due: 2026-06-14) | Avg sales cycle | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Data gap (owner: Documentation Operations; due: 2026-06-14) | Gross margin % | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Data gap (owner: Documentation Operations; due: 2026-06-14) | Net cash change | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Data gap (owner: Documentation Operations; due: 2026-06-14) | Proof asset readiness | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |
| Data gap (owner: Documentation Operations; due: 2026-06-14) | Trust and legal readiness | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) | Data gap (owner: Documentation Operations; due: 2026-06-14) |

## Pre-scale checklist

The business does not scale headcount, spend, or segment breadth until these are true:

1. Named proof assets are live for the primary segment.
2. Coach persona motions are live and measured separately.
3. Search-firm trust package is live before search expansion.
4. Segment economics are tracked with actuals, not only assumptions.
5. Segment-specific activation and retention instrumentation is live.
6. Legal, confidentiality, and trust roadmap is approved and staffed.

## Brutal skeptic section: what can go wrong and when

Months 1-3 failure modes:

- You mistake interest for buying intent and overestimate demand.
- You spread effort across too many ICPs and never fully win one.
- You claim premium value before outcome proof exists.

Months 4-9 failure modes:

- Founder remains the only closer; growth stalls when founder bandwidth maxes out.
- Sales cycle lengthens while pipeline appears healthy, masking a conversion problem.
- Onboarding quality drops as volume grows, creating delayed churn.

Months 10-18 failure modes:

- Adjacent segment expansion introduces product and support complexity that crushes margin.
- Team hires add coordination overhead before process maturity exists.
- Channel dependence creates revenue volatility from one partner or source.

Months 19-24 failure modes:

- Enterprise demands trigger a roadmap detour away from core value.
- Governance complexity slows execution speed below startup viability threshold.
- Cash gets trapped in growth initiatives that do not improve retention or expansion.

### Non-negotiable kill criteria

If any of the following persist for two quarters, strategy must be re-cut:

- No retention improvement in primary segment despite activation work.
- Sales cycle increases while close rate decreases.
- Segment contribution margin remains structurally negative without a clear path.
- Founder-dependent execution remains above acceptable thresholds.

## What else you need to do now

1. Fill the templates with current baseline numbers immediately.
2. Define target thresholds for retention, close rate, and sales cycle for each quarter.
3. Assign a single owner to every KPI and every sprint-level risk response.
4. Lock one segment as primary for the next quarter and freeze non-essential work.
5. Run a monthly strategy stress test: what to stop, what to double down, what to defer.
6. Build downside plans now (cash and hiring) before performance misses force reactive cuts.

## First 30-day execution checklist

| Week | Priority | Output |
| --- | --- | --- |
| Week 1 | Baseline metrics and data quality | Complete KPI baseline and dashboard definitions |
| Week 2 | Offer and pilot hardening | Finalized package, pricing, and success scorecard |
| Week 3 | Onboarding and activation sprint | Reduced time-to-value and risk alerts live |
| Week 4 | Proof and governance | Case evidence pack and monthly operating review in place |

## Next Actions

- Validate all placeholder replacements against finance and growth owners in weekly operating review.
- Replace temporary seeded values with production-system exports before quarterly planning lock.
- Mark this document Closed when no temporary seeded values remain.
