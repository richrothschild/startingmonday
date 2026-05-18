/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST() {
  const admin = createAdminClient() as any

  const { data: accountsRaw, error: fetchError } = await admin
    .from('target_accounts')
    .select('id, domain')
    .is('monitoring_enabled', true)

  const accounts = Array.isArray(accountsRaw) ? accountsRaw : []

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  for (const account of accounts) {
    try {
      const signals = [
        { type: 'website_visit', timestamp: new Date().toISOString() },
        { type: 'email_open', timestamp: new Date().toISOString() },
      ]

      for (const signal of signals) {
        const { error: logError } = await admin
          .from('account_signals')
          .insert({
            account_id: account.id,
            signal_type: signal.type,
            signal_timestamp: signal.timestamp,
          })

        if (logError) {
          console.error(`Failed to log signal for account ${account.id}: ${logError.message}`)
        }
      }
    } catch (err) {
      console.error(`Error monitoring signals for account ${account.id}:`, err)
    }
  }

  return NextResponse.json({ ok: true, monitored: accounts.length })
}