# Sprint 2 Artifact: Funnel Analytics Dashboard and Event Schema

Date: 2026-05-25
Owner: Engineering
Status: Completed

## Objective

Instrument end-to-end EMI assessment funnel events so completion, clickthrough, and dropoff are measurable.

## Event Schema

1. emi_assessment_started
- Properties: persona, source_channel, session_id

2. emi_assessment_step_viewed
- Properties: step_name, step_index, persona, session_id

3. emi_assessment_step_completed
- Properties: step_name, step_index, completion_time_seconds, session_id

4. emi_assessment_completed
- Properties: persona, score, score_band, completion_time_seconds, session_id

5. emi_results_cta_clicked
- Properties: cta_type, persona, score_band, session_id

6. emi_onboarding_started
- Properties: persona, source=assessment_results, session_id

## Funnel Definition

1. Started -> Completed
2. Completed -> Results CTA clicked
3. Results CTA clicked -> Onboarding started

## KPI Coverage

1. Assessment completion rate
2. Assessment-to-onboarding clickthrough
3. Step-level dropoff coverage

## Dropoff Visibility Standard

1. Every step has both viewed and completed events.
2. Dropoff can be isolated to exact step and persona.
3. Dashboard slices by source channel and persona.

## Release Notes

1. Funnel instrumentation spec completed.
2. Dropoff coverage standard defined for Sprint 2 gate.
