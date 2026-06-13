import { test, expect } from '@playwright/test'

const SMOKE_ROUTES = [
  { slug: 'home', path: '/' },
  { slug: 'pricing', path: '/pricing' },
]

test.describe('Mobile visual smoke snapshots @mobile @visual @smoke', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('mobile-'), 'Visual mobile smoke suite only runs on mobile projects')

    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
          caret-color: transparent !important;
        }
      `,
    })
  })

  for (const route of SMOKE_ROUTES) {
    test(`${route.slug} smoke visual baseline`, async ({ page }, testInfo) => {
      test.slow()
      await page.goto(route.path, { waitUntil: 'domcontentloaded', timeout: 60_000 })
      if (route.slug === 'pricing') {
        await expect(page.getByText('Loading pricing plans...')).toBeHidden({ timeout: 10_000 })
        await expect(page.getByRole('button', { name: 'Monthly' })).toBeVisible({ timeout: 10_000 })
      }

      await page.setViewportSize(page.viewportSize() ?? { width: 390, height: 844 })
      await page.waitForTimeout(250)

      const screenshotName = `smoke-${route.slug}-${testInfo.project.name}.png`
      await expect(page).toHaveScreenshot(screenshotName, {
        fullPage: false,
        animations: 'disabled',
        maxDiffPixelRatio: 0.15,
      })
    })
  }
})