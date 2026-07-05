# Landing Page Standard (Sitewide, Reality-Based)

This document defines the production quality standard for all routes using the landing page as the design and experience reference. The goal is not static code compliance. The goal is rendered experience parity.

## Canonical Standard (v1.0)

This file is the canonical source of truth for sitewide editorial standards.

### Typography Contract

- Section headlines and pull quotes use Playfair Display.
- Body copy and UI labels use Geist Sans.
- Mono usage is restricted to micro labels and kickers (Geist Mono default; JetBrains Mono only by explicit experiment).
- Body text must not switch to Playfair or any replacement sans family.

### Narrative Contract

- Each landing-style page uses one primary narrative spine.
- Duplicate conversion blocks are not allowed in the same scroll band.
- Trust assurance appears before the final conversion decision point.
- Proof/evidence CTA appears at first skepticism moment, not only at footer depth.

### Choice Curation Contract

- No more than three primary options should be visible at one decision moment on Tier 0 routes.
- Additional options must be behind one intentional interaction, not presented as a wall of equal choices.
- Personalized options should carry a short why-line when the user is being asked to choose.

### Arrival Contract

- First-run authenticated surfaces must show at least one already-earned value moment.
- First-run authenticated surfaces must not present more than one empty data visualization at a time.
- Each first-run screen must include exactly one clear next action.

### Value-Moment Contract

- Every setup step on Tier 0 authenticated routes must end with a visible payoff.
- Setup steps must never end with a bare form submission state when a meaningful result is already available.
- Week-one guidance should surface one suggested action per day, not a queue of competing tasks.

### Claim-Integrity Contract

- Any capability stated on public routes must be experientially visible within the first session or softened in the copy.
- Public claims about timing, role discovery, or relationship readiness must be backed by an in-session surface.
- If a claim cannot be shown yet, the product should say what it can show today.

### Brand Lockup Contract

- Header and footer wordmark sizing must remain legible at mobile and desktop breakpoints.
- Over-compressed lockups are not allowed (avoid ultra-small lockups with oversized tracking).

### Verification Contract

- 100% route inventory coverage is required for compliance reports.
- A compliance report is valid only when:
  - all discovered routes are tested,
  - untested routes = 0,
  - global typography contract checks pass,
  - per-route standards checks pass or are explicitly reported as failing.

## Why This Standard Exists

- Static-only checks can pass while production still looks wrong.
- Elite teams (large consumer platforms, media brands, and design-led product orgs) gate on rendered outcomes, not only source heuristics.
- Every page must meet measurable brand, UX, accessibility, performance, and reliability thresholds.

## Industry-Inspired Quality Model

The standards below are modeled on common practices used by top organizations such as Netflix, Google, Meta, Vogue, and The New York Times:

- Design system enforcement: token-level consistency and reusable shell primitives.
- Visual regression gating: screenshot diffs at route-level breakpoints.
- Interaction contracts: critical paths tested end to end, not assumed.
- Accessibility as release criteria: keyboard, contrast, semantics, and labels.
- Performance budgets per route tier: no unbounded regressions.
- Observability and incident response: alerts with run artifacts, owner, and SLA.

## Core Principles

- Brand integrity: every route must look intentionally part of one product.
- Cognitive clarity: fast orientation, clear hierarchy, clear primary action.
- Functional trust: every visible control has a verified behavior.
- Measured quality: all claims require quantifiable pass/fail evidence.
- Production truth: tests must validate rendered output in browser context.

## Route Tiers

- Tier 0 (Critical): login, signup, onboarding, dashboard chat, homepage.
- Tier 1 (High Traffic): key public acquisition and dashboard hub routes.
- Tier 2 (Core Utility): docs, guide, billing, profile, settings, help.
- Tier 3 (Long Tail): lower-volume and campaign-specific pages.

Tier determines strictness, test frequency, and escalation timeline.

## Approved Shell Families

- landing-shell: direct usage of shared landing primitives.
- marketing-shell: public pages with approved marketing chrome.
- dashboard-shell: authenticated route family with dashboard shell.
- auth-shell: authentication route family.
- custom-shell: explicit shell composition using approved tokens and contracts.

