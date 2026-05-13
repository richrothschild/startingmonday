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

function runNodeScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: ROOT,
      stdio: 'inherit',
    })

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${path.basename(scriptPath)} exited with code ${code ?? 'unknown'}`))
      }
    })
  })
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
  }

  if (json) {
    console.log(JSON.stringify({ commands, includesStatus: status }, null, 2))
    if (!status) return
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
  }

  if (!status) return

  if (!json) {
    console.log('')
    console.log('Current readiness:')
  }
  const readinessScript = path.join(ROOT, 'scripts', 'check-prep-brief-evals-readiness.mjs')
  await runNodeScript(readinessScript)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
