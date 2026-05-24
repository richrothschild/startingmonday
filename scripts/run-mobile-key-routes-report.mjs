#!/usr/bin/env node
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const reportDir = 'playwright-report'
const jsonPath = path.join(reportDir, 'mobile-key-routes.json')
const mdPath = path.join(reportDir, 'mobile-key-routes-coverage.md')

fs.mkdirSync(reportDir, { recursive: true })

execSync(
  `npx playwright test tests/e2e/mobile-key-routes.spec.ts --project=mobile-iphone --project=mobile-android --project=mobile-tablet --reporter=json > "${jsonPath}"`,
  {
    stdio: 'inherit',
    shell: true,
  },
)

if (!fs.existsSync(jsonPath)) {
  console.error(`Playwright did not produce JSON output at ${jsonPath}`)
  process.exit(1)
}

execSync(`node scripts/generate-mobile-route-coverage-report.mjs "${jsonPath}" "${mdPath}"`, { stdio: 'inherit' })
