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

  const p95LatencyMs = Math.max(0, Number(body?.p95LatencyMs ?? 0))
  const errorRatePercent = Math.max(0, Number(body?.errorRatePercent ?? 0))
  const queueLagSeconds = Math.max(0, Number(body?.queueLagSeconds ?? 0))

  const status =
    p95LatencyMs > 2000 || errorRatePercent > 3 || queueLagSeconds > 300
      ? 'critical'
      : p95LatencyMs > 1000 || errorRatePercent > 1 || queueLagSeconds > 90
        ? 'warning'
        : 'healthy'

  const details = { p95_latency_ms: p95LatencyMs, error_rate_percent: errorRatePercent, queue_lag_seconds: queueLagSeconds }
  const { data } = await sb
    .from('runtime_health_check_runs')
    .insert({ user_id: userId, status, details })
    .select('id')
    .single()

  return NextResponse.json({ ok: true, runId: data?.id, status, details })
}
