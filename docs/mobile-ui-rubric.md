# Mobile UI Rubric and Required Tests

## Purpose
Prevent mobile regressions by defining a required rubric and test gates before mobile UI changes are committed or deployed.

## Scope
Applies to:
- dashboard mobile headers
- bottom tab navigation
- jump link chips and action buttons
- mobile spacing, contrast, and touch target rules

## Rubric (Pass/Fail)

### R1. Navigation Integrity
- Pass criteria:
  - No clipped or overflowing top navigation text at 320px width.
  - No duplicate full global nav patterns on mobile.
  - Bottom tab active item is visually distinct.

### R2. Touch Ergonomics
- Pass criteria:
  - Interactive controls used for primary navigation/actions are >= 44x44.
  - Jump controls are visibly tappable controls, not plain text links.

### R3. Hierarchy and Readability
- Pass criteria:
  - Primary action is visible above fold on common phone sizes.
  - Secondary text contrast remains readable against page surfaces.

### R4. Layout Balance
- Pass criteria:
  - Multi-action groups on mobile render in visually balanced arrangements.
  - No obvious asymmetric chip rows for fixed-size section controls.

### R5. Scroll and Footer Behavior
- Pass criteria:
  - No excessive blank scroll region beneath meaningful content before page end.
  - Bottom nav does not cover primary call-to-action controls.

### R6. Account-Scoped Visibility
- Pass criteria:
  - Staff-only links (for example Outreach Hub) are hidden for non-staff accounts.

## Required Tests

### Pre-Commit (Required when mobile UI files are staged)
- `node scripts/precommit-mobile-ui-gate.mjs`
- Gate behavior:
  - detects staged mobile UI files
  - runs quick rubric smoke on iPhone viewport project

### CI (Required)
- `npx playwright test tests/e2e/mobile-ui.spec.ts --project=mobile-iphone --project=mobile-android --project=mobile-tablet`
- Must pass on PR and protected branches.

### Weekly Production Audit (Required)
- Scheduled workflow runs mobile rubric suite weekly against production.
- Device classes:
  - iPhone class
  - Android phone class
  - tablet class

## Staged-File Trigger Paths
Mobile pre-commit gate triggers when staged files match one of:
- `src/app/(dashboard)/dashboard/**`
- `src/components/BottomNav.tsx`
- `src/app/globals.css`
- `src/components/**` (for dashboard navigation components)

## Evidence Artifacts
Each mobile CI or weekly run should retain:
- Playwright HTML report
- failure screenshots/videos
- concise summary in workflow run output

## Change Management
Every mobile UI PR should include:
- checked rubric items (R1-R6)
- screenshots from at least one phone viewport
- note of any skipped tests and rationale
