# Support Chat, Feedback Funnel, and Email Opt-In: Execution Plan

Date: 2026-07-12
Owner: Richard Rothschild
Status: Phase 1 implemented; this plan governs verification, hardening, and follow-through.

## Elite Customer Service Standard

We benchmark against three named standards:

1. Amazon - resolution-first: every interaction ends with the problem solved or a clear next step, never a dead end.
2. Apple - calm expertise: plain language, no jargon, the customer never feels stupid for asking.
3. Ritz-Carlton - anticipation and ownership: anticipate the need, never make the customer repeat themselves, the first person who hears a problem owns it to resolution.

Applied to Starting Monday:
- The support assistant answers instantly from live product content with sources (Amazon).
- Copy is plain-language and judgment-free (Apple).
- Escalation carries the question forward automatically - the user never retypes it - and every founder-directed message gets a personal reply (Ritz-Carlton).

## What Shipped (Phase 1)

1. Slack notifications for feedback/questions: intentionally skipped per owner request (email notification to richard@startingmonday.app remains).
2. Support assistant chatbot on /dashboard/support:
   - Backed by the existing external guide chat (/api/guide/chat) - retrieval over docs/user-guide.index.json, regenerated from site content on every deploy, so it is current with the site by construction.
   - Sourced answers, suggested questions, low-confidence escalation button that pre-fills the founder question form.
3. Privacy-first email nudge opt-in:
   - Onboarding briefing step now asks explicitly; default is "No thanks - briefing only".
   - Consent stored via users.drip_unsubscribed_at (null = opted in). No schema change required.
   - Settings > Email preferences panel with On/Off toggle (API: /api/settings/email-nudges).
   - All nudge senders (drip, reengagement, weekly digest, managertools lifecycle) already filter on this flag.

## Devil's Advocate: What Could Go Wrong, and Mitigations

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | Chatbot gives a wrong or stale answer and the user trusts it (billing/privacy answers are highest-stakes) | P0 | Answers are retrieval-based (no hallucinated generation), always cite sources, and low-confidence responses are flagged "conservative" with a one-click human escalation. Guide index regenerates every deploy; guide:user:check gates freshness; recall eval (currently 82% recall@3, 50 cases) tracked in guide:retrieval:eval. |
| 2 | Chatbot answers about private user data it cannot see, creating a privacy scare | P0 | The guide index contains only public product documentation - no user data enters retrieval. Route requires auth; queries are logged for quality review, not shared. |
| 3 | Opt-in default OFF collapses trial-conversion email performance | P1 | This is a deliberate privacy trade. Mitigate with in-product nudges (dashboard banners already exist), measure opt-in rate via onboarding analytics, and A/B copy of the consent ask - never the default. |
| 4 | Existing trial users are suddenly treated as unsubscribed (or vice versa) | P0 | The change only touches new onboarding completions and the explicit settings toggle. Existing users' flags are untouched. Verified: no backfill or migration in this change. |
| 5 | User opts in during onboarding, later re-runs onboarding and silently loses opt-in | P2 | The consent write happens on every onboarding completion with the user's current explicit choice - it reflects their latest answer, which is correct behavior. Settings toggle is the durable control. |
| 6 | The daily briefing gets confused with nudge emails and users think opting out kills briefings | P1 | Copy explicitly separates them everywhere: "Daily briefings are separate and unaffected." Both in onboarding and settings. |
| 7 | Escalation form fails silently and a customer question is lost | P1 | /api/assist has a fallback insert path (board insert failure falls back to the public store), error surfaced to the user on total failure, and email notify has structured error logging (assist_email_error). |
| 8 | Feedback widget or chat endpoint gets abused (spam floods richard@ inbox) | P1 | Public endpoint guard + per-IP burst limits + 20/min rate limit on /api/assist; guide chat requires auth; feedback board has 5/day per-user cap. |
| 9 | Chatbot UI degrades the luxury standard (light-shell drift, tap targets) | P1 | All new UI uses the dark glass shell tokens; 44px minimum tap targets; validated by luxury static gate, rubric page gate, and mobile-ui contract in pre-commit. |
| 10 | Guide index missing in production makes chat return 503s | P1 | Route already degrades gracefully with a clear retry message; index generation runs in deploy pipeline (same path that powers /guide today, in production). Post-deploy smoke should hit /api/guide/chat once. |
| 11 | Support page slows or fails to load with chat mounted | P2 | Chat is client-side, lazy, no request until first question; page content renders independently. CWV monitored by experience-vitals agent on dashboard tier. |
| 12 | Emails to richard@ leak user questions to additional recipients unintentionally | P2 | Recipient list is OWNER + NOTIFY_EMAILS only, deduplicated; content is never posted publicly without review (feedback board is authed-members-only). |

