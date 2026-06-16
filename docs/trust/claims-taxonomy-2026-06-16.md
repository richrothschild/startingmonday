# Claims Taxonomy and Public Proof Policy (2026-06-16)

Owner: Product Lead
Sprint: ITS-1
Status: active
Review cadence: quarterly or after any material product or evidence change
Next review: 2026-09-16

---

## Purpose

This document defines the four-tier claims taxonomy used across all Starting Monday public and partner-facing materials. Every claim made in product copy, public pages, trust packs, partner materials, and sales collateral must be assigned one of these four tiers before publication.

No claim may be published without a tier assignment. Unclassified claims are automatically treated as OVERCLAIMED until reviewed.

---

## Tier Definitions

### Tier 1: VERIFIED

Definition:
A claim is Verified if it meets all three of the following conditions:
1. It is drawn from a named or disclosed data source (e.g., "Jan-May 2026 pilot cohort, n=27").
2. The measurement methodology is documented and linked or disclosed inline.
3. The claim is expressed with the caveats appropriate to its sample size and date window.

How to express Tier 1 claims:
- Always include sample size or cohort identifier.
- Always include the date window.
- Use language like "in our Jan-May 2026 pilot cohort (n=27)..." not "research shows..." or "users experience..."

Examples:
- "81% of Jan-May 2026 pilot executives (n=27) reached a first interview within 30 days."
- "Median time from setup to first qualified outreach was 9 days in the same cohort."

---

### Tier 2: DIRECTIONAL

Definition:
A claim is Directional if it is based on observed pattern or qualitative evidence but does not meet the full bar for Verified (e.g., no sample size, no formal measurement window, coach-reported rather than client-verified).

How to express Tier 2 claims:
- Use hedging language: "early pilot observation suggests," "coaches report," "based on observed usage patterns."
- Never use categorical certainty language.
- If upgrading to Verified, document the evidence path and assign an owner.

Examples:
- "Coaches in our early pilot report spending less session time on context rebuild."
- "Based on observed usage, most clients spend approximately 5 minutes per week on pipeline updates."

---

### Tier 3: DILIGENCE-GATED

Definition:
A claim is Diligence-Gated if the underlying documentation or certification exists (or will exist on a named timeline) but is not appropriate to assert as a public-facing fact because:
- It requires a formal review process before being shared.
- It involves legal, compliance, or security documentation that changes and must be reviewed in context.
- It is contract-specific or partner-specific and cannot be generalized.

How to express Tier 3 claims publicly:
- Acknowledge the category exists without asserting the specific claim as public fact.
- Point to the diligence request process.

Examples:
- "Detailed security documentation is available to enterprise partners through our diligence request process." (NOT: "We are SOC 2 Type II certified.")
- "Compliance materials for regulated industries are available on request." (NOT: "We comply with GDPR and CCPA.")

---

### Tier 4: ROADMAP

Definition:
A claim is a Roadmap item if it describes a planned capability that does not yet exist in production.

How to express Tier 4 claims:
- Always clearly label as "planned," "coming," "on our roadmap," or "in development."
- Never combine a roadmap item with present-tense feature language without a clear separator.
- Roadmap items may be discussed in partner conversations as direction but cannot be sold as present capability.

Examples:
- "Salesforce sync is on our roadmap for Q3 2026."
- "API access for custom workflows is planned for enterprise accounts."

---

## Publication Rules

1. Every claim must have a tier assigned before a page is published or updated.
2. Only Content Lead and Product Lead can assign tiers.
3. Tier 1 claims require named evidence links before assignment.
4. Tier 3 claims require a named owner for the diligence process.
5. Tier 4 claims require a roadmap item owner and approximate timeline.
6. Claims may be downgraded (e.g., from Tier 1 to Tier 2) if evidence becomes stale or sample size is insufficient.
7. Claims may never be upgraded without new evidence.

---

## Forbidden Language Patterns

The following language patterns are prohibited in public materials unless the claim has been verified and tagged Tier 1:

| Forbidden Pattern | Why | Allowed Replacement |
|---|---|---|
| "We pass SOC 2 Type II" | Certifications must be current and verifiable | "We are pursuing SOC 2 Type II. Controls documentation available through diligence process." |
| "HIPAA-grade encryption" | HIPAA implies a regulatory compliance posture | "AES-256 at rest, TLS 1.2+ in transit." |
| "GDPR and CCPA compliant" | Compliance is ongoing and context-dependent | "Designed with GDPR and CCPA principles." |
| "Research shows" / "studies show" | Implies external research that does not exist | Cite the actual source or remove |
| "Placement outcomes improve" | Causal outcome claim requiring RCT-level evidence | "Programs using the operating layer show stronger early-stage momentum metrics." |
| "Guaranteed" in any context | No guarantees in search outcomes | Remove or replace with observed evidence |
| "Users experience" without sample | Implies universal experience | "In our pilot, users reported..." |

---

## Evidence Freshness Policy

| Evidence age | Status | Action |
|---|---|---|
| 0–6 months | Current | No action required. |
| 6–12 months | Aging | Add date disclosure. Flag for refresh. |
| 12+ months | Stale | Downgrade to Directional or remove. Requires new evidence to restore. |
| No date disclosed | Unclassified | Treat as Directional until dated. |

---

## Owner and Review

| Role | Responsibility |
|---|---|
| Content Lead | Assigns tiers to all copy before publication. |
| Product Lead | Signs off on any Tier 1 claim and all policy changes. |
| Legal/Compliance | Reviews any Tier 3 diligence claim language before publication. |
| Operations Lead | Maintains artifact register and freshness dates. |

---

## Related Documents

- docs/trust/coach-claims-audit-2026-06-16.md
- docs/trust/outplacement-claims-audit-2026-06-16.md
- docs/trust/artifact-ownership-register-2026-06-16.md
- docs/trust/named-proof-asset-intake-2026-06-16.md
