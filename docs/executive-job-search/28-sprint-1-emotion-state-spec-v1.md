# Sprint 1 Deliverable: Emotion-State Specification v1

Date: 2026-05-31
Owner: Product + Research
Status: Draft for review

## Objective

Define operational emotional risk states for executive transition, including thresholds, stage relevance, and routing constraints.

## Design Principles

1. Operational, not clinical.
2. Observable from behavior and workflow signals.
3. Explainable for coaching and product QA.
4. Safe defaults when confidence is low.

## State Model

State set:

1. Stable Momentum
2. Activation Friction
3. Threat Drift
4. Exhaustion Risk
5. Decision Overload
6. Rebound Recovery

## State Definitions and Threshold Draft

### 1) Stable Momentum

- Definition: user is executing planned motion with acceptable quality and cadence.
- Typical stage: target design through interview flow.
- Trigger pattern:
1. Cadence adherence >= 80%.
2. Follow-up SLA miss rate < 20%.
3. No rejection streak threshold breach.
- Routing policy: maintain current plan, provide optimization prompts only.

### 2) Activation Friction

- Definition: early-stage activation stalls or oscillates.
- Typical stage: trigger and narrative rewrite.
- Trigger pattern:
1. Weekly actions below baseline target for 2 consecutive windows.
2. Target list churn above threshold without outreach completion.
3. Draft-edit loops exceed publish threshold.
- Routing policy: micro-commitment plan and anti-perfection intervention.

### 3) Threat Drift

- Definition: social and reputational threat signals reduce outreach quality.
- Typical stage: outreach and market activation.
- Trigger pattern:
1. Outreach send volume drops after rejection event.
2. Message specificity score declines for 2+ sequences.
3. Sponsor-map expansion stalls.
- Routing policy: safe-script support and sponsor-map prompts.

### 4) Exhaustion Risk

- Definition: sustained effort with degrading quality and delayed recovery.
- Typical stage: prolonged active search.
- Trigger pattern:
1. Quality composite falls while action volume stays flat or rises.
2. Rejection recovery not initiated within 48 hours.
3. Reflection and debrief completion below threshold.
- Routing policy: reduce load, enforce recovery workflow, escalate if persistent.

### 5) Decision Overload

- Definition: offer-stage trade-offs create lag or indecision.
- Typical stage: late interviews and offers.
- Trigger pattern:
1. Decision lag exceeds stage benchmark.
2. Context fields incomplete in offer workflow.
3. No-go criteria missing or contradictory.
- Routing policy: launch decision framework and context gating tasks.

### 6) Rebound Recovery

- Definition: user is emerging from setback with improving quality.
- Typical stage: post-rejection or post-pause reactivation.
- Trigger pattern:
1. Recovery workflow initiated and at least one micro-win completed.
2. Message quality and cadence trend upward.
3. Confidence proxy metrics improve versus previous window.
- Routing policy: reinforce consistency and transition back to stable plan.

## Confidence Bands

1. High confidence: >= 0.75 model confidence, route full intervention set.
2. Medium confidence: 0.50 to 0.74, route low-risk intervention subset.
3. Low confidence: < 0.50, show fallback guidance only and prompt for missing inputs.

## Fallback Behavior

If confidence is low or required signals are missing:

1. Assign temporary state: Activation Friction (early stages) or Decision Overload (offer stages), based on current stage only.
2. Suppress escalations and high-intensity interventions.
3. Trigger data quality prompts and request missing artifacts.

## QA Acceptance Checklist

1. Each state maps to at least 3 observable signals.
2. Each state has explicit routing constraints.
3. Confidence band behavior is deterministic.
4. Fallback behavior is stage-safe.

## Review Agenda (60 Minutes)

1. Confirm state names and thresholds.
2. Confirm stage mapping and fallback behavior.
3. Approve QA rubric for Sprint 2 routing validation.
