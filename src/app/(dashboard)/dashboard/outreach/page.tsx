import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { OutreachHubClient } from './outreach-hub-client'
import { getStaffMember } from '@/lib/staff'
import templateEngine from '@/lib/outreach/template-engine.cjs'

export const metadata = {
  title: 'Outreach Hub - Starting Monday',
}

type CsvRow = Record<string, string>
type OutreachChannel = 'executives' | 'search_firms' | 'coaches' | 'outplacement_firms'
type EmailConfidence = 'high' | 'medium' | 'low'

type CsvSummary = {
  rowCount: number
  rows: CsvRow[]
}

function prioritizeCuratedRows(base: CsvSummary, curated: CsvSummary, limit = 100): CsvSummary {
  const seenEmails = new Set<string>()
  const prioritized: CsvRow[] = []

  for (const row of [...curated.rows, ...base.rows]) {
    const email = (row.email_guess ?? row.email ?? '').trim().toLowerCase()
    if (!email || seenEmails.has(email)) continue
    seenEmails.add(email)
    prioritized.push(row)
    if (prioritized.length >= limit) break
  }

  return {
    rowCount: prioritized.length,
    rows: prioritized,
  }
}

function parseCsv(content: string): CsvSummary {
  if (!content.trim()) {
    return { rowCount: 0, rows: [] }
  }

  const records: string[][] = []
  let row: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const ch = content[i]

    if (ch === '"') {
      if (inQuotes && content[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (ch === ',' && !inQuotes) {
      row.push(current)
      current = ''
      continue
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && content[i + 1] === '\n') i++
      row.push(current)
      current = ''
      if (row.some(cell => cell.length > 0)) {
        records.push(row)
      }
      row = []
      continue
    }

    current += ch
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current)
    if (row.some(cell => cell.length > 0)) {
      records.push(row)
    }
  }

  if (records.length === 0) {
    return { rowCount: 0, rows: [] }
  }

  const [headers, ...lines] = records
  const rows = lines.map((cols) => {
    const mapped: CsvRow = {}
    for (let i = 0; i < headers.length; i++) {
      mapped[headers[i]] = cols[i] ?? ''
    }
    return mapped
  })

  return { rowCount: rows.length, rows }
}

function normalizeStatus(raw: string | undefined): string {
  const status = (raw ?? '').trim().toLowerCase()
  if (status === 'new') return 'prospect'
  if (status === 'first_sent' || status === 'followup_1_sent' || status === 'followup_2_sent') return 'reached_out'
  if (status === 'replied') return 'in_conversation'
  if (status === 'meeting_booked') return 'meeting_scheduled'
  if (status === 'not_a_fit') return 'closed'
  if (['prospect', 'reached_out', 'in_conversation', 'meeting_scheduled', 'closed'].includes(status)) return status
  return 'prospect'
}

function buildDefaultBody(row: CsvRow): string {
  const opening = row.email_opening?.trim() || `I noticed your role at ${row.company} and wanted to send a short, specific note.`
  const core = row.email_body_core?.trim() || 'I work on executive positioning and outreach for senior operators navigating high-stakes transitions.'

  return [
    opening,
    '',
    core,
    '',
    'If useful, I can send a concise follow-up with one specific angle tailored to your priorities.',
    '',
    'Best,',
    'Rich Rothschild',
    'startingmonday.app',
  ].join('\n')
}

type ExecutiveRoleArchetype =
  | 'cfo'
  | 'coo'
  | 'cio'
  | 'cto'
  | 'chro'
  | 'cro'
  | 'ciso'
  | 'cdo'
  | 'c_suite_other'

function firstNameOf(fullName: string | undefined): string {
  const value = (fullName ?? '').trim()
  if (!value) return 'there'
  const first = value.split(/\s+/)[0]?.trim()
  return first || 'there'
}

function detectExecutiveRoleArchetype(row: CsvRow): ExecutiveRoleArchetype | null {
  const role = canonicalizeLabel(row.role_bucket)
  const title = canonicalizeLabel(row.title)
  const combined = `${role} ${title}`.trim()

  if (!combined) return null

  if (combined.includes('cfo') || combined.includes('chief financial officer')) return 'cfo'
  if (combined.includes('coo') || combined.includes('chief operating officer')) return 'coo'
  if (combined.includes('cio') || combined.includes('chief information officer')) return 'cio'
  if (combined.includes('cto') || combined.includes('chief technology officer')) return 'cto'
  if (combined.includes('chro') || combined.includes('chief human resources officer') || combined.includes('chief people officer')) return 'chro'
  if (combined.includes('cro') || combined.includes('chief revenue officer')) return 'cro'
  if (combined.includes('ciso') || combined.includes('chief information security officer')) return 'ciso'
  if (combined.includes('cdo') || combined.includes('chief data officer') || combined.includes('chief analytics officer')) return 'cdo'

  const cSuiteSignals = ['chief', 'ceo', 'president']
  if (cSuiteSignals.some(signal => combined.includes(signal))) return 'c_suite_other'
  return null
}

function executiveRoleLabel(archetype: ExecutiveRoleArchetype): string {
  if (archetype === 'cfo') return 'CFO'
  if (archetype === 'coo') return 'COO'
  if (archetype === 'cio') return 'CIO'
  if (archetype === 'cto') return 'CTO'
  if (archetype === 'chro') return 'CHRO'
  if (archetype === 'cro') return 'CRO'
  if (archetype === 'ciso') return 'CISO'
  if (archetype === 'cdo') return 'CDO'
  return 'C-suite'
}

