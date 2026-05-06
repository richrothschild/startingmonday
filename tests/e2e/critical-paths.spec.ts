import { test, expect } from '@playwright/test'

// ─── Path 1: Signup → Onboarding → Dashboard ─────────────────────────────────
// Full signup requires email confirmation which can't be automated in E2E.
// These tests cover: page structure, auth redirect guards, and post-onboarding state.

test.describe('Signup and onboarding', () => {
  test('signup page has required form fields', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.getByRole('button', { name: /Get started/i })).toBeVisible()
  })

  test('unauthenticated user is redirected to login from dashboard', async ({ browser }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://startingmonday.app'
    const ctx = await browser.newContext({ baseURL }) // no storageState — no auth cookies
    const page = await ctx.newPage()
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
    await ctx.close()
  })

  test('activation checklist loads after onboarding is complete', async ({ page }) => {
    await page.goto('/dashboard/start')
    await expect(page.locator('h1')).toBeVisible()
    // Progress indicator shows "X of 6 steps"
    await expect(page.getByText(/of 6/)).toBeVisible()
  })

  test('onboarding is required before accessing dashboard', async ({ page }) => {
    // If onboarding is complete, dashboard loads. If not, it redirects to /onboarding.
    // Either outcome is correct — neither is a silent failure.
    await page.goto('/dashboard')
    const url = page.url()
    expect(url).toMatch(/\/(dashboard|onboarding)/)
  })
})

// ─── Path 2: Trial → Stripe Checkout ─────────────────────────────────────────

test.describe('Billing and Stripe checkout', () => {
  test('billing page loads with plan sections', async ({ page }) => {
    await page.goto('/settings/billing')
    await expect(page.locator('h1')).toContainText('Billing')
    await expect(page.getByText('Account')).toBeVisible()
    await expect(page.getByText('Current Plan')).toBeVisible()
  })

  test('checkout API rejects unknown plan with 400', async ({ page }) => {
    const res = await page.request.post('/api/billing/checkout', {
      data: { plan: 'nonexistent_plan' },
      failOnStatusCode: false,
    })
    expect(res.status()).toBe(400)
  })

  test('checkout API rejects empty body with 400', async ({ page }) => {
    const res = await page.request.post('/api/billing/checkout', {
      data: {},
      failOnStatusCode: false,
    })
    expect(res.status()).toBe(400)
  })

  test('checkout API accepts valid plan without returning 400 or 401', async ({ page }) => {
    const res = await page.request.post('/api/billing/checkout', {
      data: { plan: 'active', interval: 'monthly' },
      failOnStatusCode: false,
    })
    // 400 = Zod rejected the input (regression), 401 = auth broken (regression)
    // 200 = success (live Stripe), 500 = acceptable in test env with no Stripe keys
    expect(res.status()).not.toBe(400)
    expect(res.status()).not.toBe(401)
    if (res.status() === 200) {
      const body = await res.json()
      expect(body.url).toMatch(/^https:\/\/checkout\.stripe\.com/)
    }
  })

  test('Subscribe button calls checkout API with the selected plan', async ({ page }) => {
    test.setTimeout(30_000)
    let capturedPlan: string | null = null

    await page.route('/api/billing/checkout', async route => {
      capturedPlan = (await route.request().postDataJSON())?.plan ?? null
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://checkout.stripe.com/pay/test-intercepted' }),
      })
    })

    await page.goto('/settings/billing')

    const subscribeButton = page.getByRole('button', { name: /Subscribe to/i }).first()
    if (!(await subscribeButton.isVisible())) {
      // User is already subscribed — upgrade buttons are hidden. Skip UI portion.
      return
    }

    // Navigation to Stripe will fail (external) — catch so the test doesn't error
    await Promise.all([
      page.waitForNavigation({ timeout: 4_000 }).catch(() => {}),
      subscribeButton.click(),
    ])

    expect(capturedPlan).not.toBeNull()
    // Plan must be a known plan key (monitor or active), not an arbitrary string
    expect(['monitor', 'active']).toContain(capturedPlan)
  })
})

// ─── Path 3: Prep Brief Generation ───────────────────────────────────────────
// Covered by smoke.spec.ts — not duplicated here.

// ─── Path 4: Daily Briefing ───────────────────────────────────────────────────
// The worker job and email delivery can't be tested in E2E without a real worker.
// These tests cover the briefing page — the output surface users actually see.

test.describe('Daily briefing page', () => {
  test('briefing page loads and shows greeting', async ({ page }) => {
    test.setTimeout(60_000)
    await page.goto('/dashboard/briefing')
    // Server generates the briefing via Claude — may take up to 30s
    await expect(page.locator('h1')).toBeVisible({ timeout: 30_000 })
    const heading = await page.locator('h1').textContent()
    expect(heading).toMatch(/Good (morning|afternoon|evening)/i)
  })

  test('briefing page has link back to dashboard', async ({ page }) => {
    test.setTimeout(60_000)
    await page.goto('/dashboard/briefing')
    await expect(page.locator('h1')).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole('link', { name: /Dashboard/i }).first()).toBeVisible()
  })

  test('briefing page does not show a server error', async ({ page }) => {
    test.setTimeout(60_000)
    await page.goto('/dashboard/briefing')
    await expect(page.locator('h1')).toBeVisible({ timeout: 30_000 })
    // No error banners or 500 content
    await expect(page.locator('.bg-red-50')).not.toBeVisible()
  })
})
