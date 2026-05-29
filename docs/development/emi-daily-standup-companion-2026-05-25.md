# EMI Daily Standup Companion

Week of: 2026-05-25
Primary source: docs/development/emi-now-lane-one-week-pull-plan-2026-05-25.md
Use: single-page daily standup sheet for owner updates.

Reusable template:

1. docs/development/emi-daily-standup-companion-template.md

## How to Use Daily

1. Update the Today field before standup.
2. Update Blocked By only with active dependency blockers.
3. Mark Done Definition only when all stated acceptance points are met.

## Owner Standup Sheet

| Owner | Today | Blocked By | Done Definition |
| --- | --- | --- | --- |
| Data Engineering | DEV-EMI-401 validation blockers and DEV-EMI-402 run-log automation support | None on Day 1; then blocked only if rule enforcement tests fail | DEV-EMI-401 merged with denominator or timeframe or confidence blockers and validation tests passing |
| Engineering plus Data | DEV-EMI-103 event schema lock and funnel instrumentation | Event naming and schema alignment decisions | DEV-EMI-103 emits start, step, complete, and CTA events with persona segmentation |
| Legal plus Web | DEV-EMI-003 trust center implementation | Legal approval on policy wording | Trust center section published with claims policy and KPI definitions |
| Engineering | DEV-EMI-402 pipeline run-log automation | DEV-EMI-401 completion | Automated run-log writes freshness and quality results per run |
| Data plus Legal Ops | DEV-EMI-408 compliance audit job | DEV-EMI-401 completion | Scheduled audit flags non-compliant tier-1 claims with alert routing |
| Product plus Engineering | DEV-EMI-101 assessment flow implementation | DEV-EMI-103 schema alignment checkpoint | Assessment flow complete with required-field handling and scoring submission |
| Product Design plus Frontend | DEV-EMI-102 segmented results UI | DEV-EMI-101 functional completion | Results page shows score band, persona actions, and onboarding CTA |
| Product plus Frontend | DEV-EMI-201 one-screen daily loop UI | DEV-EMI-101 contract lock | Daily loop supports max-three actions, completion toggles, and reflection prompt |
| Engineering plus SRE | DEV-EMI-204 observability dashboard and alerts | DEV-EMI-103 active event stream | Dashboard panels live with loop load, action trend, recovery funnel, and error views |
| Product plus Backend | DEV-EMI-202 recovery protocol and DEV-EMI-203 optionality mode | DEV-EMI-201 completion | Both flows implemented with tracking and state transitions working end-to-end |
| SRE plus Engineering | DEV-EMI-502 SLO monitoring and alert wiring | DEV-EMI-204 baseline panel stability | Assessment, daily loop, and digest SLOs alert correctly in monitoring stack |

## Daily Checkpoint Rows

| Day | Must Finish | Dependency Gate to Verify | Standup Owner |
| --- | --- | --- | --- |
| Monday | DEV-EMI-401 in progress, DEV-EMI-103 schema locked, DEV-EMI-003 skeleton live | None | Engineering Lead |
| Tuesday | DEV-EMI-401 complete, DEV-EMI-402 and DEV-EMI-408 started, DEV-EMI-101 started | DEV-EMI-401 completed before 402 or 408 | Engineering Lead |
| Wednesday | DEV-EMI-101 near complete, DEV-EMI-102 started, DEV-EMI-201 started, DEV-EMI-204 started | DEV-EMI-101 and DEV-EMI-103 gates both satisfied | Product Lead |
| Thursday | DEV-EMI-402 complete, DEV-EMI-102 complete, DEV-EMI-201 complete, DEV-EMI-202 and 203 started, DEV-EMI-502 started | DEV-EMI-201 gate satisfied before 202 and 203 | Engineering Lead |
| Friday | DEV-EMI-202 complete, DEV-EMI-203 complete, DEV-EMI-204 complete, DEV-EMI-502 complete, DEV-EMI-003 complete | DEV-EMI-204 stable before final 502 close | PMO |

## End-of-Day Rule

1. If blocked, log blocker owner and expected unblock time.
2. If done, link merged PR or deployment evidence in standup notes.
3. If slip occurs, move only direct dependents and keep critical path intact.
