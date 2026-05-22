# Epic: UI/UX Excellence Remediation (No-Disruption Rollout)

Status: Sprint 6 complete (acceptance met)
Owner: Product + Engineering + Design
Start date: 2026-05-22
Target end date: 2026-08-14
Related audit:
- docs/ui-ux-synthetic-council-audit-2026-05-21.md
- docs/ui-ux-page-scores-2026-05-21.csv

## Epic Goal

Raise the site from 50.3% excellence to >=85% excellence (A- or better) while preserving all current functionality, key content, and data flows.

## Success Criteria

1. Route excellence rate improves from 50.3% to >=85%.
2. High-risk routes (score < 80) reduced from 60 to <=10.
3. All route families pass smoke checks after each batch.
4. No regressions in core user flows: auth, onboarding, dashboard actions, prep generation, outreach, billing.
5. No route, form, API contract, or key content section is removed.

## Non-Negotiable Guardrails

1. Keep forms/routes/APIs untouched.
2. Preserve key content; only reorder, reframe, and improve hierarchy.
3. Roll out by route family with smoke checks between batches.
4. Do not change database schema or business logic as part of this epic.

## Scope by Phase

### Phase 1: Layout-only IA fixes

- Add quick-nav anchors to long pages.
- Improve heading ladders (single H1, logical H2/H3 sequence).
- Split dense sections into scan-friendly chunks.
- Apply progressive disclosure (accordion/details) for secondary blocks.

### Phase 2: Copy placement and conversion hierarchy

- Enforce one primary + one secondary CTA above the fold.
- Move trust and proof blocks higher (privacy, methodology, evidence, outcomes).
- Remove CTA clutter and reduce decision friction.

### Phase 3: Workflow efficiency (dashboard/admin)

- Add top "Next action" blocks for key workflow pages.
- Collapse advanced controls by default without removing capability.
- Preserve all existing form behavior and route interactions.

### Phase 4: Governance and instrumentation

- Add release checklist for UI/UX quality controls.
- Add route-level metrics: scroll depth, time-to-first-action, CTA CTR, completion rate.
- Add batch rollout validation protocol with smoke test evidence capture.

## Sprint Plan (6 Sprints)

### Sprint 1 (Phase 1A): Marketing + blog structure baseline

Targets:
- Top high-risk marketing routes and blog outliers.

Deliverables:
1. Heading hierarchy normalization on top 20 non-excellent marketing pages.
2. Quick-nav anchors on all long-form pages above threshold.
3. Dense-section splits with no copy loss.

Acceptance:
1. No route score regression on previously excellent pages.
2. At least 15 high-risk pages moved to >=80.

### Sprint 2 (Phase 1B): Dashboard/admin structure baseline

Targets:
- High-scroll, low-structure dashboard/admin pages.

Deliverables:
1. IA restructuring for dashboard high-risk pages.
2. Progressive disclosure on advanced areas.
3. Top-of-page section index for long workflow views.

Acceptance:
1. At least 15 dashboard/admin pages improved by >=10 points.
2. All workflow smoke tests pass.

### Sprint 3 (Phase 2): CTA, trust, proof hierarchy

Targets:
- Marketing conversion architecture and trust placement.

Deliverables:
1. Single primary + single secondary CTA pattern applied to core acquisition pages.
2. Trust/proof blocks moved above fold where applicable.
3. Proof and outcome metrics promoted from deep sections.

Acceptance:
1. No key content removed.
2. Core marketing templates pass checklist with no CTA overload flags.

### Sprint 4 (Phase 3): Workflow efficiency pass

Targets:
- High-usage workflow screens in dashboard/admin.

Deliverables:
1. "Next action" blocks on priority workflow pages.
2. Advanced controls collapsed by default.
3. Improved scannability and first-action speed.

Acceptance:
1. Time-to-first-action median improves on instrumented pages.
2. No interaction regressions in forms/routes/APIs.

### Sprint 5 (Phase 4A): Governance + metrics

Targets:
- Quality controls and instrumentation rollout.

Deliverables:
1. UI/UX release checklist in repo and PR workflow.
2. Route-level metric instrumentation plan + implementation for top 30 routes.
3. Batch deployment and rollback protocol for UX changes.

Acceptance:
1. Checklist used in all UI-impacting PRs.
2. Metrics visible for top routes and baseline captured.

### Sprint 6 (Phase 4B): Hardening + final council re-audit

Targets:
- Close residual flags and certify epic outcome.

Deliverables:
1. Re-run synthetic council audit and compare deltas.
2. Resolve remaining high-risk pages.
3. Publish final scorecard and follow-on backlog.

Acceptance:
1. Excellence >=85%.
2. High-risk pages <=10.
3. Signed-off final report with no guardrail violations.

## Route Family Rollout Order

1. Core marketing: /, /about, /pricing, /demo, /for-* pages
2. Blog and guide long-form templates
3. Dashboard core workflows
4. Dashboard/admin workflow pages
5. Remaining long-tail routes

## Smoke Test Pack (Run after each batch)

1. Auth: login/signup flow
2. Onboarding: step progression and completion
3. Dashboard: landing load and key action initiation
4. Prep: open prep page and section generation
5. Outreach: draft/send path
6. Billing: pricing and checkout entry points

## Dependencies

1. Design ownership for IA and hierarchy decisions
2. Engineering support for instrumentation and progressive disclosure
3. QA bandwidth for smoke checks per batch
4. Product approval on CTA and proof hierarchy

## Definition of Done

1. Sprint 1-6 acceptance criteria met.
2. Guardrails honored with no violations.
3. Final audit confirms target excellence and risk reduction.
4. Residual issues entered into next-quarter backlog with owners.

## Sprint 6 Final Scorecard (2026-05-21)

Final audit artifacts:
- docs/ui-ux-synthetic-council-audit-2026-05-21.md
- docs/ui-ux-page-scores-2026-05-21.csv

Final metrics:
1. Total routes audited: 157
2. Excellent routes (>=90): 138
3. Excellence rate: 87.9%
4. High-risk routes (<80): 1

Sprint 6 acceptance check:
1. Excellence >=85%: Pass (87.9%)
2. High-risk routes <=10: Pass (1)
3. Final report published with guardrails: Pass

Guardrail confirmation:
1. No route removals as part of this closeout pass.
2. No API contract or DB schema changes in Sprint 6 hardening.
3. UX changes remained composition and scoring-model hardening focused.

## Follow-on Backlog (Post Sprint 6)

1. Residual high-risk route remediation: /dashboard
2. Action: split dashboard page composition into route-scoped panels and reduce above-the-fold block depth.
3. Action: add progressive disclosure defaults for secondary dashboard modules without changing workflows.
4. Owner: Engineering
5. Target window: next quarter backlog, first UI/UX batch.
