#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const srcDir = path.join(root, 'src')
const EM_DASH = '\u2014'
const guideArtifacts = [
  'docs/user-guide.index.json',
  'docs/internal-guide.index.json',
]

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

const rubricCheck = spawnSync(
  process.execPath,
  [path.join(root, 'scripts/check-ux-ui-rubric-pages.mjs')],
  { stdio: 'inherit' }
)

if (rubricCheck.status !== 0) {
  console.error('Error: UX/UI rubric page checks failed')
  process.exitCode = 1
}

for (const relativePath of guideArtifacts) {
  const fullPath = path.join(root, relativePath)
  if (!fs.existsSync(fullPath)) {
    console.error(`Error: required guide artifact is missing: ${relativePath}`)
    process.exitCode = 1
    continue
  }

  try {
    const raw = fs.readFileSync(fullPath, 'utf8')
    const parsed = JSON.parse(raw)
    const entries = Array.isArray(parsed?.entries) ? parsed.entries : []
    if (entries.length === 0) {
      console.error(`Error: guide artifact has no entries: ${relativePath}`)
      process.exitCode = 1
    }
  } catch (error) {
    console.error(`Error: guide artifact is invalid JSON: ${relativePath}`)
    if (error instanceof Error) console.error(error.message)
    process.exitCode = 1
  }
}

if (!process.exitCode) {
  console.log('prebuild guard passed')
}
