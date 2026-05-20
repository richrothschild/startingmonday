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
  const suite = (body?.suite ?? 'vitest').toString().trim().toLowerCase()
  const status = body?.status === 'failed' ? 'failed' : 'success'

  const { data } = await sb
    .from('test_execution_runs')
    .insert({
      user_id: userId,
      status,
      test_suite: suite,
      details: {
        command: suite === 'e2e' ? 'npm run test:e2e' : 'npm run test',
        source: 'ticket45',
      },
    })
    .select('id')
    .single()

  return NextResponse.json({ ok: true, runId: data?.id, suite, status })
}
