/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { autoRefineEmailDraft } from '@/lib/email-council'
import { reviewEmail } from '@/lib/email-quality'
import { getStaffMember } from '@/lib/staff'
import templateEngine from '@/lib/outreach/template-engine.cjs'
import {
  DEFAULT_OUTREACH_FROM,
  OUTREACH_REPLY_TO,
  ensureOutreachSendBatch,
  enqueueOutreachSendJob,
  findDuplicateOutreachSend,
  kickOutreachSendWorker,
  type OutreachSendMode,
  type OutreachSendJobPayload,
} from '@/lib/outreach/send-queue'

const VALID_STATUSES = new Set(['prospect', 'reached_out', 'in_conversation', 'meeting_scheduled', 'closed'])
const VALID_MODES = new Set(['live', 'dry_run', 'test_to_self'])
const VALID_OUTREACH_CHANNELS = new Set(['executives', 'search_firms', 'coaches', 'outplacement_firms'])

const SPAMMY_PHRASES = [
  'guaranteed',
  'risk free',
  'act now',
  'limited time',
  'buy now',
  'double your',
  'no obligation',
  'click here',
  'winner',
  'urgent response needed',
]

function normalizeEmail(value: unknown): string {
  return (value ?? '').toString().trim().toLowerCase()
}

function isValidEmail(email: string): boolean {
  return email.includes('@')
}

function toHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
}

function withComplianceFooter(messageText: string): string {
  const trimmed = messageText.trim()
    .replace(/\n*---\nStarting Monday\nIf you prefer no further outreach, reply with "unsubscribe" and I will stop\.\s*$/i, '')
    .trim()
  return [
    trimmed,
    '',
    '---',
    'Starting Monday',
    'If you prefer no further outreach, reply with "unsubscribe" and I will stop.',
  ].join('\n')
}

function ensureSignatureLine(messageText: string): string {
  let normalized = messageText.replace(/\r\n/g, '\n').trim()
  if (!normalized) return normalized

  normalized = normalized
    .replace(/\n*---\nStarting Monday\nIf you prefer no further outreach, reply with "unsubscribe" and I will stop\.\s*$/i, '')
    .trim()

  const trailingSignaturePatterns = [
    /\n*Best,?\s*\n\s*Richard Rothschild\s*\n\s*startingmonday\.app\s*$/i,
    /\n*Best,?\s*\n\s*Rich\s*\n\s*startingmonday\.app\s*$/i,
    /\n*Richard Rothschild\s*\n\s*startingmonday\.app\s*$/i,
    /\n*Rich\s*\n\s*startingmonday\.app\s*$/i,
    /\n*startingmonday\.app\s*$/i,
  ]

  let changed = true
  while (changed) {
    changed = false
    for (const pattern of trailingSignaturePatterns) {
      const next = normalized.replace(pattern, '').trim()
      if (next !== normalized) {
        normalized = next
        changed = true
      }
    }
  }

  return `${normalized}\n\nRich\nstartingmonday.app`
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0]?.toLowerCase() ?? ''
}

function extractUrls(text: string): string[] {
  return text.match(/https?:\/\/[^\s)]+/gi) ?? []
}

