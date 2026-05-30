#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const PREP_PROVENANCE_VERSION = 1
const ORIGIN_CLASSES = new Set(['user_provided', 'system_detected', 'inferred'])
const USER_EVIDENCE = new Set(['career_history', 'resume_text', 'star_story'])
const SYSTEM_EVIDENCE = new Set([
  'company_signals',
  'scan_results',
  'company_notes',
  'interview_notes',
  'contact_records',
  'company_documents',
  'job_description',
])

const DEFAULT_WINDOW_DAYS = 365
const DEFAULT_FETCH_LIMIT = 4000

function parseArgs(argv) {
  const args = argv.slice(2)
  let windowDays = DEFAULT_WINDOW_DAYS
  let limit = DEFAULT_FETCH_LIMIT

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--window-days' && args[i + 1]) {
      const parsed = Number(args[i + 1])
      if (Number.isFinite(parsed) && parsed > 0) {
        windowDays = Math.floor(parsed)
      }
      i += 1
      continue
    }

    if (args[i] === '--limit' && args[i + 1]) {
      const parsed = Number(args[i + 1])
      if (Number.isFinite(parsed) && parsed > 0) {
        limit = Math.floor(parsed)
      }
      i += 1
    }
  }

  const argSet = new Set(args)
  return {
    apply: argSet.has('--apply'),
    json: argSet.has('--json'),
    markdown: argSet.has('--markdown'),
    summary: argSet.has('--summary'),
    windowDays,
    limit,
  }
}

function isoDaysAgo(days) {
  const now = new Date()
  const ago = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return ago.toISOString()
}

