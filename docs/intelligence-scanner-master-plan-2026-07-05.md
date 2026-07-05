# Intelligence Scanner Master Plan — 2026-07-05

Owner: Rich. Status: Approved for execution pending Phase 0 start.
Scope: signal capture, EDGAR, pattern recognition, outcome labeling, calibration, agents, observability.

---

## 1. North Star and KPI Tree

**North star: Hot-band hit rate** — % of companies rated "Hot" that post or fill a qualifying
leadership role within 90 days, vs. sector baseline. Target: >= 4x baseline by end of Phase 4;
published externally only after two stable quarters.

### KPI tree

| Layer | KPI | Target | Measured by |
|---|---|---|---|
| Outcome | Hot-band 90-day hit rate | >= 4x baseline | backtest agent, weekly |
| Outcome | Median signal lead time before posting | >= 30 days | precursor_stats |
| Quality | Brier score (per role-family x sector) | <= 0.18 | calibration job |
| Quality | Pattern precision (validated patterns) | >= 2x baseline, n >= 30 | pattern_backtests |
| Quality | Post-dedup duplicate rate | < 5% | precision-audit agent sample |
| Quality | Entity-confusion incident rate | < 2% of sampled signals | precision-audit agent |
| Input | Label coverage (% watched companies with >= 1 labeled outcome) | >= 60% by end Phase 3 | labeling job |
| Input | Labeled openings (cumulative) | >= 500 by end Phase 2; >= 2,000 by end Phase 5 | labeling job |
| Input | Source freshness SLO compliance | >= 95% green | source-health agent |
| Product | Hot-signal -> user action conversion (view/brief/outreach) | >= 40% within 48h | product events |
| Product | Signal dismiss rate | < 20% and falling | product events |
| Cost | Haiku spend per delivered signal | -50% vs. pre-Phase-1 baseline | source_run_metrics |
| Cost | Canonical cache hit rate | >= user-overlap factor | source_run_metrics |

---

## 2. Refined Phase Plan

Observability is a lane, not a phase: each phase includes its telemetry as acceptance criteria.
No phase is done until its claims are on the admin intelligence dashboard.

| Phase | Scope | Observability lane | Advance gate |
|---|---|---|---|
| 0 Honesty (week 1) | Classifier hardening (company context, 512 tokens, retry, DLQ), model unification, catalog reconciliation | DLQ depth/age metric + alert | Classification failure rate measurable and < 3% |
| 1 Canonical layer (weeks 2-3) | canonical_companies, company_events, pgvector dedup, corroboration counts, per-user projections, provenance columns | source_run_metrics table; cache-hit + dup-rate panels | Dup rate < 5%; provenance on 100% of new events |
| 2 Labels (weeks 3-4) | Live outcome join; retro-labelers (exec_hire back-label, pipeline-stage, DEF 14A officer diffs); precursor_stats | Label coverage + label latency panels | >= 500 labeled openings |
| 3 Backtest + free sources (weeks 5-6) | Backtest harness with matched controls (Wayback + GDELT), ATS JSON, WARN, "report a missed role" | Calibration curve + per-pattern precision panels | pattern_backtests populated; controls in place |
| 4 Calibrated product (weeks 7-8) | Score bands (shadow mode first), grounded radar, pre-positioned briefs, anti-signals | Band conversion + dismiss-rate panels; shadow-vs-live comparison | Shadow agreement reviewed; radar 100% evidence-linked |
| 5 Learning system (weeks 9-12) | Pattern library v2 + miner, event embeddings, agent crew (5 agents), Apollo org-diff, Sales Nav upload/alert ingestion, Hiring-DNA panel | Weekly Intelligence Ops Brief live | First agent-proposed pattern validated |
| 6 Flagship (Q1 2027, gated) | Search simulator, timing optimizer, earnings-call language deltas, search-process forecasting, person-events + cascade graph, macro multipliers | Simulator calibration panel | Brier stable 2 quarters; privacy review passed |
| 7 Optionality (decisions only) | Public scorecard, outcome co-op consent framework, demand-side aggregates, graph API posture | — | Only action now: provenance discipline + consent language |

---

## 3. Kill / Pivot Criteria

