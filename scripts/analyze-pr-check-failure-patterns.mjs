#!/usr/bin/env node
/**
 * PR Check Failure Pattern Agent
 *
 * Analyzes completed CI workflow runs over a trailing window, groups failures
 * by job/check name, and surfaces patterns for review:
 *  - Repeat offenders (checks with the most failures)
 *  - Flaky checks (failed then succeeded on retry of the same run)
 *  - Consecutive-failure streaks (possible systemic breakage)
 *  - Failure concentration by day-of-week (infra/timing patterns)
 *
 * Posts a summary to Slack when SLACK_WEBHOOK_URL is set.
 * Writes docs/status/pr-check-failure-patterns.latest.{json,md}
 *
 * Usage: node scripts/analyze-pr-check-failure-patterns.mjs [--days 30] [--json]
 * Env:   GITHUB_TOKEN, GITHUB_REPOSITORY (owner/repo), SLACK_WEBHOOK_URL (optional)
 */
import fs from 'node:fs'
import path from 'node:path'

const API_VERSION = '2022-11-28'
const argv = process.argv.slice(2)
const asJson = argv.includes('--json')
const daysArg = argv.indexOf('--days')
const DAYS = daysArg >= 0 ? Math.max(1, Number(argv[daysArg + 1]) || 30) : 30

const token = process.env.GITHUB_TOKEN
const repository = process.env.GITHUB_REPOSITORY ?? 'richrothschild/startingmonday'
const [owner, repo] = repository.split('/')

if (!token) {
  console.error('Missing GITHUB_TOKEN')
  process.exit(1)
}

async function gh(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': API_VERSION,
      'User-Agent': 'startingmonday-pr-check-failure-patterns',
    },
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`GitHub API ${response.status} for ${url}: ${body.slice(0, 200)}`)
  }
  return response.json()
}

const sinceIso = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString()

async function fetchRuns() {
  const runs = []
  for (let page = 1; page <= 6; page += 1) {
    const data = await gh(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/ci.yml/runs?status=completed&per_page=100&page=${page}&created=>=${sinceIso.slice(0, 10)}`)
    const batch = data.workflow_runs ?? []
    runs.push(...batch)
    if (batch.length < 100) break
  }
  return runs.filter((run) => run.created_at >= sinceIso)
}

const runs = await fetchRuns()

/** name -> { pass, fail, flaky, failures: [{runId, branch, event, createdAt, url}] } */
const checkStats = new Map()
/** ordered per-check conclusions for streak detection (newest first from API; we reverse) */
const checkTimeline = new Map()
const dayOfWeekFailures = new Map()

for (const run of runs) {
  let jobs
  try {
    jobs = await gh(`https://api.github.com/repos/${owner}/${repo}/actions/runs/${run.id}/jobs?per_page=100`)
  } catch {
    continue
  }
  for (const job of jobs.jobs ?? []) {
    if (!['success', 'failure'].includes(job.conclusion)) continue
    const entry = checkStats.get(job.name) ?? { pass: 0, fail: 0, flaky: 0, failures: [] }
    const timeline = checkTimeline.get(job.name) ?? []

    if (job.conclusion === 'success') {
      entry.pass += 1
      if ((job.run_attempt ?? 1) > 1) entry.flaky += 1
      timeline.push({ at: job.started_at, ok: true })
    } else {
      entry.fail += 1
      entry.failures.push({
        runId: run.id,
        branch: run.head_branch,
        event: run.event,
        createdAt: run.created_at,
        url: job.html_url,
      })
      timeline.push({ at: job.started_at, ok: false })
      const day = new Date(run.created_at).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
      dayOfWeekFailures.set(day, (dayOfWeekFailures.get(day) ?? 0) + 1)
    }

    checkStats.set(job.name, entry)
    checkTimeline.set(job.name, timeline)
  }
}

function longestStreak(timeline) {
  const sorted = [...timeline].sort((a, b) => String(a.at).localeCompare(String(b.at)))
  let max = 0
  let current = 0
  for (const point of sorted) {
    current = point.ok ? 0 : current + 1
    if (current > max) max = current
  }
  return max
}

const patterns = []
const checks = [...checkStats.entries()].map(([name, entry]) => {
  const total = entry.pass + entry.fail
  const failRate = total > 0 ? Number(((entry.fail / total) * 100).toFixed(1)) : 0
  const flakeRate = total > 0 ? Number(((entry.flaky / total) * 100).toFixed(1)) : 0
  const streak = longestStreak(checkTimeline.get(name) ?? [])
  return { name, ...entry, total, failRate, flakeRate, streak }
}).sort((a, b) => b.fail - a.fail)

for (const check of checks) {
  if (check.fail >= 3 && check.failRate >= 20) {
    patterns.push({ kind: 'repeat-offender', check: check.name, detail: `${check.fail} failures / ${check.total} runs (${check.failRate}%)` })
  }
  if (check.flakeRate >= 10) {
    patterns.push({ kind: 'flaky', check: check.name, detail: `${check.flaky} retry-passes (${check.flakeRate}% of runs) — investigate nondeterminism` })
  }
  if (check.streak >= 3) {
    patterns.push({ kind: 'streak', check: check.name, detail: `longest consecutive-failure streak: ${check.streak} — likely systemic breakage during window` })
  }
}

const dayHotspots = [...dayOfWeekFailures.entries()].sort((a, b) => b[1] - a[1])
const totalFailures = checks.reduce((sum, c) => sum + c.fail, 0)
if (dayHotspots.length > 0 && totalFailures >= 10 && dayHotspots[0][1] / totalFailures >= 0.4) {
  patterns.push({ kind: 'day-concentration', check: '(all)', detail: `${dayHotspots[0][1]}/${totalFailures} failures on ${dayHotspots[0][0]} — check scheduled-job or deploy-day interactions` })
}

const summary = {
  generatedAt: new Date().toISOString(),
  windowDays: DAYS,
  runsAnalyzed: runs.length,
  totalFailures,
  patterns,
  checks: checks.slice(0, 25),
  failuresByDay: Object.fromEntries(dayHotspots),
}

const outDir = path.join(process.cwd(), 'docs', 'status')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'pr-check-failure-patterns.latest.json'), JSON.stringify(summary, null, 2))

