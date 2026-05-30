#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const DEFAULT_WINDOW_DAYS = 14
const DEFAULT_MIN_COVERAGE = 0.95
const ORIGIN_CLASSES = new Set(['user_provided', 'system_detected', 'inferred'])

function parseArgs(argv) {
  const args = argv.slice(2)
  let windowDays = DEFAULT_WINDOW_DAYS
  let minCoverage = DEFAULT_MIN_COVERAGE

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--window-days' && args[i + 1]) {
      const parsed = Number(args[i + 1])
      if (Number.isFinite(parsed) && parsed > 0) {
        windowDays = Math.floor(parsed)
      }
      i += 1
      continue
    }

    if (args[i] === '--min-coverage' && args[i + 1]) {
      const parsed = Number(args[i + 1])
      if (Number.isFinite(parsed) && parsed > 0 && parsed <= 1) {
        minCoverage = parsed
      }
      i += 1
    }
  }

  const argSet = new Set(args)
  return {
    json: argSet.has('--json'),
    markdown: argSet.has('--markdown'),
    summary: argSet.has('--summary'),
    strict: argSet.has('--strict'),
    windowDays,
    minCoverage,
  }
}

function isoDaysAgo(days) {
  const now = new Date()
  const ago = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return ago.toISOString()
}

function isSensitiveHook(value) {
  return value === 'compensation_claim' || value === 'legal_risk_claim' || value === 'security_incident_claim'
}

function validateClaim(claim) {
  if (!claim || typeof claim !== 'object') {
    return { ok: false, reason: 'claim_not_object' }
  }

  const claimText = typeof claim.claimText === 'string' ? claim.claimText.trim() : ''
  if (!claimText) {
    return { ok: false, reason: 'missing_claim_text' }
  }

  if (!ORIGIN_CLASSES.has(claim.originClass)) {
    return { ok: false, reason: 'invalid_origin_class' }
  }

  const hooks = Array.isArray(claim.sensitivePolicyHooks) ? claim.sensitivePolicyHooks : []
  const hasSensitiveHook = hooks.some((hook) => isSensitiveHook(hook))
  if (hasSensitiveHook && claim.originClass === 'inferred') {
    return { ok: false, reason: 'sensitive_inferred_block' }
  }

  return { ok: true, reason: 'ok' }
}

function evaluateRow(row) {
  const reasons = []
  const claimProvenance = row?.claim_provenance
  const provenanceVersion = row?.provenance_version

  if (!Array.isArray(claimProvenance) || claimProvenance.length === 0) {
    reasons.push('missing_claim_provenance')
  }

  if (typeof provenanceVersion !== 'number' || provenanceVersion < 1) {
    reasons.push('invalid_provenance_version')
  }

  if (Array.isArray(claimProvenance)) {
    for (const claim of claimProvenance) {
      const claimResult = validateClaim(claim)
      if (!claimResult.ok) {
        reasons.push(claimResult.reason)
        break
      }
    }
  }

  return {
    valid: reasons.length === 0,
    reasons,
    claimCount: Array.isArray(claimProvenance) ? claimProvenance.length : 0,
  }
}

function toMarkdown(result) {
  const lines = [
    '# Prep Provenance Coverage',
    '',
    `- Generated at: ${result.generatedAt}`,
    `- Window: last ${result.windowDays} days`,
    `- Rows evaluated: ${result.totalRows}`,
    `- Valid provenance rows: ${result.validRows}`,
    `- Coverage: ${result.coverage}`,
    `- Threshold: ${result.minCoverage}`,
    `- Status: ${result.status}`,
    '',
    '## Validation Failures',
  ]

  if (result.failures.length === 0) {
    lines.push('- none')
  } else {
    for (const failure of result.failures.slice(0, 10)) {
      lines.push(`- ${failure.id}: ${failure.reasons.join(', ')}`)
    }
  }

  return `${lines.join('\n')}\n`
}

async function fetchRows(windowDays) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const sinceIso = isoDaysAgo(windowDays)

  const { data, error } = await supabase
    .from('briefs')
    .select('id, created_at, type, claim_provenance, provenance_version')
    .in('type', ['prep', 'prep_section'])
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false })
    .limit(2000)

  if (error) {
    throw new Error(`Failed to query briefs: ${error.message}`)
  }

  return data ?? []
}

async function main() {
  const { json, markdown, summary, strict, windowDays, minCoverage } = parseArgs(process.argv)
  const generatedAt = new Date().toISOString()
  const rows = await fetchRows(windowDays)
  const failures = []
  let validRows = 0
  let totalClaims = 0

  for (const row of rows) {
    const evaluated = evaluateRow(row)
    totalClaims += evaluated.claimCount
    if (evaluated.valid) {
      validRows += 1
      continue
    }
    failures.push({ id: row.id, reasons: evaluated.reasons })
  }

  const totalRows = rows.length
  const coverageRaw = totalRows === 0 ? 0 : validRows / totalRows
  const coverage = Number(coverageRaw.toFixed(4))
  const status = coverage >= minCoverage ? 'PASS' : 'FAIL'

  const result = {
    generatedAt,
    windowDays,
    minCoverage,
    totalRows,
    validRows,
    coverage,
    averageClaimsPerRow: totalRows === 0 ? 0 : Number((totalClaims / totalRows).toFixed(2)),
    status,
    failures,
  }

  const outputDir = path.join(process.cwd(), 'docs', 'status')
  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(path.join(outputDir, 'prep-provenance-coverage.latest.json'), `${JSON.stringify(result, null, 2)}\n`)
  fs.writeFileSync(path.join(outputDir, 'prep-provenance-coverage.latest.md'), toMarkdown(result))

  if (json) {
    console.log(JSON.stringify(result, null, 2))
  } else if (markdown) {
    process.stdout.write(toMarkdown(result))
  } else if (summary) {
    console.log(
      `status=${result.status} coverage=${result.coverage} valid=${result.validRows}/${result.totalRows} ` +
      `window_days=${result.windowDays} generated_at=${result.generatedAt}`,
    )
  } else {
    console.log('Prep provenance coverage')
    console.log('------------------------')
    console.log(`Status: ${result.status}`)
    console.log(`Coverage: ${result.coverage} (threshold ${result.minCoverage})`)
    console.log(`Rows: ${result.validRows}/${result.totalRows}`)
    if (result.failures.length > 0) {
      console.log(`Failure examples: ${result.failures.slice(0, 3).map((f) => `${f.id}:${f.reasons.join('|')}`).join('; ')}`)
    }
  }

  if (strict && status !== 'PASS') {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
