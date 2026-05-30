#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROLE_MODES_PATH = path.join(process.cwd(), 'src', 'lib', 'prep-role-modes.ts')
const SIGNOFFS_PATH = path.join(process.cwd(), 'docs', 'status', 'prep-role-mode-signoffs.latest.json')
const TEMPLATE_PATH = path.join(process.cwd(), 'docs', 'status', 'prep-role-mode-signoffs.template.json')
const OUTPUT_JSON_PATH = path.join(process.cwd(), 'docs', 'status', 'prep-role-mode-qa.latest.json')
const OUTPUT_MD_PATH = path.join(process.cwd(), 'docs', 'status', 'prep-role-mode-qa.latest.md')

const EXPECTED_MODES = ['cio', 'cto', 'ciso', 'vp_to_cxo']
const REQUIRED_RUBRIC_KEYS = [
  'board_readiness',
  'operating_cadence',
  'evidence_density',
  'risk_clarity',
  'decisiveness',
]

function parseArgs(argv) {
  const argSet = new Set(argv.slice(2))
  return {
    json: argSet.has('--json'),
    markdown: argSet.has('--markdown'),
    summary: argSet.has('--summary'),
    strict: argSet.has('--strict'),
  }
}

function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(raw)
}

function parseModesFromSource(sourceText) {
  const match = sourceText.match(/PREP_ROLE_MODES\s*=\s*\[(.*?)\]\s+as const/s)
  if (!match) return []
  return Array.from(match[1].matchAll(/'([^']+)'/g)).map((group) => group[1])
}

function parseRolePackForMode(sourceText, mode) {
  const regex = new RegExp(`${mode}:\\s*\\[([\\s\\S]*?)\\]\\.join\\('\\\\n'\\)`, 'm')
  const match = sourceText.match(regex)
  if (!match) return []
  return Array.from(match[1].matchAll(/'([^']+)'/g)).map((group) => group[1])
}

function evaluateRolePacks(sourceText) {
  const modeChecks = []

  for (const mode of EXPECTED_MODES) {
    const lines = parseRolePackForMode(sourceText, mode)
    const hasRoleHeader = lines.some((line) => line.startsWith('ROLE MODE:'))
    const hasPrioritize = lines.some((line) => line.toLowerCase().includes('prioritize'))
    const hasPushback = lines.some((line) => {
      const value = line.toLowerCase()
      return value.includes('pushback') || value.includes('objection') || value.includes('board question')
    })

    modeChecks.push({
      mode,
      present: lines.length > 0,
      hasRoleHeader,
      hasPrioritize,
      hasPushback,
      pass: lines.length > 0 && hasRoleHeader && hasPrioritize && hasPushback,
    })
  }

  return modeChecks
}

function evaluateSignoffs(signoffs) {
  const byMode = {}
  const failures = []

  for (const mode of EXPECTED_MODES) {
    const entry = signoffs?.modes?.[mode]
    const approved = entry?.approved === true
    const reviewer = typeof entry?.reviewer === 'string' && entry.reviewer.trim().length > 0
    const approvedAt = typeof entry?.approved_at === 'string' && Number.isFinite(Date.parse(entry.approved_at))
    const rubricScores = entry?.rubric_scores && typeof entry.rubric_scores === 'object' ? entry.rubric_scores : null

    const missingRubric = REQUIRED_RUBRIC_KEYS.filter((key) => {
      const value = rubricScores?.[key]
      return typeof value !== 'number' || value < 1 || value > 5
    })

    const pass = approved && reviewer && approvedAt && missingRubric.length === 0
    byMode[mode] = {
      approved,
      reviewer,
      approvedAt,
      missingRubric,
      pass,
    }

    if (!pass) {
      failures.push({ mode, approved, reviewer, approvedAt, missingRubric })
    }
  }

  return {
    exists: Boolean(signoffs),
    byMode,
    failures,
    pass: failures.length === 0,
  }
}

