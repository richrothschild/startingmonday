type SendSlackMessageInput = {
  text: string
}

// Sends a direct message to the owner when SLACK_BOT_TOKEN + SLACK_DM_USER_ID are set.
// Falls back to the standard channel/webhook path so the notification is never dropped.
export async function sendSlackDM(input: SendSlackMessageInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = process.env.SLACK_BOT_TOKEN ?? process.env.SLACK_USER_TOKEN ?? process.env.SLACK_TOKEN
  const dmUserId = process.env.SLACK_DM_USER_ID ?? process.env.SLACK_OWNER_USER_ID

  if (token && dmUserId) {
    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel: dmUserId, text: input.text }),
      })
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (response.ok && payload.ok) {
        return { ok: true }
      }
    } catch {
      // fall through to channel/webhook fallback
    }
  }

  return sendSlackMessage(input)
}


export async function sendSlackMessage(input: SendSlackMessageInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const webhook = process.env.SLACK_WEBHOOK_URL
  if (webhook) {
    try {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.text }),
      })
      if (!response.ok) {
        return { ok: false, error: `Slack webhook failed (${response.status})` }
      }
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Slack webhook failed' }
    }
  }

  const token = process.env.SLACK_BOT_TOKEN ?? process.env.SLACK_USER_TOKEN ?? process.env.SLACK_TOKEN
  const channel = process.env.SLACK_ALERT_CHANNEL_ID ?? process.env.SLACK_CHANNEL_ID
  if (!token || !channel) {
    return { ok: false, error: 'Slack not configured (set SLACK_WEBHOOK_URL or SLACK_BOT_TOKEN/SLACK_USER_TOKEN/SLACK_TOKEN + SLACK_ALERT_CHANNEL_ID)' }
  }

  try {
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channel, text: input.text }),
    })
    const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string }
    if (!response.ok || !payload.ok) {
      return { ok: false, error: `Slack API failed (${response.status}) ${payload.error ?? ''}`.trim() }
    }
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Slack API call failed' }
  }
}
