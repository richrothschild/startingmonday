#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const nowIso = new Date().toISOString()
const timestamp = nowIso.replace(/[:.]/g, '-').replace('T', '_').replace('Z', '')
const outDir = path.join(process.cwd(), 'tmp')
const outJson = path.join(outDir, 'billing-payment-canary.latest.json')
const outMd = path.join(outDir, 'billing-payment-canary.latest.md')
const outJsonTimestamped = path.join(outDir, `billing-payment-canary-${timestamp}.json`)
const outMdTimestamped = path.join(outDir, `billing-payment-canary-${timestamp}.md`)

const APP_URL = (process.env.BILLING_CANARY_APP_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'https://startingmonday.app').trim().replace(/\/$/, '')
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? ''
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ''
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const CANARY_USER_ID = process.env.BILLING_CANARY_USER_ID ?? ''
const PLAN = (process.env.BILLING_CANARY_PLAN ?? 'active').trim().toLowerCase()
const INTERVAL = (process.env.BILLING_CANARY_INTERVAL ?? 'monthly').trim().toLowerCase()
const SHOULD_RESTORE = (process.env.BILLING_CANARY_RESTORE ?? '1') !== '0'

const planEnvKey = INTERVAL === 'annual' ? `STRIPE_PRICE_${PLAN.toUpperCase()}_ANNUAL` : `STRIPE_PRICE_${PLAN.toUpperCase()}`
const PLAN_PRICE_ID = process.env[planEnvKey] ?? ''

