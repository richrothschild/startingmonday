#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const srcDir = path.join(root, 'src')
const EM_DASH = '\u2014'
const isRailwayBuild = Boolean(process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PROJECT_ID)
const allowedExtensions = new Set(['.ts'])
const filesWithEmDash = []

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
      continue
    }

    if (!allowedExtensions.has(path.extname(entry.name))) continue

    const contents = fs.readFileSync(fullPath, 'utf8')
    if (contents.includes(EM_DASH)) {
      filesWithEmDash.push(path.relative(root, fullPath).replace(/\\/g, '/'))
    }
  }
}

if (fs.existsSync(srcDir)) {
  walk(srcDir)
}

if (filesWithEmDash.length > 0) {
  console.error('Error: em dash found in source files (use a hyphen or unicode escape):')
  for (const file of filesWithEmDash) {
    console.error(` - ${file}`)
  }
  process.exitCode = 1
}

if (isRailwayBuild) {
  console.log('prebuild guard: skipping homepage rubric/copy drift checks on Railway build')
} else {
  const rubricCheck = spawnSync(
    process.execPath,
    [path.join(root, 'scripts/check-ux-ui-rubric-pages.mjs')],
    { stdio: 'inherit' }
  )

  if (rubricCheck.status !== 0) {
    console.error('Error: UX/UI rubric page checks failed')
    process.exitCode = 1
  }

  const copyCtaDriftCheck = spawnSync(
    process.execPath,
    [path.join(root, 'scripts/check-key-funnel-copy-cta-drift.mjs')],
    { stdio: 'inherit' }
  )

  if (copyCtaDriftCheck.status !== 0) {
    console.error('Error: key funnel copy/CTA drift checks failed')
    process.exitCode = 1
  }
}

const visualDarknessCheck = spawnSync(
  process.execPath,
  [path.join(root, 'scripts/check-key-funnel-visual-darkness-gate.mjs')],
  { stdio: 'inherit' }
)

if (visualDarknessCheck.status !== 0) {
  console.error('Error: key funnel visual darkness checks failed')
  process.exitCode = 1
}

const publicAssetCheck = spawnSync(
  process.execPath,
  [path.join(root, 'scripts/check-public-asset-tracking.mjs')],
  { stdio: 'inherit' }
)

if (publicAssetCheck.status !== 0) {
  console.error('Error: public asset tracking checks failed')
  process.exitCode = 1
}

if (process.env.MOBILE_ELITE_GATE_STRICT === '1') {
  const eliteMobileCheck = spawnSync(
    process.execPath,
    [path.join(root, 'scripts/check-mobile-elite-visual-gate.mjs')],
    { stdio: 'inherit' }
  )

  if (eliteMobileCheck.status !== 0) {
    console.error('Error: elite mobile visual gate failed')
    process.exitCode = 1
  }
}

if (!process.exitCode) {
  console.log('prebuild guard passed')
}
