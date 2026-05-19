# Starting Monday Product Roadmap (Dalio + Duke Decision Synthesis)

Internal document | May 2026

## Inputs

- docs/product-roadmap-council-vision-compendium.md
- docs/product-roadmap.md
- docs/backlog.md

## Objective

Maximize customer acquisition and retention across B2C and B2B channels while preserving trust, reliability, and unit economics.

## Decision Method

### Dalio Layer (believability-weighted)

- Weight initiative opinions by domain believability.
- Force explicit disagreement and resolve by evidence quality.
- Require decision objects with owner, KPI, review date, and kill criteria.

### Duke Layer (probabilistic portfolio)

- Treat initiatives as bets with expected value and downside.
- Prioritize high-EV reversible bets first.
- Run pre-mortems on irreversible bets.
- Separate decision quality from short-run variance.

### Scoring Dimensions

1. Acquisition impact (B2C + B2B)
2. Retention impact
3. Time to value
4. Reversibility
5. Execution complexity
6. Trust and brand risk
7. Moat contribution

## Strategic Thesis

1. Improve B2C activation depth before broad top-of-funnel scaling.
2. Build repeatable partner-led B2B channels (coaches, search firms, outplacement).
3. Treat reliability and trust as growth features.
4. Invest in compounding moat: signal quality, prep depth, workflow stickiness.

## 12-Month Roadmap

## Phase 1 (0-90 days): Activation and Trust Engine

Primary objective: improve conversion and reduce early churn.

### Bet A1: Six-actions activation system

- Guided checklist and chained prompts.
- Event-level completion tracking.
- KPI: six-action completion in 7 days, trial-to-paid conversion.
- Kill criteria: no lift after two prompt iterations.

### Bet A2: Identity and login friction removal

- Provider-first OAuth UX.
- Always-visible magic-link fallback.
- OAuth password-linking adoption.
- KPI: login success, failed-login recovery completion.
- Kill criteria: no auth-abandonment reduction in 30 days.

### Bet A3: Reliability guardrails as growth insurance

- Keep synthetic coverage and deploy gates strict.
- Continue critical-path reliability hardening.
- KPI: P0 pass rate, change-failure rate, MTTD/MTTR.
- Kill criteria: lead-time penalty without incident reduction.

### Bet A4: Trust-forward positioning refresh

- Reframe around readiness and executive intelligence.
- Tighten landing and pricing copy by persona.
- KPI: landing-to-trial conversion, qualified trials.
- Kill criteria: no conversion gain after controlled tests.

## Phase 2 (3-6 months): Partner-Led Acquisition Flywheel

Primary objective: build repeatable B2B demand channels.

### Bet B1: Executive coach channel system

- Persona-specific coach messaging and demos.
- Referral attribution and partner dashboard.
- KPI: coach-attributed paid users, partner CAC payback.
- Kill criteria: sub-threshold partner conversion after 2-3 sequence revisions.

### Bet B2: Search firm and outplacement pilot tracks

- Partner onboarding kit and pilot scorecard.
- Lightweight seat model before full enterprise integration.
- KPI: active pilots, seat activation, 90-day seat retention.
- Kill criteria: two pilot cohorts below activation threshold.

### Bet B3: Trigger-based outbound playbooks

- Trigger taxonomy and channel-specific outreach sequences.
- Trust-first message architecture.
- KPI: reply rate, meeting-booked rate, qualified pipeline.
- Kill criteria: poor meeting quality or low-signal outbound.

### Bet B4: Decision dashboards and operating cadence

- Segment-level acquisition and retention dashboards.
- Weekly roadmap review with next actions.
- KPI: experiment cycle time, decision lead time, metric clarity.
- Kill criteria: dashboard overhead slows execution.

## Phase 3 (6-12 months): Retention Depth and Premium Expansion

Primary objective: increase LTV and premium conversion.

### Bet C1: Brief quality and personalization loop

- Section regeneration and section-level feedback.
- Context richness and output quality telemetry.
- KPI: brief satisfaction, repeat usage, retention delta.
- Kill criteria: no engagement or retention improvement.

### Bet C2: Premium executive and board workflows

- Readiness and intelligence depth for higher-tier buyers.
- Premium capabilities linked to measurable outcomes.
- KPI: upgrade rate, premium retention, ARPU lift.
- Kill criteria: low adoption with high support burden.

### Bet C3: Post-search retention pathway

- Alumni and reactivation lifecycle with value-led touchpoints.
- Referral loops tied to successful outcomes.
- KPI: alumni retention, referral signups, reactivation rate.
- Kill criteria: low return or referral behavior despite investment.

### Bet C4: B2B operating model hardening

- Standardized partner success playbooks and compliance checks.
- Institutional channel readiness.
- KPI: partner NRR, time-to-value, support load per partner.
- Kill criteria: partner growth degrades service quality.

## Priority Ranking

High priority now:

1. Six-actions activation and auth friction removal.
2. Reliability guardrails and trust positioning.
3. Coach/search/outplacement partner system.
4. Trigger-based outbound relevance engine.

Medium priority next:

1. Premium workflow expansion.
2. Full staging hardening and environment split.
3. Expanded decision analytics.

Hold/defer:

1. Broad network/social features before trust architecture and scale.
2. Adjacent product lines before core retention and partner motion stabilize.

## KPI Stack

### B2C Acquisition

- Visitor-to-trial conversion
- Qualified trial share
- Time-to-first-value

### B2C Retention

- Six-action completion in 7 days
- D30 and D90 retention by cohort
- Weekly active usage on briefing and prep flows

### B2B Acquisition

- Partner-sourced opportunities by channel
- Partner meeting-booked rate
- Pilot-to-paid conversion

### B2B Retention

- Seat activation within 14 days
- 90-day retained seats
- Partner expansion and referral recurrence

### Unit Economics

- CAC payback by channel
- Gross margin by plan/cohort
- NRR by segment

## Governance Cadence

Weekly:

- Review top five active bets.
- Evaluate KPI trend and disconfirming evidence.
- Re-rank if expected value changed.

Monthly:

- Run believability-weighted council review for major pivots.
- Rebalance portfolio across activation, distribution, and retention depth.

Quarterly:

- Keep, scale, or kill decisions per major initiative.
- Update assumptions and expected-value scores from observed outcomes.

## Next 30-Day Execution Actions

1. Lock top three bets: activation, auth friction, partner pilot.
2. Assign owner, KPI, and kill criteria per bet.
3. Publish a one-page scorecard for weekly operating review.
4. Launch first partner cohort (coaches plus one search firm pilot).
5. Run first monthly Dalio/Duke review and rebalance if needed.

## Outcome

This roadmap maximizes acquisition and retention by sequencing reversible high-EV bets first, systemizing partner-led distribution, and protecting trust and quality as non-negotiable growth drivers.
