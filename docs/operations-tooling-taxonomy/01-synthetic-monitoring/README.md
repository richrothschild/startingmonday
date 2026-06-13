# 01 Synthetic Monitoring

## Core Workflows
- .github/workflows/production-synthetics.yml
- .github/workflows/monitoring.yml
- .github/workflows/production-generated-monitoring.yml
- .github/workflows/monitoring-watchdog.yml

## Core Tests
- tests/e2e/synthetics.spec.ts
- tests/e2e/site-monitoring.spec.ts
- tests/e2e/smoke.spec.ts
- tests/e2e/slo.spec.ts
- tests/e2e/generated/page-routes.generated.spec.ts
- tests/e2e/generated/action-contracts.generated.spec.ts

## Generation and Coverage Control
- scripts/generate-monitoring-matrix.mjs
- scripts/check-monitoring-coverage.mjs
- scripts/generate-monitoring-harness.mjs
- config/monitoring-coverage.overrides.json

## Runtime Scripts
- scripts/production-smoke-check.mjs
- scripts/check-mobile-production-thresholds.mjs
- scripts/check-site-monitoring-readiness.mjs
- scripts/slo-report.mjs

## Supporting Documentation
- docs/status/monitoring-coverage-matrix.latest.md
- docs/status/monitoring-coverage-matrix.latest.json
- docs/site-monitoring-dashboard.md
- docs/site-monitoring-runbook.md
- docs/sre/synthetic-coverage-rollout-plan-2026-06-09.md
