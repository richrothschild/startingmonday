# Starting Monday B2B Channel Development Initiative

**Owner:** Chris Goodwin  
**Date Created:** 2026-06-25  
**Target Completion:** End of Q3 2026 (September 30)  
**Strategic Importance:** HIGH — B2B channels represent 40% of Year 5 revenue ($850K ARR) and 80%+ gross margins

---

## Executive Summary

Starting Monday has validated product-market fit with 70+ individual users in job search. The next phase of growth requires building the B2B channel infrastructure that will unlock recurring revenue from coach partners and outplacement firms.

This initiative focuses on the **highest-leverage, fastest-payback** channel: boutique executive coaches. We will build the referral infrastructure, develop partner enablement materials, and establish pilot partnerships that generate $15K+ MRR with minimal marketing spend.

**Why this matters:**
- B2C channel has hit natural user acquisition limits (organic search + word-of-mouth from executives)
- Coach referral channel offers 3-4x higher profit margins (79-80% gross margin vs 91% B2C, but coaches handle acquisition)
- Coaches are the natural distribution channel for job search tools—they already recommend alternatives but lack a best-of-breed option
- First pilot can be live by Sprint 4 (September 2026); first revenue by Q4 2026

**Business Impact:**
- Year 1 B2B Target: 15 coach partners → 150 active seats → $4,500/month MRR
- Year 2 Target: 50 coaches + 3-5 outplacement firms → $18K MRR
- Gross profit on B2B channel: 79-80% (vs 91% B2C), allowing for partner commissions at 20%

---

## What We're Building

### Phase 1: Coach Referral Infrastructure (Sprint 3-4)
**Deliverables:**
1. **Referral code system** — unique tracking codes for each coach partner
   - Dashboard to generate codes
   - Code-based attribution in onboarding flow
   - Real-time attribution reporting

2. **Partner dashboard** — coach view of their referred clients
   - List of active/inactive clients with usage metrics
   - Revenue attribution and commission tracking
   - Messaging templates for coach outreach

3. **Conversion flow** — referral → signup → payment
   - Branded onboarding for referred users
   - Auto-assignment to coach in platform
   - First value delivery in <5 minutes

4. **Commission structure & legal**
   - Payment model: 20% of subscription revenue (or $79 seat fee — coach's choice)
   - Partner agreement template
   - Monthly commission reporting + payment via Stripe

### Phase 2: Coach Enablement & Pilot Outreach (Sprint 4-5)
**Deliverables:**
1. **Coach messaging & positioning**
   - Positioning deck (1-pager)
   - Case studies from users in active search
   - ROI calculator showing client outcomes
   - Messaging guidelines for coach's own promotion

2. **Pilot partner recruitment**
   - Identify 10 target coaches (LinkedIn search + qualification)
   - Outreach sequence template
   - Pilot program terms (3 free seats for 90 days)

3. **Pilot success metrics**
   - Track coach engagement: onboarding help requests, client activation rate
   - Collect coach feedback: what works, what's missing
   - Document coach's language about the product (becomes onboarding copy)

4. **Case study capture**
   - Interview 3-5 coaches during pilot
   - Document client outcomes (landing timeline, placement quality)
   - Permission to quote coaches in positioning

### Phase 3: Outplacement Firm Expansion (Sprint 6-7)
**Deliverables:**
1. **Seat management & assignment**
   - Admin dashboard to manage seat pool
   - Client assignment workflow (firm → seat → email sent)
   - Usage reporting by assigned client

2. **Co-brand & white-label foundation**
   - Customizable branding (logo, colors, domain)
   - White-label email templates for firm's branding
   - Firm-specific onboarding flow with firm logo

3. **Enterprise contract & terms**
   - Seat pricing: $350/engagement (3-6 month job search)
   - OR monthly subscription model: $500/month per 10 seats
   - SLA: uptime, support response time
   - Data security & privacy terms

---

## Why This Sequence Matters

### Coaches First (Not Enterprise)
We have three B2B buyer types. We're pursuing coaches first because:

1. **Fastest sales cycle** — independent coaches make decisions same day, no procurement
2. **Lowest implementation overhead** — coaches already know job search, don't need training
3. **Highest feedback density** — coaches work with 3-5 clients per session; feedback is immediate
4. **Lowest initial revenue but highest operational margin** — $39.80 per subscriber per month, but acquisition cost is near zero

### Why Not Enterprise HR First?
- 6-18 month sales cycle
- Requires SOC 2, legal review, security questionnaires
- Enterprise buys outplacement as commodity (price-driven, not quality-driven)
- Need 500+ individual users + 20 coach partners as proof before enterprise conversations

### The Path to Enterprise
500 individual users → 20 coach partners → 3-5 outplacement firms → 1-2 enterprise references → enterprise HR conversations

We're at step 1 (70 users). Coaches unlock steps 2-3. Enterprise is a 2027 conversation.

---

## Success Criteria (End of Q3 2026)

### Functional Completeness
- [ ] Referral code generation & tracking working end-to-end
- [ ] Coach dashboard showing referred clients + usage + attribution
- [ ] Commission tracking & reporting infrastructure live
- [ ] Partner onboarding flow tested with 1-2 pilot coaches
- [ ] Case studies captured from first 3 pilot partners

### Revenue & Traction
- [ ] 3-5 coach pilots active with 15+ referred clients total
- [ ] $0 → $500/month MRR from referrals (pilot phase)
- [ ] First partner ready to convert to paid referral deal by October 2026

### Operational Readiness
- [ ] Partner agreement template ready for legal review
- [ ] Commission payment system proven (first monthly payout scheduled)
- [ ] Support playbook for common coach questions documented

---

## Team Assignment & Responsibilities

**Project Lead:** Chris Goodwin  
**Engineering:** [Developer TBD for Phase 1]  
**Product:** [Product Manager TBD for phase prioritization]  
**Sales/Partnerships:** Chris Goodwin (coach outreach)  
**Support/Enablement:** [Support lead TBD for case study capture]

---

## Budget Impact

- **Development cost estimate:** 120 engineering hours (Phases 1-2)
- **Third-party costs:** Stripe for payment processing (3.5% + $0.30), Postmark/SendGrid for email (minimal)
- **Payback timeline:** $500-1,000 MRR by Q4 → payback within 3 months of first revenue

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Coaches don't value referral model | Test both: commission (20%) and flat fee ($79/seat) — coaches choose |
| Referral code leakage / abuse | Rate-limit code generation, monitor for suspicious patterns |
| Commission payment delays frustrate partners | Automate weekly commission reporting + monthly payment via Stripe |
| Pilots don't convert to paid | Include conversion offer in pilot agreement (e.g., 50% off first 3 months) |
| Product missing coach use case | Monthly check-ins with pilots (30-60-90 days) to surface gaps early |

---

## Next Steps (Week of June 25)

1. **Confirm Chris as project lead** ✓
2. **Prioritize Phase 1 deliverables** → assign to engineering
3. **Identify target coach outreach list** → begin LinkedIn research
4. **Document coach feedback template** → prepare for pilot calls

---

*This plan aligns with Year 1 financial model ($15K MRR from coach channel by year-end) and positions Starting Monday to scale B2B distribution while preserving unit economics and founder involvement.*

**Revision history:**
- v1.0 — 2026-06-25 — Initial plan from business strategy + B2B strategy + automation strategy docs