function companyToken(company: string | undefined): string {
  const value = (company ?? '').trim()
  return value || 'your organization'
}

function csvPersonalizedOpening(row: CsvRow, company: string): string {
  const opening = (row.email_opening ?? '').trim()
  if (opening) return opening

  const personalizationLine = (row.personalization_line ?? '').trim()
  if (personalizationLine) return personalizationLine

  const personaFocus = (row.persona_focus ?? '').trim()
  const roleSignal = (row.role_bucket ?? row.title ?? '').trim()

  if (personaFocus && roleSignal) {
    return `I have been following your ${roleSignal} work at ${company}, especially your focus on ${personaFocus}.`
  }
  if (personaFocus) {
    return `Your focus on ${personaFocus} at ${company} stood out.`
  }
  if (roleSignal) {
    return `I have been following your ${roleSignal} leadership at ${company}.`
  }

  return `I have been following your work at ${company}.`
}

function executiveSpecificOpening(row: CsvRow, company: string): string {
  const roleSignal = (row.role_bucket ?? row.title ?? 'leadership').trim()
  const personaFocus = (row.persona_focus ?? '').trim()

  if (personaFocus) {
    return `I have been following how you are driving ${personaFocus} as ${roleSignal} at ${company}.`
  }

  return `I have been following your ${roleSignal} leadership at ${company}.`
}

function sourceTemplateDraft(row: CsvRow): { subject: string; body: string } | null {
  const subject = (row.default_subject ?? row.subject ?? row.email_subject ?? '').trim()
  const body = (row.default_body ?? row.email_body ?? row.email_text ?? row.email_body_core ?? '').trim()

  if (!subject && !body) return null

  return {
    subject: subject || buildDefaultSubject(row),
    body: body || buildDefaultBody(row),
  }
}

function focusText(raw: string | undefined): string {
  const value = (raw ?? '').trim()
  return value || 'senior transition'
}

function proofLineForFocus(focus: string): string {
  const normalized = focus.toUpperCase()
  if (normalized.includes('CFO') || normalized.includes('FINANCE')) return 'faster translation of finance credibility into board-readable transition narratives'
  if (normalized.includes('CTO') || normalized.includes('TECH')) return 'clearer architecture-to-business messaging before first stakeholder interviews'
  if (normalized.includes('COO') || normalized.includes('OPER')) return 'stronger execution-cadence proof in early outreach and screening calls'
  if (normalized.includes('CISO') || normalized.includes('SECUR')) return 'higher-confidence risk and resilience framing for non-technical decision-makers'
  if (normalized.includes('CHRO') || normalized.includes('PEOPLE')) return 'more credible people-and-change leadership signaling in first-touch conversations'
  if (normalized.includes('CEO') || normalized.includes('BOARD')) return 'cleaner board-readiness signal and tighter strategic positioning in early conversations'
  if (normalized.includes('VP')) return 'clearer next-scope readiness proof supported by concrete execution examples'
  return 'cleaner role-specific positioning supported by measurable execution evidence'
}

function stakesLineForFocus(focus: string, company: string): string {
  const normalized = focus.toUpperCase()
  if (normalized.includes('CFO') || normalized.includes('FINANCE')) return `For ${focus} leaders at ${company}, the real risk is sounding competent but not board-ready when the first serious conversation starts.`
  if (normalized.includes('CTO') || normalized.includes('TECH')) return `For ${focus} leaders at ${company}, the real risk is being seen as technically strong but too abstract for a CEO, board, or investor audience.`
  if (normalized.includes('COO') || normalized.includes('OPER')) return `For ${focus} leaders at ${company}, the real risk is being known for execution without proving the scale and sequencing that the next role requires.`
  if (normalized.includes('CISO') || normalized.includes('SECUR')) return `For ${focus} leaders at ${company}, the real risk is having the right expertise but losing the room before the business impact lands.`
  if (normalized.includes('CHRO') || normalized.includes('PEOPLE')) return `For ${focus} leaders at ${company}, the real risk is describing culture work in a way that feels soft instead of decisive.`
  if (normalized.includes('CEO') || normalized.includes('BOARD')) return `For ${focus} leaders at ${company}, the real risk is under-selling governance, scale, and decision quality in the first conversation.`
  if (normalized.includes('VP')) return `For ${focus} leaders at ${company}, the real risk is sounding ready for more scope without proving what changes at the higher level.`
  return `For ${focus} leaders at ${company}, the real risk is sounding credible in theory but not specific enough to move the conversation forward.`
}

function benchmarkAssetForFocus(focus: string): string {
  const normalized = focus.toUpperCase()
  if (normalized.includes('CFO') || normalized.includes('FINANCE')) return 'the CFO board-readiness scorecard'
  if (normalized.includes('CTO') || normalized.includes('TECH')) return 'the CTO architecture-to-business benchmark'
  if (normalized.includes('COO') || normalized.includes('OPER')) return 'the COO sequencing and operating cadence benchmark'
  if (normalized.includes('CISO') || normalized.includes('SECUR')) return 'the CISO risk narrative benchmark'
  if (normalized.includes('CHRO') || normalized.includes('PEOPLE')) return 'the leadership-change benchmark'
  if (normalized.includes('CEO') || normalized.includes('BOARD')) return 'the board-readiness benchmark'
  if (normalized.includes('VP')) return 'the next-scope readiness benchmark'
  return 'the role-specific benchmark sheet'
}

