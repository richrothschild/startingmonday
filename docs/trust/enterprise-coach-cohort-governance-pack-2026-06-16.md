# Enterprise Coach Cohort Governance Pack

Owner: Content Lead
Sprint: ITS-4
Status: active
Canonical URL: /for-coaches/enterprise-governance
Review cadence: quarterly

---

## Purpose

This pack defines the governance framework for enterprise-sponsored coaching cohorts delivered through Starting Monday.

It covers:
1. Metric dictionary (what is measured, how, and when)
2. Intervention thresholds (when to escalate and to whom)
3. Review cadence (who reviews what, how often)
4. Coach and counselor onboarding standards
5. Sponsor reporting structure

Use this document in enterprise procurement discussions and coach onboarding for firm-scale or HR-sponsored programs.

---

## 1. Metric Dictionary

All metrics in Starting Monday cohort programs use the following definitions. No deviation from these definitions is permitted in external reporting without a written addendum.

### 1.1 Activation rate

Definition:
Proportion of enrolled participants who have completed account setup AND logged at least one company in their target pipeline within the first 7 days of program start.

Formula:
activated participants / total enrolled participants

Numerator: participants with completed setup + at least 1 company added
Denominator: all assigned cohort seats

Threshold (pass): ≥ 70%

---

### 1.2 Signal-driven action rate (weekly)

Definition:
Proportion of active participants who logged at least one outreach, follow-up, or pipeline update linked to a platform signal in a given week.

Formula:
participants with ≥1 signal-driven action this week / active participants this week

Threshold (healthy): ≥ 5 avg signal-driven actions per participant per week

---

### 1.3 Session strategy-time ratio

Definition:
Estimated percentage of session time spent on strategic decisions (targeting, narrative, stakeholder approach, offer evaluation) vs. context rebuild and status recap.

Measurement: coach or counselor session note rating; 1–5 scale converted to percentage estimate.

Threshold (healthy): ≥ 65%
Threshold (intervention): < 50% for two consecutive sessions

---

### 1.4 Stall index

Definition:
Count of participants with no meaningful activity (no signal action, no pipeline update, no prep brief review) in the past 7 days.

Threshold (watch): > 10% of active cohort
Threshold (escalate): > 20% of active cohort

---

### 1.5 Prep-brief usage rate

Definition:
Proportion of active participants who reviewed at least one prep brief in the reporting period.

Threshold (healthy): ≥ 60%

---

### 1.6 First-interview rate (day 30)

Definition:
Proportion of participants who had at least one qualifying first conversation with a target company or search firm by day 30 of program start.

Threshold (pass): ≥ 50% at day 30

---

## 2. Intervention Thresholds and Rules

### 2.1 Tier 1 — Self-managed (counselor)

Trigger: single participant with no activity for 3-5 days
Action: counselor sends async nudge or check-in message
Owner: assigned counselor
SLA: same business day

---

### 2.2 Tier 2 — Counselor lead review

Trigger: participant stalled for 7+ days OR narrative drift detected across 3+ session versions
Action: counselor lead reviews session notes and schedules additional session
Owner: counselor lead
SLA: within 2 business days of trigger

---

### 2.3 Tier 3 — Program escalation

Trigger: stall index > 20% of cohort OR counselor variance > 25% in session strategy-time ratio
Action: program lead convenes ops review and adjusts intervention plan
Owner: program lead
SLA: weekly ops review, same week as trigger detection

---

### 2.4 Tier 4 — Sponsor notification

Trigger: day-30 threshold missed (activation rate < 70% OR first-interview rate < 50%)
Action: sponsor receives formal day-30 report with root cause and remediation plan
Owner: program lead + partner success
SLA: within 3 business days of threshold miss

---

## 3. Review Cadence

| Meeting | Cadence | Owner | Attendees | Output |
|---|---|---|---|---|
| Weekly operating review | Weekly | Program lead | Counselor team + ops | Risk list, intervention assignments, next-week plan |
| Counselor quality sync | Bi-weekly | Counselor lead | Counselors | Session quality observations, variance flags |
| Sponsor checkpoint | Monthly | Program lead | Sponsor contact | Monthly report, risk summary, decision gate status |
| Day-30 decision gate | One-time | Program lead | Sponsor + legal | Expand / hold / close decision with evidence |
| Day-60 stabilization | One-time | Program lead | Sponsor | Mid-cycle health review |
| Day-90 closeout | One-time | Program lead | Sponsor + procurement | Closeout evidence, renewal criteria |

---

## 4. Coach and Counselor Onboarding Standards

All coaches and counselors delivering in Starting Monday enterprise cohorts must complete the following before first participant session:

1. Platform orientation (30 minutes): account setup, permission model, session note structure
2. Metric calibration: review metric dictionary and confirm session strategy-time rating method
3. Narrative quality check: review at least one approved narrative framework before first coaching session
4. Intervention threshold review: confirm tier 1-4 escalation rules and SLAs
5. Claims discipline review: confirm familiarity with the public claims policy

Certification: counselor lead signs off that each counselor has completed all five steps before cohort launch.

---

## 5. Sponsor Reporting Structure

### 5.1 What is reported

Public (shared with sponsor):
- Activation rate
- Signal-driven action rate (cohort average)
- Stall index (count, no names)
- Prep brief usage rate
- First-interview rate at day 30
- Counselor qualitative observations (no individual participant names)
- Risk summary with mitigation plan

Not reported to sponsor without participant consent:
- Individual participant names linked to performance data
- Specific company targets or conversation content
- Session notes or coaching content

---

### 5.2 Claims discipline in reporting

All sponsor-facing reports must follow the three board-safe rules:

1. Report observed cohort outcomes and disclose measurement window.
2. Do not claim guaranteed placement outcomes from pilot directional metrics.
3. Distinguish partner-observed outcomes from external benchmarks.

---

## 6. Artifact Ownership and Refresh Cadence

| Artifact | Owner | Refresh |
|---|---|---|
| Metric dictionary | Program analytics owner | Monthly or on governance change |
| Operating scorecard template | Program lead | Quarterly |
| Weekly review packet | Program lead | Quarterly |
| Trust and controls summary | Partner success + security | Quarterly |
| Counselor onboarding checklist | Counselor lead | On cohort start |
| Sponsor monthly report | Program lead | Monthly |
| Day-30 decision memo | Program lead | Per cohort |

---

## Related Documents

- docs/trust/claims-taxonomy-2026-06-16.md
- docs/trust/artifact-ownership-register-2026-06-16.md
- public/downloads/outplacement-pilot-operator-pack.md
- public/downloads/outplacement-pilot-runbook.md
- src/app/for-outplacement/trust-pack/page.tsx
- src/app/for-chro/page.tsx
