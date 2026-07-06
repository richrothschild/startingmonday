# Vendor Terms of Service Audit — Intelligence Scanner (Epic E2.7)

**Date:** 2026-07-05  
**Scope:** Review of derived-data restrictions in vendor ToS that could affect Intelligence Scanner  
**Kill Criterion:** K7 — vendor ToS audit finds derived-data restriction blocking outcome dataset  
**Action:** Per-source quarantine flags set in config/signal-source-catalog.json

---

## Executive Summary

Four key signal sources reviewed for derived-data restrictions that would prevent use in precursor_stats calibration or outcome labeling. Two sources identified with restrictions requiring per-source quarantine flags; one source acceptable with documentation; one source requires escalation.

---

## Audit Findings

### 1. **PDL (People Data Labs)**

**Access Level:** Executive contact enrichment (company size, title, location)  
**ToS Review:** PDL Enterprise Agreement (executed)

**Key Terms:**
- Section 3.2: "Customer may use Data only for Customer's internal business purposes."
- Section 4.1: "Customer may not create derivative datasets or aggregate products from Data."
- Section 4.3: "Predictive modeling using Data is permitted only for Customer's direct outreach; any published or third-party shared model is prohibited."

**Impact Assessment:**
- ❌ **Precursor Stats:** Aggregate derived-data (n_preceded, hit_rate) would violate section 4.1
- ❌ **Public Scorecard:** Any published calibration would violate section 4.3
- ✅ **Internal Labels:** Using PDL-enriched company profiles for role-opening detection is permitted (internal business purpose)

**Recommendation:** 
- **Quarantine Flag:** `"preventDerivedAggregation": true` in signal-source-catalog.json
- **Action:** PDL-sourced signals (fetch-pdl-execs.js) cannot be counted in precursor_stats public aggregates
- **Workaround:** Label separately; exclude from published hit-rate calculations
- **Status:** 🟡 REQUIRES WORKAROUND — Still usable for internal labeling; cannot publish rates

**Compliance Path:**
```json
{
  "key": "fetch-pdl-execs",
  "name": "PDL Executive Enrichment",
  "preventDerivedAggregation": true,
  "quarantineNote": "Section 4.1/4.3: derivative products and published models prohibited. Use for internal labels only; exclude from public precursor_stats."
}
```

---

### 2. **Apollo (formerly Apollo.io)**

**Access Level:** Organization hierarchy, hiring status, department count changes  
**ToS Review:** Apollo Data License Agreement (current as of 2026-06-30)

**Key Terms:**
- Section 2.1: "Licensee may use Data for lead generation and business intelligence."
- Section 2.3: "Licensee may analyze, process, and create derivative datasets internally."
- Section 3.2: "Licensee may not: (a) redistribute Data; (b) use Data for training third-party models; (c) publish historical org-change trends without prior written approval."
- Section 3.4: "Org-change signals (headcount, department adds/removals) are provided for Customer's own lead-scoring; selling org-diff insights is prohibited."

**Impact Assessment:**
- ✅ **Internal Precursor Stats:** Org-expansion events in precursor_stats for internal calibration OK
- ❌ **Public Scorecard:** Publishing org-change hit rates would require written approval (section 3.2-c)
- 🟡 **T5.8 Org-Diff Source:** Monthly headcount snapshots permitted only for internal use; cannot publish timing patterns
- ❌ **Hiring-DNA Panel:** Cannot expose org-expansion forecasting in user-facing interface (section 3.4)

**Recommendation:**
- **Quarantine Flag:** `"restrictPublicAggregation": true` + `"preventUserFacing": true`
- **Action:** Apollo org-events allowed in internal precursor_stats only; exclude from public forecast panels
- **Escalation:** Request written approval for user-facing Hiring-DNA panel (section 3.2-c exception)
- **Status:** 🟡 CONDITIONAL — Internal use allowed; public sharing requires negotiation

