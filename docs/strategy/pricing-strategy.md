# Pricing Strategy

> Canonical buyer psychology and pricing-packaging reference for Starting Monday.
> Live prices must match `src/lib/pricing.ts`. Public naming may differ from internal keys.

---

## Canonical rule

`src/lib/pricing.ts` is the live source of truth for price values.

Public plan naming:
- `passive` -> Intelligence
- `active` -> Search
- `executive` -> Executive
- `concierge` -> Concierge

Public pricing ladder:

| Tier | Monthly | Annual | Internal key | Public status |
|------|---------|--------|--------------|---------------|
| Intelligence | $49 | $490 | `intelligence` | Public |
| Search | $199 | $1,990 | `active` | Public |
| Executive | $499 | $5,000 | `executive` | Public |
| Concierge | $499 | $4,990 | `concierge` | Non-primary / invite-led |

Why this naming:
- Intelligence describes the low-urgency monitoring buyer clearly.
- Search is the clearest external name for the core active campaign tier.
- Executive signals deeper coverage and higher-stakes readiness.
- Concierge remains a controlled offer and should not confuse the public three-plan ladder.

---

## The trigger analysis

"Being in executive job search" is not a trigger. It is a state. The specific events that create purchase motivation:

1. **Involuntary event** — Layoff, restructuring, board decision. High urgency. High emotional stress. Willingness to pay is high because the cost of inaction is visible and immediate. This buyer acts fast.

2. **Slow-burn realization** — "My company is going nowhere and I have been saying that for a year." Lower urgency but higher frustration. These buyers search at night, tentatively. They do not want to feel like they are in search.

3. **Opportunity trigger** — A recruiter called. A former colleague just got a CIO role. A board change created an opening at a target company. High motivation, short decision window.

4. **Pride trigger** — A peer lands a better role than expected. The executive watches someone less qualified get the position they wanted. High emotion, self-directed energy.

Marketing language should be written for triggers 1 and 4. Those convert at the highest rate. The product copy should speak to control (trigger 1) and competence (trigger 4).

---

## Jobs to be done

**Functional job:** Monitor target companies, get alerted to relevant signals, track outreach and follow-ups.

**Emotional job:** Feel like you are running a disciplined, professional search rather than waiting for the phone to ring.

**Social job:** Be the kind of executive who handles career transitions with composure and method, not anxiety and chaos.

The emotional and social jobs carry the most pricing weight. People pay premium prices to resolve emotional pain, not to access functional features. "$199/month" is not for monitoring software. It is for feeling like a professional running a professional process.

The same logic applies now at the current ladder.
The Search tier is not priced as a software utility.
It is priced as the daily operating layer for a high-stakes search.

---

## Price anchoring

The buyer's brain compares this to other options:

| Comparison | Price | Implication |
|------------|-------|-------------|
| Executive coach | $300 – $500/hour | $199/mo = still below one hour |
| Career consultant (resume review) | $400 – $800 | Less than a single session |
| LinkedIn Premium Career | $59.99/mo | ~3x the price, materially stronger outcome promise |
| Retained search firm | 30% of year-1 comp | Frames the stakes; hired by employer |
| Executive peer coaching program | $500 – $2,000/mo | In-category premium anchor |

**The anchor sentence that belongs on the pricing page:**

> "$199 a month is still less than a single hour with an executive coach. Starting Monday runs every day."

This sentence should appear above or adjacent to the plan cards. It makes the Search tier feel inexpensive rather than premium.

---

## Tier psychology critique

### Intelligence ($49)
The name is correct. It signals "I want market awareness" without implying active search posture. This is the right framing for: (a) executives in slow-burn mode, and (b) post-placement users who want to stay informed about their market.

The risk: Intelligence tier attracts intelligence buyers who will not engage deeply and will churn at the search-end cohort without generating a testimonial. Consider building a retention path that keeps landed executives on Intelligence at a symbolic price point ($29/mo or $290/yr) after they mark their search complete.

### Search ($199)
The strongest tier in the product. Search is the clearest external name for the core active campaign tier. The copy should reinforce the commitment this requires: "This tier is for executives running an active search. If you are not sending outreach this week, you will not get full value."

This is the tier to feature as "Most popular" on the billing page. The Search tier is the core product.

### Executive ($499)
The name creates an identity anchor — "I am on the Executive plan" — which works for this audience. The incremental features need to be framed as outcomes, not features:
- Not "advanced scanning" — "Know about the opening before it is posted"
- Not "Opus AI for prep briefs" — "Interview prep written at the standard a retained search partner would expect"
- Not "salary intelligence" — "Walk into the compensation conversation knowing what they paid the last person in this role"

### Concierge ($499)
Concierge should not sit as an equal public-plan alternative unless the offer is clearly differentiated from Executive. Right now the role of Concierge is operationally different, not psychologically clearer. Treat it as an invite-led or context-led offer until the value proposition is cleaner on the public page.

---

## Changes to make

### 1. Keep annual billing live and governed

Annual plans are already live. Keep them aligned to the canonical ladder and treat annual display order as an experiment, not a guess.

| Tier | Monthly | Annual | Savings |
|------|---------|--------|---------|
| Intelligence | $49/mo | $490/yr | 2 months free |
| Search | $199/mo | $1,990/yr | 2 months free |
| Executive | $499/mo | $5,000/yr | ~2 months free |

Decision to make via experiment:
- default annual view
- or default monthly view with annual savings adjacent

### 2. Keep the anchor sentence aligned to current pricing

Place this above the plan cards:

> "One hour with an executive coach runs $300 to $500. Starting Monday is $199 a month and runs every day."

### 3. Post-placement retention path (Sprint 6)

When a user marks their search as complete, offer a transition to Intelligence at $29/mo (or $290/yr). This keeps them in the product, creates longitudinal relationship data, and positions them to reactivate when the next search begins.

### 4. Featured plan in billing UI

The billing client should continue featuring Search as "Most popular" rather than Executive. Executive is the upgrade, not the anchor.

### 5. Pricing governance rule

No strategy or marketing document should state public prices without matching `src/lib/pricing.ts`.
When prices change:
1. update `src/lib/pricing.ts`
2. update pricing UI copy
3. update this document
4. update any coach or business-plan references that state the ladder explicitly

---

## The repeatable sentence

The most important pricing output is not the price — it is the sentence a happy customer uses to describe the product to a peer. This sentence drives word-of-mouth and referral conversion.

Current description: "AI-powered search management platform for senior executives." Accurate, forgettable.

Better: "Every morning it tells me what happened at my target companies yesterday and what I should do about it."

That sentence is repeatable. Executives will say it verbatim to peers. That is the referral engine.

---

*Last updated: 2026-06-13*
