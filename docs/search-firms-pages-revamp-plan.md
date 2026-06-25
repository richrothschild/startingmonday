# Search Firms Pages Revamp Plan
Status: Draft
Date: 2026-06-24
Research base: docs/search-firms-transition-research-sources.md
Pattern adapted from: docs/coach-pages-upgrade-plan.md and docs/for-coaches-operator-native-page-brief.md

---

## Executive Summary

Revamp the search-firm route family into one coherent, operator-native funnel that:

1. Speaks directly to retained-search economics.
2. Differentiates persona-level jobs-to-be-done.
3. Reduces copy interpretation burden.
4. Uses bounded pilot framing with explicit pass/fail criteria.
5. Reuses the successful coaches-page pattern: evidence-led framing, role-boundary clarity, low-friction trial, and trust sequencing.

Primary strategic move:
- Treat /search-firms as the canonical buyer journey.
- Reposition /for-search-firms as either a redirect or tightly scoped partner entry page to avoid narrative duplication.

---

## Problem Diagnosis

Current issues across /for-search-firms and /search-firms:

1. Route duplication and message drift
- Two pages compete with overlapping value propositions and CTA paths.
- Category framing varies between partner guide and platform page.

2. Dense narrative before proof
- Important outcomes are present, but copy density delays comprehension.
- Synthetic-council guidance indicates Understand is the limiting metric.

3. Persona pathways under-leveraged
- Persona routes exist, but role-specific outcomes and next actions are not explicit enough per persona.

4. Economic claims are not consistently scorecard-linked
- Time saved and quality gains appear, but measurement model is not always front-loaded.

5. Trust and control language is present but not systematized
- Candidate data control and role boundaries should be explicit, compact, and consistent in each route.

---

## Objectives and Success Criteria

### Business objectives

1. Increase search-firm pilot conversion quality.
2. Improve partner confidence in measurable shortlist impact.
3. Reduce route confusion and duplicate decision paths.
4. Reduce legal and procurement friction from first meeting to pilot launch.
5. Increase management confidence in pilot governance and rollout readiness.

### UX and message objectives

1. 10-second value scan clarity for all three search-firm personas.
2. Above-fold dual CTA discipline: primary pilot action + secondary sample asset.
3. Strong category contrast: prep operating layer, not generic data feed.

### KPI targets (adapted from four-channel framework)

1. Firm intro to pilot kickoff: >= 25%.
2. Candidate readiness passport completion in pilot: >= 70%.
3. First-round advancement delta: +15% vs baseline.
4. Recruiter handoff completion within SLA: >= 90%.
5. Mandate-fit asset reuse rate: >= 40%.
6. Procurement cycle from pilot request to legal-ready pilot order form: <= 15 business days for mid-sized firms.
7. Pilot governance completion rate (named executive sponsor, scorecard owner, legal reviewer): >= 90% before kickoff.

---

## Commercial and Governance Workstreams

## Legal and compliance workstream

Objective:
- Make legal review fast, predictable, and low-risk for retained-search buyers.

Deliverables:
1. Legal readiness summary for buyer review
- Data flow overview, confidentiality model, role-scoped access controls, retention and deletion posture.

2. Pilot legal packet
- MSA short form or pilot order form, DPA addendum path, security and privacy FAQ, subprocessors summary.

3. Claim and language guardrails
- Approved externally safe language for confidentiality, AI assistance, and decision-support boundaries.

Acceptance criteria:
1. Legal packet is linked from /search-firms trust section and partner CTA confirmation page.
2. No public claim conflicts with contract language or published policy pages.
3. Legal reviewer can complete first-pass review from one consolidated packet.

## Purchasing and procurement workstream

Objective:
- Remove buying friction and make pilot entry fit existing procurement workflows.

Deliverables:
1. Pricing and packaging options
- Pilot package, lane package, and expansion package with clear inclusions and measurement commitments.

2. Procurement one-pager
- Vendor basics, data handling summary, implementation expectations, support model, billing options.

3. Buyer-side implementation estimate
- Time commitment by role: partner lead, principal, candidate-success owner, operations/legal contact.

