# Brief Excellence Plan

Date: 2026-07-05
Source analysis: the brief audit of 2026-07-05 (demo interview brief, prep brief + 11 sections, strategy, outreach, daily briefing, onboarding intel, grill-me), grounded in source review of the generation routes, prompts, provenance system, and rendering surfaces.
Standard of record: docs/landing-page-standard.md, including the Claim-Integrity and Value-Moment contracts.

## Objective

Make every generated brief safe to carry into a real interview, short enough to use the night before, visibly luxurious on the paid surface, and provably effective. The brief is the product; this plan makes it worthy of that position.

## Issue Inventory (from the analysis, consolidated)

| # | Issue | Severity | Category |
|---|---|---|---|
| 1 | Fabricated company specificity when grounding data is absent (prep intel sections; onboarding intel has zero grounding) | Existential | Integrity |
| 2 | Provenance origin classes derived from keyword heuristics, not real attribution ("trust theater") | High | Integrity |
| 3 | Provenance and confidence markings stripped from DOCX/plaintext exports | High | Integrity |
| 4 | Sensitive-policy claims (compensation, legal, security) and low-confidence briefs export with no gate | High | Integrity / Legal |
| 5 | 20-section, 8,000-token dossier with no one-page "Tonight" view | High | Usability |
| 6 | Regenerated briefs/sections lose prior versions in the UI | Medium | Usability |
| 7 | Sameness at scale: two users at one company get near-identical intel and AI cadence | High | Differentiation |
| 8 | No interviewer-specific prep; judgment layer under-merchandised | Medium | Differentiation |
| 9 | Daily briefing is the thinnest generation in the product (Haiku, 1,600-char cap) with a silent non-AI fallback | High | Ritual |
| 10 | Paid prep surface renders light while the free demo gets the dark luxury shell | High | Perceived value |
| 11 | One-way feedback: ratings collected, no outcome capture, no efficacy evidence | High | Learning loop |
| 12 | Unit economics unguarded: Opus strategy, 8k-token preps, unmetered regenerations on trial accounts | Medium | Economics |

## The Plan (Version 3, Delivered)

Sequencing rule: safety, then form, then ritual, then proof. A beautiful brief that lies is worse than an ugly one that doesn't; nothing ships ahead of the grounding work.

### Phase 1: Grounded Truth (Sprint 1)
The product must be structurally unable to present fabricated intel as fact.

1. Evidence-count grounding gate: intel-heavy prep sections (leadership, challenges, competitive, priorities) check the injected evidence (signals + documents + notes + scan results). Below threshold, the prompt switches to pattern-language mode ("companies at this stage typically...") and the UI labels the section "pattern analysis, not verified intel," with a CTA to add evidence.
2. Onboarding intel grounding: reuse the same rule already present in the intel route, and inject live company signals when the company exists in the signal catalog, so day-1 intel is grounded whenever possible.
3. Proper-noun evidence check: post-generation validator; any named person or dated event that lacks a matching evidence source is rewritten to pattern language or dropped. Runs server-side before stream completion is persisted.
4. Attribution v2: replace keyword-heuristic provenance with model-emitted source attribution. The generation prompt already receives structured context blocks; require the model to tag claims with source block IDs, validate against the injected context, and fall back to `inferred` only when no source matches.

Success gate: zero unsourced proper nouns in a 50-brief sample; confidence scoring reflects real attribution.
Kill criterion: if attribution v2 degrades brief quality ratings by >10% after 2 weeks, keep the grounding gate and proper-noun check, revert attribution to v1 while re-prompting.

### Phase 2: Export Integrity (Sprint 2)
What leaves the product must carry its integrity with it.

1. Sensitive-claim export gate: if `sensitivePolicyHooks` is non-empty, block download/copy until the user reviews each flagged claim; inferred sensitive claims are stripped, not flagged.
2. Low-confidence acknowledgment: confidence band "low" requires explicit acknowledgment before export, with the remediation list shown at the decision point.
3. Provenance appendix in exports: DOCX and plaintext exports append a sources-and-confidence page (origin-class counts, evidence sources used, generation date, confidence band).
4. Version history: the briefs table already stores each generation as a row; surface prior versions per company/section in the prep UI with diff-style comparison and restore.

