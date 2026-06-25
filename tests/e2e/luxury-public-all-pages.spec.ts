import { test, expect, type Page } from '@playwright/test'

const BASE_URL = process.env.LUXURY_TEST_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/pricing',
  '/demo',
  '/for-coaches',
  '/for-executives',
  '/for-cio',
  '/for-leaders',
  '/for-data-officer',
  '/for-cdo',
  '/for-ciso',
  '/for-cpo',
  '/for-coo',
  '/executives',
  '/executives/active',
  '/executives/passive',
  '/executives/personas',
  '/career-tools',
  '/method-and-evidence',
  '/references',
  '/evidence-hub',
  '/learn-more',
  '/learn-more/inside-the-system',
  '/learn-more/objections',
  '/learn-more/common-questions',
  '/blog',
  '/blog/how-we-estimate-early-role-signals',
  '/outplacement',
] as const

async function getBaselineMetrics(page: Page, url: string) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' })
  expect(response?.status() ?? 0, `${url} should return 2xx/3xx`).toBeLessThan(400)

  return page.evaluate(() => {
    const root = document.querySelector('main') ?? document.body

    const headingLevels = Array.from(root.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((el) => Number(el.tagName.slice(1)))
    let headingSkip = false
    for (let i = 1; i < headingLevels.length; i += 1) {
      if (headingLevels[i] - headingLevels[i - 1] > 1) {
        headingSkip = true
        break
      }
    }

    const h1Count = Array.from(document.querySelectorAll('h1')).filter((el) => !el.classList.contains('sr-only')).length

    const links = Array.from(root.querySelectorAll('a[href]')).map((a) => (a.textContent || '').trim()).filter(Boolean)
    const ctaLabels = links.filter((label) =>
      /(\bstart\b|view|open|see|watch|learn|request|choose|try|sign up|get started|read|book|explore|review|demo|preview)/i.test(label),
    )
    const repeated = new Map<string, number>()
    for (const label of ctaLabels) repeated.set(label, (repeated.get(label) || 0) + 1)

    const repeatedCtas = [...repeated.entries()].filter(([, count]) => count > 3)

    const hasInternalLeak = /docs\/|artifacts\/|tmp-run-|\.json\b|workspaceStorage\//i.test(root.textContent || '')

    const supportsDisclosure = root.querySelectorAll('details > summary').length

    return {
      h1Count,
      headingSkip,
      ctaCount: ctaLabels.length,
      repeatedCtas,
      hasInternalLeak,
      supportsDisclosure,
    }
  })
}

test.describe('Luxury + cognitive baseline for public pages @luxury', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} has premium hierarchy and bounded cognitive load`, async ({ page }) => {
      const metrics = await getBaselineMetrics(page, `${BASE_URL}${route}`)
      const ctaLimit = route === '/blog' ? 40 : 20

      expect(metrics.h1Count, `${route}: exactly one visible h1`).toBe(1)
      expect(metrics.headingSkip, `${route}: no heading level skip`).toBeFalsy()
      expect(metrics.ctaCount, `${route}: CTA count should stay bounded`).toBeLessThanOrEqual(ctaLimit)
      expect(metrics.repeatedCtas, `${route}: no repeated CTA label overload`).toEqual([])
      expect(metrics.hasInternalLeak, `${route}: no internal path leakage in marketing copy`).toBeFalsy()

      // High-content routes should expose at least one progressive disclosure control.
      if (route === '/for-coaches' || route === '/for-executives' || route === '/learn-more' || route === '/learn-more/common-questions') {
        expect(metrics.supportsDisclosure, `${route}: should include at least one details/summary disclosure`).toBeGreaterThanOrEqual(1)
      }
    })

    test(`${route} has no horizontal overflow on luxury mobile`, async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes('luxury-mobile'), 'Mobile check only')

      const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' })
      expect(response?.status() ?? 0).toBeLessThan(400)

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
      expect(overflow, `${route}: no horizontal overflow on mobile`).toBeFalsy()
    })
  }

  test('/for-vp redirects to canonical route', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/for-vp`, { waitUntil: 'domcontentloaded' })
    expect(response?.status() ?? 0).toBeLessThan(400)
    expect(page.url()).not.toBe(`${BASE_URL}/for-vp`)
  })
})
