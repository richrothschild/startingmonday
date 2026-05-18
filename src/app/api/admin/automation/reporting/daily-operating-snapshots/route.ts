/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { requireStaffAutomationAccess } from '@/lib/admin-automation-auth'

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth(request)
  if (!authCheck.ok) return authCheck.response

  const auth = await requireStaffAutomationAccess(request)
  if (!auth.ok) return auth.response

  const { userId, supabase } = auth
  const sb = supabase as any

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const [{ count: events24h }, { count: followups24h }, { count: signals24h }] = await Promise.all([
    supabase.from('user_events').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', since24h),
    supabase.from('follow_ups').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', since24h),
    supabase.from('company_signals').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', since24h),
  ])

  const snapshotPayload = {
    generated_at: new Date().toISOString(),
    events_24h: events24h ?? 0,
    followups_24h: followups24h ?? 0,
    signals_24h: signals24h ?? 0,
  }

  const { data } = await sb
    .from('daily_operating_snapshots')
    .insert({ user_id: userId, snapshot_date: new Date().toISOString().slice(0, 10), snapshot_payload: snapshotPayload })
    .select('id')
    .single()

  return NextResponse.json({ ok: true, snapshotId: data?.id, snapshotPayload })
}
