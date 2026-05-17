import { expect, type Page } from '@playwright/test'

export type JourneyFailure = {
  pageErrors: string[]
  consoleErrors: string[]
}

export async function attachJourneyGuards(page: Page) {
  const pageErrors: string[] = []
  const consoleErrors: string[] = []

  page.on('pageerror', error => {
    pageErrors.push(error.message)
  })

  page.on('console', message => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })

  return {
    pageErrors,
    consoleErrors,
  }
}

export async function expectJourneyHealthy(page: Page, errors: JourneyFailure) {
  expect(errors.pageErrors, `Page errors: ${errors.pageErrors.join(' | ')}`).toHaveLength(0)
  expect(errors.consoleErrors, `Console errors: ${errors.consoleErrors.join(' | ')}`).toHaveLength(0)

  const bodyText = (await page.locator('body').innerText().catch(() => '')).trim()
  expect(bodyText.length, 'Rendered page was blank').toBeGreaterThan(0)
}

export async function expectJourneyShell(page: Page, titlePattern: RegExp) {
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('h1')).toContainText(titlePattern)
}
