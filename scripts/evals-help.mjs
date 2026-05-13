#!/usr/bin/env node
import path from 'node:path'
import { spawn } from 'node:child_process'

const ROOT = process.cwd()

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  return {
    status: args.has('--status'),
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
        const text = String(chunk)
        stdout += text
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
  const { status, json } = parseArgs(process.argv)

  const commands = {
    labelProgress: [
      'npm run evals:label-progress',
      'npm run evals:label-progress:strict',
    ],
    goldenSet: [
      'npm run evals:export-golden-set',
      'npm run evals:verify-golden-set',
      'npm run evals:verify-golden-set:strict',
    ],
    readiness: [
      'npm run evals:readiness',
      'npm run evals:readiness:strict',
      'npm run evals:readiness:md',
      'npm run evals:readiness:summary',
      'npm run evals:readiness:summary:strict',
      'npm run evals:readiness:snapshot',
      'npm run evals:readiness:snapshot:json',
    ],
    closeout: [
      'npm run evals:closeout',
      'npm run evals:closeout:dry-run',
      'npm run evals:closeout:force',
      'npm run evals:closeout:json',
    ],
    prerequisites: [
      'npm run evals:doctor',
      'npm run evals:doctor:strict',
    ],
    ci: [
      'npm run evals:ci:check',
      'npm run evals:ci:check:json',
    ],
  }

  let doctor = null
  let readiness = null
  if (status && json) {
    const doctorScript = path.join(ROOT, 'scripts', 'evals-doctor.mjs')
    const readinessScript = path.join(ROOT, 'scripts', 'check-prep-brief-evals-readiness.mjs')
    const [doctorRaw, readinessRaw] = await Promise.all([
      runNodeScript(doctorScript, ['--json'], true),
      runNodeScript(readinessScript, ['--json'], true),
    ])
    doctor = parseJsonFromOutput(doctorRaw)
    readiness = parseJsonFromOutput(readinessRaw)
  }

  if (json) {
    console.log(JSON.stringify({ commands, includesStatus: status, doctor, readiness }, null, 2))
    if (!status) return
    return
  }

  if (!json) {
    console.log('Sprint 3 evals commands')
    console.log('-----------------------')
    console.log('Label progress:')
    console.log('  npm run evals:label-progress')
    console.log('  npm run evals:label-progress:strict')
    console.log('')
    console.log('Golden set:')
    console.log('  npm run evals:export-golden-set')
    console.log('  npm run evals:verify-golden-set')
    console.log('  npm run evals:verify-golden-set:strict')
    console.log('')
    console.log('Readiness:')
    console.log('  npm run evals:readiness')
    console.log('  npm run evals:readiness:strict')
    console.log('  npm run evals:readiness:md')
    console.log('  npm run evals:readiness:summary')
    console.log('  npm run evals:readiness:summary:strict')
    console.log('  npm run evals:readiness:snapshot')
    console.log('  npm run evals:readiness:snapshot:json')
    console.log('')
    console.log('Closeout:')
    console.log('  npm run evals:closeout')
    console.log('  npm run evals:closeout:dry-run')
    console.log('  npm run evals:closeout:force')
    console.log('  npm run evals:closeout:json')
    console.log('')
    console.log('Prerequisites:')
    console.log('  npm run evals:doctor')
    console.log('  npm run evals:doctor:strict')
    console.log('')
    console.log('CI:')
    console.log('  npm run evals:ci:check')
    console.log('  npm run evals:ci:check:json')
  }

  if (!status) return

  if (!json) {
    console.log('')
    console.log('Prerequisites:')
    const doctorScript = path.join(ROOT, 'scripts', 'evals-doctor.mjs')
    await runNodeScript(doctorScript)
    console.log('')
    console.log('Current readiness:')
    const readinessScript = path.join(ROOT, 'scripts', 'check-prep-brief-evals-readiness.mjs')
    await runNodeScript(readinessScript)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
