# Segmentation Schema v1

Updated: 2026-05-31

This schema is designed to be directly implementable in Starting Monday.

## Required Fields

### roleSegment
Executive function cluster.

Values:
- CEO_PRESIDENT
- COO_GM_BU
- CFO
- CHRO_HR
- CIO_CTO_TECH
- CMO_CRO_COMMERCIAL
- PR_COMMS_FUNDRAISING

### transitionType
Primary transition context.

Values:
- VOLUNTARY_GROWTH
- FORCED_EXIT
- INDUSTRY_PIVOT
- FUNCTIONAL_PIVOT
- GEOGRAPHY_PIVOT
- REENTRY_AFTER_BREAK

### searchStage
Current point in the transition.

Values:
- IDENTITY_RESET
- TARGET_SELECTION
- NARRATIVE_DEVELOPMENT
- MARKET_ACTIVATION
- PROCESS_NAVIGATION
- OFFER_DECISION
- FIRST_90_DAY_SETUP

### searchMode
Current posture.

Values:
- PASSIVE
- SEMI_ACTIVE
- ACTIVE
- IN_PROCESS
- DECIDING
- TRANSITIONING_IN

### confidenceTier
Evidence confidence for the current behavioral classification.

Values:
- TIER_A
- TIER_B
- TIER_C

## Context Fields

### boardVisibility
How much board-level or equivalent governance scrutiny the candidate faces.

Values:
- LOW
- MEDIUM
- HIGH
- CRITICAL

### networkStrength
How much warm-network access appears available for this search.

Values:
- WEAK
- MODERATE
- STRONG
- SPONSOR_DENSE

### urgencyLevel
How quickly a move needs to happen.

Values:
- LOW
- MEDIUM
- HIGH
- IMMEDIATE

### geographyConstraint
How constrained the search is by location.

Values:
- NONE
- PREFERRED_REGION
- LIMITED_REGIONS
- SINGLE_REGION
- RELOCATION_BLOCKED

### familyConstraint
How much family or caregiving context affects the search.

Values:
- NONE
- LOW
- MEDIUM
- HIGH
- CRITICAL

### currentSignalQuality
How clear the candidate’s current story is in the market.

Values:
- WEAK
- FAIR
- GOOD
- STRONG

## Derived Fields

### dominantBehaviorDomain
Which behavior family is currently most active.

Values:
- OPPORTUNITY_SENSING
- POSITIONING_AND_NARRATIVE
- OUTREACH_AND_NETWORK_ACTIVATION
- INTERVIEW_PREPARATION_AND_PERFORMANCE
- DECISION_AND_EVALUATION
- REGULATION_AND_RESILIENCE
- ROLE_TRANSITION_ADAPTATION

### dominantDerailer
Most likely derailment pattern.

Values:
- AVOIDANCE
- PERFECTION_LOOP
- SIGNALING_ERROR
- NETWORK_UNDER_ACTIVATION
- DECISION_PARALYSIS
- CONTEXT_BLINDNESS
- STAKEHOLDER_MISMANAGEMENT
- TRANSITION_EXHAUSTION

### recommendedInterventionKey
Reference key from the intervention library.

Examples:
- ROLE_REFRAMING_SPRINT
- FOUR_CS_DECISION_WORKSHEET
- NETWORK_ACTIVATION_BURST
- REJECTION_RECOVERY_PROTOCOL
- PROOF_POINT_COMPRESSION
- BOARD_SPONSOR_MAP
- TIMING_AND_CONTEXT_CHECK
- FIRST_90_DAY_DESIGN
- SEARCH_RHYTHM_CONTRACT
- CHANNEL_MIX_REVIEW

## Classification Rules

1. Prefer the candidate’s own stated target role and context.
2. If role is unclear, infer from recent experience and the target company type.
3. If transition type is unclear, infer from stated constraints and recent job history.
4. If confidence is low, return a Tier C classification rather than forcing certainty.
5. If board visibility is high and the role is CEO-like, activate board/stakeholder logic by default.

## Example Classification

```json
{
  "roleSegment": "CEO_PRESIDENT",
  "transitionType": "FORCED_EXIT",
  "searchStage": "MARKET_ACTIVATION",
  "searchMode": "ACTIVE",
  "confidenceTier": "TIER_A",
  "boardVisibility": "CRITICAL",
  "networkStrength": "STRONG",
  "urgencyLevel": "HIGH",
  "geographyConstraint": "NONE",
  "familyConstraint": "LOW",
  "currentSignalQuality": "FAIR",
  "dominantBehaviorDomain": "OUTREACH_AND_NETWORK_ACTIVATION",
  "dominantDerailer": "AVOIDANCE",
  "recommendedInterventionKey": "NETWORK_ACTIVATION_BURST"
}
```
