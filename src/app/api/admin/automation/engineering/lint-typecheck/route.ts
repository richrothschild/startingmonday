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

  const lintStatus = body?.lintStatus === 'failed' ? 'failed' : 'success'
  const typecheckStatus = body?.typecheckStatus === 'failed' ? 'failed' : 'success'

  const { data } = await sb
    .from('lint_typecheck_runs')
    .insert({
      user_id: userId,
      lint_status: lintStatus,
      typecheck_status: typecheckStatus,
      details: {
        lint_command: 'npm run lint',
        typecheck_command: 'npx tsc --noEmit',
        source: 'ticket44',
      },
    })
    .select('id')
    .single()

  return NextResponse.json({ ok: true, runId: data?.id, lintStatus, typecheckStatus })
}
