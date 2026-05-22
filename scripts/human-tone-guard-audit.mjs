import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

loadEnv({ path: '.env' })
loadEnv({ path: '.env.local', override: true })

const PASS_THRESHOLD = Number(process.env.OUTREACH_TONE_GUARD_PASS_THRESHOLD ?? 85)

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
  const body = row.message_body ?? ''
  const recipientName = (row.recipient_name ?? '').trim()
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

function isQueuedUnsentStatus(status) {
  const normalized = (status ?? '').toLowerCase().trim()
  if (!normalized) return true
  return ['pending', 'queued', 'draft', 'scheduled'].includes(normalized)
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const pageSize = 1000
  let from = 0
  const allRows = []

  while (true) {
    const { data, error } = await supabase
      .from('outreach_logs')
      .select('id, recipient_name, recipient_email, sender_email, subject, message_body, delivery_status, outreach_channel, sent_at')
      .is('sent_at', null)
      .order('id', { ascending: false })
      .range(from, from + pageSize - 1)

    if (error) {
      console.error(`Failed to fetch outreach logs: ${error.message}`)
      process.exit(1)
    }

    const rows = data ?? []
    allRows.push(...rows)
    if (rows.length < pageSize) break
    from += pageSize
  }

  const queuedRows = allRows.filter((row) => isQueuedUnsentStatus(row.delivery_status))

  if (!queuedRows.length) {
    console.log('No queued outreach rows found.')
    return
  }

  const skeletonCount = new Map()
  for (const row of queuedRows) {
    const skeleton = normalizeSkeleton(row.subject ?? '', row.message_body ?? '')
    skeletonCount.set(skeleton, (skeletonCount.get(skeleton) ?? 0) + 1)
  }

  const scored = queuedRows.map((row) => {
    const skeleton = normalizeSkeleton(row.subject ?? '', row.message_body ?? '')
    const duplicateCount = skeletonCount.get(skeleton) ?? 1
    const result = evaluateRow(row, duplicateCount)
    return {
      id: row.id,
      channel: row.outreach_channel ?? 'unknown',
      status: row.delivery_status ?? 'pending',
      recipient_email: row.recipient_email ?? '',
      subject: row.subject ?? '',
      ...result,
    }
  })

  const passed = scored.filter((row) => row.passed).length
  const failed = scored.length - passed
  const averageScore = Number((scored.reduce((sum, row) => sum + row.score, 0) / scored.length).toFixed(1))
  const passRate = Number(((passed / scored.length) * 100).toFixed(1))

  const byChannelMap = new Map()
  for (const row of scored) {
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
      return {
        channel,
        total: rows.length,
        passed: channelPassed,
        failed: channelFailed,
        averageScore: channelAvg,
        passRate: channelPassRate,
      }
    })
    .sort((a, b) => a.averageScore - b.averageScore)

  const topFails = [...scored]
    .filter((row) => !row.passed)
    .sort((a, b) => a.score - b.score)
    .slice(0, 15)

  console.log(`Threshold: ${PASS_THRESHOLD}`)
  console.log(`Queued rows scanned: ${queuedRows.length}`)
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)
  console.log(`Average score: ${averageScore}`)
  console.log(`Pass rate: ${passRate}%`)
  console.log('')
  console.log('By channel:')
  for (const channel of byChannel) {
    console.log(`- ${channel.channel}: total ${channel.total}, passed ${channel.passed}, failed ${channel.failed}, avg ${channel.averageScore}, pass ${channel.passRate}%`)
  }

  if (topFails.length) {
    console.log('')
    console.log('Top failed rows:')
    for (const row of topFails) {
      console.log(`- id ${row.id} [${row.channel}] score ${row.score} (${row.recipient_email}) :: ${row.reasons.slice(0, 2).join(' | ')}`)
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    threshold: PASS_THRESHOLD,
    summary: {
      queuedRows: queuedRows.length,
      scoredRows: scored.length,
      passed,
      failed,
      averageScore,
      passRate,
    },
    byChannel,
    topFails,
  }

  console.log('')
  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
