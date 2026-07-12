# Journey Synthetic Agent Report

Generated: 2026-07-12T15:47:02.690Z
SES Version: 1
Base URL: https://startingmonday.app
Pass: false

## Journey Thresholds (from SES)

### funnel
- Warn threshold (P95): 5500ms
- Critical threshold (P95): 10000ms
- Risk weight: 1.15

## Journey Results by Tier

### funnel
- Journeys measured: 3
- P0 critical steps: 0
- P1 warn steps: 0
- Max step duration: 3209ms
- Weighted risk score: 0.00

## Top Findings

- [P1] /: Homepage → Signup sample 1 failed: locator.scrollIntoViewIfNeeded: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for getByRole('link', { name: /Get started/i }).first()[22m

- [P1] /demo: Demo → Run sample 1 failed: locator.click: Timeout 7000ms exceeded.
Call log:
[2m  - waiting for getByRole('button', { name: /run demo|run search|run/i }).first()[22m


