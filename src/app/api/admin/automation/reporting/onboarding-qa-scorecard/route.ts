/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { requireStaffAutomationAccess } from '@/lib/admin-automation-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeOnboardingChannel } from '@/lib/onboarding-speed'
import { validateCronRequest } from '@/lib/cron-auth'

type UserEventRow = {
  user_id: string
  event_name: string
  created_at: string
  properties: Record<string, unknown> | null
}

function weekStartIso(referenceDate?: string): string {
  const base = referenceDate ? new Date(referenceDate) : new Date()
  const day = base.getUTCDay()
  const diffToMonday = (day + 6) % 7
  const start = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() - diffToMonday))
  return start.toISOString().slice(0, 10)
}

function pct(numerator: number, denominator: number): number {
  if (!denominator) return 0
  return Number(((numerator / denominator) * 100).toFixed(2))
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[middle - 1] + sorted[middle]) / 2)
  }
  return Math.round(sorted[middle])
}

function getNumber(properties: Record<string, unknown> | null, key: string): number | null {
  if (!properties) return null
  const value = properties[key]
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function getBoolean(properties: Record<string, unknown> | null, key: string): boolean {
  if (!properties) return false
  const value = properties[key]
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value === 'true'
  return false
}

function getString(properties: Record<string, unknown> | null, key: string): string | null {
  if (!properties) return null
  const value = properties[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export async function POST(request: NextRequest) {
  const isCronRequest = validateCronRequest(request)
  if (!isCronRequest) {
    const authCheck = await requireAuth(request)
    if (!authCheck.ok) return authCheck.response

    const auth = await requireStaffAutomationAccess(request)
    if (!auth.ok) return auth.response
  }

  const body = await request.json().catch(() => ({})) as { referenceDate?: string }
  const weekStart = weekStartIso(body.referenceDate)
  const weekStartDate = new Date(`${weekStart}T00:00:00.000Z`)
  const weekEnd = new Date(weekStartDate.getTime() + 7 * 86400000).toISOString()

  const admin = createAdminClient() as any

  const { data: rawEvents } = await admin
    .from('user_events')
    .select('user_id, event_name, created_at, properties')
    .in('event_name', [
      'onboarding_started',
      'onboarding_nudge_shown',
      'onboarding_low_energy_enabled',
      'onboarding_completed',
    ])
    .gte('created_at', `${weekStart}T00:00:00.000Z`)
    .lt('created_at', weekEnd)
    .limit(50000)

  const events = (rawEvents ?? []) as UserEventRow[]

  const startedUsers = new Set<string>()
  const completedUsers = new Set<string>()
  const transitionFirstCompletedUsers = new Set<string>()
  const lowEnergyUsers = new Set<string>()
  const nudgedUsers = new Set<string>()

  const channelMix = new Map<string, number>()
  const personaMix = new Map<string, number>()
  const completionSeconds: number[] = []
  const reductionRates: number[] = []

  for (const row of events) {
    if (row.event_name === 'onboarding_started') {
      startedUsers.add(row.user_id)
      continue
    }

    if (row.event_name === 'onboarding_nudge_shown') {
      nudgedUsers.add(row.user_id)
      continue
    }

    if (row.event_name === 'onboarding_low_energy_enabled') {
      lowEnergyUsers.add(row.user_id)
      continue
    }

    if (row.event_name !== 'onboarding_completed') continue

    completedUsers.add(row.user_id)

    const transitionFirst = getBoolean(row.properties, 'transition_first')
    if (transitionFirst) transitionFirstCompletedUsers.add(row.user_id)

    const elapsedSeconds = getNumber(row.properties, 'onboarding_elapsed_seconds')
    if (elapsedSeconds && elapsedSeconds > 0) completionSeconds.push(elapsedSeconds)

    const reductionRate = getNumber(row.properties, 'manual_fields_reduction_rate')
    if (reductionRate !== null) reductionRates.push(reductionRate)

    const channel = normalizeOnboardingChannel(getString(row.properties, 'onboarding_channel'))
    channelMix.set(channel, (channelMix.get(channel) ?? 0) + 1)

    const persona = getString(row.properties, 'search_persona') ?? 'unknown'
    personaMix.set(persona, (personaMix.get(persona) ?? 0) + 1)

    if (getBoolean(row.properties, 'onboarding_low_energy')) {
      lowEnergyUsers.add(row.user_id)
    }
  }

  const startedCount = startedUsers.size
  const completedCount = completedUsers.size
  const transitionFirstCompleted = transitionFirstCompletedUsers.size

  const medianSecondsToFirstValue = median(completionSeconds)
  const underTenCount = completionSeconds.filter((seconds) => seconds <= 600).length
  const underTenMinRate = pct(underTenCount, completionSeconds.length)

  const avgManualFieldsReductionRate = reductionRates.length
    ? Number((reductionRates.reduce((sum, value) => sum + value, 0) / reductionRates.length).toFixed(2))
    : 0

  const lowEnergyModeRate = pct(lowEnergyUsers.size, completedCount || startedCount)
  const nudgeCoverageRate = pct(nudgedUsers.size, startedCount)

  const notes: string[] = []
  if (underTenMinRate < 70) notes.push('under-10-minute rate below 70%')
  if (avgManualFieldsReductionRate < 40) notes.push('manual fields reduction below 40%')
  if (lowEnergyModeRate < 10) notes.push('low-energy mode usage below 10%')

  const channelMixJson = Object.fromEntries([...channelMix.entries()].sort((a, b) => b[1] - a[1]))
  const personaMixJson = Object.fromEntries([...personaMix.entries()].sort((a, b) => b[1] - a[1]))

  const { data, error } = await admin
    .from('onboarding_qa_weekly_scorecards')
    .upsert({
      week_start: weekStart,
      started_users: startedCount,
      completed_users: completedCount,
      transition_first_completed: transitionFirstCompleted,
      median_seconds_to_first_value: medianSecondsToFirstValue,
      under_ten_min_rate: underTenMinRate,
      avg_manual_fields_reduction_rate: avgManualFieldsReductionRate,
      low_energy_mode_rate: lowEnergyModeRate,
      nudge_coverage_rate: nudgeCoverageRate,
      channel_mix: channelMixJson,
      persona_mix: personaMixJson,
      notes: notes.length > 0 ? notes.join('; ') : null,
      generated_at: new Date().toISOString(),
    }, { onConflict: 'week_start' })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    runId: data?.id,
    weekStart,
    startedUsers: startedCount,
    completedUsers: completedCount,
    transitionFirstCompleted,
    medianSecondsToFirstValue,
    underTenMinRate,
    avgManualFieldsReductionRate,
    lowEnergyModeRate,
    nudgeCoverageRate,
    notes,
  })
}
