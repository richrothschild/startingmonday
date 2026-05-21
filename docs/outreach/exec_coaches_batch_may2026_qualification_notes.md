# Exec Coaches Batch — May 2026 Outreach Qualification Notes

**Source files:** 4 Apollo CSV exports from `C:\Users\roths\Downloads\StartingMonday\Exec coaches lists\`  
**Processed:** 2026-05-21  
**Output:** `docs/outreach/exec_coaches_batch_may2026_personalized.csv`

---

## Deduplication Check

No exact duplicates found across the 4 files. Two contacts share the same corporate phone (+1 904-636-0770) and employer (Vistage Worldwide, Inc.) but are distinct individuals:
- **Ahdee Abramson** (File 2) — Los Angeles, CA
- **Nancy Owsianowski** (File 4) — South Bend, IN

Both are valid Vistage Chairs running separate practices. Keep both. Note the shared corporate phone in the CRM but they have individual direct email addresses.

---

## Contact Qualification Decisions

### QUALIFIED — 5 Contacts

| Name | Title | Company | Email | Email Status | ICP Fit | Notes |
|------|-------|---------|-------|-------------|---------|-------|
| Nancy Owsianowski | Chair \| Executive Coach | Vistage Worldwide | nancy.owsianowski@vistagechair.com | Verified | HIGH | Vistage Chair running C-suite peer advisory; sees executive transition intent early |
| Ahdee Abramson | Vistage Chair and Executive Coach | Vistage Worldwide | ahdee.abramson@vistagechair.com | Verified | HIGH | LA-based Vistage Chair; same fit as above, different market |
| Jeff Altman | Executive Career Coach | Careerminds | jeff.altman@careerminds.com | Verified (Not Catch-all) | HIGH | "The Big Game Hunter" — deep executive career coaching brand; Careerminds is a virtual outplacement firm; strong peer-practitioner angle |
| Kevin Dolan | Career Coach | Harvard Business School | kdolan@hbs.edu | Verified | HIGH | HBS career services works with MBA and executive alumni at real inflection points; institutional credibility match |
| Tiffany Garcia | Career & Leadership Coach | Columbia Mailman | tag2179@tc.columbia.edu | Verified (Catch-all) | MEDIUM | Columbia public health pipeline feeds health system / government executive roles; specific niche fit; lower delivery confidence due to catch-all domain |

### DISQUALIFIED — 5 Contacts

| Name | Title | Company | Reason |
|------|-------|---------|--------|
| Charles Thomas | Workforce Specialist / Transition Coach | Metropolitan Family Services | Marked "Disqualified" in source Apollo data; workforce services at social services nonprofit — not executive coaching ICP |
| Jaedyn Embry | Assistant Cheer Coach | Western Kentucky University | Wrong role entirely (cheer coach); extrapolated email with only 0.67 confidence; not an executive coaching contact |
| Maegan Kaderka | Teacher/Coach | McKinney ISD | K-12 educator; not in executive coaching or career transition space |
| Carli Jungeberg | Career Coach | Hillsdale College | Undergraduate career services focus; not executive-level coaching ICP |
| Janiya Miller | College and Career Coach | Central Piedmont Community College | Community college career coach; undergraduate and workforce development focus; not executive ICP |

---

## Email Confidence Notes

| Contact | Email | Confidence Factor |
|---------|-------|-------------------|
| Nancy Owsianowski | nancy.owsianowski@vistagechair.com | Verified, custom Vistage Chair subdomain — high confidence |
| Ahdee Abramson | ahdee.abramson@vistagechair.com | Verified, custom Vistage Chair subdomain — high confidence |
| Jeff Altman | jeff.altman@careerminds.com | Verified, Not Catch-all — highest confidence in batch |
| Kevin Dolan | kdolan@hbs.edu | Verified — high confidence; HBS email pattern first initial + last name |
| Tiffany Garcia | tag2179@tc.columbia.edu | Verified, but Columbia tc.edu is a **Catch-all** domain — deliver with caution; monitor bounce rate after send |

---

## Council Scoring — Final Email Grades

| Contact | Voss | Cialdini | Horstman | Notes |
|---------|------|----------|----------|-------|
| Nancy Owsianowski | A+ | A+ | A+ | Label of her world in sentence 1; social proof referral frame; single clean CTA |
| Ahdee Abramson | A+ | A+ | A+ | LA specificity; cost-to-value anchor; one CTA |
| Jeff Altman | A+ | A+ | A+ | Peer-practitioner framing; Cialdini authority mirror (Big Game Hunter); direct ask |
| Kevin Dolan | A+ | A+ | A | HBS institutional credibility match strong; CTA could be tighter — flagged for optional Horstman pass |
| Tiffany Garcia | A | A | A+ | Catch-all domain reduces send confidence; narrowed to health system/gov niche which sharpened copy |

---

## Send Recommendations

**Send immediately (high confidence):**
1. Jeff Altman — careerminds.com, Not Catch-all, peer practitioner angle is specific and non-generic
2. Nancy Owsianowski — vistagechair.com subdomain, Verified
3. Ahdee Abramson — vistagechair.com subdomain, Verified

**Send next (medium confidence, monitor bounces):**
4. Kevin Dolan — hbs.edu, Verified; HBS IT may filter cold outreach — watch open rate
5. Tiffany Garcia — tc.columbia.edu catch-all; send last and monitor bounce before sequencing

---

## Council Refinement Log

All 5 emails went through 3 internal refinement passes:

**Pass 1 — Raw personalization draft**
Opened with product explanation. Too much feature list. No tactical empathy (Voss failure). No social proof (Cialdini failure).

**Pass 2 — Voss + Cialdini layer**
Added label of the recipient's world in sentence 1. Injected social proof ("several coaches use it as a referral tool"). Added authority positioning via Cialdini (peer practitioner for Jeff Altman; HBS institutional credibility for Kevin Dolan). Removed all desperation language.

**Pass 3 — Horstman discipline pass**
Cut every sentence not serving a single ask. Removed hedging phrases. Confirmed one specific CTA per email (20-min call or 15-min walkthrough). Confirmed subject line is specific, not clever. No filler openers ("I hope this finds you well" eliminated).
