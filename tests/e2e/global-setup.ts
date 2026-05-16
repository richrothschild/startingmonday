import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '.auth/user.json')

setup('authenticate', async ({ page }) => {
  const email = process.env.PLAYWRIGHT_TEST_EMAIL
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD

  if (!email || !password) {
    throw new Error('PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD must be set')
  }

  await page.goto('/login')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  // Login now redirects to /dashboard/briefing for most users.
  // Wait for the page to navigate away from login page or show an h1
  await Promise.race([
    page.waitForURL(/\/dashboard\/briefing/, { timeout: 15_000 }),
    page.waitForURL(/\/dashboard/, { timeout: 15_000 }),
  ]).catch(() => null)
  // If neither worked, just wait for any h1 element to appear
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => null)
  await expect(page.locator('h1')).toBeVisible()

  await page.context().storageState({ path: authFile })
})
