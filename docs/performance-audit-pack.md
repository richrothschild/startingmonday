# Performance Audit Pack

Owner: Documentation Operations
Status: active
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: yes


Purpose: run a repeatable performance verification flow and produce a regression-only release gate decision.

## One-Command Gate

Run:

1. npm run audit:performance:gate

CI wiring:

1. Workflow: .github/workflows/performance-release-gate.yml
2. Trigger: pull_request to main, push to main, manual dispatch
3. Behavior: job fails automatically when the scorecard verdict is FAIL

This executes:

1. npm run audit:performance:pack
2. npm run audit:performance:scorecard

## What It Produces

- docs/performance-audit/production-smoke.latest.json
- docs/performance-audit/production-mobile.latest.json
- docs/performance-audit/summary.latest.json
- docs/performance-release-scorecard.latest.md
- docs/performance-release-scorecard.latest.json

## Input Policy and Baseline

- Regression policy: config/performance-regression-policy.json
- Baseline metrics: config/performance-baseline.json

## Blocking Semantics

The scorecard blocks release only when configured regressions exceed thresholds.

- Allowed noise does not block release.
- Absolute pass/fail noise is reduced by using percent + fixed-ms buffers.

## Optional Manual Pre-Deploy Lab Check

For local lab-based perf checks (Lighthouse CI), run:

1. npm run perf:lighthouse:ci

This is complementary and should be interpreted with the release scorecard, not in isolation.
