import { Resend } from 'resend'
import { reviewEmail } from './email-quality'
import { autoRefineEmailDraft, logEmailCouncilScore, type EmailCouncilChannel } from './email-council'

const FROM = process.env.RESEND_FROM_ADDRESS ?? 'briefing@startingmonday.app'

export async function sendEmail({
  to,
  subject,
  html,
  channel,
  from,
  replyTo,
  bcc,
  headers,
}: {
  to: string
  subject: string
  html: string
  channel?: EmailCouncilChannel
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

  const minCouncilScore = Number(process.env.EMAIL_COUNCIL_MIN_SCORE ?? '90')
  const refined = autoRefineEmailDraft({
    channel: channel ?? 'general',
    subject,
    html,
    minEjes: Number.isFinite(minCouncilScore) ? minCouncilScore : 90,
    maxPasses: 2,
  })

  if (!refined.passesAfterRefine) {
    await logEmailCouncilScore({
      to,
      channel: channel ?? 'general',
      subject: refined.refinedSubject,
      scores: refined.evaluation.scores,
      blocked: true,
      blockers: refined.evaluation.blockers,
      warnings: refined.evaluation.warnings,
    })

    const message = `Blocked by email council gate: EJES ${refined.evaluation.scores.ejes} < ${minCouncilScore}`
    console.error(JSON.stringify({
      ts: new Date().toISOString(),
      event: 'email_send_blocked_by_council',
      to,
      channel: channel ?? 'general',
      subject,
      message,
      blockers: refined.evaluation.blockers,
    }))

    return {
      data: null,
      error: { message },
    }
  }

  await logEmailCouncilScore({
    to,
    channel: channel ?? 'general',
    subject: refined.refinedSubject,
    scores: refined.evaluation.scores,
    blocked: false,
    blockers: [],
    warnings: refined.evaluation.warnings,
  })

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
    return await resend.emails.send({ from: from ?? FROM, to, bcc, subject: refined.refinedSubject, html: refined.refinedHtml, replyTo, headers })
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
