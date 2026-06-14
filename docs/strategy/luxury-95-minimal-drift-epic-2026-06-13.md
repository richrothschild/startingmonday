# Epic: Luxury 95 With Minimal Drift

Date: 2026-06-13
Owner: Product + Design + Engineering + QA
Status: In progress (Sprint A)

## Objective

Raise the site from current provisional luxury score (79/100) to as close to 95/100 as possible while minimizing disruption to proven conversion, trust, and runtime behavior.

## Constraints

1. No broad information architecture rewrites.
2. No changes to core CTA labels or primary funnel destinations unless data proves uplift.
3. Preserve existing trust and source-note governance patterns.
4. Keep Tier 1 protected routes no-drift compliant.

## Baseline Measurements (Before)

Reference artifact: `docs/strategy/luxury-95-drift-score-baseline-2026-06-13.json`

- Drift score baseline: 92.0/100
- Largest drift signal: mobile visual smoke mismatch on homepage snapshots (resolved 2026-06-13; baselines refreshed)
- Reliability and governance checks: passing

## Drift Scoring Model

Weighted composite (0-100):

- 35% UX rubric coverage pass rate (`npm run ux:rubric:pages -- --json`)
- 20% Mobile visual smoke pass rate (`npm run test:e2e:mobile-visual:smoke`)
- 20% Production mobile threshold pass rate (`MONITOR_BASE_URL=https://startingmonday.app node scripts/check-mobile-production-thresholds.mjs --json`)
- 15% Trust/proof governance gate (`npm run marketing:trust-proof:gate`)
- 10% Lighthouse budget-config gate (`npm run perf:lighthouse:budget:config`)

## Success Criteria

1. Luxury score target: 92+ minimum, 95 stretch.
2. Drift score after work: >= baseline drift score, with no regression on Tier 1 route contracts.
3. Mobile visual smoke: 5/5 pass.
4. No failures in trust/proof, UX rubric, or lighthouse budget config checks.

## Execution Plan (Low-Disruption)

### Sprint A: Consistency and Flag Hygiene

1. Ensure phase-3 premium flag behavior is consistent between staging and production routes where intended.
2. Remove visual incoherence between legacy-light and premium-dark surfaces on key funnel paths.
3. Keep copy and CTA hierarchy unchanged.

Exit criteria:
- No route-level CTA/copy drift from current approved variants.
- Visual smoke delta improves on homepage.

### Sprint B: Premium Polish Without Structural Drift

1. Tighten typography rhythm (heading/body spacing and contrast tuning) on top funnel surfaces.
2. Harmonize component surface depth (border, blur, shadow, and card contrast) across homepage, pricing, method/evidence, and concierge.
3. Improve above-fold visual coherence on mobile first, desktop second.

Exit criteria:
- Mobile visual smoke and elite visual checks pass.
- No UX rubric contract regression.

### Sprint C: Proof and Trust Clarity

1. Keep proof/source notes visible at decision moments without adding narrative clutter.
2. Improve quantitative proof readability and consistency formatting.
3. Validate trust copy placement in all primary conversion routes.

Exit criteria:
- Trust/proof gate passes cleanly.
- No increase in conversion friction indicators.

### Sprint D: Final Calibration and Score Pass

1. Re-run full quality stack and produce post-work drift score artifact.
2. Re-score luxury benchmark on staging and production.
3. Publish short closeout with exact score deltas and residual risks.

Exit criteria:
- Drift score after artifact published.
- Luxury scorecard updated with final number and rationale.

## Required Checks During This Epic

Run on every PR touching protected marketing routes:

1. `npm run ux:rubric:pages`
2. `npm run marketing:trust-proof:gate`
3. `npm run perf:lighthouse:budget:config`
4. `npm run test:e2e:mobile-visual:smoke`

Run before final closeout:

1. `npm run test:e2e:mobile-elite-visual`
2. `npm run mobile:elite:gate`
3. `npm run perf:lighthouse:ci`
4. `npm run audit:performance:gate`
5. `MONITOR_BASE_URL=https://startingmonday.app node scripts/check-mobile-production-thresholds.mjs --json`
6. `MONITOR_BASE_URL=https://startingmonday.app node scripts/production-smoke-check.mjs --json`

## Risks

1. Over-polish can create unintended visual diff churn on mobile snapshots.
2. Flag inconsistency can produce route-level style mismatch that reduces perceived quality.
3. Additional motion or effects can degrade performance if unbounded.

## Mitigations

1. Keep polish changes local and token-driven.
2. Use route-by-route visual verification before merging.
3. Enforce regression gates before every push to protected branches.

## After-Measurement Requirement

After this epic work is complete, generate:

- `docs/strategy/luxury-95-drift-score-after-2026-06-13.json`

using the same weighted model and the same check commands used in baseline.
