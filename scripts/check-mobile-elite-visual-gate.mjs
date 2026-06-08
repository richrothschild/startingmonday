#!/usr/bin/env node
import { execSync } from 'child_process'

const cmd = [
  'npx playwright test tests/e2e/mobile-elite-visual.spec.ts',
  '--project=mobile-iphone',
  '--project=mobile-android',
  '--workers=1',
].join(' ')

console.log('mobile elite visual gate: running protected-route visual baselines')
execSync(cmd, { stdio: 'inherit' })
console.log('mobile elite visual gate: passed')
