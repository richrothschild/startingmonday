#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { ESLint } from 'eslint'

const ROOT = process.cwd()
const DEFAULT_BASELINE_PATH = path.join(ROOT, 'config', 'explicit-any-baseline.json')

function normalizePath(input) {
  return input.replace(/\\/g, '/').replace(/^\.\//, '')
}

function parseArgs(argv) {
  const args = {
    baseRef: process.env.PR_BASE_SHA ?? '',
    headRef: 'HEAD',
    includePrefix: 'src/',
    baselinePath: DEFAULT_BASELINE_PATH,
  }

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg.startsWith('--base-ref=')) args.baseRef = arg.slice('--base-ref='.length)
    else if (arg.startsWith('--head-ref=')) args.headRef = arg.slice('--head-ref='.length)
    else if (arg.startsWith('--include-prefix=')) args.includePrefix = arg.slice('--include-prefix='.length)
    else if (arg.startsWith('--baseline=')) args.baselinePath = path.resolve(ROOT, arg.slice('--baseline='.length))
  }

  return args
}

function gitRefExists(ref) {
  if (!ref) return false
  try {
    execSync(`git rev-parse --verify --quiet ${ref}`, {
      stdio: ['ignore', 'ignore', 'ignore'],
    })
    return true
  } catch {
    return false
  }
}

function isAncestor(baseRef, headRef) {
  try {
    execSync(`git merge-base --is-ancestor ${baseRef} ${headRef}`, {
      stdio: ['ignore', 'ignore', 'ignore'],
    })
    return true
  } catch {
    return false
  }
}

function resolveDiffScope(baseRef, headRef) {
  if (!baseRef) {
    return { effectiveBaseRef: '', skipDiff: true, reason: 'no base ref provided' }
  }

  if (!gitRefExists(headRef)) {
    return { effectiveBaseRef: '', skipDiff: true, reason: `head ref not found: ${headRef}` }
  }

  if (!gitRefExists(baseRef)) {
    return { effectiveBaseRef: '', skipDiff: true, reason: `base ref not found: ${baseRef}` }
  }

  if (!isAncestor(baseRef, headRef)) {
    return {
      effectiveBaseRef: '',
      skipDiff: true,
      reason: `base ref is not an ancestor of head (${baseRef} !< ${headRef})`,
    }
  }

  return { effectiveBaseRef: baseRef, skipDiff: false, reason: '' }
}

function getChangedTypeScriptFiles(baseRef, headRef, includePrefix) {
  const range = baseRef ? `${baseRef}...${headRef}` : headRef
  const cmd = `git diff --name-only ${range} -- "*.ts" "*.tsx" "*.mts" "*.cts"`
  const output = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(normalizePath)
    .filter((filePath) => filePath.startsWith(includePrefix))
    .filter((filePath) => fs.existsSync(path.join(ROOT, filePath)))
}

function collectAnyViolations(results, fileSet = null) {
  const violations = []

  for (const result of results) {
    const filePath = normalizePath(path.relative(ROOT, result.filePath))
    if (fileSet && !fileSet.has(filePath)) continue

    for (const message of result.messages ?? []) {
      if (message.ruleId !== '@typescript-eslint/no-explicit-any') continue
      violations.push({
        filePath,
        line: message.line ?? 0,
        column: message.column ?? 0,
        message: message.message,
      })
    }
  }

  return violations
}

function readBaseline(baselinePath) {
  if (!fs.existsSync(baselinePath)) {
    throw new Error(`Missing explicit-any baseline file: ${baselinePath}`)
  }

  const parsed = JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
  const maxAnyCount = Number(parsed?.maxAnyCount)

  if (!Number.isFinite(maxAnyCount) || maxAnyCount < 0) {
    throw new Error(`Invalid maxAnyCount in baseline file: ${baselinePath}`)
  }

  return { maxAnyCount, raw: parsed }
}

async function main() {
  const { baseRef, headRef, includePrefix, baselinePath } = parseArgs(process.argv)
  const baseline = readBaseline(baselinePath)
  const diffScope = resolveDiffScope(baseRef, headRef)

  const eslint = new ESLint({
    cache: false,
    overrideConfig: {
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
      },
    },
  })

  const allResults = await eslint.lintFiles(['src/**/*.{ts,tsx,mts,cts}'])
  const totalAnyViolations = collectAnyViolations(allResults)

  let diffAnyViolations = []
  let changedFiles = []

  if (!diffScope.skipDiff) {
    changedFiles = getChangedTypeScriptFiles(diffScope.effectiveBaseRef, headRef, includePrefix)
    if (changedFiles.length > 0) {
      diffAnyViolations = collectAnyViolations(allResults, new Set(changedFiles))
    }
  }

  console.log('explicit-any gate summary')
  console.log(`- ceiling: ${baseline.maxAnyCount}`)
  console.log(`- current explicit-any count: ${totalAnyViolations.length}`)

  if (diffScope.skipDiff) {
    console.log(`- diff gate: skipped (${diffScope.reason})`)
  } else {
    console.log(`- changed files in scope: ${changedFiles.length}`)
    console.log(`- explicit-any violations in changed files: ${diffAnyViolations.length}`)
  }

  let failed = false

  if (totalAnyViolations.length > baseline.maxAnyCount) {
    failed = true
    console.error(
      `explicit-any ceiling exceeded: baseline=${baseline.maxAnyCount}, current=${totalAnyViolations.length}`,
    )
  }

  if (!diffScope.skipDiff && diffAnyViolations.length > 0) {
    failed = true
    console.error('New explicit-any violations detected in changed files:')
    for (const violation of diffAnyViolations.slice(0, 20)) {
      console.error(
        `  - ${violation.filePath}:${violation.line}:${violation.column} ${violation.message}`,
      )
    }
    if (diffAnyViolations.length > 20) {
      console.error(`  ... and ${diffAnyViolations.length - 20} more`) 
    }
  }

  if (failed) {
    process.exitCode = 1
    return
  }

  console.log('explicit-any gate passed')
}

main().catch((error) => {
  console.error('explicit-any gate failed:', error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
