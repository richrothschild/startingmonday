# Starting Monday — Decision Log

Owner: Documentation Operations
Status: active
Last reviewed: 2026-06-07
Review cadence: monthly
Source of truth: yes


A record of every major product bet: the assumption it rests on, the success metric, the kill criterion, and the review date. Reviewed quarterly. Decisions are not evaluated on outcomes alone — a good decision can have a bad outcome, and a bad decision can get lucky.

---

## How to use this log

| Column | What it means |
|--------|---------------|
| **The bet** | The decision made — product, pricing, positioning, or strategy |
| **Assumption** | The belief about user behavior this bet rests on |
| **Success metric** | The observable outcome that confirms the bet is working |
| **Kill criterion** | The threshold at which we stop or reverse the decision |
| **Review date** | When we look at the data and decide whether to continue |

Add a row when making any decision that costs more than a week of effort or that will be hard to reverse.

---

## Current Bets

### 1. Three-tier pricing (Monitor / Active / Executive)
**Bet:** Executives in different arcs are willing to pay different amounts based on their urgency and feature depth.
**Assumption:** Monitor ($49) converts watcher-path users; Active ($199) is the primary revenue tier; Executive ($499) is an aspirational anchor that makes Active feel reasonable.
**Success metric:** Monitor → Active upgrade rate >= 15% within 60 days. Executive tier converts at least 5% of Active subscribers.
**Kill criterion:** Monitor → Active upgrade rate < 8% at 90 days OR Executive tier generates < 3% of MRR at 6 months.
**Review date:** 2026-08-01

---

### 2. Monitor tier as entry and retention layer (Arc 1/2 and Arc 9)
**Bet:** Employed executives who are not actively searching will pay $49/month to watch target companies quietly. Placed executives will stay on Monitor rather than churning completely.
**Assumption:** The identity distinction between "watching" and "searching" is large enough that executives who would not pay for a search tool will pay for an intelligence tool.
**Success metric:** Watcher-path users retain at Monitor for 4+ months. Placed executives switch to Monitor at rate >= 25%.
**Kill criterion:** Watcher-path 90-day retention < 30% OR placed → Monitor conversion < 10%.
**Review date:** 2026-09-01

---

### 3. Arc system as the product operating model
**Bet:** Senior executives experience job search as a series of distinct identity states, and meeting them at the right state with the right message is more effective than generic urgency copy.
**Assumption:** Arc-calibrated copy (blog CTAs, stall nudges, SITUATIONS cards, onboarding paths) produces meaningfully higher activation and retention than generic messaging.
**Success metric:** Users who enter through arc-specific blog posts (not direct) show 30-day retention >= 10 percentage points higher than direct-arrival users.
**Kill criterion:** No measurable difference in retention by arc entry path at 90 days.
**Review date:** 2026-09-01

---

### 4. search_path derivation from onboarding data (no additional question)
**Bet:** Inferring the user's path (campaign / nurture / watcher) from existing onboarding data (employment_status + search_timeline) produces better path assignment than self-selection.
**Assumption:** Executives would select the wrong path if self-selecting (paradox of choice, reactance, underestimating urgency).
**Success metric:** search_path-to-retention correlation: each path's 30-day retention is meaningfully different, confirming path differentiation is real.
**Kill criterion:** All three paths show identical 30-day retention, suggesting the path differentiation adds no value.
**Review date:** 2026-08-01

---

