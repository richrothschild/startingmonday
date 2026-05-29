# Technical Debt Deep-Dive (2026-05-24)

## Executive Summary

The synthetic council score is still A+ (100), but deeper engineering health checks show meaningful debt that is currently hidden by threshold calibration and placeholder baseline policy.

Most urgent debt is not stylistic; it is build-integrity debt:

1. Type/lint parser failures in two production API routes (hard blockers).
2. Placeholder test baseline remains high (292 files), creating a quality/reliability gap.
3. Large monolithic UI files increase change risk and review burden.
4. Dependency lag includes several major-version opportunities that may hide security/runtime drift.

## Signals Collected

- `npm run deps:check`: pass
- `npm run lint:check-baseline`: fail due to existing ESLint errors
- `npm run lint -- --max-warnings=0`: fail with 2 errors, 314 warnings
- `npm run typecheck`: fail (13 errors across 2 files)
- `npm outdated --long`: multiple outdated dependencies (including major-version deltas)
- Placeholder baseline count from `docs/placeholder-test-baseline.json`: 292

## P0 - Immediate Blockers

### 1) Broken import blocks in API routes

Automation inserted observability helper inside import declarations, producing parser errors and typecheck failures.

- `src/app/api/admin/social/[id]/council-check/route.ts`
  - import block contains `const __councilObservabilitySignal ...` before named imports complete.
- `src/app/api/briefs/download/route.ts`
  - same import-block corruption pattern.

Impact:

- Blocks `typecheck` and strict lint gates.
- Creates risk that other auto-edited files have latent syntax corruption.

Recommended remediation:

- Restore valid import structure in both files immediately.
- Run focused codemod safety check: detect `const __councilObservabilitySignal` placed between `import {` and closing `} from`.
- Add a pre-commit/parser sanity script for generated edits.

### 2) Lint baseline cannot run while errors exist

`lint:check-baseline` currently fails early due to hard ESLint errors. This blocks meaningful baseline management.

Primary hard errors map to the two parser-failure files above.

## P1 - High Risk / High Leverage Debt

### 1) Placeholder test debt backlog

Baseline is currently 292 placeholder test files.

Impact:

- Council score can remain high while behavior confidence remains incomplete.
- Regression risk remains high in operationally critical modules not yet converted.

Recommended remediation:

- Continue conversion in business-risk order (billing, auth, webhooks, messaging, onboarding workflows).
- Set rolling burn-down target (for example, 292 -> 200 -> 120 -> <50).
- Keep CI policy: no net new placeholders without baseline update + explicit rationale.

### 2) Observatory helper over-insertion and unused variable noise

Large number of warnings indicate injected `__councilObservabilitySignal` is often unused.

Impact:

- Warning noise obscures true regressions.
- Demonstrates that bulk instrumentation strategy needs precision controls.

Recommended remediation:

- Instrument only files with explicit try/catch insertion points.
- Replace local helper insertion with shared structured logger utility where needed.
- Add codemod post-check to reject unused injected symbols.

### 3) React purity/effect anti-pattern warnings in production UI

Examples include setState in effects and impure render-time `Date.now()` usage.

Impact:

- Potential rerender instability/perf churn.
- Hidden behavior drift under concurrent rendering.

Recommended remediation:

- Refactor effect initialization paths to lazy state initialization or derived memo values.
- Move `Date.now()` calculations to memoized/derived state with explicit update cadence.

## P2 - Structural Maintainability Debt

### Largest app/workspace hotspots (non-vendored)

Top large files include:

- `src/lib/supabase/database.types.ts` (1419 lines)
- `src/app/(dashboard)/dashboard/page.tsx` (1326 lines)
- `src/app/onboarding/onboarding-form.tsx` (1293 lines)
- `src/app/(dashboard)/dashboard/admin/traces/trace-client.tsx` (1147 lines)
- `src/app/(dashboard)/dashboard/admin/page.tsx` (1084 lines)
- `src/app/(dashboard)/dashboard/admin/social/social-client.tsx` (1059 lines)
- `src/app/(dashboard)/dashboard/companies/[id]/prep/prep-client.tsx` (1038 lines)

Impact:

- High merge conflict probability.
- Slow review and brittle test targeting.
- Feature velocity constrained by oversized ownership boundaries.

Recommended remediation:

- Split >900-line UI modules by domain sections + data hooks + pure presentational components.
- Require new feature work in hotspots to include extraction deltas.

### TODO/FIXME concentration

TODO markers are generally low in first-party code; highest concentration is in `scripts/code-synthetic-council-audit.mjs`.

Interpretation:

- Debt is less about explicit TODO comments and more about hidden structural/runtime debt.

## P3 - Dependency Modernization Debt

Outdated packages with notable deltas:

- `@anthropic-ai/sdk` 0.91.1 -> 0.98.0
- `eslint` 9.39.4 -> 10.4.0 (major)
- `@types/node` 20.19.41 -> 25.9.1 (major)
- `typescript` 5.9.3 -> 6.0.3 (major)
- `react` 19.2.4 -> 19.2.6
- `react-dom` 19.2.4 -> 19.2.6

Recommended remediation:

- Phase upgrades in this order:
  1. patch/minor runtime dependencies,
  2. tooling minors,
  3. major tooling upgrades in dedicated compatibility branches.
- Gate each phase with full CI + smoke + high-risk API tests.

## Council Blind Spots Identified

Current A+ does not sufficiently capture:

- parser/build integrity failures,
- placeholder vs behavioral test quality distinctions,
- warning noise and instrumentation correctness,
- monolith file-size risk.

Recommendation:

- Add debt-adjusted companion metric to council output:
  - hard blockers count,
  - placeholder baseline count,
  - top-N hotspot file sizes,
  - warning budget trend.

## 7-Day Remediation Plan

1. Fix the two parser-broken API routes and restore green typecheck/lint-error baseline.
2. Add codemod guard against import-block corruption from automated insertions.
3. Convert next 20-40 placeholder tests in highest-risk routes.
4. Start extraction of top 2 hotspot UI modules into smaller component boundaries.
5. Run dependency patch/minor update pass and capture compatibility notes.

## Exit Criteria for “Healthy Debt Posture”

- Typecheck: 0 errors.
- ESLint: 0 errors (warnings allowed but tracked by budget).
- Placeholder baseline: material reduction from 292.
- At least 2 hotspot modules reduced below ~900 lines.
- No automated instrumentation scripts can produce parser-invalid TS files.
