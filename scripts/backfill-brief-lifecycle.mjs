#!/usr/bin/env node
import path from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing Supabase credentials.')
  process.exit(1)
}

const supabase = createClient(url, key)

function parseArgs(argv) {
  const args = argv.slice(2)
  let limit = 5000
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--limit' && args[index + 1]) {
      const parsed = Number(args[index + 1])
      if (Number.isFinite(parsed) && parsed > 0) {
        limit = Math.floor(parsed)
      }
      index += 1
    }
  }
  const argSet = new Set(args)
  return {
    apply: argSet.has('--apply'),
    json: argSet.has('--json'),
    summary: argSet.has('--summary'),
    limit,
  }
}

function serializeBriefRow(row, lifecycleState, reviewedAt, usedAt) {
  return {
    id: row.id,
    user_id: row.user_id,
    type: row.type,
    user_rating: row.user_rating,
    created_at: row.created_at,
    lifecycle_state: lifecycleState,
    reviewed_at: reviewedAt,
    used_at: usedAt,
    lifecycle_updated_at: new Date().toISOString(),
  }
}

async function fetchRows(limit) {
  const { data, error } = await supabase
    .from('briefs')
    .select('id, user_id, type, user_rating, created_at, lifecycle_state, reviewed_at, used_at')
    .is('lifecycle_state', null)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch briefs: ${error.message}`)
  }

  return data ?? []
}

async function run() {
  const args = parseArgs(process.argv)
  const rows = await fetchRows(args.limit)

  const updates = rows.map((row) => {
    const isRated = row.user_rating === 1 || row.user_rating === -1
    const lifecycleState = isRated ? 'reviewed' : 'generated'
    const reviewedAt = isRated ? row.created_at : null
    const usedAt = null
    return serializeBriefRow(row, lifecycleState, reviewedAt, usedAt)
  })

  if (args.summary) {
    console.log(`Brief lifecycle backfill: ${rows.length} row(s) found, ${updates.filter((row) => row.lifecycle_state === 'reviewed').length} rated briefs mapped to reviewed.`)
  }

  if (!args.apply) {
    if (args.json) {
      console.log(JSON.stringify({ rowsScanned: rows.length, rowsToUpdate: updates.length, preview: updates.slice(0, 20) }, null, 2))
    } else if (!args.summary) {
      console.log(`Rows to update: ${updates.length}`)
      for (const row of updates.slice(0, 10)) {
        console.log(`${row.id} -> ${row.lifecycle_state}${row.reviewed_at ? ' (reviewed)' : ''}`)
      }
    }
    return
  }

  let updated = 0
  for (const row of updates) {
    const { error } = await supabase
      .from('briefs')
      .update({
        lifecycle_state: row.lifecycle_state,
        reviewed_at: row.reviewed_at,
        used_at: row.used_at,
        lifecycle_updated_at: row.lifecycle_updated_at,
      })
      .eq('id', row.id)
      .eq('user_id', row.user_id)

    if (error) {
      console.error(`Failed to update ${row.id}:`, error.message)
      continue
    }

    updated += 1
  }

  if (args.json) {
    console.log(JSON.stringify({ rowsScanned: rows.length, rowsUpdated: updated }, null, 2))
  } else {
    console.log(`Brief lifecycle backfill complete. Updated ${updated} row(s).`)
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})