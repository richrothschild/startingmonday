# UVP Clarity Gate Checklist

Owner: Product / Coaching Workflow
Status: draft
Last reviewed: 2026-07-20
Source of truth: yes

## Purpose

Add a lightweight clarity gate before outreach generation and interview prep so users do not move forward with weak positioning, vague target roles, or a poor company-fit narrative.

This is not a full coaching module. It is a thin readiness check that verifies whether the user can explain what they do, what they want, and why they fit before the platform invests in deeper signal and outreach work.

## Why This Exists

Gina’s feedback confirmed the main product risk: visibility without clear positioning creates misses. The product should help users find timing and opportunities, but it should also catch the cases where they cannot yet explain their value crisply enough to benefit from those opportunities.

## Trigger Point

Run this gate after the search strategy intake is complete and before:

1. Outreach message generation.
2. Interview prep generation.
3. Company-fit recommendations that assume the user is ready to act.

## Required Inputs

The gate should read from the existing intake and profile context:

1. Target roles.
2. Roles to avoid.
3. Target industries.
4. Geography and travel constraints.
5. Positioning summary.
6. Proof points and differentiators, if available.
7. Decision criteria and red flags.
8. Search stage and transition type.

## Checklist

### 1) Role clarity

- Can the user state the target role in one sentence?
- Are stretch roles clearly separated from roles to avoid?
- Is the search stage compatible with the current outreach plan?

### 2) Market clarity

- Are target industries and target companies specific enough to search against?
- Are geography and travel constraints explicit?
- Are compensation guardrails recorded when the user wants them included?

### 3) Positioning clarity

- Can the user explain their unique value proposition in 20-30 seconds?
- Does the positioning summary sound like a person, not a generic profile?
- Are there proof points that support the claim?
- Can the user answer “why me?” without rambling?

### 4) Fit and risk clarity

- Are red flags and non-negotiables explicit?
- Is there a clear view of the company types the user should avoid?
- Does the product warn when the user’s temperament or operating style seems mismatched to the company environment?

### 5) Conversation readiness

- Can the system generate a crisp “Why this role?” and “Why here?” answer?
- Can it generate a short outreach message that matches the positioning?
- Can it identify likely objections before the user starts outreach?

## Pass / Fail Rules

### Pass

The user passes the gate when all of the following are true:

1. Target role and target market are specific.
2. Positioning is understandable in one short speaking turn.
3. The user has enough proof to support the positioning.
4. Red flags or exclusions are defined.
5. The system can generate outreach and prep outputs without obvious contradictions.

### Warn

Warn when the user has a direction but not enough clarity to proceed safely. Typical cases:

1. Target roles are broad or contradictory.
2. Positioning is still generic.
3. The user has not identified enough proof points.
4. The company-fit rules are too vague to guide outreach.

### Block

Block when the user cannot yet describe:

1. What role they are aiming at.
2. Why they are credible for it.
3. What they should avoid.
4. What type of company environment is a bad fit.

## Product Behavior

If the gate fails, the product should do one of the following:

1. Ask 3-5 focused follow-up questions to improve clarity.
2. Surface a coach handoff suggestion when the user needs deeper positioning work.
3. Defer outreach generation until the user resolves the unclear fields.

If the gate passes, the product can proceed to:

1. Outreach generation.
2. Interview prep.
3. Company-fit recommendations.

## Suggested UX Copy

- “You have enough context to search, but the positioning is still too broad to generate strong outreach.”
- “Before we write messages, tighten the role, market, and value proposition.”
- “This looks ready for signal-based search, not ready for full outreach yet.”

## Acceptance Criteria

1. The user gets an explicit pass/warn/block result.
2. The gate uses existing intake data before asking for new information.
3. The gate stays lightweight enough to finish in under 2 minutes.
4. The gate does not replace a coach; it only identifies when a coach handoff is useful.
5. The gate improves the quality of outreach and prep outputs without forcing a long reflection exercise.

## Non-Goals

- This is not a full UVP workshop.
- This is not a replacement for executive coaching.
- This is not a long-form career narrative builder.
- This is not a public lead capture flow.

## Implementation Notes

1. Reuse the search strategy intake fields already captured in `user_profiles.role_context.search_intake`.
2. Keep the scoring thin and explainable.
3. Add a coach-handoff path rather than trying to solve deep positioning in-product.
4. Keep the output specific enough to steer outreach and prep, but not so deep that it turns into a separate coaching product.

## Next Build Step

1. Add a simple scoring function that classifies clarity as pass / warn / block.
2. Insert the gate before outreach and interview prep generation.
3. Show one short explanation and one recommended next action.