#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  return {
    json: args.has('--json'),
    strict: args.has('--strict'),
  }
}

function getDateRange() {
  const now = new Date()
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - 7)
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    periodStart: start.toISOString().slice(0, 10),
    periodEnd: new Date(end.getTime() - 86400000).toISOString().slice(0, 10),
  }
}

function buildUrl(host, projectId) {
  const normalizedHost = host.replace(/\/$/, '')
  return `${normalizedHost}/api/projects/${projectId}/query/`
}

async function runHogQL({ host, projectId, apiKey, query }) {
  const response = await fetch(buildUrl(host, projectId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query,
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`PostHog query failed (${response.status}): ${text.slice(0, 300)}`)
  }

  const data = await response.json()
  return data.results ?? []
}

function firstNumber(rows, fallback = 0) {
  if (!Array.isArray(rows) || rows.length === 0 || !Array.isArray(rows[0])) return fallback
  const value = Number(rows[0][0])
  return Number.isFinite(value) ? value : fallback
}

function safeRate(num, den) {
  if (!den || den <= 0) return 0
  return Number((num / den).toFixed(4))
}

function toSeconds(ms) {
  return Number((ms / 1000).toFixed(2))
}

async function exportMetrics() {
  const host = (process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com').trim()
  const projectId = (process.env.POSTHOG_PROJECT_ID || '').trim()
  const apiKey = (process.env.POSTHOG_PERSONAL_API_KEY || '').trim()

  if (!projectId) {
    throw new Error('Missing POSTHOG_PROJECT_ID')
  }
  if (!apiKey) {
    throw new Error('Missing POSTHOG_PERSONAL_API_KEY')
  }

  const { startIso, endIso, periodStart, periodEnd } = getDateRange()
  const timeFilter = `timestamp >= toDateTime('${startIso}') AND timestamp < toDateTime('${endIso}')`

  const pageViews = firstNumber(await runHogQL({
    host,
    projectId,
    apiKey,
    query: `SELECT count() FROM events WHERE event = 'emi_page_view' AND ${timeFilter}`,
  }))

  const heroClicks = firstNumber(await runHogQL({
    host,
    projectId,
    apiKey,
    query: `
      SELECT count()
      FROM events
      WHERE event = 'emi_cta_click'
        AND (
          properties.cta_id IN ('hero_apply_beta', 'next_step_apply_beta', 'cio_prehero_start_trial')
          OR lowerUTF8(toString(properties.to_path)) LIKE '/signup%'
        )
        AND ${timeFilter}
    `,
  }))

  const formStarts = firstNumber(await runHogQL({
    host,
    projectId,
    apiKey,
    query: `
      SELECT count()
      FROM events
      WHERE (
        event = 'concierge_form_started'
        OR (event = 'emi_path_transition' AND lowerUTF8(toString(properties.to_path)) LIKE '/signup%')
      )
        AND ${timeFilter}
    `,
  }))

  const formSubmits = firstNumber(await runHogQL({
    host,
    projectId,
    apiKey,
    query: `
      SELECT count()
      FROM events
      WHERE (
        event = 'concierge_form_submitted'
        OR event = 'signup_completed'
      )
        AND ${timeFilter}
    `,
  }))

  const scroll25 = firstNumber(await runHogQL({
    host,
    projectId,
    apiKey,
    query: `SELECT count() FROM events WHERE event = 'emi_scroll_depth' AND toInt(properties.depth_pct) >= 25 AND ${timeFilter}`,
  }))

  const scroll75 = firstNumber(await runHogQL({
    host,
    projectId,
    apiKey,
    query: `SELECT count() FROM events WHERE event = 'emi_scroll_depth' AND toInt(properties.depth_pct) >= 75 AND ${timeFilter}`,
  }))

  const medianEngagedMs = firstNumber(await runHogQL({
    host,
    projectId,
    apiKey,
    query: `
      SELECT quantile(0.5)(session_dwell_ms)
      FROM (
        SELECT sum(toFloat(properties.dwell_ms)) AS session_dwell_ms
        FROM events
        WHERE event = 'emi_section_dwell' AND ${timeFilter}
        GROUP BY toString(properties.session_id)
      )
    `,
  }))

  const sectionRows = await runHogQL({
    host,
    projectId,
    apiKey,
    query: `
      SELECT properties.section_id, quantile(0.5)(toFloat(properties.dwell_ms))
      FROM events
      WHERE event = 'emi_section_dwell' AND ${timeFilter}
      GROUP BY properties.section_id
    `,
  })

  const sectionDwell = {
    clarity_block: 0,
    proof_block: 0,
    how_it_works_block: 0,
    objection_block: 0,
    final_cta_block: 0,
  }

  for (const row of sectionRows) {
    if (!Array.isArray(row) || row.length < 2) continue
    const sectionId = String(row[0] ?? '')
    const dwellMs = Number(row[1] ?? 0)
    if (!Object.prototype.hasOwnProperty.call(sectionDwell, sectionId)) continue
    sectionDwell[sectionId] = Number.isFinite(dwellMs) ? Math.round(dwellMs) : 0
  }

  const metrics = {
    source: 'posthog',
    exported_at: new Date().toISOString(),
    window_start_iso: startIso,
    window_end_iso: endIso,
    period_start: periodStart,
    period_end: periodEnd,
    qualified_signup_rate: safeRate(formSubmits, pageViews),
    hero_cta_ctr: safeRate(heroClicks, pageViews),
    form_start_rate: safeRate(formStarts, pageViews),
    form_completion_rate: safeRate(formSubmits, formStarts),
    bounce_rate: Number((1 - Math.min(safeRate(scroll25, pageViews), 1)).toFixed(4)),
    median_engaged_time_seconds: toSeconds(medianEngagedMs),
    scroll_depth_75_rate: safeRate(scroll75, pageViews),
    section_dwell_median_ms: sectionDwell,
    raw_counts: {
      page_views: pageViews,
      hero_apply_beta_clicks: heroClicks,
      form_starts: formStarts,
      form_submits: formSubmits,
      scroll_depth_25_hits: scroll25,
      scroll_depth_75_hits: scroll75,
    },
  }

  const outPath = path.join(process.cwd(), 'docs', 'growth', 'weekly-metrics.latest.json')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, `${JSON.stringify(metrics, null, 2)}\n`)

  return { outPath, metrics }
}

async function main() {
  const args = parseArgs(process.argv)
  try {
    const result = await exportMetrics()
    if (args.json) {
      console.log(JSON.stringify(result.metrics, null, 2))
      return
    }
    console.log('Growth weekly metrics exported from PostHog')
    console.log(`Output: ${result.outPath}`)
    console.log(`Window: ${result.metrics.period_start} to ${result.metrics.period_end}`)
    console.log(`Qualified signup rate: ${result.metrics.qualified_signup_rate}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(message)
    if (args.strict) {
      process.exit(2)
      return
    }
    process.exit(0)
  }
}

await main()