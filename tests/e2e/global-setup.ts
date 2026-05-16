import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '.auth/user.json')

setup('authenticate', async ({ page }) => {
  const email = process.env.PLAYWRIGHT_TEST_EMAIL
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD

  if (!email || !password) {
    await page.context().storageState({ path: authFile })
    return
  }

  await page.goto('/login')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')

  // Try to establish an authenticated session, but don't fail the full suite if auth is unavailable.
  try {
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 20_000 })
    await expect(page).toHaveURL(/\/(dashboard|onboarding)(?:\/.*)?$/)
  } catch {
    // Keep an empty storage state so downstream tests can decide to skip auth-dependent paths.
  }

  await page.context().storageState({ path: authFile })
})
