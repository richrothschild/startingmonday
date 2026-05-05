# Starting Monday — Pricing and Packaging Rationale

**Internal document** | May 2026

---

## Pricing Philosophy

Starting Monday is priced to reflect value to the buyer, not cost to produce. The cost of a mis-positioned executive search — the wrong role, the wrong level, the wrong comp — is measured in months of runway and hundreds of thousands of dollars in foregone earnings. Against that, $199/month is a rounding error.

The pricing decision is therefore not "what is fair?" but "what is the right signal?" A price that is too low signals that the product is not confident in its value. A price that is too high creates a barrier before the user has experienced the product.

**The free trial resolves the barrier problem.** 30 days at full Active access, no credit card. The trial converts on demonstrated value, not on selling. If the product does not produce a moment of "this is exactly what I needed" within the trial, the price is not the problem.

---

## Current Pricing

| Plan | Monthly | Quarterly | Notes |
|------|---------|-----------|-------|
| Passive | $49 | $132 | 10% quarterly discount |
| Active | $199 | $537 | 10% quarterly discount |
| Executive | $499 | Waitlist | No quarterly pricing yet |
| Campaign | $999 | 3-month minimum | Effectively $2,997 commitment |

---

## Plan-by-Plan Rationale

### Passive — $49/month

**Who it is for**: Senior professionals who are monitoring but not actively searching. The "not looking but Sunday nights feel different" persona. Also: early-stage active candidates who are not yet ready to commit to the full suite.

**Why $49**: Below the psychological "significant expense" threshold for a professional earning $200K+. This is less than one restaurant dinner. It should be an easy yes — something purchased without a long consideration cycle. The objective is low-friction entry and a large funnel.

**What it must do**: Prove the monitoring value quickly. If a scan result surfaces a relevant role within the first two weeks, the user understands what they are paying for. If nothing fires in 30 days, there is a churn risk. Onboarding should prompt users to add enough target companies (10+) that the probability of at least one scan result in the first two weeks is high.

**Why not lower**: Below $49, the product starts to feel like a commodity. The positioning is "infrastructure for a serious search" — that framing cannot coexist with a $9.99/month price.

**Quarterly discount ($132)**: $15 savings is a small number but the commitment is the point. A user who has committed to a quarter is a user who has decided they are going to use this. Quarterly billing also meaningfully reduces payment processing overhead and improves cohort revenue predictability.

### Active — $199/month

**Who it is for**: Executives in active search who need the full suite: briefs, strategy, chat, outreach, resume tailoring, daily briefing.

**Why $199**: The Active plan is priced to reflect what a high-quality outplacement firm charges for comparable outputs. A single 2-hour session with an executive career coach runs $250–$500. Starting Monday at $199/month produces a strategy brief, daily monitoring, and prep briefs for every conversation — effectively replacing dozens of hours of preparation work per month.

More importantly: at $200K–$1M annual comp, $199/month is 0.12–0.02% of compensation. The financial math does not require justification. The only question is whether the product delivers. The trial answers that.

**Why not lower**: $99/month was considered. The argument against it: (a) it would require 2x the subscribers to reach the same ARR, increasing CAC pressure; (b) it may signal less confidence in the product; (c) the target user's financial sensitivity to $99 vs. $199 is functionally zero. A CIO who has decided this is valuable is not making the decision based on $100/month.

**Why not higher**: $299/month was considered. At $300, the product crosses into a "real budget line item" category that may require spousal or financial conversation. $199 stays below that threshold for most users. Also, the Passive-to-Active upsell ($49 → $199) is already a 4x jump; stretching it to 6x may introduce friction in the upgrade flow.

**Quarterly discount ($537)**: Same rationale as Passive. $39 savings, commitment is the value.

### Executive — $499/month (Waitlist)

**Who it is for**: C-suite candidates managing a high-stakes, narrow-target search with board-level and PE-firm involvement. The transformation CIO, the board-track CFO, the CEO who is not publicly visible as a candidate.

**Why $499**: This tier serves a qualitatively different search than Active. The companies being targeted are not on LinkedIn. The intelligence required is board composition, PE portfolio transitions, and relationship signals that are not in public databases. The prep brief for a PE-backed board interview requires a different depth than a direct-hire corporate interview.

