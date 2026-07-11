#!/usr/bin/env node
/**
 * Unshipped Code Agent
 *
 * Surfaces code that exists but is not yet in production (main), at any stage:
 *  1. Branch drift: commits on staging (and other branches) ahead of main
 *  2. Open PRs: age, review state, and staleness
 *  3. Stale branches: unmerged branches with no recent activity
 *  4. Local mode (--local): uncommitted/untracked worktree changes
 *
 * Posts a summary to Slack when SLACK_WEBHOOK_URL is set.
 * Writes docs/status/unshipped-code.latest.{json,md}
 *
 * Usage: node scripts/check-unshipped-code.mjs [--json] [--local]
 * Env:   GITHUB_TOKEN, GITHUB_REPOSITORY (owner/repo), SLACK_WEBHOOK_URL (optional)
 */
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const API_VERSION = '2022-11-28'
const argv = process.argv.slice(2)
const asJson = argv.includes('--json')
const localMode = argv.includes('--local')

const token = process.env.GITHUB_TOKEN
const repository = process.env.GITHUB_REPOSITORY ?? 'richrothschild/startingmonday'
const [owner, repo] = repository.split('/')

const STALE_PR_DAYS = 7
const STALE_BRANCH_DAYS = 14

async function gh(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': API_VERSION,
      'User-Agent': 'startingmonday-unshipped-code-agent',
    },
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`GitHub API ${response.status} for ${url}: ${body.slice(0, 200)}`)
  }
  return response.json()
}

function daysAgo(iso) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}

const findings = []

// 1 + 3. Branch drift and stale branches
let branches = []
if (token) {
  branches = await gh(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`)
}

const branchDrift = []
for (const branch of branches) {
  if (branch.name === 'main') continue
  try {
    const compare = await gh(`https://api.github.com/repos/${owner}/${repo}/compare/main...${encodeURIComponent(branch.name)}`)
    if (compare.ahead_by > 0) {
      const lastCommitAt = compare.commits?.at(-1)?.commit?.committer?.date ?? null
      const ageDays = lastCommitAt ? daysAgo(lastCommitAt) : null
      branchDrift.push({
        branch: branch.name,
        aheadBy: compare.ahead_by,
        behindBy: compare.behind_by,
        lastCommitAt,
        ageDays,
        headSha: branch.commit?.sha?.slice(0, 8) ?? null,
      })
      if (branch.name === 'staging') {
        findings.push({
          kind: 'staging-drift',
          severity: compare.ahead_by >= 5 ? 'high' : 'info',
          detail: `staging is ${compare.ahead_by} commit(s) ahead of main — unpromoted work in the release pipeline`,
        })
      } else if (ageDays !== null && ageDays >= STALE_BRANCH_DAYS) {
        findings.push({
          kind: 'stale-branch',
          severity: 'review',
          detail: `${branch.name}: ${compare.ahead_by} unmerged commit(s), last activity ${ageDays}d ago — merge, promote, or delete`,
        })
      } else {
        findings.push({
          kind: 'branch-ahead',
          severity: 'info',
          detail: `${branch.name}: ${compare.ahead_by} commit(s) not in main`,
        })
      }
    }
  } catch {
    // Branch comparison can fail for detached/odd refs; skip rather than abort the audit.
  }
}

// 2. Open PRs
let openPrs = []
if (token) {
  const pulls = await gh(`https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=100`)
  openPrs = pulls.map((pr) => ({
    number: pr.number,
    title: pr.title,
    branch: pr.head?.ref,
    base: pr.base?.ref,
    draft: pr.draft,
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    ageDays: daysAgo(pr.created_at),
    idleDays: daysAgo(pr.updated_at),
    url: pr.html_url,
  }))

  for (const pr of openPrs) {
    if (pr.idleDays >= STALE_PR_DAYS) {
      findings.push({
        kind: 'stale-pr',
        severity: 'review',
        detail: `PR #${pr.number} "${pr.title}" idle ${pr.idleDays}d (${pr.draft ? 'draft' : 'open'}) — review, merge, or close`,
      })
    }
  }
}

