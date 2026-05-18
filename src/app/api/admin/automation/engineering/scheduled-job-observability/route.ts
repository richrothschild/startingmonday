/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { requireStaffAutomationAccess } from '@/lib/admin-automation-auth'

type JobStatus = 'ok' | 'late' | 'failed'

function toStatus(lastRunMinutesAgo: number, failed: boolean): JobStatus {
  if (failed) return 'failed'
  if (lastRunMinutesAgo > 20) return 'late'
  return 'ok'
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAuth(request)
  if (!authCheck.ok) return authCheck.response

  const auth = await requireStaffAutomationAccess(request)
  if (!auth.ok) return auth.response

  const { userId, supabase } = auth
  const sb = supabase as any
  const body = await request.json().catch(() => ({}))

  const jobName = (body?.jobName ?? 'automation-worker').toString().trim().slice(0, 120)
  const lastRunMinutesAgo = Math.max(0, Number(body?.lastRunMinutesAgo ?? 0))
  const failed = body?.failed === true
  const status = toStatus(lastRunMinutesAgo, failed)

  const { data } = await sb
    .from('scheduled_job_observability_runs')
    .insert({ user_id: userId, job_name: jobName, status, details: { last_run_minutes_ago: lastRunMinutesAgo, failed } })
    .select('id')
    .single()

  return NextResponse.json({ ok: true, runId: data?.id, jobName, status })
}
