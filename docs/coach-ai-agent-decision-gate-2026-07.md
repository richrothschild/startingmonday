# Coach AI Agent Decision Gate (No-Build Until Validation)

Status: Active gate
Owner: Growth + Product
Date opened: 2026-07-06

## Decision rule

Do not build a dedicated accountability-coach AI agent until 2-3 additional coach validation calls are completed and scored.

## Validation questions for each call

1. What weekly accountability work is currently manual and repetitive?
2. Which parts require human judgment versus structured automation?
3. What would make you trust or reject an AI-driven accountability assistant?
4. What proof of value would justify paying for this capability?
5. What is the highest-risk failure mode if this assistant gives poor guidance?

## Pass/fail scoring (per call)

Use a 0-2 score per dimension.

- Problem severity:
  - 0 = nice to have
  - 1 = real but occasional pain
  - 2 = weekly high-friction pain
- Willingness to adopt:
  - 0 = likely no
  - 1 = maybe in pilot
  - 2 = yes if narrow scope
- Willingness to pay:
  - 0 = none
  - 1 = bundled only
  - 2 = clear paid value
- Risk tolerance:
  - 0 = too risky
  - 1 = limited trust
  - 2 = trust with guardrails

Maximum per call: 8

## Build threshold

Proceed to scoped prototype only if:

1. At least 2 of 3 calls score >= 6/8
2. No call reports a critical trust blocker that is unresolved
3. A narrow first job-to-be-done is consistent across calls

If threshold is not met, keep coach workflow human-led and revisit after additional channel evidence.

## Proposed first scope (only if threshold passes)

- Weekly accountability summary draft
- Missed follow-up risk flagging
- Suggested next 3 coach prompts

Exclude autonomous decision-making, client messaging automation, and irreversible actions.

## Call log template

| Date | Coach | Segment | Score (0-8) | Top pain point | Trust blocker | Suggested first JTBD | Decision note |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |

## Current decision

Pending validation. Build is explicitly blocked by this gate.