Acceptance criteria:
1. Procurement packet can be sent in first follow-up without custom rewrite.
2. Pilot quote to order-form path is documented with owners and SLA.
3. Packaging language on landing pages is consistent with purchasing docs.

## Management and change-adoption workstream

Objective:
- Ensure partner and practice leadership can run adoption with explicit ownership and low disruption.

Deliverables:
1. Management rollout map
- Executive sponsor role, practice lead role, delivery lead role, and weekly operating cadence.

2. Team enablement kit
- Kickoff checklist, weekly review template, objection handling, and escalation path.

3. Operating metrics dashboard definition
- Management view for adoption, usage quality, and mandate economics.

Acceptance criteria:
1. Pilot cannot start without named sponsor and scorecard owner.
2. Weekly review cadence and decision owner are documented before launch.
3. Management dashboard fields align to pilot scorecard metrics.

## Trial governance and decision workstream

Objective:
- Make trial decisions reversible, measured, and executive-readable.

Deliverables:
1. Trial charter template
- Scope, hypotheses, roles, data-sharing boundaries, success thresholds, and stop conditions.

2. Day-0 baseline and day-30 review protocol
- Baseline capture for prep hours, slate quality, reset frequency, and first-round progression.

3. Go, revise, or stop decision memo template
- One-page memo for leadership decision at pilot end.

Acceptance criteria:
1. Every pilot has signed charter before first candidate activation.
2. Day-30 decision uses predefined thresholds, not retrospective interpretation.
3. Trial outputs can be converted directly into expansion proposal or closure summary.

---

## Persona Framework (Synthetic Council + Existing Routes)

Use these three route personas as first-class content paths:

1. Partner and firm lead
- Primary concern: mandate economics, differentiation, and partner time protection.
- Required proof: reduced prep rework and better shortlist velocity.

2. Principal and delivery lead
- Primary concern: execution consistency and candidate prep quality.
- Required proof: cleaner kickoff and fewer mid-search resets.

3. Candidate success owner
- Primary concern: candidate readiness, first-round quality, and handoff confidence.
- Required proof: stronger interview prep and better first-touch outcomes.

Cross-persona pains to address on-page:

1. Search-firm side
- Re-brief burden, kickoff variance, reset risk, unclear ROI.

2. Executive side (as observed by firms)
- Manual prep load, narrative inconsistency, low between-call discipline, confidentiality concerns.

---

## Information Architecture Decision

### Canonical route strategy

1. Canonical route: /search-firms
- Full buyer journey and persona routing hub.

2. Legacy or campaign route: /for-search-firms
- Option A (preferred): redirect to /search-firms.
- Option B: keep as short campaign page with strict message parity and canonical pointing to /search-firms.

3. Persona hub: /search-firms/personas
- Keep and strengthen role differentiation and CTA branching.

4. Asset route: /search-firms/sample-cfo-brief
- Keep as proof asset anchor for low-friction evaluation.

---

## Page-by-Page Plan

## P0: /search-firms (Canonical) - Full restructure

### New top-to-bottom structure

1. Hero with operator framing
- Headline: explicit first-round quality and shortlist economics.
- Subhead: one sentence on prep operating layer.
- CTA pair: Run pilot (primary), Review sample brief (secondary).

2. Economic consequence block (above fold)
- One compact card: where mandate cycles lose time and margin.
- Include three metrics placeholders tied to pilot scorecard.

3. Comparison panel (without vs with operating layer)
- Replace long explanatory paragraphs.
- Three rows max: prep method, context visibility, call quality.

4. Persona routing strip
- Cards for partner lead, principal lead, candidate success owner.
- Each card has one-line JTBD and one action.

5. Proof module
- Keep proof stories but normalize claim quality labels:
  - Directional pilot evidence
  - Verified pilot metric
  - Case study pending

6. Operating cadence section
- Five-step weekly retained-search rhythm.
- Keep to one line per step.

7. Role boundary and trust section
- Two-column table:
  - Search firm judgment and relationship work.
  - Starting Monday prep and execution infrastructure.
- Explicit candidate-controlled sharing and revocation statement.

