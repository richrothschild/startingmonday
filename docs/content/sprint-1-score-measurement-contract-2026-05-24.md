# Sprint 1 Score Measurement Contract

Owner: Documentation Operations
Status: deprecated
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: no
Canonical doc: docs/sprint-backlog.md
Lifecycle candidate: archive


Date: 2026-05-24
Epic: Council Score 95 Plus Site Improvement Epic
Sprint: 1 (IA and decision architecture)

## Objective

Define a single measurement contract that converts council score movement into observable product and go-to-market metrics.

## Baseline Score Snapshot

Source: docs/content/outplacement-idea-full-council-review-2026-05-24.md

- Main Synthetic Council average: 83.7
- Executive Council average: 84.2
- Coaches Council average: 89.7
- Outplacement Council average: 85.0
- Blended average: 85.2

## North Star Target

- Every member buy-likelihood score at or above 95.

## Scoring cadence

- Weekly: metric trend review.
- Biweekly: member-level score delta review.
- Sprint close: evidence-linked scorecard refresh.

## Evidence model per member score

Every score change must reference at least one of:
- Shipped artifact (page, feature, or policy).
- Conversion metric movement.
- Usability or interview validation.
- Objection-rate movement.

## Primary metric families

- Channel entry metrics
  - channel_entry_click_through_rate
  - channel_entry_to_next_step_rate

- Persona routing metrics
  - persona_route_selection_rate
  - persona_route_completion_rate

- Trust and buyer-risk metrics
  - trust_block_interaction_rate
  - procurement_objection_rate

- Activation and execution metrics
  - time_to_first_value_minutes
  - onboarding_completion_rate

- Intelligence quality metrics
  - signal_relevance_score
  - false_positive_rate
  - stale_signal_rate

- Commercial outcome metrics
  - partner_demo_to_proposal_rate
  - proposal_acceptance_rate
  - micro_product_arpu

## Owner map

- Product Lead: IA and route conversion outcomes.
- Product Ops: scorecard integrity and evidence traceability.
- Data Engineer: analytics instrumentation and dashboards.
- Frontend Lead: channel and persona flow implementation telemetry.
- Trust and Compliance Lead: trust artifact and procurement risk metrics.

## Sprint 1 instrumentation event schema (initial)

- channel_entry_clicked
  - properties: channel, cta_label, source_page, session_id

- persona_route_selected
  - properties: channel, persona, source_route, target_route, session_id

- trust_block_viewed
  - properties: channel, route, block_id, session_id

- trust_block_interacted
  - properties: channel, route, block_id, action, session_id

- micro_product_boundary_viewed
  - properties: product_name, route, audience_type, session_id

## Dashboard requirements

- Baseline and trend chart by council and by member.
- Funnel: channel entry -> persona selection -> primary CTA.
- Objection panel by channel (qualitative + tagged quantitative source).

## Sprint 1 exit criteria for measurement

- Event schema approved.
- Metric definitions approved.
- Owners assigned for every metric family.
- Baseline scorecard template published.
