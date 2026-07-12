# Experience Remediation Work Breakdown Structure

Date: 2026-07-12
Source baseline: docs/status/experience-report-executive-summary-and-wbs-2026-07-12.md

## Legend

- Severity: P0 critical, P1 high, P2 medium, P3 low
- Impact domains: Conversion, Trust, Reliability, Editorial Quality, Governance

## WBS-01 Funnel Performance Stabilization

- Severity: P0
- Why it matters: /signup vitals breaches are direct conversion blockers.
- Evidence: Experience Vitals report on /signup LCP/TTFB/FCP breaches.
- Work items:
1. Profile server and edge response path for /signup and reduce backend latency.
2. Defer non-critical client bundles and third-party scripts on /signup.
3. Optimize above-the-fold render path and critical CSS/font loading.
4. Add route-specific synthetic budget gate for /signup in CI.
- Deliverable: /signup meets funnel CWV thresholds for 7 consecutive runs.
- Owner: Performance Platform + Funnel Engineering.

## WBS-02 Journey CTA Reliability Hardening

- Severity: P0
- Why it matters: Core CTA failures break onboarding and demo acquisition paths.
- Evidence: Journey Synthetic failures for Get started and run demo interactions.
- Work items:
1. Add stable test ids to homepage and demo primary CTAs.
2. Normalize CTA visibility and scroll/viewport behavior for synthetic selectors.
3. Add fallback selector strategy and explicit readiness waits in journey agent.
4. Add daily canary run with screenshot evidence on CTA failure.
- Deliverable: Journey synthetic passes all samples for homepage and demo for 7 days.
- Owner: Growth Frontend + QA Automation.

## WBS-03 Sentinel Design Debt Burn-Down

- Severity: P1
- Why it matters: Large palette/accent variance erodes luxury brand consistency and trust.
- Evidence: 79 palette violations and 57 accent warnings in sentinel output.
- Work items:
1. Prioritize top route clusters by incident volume and business tier.
2. Migrate light-shell and accent-heavy pages to approved design tokens.
3. Add route-cluster owner assignment and sprint-level debt burn target.
4. Keep debt-ratchet ceilings and only lower after stable runs.
- Deliverable: 50% reduction in palette violations and 40% reduction in accent warnings in 2 sprints.
- Owner: Design Systems + Feature Teams.

## WBS-04 Experience Workflow Stability Program

- Severity: P1
- Why it matters: Failing/missing workflows reduce confidence in all downstream reports.
- Evidence: Experience daily/weekly/monthly show repeated failures and missing executions.
- Work items:
1. Restore Trust Escalation and Journey workflow cadence visibility in Actions history.
2. Identify top recurring failure signatures in Sentinel, Vitals, and Portfolio Rollup workflows.
3. Implement retry-safe steps and explicit dependency checks before agent execution.
4. Add weekly reliability score for experience workflows with owner escalation.
- Deliverable: <10% weekly issue rate across experience workflow set.
- Owner: Reliability Engineering.

## WBS-05 Trust Operations Consistency

- Severity: P1
- Why it matters: Passing trust snapshots with failing trust operations create governance blind spots.
- Evidence: Trust Daily shows failed workflow health while trust contracts pass in snapshot.
- Work items:
1. Reconcile trust-integrity workflow failure causes with report pass criteria.
2. Add health-to-evidence consistency check in trust-daily report generation.
3. Ensure trust escalation workflow runs and publishes artifact each expected interval.
4. Define alerting split between contract failure and pipeline failure.
- Deliverable: Trust pipeline health and trust contract status remain consistent for 14 days.
- Owner: Trust Intel + Reliability Engineering.

## WBS-06 Cognitive Friction Remediation on Dashboard

- Severity: P2
- Why it matters: Dashboard load/fluency misses lower usability and product adoption.
- Evidence: Cognitive Load dashboard tier misses load and fluency gate targets.
- Work items:
1. Reduce paragraph density and improve heading/chunking on flagged dashboard routes.
2. Add progressive disclosure for dense informational blocks.
3. Re-audit selected routes from calibration dispatch list after copy/layout changes.
4. Track per-route fluency score improvements against A- target.
- Deliverable: Dashboard load and fluency gate pass across two consecutive runs.
- Owner: Product Design + Dashboard Team.

## WBS-07 Calibration Quality Tightening

- Severity: P2
- Why it matters: Deterministic-auditor disagreements can distort prioritization.
- Evidence: Calibration loop shows one major disagreement and low overlap sample size.
- Work items:
1. Increase overlap set between deterministic and auditor route sample.
2. Add classification notes for disagreement root-cause categories.
3. Tune score adjustments only when disagreement repeats across quarters.
4. Publish quarterly calibration memo with accepted threshold updates.
- Deliverable: Exact agreement >=70% and no distance-2 disagreements for 2 quarters.
- Owner: Experience Intelligence.

## WBS-08 Missing Guardrails Implementation

- Severity: P2
- Why it matters: Missing ownership automation and preflight checks increase regression recurrence.
- Evidence: Missing guardrails listed in daily trust and experience reports.
- Work items:
1. Implement owner mapping automation for recurring trust and experience signatures.
2. Add ratchet reviews after sustained healthy windows.
3. Introduce staging parity preflight for trust contracts before promotion.
4. Add contract-specific SLOs and rolling error budget tracking.
- Deliverable: Guardrail checklist complete and enforced in CI and scheduled workflows.
- Owner: Reliability + Platform Governance.

## Suggested Implementation Sequence

1. WBS-01 and WBS-02 in parallel.
2. WBS-04 and WBS-05 immediately after to stabilize reporting backbone.
3. WBS-03 as two-sprint debt burn-down.
4. WBS-06 through WBS-08 as quality and governance hardening track.

## Approval Checklist

- Confirm severity and owner assignment per WBS item.
- Confirm target dates and weekly checkpoint cadence.
- Confirm which gates should be hard-fail versus alert-only.
- Confirm rollout order for dashboard versus funnel remediation.