const requiredEnv = [
  ['STRIPE_SECRET_KEY', STRIPE_SECRET_KEY],
  ['STRIPE_WEBHOOK_SECRET', STRIPE_WEBHOOK_SECRET],
  ['NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL],
  ['SUPABASE_SERVICE_ROLE_KEY', SUPABASE_SERVICE_ROLE_KEY],
  ['BILLING_CANARY_USER_ID', CANARY_USER_ID],
  [planEnvKey, PLAN_PRICE_ID],
]

const missing = requiredEnv.filter(([, value]) => !String(value).trim()).map(([key]) => key)

if (missing.length > 0) {
  console.error(`billing payment canary missing required env: ${missing.join(', ')}`)
  process.exit(1)
}

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2026-05-27.dahlia' })
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchCanaryUser() {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, stripe_customer_id, subscription_tier, subscription_status, subscription_period_end, trial_ends_at')
    .eq('id', CANARY_USER_ID)
    .single()
  if (error || !data) {
    throw new Error(`failed to load canary user: ${error?.message ?? 'not found'}`)
  }
  return data
}

async function ensureStripeCustomer(user) {
  if (user.stripe_customer_id) return user.stripe_customer_id
  const customer = await stripe.customers.create(
    {
      email: user.email,
      metadata: { userId: user.id, billing_canary: 'true' },
    },
    { idempotencyKey: `billing-canary-customer-${user.id}` },
  )
  const { error } = await supabase
    .from('users')
    .update({ stripe_customer_id: customer.id })
    .eq('id', user.id)
  if (error) throw new Error(`failed to persist canary stripe customer id: ${error.message}`)
  return customer.id
}

async function emitSyntheticWebhook({ customerId, userId }) {
  const eventId = `evt_billing_canary_${Date.now()}`
  const event = {
    id: eventId,
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 1,
    request: null,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: `cs_billing_canary_${Date.now()}`,
        object: 'checkout.session',
        customer: customerId,
        metadata: {
          userId,
          plan: PLAN,
        },
      },
    },
  }
  const payload = JSON.stringify(event)
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: STRIPE_WEBHOOK_SECRET,
  })

  const response = await fetch(`${APP_URL}/api/webhooks/stripe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': signature,
    },
    body: payload,
  })
  const responseBody = await response.text().catch(() => '')
  if (!response.ok) {
    throw new Error(`webhook POST failed: ${response.status} ${responseBody}`)
  }
  return { eventId, webhookStatus: response.status, webhookResponseBody: responseBody }
}

async function waitForSubscriptionState({ expectedPlan, expectedStatus, timeoutMs = 30_000 }) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const { data, error } = await supabase
      .from('users')
      .select('subscription_tier, subscription_status, stripe_customer_id')
      .eq('id', CANARY_USER_ID)
      .single()
    if (error) throw new Error(`failed to poll canary user subscription state: ${error.message}`)
    if (
      data?.subscription_tier === expectedPlan
      && data?.subscription_status === expectedStatus
    ) {
      return { ok: true, state: data, waitedMs: Date.now() - started }
    }
    await sleep(800)
  }
  const { data: latest } = await supabase
    .from('users')
    .select('subscription_tier, subscription_status, stripe_customer_id')
    .eq('id', CANARY_USER_ID)
    .single()
  return { ok: false, state: latest ?? null, waitedMs: timeoutMs }
}

async function restoreUserState(previous) {
  const { error } = await supabase
    .from('users')
    .update({
      subscription_tier: previous.subscription_tier,
      subscription_status: previous.subscription_status,
      subscription_period_end: previous.subscription_period_end,
      trial_ends_at: previous.trial_ends_at,
    })
    .eq('id', previous.id)
  if (error) throw new Error(`failed to restore canary user state: ${error.message}`)
}

function writeArtifacts(report) {
  fs.mkdirSync(outDir, { recursive: true })
  const json = `${JSON.stringify(report, null, 2)}\n`
  fs.writeFileSync(outJson, json, 'utf8')
  fs.writeFileSync(outJsonTimestamped, json, 'utf8')

  const lines = []
  lines.push('# Billing Payment Canary')
  lines.push('')
  lines.push(`- checked_at: ${report.checked_at}`)
  lines.push(`- status: ${report.status}`)
  lines.push(`- app_url: ${report.app_url}`)
  lines.push(`- canary_user_id: ${report.canary_user_id}`)
  lines.push(`- plan: ${report.plan}`)
  lines.push(`- interval: ${report.interval}`)
  lines.push(`- price_env_key: ${report.price_env_key}`)
  lines.push(`- checkout_session_created: ${report.checkout_session_created}`)
  lines.push(`- webhook_status: ${report.webhook_status ?? 'n/a'}`)
  lines.push(`- db_transition_verified: ${report.db_transition_verified}`)
  lines.push(`- restore_attempted: ${report.restore_attempted}`)
  lines.push(`- restore_ok: ${report.restore_ok}`)
  lines.push('')
  if (report.error) {
    lines.push('## Error')
    lines.push('')
    lines.push(report.error)
  }
  const md = `${lines.join('\n')}\n`
  fs.writeFileSync(outMd, md, 'utf8')
  fs.writeFileSync(outMdTimestamped, md, 'utf8')
}

const report = {
  checked_at: nowIso,
  status: 'FAIL',
  app_url: APP_URL,
  canary_user_id: CANARY_USER_ID,
  plan: PLAN,
  interval: INTERVAL,
  price_env_key: planEnvKey,
  price_id_present: Boolean(PLAN_PRICE_ID),
  checkout_session_created: false,
  checkout_session_id: null,
  checkout_session_url: null,
  webhook_event_id: null,
  webhook_status: null,
  db_transition_verified: false,
  db_waited_ms: 0,
  restore_attempted: false,
  restore_ok: false,
  error: null,
}

try {
  const userBefore = await fetchCanaryUser()
  report.user_before = {
    subscription_tier: userBefore.subscription_tier,
    subscription_status: userBefore.subscription_status,
    subscription_period_end: userBefore.subscription_period_end,
    trial_ends_at: userBefore.trial_ends_at,
    stripe_customer_id_present: Boolean(userBefore.stripe_customer_id),
  }
  const customerId = await ensureStripeCustomer(userBefore)

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    billing_address_collection: 'required',
    line_items: [{ price: PLAN_PRICE_ID, quantity: 1 }],
    success_url: `${APP_URL}/dashboard?upgraded=1&billing_canary=1`,
    cancel_url: `${APP_URL}/settings/billing?billing_canary=1`,
    metadata: { userId: CANARY_USER_ID, plan: PLAN, billing_canary: 'true' },
    subscription_data: {
      metadata: { userId: CANARY_USER_ID, plan: PLAN, billing_canary: 'true' },
    },
  })

  if (!checkoutSession?.url?.includes('checkout.stripe.com')) {
    throw new Error('stripe checkout session URL was not returned')
  }

  report.checkout_session_created = true
  report.checkout_session_id = checkoutSession.id
  report.checkout_session_url = checkoutSession.url

  const webhookResult = await emitSyntheticWebhook({
    customerId,
    userId: CANARY_USER_ID,
  })
  report.webhook_event_id = webhookResult.eventId
  report.webhook_status = webhookResult.webhookStatus

  const waitResult = await waitForSubscriptionState({
    expectedPlan: PLAN,
    expectedStatus: 'active',
  })

  report.db_transition_verified = waitResult.ok
  report.db_waited_ms = waitResult.waitedMs

  if (!waitResult.ok) {
    throw new Error(
      `subscription side effect not observed: expected {tier:${PLAN},status:active}, got ${JSON.stringify(waitResult.state)}`,
    )
  }

  if (SHOULD_RESTORE) {
    report.restore_attempted = true
    await restoreUserState(userBefore)
    report.restore_ok = true
  }

  report.status = 'PASS'
  writeArtifacts(report)
  console.log('Billing payment canary PASS')
  console.log(`- checkout session: ${report.checkout_session_id}`)
  console.log(`- webhook event: ${report.webhook_event_id}`)
  console.log(`- db transition verified in ${report.db_waited_ms}ms`)
  console.log(`- report: ${outJson}`)
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error)
  try {
    if (SHOULD_RESTORE) {
      report.restore_attempted = true
      const original = report.user_before
      if (original) {
        await restoreUserState({
          id: CANARY_USER_ID,
          subscription_tier: original.subscription_tier,
          subscription_status: original.subscription_status,
          subscription_period_end: original.subscription_period_end,
          trial_ends_at: original.trial_ends_at,
        })
        report.restore_ok = true
      }
    }
  } catch {
    report.restore_ok = false
  }
  writeArtifacts(report)
  console.error(`Billing payment canary FAIL: ${report.error}`)
  console.error(`- report: ${outJson}`)
  process.exit(1)
}
