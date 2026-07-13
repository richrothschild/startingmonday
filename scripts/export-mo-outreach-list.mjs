#!/usr/bin/env node
/**
 * MO Weekly Outreach Export (signal-led, Apollo-enriched)
 *
 * Pipeline per company with a fresh transition signal (default window: 14 days):
 *   1. Pull the strongest signal per company from company_signals.
 *   2. Apollo people search (org-id scoped when a domain is known) to find the
 *      actual people to contact, with titles chosen per signal type.
 *   3. For departure-family signals (exec_departure, filing_trend on 5.02
 *      clusters, pattern alerts mentioning departures):
 *        - target the 1-2 adjacent decision-maker roles still at the company
 *        - attempt to identify the departed person from the signal text and
 *          add them to the list as a transition prospect with LinkedIn info
 *   4. Emit CSV (company-level), CSV (person-level with fully rendered
 *      scripts), and a markdown review copy.
 *   5. Optional --email: send both files to the founder + MO via Resend.
 *
 * People search returns first name + obfuscated last initial only. Full name +
 * LinkedIn + email require a people/match reveal, which consumes Apollo
 * credits - so reveals are capped and opt-in via --reveal (default: top
 * departure prospects only, max 10 per run).
 *
 * Usage:
 *   node scripts/export-mo-outreach-list.mjs [--days=14] [--min-confidence=0]
 *     [--max-companies=40] [--skip-apollo] [--reveal=10] [--email]
 *     [--out=tmp/mo-outreach-list-YYYY-MM-DD.csv]
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, APOLLO_API_KEY
 *      (optional) RESEND_API_KEY, MO_EMAIL for --email
 * Guardrails: unverified outcome statistics must never be added to these scripts.
 */
import fs from 'node:fs'
import path from 'node:path'
import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

loadEnv({ path: '.env.local' })
loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const APOLLO_BASE = 'https://api.apollo.io/api/v1'
const apolloKey = process.env.APOLLO_API_KEY ?? ''
const OWNER_EMAIL = 'richard@startingmonday.app'

const argv = process.argv.slice(2)
function argValue(name, fallback) {
  const hit = argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.split('=')[1] : fallback
}
function argFlag(name) {
  return argv.includes(`--${name}`)
}

const days = Number(argValue('days', '14'))
const minConfidence = Number(argValue('min-confidence', '0'))
const maxCompanies = Number(argValue('max-companies', '40'))
const revealBudget = Number(argValue('reveal', '10'))
const skipApollo = argFlag('skip-apollo') || !apolloKey
const sendEmailFlag = argFlag('email')
const today = new Date().toISOString().slice(0, 10)
const outCsvPath = argValue('out', path.join('tmp', `mo-outreach-list-${today}.csv`))
const outPeopleCsvPath = outCsvPath.replace(/\.csv$/i, '-people.csv')
const outMdPath = outCsvPath.replace(/\.csv$/i, '.md')

const SIGNAL_LABELS = {
  funding: 'Funding',
  exec_departure: 'Executive departure',
  exec_hire: 'Executive hire',
  acquisition: 'Acquisition / M&A',
  expansion: 'Expansion',
  layoffs: 'Layoffs / restructuring',
  ipo: 'IPO',
  new_product: 'New product',
  award: 'Award / recognition',
  pattern_alert: 'Pattern alert',
  filing_trend: 'Filing trend',
  regulatory_change: 'Regulatory change',
}

// Synthetic/test accounts must never reach an outreach list.
const TEST_COMPANY_RE = /e2e test|test co\b|synthetic|probe account|demo co\b|sample co\b/i

