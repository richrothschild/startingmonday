import Anthropic from '@anthropic-ai/sdk'
import { HAIKU } from '../lib/models.js'

let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

const ITEM_MEANINGS = {
  '1.01': 'Entry into Material Agreement (major deal or contract)',
  '1.02': 'Termination of Material Agreement',
  '1.03': 'Bankruptcy or Receivership Filing',
  '2.01': 'Completion of Acquisition or Disposition',
  '2.02': 'Results of Operations / Earnings Release',
  '2.06': 'Material Impairment',
  '5.02': 'Executive or Director Departure / Appointment',
  '7.01': 'Regulation FD Disclosure',
  '8.01': 'Other Material Events',
}

// Query stored 8-K filing history and detect cross-filing trends using Claude Haiku.
// Returns { signal_type: 'filing_trend', signal_summary, outreach_angle } or null.
export async function detectSecTrends(supabase, companyId, companyName, roleType = null) {
  const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: filings } = await supabase
    .from('sec_filings')
    .select('filing_date, items')
    .eq('company_id', companyId)
    .gte('filing_date', yearAgo)
    .order('filing_date', { ascending: true })

  // Need at least 3 filings to detect a meaningful trend
  if (!filings || filings.length < 3) return null

  const filingList = filings
    .map(f => {
      const itemDescs = (f.items ?? [])
        .map(code => `${code} (${ITEM_MEANINGS[code] ?? 'Other'})`)
        .join(', ')
      return `- ${f.filing_date}: ${itemDescs || '(no items listed)'}`
    })
    .join('\n')

  const roleContext = roleType
    ? `The candidate is a ${roleType.toUpperCase().replace(/_/g, '/')} executive job seeker.`
    : 'The candidate is a C-suite or VP-level executive job seeker.'

  const prompt = `You are analyzing a company's SEC 8-K filing history to detect meaningful trends for an executive job seeker.

Company: "${companyName}"
${roleContext}

8-K filing history (chronological, past 12 months — ${filings.length} total):
${filingList}

Detect the most significant trend. Only flag a trend if the pattern across multiple filings tells a materially different story than any single filing would. Strong patterns:
- Repeated 5.02 filings: deliberate leadership refresh or instability — transformation executive search likely
- 1.01 followed by 2.01: completed deal cycle — integration leadership mandate is next
- Multiple 1.01 filings in a short window: active deal-making phase — operational leadership gap forming
- Any sequence ending in 1.03: financial distress trajectory — turnaround opportunity
- Escalating severity or accelerating frequency: company in active transition

Output JSON only, no markdown fences:
{
  "trend_detected": true or false,
  "trend_name": "short name for the pattern, e.g. Leadership Refresh Cycle or Deal Completion Sequence",
  "signal_summary": "Two sentences: what pattern is emerging across these filings and what it signals for this company's leadership trajectory.",
  "outreach_angle": "One sentence: why this trend creates a specific opportunity for an executive candidate right now."
}

Set trend_detected=false if fewer than three filings form a coherent pattern or if the filings are routine disclosures with no directional signal.`

  try {
    const msg = await getClient().messages.create({
      model: HAIKU,
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = msg.content[0]?.text?.trim() ?? '{}'
    const cleaned = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()
    const result = JSON.parse(cleaned)

    if (!result.trend_detected || !result.signal_summary) return null

    return {
      signal_type:   'filing_trend',
      signal_summary: result.trend_name
        ? `${result.trend_name}: ${result.signal_summary}`
        : result.signal_summary,
      outreach_angle: result.outreach_angle ?? null,
    }
  } catch (err) {
    const { logger } = await import('../lib/logger.js')
    logger.warn('detect-sec-trends: failed', { company: companyName, error: err.message })
    return null
  }
}
