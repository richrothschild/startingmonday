import { test, expect, type Page } from '@playwright/test'
import { discoverPublicMobileRoutes } from '../../scripts/lib/mobile-route-inventory.mjs'

const PUBLIC_ROUTES = discoverPublicMobileRoutes()

async function assertNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => {
    const root = document.documentElement
    return root.scrollWidth > window.innerWidth + 1
  })
  expect(hasOverflow).toBeFalsy()
}

async function assertMediaFitsViewport(page: Page) {
  const violations = await page.evaluate(() => {
    const viewport = window.innerWidth
    const elems = Array.from(document.querySelectorAll('img, svg, video, canvas'))
    const failing = elems
      .filter((el) => {
        const rect = el.getBoundingClientRect()
        return rect.width > viewport + 1
      })
      .slice(0, 5)
      .map((el) => {
        const rect = el.getBoundingClientRect()
        return `${el.tagName.toLowerCase()} width=${Math.round(rect.width)}`
      })

    return failing
  })

  expect(violations, `media overflow violations: ${violations.join(', ')}`).toEqual([])
}

test.describe('Mobile public routes sweep @rubric @mobile', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('mobile-'), 'Mobile route sweep runs only on mobile projects')
  })

  for (const route of PUBLIC_ROUTES) {
    test(`route ${route} renders mobile shell (Public)`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
      const status = response?.status() ?? 0

      expect(status, `route ${route} returned unexpected status`).toBeLessThan(500)

      // Route may intentionally redirect (for example auth callback paths), but should not end up on 5xx.
      expect(page.url()).not.toMatch(/\/500(?:$|[/?#])/)

      await assertNoHorizontalOverflow(page)
      await assertMediaFitsViewport(page)

      const body = page.locator('body')
      await expect(body).toBeVisible()
    })
  }
})
