import Anthropic from '@anthropic-ai/sdk'
import { HAIKU } from '../lib/models.js'

let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

const SIGNAL_PRIORITIES = {
  cio:          'Leadership changes in technology functions, digital transformation announcements, and IT investment decisions are high-priority signals for this candidate.',
  cto:          'Engineering leadership changes, product launches, funding rounds with engineering buildout, and technical architecture announcements are high-priority signals.',
  cdo_data:     'data_platform and ai_investment signals are the highest priority for this candidate. Also flag Chief Data or AI Officer appointments, data governance regulatory changes, and analytics infrastructure announcements.',
  cdo_digital:  'Digital transformation announcements, customer experience investments, and e-commerce or omnichannel initiatives are high-priority signals.',
  ciso:         'breach_disclosure and regulatory_change signals are the highest priority for this candidate. Also flag CISO departures, compliance deadline announcements, and any board-level governance change that elevates security accountability.',
  cpo:          'Product launches and pivots, competitor feature announcements, product leadership changes, and app store or review rating movements are high-priority signals.',
  coo:          'M&A announcements, revenue pressure or EBITDA signals, operational leadership changes, and CEO changes are the highest-priority signals for this candidate.',
  vp_technology:'Technology leadership changes, CIO or CTO role openings, and technology transformation announcements are high-priority signals.',
}

// Classifies a news article as a hiring-relevant signal using Claude Haiku.
// Returns { is_signal, signal_type, confidence, signal_summary, outreach_angle }
export async function classifySignal(companyName, article, roleType = null) {
  const signalPriority = roleType ? (SIGNAL_PRIORITIES[roleType] ?? '') : ''
  const prompt = `You are analyzing a news article about "${companyName}" to determine if it is a meaningful signal for an executive job seeker targeting this company.

Article title: ${article.title}
Description: ${article.description || '(none)'}
Published: ${article.pubDate || 'unknown'}${signalPriority ? `\n\nCandidate context: ${signalPriority}` : ''}

Output JSON only, no markdown fences:
{
  "is_signal": true or false,
  "signal_type": one of: funding, exec_departure, exec_hire, acquisition, expansion, layoffs, ipo, new_product, award, breach_disclosure, regulatory_change, data_platform, ai_investment, or null if not a signal,
  "confidence": integer 0-100,
  "signal_summary": "one factual sentence describing what happened - specific, no filler",
  "outreach_angle": "one sentence on how this news creates an opening for an executive candidate - concrete and specific to this signal type"
}

Strong signals (set is_signal=true): funding rounds, executive departures or new hires, acquisitions, market expansion, layoffs (which often precede leadership restructuring), IPO filings, major product launches, security breaches or data incidents (breach_disclosure), new compliance or regulatory requirements affecting the company's sector (regulatory_change), data infrastructure investments such as Snowflake, Databricks, or data lakehouse announcements (data_platform), AI initiative announcements or AI leadership hires (ai_investment).
Weak or no signal: general earnings coverage, minor partnerships, routine product updates, industry commentary not specific to this company.
Confidence below 60 means you are uncertain this is actually about the named company or genuinely newsworthy.`

  try {
    const message = await getClient().messages.create({
      model: HAIKU,
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = message.content[0]?.text?.trim() ?? '{}'
    const cleaned = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()
    return JSON.parse(cleaned)
  } catch (err) {
    const logger = (await import('../lib/logger.js')).logger
    logger.warn('classify-signal: failed', { company: companyName, error: err.message })
    return { is_signal: false }
  }
}
