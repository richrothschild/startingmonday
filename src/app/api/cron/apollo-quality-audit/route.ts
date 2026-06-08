import { type NextRequest, NextResponse } from 'next/server'
import { validateCronRequest } from '@/lib/cron-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSlackMessage } from '@/lib/slack'

export const runtime = 'nodejs'

function readNumberEnv(name: string, fallback: number): number {
  const raw = process.env[name]
  if (!raw) return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

function hoursSince(value: string | null): number | null {
  if (!value) return null
  const t = Date.parse(value)
  if (Number.isNaN(t)) return null
  return (Date.now() - t) / 3_600_000
}

function jsonArrayLength(value: unknown): number {
  return Array.isArray(value) ? value.length : 0
}

function staleMessage(input: {
  lookbackHours: number
  totalRuns: number
  totalRecommendations: number
  errorRate: number
  peopleCoverage: number
  lowConfidenceRate: number
  reasons: string[]
}): string {
  return [
    '*Apollo recommendation quality alert*',
    '- Status: stale',
    `- Lookback hours: ${input.lookbackHours}`,
    `- Apollo-backed runs: ${input.totalRuns}`,
    `- Apollo-backed recommendations: ${input.totalRecommendations}`,
    `- Run error rate: ${(input.errorRate * 100).toFixed(1)}%`,
    `- Suggested-people coverage: ${(input.peopleCoverage * 100).toFixed(1)}%`,
    `- Low-confidence rate: ${(input.lowConfidenceRate * 100).toFixed(1)}%`,
    '',
    '*Reasons*',
    ...input.reasons.map((reason) => `- ${reason}`),
  ].join('\n')
}

function recoveryMessage(input: {
  totalRuns: number
  totalRecommendations: number
  errorRate: number
  peopleCoverage: number
  lowConfidenceRate: number
}): string {
  return [
    '*Apollo recommendation quality recovered*',
    '- Status: fresh',
    `- Apollo-backed runs: ${input.totalRuns}`,
    `- Apollo-backed recommendations: ${input.totalRecommendations}`,
    `- Run error rate: ${(input.errorRate * 100).toFixed(1)}%`,
    `- Suggested-people coverage: ${(input.peopleCoverage * 100).toFixed(1)}%`,
    `- Low-confidence rate: ${(input.lowConfidenceRate * 100).toFixed(1)}%`,
  ].join('\n')
}

export async function GET(request: NextRequest) {
  if (!validateCronRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (process.env.APOLLO_ENRICHMENT_ENABLED !== 'true') {
    return NextResponse.json({ ok: true, skipped: true, reason: 'apollo_enrichment_disabled' })
  }

  const healthMode = request.nextUrl.searchParams.get('mode') === 'health'
    || request.nextUrl.searchParams.get('health') === '1'
    || request.nextUrl.searchParams.get('dry_run') === '1'

  const lookbackHours = readNumberEnv('APOLLO_QUALITY_WINDOW_HOURS', 24)
  const maxErrorRate = readNumberEnv('APOLLO_ALERT_MAX_ERROR_RATE', 0.25)
  const minPeopleCoverage = readNumberEnv('APOLLO_ALERT_MIN_PEOPLE_COVERAGE', 0.6)
  const maxLowConfidenceRate = readNumberEnv('APOLLO_ALERT_MAX_LOW_CONFIDENCE_RATE', 0.4)
  const lowConfidenceThreshold = readNumberEnv('APOLLO_LOW_CONFIDENCE_THRESHOLD', 0.55)
  const staleAlertCooldownHours = readNumberEnv('APOLLO_ALERT_COOLDOWN_HOURS', 6)

  const sinceIso = new Date(Date.now() - lookbackHours * 3_600_000).toISOString()
  const admin = createAdminClient() as any

  const [{ data: runs }, { data: recs }, { data: state }] = await Promise.all([
    admin
      .from('company_recommendation_runs')
      .select('id, source, returned_count, created_at')
      .in('source', ['apollo', 'mixed'])
      .gte('created_at', sinceIso),
    admin
      .from('company_recommendations')
      .select('id, source, confidence, suggested_people, created_at')
      .in('source', ['apollo', 'mixed'])
      .gte('created_at', sinceIso),
    admin
      .from('monitoring_alert_state')
      .select('alert_key, last_status, last_stale_alert_at, last_recovery_alert_at')
      .eq('alert_key', 'apollo-quality-audit')
      .maybeSingle(),
  ])

  const runRows = (runs ?? []) as Array<{ returned_count: number | null }>
  const recRows = (recs ?? []) as Array<{ confidence: number | null; suggested_people: unknown }>

  const totalRuns = runRows.length
  const runErrors = runRows.filter((row) => (row.returned_count ?? 0) <= 0).length
  const errorRate = totalRuns > 0 ? runErrors / totalRuns : 1

  const totalRecommendations = recRows.length
  const peopleCoverageCount = recRows.filter((row) => jsonArrayLength(row.suggested_people) > 0).length
  const peopleCoverage = totalRecommendations > 0 ? peopleCoverageCount / totalRecommendations : 0

  const lowConfidenceCount = recRows.filter((row) => (row.confidence ?? 0) < lowConfidenceThreshold).length
  const lowConfidenceRate = totalRecommendations > 0 ? lowConfidenceCount / totalRecommendations : 1

  const reasons: string[] = []
  if (totalRuns === 0) reasons.push('No Apollo-backed recommendation runs found in lookback window')
  if (errorRate > maxErrorRate) reasons.push(`Run error rate ${(errorRate * 100).toFixed(1)}% exceeds ${(maxErrorRate * 100).toFixed(1)}%`)
  if (peopleCoverage < minPeopleCoverage) reasons.push(`Suggested-people coverage ${(peopleCoverage * 100).toFixed(1)}% below ${(minPeopleCoverage * 100).toFixed(1)}%`)
  if (lowConfidenceRate > maxLowConfidenceRate) reasons.push(`Low-confidence rate ${(lowConfidenceRate * 100).toFixed(1)}% exceeds ${(maxLowConfidenceRate * 100).toFixed(1)}%`)

  const isStale = reasons.length > 0
  const previousStatus = state?.last_status ?? 'unknown'
  const staleAlertAgeHours = hoursSince(state?.last_stale_alert_at ?? null)
  const shouldAlertStale = !healthMode
    && isStale
    && (previousStatus !== 'stale' || staleAlertAgeHours === null || staleAlertAgeHours >= staleAlertCooldownHours)
  const shouldAlertRecovery = !healthMode && !isStale && previousStatus === 'stale'

  let slack = { ok: true, error: null as string | null }
  if (shouldAlertStale) {
    const result = await sendSlackMessage({
      text: staleMessage({
        lookbackHours,
        totalRuns,
        totalRecommendations,
        errorRate,
        peopleCoverage,
        lowConfidenceRate,
        reasons,
      }),
    })
    slack = result.ok ? { ok: true, error: null } : { ok: false, error: result.error }
  } else if (shouldAlertRecovery) {
    const result = await sendSlackMessage({
      text: recoveryMessage({
        totalRuns,
        totalRecommendations,
        errorRate,
        peopleCoverage,
        lowConfidenceRate,
      }),
    })
    slack = result.ok ? { ok: true, error: null } : { ok: false, error: result.error }
  }

  const nowIso = new Date().toISOString()
  const details = {
    lookbackHours,
    totalRuns,
    runErrors,
    errorRate,
    totalRecommendations,
    peopleCoverage,
    lowConfidenceRate,
    lowConfidenceThreshold,
    reasons,
    thresholds: {
      maxErrorRate,
      minPeopleCoverage,
      maxLowConfidenceRate,
      staleAlertCooldownHours,
    },
    mode: healthMode ? 'health' : 'live',
  }

  await admin
    .from('monitoring_alert_state')
    .upsert({
      alert_key: 'apollo-quality-audit',
      last_status: isStale ? 'stale' : 'fresh',
      last_checked_at: nowIso,
      last_stale_alert_at: shouldAlertStale && slack.ok ? nowIso : state?.last_stale_alert_at ?? null,
      last_recovery_alert_at: shouldAlertRecovery && slack.ok ? nowIso : state?.last_recovery_alert_at ?? null,
      last_details: details,
      updated_at: nowIso,
    }, { onConflict: 'alert_key' })

  await admin
    .from('sec_ingestion_runs')
    .insert({
      source: 'apollo-quality-audit',
      status: isStale ? 'stale' : 'fresh',
      started_at: nowIso,
      finished_at: nowIso,
      error_message: isStale ? reasons.join('; ') : null,
      metadata: {
        ...details,
        shouldAlertStale,
        shouldAlertRecovery,
        slack,
      },
    })

  return NextResponse.json({
    ok: true,
    status: isStale ? 'stale' : 'fresh',
    shouldAlertStale,
    shouldAlertRecovery,
    slack,
    details,
  })
}
