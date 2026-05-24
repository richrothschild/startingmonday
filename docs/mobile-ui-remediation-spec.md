# Mobile UI Remediation Spec (Sprint 1)

## Objective
Ship a mobile-first dashboard experience that is readable, tappable, and task-focused on iPhone and Android devices, while preserving existing desktop behavior.

## Scope
In scope:
- Mobile global navigation behavior
- Mobile spacing, typography, and button sizing
- Hero and above-the-fold task hierarchy
- Jump link usability
- Bottom tab bar clarity and accessibility

Out of scope for this sprint:
- Major IA rewrite
- New feature modules
- Desktop visual redesign

## Success Criteria
- No horizontal overflow at 320px and above.
- One clear mobile primary navigation pattern (no duplicate nav systems).
- All interactive controls meet minimum touch size of 44x44.
- Text contrast passes WCAG AA for normal body copy.
- Primary action appears above the fold on common phone heights.
- Mobile Lighthouse Accessibility score >= 95 on dashboard route.

## Breakpoint Rules
Use mobile-first breakpoints and progressively enhance upward.

### Breakpoint Map
- xs: 320-374
- sm: 375-479
- md: 480-767
- lg: 768+

### Layout and Navigation Rules
1. xs to md (320-767)
- Replace desktop top link row with compact header:
  - Left: brand mark
  - Right: menu trigger or single utility action
- Keep bottom tab bar as the primary nav pattern.
- Do not display full top nav links on one row.
- Reduce header vertical padding to 10-12px.
- Apply safe-area bottom padding to fixed tab bar.

2. lg and above (768+)
- Existing desktop nav behavior may remain.
- Bottom tab bar may be hidden if desktop nav is primary.

### Spacing and Rhythm Rules
1. xs (320-374)
- Page horizontal padding: 16px
- Section vertical spacing: 16px
- Card padding: 16px
- Heading line-height: 1.15 to 1.2

2. sm to md (375-767)
- Page horizontal padding: 20px
- Section vertical spacing: 20px
- Card padding: 20px
- Heading line-height: 1.2

### Action and Component Rules
1. Buttons
- Primary and secondary actions stack vertically below 480px.
- Button min-height: 44px.
- Button horizontal padding: 14-16px.

2. Jump-to-section controls
- Convert text links into pill buttons/chips on mobile.
- Minimum tap area: 44x44.
- Provide active state with clear color and underline or filled style.

3. Bottom tab bar
- Strengthen active state contrast (icon and label).
- Ensure label font size >= 12px and weight >= 600 for active item.
- Maintain fixed position with safe area inset support.

## Token Changes
Apply these as design-system tokens so fixes scale across routes.

### Color Tokens
- color.text.primary.mobile: #0f172a
- color.text.secondary.mobile: #475569
- color.text.tertiary.mobile: #64748b
- color.surface.page.mobile: #e5eaf1 (or lighten to improve contrast context)
- color.surface.card.mobile: #f8fafc
- color.action.primary.bg: #0b1736
- color.action.primary.fg: #ffffff
- color.action.secondary.bg: #ffffff
- color.action.secondary.fg: #334155
- color.nav.active: #0f172a
- color.nav.inactive: #94a3b8

### Typography Tokens
- font.size.hero.mobile: 48px (clamp with viewport)
- font.size.h1.mobile: 46px
- font.size.h2.mobile: 32px
- font.size.body.mobile: 32px
- font.size.meta.mobile: 24px
- line.height.hero.mobile: 1.1
- line.height.body.mobile: 1.45

### Spacing and Radius Tokens
- space.page.x.mobile: 16px (xs), 20px (sm+)
- space.section.y.mobile: 16px (xs), 20px (sm+)
- space.card.padding.mobile: 16px (xs), 20px (sm+)
- radius.card.mobile: 12px
- radius.button.mobile: 10px

### Interaction Tokens
- touch.target.min: 44px
- focus.ring.color: #f97316
- focus.ring.width: 2px
- focus.ring.offset: 2px

## Route-Level Remediation Plan
Primary target route: dashboard home on mobile.

1. Header
- Collapse desktop links at <768.
- Keep brand and one control only.
- Remove duplicate top-level destinations when bottom tabs are present.

2. Hero
- Reduce top margin and paragraph copy length.
- Keep one primary CTA visible in first viewport.

3. Jump section module
- Convert to tappable chip row with wrapping.
- Add explicit selected state.

4. Quick access and start cards
- Remove redundant framing where possible.
- Stack action buttons below 480.
- Increase secondary text contrast.

5. Bottom nav
- Tune icon/label contrast and selected state.
- Verify no overlap with browser/toolbars on iOS Safari.

## One-Sprint Implementation Checklist (10 working days)

### Day 1-2: Design and Token Definition
- [ ] Freeze mobile token values listed above.
- [ ] Create before/after mobile mocks for dashboard top 2 screens.
- [ ] Approve single mobile nav paradigm.

### Day 3-5: Engineering Foundation
- [ ] Implement breakpoint nav switch (desktop row off below 768).
- [ ] Add/adjust token variables in shared theme layer.
- [ ] Add safe-area handling for bottom tab bar.
- [ ] Add utility classes for touch target enforcement.

### Day 6-7: Route Updates
- [ ] Apply hero spacing and typography adjustments.
- [ ] Convert jump links into mobile chips.
- [ ] Stack card action buttons at <480.
- [ ] Increase text contrast for metadata and helper copy.

### Day 8: Accessibility and QA
- [ ] Test VoiceOver and TalkBack focus order.
- [ ] Verify 44x44 minimum targets on all tappables.
- [ ] Validate contrast ratios for text and active states.

### Day 9: Device Matrix Verification
- [ ] iPhone SE/mini width (320/360 class)
- [ ] iPhone standard/pro width (390/393 class)
- [ ] Android Pixel width (412 class)
- [ ] Landscape behavior checks

### Day 10: Release and Monitor
- [ ] Release behind flag or phased rollout.
- [ ] Track mobile engagement events (CTA taps, nav taps, bounce).
- [ ] Gather 72-hour feedback and create sprint-2 backlog.

## QA Acceptance Checklist
- [ ] No clipped top navigation text on 320-767 widths.
- [ ] No simultaneous duplicate global nav patterns on mobile.
- [ ] Primary action visible without excessive scroll on common phone heights.
- [ ] Body text remains legible outdoors (contrast and size).
- [ ] Tap targets meet minimum size and spacing.
- [ ] No horizontal scroll introduced by any dashboard module.

## Risks and Mitigations
1. Risk: token changes affect desktop unexpectedly.
- Mitigation: scope mobile overrides under mobile breakpoints first.

2. Risk: nav paradigm change impacts discoverability.
- Mitigation: run quick usability test with 5 users and event instrumentation.

3. Risk: card stacking increases vertical length.
- Mitigation: reduce redundant copy and whitespace above fold.

## Deliverables
- Updated dashboard mobile layout and interaction behavior.
- Shared token updates in theme layer.
- QA evidence for device matrix and accessibility checks.
- Sprint retrospective notes and sprint-2 backlog.
