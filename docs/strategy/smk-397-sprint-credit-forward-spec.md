# SMK-397 Sprint Credit-Forward Spec

Parent Epic: SMK-381
Parent Sprint Ticket: SMK-383

## Objective
Apply full paid sprint fee toward first monthly subscription.

## Rules
1. Credit amount = full sprint payment.
2. Credit applies once per user.
3. Credit valid for 30 days after sprint purchase.
4. Credit cannot exceed first invoice amount.

## User Experience
1. Upgrade CTA displays: "Your sprint fee is fully credited."
2. Checkout summary shows line item: `Shortlist Sprint Credit -$199`.
3. Confirmation email includes credit usage details.

## Data/Tracking
- credit_eligible: true/false
- credit_amount
- credit_applied_at
- conversion_event_id

## Acceptance Tests
1. Eligible user sees discount at checkout.
2. Ineligible user does not see discount.
3. Credit is applied once and not reusable.
4. Revenue reporting reflects gross, credit, net.
