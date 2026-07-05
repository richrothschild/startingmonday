const STOP_WORDS = new Set([
  'the', 'and', 'with', 'from', 'into', 'that', 'this', 'their', 'there', 'where',
  'needs', 'need', 'company', 'combined', 'signals', 'signal', 'combined', 'across',
  'through', 'phase', 'window', 'immediate', 'often', 'after', 'before', 'right',
  'build', 'buildout', 'high', 'most', 'direct', 'indicator', 'strong', 'category',
])

function tokenize(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !STOP_WORDS.has(token))
}

function keywordSet(pattern) {
  return new Set(tokenize(pattern.match))
}

function eventText(event) {
  return `${event.event_type ?? ''} ${event.summary ?? ''}`.toLowerCase()
}

function eventKeywordScore(event, keywords) {
  const text = eventText(event)
  let score = 0
  for (const word of keywords) {
    if (text.includes(word)) score += 1
  }
  return score
}

export function evaluatePatternTimeline(pattern, timeline, openedOn) {
  if (!pattern || !Array.isArray(timeline) || timeline.length === 0) {
    return { detected: false, leadTimeDays: null }
  }

  const keywords = keywordSet(pattern)
  if (!keywords.size) return { detected: false, leadTimeDays: null }

  const matched = timeline.filter((event) => eventKeywordScore(event, keywords) >= 2)
  if (matched.length < 2) return { detected: false, leadTimeDays: null }

  const firstDate = matched
    .map((event) => event.event_date)
    .filter(Boolean)
    .sort()[0]

  if (!firstDate || !openedOn) return { detected: true, leadTimeDays: null }

  const leadTime = Math.round(
    (new Date(`${openedOn}T00:00:00Z`).getTime() - new Date(`${firstDate}T00:00:00Z`).getTime()) / 86400000,
  )

  return {
    detected: true,
    leadTimeDays: Number.isFinite(leadTime) ? Math.max(0, leadTime) : null,
  }
}

export function summarizePatternMetrics(rows) {
  const support = rows.length
  const tp = rows.filter((row) => row.actualPositive && row.predictedPositive).length
  const fp = rows.filter((row) => !row.actualPositive && row.predictedPositive).length
  const fn = rows.filter((row) => row.actualPositive && !row.predictedPositive).length
  const tn = rows.filter((row) => !row.actualPositive && !row.predictedPositive).length

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0
  const fpRate = fp + tn > 0 ? fp / (fp + tn) : 0

  const leadTimes = rows
    .map((row) => row.leadTimeDays)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b)

  const medianLead = leadTimes.length
    ? leadTimes[Math.floor((leadTimes.length - 1) / 2)]
    : null

  return {
    support,
    tp,
    fp,
    fn,
    precision,
    recall,
    fpRate,
    medianLead,
  }
}
