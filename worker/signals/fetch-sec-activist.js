import Anthropic from '@anthropic-ai/sdk'
import { logger } from '../lib/logger.js'
import { HAIKU } from '../lib/models.js'

const EDGAR_SUBS    = 'https://data.sec.gov/submissions'
const EDGAR_ARCHIVE = 'https://www.sec.gov/Archives/edgar/data'
const HEADERS       = { 'User-Agent': 'StartingMonday/1.0 contact@startingmonday.app' }

// Funds where entry is especially high-signal for leadership change.
// When matched, we add extra context to the outreach angle.
const HIGH_SIGNAL_ACTIVISTS = new Set([
  'elliott', 'starboard', 'icahn enterprises', 'carl icahn', 'jana partners',
  'pershing square', 'third point', 'trian fund', 'trian partners', 'valueact',
  'barington capital', 'sachem head', 'inclusive capital', 'corvex',
  'engaged capital', 'blue harbour', 'legion partners', 'ancora', 'politan',
])

let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

// Scan for SC 13D / SC 13D/A filings for a company using EDGAR submissions JSON.
// Returns array of signal objects for any new filings found.
//
// Guards:
// - Only runs for public companies (sec_cik_padded must be set).
// - 7-day throttle via activist_checked_at: avoids re-fetching the submissions JSON
//   every scan day for every public company when nothing has changed.
export async function fetchActivistFilings(companyName, { supabase, companyId, activistCheckedAt }) {
  // Throttle: skip if we've checked within 7 days.
  if (activistCheckedAt) {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    if (new Date(activistCheckedAt).getTime() > sevenDaysAgo) return []
  }

  // Read cached CIK (populated by E1.1 on first EDGAR scan).
  const { data: co } = await supabase
    .from('companies')
    .select('sec_cik_padded')
    .eq('id', companyId)
    .maybeSingle()

  if (!co?.sec_cik_padded) {
    await touchCheckedAt(supabase, companyId)
    return []
  }

  const cikPadded = co.sec_cik_padded
  const cik       = cikPadded.replace(/^0+/, '')

  // Fetch the company's filing index from EDGAR.
  let f
  try {
    const res = await fetch(`${EDGAR_SUBS}/CIK${cikPadded}.json`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      await touchCheckedAt(supabase, companyId)
      return []
    }
    const data = await res.json()
    f = data.filings?.recent
  } catch (err) {
    logger.warn('fetch-sec-activist: submissions fetch failed', { company: companyName, error: err.message })
    await touchCheckedAt(supabase, companyId)
    return []
  }

  if (!f) {
    await touchCheckedAt(supabase, companyId)
    return []
  }

  // Find SC 13D and SC 13D/A filings in the past 90 days.
  const cutoff90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const candidates = []

  for (let i = 0; i < (f.form ?? []).length; i++) {
    const form = f.form[i]
    if (form !== 'SC 13D' && form !== 'SC 13D/A') continue
    const filingDate = f.filingDate?.[i]
    if (!filingDate || filingDate < cutoff90) continue
    const accession = f.accessionNumber?.[i]
    if (!accession) continue
    candidates.push({
      form,
      filingDate,
      accession,
      primaryDoc: f.primaryDocument?.[i] ?? '',
      isAmendment: form === 'SC 13D/A',
    })
  }

  await touchCheckedAt(supabase, companyId)

  if (!candidates.length) return []

  // Dedup against already-recorded filings.
  const { data: existing } = await supabase
    .from('activist_filings')
    .select('accession_number')
    .eq('company_id', companyId)
    .in('accession_number', candidates.map(c => c.accession))

  const knownAccessions = new Set((existing ?? []).map(r => r.accession_number))
  const newFilings = candidates.filter(c => !knownAccessions.has(c.accession))
  if (!newFilings.length) return []

  const signals = []

  for (const filing of newFilings) {
    // Fetch and parse the filing document to extract activist identity and intent.
    const accFormatted = filing.accession.replace(/-/g, '')
    const docUrl       = `${EDGAR_ARCHIVE}/${cik}/${accFormatted}/${filing.primaryDoc}`
    const snippet      = await fetchDocSnippet(docUrl)

    const extracted = snippet
      ? await extractActivistInfo(snippet, companyName)
      : { activist_name: null, ownership_pct: null, stated_intent: null }

    // Record in the training dataset.
    const { error: insertErr } = await supabase.from('activist_filings').insert({
      company_id:       companyId,
      accession_number: filing.accession,
      form_type:        filing.form,
      filing_date:      filing.filingDate,
      activist_name:    extracted.activist_name,
      ownership_pct:    extracted.ownership_pct,
      stated_intent:    extracted.stated_intent,
      is_amendment:     filing.isAmendment,
    })

    if (insertErr) {
      logger.warn('fetch-sec-activist: insert failed', { company: companyName, error: insertErr.message })
      continue
    }

    const name      = extracted.activist_name ?? 'An activist investor'
    const pctStr    = extracted.ownership_pct != null ? ` (${extracted.ownership_pct}% ownership)` : ''
    const isKnown   = isHighSignalActivist(extracted.activist_name)
    const knownNote = isKnown ? ` ${extracted.activist_name.split(' ')[0]} is known for forcing CEO and board changes within 12 months of a 13D filing.` : ''

    if (filing.isAmendment) {
      signals.push({
        signal_summary:  `${name} has escalated their activist position at ${companyName} via an SC 13D/A amendment${pctStr}.${knownNote} Amendments signal increasing pressure — leadership and board changes typically follow.`,
        outreach_angle:  `An amended 13D filing at ${companyName} means the activist is escalating. Executive leadership changes are likely in the next 60-90 days. Reach out before the board announces a formal search.`,
        filing_date:     filing.filingDate,
        activist_name:   extracted.activist_name,
      })
    } else {
      signals.push({
        signal_summary:  `${name} has acquired${pctStr} of ${companyName} via SC 13D.${knownNote} Activist entries at this scale frequently precede board reshuffles and CEO changes.`,
        outreach_angle:  `A new activist investor at ${companyName} compresses the timeline for leadership change. Reach out now — before the board begins a formal executive search under activist pressure.`,
        filing_date:     filing.filingDate,
        activist_name:   extracted.activist_name,
      })
    }
  }

  return signals
}

