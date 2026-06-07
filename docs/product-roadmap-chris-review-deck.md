# Product Roadmap - Chris Review Deck

Owner: Documentation Operations
Status: active
Last reviewed: 2026-06-07
Review cadence: quarterly
Source of truth: yes


Internal planning document | May 2026

Source inputs:

- docs/product-roadmap-council-vision-compendium.md
- docs/product-roadmap-dalio-duke-synthesis.md
- docs/backlog.md

## Goal

Turn the full council packet into 10 concrete roadmap decisions we can review with Chris, assign owners, and schedule into near-term sprints.

## Decision Filters

Each item below was selected using four filters:

1. High impact on acquisition and/or retention.
2. Practical to execute within current team constraints.
3. Strong fit for Chris ownership (direct or shared).
4. Clear measurable outcome in 2 to 6 weeks.

## Top 10 Actionable Decisions

| # | Decision | Why this matters now | Primary owner | Supporting owner(s) | Sprint placement | Success metric |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Ship six-actions activation tracker and prompts | Direct lever on trial-to-paid conversion and early retention | Chris | Product + design | Sprint 1 | +15 percent lift in 7-day six-action completion |
| 2 | Complete event instrumentation for activation funnel | Needed for objective decisions and weekly optimization | Chris | Data | Sprint 1 | 100 percent of six actions tracked server-side |
| 3 | Re-enable Turnstile on auth and public endpoints | Reduces abuse risk as acquisition scales | Chris | Security | Sprint 1 | Auth abuse and suspicious signup rate trend down |
| 4 | Finish critical-path Playwright E2E coverage | Prevents silent regressions in auth, onboarding, and billing | Chris | QA | Sprint 2 | 4 critical paths passing in CI on every merge |
| 5 | Add migration rollback playbooks for high-risk schema changes | Lowers production blast radius and recovery time | Chris | Platform | Sprint 2 | Rollback playbook exists for every risky migration |
| 6 | Finalize Semgrep Cloud onboarding | Improves security visibility and operational follow-through | Chris | Platform | Sprint 2 | Security findings triaged with owner/SLA in workflow |
| 7 | Launch coach partner pilot playbook | Fastest B2B channel to qualified users | GTM lead | Chris + partnerships | Sprint 3 | First 3 active coach partners and attributable pipeline |
| 8 | Launch search-firm and outplacement pilot tracks | Builds second B2B growth leg and validates seat economics | GTM lead | Chris + partnerships | Sprint 3 | 2 pilots launched, activation and retention tracked |
| 9 | Publish trust-forward landing and pricing narrative refresh | Improves qualified acquisition and message clarity | Marketing lead | Chris + design | Sprint 4 | Lift in visitor-to-trial and qualified-trial share |
| 10 | Stand up weekly decision scorecard cadence (Dalio/Duke loop) | Converts roadmap into measurable bet portfolio | Founder | Chris + product ops | Sprint 4 | Weekly scorecard review and monthly rebalance cadence live |

## Recommended Chris Workstream

Chris can own a focused reliability and growth-foundation stream while GTM runs partner/channel execution.

### Chris-led lane (engineering and platform)

1. Decision 1 - Activation tracker and prompts.
2. Decision 2 - Activation instrumentation.
3. Decision 3 - Turnstile re-enable.
4. Decision 4 - Critical-path E2E coverage.
5. Decision 5 - Migration rollback playbooks.
6. Decision 6 - Semgrep Cloud completion.

### Shared lane (engineering support to GTM)

1. Decision 7 - Coach pilot data plumbing and attribution.
2. Decision 8 - Search-firm/outplacement pilot instrumentation.
3. Decision 9 - Messaging experiment instrumentation.
4. Decision 10 - Scorecard data pipeline and governance tooling.

## Sprint Plan (8 weeks)

### Sprint 1 (Weeks 1-2)

- Decision 1
- Decision 2
- Decision 3

### Sprint 2 (Weeks 3-4)

- Decision 4
- Decision 5
- Decision 6

### Sprint 3 (Weeks 5-6)

- Decision 7
- Decision 8

### Sprint 4 (Weeks 7-8)

- Decision 9
- Decision 10

## Review Agenda with Chris (45 minutes)

1. Confirm objective: optimize acquisition plus retention, not feature volume.
2. Validate owner fit for each of the 10 decisions.
3. Lock Sprint 1 and Sprint 2 scope today.
4. Mark any decision as hold if dependencies are missing.
5. Assign KPI owner and review date for every selected item.

## Decisions Needed in Meeting

1. Approve the top 10 as the active roadmap set.
2. Confirm Chris ownership on Decisions 1 through 6.
3. Confirm GTM owner for Decisions 7 through 9.
4. Confirm weekly scorecard owner for Decision 10.
5. Confirm sprint start date and first review checkpoint.

## One-Page Scorecard Template

Use this format in the weekly review for each decision:

- Decision #: ____
- Owner: ____
- KPI: ____
- Baseline: ____
- Current: ____
- Delta: ____
- Risk level: ____
- Keep, Scale, or Kill: ____
- Notes and next action: ____

## Summary

This deck compresses the full council roadmap into a practical execution set Chris can act on immediately, while preserving the Dalio/Duke decision discipline for ongoing prioritization.
