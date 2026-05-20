# LinkedIn Posting Schedule (Auto-Post)

## Objective

Run a founder-first LinkedIn system that publishes automatically three times per week while preserving audience rotation, message discipline, and company-page amplification.

## Publishing Surface Decision

- Founder profile is the primary publishing surface.
- Company page reposts or adapts selected founder posts the same day.
- Company page can be the automation target only after the company-page baseline is strong enough to justify native distribution.

## Weekly Cadence (America/Chicago)

| Day | Time | Primary audience | Angle | Default surface |
| --- | --- | --- | --- | --- |
| Monday | 8:35 AM | Rotating audience | Search craft, timing, or execution discipline | Founder profile |
| Wednesday | 8:45 AM | Rotating audience | Market signal, shortlist quality, or momentum | Founder profile |
| Friday | 8:35 AM | Rotating audience | Contrarian reframe or engagement prompt | Founder profile |

The exact audience and pillar on a given date are determined by `src/lib/social-posting-plan.ts`.

## Active Source of Truth

- Live rotation and post copy: `src/lib/social-posting-plan.ts`
- Daily admin drafting surface: `/dashboard/admin/social`
- Weekday queue seeding script: `npm run seed:social`
- Auto-post endpoint: `/api/admin/social/morning`
- Worker scheduler: `worker/index.js` via `runSocialPostJob`

## Automation Flow

1. `npm run seed:social` clears future unposted rows and inserts the next 42 calendar days of M/W/F posts.
2. The worker calls `/api/admin/social/morning` on the exact Chicago-time M/W/F schedule.
3. That route pulls the scheduled draft for the day, refreshes stale unposted copy from `src/lib/social-posting-plan.ts`, and sends it to Make.
4. Make publishes to the configured LinkedIn target.
5. The row is marked posted in `social_posts`.

## Operator Workflow

1. Seed the next 42-day queue after any major copy rewrite: `npm run seed:social`
2. Review today’s draft in `/dashboard/admin/social`
3. Adjust copy only when there is a better real-world observation than the default
4. Keep `LINKEDIN_POST_TARGET=personal` until the company page consistently earns at least 35 percent of founder-post impressions with strong comment quality
5. Repost or adapt the founder post to the company page the same day when it deserves amplification

## Guardrails

- One core idea per post.
- No feature dumping.
- No generic career advice.
- Open with a sharp operational truth in line one.
- Write like a founder who has lived the search, not a vendor describing it.
- Product mention is optional. Insight is not.

## Environment Requirements

- `CRON_SECRET` — authorizes worker calls into cron-protected web routes
- `NEXT_PUBLIC_APP_URL` — canonical web URL used by the worker
- `MAKE_WEBHOOK_URL` — publishing handoff to Make
- `LINKEDIN_POST_TARGET=personal|company`
- `LINKEDIN_COMPANY_URN` — required when target is `company`
