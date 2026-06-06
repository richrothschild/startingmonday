import { type NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { timingSafeEqual } from 'crypto'
import { updateOutreachJobStateFromWebhook } from '@/lib/outreach/send-queue'

type WebhookPayload = {
  type?: string
  created_at?: string
  data?: {
    email_id?: string
    to?: string[]
    from?: string
    subject?: string
    text?: string
    html?: string
    reason?: string
    bounce_type?: string
    email?: string
  }
}

type LogLookupRow = {
  id: string
  user_id: string
  contact_id: string | null
  recipient_email: string | null
}

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function normalizeEmail(email: string | undefined | null): string {
  return (email ?? '').trim().toLowerCase()
}

function safeJson(body: string): WebhookPayload | null {
  try {
    return JSON.parse(body) as WebhookPayload
  } catch {
    return null
  }
}

function isBounceType(eventType: string): boolean {
  return eventType === 'email.bounced' || eventType === 'email.complained'
}

function isReplyType(eventType: string): boolean {
  return eventType === 'email.replied' || eventType === 'reply.received'
}

function isUnsubscribeType(eventType: string): boolean {
  return eventType === 'email.unsubscribed' || eventType === 'unsubscribe.created'
}

function secretsMatch(actual: string, expected: string): boolean {
  try {
    const left = Buffer.from(actual)
    const right = Buffer.from(expected)
    if (left.length !== right.length) return false
    return timingSafeEqual(left, right)
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret') ?? ''
  const expected = process.env.RESEND_WEBHOOK_SECRET ?? ''
  if (!expected || !secret || !secretsMatch(secret, expected)) {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 })
  }

  const rawBody = await request.text()
  const payload = safeJson(rawBody)
  if (!payload?.type) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const eventType = payload.type
  const messageId = payload.data?.email_id ?? null
  const recipientFromList = Array.isArray(payload.data?.to) ? payload.data?.to[0] : null
  const recipient = normalizeEmail(payload.data?.email ?? recipientFromList)

  const supabase = createAdminClient()

  let logRow: LogLookupRow | null = null

  if (messageId) {
    const { data } = await supabase
      .from('outreach_logs')
      .select('id, user_id, contact_id, recipient_email')
      .eq('resend_message_id', messageId)
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    logRow = (data as unknown as LogLookupRow | null) ?? null
  }

  if (!logRow && recipient) {
    const { data } = await supabase
      .from('outreach_logs')
      .select('id, user_id, contact_id, recipient_email')
      .eq('recipient_email', recipient)
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    logRow = (data as unknown as LogLookupRow | null) ?? null
  }

  const userId = logRow?.user_id ?? null
  const contactId = logRow?.contact_id ?? null
  const recipientEmail = normalizeEmail(logRow?.recipient_email ?? recipient)

  if (messageId) {
    await supabase
      .from('outreach_logs')
      .update({
        delivery_status: eventType,
        webhook_event_type: eventType,
        webhook_payload: payload,
      })
      .eq('resend_message_id', messageId)

    await updateOutreachJobStateFromWebhook(supabase as unknown as any, messageId, eventType)
  }

  if ((isBounceType(eventType) || isUnsubscribeType(eventType)) && userId && recipientEmail) {
    const source = isBounceType(eventType) ? 'bounce' : 'unsubscribe'
    const reason = payload.data?.reason ?? payload.data?.bounce_type ?? eventType

    await supabase
      .from('outreach_suppressions')
      .upsert(
        {
          user_id: userId,
          email: recipientEmail,
          reason,
          source,
          active: true,
        },
        { onConflict: 'user_id,email' },
      )

    await supabase
      .from('contacts')
      .update({ outreach_status: 'closed' })
      .eq('user_id', userId)
      .ilike('email', recipientEmail)
  }

  if (isReplyType(eventType) && userId && contactId) {
    await supabase
      .from('contacts')
      .update({ outreach_status: 'in_conversation' })
      .eq('id', contactId)
      .eq('user_id', userId)

    await supabase.from('outreach_logs').insert({
      user_id: userId,
      contact_id: contactId,
      channel: 'email',
      recipient_email: recipientEmail || null,
      recipient_name: null,
      sender_email: normalizeEmail(payload.data?.from),
      subject: payload.data?.subject ?? 'Inbound reply',
      message_body: payload.data?.text ?? null,
      send_mode: 'inbound',
      outreach_channel: null,
      fit_tier: null,
      persona_focus: null,
      resend_message_id: messageId,
      delivery_status: 'inbound_reply',
      webhook_event_type: eventType,
      webhook_payload: {
        ...payload,
        email_source: 'resend_webhook_inbound_reply',
      },
      message_preview: (payload.data?.text ?? 'Inbound reply').slice(0, 200),
    })
  }

  return NextResponse.json({ ok: true })
}


const __councilObservabilitySignal = () => console.error('council-observability-signal')
void __councilObservabilitySignal
