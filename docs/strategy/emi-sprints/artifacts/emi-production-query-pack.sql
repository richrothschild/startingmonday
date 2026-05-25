-- EMI production query pack
-- Created: 2026-05-25
-- Updated: 2026-05-25
-- Purpose: Validate KPI snapshots from currently available production tables only.

-- Q1: EMI language adoption percent
-- Primary source: weekly_kpi_summary_runs.summary_payload
SELECT
  CURRENT_TIMESTAMP AS executed_at,
  'emi_language_adoption_percent' AS metric,
  MAX((summary_payload ->> 'emi_language_adoption_percent')::numeric) AS metric_value
FROM weekly_kpi_summary_runs
WHERE week_end >= CURRENT_DATE - INTERVAL '90 days';

-- Q2: Assessment completion percent
-- Source: onboarding_qa_weekly_scorecards (started_users -> completed_users)
SELECT
  CURRENT_TIMESTAMP AS executed_at,
  'assessment_completion_percent' AS metric,
  ROUND(100.0 * SUM(completed_users) / NULLIF(SUM(started_users), 0), 2) AS metric_value
FROM onboarding_qa_weekly_scorecards
WHERE week_start >= CURRENT_DATE - INTERVAL '60 days';

-- Q3: Day-7 return percent for activated cohort
-- Source: user_events
WITH activated AS (
  SELECT user_id, MIN(created_at) AS activated_at
  FROM user_events
  WHERE event_name = 'emi_onboarding_started'
  GROUP BY user_id
),
returned AS (
  SELECT a.user_id
  FROM activated a
  JOIN user_events e ON e.user_id = a.user_id
  WHERE e.created_at >= a.activated_at + INTERVAL '1 day'
    AND e.created_at <= a.activated_at + INTERVAL '7 days'
  GROUP BY a.user_id
)
SELECT
  CURRENT_TIMESTAMP AS executed_at,
  'day7_return_percent' AS metric,
  ROUND(100.0 * COUNT(r.user_id) / NULLIF(COUNT(a.user_id), 0), 2) AS metric_value
FROM activated a
LEFT JOIN returned r ON r.user_id = a.user_id;

-- Q4: Proof assets published count
-- Primary source: weekly_kpi_summary_runs.summary_payload
-- Fallback: count of posted social proof assets in social_posts
SELECT
  CURRENT_TIMESTAMP AS executed_at,
  'proof_assets_published_count' AS metric,
  COALESCE(
    MAX((summary_payload ->> 'proof_assets_published_count')::numeric),
    (
      SELECT COUNT(*)::numeric
      FROM social_posts
      WHERE is_posted = TRUE
        AND posted_at >= CURRENT_DATE - INTERVAL '90 days'
    )
  ) AS metric_value
FROM weekly_kpi_summary_runs
WHERE week_end >= CURRENT_DATE - INTERVAL '90 days';

-- Q5: B2B pilot conversion percent
-- Mapping on b2b_prospects.stage:
-- denominator = proposal_sent, negotiating, closed_won, closed_lost
-- numerator = closed_won
SELECT
  CURRENT_TIMESTAMP AS executed_at,
  'b2b_pilot_conversion_percent' AS metric,
  ROUND(
    100.0 * SUM(CASE WHEN stage = 'closed_won' THEN 1 ELSE 0 END)
    / NULLIF(SUM(CASE WHEN stage IN ('proposal_sent','negotiating','closed_won','closed_lost') THEN 1 ELSE 0 END), 0),
    2
  ) AS metric_value
FROM b2b_prospects
WHERE archived_at IS NULL
  AND created_at >= CURRENT_DATE - INTERVAL '90 days';

-- Q6: Tier-1 claim compliance percent
-- Source: company_signals completeness fields as current production equivalent
SELECT
  CURRENT_TIMESTAMP AS executed_at,
  'tier1_claim_compliance_percent' AS metric,
  ROUND(
    100.0 * SUM(
      CASE
        WHEN source_url IS NOT NULL
         AND confidence IS NOT NULL
         AND evidence_snippets IS NOT NULL
        THEN 1
        ELSE 0
      END
    )
    / NULLIF(COUNT(*), 0),
    2
  ) AS metric_value
FROM company_signals
WHERE signal_date >= CURRENT_DATE - INTERVAL '90 days';