function microProofLine(channel: 'executive' | 'coach' | 'outplacement', focus: string): string {
  const normalized = focus.toUpperCase()
  if (channel === 'coach') {
    if (normalized.includes('CEO') || normalized.includes('BOARD')) return 'In recent board-track coaching engagements, the strongest lift came when governance fit was stated explicitly in the opening two conversations.'
    if (normalized.includes('CFO') || normalized.includes('FINANCE')) return 'In recent finance-track transitions, response quality improved when candidates led with strategic capital judgment before technical detail.'
    if (normalized.includes('CTO') || normalized.includes('TECH')) return 'In recent technology-track transitions, interview progression improved when architecture work was translated into business risk and growth impact.'
    if (normalized.includes('COO') || normalized.includes('OPER')) return 'In recent operations-track transitions, progression improved when sequencing decisions were made explicit instead of implied.'
    return 'In recent executive coaching engagements, progression improved when first-touch messaging was rewritten for role-specific decision criteria.'
  }
  if (channel === 'outplacement') {
    if (normalized.includes('EXECUTIVE')) return 'In recent executive cohorts, qualified-conversation rate improved after first-touch narrative standards were normalized across coaches.'
    if (normalized.includes('CAREER') || normalized.includes('MOBILITY')) return 'In recent mobility programs, quality variance dropped when every participant used the same role-specific opening narrative framework.'
    if (normalized.includes('LEADERSHIP') || normalized.includes('TRANSITION')) return 'In recent transition programs, readiness improved when interview preparation and outreach language were measured against one shared benchmark.'
    return 'In recent outplacement cohorts, progression improved when candidate narratives were reviewed against a single measurable quality standard.'
  }
  if (normalized.includes('CFO') || normalized.includes('FINANCE')) return 'In recent CFO-track transitions, first conversations improved when board language and capital allocation logic were explicit from minute one.'
  if (normalized.includes('CTO') || normalized.includes('TECH')) return 'In recent CTO-track transitions, response quality improved when technical depth was translated into operating outcomes and decision impact.'
  if (normalized.includes('COO') || normalized.includes('OPER')) return 'In recent COO-track transitions, conversion improved when execution stories included sequencing decisions and operating leverage proof.'
  if (normalized.includes('CISO') || normalized.includes('SECUR')) return 'In recent CISO-track transitions, momentum improved when risk language was framed in business continuity and trust terms.'
  return 'In recent executive transitions, progression improved when role-specific narratives were tested and revised before high-stakes conversations.'
}

function costOfInactionLine(channel: 'executive' | 'coach' | 'outplacement'): string {
  if (channel === 'coach') {
    return 'If this is ignored, the cost is usually another cycle of well-qualified clients getting filtered out because their first narrative is not decision-grade.'
  }
  if (channel === 'outplacement') {
    return 'If this is ignored, the cost is usually program activity without qualified progression, which lowers confidence in cohort outcomes.'
  }
  return 'If this is ignored, the cost is usually losing qualified opportunities before the role-fit conversation ever gets a fair read.'
}

function binaryCtaLine(asset: string, audience: string): string {
  return `If useful, reply "send it" and I will send ${asset} for your ${audience}. If not relevant, reply "pass" and I will close this out.`
}

function coachStakesLineForFocus(focus: string, company: string): string {
  const normalized = focus.toUpperCase()
  if (normalized.includes('CEO') || normalized.includes('BOARD')) return `For ${focus} clients at ${company}, the failure mode is simple: they look accomplished, then lose momentum because governance and board-fit are not explicit in the first two conversations.`
  if (normalized.includes('CFO') || normalized.includes('FINANCE')) return `For ${focus} clients at ${company}, the failure mode is sounding financially credible but not investment-grade for board and CEO audiences.`
  if (normalized.includes('CTO') || normalized.includes('TECH')) return `For ${focus} clients at ${company}, the failure mode is deep technical credibility paired with weak business translation in first-touch conversations.`
  if (normalized.includes('COO') || normalized.includes('OPER')) return `For ${focus} clients at ${company}, the failure mode is being known as reliable operators without proving scale leverage for the next mandate.`
  return `For ${focus} clients at ${company}, the failure mode is looking qualified on paper but losing signal quality in live conversations.`
}

function coachProofPointForFocus(focus: string): string {
  const normalized = focus.toUpperCase()
  if (normalized.includes('CEO') || normalized.includes('BOARD')) return 'a board narrative that can be explained in one minute without hand-waving'
  if (normalized.includes('CFO') || normalized.includes('FINANCE')) return 'a finance-first narrative that reads as strategic judgment, not just stewardship'
  if (normalized.includes('CTO') || normalized.includes('TECH')) return 'a technical narrative that maps directly to revenue, risk, and execution outcomes'
  if (normalized.includes('COO') || normalized.includes('OPER')) return 'an operating narrative that proves sequencing, scale, and decision velocity'
  return 'a role narrative that survives hard follow-up questions without drifting into generic language'
}

