/* eslint-disable @typescript-eslint/no-explicit-any */
export type ReliabilityThresholds = {
  minAcceptedRatePct: number
  maxNegativeOutcomeRatePct: number
  maxHardFailureRatePct: number
  maxQueueStaleMinutes: number
  maxSendingLockMinutes: number
  maxWebhookLagMinutes: number
  maxRetryRatePct: number
}

export type ReliabilityAlert = {
  level: 'info' | 'warning' | 'critical'
  code: string
  title: string
  detail: string
}

export type DailyReliabilityRow = {
  date: string
  total: number
  acceptedLike: number
  delivered: number
  replied: number
  negativeOutcomes: number
  failed: number
  acceptedRatePct: number
  negativeOutcomeRatePct: number
}

export type ReliabilitySnapshot = {
  generatedAt: string
  windowDays: number
  thresholds: ReliabilityThresholds
  totals: {
    total: number
    acceptedLike: number
    delivered: number
    replied: number
    failed: number
    bounced: number
    complained: number
    queued: number
    sending: number
    accepted: number
    acceptedRatePct: number
    negativeOutcomeRatePct: number
    hardFailureRatePct: number
    retryRatePct: number
  }
  queueHealth: {
    queuedStaleCount: number
    sendingStaleCount: number
    acceptedLagCount: number
  }
  domainBreakdown: Array<{
    domainBucket: string
    total: number
    acceptedLike: number
    failed: number
    acceptedRatePct: number
    hardFailureRatePct: number
  }>
  daily: DailyReliabilityRow[]
  alerts: ReliabilityAlert[]
  confidence: {
    score: number
    band: 'high' | 'medium' | 'low'
    rationale: string
  }
}

export type OutreachSendJobMetricRow = {
  created_at: string
  state: string | null
  domain_bucket: string | null
  attempt_count: number | null
  accepted_at: string | null
  locked_at: string | null
  next_attempt_at: string | null
}

function toFinite(value: unknown, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0
  return Math.round((part / whole) * 1000) / 10
}

function asDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isFinite(d.getTime()) ? d : null
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function resolveReliabilityThresholds(overrides?: Partial<ReliabilityThresholds>): ReliabilityThresholds {
  return {
    minAcceptedRatePct: toFinite(overrides?.minAcceptedRatePct ?? process.env.OUTREACH_ALERT_MIN_ACCEPTED_RATE_PCT, 97),
    maxNegativeOutcomeRatePct: toFinite(overrides?.maxNegativeOutcomeRatePct ?? process.env.OUTREACH_ALERT_MAX_NEGATIVE_OUTCOME_RATE_PCT, 4),
    maxHardFailureRatePct: toFinite(overrides?.maxHardFailureRatePct ?? process.env.OUTREACH_ALERT_MAX_HARD_FAILURE_RATE_PCT, 2),
    maxQueueStaleMinutes: toFinite(overrides?.maxQueueStaleMinutes ?? process.env.OUTREACH_ALERT_MAX_QUEUE_STALE_MINUTES, 20),
    maxSendingLockMinutes: toFinite(overrides?.maxSendingLockMinutes ?? process.env.OUTREACH_ALERT_MAX_SENDING_LOCK_MINUTES, 15),
    maxWebhookLagMinutes: toFinite(overrides?.maxWebhookLagMinutes ?? process.env.OUTREACH_ALERT_MAX_WEBHOOK_LAG_MINUTES, 45),
    maxRetryRatePct: toFinite(overrides?.maxRetryRatePct ?? process.env.OUTREACH_ALERT_MAX_RETRY_RATE_PCT, 12),
  }
}