Custom shell does not mean exempt shell.

## Non-Negotiable Metrics

All metrics are release gates unless marked advisory.

### Visual and Brand Metrics

- Token drift: 0 critical token violations on Tier 0 and Tier 1 routes.
- Shell parity: 100% of routes mapped to approved shell family.
- Visual diff threshold:
  - Tier 0: <= 0.5% pixel delta
  - Tier 1: <= 1.0% pixel delta
  - Tier 2/3: <= 1.5% pixel delta
- Typography contract: heading/body scale and contrast pass for all pages.

### UX and Interaction Metrics

- Action wiring: 100% of primary CTA controls verified actionable.
- Primary task completion (synthetic):
  - Tier 0/Tier 1: >= 99% pass rate
  - Tier 2/3: >= 97% pass rate
- Navigation continuity: no dead-end or self-loop without explicit intent.

### Accessibility Metrics

- Keyboard path: all interactive controls reachable and operable.
- Color contrast: WCAG AA for body and control text.
- Semantics: one visible h1 per page context, valid landmarks, label coverage.
- A11y violations: 0 critical, 0 serious on Tier 0 and Tier 1.

### Performance Metrics

- LCP budget:
  - Public Tier 0/Tier 1: <= 2.5s (P75)
  - Authenticated Tier 0/Tier 1: <= 3.0s (P75)
- CLS budget: <= 0.10 (P75)
- INP budget: <= 200ms (P75)
- JS error budget: no sustained regression week over week.

## Test Suites Required for Every Release

### 1. Static Contract Suite

Purpose: detect obvious shell/token regressions early.

- Route discovery and shell classification.
- Token and style contract checks.
- CTA wiring and glyph fallback checks.
- Output artifacts: machine JSON + human markdown.

### 2. Rendered DOM Contract Suite

Purpose: validate what users actually see.

- Confirm h1, landmarks, nav, and primary CTA presence.
- Assert protected route redirects and auth flow integrity.
- Assert docs and content routes are non-empty and populated.

### 3. Visual Regression Suite

Purpose: detect layout/theme drift beyond acceptable threshold.

- Full-page screenshots for each route tier.
- Desktop + mobile baselines required.
- Diff percent and hotspot report required for failures.

### 4. Interaction E2E Suite

Purpose: validate task success and prevent broken journeys.

- Signup/login/onboarding flows.
- Dashboard and guide core actions.
- Billing and settings key actions.

### 5. Accessibility Suite

Purpose: enforce semantic and keyboard quality.

- Automated rules + keyboard traversal checks.
- Tier 0 and Tier 1 failures block release.

### 6. Performance Budget Suite

Purpose: prevent experience decay from incremental regressions.

- Lighthouse and route-level web-vitals budget checks.
- Tiered budgets with explicit pass/fail thresholds.

## Required Command Gates

The following must be run for release candidates:

- npm run gate:standards:dev
- npm run gate:standards:staging
- npm run gate:standards:production
- npm run ux:landing-standard:strict
- npm run test:e2e:luxury:public-all
- npm run test:e2e:mobile-elite-visual
- npm run test:e2e:auth-ux
- npm run audit:performance:gate

If any required gate fails, release is blocked.

## Monitoring and Escalation

- Full strict audits run twice daily.
- Tier 0 and Tier 1 failures trigger immediate Slack alert with:
  - failing route list
  - failed checks
  - run URL and artifact links
  - owner and expected resolution time
- Resolution SLA:
  - Tier 0: same business day
  - Tier 1: within 24 hours
  - Tier 2/3: within 3 business days

## Definition of Done for Page Changes

A page change is complete only when all are true:

- Route passes strict static and rendered checks.
- Visual diff is within route-tier threshold.
- Critical interaction paths pass on desktop and mobile.
- No critical/serious accessibility violations.
- No performance budget violations for that tier.

## Anti-Patterns (Not Allowed)

- Passing static checks while skipping rendered tests.
- Introducing one-off shell styles that bypass shared primitives.
- Adding routes without tier classification and baseline snapshots.
- Waiving failures without documented owner, rationale, and expiry.
