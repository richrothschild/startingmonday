# Product Fit Gaps by Persona

> Analysis of where Starting Monday's current feature set fits well and where it leaves gaps, by executive persona.
> Tiers: Intelligence ($49), Search ($129), Executive ($249).

---

## Persona fit summary

| Persona | Current fit | Key gap | Priority |
|---------|------------|---------|----------|
| CIO | Strong | None material | — |
| CTO | Strong | Minor: engineering-specific signal types | Low |
| CISO | Good | Security/regulatory signal types missing | High |
| CPO | Good | Product-specific signals could be sharper | Low |
| CDO (data) | Medium | Data platform and AI investment signals missing | Medium |
| CDO (digital) | Medium | Digital transformation signals generic | Medium |
| COO | Weaker | Role rarely posted; relationship tracking > signals | Medium |
| VP Technology | Good | Step-up framing (CIO openings) works well | — |

---

## CIO — strongest fit

The product was built around the CIO search experience. Signal types (funding, exec departure, exec hire, expansion), role-frame definitions, and feature prioritization all reflect a CIO-first worldview. Career page scanning catches posted CIO and VP of IT roles. The daily briefing role frame is the most detailed in the codebase.

No major gaps. This is the core persona and it shows.

---

## CISO — good fit, one critical gap

The CISO role frame explicitly calls out "security incidents at target companies or sector peers" and "regulatory changes" as the highest-priority signals — but there is no signal type for either in the data model. The current signal types are generalist.

A breach disclosure at a target company or a new SEC cybersecurity rule is the most time-sensitive signal a CISO candidate can receive. The product cannot surface these today.

**Gap to close:**
- Add `breach_disclosure` signal type
- Add `regulatory_change` signal type
- Update signal detection job to identify these patterns from news feeds and 8-K filings

---

## CTO — good fit

Engineering leadership changes, funding rounds, and product launch signals apply cleanly. The CTO role frame correctly identifies "founder CTO departure" as a leading indicator of a professional CTO search.

Minor gap: no specific signal type for engineering hiring sprees (rapid LinkedIn headcount growth in engineering) or technical architecture announcements. These are leading indicators but would require additional data sources.

---

## CPO — good fit

Product launches, competitor feature announcements, CPO departures — all surfaced. The role frame is well specified.

Minor gap: app store rating movements are mentioned in the role frame as relevant but are not currently a signal source.

---

## CDO (data) — medium fit

There is no signal type specifically for:
- Data platform investments (Snowflake, Databricks procurement announcements)
- AI and analytics announcements
- Chief AI Officer appointments (which can indicate a CDO search or role consolidation)
- Data governance regulatory changes (GDPR enforcement actions, state privacy laws)

CDO data candidates receive the same funding and leadership signals as everyone else, without the data-specific lens. The signal detection logic does not weight these correctly for this persona.

**Gap to close:**
- Add `data_platform` and `ai_investment` signal types
- Update CDO role frame to weight these signal types as highest priority

---

## CDO (digital) — medium fit

Digital transformation announcements are generic company news. No specific signal type for omnichannel initiatives, customer experience platform decisions, or retailer digital push announcements — the leading indicators for CDO (digital) mandate creation.

The product works for this persona but requires the user to interpret generic signals through their own lens rather than receiving pre-filtered intelligence.

---

## COO — weaker fit

COO roles are rarely posted. They are created by internal decisions — board changes, M&A integration, revenue pressure — and filled through trusted networks. The product's primary mechanism (scanning career pages and monitoring signals) is least useful here.

For COO candidates, the most valuable feature would be relationship tracking and network quality assessment, not signal monitoring. The contacts feature exists but is secondary to the company and signal architecture.

**Mitigation options:**
1. Add a COO-specific onboarding note explaining that this persona relies more heavily on the contacts and follow-up features than on signal monitoring.
2. Add M&A and EBITDA signals as leading COO indicators.
3. Longer term: add relationship strength scoring to the contacts feature.

---

## Feature gaps by impact

| Gap | Affected personas | Build effort | Priority |
|-----|-----------------|-------------|---------|
| Outreach tracking (log sent messages) | All | Low | Sprint 1 |
| Annual billing option | All (acquisition) | Low | Sprint 1 |
| CISO security/regulatory signal types | CISO | Medium | Sprint 2 |
| Outreach message generator from prep brief | All | Medium | Sprint 2 |
| CDO data/AI signal types | CDO | Medium | Sprint 3 |
| Post-placement Intelligence tier path | All (retention) | Low | Sprint 6 |
| Mobile briefing rendering audit | All | Low | Sprint 6 |
| Network relationship strength score | COO, CDO | High | Future |
| Coach partner dashboard | B2B (coach) | Medium | Sprint 4-5 |

---

## Tech debt to address

**Signal detection pagination:** The briefing job uses cursor-based pagination to avoid the 1000-row Supabase limit. The signal detection job should be audited for the same pattern.

**Test coverage:** Worker jobs (briefing, executive scan, signal detection) have no automated tests. A smoke test for `runBriefingJob()` with mocked Supabase would catch most regressions. Acceptable technical debt for now; becomes risky as the codebase grows.

**proxy.ts risk:** A `proxy.ts` file in `src/` breaks Next.js builds. If this file exists, remove or rename it before a routine dependency update creates a silent deploy failure.

**Billing client featured plan:** Fixed in current code. Search tier (`active` key) is now featured as "Most popular" in the billing UI, not Executive.

---

*Last updated: 2026-05-08*
