# SMK-402 Wedge Scorecard Ops Spec

Parent Epic: SMK-381
Related Tickets: SMK-395, SMK-398, SMK-401

## Objective
Provide one deterministic payload for weekly scale/iterate/stop review across:
1. Direct paid sprint motion
2. Partner pilot motion

## Endpoint
- Route: /api/admin/automation/reporting/wedge-funnel-scorecard
- Auth: admin automation access
- Query: lookbackDays (default 30, min 7, max 120)
- Read path: GET returns current scorecard + recent snapshot history
- Write path: POST persists a weekly snapshot row (upsert on week_start)

## Closeout Artifact Endpoint
- Route: /api/admin/automation/reporting/wedge-epic-closeout
- Auth: admin automation access
- Query: lookbackDays (default 30, min 7, max 120)
- Behavior: generates one payload with SMK-395 paid sprint cohort report fields, SMK-398 partner pilot outcomes tracker fields, and SMK-401 decision memo sections (motion 1 + motion 2 only; alumni excluded).
- Economics: payload now includes canonical direct-paid CAC inputs from marketing_spend_entries and canonical partner commercial acceptance from partner_commercial_events, with fallback proxy logic only when canonical rows are missing.

## Canonical Ledgers Endpoint
- Route: /api/admin/automation/reporting/wedge-economics-ledgers
- Auth: admin automation access
- Query: lookbackDays (default 30, min 7, max 120)
- Read path: GET returns recent marketing_spend_entries + partner_commercial_events rows for operations review.
- Write path: POST ingests batched ledger rows for marketing spend and partner commercial events.

## Canonical Economics Ledgers
- Table: public.marketing_spend_entries
- Purpose: canonical direct-paid spend input for CAC and payback computations in closeout reporting.
- Notes: wedge closeout reads motion=direct_paid_sprint rows in the selected lookback window.

- Table: public.partner_commercial_events
- Purpose: canonical partner commercial event source for pilot_fee_collected, expansion_proposal_sent, and expansion_accepted/rejected.
- Notes: wedge closeout prefers these events over fallback proxies derived from partner seats/program status.

## Snapshot Persistence
- Table: public.wedge_funnel_weekly_scorecards
- Key: week_start (unique)
- Stored fields: shortlist funnel counts/rates, partner pilot counts/rates, and decision outputs
- Purpose: trend comparison across weekly council reviews

## Cron Run Logging
- Table: public.wedge_funnel_scorecard_cron_runs
- Scope: one row per cron invocation (success and failure paths)
- Stored fields: trigger/finish times, duration_ms, status code, success flag, error_code, decision summary, snapshot history count, error message, and run payload
- Purpose: auditability and reliability review for scheduled wedge runs

## Operations Drill-down
- Route: /dashboard/admin/operations/wedge-cron
- Filters: status, from date, to date, error code
- Re-run control: link to /dashboard/admin/wedge-funnels where operators can run a fresh wedge snapshot using the Save weekly snapshot action.

## Output Sections
1. shortlist
   - viewed_users
   - cta_click_users
   - checkout_started_users
   - purchased_users
   - delivered_users
   - credit_applied_users
   - cta_click_through_rate
   - checkout_start_rate
   - purchase_rate_from_checkout
   - delivery_completion_rate
   - credit_application_rate
2. pilot
   - partner_accounts_active
   - seat_updates_logged
   - seats_total
   - at_risk_seats
   - seats_active_rate
3. decision
   - motion1_direct_paid_sprint: scale | iterate | stop
   - motion2_partner_pilot: scale | iterate | stop
   - summary: scale | iterate | stop
   - reasons[]

## Decision Rules (v1)
- Motion 1 (paid sprint)
  - Scale: purchase_rate_from_checkout >= 25 and delivery_completion_rate >= 80
  - Stop: purchase_rate_from_checkout < 10 or delivery_completion_rate < 50
  - Else: Iterate
- Motion 2 (partner pilot)
  - Scale: seats_active_rate >= 70 and at_risk_seats <= 1
  - Stop: seats_active_rate < 45
  - Else: Iterate
- Summary
  - Stop if either motion is stop
  - Scale if both motions are scale
  - Else iterate

## Operating Cadence
- Run weekly for council review.
- If summary is stop for two consecutive snapshots, halt expansion and run remediation memo.

## Cron Trigger
- Route: /api/cron/wedge-weekly-scorecard
- Auth: CRON_SECRET via x-cron-secret or bearer/query fallback
- Schedule: `0 14 * * 1` (Monday 14:00 UTC)
- Behavior: persists weekly snapshot through the scorecard POST path, returns readback payload including decision summary and history count, and writes cron execution logs.
- Failure handling: writes a high-severity automation alert (source_table wedge_funnel_scorecard_cron_runs) when persistence/readback/token preconditions fail.
