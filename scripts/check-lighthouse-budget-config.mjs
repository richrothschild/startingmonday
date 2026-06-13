#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const configPath = path.join(root, '.lighthouserc.json')

if (!fs.existsSync(configPath)) {
  console.error('Lighthouse config is missing: .lighthouserc.json')
  process.exit(1)
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
const collect = config?.ci?.collect
const assertions = config?.ci?.assert?.assertions ?? {}

const failures = []

if (!Array.isArray(collect?.url) || collect.url.length < 3) {
  failures.push('ci.collect.url must include at least 3 routes for budget coverage')
}

const requiredCategoryBudgets = [
  'categories:performance',
  'categories:accessibility',
  'categories:best-practices',
  'categories:seo',
]

for (const key of requiredCategoryBudgets) {
  const rule = assertions[key]
  if (!Array.isArray(rule) || rule.length < 2 || typeof rule[1] !== 'object') {
    failures.push(`Missing assertion object for ${key}`)
    continue
  }

  const minScore = rule[1].minScore
  if (typeof minScore !== 'number') {
    failures.push(`${key} must define minScore`)
  }
}

const requiredNumericBudgets = [
  'largest-contentful-paint',
  'cumulative-layout-shift',
  'total-blocking-time',
]

for (const key of requiredNumericBudgets) {
  const rule = assertions[key]
  if (!Array.isArray(rule) || rule.length < 2 || typeof rule[1] !== 'object') {
    failures.push(`Missing assertion object for ${key}`)
    continue
  }

  if (typeof rule[1].maxNumericValue !== 'number') {
    failures.push(`${key} must define maxNumericValue`)
  }
}

if (failures.length > 0) {
  console.error('Lighthouse budget config gate failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('lighthouse budget config gate passed')
