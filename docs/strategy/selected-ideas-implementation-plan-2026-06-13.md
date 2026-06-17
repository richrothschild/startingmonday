# Selected Ideas Implementation Plan

Date: 2026-06-13
Scope: Turn the selected high-priority and medium-priority ideas into concrete Starting Monday execution workstreams.
Owner set: Product + Engineering + Design + Growth + Content

## Why this plan exists

The selected ideas are not seven separate projects.
They collapse into three operating layers:

1. Product moat and workflow quality
2. Packaging, positioning, and conversion
3. Distribution and authority building

Starting Monday already has partial implementation in all three layers.
The right move is not to start from zero.
The right move is to unify the existing threads and close the highest-leverage gaps.

## Current-state anchor

Existing implementation surfaces already in repo:

- Agent/product architecture: ARCHITECTURE.md
- Pricing strategy: docs/strategy/pricing-strategy.md
- Pricing implementation: src/lib/pricing.ts, src/app/pricing/page.tsx, src/app/pricing/pricing-cards.tsx
- Premium positioning and luxury execution: docs/epic-sitewide-luxury-modern-elevation-2026-2027.md, docs/strategy/luxury-modern-sitewide-execution-plan-2026-06-13.md, docs/strategy/luxury-reference-benchmark-snapshot-2026-06-13.md
- LinkedIn authority system: docs/strategy/linkedin-content-system.md
- Coach conversion and coach landing work: docs/coach-council-epic.md, docs/coaches-landing-features.md, docs/coaches-landing-change-list.md, src/app/for-coaches/page.tsx, src/app/for-coaches/faq/page.tsx

Verified constraint notes:
- Social posting schedule is already deterministic through src/lib/social-posting-plan.ts and /api/admin/social/today, /api/admin/social/morning.
- Pricing strategy doc and live pricing implementation are no longer aligned.

## Immediate findings that must be handled first

### 1. Pricing strategy drift

Current strategy doc and live code disagree.

Strategy doc states:
- Intelligence: $49
- Search: $199
- Executive: $499

Live code states:
- intelligence: $49
- active: $199
- executive: $499
- concierge: $499

This is not cosmetic drift.
It breaks packaging clarity, copy accuracy, and downstream pricing decisions.

Implementation requirement:
- Before any packaging experiment, declare the current canonical pricing strategy.
- Then update pricing strategy docs, billing copy, and pricing-page language to match the canonical model.

### 2. Coach and executive pricing language are partly split across old and new narratives

Coach-facing pages are already stronger than older docs, but economics, FAQ, and plan naming still need one canonical pricing story.

### 3. Product architecture is described, but not yet explicitly framed as graph-and-state moat

The repo shows workflow infrastructure, jobs, AI features, and gating.
What is missing is a formal product-design layer that defines:
- nodes
- transitions
- checkpoints
- memory/state persistence
- human override points

This is a strategy and implementation gap, not just a documentation gap.

## Workstream map

## Workstream 1: Agent Architecture and Graph Design

Goal:
Turn Starting Monday from "AI features plus jobs" into a deliberately designed orchestration system with explicit state, checkpoints, and decision graph quality.

Why this matters:
- This is the strongest moat idea from the reviewed file.
- It directly improves reliability, trust, and product distinctiveness.
- It sharpens future implementation of prep briefs, morning briefings, signal triage, and coach workflows.

Current evidence:
- ARCHITECTURE.md shows worker jobs, AI features, traces, auth, and tier gating.
- The product already has recurring cadence loops: signal-job, scan-job, briefing-job, follow-up jobs, activation jobs.
- What is missing is a documented graph of how users move through stateful decision workflows.

