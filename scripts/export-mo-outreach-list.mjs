#!/usr/bin/env node
/**
 * MO Weekly Outreach Export
 *
 * Exports fresh company transition signals into a CSV (and companion markdown)
 * that MO uses to build the week's LinkedIn outreach list in Apollo/Sales Navigator.
 *
 * Each row is one company + its strongest recent signal, with three
 * trigger-personalized scripts:
 *   1. connection_request  - MO sends (<=290 chars, LinkedIn connect note limit is 300)
 *   2. day3_dm             - MO sends after acceptance
 *   3. founder_note        - Richard's personal mid-sequence note (the one-brief close)
 *
 * Placeholders MO fills per prospect: [FIRST_NAME], [ROLE]
 * (Company name and event are already substituted.)
 *
 * Usage:
 *   node scripts/export-mo-outreach-list.mjs [--days=7] [--min-confidence=0] [--out=tmp/mo-outreach-list-YYYY-MM-DD.csv]
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (.env.local)
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

const argv = process.argv.slice(2)
function argValue(name, fallback) {
  const hit = argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.split('=')[1] : fallback
}

const days = Number(argValue('days', '7'))
const minConfidence = Number(argValue('min-confidence', '0'))
const today = new Date().toISOString().slice(0, 10)
const outCsvPath = argValue('out', path.join('tmp', `mo-outreach-list-${today}.csv`))
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

// Trigger-personalized scripts. Tone rules: peer-to-peer, no hype, no fake
// urgency, offer an artifact not a meeting, and never cite unverified stats.
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
  // LinkedIn connection notes cap at 300 chars; clamp with headroom for long first names.
  return {
    ...scripts,
    connection_request: truncate(scripts.connection_request, 285),
  }
}

function truncate(text, max) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 3).trim()}...`
}

function csvEscape(value) {
  const s = String(value ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

const { data: rows, error } = await supabase
  .from('company_signals')
  .select('company_id, signal_type, signal_summary, signal_date, source_url, confidence, companies(name)')
  .gte('signal_date', sinceIso.slice(0, 10))
  .order('signal_date', { ascending: false })
  .limit(1000)

if (error) {
  console.error(`Query failed: ${error.message}`)
  process.exit(1)
}

// Dedupe: strongest signal per company (highest confidence, then most recent).
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

const entries = [...byCompany.entries()]
  .map(([company, row]) => ({
    company,
    signalType: row.signal_type,
    signalLabel: SIGNAL_LABELS[row.signal_type] ?? row.signal_type,
    signalDate: row.signal_date,
    summary: String(row.signal_summary ?? '').replace(/\s+/g, ' ').trim(),
    sourceUrl: row.source_url ?? '',
    confidence: row.confidence ?? '',
  }))
  .sort((a, b) => (a.signalDate < b.signalDate ? 1 : -1))

if (entries.length === 0) {
  console.log(`No signals found in the last ${days} day(s). Nothing exported.`)
  process.exit(0)
}

// CSV
const header = [
  'company', 'signal_type', 'signal_date', 'confidence', 'signal_summary', 'source_url',
  'connection_request', 'day3_dm', 'founder_note',
]
const csvLines = [header.join(',')]
for (const entry of entries) {
  const scripts = scriptsForSignal(entry)
  csvLines.push([
    entry.company,
    entry.signalLabel,
    entry.signalDate,
    entry.confidence,
    entry.summary,
    entry.sourceUrl,
    scripts.connection_request,
    scripts.day3_dm,
    scripts.founder_note,
  ].map(csvEscape).join(','))
}

fs.mkdirSync(path.dirname(outCsvPath), { recursive: true })
fs.writeFileSync(outCsvPath, `${csvLines.join('\n')}\n`, 'utf8')

// Markdown companion (readable review copy for Richard/MO)
const mdLines = []
mdLines.push(`# MO Outreach List - week of ${today}`)
mdLines.push('')
mdLines.push(`Window: last ${days} day(s) | Companies: ${entries.length}`)
mdLines.push('')
mdLines.push('Rules: <=50 connection requests/week total, human-typed sends, no automation on the LinkedIn session, fill [FIRST_NAME] and [ROLE] per prospect, never add outcome statistics to these scripts.')
mdLines.push('')
for (const entry of entries) {
  const scripts = scriptsForSignal(entry)
  mdLines.push(`## ${entry.company} - ${entry.signalLabel} (${entry.signalDate})`)
  mdLines.push('')
  mdLines.push(`Signal: ${entry.summary || '(no summary)'}${entry.sourceUrl ? ` | Source: ${entry.sourceUrl}` : ''}`)
  mdLines.push('')
  mdLines.push(`- Connection request (MO): ${scripts.connection_request}`)
  mdLines.push(`- Day-3 DM (MO): ${scripts.day3_dm}`)
  mdLines.push(`- Founder note (Richard): ${scripts.founder_note}`)
  mdLines.push('')
}
fs.writeFileSync(outMdPath, `${mdLines.join('\n')}\n`, 'utf8')

// Connection-note length check (LinkedIn limit is 300 chars)
let overLimit = 0
for (const entry of entries) {
  const scripts = scriptsForSignal(entry)
  const rendered = scripts.connection_request.replace('[FIRST_NAME]', 'Alexandra')
  if (rendered.length > 300) overLimit += 1
}

console.log('MO outreach export')
console.log(`- window: last ${days} day(s)`)
console.log(`- companies exported: ${entries.length}`)
console.log(`- csv: ${outCsvPath}`)
console.log(`- markdown: ${outMdPath}`)
if (overLimit > 0) {
  console.warn(`- WARNING: ${overLimit} connection request(s) exceed 300 chars after name substitution - shorten before sending`)
}
