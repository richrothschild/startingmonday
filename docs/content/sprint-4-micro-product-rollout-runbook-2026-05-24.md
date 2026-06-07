# Sprint 4 Micro-Product Rollout Runbook

Owner: Documentation Operations
Status: deprecated
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: no
Canonical doc: docs/sprint-backlog.md
Lifecycle candidate: archive


Date: 2026-05-24
Sprint: 4

## Scope

This runbook covers Sprint 4 back-office operations for:
- Stripe product and price mapping for pilot micro-products.
- Catalog and bundle administration.
- User and partner entitlement assignment.
- Rollout controls and kill criteria.

## Pilot micro-products

Two pilot products configured in the Sprint 4 catalog schema:
- exec-interview-narrative-pack
  - Billing type: one_time
  - Placeholder Stripe IDs: prod_exec_interview_narrative_pack / price_exec_interview_narrative_pack
  - Launch coupon: coupon_exec_launch_2026
- board-transition-brief-kit
  - Billing type: subscription (monthly)
  - Placeholder Stripe IDs: prod_board_transition_brief_kit / price_board_transition_brief_kit_monthly
  - Launch coupon: coupon_board_launch_2026

## Bundle template and entitlement mapping

Bundle template:
- outplacement-accelerator-bundle
- Audience: b2b
- Minimum seat count: 5

Bundle entitlement keys:
- exec_narrative_pack_access
- board_transition_brief_access

Partner seat provisioning:
- Partner assignment is handled in admin via bundle-to-partner assignment.
- Seat capacity is represented by seat_limit on account_entitlements rows.

## Operational flow

1. Create or update product in /dashboard/admin/product/catalog.
2. Attach Stripe price ID and optional launch coupon.
3. Activate product status.
4. For B2B offers, create/activate bundle template and add bundle items.
5. Assign bundle to partner email with seat_limit.
6. Validate resulting rows in account_entitlements.

## Checkout and webhook behavior

- User add-on checkout endpoint:
  - /api/billing/checkout/micro-product
- Webhook entitlement handling:
  - checkout.session.completed with metadata type=micro_product grants active entitlement.
  - customer.subscription.updated reconciles entitlement status.
  - customer.subscription.deleted expires entitlement.

## Launch criteria

Required before marking a micro-product live:
- Product status active.
- Active Stripe price ID present.
- Coupon policy defined (if launch promo applies).
- Entitlement key defined and mapped.
- Billing flow tested end-to-end in staging.

## Kill criteria

Pause rollout for any product if one or more are true:
- Checkout success rate drops below 95% over 24h.
- Entitlement assignment failures exceed 2% of successful checkouts.
- Partner seat assignment mismatch detected.
- Stripe webhook retries remain unresolved for over 30 minutes.

## Ownership and cadence

- Revenue Ops: Stripe IDs, coupon policy, launch windows.
- Backend Engineering: webhook integrity and entitlement reconciliation.
- Product Ops: bundle configuration, partner mapping, rollout audit.

Cadence:
- Daily check during first 7 launch days.
- Weekly review after stabilization.

## Sprint 4 closure notes

- Catalog schema, bundle mapping, and entitlement tracking were implemented.
- Admin management flow is live at /dashboard/admin/product/catalog.
- Channel and billing embed points for micro-products were shipped.
- Sprint 4 code changes passed targeted lint validation.
