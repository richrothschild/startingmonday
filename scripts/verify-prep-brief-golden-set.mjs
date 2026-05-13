#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const GOLDEN_SET_PATH = path.join(process.cwd(), 'src', 'evals', 'prep_brief_golden_set.json')
const PASS_TARGET = 25
const FAIL_TARGET = 25

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  return {
    strict: args.has('--strict'),
    json: args.has('--json'),
  }
}

function buildSummary(records) {
  const pass = records.filter((item) => item && item.pass === true).length
  const fail = records.filter((item) => item && item.pass === false).length
  const unknown = records.length - pass - fail
  const uniqueIds = new Set(records.map((item) => item?.id).filter(Boolean))

  const missingFields = records.reduce((acc, item, index) => {
    const missing = []
    if (!item || typeof item !== 'object') {
      missing.push('record')
    } else {
      if (!item.id) missing.push('id')
      if (item.output == null || item.output === '') missing.push('output')
      if (!('input' in item)) missing.push('input')
      if (typeof item.pass !== 'boolean') missing.push('pass')
      if (!Array.isArray(item.failure_categories)) missing.push('failure_categories')
    }
    if (missing.length > 0) {
      acc.push({ index, missing })
    }
    return acc
  }, [])

  const validBalance = pass >= PASS_TARGET && fail >= FAIL_TARGET
  const exactTargetBalance = pass === PASS_TARGET && fail === FAIL_TARGET

  return {
    total: records.length,
    pass,
    fail,
    unknown,
    uniqueIdCount: uniqueIds.size,
    duplicateIds: records.length - uniqueIds.size,
    missingFields,
    passTarget: PASS_TARGET,
    failTarget: FAIL_TARGET,
    validBalance,
    exactTargetBalance,
    ready: exactTargetBalance && missingFields.length === 0 && unknown === 0 && records.length === PASS_TARGET + FAIL_TARGET,
  }
}

async function main() {
  const { strict, json } = parseArgs(process.argv)

  const raw = await fs.readFile(GOLDEN_SET_PATH, 'utf8')
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`Invalid JSON in ${GOLDEN_SET_PATH}`)
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected an array in ${GOLDEN_SET_PATH}`)
  }

  const summary = buildSummary(parsed)

  if (json) {
    console.log(JSON.stringify(summary, null, 2))
    if (strict && !summary.ready) process.exit(1)
    return
  }

  console.log('Prep brief golden set verification')
  console.log('--------------------------------')
  console.log(`File: ${GOLDEN_SET_PATH}`)
  console.log(`Total: ${summary.total}`)
  console.log(`Pass: ${summary.pass}/${PASS_TARGET}`)
  console.log(`Fail: ${summary.fail}/${FAIL_TARGET}`)
  console.log(`Unknown pass flag: ${summary.unknown}`)
  console.log(`Duplicate ids: ${summary.duplicateIds}`)
  console.log(`Records missing required fields: ${summary.missingFields.length}`)

  if (summary.ready) {
    console.log('Status: READY')
  } else {
    console.log('Status: NOT READY')
  }

  if (summary.missingFields.length > 0) {
    const preview = summary.missingFields.slice(0, 3)
      .map((item) => `#${item.index} missing [${item.missing.join(', ')}]`)
      .join('; ')
    console.log(`Missing field examples: ${preview}`)
  }

  if (strict && !summary.ready) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
