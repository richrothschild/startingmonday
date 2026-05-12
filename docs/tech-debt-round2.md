# Technical Debt — Round 2

Scanned May 12, 2026. Round 1 (15 items) is fully resolved. This document covers the 7 new items found in the follow-up scan.

---

## High Priority

### Fix 1 — Sentry gaps in 8 API routes

These routes catch errors with `console.error` instead of `Sentry.captureException`. Failures are invisible in Sentry.

Pattern to apply in each catch block:

```typescript
import * as Sentry from '@sentry/nextjs'
// replace:
console.error('[route] error msg', err)
// with:
Sentry.captureException(err, { extra: { route: 'route-name', userId } })
```

| File | Line | Context |
|---|---|---|
| `src/app/api/admin/social/[id]/schedule/route.ts` | 41 | Make.com webhook failure |
| `src/app/api/admin/social/morning/route.ts` | 148 | Make.com webhook failure |
| `src/app/api/companies/quick-add/route.ts` | 38 | DB insert error |
| `src/app/api/salary-intelligence/route.ts` | 97 | AI request error |
| `src/app/api/webhooks/stripe/route.ts` | 32 | Stripe signature verification failure |
| `src/app/api/linkedin-import/extract/route.ts` | 33 | PDF/text extraction failure |
| `src/app/api/profile/upload-resume/route.ts` | 66, 81 | Parse error + Supabase write error |
| `src/app/api/offer-synthesis/route.ts` | 118 | AI synthesis error |

---

### Fix 2 — Unauthenticated `notify/new-user` POST + HTML injection

`src/app/api/notify/new-user/route.ts`

Two issues in one file:

1. **No auth check, no rate limit.** Any caller can POST to this endpoint and trigger an email to `OWNER_EMAIL`. Add a shared secret check (same pattern as `validateCronRequest`) or an IP allowlist limited to the app's own origin.

2. **`${email}` and `${tierLabel}` are interpolated directly into the HTML template** without escaping. An attacker can craft a payload that injects HTML into the owner notification. Apply the `escHtml()` helper (already defined in `src/app/api/partners/route.ts`) to both values before interpolation.

---

## Medium Priority

### Fix 3 — Stale `as unknown as` casts in cron routes

Round 1 added `database.types.ts` with all 30 tables. These casts predate that work — the columns are now properly typed AND included in the `.select()` string, so the casts are dead weight. Remove them and access the property directly.

| File | Lines | Field |
|---|---|---|
| `src/app/api/cron/stall-check/route.ts` | 64, 141 | `stall_nudge_dismissed_at`, `positioning_summary` |
| `src/app/api/cron/commitment-friday/route.ts` | 65, 102 | `weekly_goal` |
| `src/app/api/cron/commitment-sunday/route.ts` | 62, 99 | `weekly_goal` |

Example — change this:

```typescript
const dismissed = (p as unknown as { stall_nudge_dismissed_at?: string | null }).stall_nudge_dismissed_at
```

To this:

```typescript
const dismissed = p.stall_nudge_dismissed_at
```

---

### Fix 4 — Remaining `as unknown as` in dashboard pages

Same root cause as Fix 3. These dashboard pages still cast Supabase query results even though `database.types.ts` now covers all these columns and Supabase infers the type from the `.select()` string.

Note: Some casts elsewhere in the codebase are structural SDK limitations (Supabase FK join returning a union type, Anthropic `MessageParam` content type). Those are intentional. Only remove casts where the column is a direct field on the queried table.

| File | Lines | Type being cast |
|---|---|---|
| `src/app/(dashboard)/dashboard/calendar/page.tsx` | 92–93 | `FollowUp[]` |
| `src/app/(dashboard)/dashboard/page.tsx` | 205–206 | `SignalRow[]` |
| `src/app/(dashboard)/dashboard/contacts/[id]/page.tsx` | 86 | `ContactRow` |
| `src/app/(dashboard)/dashboard/contacts/[id]/edit/page.tsx` | 46 | `ContactRow` |
| `src/app/(dashboard)/dashboard/contacts/page.tsx` | 36 | `ContactListItem[]` |
| `src/app/(dashboard)/dashboard/signals/page.tsx` | 105 | `Signal[]` |
| `src/app/(dashboard)/dashboard/offers/page.tsx` | 39 | `OfferCompany[]` |
| `src/app/(dashboard)/dashboard/companies/[id]/page.tsx` | 217–221 | `SignalDetailRow[]`, `ScanResult[]`, `InterviewLog[]` |

---

## Low Priority

### Fix 5 — Stripe `as any` in billing routes

`src/app/api/billing/pause/route.ts:23` and `src/app/api/billing/resume/route.ts:23` both cast `getStripe().subscriptions as any` to access `pause_collection`, which Stripe's TypeScript types do not expose.

Options in order of preference:
1. Add a module augmentation in `src/lib/stripe.ts` to extend `Stripe.SubscriptionUpdateParams` with `pause_collection`
2. Wait for Stripe SDK to expose this type natively
3. Leave as-is (functionally correct, type-checked at runtime by Stripe)

---

### Fix 6 — `profile/export` uses inline auth instead of `requireAuth` helper

`src/app/api/profile/export/route.ts:4–7` does its own `supabase.auth.getUser()` + `if (!user)` check. Every other authenticated route uses the `requireAuth` (or `requireFeatureAccess`) helper from `src/lib/require-auth.ts`. Inconsistent patterns make auth audits harder.

Replace the inline check with `requireAuth(request)` matching the standard pattern.

---

### Fix 7 — Email injection in owner notification (see Fix 2 for context)

Covered under Fix 2. Listed separately here for tracking: even after adding an auth/rate-limit check, the HTML injection in the email template is an independent issue that should be fixed regardless.

---

## What is intentionally NOT on this list

- `console.error` and `console.log` in `src/lib/trace.ts` and `src/lib/stream-error.ts` — these are the structured JSON logging system and are tested
- `dangerouslySetInnerHTML` in `src/app/demo/page.tsx` — the `renderInline()` function runs `escapeHtml()` first; no XSS risk
- `as unknown as { name: string }` on FK joins (e.g., `fu.companies`, `sig.companies`) — Supabase returns a union type for joined tables; the cast is required
- `as any` in `src/app/terms/page.tsx` and `src/app/privacy/page.tsx` — Termly embed attribute workaround; no better option without patching the Termly script
