import { Resend } from 'resend'
import { reviewEmail } from './email-quality'

const FROM = process.env.RESEND_FROM_ADDRESS ?? 'briefing@startingmonday.app'

export async function sendEmail({
  to,
  subject,
  html,
  from,
  replyTo,
  bcc,
  headers,
}: {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
  bcc?: string
  headers?: Record<string, string>
}) {
  const issues = reviewEmail(subject, html)
  if (issues.length) {
    console.warn(JSON.stringify({
      ts: new Date().toISOString(),
      event: 'email_quality_warning',
      to,
      subject,
      issues,
    }))
  }

  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      const message = 'RESEND_API_KEY is not configured'
      console.error(JSON.stringify({
        ts: new Date().toISOString(),
        event: 'email_send_exception',
        to,
        subject,
        from: from ?? FROM,
        message,
      }))
      return {
        data: null,
        error: { message },
      }
    }

    const resend = new Resend(apiKey)
    return await resend.emails.send({ from: from ?? FROM, to, bcc, subject, html, replyTo, headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'send failed'
    console.error(JSON.stringify({
      ts: new Date().toISOString(),
      event: 'email_send_exception',
      to,
      subject,
      from: from ?? FROM,
      message,
    }))
    return {
      data: null,
      error: { message },
    }
  }
}
