import { Resend } from 'resend'
import { reviewEmail } from './email-quality'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_ADDRESS ?? 'briefing@startingmonday.app'

export async function sendEmail({
  to,
  subject,
  html,
  from,
  replyTo,
}: {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
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
    return await resend.emails.send({ from: from ?? FROM, to, subject, html, replyTo })
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
