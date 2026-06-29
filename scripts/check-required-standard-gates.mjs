#!/usr/bin/env node
import { spawnSync } from 'node:child_process'

const argv = process.argv.slice(2)
const envArg = argv.find((arg) => arg.startsWith('--env='))
const envName = (envArg ? envArg.split('=')[1] : process.env.REQUIRED_GATE_ENV ?? 'dev').toLowerCase()
const outputJson = argv.includes('--json')

const ENVIRONMENTS = new Set(['dev', 'staging', 'production'])
if (!ENVIRONMENTS.has(envName)) {
  console.error(`Invalid --env value: ${envName}. Expected one of: dev, staging, production`)
  process.exit(1)
}

const DEFAULT_STAGING_BASE_URL = 'https://starting-monday-staging.up.railway.app'
const DEFAULT_PRODUCTION_BASE_URL = 'https://startingmonday.app'

function runGate({ label, command, args = [], extraEnv = {} }) {
  const startedAt = Date.now()
  const child = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
    env: {
      ...process.env,
      ...extraEnv,
    },
  })

  const durationMs = Date.now() - startedAt
  const ok = child.status === 0

  return {
    label,
    command: [command, ...args].join(' '),
    ok,
    exitCode: child.status ?? 1,
    durationMs,
  }
}

function gatesForEnvironment(targetEnv) {
  const baseStaticGates = [
    {
      label: 'Landing standard strict',
      command: 'node',
      args: [
        'scripts/check-landing-standard-all-pages.mjs',
        '--strict',
        '--output-json=tmp/site-style-audit.json',
        '--output-md=tmp/site-style-audit.md',
      ],
    },
    {
      label: 'Luxury static public-all',
      command: 'node',
      args: ['scripts/check-luxury-ux-static-gate.mjs', '--enforce-tier=public-all'],
    },
  ]

  if (targetEnv === 'dev') return baseStaticGates

  const baseUrl =
    process.env.REQUIRED_GATE_BASE_URL ??
    process.env.MONITOR_BASE_URL ??
    (targetEnv === 'staging' ? DEFAULT_STAGING_BASE_URL : DEFAULT_PRODUCTION_BASE_URL)

  const remoteGates = [
    {
      label: 'Features docs runtime integrity',
      command: 'node',
      args: ['scripts/check-features-docs-runtime.mjs', '--json'],
      extraEnv: {
        MONITOR_BASE_URL: baseUrl,
      },
    },
    {
      label: 'Smoke monitor',
      command: 'node',
      args: ['scripts/production-smoke-check.mjs', '--json'],
      extraEnv: {
        MONITOR_BASE_URL: baseUrl,
        MONITOR_OUTPUT_JSON: '1',
      },
    },
    {
      label: 'Mobile reliability thresholds',
      command: 'node',
      args: ['scripts/check-mobile-production-thresholds.mjs', '--json'],
      extraEnv: {
        MONITOR_BASE_URL: baseUrl,
        MONITOR_OUTPUT_JSON: '1',
      },
    },
  ]

  return [...baseStaticGates, ...remoteGates]
}

const selectedGates = gatesForEnvironment(envName)
const results = []

console.log(`Required standards gates: ${envName}`)
for (const gate of selectedGates) {
  console.log(`\nRunning: ${gate.label}`)
  const result = runGate(gate)
  results.push(result)
}

const failed = results.filter((result) => !result.ok)
const summary = {
  ts: new Date().toISOString(),
  environment: envName,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.length,
  results,
}

if (outputJson) {
  console.log(JSON.stringify(summary, null, 2))
} else {
  console.log('\nRequired standards gate summary')
  console.log(`Environment: ${summary.environment}`)
  console.log(`Passed: ${summary.passed}/${summary.total}`)
  for (const result of results) {
    const icon = result.ok ? 'OK' : 'FAIL'
    console.log(`${icon} ${result.label} (${result.durationMs}ms)`)
  }
}

if (failed.length > 0) {
  process.exitCode = 1
}
