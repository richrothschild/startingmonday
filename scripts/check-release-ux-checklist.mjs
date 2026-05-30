#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const checklistPath = path.join(root, 'docs', 'release-ux-signoff-checklist.md')

const requiredSnippets = [
  '## Auth and Entry Flows',
  '## Interaction Quality',
  '## Visual Quality',
  '## Content and Information Architecture',
  '## Release Gate Evidence',
  'Auth UX Playwright suite passed',
  'Reviewer screenshot evidence attached',
]

if (!fs.existsSync(checklistPath)) {
  console.error('Release UX checklist is missing: docs/release-ux-signoff-checklist.md')
  process.exit(1)
}

const content = fs.readFileSync(checklistPath, 'utf8')
const missing = requiredSnippets.filter((snippet) => !content.includes(snippet))

if (missing.length > 0) {
  console.error('Release UX checklist is incomplete. Missing required sections/snippets:')
  for (const snippet of missing) console.error(` - ${snippet}`)
  process.exit(1)
}

console.log('release ux checklist policy check passed')