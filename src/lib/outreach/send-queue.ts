import { randomUUID } from 'crypto'
import { APP_URL } from '@/lib/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { logQueueWorkerRun } from '@/lib/telemetry'
import { normalizeEmail } from '@/lib/outreach/send-queue.utils'
import {
  processClaimedOutreachSendJob,
} from '@/lib/outreach/send-queue.worker'

type DbError = { message: string }
type DbResponse<T = unknown> = Promise<{ data: T | null; error: DbError | null }>
type DbQuery<T = unknown> = DbResponse<T> & {
  select: (columns: string) => DbQuery<T>
  insert: (values: unknown) => DbQuery<T>
  update: (values: unknown) => DbQuery<T>
  upsert: (values: unknown, options?: unknown) => DbQuery<T>
  delete: () => DbQuery<T>
  eq: (column: string, value: unknown) => DbQuery<T>
  neq: (column: string, value: unknown) => DbQuery<T>
  not: (column: string, operator: string, value: unknown) => DbQuery<T>
  contains: (column: string, value: unknown) => DbQuery<T>
  ilike: (column: string, value: string) => DbQuery<T>
  lte: (column: string, value: string) => DbQuery<T>
  gte: (column: string, value: string) => DbQuery<T>
  order: (column: string, options?: unknown) => DbQuery<T>
  limit: (count: number) => DbQuery<T>
  in: (column: string, values: unknown[]) => DbQuery<T>
  maybeSingle: () => DbResponse<T>
  single: () => DbResponse<T>
}
type QueueAdminClient = {
  from: (table: string) => DbQuery<unknown>
}

export const OUTREACH_REPLY_TO = 'richard@startingmonday.app'
export const DEFAULT_OUTREACH_FROM = `Richard Rothschild <${OUTREACH_REPLY_TO}>`
export const CONTACT_CHANNEL = 'cold'

const MAX_ATTEMPTS = 5
const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com'])
const MICROSOFT_DOMAINS = new Set(['outlook.com', 'hotmail.com', 'live.com', 'msn.com'])
const DOMAIN_BUCKET_LIMITS: Record<OutreachDomainBucket, number> = {
  gmail: 1,
  microsoft: 1,
  corporate: 5,
}

export type OutreachSendMode = 'live' | 'test_to_self'
export type OutreachDomainBucket = 'gmail' | 'microsoft' | 'corporate'
export type OutreachSendJobState = 'queued' | 'sending' | 'accepted' | 'delivered' | 'bounced' | 'complained' | 'replied' | 'failed'
export type OutreachSendBatchStatus = 'queued' | 'processing' | 'completed' | 'completed_with_failures'

export type OutreachSendJobPayload = {
  userId: string
  fullName: string
  company: string
  roleBucket: string
  emailTo: string
  providerRecipient: string
  subject: string
  finalSubject: string
  messageText: string
  finalMessageText: string
  finalHtml: string
  statusAfter: string
  mode: OutreachSendMode
  outreachChannel: 'executives' | 'search_firms' | 'coaches' | 'outplacement_firms'
  fitTier: string | null
  personaFocus: string | null
  campaignStep: string | null
  templateStep: string | null
  templateSource: 'latest_template_engine' | 'custom_input'
  idempotencyKey: string | null
  fromAddress: string
  replyTo: string
  bcc: string | null
  headers: Record<string, string>
  senderUserEmail: string | null
}

type StructuredSendError = {
  code: string
  message: string
  transient: boolean
  raw: string | null
}

type BatchSummary = {
  totalJobs: number
  queuedJobs: number
  sendingJobs: number
  acceptedJobs: number
  deliveredJobs: number
  bouncedJobs: number
  complainedJobs: number
  repliedJobs: number
  failedJobs: number
  completedJobs: number
  failedRecipients: Array<{ jobId: string; recipientEmail: string; code: string; message: string }>
}

type BatchJobSummaryRow = {
  id: string
  recipient_email: string
  state: OutreachSendJobState | null
  last_error: Record<string, unknown> | null
}

type ClaimedOutreachSendJob = {
  id: string
  batch_id: string
  recipient_email: string
  domain_bucket: OutreachDomainBucket | null
  attempt_count: number | null
  payload: OutreachSendJobPayload
  contact_id: string | null
}

