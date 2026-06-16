# Coach Trust and Claims Audit (2026-06-16)

Owner: Content Lead
Sprint: ITS-1
Status: complete
Sources audited:
- src/app/for-coaches/faq/page.tsx
- src/app/for-coaches/trust-pack/page.tsx

---

## Audit Method

Each public-facing claim was evaluated against three questions:
1. Is there visible substantiation in the repository or public materials?
2. Is the language categorical (i.e., stated as definite fact) vs directional (i.e., caveated)?
3. Does the claim match or exceed what can be legally defended today?

Claims were classified using the taxonomy defined in docs/trust/claims-taxonomy-2026-06-16.md.

---

## Claims by Classification

### VERIFIED — Supported by disclosed pilot data

| Claim | Source | Evidence | Notes |
|---|---|---|---|
| "81% of Jan-May 2026 pilot executives reached a first interview within 30 days" | for-coaches/faq (proof FAQ), for-coaches/faq (objection: adoption), for-outplacement page | n=27, Jan-May 2026, methodology disclosed | Correctly caveated with sample size and date window. Retain as-is. |
| "9-day median time from setup to first qualified outreach" | for-coaches/faq (proof FAQ), for-outplacement page | Same pilot, methodology disclosed | Correctly caveated. Retain as-is. |
| "43% of pilot coaches adopted daily briefing into active session workflow" | for-coaches/faq (proof FAQ), for-outplacement page | Same pilot, methodology disclosed | Correctly caveated. Retain as-is. |
| "100% of clients who understood the permission model were comfortable" | for-coaches/faq (privacy objection) | Pilot behavioral observation, no sample size cited | Add sample size or soften to "all clients who completed trust review." |
| "Clients spend about 5 minutes per week updating 3–5 company stages" | for-coaches/faq (manual-work FAQ) | Observed usage pattern in pilot | Directional, not a certified metric. Mark as directional. |
| "Coaches report spending less total time on operational catch-up" | for-coaches/faq (workload objection) | Pilot qualitative, no n cited | Directional. Add "in early pilot" qualifier. |
| "Session strategy time increases from 45–55% to 65–80%" | for-outplacement page (session yield) | Pilot observation, methodology disclosed on outplacement page | Currently only on outplacement page. Consistent with coach claim. |
| "Context rebuild time drops from 20–30 min to 5–12 min" | for-outplacement page | Same | Same as above. |

---

### DIRECTIONAL — Accurate but not fully substantiated with named, reproducible evidence

| Claim | Source | Risk | Recommended action |
|---|---|---|---|
| "Coaches spend 20–30 minutes per session on operational catch-up" | for-coaches/faq (workload objection) | Stated as fact, no source cited | Add "based on early pilot observation" or "coaches report" |
| "Most coaches see ROI within 60 days" | for-coaches/faq (pricing FAQ) | No sample, no defined ROI metric | Soften to "coaches in our early pilot reported recovering prep time within 60 days" |
| "5 minutes per client per week" for coach review | for-coaches/faq (time-commitment FAQ) | Behavioral estimate, not a measured metric | Mark as estimated and add "varies by client activity level" |

---

### OVERCLAIMED — Stated as definite fact but not currently substantiated in this repo

| Claim | Source | Risk Level | Required Action |
|---|---|---|---|
| "We pass SOC 2 Type II audit" | for-coaches/faq (security FAQ, `id: security`) | **HIGH** — Categorical, constitutes a legal representation. SOC 2 Type II certification is not visible in repo. | **Remove or gate.** Replace with: "We are working toward SOC 2 Type II certification. Current security controls include [listed controls]. Detailed documentation available to enterprise partners under diligence process." |
| "SOC 2 Type II certified" | for-coaches/faq (objection: `id: data-risk`) | **HIGH** — Same issue, second instance | **Remove.** Same remediation as above. |
| "HIPAA-grade encryption" | for-coaches/faq (security FAQ) | **MEDIUM-HIGH** — "HIPAA-grade" implies HIPAA compliance, which has a specific regulatory meaning. AES-256 at rest and TLS 1.2+ in transit is accurate. HIPAA compliance itself is not established. | Replace "HIPAA-grade encryption" with "AES-256 encryption at rest and TLS 1.2+ in transit." |
| "Comply with GDPR and CCPA" | for-coaches/faq (security FAQ) | **MEDIUM** — GDPR and CCPA compliance is an ongoing operational and legal posture, not a binary state. Overstated as certain fact. | Replace with "Designed with GDPR and CCPA principles; data handling terms available in our privacy policy." |
| "Detailed security documentation is available under NDA" | for-coaches/faq (security FAQ) | **MEDIUM** — Implies a formal NDA process and documented security controls exist and are ready to deliver. If this process does not yet exist, this is a false promise. | Either confirm this process exists with a named owner and SLA, or replace with "security documentation available to enterprise partners through our partner diligence process." |
| "We have compliance documentation" for regulated industries | for-coaches/faq (compliance FAQ) | **LOW-MEDIUM** — Vague but potentially commits to a document that may not exist | Replace with "We can provide our current trust and governance materials for review." |

---

### ROADMAP — Features described as present that are on the product roadmap

| Claim | Source | Risk | Action |
|---|---|---|---|
| "Integration roadmap includes Salesforce and HubSpot sync" | for-coaches/faq (integration FAQ) | Correctly framed as roadmap. No action needed. | Confirm roadmap positioning is maintained. |
| "API access for custom workflows" | for-coaches/faq (objection: integration-roadmap) | Listed as roadmap item in same breath as current features | Add explicit "coming" label adjacent to API mention. |

---

## Summary Findings

- **2 HIGH risk claims** must be removed or replaced before next partner presentation.
- **3 MEDIUM risk claims** must be softened or gated.
- **3 DIRECTIONAL claims** need minor qualifiers added.
- **8 VERIFIED claims** are safe to retain with small caveating improvements.
- **2 ROADMAP claims** are correctly framed; one needs a clearer "coming" marker.

## Remediation Owner

Content Lead with Product Lead sign-off. Target sprint: ITS-2.
