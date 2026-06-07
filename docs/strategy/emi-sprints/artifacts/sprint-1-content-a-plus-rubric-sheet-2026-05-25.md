# Sprint 1 Content A+ Rubric Sheet (EMI)

Owner: Documentation Operations
Status: deprecated
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: no
Canonical doc: docs/sprint-backlog.md
Lifecycle candidate: archive


Date: 2026-05-25  
Scope: Sprint 1 conversion pages only
- src/app/page.tsx
- src/app/pricing/page.tsx
- src/app/for-cio/page.tsx
- src/app/for-coaches/page.tsx

## Decision Rule

A page is **A+ PASS** only if all conditions are true:
1. Total weighted score is **>= 95/100**.
2. No rubric category is below its floor score.
3. No hard-fail gate is violated.
4. Telemetry validation sample size reaches **>= 100 unique sessions** after publish (or 7 days, whichever is first) with no null critical fields.

If any condition fails, the page is **FAIL** and cannot be marked complete.

## Weighted Rubric (Exact)

| ID | Category | Weight | Floor | Pass Definition |
|---|---|---:|---:|---|
| R1 | Positioning Clarity + Differentiation | 15 | 13 | EMI promise is explicit, alternatives are named, and "why us now" is unambiguous. |
| R2 | Persona Fit Precision | 15 | 13 | Copy maps to target persona pains, language, and desired outcomes without cross-segment drift. |
| R3 | Outcome Specificity + First-7-Days Clarity | 10 | 8 | User can visualize Day 1, Day 3, Day 7 actions and expected progress. |
| R4 | Objection Handling at Decision Points | 10 | 8 | Top objections are answered near CTA with proof and next action. |
| R5 | Proof Quality + Claims Governance | 15 | 14 | Every numeric claim has denominator, freshness, source path, and caveat text. |
| R6 | CTA Architecture + Friction Design | 10 | 9 | One clear primary CTA, one proof CTA, one method CTA; no competing clutter. |
| R7 | SEO + Metadata + Schema Alignment | 10 | 9 | Title, description, H1, OG, Twitter, canonical, and schema descriptions are aligned to EMI intent. |
| R8 | Telemetry Coverage + Data Completeness | 15 | 14 | Required events fire with complete dimensions and no critical nulls. |

## Scoring Scale (Exact)

Use this scale for each category:
- 0-39% of category max: Non-functional
- 40-59%: Weak, major rewrite required
- 60-79%: Functional but not competitive
- 80-94%: Strong, still below A+
- 95-100%: A+ quality

## Hard-Fail Gates (Any One = FAIL)

| Gate ID | Hard-Fail Condition | Validation Method |
|---|---|---|
| H1 | Numeric claim shown without denominator and freshness date | Manual copy audit + references cross-check |
| H2 | Numeric claim shown without source reference path | Claims registry review |
| H3 | Primary CTA has no telemetry event | Analytics debug stream |
| H4 | Critical telemetry fields null for >1% of events | Event QA query |
| H5 | Page has >1 conflicting core promise | Narrative audit |
| H6 | Persona mismatch language appears in hero or primary CTA block | Persona QA checklist |
| H7 | Metadata promise materially conflicts with body copy | Metadata diff audit |
| H8 | Legal-safe caveat missing for directional/limited-cohort claims | Legal/compliance QA |

## Required Telemetry Contract (Sprint 1)

All Sprint 1 pages must emit these events:
- `emi_page_view`
- `emi_cta_click`
- `emi_proof_block_view`
- `emi_objection_expand`
- `emi_path_transition`

Required dimensions on every event:
- `page_slug`
- `persona_segment`
- `cta_id` (nullable only for non-CTA events)
- `proof_id` (nullable except proof events)
- `objection_id` (nullable except objection events)
- `experiment_id`
- `session_id`
- `week_start`

Critical null policy:
- `page_slug`, `persona_segment`, `session_id`, `week_start` must be non-null for >= 99% of events.

## Page-Level Pass Checklist (Exact)

A page cannot pass unless all are true:
- Hero expresses EMI mechanism in one sentence.
- Alternatives contrast appears above first major scroll break.
- First-7-days mini-plan is visible before final CTA section.
- Objection module sits within one screen of primary CTA.
- Proof module includes denominator + date + caveat + method link.
- Primary CTA, proof CTA, and method CTA each have tracked click events.
- Metadata + schema updated to EMI page intent.
- QA score >= 95 and all hard-fail gates clear.

## QA Workflow

1. Content owner completes rubric self-score.
2. Growth owner verifies CTA and objection placement.
3. Analytics owner validates telemetry in debug and warehouse.
4. Legal/trust owner signs off claims and caveats.
5. Final pass/fail recorded in Sprint scorecard.

## Enforcement

- Any FAIL page blocks Sprint 1 closeout.
- Pages that score 90-94 can ship only behind explicit temporary waiver with owner + due date.
- A+ target remains >= 95 with no hard-fail violations.
