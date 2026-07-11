# Page Experience Audit Procedure

Canonical methodology for the Page Experience Auditor agent (.github/agents/page-experience-auditor.agent.md).
Derived from the three-round dashboard audit of 2026-07-08 that surfaced 25+ real defects, including a P0 data-poisoning bug.

## Operating rules

1. Verification-first. Every finding must cite evidence: a live DOM snapshot, a screenshot, a source file and line, or command output produced in this run. Anything else is labeled Unverified.
2. Live rendering is mandatory. Analyze the real rendered page, not just source. Local base URL is http://localhost:3000 (start `npm run dev` if needed). Auth-gated pages use the Playwright storage state at tests/e2e/.auth/user.json.
3. Analysis only. Recommend fixes; never apply them.
4. Three passes, strictly ordered, each building on the last. Never merge or skip passes.

## Reference files

| Purpose | File |
|---|---|
| Executive persona council (6 personas) | docs/content/executive-user-synthetic-council.md |
| Sitewide design/editorial standard | docs/landing-page-standard.md |
| Luxury visual rubric (23/25 threshold) | docs/strategy/archetypes/luxury-brand-archetype.md |
| Art direction spec | docs/first-visit-experience-review-2026-07-04.md (Section 5) |
| Coaching persona council (if page targets coaches) | docs/content/executive-coaching-synthetic-council.md |
| Useful gates | `npm run ux:luxury:static`, `npm run ux:rubric:pages`, `npm run ux:cognitive:all-pages` |

Subagent available: **Explore** (read-only codebase research) — use it to locate the component source behind any rendered finding.

---

## Pass 1 — Surface: cognitive fluency and load

Goal: what a first-time visitor experiences in the first 60 seconds.

Steps:
1. Open the page, capture full accessibility snapshot and a screenshot (desktop, ~1512px wide).
2. Cognitive fluency check — sentence-level and composition-level:
   - Broken/spliced sentences, template concatenation bugs, mojibake glyphs (literal `?` where arrows/close icons belong).
   - Duplicate content blocks (same greeting, list, or metric rendered twice).
   - Vocabulary consistency (same concept, same name everywhere).
   - Clock-blind copy ("before noon", "end-of-day") vs. actual render time.
3. Cognitive load metrics — count and compare to budgets:

| Metric | Budget |
|---|---|
| Header nav items | ≤ 8 |
| Distinct "what do I do now?" systems | 1 |
| Interactive elements before primary content ends | ~15 |
| Differently-labeled CTAs to the same route | ≤ 2 per route |
| Unprompted text inputs | 0–1 |
| First element on page | Value, never a warning banner |

4. Check first-paint order: does value render before nudges/warnings?
5. Grade Pass 1: Cognitive fluency (A–F) and Cognitive load (A–F), with the specific violations that set each grade.

## Pass 2 — Deep structure: data coherence, truthfulness, semantics

Goal: does the page tell one true story, and is it built honestly?

Steps:
1. Cross-panel number reconciliation. Every count shown twice must match (contacts, companies, due items, signals). Trace mismatches to the query level — a failing select can silently zero every downstream metric (P0 class; see the `enrichment_source` incident: a column present only in a later migration poisoned six metrics).
2. Narrative coherence. Multiple health/status verdicts must not contradict (e.g., "At risk" vs "Steady start" vs "No stalled campaigns"). One vocabulary, scoped labels.
3. Truthfulness of labels:
   - "Due today" must not contain overdue items; date displays humanized (never raw ISO).
   - Fake precision (hardcoded "48 hours" decision windows repeated identically) must be flagged.
   - Progress language ("queue pending") must reflect a real running process.
4. Semantics and metadata:
   - Heading outline: dominant visual text should be a heading; numbers should not be headings.
   - Page title correct and single-suffixed (watch for template + metadata double suffix).
   - Anchor links must not point at collapsed `<details>` targets without auto-open (use `?focus=` params where the page supports them).
   - Label/destination mismatches (button says "Companies", routes to an add-form).
5. Grade Pass 2: Trust integrity (A–F).

## Pass 3 — Hidden state, responsive, and cross-page coherence

Goal: what nobody looks at — collapsed tiers, mobile, sibling pages.

Steps:
1. Expand EVERY collapsed disclosure/details tier and audit its full content. Historical hit rate here is highest: palette violations (light `bg-white` cards on dark theme), the harshest shame-based copy, and stale modules hide in collapsed tiers.
2. Palette compliance inside expanded tiers: count `bg-white`/light-theme surfaces on the dark canvas (`slate-950`). Verify against the luxury archetype rubric. Note: static gates may only scan page files, not section components — the live DOM is the truth.
3. Mobile pass: resize to 390×844, reload, screenshot. Check stacking order (navigation rails must not render above content), horizontal overflow, and wasted above-fold space.
4. Copy tone audit against personas: punitive language ("Search at risk", "Low momentum") vs. steady executive tone.
5. Cross-page chrome coherence: nav link sets on sibling pages must match spatial memory.
6. Console/network hygiene: capture console warnings (unused preloads, hydration errors).
7. Data rot patterns: relative time frozen in stored text ("has been 8 days since...").
8. Grade Pass 3: Hidden-tier consistency (A–F).

## Persona council review

For each persona in docs/content/executive-user-synthetic-council.md (Ambitious VP, Sitting CIO, Displaced executive, PE operator, Burned-out executive, Executive recruiter):
- One "what works" sentence and one "what must change" sentence, in the persona's voice, grounded in specific on-page evidence.

## Combined report format

```
# Page Experience Audit — <page(s)> — <date>

## Scope and method
(pages, viewport(s), auth state, gates run)

## Pass 1 — Surface (fluency + load)
(findings with severity P0–P3, each with evidence)

## Pass 2 — Deep structure (data + truthfulness + semantics)
(findings...)

## Pass 3 — Hidden state, mobile, coherence
(findings...)

## Persona council verdicts
(6 personas, works/change)

## Grade table
| Axis | Grade | Held back by |
|---|---|---|
| Cognitive fluency | | |
| Cognitive load | | |
| Trust integrity | | |
| Hidden-tier consistency | | |

## Prioritized fixes
1. P0 ... (safe surgical patch | design decision)
2. ...
(separate "safe surgical patches" from "needs a design decision"; end with backlog items)
```

## Severity definitions

- P0: Data integrity or trust-destroying defects (wrong numbers, broken queries, contradictory core claims).
- P1: Violations of brand/design standards or coherence a user will consciously notice.
- P2: Structural, navigation, metadata, and truth-of-label issues.
- P3: Copy polish, hygiene, minor performance warnings.

## Lessons bank (append new ones after each audit)

- A single fragile column in a shared select can zero every downstream metric; always reconcile displayed counts against an independent query.
- Collapsed tiers accumulate violations because gates and eyes skip them; expand everything.
- Fixes can create new contradictions (adding pipeline-stage context exposed a "may be opening" vs "already interviewing" clash); re-audit after fixing.
- Anchors to collapsed details are dead ends unless the page supports an auto-open param.
- Metadata titles double-suffix when page metadata includes the brand that the root template already appends.
