#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const FEATURE = 'prep_brief'
const LABEL_TARGET = 100
const PASS_TARGET = 25
const FAIL_TARGET = 25

const REQUIRED_FILES = {
  traceViewer: 'src/app/(dashboard)/dashboard/admin/traces/trace-client.tsx',
  rubric: 'src/evals/prep_brief_rubric.md',
  goldenSet: 'src/evals/prep_brief_golden_set.json',
  axialCoding: 'src/evals/prep_brief_failure_categories.md',
  optimizationCycle: 'docs/evals/prep-brief-optimization-cycle-01.md',
}

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  return {
    json: args.has('--json'),
    strict: args.has('--strict'),
  }
}

async function fileExists(relativePath) {
  try {
    await fs.access(path.join(process.cwd(), relativePath))
    return true
  } catch {
    return false
  }
}

function summarizeGoldenSet(records) {
  if (!Array.isArray(records)) {
    return { ready: false, total: 0, pass: 0, fail: 0 }
  }

  const pass = records.filter((item) => item?.pass === true).length
  const fail = records.filter((item) => item?.pass === false).length
  const unknown = records.length - pass - fail
  const missingRequired = records.some((item) => {
    if (!item || typeof item !== 'object') return true
    if (!item.id) return true
    if (!('input' in item)) return true
    if (item.output == null || item.output === '') return true
    if (typeof item.pass !== 'boolean') return true
    if (!Array.isArray(item.failure_categories)) return true
    return false
  })

  const ready = (
    records.length === PASS_TARGET + FAIL_TARGET
    && pass === PASS_TARGET
    && fail === FAIL_TARGET
    && unknown === 0
    && !missingRequired
  )

  return { ready, total: records.length, pass, fail }
}

async function getGoldenSetStatus() {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), REQUIRED_FILES.goldenSet), 'utf8')
    return summarizeGoldenSet(JSON.parse(raw))
  } catch {
    return { ready: false, total: 0, pass: 0, fail: 0 }
  }
}

async function getLabelingStatus() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { data, error } = await supabase
    .from('llm_traces')
    .select('eval_pass, eval_notes')
    .eq('feature', FEATURE)

  if (error) {
    throw new Error(`Failed querying llm_traces: ${error.message}`)
  }

  const rows = data ?? []
  const labeled = rows.filter((r) => r.eval_pass !== null && (r.eval_notes ?? '').trim().length > 0)
  return {
    totalRows: rows.length,
    labeledWithNotes: labeled.length,
    ready: labeled.length >= LABEL_TARGET,
  }
}

async function main() {
  const { json, strict } = parseArgs(process.argv)

  const [
    traceViewerExists,
    rubricExists,
    axialCodingExists,
    optimizationCycleExists,
    goldenSet,
    labeling,
  ] = await Promise.all([
    fileExists(REQUIRED_FILES.traceViewer),
    fileExists(REQUIRED_FILES.rubric),
    fileExists(REQUIRED_FILES.axialCoding),
    fileExists(REQUIRED_FILES.optimizationCycle),
    getGoldenSetStatus(),
    getLabelingStatus(),
  ])

  const checks = [
    { id: 'trace_viewer_exists', ok: traceViewerExists },
    { id: 'labeled_traces_100_plus', ok: labeling.ready },
    { id: 'axial_coding_documented', ok: axialCodingExists },
    { id: 'rubric_exists', ok: rubricExists },
    { id: 'golden_set_valid_50', ok: goldenSet.ready },
    { id: 'optimization_cycle_completed', ok: optimizationCycleExists },
  ]

  const completed = checks.filter((item) => item.ok).length
  const total = checks.length
  const percentComplete = Math.round((completed / total) * 100)

  const result = {
    generatedAt: new Date().toISOString(),
    percentComplete,
    completed,
    total,
    checks,
    details: {
      requiredFiles: REQUIRED_FILES,
      labeling,
      goldenSet,
    },
  }

  if (json) {
    console.log(JSON.stringify(result, null, 2))
    if (strict && percentComplete < 100) process.exitCode = 1
    return
  }

  console.log('Sprint 3 DoD status')
  console.log('-------------------')
  console.log(`Complete: ${completed}/${total} (${percentComplete}%)`)
  for (const check of checks) {
    console.log(`${check.ok ? '[x]' : '[ ]'} ${check.id}`)
  }
  console.log(`Labeled traces with notes: ${labeling.labeledWithNotes}/${LABEL_TARGET}`)
  console.log(`Golden set: total ${goldenSet.total}/50, pass ${goldenSet.pass}/25, fail ${goldenSet.fail}/25`)

  if (strict && percentComplete < 100) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
