#!/usr/bin/env node
import { execSync } from 'child_process'

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}

function hasMobileUiChanges(stagedFiles) {
  return stagedFiles.some((file) =>
    file.startsWith('src/app/(dashboard)/dashboard/') ||
    file === 'src/components/BottomNav.tsx' ||
    file === 'src/app/globals.css' ||
    file.startsWith('src/components/')
  )
}

const staged = sh('git diff --cached --name-only')
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)

if (!hasMobileUiChanges(staged)) {
  console.log('mobile-ui gate: no relevant staged files, skipping')
  process.exit(0)
}

console.log('mobile-ui gate: relevant staged files detected')
for (const f of staged) {
  if (f.startsWith('src/app/(dashboard)/dashboard/') || f === 'src/components/BottomNav.tsx' || f === 'src/app/globals.css') {
    console.log(` - ${f}`)
  }
}

console.log('mobile-ui gate: running local mobile UI contract checks')
execSync('node scripts/check-mobile-ui-contract.mjs', {
  stdio: 'inherit',
})

if (process.env.MOBILE_UI_GATE_E2E === '1') {
  console.log('mobile-ui gate: running optional Playwright quick rubric smoke')
  execSync('npx playwright test tests/e2e/mobile-ui.spec.ts --project=mobile-iphone --grep @rubric --workers=1', {
    stdio: 'inherit',
  })

  if (process.env.MOBILE_ELITE_VISUAL_GATE === '1') {
    console.log('mobile-ui gate: running elite mobile visual protected-route gate')
    execSync('node scripts/check-mobile-elite-visual-gate.mjs', {
      stdio: 'inherit',
    })
  } else {
    console.log('mobile-ui gate: skipping elite visual gate (set MOBILE_ELITE_VISUAL_GATE=1 to enable)')
  }
} else {
  console.log('mobile-ui gate: skipping Playwright quick smoke (set MOBILE_UI_GATE_E2E=1 to enable)')
}

console.log('mobile-ui gate: passed')
