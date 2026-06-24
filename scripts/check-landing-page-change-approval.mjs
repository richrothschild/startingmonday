#!/usr/bin/env node

import { execSync } from 'node:child_process'

function getChangedFiles() {
  const baseRef = process.env.LANDING_GUARD_BASE_REF || 'origin/main'

  try {
    const output = execSync(`git diff --name-only ${baseRef}...HEAD`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  } catch {
    // Fallback when base ref is unavailable locally.
    const output = execSync('git diff --name-only HEAD~1..HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  }
}

const guardedFiles = new Set([
  'src/app/page.tsx',
  'src/components/LandingPage.tsx',
])

const changedFiles = getChangedFiles()
const changedGuarded = changedFiles.filter((file) => guardedFiles.has(file))

if (changedGuarded.length === 0) {
  console.log('landing-page-guard: pass (no guarded landing page changes detected)')
  process.exit(0)
}

const explicitApproval = process.env.ALLOW_LANDING_PAGE_CHANGE === 'true'

if (!explicitApproval) {
  console.error('landing-page-guard: blocked')
  console.error('Detected landing page changes:')
  for (const file of changedGuarded) {
    console.error(`  - ${file}`)
  }
  console.error('Set ALLOW_LANDING_PAGE_CHANGE=true only after explicit owner approval.')
  process.exit(1)
}

console.log('landing-page-guard: pass (explicit approval flag provided)')
