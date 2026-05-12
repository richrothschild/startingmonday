/**
 * Resolve EDGAR CIKs for pipeline companies that don't have one yet.
 *
 * Strategy (two passes):
 *   Pass 1 — Bulk match via SEC company_tickers.json. Fast, no per-company
 *             API calls. Covers every public company with a stock ticker.
 *   Pass 2 — For remaining unmatched companies, query EDGAR company search
 *             and use Haiku to pick the best match when results are ambiguous.
 *             Companies where EDGAR finds nothing are marked is_public_company=false.
 *
 * Usage:
 *   node --env-file=.env.local scripts/resolve-ciks.mjs
 *   node --env-file=.env.local scripts/resolve-ciks.mjs --dry-run
 *   node --env-file=.env.local scripts/resolve-ciks.mjs --user-id UUID
 *   node --env-file=.env.local scripts/resolve-ciks.mjs --limit 50
 *
 * Safe to re-run: skips companies with sec_cik already set or is_public_company=false.
 */

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })

const HEADERS = {
  'User-Agent': 'StartingMonday/1.0 cik-resolver contact@startingmonday.app',
  Accept: 'application/json,text/html',
}
const HAIKU   = 'claude-haiku-4-5-20251001'
const DELAY_MS = 150  // well under EDGAR's 10 req/sec limit

// ── arg parsing ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const USER_ID = args[args.indexOf('--user-id') + 1] ?? null
const LIMIT   = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : Infinity

console.log(`CIK resolver${DRY_RUN ? ' [DRY RUN]' : ''}${USER_ID ? ` [user: ${USER_ID}]` : ''}`)

// ── name normalization ────────────────────────────────────────────────────────

// Suffixes stripped before comparison so "Acme Corp." matches "Acme"
const STRIP = /\b(inc|corp|corporation|llc|ltd|limited|co|plc|n\.v|s\.a|group|holdings|technologies|technology|solutions|systems|services|international|global|enterprises|company)\b\.?/gi

function normalize(name) {
  return name
    .toLowerCase()
    .replace(STRIP, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ── Pass 1: bulk match via company_tickers.json ───────────────────────────────

async function loadTickerMap() {
  console.log('Downloading SEC company_tickers.json...')
  const res = await fetch('https://www.sec.gov/files/company_tickers.json', { headers: HEADERS })
  if (!res.ok) throw new Error(`company_tickers.json fetch failed: ${res.status}`)
  const raw = await res.json()

  // Build two maps: exact normalized name -> [{cik, name}] and first-token -> [{cik, name}]
  const byName  = new Map()   // normalized full name -> entry
  const byFirst = new Map()   // first word of normalized name -> [entries]

  for (const entry of Object.values(raw)) {
    const norm = normalize(entry.title)
    const cik  = String(entry.cik_str)
    const item = { cik, padded: cik.padStart(10, '0'), title: entry.title }

    if (!byName.has(norm)) byName.set(norm, item)

    const first = norm.split(' ')[0]
    if (!byFirst.has(first)) byFirst.set(first, [])
    byFirst.get(first).push({ norm, ...item })
  }

  return { byName, byFirst }
}

function bulkMatch(companyName, byName, byFirst) {
  const norm = normalize(companyName)

  // Exact normalized match
  if (byName.has(norm)) return byName.get(norm)

  // Starts-with match: pipeline company name starts with the ticker entry name
  // (e.g. "Microsoft Azure" matches "microsoft")
  const first = norm.split(' ')[0]
  const candidates = byFirst.get(first) ?? []
  const startsWithMatch = candidates.filter(c => norm.startsWith(c.norm) || c.norm.startsWith(norm))
  if (startsWithMatch.length === 1) return startsWithMatch[0]

  return null
}

// ── Pass 2: EDGAR company search + Haiku disambiguation ──────────────────────

async function edgarSearch(companyName) {
  const encoded = encodeURIComponent(companyName)
  const url = `https://www.sec.gov/cgi-bin/browse-edgar?company=${encoded}&CIK=&type=10-K&dateb=&owner=include&count=10&search_text=&action=getcompany`
  await sleep(DELAY_MS)
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(12000) })
    if (!res.ok) return []
    const html = await res.text()
    return parseEdgarSearchHtml(html)
  } catch {
    return []
  }
}

