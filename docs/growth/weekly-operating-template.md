# Weekly Growth Operating Template

## Purpose
Run a repeatable UI/UX/content growth loop that reduces cognitive load and increases qualified signups.

## Owners
- Product Marketing: messaging, message hierarchy, CTA narrative
- Design: UX patterns, information architecture, friction reduction
- Engineering: page performance, event integrity, release safety gates
- Growth: experiment pipeline, reporting, decision ledger

## Weekly Cadence
### Monday - Prioritization (30 minutes)
- Review last week scorecard.
- Pick top 2 experiments by ICE (Impact, Confidence, Ease).
- Lock one primary KPI and one guardrail KPI per experiment.
- Assign DRI and ship date.

### Wednesday - Launch Readiness (20 minutes)
- Confirm hypothesis, variant copy, and UX diffs.
- Verify instrumentation in staging.
- Confirm mobile QA and page performance.
- Approve launch checklist.

### Friday - Conversion Readout (45 minutes)
- Review strict scorecard and deltas vs control.
- Decision per experiment: Ship, Iterate, or Kill.
- Capture learnings and next hypotheses.
- Escalate any guardrail breach.

## Meeting Agenda (Friday)
1. KPI snapshot (5 minutes)
2. Experiment-by-experiment readout (25 minutes)
3. Decision and owner assignment (10 minutes)
4. Risks, blockers, and next-week queue (5 minutes)

## Experiment Brief Format
- Experiment ID: YYYY-WW-XX
- Hypothesis: If we change X for audience Y, KPI Z will improve by N%.
- Primary KPI: one metric only
- Guardrails: max two metrics
- Segment: traffic source + persona path
- Variant summary: what changed in copy, layout, or flow
- Instrumentation plan: events and expected funnel states
- Stop/Ship criteria: quantitative thresholds
- Owner and due date

## Scorecard (Required Every Friday)
- North star: qualified signup rate
- Hero CTA CTR
- Form start rate
- Form completion rate
- Bounce rate
- Median engaged time (seconds)
- Scroll depth 75% reach rate
- Section dwell median by section_id

## Decision Rules
- Ship: primary KPI improves and no guardrail breaches.
- Iterate: mixed signal or confidence interval overlaps control.
- Kill: KPI regresses or guardrail breached.

## Production Release Gate
A production-bound commit must pass all of the following:
- Growth synthetic council strict audit
- Growth strict metrics gate
- Build and typecheck
- Instrumentation smoke validation

## Required Artifacts
- docs/growth/weekly-metrics.latest.json
- docs/growth/weekly-readout.latest.md
- docs/growth/weekly-decision-log.md
