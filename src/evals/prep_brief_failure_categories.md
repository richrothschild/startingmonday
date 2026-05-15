# Prep Brief Failure Categories

Status: complete for Sprint 3
Feature: prep_brief
Generated: 2026-05-12
Source: src/evals/prep_brief_golden_set.json (25 fail examples)

## Category Summary

- format_off: 7
- missing_context_not_flagged: 7
- questions_too_generic: 6
- tone_wrong: 6
- factual_error: 6
- competitive_framing_missed: 6
- role_fit_not_established: 6
- company_context_thin: 6

## Category Definitions

- format_off: Required section structure is incomplete or malformed.
- missing_context_not_flagged: Output does not acknowledge missing profile/company context and invents confidence.
- questions_too_generic: Interview questions are generic and not tied to company or candidate specifics.
- tone_wrong: Style is motivational or junior-advice instead of peer-level executive coaching.
- factual_error: Claims contradict known input facts or invent unsupported specifics.
- competitive_framing_missed: Brief ignores competitive field or fails to position candidate against alternatives.
- role_fit_not_established: Win thesis and talking points fail to map candidate evidence to role-specific needs.
- company_context_thin: Company situation section lacks concrete business context and specific signals.

## Axial Coding Notes

- Structural quality (format_off + missing_context_not_flagged) is the largest combined failure theme.
- Specificity quality (questions_too_generic + company_context_thin + role_fit_not_established) remains the second cluster.
- Executive-grade polish (tone_wrong + competitive_framing_missed + factual_error) is the third cluster.

## Next Optimization Targets

1. Reduce structural failures by enforcing section-presence checks in generation instructions.
2. Reduce genericity by requiring at least two company-specific facts and three tailored questions.
3. Strengthen competitive framing when company notes include a candidate field.
