/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { requireStaffAutomationAccess } from '@/lib/admin-automation-auth'

export async function GET(request: NextRequest) {
  const authCheck = await requireAuth(request)
  if (!authCheck.ok) return authCheck.response

  const auth = await requireStaffAutomationAccess(request)
  if (!auth.ok) return auth.response

  const { userId, supabase } = auth
  const sb = supabase as any

  const [{ data: open }, { data: recent }, { count: openCount }] = await Promise.all([
    sb.from('automation_alerts').select('id, source_table, alert_code, severity, message, status, created_at').eq('user_id', userId).eq('status', 'open').order('created_at', { ascending: false }).limit(100),
    sb.from('automation_alerts').select('id, source_table, alert_code, severity, message, status, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(25),
    sb.from('automation_alerts').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'open'),
  ])

  const severityRollup = (open ?? []).reduce((acc: Record<string, number>, row: { severity: string }) => {
    acc[row.severity] = (acc[row.severity] ?? 0) + 1
    return acc
  }, {})

  return NextResponse.json({
    ok: true,
    openCount: openCount ?? 0,
    severityRollup,
    open: open ?? [],
    recent: recent ?? [],
  })
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth(request)
  if (!authCheck.ok) return authCheck.response

  const auth = await requireStaffAutomationAccess(request)
  if (!auth.ok) return auth.response

  const { userId, supabase } = auth
  const sb = supabase as any
  const body = await request.json().catch(() => ({}))

  const alertId = (body?.alertId ?? '').toString().trim()
  const nextStatus = (body?.status ?? 'acknowledged').toString().trim().toLowerCase()
  if (!alertId) return NextResponse.json({ error: 'alertId is required' }, { status: 400 })
  if (!['acknowledged', 'resolved'].includes(nextStatus)) {
    return NextResponse.json({ error: 'status must be acknowledged or resolved' }, { status: 400 })
  }

  const { data, error } = await sb
    .from('automation_alerts')
    .update({ status: nextStatus, resolved_at: nextStatus === 'resolved' ? new Date().toISOString() : null })
    .eq('id', alertId)
    .eq('user_id', userId)
    .select('id, status')
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  if (!data?.id) return NextResponse.json({ error: 'Alert not found' }, { status: 404 })

  return NextResponse.json({ ok: true, alert: data })
}
