import { describe, expect, it } from 'vitest'
import { evaluateNarrativeHealth } from '@/lib/narrative-health'

describe('evaluateNarrativeHealth', () => {
  it('scores strong narrative profiles with quantification and versioning', () => {
    const result = evaluateNarrativeHealth({
      positioningSummary: 'Technology executive who scaled a global platform across three regions, reduced incident volume 42%, and is now targeting CIO mandates where transformation speed and governance rigor both matter.',
      linkedinHeadline: 'Transformation CIO | Platform Scale | Board-facing operator',
      linkedinAbout: 'I lead large-scale modernization programs, align technology strategy with operating outcomes, and have delivered measurable reliability and cost improvements in complex environments.',
      narrativeVersionCount: 3,
    })

    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.band).toBe('strong')
  })

  it('flags critical gaps for low-signal narrative profiles', () => {
    const result = evaluateNarrativeHealth({
      positioningSummary: 'Experienced leader looking for next opportunity.',
      linkedinHeadline: '',
      linkedinAbout: '',
      narrativeVersionCount: 0,
    })

    expect(result.score).toBeLessThan(55)
    expect(result.band).toBe('fragile')
    expect(result.gaps.length).toBeGreaterThan(2)
  })
})