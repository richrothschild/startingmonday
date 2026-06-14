#!/usr/bin/env node

import { execSync, spawnSync } from 'node:child_process'

const GENERATED_GUIDE_FILES = [
  'docs/user-guide.md',
  'docs/user-guide.index.json',
  'docs/user-guide.manifest.json',
  'docs/internal-guide.md',
  'docs/internal-guide.index.json',
  'docs/internal-guide.manifest.json',
  'docs/internal-system-summary.md',
]

function run(cmd, args) {
  const command = [cmd, ...args]
    .map((part) => (part.includes(' ') ? `"${part}"` : part))
    .join(' ')

  execSync(command, {
    stdio: 'inherit',
  })
}

function getStagedFiles() {
  const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function needsGuideRefresh(stagedFiles) {
  if (stagedFiles.length === 0) return false

  const probe = spawnSync('node', ['scripts/guide-freshness-needed.mjs'], {
    input: `${stagedFiles.join('\n')}\n`,
    encoding: 'utf8',
    shell: false,
    stdio: ['pipe', 'pipe', 'inherit'],
  })

  if (probe.status !== 0) {
    process.exit(probe.status ?? 1)
  }

  return probe.stdout.trim() === 'yes'
}

function main() {
  const stagedFiles = getStagedFiles()
  if (!needsGuideRefresh(stagedFiles)) {
    console.log('guide freshness pre-commit... skipped (no guide inputs staged)')
    return
  }

  console.log('guide freshness pre-commit... syncing generated guide artifacts')
  run('npm', ['run', 'guide:user:sync'])
  run('npm', ['run', 'guide:internal:sync'])

  console.log('guide freshness pre-commit... staging guide artifacts')
  run('git', ['add', ...GENERATED_GUIDE_FILES])

  console.log('guide freshness pre-commit... ok')
}

main()
