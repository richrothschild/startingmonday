#!/usr/bin/env node
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const MIN_CONVERSION_RATE = 35

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  return {
    json: args.has('--json'),
    strict: args.has('--strict'),
  }
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

async function getTrialConversionSnapshot() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const nowIso = new Date().toISOString()

  const { data, error } = await supabase
    .from('users')
    .select('subscription_status, signup_source')
    .not('trial_ends_at', 'is', null)
    .lt('trial_ends_at', nowIso)

  if (error) {
    throw new Error(`Failed querying ended trials: ${error.message}`)
  }

  const endedTrials = data ?? []
  const totalEnded = endedTrials.length
  const totalConverted = endedTrials.filter((u) => u.subscription_status === 'active').length
  const conversionRate = totalEnded > 0
    ? Number(((totalConverted / totalEnded) * 100).toFixed(1))
    : null

  const bySourceMap = {}
  for (const trial of endedTrials) {
    const source = trial.signup_source ?? 'direct'
    if (!bySourceMap[source]) bySourceMap[source] = { ended: 0, converted: 0 }
    bySourceMap[source].ended += 1
    if (trial.subscription_status === 'active') bySourceMap[source].converted += 1
  }

  const bySource = Object.entries(bySourceMap)
    .map(([source, stats]) => ({
      source,
      ended: stats.ended,
      converted: stats.converted,
      rate: stats.ended > 0 ? Number(((stats.converted / stats.ended) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.ended - a.ended)

  const gatePass = conversionRate !== null && conversionRate >= MIN_CONVERSION_RATE

  return {
    measuredAt: new Date().toISOString(),
    threshold: MIN_CONVERSION_RATE,
    totalEnded,
    totalConverted,
    conversionRate,
    gatePass,
    decision: gatePass ? 'GO' : 'DEFER',
    bySource,
  }
}

function printHuman(snapshot) {
  console.log('Sprint E LinkedIn Paid Ads Gate')
  console.log('------------------------------')
  console.log(`Measured at:     ${snapshot.measuredAt}`)
  console.log(`Threshold:       ${snapshot.threshold}%`)
  console.log(`Trials ended:    ${snapshot.totalEnded}`)
  console.log(`Trials converted:${snapshot.totalConverted}`)
  console.log(`Conversion rate: ${snapshot.conversionRate === null ? 'N/A' : `${snapshot.conversionRate}%`}`)
  console.log(`Decision:        ${snapshot.decision}`)

  if (snapshot.bySource.length > 0) {
    console.log('\nBy signup source:')
    for (const row of snapshot.bySource) {
      console.log(`- ${row.source}: ${row.converted}/${row.ended} (${row.rate}%)`)
    }
  }
}

async function main() {
  const args = parseArgs(process.argv)
  const snapshot = await getTrialConversionSnapshot()

  if (args.json) {
    console.log(JSON.stringify(snapshot, null, 2))
  } else {
    printHuman(snapshot)
  }

  if (args.strict && !snapshot.gatePass) {
    process.exit(2)
  }
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error))
})
