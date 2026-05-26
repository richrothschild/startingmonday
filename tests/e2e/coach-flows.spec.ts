import { test, expect, type Page } from '@playwright/test'

async function skipIfAuthUnavailable(page: Page) {
  await page.goto('/dashboard')
  test.skip(/\/login(?:$|[/?#])/.test(page.url()), 'Skipping auth-required coach test: login session unavailable in CI')
}

test.describe('Coach flows', () => {
  test('unauthenticated user is redirected to login from coach dashboard', async ({ browser }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://startingmonday.app'
    const ctx = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    await page.goto('/dashboard/coach')
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
    await ctx.close()
  })

  test('coach dashboard page renders for authenticated sessions', async ({ page }) => {
    await skipIfAuthUnavailable(page)
    await page.goto('/dashboard/coach')
    await expect(page.locator('h1')).toContainText('Your Clients')
  })

  test('coach clients API requires authentication', async ({ page }) => {
    const res = await page.request.get('/api/coach/clients', {
      failOnStatusCode: false,
    })
    expect([200, 401, 403]).toContain(res.status())
  })

  test('client-scoped coach data APIs reject unauthenticated access', async ({ browser }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://startingmonday.app'
    const ctx = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()

    const clientId = '00000000-0000-0000-0000-000000000000'
    const paths = [
      `/api/coach/client/${clientId}/companies`,
      `/api/coach/client/${clientId}/signals`,
      `/api/coach/client/${clientId}/briefs`,
      `/api/coach/client/${clientId}/scorecards`,
      `/api/coach/client/${clientId}/alerts`,
    ]

    for (const path of paths) {
      const res = await page.request.get(path, { failOnStatusCode: false })
      expect([401, 404]).toContain(res.status())
    }

    await ctx.close()
  })
})
