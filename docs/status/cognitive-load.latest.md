# Cognitive Load Agent Report

Generated: 2026-07-12T16:34:58.334Z
Channel: reliability---service
Pages scanned: 285
Pages with issues: 58
Total issues: 60

## Tier Gates

- public: loadRequired=B+, loadPass=true, fluencyRequired=B+, fluencyPass=false, sampledPages=129
- dashboard: loadRequired=A-, loadPass=false, fluencyRequired=A-, fluencyPass=false, sampledPages=85
- funnel: loadRequired=B+, loadPass=true, fluencyRequired=B+, fluencyPass=false, sampledPages=71

## Tier Summary

- public: pages=129, issues=29, avgIssueCount=0.22, worstLoadGrade=A-, avgFluencyScore=93.2, worstFluencyGrade=C, loadGate=true, fluencyGate=false
- dashboard: pages=85, issues=25, avgIssueCount=0.29, worstLoadGrade=B+, avgFluencyScore=98.6, worstFluencyGrade=B, loadGate=false, fluencyGate=false
- funnel: pages=71, issues=6, avgIssueCount=0.08, worstLoadGrade=A-, avgFluencyScore=97.2, worstFluencyGrade=C+, loadGate=true, fluencyGate=false

## Top Findings

- /dashboard/post-search: loadGrade=B+, fluencyGrade=A-, fluencyScore=100, issues=2
  - weak-chunking-paragraph-to-heading-ratio: 8.5 (threshold: 8)
  - high-density-without-progressive-disclosure
- /dashboard/start: loadGrade=B+, fluencyGrade=B+, fluencyScore=88, issues=2
  - weak-chunking-paragraph-to-heading-ratio: 11.3 (threshold: 8)
  - high-density-without-progressive-disclosure
- /coaches/mock-dashboard/[clientId]: loadGrade=A-, fluencyGrade=A-, fluencyScore=100, issues=1
  - high-density-without-progressive-disclosure
- /dashboard: loadGrade=A-, fluencyGrade=A-, fluencyScore=100, issues=1
  - high-density-without-progressive-disclosure
- /dashboard-theme-preview: loadGrade=A-, fluencyGrade=B, fluencyScore=70, issues=1
  - avg-sentence-too-dense: 35.0 words (threshold: 22)
- /dashboard/admin/coach-outreach: loadGrade=A-, fluencyGrade=B+, fluencyScore=88, issues=1
  - high-density-without-progressive-disclosure
- /dashboard/admin/crm: loadGrade=A-, fluencyGrade=A-, fluencyScore=100, issues=1
  - high-density-without-progressive-disclosure
- /dashboard/admin/linkedin-company-launch: loadGrade=A-, fluencyGrade=B+, fluencyScore=88, issues=1
  - weak-chunking-paragraph-to-heading-ratio: 11.0 (threshold: 8)
- /dashboard/admin/onboarding/video: loadGrade=A-, fluencyGrade=A-, fluencyScore=100, issues=1
  - high-density-without-progressive-disclosure
- /dashboard/admin/operations: loadGrade=A-, fluencyGrade=A-, fluencyScore=100, issues=1
  - weak-chunking-paragraph-to-heading-ratio: 9.0 (threshold: 8)
- /dashboard/admin/outreach-analytics: loadGrade=A-, fluencyGrade=A-, fluencyScore=100, issues=1
  - high-density-without-progressive-disclosure
- /dashboard/admin/product: loadGrade=A-, fluencyGrade=A-, fluencyScore=100, issues=1
  - weak-chunking-paragraph-to-heading-ratio: 9.0 (threshold: 8)
- /dashboard/admin/product/catalog: loadGrade=A-, fluencyGrade=A-, fluencyScore=100, issues=1
  - high-density-without-progressive-disclosure
- /dashboard/admin/revenue: loadGrade=A-, fluencyGrade=A-, fluencyScore=100, issues=1
  - weak-chunking-paragraph-to-heading-ratio: 9.0 (threshold: 8)
- /dashboard/admin/social: loadGrade=A-, fluencyGrade=A-, fluencyScore=100, issues=1
  - high-density-without-progressive-disclosure
- /dashboard/admin/traces: loadGrade=A-, fluencyGrade=A-, fluencyScore=100, issues=1
  - weak-chunking-paragraph-to-heading-ratio: 9.0 (threshold: 8)
- /dashboard/briefing: loadGrade=A-, fluencyGrade=A-, fluencyScore=100, issues=1
  - high-density-without-progressive-disclosure
- /dashboard/coach: loadGrade=A-, fluencyGrade=B+, fluencyScore=88, issues=1
  - weak-chunking-paragraph-to-heading-ratio: 10.4 (threshold: 8)
- /dashboard/concierge: loadGrade=A-, fluencyGrade=A-, fluencyScore=100, issues=1
  - weak-chunking-paragraph-to-heading-ratio: 9.0 (threshold: 8)
- /dashboard/outplacement/firm-admin: loadGrade=A-, fluencyGrade=A-, fluencyScore=100, issues=1
  - high-density-without-progressive-disclosure

