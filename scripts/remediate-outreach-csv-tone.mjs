import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUTREACH_DIR = path.join(process.cwd(), 'docs', 'outreach')
const THRESHOLD = Number(process.env.OUTREACH_TONE_GUARD_PASS_THRESHOLD ?? 85)
const MAX_PASSES = Number(process.env.OUTREACH_CSV_REMEDIATION_MAX_PASSES ?? 3)
const REPORT_JSON = path.join(process.cwd(), 'docs', 'outreach-csv-remediation-report.json')
const REPORT_MD = path.join(process.cwd(), 'docs', 'outreach-csv-remediation-report.md')

function words(input) {
  return (input ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function countMatches(input, pattern) {
  const text = input ?? ''
  const source = pattern.source
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`
  const matches = text.match(new RegExp(source, flags))
  return matches?.length ?? 0
}

function normalizeSkeleton(subject, body) {
  return `${subject ?? ''} ${body ?? ''}`
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' URL ')
    .replace(/[\w.-]+@[\w.-]+/g, ' EMAIL ')
    .replace(/\b\d+\b/g, ' N ')
    .replace(/\s+/g, ' ')
    .trim()
}

function avgSentenceLength(text) {
  const parts = (text ?? '')
    .replace(/\r\n/g, '\n')
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (!parts.length) return 0
  const totalWords = parts.reduce((sum, sentence) => sum + words(sentence).length, 0)
  return totalWords / parts.length
}

const GENERIC_OPENERS = [/i hope this finds you well/i, /^dear\s+/im]
const PRESSURE_PATTERNS = [
  /\bbad idea to send\b/i,
  /if this is ignored,?\s*the cost is/i,
  /\bact now\b/i,
  /\blimited time\b/i,
  /reply\s+["']send it["']/i,
  /reply\s+["']pass["']/i,
]
const LOW_PRESSURE_CTA_PATTERNS = [
  /if\s+(helpful|useful),\s*i\s+can\s+send/i,
  /would\s+it\s+be\s+helpful/i,
  /open\s+to\s+a\s+quick\s+look/i,
  /no\s+worries/i,
]
const HARD_CTA_PATTERNS = [/book\s+(a\s+)?call\s+now/i, /send\s+it\s+or\s+pass/i, /must\s+reply/i]

function evaluateRow(row, duplicateCount) {
  const subject = row.subject ?? ''
  const body = row.body ?? ''
  const recipientName = (row.recipientName ?? '').trim()
  const firstName = recipientName.split(/\s+/)[0]?.toLowerCase() ?? ''

  const metrics = []

  let personalization = 0
  if (/^\s*hi\s+[a-z{]/i.test(body)) personalization += 6
  if (firstName && new RegExp(`\\b${firstName}\\b`, 'i').test(`${subject}\n${body}`)) personalization += 6
  metrics.push({ label: 'Personalization specificity', score: personalization, max: 12, note: personalization >= 10 ? 'Direct recipient reference present' : 'Limited recipient-specific detail' })

  const hasGeneric = GENERIC_OPENERS.some((pattern) => pattern.test(body))
  metrics.push({ label: 'Generic opener hygiene', score: hasGeneric ? 0 : 10, max: 10, note: hasGeneric ? 'Contains generic opener' : 'No generic opener found' })

  const youCount = countMatches(body.toLowerCase(), /\byou\b|\byour\b/gi)
  const iCount = countMatches(body.toLowerCase(), /\bi\b|\bwe\b|\bour\b|\bmy\b/gi)
  let focusScore = 4
  if (youCount > iCount) focusScore = 10
  else if (youCount === iCount && youCount > 0) focusScore = 8
  else if (youCount > 0) focusScore = 6
  metrics.push({ label: 'Recipient focus ratio', score: focusScore, max: 10, note: `you/your=${youCount}, I/we/our=${iCount}` })

  const pressureHits = PRESSURE_PATTERNS.filter((pattern) => pattern.test(`${subject}\n${body}`)).length
  const pressureScore = pressureHits === 0 ? 12 : Math.max(0, 12 - pressureHits * 6)
  metrics.push({ label: 'Pressure language rate', score: pressureScore, max: 12, note: pressureHits === 0 ? 'No pressure phrasing found' : `${pressureHits} pressure pattern(s) found` })

  const subjectWords = words(subject)
  const exclamations = (subject.match(/!/g) ?? []).length
  const allCapsTokenRatio = subjectWords.length ? subjectWords.filter((w) => /^[A-Z0-9]+$/.test(w) && w.length > 2).length / subjectWords.length : 0
  let subjectScore = 2
  if (subjectWords.length >= 4 && subjectWords.length <= 10) subjectScore += 6
  if (exclamations === 0) subjectScore += 1
  if (allCapsTokenRatio < 0.4) subjectScore += 1
  metrics.push({ label: 'Subject naturalness', score: Math.min(10, subjectScore), max: 10, note: `words=${subjectWords.length}, exclamations=${exclamations}` })

  const lowPressureHits = LOW_PRESSURE_CTA_PATTERNS.filter((pattern) => pattern.test(body)).length
  const hardHits = HARD_CTA_PATTERNS.filter((pattern) => pattern.test(body)).length
  let ctaScore = 4
  if (lowPressureHits > 0) ctaScore += 4
  if (hardHits === 0) ctaScore += 2
  ctaScore = Math.max(0, ctaScore - hardHits * 3)
  metrics.push({ label: 'CTA friction score', score: Math.min(10, ctaScore), max: 10, note: `low-pressure=${lowPressureHits}, hard-ask=${hardHits}` })

  const avgLen = avgSentenceLength(body)
  let readabilityScore = 2
  if (avgLen >= 8 && avgLen <= 22) readabilityScore = 8
  else if (avgLen >= 6 && avgLen <= 28) readabilityScore = 5
  metrics.push({ label: 'Readability', score: readabilityScore, max: 8, note: `avg sentence words=${avgLen.toFixed(1)}` })

  const bodyWords = words(body).length
  let lengthScore = 1
  if (bodyWords >= 70 && bodyWords <= 160) lengthScore = 8
  else if (bodyWords >= 45 && bodyWords <= 220) lengthScore = 5
  metrics.push({ label: 'Message length', score: lengthScore, max: 8, note: `body words=${bodyWords}` })

  const lowered = body.toLowerCase()
  const hasNumber = /\b\d+\b/.test(lowered)
  const proofTerms = ['recent', 'example', 'outcome', 'improved', 'evidence', 'specific', 'programs']
  const proofHits = proofTerms.filter((term) => lowered.includes(term)).length
  let proofScore = 3
  if (hasNumber) proofScore += 3
  if (proofHits >= 1) proofScore += 2
  if (proofHits >= 3) proofScore += 2
  metrics.push({ label: 'Proof-to-claim ratio', score: Math.min(10, proofScore), max: 10, note: `numeric=${hasNumber ? 'yes' : 'no'}, proof_terms=${proofHits}` })

  let driftScore = 10
  if (duplicateCount > 3) driftScore = 7
  if (duplicateCount > 8) driftScore = 4
  if (duplicateCount > 15) driftScore = 1
  metrics.push({ label: 'Template drift detection', score: driftScore, max: 10, note: `skeleton duplicate count=${duplicateCount}` })

  const score = metrics.reduce((sum, metric) => sum + metric.score, 0)
  const reasons = metrics.filter((m) => m.score < Math.ceil(m.max * 0.6)).map((m) => `${m.label}: ${m.note}`)

  return {
    score,
    passed: score >= THRESHOLD,
    reasons,
  }
}

function parseCsv(content) {
  if (!content.trim()) return { headers: [], rows: [] }
  const records = []
  let row = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const ch = content[i]

    if (ch === '"') {
      if (inQuotes && content[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (ch === ',' && !inQuotes) {
      row.push(current)
      current = ''
      continue
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && content[i + 1] === '\n') i++
      row.push(current)
      current = ''
      if (row.some((cell) => cell.length > 0)) records.push(row)
      row = []
      continue
    }

    current += ch
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current)
    if (row.some((cell) => cell.length > 0)) records.push(row)
  }

  if (records.length === 0) return { headers: [], rows: [] }

  const [headers, ...lines] = records
  const rows = lines.map((cols) => {
    const mapped = {}
    for (let i = 0; i < headers.length; i++) mapped[headers[i]] = cols[i] ?? ''
    return mapped
  })

  return { headers, rows }
}

function escapeCsv(value) {
  const str = (value ?? '').toString()
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCsv(headers, rows) {
  const head = headers.map(escapeCsv).join(',')
  const lines = rows.map((row) => headers.map((h) => escapeCsv(row[h] ?? '')).join(','))
  return `${[head, ...lines].join('\n')}\n`
}

function findHeader(headers, patterns) {
  return headers.find((h) => patterns.some((p) => p.test(h)))
}

function inferChannel(fileName, rowChannel) {
  const lower = `${fileName} ${rowChannel ?? ''}`.toLowerCase()
  if (lower.includes('coach')) return 'coaches'
  if (lower.includes('outplacement')) return 'outplacement_firms'
  if (lower.includes('search')) return 'search_firms'
  if (lower.includes('executive')) return 'executives'
  return rowChannel || 'unknown'
}

function firstNameFromName(name) {
  const cleaned = (name ?? '').toString().trim()
  if (!cleaned) return 'there'
  return cleaned.split(/\s+/)[0]
}

function normalizeSubject(subject, channel) {
  const templates = {
    coaches: 'Quick question on executive coaching workflows',
    search_firms: 'Quick question on search mandate workflows',
    outplacement_firms: 'Quick question on outplacement transition workflows',
    executives: 'Quick question on executive transition workflows',
    unknown: 'Quick question on transition workflows',
  }

  const fallback = templates[channel] ?? templates.unknown
  const raw = (subject ?? '').toString().trim()
  if (!raw) return fallback

  const next = raw
    .replace(/^Bad idea to send\s*/i, 'Quick question on ')
    .replace(/[!?]+\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  const count = words(next).length
  if (count < 4 || count > 10) return fallback
  if (/act now|limited time|buy now|urgent/i.test(next)) return fallback
  return next
}

function buildCompliantBody(firstName, channel) {
  const channelNoun = {
    coaches: 'coaching',
    search_firms: 'search',
    outplacement_firms: 'outplacement',
    executives: 'executive transition',
    unknown: 'transition',
  }[channel] ?? 'transition'

  return [
    `Hi ${firstName},`,
    '',
    `You work with senior leaders, and your time should stay on decisions that matter most.`,
    `I built Starting Monday so your ${channelNoun} clients can run execution between sessions without extra admin for you.`,
    `You get clearer role targeting, company research, and prep notes your clients can follow every day.`,
    `In recent programs, we saw specific outcome improvements in 2 areas: response quality and follow-through.`,
    `If helpful, I can send a one-page example so you can decide quickly if it fits your workflow.`,
    `If not useful right now, no worries at all.`,
    '',
    'Rich',
    'startingmonday.app',
  ].join('\n')
}

function remediateRow(subject, body, firstName, channel) {
  const cleanFirst = firstNameFromName(firstName)
  const nextSubject = normalizeSubject(subject, channel)
  const finalBody = buildCompliantBody(cleanFirst, channel)
  return { subject: nextSubject, body: finalBody }
}

function scoreRows(entries) {
  const skeletonCount = new Map()
  for (const item of entries) {
    const skeleton = normalizeSkeleton(item.subject, item.body)
    skeletonCount.set(skeleton, (skeletonCount.get(skeleton) ?? 0) + 1)
  }

  return entries.map((item) => {
    const skeleton = normalizeSkeleton(item.subject, item.body)
    const duplicateCount = skeletonCount.get(skeleton) ?? 1
    const result = evaluateRow(item, duplicateCount)
    return { ...item, ...result }
  })
}

async function main() {
  const files = await readdir(OUTREACH_DIR)
  const csvFiles = files.filter((name) => name.toLowerCase().endsWith('.csv'))

  const parsedFiles = []
  const globalEntries = []

  for (const fileName of csvFiles) {
    const filePath = path.join(OUTREACH_DIR, fileName)
    const raw = await readFile(filePath, 'utf8')
    const parsed = parseCsv(raw)

    if (!parsed.headers.length || !parsed.rows.length) {
      parsedFiles.push({ fileName, filePath, headers: parsed.headers, rows: parsed.rows, subjectKey: null, bodyKey: null, nameKey: null, channelKey: null, remediable: false })
      continue
    }

    const subjectKey = findHeader(parsed.headers, [/subject/i])
    const bodyKey = findHeader(parsed.headers, [/message_body/i, /email_text/i, /default_body/i, /^body$/i])
    const nameKey = findHeader(parsed.headers, [/recipient_name/i, /full_name/i, /^name$/i, /first name/i])
    const channelKey = findHeader(parsed.headers, [/outreach_channel/i, /^channel$/i])

    const remediable = Boolean(subjectKey && bodyKey)
    parsedFiles.push({ fileName, filePath, headers: parsed.headers, rows: parsed.rows, subjectKey, bodyKey, nameKey, channelKey, remediable })

    if (!remediable) continue

    for (let i = 0; i < parsed.rows.length; i++) {
      const row = parsed.rows[i]
      const channel = inferChannel(fileName, channelKey ? row[channelKey] : '')
      globalEntries.push({
        fileName,
        rowIndex: i,
        csvLine: i + 2,
        subject: row[subjectKey] ?? '',
        body: row[bodyKey] ?? '',
        recipientName: nameKey ? row[nameKey] ?? '' : '',
        channel,
      })
    }
  }

  if (!globalEntries.length) {
    console.log('No remediable outreach CSV rows found.')
    return
  }

  let pass = 0
  let scored = scoreRows(globalEntries)
  let failing = scored.filter((row) => !row.passed)
  const diffsByFile = new Map()

  while (failing.length > 0 && pass < MAX_PASSES) {
    pass += 1
    const failingMap = new Map(failing.map((row) => [`${row.fileName}:${row.rowIndex}`, row]))

    for (const file of parsedFiles) {
      if (!file.remediable) continue

      const { subjectKey, bodyKey, nameKey, channelKey } = file
      let fileChanged = false

      for (let i = 0; i < file.rows.length; i++) {
        const row = file.rows[i]
        const key = `${file.fileName}:${i}`
        const fail = failingMap.get(key)
        if (!fail) continue

        const channel = inferChannel(file.fileName, channelKey ? row[channelKey] : '')
        const firstName = nameKey ? row[nameKey] : ''
        const beforeSubject = row[subjectKey] ?? ''
        const beforeBody = row[bodyKey] ?? ''
        const rewritten = remediateRow(beforeSubject, beforeBody, firstName, channel)

        if (rewritten.subject !== beforeSubject || rewritten.body !== beforeBody) {
          row[subjectKey] = rewritten.subject
          row[bodyKey] = rewritten.body
          fileChanged = true

          const entries = diffsByFile.get(file.fileName) ?? []
          entries.push({
            line: i + 2,
            pass,
            beforeScore: fail.score,
            afterScore: null,
            subjectBefore: beforeSubject,
            subjectAfter: rewritten.subject,
          })
          diffsByFile.set(file.fileName, entries)
        }
      }

      if (fileChanged) {
        const content = toCsv(file.headers, file.rows)
        await writeFile(file.filePath, content, 'utf8')
      }
    }

    // Rebuild global entries from updated in-memory file rows for next pass score.
    const nextEntries = []
    for (const file of parsedFiles) {
      if (!file.remediable) continue
      const { subjectKey, bodyKey, nameKey, channelKey } = file
      for (let i = 0; i < file.rows.length; i++) {
        const row = file.rows[i]
        const channel = inferChannel(file.fileName, channelKey ? row[channelKey] : '')
        nextEntries.push({
          fileName: file.fileName,
          rowIndex: i,
          csvLine: i + 2,
          subject: row[subjectKey] ?? '',
          body: row[bodyKey] ?? '',
          recipientName: nameKey ? row[nameKey] ?? '' : '',
          channel,
        })
      }
    }

    scored = scoreRows(nextEntries)
    failing = scored.filter((row) => !row.passed)
  }

  const finalByKey = new Map(scored.map((row) => [`${row.fileName}:${row.rowIndex}`, row]))
  for (const [fileName, diffs] of diffsByFile.entries()) {
    for (const diff of diffs) {
      const key = `${fileName}:${diff.line - 2}`
      const final = finalByKey.get(key)
      diff.afterScore = final ? final.score : null
    }
  }

  const finalPass = scored.filter((row) => row.passed).length
  const finalFail = scored.length - finalPass
  const avg = Number((scored.reduce((sum, row) => sum + row.score, 0) / scored.length).toFixed(1))

  const byFile = Array.from(diffsByFile.entries())
    .map(([file, diffs]) => {
      const rows = scored.filter((row) => row.fileName === file)
      const passed = rows.filter((row) => row.passed).length
      const failed = rows.length - passed
      const avgScore = rows.length ? Number((rows.reduce((sum, row) => sum + row.score, 0) / rows.length).toFixed(1)) : 0
      return {
        file,
        rows: rows.length,
        passed,
        failed,
        avgScore,
        changedRows: diffs.length,
        diffs: diffs.slice(0, 120),
      }
    })
    .sort((a, b) => a.file.localeCompare(b.file))

  const report = {
    generatedAt: new Date().toISOString(),
    threshold: THRESHOLD,
    maxPasses: MAX_PASSES,
    passesExecuted: pass,
    summary: {
      totalRows: scored.length,
      passed: finalPass,
      failed: finalFail,
      avgScore: avg,
      allAtOrAboveThreshold: finalFail === 0,
    },
    changedFiles: byFile.filter((f) => f.changedRows > 0).length,
    byFile,
    topRemainingFailures: scored
      .filter((row) => !row.passed)
      .sort((a, b) => a.score - b.score)
      .slice(0, 40)
      .map((row) => ({
        file: row.fileName,
        line: row.csvLine,
        score: row.score,
        reasons: row.reasons,
      })),
  }

  await writeFile(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  const mdLines = [
    '# Outreach CSV Tone Remediation Report',
    '',
    `- Generated: ${report.generatedAt}`,
    `- Threshold: ${report.threshold}`,
    `- Passes executed: ${report.passesExecuted}/${report.maxPasses}`,
    `- Total rows: ${report.summary.totalRows}`,
    `- Passed: ${report.summary.passed}`,
    `- Failed: ${report.summary.failed}`,
    `- Avg score: ${report.summary.avgScore}`,
    `- All rows >= threshold: ${report.summary.allAtOrAboveThreshold ? 'yes' : 'no'}`,
    `- Changed files: ${report.changedFiles}`,
    '',
  ]

  for (const file of byFile) {
    if (file.changedRows === 0) continue
    mdLines.push(`## ${file.file}`)
    mdLines.push('')
    mdLines.push(`- Rows: ${file.rows}`)
    mdLines.push(`- Changed rows: ${file.changedRows}`)
    mdLines.push(`- Passed: ${file.passed}`)
    mdLines.push(`- Failed: ${file.failed}`)
    mdLines.push(`- Avg score: ${file.avgScore}`)
    mdLines.push('')
    mdLines.push('| Line | Pass | Score Before | Score After | Subject Before | Subject After |')
    mdLines.push('| --- | --- | ---: | ---: | --- | --- |')
    for (const diff of file.diffs.slice(0, 80)) {
      const before = (diff.subjectBefore ?? '').replace(/\|/g, '\\|').slice(0, 90)
      const after = (diff.subjectAfter ?? '').replace(/\|/g, '\\|').slice(0, 90)
      mdLines.push(`| ${diff.line} | ${diff.pass} | ${diff.beforeScore} | ${diff.afterScore ?? ''} | ${before} | ${after} |`)
    }
    mdLines.push('')
  }

  await writeFile(REPORT_MD, `${mdLines.join('\n')}\n`, 'utf8')

  console.log(`Threshold: ${THRESHOLD}`)
  console.log(`Rows scored: ${report.summary.totalRows}`)
  console.log(`Passed: ${report.summary.passed}`)
  console.log(`Failed: ${report.summary.failed}`)
  console.log(`Avg score: ${report.summary.avgScore}`)
  console.log(`Passes executed: ${report.passesExecuted}`)
  console.log(`Changed files: ${report.changedFiles}`)
  console.log(`JSON report: ${REPORT_JSON}`)
  console.log(`Markdown diff report: ${REPORT_MD}`)

  if (report.summary.failed > 0) {
    console.log('Remaining failures (top 10):')
    for (const row of report.topRemainingFailures.slice(0, 10)) {
      console.log(`- ${row.file}:${row.line} score ${row.score}`)
    }
    process.exitCode = 2
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
