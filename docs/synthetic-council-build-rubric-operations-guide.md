# Synthetic Council Build, Rubric, and Operating Guide

Quick options: [Full guide](docs/synthetic-council-build-rubric-operations-guide.md) | [Executive one-pager](docs/synthetic-council-one-page-leader-guide.md)

Purpose: provide a domain-agnostic method to design a synthetic council, create a high-signal rubric, and use both at the right moments in any decision environment.

## Outcomes This Guide Targets

- Better decisions before implementation, not only better postmortems.
- Consistent decision quality across domains, teams, and industries.
- Repeatable reviews that produce clear priorities, owners, and deadlines.

## 1) How to Build a Synthetic Council

### 1.1 Define the Decision Domain First

Do not start with personalities. Start with the decision class.

- Domain examples: product, engineering, operations, legal, policy, hiring, procurement, investments, healthcare, education, public services.
- Decision object: what exactly is being judged (proposal, release candidate, process change, policy draft, campaign, vendor selection).
- Decision horizon: immediate, sprint/quarter, or annual strategy.

Output:
- One-sentence charter: "This council exists to improve decision quality for X decisions over Y horizon."

### 1.2 Select Lenses (Roles), Not Characters

Use 5-9 roles. Fewer than 5 misses blind spots; more than 9 creates noise.

Required role coverage for most domains:
- Outcome lens: objective owner.
- Risk lens: safety, legal, compliance, security, or downside control.
- Delivery lens: feasibility, resources, sequencing.
- Evidence lens: data quality, instrumentation, falsifiability.
- Stakeholder lens: user/customer/employee/public impact.

Optional role coverage:
- Brand or trust lens.
- Revenue/economics lens.
- Platform/operations lens.
- Change-management lens.

Rule:
- Every role must have unique non-overlapping must-protect constraints.

### 1.3 Write Role Contracts

For each role, define:
- Mission: what this role optimizes.
- Non-negotiables: 3-5 hard constraints.
- Failure modes watched: top ways this domain fails.
- Evidence required: what proof this role expects.

Template:
- Role:
- Optimizes for:
- Rejects when:
- Required evidence:
- Blind spot this role catches:

### 1.4 Force Constructive Disagreement

A council adds value only if it can disagree with itself.

Design rules:
- At least 2 roles should naturally create tension (for example, speed vs risk, cost vs quality, growth vs trust).
- Each role must output at least one required change.
- Aggregator step must resolve conflicts through a published tie-break policy.

### 1.5 Define a Standard Output Contract

Every run should return the same structure:
- Score by category and overall.
- Top required changes (3-7 items).
- Severity (critical, high, medium, low).
- Owner and due window for each required change.
- Recommendation: approve, approve-with-conditions, hold, reject.

If outputs vary by run style, the system is not operational yet.

## 2) How to Create an Effective Rubric

### 2.1 Rubric Design Principles

- Observable: each criterion can be measured or demonstrated.
- Actionable: failing a criterion implies a specific fix path.
- Weighted: criteria are not treated as equally important.
- Calibrated: independent reviewers produce similar scores.
- Governed: rubric has versioning and a review cadence.

### 2.2 Build Criteria from Failure Taxonomy

Start from real failures, not ideals.

Steps:
1. Gather 10-20 recent failures in the domain.
2. Cluster by root cause.
3. Convert top clusters into rubric categories.
4. Define pass/fail signals and thresholds per category.

This avoids elegant rubrics that miss actual risk.

### 2.3 Use a Weighted Category Model

A robust baseline pattern:
- correctness or outcome integrity
- risk and safety
- evidence and measurement
- maintainability and scalability
- usability and clarity
- delivery readiness

Weighting guidance:
- Safety-critical contexts: overweight risk and correctness.
- Experiment-heavy contexts: overweight measurement and reversibility.
- Experience-heavy contexts: overweight usability and trust.

### 2.4 Define Severity and Gate Policy

A score alone is insufficient. Add explicit gates.

Example gate policy:
- Any critical finding: automatic hold.
- High finding in risk or correctness: fix before launch.
- Overall below threshold: no launch; remediation required.

This prevents high averages from hiding dangerous specifics.

### 2.5 Add Calibration and Drift Control

Rubrics decay unless maintained.

Calibration loop:
- Weekly: quick rubric runs on recent changes.
- Monthly: compare score trends vs incident/outcome trends.
- Quarterly: update categories, weights, and thresholds.

Drift signals:
- Scores rise while incidents also rise.
- Repeat failures are not represented by criteria.
- Reviewers disagree heavily on the same artifacts.

## 3) How and When to Use the Council

### 3.1 Use at Three Levels

1. Pre-decision
- Use before build/launch.
- Input: proposal, assumptions, expected outcomes.
- Goal: prevent bad bets.

2. Pre-release or pre-implementation gate
- Use when work is complete and ready for go/no-go.
- Input: artifact plus evidence (tests, metrics, traces, QA proof).
- Goal: prevent regressions and unsafe rollout.

3. Post-release learning loop
- Use after rollout to compare expected vs actual outcomes.
- Input: telemetry, incidents, qualitative feedback.
- Goal: improve the rubric and operating policy.

### 3.2 Trigger Conditions for Mandatory Review

Require full council review when any are true:
- High-impact surface for stakeholders.
- Irreversible or expensive-to-rollback change.
- Compliance, security, legal, or safety implications.
- New architecture, process, or partner dependency.
- Reputation or trust risk.

Use a lightweight review when:
- Change is low-risk, reversible, and isolated.
- No new dependencies and no sensitive surface touched.

### 3.3 Execution Protocol Per Run

