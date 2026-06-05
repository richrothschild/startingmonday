# Week 3 Segmented Conversion Readout

Date: 2026-06-04
Epic: SMK-115
Ticket: SMK-119 (W3-03)
Owner: Growth + Product + Engineering

## Purpose

Provide a weekly conversion readout segmented by route and experiment variant so weekly go/iterate decisions are evidence-based.

## Scope (Current Cycle)

Routes in this readout:
- `/`
- `/for-executives`
- `/for-cio`
- `/coaches`
- `/for-coaches`

Variant keys in scope:
- `executive_proof_v1`
- `executive_proof_v2`
- `coach_bluf_v1`
- `coach_bluf_v2`

## Event Inputs

Primary events:
- `channel_entry_clicked`
- `persona_route_selected`
- `trust_block_interacted`

Required dimensions:
- `variant_key`
- `channel`
- `source_page` or `source_route`
- `cta_label` or `persona`

## Weekly Readout Table Template

| Route | Variant key | CTA clicks | Persona route selects | Trust interactions | 7d trend vs prior | Status |
| --- | --- | --- | --- | --- | --- | --- |
| / | executive_proof_v1 | TBD | TBD | TBD | TBD | Pending data |
| / | executive_proof_v2 | TBD | TBD | TBD | TBD | Pending data |
| /for-executives | executive_proof_v1 | TBD | TBD | TBD | TBD | Pending data |
| /for-executives | executive_proof_v2 | TBD | TBD | TBD | TBD | Pending data |
| /for-cio | executive_proof_v1 | TBD | N/A | TBD | TBD | Pending data |
| /for-cio | executive_proof_v2 | TBD | N/A | TBD | TBD | Pending data |
| /coaches | coach_bluf_v1 | TBD | TBD | TBD | TBD | Pending data |
| /coaches | coach_bluf_v2 | TBD | TBD | TBD | TBD | Pending data |
| /for-coaches | coach_bluf_v1 | TBD | N/A | TBD | TBD | Pending data |
| /for-coaches | coach_bluf_v2 | TBD | N/A | TBD | TBD | Pending data |

## HogQL Query Pack

### Query 1: CTA and persona events by route and variant (7d)

```sql
SELECT
  event,
  coalesce(properties.source_page, properties.source_route) AS source_route,
  properties.variant_key AS variant_key,
  count() AS events
FROM events
WHERE event IN ('channel_entry_clicked', 'persona_route_selected')
  AND coalesce(properties.source_page, properties.source_route) IN ('/', '/for-executives', '/for-cio', '/coaches', '/for-coaches')
  AND timestamp >= now() - INTERVAL 7 DAY
GROUP BY event, source_route, variant_key
ORDER BY source_route, event, variant_key
```

### Query 2: BLUF interactions by route and variant (7d)

```sql
SELECT
  properties.route AS route,
  properties.variant_key AS variant_key,
  properties.block_id AS block_id,
  properties.action AS action,
  count() AS events
FROM events
WHERE event = 'trust_block_interacted'
  AND properties.route IN ('/', '/for-executives', '/for-cio', '/coaches', '/for-coaches')
  AND timestamp >= now() - INTERVAL 7 DAY
GROUP BY route, variant_key, block_id, action
ORDER BY route, variant_key, block_id, action
```

### Query 3: Null-rate guard for variant_key

```sql
SELECT
  coalesce(properties.source_page, properties.source_route) AS source_route,
  round(100.0 * countIf(empty(toString(properties.variant_key))) / count(), 2) AS variant_key_null_pct,
  count() AS total_events
FROM events
WHERE event IN ('channel_entry_clicked', 'persona_route_selected')
  AND coalesce(properties.source_page, properties.source_route) IN ('/', '/for-executives', '/for-cio', '/coaches', '/for-coaches')
  AND timestamp >= now() - INTERVAL 7 DAY
GROUP BY source_route
ORDER BY source_route
```

## Decision Rules

1. Keep variant live when:
- `variant_key_null_pct <= 1.0`
- Event volume is stable or improving week-over-week.

1. Iterate variant when:
- Click-through trend declines > 10% for two consecutive readouts.

1. Roll back variant when:
- Click-through declines > 15% week-over-week on a primary route.
- Mobile QA signals regressions on conversion paths.

## Current Cycle Notes

- Deterministic assignment is active in tracked CTA events via `src/lib/experiment-variants.ts` and `src/components/TrackLink.tsx`.
- Additional high-intent route coverage in this cycle includes `/for-cio` and `/for-coaches` CTA surfaces.
- Populate `TBD` values during the next weekly data pull.
