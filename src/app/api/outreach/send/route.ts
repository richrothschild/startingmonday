import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { autoRefineEmailDraft } from '@/lib/email-council'
import { reviewEmail } from '@/lib/email-quality'
import { getStaffMember } from '@/lib/staff'
const __councilObservabilitySignal = (...args: unknown[]) => console.error(...args)

const VALID_STATUSES = new Set(['prospect', 'reached_out', 'in_conversation', 'meeting_scheduled', 'closed'])
const VALID_MODES = new Set(['live', 'dry_run', 'test_to_self'])
const VALID_OUTREACH_CHANNELS = new Set(['executives', 'search_firms', 'coaches', 'outplacement_firms'])
const PACIFIC_TZ = 'America/Los_Angeles'
const OUTREACH_REPLY_TO = 'richard@startingmonday.app'
const DEFAULT_OUTREACH_FROM = `Richard Rothschild <${OUTREACH_REPLY_TO}>`
const CONTACT_CHANNEL = 'cold'

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

  // Remove any existing compliance footer so we only add one canonical footer later.
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

function pacificTodayISO(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: PACIFIC_TZ })
}

function addBusinessDays(isoDate: string, businessDays: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`)
  let remaining = businessDays
  while (remaining > 0) {
    d.setUTCDate(d.getUTCDate() + 1)
    const day = d.getUTCDay()
    if (day !== 0 && day !== 6) remaining--
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
  const emailTo = normalizeEmail(body?.emailTo)
  const subject = (body?.subject ?? '').toString().trim()
  const messageText = (body?.messageText ?? '').toString().trim()
  const statusAfter = (body?.statusAfter ?? 'reached_out').toString()
  const mode = (body?.mode ?? 'live').toString()

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

  const guardrail = evaluateGuardrails({ subject, messageText, fullName, company, mode })
  const contactSyncWarnings: string[] = []
  if (guardrail.violations.length > 0) {
    return NextResponse.json({ error: 'Guardrail violation', violations: guardrail.violations, warnings: guardrail.warnings }, { status: 400 })
  }

  let contactId: string | null = null
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('id, outreach_status')
    .eq('user_id', userId)
    .ilike('email', emailTo)
    .limit(1)
    .maybeSingle()

  if (existingContact?.id) {
    contactId = existingContact.id
  }

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
  const minCouncilScore = Number(process.env.EMAIL_COUNCIL_MIN_SCORE ?? '90')
  const resolvedMinCouncilScore = Number.isFinite(minCouncilScore) ? minCouncilScore : 90
  const councilRefine = autoRefineEmailDraft({
    channel: outreachChannel as 'executives' | 'search_firms' | 'coaches' | 'outplacement_firms',
    subject: finalSubject,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#0f172a;">${toHtml(finalMessageText)}</div>`,
    minEjes: resolvedMinCouncilScore,
    maxPasses: 2,
  })

  if (!councilRefine.passesAfterRefine) {
    const councilMessage = `Blocked by email council gate: EJES ${councilRefine.evaluation.scores.ejes} < ${resolvedMinCouncilScore}`
    if (mode !== 'dry_run') {
      await supabase.from('outreach_logs').insert({
        user_id: userId,
        contact_id: mode === 'live' ? (contactId ?? existingContact?.id ?? null) : null,
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

  const listUnsubscribe = `<mailto:richard@startingmonday.app?subject=unsubscribe>`
  const sendResult = await sendEmail({
    to: recipient,
    subject: finalSubject,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#0f172a;">${toHtml(finalMessageText)}</div>`,
    channel: outreachChannel as 'executives' | 'search_firms' | 'coaches' | 'outplacement_firms',
    from: fromAddress,
    replyTo: OUTREACH_REPLY_TO,
    bcc: mode === 'live' ? OUTREACH_REPLY_TO : undefined,
    headers: {
      'List-Unsubscribe': listUnsubscribe,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  })

  if ((sendResult as { error?: { message?: string } } | null)?.error) {
    const errorMessage = (sendResult as { error?: { message?: string } }).error?.message ?? 'Email send failed.'
    await supabase.from('outreach_logs').insert({
      user_id: userId,
      contact_id: mode === 'live' ? (contactId ?? existingContact?.id ?? null) : null,
      channel: mode === 'live' ? 'email' : 'other',
      message_preview: `${mode === 'test_to_self' ? '[TEST] ' : ''}${messageText.slice(0, 200)}`,
      recipient_email: emailTo,
      recipient_name: fullName,
      sender_email: OUTREACH_REPLY_TO,
      subject: mode === 'test_to_self' ? `[TEST] ${subject}` : subject,
      message_body: messageText,
      send_mode: mode,
      outreach_channel: outreachChannel,
      fit_tier: fitTier || null,
      persona_focus: personaFocus || null,
      delivery_status: 'send_failed',
      webhook_payload: { email_source: 'outreach_send_route', send_error: errorMessage },
    })

    return NextResponse.json(
      { error: errorMessage },
      { status: 502 },
    )
  }

  const resendMessageId = ((sendResult as { data?: { id?: string } | null } | null)?.data?.id ?? null) as string | null

  if (mode === 'live') {
    if (existingContact?.id) {
      const { error: updateError } = await supabase
        .from('contacts')
        .update({
          outreach_status: statusAfter,
          contacted_at: new Date().toISOString(),
          status: 'active',
          channel: CONTACT_CHANNEL,
          contact_type: fitTier || null,
          last_role_discussed: personaFocus || null,
        })
        .eq('id', existingContact.id)
        .eq('user_id', userId)

      if (updateError) {
        contactSyncWarnings.push(`Contact sync update failed: ${updateError.message}`)
      }
      contactId = existingContact.id
    } else {
      const { data: insertedContact, error: insertError } = await supabase
        .from('contacts')
        .insert({
          user_id: userId,
          name: fullName,
          firm: company || null,
          title: roleBucket ? roleBucket.toUpperCase() : null,
          email: emailTo,
          channel: CONTACT_CHANNEL,
          status: 'active',
          outreach_status: statusAfter,
          contacted_at: new Date().toISOString(),
          contact_type: fitTier || null,
          last_role_discussed: personaFocus || null,
        })
        .select('id')
        .single()

      if (insertError) {
        contactSyncWarnings.push(`Contact sync insert failed: ${insertError.message}`)
      }
      contactId = insertedContact?.id ?? null
    }
  }

  await supabase.from('outreach_logs').insert({
    user_id: userId,
    contact_id: mode === 'live' ? contactId : null,
    channel: mode === 'live' ? 'email' : 'other',
    message_preview: `${mode === 'test_to_self' ? '[TEST] ' : ''}${finalMessageText.slice(0, 200)}`,
    recipient_email: emailTo,
    recipient_name: fullName,
    sender_email: OUTREACH_REPLY_TO,
    subject: finalSubject,
    message_body: finalMessageText,
    send_mode: mode,
    outreach_channel: outreachChannel,
    fit_tier: fitTier || null,
    persona_focus: personaFocus || null,
    resend_message_id: resendMessageId,
    delivery_status: mode === 'live' ? 'sent' : 'simulated',
    webhook_payload: { email_source: 'outreach_send_route' },
  })

  let googleFollowUp3Url: string | null = null
  let googleFollowUp7Url: string | null = null

  if (mode === 'live') {
    const todayPacific = pacificTodayISO()
    const followUp3Date = addBusinessDays(todayPacific, 3)
    const followUp7Date = addBusinessDays(todayPacific, 7)

    if (contactId) {
      googleFollowUp3Url = buildGoogleCalendarUrl({
        title: `Follow-up 1: ${fullName}`,
        details: `Channel: ${outreachChannel}\nCompany: ${company || 'N/A'}\nEmail: ${emailTo}`,
        dateISO: followUp3Date,
      })
      googleFollowUp7Url = buildGoogleCalendarUrl({
        title: `Follow-up 2: ${fullName}`,
        details: `Channel: ${outreachChannel}\nCompany: ${company || 'N/A'}\nEmail: ${emailTo}`,
        dateISO: followUp7Date,
      })

      await supabase.from('follow_ups').insert([
        {
          user_id: userId,
          contact_id: contactId,
          action: `Follow-up 1 with ${fullName} (${outreachChannel})`,
          due_date: followUp3Date,
          status: 'pending',
          google_event_url: googleFollowUp3Url,
        },
        {
          user_id: userId,
          contact_id: contactId,
          action: `Follow-up 2 with ${fullName} (${outreachChannel})`,
          due_date: followUp7Date,
          status: 'pending',
          google_event_url: googleFollowUp7Url,
        },
      ])
    }
  }

  return NextResponse.json({
    ok: true,
    mode,
    to: recipient,
    warnings: [...guardrail.warnings, ...contactSyncWarnings],
    status: mode === 'live' ? statusAfter : 'prospect',
    googleFollowUp3Url,
    googleFollowUp7Url,
  })
}
