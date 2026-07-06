#!/usr/bin/env node

import { execSync } from 'node:child_process'

function currentBranch() {
  return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
}

const branch = currentBranch()
const allowMainPush = process.env.ALLOW_MAIN_PUSH === '1'

if (branch === 'main' && !allowMainPush) {
  console.error('Direct push to main is blocked by local policy.')
  console.error('Use staging -> PR/workflow promotion to main.')
  console.error('If this is an emergency, set ALLOW_MAIN_PUSH=1 for a single push.')
  process.exit(1)
}

console.log(`branch push policy: ${branch}`)
