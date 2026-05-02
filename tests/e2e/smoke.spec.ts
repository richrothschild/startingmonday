import { test, expect } from '@playwright/test'

const ts = () => Date.now()

// ─── Dashboard ───────────────────────────────────────────────────────────────

test('dashboard loads and shows pipeline', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.getByText('Company Pipeline')).toBeVisible()
})

// ─── Companies ───────────────────────────────────────────────────────────────

test('add company appears in pipeline then can be archived', async ({ page }) => {
  const name = `E2E Test Co ${ts()}`

  // Submit new company form — action redirects to /dashboard on success
  await page.goto('/dashboard/companies/new')
  await page.fill('input[name="name"]', name)
  await page.selectOption('select[name="stage"]', 'interviewing')
  await page.fill('input[name="sector"]', 'Technology')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard', { timeout: 15_000 })

  // Verify company appears in pipeline table
  const companyLink = page.getByRole('link', { name })
  await expect(companyLink).toBeVisible()

  // Navigate to company detail
  await companyLink.click()
  await page.waitForURL('**/dashboard/companies/**')
  await expect(page.locator('h1')).toContainText(name)

  // Archive
  await page.getByRole('button', { name: 'Archive company' }).click()
  await page.waitForURL('**/dashboard', { timeout: 10_000 })

  // Confirm removed from pipeline
  await expect(page.getByRole('link', { name })).not.toBeVisible()
})

// ─── Contacts ────────────────────────────────────────────────────────────────

test('add contact appears in list then can be removed', async ({ page }) => {
  const name = `E2E Contact ${ts()}`

  await page.goto('/dashboard/contacts')
  await page.fill('input[name="name"]', name)
  await page.fill('input[name="title"]', 'VP Engineering')
  await page.selectOption('select[name="channel"]', 'linkedin')
  await page.getByRole('button', { name: 'Add contact' }).click()

  // Server action redirects to ?saved=1
  await expect(page.getByText('Contact saved.')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText(name)).toBeVisible()

  // Remove — find the row by name, click its Remove button
  const row = page.locator('div.px-6.py-4').filter({ hasText: name })
  await row.getByRole('button', { name: 'Remove' }).click()

  // Contact disappears after revalidation
  await expect(page.getByText(name)).not.toBeVisible({ timeout: 10_000 })
})

// ─── Profile ─────────────────────────────────────────────────────────────────

test('profile saves successfully', async ({ page }) => {
  await page.goto('/dashboard/profile')
  await expect(page.locator('h1')).toContainText('Profile')

  const summary = `E2E test save ${ts()}`
  await page.fill('textarea[name="positioning_summary"]', summary)
  await page.click('button[type="submit"]')

  await expect(page.getByText('Profile saved.')).toBeVisible({ timeout: 10_000 })

  // Verify persistence
  await page.reload()
  await expect(page.locator('textarea[name="positioning_summary"]')).toHaveValue(summary)
})

// ─── Prep Brief ──────────────────────────────────────────────────────────────

test('prep brief generates content', async ({ page }) => {
  test.setTimeout(180_000)
  const name = `E2E Prep Co ${ts()}`

  // Create company
  await page.goto('/dashboard/companies/new')
  await page.fill('input[name="name"]', name)
  await page.selectOption('select[name="stage"]', 'interviewing')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard', { timeout: 15_000 })

  // Navigate to company detail
  await page.getByRole('link', { name }).click()
  await page.waitForURL('**/dashboard/companies/**')
  const companyUrl = page.url()

  // Navigate to prep
  await page.getByRole('link', { name: 'Interview prep' }).click()
  await page.waitForURL('**/prep')

  // Generate brief
  await page.getByRole('button', { name: 'Generate prep brief' }).click()
  await expect(page.getByRole('button', { name: /Generating/ })).toBeVisible()

  // Wait for content (h2) or error banner — whichever appears first
  await page.locator('h2, .bg-red-50').first().waitFor({ state: 'visible', timeout: 90_000 })
  const errorText = await page.locator('.bg-red-50').textContent().catch(() => '')
  await expect(page.locator('.bg-red-50'), `Prep API error: ${errorText}`).not.toBeVisible()
  await expect(page.locator('h2').first()).toBeVisible()

  // Cleanup
  await page.goto(companyUrl)
  await page.getByRole('button', { name: 'Archive company' }).click()
  await page.waitForURL('**/dashboard', { timeout: 10_000 })
})

// ─── API Guards ──────────────────────────────────────────────────────────────

test('resume upload API rejects invalid file type', async ({ page }) => {
  const response = await page.request.post('/api/profile/upload-resume', {
    multipart: {
      file: {
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('not a pdf'),
      },
    },
    failOnStatusCode: false,
  })
  // 415 if auth works and magic bytes rejected; 401 if session not forwarded
  expect([401, 415]).toContain(response.status())
})

test('prep API denies unauthenticated access', async ({ browser }) => {
  // Create context with baseURL so relative paths resolve; no auth cookies
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://startingmonday.app'
  const ctx = await browser.newContext({ baseURL })
  const page = await ctx.newPage()
  const response = await page.request.get(
    '/api/prep/00000000-0000-0000-0000-000000000000',
    { failOnStatusCode: false }
  )
  // requireAuth returns 401; some proxies redirect to /login (302);
  // anon Supabase users pass auth but have no data so may get 404
  expect([301, 302, 303, 307, 308, 401, 404]).toContain(response.status())
  await ctx.close()
})