export function classifyOutreachDomainBucket(email: string): OutreachDomainBucket {
  const domain = normalizeEmail(email).split('@')[1] ?? ''
  if (GMAIL_DOMAINS.has(domain)) return 'gmail'
  if (MICROSOFT_DOMAINS.has(domain)) return 'microsoft'
  return 'corporate'
}

function computeRetryDelayMs(attemptCount: number, bucket: OutreachDomainBucket): number {
  const base = bucket === 'gmail' || bucket === 'microsoft' ? 10 * 60 * 1000 : 4 * 60 * 1000
  const exponent = Math.max(0, attemptCount - 1)
  const jitter = Math.floor(Math.random() * 30_000)
  return Math.min(base * Math.pow(2, exponent) + jitter, 6 * 60 * 60 * 1000)
}

function normalizeSendError(errorMessage: string | null | undefined): StructuredSendError {
  const message = (errorMessage ?? 'Email send failed.').trim()
  const lowered = message.toLowerCase()

  if (lowered.startsWith('blocked by email council gate:')) {
    return { code: 'council_block', message, transient: false, raw: message }
  }
  if (lowered.includes('api key')) {
    return { code: 'provider_config', message, transient: false, raw: message }
  }
  if (lowered.includes('<!doctype html') || lowered.includes('<html')) {
    return { code: 'provider_html_error', message: 'Provider or platform returned an HTML error page.', transient: true, raw: message }
  }
  if (lowered.includes('bad gateway') || lowered.includes('internal server error') || lowered.includes('request failed (502)') || lowered.includes('request failed (503)') || lowered.includes('request failed (504)') || lowered.includes('timeout')) {
    return { code: 'provider_transient', message, transient: true, raw: message }
  }
  return { code: 'provider_rejected', message, transient: false, raw: message }
}

function buildBatchStatus(summary: BatchSummary): OutreachSendBatchStatus {
  if (summary.queuedJobs > 0 || summary.sendingJobs > 0) {
    return summary.acceptedJobs + summary.deliveredJobs + summary.failedJobs > 0 ? 'processing' : 'queued'
  }
  if (summary.failedJobs > 0) return 'completed_with_failures'
  return 'completed'
}

export async function ensureOutreachSendBatch(admin: QueueAdminClient, input: {
  batchId?: string | null
  userId: string
  mode: OutreachSendMode
  campaignStep?: string | null
  templateStep?: string | null
}) {
  const batchId = input.batchId?.trim() || randomUUID()
  await admin
    .from('outreach_send_batches')
    .upsert({
      id: batchId,
      user_id: input.userId,
      mode: input.mode,
      campaign_step: input.campaignStep ?? null,
      template_step: input.templateStep ?? null,
    }, { onConflict: 'id' })

  return batchId
}

export async function summarizeOutreachSendBatch(admin: QueueAdminClient, batchId: string): Promise<{ batchId: string; status: OutreachSendBatchStatus; summary: BatchSummary }> {
  const { data: jobs } = await admin
    .from('outreach_send_jobs')
    .select('id, recipient_email, state, last_error')
    .eq('batch_id', batchId)
    .order('created_at', { ascending: true })

  const summaryRows = (jobs ?? []) as BatchJobSummaryRow[]

  const summary: BatchSummary = {
    totalJobs: 0,
    queuedJobs: 0,
    sendingJobs: 0,
    acceptedJobs: 0,
    deliveredJobs: 0,
    bouncedJobs: 0,
    complainedJobs: 0,
    repliedJobs: 0,
    failedJobs: 0,
    completedJobs: 0,
    failedRecipients: [],
  }

  for (const job of summaryRows) {
    summary.totalJobs += 1
    const state = (job.state ?? 'queued') as OutreachSendJobState
    if (state === 'queued') summary.queuedJobs += 1
    if (state === 'sending') summary.sendingJobs += 1
    if (state === 'accepted') summary.acceptedJobs += 1
    if (state === 'delivered') summary.deliveredJobs += 1
    if (state === 'bounced') summary.bouncedJobs += 1
    if (state === 'complained') summary.complainedJobs += 1
    if (state === 'replied') summary.repliedJobs += 1
    if (state === 'failed') {
      summary.failedJobs += 1
      const lastError = typeof job.last_error === 'object' && job.last_error !== null ? job.last_error : {}
      summary.failedRecipients.push({
        jobId: job.id,
        recipientEmail: job.recipient_email,
        code: String((lastError as Record<string, unknown>).code ?? 'send_failed'),
        message: String((lastError as Record<string, unknown>).message ?? 'Email send failed.'),
      })
    }
  }

  summary.completedJobs = summary.deliveredJobs + summary.bouncedJobs + summary.complainedJobs + summary.repliedJobs + summary.failedJobs
  const status = buildBatchStatus(summary)

  await admin
    .from('outreach_send_batches')
    .update({
      requested_count: summary.totalJobs,
      status,
      summary,
    })
    .eq('id', batchId)

  return { batchId, status, summary }
}