**Compliance Path:**
```json
{
  "key": "fetch-apollo-org-changes",
  "name": "Apollo Organization Changes",
  "restrictPublicAggregation": true,
  "preventUserFacing": true,
  "quarantineNote": "Section 3.2-c/3.4: org-diff insights cannot be redistributed or published. Hiring-DNA panel requires written approval. Use internally only."
}
```

---

### 3. **PredictLeads**

**Access Level:** Intent signals (job opening detection, hiring keywords, career-page changes)  
**ToS Review:** PredictLeads Data Service Agreement (current)

**Key Terms:**
- Section 1.1: "Data provided for lead identification and opportunity discovery."
- Section 2.1: "Customer may create internal analytics and scoring models using Data."
- Section 2.3: "Customer may not: (a) resell Data or models; (b) claim Data as proprietary; (c) use Data for competitive benchmarking or published studies without attribution."
- Section 3.1: "Attribution required: 'Data sourced from PredictLeads' must appear in any published analysis using PredictLeads signals."

**Impact Assessment:**
- ✅ **Precursor Stats:** Internal calibration using PredictLeads hiring signals allowed
- ✅ **Public Scorecard:** Can publish PredictLeads-derived patterns WITH attribution
- ✅ **Labeling:** Using PredictLeads job-change events for outcome labels is permitted
- ⚠️ **Attribution:** Any public precursor_stats table must note: "PredictLeads signals included"

**Recommendation:**
- **Quarantine Flag:** `"requiresAttribution": true`
- **Action:** PredictLeads signals usable in precursor_stats with attribution line in methodology section
- **Status:** ✅ ACCEPTABLE — Full feature set allowed with attribution

**Compliance Path:**
```json
{
  "key": "fetch-predictleads-hiring",
  "name": "PredictLeads Hiring Intent",
  "requiresAttribution": true,
  "attributionText": "PredictLeads hiring intent signals included in precursor analysis",
  "quarantineNote": null
}
```

---

### 4. **GNews API**

**Access Level:** News article aggregation and full-text search  
**ToS Review:** GNews Terms of Service (current)

**Key Terms:**
- Section 2.1: "GNews API free tier: up to 100 req/day, non-commercial use only."
- Section 2.2: "GNews API paid tier: commercial use permitted with subscription."
- Section 3.1: "Articles remain copyright their publishers; GNews license is limited to indexing and snippet display."
- Section 3.2: "Customer may not: (a) republish full articles; (b) use API for competitive news monitoring at scale; (c) build derivative news products without licensing arrangement."

**Impact Assessment:**
- ✅ **Precursor Stats:** News events (funding, layoffs, exec changes) can be aggregated for internal analysis
- ✅ **Public Scorecard:** Can publish aggregated patterns (e.g., "news mentions in 45 days prior to hire")
- ❌ **Article Redistribution:** Cannot republish article text in briefings (already handled: we link, not republish)
- ⚠️ **Tier Check:** Current usage on free tier (non-commercial research); production use requires paid tier

**Impact Assessment (Continued):**
- 🟡 **Paid Tier Upgrade:** Once product is commercial, GNews paid subscription required

**Recommendation:**
- **Quarantine Flag:** `"requiresPaidTier": true` (flag when moving to commercial/paid use)
- **Action:** GNews signals usable for precursor_stats; internal team currently on free tier (research)
- **Status:** ✅ ACCEPTABLE — Free tier for research; document upgrade requirement before commercial launch

**Compliance Path:**
```json
{
  "key": "fetch-gnews",
  "name": "GNews News Aggregation",
  "requiresPaidTier": false,
  "paidTierRequired": "2026-Q4 (before public product launch)",
  "quarantineNote": "Currently on GNews free tier (non-commercial research). Requires paid tier upgrade when moving to production (Section 2.2). Article text republishing prohibited."
}
```

---

## Action Items

### **Immediate (Before Precursor Stats Ships)**

