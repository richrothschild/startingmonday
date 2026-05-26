# Council Score 95 Plus Site Improvement Epic

Date: 2026-05-24
Status: Sprint 8 Complete, Governance Active
Goal: Raise every reviewed council-member buy likelihood score to 95 or higher.

## North Star Outcomes

- Every member score in the latest multi-council review reaches at least 95.
- Landing experience routes users into channel-specific and persona-specific paths.
- Micro-product catalog and bundle model are operational for B2C and B2B channels.
- Company intelligence quality and onboarding implementation speed improve measurably.

## Baseline

From docs/content/outplacement-idea-full-council-review-2026-05-24.md:
- Main Synthetic Council average: 83.7
- Executive Council average: 84.2
- Coaches Council average: 89.7
- Outplacement Council average: 85.0
- Blended average: 85.2

## Master Task Backlog

Each item below is derived from council feedback and user directives. Items tagged with Source: comment were converted directly from member comments.

### A. Channel and persona UX architecture

A-01. Build landing-page channel split for Executive, Coaches, Outplacement, Search Firms.
Source: user directive item 1, plus council breadth concerns.
Measure: channel entry click-through by segment.

A-02. Add dedicated CTA and route per executive persona on executive channel path.
Source: user directive item 1, Executive Council comments.
Measure: persona route completion rate.

A-03. Add dedicated CTA and route per coach persona on coach channel path.
Source: coach-council recommendations and user directive item 1 extension.
Measure: coach persona route completion and demo-booked rate.

A-04. Add dedicated CTA and route per outplacement buyer role on outplacement channel path.
Source: outplacement council comments.
Measure: partner-qualified lead rate.

A-05. Add dedicated CTA and route for search-firm sub-personas.
Source: multi-channel clarity requirement.
Measure: search-firm trial and partner-call conversion.

### B. Main Synthetic Council comment-to-task conversions

B-01. Replace umbrella message with audience-specific hero statements per channel.
Source: Dave, Seth.
Measure: bounce-rate reduction on channel pages.

B-02. Add buyer-boundary statements on each micro-product page: for, not for, alternative.
Source: April.
Measure: qualified-trial rate improvement.

B-03. Add economic buyer ROI section with placement-speed and ops-efficiency model.
Source: John.
Measure: partner demo-to-proposal conversion.

B-04. Add emotional-outcome proofs by audience, including counselor and firm outcomes.
Source: Katelyn.
Measure: trust survey score and conversion lift.

B-05. Define value metric per micro-product and package against that metric.
Source: Patrick.
Measure: ARPU and retention by micro-product.

B-06. Sequence launch by smallest viable audience and publish scope guardrails.
Source: Seth.
Measure: channel focus adherence score.

### C. Executive Council comment-to-task conversions

C-01. Add confidentiality assurance block on executive entry and onboarding pages.
Source: VP IT, CIO.
Measure: trust objection rate in qualitative interviews.

C-02. Create passive-optionality mode separate from active-search mode UX.
Source: Sitting CIO.
Measure: passive cohort retention at day 30.

C-03. Implement transition-first quickstart with under-10-minute first value.
Source: Displaced executive.
Measure: median time-to-first-value.

C-04. Improve intelligence depth for transformation and board-level opportunities.
Source: PE-backed operator.
Measure: signal relevance score in user validation.

C-05. Reduce dashboard complexity and cognitive load for low-energy users.
Source: Burned-out executive.
Measure: onboarding completion and support ticket volume.

C-06. Define explicit recruiter value path and role-safe messaging.
Source: Executive recruiter.
Measure: recruiter partner response rate.

### D. Coaches Council comment-to-task conversions

D-01. Add coach-first framing: strategy-time amplifier, not coach replacement.
Source: Octavia.
Measure: coach objection rate.

D-02. Build shared-view what-changed panel for between-session accountability.
Source: Octavia, Cindy.
Measure: weekly active coach-collaboration sessions.

D-03. Add readiness evidence pack with prep quality benchmarks by role level.
Source: Claudio.
Measure: readiness-confidence survey score.

D-04. Add long-horizon tracking templates for board and multi-quarter journeys.
Source: Cindy.
Measure: coach engagement duration.

### E. Outplacement Council comment-to-task conversions

E-01. Publish board-safe claims policy and KPI definitions by day 30, 60, 90.
Source: Procurement and legal reviewer.
Measure: procurement cycle time.

E-02. Create downloadable pilot operator pack with no-custom rollout defaults.
Source: Program operations director.
Measure: pilot launch setup time.

E-03. Add counselor enablement kit to reduce replacement anxiety.
Source: Senior transition counselor lead.
Measure: counselor adoption rate.

