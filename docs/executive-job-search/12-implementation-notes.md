# Implementation Notes v1

Updated: 2026-05-31

## Recommended First Build

1. Intake form to capture role, transition type, stage, and constraints.
2. Classification engine that maps the candidate to the segmentation schema.
3. Diagnostic summary card with dominant behavior domain and derailer.
4. Intervention recommendation card.
5. Candidate scorecard with rubric dimensions.

## Minimum Data Needed

- target role
- current role
- reason for transition
- urgency
- geography constraints
- family constraints
- board visibility
- network strength
- recent activity summary

## First Product Screens

### Screen 1: Candidate Intake
- structured form
- confidence indicator
- source tagging

### Screen 2: Behavior Diagnosis
- role segment
- transition type
- search stage
- dominant derailer
- confidence tier

### Screen 3: Recommended Action
- top intervention
- why it was chosen
- next step
- success metric

### Screen 4: Candidate Scorecard
- dimension scores
- weighted total
- areas to improve
- follow-up plan

## Default Product Rules

- If signal is weak, return Tier C rather than overconfident labels.
- If the candidate is passive, prioritize company/challenge/context over compensation.
- If the candidate is CEO-like or board-visible, always surface stakeholder mapping.
- If the candidate shows avoidance or exhaustion, favor a small action over a large plan.

## Build Order

1. schema
2. intake
3. diagnosis
4. recommendation
5. scoring
6. tracking
