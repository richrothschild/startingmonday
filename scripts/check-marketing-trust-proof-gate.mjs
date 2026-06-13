#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const checks = [
  {
    file: 'src/components/LandingPage.tsx',
    allOf: ['Source:', 'pilot cohorts'],
  },
  {
    file: 'src/app/pricing/page.tsx',
    allOf: ['Source note', 'Privacy commitments'],
  },
  {
    file: 'src/app/method-and-evidence/page.tsx',
    allOf: ['Source note', 'Source citations'],
  },
  {
    file: 'src/app/evidence-room/page.tsx',
    allOf: ['Source notes and methodology', 'Source:'],
  },
  {
    file: 'src/app/concierge/concierge-waitlist.tsx',
    allOf: ['Trust and source note', 'Confidential intake details'],
  },
  {
    file: 'src/app/demo/page.tsx',
    allOf: ['Source note', 'pilot cohorts'],
  },
]

const failures = []

for (const check of checks) {
  const filePath = path.join(root, check.file)
  if (!fs.existsSync(filePath)) {
    failures.push(`${check.file}: file is missing`)
    continue
  }

  const content = fs.readFileSync(filePath, 'utf8')
  const missing = check.allOf.filter((needle) => !content.includes(needle))
  if (missing.length > 0) {
    failures.push(`${check.file}: missing required trust/proof markers: ${missing.join(', ')}`)
  }
}

if (failures.length > 0) {
  console.error('Marketing trust/proof placement gate failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log(`marketing trust/proof placement gate passed (${checks.length} routes/components checked).`)
