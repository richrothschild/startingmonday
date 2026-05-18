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
  const simulateFailure = body?.simulateFailure === true

  const details = {
    checks: ['build', 'lint', 'test'],
    queued_at: new Date().toISOString(),
    source: 'ticket43',
  }

  const { data } = await sb
    .from('ci_check_runs')
    .insert({
      user_id: userId,
      status: simulateFailure ? 'failed' : 'success',
      details,
    })
    .select('id, status')
    .single()

  return NextResponse.json({ ok: true, runId: data?.id, status: data?.status })
}