### 5. Stall detection via pattern analysis (not self-reported)
**Bet:** Automatically detecting stall patterns from behavioral data (companies, contacts, stage advancement, days inactive) and serving a pattern-specific diagnostic is more effective than waiting for self-reported problems.
**Assumption:** Executives in Arc 6 (mid-search plateau) will not self-identify as stalling. The root cause is usually positioning anxiety (empty positioning summary = don't know what to say).
**Success metric:** Users who receive a stall nudge email and click through show resumed activity within 7 days at rate >= 25%.
**Kill criterion:** Stall nudge click-through rate < 5% OR re-activation rate after nudge < 10% at 90 days.
**Review date:** 2026-08-01

---

### 6. Blog-to-arc acquisition model
**Bet:** Arc-calibrated blog content (each post mapped to a specific career journey state) will generate higher-quality leads than generic executive career content.
**Assumption:** Executives searching at 10pm for "how CIOs find jobs" or "PE-backed CIO" are in Arc 1/2 and will respond to identity-based CTAs ("You know this. Here is the system.").
**Success metric:** Blog-sourced users show 30-day paid conversion >= 8% (vs. direct arrival baseline TBD).
**Kill criterion:** Blog conversion < 3% at 6 months with at least 500 blog-sourced signups.
**Review date:** 2026-10-01

---

### 7. B2B channel as scale layer (executive coaches, search firms, PE networks)
**Bet:** Individual subscriptions prove value and build brand. B2B channels (executive coaches, retained search firms, PE operating partner networks, outplacement firms) create scale economics. One coach with 20 clients/year in transition is worth more than 20 individual acquisitions.
**Assumption:** Executive coaches are trusted enough by their clients that a coach recommendation has a conversion rate > 50%. Search firms will pay for candidate prep tooling. PE firms will pay for portfolio-wide access.
**Success metric:** 5 B2B referral relationships established by 2026-09-01, generating >= 15 activations per quarter combined. First B2B licensing contract (search firm or PE network) signed by 2026-12-01.
**Kill criterion:** 5+ coach conversations with < 2 referral relationships after 90 days. Revisit B2B motion entirely.
**Review date:** 2026-09-01

---

### 8. Privacy as a purchase condition (Arc 2)
**Bet:** Making the employer privacy guarantee explicit and visible before the paywall removes a material purchase blocker for employed executives in a quiet search.
**Assumption:** Arc 2 users (employed, decision made, building target list quietly) will not convert if they cannot find a clear answer to "can my employer see this" before entering a credit card.
**Success metric:** Employed-status users (employed_exploring) show paid conversion rate >= 10% within 14 days of signup after privacy section is added.
**Kill criterion:** No measurable increase in employed-status conversion 60 days post-privacy-section launch.
**Review date:** 2026-08-01

---

### 9. Discover page (AI company suggestions)
**Bet:** AI-suggested company targets based on the user's profile, target sectors, and existing companies accelerates pipeline building and keeps users engaged between signal cycles.
**Assumption:** Executives struggle to build a complete target list from memory. Suggestions based on their profile surface companies they would have added anyway, reducing the cold-start burden.
**Success metric:** Discover page users add >= 3 companies per session at rate >= 40%. Users who use Discover show 30-day retention >= 15 points higher than non-Discover users.
**Kill criterion:** < 20% of users visit Discover in first 7 days. Discover-added companies are archived at rate >= 50% within 30 days (suggesting poor fit).
**Review date:** 2026-08-01

---

### 10. Proactive intelligence cards on dashboard (Build 1 — pending)
**Bet:** Surfacing company suggestions, contact prompts, and conversation timing recommendations directly on the main dashboard — rather than in a separate Discover page — increases proactive pipeline-building behavior.
**Assumption:** Executives will not navigate to a separate suggestions page consistently. Proactive cards on the primary view change behavior; a separate page does not.
**Success metric:** Dashboard-card-sourced company additions > Discover-page-sourced additions within 60 days of launch. Contact-add rate increases >= 20% in 30 days.
**Kill criterion:** No measurable increase in company additions or contact additions 45 days post-launch.
**Review date:** To be set at launch.

---

### 11. EMI production validation baseline freeze (2026-05-26)
**Bet:** Freezing validation baselines to the current canonical production KPI values provides a stable control point for drift detection and removes false failures from stale published references.
**Assumption:** Weekly KPI snapshots now reflect canonical production truth for all six EMI metrics and should be used as the comparison baseline for ongoing reruns.
**Success metric:** `emi-production-validation-rerun` returns `status=ok`, `mismatchCount=0`, `nullStreakCount=0` on default tolerance after deploy.
**Kill criterion:** Any of the six metrics returns `mismatch` or `null_or_missing` for 2 consecutive weekly reruns without an approved baseline update decision.
**Review date:** 2026-06-30

Evidence (production):

- Weekly snapshot run id: `8d41ddbf-aa19-4045-a3a0-7560972aaa8e`
- Validation rerun id: `5b9def8b-951b-49a7-b3e9-816e30dd32d7`
- Frozen baseline values:

  - `emi_language_adoption_percent`: 100
  - `assessment_completion_percent`: 100
  - `day7_return_percent`: 0
  - `proof_assets_published_count`: 3
  - `b2b_pilot_conversion_percent`: 28.57
  - `tier1_claim_compliance_percent`: 100

Operational decision (seed rows):

- Keep current `EMI Seed Prospect` rows in production as calibration fixtures for weekly EMI validation until tokenized automation lands.
- Revisit removal decision at next review date after secure service-token trigger is in place.

---

## Continuous Improvement Flywheel

Each quarter, run this loop:

1. **Review** — pull metrics for every bet with a review date. Mark each as: Confirmed / Inconclusive / Disconfirmed.
2. **Separate** — for disconfirmed bets, ask: was this a bad decision or a bad outcome? (Use pre-decision reasoning, not hindsight.)
3. **Update** — revise kill criteria or success metrics if the original assumption was sound but the metric was wrong.
4. **Kill** — for bets that hit kill criteria, execute the reversal. Document what you learned.
5. **Promote** — for confirmed bets, extract the validated assumption as an operating principle.
6. **Add** — create a new row for every major decision made in the quarter before the next review.

Decisions that survive three consecutive quarterly reviews become **operating principles** — they no longer need to be tracked as bets.

---

## Operating Principles (Graduated from Bets)

_Empty until first quarterly review._
