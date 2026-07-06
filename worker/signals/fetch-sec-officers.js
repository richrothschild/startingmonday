// DEF 14A officer-table extraction and year-over-year diffing (T2.4).
// Snapshots executive officers per proxy filing; a name present in the latest
// snapshot but not the prior one is an appointment — retroactive proof a
// leadership search concluded.

import Anthropic from '@anthropic-ai/sdk'
import { HAIKU } from '../lib/models.js'
import { logger } from '../lib/logger.js'

const EDGAR_SUBS = 'https://data.sec.gov/submissions'
const EDGAR_ARCHIVE = 'https://www.sec.gov/Archives/edgar/data'
const HEADERS = { 'User-Agent': 'StartingMonday/1.0 contact@startingmonday.app' }
const SNIPPET_CHARS = 40000

let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

// Pure: diff two officer lists by normalized name. Returns appointments
// (in latest, not in previous). Strips credentials and generational suffixes
// so "Jane Smith, Ph.D." matches "Jane Smith".
const NAME_SUFFIXES = new Set(['phd', 'md', 'jd', 'cpa', 'mba', 'esq', 'jr', 'sr', 'ii', 'iii', 'iv'])

export function diffOfficerSnapshots(previousOfficers, latestOfficers) {
  const normalize = name => (name ?? '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token && !NAME_SUFFIXES.has(token))
    .join(' ')
  const previousNames = new Set((previousOfficers ?? []).map(o => normalize(o.name)).filter(Boolean))
  return (latestOfficers ?? []).filter(o => {
    const n = normalize(o.name)
    return n && !previousNames.has(n)
  })
}

async function fetchDocText(url) {
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(10000) })
    if (!res.ok) return null
    const html = await res.text()
    return html
      .replace(/<style\b[\s\S]*?<\/style\b[^>]*>/gi, ' ')
      .replace(/<script\b[\s\S]*?<\/script\b[^>]*>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, SNIPPET_CHARS)
  } catch {
    return null
  }
}

async function extractOfficers(snippet, companyName) {
  const prompt = `From this SEC DEF 14A proxy statement excerpt for ${companyName}, extract the EXECUTIVE OFFICERS (not the board of directors) — typically listed in an "Executive Officers" or "Named Executive Officers" section with their titles.

Excerpt:
${snippet}

Output a JSON array only, no markdown fences:
[{"name": "Full Name", "title": "Exact title as stated"}]
Include only individuals explicitly identified as executive officers with a title. If none are identifiable, output [].`

  try {
    const message = await getClient().messages.create({
      model: HAIKU,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (message.content[0]?.text ?? '[]').trim()
      .replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()
    // The model sometimes wraps the array in prose or trails commentary after
    // it; extract the outermost JSON array before parsing.
    const start = raw.indexOf('[')
    const end = raw.lastIndexOf(']')
    const jsonText = start !== -1 && end > start ? raw.slice(start, end + 1) : raw
    const parsed = JSON.parse(jsonText)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(o => o?.name && o?.title)
      .map(o => ({ name: String(o.name), title: String(o.title) }))
      .slice(0, 30)
  } catch (err) {
    logger.warn('sec-officers: extraction failed', { company: companyName, error: err.message })
    return []
  }
}

// Fetches and snapshots the two most recent DEF 14A officer tables for a CIK,
// then diffs them. Returns { appointments: [{name, title}], filingDate } or
// { appointments: [] } when fewer than two snapshots exist.
export async function getOfficerAppointments(supabase, { cikPadded, companyName }) {
  if (!cikPadded) return { appointments: [] }

  try {
    const res = await fetch(`${EDGAR_SUBS}/CIK${cikPadded}.json`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return { appointments: [] }
    const data = await res.json()
    const f = data.filings?.recent
    if (!f) return { appointments: [] }

    const proxies = []
    for (let i = 0; i < (f.form ?? []).length && proxies.length < 2; i++) {
      if (f.form[i] !== 'DEF 14A') continue
      proxies.push({
        filingDate: f.filingDate?.[i],
        accession: f.accessionNumber?.[i],
        primaryDoc: f.primaryDocument?.[i],
      })
    }
    if (proxies.length < 2) return { appointments: [] }

    const cik = cikPadded.replace(/^0+/, '')
    const snapshots = []
    for (const proxy of proxies) {
      if (!proxy.accession || !proxy.primaryDoc) continue

      const { data: existing } = await supabase
        .from('officer_snapshots')
        .select('id, officers, filing_date')
        .eq('sec_cik_padded', cikPadded)
        .eq('accession_number', proxy.accession)
        .maybeSingle()

      if (existing) {
        snapshots.push({ officers: existing.officers ?? [], filingDate: existing.filing_date })
        continue
      }

      const accFormatted = proxy.accession.replace(/-/g, '')
      const snippet = await fetchDocText(`${EDGAR_ARCHIVE}/${cik}/${accFormatted}/${proxy.primaryDoc}`)
      if (!snippet) continue

      const officers = await extractOfficers(snippet, companyName)
      await supabase
        .from('officer_snapshots')
        .upsert(
          {
            sec_cik_padded: cikPadded,
            accession_number: proxy.accession,
            filing_date: proxy.filingDate ?? null,
            officers,
          },
          { onConflict: 'sec_cik_padded,accession_number' }
        )
      snapshots.push({ officers, filingDate: proxy.filingDate })
    }

    if (snapshots.length < 2) return { appointments: [] }

    // snapshots[0] is latest, snapshots[1] is previous (reverse-chronological).
    const appointments = diffOfficerSnapshots(snapshots[1].officers, snapshots[0].officers)
    return { appointments, filingDate: snapshots[0].filingDate ?? null }
  } catch (err) {
    logger.warn('sec-officers: appointment diff failed', { cikPadded, error: err.message })
    return { appointments: [] }
  }
}
