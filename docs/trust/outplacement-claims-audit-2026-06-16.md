# Outplacement Trust and Claims Audit (2026-06-16)

Owner: Content Lead
Sprint: ITS-1
Status: complete
Sources audited:
- src/app/for-outplacement/page.tsx
- src/app/for-outplacement/trust-pack/page.tsx
- src/app/for-outplacement/economics/page.tsx
- src/app/for-outplacement/runbook/page.tsx
- src/app/for-outplacement/operating-scorecard/page.tsx
- public/downloads/outplacement-pilot-operator-pack.md
- public/downloads/outplacement-pilot-runbook.md
- public/downloads/outplacement-counselor-enablement-kit.md

---

## Audit Method

Same three-question framework as coach audit. See docs/trust/claims-taxonomy-2026-06-16.md for category definitions.

---

## Claims by Classification

### VERIFIED — Supported by disclosed pilot data

| Claim | Source | Evidence | Notes |
|---|---|---|---|
| "81% of Jan-May 2026 pilot executives reached first interview within 30 days" | for-outplacement/page.tsx (PROOF_METRICS) | n=27, Jan-May 2026 | Methodology disclosed inline. Retain. |
| "9 days median time to first qualified outreach" | for-outplacement/page.tsx (PROOF_METRICS) | Same pilot | Retain. |
| "27 executives in current verified evidence snapshot (methodology disclosed)" | for-outplacement/page.tsx (PROOF_METRICS) | Explicit about n=27 | Retain. Valuable transparency signal. |
| "43% of pilot coaches adopted daily briefing into active session workflow" | for-outplacement/page.tsx (PROOF_METRICS) | Same pilot | Retain. |
| Session strategy time claim: 45–55% → 65–80% | for-outplacement/page.tsx (SESSION_YIELD_METRICS) | Pilot observation | Correctly labeled as observed range. Retain with "pilot observation" label. |
| Context rebuild time: 20–30 min → 5–12 min | for-outplacement/page.tsx (SESSION_YIELD_METRICS) | Same pilot | Same as above. |
| Measurement windows noted (Day 0, Day 30, Day 60) | for-outplacement/trust-pack/page.tsx (KPI_STAGES) | Defined in scorecard | Correctly defined. Retain. |

---

### DIRECTIONAL — Accurate framing, incomplete substantiation

| Claim | Source | Risk | Recommended Action |
|---|---|---|---|
| "Executives leave your program with a running search, not a revised resume and a list of job boards" | for-outplacement/page.tsx (FEATURES) | Outcome promise stated as categorical. Depends on client participation. | Add qualifier: "For executives who maintain weekly cadence." |
| "No coach or counselor needs to manually check in" (re: daily briefing) | for-outplacement/page.tsx (FEATURES) | Overstated automation. Counselors still need to respond to drift signals. | Soften to "reduces need for manual check-ins between sessions." |
| "Your placement outcomes improve" | for-outplacement/page.tsx (FEATURES) | Placement outcome is a significant causal claim not yet established by pilot data | Replace with: "Programs using the operating layer report stronger early-stage momentum (first interview rate, signal-driven actions)." |
| "Your counselors spend time on strategy, not accountability" | for-outplacement/page.tsx (FEATURES) | Behavioral outcome stated as certain. | Add "based on early pilot observation." |
| "Regional provider cohort A" and "National provider cohort B" peer-validated artifacts | for-outplacement/page.tsx (PEER_VALIDATED_ARTIFACTS) | Listed as validation evidence but not linkable or named | Mark explicitly as "anonymized pilot references." |

---

### WELL-GOVERNED — Correctly caveated institutional language

The outplacement trust-pack page shows notably more governance discipline than the coach FAQ. The following are correctly framed:

| Item | Source | Assessment |
|---|---|---|
| Claims policy (three board-safe rules) | trust-pack/page.tsx (CLAIMS_POLICY) | Strong. Explicitly separates observed from guaranteed. |
| Legal boundaries (role, data, pilot scope) | trust-pack/page.tsx (LEGAL_BOUNDARIES) | Strong. Clear scope definition language. |
| Attestation index (public vs diligence-gated) | trust-pack/page.tsx (ATTESTATION_INDEX) | Strong. Correctly separates what is public from what requires diligence request. |
| SLA attestation map with clause IDs marked as "proposed" | trust-pack/page.tsx (SLA_ATTESTATION_MAP) | Good. "Proposed" label correctly signals non-final status. |
| Artifact maintenance cadence table | trust-pack/page.tsx (CONSOLIDATED_ARTIFACT_INDEX) | Strong. Owners and cadences defined. |
| Procurement checklist | trust-pack/page.tsx (PROCUREMENT_CHECKLIST) | Strong. Complete and honest. |

---

### GAPS — Missing items the outplacement trust layer should have

| Gap | Risk | Recommended Action |
|---|---|---|
| No data residency or storage region statement | MEDIUM — enterprise buyers commonly ask where data lives | Add: "Data stored in US-based infrastructure on [provider]. Region documentation available on request." |
| No incident response SLA visible (only reference path) | MEDIUM — enterprise procurement expects at least a response SLA | Add a public-facing summary: "Security incidents reported to partners within 24 hours of confirmation." |
| "National provider cohort B" used as social proof but is anonymous | LOW-MEDIUM — weakens credibility for sophisticated buyers | Name cohort or add more context (region, size) with permission |
| No explicit statement on subprocessor list | LOW — GDPR-aware buyers may ask | Add: "Subprocessor list available on request via trust artifact process." |

---

## Summary Findings

- **0 HIGH risk claims** — outplacement trust materials are substantially better governed than coach materials.
- **1 MEDIUM causal overclaim** ("placement outcomes improve") needs immediate softening.
- **3 DIRECTIONAL claims** need minor qualifiers.
- **4 GOVERNANCE GAPS** should be closed before first enterprise pilot kickoff.
- **7 WELL-GOVERNED items** — these are a model for how coach materials should be updated.

## Remediation Owner

Content Lead with Operations Lead sign-off. Target sprint: ITS-2 for causal claim. Governance gaps: ITS-4 (partner OS sprint).
