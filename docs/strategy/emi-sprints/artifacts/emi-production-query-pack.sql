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
-- Canonical source: emi_kpi_snapshots
SELECT
  CURRENT_TIMESTAMP AS executed_at,
  'proof_assets_published_count' AS metric,
  (
    SELECT s.metric_value
    FROM emi_kpi_snapshots s
    WHERE s.metric_name = 'proof_assets_published_count'
      AND s.week_end >= CURRENT_DATE - INTERVAL '90 days'
      AND s.metric_status = 'ok'
    ORDER BY s.week_end DESC, s.generated_at DESC
    LIMIT 1
  ) AS metric_value;

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
-- Canonical source: emi_kpi_snapshots
SELECT
  CURRENT_TIMESTAMP AS executed_at,
  'tier1_claim_compliance_percent' AS metric,
  (
    SELECT s.metric_value
    FROM emi_kpi_snapshots s
    WHERE s.metric_name = 'tier1_claim_compliance_percent'
      AND s.week_end >= CURRENT_DATE - INTERVAL '90 days'
      AND s.metric_status = 'ok'
    ORDER BY s.week_end DESC, s.generated_at DESC
    LIMIT 1
  ) AS metric_value;
