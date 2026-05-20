# LinkedIn Contact Import — UX Copy & Backend API Contract

_Status: Spec · Version 1.0 · Starting Monday_

---

## Overview

When a user adds a company to their pipeline, Starting Monday asks if they want to see which LinkedIn connections work there. The user consents explicitly, uploads their LinkedIn data export, and the system matches connections to that company. No scraping, no bot access — LinkedIn's official data export only.

---

## UX Copy — Full Flow

### Trigger (shown after user adds a company)

> **"Want to see who you know at [Company Name]?"**
>
> Import your LinkedIn connections to find contacts at this company. Starting Monday never accesses your LinkedIn account — you download your own data and we match it locally.
>
> [**See my connections there**] · [Not now]

---

### Step 1 — Consent Gate

**Headline:** See who you know at [Company Name]

**Body:**

> To find your connections at this company, you'll download a copy of your LinkedIn data and upload it here. Starting Monday will:
>
> - Match connections by company name
> - Only store data you've explicitly imported
> - Never sell, share, or use your network to train models
> - Delete your imported data the moment you ask
>
> Your LinkedIn password is never used. This uses LinkedIn's official data export, so it always complies with their Terms of Service.

**Primary CTA:** I understand — get my LinkedIn export  
**Secondary CTA:** Cancel

---

### Step 2 — Download Instructions

**Headline:** Download your LinkedIn connections

**Body:**

