#!/usr/bin/env node
/**
 * Weekly PageSpeed Insights check for startingmonday.app
 * Run: node scripts/pagespeed-check.mjs
 * Auto-reads .env.local for PAGESPEED_API_KEY and RESEND_API_KEY.
 * Sends email report via Resend. Exits code 1 on score regression.
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SITE_URL = 'https://startingmonday.app'
const TO = 'rothschild@gmail.com'
const FROM = 'briefing@startingmonday.app'
const BASELINE = {
  mobile:  { performance: 93, accessibility: 95, bestPractices: 92, seo: 92 },
  desktop: { performance: 100, accessibility: 95, bestPractices: 92, seo: 92 },
}

// Parse .env.local into process.env if keys are missing
function loadEnv() {
  const envPath = path.join(ROOT, '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
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
  const catParams = '&category=performance&category=accessibility&category=best-practices&category=seo'
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(SITE_URL)}&strategy=${strategy}${catParams}${key}`
  const data = await fetchJson(apiUrl)
  if (data.error) throw new Error(`PageSpeed API ${data.error.code}: ${data.error.message}`)
  const cats = data.lighthouseResult?.categories ?? {}
  const audits = data.lighthouseResult?.audits ?? {}
  return {
    scores: {
      performance:   Math.round((cats.performance?.score ?? 0) * 100),
      accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
      seo:           Math.round((cats.seo?.score ?? 0) * 100),
    },
    failingAudits: Object.values(audits)
      .filter(a => a.score !== null && a.score < 1 && !['informative','manual','notApplicable'].includes(a.scoreDisplayMode))
      .map(a => `  • ${a.title}`),
  }
}

function delta(current, baseline) {
  const labels = { performance: 'Performance', accessibility: 'Accessibility', bestPractices: 'Best Practices', seo: 'SEO' }
  return Object.entries(labels)
    .map(([k, label]) => {
      const diff = current[k] - baseline[k]
      return diff !== 0 ? `  ${label}: ${baseline[k]} → ${current[k]} (${diff > 0 ? '+' : ''}${diff})` : null
    })
    .filter(Boolean)
}

async function sendEmail(subject, text) {
  const key = process.env.RESEND_API_KEY
  if (!key) { console.log('No RESEND_API_KEY — skipping email.'); return }
  const body = JSON.stringify({ from: FROM, to: TO, subject, text })
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: 'api.resend.com', path: '/emails', method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
      res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d))) }
    )
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function main() {
  loadEnv()
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  process.stderr.write(`Fetching PageSpeed for ${SITE_URL} on ${date}...\n`)

  let mobile, desktop, apiError = ''
  try {
    ;[mobile, desktop] = await Promise.all([getScores('mobile'), getScores('desktop')])
  } catch (err) {
    apiError = `API error: ${err.message}`
    process.stderr.write(apiError + '\n')
  }

  const mChanges = mobile ? delta(mobile.scores, BASELINE.mobile) : []
  const dChanges = desktop ? delta(desktop.scores, BASELINE.desktop) : []
  const allChanges = [...mChanges.map(l => 'Mobile ' + l.trim()), ...dChanges.map(l => 'Desktop ' + l.trim())]
  const dropped = allChanges.filter(l => /\(-[3-9]|-[1-9]\d+\)/.test(l))

  const scoreLines = mobile && desktop ? [
    `SCORES THIS WEEK`,
    `Mobile:  Perf ${mobile.scores.performance}  /  A11y ${mobile.scores.accessibility}  /  BP ${mobile.scores.bestPractices}  /  SEO ${mobile.scores.seo}`,
    `Desktop: Perf ${desktop.scores.performance}  /  A11y ${desktop.scores.accessibility}  /  BP ${desktop.scores.bestPractices}  /  SEO ${desktop.scores.seo}`,
  ] : [`SCORES: ${apiError || 'unavailable'}`]

  const report = [
    `STARTING MONDAY — WEEKLY PAGESPEED REPORT`,
    date,
    ``,
    ...scoreLines,
    ``,
    `BASELINE (2026-05-10, post-accessibility-fixes)`,
    `Mobile:  Perf 93  /  A11y 95  /  BP 92  /  SEO 92`,
    `Desktop: Perf 100  /  A11y 95  /  BP 92  /  SEO 92`,
    ``,
    `CHANGES VS BASELINE`,
    ...(allChanges.length ? allChanges.map(l => `  ${l}`) : ['  None']),
    ``,
    `MOBILE FAILING AUDITS`,
    ...(mobile?.failingAudits.length ? mobile.failingAudits : ['  None']),
    ``,
    `DESKTOP FAILING AUDITS`,
    ...(desktop?.failingAudits.length ? desktop.failingAudits : ['  None']),
    ...(dropped.length ? [``, `REGRESSIONS (action needed):`, ...dropped.map(l => `  ${l}`)] : []),
    ...(apiError ? [``, `NOTE: ${apiError}`] : []),
  ].join('\n')

  console.log('\n' + report + '\n')

  const result = await sendEmail(`Starting Monday — Weekly PageSpeed Report — ${date}`, report)
  if (result?.id) console.log(`Email sent (id: ${result.id})`)
  else if (result?.name) console.error('Email error:', result)

  if (dropped.length) process.exit(1)
}

main().catch(err => { console.error(err.message); process.exit(1) })