| # | Trigger | Action |
|---|---|---|
| K1 | Phase 1: embedding dedup merge precision < 80% on golden set after 2 tuning rounds | Fall back to rule-based (type + date-window + title fuzzy) dedup; drop pgvector from critical path |
| K2 | Phase 3: no pattern reaches >= 2x baseline precision with n >= 30 in backtest | Stop pattern-library investment; pivot product to canonical events + Hiring-DNA + anti-signals (still differentiated) |
| K3 | Phase 4: shadow calibrated score disagrees with realized outcomes worse than raw Haiku confidence | Do not flip; keep shadow 4 more weeks; if still worse, keep confidence and revisit feature set |
| K4 | Phase 5: agent-proposed patterns < 10% acceptance after 8 weeks | Cut miner cadence to monthly; reallocate to source expansion |
| K5 | Any phase: Haiku spend > $0.15 per delivered signal for 2 consecutive weeks | Freeze new sources; rank sources by yield-per-dollar and cut bottom quartile |
| K6 | Phase 6: Brier > 0.22 at gate time | Delay simulator; never ship uncalibrated forecasts (truthfulness contract) |
| K7 | Legal: vendor ToS audit finds derived-data restriction blocking outcome dataset | Quarantine affected source's events from precursor_stats; renegotiate or drop source |
| K8 | Privacy: person-events legitimate-interest analysis fails for a data class | Exclude that class; cascade model proceeds on remaining classes or is cut |

---

## 4. Reporting Cadence

| Report | Cadence | Audience | Producer | Contents |
|---|---|---|---|---|
| Intelligence Ops Brief | Weekly | Rich | Agent crew (auto) | Pattern health, source health, calibration deltas, candidates awaiting review, incidents |
| Intelligence Business Review | Monthly | Rich + advisors | Manual (30 min from dashboards) | KPI tree vs. targets, cost trend, kill-criteria status, phase gate decisions |
| IP & Moat Review | Quarterly | Rich + counsel | Manual | Dataset growth, trade-secret hygiene, patent posture, scorecard readiness, licensing optionality |
| Public Forecast Scorecard | Quarterly (Phase 7, gated) | Public | Auto from pattern_backtests | Aggregate hit rates only; no mechanism disclosure |

---

## 5. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Vendor ToS derived-data clauses (PDL, Apollo, PredictLeads) | Med | High | T2.7 ToS audit before precursor_stats ships; per-source quarantine flag |
| GDPR/CCPA exposure on person-events | Med | High | T6.1 privacy review gate before Phase 6; aggregate-only cross-user surfaces |
| LinkedIn platform risk | Low (design avoids) | Fatal if violated | User-seat upload + alert-forwarding only; no automation; documented in compliance runbook |
| Anthropic single-vendor dependency | Med | Med | Model registry already central (worker/lib/models.js); golden-set regression tests make swaps safe |
| pgvector scale on Supabase | Low | Med | K1 fallback path; events table partitioned by month |
| Wayback/GDELT rate limits during backfill | High | Low | Backfill queue with per-domain throttle; harness resumable |
| Alert fatigue degrades trust before calibration lands | Med | High | Phase 4 bands gated on backtest; dismiss-rate KPI watched from Phase 0 |
| Moat leakage (rates/dataset exposure) | Low | High | Bands not numbers in UI; precursor_stats access restricted; scorecard aggregates only |

---

## 6. Development Plan

### Assumptions
- One lead engineer (Rich) + coding agents for fetcher/test scaffolding; agent-drafted PRs go through existing CI gates.
- Sprint length: 1 week. Staging-first; promotion via existing staging -> main workflow.
- Every migration ships with a rollback playbook in docs/development/migration-rollbacks/ (hard gate).
- New user-facing behavior behind flags per config/feature-rollout-policy.json; scoring changes run shadow-mode >= 2 weeks.

### Engineering practices
- **Testing:** vitest for worker modules; golden-set fixtures for classifier (50 labeled articles incl. ambiguous-name traps), dedup (100 event pairs), and backtest replay (5 reconstructed company timelines with known outcomes). Golden sets are the regression gate for any model/prompt change.
- **Data:** all new tables owned by worker service role; RLS for any user-visible projection; provenance columns (raw_fetch_ref, content_hash, model_version, pattern_version, calibration_version) non-nullable from day one.
- **Rollout:** shadow -> internal (admin-only panel) -> flagged cohort -> GA. Radar replacement ships dark alongside old radar for 2 weeks.
- **Cost controls:** per-job token budget in source_run_metrics; K5 circuit breaker.

---

## 7. Work Breakdown Structure

### Epic E0 — Pipeline Honesty (Sprint 1)
- **T0.1** Add company context (sector, size band, public/private, HQ) to classify-signal prompt; add entity_match field. *AC: golden-set entity-confusion rate < 2%.*
- **T0.2** Raise max_tokens to 512; one retry on parse failure; write failures to new ingest_dlq table (payload, error, source, ts). *AC: zero silent drops in test harness; DLQ row on forced failure.*
- **T0.3** Unify score-hit.js on HAIKU from worker/lib/models.js. *AC: no hardcoded model strings in worker (lint rule).*
- **T0.4** Reconcile signal-source-catalog.json statuses with shipped fetchers; add freshness_slo_hours field per source. *AC: catalog matches code; CI check added.*
- **T0.5** DLQ monitor: depth/age metrics + admin alert (depth > 50 or age > 24h). *AC: alert fires in staging test.*