function normalizeLine(line) {
  return String(line ?? '')
    .replace(/^[-*]\s+/, '')
    .replace(/^\d+[.)]\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function sectionHeader(line) {
  if (!line.startsWith('## ')) return null
  return line.slice(3).trim() || null
}

function detectSourceEvidence(claimText, section) {
  const text = claimText.toLowerCase()
  const sectionText = (section ?? '').toLowerCase()
  const matches = new Set()

  if (
    text.includes('resume') ||
    text.includes('career history') ||
    text.includes('candidate-verified') ||
    sectionText.includes('background')
  ) {
    matches.add('resume_text')
    matches.add('career_history')
  }

  if (text.includes('story') || text.includes('star')) {
    matches.add('star_story')
  }

  if (text.includes('signal') || text.includes('announcement') || text.includes('filing')) {
    matches.add('company_signals')
  }

  if (text.includes('scan')) {
    matches.add('scan_results')
  }

  if (text.includes('company notes') || text.includes('notes')) {
    matches.add('company_notes')
  }

  if (text.includes('interview notes') || text.includes('prior interview')) {
    matches.add('interview_notes')
  }

  if (text.includes('contact') || text.includes('recruiter') || text.includes('hiring manager')) {
    matches.add('contact_records')
  }

  if (text.includes('document') || text.includes('job description') || sectionText.includes('requirement')) {
    matches.add('company_documents')
  }

  if (text.includes('job description') || sectionText.includes('requirement')) {
    matches.add('job_description')
  }

  if (sectionText.includes('situation') || sectionText.includes('focus')) {
    matches.add('company_notes')
    matches.add('company_signals')
  }

  return Array.from(matches)
}

function inferOriginClass(claimText, sourceEvidence) {
  const hasUserEvidence = sourceEvidence.some((item) => USER_EVIDENCE.has(item))
  const hasSystemEvidence = sourceEvidence.some((item) => SYSTEM_EVIDENCE.has(item))

  if (hasUserEvidence && !hasSystemEvidence) {
    return 'user_provided'
  }

  if (hasSystemEvidence) {
    return 'system_detected'
  }

  const text = claimText.toLowerCase()

  if (
    text.includes('candidate') ||
    text.includes('your resume') ||
    text.includes('verified') ||
    text.includes('career history') ||
    text.includes('star story')
  ) {
    return 'user_provided'
  }

  if (
    text.includes('signal') ||
    text.includes('scan') ||
    text.includes('pipeline') ||
    text.includes('company notes') ||
    text.includes('interview notes') ||
    text.includes('contact') ||
    text.includes('document')
  ) {
    return 'system_detected'
  }

  return 'inferred'
}

function detectSensitivePolicyHooks(claimText) {
  const text = claimText.toLowerCase()
  const hooks = []

  if (/(salary|compensation|equity|cash|bonus|\$|k\b)/i.test(text)) {
    hooks.push('compensation_claim')
  }
  if (/(lawsuit|litigation|regulatory|sec inquiry|legal exposure|compliance breach)/i.test(text)) {
    hooks.push('legal_risk_claim')
  }
  if (/(breach|incident|ransomware|security event|data exfiltration|cyberattack)/i.test(text)) {
    hooks.push('security_incident_claim')
  }

  return hooks
}

function normalizeSensitiveOriginClass(claim) {
  const hooks = Array.isArray(claim.sensitivePolicyHooks) ? claim.sensitivePolicyHooks : []
  if (hooks.length === 0) return claim
  if (claim.originClass !== 'inferred') return claim

  const sourceEvidence = Array.isArray(claim.sourceEvidence) ? [...claim.sourceEvidence] : []
  if (sourceEvidence.length === 0) {
    sourceEvidence.push('company_notes')
  }

  return {
    ...claim,
    originClass: 'system_detected',
    sourceEvidence,
  }
}

function buildPrepClaimProvenance(outputText) {
  const lines = String(outputText ?? '').split('\n')
  const claims = []
  let currentSection = null

  for (const rawLine of lines) {
    const maybeSection = sectionHeader(rawLine.trim())
    if (maybeSection) {
      currentSection = maybeSection
      continue
    }

    const claimText = normalizeLine(rawLine)
    if (!claimText) continue
    if (claimText.startsWith('#')) continue
    if (claimText === '---' || claimText === '***') continue
    if (claimText.length < 24) continue

    const sourceEvidence = detectSourceEvidence(claimText, currentSection)

    claims.push(normalizeSensitiveOriginClass({
      claimText,
      originClass: inferOriginClass(claimText, sourceEvidence),
      section: currentSection,
      sensitivePolicyHooks: detectSensitivePolicyHooks(claimText),
      sourceEvidence,
    }))

    if (claims.length >= 80) break
  }

  return claims
}

function isMissingOrInvalidProvenance(row) {
  const invalidVersion = typeof row.provenance_version !== 'number' || row.provenance_version < 1
  const missingClaims = !Array.isArray(row.claim_provenance) || row.claim_provenance.length === 0
  const sensitiveInferred = Array.isArray(row.claim_provenance)
    ? row.claim_provenance.some((claim) => {
        const hooks = Array.isArray(claim?.sensitivePolicyHooks) ? claim.sensitivePolicyHooks : []
        return hooks.length > 0 && claim?.originClass === 'inferred'
      })
    : false

  return invalidVersion || missingClaims || sensitiveInferred
}

function basicValidation(claims) {
  if (!Array.isArray(claims) || claims.length === 0) return false
  for (const claim of claims) {
    if (!claim || typeof claim !== 'object') return false
    if (typeof claim.claimText !== 'string' || !claim.claimText.trim()) return false
    if (!ORIGIN_CLASSES.has(claim.originClass)) return false
  }
  return true
}

async function fetchRows({ windowDays, limit }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const sinceIso = isoDaysAgo(windowDays)

  const { data, error } = await supabase
    .from('briefs')
    .select('id, created_at, type, output_text, claim_provenance, provenance_version')
    .in('type', ['prep', 'prep_section'])
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to query briefs: ${error.message}`)
  }

  return { rows: data ?? [], supabase }
}

async function applyBackfill(supabase, updates) {
  let updated = 0
  const failures = []

  for (const item of updates) {
    const { error } = await supabase
      .from('briefs')
      .update({
        claim_provenance: item.claim_provenance,
        provenance_version: PREP_PROVENANCE_VERSION,
      })
      .eq('id', item.id)

    if (error) {
      failures.push({ id: item.id, reason: error.message })
      continue
    }
    updated += 1
  }

  return { updated, failures }
}

function toMarkdown(result) {
  const lines = [
    '# Prep Provenance Backfill',
    '',
    `- Generated at: ${result.generatedAt}`,
    `- Mode: ${result.mode}`,
    `- Window days: ${result.windowDays}`,
    `- Rows scanned: ${result.rowsScanned}`,
    `- Rows needing backfill: ${result.rowsNeedingBackfill}`,
    `- Rows valid for update: ${result.rowsValidForUpdate}`,
    `- Rows updated: ${result.rowsUpdated}`,
    '',
    '## Skips',
  ]

  if (result.skips.length === 0) {
    lines.push('- none')
  } else {
    for (const skip of result.skips.slice(0, 20)) {
      lines.push(`- ${skip.id}: ${skip.reason}`)
    }
  }

  lines.push('', '## Update Failures')
  if (result.updateFailures.length === 0) {
    lines.push('- none')
  } else {
    for (const failure of result.updateFailures.slice(0, 20)) {
      lines.push(`- ${failure.id}: ${failure.reason}`)
    }
  }

  return `${lines.join('\n')}\n`
}

async function main() {
  const { apply, json, markdown, summary, windowDays, limit } = parseArgs(process.argv)
  const generatedAt = new Date().toISOString()
  const { rows, supabase } = await fetchRows({ windowDays, limit })

  const candidates = rows.filter((row) => isMissingOrInvalidProvenance(row))
  const updates = []
  const skips = []

  for (const row of candidates) {
    const claims = buildPrepClaimProvenance(row.output_text)
    if (!basicValidation(claims)) {
      skips.push({ id: row.id, reason: 'generated_claim_provenance_invalid_or_empty' })
      continue
    }
    updates.push({ id: row.id, claim_provenance: claims })
  }

  let rowsUpdated = 0
  let updateFailures = []

  if (apply && updates.length > 0) {
    const applied = await applyBackfill(supabase, updates)
    rowsUpdated = applied.updated
    updateFailures = applied.failures
  }

  const result = {
    generatedAt,
    mode: apply ? 'apply' : 'dry-run',
    windowDays,
    limit,
    rowsScanned: rows.length,
    rowsNeedingBackfill: candidates.length,
    rowsValidForUpdate: updates.length,
    rowsUpdated,
    skips,
    updateFailures,
  }

  const outputDir = path.join(process.cwd(), 'docs', 'status')
  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(path.join(outputDir, 'prep-provenance-backfill.latest.json'), `${JSON.stringify(result, null, 2)}\n`)
  fs.writeFileSync(path.join(outputDir, 'prep-provenance-backfill.latest.md'), toMarkdown(result))

  if (json) {
    console.log(JSON.stringify(result, null, 2))
  } else if (markdown) {
    process.stdout.write(toMarkdown(result))
  } else if (summary) {
    console.log(
      `mode=${result.mode} scanned=${result.rowsScanned} need=${result.rowsNeedingBackfill} ` +
      `valid=${result.rowsValidForUpdate} updated=${result.rowsUpdated}`,
    )
  } else {
    console.log('Prep provenance backfill')
    console.log('-----------------------')
    console.log(`Mode: ${result.mode}`)
    console.log(`Rows scanned: ${result.rowsScanned}`)
    console.log(`Need backfill: ${result.rowsNeedingBackfill}`)
    console.log(`Valid for update: ${result.rowsValidForUpdate}`)
    console.log(`Rows updated: ${result.rowsUpdated}`)
    if (result.skips.length > 0) {
      console.log(`Skips: ${result.skips.slice(0, 3).map((s) => `${s.id}:${s.reason}`).join('; ')}`)
    }
    if (result.updateFailures.length > 0) {
      console.log(`Update failures: ${result.updateFailures.slice(0, 3).map((s) => `${s.id}:${s.reason}`).join('; ')}`)
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