function evaluateGuardrails(input: {
  subject: string
  messageText: string
  fullName: string
  company: string
  mode: string
}) {
  const violations: string[] = []
  const warnings: string[] = []
  const subject = input.subject.trim()
  const message = input.messageText.trim()
  const lowered = message.toLowerCase()
  const loweredSubject = subject.toLowerCase()

  if (subject.length < 6) {
    violations.push('Subject is too short. Use at least 6 characters.')
  }
  if (subject.length > 80) {
    violations.push('Subject is too long. Keep it under 80 characters.')
  }
  if (message.length < 80) {
    violations.push('Message is too short. Add context and personalization.')
  }
  if (message.length > 1800) {
    violations.push('Message is too long. Keep it under 1800 characters.')
  }

  const urls = extractUrls(message)
  if (urls.length > 1) {
    violations.push('Use at most one link per outreach message to reduce spam risk.')
  }

  if (message.includes('\u2014') || message.includes('&mdash;')) {
    violations.push('Do not use em dashes in outreach messages.')
  }

  const exclamations = (message.match(/!/g) ?? []).length
  if (exclamations > 2) {
    violations.push('Too many exclamation marks. Keep punctuation restrained.')
  }

  for (const phrase of SPAMMY_PHRASES) {
    if (lowered.includes(phrase) || loweredSubject.includes(phrase)) {
      violations.push(`Potential spam phrase detected: "${phrase}".`)
      break
    }
  }

  const nameToken = firstName(input.fullName)
  const companyToken = input.company.trim().toLowerCase()
  if (nameToken && !lowered.includes(nameToken) && companyToken && !lowered.includes(companyToken)) {
    warnings.push('Message does not reference recipient name or company. Add stronger personalization.')
  }

  const qualityIssues = reviewEmail(subject, toHtml(message))
  for (const issue of qualityIssues) {
    warnings.push(issue)
  }

  if (input.mode === 'live' && warnings.length > 0) {
    warnings.push('Consider test_to_self first to check inbox rendering and tone before live send.')
  }

  return { violations, warnings }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response
  const { userId } = auth

  const supabase = await createClient()
  const admin = createAdminClient() as any
  const { data: authData } = await supabase.auth.getUser()
  const senderUserEmail = authData.user?.email?.toLowerCase() ?? ''
  const staff = await getStaffMember(authData.user?.email ?? '')
  if (!staff) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const fullName = (body?.fullName ?? '').toString().trim()
  const company = (body?.company ?? '').toString().trim()
  const roleBucket = (body?.roleBucket ?? '').toString().trim().toLowerCase()
  const outreachChannel = (body?.outreachChannel ?? 'executives').toString().trim().toLowerCase()
  const fitTier = (body?.fitTier ?? '').toString().trim().toLowerCase()
  const personaFocus = (body?.personaFocus ?? '').toString().trim()
  const campaignStep = (body?.campaignStep ?? '').toString().trim()
  const templateStep = (body?.templateStep ?? '').toString().trim()
  const useLatestTemplateDraft = body?.useLatestTemplateDraft === true
  const idempotencyKey = (body?.idempotencyKey ?? '').toString().trim()
  const batchIdInput = (body?.batchId ?? '').toString().trim()
  const skipWorkerKickoff = body?.skipWorkerKickoff === true
  const emailTo = normalizeEmail(body?.emailTo)
  let subject = (body?.subject ?? '').toString().trim()
  let messageText = (body?.messageText ?? '').toString().trim()
  const statusAfter = (body?.statusAfter ?? 'reached_out').toString()
  const mode = (body?.mode ?? 'live').toString()

  if (useLatestTemplateDraft) {
    const first = fullName.trim().split(/\s+/)[0] || 'there'
    const generated = templateEngine.buildLatestTemplateDraft({
      channel: outreachChannel,
      firstName: first,
      company,
      roleLabel: roleBucket || 'Executive',
      focus: personaFocus || roleBucket || 'senior transition',
      step: templateStep || campaignStep || 'followup_1',
      state: '',
      profileTrigger: '',
      postTrigger: '',
      newsTrigger: '',
    })
    subject = generated.subject.trim()
    messageText = generated.body.trim()
  }

  if (!fullName || !emailTo || !subject || !messageText) {
    return NextResponse.json({ error: 'fullName, emailTo, subject, and messageText are required.' }, { status: 400 })
  }
  if (!isValidEmail(emailTo)) {
    return NextResponse.json({ error: 'Invalid recipient email.' }, { status: 400 })
  }
  if (!VALID_STATUSES.has(statusAfter)) {
    return NextResponse.json({ error: 'Invalid statusAfter.' }, { status: 400 })
  }
  if (!VALID_MODES.has(mode)) {
    return NextResponse.json({ error: 'Invalid mode.' }, { status: 400 })
  }
  if (!VALID_OUTREACH_CHANNELS.has(outreachChannel)) {
    return NextResponse.json({ error: 'Invalid outreachChannel.' }, { status: 400 })
  }
  if (campaignStep.length > 120) {
    return NextResponse.json({ error: 'campaignStep is too long.' }, { status: 400 })
  }
  if (templateStep.length > 120) {
    return NextResponse.json({ error: 'templateStep is too long.' }, { status: 400 })
  }
  if (idempotencyKey.length > 160) {
    return NextResponse.json({ error: 'idempotencyKey is too long.' }, { status: 400 })
  }

  const guardrail = evaluateGuardrails({ subject, messageText, fullName, company, mode })
  if (guardrail.violations.length > 0) {
    return NextResponse.json({ error: 'Guardrail violation', violations: guardrail.violations, warnings: guardrail.warnings }, { status: 400 })
  }

  const { data: existingContact } = await supabase
    .from('contacts')
    .select('id, outreach_status')
    .eq('user_id', userId)
    .ilike('email', emailTo)
    .limit(1)
    .maybeSingle()

  const contactId = existingContact?.id ?? null

  const [{ data: suppressionHitRaw }, { data: closedContactHitRaw }] = await Promise.all([
    supabase
      .from('outreach_suppressions')
      .select('id')
      .eq('user_id', userId)
      .eq('email', emailTo)
      .eq('active', true)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('contacts')
      .select('id')
      .eq('user_id', userId)
      .ilike('email', emailTo)
      .eq('outreach_status', 'closed')
      .limit(1)
      .maybeSingle(),
  ])

  const suppressionHit = suppressionHitRaw as { id?: string } | null
  const closedContactHit = closedContactHitRaw as { id?: string } | null

  if (suppressionHit?.id || closedContactHit?.id) {
    return NextResponse.json({ error: 'Recipient is suppressed. Remove suppression before sending.' }, { status: 409 })
  }

  const recipient = mode === 'test_to_self' ? senderUserEmail : emailTo
  if ((mode === 'test_to_self' || mode === 'live') && (!recipient || !isValidEmail(recipient))) {
    return NextResponse.json({ error: 'Could not resolve test recipient email.' }, { status: 400 })
  }

  const fromAddress = process.env.OUTREACH_FROM_ADDRESS ?? DEFAULT_OUTREACH_FROM
  if (!fromAddress.toLowerCase().includes(OUTREACH_REPLY_TO)) {
    return NextResponse.json({ error: 'OUTREACH_FROM_ADDRESS must use richard@startingmonday.app.' }, { status: 500 })
  }

  const finalSubject = mode === 'test_to_self' ? `[TEST] ${subject}` : subject
  const signedMessageText = ensureSignatureLine(messageText)
  const finalMessageText = withComplianceFooter(signedMessageText)
  const finalHtml = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#0f172a;">${toHtml(finalMessageText)}</div>`
  const minCouncilScore = Number(process.env.EMAIL_COUNCIL_MIN_SCORE ?? '80')
  const resolvedMinCouncilScore = Number.isFinite(minCouncilScore) ? minCouncilScore : 80
  const councilRefine = autoRefineEmailDraft({
    channel: outreachChannel as 'executives' | 'search_firms' | 'coaches' | 'outplacement_firms',
    subject: finalSubject,
    html: finalHtml,
    minEjes: resolvedMinCouncilScore,
    maxPasses: 2,
  })

  if (!councilRefine.passesAfterRefine) {
    const councilMessage = `Blocked by email council gate: EJES ${councilRefine.evaluation.scores.ejes} < ${resolvedMinCouncilScore}`
    if (mode !== 'dry_run') {
      await supabase.from('outreach_logs').insert({
        user_id: userId,
        contact_id: mode === 'live' ? contactId : null,
        channel: mode === 'live' ? 'email' : 'other',
        message_preview: `${mode === 'test_to_self' ? '[TEST] ' : ''}${messageText.slice(0, 200)}`,
        recipient_email: emailTo,
        recipient_name: fullName,
        sender_email: OUTREACH_REPLY_TO,
        subject: finalSubject,
        message_body: messageText,
        send_mode: mode,
        outreach_channel: outreachChannel,
        fit_tier: fitTier || null,
        persona_focus: personaFocus || null,
        delivery_status: 'send_failed',
        webhook_payload: {
          email_source: 'outreach_send_route',
          send_error: councilMessage,
          idempotency_key: idempotencyKey || null,
          campaign_step: campaignStep || null,
          template_step: templateStep || null,
          template_source: useLatestTemplateDraft ? 'latest_template_engine' : 'custom_input',
          council_blockers: councilRefine.evaluation.blockers,
          council_warnings: councilRefine.evaluation.warnings,
          council_score: councilRefine.evaluation.scores,
        },
      })
    }

    return NextResponse.json({
      error: councilMessage,
      violations: councilRefine.evaluation.blockers,
      warnings: [...guardrail.warnings, ...councilRefine.evaluation.warnings],
      council: {
        minScore: resolvedMinCouncilScore,
        scores: councilRefine.evaluation.scores,
        blockers: councilRefine.evaluation.blockers,
        warnings: councilRefine.evaluation.warnings,
        rewritesApplied: councilRefine.rewritesApplied,
      },
    }, { status: 400 })
  }

  if (mode === 'dry_run') {
    return NextResponse.json({
      ok: true,
      mode,
      to: emailTo,
      from: process.env.OUTREACH_FROM_ADDRESS ?? DEFAULT_OUTREACH_FROM,
      replyTo: OUTREACH_REPLY_TO,
      warnings: [...guardrail.warnings, ...councilRefine.evaluation.warnings],
      status: 'prospect',
      council: {
        minScore: resolvedMinCouncilScore,
        scores: councilRefine.evaluation.scores,
        blockers: councilRefine.evaluation.blockers,
        warnings: councilRefine.evaluation.warnings,
        rewritesApplied: councilRefine.rewritesApplied,
      },
    })
  }

  if (idempotencyKey) {
    const duplicate = await findDuplicateOutreachSend(admin, {
      userId,
      recipientEmail: emailTo,
      idempotencyKey,
    })
    if (duplicate.duplicate) {
      return NextResponse.json({
        ok: true,
        duplicate: true,
        idempotencyKey,
        deliveryStatus: duplicate.deliveryStatus,
        mode,
        to: recipient,
        status: 'queued',
      })
    }
  }

  const batchId = await ensureOutreachSendBatch(admin, {
    batchId: batchIdInput || null,
    userId,
    mode: mode as OutreachSendMode,
    campaignStep: campaignStep || null,
    templateStep: templateStep || null,
  })

  const listUnsubscribe = `<mailto:${OUTREACH_REPLY_TO}?subject=unsubscribe>`
  const templateSource = useLatestTemplateDraft ? 'latest_template_engine' : 'custom_input'
  const jobPayload: OutreachSendJobPayload = {
    userId,
    fullName,
    company,
    roleBucket,
    emailTo,
    providerRecipient: recipient,
    subject,
    finalSubject,
    messageText,
    finalMessageText,
    finalHtml,
    statusAfter,
    mode: mode as OutreachSendMode,
    outreachChannel: outreachChannel as 'executives' | 'search_firms' | 'coaches' | 'outplacement_firms',
    fitTier: fitTier || null,
    personaFocus: personaFocus || null,
    campaignStep: campaignStep || null,
    templateStep: templateStep || null,
    templateSource,
    idempotencyKey: idempotencyKey || null,
    fromAddress,
    replyTo: OUTREACH_REPLY_TO,
    bcc: mode === 'live' ? OUTREACH_REPLY_TO : null,
    headers: {
      'List-Unsubscribe': listUnsubscribe,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    senderUserEmail: senderUserEmail || null,
  }

  const queued = await enqueueOutreachSendJob(admin, {
    batchId,
    userId,
    contactId,
    recipientEmail: emailTo,
    idempotencyKey: idempotencyKey || null,
    payload: jobPayload,
  })

  if (!skipWorkerKickoff) {
    await kickOutreachSendWorker()
  }

  return NextResponse.json({
    ok: true,
    queued: true,
    mode,
    to: recipient,
    status: 'queued',
    templateSource,
    warnings: [...guardrail.warnings, ...councilRefine.evaluation.warnings],
    batchId,
    jobId: queued.jobId,
    domainBucket: queued.domainBucket,
  })
}
