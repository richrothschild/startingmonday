#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const OUTPUT_JSON_PATH = path.join(ROOT, 'docs', 'status', 'guide-query-analytics.weekly.latest.json')
const OUTPUT_MD_PATH = path.join(ROOT, 'docs', 'status', 'guide-query-analytics.weekly.latest.md')

function env(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required env: ${name}`)
  return value
}

function daysAgoIso(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function toKeyMinute(iso) {
  const d = new Date(iso)
  d.setSeconds(0, 0)
  return d.toISOString()
}

async function main() {
  const supabaseUrl = env('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRole = env('SUPABASE_SERVICE_ROLE_KEY')

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const since7d = daysAgoIso(7)

  const [{ data: queries, error: qErr }, { data: feedback, error: fErr }] = await Promise.all([
    supabase
      .from('guide_chat_queries')
      .select('id,user_id,question,intent,query_status,confidence,top_source_url,created_at')
      .gte('created_at', since7d)
      .order('created_at', { ascending: false })
      .limit(5000),
    supabase
      .from('guide_chat_feedback')
      .select('guide_chat_query_id,rating,created_at')
      .gte('created_at', since7d)
      .order('created_at', { ascending: false })
      .limit(5000),
  ])

  if (qErr) throw qErr
  if (fErr) throw fErr

  const q = queries ?? []
  const f = feedback ?? []

  const noMatch = q.filter((row) => row.query_status === 'no_match').length
  const lowConfidence = q.filter((row) => row.query_status === 'low_confidence').length

  const byQuestion = new Map()
  for (const row of q) {
    const key = String(row.question || '').toLowerCase().trim()
    byQuestion.set(key, (byQuestion.get(key) ?? 0) + 1)
  }
  const topQuestions = [...byQuestion.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([question, count]) => ({ question, count }))

  const intentMap = new Map()
  for (const row of q) {
    const key = row.intent || 'general'
    intentMap.set(key, (intentMap.get(key) ?? 0) + 1)
  }
  const intentBreakdown = [...intentMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([intent, count]) => ({ intent, count }))

  const byUserMinute = new Map()
  for (const row of q) {
    const userId = row.user_id
    const minute = toKeyMinute(row.created_at)
    const key = `${userId}:${minute}`
    byUserMinute.set(key, (byUserMinute.get(key) ?? 0) + 1)
  }
  const reformulations = [...byUserMinute.values()].filter((count) => count > 1).length
  const reformulationRate = q.length > 0 ? reformulations / q.length : 0

  const feedbackByRating = {
    helpful: f.filter((row) => row.rating === 'helpful').length,
    not_helpful: f.filter((row) => row.rating === 'not_helpful').length,
  }

  const report = {
    generatedAt: new Date().toISOString(),
    lookbackDays: 7,
    totals: {
      queries: q.length,
      noMatch,
      lowConfidence,
      reformulations,
      reformulationRate,
    },
    feedback: feedbackByRating,
    intentBreakdown,
    topQuestions,
  }

  fs.mkdirSync(path.dirname(OUTPUT_JSON_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)

  const markdown = [
    '# Guide Query Analytics Weekly (Latest)',
    '',
    `Generated at: ${report.generatedAt}`,
    `Lookback: ${report.lookbackDays} days`,
    '',
    `- queries: ${report.totals.queries}`,
    `- no_match: ${report.totals.noMatch}`,
    `- low_confidence: ${report.totals.lowConfidence}`,
    `- reformulations: ${report.totals.reformulations}`,
    `- reformulation_rate: ${(report.totals.reformulationRate * 100).toFixed(1)}%`,
    `- feedback_helpful: ${report.feedback.helpful}`,
    `- feedback_not_helpful: ${report.feedback.not_helpful}`,
    '',
    '## Top Questions',
    ...(report.topQuestions.length > 0
      ? report.topQuestions.map((row, index) => `${index + 1}. ${row.question} (${row.count})`)
      : ['- none']),
    '',
    '## Intent Breakdown',
    ...(report.intentBreakdown.length > 0
      ? report.intentBreakdown.map((row) => `- ${row.intent}: ${row.count}`)
      : ['- none']),
    '',
  ].join('\n')

  fs.writeFileSync(OUTPUT_MD_PATH, `${markdown}\n`)
  console.log(`guide-query-analytics-weekly: queries=${q.length} no_match=${noMatch} low_confidence=${lowConfidence}`)
}

main().catch((error) => {
  console.error('guide-query-analytics-weekly: failed', error)
  process.exitCode = 1
})
