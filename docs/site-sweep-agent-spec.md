# Site Sweep Agent Spec

Status: concrete implementation spec
Last updated: 2026-07-20

## Purpose

The Site Sweep Agent is the route-by-route experience observatory for the site. It turns the existing audit scripts into one orchestrated sweep that refreshes the active route inventory, executes route-scoped audits, and reports the result as a single ledgered artifact.

## Contracts

1. The sweep must start from the route inventory and never claim full coverage without an inventory artifact for the same run.
2. Route-scoped audits must run one route at a time for page-level checks so failures are attributable to a specific route.
3. Dashboard trust remains a grouped bundle because signal parity is a cross-route contract; the sweep may scope it to the selected dashboard routes, but it must not fake parity from partial data.
4. The sweep must write both JSON and Markdown reports under `docs/status/` so downstream reports can reuse the same evidence.

## Inputs

- Route inventory from `docs/status/route-inventory.latest.json`.
- Optional route selection via `--route` or `--routes`.
- Optional base URL for trust checks.

## Execution Order

1. Refresh route inventory.
2. Select the route set for the sweep.
3. Run `check-landing-standard-all-pages.mjs` once per route.
4. Run `check-cognitive-load-all-pages.mjs` once per route.
5. Run `trust-integrity-agent.mjs` for the dashboard bundle when dashboard routes are present.
6. Emit the rolled-up site sweep report.

## Failure Policy

- Any route-level landing or cognitive issue fails the sweep.
- Any dashboard trust failure fails the sweep.
- If the selection matches no routes, fail fast with a clear error.

## Outputs

- `docs/status/site-sweep.latest.json`
- `docs/status/site-sweep.latest.md`
- Optional Slack summary on the reliability channel

## Why This Exists

The repo already had the pieces for inventory, landing standard, cognitive load, and dashboard trust. This agent makes them operate as a single route-by-route sweep so the team can inspect live experience risk without hand-assembling the checks every time.