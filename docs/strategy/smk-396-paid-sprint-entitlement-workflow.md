# SMK-396 Paid Sprint Entitlement Workflow

Parent Epic: SMK-381
Parent Sprint Ticket: SMK-383

## Objective
Define deterministic workflow from paid sprint purchase to deliverable completion.

## Workflow Steps
1. Purchase completed (`offer=shortlist_sprint`).
2. Entitlement record created with status `active` and expiry +7 days.
3. Delivery job generates:
   - 5 likely-open roles
   - decision-path map per role
   - weekly action queue
4. Customer receives delivery summary and dashboard access link.
5. Status transitions:
   - `active` -> `delivered` -> `converted` or `expired`.

## Required Data Fields
- user_id
- offer_code
- paid_amount
- purchased_at
- expires_at
- status
- delivered_at
- converted_at

## Operational SLA
- Initial delivery within 48 hours of purchase.
- Support response within 1 business day.

## QA Checklist
1. Entitlement created after purchase.
2. No access before payment.
3. Delivery status visible to support.
4. Expired entitlements locked correctly.
