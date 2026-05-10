#!/usr/bin/env node
/**
 * Weekly PageSpeed Insights check for startingmonday.app
 * Run: node scripts/pagespeed-check.mjs
 * Prints a report to stdout. Exits with code 1 if any score dropped >= 3 points.
 */

import https from 'https'

const URL = 'https://startingmonday.app'
const BASELINE = {
  mobile:  { performance: 96, accessibility: 94, bestPractices: 92, seo: 92 },
  desktop: { performance: 99, accessibility: 94, bestPractices: 92, seo: 92 },
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => { try { resolve(JSON.parse(body)) } catch (e) { reject(e) } })
    }).on('error', reject)
  })
}

async function getScores(strategy) {
  const key = process.env.PAGESPEED_API_KEY ? `&key=${process.env.PAGESPEED_API_KEY}` : ''
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(URL)}&strategy=${strategy}${key}`
  const data = await fetchJson(apiUrl)
  if (data.error) throw new Error(`PageSpeed API error ${data.error.code}: ${data.error.message}`)
  const cats = data.lighthouseResult?.categories ?? {}
  const audits = data.lighthouseResult?.audits ?? {}

  const scores = {
    performance:   Math.round((cats.performance?.score ?? 0) * 100),
    accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
    seo:           Math.round((cats.seo?.score ?? 0) * 100),
  }

  const failingAudits = Object.entries(audits)
    .filter(([, a]) => a.score !== null && a.score < 1 && !['informative', 'manual', 'notApplicable'].includes(a.scoreDisplayMode))
    .map(([, a]) => `  • ${a.title}`)

  return { scores, failingAudits }
}

function delta(current, baseline) {
  const lines = []
  const labels = { performance: 'Performance', accessibility: 'Accessibility', bestPractices: 'Best Practices', seo: 'SEO' }
  for (const [key, label] of Object.entries(labels)) {
    const diff = current[key] - baseline[key]
    if (diff !== 0) lines.push(`  ${label}: ${baseline[key]} → ${current[key]} (${diff > 0 ? '+' : ''}${diff})`)
  }
  return lines
}

async function main() {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  process.stderr.write(`Fetching PageSpeed for ${URL}...\n`)

  const [mobile, desktop] = await Promise.all([getScores('mobile'), getScores('desktop')])

  const mChanges = delta(mobile.scores, BASELINE.mobile)
  const dChanges = delta(desktop.scores, BASELINE.desktop)
  const allChanges = [...mChanges.map(l => 'Mobile ' + l.trim()), ...dChanges.map(l => 'Desktop ' + l.trim())]
  const dropped = allChanges.filter(l => /\(-[3-9]|-[1-9]\d+\)/.test(l))

  const lines = [
    `STARTING MONDAY — WEEKLY PAGESPEED REPORT`,
    date,
    ``,
    `SCORES`,
    `Mobile:  Perf ${mobile.scores.performance}  /  A11y ${mobile.scores.accessibility}  /  BP ${mobile.scores.bestPractices}  /  SEO ${mobile.scores.seo}`,
    `Desktop: Perf ${desktop.scores.performance}  /  A11y ${desktop.scores.accessibility}  /  BP ${desktop.scores.bestPractices}  /  SEO ${desktop.scores.seo}`,
    ``,
    `BASELINE (2026-05-10)`,
    `Mobile:  Perf 96  /  A11y 94  /  BP 92  /  SEO 92`,
    `Desktop: Perf 99  /  A11y 94  /  BP 92  /  SEO 92`,
    ``,
    `CHANGES`,
    ...(allChanges.length ? allChanges.map(l => `  ${l}`) : ['  None']),
    ``,
    `MOBILE FAILING AUDITS`,
    ...(mobile.failingAudits.length ? mobile.failingAudits : ['  None']),
    ``,
    `DESKTOP FAILING AUDITS`,
    ...(desktop.failingAudits.length ? desktop.failingAudits : ['  None']),
  ]

  console.log(lines.join('\n'))

  if (dropped.length) {
    process.stderr.write(`\nWARNING: Score regression detected:\n${dropped.join('\n')}\n`)
    process.exit(1)
  }
}

main().catch(err => { console.error(err.message); process.exit(1) })
