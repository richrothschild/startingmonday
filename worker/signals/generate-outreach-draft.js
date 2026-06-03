import Anthropic from '@anthropic-ai/sdk'
import { logger } from '../lib/logger.js'

let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

const SYSTEM =
  'You are a senior executive coach drafting a cold outreach email. ' +
  'The email should be 3-4 sentences maximum. Specific, not generic. ' +
  'Reference the triggering event directly. Sound like a peer, not an applicant. ' +
  'No em dashes. No bullet points. No motivational language. ' +
  'Respond only with valid JSON: {"subject": "...", "body": "..."}'

export async function generateOutreachDraft({ companyName, signalType, signalSummary, outreachAngle, userProfile, companyContext = null }) {
  const name       = userProfile?.full_name ?? 'the executive'
  const title      = userProfile?.current_title ?? null
  const positioning = userProfile?.positioning_summary ?? null
  const targets    = (userProfile?.target_titles ?? []).join(', ') || null

  const sector       = companyContext?.sector ?? null
  const notes        = companyContext?.notes ?? null
  const roleWatch    = companyContext?.roleWatchDescription ?? null

  const prompt = `Draft a short cold outreach email for an executive to send after this signal.

SIGNAL
Company: ${companyName}${sector ? ` (${sector})` : ''}
Type: ${signalType.replace(/_/g, ' ')}
Summary: ${signalSummary}${outreachAngle ? `\nOutreach angle: ${outreachAngle}` : ''}

COMPANY CONTEXT${notes ? `\nResearch notes: ${notes}` : ''}${roleWatch ? `\nWhat I am targeting here: ${roleWatch}` : ''}${!notes && !roleWatch ? '\nNo additional context available.' : ''}

SENDER
Name: ${name}${title ? `\nCurrent/recent title: ${title}` : ''}${targets ? `\nTargeting: ${targets}` : ''}${positioning ? `\nPositioning: ${positioning}` : ''}

Write a subject line and 3-4 sentence email body. The email should:
- Open with direct reference to the specific signal (not a generic opener)
- Weave in any relevant company context naturally — do not list or quote the research notes verbatim
- State who the sender is in one clause, not a paragraph
- Propose a brief conversation, not a job ask
- Sound like a peer reaching out, not a candidate applying

JSON only. No markdown.`

  try {
    const response = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = response.content[0].text.trim()
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0]
    if (!jsonStr) return null
    const parsed = JSON.parse(jsonStr)
    if (!parsed.subject || !parsed.body) return null
    return { subject: parsed.subject, body: parsed.body }
  } catch (err) {
    logger.error('generate-outreach-draft: failed', { companyName, error: err.message })
    return null
  }
}
