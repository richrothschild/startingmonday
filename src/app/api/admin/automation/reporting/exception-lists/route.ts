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

  const [{ data: issueFlags }, { data: revenueFlags }] = await Promise.all([
    sb.from('support_issue_triage').select('id, severity, category, status, created_at').eq('user_id', userId).eq('status', 'open').order('created_at', { ascending: false }).limit(50),
    sb.from('revenue_mismatch_flags').select('id, severity, category, status, created_at').eq('user_id', userId).eq('status', 'open').order('created_at', { ascending: false }).limit(50),
  ])

  const exceptionPayload = {
    generated_at: new Date().toISOString(),
    support_exceptions: issueFlags ?? [],
    revenue_exceptions: revenueFlags ?? [],
    totals: {
      support: issueFlags?.length ?? 0,
      revenue: revenueFlags?.length ?? 0,
    },
  }

  const { data } = await sb
    .from('exception_list_runs')
    .insert({ user_id: userId, exception_payload: exceptionPayload })
    .select('id')
    .single()

  return NextResponse.json({ ok: true, runId: data?.id, exceptionPayload })
}
