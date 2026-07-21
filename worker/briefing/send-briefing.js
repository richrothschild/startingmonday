import { logger } from '../lib/logger.js'
import { reviewEmail } from '../lib/email-quality.js'
import { shouldSuppressAutomatedEmail } from '../lib/automated-email-policy.js'

export async function sendBriefing({ to, subject, html }) {
  const policy = shouldSuppressAutomatedEmail({ to, category: 'briefing' })
  if (policy.suppress) {
    logger.info('send-briefing: suppressed by automated email policy', { to, subject, reason: policy.reason })
    return { suppressed: true, reason: policy.reason }
  }

  const issues = reviewEmail(subject, html)
  if (issues.length) {
    logger.warn('send-briefing: quality warning', { event: 'email_quality_warning', to, subject, issues })
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
      html,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Resend ${res.status}: ${body.slice(0, 200)}`)
  }

  const data = await res.json()
  logger.info('send-briefing: delivered', { to, messageId: data.id })
  return data
}