// Titles Apollo should search per signal type: who at (or around) this company
// is most likely in-market or a decision-maker touched by the trigger.
const TITLES_BY_SIGNAL = {
  exec_departure: ['Chief Executive Officer', 'Chief Financial Officer', 'Chief Human Resources Officer'],
  filing_trend: ['Chief Executive Officer', 'Chief Financial Officer', 'Chief Human Resources Officer'],
  layoffs: ['Chief Information Officer', 'Chief Technology Officer', 'VP Engineering', 'VP Information Technology'],
  acquisition: ['Chief Information Officer', 'Chief Technology Officer', 'Chief Digital Officer'],
  funding: ['Chief Executive Officer', 'Chief Technology Officer', 'VP Engineering'],
  exec_hire: ['Chief Information Officer', 'Chief Technology Officer', 'VP Engineering'],
  ipo: ['Chief Information Officer', 'Chief Information Security Officer', 'Chief Technology Officer'],
  expansion: ['Chief Technology Officer', 'VP Engineering', 'Chief Information Officer'],
  regulatory_change: ['Chief Information Officer', 'Chief Information Security Officer', 'Chief Data Officer'],
  default: ['Chief Information Officer', 'Chief Technology Officer', 'VP Engineering'],
}

// Adjacent decision-maker roles still at the company after a departure,
// keyed by the departed role family detected in the signal text.
const ADJACENT_DECISION_MAKERS = {
  cio: ['Chief Executive Officer', 'Chief Financial Officer'],
  cto: ['Chief Executive Officer', 'VP Engineering'],
  ciso: ['Chief Information Officer', 'Chief Executive Officer'],
  cfo: ['Chief Executive Officer', 'Chief Operating Officer'],
  coo: ['Chief Executive Officer', 'Chief Financial Officer'],
  ceo: ['Chief Financial Officer', 'Chief Operating Officer'],
  default: ['Chief Executive Officer', 'Chief Human Resources Officer'],
}

const DEPARTURE_SIGNALS = new Set(['exec_departure', 'filing_trend', 'pattern_alert'])

function detectDepartedRoleFamily(text) {
  const t = String(text ?? '').toLowerCase()
  if (/\bciso\b|chief information security/.test(t)) return 'ciso'
  if (/\bcio\b|chief information officer/.test(t)) return 'cio'
  if (/\bcto\b|chief technology officer/.test(t)) return 'cto'
  if (/\bcfo\b|chief financial officer/.test(t)) return 'cfo'
  if (/\bcoo\b|chief operating officer/.test(t)) return 'coo'
  if (/\bceo\b|chief executive officer/.test(t)) return 'ceo'
  return 'default'
}

function isLikelyDeparture(entry) {
  if (entry.signalType === 'exec_departure') return true
  const text = `${entry.summary} ${entry.evidence}`.toLowerCase()
  if (!DEPARTURE_SIGNALS.has(entry.signalType)) return false
  return /departure|departed|resign|steps down|stepping down|stepped down|exit|left the company|5\.02/.test(text)
}

