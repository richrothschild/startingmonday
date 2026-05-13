#!/usr/bin/env node
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const TARGET_FEATURE = 'prep_brief'
const PASS_TARGET = 25
const FAIL_TARGET = 25

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  return {
    strict: args.has('--strict'),
    json: args.has('--json'),
  }
}

function pct(value, total) {
  if (total <= 0) return 0
  return Math.min(100, Math.round((value / total) * 100))
}

async function main() {
  const { strict, json } = parseArgs(process.argv)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data, error } = await supabase
    .from('llm_traces')
    .select('eval_pass')
    .eq('feature', TARGET_FEATURE)

  if (error) {
    throw new Error(`Failed querying labeling progress: ${error.message}`)
  }

  const rows = data ?? []
  const pass = rows.filter((row) => row.eval_pass === true).length
  const fail = rows.filter((row) => row.eval_pass === false).length
  const unrated = rows.filter((row) => row.eval_pass === null).length

  const passRemaining = Math.max(0, PASS_TARGET - pass)
  const failRemaining = Math.max(0, FAIL_TARGET - fail)
  const readyToExport = passRemaining === 0 && failRemaining === 0

  const result = {
    feature: TARGET_FEATURE,
    pass,
    fail,
    unrated,
    passTarget: PASS_TARGET,
    failTarget: FAIL_TARGET,
    passRemaining,
    failRemaining,
    readyToExport,
  }

  if (json) {
    console.log(JSON.stringify(result, null, 2))
    if (strict && !readyToExport) process.exit(1)
    return
  }

  console.log('Prep brief labeling progress')
  console.log('---------------------------')
  console.log(`Pass: ${pass}/${PASS_TARGET} (${pct(pass, PASS_TARGET)}%)`)
  console.log(`Fail: ${fail}/${FAIL_TARGET} (${pct(fail, FAIL_TARGET)}%)`)
  console.log(`Unrated: ${unrated}`)

  if (readyToExport) {
    console.log('Status: READY TO EXPORT')
    console.log('Next: npm run evals:export-golden-set')
  } else {
    console.log('Status: IN PROGRESS')
    console.log(`Remaining: ${passRemaining} pass, ${failRemaining} fail`)
    console.log('Next: keep labeling at /dashboard/admin/traces?feature=prep_brief&unrated=1')
  }

  if (strict && !readyToExport) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
