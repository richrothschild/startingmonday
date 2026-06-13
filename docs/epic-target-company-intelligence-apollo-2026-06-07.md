# Epic: Target Company Intelligence and Outreach Narratives (Apollo-Backed)

Date: 2026-06-07
Owner: Growth + Product + Engineering
Jira Project: SMK

## Problem
Current company discovery produces a short list with a single-sentence rationale and fit score. It is useful, but not robust enough for high-confidence target selection and does not provide a deep, linked narrative per recommendation with outreach-ready people suggestions.

## Goals
1. Increase recommendation robustness and quantity.
2. Add narrative links for each recommendation.
3. On click, reveal why chosen, key signals/attributes, and 1-3 outreach targets.
4. Use Apollo as the first enrichment provider behind a provider adapter.
5. Preserve compliance posture: no scraping and source transparency.

## Non-goals
1. Fully automated outbound messaging.
2. Vendor lock-in to Apollo-specific schema.
3. Replacing existing contact workflows.

## Success Metrics
1. Discover add-to-watchlist rate: +25% from baseline.
2. Recommendations shown per run: min 12, target 20.
3. Narrative open rate from recommendation cards: >=35%.
4. Outreach action start rate from narrative page: >=20%.
5. Suggested people acceptance rate (added to contacts or outreach draft): >=15%.

## Architecture Decisions
1. Add provider-agnostic enrichment interface in `src/lib/enrichment`.
2. Keep deterministic ranking/scoring in app domain logic.
3. Persist recommendation runs and recommendation items with narrative payload.
4. Store provenance and confidence for each suggested person.

## Work Breakdown Structure

### WBS 1: Data foundation
1.1 Add tables for recommendation runs and items.
1.2 Add indexes by user/time/rank/confidence.
1.3 Add row-level policies matching existing user ownership model.

### WBS 2: Discovery pipeline hardening
2.1 Expand discovery payload from {name, sector, why, fit} to structured narrative.
2.2 Add ranking inputs and deterministic score fields.
2.3 Return 20 candidates, display top 12 by default.
2.4 Add fallback path when model output underfills.

### WBS 3: Apollo enrichment adapter
3.1 Build provider adapter contract.
3.2 Implement Apollo provider client (feature-flagged).
3.3 Add source labels + confidence mapping.
3.4 Add resilient failure handling and no-op fallback.

### WBS 4: Narrative link UX
4.1 Add recommendation detail route.
4.2 Add narrative link from cards.
4.3 Show why-chosen narrative, key signals/attributes, and 1-3 people.
4.4 Add direct actions: add company, add contact, draft outreach.

### WBS 5: Observability and quality controls
5.1 Add events for run_created, recommendation_opened, recommendation_added.
5.2 Add quality guardrails (dedupe/diversity/min evidence).
5.3 Add admin readout for conversion and suggestion quality.

### WBS 6: Compliance and governance
6.1 Data source and usage labels in UI.
6.2 Retention and deletion hooks for provider-derived contacts.
6.3 Contract/usage gate checks documented in runbook.

## Sprint Plan

### Sprint 1 (Foundation and first shippable)
- Migrations for recommendation persistence.
- Expanded discovery contract.
- Narrative link route and UI detail page.
- Provider adapter scaffold and Apollo client stub.

Definition of Done:
- User can click link on recommendation and view full narrative with 1-3 suggested people.
- Recommendation run persisted with rank and confidence fields.

### Sprint 2 (Apollo enrichment and ranking hardening)
- Apollo adapter wired into people suggestions.
- Deterministic ranking pass with diversity controls.
- Fallback quality gates and stale-signal penalties.

Definition of Done:
- Suggestions include source and confidence.
- Top set quality exceeds baseline with no increase in error rate.

### Sprint 3 (Conversion optimization and governance)
- Add outreach and contact actions from narrative page.
- Telemetry dashboards and quality reporting.
- Compliance controls finalized (retention/deletion/source transparency).

Definition of Done:
- Conversion telemetry visible in dashboard.
- Governance checklist complete and signed off.

## Risks and Mitigations
1. Vendor API inconsistency:
Mitigation: adapter + feature flag + fallback provider.
2. Hallucinated narratives:
Mitigation: deterministic guardrails and evidence minimums.
3. Coverage gaps at exec level:
Mitigation: blend Apollo + user contacts + role-based fallback.
4. Cost growth:
Mitigation: cap enrichment calls per run and cache by company/title.

## Jira Mapping
- Epic issue: SMK-<to-create>
- Sprint 1 stories: WBS 1, WBS 2, WBS 4 baseline, WBS 3 scaffold.
- Sprint 2 stories: WBS 3 full, WBS 2 hardening.
- Sprint 3 stories: WBS 5 + WBS 6.
