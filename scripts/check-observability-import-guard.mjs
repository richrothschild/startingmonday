#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SOURCE_DIRS = ['src', 'scripts', 'worker', 'tests']
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs'])
const IGNORE_DIRS = new Set(['node_modules', '.next', '.git', 'playwright-report', 'test-results', 'public', 'docs'])

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const out = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue
      out.push(...walk(full))
      continue
    }
    if (!entry.isFile()) continue
    const ext = path.extname(entry.name)
    if (!EXTENSIONS.has(ext)) continue
    out.push(full)
  }
  return out
}

function rel(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/')
}

function findImportCorruption(source) {
  return /import\s*\{[\s\S]{0,240}\bconst\s+__councilObservabilitySignal\b[\s\S]{0,240}\}\s+from\s+['"]/m.test(source)
}

function main() {
  const files = SOURCE_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)))
  const invalid = []

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8')
    if (findImportCorruption(source)) {
      invalid.push(rel(file))
    }
  }

  if (invalid.length > 0) {
    console.error('Observability import guard failed. Found injected constants inside import blocks:')
    for (const file of invalid) {
      console.error(`- ${file}`)
    }
    process.exitCode = 1
    return
  }

  console.log(`Observability import guard passed (${files.length} files scanned).`)
}

main()
