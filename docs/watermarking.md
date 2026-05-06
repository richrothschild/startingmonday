# Starting Monday — Watermarking System

Starting Monday embeds two distinct watermarks into all AI-generated content and dashboard pages. One is invisible and forensic (steganographic); the other is visible but subtle (visual overlay). Together they allow us to identify the source user if content is copied, shared without permission, or screenshotted.

---

## 1. Steganographic Watermark (Invisible)

### What it is

Every piece of AI-generated text — strategy briefs, prep briefs, outreach drafts, and briefing emails — contains 130 invisible Unicode characters embedded in the body. These characters are not spaces. They are zero-width Unicode codepoints that render as nothing but survive copy-paste across browsers, email clients, Slack, Google Docs, and most document editors.

### How it works

The user's Supabase UUID (e.g. `a1b2c3d4-e5f6-7890-abcd-ef1234567890`) is encoded as a 128-bit binary string. Each bit maps to one of two invisible characters:

| Character | Unicode | Name | Meaning |
|-----------|---------|------|---------|
| `‌` | U+200C | Zero-Width Non-Joiner (ZWNJ) | Boundary marker (start and end) |
| `​` | U+200B | Zero-Width Space (ZWS) | Bit 0 |
| `‍` | U+200D | Zero-Width Joiner (ZWJ) | Bit 1 |

The UUID's 32 hex characters are converted to 128 bits. Those bits become a 128-character string of ZWS/ZWJ characters, bookended by two ZWNJ characters, producing 130 invisible characters total.

**Insertion position varies per user.** For multi-paragraph text, the watermark is not always appended at the end. The insertion index is derived from a simple hash of the userId, so it falls at a different paragraph boundary for each user. This makes the watermark harder to locate by trial and error.

**Email watermarking** uses the same encoding but injects it into a zero-height `<span>` element placed just before `</body>` in the HTML email, invisible in all email clients.

### Where it is applied

| Surface | Method | File |
|---------|--------|------|
| Strategy brief (streamed) | Appended as final stream chunk | `src/app/api/strategy/route.ts` |
| Prep brief (streamed) | Appended as final stream chunk | `src/app/api/prep/[id]/route.ts` |
| Outreach draft (streamed) | Wrapped via `appendWatermarkToStream` | `src/app/api/outreach/draft/route.ts` |
| Saved briefs (DB) | Embedded via `watermarkText` before insert | `src/app/api/briefs/save/route.ts` |
| Daily briefing email | Injected into HTML via `watermarkEmailHtml` | `worker/jobs/briefing-job.js` |

### How to decode a watermark

**Method 1: Node.js / browser console**

Paste the suspected text into the console and run:

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

// Paste the watermarked text as a string, then:
decodeWatermark(suspectText)
// Returns: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"  (the user's UUID)
```

**Method 2: Direct database lookup**

Once you have the UUID, look up the user in Supabase:

```sql
select id, email, created_at
from auth.users
where id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
```

**Method 3: Verify presence without decoding**

To confirm a watermark exists (without caring which user):

```javascript
/‌[​‍]{128}‌/.test(text)  // true if watermarked
```

**Method 4: Use the built-in decode function**

The function `decodeWatermark` is exported from `src/lib/watermark.ts` and `worker/lib/watermark.js` and can be imported anywhere in the codebase for programmatic use.

### Limitations and survival

The watermark survives:
- Copy-paste in Chrome, Firefox, Safari, Edge
- Paste into Gmail, Outlook, Google Docs, Notion, Slack
- Most PDF export workflows
- HTML email clients (Gmail, Outlook, Apple Mail)

The watermark may not survive:
- "Paste as plain text" in some editors that strip all Unicode (rare)
- OCR of screenshots (characters are not visible)
- Aggressive text sanitization that strips all non-ASCII characters
- Manual retyping of the content

---

## 2. Visual Watermark Overlay (Visible)

### What it is

Every logged-in dashboard page displays a tiled, semi-transparent overlay showing the user's email address and "Starting Monday · Confidential" in repeating diagonal text. It is visible when the screen is photographed or screenshotted, but subtle enough not to interfere with normal use.

### How it works

The overlay is a fixed-position `<div>` that covers the entire viewport at z-index 9998. It has `pointer-events: none` so it does not interfere with clicks. The tile pattern is an inline SVG rendered as a CSS `background-image`.

**Geometry is deterministic and unique per user.** The user's email address is hashed using the djb2 algorithm, and the resulting integer seeds all visual parameters:

| Parameter | Range | Derivation |
|-----------|-------|------------|
| Rotation angle | -22° to -33° | `-(22 + (hash % 12))` |
| Opacity | 0.028 to 0.045 | `(28 + (hash % 18)) / 1000` |
| Tile width | 380px to 459px | `380 + (hash % 80)` |
| Tile height | 160px to 219px | `160 + (hash % 60)` |
| Tile offset X | 0px to 79px | `hash % 80` |
| Tile offset Y | 0px to 59px | `(hash >> 8) % 60` |

This means two different users viewing the same page will see overlays with different angles, spacing, and opacity. The same user always sees the same overlay — it is stable across sessions and devices.

### Where it is applied

The overlay is rendered in `src/app/(dashboard)/layout.tsx` for all dashboard pages. It is excluded from:
- The demo account (identified by `DEMO_USER_ID` environment variable)
- Any unauthenticated page

### Identifying a source from a screenshot

If a screenshot of a dashboard page is shared, the visible watermark identifies the user directly by their email address. No decoding is needed. The geometry (angle, spacing, opacity) can be used as a secondary confirmation by recomputing the djb2 hash of the email and checking the parameters match.

---

## Summary

| Watermark type | Survives copy-paste | Survives screenshots | Identifies user |
|---------------|---------------------|---------------------|-----------------|
| Steganographic (invisible) | Yes | No | Via UUID lookup in Supabase |
| Visual overlay | No | Yes | Directly (email visible) |

Used together, any content that leaves the platform — whether copied as text or photographed as an image — carries identifying information back to the originating account.
