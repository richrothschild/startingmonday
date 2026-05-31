import { test, expect } from '@playwright/test'

const TOP_MOBILE_ROUTES = [
  { slug: 'home', path: '/' },
  { slug: 'pricing', path: '/pricing' },
  { slug: 'about', path: '/about' },
  { slug: 'for-coaches', path: '/for-coaches' },
  { slug: 'annual-report', path: '/annual-report-2026' },
]

test.describe('Mobile visual snapshots @mobile @visual', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('mobile-'), 'Visual mobile suite only runs on mobile projects')

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

  for (const route of TOP_MOBILE_ROUTES) {
    test(`${route.slug} visual baseline`, async ({ page }, testInfo) => {
      test.slow()
      await page.goto(route.path, { waitUntil: 'domcontentloaded', timeout: 60_000 })
      await page.setViewportSize(page.viewportSize() ?? { width: 390, height: 844 })
      await page.waitForTimeout(250)

      const screenshotName = `${route.slug}-${testInfo.project.name}.png`
      // Keep CI visual checks stable by comparing the viewport frame only.
      await expect(page).toHaveScreenshot(screenshotName, {
        fullPage: false,
        animations: 'disabled',
        maxDiffPixelRatio: 0.05,
      })
    })
  }
})
