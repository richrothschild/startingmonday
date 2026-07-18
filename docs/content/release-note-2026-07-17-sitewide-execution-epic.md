# Release Note - Manager Tools Launch Readiness and CI/Monitoring Hardening

Date: 2026-07-17
Tickets: SMK-428, SMK-429, SMK-430, SMK-431, SMK-432, SMK-433, SMK-434
Owner: Engineering (Chris Goodwin) + Product (Rich Rothschild)

## Scope covered in this release series
1. Manager Tools newsletter landing page (/managertools) conversion overhaul ahead of the "Things We Think We Think" feature.
2. Trial-offer unification at 60 days across landing copy, signup, OAuth grant, and lifecycle emails.
3. CI and scheduled-monitoring repair: predeploy gate chain, visual baselines, synthetic gates, security audit false positives, and watchdog tuning.

## User-visible changes
1. /managertools now renders a full conversion path: referral bridge naming the newsletter, hero CTA with trial terms, cohort FAQs, founding-cohort framing, and a closing signup section. All CTAs read "Get 60 days free".
2. Mobile: hero CTA appears above the portrait image, and the timing chart has a legible mobile variant (also on the homepage).
3. Manager Tools signups now receive exactly 60 days free (previously granted 90 while the page promised 60); lifecycle emails match.
4. Dashboard dead links to the nonexistent /dashboard/contacts/new route now go to /dashboard/contacts, with company preselection preserved from signals.
5. Dashboard signal count now matches the signals index for the same session (both apply the same quality suppression) per the signal-parity trust contract.
6. Cloudflare Web Analytics beacon is no longer blocked by the site CSP on dashboard routes.
7. Chat retry banner carries a stable test id; behavior unchanged.

## KPI intent
1. Improve /managertools visit-to-signup conversion for the newsletter cohort (PostHog CTA events: nav, hero, closing section).
2. Protect trial economics by honoring the intended 60-day grant.
3. Restore trust in CI and monitoring signal: green means green, red means a real defect.
4. Recover Cloudflare Web Analytics data coverage on authenticated routes.

## Rollback triggers
1. /managertools signup conversion drops materially below pre-change baseline during the newsletter window.
2. Signup completions fail or trial grants misconfigure (wrong trial_ends_at) for utm_source=managertools arrivals.
3. Dashboard signal sections render empty for accounts known to have fresh signals (over-suppression).
4. CSP change correlates with new console errors or a Sentry CSP-report spike.
5. Any required CI gate regresses to a false-positive state that blocks unrelated PRs.

## Rollback plan
1. Landing/copy changes: revert the offending SMK commit(s) and redeploy; staging mirrors production for verification.
2. Trial grant: restore prior duration in signup page and auth callback in a single revert commit.
3. Dashboard suppression parity: revert the rankSignals filter on the dashboard page only.
4. CSP: remove the cloudflareinsights.com entries from next.config.ts.

## Post-release verification checklist
1. /managertools live checks: CTAs, FAQs, bridge copy, mobile chart (verified on production July 13-14).
2. Signup E2E with utm_source=managertools verifying trial_ends_at at +60 days (staging; scheduled pre-send).
3. CI: full green run on main after gate-chain fixes (#256, #257, #259, #260).
4. Monitoring: Luxury Page Sentinel and Production Generated Monitoring green after #258 deploy.
