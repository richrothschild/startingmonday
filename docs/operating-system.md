# Starting Monday — Internal Operating System

*The founder's operating system becomes the company's operating system. Write it down before it scales. Clarity now prevents drag later.*

---

## 1. Mission Statement (Product Level)

Starting Monday gives technology executives the intelligence and infrastructure to run a disciplined search campaign — the way a search firm runs one — before the role is ever posted, before the search is ever authorized, and before anyone else knows to be in the room.

The measure of success is not engagement. It is placed executives who land faster, at better levels, with more options than they would have had without the product.

---

## 2. Current Priorities (Updated quarterly — last updated May 2026)

Three priorities at a time. Nothing else is priority one.

1. **Activation quality** — identify the one action that predicts 30-day retention and make it happen in the first session. Current hypothesis: first signal alert viewed OR first brief generated.
2. **Privacy guarantee visible before paywall** — employed-status users (Arc 2) are not converting because the employer privacy answer isn't findable. Fix before the next 50 signups.
3. **B2B channel conversations** — five executive coach conversations in 30 days. Peer curiosity, not pitch. This is a founder action, not a product build.

---

## 3. Decision Rights

| Decision type | Who decides | Who is consulted |
|---------------|------------|-----------------|
| Product features: scope and priority | Rich | Chris (engineering feasibility) |
| Product features: build vs. defer | Rich | Decision log kill criteria |
| Copy and positioning | Rich | Sales & Marketing council review |
| Pricing changes | Rich | Revenue & Economics council review |
| Engineering architecture | Chris | Rich (product impact) |
| B2B partnerships: initiate conversation | Rich | None required |
| B2B partnerships: sign agreement | Rich | Legal review if > $10K |
| Hiring | Rich | Chris (if engineering role) |

When in doubt, the decision belongs to Rich. The operating principle is single-threaded ownership: one person responsible for each area, not consensus by committee.

---

## 4. Weekly Cadence

**Monday**
- Review the week's metrics: signups, activations, upgrades, churn events, stall nudge clicks
- Set the week's three most important actions (one per priority)
- Check decision log for any bets approaching review date

**Tuesday (Chris sync — 8am PT)**
- Engineering status: what shipped, what is blocked, what is next
- Any technical debt or architecture concerns before next feature sprint
- Review any open issues or production errors

**Thursday**
- Content and outreach review: any blog drafts, LinkedIn posts, coach outreach follow-ups
- B2B pipeline: any coach conversations to schedule or follow up

**Friday**
- What shipped this week
- What didn't ship and why
- One thing to carry into Monday

---

## 5. What We Measure (Monthly Review)

Run this review on the first Monday of each month. Takes 30 minutes.

| Metric | Where to pull it | What healthy looks like |
|--------|-----------------|------------------------|
| MRR | Stripe / Railway | Growing month-over-month |
| MRR by tier | Stripe | Monitor: ~20%, Active: ~60%, Executive: ~20% |
| New signups | Supabase users table | Growing week-over-week |
| Activation rate | PostHog | >= 40% complete first key action in session 1 |
| 30-day retention | PostHog cohorts | >= 50% of paid users active at day 30 |
| Monitor → Active upgrade rate | Supabase | >= 15% within 60 days |
| Churn rate | Stripe | < 5% monthly |
| Stall nudge click-through | PostHog | >= 10% |
| Blog-sourced conversions | UTM → Supabase | Trending up |
| B2B referral activations | Manual tracking | Increasing quarter-over-quarter |

**One question to end every monthly review:** What is the one decision we made last month that we would make differently today? Write the answer in the decision log.

---

## 6. What We Do Not Do

These are explicit standing decisions, not open questions.

- We do not build a recruiter marketplace. The trust model requires that no recruiter can see a user's data without explicit user action.
- We do not sell or share user data with any third party for any purpose.
- We do not build comp data infrastructure for Arc 8 offer evaluation. The data quality risk is too high and the trust cost of a wrong number is irreversible.
- We do not chase engagement metrics (daily active users, time on site). The goal is outcomes: signals seen before posting, conversations had before search opened, days to placement.
- We do not add features to the Executive tier without a clear transformation statement. Features without transformation language are just Active + cost.

---

## 7. How Chris Goodwin Works With This System

Chris joins as a pro bono engineering contributor. The operating principles for his engagement:

- **One active sprint at a time.** Rich and Chris agree on the sprint scope at Tuesday sync. No scope creep mid-sprint.
- **Architecture decisions documented.** Any decision that affects the schema, the deploy process, or a key component gets a comment in the decision log or a brief Slack/email note.
- **Design system followed.** Orange-500 on slate-900. See [design system doc](design-system-notes.md) before building new UI.
- **Commit and push after every change.** Railway auto-deploys. No local-only changes left overnight.

---

## 8. The Flywheel

The compounding loop Starting Monday is building toward:

**Individual:** Executive uses the product → lands faster → tells peers → peers sign up
**B2B:** Coach sees client land faster → refers next client → becomes a channel partner
**Network:** More executives tracked = richer signal quality = better results = stronger referral intent

The flywheel accelerates if every placed executive is asked to refer one peer within 30 days of placement. This is the single highest-leverage retention and acquisition action in the product. The placed page is the trigger. Make it count.

---

## 9. Council Review Cadence

Full council review runs quarterly on all major product decisions and copy changes.

| Council | When to use |
|---------|------------|
| Sales & Marketing | Before any landing page, blog post, or major copy change |
| Behavioral Economics | Before any onboarding or retention flow change |
| UI/UX | Before any new screen or component |
| Revenue & Economics | Monthly metrics review |
| Software & SRE | Before any cron job, email system, or schema change |
| Outreach Sales | Before any B2B outreach sequence |
| BD Partnerships | Before any partner conversation or agreement |
| Decision Management | Quarterly decision log review |
| Executive User | Before any major onboarding or product path change |

---

*Last updated: May 2026. Review and update quarterly.*
