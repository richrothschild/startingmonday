#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'docs', 'performance-audit')
const BASE_URL = process.env.MONITOR_BASE_URL ?? 'https://startingmonday.app'
const NODE = process.execPath

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/')
}

function runNodeScript(scriptRelPath, args = [], extraEnv = {}) {
  const scriptAbsPath = path.join(ROOT, scriptRelPath)
  const run = spawnSync(NODE, [scriptAbsPath, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env: {
      ...process.env,
      MONITOR_BASE_URL: BASE_URL,
      ...extraEnv,
    },
  })

  const stdout = (run.stdout ?? '').trim()
  const stderr = (run.stderr ?? '').trim()
  const status = run.status ?? 1

  if (status !== 0) {
    const details = [stdout, stderr].filter(Boolean).join('\n')
    throw new Error(`Command failed: node ${scriptRelPath} ${args.join(' ')}\n${details}`)
  }

  return { stdout, stderr }
}

function parseJsonOutput(raw) {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start < 0 || end < start) {
    throw new Error('Expected JSON output but could not locate JSON object')
  }
  return JSON.parse(raw.slice(start, end + 1))
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function summarize(mobile, smoke) {
  return {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    smoke: {
      total: smoke.total,
      passed: smoke.passed,
      failed: smoke.failed,
      criticalFailed: smoke.criticalFailed,
      advisoryFailed: smoke.advisoryFailed,
    },
    mobile: {
      total: mobile.total,
      passed: mobile.passed,
      failed: mobile.failed,
      passRate: mobile.passRate,
      p95ResponseMs: mobile.p95ResponseMs,
      ok: mobile.ok,
    },
  }
}

function main() {
  const smokeOutPath = path.join(OUT_DIR, 'production-smoke.latest.json')
  const mobileOutPath = path.join(OUT_DIR, 'production-mobile.latest.json')
  const summaryOutPath = path.join(OUT_DIR, 'summary.latest.json')

  const smokeRaw = runNodeScript('scripts/production-smoke-check.mjs', ['--json']).stdout
  const mobileRaw = runNodeScript('scripts/check-mobile-production-thresholds.mjs', ['--json']).stdout

  const smoke = parseJsonOutput(smokeRaw)
  const mobile = parseJsonOutput(mobileRaw)
  const summary = summarize(mobile, smoke)

  writeJson(smokeOutPath, smoke)
  writeJson(mobileOutPath, mobile)
  writeJson(summaryOutPath, summary)

  console.log('Performance audit pack run complete.')
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Smoke: ${summary.smoke.passed}/${summary.smoke.total} passed (critical failed ${summary.smoke.criticalFailed})`)
  console.log(`Mobile: ${summary.mobile.passed}/${summary.mobile.total} passed, p95 ${summary.mobile.p95ResponseMs}ms, passRate ${(summary.mobile.passRate * 100).toFixed(1)}%`)
  console.log(`Artifacts:`)
  console.log(`- ${rel(smokeOutPath)}`)
  console.log(`- ${rel(mobileOutPath)}`)
  console.log(`- ${rel(summaryOutPath)}`)
}

main()