### Epic E1 — Canonical Event Layer (Sprints 2-3)
- **T1.1** Migration: canonical_companies (name, domain, sec_cik, apollo_org_id) + resolver that maps per-user companies rows; backfill. Rollback playbook. *AC: >= 95% of active watched companies resolved; ambiguous cases queued for review.*
- **T1.2** Migration: company_events (typed, dated, embedding vector, corroboration_count, sources jsonb, provenance columns). Rollback playbook. *AC: schema deployed; provenance non-nullable.*
- **T1.3** Dedup-on-insert: type + date-window +/- 3d + embedding cosine > 0.86 -> merge (increment corroboration, append source). *AC: >= 80% merge precision on golden set (else K1 fallback).*
- **T1.4** Rewire write-signal.js: write event first, then per-user projection rows. Backward compatible with company_signals readers. *AC: existing briefing/UI unchanged; dual-write verified.*
- **T1.5** source_run_metrics table + instrumentation in every fetcher (fetched, classified, written, merged, errors, latency, tokens). *AC: all 12+ fetchers reporting.*
- **T1.6** Backfill job: cluster historical company_signals into events. *AC: historical dup rate measured pre/post.*
- **T1.7** Admin dashboard panels: cache-hit rate, dup rate, per-source yield. *AC: panels live behind existing admin gate.*

### Epic E2 — Outcome Labels (Sprints 3-4)
- **T2.1** Live labeler: on scanner leadership-posting detection, back-label 180-day event window (preceded_role_opening, days_to_opening, role_family). *AC: labels written on next scan cycle.*
- **T2.2** Retro-labeler: exec_hire events back-label prior 180 days (captures never-posted retained searches). *AC: historical exec_hire corpus labeled.*
- **T2.3** Retro-labeler: pipeline-stage transitions (applied/interviewing/offer) + placed_at as confidential-search labels, flagged origin=user_pipeline. *AC: labels flagged and excluded from any public stat.*
- **T2.4** Retro-labeler: DEF 14A officer-table year-over-year diffs -> appointment dates. *AC: >= 200 historical appointments extracted.*
- **T2.5** precursor_stats nightly aggregate (event_type, pattern, sector, size_band -> n, hit_rate, median_days), Laplace-smoothed. *AC: table populated; sanity-checked vs. known cases.*
- **T2.6** Label-coverage + label-latency dashboard panels. *AC: coverage number live.*
- **T2.7** Vendor ToS audit (PDL, Apollo, PredictLeads, GNews) for derived-data restrictions; per-source quarantine flag in catalog. *AC: written findings; K7 flags set where needed.*

### Epic E3 — Backtest Harness + Free Sources (Sprints 5-6)
- **T3.1** Cohort builder: labeled openings from E2 + Wayback career-page snapshots + GDELT timelines for cohort companies. *AC: >= 300 openings with reconstructed 180-day timelines.*
- **T3.2** Matched-control sampler: 3 same-sector/size no-opening companies per case. *AC: control pool verified non-overlapping.*
- **T3.3** Replay engine: run current PATTERN_LIBRARY + scoring against reconstructed timelines; write pattern_backtests (precision, recall, lead time, fp_rate, cohort_version). *AC: all current patterns scored; report generated.*
- **T3.4** ATS detection + JSON pollers (Greenhouse, Lever, Ashby) replacing HTML scrape where available; posting open/close timestamps feed labeler. *AC: >= 30% of watched companies on structured ATS path.*
- **T3.5** WARN notice ingestion (top 10 states) -> layoffs events. *AC: events flowing; freshness SLO set.*
- **T3.6** "Report a role we missed": company-page action -> URL verify fetch -> confirmed label + scanner_misses queue. *AC: happy path auto-confirms; misses queue visible in admin.*
- **T3.7** Calibration-curve + per-pattern precision dashboard panels. *AC: curves render from pattern_backtests.*

