import { randomUUID } from 'node:crypto'
import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const baseUrl = (process.env.PLAYWRIGHT_BASE_URL ?? 'https://startingmonday.app').trim().replace(/\/+$/, '')
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim()

test('onboarding live: name step, lane step, and dark shell are present', async ({ page }) => {
  test.skip(!supabaseUrl || !serviceRoleKey, 'Skipping onboarding-live: missing Supabase service credentials.')

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const email = `onboarding-live-${Date.now()}-${randomUUID().slice(0, 8)}@example.com`
  const password = `LiveCheck-${randomUUID()}!`
  let userId: string | null = null

  try {
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (created.error || !created.data.user?.id) {
      throw new Error(`Failed to create fixture user: ${created.error?.message ?? 'missing user id'}`)
    }

    userId = created.data.user.id

    const generated = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${baseUrl}/onboarding` },
    })

    if (generated.error || !generated.data.properties?.hashed_token || !generated.data.properties?.verification_type) {
      throw new Error(`Failed to generate magic link: ${generated.error?.message ?? 'missing token data'}`)
    }

    const callbackUrl = new URL('/auth/callback', baseUrl)
    callbackUrl.searchParams.set('token_hash', generated.data.properties.hashed_token)
    callbackUrl.searchParams.set('type', generated.data.properties.verification_type)
    callbackUrl.searchParams.set('next', '/onboarding')

    await page.goto(callbackUrl.toString(), { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/\/onboarding(?:$|[/?#])/, { timeout: 30_000 })
    await expect(page.getByPlaceholder('Your full name')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Let.s find roles before the crowd sees them\./i })).toBeVisible()

    const shellClass = await page.locator('div.min-h-screen').first().getAttribute('class')
    expect(shellClass ?? '').toContain('bg-[radial-gradient')

    await page.getByPlaceholder('Your full name').fill('Live Onboarding Check')
    await page.getByRole('button', { name: /^Start setup$/i }).click()
    await expect(page.getByRole('heading', { name: /Which role lane are you targeting\?/i })).toBeVisible({ timeout: 15_000 })
  } finally {
    if (userId) {
      await admin.auth.admin.deleteUser(userId)
    }
  }
})