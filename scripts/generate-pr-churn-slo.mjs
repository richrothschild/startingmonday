#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_DAYS = 14
const API_VERSION = '2022-11-28'

function parseArgs(argv) {
  const args = argv.slice(2)
  const config = {
    days: DEFAULT_DAYS,
    json: false,
    strict: false,
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--json') config.json = true
    else if (arg === '--strict') config.strict = true
    else if (arg === '--days') {
      const next = Number(args[i + 1])
      if (Number.isFinite(next) && next > 0) {
        config.days = Math.floor(next)
        i += 1
      }
    }
  }

  return config
}

function median(values) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) return sorted[mid]
  return (sorted[mid - 1] + sorted[mid]) / 2
}

function pct(part, total) {
  if (!total) return 0
  return Number(((part / total) * 100).toFixed(2))
}

async function githubRequest(url, token) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': API_VERSION,
      'User-Agent': 'startingmonday-pr-churn-slo',
    },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`GitHub API ${response.status} for ${url}: ${body.slice(0, 200)}`)
  }

  return response.json()
}

async function fetchMergedPrs({ owner, repo, token, sinceIso }) {
  const merged = []
  let page = 1

  while (page <= 10) {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&base=main&sort=updated&direction=desc&per_page=100&page=${page}`
    const pulls = await githubRequest(url, token)
    if (!Array.isArray(pulls) || pulls.length === 0) break

    let shouldContinue = false
    for (const pr of pulls) {
      if (!pr.merged_at) continue
      if (pr.merged_at >= sinceIso) {
        merged.push(pr)
        shouldContinue = true
      }
    }

    if (!shouldContinue) break
    page += 1
  }

  return merged
}

async function fetchReopenCount({ owner, repo, token, prNumber }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/timeline?per_page=100`
  const timeline = await githubRequest(url, token)
  if (!Array.isArray(timeline)) return 0
  return timeline.filter((event) => event?.event === 'reopened').length
}

function toHours(startIso, endIso) {
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()
  return Number(((end - start) / 36e5).toFixed(2))
}

function buildMarkdown(report) {
  return [
    '# PR Churn SLO Dashboard',
    '',
    `Generated: ${report.generatedAt}`,
    `Window: last ${report.windowDays} days`,
    '',
    '## Snapshot',
    '',
    `- Merged PRs: ${report.metrics.mergedPrs}`,
    `- Reopened PRs: ${report.metrics.reopenedPrs} (${report.metrics.reopenRatePct}%)`,
    `- Median time to merge (hours): ${report.metrics.medianTimeToMergeHours}`,
    `- Median commits per PR: ${report.metrics.medianCommitsPerPr}`,
    `- Median files changed per PR: ${report.metrics.medianFilesChangedPerPr}`,
    `- High churn PR rate (>= ${report.thresholds.highChurnCommitThreshold} commits): ${report.metrics.highChurnRatePct}%`,
    '',
    '## SLO Gates',
    '',
    `- Reopen rate <= ${report.thresholds.maxReopenRatePct}%: ${report.gates.reopenRate}`,
    `- Median commits <= ${report.thresholds.maxMedianCommits}: ${report.gates.medianCommits}`,
    `- Median time to merge <= ${report.thresholds.maxMedianTimeToMergeHours}h: ${report.gates.medianTimeToMerge}`,
    `- High churn rate <= ${report.thresholds.maxHighChurnRatePct}%: ${report.gates.highChurnRate}`,
    '',
    `Overall status: ${report.status.toUpperCase()}`,
    '',
  ].join('\n')
}

async function generateReport(options) {
  const token = process.env.GITHUB_TOKEN
  const repository = process.env.GITHUB_REPOSITORY

  if (!token) throw new Error('Missing GITHUB_TOKEN')
  if (!repository || !repository.includes('/')) throw new Error('Missing GITHUB_REPOSITORY (owner/repo)')

  const [owner, repo] = repository.split('/')
  const since = new Date(Date.now() - options.days * 24 * 60 * 60 * 1000)
  const sinceIso = since.toISOString()

  const prs = await fetchMergedPrs({ owner, repo, token, sinceIso })

  const durations = []
  const commits = []
  const filesChanged = []
  let reopenedPrs = 0
  let highChurnPrs = 0

  for (const pr of prs) {
    durations.push(toHours(pr.created_at, pr.merged_at))
    commits.push(Number(pr.commits ?? 0))
    filesChanged.push(Number(pr.changed_files ?? 0))

    if (Number(pr.commits ?? 0) >= 5) highChurnPrs += 1

    const reopenCount = await fetchReopenCount({ owner, repo, token, prNumber: pr.number })
    if (reopenCount > 0) reopenedPrs += 1
  }

  const metrics = {
    mergedPrs: prs.length,
    reopenedPrs,
    reopenRatePct: pct(reopenedPrs, prs.length),
    medianTimeToMergeHours: Number(median(durations).toFixed(2)),
    medianCommitsPerPr: Number(median(commits).toFixed(2)),
    medianFilesChangedPerPr: Number(median(filesChanged).toFixed(2)),
    highChurnRatePct: pct(highChurnPrs, prs.length),
  }

  const thresholds = {
    maxReopenRatePct: 10,
    maxMedianCommits: 4,
    maxMedianTimeToMergeHours: 48,
    maxHighChurnRatePct: 20,
    highChurnCommitThreshold: 5,
  }

  const gates = {
    reopenRate: metrics.reopenRatePct <= thresholds.maxReopenRatePct ? 'pass' : 'fail',
    medianCommits: metrics.medianCommitsPerPr <= thresholds.maxMedianCommits ? 'pass' : 'fail',
    medianTimeToMerge: metrics.medianTimeToMergeHours <= thresholds.maxMedianTimeToMergeHours ? 'pass' : 'fail',
    highChurnRate: metrics.highChurnRatePct <= thresholds.maxHighChurnRatePct ? 'pass' : 'fail',
  }

  const failedCount = Object.values(gates).filter((v) => v === 'fail').length
  const status = failedCount === 0 ? 'pass' : failedCount <= 2 ? 'warn' : 'fail'

  const report = {
    generatedAt: new Date().toISOString(),
    windowDays: options.days,
    status,
    thresholds,
    metrics,
    gates,
  }

  const outDir = path.join(process.cwd(), 'docs', 'status')
  fs.mkdirSync(outDir, { recursive: true })
  const jsonPath = path.join(outDir, 'pr-churn-slo.latest.json')
  const mdPath = path.join(outDir, 'pr-churn-slo.latest.md')

  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(mdPath, `${buildMarkdown(report)}`)

  return { report, jsonPath, mdPath }
}

async function main() {
  const options = parseArgs(process.argv)
  try {
    const { report, jsonPath, mdPath } = await generateReport(options)
    if (options.json) {
      console.log(JSON.stringify(report, null, 2))
    } else {
      console.log('PR churn SLO report generated')
      console.log(`JSON: ${jsonPath}`)
      console.log(`MD: ${mdPath}`)
      console.log(`Status: ${report.status}`)
    }

    if (options.strict && report.status === 'fail') {
      process.exit(2)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(message)
    process.exit(options.strict ? 2 : 0)
  }
}

await main()
