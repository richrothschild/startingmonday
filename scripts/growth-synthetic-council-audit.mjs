#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

function parseArgs(argv) {
  const args = new Set(argv.slice(2))
  const strict = args.has('--strict')
  return {
    strict,
    json: args.has('--json'),
    writeArtifacts: args.has('--write-artifacts') || !strict,
  }
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function checkContains(content, expected, findings, label) {
  if (!content.includes(expected)) {
    findings.push(`${label} missing required phrase: ${expected}`)
  }
}

function writeOutputs(result) {
  const docsDir = path.join(process.cwd(), 'docs')
  const jsonPath = path.join(docsDir, 'growth-synthetic-council.latest.json')
  const mdPath = path.join(docsDir, 'growth-synthetic-council.latest.md')

  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`)

  const lines = [
    '# Growth Synthetic Council Audit',
    '',
    `Status: ${result.status}`,
    `Checked at: ${result.checkedAt}`,
    '',
    '## Findings',
  ]

  if (result.findings.length === 0) {
    lines.push('- none')
  } else {
    for (const finding of result.findings) {
      lines.push(`- ${finding}`)
    }
  }

  fs.writeFileSync(mdPath, `${lines.join('\n')}\n`)
}

function main() {
  const args = parseArgs(process.argv)
  const charterPath = path.join(process.cwd(), 'docs', 'growth', 'synthetic-growth-council.md')
  const templatePath = path.join(process.cwd(), 'docs', 'growth', 'weekly-operating-template.md')

  const findings = []

  if (!fs.existsSync(charterPath)) {
    findings.push('Missing required file docs/growth/synthetic-growth-council.md')
  }

  if (!fs.existsSync(templatePath)) {
    findings.push('Missing required file docs/growth/weekly-operating-template.md')
  }

  if (findings.length === 0) {
    const charter = readUtf8(charterPath)
    const template = readUtf8(templatePath)

    const ownershipRequirements = [
      'Product marketing owns messaging',
      'Design owns UX patterns',
      'Engineering owns performance and event integrity',
      'Growth owns experiments and reporting',
    ]

    for (const rule of ownershipRequirements) {
      checkContains(charter, rule, findings, 'Council charter')
    }

    const templateRequirements = [
      '## Owners',
      '## Weekly Cadence',
      '## Meeting Agenda (Friday)',
      '## Experiment Brief Format',
      '## Scorecard (Required Every Friday)',
      '## Decision Rules',
      '## Production Release Gate',
    ]

    for (const rule of templateRequirements) {
      checkContains(template, rule, findings, 'Weekly operating template')
    }
  }

  const result = {
    checkedAt: new Date().toISOString(),
    status: findings.length === 0 ? 'PASS' : 'FAIL',
    findings,
  }

  if (args.writeArtifacts) {
    writeOutputs(result)
  }

  if (args.json) {
    console.log(JSON.stringify(result, null, 2))
  } else {
    console.log('Growth Synthetic Council Audit')
    console.log('-----------------------------')
    console.log(`Status: ${result.status}`)
    if (result.findings.length > 0) {
      for (const finding of result.findings) {
        console.log(`- ${finding}`)
      }
    }
  }

  if (args.strict && findings.length > 0) {
    process.exit(2)
  }
}

main()
