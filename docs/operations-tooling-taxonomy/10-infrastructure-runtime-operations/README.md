# 10 Infrastructure and Runtime Operations

## Deployment and Runtime Surfaces
- railway.toml (web service)
- worker/railway.toml (worker service)
- next.config.ts
- sentry.*.config.ts

## Runtime Health and Preflight
- scripts/production-smoke-check.mjs
- scripts/emi-postdeploy-smoke.mjs
- scripts/run-launch-load-rehearsal.mjs
- scripts/set-railway-vars.mjs

## Deployment and Watchdog Workflows
- .github/workflows/post-deploy.yml
- .github/workflows/deployment-watchdog.yml
- .github/workflows/monitoring-watchdog.yml

## Mobile Runtime Reliability
- scripts/check-mobile-production-thresholds.mjs
- scripts/generate-mobile-route-coverage-report.mjs
- docs/mobile-reliability-plan.md