// 4. Local worktree (only meaningful when run on a dev machine)
let localState = null
if (localMode) {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim()
    const lines = status ? status.split('\n') : []
    const unpushed = execSync('git log @{u}..HEAD --oneline', { encoding: 'utf8' }).trim()
    const unpushedLines = unpushed ? unpushed.split('\n') : []
    localState = {
      dirtyFiles: lines.length,
      unpushedCommits: unpushedLines.length,
      sample: lines.slice(0, 10),
    }
    if (lines.length > 0) {
      findings.push({ kind: 'uncommitted', severity: 'review', detail: `${lines.length} uncommitted/untracked file(s) in local worktree` })
    }
    if (unpushedLines.length > 0) {
      findings.push({ kind: 'unpushed', severity: 'review', detail: `${unpushedLines.length} local commit(s) not pushed to remote` })
    }
  } catch {
    localState = { error: 'git inspection failed' }
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  repository,
  branchDrift,
  openPrs,
  localState,
  findings,
  counts: {
    branchesAheadOfMain: branchDrift.length,
    openPrs: openPrs.length,
    findings: findings.length,
    reviewNeeded: findings.filter((f) => f.severity === 'review' || f.severity === 'high').length,
  },
}

const outDir = path.join(process.cwd(), 'docs', 'status')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'unshipped-code.latest.json'), JSON.stringify(summary, null, 2))

const mdLines = [
  '# Unshipped Code Audit',
  '',
  `Generated: ${summary.generatedAt}`,
  `Branches ahead of main: ${branchDrift.length} | Open PRs: ${openPrs.length} | Findings: ${findings.length}`,
  '',
  '## Findings',
  '',
  ...(findings.length === 0 ? ['Everything is shipped. No unmerged or unpromoted code detected.'] : findings.map((f) => `- [${f.severity}] [${f.kind}] ${f.detail}`)),
  '',
  '## Branch Drift',
  '',
  '| Branch | Ahead | Behind | Last commit | Age (d) |',
  '| --- | ---: | ---: | --- | ---: |',
  ...branchDrift.map((b) => `| ${b.branch} | ${b.aheadBy} | ${b.behindBy} | ${b.lastCommitAt ?? '-'} | ${b.ageDays ?? '-'} |`),
  '',
  '## Open PRs',
  '',
  ...(openPrs.length === 0 ? ['None.'] : openPrs.map((pr) => `- #${pr.number} ${pr.title} (${pr.branch} -> ${pr.base}, age ${pr.ageDays}d, idle ${pr.idleDays}d)${pr.draft ? ' [draft]' : ''}`)),
]
fs.writeFileSync(path.join(outDir, 'unshipped-code.latest.md'), mdLines.join('\n') + '\n')

if (asJson) {
  console.log(JSON.stringify(summary, null, 2))
} else {
  console.log(`Unshipped code audit: ${findings.length} finding(s), ${branchDrift.length} branch(es) ahead of main, ${openPrs.length} open PR(s)`)
  for (const f of findings) console.log(`  [${f.severity}] [${f.kind}] ${f.detail}`)
}

const webhook = process.env.SLACK_WEBHOOK_URL
if (webhook && findings.length > 0) {
  const stagingDrift = branchDrift.find((b) => b.branch === 'staging')
  const text = [
    ':package: Daily unshipped-code audit',
    `Branches ahead of main: ${branchDrift.length} | Open PRs: ${openPrs.length}`,
    stagingDrift ? `staging -> main: ${stagingDrift.aheadBy} commit(s) awaiting promotion` : 'staging is fully promoted to main',
    '',
    ...findings.slice(0, 12).map((f) => `• [${f.kind}] ${f.detail}`),
    findings.length > 12 ? `…and ${findings.length - 12} more` : '',
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
