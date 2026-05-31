#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const OUTPUT_PATH = path.join(ROOT, 'docs', 'guide-retrieval-eval-candidates.latest.json')

function env(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required env: ${name}`)
  return value
}

function daysAgoIso(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

async function main() {
  const supabaseUrl = env('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRole = env('SUPABASE_SERVICE_ROLE_KEY')

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const since14d = daysAgoIso(14)

  const [{ data: lowConfidence, error: lowErr }, { data: feedbackRows, error: feedbackErr }] = await Promise.all([
    supabase
      .from('guide_chat_queries')
      .select('question,top_source_url,query_status')
      .in('query_status', ['low_confidence', 'no_match'])
      .gte('created_at', since14d)
      .order('created_at', { ascending: false })
      .limit(1000),
    supabase
      .from('guide_chat_feedback')
      .select('rating,note,guide_chat_query_id,created_at,guide_chat_queries(question,top_source_url)')
      .eq('rating', 'not_helpful')
      .gte('created_at', since14d)
      .order('created_at', { ascending: false })
      .limit(500),
  ])

  if (lowErr) throw lowErr
  if (feedbackErr) throw feedbackErr

  const candidates = []
  const dedupe = new Set()

  for (const row of lowConfidence ?? []) {
    const question = String(row.question ?? '').trim()
    if (!question || dedupe.has(`q:${question.toLowerCase()}`)) continue
    dedupe.add(`q:${question.toLowerCase()}`)

    candidates.push({
      source: row.query_status,
      question,
      suggestedExpectedAnyOfUrls: row.top_source_url ? [row.top_source_url] : [],
      reviewerNote: 'Review expected URL(s) and add to docs/guide-retrieval-eval-set.json if valid.',
    })
  }

  for (const row of feedbackRows ?? []) {
    const related = Array.isArray(row.guide_chat_queries) ? row.guide_chat_queries[0] : row.guide_chat_queries
    const question = String(related?.question ?? '').trim()
    if (!question || dedupe.has(`q:${question.toLowerCase()}`)) continue
    dedupe.add(`q:${question.toLowerCase()}`)

    candidates.push({
      source: 'not_helpful_feedback',
      question,
      suggestedExpectedAnyOfUrls: related?.top_source_url ? [related.top_source_url] : [],
      reviewerNote: String(row.note ?? '').trim() || 'User marked this answer as not helpful.',
    })
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    lookbackDays: 14,
    candidateCount: candidates.length,
    candidates: candidates.slice(0, 100),
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`)

  console.log(`guide-generate-eval-candidates: ${payload.candidateCount} candidate queries`) 
}

main().catch((error) => {
  console.error('guide-generate-eval-candidates: failed', error)
  process.exitCode = 1
})