function parseEdgarSearchHtml(html) {
  // EDGAR search results table contains rows like:
  //   <a href="/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&...">APPLE INC</a>
  const results = []
  const re = /browse-edgar\?action=getcompany&(?:amp;)?CIK=(\d+)[^>]*>([^<]+)</gi
  let match
  while ((match = re.exec(html)) !== null) {
    const cik = match[1].replace(/^0+/, '')
    const name = match[2].trim()
    if (cik && name && !results.find(r => r.cik === cik)) {
      results.push({ cik, padded: cik.padStart(10, '0'), title: name })
    }
  }
  return results.slice(0, 8)
}

async function haikuPick(companyName, candidates) {
  if (!ANTHROPIC_KEY) return null
  if (candidates.length === 0) return null
  if (candidates.length === 1) return candidates[0]

  const list = candidates.map((c, i) => `${i + 1}. ${c.title} (CIK: ${c.cik})`).join('\n')
  const prompt = `I'm looking up the SEC EDGAR CIK for this company: "${companyName}"

Candidates from EDGAR search:
${list}

Which candidate is the best match? Reply with just the number (1, 2, 3...) or "none" if no candidate is a reasonable match. No explanation.`

  try {
    const msg = await anthropic.messages.create({
      model: HAIKU,
      max_tokens: 10,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = (msg.content[0]?.text ?? '').trim().toLowerCase()
    if (text === 'none') return null
    const idx = parseInt(text, 10) - 1
    return candidates[idx] ?? null
  } catch {
    return null
  }
}

// ── main ──────────────────────────────────────────────────────────────────────

await run()

async function run() {
  // Load pipeline companies without a CIK
  let query = db
    .from('companies')
    .select('id, name, user_id')
    .is('sec_cik', null)
    .is('archived_at', null)
    .is('is_public_company', null)  // skip confirmed-private
    .order('name')

  if (USER_ID) query = query.eq('user_id', USER_ID)

  const { data: companies, error } = await query
  if (error) { console.error('DB error:', error.message); process.exit(1) }
  if (!companies?.length) { console.log('No unresolved companies.'); return }

  const batch = companies.slice(0, LIMIT === Infinity ? companies.length : LIMIT)
  console.log(`${batch.length} companies to resolve\n`)

  const { byName, byFirst } = await loadTickerMap()
  console.log(`Ticker map loaded (${byName.size} entries)\n`)

  let pass1 = 0
  let pass2 = 0
  let notPublic = 0
  let failed = 0

  for (const company of batch) {
    // Pass 1: bulk match
    const bulkHit = bulkMatch(company.name, byName, byFirst)
    if (bulkHit) {
      console.log(`[P1] ${company.name} -> ${bulkHit.title} (${bulkHit.cik})`)
      if (!DRY_RUN) await writeResult(company.id, bulkHit.cik, bulkHit.padded, true)
      pass1++
      continue
    }

    // Pass 2: EDGAR search
    await sleep(DELAY_MS)
    const candidates = await edgarSearch(company.name)

    if (candidates.length === 0) {
      console.log(`[--] ${company.name} -> not found (marking private)`)
      if (!DRY_RUN) await markPrivate(company.id)
      notPublic++
      continue
    }

    const pick = await haikuPick(company.name, candidates)
    if (pick) {
      console.log(`[P2] ${company.name} -> ${pick.title} (${pick.cik})`)
      if (!DRY_RUN) await writeResult(company.id, pick.cik, pick.padded, true)
      pass2++
    } else {
      console.log(`[??] ${company.name} -> ambiguous, skipping`)
      failed++
    }
  }

  console.log(`\nDone. pass1=${pass1} pass2=${pass2} private=${notPublic} skipped=${failed}`)
}

// ── DB writes ─────────────────────────────────────────────────────────────────

async function writeResult(companyId, cik, padded, isPublic) {
  const { error } = await db
    .from('companies')
    .update({
      sec_cik:              cik,
      sec_cik_padded:       padded,
      sec_cik_resolved_at:  new Date().toISOString(),
      is_public_company:    isPublic,
    })
    .eq('id', companyId)
  if (error) console.error(`  write error (${companyId}):`, error.message)
}

async function markPrivate(companyId) {
  const { error } = await db
    .from('companies')
    .update({ is_public_company: false, sec_cik_resolved_at: new Date().toISOString() })
    .eq('id', companyId)
  if (error) console.error(`  mark-private error (${companyId}):`, error.message)
}

// ── utilities ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
