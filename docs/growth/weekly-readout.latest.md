# Weekly Conversion Readout

## Week
- ISO week: 2026-W21
- Reporting window: 2026-05-18 to 2026-05-24

## KPI Snapshot
- Qualified signup rate: 7.4%
- Hero CTA CTR: 16.2%
- Form start rate: 28.4%
- Form completion rate: 51.3%
- Bounce rate: 44.1%
- Median engaged time (seconds): 68

## Experiment Readout
### 2026-W21-LP-01 (Homepage section compression)
- Hypothesis: reducing the main landing page to five sections will reduce cognitive load and increase form-start intent.
- Primary KPI result: form start rate improved versus prior baseline.
- Guardrail result: bounce rate improved; no regressions.
- Segment results: strongest lift in organic executive traffic.
- Decision: Ship
- Owner: Design + Product Marketing
- Next action: maintain 5-section limit and route deep content to linked pages.

### 2026-W21-LP-02 (Section dwell and funnel instrumentation)
- Hypothesis: adding section dwell and field-level events will expose where intent drops.
- Primary KPI result: instrumentation coverage complete for all required sections and intake fields.
- Guardrail result: no rendering or performance regressions detected in local verification.
- Segment results: n/a (first data collection cycle)
- Decision: Iterate
- Owner: Engineering + Growth
- Next action: collect one full weekly dataset and evaluate threshold stability.

### 2026-W21-LP-03 (Production growth gate)
- Hypothesis: a strict production gate will prevent shipping without scorecard quality controls.
- Primary KPI result: gates execute locally and in CI definitions.
- Guardrail result: build/typecheck requirements retained.
- Segment results: n/a
- Decision: Ship
- Owner: Engineering
- Next action: enforce workflow as required status check on main.

## Section Dwell and Scroll Summary
- 25% scroll rate: captured
- 50% scroll rate: captured
- 75% scroll rate: captured
- 100% scroll rate: captured
- Dwell median by section: clarity, proof, how-it-works, objections, final CTA all above 1.5s

## Risks and Blockers
- Risk: weekly metrics file can become stale without owner updates.
- Owner: Growth
- Mitigation: weekly workflow exports metrics directly from PostHog before strict gating.

## Decisions Logged
1. Ship five-section landing architecture.
2. Iterate instrumentation analysis after one full weekly cycle.
3. Ship strict production growth gate.