### Epic E4 — Calibrated Product (Sprints 7-8)
- **T4.1** Calibrated score function (base_rate x recency decay x corroboration weight x pattern boost x relevance); computed in shadow alongside existing confidence. *AC: both scores stored per signal for >= 2 weeks.*
- **T4.2** Shadow analysis report: agreement, divergence cases, realized-outcome comparison. *AC: flip/no-flip decision documented (K3).*
- **T4.3** Watch/Warm/Hot bands in UI behind feature flag; historical stat sentence; raw rates never exposed. *AC: flagged cohort sees bands; dismiss rate tracked.*
- **T4.4** Grounded radar: retrieval over canonical events (user sector, not watched, high score); Haiku phrases reason citing only provided events; keep old radar dark 2 weeks. *AC: 100% of radar reasons link to event rows.*
- **T4.5** Pre-positioned briefs: Hot threshold triggers prep-brief + outreach draft generation before notify. *AC: brief ready at notification time for Hot signals.*
- **T4.6** Anti-signals: freeze/internal-promotion/tenure rules -> "low likelihood" verdict with reasons on company page. *AC: verdict renders with cited evidence.*
- **T4.7** Product-loop telemetry: band -> action conversion, dismiss rates, pre-brief open rate. *AC: panels live.*

### Epic E5 — Learning System + Agents (Sprints 9-12)
- **T5.1** Migration: signal_patterns table (sequence jsonb, window, status, hit_rate, version); seed from PATTERN_LIBRARY; correlate-signals loads validated patterns at runtime. Rollback playbook. *AC: behavior parity with prose library on golden set.*
- **T5.2** Weekly pattern-miner agent: frequent labeled sequences (support >= 8, >= 2x baseline) -> candidate proposals with evidence dossier. *AC: first proposals filed for review.*
- **T5.3** Backtest agent (weekly): re-run harness on trailing cohort; precision/lead-time deltas; auto-demote on > 20% precision drop + alert. *AC: demotion fires in staged test.*
- **T5.4** Source-health agent (daily): generalize EDGAR watchdog across catalog freshness SLOs; yield anomalies; dead feeds; DLQ trends. *AC: replaces bespoke EDGAR watchdog without regression.*
- **T5.5** Precision-audit agent (monthly): sample 50 signals, re-fetch, verify entity + summary; truthfulness report. *AC: first report generated.*
- **T5.6** Discovery agent (monthly): scanner_misses clusters + user-submitted domains -> source proposals. *AC: first proposal generated.*
- **T5.7** Intelligence Ops Brief: weekly digest assembled from intel_ops_reports rows -> admin surface + alert path. *AC: brief delivered on schedule with row-level citations.*
- **T5.8** Apollo org-diff source: monthly department-headcount snapshots for watched companies -> org_expansion/contraction events. *AC: events flowing within compliance runbook terms.*
- **T5.9** Sales Navigator user-lane: CSV export upload diffing + alert-email forwarding ingestion -> person-signal events (trust-tiered). *AC: end-to-end from upload to user-visible signal.*
- **T5.10** Hiring-DNA panel: tenure clocks, promote/external ratio, search-firm fingerprints, seasonal rhythm from historical appointments. *AC: panel on company detail for >= 50% of public watched companies.*
- **T5.11** Event-history embeddings: company timeline -> vector; similarity powers radar + backtest control matching. *AC: similar-company list sanity-reviewed.*
- **T5.12** Trust-tier framework: origin/trust columns, cross-user firewall (unverified never crosses users), corroboration promotion. *AC: RLS + tests prove isolation.*

### Epic E6 — Flagship (Q1 2027, gated on Brier + privacy review)
- **T6.1** Privacy review: legitimate-interest analysis for person-events; data-class decisions. *Gate for all E6 person work (K8).*
- **T6.2** person_events table + cascade graph (departure at A -> hazard at A, destination B, talent-graph neighbors).
- **T6.3** Earnings-call language-delta pipeline (within-speaker drift features).
- **T6.4** Search simulator (Monte Carlo expected-time-to-offer) + timing optimizer.
- **T6.5** Search-process forecasting (firm fingerprint, duration, panel).
- **T6.6** macro_events table with measured (not hand-authored) hazard multipliers.

### Sprint map

| Sprint | Focus | Phase gate at end |
|---|---|---|
| S1 | E0 complete | Phase 0 gate |
| S2-S3 | E1 | Phase 1 gate |
| S3-S4 | E2 (overlaps E1 tail) | Phase 2 gate |
| S5-S6 | E3 | Phase 3 gate |
| S7-S8 | E4 | Phase 4 gate |
| S9-S12 | E5 | Phase 5 gate |
| Q1 2027 | E6 (if gates pass) | Phase 6 gate |

### Definition of done (every ticket)
Code + tests green through existing CI gates; telemetry for the ticket's claims visible on the
admin dashboard; migration rollback playbook if schema changed; no raw calibration rates exposed
in any user-facing surface; staging-verified before promotion.