// Extract a likely person name from signal text (e.g. "CFO Jane Smith resigned").
// Conservative: requires two capitalized words adjacent to a role or departure verb.
function extractDepartedName(text) {
  const t = String(text ?? '').replace(/\s+/g, ' ')
  const patterns = [
    /(?:CEO|CFO|CIO|CTO|CISO|COO|CDO|President|Chief [A-Za-z]+ Officer|EVP|SVP|VP)[,\s]+([A-Z][a-z]+ [A-Z][a-z]+(?:-[A-Z][a-z]+)?)/,
    /([A-Z][a-z]+ [A-Z][a-z]+(?:-[A-Z][a-z]+)?)(?:,? (?:the )?(?:company's )?(?:CEO|CFO|CIO|CTO|CISO|COO|CDO|President|Chief [A-Za-z]+ Officer))/,
    /([A-Z][a-z]+ [A-Z][a-z]+(?:-[A-Z][a-z]+)?)\s+(?:has )?(?:resigned|departed|stepped down|is stepping down|left|announced (?:his|her|their) departure)/,
  ]
  for (const re of patterns) {
    const m = t.match(re)
    if (m?.[1]) return m[1]
  }
  return null
}

// ── Apollo helpers ───────────────────────────────────────────────────────────
function apolloHeaders() {
  return { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'X-Api-Key': apolloKey }
}

async function apolloResolveOrgId(domain) {
  if (!domain) return null
  try {
    const res = await fetch(`${APOLLO_BASE}/organizations/enrich?domain=${encodeURIComponent(domain)}`, {
      method: 'GET',
      headers: apolloHeaders(),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.organization?.id ?? null
  } catch {
    return null
  }
}

async function apolloPeopleSearch({ companyName, orgId, titles, perPage = 3 }) {
  try {
    const body = orgId
      ? { organization_ids: [orgId], person_titles: titles, page: 1, per_page: perPage }
      : { q_organization_name: companyName, person_titles: titles, page: 1, per_page: perPage }
    const res = await fetch(`${APOLLO_BASE}/mixed_people/api_search`, {
      method: 'POST',
      headers: apolloHeaders(),
      body: JSON.stringify(body),
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.people) ? data.people : []
  } catch {
    return []
  }
}

// People Enrichment (people/match) - consumes credits. Reveals full name,
// LinkedIn URL, and email when available. Used sparingly under revealBudget.
async function apolloRevealPerson({ firstName, lastName, companyName, title }) {
  try {
    const params = new URLSearchParams()
    if (firstName) params.set('first_name', firstName)
    if (lastName) params.set('last_name', lastName)
    if (companyName) params.set('organization_name', companyName)
    if (title) params.set('title', title)
    const res = await fetch(`${APOLLO_BASE}/people/match?${params.toString()}`, {
      method: 'POST',
      headers: apolloHeaders(),
    })
    if (!res.ok) return null
    const data = await res.json()
    const p = data.person
    if (!p) return null
    return {
      name: [p.first_name, p.last_name].filter(Boolean).join(' ') || null,
      title: p.title ?? title ?? null,
      linkedinUrl: p.linkedin_url ?? null,
      email: p.email && !String(p.email).includes('email_not_unlocked') ? p.email : null,
      currentCompany: p.organization?.name ?? null,
    }
  } catch {
    return null
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── Scripts (trigger-personalized; [FIRST_NAME]/[ROLE] filled when known) ────
function truncate(text, max) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 3).trim()}...`
}

function scriptsForSignal({ company, signalType, summary }) {
  const shortSummary = truncate(summary, 100)

  const base = {
    connection_request:
      `Hi [FIRST_NAME] - I follow ${company} as part of transition-signal research on the tech-executive market. ${shortSummary ? `Noted this recently: "${shortSummary}"` : 'Recent movement there caught my attention.'} Happy to connect.`,
    day3_dm:
      `Thanks for connecting, [FIRST_NAME]. Quick context: I run Starting Monday - we track events like the one at ${company} because they tend to precede leadership searches. No pitch - if the signal landscape around your space is ever useful, glad to share what we see.`,
    founder_note:
      `[FIRST_NAME], Richard here (founder). I noticed the ${company} development and generated the one-page signal brief on what that pattern usually means for [ROLE] roles. Want me to send it? No signup, no pitch.`,
  }

  const byType = {
    exec_departure: {
      connection_request:
        `Hi [FIRST_NAME] - the leadership change at ${company} came up in our transition-signal tracking this week. I research how these events ripple through exec hiring. Glad to connect.`,
      day3_dm:
        `Thanks for connecting, [FIRST_NAME]. Departures like the one at ${company} usually reshape the leadership bench within a couple of quarters - sometimes creating openings, sometimes signaling churn worth watching from a distance. I run Starting Monday, where we track exactly these events. If it's useful, I can share what our signal data shows around your sector.`,
      founder_note:
        `[FIRST_NAME], Richard here (founder). The ${company} departure is the kind of event we watch closely - it often precedes a broader leadership reshuffle. I put together the one-page brief on what that pattern typically means for [ROLE] roles. Want it? No signup, no pitch.`,
    },
    layoffs: {
      connection_request:
        `Hi [FIRST_NAME] - saw the restructuring news at ${company}. I research how these events change the executive market in the following quarters. Connecting in case that lens is ever useful.`,
      day3_dm:
        `Thanks for connecting, [FIRST_NAME]. Restructurings like ${company}'s usually trigger two waves: immediate consolidation, then a rebuild of the leadership layer two to three quarters out. I run Starting Monday - we track those waves company by company. Happy to share what we're seeing in your space, no strings.`,
      founder_note:
        `[FIRST_NAME], Richard here (founder). Post-restructuring windows are exactly what our signal engine watches - the rebuild phase is where [ROLE] conversations start quietly. I generated the one-page brief on the ${company} pattern. Want me to send it over? No signup.`,
    },
    acquisition: {
      connection_request:
        `Hi [FIRST_NAME] - the ${company} deal came up in our M&A signal tracking. Post-acquisition leadership moves are what I research. Glad to connect.`,
      day3_dm:
        `Thanks for connecting, [FIRST_NAME]. Acquisitions like ${company}'s usually resolve into leadership consolidation within 6-12 months - one team's structure wins, and adjacent companies quietly start searches. I run Starting Monday, where we track that cascade. If a view of your sector's movement would help, say the word.`,
      founder_note:
        `[FIRST_NAME], Richard here (founder). The ${company} acquisition is the kind of event that reshapes [ROLE] hiring across the whole peer group, not just the two companies. I generated the one-page signal brief on it. Want it? No signup, no pitch.`,
    },
    funding: {
      connection_request:
        `Hi [FIRST_NAME] - ${company}'s raise showed up in our funding-signal tracking. New capital usually means new leadership mandates - that's the research I do. Happy to connect.`,
      day3_dm:
        `Thanks for connecting, [FIRST_NAME]. Raises like ${company}'s typically fund a leadership build-out within two or three quarters - that's when the interesting searches start, well before anything posts. I run Starting Monday, where we watch those windows. Glad to share what we see around your space if useful.`,
      founder_note:
        `[FIRST_NAME], Richard here (founder). Fresh capital at ${company} usually means [ROLE]-level mandates are being scoped right now, before anything is public. I generated the one-page brief on that pattern. Want me to send it? Takes you 2 minutes to read, no signup.`,
    },
    exec_hire: {
      connection_request:
        `Hi [FIRST_NAME] - noticed the new leadership arrival at ${company}. First-90-day team moves are what I research. Glad to connect.`,
      day3_dm:
        `Thanks for connecting, [FIRST_NAME]. New executives like the arrival at ${company} usually reshape their team inside two quarters - that ripple is where the unposted opportunities live. I run Starting Monday; we track those ripples. Happy to share the view of your sector any time.`,
      founder_note:
        `[FIRST_NAME], Richard here (founder). A new leader at ${company} almost always means team changes by quarter two - the [ROLE] conversations start before anything posts. I generated the one-page brief on that pattern. Want it? No signup.`,
    },
    ipo: {
      connection_request:
        `Hi [FIRST_NAME] - ${company}'s public-market step showed up in our signal tracking. Post-IPO leadership build-outs are what I research. Happy to connect.`,
      day3_dm:
        `Thanks for connecting, [FIRST_NAME]. Companies at ${company}'s stage typically professionalize the leadership bench fast - new board expectations create mandates that never hit job boards. I run Starting Monday, where we track those. Glad to share what we see in your space.`,
      founder_note:
        `[FIRST_NAME], Richard here (founder). Post-IPO benches get rebuilt quietly, and [ROLE] is usually in the first wave. I generated the one-page ${company} brief. Want me to send it? No signup, no pitch.`,
    },
    expansion: {
      connection_request:
        `Hi [FIRST_NAME] - ${company}'s expansion came up in our growth-signal tracking. Scaling moves usually precede leadership searches; that's my research area. Glad to connect.`,
      day3_dm:
        `Thanks for connecting, [FIRST_NAME]. Expansion like ${company}'s typically outgrows the current leadership structure within a few quarters. I run Starting Monday - we watch for exactly that inflection. If a signal view of your sector is useful, happy to share.`,
      founder_note:
        `[FIRST_NAME], Richard here (founder). Growth like ${company}'s is usually followed by [ROLE]-level hires before anything is posted. I generated the one-page brief on the pattern. Want it? No signup.`,
    },
    filing_trend: {
      connection_request:
        `Hi [FIRST_NAME] - ${company}'s SEC filing pattern showed up in our transition-signal research this week. Leadership filing trends are exactly what I study. Glad to connect.`,
      day3_dm:
        `Thanks for connecting, [FIRST_NAME]. ${company}'s recent filing cadence suggests the leadership bench is in motion - those patterns usually resolve into searches well before anything posts. I run Starting Monday, where we track filing trends like this across the market. Happy to share the view of your sector.`,
      founder_note:
        `[FIRST_NAME], Richard here (founder). The filing pattern at ${company} is the kind our engine flags because it usually precedes [ROLE]-level movement. I generated the one-page brief on it. Want me to send it? No signup, no pitch.`,
    },
    regulatory_change: {
      connection_request:
        `Hi [FIRST_NAME] - the regulatory shift affecting ${company}'s space came up in our signal research. New compliance mandates usually create new executive accountability - that's what I study. Glad to connect.`,
      day3_dm:
        `Thanks for connecting, [FIRST_NAME]. Regulatory changes like the one touching ${company} typically force companies to upgrade or add senior leadership to own the accountability - often before any role is posted. I run Starting Monday, where we track those mandates. Happy to share what we see in your sector.`,
      founder_note:
        `[FIRST_NAME], Richard here (founder). The regulatory shift around ${company} is creating exactly the kind of accountability gap that opens [ROLE] mandates quietly. I generated the one-page brief on the pattern. Want it? No signup, no pitch.`,
    },
  }

  const scripts = byType[signalType] ?? base
  return {
    ...scripts,
    connection_request: truncate(scripts.connection_request, 285),
  }
}

// Departed-person scripts: they are the prospect, in active transition.
function scriptsForDepartedProspect({ company }) {
  return {
    connection_request: truncate(
      `Hi [FIRST_NAME] - I research executive transitions in the technology market, and the recent change at ${company} put your name on my radar. No agenda beyond connecting with leaders navigating that phase.`,
      285,
    ),
    day3_dm:
      `Thanks for connecting, [FIRST_NAME]. Transitions after a chapter like ${company} are exactly what I work on - I run Starting Monday, a private platform that shows executives which companies are about to need them, weeks before roles post. If you're exploring what's next (quietly or actively), I'd be glad to share what the signal data shows for your profile. Private by default - nothing is visible to employers or recruiters.`,
    founder_note:
      `[FIRST_NAME], Richard here (founder). I built Starting Monday for exactly the moment you're in after ${company} - a private view of which companies are heading toward a [ROLE] need before anything posts. I generated the one-page market brief for your lane. Want me to send it? No signup, completely confidential.`,
  }
}

function renderScripts(scripts, firstName, role) {
  const fill = (text) =>
    text
      .replace(/\[FIRST_NAME\]/g, firstName || '[FIRST_NAME]')
      .replace(/\[ROLE\]/g, role || '[ROLE]')
  return {
    connection_request: fill(scripts.connection_request),
    day3_dm: fill(scripts.day3_dm),
    founder_note: fill(scripts.founder_note),
  }
}

function csvEscape(value) {
  const s = String(value ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

// ── Main ─────────────────────────────────────────────────────────────────────
const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

const { data: rows, error } = await supabase
  .from('company_signals')
  .select('company_id, signal_type, signal_summary, signal_date, source_url, confidence, evidence_snippets, companies(name, company_url)')
  .gte('signal_date', sinceIso.slice(0, 10))
  .order('signal_date', { ascending: false })
  .limit(1000)

if (error) {
  console.error(`Query failed: ${error.message}`)
  process.exit(1)
}

const byCompany = new Map()
for (const row of rows ?? []) {
  const name = row.companies?.name
  if (!name) continue
  if (TEST_COMPANY_RE.test(name)) continue
  if (Number(row.confidence ?? 0) < minConfidence) continue
  const existing = byCompany.get(name)
  const better =
    !existing ||
    Number(row.confidence ?? 0) > Number(existing.confidence ?? 0) ||
    (Number(row.confidence ?? 0) === Number(existing.confidence ?? 0) && row.signal_date > existing.signal_date)
  if (better) byCompany.set(name, row)
}

function extractDomain(companyUrl) {
  if (!companyUrl) return null
  try {
    const u = companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`
    return new URL(u).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

const entries = [...byCompany.entries()]
  .map(([company, row]) => ({
    company,
    domain: extractDomain(row.companies?.company_url),
    signalType: row.signal_type,
    signalLabel: SIGNAL_LABELS[row.signal_type] ?? row.signal_type,
    signalDate: row.signal_date,
    summary: String(row.signal_summary ?? '').replace(/\s+/g, ' ').trim(),
    evidence: Array.isArray(row.evidence_snippets) ? row.evidence_snippets.join(' ') : '',
    sourceUrl: row.source_url ?? '',
    confidence: row.confidence ?? '',
  }))
  .sort((a, b) => (a.signalDate < b.signalDate ? 1 : -1))
  .slice(0, maxCompanies)

if (entries.length === 0) {
  console.log(`No signals found in the last ${days} day(s). Nothing exported.`)
  process.exit(0)
}

// ── Apollo enrichment pass ───────────────────────────────────────────────────
let revealsUsed = 0
const peopleRows = []

for (const entry of entries) {
  entry.people = []
  entry.departedProspect = null
  if (skipApollo) continue

  const departure = isLikelyDeparture(entry)
  const roleFamily = departure ? detectDepartedRoleFamily(`${entry.summary} ${entry.evidence}`) : null
  const titles = departure
    ? (ADJACENT_DECISION_MAKERS[roleFamily] ?? ADJACENT_DECISION_MAKERS.default).slice(0, 2)
    : (TITLES_BY_SIGNAL[entry.signalType] ?? TITLES_BY_SIGNAL.default)

  const orgId = await apolloResolveOrgId(entry.domain)
  const found = await apolloPeopleSearch({
    companyName: entry.company,
    orgId,
    titles,
    perPage: departure ? 2 : 3,
  })

  entry.people = found
    .filter((p) => p.first_name && p.title)
    .slice(0, departure ? 2 : 3)
    .map((p) => ({
      kind: departure ? 'adjacent_decision_maker' : 'target_executive',
      firstName: p.first_name,
      lastInitial: p.last_name_obfuscated ? `${p.last_name_obfuscated.charAt(0)}.` : '',
      title: p.title,
      linkedinUrl: p.linkedin_url ?? '',
      email: '',
    }))

  // Departed person: extract name from signal text, then reveal via people/match
  // (their profile still lists LinkedIn even after leaving).
  if (departure) {
    const departedName = extractDepartedName(`${entry.summary} ${entry.evidence}`)
    if (departedName && revealsUsed < revealBudget) {
      const [firstName, ...rest] = departedName.split(' ')
      const revealed = await apolloRevealPerson({
        firstName,
        lastName: rest.join(' '),
        companyName: entry.company,
      })
      revealsUsed += 1
      entry.departedProspect = {
        kind: 'departed_prospect',
        name: revealed?.name ?? departedName,
        title: revealed?.title ?? `former ${roleFamily === 'default' ? 'executive' : roleFamily.toUpperCase()}`,
        linkedinUrl: revealed?.linkedinUrl ?? '',
        email: revealed?.email ?? '',
        currentCompany: revealed?.currentCompany ?? '',
        nameSource: revealed?.name ? 'apollo_reveal' : 'signal_text',
      }
    } else if (departedName) {
      entry.departedProspect = {
        kind: 'departed_prospect',
        name: departedName,
        title: `former ${roleFamily === 'default' ? 'executive' : roleFamily.toUpperCase()}`,
        linkedinUrl: '',
        email: '',
        currentCompany: '',
        nameSource: 'signal_text',
      }
    }
  }

  await sleep(250) // stay well under Apollo rate limits
}

// ── Build person-level rows with fully rendered scripts ─────────────────────
for (const entry of entries) {
  const companyScripts = scriptsForSignal(entry)

  for (const person of entry.people) {
    const rendered = renderScripts(companyScripts, person.firstName, person.title)
    peopleRows.push({
      company: entry.company,
      signal: entry.signalLabel,
      signalDate: entry.signalDate,
      kind: person.kind,
      name: `${person.firstName} ${person.lastInitial}`.trim(),
      title: person.title,
      linkedinUrl: person.linkedinUrl,
      email: person.email,
      ...rendered,
    })
  }

  if (entry.departedProspect) {
    const dp = entry.departedProspect
    const rendered = renderScripts(
      scriptsForDepartedProspect(entry),
      dp.name.split(' ')[0],
      dp.title.replace(/^former /, ''),
    )
    peopleRows.push({
      company: entry.company,
      signal: entry.signalLabel,
      signalDate: entry.signalDate,
      kind: dp.kind,
      name: dp.name,
      title: dp.title,
      linkedinUrl: dp.linkedinUrl,
      email: dp.email,
      note: dp.nameSource === 'signal_text' ? 'Name parsed from signal text - verify on LinkedIn before outreach' : '',
      ...rendered,
    })
  }
}

// ── Write outputs ────────────────────────────────────────────────────────────
fs.mkdirSync(path.dirname(outCsvPath), { recursive: true })

// Company-level CSV
const companyHeader = ['company', 'signal_type', 'signal_date', 'confidence', 'signal_summary', 'source_url', 'connection_request', 'day3_dm', 'founder_note']
const companyLines = [companyHeader.join(',')]
for (const entry of entries) {
  const scripts = scriptsForSignal(entry)
  companyLines.push([
    entry.company, entry.signalLabel, entry.signalDate, entry.confidence, entry.summary, entry.sourceUrl,
    scripts.connection_request, scripts.day3_dm, scripts.founder_note,
  ].map(csvEscape).join(','))
}
fs.writeFileSync(outCsvPath, `${companyLines.join('\n')}\n`, 'utf8')

// Person-level CSV
const peopleHeader = ['company', 'signal', 'signal_date', 'kind', 'name', 'title', 'linkedin_url', 'email', 'note', 'connection_request', 'day3_dm', 'founder_note']
const peopleLines = [peopleHeader.join(',')]
for (const p of peopleRows) {
  peopleLines.push([
    p.company, p.signal, p.signalDate, p.kind, p.name, p.title, p.linkedinUrl, p.email, p.note ?? '',
    p.connection_request, p.day3_dm, p.founder_note,
  ].map(csvEscape).join(','))
}
fs.writeFileSync(outPeopleCsvPath, `${peopleLines.join('\n')}\n`, 'utf8')

// Markdown review copy
const mdLines = []
mdLines.push(`# MO Outreach List - week of ${today}`)
mdLines.push('')
mdLines.push(`Window: last ${days} day(s) | Companies: ${entries.length} | People found: ${peopleRows.length}${skipApollo ? ' | APOLLO SKIPPED (no key or --skip-apollo)' : ''}`)
mdLines.push('')
mdLines.push('Rules: <=50 connection requests/week total, human-typed sends, no automation on the LinkedIn session, verify parsed names before outreach, never add outcome statistics to these scripts.')
mdLines.push('')
for (const entry of entries) {
  const scripts = scriptsForSignal(entry)
  mdLines.push(`## ${entry.company} - ${entry.signalLabel} (${entry.signalDate})`)
  mdLines.push('')
  mdLines.push(`Signal: ${entry.summary || '(no summary)'}${entry.sourceUrl ? ` | Source: ${entry.sourceUrl}` : ''}`)
  mdLines.push('')

  const entryPeople = peopleRows.filter((p) => p.company === entry.company)
  if (entryPeople.length > 0) {
    mdLines.push('People:')
    for (const p of entryPeople) {
      const kindLabel = p.kind === 'departed_prospect' ? 'DEPARTED PROSPECT' : p.kind === 'adjacent_decision_maker' ? 'Adjacent decision-maker' : 'Target executive'
      mdLines.push(`- [${kindLabel}] ${p.name} - ${p.title}${p.linkedinUrl ? ` - ${p.linkedinUrl}` : ''}${p.email ? ` - ${p.email}` : ''}${p.note ? ` (${p.note})` : ''}`)
    }
    mdLines.push('')
  }

  mdLines.push(`- Connection request (MO): ${scripts.connection_request}`)
  mdLines.push(`- Day-3 DM (MO): ${scripts.day3_dm}`)
  mdLines.push(`- Founder note (Richard): ${scripts.founder_note}`)

  const departed = entryPeople.find((p) => p.kind === 'departed_prospect')
  if (departed) {
    mdLines.push('')
    mdLines.push('Departed-prospect scripts (fully rendered):')
    mdLines.push(`- Connection request: ${departed.connection_request}`)
    mdLines.push(`- Day-3 DM: ${departed.day3_dm}`)
    mdLines.push(`- Founder note: ${departed.founder_note}`)
  }
  mdLines.push('')
}
fs.writeFileSync(outMdPath, `${mdLines.join('\n')}\n`, 'utf8')

// ── Optional email delivery (founder + MO) ───────────────────────────────────
if (sendEmailFlag) {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.error('--email requested but RESEND_API_KEY is missing')
    process.exit(1)
  }
  const recipients = [OWNER_EMAIL, process.env.MO_EMAIL].filter(Boolean)
  const attachment = (filePath) => ({
    filename: path.basename(filePath),
    content: fs.readFileSync(filePath).toString('base64'),
  })
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_ADDRESS ?? 'briefing@startingmonday.app',
      to: recipients,
      subject: `MO outreach list - week of ${today} (${entries.length} companies, ${peopleRows.length} people)`,
      html: `<p style="font-family:sans-serif;font-size:14px;color:#0f172a;">Weekly signal-led outreach list attached.</p>
        <ul style="font-family:sans-serif;font-size:13px;color:#334155;">
          <li>Window: last ${days} days</li>
          <li>Companies: ${entries.length}</li>
          <li>People found: ${peopleRows.length} (${peopleRows.filter((p) => p.kind === 'departed_prospect').length} departed prospects)</li>
          <li>Rules: max 50 connects/week, human-typed, verify parsed names before outreach.</li>
        </ul>`,
      attachments: [attachment(outCsvPath), attachment(outPeopleCsvPath), attachment(outMdPath)],
    }),
  })
  if (!res.ok) {
    console.error(`Email send failed: ${res.status} ${await res.text().catch(() => '')}`)
    process.exit(1)
  }
  const sendResult = await res.json().catch(() => ({}))
  console.log(`- emailed to: ${recipients.join(', ')} (resend id: ${sendResult.id ?? 'unknown'})`)

  // Poll delivery status so silent drops are visible in logs.
  if (sendResult.id) {
    await sleep(6000)
    try {
      const statusRes = await fetch(`https://api.resend.com/emails/${sendResult.id}`, {
        headers: { Authorization: `Bearer ${resendKey}` },
      })
      const detail = await statusRes.json().catch(() => ({}))
      console.log(`- delivery status: ${detail.last_event ?? 'unknown'} (from: ${detail.from ?? 'n/a'})`)
    } catch {
      console.log('- delivery status: check failed (non-fatal)')
    }
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────
const departedCount = peopleRows.filter((p) => p.kind === 'departed_prospect').length
const adjacentCount = peopleRows.filter((p) => p.kind === 'adjacent_decision_maker').length

console.log('MO outreach export')
console.log(`- window: last ${days} day(s)`)
console.log(`- companies exported: ${entries.length}`)
console.log(`- people found: ${peopleRows.length} (${adjacentCount} adjacent decision-makers, ${departedCount} departed prospects)`)
console.log(`- apollo reveals used: ${revealsUsed}/${revealBudget}`)
console.log(`- company csv: ${outCsvPath}`)
console.log(`- people csv: ${outPeopleCsvPath}`)
console.log(`- markdown: ${outMdPath}`)
if (skipApollo) console.log('- NOTE: Apollo enrichment skipped (set APOLLO_API_KEY or remove --skip-apollo)')