## Comprehensive Testing Plan

### Unit and functional (implemented, all passing)
- src/app/api/assist/route.test.ts - 7 cases: guard block, length validation both bounds, burst limit, anonymous path with email notify to richard@, authenticated board path, fallback path.
- src/app/api/settings/email-nudges/route.test.ts - 5 cases: auth, payload validation, enable clears flag, disable sets flag, DB failure -> 500.
- Existing regression suites rerun green: guide chat route (4), guide chat feedback (3), drip unsubscribe (2).

### Regression (run before each release of this surface)
- npx vitest run src/app/api/assist src/app/api/settings/email-nudges src/app/api/guide src/app/api/drip src/app/api/cron/drip src/app/api/cron/reengagement
- Full suite: npm test (placeholder-regression guard + observability import guard included).
- Coverage: npm run test:coverage + coverage:folders:check against config/coverage-thresholds.json. New routes carry dedicated tests; target is full branch coverage on the two new API routes (achieved: every response branch has a test).

### Functional / E2E
- Auth-gated UX: npm run test:e2e:auth-ux (signup/login funnel unaffected - verified by copy drift gate).
- Luxury rendered checks: npm run test:e2e:luxury (desktop + mobile).
- Manual smoke post-deploy: (1) ask the support assistant a billing question, verify sourced answer; (2) force a no-match question, verify escalation pre-fills the founder form; (3) submit, verify email arrives at richard@startingmonday.app; (4) toggle email preferences off/on in settings, verify drip_unsubscribed_at flips; (5) complete onboarding declining nudges, verify flag set.

### Chatbot currency verification (done this release, repeat each deploy)
- npm run guide:user:sync - regenerated: 600 entries from current site content.
- npm run guide:user:check - passes (up to date).
- npm run guide:retrieval:eval - recall@3 = 82.0% over 50 cases (floor: do not ship below 80% without review; strict mode available via guide:retrieval:eval:strict).
- Index is gitignored and rebuilt at deploy, so production content cannot go stale between releases.

## Standards Compliance (Non-Negotiable)

Canonical standard: docs/landing-page-standard.md. Gates run for this change:

| Standard / Gate | How verified |
|---|---|
| UX/UI rubric page gate (ux:rubric:pages) | Pre-commit + pre-push, passing |
| Key funnel copy/CTA drift guard | Pre-commit + pre-push, passing (signup keeps "Create your account" H1 + "No credit card." assurance) |
| Luxury static gate (staged pages) | Pre-commit on staged page.tsx, passing |
| Mobile UI contract + banned patterns | Pre-commit mobile-ui gate, passing; all new controls >= 44px tap targets |
| Visual darkness gate (key funnel) | Pre-commit, passing |
| Luxury Page Sentinel (agent, hourly) | Runs against production hourly; new support page uses dark shell so it adds zero palette debt |
| Trust Integrity Agent (agent, daily) | Dashboard trust contracts unaffected (no changes to parity/title/landmark surfaces) |
| Page Experience Auditor (agent) | Post-deploy: run three-pass audit on /dashboard/support and /onboarding per AGENTS.md addendum; any P0 blocks sign-off |
| Truthfulness contract (AGENTS.md) | All claims in this plan are labeled; test results quoted from actual runs |

## What Else Makes This Robust (Recommended Follow-Ups)

1. Support SLA instrumentation: track time-to-first-reply on founder-directed questions; alert if > 1 business day (Ritz-Carlton ownership standard).
2. Chat answer feedback loop: the guide chat already logs queries + has a feedback endpoint - add a weekly review of no_match and thumbs-down queries to expand guide content where users get stuck.
3. Opt-in rate telemetry: add onboarding funnel event for consent choice so conversion impact of privacy-first default is measurable within two weeks.
4. Re-permission moment: for users who declined nudges, show one in-product (not email) reminder at trial day 21 that tips exist - respects the channel choice while protecting conversion.
5. Public support access: anonymous visitors currently have the floating widget; consider a public /support page with the same assistant limited to public docs.
6. Quarterly retrieval eval ratchet: raise the recall@3 floor from 80% toward 90% as guide content improves; wire guide:retrieval:eval:strict into CI.
7. Inbox resilience: if founder email volume grows, route to a shared support alias with the same personal-reply standard before response quality slips.
