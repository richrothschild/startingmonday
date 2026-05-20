# SLO Catalog (Routes and Pages)

Last updated: 2026-05-18

## Objective

Define reliability objectives for every route and page currently in the codebase.

This catalog covers all entries in:

1. docs/sre/inventory-pages.md
2. docs/sre/inventory-api-routes.md

## SLI Definitions

### Page SLIs

1. Availability: successful HTTP response rate for page requests
2. UX Success: no unhandled runtime error + no fatal hydration error
3. Performance: p95 LCP and p95 INP for real users

### API SLIs

1. Availability: non-5xx response rate
2. Correctness: business transaction success rate for mutation endpoints
3. Latency: p95 endpoint latency

## SLO Tiers

### Tier P0 (Mission Critical User Flows)

1. Availability SLO: 99.95% monthly
2. API non-5xx SLO: 99.95% monthly
3. Mutation success SLO: 99.90% monthly
4. Latency SLO (API): p95 <= 1200 ms
5. Latency SLO (Page): p95 LCP <= 2500 ms, p95 INP <= 250 ms
6. MTTR target for Sev-1: <= 30 minutes

### Tier P1 (Core Product, Lower Blast Radius)

1. Availability SLO: 99.90% monthly
2. API non-5xx SLO: 99.90% monthly
3. Mutation success SLO: 99.50% monthly
4. Latency SLO (API): p95 <= 2000 ms
5. Latency SLO (Page): p95 LCP <= 3000 ms, p95 INP <= 350 ms
6. MTTR target for Sev-2: <= 4 hours

### Tier P2 (Ancillary/Internal/Marketing)

1. Availability SLO: 99.50% monthly
2. API non-5xx SLO: 99.50% monthly
3. Mutation success SLO: 99.00% monthly
4. Latency SLO (API): p95 <= 4000 ms
5. Latency SLO (Page): p95 LCP <= 4500 ms, p95 INP <= 500 ms
6. MTTR target for Sev-3: <= 1 business day

## SLO Tier Mapping Rules

Apply first-match wins, top to bottom.

### Page Mapping (applies to every path in docs/sre/inventory-pages.md)

1. P0: src/app/(auth)/login/page.tsx
2. P0: src/app/(auth)/signup/page.tsx
3. P0: src/app/onboarding/page.tsx
4. P0: src/app/(dashboard)/dashboard/page.tsx
5. P0: src/app/(dashboard)/dashboard/briefing/page.tsx
6. P0: src/app/(dashboard)/dashboard/contacts/page.tsx
7. P0: src/app/(dashboard)/dashboard/contacts/[id]/page.tsx
8. P0: src/app/(dashboard)/dashboard/contacts/[id]/outreach/page.tsx
9. P0: src/app/(dashboard)/dashboard/calendar/page.tsx
10. P0: src/app/(dashboard)/dashboard/feedback/page.tsx
11. P0: src/app/optimize/page.tsx
12. P1: src/app/(dashboard)/dashboard/** (all remaining dashboard pages)
13. P1: src/app/(dashboard)/settings/**
14. P1: src/app/intelligence/[slug]/page.tsx
15. P2: src/app/** (all remaining pages)

### API Mapping (applies to every path in docs/sre/inventory-api-routes.md)

1. P0: src/app/api/auth/verify-and-signin/route.ts
2. P0: src/app/api/auth/verify-and-signup/route.ts
3. P0: src/app/api/auth/verify-and-oauth/route.ts
4. P0: src/app/auth/callback/route.ts
5. P0: src/app/api/feedback/items/route.ts
6. P0: src/app/api/feedback/items/[id]/vote/route.ts
7. P0: src/app/api/feedback/items/[id]/comments/route.ts
8. P0: src/app/api/optimize/route.ts
9. P0: src/app/api/outreach/send/route.ts
10. P0: src/app/api/outreach/status/route.ts
11. P0: src/app/api/outreach/current-status/route.ts
12. P0: src/app/api/billing/checkout/route.ts
13. P0: src/app/api/billing/checkout/seats/route.ts
14. P0: src/app/api/billing/portal/route.ts
15. P0: src/app/api/webhooks/stripe/route.ts
16. P1: src/app/api/feedback/route.ts
17. P1: src/app/api/chat/route.ts
18. P1: src/app/api/conversation/route.ts
19. P1: src/app/api/companies/**
20. P1: src/app/api/prep/**
21. P1: src/app/api/strategy/**
22. P1: src/app/api/tailor/**
23. P1: src/app/api/positioning/**
24. P1: src/app/api/profile/**
25. P1: src/app/api/briefs/**
26. P1: src/app/api/briefing/send/route.ts
27. P1: src/app/api/coach/**
28. P1: src/app/api/client/**
29. P1: src/app/api/team/**
30. P1: src/app/api/discover/route.ts
31. P1: src/app/api/suggestions/route.ts
32. P1: src/app/api/salary-intelligence/route.ts
33. P1: src/app/api/intelligence/**
34. P1: src/app/api/partners/report/route.ts
35. P1: src/app/api/partners/attribute/route.ts
36. P2: src/app/api/health/route.ts
37. P2: src/app/api/admin/**
38. P2: src/app/api/cron/**
39. P2: src/app/api/demo-brief/**
40. P2: src/app/api/demo-email/route.ts
41. P2: src/app/api/pilot-outreach/route.ts
42. P2: src/app/api/partners/route.ts
43. P2: src/app/api/concierge-waitlist/route.ts
44. P2: src/app/api/track/open/route.ts
45. P2: src/app/api/drip/unsubscribe/route.ts
46. P2: src/app/api/notify/new-user/route.ts
47. P2: src/app/api/search/route.ts
48. P2: src/app/api/invite/route.ts
49. P2: src/app/api/linkedin-import/**
50. P2: src/app/api/narrative/**
51. P2: src/app/api/onboarding/intel/route.ts
52. P2: src/app/api/offer-synthesis/route.ts
53. P2: src/app/api/preferences/briefing/route.ts
54. P2: src/app/api/signals/classify/route.ts
55. P2: src/app/api/outreach/suppression/route.ts
56. P2: src/app/api/concierge/calls/route.ts
57. P2: src/app/api/billing/pause/route.ts
58. P2: src/app/api/billing/resume/route.ts
59. P2: src/app/api/webhooks/resend/route.ts
60. P2: src/app/api/** (all remaining API routes)

## Error Budget Policy

1. P0 fast burn: if 2-hour projected burn >= 20% of monthly budget, freeze non-critical deploys
2. P0 sustained burn: if 24-hour projected burn >= 50% of monthly budget, switch sprint focus to reliability
3. P1/P2 burn: track weekly; prioritize if recurring or customer-visible

## Required Instrumentation Per Tier

### P0

1. Mandatory synthetic monitor
2. Mandatory transaction success metric
3. Dedicated dashboard panel
4. Pager alert with runbook

### P1

1. Dashboard metric and error tracking
2. Alert to Slack on threshold breach
3. Pager only if user-impact blast radius crosses Sev-2 criteria

### P2

1. Error and latency logs
2. Non-paging alert unless cascading failure is detected