function coachAssetForFocus(focus: string): string {
  const normalized = focus.toUpperCase()
  if (normalized.includes('CEO') || normalized.includes('BOARD')) return 'the board-readiness interview map'
  if (normalized.includes('CFO') || normalized.includes('FINANCE')) return 'the CFO investment-grade narrative sheet'
  if (normalized.includes('CTO') || normalized.includes('TECH')) return 'the CTO business-translation interview map'
  if (normalized.includes('COO') || normalized.includes('OPER')) return 'the COO sequencing and scale interview map'
  return 'the executive signal-quality interview map'
}

function outplacementStakesLine(focus: string, company: string): string {
  const normalized = focus.toUpperCase()
  const label = /programs?$/i.test(focus) ? focus : `${focus} programs`
  if (normalized.includes('EXECUTIVE')) return `For ${label} at ${company}, the failure mode is high candidate activity but low qualified progression because first-touch narratives are inconsistent.`
  if (normalized.includes('CAREER') || normalized.includes('MOBILITY')) return `For ${label} at ${company}, the failure mode is strong coaching effort with uneven narrative quality across cohorts.`
  if (normalized.includes('LEADERSHIP') || normalized.includes('TRANSITION')) return `For ${label} at ${company}, the failure mode is candidates moving fast but entering senior conversations underprepared.`
  return `For ${label} at ${company}, the failure mode is operational activity that does not convert into consistent executive-level conversation quality.`
}

function outplacementProofPoint(focus: string): string {
  const normalized = focus.toUpperCase()
  if (normalized.includes('EXECUTIVE')) return 'a consistent first-conversation standard across high-variance senior cohorts'
  if (normalized.includes('CAREER') || normalized.includes('MOBILITY')) return 'a cleaner narrative baseline that reduces coach-to-coach quality variance'
  if (normalized.includes('LEADERSHIP') || normalized.includes('TRANSITION')) return 'faster readiness for high-stakes conversations without adding coordinator overhead'
  return 'a measurable progression standard from targeting to first qualified conversation'
}

function outplacementAssetForFocus(focus: string): string {
  const normalized = focus.toUpperCase()
  if (normalized.includes('EXECUTIVE')) return 'the executive cohort progression benchmark'
  if (normalized.includes('CAREER') || normalized.includes('MOBILITY')) return 'the mobility cohort narrative benchmark'
  if (normalized.includes('LEADERSHIP') || normalized.includes('TRANSITION')) return 'the transition-readiness benchmark'
  return 'the program-level progression benchmark'
}

function buildStandardizedDraft(row: CsvRow, channel: OutreachChannel): { subject: string; body: string } {
  const sourceDraft = sourceTemplateDraft(row)
  if (sourceDraft) return sourceDraft

  const firstName = firstNameOf(row.full_name)
  const company = companyToken(row.company)
  const archetype = detectExecutiveRoleArchetype(row)
  const roleLabel = archetype ? executiveRoleLabel(archetype) : (row.role_bucket || 'Executive')

  return templateEngine.buildLatestTemplateDraft({
    channel,
    firstName,
    company,
    roleLabel,
    focus: row.persona_focus || row.role_bucket || row.title || roleLabel,
    step: row.step,
  })
}

function buildDefaultSubject(row: CsvRow): string {
  const role = row.role_bucket?.toUpperCase() || 'Executive'
  return `A specific ${role} angle for ${row.company}`
}

function normalizeFitTier(raw: string | undefined): 'strong' | 'medium' {
  const fit = (raw ?? '').trim().toLowerCase()
  return fit === 'medium' ? 'medium' : 'strong'
}

