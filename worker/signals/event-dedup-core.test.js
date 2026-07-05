import { describe, it, expect } from 'vitest'
import {
  normalizeSummary,
  tokenSetSimilarity,
  daysBetween,
  isSameEvent,
  findMergeCandidate,
  DEDUP_SIMILARITY_THRESHOLD,
} from './event-dedup-core.js'

// Golden set (T1.3): pairs of signal summaries labeled should-merge or
// should-not-merge. AC: >= 80% merge precision — no should-not-merge pair may
// merge, and at least 80% of should-merge pairs must merge.

const SHOULD_MERGE = [
  // Same funding round, five different outlets' phrasings.
  ['Acme raised a $50M Series B round led by Sequoia.', 'Acme Inc announced $50M Series B funding led by Sequoia Capital.'],
  ['Acme secures $50M in Series B financing from Sequoia.', 'Acme raised a $50M Series B round led by Sequoia.'],
  // Same exec departure, press vs. filing phrasing.
  ['CFO Jane Smith is departing Acme at the end of the quarter.', 'Acme CFO Jane Smith to depart at quarter end.'],
  // Same acquisition, headline variants.
  ['Acme acquires DataCo for $200M to expand analytics.', 'Acme announced the $200M acquisition of DataCo, expanding its analytics platform.'],
  // Same layoffs event.
  ['Acme cuts 15% of workforce in restructuring.', 'Acme lays off 15% of staff amid restructuring plan.'],
  // Same breach disclosure.
  ['Acme disclosed a data breach affecting 2M customers.', 'Acme reports data breach impacting 2M customer records.'],
  // Same board change.
  ['Former Google exec Maria Lopez joins Acme board of directors.', 'Acme appoints former Google executive Maria Lopez to its board.'],
  // Same product launch.
  ['Acme launches AI-powered forecasting product for enterprise.', 'Acme unveils enterprise AI forecasting product.'],
]

const SHOULD_NOT_MERGE = [
  // Different funding rounds (different amounts/stages).
  ['Acme raised a $50M Series B round led by Sequoia.', 'Acme raised a $120M Series C round led by Tiger Global.'],
  // Different execs departing.
  ['CFO Jane Smith is departing Acme at the end of the quarter.', 'CTO Robert Chen is leaving Acme to join a startup.'],
  // Different acquisitions.
  ['Acme acquires DataCo for $200M to expand analytics.', 'Acme acquires SecureNet for $80M to expand security offerings.'],
  // Departure vs. hire of different people in same function.
  ['Acme CISO departs after three years.', 'Acme hires new CISO from JPMorgan.'],
  // Product launch vs. unrelated award.
  ['Acme launches AI-powered forecasting product for enterprise.', 'Acme wins industry award for customer service excellence.'],
  // Two different board members.
  ['Former Google exec Maria Lopez joins Acme board of directors.', 'Retired banking executive Tom Wu joins Acme board.'],
]

function makeEvent(summary, date = '2026-07-01') {
  return { event_date: date, summary, summary_normalized: normalizeSummary(summary) }
}

describe('event dedup golden set', () => {
  it('merges at least 80% of should-merge pairs (recall on duplicates)', () => {
    let mergedCount = 0
    for (const [a, b] of SHOULD_MERGE) {
      if (isSameEvent(makeEvent(a), makeEvent(b))) mergedCount++
    }
    const rate = mergedCount / SHOULD_MERGE.length
    expect(rate, `merged ${mergedCount}/${SHOULD_MERGE.length}`).toBeGreaterThanOrEqual(0.8)
  })

  it('never merges should-not-merge pairs (precision guard)', () => {
    const falseMerges = []
    for (const [a, b] of SHOULD_NOT_MERGE) {
      if (isSameEvent(makeEvent(a), makeEvent(b))) falseMerges.push(`${a} <-> ${b}`)
    }
    expect(falseMerges, `false merges: ${falseMerges.join('; ')}`).toEqual([])
  })

  it('respects the date window: same story a month apart is a new event', () => {
    const [a, b] = SHOULD_MERGE[0]
    expect(isSameEvent(makeEvent(a, '2026-07-01'), makeEvent(b, '2026-08-05'))).toBe(false)
    expect(isSameEvent(makeEvent(a, '2026-07-01'), makeEvent(b, '2026-07-03'))).toBe(true)
  })
})

describe('tokenSetSimilarity', () => {
  it('is 1 for identical summaries and 0 for disjoint ones', () => {
    const norm = normalizeSummary('Acme raised $50M Series B')
    expect(tokenSetSimilarity(norm, norm)).toBe(1)
    expect(tokenSetSimilarity(normalizeSummary('alpha beta gamma'), normalizeSummary('delta epsilon zeta'))).toBe(0)
  })

  it('handles empty inputs', () => {
    expect(tokenSetSimilarity('', 'anything here')).toBe(0)
  })
})

describe('daysBetween', () => {
  it('computes absolute day distances', () => {
    expect(daysBetween('2026-07-01', '2026-07-04')).toBe(3)
    expect(daysBetween('2026-07-04', '2026-07-01')).toBe(3)
  })

  it('returns Infinity for invalid dates', () => {
    expect(daysBetween('not-a-date', '2026-07-01')).toBe(Infinity)
  })
})

describe('findMergeCandidate', () => {
  it('picks the most similar qualifying candidate', () => {
    const incoming = makeEvent('Acme raised a $50M Series B round led by Sequoia.')
    const close = { id: 'close', ...makeEvent('Acme Inc announced $50M Series B funding led by Sequoia Capital.') }
    const far = { id: 'far', ...makeEvent('Acme opens new office in Austin.') }
    expect(findMergeCandidate([far, close], incoming)?.id).toBe('close')
  })

  it('returns null when nothing qualifies', () => {
    const incoming = makeEvent('Acme raised a $50M Series B round led by Sequoia.')
    const unrelated = { id: 'x', ...makeEvent('Acme wins customer service award.') }
    expect(findMergeCandidate([unrelated], incoming)).toBeNull()
  })

  it('exports a sane threshold', () => {
    expect(DEDUP_SIMILARITY_THRESHOLD).toBeGreaterThan(0.3)
    expect(DEDUP_SIMILARITY_THRESHOLD).toBeLessThan(0.9)
  })
})
