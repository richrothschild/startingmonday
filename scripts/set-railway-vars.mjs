// Reads .env.local and sets each non-empty var on the linked Railway service.
// Run from the worker/ directory: node ../scripts/set-railway-vars.mjs
// Requires: railway CLI logged in and project linked (railway init already done).

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const dir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(dir, '../.env.local')

const WORKER_VARS = new Set([
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY',
  'RESEND_API_KEY',
  'RESEND_FROM_ADDRESS',
  'BROWSERLESS_API_KEY',
  'SENTRY_DSN',
])

const lines = readFileSync(envPath, 'utf8').split('\n')
const pairs = []

for (const line of lines) {
  if (!line || line.startsWith('#')) continue
  const eqIdx = line.indexOf('=')
  if (eqIdx === -1) continue
  const key = line.slice(0, eqIdx).trim()
  const val = line.slice(eqIdx + 1).trim()
  if (!WORKER_VARS.has(key) || !val) continue
  pairs.push([key, val])
}

if (!pairs.length) {
  console.error('No vars to set — check that .env.local has values for the worker keys.')
  process.exit(1)
}

console.log(`Setting ${pairs.length} variable(s) on Railway...\n`)

for (const [key, val] of pairs) {
  try {
    execSync(`railway variables --set "${key}=${val}"`, {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: resolve(dir, '../worker'),
    })
    console.log(`  ✓ ${key}`)
  } catch (err) {
    console.error(`  ✗ ${key}: ${err.stderr?.toString().trim() || err.message}`)
  }
}

console.log('\nDone. Run: cd worker && railway up --detach')
