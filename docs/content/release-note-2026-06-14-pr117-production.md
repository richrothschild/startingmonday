# Release Note - PR #117 Production Deployment

Date: 2026-06-14
Release type: Production deployment
Owner: Engineering

## Summary

PR #117 is now deployed to production.

Primary outcome:
- Stabilized PR event base URL handling in CI and reduced churn from environment-targeting drift.

## Included Links

- Pull request: https://github.com/richrothschild/startingmonday/pull/117
- Deployment fix commit (Auth UX guard determinism patch): https://github.com/richrothschild/startingmonday/commit/430efabd

## Highlights

1. Hardened Playwright PR base URL behavior for PR events.
2. Added changed-files-driven Playwright PR matrix behavior.
3. Shipped deterministic Auth UX guard update by masking optional Turnstile render variance in signup screenshot assertions.

## Post-Deploy Checks

1. Monitor production errors and auth funnel behavior for 24 hours.
2. Confirm CI signal remains stable on subsequent PRs.
3. Keep release notes and deployment evidence linked in future PR descriptions.