export function buildReliabilitySnapshot(input: {
  jobs: OutreachSendJobMetricRow[]
  now?: Date
  windowDays: number
  thresholds?: Partial<ReliabilityThresholds>
}): ReliabilitySnapshot {
  const now = input.now ?? new Date()
  const nowMs = now.getTime()
  const thresholds = resolveReliabilityThresholds(input.thresholds)
  const jobs = Array.isArray(input.jobs) ? input.jobs : []

  const totals = {
    total: 0,
    acceptedLike: 0,
    delivered: 0,
    replied: 0,
    failed: 0,
    bounced: 0,
    complained: 0,
    queued: 0,
    sending: 0,
    accepted: 0,
    acceptedRatePct: 0,
    negativeOutcomeRatePct: 0,
    hardFailureRatePct: 0,
    retryRatePct: 0,
  }

  let retryCount = 0
  const domainMap = new Map<string, { total: number; acceptedLike: number; failed: number }>()
  const dailyMap = new Map<string, { total: number; acceptedLike: number; delivered: number; replied: number; negative: number; failed: number }>()

  let queuedStaleCount = 0
  let sendingStaleCount = 0
  let acceptedLagCount = 0

  for (const row of jobs) {
    const state = (row.state ?? 'queued').toLowerCase()
    const domainBucket = (row.domain_bucket ?? 'corporate').toLowerCase()
    const created = asDate(row.created_at)
    if (!created) continue

    totals.total += 1
    if (toFinite(row.attempt_count, 0) > 1) retryCount += 1

    const byDomain = domainMap.get(domainBucket) ?? { total: 0, acceptedLike: 0, failed: 0 }
    byDomain.total += 1

    const day = row.created_at.slice(0, 10)
    const byDay = dailyMap.get(day) ?? { total: 0, acceptedLike: 0, delivered: 0, replied: 0, negative: 0, failed: 0 }
    byDay.total += 1

    if (state === 'accepted' || state === 'delivered' || state === 'replied') {
      totals.acceptedLike += 1
      byDomain.acceptedLike += 1
      byDay.acceptedLike += 1
    }

    if (state === 'delivered') {
      totals.delivered += 1
      byDay.delivered += 1
    }

    if (state === 'replied') {
      totals.replied += 1
      byDay.replied += 1
    }

    if (state === 'failed') {
      totals.failed += 1
      byDomain.failed += 1
      byDay.failed += 1
      byDay.negative += 1
    }

    if (state === 'bounced') {
      totals.bounced += 1
      byDay.negative += 1
    }

    if (state === 'complained') {
      totals.complained += 1
      byDay.negative += 1
    }

    if (state === 'queued') totals.queued += 1
    if (state === 'sending') totals.sending += 1
    if (state === 'accepted') totals.accepted += 1

    if (state === 'queued') {
      const nextAttempt = asDate(row.next_attempt_at)
      const minutesPastDue = nextAttempt ? (nowMs - nextAttempt.getTime()) / 60000 : (nowMs - created.getTime()) / 60000
      if (minutesPastDue > thresholds.maxQueueStaleMinutes) queuedStaleCount += 1
    }

    if (state === 'sending') {
      const lock = asDate(row.locked_at)
      const sendingMinutes = lock ? (nowMs - lock.getTime()) / 60000 : (nowMs - created.getTime()) / 60000
      if (sendingMinutes > thresholds.maxSendingLockMinutes) sendingStaleCount += 1
    }

    if (state === 'accepted') {
      const acceptedAt = asDate(row.accepted_at)
      const acceptedMinutes = acceptedAt ? (nowMs - acceptedAt.getTime()) / 60000 : (nowMs - created.getTime()) / 60000
      if (acceptedMinutes > thresholds.maxWebhookLagMinutes) acceptedLagCount += 1
    }

    domainMap.set(domainBucket, byDomain)
    dailyMap.set(day, byDay)
  }

  totals.acceptedRatePct = pct(totals.acceptedLike, totals.total)
  totals.negativeOutcomeRatePct = pct(totals.failed + totals.bounced + totals.complained, totals.total)
  totals.hardFailureRatePct = pct(totals.failed, totals.total)
  totals.retryRatePct = pct(retryCount, totals.total)

  const domainBreakdown = Array.from(domainMap.entries())
    .map(([domainBucket, value]) => ({
      domainBucket,
      total: value.total,
      acceptedLike: value.acceptedLike,
      failed: value.failed,
      acceptedRatePct: pct(value.acceptedLike, value.total),
      hardFailureRatePct: pct(value.failed, value.total),
    }))
    .sort((a, b) => b.total - a.total)

  const daily = Array.from(dailyMap.entries())
    .map(([date, value]) => ({
      date,
      total: value.total,
      acceptedLike: value.acceptedLike,
      delivered: value.delivered,
      replied: value.replied,
      negativeOutcomes: value.negative,
      failed: value.failed,
      acceptedRatePct: pct(value.acceptedLike, value.total),
      negativeOutcomeRatePct: pct(value.negative, value.total),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const alerts: ReliabilityAlert[] = []

  if (totals.total === 0) {
    alerts.push({
      level: 'warning',
      code: 'no_volume',
      title: 'No queue activity in the selected window',
      detail: `No outreach send jobs in the last ${input.windowDays} days, so confidence is based on limited evidence.`,
    })
  }

  if (totals.acceptedRatePct < thresholds.minAcceptedRatePct && totals.total > 0) {
    alerts.push({
      level: 'critical',
      code: 'accepted_rate_below_floor',
      title: 'Accepted rate below floor',
      detail: `Accepted-like rate is ${totals.acceptedRatePct}%, below threshold ${thresholds.minAcceptedRatePct}%.`,
    })
  }

  if (totals.negativeOutcomeRatePct > thresholds.maxNegativeOutcomeRatePct && totals.total > 0) {
    alerts.push({
      level: 'critical',
      code: 'negative_outcomes_high',
      title: 'Negative outcomes above threshold',
      detail: `Bounced + complained + failed rate is ${totals.negativeOutcomeRatePct}%, above ${thresholds.maxNegativeOutcomeRatePct}%.`,
    })
  }

  if (totals.hardFailureRatePct > thresholds.maxHardFailureRatePct && totals.total > 0) {
    alerts.push({
      level: 'warning',
      code: 'hard_failures_high',
      title: 'Hard provider failures elevated',
      detail: `Hard failure rate is ${totals.hardFailureRatePct}%, above ${thresholds.maxHardFailureRatePct}%.`,
    })
  }

  if (totals.retryRatePct > thresholds.maxRetryRatePct && totals.total > 0) {
    alerts.push({
      level: 'warning',
      code: 'retry_pressure_high',
      title: 'Retry pressure elevated',
      detail: `Retry rate is ${totals.retryRatePct}%, above ${thresholds.maxRetryRatePct}%.`,
    })
  }

  if (queuedStaleCount > 0) {
    alerts.push({
      level: 'critical',
      code: 'queued_stale_jobs',
      title: 'Queued jobs are stale',
      detail: `${queuedStaleCount} queued jobs are older than ${thresholds.maxQueueStaleMinutes} minutes past due.`,
    })
  }

  if (sendingStaleCount > 0) {
    alerts.push({
      level: 'critical',
      code: 'sending_stale_jobs',
      title: 'Sending locks are stale',
      detail: `${sendingStaleCount} sending jobs are older than ${thresholds.maxSendingLockMinutes} minutes.`,
    })
  }

  if (acceptedLagCount > 0) {
    alerts.push({
      level: 'warning',
      code: 'webhook_lag',
      title: 'Webhook state advancement is lagging',
      detail: `${acceptedLagCount} accepted jobs have no final webhook state after ${thresholds.maxWebhookLagMinutes} minutes.`,
    })
  }

  let score = 100
  score -= Math.max(0, thresholds.minAcceptedRatePct - totals.acceptedRatePct) * 1.5
  score -= Math.max(0, totals.negativeOutcomeRatePct - thresholds.maxNegativeOutcomeRatePct) * 2.5
  score -= Math.max(0, totals.hardFailureRatePct - thresholds.maxHardFailureRatePct) * 3
  score -= Math.min(20, queuedStaleCount * 2)
  score -= Math.min(20, sendingStaleCount * 3)
  score -= Math.min(15, acceptedLagCount * 1.5)
  score -= Math.max(0, totals.retryRatePct - thresholds.maxRetryRatePct) * 1.2

  const rounded = Math.round(clamp(score, 0, 100))
  const band = rounded >= 90 ? 'high' : rounded >= 75 ? 'medium' : 'low'
  const rationale =
    band === 'high'
      ? 'Queue health and delivery outcomes are within thresholds.'
      : band === 'medium'
        ? 'Core pipeline is functional, but one or more thresholds need tightening.'
        : 'Multiple reliability thresholds are breached; sending risk is elevated.'

  return {
    generatedAt: now.toISOString(),
    windowDays: input.windowDays,
    thresholds,
    totals,
    queueHealth: {
      queuedStaleCount,
      sendingStaleCount,
      acceptedLagCount,
    },
    domainBreakdown,
    daily,
    alerts,
    confidence: {
      score: rounded,
      band,
      rationale,
    },
  }
}

export async function loadReliabilitySnapshotFromDb(admin: any, input?: {
  windowDays?: number
  now?: Date
  thresholds?: Partial<ReliabilityThresholds>
}): Promise<ReliabilitySnapshot> {
  const windowDays = clamp(Math.floor(toFinite(input?.windowDays, 14)), 1, 60)
  const now = input?.now ?? new Date()
  const sinceIso = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000).toISOString()

  const { data: jobsRaw } = await admin
    .from('outreach_send_jobs')
    .select('created_at, state, domain_bucket, attempt_count, accepted_at, locked_at, next_attempt_at')
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: true })
    .limit(20000)

  const jobs = (jobsRaw ?? []) as OutreachSendJobMetricRow[]

  return buildReliabilitySnapshot({
    jobs,
    now,
    windowDays,
    thresholds: input?.thresholds,
  })
}
