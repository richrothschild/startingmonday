/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from 'crypto'
import { APP_URL } from '@/lib/config'
import { sendEmail } from '@/lib/email'
import { createAdminClient } from '@/lib/supabase/admin'

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

function normalizeEmail(value: unknown): string {
  return (value ?? '').toString().trim().toLowerCase()
}

function pacificTodayISO(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })
}

function addBusinessDays(isoDate: string, businessDays: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  let remaining = businessDays
  while (remaining > 0) {
    d.setUTCDate(d.getUTCDate() + 1)
    const day = d.getUTCDay()
    if (day !== 0 && day !== 6) remaining -= 1
  }
  return d.toISOString().slice(0, 10)
}

function buildGoogleCalendarUrl(input: { title: string; details: string; dateISO: string }): string {
  const start = `${input.dateISO.replace(/-/g, '')}T170000Z`
  const endDate = new Date(`${input.dateISO}T00:00:00Z`)
  endDate.setUTCDate(endDate.getUTCDate() + 1)
  const end = `${endDate.toISOString().slice(0, 10).replace(/-/g, '')}T000000Z`
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
  const q = new URLSearchParams({
    text: input.title,
    dates: `${start}/${end}`,
    details: input.details,
  })
  return `${base}&${q.toString()}`
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

export async function ensureOutreachSendBatch(admin: any, input: {
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

export async function summarizeOutreachSendBatch(admin: any, batchId: string): Promise<{ batchId: string; status: OutreachSendBatchStatus; summary: BatchSummary }> {
  const { data: jobs } = await admin
    .from('outreach_send_jobs')
    .select('id, recipient_email, state, last_error')
    .eq('batch_id', batchId)
    .order('created_at', { ascending: true })

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

  for (const job of jobs ?? []) {
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

export async function findDuplicateOutreachSend(admin: any, input: { userId: string; recipientEmail: string; idempotencyKey: string }) {
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

  if (queuedJob?.id) {
    return {
      duplicate: true,
      deliveryStatus: queuedJob.state,
      jobId: queuedJob.id as string,
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

  if (duplicateLog?.id) {
    return {
      duplicate: true,
      deliveryStatus: duplicateLog.delivery_status ?? null,
      jobId: null,
    }
  }

  return {
    duplicate: false,
    deliveryStatus: null,
    jobId: null,
  }
}

export async function enqueueOutreachSendJob(admin: any, input: {
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

  await summarizeOutreachSendBatch(admin, input.batchId)

  return {
    jobId: inserted?.id as string,
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

async function insertFailedOutreachLog(admin: any, job: any, payload: OutreachSendJobPayload, error: StructuredSendError) {
  await admin.from('outreach_logs').insert({
    user_id: payload.userId,
    contact_id: payload.mode === 'live' ? (job.contact_id ?? null) : null,
    channel: payload.mode === 'live' ? 'email' : 'other',
    message_preview: `${payload.mode === 'test_to_self' ? '[TEST] ' : ''}${payload.messageText.slice(0, 200)}`,
    recipient_email: payload.emailTo,
    recipient_name: payload.fullName,
    sender_email: OUTREACH_REPLY_TO,
    subject: payload.finalSubject,
    message_body: payload.finalMessageText,
    send_mode: payload.mode,
    outreach_channel: payload.outreachChannel,
    fit_tier: payload.fitTier,
    persona_focus: payload.personaFocus,
    delivery_status: 'send_failed',
    webhook_payload: {
      email_source: 'outreach_send_worker',
      send_error: error.message,
      error_code: error.code,
      error_raw: error.raw,
      idempotency_key: payload.idempotencyKey,
      campaign_step: payload.campaignStep,
      template_step: payload.templateStep,
      template_source: payload.templateSource,
      batch_id: job.batch_id,
      job_id: job.id,
    },
  })
}

async function applyAcceptedOutreachSideEffects(admin: any, job: any, payload: OutreachSendJobPayload, resendMessageId: string | null) {
  let contactId = job.contact_id as string | null
  const warnings: string[] = []

  if (payload.mode === 'live') {
    const { data: existingContact } = await admin
      .from('contacts')
      .select('id, outreach_status, contacted_at')
      .eq('user_id', payload.userId)
      .ilike('email', payload.emailTo)
      .limit(1)
      .maybeSingle()

    if (existingContact?.id) {
      contactId = existingContact.id
      const { error: updateError } = await admin
        .from('contacts')
        .update({
          outreach_status: payload.statusAfter,
          contacted_at: new Date().toISOString(),
          status: 'active',
          channel: CONTACT_CHANNEL,
          contact_type: payload.fitTier,
          last_role_discussed: payload.personaFocus,
        })
        .eq('id', existingContact.id)
        .eq('user_id', payload.userId)

      if (updateError) warnings.push(`Contact sync update failed: ${updateError.message}`)
    } else {
      const { data: insertedContact, error: insertError } = await admin
        .from('contacts')
        .insert({
          user_id: payload.userId,
          name: payload.fullName,
          firm: payload.company || null,
          title: payload.roleBucket ? payload.roleBucket.toUpperCase() : null,
          email: payload.emailTo,
          channel: CONTACT_CHANNEL,
          status: 'active',
          outreach_status: payload.statusAfter,
          contacted_at: new Date().toISOString(),
          contact_type: payload.fitTier,
          last_role_discussed: payload.personaFocus,
        })
        .select('id')
        .single()

      if (insertError) warnings.push(`Contact sync insert failed: ${insertError.message}`)
      contactId = insertedContact?.id ?? null
    }
  }

  await admin.from('outreach_logs').insert({
    user_id: payload.userId,
    contact_id: payload.mode === 'live' ? contactId : null,
    channel: payload.mode === 'live' ? 'email' : 'other',
    message_preview: `${payload.mode === 'test_to_self' ? '[TEST] ' : ''}${payload.finalMessageText.slice(0, 200)}`,
    recipient_email: payload.emailTo,
    recipient_name: payload.fullName,
    sender_email: OUTREACH_REPLY_TO,
    subject: payload.finalSubject,
    message_body: payload.finalMessageText,
    send_mode: payload.mode,
    outreach_channel: payload.outreachChannel,
    fit_tier: payload.fitTier,
    persona_focus: payload.personaFocus,
    resend_message_id: resendMessageId,
    delivery_status: 'accepted',
    webhook_payload: {
      email_source: 'outreach_send_worker',
      idempotency_key: payload.idempotencyKey,
      campaign_step: payload.campaignStep,
      template_step: payload.templateStep,
      template_source: payload.templateSource,
      batch_id: job.batch_id,
      job_id: job.id,
      provider_recipient: payload.providerRecipient,
      warnings,
    },
  })

  if (payload.mode === 'live' && contactId) {
    const todayPacific = pacificTodayISO()
    const followUp3Date = addBusinessDays(todayPacific, 3)
    const followUp7Date = addBusinessDays(todayPacific, 7)
    const googleFollowUp3Url = buildGoogleCalendarUrl({
      title: `Follow-up 1: ${payload.fullName}`,
      details: `Channel: ${payload.outreachChannel}\nCompany: ${payload.company || 'N/A'}\nEmail: ${payload.emailTo}`,
      dateISO: followUp3Date,
    })
    const googleFollowUp7Url = buildGoogleCalendarUrl({
      title: `Follow-up 2: ${payload.fullName}`,
      details: `Channel: ${payload.outreachChannel}\nCompany: ${payload.company || 'N/A'}\nEmail: ${payload.emailTo}`,
      dateISO: followUp7Date,
    })

    const { error: followUpError } = await admin.from('follow_ups').insert([
      {
        user_id: payload.userId,
        contact_id: contactId,
        action: `Follow-up 1 with ${payload.fullName} (${payload.outreachChannel})`,
        due_date: followUp3Date,
        status: 'pending',
        google_event_url: googleFollowUp3Url,
      },
      {
        user_id: payload.userId,
        contact_id: contactId,
        action: `Follow-up 2 with ${payload.fullName} (${payload.outreachChannel})`,
        due_date: followUp7Date,
        status: 'pending',
        google_event_url: googleFollowUp7Url,
      },
    ])

    if (followUpError) warnings.push(`Follow-up creation failed: ${followUpError.message}`)
  }

  return { contactId, warnings }
}

async function processClaimedJob(admin: any, job: any) {
  const payload = job.payload as OutreachSendJobPayload
  const sendResult = await sendEmail({
    to: payload.providerRecipient,
    subject: payload.finalSubject,
    html: payload.finalHtml,
    channel: payload.outreachChannel,
    from: payload.fromAddress,
    replyTo: payload.replyTo,
    bcc: payload.bcc ?? undefined,
    headers: payload.headers,
  })

  if ((sendResult as { error?: { message?: string } } | null)?.error) {
    const normalized = normalizeSendError((sendResult as { error?: { message?: string } }).error?.message)
    const canRetry = normalized.transient && Number(job.attempt_count ?? 0) < MAX_ATTEMPTS
    const nextAttemptAt = canRetry
      ? new Date(Date.now() + computeRetryDelayMs(Number(job.attempt_count ?? 0), job.domain_bucket as OutreachDomainBucket)).toISOString()
      : null

    await admin
      .from('outreach_send_jobs')
      .update({
        state: canRetry ? 'queued' : 'failed',
        next_attempt_at: nextAttemptAt,
        locked_at: null,
        locked_by: null,
        completed_at: canRetry ? null : new Date().toISOString(),
        last_error: normalized,
      })
      .eq('id', job.id)

    if (!canRetry) {
      await insertFailedOutreachLog(admin, job, payload, normalized)
    }

    await summarizeOutreachSendBatch(admin, job.batch_id)
    return { ok: false, retried: canRetry, error: normalized }
  }

  const resendMessageId = ((sendResult as { data?: { id?: string } | null } | null)?.data?.id ?? null) as string | null
  const sideEffects = await applyAcceptedOutreachSideEffects(admin, job, payload, resendMessageId)

  await admin
    .from('outreach_send_jobs')
    .update({
      state: 'accepted',
      contact_id: sideEffects.contactId,
      provider_message_id: resendMessageId,
      accepted_at: new Date().toISOString(),
      locked_at: null,
      locked_by: null,
      last_error: sideEffects.warnings.length > 0 ? { code: 'side_effect_warning', message: sideEffects.warnings.join(' | ') } : null,
    })
    .eq('id', job.id)

  await summarizeOutreachSendBatch(admin, job.batch_id)
  return { ok: true, resendMessageId }
}

export async function processOutreachSendJobs(input?: { limit?: number; workerId?: string }) {
  const admin = createAdminClient() as any
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
    return { ok: false, error: error.message, processed: 0, workerId }
  }

  const bucketCounts: Record<OutreachDomainBucket, number> = { gmail: 0, microsoft: 0, corporate: 0 }
  let processed = 0
  let accepted = 0
  let failed = 0
  let retried = 0

  for (const candidate of candidates ?? []) {
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

    if (!claimed?.id) continue

    bucketCounts[bucket] += 1
    processed += 1
    const result = await processClaimedJob(admin, claimed)
    if (result.ok) accepted += 1
    else if (result.retried) retried += 1
    else failed += 1
  }

  return { ok: true, workerId, processed, accepted, failed, retried, bucketCounts }
}

export function mapWebhookEventToJobState(eventType: string): OutreachSendJobState | null {
  if (eventType === 'email.delivered') return 'delivered'
  if (eventType === 'email.bounced') return 'bounced'
  if (eventType === 'email.complained') return 'complained'
  if (eventType === 'email.replied' || eventType === 'reply.received') return 'replied'
  return null
}

export async function updateOutreachJobStateFromWebhook(admin: any, providerMessageId: string, eventType: string) {
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

  for (const job of jobs ?? []) {
    if (job.batch_id) {
      await summarizeOutreachSendBatch(admin, job.batch_id)
    }
  }

  return jobs ?? []
}