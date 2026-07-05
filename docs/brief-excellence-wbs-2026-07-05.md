# Brief Excellence WBS: Starting Monday

Date: 2026-07-05
Source plan: [docs/brief-excellence-plan-2026-07-05.md](docs/brief-excellence-plan-2026-07-05.md)

## Objective

Make every generated brief safe to carry into a real interview, short enough to use the night before, visibly luxurious on the paid surface, and provably effective.

## Workstreams

| Sprint | Epic | Goal | Exit Criteria |
|---|---|---|---|
| Sprint 1 | Grounded Truth | The product is structurally unable to present fabricated intel as fact | Zero unsourced proper nouns in a 50-brief sample; attribution reflects real sources |
| Sprint 2 | Export Integrity | Everything that leaves the product carries its integrity with it | No export path bypasses gates; exports carry a sources appendix; version history visible |
| Sprint 3 | The Tonight Brief | The brief fits the night before, looks like the brand, and is about this candidate | Tonight view default; prep surface passes luxury gate; fingerprint validator at 100% |
| Sprint 4 | The Living Ritual | The daily brief reads like intelligence and never degrades silently | Ritual adoption ≥ 35% of activated users; zero silent fallbacks |
| Sprint 5 | The Learning Loop | Brief efficacy is measured and generation cost is governed | Outcome captured on ≥ 40% of used briefs; per-user cost known and under target |

## Epic Breakdown

### Epic 1: Grounded Truth (Sprint 1)

Purpose: eliminate fabricated specificity at the generation layer.

Tickets:
- BE-101 Evidence-count grounding gate for intel-heavy prep sections.
  - Count injected evidence (signals, documents, notes, scan results) per section; below threshold, switch the prompt to pattern-language mode and label the section "pattern analysis, not verified intel" with an add-evidence CTA.
  - Success criteria: sections with insufficient evidence never name people or dated events; label renders in prep UI; add-evidence CTA routes to company documents/notes.
- BE-102 Ground the onboarding intel brief with live signals.
  - Inject company_signals for the named company when available; keep the existing pattern-language rule as the floor.
  - Success criteria: when signals exist, at least one grounded reference appears; when none exist, output contains no fabricated names or events.
- BE-103 Proper-noun evidence validator.
  - Server-side post-generation check: named people/dated events must match an injected evidence source or be rewritten to pattern language before persistence.
  - Success criteria: zero unsourced proper nouns across a 50-brief regression sample; validator failures logged to llm_traces.
- BE-104 Attribution v2: model-emitted source tagging.
  - Require claims tagged with source block IDs from the injected context; validate tags against context; classify unmatched claims as inferred; replace keyword-heuristic origin classification.
  - Success criteria: provenance origin classes derive from validated tags; confidence score reflects real attribution; quality ratings hold within 10% of baseline.

### Epic 2: Export Integrity (Sprint 2)

Purpose: gates and provenance travel with the artifact.

Tickets:
- BE-201 Sensitive-claim export gate.
  - Block download/copy when sensitivePolicyHooks is non-empty until each flagged claim is reviewed; strip inferred sensitive claims entirely.
  - Success criteria: no export path (DOCX, copy, plaintext) bypasses the gate; stripped claims logged.
- BE-202 Low-confidence export acknowledgment.
  - Confidence band "low" requires explicit acknowledgment at the export decision point, with remediation list shown.
  - Success criteria: acknowledgment recorded per export; remediation list matches scorePrepBriefConfidence output.
- BE-203 Provenance appendix in exports.
  - DOCX and plaintext exports append sources-and-confidence page: origin-class counts, evidence sources, generation date, confidence band.
  - Success criteria: every export carries the appendix; appendix matches the on-screen provenance state at export time.
- BE-204 Brief version history UI.
  - Surface prior generations per company/section from the briefs table with comparison and restore.
  - Success criteria: regenerating never destroys visible history; restore produces an identical prior artifact.

### Epic 3: The Tonight Brief (Sprint 3)

Purpose: usable length, luxury surface, unmistakable personalization.

Tickets:
- BE-301 Tonight view: one-page default prep brief.
  - Bottom Line, top three pushbacks, five likely questions, How to Close; printable; full dossier one click deeper.
  - Success criteria: Tonight view is the default landing state; renders on one screen/one printed page; dossier reachable in one click.
- BE-302 Dark editorial shell for the paid prep surface.
  - Port the demo renderer (slate-950, orange section headers, mono micro-labels) to prep-client; keep provenance badges legible on dark.
  - Success criteria: prep surface passes the luxury static gate; visual parity with or above the public demo.
- BE-303 Candidate fingerprint validator.
  - No section renders without at least one candidate-specific anchor (career history, STAR story, positioning line); enforced server-side.
  - Success criteria: 100% of new briefs pass; violations regenerate the offending section automatically.
- BE-304 Interviewer-specific prep for attached contacts.
  - When a contact is attached, generate a stakeholder read for that person using the Stakeholder Signal Map frame.
  - Success criteria: contact-attached briefs include the interviewer read; no interviewer content fabricated when contact data is thin (pattern-language floor applies).

### Epic 4: The Living Ritual (Sprint 4)

Purpose: the daily brief earns the daily visit.

Tickets:
- BE-401 Signal-density model tiering for the daily briefing.
  - Sonnet on days with signals or new matches, Haiku on quiet days; raise the content cap on signal days.
  - Success criteria: signal-day briefings measurably longer/denser; cost delta tracked; quiet days unchanged.
- BE-402 Honest fallback and freshness stamps.
  - Visible label on the non-AI credit-exhaustion fallback; per-signal freshness stamp (detected N hours/days ago).
  - Success criteria: zero silent fallbacks; every signal shows freshness.
- BE-403 Thesis relevance line.
  - One line per briefing connecting today's items to the user's role thesis, grounded in stored role/persona context.
  - Success criteria: line present whenever thesis context exists; never generic filler.

### Epic 5: The Learning Loop (Sprint 5)

Purpose: efficacy evidence and cost governance.

Tickets:
- BE-501 Post-interview outcome capture.
  - One-tap outcome (advanced / rejected / offer) attached to brief lifecycle; prompt on next visit after used_at is set.
  - Success criteria: outcome captured on ≥ 40% of used briefs; outcome stored on the brief row.
- BE-502 Efficacy baseline and evals feed.
  - Correlate outcomes with brief usage in llm_traces/evals; internal monthly efficacy report; failure categories feed the golden set.
  - Success criteria: first monthly report produced; golden set gains outcome-labeled records.
- BE-503 Generation cost guardrails.
  - Context-hash section caching; regeneration metering on trial accounts; monthly per-user generation cost report against plan price.
  - Success criteria: unchanged context never regenerates; trial metering active; cost report exists.

## Sequencing and Dependencies

- Epic 1 blocks Epic 2 (export gates depend on attribution v2 origin classes) and Epic 3 ticket BE-304 (interviewer prep must inherit the grounding floor).
- BE-204 (version history) blocks BE-501 (outcomes must attribute to a visible brief version).
- Epic 3 BE-302 has no dependencies and may pull forward if Sprint 1 has slack.
- Epic 4 is independent and may run in parallel with Epic 3 if capacity allows.

## Program Success Criteria

- Integrity: zero unsourced proper nouns in sampled briefs; no ungated sensitive exports.
- Usability: Tonight view default; version history visible; prep surface passes luxury gates.
- Ritual: briefing week-1 adoption ≥ 35% of activated users; zero silent fallbacks.
- Proof: outcome capture ≥ 40% of used briefs; monthly efficacy report running.
- Economics: per-activated-user generation cost measured and under target.