function ensureTemplateFile() {
  if (fs.existsSync(TEMPLATE_PATH)) return

  const template = {
    generated_for: 'prep_role_mode_qa',
    modes: Object.fromEntries(EXPECTED_MODES.map((mode) => [mode, {
      approved: false,
      reviewer: '',
      approved_at: '',
      notes: '',
      rubric_scores: {
        board_readiness: 0,
        operating_cadence: 0,
        evidence_density: 0,
        risk_clarity: 0,
        decisiveness: 0,
      },
    }])),
  }

  fs.mkdirSync(path.dirname(TEMPLATE_PATH), { recursive: true })
  fs.writeFileSync(TEMPLATE_PATH, `${JSON.stringify(template, null, 2)}\n`)
}

function toMarkdown(result) {
  const lines = [
    '# Prep Role Mode QA',
    '',
    `- Generated at: ${result.generatedAt}`,
    `- Role mode source: ${result.roleModesPath}`,
    `- Signoffs source: ${result.signoffsPath}`,
    `- Status: ${result.status}`,
    '',
    '## Prompt Pack Coverage',
  ]

  for (const check of result.modeChecks) {
    lines.push(
      `- ${check.mode}: ${check.pass ? 'PASS' : 'FAIL'} ` +
      `(present=${check.present}, header=${check.hasRoleHeader}, prioritize=${check.hasPrioritize}, pushback=${check.hasPushback})`,
    )
  }

  lines.push('', '## Editorial Signoff')
  if (!result.signoff.exists) {
    lines.push('- Signoff file missing. Use prep-role-mode-signoffs.template.json to create latest signoff file.')
  } else if (result.signoff.failures.length === 0) {
    lines.push('- All modes signed off.')
  } else {
    for (const failure of result.signoff.failures) {
      lines.push(
        `- ${failure.mode}: approved=${failure.approved}, reviewer=${failure.reviewer}, ` +
        `approved_at=${failure.approvedAt}, missing_rubric=[${failure.missingRubric.join(', ')}]`,
      )
    }
  }

  lines.push('', '## Rubric Dimensions', ...REQUIRED_RUBRIC_KEYS.map((key) => `- ${key}`))
  return `${lines.join('\n')}\n`
}

function main() {
  const { json, markdown, summary, strict } = parseArgs(process.argv)
  ensureTemplateFile()

  const roleModesSource = fs.readFileSync(ROLE_MODES_PATH, 'utf8')
  const parsedModes = parseModesFromSource(roleModesSource)
  const modeChecks = evaluateRolePacks(roleModesSource)

  const missingModes = EXPECTED_MODES.filter((mode) => !parsedModes.includes(mode))

  let signoffs = null
  if (fs.existsSync(SIGNOFFS_PATH)) {
    signoffs = readJsonFile(SIGNOFFS_PATH)
  }
  const signoff = evaluateSignoffs(signoffs)

  const modeCoveragePass = missingModes.length === 0 && modeChecks.every((check) => check.pass)
  const status = !modeCoveragePass
    ? 'FAIL'
    : signoff.pass
      ? 'PASS'
      : 'PENDING_SIGNOFF'

  const result = {
    generatedAt: new Date().toISOString(),
    roleModesPath: ROLE_MODES_PATH,
    signoffsPath: SIGNOFFS_PATH,
    expectedModes: EXPECTED_MODES,
    parsedModes,
    missingModes,
    modeChecks,
    rubricDimensions: REQUIRED_RUBRIC_KEYS,
    signoff,
    status,
  }

  fs.mkdirSync(path.dirname(OUTPUT_JSON_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON_PATH, `${JSON.stringify(result, null, 2)}\n`)
  fs.writeFileSync(OUTPUT_MD_PATH, toMarkdown(result))

  if (json) {
    console.log(JSON.stringify(result, null, 2))
  } else if (markdown) {
    process.stdout.write(toMarkdown(result))
  } else if (summary) {
    console.log(
      `status=${result.status} modes_ok=${modeCoveragePass} signoff_ok=${signoff.pass} ` +
      `missing_modes=${missingModes.length} generated_at=${result.generatedAt}`,
    )
  } else {
    console.log('Prep role mode QA')
    console.log('-----------------')
    console.log(`Status: ${result.status}`)
    console.log(`Mode coverage pass: ${modeCoveragePass}`)
    console.log(`Signoff pass: ${signoff.pass}`)
    if (missingModes.length > 0) {
      console.log(`Missing modes: ${missingModes.join(', ')}`)
    }
  }

  if (strict && status !== 'PASS') {
    process.exitCode = 1
  }
}

main()