Implementation tasks:
1. Create a "workflow graph spec" for the core executive-search loop.
2. Define explicit nodes for:
- signal detected
- signal triaged
- company reprioritized
- outreach drafted
- outreach sent
- prep brief generated
- interview logged
- follow-up scheduled
- opportunity advanced or dropped
1. Define transition criteria for each node.
2. Define required persistent state at each node.
3. Define human checkpoints where AI suggestions should pause for review.
4. Define coach-specific graph overlays for shared client workflows.
5. Define telemetry events for graph completion, stall, and re-entry.

Target artifacts:
- New strategy doc: docs/strategy/agent-graph-design-spec-2026-06-13.md
- Possible follow-on update: ARCHITECTURE.md
- Possible follow-on product ticket spec: docs/product-requirements.md

Potential code targets after spec approval:
- src/lib/trace.ts
- src/lib/api-usage.ts
- relevant AI routes
- worker jobs affecting cadence and reminders

Success metric:
- Every AI or workflow feature can be placed on one shared graph with known state and checkpoint logic.

Priority:
- P0

## Workstream 2: Pricing and Packaging Strategy

Goal:
Make the pricing model coherent, outcome-led, premium, and internally consistent across code, docs, and page copy.

Why this matters:
- Pricing is currently one of the highest-leverage growth levers.
- The repo already includes thoughtful pricing architecture, but current live values and older strategy artifacts diverge.
- Premium positioning breaks if packaging is ambiguous.

Current evidence:
- docs/strategy/pricing-strategy.md has strong buyer psychology analysis.
- src/lib/pricing.ts is the live source of truth.
- src/app/pricing/page.tsx and pricing-cards.tsx already contain premium-style copy and anchoring language.

Implementation tasks:
1. Declare canonical plan ladder.
2. Align plan names across strategy and UI.
3. Rewrite pricing-page copy around outcome, urgency, and buyer mode.
4. Decide whether quarterly remains part of the offer or is hidden from primary UX.
5. Decide the role of Concierge versus Executive to avoid plan confusion.
6. Add a pricing governance rule: strategy doc cannot drift from src/lib/pricing.ts.
7. Define experiments:
- annual default versus monthly default
- anchor sentence placement
- buyer-mode framing versus feature framing
- Concierge visibility versus invite-only framing

Target files:
- docs/strategy/pricing-strategy.md
- src/lib/pricing.ts
- src/app/pricing/page.tsx
- src/app/pricing/pricing-cards.tsx

Success metrics:
- One canonical plan story across all surfaces
- improved pricing-page CTA conversion
- lower confusion in support or sales questions

Priority:
- P0

## Workstream 3: Premium Positioning and Brand Principles

Goal:
Apply premium brand discipline consistently so Starting Monday feels deliberately high-value, not just highly useful.

Why this matters:
- This work is already well underway.
- The benchmark snapshot shows Starting Monday is close to the reference band but still trails the top tier in cinematic composition, pacing, and proof density.

Current evidence:
- docs/strategy/luxury-modern-sitewide-execution-plan-2026-06-13.md
- docs/strategy/luxury-reference-benchmark-snapshot-2026-06-13.md
- docs/strategy/starting-monday-vs-top-10-luxury-sites-2026-06-13.md

Implementation tasks:
1. Move from page-by-page elevation to reusable premium rules.
2. Establish three non-negotiables for all entry pages:
- one dominant narrative promise above the fold
- one proof strip within first scan depth
- one trust/control statement near the primary CTA
1. Reduce message sprawl on core entry pages.
2. Introduce stronger typographic and pacing governance.
3. Tighten denominator-backed proof modules.
4. Extend premium rules to pricing and coach pages first, because those are monetization-critical.

Target files:
- docs/strategy/luxury-modern-sitewide-execution-plan-2026-06-13.md
- src/app/pricing/page.tsx
- src/app/for-coaches/page.tsx
- homepage and channel page surfaces already named in the luxury execution plan

Success metrics:
- luxury feel score lift on pricing and coach funnels
- tighter proof engagement
- improved entry-page conversion

Priority:
- P0

## Workstream 4: LinkedIn Authority-Content System

