import { sendEmail } from './send-email.js'
import { logger } from './logger.js'

// Notification channels: 'email' is live. 'sms' is stubbed — add Twilio to enable.
// Slack is also supported via either incoming webhook or chat.postMessage token.
//
// To enable SMS:
//   1. npm install twilio  (in worker/)
//   2. Set env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, NOTIFY_PHONE_NUMBER
//   3. Uncomment the sms block below
//   4. Add 'sms' to NOTIFY_CHANNELS env var (e.g. "email,sms")

async function sendSlack({ subject, body }) {
  const text = `*Starting Monday Alert*\n*${subject}*\n${body}`

  const webhook = process.env.SLACK_WEBHOOK_URL
  if (webhook) {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) throw new Error(`Slack webhook failed (${res.status})`)
    return
  }

  const token = process.env.SLACK_BOT_TOKEN || process.env.SLACK_USER_TOKEN
  const channel = process.env.SLACK_ALERT_CHANNEL_ID || process.env.SLACK_CHANNEL_ID
  if (!token || !channel) {
    throw new Error('Slack is not configured (set SLACK_WEBHOOK_URL or SLACK_BOT_TOKEN/SLACK_USER_TOKEN + SLACK_ALERT_CHANNEL_ID)')
  }

  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channel, text }),
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.ok) {
    throw new Error(`Slack API failed (${res.status}) ${json.error ?? ''}`.trim())
  }
}

export async function notify({ subject, body }) {
  const channels = (process.env.NOTIFY_CHANNELS ?? 'email').split(',').map(s => s.trim().toLowerCase())
  const to = process.env.NOTIFY_EMAIL

  const tasks = []

  if (channels.includes('email')) {
    if (!to) {
      logger.warn('notify: email channel enabled but NOTIFY_EMAIL not set', { subject })
    } else {
      tasks.push(
        sendEmail({
          to,
          subject: `[Starting Monday] ${subject}`,
          text: body,
        }).catch(err => logger.error('notify: email failed', { error: err.message }))
      )
    }
  }

  if (channels.includes('sms')) {
    // Uncomment when Twilio credentials are configured:
    // const twilio = new (await import('twilio')).default(
    //   process.env.TWILIO_ACCOUNT_SID,
    //   process.env.TWILIO_AUTH_TOKEN
    // )
    // tasks.push(
    //   twilio.messages.create({
    //     body: `[Starting Monday] ${subject}\n${body.slice(0, 140)}`,
    //     from: process.env.TWILIO_FROM_NUMBER,
    //     to: process.env.NOTIFY_PHONE_NUMBER,
    //   }).catch(err => logger.error('notify: sms failed', { error: err.message }))
    // )
    logger.warn('notify: sms channel configured but Twilio is not wired up yet')
  }

  if (channels.includes('slack')) {
    tasks.push(
      sendSlack({ subject, body }).catch(err => logger.error('notify: slack failed', { error: err.message }))
    )
  }

  if (!tasks.length) {
    logger.warn('notify: no enabled/usable channels', { subject })
    return
  }

  await Promise.allSettled(tasks)
}
