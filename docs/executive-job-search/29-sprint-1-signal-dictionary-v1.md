# Sprint 1 Deliverable: Signal Dictionary v1

Date: 2026-05-31
Owner: Analytics Engineering
Status: Draft for instrumentation

## Objective

Define canonical signals used by the emotion-state scoring service.

## Standards

1. All event names use snake_case.
2. All timestamps are ISO-8601 UTC.
3. User identifier key: user_id.
4. Session identifier key: session_id.

## Core Signals

| Signal Key | Source Event | Definition | Window | Type | Null Handling |
|---|---|---|---|---|---|
| cadence_adherence_pct | weekly_cadence_summary | completed planned actions / planned actions | 7d | numeric 0-100 | set null if planned actions = 0 |
| followup_sla_miss_rate | followup_sla_summary | missed follow-up items over total due items | 7d | numeric 0-1 | set 0 if total due = 0 |
| rejection_streak_count | rejection_event | consecutive rejection events without recovery start | rolling | integer | default 0 |
| target_list_churn_rate | target_list_updated | added + removed targets over active target count | 14d | numeric 0-1+ | null if active target count = 0 |
| outreach_volume | outreach_sent | count of outreach messages sent | 7d | integer | default 0 |
| outreach_specificity_score | outreach_scored | quality score from composer rubric | 7d mean | numeric 0-100 | null until first scored message |
| sponsor_map_depth | sponsor_map_updated | weighted sponsor graph depth score | 14d | numeric | null until sponsor map exists |
| recovery_started_48h | rejection_recovery_started | indicator recovery started within 48h after rejection | per rejection | boolean | false if no event |
| debrief_completion_rate | interview_debrief_submitted | completed debriefs / interviews completed | 14d | numeric 0-1 | null if no interviews |
| decision_lag_days | offer_stage_entered + final_decision_submitted | days elapsed between offer stage entry and decision | offer cycle | numeric | null until decision |
| context_completion_rate | offer_context_saved | completed required context fields / total required | offer cycle | numeric 0-1 | null if not in offer stage |
| no_go_criteria_present | no_go_criteria_saved | binary presence of explicit no-go criteria | offer cycle | boolean | false if absent |

## Derived Features

1. momentum_quality_index
- Formula draft: 0.4 cadence_adherence_pct_norm + 0.3 outreach_specificity_score_norm + 0.3 (1 - followup_sla_miss_rate)

2. strain_index
- Formula draft: rejection_streak_count_norm + target_list_churn_rate_norm + (1 - debrief_completion_rate_norm)

3. decision_load_index
- Formula draft: decision_lag_days_norm + (1 - context_completion_rate) + no_go_missing_penalty

## Required Event Contracts

### weekly_cadence_summary

Required fields:

1. user_id
2. session_id
3. planned_action_count
4. completed_action_count
5. period_start
6. period_end

### outreach_scored

Required fields:

1. user_id
2. message_id
3. specificity_score
4. segment
5. scored_at

### rejection_event

Required fields:

1. user_id
2. event_id
3. stage
4. occurred_at

### rejection_recovery_started

Required fields:

1. user_id
2. rejection_event_id
3. started_at

### offer_context_saved

Required fields:

1. user_id
2. offer_id
3. required_fields_total
4. required_fields_completed
5. saved_at

## Data Quality Checks

1. Null-rate alert if any core signal exceeds 15% null in pilot cohort.
2. Outlier alert if numeric z-score exceeds 4 for >2% of records.
3. Event lateness alert when ingestion delay exceeds 15 minutes p95.

## Sprint 1 Exit Criteria

1. All core signals available in event pipeline.
2. Data quality dashboard shows healthy ingestion for pilot cohort.
3. Derived feature outputs pass validation against sample fixtures.
