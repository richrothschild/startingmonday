/**
 * SLO: Prep brief streaming must begin within 10 seconds of generation start.
 *
 * This test measures time-to-first-content (TTFC) - the moment the first H2
 * heading appears in the streaming output. It does not measure total generation
 * time, which varies with brief length. P95 target: < 10s TTFC.
 *
 * If this test fails intermittently, check:
 *   1. Claude API latency (Anthropic status page)
 *   2. Railway staging cold starts (re-run once)
 *   3. Supabase query time on the prep context fetch
 */

import { test, expect } from '@playwright/test'

const SLO_TTFC_MS = 10_000   // 10 seconds: time to first streaming content
const TOTAL_TIMEOUT_MS = 60_000

test('prep brief TTFC meets SLO (< 10s)', async ({ page }) => {
  test.setTimeout(TOTAL_TIMEOUT_MS + 30_000)
  const ts = Date.now()
  const name = `SLO Test Co ${ts}`

  // Create a company to run prep against
  await page.goto('/dashboard/companies/new')
  await page.fill('input[name="name"]', name)
  await page.selectOption('select[name="stage"]', 'interviewing')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 })

  // Navigate to company prep page
  let companyUrl: string
  if (page.url().includes('/companies/')) {
    companyUrl = page.url().split('?')[0]
  } else {
    await page.getByRole('link', { name }).click()
    await page.waitForURL('**/dashboard/companies/**')
    companyUrl = page.url()
  }

  await page.getByRole('link', { name: 'Interview prep' }).click()
  await page.waitForURL('**/prep')

  // Start timing from the moment the user clicks Generate
  const t0 = Date.now()
  await page.getByRole('button', { name: 'Generate prep brief' }).click()

  // Wait for the first H2 (first section heading in the streaming output)
  // This is the TTFC metric - how long before anything meaningful appears.
  await page.locator('h2').first().waitFor({ state: 'visible', timeout: TOTAL_TIMEOUT_MS })
  const ttfc = Date.now() - t0

  // Report the measured time in the test output
  console.log(`Prep brief TTFC: ${ttfc}ms (SLO: ${SLO_TTFC_MS}ms)`)

  // Check for API errors first — a fast error is not a passing SLO
  const hasError = await page.locator('.bg-red-50').isVisible()
  expect(hasError, 'Prep brief returned an error').toBe(false)

  // SLO assertion
  expect(ttfc, `Prep brief TTFC ${ttfc}ms exceeded SLO of ${SLO_TTFC_MS}ms`).toBeLessThanOrEqual(SLO_TTFC_MS)

  // Cleanup
  await page.goto(companyUrl)
  await page.getByRole('button', { name: 'Archive company' }).click()
  await page.waitForURL('**/dashboard', { timeout: 10_000 })
})
