import { chromium } from '@playwright/test'
import fs from 'node:fs'

const baseURL = 'https://starting-monday-staging.up.railway.app'
const storagePath = 'tests/e2e/.auth/user.json'

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ storageState: fs.existsSync(storagePath) ? storagePath : undefined })
const page = await context.newPage()

await page.goto(`${baseURL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 90000 })
await page.waitForTimeout(1500)

const section = page.locator('section').filter({ hasText: 'Required next-decision markers' }).first()
const emptyStateVisible = (await section.getByText('No campaigns yet. Add your first target to initialize timeline markers.').count()) > 0

await section.getByRole('link', { name: 'Name A-Z' }).click()
await page.waitForURL(/timelineSort=name_asc/, { timeout: 10000 }).catch(() => {})
const urlAfterName = page.url()

await section.getByRole('link', { name: 'Recently moved' }).click()
await page.waitForURL(/timelineSort=recent_desc/, { timeout: 10000 }).catch(() => {})
const urlAfterRecent = page.url()

await section.getByRole('link', { name: 'Stalled first' }).click()
await page.waitForURL(/timelineSort=stalled_desc/, { timeout: 10000 }).catch(() => {})
const urlAfterStalled = page.url()

const result = {
  emptyStateVisible,
  paginationVisible: (await section.locator('text=/Page\\s+\\d+\\s+of\\s+\\d+/').count()) > 0,
  ownerControlsVisible: (await section.locator('select[name="decision_owner"]').count()) > 0,
  urlAfterName,
  urlAfterRecent,
  urlAfterStalled,
}

console.log(JSON.stringify(result, null, 2))
await browser.close()
