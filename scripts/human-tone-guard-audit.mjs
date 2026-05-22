import { config as loadEnv } from 'dotenv'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

loadEnv({ path: '.env' })
loadEnv({ path: '.env.local', override: true })

const PASS_THRESHOLD = Number(process.env.OUTREACH_TONE_GUARD_PASS_THRESHOLD ?? 85)
const OUTREACH_DIR = path.join(process.cwd(), 'docs', 'outreach')
const WRITE_JSON = process.argv.includes('--write-json')
const JSON_PATH = path.join(process.cwd(), 'docs', 'outreach-human-tone-audit.json')

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
  if (/^\s*hi\s+[a-z]/i.test(body)) personalization += 6
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
    passed: score >= PASS_THRESHOLD,
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

function isQueuedUnsentStatus(status) {
  const normalized = (status ?? '').toLowerCase().trim()
  if (!normalized) return true
  return ['pending', 'queued', 'draft', 'scheduled'].includes(normalized)
}

function summarize(scoredRows) {
  const passed = scoredRows.filter((row) => row.passed).length
  const failed = scoredRows.length - passed
  const averageScore = scoredRows.length ? Number((scoredRows.reduce((sum, row) => sum + row.score, 0) / scoredRows.length).toFixed(1)) : 0
  const passRate = scoredRows.length ? Number(((passed / scoredRows.length) * 100).toFixed(1)) : 0

  const byChannelMap = new Map()
  for (const row of scoredRows) {
    const list = byChannelMap.get(row.channel) ?? []
    list.push(row)
    byChannelMap.set(row.channel, list)
  }

  const byChannel = Array.from(byChannelMap.entries())
    .map(([channel, rows]) => {
      const channelPassed = rows.filter((r) => r.passed).length
      const channelFailed = rows.length - channelPassed
      const channelAvg = Number((rows.reduce((sum, r) => sum + r.score, 0) / rows.length).toFixed(1))
      const channelPassRate = Number(((channelPassed / rows.length) * 100).toFixed(1))
      return { channel, total: rows.length, passed: channelPassed, failed: channelFailed, averageScore: channelAvg, passRate: channelPassRate }
    })
    .sort((a, b) => a.averageScore - b.averageScore)

  return {
    total: scoredRows.length,
    passed,
    failed,
    averageScore,
    passRate,
    byChannel,
    worst: [...scoredRows].filter((r) => !r.passed).sort((a, b) => a.score - b.score).slice(0, 20),
  }
}

async function loadDbRows() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const pageSize = 1000
  let from = 0
  const allRows = []

  while (true) {
    const { data, error } = await supabase
      .from('outreach_logs')
      .select('id, recipient_name, recipient_email, subject, message_body, delivery_status, outreach_channel, channel, sent_at')
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1)

    if (error) throw new Error(`Failed to fetch outreach logs: ${error.message}`)

    const rows = data ?? []
    allRows.push(...rows)
    if (rows.length < pageSize) break
    from += pageSize
  }

  return allRows.map((row) => ({
    source: 'db',
    id: row.id,
    recipientName: row.recipient_name ?? '',
    recipientEmail: row.recipient_email ?? '',
    subject: row.subject ?? '',
    body: row.message_body ?? '',
    status: row.delivery_status ?? 'unknown',
    queued: isQueuedUnsentStatus(row.delivery_status) && !row.sent_at,
    channel: row.outreach_channel ?? row.channel ?? 'unknown',
    file: null,
  }))
}

