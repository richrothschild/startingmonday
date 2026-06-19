import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { asLooseSupabaseClient, parseAutomationBody, requireAutomationAccess } from '@/lib/admin-automation-route'

type JobStatus = 'ok' | 'late' | 'failed'

type SnapshotRow = {
  metric_name: string
  metric_value: number | null
  metric_status: 'ok' | 'no_data' | 'query_error'
  week_start: string
  week_end: string
  generated_at: string
  source_table: string | null
  source_notes: string | null
}

type DriftResult = {
  metricName: string
  publishedValue: number
  currentValue: number | null
  metricStatus: SnapshotRow['metric_status'] | 'missing'
  driftStatus: 'match' | 'within_tolerance' | 'mismatch' | 'null_or_missing'
  absoluteDiff: number | null
  latestWeekEnd: string | null
  consecutiveNullWeeks: number
  sourceTable: string | null
}

const rerunSchema = z.object({
  referenceDate: z.string().datetime().optional(),
  tolerancePoints: z.number().min(0).max(100).optional(),
})

const PUBLISHED_KPI_VALUES = {
  // Updated to the latest published production baseline set used for EMI rerun drift checks.
  emi_language_adoption_percent: 33.33,
  assessment_completion_percent: 100,
  day7_return_percent: 8.33,
  proof_assets_published_count: 3,
  b2b_pilot_conversion_percent: 28.57,
  tier1_claim_compliance_percent: 100,
} as const

const JOB_NAME = 'emi-production-validation-rerun'

function cutoffIso(referenceDate?: string): string {
  const base = referenceDate ? new Date(referenceDate) : new Date()
  const d = new Date(base.toISOString())
  d.setUTCDate(d.getUTCDate() - 120)
  return d.toISOString()
}

function toStatus(mismatchCount: number, nullStreakCount: number): JobStatus {
  if (mismatchCount > 0 || nullStreakCount > 0) return 'failed'
  return 'ok'
}

function classifyMetric(
  metricName: keyof typeof PUBLISHED_KPI_VALUES,
  rows: SnapshotRow[],
  tolerancePoints: number,
): DriftResult {
  const latest = rows[0]
  const publishedValue = PUBLISHED_KPI_VALUES[metricName]

  let consecutiveNullWeeks = 0
  for (const row of rows.slice(0, 2)) {
    const isNullish = row.metric_status !== 'ok' || row.metric_value === null
    if (!isNullish) break
    consecutiveNullWeeks += 1
  }

  if (!latest || latest.metric_status !== 'ok' || latest.metric_value === null) {
    return {
      metricName,
      publishedValue,
      currentValue: latest?.metric_value ?? null,
      metricStatus: latest?.metric_status ?? 'missing',
      driftStatus: 'null_or_missing',
      absoluteDiff: null,
      latestWeekEnd: latest?.week_end ?? null,
      consecutiveNullWeeks,
      sourceTable: latest?.source_table ?? null,
    }
  }

  const absoluteDiff = Math.abs(Number(latest.metric_value) - publishedValue)
  let driftStatus: DriftResult['driftStatus'] = 'match'
  if (absoluteDiff > tolerancePoints) driftStatus = 'mismatch'
  else if (absoluteDiff > 0) driftStatus = 'within_tolerance'

  return {
    metricName,
    publishedValue,
    currentValue: Number(latest.metric_value),
    metricStatus: latest.metric_status,
    driftStatus,
    absoluteDiff,
    latestWeekEnd: latest.week_end,
    consecutiveNullWeeks,
    sourceTable: latest.source_table,
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAutomationAccess(request)
    if (!auth.ok) return auth.response

    const { userId, supabase } = auth
    const sb = asLooseSupabaseClient(supabase)
    const parsedBody = await parseAutomationBody(request, rerunSchema)
    if (!parsedBody.ok) return parsedBody.response
    const body = parsedBody.body

    const tolerancePoints = Number(body.tolerancePoints ?? 5)
    const { data: rawSnapshots, error } = await sb
      .from('emi_kpi_snapshots')
      .select('metric_name,metric_value,metric_status,week_start,week_end,generated_at,source_table,source_notes')
      .gte('week_end', cutoffIso(body.referenceDate))
      .order('week_end', { ascending: false })
      .order('generated_at', { ascending: false })
      .limit(200)

    if (error) {
      return NextResponse.json({ error: 'Failed to load EMI KPI snapshots' }, { status: 500 })
    }

    const snapshots = Array.isArray(rawSnapshots) ? rawSnapshots as SnapshotRow[] : []
    const grouped = new Map<string, SnapshotRow[]>()
    for (const row of snapshots) {
      const existing = grouped.get(row.metric_name) ?? []
      existing.push(row)
      grouped.set(row.metric_name, existing)
    }

    const driftResults = (Object.keys(PUBLISHED_KPI_VALUES) as Array<keyof typeof PUBLISHED_KPI_VALUES>)
      .map((metricName) => classifyMetric(metricName, grouped.get(metricName) ?? [], tolerancePoints))

    // Align with runbook policy: null metrics are blocking only after two consecutive weekly nulls.
    const mismatchCount = driftResults.filter((row) => (
      row.driftStatus === 'mismatch'
      || (row.driftStatus === 'null_or_missing' && row.consecutiveNullWeeks >= 2)
    )).length
    const nullStreakCount = driftResults.filter((row) => row.consecutiveNullWeeks >= 2).length
    const status = toStatus(mismatchCount, nullStreakCount)

    const runPayload = {
      reference_date: body.referenceDate ?? null,
      tolerance_points: tolerancePoints,
      mismatch_count: mismatchCount,
      null_streak_count: nullStreakCount,
      published_values: PUBLISHED_KPI_VALUES,
      drift_results: driftResults,
    }

    const { data } = await sb
      .from('scheduled_job_observability_runs')
      .insert({
        user_id: userId,
        job_name: JOB_NAME,
        status,
        details: runPayload,
      })
      .select('id')
      .single()

    return NextResponse.json({
      ok: true,
      runId: data?.id,
      jobName: JOB_NAME,
      status,
      mismatchCount,
      nullStreakCount,
      driftResults,
    })
  } catch (error) {
    console.error('[reporting.emi-validation-reruns] request failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
