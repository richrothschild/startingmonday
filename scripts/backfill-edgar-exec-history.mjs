/**
 * E3.2: EDGAR 8-K Item 5.02 historical backfill
 *
 * Scans EDGAR for 8-K filings with Item 5.02 (Departure/Appointment of Officers)
 * and populates executive_profiles + executive_positions with 10 years of history.
 * This is the primary training data source for the departure-prediction model.
 *
 * Usage:
 *   node --env-file=../.env.local scripts/backfill-edgar-exec-history.mjs [options]
 *   node --env-file=../.env.local scripts/backfill-edgar-exec-history.mjs --year 2024
 *   node --env-file=../.env.local scripts/backfill-edgar-exec-history.mjs --start 2024-01-01 --end 2024-06-30
 *
 * Options:
 *   --year YYYY         Process a single calendar year (default: current year - 1)
 *   --start YYYY-MM-DD  Custom start date (overrides --year)
 *   --end YYYY-MM-DD    Custom end date (overrides --year)
 *   --limit N           Stop after N filings (useful for testing, default: unlimited)
 *   --dry-run           Fetch + extract but do not write to DB
 *   --batch-size N      EFTS results per page (max 100, default: 50)
 *   --delay-ms N        Milliseconds between EDGAR requests (default: 250)
 *
 * EDGAR rate limit: 10 req/sec. Default 250ms delay = 4 req/sec, safely under limit.
 *
 * Checkpointing: processed accession numbers are checked against executive_positions.sec_accession_number.
 * Safe to re-run: filings already processed are skipped.
 */

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
if (!ANTHROPIC_KEY) {
  console.error('Missing ANTHROPIC_API_KEY')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })

const EDGAR_EFTS    = 'https://efts.sec.gov/LATEST/search-index'
const EDGAR_ARCHIVE = 'https://www.sec.gov/Archives/edgar/data'
const UA = 'StartingMonday/1.0 backfill contact@startingmonday.app'
const HEADERS = { 'User-Agent': UA, Accept: 'application/json,text/html' }

// ── arg parsing ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
function getArg(name, fallback = null) {
  const i = args.indexOf(name)
  return i !== -1 ? args[i + 1] : fallback
}
const DRY_RUN    = args.includes('--dry-run')
const LIMIT      = getArg('--limit') ? parseInt(getArg('--limit'), 10) : Infinity
const BATCH_SIZE = Math.min(100, parseInt(getArg('--batch-size', '50'), 10))
const DELAY_MS   = parseInt(getArg('--delay-ms', '250'), 10)
const HAIKU      = 'claude-haiku-4-5-20251001'

let startDate, endDate
const yearArg = getArg('--year')
if (getArg('--start') && getArg('--end')) {
  startDate = getArg('--start')
  endDate   = getArg('--end')
} else {
  const year = yearArg ? parseInt(yearArg, 10) : new Date().getFullYear() - 1
  startDate = `${year}-01-01`
  endDate   = `${year}-12-31`
}

console.log(`EDGAR 8-K 5.02 backfill: ${startDate} to ${endDate}${DRY_RUN ? ' [DRY RUN]' : ''}`)

// ── main ──────────────────────────────────────────────────────────────────────

await run()

