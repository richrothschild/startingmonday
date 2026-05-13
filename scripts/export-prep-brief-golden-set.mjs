#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const TARGET_FEATURE = 'prep_brief'
const PASS_TARGET = 25
const FAIL_TARGET = 25
const QUERY_LIMIT = 250

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  return {
    dryRun: args.has('--dry-run'),
  }
}

function parseFailureCategories(evalNotes) {
  if (!evalNotes || typeof evalNotes !== 'string') return []
  const match = evalNotes.match(/^\s*categories\s*:\s*(.+)$/im)
  if (!match) return []
  return match[1]
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

async function main() {
  const { dryRun } = parseArgs(process.argv)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const [{ data: passRows, error: passError }, { data: failRows, error: failError }] = await Promise.all([
    supabase
      .from('llm_traces')
      .select('id, created_at, input_snapshot, output_snapshot, eval_notes')
      .eq('feature', TARGET_FEATURE)
      .eq('eval_pass', true)
      .not('output_snapshot', 'is', null)
      .order('created_at', { ascending: false })
      .limit(QUERY_LIMIT),
    supabase
      .from('llm_traces')
      .select('id, created_at, input_snapshot, output_snapshot, eval_notes')
      .eq('feature', TARGET_FEATURE)
      .eq('eval_pass', false)
      .not('output_snapshot', 'is', null)
      .order('created_at', { ascending: false })
      .limit(QUERY_LIMIT),
  ])

  if (passError) throw new Error(`Failed querying pass traces: ${passError.message}`)
  if (failError) throw new Error(`Failed querying fail traces: ${failError.message}`)

  const selectedPass = (passRows ?? []).slice(0, PASS_TARGET)
  const selectedFail = (failRows ?? []).slice(0, FAIL_TARGET)

  if (selectedPass.length < PASS_TARGET || selectedFail.length < FAIL_TARGET) {
    const counts = `Need ${PASS_TARGET} pass and ${FAIL_TARGET} fail, found ${selectedPass.length} pass and ${selectedFail.length} fail`
    throw new Error(counts)
  }

  const goldenSet = [
    ...selectedPass.map((row) => ({
      id: row.id,
      input: (row.input_snapshot ?? {}),
      output: row.output_snapshot,
      pass: true,
      failure_categories: [],
    })),
    ...selectedFail.map((row) => ({
      id: row.id,
      input: (row.input_snapshot ?? {}),
      output: row.output_snapshot,
      pass: false,
      failure_categories: parseFailureCategories(row.eval_notes),
    })),
  ]

  const outputPath = path.join(process.cwd(), 'src', 'evals', 'prep_brief_golden_set.json')
  const content = `${JSON.stringify(goldenSet, null, 2)}\n`

  if (dryRun) {
    console.log('[dry-run] Golden set preview ready')
    console.log(`Pass samples: ${selectedPass.length}`)
    console.log(`Fail samples: ${selectedFail.length}`)
    console.log(`Output path: ${outputPath}`)
    return
  }

  await fs.writeFile(outputPath, content, 'utf8')
  console.log(`Golden set written: ${outputPath}`)
  console.log(`Pass samples: ${selectedPass.length}`)
  console.log(`Fail samples: ${selectedFail.length}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
