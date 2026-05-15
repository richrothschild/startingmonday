#!/usr/bin/env node
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const FEATURE = 'prep_brief'
const DEFAULT_TARGET = 100
const DEFAULT_BATCH_SIZE = 50

const FAIL_CATEGORIES = [
  'company_context_thin',
  'role_fit_not_established',
  'questions_too_generic',
  'format_off',
  'tone_wrong',
  'factual_error',
  'missing_context_not_flagged',
  'competitive_framing_missed',
]

function parseArgs(argv) {
  const args = argv.slice(2)
  let target = DEFAULT_TARGET
  let batchSize = DEFAULT_BATCH_SIZE
  let dryRun = false

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--target' && args[i + 1]) {
      target = Number(args[i + 1])
      i += 1
      continue
    }
    if (args[i] === '--batch-size' && args[i + 1]) {
      batchSize = Number(args[i + 1])
      i += 1
      continue
    }
    if (args[i] === '--dry-run') {
      dryRun = true
    }
  }

  if (!Number.isFinite(target) || target <= 0) {
    throw new Error('Invalid --target value. Use a positive number.')
  }
  if (!Number.isFinite(batchSize) || batchSize <= 0) {
    throw new Error('Invalid --batch-size value. Use a positive number.')
  }

  return { target: Math.floor(target), batchSize: Math.floor(batchSize), dryRun }
}

function makeInputSnapshot(index) {
  const rolePool = ['CIO', 'CTO', 'CISO', 'Chief Data Officer', 'VP Engineering']
  const companyPool = ['Northstar Systems', 'Granite Cloud', 'Helios Retail', 'Vector Health', 'Summit Payments']
  const role = rolePool[index % rolePool.length]
  const company = companyPool[index % companyPool.length]

  return {
    company,
    role,
    profile_snapshot: `Executive background ${index + 1}: led two enterprise transformations and scaled teams globally.`,
  }
}

function makePassOutput(index) {
  return [
    '## Bottom Line',
    `You win this role by combining enterprise operating discipline with transformation execution depth (${index + 1}).`,
    '',
    '## The Situation',
    'The company is balancing growth pressure with execution risk and needs an operator who can align board expectations with delivery cadence.',
    '',
    '## Win Thesis',
    'Your edge is proven transformation leadership under high-stakes accountability, not just strategy decks.',
    '',
    '## Questions to Ask',
    '1. Which transformation milestones are board-visible in the next two quarters?',
    '2. What execution bottleneck is most likely to block delivery this year?',
  ].join('\n')
}

function makeFailOutput(index) {
  return [
    '## Bottom Line',
    `This is a great opportunity and you should be confident in your interview (${index + 1}).`,
    '',
    '## The Situation',
    'The company is growing and needs leadership.',
    '',
    '## Questions to Ask',
    '1. What does success look like?',
    '2. Tell me more about your culture?',
  ].join('\n')
}

function makeEvalNotes(isPass, index) {
  if (isPass) {
    return 'categories: none\nnotes: Meets rubric checks with company-specific context and role-fit evidence.'
  }

  const primary = FAIL_CATEGORIES[index % FAIL_CATEGORIES.length]
  const secondary = FAIL_CATEGORIES[(index + 3) % FAIL_CATEGORIES.length]
  return `categories: ${primary}, ${secondary}\nnotes: Synthetic fail example used for Sprint 3 evaluator throughput.`
}

function buildRows(startIndex, count) {
  const rows = []
  for (let i = 0; i < count; i += 1) {
    const absolute = startIndex + i
    const isPass = absolute % 2 === 0
    rows.push({
      feature: FEATURE,
      model: 'synthetic-eval-generator-v1',
      prompt_tokens: 1200 + (absolute % 50),
      completion_tokens: 800 + (absolute % 30),
      latency_ms: 900 + (absolute % 120),
      input_snapshot: makeInputSnapshot(absolute),
      output_snapshot: isPass ? makePassOutput(absolute) : makeFailOutput(absolute),
      eval_pass: isPass,
      eval_notes: makeEvalNotes(isPass, absolute),
      success: true,
    })
  }
  return rows
}

async function main() {
  const { target, batchSize, dryRun } = parseArgs(process.argv)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { count: existingLabeledCount, error: countError } = await supabase
    .from('llm_traces')
    .select('id', { count: 'exact', head: true })
    .eq('feature', FEATURE)
    .not('eval_pass', 'is', null)
    .not('eval_notes', 'is', null)

  if (countError) {
    throw new Error(`Failed counting existing labeled traces: ${countError.message}`)
  }

  const existing = existingLabeledCount ?? 0
  const needed = Math.max(0, target - existing)

  console.log(`Existing labeled traces: ${existing}`)
  console.log(`Target labeled traces: ${target}`)
  console.log(`Rows to insert: ${needed}`)

  if (needed === 0 || dryRun) {
    console.log(needed === 0 ? 'No insert needed.' : 'Dry run complete. No rows inserted.')
    return
  }

  let inserted = 0
  while (inserted < needed) {
    const take = Math.min(batchSize, needed - inserted)
    const rows = buildRows(existing + inserted, take)
    const { error } = await supabase.from('llm_traces').insert(rows)
    if (error) {
      throw new Error(`Failed inserting batch at offset ${inserted}: ${error.message}`)
    }
    inserted += take
    console.log(`Inserted ${inserted}/${needed}`)
  }

  console.log(`Done. Inserted ${inserted} synthetic labeled prep_brief traces.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
