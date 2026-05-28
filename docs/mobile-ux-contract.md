# Mobile UX Contract

Updated: 2026-05-28
Owner: Product + Engineering

## Purpose

Prevent mobile UX regressions before they reach production. This contract is enforced by static checks, visual regression checks, and production threshold monitoring.

## Non-negotiable rules

1. No helper blocks above primary page content.
2. No Quick navigation labels on customer-facing pages.
3. No TL;DR utility sections on customer-facing pages.
4. No manual line breaks in high-visibility headlines when they create one-word orphan lines on mobile.
5. Long hero and CTA copy must use text-wrap controls.
6. Primary tap targets must remain at least 44px high.
7. Mobile pages must not introduce horizontal overflow.

## Banned patterns (hard fail)

- Quick navigation
- TL;DR
- Use the sections below to move from fit check to proof, then choose your next step.
- Use section headers below to jump to the part most relevant to your current search decision.
- Clear in 20 seconds

## Enforcement

1. Local and CI contract checks: npm run mobile:contract
2. Local and CI banned pattern checks: npm run mobile:banned-patterns
3. Mobile route smoke checks: npm run test:e2e:mobile-routes
4. Mobile visual regression snapshots: npm run test:e2e:mobile-visual
5. Lighthouse budget gate: npm run perf:lighthouse:ci
6. Production threshold monitoring: npm run monitor:mobile

## Release gate

A change is release-ready only if all checks above pass in CI and post-deploy monitoring remains green.

## Ownership

- Product owner defines copy and spacing acceptance criteria.
- Engineering owner maintains automated gates and thresholds.
- Weekly audit owner reviews trendline and incidents.
