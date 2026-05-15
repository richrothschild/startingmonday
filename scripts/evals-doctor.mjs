#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import dotenv from 'dotenv'

const ROOT = process.cwd()
dotenv.config({ path: path.join(ROOT, '.env.local') })

const REQUIRED_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
]

const REQUIRED_FILES = [
  'src/evals/prep_brief_rubric.md',
  'src/evals/prep_brief_golden_set.json',
  'scripts/check-prep-brief-label-progress.mjs',
  'scripts/export-prep-brief-golden-set.mjs',
  'scripts/verify-prep-brief-golden-set.mjs',
  'scripts/check-prep-brief-evals-readiness.mjs',
  'scripts/closeout-prep-brief-evals.mjs',
]

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  return {
    json: args.has('--json'),
    strict: args.has('--strict'),
  }
}

async function fileExists(relativePath) {
  try {
    await fs.access(path.join(ROOT, relativePath))
    return true
  } catch {
    return false
  }
}

async function main() {
  const { json, strict } = parseArgs(process.argv)

  const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name])
  const fileChecks = await Promise.all(REQUIRED_FILES.map(async (relativePath) => ({
    path: relativePath,
    exists: await fileExists(relativePath),
  })))

  const missingFiles = fileChecks.filter((item) => !item.exists).map((item) => item.path)
  const ok = missingEnv.length === 0 && missingFiles.length === 0

  const result = {
    ok,
    env: {
      required: REQUIRED_ENV,
      missing: missingEnv,
    },
    files: {
      required: REQUIRED_FILES,
      missing: missingFiles,
    },
  }

  if (json) {
    console.log(JSON.stringify(result, null, 2))
    if (strict && !ok) process.exitCode = 1
    return
  }

  console.log('Sprint 3 evals doctor')
  console.log('---------------------')
  console.log(`Env vars: ${missingEnv.length === 0 ? 'OK' : `missing ${missingEnv.join(', ')}`}`)
  console.log(`Files: ${missingFiles.length === 0 ? 'OK' : `missing ${missingFiles.join(', ')}`}`)
  console.log(`Status: ${ok ? 'READY' : 'NOT READY'}`)

  if (!ok) {
    console.log('Next: fix missing prerequisites before running eval/export commands.')
  }

  if (strict && !ok) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
