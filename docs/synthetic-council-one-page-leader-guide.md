# Synthetic Council One-Page Leader Guide

Purpose: make higher-quality decisions faster by combining structured multi-lens review with explicit decision gates.

## What Leaders Get

- Fewer avoidable failures before launch.
- Clear go/no-go decisions with accountable owners.
- Consistent review quality across teams and domains.

## Operating Model (60-Second Version)

1. Define the decision clearly.
- What is being decided?
- What is at risk if wrong?
- What evidence exists today?

2. Run a synthetic council.
- 5-9 non-overlapping roles (outcome, risk, delivery, evidence, stakeholder impact).
- Each role must return at least one required change.

3. Score with a weighted rubric.
- Evaluate category scores and overall score.
- Apply severity labels: critical, high, medium, low.

4. Apply gates.
- Any critical finding: hold.
- High risk/correctness finding: fix before launch.
- Below threshold score: remediate and re-run.

5. Decide and verify.
- Approve, approve-with-conditions, hold, or reject.
- Re-run after fixes with updated evidence.

## When to Require Full Council Review

Use full review if any of these are true:
- High-impact stakeholder surface.
- Expensive or hard-to-reverse decision.
- Security, compliance, legal, or safety implications.
- New architecture/process/vendor dependency.
- Reputation or trust risk.

Use lightweight review only if:
- Low-risk, reversible, isolated change.
- No sensitive surfaces touched.

## Non-Negotiable Governance Rules

- No gate overrides due to schedule pressure.
- No decision without explicit evidence package.
- No closure without named owners and due windows.
- No trust in score trend without outcome trend validation.

## Tie-Break Policy (When Council Roles Disagree)

Prioritize in this order:
1. safety and correctness risk
2. impact magnitude
3. reversibility and blast radius
4. effort-to-risk reduction ratio
5. strategic alignment

## Leadership Cadence

- Per major decision: council review before go/no-go.
- Weekly: fast review for high-change areas.
- Monthly: score trend vs incident/outcome trend.
- Quarterly: recalibrate rubric categories, weights, and thresholds.

## Minimum Artifacts to Keep

- Decision artifact reference
- Rubric version used
- Category and overall scores
- Findings with severity
- Required changes with owners and due dates
- Final decision and rationale
- Re-run result after remediation

## Leader Prompt: Create a Council + Rubric

```text
Build a synthetic council and rubric for this decision domain.

Domain: [INSERT]
Decision class: [INSERT]
Risk profile: [LOW/MEDIUM/HIGH + WHY]
Stakeholders: [INSERT]
Constraints: [INSERT]
Recent failures/incidents: [INSERT 5-20]

Return:
1) One-sentence council charter
2) 5-9 non-overlapping role contracts
3) Weighted rubric with score bands (0-100)
4) Severity model (critical/high/medium/low)
5) Decision gates and hold conditions
6) Tie-break policy
7) Weekly/monthly/quarterly calibration cadence
```

## Leader Prompt: Run a Go/No-Go Council Review

```text
Evaluate this artifact using the provided council and rubric.

Council: [PASTE]
Rubric + gates: [PASTE]
Artifact: [PASTE]
Evidence package: [PASTE]
Context and constraints: [PASTE]

Return exactly:
1) Verdict: approve / approve-with-conditions / hold / reject
2) Overall + category scores
3) Top required changes (3-7) with severity
4) Owner recommendation and due window for each change
5) Triggered hold conditions
6) Evidence required for re-run clearance
```

## Maturity Target

- Minimum for critical decisions: Governed.
- Definition of Governed: hard gates, explicit severity policy, owner accountability, and mandatory re-run after remediation.
