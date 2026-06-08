#!/usr/bin/env node

import { readFileSync } from 'node:fs'

const GENERATED_GUIDE_FILES = new Set([
  'docs/user-guide.md',
  'docs/user-guide.index.json',
  'docs/user-guide.manifest.json',
  'docs/internal-guide.md',
  'docs/internal-guide.index.json',
  'docs/internal-guide.manifest.json',
  'docs/internal-system-summary.md',
])

function matchesGuideInput(filePath) {
  if (GENERATED_GUIDE_FILES.has(filePath)) return false
  if (filePath === 'src/lib/blog-posts.ts') return true
  if (filePath === 'docs/automation-guide.md') return true
  return (
    filePath.startsWith('src/app/') ||
    filePath.startsWith('src/lib/') ||
    filePath.startsWith('scripts/') ||
    filePath.startsWith('docs/') ||
    filePath.startsWith('.github/workflows/') ||
    filePath.startsWith('supabase/migrations/')
  )
}

function main() {
  const input = readFileSync(0, 'utf8')
  const changedFiles = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const shouldRun = changedFiles.some(matchesGuideInput)
  process.stdout.write(shouldRun ? 'yes\n' : 'no\n')
}

main()