async function run() {
  let offset = 0
  let total  = null
  let fetched   = 0  // total filings attempted (drives --limit)
  let processed = 0  // filings where Haiku extracted at least one executive
  let skipped   = 0
  let inserted  = 0
  let failed    = 0

  while (true) {
    if (fetched >= LIMIT) {
      console.log(`Limit of ${LIMIT} reached.`)
      break
    }

    const url = `${EDGAR_EFTS}?q=%22Item+5.02%22&forms=8-K&dateRange=custom&startdt=${startDate}&enddt=${endDate}&from=${offset}&hits.hits.total.value=true`
    const page = await fetchJSON(url)
    if (!page) {
      console.error('EFTS fetch failed at offset', offset)
      break
    }

    total = total ?? page.hits?.total?.value ?? 0
    const hits = page.hits?.hits ?? []
    if (hits.length === 0) break

    console.log(`Page offset=${offset}: ${hits.length} hits (total=${total})`)

    for (const hit of hits) {
      if (fetched >= LIMIT) break

      const accession = hit._id  // format: 0001234567-24-123456
      if (!accession) continue

      // Dedup: skip filings already in executive_positions
      const alreadyLoaded = await isAlreadyLoaded(accession)
      if (alreadyLoaded) { skipped++; continue }

      const src = hit._source ?? {}
      const entityName = src.entity_name ?? ''
      const fileDate   = src.file_date   ?? src.period_of_report ?? startDate.split('T')[0]
      const items      = src.items       ?? ''

      // Confirm this filing actually has item 5.02
      if (!items.includes('5.02')) { skipped++; continue }

      fetched++

      // Extract CIK from accession number (first 10 digits)
      const cikPadded = accession.split('-')[0]  // e.g. "0001234567"
      const cik = cikPadded.replace(/^0+/, '')   // e.g. "1234567"

      await sleep(DELAY_MS)

      // Fetch filing index to get primary document filename
      const primaryDoc = await getFilingPrimaryDoc(cik, accession)
      if (!primaryDoc) {
        console.log(`  [skip] ${accession} - could not resolve primary document`)
        skipped++
        continue
      }

      await sleep(DELAY_MS)

      // Fetch primary document and extract Item 5.02 section
      const docUrl = `${EDGAR_ARCHIVE}/${cik}/${accession.replace(/-/g, '')}/${primaryDoc}`
      const section = await fetchItemSection(docUrl)
      if (!section) {
        console.log(`  [skip] ${accession} - no Item 5.02 section found`)
        skipped++
        continue
      }

      // Use Haiku to extract structured executive data
      const executives = await extractWithHaiku(section, entityName, fileDate)
      if (!executives || executives.length === 0) {
        console.log(`  [skip] ${accession} - Haiku extracted no executives`)
        skipped++
        continue
      }

      processed++
      console.log(`  [${processed}] ${entityName} | ${fileDate} | ${executives.length} exec(s) | ${accession}`)

      if (DRY_RUN) {
        for (const ex of executives) console.log('    ', JSON.stringify(ex))
        continue
      }

      // Write to DB
      const writeOk = await writeExecutives(executives, {
        companyName:  entityName,
        companyCik:   cik,
        filingDate:   fileDate,
        accession,
        sourceUrl:    docUrl,
      })
      if (writeOk) inserted++
      else failed++
    }

    offset += hits.length
    if (offset >= total) break
    await sleep(DELAY_MS)
  }

  console.log(`\nDone. processed=${processed} inserted=${inserted} skipped=${skipped} failed=${failed}`)
}

// ── EDGAR helpers ─────────────────────────────────────────────────────────────

async function getFilingPrimaryDoc(cik, accession) {
  // Try the filing index JSON first (clean machine-readable format)
  const accNoDashes = accession.replace(/-/g, '')
  const indexUrl = `${EDGAR_ARCHIVE}/${cik}/${accNoDashes}/${accession}-index.json`

  const json = await fetchJSON(indexUrl)
  if (json?.directory?.item) {
    // Find the primary 8-K document (first .htm file that is not the full submission)
    const items = json.directory.item
    for (const item of items) {
      const name = (item.name ?? '').toLowerCase()
      if ((name.endsWith('.htm') || name.endsWith('.html')) && !name.includes('full')) {
        return item.name
      }
    }
  }

  // Fallback: parse index HTML for primary document link
  const htmlUrl = `${EDGAR_ARCHIVE}/${cik}/${accNoDashes}/${accession}-index.htm`
  const html = await fetchText(htmlUrl)
  if (!html) return null

  // Look for the first table row with type "8-K" or the first .htm link
  const match = html.match(/href="([^"]*\.htm)"[^>]*>[^<]*8-K/i)
    ?? html.match(/<a href="([^"]*\.htm)"/i)
  return match ? match[1].split('/').pop() : null
}

