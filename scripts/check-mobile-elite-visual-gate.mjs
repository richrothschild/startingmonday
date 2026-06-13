#!/usr/bin/env node
import { execSync } from 'child_process'

const cmd = [
  'npx playwright test tests/e2e/mobile-elite-visual.spec.ts',
  '--project=mobile-iphone',
  '--project=mobile-android',
  '--workers=1',
].join(' ')

if (process.env.CI) {
  console.log('mobile elite visual gate: ensuring Playwright chromium is installed')
  execSync('npx playwright install chromium', { stdio: 'inherit' })
}

console.log('mobile elite visual gate: running protected-route visual baselines')
execSync(cmd, { stdio: 'inherit' })
console.log('mobile elite visual gate: passed')
