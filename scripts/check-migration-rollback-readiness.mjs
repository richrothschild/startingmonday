#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const MIGRATIONS_DIR = path.join(ROOT, 'supabase', 'migrations')
const PLAYBOOKS_DIR = path.join(ROOT, 'docs', 'development', 'migration-rollbacks')
const DEFAULT_WINDOW = Number(process.env.ROLLBACK_MIGRATION_WINDOW ?? 20)

const RISK_PATTERNS = [
  /\bDROP\s+TABLE\b/im,
  /\bDROP\s+COLUMN\b/im,
  /\bALTER\s+TABLE\b[\s\S]*?\bDROP\b/im,
  /\bALTER\s+TABLE\b[\s\S]*?\bRENAME\b/im,
  /\bDROP\s+POLICY\b/im,
  /\bDROP\s+FUNCTION\b/im,
  /\bDROP\s+TYPE\b/im,
]

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  return {
    strict: args.has('--strict'),
    json: args.has('--json'),
  }
}

function isSqlMigration(name) {
  return /^\d+_.+\.sql$/i.test(name)
}

function toPlaybookPath(migrationName) {
  return path.join(PLAYBOOKS_DIR, migrationName.replace(/\.sql$/i, '.md'))
}

function hasRisk(content) {
  return RISK_PATTERNS.some((pattern) => pattern.test(content))
}

async function readRecentMigrations() {
  const entries = await fs.readdir(MIGRATIONS_DIR, { withFileTypes: true })
  const migrations = entries
    .filter((entry) => entry.isFile() && isSqlMigration(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'en'))

  return migrations.slice(-DEFAULT_WINDOW)
}

async function audit() {
  const recent = await readRecentMigrations()

  const risky = []
  for (const migration of recent) {
    const migrationPath = path.join(MIGRATIONS_DIR, migration)
    const content = await fs.readFile(migrationPath, 'utf8')
    if (!hasRisk(content)) continue

    const playbookPath = toPlaybookPath(migration)
    let playbookExists = false
    try {
      await fs.access(playbookPath)
      playbookExists = true
    } catch {
      playbookExists = false
    }

    risky.push({
      migration,
      playbookPath: path.relative(ROOT, playbookPath).split(path.sep).join('/'),
      playbookExists,
    })
  }

  const missing = risky.filter((item) => !item.playbookExists)
  return {
    generatedAt: new Date().toISOString(),
    windowSize: DEFAULT_WINDOW,
    recentMigrationsScanned: recent.length,
    riskyMigrationsScanned: risky.length,
    missingPlaybooks: missing.length,
    risky,
    missing,
  }
}

function printHuman(result) {
  console.log('Migration rollback readiness')
  console.log('----------------------------')
  console.log(`Window size: ${result.windowSize}`)
  console.log(`Recent migrations scanned: ${result.recentMigrationsScanned}`)
  console.log(`Risky migrations scanned: ${result.riskyMigrationsScanned}`)
  console.log(`Missing rollback playbooks: ${result.missingPlaybooks}`)

  if (result.missing.length > 0) {
    console.log('')
    console.log('Missing rollback playbooks:')
    for (const item of result.missing) {
      console.log(`- ${item.migration} -> ${item.playbookPath}`)
    }
  }
}

async function main() {
  const { strict, json } = parseArgs(process.argv)
  const result = await audit()

  if (json) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    printHuman(result)
  }

  if (strict && result.missingPlaybooks > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
