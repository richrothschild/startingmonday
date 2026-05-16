import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { reviewEmail } from '@/lib/email-quality'

const VALID_STATUSES = new Set(['prospect', 'reached_out', 'in_conversation', 'meeting_scheduled', 'closed'])
const VALID_MODES = new Set(['live', 'dry_run', 'test_to_self'])

const MAX_LIVE_SENDS_PER_DAY = 40
const MAX_LIVE_SENDS_PER_HOUR = 12
const RECIPIENT_COOLDOWN_HOURS = 24

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
  return [
    trimmed,
    '',
    '---',
    'Starting Monday',
    'If you prefer no further outreach, reply with "unsubscribe" and I will stop.',
  ].join('\n')
}

function warmupCaps(daysSinceFirstSend: number | null): { dailyCap: number; hourlyCap: number; phase: string } {
  if (daysSinceFirstSend === null) {
    return { dailyCap: 10, hourlyCap: 4, phase: 'new' }
  }
  if (daysSinceFirstSend < 7) {
    return { dailyCap: 15, hourlyCap: 5, phase: 'week_1' }
  }
  if (daysSinceFirstSend < 14) {
    return { dailyCap: 25, hourlyCap: 8, phase: 'week_2' }
  }
  return { dailyCap: MAX_LIVE_SENDS_PER_DAY, hourlyCap: MAX_LIVE_SENDS_PER_HOUR, phase: 'mature' }
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

  if (message.includes('—') || message.includes('&mdash;')) {
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

  const body = await request.json().catch(() => null)
  const fullName = (body?.fullName ?? '').toString().trim()
  const company = (body?.company ?? '').toString().trim()
  const roleBucket = (body?.roleBucket ?? '').toString().trim().toLowerCase()
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

  const guardrail = evaluateGuardrails({ subject, messageText, fullName, company, mode })
  if (guardrail.violations.length > 0) {
    return NextResponse.json({ error: 'Guardrail violation', violations: guardrail.violations, warnings: guardrail.warnings }, { status: 400 })
  }

  const supabase = await createClient()
  const sb = supabase as any
  const { data: authData } = await supabase.auth.getUser()
  const senderUserEmail = authData.user?.email?.toLowerCase() ?? ''

  let contactId: string | null = null
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('id')
    .eq('user_id', userId)
    .eq('email', emailTo)
    .limit(1)
    .maybeSingle()

  if (existingContact?.id) {
    contactId = existingContact.id
  }

  const [{ data: suppressionHit }, { data: closedContactHit }] = await Promise.all([
    sb
      .from('outreach_suppressions')
      .select('id')
      .eq('user_id', userId)
      .eq('email', emailTo)
      .eq('active', true)
      .limit(1)
      .maybeSingle(),
    sb
      .from('contacts')
      .select('id')
      .eq('user_id', userId)
      .eq('email', emailTo)
      .eq('outreach_status', 'closed')
      .limit(1)
      .maybeSingle(),
  ])

  if (suppressionHit?.id || closedContactHit?.id) {
    return NextResponse.json({ error: 'Recipient is suppressed. Remove suppression before sending.' }, { status: 409 })
  }

  if (mode === 'live') {
    const dayStart = new Date()
    dayStart.setHours(0, 0, 0, 0)
    const hourStart = new Date(Date.now() - 60 * 60 * 1000)

    const [{ count: sentToday }, { count: sentHour }, { data: firstSendRow }] = await Promise.all([
      supabase
        .from('outreach_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('channel', 'email')
        .gte('sent_at', dayStart.toISOString()),
      supabase
        .from('outreach_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('channel', 'email')
        .gte('sent_at', hourStart.toISOString()),
      supabase
        .from('outreach_logs')
        .select('sent_at')
        .eq('user_id', userId)
        .eq('channel', 'email')
        .order('sent_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
    ])

    const firstSendAt = firstSendRow?.sent_at ? new Date(firstSendRow.sent_at) : null
    const daysSinceFirstSend = firstSendAt ? Math.floor((Date.now() - firstSendAt.getTime()) / (24 * 60 * 60 * 1000)) : null
    const caps = warmupCaps(daysSinceFirstSend)
    const dailyCap = Math.min(MAX_LIVE_SENDS_PER_DAY, caps.dailyCap)
    const hourlyCap = Math.min(MAX_LIVE_SENDS_PER_HOUR, caps.hourlyCap)

    if ((sentToday ?? 0) >= dailyCap) {
      return NextResponse.json({ error: `Daily warm-up cap reached (${dailyCap}, phase: ${caps.phase}).` }, { status: 429 })
    }

    if ((sentHour ?? 0) >= hourlyCap) {
      return NextResponse.json({ error: `Hourly warm-up cap reached (${hourlyCap}, phase: ${caps.phase}).` }, { status: 429 })
    }

    if (contactId) {
      const cooldownStart = new Date(Date.now() - RECIPIENT_COOLDOWN_HOURS * 60 * 60 * 1000).toISOString()
      const { count: recentToSameRecipient } = await supabase
        .from('outreach_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('channel', 'email')
        .eq('contact_id', contactId)
        .gte('sent_at', cooldownStart)

      if ((recentToSameRecipient ?? 0) > 0) {
        return NextResponse.json({ error: `Recipient cooldown active (${RECIPIENT_COOLDOWN_HOURS}h). Use follow-up schedule instead.` }, { status: 429 })
      }
    }
  }

  if (mode === 'dry_run') {
    return NextResponse.json({
      ok: true,
      mode,
      to: emailTo,
      from: process.env.OUTREACH_FROM_ADDRESS ?? 'Richard Rothschild <richard@startingmonday.app>',
      warnings: guardrail.warnings,
      status: 'prospect',
    })
  }

  const recipient = mode === 'test_to_self' ? senderUserEmail : emailTo
  if (!recipient || !isValidEmail(recipient)) {
    return NextResponse.json({ error: 'Could not resolve test recipient email.' }, { status: 400 })
  }

  if (mode === 'live') {
    if (existingContact?.id) {
      await supabase
        .from('contacts')
        .update({
          outreach_status: statusAfter,
          contacted_at: new Date().toISOString(),
          status: 'active',
        })
        .eq('id', existingContact.id)
        .eq('user_id', userId)
    } else {
      const { data: insertedContact } = await supabase
        .from('contacts')
        .insert({
          user_id: userId,
          name: fullName,
          firm: company || null,
          title: roleBucket ? roleBucket.toUpperCase() : null,
          email: emailTo,
          channel: 'cold',
          status: 'active',
          outreach_status: statusAfter,
          contacted_at: new Date().toISOString(),
        })
        .select('id')
        .single()
      contactId = insertedContact?.id ?? null
    }
  }

  const fromAddress = process.env.OUTREACH_FROM_ADDRESS ?? 'Richard Rothschild <richard@startingmonday.app>'
  if (!fromAddress.toLowerCase().includes('startingmonday.app')) {
    return NextResponse.json({ error: 'OUTREACH_FROM_ADDRESS must use startingmonday.app domain.' }, { status: 500 })
  }

  const finalSubject = mode === 'test_to_self' ? `[TEST] ${subject}` : subject
  const finalMessageText = withComplianceFooter(messageText)
  const listUnsubscribe = `<mailto:richard@startingmonday.app?subject=unsubscribe>`
  const sendResult = await sendEmail({
    to: recipient,
    subject: finalSubject,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#0f172a;">${toHtml(finalMessageText)}</div>`,
    from: fromAddress,
    replyTo: 'richard@startingmonday.app',
    headers: {
      'List-Unsubscribe': listUnsubscribe,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  })

  if ((sendResult as { error?: { message?: string } } | null)?.error) {
    return NextResponse.json(
      { error: (sendResult as { error?: { message?: string } }).error?.message ?? 'Email send failed.' },
      { status: 502 },
    )
  }

  await supabase.from('outreach_logs').insert({
    user_id: userId,
    contact_id: mode === 'live' ? contactId : null,
    channel: mode === 'live' ? 'email' : 'other',
    message_preview: `${mode === 'test_to_self' ? '[TEST] ' : ''}${finalMessageText.slice(0, 200)}`,
  })

  if (mode === 'live') {
    const followUpDate = new Date()
    followUpDate.setDate(followUpDate.getDate() + 3)
    const followUpDateStr = followUpDate.toISOString().slice(0, 10)

    if (contactId) {
      await supabase.from('follow_ups').insert({
        user_id: userId,
        contact_id: contactId,
        action: `Follow up with ${fullName}`,
        due_date: followUpDateStr,
        status: 'pending',
      })
    }
  }

  return NextResponse.json({
    ok: true,
    mode,
    to: recipient,
    warnings: guardrail.warnings,
    status: mode === 'live' ? statusAfter : 'prospect',
  })
}
