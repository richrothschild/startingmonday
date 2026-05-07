import Anthropic from '@anthropic-ai/sdk'
import { HAIKU } from '../lib/models.js'

let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

// Detect meaningful patterns across a company's recent signals.
// Returns { detected, pattern_name, pattern_summary, outreach_angle } or { detected: false }.
export async function correlateSignals(companyName, signals, roleType = null) {
  if (signals.length < 2) return { detected: false }

  const signalList = signals
    .slice(0, 10)
    .map(s => `- ${s.signal_type} (${s.signal_date}): ${s.signal_summary}`)
    .join('\n')

  const roleContext = roleType
    ? `The candidate is a ${roleType.toUpperCase().replace('_', '/')} executive job seeker.`
    : 'The candidate is a C-suite or VP-level executive job seeker.'

  const prompt = `You are analyzing a cluster of recent signals about "${companyName}" to determine if they form a meaningful pattern for an executive job seeker.

${roleContext}

Signals (past 60 days):
${signalList}

Determine if these signals together tell a coherent story stronger than any single signal alone. Meaningful patterns include:
- Leadership Transition: exec departures plus new hires (opening for external candidates)
- Growth Phase: funding plus exec hires or expansion (mandate for scale-builders)
- Digital Transformation: CIO/CTO hire plus tech or product announcements (change agent mandate)
- Distress or Restructuring: layoffs plus exec departure or acquisition (turnaround opportunity)
- Pre-IPO Buildup: late-stage funding plus exec hires and expansion (need public-company operators)

Output JSON only, no markdown fences:
{
  "detected": true or false,
  "pattern_name": "short name, e.g. Leadership Transition",
  "pattern_summary": "Two sentences: what is happening and why it matters right now.",
  "outreach_angle": "One sentence: what makes this the right moment to reach out."
}

Set detected=false if the signals are unrelated, weak, or fewer than two are strong. Only set detected=true when the pattern meaningfully raises the opportunity or urgency for an executive candidate.`

  try {
    const msg = await getClient().messages.create({
      model: HAIKU,
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = msg.content[0]?.text?.trim() ?? '{}'
    const cleaned = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()
    return JSON.parse(cleaned)
  } catch (err) {
    const { logger } = await import('../lib/logger.js')
    logger.warn('correlate-signals: failed', { company: companyName, error: err.message })
    return { detected: false }
  }
}