1. Package evidence
- Decision artifact
- Constraints and assumptions
- Baselines and expected outcomes
- Known risks and alternatives considered

2. Role evaluations
- Each role returns: what works, what fails, required changes, severity.

3. Synthesis
- Deduplicate findings.
- Resolve conflicts through tie-break policy.
- Produce a prioritized remediation queue.

4. Decision
- Approve, approve-with-conditions, hold, or reject.
- Record rationale and owner commitments.

5. Verification
- Re-run after fixes.
- Confirm score and gate conditions are satisfied.

### 3.4 Tie-Break Policy (Consistent and Explicit)

When roles conflict, prioritize by:
1. safety and correctness risk
2. impact magnitude
3. reversibility and blast radius
4. effort to risk-reduction ratio
5. strategic alignment

This keeps decisions principled rather than personality-driven.

## 4) Prompt Instructions

Use these prompt packs with any LLM. Replace bracketed fields before running.

### 4.1 Prompt Pack: Create a Council and Rubric

```text
You are a decision-systems architect. Build a synthetic council and scoring rubric for the following domain.

Domain:
[INSERT DOMAIN]

Decision class:
[INSERT TYPES OF DECISIONS]

Risk profile:
[LOW/MEDIUM/HIGH + WHY]

Stakeholders:
[INSERT STAKEHOLDERS]

Constraints:
[BUDGET, TIME, COMPLIANCE, QUALITY, ETC.]

Recent failure examples:
[INSERT 5-20 FAILURES OR INCIDENTS]

Output requirements:
1) Council charter (1 sentence)
2) 5-9 council roles with non-overlapping role contracts:
   - mission
   - non-negotiables (3-5)
   - failure modes watched
   - required evidence
3) Rubric categories, weights, and score bands (0-100)
4) Severity model (critical/high/medium/low)
5) Decision gates and hold conditions
6) Tie-break policy for conflicting recommendations
7) Weekly/monthly/quarterly calibration cadence
8) First-run checklist for operational rollout

Quality constraints:
- Keep criteria observable and auditable.
- Avoid vague language.
- Ensure role tensions are intentional and constructive.
- Ensure rubric criteria map to the provided failures.
```

### 4.2 Prompt Pack: Run a Council Review

```text
You are the synthetic council review engine. Evaluate the artifact using the council and rubric provided below.

Council definition:
[PASTE COUNCIL ROLES + CONTRACTS]

Rubric:
[PASTE RUBRIC CATEGORIES, WEIGHTS, THRESHOLDS, AND GATE RULES]

Artifact under review:
[PASTE PROPOSAL / SPEC / PR / POLICY / CAMPAIGN / PROCESS]

Evidence package:
[PASTE TEST RESULTS, METRICS, BASELINES, USER FEEDBACK, ETC.]

Context:
[TIMELINE, CONSTRAINTS, DEPENDENCIES, BUSINESS OR MISSION GOAL]

Return exactly this structure:
1) Executive verdict: approve / approve-with-conditions / hold / reject
2) Overall score and category scores
3) Per-role assessment:
   - what works
   - key risks
   - required change(s)
   - severity
4) Consolidated findings:
   - top 3-7 required changes
   - owner recommendation
   - due window
5) Gate check:
   - list every triggered hold condition
6) Re-run criteria:
   - what evidence is required to clear each high/critical finding

Rules:
- Be strict and specific.
- No generic advice.
- If evidence is missing, mark as insufficient evidence and lower confidence.
- Do not override gate policy due to schedule pressure.
```

### 4.3 Prompt Pack: Synthesis After Multiple Role Outputs

Use this when roles are run separately and you need one merged decision.

```text
You are the council synthesis chair. Merge these role assessments into one decision.

Tie-break policy:
[PASTE POLICY]

Role outputs:
[PASTE ALL ROLE OUTPUTS]

Rubric and gates:
[PASTE RUBRIC]

Return:
1) Unified decision and confidence level
2) Conflict map (where roles disagreed and why)
3) Conflict resolution rationale using tie-break policy
4) Prioritized remediation queue with owners and due windows
5) What would change the decision on re-run
```

## 5) Minimum Artifacts to Keep

For each council run, store:
- Input artifact reference
- Rubric version
- Category and overall scores
- Findings with severity
- Required changes with owners and due dates
- Final decision and rationale
- Re-run result after remediation

Without these artifacts, continuous improvement cannot be proven.

## 6) Common Failure Modes and How to Avoid Them

- Failure mode: council theater (discussion without enforcement).
  - Fix: explicit gate policy and hold conditions.

- Failure mode: score inflation.
  - Fix: monthly calibration against incident and outcome data.

- Failure mode: role overlap and repetitive feedback.
  - Fix: tighten role contracts and non-overlap constraints.

- Failure mode: using council too late.
  - Fix: mandatory pre-decision review for major bets.

- Failure mode: optimizing for score instead of outcomes.
  - Fix: track both rubric trend and real-world outcome trend.

## 7) Practical Maturity Model

Level 1: ad hoc
- Informal prompts and inconsistent outputs.

Level 2: structured
- Stable roles, stable rubric, repeatable report format.

Level 3: governed
- Hard gates, severity policy, owner accountability.

Level 4: learning system
- Rubric calibration tied to measurable outcome improvement.

Minimum target for critical decisions: Level 3.

## 8) Starter Checklist

- Define the domain charter.
- Select 5-9 non-overlapping roles.
- Write role contracts.
- Draft weighted rubric from failure taxonomy.
- Define severity and gate policy.
- Run first council review on a live artifact.
- Record findings, owners, and deadlines.
- Re-run after fixes and compare deltas.
- Schedule monthly rubric calibration.
