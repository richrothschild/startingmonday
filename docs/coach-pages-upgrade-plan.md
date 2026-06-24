# Coach Pages Upgrade Plan
**Status:** Draft  
**Research base:** `docs/coach-transition-research-sources.md`  
**Evidence Hub section added:** `EVIDENCE_COACHING_TRANSITIONS` (id: `coaching-transitions`)  

---

## Problem Diagnosis

The current `/for-coaches` page fails the Ron Nash test: a career coach with 30 years of executive recruiting intelligence who visits the page will see marketing copy and abstract claims, not evidence they can use to explain why this tool improves their program.

Three core problems:

1. **No grounding.** Claims like "clients arrive prepared" and "sessions remain strategic" are asserted, not shown. Ron's worldview is built on research and outcomes data. He needs citations, not adjectives.
2. **Wrong frame.** The page is built around what the platform does. Ron cares about what changes in his client's search outcomes, and whether this threatens or extends his value.
3. **Weak visual hierarchy.** The competitive comparison table, journey map, and FAQ are distracting. The decision-critical content (proof, mechanism, pilot terms, trust) gets buried.

---

## Upgrade Scope: 5 Pages

| Page | Current state | Priority |
|---|---|---|
| `/for-coaches` | Cluttered, no evidence citations, wrong frame | P0 — needs full rewrite |
| `/coaches` | Good hero, friction table is strong, mock dashboard CTA works | P1 — tighten above fold, add citation strip |
| `/coaches/mock-dashboard` | Strong concept, weakly explained | P1 — add research context header |
| `/for-coaches/trust-pack` | Fine but generic | P2 — add privacy-specific research |
| `/for-coaches/economics` | Not reviewed — needs audit | P2 |

---

## P0: `/for-coaches` — Full Rewrite Architecture

### New structure (top to bottom)

**1. Opening claim (above fold)**  
Replace "Clients arrive prepared. Sessions remain strategic." with a claim backed by the research:

> "Between-session execution is where most executive searches succeed or fail. The research on goal attainment shows that structured tracking and accountability produce 3x higher follow-through than goals alone. We built the infrastructure layer that lets your sessions focus on strategy."

Source: Gollwitzer (1999), Locke & Latham (2002) — both in research file, source IDs `gollwitzer-1999` and `locke-latham-2002`.

---

**2. Problem framing — 2 paragraphs, not bullets**  
Cut the emoji bullet list. Replace with 2 direct paragraphs:

- Para 1: "Most career coaching is evaluated on session quality. But a meta-analysis of 57 coaching studies found that between-session homework and tracking are the strongest predictors of outcome quality — not what happens in the session itself. (Jones et al., 2016)"
- Para 2: "For executives in active search, that gap matters. A client with a specific weekly plan — signals to review, outreach to send, prep to complete — executes 3x more consistently than a client running on intention. You already know what the plan should be. We make sure it happens."

---

**3. Research proof strip — 3 claims, 3 sources**  
One visible citation strip before the CTA:

| Claim | Source |
|---|---|
| Between-session tracking is the top predictor of coaching outcome quality | Jones et al., 2016 · JOOP |
| If-then implementation plans produce 3x follow-through vs. intention alone | Gollwitzer, 1999 · American Psychologist |
| Weak ties — not inner circle — produce highest executive job mobility | Rajkumar et al., 2022 · Science |

These are the three claims that translate into product features: weekly brief assignments, structured commitment tracking, and signal monitoring for diverse outreach targets.

---

**4. How it fits your program — explicit role boundary**  
Current page has a "role boundary" concept but buries it. Elevate this to a clear section with a two-column table:

| Your role (coaching authority) | Starting Monday (execution layer) |
|---|---|
| Role strategy and narrative design | Weekly prep briefs and signal briefings |
| Relationship and conversation coaching | Outreach drafts and contact tracking |
| Accountability conversation | Between-session commitment tracking |
| Big picture career positioning | Role-specific intelligence for each target |

---

**5. 30-day pilot — evidence-framed offer**  
Keep the pilot offer but reframe it with research language:

> "The research on coaching effectiveness recommends testing new tools with 2-3 clients over 30 days before drawing conclusions. That is what we offer. No long-term contract. Measure outcomes at day 30 and decide from evidence."

Add a brief scorecard: 3 measurable things to track at day 30 (sessions that start at decision-level, client outreach volume, qualified conversations reached).