> 1. Go to [LinkedIn Settings → Data Privacy → Get a copy of your data](https://www.linkedin.com/mypreferences/d/download-my-data)
> 2. Select **Connections** (you don't need the full archive)
> 3. LinkedIn will email you a download link — this usually takes a few minutes
> 4. Unzip the file and find **Connections.csv**
> 5. Upload it below

**File upload area:**

> Drop Connections.csv here, or click to browse
> _(Only .csv files · Max 5 MB)_

**Primary CTA:** Upload and find my contacts  
**Secondary CTA:** Cancel

---

### Step 3 — Processing State

> **Finding your connections at [Company Name]...**
>
> _(spinner)_
>
> Matching [N] connections against the company — this takes just a moment.

---

### Step 4a — Results Found

**Headline:** [N] connections at [Company Name]

**Sub-headline:** Based on your LinkedIn export from [date]

**For each match:**

> **[Full Name]** · [Title / Headline]  
> _(confidence badge: "Strong match" / "Possible match")_  
> [**Add to contacts**] · [Not this person]

**Footer note:**

> These are people from your LinkedIn network who list [Company Name] as their employer. Confidence is based on how closely the company name in their profile matches.
>
> [**Disconnect my LinkedIn data**] · [View privacy log]

---

### Step 4b — No Results

> **No connections found at [Company Name]**
>
> None of the connections in your export currently list [Company Name] as their employer. LinkedIn profiles change frequently — you can re-import any time.
>
> [**Try another company**] · [Delete my imported data]

---

### Step 5 — Contact Added Confirmation

> **[Full Name] added to your contacts.**
>
> You can find them in the Contacts tab for [Company Name].

---

### Revoke / Delete State (from Privacy Log or Settings)

> **Delete your imported LinkedIn data**
>
> This will permanently remove all [N] connections you imported on [date]. Any contacts you already added to Starting Monday will remain — only the original import data is deleted.
>
> [**Delete my data**] · [Keep my data]

**Post-deletion:**

> Your LinkedIn connection data has been deleted. The contacts you added are still in your pipeline.

---

### Error States

| Situation | Copy |
|-----------|------|
| Wrong file format | "That doesn't look like a LinkedIn Connections CSV. Make sure you're uploading **Connections.csv** from your LinkedIn data export." |
| File too large | "This file is larger than 5 MB. Download just the Connections export (not the full archive) and try again." |
| No connections in file | "We couldn't find any connections in that file. Make sure you selected **Connections** when requesting your LinkedIn data export." |
| Server error on upload | "Something went wrong storing your data. Please try again. If this keeps happening, contact support." |
| Import session revoked | "This import session has been deleted. Upload a new export to start fresh." |

---

## Backend API Contract

### Base path: `/api/linkedin-import/`

All routes require a valid session cookie. `requireAuth` is called at the top of every handler.

---

### POST `/api/linkedin-import/consent`

Records explicit consent and stages parsed connections.

**Request:** `multipart/form-data`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `file` | File (.csv) | ✓ | LinkedIn Connections.csv export |
| `method` | `'data_export'` \| `'portability_api'` | ✓ | How the user obtained the data |
| `purpose` | string | – | Default: `'company_contact_match'` |

**Response 200:**
```json
{
  "consent_id": "uuid",
  "connection_count": 312,
  "preview": [
    { "full_name": "Jane Smith", "headline": "VP Engineering", "company_name": "Acme Corp" }
  ]
}
```

**Error responses:**
- `400` — Missing file or invalid method
- `413` — File exceeds 5 MB
- `422` — No connections found in file
- `500` — Database write failure

---

### DELETE `/api/linkedin-import/consent?consent_id=<uuid>`

Revokes consent and deletes all staged imported connections for that session.

**Response 200:** `{ "ok": true }`  
**Error responses:** `400` missing param · `404` session not found

---

### GET `/api/linkedin-import/match?company_id=<uuid>&consent_id=<uuid>`

Returns imported connections that match the given company, with confidence scores.

**Response 200:**
```json
{
  "company": { "id": "uuid", "name": "Acme Corp" },
  "consent_id": "uuid",
  "match_count": 4,
  "matches": [
    {
      "imported_conn_id": "uuid",
      "full_name": "Jane Smith",
      "headline": "VP Engineering at Acme Corp",
      "company_name": "Acme Corp",
      "email": null,
      "linkedin_url": "https://www.linkedin.com/in/janesmith",
      "connected_on": "2023-01-15",
      "match_reason": "normalized_name",
      "confidence": "high",
      "already_promoted": false
    }
  ]
}
```

**Confidence levels:**

| Level | Trigger |
|-------|---------|
| `high` | Exact normalized company name match OR email domain match |
| `medium` | Partial name containment |
| `low` | Fuzzy / inferred (reserved for future ML scoring) |

**Match reasons:**

| Reason | Description |
|--------|-------------|
| `normalized_name` | Lowercased, punctuation-stripped company name matches exactly |
| `partial_name` | One name contains the other |
| `email_domain` | Email domain matches company website domain |

---

### POST `/api/linkedin-import/match`

Promotes a match to a full contact record. Creates a row in `contacts`.

**Request body:**
```json
{
  "imported_conn_id": "uuid",
  "company_id": "uuid",
  "consent_id": "uuid"
}
```

**Response 200:** `{ "contact_id": "uuid", "ok": true }`  
**Error responses:** `400` missing fields · `404` connection/company not found · `500` contact creation failed

---

### PATCH `/api/linkedin-import/match`

Dismisses a match suggestion. Records in `linkedin_contact_matches` with `dismissed_at`.

**Request body:**
```json
{
  "imported_conn_id": "uuid",
  "company_id": "uuid",
  "consent_id": "uuid"
}
```

**Response 200:** `{ "ok": true }`

---

### GET `/api/linkedin-import/audit?consent_id=<uuid>&limit=50&offset=0`

Returns the audit trail for a specific import session.

**Response 200:**
```json
{
  "consent": {
    "id": "uuid",
    "method": "data_export",
    "consented_at": "2025-06-01T12:00:00Z",
    "revoked_at": null,
    "data_deleted_at": null,
    "connection_count": 312
  },
  "events": [
    {
      "id": "uuid",
      "event_type": "consent_given",
      "event_data": { "method": "data_export", "connection_count": 312 },
      "occurred_at": "2025-06-01T12:00:00Z"
    }
  ],
  "total_count": 6,
  "limit": 50,
  "offset": 0
}
```

---

## Database Schema Summary

### `linkedin_import_consents`
Records every explicit consent action.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK → auth.users | RLS enforced |
| purpose | text | `'company_contact_match'` |
| method | text | `'data_export'` \| `'portability_api'` |
| consented_at | timestamptz | |
| revoked_at | timestamptz | null until user revokes |
| data_deleted_at | timestamptz | null until data wiped |
| raw_file_name | text | Original filename, audit only |
| connection_count | integer | |
| ip_hash | text | SHA-256 of IP, never raw |
| user_agent_hash | text | SHA-256 of UA, never raw |

### `linkedin_imported_connections`
Temporary staging of parsed LinkedIn export rows. Deleted on consent revocation.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK → auth.users | |
| consent_id | uuid FK → consents | Cascade delete |
| full_name | text | |
| headline | text | |
| company_name | text | Raw string from CSV |
| company_name_normalized | text | Lowercased, stripped |
| email | text | |
| connected_on | date | |
| linkedin_url | text | |
| source_row | jsonb | Original CSV row |

### `linkedin_contact_matches`
Records match decisions (promoted / dismissed) per connection × company pair.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| user_id | uuid FK | |
| consent_id | uuid FK → consents | |
| imported_conn_id | uuid FK → connections | Cascade delete |
| company_id | uuid FK → companies | Set null on delete |
| contact_id | uuid FK → contacts | Set when promoted |
| match_reason | text | `normalized_name` \| `email_domain` \| etc. |
| confidence | text | `high` \| `medium` \| `low` |
| promoted_at | timestamptz | |
| dismissed_at | timestamptz | |

### `linkedin_import_audit_events`
Append-only audit log. Users can read their own events, never update or delete.

**Event types:**

| Event | When |
|-------|------|
| `consent_given` | User submits consent form |
| `import_started` | Parsing + staging begins |
| `import_completed` | All connections staged |
| `import_failed` | Parse or insert error |
| `match_results_viewed` | User views match list for a company |
| `contact_promoted` | User clicks "Add to contacts" |
| `match_dismissed` | User clicks "Not this person" |
| `consent_revoked` | User initiates deletion |
| `data_deleted` | Staged data wiped from DB |

---

## Compliance Notes

- **No scraping.** All data comes from LinkedIn's official data export (user-initiated).
- **No profile data of third parties stored beyond 24 hours** per LinkedIn's Data Storage terms. The `linkedin_imported_connections` table stores only what the authenticated user themselves exported from their own account — this is the user's own data copy, not LinkedIn API profile data.
- **EU/EEA users:** Member Data Portability API (when LinkedIn makes it available) is a legitimate complement to the manual export flow.
- **Deletion is permanent.** `linkedin_imported_connections` rows cascade-delete when their `consent_id` is deleted. Audit events are retained per legal/compliance requirement but contain no PII.
- **IP and UA hashing.** Raw IPs and user-agent strings are never stored — only SHA-256 hashes for abuse detection.