8. Pilot scorecard section
- Define pass/fail metrics:
  - Prep hours saved per mandate
  - First-slate acceptance rate
  - Mid-search resets avoided
  - Candidate first-round advancement

9. Final CTA section
- Repeat primary and secondary CTA.
- Reinforce one-mandate pilot start.

### Remove or compress

1. Any duplicate explanatory prose already covered by comparison panel.
2. Repetitive statements of what the platform is not.
3. Multi-paragraph sections without measurable outcome anchor.

---

## P0: /search-firms/personas - Precision routing

### Changes

1. Add outcome chips per persona
- Partner lead: mandate economics and bid differentiation.
- Principal lead: execution consistency and prep quality.
- Candidate success owner: readiness and interview conversion.

2. Add role-specific next action CTA
- Partner lead: run one-mandate pilot setup.
- Principal lead: view kickoff checklist.
- Candidate success owner: review sample brief workflow.

3. Add trust microcopy
- Clarify candidate data-sharing control and role-scoped visibility.

---

## P1: /search-firms/sample-cfo-brief - Proof asset upgrade

### Changes

1. Add context wrapper above sample
- What this asset is, when to use it, and expected decision impact.

2. Add persona-specific read guides
- Partner lens, principal lens, candidate-success lens.

3. Add pilot instrumentation CTA
- Link to scorecard template to measure impact after one week.

---

## P1: /for-search-firms - Route normalization

### Option A (preferred)

1. Convert to permanent redirect to /search-firms.
2. Keep any route-level OG assets if needed for backward link hygiene.
3. Update sitemap and internal links to canonical route only.

### Option B (if campaign route is needed)

1. Keep only short-form partner-intro variant.
2. Enforce message parity with canonical route sections and claim tiers.
3. Canonical tag points to /search-firms.

---

## Messaging Framework (Adapted From Coaches Playbook)

Use the same successful pattern from coach revamp, adapted to search firms:

1. Open with outcome-linked mechanism
- Not product capability first.

2. State role boundary early
- Preserve partner authority; platform handles operating visibility.

3. Use one bounded pilot frame everywhere
- One mandate, 30 days, explicit pass/fail continuation.

4. Keep trust in late-stage decision sections
- Present as operational controls, not abstract policy text.

5. Keep one canonical one-liner
- Starting Monday improves first-round candidate quality by making prep execution visible before kickoff.

---

## Research-to-Copy Translation Rules

1. One idea per sentence in decision sections.
2. Avoid abstract clusters (momentum, readiness, signal intelligence) without an operational verb.
3. Every major section must answer one explicit buyer question.
4. Pair each claim with evidence label and confidence tier.
5. Prefer operator language: mandate, kickoff, slate, reset, handoff, shortlist.

---

## Design and UX Requirements

1. Scanability in under 10 seconds for value proposition.
2. One primary plus one secondary CTA above fold.
3. Comparison panel before deep copy sections.
4. Metrics and proof before heavy feature detail.
5. Visual consistency with premium channel system while preserving route distinctiveness.

---

## Implementation Sequence

## Phase 1 - Research and architecture lock (Week 1)

1. Finalize canonical route strategy (/search-firms as source of truth).
2. Confirm claim tiers and evidence labels.
3. Finalize persona JTBD snippets and scorecard metrics.
4. Finalize legal and procurement artifact list with ownership.
5. Define management sponsor model and pilot governance template.

Done when:
- Final section map and claim inventory are approved.

## Phase 2 - Content and structure implementation (Week 2)

1. Rebuild /search-firms structure per P0 architecture.
2. Upgrade /search-firms/personas with persona outcome chips and action paths.
3. Upgrade /search-firms/sample-cfo-brief wrapper and instrumentation links.
4. Add legal and purchasing CTA pathways to trust and partner sections.

Done when:
- All P0 sections are live with consistent CTA and trust language.

## Phase 3 - Route normalization and IA cleanup (Week 3)

1. Redirect or normalize /for-search-firms.
2. Update sitemap, internal links, and channel mappings.
3. Remove duplicate content risk and enforce canonicalization.
4. Validate cross-page language parity with legal/purchasing packets.

Done when:
- Only one canonical buyer narrative remains indexable.

