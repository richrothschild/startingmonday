// Pure, testable core for cross-source event deduplication.
// Rule-based similarity (K1 path): same event type + event date within a
// window + token-set similarity of normalized summaries above threshold.
// No embeddings provider exists in the stack yet; the scoring function is
// pluggable so an embedding similarity can replace tokenSetSimilarity later.

export const DEDUP_DATE_WINDOW_DAYS = 3
export const DEDUP_SIMILARITY_THRESHOLD = 0.45

const STOPWORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'has', 'have', 'in',
  'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'their', 'to', 'was',
  'were', 'will', 'with', 'after', 'announces', 'announced', 'company',
])

// Light suffix stemming so paraphrases align (departing/depart, cuts/cut,
// customers/customer). Deliberately crude — consistency matters, not accuracy.
function stemToken(token) {
  if (token.length <= 3) return token
  return token
    .replace(/ing$/, '')
    .replace(/ed$/, '')
    .replace(/es$/, '')
    .replace(/s$/, '')
}

// Extracts monetary/percentage anchor tokens ($50m, 15%, 2m). Two summaries
// with disjoint non-empty anchor sets describe different events (a $50M
// Series B is never the same event as a $120M Series C).
export function extractAmountTokens(normalized) {
  const matches = normalized.match(/\$?\d+(?:\.\d+)?(?:%|m|b|k|mm|bn)?/g) ?? []
  return new Set(matches.filter(token => /\d/.test(token)))
}

// Normalizes an event summary for similarity comparison.
export function normalizeSummary(summary) {
  if (!summary || typeof summary !== 'string') return ''
  return summary
    .toLowerCase()
    .replace(/[^a-z0-9\s$%.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenSet(normalized) {
  return new Set(
    normalized
      .split(' ')
      .filter(token => token.length > 1 && !STOPWORDS.has(token))
      .map(stemToken)
  )
}

// Dice coefficient over token sets: 2|A ∩ B| / (|A| + |B|). Range 0..1.
export function tokenSetSimilarity(normalizedA, normalizedB) {
  const setA = tokenSet(normalizedA)
  const setB = tokenSet(normalizedB)
  if (setA.size === 0 || setB.size === 0) return 0
  let intersection = 0
  for (const token of setA) {
    if (setB.has(token)) intersection++
  }
  return (2 * intersection) / (setA.size + setB.size)
}

export function daysBetween(dateA, dateB) {
  const a = new Date(`${dateA}T00:00:00Z`).getTime()
  const b = new Date(`${dateB}T00:00:00Z`).getTime()
  if (Number.isNaN(a) || Number.isNaN(b)) return Infinity
  return Math.abs(a - b) / 86400000
}

// Decides whether a new event should merge into an existing candidate.
// Both must share event_type (enforced by the candidate query); this checks
// date proximity and summary similarity.
export function isSameEvent(candidate, incoming, {
  dateWindowDays = DEDUP_DATE_WINDOW_DAYS,
  similarityThreshold = DEDUP_SIMILARITY_THRESHOLD,
} = {}) {
  if (!candidate || !incoming) return false
  if (daysBetween(candidate.event_date, incoming.event_date) > dateWindowDays) return false

  const normalizedA = candidate.summary_normalized ?? normalizeSummary(candidate.summary)
  const normalizedB = incoming.summary_normalized ?? normalizeSummary(incoming.summary)

  // Amount-conflict guard: disjoint monetary/percent anchors mean different events.
  const amountsA = extractAmountTokens(normalizedA)
  const amountsB = extractAmountTokens(normalizedB)
  if (amountsA.size > 0 && amountsB.size > 0) {
    const hasSharedAmount = [...amountsA].some(token => amountsB.has(token))
    if (!hasSharedAmount) return false
  }

  return tokenSetSimilarity(normalizedA, normalizedB) >= similarityThreshold
}

// Picks the best merge candidate from a list (highest similarity above
// threshold), or null when none qualify.
export function findMergeCandidate(candidates, incoming, options = {}) {
  let best = null
  let bestSimilarity = 0
  for (const candidate of candidates ?? []) {
    if (!isSameEvent(candidate, incoming, options)) continue
    const similarity = tokenSetSimilarity(
      candidate.summary_normalized ?? normalizeSummary(candidate.summary),
      incoming.summary_normalized ?? normalizeSummary(incoming.summary),
    )
    if (similarity > bestSimilarity) {
      best = candidate
      bestSimilarity = similarity
    }
  }
  return best
}
