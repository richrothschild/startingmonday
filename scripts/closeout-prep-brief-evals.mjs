#!/usr/bin/env node
import path from 'node:path'
import { spawn } from 'node:child_process'

const ROOT = process.cwd()

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  return {
    dryRun: args.has('--dry-run'),
    force: args.has('--force'),
  }
}

function runNodeScript(scriptPath, args = [], captureStdout = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: ROOT,
      stdio: captureStdout ? ['inherit', 'pipe', 'inherit'] : 'inherit',
    })

    let stdout = ''
    if (captureStdout && child.stdout) {
      child.stdout.on('data', (chunk) => {
        const text = String(chunk)
        stdout += text
        process.stdout.write(text)
      })
    }

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout)
      } else {
        reject(new Error(`${path.basename(scriptPath)} exited with code ${code ?? 'unknown'}`))
      }
    })
  })
}

function parseJsonFromOutput(output) {
  const withoutAnsi = output.replace(/\u001b\[[0-9;]*m/g, '')
  const trimmed = withoutAnsi.trim()
  if (!trimmed) {
    throw new Error('No JSON output received')
  }

  const lines = trimmed.split(/\r?\n/)
  const jsonStart = lines.findIndex((line) => line.trimStart().startsWith('{'))
  const candidate = jsonStart >= 0 ? lines.slice(jsonStart).join('\n').trim() : trimmed

  try {
    return JSON.parse(candidate)
  } catch {
    const start = candidate.indexOf('{')
    const end = candidate.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1))
    }
    throw new Error('Could not parse readiness JSON output')
  }
}

async function main() {
  const { dryRun, force } = parseArgs(process.argv)

  const readinessScript = path.join(ROOT, 'scripts', 'check-prep-brief-evals-readiness.mjs')
  const exportScript = path.join(ROOT, 'scripts', 'export-prep-brief-golden-set.mjs')
  const verifyScript = path.join(ROOT, 'scripts', 'verify-prep-brief-golden-set.mjs')

  console.log('Prep brief evals closeout')
  console.log('-------------------------')
  console.log('Step 1/3: checking readiness...')

  const readinessRaw = await runNodeScript(readinessScript, ['--json'], true)
  const readiness = parseJsonFromOutput(readinessRaw)

  if (!readiness?.overallReady && !force && !dryRun) {
    console.log('Closeout blocked: not ready yet (use --force to override).')
    process.exit(1)
  }

  if (dryRun) {
    if (!readiness?.overallReady) {
      console.log('Dry run note: readiness not met yet; closeout would be blocked without --force.')
    }
    console.log('Dry run complete.')
    console.log('Step 2/3 would run: export-prep-brief-golden-set.mjs')
    console.log('Step 3/3 would run: verify-prep-brief-golden-set.mjs --strict')
    return
  }

  console.log('Step 2/3: exporting golden set...')
  await runNodeScript(exportScript)

  console.log('Step 3/3: verifying golden set...')
  await runNodeScript(verifyScript, ['--strict'])

  console.log('Closeout complete: export + verify passed.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
