#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'

const ROOT = process.cwd()
const DEFAULT_OUTPUT_MARKDOWN = path.join(ROOT, 'docs', 'status', 'prep-brief-evals-readiness.md')
const DEFAULT_OUTPUT_JSON = path.join(ROOT, 'docs', 'status', 'prep-brief-evals-readiness.json')

function parseArgs(argv) {
  const args = argv.slice(2)
  let outputPath = ''
  let format = 'markdown'

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--format' && args[i + 1]) {
      const nextFormat = args[i + 1].toLowerCase()
      if (nextFormat === 'markdown' || nextFormat === 'json') {
        format = nextFormat
      } else {
        throw new Error(`Unsupported format: ${args[i + 1]}. Use markdown or json.`)
      }
      i += 1
      continue
    }

    if (args[i] === '--output' && args[i + 1]) {
      outputPath = path.isAbsolute(args[i + 1])
        ? args[i + 1]
        : path.join(ROOT, args[i + 1])
      i += 1
    }
  }

  if (!outputPath) {
    outputPath = format === 'json' ? DEFAULT_OUTPUT_JSON : DEFAULT_OUTPUT_MARKDOWN
  }

  return { outputPath, format }
}

function runReadiness(mode) {
  const args = mode === 'json' ? ['--json'] : ['--markdown']

  return new Promise((resolve, reject) => {
    const readinessScript = path.join(ROOT, 'scripts', 'check-prep-brief-evals-readiness.mjs')
    const child = spawn(process.execPath, [readinessScript, ...args], {
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

function parseJsonFromOutput(output) {
  const withoutAnsi = output.replace(/\u001b\[[0-9;]*m/g, '')
  const trimmed = withoutAnsi.trim()
  if (!trimmed) {
    throw new Error('No JSON output received')
  }

  const lines = trimmed.split(/\r?\n/)
  const jsonStart = lines.findIndex((line) => line.trimStart().startsWith('{'))
  const candidate = jsonStart >= 0 ? lines.slice(jsonStart).join('\n').trim() : trimmed
  return JSON.stringify(JSON.parse(candidate), null, 2) + '\n'
}

async function main() {
  const { outputPath, format } = parseArgs(process.argv)
  const raw = await runReadiness(format)
  const content = format === 'json' ? parseJsonFromOutput(raw) : raw

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, content, 'utf8')

  console.log(`Readiness snapshot written: ${outputPath}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