Goal:
Turn existing content-system docs into a working authority engine tied to product, market intelligence, and channel conversion.

Why this matters:
- This is the strongest distribution lever in the selected ideas.
- The repo already has real scaffolding for deterministic posting and admin-social workflows.

Current evidence:
- docs/strategy/linkedin-content-system.md
- repo note: deterministic weekday audience rotation in src/lib/social-posting-plan.ts
- repo note: /api/admin/social/today and /api/admin/social/morning enforce schedule copy

Implementation tasks:
1. Audit current admin social flow against the LinkedIn content system spec.
2. Define the content production graph:
- pillar selected
- draft generated
- edited by operator
- approved
- posted or scheduled
- performance reviewed
- winning pattern fed back into generation
1. Add a small "authority-post scorecard" so every post passes:
- one clear idea
- executive-specific relevance
- credible proof or observation
- no generic feature-announcement framing
1. Create content templates for the strongest pillars:
- search craft
- market intelligence
- behind the build
- user pattern insight
1. Connect social topics to live product artifacts when possible.

Target files:
- docs/strategy/linkedin-content-system.md
- src/lib/social-posting-plan.ts
- /api/admin/social/today
- /api/admin/social/morning
- any admin/social UI route already implemented

Success metrics:
- consistent weekly publishing cadence
- higher inbound relevant comments and DMs
- higher profile link clicks and partner inquiries

Priority:
- P0

## Workstream 5: Emotion-Driven Strategy Storytelling

Goal:
Upgrade Starting Monday messaging so it does not rely only on logic, workflow, and features.

Why this matters:
- The product solves emotional pain: chaos, invisibility, drift, loss of control, loss of professional identity.
- Current messaging is strong on utility and discipline, but parts of it still underuse emotion and identity.

Implementation tasks:
1. Create a reusable messaging rubric for all major pages and content:
- shared frustration
- stakes of inaction
- motivating future state
- identity statement
- mechanism proof
1. Update homepage, pricing, and coach entry pages to pass that rubric.
1. Use the same rubric in LinkedIn post review.
1. Create three repeatable message frames:
- control under uncertainty
- earlier signal, calmer action
- prepared at peer level

Target files:
- docs/strategy/luxury-modern-redesign-brief-home-and-channel-pages-2026-06-13.md
- docs/strategy/linkedin-content-system.md
- src/app/pricing/page.tsx
- src/app/for-coaches/page.tsx
- homepage/channel copy surfaces

Success metrics:
- faster value comprehension
- stronger CTA intent on first visit
- better post resonance on LinkedIn

Priority:
- P0

## Workstream 6: Coach Website Conversion Framework

Goal:
Finish translating coach-facing pages from "explainer" to "high-conviction buyer motion."

Why this matters:
- This is one of the clearest medium-priority ideas with direct near-term revenue implications.
- Much of the work is already mapped in the coach epic.

Current evidence:
- docs/coach-council-epic.md
- docs/coaches-landing-features.md
- docs/coaches-landing-change-list.md
- src/app/for-coaches/page.tsx
- src/app/for-coaches/faq/page.tsx

Implementation tasks:
1. Tighten hero around transformation first.
2. Move coach proof and trust even closer to the primary CTA.
3. Canonicalize coach pricing model across landing page, FAQ, and economics page.
4. Add named peer proof if available.
5. Make the 30-day pilot scorecard explicit on the landing page.
6. Package the trust boundary as a short, undeniable statement.

Target files:
- src/app/for-coaches/page.tsx
- src/app/for-coaches/faq/page.tsx
- src/app/for-coaches/economics/page.tsx
- docs/coach-council-epic.md

Success metrics:
- higher coach preview request rate
- lower FAQ dependence before preview request
- better coach-page scroll-to-CTA completion

Priority:
- P1

## Workstream 7: Uber-Style Expectation Resets for UX

Goal:
Use the "category expectation reset" idea as a product and UX standard, not just a design metaphor.

