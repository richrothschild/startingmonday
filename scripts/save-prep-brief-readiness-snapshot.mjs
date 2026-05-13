#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'

const ROOT = process.cwd()
const DEFAULT_OUTPUT = path.join(ROOT, 'docs', 'status', 'prep-brief-evals-readiness.md')

function parseArgs(argv) {
  const args = argv.slice(2)
  let outputPath = DEFAULT_OUTPUT

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--output' && args[i + 1]) {
      outputPath = path.isAbsolute(args[i + 1])
        ? args[i + 1]
        : path.join(ROOT, args[i + 1])
      i += 1
    }
  }

  return { outputPath }
}

function runReadinessMarkdown() {
  return new Promise((resolve, reject) => {
    const readinessScript = path.join(ROOT, 'scripts', 'check-prep-brief-evals-readiness.mjs')
    const child = spawn(process.execPath, [readinessScript, '--markdown'], {
      cwd: ROOT,
      stdio: ['inherit', 'pipe', 'inherit'],
    })

    let stdout = ''
    if (child.stdout) {
      child.stdout.on('data', (chunk) => {
        stdout += String(chunk)
      })
    }

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout)
      } else {
        reject(new Error(`check-prep-brief-evals-readiness.mjs exited with code ${code ?? 'unknown'}`))
      }
    })
  })
}

async function main() {
  const { outputPath } = parseArgs(process.argv)
  const markdown = await runReadinessMarkdown()

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, markdown, 'utf8')

  console.log(`Readiness snapshot written: ${outputPath}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
