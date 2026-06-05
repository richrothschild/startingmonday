# Week 2 Telemetry Schema and Route Coverage

Date: 2026-06-04
Epic: SMK-108
Ticket: SMK-113 (W2-04)
Owner: Engineering + Growth

## Purpose

Document Week 2 conversion telemetry changes and provide a route-level coverage contract that can be validated weekly.

## Week 2 Event Contract

Core event names in use:
- `channel_entry_clicked`
- `persona_route_selected`
- `trust_block_interacted`

Required properties for Week 2 conversion events:
- `channel`
- `source_page` or `source_route`
- `target_route` when navigation event applies
- `cta_label` when CTA event applies
- `variant_key` for Week 2 experiments

Required properties for trust/BLUF interaction events:
- `channel`
- `route`
- `block_id`
- `action` (`accordion_open` or `accordion_close`)

## Week 2 Variant Keys

- `executive_proof_v1`
  - Applied on key executive CTA surfaces in `src/components/LandingPage.tsx`.
- `coach_bluf_v1`
  - Applied on key coach CTA surfaces in `src/app/coaches/page.tsx`.

## Route-Level Coverage Matrix

| Route | Primary objective | Required events | Required variant_key |
| --- | --- | --- | --- |
| `/` | Top-level executive conversion | `channel_entry_clicked`, `trust_block_interacted` | `executive_proof_v1` |
| `/for-executives` | Executive journey conversion | `channel_entry_clicked`, `trust_block_interacted` | `executive_proof_v1` |
| `/coaches` | Coach channel entry | `channel_entry_clicked`, `persona_route_selected`, `trust_block_interacted` | `coach_bluf_v1` |
| `/for-coaches` | Coach journey conversion | `trust_block_interacted` + route CTA tracking attributes | N/A (tracked attributes present) |

## Weekly Validation Queries (PostHog / HogQL)

### Query 1: Variant-key coverage by route

```sql
SELECT
  event,
  properties.source_page AS source_page,
  properties.source_route AS source_route,
  properties.variant_key AS variant_key,
  count() AS events
FROM events
WHERE event IN ('channel_entry_clicked', 'persona_route_selected')
  AND (properties.source_page IN ('/', '/coaches') OR properties.source_route IN ('/', '/coaches'))
  AND timestamp >= now() - INTERVAL 7 DAY
GROUP BY event, source_page, source_route, variant_key
ORDER BY events DESC
```

Pass condition:
- No null `variant_key` rows for Week 2 routes above.

### Query 2: BLUF interaction coverage

```sql
SELECT
  properties.route AS route,
  properties.block_id AS block_id,
  properties.action AS action,
  count() AS events
FROM events
WHERE event = 'trust_block_interacted'
  AND properties.route IN ('/', '/coaches', '/for-coaches')
  AND timestamp >= now() - INTERVAL 7 DAY
GROUP BY route, block_id, action
ORDER BY route, block_id, action
```

Pass condition:
- Each route has open/close interaction rows for at least one block.

## Monitoring Checklist

- [ ] Variant keys present and non-null for executive/coach CTA events.
- [ ] Trust block interaction events visible for BLUF sections.
- [ ] Route-level event volume is non-zero after release.
- [ ] Any coverage gap is logged as a ticket before next release.

## Evidence

Code references:
- `src/components/LandingPage.tsx`
- `src/app/coaches/page.tsx`
- `src/components/TrackedAccordionItem.tsx`