E-04. Add ROI model tied to placement speed, cohort outcomes, and differentiation.
Source: Outplacement practice leader.
Measure: proposal acceptance rate.

### F. User-directed strategic additions

F-01. Add James Clear to synthetic council roster and to Voss Cialdini Horstman council.
Status: completed in docs/content/synthetic-council-structure.md and docs/content/voss-cialdini-horstman-synthetic-council.md.

F-02. Create Digital Products Experts Panel with measurable rubric.
Status: completed in docs/content/digital-products-experts-panel.md.

F-03. Create Executive Coach Products Experts Council with measurable rubric.
Status: completed in docs/content/executive-coach-products-experts-council.md.

F-04. Create Product Onboarding Experts Synthetic Council with measurable rubric.
Status: completed in docs/content/product-onboarding-experts-synthetic-council.md.

F-05. Build micro-product back office strategy and implementation plan.
Scope:
- Stripe pricing and package architecture
- micro-product catalog data model and CMS strategy
- site embed points and in-app placement
- B2B bundle and reseller packaging
- rollout governance and lifecycle management
Measure: first two micro-products sold with stable billing and reporting.

F-06. Launch company intelligence quality improvement epic.
Scope:
- signal coverage expansion by channel and persona
- relevance ranking and confidence scoring
- false-positive and stale-signal controls
- intelligence QA scorecard
Measure: intelligence trust score and actionability rate.

F-07. Reduce time to implementation across onboarding and activation.
Scope:
- implementation path simplification
- progressive setup defaults
- auto-fill and profile import optimization
- milestone nudges and guided completion
Measure: median implementation time reduction.

## Epic Breakdown Into Sprints

### Sprint 1: IA and decision architecture

Current status: Complete

Working artifacts:
- docs/content/sprint-1-ia-spec-and-route-map-2026-05-24.md
- docs/content/sprint-1-score-measurement-contract-2026-05-24.md
- docs/content/sprint-1-baseline-scorecard-template-2026-05-24.md

Objectives:
- lock channel and persona IA
- define score-to-95 measurement contract
- align micro-product taxonomy

Deliverables:
- channel route map and persona matrix
- score baseline dashboard by council member
- micro-product naming and scope boundaries

Exit criteria:
- approved IA spec for all four channels
- approved measurement framework with owners

### Sprint 2: Landing and channel entry implementation

Current status: Complete

Working artifacts:
- src/components/home/ChannelEntryStrip.tsx
- src/lib/channel-ia.ts
- src/app/executives/page.tsx
- src/app/coaches/page.tsx
- src/app/outplacement/page.tsx
- src/app/search-firms/page.tsx
- src/app/sitemap.ts
- src/app/api/events/channel-funnel/route.ts
- src/app/(dashboard)/dashboard/admin/channel-benchmarks/page.tsx
- docs/content/sprint-2-channel-entry-experiment-plan-2026-05-24.md

Objectives:
- ship channel-specific landing entry points
- route users into channel funnels with dedicated CTAs

Deliverables:
- Executive, Coaches, Outplacement, Search Firms channel entries
- channel-specific hero and trust blocks

Exit criteria:
- channel entry flow live in staging
- channel click-through benchmark established

### Sprint 3: Persona path implementation by channel

Current status: Complete

Working artifacts:
- src/lib/persona-routes.ts
- src/app/executives/active/page.tsx
- src/app/executives/passive/page.tsx
- src/app/executives/personas/page.tsx
- src/app/executives/personas/[slug]/page.tsx
- src/app/coaches/personas/page.tsx
- src/app/coaches/personas/[slug]/page.tsx
- src/app/outplacement/personas/page.tsx
- src/app/outplacement/personas/[slug]/page.tsx
- src/app/search-firms/personas/page.tsx
- src/app/search-firms/personas/[slug]/page.tsx
- src/app/(dashboard)/dashboard/admin/channel-benchmarks/page.tsx
- docs/content/sprint-3-persona-routing-qa-2026-05-24.md

Objectives:
- add persona buttons and tailored paths inside each channel
- isolate passive versus active executive paths

Deliverables:
- executive persona routes
- coach persona routes
- outplacement role routes
- search-firm persona routes

Exit criteria:
- persona routing telemetry complete
- first-pass usability test above target threshold

### Sprint 4: Micro-product back office foundation

Current status: Complete

Working artifacts:
- supabase/migrations/109_micro_product_back_office.sql
- src/lib/micro-products.ts
- src/components/micro-products/ChannelMicroProductRail.tsx
- src/app/api/billing/checkout/micro-product/route.ts
- src/app/(dashboard)/dashboard/admin/product/catalog/page.tsx
- src/app/(dashboard)/dashboard/admin/product/catalog/actions.ts
- src/app/(dashboard)/settings/billing/billing-client.tsx
- src/app/api/webhooks/stripe/route.ts
- docs/content/sprint-4-micro-product-rollout-runbook-2026-05-24.md

