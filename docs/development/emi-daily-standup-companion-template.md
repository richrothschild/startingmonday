# EMI Daily Standup Companion Template

## Monday Setup Checklist

1. Rename file to `emi-daily-standup-companion-YYYY-MM-DD.md`.
2. Set `Week of:` value for the current week.
3. Assign standup owner for the week in this file.
4. Paste the current one-week pull-plan path in `Primary source:`.

Week of:
Standup owner:
Primary source: docs/development/emi-now-lane-one-week-pull-plan-YYYY-MM-DD.md
Use: single-page daily standup sheet for owner updates.

## Monday First 5 Minutes

1. Confirm standup owner and backup owner.
2. Fill Monday row in Daily Checkpoint Rows.
3. Pre-fill `Today` column for each owner from the pull plan.
4. Mark any known blockers before first standup starts.

## How to Use Daily

1. Duplicate this file each Monday and rename using that week date.
2. Update the Today field before standup.
3. Update Blocked By only with active dependency blockers.
4. Mark Done Definition only when all stated acceptance points are met.

## Owner Standup Sheet

| Owner | Today | Blocked By | Done Definition |
| --- | --- | --- | --- |
| Data Engineering |  |  | DEV-EMI-401 merged with denominator or timeframe or confidence blockers and validation tests passing |
| Engineering plus Data |  |  | DEV-EMI-103 emits start, step, complete, and CTA events with persona segmentation |
| Legal plus Web |  |  | Trust center section published with claims policy and KPI definitions |
| Engineering |  |  | Automated run-log writes freshness and quality results per run |
| Data plus Legal Ops |  |  | Scheduled audit flags non-compliant tier-1 claims with alert routing |
| Product plus Engineering |  |  | Assessment flow complete with required-field handling and scoring submission |
| Product Design plus Frontend |  |  | Results page shows score band, persona actions, and onboarding CTA |
| Product plus Frontend |  |  | Daily loop supports max-three actions, completion toggles, and reflection prompt |
| Engineering plus SRE |  |  | Dashboard panels live with loop load, action trend, recovery funnel, and error views |
| Product plus Backend |  |  | Both flows implemented with tracking and state transitions working end-to-end |
| SRE plus Engineering |  |  | Assessment, daily loop, and digest SLOs alert correctly in monitoring stack |

## Daily Checkpoint Rows

| Day | Must Finish | Dependency Gate to Verify | Standup Owner |
| --- | --- | --- | --- |
| Monday |  |  |  |
| Tuesday |  |  |  |
| Wednesday |  |  |  |
| Thursday |  |  |  |
| Friday |  |  |  |

## End-of-Day Rule

1. If blocked, log blocker owner and expected unblock time.
2. If done, link merged PR or deployment evidence in standup notes.
3. If slip occurs, move only direct dependents and keep critical path intact.
