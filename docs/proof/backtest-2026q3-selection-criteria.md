# Backtest Exhibit 2026-Q3 — Pre-Registered Selection Criteria

Status: PRE-REGISTERED. Committed before any query against Starting Monday signal data.
Purpose: fix the case-selection rules for the retro-backtest proof exhibit so results
cannot be accused of cherry-picking or hindsight bias.
Amendment policy: any change to these criteria after the case list is drawn must be
recorded in the Amendments section below with date and reason. No post-hoc exclusions.

## Population

- Executive hires (VP-level and above, or C-suite) publicly announced or first posted
  between 2025-07-01 and 2026-06-30.
- US-based companies with more than 500 employees or more than $100M estimated revenue.
- The hire must be publicly verifiable via at least one of: press release, SEC filing
  (8-K / DEF 14A), archived job posting, or company announcement.

## Sector mix (fixed before selection)

- At least 8 of 20 cases: healthcare / hospital systems (coach-channel relevance).
- Remaining cases: technology and industrial, matching current signal-source coverage.

## Selection method

1. Build the candidate pool from independent third-party sources only
   (press-release aggregators, industry hire roundups, SEC filings) —
   NOT from Starting Monday's watched-company or signal tables.
2. Order the pool chronologically by announcement date; select every Nth case to
   reach 20, preserving the sector quotas above.
3. Only after the 20-case list is committed to this repository may the backtest
   harness be run against those companies.

## Exclusions (applied at selection time, never after)

- Companies watched by any current Starting Monday user during the window
  (contamination risk).
- Hires resulting directly from an acquisition or merger (ambiguous causality).
- Pure internal promotions with no evidence of an external search.

## Controls

- For each selected company: 2 matched controls (same sector, same size band,
  no qualifying leadership hire in the window), reconstructed via the
  backtest harness (migration 159; Wayback + GDELT sources).

## Metrics recorded per case

- Signals present in the window T-180 days to T-0 (announcement/posting date).
- Earliest qualifying signal date and signal type.
- Lead time (days) from earliest signal to posting/announcement.
- The band rating the system would have assigned at T-30 and T-90.

## Reporting rules

- Misses are listed before hits in every rendering of the exhibit.
- Headline metric: hit rate vs. matched-control baseline (not absolute rate).
- Secondary metric: median lead time in days.
- Methodology footnote links to /method-and-evidence.
- Once the case list is drawn, no case may be removed for any reason.

## Amendments

(none)