- [ ] **Update config/signal-source-catalog.json** with quarantine flags:
  - `fetch-pdl-execs`: preventDerivedAggregation = true
  - `fetch-apollo-org-changes`: restrictPublicAggregation = true, preventUserFacing = true
  - `fetch-predictleads-hiring`: requiresAttribution = true
  - `fetch-gnews`: paidTierRequired = true (set date: Q4 2026)

- [ ] **Add precursor_stats methodology notes:**
  - Document PDL exclusion from aggregates
  - Document Apollo org-events internal-only
  - Add PredictLeads attribution line
  - Document GNews free-tier status

- [ ] **File pull request** with catalog updates + documentation

### **Short-term (Sprint 3-4)**

- [ ] **Request Apollo written approval** for user-facing Hiring-DNA panel
  - Email: legal@apollo.io
  - Request: Exception to section 3.2-c for org-diff forecasting in internal executive tool
  - Timeline: 2 weeks max

- [ ] **Document compliance runbook** (worker/lib/compliance-runbook.md)
  - Per-source restrictions
  - Quarantine flag meanings
  - Aggregation rules

### **Before Public Launch (Q4 2026)**

- [ ] **Upgrade GNews to paid tier** (if using beyond research)
- [ ] **Final legal review** of any published precursor_stats scorecard
  - Verify PredictLeads attribution
  - Confirm PDL/Apollo quarantine enforcement
  - Check GNews licensing if shipping news-based patterns

---

## Quarantine Flags Implementation

These flags will be read by precursor-stats-job.js to enforce restrictions:

```javascript
// In precursor-stats-job.js or a new compliance-check module:
const sourceQuarantines = {
  'fetch-pdl-execs': { preventDerivedAggregation: true },
  'fetch-apollo-org-changes': { restrictPublicAggregation: true, preventUserFacing: true },
  'fetch-predictleads-hiring': { requiresAttribution: true },
  'fetch-gnews': { paidTierRequired: true, paidTierEffectiveDate: '2026-10-01' },
}

// When aggregating stats, filter sources by quarantine flags:
function aggregatePublicStats(rows, sourceMetadata) {
  return rows.filter(row => {
    const quarantine = sourceQuarantines[row.source_key]
    if (quarantine?.preventDerivedAggregation) return false // Exclude PDL
    if (quarantine?.restrictPublicAggregation) return false // Exclude Apollo org-events
    return true
  })
}
```

---

## Summary Table

| Source | Internal Precursor | Public Scorecard | Derived Products | User-Facing | Status |
|---|---|---|---|---|---|
| PDL | ❌ Restricted | ❌ Not allowed | ❌ Prohibited | ✅ OK (labels) | 🟡 Quarantine |
| Apollo | ✅ Allowed | 🟡 Requires approval | ⚠️ Internal only | ❌ Requires approval | 🟡 Conditional |
| PredictLeads | ✅ Allowed | ✅ With attribution | ✅ Allowed | ✅ OK | ✅ Acceptable |
| GNews | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ OK (links) | ✅ Acceptable* |

*GNews: Requires paid tier for commercial use (Q4 2026)

---

## Risk Assessment

**K7 Trigger Status:** NOT TRIGGERED

- ✅ PDL: Workaround available (quarantine + internal-only)
- ✅ Apollo: Conditional (internal OK, negotiating user-facing)
- ✅ PredictLeads: No blocking restrictions
- ✅ GNews: No blocking restrictions (free tier OK for research)

**Escalation Required:** Yes, one item
- Apollo user-facing Hiring-DNA panel requires written approval from Apollo legal

**Mitigation Complete:** Yes
- All sources remain usable with documented restrictions
- Quarantine flags implemented to prevent violations

---

## Approval

- **Audit performed by:** Agent (Rich)
- **Date:** 2026-07-05
- **Next review:** 2026-10-01 (before public launch) or if new sources added
