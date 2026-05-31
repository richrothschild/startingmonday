# Sprint 1 Deliverable: Scoring API Implementation Plan

Date: 2026-05-31
Owner: Backend Engineering
Status: Ready for build

## Objective

Implement a feature-flagged scoring API that returns operational emotional state, confidence, and safe-routing metadata.

## API Contract (Draft)

Endpoint:

1. POST /api/v1/transition/emotion-state/score

Request body:

1. user_id (string, required)
2. stage (string, required)
3. archetype (string, optional)
4. confidence_tier (string, optional)
5. signal_window (object, optional)

Response body:

1. state (enum): stable_momentum, activation_friction, threat_drift, exhaustion_risk, decision_overload, rebound_recovery
2. confidence (number 0-1)
3. confidence_band (enum): high, medium, low
4. top_signal_drivers (array of strings)
5. recommended_intervention_mode (enum): optimize, stabilize, recover, decide
6. fallback_applied (boolean)
7. evaluated_at (timestamp)

Error behavior:

1. 400 for schema validation errors.
2. 404 when user scope is invalid.
3. 503 when scoring dependency is unavailable.

## Routing Safety Rules

1. Low confidence must not trigger escalation interventions.
2. Missing required signals must set fallback_applied=true.
3. Offer-stage requests without context signals default to decision_overload only when stage is offer.

## Feature Flag Plan

1. Flag key: emotion_state_scoring_v1
2. Rollout phases:
- Phase 1: internal only (5%)
- Phase 2: pilot cohort (25%)
- Phase 3: expanded pilot (50%)
3. Kill switch required in runtime config.

## Implementation Tasks

1. Build request/response schema validation.
2. Implement signal fetch adapter from analytics store.
3. Implement scoring logic and confidence-band mapping.
4. Add fallback logic and deterministic state selection.
5. Add structured logging for state, confidence band, fallback usage.
6. Add feature-flag gate and cohort targeting.
7. Add integration tests with fixture signal sets.

## Test Cases (Minimum)

1. High-cadence/high-quality fixture returns stable_momentum with high band.
2. Low-action/high-churn fixture returns activation_friction.
3. Rejection-streak/no-recovery fixture returns exhaustion_risk or threat_drift based on rules.
4. Offer-stage/high-lag fixture returns decision_overload.
5. Missing-signal fixture returns fallback_applied=true and low confidence.

## Sprint 1 Acceptance Criteria

1. API returns a non-null state for >=95% of pilot requests.
2. p95 latency <= 300 ms for pilot traffic.
3. Fallback path is triggered correctly in all missing-signal test fixtures.
4. Logs are queryable by state and confidence_band.

## Handoff to Sprint 2

1. Publish state and confidence contract for routing engine integration.
2. Deliver fixture pack to QA for stage-appropriateness tests.
3. Provide pilot cohort baseline report.
