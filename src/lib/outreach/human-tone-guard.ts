export type HumanToneGuardInput = {
  subject: string
  body: string
  recipientName?: string
}

export type HumanToneMetric = {
  key: string
  label: string
  max: number
  score: number
  note: string
}

export type HumanToneResult = {
  score: number
  passed: boolean
  threshold: number
  metrics: HumanToneMetric[]
  reasons: string[]
  skeleton: string
}

export const DEFAULT_HUMAN_TONE_PASS_THRESHOLD = 85

const GENERIC_OPENERS = [
  /i hope this finds you well/i,
  /^dear\s+/im,
]

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

const HARD_CTA_PATTERNS = [
  /book\s+(a\s+)?call\s+now/i,
  /send\s+it\s+or\s+pass/i,
  /must\s+reply/i,
]

function words(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function countMatches(input: string, pattern: RegExp): number {
  const matches = input.match(new RegExp(pattern.source, `${pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`}`))
  return matches?.length ?? 0
}

function normalizeSkeleton(subject: string, body: string): string {
  return `${subject} ${body}`
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' URL ')
    .replace(/[\w.-]+@[\w.-]+/g, ' EMAIL ')
    .replace(/\b\d+\b/g, ' N ')
    .replace(/\s+/g, ' ')
    .trim()
}

function avgSentenceLength(text: string): number {
  const sentenceParts = text
    .replace(/\r\n/g, '\n')
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (!sentenceParts.length) return 0

  const totalWords = sentenceParts.reduce((sum, sentence) => sum + words(sentence).length, 0)
  return totalWords / sentenceParts.length
}

function metricPersonalization(subject: string, body: string, recipientName?: string): HumanToneMetric {
  const firstName = (recipientName ?? '').trim().split(/\s+/)[0]?.toLowerCase() ?? ''
  let score = 0

  const hasGreeting = /^\s*hi\s+[a-z]/i.test(body)
  if (hasGreeting) score += 6

  if (firstName && new RegExp(`\\b${firstName}\\b`, 'i').test(`${subject}\n${body}`)) {
    score += 6
  }

  return {
    key: 'personalization_specificity',
    label: 'Personalization specificity',
    max: 12,
    score,
    note: score >= 10 ? 'Direct recipient reference present' : 'Limited recipient-specific detail',
  }
}

function metricGenericOpener(body: string): HumanToneMetric {
  const bad = GENERIC_OPENERS.some((pattern) => pattern.test(body))
  return {
    key: 'generic_opener_hygiene',
    label: 'Generic opener hygiene',
    max: 10,
    score: bad ? 0 : 10,
    note: bad ? 'Contains generic opener' : 'No generic opener found',
  }
}

function metricRecipientFocus(body: string): HumanToneMetric {
  const lowered = body.toLowerCase()
  const youCount = countMatches(lowered, /\byou\b|\byour\b/gi)
  const iCount = countMatches(lowered, /\bi\b|\bwe\b|\bour\b|\bmy\b/gi)

  let score = 4
  if (youCount > iCount) score = 10
  else if (youCount === iCount && youCount > 0) score = 8
  else if (youCount > 0) score = 6

  return {
    key: 'recipient_focus_ratio',
    label: 'Recipient focus ratio',
    max: 10,
    score,
    note: `you/your=${youCount}, I/we/our=${iCount}`,
  }
}

function metricPressureLanguage(subject: string, body: string): HumanToneMetric {
  const text = `${subject}\n${body}`
  const hits = PRESSURE_PATTERNS.filter((pattern) => pattern.test(text)).length
  const score = hits === 0 ? 12 : Math.max(0, 12 - hits * 6)

  return {
    key: 'pressure_language_rate',
    label: 'Pressure language rate',
    max: 12,
    score,
    note: hits === 0 ? 'No pressure phrasing found' : `${hits} pressure pattern(s) found`,
  }
}

function metricSubjectNaturalness(subject: string): HumanToneMetric {
  const subjectWords = words(subject)
  const wordCount = subjectWords.length
  const exclamations = (subject.match(/!/g) ?? []).length
  const allCapsTokenRatio = subjectWords.length
    ? subjectWords.filter((w) => /^[A-Z0-9]+$/.test(w) && w.length > 2).length / subjectWords.length
    : 0

  let score = 2
  if (wordCount >= 4 && wordCount <= 10) score += 6
  if (exclamations === 0) score += 1
  if (allCapsTokenRatio < 0.4) score += 1

  return {
    key: 'subject_naturalness',
    label: 'Subject naturalness',
    max: 10,
    score: Math.min(10, score),
    note: `words=${wordCount}, exclamations=${exclamations}`,
  }
}

function metricCtaFriction(body: string): HumanToneMetric {
  const lowPressureHits = LOW_PRESSURE_CTA_PATTERNS.filter((pattern) => pattern.test(body)).length
  const hardHits = HARD_CTA_PATTERNS.filter((pattern) => pattern.test(body)).length

  let score = 4
  if (lowPressureHits > 0) score += 4
  if (hardHits === 0) score += 2
  score = Math.max(0, score - hardHits * 3)

  return {
    key: 'cta_friction_score',
    label: 'CTA friction score',
    max: 10,
    score: Math.min(10, score),
    note: `low-pressure=${lowPressureHits}, hard-ask=${hardHits}`,
  }
}

function metricReadability(body: string): HumanToneMetric {
  const avgLen = avgSentenceLength(body)
  let score = 2
  if (avgLen >= 8 && avgLen <= 22) score = 8
  else if (avgLen >= 6 && avgLen <= 28) score = 5

  return {
    key: 'readability',
    label: 'Readability',
    max: 8,
    score,
    note: `avg sentence words=${avgLen.toFixed(1)}`,
  }
}

function metricMessageLength(body: string): HumanToneMetric {
  const count = words(body).length
  let score = 1
  if (count >= 70 && count <= 160) score = 8
  else if (count >= 45 && count <= 220) score = 5

  return {
    key: 'message_length',
    label: 'Message length',
    max: 8,
    score,
    note: `body words=${count}`,
  }
}

function metricProofSignals(body: string): HumanToneMetric {
  const lowered = body.toLowerCase()
  const hasNumber = /\b\d+\b/.test(lowered)
  const proofTerms = ['recent', 'example', 'outcome', 'improved', 'evidence', 'specific', 'programs']
  const proofHits = proofTerms.filter((term) => lowered.includes(term)).length

  let score = 3
  if (hasNumber) score += 3
  if (proofHits >= 1) score += 2
  if (proofHits >= 3) score += 2

  return {
    key: 'proof_to_claim_ratio',
    label: 'Proof-to-claim ratio',
    max: 10,
    score: Math.min(10, score),
    note: `numeric=${hasNumber ? 'yes' : 'no'}, proof_terms=${proofHits}`,
  }
}

function metricTemplateDrift(duplicateCount: number): HumanToneMetric {
  let score = 10
  if (duplicateCount > 3) score = 7
  if (duplicateCount > 8) score = 4
  if (duplicateCount > 15) score = 1

  return {
    key: 'template_drift',
    label: 'Template drift detection',
    max: 10,
    score,
    note: `skeleton duplicate count=${duplicateCount}`,
  }
}

export function humanToneSkeleton(input: HumanToneGuardInput): string {
  return normalizeSkeleton(input.subject, input.body)
}

export function evaluateHumanTone(
  input: HumanToneGuardInput,
  options?: { threshold?: number; duplicateCount?: number },
): HumanToneResult {
  const threshold = options?.threshold ?? DEFAULT_HUMAN_TONE_PASS_THRESHOLD
  const duplicateCount = options?.duplicateCount ?? 1

  const metrics: HumanToneMetric[] = [
    metricPersonalization(input.subject, input.body, input.recipientName),
    metricGenericOpener(input.body),
    metricRecipientFocus(input.body),
    metricPressureLanguage(input.subject, input.body),
    metricSubjectNaturalness(input.subject),
    metricCtaFriction(input.body),
    metricReadability(input.body),
    metricMessageLength(input.body),
    metricProofSignals(input.body),
    metricTemplateDrift(duplicateCount),
  ]

  const score = metrics.reduce((sum, m) => sum + m.score, 0)
  const reasons = metrics.filter((m) => m.score < Math.ceil(m.max * 0.6)).map((m) => `${m.label}: ${m.note}`)
  const skeleton = normalizeSkeleton(input.subject, input.body)

  return {
    score,
    passed: score >= threshold,
    threshold,
    metrics,
    reasons,
    skeleton,
  }
}
