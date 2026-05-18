import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { OutreachHubClient } from './outreach-hub-client'
import { getStaffMember } from '@/lib/staff'

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

function buildStandardizedDraft(row: CsvRow, channel: OutreachChannel): { subject: string; body: string } {
  const firstName = firstNameOf(row.full_name)
  const company = companyToken(row.company)
  const personalization = channel === 'executives'
    ? executiveSpecificOpening(row, company)
    : csvPersonalizedOpening(row, company)

  if (channel === 'executives') {
    const archetype = detectExecutiveRoleArchetype(row)
    const roleLabel = archetype ? executiveRoleLabel(archetype) : (row.role_bucket || 'C-suite')

    let roleAngle = 'Most senior operators need a clearer way to run discreet, high-signal conversations when timing gets sensitive.'
    if (archetype === 'cfo') roleAngle = 'Finance leaders respond best to outreach that shows capital discipline and measurable operating impact early.'
    if (archetype === 'coo') roleAngle = 'COO-level conversations land when execution depth is obvious without creating extra visibility too early.'
    if (archetype === 'cio') roleAngle = 'CIO-level searches require balancing modernization language with concrete enterprise impact and execution proof.'
    if (archetype === 'cto') roleAngle = 'CTO-level outreach works when architecture and delivery decisions are translated into business outcomes quickly.'
    if (archetype === 'chro') roleAngle = 'CHRO-level outreach has to connect people strategy with measurable operating outcomes, not generic talent language.'
    if (archetype === 'cro') roleAngle = 'CRO-level transitions usually break on pipeline signal quality and momentum discipline between conversations.'
    if (archetype === 'ciso') roleAngle = 'CISO-level messages work when resilience and risk judgment are legible to non-technical stakeholders.'
    if (archetype === 'cdo') roleAngle = 'CDO-level outreach lands when data strategy is tied to practical operating outcomes and governance clarity.'

    return {
      subject: `Bad idea to send a 1-page ${roleLabel} conversation flow for ${company}?`,
      body: [
        `${firstName},`,
        '',
        personalization,
        '',
        `I run Starting Monday, a private workflow that helps senior leaders target the right conversations, prep quickly, and keep momentum without noise. ${roleAngle}`,
        '',
        `Would it be a bad idea if I sent a one-page ${company}-style ${roleLabel} flow?`,
        '',
        'Rich',
        'startingmonday.app',
      ].join('\n'),
    }
  }

  if (channel === 'search_firms') {
    return {
      subject: `Bad idea to send a 1-page workflow for ${company} mandates?`,
      body: [
        `${firstName},`,
        '',
        personalization,
        '',
        'I run Starting Monday, a private execution workflow that helps search teams and senior operators tighten role narrative, outreach precision, and interview readiness before momentum is lost.',
        '',
        'Would it be a bad idea if I sent a one-page example tailored to your mandate mix?',
        '',
        'Rich',
        'startingmonday.app',
      ].join('\n'),
    }
  }

  if (channel === 'coaches') {
    return {
      subject: `Bad idea to send a 1-page coach-first execution flow for ${company}?`,
      body: [
        `${firstName},`,
        '',
        personalization,
        '',
        'I run Starting Monday, a private coach-first workflow for senior operators in transition: focused targets, messaging support, prep briefs, and momentum tracking while protecting the client relationship you already own.',
        '',
        'Would it be a bad idea if I sent a one-page version for the clients you coach most often?',
        '',
        'Rich',
        'startingmonday.app',
      ].join('\n'),
    }
  }

  return {
    subject: `Bad idea to send a 1-page transition-support workflow for ${company}?`,
    body: [
      `${firstName},`,
      '',
      personalization,
      '',
      'I run Starting Monday, a private workflow for senior operators in transition that helps teams execute targeted outreach, prep efficiently, and maintain discreet momentum between conversations.',
      '',
      'Would it be a bad idea if I sent a one-page example mapped to your transition-support model?',
      '',
      'Rich',
      'startingmonday.app',
    ].join('\n'),
  }
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

function executivePersonaFit(
  row: CsvRow,
  fitLookup: Map<string, Map<string, 'strong' | 'medium'>>,
): 'strong' | 'medium' | null {
  const explicitFit = (row.fit_tier ?? '').trim().toLowerCase()
  if (explicitFit === 'strong' || explicitFit === 'medium') return explicitFit

  const companyKey = normalizeCompanyKey(row.company)
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
  const prioritizedSearchFirms = prioritizeCuratedRows(searchFirmRaw, searchFirmCurated)
  const prioritizedCoaches = prioritizeCuratedRows(coachRaw, coachCurated)
  const mappedStatuses = statusByEmail((rawContactStatuses.data ?? []) as ContactStatusRow[])
  const executivePersonaRows: ClientRow[] = executives.rows
    .map((row): ClientRow | null => {
      const personaFit = executivePersonaFit(row, executiveFitLookup)
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
