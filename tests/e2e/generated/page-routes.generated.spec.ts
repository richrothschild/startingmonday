import { test, expect, type Page } from '@playwright/test'
import { attachJourneyGuards } from '../monitoring.helpers'

const routeTargets = [
  {
    "route": "/dashboard",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier0"
  },
  {
    "route": "/dashboard/admin",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/b2b",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/b2b/[id]",
    "authClass": "authenticated",
    "hasDynamicSegment": true,
    "concreteExample": "/dashboard/admin/b2b/example-id",
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/b2b/new",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/channel-benchmarks",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/coach-outreach",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/crm",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/customers",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/diagrams",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/feedback",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/feedback/[id]",
    "authClass": "authenticated",
    "hasDynamicSegment": true,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/guide",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/intelligence",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/intelligence/qa",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/internal-guide",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/linkedin-company-launch",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/metrics",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/onboarding/qa",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/onboarding/video",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/operations",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/outplacement-cohorts",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/outplacement-outreach",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/outreach-analytics",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/outreach-reliability",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/product",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/product/catalog",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/revenue",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/sales-enablement",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/social",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/speakers",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/team",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/traces",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/admin/traces/rubric",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/briefing",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier0"
  },
  {
    "route": "/dashboard/calendar",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/chat",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/coach",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/coach/[clientId]",
    "authClass": "authenticated",
    "hasDynamicSegment": true,
    "concreteExample": "/dashboard/coach/example-client-id",
    "tier": "tier1"
  },
  {
    "route": "/dashboard/companies/[id]",
    "authClass": "authenticated",
    "hasDynamicSegment": true,
    "concreteExample": "/dashboard/companies/example-company-id",
    "tier": "tier1"
  },
  {
    "route": "/dashboard/companies/[id]/prep",
    "authClass": "authenticated",
    "hasDynamicSegment": true,
    "concreteExample": "/dashboard/companies/example-company-id/prep",
    "tier": "tier1"
  },
  {
    "route": "/dashboard/companies/new",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/concierge",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/contacts",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/contacts/[id]",
    "authClass": "authenticated",
    "hasDynamicSegment": true,
    "concreteExample": "/dashboard/contacts/example-contact-id",
    "tier": "tier1"
  },
  {
    "route": "/dashboard/contacts/[id]/edit",
    "authClass": "authenticated",
    "hasDynamicSegment": true,
    "concreteExample": "/dashboard/contacts/example-contact-id/edit",
    "tier": "tier1"
  },
  {
    "route": "/dashboard/contacts/[id]/outreach",
    "authClass": "authenticated",
    "hasDynamicSegment": true,
    "concreteExample": "/dashboard/contacts/example-contact-id/outreach",
    "tier": "tier1"
  },
  {
    "route": "/dashboard/discover",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/discover/recommendation/[id]",
    "authClass": "authenticated",
    "hasDynamicSegment": true,
    "concreteExample": "/dashboard/discover/recommendation/example-recommendation-id",
    "tier": "tier1"
  },
  {
    "route": "/dashboard/executive-brief",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/feedback",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/help",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/invite",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/kanban",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/offers",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/outplacement",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/outreach",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier0"
  },
  {
    "route": "/dashboard/partner",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/pilot-outreach",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/placed",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/positioning",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/post-search",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/profile",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/profile/tailor",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/salary",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/signals",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier0"
  },
  {
    "route": "/dashboard/start",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/strategy",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/dashboard/wrap-up",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/login",
    "authClass": "public",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier0"
  },
  {
    "route": "/onboarding",
    "authClass": "public",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier0"
  },
  {
    "route": "/pricing",
    "authClass": "public",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier0"
  },
  {
    "route": "/settings/billing",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier0"
  },
  {
    "route": "/settings/security",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/settings/team",
    "authClass": "authenticated",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier1"
  },
  {
    "route": "/signup",
    "authClass": "public",
    "hasDynamicSegment": false,
    "concreteExample": null,
    "tier": "tier0"
  }
] as const

async function ensureAuthSession(page: Page) {
  await page.goto('/dashboard')
  return !/\/login(?:$|[/?#])/.test(page.url())
}

for (const target of routeTargets) {
  test(`generated route coverage: ${target.route}`, async ({ page }) => {
    if (target.authClass === 'authenticated') {
      const ok = await ensureAuthSession(page)
      test.skip(!ok, 'Auth session unavailable for authenticated route coverage')
    }

    if (target.hasDynamicSegment && !target.concreteExample) {
      test.skip(true, 'No concrete route example configured for dynamic segment route')
    }

    if (target.hasDynamicSegment && target.concreteExample && target.concreteExample.includes('example-')) {
      test.skip(true, 'Placeholder example route configured; provide real fixture id for dynamic route coverage')
    }

    const path = (target.hasDynamicSegment && target.concreteExample) ? target.concreteExample : target.route
    const guards = await attachJourneyGuards(page)
    const res = await page.goto(path, { waitUntil: 'domcontentloaded' })

    expect(res?.status(), 'Route response should not be 404').not.toBe(404)
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('body')).not.toContainText(/404|not found/i)
    expect(guards.pageErrors, `Page errors: ${guards.pageErrors.join(' | ')}`).toHaveLength(0)
    expect(guards.consoleErrors, `Console errors: ${guards.consoleErrors.join(' | ')}`).toHaveLength(0)
    const bodyText = (await page.locator('body').innerText().catch(() => '')).trim()
    if (bodyText.length === 0) {
      await expect(page.locator('.animate-pulse, [aria-busy="true"], [data-testid="loading"]').first()).toBeVisible()
    }
  })
}
