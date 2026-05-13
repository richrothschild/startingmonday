#!/usr/bin/env node
import path from 'node:path'
import { spawn } from 'node:child_process'

const ROOT = process.cwd()

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
  const doctorScript = path.join(ROOT, 'scripts', 'evals-doctor.mjs')
  const readinessScript = path.join(ROOT, 'scripts', 'check-prep-brief-evals-readiness.mjs')

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
