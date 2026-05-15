import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'

const VALID_STATUSES = new Set(['prospect', 'reached_out', 'in_conversation', 'meeting_scheduled', 'closed'])

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

  if (!fullName || !emailTo || !subject || !messageText) {
    return NextResponse.json({ error: 'fullName, emailTo, subject, and messageText are required.' }, { status: 400 })
  }
  if (!isValidEmail(emailTo)) {
    return NextResponse.json({ error: 'Invalid recipient email.' }, { status: 400 })
  }
  if (!VALID_STATUSES.has(statusAfter)) {
    return NextResponse.json({ error: 'Invalid statusAfter.' }, { status: 400 })
  }

  const supabase = await createClient()

  let contactId: string | null = null
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('id')
    .eq('user_id', userId)
    .eq('email', emailTo)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (existingContact?.id) {
    contactId = existingContact.id
    await supabase
      .from('contacts')
      .update({
        outreach_status: statusAfter,
        contacted_at: new Date().toISOString(),
      })
      .eq('id', contactId)
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

  const fromAddress = process.env.OUTREACH_FROM_ADDRESS ?? 'Richard Rothschild <richard@startingmonday.app>'
  const sendResult = await sendEmail({
    to: emailTo,
    subject,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#0f172a;">${toHtml(messageText)}</div>`,
    from: fromAddress,
    replyTo: 'richard@startingmonday.app',
  })

  if ((sendResult as { error?: { message?: string } } | null)?.error) {
    return NextResponse.json(
      { error: (sendResult as { error?: { message?: string } }).error?.message ?? 'Email send failed.' },
      { status: 502 },
    )
  }

  await supabase.from('outreach_logs').insert({
    user_id: userId,
    contact_id: contactId,
    channel: 'email',
    message_preview: messageText.slice(0, 200),
  })

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

  return NextResponse.json({ ok: true, status: statusAfter })
}
