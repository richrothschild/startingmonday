import { test, expect, type Page } from '@playwright/test'

async function skipIfAuthUnavailable(page: Page) {
  await page.goto('/dashboard')
  test.skip(/\/login(?:$|[/?#])/.test(page.url()), 'Skipping auth-required E2E test: login session unavailable in CI')
}

test('chat shows retry banner on stream error and restores input', async ({ page }) => {
  await skipIfAuthUnavailable(page)
  const originalMessage = 'What should I prioritize this week?'

  // Serve empty conversation history so the chat page loads cleanly
  await page.route('**/api/conversation', async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: { id: null, messages: [] } })
    } else {
      await route.continue()
    }
  })

  // Make the AI stream return an __ERROR__ sentinel
  await page.route('**/api/chat', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'text/plain; charset=utf-8',
      body: `__ERROR__Something went wrong. Please try again.`,
    })
  })

  await page.goto('/dashboard/chat')

  const textarea = page.getByPlaceholder(/Ask anything/)
  await textarea.fill(originalMessage)
  await page.getByRole('button', { name: 'Send' }).click()

  // Retry banner should appear
  await expect(page.getByText('Something went wrong. Please try again.')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()

  // Input must be restored with the original message so the user can edit or resend
  await expect(textarea).toHaveValue(originalMessage)

  // The composer keeps user input restored; avoid asserting transcript text invisibility
  // because the same text can appear in the textarea and trip strict matching.
  await expect(page.locator('[data-role="chat-message"]')).toHaveCount(0)
})

test('chat retry banner dismisses on X click', async ({ page }) => {
  await skipIfAuthUnavailable(page)
  await page.route('**/api/conversation', async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: { id: null, messages: [] } })
    } else {
      await route.continue()
    }
  })

  await page.route('**/api/chat', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'text/plain; charset=utf-8',
      body: '__ERROR__Rate limit exceeded.',
    })
  })

  await page.goto('/dashboard/chat')
  await page.getByPlaceholder(/Ask anything/).fill('test message')
  await page.getByRole('button', { name: 'Send' }).click()

  await expect(page.getByText('Rate limit exceeded.')).toBeVisible({ timeout: 10_000 })

  await page.getByRole('button', { name: 'Dismiss' }).first().click()
  await expect(page.getByText('Rate limit exceeded.')).not.toBeVisible()
})
