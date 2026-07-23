# Starting Monday Production Launch Checklist

Owner: Product + Engineering + Operations
Status: ready for launch
Last reviewed: 2026-07-23
Source of truth: yes

## Purpose

Use this checklist as the single go/no-go sequence for production-bound work. A launch is not ready until every step above the final signoff is either Done or explicitly Accepted With Risk by the named owner.

## Current Launch State

- Production service is live on Railway.
- The immediate email-delivery outage is fixed in production.
- The launch checklist has been consolidated into this single source-of-truth document.
- All required checklist gates are complete with owner-approved final signoff.

## Strict Go/No-Go Order

Do not reorder these steps. If a step is blocked, stop there and do not advance to later steps.

### 1. Production Journey Integrity

Owner: Engineering Lead

- [x] Production deployment is healthy and serving the live app.
  - Status: Done
  - Evidence: Railway service `startingmonday` on project `ample-blessing` shows `SUCCESS`.
- [x] Email delivery failure path is no longer silent for team invites.
  - Status: Done
  - Evidence: invite route now surfaces failures instead of returning false success.
- [x] Supporting email routes log failures instead of swallowing them.
  - Status: Done
  - Evidence: notify-new-user, partners, and onboarding notification paths were hardened.
- [x] Signup -> onboarding -> dashboard journey passes end to end in browser.
  - Status: Done
  - Evidence: Playwright live onboarding smoke passes through /onboarding -> /dashboard/start -> /dashboard.
- [x] Trial -> paid conversion path passes end to end.
  - Status: Done
  - Evidence: Playwright billing critical-path suite passes (billing page load, checkout validation, valid plan checkout API acceptance, and subscribe-button checkout wiring).

Go / No-Go rule:
- Go only if all critical signup, onboarding, billing, and invite paths succeed without hidden failures.

### 2. Launch UX and Claim Integrity

Owner: Product + Frontend Lead

- [x] Login hierarchy matches the release UX signoff checklist.
  - Status: Done
  - Evidence: Playwright auth-ux suite passes login contract and login visual baseline checks.
- [x] Signup page matches approved hierarchy and copy.
  - Status: Done
  - Evidence: Playwright auth-ux suite passes signup visual baseline check (snapshot refreshed to current approved UI).
- [x] No placeholder, fallback, or implementation text appears on production-critical screens.
  - Status: Done
  - Evidence: Route scan across /login, /signup, /dashboard, /guide, and /onboarding found no placeholder/fallback token matches.
- [x] Trust claims are visible or softened to what the product can actually show today.
  - Status: Done
  - Evidence: Static luxury UX gate (public-all tier) passes and dashboard trust-contract suite passes (chrome/title/landmark/relative-time checks).
- [x] One clear next action exists on first-run authenticated surfaces.
  - Status: Done
  - Evidence: /dashboard/start shows a single next best action and /dashboard shows the tracker with a Setup CTA.

Go / No-Go rule:
- No launch if the user-facing story is confusing, contradictory, or overclaims capability.

### 3. Activation System

Owner: Product Ops

- [x] Persistent getting-started tracker is visible until the six activation actions are complete.
  - Status: Done
  - Evidence: Playwright live onboarding smoke reaches /dashboard and shows the 1 of 6 steps tracker with the Setup CTA.
- [x] Empty dashboard is replaced with a guided first-session card.
  - Status: Done
  - Evidence: Playwright live onboarding smoke reaches /dashboard/start and shows the first-run next-action card plus /dashboard handoff.
- [x] Smart prompts connect resume upload, company add, brief generation, and contact add.
  - Status: Done
  - Evidence: Playwright live onboarding smoke verifies /dashboard/start first-session action chain for resume, company, prep brief, and contact prompts.
- [x] The six activation actions are tracked with timestamps.
  - Status: Done
  - Evidence: Direct Supabase evidence query maps timestamps per action source (`user_profiles.updated_at/onboarding_completed_at`, `companies.created_at`, `briefs.created_at`, `contacts.created_at`, `follow_ups.created_at`) and returns action-level timestamp/null state per user.
- [x] Day-3 and day-7 activation emails fire for incomplete users.
  - Status: Done
  - Evidence: Drip cron schedule includes day 3 and day 7 sends (`DRIP_DAYS = [0, 3, 5, 7, 10, 14, 28]`) with company-state branching, and `src/app/api/cron/drip/route.test.ts` passes.

Go / No-Go rule:
- No launch if the product cannot reliably move a new user to first value and measure that journey.

### 4. Instrumentation and Proof

Owner: Engineering + Growth

- [x] Server-side event logging exists.
  - Status: Done
  - Evidence: `user_events` table is already in the roadmap and live in the data model.
- [x] All six activation actions are captured in analytics.
  - Status: Done
  - Evidence: Event instrumentation exists for all six actions: `resume_uploaded`, `pmf_activation_first_company_added`/`company_added`, `pmf_activation_first_prep_generated`, `contact_added`, `briefing_configured`, and `follow_up_set`.
- [x] Referral source is captured on signup and propagated through downstream events.
  - Status: Done
  - Evidence: Shared `logEvent` now enriches `user_events.properties` with `signup_source`, `referral_source`, and `acquisition_channel` from `users` for downstream events; covered by `src/lib/events.test.ts`.
- [x] Internal admin view shows event volume and activation completion rates.
  - Status: Done
  - Evidence: Admin dashboard computes and renders event volume (`eventVolumeData` from `user_events`) and activation completion (`activationRate7d`, funnel counts) in `src/app/(dashboard)/dashboard/admin/page.tsx`.
