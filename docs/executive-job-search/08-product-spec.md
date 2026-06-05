# Executive Job Search Product Spec v1

Updated: 2026-05-31

## Product Goal

Help executive candidates understand, navigate, and complete a job transition by turning role-specific behavior patterns into diagnosis, guidance, and measurable next actions.

## Why This Exists

Executive job search is not one search behavior. It is a set of role-dependent behaviors that change across:

- role segment
- transition type
- search stage
- confidence and emotional state
- stakeholder environment
- market context

The product should not simply recommend jobs. It should explain what the candidate is doing, what is likely to derail them, and what action best advances the transition.

## Product Principles

1. Role over title
- Two CEOs do not search the same way.
- A CFO, CHRO, and CTO can share the same stage but have different decision logic.

2. Stage matters
- A candidate in identity reset needs different support than one deciding between offers.

3. Transition type matters
- Forced exits, pivots, and re-entry after a break need different diagnostic language than voluntary growth moves.

4. Context matters
- Family, geography, timing, and board / stakeholder pressure can dominate rational fit.

5. Evidence tier matters
- Tier A/B evidence can drive default product behavior.
- Tier C evidence can inspire experiments but should not be treated as proven.

## Product Jobs To Be Done

1. Explain the candidate’s current search state.
2. Classify the candidate into a role segment and transition type.
3. Identify the most likely behavioral derailers.
4. Recommend the next best intervention.
5. Track whether the candidate is improving over time.

## Core Entities

### Candidate Profile

Fields:
- candidateId
- currentRole
- targetRole
- roleSegment
- transitionType
- searchStage
- confidenceTier
- searchMode
- geographyConstraint
- familyConstraint
- boardVisibility
- networkStrength
- urgencyLevel
- lastActivityAt

### Role Segment

One of:
- CEO / President
- COO / GM / BU leader
- CFO
- CHRO / HR leader
- CIO / CTO / Technology leader
- CMO / CRO / Commercial leader
- PR / Communications / Fundraising leader

### Transition Type

One of:
- voluntary growth move
- forced exit
- industry pivot
- functional pivot
- geography pivot
- re-entry after break

### Behavior Domain

One of:
- opportunity sensing
- positioning and narrative
- outreach and network activation
- interview preparation and performance
- decision and evaluation
- regulation and resilience
- role-transition adaptation

### Derailer Type

One of:
- avoidance
- perfection loop
- signaling error
- network under-activation
- decision paralysis
- context blindness
- stakeholder mismanagement
- transition exhaustion

### Intervention

A suggested action with:
- trigger
- hypothesis
- recommended prompt / action
- expected mechanism
- success metric
- confidence tier

## User Flow

### 1. Intake

Collect role, transition type, current stage, and constraints.

### 2. Diagnosis

Map the candidate to a segment-stage-state combination.

### 3. Interpretation

Compare current behavior against the role-stage matrix and derailer taxonomy.

### 4. Recommendation

Return the most relevant intervention plus a concrete next step.

### 5. Progress Tracking

Measure cadence, outreach, revision behavior, decision lag, and recovery after setbacks.

## Data Model Sketch

### behavior_profile

- id
- candidate_id
- role_segment
- transition_type
- stage
- primary_domain
- derailer_type
- confidence_tier
- evidence_sources
- created_at
- updated_at

### behavior_event

- id
- candidate_id
- event_type
- event_source
- event_payload
- observed_at

### intervention_recommendation

- id
- candidate_id
- intervention_key
- trigger
- hypothesis
- recommendation_text
- confidence_tier
- status
- created_at

### scoring_snapshot

- id
- candidate_id
- total_score
- segment_fit_score
- narrative_score
- activation_score
- decision_score
- resilience_score
- board_or_stakeholder_score
- notes
- created_at

## Product Output Modes

1. Diagnostic summary
- what kind of search this is
- what stage they are in
- what is most likely to derail them

2. Recommended action
- one intervention
- one next step
- one metric to watch

3. Coaching mode
- stage-specific guidance
- prompts and scripts
- reminders and accountability loops

4. Decision support mode
- compare opportunities using the 4Cs and role-specific criteria

## Success Criteria

The product is useful if it can:
- classify candidates consistently
- predict likely derailers early
- recommend interventions that users find relevant
- improve candidate momentum and decision quality
- improve transition outcomes over time

## Product Constraints

- No user telemetry yet, so defaults must stay hypothesis-driven.
- Do not overfit to CEO behavior; other executive segments need first-class support.
- Do not use synthetic council outputs as proof.
- Every key claim should carry a confidence tier.
