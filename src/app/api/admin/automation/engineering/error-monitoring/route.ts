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
  const body = await request.json().catch(() => ({}))

  const errorCount = Math.max(0, Number(body?.errorCount ?? 0))
  const severity = errorCount >= 20 ? 'high' : errorCount >= 5 ? 'medium' : 'low'
  const details = {
    source: 'ticket48',
    reported_by: (body?.reportedBy ?? 'automation').toString(),
    top_errors: Array.isArray(body?.topErrors) ? body.topErrors.slice(0, 10) : [],
  }

  const { data } = await sb
    .from('error_monitoring_runs')
    .insert({ user_id: userId, error_count: errorCount, severity, details })
    .select('id')
    .single()

  return NextResponse.json({ ok: true, runId: data?.id, errorCount, severity })
}