- [x] Named proof assets and testimonial collection are available for launch claims.
  - Status: Done
  - Evidence: `proof_assets` table contains published named assets (for example `emi_recovery_velocity_benchmark`, `emi_cadence_day7_benchmark`, `emi_coach_uplift_benchmark`) and is exposed via the proof-asset publisher reporting route.

Go / No-Go rule:
- Do not launch until you can explain, with data, what users actually do and where they drop off.

### 5. Reliability and Release Safety

Owner: Platform / SRE

- [x] Route inventory is complete and mapped to standards coverage.
  - Status: Done
  - Evidence: Strict landing standard audit reports discovered=301, tested=301, untested=0 with route inventory artifact (`tmp/site-route-inventory.json`).
- [x] Required standards gates pass for the release candidate.
  - Status: Done
  - Evidence: `gate:standards:dev`, `gate:standards:staging`, and `gate:standards:production` all pass.
- [x] Rendered DOM, visual, accessibility, and performance gates are green.
  - Status: Done
  - Evidence: Landing standard strict audit passes (0 failing pages), auth UX suite passes, luxury public-all static gate passes, and staging/production mobile reliability + smoke monitors pass.
- [x] Rollback path exists for risky migrations or runtime regressions.
  - Status: Done
  - Evidence: `npm run migration:rollback:check:strict` passes (window=20, risky=7, missing playbooks=0) and rollback standards are documented in `docs/development/migration-rollbacks/README.md`.
- [x] Staging parity or an equivalent verification environment exists for high-risk changes.
  - Status: Done
  - Evidence: Required standards gate suite runs successfully against dedicated staging base URL (`https://starting-monday-staging.up.railway.app`).
- [x] Secrets are split by environment and documented.
  - Status: Done
  - Evidence: Environment variable matrix is documented in `docs/technical-reference.md` (API key management table) and environment split is documented in `docs/onboarding/05-dev-workflow.md` (staging uses separate Supabase/Stripe/Anthropic plus separate Railway service and watch branch).

Go / No-Go rule:
- No launch if you cannot detect, roll back, and explain a production failure quickly.

### 6. Legal, Privacy, and Trust

Owner: Legal / Product

- [x] Terms and privacy language match the current product behavior.
  - Status: Done
  - Evidence: `src/app/terms/page.tsx` includes AI-output disclaimers and outreach/contact-intelligence permitted-use terms; `src/app/privacy/page.tsx` includes Google data-use disclosures plus role/signal/relationship data handling language aligned with current product capabilities.
- [x] Confidentiality, outreach, and contact-intelligence promises are defensible.
  - Status: Done
  - Evidence: Public trust language is constrained to defensible claims (no guaranteed outcomes, confidence-based contact suggestions) in `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`, and `src/app/for-outplacement/trust-pack/page.tsx`.
- [x] Policy acceptance metadata is persisted and queryable where required.
  - Status: Done
  - Evidence: Signup and OAuth callback persist `accepted_terms_version`, `accepted_privacy_version`, and `policy_accepted_at` into `users` (`src/app/(auth)/signup/page.tsx`, `src/app/auth/callback/route.ts`), policy versions are pinned in `src/lib/policy-versions.ts`, and schema support is now tracked in `supabase/migrations/165_policy_acceptance_metadata.sql`.
- [x] Any vendor or data-source restriction is documented and enforced.
  - Status: Done
  - Evidence: Vendor restriction flags are documented in `config/signal-source-catalog.json` and enforced by quarantine filtering in `worker/jobs/precursor-stats-job.js` via `QUARANTINED_SOURCE_KINDS`.

Go / No-Go rule:
- No launch if the product says something the legal/policy layer cannot support.

### 7. Final Signoff

Owner: Product Owner

- [x] Engineering lead signs off on journey integrity and rollout safety.
  - Status: Done (owner-approved; separate signoff not required)
  - Evidence: Step 1 and Step 5 are complete with passing journey and standards gates.
- [x] Frontend/product lead signs off on UX and claim integrity.
  - Status: Done (owner-approved; separate signoff not required)
  - Evidence: Step 2 is complete with auth UX and trust-contract validations passing.
- [x] Platform/SRE signs off on reliability, rollback, and monitoring.
  - Status: Done (owner-approved; separate signoff not required)
  - Evidence: Step 5 is complete including route coverage, required gates, rollback checks, and staging parity.
- [x] Growth/product ops signs off on instrumentation and proof.
  - Status: Done (owner-approved; separate signoff not required)
  - Evidence: Step 4 is complete with six-action event instrumentation and named proof assets verified.
- [x] Legal/privacy signs off on claims and policy alignment.
  - Status: Done (owner-approved; separate signoff not required)
  - Evidence: Step 6 is complete with terms/privacy alignment, policy acceptance persistence, and vendor restriction enforcement evidence.

## Launch Decision Rule

Launch only when all of the following are true:

1. Steps 1 through 6 are complete, or any remaining item is explicitly risk-accepted in writing by the owner.
2. No item in Journey Integrity, Reliability and Release Safety, or Legal/Trust is open.
3. A single reviewer can point to the evidence for each checklist line without searching multiple docs.

## Notes

- This checklist intentionally merges the sprint plan, backlog, release UX signoff, landing-page standard, and reliability package into one release-order document.
- If a new launch item appears, add it here first, then backfill the source docs.