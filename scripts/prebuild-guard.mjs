#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const srcDir = path.join(root, 'src')
const EM_DASH = '\u2014'

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

console.log('prebuild guard passed')