export async function findDuplicateOutreachSend(admin: QueueAdminClient, input: { userId: string; recipientEmail: string; idempotencyKey: string }) {
  const { data: queuedJob } = await admin
    .from('outreach_send_jobs')
    .select('id, state, provider_message_id')
    .eq('user_id', input.userId)
    .eq('recipient_email', input.recipientEmail)
    .eq('idempotency_key', input.idempotencyKey)
    .neq('state', 'failed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const queuedJobRow = (queuedJob ?? null) as { id?: string; state?: string | null } | null

  if (queuedJobRow?.id) {
    return {
      duplicate: true,
      deliveryStatus: queuedJobRow.state,
      jobId: queuedJobRow.id,
    }
  }

  const { data: duplicateLog } = await admin
    .from('outreach_logs')
    .select('id, delivery_status')
    .eq('user_id', input.userId)
    .eq('recipient_email', input.recipientEmail)
    .contains('webhook_payload', { idempotency_key: input.idempotencyKey })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const duplicateLogRow = (duplicateLog ?? null) as { id?: string; delivery_status?: string | null } | null

  if (duplicateLogRow?.id) {
    return {
      duplicate: true,
      deliveryStatus: duplicateLogRow.delivery_status ?? null,
      jobId: null,
    }
  }

  return {
    duplicate: false,
    deliveryStatus: null,
    jobId: null,
  }
}

export async function hasPriorLiveOutreach(admin: QueueAdminClient, input: { userId: string; recipientEmail: string; outreachChannel: 'executives' | 'search_firms' | 'coaches' | 'outplacement_firms' }) {
  const { data: priorLog } = await admin
    .from('outreach_logs')
    .select('id, delivery_status, sent_at')
    .eq('user_id', input.userId)
    .eq('recipient_email', input.recipientEmail)
    .eq('outreach_channel', input.outreachChannel)
    .eq('send_mode', 'live')
    .neq('delivery_status', 'send_failed')
    .not('sent_at', 'is', null)
    .order('sent_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const priorLogRow = (priorLog ?? null) as { id?: string; delivery_status?: string | null } | null

  if (priorLogRow?.id) {
    return {
      hasPriorLiveOutreach: true,
      deliveryStatus: priorLogRow.delivery_status ?? null,
    }
  }

  return {
    hasPriorLiveOutreach: false,
    deliveryStatus: null,
  }
}

export async function enqueueOutreachSendJob(admin: QueueAdminClient, input: {
  batchId: string
  userId: string
  contactId: string | null
  recipientEmail: string
  idempotencyKey: string | null
  payload: OutreachSendJobPayload
}) {
  const domainBucket = classifyOutreachDomainBucket(input.recipientEmail)
  const { data: inserted, error } = await admin
    .from('outreach_send_jobs')
    .insert({
      batch_id: input.batchId,
      user_id: input.userId,
      contact_id: input.contactId,
      recipient_email: input.recipientEmail,
      domain_bucket: domainBucket,
      idempotency_key: input.idempotencyKey,
      payload: input.payload,
      state: 'queued',
      next_attempt_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(error.message)
  }
  const insertedRow = (inserted ?? null) as { id?: string } | null

  await summarizeOutreachSendBatch(admin, input.batchId)

  return {
    jobId: String(insertedRow?.id ?? ''),
    batchId: input.batchId,
    domainBucket,
  }
}

export async function kickOutreachSendWorker(): Promise<void> {
  const secret = process.env.CRON_SECRET
  if (!secret) return
  const url = `${APP_URL}/api/cron/outreach-send-worker?secret=${encodeURIComponent(secret)}&limit=5`
  void fetch(url, { method: 'GET', cache: 'no-store' }).catch(() => undefined)
}

export async function processOutreachSendJobs(input?: { limit?: number; workerId?: string }) {
  const startedAtMs = Date.now()
  const admin = createAdminClient() as unknown as QueueAdminClient
  const limit = Math.max(1, Math.min(Number(input?.limit ?? 10), 50))
  const workerId = input?.workerId ?? randomUUID()
  const nowIso = new Date().toISOString()

  const { data: candidates, error } = await admin
    .from('outreach_send_jobs')
    .select('id, batch_id, recipient_email, domain_bucket, attempt_count, payload, contact_id')
    .eq('state', 'queued')
    .lte('next_attempt_at', nowIso)
    .order('next_attempt_at', { ascending: true })
    .limit(limit * 4)

  if (error) {
    logQueueWorkerRun({
      queue: 'outreach_send_jobs',
      workerId,
      event: 'queue_worker_run_error',
      startedAtMs,
      processed: 0,
      accepted: 0,
      failed: 0,
      retried: 0,
      metadata: {
        limit,
      },
      error: error.message,
    })

    return { ok: false, error: error.message, processed: 0, workerId }
  }

  const bucketCounts: Record<OutreachDomainBucket, number> = { gmail: 0, microsoft: 0, corporate: 0 }
  let processed = 0
  let accepted = 0
  let failed = 0
  let retried = 0

  const queuedCandidates = (candidates ?? []) as ClaimedOutreachSendJob[]

  for (const candidate of queuedCandidates) {
    if (processed >= limit) break
    const bucket = (candidate.domain_bucket as OutreachDomainBucket | null) ?? classifyOutreachDomainBucket(candidate.recipient_email)
    if (bucketCounts[bucket] >= DOMAIN_BUCKET_LIMITS[bucket]) continue

    const { data: claimed } = await admin
      .from('outreach_send_jobs')
      .update({
        state: 'sending',
        locked_at: nowIso,
        locked_by: workerId,
        last_attempt_at: nowIso,
        attempt_count: Number(candidate.attempt_count ?? 0) + 1,
      })
      .eq('id', candidate.id)
      .eq('state', 'queued')
      .select('id, batch_id, recipient_email, domain_bucket, attempt_count, payload, contact_id')
      .maybeSingle()
    const claimedJob = (claimed ?? null) as ClaimedOutreachSendJob | null

    if (!claimedJob?.id) continue

    bucketCounts[bucket] += 1
    processed += 1
    const result = await processClaimedOutreachSendJob(admin as unknown as Parameters<typeof processClaimedOutreachSendJob>[0], claimedJob, {
      outreachReplyTo: OUTREACH_REPLY_TO,
      contactChannel: CONTACT_CHANNEL,
      maxAttempts: MAX_ATTEMPTS,
      normalizeSendError,
      computeRetryDelayMs,
      summarizeBatch: async (adminClient, batchId) => summarizeOutreachSendBatch(adminClient as unknown as QueueAdminClient, batchId),
    })
    if (result.ok) accepted += 1
    else if (result.retried) retried += 1
    else failed += 1
  }

  logQueueWorkerRun({
    queue: 'outreach_send_jobs',
    workerId,
    event: 'queue_worker_run',
    startedAtMs,
    processed,
    accepted,
    failed,
    retried,
    metadata: {
      limit,
      bucket_counts: bucketCounts,
    },
  })

  return { ok: true, workerId, processed, accepted, failed, retried, bucketCounts }
}

export function mapWebhookEventToJobState(eventType: string): OutreachSendJobState | null {
  if (eventType === 'email.delivered') return 'delivered'
  if (eventType === 'email.bounced') return 'bounced'
  if (eventType === 'email.complained') return 'complained'
  if (eventType === 'email.replied' || eventType === 'reply.received') return 'replied'
  return null
}

export async function updateOutreachJobStateFromWebhook(admin: QueueAdminClient, providerMessageId: string, eventType: string) {
  const nextState = mapWebhookEventToJobState(eventType)
  if (!nextState) return null

  const { data: jobs } = await admin
    .from('outreach_send_jobs')
    .update({
      state: nextState,
      completed_at: new Date().toISOString(),
      locked_at: null,
      locked_by: null,
    })
    .eq('provider_message_id', providerMessageId)
    .select('id, batch_id')
  const jobRows = (jobs ?? []) as Array<{ id: string; batch_id: string | null }>

  for (const job of jobRows) {
    if (job.batch_id) {
      await summarizeOutreachSendBatch(admin, job.batch_id)
    }
  }

  return jobRows
}