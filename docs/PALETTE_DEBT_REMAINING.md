# Remaining Palette Debt (Post Wave-1)

Last updated: 2026-07-06
Source report: tmp/luxury-page-sentinel-source-current.json
Command: npm run monitor:luxury:sentinel:source -- --output-json=tmp/luxury-page-sentinel-source-current.json

## Snapshot

- Routes discovered: 295
- Palette conformance violations: 87
- Runtime availability violations: 0 (source-only run)

## Concentration By Route Bucket

- /dashboard: 65
- /demo: 4
- /: 3
- /settings: 3
- /mauricio-kickoff-execution: 3
- /contributor: 1
- /for-chro: 1
- /guide: 1
- /ideas: 1
- /intelligence: 1

## Common Violation Pattern

Most remaining violations are still legacy light-shell classes, especially:

- className="min-h-screen bg-slate-100 font-sans"
- className="min-h-screen bg-slate-50 font-sans"
- className="min-h-screen bg-slate-50 flex items-center justify-center"

## Representative Affected Routes

- /dashboard/admin/b2b/new
- /dashboard/admin/b2b
- /dashboard/admin/b2b/[id]
- /dashboard/admin/coach-outreach
- /dashboard/admin/feedback
- /dashboard/admin/feedback/[id]
- /dashboard/admin/guide
- /dashboard/admin/intelligence
- /dashboard/admin/intelligence/qa
- /dashboard/admin/internal-guide
- /dashboard/admin/linkedin-company-launch
- /dashboard/admin/metrics
- /dashboard/admin/onboarding/qa
- /dashboard/admin/onboarding/video
- /dashboard/admin/outplacement-cohorts
- /dashboard/admin/outplacement-outreach
- /dashboard/admin/outreach-analytics
- /dashboard/admin/outreach-reliability
- /dashboard/admin/prep-efficacy
- /dashboard/admin/product/catalog

## Prioritized Remediation Waves

1. Dashboard/admin highest-traffic operational screens
- admin/metrics
- admin/outreach-analytics
- admin/intelligence
- admin/social

2. Core user workflow routes
- /dashboard/companies/new
- /dashboard/companies/[id]
- /dashboard/companies/[id]/prep
- /dashboard/contacts
- /dashboard/outreach

3. Remaining non-dashboard public and settings routes
- /demo
- /settings/*
- /guide, /ideas, /intelligence, /for-chro

## Exit Criteria

- Source palette violations <= 20
- No tier-0 funnel pages in violation
- Dashboard top-level workflow pages fully dark-shell conformant
- Follow-up run confirms no regressions in auth-ux screenshots and onboarding-live probe
