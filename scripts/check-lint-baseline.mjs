import fs from 'node:fs'
import path from 'node:path'
import { ESLint } from 'eslint'

const root = process.cwd()
const baselinePath = path.join(root, 'docs', 'lint-warning-baseline.json')

function summarize(report) {
  let warnings = 0
  let errors = 0
  for (const file of report) {
    warnings += file.warningCount ?? 0
    errors += file.errorCount ?? 0
  }
  return { warnings, errors }
}

async function main() {
  if (!fs.existsSync(baselinePath)) {
    console.error(`Missing baseline file: ${baselinePath}`)
    process.exitCode = 1
    return
  }

  const eslint = new ESLint({ cache: false })
  const report = await eslint.lintFiles(['.'])

  const current = summarize(report)
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'))

  if (current.errors > 0) {
    console.error(`ESLint has ${current.errors} errors. Fix errors before baseline check.`)
    process.exitCode = 1
    return
  }

  if (current.warnings > baseline.warnings) {
    console.error(`Lint warning regression: baseline=${baseline.warnings}, current=${current.warnings}`)
    process.exitCode = 1
    return
  }

  console.log(`Lint baseline check passed: current=${current.warnings}, baseline=${baseline.warnings}`)
}

main().catch((err) => {
  console.error('Lint baseline check failed:', err)
  process.exitCode = 1
})
