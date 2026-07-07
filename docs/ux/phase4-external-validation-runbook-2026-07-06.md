# Phase 4 External Validation Runbook

Date: 2026-07-06
Owner: product + design
Scope: first-session journey validation after Phase 1-3 implementation

## Objective

Validate that first-session experience quality reaches top-tier usability thresholds with real users before broad rollout decisions.

Primary targets:
- SUS mean > 85
- First-click success > 80 percent on dashboard start next-action task
- Heuristic pass shows no severity-3 or severity-4 issues on first-session surfaces

## Participant Plan

Panel:
- 5 real executives from Carolyn pilot cohort for moderated tests
- Same cohort receives SUS survey after week 1

Recruitment guardrails:
- Include at least 2 active-search users
- Include at least 2 currently employed exploratory users
- Include at least 1 user who signed up in the last 14 days

## Session Scope

Surfaces:
- signup
- auth callback and onboarding entry
- onboarding wizard
- dashboard start
- daily briefing

## Execution Order

1. Run moderated first-session tests with script in docs/ux/phase4-moderated-session-script-2026-07-06.md
2. Capture SUS responses with template in docs/ux/phase4-sus-score-template-2026-07-06.csv
3. Complete heuristic pass using docs/ux/phase4-heuristic-evaluation-template-2026-07-06.md
4. Run first-click and 5-second tests with docs/ux/phase4-first-click-test-template-2026-07-06.md
5. Consolidate findings and classify blockers versus non-blockers

## Decision Rules

Ship progression to broader rollout only if all are true:
- SUS mean >= 85
- First-click success >= 80 percent
- No severity-4 issues
- No more than 2 unresolved severity-3 issues

If any fail:
- Open remediation tickets
- Re-test only changed surfaces
- Re-run SUS sample delta check after fixes

## Reporting Packet

Produce one package under docs/ux with:
- participant table and session timestamps
- SUS summary (mean, median, standard deviation)
- heuristic issues with severity and owner
- first-click and 5-second outcomes
- go or no-go recommendation
