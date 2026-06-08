# No-Drift Protected Route Matrix

Date: 2026-06-07
Owner: Product + Design + Engineering
Status: Active policy

## Purpose
Prevent UI drift while shipping fast by enforcing route-level style and structure contracts through automated gates.

## Protected Route Tiers

Tier 1: Brand and conversion-critical
- /
- /pricing
- /signup
- /dashboard
- /dashboard/discover
- /dashboard/discover/recommendation/[id]
- /dashboard/admin/intelligence

Tier 2: High-traffic support and trust
- /demo
- /blog
- /blog/how-we-estimate-early-role-signals
- /method-and-evidence

## No-Drift Contract
For protected routes, changes must preserve:
1. Core shell and spacing rhythm
- Header/nav composition
- Primary content container width and grid behavior
- CTA placement and hierarchy

2. Typography and design language
- Existing font scale and weight hierarchy
- Existing color token usage
- Existing button and chip semantics

3. Conversion scaffolding
- Primary CTA labels and placement
- Trust blocks and proof modules
- Required comparison and pricing context

4. Mobile behavior
- No horizontal overflow
- Minimum 44px tappable controls (56px for bottom nav tabs)
- Stable bottom safe-area spacing
- No dead zones or large post-content blank gaps

## Enforcement Gates
1. Static rubric gate
- scripts/check-ux-ui-rubric-pages.mjs
- Fails build if protected-route contracts drift

2. Mobile contract gate
- scripts/check-mobile-ui-contract.mjs
- Fails build for mobile interaction/layout contract violations

3. Banned-pattern gate
- scripts/check-mobile-banned-patterns.mjs
- Fails build for known anti-pattern regressions

4. Elite visual regression gate
- tests/e2e/mobile-elite-visual.spec.ts
- scripts/check-mobile-elite-visual-gate.mjs
- Pixel-diff threshold for protected mobile routes

## Approval Policy
Default policy: zero visual or structural drift on Tier 1 routes.

Exception process:
1. Mark PR with "intentional-drift" label.
2. Provide before/after screenshots (mobile + desktop).
3. Include rationale and expected KPI impact.
4. Obtain Product + Design signoff before merge.

## CI Recommendations
Required on every PR:
1. npm run ux:rubric:pages
2. npm run mobile:guard

Required on release branches and pre-production:
1. npm run test:e2e:mobile-elite-visual
2. npm run test:e2e:mobile-routes

## Mobile Elite Standard
A protected route is considered elite on mobile only if:
1. It passes all contract and banned-pattern checks.
2. It passes visual regression against approved baselines.
3. It meets production threshold checks (speed/readability/stability) with no severe regressions.
4. It maintains scannability and tap-confidence across iPhone and Android form factors.
