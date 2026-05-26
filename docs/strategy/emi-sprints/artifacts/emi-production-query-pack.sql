-- EMI production query pack
-- Created: 2026-05-25
-- Updated: 2026-05-25
-- Purpose: Validate KPI snapshots from currently available production tables only.

-- Q1: EMI language adoption percent
-- Canonical source: emi_kpi_snapshots
SELECT
  CURRENT_TIMESTAMP AS executed_at,
  'emi_language_adoption_percent' AS metric,
  (
    SELECT s.metric_value
    FROM emi_kpi_snapshots s
    WHERE s.metric_name = 'emi_language_adoption_percent'
      AND s.week_end >= CURRENT_DATE - INTERVAL '90 days'
      AND s.metric_status = 'ok'
    ORDER BY s.week_end DESC, s.generated_at DESC
    LIMIT 1
  ) AS metric_value;

-- Q2: Assessment completion percent
-- Canonical source: emi_kpi_snapshots
SELECT
  CURRENT_TIMESTAMP AS executed_at,
  'assessment_completion_percent' AS metric,
  (
    SELECT s.metric_value
    FROM emi_kpi_snapshots s
    WHERE s.metric_name = 'assessment_completion_percent'
      AND s.week_end >= CURRENT_DATE - INTERVAL '90 days'
      AND s.metric_status = 'ok'
    ORDER BY s.week_end DESC, s.generated_at DESC
    LIMIT 1
  ) AS metric_value;

-- Q3: Day-7 return percent for activated cohort
-- Canonical source: emi_kpi_snapshots
SELECT
  CURRENT_TIMESTAMP AS executed_at,
  'day7_return_percent' AS metric,
  (
    SELECT s.metric_value
    FROM emi_kpi_snapshots s
    WHERE s.metric_name = 'day7_return_percent'
      AND s.week_end >= CURRENT_DATE - INTERVAL '90 days'
      AND s.metric_status = 'ok'
    ORDER BY s.week_end DESC, s.generated_at DESC
    LIMIT 1
  ) AS metric_value;

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
-- Canonical source: emi_kpi_snapshots
SELECT
  CURRENT_TIMESTAMP AS executed_at,
  'b2b_pilot_conversion_percent' AS metric,
  (
    SELECT s.metric_value
    FROM emi_kpi_snapshots s
    WHERE s.metric_name = 'b2b_pilot_conversion_percent'
      AND s.week_end >= CURRENT_DATE - INTERVAL '90 days'
      AND s.metric_status = 'ok'
    ORDER BY s.week_end DESC, s.generated_at DESC
    LIMIT 1
  ) AS metric_value;

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