function canonicalizeLabel(value: string | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function normalizeCompanyKey(value: string | undefined): string {
  return canonicalizeLabel(value)
    .replace(/\b(inc|incorporated|corp|corporation|co|company|group|holdings|plc|llc|ltd|limited|communications)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseCompanySizeBand(value: string | undefined): 'target' | 'other' | 'unknown' {
  const normalized = canonicalizeLabel(value)
  if (!normalized) return 'unknown'

  if (normalized.includes('1001 10000')) return 'target'
  if (normalized.includes('10001')) return 'other'
  if (normalized.includes('enterprise') || normalized.includes('startup') || normalized.includes('small')) return 'other'

  const numeric = Number(normalized.replace(/[^0-9]/g, ''))
  if (Number.isFinite(numeric) && numeric > 0) {
    if (numeric > 1000 && numeric < 10000) return 'target'
    return 'other'
  }

  return 'unknown'
}

function roleTokens(value: string): Set<string> {
  const normalized = canonicalizeLabel(value)
  const roles = new Set<string>()

  if (!normalized) return roles

  const add = (...items: string[]) => items.forEach(item => roles.add(item))

  if (normalized.includes('cfo') || normalized.includes('chief financial officer')) add('cfo', 'chief financial officer')
  if (normalized.includes('coo') || normalized.includes('chief operating officer')) add('coo', 'chief operating officer')
  if (normalized.includes('cio') || normalized.includes('chief information officer')) add('cio', 'chief information officer')
  if (normalized.includes('chro') || normalized.includes('chief human resources officer') || normalized.includes('chief people officer')) add('chro', 'chief people officer')
  if (normalized.includes('cro') || normalized.includes('chief revenue officer')) add('cro', 'chief revenue officer')
  if (normalized.includes('cto') || normalized.includes('chief technology officer')) add('cto', 'chief technology officer')
  if (normalized.includes('ciso') || normalized.includes('chief information security officer')) add('ciso', 'chief information security officer')
  if (normalized.includes('cdo') || normalized.includes('chief data officer')) add('cdo', 'chief data officer')
  if (normalized.includes('chief analytics officer')) add('chief analytics officer')
  if (normalized.includes('vp it') || normalized.includes('vp information technology')) add('vp it', 'vp information technology')
  if (normalized.includes('vp sales')) add('vp sales')
  if (normalized.includes('vp revenue')) add('vp revenue')
  if (normalized.includes('vp technology')) add('vp technology')
  if (normalized.includes('vp engineering')) add('vp engineering')

  if (roles.size === 0) {
    roles.add(normalized)
  }

  return roles
}

function buildExecutiveFitLookup(rows: CsvRow[]): Map<string, Map<string, 'strong' | 'medium'>> {
  const lookup = new Map<string, Map<string, 'strong' | 'medium'>>()

  for (const row of rows) {
    const companyKey = normalizeCompanyKey(row.target_account ?? row.company)
    const title = row.target_title ?? row.title ?? row.role_bucket
    const fitTier = normalizeFitTier(row.fit_tier)
    const roleSet = roleTokens(title ?? '')

    if (!companyKey || roleSet.size === 0) continue

    const companyRoles = lookup.get(companyKey) ?? new Map<string, 'strong' | 'medium'>()
    for (const role of roleSet) {
      const existing = companyRoles.get(role)
      if (existing === 'strong') continue
      companyRoles.set(role, fitTier)
    }
    lookup.set(companyKey, companyRoles)
  }

  return lookup
}

function buildExecutiveCompanySizeLookup(rows: CsvRow[]): Map<string, 'target' | 'other'> {
  const lookup = new Map<string, 'target' | 'other'>()

  for (const row of rows) {
    const companyKey = normalizeCompanyKey(row.target_account ?? row.company)
    const sizeBand = parseCompanySizeBand(row.company_size_band ?? row.company_size)
    if (!companyKey || sizeBand === 'unknown') continue

    const existing = lookup.get(companyKey)
    if (existing === 'target') continue
    lookup.set(companyKey, sizeBand)
  }

  return lookup
}

function executivePersonaFit(
  row: CsvRow,
  fitLookup: Map<string, Map<string, 'strong' | 'medium'>>,
  companySizeLookup: Map<string, 'target' | 'other'>,
): 'strong' | 'medium' | null {
  const companyKey = normalizeCompanyKey(row.company)
  const companySizeFromRow = parseCompanySizeBand(row.company_size_band ?? row.company_size)
  const companySize = companySizeFromRow === 'unknown' ? (companySizeLookup.get(companyKey) ?? 'unknown') : companySizeFromRow

  // Executive strong/medium targeting only applies to the midmarket band (1001-10000).
  if (companySize !== 'target') return null

  const explicitFit = (row.fit_tier ?? '').trim().toLowerCase()
  if (explicitFit === 'strong' || explicitFit === 'medium') return explicitFit

  const roleCandidates = roleTokens(`${row.role_bucket ?? ''} ${row.title ?? ''}`)

  if (companyKey && roleCandidates.size > 0) {
    const companyRoles = fitLookup.get(companyKey)
    if (companyRoles) {
      for (const role of roleCandidates) {
        const matched = companyRoles.get(role)
        if (matched) return matched
      }
    }
  }

  const role = canonicalizeLabel(row.role_bucket)
  const title = canonicalizeLabel(row.title)
  const combined = `${role} ${title}`.trim()

  const strongSignals = [
    'cfo',
    'coo',
    'cio',
    'chro',
    'chief people officer',
    'cro',
    'chief revenue officer',
    'vp it',
    'vp information technology',
    'vp sales',
    'vp revenue',
  ]

  const mediumSignals = [
    'cto',
    'vp technology',
    'vp engineering',
    'ciso',
    'chief information security officer',
    'cdo',
    'chief data officer',
    'chief analytics officer',
  ]

  let score = 0

  if (strongSignals.some(signal => combined.includes(signal))) score += 70
  if (mediumSignals.some(signal => combined.includes(signal))) score += 45

  const sourceType = canonicalizeLabel(row.source_type)
  if (sourceType.includes('leadership') || sourceType.includes('investor') || sourceType.includes('company')) {
    score += 10
  }

  const confidence = (row.confidence ?? row.email_confidence ?? '').trim().toLowerCase()
  if (confidence === 'high') score += 10
  if (confidence === 'medium') score += 5

  if (score >= 70) return 'strong'
  if (score >= 45) return 'medium'
  return null
}

function normalizeEmailConfidence(raw: string | undefined): EmailConfidence | null {
  const confidence = (raw ?? '').trim().toLowerCase()
  if (confidence === 'high' || confidence === 'medium' || confidence === 'low') return confidence
  return null
}

function inferEmailConfidence(row: CsvRow): EmailConfidence {
  const explicit = normalizeEmailConfidence(row.email_confidence)
  if (explicit) return explicit

  const email = (row.email_guess ?? row.email ?? '').trim().toLowerCase()
  const company = (row.company ?? '').trim().toLowerCase()
  const sourceType = (row.source_type ?? '').trim().toLowerCase()

  const domain = email.includes('@') ? email.split('@')[1] : ''
  const domainRoot = domain.split('.')[0] ?? ''
  const freeEmailDomains = new Set(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com'])
  if (!domain || freeEmailDomains.has(domain)) return 'low'

  const stopWords = new Set(['inc', 'llc', 'ltd', 'group', 'partners', 'partner', 'search', 'executive', 'leadership', 'advisors'])
  const companyTokens = company
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length >= 4 && !stopWords.has(token))

  const domainMatchesCompany = companyTokens.some(token => domainRoot.includes(token) || token.includes(domainRoot))

  if (sourceType.includes('verified')) return 'high'
  if (sourceType.includes('curated') && domainMatchesCompany) return 'high'
  if (sourceType.includes('inferred') && domainMatchesCompany) return 'medium'
  if (domainMatchesCompany) return 'high'
  if (sourceType.includes('inferred')) return 'low'
  return 'medium'
}

function emailConfidenceRank(confidence: EmailConfidence): number {
  if (confidence === 'high') return 3
  if (confidence === 'medium') return 2
  return 1
}

function mergeFirstTouch(master: CsvSummary, firstTouch: CsvSummary): CsvSummary {
  const byName = new Map<string, CsvRow>()
  for (const row of firstTouch.rows) {
    byName.set((row.full_name ?? '').trim().toLowerCase(), row)
  }

  const merged = master.rows.map((row) => {
    const touch = byName.get((row.full_name ?? '').trim().toLowerCase())
    return {
      ...row,
      default_subject: touch?.subject ?? buildDefaultSubject(row),
      default_body: touch?.email_text ?? buildDefaultBody(row),
    }
  })

  return { rowCount: merged.length, rows: merged }
}

function rowCompletenessScore(row: CsvRow): number {
  const fields = [
    row.email_guess,
    row.email,
    row.role_bucket,
    row.title,
    row.default_subject,
    row.default_body,
    row.subject,
    row.email_text,
    row.email_opening,
    row.email_body_core,
    row.personalization_line,
    row.persona_focus,
  ]
  return fields.reduce((sum, value) => sum + ((value ?? '').trim().length > 0 ? 1 : 0), 0)
}

function normalizeExecutiveRow(row: CsvRow): CsvRow {
  return {
    ...row,
    default_subject: (row.default_subject ?? '').trim() || (row.subject ?? '').trim(),
    default_body: (row.default_body ?? '').trim() || (row.email_text ?? '').trim(),
    email_opening: (row.email_opening ?? '').trim() || (row.personalization_line ?? '').trim(),
    email_body_core: (row.email_body_core ?? '').trim() || (row.email_text ?? '').trim(),
  }
}

function combineExecutiveSources(sources: CsvSummary[]): CsvSummary {
  const byKey = new Map<string, CsvRow>()

  for (const source of sources) {
    for (const rawRow of source.rows) {
      const row = normalizeExecutiveRow(rawRow)
      const email = (row.email_guess ?? row.email ?? '').trim().toLowerCase()
      const fallbackKey = `${(row.full_name ?? '').trim().toLowerCase()}|${(row.company ?? '').trim().toLowerCase()}`
      const key = email || fallbackKey
      if (!key) continue

      const existing = byKey.get(key)
      if (!existing) {
        byKey.set(key, row)
        continue
      }

      if (rowCompletenessScore(row) > rowCompletenessScore(existing)) {
        byKey.set(key, row)
      }
    }
  }

  const rows = Array.from(byKey.values())
  return { rowCount: rows.length, rows }
}

async function readOutreachCsv(fileName: string): Promise<CsvSummary> {
  const fullPath = path.join(process.cwd(), 'docs', 'outreach', fileName)
  const content = await readFile(fullPath, 'utf8')
  return parseCsv(content)
}

type ClientRow = {
  fullName: string
  roleBucket: string
  company: string
  email: string
  emailConfidence: EmailConfidence
  status: string
  emailOpening: string
  emailBodyCore: string
  defaultSubject: string
  defaultBody: string
  outreachChannel: OutreachChannel
  fitTier: 'strong' | 'medium'
  personaFocus: string
}

type ContactStatusRow = {
  email: string | null
  outreach_status: string | null
}

function statusByEmail(rows: ContactStatusRow[]): Map<string, string> {
  const byEmail = new Map<string, string>()
  for (const row of rows) {
    const email = (row.email ?? '').trim().toLowerCase()
    if (!email) continue
    byEmail.set(email, normalizeStatus(row.outreach_status ?? 'prospect'))
  }
  return byEmail
}

export default async function OutreachHubPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const [executiveRaw, executiveStrict100, executiveStrict50, executiveStrict31, executiveStrict21, executiveBatch1, executiveBatch1Strict, executiveBatch2Strict, executiveBatch3Personalized, executiveBatch4Personalized, apolloSendReady, apolloFollowups, executiveTargetSlate, firstTouch, searchFirmRaw, coachRaw, outplacementRaw, searchFirmCurated, coachCurated, rawContactStatuses] = await Promise.all([
    readOutreachCsv('executives_prospecting_midmarket_strong_medium.csv'),
    readOutreachCsv('prospecting_combined_strict_100.csv'),
    readOutreachCsv('prospecting_combined_strict_50_personalized.csv'),
    readOutreachCsv('prospecting_combined_strict_31_personalized.csv'),
    readOutreachCsv('prospecting_combined_strict_21_personalized.csv'),
    readOutreachCsv('prospecting_batch_001.csv'),
    readOutreachCsv('prospecting_batch_001_strict_roles.csv'),
    readOutreachCsv('prospecting_batch_002_strict_roles.csv'),
    readOutreachCsv('prospecting_batch_003_personalized_real_10.csv'),
    readOutreachCsv('prospecting_batch_004_personalized_real_19.csv'),
    readOutreachCsv('apollo_priority_send_ready.csv'),
    readOutreachCsv('apollo_priority_followups.csv'),
    readOutreachCsv('us-senior-executive-target-slate.csv'),
    readOutreachCsv('send_ready_emails_first_10.csv'),
    readOutreachCsv('search_firms_prospecting_100.csv'),
    readOutreachCsv('coaches_prospecting_100.csv'),
    readOutreachCsv('outplacement_firms_prospecting_100.csv'),
    readOutreachCsv('search_firms_prospecting_curated_top25.csv'),
    readOutreachCsv('coaches_prospecting_curated_top25.csv'),
    supabase
      .from('contacts')
      .select('email, outreach_status')
      .eq('user_id', user.id)
      .eq('status', 'active'),
  ])
  const executiveUniverse = combineExecutiveSources([
    executiveRaw,
    executiveStrict100,
    executiveStrict50,
    executiveStrict31,
    executiveStrict21,
    executiveBatch1,
    executiveBatch1Strict,
    executiveBatch2Strict,
    executiveBatch3Personalized,
    executiveBatch4Personalized,
    apolloSendReady,
    apolloFollowups,
  ])
  const executives = mergeFirstTouch(executiveUniverse, firstTouch)
  const executiveFitLookup = buildExecutiveFitLookup(executiveTargetSlate.rows)
  const executiveCompanySizeLookup = buildExecutiveCompanySizeLookup(executiveTargetSlate.rows)
  const prioritizedSearchFirms = prioritizeCuratedRows(searchFirmRaw, searchFirmCurated)
  const prioritizedCoaches = prioritizeCuratedRows(coachRaw, coachCurated)
  const mappedStatuses = statusByEmail((rawContactStatuses.data ?? []) as ContactStatusRow[])
  const executivePersonaRows: ClientRow[] = executives.rows
    .map((row): ClientRow | null => {
      const personaFit = executivePersonaFit(row, executiveFitLookup, executiveCompanySizeLookup)
      if (!personaFit) return null
      const standardizedDraft = buildStandardizedDraft(row, 'executives')

      return {
        fullName: row.full_name ?? '',
        roleBucket: row.role_bucket ?? 'Executive',
        company: row.company ?? '',
        email: (row.email_guess ?? row.email ?? '').trim().toLowerCase(),
        emailConfidence: inferEmailConfidence(row),
        status: normalizeStatus(row.status),
        emailOpening: row.email_opening ?? '',
        emailBodyCore: row.email_body_core ?? '',
        defaultSubject: standardizedDraft.subject,
        defaultBody: standardizedDraft.body,
        outreachChannel: 'executives' as const,
        fitTier: personaFit,
        personaFocus: row.persona_focus ?? row.role_bucket ?? 'C-suite transitions',
      }
    })
    .filter((row): row is ClientRow => row !== null)

  const allRows: ClientRow[] = [
    ...executivePersonaRows,
    ...prioritizedSearchFirms.rows.map((row) => ({
      ...(() => {
        const draft = buildStandardizedDraft(row, 'search_firms')
        return {
          defaultSubject: draft.subject,
          defaultBody: draft.body,
        }
      })(),
      fullName: row.full_name ?? '',
      roleBucket: row.role_bucket ?? 'Partner',
      company: row.company ?? '',
      email: (row.email_guess ?? row.email ?? '').trim().toLowerCase(),
      emailConfidence: inferEmailConfidence(row),
      status: normalizeStatus(row.status),
      emailOpening: row.email_opening ?? '',
      emailBodyCore: row.email_body_core ?? '',
      outreachChannel: 'search_firms' as const,
      fitTier: normalizeFitTier(row.fit_tier),
      personaFocus: row.persona_focus ?? 'CFO, COO, CIO, CHRO, CRO searches',
    })),
    ...prioritizedCoaches.rows.map((row) => ({
      ...(() => {
        const draft = buildStandardizedDraft(row, 'coaches')
        return {
          defaultSubject: draft.subject,
          defaultBody: draft.body,
        }
      })(),
      fullName: row.full_name ?? '',
      roleBucket: row.role_bucket ?? 'Executive Coach',
      company: row.company ?? '',
      email: (row.email_guess ?? row.email ?? '').trim().toLowerCase(),
      emailConfidence: inferEmailConfidence(row),
      status: normalizeStatus(row.status),
      emailOpening: row.email_opening ?? '',
      emailBodyCore: row.email_body_core ?? '',
      outreachChannel: 'coaches' as const,
      fitTier: normalizeFitTier(row.fit_tier),
      personaFocus: row.persona_focus ?? 'CIO, CTO, CISO, COO, CFO transitions',
    })),
    ...outplacementRaw.rows.map((row) => ({
      ...(() => {
        const draft = buildStandardizedDraft(row, 'outplacement_firms')
        return {
          defaultSubject: draft.subject,
          defaultBody: draft.body,
        }
      })(),
      fullName: row.full_name ?? '',
      roleBucket: row.role_bucket ?? 'Outplacement Partner',
      company: row.company ?? '',
      email: (row.email_guess ?? row.email ?? '').trim().toLowerCase(),
      emailConfidence: inferEmailConfidence(row),
      status: normalizeStatus(row.status),
      emailOpening: row.email_opening ?? '',
      emailBodyCore: row.email_body_core ?? '',
      outreachChannel: 'outplacement_firms' as const,
      fitTier: normalizeFitTier(row.fit_tier),
      personaFocus: row.persona_focus ?? 'Executive transition and career mobility programs',
    })),
  ].filter(row => !!row.fullName && !!row.email)

  const dedupedByEmail = new Map<string, ClientRow>()
  for (const row of allRows) {
    const dbStatus = mappedStatuses.get(row.email)
    const normalized = {
      ...row,
      status: dbStatus ?? row.status,
    }
    if (!dedupedByEmail.has(row.email)) {
      dedupedByEmail.set(row.email, normalized)
      continue
    }

    const existing = dedupedByEmail.get(row.email)!
    if (existing.fitTier === 'medium' && normalized.fitTier === 'strong') {
      dedupedByEmail.set(row.email, normalized)
      continue
    }

    if (existing.fitTier === normalized.fitTier && emailConfidenceRank(normalized.emailConfidence) > emailConfidenceRank(existing.emailConfidence)) {
      dedupedByEmail.set(row.email, normalized)
    }
  }

  const clientRows = Array.from(dedupedByEmail.values())
  const executiveCount = clientRows.filter(r => r.outreachChannel === 'executives').length
  const searchFirmCount = clientRows.filter(r => r.outreachChannel === 'search_firms').length
  const coachCount = clientRows.filter(r => r.outreachChannel === 'coaches').length
  const outplacementCount = clientRows.filter(r => r.outreachChannel === 'outplacement_firms').length
  const strongCount = clientRows.filter(r => r.fitTier === 'strong').length
  const mediumCount = clientRows.filter(r => r.fitTier === 'medium').length

  const fromAddressLabel = 'Richard Rothschild <richard@startingmonday.app>'

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <Link href="/dashboard" className="text-[13px] text-slate-300 hover:text-white transition-colors">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        <div>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Outreach Hub</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Internal outbound operating center: executives, search firms, and coaches with one-click send and auto follow-up reminders.
          </p>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded p-5">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">Total Prospects</p>
            <p className="text-[24px] font-bold text-slate-900">{clientRows.length}</p>
            <p className="text-[12px] text-slate-500 mt-1">Deduped across all channels</p>
          </div>
          <div className="bg-white border border-slate-200 rounded p-5">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">By Channel</p>
            <p className="text-[13px] font-semibold text-slate-900 mt-1">Executives: {executiveCount}</p>
            <p className="text-[13px] font-semibold text-slate-900">Search Firms: {searchFirmCount}</p>
            <p className="text-[13px] font-semibold text-slate-900">Coaches: {coachCount}</p>
            <p className="text-[13px] font-semibold text-slate-900">Outplacement Firms: {outplacementCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded p-5">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-1">Fit Priority</p>
            <p className="text-[13px] font-semibold text-slate-900 mt-1">Strong fit: {strongCount}</p>
            <p className="text-[13px] font-semibold text-slate-900">Medium fit: {mediumCount}</p>
            <p className="text-[12px] text-slate-500 mt-1">Strong-fit rows should be worked first</p>
          </div>
        </section>

        <OutreachHubClient rows={clientRows} fromAddressLabel={fromAddressLabel} />

        <section className="bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-[16px] font-bold text-slate-900">Operating Cadence</h2>
              <p className="text-[12px] text-slate-500">Run this every week to keep outbound moving.</p>
            </div>
            <a
              href="/calendar/starting-monday-outreach-reminders.ics"
              download
              className="text-[12px] font-semibold text-white bg-slate-900 rounded px-3 py-2 hover:bg-slate-700 transition-colors"
            >
              Download Reminder Calendar
            </a>
          </div>
          <ol className="px-5 py-4 text-[13px] text-slate-700 list-decimal ml-5 space-y-2">
            <li>Monday: send first-touch notes to your active batch.</li>
            <li>Wednesday: send follow-up 1 for non-responders (day 3).</li>
            <li>Friday: send follow-up 2 for non-responders (day 7).</li>
            <li>Friday: review replies, meetings booked, and next-week list.</li>
          </ol>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard/calendar" className="bg-white border border-slate-200 rounded p-5 hover:border-slate-300 transition-colors">
            <p className="text-[13px] font-semibold text-slate-900 mb-1">In-App Calendar</p>
            <p className="text-[12px] text-slate-500">Manage date-based follow-ups alongside the outreach routine.</p>
          </Link>
          <Link href="/dashboard/contacts" className="bg-white border border-slate-200 rounded p-5 hover:border-slate-300 transition-colors">
            <p className="text-[13px] font-semibold text-slate-900 mb-1">Contacts</p>
            <p className="text-[12px] text-slate-500">Update statuses: first sent, follow-up sent, replied, meeting booked.</p>
          </Link>
        </section>
      </main>
    </div>
  )
}
