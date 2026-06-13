# 04 Quality Assurance and Code Health

## Testing Surfaces
- Vitest: npm test and focused test scripts in package.json
- Playwright: tests/e2e/*.spec.ts
- Generated monitoring harness: tests/e2e/generated/*.generated.spec.ts

## Static and Policy Checks
- scripts/check-lint-baseline.mjs
- scripts/check-dependency-policy.mjs
- scripts/check-observability-import-guard.mjs
- scripts/check-placeholder-test-regressions.mjs
- scripts/check-ux-ui-rubric-pages.mjs
- scripts/check-mobile-ui-contract.mjs
- scripts/check-mobile-banned-patterns.mjs
- scripts/check-mobile-elite-visual-gate.mjs

## Performance and UX Quality
- scripts/run-performance-audit-pack.mjs
- scripts/generate-performance-release-scorecard.mjs
- scripts/pagespeed-check.mjs
- docs/performance-release-scorecard.latest.md

## Security and Reliability QA
- scripts/security-deep-dive-audit.mjs
- scripts/deep-dive-technical-debt-audit.mjs
- scripts/check-migration-rollback-readiness.mjs