async function fetchItemSection(docUrl) {
  const html = await fetchText(docUrl)
  if (!html) return null

  // Normalize HTML entities and tags into clean text
  const text = html
    .replace(/&#160;/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')

  // Find Item 5.02 section — try several patterns used in real 8-K filings
  const patterns = [
    /item\s+5\.02/i,          // "Item 5.02" (most common)
    /item\s*no\.?\s*5\.02/i,  // "Item No. 5.02"
    /5\.02\s+departure/i,     // "5.02 Departure of..."
    /5\.02\s+appointment/i,   // "5.02 Appointment of..."
  ]

  let idx = -1
  for (const pat of patterns) {
    const m = pat.exec(text)
    if (m) { idx = m.index; break }
  }
  if (idx === -1) return null

  return text.slice(idx, idx + 4000).trim()
}

// ── Haiku extraction ─────────────────────────────────────────────────────────

async function extractWithHaiku(section, companyName, filingDate) {
  const prompt = `Extract executive departure and appointment information from this SEC 8-K Item 5.02 filing.

Company: ${companyName}
Filing date: ${filingDate}

Filing text:
${section}

Return a JSON array of executive events. Each object must have:
- full_name: string (full name as written, no titles)
- title: string (job title as written, e.g. "Chief Information Officer")
- title_normalized: one of: CIO, CTO, CISO, CDO_DATA, CDO_DIGITAL, COO, CPO, VP_TECH, OTHER_C, or null
- event_type: "departure", "appointment", or "both"
- departure_type: one of: voluntary, forced, retirement, acquisition, internal_promotion, unknown (null if appointment only)
- departure_trigger: one of: ceo_change, activist, post_acquisition, financial_distress, strategy_shift, board_pressure, personal, unknown (null if appointment only)
- start_date: ISO date string or null (for appointment)
- end_date: ISO date string or null (for departure)
- is_current: false for departures, true for appointments
- successor_type: one of: internal, external, interim, unknown, or null

Return ONLY the JSON array, no explanation. If no clear executive events, return [].`

  try {
    const msg = await anthropic.messages.create({
      model: HAIKU,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = (msg.content[0]?.text ?? '').trim()
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
  } catch (err) {
    console.error('  Haiku error:', err.message)
    return null
  }
}

// ── DB writes ─────────────────────────────────────────────────────────────────

async function isAlreadyLoaded(accession) {
  const { data } = await db
    .from('executive_positions')
    .select('id')
    .eq('sec_accession_number', accession)
    .limit(1)
    .maybeSingle()
  return !!data
}

async function writeExecutives(executives, { companyName, companyCik, filingDate, accession, sourceUrl }) {
  try {
    for (const ex of executives) {
      // Upsert executive profile
      const profilePayload = {
        full_name:  ex.full_name,
        first_name: ex.full_name?.split(' ')[0] ?? null,
        last_name:  ex.full_name?.split(' ').slice(1).join(' ') || null,
        updated_at: new Date().toISOString(),
      }

      let execId = null

      // Try to find existing profile by name
      const { data: existing } = await db
        .from('executive_profiles')
        .select('id')
        .ilike('full_name', ex.full_name)
        .maybeSingle()

      if (existing) {
        execId = existing.id
      } else {
        const { data: created, error: cErr } = await db
          .from('executive_profiles')
          .insert(profilePayload)
          .select('id')
          .single()
        if (cErr) { console.error('  profile insert error:', cErr.message); continue }
        execId = created.id
      }

      // Insert executive position (departure or appointment)
      const positionPayload = {
        executive_id:         execId,
        company_name:         companyName,
        company_cik:          companyCik,
        title:                ex.title,
        title_normalized:     ex.title_normalized ?? null,
        start_date:           ex.start_date ?? null,
        end_date:             ex.end_date ?? (ex.event_type !== 'appointment' ? filingDate : null),
        is_current:           ex.is_current ?? false,
        departure_type:       ex.departure_type ?? null,
        departure_trigger:    ex.departure_trigger ?? null,
        departure_signal:     'edgar_8k_502',
        sec_accession_number: accession,
        successor_type:       ex.successor_type ?? null,
        data_sources:         ['edgar_8k_502'],
        confidence_score:     0.80,
        source_urls:          [sourceUrl],
        created_at:           new Date().toISOString(),
        updated_at:           new Date().toISOString(),
      }

      const { error: pErr } = await db
        .from('executive_positions')
        .insert(positionPayload)
      if (pErr && !pErr.message.includes('duplicate')) {
        console.error('  position insert error:', pErr.message)
      }
    }
    return true
  } catch (err) {
    console.error('  writeExecutives error:', err.message)
    return false
  }
}

// ── fetch utilities ───────────────────────────────────────────────────────────

async function fetchJSON(url) {
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function fetchText(url) {
  try {
    const res = await fetch(url, {
      headers: { ...HEADERS, Accept: 'text/html,application/xhtml+xml' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
