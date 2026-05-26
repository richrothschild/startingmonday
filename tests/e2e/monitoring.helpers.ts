import { expect, type Page } from '@playwright/test'

export type JourneyFailure = {
  pageErrors: string[]
  consoleErrors: string[]
}

export async function attachJourneyGuards(page: Page) {
  const pageErrors: string[] = []
  const consoleErrors: string[] = []
  const ignoredErrorPatterns = [
    /Minified React error #418/i,
    /Failed to fetch current statuses/i,
    /Failed to load resource: the server responded with a status of 500/i,
  ]

  const isIgnorableError = (message: string) =>
    ignoredErrorPatterns.some((pattern) => pattern.test(message))

  page.on('pageerror', error => {
    if (isIgnorableError(error.message)) {
      return
    }
    pageErrors.push(error.message)
  })

  page.on('console', message => {
    if (message.type() === 'error') {
      const errorText = message.text()
      if (isIgnorableError(errorText)) {
        return
      }
      consoleErrors.push(errorText)
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
  const heading = page.locator('h1').first()
  await expect(heading).toBeVisible()
  await expect(heading).toContainText(titlePattern)
}
