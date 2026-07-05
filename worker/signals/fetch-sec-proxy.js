import Anthropic from '@anthropic-ai/sdk'
import { logger } from '../lib/logger.js'
import { HAIKU } from '../lib/models.js'

const EDGAR_SUBS    = 'https://data.sec.gov/submissions'
const EDGAR_ARCHIVE = 'https://www.sec.gov/Archives/edgar/data'
const HEADERS       = { 'User-Agent': 'StartingMonday/1.0 contact@startingmonday.app' }

let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

// Diff the current proxy's board composition against the prior snapshot.
// Returns array of { changeType, directorName, directorTitle, signal_summary, outreach_angle }
// for any departures or additions detected.
//
// Guards:
// - Only runs for companies with a resolved sec_cik_padded (public companies).
// - Skips if the company's most recent board snapshot was taken within 90 days.
//   DEF 14A is filed annually; checking more often is wasteful.
export async function fetchProxyBoardChanges(companyName, { supabase, companyId }) {
  const cutoff90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Skip if we have a recent snapshot — avoids re-processing the same proxy.
  const { data: recentSnap } = await supabase
    .from('board_snapshots')
    .select('snapshot_date')
    .eq('company_id', companyId)
    .gte('snapshot_date', cutoff90)
    .limit(1)
    .maybeSingle()

  if (recentSnap) return []

  // Fetch CIK from companies table (cached by E1.1 — no extra EDGAR lookup needed).
  const { data: co } = await supabase
    .from('companies')
    .select('sec_cik_padded')
    .eq('id', companyId)
    .maybeSingle()

  if (!co?.sec_cik_padded) return []

  const cikPadded = co.sec_cik_padded
  const cik       = cikPadded.replace(/^0+/, '')

  // Find the most recent DEF 14A in the submissions index.
  let latestProxy = null
  try {
    const res = await fetch(`${EDGAR_SUBS}/CIK${cikPadded}.json`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []

    const data = await res.json()
    const f    = data.filings?.recent
    if (!f) return []

    for (let i = 0; i < (f.form ?? []).length; i++) {
      if (f.form[i] !== 'DEF 14A') continue
      latestProxy = {
        filingDate:  f.filingDate?.[i],
        accession:   f.accessionNumber?.[i],
        primaryDoc:  f.primaryDocument?.[i],
      }
      break // submissions are reverse-chronological
    }
  } catch (err) {
    logger.warn('fetch-sec-proxy: submissions fetch failed', { company: companyName, error: err.message })
    return []
  }

  if (!latestProxy?.accession || !latestProxy?.primaryDoc) return []

  // Skip if we've already processed this exact filing.
  const { data: existingSnap } = await supabase
    .from('board_snapshots')
    .select('id')
    .eq('company_id', companyId)
    .eq('accession_number', latestProxy.accession)
    .maybeSingle()

  if (existingSnap) return []

  // Fetch the proxy document and extract directors via Claude Haiku.
  const accFormatted = latestProxy.accession.replace(/-/g, '')
  const docUrl       = `${EDGAR_ARCHIVE}/${cik}/${accFormatted}/${latestProxy.primaryDoc}`
  const snippet      = await fetchProxySnippet(docUrl)
  if (!snippet) return []

  const directors = await extractDirectors(snippet, companyName)
  if (!directors.length) return []

  // Fetch the previous snapshot to diff against.
  const { data: prevSnap } = await supabase
    .from('board_snapshots')
    .select('id, directors')
    .eq('company_id', companyId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Save the new snapshot.
  const snapshotDate = latestProxy.filingDate ?? new Date().toISOString().split('T')[0]
  const { data: newSnap } = await supabase
    .from('board_snapshots')
    .upsert(
      {
        company_id:       companyId,
        snapshot_date:    snapshotDate,
        directors,
        proxy_year:       latestProxy.filingDate ? new Date(latestProxy.filingDate).getFullYear() : null,
        filing_date:      latestProxy.filingDate ?? null,
        accession_number: latestProxy.accession,
      },
      { onConflict: 'company_id,accession_number' }
    )
    .select('id')
    .maybeSingle()

  // Nothing to diff against on the first snapshot.
  if (!prevSnap?.directors?.length) return []

  const prevNames = new Set(prevSnap.directors.map(d => normalizeName(d.name)))
  const currNames = new Set(directors.map(d => normalizeName(d.name)))

  const changes = []

  for (const dir of prevSnap.directors) {
    if (!currNames.has(normalizeName(dir.name))) {
      changes.push({ changeType: 'departure', directorName: dir.name, directorTitle: dir.title ?? 'Director' })
    }
  }
  for (const dir of directors) {
    if (!prevNames.has(normalizeName(dir.name))) {
      changes.push({ changeType: 'addition', directorName: dir.name, directorTitle: dir.title ?? 'Director' })
    }
  }

  if (!changes.length) return []

  // Record in board_changes table for the historical training set.
  if (newSnap?.id) {
    await supabase.from('board_changes').insert(
      changes.map(c => ({
        company_id:    companyId,
        snapshot_id:   newSnap.id,
        change_type:   c.changeType,
        director_name: c.directorName,
        director_title: c.directorTitle,
      }))
    )
  }

  // Build signal objects for signal-job to write.
  return changes.map(c => {
    if (c.changeType === 'departure') {
      return {
        ...c,
        signal_summary: `${c.directorName} departed the board of ${companyName}. Board-level turnover often precedes or accompanies CEO transitions and major strategic shifts.`,
        outreach_angle: `A board departure at ${companyName} frequently opens governance-level conversations. Reach out now — before the company announces strategic changes that follow the reshuffle.`,
      }
    }
    return {
      ...c,
      signal_summary: `${companyName} added ${c.directorName} to its board${c.directorTitle !== 'Director' ? ` as ${c.directorTitle}` : ''}. New board members signal a strategic refresh and often bring new executive relationships.`,
      outreach_angle: `A new board member at ${companyName} often reshapes the leadership agenda in their first 90 days. This is a strong moment to introduce yourself before the new executive search process begins.`,
    }
  })
}

// Fetch the DEF 14A document and extract the section most likely to contain the director table.
async function fetchProxySnippet(docUrl) {
  try {
    const res = await fetch(docUrl, { headers: HEADERS, signal: AbortSignal.timeout(15000) })
    if (!res.ok) return ''

    const html = await res.text()
    const text = html
      .replace(/<style\b[\s\S]*?<\/style\b[^>]*>/gi, '')
      .replace(/<script\b[\s\S]*?<\/script\b[^>]*>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // Find the section most likely to contain director/nominee information.
    const lower = text.toLowerCase()
    const anchors = [
      'nominees for director',
      'director nominees',
      'election of directors',
      'information about the nominees',
      'information about directors',
      'board of directors',
    ]

    let startIdx = -1
    for (const anchor of anchors) {
      const idx = lower.indexOf(anchor)
      if (idx !== -1) {
        startIdx = Math.max(0, idx - 100)
        break
      }
    }

    // Fall back to document start if no anchor found.
    if (startIdx === -1) startIdx = 0

    return text.slice(startIdx, startIdx + 6000)
  } catch (err) {
    logger.warn('fetch-sec-proxy: doc fetch failed', { url: docUrl, error: err.message })
    return ''
  }
}

// Use Claude Haiku to extract a structured director list from the proxy text.
async function extractDirectors(snippet, companyName) {
  const prompt = `Extract the board of directors from this SEC DEF 14A (proxy statement) excerpt for ${companyName}.

Proxy excerpt:
${snippet}

Return JSON only, no markdown fences:
{
  "directors": [
    {
      "name": "Full Name",
      "title": "e.g. Independent Director, Chairman, Lead Independent Director",
      "independent": true or false,
      "tenure_years": number or null,
      "committees": ["Audit", "Compensation"] or []
    }
  ]
}

Rules:
- Include only board members (directors and nominees), not executives who are not on the board.
- If a person holds both a board seat and an officer role (e.g. CEO who is also a director), include them.
- Return {"directors": []} if no clear director list is visible in this excerpt.`

  try {
    const msg = await getClient().messages.create({
      model:      HAIKU,
      max_tokens: 1000,
      messages:   [{ role: 'user', content: prompt }],
    })

    const raw     = msg.content[0]?.text?.trim() ?? '{}'
    const cleaned = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()
    const result  = JSON.parse(cleaned)

    return (result.directors ?? []).filter(d => d.name?.trim())
  } catch (err) {
    logger.warn('fetch-sec-proxy: extraction failed', { company: companyName, error: err.message })
    return []
  }
}

function normalizeName(name) {
  return (name ?? '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
