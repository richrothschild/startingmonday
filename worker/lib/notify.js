import { sendEmail } from './send-email.js'
import { logger } from './logger.js'

// Notification channels: 'email' is live. 'sms' is stubbed — add Twilio to enable.
//
// To enable SMS:
//   1. npm install twilio  (in worker/)
//   2. Set env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, NOTIFY_PHONE_NUMBER
//   3. Uncomment the sms block below
//   4. Add 'sms' to NOTIFY_CHANNELS env var (e.g. "email,sms")

export async function notify({ subject, body }) {
  const channels = (process.env.NOTIFY_CHANNELS ?? 'email').split(',').map(s => s.trim())
  const to = process.env.NOTIFY_EMAIL

  if (!to) {
    logger.warn('notify: NOTIFY_EMAIL not set — skipping notification', { subject })
    return
  }

  const tasks = []

  if (channels.includes('email')) {
    tasks.push(
      sendEmail({
        to,
        subject: `[Starting Monday] ${subject}`,
        text: body,
      }).catch(err => logger.error('notify: email failed', { error: err.message }))
    )
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

  await Promise.allSettled(tasks)
}