Success gate: no export path bypasses the gates; every exported artifact carries the appendix.
Kill criterion: if the export gates cut export volume by >30% without a matching drop in negative ratings, soften low-confidence from block to warn (sensitive-claim gate never softens).

### Phase 3: The Tonight Brief (Sprint 3)
The brief must fit the night before, look like the brand, and be unmistakably about this candidate.

1. Tonight view: a one-page default view of the prep brief — Bottom Line, top three pushbacks, five likely questions, How to Close — printable, with the full dossier one click deeper. This mirrors how retained firms brief finalists.
2. Dark editorial shell on the paid prep surface: port the demo's renderer (orange section headers, mono micro-labels, slate-950) to the prep client. The paid experience must exceed the free one.
3. Candidate fingerprint enforcement: no section renders without at least one candidate-specific anchor (career history, STAR story, or positioning line). Validator, not vibes.
4. Interviewer-specific prep: when a contact is attached to the company, generate a stakeholder read for that person (what this person needs to believe, likely concerns from their seat) using the existing Stakeholder Signal Map frame.

Success gate: Tonight view is the default landing state; prep surface passes the luxury static gate; fingerprint validator passes on 100% of new briefs.
Kill criterion: if Tonight view reduces full-dossier engagement AND rating quality after 4 weeks, make it a toggle default-off — keep the dark shell regardless.

### Phase 4: The Living Ritual (Sprint 4)
The daily brief carries retention; fund it accordingly.

1. Signal-density model tiering: Sonnet on days with signals or new matches, Haiku on quiet days; raise the content cap so signal days read like intelligence, not a digest.
2. Honest fallback and freshness: the non-AI credit-exhaustion fallback gets a visible label; every signal shows a freshness stamp (detected N hours/days ago).
3. Thesis relevance line: each briefing includes one line connecting today's items to the user's role thesis ("why this matters to your search"), grounded in the stored role/persona context.

Success gate: `briefing_viewed` week-1 ritual adoption at or above the first-mile target (35% of activated users); zero silent fallbacks.
Kill criterion: if Sonnet days do not lift briefing engagement after 4 weeks, revert tiering and bank the savings.

### Phase 5: The Learning Loop (Sprint 5)
Prove the brief works, and stop paying for generations nobody needed.

1. Outcome capture: one-tap post-interview outcome (advanced / rejected / offer) attached to the brief lifecycle (`used_at` already exists); prompt appears on the next visit after `used_at` is set.
2. Efficacy baseline: correlate outcomes with brief usage in the existing `llm_traces` and evals pipeline; publish an internal monthly efficacy report; feed failure categories into the golden set.
3. Cost guardrails: context-hash section caching (unchanged context never regenerates), regeneration metering on trial accounts, and a monthly per-user generation cost report against plan price.

Success gate: outcome captured on ≥40% of `used` briefs; per-activated-user generation cost known and under target.
Kill criterion: none — measurement and cost visibility are unconditional.

## Refinement Log (Three Passes)

- Pass 1 (draft): organized by the analysis's own categories, leading with the UI wins (dark shell, Tonight view) because they are cheapest and most visible. Rejected: it shipped polish ahead of safety. The fabrication finding is existential; a more beautiful surface for fabricated intel makes the core risk worse, not better. Re-sequenced safety-first.
- Pass 2: merged the legal-exposure gate and the confidence gate into a single Export Integrity phase (they share the same code path in save/download); discovered version history is a prerequisite for outcome correlation (you cannot attribute an outcome to a brief you can no longer see), so it moved from a nice-to-have into Sprint 2; added kill criteria to every phase after re-reading the standard's anti-pattern list on waived failures.
- Pass 3 (delivered): aligned every phase with infrastructure that already exists instead of inventing parallel process — the grounding rule extends the intel route's existing pattern-language instruction, attribution v2 builds on the structured context blocks already injected, outcome capture extends the existing lifecycle states, and efficacy work lands in the existing evals/golden-set pipeline. Scoped interviewer-specific prep to contacts-attached briefs only (bounded cost, honest data). Added explicit cost guardrails after the devil's-advocate economics objection; set the success gates to metrics the product already logs.

## What This Plan Does Not Do

- No new brief types. Excellence over surface area.
- No autonomous fact-fetching from the open web inside generation; grounding comes from the evidence the product already collects (signals, documents, scans, notes).
- No public efficacy claims until the internal baseline has three months of data.
