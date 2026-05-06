# Watermark Test Observation Log

Each row records a single test: what content was tested, how it was handled, whether the watermark survived, and what was recovered. Add a row whenever you run a verification test.

---

## How to Add an Entry

1. Generate or copy AI content from a live user account (use a test account, not production users)
2. Perform the action under "Scenario"
3. Paste the result into the decode function (see `docs/watermark-ops.md`)
4. Record the UUID recovered (or "not recovered") and any notes

---

## Log

| Date | Tester | Content Type | Scenario | Watermark Present | UUID Recovered | Notes |
|------|--------|-------------|----------|------------------|----------------|-------|
| 2026-05-06 | RR | Strategy brief | Copy from browser, paste into Google Docs | — | — | Baseline test pending |
| 2026-05-06 | RR | Outreach draft | Copy from browser, paste into Gmail compose | — | — | Baseline test pending |
| 2026-05-06 | RR | Briefing email | Received in Gmail, forward to second account | — | — | Baseline test pending |
| 2026-05-06 | RR | Prep brief | Copy from browser, paste into Notion | — | — | Baseline test pending |
| 2026-05-06 | RR | Saved brief (DB) | Read output_text from Supabase SQL editor | — | — | Baseline test pending |

---

## Survival Matrix

Update this table as tests are completed.

| Scenario | Steganographic survives | Visual survives | Notes |
|----------|------------------------|-----------------|-------|
| Copy-paste into Google Docs | ? | No | |
| Copy-paste into Notion | ? | No | |
| Copy-paste into Gmail compose | ? | No | |
| Copy-paste into Slack | ? | No | |
| Copy-paste into Word | ? | No | |
| "Paste as plain text" (Ctrl+Shift+V) | ? | No | May strip zero-width chars |
| Export to PDF via browser print | ? | Yes (screenshot-like) | |
| Screenshot | No | Yes | Stego chars not visible |
| Email forwarding (HTML preserved) | ? | No | |
| Email forwarding (plain text fallback) | ? | No | |
| Download as .txt and re-open | ? | No | |
| Supabase DB read (output_text column) | Yes | No | Raw storage |

---

## Decoded UUID Reference

When a UUID is recovered, look it up here before querying the database — avoids unnecessary DB access for known test accounts.

| UUID | Account | Notes |
|------|---------|-------|
| *(add test account UUIDs here)* | | |

---

## Issues Found

| Date | Issue | Status | Resolution |
|------|-------|--------|------------|
| *(none yet)* | | | |
