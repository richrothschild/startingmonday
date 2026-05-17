#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const asJson = process.argv.includes('--json')
const strict = process.argv.includes('--strict')

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8')
}

function has(relPath, pattern) {
  try {
    const text = read(relPath)
    return pattern.test(text)
  } catch {
    return false
  }
}

const checks = [
  {
    id: 's1-artifacts',
    label: 'Playwright captures screenshots/videos on failure',
    pass: has('playwright.config.ts', /screenshot:\s*'only-on-failure'/) && has('playwright.config.ts', /video:\s*'retain-on-failure'/),
  },
  {
    id: 's1-synthetic-public-auth',
    label: 'Site monitoring synthetic tests include public and auth journeys',
    pass:
      has('tests/e2e/site-monitoring.spec.ts', /public journey renders cleanly/) &&
      has('tests/e2e/site-monitoring.spec.ts', /authenticated monitoring journeys/) &&
      has('tests/e2e/site-monitoring.spec.ts', /\/dashboard\/briefing/) &&
      has('tests/e2e/site-monitoring.spec.ts', /\/dashboard\/outreach/),
  },
  {
    id: 's2-freshness',
    label: 'Monitoring assertions include freshness/empty-state checks',
    pass:
      has('tests/e2e/site-monitoring.spec.ts', /Nothing to brief today\./) &&
      has('tests/e2e/site-monitoring.spec.ts', /No prospects match this channel, confidence, and status filter\./),
  },
  {
    id: 's3-production-monitoring',
    label: 'Scheduled production monitoring with artifact summary exists',
    pass:
      has('.github/workflows/monitoring.yml', /cron:\s*'\*\/30 \* \* \* \*'/) &&
      has('.github/workflows/monitoring.yml', /monitoring-summary\.json/) &&
      has('.github/workflows/monitoring.yml', /Upload monitoring summary artifact/),
  },
  {
    id: 's4-ci-gate',
    label: 'Playwright in CI runs on main and staging as release gate',
    pass:
      has('.github/workflows/ci.yml', /if:\s*github\.ref == 'refs\/heads\/staging' \|\| github\.ref == 'refs\/heads\/main'/) &&
      !has('.github/workflows/ci.yml', /continue-on-error:\s*\$\{\{\s*github\.ref == 'refs\/heads\/main'\s*\}\}/),
  },
  {
    id: 's5-dashboard-runbook',
    label: 'Operational dashboard and incident runbook docs exist',
    pass:
      fs.existsSync(path.join(root, 'docs/site-monitoring-dashboard.md')) &&
      fs.existsSync(path.join(root, 'docs/site-monitoring-runbook.md')),
  },
]

const passed = checks.filter((c) => c.pass)
const failed = checks.filter((c) => !c.pass)

const summary = {
  total: checks.length,
  passed: passed.length,
  failed: failed.length,
  checks: checks.map((c) => ({ id: c.id, label: c.label, pass: c.pass })),
}

if (asJson) {
  console.log(JSON.stringify(summary, null, 2))
} else {
  console.log(`Site monitoring readiness: ${summary.passed}/${summary.total} checks passed`)
  for (const check of checks) {
    console.log(`${check.pass ? 'OK' : 'FAIL'} ${check.label}`)
  }
}

if (strict && failed.length > 0) {
  process.exit(1)
}
