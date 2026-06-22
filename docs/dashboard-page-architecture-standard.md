# Dashboard Page Architecture Standard

Status: Standard
Owner: Product + Engineering
Last Updated: 2026-06-22
Primary Reference: [dashboard-modernization-plan.md](dashboard-modernization-plan.md)

## Purpose

Use this standard for every dashboard page so users can find their next move quickly without unnecessary cognitive load.

## Required Top-Level Structure

Every dashboard page must follow this section order:

1. Header context
2. Position summary
3. Evidence strip
4. Action section(s)
5. Optional deep context

## Section Definitions

### 1) Header context

Must include:
- User-facing date or time context
- One sentence describing current position

Must not include:
- Raw metric dumps
- More than one paragraph

### 2) Position summary

Must include:
- One clear state label (for example: Building, Steady, Watch)
- One primary CTA
- One optional explainer path

Must not include:
- Gamification widgets
- More than one primary CTA

### 3) Evidence strip

Must include:
- Up to four metrics
- Labels tied to outcomes, not internal mechanics

Must not include:
- Competing visual emphasis with the position summary

### 4) Action sections

Each action section must answer:
- Why now?
- What next?

Action sections should be limited to what can be acted on in the next 24 hours.

### 5) Optional deep context

Use collapsible or linked depth for supporting detail. Depth must never block first action clarity.

## Information Density Rules

- First actionable path must be visible within one screen on mobile.
- Above-the-fold content should prioritize one move over breadth.
- Jump navigation must stay lightweight and optional.

## Accessibility Rules

- Interactive elements must use touch targets of at least 44px height.
- Keep heading hierarchy continuous.
- Avoid color-only state encoding.

## Definition Of Done

A dashboard page is complete only when:

- Structure matches this standard.
- One primary action is obvious in under 10 seconds.
- Mobile layout at 390px keeps position summary readable without horizontal scrolling.
- Labels align with [dashboard-copy-and-tone-standard.md](dashboard-copy-and-tone-standard.md).
- Tracking requirements align with [dashboard-instrumentation-standard.md](dashboard-instrumentation-standard.md).
