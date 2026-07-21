import { logger } from './logger.js'
import { reviewEmail } from './email-quality.js'
import { shouldSuppressAutomatedEmail } from './automated-email-policy.js'

// Generic single-email sender via Resend.
// For the daily briefing HTML emails use worker/briefing/send-briefing.js instead.
export async function sendEmail({ to, subject, html, text, category = 'general' }) {
  const policy = shouldSuppressAutomatedEmail({ to, category })
  if (policy.suppress) {
    logger.info('send-email: suppressed by automated email policy', { to, subject, category, reason: policy.reason })
    return { suppressed: true, reason: policy.reason }
  }

  const body = html ?? `<pre style="font-family:sans-serif;white-space:pre-wrap">${text ?? ''}</pre>`

  const issues = reviewEmail(subject, body)
  if (issues.length) {
    logger.warn('send-email: quality warning', { event: 'email_quality_warning', to, subject, issues })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_ADDRESS,
      to,
      subject,
      html: body,
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`Resend ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  logger.info('send-email: delivered', { to, subject, messageId: data.id })
  return data
}
