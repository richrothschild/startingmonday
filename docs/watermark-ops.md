# Watermark System — Internal Operations Guide

This document covers how to investigate a suspected content leak, the step-by-step decode process, database lookup, and maintenance responsibilities. For how the system works technically, see `docs/watermarking.md`.

---

## When to Use This

- A user's AI-generated content appears on LinkedIn, a public forum, a competitor's site, or in a press article without permission
- A screenshot of a dashboard page is shared publicly or sent to a competitor
- You suspect someone is sharing account access or redistributing output at scale
- A legal team asks you to confirm the source of a specific piece of content

---

## Investigation Playbook

### Step 1: Determine which watermark applies

| Evidence you have | Which watermark to use |
|------------------|----------------------|
| Text content (email body, doc, message) | Steganographic (invisible) |
| Screenshot or photo of a dashboard page | Visual overlay |
| Both | Start with visual (faster); confirm with steganographic if text is also available |

---

### Step 2a: Decode a steganographic watermark (text content)

Open a browser DevTools console (F12) on any page, or a Node.js REPL, and run:

```javascript
function decodeWatermark(text) {
  const ZWNJ = '‌'
  const ZWS  = '​'
  const ZWJ  = '‍'
  const match = text.match(/‌([​‍]{128})‌/)
  if (!match) return null
  const bits = match[1]
  let hex = ''
  for (let i = 0; i < 128; i += 4) {
    let nibble = 0
    for (let j = 0; j < 4; j++) if (bits[i + j] === ZWJ) nibble |= (1 << (3 - j))
    hex += nibble.toString(16)
  }
  return [hex.slice(0,8), hex.slice(8,12), hex.slice(12,16), hex.slice(16,20), hex.slice(20)].join('-')
}
```

Then paste the suspect content as a string and call it:

```javascript
const suspect = `paste the full text here — including any invisible characters`
decodeWatermark(suspect)
// Returns: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"  or  null
```

A return value of `null` means either no watermark is present or the characters were stripped. See the survival matrix in `docs/watermark-test-log.md`.

**Tip:** When copying text for analysis, use plain copy (Ctrl+C), not "Paste as plain text." The invisible characters live in the clipboard but are discarded by plain-text paste.

---

### Step 2b: Read a visual watermark from a screenshot

The user's email address is displayed directly in the overlay. Read it from the screenshot — no decoding required.

To confirm it is genuine (not a fabricated screenshot), recompute the geometry. The overlay parameters are fully deterministic from the email. In a Node.js console:

```javascript
function djb2(s) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (((h << 5) + h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function overlayParams(email) {
  const h = djb2(email)
  return {
    angle:   -(22 + (h % 12)),
    opacity: (28 + (h % 18)) / 1000,
    tileW:   380 + (h % 80),
    tileH:   160 + (h % 60),
    offsetX: h % 80,
    offsetY: (h >> 8) % 60,
  }
}

overlayParams('user@example.com')
```

Compare the returned angle and opacity against what is visible in the screenshot. If they match, the screenshot is authentic.

---

### Step 3: Look up the user in Supabase

Once you have a UUID (from steganographic decode) or an email (from visual watermark):

**By UUID:**
```sql
select u.id, u.email, u.created_at, p.full_name, u.last_sign_in_at
from auth.users u
left join public.user_profiles p on p.user_id = u.id
where u.id = 'paste-uuid-here';
```

**By email:**
```sql
select u.id, u.email, u.created_at, p.full_name, u.last_sign_in_at
from auth.users u
left join public.user_profiles p on p.user_id = u.id
where u.email = 'user@example.com';
```

**Check their subscription and activity:**
```sql
select subscription_status, last_briefing_sent_at, onboarding_completed_at
from user_profiles
where user_id = 'paste-uuid-here';
```

---

### Step 4: Document and escalate

1. Record the test in `docs/watermark-test-log.md` — date, content type, scenario, UUID recovered
2. Take a screenshot of the decode output with the UUID visible
3. Note the URL or context where the content was found
4. If legal action may follow: do not contact the user yet; escalate to legal counsel first with the UUID, email, and source URL

---

## Adding Watermarks to New Features

Any new AI-generated output surface must include the steganographic watermark. The pattern varies by output type:

**Streamed text response:**
```typescript
import { encodeUserId } from '@/lib/watermark'
// At the end of the stream, before controller.close():
controller.enqueue(encoder.encode(encodeUserId(userId)))
```

**Streamed response via ReadableStream wrapper:**
```typescript
import { appendWatermarkToStream } from '@/lib/watermark'
return new NextResponse(appendWatermarkToStream(readable, userId), { ... })
```

**Saved to database:**
```typescript
import { watermarkText } from '@/lib/watermark'
output_text: watermarkText(rawText, userId)
```

**Email HTML (worker):**
```javascript
import { watermarkEmailHtml } from '../lib/watermark.js'
const html = watermarkEmailHtml(renderedHtml, userId)
```

Run `/check-demo` after adding a new surface to confirm demo exclusion is in place.

---

## Maintenance Responsibilities

| Task | Frequency | Owner |
|------|-----------|-------|
| Run baseline copy-paste tests on new content types | On each new AI feature release | Engineering |
| Update survival matrix in watermark-test-log.md | Quarterly or when a test fails | Engineering |
| Review monthly audit report in docs/audits/ | Monthly | Engineering lead |
| Confirm watermark present in briefing emails | Monthly (check one sent email) | Engineering |
| Confirm visual overlay renders on dashboard | On each UI deploy | QA / Engineer |

---

## Known Limitations

- **Plain-text paste (Ctrl+Shift+V):** Some editors strip all non-printing Unicode. Watermark may not survive.
- **Screenshots:** Steganographic watermark is invisible in screenshots. Visual overlay is the only protection.
- **OCR pipelines:** Neither watermark survives optical character recognition of printed material.
- **Aggressive sanitizers:** Apps that enforce ASCII-only text (rare) will strip zero-width characters.
- **Manual retyping:** A human retyping content verbatim removes both marks.

These gaps are documented so that the watermarks are presented accurately in any legal proceeding — as probabilistic forensic evidence, not a perfect technical lock.
