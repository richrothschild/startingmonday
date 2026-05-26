# Sprint 3 Artifact: Daily Loop Screen Spec

Date: 2026-05-25
Owner: Product
Status: Completed

## Objective

Define one-screen daily action plan with a maximum of three actions to reduce cognitive load and increase completion.

## Screen Structure

1. Header: Today\'s Momentum Plan
2. Momentum status chip: low, medium, or strong
3. Three action cards, each with:
- action statement
- expected effort in minutes
- completion toggle
- optional note
4. End-of-day reflection prompt

## Action Selection Rules

1. Only three actions shown per day.
2. One action must be relationship-facing.
3. One action must be readiness-facing.
4. One action can be user-selected focus.

## Completion Logic

1. Completion recorded at action level.
2. Day complete when two or more actions are completed.
3. Missed days trigger simplified recovery suggestion.

## KPI Link

Primary KPI: daily action completion rate.

## Release Notes

1. One-screen plan structure finalized.
2. Action selection and completion rules locked for v1.
3. Runtime implementation now lives in `src/components/DailyMomentumPlan.tsx` and is mounted from `src/app/(dashboard)/dashboard/page.tsx`.
