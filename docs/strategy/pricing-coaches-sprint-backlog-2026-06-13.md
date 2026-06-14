# Pricing + Coaches Sprint Backlog

Date: 2026-06-13
Sprint goal: Resolve pricing drift, tighten premium packaging on monetization-critical surfaces, and improve coach conversion clarity without widening scope.
Sprint length: 1 focused sprint
Scope boundary: pricing surfaces, coach funnel surfaces, and the graph-spec strategy artifact only

## Sprint outcome

By sprint end:
- public pricing is canonically named and priced
- coach pricing and pilot framing are internally consistent
- premium proof and trust appear earlier on monetization-critical pages
- the agent graph spec exists and is ready to break into implementation tickets

## Tickets

### SM-PR-01
Title: Lock canonical pricing ladder and public plan names
Owner: Product
Priority: P0
Effort: 2
Outcome:
- one documented canonical ladder and naming rule
Acceptance:
- `active` is explicitly documented as the internal key for the public Search tier
- current live pricing values are reflected in strategy docs
File targets:
- docs/strategy/pricing-strategy.md
- docs/strategy/selected-ideas-implementation-plan-2026-06-13.md
- src/lib/pricing.ts

### SM-PR-02
Title: Align public pricing page metadata and plan copy
Owner: Engineering
Priority: P0
Effort: 3
Outcome:
- pricing page copy matches canonical ladder and plan naming
Acceptance:
- pricing metadata uses Search instead of Active
- public plan cards show Search consistently
- Executive card references Search as the base tier
File targets:
- src/app/pricing/page.tsx
- src/app/pricing/pricing-cards.tsx

### SM-PR-03
Title: Sweep current strategy docs for pricing-name drift
Owner: Product
Priority: P0
Effort: 3
Outcome:
- core strategy docs stop contradicting the pricing page
Acceptance:
- business-plan, investor-brief, pricing-rationale, and implementation-plan docs reflect Search naming and current price ladder
File targets:
- docs/business-plan.md
- docs/investor-brief.md
- docs/pricing-rationale.md
- docs/strategy/selected-ideas-implementation-plan-2026-06-13.md

### SM-PR-04
Title: Decide Concierge public role
Owner: Product
Priority: P1
Effort: 2
Outcome:
- Concierge is either hidden, invite-led, or explicitly differentiated
Acceptance:
- pricing strategy doc states Concierge public status clearly
- no public copy implies two equal $499 plans without differentiation
File targets:
- docs/strategy/pricing-strategy.md
- src/app/pricing/page.tsx
- src/app/pricing/pricing-cards.tsx if needed

### SM-CO-01
Title: Make coach hero transformation-first
Owner: Content + Engineering
Priority: P0
Effort: 3
Outcome:
- coach landing page leads with outcome and role boundary in one scan
Acceptance:
- hero makes the transformation explicit before explanatory copy
- trust boundary remains visible in first screenful
File targets:
- src/app/for-coaches/page.tsx
- docs/coaches-landing-change-list.md

### SM-CO-02
Title: Move pilot success criteria into the main coach landing page
Owner: Product + Engineering
Priority: P0
Effort: 3
Outcome:
- visitors understand the 30-day pilot as a pass/fail buying motion
Acceptance:
- pilot scorecard appears on the main coach landing page
- success criteria are visible before the FAQ layer
File targets:
- src/app/for-coaches/page.tsx
- src/app/for-coaches/page-content.ts
- docs/coach-council-epic.md

### SM-CO-03
Title: Align coach pricing copy across landing, FAQ, and economics
Owner: Product + Engineering
Priority: P0
Effort: 3
Outcome:
- coach buyer pricing is consistent on all primary coach surfaces
Acceptance:
- same plan names and economics appear across coach landing, FAQ, and economics page
- no placeholder or conflicting pricing language remains on primary surfaces
File targets:
- src/app/for-coaches/page.tsx
- src/app/for-coaches/faq/page.tsx
- src/app/for-coaches/economics/page.tsx
- src/app/for-coaches/page-content.ts

### SM-CO-04
Title: Strengthen coach trust-pack routing and proof placement
Owner: Design + Engineering
Priority: P1
Effort: 2
Outcome:
- proof and trust are harder to miss in the coach flow
Acceptance:
- trust pack CTA remains above fold or immediately after value statement
- proof strip and source note remain visible without long-scroll dependency
File targets:
- src/app/for-coaches/page.tsx
- docs/coaches-landing-features.md

### SM-CO-05
Title: Add named-proof placeholder model for coach case studies
Owner: Content
Priority: P1
Effort: 2
Outcome:
- coach proof is ready to upgrade from aggregate metrics to named evidence when permissions are available
Acceptance:
- doc defines exact case-study structure and placement
File targets:
- docs/coach-council-epic.md
- docs/coaches-landing-features.md

### SM-GRAPH-01
Title: Draft the agent graph design spec
Owner: Product
Priority: P0
Effort: 3
Outcome:
- one shared graph model exists for the core executive-search loop and coach overlay
Acceptance:
- nodes, transitions, state, checkpoints, and telemetry are documented
File targets:
- docs/strategy/agent-graph-design-spec-2026-06-13.md
- ARCHITECTURE.md follow-on reference if approved

### SM-GRAPH-02
Title: Turn graph spec into implementation candidates
Owner: Product + Engineering
Priority: P1
Effort: 3
Outcome:
- the spec becomes an execution bridge instead of a dead document
Acceptance:
- at least one follow-on ticket exists for telemetry, one for stall state, and one for coach snapshot state
File targets:
- docs/product-requirements.md
- docs/coach-council-epic.md
- follow-on sprint planning docs

## Suggested execution order

### Day 1
- SM-PR-01
- SM-PR-02
- SM-GRAPH-01

### Day 2
- SM-PR-03
- SM-CO-01
- SM-CO-02

### Day 3
- SM-CO-03
- SM-CO-04
- SM-PR-04

### Day 4
- SM-CO-05
- SM-GRAPH-02
- QA and copy consistency pass

## Focused QA checklist

1. Pricing page shows Search, not Active, everywhere user-visible.
2. Pricing values match `src/lib/pricing.ts`.
3. Coach landing, FAQ, and economics page agree on coach pricing.
4. Coach pilot criteria are visible without requiring FAQ reading.
5. New strategy docs do not contradict live UI.

## Risks

1. Historical archive docs still contain old $129/$249 references.
Mitigation:
- treat this sprint as a canonical-surface sweep, not a full archive migration.

2. Concierge role may remain ambiguous.
Mitigation:
- keep it invite-led until differentiated clearly.

3. Coach proof may still rely on aggregate evidence.
Mitigation:
- keep the structure ready and upgrade when named permissions exist.
