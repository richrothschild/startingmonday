import { test, expect } from '@playwright/test'
import { attachJourneyGuards, expectJourneyHealthy, expectJourneyShell } from './monitoring.helpers'

const publicJourneys = [
  { path: '/', heading: /Be ready.*Be early|Starting Monday|Operating System/i },
  { path: '/login', heading: /Sign in/i },
  { path: '/signup', heading: /Get started|Create your account|Sign up/i },
  { path: '/pricing', heading: /Pricing/i },
]

for (const journey of publicJourneys) {
  test(`public journey renders cleanly: ${journey.path}`, async ({ page }) => {
    const guards = await attachJourneyGuards(page)

    await page.goto(journey.path)
    await expectJourneyShell(page, journey.heading)
    await expectJourneyHealthy(page, guards)

    await expect(page.locator('body')).not.toContainText(/404/i)
    await expect(page.locator('.bg-red-50')).toHaveCount(0)
  })
}
