import { test, expect, type Page } from '@playwright/test'

async function skipIfAuthUnavailable(page: Page) {
  await page.goto('/dashboard')
  test.skip(/\/login(?:$|[/?#])/.test(page.url()), 'Skipping auth-required mobile UI test: login session unavailable in CI')
}

async function clickBottomNavItem(page: Page, name: string) {
  const fixedNav = page.locator('nav').last()
  const link = fixedNav.getByRole('link', { name }).first()
  await expect(link).toBeVisible()
  await link.scrollIntoViewIfNeeded()
  await link.click({ force: true })
}

test.describe('Mobile UI rubric @rubric @mobile', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('mobile-'), 'Mobile rubric suite only runs on mobile projects')
  })

  test('dashboard mobile layout passes core rubric checks', async ({ page }) => {
    await skipIfAuthUnavailable(page)
    await page.goto('/dashboard')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // R1: no horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      const root = document.documentElement
      return root.scrollWidth > window.innerWidth + 1
    })
    expect(hasOverflow).toBeFalsy()

    // R2: jump chips are rendered as tappable controls
    const jumpHeading = page.getByRole('heading', { name: 'Jump to section' })
    await expect(jumpHeading).toBeVisible()
    const jumpContainer = page.locator('h2:has-text("Jump to section") + div').first()
    const jumpChips = jumpContainer.locator('a[href^="#"]')
    await expect(jumpChips).toHaveCount(4)

    // Responsive layout: 2 columns under sm, 4 columns at/above sm.
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    const renderedColumns = await jumpContainer.evaluate((el) => {
      const style = window.getComputedStyle(el)
      const template = style.gridTemplateColumns
      if (!template || template === 'none') return 0
      return template.split(' ').filter(Boolean).length
    })
    if (viewportWidth < 640) {
      expect(renderedColumns).toBe(2)
    } else {
      expect(renderedColumns).toBe(4)
    }

    // Balanced layout for phone-sized viewports: two chips per row.
    const yPositions = await jumpChips.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)))
    const rows = new Map()
    for (const y of yPositions) rows.set(y, (rows.get(y) ?? 0) + 1)
    const rowCounts = [...rows.values()].sort((a, b) => b - a)
    if (viewportWidth < 640) {
      expect(rowCounts[0]).toBe(2)
      expect(rowCounts[1]).toBe(2)
    }

    // R5: no large blank region after meaningful page content
    const blankGap = await page.evaluate(() => {
      const nav = document.querySelector('nav')
      const main = document.querySelector('main')
      if (!main) return 9999
      const mainRect = main.getBoundingClientRect()
      const mainBottomDocY = window.scrollY + mainRect.bottom
      const docHeight = document.documentElement.scrollHeight
      const navHeight = nav ? nav.getBoundingClientRect().height : 0
      return Math.max(0, Math.round(docHeight - mainBottomDocY - navHeight))
    })
    expect(blankGap).toBeLessThan(180)

    // R3/R2: primary CTA should be visible and reasonably tappable.
    const cta = page.getByRole('link', { name: 'Open briefing' }).first()
    await expect(cta).toBeVisible()
    const ctaBox = await cta.boundingBox()
    expect(ctaBox?.height ?? 0).toBeGreaterThanOrEqual(44)
  })

  test('bottom nav works across key destinations', async ({ page }) => {
    await skipIfAuthUnavailable(page)
    await page.goto('/dashboard')

    await clickBottomNavItem(page, 'Contacts')
    await expect(page).toHaveURL(/\/dashboard\/contacts/)

    await clickBottomNavItem(page, 'Signals')
    await expect(page).toHaveURL(/\/dashboard\/signals/)

    await clickBottomNavItem(page, 'Home')
    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test('non-staff account does not show Outreach in quick access', async ({ browser }) => {
    const email = process.env.PLAYWRIGHT_NONSTAFF_EMAIL
    const password = process.env.PLAYWRIGHT_NONSTAFF_PASSWORD
    test.skip(!email || !password, 'Skipping non-staff visibility test: non-staff credentials not configured')

    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://startingmonday.app'
    const ctx = await browser.newContext({ baseURL })
    const page = await ctx.newPage()

    await page.goto('/login')
    await page.fill('#email', email!)
    await page.fill('#password', password!)
    await page.click('button[type="submit"]')
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 20_000 })

    await page.goto('/dashboard')
    const outreachChip = page.getByRole('link', { name: 'Outreach' })
    await expect(outreachChip).toHaveCount(0)

    await ctx.close()
  })
})
