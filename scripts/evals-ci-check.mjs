#!/usr/bin/env node
import path from 'node:path'
import { spawn } from 'node:child_process'

const ROOT = process.cwd()

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  return {
    json: args.has('--json'),
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
        stdout += String(chunk)
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
  return JSON.parse(candidate)
}

async function main() {
  const { json } = parseArgs(process.argv)
  const doctorScript = path.join(ROOT, 'scripts', 'evals-doctor.mjs')
  const readinessScript = path.join(ROOT, 'scripts', 'check-prep-brief-evals-readiness.mjs')

  if (json) {
    const [doctorRaw, readinessRaw] = await Promise.all([
      runNodeScript(doctorScript, ['--json'], true),
      runNodeScript(readinessScript, ['--json'], true),
    ])

    const doctor = parseJsonFromOutput(doctorRaw)
    const readiness = parseJsonFromOutput(readinessRaw)
    const ok = Boolean(doctor?.ok) && Boolean(readiness?.overallReady)
    console.log(JSON.stringify({
      generatedAt: new Date().toISOString(),
      ok,
      doctor,
      readiness,
    }, null, 2))
    if (!ok) {
      process.exitCode = 1
    }
    return
  }

  console.log('Sprint 3 evals CI check')
  console.log('-----------------------')
  console.log('Step 1/2: prerequisites')
  await runNodeScript(doctorScript, ['--strict'])

  console.log('Step 2/2: readiness')
  await runNodeScript(readinessScript, ['--summary', '--strict'])

  console.log('CI check passed.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
