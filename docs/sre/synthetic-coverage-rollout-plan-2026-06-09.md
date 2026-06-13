# Synthetic Coverage Rollout Plan (2026-06-09)

## Objective
Build a complete, maintainable synthetic monitoring system that covers:
1. Every page route with shell and health assertions.
2. Every critical user action with success and failure contracts.
3. Production synthetic schedules with alerting, artifacts, and SLO reporting.

This plan is designed for the current repository shape:
- Page routes: 200+ files under src/app/**/page.tsx.
- API routes/actions: 250+ files under src/app/api/**/route.ts.
- Existing baselines: tests/e2e/site-monitoring.spec.ts, tests/e2e/synthetics.spec.ts, production-synthetics.yml, monitoring.yml.

## Current Baseline (Already in Repo)
- Playwright configuration and artifacts in playwright.config.ts.
- Public/auth page monitoring checks in tests/e2e/site-monitoring.spec.ts.
- Deep synthetic lifecycle checks in tests/e2e/synthetics.spec.ts.
- Production smoke and mobile checks in .github/workflows/monitoring.yml.
- High-frequency production synthetics in .github/workflows/production-synthetics.yml.
- Readiness gate in scripts/check-site-monitoring-readiness.mjs.

## Workstream 1: Route and Action Coverage Matrix

### Deliverables
1. A generated route inventory with owner, auth level, tier, and expected shell assertion.
2. A generated action inventory with page, action type, endpoint or server action, and monitoring criticality.
3. A strict coverage checker that fails CI when coverage falls below thresholds.

### Implementation
1. Add inventory generator script in scripts folder:
- Scan src/app/**/page.tsx for routes.
- Scan src/app/api/**/route.ts for API actions.
- Output canonical matrix JSON in docs/status folder.

2. Add manual override file in config folder:
- Allow route ownership overrides.
- Allow known dynamic-route examples.
- Allow exclusion list for non-user-facing pages.

3. Add matrix reporter:
- Output markdown summary with columns:
  route, auth class, tier, owner, primary action, test coverage state, production synthetic state.

4. Add npm scripts:
- monitor:matrix:generate
- monitor:matrix:check

5. Add CI gate (main and staging):
- Require matrix generation and no uncovered Tier-0/Tier-1 routes.

### Coverage Classes
- Tier-0: auth, billing, onboarding, outreach send, key dashboard flows.
- Tier-1: high-frequency product pages and role-critical actions.
- Tier-2: supporting pages and lower-risk interactions.
- Tier-3: content/marketing pages with shell and link checks only.

## Workstream 2: Generated Playwright Harness for Pages and Actions

### Deliverables
1. Generated page harness spec for all routes.
2. Generated action harness spec for all critical actions.
3. Reusable assertion library with common shell, error, and latency checks.
4. Action selector contract that enforces stable test hooks.

### Implementation
1. Add generator script in scripts folder:
- Read matrix JSON.
- Generate tests/e2e/generated/page-routes.generated.spec.ts.
- Generate tests/e2e/generated/action-contracts.generated.spec.ts.

2. Add reusable helpers in tests/e2e:
- auth bootstrap helper.
- route health helper.
- action outcome helper.
- optional failure-mode helper.

3. Add selector contract policy:
- Tier-0 and Tier-1 interactive elements must expose stable data-testid.
- Build checker script to verify required selectors exist.

4. Add Playwright projects and test tags:
- monitor-p0: fastest, blocking, every PR/main/staging.
- monitor-p1: broader authenticated journeys, hourly or per deploy.
- monitor-p2: full route sweep, nightly.

5. Keep generated specs deterministic:
- Checked in to repo.
- Regenerated in CI and compared to avoid drift.

### Action Coverage Rules
- Every Tier-0 action must have:
  success assertion,
  explicit empty/error-state assertion,
  latency budget assertion,
  artifact capture on failure.

- Every Tier-1 action must have:
  success assertion,
  one failure-path assertion.

## Workstream 3: Production Synthetic Schedule, Alerts, and Artifacts

### Deliverables
1. Multi-cadence synthetic schedule with severity-aware alerting.
2. Standardized artifact bundles for every run.
3. Slack alert routing by severity with runbook links.
4. SLO report wiring from synthetic outcomes.

### Target Schedule
1. Every 5 minutes:
- Tier-0 canary synthetic set (auth, dashboard, outreach send contract, billing portal reachability).
- Sev-1 alert on first failure.

2. Every 30 minutes:
- Existing smoke and mobile reliability workflow.
- Sev-2 alert on sustained failure (2 consecutive runs).

3. Hourly:
- Tier-1 authenticated journeys and top conversion/public routes.
- Sev-2 alert with impacted route/action list.

4. Nightly:
- Full generated sweep (Tier-0 to Tier-3).
- Advisory digest to Slack with top regressions and trends.

### Artifact Standard
For every production synthetic run:
1. Summary JSON.
2. Per-test JSON result.
3. Playwright HTML report.
4. Trace/screenshot/video bundle for failures.
5. Route/action coverage snapshot for drift detection.

### Alert Policy
- Sev-1: Tier-0 regression or auth/billing/outreach critical failure.
- Sev-2: Tier-1 regression lasting 2 runs.
- Sev-3: Tier-2 and Tier-3 failures, included in digest.

### Existing Workflows to Extend
- .github/workflows/production-synthetics.yml.
- .github/workflows/monitoring.yml.
- .github/workflows/ci.yml.

## Rollout Phases

### Phase 1 (2-3 days)
1. Build route/action matrix generator.
2. Add matrix check gate in CI as non-blocking advisory.
3. Publish first matrix snapshot in docs/status.

### Phase 2 (3-4 days)
1. Generate page harness for all routes.
2. Enforce shell/health assertions for all routes.
3. Make Tier-0 route coverage blocking.

### Phase 3 (3-4 days)
1. Generate action harness for Tier-0 and Tier-1 actions.
2. Add selector contract checker and missing selector backlog.
3. Make Tier-0 action coverage blocking.

### Phase 4 (2-3 days)
1. Expand production schedules to hourly full Tier-1.
2. Normalize artifacts and alert formatting.
3. Wire SLO and weekly trend reporting.

## Definition of Done
1. 100% Tier-0 routes and actions have generated synthetic coverage.
2. 95%+ Tier-1 routes and actions have generated synthetic coverage.
3. Every production synthetic run publishes artifact bundle and summary.
4. Alert runbooks and ownership mapping are complete for Tier-0 and Tier-1.
5. CI fails when matrix or generated harness drifts from source route/action inventory.

## Immediate First PR Sequence
1. PR-1: matrix generator + config overrides + monitor:matrix scripts.
2. PR-2: generated page harness + helper library + CI advisory check.
3. PR-3: generated action harness for Tier-0 + selector contract checker.
4. PR-4: production workflow expansion (hourly Tier-1) + artifact normalization.
5. PR-5: CI blocking gates for Tier-0 and Tier-1 coverage thresholds.
