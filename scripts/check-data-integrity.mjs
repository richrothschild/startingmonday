#!/usr/bin/env node
/**
 * Data Integrity Anomaly Detector (R2.7)
 *
 * Checks for known data integrity issues in the Starting Monday database.
 * Exits 0 if clean, exits 1 if anomalies are found.
 *
 * Checks performed:
 *   1. Closed-contact drift: contacts in closed/archived/rejected state
 *      that still have pending follow_ups
 *   2. Duplicate pending follow_ups: same contact_id + action + due_date
 *      exceeds 5 pending follow_ups in a 30-minute window
 *   3. Invalid follow_up status: status values outside the allowed set
 *   4. Subscription drift: active subscriptions with expired current_period_end
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/check-data-integrity.mjs
 *   node scripts/check-data-integrity.mjs --json
 *
 * Environment:
 *   NEXT_PUBLIC_SUPABASE_URL — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (bypasses RLS for admin scan)
 */

import { createClient } from '@supabase/supabase-js'

const JSON_OUTPUT = process.argv.includes('--json')
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing required env: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exitCode = 1
  throw new Error('Missing required Supabase environment variables')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

async function checkClosedContactDrift() {
  // Contacts in terminal states that still have pending follow_ups
  const { data, error } = await supabase.rpc('check_closed_contact_follow_up_drift').maybeSingle()

  if (error && error.message.includes('function') && error.message.includes('does not exist')) {
    // RPC not available — fall back to a two-query approach
    const { data: contacts, error: ce } = await supabase
      .from('contacts')
      .select('id, status, user_id')
      .in('status', ['closed', 'archived', 'rejected'])

    if (ce) throw new Error(`contacts query failed: ${ce.message}`)

    if (!contacts || contacts.length === 0) {
      return { name: 'closed_contact_drift', count: 0, affected: [] }
    }

    const contactIds = contacts.map(c => c.id)

    const { data: pendingFUs, error: fe } = await supabase
      .from('follow_ups')
      .select('id, contact_id, user_id, status')
      .eq('status', 'pending')
      .in('contact_id', contactIds)

    if (fe) throw new Error(`follow_ups query failed: ${fe.message}`)

    const affected = (pendingFUs ?? []).map(f => ({
      follow_up_id: f.id,
      contact_id: f.contact_id,
      user_id: f.user_id,
    }))

    return { name: 'closed_contact_drift', count: affected.length, affected }
  }

  if (error) throw new Error(`closed_contact_drift check failed: ${error.message}`)

  return { name: 'closed_contact_drift', count: data?.count ?? 0, affected: data?.rows ?? [] }
}

async function checkDuplicatePendingFollowUps() {
  // Alert-matrix rule: same contact_id + action + due_date > 5 in 30 minutes
  const windowStartIso = new Date(Date.now() - 30 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('follow_ups')
    .select('id, contact_id, user_id, action, due_date, created_at')
    .eq('status', 'pending')
    .gte('created_at', windowStartIso)

  if (error) throw new Error(`duplicate_pending_follow_ups query failed: ${error.message}`)

  const counts = new Map()
  for (const row of data ?? []) {
    const key = `${row.contact_id ?? 'null'}::${row.action ?? 'unknown'}::${row.due_date ?? 'unknown'}`
    counts.set(
      key,
      counts.get(key) ?? {
        count: 0,
        user_id: row.user_id,
        contact_id: row.contact_id,
        action: row.action,
        due_date: row.due_date,
      },
    )
    const entry = counts.get(key)
    entry.count++
    entry.user_id = row.user_id
    counts.set(key, entry)
  }

  const affected = [...counts.entries()]
    .filter(([, v]) => v.count > 5)
    .map(([, v]) => ({
      contact_id: v.contact_id,
      action: v.action,
      due_date: v.due_date,
      user_id: v.user_id,
      pending_count: v.count,
      window_minutes: 30,
    }))

  return { name: 'duplicate_pending_follow_ups', count: affected.length, affected }
}

async function checkInvalidFollowUpStatus() {
  const ALLOWED = ['pending', 'completed', 'cancelled', 'snoozed']

  const { data, error } = await supabase
    .from('follow_ups')
    .select('id, contact_id, user_id, status, created_at')
    .not('status', 'in', `(${ALLOWED.map(s => `"${s}"`).join(',')})`)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw new Error(`invalid_status query failed: ${error.message}`)

  const affected = (data ?? []).map(r => ({
    follow_up_id: r.id,
    contact_id: r.contact_id,
    user_id: r.user_id,
    invalid_status: r.status,
  }))

  return { name: 'invalid_follow_up_status', count: affected.length, affected }
}

async function checkSubscriptionDrift() {
  // Active subscriptions with expired current_period_end (Stripe didn't renew or webhook missed)
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('id, user_id, status, current_period_end, stripe_subscription_id')
    .eq('status', 'active')
    .lt('current_period_end', now)

  if (error) {
    // Table may not exist or column name may differ — treat as advisory
    if (error.message.includes('does not exist')) {
      return { name: 'subscription_drift', count: 0, affected: [], advisory: true }
    }
    throw new Error(`subscription_drift query failed: ${error.message}`)
  }

  const affected = (data ?? []).map(r => ({
    subscription_id: r.id,
    user_id: r.user_id,
    stripe_subscription_id: r.stripe_subscription_id,
    expired_at: r.current_period_end,
  }))

  return { name: 'subscription_drift', count: affected.length, affected }
}

// ---------------------------------------------------------------------------
// Run all checks
// ---------------------------------------------------------------------------

async function run() {
  const results = []
  const errors = []

  const checks = [
    checkClosedContactDrift,
    checkDuplicatePendingFollowUps,
    checkInvalidFollowUpStatus,
    checkSubscriptionDrift,
  ]

  for (const check of checks) {
    try {
      const result = await check()
      results.push(result)
    } catch (err) {
      errors.push({ check: check.name, error: String(err) })
    }
  }

  const totalAnomalies = results.reduce((sum, r) => sum + r.count, 0)
  const clean = totalAnomalies === 0 && errors.length === 0

  const report = {
    generated_at: new Date().toISOString(),
    clean,
    total_anomalies: totalAnomalies,
    check_errors: errors.length,
    results,
    errors,
  }

  if (JSON_OUTPUT) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log(`\n=== Data Integrity Check — ${report.generated_at} ===`)
    console.log(`Status: ${clean ? 'CLEAN' : 'ANOMALIES DETECTED'}`)
    console.log(`Total anomalies: ${totalAnomalies}`)

    for (const r of results) {
      const icon = r.count === 0 ? 'OK' : 'FAIL'
      console.log(`  [${icon}] ${r.name}: ${r.count} record(s)${r.advisory ? ' (advisory)' : ''}`)
      if (VERBOSE && r.count > 0) {
        console.log('       Affected:', JSON.stringify(r.affected.slice(0, 5), null, 6))
      }
    }

    if (errors.length > 0) {
      console.log('\nCheck errors:')
      for (const e of errors) {
        console.log(`  ERROR in ${e.check}: ${e.error}`)
      }
    }
    console.log('')
  }

  if (!clean) process.exit(1)
}

run().catch(err => {
  console.error('check-data-integrity fatal error:', err)
  process.exitCode = 1
})