async function fetchDocSnippet(docUrl) {
  if (!docUrl || docUrl.endsWith('/')) return ''
  try {
    const res = await fetch(docUrl, { headers: HEADERS, signal: AbortSignal.timeout(8000) })
    if (!res.ok) return ''
    const html = await res.text()
    return html
      .replace(/<style\b[\s\S]*?<\/style\b[^>]*>/gi, '')
      .replace(/<script\b[\s\S]*?<\/script\b[^>]*>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 4000)
  } catch {
    return ''
  }
}

async function extractActivistInfo(snippet, companyName) {
  const prompt = `Extract activist investor information from this SEC Schedule 13D filing excerpt for ${companyName}.

Filing excerpt:
${snippet}

Return JSON only, no markdown fences:
{
  "activist_name": "Full legal name of the filing entity or person",
  "ownership_pct": number or null (percentage of shares, e.g. 7.2 for 7.2% — look for phrases like '7.2% of the outstanding shares'),
  "stated_intent": "One sentence summarizing their stated purpose or plans regarding the company"
}`

  try {
    const msg = await getClient().messages.create({
      model:      HAIKU,
      max_tokens: 256,
      messages:   [{ role: 'user', content: prompt }],
    })
    const raw     = msg.content[0]?.text?.trim() ?? '{}'
    const cleaned = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return { activist_name: null, ownership_pct: null, stated_intent: null }
  }
}

function isHighSignalActivist(name) {
  if (!name) return false
  const lower = name.toLowerCase()
  return [...HIGH_SIGNAL_ACTIVISTS].some(a => lower.includes(a))
}

async function touchCheckedAt(supabase, companyId) {
  await supabase
    .from('companies')
    .update({ activist_checked_at: new Date().toISOString() })
    .eq('id', companyId)
}
