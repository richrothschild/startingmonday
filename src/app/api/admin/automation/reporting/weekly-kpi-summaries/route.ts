/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { requireStaffAutomationAccess } from '@/lib/admin-automation-auth'

function weekRange(refDate?: string): { start: string; end: string } {
  const base = refDate ? new Date(refDate) : new Date()
  const day = base.getUTCDay()
  const diffToMonday = (day + 6) % 7
  const start = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() - diffToMonday))
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 6))
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth(request)
  if (!authCheck.ok) return authCheck.response

  const auth = await requireStaffAutomationAccess(request)
  if (!auth.ok) return auth.response

  const { userId, supabase } = auth
  const sb = supabase as any
  const body = await request.json().catch(() => ({}))

  const { start, end } = weekRange(body?.referenceDate)
  const [{ count: contactsActive }, { count: followupsWeek }, { count: signalsWeek }] = await Promise.all([
    supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'active'),
    supabase.from('follow_ups').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', `${start}T00:00:00.000Z`).lte('created_at', `${end}T23:59:59.999Z`),
    supabase.from('company_signals').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', `${start}T00:00:00.000Z`).lte('created_at', `${end}T23:59:59.999Z`),
  ])

  const summaryPayload = {
    generated_at: new Date().toISOString(),
    contacts_active: contactsActive ?? 0,
    followups_week: followupsWeek ?? 0,
    signals_week: signalsWeek ?? 0,
  }

  const { data } = await sb
    .from('weekly_kpi_summary_runs')
    .insert({ user_id: userId, week_start: start, week_end: end, summary_payload: summaryPayload })
    .select('id')
    .single()

  return NextResponse.json({ ok: true, runId: data?.id, weekStart: start, weekEnd: end, summaryPayload })
}
