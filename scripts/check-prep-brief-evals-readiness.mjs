#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const FEATURE = 'prep_brief'
const PASS_TARGET = 25
const FAIL_TARGET = 25
const GOLDEN_SET_PATH = path.join(process.cwd(), 'src', 'evals', 'prep_brief_golden_set.json')

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  return {
    json: args.has('--json'),
    markdown: args.has('--markdown'),
    strict: args.has('--strict'),
  }
}

function summarizeGoldenSet(records) {
  if (!Array.isArray(records)) {
    return {
      total: 0,
      pass: 0,
      fail: 0,
      unknown: 0,
      missingFields: [{ index: -1, missing: ['array'] }],
      duplicateIds: 0,
      ready: false,
    }
  }

  const pass = records.filter((item) => item?.pass === true).length
  const fail = records.filter((item) => item?.pass === false).length
  const unknown = records.length - pass - fail
  const uniqueIds = new Set(records.map((item) => item?.id).filter(Boolean))

  const missingFields = records.reduce((acc, item, index) => {
    const missing = []
    if (!item || typeof item !== 'object') {
      missing.push('record')
    } else {
      if (!item.id) missing.push('id')
      if (!('input' in item)) missing.push('input')
      if (item.output == null || item.output === '') missing.push('output')
      if (typeof item.pass !== 'boolean') missing.push('pass')
      if (!Array.isArray(item.failure_categories)) missing.push('failure_categories')
    }
    if (missing.length > 0) {
      acc.push({ index, missing })
    }
    return acc
  }, [])

  const ready = (
    records.length === PASS_TARGET + FAIL_TARGET
    && pass === PASS_TARGET
    && fail === FAIL_TARGET
    && unknown === 0
    && missingFields.length === 0
    && uniqueIds.size === records.length
  )

  return {
    total: records.length,
    pass,
    fail,
    unknown,
    missingFields,
    duplicateIds: records.length - uniqueIds.size,
    ready,
  }
}

async function getLabelProgress() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { data, error } = await supabase
    .from('llm_traces')
    .select('eval_pass')
    .eq('feature', FEATURE)

  if (error) {
    throw new Error(`Failed querying labeling progress: ${error.message}`)
  }

  const rows = data ?? []
  const pass = rows.filter((row) => row.eval_pass === true).length
  const fail = rows.filter((row) => row.eval_pass === false).length
  const unrated = rows.filter((row) => row.eval_pass === null).length

  const passRemaining = Math.max(0, PASS_TARGET - pass)
  const failRemaining = Math.max(0, FAIL_TARGET - fail)

  return {
    pass,
    fail,
    unrated,
    passRemaining,
    failRemaining,
    ready: passRemaining === 0 && failRemaining === 0,
  }
}

async function getGoldenSetStatus() {
  let raw
  try {
    raw = await fs.readFile(GOLDEN_SET_PATH, 'utf8')
  } catch {
    return {
      path: GOLDEN_SET_PATH,
      exists: false,
      status: summarizeGoldenSet([]),
    }
  }

  try {
    const parsed = JSON.parse(raw)
    return {
      path: GOLDEN_SET_PATH,
      exists: true,
      status: summarizeGoldenSet(parsed),
    }
  } catch {
    return {
      path: GOLDEN_SET_PATH,
      exists: true,
      status: {
        total: 0,
        pass: 0,
        fail: 0,
        unknown: 0,
        missingFields: [{ index: -1, missing: ['invalid_json'] }],
        duplicateIds: 0,
        ready: false,
      },
    }
  }
}

async function main() {
  const { json, markdown, strict } = parseArgs(process.argv)
  const generatedAt = new Date().toISOString()

  const [labels, goldenSet] = await Promise.all([
    getLabelProgress(),
    getGoldenSetStatus(),
  ])

  const overallReady = labels.ready && goldenSet.status.ready

  const result = {
    generatedAt,
    feature: FEATURE,
    targets: {
      pass: PASS_TARGET,
      fail: FAIL_TARGET,
      total: PASS_TARGET + FAIL_TARGET,
    },
    labels,
    goldenSet,
    overallReady,
    nextAction: labels.ready
      ? (goldenSet.status.ready ? 'ready_for_optimization_loop' : 'run_export_and_verify')
      : 'continue_labeling',
  }

  if (json) {
    console.log(JSON.stringify(result, null, 2))
    if (strict && !overallReady) process.exit(1)
    return
  }

  if (markdown) {
    console.log('# Prep Brief Evals Readiness')
    console.log('')
    console.log(`- Generated at: ${generatedAt}`)
    console.log(`- Status: ${overallReady ? 'READY' : 'NOT READY'}`)
    console.log(`- Labels: pass ${labels.pass}/${PASS_TARGET}, fail ${labels.fail}/${FAIL_TARGET}, unrated ${labels.unrated}`)
    console.log(`- Golden set: total ${goldenSet.status.total}/${PASS_TARGET + FAIL_TARGET}, pass ${goldenSet.status.pass}/${PASS_TARGET}, fail ${goldenSet.status.fail}/${FAIL_TARGET}`)
    console.log(`- Golden set file: ${goldenSet.path}`)
    if (!overallReady) {
      if (!labels.ready) {
        console.log(`- Remaining labels: ${labels.passRemaining} pass, ${labels.failRemaining} fail`)
      }
      console.log(`- Next action: ${result.nextAction}`)
    }
    if (strict && !overallReady) process.exit(1)
    return
  }

  console.log('Prep brief evals readiness')
  console.log('-------------------------')
  console.log(`Generated at: ${generatedAt}`)
  console.log(`Labels: pass ${labels.pass}/${PASS_TARGET}, fail ${labels.fail}/${FAIL_TARGET}, unrated ${labels.unrated}`)
  console.log(`Golden set: total ${goldenSet.status.total}/${PASS_TARGET + FAIL_TARGET}, pass ${goldenSet.status.pass}/${PASS_TARGET}, fail ${goldenSet.status.fail}/${FAIL_TARGET}`)
  console.log(`Golden set file: ${goldenSet.path}`)

  if (overallReady) {
    console.log('Status: READY')
    console.log('Next: run optimization loop against golden set')
  } else {
    console.log('Status: NOT READY')
    if (!labels.ready) {
      console.log(`Remaining labels: ${labels.passRemaining} pass, ${labels.failRemaining} fail`)
      console.log('Next: /dashboard/admin/traces?feature=prep_brief&unrated=1')
    } else {
      console.log('Label targets met, but golden set is not yet valid')
      console.log('Next: npm run evals:export-golden-set && npm run evals:verify-golden-set:strict')
    }
  }

  if (strict && !overallReady) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
