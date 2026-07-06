import { describe, it, expect } from 'vitest'
import { evaluatePatternTimeline, summarizePatternMetrics } from './pattern-replay-core.js'

describe('pattern-replay-core', () => {
  it('detects a pattern when at least two timeline events align with keywords', () => {
    const pattern = { name: 'M&A Integration', match: 'Acquisition combined with leadership change and integration mandate.' }
    const timeline = [
      { event_type: 'acquisition', event_date: '2026-01-10', summary: 'Company announces acquisition with an immediate integration mandate.' },
      { event_type: 'exec_departure', event_date: '2026-01-22', summary: 'COO departure creates leadership gap for integration.' },
    ]

    const result = evaluatePatternTimeline(pattern, timeline, '2026-02-10')
    expect(result.detected).toBe(true)
    expect(result.leadTimeDays).toBeGreaterThan(0)
  })

  it('summarizes precision/recall metrics', () => {
    const summary = summarizePatternMetrics([
      { actualPositive: true, predictedPositive: true, leadTimeDays: 20 },
      { actualPositive: true, predictedPositive: false, leadTimeDays: null },
      { actualPositive: false, predictedPositive: true, leadTimeDays: null },
      { actualPositive: false, predictedPositive: false, leadTimeDays: null },
    ])

    expect(summary.support).toBe(4)
    expect(summary.tp).toBe(1)
    expect(summary.fp).toBe(1)
    expect(summary.fn).toBe(1)
    expect(summary.precision).toBeCloseTo(0.5, 5)
    expect(summary.recall).toBeCloseTo(0.5, 5)
    expect(summary.fpRate).toBeCloseTo(0.5, 5)
    expect(summary.medianLead).toBe(20)
  })
})
