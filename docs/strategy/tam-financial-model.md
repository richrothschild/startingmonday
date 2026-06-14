# TAM + Financial Model

> Market sizing, unit economics, and revenue scenarios for Starting Monday — including B2B channel.

---

## The market

**Target customer:** Senior technology and operations executives — CIOs, CTOs, CDOs, CISOs, COOs, CPOs, VPs of Technology — at companies above $100M revenue. Actively searching, or within 6 months of active search.

### Market sizing

| Layer | Definition | US estimate |
|-------|-----------|-------------|
| TAM | All senior tech/ops executives (VP+) at $100M+ companies | 60,000 – 100,000 |
| SAM | Those who would pay for a self-directed digital search tool | 12,000 – 25,000 |
| SOM active at any time | In active search (3-9 month duration, 15-20% annual turnover) | 2,000 – 7,000 |

Global (English-speaking + EU): roughly 3x US estimates.

Annual flow: 9,000 – 20,000 US executives enter search each year. Average duration 6 months means ~4,500 – 10,000 are in search at any given moment. The SAM of those who self-direct their search and will pay for tooling is 20-35% of that range.

---

## Individual subscriber scenarios

**Blended ARPU assumption:** 65% Search ($199), 25% Intelligence ($49), 10% Executive ($499)

0.65 × $199 + 0.25 × $49 + 0.10 × $499 = $129.35 + $12.25 + $49.90 = **$191.50/mo blended**

| Scenario | Subscribers | Blended ARPU | MRR | ARR |
|----------|-------------|-------------|-----|-----|
| Breakeven (no salary) | 25 | $191.50 | $4,787.50 | $57,450 |
| Ramen profitable | 100 | $191.50 | $19,150 | $229,800 |
| Solo founder comfortable | 250 | $125 | $31,250 | $375,000 |
| First hire viable | 750 | $125 | $93,750 | $1,125,000 |
| Series A territory | 2,500 | $140 | $350,000 | $4,200,000 |

---

## B2B channel scenarios

The B2B channel runs alongside individual subscriptions and multiplies ARR without requiring proportional headcount.

### B2B model 1: Coach referral (20% commission)

| Partners | Clients each | Subscribers | Gross MRR | Commission (20%) | Net MRR |
|----------|-------------|-------------|-----------|-----------------|---------|
| 5 | 8 | 40 | $5,160 | $1,032 | $4,128 |
| 15 | 10 | 150 | $19,350 | $3,870 | $15,480 |
| 30 | 12 | 360 | $46,440 | $9,288 | $37,152 |

### B2B model 2: Seat licensing (outplacement firms, $89/seat/mo)

| Firms | Avg seats | Subscribers | MRR | Notes |
|-------|----------|-------------|-----|-------|
| 3 | 25 | 75 | $6,675 | Pilot tier |
| 10 | 40 | 400 | $35,600 | Growth |
| 25 | 50 | 1,250 | $111,250 | Scale |

### Combined individual + B2B scenario (18-month target)

| Channel | Subscribers | MRR | ARR |
|---------|-------------|-----|-----|
| Individual | 400 | $48,400 | $580,800 |
| Coach referral (15 partners) | 150 | $15,480 net | $185,760 |
| Outplacement seats (3 firms) | 75 | $6,675 | $80,100 |
| **Total** | **625** | **$70,555** | **$846,660** |

Crossing $1M ARR is achievable by month 20-22 with both channels running.

---

## Cost structure

**Variable cost per user per month:**

| Cost | Per user/mo | Notes |
|------|------------|-------|
| Anthropic API | $2 – $6 | Daily briefing + on-demand features; Executive users higher |
| Resend (30 emails) | $0.03 | Near-zero |
| Crunchbase (per scan) | $0.10 – $0.50 | Varies with pipeline size |
| Supabase | $0.05 | Storage + compute |
| **Total variable** | **$3 – $8** | Conservative to high usage |

**Fixed infrastructure (under 500 users):**

| Service | Monthly |
|---------|---------|
| Railway (worker + web) | $100 – $200 |
| Supabase | $25 – $100 |
| Domain, monitoring, misc | $50 |
| **Total fixed** | **~$300** |

### Gross margin at scale

| Users | Revenue | Variable | Fixed | Total cost | Gross margin |
|-------|---------|----------|-------|-----------|-------------|
| 100 | $12,100 | $500 | $300 | $800 | 93% |
| 500 | $60,500 | $2,500 | $400 | $2,900 | 95% |
| 2,000 | $242,000 | $10,000 | $800 | $10,800 | 96% |

~95% gross margin at scale. Near-zero incremental cost per additional user makes this a highly efficient business model.

---

## Customer acquisition

### CAC by channel

| Channel | CAC | Notes |
|---------|-----|-------|
| Referral / invite system | $0 – $25 | Highest quality, lowest cost |
| Blog / SEO | $50 – $200 | Compounding, builds moat |
| Manager Tools partnership | $50 – $150 | If endorsement converts |
| LinkedIn content (Liz) | $100 – $400 | Depends on conversion rate |
| Paid search / LinkedIn ads | $500 – $2,000 | Executive audience is expensive |

### LTV by tier

Average search duration: 6 months. 20% of users retain at Intelligence tier post-placement.

| Tier | Monthly | 6-month LTV | With 20% retention (10 mo avg) |
|------|---------|------------|-------------------------------|
| Intelligence | $49 | $294 | $392 |
| Search | $199 | $1,194 | $1,592 |
| Executive | $499 | $2,994 | $3,992 |

At Search tier, a $200 CAC payback period is 1.5 months. Strong unit economics across all acquisition channels.

---

## Time to $1M ARR

$1M ARR requires approximately 690 individual subscribers at $121 blended ARPU, or fewer with B2B channel supplementing.

| Growth rate | Months to $1M ARR (individual only) |
|-------------|-------------------------------------|
| 15/month | 46 months |
| 30/month | 23 months |
| 60/month | 12 months |
| 60/mo individual + 2 outplacement deals | 8 months |

The 30-60 individual/month range is realistic with content, referral, and partner channels working together.

---

## Annual billing impact

Adding annual plans (2 months free = 17% discount) improves LTV and reduces churn risk for committed searchers.

| Tier | Monthly | Annual | ARR per subscriber |
|------|---------|--------|-------------------|
| Intelligence | $49/mo | $490/yr | +$98 vs monthly |
| Search | $199/mo | $1,990/yr | +$398 vs monthly |
| Executive | $499/mo | $5,000/yr | +$1,008 vs monthly |

If 30% of subscribers convert to annual at sign-up: meaningful ARR pull-forward and ~30% lower expected churn in that cohort.

---

## Summary judgment

The business reaches profitability at 25-30 subscribers. It reaches comfortable solo-founder income at 250. The B2B channel multiplies ARR without requiring proportional headcount. The constraint is not unit economics — it is growth rate. Referral, content, and partner channels are the right bets. Paid acquisition waits until ARPU increases or a referral network de-risks the CAC.

---

*Last updated: 2026-05-08*
