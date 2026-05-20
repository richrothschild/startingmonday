# LinkedIn Contact Import — Overview for Chris Goodwin

_Starting Monday · Confidential · May 19, 2026_

---

## Why We Built This

One of the most powerful moments in a job search is realizing you already know someone at a target company. Starting Monday tracks companies and signals, but until now there was no way to surface warm connections automatically.

The vision: a user adds **Acme Corp** to their pipeline. Immediately, Starting Monday asks: _"Want to see who you know there?"_ If the user has LinkedIn connections who work at Acme, we show them — ranked by confidence — and let the user add them as contacts with a single click.

The challenge is doing this legitimately. LinkedIn's Terms of Service explicitly prohibit scraping, bots, and unauthorized automation. We spent time researching every compliant path (see Pros & Cons below) before committing to the implementation.

---

## What It Is

A **user-controlled, consent-first contact import flow** built entirely on LinkedIn's official data export. The user:

1. Adds a company to their pipeline
2. Gets prompted: _"Want to see who you know at [Company]?"_
3. Downloads their own LinkedIn data (LinkedIn → Settings → Get a copy of your data → Connections)
4. Uploads the **Connections.csv** file to Starting Monday
5. Starting Monday parses and matches connections to the target company by name and email domain
6. The user sees matched contacts with a confidence level (High / Medium), and can promote any of them to a full contact record or dismiss them
7. The user can delete their imported data at any time — one click, permanent

This is not automated. It is not continuous. It requires the user's active participation at every step. That is intentional.

---

## What It Is Not

| It is NOT | Why this matters |
|-----------|-----------------|
| A LinkedIn OAuth integration that pulls your network | LinkedIn's standard OAuth only returns the authenticated user's own profile data — not their connections. The API for connections requires special LinkedIn Partner access that is not available to most apps. |
| A scraper or bot | Fully prohibited by LinkedIn TOS §8.2. Any product doing this is operating illegally and at risk of cease-and-desist or lawsuit. |
| A continuous sync | We do not poll LinkedIn, store cookies, or re-fetch data without the user's explicit action. |
| A way to store other people's profiles | We store only the flat connection data (name, headline, company, email, connected date) from the user's own export — not full profiles of third parties. |
| An EU Member Data Portability API integration | LinkedIn's DMA-mandated portability API is a future enhancement path (EU/EEA/Switzerland only). The current implementation uses the manual export flow, which works globally. |

---

## Pros

**For users:**
- Works today, globally, with no special LinkedIn partnership required
- Surfaces warm connections the user may have forgotten about
- Entirely user-controlled — no ongoing access granted to Starting Monday
- One-click add to contacts or dismiss
- Full privacy log visible to the user at any time

**For Starting Monday:**
- Compliant with LinkedIn TOS — uses only the official data export path
- No PII stored beyond what the user explicitly provides
- Cascade deletes: revoking consent wipes all staged data
- Full audit trail for every action (consent, import, match view, promotion, dismissal, deletion)
- No dependency on LinkedIn API partnership or approval
- Differentiates Starting Monday from tools that scrape (legal risk) or tools that just don't do this at all

**Technically:**
- Built on existing infrastructure — uses the same `contacts` table and `requireAuth` patterns as the rest of the app
- 4 new database tables, all with Row Level Security
- Batch inserts handle large exports (300+ connections) efficiently
- IP and user-agent stored only as SHA-256 hashes — never raw

---

## Cons

**For users:**
- Requires a manual step (downloading from LinkedIn and re-uploading) — friction vs. a seamless OAuth flow
- LinkedIn's export can take a few minutes to generate (they email a link)
- Export data is a point-in-time snapshot — connections who change companies won't be reflected until the user re-imports
- Only matches on company name and email domain — no fuzzy matching on LinkedIn URL yet (planned)

**For Starting Monday:**
- No continuous sync — we cannot push new match suggestions as users' networks grow without a new upload
- Matching quality is dependent on how accurate LinkedIn profile data is (people leave old employers listed)
- The EU Member Data Portability API (a better path long-term) requires LinkedIn partnership and is only available in EU/EEA/Switzerland

**Strategically:**
- The friction of the manual export step will reduce conversion vs. a one-click OAuth flow — but no legitimate one-click OAuth flow for connection data exists
- Any competitor claiming to do this "automatically" is either scraping (illegal, risky) or has rare LinkedIn Partner status (expensive, slow to obtain)

---

## What Was Built

### Database (Migration 103)

Four new tables, all with Row Level Security so users can only see their own data:

| Table | Purpose |
|-------|---------|
| `linkedin_import_consents` | One row per import session. Records method, connection count, IP hash, UA hash, consent time, revocation time, and deletion time. |
| `linkedin_imported_connections` | Staged parsed rows from the CSV. Deleted when user revokes consent. Contains name, headline, company (raw + normalized), email, LinkedIn URL, connected date. |
| `linkedin_contact_matches` | Records each match decision: which connection was matched to which company, at what confidence, and whether the user promoted or dismissed it. |
| `linkedin_import_audit_events` | Append-only log of all actions. Users can read their own events; no updates or deletes allowed. |

---

### API Endpoints

#### `POST /api/linkedin-import/consent`
User uploads their LinkedIn Connections.csv. The system:
- Records explicit consent
- Parses and normalizes the CSV
- Stages all connections in the database
- Returns a `consent_id` and connection count

#### `DELETE /api/linkedin-import/consent?consent_id=<id>`
User revokes consent. The system permanently deletes all staged connections and marks the consent record as revoked.

#### `GET /api/linkedin-import/match?company_id=<id>&consent_id=<id>`
Returns all imported connections that match the given company, sorted by confidence (High first). Matching uses:
- Normalized company name (lowercased, punctuation stripped, legal suffixes removed)
- Email domain vs. company website domain

#### `POST /api/linkedin-import/match`
User clicks "Add to contacts." Creates a full contact record in the existing `contacts` table and marks the match as promoted.

#### `PATCH /api/linkedin-import/match`
User clicks "Not this person." Records the dismissal so the match is hidden from future views.

#### `GET /api/linkedin-import/audit?consent_id=<id>`
Returns the complete audit trail for an import session. Intended for a user-facing "Your data and privacy" view.

---

### UX Copy (Full Flow)

**Trigger** (shown after user adds a company):
> _"Want to see who you know at [Company Name]? Import your LinkedIn connections to find contacts at this company."_

**Consent gate** discloses exactly what Starting Monday will and will not do with the data before the user proceeds.

**Download instructions** walk the user through LinkedIn's export flow step by step.

**Results view** shows each matched connection with confidence badge ("Strong match" / "Possible match"), with "Add to contacts" and "Not this person" actions.

**Empty state, error states, and revocation states** are all written and handled.

---

### Audit Event Types

| Event | When it fires |
|-------|--------------|
| `consent_given` | User submits the consent form |
| `import_started` | CSV parsing begins |
| `import_completed` | All connections staged |
| `import_failed` | Parse or insert error |
| `match_results_viewed` | User views match list for a company |
| `contact_promoted` | User clicks "Add to contacts" |
| `match_dismissed` | User clicks "Not this person" |
| `consent_revoked` | User initiates deletion |
| `data_deleted` | Staged data wiped from database |

---

### Compliance Summary

- **Zero scraping.** All data comes from LinkedIn's official data export, user-initiated.
- **No third-party profile storage.** We store only flat connection data from the user's own export, not full profiles pulled via API.
- **PII minimization.** IP addresses and user-agent strings are stored only as SHA-256 hashes — never in raw form.
- **Right to deletion.** Revoking consent cascade-deletes all staged import data. The audit log is retained for compliance but contains no PII.
- **Transparency.** Every action is logged and readable by the user.

---

## Files Shipped

| File | Description |
|------|-------------|
| `supabase/migrations/103_linkedin_contact_import_and_consent.sql` | Database schema: 4 tables with RLS, indexes, and constraints |
| `src/app/api/linkedin-import/consent/route.ts` | Consent recording, CSV parse, staging, revocation |
| `src/app/api/linkedin-import/match/route.ts` | Match scoring, contact promotion, dismissal |
| `src/app/api/linkedin-import/audit/route.ts` | Audit trail read endpoint |
| `docs/linkedin-contact-import-spec.md` | Complete UX copy + full API contract reference |

**Git commit:** `2c94ecc` — pushed to `origin/main`, Railway auto-deploy triggered.

---

## What's Next (If We Want to Go Further)

| Idea | Effort | Notes |
|------|--------|-------|
| LinkedIn Member Data Portability API | Medium | EU/EEA/Switzerland only. Better UX than manual export — no download step. Requires LinkedIn partnership application. |
| Fuzzy name matching | Low | Catch cases like "McKinsey" vs. "McKinsey & Company" using edit-distance scoring |
| Re-import prompts | Low | Remind users to re-upload their export quarterly so the match data stays current |
| "Who do I know at all my target companies?" bulk view | Medium | Run matches across all companies in the user's pipeline at once |
| LinkedIn OAuth for identity linking | Low | Already supported via Sign In with LinkedIn (OIDC). Does NOT give connection data, but confirms identity and surfaces the user's own profile |

---

_Questions? Contact the Starting Monday engineering team._
