# Luxury-Modern Tone and Proof Governance Guide

Date: 2026-06-13

## Voice Standard

1. Executive and calm: short declarative lines, low hype, precise claims.
2. Evidence-aware: never present directional data as audited fact.
3. Decision-useful: every section should help a buyer decide next action.

## Required Trust Elements

1. Include at least one trust marker on every marketing surface:
- Privacy commitment
- Confidentiality statement
- Governance process clarity

2. If a form collects sensitive context, explicitly state who reviews it and how it is used.

## Required Proof Elements

1. Include at least one proof marker on every primary marketing surface:
- Source note
- Method note
- Measured KPI definition

2. Numeric claims must include denominator/timeframe context or be labeled directional.

## Copy Constraints

1. Avoid absolute guarantees.
2. Avoid unverifiable superlatives.
3. Keep claim language tied to observable product behavior.

## PR Enforcement

1. Use `.github/pull_request_template.md` trust/proof checklist for marketing changes.
2. Run `npm run marketing:trust-proof:gate` before merge.
3. Ensure lighthouse budget config remains valid using `npm run perf:lighthouse:budget:config`.