async function loadCsvRows() {
  const files = await readdir(OUTREACH_DIR)
  const csvFiles = files.filter((name) => name.toLowerCase().endsWith('.csv'))

  const rows = []
  for (const fileName of csvFiles) {
    const filePath = path.join(OUTREACH_DIR, fileName)
    const raw = await readFile(filePath, 'utf8')
    const parsed = parseCsv(raw)
    if (!parsed.headers.length || !parsed.rows.length) continue

    const subjectKey = findHeader(parsed.headers, [/subject/i])
    const bodyKey = findHeader(parsed.headers, [/message_body/i, /email_text/i, /default_body/i, /^body$/i])
    const nameKey = findHeader(parsed.headers, [/recipient_name/i, /full_name/i, /^name$/i])
    const emailKey = findHeader(parsed.headers, [/recipient_email/i, /^email$/i, /email_address/i])
    const channelKey = findHeader(parsed.headers, [/outreach_channel/i, /^channel$/i])

    if (!subjectKey || !bodyKey) continue

    for (let i = 0; i < parsed.rows.length; i++) {
      const row = parsed.rows[i]
      rows.push({
        source: 'csv',
        id: `${fileName}:${i + 2}`,
        recipientName: (nameKey ? row[nameKey] : '') ?? '',
        recipientEmail: (emailKey ? row[emailKey] : '') ?? '',
        subject: row[subjectKey] ?? '',
        body: row[bodyKey] ?? '',
        status: 'csv',
        queued: true,
        channel: inferChannel(fileName, channelKey ? row[channelKey] : ''),
        file: fileName,
      })
    }
  }

  return rows
}

function scoreRows(items) {
  const skeletonCount = new Map()
  for (const item of items) {
    const skeleton = normalizeSkeleton(item.subject, item.body)
    skeletonCount.set(skeleton, (skeletonCount.get(skeleton) ?? 0) + 1)
  }

  return items.map((item) => {
    const skeleton = normalizeSkeleton(item.subject, item.body)
    const duplicateCount = skeletonCount.get(skeleton) ?? 1
    const result = evaluateRow(item, duplicateCount)
    return { ...item, ...result }
  })
}

async function main() {
  const dbRows = await loadDbRows()
  const csvRows = await loadCsvRows()

  const scoredDbRows = scoreRows(dbRows)
  const scoredCsvRows = scoreRows(csvRows)
  const scoredRows = [...scoredDbRows, ...scoredCsvRows]
  const summary = summarize(scoredRows)

  const dbSummary = summarize(scoredDbRows)
  const queuedDbSummary = summarize(scoredDbRows.filter((row) => row.queued))
  const csvSummary = summarize(scoredCsvRows)

  console.log(`Threshold: ${PASS_THRESHOLD}`)
  console.log('')
  console.log(`ALL SOURCES: total ${summary.total}, passed ${summary.passed}, failed ${summary.failed}, avg ${summary.averageScore}, pass ${summary.passRate}%`)
  console.log(`DB (all outreach_logs): total ${dbSummary.total}, passed ${dbSummary.passed}, failed ${dbSummary.failed}, avg ${dbSummary.averageScore}, pass ${dbSummary.passRate}%`)
  console.log(`DB (queued unsent): total ${queuedDbSummary.total}, passed ${queuedDbSummary.passed}, failed ${queuedDbSummary.failed}, avg ${queuedDbSummary.averageScore}, pass ${queuedDbSummary.passRate}%`)
  console.log(`CSV (docs/outreach): total ${csvSummary.total}, passed ${csvSummary.passed}, failed ${csvSummary.failed}, avg ${csvSummary.averageScore}, pass ${csvSummary.passRate}%`)
  console.log('')

  console.log('By channel (all sources):')
  for (const channel of summary.byChannel) {
    console.log(`- ${channel.channel}: total ${channel.total}, passed ${channel.passed}, failed ${channel.failed}, avg ${channel.averageScore}, pass ${channel.passRate}%`)
  }

  if (summary.worst.length) {
    console.log('')
    console.log('Worst failing rows (top 20):')
    for (const row of summary.worst.slice(0, 20)) {
      const locator = row.source === 'csv' ? row.id : `db:${row.id}`
      console.log(`- ${locator} [${row.channel}] score ${row.score} :: ${row.reasons.slice(0, 2).join(' | ')}`)
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    threshold: PASS_THRESHOLD,
    summary,
    dbSummary,
    queuedDbSummary,
    csvSummary,
    worstFailures: summary.worst,
  }

  if (WRITE_JSON) {
    await writeFile(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    console.log('')
    console.log(`Wrote JSON report: ${JSON_PATH}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
