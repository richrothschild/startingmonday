# Dashboard Page Template

Status: Template
Owner: Product + Engineering
Last Updated: 2026-06-22

Use this when building or refactoring any dashboard route.

## Required References

1. [../dashboard-page-architecture-standard.md](../dashboard-page-architecture-standard.md)
2. [../dashboard-copy-and-tone-standard.md](../dashboard-copy-and-tone-standard.md)
3. [../dashboard-instrumentation-standard.md](../dashboard-instrumentation-standard.md)

## Build Outline

### 1) Header context

- Date or time context visible
- One sentence: current position

### 2) Position summary

- State label (Building, Steady, Watch)
- One primary CTA
- Optional support action

### 3) Evidence strip

- Up to four metrics
- Labels tied to outcomes

### 4) Action sections

For each section include:
- Why now
- What next

### 5) Optional deep context

- Collapsible or linked detail
- Never block first action clarity

## Instrumentation Block

Track at minimum:

- `*_viewed` page event
- Primary CTA click
- Support interaction click/open

Include properties:

- `section`
- `action`
- `target`
- `page_route`
- optional `pulse_state`

## Delivery Checklist

- [ ] Mobile scan at 390px is clear in one screen
- [ ] One primary action is obvious in under 10 seconds
- [ ] No punitive or gamified language
- [ ] Event payloads validated and logged safely
- [ ] PR includes standards compliance snippet from [../governance/dashboard-pr-checklist.md](../governance/dashboard-pr-checklist.md)