$499 also signals a premium tier before we have launched it — users on the waitlist have self-selected as willing to pay this. It validates the tier before a single seat is sold.

**What it must include when launched**: Board and PE firm intelligence is the defining feature. Unlimited pipeline matters at this tier (a transformation CIO may be watching 50+ organizations). Priority brief generation (Opus model access without queue delay) is a small but meaningful quality signal.

### Campaign — $999/month (3-month minimum)

**Who it is for**: The executive for whom the search is a full-time commitment and where human judgment and introductions matter as much as AI infrastructure. Limited availability — this is a high-touch offering.

**Why $999**: This is at the low end of executive coaching and career transition services. Executive outplacement at this level runs $15,000–$50,000 for a 6–12 month engagement. Starting Monday Campaign at $999/month for 3 months is $2,997 — less than a single month of traditional outplacement, with a better technology component and a more personalized human layer.

**The constraint**: Campaign cannot scale until there is human infrastructure to deliver it. The waitlist is real — this is not a marketing device. The 3-month minimum exists because the outcome (an offer) typically requires 3+ months, and there is no value in a Campaign engagement that terminates before the search completes.

---

## Free Trial Design

**30 days, full Active access, no credit card.**

This is a significant commitment — $199 of product value given freely. The logic:

1. The trial conversion happens when the user experiences the prep brief. The first time they read a brief that knows both the company and their background, they convert. This typically happens in the first week.

2. A credit card gate reduces trial volume by 30–50% and does not improve the quality of trials that convert. The user who creates an account with a credit card on day 1 is not more likely to convert than the user who doesn't — they are just more likely to forget to cancel.

3. At the executive level, a credit card gate sends the wrong signal. "We don't trust you to cancel if it's not for you" is the opposite of the message.

**Trial → Paid conversion target**: 30% of trial starts. At 30 days of Active access, a user who has not converted by day 28 is a user who did not find the value. The email sequence (day 7, day 21, day 27) should be designed to surface value moments, not apply conversion pressure.

---

## Pricing the B2B Channels

### Outplacement / Bulk

Volume pricing for institutional bulk access. The logic:

- Retail Passive is $49. At 10+ seats, a $35–40/seat/month price gives the institution a meaningful margin to bundle into their program and still makes economic sense for Starting Monday.
- The institution buys; the executive uses. This removes the friction of individual purchase decisions (the executive in transition may be financially cautious; removing the billing question removes a conversion barrier).
- At volume, the CAC advantage of the institutional channel (zero marketing spend, large cohorts) justifies the lower per-seat margin.

### Referral Program

One free month for the referrer, one month added to the referee's trial. The cost of one free month at Active pricing is $199 against a LTV of $1,600+ — a 12% acquisition cost on a referral that is already self-qualified.

---

## What We Will Not Do

**Discounts on demand**: If a user asks for a lower price, the answer is "here's how the trial works." Discounting to retain a prospect who has not yet experienced the product signals that the price is negotiable and the value is uncertain. Neither is true.

**Freemium with meaningful caps**: The Free tier (pipeline + contacts only) exists for technical reasons (auth, onboarding flow) but is not marketed as a sustainable state. It exists to keep the onboarding door open, not to build a large free user base.

**Race to the bottom on the Passive tier**: $49 is the floor. If anything, the Passive tier may move to $59 or $69 as the product adds scanning depth and signal quality. The direction of pricing is up, not down, as the product proves its value at scale.

---

## Pricing Evolution

**Near-term**: Passive and Active pricing are stable. The priority is finding the trial → paid conversion rate that validates the price point. If conversion is above 35%, the product is underpriced. If below 20%, there is either a product problem or an onboarding problem — not a price problem.

**12-month**: Executive and Campaign tier launches from waitlist. If the waitlist has 50+ users, both tiers launch simultaneously. If fewer, Executive launches first.

**24-month**: Consider an annual billing option (10 months for the price of 12) for users who are not in active search but want to maintain Alumni mode or passive monitoring on a longer horizon.

**36-month**: B2B channel pricing formalized. Outplacement integration pricing may move to per-seat-per-year rather than monthly to match the institutional billing cycle.