const mdLines = [
  '# PR Check Failure Patterns',
  '',
  `Generated: ${summary.generatedAt}`,
  `Window: last ${DAYS} days | Runs analyzed: ${runs.length} | Total job failures: ${totalFailures}`,
  '',
  '## Detected Patterns',
  '',
  ...(patterns.length === 0
    ? ['No significant failure patterns detected.']
    : patterns.map((p) => `- [${p.kind}] ${p.check}: ${p.detail}`)),
  '',
  '## Check Health (top 25 by failures)',
  '',
  '| Check | Pass | Fail | Fail % | Flake % | Max streak |',
  '| --- | ---: | ---: | ---: | ---: | ---: |',
  ...checks.slice(0, 25).map((c) => `| ${c.name} | ${c.pass} | ${c.fail} | ${c.failRate}% | ${c.flakeRate}% | ${c.streak} |`),
]
fs.writeFileSync(path.join(outDir, 'pr-check-failure-patterns.latest.md'), mdLines.join('\n') + '\n')

if (asJson) {
  console.log(JSON.stringify(summary, null, 2))
} else {
  console.log(`PR check failure patterns: ${patterns.length} pattern(s) across ${runs.length} runs (${DAYS}d window)`)
  for (const p of patterns) console.log(`  [${p.kind}] ${p.check}: ${p.detail}`)
}

const webhook = process.env.SLACK_WEBHOOK_URL
if (webhook) {
  const top = checks.filter((c) => c.fail > 0).slice(0, 5)
  const text = [
    `:mag: Weekly PR check failure pattern report (${DAYS}d window)`,
    `Runs analyzed: ${runs.length} | Job failures: ${totalFailures} | Patterns: ${patterns.length}`,
    '',
    ...(patterns.length === 0
      ? ['No significant failure patterns detected. CI is healthy.']
      : patterns.slice(0, 8).map((p) => `• [${p.kind}] ${p.check} — ${p.detail}`)),
    '',
    top.length > 0 ? 'Top failing checks:' : '',
    ...top.map((c) => `• ${c.name}: ${c.fail} fails / ${c.total} runs (flake ${c.flakeRate}%)`),
  ].filter(Boolean).join('\n')

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    console.log(`slack post: ${res.status}`)
  } catch (err) {
    console.error(`slack post failed: ${err.message}`)
  }
}