Objectives:
- enable pricing, catalog, and bundle operations

Deliverables:
- Stripe product and pricing model for micro-products
- catalog schema and CMS/admin management flow
- B2B bundle templates and entitlement mapping

Exit criteria:
- billing and entitlements verified for two pilot micro-products
- internal ops runbook approved

### Sprint 5: Company intelligence quality epic phase 1

Current status: Complete

Working artifacts:
- supabase/migrations/110_sprint5_intelligence_quality.sql
- src/lib/intelligence-quality.ts
- src/app/api/signals/classify/route.ts
- src/app/api/cron/edgar-signals/route.ts
- src/app/(dashboard)/dashboard/signals/page.tsx
- src/lib/intelligence.ts
- src/app/api/admin/automation/reporting/intelligence-qa-scorecard/route.ts
- src/app/(dashboard)/dashboard/admin/intelligence/qa/page.tsx
- docs/content/sprint-5-intelligence-quality-scorecard-2026-05-24.md

Objectives:
- improve signal quality and confidence
- increase persona relevance of intelligence feed

Deliverables:
- confidence scoring pipeline
- persona-aware ranking logic
- false-positive suppression rules

Exit criteria:
- trust and relevance metrics show measurable lift

### Sprint 6: Onboarding and implementation speed epic

Current status: Complete

Working artifacts:
- supabase/migrations/111_sprint6_onboarding_speed_qa.sql
- src/lib/onboarding-speed.ts
- src/app/onboarding/onboarding-form.tsx
- src/app/onboarding/actions.ts
- src/app/api/onboarding/events/route.ts
- src/app/api/admin/automation/reporting/onboarding-qa-scorecard/route.ts
- src/app/(dashboard)/dashboard/admin/onboarding/qa/page.tsx
- docs/content/sprint-6-onboarding-speed-scorecard-2026-05-24.md

Objectives:
- reduce time to implementation and first value
- lower onboarding cognitive load

Deliverables:
- guided quickstart by channel and persona
- progressive setup with intelligent defaults
- implementation timer and milestones

Exit criteria:
- median time-to-implementation reduced by agreed target
- onboarding completion improves across all channels

### Sprint 7: Proof architecture and procurement hardening

Current status: Complete

Working artifacts:
- src/app/for-outplacement/trust-pack/page.tsx
- src/app/for-outplacement/economics/page.tsx
- src/app/for-outplacement/runbook/page.tsx
- src/app/proof/roi-calculator/page.tsx
- src/app/proof/roi-calculator/roi-calculator-client.tsx
- public/downloads/outplacement-counselor-enablement-kit.md
- public/downloads/outplacement-pilot-operator-pack.md

Objectives:
- address trust and buyer-risk blockers from councils

Deliverables:
- board-safe claims policy
- trust artifact index
- ROI calculators by channel and role

Exit criteria:
- procurement objections decline
- partner conversion metrics improve

### Sprint 8: Re-review and score closure to 95+

Current status: Complete

Working artifacts:
- docs/content/sprint-8-re-review-score-closure-2026-05-24.md
- docs/content/sprint-8-governance-cadence-2026-05-24.md
- docs/weekly-unified-audit.latest.md
- docs/weekly-unified-audit.latest.json

Objectives:
- run all councils against updated site and materials
- close remaining gaps per member

Deliverables:
- updated council scorecards for every member
- final gap-fix backlog
- go-forward governance cadence

Exit criteria:
- every council-member buy likelihood score at least 95

Sprint 8 exit note:
- Multi-council closure scorecard published with member-level evidence links and action ownership.
- Governance cadence published with weekly, biweekly, and monthly owner/accountability loop.
- Latest unified audit recorded a council score of 98 (A+), with no security high/critical vulnerabilities.

## Governance Model

- Weekly: sprint metric review and blocker clearing.
- Biweekly: council delta review with score movement by member.
- Monthly: roadmap rebalance by highest score-lift ROI.

## Risks And Mitigations

Risk: multi-channel scope creates implementation drag.
Mitigation: enforce one sprint one dominant objective and strict WIP limits.

Risk: micro-products fragment message and code.
Mitigation: central catalog schema and shared component library.

Risk: council scoring becomes subjective.
Mitigation: tie each score movement to explicit evidence and conversion metrics.

## Immediate Next Actions

1. Run the weekly unified audit each Monday and publish deltas to sprint governance notes.
2. Triage and close the remaining code-council findings in risk-point order.
3. Keep score closure above target with evidence-linked updates in the Sprint 8 closure artifacts.
