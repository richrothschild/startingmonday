import { describe, expect, it } from 'vitest'
import { classifyGraphStalls, compositeScore, STALL_THRESHOLDS } from '@/lib/action-scores'

describe('src/lib/action-scores.ts', () => {
  it('keeps composite scores positive for high-value actions', () => {
    expect(compositeScore({ label: 'Prep', group: 'intelligence', emotion: 9, cognitive_load: 2, retention: 10 })).toBe(17)
  })

  it('classifies stalled graph lanes from inactivity plus overdue actions', () => {
    const stalls = classifyGraphStalls({
      activePipelineCount: 4,
      overdueActions: STALL_THRESHOLDS.overdueActionsStalled,
      lastSignalDays: STALL_THRESHOLDS.signalsStalledDays,
      lastBriefDays: STALL_THRESHOLDS.briefStalledDays,
      signalsSinceBaseline: 0,
      pipelineChangesSinceBaseline: 0,
      briefReviewsSinceBaseline: 0,
    })

    expect(stalls).toEqual([
      { lane: 'signals', state: 'stalled', reason: 'No fresh signals for 14 days.' },
      { lane: 'preparation', state: 'stalled', reason: 'No brief review progress for 14 days.' },
      { lane: 'pipeline', state: 'stalled', reason: '3 overdue actions with no pipeline movement since the last session.' },
    ])
  })

  it('returns a watch state before full stall thresholds are hit', () => {
    const stalls = classifyGraphStalls({
      activePipelineCount: 2,
      overdueActions: 1,
      lastSignalDays: STALL_THRESHOLDS.signalsWatchDays,
      lastBriefDays: STALL_THRESHOLDS.briefWatchDays,
      signalsSinceBaseline: 0,
      pipelineChangesSinceBaseline: 0,
      briefReviewsSinceBaseline: 0,
    })

    expect(stalls.map((stall) => stall.state)).toEqual(['watch', 'watch', 'watch'])
  })
})