Why this matters:
- This is a good medium-priority lens for product quality.
- It helps decide which experiences should feel surprisingly easy and non-negotiable.

The expectation resets most relevant to Starting Monday:
1. Clarity before commitment
- users should know what the plan does and what the first week looks like before signup
1. One obvious next action
- no ambiguity about what to do next on entry pages and dashboards
1. Visible momentum
- progress, overdue risk, and changed signals should be immediately visible
1. Real-time confidence
- signal recency and workflow status should be obvious
1. Low-friction prep
- prep should feel closer to one tap than to assembling a document manually

Implementation tasks:
1. Define experience standards for pricing, onboarding, daily briefing, and coach prep.
2. Add those standards to UX review checklists.
3. Apply them first to:
- pricing page
- coach entry page
- daily briefing flow
- prep brief generation flow

Target artifacts:
- new UX standard doc or addition to existing UI governance docs
- possible updates to docs/ux-ui-elite-site-rubrics.md and related UX governance docs

Priority:
- P1

## Recommended execution sequence

## Phase 1: Alignment and specification (1 week)

1. Resolve canonical pricing model.
2. Create the agent graph design spec.
3. Create a single messaging rubric for premium plus emotional clarity.
4. Confirm top-line KPIs per workstream.

## Phase 2: Monetization and funnel surfaces (2 weeks)

1. Update pricing strategy and pricing page.
2. Update coach landing, FAQ, and economics consistency.
3. Apply premium proof and trust rules to those pages.

## Phase 3: Distribution and authority engine (2 weeks)

1. Audit current social admin implementation.
2. Wire the authority-post scorecard into editorial workflow.
3. Standardize five repeatable post templates.
4. Publish weekly and measure response.

## Phase 4: Product moat articulation and workflow instrumentation (2-3 weeks)

1. Convert agent graph spec into product tickets.
2. Add workflow-state telemetry and checkpoint logic.
3. Improve morning briefing and prep loops using the new graph model.

## Phase 5: UX expectation resets (ongoing)

1. Apply the expectation-reset checklist to core funnels.
2. Promote patterns that reduce ambiguity and increase visible momentum.

## 30-day implementation backlog

### P0 in next 30 days

1. Resolve pricing drift between docs and live pricing code.
2. Publish agent graph design spec.
3. Add premium plus emotion messaging rubric to pricing and coach pages.
4. Tighten coach landing with explicit pilot and trust pack emphasis.
5. Audit social workflow against the LinkedIn content system and close the biggest gaps.

### P1 in next 30 days

1. Define UX expectation-reset checklist.
2. Add named coach proof if available.
3. Add post-performance feedback loop to social ops.

## Recommended owners

- Product: pricing canon, graph spec, message hierarchy
- Engineering: graph implementation, telemetry, pricing-page and coach-page changes
- Design: premium system enforcement, pacing, expectation-reset QA
- Content: proof validation, emotional framing rubric, LinkedIn templates
- Growth: social metrics, pricing-page experiments, coach conversion measurement

## Success criteria by selected idea

- Agent architecture and graph design: one explicit workflow graph governs core search and coach loops.
- Pricing and packaging strategy: one pricing story appears in docs, code, and UI with no contradictions.
- Premium positioning and brand principles: pricing and coach funnels enter the premium reference band.
- LinkedIn authority-content system: deterministic weekly publishing with measurable inbound quality.
- Emotion-driven strategy storytelling: all flagship copy passes the new messaging rubric.
- Coach website conversion framework: coach preview motion becomes clearer and lower-friction.
- Uber-style expectation resets for UX: top funnel pages and key workflows reduce ambiguity and visible friction.

## Best next three actions

1. Approve canonical pricing and plan naming.
2. Create the agent graph design spec as the next strategy artifact.
3. Run one implementation sprint focused only on pricing plus coaches, because those are the fastest revenue surfaces.