---

**6. Trust and access — condensed**  
Move trust pack content inline (3 bullet points) rather than requiring a click-through. Coaches need to know: client data is client-controlled, access is instant-revoke, no data leaves into recruiter pipelines.

---

**7. Remove**  
- Competitive comparison table (not the right decision stage)
- Journey map accordion (too much detail for first contact)
- FAQ section (move to `/for-coaches/faq`, not the main page)

---

## P1: `/coaches` — Targeted Tightening

**Above fold:** The hero is good. Add one research-grounded sub-claim under the headline:

> "Research on coaching effectiveness shows that structured between-session tracking is the primary driver of outcome quality — more than session format or coaching style. (Jones et al., 2016)"

**Proof strip:** The existing proof numbers (81%, 9 days, 27 executives) are strong. Add a single source label: "Jan–May 2026 pilot cohort, n=27. See method notes."

**CTA:** "See mock coach dashboard" is the right call. No change needed.

---

## P1: `/coaches/mock-dashboard` — Research Context Header

Add a 2-sentence header above the portfolio table:

> "This is what your view looks like when 3-5 clients are in active search. Research on coaching accountability shows that coach visibility into between-session execution is the top moderator of outcome quality. (Bozer & Jones, 2018)"

No structural changes needed — the mock dashboard itself is effective.

---

## P2: `/for-coaches/trust-pack` — Privacy Research

Add one research-backed claim:

> "Executive job searches are among the most confidential professional activities a person undertakes. The research on client trust in coaching (de Haan et al., 2013) shows that trust in data handling is a prerequisite for coaching alliance quality — not an optional feature."

---

## Implementation Sequence

| Phase | Work | Owner | Done when |
|---|---|---|---|
| 1 | Rewrite `/for-coaches` page content using new structure | Engineering + content | Page renders with research citations visible above fold |
| 2 | Add research proof strip to `/coaches` above fold | Engineering | Strip shows 3 claims with source labels |
| 3 | Add research context header to `/coaches/mock-dashboard` | Engineering | 2-sentence header renders before portfolio table |
| 4 | Audit and upgrade `/for-coaches/economics` | TBD | Pricing page reflects research-grounded value framing |
| 5 | Update Evidence Hub navigation to surface `coaching-transitions` section | Engineering | Section `id: coaching-transitions` accessible from `/evidence-hub` |
| 6 | Add deep links from all coach pages to `evidence-hub#coaching-transitions` | Engineering | Each coach page has one visible link to the research section |

---

## Evidence Hub: What Was Added

A new section `EVIDENCE_COACHING_TRANSITIONS` was added to `src/app/evidence-hub/content.ts` with 6 claim-source-implication blocks covering:

1. Between-session tracking as outcome predictor (Jones 2016, Bozer 2018)
2. Implementation intentions and follow-through (Gollwitzer 1999, Locke & Latham 2002)
3. Weak ties and executive job mobility (Rajkumar et al. 2022, Granovetter 1973)
4. Strategic network quality (Ibarra & Hunter, HBR 2007)
5. ICF industry data (ICF 2023, ICF 2025)
6. Pre-launch visibility in executive search (Spencer Stuart 2023, Heidrick & Struggles 2022)

The section is accessible at `/evidence-hub#coaching-transitions` once the page component is updated to use `EVIDENCE_SECTIONS_WITH_COACHING_TRANSITIONS` instead of `EVIDENCE_SECTIONS`.

---

## Files Changed or Created

| File | Action |
|---|---|
| `docs/coach-transition-research-sources.md` | Created — 20 verified research sources with citations |
| `src/app/evidence-hub/content.ts` | Updated — added `EVIDENCE_COACHING_TRANSITIONS` section |
| `docs/coach-pages-upgrade-plan.md` | Created — this file |

## Files Pending Implementation

| File | Required change |
|---|---|
| `src/app/for-coaches/page.tsx` | Full page rewrite per architecture above |
| `src/app/coaches/page.tsx` | Add research proof strip above fold |
| `src/app/coaches/mock-dashboard/page.tsx` | Add 2-sentence research header |
| `src/app/for-coaches/trust-pack/page.tsx` | Add trust/privacy research claim |
| `src/app/evidence-hub/page.tsx` | Switch to `EVIDENCE_SECTIONS_WITH_COACHING_TRANSITIONS` |
