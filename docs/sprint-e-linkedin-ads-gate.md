# Sprint E LinkedIn Ads Gate

Date: 2026-05-12
Owner: Rich

## Why this exists

Sprint E requires LinkedIn paid ads setup only if trial-to-paid conversion is at least 35 percent.
This gate prevents paid spend before conversion economics are healthy.

## Command

Run from project root:

`npm run sprint5:ads-gate`

Optional:

- `npm run sprint5:ads-gate:json`
- `npm run sprint5:ads-gate:strict` (exits non-zero when gate is not met)

## Decision rule

- GO if conversion rate >= 35 percent.
- DEFER if conversion rate < 35 percent or if there are no ended trials yet.

## Metric definition

- Ended trials: users with non-null `trial_ends_at` and `trial_ends_at` earlier than now.
- Converted trials: ended trials where `subscription_status` is `active`.
- Conversion rate: converted / ended * 100.

This matches the admin dashboard trial conversion logic to avoid conflicting definitions.

## If GO

- Set up LinkedIn ads account and campaign scaffolding.
- Use Sprint E creative concepts:
  - "We scanned 500 career pages this week..."
  - "Start monitoring your companies before the search goes public."
- Test budget: $500 targeting CIO/CTO/VP IT with "open to work" signal.

## If DEFER

- Continue improving landing/demo conversion and onboarding activation.
- Re-check gate weekly until threshold is met.
