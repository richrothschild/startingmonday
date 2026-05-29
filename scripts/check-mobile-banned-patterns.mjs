#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const targetDirs = [
  path.join(root, 'src', 'app'),
  path.join(root, 'src', 'components'),
]

const allowedExtensions = new Set(['.ts', '.tsx'])

const bannedPatterns = [
  {
    id: 'quick-navigation-label',
    description: 'Remove helper quick-navigation labels from mobile and public pages.',
    regex: />\s*Quick navigation\s*</gi,
  },
  {
    id: 'tldr-label',
    description: 'Remove TL;DR helper sections from page chrome.',
    regex: />\s*TL;DR\s*</gi,
  },
  {
    id: 'fit-check-helper-copy',
    description: 'Deprecated helper copy block should not render above core content.',
    regex: /Use the sections below to move from fit check to proof, then choose your next step\./gi,
  },
  {
    id: 'section-header-helper-copy',
    description: 'Deprecated helper copy should not render in content intros.',
    regex: /Use section headers below to jump to the part most relevant to your current search decision\./gi,
  },
  {
    id: 'legacy-clarity-heading',
    description: 'Legacy clarity heading replaced by "At a glance".',
    regex: />\s*Clear in 20 seconds\s*</gi,
  },
]

const violations = []

function walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
      continue
    }

    if (!allowedExtensions.has(path.extname(entry.name))) continue

    const relPath = path.relative(root, fullPath).replace(/\\/g, '/')
    const source = fs.readFileSync(fullPath, 'utf8')

    for (const pattern of bannedPatterns) {
      const matches = [...source.matchAll(pattern.regex)]
      if (matches.length === 0) continue

      for (const match of matches) {
        const index = match.index ?? 0
        const line = source.slice(0, index).split('\n').length
        violations.push({
          patternId: pattern.id,
          description: pattern.description,
          file: relPath,
          line,
          sample: String(match[0]).replace(/\s+/g, ' ').slice(0, 120),
        })
      }
    }
  }
}

for (const dir of targetDirs) {
  walk(dir)
}

if (violations.length > 0) {
  console.error('mobile banned-pattern check failed:')
  for (const v of violations) {
    console.error(` - [${v.patternId}] ${v.file}:${v.line} :: ${v.description}`)
    console.error(`   sample: ${v.sample}`)
  }
  process.exit(1)
}

console.log('mobile banned-pattern checks passed')
