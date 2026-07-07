#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

function parseArgs(argv) {
  const out = {
    batchPath: path.join(ROOT, 'tmp', 'placeholder-batch.current.json'),
    promptPath: path.join(ROOT, 'tmp', 'placeholder-batch.prompt.txt'),
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = argv[i + 1]
    if (arg === '--batch' && next) {
      out.batchPath = path.resolve(ROOT, next)
      i += 1
      continue
    }
    if (arg === '--prompt' && next) {
      out.promptPath = path.resolve(ROOT, next)
      i += 1
      continue
    }
  }

  return out
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const batch = JSON.parse(fs.readFileSync(args.batchPath, 'utf8'))
  const selected = Array.isArray(batch.selected) ? batch.selected : []
  const routeFiles = Array.isArray(batch.selectedRouteFiles) ? batch.selectedRouteFiles : []

  const listTests = selected.map((file) => `- ${file}`).join('\n')
  const listRoutes = routeFiles.map((file) => `- ${file}`).join('\n')

  const prompt = [
    'You are editing a Next.js TypeScript repository.',
    'Task: replace placeholder tests with real behavior tests for ONLY the selected files.',
    '',
    'Hard constraints:',
    '- Edit only these selected test files.',
    '- Do not edit production route files.',
    '- Remove placeholder patterns from selected files:',
    "  - 'placeholder coverage'",
    "  - 'marks module as covered for council traceability'",
    "  - 'expect(true).toBe(true)'",
    '- Prefer 2-4 focused tests per file: auth/guard failure, validation failure (if relevant), and one success path.',
    '- Match each route\'s actual Supabase/mock chain shape.',
    '- Keep tests deterministic and fast.',
    '',
    'Selected test files:',
    listTests || '- (none)',
    '',
    'Reference route files (read-only):',
    listRoutes || '- (none)',
    '',
    'After edits, stop. Do not run commands.',
  ].join('\n')

  fs.mkdirSync(path.dirname(args.promptPath), { recursive: true })
  fs.writeFileSync(args.promptPath, `${prompt}\n`, 'utf8')
  console.log(path.relative(ROOT, args.promptPath).replace(/\\/g, '/'))
}

main()
