# Backtest Exhibit 2026-Q3 Case Draw Log

Date: 2026-07-06
Reference criteria: docs/proof/backtest-2026q3-selection-criteria.md

## Summary

- Candidate pool source: Google News RSS queries covering healthcare, technology, industrial executive appointment announcements.
- Window enforced: 2025-07-01 through 2026-06-30.
- Pool size after role-title filtering and deduplication: 132.
- Selection method: chronological order with deterministic every-Nth sampling inside each sector quota bucket.
- Final selected cases: 20.
- Sector quota achieved: healthcare 8, technology 6, industrial 6.

## Outputs

- Case list CSV: docs/proof/backtest-2026q3-case-list.csv
- Harness input JSON: docs/proof/backtest-2026q3-harness-input.json
- Raw candidate pool CSV: tmp/backtest_candidate_pool_2026q3.csv
- Generation script: tmp/build_backtest_case_draw.ps1

## Integrity Notes

- This draw was generated after the pre-registration commit b1199bee, preserving anti-cherry-picking sequencing.
- Case rows include source URLs for independent verification.
- Size and exclusion criteria are flagged as pending manual check in the case list and must be finalized before publishing external proof collateral.

## Next Harness Action

- Resolve each case title to canonical company identifiers.
- Validate exclusion rules (watched contamination, M&A-derived appointments, internal-promotion-only rows).
- Run cohort/control build and backtest replay using migration 159 pathways.
