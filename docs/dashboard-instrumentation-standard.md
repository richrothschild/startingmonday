# Dashboard Instrumentation Standard

Status: Standard
Owner: Product Analytics + Engineering
Last Updated: 2026-06-22
Primary Reference: [dashboard-modernization-plan.md](dashboard-modernization-plan.md)

## Purpose

Ensure every dashboard interaction can be measured without degrading reliability or user trust.

## Event Principles

- Analytics must never block product interactions.
- Every tracked action must include section context.
- Event names should be stable and reusable across pages.

## Required Event Baseline

For every dashboard page, capture at minimum:

1. Page view event
2. Primary CTA click event
3. Support interaction events (for example, explainer open, email-plan click, save-note click)

## Required Properties

For action events, include:
- section
- action
- target
- page_route

Include optional state markers when relevant, for example pulse_state.

## Event Transport Rules

- Server-side logging should use `logEvent` for source-of-truth persistence.
- Optional PostHog capture may run in parallel for analytics views.
- Client-side interaction tracking should use keepalive where appropriate.

## Naming Conventions

Prefer existing event families before introducing new top-level event names.

Example:
- Use `briefing_action_clicked` with `action` and `section` properties.
- Avoid creating fragmented one-off events unless they represent materially different behavior.

## Data Quality Rules

- Validate incoming event payloads at route boundary.
- Whitelist known sections/actions where feasible.
- Return explicit 400 errors for invalid telemetry payloads.

## Definition Of Done

Instrumentation is complete when:
- Baseline events are present.
- Required properties are included consistently.
- Invalid payloads are rejected safely.
- Tracking path does not alter user navigation success.
