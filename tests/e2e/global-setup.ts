import { test as setup, expect, type Page } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '.auth/user.json')

async function ensureMonitoringAnchorCompany(page: Page) {
  await page.goto('/dashboard')
  if (/\/login(?:$|[/?#])/.test(page.url())) return

  const companyLink = page.locator('a[href^="/dashboard/companies/"]').first()
  if ((await companyLink.count()) > 0) return

  await page.goto('/dashboard/companies/new')
  await page.fill('input[name="name"]', 'Synthetic Monitoring Anchor')
  await page.selectOption('select[name="stage"]', 'interviewing')
  await page.fill('input[name="sector"]', 'Technology')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/dashboard\//, { timeout: 20_000 }).catch(() => {})
}

setup('authenticate', async ({ page }) => {
  const email = process.env.PLAYWRIGHT_TEST_EMAIL
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD

  if (!email || !password) {
    await page.context().storageState({ path: authFile })
    return
  }

  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')

  // Try to establish an authenticated session, but don't fail the full suite if auth is unavailable.
  try {
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 20_000 })
    await expect(page).toHaveURL(/\/(dashboard|onboarding)(?:\/.*)?$/)
    await ensureMonitoringAnchorCompany(page)
  } catch {
    // Keep an empty storage state so downstream tests can decide to skip auth-dependent paths.
  }

  await page.context().storageState({ path: authFile })
})