## Phase 4 - Validation and instrumentation (Week 4)

1. Run synthetic council re-score with search-firm lenses.
2. Validate 10-second comprehension and CTA recall.
3. Baseline pilot scorecard telemetry for first cohorts.
4. Run trial-governance dry run with mock sponsor and legal reviewer.

Done when:
- Understand target >= 0.72 equivalent and KPI instrumentation operational.

---

## Acceptance Criteria

1. Narrative coherence
- /search-firms is clearly canonical and internally linked as primary.

2. Persona relevance
- Each persona path states role-specific value, one proof anchor, and one next action.

3. Evidence discipline
- All material claims have a confidence label and source path.

4. Operational clarity
- Pilot scope, success metrics, and continuation rule are explicit.

5. SEO and routing hygiene
- Canonical tags, redirects, sitemap entries, and internal links are aligned.

6. Legal and purchasing readiness
- Legal packet and procurement packet are internally approved and linked from buyer journey.

7. Management readiness
- Sponsor model, operating cadence, and decision ownership are explicit in pilot materials.

---

## Risks and Mitigations

1. Risk: over-claiming without validated metrics.
- Mitigation: claim tiers and caveated language by evidence confidence.

2. Risk: route confusion persists if both pages remain full-length.
- Mitigation: enforce canonical route and reduce duplicate narrative.

3. Risk: partner buyers perceive workflow disruption.
- Mitigation: front-load no-integration workflow fit and one-mandate pilot framing.

4. Risk: candidate confidentiality concerns suppress adoption.
- Mitigation: explicit candidate-controlled sharing and revocation model in trust module.

5. Risk: procurement stalls despite product interest.
- Mitigation: pre-built procurement packet and pilot order path with explicit owner and SLA.

6. Risk: legal review blocks pilot timeline.
- Mitigation: consolidated legal packet plus approved fallback pilot terms for small and mid-sized firms.

7. Risk: pilot fails from weak internal ownership.
- Mitigation: mandatory sponsor, scorecard owner, and weekly management review cadence.

---

## Required File Work (Planned)

1. src/app/search-firms/page.tsx
- Full section restructuring and copy update.

2. src/app/search-firms/personas/page.tsx
- Persona differentiation and role-specific CTA updates.

3. src/app/search-firms/sample-cfo-brief/page.tsx
- Context wrapper and scorecard CTA additions.

4. src/app/for-search-firms/page.tsx
- Redirect or campaign-short form normalization.

5. src/app/sitemap.ts
- Canonical route entry and duplicate cleanup.

6. src/lib/channel-ia.ts and any route mapping files
- Ensure search-firm route references point to canonical journey.

7. docs/search-firms-trial-charter-template.md
- New trial governance template including legal, purchasing, sponsor, and KPI sections.

8. docs/search-firms-procurement-packet.md
- Buyer-facing procurement summary and package options.

9. docs/search-firms-legal-readiness-summary.md
- Legal/compliance summary for first-pass review.

---

## Research Execution Plan (Detailed)

1. Conduct 3x3 persona interview sprint
- 3 partner leads, 3 principal leads, 3 candidate-success operators.
- Capture baseline metrics and top objections by segment.

2. Run page comprehension test
- Tasks:
  - 10-second value restatement.
  - 30-second next action identification.
  - Trust interpretation check.

3. Pilot scorecard readiness workshop
- Define metric collection protocol per mandate.
- Confirm which metrics are publishable externally.

4. Synthetic-council rerun for page copy
- Explicitly score Open, Understand, Action, Trust, and Category Contrast.

5. Evidence publication pipeline
- Add verified findings to a search-firms evidence section once validated.

7. Procurement and legal pilot simulation
- Run one internal tabletop from first call to signed pilot packet and record blockers.

8. Management readiness simulation
- Run one mock weekly operating review with sponsor-level decision prompts.

---

## Deliverables

1. Research synthesis file
- docs/search-firms-transition-research-sources.md

2. Revamp implementation plan
- docs/search-firms-pages-revamp-plan.md

3. Follow-on implementation tickets (next step)
- Engineering tickets by route and component, each with KPI and acceptance criteria.
