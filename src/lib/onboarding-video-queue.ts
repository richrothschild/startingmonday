/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

const DEFAULT_MAX_RETRIES = 3
const MAX_RETRIES_LIMIT = 10

export type OnboardingVideoRunStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'canceled'
export type OnboardingVideoTriggerSource = 'manual' | 'event' | 'cron' | 'retry'

export type OnboardingVideoProviderEvent =
  | 'video.completed'
  | 'video.failed'
  | 'video.canceled'
  | 'video.processing'

type QueueRunRecord = {
  id: string
  user_id: string
  workflow_id: string | null
  provider: string
  trigger_source: OnboardingVideoTriggerSource
  status: OnboardingVideoRunStatus
  retry_count: number
  max_retries: number
  input_payload: Record<string, unknown>
  output_payload: Record<string, unknown>
  error_payload: Record<string, unknown>
  next_retry_at: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

function clampLimit(limit: number | undefined, fallback: number, max: number): number {
  const value = Number(limit ?? fallback)
  if (!Number.isFinite(value)) return fallback
  return Math.max(1, Math.min(Math.floor(value), max))
}

function normalizeMaxRetries(maxRetries: number | undefined): number {
  const value = Number(maxRetries ?? DEFAULT_MAX_RETRIES)
  if (!Number.isFinite(value)) return DEFAULT_MAX_RETRIES
  return Math.max(0, Math.min(Math.floor(value), MAX_RETRIES_LIMIT))
}

function computeRetryDelayMs(retryCount: number): number {
  const base = 2 * 60 * 1000
  const exponent = Math.max(0, retryCount)
  const jitter = Math.floor(Math.random() * 15_000)
  return Math.min(base * Math.pow(2, exponent) + jitter, 2 * 60 * 60 * 1000)
}

function shouldForceFailure(inputPayload: Record<string, unknown>): boolean {
  return inputPayload.force_fail === true
}

async function appendRunEvent(admin: any, input: {
  runId: string
  userId: string
  eventType: string
  eventPayload?: Record<string, unknown>
}) {
  await admin
    .from('onboarding_video_run_events')
    .insert({
      run_id: input.runId,
      user_id: input.userId,
      event_type: input.eventType,
      event_payload: input.eventPayload ?? {},
    })
}

export function mapOnboardingVideoProviderEventToStatus(eventType: string): OnboardingVideoRunStatus | null {
  if (eventType === 'video.completed') return 'completed'
  if (eventType === 'video.failed') return 'failed'
  if (eventType === 'video.canceled') return 'canceled'
  if (eventType === 'video.processing') return 'processing'
  return null
}

function summarizeRuns(runs: QueueRunRecord[]) {
  const summary = {
    total: 0,
    queued: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    canceled: 0,
    retrying: 0,
  }

  for (const run of runs) {
    summary.total += 1
    if (run.status === 'queued') summary.queued += 1
    if (run.status === 'processing') summary.processing += 1
    if (run.status === 'completed') summary.completed += 1
    if (run.status === 'failed') summary.failed += 1
    if (run.status === 'canceled') summary.canceled += 1
    if (run.status === 'queued' && run.retry_count > 0) summary.retrying += 1
  }

  return summary
}

export async function enqueueOnboardingVideoRun(admin: any, input: {
  userId: string
  workflowId?: string | null
  triggerSource?: OnboardingVideoTriggerSource
  provider?: string
  maxRetries?: number
  inputPayload?: Record<string, unknown>
}) {
  const nowIso = new Date().toISOString()
  const payload = input.inputPayload ?? {}
  const maxRetries = normalizeMaxRetries(input.maxRetries)

  const { data, error } = await admin
    .from('onboarding_video_runs')
    .insert({
      user_id: input.userId,
      workflow_id: input.workflowId ?? null,
      trigger_source: input.triggerSource ?? 'manual',
      provider: input.provider ?? 'heygen',
      status: 'queued',
      retry_count: 0,
      max_retries: maxRetries,
      next_retry_at: nowIso,
      input_payload: payload,
      output_payload: {},
      error_payload: {},
    })
    .select('id, user_id, workflow_id, provider, trigger_source, status, retry_count, max_retries, input_payload, output_payload, error_payload, next_retry_at, started_at, completed_at, created_at')
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to enqueue onboarding video run')
  }

  await appendRunEvent(admin, {
    runId: data.id,
    userId: data.user_id,
    eventType: 'queued',
    eventPayload: {
      trigger_source: data.trigger_source,
      provider: data.provider,
    },
  })

  return data as QueueRunRecord
}

