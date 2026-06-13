import { logger } from './logger.js'

export async function sendWorkerSlackAlert(text) {
  if (!text || typeof text !== 'string') return { ok: false, error: 'missing message text' }

  const webhook = process.env.SLACK_WEBHOOK_URL
  if (webhook) {
    try {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!response.ok) {
        return { ok: false, error: `Slack webhook failed (${response.status})` }
      }
      return { ok: true }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Slack webhook call failed'
      logger.warn('worker-slack-alert: webhook call failed', { error: msg })
      return { ok: false, error: msg }
    }
  }

  const token = process.env.SLACK_BOT_TOKEN ?? process.env.SLACK_USER_TOKEN ?? process.env.SLACK_TOKEN
  const channel = process.env.SLACK_ALERT_CHANNEL_ID ?? process.env.SLACK_CHANNEL_ID
  if (!token || !channel) {
    return { ok: false, error: 'Slack not configured' }
  }

  try {
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channel, text }),
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: `Slack API failed (${response.status}) ${payload?.error ?? ''}`.trim() }
    }

    return { ok: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Slack API call failed'
    logger.warn('worker-slack-alert: token call failed', { error: msg })
    return { ok: false, error: msg }
  }
}
