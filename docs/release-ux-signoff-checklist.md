# Release UX Sign-off Checklist

Owner: Documentation Operations
Status: active
Last reviewed: 2026-06-07
Review cadence: weekly
Source of truth: yes


Purpose: block production releases where behavior works but UX quality is not production-grade.


How to use:
- Complete this checklist in the release PR description before merge.
- If any line is unchecked, release is blocked.

## Auth and Entry Flows
- [ ] Login page has no utility navigation block above primary auth actions.
- [ ] Login primary hierarchy is clear: heading, social auth, divider, email/password, magic-link.
- [ ] Signup page follows approved hierarchy and copy.
- [ ] Error and helper copy is concise, specific, and non-contradictory.

## Interaction Quality
- [ ] Primary actions are clickable and dispatch expected network requests.
- [ ] Disabled/loading states are visible and prevent duplicate submits.
- [ ] Keyboard navigation works for all primary fields and buttons.
- [ ] No dead controls or no-op buttons on core routes.

## Visual Quality
- [ ] Auth visual regression baselines are green in CI.
- [ ] Spacing, typography, and contrast match approved auth baseline.
- [ ] No placeholder/fallback copy visible on production-critical screens.

## Content and Information Architecture
- [ ] Only intentional guidance is shown; no debug, fallback, or implementation hints.
- [ ] Section labels are user-facing and task-oriented.
- [ ] Critical routes do not expose internal remediation text.

## Release Gate Evidence
- [ ] Auth UX Playwright suite passed (`test:e2e:auth-ux`).
- [ ] Production synthetics passed for login and guide paths.
- [ ] Reviewer screenshot evidence attached for `/login`, `/guide`, and `/dashboard/admin/internal-guide`.
