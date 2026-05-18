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

  const environment = (body?.environment ?? 'production').toString().trim().toLowerCase()
  const checks = {
    api_health: body?.apiHealth !== false,
    db_health: body?.dbHealth !== false,
    background_jobs: body?.jobsHealth !== false,
  }
  const failureCount = Object.values(checks).filter(v => !v).length
  const status = failureCount === 0 ? 'healthy' : failureCount === 1 ? 'degraded' : 'unknown'

  const { data } = await sb
    .from('deployment_validation_runs')
    .insert({ user_id: userId, environment, status, details: checks })
    .select('id')
    .single()

  return NextResponse.json({ ok: true, runId: data?.id, environment, status, checks })
}