export async function fetchOnboardingVideoRunSnapshot(admin: any, input: {
  userId: string
  workflowId?: string | null
  status?: OnboardingVideoRunStatus
  limit?: number
}) {
  const limit = clampLimit(input.limit, 50, 200)

  let query = admin
    .from('onboarding_video_runs')
    .select('id, user_id, workflow_id, provider, trigger_source, status, retry_count, max_retries, input_payload, output_payload, error_payload, next_retry_at, started_at, completed_at, created_at')
    .eq('user_id', input.userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (input.workflowId) query = query.eq('workflow_id', input.workflowId)
  if (input.status) query = query.eq('status', input.status)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const runs = (data ?? []) as QueueRunRecord[]
  return {
    runs,
    summary: summarizeRuns(runs),
  }
}

async function processClaimedRun(admin: any, run: QueueRunRecord, workerId: string) {
  const nowIso = new Date().toISOString()
  await appendRunEvent(admin, {
    runId: run.id,
    userId: run.user_id,
    eventType: 'processing_started',
    eventPayload: {
      worker_id: workerId,
      retry_count: run.retry_count,
    },
  })

  try {
    if (shouldForceFailure(run.input_payload ?? {})) {
      throw new Error('Forced failure requested by run payload')
    }

    const outputPayload = {
      provider: run.provider,
      worker_id: workerId,
      provider_run_id: `ovr_${randomUUID()}`,
      video_url: `https://assets.startingmonday.app/onboarding-video/${run.id}.mp4`,
      completed_at: nowIso,
    }

    await admin
      .from('onboarding_video_runs')
      .update({
        status: 'completed',
        provider_run_id: outputPayload.provider_run_id,
        completed_at: nowIso,
        next_retry_at: null,
        output_payload: outputPayload,
        error_payload: {},
      })
      .eq('id', run.id)

    await appendRunEvent(admin, {
      runId: run.id,
      userId: run.user_id,
      eventType: 'completed',
      eventPayload: outputPayload,
    })

    return { ok: true as const }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown onboarding video failure'
    const canRetry = run.retry_count < run.max_retries
    const retryAt = canRetry
      ? new Date(Date.now() + computeRetryDelayMs(run.retry_count)).toISOString()
      : null

    await admin
      .from('onboarding_video_runs')
      .update({
        status: canRetry ? 'queued' : 'failed',
        next_retry_at: retryAt,
        completed_at: canRetry ? null : new Date().toISOString(),
        error_payload: {
          code: canRetry ? 'provider_transient' : 'provider_terminal',
          message,
          worker_id: workerId,
          occurred_at: nowIso,
        },
      })
      .eq('id', run.id)

    await appendRunEvent(admin, {
      runId: run.id,
      userId: run.user_id,
      eventType: canRetry ? 'retry_scheduled' : 'failed',
      eventPayload: {
        worker_id: workerId,
        retry_count: run.retry_count,
        max_retries: run.max_retries,
        next_retry_at: retryAt,
        message,
      },
    })

    return { ok: false as const, retried: canRetry }
  }
}

export async function processOnboardingVideoRuns(input?: { limit?: number; workerId?: string }) {
  const admin = createAdminClient() as any
  const limit = clampLimit(input?.limit, 10, 25)
  const workerId = input?.workerId ?? `onboarding-video-worker-${randomUUID()}`
  const nowIso = new Date().toISOString()

  const { data: candidates, error } = await admin
    .from('onboarding_video_runs')
    .select('id, user_id, workflow_id, provider, trigger_source, status, retry_count, max_retries, input_payload, output_payload, error_payload, next_retry_at, started_at, completed_at, created_at')
    .eq('status', 'queued')
    .lte('next_retry_at', nowIso)
    .order('next_retry_at', { ascending: true })
    .limit(limit * 4)

  if (error) {
    return {
      ok: false as const,
      workerId,
      processed: 0,
      completed: 0,
      failed: 0,
      retried: 0,
      byUser: [] as Array<{ userId: string; processed: number; completed: number; failed: number; retried: number }>,
      error: error.message,
    }
  }

  let processed = 0
  let completed = 0
  let failed = 0
  let retried = 0
  const byUser = new Map<string, { processed: number; completed: number; failed: number; retried: number }>()

  for (const candidate of (candidates ?? []) as QueueRunRecord[]) {
    if (processed >= limit) break

    const { data: claimed } = await admin
      .from('onboarding_video_runs')
      .update({
        status: 'processing',
        started_at: nowIso,
      })
      .eq('id', candidate.id)
      .eq('status', 'queued')
      .select('id, user_id, workflow_id, provider, trigger_source, status, retry_count, max_retries, input_payload, output_payload, error_payload, next_retry_at, started_at, completed_at, created_at')
      .maybeSingle()

    if (!claimed?.id) continue

    processed += 1
    const userId = String(claimed.user_id)
    const summary = byUser.get(userId) ?? { processed: 0, completed: 0, failed: 0, retried: 0 }
    summary.processed += 1
    const result = await processClaimedRun(admin, claimed as QueueRunRecord, workerId)
    if (result.ok) {
      completed += 1
      summary.completed += 1
    } else if (result.retried) {
      retried += 1
      summary.retried += 1
    } else {
      failed += 1
      summary.failed += 1
    }
    byUser.set(userId, summary)
  }

  return {
    ok: true as const,
    workerId,
    processed,
    completed,
    failed,
    retried,
    byUser: Array.from(byUser.entries()).map(([userId, summary]) => ({
      userId,
      processed: summary.processed,
      completed: summary.completed,
      failed: summary.failed,
      retried: summary.retried,
    })),
  }
}

export async function updateOnboardingVideoRunFromWebhook(admin: any, input: {
  providerRunId: string
  eventType: OnboardingVideoProviderEvent | string
  eventPayload?: Record<string, unknown>
}) {
  const nextStatus = mapOnboardingVideoProviderEventToStatus(input.eventType)
  if (!nextStatus) return []

  const nowIso = new Date().toISOString()
  const updatePayload: Record<string, unknown> = {
    status: nextStatus,
    output_payload: {
      provider_event_type: input.eventType,
      ...(input.eventPayload ?? {}),
    },
  }

  if (nextStatus === 'completed' || nextStatus === 'failed' || nextStatus === 'canceled') {
    updatePayload.completed_at = nowIso
    updatePayload.next_retry_at = null
  }

  if (nextStatus === 'failed') {
    updatePayload.error_payload = {
      code: 'provider_callback_failure',
      message: String((input.eventPayload ?? {}).message ?? 'Provider reported failure'),
      occurred_at: nowIso,
    }
  }

  const { data: runs } = await admin
    .from('onboarding_video_runs')
    .update(updatePayload)
    .eq('provider_run_id', input.providerRunId)
    .select('id, user_id')

  for (const run of runs ?? []) {
    await appendRunEvent(admin, {
      runId: String(run.id),
      userId: String(run.user_id),
      eventType: `provider_${input.eventType}`,
      eventPayload: {
        provider_run_id: input.providerRunId,
        ...(input.eventPayload ?? {}),
      },
    })
  }

  return runs ?? []
}
